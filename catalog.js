// --- BASE URLs (Always use archive.org/download/ master routers) ---
const ST_BASE_URL = "https://archive.org/download/JimmyAndTheFederationGang/";
const EARTH_BASE_URL = "https://archive.org/download/How.The.Earth.Was.Made/Season%201/";
const UFO_BASE_URL = "https://archive.org/download/project-ufo-complete-series-1978/";
const SPIDER_BASE_URL = "https://archive.org/download/Spider-Man-67-Collection/Season%201%20%281967-1968%29/";
const SPIDER_S2_BASE_URL = "https://archive.org/download/Spider-Man-67-Collection/Season%202%20%281968-1969%29/";
const SPIDER_S3_BASE_URL = "https://archive.org/download/Spider-Man-67-Collection/Season%203%20%281970%29/";
const MOVIE_BASE_URL = "https://archive.org/download/My-Favorite-Movies_202503/";
const NYE_BASE_URL = "https://archive.org/download/BNTSG_2/";

// --- URL BUILDERS ---
const M = n => ({
    n: n,
    u: MOVIE_BASE_URL + encodeURIComponent(n + ".mp4").replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
});

const NYE = n => ({
    n: n,
    u: NYE_BASE_URL + encodeURIComponent(n + ".mp4").replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
});

// --- TV ENGINE: CHANNELS ---
const A = [], B = [], C = [], D = [], E = [], F = [], G = [], H = [], I = [], J = [];
const categories = [
    {name: "A", content: A}, {name: "B", content: B}, {name: "C", content: C}, {name: "D", content: D},
    {name: "E", content: E}, {name: "F", content: F}, {name: "G", content: G}, {name: "H", content: H},
    {name: "I", content: I}, {name: "J", content: J}
];

