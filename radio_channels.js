// ============================================================
// CLINE CLASSIC TV - CHANNEL REGISTRY / PROGRAMMING PATCHES
// V168 MASSIVE CATALOG EXPANSION
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

        categories.push({
            name,
            label,
            kind,
            content
        });
    }

    // Channel B begins with all 80 verified Star Trek TOS programs.
    // Remove the older 30 TOS links from the original A/B schedule first.
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

    const channelB = categories.find(channel => channel.name === "B");
    if (channelB && Array.isArray(STAR_TREK_TOS) && STAR_TREK_TOS.length) {
        const existingB = [...channelB.content];
        channelB.content.splice(0, channelB.content.length, ...STAR_TREK_TOS, ...existingB);
        channelB.label = "STAR TREK TOS FIRST";
        console.log(
            `[PROGRAMMING] Channel B begins with ${STAR_TREK_TOS.length} verified Star Trek TOS programs, ` +
            `followed by ${existingB.length} existing B programs.`
        );
    }

    // Dedicated expansion channels.
    registerChannel("K", "X MINUS ONE RADIO", X_MINUS_ONE, "audio");
    registerChannel("L", "STAR TREK TNG", HARVEST_TNG, "video");
    registerChannel("M", "STAR TREK DS9", HARVEST_DS9, "video");
    registerChannel("N", "STAR TREK VOYAGER", HARVEST_VOYAGER, "video");
    registerChannel("O", "STAR TREK CONTINUES", HARVEST_STAR_TREK_CONTINUES, "video");

    const HARVEST_HITCHCOCK = [
        ...HARVEST_HITCHCOCK_S1,
        ...HARVEST_HITCHCOCK_S2,
        ...HARVEST_HITCHCOCK_S3
    ];
    registerChannel("P", "ALFRED HITCHCOCK PRESENTS", HARVEST_HITCHCOCK, "video");
    registerChannel("Q", "BUCK ROGERS", HARVEST_BUCK_ROGERS, "video");
    registerChannel("R", "MAN FROM ATLANTIS", HARVEST_MAN_FROM_ATLANTIS, "video");

    // Known catalog repair: Spider-Man 1967 episode 16B filename typo in core V166 catalog.
    for (const channel of categories) {
        const darkTerrors = channel.content.find(item => item.n === "16B - The Dark Terrors");
        if (darkTerrors) {
            darkTerrors.u =
                "https://archive.org/download/Spider-Man-67-Collection/" +
                "Season%201%20%281967-1968%29/" +
                "16B%20-%20The%20Dark%20Terrors.mp4";
        }
    }

    // Startup inventory.
    const totals = categories.reduce(
        (acc, channel) => {
            for (const item of channel.content) {
                acc.total++;
                if (typeof item.u === "string" && /\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)(?:[?#].*)?$/i.test(item.u)) {
                    acc.audio++;
                } else {
                    acc.video++;
                }
            }
            return acc;
        },
        { total: 0, audio: 0, video: 0 }
    );

    console.log(
        `[CATALOG] ${totals.total} programs ready: ${totals.video} video + ${totals.audio} audio across ${categories.length} channels.`
    );
})();
