import pandas as pd
import json
from pathlib import Path

AGE_LABELS = [
    "0-4","5-9","10-14","15-19","20-24","25-29",
    "30-34","35-39","40-44","45-49","50-54",
    "55-59","60-64","65-69","70-74","75-79",
    "80-84","85+"
]

OCCUPATIONS = {
    0:"Not employed",
    1:"Managers",
    2:"Professional",
    3:"Associate Prof",
    4:"Admin/Secretarial",
    5:"Skilled Trades",
    6:"Caring/Leisure",
    7:"Sales/CS",
    8:"Process/Plant",
    9:"Elementary"
}

SEX = {
    1:"Male",
    2:"Female"
}

IOM_AREAS = {
    1:"Douglas",
    2:"Ramsey",
    3:"Peel",
    4:"Castletown",
    5:"Port Erin",
    6:"Port St Mary",
    7:"Laxey",
    8:"Onchan",
    9:"Andreas",
    10:"Arbory",
    11:"Ballaugh",
    12:"Braddan",
    13:"Bride",
    14:"German",
    15:"Jurby",
    16:"Lezayre",
    17:"Lonan",
    18:"Malew",
    19:"Marown",
    20:"Maughold",
    21:"Michael",
    22:"Patrick",
    23:"Rushen",
    24:"Santon"
}

GUERNSEY_AREAS = {
    1:"St Peter Port",
    2:"St Sampson",
    3:"Vale",
    4:"Castel",
    5:"St Martin",
    6:"St Saviour",
    7:"St Andrew",
    8:"Forest",
    9:"St Pierre du Bois",
    10:"Torteval",
    11:"Herm/Jethou"
}

JERSEY_PARISHES = {
    1:"Grouville",
    2:"St Brelade",
    3:"St Clement",
    4:"St Helier",
    5:"St John",
    6:"St Lawrence",
    7:"St Martin",
    8:"St Mary",
    9:"St Ouen",
    10:"St Peter",
    11:"St Saviour",
    12:"Trinity"
}

FILES = [
    ("iom", "iom_synthetic_population.csv", "area", IOM_AREAS),
    ("guernsey", "guernsey_synthetic_population.csv", "area", GUERNSEY_AREAS),
    ("jersey", "jersey_synthetic_population.csv", "parish", JERSEY_PARISHES),
]

rows = []

for island, filename, geo_col, geo_map in FILES:

    print(f"Loading {filename}")

    df = pd.read_csv(filename)

    grouped = (
        df.groupby(
            [
                geo_col,
                "age_band",
                "sex",
                "occupation",
                "hh_size"
            ]
        )
        .size()
        .reset_index(name="count")
    )

    for _, r in grouped.iterrows():

        age_code = int(r["age_band"])

        if age_code <= len(AGE_LABELS):
            age_label = AGE_LABELS[age_code - 1]
        else:
            age_label = "85+"

        rows.append({
            "island": island,
            "area": geo_map[int(r[geo_col])],
            "age_band": age_label,
            "sex": SEX[int(r["sex"])],
            "occupation": OCCUPATIONS[int(r["occupation"])],
            "hh_size": int(r["hh_size"]),
            "count": int(r["count"])
        })

with open("attackLookup.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, separators=(",", ":"))

size_mb = Path("attackLookup.json").stat().st_size / (1024 * 1024)

print()
print(f"Rows: {len(rows):,}")
print(f"Size: {size_mb:.2f} MB")
print("attackLookup.json written")