// --- LEGACY SHOWS: STRICTLY MAPPED TO SPECIFIC CHANNELS ---
const LEGACY_BY_THEME = {
    A: [
        // Star Trek S1 (First Half)
        {n: "1x01 - The Cage", u: ST_BASE_URL + "1x01-TheCage.mp4"},
        {n: "1x02 - Where No Man Has Gone Before", u: ST_BASE_URL + "1x02-WhereNoManHasGoneBefore.mp4"},
        {n: "1x03 - The Corbomite Maneuver", u: ST_BASE_URL + "1x03-TheCorbomiteManeuver.mp4"},
        {n: "1x04 - Mudd's Women", u: ST_BASE_URL + "1x04-MuddsWomen.mp4"},
        {n: "1x05 - The Enemy Within", u: ST_BASE_URL + "1x05-TheEnemyWithin.mp4"},
        {n: "1x06 - The Man Trap", u: ST_BASE_URL + "1x06-TheManTrap.mp4"},
        {n: "1x07 - The Naked Time", u: ST_BASE_URL + "1x07-TheNakedTime.mp4"},
        {n: "1x08 - Charlie X", u: ST_BASE_URL + "1x08-CharlieX.mp4"},
        {n: "1x09 - Balance of Terror", u: ST_BASE_URL + "1x09-BalanceOfTerror.mp4"},
        {n: "1x10 - What are Little Girls Made of", u: ST_BASE_URL + "1x10-WhatAreLittleGirlsMadeOf.mp4"},
        {n: "1x11 - Dagger of the Mind", u: ST_BASE_URL + "1x11-DaggerOfTheMind.mp4"},
        {n: "1x12 - Miri", u: ST_BASE_URL + "1x12-Miri.mp4"},
        {n: "1x13 - The Conscience of the King", u: ST_BASE_URL + "1x13-TheConscienceOfTheKing.mp4"},
        {n: "1x14 - The Galileo Seven", u: ST_BASE_URL + "1x14-TheGalileoSeven.mp4"},
        {n: "1x15 - Court Martial", u: ST_BASE_URL + "1x15-CourtMartial.mp4"},
        // Bill Nye Seasons 1 & 2
        ...[
            "BNTSG S01E01 Flight", "BNTSG S01E02 Earths Crust", "BNTSG S01E03 Dinosaurs", "BNTSG S01E04 Skin", "BNTSG S01E05 Buoyancy", "BNTSG S01E06 Gravity", "BNTSG S01E07 Digestion", "BNTSG S01E08 Phases of Matter", "BNTSG S01E09 Biodiversity", "BNTSG S01E10 Simple Machines", "BNTSG S01E11 The Moon", "BNTSG S01E12 Sound", "BNTSG S01E13 Garbage", "BNTSG S01E14 Structures", "BNTSG S01E15 Seasons", "BNTSG S01E16 Light and Color", "BNTSG S01E17 Cells", "BNTSG S01E18 Electricity", "BNTSG S01E19 Outer Space", "BNTSG S01E20 Eyeballs",
            "BNTSG S02E01 Magnetism", "BNTSG S02E02 Wind", "BNTSG S02E03 Blood & Circulation", "BNTSG S02E04 Chemical Reactions", "BNTSG S02E05 Static Electricity", "BNTSG S02E06 Food Web", "BNTSG S02E07 Light Optics, Bending & Bouncing", "BNTSG S02E08 Bones and Muscles", "BNTSG S02E09 Ocean Currents", "BNTSG S02E10 Heat", "BNTSG S02E11 Insects", "BNTSG S02E12 Balance", "BNTSG S02E13 The Sun", "BNTSG S02E14 The Brain", "BNTSG S02E15 Forests", "BNTSG S02E16 Communication", "BNTSG S02E17 Momentum", "BNTSG S02E18 Reptiles", "BNTSG S02E19 Atmosphere", "BNTSG S02E20 Respiration"
        ].map(NYE)
    ],

    B: [
        // Star Trek S1 (Second Half)
        {n: "1x16 - The Menagerie - Part I", u: ST_BASE_URL + "1x16-TheMenagerie-PartI.mp4"},
        {n: "1x17 - The Menagerie - Part II", u: ST_BASE_URL + "1x17-TheMenagerie-PartIi.mp4"},
        {n: "1x18 - Shore Leave", u: ST_BASE_URL + "1x18-ShoreLeave.mp4"},
        {n: "1x19 - The Squire of Gothos", u: ST_BASE_URL + "1x19-TheSquireOfGothos.mp4"},
        {n: "1x20 - Arena", u: ST_BASE_URL + "1x20-Arena.mp4"},
        {n: "1x21 - The Alternative Factor", u: ST_BASE_URL + "1x21-TheAlternativeFactor.mp4"},
        {n: "1x22 - Tomorrow is Yesterday", u: ST_BASE_URL + "1x22-TomorrowIsYesterday.mp4"},
        {n: "1x23 - The Return of the Archons", u: ST_BASE_URL + "1x23-TheReturnOfTheArchons.mp4"},
        {n: "1x24 - A Taste of Armageddon", u: ST_BASE_URL + "1x24-ATasteOfArmageddon.mp4"},
        {n: "1x25 - Space Seed", u: ST_BASE_URL + "1x25-SpaceSeed.mp4"},
        {n: "1x26 - This Side of Paradise", u: ST_BASE_URL + "1x26-ThisSideOfParadise.mp4"},
        {n: "1x27 - The Devil in the Dark", u: ST_BASE_URL + "1x27-TheDevilInTheDark.mp4"},
        {n: "1x28 - Errand of Mercy", u: ST_BASE_URL + "1x28-ErrandOfMercy.mp4"},
        {n: "1x29 - The City on the Edge of Forever", u: ST_BASE_URL + "1x29-TheCityOnTheEdgeOfForever.mp4"},
        {n: "1x30 - Operation Annihilate!", u: ST_BASE_URL + "1x30-OperationAnnihilate.mp4"},
        // Project UFO S1
        {n: "Project UFO S01E01", u: UFO_BASE_URL + "Project%20UFO%20S01E01%20-%20The%20Washington%20DC%20Incident.mp4"},
        {n: "Project UFO S01E02", u: UFO_BASE_URL + "Project%20UFO%20S01E02%20-%20The%20Joshua%20Flats%20Incident.mp4"},
        {n: "Project UFO S01E03", u: UFO_BASE_URL + "Project%20UFO%20S01E03%20-%20The%20Fremont%20Incident.mp4"},
        {n: "Project UFO S01E04", u: UFO_BASE_URL + "Project%20UFO%20S01E04%20-%20The%20Howard%20Crossing%20Incident.mp4"},
        {n: "Project UFO S01E05", u: UFO_BASE_URL + "Project%20UFO%20S01E05%20-%20The%20Medicine%20Bow%20Incident.mp4"},
        {n: "Project UFO S01E06", u: UFO_BASE_URL + "Project%20UFO%20S01E06%20-%20The%20Nevada%20Desert%20Incident.mp4"},
        {n: "Project UFO S01E07", u: UFO_BASE_URL + "Project%20UFO%20S01E07%20-%20The%20Forest%20City%20Incident.mp4"},
        {n: "Project UFO S01E08", u: UFO_BASE_URL + "Project%20UFO%20S01E08%20-%20The%20Desert%20Springs%20Incident.mp4"},
        {n: "Project UFO S01E09", u: UFO_BASE_URL + "Project%20UFO%20S01E09%20-%20The%20French%20Incident.mp4"},
        {n: "Project UFO S01E10", u: UFO_BASE_URL + "Project%20UFO%20S01E10%20-%20The%20Waterford%20Incident.mp4"},
        {n: "Project UFO S01E11", u: UFO_BASE_URL + "Project%20UFO%20S01E11%20-%20The%20Doll%20House%20Incident.mp4"},
        {n: "Project UFO S01E12", u: UFO_BASE_URL + "Project%20UFO%20S01E12%20-%20The%20Rock%20and%20Hard%20Place%20Incident.mp4"},
        {n: "Project UFO S01E13", u: UFO_BASE_URL + "Project%20UFO%20S01E13%20-%20The%20St.%20Hillary%20Inci.mp4"},
        // Bill Nye Seasons 3 & 4
        ...[
            "BNTSG S03E01 Planets & Moons", "BNTSG S03E02 Pressure", "BNTSG S03E03 Plants", "BNTSG S03E04 Rocks & Soil", "BNTSG S03E05 Energy", "BNTSG S03E06 Evolution", "BNTSG S03E07 Water Cycle", "BNTSG S03E08 Friction", "BNTSG S03E09 Germs", "BNTSG S03E10 Climates", "BNTSG S03E11 Waves", "BNTSG S03E12 Ocean Life", "BNTSG S03E13 Mammals", "BNTSG S03E14 Spinning Things", "BNTSG S03E15 Fish", "BNTSG S03E16 Human Transportation", "BNTSG S03E17 Wetlands", "BNTSG S03E18 Birds", "BNTSG S03E19 Populations", "BNTSG S03E20 Animal Locomotion",
            "BNTSG S04E01 Rivers & Streams", "BNTSG S04E02 Nutrition", "BNTSG S04E03 Marine Mammals", "BNTSG S04E04 Earthquakes", "BNTSG S04E05 NTV Top 11 Countdown", "BNTSG S04E06 Spiders", "BNTSG S04E07 Pollution Solutions", "BNTSG S04E08 Probability", "BNTSG S04E09 Pseudoscience", "BNTSG S04E10 Flowers", "BNTSG S04E11 Archaeology", "BNTSG S04E12 Deserts", "BNTSG S04E13 Amphibians", "BNTSG S04E14 Volcanoes", "BNTSG S04E15 Invertebrates", "BNTSG S04E16 Heart", "BNTSG S04E17 Inventions", "BNTSG S04E18 Computers", "BNTSG S04E19 Fossils", "BNTSG S04E20 Time"
        ].map(NYE)
    ],

    C: [
        // Docs & Sci-Fi Leftovers
        {n: "The Good, the Bad and the Ugly [1966]", u: "https://archive.org/download/TheGoodTheBadAndTheUgly1966/The%20Good%2C%20the%20Bad%20and%20the%20Ugly%20%5B1966%5D.mp4"},
        {n: "Roswell UFO Crash BBC Doc", u: "https://archive.org/download/TheRoswellUFOCrashBBCDocumentaryProof/The%20Roswell%20UFO%20Crash%20BBC%20Documentary%20-%20Proof.mp4"},
        {n: "Edge of Creation (1979)", u: "https://archive.org/download/NGSDivetotheEdgeofCreation/National.Geographic.Specials.S14E01.Dive.to.the.Edge.of.Creation.1980.VHSRip.DD2.0.x264-rattera.mp4"},
        {n: "In Search of... Martians", u: "https://archive.org/download/InSearchOf16mm/In Search of... Martians %28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... A Call From Space", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...A%20Call%20From%20Space%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... Amelia Earhart", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...Amelia%20Earhart%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... Ancient Aviators", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...Ancient%20Aviators%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... Atlantis", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...Atlantis%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... Bigfoot", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...Bigfoot%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... Earthquakes", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...Earthquakes%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... Strange Visitors", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...Strange%20Visitors%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... UFOs", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...UFOs%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "In Search of... Inca Treasure", u: "https://archive.org/download/InSearchOf16mm/In%20Search%20of...Inca%20Treasure%20%28480p_30fps_H264-128kbit_AAC%29.mp4"},
        {n: "Earth Was Made: San Andreas Fault", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.01of13.San.Andreas.Fault.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: The Deepest Place", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.02of13.The.Deepest.Place.on.Earth.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Krakatoa", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.03of13..Krakatoa.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Loch Ness", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.04of13.Lock.Ness.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: New York", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.05of13.New.York.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Driest Place On Earth", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.06of13.Driest.Place.On.Earth.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Great Lakes", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.07of13.Great.Lakes.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Yellowstone", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.08of13.Yellowstone.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Tsunami", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.09of13.Tsunami.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Asteroids", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.10of13.Asteroids.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Iceland", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.11of13.Iceland.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: Hawaii", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.12of13.Hawaii.XviD.AC3.MVGroup.org.mp4"},
        {n: "Earth Was Made: The Alps", u: EARTH_BASE_URL + "History.Ch.How.the.Earth.Was.Made.Complete.Season.1.13of13.The.Alps.XviD.AC3.MVGroup.org.mp4"},
        {n: "Project UFO S02E01", u: UFO_BASE_URL + "Project%20UFO%20S02E01%20-%20The%20Underwater%20Incident.mp4"},
        {n: "Project UFO S02E02", u: UFO_BASE_URL + "Project%20UFO%20S02E02%20-%20The%20Devilish%20Davidson%20Lights%20Incident.mp4"},
        {n: "Project UFO S02E03", u: UFO_BASE_URL + "Project%20UFO%20S02E03%20-%20The%20Pipeline%20Incident.mp4"},
        {n: "Project UFO S02E04", u: UFO_BASE_URL + "Project%20UFO%20S02E04%20-%20The%20Incident%20on%20the%20Cliffs.mp4"},
        {n: "Project UFO S02E05", u: UFO_BASE_URL + "Project%20UFO%20S02E05%20-%20The%20Believe%20It%20or%20Not%20Incident.mp4"},
        {n: "Project UFO S02E06", u: UFO_BASE_URL + "Project%20UFO%20S02E06%20-%20The%20Camouflage%20Incident.mp4"},
        {n: "Project UFO S02E07", u: UFO_BASE_URL + "Project%20UFO%20S02E07%20-%20The%20Island%20Incident.mp4"},
        {n: "Project UFO S02E08", u: UFO_BASE_URL + "Project%20UFO%20S02E08%20-%20The%20Superstition%20Mountain%20Incident.mp4"},
        {n: "Project UFO S02E09", u: UFO_BASE_URL + "Project%20UFO%20S02E09%20-%20The%20I-Man%20Incident.mp4"},
        {n: "Project UFO S02E10", u: UFO_BASE_URL + "Project%20UFO%20S02E10%20-%20The%20Scoutmaster%20Incident.mp4"},
        {n: "Project UFO S02E11", u: UFO_BASE_URL + "Project%20UFO%20S02E11%20-%20The%20Atlantic%20Queen%20Incident.mp4"},
        {n: "Project UFO S02E12", u: UFO_BASE_URL + "Project%20UFO%20S02E12%20-%20The%20Whitman%20Tower%20Incident.mp4"},
        {n: "Project UFO S02E13", u: UFO_BASE_URL + "Project%20UFO%20S02E13%20-%20The%20Wild%20Blue%20Yonder%20Incident.mp4"},
        // Bill Nye Season 5
        ...[
            "BNTSG S05E01 Forensics", "BNTSG S05E02 Space Exploration", "BNTSG S05E03 Genes", "BNTSG S05E04 Architecture", "BNTSG S05E05 Farming", "BNTSG S05E06 Life Cycles", "BNTSG S05E07 Do-It-Yourself Science", "BNTSG S05E08 Atoms & Molecules", "BNTSG S05E09 Ocean Exploration", "BNTSG S05E10 Lakes & Ponds", "BNTSG S05E11 Smell", "BNTSG S05E12 Caves", "BNTSG S05E13 Fluids", "BNTSG S05E14 Erosion", "BNTSG S05E15 Comets and Meteors", "BNTSG S05E16 Storms", "BNTSG S05E17 Measurement", "BNTSG S05E18 Patterns", "BNTSG S05E19 Science of Music", "BNTSG S05E20 Motion"
        ].map(NYE)
    ],

    D: [
        {n: "1A - The Power Of Dr. Octopus", u: SPIDER_BASE_URL + "1A%20-%20The%20Power%20Of%20Dr.%20Octopus.mp4"},
        {n: "1B - Sub-Zero For Spidey", u: SPIDER_BASE_URL + "1B%20-%20Sub-Zero%20For%20Spidey.mp4"},
        {n: "2A - Where Crawls The Lizard", u: SPIDER_BASE_URL + "2A%20-%20Where%20Crawls%20The%20Lizard.mp4"},
        {n: "2B - Electro The Human Lightning Bolt", u: SPIDER_BASE_URL + "2B%20-%20Electro%20The%20Human%20Lightning%20Bolt.mp4"},
        {n: "3 - The Menace Of Mysterio", u: SPIDER_BASE_URL + "3%20-%20The%20Menace%20Of%20Mysterio.mp4"},
        {n: "4A - The Sky Is Falling", u: SPIDER_BASE_URL + "4A%20-%20The%20Sky%20Is%20Falling.mp4"},
        {n: "4B - Captured By J. Jonah Jameson", u: SPIDER_BASE_URL + "4B%20-%20Captured%20By%20J.%20Jonah%20Jameson.mp4"},
        {n: "5A - Never Step On A Scorpion", u: SPIDER_BASE_URL + "5A%20-%20Never%20Step%20On%20A%20Scorpion.mp4"},
        {n: "5B - Sands Of Crime", u: SPIDER_BASE_URL + "5B%20-%20Sands%20Of%20Crime.mp4"},
        {n: "6A - Diet Of Destruction", u: SPIDER_BASE_URL + "6A%20-%20Diet%20Of%20Destruction.mp4"},
        {n: "6B - The Witching Hour", u: SPIDER_BASE_URL + "6B%20-%20The%20Witching%20Hour.mp4"},
        {n: "7A - Kilowatt Kaper", u: SPIDER_BASE_URL + "7A%20-%20Kilowatt%20Kaper.mp4"},
        {n: "7B - The Peril Of Parafino", u: SPIDER_BASE_URL + "7B%20-%20The%20Peril%20Of%20Parafino.mp4"},
        {n: "8 - Horn Of The Rhino", u: SPIDER_BASE_URL + "8%20-%20Horn%20Of%20The%20Rhino.mp4"},
        {n: "9A - The One-Eyed Idol", u: SPIDER_BASE_URL + "9A%20-%20The%20One-Eyed%20Idol.mp4"},
        {n: "9B - Fifth Avenue Phantom", u: SPIDER_BASE_URL + "9B%20-%20Fifth%20Avenue%20Phantom.mp4"},
        {n: "10A - The Revenge Of Dr. Magneto", u: SPIDER_BASE_URL + "10A%20-%20The%20Revenge%20Of%20Dr.%20Magneto.mp4"},
        {n: "10B - The Sinister Prime Minister", u: SPIDER_BASE_URL + "10B%20-%20The%20Sinister%20Prime%20Minister.mp4"},
        {n: "11A - The Night Of The Villains", u: SPIDER_BASE_URL + "11A%20-%20The%20Night%20Of%20The%20Villains.mp4"},
        {n: "11B - Here Comes Trubble", u: SPIDER_BASE_URL + "11B%20-%20Here%20Comes%20Trubble.mp4"},
        {n: "12A - Spider-Man Meets Doctor Noah Boddy", u: SPIDER_BASE_URL + "12A%20-%20Spider-Man%20Meets%20Doctor%20Noah%20Boddy.mp4"},
        {n: "12B - The Fantastic Fakir", u: SPIDER_BASE_URL + "12B%20-%20The%20Fantastic%20Fakir.mp4"},
        {n: "13A - Return Of The Flying Dutchman", u: SPIDER_BASE_URL + "13A%20-%20Return%20Of%20The%20Flying%20Dutchman.mp4"},
        {n: "13B - Farewell Performance", u: SPIDER_BASE_URL + "13B%20-%20Farewell%20Performance.mp4"},
        {n: "14A - The Golden Rhino", u: SPIDER_BASE_URL + "14A%20-%20The%20Golden%20Rhino.mp4"},
        {n: "14B - Blueprint For Crime", u: SPIDER_BASE_URL + "14B%20-%20Blueprint%20For%20Crime.mp4"},
        {n: "15A - The Spider And The Fly", u: SPIDER_BASE_URL + "15A%20-%20The%20Spider%20And%20The%20Fly.mp4"},
        {n: "15B - The Slippery Doctor Von Schlick", u: SPIDER_BASE_URL + "15B%20-%20The%20Slippery%20Doctor%20Von%20Schlick.mp4"},
        {n: "16A - The Vulture's Prey", u: SPIDER_BASE_URL + "16A%20-%20The%20Vulture%27s%20Prey.mp4"},
        {n: "16B - The Dark Terrors", u: SPIDER_BASE_URL + "16B%20-%20The%20Dark%20TTerrror.mp4"},
        {n: "17A - The Terrible Triumph Of Dr. Octopus", u: SPIDER_BASE_URL + "17A%20-%20The%20Terrible%20Triumph%20Of%20Dr.%20Octopus.mp4"},
        {n: "17B - Magic Malice", u: SPIDER_BASE_URL + "17B%20-%20Magic%20Malice.mp4"},
        {n: "18A - Fountain Of Terror", u: SPIDER_BASE_URL + "18A%20-%20Fountain%20Of%20Terror.mp4"},
        {n: "18B - Fiddler On The Loose", u: SPIDER_BASE_URL + "18B%20-%20Fiddler%20On%20The%20Loose.mp4"},
        {n: "19A - To Catch A Spider", u: SPIDER_BASE_URL + "19A%20-%20To%20Catch%20A%20Spider.mp4"},
        {n: "19B - Double Identity", u: SPIDER_BASE_URL + "19B%20-%20Double%20Identity.mp4"},
        {n: "20A - Sting Of The Scorpion", u: SPIDER_BASE_URL + "20A%20-%20Sting%20Of%20The%20Scorpion.mp4"},
        {n: "20B - Trick Or Treachery", u: SPIDER_BASE_URL + "20B%20-%20Trick%20Or%20Treachery.mp4"}
    ],

    E: [
        {n: "1 - The Origin Of Spiderman", u: SPIDER_S2_BASE_URL + "1%20-%20The%20Origin%20Of%20Spiderman.mp4"},
        {n: "2 - King Pinned", u: SPIDER_S2_BASE_URL + "2%20-%20King%20Pinned.mp4"},
        {n: "3 - Swing City", u: SPIDER_S2_BASE_URL + "3%20-%20Swing%20City.mp4"},
        {n: "4 - Criminals In The Clouds", u: SPIDER_S2_BASE_URL + "4%20-%20Criminals%20In%20The%20Clouds.mp4"},
        {n: "5 - Menace From The Bottom Of The World", u: SPIDER_S2_BASE_URL + "5%20-%20Menace%20From%20The%20Bottom%20Of%20The%20World.mp4"},
        {n: "6 - Diamond Dust", u: SPIDER_S2_BASE_URL + "6%20-%20Diamond%20Dust.mp4"},
        {n: "7 - Spiderman Battles The Molement", u: SPIDER_S2_BASE_URL + "7%20-%20Spiderman%20Battles%20The%20Molement.mp4"},
        {n: "8 - Phantom From The Depths Of Time", u: SPIDER_S2_BASE_URL + "8%20-%20Phantom%20From%20The%20Depths%20Of%20Time.mp4"},
        {n: "9 - The Evil Sorcerer", u: SPIDER_S2_BASE_URL + "9%20-%20The%20Evil%20Sorcerer.mp4"},
        {n: "10 - Vine", u: SPIDER_S2_BASE_URL + "10%20-%20Vine.mp4"},
        {n: "11 - Pardo Presents", u: SPIDER_S2_BASE_URL + "11%20-%20Pardo%20Presents.mp4"},
        {n: "12 - Cloud City Of Gold", u: SPIDER_S2_BASE_URL + "12%20-%20Cloud%20City%20Of%20Gold.mp4"},
        {n: "13 - Neptune's Nose Cone", u: SPIDER_S2_BASE_URL + "13%20-%20Neptune%27s%20Nose%20Cone.mp4"},
        {n: "14 - Home", u: SPIDER_S2_BASE_URL + "14%20-%20Home.mp4"},
        {n: "15 - Blotto", u: SPIDER_S2_BASE_URL + "15%20-%20Blotto.mp4"},
        {n: "16 - Thunder Rumble", u: SPIDER_S2_BASE_URL + "16%20-%20Thunder%20Rumble.mp4"},
        {n: "17 - Spiderman Meets Skyboy", u: SPIDER_S2_BASE_URL + "17%20-%20Spiderman%20Meets%20Skyboy.mp4"},
        {n: "18 - Cold Storage", u: SPIDER_S2_BASE_URL + "18%20-%20Cold%20Storage.mp4"},
        {n: "19 - To Cage A Spider", u: SPIDER_S2_BASE_URL + "19%20-%20To%20Cage%20A%20Spider.mp4"}
    ],

    F: [
        {n: "1A - The Winged Thing", u: SPIDER_S3_BASE_URL + "1A%20-%20The%20Winged%20Thing.mp4"},
        {n: "1B - Conner's Reptiles", u: SPIDER_S3_BASE_URL + "1B%20-%20Conner%27s%20Reptiles.mp4"},
        {n: "2A - Trouble With Snow", u: SPIDER_S3_BASE_URL + "2A%20-%20Trouble%20With%20Snow.mp4"},
        {n: "2B - Spiderman Vs. Desperado", u: SPIDER_S3_BASE_URL + "2B%20-%20Spiderman%20Vs.%20Desperado.mp4"},
        {n: "3A - Sky Harbor", u: SPIDER_S3_BASE_URL + "3A%20-%20Sky%20Harbor.mp4"},
        {n: "3B - The Big Brainwasher", u: SPIDER_S3_BASE_URL + "3B%20-%20The%20Big%20Brainwasher.mp4"},
        {n: "4A - The Vanishing Doctor Vespasian", u: SPIDER_S3_BASE_URL + "4A%20-%20The%20Vanishing%20Doctor%20Vespasian.mp4"},
        {n: "4B - The Scourge Of The Scarf", u: SPIDER_S3_BASE_URL + "4B%20-%20The%20Scourge%20Of%20The%20Scarf.mp4"},
        {n: "5A - Super Swami", u: SPIDER_S3_BASE_URL + "5A%20-%20Super%20Swami.mp4"},
        {n: "5B - The Birth Of Micro Man", u: SPIDER_S3_BASE_URL + "5B%20-%20The%20Birth%20Of%20Micro%20Man.mp4"},
        {n: "6A - Knight Must Fall", u: SPIDER_S3_BASE_URL + "6A%20-%20Knight%20Must%20Fall.mp4"},
        {n: "6B - The Devious Dr. Dumpty", u: SPIDER_S3_BASE_URL + "6B%20-%20The%20Devious%20Dr.%20Dumpty.mp4"},
        {n: "7 - Up From Nowhere", u: SPIDER_S3_BASE_URL + "7%20-%20Up%20From%20Nowhere.mp4"},
        {n: "8 - Rollarama", u: SPIDER_S3_BASE_URL + "8%20-%20Rollarama.mp4"},
        {n: "9A - Rhino", u: SPIDER_S3_BASE_URL + "9A%20-%20Rhino.mp4"},
        {n: "9B - The Madness Of Mysterio", u: SPIDER_S3_BASE_URL + "9B%20-%20The%20Madness%20Of%20Mysterio.mp4"},
        {n: "10 - Revolt In The Fifth Dimension", u: SPIDER_S3_BASE_URL + "10%20-%20Revolt%20In%20The%20Fifth%20Dimension.mp4"},
        {n: "11 - Specialists And Slaves", u: SPIDER_S3_BASE_URL + "11%20-%20Specialists%20And%20Slaves.mp4"},
        {n: "12 - Down To Earth", u: SPIDER_S3_BASE_URL + "12%20-%20Down%20To%20Earth.mp4"},
        {n: "13 - Trip To Tomorrow", u: SPIDER_S3_BASE_URL + "13%20-%20Trip%20To%20Tomorrow.mp4"}
    ],

    G: [], // Preserved exclusively for Movies
    H: [], // Preserved exclusively for Movies
    
    I: [
        { n: "Rudolph the Red-Nosed Reindeer", u: "https://archive.org/download/rudolph_202111/RUDOLPH.mp4" }
    ],

    J: []  // Preserved exclusively for Movies
};

// Keep true multipart television programs together before weaving.
function buildLegacyBlocks(items) {
    const blocks = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const next = items[i + 1];

        // Spider-Man 1A/1B, 2A/2B
        const aPart = item.n.match(/^(\d+)A\s+-/);
        const bPart = next ? next.n.match(/^(\d+)B\s+-/) : null;

        if (aPart && bPart && aPart[1] === bPart[1]) {
            blocks.push([item, next]);
            i++;
            continue;
        }

        // Star Trek: The Menagerie Part I/II.
        if (item.n.includes("The Menagerie - Part I") && next && next.n.includes("The Menagerie - Part II")) {
            blocks.push([item, next]);
            i++;
            continue;
        }

        blocks.push([item]);
    }
    return blocks;
}

