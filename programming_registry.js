// ============================================================
// CLINE CLASSIC TV - PROGRAMMING REGISTRY
// V169 REFINED MEGA ARCHIVE EXPANSION
// ============================================================
// Runs only after all generated catalog data files have loaded.
// ============================================================

(() => {
    function registerChannel(name, label, content, kind = "mixed") {
        if (!Array.isArray(content) || content.length === 0) {
            console.warn(`[CHANNEL] ${name} "${label}" has no media and was not registered.`);
            return;
        }

        const alreadyExists = categories.some(channel => channel.name === name);
        if (alreadyExists) {
            console.warn(`[CHANNEL] ${name} already exists; registration skipped.`);
            return;
        }

        categories.push({ name, label, kind, content });
    }

    function weaveEvenly(baseItems, inserts) {
        if (!Array.isArray(inserts) || inserts.length === 0) return [...baseItems];
        if (!Array.isArray(baseItems) || baseItems.length === 0) return [...inserts];

        const output = [];
        let insertIndex = 0;

        for (let i = 0; i < baseItems.length; i++) {
            output.push(baseItems[i]);

            const shouldHaveInserted = Math.floor(
                ((i + 1) * inserts.length) / baseItems.length
            );

            while (insertIndex < shouldHaveInserted) {
                output.push(inserts[insertIndex++]);
            }
        }

        while (insertIndex < inserts.length) output.push(inserts[insertIndex++]);
        return output;
    }

    // ========================================================
    // CHANNEL B - ALL STAR TREK FIRST, UNINTERRUPTED
    // ========================================================
    // Remove the older 30 TOS links still embedded in core A/B,
    // then prepend every verified Star Trek catalog to B.
    // Commercials are deliberately NEVER injected into B.
    // ========================================================

    for (const channel of categories) {
        const nonOldTrek = channel.content.filter(
            item => !(
                item &&
                typeof item.u === "string" &&
                item.u.startsWith(ST_BASE_URL)
            )
        );

        channel.content.splice(0, channel.content.length, ...nonOldTrek);
    }

    const ALL_STAR_TREK = [
        ...STAR_TREK_TOS,
        ...HARVEST_STAR_TREK_CONTINUES,
        ...HARVEST_TNG,
        ...HARVEST_DS9,
        ...HARVEST_VOYAGER
    ];

    const channelB = categories.find(channel => channel.name === "B");

    if (channelB && ALL_STAR_TREK.length) {
        const existingB = [...channelB.content];

        channelB.content.splice(
            0,
            channelB.content.length,
            ...ALL_STAR_TREK,
            ...existingB
        );

        channelB.label = "STAR TREK";

        console.log(
            `[PROGRAMMING] Channel B begins with ${ALL_STAR_TREK.length} Star Trek programs ` +
            `(${STAR_TREK_TOS.length} TOS + ${HARVEST_STAR_TREK_CONTINUES.length} Continues + ` +
            `${HARVEST_TNG.length} TNG + ${HARVEST_DS9.length} DS9 + ${HARVEST_VOYAGER.length} Voyager), ` +
            `followed by ${existingB.length} other B programs.`
        );
    }

    // ========================================================
    // SCHOOLHOUSE ROCK - SPREAD THROUGH CARTOON CHANNELS
    // ========================================================

    if (
        typeof SCHOOLHOUSE_ROCK !== "undefined" &&
        Array.isArray(SCHOOLHOUSE_ROCK) &&
        SCHOOLHOUSE_ROCK.length
    ) {
        const cartoonChannelNames = ["D", "E", "F"];
        const schoolhouseBuckets = { D: [], E: [], F: [] };

        SCHOOLHOUSE_ROCK.forEach((item, index) => {
            const channelName = cartoonChannelNames[index % cartoonChannelNames.length];
            schoolhouseBuckets[channelName].push(item);
        });

        for (const channelName of cartoonChannelNames) {
            const channel = categories.find(item => item.name === channelName);
            if (!channel) continue;

            const mixed = weaveEvenly(
                channel.content,
                schoolhouseBuckets[channelName]
            );

            channel.content.splice(0, channel.content.length, ...mixed);
        }
    }

    // ========================================================
    // EXISTING DEDICATED CHANNELS
    // ========================================================

    registerChannel("K", "X MINUS ONE RADIO", X_MINUS_ONE, "audio");

    const HARVEST_HITCHCOCK = [
        ...HARVEST_HITCHCOCK_S1,
        ...HARVEST_HITCHCOCK_S2,
        ...HARVEST_HITCHCOCK_S3
    ];

    registerChannel("L", "ALFRED HITCHCOCK PRESENTS", HARVEST_HITCHCOCK, "video");
    registerChannel("M", "BUCK ROGERS", HARVEST_BUCK_ROGERS, "video");
    registerChannel("N", "MAN FROM ATLANTIS", HARVEST_MAN_FROM_ATLANTIS, "video");

    // ========================================================
    // REFINED 5,306-ENTRY MEGA HARVEST
    // ========================================================
    // The original search-profile labels were discovery clues, not
    // final classifications. These arrays were rebuilt from source
    // identifier, filename/title, media type, and obvious series
    // structure. Noisy / ambiguous rows remain in the master Drive
    // database instead of being blindly scheduled.
    // ========================================================

    registerChannel("O", "OTR DETECTIVE / MYSTERY", REFINED_OTR_MYSTERY, "audio");
    registerChannel("P", "OTR WESTERNS", REFINED_OTR_WESTERN, "audio");
    registerChannel("Q", "WWII RADIO / HISTORY", REFINED_WWII_HISTORY, "mixed");
    registerChannel("R", "INTERNATIONAL / SHORTWAVE AUDIO", REFINED_INTERNATIONAL_AUDIO, "audio");
    registerChannel("S", "CLASSIC TV / CARTOONS", REFINED_CLASSIC_TV, "video");
    registerChannel("T", "SCIENCE / EDUCATION", REFINED_SCIENCE_EDUCATION, "video");
    registerChannel("U", "SHOCK / DRIVE-IN", REFINED_SHOCK_DRIVE_IN, "video");
    registerChannel("V", "HOLIDAY RADIO / TV", REFINED_HOLIDAY, "mixed");

    // ========================================================
    // VINTAGE AUTOMOBILE COMMERCIAL BREAKS
    // ========================================================
    // Each verified ad appears exactly once. They are distributed
    // across video-heavy channels and woven through the programming.
    // B is intentionally excluded so Star Trek remains uninterrupted.
    // ========================================================

    const commercialTargets = [
        "A", "C", "D", "E", "F", "G", "H", "I",
        "J", "L", "M", "N", "S", "T", "U", "V"
    ];

    const adBuckets = Object.fromEntries(
        commercialTargets.map(name => [name, []])
    );

    REFINED_VINTAGE_AUTO_ADS.forEach((ad, index) => {
        const channelName = commercialTargets[index % commercialTargets.length];
        adBuckets[channelName].push(ad);
    });

    for (const channelName of commercialTargets) {
        const channel = categories.find(item => item.name === channelName);
        const ads = adBuckets[channelName];

        if (!channel || !ads.length) continue;

        const mixed = weaveEvenly(channel.content, ads);
        channel.content.splice(0, channel.content.length, ...mixed);
    }

    // ========================================================
    // KNOWN CORE-CATALOG REPAIR
    // ========================================================

    for (const channel of categories) {
        const darkTerrors = channel.content.find(
            item => item.n === "16B - The Dark Terrors"
        );

        if (darkTerrors) {
            darkTerrors.u =
                "https://archive.org/download/Spider-Man-67-Collection/" +
                "Season%201%20%281967-1968%29/" +
                "16B%20-%20The%20Dark%20Terrors.mp4";
        }
    }

    // ========================================================
    // STARTUP INVENTORY
    // ========================================================

    const totals = categories.reduce(
        (acc, channel) => {
            for (const item of channel.content) {
                acc.total++;

                if (
                    typeof item.u === "string" &&
                    /\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)(?:[?#].*)?$/i.test(item.u)
                ) {
                    acc.audio++;
                } else {
                    acc.video++;
                }

                if (acc.urls.has(item.u)) {
                    acc.duplicates++;
                } else {
                    acc.urls.add(item.u);
                }
            }

            return acc;
        },
        {
            total: 0,
            audio: 0,
            video: 0,
            duplicates: 0,
            urls: new Set()
        }
    );

    console.log(
        `[REFINED MEGA] ${REFINED_OTR_MYSTERY.length + REFINED_OTR_WESTERN.length + ` +
        `REFINED_WWII_HISTORY.length + REFINED_INTERNATIONAL_AUDIO.length + ` +
        `REFINED_CLASSIC_TV.length + REFINED_SCIENCE_EDUCATION.length + ` +
        `REFINED_SHOCK_DRIVE_IN.length + REFINED_HOLIDAY.length} channel programs + ` +
        `${REFINED_VINTAGE_AUTO_ADS.length} commercial breaks loaded.`
    );

    console.log(
        `[CATALOG] ${totals.total} programs ready: ${totals.video} video + ` +
        `${totals.audio} audio across ${categories.length} channels. ` +
        `${totals.duplicates} duplicate URLs.`
    );
})();
