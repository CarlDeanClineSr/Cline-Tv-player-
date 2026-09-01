// ============================================================
// CLINE CLASSIC TV - RADIO CHANNEL REGISTRY
// V167
// ============================================================
//
// Keep radio series in their own generated catalog files.
// This registry adds those catalogs to the existing A-J TV channels.
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
