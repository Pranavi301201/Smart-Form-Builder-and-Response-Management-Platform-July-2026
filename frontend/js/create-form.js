// ==========================================
// SMART FORM BUILDER
// ==========================================
const fields = document.querySelectorAll(".field");
const dropZone = document.getElementById("dropZone");

const propLabel = document.getElementById("propLabel");
const propPlaceholder = document.getElementById("propPlaceholder");
const propRequired = document.getElementById("propRequired");
const propReadonly = document.getElementById("readonlyField");

const propertyContent = document.getElementById("propertyContent");
const noSelection = document.getElementById("noSelection");

const choiceSection = document.getElementById("choiceSection");
const choiceList = document.getElementById("choiceList");
const addChoiceBtn = document.getElementById("addChoiceBtn");

const saveBtn = document.getElementById("saveBtn");
console.log(saveBtn);
let pageCount = 1;
let selectedField = null;
let draggedField = null;
let conditionalRules = [];
let formFields = [];
// ==========================================
// GET FORM ID FROM URL
// Example: create-form.html?id=5
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const editFormId = urlParams.get("id");
//-------------------------------------------------
//Template page
//----------------------------------------------------
// ==========================================
// GET TEMPLATE FROM URL
// Example: create-form.html?template=student
// ==========================================

const templateName =
    urlParams.get("template");

console.log(
    "Selected Template:",
    templateName
);

// ==========================================
// SIDEBAR DRAG START
// ==========================================

fields.forEach(field => {

    field.addEventListener("dragstart", function(e) {

        e.dataTransfer.effectAllowed = "copy";

        e.dataTransfer.setData(
            "field-type",
            this.dataset.type
        );

    });

});


// ==========================================
// DROP ZONE - DRAG OVER
// ==========================================

dropZone.addEventListener("dragover", function(e) {

    e.preventDefault();

    e.dataTransfer.dropEffect = "copy";

    dropZone.classList.add("drag-over");

});


// ==========================================
// DROP ZONE - DRAG LEAVE
// ==========================================

dropZone.addEventListener("dragleave", function(e) {

    dropZone.classList.remove("drag-over");

});


// ==========================================
// DROP ZONE - DROP
// ==========================================

dropZone.addEventListener("drop", function(e) {

    e.preventDefault();

    dropZone.classList.remove("drag-over");

    const type = e.dataTransfer.getData("field-type");

    // If dragging a sidebar field
    if (type) {

        const placeholder =
            dropZone.querySelector(".placeholder");

        if (placeholder) {
            placeholder.remove();
        }

        addField(type);

        return;
    }

});


// ==========================================
// ADD NEW FIELD
// ==========================================

function addField(type, existingId = null, customLabel= null, targetContainer = null) {

    const div = document.createElement("div");

    const fieldId =
        existingId || ("field_" + Date.now());

    div.className = "form-field";
    div.dataset.id = fieldId;

    div.draggable = true;

    let html = "";

    switch (type) {

        case "Text Field":

            html = `
                <label>Text Field</label>
                <input
                    type="text"
                    placeholder="Enter text">
            `;

            break;


        case "Name":

            html = `
                <label>Name</label>
                <input
                    type="text"
                    placeholder="Enter your name">
            `;

            break;


        case "Email":

            html = `
                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter email">
            `;

            break;


        case "Phone":

            html = `
                <label>Phone Number</label>
                <input
                    type="tel"
                    placeholder="Enter phone number">
            `;

            break;


        case "Address":

            html = `
                <label>Address</label>
                <textarea
                    rows="3"
                    placeholder="Enter address"></textarea>
            `;

            break;


        case "Number":

            html = `
                <label>Number</label>
                <input
                    type="number"
                    placeholder="Enter number">
            `;

            break;


        case "Decimal":

            html = `
                <label>Decimal</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Enter decimal">
            `;

            break;


        case "Currency":

            html = `
                <label>Currency</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Enter amount">
            `;

            break;


        case "Dropdown":

            html = `
                <label>Dropdown</label>

                <select>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                </select>
            `;

            break;

case "Radio":
case "radio":

    const radioGroup =
        "radio_" + Date.now();

    html = `
        <label class="field-title">
            Radio
        </label>

        <label class="radio-option">
            <input
                type="radio"
                name="${radioGroup}"
                value="Option 1">
            <span>Option 1</span>
        </label>

        <label class="radio-option">
            <input
                type="radio"
                name="${radioGroup}"
                value="Option 2">
            <span>Option 2</span>
        </label>
    `;

    break;


        case "Checkbox":

            html = `
                <label class="field-title">
                    Checkbox
                </label>

                <label class="checkbox-option">
                    <input type="checkbox">
                    <span>Option 1</span>
                </label>

                <label class="checkbox-option">
                    <input type="checkbox">
                    <span>Option 2</span>
                </label>
            `;

            break;


        case "Date":

            html = `
                <label>Date</label>
                <input type="date">
            `;

            break;


        case "Time":

            html = `
                <label>Time</label>
                <input type="time">
            `;

            break;


        case "DateTime":

            html = `
                <label>Date & Time</label>
                <input type="datetime-local">
            `;

            break;


        default:

            html = `
                <label>${type}</label>
                <input type="text">
            `;

    }


    div.innerHTML = `

        <div class="field-toolbar">

            <button
                type="button"
                class="duplicate-btn"
                title="Duplicate">

                <i class="fa-solid fa-copy"></i>

            </button>

            <button
                type="button"
                class="delete-btn"
                title="Delete">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        ${html}

    `;


    // Append field into the active page drop zone (or Page 1)
let pageDropZone = targetContainer || 
                       dropZone.querySelector('.form-page-card:last-child .page-drop-zone') || 
                       dropZone.querySelector('.page-drop-zone');
    if (pageDropZone) {
        const placeholder = pageDropZone.querySelector(".placeholder");
        if (placeholder) placeholder.remove();
        pageDropZone.appendChild(div);
    } else {
        dropZone.appendChild(div);
    }

const displayLabel = div.querySelector(".field-title")
    ? div.querySelector(".field-title").innerText
    : div.querySelector("label").innerText;

const pageContainer =
    div.closest(".form-page");

const pageNumber =
    pageContainer
        ? parseInt(
            pageContainer.dataset.page || 1
        )
        : 1;


const currentPageElement =
    div.closest("[data-page]");

const currentFieldPage =
    currentPageElement
        ? parseInt(
            currentPageElement.dataset.page || 1
        )
        : 1;

formFields.push({
    id: fieldId,
    label: displayLabel,
    type: type,
    page: currentFieldPage
});

attachEvents(div);

}


// ==========================================
// ATTACH FIELD EVENTS
// ==========================================

function attachEvents(field) {

    // --------------------------------------
    // SELECT FIELD
    // --------------------------------------

    field.addEventListener("click", function(e) {

        // Do not select when clicking buttons
        if (
            e.target.closest(".delete-btn") ||
            e.target.closest(".duplicate-btn")
        ) {
            return;
        }

        selectField(field);
        

    });


    // --------------------------------------
    // DRAG START FOR REORDER
    // --------------------------------------

    field.addEventListener("dragstart", function(e) {

        draggedField = field;

        e.dataTransfer.effectAllowed = "move";

        e.dataTransfer.setData(
            "reorder",
            "true"
        );

        field.classList.add("dragging");

    });


    // --------------------------------------
    // DRAG END
    // --------------------------------------

    field.addEventListener("dragend", function() {

        field.classList.remove("dragging");

        draggedField = null;

    });


    // --------------------------------------
    // DELETE
    // --------------------------------------

    const deleteBtn =
        field.querySelector(".delete-btn");

    if (deleteBtn) {

        deleteBtn.addEventListener(
            "click",
            function(e) {

                e.stopPropagation();

                field.remove();

                selectedField = null;

                hideProperties();

                checkEmptyDropZone();

            }
        );

    }


    // --------------------------------------
    // DUPLICATE
    // --------------------------------------

    const duplicateBtn =
        field.querySelector(".duplicate-btn");

    if (duplicateBtn) {

        duplicateBtn.addEventListener(
            "click",
            function(e) {

                e.stopPropagation();

                const clone =
    field.cloneNode(true);

clone.classList.remove("selected");

// Create NEW ID
const newFieldId =
    "field_" + Date.now();

clone.dataset.id =
    newFieldId;

field.after(clone);

// Get label
const label =
    clone.querySelector(".field-title") ||
    clone.querySelector("label");

// Add duplicate to data model
const duplicatePageElement =
    clone.closest("[data-page]");

const duplicateFieldPage =
    duplicatePageElement
        ? parseInt(
            duplicatePageElement.dataset.page || 1
        )
        : 1;

formFields.push({

    id: newFieldId,

    label:
        label
            ? label.innerText
            : "Field",

    type:
        clone.dataset.type ||
        "text",

    page:
        duplicateFieldPage

});

attachEvents(clone);

            }
        );

    }

}


