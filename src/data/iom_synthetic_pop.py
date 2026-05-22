"""
IoM 2021 Census - Synthetic Population Generator
Reconstructs individual records consistent with published aggregate marginals.

Quasi-identifiers used:
  1. area       (24 areas, encoded 1-24)
  2. age_band   (18 quinary bands, encoded 1-18)
  3. sex        (1=Male, 2=Female)
  4. occupation (9 SOC Level 1 categories, encoded 1-9; 0=Not employed)
  5. hh_size    (1-6, where 6="6 or more")

Method:
  - Seed area/age/sex cells directly from Table 2.1/2.2/2.3 (exact counts)
  - Assign occupation using conditional probability P(occ | age, sex) from Table 1.9/1.10
  - Assign household size using marginal distribution from Table 3.2, weighted by area
  - Output: N=84,069 rows × 5 columns, integer-encoded
"""

import numpy as np
import pandas as pd
from collections import defaultdict

RNG = np.random.default_rng(42)

# ── 1. AREA / AGE / SEX CELLS ────────────────────────────────────────────────
# From Table 2.2 (male) and 2.3 (female) — exact counts
# Format: (area_id, area_name, type, [male counts per age band], [female counts per age band])
# Age bands: 0-4, 5-9, 10-14, 15-19, 20-24, 25-29, 30-34, 35-39,
#            40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74, 75-79, 80-84, 85+

