from pydantic import BaseModel, EmailStr
from typing import Literal


class FormShareCreate(BaseModel):

    # Email of the user receiving the form
    email: EmailStr

    # Permission given to that user
    access: Literal["view", "edit"]


class FormShareResponse(BaseModel):

    id: int

    form_id: int

    owner_id: int

    shared_with_user_id: int

    access: str

    email: str