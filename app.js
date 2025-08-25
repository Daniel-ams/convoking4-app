// --- App Version ---
const appVersion = "1.6.5";

// --- Application State ---
let appData = {};
const initialAppData = {
    phase1: { theBasics: null, currentState: null, futureState: null }
};
resetAppData();

// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Header and Version/Date Display ---
    const versionDisplay = document.getElementById('version-display');
    const dateDisplay = document.getElementById('date-display');
    if (versionDisplay) versionDisplay.textContent = `Version ${appVersion}`;
    if (dateDisplay) {
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', dateOptions);
    }
    
    // --- Element Selectors & Event Listeners ---
    const onboardingScreen = document.getElementById('onboarding-screen');
    const phase1Screen = document.getElementById('phase-1-screen');
    const loadProfileBtn = document.getElementById('load-profile-btn');
    const fileLoader = document.getElementById('file-loader');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const newProfileBtn = document.getElementById('new-profile-btn');
    const beginPhase1Btn = document.getElementById('begin-phase-1-btn');
    const prevBtn = document.getElementById('prev-btn');
    const basicsForm = document.getElementById('basics-form');
    const currentStateCard = document.getElementById('current-state-step');
    const startAssessmentBtn = currentStateCard.querySelector('.btn');
    const assessmentModal = document.getElementById('assessment-modal');

    if(loadProfileBtn) loadProfileBtn.addEventListener('click', () => fileLoader.click());
    if(fileLoader) fileLoader.addEventListener('change', loadProfileFromFile);
    if(saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfileToFile);
    if(newProfileBtn) newProfileBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start a new profile? All unsaved work will be lost.')) {
            resetAppData();
            renderUI();
        }
    });
    if(beginPhase1Btn) beginPhase1Btn.addEventListener('click', () => {
        if(onboardingScreen) onboardingScreen.style.display = 'none';
        if(phase1Screen) phase1Screen.style.display = 'flex'; 
    });
    if(prevBtn) prevBtn.addEventListener('click', () => {
        if(phase1Screen) phase1Screen.style.display = 'none';
        if(onboardingScreen) onboardingScreen.style.display = 'flex';
    });
    if(basicsForm) basicsForm.addEventListener('submit', handleBasicsSubmit);
    if(startAssessmentBtn) startAssessmentBtn.addEventListener('click', () => {
        if(assessmentModal) assessmentModal.style.display = 'flex';
    });
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    renderUI();
});

// --- Core Functions ---
function resetAppData() {
    appData = JSON.parse(JSON.stringify(initialAppData));
}

function saveProfileToFile() {
    // This function will now be reliable because handleBasicsSubmit saves everything
    if (!appData.phase1.theBasics || !appData.phase1.theBasics.organizationName) {
        alert("Please provide an organization name and click 'Save Basics' before saving.");
        return;
    }
    const filename = `${appData.phase1.theBasics.organizationName}.json`;
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function loadProfileFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);
            appData = loadedData;
            alert(`Profile for "${appData.phase1.theBasics.organizationName}" loaded successfully.`);
            renderUI();
        } catch (error) {
            alert('Error loading file. Please ensure it is a valid JSON file.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// THIS FUNCTION IS UPDATED
function renderUI() {
    const basics = appData.phase1.theBasics;
    const basicsForm = document.getElementById('basics-form');
    const currentStateCard = document.getElementById('current-state-step');

    if(basicsForm) basicsForm.reset();

    if (basics) {
        // Repopulate all "The Basics" form fields
        document.getElementById('org-name').value = basics.organizationName || '';
        if (basics.organizationSize) {
            const radio = document.querySelector(`input[name="org-size"][value="${basics.organizationSize}"]`);
            if (radio) radio.checked = true;
        }
        document.getElementById('org-year').value = basics.yearFounded || '';
        document.getElementById('org-location').value = basics.location || '';
        document.getElementById('org-remote').checked = basics.isRemote || false;
        
        basics.identity?.forEach(val => {
            const el = document.querySelector(`input[name="org-identity"][value="${val}"]`);
            if (el) el.checked = true;
        });
        if (basics.legalStructure) {
            const el = document.querySelector(`input[name="org-legal"][value="${basics.legalStructure}"]`);
            if (el) el.checked = true;
        }
        basics.fundingSources?.forEach(val => {
            const el = document.querySelector(`input[name="org-funding"][value="${val}"]`);
            if (el) el.checked = true;
        });
    }

    // Update progress and locked states
    if (appData.phase1.theBasics) {
        currentStateCard.classList.remove('locked');
        currentStateCard.querySelector('.btn').disabled = false;
        currentStateCard.querySelector('.status').textContent = 'To Do';
        currentStateCard.querySelector('.status').className = 'status status-todo';
        document.querySelector('#phase-1-screen .progress-container span').textContent = 'Progress: (1 of 3 steps completed)';
        document.querySelector('#phase-1-screen .progress-fill').style.width = '33.3%';
    }
    
    console.log("UI has been re-rendered with the current data.");
}

// THIS FUNCTION IS UPDATED
function handleBasicsSubmit(e) {
    e.preventDefault();
    const getCheckedValues = (name) => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);

    appData.phase1.theBasics = {
        organizationName: document.getElementById('org-name').value,
        organizationSize: document.querySelector('input[name="org-size"]:checked')?.value,
        yearFounded: document.getElementById('org-year').value,
        location: document.getElementById('org-location').value,
        isRemote: document.getElementById('org-remote').checked,
        identity: getCheckedValues('org-identity'),
        legalStructure: document.querySelector('input[name="org-legal"]:checked')?.value,
        fundingSources: getCheckedValues('org-funding')
    };
    alert("'The Basics' have been saved!");
    renderUI();
}