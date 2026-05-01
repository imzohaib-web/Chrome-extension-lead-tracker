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
        let link = document.createElement("a");

        link.textContent = leads[i];
        link.href = leads[i];
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        listItem.append(link);
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
