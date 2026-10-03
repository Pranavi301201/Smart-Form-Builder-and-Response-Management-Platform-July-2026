async function login(){

const email=document.getElementById("email").value.trim();

const password=document.getElementById("password").value.trim();

const message=document.getElementById("message");

if(email==="" || password===""){

message.innerHTML="Please enter email and password.";

message.style.color="red";

return;

}

try{

const response=await fetch("http://127.0.0.1:8000/auth/login",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

email:email,

password:password

})

});

const data=await response.json();

if(response.ok){

    message.innerHTML = "Login Successful";

    message.style.color = "green";


    // Check whether user came here to generate an AI form
    const pendingAIPrompt =
        localStorage.getItem("pendingAIPrompt");


    setTimeout(async () => {

        // ==========================================
        // LOGIN FROM AI FORM GENERATION
        // ==========================================

        if (pendingAIPrompt) {

            message.innerHTML =
                "Generating your AI form...";

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
                                prompt:
                                    pendingAIPrompt
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


                if (
                    data.success &&
                    data.form
                ) {

                    // Save generated form
                    localStorage.setItem(
                        "aiGeneratedForm",
                        JSON.stringify(data.form)
                    );


                    // Remove temporary prompt
                    localStorage.removeItem(
                        "pendingAIPrompt"
                    );


                    // Open Form Builder
                    window.location.href =
                        "create-form.html";

                    return;

                }


                throw new Error(
                    "Invalid AI response"
                );

            }

            catch (error) {

                console.error(
                    "AI Form Error:",
                    error
                );

                message.innerHTML =
                    "Unable to generate AI form.";

                message.style.color =
                    "red";

            }

            return;

        }


        // ==========================================
        // NORMAL LOGIN
        // ==========================================

        window.location.href =
            "dashboard.html";

    }, 1000);

}

else{

message.innerHTML=data.detail;

message.style.color="red";

}

}

catch(error){

message.innerHTML="Server not running.";

message.style.color="red";

}

}