// ==========================================
// SMART FORM BUILDER
// RESPONSES PAGE
// ==========================================

const tableBody =
    document.getElementById("responsesBody");

const totalResponses =
    document.getElementById("totalResponses");

const todayResponses =
    document.getElementById("todayResponses");

const lastResponseTime =
    document.getElementById("lastResponseTime");

const emptyState =
    document.getElementById("emptyState");

const loader =
    document.getElementById("loader");

const modal =
    document.getElementById("responseModal");

const modalBody =
    document.getElementById("modalBody");

const closeModal =
    document.getElementById("closeModal");

const refreshBtn =
    document.getElementById("refreshBtn");

const searchInput =
    document.getElementById("searchInput");


// ==========================================
// GLOBAL DATA
// ==========================================

let responses = [];


// ==========================================
// GET FORM ID FROM URL
// Example:
// responses.html?id=1
// ==========================================

const params = new URLSearchParams(window.location.search);

const formId =
    params.get("id");


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    if (formId) {
        loadResponses();
    } else {
        loadAllResponses();
    }

});


// ==========================================
// LOAD RESPONSES
// ==========================================

async function loadResponses(){

    showLoader();

    try{

        if(!formId){

            throw new Error(
                "Form ID is missing from URL"
            );

        }

        const response =
        await fetch(
            `http://127.0.0.1:8000/forms/${formId}/responses`
        );

        if(!response.ok){

            throw new Error(
                `Failed to load responses: ${response.status}`
            );

        }

        responses =
        await response.json();

        renderResponses(responses);

    }

    catch(error){

        console.error(
            "Error loading responses:",
            error
        );

        showToast(
            "Unable to load responses."
        );

    }

    finally{

        hideLoader();

    }

}
// ==========================================
// LOAD ALL RESPONSES
// ==========================================

async function loadAllResponses(){

    showLoader();

    try{

        const response = await fetch(
            "http://127.0.0.1:8000/forms/responses/all"
        );

        if(!response.ok){
            throw new Error("Unable to load responses");
        }

        responses = await response.json();

        renderResponses(responses);

        document.getElementById("formTitle").innerText =
            "All Form Responses";

    }

    catch(error){

        console.error(error);

        showToast("Unable to load responses");

    }

    finally{

        hideLoader();

    }

}
// ==========================================
// RENDER RESPONSES
// ==========================================