// ==========================================
// SELECT FIELD
// ==========================================

function selectField(field) {

    document
        .querySelectorAll(".form-field")
        .forEach(f => {

            f.classList.remove("selected");

        });


    field.classList.add("selected");

    selectedField = field;
    console.log(field.outerHTML);
    console.log("Clicked:", field.dataset.id);
console.log("Selected:", selectedField.dataset.id);


    if (noSelection) {

        noSelection.style.display = "none";

    }


    if (propertyContent) {

        propertyContent.style.display = "block";

    }


    // Get title label
    const labels =
        field.querySelectorAll("label");

    let label = null;

    if (labels.length > 0) {

        label = labels[0];

    }


    if (label && propLabel) {

        propLabel.value =
            label.innerText;

    }


    const input =
        field.querySelector(
            "input:not([type='radio']):not([type='checkbox']), textarea, select"
        );


    if (input && propPlaceholder) {

        propPlaceholder.value =
            input.placeholder || "";

    }


    if (input && propRequired) {

        propRequired.checked =
            input.required || false;

    }


    if (input && propReadonly) {

        propReadonly.checked =
            input.readOnly || false;

    }


    loadChoices(field);
    updateConditionDropdown();

}


// ==========================================
// HIDE PROPERTIES
// ==========================================

function hideProperties() {

    if (noSelection) {

        noSelection.style.display = "block";

    }

    if (propertyContent) {

        propertyContent.style.display = "none";

    }

    if (choiceSection) {

        choiceSection.style.display = "none";

    }

}


// ==========================================
// CHECK EMPTY DROP ZONE
// ==========================================

function checkEmptyDropZone() {

    const formFields =
        dropZone.querySelectorAll(
            ".form-field"
        );

    if (formFields.length === 0) {

        dropZone.innerHTML = `

            <div class="placeholder">

                <i class="fa-solid fa-hand-pointer"></i>

                <h3>Drag Fields Here</h3>

                <p>Build your form visually.</p>

            </div>

        `;

    }

}


// ==========================================
// REORDER FIELDS
// ==========================================

dropZone.addEventListener(
    "dragover",
    function(e) {

        e.preventDefault();

        if (!draggedField) {
            return;
        }

        const afterElement =
            getDragAfterElement(
                dropZone,
                e.clientY
            );


        if (afterElement == null) {

            dropZone.appendChild(
                draggedField
            );

        } else {

            dropZone.insertBefore(
                draggedField,
                afterElement
            );

        }

    }
);


function getDragAfterElement(
    container,
    y
) {

    const elements = [
        ...container.querySelectorAll(
            ".form-field:not(.dragging)"
        )
    ];


    let closest = null;

    let offset =
        Number.NEGATIVE_INFINITY;


    elements.forEach(child => {

        const box =
            child.getBoundingClientRect();


        const diff =
            y -
            box.top -
            box.height / 2;


        if (
            diff < 0 &&
            diff > offset
        ) {

            offset = diff;

            closest = child;

        }

    });


    return closest;

}


// ==========================================
// LABEL PROPERTY
// ==========================================

if (propLabel) {

    propLabel.addEventListener("input", function () {

        if (!selectedField) return;

        // Update UI
        let label = selectedField.querySelector(".field-title");

        if (!label) {
            label = selectedField.querySelector("label");
        }

        if (label) {
            label.innerText = this.value;
        }

        // Update data model
        const fieldId = selectedField.dataset.id;

        const field = formFields.find(f => f.id === fieldId);

        if (field) {
            field.label = this.value;
        }

        // Refresh dropdowns
        updateConditionDropdown();

    });

}


// ==========================================
// PLACEHOLDER PROPERTY
// ==========================================

if (propPlaceholder) {

    propPlaceholder.addEventListener(
        "input",
        function() {

            if (!selectedField) {
                return;
            }

            const input =
                selectedField.querySelector(
                    "input, textarea"
                );

            if (input) {

                input.placeholder =
                    this.value;

            }

        }
    );

}


// ==========================================
// REQUIRED PROPERTY
// ==========================================

if (propRequired) {

    propRequired.addEventListener(
        "change",
        function() {

            if (!selectedField) {
                return;
            }

            const input =
                selectedField.querySelector(
                    "input, textarea, select"
                );

            if (input) {

                input.required =
                    this.checked;

            }

        }
    );

}


// ==========================================
// READONLY PROPERTY
// ==========================================

if (propReadonly) {

    propReadonly.addEventListener(
        "change",
        function() {

            if (!selectedField) {
                return;
            }

            const input =
                selectedField.querySelector(
                    "input, textarea"
                );

            if (input) {

                input.readOnly =
                    this.checked;

            }

        }
    );

}


// ==========================================
// LOAD CHOICES
// ==========================================

function loadChoices(field) {

    if (!choiceSection ||
        !choiceList) {

        return;

    }


    const select =
        field.querySelector("select");


    const radios =
        field.querySelectorAll(
            "input[type='radio']"
        );


    const checkboxes =
        field.querySelectorAll(
            "input[type='checkbox']"
        );


    if (
        !select &&
        radios.length === 0 &&
        checkboxes.length === 0
    ) {

        choiceSection.style.display =
            "none";

        return;

    }


    choiceSection.style.display =
        "block";


    choiceList.innerHTML = "";


    // DROPDOWN

    if (select) {

        [...select.options].forEach(
            option => {

                createChoiceEditor(
                    option,
                    select
                );

            }
        );

        return;

    }


    // RADIO

    if (radios.length) {

        radios.forEach(radio => {

            createChoiceEditor(
                radio.parentElement,
                null
            );

        });

        return;

    }


    // CHECKBOX

    if (checkboxes.length) {

        checkboxes.forEach(
            checkbox => {

                createChoiceEditor(
                    checkbox.parentElement,
                    null
                );

            }
        );

    }

}


// ==========================================
// CREATE CHOICE EDITOR
// ==========================================

function createChoiceEditor(
    item,
    select
) {

    const row =
        document.createElement("div");

    row.className =
        "choice-row";


    const input =
        document.createElement("input");

    input.type = "text";


    if (select) {

        input.value =
            item.text;


        input.oninput =
            function() {

                item.text =
                    this.value;

                item.value =
                    this.value;

            };

    } else {

        const span =
            item.querySelector("span");


        input.value =
            span ?
            span.innerText :
            "";


        input.oninput =
            function() {

                if (span) {

                    span.innerText =
                        this.value;

                }

            };

    }


    const del =
        document.createElement("button");

    del.type = "button";

    del.innerHTML =
        "🗑";


    del.onclick =
        function() {

            item.remove();

            loadChoices(
                selectedField
            );

        };


    row.appendChild(input);

    row.appendChild(del);

    choiceList.appendChild(row);

}


