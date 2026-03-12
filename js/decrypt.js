const decBtn = document.getElementById("decryptBtn");
decBtn.addEventListener("click", async ()=>{
    const file = document.getElementById("fileInputDec").files[0];
    const password = document.getElementById("decPassword").value;
    const status = document.getElementById("decryptStatus");
    const link = document.getElementById("downloadLinkDec");
    if(!file || !password) return alert("Datei + Passwort erforderlich");
    link.style.display="none";
    status.style.display="block";

    await simulateProgress(status, ["Checking .afe file...", "Reading .afe data...", "Decrypting...", "Finalizing..."]);

    const text = await file.text();
    const lines = text.split("\n");
    if(lines[0]!=="AFE1"){ status.textContent="Keine AFE-Datei ❌"; return; }
    const meta={};
    for(let i=1;i<lines.length;i++){
        const [k,v]=lines[i].split("=");
        if(k && v) meta[k.trim()]=v.trim();
    }
    const enc = new TextEncoder();
    const salt = base64ToArrayBuffer(meta.salt);
    const iv = base64ToArrayBuffer(meta.iv);
    const encryptedData = base64ToArrayBuffer(meta.data);

    try{
        const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
        const key = await crypto.subtle.deriveKey(
            {name:"PBKDF2", salt:salt, iterations:100000, hash:"SHA-256"},
            keyMaterial,
            {name:"AES-GCM", length:256},
            false,
            ["decrypt"]
        );
        const decrypted = await crypto.subtle.decrypt({name:"AES-GCM", iv:iv}, key, encryptedData);
        const blob = new Blob([decrypted]);
        link.href = URL.createObjectURL(blob);
        link.download = file.name.replace(".afe","_decrypted");
        link.style.display="inline-block";
        link.textContent="Download Original";
        status.textContent="Decryption complete ✅";
    }catch(e){
        alert("Falsches Passwort oder beschädigte Datei");
        status.textContent="Decryption failed ❌";
    }
});

async function simulateProgress(statusEl, steps){
    for(let i=0;i<steps.length;i++){
        for(let p=0;p<=100;p+=10){
            statusEl.textContent = steps[i]+" "+p+"%";
            await new Promise(r=>setTimeout(r,50));
        }
    }
}