function renderResponses(data) {

    tableBody.innerHTML = "";

    // --------------------------------------
    // EMPTY
    // --------------------------------------

    if (!data || data.length === 0) {

        emptyState.style.display =
            "block";

        document.querySelector(
            ".table-container"
        ).style.display =
            "none";

        totalResponses.innerText =
            "0";

        todayResponses.innerText =
            "0";

        lastResponseTime.innerText =
            "--";

        return;

    }


    // --------------------------------------
    // SHOW TABLE
    // --------------------------------------

    emptyState.style.display =
        "none";

    document.querySelector(
        ".table-container"
    ).style.display =
        "block";


    // --------------------------------------
    // TOTAL
    // --------------------------------------

    totalResponses.innerText =
        data.length;


    // --------------------------------------
    // TODAY'S RESPONSES
    // --------------------------------------

    const today =
        new Date().toDateString();

    const todayCount =
        data.filter(response => {

            if (!response.submitted_at) {

                return false;

            }

            return (
                new Date(
                    response.submitted_at
                ).toDateString()
                === today
            );

        }).length;

    todayResponses.innerText =
        todayCount;


    // --------------------------------------
    // LATEST RESPONSE
    // --------------------------------------

    lastResponseTime.innerHTML = formatDate(data[0].submitted_at);


    // --------------------------------------
    // CREATE TABLE ROWS
    // --------------------------------------

    data.forEach(
        (response, index) => {

            let answers = "";

            if (
                response.answers &&
                Array.isArray(response.answers)
            ) {

                response.answers.forEach(
                    answer => {

                        answers += `

                        <div class="answer-item">

                            <strong>
                                ${escapeHtml(
                                    answer.field_name ||
                                    "Field"
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    String(
                                        answer.value ?? ""
                                    )
                                )}
                            </span>

                        </div>

                        `;

                    }
                );

            }


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatDate(
                        response.submitted_at
                    )}
                </td>

                <td>
                    ${
                        answers ||
                        "No answers"
                    }
                </td>

                <td>

                    <button
                        class="view-btn"
                        onclick="viewResponse(${index})">

                        <i class="fa-solid fa-eye"></i>

                        View

                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(date){

    if(!date){
        return "--";
    }

    const d = new Date(date);

    return d.toLocaleDateString("en-IN",{
        day:"2-digit",
        month:"short",
        year:"numeric"
    }) + "<br>" +

    d.toLocaleTimeString("en-IN",{
        hour:"2-digit",
        minute:"2-digit"
    });

}


// ==========================================
// VIEW RESPONSE
// ==========================================

function viewResponse(index) {

    const response =
        responses[index];

    if (!response) {

        return;

    }

    modalBody.innerHTML = "";

    if (
        response.answers &&
        Array.isArray(response.answers)
    ) {

        response.answers.forEach(
            answer => {

                modalBody.innerHTML += `

                <div class="response-row">

                    <strong>
                        ${escapeHtml(
                            answer.field_name ||
                            "Field"
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            String(
                                answer.value ?? ""
                            )
                        )}
                    </p>

                </div>

                `;

            }
        );

    }

    modal.style.display =
        "flex";

}


// ==========================================
// CLOSE MODAL
// ==========================================

closeModal.onclick =
    function () {

        modal.style.display =
            "none";

    };


window.onclick =
    function (event) {

        if (
            event.target === modal
        ) {

            modal.style.display =
                "none";

        }

    };


// ==========================================
// SEARCH RESPONSES
// ==========================================

searchInput.addEventListener(
    "keyup",
    function () {

        const keyword =
            this.value
                .toLowerCase()
                .trim();


        if (!keyword) {

            renderResponses(
                responses
            );

            return;

        }


        const filtered =
            responses.filter(
                response => {

                    if (
                        !response.answers ||
                        !Array.isArray(
                            response.answers
                        )
                    ) {

                        return false;

                    }

                    return response.answers.some(
                        answer => {

                            return (

                                String(
                                    answer.field_name ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(keyword)

                                ||

                                String(
                                    answer.value ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(keyword)

                            );

                        }
                    );

                }
            );


        renderResponses(
            filtered
        );

    }
);


// ==========================================
// REFRESH BUTTON
// ==========================================

refreshBtn.onclick =
    function () {

        loadResponses();

        showToast(
            "Responses refreshed."
        );

    };
    const analyticsBtn =
    document.getElementById("analyticsBtn");

analyticsBtn.onclick =
    function () {

        if (formId) {

            window.location.href =
                `analytics.html?id=${formId}`;

        } else {

            showToast(
                "Form ID is missing."
            );

        }

    };

// ==========================================
// EXPORT DROPDOWN
// ==========================================

const exportBtn =
    document.getElementById("exportBtn");

const exportMenu =
    document.getElementById("exportMenu");
const exportCsv =
    document.getElementById("exportCsv");
const exportExcel =
    document.getElementById("exportExcel");
const exportPdf =
    document.getElementById("exportPdf");
    // ==========================================
// EXPORT CSV
// ==========================================

if (exportCsv) {

    exportCsv.addEventListener(
        "click",
        function () {

            if (!responses || responses.length === 0) {

                showToast(
                    "No responses available to export."
                );

                return;
            }

            let csv =
                "Response ID,Submitted On,Field,Value\n";


            responses.forEach(response => {

                const submittedOn =
                    response.submitted_at
                        ? new Date(
                            response.submitted_at
                        ).toLocaleString("en-IN")
                        : "";


                if (
                    response.answers &&
                    Array.isArray(response.answers)
                ) {

                    response.answers.forEach(answer => {

                        const field =
                            answer.field_name ||
                            "Field";

                        const value =
                            answer.value ?? "";


                        csv +=
                            `"${escapeCsv(response.id || "")}",` +
                            `"${escapeCsv(submittedOn)}",` +
                            `"${escapeCsv(field)}",` +
                            `"${escapeCsv(value)}"\n`;

                    });

                }

            });


            // Create CSV file

            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;


            link.download =
                `responses_${formId || "all"}.csv`;


            document.body.appendChild(link);


            link.click();


            document.body.removeChild(link);


            URL.revokeObjectURL(url);


            // Close dropdown

            exportMenu.classList.remove("show");


            showToast(
                "CSV exported successfully."
            );

        }
    );

}
// ==========================================
// EXPORT EXCEL
// ==========================================

if (exportExcel) {

    exportExcel.addEventListener(
        "click",
        function () {

            if (!responses || responses.length === 0) {

                showToast(
                    "No responses available to export."
                );

                return;
            }

            let rows = [];

            responses.forEach(response => {

                const submittedOn =
                    response.submitted_at
                        ? new Date(
                            response.submitted_at
                        ).toLocaleString("en-IN")
                        : "";

                if (
                    response.answers &&
                    Array.isArray(response.answers)
                ) {

                    response.answers.forEach(answer => {

                        rows.push({

                            "Response ID":
                                response.id || "",

                            "Submitted On":
                                submittedOn,

                            "Field":
                                answer.field_name || "Field",

                            "Value":
                                answer.value ?? ""

                        });

                    });

                }

            });

            // Convert data to worksheet

            const worksheet =
                XLSX.utils.json_to_sheet(rows);

            // Create workbook

            const workbook =
                XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Responses"
            );

            // Download Excel file

            XLSX.writeFile(
                workbook,
                `responses_${formId || "all"}.xlsx`
            );

            exportMenu.classList.remove("show");

            showToast(
                "Excel exported successfully."
            );

        }
    );

}
// ==========================================
// EXPORT PDF
// ==========================================

if (exportPdf) {

    exportPdf.addEventListener(
        "click",
        function () {

            if (!responses || responses.length === 0) {

                showToast(
                    "No responses available to export."
                );

                return;
            }

            const { jsPDF } = window.jspdf;

            const doc = new jsPDF();

            let y = 20;

            // --------------------------------------
            // TITLE
            // --------------------------------------

            doc.setFontSize(18);

            doc.text(
                "Form Responses",
                15,
                y
            );

            y += 12;

            doc.setFontSize(10);

            // --------------------------------------
            // RESPONSES
            // --------------------------------------

            responses.forEach(
                (response, index) => {

                    const submittedOn =
                        response.submitted_at
                            ? new Date(
                                response.submitted_at
                            ).toLocaleString("en-IN")
                            : "--";

                    doc.setFontSize(12);

                    doc.text(
                        `Response ${index + 1}`,
                        15,
                        y
                    );

                    y += 7;

                    doc.setFontSize(9);

                    doc.text(
                        `Submitted: ${submittedOn}`,
                        15,
                        y
                    );

                    y += 7;

                    if (
                        response.answers &&
                        Array.isArray(
                            response.answers
                        )
                    ) {

                        response.answers.forEach(
                            answer => {

                                const field =
                                    answer.field_name ||
                                    "Field";

                                const value =
                                    String(
                                        answer.value ?? ""
                                    );

                                const text =
                                    `${field}: ${value}`;

                                const lines =
                                    doc.splitTextToSize(
                                        text,
                                        175
                                    );

                                doc.text(
                                    lines,
                                    20,
                                    y
                                );

                                y +=
                                    lines.length * 5 + 2;


                                // New page if needed

                                if (y > 275) {

                                    doc.addPage();

                                    y = 20;

                                }

                            }
                        );

                    }

                    y += 8;


                    // New page if needed

                    if (y > 275) {

                        doc.addPage();

                        y = 20;

                    }

                }
            );

            // --------------------------------------
            // DOWNLOAD
            // --------------------------------------

            doc.save(
                `responses_${formId || "all"}.pdf`
            );

            exportMenu.classList.remove(
                "show"
            );

            showToast(
                "PDF exported successfully."
            );

        }
    );

}
// Open / close export menu

if (exportBtn && exportMenu) {

    exportBtn.addEventListener("click", function (event) {

        event.stopPropagation();

        exportMenu.classList.toggle("show");

    });

}


// Close menu when clicking anywhere else

document.addEventListener("click", function () {

    if (exportMenu) {

        exportMenu.classList.remove("show");

    }

});
// ==========================================
// SHOW LOADER
// ==========================================

function showLoader() {

    loader.style.display =
        "flex";

}


// ==========================================
// HIDE LOADER
// ==========================================

function hideLoader() {

    loader.style.display =
        "none";

}


// ==========================================
// SHOW ERROR
// ==========================================

function showError(message) {

    emptyState.style.display =
        "block";

    document.querySelector(
        ".table-container"
    ).style.display =
        "none";

    emptyState.innerHTML = `

        <i class="fa-solid fa-circle-exclamation"></i>

        <h2>
            Unable to Load Responses
        </h2>

        <p>
            ${message}
        </p>

    `;

}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    const text =
        document.getElementById(
            "toastMessage"
        );

    text.innerText =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

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
// ==========================================
// ESCAPE CSV VALUES
// ==========================================

function escapeCsv(value) {

    return String(value)
        .replace(/"/g, '""');

}

// ==========================================
// AUTO REFRESH
// ==========================================

setInterval(
    function () {

        if (formId) {

            loadResponses();

        }

    },
    30000
);