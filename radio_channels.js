// ============================================================
// CLINE CLASSIC TV - RADIO / PROGRAMMING REGISTRY
// V167
// ============================================================
//
// Keep generated series catalogs separate from the large core
// catalog.js file. This registry handles channel additions and
// small runtime programming patches.
//
// Future expansion:
//   L = WAR / NEWS RADIO
//   M = HOLIDAY RADIO
//   N = INTERNATIONAL RADIO
// ============================================================

(() => {
    function registerChannel(name, label, content, kind = "mixed") {
        if (!Array.isArray(content) || content.length === 0) {
            console.warn(`[RADIO] Channel ${name} "${label}" has no media and was not registered.`);
            return;
        }

        const alreadyExists = categories.some(channel => channel.name === name);
        if (alreadyExists) {
            console.warn(`[RADIO] Channel ${name} already exists; registration skipped.`);
            return;
        }

        categories.push({
            name,
            label,
            kind,
            content
        });
    }

    // ========================================================
    // CHANNEL B - COMPLETE VERIFIED STAR TREK TOS RUN FIRST
    // ========================================================
    // The core catalog contains the older 30 Season-1 Star Trek
    // entries spread across A and B. Remove those old entries
    // everywhere, then place the verified 80-file TOS catalog at
    // the FRONT of Channel B. Everything else on B follows it.
    // ========================================================

    for (const channel of categories) {
        const nonOldTrek = channel.content.filter(
            item => !(
                item &&
                typeof item.u === "string" &&
                item.u.startsWith(ST_BASE_URL)
            )
        );

        channel.content.splice(
            0,
            channel.content.length,
            ...nonOldTrek
        );
    }

    const channelB = categories.find(channel => channel.name === "B");

    if (
        channelB &&
        typeof STAR_TREK_TOS !== "undefined" &&
        Array.isArray(STAR_TREK_TOS) &&
        STAR_TREK_TOS.length
    ) {
        const existingB = [...channelB.content];

        channelB.content.splice(
            0,
            channelB.content.length,
            ...STAR_TREK_TOS,
            ...existingB
        );

        console.log(
            `[PROGRAMMING] Channel B: ${STAR_TREK_TOS.length} verified Star Trek TOS episodes first, ` +
            `then ${existingB.length} other programs.`
        );
    } else {
        console.error("[PROGRAMMING] STAR_TREK_TOS catalog did not load.");
    }

    // 122 verified original MP3 broadcasts produced by the Colab scanner.
    registerChannel("K", "X MINUS ONE RADIO", X_MINUS_ONE, "audio");

    // Known catalog repair:
    // V166 contained a filename typo for Spider-Man 1967 episode 16B.
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
})();
