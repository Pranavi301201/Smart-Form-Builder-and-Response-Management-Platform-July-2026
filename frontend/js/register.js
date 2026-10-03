async function register(){
    

    const name=document.getElementById("name").value;

    const email=document.getElementById("email").value;

    const password=document.getElementById("password").value;

    const response=await fetch("http://127.0.0.1:8000/auth/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            name:name,

            email:email,

            password:password
        })
    });

    const data=await response.json();

   if(response.ok){

    document.getElementById("message").innerHTML =
    "✅ Registration Successful! You can now login.";
    document.getElementById("message").style.color = "green";

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

}

    else{

       document.getElementById("message").innerHTML = data.detail;
document.getElementById("message").style.color = "red";
    }

}