// ==========================================
// ADD CHOICE
// ==========================================

if (addChoiceBtn) {

    addChoiceBtn.onclick =
        function() {

            if (!selectedField) {

                alert(
                    "Please select a field first."
                );

                return;

            }


            // DROPDOWN

            const select =
                selectedField.querySelector(
                    "select"
                );


            if (select) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.text =
                    "New Option";

                option.value =
                    "New Option";


                select.appendChild(
                    option
                );


                loadChoices(
                    selectedField
                );

                return;

            }


            // RADIO

            const radio =
                selectedField.querySelector(
                    "input[type='radio']"
                );


            if (radio) {

                const label =
                    document.createElement(
                        "label"
                    );

                label.className =
                    "radio-option";


                label.innerHTML = `

                    <input
                        type="radio"
                        name="${radio.name}">

                    <span>
                        New Option
                    </span>

                `;


                selectedField.appendChild(
                    label
                );


                loadChoices(
                    selectedField
                );

                return;

            }


            // CHECKBOX

            const checkbox =
                selectedField.querySelector(
                    "input[type='checkbox']"
                );


            if (checkbox) {

                const label =
                    document.createElement(
                        "label"
                    );

                label.className =
                    "checkbox-option";


                label.innerHTML = `

                    <input
                        type="checkbox">

                    <span>
                        New Option
                    </span>

                `;


                selectedField.appendChild(
                    label
                );


                loadChoices(
                    selectedField
                );

            }

        };

}


// ==========================================
// GET FORM DATA
// ==========================================

function getFormData() {

    const fields = [];


    document
        .querySelectorAll(".form-field")
        .forEach(field => {

            const label =
                field.querySelector(
                    "label"
                );


            const input =
                field.querySelector(
                    "input:not([type='radio']):not([type='checkbox']), textarea, select"
                );

            const pageNum = parseInt(field.closest(".form-page-card")?.dataset.page || "1");




            let type = "text";

            let options = [];


            if (input) {

                if (
                    input.tagName ===
                    "SELECT"
                ) {

                    type =
                        "dropdown";


                    options =
                        [
                            ...input.options
                        ].map(
                            option =>
                                option.text
                        );

                } else {

                    type =
                        input.type;

                }

            }


            // Radio

            if (
                field.querySelector(
                    "input[type='radio']"
                )
            ) {

                type =
                    "radio";


                options =
                    [
                        ...field.querySelectorAll(
                            ".radio-option span"
                        )
                    ].map(
                        span =>
                            span.innerText
                    );

            }


            // Checkbox

            if (
                field.querySelector(
                    "input[type='checkbox']"
                )
            ) {

                type =
                    "checkbox";


                options =
                    [
                        ...field.querySelectorAll(
                            ".checkbox-option span"
                        )
                    ].map(
                        span =>
                            span.innerText
                    );

            }


            fields.push({

    id: field.dataset.id,

    label: label ? label.innerText : "",

    type: type,

    placeholder: input ? input.placeholder : "",

    required: input ? input.required : false,

    readonly: input ? input.readOnly : false,

    options: options,
    page: pageNum

});

        });


    return fields;

}


// ==========================================
// SAVE FORM
// ==========================================

if (saveBtn) {

    console.log("Save button found");

    saveBtn.addEventListener("click", function () {

        console.log("SAVE CLICKED");

        saveForm();

    });

}


