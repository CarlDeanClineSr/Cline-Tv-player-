// ============================================================
// CLINE CLASSIC TV - RADIO CHANNEL REGISTRY
// V167
// ============================================================
//
// Keep radio series in their own generated catalog files.
// This registry also handles small runtime programming patches that
// are safer to keep separate from the large core catalog.js file.
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
    // CHANNEL B - COMPLETE STAR TREK SEASON 1 RUN
    // ========================================================
    // Pull every Star Trek S1 episode out of the already-built
    // A/B programming, sort them 1x01 through 1x30, leave all of
    // Channel B's existing non-Trek programming at the front, and
    // then append the complete uninterrupted Star Trek run.
    // ========================================================

    const starTrekS1 = [];

    for (const channel of categories) {
        for (const item of channel.content) {
            if (
                item &&
                typeof item.u === "string" &&
                item.u.startsWith(ST_BASE_URL)
            ) {
                starTrekS1.push(item);
            }
        }
    }

    starTrekS1.sort((a, b) => {
        const episodeA = Number((a.n.match(/^1x(\d+)/) || [0, 0])[1]);
        const episodeB = Number((b.n.match(/^1x(\d+)/) || [0, 0])[1]);
        return episodeA - episodeB;
    });

    // Remove Star Trek from every existing A-J channel without
    // replacing the arrays, so all references remain intact.
    for (const channel of categories) {
        const nonTrek = channel.content.filter(
            item => !(
                item &&
                typeof item.u === "string" &&
                item.u.startsWith(ST_BASE_URL)
            )
        );

        channel.content.splice(
            0,
            channel.content.length,
            ...nonTrek
        );
    }

    const channelB = categories.find(channel => channel.name === "B");

    if (channelB && starTrekS1.length) {
        const existingBCount = channelB.content.length;
        channelB.content.push(...starTrekS1);

        console.log(
            `[PROGRAMMING] Channel B: ${existingBCount} existing programs first, ` +
            `then ${starTrekS1.length} Star Trek episodes in order.`
        );
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
