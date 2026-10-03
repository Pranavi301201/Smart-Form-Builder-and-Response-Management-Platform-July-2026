from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func

from app.database.database import Base


class Form(Base):

    __tablename__ = "forms"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    owner_id = Column(
        Integer,
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        Text
    )

    fields = Column(
        JSON,
        nullable=False,
        default=list
    )

    conditional_rules = Column(
        JSON,
        nullable=False,
        default=list
    )

    status = Column(
        String(20),
        default="draft"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )