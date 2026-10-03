# =========================================================
# Smart Form Builder
# Email Service
# =========================================================

import os
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

SENDER_NAME = os.getenv(
    "SENDER_NAME",
    "Smart Form Builder"
)


# =========================================================
# SEND FORM EMAIL
# =========================================================

def send_form_email(
    recipient_email: str,
    form_title: str,
    form_link: str,
    message: str = ""
):
    """
    Send a Smart Form Builder invitation email
    to one recipient.
    """

    if not SMTP_HOST:
        raise ValueError("SMTP_HOST is not configured.")

    if not SMTP_USERNAME:
        raise ValueError("SMTP_USERNAME is not configured.")

    if not SMTP_PASSWORD:
        raise ValueError("SMTP_PASSWORD is not configured.")


    # =====================================================
    # EMAIL SUBJECT
    # =====================================================

    subject = f"Please fill out the form - {form_title}"


    # =====================================================
    # DEFAULT MESSAGE
    # =====================================================

    if not message:

        message = (
            "You have been invited to fill out this form."
        )


    # =====================================================
    # HTML EMAIL
    # =====================================================

    html_content = f"""
    <!DOCTYPE html>

    <html>

    <head>

        <meta charset="UTF-8">

        <meta name="viewport"
              content="width=device-width, initial-scale=1.0">

    </head>

    <body style="
        margin:0;
        padding:0;
        background:#f4f8fc;
        font-family:Arial, Helvetica, sans-serif;
    ">

        <div style="
            max-width:600px;
            margin:40px auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 5px 20px rgba(0,0,0,0.08);
        ">

            <!-- HEADER -->

            <div style="
                background:#2563eb;
                padding:25px;
                text-align:center;
                color:#ffffff;
            ">

                <h1 style="
                    margin:0;
                    font-size:24px;
                ">
                    Smart Forms
                </h1>

            </div>


            <!-- CONTENT -->

            <div style="
                padding:35px;
                color:#333333;
            ">

                <h2 style="
                    margin-top:0;
                    color:#2563eb;
                ">
                    {form_title}
                </h2>


                <p style="
                    font-size:15px;
                    line-height:1.7;
                ">
                    {message}
                </p>


                <p style="
                    font-size:15px;
                    line-height:1.7;
                ">
                    Please click the button below to open
                    and complete the form.
                </p>


                <!-- BUTTON -->

                <div style="
                    text-align:center;
                    margin:30px 0;
                ">

                    <a href="{form_link}"
                       style="
                           display:inline-block;
                           background:#2563eb;
                           color:#ffffff;
                           text-decoration:none;
                           padding:14px 30px;
                           border-radius:10px;
                           font-size:15px;
                           font-weight:bold;
                       ">

                        Fill Out Form

                    </a>

                </div>


                <!-- FALLBACK LINK -->

                <p style="
                    font-size:13px;
                    color:#777777;
                    word-break:break-all;
                ">

                    If the button does not work, use this link:

                    <br><br>

                    <a href="{form_link}"
                       style="color:#2563eb;">

                        {form_link}

                    </a>

                </p>

            </div>


            <!-- FOOTER -->

            <div style="
                background:#f8fafc;
                padding:20px;
                text-align:center;
                color:#777777;
                font-size:12px;
            ">

                Sent using Smart Form Builder

            </div>

        </div>

    </body>

    </html>
    """


    # =====================================================
    # CREATE EMAIL
    # =====================================================

    email = MIMEMultipart("alternative")

    email["From"] = f"{SENDER_NAME} <{SMTP_USERNAME}>"

    email["To"] = recipient_email

    email["Subject"] = subject


    # =====================================================
    # PLAIN TEXT VERSION
    # =====================================================

    plain_text = f"""
{form_title}

{message}

Please fill out the form using the link below:

{form_link}

Thank you,
{SENDER_NAME}
"""


    email.attach(
        MIMEText(
            plain_text,
            "plain"
        )
    )


    # =====================================================
    # HTML VERSION
    # =====================================================

    email.attach(
        MIMEText(
            html_content,
            "html"
        )
    )


    # =====================================================
    # CONNECT TO SMTP SERVER
    # =====================================================

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT
    ) as server:

        # Secure the connection

        server.starttls()


        # Login

        server.login(
            SMTP_USERNAME,
            SMTP_PASSWORD
        )


        # Send

        server.sendmail(
            SMTP_USERNAME,
            recipient_email,
            email.as_string()
        )


    return True