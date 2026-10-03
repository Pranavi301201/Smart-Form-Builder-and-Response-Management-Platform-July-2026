// =====================================================
// SHARED FORMS
// =====================================================


// DOM ELEMENTS

const sharedFormsContainer =
    document.getElementById(
        "sharedFormsContainer"
    );

const searchInput =
    document.getElementById(
        "search"
    );

const accessFilter =
    document.getElementById(
        "accessFilter"
    );

const sortFilter =
    document.getElementById(
        "sortFilter"
    );

const gridViewBtn =
    document.getElementById(
        "gridViewBtn"
    );

const listViewBtn =
    document.getElementById(
        "listViewBtn"
    );


// =====================================================
// DATA
// =====================================================

let sharedForms = [];


// =====================================================
// LOAD SHARED FORMS
// =====================================================

function loadSharedForms() {

    try {

        const savedForms =
            localStorage.getItem(
                "sharedForms"
            );


        if (savedForms) {

            sharedForms =
                JSON.parse(savedForms);

        } else {

            sharedForms = [];

        }

    }

    catch (error) {

        console.error(
            "Unable to load shared forms:",
            error
        );

        sharedForms = [];

    }


    updateStatistics();

    renderSharedForms();

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics() {

    const total =
        sharedForms.length;


    const editForms =
        sharedForms.filter(
            form =>
                form.access === "edit"
        ).length;


    const viewForms =
        sharedForms.filter(
            form =>
                form.access === "view"
        ).length;


    const totalResponses =
        sharedForms.reduce(
            (total, form) =>
                total +
                Number(
                    form.responses || 0
                ),
            0
        );


    document.getElementById(
        "totalSharedForms"
    ).innerText =
        total;


    document.getElementById(
        "editAccessForms"
    ).innerText =
        editForms;


    document.getElementById(
        "viewAccessForms"
    ).innerText =
        viewForms;


    document.getElementById(
        "sharedResponses"
    ).innerText =
        totalResponses;

}


// =====================================================
// GET FILTERED FORMS
// =====================================================

function getFilteredForms() {

    let filteredForms =
        [...sharedForms];


    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    // SEARCH

    if (searchValue) {

        filteredForms =
            filteredForms.filter(
                form =>

                    String(
                        form.title || ""
                    )
                        .toLowerCase()
                        .includes(
                            searchValue
                        ) ||

                    String(
                        form.sharedBy || ""
                    )
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

            );

    }


    // ACCESS FILTER

    const accessValue =
        accessFilter.value;


    if (
        accessValue !== "all"
    ) {

        filteredForms =
            filteredForms.filter(
                form =>
                    form.access ===
                    accessValue
            );

    }


    // SORT

    const sortValue =
        sortFilter.value;


    if (
        sortValue === "name"
    ) {

        filteredForms.sort(
            (a, b) =>
                String(
                    a.title || ""
                ).localeCompare(
                    String(
                        b.title || ""
                    )
                )
        );

    }


    else if (
        sortValue === "responses"
    ) {

        filteredForms.sort(
            (a, b) =>
                Number(
                    b.responses || 0
                ) -
                Number(
                    a.responses || 0
                )
        );

    }


    else {

        filteredForms.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.sharedAt ||
                        0
                    );

                const dateB =
                    new Date(
                        b.sharedAt ||
                        0
                    );

                return (
                    dateB - dateA
                );

            }
        );

    }


    return filteredForms;

}


// =====================================================
// RENDER SHARED FORMS
// =====================================================

