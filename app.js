// --- STATE MANAGEMENT ---
// A single object to hold all our application's data
let appData = {
    organizationName: "",
    phase1: {
        currentState: { strategy: "", people: "" /* etc. */ },
        futureState: { vision: "" },
    },
    phase2: { initiatives: [] },
    phase3: { roadmap: [] }
};

// --- DOM ELEMENTS ---
// Get references to the HTML elements we need to interact with
const orgNameInput = document.getElementById('org-name');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const fileLoader = document.getElementById('file-loader');
const phaseTitles = document.querySelectorAll('.phase-title');

// --- EVENT LISTENERS ---

// Toggle collapsible panels
phaseTitles.forEach(title => {
    title.addEventListener('click', () => {
        const content = title.nextElementSibling;
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    });
});

// Save data to a .json file
saveBtn.addEventListener('click', () => {
    // Update the state object with the current organization name
    appData.organizationName = orgNameInput.value;
    
    const dataStr = JSON.stringify(appData, null, 2); // Pretty print JSON
    const dataBlob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appData.organizationName || 'snapshot'}.json`;
    link.click();
    URL.revokeObjectURL(url);
});

// Trigger file input when "Load" is clicked
loadBtn.addEventListener('click', () => {
    fileLoader.click();
});

// Handle the file loading
fileLoader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);
            appData = loadedData;
            // Now, update the UI with the loaded data
            updateUI();
            alert('Profile loaded successfully!');
        } catch (error) {
            alert('Error loading file. Please ensure it is a valid .json file.');
        }
    };
    reader.readAsText(file);
});


// --- UI FUNCTIONS ---

// A function to populate the form fields from the appData object
function updateUI() {
    orgNameInput.value = appData.organizationName;
    // ... add more lines here to populate other fields in Phase I, II, and III
}