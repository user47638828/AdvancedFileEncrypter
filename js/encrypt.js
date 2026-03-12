document.getElementById("encryptBtn").addEventListener("click", async () => {
    const file = document.getElementById("fileInput").files[0];
    const password = document.getElementById("encPassword").value;
    if(!file || !password) return alert("Datei + Passwort erforderlich");

    const arrayBuffer = await file.arrayBuffer();
    const enc = new TextEncoder();

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
        {name:"PBKDF2", salt: salt, iterations: 100000, hash:"SHA-256"},
        keyMaterial,
        {name:"AES-GCM", length:256},
        false,
        ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({name:"AES-GCM", iv:iv}, key, arrayBuffer);

    const algo = generateRandomString(24);
    const blobContent = `AFE1
algo=${algo}
iv=${arrayBufferToBase64(iv)}
salt=${arrayBufferToBase64(salt)}
data=${arrayBufferToBase64(encrypted)}
`;

    const blob = new Blob([blobContent], {type:"application/octet-stream"});
    const url = URL.createObjectURL(blob);
    const link = document.getElementById("downloadLink");
    link.href = url;
    link.download = file.name.split(".")[0] + ".afe";
    link.style.display = "inline-block";
    link.textContent = "Download .afe";
});

function generateRandomString(length){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:,.<>?';
    let str = '';
    for(let i=0;i<length;i++){ str += chars[Math.floor(Math.random()*chars.length)]; }
    return str;
}
