from pydantic import BaseModel, Field


class DocumentIn(BaseModel):
    role: str = Field(..., description="e.g. POI, POA")
    mime_type: str = "image/jpeg"
    content_base64: str


class KycRecordIn(BaseModel):
    customer_type: str = Field(..., pattern="^(individual|legal)$")
    fi_reference_no: str | None = None
    name: str
    fathers_name_or_na: str | None = ""
    pan: str | None = None
    dob: str | None = None
    gender: str | None = None
    aadhaar_last4: str | None = None
    id_json: dict[str, str] | None = None
    constitution_type: str | None = None
    place_of_incorporation: str | None = None
    age: str | None = None
    kyc_date: str | None = None
    updated_date: str | None = None
    photo_base64: str | None = None
    image_type: str | None = "jpg"
    identity_rows: list[dict[str, str]] | None = None
    documents: list[DocumentIn] | None = None


class BatchUploadIn(BaseModel):
    fi_code: str = Field(..., min_length=3, max_length=6)
    batch_reference: str | None = None
    records: list[KycRecordIn]
    simulate_checker_approve: bool = False


class FiRegisterIn(BaseModel):
    fi_code: str = Field(..., min_length=3, max_length=6)
    name: str
    fi_public_key_pem: str
    registered_ip: str | None = None