async function saveForm() {
    console.log("Save button clicked");

    const titleInput =
        document.getElementById("formTitle");

    let title =
        titleInput.value.trim();

    if (title === "") {

        title = "Untitled Form";

    }

    const form = [];

    document
        .querySelectorAll(".form-field")
        .forEach(field => {

            const label =
                field.querySelector("label")
                ?.innerText || "";

            const input =
                field.querySelector(
                    "input, textarea, select"
                );

            let type = "text";

            if (input) {

                if (input.tagName === "SELECT") {

                    type = "dropdown";

                } else {

                    type = input.type;

                }

            }

            let options = [];

// Dropdown options
if (
    input &&
    input.tagName === "SELECT"
) {

    options = [
        ...input.options
    ].map(option => option.text);

}

// Radio options
if (
    field.querySelector("input[type='radio']")
) {

    options = [
        ...field.querySelectorAll(".radio-option span")
    ].map(span => span.innerText.trim());

}

// Checkbox options
if (
    field.querySelector("input[type='checkbox']")
) {

    options = [
        ...field.querySelectorAll(".checkbox-option span")
    ].map(span => span.innerText.trim());

}

           const pageCard =
    field.closest(".form-page-card");

const pageNumber =
    pageCard
        ? parseInt(pageCard.dataset.page || 1)
        : 1;

form.push({

    id: field.dataset.id,

    label: label,

    type: type,

    placeholder:
        input?.placeholder || "",

    required:
        input?.required || false,

    readonly:
        input?.readOnly || false,

    options: options,

    page: pageNumber

});

        });


    try {

    console.log({
        title,
        form,
        conditionalRules
    });

    let response;

if (editFormId) {

    // UPDATE EXISTING FORM
    response = await fetch(
        `http://127.0.0.1:8000/forms/${editFormId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                description: "",
                fields: form,
                conditionalRules: conditionalRules
            })
        }
    );

} else {

    // CREATE NEW FORM
    response = await fetch(
        "http://127.0.0.1:8000/forms/",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title: title,
                description: "",
                fields: form,
                conditionalRules: conditionalRules
            })
        }
    );

}


        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Save error:",
                error
            );

            alert(
                "Failed to save form."
            );

            return;

        }


       const savedForm = await response.json();

console.log("Saved Form:", savedForm);

// Save the current form id
localStorage.setItem(
    "currentFormId",
    savedForm.id
);

alert("Form Saved Successfully.");

window.location.href = "create-form.html";


    }
    catch (error) {

        console.error(
            "Backend error:",
            error
        );

        alert(
            "Backend not running."
        );

    }

}


// ==========================================
// LOAD EXISTING FORM FOR EDIT
// ==========================================

async function loadFormForEdit() {

    if (!editFormId) {

        return;

    }


    try {

        const response =
            await fetch(

                `http://127.0.0.1:8000/forms/${editFormId}`

            );


        if (!response.ok) {

            throw new Error(
                "Form not found"
            );

        }


        const form =
            await response.json();


        // Set title

        const titleInput =
            document.querySelector(
                ".form-title"
            );


        if (titleInput) {

            titleInput.value =
                form.title || "";

        }


        // Remove placeholder

        const placeholder =
            dropZone.querySelector(
                ".placeholder"
            );


        if (placeholder) {

            placeholder.remove();

        }


        // Clear current fields

        dropZone
            .querySelectorAll(
                ".form-field"
            )
            .forEach(
                field =>
                    field.remove()
            );


        // Add saved fields

        if (
            form.fields &&
            form.fields.length > 0
        ) {

            form.fields.forEach(
                fieldData => {

                    createSavedField(
                        fieldData
                    );

                }
            );

        } else {

            checkEmptyDropZone();

        }

    }


    catch (error) {

        console.error(
            error
        );

        alert(
            "Unable to load form."
        );

    }

}

// ==========================================
// TEMPLATE DATA
// ==========================================

const formTemplates = {

    // ======================================
    // STUDENT TEMPLATE
    // ======================================

    student: {

        title: "Student Details Form",

        fields: [

            {
                label: "Student Name",
                type: "text",
                placeholder: "Enter student name",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Roll Number",
                type: "text",
                placeholder: "Enter roll number",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Email",
                type: "email",
                placeholder: "Enter email address",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Branch",
                type: "radio",
                placeholder: "",
                required: true,
                readonly: false,

                options: [
                    "CSE",
                    "ECE",
                    "EEE",
                    "MECH",
                    "CIVIL"
                ]
            },

            {
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: false,
                readonly: false,
                options: []
            }

        ],

        conditionalRules: []

    },


    // ======================================
    // RESTAURANT TEMPLATE
    // ======================================

    restaurant: {

        title: "Restaurant Order Form",

        fields: [

            {
                label: "Customer Name",
                type: "text",
                placeholder: "Enter customer name",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Food Category",
                type: "radio",
                placeholder: "",
                required: true,
                readonly: false,

                options: [
                    "Veg",
                    "Non-Veg"
                ]
            },

            {
                label: "Food Item",
                type: "checkbox",
                placeholder: "",
                required: true,
                readonly: false,

                options: [
                    "Pizza",
                    "Burger",
                    "Biryani",
                    "Pasta"
                ]
            },

            {
                label: "Quantity",
                type: "number",
                placeholder: "Enter quantity",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Special Instructions",
                type: "textarea",
                placeholder: "Enter special instructions",
                required: false,
                readonly: false,
                options: []
            }

        ],

        conditionalRules: []

    },


    // ======================================
    // HOSPITAL TEMPLATE
    // ======================================

    hospital: {

        title: "Hospital Patient Form",

        fields: [

            {
                label: "Patient Name",
                type: "text",
                placeholder: "Enter patient name",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Age",
                type: "number",
                placeholder: "Enter age",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Gender",
                type: "radio",
                placeholder: "",
                required: true,
                readonly: false,

                options: [
                    "Male",
                    "Female",
                    "Other"
                ]
            },

            {
                label: "Symptoms",
                type: "textarea",
                placeholder: "Describe symptoms",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Appointment Date",
                type: "date",
                placeholder: "",
                required: true,
                readonly: false,
                options: []
            }

        ],

        conditionalRules: []

    },


    // ======================================
    // EMPLOYEE TEMPLATE
    // ======================================

    employee: {

        title: "Employee Details Form",

        fields: [

            {
                label: "Employee Name",
                type: "text",
                placeholder: "Enter employee name",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Employee ID",
                type: "text",
                placeholder: "Enter employee ID",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Email",
                type: "email",
                placeholder: "Enter email",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Department",
                type: "dropdown",
                placeholder: "",
                required: true,
                readonly: false,

                options: [
                    "HR",
                    "IT",
                    "Finance",
                    "Marketing",
                    "Operations"
                ]
            },

            {
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: false,
                readonly: false,
                options: []
            }

        ],

        conditionalRules: []

    },


    // ======================================
    // EVENT TEMPLATE
    // ======================================

    event: {

        title: "Event Registration Form",

        fields: [

            {
                label: "Participant Name",
                type: "text",
                placeholder: "Enter participant name",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Email",
                type: "email",
                placeholder: "Enter email",
                required: true,
                readonly: false,
                options: []
            },

            {
                label: "Phone Number",
                type: "tel",
                placeholder: "Enter phone number",
                required: false,
                readonly: false,
                options: []
            },

            {
                label: "Attendance",
                type: "radio",
                placeholder: "",
                required: true,
                readonly: false,

                options: [
                    "Online",
                    "Offline"
                ]
            },

            {
                label: "Session",
                type: "dropdown",
                placeholder: "",
                required: false,
                readonly: false,

                options: [
                    "Morning",
                    "Afternoon",
                    "Evening"
                ]
            }

        ],

        conditionalRules: []

    },


    // ======================================
    // FEEDBACK TEMPLATE
    // ======================================

    feedback: {

        title: "Customer Feedback Form",

        fields: [

            {
                label: "Customer Name",
                type: "text",
                placeholder: "Enter your name",
                required: false,
                readonly: false,
                options: []
            },

            {
                label: "Rating",
                type: "radio",
                placeholder: "",
                required: true,
                readonly: false,

                options: [
                    "Excellent",
                    "Good",
                    "Average",
                    "Poor"
                ]
            },

            {
                label: "Comments",
                type: "textarea",
                placeholder: "Enter your feedback",
                required: false,
                readonly: false,
                options: []
            }

        ],

        conditionalRules: []

    }

};

// ==========================================
// LOAD TEMPLATE INTO BUILDER
// ==========================================

function loadSelectedTemplate() {

    if (!templateName) {
        return;
    }

    const template =
        formTemplates[templateName];

    if (!template) {
        console.error(
            "Template not found:",
            templateName
        );
        return;
    }

    console.log(
        "Loading Template:",
        template
    );

    // =============================
    // SET FORM TITLE
    // =============================

    const titleInput =
        document.querySelector(".form-title");

    if (titleInput) {

        titleInput.value =
            template.title || "";

    }

    // =============================
    // CLEAR BUILDER
    // =============================

    dropZone
        .querySelectorAll(".form-field")
        .forEach(field => field.remove());

    const placeholder =
        dropZone.querySelector(".placeholder");

    if (placeholder) {
        placeholder.remove();
    }

    // =============================
    // CLEAR OLD DATA
    // =============================

    formFields = [];

    conditionalRules =
        template.conditionalRules || [];

    // =============================
    // ADD TEMPLATE FIELDS
    // =============================

    template.fields.forEach(fieldData => {

        createSavedField(fieldData);

    });

    console.log(
        "Template fields loaded:",
        formFields
    );

    console.log(
        "Template rules loaded:",
        conditionalRules
    );
}
// ==========================================
// CREATE FIELD FROM SAVED DATA
// ==========================================

// ==========================================
// CREATE FIELD FROM SAVED DATA
// ==========================================

function createSavedField(fieldData) {

    let fieldType = fieldData.type;

    switch (fieldData.type) {

        case "text":
            fieldType = "Text Field";
            break;

        case "tel":
            fieldType = "Phone";
            break;

        case "email":
            fieldType = "Email";
            break;

        case "number":
            fieldType = "Number";
            break;

        case "dropdown":
            fieldType = "Dropdown";
            break;

        case "radio":
            fieldType = "Radio";
            break;

        case "checkbox":
            fieldType = "Checkbox";
            break;

        case "textarea":
            fieldType = "Address";
            break;

        case "date":
            fieldType = "Date";
            break;

        case "time":
            fieldType = "Time";
            break;

        case "datetime-local":
            fieldType = "DateTime";
            break;

    }

    // Ensure Page Card exists for this field's page number
    const targetPageNum = parseInt(fieldData.page || 1);
    while (document.querySelectorAll(".form-page-card").length < targetPageNum) {
        addNewPage();
    }

    const targetCard = dropZone.querySelector(`.form-page-card[data-page="${targetPageNum}"]`);
    const targetDropZone = targetCard ? targetCard.querySelector('.page-drop-zone') : null;

    addField(fieldType, fieldData.id, null, targetDropZone);

    const field = targetDropZone ? targetDropZone.lastElementChild : dropZone.lastElementChild;

    if (field && fieldData.id) {
        field.dataset.id = fieldData.id;

        const modelField = formFields.find(
            f => f.id === field.dataset.id
        );

        if (modelField) {
            modelField.id = fieldData.id;
            modelField.page = targetPageNum;
        }
    }

    if (!field) return;

    // Label
    const label = field.querySelector("label");
    if (label) {
        label.innerText = fieldData.label || label.innerText;
    }

    const modelField = formFields.find(f => f.id === field.dataset.id);
    if (modelField) {
        modelField.label = fieldData.label || modelField.label;
        modelField.type = fieldData.type;
        modelField.page = targetPageNum;
    }

    // Input
    const input = field.querySelector(
        "input:not([type='radio']):not([type='checkbox']), textarea, select"
    );

    if (input) {
        if (fieldData.placeholder) {
            input.placeholder = fieldData.placeholder;
        }
        input.required = fieldData.required || false;
        input.readOnly = fieldData.readonly || false;
    }

    // Dropdown options
    const select = field.querySelector("select");
    if (select && fieldData.options) {
        select.innerHTML = "";
        fieldData.options.forEach(optionText => {
            const option = document.createElement("option");
            option.text = optionText;
            option.value = optionText;
            select.appendChild(option);
        });
    }

    // Radio options
    if (fieldData.type === "radio") {
        const radioGroup = field.querySelector("input[type='radio']")?.name;
        if (radioGroup) {
            field.innerHTML = `
                <div class="field-toolbar">
                    <button type="button" class="duplicate-btn"><i class="fa-solid fa-copy"></i></button>
                    <button type="button" class="delete-btn"><i class="fa-solid fa-trash"></i></button>
                </div>
                <label class="field-title">${fieldData.label}</label>
            `;
            fieldData.options.forEach(optionText => {
                const option = document.createElement("label");
                option.className = "radio-option";
                option.innerHTML = `
                    <input type="radio" name="${radioGroup}" value="${optionText}">
                    <span>${optionText}</span>
                `;
                field.appendChild(option);
            });
        }
    }

    // Checkbox options
    if (fieldData.type === "checkbox") {
        const checkboxOptions = field.querySelectorAll(".checkbox-option");
        checkboxOptions.forEach(option => option.remove());

        fieldData.options.forEach(optionText => {
            const option = document.createElement("label");
            option.className = "checkbox-option";
            option.innerHTML = `
                <input type="checkbox">
                <span>${optionText}</span>
            `;
            field.appendChild(option);
        });
    }

    attachEvents(field);
}
// ==========================================
// LOAD AI GENERATED FORM
// ==========================================

function loadAIGeneratedForm() {

    const savedAIForm =
        localStorage.getItem("aiGeneratedForm");

    if (!savedAIForm) {
        return;
    }
        initMultiPageBuilder();

    try {

        const aiForm =
            JSON.parse(savedAIForm);

        console.log(
            "AI Generated Form:",
            aiForm
        );

        // Set form title
        const titleInput =
            document.querySelector(".form-title");

        if (titleInput) {

            titleInput.value =
                aiForm.title ||
                "AI Generated Form";

        }

        // Remove placeholder
        const placeholder =
            dropZone.querySelector(".placeholder");

        if (placeholder) {

            placeholder.remove();

        }

        // Clear old fields
        dropZone
            .querySelectorAll(".form-field")
            .forEach(field => field.remove());

        // Clear data model
        formFields = [];

        // Add AI generated fields
        if (
            aiForm.fields &&
            aiForm.fields.length > 0
        ) {

            aiForm.fields.forEach(
                fieldData => {

                    createSavedField(
                        fieldData
                    );

                }
            );

        }

        // Load conditional rules if available
        conditionalRules =
            aiForm.conditionalRules || [];

        // Remove temporary AI data
        localStorage.removeItem(
            "aiGeneratedForm"
        );

    }

    catch (error) {

        console.error(
            "Unable to load AI generated form:",
            error
        );

    }

}
// ==========================================
// LOAD FORM DATA
// ==========================================

// Load existing form when editing
if (editFormId) {

    loadFormForEdit();

}

// Load AI generated form
else if (!templateName) {

    loadAIGeneratedForm();

}

// ==========================================
// LOAD SELECTED TEMPLATE
// ==========================================

if (templateName && !editFormId) {

    loadSelectedTemplate();

}
// ==========================================
// PREVIEW FORM
// ==========================================

const previewBtn = document.getElementById("previewBtn");

if (previewBtn) {

    previewBtn.addEventListener("click", function () {

    const title =
        document.querySelector(".form-title").value.trim();

    localStorage.setItem(
        "previewTitle",
        title || "Untitled Form"
    );

    localStorage.setItem(
        "previewForm",
        JSON.stringify(getFormData())
    );

    // ADD THIS
    localStorage.setItem(
        "previewRules",
        JSON.stringify(conditionalRules)
    );

    console.log("Rules:", conditionalRules);

    const formId = editFormId || localStorage.getItem("currentFormId");

if (!formId) {
    alert("Please save the form first.");
    return;
}
console.log("Opening preview for Form ID:", formId);
window.open(`preview.html?id=${formId}`, "_blank");

});

}
// ==========================================
// PUBLISH FORM
// ==========================================

const publishBtn = document.getElementById("publishBtn");

if (publishBtn) {

    publishBtn.addEventListener("click", publishForm);

}

async function publishForm() {

    const formId = localStorage.getItem("currentFormId");

    if (!formId) {

        alert("Please save the form first.");

        return;

    }

    try {
        console.log("SAVING FORM FIELDS:", formFields);

        const response = await fetch(

            `http://127.0.0.1:8000/forms/${formId}/publish`,

            {
                method: "PATCH"
            }

        );

        const data = await response.json();

        if (response.ok) {

    // Store current form id
    localStorage.setItem("publishedFormId", formId);

    // Open publish page
    window.location.href = "publish.html";

} else {

    alert(data.detail);

}

    }

    catch (error) {

        console.log(error);

        alert("Backend not running.");

    }

}
function openConditionModal(fieldId){

    const targetField =
    prompt("Enter Target Field Label");

    if(!targetField) return;

    const expectedValue =
    prompt("Show when value equals:");

    if(expectedValue===null) return;

    conditionalRules.push({

        sourceField: fieldId,

        targetField: targetField,

        expectedValue: expectedValue

    });

    alert("Conditional Logic Added Successfully");

}
const saveConditionBtn =
document.getElementById("saveConditionBtn");

if(saveConditionBtn){

saveConditionBtn.addEventListener(
"click",
saveCondition
);

}

function saveCondition() {

    if (!selectedField) {
        alert("Please select a field first.");
        return;
    }

    const ifField =
        document.getElementById("conditionField").value;

    const operator =
        document.getElementById("conditionOperator").value;

    const value =
        document.getElementById("conditionValue").value;

    const action =
        document.getElementById("actionType").value;

    const targetField =
        document.getElementById("targetField").value;

    if (!ifField || !targetField) {
        alert("Please select both IF Field and Target Field.");
        return;
    }

    const rule = {

        id: Date.now(),

        enabled: true,

        priority: conditionalRules.length + 1,

        if_condition: {
            field: ifField,
            operator: operator,
            value: value
        },

        then: [
            {
                action: action,
                field: targetField
            }
        ]
    };

    conditionalRules.push(rule);

    console.log("Conditional Rules:", conditionalRules);

    alert("Rule Saved Successfully");
}
function updateConditionDropdown() {

    const conditionDropdown =
        document.getElementById("conditionField");

    const targetDropdown =
        document.getElementById("targetField");

    conditionDropdown.innerHTML =
        '<option value="">Select Field</option>';

    targetDropdown.innerHTML =
        '<option value="">Select Field</option>';

    if (!selectedField) return;

    const selectedId = selectedField.dataset.id;
    console.log("Selected ID:", selectedId);
console.log("Form Fields:", formFields);

    formFields.forEach(field => {
         console.log("Comparing:", field.id, selectedId);

        // IF Field (exclude current field)
        if (field.id !== selectedId) {

            const option = document.createElement("option");

            option.value = field.id;
            option.textContent = field.label;

            conditionDropdown.appendChild(option);
        }

        // Target Field (include all fields)
        const targetOption = document.createElement("option");

        targetOption.value = field.id;
        targetOption.textContent = field.label;

        targetDropdown.appendChild(targetOption);

    });

}
// ==========================================
// APPLY CONDITIONAL LOGIC
// ==========================================

function applyConditionalLogic() {

    console.log("Applying conditional logic...");
    console.log("Rules:", conditionalRules);

    if (!conditionalRules || conditionalRules.length === 0) {
        return;
    }

    conditionalRules.forEach(rule => {

        // --------------------------------------
        // NEW RULE FORMAT
        // --------------------------------------

        if (
            rule.if_condition &&
            rule.then
        ) {

            const sourceFieldId =
                rule.if_condition.field;

            const operator =
                rule.if_condition.operator;

            const expectedValue =
                rule.if_condition.value;

            const sourceField =
                document.querySelector(
                    `.form-field[data-id="${sourceFieldId}"]`
                );

            if (!sourceField) {
                console.log(
                    "Source field not found:",
                    sourceFieldId
                );
                return;
            }

            // --------------------------------------
            // GET SELECTED VALUE
            // --------------------------------------

            let actualValue = "";

            const checkedRadio =
                sourceField.querySelector(
                    "input[type='radio']:checked"
                );

            if (checkedRadio) {

                actualValue =
                    checkedRadio.value ||
                    checkedRadio.parentElement
                        .querySelector("span")
                        ?.innerText ||
                    "";

            } else {

                const select =
                    sourceField.querySelector("select");

                if (select) {

                    actualValue =
                        select.value;

                } else {

                    const input =
                        sourceField.querySelector(
                            "input, textarea"
                        );

                    if (input) {
                        actualValue =
                            input.value;
                    }

                }

            }

            actualValue =
                actualValue.trim();

            const expected =
                String(expectedValue).trim();

            // --------------------------------------
            // CHECK CONDITION
            // --------------------------------------

            let conditionMatched = false;

            switch (operator) {

                case "equals":
                case "==":
                case "=":

                    conditionMatched =
                        actualValue === expected;

                    break;


                case "not_equals":
                case "!=":

                    conditionMatched =
                        actualValue !== expected;

                    break;


                case "contains":

                    conditionMatched =
                        actualValue
                            .toLowerCase()
                            .includes(
                                expected.toLowerCase()
                            );

                    break;


                default:

                    conditionMatched =
                        actualValue === expected;

            }

            console.log(
                "Condition:",
                actualValue,
                operator,
                expected,
                "Matched:",
                conditionMatched
            );

            // --------------------------------------
            // APPLY ACTION
            // --------------------------------------

            rule.then.forEach(action => {

                const targetField =
                    document.querySelector(
                        `.form-field[data-id="${action.field}"]`
                    );

                if (!targetField) {

                    console.log(
                        "Target field not found:",
                        action.field
                    );

                    return;

                }

                switch (action.action) {

                    case "show":

                        targetField.style.display =
                            conditionMatched
                                ? ""
                                : "none";

                        break;


                    case "hide":

                        targetField.style.display =
                            conditionMatched
                                ? "none"
                                : "";

                        break;


                    case "enable":

                        targetField
                            .querySelectorAll(
                                "input, textarea, select"
                            )
                            .forEach(input => {

                                input.disabled =
                                    !conditionMatched;

                            });

                        break;


                    case "disable":

                        targetField
                            .querySelectorAll(
                                "input, textarea, select"
                            )
                            .forEach(input => {

                                input.disabled =
                                    conditionMatched;

                            });

                        break;

                }

            });

        }

    });

}
// ==========================================
// LISTEN FOR FIELD VALUE CHANGES
// ==========================================

dropZone.addEventListener("change", function(e) {

    console.log(
        "Field changed:",
        e.target
    );

    applyConditionalLogic();

});
// ==========================================
// THEME BUTTON
// ==========================================

// ==========================================
// THEME MENU
// ==========================================

const themeBtn = document.getElementById("themeBtn");
const themeMenu = document.getElementById("themeMenu");

if (themeBtn && themeMenu) {

    themeBtn.addEventListener("click", function (e) {

        e.stopPropagation();

        themeMenu.style.display =
            themeMenu.style.display === "block"
                ? "none"
                : "block";

    });


    // Close menu when clicking outside

    document.addEventListener("click", function (e) {

        if (
            !themeMenu.contains(e.target) &&
            !themeBtn.contains(e.target)
        ) {

            themeMenu.style.display = "none";

        }

    });

}
// ==========================================
// APPLY FORM THEME
// ==========================================

const themeOptions =
    document.querySelectorAll(".theme-option");

const builder =
    document.querySelector(".builder");

themeOptions.forEach(option => {

    option.addEventListener("click", function () {

        const selectedTheme =
            this.dataset.theme;

        // Remove previous theme
        builder.classList.remove(
            "theme-professional",
            "theme-midnight",
            "theme-ocean",
            "theme-emerald",
            "theme-royal",
            "theme-rose",
            "theme-warm",
            "theme-slate"
        );

        // Apply selected theme
        builder.classList.add(
            "theme-" + selectedTheme
        );

        // Close theme menu
        themeMenu.style.display = "none";

        console.log(
            "Theme applied:",
            selectedTheme
        );

    });

});
/* =====================================================
   THEME SYSTEM
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const themeBtn = document.getElementById("themeBtn");
    const themeMenu = document.getElementById("themeMenu");
    const themeOptions = document.querySelectorAll(".theme-option");
    const builder = document.querySelector(".builder");


    /* -------------------------------------------------
       CHECK ELEMENTS
    ------------------------------------------------- */

    if (!themeBtn || !themeMenu || !builder) {

        console.error("Theme system: Required elements not found.");

        return;

    }


    /* -------------------------------------------------
       GET FORM ID
    ------------------------------------------------- */

    const urlParams = new URLSearchParams(window.location.search);

    const formId = urlParams.get("id");


    /* -------------------------------------------------
       STORAGE KEY
    ------------------------------------------------- */

    const themeStorageKey = formId
        ? "formTheme_" + formId
        : "formTheme_default";


    /* -------------------------------------------------
       OPEN / CLOSE THEME MENU
    ------------------------------------------------- */

    themeBtn.addEventListener("click", function (event) {

        event.stopPropagation();

        themeMenu.classList.toggle("show");

    });


    /* -------------------------------------------------
       PREVENT MENU CLICK FROM CLOSING IT
    ------------------------------------------------- */

    themeMenu.addEventListener("click", function (event) {

        event.stopPropagation();

    });


    /* -------------------------------------------------
       CLOSE WHEN CLICKING OUTSIDE
    ------------------------------------------------- */

    document.addEventListener("click", function () {

        themeMenu.classList.remove("show");

    });


    /* -------------------------------------------------
       APPLY THEME
    ------------------------------------------------- */

    function applyTheme(theme) {

        const validThemes = [
            "professional",
            "midnight",
            "ocean",
            "emerald",
            "royal",
            "rose"
        ];


        /* Safety check */

        if (!validThemes.includes(theme)) {

            theme = "professional";

        }


        /* Apply theme to builder */

        builder.setAttribute("data-theme", theme);


        /* Save theme */

        localStorage.setItem(
            themeStorageKey,
            theme
        );


        /* Update active button */

        themeOptions.forEach(function (option) {

            option.classList.remove("active");


            if (
                option.getAttribute("data-theme") === theme
            ) {

                option.classList.add("active");

            }

        });


        /* Update button title */

        themeBtn.setAttribute(
            "title",
            "Current theme: " +
            theme.charAt(0).toUpperCase() +
            theme.slice(1)
        );

    }


    /* -------------------------------------------------
       THEME OPTION CLICK
    ------------------------------------------------- */

    themeOptions.forEach(function (option) {

        option.addEventListener("click", function () {

            const selectedTheme =
                this.getAttribute("data-theme");


            console.log(
                "Theme selected:",
                selectedTheme
            );


            applyTheme(selectedTheme);


            /* Close menu */

            themeMenu.classList.remove("show");

        });

    });


    /* -------------------------------------------------
       LOAD SAVED THEME
    ------------------------------------------------- */

    const savedTheme =
        localStorage.getItem(themeStorageKey);


    if (savedTheme) {

        applyTheme(savedTheme);

    } else {

        applyTheme("professional");

    }

});
// ==========================================
// FORMAI PANEL
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const formAIBtn =
        document.getElementById("formAIBtn");

    const formAIPanel =
        document.getElementById("formAIPanel");

    const closeFormAI =
        document.getElementById("closeFormAI");
    const formAIInput =
    document.getElementById("formAIInput");

