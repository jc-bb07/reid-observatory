"""
Jersey 2021 Census - Synthetic Population Generator
Mirrors the IoM methodology for cross-island comparability.

Sources:
  - Parish × Age × Sex: opendata.gov.je (Table: Population by Parish, Age and Sex)
  - Occupation × Sex: opendata.gov.je (Table: Occupations by sex)
  - Economic Status × Age: opendata.gov.je (Table: Economic Status by Age)

Quasi-identifiers:
  1. parish     (12 parishes, encoded 1-12)
  2. age_band   (17 quinary bands: 1=<5 ... 17=80+)
  3. sex        (1=Male, 2=Female)
  4. occupation (9 SOC Level 1 categories, 0=Not employed)
  5. hh_size    (1-6, synthesised from IoM distribution as proxy — Guernsey/Jersey similar)

Note: Jersey 80+ band is combined (IoM splits 80-84 / 85+).
      Age bands: 1=<5, 2=5-9, 3=10-14, 4=15-19, 5=20-24, 6=25-29, 7=30-34,
                 8=35-39, 9=40-44, 10=45-49, 11=50-54, 12=55-59, 13=60-64,
                 14=65-69, 15=70-74, 16=75-79, 17=80+
"""

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

# ── 1. PARISH × AGE × SEX ────────────────────────────────────────────────────
# From parish_age_sex.csv — Male and Female rows only
# Columns: < 5, 5-9, 10-14, 15-19, 20-24, 25-29, 30-34, 35-39,
#          40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74, 75-79, 80+

PARISHES = [
    # (id, name, [male counts], [female counts])
    (1, "Grouville",
     [127,145,131,135,147,88,97,154,178,182,238,198,181,149,134,105,160],
     [126,164,154,165,124,96,116,172,177,227,223,210,191,190,174,129,214]),
    (2, "St Brelade",
     [207,289,293,294,321,236,275,346,344,353,476,438,395,336,291,211,351],
     [209,268,286,246,252,216,238,350,346,369,468,472,407,326,334,248,521]),
    (3, "St Clement",
     [272,288,287,308,282,221,265,277,332,335,362,390,304,223,241,140,225],
     [255,286,291,311,246,254,270,356,368,364,381,432,345,267,247,200,300]),
    (4, "St Helier",
     [822,875,766,797,1196,1476,1647,1477,1304,1264,1199,1146,909,734,577,381,567],
     [759,847,746,727,1066,1438,1589,1451,1329,1270,1243,1226,975,800,671,502,870]),
    (5, "St John",
     [89,100,101,102,80,55,68,102,110,129,167,148,134,122,98,67,105],
     [82,97,96,93,70,57,72,90,127,140,144,151,130,132,94,81,148]),
    (6, "St Lawrence",
     [160,196,206,199,175,137,152,221,241,231,298,247,228,196,173,115,186],
     [151,195,211,183,149,128,150,205,236,253,278,278,233,225,190,134,255]),
    (7, "St Martin",
     [136,169,165,171,181,105,130,168,205,212,241,232,218,180,157,101,163],
     [130,165,168,178,148,119,127,172,200,222,235,240,222,196,186,139,250]),
    (8, "St Mary",
     [58,64,73,73,49,40,44,71,79,95,104,95,91,81,71,49,80],
     [54,61,68,57,46,33,44,68,85,95,101,100,98,87,86,66,112]),
    (9, "St Ouen",
     [147,187,184,173,181,113,127,186,195,218,268,241,215,196,148,108,176],
     [139,176,175,164,143,105,119,172,208,244,266,274,220,195,173,138,253]),
    (10, "St Peter",
     [165,198,195,190,191,127,147,195,228,244,290,268,221,196,173,113,200],
     [155,180,176,181,144,119,138,191,218,239,278,271,219,203,183,137,266]),
    (11, "St Saviour",
     [314,381,367,334,363,303,367,418,427,452,510,500,405,334,263,183,286],
     [293,370,373,328,318,297,339,441,455,489,514,518,440,357,302,226,436]),
    (12, "Trinity",
     [92,103,117,107,110,64,77,108,143,139,175,148,132,124,100,68,128],
     [89,112,111,108,78,74,77,107,143,152,163,159,139,144,111,82,175]),
]

# ── 2. OCCUPATION CONDITIONAL PROBABILITIES ───────────────────────────────────
# Jersey economic status by age (Table: Economic Status by Age)
# Age groups: 16-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65+
# Employment fractions by age group (employed / total)
EMP_FRAC = [
    1650/3920,   # 16-19
    4350/5270,   # 20-24
    5440/5690,   # 25-29
    6070/6500,   # 30-34
    6780/7390,   # 35-39
    6940/7470,   # 40-44
    6990/7460,   # 45-49
    7550/8110,   # 50-54
    6870/8550,   # 55-59
    4290/10040,  # 60-64
    2470/16080,  # 65+
]

