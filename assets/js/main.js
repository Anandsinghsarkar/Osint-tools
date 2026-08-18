const API_KEY = "30d-demo";
const BASE = "https://osint.invalidayushh.workers.dev";
const user = localStorage.getItem("user");

// Log visit
fetch(`/log?uid=${user}&action=visit`, { method: "GET" });

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
        const tool = card.getAttribute('data-tool');
        showModal(tool);
    });
});

function showModal(tool) {
    document.getElementById("modal").style.display = "block";
    const titleMap = {
        num: "Enter Phone Number",
        adhar: "Enter Aadhar Number",
        insta: "Enter Instagram Username",
        ifsc: "Enter IFSC Code",
        veh: "Enter Vehicle Number",
        tg: "Enter Telegram ID",
        pak: "Enter Pakistani Number",
        ration: "Enter Ration Card",
        ffvisit: "Enter Free Fire UID",
        fflike: "Enter Free Fire UID",
        owner: "Contact Owner",
        profile: "View Profile"
    };
    document.getElementById("modal-title").innerText = titleMap[tool];
    document.getElementById("query").value = "";
    document.getElementById("result").innerText = "";
    
    if (tool === "owner") {
        document.getElementById("query").remove();
        document.querySelector('#modal button').remove();
        document.getElementById("result").innerText = "👑 Owner: @HRAKING\n📩 DM to buy credits.";
    } else if (tool === "profile") {
        showProfile();
    }
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function runTool() {
    const tool = document.getElementById("modal-title").innerText.toLowerCase();
    const q = document.getElementById("query").value.trim();
    const resultEl = document.getElementById("result");

    if (!q) {
        resultEl.innerText = "❌ Empty input!";
        return;
    }

    let url = "";

    const map = {
        "phone number": `${BASE}/num?key=${API_KEY}&q=${q}`,
        "aadhar number": `${BASE}/adhar?key=${API_KEY}&q=${q}`,
        "instagram username": `${BASE}/insta?key=${API_KEY}&q=${q}`,
        "ifsc code": `${BASE}/ifsc?key=${API_KEY}&q=${q}`,
        "vehicle number": `${BASE}/veh?key=${API_KEY}&q=${q}`,
        "telegram id": `${BASE}/tg?key=${API_KEY}&q=${q}`,
        "pakistani number": `${BASE}/pak?key=${API_KEY}&q=${q}`,
        "ration card": `${BASE}/familyinfo?key=${API_KEY}&q=${q}`,
    };

    url = map[tool] || "";

    if (tool.includes("ffvisit")) url = `${BASE}/ffvisit?key=${API_KEY}&region=ind&uid=${q}`;
    if (tool.includes("ff like")) url = `${BASE}/fflike?key=${API_KEY}&region=ind&uid=${q}`;

    if (!url) {
        resultEl.innerText = "❌ Invalid tool.";
        return;
    }

    resultEl.innerText = "🔍 Fetching...";

    fetch(`/api/proxy?url=` + encodeURIComponent(url))
        .then(r => r.text())
        .then(data => {
            try {
                const json = JSON.parse(data);
                resultEl.innerText = JSON.stringify(json, null, 2);
            } catch {
                resultEl.innerText = data;
            }
            // Log usage
            fetch(`/log?uid=${user}&tool=${tool}&query=${q}`, { method: "GET" });
        })
        .catch(e => {
            resultEl.innerText = "🔥 Failed: " + e.message;
        });
}

function showProfile() {
    document.getElementById("query").remove();
    document.querySelector('#modal button').remove();
    fetch(`server.py?get_user=${user}`)
        .then(r => r.json())
        .then(usr => {
            document.getElementById("result").innerHTML = `
                <b>👤 Name:</b> ${usr.name}<br>
                <b>🪪 Username:</b> @${usr.username}<br>
                <b>🆔 UserID:</b> ${usr.userid}<br>
                <b>💳 Credit:</b> ${usr.credit}<br>
                <i>Admin will contact if credit ends.</i>
            `;
        });
}
