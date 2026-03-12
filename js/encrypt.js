const encBtn = document.getElementById("encryptBtn");
encBtn.addEventListener("click", async ()=>{
    const file = document.getElementById("fileInput").files[0];
    const password = document.getElementById("encPassword").value;
    const status = document.getElementById("encryptStatus");
    const link = document.getElementById("downloadLink");
    if(!file || !password) return alert("Datei + Passwort erforderlich");
    link.style.display="none";
    status.style.display="block";

    await simulateProgress(status, ["Checking file...", "Encrypting...", "Finalizing..."]);

    const arrayBuffer = await file.arrayBuffer();
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
        {name:"PBKDF2", salt: salt, iterations:100000, hash:"SHA-256"},
        keyMaterial,
        {name:"AES-GCM", length:256},
        false,
        ["encrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({name:"AES-GCM", iv:iv}, key, arrayBuffer);

    const blobContent = `AFE1
algo=${generateRandomString(24)}
iv=${arrayBufferToBase64(iv)}
salt=${arrayBufferToBase64(salt)}
data=${arrayBufferToBase64(encrypted)}
`;
    const blob = new Blob([blobContent], {type:"application/octet-stream"});
    link.href = URL.createObjectURL(blob);
    link.download = file.name.split(".")[0]+".afe";
    link.style.display="inline-block";
    link.textContent="Download .afe";
    status.textContent="Encryption complete ✅";
});

async function simulateProgress(statusEl, steps){
    for(let i=0;i<steps.length;i++){
        for(let p=0;p<=100;p+=10){
            statusEl.textContent = steps[i]+" "+p+"%";
            await new Promise(r=>setTimeout(r,50));
        }
    }
}
