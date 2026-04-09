import csv
import io
import math
from statistics import fmean
from typing import Dict, List, Tuple

NAME_COLS = {"name", "student_name", "full_name"}
EMAIL_COLS = {"email", "mail", "email_id"}
ATTENDANCE_COLS = {"attendance", "attendance_percent", "attendance_percentage"}
ABSENT_MARKERS = {"absent", "ab", "a", "na", "n/a", "-", ""}


def _normalize_column_map(columns: List[str]) -> Dict[str, str]:
    mapping = {}
    for col in columns:
        mapping[col.strip().lower()] = col
    return mapping


def _pick_column(col_map: Dict[str, str], allowed: set) -> str | None:
    for key in allowed:
        if key in col_map:
            return col_map[key]
    return None


def _format_name(raw_name: str) -> str:
    name = str(raw_name or "").strip()
    if not name:
        return "Unknown Student"
    return " ".join(part.capitalize() for part in name.split())


def _generate_email(name: str) -> str:
    token = ".".join(name.lower().split())
    token = token.replace("..", ".")
    return f"{token}@college.edu"


def _score_to_remark(score: float) -> str:
    if score >= 90:
        return "Outstanding performance. Keep aiming high."
    if score >= 75:
        return "Great consistency with strong subject command."
    if score >= 60:
        return "Good effort. Focus on revision to improve outcomes."
    if score >= 40:
        return "Needs structured practice and regular mentoring."
    return "At-risk performance. Immediate intervention recommended."


def _parse_numeric(value: object) -> float | None:
    raw = str(value or "").strip()
    if raw.lower() in ABSENT_MARKERS:
        return None
    try:
        return float(raw)
    except ValueError:
        return None


def _population_std(values: List[float]) -> float:
    if not values:
        return 0.0
    mean_val = fmean(values)
    variance = sum((value - mean_val) ** 2 for value in values) / len(values)
    return math.sqrt(variance)


def _find_subject_columns(columns: List[str], name_col: str, email_col: str | None, attendance_col: str | None) -> List[str]:
    blocked = {name_col}
    if email_col:
        blocked.add(email_col)
    if attendance_col:
        blocked.add(attendance_col)
    return [col for col in columns if col not in blocked]


def _load_rows(csv_content: bytes) -> Tuple[List[dict], List[str]]:
    text_data = csv_content.decode("utf-8-sig")
    stream = io.StringIO(text_data)
    reader = csv.DictReader(stream)
    rows = list(reader)
    if not rows:
        raise ValueError("Uploaded CSV is empty.")
    if not reader.fieldnames:
        raise ValueError("CSV file does not contain a valid header row.")
    return rows, reader.fieldnames


def _calculate_percentiles(averages: List[float]) -> List[float]:
    total = len(averages)
    percentiles = []
    for value in averages:
        less_or_equal = sum(1 for current in averages if current <= value)
        percentiles.append(round((less_or_equal / total) * 100, 2))
    return percentiles


def analyze_csv(csv_content: bytes) -> Dict:
    rows, columns = _load_rows(csv_content)
    col_map = _normalize_column_map(columns)

    name_col = _pick_column(col_map, NAME_COLS)
    email_col = _pick_column(col_map, EMAIL_COLS)
    attendance_col = _pick_column(col_map, ATTENDANCE_COLS)

    if not name_col:
        raise ValueError("Dataset must include a Name column.")

    subject_cols = _find_subject_columns(columns, name_col, email_col, attendance_col)
    if not subject_cols:
        raise ValueError("Dataset must include at least one subject/marks column.")

    subject_non_missing = {subject: [] for subject in subject_cols}
    parsed_subjects = []

    for row in rows:
        current_subjects = {}
        for subject in subject_cols:
            value = _parse_numeric(row.get(subject, ""))
            current_subjects[subject] = value
            if value is not None:
                subject_non_missing[subject].append(value)
        parsed_subjects.append(current_subjects)

    subject_means = {}
    for subject in subject_cols:
        values = subject_non_missing[subject]
        subject_means[subject] = round(fmean(values), 2) if values else 0.0

    cleaned_students = []
    averages = []

    for idx, row in enumerate(rows):
        formatted_name = _format_name(row.get(name_col, ""))

        if email_col:
            email_value = str(row.get(email_col, "")).strip().lower()
        else:
            email_value = ""
        if not email_value:
            email_value = _generate_email(formatted_name)

        attendance_value = None
        if attendance_col:
            attendance_raw = _parse_numeric(row.get(attendance_col, ""))
            attendance_value = round(min(100.0, max(0.0, attendance_raw if attendance_raw is not None else 0.0)), 2)

        processed_marks = {}
        for subject in subject_cols:
            parsed = parsed_subjects[idx][subject]
            processed_marks[subject] = round(parsed if parsed is not None else subject_means[subject], 2)

        total = round(sum(processed_marks.values()), 2)
        average = round(total / len(subject_cols), 2)
        gpa = round(min(10.0, average / 10.0), 2)

        student_record = {
            "name": formatted_name,
            "email": email_value,
            "attendance": attendance_value,
            "marks": processed_marks,
            "total": total,
            "average": average,
            "gpa": gpa,
        }

        cleaned_students.append(student_record)
        averages.append(average)

    percentiles = _calculate_percentiles(averages)
    for i, student in enumerate(cleaned_students):
        student["percentile"] = percentiles[i]
        student["remark"] = _score_to_remark(student["average"])

    class_average = round(fmean(averages), 2) if averages else 0.0
    class_gpa = round(fmean([student["gpa"] for student in cleaned_students]), 2) if cleaned_students else 0.0

    subject_stats = []
    for subject in subject_cols:
        marks = [student["marks"][subject] for student in cleaned_students]
        subject_stats.append(
            {
                "subject": subject,
                "average": round(fmean(marks), 2) if marks else 0.0,
                "std_dev": round(_population_std(marks), 2),
                "min": round(min(marks), 2) if marks else 0.0,
                "max": round(max(marks), 2) if marks else 0.0,
            }
        )

    top_students = sorted(
        [student for student in cleaned_students if student["percentile"] >= 90],
        key=lambda student: student["percentile"],
        reverse=True,
    )

    students_payload = []
    for student in cleaned_students:
        payload = {
            "name": student["name"],
            "email": student["email"],
            "total": student["total"],
            "average": student["average"],
            "gpa": student["gpa"],
            "percentile": student["percentile"],
            "remark": student["remark"],
        }
        if attendance_col:
            payload["attendance"] = student["attendance"]
        students_payload.append(payload)

    top_students_payload = [
        {
            "name": student["name"],
            "email": student["email"],
            "average": student["average"],
            "gpa": student["gpa"],
            "percentile": student["percentile"],
        }
        for student in top_students
    ]

    return {
        "summary": {
            "student_count": len(cleaned_students),
            "subject_count": len(subject_cols),
            "class_average": class_average,
            "class_gpa": class_gpa,
        },
        "subject_stats": subject_stats,
        "top_10_percent": top_students_payload,
        "students": students_payload,
    }
