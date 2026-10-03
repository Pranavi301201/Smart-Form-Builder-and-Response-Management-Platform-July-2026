// =========================================================
// GOOGLE AUTH CONFIGURATION
// =========================================================

const GOOGLE_CLIENT_ID =
    "245640416146-uvnosr1m7sm9g2etg4ubba9rhojlbti4.apps.googleusercontent.com";

    // =========================================================
// GOOGLE SIGN-IN
// =========================================================

let googleInitialized = false;


function initializeGoogleSignIn() {

    if (googleInitialized) {
        return;
    }


    if (
        !window.google ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.warn(
            "Google Identity Services is still loading..."
        );

        return;
    }


    google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleCredentialResponse,

        auto_select: false

    });


    googleInitialized = true;

}


// =========================================================
// CONTINUE WITH GOOGLE BUTTON
// =========================================================

function signInWithGoogle() {

    initializeGoogleSignIn();


    if (!googleInitialized) {

        alert(
            "Google Sign-In is still loading. Please try again."
        );

        return;

    }


    google.accounts.id.prompt();

}


// =========================================================
// GOOGLE RESPONSE
// =========================================================

async function handleGoogleCredentialResponse(response) {

    if (!response || !response.credential) {

        console.error("Google Sign-In failed: No credential received.");

        return;

    }


    const registerModal =
        document.getElementById("registerModal");

    const loginModal =
        document.getElementById("loginModal");


    // Check where Google Sign-In was clicked

    const isRegistering =
        registerModal &&
        registerModal.classList.contains("show");


    const isLoggingIn =
        loginModal &&
        loginModal.classList.contains("show");


    const message =
        isRegistering
            ? document.getElementById("message")
            : document.getElementById("loginMessage");


    try {

        if (message) {

            message.innerHTML =
                isRegistering
                    ? "Creating your account with Google..."
                    : "Signing in with Google...";

            message.style.color = "#71879b";

        }


        // Tell backend what the user is trying to do:
        // register or login

        const action =
            isRegistering
                ? "register"
                : "login";


        const backendResponse =
            await fetch(
                "http://127.0.0.1:8000/auth/google",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        credential:
                            response.credential,

                        action: action

                    })

                }
            );


        const data =
            await backendResponse.json();


        // =========================================
        // GOOGLE AUTHENTICATION FAILED
        // =========================================

        if (!backendResponse.ok) {

            const errorMessage =
                data.detail ||
                "Google authentication failed";


            if (message) {

                message.innerHTML =
                    "❌ " + errorMessage;

                message.style.color =
                    "#e5484d";

            }


            // If user already has an account,
            // automatically move them to Login

            if (
                isRegistering &&
                backendResponse.status === 409
            ) {

                setTimeout(function () {

                    closeRegister();

                    openLogin();

                    const loginMessage =
                        document.getElementById(
                            "loginMessage"
                        );

                    if (loginMessage) {

                        loginMessage.innerHTML =
                            "You already have an account. Please login.";

                        loginMessage.style.color =
                            "#e58b1d";

                    }

                }, 1200);

            }


            return;

        }


        // Save user information

        if (data.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

        }


        // =========================================
        // GOOGLE REGISTER SUCCESS
        // =========================================

        if (isRegistering) {

            message.innerHTML =
                "✓ Account created successfully! Please login.";

            message.style.color =
                "#16a878";


            // IMPORTANT:
            // Do NOT go to dashboard after registration.
            // Open Login modal instead.

            setTimeout(function () {

                closeRegister();

                openLogin();

                const loginMessage =
                    document.getElementById(
                        "loginMessage"
                    );

                if (loginMessage) {

                    loginMessage.innerHTML =
                        "✓ Account created successfully. Continue with Google to login.";

                    loginMessage.style.color =
                        "#16a878";

                }

            }, 1200);


            return;

        }


        // =========================================
        // GOOGLE LOGIN SUCCESS
        // =========================================

        if (isLoggingIn) {

            message.innerHTML =
                "✓ Login successful!";

            message.style.color =
                "#16a878";


            setTimeout(function () {

                closeLogin();

                window.location.href =
                    "home.html";

            }, 800);

        }


    } catch (error) {

        console.error(
            "Google authentication error:",
            error
        );


        if (message) {

            message.innerHTML =
                "❌ Cannot connect to server";

            message.style.color =
                "#e5484d";

        }

    }

}
// =========================================================
// SMART FORMS - PREMIUM HOME PAGE JAVASCRIPT
// =========================================================


