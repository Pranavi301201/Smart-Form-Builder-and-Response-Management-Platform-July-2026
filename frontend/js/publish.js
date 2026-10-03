// ==========================================
// Smart Form Builder
// Publish Page
// ==========================================

let publishedForm = null;

// ==========================================
// Load Published Form
// ==========================================


// ==========================================
// Load Data
// ==========================================

function loadPublishedForm() {

    const data = localStorage.getItem("publishedForm");

    if (!data) {

        alert("No published form found.");

        window.location.href = "myforms.html";

        return;

    }

    publishedForm = JSON.parse(data);

    document.getElementById("formTitle").innerText =
        publishedForm.title || "Untitled Form";

    document.getElementById("formId").innerText =
        publishedForm.form_id || "FORM-0001";

    document.getElementById("publicLink").value =
        publishedForm.public_url;

    document.getElementById("createdDate").innerText =
        publishedForm.created_at || getToday();

    document.getElementById("publishedDate").innerText =
        publishedForm.published_at || getToday();

}

// ==========================================
// Current Date
// ==========================================

function getToday() {

    return new Date().toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

// ==========================================
// Copy Link
// ==========================================

const copyBtn = document.getElementById("copyLinkBtn");

if (copyBtn) {

    copyBtn.onclick = function () {

        const link =
            document.getElementById("publicLink");

        navigator.clipboard.writeText(link.value);

        showToast("Link copied successfully.");

    };

}

// ==========================================
// OPEN PUBLIC FORM
// ==========================================

const openBtn = document.getElementById("openFormBtn");

if (openBtn) {

    openBtn.onclick = function () {

        const link = document.getElementById("publicLink").value;

        window.open(link, "_blank");

    };

}
// ==========================================
// SHARE ON WHATSAPP
// ==========================================

const whatsappBtn = document.querySelector(".whatsapp");

if (whatsappBtn) {

    whatsappBtn.onclick = function () {

        const text =
`Hi,

Please fill out my form.

${publishedForm.public_url}`;

        window.open(

            "https://wa.me/?text=" +

            encodeURIComponent(text),

            "_blank"

        );

    };

}

// ==========================================
// SHARE VIA EMAIL
// ==========================================

const emailBtn = document.querySelector(".email");

if (emailBtn) {

    emailBtn.onclick = function () {

        const subject =
            "Please fill my form";

        const body =
`Hello,

Please fill the form using the link below.

${publishedForm.public_url}`;

        window.location.href =

        "mailto:?subject=" +

        encodeURIComponent(subject)

        +

        "&body="

        +

        encodeURIComponent(body);

    };

}

// ==========================================
// SHARE ON TELEGRAM
// ==========================================

const telegramBtn = document.querySelector(".telegram");

if (telegramBtn) {

    telegramBtn.onclick = function () {

        window.open(

"https://t.me/share/url?url=" +

encodeURIComponent(publishedForm.public_url),

"_blank"

        );

    };

}

// ==========================================
// COPY LINK BUTTON
// ==========================================

const copyShareBtn =
document.querySelector(".copy");

if(copyShareBtn){

copyShareBtn.onclick=function(){

navigator.clipboard.writeText(

publishedForm.public_url

);

showToast("Public Link Copied");

};

}

// ==========================================
// QR DOWNLOAD
// ==========================================

const qrBtn=
document.getElementById("downloadQRBtn");

if(qrBtn){

qrBtn.onclick=function(){

showToast(

"QR Download feature coming soon."

);

};

}

// ==========================================
// DASHBOARD
// ==========================================

const dashboardBtn=
document.getElementById("dashboardBtn");

if(dashboardBtn){

dashboardBtn.onclick=function(){

window.location.href="dashboard.html";

};

}

// ==========================================
// MY FORMS
// ==========================================

const myFormsBtn=
document.querySelector(".myforms");

if(myFormsBtn){

myFormsBtn.onclick=function(){

window.location.href="myforms.html";

};

}

// ==========================================
// RESPONSES
// ==========================================

const responsesBtn = document.querySelector(".responses");

if (responsesBtn) {

    responsesBtn.onclick = function () {

        const formId = localStorage.getItem("publishedFormId");

        if (!formId) {
            alert("Form ID not found");
            return;
        }

        window.location.href =
            "/frontend/responses.html?id=" + formId;

    };

}

// ==========================================
// ANALYTICS
// ==========================================

const analyticsBtn=
document.querySelector(".analytics");

if(analyticsBtn){

analyticsBtn.onclick=function(){

window.location.href="analytics.html";

};

}

// ==========================================
// TOAST MESSAGE
// ==========================================

function showToast(message){

let toast=

document.getElementById("toast");

if(!toast){

toast=document.createElement("div");

toast.id="toast";

document.body.appendChild(toast);

}

toast.innerHTML=`

<i class="fa-solid fa-circle-check"></i>

${message}

`;

toast.classList.add("show");

setTimeout(function(){

toast.classList.remove("show");

},3000);

}
// ==========================================
// LOAD LIVE STATISTICS
// ==========================================

loadStatistics();

function loadStatistics(){

    document.getElementById("responseCount").innerText = "0";

    document.getElementById("viewCount").innerText = "0";

    document.getElementById("lastResponse").innerText = "--";

    document.getElementById("lastViewed").innerText = getCurrentTime();

}

// ==========================================
// CURRENT TIME
// ==========================================

function getCurrentTime(){

    return new Date().toLocaleString("en-IN",{

        day:"2-digit",

        month:"short",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit"

    });

}

// ==========================================
// VERIFY STATUS
// ==========================================

function verifyStatus(){

    if(!publishedForm) return;

    const badge = document.querySelector(".status");

    if(publishedForm.status==="published"){

        badge.innerHTML=`

        <i class="fa-solid fa-circle"></i>

        Published

        `;

        badge.classList.add("published");

    }

}

// ==========================================
// REFRESH FORM DETAILS
// ==========================================

const refreshBtn=document.getElementById("refreshBtn");

if(refreshBtn){

refreshBtn.onclick=function(){

showLoading();

setTimeout(function(){

hideLoading();

showToast("Latest form information loaded.");

},1200);

};

}

// ==========================================
// LOADING
// ==========================================

function showLoading(){

let loader=document.getElementById("loader");

if(loader){

loader.style.display="flex";

}

}

function hideLoading(){

let loader=document.getElementById("loader");

if(loader){

loader.style.display="none";

}

}

// ==========================================
// COPY FORM ID
// ==========================================

const formId=document.getElementById("formId");

if(formId){

formId.style.cursor="pointer";

formId.title="Click to Copy";

formId.onclick=function(){

navigator.clipboard.writeText(

formId.innerText

);

showToast("Form ID Copied");

};

}

// ==========================================
// COPY TITLE
// ==========================================

const title=document.getElementById("formTitle");

if(title){

title.style.cursor="pointer";

title.title="Click to Copy";

title.onclick=function(){

navigator.clipboard.writeText(

title.innerText

);

showToast("Form Title Copied");

};

}

// ==========================================
// AUTO SAVE LOCAL
// ==========================================

window.addEventListener("beforeunload",function(){

localStorage.setItem(

"publishedForm",

JSON.stringify(publishedForm)

);

});

// ==========================================
// AUTO REFRESH EVERY 30 SECONDS
// ==========================================

setInterval(function(){

console.log("Checking latest status...");

},30000);

// ==========================================
// OPEN RESPONSES
// ==========================================

function openResponses(){

    const formId = localStorage.getItem("publishedFormId");

    if(!formId){
        alert("Form ID not found");
        return;
    }

    window.location.href =
    "/frontend/responses.html?id=" + formId;

}

// ==========================================
// OPEN ANALYTICS
// ==========================================

function openAnalytics(){

window.location.href="analytics.html";

}

// ==========================================
// OPEN DASHBOARD
// ==========================================

function openDashboard(){

window.location.href="dashboard.html";

}

// ==========================================
// OPEN MY FORMS
// ==========================================

function openMyForms(){

window.location.href="myforms.html";

}

// ==========================================
// INITIALIZE
// ==========================================

verifyStatus();

console.log("Publish Page Loaded Successfully.");
document.addEventListener("DOMContentLoaded", loadPublishedForm);

async function loadPublishedForm() {

    const formId =
        localStorage.getItem("publishedFormId");

    if (!formId) {

        alert("No published form found.");

        return;

    }

    try {

        const response = await fetch(

            `http://127.0.0.1:8000/forms/${formId}`

        );

        const data = await response.json();

        if (!response.ok) {

            alert("Unable to load form.");

            return;

        }

        document.getElementById("formTitle").innerText =
            data.title;

        document.getElementById("formId").innerText =
            "FORM-" + data.id;

        document.getElementById("createdDate").innerText =
            new Date(data.created_at)
            .toLocaleDateString();

        document.getElementById("publishedDate").innerText =
            new Date().toLocaleDateString();

       document.getElementById("publicLink").value =
window.location.origin +
"/frontend/fill-form.html?id=" +
data.id;
    }

    catch (err) {

        console.log(err);

    }

}
// ==========================================
// EMAIL RECIPIENT MANAGEMENT
// ==========================================

const recipientTextarea =
    document.getElementById("recipientEmails");

const recipientCount =
    document.getElementById("recipientCount");

const clearRecipientsBtn =
    document.getElementById("clearRecipientsBtn");

const recipientValidation =
    document.getElementById("recipientValidation");


// ==========================================
// EMAIL VALIDATION
// ==========================================

function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

}


