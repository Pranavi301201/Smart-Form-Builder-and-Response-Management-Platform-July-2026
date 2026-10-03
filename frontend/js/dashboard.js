// =========================================================
// SMART FORMS DASHBOARD
// =========================================================


// =========================================================
// DOM ELEMENTS
// =========================================================

const recentFormsContainer =
    document.getElementById("recentForms");

const activityContainer =
    document.getElementById("activity");


// =========================================================
// API URL
// =========================================================

const API_BASE =
    "http://127.0.0.1:8000";


// =========================================================
// LOAD DASHBOARD
// =========================================================

async function loadDashboard() {

    try {

        let response;

        /*
         * Your project currently has /forms/my.
         * We try that first.
         */

        response = await fetch(
            `${API_BASE}/forms/my`
        );


        /*
         * If the endpoint is not available,
         * fall back to /forms so your existing
         * backend can still work.
         */

        if (!response.ok) {

            response = await fetch(
                `${API_BASE}/forms`
            );

        }


        if (!response.ok) {

            throw new Error(
                "Unable to load forms"
            );

        }


        const data =
            await response.json();


        /*
         * Supports both:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * and:
         *
         * {
         *   forms: [...]
         * }
         */

        const forms =
            Array.isArray(data)
                ? data
                : (data.forms || []);


        updateStatistics(forms);

        loadRecentForms(forms);

        loadActivity(forms);

        updateGettingStarted(forms);


    }

    catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

        showDashboardError();

    }

}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStatistics(forms) {

    const totalForms =
        document.getElementById(
            "totalForms"
        );

    const totalResponses =
        document.getElementById(
            "totalResponses"
        );

    const todayResponses =
        document.getElementById(
            "todayResponses"
        );

    const totalViews =
        document.getElementById(
            "totalViews"
        );


    // -----------------------------------------
    // Total Forms
    // -----------------------------------------

    totalForms.textContent =
        forms.length;


    // -----------------------------------------
    // Total Responses
    // -----------------------------------------

    let responses = 0;

    forms.forEach(form => {

        responses +=
            Number(form.responses || 0);

    });


    totalResponses.textContent =
        responses;


    // -----------------------------------------
    // Today's Responses
    //
    // We don't fake this number.
    // It will become dynamic when the backend
    // provides a date-wise response count.
    // -----------------------------------------

    todayResponses.textContent =
        "0";


    // -----------------------------------------
    // Total Views
    // -----------------------------------------

    let views = 0;

    forms.forEach(form => {

        views +=
            Number(form.views || 0);

    });


    totalViews.textContent =
        views;

}


// =========================================================
// RECENT FORMS
// =========================================================

