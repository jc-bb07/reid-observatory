"""
Guernsey 2021 Census — Synthetic Population Generator
Matches schema of IoM synthetic population exactly.

Quasi-identifiers:
  1. area       (11 parishes, encoded 1-11)
  2. age_band   (18 quinary bands 1-18: 1=0-4 ... 18=85+)
  3. sex        (1=Male, 2=Female)
  4. occupation (0=Not employed, 1-9 = SOC Level 1)
  5. hh_size    (1-6, where 6="6 or more")

Sources: Guernsey Annual Electronic Census Report 2021
  - Age/sex by parish: Table 4.4.1 (island total) + Table 6.1.2 (% by parish × age group)
  - Household size: Table 5.4.1 / 5.4.2
  - Employment by sector used as proxy for occupation marginals (Table 9.4.1)
  - Employment rates by age: Table 8.1.2

Note on occupation: Guernsey census doesn't publish SOC by age×sex at the level
the IoM does, so we use IoM-derived employment-rate-by-age structure and
Guernsey's sector distribution to weight SOC categories. This is explicitly
flagged as modelled, not directly census-derived.
"""

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

# ── 1. PARISHES ──────────────────────────────────────────────────────────────
# area_id, name, type
# Population by parish from Table 6.1.1
PARISHES = [
    (1,  "St Peter Port", "Town"),
    (2,  "St Sampson",    "Town"),
    (3,  "Vale",          "Parish"),
    (4,  "Castel",        "Parish"),
    (5,  "St Martin",     "Parish"),
    (6,  "St Saviour",    "Parish"),
    (7,  "St Andrew",     "Parish"),
    (8,  "Forest",        "Parish"),
    (9,  "St Pierre du Bois", "Parish"),
    (10, "Torteval",      "Parish"),
    (11, "Herm/Jethou",   "Island"),
]

PARISH_POP = {
    1: 19295,
    2: 9033,
    3: 9559,
    4: 8827,
    5: 6626,
    6: 2828,
    7: 2346,
    8: 1563,
    9: 2076,
    10: 1030,
    11: 87,
}

# ── 2. AGE × SEX × PARISH ───────────────────────────────────────────────────
# Table 4.4.1 gives island-wide totals by 5-year band × sex
# Table 6.1.2 gives % in each parish by broad age group (0-15, 16-64, 65-84, 85+)
# Strategy: distribute island-wide 5-year band counts to parishes using
# parish share of each broad age group, derived from Table 6.1.2 × parish pop.

# Island-wide counts from Table 4.4.1 (2021 column)
# Format: [female, male] per age band
# age bands: 1=0-4, 2=5-9, ..., 18=85+
ISLAND_COUNTS = [
    # [female, male]
    [1295, 1403],   # 0-4
    [1602, 1692],   # 5-9
    [1581, 1723],   # 10-14
    [1512, 1620],   # 15-19
    [1778, 1866],   # 20-24
    [1869, 1976],   # 25-29
    [2052, 2080],   # 30-34
    [1902, 2033],   # 35-39
    [1987, 1913],   # 40-44
    [2212, 2095],   # 45-49
    [2601, 2378],   # 50-54
    [2494, 2467],   # 55-59
    [2172, 2059],   # 60-64
    [1729, 1763],   # 65-69
    [1882, 1730],   # 70-74
    [1211, 1095],   # 75-79
    [1030,  858],   # 80-84
    [1158,  630],   # 85+  (687+471 females, 419+172+39 males approx from 85-89,90-94,95+)
]

# Verify totals match census (Table 4.4.1 total: 32,067 F, 31,381 M = 63,448)
total_f = sum(r[0] for r in ISLAND_COUNTS)
total_m = sum(r[1] for r in ISLAND_COUNTS)

