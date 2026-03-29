"""CKYC Search v1.3 ID validation (mock)."""

import re

# 4th char = entity type per CKYC (must be one of ABCFGHJLPT — not e.g. D or E)
PAN_PATTERN = re.compile(r"^[A-Z]{3}[ABCFGHJLPT][A-Z][0-9]{4}[A-Z]$")
CKYC_NUM_PATTERN = re.compile(r"^[1-6][0-9]{13}$")
CKYC_NUM_LEGAL_PATTERN = re.compile(r"^[7-9][0-9]{13}$")
# 14-character alphanumerics (CKYC Reference ID)
CKYC_REF_PATTERN = re.compile(r"^[A-Z0-9]{14}$")


def validate_id_no(id_type: str, id_no: str) -> str | None:
    """Return error message or None if OK."""
    id_no = id_no.strip()
    if id_type in ("A", "B", "D"):
        if len(id_no) > 20:
            return "Incorrect ID type or ID Number Validation failure"
    if id_type == "C":
        if len(id_no) != 10 or not PAN_PATTERN.match(id_no.upper()):
            return "Incorrect ID type or ID Number Validation failure"
    if id_type == "E":
        parts = id_no.split("|")
        if len(parts) != 4:
            return "Incorrect ID type or ID Number Validation failure"
        uid4, _name, dob, gender = parts
        if len(uid4) != 4 or not uid4.isdigit():
            return "Incorrect ID type or ID Number Validation failure"
        if gender not in ("M", "F", "T"):
            return "Incorrect ID type or ID Number Validation failure"
    if id_type == "F" and len(id_no) > 40:
        return "Incorrect ID type or ID Number Validation failure"
    if id_type == "G" and len(id_no) > 20:
        return "Incorrect ID type or ID Number Validation failure"
    if id_type == "Z":
        if len(id_no) != 14 or not id_no.isdigit():
            return "KYC Number should be of length 14 digits"
        if not (CKYC_NUM_PATTERN.match(id_no) or CKYC_NUM_LEGAL_PATTERN.match(id_no)):
            return "Incorrect ID type or ID Number Validation failure"
    if id_type == "Y":
        id_no = id_no.upper()
        if len(id_no) != 14:
            return "CKYC Reference ID should be of length 14 characters"
        if not CKYC_REF_PATTERN.match(id_no):
            return "Please enter valid CKYC Reference ID"
    if id_type in ("02", "03"):
        if len(id_no) > 60:
            return "Incorrect ID type or ID Number Validation failure"
    return None


def validate_request_id(request_id: str) -> str | None:
    rid = request_id.strip()
    if not rid.isdigit():
        return "Request Id should not exceed more than 8 digits"
    if len(rid) > 8:
        return "Request Id should not exceed more than 8 digits"
    return None
