const loginBtn = document.getElementById("loginBtn");
loginBtn.addEventListener("click", ()=>{
    const pwd = document.getElementById("password").value;
    if(pwd === "supersecret"){
        document.getElementById("loginPanel").style.display="none";
        document.getElementById("toolPanel").style.display="block";
        document.getElementById("encryptTab").classList.add("active");
    } else {
        alert("Falsches Passwort!");
    }
});