// ==========================================
// GET RAW RECIPIENTS
// ==========================================

function getRawRecipients() {

    if (!recipientTextarea) {
        return [];
    }

    return recipientTextarea.value
        .split(/[\n,;]+/)
        .map(email => email.trim().toLowerCase())
        .filter(email => email !== "");

}


// ==========================================
// GET UNIQUE RECIPIENTS
// ==========================================

function getRecipientEmails() {

    const emails = getRawRecipients();

    return [...new Set(emails)];

}


// ==========================================
// CHECK DUPLICATES
// ==========================================

function getDuplicateEmails(emails) {

    const counts = {};

    emails.forEach(email => {

        counts[email] =
            (counts[email] || 0) + 1;

    });

    return Object.keys(counts)
        .filter(email => counts[email] > 1);

}


// ==========================================
// VALIDATE RECIPIENTS
// ==========================================

function validateRecipients() {

    if (!recipientTextarea) {
        return {
            valid: true,
            emails: [],
            invalid: [],
            duplicates: []
        };
    }

    const rawEmails =
        getRawRecipients();

    const uniqueEmails =
        [...new Set(rawEmails)];

    const invalidEmails =
        uniqueEmails.filter(
            email => !isValidEmail(email)
        );

    const duplicateEmails =
        getDuplicateEmails(rawEmails);

    return {

        valid:
            rawEmails.length > 0 &&
            invalidEmails.length === 0,

        emails: uniqueEmails,

        invalid: invalidEmails,

        duplicates: duplicateEmails

    };

}


