"""Generate realistic customer datasets for the segmentation dashboard.

The output CSV is compatible with the backend upload endpoint. By default the
file contains only the required project columns:

CustomerID, Age, Gender, AnnualIncome, SpendingScore, Balance
"""

from __future__ import annotations

import argparse
import csv
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


REQUIRED_COLUMNS = [
    "CustomerID",
    "Age",
    "Gender",
    "AnnualIncome",
    "SpendingScore",
    "Balance",
]

DEFAULT_OUTPUT = Path(__file__).resolve().parent / "data" / "generated_customers.csv"


@dataclass(frozen=True)
class SegmentProfile:
    name: str
    weight: float
    age_mean: float
    age_sd: float
    income_mean: float
    income_sd: float
    spending_mean: float
    spending_sd: float
    balance_mean: float
    balance_sd: float


SEGMENTS = [
    SegmentProfile("Young High Spenders", 0.22, 27, 5, 42000, 9000, 78, 10, 3200, 2200),
    SegmentProfile("Established Premium", 0.18, 44, 7, 118000, 24000, 70, 12, 39000, 18000),
    SegmentProfile("Careful Savers", 0.24, 51, 9, 76000, 17000, 30, 10, 24500, 11000),
    SegmentProfile("Budget Starters", 0.20, 31, 6, 36000, 8000, 43, 13, 5200, 3700),
    SegmentProfile("Affluent Low Engagement", 0.16, 58, 8, 145000, 30000, 24, 9, 61000, 25000),
]

GENDERS = ["Female", "Male", "Other"]
GENDER_WEIGHTS = [0.49, 0.49, 0.02]
GENDER_NOISE_VALUES = ["F", "M", "female", "male", "Nonbinary", "unknown"]


def clamp(value: float, low: float, high: float) -> float:
    return min(max(value, low), high)


def rounded_money(value: float) -> int:
    return int(round(value / 100.0) * 100)


def draw_positive_gauss(rng: random.Random, mean: float, sd: float, low: float, high: float) -> float:
    # Retry a few times to avoid excessive clipping while keeping generation fast.
    for _ in range(8):
        value = rng.gauss(mean, sd)
        if low <= value <= high:
            return value
    return clamp(rng.gauss(mean, sd), low, high)


def build_customer(customer_number: int, rng: random.Random, include_segment: bool) -> dict[str, Any]:
    profile = rng.choices(SEGMENTS, weights=[segment.weight for segment in SEGMENTS], k=1)[0]

    age = round(draw_positive_gauss(rng, profile.age_mean, profile.age_sd, 18, 80))
    income = rounded_money(draw_positive_gauss(rng, profile.income_mean, profile.income_sd, 18000, 230000))
    spending_score = round(draw_positive_gauss(rng, profile.spending_mean, profile.spending_sd, 1, 100))

    balance = rounded_money(draw_positive_gauss(rng, profile.balance_mean, profile.balance_sd, 0, 140000))

    # Add a mild relationship between income, spending, and balance so charts and
    # clusters look plausible without being perfectly separated.
    income_factor = (income - 70000) * 0.08
    spending_factor = (50 - spending_score) * 120
    balance = rounded_money(clamp(balance + income_factor + spending_factor, 0, 160000))

    row: dict[str, Any] = {
        "CustomerID": f"C{customer_number:05d}",
        "Age": int(age),
        "Gender": rng.choices(GENDERS, weights=GENDER_WEIGHTS, k=1)[0],
        "AnnualIncome": int(income),
        "SpendingScore": int(clamp(spending_score, 1, 100)),
        "Balance": int(balance),
    }

    if include_segment:
        row["Segment"] = profile.name

    return row


def inject_missing_values(
    rows: list[dict[str, Any]],
    rng: random.Random,
    missing_rate: float,
    protected_columns: Iterable[str],
) -> int:
    protected = set(protected_columns)
    editable_columns = [column for column in REQUIRED_COLUMNS if column not in protected]
    inserted = 0

    for row in rows:
        for column in editable_columns:
            if rng.random() < missing_rate:
                row[column] = ""
                inserted += 1

    return inserted