// =========================================================
// DOM READY
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    initializeNavbar();
    initializeMobileMenu();
    initializeNavigationHighlight();
    initializeScrollReveal();
    initializePasswordValidation();
    initializeSmoothScroll();
    initializeTemplateCards();
    initializeMagneticButtons();
    initializeDashboardPreview();
    initializeModalClose();
    initializeCounterAnimation();
    initializeGoogleSignIn();

    // Check if user is logged in
    checkAuthStatus();

    console.log("🚀 Smart Forms Premium Home Loaded");

});


// =========================================================
// NAVBAR SCROLL EFFECT
// =========================================================

function initializeNavbar() {

    const navbar = document.getElementById("navbar");

    if (!navbar) return;


    function handleNavbar() {

        if (window.scrollY > 30) {

            navbar.classList.add("scrolled");

        } else {

            navbar.classList.remove("scrolled");

        }

    }


    window.addEventListener("scroll", handleNavbar);

    handleNavbar();

}


// =========================================================
// MOBILE MENU
// =========================================================

function initializeMobileMenu() {

    const menuButton =
        document.getElementById("mobileMenuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");


    if (!menuButton || !mobileMenu) return;


    menuButton.addEventListener("click", () => {

        mobileMenu.classList.toggle("open");


        const icon =
            menuButton.querySelector("i");


        if (mobileMenu.classList.contains("open")) {

            icon.classList.remove("fa-bars");

            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");

            icon.classList.add("fa-bars");

        }

    });


    mobileMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener("click", () => {

                mobileMenu.classList.remove("open");


                const icon =
                    menuButton.querySelector("i");


                icon.classList.remove("fa-xmark");

                icon.classList.add("fa-bars");

            });

        });

}


// =========================================================
// ACTIVE NAVIGATION
// =========================================================

function initializeNavigationHighlight() {

    const sections =
        document.querySelectorAll("section[id]");

    const navLinks =
        document.querySelectorAll(".nav-link");


    function updateActiveLink() {

        let currentSection = "home";


        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 180;

            const sectionHeight =
                section.offsetHeight;


            if (
                window.scrollY >= sectionTop &&
                window.scrollY <
                sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navLinks.forEach(link => {

            link.classList.remove("active");


            if (
                link.getAttribute("href") ===
                "#" + currentSection
            ) {

                link.classList.add("active");

            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveLink
    );


    updateActiveLink();

}


// =========================================================
// PREMIUM SCROLL REVEAL
// =========================================================

function initializeScrollReveal() {

    const elements =
        document.querySelectorAll(
            ".feature-card, " +
            ".template-card, " +
            ".work-step, " +
            ".section-heading, " +
            ".trust-features > div"
        );


    if (!("IntersectionObserver" in window)) {

        elements.forEach(element => {

            element.classList.add("visible");

        });

        return;

    }


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target
                            .classList.add("visible");

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.12
            }

        );


    elements.forEach(
        (element, index) => {

            element.style.transitionDelay =
                (index % 5) * 0.08 + "s";

            observer.observe(element);

        }

    );

}


// =========================================================
// PASSWORD VALIDATION
// =========================================================

function initializePasswordValidation() {

    const confirmPassword =
        document.getElementById("confirmPassword");

    const password =
        document.getElementById("password");

    const message =
        document.getElementById("message");


    if (
        !confirmPassword ||
        !password ||
        !message
    ) return;


    confirmPassword.addEventListener(
        "input",
        () => {

            if (confirmPassword.value === "") {

                message.textContent = "";

                return;

            }


            if (
                password.value !==
                confirmPassword.value
            ) {

                message.textContent =
                    "❌ Passwords do not match";

                message.style.color =
                    "#ef4444";

            } else {

                message.textContent =
                    "✓ Passwords match";

                message.style.color =
                    "#10b981";

            }

        }

    );

}


// =========================================================
// OPEN REGISTER MODAL
// =========================================================

function openRegister() {

    const modal =
        document.getElementById("registerModal");

    if (!modal) return;


    modal.classList.add("show");

    document.body.style.overflow = "hidden";


    setTimeout(() => {

        const nameInput =
            document.getElementById("name");

        if (nameInput) {

            nameInput.focus();

        }

    }, 250);

}


// =========================================================
// CLOSE REGISTER MODAL
// =========================================================

function closeRegister() {

    const modal =
        document.getElementById("registerModal");

    if (!modal) return;


    modal.classList.remove("show");

    document.body.style.overflow = "";

}


// =========================================================
// OPEN LOGIN MODAL
// =========================================================

function openLogin() {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("user");

    if (token) {
        // User is already logged in, do not open login modal
        return;
    }

    const modal = document.getElementById("loginModal");
    if (!modal) return;

    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
        const emailInput = document.getElementById("loginEmail");
        if (emailInput) {
            emailInput.focus();
        }
    }, 250);
}

// =========================================================
// CLOSE LOGIN MODAL
// =========================================================

function closeLogin() {

    const modal =
        document.getElementById("loginModal");

    if (!modal) return;


    modal.classList.remove("show");

    document.body.style.overflow = "";

}


// =========================================================
// SWITCH REGISTER TO LOGIN
// =========================================================

function switchToLogin() {

    closeRegister();


    setTimeout(() => {

        openLogin();

    }, 180);

}


// =========================================================
// SWITCH LOGIN TO REGISTER
// =========================================================

function switchToRegister() {

    closeLogin();


    setTimeout(() => {

        openRegister();

    }, 180);

}


// =========================================================
// MODAL CLOSE EVENTS
// =========================================================

function initializeModalClose() {

    const modals =
        document.querySelectorAll(".modal");


    modals.forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal ||
                    event.target.classList.contains(
                        "modal-overlay"
                    )
                ) {

                    modal.classList.remove("show");

                    document.body.style.overflow = "";

                }

            }
        );

    });


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeRegister();

                closeLogin();

            }

        }
    );

}


// =========================================================
// REGISTER API
// =========================================================

async function register() {

    const name =
        document.getElementById("name")
            .value
            .trim();

    const email =
        document.getElementById("email")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;

    const confirmPassword =
        document.getElementById("confirmPassword")
            .value;

    const role =
        document.getElementById("role")
            .value;

    const message =
        document.getElementById("message");


    message.textContent = "";


    if (
        !name ||
        !email ||
        !password ||
        !confirmPassword
    ) {

        showMessage(
            message,
            "⚠ Please fill all fields",
            "#ef4444"
        );

        return;

    }


    if (password !== confirmPassword) {

        showMessage(
            message,
            "❌ Passwords do not match",
            "#ef4444"
        );

        return;

    }


    if (password.length < 6) {

        showMessage(
            message,
            "⚠ Password must be at least 6 characters",
            "#ef4444"
        );

        return;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        showMessage(
            message,
            "⚠ Please enter a valid email address",
            "#ef4444"
        );

        return;

    }


    try {

        showMessage(
            message,
            "Creating your account...",
            "#64748b"
        );


        const response =
            await fetch(
                "http://127.0.0.1:8000/auth/register",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password,

                        role: role

                    })

                }
            );


        const data =
            await response.json();


        if (response.ok) {

            showMessage(
                message,
                "✓ Registration successful!",
                "#10b981"
            );


            setTimeout(() => {

                closeRegister();


                document.getElementById("name").value =
                    "";

                document.getElementById("email").value =
                    "";

                document.getElementById("password").value =
                    "";

                document.getElementById(
                    "confirmPassword"
                ).value = "";


                openLogin();

            }, 1000);

        } else {

            showMessage(
                message,
                data.detail ||
                "Registration failed",
                "#ef4444"
            );

        }

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        showMessage(
            message,
            "❌ Cannot connect to server",
            "#ef4444"
        );

    }

}


