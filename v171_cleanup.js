// ============================================================
// V171 FINAL CONTENT CLEANUP
// Keeps the man-cave lineup tight after the registry is assembled.
// ============================================================

(() => {
    const EXTRA_CHILD = [
        /Star Wars Episode 2\.1 The Clone Wars/i,
        /Halo The Fall Of Reach/i,
        /Into The Spiderverse/i,
        /The Incredibles|Big Hero 6|Next Gen|Spy Kids/i,
        /Dino Time|The Good Dinosaur|Were Back A Dinosaurs Story|^Dinosaur$/i,
        /^Up$|^Coco$|Ratatouille|James And The Giant Peach|Lady and The Trump/i,
        /Alvin And The Chipmunks|Boss Baby|The Pagemaster|The Polar Express/i,
        /Stuart Little|Chicken Run|Osmosis Jones|Surf.sUp/i,
        /Amazing Stories 216 - Family Dog/i
    ];

    const isExtraChild = item =>
        EXTRA_CHILD.some(pattern => pattern.test(String(item && item.n || "")));

    for (const channel of categories) {
        channel.content = (channel.content || []).filter(item => !isExtraChild(item));
    }

    const cars = categories.find(channel => channel.name === "F");
    if (cars) {
        cars.content = cars.content.filter(item => {
            const s = `${item.n || ""} ${item.u || ""}`;
            if (/Remco/i.test(s)) return false;
            return /1964|1965|1966|1967|1968|1969|1970|Nova|Dart|Falcon|GTO|Fast And The Furious|Corvair/i.test(s);
        });
    }

    const seen = new Set();
    for (const channel of categories) {
        channel.content = channel.content.filter(item => {
            if (!item || typeof item.u !== "string" || !item.u) return false;
            if (seen.has(item.u)) return false;
            seen.add(item.u);
            return true;
        });
    }

    window.addEventListener("DOMContentLoaded", () => {
        document.title = "CLINE CLASSIC TV | MAN CAVE V171 (4:3 EDITION)";
        const badge = document.querySelector(".version");
        if (badge) badge.textContent = "V171-CRT / MAN CAVE";
    });
})();