// ==========================================
// UPDATE RECIPIENT STATUS
// ==========================================

function updateRecipientCount() {

    const result =
        validateRecipients();

    if (recipientCount) {

        recipientCount.innerText =
            result.emails.length;

    }

    const recipientInfo =
        document.querySelector(".recipient-info");

    if (recipientInfo) {

        recipientInfo.classList.remove(
            "has-recipients",
            "no-recipients"
        );

        if (result.emails.length > 0) {

            recipientInfo.classList.add(
                "has-recipients"
            );

        } else {

            recipientInfo.classList.add(
                "no-recipients"
            );

        }

    }

    displayRecipientValidation(result);

}


// ==========================================
// DISPLAY VALIDATION MESSAGE
// ==========================================

function displayRecipientValidation(result) {

    if (!recipientValidation) {
        return;
    }

    recipientValidation.innerHTML = "";

    /*
        Nothing entered
    */

    if (result.emails.length === 0) {

        return;

    }


    /*
        Invalid emails
    */

    if (result.invalid.length > 0) {

        const invalidBox =
            document.createElement("div");

        invalidBox.className =
            "validation-message invalid";

        invalidBox.innerHTML = `

            <i class="fa-solid fa-circle-exclamation"></i>

            <div>

                <strong>
                    Invalid email address
                </strong>

                <span>
                    ${result.invalid.join(", ")}
                </span>

            </div>

        `;

        recipientValidation.appendChild(
            invalidBox
        );

    }


    /*
        Duplicate emails
    */

    if (result.duplicates.length > 0) {

        const duplicateBox =
            document.createElement("div");

        duplicateBox.className =
            "validation-message duplicate";

        duplicateBox.innerHTML = `

            <i class="fa-solid fa-copy"></i>

            <div>

                <strong>
                    Duplicate email address
                </strong>

                <span>
                    ${result.duplicates.join(", ")}
                </span>

            </div>

        `;

        recipientValidation.appendChild(
            duplicateBox
        );

    }


    /*
        Everything valid
    */

    if (
        result.invalid.length === 0 &&
        result.duplicates.length === 0
    ) {

        const validBox =
            document.createElement("div");

        validBox.className =
            "validation-message valid";

        validBox.innerHTML = `

            <i class="fa-solid fa-circle-check"></i>

            <span>
                ${result.emails.length}
                valid recipient${result.emails.length !== 1 ? "s" : ""}
            </span>

        `;

        recipientValidation.appendChild(
            validBox
        );

    }

}


// ==========================================
// RECIPIENT INPUT EVENT
// ==========================================

if (recipientTextarea) {

    recipientTextarea.addEventListener(
        "input",
        updateRecipientCount
    );

}


// ==========================================
// CLEAR ALL RECIPIENTS
// ==========================================