const sendFormAI =
    document.getElementById("sendFormAI");

const formAIChat =
    document.getElementById("formAIChat");

    if (
        !formAIBtn ||
        !formAIPanel ||
        !closeFormAI
    ) {

        console.error(
            "FormAI: Required elements not found."
        );

        return;

    }

    formAIBtn.addEventListener("click", function () {

        formAIPanel.classList.add("open");

    });

    closeFormAI.addEventListener("click", function () {

        formAIPanel.classList.remove("open");

    });

});

// Wire up FormAI Quick Action buttons
document.querySelectorAll(".form-ai-action").forEach(btn => {
    btn.addEventListener("click", function() {
        const text = this.innerText.toLowerCase();
        if (text.includes("suggest")) {
            addFormAIMessage("Suggest fields", "user");
            setTimeout(() => addFormAIMessage(getFormAIResponse("suggest fields"), "ai"), 400);
        } else if (text.includes("improve") || text.includes("review")) {
            addFormAIMessage("Improve my form", "user");
            setTimeout(() => addFormAIMessage(getFormAIResponse("review form"), "ai"), 400);
        } else if (text.includes("generate")) {
            addFormAIMessage("Generate a form", "user");
            setTimeout(() => addFormAIMessage(getFormAIResponse("generate form"), "ai"), 400);
        }
    });
});
// ==========================================
// ADD CHAT MESSAGE
// ==========================================

