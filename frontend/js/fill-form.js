// ==========================================
// SMART FORM BUILDER
// PUBLIC FILL FORM
// ==========================================

const formTitle = document.getElementById("formTitle");
const formDescription = document.getElementById("formDescription");
const formFields = document.getElementById("formFields");
const publicForm = document.getElementById("publicForm");
const loader = document.getElementById("loader");
const nextPageBtn = document.getElementById("nextPageBtn");
const backPageBtn = document.getElementById("backPageBtn");
const submitPageBtn = document.getElementById("submitPageBtn");

// ==========================================
// FORM STATE
// ==========================================

let currentForm = null;
let currentPage = 1;
let totalPages = 1;

// ==========================================
// GET FORM ID
// ==========================================

const params = new URLSearchParams(window.location.search);
const formId = params.get("id");

// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", loadForm);

// ==========================================
// LOAD PUBLISHED FORM
// ==========================================

async function loadForm() {

    if (!formId) {
        showError("Invalid form link.");
        return;
    }

    showLoader();

    try {

        const response = await fetch(
            `http://127.0.0.1:8000/forms/${formId}`
        );

        if (!response.ok) {
            throw new Error("Form could not be loaded.");
        }

        currentForm = await response.json();

        console.log("Published Form:", currentForm);
        console.log("Published Fields:", currentForm.fields);

        console.log(
            "Conditional Rules:",
            currentForm.conditional_rules ||
            currentForm.conditionalRules ||
            []
        );

        renderForm(currentForm);

    }
    catch (error) {

        console.error("Load form error:", error);

        showError(
            "Unable to load this form. Please try again."
        );

    }
    finally {

        hideLoader();

    }

}

// ==========================================
// RENDER FORM
// ==========================================

function renderForm(form) {

    formTitle.innerText =
        form.title || "Untitled Form";

    formDescription.innerText =
        form.description || "";

    formFields.innerHTML = "";

    const fields =
        Array.isArray(form.fields)
            ? form.fields
            : [];

    if (fields.length === 0) {

        formFields.innerHTML = `
            <div class="empty-form">
                <i class="fa-solid fa-file-circle-question"></i>
                <h3>No fields available</h3>
                <p>This form does not contain any fields.</p>
            </div>
        `;

        setupSinglePageButtons();
        return;
    }

    totalPages = getTotalPages(fields);

    console.log("Total Pages:", totalPages);

    const pages = {};

    for (
        let pageNumber = 1;
        pageNumber <= totalPages;
        pageNumber++
    ) {

        const page = document.createElement("div");

        page.className = "form-page";

        page.dataset.page = pageNumber;

        page.style.display =
            pageNumber === 1
                ? "block"
                : "none";

        pages[pageNumber] = page;

        formFields.appendChild(page);
    }

    fields.forEach((field, index) => {

        console.log("Rendering field:", field);

        const pageNumber =
            getFieldPage(field);

        const targetPage =
            pages[pageNumber] || pages[1];

        const fieldElement =
            createField(field, index);

        if (fieldElement) {
            targetPage.appendChild(fieldElement);
        }

    });

    currentPage = 1;

    updateNavigation();

    setupConditionalRules();
}

// ==========================================
// GET TOTAL PAGES
// ==========================================

function getTotalPages(fields) {

    let highestPage = 1;

    fields.forEach(field => {

        const page =
            Number(
                field.page ??
                field.pageNumber ??
                field.page_no ??
                1
            );

        if (page > highestPage) {
            highestPage = page;
        }

    });

    return highestPage;
}

// ==========================================
// GET FIELD PAGE
// ==========================================

function getFieldPage(field) {

    const page =
        Number(
            field.page ??
            field.pageNumber ??
            field.page_no ??
            1
        );

    if (
        page < 1 ||
        Number.isNaN(page)
    ) {
        return 1;
    }

    return page;
}

// ==========================================
// CREATE FIELD
// ==========================================

function createField(field, index) {

    const wrapper =
        document.createElement("div");

    wrapper.className = "form-group";

    const fieldId =
        field.id ??
        field.field_id ??
        field.fieldId ??
        `field_${index}`;

    wrapper.dataset.fieldId =
        String(fieldId);

    wrapper.dataset.fieldType =
        field.type || "";

    // ======================================
    // LABEL
    // ======================================

    const label =
        document.createElement("label");

    label.innerHTML =
        escapeHtml(
            field.label ||
            "Untitled Field"
        );

    if (field.required) {

        const required =
            document.createElement("span");

        required.className = "required";

        required.innerText = " *";

        label.appendChild(required);
    }

    wrapper.appendChild(label);

    // ======================================
    // TEXT / EMAIL / PHONE / NUMBER
    // DATE / TIME / DATETIME
    // ======================================

    if (
        [
            "text",
            "email",
            "tel",
            "number",
            "decimal",
            "currency",
            "date",
            "time",
            "datetime-local"
        ].includes(field.type)
    ) {

        const input =
            document.createElement("input");

        input.type =
            normalizeInputType(field.type);

        input.placeholder =
            field.placeholder || "";

        input.required =
            Boolean(field.required);

        input.readOnly =
            Boolean(field.readonly);

        wrapper.appendChild(input);

        return wrapper;
    }

    // ======================================
    // TEXTAREA
    // ======================================

    if (field.type === "textarea") {

        const textarea =
            document.createElement("textarea");

        textarea.placeholder =
            field.placeholder || "";

        textarea.required =
            Boolean(field.required);

        textarea.readOnly =
            Boolean(field.readonly);

        wrapper.appendChild(textarea);

        return wrapper;
    }

    // ======================================
    // DROPDOWN
    // ======================================

    if (field.type === "dropdown") {

        const select =
            document.createElement("select");

        select.required =
            Boolean(field.required);

        const emptyOption =
            document.createElement("option");

        emptyOption.value = "";

        emptyOption.innerText =
            "Select an option";

        select.appendChild(emptyOption);

        const options =
            Array.isArray(field.options)
                ? field.options
                : [];

        options.forEach(optionValue => {

            const option =
                document.createElement("option");

            option.value =
                optionValue;

            option.innerText =
                optionValue;

            select.appendChild(option);

        });

        wrapper.appendChild(select);

        return wrapper;
    }

    // ======================================
    // RADIO
    // ======================================

    if (field.type === "radio") {

        const radioGroup =
            document.createElement("div");

        radioGroup.className =
            "radio-group";

        const options =
            Array.isArray(field.options)
                ? field.options
                : [];

        options.forEach(
            (optionValue, optionIndex) => {

                const optionLabel =
                    document.createElement("label");

                optionLabel.className =
                    "radio-option";

                const radio =
                    document.createElement("input");

                radio.type = "radio";

                radio.name =
                    `field_${fieldId}`;

                radio.value =
                    optionValue;

                radio.required =
                    Boolean(
                        field.required &&
                        optionIndex === 0
                    );

                const text =
                    document.createElement("span");

                text.innerText =
                    optionValue;

                optionLabel.appendChild(radio);

                optionLabel.appendChild(text);

                radioGroup.appendChild(optionLabel);
            }
        );

        wrapper.appendChild(radioGroup);

        return wrapper;
    }

    // ======================================
    // CHECKBOX
    // ======================================

    if (field.type === "checkbox") {

        const checkboxGroup =
            document.createElement("div");

        checkboxGroup.className =
            "checkbox-group";

        const options =
            Array.isArray(field.options)
                ? field.options
                : [];

        options.forEach(optionValue => {

            const optionLabel =
                document.createElement("label");

            optionLabel.className =
                "checkbox-option";

            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.value =
                optionValue;

            checkbox.name =
                `field_${fieldId}`;

            const text =
                document.createElement("span");

            text.innerText =
                optionValue;

            optionLabel.appendChild(checkbox);

            optionLabel.appendChild(text);

            checkboxGroup.appendChild(optionLabel);
        });

        wrapper.appendChild(checkboxGroup);

        return wrapper;
    }

    console.warn(
        "Unknown field type:",
        field.type
    );

    return wrapper;
}

// ==========================================
// NORMALIZE INPUT TYPE
// ==========================================

function normalizeInputType(type) {

    if (
        type === "decimal" ||
        type === "currency"
    ) {
        return "number";
    }

    return type;
}

// ==========================================
// NAVIGATION
// ==========================================

function updateNavigation() {

    if (totalPages <= 1) {

        if (nextPageBtn) {
            nextPageBtn.style.display = "none";
        }

        if (backPageBtn) {
            backPageBtn.style.display = "none";
        }

        if (submitPageBtn) {
            submitPageBtn.style.display = "inline-flex";
        }

        return;
    }

    if (currentPage === 1) {

        if (nextPageBtn) {
            nextPageBtn.style.display = "inline-flex";
        }

        if (backPageBtn) {
            backPageBtn.style.display = "none";
        }

        if (submitPageBtn) {
            submitPageBtn.style.display = "none";
        }

    }

    else if (currentPage === totalPages) {

        if (nextPageBtn) {
            nextPageBtn.style.display = "none";
        }

        if (backPageBtn) {
            backPageBtn.style.display = "inline-flex";
        }

        if (submitPageBtn) {
            submitPageBtn.style.display = "inline-flex";
        }

    }

    else {

        if (nextPageBtn) {
            nextPageBtn.style.display = "inline-flex";
        }

        if (backPageBtn) {
            backPageBtn.style.display = "inline-flex";
        }

        if (submitPageBtn) {
            submitPageBtn.style.display = "none";
        }
    }
}

// ==========================================
// SINGLE PAGE BUTTONS
// ==========================================

function setupSinglePageButtons() {

    totalPages = 1;
    currentPage = 1;

    updateNavigation();
}

// ==========================================
// NEXT PAGE
// ==========================================

if (nextPageBtn) {

    nextPageBtn.addEventListener(
        "click",
        function () {

            const currentPageElement =
                document.querySelector(
                    `.form-page[data-page="${currentPage}"]`
                );

            if (!validatePage(currentPageElement)) {
                return;
            }

            if (currentPage < totalPages) {

                currentPage++;

                showPage(currentPage);
            }

        }
    );
}

// ==========================================
// BACK PAGE
// ==========================================

if (backPageBtn) {

    backPageBtn.addEventListener(
        "click",
        function () {

            if (currentPage > 1) {

                currentPage--;

                showPage(currentPage);
            }

        }
    );
}

// ==========================================
// SHOW PAGE
// ==========================================

function showPage(pageNumber) {

    document
        .querySelectorAll(".form-page")
        .forEach(page => {

            page.style.display =
                Number(page.dataset.page) === pageNumber
                    ? "block"
                    : "none";

        });

    currentPage = pageNumber;

    updateNavigation();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// VALIDATE PAGE
// ==========================================

function validatePage(pageElement) {

    if (!pageElement) {
        return true;
    }

    const fields =
        pageElement.querySelectorAll(
            "input, textarea, select"
        );

    for (const field of fields) {

        if (field.disabled) {
            continue;
        }

        const parentGroup =
            field.closest(".form-group");

        if (
            parentGroup &&
            parentGroup.style.display === "none"
        ) {
            continue;
        }

        if (!field.checkValidity()) {

            field.reportValidity();

            return false;
        }
    }

    return true;
}

// ==========================================
// CONDITIONAL RULES
// ==========================================

function setupConditionalRules() {

    const rules =
        currentForm.conditional_rules ||
        currentForm.conditionalRules ||
        [];

    console.log(
        "Applying Conditional Rules:",
        rules
    );

    if (
        !Array.isArray(rules) ||
        rules.length === 0
    ) {

        console.log(
            "No conditional rules found."
        );

        return;
    }

    rules.forEach((rule, ruleIndex) => {

        console.log(
            `Conditional Rule ${ruleIndex + 1}:`,
            rule
        );

        const condition =
            rule.if_condition ||
            rule.ifCondition ||
            rule.condition ||
            rule.if;

        if (!condition) {

            console.warn(
                "Condition not found:",
                rule
            );

            return;
        }

        const actions =
            rule.then ||
            rule.actions ||
            rule.then_actions ||
            [];

        if (
            !Array.isArray(actions) ||
            actions.length === 0
        ) {

            console.warn(
                "Actions not found:",
                rule
            );

            return;
        }

        const sourceFieldId =
            getRuleFieldId(condition);

        const sourceField =
            findFieldElement(sourceFieldId);

        if (!sourceField) {

            console.warn(
                "Source field not found:",
                sourceFieldId
            );

            return;
        }

        const sourceInputs =
            sourceField.querySelectorAll(
                "input, select, textarea"
            );

        const applyRules = () => {

            const actualValue =
                getFieldValue(sourceField);

            const matched =
                conditionMatches(
                    actualValue,
                    condition
                );

            console.log(
                "Conditional Result:",
                {
                    field: sourceFieldId,
                    value: actualValue,
                    operator: condition.operator,
                    expected: condition.value,
                    matched: matched
                }
            );

            actions.forEach(action => {

                const targetFieldId =
                    getActionFieldId(action);

                const targetField =
                    findFieldElement(
                        targetFieldId
                    );

                if (!targetField) {

                    console.warn(
                        "Target field not found:",
                        targetFieldId
                    );

                    return;
                }

                applyAction(
                    targetField,
                    action,
                    matched
                );

            });
        };

        sourceInputs.forEach(input => {

            input.addEventListener(
                "change",
                applyRules
            );

            input.addEventListener(
                "input",
                applyRules
            );

        });

        // Apply immediately
        applyRules();

    });
}

// ==========================================
// GET CONDITION FIELD ID
// ==========================================

function getRuleFieldId(condition) {

    return String(
        condition.field ??
        condition.field_id ??
        condition.fieldId ??
        condition.sourceField ??
        condition.source_field ??
        ""
    );
}

// ==========================================
// GET ACTION FIELD ID
// ==========================================

function getActionFieldId(action) {

    return String(
        action.field ??
        action.field_id ??
        action.fieldId ??
        action.targetField ??
        action.target_field ??
        ""
    );
}

// ==========================================
// FIND FIELD ELEMENT
// ==========================================

function findFieldElement(fieldId) {

    if (!fieldId) {
        return null;
    }

    const allGroups =
        document.querySelectorAll(
            ".form-group"
        );

    for (const group of allGroups) {

        if (
            String(group.dataset.fieldId) ===
            String(fieldId)
        ) {

            return group;
        }
    }

    return null;
}

// ==========================================
// GET FIELD VALUE
// ==========================================

function getFieldValue(fieldElement) {

    if (!fieldElement) {
        return "";
    }

    // RADIO

    const radio =
        fieldElement.querySelector(
            "input[type='radio']:checked"
        );

    if (radio) {
        return radio.value;
    }

    // CHECKBOX

    const checkboxes =
        fieldElement.querySelectorAll(
            "input[type='checkbox']:checked"
        );

    if (checkboxes.length > 0) {

        return Array.from(checkboxes)
            .map(checkbox => checkbox.value);
    }

    // DROPDOWN

    const select =
        fieldElement.querySelector("select");

    if (select) {
        return select.value;
    }

    // INPUT / TEXTAREA

    const input =
        fieldElement.querySelector(
            "input:not([type='radio']):not([type='checkbox']), textarea"
        );

    if (input) {
        return input.value;
    }

    return "";
}

// ==========================================
// CHECK CONDITION
// ==========================================

function conditionMatches(
    actualValue,
    condition
) {

    const operator =
        String(
            condition.operator ||
            condition.comparison ||
            "equals"
        )
            .trim()
            .toLowerCase();

    const expected =
        String(
            condition.value ??
            condition.expected ??
            ""
        )
            .trim()
            .toLowerCase();

    // ======================================
    // ARRAY
    // ======================================

    if (Array.isArray(actualValue)) {

        const values =
            actualValue.map(value =>
                String(value)
                    .trim()
                    .toLowerCase()
            );

        if (
            operator === "equals" ||
            operator === "is"
        ) {

            return values.includes(expected);
        }

        if (
            operator === "not_equals" ||
            operator === "not equals" ||
            operator === "is_not"
        ) {

            return !values.includes(expected);
        }

        if (operator === "contains") {

            return values.some(value =>
                value.includes(expected)
            );
        }

        if (operator === "not_contains") {

            return !values.some(value =>
                value.includes(expected)
            );
        }

        return false;
    }

    // ======================================
    // NORMAL VALUE
    // ======================================

    const actual =
        String(actualValue ?? "")
            .trim()
            .toLowerCase();

    if (
        operator === "equals" ||
        operator === "is"
    ) {

        return actual === expected;
    }

    if (
        operator === "not_equals" ||
        operator === "not equals" ||
        operator === "is_not"
    ) {

        return actual !== expected;
    }

    if (operator === "contains") {

        return actual.includes(expected);
    }

    if (operator === "not_contains") {

        return !actual.includes(expected);
    }

    if (
        operator === "greater_than" ||
        operator === "greater than"
    ) {

        return (
            Number(actual) >
            Number(expected)
        );
    }

    if (
        operator === "less_than" ||
        operator === "less than"
    ) {

        return (
            Number(actual) <
            Number(expected)
        );
    }

    if (
        operator === "greater_than_or_equal" ||
        operator === "greater than or equal"
    ) {

        return (
            Number(actual) >=
            Number(expected)
        );
    }

    if (
        operator === "less_than_or_equal" ||
        operator === "less than or equal"
    ) {

        return (
            Number(actual) <=
            Number(expected)
        );
    }

    return false;
}

// ==========================================
// APPLY CONDITIONAL ACTION
// ==========================================

function applyAction(
    targetField,
    action,
    matched
) {

    const actionType =
        String(
            action.action ||
            action.type ||
            ""
        )
            .trim()
            .toLowerCase();

    const controls =
        targetField.querySelectorAll(
            "input, textarea, select"
        );

    // ======================================
    // SHOW
    // ======================================

    if (actionType === "show") {

        targetField.style.display =
            matched ? "" : "none";

        controls.forEach(input => {

            input.dataset.conditionalHidden =
                matched ? "false" : "true";
        });

    }

    // ======================================
    // HIDE
    // ======================================

    else if (actionType === "hide") {

        targetField.style.display =
            matched ? "none" : "";

        controls.forEach(input => {

            input.dataset.conditionalHidden =
                matched ? "true" : "false";
        });

    }

    // ======================================
    // ENABLE
    // ======================================

    else if (actionType === "enable") {

        controls.forEach(input => {

            input.disabled = !matched;
        });

    }

    // ======================================
    // DISABLE
    // ======================================

    else if (actionType === "disable") {

        controls.forEach(input => {

            input.disabled = matched;
        });

    }

    // ======================================
    // CLEAR
    // ======================================

    else if (actionType === "clear") {

        if (matched) {

            clearFieldValue(targetField);
        }
    }

    else {

        console.warn(
            "Unknown conditional action:",
            actionType
        );
    }
}

// ==========================================
// CLEAR FIELD
// ==========================================

function clearFieldValue(fieldElement) {

    const inputs =
        fieldElement.querySelectorAll(
            "input, textarea, select"
        );

    inputs.forEach(input => {

        if (
            input.type === "radio" ||
            input.type === "checkbox"
        ) {

            input.checked = false;

        }
        else {

            input.value = "";
        }

    });
}

// ==========================================
// SUBMIT FORM
// ==========================================

if (publicForm) {

    publicForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();

            const currentPageElement =
                document.querySelector(
                    `.form-page[data-page="${currentPage}"]`
                );

            if (
                !validatePage(
                    currentPageElement
                )
            ) {

                return;
            }

            const responses = [];

            const fields =
                currentForm.fields || [];

            fields.forEach((field, index) => {

                const fieldId =
                    String(
                        field.id ??
                        field.field_id ??
                        field.fieldId ??
                        `field_${index}`
                    );

                const fieldElement =
                    findFieldElement(fieldId);

                if (!fieldElement) {
                    return;
                }

                // Do not submit hidden fields

                if (
                    fieldElement.style.display === "none"
                ) {

                    return;
                }

                const value =
                    getFieldValue(fieldElement);

                responses.push({

                    field_name:
                        field.label,

                    value:
                        Array.isArray(value)
                            ? value.join(", ")
                            : value
                });

            });

            console.log(
                "Submitting responses:",
                responses
            );

            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:8000/forms/${formId}/submit`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    responses:
                                        responses
                                })
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "Submit response:",
                    data
                );

                if (!response.ok) {

                    throw new Error(
                        data.detail
                            ? JSON.stringify(
                                data.detail
                            )
                            : "Submission failed."
                    );
                }

                const successModal =
                    document.getElementById(
                        "successModal"
                    );

                if (successModal) {

                    successModal.style.display =
                        "flex";

                }
                else {

                    alert(
                        "Response submitted successfully!"
                    );
                }

                publicForm.reset();

            }
            catch (error) {

                console.error(
                    "Submit error:",
                    error
                );

                alert(
                    "Unable to submit the response. Please try again."
                );
            }

        }
    );
}

// ==========================================
// CLOSE SUCCESS MODAL
// ==========================================

const closeModal =
    document.getElementById(
        "closeModal"
    );

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function () {

            const modal =
                document.getElementById(
                    "successModal"
                );

            if (modal) {

                modal.style.display =
                    "none";
            }

        }
    );
}

// ==========================================
// LOADER
// ==========================================

function showLoader() {

    if (loader) {

        loader.style.display =
            "flex";
    }
}

function hideLoader() {

    if (loader) {

        loader.style.display =
            "none";
    }
}

// ==========================================
// ERROR MESSAGE
// ==========================================

function showError(message) {

    if (formFields) {

        formFields.innerHTML = `

            <div class="empty-form">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Unable to load form</h3>

                <p>
                    ${escapeHtml(message)}
                </p>

            </div>

        `;
    }
}

// ==========================================
// SAFE HTML
// ==========================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}