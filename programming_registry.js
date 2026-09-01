// ============================================================
// CLINE CLASSIC TV - PROGRAMMING REGISTRY
// V170 BOOMER / 13+ CLEANUP
// ============================================================
// Nine coherent channels. Child/cartoon programming and radio drama
// are not scheduled. Existing verified Mega data is used only when
// it passes the adult/live-action/history/science filters below.
// ============================================================

(() => {
    const originalCore = categories.flatMap(channel => channel.content || []);

    function uniqueByUrl(items) {
        const seen = new Set();
        const output = [];
        for (const item of items || []) {
            if (!item || typeof item.u !== "string" || !item.u) continue;
            if (seen.has(item.u)) continue;
            seen.add(item.u);
            output.push(item);
        }
        return output;
    }

    function naturalCompare(a, b) {
        return String(a.n || "").localeCompare(
            String(b.n || ""),
            undefined,
            { numeric: true, sensitivity: "base" }
        );
    }

    function sorted(items) {
        return uniqueByUrl(items).sort(naturalCompare);
    }

    function isAudioItem(item) {
        return /\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)(?:[?#].*)?$/i.test(
            String(item && item.u || "")
        );
    }

    // --------------------------------------------------------
    // CHILD / CARTOON FILTER
    // --------------------------------------------------------

    const CHILD_PATTERNS = [
        /^BNTSG\b/i,
        /Pokemon/i,
        /Yu-Gi-Oh/i,
        /Schoolhouse Rock/i,
        /Rudolph the Red-Nosed Reindeer/i,
        /Star Wars Episode 2\.1 The Clone Wars/i,
        /Halo The Fall Of Reach/i,
        /Astro Boy|Astro Kid|Lightyear|WALL-E|Jimmy Neutron/i,
        /Mars Needs Moms|Zathura|Buzz Lightyear|Monsters Vs\. Aliens/i,
        /Into The Spiderverse|The Incredibles|Big Hero 6|Next Gen|Spy Kids/i,
        /Dino Time|The Good Dinosaur|Were Back A Dinosaurs Story|Ice Age/i,
        /^Dinosaur$/i,
        /Peter Pan|Dalmatians|^Aladdin|Brother Bear|The Lion King|^Mulan/i,
        /The Little Mermaid|The Jungle Book|Brave Little Toaster|^Tarzan/i,
        /James And The Giant Peach|Lady and The Trump|Toy Story/i,
        /Finding Nemo|Finding Dory|^Cars(?:\s|\()|^Shrek|Despicable Me/i,
        /Madagascar|^Up$|^Coco$|Ratatouille|Monsters Inc|Monsters University/i,
        /SpongeBob|Scooby-Doo|Kung Fu Panda|Lilo & Stitch|Rugrats/i,
        /Ed, Edd n Eddy|Kids Next Door|Powerpuff|Phineas And Ferb/i,
        /Recess School|Wild Thornberrys|Billy & Mandys|Little Einsteins/i,
        /Are We There Yet|Alvin And The Chipmunks|Honey, I Shrunk|Honey, We Shrunk/i,
        /Who Framed Roger Rabbit|Nightmare Before Christmas|^Coraline$|^Monster House$/i,
        /Scary Godmother|Underfist|Grandma Got Run Over|Land Before Time/i,
        /How To Train Your Dragon|Wreck-It Ralph|A Bug's Life|Bee Movie/i,
        /Over the Hedge|Flushed Away|Shark Tale|Atlantis \(2001\)|Atlantis 2/i,
        /The Iron Giant|Treasure Planet|Emperor's New Groove|The Wild Robot/i,
        /^The Wild$|Sharkboy And Lavagirl|Elmo in Grouchland|The Ant Bully/i,
        /Banana Splits|Boss Baby|The Cat In The Hat|^The Croods|Pagemaster/i,
        /Polar Express|Princess and the Frog|^Underdog$|ICarly Movie/i,
        /Sid the Science Kid|Blue'?s Big|Barney's Great Adventure|Doug's 1st Movie/i,
        /Chicken Little|Chicken Run|^Moana|Osmosis Jones|Surf'sUp|Ben 10/i,
        /^9$|Stuart Little|The Grinch|Red vs Blue/i,
        /^E\.T The Extra Terrestrial$|^Jumanji$/i,
        /^Elio$|Meet The Robinsons|LEGO Ninjago|The Road To El Dorado/i,
        /Reading Rainbow|Rocky.*Bullwinkle|X-Men.*Animated/i,
        /Popeye|Casper|Betty Boop|Noveltoon/i
    ];

    function isChildTitle(name) {
        return CHILD_PATTERNS.some(pattern => pattern.test(String(name || "")));
    }

    function isChildItem(item) {
        const name = String(item && item.n || "");
        const url = String(item && item.u || "");

        if (/Spider-Man-67-Collection/i.test(url)) return true;
        if (/BNTSG_2/i.test(url)) return true;
        if (/schoolhouse-rock/i.test(url)) return true;
        return isChildTitle(name);
    }

    function isOldTrek(item) {
        return item && typeof item.u === "string" && item.u.startsWith(ST_BASE_URL);
    }

    // --------------------------------------------------------
    // CORE A-J CLEANUP
    // --------------------------------------------------------

    const cleanedCore = uniqueByUrl(
        originalCore.filter(item => !isOldTrek(item) && !isChildItem(item))
    );

    const coreScience = [];
    const coreSciFiTV = [];
    const coreHorror = [];
    const coreMovies = [];

    for (const item of cleanedCore) {
        const name = String(item.n || "");

        if (/^Project UFO\b/i.test(name)) {
            coreSciFiTV.push(item);
            continue;
        }

        if (
            /^Earth Was Made:/i.test(name) ||
            /^In Search of\.\.\./i.test(name) ||
            /Roswell UFO Crash BBC Doc|Edge of Creation/i.test(name)
        ) {
            coreScience.push(item);
            continue;
        }

        if (/Little Shop Of Horrors|Eight Legged Freaks|Big Ass Spider|World War Z/i.test(name)) {
            coreHorror.push(item);
            continue;
        }

        coreMovies.push(item);
    }

    function movieRank(item) {
        const n = String(item.n || "");
        if (/Good, the Bad and the Ugly|Wizard of Oz|Love Bug|Herbie/i.test(n)) return 10;
        if (/^Star Wars Episode|Halo 4|^Tron/i.test(n)) return 20;
        if (/^Spider-man|^Iron Man|^Venom/i.test(n)) return 30;
        if (/Jurassic|Godzilla/i.test(n)) return 40;
        if (/Twister|Titanic|Day After|Into The Storm/i.test(n)) return 50;
        if (/Rush Hour/i.test(n)) return 60;
        if (/National Lampoon/i.test(n)) return 70;
        if (/Ready Player One/i.test(n)) return 80;
        return 90;
    }

    coreMovies.sort((a, b) => (movieRank(a) - movieRank(b)) || naturalCompare(a, b));

    // --------------------------------------------------------
    // VERIFIED MEGA POOL: ADULT SELECTIONS ONLY
    // --------------------------------------------------------

    function cleanClassicTV(items) {
        const ADULT_CLASSIC = /Amazing Stories|Captain Nice|Dragnet|Lone Ranger|Last of the Summer Wine|Cavalcade of Stars|Date with the Angels|Three Stooges|Perry Mason|Columbo|Mannix|Mission.?Impossible|The Fugitive|Rockford|Streets of San Francisco|Hawaii Five.?O|Wild Wild West|Combat!|Rat Patrol|12 O.?Clock High|Get Smart|I Spy|The Saint|The Avengers|Man from U\.?N\.?C\.?L\.?E|The Invaders|Time Tunnel|Land of the Giants/i;
        const CLUTTER = /Deleted Scene|\bPromo(?:s)?\b|Featurette|TelevisionAcademy\.com Interviews|Pop Goes the Culture|Forgotten Superheroes|Captain Nice Vs Mr\. Terrific|Captain Nice on 13 Week Theatre|キャプテンナイス|Amazing Stories 216 - Family Dog/i;

        return sorted((items || []).filter(item =>
            !isChildItem(item) &&
            !CLUTTER.test(String(item.n || "")) &&
            ADULT_CLASSIC.test(String(item.n || ""))
        ));
    }

    function cleanMystery(items) {
        return sorted((items || []).filter(item =>
            !isChildItem(item) &&
            /Miss Marple|Sherlock Holmes|Poirot|Inspector Morse|Midsomer|Mystery!/i.test(String(item.n || ""))
        ));
    }

    function cleanSciFiTV(items) {
        return sorted((items || []).filter(item =>
            !isChildItem(item) &&
            /Captain Scarlet|Space:? 1999|The Prisoner|\bUFO\b|Outer Limits|Twilight Zone|Night Gallery|Invaders/i.test(String(item.n || ""))
        ));
    }

    function cleanScience(items) {
        return sorted((items || []).filter(item =>
            !isAudioItem(item) &&
            !isChildItem(item) &&
            !/Schoolhouse|Reading Rainbow/i.test(String(item.n || ""))
        ));
    }

    function cleanDriveIn(items) {
        return sorted((items || []).filter(item =>
            !isAudioItem(item) &&
            !isChildItem(item) &&
            !/^VTS\s/i.test(String(item.n || ""))
        ));
    }

    function cleanHistory(items) {
        return uniqueByUrl((items || []).filter(item =>
            !isAudioItem(item) &&
            !/Churchill/i.test(String(item.n || "")) &&
            !isChildItem(item)
        )).sort((a, b) => {
            const rank = item => {
                const n = String(item.n || "");
                if (/1906|Trip Down Market|TripDown/i.test(n)) return 10;
                if (/1917|1918|1919|World War I|WWI/i.test(n)) return 20;
                if (/Atomic|Duck and Cover|Communis/i.test(n)) return 30;
                if (/1950|1960/i.test(n)) return 40;
                if (/1970|1971|pollution|PSA/i.test(n)) return 50;
                if (/1976|Swine Flu/i.test(n)) return 60;
                return 70;
            };
            return (rank(a) - rank(b)) || naturalCompare(a, b);
        });
    }

    const refinedClassic = cleanClassicTV(REFINED_CLASSIC_TV);
    const refinedMystery = cleanMystery(REFINED_CLASSIC_TV);
    const refinedSciFi = cleanSciFiTV(REFINED_CLASSIC_TV);
    const refinedScience = cleanScience(REFINED_SCIENCE_EDUCATION);
    const refinedDriveIn = cleanDriveIn(REFINED_SHOCK_DRIVE_IN);
    const refinedHistory = cleanHistory(REFINED_WWII_HISTORY);
    const refinedHolidayVideo = sorted((REFINED_HOLIDAY || []).filter(item =>
        !isAudioItem(item) && !isChildItem(item)
    ));

    const ALL_STAR_TREK = uniqueByUrl([
        ...STAR_TREK_TOS,
        ...HARVEST_STAR_TREK_CONTINUES,
        ...HARVEST_TNG,
        ...HARVEST_DS9,
        ...HARVEST_VOYAGER
    ]);

    const HITCHCOCK_MYSTERY = sorted([
        ...HARVEST_HITCHCOCK_S1,
        ...HARVEST_HITCHCOCK_S2,
        ...HARVEST_HITCHCOCK_S3,
        ...refinedMystery
    ]);

    const CLASSIC_TV = sorted([
        ...refinedClassic,
        ...refinedHolidayVideo
    ]);

    const SCIENCE_UFO = sorted([
        ...coreScience,
        ...refinedScience
    ]);

    const SCIFI_TV = sorted([
        ...coreSciFiTV,
        ...HARVEST_BUCK_ROGERS,
        ...HARVEST_MAN_FROM_ATLANTIS,
        ...refinedSciFi
    ]);

    const DRIVE_IN = sorted([
        ...coreHorror,
        ...refinedDriveIn
    ]);

    function buildMusicTalk() {
        const output = [];
        let musicIndex = 0;
        let talkIndex = 0;

        output.push(...BOOMER_MUSIC_VIDEO);

        // Four verified 1920s jazz tracks, then one Dick Cavett show.
        while (musicIndex < BOOMER_MUSIC.length || talkIndex < BOOMER_TALK.length) {
            for (let n = 0; n < 4 && musicIndex < BOOMER_MUSIC.length; n++) {
                output.push(BOOMER_MUSIC[musicIndex++]);
            }
            if (talkIndex < BOOMER_TALK.length) output.push(BOOMER_TALK[talkIndex++]);
        }

        return uniqueByUrl(output);
    }

    // --------------------------------------------------------
    // NINE COHERENT CHANNELS
    // --------------------------------------------------------

    categories.splice(
        0,
        categories.length,
        { name: "A", label: "MOVIES / ACTION", kind: "video", content: uniqueByUrl(coreMovies) },
        { name: "B", label: "STAR TREK", kind: "video", content: ALL_STAR_TREK },
        { name: "C", label: "CLASSIC TV", kind: "video", content: CLASSIC_TV },
        { name: "D", label: "HORROR / DRIVE-IN", kind: "video", content: DRIVE_IN },
        { name: "E", label: "SCIENCE / UFO", kind: "video", content: SCIENCE_UFO },
        { name: "F", label: "HITCHCOCK / MYSTERY", kind: "video", content: HITCHCOCK_MYSTERY },
        { name: "G", label: "60s-70s SCI-FI TV", kind: "video", content: SCIFI_TV },
        { name: "H", label: "MUSIC / TALK", kind: "mixed", content: buildMusicTalk() },
        { name: "I", label: "WAR / NEWS / HISTORY", kind: "video", content: refinedHistory }
    );

    // --------------------------------------------------------
    // VINTAGE AUTO COMMERCIAL BREAKS
    // --------------------------------------------------------
    // B is excluded so Star Trek remains uninterrupted. I is excluded
    // so serious news/history is not interrupted by ads.
    // --------------------------------------------------------

    function weaveEvenly(baseItems, inserts) {
        if (!Array.isArray(inserts) || !inserts.length) return [...baseItems];
        if (!Array.isArray(baseItems) || !baseItems.length) return [...inserts];

        const output = [];
        let insertIndex = 0;
        for (let i = 0; i < baseItems.length; i++) {
            output.push(baseItems[i]);
            const due = Math.floor(((i + 1) * inserts.length) / baseItems.length);
            while (insertIndex < due) output.push(inserts[insertIndex++]);
        }
        while (insertIndex < inserts.length) output.push(inserts[insertIndex++]);
        return output;
    }

    const commercialTargets = ["A", "C", "D", "E", "F", "G", "H"];
    const adBuckets = Object.fromEntries(commercialTargets.map(name => [name, []]));

    uniqueByUrl(REFINED_VINTAGE_AUTO_ADS).forEach((ad, index) => {
        adBuckets[commercialTargets[index % commercialTargets.length]].push(ad);
    });

    for (const channelName of commercialTargets) {
        const channel = categories.find(channel => channel.name === channelName);
        if (!channel || !adBuckets[channelName].length) continue;
        channel.content = weaveEvenly(channel.content, adBuckets[channelName]);
    }

    // Final cross-channel duplicate guard.
    const globalUrls = new Set();
    for (const channel of categories) {
        channel.content = channel.content.filter(item => {
            if (!item || typeof item.u !== "string") return false;
            if (globalUrls.has(item.u)) return false;
            globalUrls.add(item.u);
            return true;
        });
    }

    const totals = categories.reduce(
        (acc, channel) => {
            for (const item of channel.content) {
                acc.total++;
                isAudioItem(item) ? acc.audio++ : acc.video++;
            }
            return acc;
        },
        { total: 0, audio: 0, video: 0 }
    );

    console.log(
        `[V170 BOOMER CLEANUP] ${totals.total} programs: ${totals.video} video + ` +
        `${totals.audio} music/audio across ${categories.length} channels.`
    );
})();
