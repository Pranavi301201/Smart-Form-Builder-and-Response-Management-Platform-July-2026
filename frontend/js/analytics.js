/* ==========================================
   SMART FORM BUILDER
   ANALYTICS JAVASCRIPT
========================================== */


/* ==========================================
   API CONFIGURATION
========================================== */

const API_BASE_URL = "http://127.0.0.1:8000";


/* ==========================================
   GET FORM ID FROM URL
========================================== */

const urlParams = new URLSearchParams(window.location.search);

/*
   Supports both:

   analytics.html?id=17

   and

   analytics.html?form_id=17
*/

const formId =
    urlParams.get("id") ||
    urlParams.get("form_id");


/* ==========================================
   DOM ELEMENTS
========================================== */

const formTitle =
    document.getElementById("formTitle");

const formDescription =
    document.getElementById("formDescription");

const totalViews =
    document.getElementById("totalViews");

const totalResponses =
    document.getElementById("totalResponses");

const completionRate =
    document.getElementById("completionRate");

const dropOffRate =
    document.getElementById("dropOffRate");

const summaryViews =
    document.getElementById("summaryViews");

const summaryResponses =
    document.getElementById("summaryResponses");

const summaryCompletion =
    document.getElementById("summaryCompletion");

const summaryDropoff =
    document.getElementById("summaryDropoff");

const loader =
    document.getElementById("loader");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const refreshBtn =
    document.getElementById("refreshBtn");


/* ==========================================
   CHART VARIABLES
========================================== */

let responseChart = null;

let completionChart = null;


/* ==========================================
   SHOW LOADER
========================================== */

function showLoader() {

    if (loader) {

        loader.style.display = "flex";

    }

}


/* ==========================================
   HIDE LOADER
========================================== */

function hideLoader() {

    if (loader) {

        loader.style.display = "none";

    }

}


/* ==========================================
   SHOW TOAST
========================================== */

function showToast(message) {

    if (!toast) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* ==========================================
   GET AUTH TOKEN
========================================== */

function getToken() {

    return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt_token")
    );

}


/* ==========================================
   API HEADERS
========================================== */

function getHeaders() {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {

        headers["Authorization"] =
            `Bearer ${token}`;

    }

    return headers;

}


/* ==========================================
   LOAD FORM INFORMATION
   USED FOR SINGLE FORM ANALYTICS
========================================== */

async function loadFormInformation() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/forms/${formId}`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );


        if (!response.ok) {

            throw new Error(
                `Unable to load form (${response.status})`
            );

        }


        const form =
            await response.json();


        console.log(
            "Form data:",
            form
        );


        formTitle.textContent =
            form.title ||
            form.name ||
            "Untitled Form";


        formDescription.textContent =
            form.description ||
            "Form performance overview";


    }

    catch (error) {

        console.error(
            "Form loading error:",
            error
        );

        formTitle.textContent =
            "Unable to load form";

        formDescription.textContent =
            "Could not load form information.";

    }

}


/* ==========================================
   LOAD SINGLE FORM ANALYTICS
========================================== */

async function loadAnalytics() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/forms/${formId}/analytics`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );


        if (!response.ok) {

            throw new Error(
                `Analytics request failed (${response.status})`
            );

        }


        const data =
            await response.json();


        console.log(
            "Single form analytics:",
            data
        );


        const views =
            Number(
                data.total_views ??
                data.views ??
                0
            );


        const responses =
            Number(
                data.total_responses ??
                data.responses ??
                0
            );


        const completion =
            Number(
                data.completion_rate ??
                0
            );


        const dropOff =
            Number(
                data.drop_off_rate ??
                data.dropoff_rate ??
                0
            );


        updateAnalyticsUI(
            views,
            responses,
            completion,
            dropOff
        );

    }

    catch (error) {

        console.error(
            "Analytics loading error:",
            error
        );

        showToast(
            "Unable to load analytics data."
        );

    }

}


/* ==========================================
   LOAD OVERALL ANALYTICS
   USED WHEN SIDEBAR ANALYTICS IS CLICKED
========================================== */

