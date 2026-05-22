// ── Island & area metadata ────────────────────────────────────────────────────
// u_age_sex_occ / u_all4 are % unique from synthetic population model
// These are valid outputs from build_attack_lookup.py and should be kept
// even when the AttackSim is in "published census only" mode — they
// represent pre-computed research findings, not live query results.

export const ISLAND_KEYS = ["iom", "guernsey", "jersey"];

export const AGE_BANDS = [
  "0-4","5-9","10-14","15-19","20-24","25-29",
  "30-34","35-39","40-44","45-49","50-54",
  "55-59","60-64","65-69","70-74","75-79","80-84","85+"
];

export const OCCUPATIONS = [
  "Not employed","Managers","Professional","Associate Prof",
  "Admin/Secretarial","Skilled Trades","Caring/Leisure",
  "Sales/CS","Process/Plant","Elementary"
];

export const ISLANDS = {
  iom: {
    name: "Isle of Man",
    population: 84069,
    color: "#3b82f6",
    censusYear: 2021,
    areas: [
      { id:13, name:"Bride",        population:359   },
      { id:24, name:"Santon",       population:749   },
      { id:15, name:"Jurby",        population:780   },
      { id:20, name:"Maughold",     population:952   },
      { id:11, name:"Ballaugh",     population:1041  },
      { id:14, name:"German",       population:1056  },
      { id:16, name:"Lezayre",      population:1230  },
      { id:9,  name:"Andreas",      population:1400  },
      { id:22, name:"Patrick",      population:1487  },
      { id:21, name:"Michael",      population:1522  },
      { id:17, name:"Lonan",        population:1647  },
      { id:7,  name:"Laxey",        population:1656  },
      { id:23, name:"Rushen",       population:1661  },
      { id:10, name:"Arbory",       population:1899  },
      { id:6,  name:"Port St Mary", population:1989  },
      { id:19, name:"Marown",       population:2220  },
      { id:18, name:"Malew",        population:2367  },
      { id:4,  name:"Castletown",   population:3206  },
      { id:12, name:"Braddan",      population:3404  },
      { id:5,  name:"Port Erin",    population:3730  },
      { id:3,  name:"Peel",         population:5710  },
      { id:2,  name:"Ramsey",       population:8288  },
      { id:8,  name:"Onchan",       population:9039  },
      { id:1,  name:"Douglas",      population:26677 },
    ],
    // % unique from synthetic model — pre-computed research findings
    uniqueness: {
      "3qi": { field:"u_age_sex",     label:"Age + Sex" },
      "4qi": { field:"u_age_sex_occ", label:"Age + Sex + Occupation" },
      "5qi": { field:"u_all4",        label:"All 5 QIs" },
    },
    areaStats: {
      "Bride":        { u_age_sex:0.0, u_age_sex_occ:18.66, u_all4:49.0  },
      "Santon":       { u_age_sex:0.0, u_age_sex_occ:7.21,  u_all4:40.7  },
      "Jurby":        { u_age_sex:0.0, u_age_sex_occ:6.28,  u_all4:35.9  },
      "Maughold":     { u_age_sex:0.0, u_age_sex_occ:5.78,  u_all4:29.4  },
      "Ballaugh":     { u_age_sex:0.0, u_age_sex_occ:5.76,  u_all4:25.9  },
      "German":       { u_age_sex:0.0, u_age_sex_occ:5.77,  u_all4:30.3  },
      "Lezayre":      { u_age_sex:0.0, u_age_sex_occ:4.47,  u_all4:25.3  },
      "Andreas":      { u_age_sex:0.0, u_age_sex_occ:3.36,  u_all4:23.6  },
      "Patrick":      { u_age_sex:0.0, u_age_sex_occ:2.89,  u_all4:23.3  },
      "Michael":      { u_age_sex:0.0, u_age_sex_occ:2.89,  u_all4:23.5  },
      "Lonan":        { u_age_sex:0.0, u_age_sex_occ:2.43,  u_all4:21.7  },
      "Laxey":        { u_age_sex:0.0, u_age_sex_occ:2.42,  u_all4:22.0  },
      "Rushen":       { u_age_sex:0.0, u_age_sex_occ:2.59,  u_all4:22.5  },
      "Arbory":       { u_age_sex:0.0, u_age_sex_occ:2.21,  u_all4:18.9  },
      "Port St Mary": { u_age_sex:0.0, u_age_sex_occ:2.11,  u_all4:18.9  },
      "Marown":       { u_age_sex:0.0, u_age_sex_occ:1.80,  u_all4:16.9  },
      "Malew":        { u_age_sex:0.0, u_age_sex_occ:1.31,  u_all4:15.2  },
      "Castletown":   { u_age_sex:0.0, u_age_sex_occ:0.93,  u_all4:11.0  },
      "Braddan":      { u_age_sex:0.0, u_age_sex_occ:1.09,  u_all4:10.0  },
      "Port Erin":    { u_age_sex:0.0, u_age_sex_occ:0.83,  u_all4:10.2  },
      "Peel":         { u_age_sex:0.0, u_age_sex_occ:0.49,  u_all4:5.3   },
      "Ramsey":       { u_age_sex:0.0, u_age_sex_occ:0.23,  u_all4:3.9   },
      "Onchan":       { u_age_sex:0.0, u_age_sex_occ:0.27,  u_all4:3.3   },
      "Douglas":      { u_age_sex:0.0, u_age_sex_occ:0.08,  u_all4:0.7   },
    },
    k_profiles: {
      "3qi":[100,100,100,99.99,99.97,99.95,99.92,99.87,99.84,99.80,99.75,99.68,99.64,99.59,99.39,99.29,99.13,98.85,98.66,98.55],
      "4qi":[100,98.83,97.19,95.44,93.57,91.48,89.54,87.61,85.77,83.89,82.16,80.35,78.80,77.20,75.74,74.33,72.93,71.59,70.28,69.01],
      "5qi":[100,90.82,81.93,73.33,65.64,58.85,52.72,47.27,42.61,38.46,34.76,31.56,28.81,26.37,24.26,22.37,20.69,19.22,17.90,16.73],
    }
  },

  guernsey: {
    name: "Guernsey",
    population: 63448,
    color: "#10b981",
    censusYear: 2021,
    areas: [
      { id:11, name:"Herm/Jethou",       population:85    },
      { id:10, name:"Torteval",          population:1033  },
      { id:8,  name:"Forest",            population:1564  },
      { id:9,  name:"St Pierre du Bois", population:2077  },
      { id:7,  name:"St Andrew",         population:2372  },
      { id:6,  name:"St Saviour",        population:2840  },
      { id:5,  name:"St Martin",         population:6685  },
      { id:4,  name:"Castel",            population:8924  },
      { id:2,  name:"St Sampson",        population:9042  },
      { id:3,  name:"Vale",              population:9595  },
      { id:1,  name:"St Peter Port",     population:19231 },
    ],
    areaStats: {
      "Herm/Jethou":       { u_age_sex:0.0, u_age_sex_occ:50.59, u_all4:85.9 },
      "Torteval":          { u_age_sex:0.0, u_age_sex_occ:3.97,  u_all4:29.3 },
      "Forest":            { u_age_sex:0.0, u_age_sex_occ:1.79,  u_all4:19.8 },
      "St Pierre du Bois": { u_age_sex:0.0, u_age_sex_occ:1.59,  u_all4:16.9 },
      "St Andrew":         { u_age_sex:0.0, u_age_sex_occ:1.52,  u_all4:13.9 },
      "St Saviour":        { u_age_sex:0.0, u_age_sex_occ:0.63,  u_all4:10.9 },
      "St Martin":         { u_age_sex:0.0, u_age_sex_occ:0.28,  u_all4:4.3  },
      "Castel":            { u_age_sex:0.0, u_age_sex_occ:0.12,  u_all4:3.0  },
      "St Sampson":        { u_age_sex:0.0, u_age_sex_occ:0.18,  u_all4:2.6  },
      "Vale":              { u_age_sex:0.0, u_age_sex_occ:0.17,  u_all4:2.5  },
      "St Peter Port":     { u_age_sex:0.0, u_age_sex_occ:0.10,  u_all4:0.8  },
    },
    k_profiles: {
      "3qi":[100,100,100,100,100,100,100,100,99.99,99.99,99.98,99.97,99.97,99.96,99.94,99.93,99.91,99.88,99.87,99.85],
      "4qi":[100,99.56,98.96,98.30,97.37,96.55,95.50,94.60,93.43,92.36,91.68,90.78,89.93,88.89,88.03,87.20,86.42,85.72,84.93,84.12],
      "5qi":[100,95.49,90.58,85.82,81.28,77.02,73.02,69.29,65.88,62.72,59.83,57.21,54.84,52.69,50.72,49.02,47.44,46.04,44.75,43.59],
    }
  },

  jersey: {
    name: "Jersey",
    population: 109417,
    color: "#f59e0b",
    censusYear: 2021,
    areas: [
      { id:8,  name:"St Mary",      population:2478  },
      { id:5,  name:"St John",      population:3581  },
      { id:12, name:"St Martin",    population:3959  },
      { id:1,  name:"Grouville",    population:5401  },
      { id:7,  name:"Trinity",      population:6031  },
      { id:9,  name:"St Ouen",      population:6227  },
      { id:10, name:"St Peter",     population:6639  },
      { id:6,  name:"St Lawrence",  population:6815  },
      { id:3,  name:"St Clement",   population:9925  },
      { id:2,  name:"St Brelade",   population:11012 },
      { id:11, name:"St Saviour",   population:12703 },
      { id:4,  name:"St Helier",    population:34646 },
    ],
    areaStats: {
      "St Mary":     { u_age_sex:0.0, u_age_sex_occ:1.37, u_all4:13.64 },
      "St John":     { u_age_sex:0.0, u_age_sex_occ:1.01, u_all4:10.22 },
      "St Martin":   { u_age_sex:0.0, u_age_sex_occ:0.76, u_all4:8.94  },
      "Grouville":   { u_age_sex:0.0, u_age_sex_occ:0.39, u_all4:6.04  },
      "Trinity":     { u_age_sex:0.0, u_age_sex_occ:0.45, u_all4:5.36  },
      "St Ouen":     { u_age_sex:0.0, u_age_sex_occ:0.40, u_all4:5.32  },
      "St Peter":    { u_age_sex:0.0, u_age_sex_occ:0.30, u_all4:4.79  },
      "St Lawrence": { u_age_sex:0.0, u_age_sex_occ:0.35, u_all4:4.67  },
      "St Clement":  { u_age_sex:0.0, u_age_sex_occ:0.19, u_all4:3.12  },
      "St Brelade":  { u_age_sex:0.0, u_age_sex_occ:0.10, u_all4:2.44  },
      "St Saviour":  { u_age_sex:0.0, u_age_sex_occ:0.07, u_all4:2.15  },
      "St Helier":   { u_age_sex:0.0, u_age_sex_occ:0.02, u_all4:0.49  },
    },
    k_profiles: {
      "3qi":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],
      "4qi":[100,99.76,99.39,98.82,98.24,97.52,96.80,96.01,95.35,94.69,93.87,93.08,92.28,91.42,90.58,89.90,88.99,87.92,87.26,86.62],
      "5qi":[100,96.62,92.46,88.40,84.65,81.28,77.83,74.85,72.12,69.42,67.01,64.97,62.94,61.04,59.35,57.87,56.38,54.78,53.07,51.51],
    }
  }
};

