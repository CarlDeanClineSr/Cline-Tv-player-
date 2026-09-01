// ============================================================
// CLINE CLASSIC TV - CHANNEL REGISTRY / PROGRAMMING PATCHES
// V168 MASSIVE CATALOG EXPANSION
// ============================================================

// This registry is parser-blocking in index.html. Load the verified
// Schoolhouse Rock catalog here before the programming patch runs.
document.write('<script src="schoolhouse_rock_catalog.js"><\/script>');

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

    // ========================================================
    // CHANNEL B - ALL STAR TREK FIRST
    // ========================================================
    // Remove the older 30 TOS links that still live in the core
    // A/B catalog. Then put every verified Star Trek catalog at
    // the FRONT of B, one continuous run:
    //
    // TOS -> Star Trek Continues -> TNG -> DS9 -> Voyager
    //
    // Whatever older B programming remains follows afterward.
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
    // 73 original MP4 files independently verified by the same
    // Colab ranged-GET scanner used for the large Archive harvest.
    // They are split round-robin across D, E and F, then woven
    // evenly through each existing cartoon schedule instead of
    // appearing as one long Schoolhouse block.
    // ========================================================

    function weaveEvenly(baseItems, inserts) {
        if (!Array.isArray(inserts) || inserts.length === 0) {
            return [...baseItems];
        }

        if (!Array.isArray(baseItems) || baseItems.length === 0) {
            return [...inserts];
        }

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

        while (insertIndex < inserts.length) {
            output.push(inserts[insertIndex++]);
        }

        return output;
    }

    if (
        typeof SCHOOLHOUSE_ROCK !== "undefined" &&
        Array.isArray(SCHOOLHOUSE_ROCK) &&
        SCHOOLHOUSE_ROCK.length
    ) {
        const cartoonChannelNames = ["D", "E", "F"];
        const schoolhouseBuckets = {
            D: [],
            E: [],
            F: []
        };

        SCHOOLHOUSE_ROCK.forEach((item, index) => {
            const channelName = cartoonChannelNames[index % cartoonChannelNames.length];
            schoolhouseBuckets[channelName].push(item);
        });

        for (const channelName of cartoonChannelNames) {
            const channel = categories.find(item => item.name === channelName);

            if (!channel) {
                console.warn(`[SCHOOLHOUSE] Cartoon channel ${channelName} was not found.`);
                continue;
            }

            const originalCount = channel.content.length;
            const mixed = weaveEvenly(
                channel.content,
                schoolhouseBuckets[channelName]
            );

            channel.content.splice(
                0,
                channel.content.length,
                ...mixed
            );

            console.log(
                `[SCHOOLHOUSE] Channel ${channelName}: ${schoolhouseBuckets[channelName].length} clips ` +
                `woven through ${originalCount} existing programs (${channel.content.length} total).`
            );
        }
    } else {
        console.error("[SCHOOLHOUSE] SCHOOLHOUSE_ROCK catalog did not load.");
    }

    // ========================================================
    // DEDICATED EXPANSION CHANNELS
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
        `[CATALOG] ${totals.total} programs ready: ${totals.video} video + ` +
        `${totals.audio} audio across ${categories.length} channels. ` +
        `${totals.duplicates} duplicate URLs.`
    );
})();