def inject_outliers(rows: list[dict[str, Any]], rng: random.Random, outlier_rate: float) -> int:
    count = max(0, round(len(rows) * outlier_rate))
    if count == 0:
        return 0

    for row in rng.sample(rows, k=min(count, len(rows))):
        outlier_type = rng.choice(["income", "spending", "balance", "age", "gender"])
        if outlier_type == "income":
            row["AnnualIncome"] = rng.choice([9500, 275000, 350000])
        elif outlier_type == "spending":
            row["SpendingScore"] = rng.choice([0, 100])
        elif outlier_type == "balance":
            row["Balance"] = rng.choice([-2500, 185000, 240000])
        elif outlier_type == "age":
            row["Age"] = rng.choice([18, 82, 95])
        else:
            row["Gender"] = rng.choice(GENDER_NOISE_VALUES)

    return count


def inject_duplicates(rows: list[dict[str, Any]], rng: random.Random, duplicate_rate: float) -> int:
    count = max(0, round(len(rows) * duplicate_rate))
    if count == 0 or not rows:
        return 0

    duplicates = [dict(row) for row in rng.choices(rows, k=count)]
    rows.extend(duplicates)
    rng.shuffle(rows)
    return count


def generate_rows(
    row_count: int,
    seed: int,
    include_segment: bool,
    dirty: bool,
    missing_rate: float,
    duplicate_rate: float,
    outlier_rate: float,
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    rng = random.Random(seed)
    rows = [build_customer(index + 1, rng, include_segment) for index in range(row_count)]

    stats = {
        "missing_values": 0,
        "outliers": 0,
        "duplicates": 0,
    }

    if dirty:
        stats["missing_values"] = inject_missing_values(
            rows,
            rng,
            missing_rate=missing_rate,
            protected_columns=["CustomerID"],
        )
        stats["outliers"] = inject_outliers(rows, rng, outlier_rate=outlier_rate)
        stats["duplicates"] = inject_duplicates(rows, rng, duplicate_rate=duplicate_rate)

    return rows, stats


def write_csv(path: Path, rows: list[dict[str, Any]], include_segment: bool) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    columns = REQUIRED_COLUMNS + (["Segment"] if include_segment else [])

    with path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


def rate(value: str) -> float:
    parsed = float(value)
    if parsed < 0 or parsed > 1:
        raise argparse.ArgumentTypeError("rate must be between 0 and 1")
    return parsed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate customer CSV data for the banking segmentation dashboard."
    )
    parser.add_argument(
        "-n",
        "--rows",
        type=int,
        default=500,
        help="number of base customer rows to generate before duplicates are added",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="CSV output path",
    )
    parser.add_argument("--seed", type=int, default=42, help="random seed for repeatable datasets")
    parser.add_argument(
        "--dirty",
        action="store_true",
        help="add missing values, duplicates, outliers, and noisy gender labels",
    )
    parser.add_argument(
        "--missing-rate",
        type=rate,
        default=0.025,
        help="per-cell missing value rate for dirty datasets",
    )
    parser.add_argument(
        "--duplicate-rate",
        type=rate,
        default=0.03,
        help="row duplicate rate for dirty datasets",
    )
    parser.add_argument(
        "--outlier-rate",
        type=rate,
        default=0.02,
        help="row outlier rate for dirty datasets",
    )
    parser.add_argument(
        "--include-segment",
        action="store_true",
        help="include a Segment column for manual inspection; backend upload still works",
    )

    args = parser.parse_args()
    if args.rows < 1:
        parser.error("--rows must be at least 1")
    return args


def main() -> None:
    args = parse_args()
    rows, stats = generate_rows(
        row_count=args.rows,
        seed=args.seed,
        include_segment=args.include_segment,
        dirty=args.dirty,
        missing_rate=args.missing_rate,
        duplicate_rate=args.duplicate_rate,
        outlier_rate=args.outlier_rate,
    )
    write_csv(args.output, rows, include_segment=args.include_segment)

    print(f"Wrote {len(rows)} rows to {args.output}")
    print(f"Seed: {args.seed}")
    if args.dirty:
        print(
            "Dirty data injected: "
            f"{stats['missing_values']} missing values, "
            f"{stats['outliers']} outlier rows, "
            f"{stats['duplicates']} duplicate rows"
        )


if __name__ == "__main__":
    main()
