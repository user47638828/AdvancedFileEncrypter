document.getElementById("loginBtn").addEventListener("click", function() {
    const pwd = document.getElementById("password").value;
    if(pwd === "supersecret") {  // Passwort für Version 1
        window.location.href = "encrypt.html";
    } else {
        alert("Falsches Passwort!");
    }
});
