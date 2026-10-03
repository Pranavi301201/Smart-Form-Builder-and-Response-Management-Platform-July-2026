// =====================================================
//                  SMART FORMS - MY FORMS
// =====================================================

const formsContainer =
    document.getElementById("formsContainer");

const searchInput =
    document.getElementById("search");

const filterSelect =
    document.getElementById("filter");

const formCount =
    document.getElementById("formCount");

const gridViewBtn =
    document.getElementById("gridViewBtn");

const listViewBtn =
    document.getElementById("listViewBtn");


let allForms = [];


// =====================================================
//                  LOAD FORMS
// =====================================================

async function loadForms() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/forms/my"
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load forms"
            );

        }


        allForms =
            await response.json();


        updateStatistics();

        applyFilters();


    }

    catch (error) {

        console.error(
            "Load forms error:",
            error
        );


        formsContainer.innerHTML = `

            <div class="empty">

                <div class="empty-icon">

                    <i class="fa-solid fa-cloud-arrow-down"></i>

                </div>

                <h2>Unable to load forms</h2>

                <p>
                    Please check whether the FastAPI server
                    is running and try again.
                </p>

                <a href="create-choice.html"
                   class="empty-btn">

                    Create New Form

                </a>

            </div>

        `;

        formCount.textContent =
            "Unable to load your forms.";

    }

}


// =====================================================
//                  DISPLAY FORMS
// =====================================================