async function loadOverallAnalytics() {

    try {

        console.log(
            "Loading overall analytics..."
        );


        /* ----------------------------------
           GET ALL FORMS
        ---------------------------------- */

        const formsResponse =
            await fetch(
                `${API_BASE_URL}/forms/my`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        if (!formsResponse.ok) {

            throw new Error(
                `Unable to load forms (${formsResponse.status})`
            );

        }


        const forms =
            await formsResponse.json();


        console.log(
            "All forms:",
            forms
        );


        /* ----------------------------------
           NO FORMS
        ---------------------------------- */

        if (!forms || forms.length === 0) {

            updateAnalyticsUI(
                0,
                0,
                0,
                0
            );

            formTitle.textContent =
                "Overall Analytics";

            formDescription.textContent =
                "No forms available yet.";

            return;

        }


        /* ----------------------------------
           GET ANALYTICS FOR EVERY FORM
        ---------------------------------- */

        let totalViewsValue = 0;

        let totalResponsesValue = 0;


        for (const form of forms) {

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/forms/${form.id}/analytics`,
                        {
                            method: "GET",
                            headers: getHeaders()
                        }
                    );


                if (!response.ok) {

                    console.warn(
                        `Analytics unavailable for form ${form.id}`
                    );

                    continue;

                }


                const data =
                    await response.json();


                const views =
                    Number(
                        data.total_views ??
                        data.views ??
                        0
                    );


                const responses =
                    Number(
                        data.total_responses ??
                        data.responses ??
                        0
                    );


                totalViewsValue += views;

                totalResponsesValue += responses;


            }

            catch (error) {

                console.warn(
                    `Could not load analytics for form ${form.id}`,
                    error
                );

            }

        }


        /* ----------------------------------
           CALCULATE OVERALL RATES
        ---------------------------------- */

        let completion = 0;

        let dropOff = 0;


        if (totalViewsValue > 0) {

            completion =
                (totalResponsesValue /
                    totalViewsValue) * 100;

            completion =
                Math.min(
                    completion,
                    100
                );

            completion =
                Number(
                    completion.toFixed(2)
                );

            dropOff =
                Number(
                    (100 - completion).toFixed(2)
                );

        }


        /* ----------------------------------
           UPDATE PAGE
        ---------------------------------- */

        formTitle.textContent =
            "Overall Analytics";

        formDescription.textContent =
            `Performance overview across ${forms.length} form${forms.length === 1 ? "" : "s"}.`;


        updateAnalyticsUI(
            totalViewsValue,
            totalResponsesValue,
            completion,
            dropOff
        );


        console.log(
            "Overall analytics:",
            {
                views: totalViewsValue,
                responses: totalResponsesValue,
                completion: completion,
                dropOff: dropOff
            }
        );

    }

    catch (error) {

        console.error(
            "Overall analytics error:",
            error
        );

        formTitle.textContent =
            "Overall Analytics";

        formDescription.textContent =
            "Unable to load overall analytics.";

        showToast(
            "Unable to load overall analytics."
        );

    }

}


/* ==========================================
   UPDATE ANALYTICS UI
========================================== */

function updateAnalyticsUI(
    views,
    responses,
    completion,
    dropOff
) {

    /* ----------------------------------
       STATISTICS
    ---------------------------------- */

    if (totalViews) {

        totalViews.textContent =
            views.toLocaleString();

    }


    if (totalResponses) {

        totalResponses.textContent =
            responses.toLocaleString();

    }


    if (completionRate) {

        completionRate.textContent =
            `${completion}%`;

    }


    if (dropOffRate) {

        dropOffRate.textContent =
            `${dropOff}%`;

    }


    /* ----------------------------------
       SUMMARY
    ---------------------------------- */

    if (summaryViews) {

        summaryViews.textContent =
            views.toLocaleString();

    }


    if (summaryResponses) {

        summaryResponses.textContent =
            responses.toLocaleString();

    }


    if (summaryCompletion) {

        summaryCompletion.textContent =
            `${completion}%`;

    }


    if (summaryDropoff) {

        summaryDropoff.textContent =
            `${dropOff}%`;

    }


    /* ----------------------------------
       CHARTS
    ---------------------------------- */

    createResponseChart(
        views,
        responses
    );


    createCompletionChart(
        completion,
        dropOff
    );

}


/* ==========================================
   RESPONSE OVERVIEW CHART
========================================== */

function createResponseChart(
    views,
    responses
) {

    const container =
        document.getElementById(
            "responseChart"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        `<canvas id="responseChartCanvas"></canvas>`;


    const canvas =
        document.getElementById(
            "responseChartCanvas"
        );


    if (!canvas) {
        return;
    }


    if (responseChart) {

        responseChart.destroy();

    }


    responseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "Views",
                        "Responses"
                    ],

                    datasets: [

                        {

                            label:
                                "Form Activity",

                            data: [
                                views,
                                responses
                            ],

                            backgroundColor: [
                                "#2563eb",
                                "#10b981"
                            ],

                            borderRadius: 8,

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );

}


/* ==========================================
   COMPLETION CHART
========================================== */

function createCompletionChart(
    completion,
    dropOff
) {

    const container =
        document.getElementById(
            "completionChart"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        `<canvas id="completionChartCanvas"></canvas>`;


    const canvas =
        document.getElementById(
            "completionChartCanvas"
        );


    if (!canvas) {
        return;
    }


    if (completionChart) {

        completionChart.destroy();

    }


    completionChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Completed",
                        "Dropped Off"
                    ],

                    datasets: [

                        {

                            data: [
                                completion,
                                dropOff
                            ],

                            backgroundColor: [
                                "#16a34a",
                                "#ea580c"
                            ],

                            borderWidth: 0

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "65%",

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


/* ==========================================
   LOAD ANALYTICS PAGE
========================================== */

async function loadAnalyticsPage() {

    showLoader();


    try {

        /*
           ==================================
           MODE 1
           SINGLE FORM ANALYTICS

           Example:
           analytics.html?id=17
           ==================================
        */

        if (formId) {

            console.log(
                "Single form analytics mode:",
                formId
            );


            await loadFormInformation();

            await loadAnalytics();

        }


        /*
           ==================================
           MODE 2
           OVERALL ANALYTICS

           Example:
           analytics.html
           ==================================
        */

        else {

            console.log(
                "Overall analytics mode"
            );


            await loadOverallAnalytics();

        }

    }

    finally {

        hideLoader();

    }

}


/* ==========================================
   REFRESH BUTTON
========================================== */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function () {

            await loadAnalyticsPage();

            showToast(
                "Analytics updated successfully."
            );

        }
    );

}


/* ==========================================
   PAGE LOAD
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAnalyticsPage();

    }
);