// Island comparison data for overview chart (synthetic model outputs)
export const ISLAND_COMPARISON = [
  { label:"Area + Sex",        n_qi:2, iom:0.00, guernsey:0.00, jersey:0.00 },
  { label:"Area + Age",        n_qi:2, iom:0.00, guernsey:0.00, jersey:0.00 },
  { label:"Area + Age + Sex",  n_qi:3, iom:0.00, guernsey:0.00, jersey:0.00 },
  { label:"+ Occupation",      n_qi:4, iom:1.17, guernsey:0.44, jersey:0.24 },
  { label:"+ HH Size",         n_qi:4, iom:0.48, guernsey:0.17, jersey:0.01 },
  { label:"All 5 QIs",         n_qi:5, iom:9.18, guernsey:4.51, jersey:3.38 },
];

// ── QI definitions ────────────────────────────────────────────────────────────
// Each QI has:
//   id          — used as key throughout
//   label       — display name
//   requiresAdditionalData — if true, greyed out in "published only" mode
//   source      — shown in attack chain steps
//   censusTable — exact table reference (published QIs only)

export const QI_DEFINITIONS = {
  area: {
    id: "area",
    label: "Area / Parish",
    requiresAdditionalData: false,
    source: "Published census geography distributions",
    censusTable: "IoM 2021 Census Part I, Table 2.4",
  },
  age: {
    id: "age",
    label: "Age Band",
    requiresAdditionalData: false,
    source: "Published census age-band distributions",
    censusTable: "IoM 2021 Census Part I, Tables 2.1–2.3",
  },
  sex: {
    id: "sex",
    label: "Sex",
    requiresAdditionalData: false,
    source: "Published census sex distributions",
    censusTable: "IoM 2021 Census Part I, Tables 2.2–2.3",
  },
  occupation: {
    id: "occupation",
    label: "Occupation",
    requiresAdditionalData: true,
    source: "Occupation model — synthetic population derived from census distributions",
    censusTable: null,
    additionalDataNote: "Area × occupation cross-tabulation not published in census. Count derived from synthetic population model calibrated to Part II Tables 1.4–1.10.",
  },
  hh_size: {
    id: "hh_size",
    label: "Household Size",
    requiresAdditionalData: true,
    source: "Household size model — synthetic population derived from census distributions",
    censusTable: null,
    additionalDataNote: "Area × age × household size cross-tabulation not published in census. Count derived from synthetic population model calibrated to Part II Table 3.2.",
  },
  manx_language: {
    id: "manx_language",
    label: "Manx Speaker",
    requiresAdditionalData: false,
    iomOnly: true,
    source: "Published census language distributions",
    censusTable: "IoM 2021 Census Part I, Table 2.13",
    description: "Filters to residents with any Manx language ability (speak, read, or write). Only available for IoM.",
  },
  ethnicity_nonwhite: {
    id: "ethnicity_nonwhite",
    label: "Non-White Ethnicity",
    requiresAdditionalData: false,
    iomOnly: true,
    source: "Census ethnicity data — area estimate by proportional distribution",
    censusTable: "IoM 2021 Census Part I, Table 2.10",
    additionalDataNote: "Area-level non-white counts are modelled estimates (proportional distribution from island total). Island-wide total of 4,441 non-white residents is published exact. Rural area estimates likely overstate true counts — non-white population is concentrated in towns.",
    description: "Estimates non-white residents in this area. Island-wide: 4,441 (5.3%). Area figures are modelled.",
  },
};

// IOM census data baked in from iom_2021_census_area_age_sex.csv
// Used for published-data-only mode of AttackSim
// Keyed as: IOM_CENSUS_CELLS[area][ageBand][sex] = count
// Built from Tables 2.1 (All), 2.2 (Male), 2.3 (Female)
export { IOM_CENSUS_CELLS } from "./iomCensusCells.js";

// IOM Manx language by area — published_exact, Table 2.13
// Keyed as: IOM_MANX_LANGUAGE[area] = { total_any_manx, speak_read_write, area_pop, ... }
export { IOM_MANX_LANGUAGE } from "./iomManxLanguage.js";

// IOM non-white ethnicity by area — modelled_estimate, Table 2.10
// Keyed as: IOM_ETHNICITY[area] = { non_white_estimate, area_pop, caveat, ... }
export { IOM_ETHNICITY } from "./iomEthnicity.js";