// =========================================================
// LOGIN API
// =========================================================

async function login() {

    const email =
        document.getElementById("loginEmail")
            .value
            .trim();

    const password =
        document.getElementById("loginPassword")
            .value;

    const message =
        document.getElementById("loginMessage");


    message.textContent = "";


    if (!email || !password) {

        showMessage(
            message,
            "⚠ Please enter email and password",
            "#ef4444"
        );

        return;

    }


    try {

        showMessage(
            message,
            "Signing you in...",
            "#64748b"
        );


        const response =
            await fetch(
                "http://127.0.0.1:8000/auth/login",
                {

                    method: "POST",
                    

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        email: email,

                        password: password

                    })

                }
            );


        const data =
            await response.json();


                if (response.ok) {

            showMessage(
                message,
                "✓ Login successful!",
                "#10b981"
            );


            if (data.access_token) {
                localStorage.setItem("access_token", data.access_token);
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            // Immediately update header profile UI
            checkAuthStatus();


            setTimeout(() => {
                closeLogin();
                window.location.href = "home.html";
            }, 700);

        } else {

            showMessage(
                message,
                data.detail ||
                "Invalid email or password",
                "#ef4444"
            );

        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showMessage(
            message,
            "❌ Cannot connect to server",
            "#ef4444"
        );

    }

}


// =========================================================
// MESSAGE HELPER
// =========================================================

function showMessage(
    element,
    text,
    color
) {

    if (!element) return;

    element.textContent = text;

    element.style.color = color;

}


// =========================================================
// SMOOTH SCROLL
// =========================================================

function initializeSmoothScroll() {

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                function (event) {

                    const targetId =
                        this.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) return;


                    event.preventDefault();


                    const navbar =
                        document.getElementById(
                            "navbar"
                        );


                    const navbarHeight =
                        navbar ?
                        navbar.offsetHeight :
                        80;


                    const position =
                        target
                            .getBoundingClientRect()
                            .top +
                        window.scrollY -
                        navbarHeight;


                    window.scrollTo({

                        top: position,

                        behavior: "smooth"

                    });

                }
            );

        });

}


// =========================================================
// TEMPLATE CARD INTERACTION
// =========================================================

function initializeTemplateCards() {

    const cards =
        document.querySelectorAll(
            ".template-card"
        );


    cards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                // If user is not logged in,
                // open registration

                openRegister();

            }
        );

    });

}


// =========================================================
// MAGNETIC BUTTON EFFECT
// =========================================================

function initializeMagneticButtons() {

    const buttons =
        document.querySelectorAll(

            ".hero-primary, " +
            ".register-btn, " +
            ".cta-button"

        );


    buttons.forEach(button => {

        button.addEventListener(
            "mousemove",
            event => {

                if (
                    window.innerWidth < 768
                ) return;


                const rect =
                    button.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left -
                    rect.width / 2;


                const y =
                    event.clientY -
                    rect.top -
                    rect.height / 2;


                button.style.transform =
                    `translate(${x * 0.08}px,
                               ${y * 0.08}px)`;

            }
        );


        button.addEventListener(
            "mouseleave",
            () => {

                button.style.transform = "";

            }
        );

    });

}


// =========================================================
// DASHBOARD PREVIEW INTERACTION
// =========================================================