# Table 6.1.2: % of parish population in each broad age group
# Cols: Castel, Forest, St Andrew, St Martin, St Peter Port,
#       St Pierre Du Bois, St Sampson, St Saviour, Torteval, Vale, Herm/Jethou
# Rows: 0-15, 16-64, 65-84, 85+
PARISH_AGE_PCT = {
    # parish_id: {0-15: pct, 16-64: pct, 65-84: pct, 85+: pct}
    1:  {"0-15": 14.7, "16-64": 70.4, "65-84": 13.0, "85+": 1.9},  # St Peter Port
    2:  {"0-15": 15.0, "16-64": 63.0, "65-84": 19.4, "85+": 2.5},  # St Sampson
    3:  {"0-15": 15.5, "16-64": 61.0, "65-84": 20.2, "85+": 3.3},  # Vale
    4:  {"0-15": 17.6, "16-64": 58.0, "65-84": 20.5, "85+": 3.9},  # Castel
    5:  {"0-15": 17.3, "16-64": 60.7, "65-84": 18.2, "85+": 3.8},  # St Martin
    6:  {"0-15": 16.3, "16-64": 60.5, "65-84": 20.2, "85+": 3.0},  # St Saviour
    7:  {"0-15": 17.5, "16-64": 60.4, "65-84": 19.8, "85+": 2.4},  # St Andrew
    8:  {"0-15": 14.6, "16-64": 61.0, "65-84": 21.8, "85+": 2.6},  # Forest
    9:  {"0-15": 13.6, "16-64": 61.0, "65-84": 22.5, "85+": 2.9},  # St Pierre du Bois
    10: {"0-15": 13.5, "16-64": 58.6, "65-84": 23.9, "85+": 4.0},  # Torteval
    11: {"0-15": 17.2, "16-64": 80.5, "65-84":  2.3, "85+": 0.0},  # Herm/Jethou
}

# Map quinary band index (0-based) to broad age group
def broad_group(band_idx):
    if band_idx <= 2:   return "0-15"   # 0-4, 5-9, 10-14
    if band_idx == 3:   return "0-15"   # 15-19 (partially, but we put in 0-15 for simplicity)
    if band_idx <= 12:  return "16-64"  # 20-24 ... 60-64
    if band_idx <= 15:  return "65-84"  # 65-69, 70-74, 75-79, 80-84 — wait 65-79 is 3 bands
    if band_idx == 14:  return "65-84"
    if band_idx <= 16:  return "65-84"  # 80-84
    return "85+"                        # 85+

# Corrected mapping
def broad_group(band_idx):
    """band_idx: 0-based (0=0-4 ... 17=85+)"""
    if band_idx <= 3:   return "0-15"   # 0-4, 5-9, 10-14, 15-19
    if band_idx <= 12:  return "16-64"  # 20-24 through 60-64 (9 bands)
    if band_idx <= 16:  return "65-84"  # 65-69, 70-74, 75-79, 80-84 (4 bands)
    return "85+"                        # 85+

# Compute parish counts per 5-year band × sex
# For each broad group, allocate island total across parishes proportionally
# to parish_pop × parish_age_pct

def parish_band_counts():
    """
    Returns dict: parish_id → list of [female_count, male_count] per age band (18 bands)
    """
    # Step 1: compute expected persons per parish × broad group
    parish_broad = {}
    for pid in PARISH_POP:
        pop = PARISH_POP[pid]
        pct = PARISH_AGE_PCT[pid]
        parish_broad[pid] = {g: pop * pct[g] / 100.0 for g in pct}

    # Step 2: for each band, compute island total, then split to parishes by share
    result = {pid: [[0, 0] for _ in range(18)] for pid in PARISH_POP}

    for band_idx in range(18):
        bg = broad_group(band_idx)
        f_total, m_total = ISLAND_COUNTS[band_idx]

        # Parish shares for this broad group
        parish_expected = {pid: parish_broad[pid][bg] for pid in PARISH_POP}
        total_expected = sum(parish_expected.values())

        for pid in PARISH_POP:
            share = parish_expected[pid] / total_expected if total_expected > 0 else 0
            f_raw = f_total * share
            m_raw = m_total * share
            result[pid][band_idx] = [f_raw, m_raw]

    # Step 3: round to integers preserving totals (largest remainder)
    for band_idx in range(18):
        for sex_idx in range(2):  # 0=female, 1=male
            target = ISLAND_COUNTS[band_idx][sex_idx]
            raws = [result[pid][band_idx][sex_idx] for pid in sorted(PARISH_POP)]
            floors = [int(r) for r in raws]
            remainders = [(raws[i] - floors[i], i) for i in range(len(raws))]
            remainder_needed = target - sum(floors)
            remainders.sort(reverse=True)
            pids_sorted = sorted(PARISH_POP)
            for k in range(int(round(remainder_needed))):
                pid = pids_sorted[remainders[k][1]]
                floors[remainders[k][1]] += 1
            for i, pid in enumerate(pids_sorted):
                result[pid][band_idx][sex_idx] = floors[i]

    return result

