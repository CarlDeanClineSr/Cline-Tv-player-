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
        /Are We There Yet|Honey, I Shrunk|Honey, We Shrunk|^Jumanji$/i,
        /Zathura|Who Framed Roger Rabbit|Nightmare Before Christmas/i,
        /^Coraline$|^Monster House$|The Cat In The Hat|^Underdog$/i,
        /Sharkboy And Lavagirl|The Ant Bully|Banana Splits/i,
        /ICarly Movie|Doug's 1st Movie|Meet The Robinsons|^Elio$/i,
        /^The Wild$|^9$|How The Grinch Stole Christmas/i,
        /Amazing Stories 216 - Family Dog/i
    ];

    const isExtraChild = item =>
        EXTRA_CHILD.some(pattern => pattern.test(String(item && item.n || "")));

    for (const channel of categories) {
        channel.content = (channel.content || []).filter(item => !isExtraChild(item));
    }

    // --------------------------------------------------------
    // SECTION E — NO FILLER
    // --------------------------------------------------------
    // The earlier "classic TV" net was too loose and admitted
    // Captain Nice, Miss Marple, Sherlock Holmes, Cavalcade, etc.
    // Section E is now intentionally narrow: Dragnet, Hitchcock,
    // and the verified Lone Ranger western material only.
    // --------------------------------------------------------

    const classic = categories.find(channel => channel.name === "E");
    if (classic) {
        classic.label = "DRAGNET / HITCHCOCK / WESTERNS";
        classic.content = (classic.content || []).filter(item =>
            /Dragnet|Alfred Hitchcock|Lone Ranger/i.test(String(item && item.n || ""))
        );
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