# Occupation distribution by sex (island-wide, from occupations_sex.csv)
# SOC Level 1: Managers, Professional, Associate Prof, Admin/Sec,
#              Skilled Trades, Caring/Leisure, Sales/CS, Process/Plant, Elementary
OCC_MALE   = np.array([4590, 5330, 3320, 1280, 5180, 710, 1020, 1570, 2360], dtype=float)
OCC_FEMALE = np.array([2340, 6480, 3770, 4000,  450, 3900, 1880,  200, 1970], dtype=float)

OCC_MALE_P   = OCC_MALE   / OCC_MALE.sum()
OCC_FEMALE_P = OCC_FEMALE / OCC_FEMALE.sum()

# Map age band (1-indexed, 1=<5 ... 17=80+) to employment age group index
AGE_BAND_TO_EMP = {
    1: -1, 2: -1, 3: -1,  # under 15
    4: 0,   # 15-19
    5: 1,   # 20-24
    6: 2,   # 25-29
    7: 3,   # 30-34
    8: 4,   # 35-39
    9: 5,   # 40-44
    10: 6,  # 45-49
    11: 7,  # 50-54
    12: 8,  # 55-59
    13: 9,  # 60-64
    14: 10, # 65-69 → use 65+ group
    15: 10, # 70-74
    16: 10, # 75-79
    17: 10, # 80+
}

def occ_probs(age_band, sex):
    emp_grp = AGE_BAND_TO_EMP[age_band]
    if emp_grp == -1:
        return np.array([1.0] + [0.0]*9)
    emp_frac = EMP_FRAC[emp_grp]
    occ_p = OCC_MALE_P if sex == 1 else OCC_FEMALE_P
    p_occ = occ_p * emp_frac
    return np.concatenate([[1.0 - emp_frac], p_occ])

# ── 3. HOUSEHOLD SIZE — use IoM-calibrated person-weighted distribution ───────
# Average HH size Jersey 2021 = 2.33 (slightly larger than IoM 2.22)
# Use similar distribution shape, slightly adjusted
HH_SIZES  = np.array([1, 2, 3, 4, 5, 6])
HH_COUNTS = np.array([10500, 12800, 5800, 5200, 1800, 600], dtype=float)  # Jersey ~37k HH
PERSON_WEIGHTS = HH_COUNTS * HH_SIZES
PERSON_PROBS   = PERSON_WEIGHTS / PERSON_WEIGHTS.sum()

# ── 4. BUILD SYNTHETIC POPULATION ────────────────────────────────────────────
records = []

for parish_id, parish_name, male_counts, female_counts in PARISHES:
    for age_band_idx, (m_count, f_count) in enumerate(zip(male_counts, female_counts)):
        age_band = age_band_idx + 1  # 1-indexed
        for _ in range(m_count):
            p = occ_probs(age_band, 1)
            occ = RNG.choice(np.arange(10), p=p/p.sum())
            hh  = RNG.choice(HH_SIZES, p=PERSON_PROBS)
            records.append((parish_id, age_band, 1, int(occ), int(hh)))
        for _ in range(f_count):
            p = occ_probs(age_band, 2)
            occ = RNG.choice(np.arange(10), p=p/p.sum())
            hh  = RNG.choice(HH_SIZES, p=PERSON_PROBS)
            records.append((parish_id, age_band, 2, int(occ), int(hh)))

df = pd.DataFrame(records, columns=["parish","age_band","sex","occupation","hh_size"])

print(f"Total records: {len(df):,}")
print(f"\nParish populations:")
parish_names = {p[0]: p[1] for p in PARISHES}
for pid, name in parish_names.items():
    n = len(df[df["parish"]==pid])
    print(f"  {name:<15} {n:,}")

print(f"\nOccupation distribution:")
occ_labels = {0:"Not employed",1:"Managers",2:"Professional",3:"Associate Prof",
              4:"Admin/Sec",5:"Skilled Trades",6:"Caring/Leisure",7:"Sales/CS",
              8:"Process/Plant",9:"Elementary"}
for k, v in df["occupation"].value_counts().sort_index().items():
    print(f"  {occ_labels[k]}: {v:,} ({v/len(df)*100:.1f}%)")

df.to_csv("/home/claude/jersey_synthetic_population.csv", index=False)
print(f"\nSaved: jersey_synthetic_population.csv")