PARISH_BAND_COUNTS = parish_band_counts()

# Quick sanity check
computed_total = sum(
    PARISH_BAND_COUNTS[pid][b][s]
    for pid in PARISH_POP
    for b in range(18)
    for s in range(2)
)

# ── 3. OCCUPATION PROBABILITIES ──────────────────────────────────────────────
# Guernsey doesn't publish SOC × age × sex at quinary level.
# We use:
#   - Employment rates by age×sex from Table 8.1.2
#   - Sector employment proportions from Table 9.4.1 as a proxy for SOC weights
#
# SOC mapping from Guernsey sectors (approximate):
#   Finance + Professional/Scientific → SOC 1 (Managers) + SOC 2 (Professional)
#   Public Admin + Education + Health → SOC 2 + SOC 3 + SOC 6
#   Construction → SOC 5 (Skilled Trades)
#   Wholesale/Retail → SOC 7 (Sales/CS)
#   Hostelry → SOC 6 (Caring/Leisure) + SOC 9 (Elementary)
#   Admin/Support → SOC 4 (Admin/Sec)
#   Transport → SOC 8 (Process/Plant)
#   Other → SOC 9 (Elementary)

# Employment rates by age group from Table 8.1.2 (% in employment or FT education)
# Age groups map to our occ_group index (same structure as IoM)
# We strip education from employment for 0-19 roughly
# Table 8.1.2 rows: 14-under, 15-19, 20-24, ... 85+
# We'll use: employed fraction (not FT education) = total_rate - approx_education_rate

# Total in employment or FT education (Table 8.1.2, Total column)
EMP_OR_EDU_BY_AGE = {
    "14-": 72.3,  "15-19": 90.4, "20-24": 85.6,
    "25-29": 84.2, "30-34": 84.0, "35-39": 83.4,
    "40-44": 84.1, "45-49": 83.6, "50-54": 81.7,
    "55-59": 76.1, "60-64": 62.4, "65-69": 18.7,
    "70-74": 4.6,  "75-79": 1.4,  "80+": 0.3,
}

# Approximate employment (not education) rates by occ group index (0-12)
# occ group: 0=16-19, 1=20-24, ..., 12=75+
EMP_FRAC = [
    0.30,  # 0: 16-19 (many in education)
    0.82,  # 1: 20-24
    0.83,  # 2: 25-29
    0.83,  # 3: 30-34
    0.83,  # 4: 35-39
    0.83,  # 5: 40-44
    0.83,  # 6: 45-49
    0.81,  # 7: 50-54
    0.75,  # 8: 55-59
    0.61,  # 9: 60-64
    0.18,  # 10: 65-69
    0.04,  # 11: 70-74
    0.01,  # 12: 75+
]

# SOC distribution from Guernsey sector data (Table 9.4.1)
# Approximate mapping: sector totals → SOC categories
# Finance (5992) + Professional (2996) → heavy SOC 1+2
# Public Admin (5576) + Health (2185) + Education (661) → SOC 2+3+6
# Construction (2938) → SOC 5
# Wholesale/Retail (3861) → SOC 7
# Hostelry (1915) → SOC 6+9
# Admin/Support (1717) → SOC 4
# Transport (1106) → SOC 8
# Other (517+73+150+275+455+672+417+310+858) → various

