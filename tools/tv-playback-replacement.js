// Metadata establishes duration/resume state, NOT whether video has decoded.
// Picture checks wait for five seconds of visible, advancing playback.
const PICTURE_GRACE_SECONDS=5, PICTURE_POLL_MS=500;
function stopPictureCheck(s){
    clearTimeout(s.pictureTimer);s.pictureTimer=null;
    if(s.frameRequest!=null && typeof s.media.cancelVideoFrameCallback==='function'){
        try{s.media.cancelVideoFrameCallback(s.frameRequest);}catch{/* Source may already be unloaded. */}
    }
    s.frameRequest=null;
}
function confirmPicture(s){
    if(!active(s)||s.rejecting||s.pictureSeen)return;
    s.pictureSeen=true;stopPictureCheck(s);
    s.retries=0;failedSelections.clear();
    if(s.isPlaying)setStatus('',true);
}
function watchPictureFrame(s){
    if(!active(s)||s.audioMode||s.pictureSeen||s.rejecting||s.frameRequest!=null)return;
    if(typeof s.media.requestVideoFrameCallback!=='function')return;
    try{
        s.frameApi=true;
        s.frameRequest=s.media.requestVideoFrameCallback((_now,frame)=>{
            s.frameRequest=null;
            if(!active(s)||s.rejecting)return;
            if(frame.width>0&&frame.height>0)confirmPicture(s);
            else watchPictureFrame(s);
        });
    }catch{s.frameApi=false;}
}
function skipNoPicture(s){
    if(!active(s)||s.rejecting)return;
    // A playing event must not cancel this decision or its separate skip timer.
    s.rejecting=true;s.ready=false;stopPictureCheck(s);
    clearTimeout(s.watchdog);clearTimeout(s.retryTimer);s.retryTimer=null;
    s.media.pause();stopAudioScope();
    failedSelections.add(selectionKey(s.ci,s.vi));
    const total=categories.reduce((n,c)=>n+c.content.length,0);
    if(failedSelections.size>=total){
        setStatus('No playable picture found. Choose a program or press Retry.');
        document.getElementById('retry-play').hidden=false;return;
    }
    setStatus('No video picture — skipping this TV entry.');
    s.skipTimer=setTimeout(()=>{
        if(active(s)){
            const [ci,vi]=nextSelection();choose(ci,vi,{time:0,automatic:true});
        }
    },700);
}
function checkPicture(s){
    if(!active(s)||s.audioMode||s.rejecting||s.pictureSeen)return;
    clearTimeout(s.pictureTimer);s.pictureTimer=null;
    const media=s.media,dimensions=media.videoWidth>0&&media.videoHeight>0;
    let frameCountsAvailable=false;
    if(dimensions&&typeof media.getVideoPlaybackQuality==='function'){
        try{
            const q=media.getVideoPlaybackQuality();
            frameCountsAvailable=Number.isFinite(q.totalVideoFrames)&&Number.isFinite(q.droppedVideoFrames);
            if(frameCountsAvailable&&q.totalVideoFrames>q.droppedVideoFrames){confirmPicture(s);return;}
        }catch{/* Fall back only when a frame counter is unavailable. */}
    }
    if(dimensions&&!s.frameApi&&!frameCountsAvailable&&media.readyState>=2){confirmPicture(s);return;}
    const now=performance.now(),position=validTime(media.currentTime);
    const advancing=s.isPlaying&&!media.paused&&!media.ended&&!media.seeking&&!document.hidden&&media.readyState>=2;
    if(advancing&&s.pictureClock!==null&&s.pictureTime!==null){
        // Clamp timer gaps and ignore seek jumps; loading/paused/hidden time is not playback.
        const elapsed=Math.max(0,Math.min(1000,now-s.pictureClock))/1000;
        const delta=position-s.pictureTime,rate=Number.isFinite(media.playbackRate)&&media.playbackRate>0?media.playbackRate:1;
        if(delta>0&&delta<=Math.max(2,elapsed*rate*3))s.pictureElapsed+=Math.min(elapsed,delta/rate);
    }
    s.pictureClock=advancing?now:null;s.pictureTime=advancing?position:null;
    if(s.pictureElapsed>=PICTURE_GRACE_SECONDS){skipNoPicture(s);return;}
    if(s.isPlaying)s.pictureTimer=setTimeout(()=>checkPicture(s),PICTURE_POLL_MS);
}
function loadAndPlay(time=0,retries=0){
    const item=currentItem(),audioMode=categories[currentCategoryIndex].kind==='audio';
    const media=audioMode?audioPlayer:player;
    player.style.display=audioMode?'none':'block';audioPlayer.style.display=audioMode?'block':'none';
    if(audioMode)startAudioScope(item);else stopAudioScope();
    const s={generation,ci:currentCategoryIndex,vi:currentVideoIndex,media,audioMode,
        controller:new AbortController(),retryTimer:null,watchdog:null,skipTimer:null,
        pictureTimer:null,frameRequest:null,frameApi:false,pictureSeen:false,pictureElapsed:0,
        pictureClock:null,pictureTime:null,isPlaying:false,rejecting:false,retries,ready:false,resume:time};
    session=s;
    const listen=(event,fn)=>media.addEventListener(event,()=>{if(active(s)&&!s.rejecting)fn();},{signal:s.controller.signal});
    listen('loadedmetadata',()=>{
        // Always restore bookkeeping here, even while dimensions are zero or unavailable.
        s.ready=true;
        if(s.resume>0){
            const end=media.duration,target=Number.isFinite(end)&&s.resume>=end-2?0:s.resume;
            try{media.currentTime=target;}catch{setStatus('Saved position unavailable; starting here.');}
        }
        s.resume=0;
    });
    listen('loadeddata',()=>{watchPictureFrame(s);checkPicture(s);});
    listen('playing',()=>{
        s.isPlaying=true;
        clearTimeout(s.watchdog);clearTimeout(s.retryTimer);s.retryTimer=null;
        if(audioMode||s.pictureSeen){s.retries=0;failedSelections.clear();}
        document.getElementById('resume-play').hidden=true;document.getElementById('retry-play').hidden=true;
        setStatus(audioMode||s.pictureSeen?'':'Checking video picture…',true);
        watchPictureFrame(s);checkPicture(s);savePosition();
    });
    const suspendPicture=()=>{s.isPlaying=false;s.pictureClock=null;s.pictureTime=null;clearTimeout(s.pictureTimer);s.pictureTimer=null;};
    listen('waiting',()=>{suspendPicture();if(!media.paused){setStatus('Buffering…');armWatchdog(s);}});
    listen('stalled',()=>{suspendPicture();if(!media.paused){setStatus('Waiting for the media source…');armWatchdog(s);}});
    listen('pause',()=>{suspendPicture();clearTimeout(s.watchdog);savePosition();});
    listen('seeking',()=>{s.pictureClock=null;s.pictureTime=null;});
    listen('play',()=>armWatchdog(s));
    listen('timeupdate',()=>{checkPicture(s);if(Date.now()-lastSave>5000){lastSave=Date.now();savePosition();}});
    listen('volumechange',()=>{preferences.volume=media.volume;preferences.muted=media.muted;volumeKnob.value=String(media.volume);persist();});
    listen('ended',()=>{stopPictureCheck(s);savePosition();const [ci,vi]=nextSelection();choose(ci,vi,{time:0,automatic:true});});
    listen('error',()=>{suspendPicture();handleArchiveError(s);});
    document.addEventListener('visibilitychange',()=>{if(active(s)){s.pictureClock=null;s.pictureTime=null;}},{signal:s.controller.signal});
    media.volume=Number(volumeKnob.value);media.muted=preferences.muted===true;
    media.src=item.u;media.load();watchPictureFrame(s);attemptPlay(s);
}
