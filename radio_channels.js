// ============================================================
// CLINE CLASSIC TV - GENERATED CATALOG LOADER
// V169 REFINED MEGA ARCHIVE EXPANSION
// ============================================================
//
// index.html already loads the core catalog, Star Trek harvests,
// Hitchcock, Buck Rogers, Man From Atlantis and X Minus One before
// this file.  Keep the large refined expansion modular by loading
// its generated data here, then run programming_registry.js last.
//
// These are parser-inserted scripts: the final registry executes
// only after the Schoolhouse and refined data scripts have loaded.
// ============================================================

const GENERATED_CATALOG_SCRIPTS = [
    "schoolhouse_rock_catalog.js",
    "refined_catalog_utils.js",
    "refined_data_01.js",
    "refined_data_02.js",
    "refined_data_03.js",
    "refined_data_04.js",
    "refined_data_05.js",
    "refined_data_06.js",
    "refined_data_07.js",
    "refined_data_08.js",
    "refined_data_09.js",
    "refined_data_10.js",
    "refined_data_11.js",
    "refined_data_12.js",
    "refined_data_13.js",
    "refined_data_14.js",
    "refined_data_15.js",
    "refined_data_16.js",
    "refined_data_17.js",
    "refined_data_18.js",
    "refined_data_19.js",
    "refined_data_20.js",
    "refined_data_21.js",
    "refined_data_22.js",
    "refined_data_23.js",
    "refined_data_24.js",
    "programming_registry.js"
];

for (const src of GENERATED_CATALOG_SCRIPTS) {
    document.write(`<script src="${src}"><\/script>`);
}