// Recognize movie franchises to keep sequels together.
function movieFamilyKey(name) {
    const rules = [
        [/^Star Wars Episode /, "STAR_WARS"], [/^Halo /, "HALO"], [/^Tron /, "TRON"],
        [/^Spider-man /, "SPIDER_MAN"], [/^Iron Man/, "IRON_MAN"], [/^Venom/, "VENOM"], 
        [/^The Incredibles/, "INCREDIBLES"], [/^Spy Kids/, "SPY_KIDS"],
        [/^Jurassic Park/, "JURASSIC"], [/^Jurassic World/, "JURASSIC"], [/^Godzilla/, "GODZILLA"], 
        [/^The Land Before Time/, "LAND_BEFORE_TIME"], [/^Ice Age/, "ICE_AGE"],
        [/^Peter Pan/, "PETER_PAN"], [/^(101|102) Dalmatians/, "DALMATIANS"], [/^Aladdin/, "ALADDIN"], 
        [/^Brother Bear/, "BROTHER_BEAR"], [/^The Lion King/, "LION_KING"], [/^Mulan/, "MULAN"], 
        [/^The Little Mermaid/, "LITTLE_MERMAID"], [/^The Jungle Book/, "JUNGLE_BOOK"], 
        [/^The Brave Little Toaster/, "BRAVE_TOASTER"], [/^Tarzan/, "TARZAN"],
        [/^Toy Story/, "TOY_STORY"], [/^Finding Nemo/, "NEMO"], [/^Cars /, "CARS"], 
        [/^Cars \(/, "CARS"], [/^Shrek/, "SHREK"], [/^Despicable Me/, "DESPICABLE"], 
        [/^Madagascar/, "MADAGASCAR"], [/^Monsters (Inc|University)/, "MONSTERS"],
        [/^The SpongeBob SquarePants Movie/, "SPONGEBOB"], [/^Scooby-Doo/, "SCOOBY"], 
        [/^Kung Fu Panda/, "KUNG_FU_PANDA"], [/^Lilo & Stitch/, "LILO_STITCH"], [/^Rugrats /, "RUGRATS"],
        [/(The Love Bug|Herbie)/, "HERBIE"], [/^Are We There Yet/, "ARE_WE_THERE_YET"], 
        [/^Alvin And The Chipmunks/, "ALVIN"], [/^Honey, /, "HONEY_SHRUNK"], [/^Rush Hour/, "RUSH_HOUR"],
        [/^Pokemon Movie/, "POKEMON"], [/^Yu-Gi-Oh! The Movie/, "YUGIOH"],
        [/^Scary Godmother/, "SCARY_GODMOTHER"], [/^How To Train Your Dragon/, "DRAGON"], 
        [/^Wreck-It Ralph/, "WRECK_IT_RALPH"], [/^Atlantis/, "ATLANTIS"], 
        [/^The Emperor's New Groove/, "EMPEROR"], [/^Chicken Run/, "CHICKEN_RUN"], 
        [/^Moana/, "MOANA"], [/^Ben 10/, "BEN10"], [/^Stuart Little/, "STUART_LITTLE"]
    ];

    for (const [pattern, key] of rules) {
        if (pattern.test(name)) return key;
    }
    return "SINGLE::" + name;
}

// Build runs of no more than three related movies.
function buildMovieBlocks(names, maxRun = 3) {
    const blocks = [];
    let run = [];
    let currentKey = null;

    const flush = () => {
        while (run.length) {
            blocks.push(run.splice(0, maxRun).map(M));
        }
    };

    for (const name of names) {
        const key = movieFamilyKey(name);
        if (currentKey !== null && key !== currentKey) flush();
        if (key !== currentKey) currentKey = key;
        run.push(name);
    }
    flush();
    return blocks;
}

// --- MOVIE DATABASE ---
const MOVIES_BY_THEME = {
    A: [
        "Star Wars Episode 1 The Phantom Menace", "Star Wars Episode 2 Attack Of The Clones", "Star Wars Episode 2.1 The Clone Wars", "Star Wars Episode 3 Revenge Of The Sith", "Star Wars Episode 4 A New Hope", "Star Wars Episode 5 The Empire Strikes Back", "Star Wars Episode 6 Return of the Jedi", "Star Wars Episode 7 The Force Awakens", "Star Wars Episode 8 The Last Jedi", "Star Wars Episode 9 The Rise of Skywalker", "Halo 4 Forward Unto Dawn", "Halo The Fall Of Reach", "E.T The Extra Terrestrial", "Astro Boy", "Astro Kid", "Lightyear", "WALL-E", "Jimmy Neutron Boy Genius", "Mars Needs Moms", "Zathura A Space Adventure", "Tron (1982)", "Tron (2010) Tron Legacy", "Tron (2025) Tron Ares", "Buzz Lightyear of Star Command The Adventure Begins", "Red vs Blue Restoration", "Robots", "Monsters Vs. Aliens"
    ],
    B: [
        "Spider-man (2002)", "Spider-man 2", "Spider-man 3", "Spider-man 4 The Amazing Spider-man", "Spider-man 5 The Amazing Spider-man 2", "Spider-man 6 Homecoming", "Spider-man 7 Far From Home", "Spider-man 8 No Way Home", "Spider-man Into The Spiderverse", "Iron Man (2008)", "Iron Man 2", "Iron Man 3", "Venom (2018)", "Venom Let There Be Carnage", "Venom The Last Dance", "The Incredibles (2004)", "The Incredibles 2", "Big Hero 6", "Next Gen (2018)", "Spy Kids 1", "Spy Kids 2 Island of Lost Dreams", "Spy Kids 3 Game Over", "Spy Kids 4 All the Time in the World"
    ],
    C: [
        "Jurassic Park (1993)", "Jurassic Park 2 The Lost World", "Jurassic Park 3", "Jurassic World (2015)", "Jurassic World 2 Fallen Kingdom", "Jurassic World 3 Dominion", "Jurassic World 4 Rebirth", "Godzilla (1998)", "Godzilla (2014)", "Godzilla King of The Monsters", "Godzilla Vs Kong (2021)", "Godzilla Vs Kong 2 The New Empire", "Dinosaur", "Dino Time", "The Good Dinosaur", "Were Back A Dinosaurs Story", "Ice Age (2002)", "Ice Age 2 The Meltdown", "Ice Age 3 Dawn of the Dinosaurs", "Ice Age 4 Continental Drift", "Ice Age 5 Collision Course", "Ice Age 6 Adventures of Buck Wild"
    ],
    D: [
        "Peter Pan (1953)", "Peter Pan 2 Return To Neverland", "101 Dalmatians", "102 Dalmatians", "Aladdin (1992)", "Aladdin 2 The Return Of Jafar", "Aladdin 3 Aladdin And The King Of Thieves", "Brother Bear (2003)", "Brother Bear 2", "The Lion King (1994)", "The Lion King 3", "Mulan (1998)", "Mulan II", "The Little Mermaid (1989)", "The Little Mermaid 2 Return To The Sea", "The Jungle Book (1967)", "The Jungle Book 2", "The Brave Little Toaster (1987)", "The Brave Little Toaster 2 The Brave Little Toaster To The Rescue", "The Brave Little Toaster 3 The Brave Little Toaster Goes To Mars", "The Wizard of Oz", "Tarzan (1999)", "Tarzan & Jane", "James And The Giant Peach", "Lady and The Trump 2 Scamp's Adventures"
    ],
    E: [
        "Toy Story (1995)", "Toy Story 2", "Toy Story 3", "Toy Story 4", "Finding Nemo (2003)", "Finding Nemo 2 Finding Dory", "Cars (2006)", "Cars 2", "Cars 3", "Shrek (2001)", "Shrek 2", "Shrek 3 Shrek the Third", "Shrek 4 Forever and After", "Despicable Me (2010)", "Despicable Me 2", "Despicable Me 3", "Madagascar (2005)", "Madagascar 2 Escape To Africa", "Madagascar 3 Europe's Most Wanted", "Up", "Coco", "Ratatouille", "Monsters Inc", "Monsters University"
    ],
    F: [
        "The SpongeBob SquarePants Movie 1", "The SpongeBob SquarePants Movie 2 Sponge Out of Water", "The SpongeBob SquarePants Movie 3 Sponge On The Run", "The SpongeBob SquarePants Movie 4 Saving Bikini Bottom The Sandy Cheeks Movie", "The SpongeBob SquarePants Movie 5 Plankton The Movie", "Scooby-Doo (1988) Scooby-Doo! and the Reluctant Werewolf", "Scooby-Doo (1998) Scooby-Doo On Zombie Island", "Scooby-Doo (1999) Scooby-Doo and The Witch's Ghost", "Scooby-Doo (2000) Scooby-Doo and The Alien Invaders", "Scooby-Doo (2001) Scooby-Doo and the Cyber Chase", "Scooby-Doo (2002)", "Scooby-Doo 2 Monsters Unleashed", "Kung Fu Panda (2008)", "Kung Fu Panda 2", "Kung Fu Panda 3", "Kung Fu Panda 4", "Lilo & Stitch (2002)", "Lilo & Stitch 2 Stitch Has A Glitch", "Lilo & Stitch 3 Stitch The Movie", "Lilo & Stitch 4 Leroy & Stitch", "Rugrats Go Wild", "Rugrats In Paris The Movie", "Ed, Edd n Eddy's Big Picture Show", "Codename Kids Next Door Operation Z.E.R.O", "The Powerpuff Girls Movie", "Phineas And Ferb The Movie Across The 2nd Dimension", "Recess School's Out", "The Wild Thornberrys Movie", "Billy & Mandys Big Boogey Adventure", "Little Einsteins Movie Rocket's Firebird Rescue"
    ],
    G: [
        "(1968) The Love Bug", "(1974) Herbie Rides Again", "(1977) Herbie Goes To Monte Carlo", "(1980) Herbie Goes Bananas", "(1997) The Love Bug", "(2005) Herbie Fully Loaded", "Are We There Yet (2005)", "Are We There Yet 2 Are We Done Yet", "Alvin And The Chipmunks (2007)", "Alvin And The Chipmunks 2 The Squeakquel", "Alvin And The Chipmunks 3 Chipwrecked", "Honey, I Shrunk The Kids!", "Honey, We Shrunk Ourselves!", "Jumanji", "Twister", "Titanic (1997)", "The Day After Tomarrow", "Into The Storm", "Rush Hour 1", "Rush Hour 2", "Rush Hour 3", "Who Framed Roger Rabbit"
    ],
    H: [
        "Pokemon Movie 01 Mewtwo Strikes Back", "Pokemon Movie 02 The Power of One", "Pokemon Movie 03 Spell of the Unknown", "Pokemon Movie 03.2 Mewtwo Returns", "Pokemon Movie 04 Pokemon 4Ever Celebi Voice of the Forest", "Pokemon Movie 05 Heroes Latios & Latias", "Pokemon Movie 06 Jirachi Wish Maker", "Pokemon Movie 07 Destiny Deoxys", "Pokemon Movie 08 Lucario And The Mystery Of Mew", "Pokemon Movie 08.2 The Mastermind of Mirage Pokemon", "Pokemon Movie 09 Pokemon Ranger and the Temple of the Sea", "Pokemon Movie 10 The Rise Of Darkrai", "Pokemon Movie 11 Giratina and the Sky Warrior", "Pokemon Movie 12 Arceus and The Jewel of Life", "Pokemon Movie 13 Zoroark - Master of Illusions", "Pokemon Movie 14 White Victini and Zekrom", "Pokemon Movie 14. 2 Black Victini and Reshiram", "Pokemon Movie 15 Kyurem vs. the Sword of Justice", "Pokemon Movie 16 Genesect and The Legend Awakened", "Pokemon Movie 17 Diancie And The Cocoon Of Destruction", "Pokemon Movie 18 Hoopa and the Clash of Ages", "Pokemon Movie 19 Volcanion and the Mechanical Marvel", "Pokemon Movie 20 I Choose You!", "Pokemon Movie 21 The Power of Us", "Pokemon Movie 22 Mewtwo Strikes Back Evolution", "Pokemon Movie 23 Secrets of the Jungle", "Yu-Gi-Oh! The Movie (2004) Pyramid Of Light", "Yu-Gi-Oh! The Movie 2 Bonds Beyond Time", "The LEGO Ninjago Movie", "Elio"
    ],
    I: [
        "The Nightmare Before Christmas", "Coraline", "Monster House", "Little Shop Of Horrors (1986)", "Scary Godmother Halloween Spooktakular", "Scary Godmother Revenge Of Jimmy", "Underfist Halloween Bash", "Eight Legged Freaks", "Big Ass Spider", "World War Z", "How The Grinch Stole Christmas", "Grandma Got Run Over By a Reindeer", "National Lampoon's Christmas Vacation", "The Land Before Time 01", "The Land Before Time 02 The Great Valley Adventure", "The Land Before Time 03 The Time Of The Great Giving", "The Land Before Time 04 Journey Through The Mists", "The Land Before Time 05 The Mysterious Island", "The Land Before Time 06 The Secret Of Saurus Rock", "The Land Before Time 07 The Stone Of Cold Fire", "The Land Before Time 08 The Big Freeze", "The Land Before Time 09 Journey To Big Water", "The Land Before Time 10 The Great Longneck Migration", "The Land Before Time 11 Invasion of the Tinysauruses", "The Land Before Time 12 The Great Day Of The Flyers", "The Land Before Time 13 The Wisdom Of Friends", "The Land Before Time 14 Journey Of The Brave"
    ],
    J: [
        "How To Train Your Dragon (2010)", "How To Train Your Dragon 2", "How To Train Your Dragon 3 The Hidden World", "Ready Player One", "Wreck-It Ralph (2012)", "Wreck-It Ralph 2 Ralph Break The Internet", "A Bug's Life", "Bee Movie", "Over the Hedge", "Flushed Away", "Shark Tale", "Atlantis (2001) The Lost Empire", "Atlantis 2 Milo's Return", "The Iron Giant", "Treasure Planet", "The Road To El Dorado", "The Emperor's New Groove (2000)", "The Emperor's New Groove 2 Kronks New Groove", "The Wild Robot", "The Wild", "The Adventures Of Sharkboy And Lavagirl", "The Adventures of Elmo in Grouchland", "The Ant Bully", "The Banana Splits in Hocus Pocus Park (1972)", "The Boss Baby (2017)", "The Cat In The Hat", "The Croods (2013)", "The Pagemaster", "The Polar Express", "The Princess and the Frog", "Underdog", "ICarly Movie iGo to Japan", "Sid the Science Kid The Movie", "Blue's Big Musical Movie", "Blues Big City Adventure (2022)", "Barney's Great Adventure", "Doug's 1st Movie", "Chicken Little", "Chicken Run (2000)", "Chicken Run Dawn of The Nugget", "Meet The Robinsons", "Moana (2016)", "Moana 2", "Osmosis Jones", "Surf'sUp", "Ben 10 (2007) Secret of the Omnitrix", "Ben 10 2 Race Against Time", "Ben 10 Destroy All Aliens", "9", "Stuart Little (1999)", "Stuart Little 2", "Stuart Little 3 Call of The Wild"
    ]
};

// --- FINAL WEAVING ENGINE ---
// Maps strictly: LEGACY A + MOVIE A -> Channel A.

function weaveProgramming(shortBlocks, movieBlocks) {
    const output = [];
    let shortIndex = 0;
    let movieIndex = 0;

    while (shortIndex < shortBlocks.length || movieIndex < movieBlocks.length) {
        if (shortIndex < shortBlocks.length) {
            output.push(...shortBlocks[shortIndex++]);
        }
        if (movieIndex < movieBlocks.length) {
            output.push(...movieBlocks[movieIndex++]);
        }
    }
    return output;
}

const keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

keys.forEach((key, index) => {
    // Build legacy blocks for this specific channel
    const channelLegacyBlocks = buildLegacyBlocks(LEGACY_BY_THEME[key]);
    
    // Build movie blocks for this specific channel
    const channelMovieBlocks = buildMovieBlocks(MOVIES_BY_THEME[key], 3);
    
    // Weave them together exactly on this channel
    categories[index].content.push(
        ...weaveProgramming(channelLegacyBlocks, channelMovieBlocks)
    );
});
