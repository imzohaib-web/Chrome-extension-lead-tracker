let myLeads = [];
const storageKey = "myLeads";

// Elements
const inputEl = document.getElementById("input-el");
const saveInputBtn = document.getElementById("save-input");
const saveTabBtn = document.getElementById("save-tab");
const deleteBtn = document.getElementById("delete-btn");
const ulEl = document.getElementById("ul-el");

// Load from localStorage
const leadsFromLocalStorage = JSON.parse(localStorage.getItem(storageKey));
if (leadsFromLocalStorage) {
    myLeads = leadsFromLocalStorage;
}

render(myLeads);

// Render function
function render(leads) {
    ulEl.textContent = "";

    if (leads.length === 0) {
        let emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";
        emptyItem.textContent = "No saved leads yet. Add a URL or save the current tab.";
        ulEl.append(emptyItem);
        return;
    }

    for (let i = 0; i < leads.length; i++) {
        let listItem = document.createElement("li");
        let card = document.createElement("div");
        let link = document.createElement("a");
        let actions = document.createElement("div");
        let copyButton = document.createElement("button");
        let openButton = document.createElement("button");

        card.className = "lead-card";
        link.textContent = leads[i];
        link.className = "lead-link";
        link.href = leads[i];
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        actions.className = "lead-actions";

        copyButton.className = "icon-btn";
        copyButton.type = "button";
        copyButton.title = "Copy link";
        copyButton.setAttribute("aria-label", "Copy link");
        copyButton.innerHTML = getCopyIcon();
        copyButton.addEventListener("click", function () {
            copyLead(leads[i], copyButton);
        });

        openButton.className = "icon-btn";
        openButton.type = "button";
        openButton.title = "Open in new tab";
        openButton.setAttribute("aria-label", "Open in new tab");
        openButton.innerHTML = getOpenIcon();
        openButton.addEventListener("click", function () {
            window.open(leads[i], "_blank", "noopener,noreferrer");
        });

        actions.append(copyButton, openButton);
        card.append(link, actions);
        listItem.append(card);
        ulEl.append(listItem);
    }
}

function saveLeads() {
    localStorage.setItem(storageKey, JSON.stringify(myLeads));
}

function getCleanUrl(url) {
    let trimmedUrl = url.trim();

    if (trimmedUrl === "") {
        return "";
    }

    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
        trimmedUrl = "https://" + trimmedUrl;
    }

    return trimmedUrl;
}

function getCopyIcon() {
    return `
        <span class="btn-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
                <rect width="14" height="14" x="8" y="8" rx="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
        </span>
    `;
}

function getOpenIcon() {
    return `
        <span class="btn-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
        </span>
    `;
}

async function copyLead(url, button) {
    try {
        await navigator.clipboard.writeText(url);
        showCopiedState(button);
    } catch (error) {
        let tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.append(tempInput);
        tempInput.select();
        document.execCommand("copy");
        tempInput.remove();
        showCopiedState(button);
    }
}

function showCopiedState(button) {
    button.classList.add("copied");
    button.title = "Copied";
    button.setAttribute("aria-label", "Copied");

    setTimeout(function () {
        button.classList.remove("copied");
        button.title = "Copy link";
        button.setAttribute("aria-label", "Copy link");
    }, 1200);
}

// Save input URL
saveInputBtn.addEventListener("click", function () {
    let cleanUrl = getCleanUrl(inputEl.value);

    if (cleanUrl !== "") {
        myLeads.push(cleanUrl);
        inputEl.value = "";
        saveLeads();
        render(myLeads);
    }
});

inputEl.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        saveInputBtn.click();
    }
});

// Save current tab URL
saveTabBtn.addEventListener("click", function () {
    if (typeof chrome === "undefined" || !chrome.tabs) {
        alert("Save Tab works only when the project is loaded as a Chrome extension.");
        return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        myLeads.push(tabs[0].url);
        saveLeads();
        render(myLeads);
    });
});

// Delete all leads (double click)
deleteBtn.addEventListener("dblclick", function () {
    localStorage.removeItem(storageKey);
    myLeads = [];
    render(myLeads);
});