function loadRecentForms(forms) {

    recentFormsContainer.innerHTML =
        "";


    // -----------------------------------------
    // Empty State
    // -----------------------------------------

    if (!forms.length) {

        recentFormsContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="fa-solid fa-file-circle-plus"></i>

                </div>

                <h3>No forms created yet</h3>

                <p>
                    Create your first smart form to get started.
                </p>

            </div>

        `;

        return;

    }


    // -----------------------------------------
    // Show latest 5 forms
    // -----------------------------------------

    forms
        .slice(0, 5)
        .forEach(form => {

            const title =
                escapeHTML(
                    form.title ||
                    "Untitled Form"
                );


            const fieldCount =
                Array.isArray(form.fields)
                    ? form.fields.length
                    : 0;


            const status =
                form.status ||
                "draft";


            const statusText =
                status.charAt(0).toUpperCase() +
                status.slice(1);


            const formElement =
                document.createElement("div");


            formElement.className =
                "recent-form";


            formElement.innerHTML = `

                <div class="form-info">

                    <div class="form-icon">

                        <i class="fa-regular fa-file-lines"></i>

                    </div>

                    <div class="form-details">

                        <h4 title="${title}">
                            ${title}
                        </h4>

                        <p>
                            ${fieldCount} field${fieldCount === 1 ? "" : "s"}
                            &nbsp;•&nbsp;
                            ${statusText}
                        </p>

                    </div>

                </div>


                <span class="form-status">

                    ${statusText}

                </span>


<button
    class="form-view"
    onclick="location.href='fill-form.html?id=${form.id}'">

    View

</button>

            `;


            recentFormsContainer.appendChild(
                formElement
            );

        });

}


// =========================================================
// RECENT ACTIVITY
// =========================================================

function loadActivity(forms) {

    activityContainer.innerHTML =
        "";


    // -----------------------------------------
    // No activity
    // -----------------------------------------

    if (!forms.length) {

        activityContainer.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="fa-solid fa-clock"></i>

                </div>

                <h3>No activity yet</h3>

                <p>
                    Your recent form activity will appear here.
                </p>

            </div>

        `;

        return;

    }


    // -----------------------------------------
    // Display latest forms
    // -----------------------------------------

    forms
        .slice(0, 5)
        .forEach(form => {

            const title =
                escapeHTML(
                    form.title ||
                    "Untitled Form"
                );


            const activity =
                document.createElement("div");


            activity.className =
                "activity-item";


            activity.innerHTML = `

                <div class="activity-icon">

                    <i class="fa-solid fa-file-circle-plus"></i>

                </div>


                <div class="activity-info">

                    <h4>
                        ${title}
                    </h4>

                    <p>
                        Form created successfully
                    </p>

                </div>

            `;


            activityContainer.appendChild(
                activity
            );

        });

}


// =========================================================
// GETTING STARTED CARD
// =========================================================

function updateGettingStarted(forms) {

    const card =
        document.getElementById(
            "gettingStarted"
        );


    if (!card) {
        return;
    }


    /*
     * Once the user has forms,
     * make the card less prominent.
     */

    if (forms.length > 0) {

        card.style.opacity =
            "0.85";

    }

}


// =========================================================
// SEARCH FORMS
// =========================================================

const searchInput =
    document.getElementById(
        "dashboardSearch"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchValue =
                this.value
                    .toLowerCase()
                    .trim();


            const formItems =
                document.querySelectorAll(
                    ".recent-form"
                );


            formItems.forEach(item => {

                const text =
                    item.innerText
                        .toLowerCase();


                if (
                    text.includes(
                        searchValue
                    )
                ) {

                    item.style.display =
                        "flex";

                }
                else {

                    item.style.display =
                        "none";

                }

            });

        }
    );

}


// =========================================================
// MOBILE SIDEBAR
// =========================================================

const mobileMenu =
    document.querySelector(
        ".mobile-menu"
    );

const sidebar =
    document.querySelector(
        ".sidebar"
    );


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// DASHBOARD ERROR
// =========================================================

function showDashboardError() {

    recentFormsContainer.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">

                <i class="fa-solid fa-cloud-exclamation"></i>

            </div>

            <h3>Unable to load forms</h3>

            <p>
                Please make sure the backend server is running.
            </p>

        </div>

    `;


    activityContainer.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">

                <i class="fa-solid fa-server"></i>

            </div>

            <h3>Server unavailable</h3>

            <p>
                Start your FastAPI server and refresh the page.
            </p>

        </div>

    `;

}


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboard();

    }
);
// =========================================================
// QUICK VIEW FORM
// =========================================================

async function quickViewForm(formId) {

    try {

        const response =
            await fetch(
                `${API_BASE}/forms/${formId}`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load form"
            );

        }

        const form =
            await response.json();

        console.log(
            "Quick View Form:",
            form
        );

        // Store selected form temporarily
        sessionStorage.setItem(
            "quickViewForm",
            JSON.stringify(form)
        );

        // Open quick view page
        window.location.href =
            `quick-view.html?id=${formId}`;

    }
    catch (error) {

        console.error(
            "Quick view error:",
            error
        );

        alert(
            "Unable to open this form."
        );

    }

}