function displayForms(forms) {

    formsContainer.innerHTML = "";


    // -----------------------------
    // Empty State
    // -----------------------------

    if (forms.length === 0) {

        formsContainer.innerHTML = `

            <div class="empty">

                <div class="empty-icon">

                    <i class="fa-regular fa-folder-open"></i>

                </div>

                <h2>No Forms Found</h2>

                <p>
                    ${
                        allForms.length === 0
                        ?
                        "Create your first smart form to get started."
                        :
                        "Try changing your search or filter."
                    }
                </p>

                ${
                    allForms.length === 0
                    ?
                    `
                    <a href="create-choice.html"
                       class="empty-btn">

                        <i class="fa-solid fa-plus"></i>
                        Create Your First Form

                    </a>
                    `
                    :
                    ""
                }

            </div>

        `;

        formCount.textContent =
            allForms.length === 0
            ?
            "No forms created yet."
            :
            "No forms match your search.";

        return;

    }


    // -----------------------------
    // Form Count
    // -----------------------------

    formCount.textContent =
        `${forms.length} form${forms.length !== 1 ? "s" : ""} found`;


    // -----------------------------
    // Create Cards
    // -----------------------------

    forms.forEach((form, index) => {

        const title =
            form.title ||
            "Untitled Form";


        const fields =
            Array.isArray(form.fields)
            ?
            form.fields.length
            :
            0;


        const responses =
            Number(form.responses) || 0;


        const createdDate =
            form.created_at
            ?
            new Date(
                form.created_at
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
            :
            "Today";


        const status =
            form.status ||
            "active";


        const isDraft =
            status.toLowerCase() === "draft";


        const card =
            document.createElement("div");

        card.className =
            "form-card";


        card.style.animationDelay =
            `${index * 0.04}s`;


        card.innerHTML = `

            <!-- CARD HEADER -->

            <div class="card-header">

                <h3>
                    ${escapeHTML(title)}
                </h3>

            </div>


            <!-- CARD BODY -->

            <div class="card-body">

                <div class="form-meta">

                    <span class="status ${isDraft ? "draft" : ""}">

                        <span class="status-dot"></span>

                        ${isDraft ? "Draft" : "Active"}

                    </span>


                    <span class="created-date">

                        ${createdDate}

                    </span>

                </div>


                <div class="form-info">

                    <div class="info-item">

                        <i class="fa-regular fa-file-lines"></i>

                        ${fields} Fields

                    </div>


                    <div class="info-item">

                        <i class="fa-solid fa-users"></i>

                        ${responses} Responses

                    </div>

                </div>

            </div>


            <!-- CARD FOOTER -->

            <div class="card-footer">

                <button
                    class="preview"
                    onclick="previewForm(${form.id})">

                    <i class="fa-regular fa-eye"></i>

                    Preview

                </button>


                <button
                    class="responses"
                    onclick="viewResponses(${form.id})">

                    <i class="fa-solid fa-chart-simple"></i>

                    Responses

                </button>


                <button
                    class="edit"
                    onclick="editForm(${form.id})">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>


                <button
                    class="delete"
                    onclick="deleteForm(${form.id})">

                    <i class="fa-regular fa-trash-can"></i>

                    Delete

                </button>

            </div>

        `;


        formsContainer.appendChild(card);

    });

}


// =====================================================
//                  STATISTICS
// =====================================================

function updateStatistics() {

    const totalForms =
        allForms.length;


    document.getElementById(
        "totalForms"
    ).textContent =
        totalForms;


    // -----------------------------
    // Active Forms
    // -----------------------------

    const activeForms =
        allForms.filter(form => {

            const status =
                (form.status || "active")
                .toLowerCase();

            return status === "active" ||
                   status === "published";

        }).length;


    document.getElementById(
        "activeForms"
    ).textContent =
        activeForms;


    // -----------------------------
    // Total Responses
    // -----------------------------

    let totalResponses = 0;


    allForms.forEach(form => {

        totalResponses +=
            Number(form.responses) || 0;

    });


    document.getElementById(
        "totalResponses"
    ).textContent =
        totalResponses;

}


// =====================================================
//                  SEARCH + FILTER
// =====================================================

function applyFilters() {

    const searchValue =
        searchInput.value
        .trim()
        .toLowerCase();


    let filteredForms =
        [...allForms];


    // -----------------------------
    // SEARCH
    // -----------------------------

    if (searchValue !== "") {

        filteredForms =
            filteredForms.filter(form => {

                const title =
                    (form.title || "")
                    .toLowerCase();

                return title.includes(
                    searchValue
                );

            });

    }


    // -----------------------------
    // FILTER / SORT
    // -----------------------------

    const filterValue =
        filterSelect.value;


    if (filterValue === "recent") {

        filteredForms.sort(
            (a, b) => {

                return new Date(
                    b.created_at || 0
                ) -
                new Date(
                    a.created_at || 0
                );

            }
        );

    }


    else if (filterValue === "responses") {

        filteredForms.sort(
            (a, b) => {

                return (
                    Number(b.responses) || 0
                ) -
                (
                    Number(a.responses) || 0
                );

            }
        );

    }


    else if (filterValue === "name") {

        filteredForms.sort(
            (a, b) => {

                return (
                    a.title || ""
                ).localeCompare(
                    b.title || ""
                );

            }
        );

    }


    displayForms(
        filteredForms
    );

}


// =====================================================
//                  SEARCH EVENT
// =====================================================

searchInput.addEventListener(
    "input",
    applyFilters
);


// =====================================================
//                  FILTER EVENT
// =====================================================

filterSelect.addEventListener(
    "change",
    applyFilters
);


// =====================================================
//                  GRID VIEW
// =====================================================

gridViewBtn.addEventListener(
    "click",
    function () {

        formsContainer.classList.remove(
            "list-view"
        );

        gridViewBtn.classList.add(
            "active"
        );

        listViewBtn.classList.remove(
            "active"
        );

    }
);


// =====================================================
//                  LIST VIEW
// =====================================================

listViewBtn.addEventListener(
    "click",
    function () {

        formsContainer.classList.add(
            "list-view"
        );

        listViewBtn.classList.add(
            "active"
        );

        gridViewBtn.classList.remove(
            "active"
        );

    }
);


// =====================================================
//                  PREVIEW
// =====================================================

function previewForm(id) {

    console.log(
        "Preview clicked:",
        id
    );


    window.location.href =
        "preview.html?id=" + id;

}


// =====================================================
//                  RESPONSES
// =====================================================

function viewResponses(id) {

    console.log(
        "Responses clicked:",
        id
    );


    window.location.href =
        "responses.html?id=" + id;

}


// =====================================================
//                  EDIT
// =====================================================

function editForm(id) {

    console.log(
        "Edit clicked:",
        id
    );


    // Editing an existing form
    // continues to use create-form.html

    window.location.href =
        "create-form.html?id=" + id;

}


// =====================================================
//                  DELETE
// =====================================================

async function deleteForm(id) {

    console.log(
        "Delete clicked:",
        id
    );


    const form =
        allForms.find(
            item => item.id === id
        );


    const formName =
        form && form.title
        ?
        form.title
        :
        "this form";


    const ok =
        confirm(
            `Are you sure you want to delete "${formName}"?`
        );


    if (!ok) {

        return;

    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/forms/" + id,
                {
                    method: "DELETE"
                }
            );


        console.log(
            "Delete response:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Delete failed:",
                errorText
            );


            alert(
                "Unable to delete the form."
            );


            return;

        }


        // Remove deleted form
        // from local array immediately

        allForms =
            allForms.filter(
                form => form.id !== id
            );


        updateStatistics();

        applyFilters();


        // Small confirmation

        showToast(
            "Form deleted successfully."
        );


    }


    catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Unable to connect to the backend."
        );

    }

}


// =====================================================
//                  TOAST
// =====================================================

function showToast(message) {

    const toast =
        document.createElement("div");


    toast.style.position =
        "fixed";

    toast.style.bottom =
        "25px";

    toast.style.right =
        "25px";

    toast.style.padding =
        "13px 18px";

    toast.style.background =
        "#183a61";

    toast.style.color =
        "#ffffff";

    toast.style.borderRadius =
        "9px";

    toast.style.fontSize =
        "11px";

    toast.style.fontWeight =
        "600";

    toast.style.boxShadow =
        "0 10px 30px rgba(0,0,0,0.18)";

    toast.style.zIndex =
        "9999";

    toast.innerHTML = `

        <i class="fa-solid fa-circle-check"
           style="color:#45d28a;margin-right:7px;">
        </i>

        ${escapeHTML(message)}

    `;


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";

            toast.style.transition =
                "0.3s";

            setTimeout(
                () => toast.remove(),
                300
            );

        },
        2200
    );

}


// =====================================================
//                  HTML SAFETY
// =====================================================

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


// =====================================================
//                  KEYBOARD SHORTCUT
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            searchInput.focus();

        }

    }
);


// =====================================================
//                  INITIAL LOAD
// =====================================================

loadForms();