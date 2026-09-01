// ============================================================
// CLINE CLASSIC TV - PROGRAMMING REGISTRY
// V171 MAN CAVE REBUILD
// ============================================================
// Clean themed video channels. No radio/OTR/audio channels.
// Movies are restored; cartoons/preschool/Pokemon are excluded.
// ============================================================

(() => {
    const originalCore = categories.flatMap(channel => channel.content || []);

    function uniqueByUrl(items) {
        const seen = new Set();
        const out = [];
        for (const item of items || []) {
            if (!item || typeof item.u !== "string" || !item.u) continue;
            if (seen.has(item.u)) continue;
            seen.add(item.u);
            out.push(item);
        }
        return out;
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

    function isAudio(item) {
        return /\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)(?:[?#].*)?$/i.test(
            String(item && item.u || "")
        );
    }

    function title(item) {
        return String(item && item.n || "");
    }

    function url(item) {
        return String(item && item.u || "");
    }

    const CARTOON_KID_PATTERNS = [
        /Pokemon|Yu-Gi-Oh|Schoolhouse Rock/i,
        /SpongeBob|Scooby-Doo|Rugrats|Powerpuff|Phineas|Recess/i,
        /Wild Thornberrys|Billy & Mandys|Little Einsteins|Barney/i,
        /Blue'?s Big|Elmo in Grouchland|Sid the Science Kid/i,
        /Land Before Time|Ice Age|Toy Story|Finding Nemo|Finding Dory/i,
        /^Cars(?:\s|\(|$)|Shrek|Despicable Me|Madagascar/i,
        /Kung Fu Panda|Lilo & Stitch|How To Train Your Dragon/i,
        /Wreck-It Ralph|A Bug'?s Life|Bee Movie|Over the Hedge/i,
        /Flushed Away|Shark Tale|Monsters Inc|Monsters University/i,
        /Peter Pan|101 Dalmatians|102 Dalmatians|^Aladdin/i,
        /Brother Bear|The Lion King|^Mulan|The Little Mermaid/i,
        /The Jungle Book|Brave Little Toaster|^Tarzan\b/i,
        /Chicken Little|^Moana|The Croods|The Wild Robot/i,
        /Emperor'?s New Groove|Treasure Planet|The Iron Giant/i,
        /Astro Boy|Astro Kid|Lightyear|WALL-E|Jimmy Neutron/i,
        /Buzz Lightyear|Monsters Vs\. Aliens|Dino Time|Good Dinosaur/i,
        /Ed, Edd n Eddy|Kids Next Door|Ben 10|LEGO Ninjago/i,
        /Scary Godmother|Underfist|Grandma Got Run Over/i,
        /Reading Rainbow|Rocky.*Bullwinkle|X-Men.*Animated/i,
        /Popeye|Betty Boop|Casper|Noveltoon|Flip The Frog/i
    ];

    function isCartoonKid(item) {
        const n = title(item);
        const u = url(item);
        if (/Spider-Man-67-Collection/i.test(u)) return true;
        if (/schoolhouse-rock/i.test(u)) return true;
        if (/BNTSG_2/i.test(u)) return true;
        return CARTOON_KID_PATTERNS.some(pattern => pattern.test(n));
    }

    function isOldTrek(item) {
        return typeof ST_BASE_URL !== "undefined" && url(item).startsWith(ST_BASE_URL);
    }

    function isProjectUfo(item) {
        return /^Project UFO\b/i.test(title(item));
    }

    function isCoreScience(item) {
        const n = title(item);
        return (
            /^Earth Was Made:/i.test(n) ||
            /^In Search of\.\.\./i.test(n) ||
            /Roswell UFO Crash BBC Doc|Edge of Creation/i.test(n)
        );
    }

    function isMonsterMovie(item) {
        const n = title(item);
        return /Godzilla|Little Shop Of Horrors|Eight Legged Freaks|Big Ass Spider|World War Z/i.test(n);
    }

    function isSciFiMovie(item) {
        const n = title(item);
        return /^Star Wars Episode|^Halo 4|^Tron\b|Ready Player One/i.test(n);
    }

    const MOVIE_VAULT = uniqueByUrl(
        originalCore.filter(item =>
            !isAudio(item) &&
            !isOldTrek(item) &&
            !isCartoonKid(item) &&
            !isProjectUfo(item) &&
            !isCoreScience(item) &&
            !isMonsterMovie(item) &&
            !isSciFiMovie(item) &&
            !/^BNTSG\b/i.test(title(item)) &&
            !/Rudolph the Red-Nosed Reindeer/i.test(title(item))
        )
    );

    function movieRank(item) {
        const n = title(item);
        if (/Good, the Bad and the Ugly|Love Bug|Herbie|Wizard of Oz/i.test(n)) return 10;
        if (/^Spider-man|^Iron Man|^Venom/i.test(n)) return 20;
        if (/Jurassic/i.test(n)) return 30;
        if (/Twister|Titanic|Day After|Into The Storm/i.test(n)) return 40;
        if (/Rush Hour/i.test(n)) return 50;
        if (/National Lampoon/i.test(n)) return 60;
        return 90;
    }

    MOVIE_VAULT.sort((a, b) =>
        (movieRank(a) - movieRank(b)) || naturalCompare(a, b)
    );

    const STAR_TREK_UNIVERSE = uniqueByUrl([
        ...STAR_TREK_TOS,
        ...HARVEST_STAR_TREK_CONTINUES,
        ...HARVEST_TNG,
        ...HARVEST_DS9,
        ...HARVEST_VOYAGER
    ]);

    const STAR_WARS_AND_SCIFI_MOVIES = sorted(
        originalCore.filter(item =>
            !isCartoonKid(item) && isSciFiMovie(item)
        )
    );

    const PROJECT_UFO = sorted(
        originalCore.filter(item => isProjectUfo(item))
    );

    function pickClassic(pattern) {
        return sorted((REFINED_CLASSIC_TV || []).filter(item =>
            !isAudio(item) &&
            !isCartoonKid(item) &&
            pattern.test(title(item))
        ));
    }

    const SPACE_1999 = pickClassic(/Space\s*:?\s*1999/i);
    const UFO_SERIES = pickClassic(/^UFO[.\s]|UFO\.\s*\(/i);
    const PRISONER = pickClassic(/The Prisoner/i);
    const CAPTAIN_SCARLET = pickClassic(/Captain Scarlet/i);
    const AMAZING_STORIES = pickClassic(/Amazing Stories/i);

    const SCIFI_SPACE = uniqueByUrl([
        ...STAR_WARS_AND_SCIFI_MOVIES,
        ...PROJECT_UFO,
        ...HARVEST_BUCK_ROGERS,
        ...HARVEST_MAN_FROM_ATLANTIS,
        ...SPACE_1999,
        ...UFO_SERIES,
        ...PRISONER,
        ...CAPTAIN_SCARLET,
        ...AMAZING_STORIES
    ]);

    const CORE_MONSTERS = sorted(
        originalCore.filter(item =>
            !isCartoonKid(item) && isMonsterMovie(item)
        )
    );

    const DRIVE_IN = sorted((REFINED_SHOCK_DRIVE_IN || []).filter(item => {
        const n = title(item);
        return (
            !isAudio(item) &&
            !isCartoonKid(item) &&
            !/Blast Corps|Deleted Scene|Trailer Compilation|^VTS\s/i.test(n) &&
            /Night of the Living Dead|Bloody Pit|Bloodlust|Carnival of Souls|Creature|Haunted|Vampire|Horror|Scream|Frankenstein|Indestructible Man|Inner Sanctum|Bee Girls|It's Alive|Eye Creatures|Thing From Another World|The Terror|Killer Shrews|Atomic Brain|Gila Monster|White Zombie|Tormented|Colossus|One Million Years BC|Drive In|Shocker|Fast And The Furious|Most Dangerous Game|In The Year 2889|Prisoners Of The Lost Universe/i.test(n)
        );
    }));

    const MONSTERS_KOLCHAK = uniqueByUrl([
        ...MANCAVE_KOLCHAK,
        ...CORE_MONSTERS,
        ...DRIVE_IN
    ]);

    const CLASSIC_LIVE_TV = sorted((REFINED_CLASSIC_TV || []).filter(item => {
        const n = title(item);
        return (
            !isAudio(item) &&
            !isCartoonKid(item) &&
            /Dragnet|Lone Ranger|Captain Nice|Miss Marple|Sherlock Holmes|Three Stooges|Cavalcade of Stars/i.test(n)
        );
    }));

    const HITCHCOCK = uniqueByUrl([
        ...HARVEST_HITCHCOCK_S1,
        ...HARVEST_HITCHCOCK_S2,
        ...HARVEST_HITCHCOCK_S3
    ]);

    const CLASSIC_TV = uniqueByUrl([
        ...CLASSIC_LIVE_TV,
        ...HITCHCOCK
    ]);

    const CAR_RACING_FROM_DRIVE_IN = sorted(
        (REFINED_SHOCK_DRIVE_IN || []).filter(item =>
            !isAudio(item) &&
            /Fast And The Furious|Corvair in Action|Chevrolet Screen Ads/i.test(title(item))
        )
    );

    const MUSCLE_CARS = uniqueByUrl([
        ...MANCAVE_MUSCLE_CAR_CLIPS,
        ...(REFINED_VINTAGE_AUTO_ADS || []),
        ...CAR_RACING_FROM_DRIVE_IN
    ]);

    const CORE_SCIENCE = sorted(
        originalCore.filter(item => !isCartoonKid(item) && isCoreScience(item))
    );

    const REFINED_SCIENCE = sorted((REFINED_SCIENCE_EDUCATION || []).filter(item => {
        const n = title(item);
        return (
            !isAudio(item) &&
            !isCartoonKid(item) &&
            /Cosmos|Connections|NASA|Apollo|Gemini|Mercury|Moon|Space|Astronomy|Planet|Universe|Atom|Atomic|Rocket|Earth|Ocean|Geology|Science|UFO/i.test(n)
        );
    }));

    const SCIENCE = uniqueByUrl([
        ...CORE_SCIENCE,
        ...REFINED_SCIENCE
    ]);

    const HISTORY = sorted((REFINED_WWII_HISTORY || []).filter(item =>
        !isAudio(item) &&
        !/Churchill/i.test(title(item)) &&
        !isCartoonKid(item)
    ));

    categories.splice(
        0,
        categories.length,
        { name: "A", label: "MOVIE VAULT", kind: "video", content: MOVIE_VAULT },
        { name: "B", label: "STAR TREK UNIVERSE", kind: "video", content: STAR_TREK_UNIVERSE },
        { name: "C", label: "STAR WARS / SCI-FI TV", kind: "video", content: SCIFI_SPACE },
        { name: "D", label: "MONSTERS / KOLCHAK", kind: "video", content: MONSTERS_KOLCHAK },
        { name: "E", label: "CLASSIC TV / CRIME", kind: "video", content: CLASSIC_TV },
        { name: "F", label: "MUSCLE CARS / RACING", kind: "video", content: MUSCLE_CARS },
        { name: "G", label: "SCIENCE / SPACE / UFO", kind: "video", content: SCIENCE },
        { name: "H", label: "WAR / NEWS / HISTORY", kind: "video", content: HISTORY }
    );

    const globalUrls = new Set();
    for (const channel of categories) {
        channel.content = channel.content.filter(item => {
            if (!item || typeof item.u !== "string" || !item.u) return false;
            if (globalUrls.has(item.u)) return false;
            globalUrls.add(item.u);
            return true;
        });
    }

    const total = categories.reduce((sum, channel) => sum + channel.content.length, 0);

    console.log("[V171 MAN CAVE] Organized video-only tuner.");
    for (const channel of categories) {
        console.log(`Channel ${channel.name} • ${channel.label}: ${channel.content.length}`);
    }
    console.log(`[V171 MAN CAVE] ${total} video programs. 0 radio channels.`);
})();
