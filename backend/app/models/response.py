from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.sql import func

from app.database.database import Base


class Response(Base):

    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)

    form_id = Column(
        Integer,
        ForeignKey("forms.id"),
        nullable=False
    )

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    answers = Column(
        JSON,
        nullable=False
    )