function renderSharedForms() {

    const forms =
        getFilteredForms();


    sharedFormsContainer.innerHTML =
        "";


    document.getElementById(
        "sharedFormCount"
    ).innerText =
        `${forms.length} shared form${
            forms.length === 1
                ? ""
                : "s"
        } available to you`;


    // EMPTY STATE

    if (
        forms.length === 0
    ) {

        sharedFormsContainer.innerHTML =
            `
            <div class="empty-state">

                <div class="empty-icon">

                    <i class="fa-solid fa-share-nodes"></i>

                </div>

                <h3>
                    No shared forms found
                </h3>

                <p>
                    Forms shared with you will appear here.
                </p>

            </div>
            `;

        return;

    }


    // FORM CARDS

    forms.forEach(
        form => {

            const access =
                form.access === "edit"
                    ? "edit"
                    : "view";


            const accessText =
                access === "edit"
                    ? "Can Edit"
                    : "View Only";


            const accessIcon =
                access === "edit"
                    ? "fa-pen-to-square"
                    : "fa-eye";


            const initial =
                String(
                    form.sharedBy ||
                    "S"
                )
                    .charAt(0)
                    .toUpperCase();


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "shared-card";


            card.innerHTML =
                `

                <div class="card-top-line"></div>


                <div class="shared-card-content">


                    <div class="card-header">


                        <div class="form-icon">

                            <i class="fa-solid fa-file-lines"></i>

                        </div>


                        <button
                            class="card-menu"
                            title="Remove from shared list"
                            onclick="removeSharedForm(${form.id})">

                            <i class="fa-solid fa-xmark"></i>

                        </button>


                    </div>



                    <h3 class="form-title">
                        ${
                            escapeHTML(
                                form.title ||
                                "Untitled Form"
                            )
                        }
                    </h3>



                    <div class="shared-by">


                        <div class="shared-avatar">

                            ${initial}

                        </div>


                        <span>

                            Shared by
                            <strong>
                                ${
                                    escapeHTML(
                                        form.sharedBy ||
                                        "Workspace"
                                    )
                                }
                            </strong>

                        </span>


                    </div>



                    <div class="card-meta">


                        <span class="access-badge ${access}">

                            <i class="fa-solid ${accessIcon}"></i>

                            ${accessText}

                        </span>


                        <span class="meta-item">

                            <i class="fa-solid fa-users"></i>

                            ${
                                Number(
                                    form.responses || 0
                                )
                            } Responses

                        </span>


                    </div>


                </div>



                <div class="card-footer">


                    <button
                        class="open-btn"
                        onclick="openSharedForm(${form.id})">

                        <i class="fa-solid fa-arrow-up-right-from-square"></i>

                        Open Form

                    </button>


                    <button
                        class="copy-btn"
                        title="Copy Form Link"
                        onclick="copySharedLink(${form.id})">

                        <i class="fa-regular fa-copy"></i>

                    </button>


                </div>

                `;


            sharedFormsContainer.appendChild(
                card
            );

        }
    );

}


// =====================================================
// OPEN SHARED FORM
// =====================================================

function openSharedForm(
    id
) {

    const form =
        sharedForms.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    id
                )
        );


    if (!form) {

        showToast(
            "Form not found."
        );

        return;

    }


    if (
        form.formId
    ) {

        window.location.href =
            `preview.html?id=${form.formId}`;

        return;

    }


    showToast(
        "This shared form is not connected to a form yet."
    );

}


// =====================================================
// COPY FORM LINK
// =====================================================

function copySharedLink(
    id
) {

    const form =
        sharedForms.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    id
                )
        );


    if (!form) {

        return;

    }


    let link =
        window.location.origin +
        window.location.pathname
            .replace(
                "sharedforms.html",
                "preview.html"
            );


    if (
        form.formId
    ) {

        link +=
            `?id=${form.formId}`;

    }


    navigator.clipboard
        .writeText(
            link
        )
        .then(
            () => {

                showToast(
                    "Form link copied to clipboard!"
                );

            }
        )
        .catch(
            () => {

                showToast(
                    "Unable to copy the link."
                );

            }
        );

}


// =====================================================
// REMOVE SHARED FORM
// =====================================================

function removeSharedForm(
    id
) {

    const confirmed =
        confirm(
            "Remove this form from your Shared Forms list?"
        );


    if (!confirmed) {

        return;

    }


    sharedForms =
        sharedForms.filter(
            form =>
                String(
                    form.id
                ) !==
                String(
                    id
                )
        );


    localStorage.setItem(
        "sharedForms",
        JSON.stringify(
            sharedForms
        )
    );


    updateStatistics();

    renderSharedForms();


    showToast(
        "Shared form removed."
    );

}


// =====================================================
// TOAST
// =====================================================

let toastTimer;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    toastMessage.innerText =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// =====================================================
// SEARCH
// =====================================================

searchInput.addEventListener(
    "input",
    renderSharedForms
);


// =====================================================
// ACCESS FILTER
// =====================================================

accessFilter.addEventListener(
    "change",
    renderSharedForms
);


// =====================================================
// SORT FILTER
// =====================================================

sortFilter.addEventListener(
    "change",
    renderSharedForms
);


// =====================================================
// GRID VIEW
// =====================================================

gridViewBtn.addEventListener(
    "click",
    function () {

        sharedFormsContainer.classList.remove(
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
// LIST VIEW
// =====================================================

listViewBtn.addEventListener(
    "click",
    function () {

        sharedFormsContainer.classList.add(
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
// KEYBOARD SEARCH SHORTCUT
// =====================================================

document.addEventListener(
    "keydown",
    function (
        event
    ) {

        if (

            (
                event.ctrlKey ||
                event.metaKey
            )

            &&

            event.key.toLowerCase() === "k"

        ) {

            event.preventDefault();

            searchInput.focus();

        }

    }
);


// =====================================================
// INITIALIZE
// =====================================================

loadSharedForms();