function addFormAIMessage(message, sender) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "form-ai-message " + sender;

    const messageText =
        document.createElement("div");

    messageText.className =
        "form-ai-message-text";

    messageText.innerHTML = message;

    messageDiv.appendChild(
        messageText
    );

    formAIChat.appendChild(
        messageDiv
    );

    formAIChat.scrollTop =
        formAIChat.scrollHeight;

}


// ==========================================
// GET SIMPLE FORMAI RESPONSE
// ==========================================
// ==========================================
// HELPER: ADD AI SUGGESTED FIELD TO CANVAS
// ==========================================
window.addSuggestedField = function(type, labelText) {
    const placeholder = dropZone.querySelector(".placeholder");
    if (placeholder) placeholder.remove();

    addField(type, null, labelText);
    addFormAIMessage(`Added <strong>"${labelText}"</strong> (${type}) directly into your form!`, "ai");
};

// ==========================================
// HELPER: READ CURRENT CANVAS FIELDS
// ==========================================
function getCurrentFormContext() {
    const titleInput = document.getElementById("formTitle");
    const title = titleInput ? (titleInput.value.trim() || "Untitled Form") : "Untitled Form";
    const currentFields = getFormData();

    return {
        title: title,
        fields: currentFields,
        fieldCount: currentFields.length,
        rules: conditionalRules || [],
        hasEmail: currentFields.some(f => f.type === "email" || f.label.toLowerCase().includes("email")),
        hasPhone: currentFields.some(f => f.type === "tel" || f.label.toLowerCase().includes("phone")),
        hasRequired: currentFields.some(f => f.required)
    };
}