function initializeDashboardPreview() {

    const preview =
        document.querySelector(
            ".dashboard-preview"
        );


    if (!preview) return;


    preview.addEventListener(
        "mousemove",
        event => {

            if (
                window.innerWidth < 900
            ) return;


            const rect =
                preview.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            const rotateY =
                ((x / rect.width) - 0.5) * 4;


            const rotateX =
                ((y / rect.height) - 0.5) * -4;


            preview.style.transform =
                `perspective(1200px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)
                 translateY(-4px)`;

        }
    );


    preview.addEventListener(
        "mouseleave",
        () => {

            preview.style.transform = "";

        }
    );

}


// =========================================================
// COUNTER ANIMATION
// =========================================================

function initializeCounterAnimation() {

    const counters =
        document.querySelectorAll(
            ".preview-stat strong"
        );


    counters.forEach(counter => {

        const originalText =
            counter.textContent.trim();


        const numericValue =
            parseInt(
                originalText.replace(
                    /[^0-9]/g,
                    ""
                )
            );


        if (!numericValue) return;


        counter.dataset.target =
            numericValue;


        counter.dataset.original =
            originalText;


        counter.textContent = "0";

    });


    const preview =
        document.querySelector(
            ".dashboard-preview"
        );


    if (!preview) return;


    let animated = false;


    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting &&
                        !animated
                    ) {

                        animated = true;


                        counters.forEach(counter => {

                            animateCounter(
                                counter
                            );

                        });


                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.4
            }

        );


    observer.observe(preview);

}


function animateCounter(counter) {

    const target =
        parseInt(counter.dataset.target);

    const original =
        counter.dataset.original;

    const duration = 1200;

    const startTime =
        performance.now();


    function update(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) /
                duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const value =
            Math.floor(
                target * eased
            );


        if (
            original.includes(",")
        ) {

            counter.textContent =
                value.toLocaleString();

        } else {

            counter.textContent =
                value;

        }


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        } else {

            counter.textContent =
                original;

        }

    }


    requestAnimationFrame(update);

}
/* ==========================================
   CREATE WITH AI
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const aiPrompt = document.getElementById("aiFormPrompt");
    const aiCharCount = document.querySelector(".ai-character-count");
    const aiGenerateBtn = document.querySelector(".ai-generate-btn");

    const aiExampleButtons =
        document.querySelectorAll(".ai-example-btn");

    const aiModal =
        document.querySelector(".ai-modal");


    /* ==========================================
       CHARACTER COUNTER
    ========================================== */

    if (aiPrompt && aiCharCount) {

        aiPrompt.addEventListener("input", function () {

            const currentLength =
                aiPrompt.value.length;

            aiCharCount.textContent =
                `${currentLength} / 1000`;

        });

    }


    /* ==========================================
       EXAMPLE PROMPTS
    ========================================== */

    aiExampleButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const prompt =
                button.getAttribute("data-prompt");

            if (!prompt || !aiPrompt) {
                return;
            }

            aiPrompt.value = prompt;

            aiPrompt.dispatchEvent(
                new Event("input")
            );

            aiPrompt.focus();

        });

    });


    /* ==========================================
       GENERATE BUTTON
    ========================================== */

    if (aiGenerateBtn) {

        aiGenerateBtn.addEventListener(
            "click",
            generateAIForm
        );

    }


    async function generateAIForm() {

        if (!aiPrompt) {
            return;
        }

        const prompt =
            aiPrompt.value.trim();


        /* --------------------------------------
           VALIDATION
        -------------------------------------- */

        if (!prompt) {

            showAIToast(
                "Please describe the form you want to create."
            );

            aiPrompt.focus();

            return;
        }


        if (prompt.length < 10) {

            showAIToast(
                "Please provide a little more detail about your form."
            );

            aiPrompt.focus();

            return;
        }
// ==========================================
// CHECK LOGIN FIRST
// ==========================================

const token =
    localStorage.getItem("access_token");

if (!token) {

    localStorage.setItem(
        "pendingAIPrompt",
        prompt
    );

    window.location.href =
        "login.html";

    return;
}


        /* --------------------------------------
           SHOW LOADING
        -------------------------------------- */

        aiGenerateBtn.disabled = true;

        aiGenerateBtn.innerHTML =
            `
                <span>✦</span>
                Creating...
            `;


        if (aiModal) {
            aiModal.classList.remove("hidden");
        }


try {

    const response =
        await fetch(
            "http://127.0.0.1:8000/ai/generate-form",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    prompt: prompt
                })

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "AI form generation failed"
        );

    }


   console.log(
    "AI Response:",
    data
);