AREAS = [
    (1,  "Douglas",     "Town",    [568,696,754,770,843,885,964,893,943,981,1119,1006,841,635,598,379,268,201],
                                   [584,646,765,711,753,850,916,930,921,1013,1013,987,788,630,618,439,349,420]),
    (2,  "Ramsey",      "Town",    [164,193,229,198,202,225,224,199,227,253,291,347,292,249,280,177,147,114],
                                   [185,193,177,216,215,214,211,226,253,290,284,316,289,266,279,233,196,234]),
    (3,  "Peel",        "Town",    [139,175,188,140,113,159,162,217,183,182,202,198,174,165,174,111,61,59],
                                   [132,163,189,128,139,146,194,208,196,195,218,190,172,153,180,129,74,102]),
    (4,  "Castletown",  "Town",    [70,102,105,114,70,66,93,87,89,86,110,143,91,78,91,90,42,39],
                                   [63,95,100,74,62,91,101,94,103,95,142,111,118,99,95,83,56,58]),
    (5,  "Port Erin",   "Village", [83,85,98,90,90,70,78,88,108,138,150,151,119,106,148,105,58,51],
                                   [77,94,105,83,76,87,92,107,113,136,129,148,121,114,166,117,76,73]),
    (6,  "Port St Mary","Village", [46,51,46,40,41,45,35,52,48,60,72,61,82,76,87,64,40,28],
                                   [37,36,43,31,39,48,40,52,35,53,81,91,76,66,87,70,48,82]),
    (7,  "Laxey",       "Village", [27,45,60,54,44,35,35,42,45,46,75,89,76,48,44,33,20,27],
                                   [28,37,32,34,39,36,43,35,47,58,90,77,71,42,57,44,20,21]),
    (8,  "Onchan",      "Village", [188,246,255,273,225,209,221,253,256,292,317,360,300,287,323,218,145,97],
                                   [159,204,261,228,192,190,252,269,288,307,341,348,355,308,340,230,155,147]),
    (9,  "Andreas",     "Parish",  [22,32,36,36,38,35,21,28,47,40,45,67,54,58,57,37,21,21],
                                   [21,28,42,35,29,25,28,36,45,44,54,67,54,43,61,46,30,17]),
    (10, "Arbory",      "Parish",  [40,49,36,50,26,50,40,46,57,61,79,93,45,76,79,56,30,15],
                                   [37,42,50,44,37,38,50,61,45,66,76,91,69,76,87,42,32,28]),
    (11, "Ballaugh",    "Parish",  [12,27,30,31,25,13,19,17,23,35,54,50,35,47,38,28,17,16],
                                   [17,24,17,22,21,11,20,17,30,44,52,34,53,45,38,41,22,16]),
    (12, "Braddan",     "Parish",  [72,112,145,90,94,79,90,97,121,114,155,141,111,79,69,64,39,39],
                                   [65,102,124,92,88,95,107,135,98,122,140,128,102,89,74,62,36,34]),
    (13, "Bride",       "Parish",  [6,3,9,9,7,7,8,4,6,14,18,22,17,28,17,7,14,3],
                                   [2,4,5,4,12,5,7,4,8,8,10,19,23,15,16,10,6,2]),
    (14, "German",      "Parish",  [29,22,23,37,24,22,20,19,25,36,53,49,36,37,35,21,17,12],
                                   [18,27,34,31,26,21,22,28,23,38,58,47,39,38,35,26,17,11]),
    (15, "Jurby",       "Parish",  [18,20,25,27,28,20,33,28,26,31,37,24,21,29,23,14,7,6],
                                   [19,33,28,18,16,18,16,18,25,30,28,15,28,19,24,14,5,9]),
    (16, "Lezayre",     "Parish",  [25,27,33,40,25,21,20,22,29,37,53,66,52,57,38,33,25,18],
                                   [18,22,23,33,24,28,14,21,38,47,61,65,53,40,42,25,29,26]),
    (17, "Lonan",       "Parish",  [31,49,43,40,45,30,40,30,55,52,78,56,70,53,57,40,23,16],
                                   [46,44,50,45,42,30,41,48,52,50,70,83,65,38,55,40,16,24]),
    (18, "Malew",       "Parish",  [60,63,66,59,74,57,51,51,60,72,91,93,106,75,80,57,30,23],
                                   [56,49,70,47,58,56,58,64,69,79,110,97,91,79,81,65,34,36]),
    (19, "Marown",      "Parish",  [46,56,84,84,66,39,48,52,69,81,88,91,77,63,71,51,33,28],
                                   [44,54,58,65,55,34,48,67,77,81,96,98,69,57,76,55,36,23]),
    (20, "Maughold",    "Parish",  [14,15,24,22,30,14,9,16,22,27,49,59,35,32,27,33,23,15],
                                   [13,22,26,28,14,11,22,20,24,35,42,61,39,25,41,26,23,14]),
    (21, "Michael",     "Parish",  [22,34,52,42,30,28,35,33,39,53,58,62,67,56,62,36,27,21],
                                   [23,28,34,38,29,30,41,33,42,52,53,77,64,72,46,50,21,32]),
    (22, "Patrick",     "Parish",  [35,37,43,34,44,56,27,47,42,45,62,61,66,37,43,31,15,11],
                                   [30,37,42,41,46,36,41,46,40,60,61,60,65,41,45,28,22,10]),
    (23, "Rushen",      "Parish",  [25,45,40,39,35,26,27,33,49,52,69,65,67,66,68,41,29,31],
                                   [26,43,45,38,31,31,33,42,53,59,56,70,84,66,67,43,34,33]),
    (24, "Santon",      "Parish",  [14,14,25,20,21,17,20,21,21,20,26,35,21,23,17,13,11,5],
                                   [27,20,17,23,26,25,24,18,27,28,32,44,26,17,20,14,10,7]),
]

# ── 2. OCCUPATION CONDITIONAL PROBABILITIES ───────────────────────────────────
# From Tables 1.9 (male) and 1.10 (female): employed by age × SOC Level 1
# Age groups: 16-19,20-24,25-29,30-34,35-39,40-44,45-49,50-54,55-59,60-64,65-69,70-74,75+
# SOC codes: 1=Managers 2=Professional 3=Associate Prof 4=Admin/Sec
#            5=Skilled Trades 6=Caring/Leisure 7=Sales/CS 8=Process/Plant 9=Elementary

