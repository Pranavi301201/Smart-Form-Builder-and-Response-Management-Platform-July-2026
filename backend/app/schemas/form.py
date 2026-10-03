from pydantic import BaseModel, Field
from typing import List, Optional,Dict,Any


class FieldSchema(BaseModel):

    id: Optional[str] = None

    label: str

    type: str

    placeholder: Optional[str] = ""

    required: Optional[bool] = False

    readonly: Optional[bool] = False

    options: List[str] = Field(default_factory=list)

    page: int = 1

    condition: Optional[dict] = None
class Condition(BaseModel):
    field: str
    operator: str
    value: str


class Action(BaseModel):
    action: str
    field: str


class ConditionalRule(BaseModel):
    id: int
    enabled: bool = True
    priority: int = 1

    if_condition: Condition
    then: List[Action]

class FormCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    fields: List[FieldSchema] = Field(default_factory=list)

    conditionalRules: List[ConditionalRule] = Field(default_factory=list)


class FormUpdate(BaseModel):
    title: str
    description: Optional[str] = ""
    fields: List[FieldSchema] = Field(default_factory=list)

    conditionalRules: List[ConditionalRule] = Field(default_factory=list)
    # =========================================================
# SEND FORM EMAIL
# =========================================================

class SendFormEmail(BaseModel):

    recipients: List[str] = Field(
        ...,
        min_length=1
    )

    subject: Optional[str] = None

    message: Optional[str] = ""