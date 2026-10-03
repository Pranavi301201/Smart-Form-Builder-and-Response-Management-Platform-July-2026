from fastapi import APIRouter, Depends, HTTPException,BackgroundTasks
from sqlalchemy.orm import Session
from fastapi import Body

responses_storage = {}
from app.database.database import get_db
from app.models.form import Form
from app.schemas.form import FormCreate, FormUpdate, SendFormEmail
from uuid import uuid4
from app.models.response import Response
from app.schemas.response import ResponseCreate
from app.models.user import User
from app.models.form_share import FormShare
from app.schemas.form_share import FormShareCreate
from app.services.email_service import send_form_email
from app.services.ai_form_service import generate_form_from_description
router = APIRouter(
    prefix="/forms",
    tags=["Forms"]
)


# =========================
# CREATE FORM
# POST /forms/
# =========================

@router.post("/")
def create_form(
    form: FormCreate,
    db: Session = Depends(get_db)
):

    new_form = Form(
    owner_id=1,
    title=form.title,
    description=form.description,
    fields=[
        field.model_dump()
        for field in form.fields
    ],
    conditional_rules=[
        rule.model_dump()
        for rule in form.conditionalRules
    ],
    status="draft"
)
    db.add(new_form)
    db.commit()
    db.refresh(new_form)

    return new_form


# =========================
# GET MY FORMS
# GET /forms/my
# =========================

@router.get("/my")
def get_my_forms(
    db: Session = Depends(get_db)
):

    forms = (
        db.query(Form)
        .filter(Form.owner_id == 1)
        .all()
    )

    result = []

    for form in forms:

        response_count = (
            db.query(Response)
            .filter(Response.form_id == form.id)
            .count()
        )

        form_data = {
            column.name: getattr(form, column.name)
            for column in Form.__table__.columns
        }

        form_data["responses"] = response_count

        result.append(form_data)

    return result

# =========================================================
# AI FORM GENERATOR
# POST /forms/ai-generate
# =========================================================

@router.post("/ai-generate")
def ai_generate_form(
    data: dict = Body(...),
    db: Session = Depends(get_db)
):

    # =====================================================
    # GET DESCRIPTION
    # =====================================================

    description = data.get("description", "").strip()

    if not description:

        raise HTTPException(
            status_code=400,
            detail="Please describe the form you want to create."
        )

    if len(description) < 10:

        raise HTTPException(
            status_code=400,
            detail="Please provide a more detailed description."
        )

    # =====================================================
    # GENERATE FORM USING AI
    # =====================================================

    try:

        generated_form = generate_form_from_description(
            description
        )

    except Exception as error:

        print(
            "AI form generation error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate form using AI."
        )

    # =====================================================
    # RETURN GENERATED FORM
    # =====================================================

    return {
        "message": "Form generated successfully",
        "form": generated_form
    }
# =========================
# GET SINGLE FORM
# GET /forms/{form_id}
# =========================