// ==========================================
// FORM REVIEW & HEALTH AUDIT
// ==========================================
function reviewCurrentForm() {
    const context = getCurrentFormContext();
    let score = 100;
    const strengths = [];
    const warnings = [];
    const recommendations = [];

    if (context.fieldCount === 0) {
        return `
            <div class="ai-score-badge low">Form Health Score: 0/100</div>
            <p><strong>Your form canvas is currently empty!</strong></p>
            <p>Drag components from the left panel or click <em>"Generate a form"</em> to get started.</p>
        `;
    }

    if (context.title === "Untitled Form") {
        score -= 15;
        warnings.push("Form title is set to default ('Untitled Form'). Give it a descriptive title.");
    } else {
        strengths.push(`Descriptive title set: <strong>"${context.title}"</strong>.`);
    }

    if (context.fieldCount < 3) {
        score -= 15;
        warnings.push(`Form has only ${context.fieldCount} field(s). Most forms need at least 3-5 fields.`);
    } else {
        strengths.push(`Good form length with ${context.fieldCount} fields.`);
    }

    if (!context.hasEmail && !context.hasPhone) {
        score -= 20;
        warnings.push("Missing contact info (Email or Phone). Respondents cannot be reached.");
        recommendations.push(`
            <div class="ai-suggest-card">
                <div><strong>Add Email Field</strong><small>Essential for notifications</small></div>
                <button class="ai-add-field-btn" onclick="addSuggestedField('Email', 'Email Address')">+ Add Email</button>
            </div>
        `);
    } else {
        strengths.push("Includes contact field (Email/Phone) for follow-ups.");
    }

    if (!context.hasRequired) {
        score -= 15;
        warnings.push("No fields are marked as Required.");
    } else {
        strengths.push("Required validation enabled on key fields.");
    }

    const badgeClass = score >= 80 ? "high" : (score >= 50 ? "medium" : "low");

    return `
        <div class="ai-score-badge ${badgeClass}">Form Health Score: ${score}/100</div>
        
        <div class="ai-section-box">
            <strong style="color:#15803d;">✓ What's Working Well</strong>
            <ul class="ai-audit-list">${strengths.map(s => `<li>${s}</li>`).join("")}</ul>
        </div>

        ${warnings.length ? `
        <div class="ai-section-box" style="margin-top:8px;">
            <strong style="color:#b45309;">⚠ Areas to Improve</strong>
            <ul class="ai-audit-list">${warnings.map(w => `<li>${w}</li>`).join("")}</ul>
        </div>` : ''}

        ${recommendations.length ? `<div style="margin-top:10px;">${recommendations.join("")}</div>` : ''}
    `;
}

// ==========================================
// FIELD SUGGESTION ENGINE
// ==========================================
function suggestFieldsForForm() {
    const context = getCurrentFormContext();
    const existingLabels = context.fields.map(f => f.label.toLowerCase());
    const suggestions = [];

    if (!existingLabels.some(l => l.includes("email"))) {
        suggestions.push({ type: "Email", label: "Email Address", desc: "Allows sending receipts and notifications." });
    }
    if (!existingLabels.some(l => l.includes("phone") || l.includes("mobile"))) {
        suggestions.push({ type: "Phone", label: "Phone Number", desc: "Great for quick SMS updates and contact." });
    }
    if (!existingLabels.some(l => l.includes("address") || l.includes("location"))) {
        suggestions.push({ type: "Address", label: "Address Details", desc: "Useful for physical location data." });
    }

    if (suggestions.length === 0) {
        suggestions.push(
            { type: "Date", label: "Preferred Date", desc: "Allow scheduling dates." },
            { type: "Checkbox", label: "Terms & Consent", desc: "User agreement checkbox." }
        );
    }

    return `
        <p>Based on <strong>"${context.title}"</strong> (${context.fieldCount} fields), here are recommended field additions:</p>
        ${suggestions.map(s => `
            <div class="ai-suggest-card">
                <div>
                    <strong>${s.label}</strong>
                    <small>${s.desc}</small>
                </div>
                <button class="ai-add-field-btn" onclick="addSuggestedField('${s.type}', '${s.label}')">+ Add Field</button>
            </div>
        `).join("")}
    `;
}

