from pydantic import BaseModel, EmailStr, Field
from typing import List


class SendFormEmailRequest(BaseModel):

    recipients: List[EmailStr] = Field(
        ...,
        min_length=1,
        description="List of recipient email addresses"
    )

    form_id: int

    message: str = Field(
        default="Please fill out this form.",
        max_length=2000
    )