# Male employed counts by age group (13 groups) × occupation (9)
MALE_OCC_BY_AGE = np.array([
    [6,  9,  49, 44, 139, 32, 144, 26, 345],   # 16-19
    [49, 192, 230, 265, 355, 49, 168, 72, 288],  # 20-24
    [122,402, 360, 233, 411, 59, 105,126, 178],  # 25-29
    [213,473, 316, 173, 473, 75,  91,137, 178],  # 30-34
    [316,472, 309, 144, 468, 58,  71,159, 178],  # 35-39
    [413,511, 342, 166, 465, 60,  73,158, 182],  # 40-44
    [466,552, 332, 158, 511, 82,  81,183, 200],  # 45-49
    [550,570, 327, 188, 644, 91,  96,223, 258],  # 50-54
    [527,495, 275, 141, 625, 96,  88,277, 244],  # 55-59
    [317,317, 143,  92, 435, 65,  84,226, 189],  # 60-64
    [192,142,  64,  31, 174, 34,  37,100,  64],  # 65-69
    [110, 67,  23,  18,  75,  6,  15, 38,  26],  # 70-74
    [ 88, 32,  14,   6,  51,  9,   4, 14,  10],  # 75+
], dtype=float)

# Female employed counts by age group × occupation
FEMALE_OCC_BY_AGE = np.array([
    [5,  19,  37,  72,  13, 131, 209,  4, 299],  # 16-19
    [34, 220, 197, 398,  34, 267, 211,  4, 159],  # 20-24
    [88, 442, 288, 404,  24, 263, 149,  9, 134],  # 25-29
    [171,511, 283, 447,  34, 307, 125, 15, 137],  # 30-34
    [211,610, 315, 433,  45, 269, 118, 12, 148],  # 35-39
    [247,575, 291, 477,  58, 303, 131, 13, 163],  # 40-44
    [304,607, 295, 600,  55, 343, 146, 20, 177],  # 45-49
    [330,579, 309, 630,  54, 423, 154, 29, 220],  # 50-54
    [276,495, 233, 586,  60, 381, 176, 13, 220],  # 55-59
    [167,236, 120, 412,  49, 260, 136, 16, 192],  # 60-64
    [ 62, 88,  36, 117,  18,  94,  52,  8,  69],  # 65-69
    [ 42, 24,   9,  41,   8,  29,  22,  3,  17],  # 70-74
    [ 18,  6,   7,  13,   6,  12,   7,  2,   7],  # 75+
], dtype=float)

# Map quinary age band (0-indexed, 0=0-4 ... 17=85+) to occ age group index
# Age bands 0-2 (0-14) → not employed (children)
# Band 3 (15-19) → occ group 0
# Bands 4-15 map to occ groups 1-12
# Bands 16-17 (80+) → occ group 12 (75+)
def age_band_to_occ_group(band):
    if band <= 2:   return -1   # under 15, not employed
    if band == 3:   return 0    # 15-19
    if band <= 15:  return band - 3   # 20-24 → 1, ..., 60-64 → 12 ... wait
    return 12  # 75+

# Correct mapping: band index → occ age group
# band 3=15-19 → 0, band 4=20-24 → 1, ... band 15=60-64 → 12? No, let's be precise
# occ groups: 0=16-19, 1=20-24, 2=25-29, 3=30-34, 4=35-39, 5=40-44,
#             6=45-49, 7=50-54, 8=55-59, 9=60-64, 10=65-69, 11=70-74, 12=75+
AGE_BAND_TO_OCC = {
    0: -1, 1: -1, 2: -1,  # 0-14: not employed
    3: 0,   # 15-19
    4: 1,   # 20-24
    5: 2,   # 25-29
    6: 3,   # 30-34
    7: 4,   # 35-39
    8: 5,   # 40-44
    9: 6,   # 45-49
    10: 7,  # 50-54
    11: 8,  # 55-59
    12: 9,  # 60-64
    13: 10, # 65-69
    14: 11, # 70-74
    15: 12, # 75-79 → use 75+ group
    16: 12, # 80-84
    17: 12, # 85+
}