@router.get("/{form_id}")
def get_form(
    form_id: int,
    db: Session = Depends(get_db)
):

    form = (
        db.query(Form)
        .filter(
            Form.id == form_id,
            
        )
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    return form


# =========================
# UPDATE FORM
# PUT /forms/{form_id}
# =========================

@router.put("/{form_id}")
def update_form(
    form_id: int,
    updated_form: FormUpdate,
    db: Session = Depends(get_db)
):

    form = (
        db.query(Form)
        .filter(
            Form.id == form_id,
            Form.owner_id == 1
        )
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    form.title = updated_form.title

    form.description = updated_form.description

    form.fields = [
        field.model_dump()
        for field in updated_form.fields
    ]
    form.conditional_rules = [
    rule.model_dump()
    for rule in updated_form.conditionalRules
]

    db.commit()
    db.refresh(form)

    return form

# =========================
# PUBLISH FORM
# PATCH /forms/{form_id}/publish
# =========================

@router.patch("/{form_id}/publish")
def publish_form(
    form_id: int,
    db: Session = Depends(get_db)
):

    form = (
        db.query(Form)
        .filter(
            Form.id == form_id,
            
        )
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    form.status = "published"

    db.commit()
    db.refresh(form)

    return {
        "message": "Form published successfully",
        "form": form
    }


# =========================
# ARCHIVE FORM
# PATCH /forms/{form_id}/archive
# =========================

@router.patch("/{form_id}/archive")
def archive_form(
    form_id: int,
    db: Session = Depends(get_db)
):

    form = (
        db.query(Form)
        .filter(
            Form.id == form_id,
            Form.owner_id == 1
        )
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    form.status = "archived"

    db.commit()
    db.refresh(form)

    return {
        "message": "Form archived successfully",
        "form": form
    }


# =========================
# DELETE FORM
# DELETE /forms/{form_id}
# =========================

# =========================
# DELETE FORM
# DELETE /forms/{form_id}
# =========================

@router.delete("/{form_id}")
def delete_form(
    form_id: int,
    db: Session = Depends(get_db)
):

    # =========================
    # FIND FORM
    # =========================

    form = (
        db.query(Form)
        .filter(Form.id == form_id)
        .first()
    )

    if not form:

        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    try:

        # =========================
        # DELETE RESPONSES FIRST
        # =========================

        db.query(Response).filter(
            Response.form_id == form_id
        ).delete(
            synchronize_session=False
        )

        # Make sure response deletion happens
        db.flush()

        # =========================
        # DELETE FORM
        # =========================

        db.delete(form)

        db.commit()

        return {
            "message": "Form deleted successfully"
        }

    except Exception as error:

        db.rollback()

        print(
            "Delete form error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to delete form"
        )
# =========================
# SUBMIT FORM RESPONSE
# POST /forms/{form_id}/submit
# =========================

@router.post("/{form_id}/submit")
def submit_form(
    form_id: int,
    response: ResponseCreate,
    db: Session = Depends(get_db)
):

    form = (
        db.query(Form)
        .filter(Form.id == form_id)
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    new_response = Response(
        form_id=form_id,
        answers=[
            answer.model_dump()
            for answer in response.responses
        ]
    )

    db.add(new_response)
    db.commit()
    db.refresh(new_response)

    return {
        "message": "Response submitted successfully"
    }
# =========================
# GET FORM RESPONSES
# GET /forms/{form_id}/responses
# =========================

@router.get("/{form_id}/responses")
def get_form_responses(
    form_id: int,
    db: Session = Depends(get_db)
):

    form = (
        db.query(Form)
        .filter(Form.id == form_id)
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    responses = (
        db.query(Response)
        .filter(Response.form_id == form_id)
        .order_by(Response.submitted_at.desc())
        .all()
    )
    return responses

    
# =========================
# GET ALL RESPONSES
# GET /responses
# =========================

from app.models.form import Form

@router.get("/responses/all")
def get_all_responses(
    db: Session = Depends(get_db)
):

    responses = (
        db.query(Response)
        .order_by(Response.submitted_at.desc())
        .all()
    )

    return responses
# =========================
# FORM ANALYTICS
# GET /forms/{form_id}/analytics
# =========================


@router.get("/{form_id}/analytics")
def get_form_analytics(
    form_id: int,
    db: Session = Depends(get_db)
):

    form = (
        db.query(Form)
        .filter(Form.id == form_id)
        .first()
    )

    if not form:
        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )

    total_responses = (
        db.query(Response)
        .filter(Response.form_id == form_id)
        .count()
    )

    # Temporary value (later we'll track real views)
    total_views = max(total_responses, 1)

    completion_rate = round(
        (total_responses / total_views) * 100,
        2
    )

    drop_off_rate = round(
        100 - completion_rate,
        2
    )

    return {
        "views": total_views,
        "responses": total_responses,
        "completion_rate": completion_rate,
        "drop_off_rate": drop_off_rate
    }
# =========================================================
# SEND FORM VIA EMAIL
# POST /forms/{form_id}/send-email
# =========================================================

@router.post("/{form_id}/send-email")
def send_form_via_email(
    form_id: int,
    email_data: SendFormEmail,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

    # =====================================================
    # FIND FORM
    # =====================================================

    form = (
        db.query(Form)
        .filter(
            Form.id == form_id,
            Form.owner_id == 1
        )
        .first()
    )

    if not form:

        raise HTTPException(
            status_code=404,
            detail="Form not found"
        )


    # =====================================================
    # CHECK FORM STATUS
    # =====================================================

    if form.status != "published":

        raise HTTPException(
            status_code=400,
            detail="Only published forms can be sent via email."
        )


    # =====================================================
    # REMOVE DUPLICATE EMAILS
    # =====================================================

    recipients = list(
        dict.fromkeys(
            email.strip()
            for email in email_data.recipients
            if email.strip()
        )
    )


    # =====================================================
    # CHECK RECIPIENTS
    # =====================================================

    if not recipients:

        raise HTTPException(
            status_code=400,
            detail="At least one recipient email is required."
        )


    # =====================================================
    # CREATE PUBLIC FORM LINK
    # =====================================================

    form_link = (
    f"http://127.0.0.1:5500/frontend/fill-form.html?id={form.id}"
)


    # =====================================================
    # EMAIL SUBJECT
    # =====================================================

    subject = (
        email_data.subject
        if email_data.subject
        else f"Please fill out the form - {form.title}"
    )


    # =====================================================
    # EMAIL MESSAGE
    # =====================================================

    message = (
        email_data.message
        if email_data.message
        else "You have been invited to fill out this form."
    )


    # =====================================================
    # SEND EMAILS IN BACKGROUND
    # =====================================================

    for recipient in recipients:

        background_tasks.add_task(
            send_form_email,
            recipient_email=recipient,
            form_title=form.title,
            form_link=form_link,
            message=message
        )


    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "message": "Email sending started successfully.",
        "form_id": form.id,
        "form_title": form.title,
        "total_recipients": len(recipients)
    }