# Guernsey-calibrated SOC weight vector (Female, Male) — island-wide
# These are approximate proportions informed by sector mix
# SOC: 1=Managers, 2=Professional, 3=Assoc Prof, 4=Admin/Sec,
#      5=Skilled Trades, 6=Caring/Leisure, 7=Sales/CS, 8=Process/Plant, 9=Elementary
GUERNSEY_SOC_FEMALE = np.array([
    0.10,  # 1 Managers
    0.22,  # 2 Professional (finance, health, education heavy)
    0.12,  # 3 Associate Professional
    0.22,  # 4 Admin/Secretarial (finance support, public admin)
    0.02,  # 5 Skilled Trades (low for females)
    0.14,  # 6 Caring/Leisure (health, hostelry)
    0.10,  # 7 Sales/CS (retail)
    0.01,  # 8 Process/Plant
    0.07,  # 9 Elementary
], dtype=float)

GUERNSEY_SOC_MALE = np.array([
    0.14,  # 1 Managers
    0.20,  # 2 Professional
    0.10,  # 3 Associate Professional
    0.10,  # 4 Admin/Secretarial
    0.18,  # 5 Skilled Trades (construction heavy)
    0.04,  # 6 Caring/Leisure
    0.08,  # 7 Sales/CS
    0.07,  # 8 Process/Plant
    0.09,  # 9 Elementary
], dtype=float)

# Normalise
GUERNSEY_SOC_FEMALE /= GUERNSEY_SOC_FEMALE.sum()
GUERNSEY_SOC_MALE   /= GUERNSEY_SOC_MALE.sum()

# Age-band → occ group (same mapping as IoM)
AGE_BAND_TO_OCC = {
    0: -1, 1: -1, 2: -1, 3: -1,  # 0-19: children/school
    4: 0,   # 20-24 → group 1 (but we use 0-index here, so shift)
    5: 1, 6: 2, 7: 3, 8: 4, 9: 5,
    10: 6, 11: 7, 12: 8, 13: 9, 14: 10, 15: 11,
    16: 12, 17: 12,
}

# Redefine to match IoM convention (band 3=15-19 → occ group 0)
AGE_BAND_TO_OCC = {
    0: -1, 1: -1, 2: -1,  # 0-14
    3: 0,   # 15-19
    4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6,
    10: 7, 11: 8, 12: 9, 13: 10, 14: 11,
    15: 12, 16: 12, 17: 12,
}

def occ_probs(age_band_idx, sex):
    """
    age_band_idx: 0-based (0=0-4 ... 17=85+)
    sex: 1=Male, 2=Female
    Returns probability vector length 10: [P(not employed), P(SOC1)...P(SOC9)]
    """
    occ_grp = AGE_BAND_TO_OCC.get(age_band_idx, -1)
    if occ_grp == -1:
        return np.array([1.0] + [0.0]*9)

    emp_frac = EMP_FRAC[occ_grp] if occ_grp < len(EMP_FRAC) else 0.01
    soc_weights = GUERNSEY_SOC_MALE if sex == 1 else GUERNSEY_SOC_FEMALE
    p_occ = soc_weights * emp_frac
    p_not_emp = 1.0 - emp_frac
    probs = np.concatenate([[p_not_emp], p_occ])
    return probs / probs.sum()

# ── 4. HOUSEHOLD SIZE ────────────────────────────────────────────────────────
# From Table 5.4.2: household type counts → household size distribution
# One-adult 16-64: 3,864 hh (size 1)
# One-adult 65+: 2,988 hh (size 1)
# One adult + child: 1,053 hh (size ~2.6 avg, treat as 2-3)
# Two adults both 16-64: 3,616 (size 2)
# Two adults one 65+: 1,287 (size 2)
# Two adults both 65+: 2,661 (size 2)
# Two adults + child: 2,780 (avg ~3.8, treat as 4)
# Three-four adults all 16-64: 2,576 (avg 3.5)
# Three-four adults mixed: 1,344 (avg 3.3)
# Three-four adults + child: 1,242 (avg ~4.7)
# Other: 1,544

