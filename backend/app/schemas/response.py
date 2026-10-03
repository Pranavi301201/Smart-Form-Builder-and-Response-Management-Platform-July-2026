from pydantic import BaseModel
from typing import List


class Answer(BaseModel):
    field_name: str
    value: str


class ResponseCreate(BaseModel):
    responses: List[Answer]