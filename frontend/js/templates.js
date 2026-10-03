// ==========================================
// SMART FORM BUILDER
// TEMPLATE SELECTION
// ==========================================

// Get all template buttons
const templateButtons =
    document.querySelectorAll(".use-template-btn");


// ==========================================
// OPEN SELECTED TEMPLATE
// ==========================================

templateButtons.forEach(button => {

    button.addEventListener("click", function () {

        const templateName =
            this.dataset.template;

        console.log(
            "Selected Template:",
            templateName
        );

        if (!templateName) {

            console.error(
                "Template name not found."
            );

            return;

        }

        // Open create form with template name
        window.location.href =
            `create-form.html?template=${templateName}`;

    });

});


// ==========================================
// TEMPLATE SEARCH
// ==========================================

const searchInput =
    document.getElementById("templateSearch");

const templateCards =
    document.querySelectorAll(".template-card");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const searchValue =
                this.value
                    .toLowerCase()
                    .trim();

            templateCards.forEach(card => {

                const name =
                    card.dataset.name
                        ?.toLowerCase() || "";

                const category =
                    card.dataset.category
                        ?.toLowerCase() || "";

                if (
                    name.includes(searchValue) ||
                    category.includes(searchValue)
                ) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";

                }

            });

        }
    );

}


// ==========================================
// CATEGORY FILTER
// ==========================================

const categoryButtons =
    document.querySelectorAll(".category-btn");


categoryButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            // Remove active from all
            categoryButtons.forEach(btn => {

                btn.classList.remove("active");

            });

            // Add active to clicked button
            this.classList.add("active");


            const selectedCategory =
                this.innerText
                    .trim()
                    .toLowerCase();


            templateCards.forEach(card => {

                const cardCategory =
                    card.dataset.category
                        ?.toLowerCase() || "";


                if (
                    selectedCategory === "all" ||
                    cardCategory === selectedCategory
                ) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";

                }

            });

        }
    );

});