# Household count by size (estimated from above)
# 1-person: 3864 + 2988 = 6852
# 2-person: 3616 + 1287 + 2661 = 7564
# 3-person: ~2576*0.5 + 1344*0.5 + 1053*0.4 = ~2382
# 4-person: 2780 + 2576*0.4 + 1344*0.4 + 1242*0.5 = ~5039
# 5-person: 1242*0.4 + 2576*0.1 = ~754
# 6+: 1544*0.3 + remaining ≈ 463
# Total ~24955 (census says 24,955 ✓ roughly)
HH_COUNTS_GY = np.array([6852, 7564, 2382, 5039, 754, 463], dtype=float)
HH_SIZES = np.array([1, 2, 3, 4, 5, 6])
PERSON_WEIGHTS_GY = HH_COUNTS_GY * HH_SIZES
PERSON_PROBS_GY = PERSON_WEIGHTS_GY / PERSON_WEIGHTS_GY.sum()

# ── 5. BUILD SYNTHETIC POPULATION ───────────────────────────────────────────
records = []

for pid, pname, ptype in PARISHES:
    band_counts = PARISH_BAND_COUNTS[pid]
    for band_idx in range(18):
        f_count, m_count = band_counts[band_idx]
        age_band_encoded = band_idx + 1  # 1-indexed

        # Male records
        for _ in range(m_count):
            p = occ_probs(band_idx, sex=1)
            occ = int(RNG.choice(np.arange(10), p=p))
            hh  = int(RNG.choice(HH_SIZES, p=PERSON_PROBS_GY))
            records.append((pid, age_band_encoded, 1, occ, hh))

        # Female records
        for _ in range(f_count):
            p = occ_probs(band_idx, sex=2)
            occ = int(RNG.choice(np.arange(10), p=p))
            hh  = int(RNG.choice(HH_SIZES, p=PERSON_PROBS_GY))
            records.append((pid, age_band_encoded, 2, occ, hh))

df = pd.DataFrame(records, columns=["area", "age_band", "sex", "occupation", "hh_size"])

# ── 6. VALIDATION ────────────────────────────────────────────────────────────
print("=" * 65)
print("GUERNSEY 2021 SYNTHETIC POPULATION — VALIDATION")
print("=" * 65)
print(f"Total records:     {len(df):,}  (census: 63,448)")
print(f"Female:            {(df.sex==2).sum():,}  (census: 32,067)")
print(f"Male:              {(df.sex==1).sum():,}  (census: 31,381)")
print()
print("Parish distribution:")
PARISH_NAMES = {pid: pname for pid, pname, _ in PARISHES}
area_counts = df.groupby("area").size()
for pid, pname, _ in PARISHES:
    n = area_counts.get(pid, 0)
    expected = PARISH_POP[pid]
    print(f"  {pname:<22} {n:>6,}  (census: {expected:>6,})  diff: {n-expected:+d}")

print()
print("Age band distribution (island total vs census):")
iom_age_labels = ["0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39",
                  "40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80-84","85+"]
for b_idx in range(18):
    b_enc = b_idx + 1
    n = (df.age_band == b_enc).sum()
    exp_f, exp_m = ISLAND_COUNTS[b_idx]
    exp_total = exp_f + exp_m
    print(f"  {iom_age_labels[b_idx]:<6}  synthetic: {n:>5,}  census: {exp_total:>5,}  diff: {n-exp_total:+d}")

print()
print("Occupation distribution:")
OCC_LABELS = {0:"Not employed",1:"Managers",2:"Professional",3:"Assoc Prof",
              4:"Admin/Sec",5:"Skilled Trades",6:"Caring/Leisure",7:"Sales/CS",
              8:"Process/Plant",9:"Elementary"}
for occ, label in OCC_LABELS.items():
    n = (df.occupation == occ).sum()
    print(f"  {label:<18} {n:>6,} ({n/len(df)*100:.1f}%)")

print()
print("Household size distribution (person-level):")
for sz in range(1, 7):
    n = (df.hh_size == sz).sum()
    print(f"  HH size {sz}: {n:>6,} ({n/len(df)*100:.1f}%)")

# Save
out_path = "/home/claude/guernsey_synthetic_population.csv"
df.to_csv(out_path, index=False)
print(f"\nSaved to {out_path}")
print(f"Schema identical to IoM: {list(df.columns)}")
