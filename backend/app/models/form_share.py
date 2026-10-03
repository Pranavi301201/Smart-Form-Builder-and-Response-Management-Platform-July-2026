from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.database import Base


class FormShare(Base):

    __tablename__ = "form_shares"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    # The form being shared
    form_id = Column(
        Integer,
        ForeignKey("forms.id"),
        nullable=False
    )


    # User who owns/shares the form
    owner_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # User receiving access to the form
    shared_with_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


    # Access permission: "view" or "edit"
    access = Column(
        String,
        nullable=False,
        default="view"
    )


    # Date and time when the form was shared
    shared_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )