// =============================
// Preview Form
// =============================

const formPage1 =
    document.getElementById("formPage1");

const formPage2 =
    document.getElementById("formPage2");

const formContainer =
    document.getElementById("previewForm");

const nextPageBtn =
    document.getElementById("nextPageBtn");

const backPageBtn =
    document.getElementById("backPageBtn");

const submitPageBtn =
    document.getElementById("submitPageBtn");

let currentPage = 1;


// Get form ID from URL
const urlParams =
    new URLSearchParams(window.location.search);

const formId =
    urlParams.get("id");

let fields = [];
let rules = [];


// =============================
// LOAD FORM FROM BACKEND
// =============================

// =============================
// LOAD FORM FROM BACKEND OR LOCALSTORAGE
// =============================

async function loadPreviewForm() {

    if (!formId) {
        console.log("No form ID found in URL. Loading preview from localStorage...");
        document.getElementById("formTitle").innerText =
            localStorage.getItem("previewTitle") || "Untitled Form";

        const savedPreview = localStorage.getItem("previewForm");
        if (savedPreview) {
            try {
                fields = JSON.parse(savedPreview);
            } catch (e) {
                fields = [];
            }
        }

        const savedRules = localStorage.getItem("previewRules");
        if (savedRules) {
            try {
                rules = JSON.parse(savedRules);
            } catch (e) {
                rules = [];
            }
        }

        renderFields();
        applyConditionalRules();
        return;
    }

    try {
        const response = await fetch(
            `http://127.0.0.1:8000/forms/${formId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load form");
        }

        const form = await response.json();
        console.log("Preview Form:", form);

        document.getElementById("formTitle").innerText =
            form.title || "Untitled Form";

        const description = document.getElementById("formDescription");
        if (description) {
            description.innerText =
                form.description || "Please fill all required fields.";
        }

        fields = Array.isArray(form.fields) ? form.fields : [];
        rules = form.conditional_rules || form.conditionalRules || [];

        renderFields();
        applyConditionalRules();

    } catch (error) {
        console.error("Preview loading error:", error);
        formPage1.innerHTML = `
            <h3 style="text-align:center; color:#ef4444; padding:30px;">
                Unable to load form
            </h3>
        `;
    }
}


// =============================
// RENDER FIELDS
// =============================
// ==========================================
// CREATE PREVIEW FIELD WRAPPER
// ==========================================

function createFieldWrapper(field) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "preview-field";

    wrapper.dataset.id =
        field.id;


    // ======================================
    // FIELD LABEL
    // ======================================

    const label =
        document.createElement("label");

    label.textContent =
        field.label || "Untitled Field";


    if (field.required) {

        const requiredMark =
            document.createElement("span");

        requiredMark.textContent = " *";

        label.appendChild(
            requiredMark
        );

    }

    wrapper.appendChild(label);


    let input;


    // ======================================
    // TEXTAREA
    // ======================================

    if (field.type === "textarea") {

        input =
            document.createElement("textarea");

        input.placeholder =
            field.placeholder || "";

    }


    // ======================================
    // DROPDOWN
    // ======================================

    else if (
        field.type === "dropdown" ||
        field.type === "select"
    ) {

        input =
            document.createElement("select");


        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Select an option";

        input.appendChild(defaultOption);


        (field.options || []).forEach(
            option => {

                const optionElement =
                    document.createElement("option");

                optionElement.value =
                    option;

                optionElement.textContent =
                    option;

                input.appendChild(
                    optionElement
                );

            }
        );

    }


    // ======================================
    // RADIO BUTTONS
    // ======================================

    else if (field.type === "radio") {

        const radioGroup =
            document.createElement("div");

        radioGroup.className =
            "radio-group";


        (field.options || []).forEach(
            (option, index) => {

                const optionLabel =
                    document.createElement("label");

                optionLabel.className =
                    "radio-option";


                const radio =
                    document.createElement("input");

                radio.type = "radio";

                radio.name =
                    "field_" + field.id;

                radio.value =
                    option;


                const optionText =
                    document.createElement("span");

                optionText.textContent =
                    option;


                optionLabel.appendChild(radio);

                optionLabel.appendChild(
                    optionText
                );

                radioGroup.appendChild(
                    optionLabel
                );

            }
        );


        wrapper.appendChild(
            radioGroup
        );


        return wrapper;

    }


    // ======================================
    // CHECKBOXES
    // ======================================

    else if (field.type === "checkbox") {

        const checkboxGroup =
            document.createElement("div");

        checkboxGroup.className =
            "checkbox-group";


        (field.options || []).forEach(
            option => {

                const optionLabel =
                    document.createElement("label");

                optionLabel.className =
                    "checkbox-option";


                const checkbox =
                    document.createElement("input");

                checkbox.type =
                    "checkbox";

                checkbox.value =
                    option;


                const optionText =
                    document.createElement("span");

                optionText.textContent =
                    option;


                optionLabel.appendChild(
                    checkbox
                );

                optionLabel.appendChild(
                    optionText
                );

                checkboxGroup.appendChild(
                    optionLabel
                );

            }
        );


        wrapper.appendChild(
            checkboxGroup
        );


        return wrapper;

    }


    // ======================================
    // NORMAL INPUT FIELDS
    // ======================================

    else {

        input =
            document.createElement("input");

        input.type =
            field.type || "text";

        input.placeholder =
            field.placeholder || "";

    }


    // ======================================
    // COMMON SETTINGS
    // ======================================

    if (field.required) {

        input.required = true;

    }


    if (field.readonly) {

        input.readOnly = true;

    }


    wrapper.appendChild(input);

    return wrapper;

}
// ==========================================
// RENDER FIELDS MULTI-PAGE SYSTEM
// ==========================================
function renderFields() {
    formPage1.innerHTML = "";
    formPage2.innerHTML = "";

    if (!fields || fields.length === 0) {
        formPage1.innerHTML = `<h3 style="text-align:center; color:#94a3b8; padding:30px;">No Fields Found in Form</h3>`;
        nextPageBtn.style.display = "none";
        backPageBtn.style.display = "none";
        submitPageBtn.style.display = "none";
        return;
    }

    // Determine highest page number
    let maxPage = 1;
    fields.forEach(f => {
        const p = parseInt(f.page || 1);
        if (p > maxPage) maxPage = p;
    });

    // Append fields to their respective page containers (Page 1 vs Page 2)
    fields.forEach(field => {

    console.log(
        "FIELD PAGE DATA:",
        field.label,
        field.page,
        field.pageNumber,
        field.pageIndex
    );

    const fieldPage = parseInt(
        field.page ??
        field.pageNumber ??
        field.pageIndex ??
        1
    );

    const wrapper =
        createFieldWrapper(field);

    if (fieldPage === 2) {

        formPage2.appendChild(wrapper);

    } else {

        formPage1.appendChild(wrapper);

    }

});

    // Configure Navigation & Submit Buttons
    const hasPage2 = formPage2.children.length > 0;

    if (!hasPage2 && maxPage === 1) {
        // SINGLE PAGE FORM: Show Submit button directly on Page 1
        formPage1.style.display = "block";
        formPage2.style.display = "none";

        nextPageBtn.style.display = "none";
        backPageBtn.style.display = "none";
        submitPageBtn.style.display = "inline-flex";
    } else {
        // MULTI-PAGE FORM: Page 1 shows Next button
        formPage1.style.display = "block";
        formPage2.style.display = "none";

        nextPageBtn.style.display = "inline-flex";
        backPageBtn.style.display = "none";
        submitPageBtn.style.display = "none";
    }
}
// =============================
// BUILD PAGE 2 FOOD DETAILS
// =============================

function buildFoodDetailsPage() {

    // Clear previous Page 2 content
    formPage2.innerHTML = "";

    // Find Food Category field
    const categoryField =
        fields.find(
            field =>
                field.label.trim().toLowerCase() ===
                "food category"
        );

    // Find Food Item field
    const foodItemField =
        fields.find(
            field =>
                field.label.trim().toLowerCase() ===
                "food item"
        );

    if (!categoryField || !foodItemField) {

        console.log(
            "Food Category or Food Item field not found."
        );

        return;
    }


    // =============================
    // GET FOOD CATEGORY
    // =============================

    const categoryWrapper =
        formPage1.querySelector(
            `.preview-field[data-id="${categoryField.id}"]`
        );

    let selectedCategory = "";

    if (categoryWrapper) {

        const selectedRadio =
            categoryWrapper.querySelector(
                "input[type='radio']:checked"
            );

        if (selectedRadio) {

            selectedCategory =
                selectedRadio.value.trim();

        }

    }


    // =============================
    // GET SELECTED FOOD ITEMS
    // =============================

    const foodItemWrapper =
        formPage1.querySelector(
            `.preview-field[data-id="${foodItemField.id}"]`
        );

    const selectedItems = [];

    if (foodItemWrapper) {

        const checkedItems =
            foodItemWrapper.querySelectorAll(
                "input[type='checkbox']:checked"
            );

        checkedItems.forEach(checkbox => {

            selectedItems.push(
                checkbox.value.trim()
            );

        });

    }


    console.log(
        "Selected Category:",
        selectedCategory
    );

    console.log(
        "Selected Food Items:",
        selectedItems
    );


    // =============================
    // CREATE PAGE 2 HEADER
    // =============================

    const pageTitle =
        document.createElement("h2");

    pageTitle.innerText =
        "Customize Your Order";

    pageTitle.className =
        "food-details-title";

    formPage2.appendChild(pageTitle);


    const pageDescription =
        document.createElement("p");

    pageDescription.innerText =
        "Customize the items you selected.";

    pageDescription.className =
        "food-details-description";

    formPage2.appendChild(pageDescription);


    // =============================
    // NO FOOD ITEM SELECTED
    // =============================

    if (selectedItems.length === 0) {

        const message =
            document.createElement("div");

        message.innerText =
            "Please select at least one food item.";

        message.className =
            "food-empty-message";

        formPage2.appendChild(message);

        return;
    }


    // =============================
    // CREATE DETAILS FOR EACH ITEM
    // =============================

    selectedItems.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "food-detail-card";


        // =============================
        // ITEM TITLE
        // =============================

        const title =
            document.createElement("h3");

        title.innerText =
            `${selectedCategory} ${item}`;

        card.appendChild(title);


        // =============================
        // PIZZA DETAILS
        // =============================

        if (
            item.toLowerCase() ===
            "pizza"
        ) {

            createSelectField(
                card,
                "Pizza Size",
                [
                    "Small",
                    "Medium",
                    "Large"
                ]
            );

            createSelectField(
                card,
                "Crust",
                [
                    "Thin Crust",
                    "Regular Crust",
                    "Cheese Burst"
                ]
            );

            createInputField(
                card,
                "Extra Toppings",
                "Enter toppings if required"
            );

        }


        // =============================
        // BURGER DETAILS
        // =============================

        else if (
            item.toLowerCase() ===
            "burger"
        ) {

            createSelectField(
                card,
                "Burger Size",
                [
                    "Regular",
                    "Large"
                ]
            );

            createSelectField(
                card,
                "Cheese",
                [
                    "No Cheese",
                    "Cheese",
                    "Extra Cheese"
                ]
            );

            createInputField(
                card,
                "Special Requirements",
                "Enter your requirements"
            );

        }


        // =============================
        // BIRYANI DETAILS
        // =============================

        else if (
            item.toLowerCase() ===
            "biryani"
        ) {

            createSelectField(
                card,
                "Biryani Type",
                selectedCategory.toLowerCase() === "veg"
                    ? [
                        "Veg Biryani",
                        "Paneer Biryani"
                    ]
                    : [
                        "Chicken Biryani",
                        "Mutton Biryani"
                    ]
            );

            createSelectField(
                card,
                "Spice Level",
                [
                    "Mild",
                    "Medium",
                    "Spicy"
                ]
            );

        }


        // =============================
        // PASTA DETAILS
        // =============================

        else if (
            item.toLowerCase() ===
            "pasta"
        ) {

            createSelectField(
                card,
                "Pasta Type",
                [
                    "Penne",
                    "Fusilli",
                    "Spaghetti"
                ]
            );

            createSelectField(
                card,
                "Sauce",
                selectedCategory.toLowerCase() === "veg"
                    ? [
                        "Tomato",
                        "White Sauce",
                        "Pesto"
                    ]
                    : [
                        "Chicken Alfredo",
                        "Chicken Tomato"
                    ]
            );

        }


        formPage2.appendChild(card);

    });

}


// =============================
// CREATE SELECT FIELD
// =============================

function createSelectField(
    container,
    labelText,
    options
) {

    const group =
        document.createElement("div");

    group.className =
        "food-detail-field";


    const label =
        document.createElement("label");

    label.innerText =
        labelText;

    group.appendChild(label);


    const select =
        document.createElement("select");


    options.forEach(option => {

        const optionElement =
            document.createElement("option");

        optionElement.value =
            option;

        optionElement.innerText =
            option;

        select.appendChild(
            optionElement
        );

    });


    group.appendChild(select);

    container.appendChild(group);

}


// =============================
// CREATE INPUT FIELD
// =============================

function createInputField(
    container,
    labelText,
    placeholderText
) {

    const group =
        document.createElement("div");

    group.className =
        "food-detail-field";


    const label =
        document.createElement("label");

    label.innerText =
        labelText;

    group.appendChild(label);


    const input =
        document.createElement("input");

    input.type =
        "text";

    input.placeholder =
        placeholderText;


    group.appendChild(input);

    container.appendChild(group);

}

// =============================
// MULTI PAGE NAVIGATION
// =============================

nextPageBtn.addEventListener(
    "click",
    function () {

        const requiredFields =
            formPage1.querySelectorAll("[required]");

        for (const field of requiredFields) {

            if (!field.checkValidity()) {

                field.reportValidity();

                return;
            }
        }

        // Page 2 fields are already rendered by renderFields()

        formPage1.style.display = "none";

        formPage2.style.display = "block";

        nextPageBtn.style.display = "none";

        backPageBtn.style.display = "inline-block";

        submitPageBtn.style.display = "inline-block";

        currentPage = 2;
    }
);


backPageBtn.addEventListener(
    "click",
    function () {

        // Hide Page 2
        formPage2.style.display =
            "none";


        // Show Page 1
        formPage1.style.display =
            "block";


        // Update buttons
        backPageBtn.style.display =
            "none";


        nextPageBtn.style.display =
            "inline-block";


        submitPageBtn.style.display =
            "none";


        currentPage = 1;

    }
);


// =============================
// BACK BUTTON
// =============================

document
    .getElementById("backBtn")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "myforms.html";

        }
    );


// =============================
// PUBLISH
// =============================

document
    .getElementById("publishBtn")
    .addEventListener(
        "click",
        () => {

            alert(
                "Publish feature will be connected to PostgreSQL."
            );

        }
    );


// =============================
// SUBMIT FORM RESPONSE
// =============================

formContainer.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        // Get all fields inside the preview
        const previewFields =
            document.querySelectorAll(
                ".preview-field"
            );


        const responses = [];


        previewFields.forEach(field => {

            const fieldId =
                field.dataset.id;


            const label =
                field.querySelector(
                    "label"
                )?.innerText || "";


            const input =
                field.querySelector(
                    "input:not([type='radio']):not([type='checkbox']), textarea, select"
                );


            // Normal input / textarea / dropdown
            if (input) {

                responses.push({

                    field_name:
                        label,

                    value:
                        input.value

                });

            }


            // Radio
            const radio =
                field.querySelector(
                    "input[type='radio']:checked"
                );


            if (radio) {

                responses.push({

                    field_name:
                        label,

                    value:
                        radio.parentElement
                            .innerText
                            .trim()

                });

            }


            // Checkbox
            const checkboxes =
                field.querySelectorAll(
                    "input[type='checkbox']:checked"
                );


            if (
                checkboxes.length > 0
            ) {

                const values = [];


                checkboxes.forEach(
                    checkbox => {

                        values.push(

                            checkbox
                                .parentElement
                                .innerText
                                .trim()

                        );

                    }
                );


                responses.push({

                    field_name:
                        label,

                    value:
                        values.join(", ")

                });

            }

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

                        method:
                            "POST",

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

                console.error(
                    "Submit failed:",
                    data
                );


                alert(

                    data.detail
                        ? JSON.stringify(
                            data.detail,
                            null,
                            2
                        )
                        : "Failed to submit form."

                );


                return;
            }


            alert(
                "Form submitted successfully!"
            );

        }

        catch (error) {

            console.error(
                "Submit error:",
                error
            );


            alert(
                "Unable to submit form. Please check the backend."
            );

        }

    }
);


// ==========================================
// CONDITIONAL RULES
// ==========================================

function applyConditionalRules() {

    console.log(
        "Applying Conditional Rules:",
        rules
    );


    if (
        !rules ||
        rules.length === 0
    ) {

        console.log(
            "No conditional rules found."
        );

        return;
    }


    rules.forEach(rule => {

        // ======================================
        // VALIDATE RULE
        // ======================================

        if (
            !rule.if_condition ||
            !rule.then ||
            rule.then.length === 0
        ) {

            console.log(
                "Invalid rule:",
                rule
            );

            return;
        }


        const condition =
            rule.if_condition;


        // A rule can have multiple actions
        rule.then.forEach(
            actionData => {

                // ======================================
                // FIND SOURCE FIELD
                // ======================================

                const sourceField =
                    document.querySelector(
                        `.preview-field[data-id="${condition.field}"]`
                    );


                // ======================================
                // FIND TARGET FIELD
                // ======================================

                const targetField =
                    document.querySelector(
                        `.preview-field[data-id="${actionData.field}"]`
                    );


                console.log(
                    "Source:",
                    condition.field,
                    sourceField
                );


                console.log(
                    "Target:",
                    actionData.field,
                    targetField
                );


                if (!sourceField) {

                    console.log(
                        "Source field not found:",
                        condition.field
                    );

                    return;
                }


                if (!targetField) {

                    console.log(
                        "Target field not found:",
                        actionData.field
                    );

                    return;
                }


                // ======================================
                // GET SOURCE VALUE
                // ======================================

                function getFieldValue() {

                    // RADIO
                    const checkedRadio =
                        sourceField.querySelector(
                            "input[type='radio']:checked"
                        );


                    if (checkedRadio) {

                        return checkedRadio.value;

                    }


                    // CHECKBOX
                    const checkedCheckboxes =
                        sourceField.querySelectorAll(
                            "input[type='checkbox']:checked"
                        );


                    if (
                        checkedCheckboxes.length > 0
                    ) {

                        return Array.from(
                            checkedCheckboxes
                        ).map(
                            checkbox =>
                                checkbox.value ||
                                checkbox
                                    .parentElement
                                    .querySelector(
                                        "span"
                                    )
                                    ?.innerText ||
                                ""
                        );

                    }


                    // DROPDOWN
                    const select =
                        sourceField.querySelector(
                            "select"
                        );


                    if (select) {

                        return select.value;

                    }


                    // TEXT / NUMBER / EMAIL / etc.
                    const input =
                        sourceField.querySelector(
                            "input:not([type='radio']):not([type='checkbox']), textarea"
                        );


                    if (input) {

                        return input.value;

                    }


                    return "";

                }


                // ======================================
                // CHECK CONDITION
                // ======================================

                function conditionMatches() {

                    const actualValue =
                        getFieldValue();


                    const expectedValue =
                        String(
                            condition.value ?? ""
                        ).trim();


                    const operator =
                        condition.operator ||
                        "equals";


                    console.log(
                        "CONDITION CHECK:",
                        {
                            actualValue,
                            operator,
                            expectedValue
                        }
                    );


                    // ==================================
                    // ARRAY / CHECKBOX
                    // ==================================

                    if (
                        Array.isArray(
                            actualValue
                        )
                    ) {

                        if (
                            operator ===
                            "equals"
                        ) {

                            return actualValue.some(
                                value =>
                                    String(value)
                                        .trim()
                                        .toLowerCase() ===
                                    expectedValue
                                        .toLowerCase()
                            );

                        }


                        if (
                            operator ===
                            "not_equals"
                        ) {

                            return !actualValue.some(
                                value =>
                                    String(value)
                                        .trim()
                                        .toLowerCase() ===
                                    expectedValue
                                        .toLowerCase()
                            );

                        }


                        if (
                            operator ===
                            "contains"
                        ) {

                            return actualValue.some(
                                value =>
                                    String(value)
                                        .toLowerCase()
                                        .includes(
                                            expectedValue
                                                .toLowerCase()
                                        )
                            );

                        }

                    }


                    // ==================================
                    // NORMAL VALUE
                    // ==================================

                    const actual =
                        String(
                            actualValue ?? ""
                        )
                            .trim()
                            .toLowerCase();


                    const expected =
                        expectedValue
                            .toLowerCase();


                    // ==================================
                    // EQUALS
                    // ==================================

                    if (
                        operator ===
                        "equals"
                    ) {

                        return (
                            actual ===
                            expected
                        );

                    }


                    // ==================================
                    // NOT EQUALS
                    // ==================================

                    if (
                        operator ===
                        "not_equals"
                    ) {

                        return (
                            actual !==
                            expected
                        );

                    }


                    // ==================================
                    // CONTAINS
                    // ==================================

                    if (
                        operator ===
                        "contains"
                    ) {

                        return actual.includes(
                            expected
                        );

                    }


                    // ==================================
                    // GREATER THAN
                    // ==================================

                    if (
                        operator ===
                        "greater_than"
                    ) {

                        return (
                            Number(actual) >
                            Number(expected)
                        );

                    }


                    // ==================================
                    // LESS THAN
                    // ==================================

                    if (
                        operator ===
                        "less_than"
                    ) {

                        return (
                            Number(actual) <
                            Number(expected)
                        );

                    }


                    return false;

                }


                // ======================================
                // APPLY ACTION
                // ======================================

                function applyRule() {

                    const matched =
                        conditionMatches();


                    console.log(
                        "RULE RESULT:",
                        {
                            action:
                                actionData.action,

                            matched:
                                matched,

                            target:
                                targetField.dataset.id
                        }
                    );


                    // ==================================
                    // SHOW
                    // ==================================

                    if (
                        actionData.action ===
                        "show"
                    ) {

                        targetField.style.display =
                            matched
                                ? ""
                                : "none";

                    }


                    // ==================================
                    // HIDE
                    // ==================================

                    else if (
                        actionData.action ===
                        "hide"
                    ) {

                        targetField.style.display =
                            matched
                                ? "none"
                                : "";

                    }


                    // ==================================
                    // ENABLE
                    // ==================================

                    else if (
                        actionData.action ===
                        "enable"
                    ) {

                        targetField
                            .querySelectorAll(
                                "input, textarea, select"
                            )
                            .forEach(
                                input => {

                                    input.disabled =
                                        !matched;

                                }
                            );

                    }


                    // ==================================
                    // DISABLE
                    // ==================================

                    else if (
                        actionData.action ===
                        "disable"
                    ) {

                        targetField
                            .querySelectorAll(
                                "input, textarea, select"
                            )
                            .forEach(
                                input => {

                                    input.disabled =
                                        matched;

                                }
                            );

                    }

                }


                // ======================================
                // APPLY WHEN PAGE LOADS
                // ======================================

                applyRule();


                // ======================================
                // LISTEN FOR RADIO / DROPDOWN CHANGES
                // ======================================

                const inputs =
                    sourceField.querySelectorAll(
                        "input, select, textarea"
                    );


                inputs.forEach(
                    input => {

                        input.addEventListener(
                            "change",
                            function () {

                                console.log(
                                    "Conditional field changed:",
                                    input.value
                                );

                                applyRule();

                            }
                        );


                        input.addEventListener(
                            "input",
                            function () {

                                applyRule();

                            }
                        );

                    }
                );

            }
        );

    });

}


// =============================
// LOAD PREVIEW
// =============================

loadPreviewForm();