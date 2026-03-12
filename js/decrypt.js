document.getElementById("decryptBtn").addEventListener("click", async () => {
    const file = document.getElementById("fileInput").files[0];
    const password = document.getElementById("decPassword").value;
    if(!file || !password) return alert("Datei + Passwort erforderlich");

    const text = await file.text();
    const lines = text.split("\n");
    if(lines[0] !== "AFE1") return alert("Keine AFE-Datei");

    const meta = {};
    for(let i=1;i<lines.length;i++){
        const [key,val] = lines[i].split("=");
        if(key && val) meta[key.trim()] = val.trim();
    }

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    const salt = base64ToArrayBuffer(meta.salt);
    const iv = base64ToArrayBuffer(meta.iv);
    const encryptedData = base64ToArrayBuffer(meta.data);

    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
        {name:"PBKDF2", salt: salt, iterations: 100000, hash:"SHA-256"},
        keyMaterial,
        {name:"AES-GCM", length:256},
        false,
        ["decrypt"]
    );

    try{
        const decrypted = await crypto.subtle.decrypt({name:"AES-GCM", iv:iv}, key, encryptedData);
        const blob = new Blob([decrypted]);
        const link = document.getElementById("downloadLink");
        link.href = URL.createObjectURL(blob);
        link.download = file.name.replace(".afe","_decrypted");
        link.style.display="inline-block";
        link.textContent="Download Original";
    }catch(e){
        alert("Falsches Passwort oder beschädigte Datei");
    }
});