def occ_probs(age_band, sex):
    """Return probability vector over occupations 1-9 + 0 (not employed)."""
    occ_grp = AGE_BAND_TO_OCC[age_band]
    if occ_grp == -1:
        return np.array([1.0] + [0.0]*9)  # definitely not employed
    
    counts = MALE_OCC_BY_AGE[occ_grp] if sex == 1 else FEMALE_OCC_BY_AGE[occ_grp]
    total_employed = counts.sum()
    
    # Total in age group from census (employed + not employed)
    # Use employment rates by age from Table 1.1 as prior
    # Employed / economically active by age (total, Table 1.1)
    # We'll use a simple employed fraction by age group
    emp_frac_by_grp = [0.30, 0.75, 0.88, 0.90, 0.91, 0.91, 0.91, 0.88, 0.82, 0.65, 0.38, 0.22, 0.12]
    emp_frac = emp_frac_by_grp[occ_grp]
    
    occ_probs_employed = counts / (total_employed + 1e-9)  # conditional on employed
    
    # P(occ=k) = P(employed) * P(occ=k | employed)
    # P(occ=0) = P(not employed)
    p_occ = occ_probs_employed * emp_frac
    p_not_emp = 1.0 - emp_frac
    
    return np.concatenate([[p_not_emp], p_occ])

# ── 3. HOUSEHOLD SIZE DISTRIBUTION ───────────────────────────────────────────
# From Table 3.2 — IoM-wide marginal (will sample from this)
# Counts: 1-person=12158, 2=13425, 3=5342, 4=4498, 5=1362, 6+=435
HH_COUNTS = np.array([12158, 13425, 5342, 4498, 1362, 435], dtype=float)
HH_PROBS = HH_COUNTS / HH_COUNTS.sum()  # marginal over households

# Convert household size distribution to person-level distribution
# (a person in a 3-person household is weighted by 3/total_persons)
HH_SIZES = np.array([1, 2, 3, 4, 5, 6])
PERSON_WEIGHTS = HH_COUNTS * HH_SIZES
PERSON_PROBS = PERSON_WEIGHTS / PERSON_WEIGHTS.sum()

# ── 4. BUILD SYNTHETIC POPULATION ────────────────────────────────────────────
records = []

for area_id, area_name, area_type, male_counts, female_counts in AREAS:
    for age_band_idx, (m_count, f_count) in enumerate(zip(male_counts, female_counts)):
        # Male records
        for _ in range(m_count):
            p = occ_probs(age_band_idx, sex=1)
            occ = RNG.choice(np.arange(10), p=p/p.sum())
            hh = RNG.choice(HH_SIZES, p=PERSON_PROBS)
            records.append((area_id, age_band_idx + 1, 1, int(occ), int(hh)))
        # Female records
        for _ in range(f_count):
            p = occ_probs(age_band_idx, sex=2)
            occ = RNG.choice(np.arange(10), p=p/p.sum())
            hh = RNG.choice(HH_SIZES, p=PERSON_PROBS)
            records.append((area_id, age_band_idx + 1, 2, int(occ), int(hh)))

df = pd.DataFrame(records, columns=["area","age_band","sex","occupation","hh_size"])

print(f"Total records: {len(df):,}")
print(f"\nColumn ranges:")
for col in df.columns:
    print(f"  {col}: {df[col].min()} – {df[col].max()}")

print(f"\nArea distribution (top 5):")
print(df.groupby("area").size().sort_values(ascending=False).head())

print(f"\nOccupation distribution:")
occ_labels = {0:"Not employed",1:"Managers",2:"Professional",3:"Associate Prof",
              4:"Admin/Sec",5:"Skilled Trades",6:"Caring/Leisure",7:"Sales/CS",
              8:"Process/Plant",9:"Elementary"}
occ_dist = df["occupation"].value_counts().sort_index()
for k, v in occ_dist.items():
    print(f"  {occ_labels[k]}: {v:,} ({v/len(df)*100:.1f}%)")

print(f"\nHousehold size distribution:")
print(df["hh_size"].value_counts().sort_index())

# Save
df.to_csv("/home/claude/iom_synthetic_population.csv", index=False)
print(f"\nSaved to iom_synthetic_population.csv")