// Save the generated AI form

if (data.success && data.form) {

    localStorage.setItem(
        "aiGeneratedForm",
        JSON.stringify(data.form)
    );


    localStorage.setItem(
        "aiFormPrompt",
        prompt
    );


    // Redirect to Form Builder

    window.location.href =
        "create-form.html";


    return;

}


            if (aiModal) {
                aiModal.classList.add("hidden");
            }


            aiGenerateBtn.disabled = false;

            aiGenerateBtn.innerHTML =
                `
                    <span>✦</span>
                    Generate Form
                `;


            showAIToast(
                "Your form request is ready."
            );


        } catch (error) {

            console.error(
                "AI Form Error:",
                error
            );


            if (aiModal) {
                aiModal.classList.add("hidden");
            }


            aiGenerateBtn.disabled = false;

            aiGenerateBtn.innerHTML =
                `
                    <span>✦</span>
                    Generate Form
                `;


            showAIToast(
                "Something went wrong. Please try again."
            );

        }

    }


    /* ==========================================
       TOAST MESSAGE
    ========================================== */

    function showAIToast(message) {

        let toast =
            document.getElementById("aiToast");


        /*
         * Create toast if it doesn't exist.
         */

        if (!toast) {

            toast =
                document.createElement("div");

            toast.id = "aiToast";

            toast.className = "ai-toast";

            document.body.appendChild(toast);

        }


        toast.textContent = message;

        toast.classList.add("show");


        setTimeout(function () {

            toast.classList.remove("show");

        }, 3000);

    }

});
// =========================================================
// AUTHENTICATION & HEADER STATE MANAGEMENT
// =========================================================

function checkAuthStatus() {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");

    const authButtons = document.getElementById("authButtons");
    const userProfileWrap = document.getElementById("userProfileWrap");
    const mobileAuthActions = document.getElementById("mobileAuthActions");
    const mobileProfileActions = document.getElementById("mobileProfileActions");

    const userInitial = document.getElementById("userInitial");
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");

    if (token || userStr) {
        // User is logged in
        let userData = null;
        if (userStr) {
            try {
                userData = JSON.parse(userStr);
            } catch (e) {
                console.error("Error parsing user data:", e);
            }
        }

        const name = (userData && userData.name) ? userData.name : "Account";
        const email = (userData && userData.email) ? userData.email : "";
        const initial = name.charAt(0).toUpperCase();

        if (userInitial) userInitial.textContent = initial;
        if (userName) userName.textContent = name;
        if (userEmail) userEmail.textContent = email;

        // Hide Login buttons, Show Profile Icon
        if (authButtons) authButtons.style.display = "none";
        if (userProfileWrap) userProfileWrap.style.display = "flex";

        if (mobileAuthActions) mobileAuthActions.style.display = "none";
        if (mobileProfileActions) mobileProfileActions.style.display = "flex";

    } else {
        // User is logged out
        if (authButtons) authButtons.style.display = "flex";
        if (userProfileWrap) userProfileWrap.style.display = "none";

        if (mobileAuthActions) mobileAuthActions.style.display = "grid";
        if (mobileProfileActions) mobileProfileActions.style.display = "none";
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) {
        dropdown.classList.toggle("show");
    }
}

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    const profileWrap = document.getElementById("userProfileWrap");
    const dropdown = document.getElementById("profileDropdown");
    if (profileWrap && dropdown && !profileWrap.contains(event.target)) {
        dropdown.classList.remove("show");
    }
});

function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingAIPrompt");

    checkAuthStatus();
    window.location.reload();
}