// ==========================================
// FORMAI QUERY PROCESSOR
// ==========================================
function getFormAIResponse(message) {
    const text = message.toLowerCase().trim();
    const context = getCurrentFormContext();

    // 1. Form Review / Health Audit
    if (text.includes("review") || text.includes("audit") || text.includes("improve") || text.includes("check") || text.includes("score")) {
        return reviewCurrentForm();
    }

    // 2. Field Suggestions
    if (text.includes("suggest") || text.includes("recommend") || text.includes("missing")) {
        return suggestFieldsForForm();
    }

    // 3. Inspect Current Fields
    if (text.includes("fields") || text.includes("list") || text.includes("what fields") || text.includes("how many")) {
        if (context.fieldCount === 0) {
            return "Your form canvas is currently empty! Drag fields onto the canvas or ask me to suggest fields.";
        }
        const listHTML = context.fields.map((f, i) => `<li><strong>${i + 1}. ${f.label}</strong> (${f.type})</li>`).join("");
        return `<p>Your form <strong>"${context.title}"</strong> has <strong>${context.fieldCount} field(s)</strong>:</p><ul class="ai-audit-list">${listHTML}</ul>`;
    }

    // 4. Greetings & General Help
    if (text === "hi" || text === "hello" || text === "hey") {
        return `Hi 👋! I've inspected your form <strong>"${context.title}"</strong> (${context.fieldCount} fields). Ask me to <strong>"review form"</strong> or <strong>"suggest fields"</strong>!`;
    }

    return `
        I've inspected your current form <strong>"${context.title}"</strong> (${context.fieldCount} fields).
        <p style="margin-top:6px;">Try asking me:</p>
        <ul class="ai-audit-list">
            <li><strong>"review form"</strong> - for a complete form quality audit</li>
            <li><strong>"suggest fields"</strong> - for recommended missing fields</li>
            <li><strong>"list fields"</strong> - to see all current canvas fields</li>
        </ul>
    `;
}

// ==========================================
// SEND MESSAGE
// ==========================================

function sendMessageToFormAI() {

    const message =
        formAIInput.value.trim();


    if (message === "") {

        return;

    }


    // Show user message

    addFormAIMessage(
        message,
        "user"
    );


    // Clear input

    formAIInput.value = "";


    // Get AI response

    setTimeout(function () {

        const response =
            getFormAIResponse(message);

        addFormAIMessage(
            response,
            "ai"
        );

    }, 500);

}


// ==========================================
// SEND BUTTON CLICK
// ==========================================

sendFormAI.addEventListener(
    "click",
    sendMessageToFormAI
);


// ==========================================
// ENTER KEY
// ==========================================

formAIInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            sendMessageToFormAI();

        }

    }
);
// ==========================================
// MULTI-PAGE BUILDER & SUBMIT BUTTON SYSTEM
// ==========================================


// 1. Initialize Multi-Page Container
function initMultiPageBuilder() {
    const dropZone = document.getElementById("dropZone");
    if (!dropZone) return;

    // Check if Page 1 card already exists
    let page1 = dropZone.querySelector('.form-page-card[data-page="1"]');
    if (!page1) {
        // Collect any fields currently inside dropZone
        const existingFields = [...dropZone.querySelectorAll(".form-field")];

        // Create Page 1
        page1 = createPageCard(1);

        // Clear dropzone and add Page 1
        dropZone.innerHTML = "";
        dropZone.appendChild(page1);

        const page1DropZone = page1.querySelector(".page-drop-zone");
        if (existingFields.length > 0) {
            const placeholder = page1DropZone.querySelector(".placeholder");
            if (placeholder) placeholder.remove();

            existingFields.forEach(field => page1DropZone.appendChild(field));
        }
    }
    updatePageFooters();
}

// 2. Create Page Card Element
function createPageCard(pageNum) {
    const pageCard = document.createElement("div");
    pageCard.className = "form-page-card";
    pageCard.dataset.page = pageNum;

    pageCard.innerHTML = `
        <div class="page-card-header">
            <h3><i class="fa-solid fa-file-lines"></i> Page <span class="page-num-text">${pageNum}</span></h3>
            ${pageNum > 1 ? `<button type="button" class="delete-page-btn" onclick="deletePage(this)"><i class="fa-solid fa-trash"></i> Delete Page</button>` : `<span style="font-size:12px; color:#64748b;">Main Page</span>`}
        </div>
        <div class="page-drop-zone">
            <div class="placeholder" style="height:120px; min-height:100px;">
                <i class="fa-solid fa-hand-pointer" style="font-size:30px; margin-bottom:6px;"></i>
                <h4 style="font-size:15px; color:#2563eb;">Drag Fields into Page ${pageNum}</h4>
            </div>
        </div>
        <div class="page-card-footer"></div>
    `;

    const dropArea = pageCard.querySelector(".page-drop-zone");
    enablePageDropEvents(dropArea);
    return pageCard;
}

// 3. Enable Drag & Drop for Each Page
function enablePageDropEvents(dropArea) {
    dropArea.addEventListener("dragover", function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        dropArea.closest(".form-page-card").classList.add("drag-over");
    });

    dropArea.addEventListener("dragleave", function() {
        dropArea.closest(".form-page-card").classList.remove("drag-over");
    });

    dropArea.addEventListener("drop", function(e) {
    e.preventDefault();
    e.stopPropagation(); // <-- Stops event from reaching parent dropZone listener
    dropArea.closest(".form-page-card").classList.remove("drag-over");

    const type = e.dataTransfer.getData("field-type");
    if (type) {
        const placeholder = dropArea.querySelector(".placeholder");
        if (placeholder) placeholder.remove();

        // Pass dropArea into addField so it appends directly to this page
        addField(type, null, null, dropArea);
    }
});
}

// 4. Add Page Click Action
function addNewPage() {

    const dropZone =
        document.getElementById("dropZone");

    if (!dropZone) {
        console.error("Drop zone not found.");
        return;
    }

    // Keep pageCount synchronized with existing pages
    const existingPages =
        dropZone.querySelectorAll(".form-page-card").length;

    if (pageCount < existingPages) {
        pageCount = existingPages;
    }

    pageCount++;

    const newPage =
        createPageCard(pageCount);

    dropZone.appendChild(newPage);

    updatePageFooters();

    newPage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// 5. Delete Page Action
window.deletePage = function(btn) {
    const pageCard = btn.closest(".form-page-card");
    if (!pageCard) return;

    // Move any fields back to Page 1 before deleting
    const page1Drop = document.querySelector('.form-page-card[data-page="1"] .page-drop-zone');
    const fieldsOnPage = pageCard.querySelectorAll(".form-field");

    if (page1Drop && fieldsOnPage.length > 0) {
        const p1Placeholder = page1Drop.querySelector(".placeholder");
        if (p1Placeholder) p1Placeholder.remove();

        fieldsOnPage.forEach(f => page1Drop.appendChild(f));
    }

    pageCard.remove();
    reorderPageNumbers();
    updatePageFooters();
};

function reorderPageNumbers() {
    const allPages = document.querySelectorAll(".form-page-card");
    pageCount = allPages.length;
    allPages.forEach((page, index) => {
        const num = index + 1;
        page.dataset.page = num;
        const span = page.querySelector(".page-num-text");
        if (span) span.innerText = num;
    });
}

// 6. Dynamic Submit Button Placement (Page 1 if 1 Page, Page 2 if 2 Pages)
function updatePageFooters() {
    const allPages = document.querySelectorAll(".form-page-card");
    const total = allPages.length;

    allPages.forEach((page, index) => {
        const footer = page.querySelector(".page-card-footer");
        if (!footer) return;

        const isLastPage = (index === total - 1);

        if (isLastPage) {
            // SUBMIT BUTTON ON FINAL PAGE
            footer.innerHTML = `
                <button type="button" class="submit-form-btn-canvas">
                    <i class="fa-solid fa-paper-plane"></i> Submit Form
                </button>
            `;
        } else {
            // NEXT PAGE INDICATOR ON EARLIER PAGES
            footer.innerHTML = `
                <div class="next-page-btn-canvas">
                    Next Page (${index + 2} of ${total}) <i class="fa-solid fa-arrow-right"></i>
                </div>
            `;
        }
    });
}

// 7. Event Listener Initialization
document.addEventListener("DOMContentLoaded", function() {
    initMultiPageBuilder();

    const addPageBtn = document.getElementById("addPageBtn");
    if (addPageBtn) {
        addPageBtn.addEventListener("click", addNewPage);
    }
});