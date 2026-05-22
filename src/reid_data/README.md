# Re-Identification Risk Dataset — README
## Project: Crown Dependencies Population Privacy Research
## Maintainer: Coalfinch / James Wallwork
## Last updated: 2026-05

---

## Naming Convention

`{island}_{year}_{source}_{description}.csv`

| Code | Island |
|------|--------|
| iom  | Isle of Man |
| jer  | Jersey |
| gue  | Guernsey |

Examples:
- `iom_2021_census_area_age_sex.csv`
- `jer_2022_census_health_conditions.csv`
- `gue_2021_census_ethnicity.csv`

---

## Data Type Field — Critical for Transparency

Every row contains a `data_type` field. **This must be surfaced in any UI that uses this data.**

| Value | Meaning |
|-------|---------|
| `published_exact` | Direct transcription from published government census table. Cell count is exactly as published. Cite source_table field. |
| `modelled_estimate` | Derived by applying island-wide proportions to area populations. **Not from a published area-level table.** May over- or under-estimate. See `modelling_method` field for methodology. |
| `synthetic` | Algorithmically generated for demonstration purposes. Not from census data. Must be clearly labelled in UI. |

---

## Files

### iom_2021_census_area_age_sex.csv
- **Source:** 2021 Isle of Man Census Report Part I, Tables 2.1, 2.2, 2.3
- **Published by:** Statistics Isle of Man, Cabinet Office, January 2022 (GD 2022/014)
- **Data type:** published_exact throughout
- **Coverage:** All 24 areas (4 towns, 4 villages, 16 parishes) × 18 age bands × 3 sex categories (All, Male, Female)
- **Note:** Remaining parishes (Arbory, Ballaugh, Braddan, German, Jurby, Lezayre, Lonan, Malew, Marown, Maughold, Michael, Patrick, Rushen) not yet transcribed — add from Tables 2.1-2.3 as needed
- **Re-ID significance:** Small parish cells (especially Bride pop 359) produce age×sex cells as low as 2-4 individuals from published data alone

### iom_2021_census_manx_language.csv
- **Source:** 2021 Isle of Man Census Report Part I, Table 2.13
- **Data type:** published_exact throughout
- **Coverage:** All 24 areas
- **Re-ID significance:** Bride has only 11 Manx speakers total (pop 359). Santon has 5. Combining Manx language ability + area = near-unique identification without any other QI.

### iom_2021_census_ethnicity.csv
- **Source:** Island totals from Table 2.10 (published_exact). Area estimates are modelled_estimate using proportional distribution.
- **CAVEAT:** Non-white population is likely concentrated in towns (Douglas, Ramsey). Proportional distribution by area population almost certainly UNDERESTIMATES Douglas and OVERESTIMATES rural parishes. True rural non-white counts may be near zero in smallest parishes.
- **Re-ID significance:** Even the modelled estimate produces ~19 non-white residents in Bride (pop 359). The homogeneity of the IoM (94.7% white) means ethnicity is a near-unique QI in rural areas even at island-wide proportions.

### iom_2021_census_household_size.csv
- **Source:** 2021 Isle of Man Census Report Part II, Tables 3.1 and 3.2
- **Data type:** published_exact throughout
- **Re-ID significance:** Single-person households in small areas are potentially identifying. Bride has 56 single-person households in pop 359. Combined with age+sex, the anonymity set collapses quickly.

### iom_2021_census_health_conditions.csv
- **Source:** 2021 Isle of Man Census Report Part I, Table 2.14
- **Coverage:** Island-wide totals by age band only. **No area breakdown was published.**
- **Re-ID significance:** Must be applied as a rate multiplied by area×age cell. Applied to small rural cells this produces extremely small estimated counts. Severe limitation (40.4% of 85+) combined with area in Bride produces estimated 2 severely limited individuals aged 85+.

### iom_2021_census_sexuality_religion.csv
- **Source:** 2021 Isle of Man Census Report Part I (sexuality and religion sections)
- **Coverage:** Island-wide totals only. **No area breakdown published for either dimension.**
- **CONTRAST WITH JERSEY:** Jersey's opendata.gov.je publishes health AND sexuality data with area breakdowns — a significantly more granular (and more risky) dataset.
- **Re-ID significance:** Judaism (113 individuals island-wide) combined with any other QI is highly identifying. Islam (393) similarly. GLB orientation (1,368 combined) has no area data but small-area inference is feasible.

---

## Missing Parishes — iom_2021_census_area_age_sex.csv

The following parishes were not transcribed in the initial pass. All data is available in Tables 2.1-2.3 of the census:

- Arbory (pop 1,899)
- Ballaugh (pop 1,041)
- Braddan (pop 3,404)
- German (pop 1,056)
- Jurby (pop 780)
- Lezayre (pop 1,230)
- Lonan (pop 1,647)
- Malew (pop 2,367)
- Marown (pop 2,220)
- Maughold (pop 952)
- Michael (pop 1,522)
- Patrick (pop 1,487)
- Rushen (pop 1,661)

---

## Planned Files

| Filename | Status | Source |
|----------|--------|--------|
| `jer_2021_census_area_age_sex.csv` | TODO | Jersey Census 2021 |
| `jer_2021_census_health_conditions.csv` | TODO | opendata.gov.je — area breakdown available |
| `jer_2021_census_sexuality.csv` | TODO | opendata.gov.je — area breakdown available |
| `gue_2021_census_area_age_sex.csv` | TODO | Guernsey Census 2021 |

---

## Responsible Disclosure Note

This dataset is assembled for the purpose of demonstrating re-identification risk in small-population jurisdictions using only publicly available data. No individual-level data is used or implied. All analysis uses published aggregate statistics.

Prior to publication of any findings derived from this dataset, responsible disclosure to the relevant Information Commissioners is advised:
- **IoM:** Dr Alexandra Delaney-Bhattacharya, IoM Information Commissioner
- **Jersey:** Jersey Office of the Information Commissioner
- **Guernsey:** Office of the Data Protection Authority