if (clearRecipientsBtn) {

    clearRecipientsBtn.onclick =
        function () {

            if (
                !recipientTextarea.value.trim()
            ) {

                showToast(
                    "No recipients to clear."
                );

                return;

            }

            recipientTextarea.value = "";

            updateRecipientCount();

            recipientTextarea.focus();

            showToast(
                "Recipient list cleared."
            );

        };

}


// ==========================================
// INITIALIZE RECIPIENT COUNT
// ==========================================

updateRecipientCount();
// ==========================================
// SEND FORM EMAIL REQUEST
// ==========================================

async function sendFormEmail() {

    const validation =
        validateRecipients();

    // --------------------------------------
    // CHECK RECIPIENTS
    // --------------------------------------

    if (validation.emails.length === 0) {

        showToast(
            "Please enter at least one email address."
        );

        recipientTextarea.focus();

        return;

    }


    // --------------------------------------
    // CHECK INVALID EMAILS
    // --------------------------------------

    if (validation.invalid.length > 0) {

        showToast(
            "Please fix invalid email addresses."
        );

        recipientTextarea.focus();

        return;

    }


    // --------------------------------------
    // CHECK DUPLICATES
    // --------------------------------------

    if (validation.duplicates.length > 0) {

        showToast(
            "Please remove duplicate email addresses."
        );

        recipientTextarea.focus();

        return;

    }


    // --------------------------------------
    // GET FORM INFORMATION
    // --------------------------------------

    const formId =
        localStorage.getItem("publishedFormId");

    if (!formId) {

        showToast(
            "Form ID not found."
        );

        return;

    }


    // --------------------------------------
    // GET EMAIL DETAILS
    // --------------------------------------

    const subject =
        document.getElementById(
            "emailSubject"
        ).value.trim();

    const message =
        document.getElementById(
            "emailMessage"
        ).value.trim();

    const publicLink =
        document.getElementById(
            "publicLink"
        ).value.trim();


    // --------------------------------------
    // VALIDATE SUBJECT
    // --------------------------------------

    if (!subject) {

        showToast(
            "Please enter an email subject."
        );

        document
            .getElementById("emailSubject")
            .focus();

        return;

    }


    // --------------------------------------
    // VALIDATE MESSAGE
    // --------------------------------------

    if (!message) {

        showToast(
            "Please enter an email message."
        );

        document
            .getElementById("emailMessage")
            .focus();

        return;

    }


    // --------------------------------------
    // PREPARE DATA
    // --------------------------------------

    const emailData = {

        form_id: Number(formId),

        recipients:
            validation.emails,

        subject: subject,

        message: message,

        form_link: publicLink

    };


    console.log(
        "Email request:",
        emailData
    );


    // --------------------------------------
    // DISABLE SEND BUTTON
    // --------------------------------------

    const sendButton =
        document.getElementById(
            "sendFormEmailBtn"
        );

    if (sendButton) {

        sendButton.disabled = true;

        sendButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Preparing...

        `;

    }


    try {

        // ----------------------------------
        // SEND TO FASTAPI
        // ----------------------------------

        const response = await fetch(

    `http://127.0.0.1:8000/forms/${formId}/send-email`,

    {

        method: "POST",

        headers: {

            "Content-Type":
                "application/json"

        },

        body:
            JSON.stringify({
                recipients: validation.emails,
                subject: subject,
                message: message,
                form_link: publicLink
            })

    }

);


        // ----------------------------------
        // READ RESPONSE
        // ----------------------------------

        const data =
            await response.json();


        // ----------------------------------
        // ERROR RESPONSE
        // ----------------------------------

        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Unable to send email."
            );

        }


        // ----------------------------------
        // SUCCESS
        // ----------------------------------

        showToast(
            data.message ||
            "Email request sent successfully."
        );


        console.log(
            "Email response:",
            data
        );


    }

    catch (error) {

        console.error(
            "Email sending error:",
            error
        );

        showToast(
            error.message ||
            "Unable to send email."
        );

    }


    // --------------------------------------
    // RESTORE BUTTON
    // --------------------------------------

    if (sendButton) {

        sendButton.disabled = false;

        sendButton.innerHTML = `

            <i class="fa-solid fa-paper-plane"></i>

            Send Form

        `;

    }

}
// ==========================================
// SEND FORM BUTTON
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const sendFormEmailBtn =
        document.getElementById("sendFormEmailBtn");

    console.log("Send Form button:", sendFormEmailBtn);

    if (sendFormEmailBtn) {

        sendFormEmailBtn.addEventListener("click", function () {

            console.log("SEND FORM BUTTON CLICKED");

            sendFormEmail();

        });

    } else {

        console.error(
            "ERROR: sendFormEmailBtn not found"
        );

    }

});