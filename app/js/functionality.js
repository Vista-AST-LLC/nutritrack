//********TODS ********
// 1) Determine best layout for application
// 2) Fix Food Label entry field
// 3) Research best way to cacluate nutrition score
// 4) Resolve responsivness issues Ex) Table
// 5) Replace age question page with ???? */

// Age Specific Nutrition Requirements from CSV
const nutritionRequirements = {
    '9-13': {
        calories: { min: 1600, max: 2200 },
        sodium: 1800,
        cholesterol: 300,
        carbs: { min: 180, max: 360 },
        protein: 34,
        fiber: 28.5, // Average of 26-31g
        fat: { min: 25, max: 35 }
    },
    '14-18': {
        calories: { min: 2000, max: 2800 },
        sodium: 2300,
        cholesterol: 300,
        carbs: { min: 225, max: 455 },
        protein: 49, // Average of 46-52g
        fiber: 32, // Average of 26-38g
        fat: { min: 25, max: 35 }
    }
};

// Welcome Screen Variables
const welcomeScreen = document.getElementById('welcomeScreen');
const demographicsScreen = document.getElementById('demographicsScreen');
const mainApp = document.getElementById('mainApp');
const welcomeNextBtn = document.getElementById('welcomeNextBtn');
const backBtn = document.getElementById('backBtn');
const startBtn = document.getElementById('startBtn');
const ageGroupSelect = document.getElementById('ageGroup');
const changeProfileBtn = document.getElementById('changeProfileBtn');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileDetails = document.getElementById('profileDetails');

// User demographics
let userAgeGroup = '';
let userRequirements = null;

// Welcome Screen Event Listeners
welcomeNextBtn.addEventListener('click', showDemographicsScreen);
backBtn.addEventListener('click', showWelcomeScreen);
startBtn.addEventListener('click', startMainApp);
changeProfileBtn.addEventListener('click', showDemographicsScreen);

// Age group selection
ageGroupSelect.addEventListener('change', function () {
    userAgeGroup = this.value;
    checkFormCompletion();
});

function showDemographicsScreen() {
    welcomeScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    demographicsScreen.classList.remove('hidden');

    // Reset form
    ageGroupSelect.value = '';
    userAgeGroup = '';
    startBtn.disabled = true;

    // Focus on age group select for accessibility
    ageGroupSelect.focus();
}

function showWelcomeScreen() {
    demographicsScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    welcomeNextBtn.focus();
}

function checkFormCompletion() {
    if (userAgeGroup) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

function startMainApp() {
    // Set user requirements based on age group
    userRequirements = nutritionRequirements[userAgeGroup];

    // Update profile display
    updateProfileDisplay();

    // Hide welcome screens and show main app
    welcomeScreen.classList.add('hidden');
    demographicsScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');

    // Update requirements table
    updateRequirementsTable();

    // Load the main app data
    loadFromLocalStorage();

    // Focus on main content for screen readers
    document.getElementById('main-content').focus();
}

function updateProfileDisplay() {
    const ageGroupText = userAgeGroup === '9-13' ? '9-13 years' : '14-18 years';

    // Update profile avatar with first letter of age group
    profileAvatar.textContent = userAgeGroup.charAt(0);

    // Update profile name and details
    profileName.textContent = `${ageGroupText}`;
    profileDetails.textContent = `Personalized nutrition tracking`;
}

// ALWAYS show welcome screen when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Always show welcome screen first
    mainApp.classList.add('hidden');
    demographicsScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');

    // Still load any existing data for when user completes demographics
    loadFromLocalStorage();
});

// Update requirements table with user-specific data
function updateRequirementsTable() {
    const requirementsBody = document.getElementById('requirementsBody');
    requirementsBody.innerHTML = '';

    // Add all age groups to the table
    Object.keys(nutritionRequirements).forEach(key => {
        const req = nutritionRequirements[key];
        const row = document.createElement('tr');

        // Highlight the user's row
        if (key === userAgeGroup) {
            row.classList.add('user-requirements');
        }

        const ageGroupText = key === '9-13' ? '9–13 yrs' : '14–18 yrs';
        const calorieRange = `${req.calories.min.toLocaleString()}-${req.calories.max.toLocaleString()}`;
        const carbRange = `${req.carbs.min}-${req.carbs.max}`;
        const fiberRange = key === '9-13' ? '26–31' : '26–38';

        row.innerHTML = `
                    <td>${ageGroupText}</td>
                    <td>~${calorieRange}</td>
                    <td>${req.sodium.toLocaleString()}</td>
                    <td>As low as possible (≤${req.cholesterol} as a practical upper limit)</td>
                    <td>≈ 45–65% of calories ≈ ${carbRange} g</td>
                    <td>≈ ${req.protein} g ${key === '9-13' ? '(RDA for this age)' : '(typical RDA range)'}</td>
                    <td>≈ ${fiberRange} g ${key === '9-13' ? '(common pediatric targets)' : '(common teen targets)'}</td>
                    <td>${req.fat.min}–${req.fat.max}% of calories</td>
                `;

        requirementsBody.appendChild(row);
    });
}

// Global variables
let nutritionData = [];
let selectedFoods = [];
let tableVisible = false;

// Global variables for overall keyboard handling
let keyLastTime = 0;
let keyEntry = "";

// Global variable for the specific items that we Added
let foodEntryCount = 1;

// DOM elements
const csvFileInput = document.getElementById('csvFile');
const selectedFileName = document.getElementById('selectedFileName');
const foodCodeInput = document.getElementById('foodCode');
const addFoodBtn = document.getElementById('addFoodBtn');
const toggleTableBtn = document.getElementById('toggleTableBtn');
const tableContainer = document.getElementById('tableContainer');
const tableBody = document.getElementById('tableBody');
const loadingDiv = document.getElementById('loading');
const messageDiv = document.getElementById('message');
const resetCsvBtn = document.getElementById('resetCsvBtn');
const resetCategoriesBtn = document.getElementById('resetCategoriesBtn');
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const instructionsPanel = document.getElementById('instructionsPanel');
const overlay = document.getElementById('overlay');

// Category elements
const breakfastItems = document.getElementById('breakfastItems');
const lunchItems = document.getElementById('lunchItems');
const dinnerItems = document.getElementById('dinnerItems');
const dessertItems = document.getElementById('dessertItems');

// Count elements
const breakfastCount = document.getElementById('breakfastCount');
const lunchCount = document.getElementById('lunchCount');
const dinnerCount = document.getElementById('dinnerCount');
const dessertCount = document.getElementById('dessertCount');

// Summary elements
const totalCalories = document.getElementById('totalCalories');
const totalProtein = document.getElementById('totalProtein');
const totalCarbs = document.getElementById('totalCarbs');
const totalFats = document.getElementById('totalFats');
const totalSodium = document.getElementById('totalSodium');
const totalFiber = document.getElementById('totalFiber');

// Progress elements
const progressCalories = document.getElementById('progressCalories');
const progressProtein = document.getElementById('progressProtein');
const progressCarbs = document.getElementById('progressCarbs');
const progressFiber = document.getElementById('progressFiber');
const progressSodium = document.getElementById('progressSodium');

// Goal elements
const goalCalories = document.getElementById('goalCalories');
const goalProtein = document.getElementById('goalProtein');
const goalCarbs = document.getElementById('goalCarbs');
const goalFiber = document.getElementById('goalFiber');
const goalSodium = document.getElementById('goalSodium');

// Progress bars
const caloriesProgress = document.getElementById('caloriesProgress');
const proteinProgress = document.getElementById('proteinProgress');
const carbsProgress = document.getElementById('carbsProgress');
const fiberProgress = document.getElementById('fiberProgress');
const sodiumProgress = document.getElementById('sodiumProgress');

// Status elements
const caloriesStatus = document.getElementById('caloriesStatus');
const proteinStatus = document.getElementById('proteinStatus');
const carbsStatus = document.getElementById('carbsStatus');
const fiberStatus = document.getElementById('fiberStatus');
const sodiumStatus = document.getElementById('sodiumStatus');

// Points elements
const pointsCircle = document.getElementById('pointsCircle');

// Points bars
const proteinBar = document.getElementById('proteinBar');
const carbsBar = document.getElementById('carbsBar');
const fiberBar = document.getElementById('fiberBar');
const sodiumBar = document.getElementById('sodiumBar');

// Points scores
const proteinScore = document.getElementById('proteinScore');
const carbsScore = document.getElementById('carbsScore');
const fiberScore = document.getElementById('fiberScore');
const sodiumScore = document.getElementById('sodiumScore');

// Event listeners
csvFileInput.addEventListener('change', handleFileUpload);
addFoodBtn.addEventListener('click', addFoodByCode);
foodCodeInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        //console.log("Code field entry accepted ", selectedFoods);
        addFoodByCode();
    }
});
toggleTableBtn.addEventListener('click', toggleTable);
resetCsvBtn.addEventListener('click', resetCsv);
resetCategoriesBtn.addEventListener('click', resetCategories);
menuBtn.addEventListener('click', openInstructions);
closeBtn.addEventListener('click', closeInstructions);
overlay.addEventListener('click', closeInstructions);

// Enhanced input validation
foodCodeInput.addEventListener('input', function () {
    const value = this.value.trim().toUpperCase();
    const codeHelp = document.getElementById('codeHelp');

    // Reset visual state
    this.classList.remove('error', 'success');
    codeHelp.classList.add('hidden');

    if (value) {
        if (!/^[A-Za-z]\d+$/.test(value)) {
            this.classList.add('error');
            codeHelp.textContent = 'Food code should be a letter followed by numbers (e.g., B1, L20)';
            codeHelp.classList.remove('hidden');
        } else if (nutritionData.length > 0) {
            // Check if code exists in nutrition data
            const foodItem = nutritionData.find(item => {
                const referenceNum = String(item['Reference #'] || '').toUpperCase();
                return referenceNum === value;
            });

            if (!foodItem) {
                this.classList.add('error');
                codeHelp.textContent = `Reference Number "${value}" not found in data.`;
                codeHelp.classList.remove('hidden');
                /*} else if (selectedFoods.some(item => item.code === foodItem.code)) {  // removing this check so we can add multiple in
                    this.classList.add('error');
                    codeHelp.textContent = `Food with code "${value}" is already added.`;
                    codeHelp.classList.remove('hidden');*/
            } else {
                this.classList.add('success');
            }
        }
    }
});

// This is handling the overall page entry
document.addEventListener("keydown", function (e) {
    if (document.activeElement != foodCodeInput) { // ignore all of this if typing in the text field
        if ((Date.now() - keyLastTime) < 60) {  // make sure the scanner is typing and not the person
            keyLastTime = Date.now();
            if ((e.key === 'Enter') || (e.key === 'Tab')) {  // Some scanners send enter, others send tab
                if (keyEntry.length > 0) {
                    //console.log("Code accepted");
                    foodCodeInput.value = keyEntry; // Makes this compatible with prior programming
                    keyEntry = "";
                    addFoodByCode();
                }
            } else {
                if (!(e.key === "Shift")) {  // workaround for scanners that send Shift
                    //console.log("Add letter " + e.key);
                    keyEntry += e.key;
                }
            }
        } else {
            //console.log("Key press " + e.key);
            if (!(e.key === "Shift")) {  // workaround for scanners that send Shift
                keyLastTime = Date.now();  // This needs to be here so that Shift doesn't cause an errant time reset
                keyEntry = e.key;
            }
        }
    }
});

function openInstructions() {
    instructionsPanel.classList.add('active');
    overlay.classList.add('active');
    menuBtn.setAttribute('aria-expanded', 'true');
    // Focus on close button for keyboard users
    closeBtn.focus();
}

function closeInstructions() {
    instructionsPanel.classList.remove('active');
    overlay.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    // Return focus to menu button
    menuBtn.focus();
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    selectedFileName.textContent = `Selected: ${file.name}`;
    loadingDiv.classList.remove('hidden');
    messageDiv.classList.add('hidden');

    // Clear any previous error
    const fileHelp = document.getElementById('fileHelp');
    fileHelp.classList.add('hidden');

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function (results) {
            loadingDiv.classList.add('hidden');

            if (results.errors.length > 0) {
                fileHelp.textContent = 'Error parsing CSV: ' + results.errors[0].message;
                fileHelp.classList.remove('hidden');
                showMessage('Error parsing CSV file', 'error');
                return;
            }

            if (results.data.length === 0) {
                fileHelp.textContent = 'No data found in CSV file.';
                fileHelp.classList.remove('hidden');
                showMessage('No data found in CSV file.', 'error');
                return;
            }

            // Validate required columns
            const requiredColumns = ['Reference #', 'Item', 'Calories'];
            const missingColumns = requiredColumns.filter(col =>
                !results.meta.fields || !results.meta.fields.includes(col)
            );

            if (missingColumns.length > 0) {
                fileHelp.textContent = `Missing required columns: ${missingColumns.join(', ')}`;
                fileHelp.classList.remove('hidden');
                showMessage(`Missing required columns: ${missingColumns.join(', ')}`, 'error');
                return;
            }

            nutritionData = results.data;
            //console.log('Loaded nutrition data:', nutritionData);
            updateTable();
            saveToLocalStorage();
            showMessage('CSV data loaded successfully! You can now add food items by code.', 'success');
        },
        error: function (error) {
            loadingDiv.classList.add('hidden');
            fileHelp.textContent = 'Error reading file: ' + error.message;
            fileHelp.classList.remove('hidden');
            showMessage('Error reading file: ' + error.message, 'error');
        }
    });
}

function addFoodByCode() {

    const code = foodCodeInput.value.trim().toUpperCase();
    const codeHelp = document.getElementById('codeHelp');

    // Reset visual state
    foodCodeInput.classList.remove('error', 'success');
    codeHelp.classList.add('hidden');

    if (!code) {
        foodCodeInput.classList.add('error');
        codeHelp.textContent = 'Please enter a food code.';
        codeHelp.classList.remove('hidden');
        showMessage('Please enter a food code.', 'error');
        return;
    }

    if (nutritionData.length === 0) {
        foodCodeInput.classList.add('error');
        codeHelp.textContent = 'Please upload a CSV file first.';
        codeHelp.classList.remove('hidden');
        showMessage('Please upload a CSV file first.', 'error');
        return;
    }

    console.log('Looking for code:', code);
    console.log('Available codes:', nutritionData.map(item => item.code));

    // To fix a bug... nutritionData has objects that are passed by reference, not by value
    // This means that all "entities" are just the same entity and changing one changes all
    // There may be a better way to do this though...
    const nutritionDataLocal = structuredClone(nutritionData);

    const foodItem = nutritionDataLocal.find(item => {
        const itemCode = String(item.code || '').toUpperCase();
        return itemCode === code;
    });

    if (!foodItem) {
        foodCodeInput.classList.add('error');
        codeHelp.textContent = `Food with code "${code}" not found.`;
        codeHelp.classList.remove('hidden');
        showMessage(`Food with code "${code}" not found.`, 'error');
        // Clear the input field since code is invalid
        foodCodeInput.value = '';
        return;
    }

    //console.log("foodItem is now: ", foodItem);

    // Check for duplicate // removing this check so we can add multiple in
    /*if (selectedFoods.some(item => item.code === foodItem.code)) {
        foodCodeInput.classList.add('error');
        codeHelp.textContent = `Food with code "${code}" is already added.`;
        codeHelp.classList.remove('hidden');
        showMessage(`Food with code "${code}" is already added.`, 'error');
        // Clear the input field
        foodCodeInput.value = '';
        return;
    }*/

    // If all checks pass, add the item
    foodItem.foodEntry = foodEntryCount;
    //foodItem.foodEntry = Date.now();  // was testing

    foodEntryCount++;

    //console.log('foodItem add:', foodItem.foodEntry);

    selectedFoods.push(foodItem);
    updateCategories();
    updateSummary();
    saveToLocalStorage();

    //console.log("selected Foods ending: ", selectedFoods);

    // Clear the input field after successful addition
    foodCodeInput.value = '';
    foodCodeInput.classList.remove('error', 'success');
    codeHelp.classList.add('hidden');

    showMessage(`Added: ${foodItem['Item Name']}`, 'success');
}

function removeFood(code) {
    //console.log("Remove food: ", code);
    //selectedFoods = selectedFoods.filter(item => item.code !== code); // Code specific, removed multiple food items
    selectedFoods = selectedFoods.filter(item => item.foodEntry != code);  // https://www.w3schools.com/js/js_comparisons.asp
    updateCategories();
    updateSummary();
    saveToLocalStorage();
    showMessage(`Removed food item.`, 'success');
    //console.log(`Removed food item.`, 'success');

    // Clear any validation state on the input field
    foodCodeInput.classList.remove('error', 'success');
    const codeHelp = document.getElementById('codeHelp');
    codeHelp.classList.add('hidden');
}

function updateCategories() {
    breakfastItems.innerHTML = '';
    lunchItems.innerHTML = '';
    dinnerItems.innerHTML = '';
    dessertItems.innerHTML = '';

    let breakfastCountValue = 0;
    let lunchCountValue = 0;
    let dinnerCountValue = 0;
    let dessertCountValue = 0;

    //console.log("Updating categories: ", selectedFoods);

    selectedFoods.forEach(item => {
        const mealType = String(item['meal type'] || '').toLowerCase();
        const foodElement = createFoodElement(item);

        if (mealType.includes('breakfast')) {
            breakfastItems.appendChild(foodElement);
            breakfastCountValue++;
        } else if (mealType.includes('lunch')) {
            lunchItems.appendChild(foodElement);
            lunchCountValue++;
        } else if (mealType.includes('dinner')) {
            dinnerItems.appendChild(foodElement);
            dinnerCountValue++;
        } else if (mealType.includes('dessert') || mealType.includes('fast')) {
            dessertItems.appendChild(foodElement);
            dessertCountValue++;
        }
    });

    breakfastCount.textContent = `${breakfastCountValue} item${breakfastCountValue !== 1 ? 's' : ''}`;
    lunchCount.textContent = `${lunchCountValue} item${lunchCountValue !== 1 ? 's' : ''}`;
    dinnerCount.textContent = `${dinnerCountValue} item${dinnerCountValue !== 1 ? 's' : ''}`;
    dessertCount.textContent = `${dessertCountValue} item${dessertCountValue !== 1 ? 's' : ''}`;

    //console.log("Updating categories done: ", selectedFoods);
}

function createFoodElement(item) {
    //console.log("Food Item create: ", item.foodEntry);
    const foodDiv = document.createElement('div');
    foodDiv.className = 'food-item';
    foodDiv.setAttribute('role', 'listitem');

    foodDiv.innerHTML = `
                <div class="food-name">${item['Name']}</div>
                <div class="food-code">Reference #: ${item['Reference #']}</div>
                <div class="food-details">
                    <div class="nutrition-row">
                        <span class="nutrition-label">Portion Size:</span>
                        <span class="nutrition-value">${item['Portion Size'] || 'N/A'}</span>
                    </div>
                    <div class="nutrition-row">
                        <span class="nutrition-label">Calories:</span>
                        <span class="nutrition-value">${item.Calories || 0}</span>
                    </div>
                    <div class="nutrition-row">
                        <span class="nutrition-label">Protein:</span>
                        <span class="nutrition-value">${item['Protein (g)'] || 0}g (${item['Protein (%DV)'] || 0})</span>
                    </div>
                    <div class="nutrition-row">
                        <span class="nutrition-label">Sodium:</span>
                        <span class="nutrition-value">${item['Sodium (mg)'] || 0}mg (${item['Sodium (%DV)'] || 0})</span>
                    </div>
                    <div class="nutrition-row">
                        <span class="nutrition-label">Fats:</span>
                        <span class="nutrition-value">${item['Fats (g)'] || 0}g (${item['Fats (%DV)'] || 0})</span>
                    </div>
                    <div class="nutrition-row">
                        <span class="nutrition-label">Carbs:</span>
                        <span class="nutrition-value">${item['Carbohydrates (g)'] || 0}g (${item['Carbohydrates (%DV)'] || 0})</span>
                    </div>
                    <div class="nutrition-row">
                        <span class="nutrition-label">Fiber:</span>
                        <span class="nutrition-value">${item['Fiber (g)'] || 0}g (${item['Fiber (%DV)'] || 0})</span>
                    </div>
                    <div class="nutrition-row">
                        <span class="nutrition-label">Cholesterol:</span>
                        <span class="nutrition-value">${item['Cholesterol (mg)'] || 0}mg (${item['Cholesterol (%DV)'] || 0})</span>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFood('${item.foodEntry}')" aria-label="Remove ${item['Item Name']}">Remove</button>
            `;

    return foodDiv;  // prior removeFood was item.code, is now foodEntry
}

function updateSummary() {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    let sodium = 0;
    let fiber = 0;

    //console.log("Updating summary: ", selectedFoods);

    selectedFoods.forEach(item => {
        calories += item.Calories || 0;
        protein += item['Protein (g)'] || 0;
        carbs += item['Carbohydrates (g)'] || 0;
        fats += item['Fats (g)'] || 0;
        sodium += item['Sodium (mg)'] || 0;
        fiber += item['Fiber (g)'] || 0;
    });

    // Update summary cards
    totalCalories.textContent = calories;
    totalProtein.textContent = protein.toFixed(1);
    totalCarbs.textContent = carbs.toFixed(1);
    totalFats.textContent = fats.toFixed(1);
    totalSodium.textContent = sodium;
    totalFiber.textContent = fiber.toFixed(1);

    // Update progress table
    updateProgressTable(calories, protein, carbs, fiber, sodium);

    // Update health score
    updatePointsDisplay(protein, carbs, fiber, sodium);

    //console.log("Updating summary done: ", selectedFoods);
}

function updateProgressTable(calories, protein, carbs, fiber, sodium) {
    if (!userRequirements) return;

    // Update progress values
    progressCalories.textContent = `${calories} kcal`;
    progressProtein.textContent = `${protein.toFixed(1)}g`;
    progressCarbs.textContent = `${carbs.toFixed(1)}g`;
    progressFiber.textContent = `${fiber.toFixed(1)}g`;
    progressSodium.textContent = `${sodium}mg`;

    // Update goal values
    goalCalories.textContent = `${userRequirements.calories.min.toLocaleString()}-${userRequirements.calories.max.toLocaleString()} kcal`;
    goalProtein.textContent = `${userRequirements.protein}g`;
    goalCarbs.textContent = `${userRequirements.carbs.min}-${userRequirements.carbs.max}g`;
    goalFiber.textContent = `${userRequirements.fiber}g`;
    goalSodium.textContent = `${userRequirements.sodium.toLocaleString()}mg`;

    // Update progress bars and status
    updateProgressBar(caloriesProgress, caloriesStatus, calories, userRequirements.calories.max, 'calories');
    updateProgressBar(proteinProgress, proteinStatus, protein, userRequirements.protein, 'positive');
    updateProgressBar(carbsProgress, carbsStatus, carbs, userRequirements.carbs.max, 'positive');
    updateProgressBar(fiberProgress, fiberStatus, fiber, userRequirements.fiber, 'positive');
    updateProgressBar(sodiumProgress, sodiumStatus, sodium, userRequirements.sodium, 'negative');
}

function updateProgressBar(progressElement, statusElement, current, target, type) {
    let percentage;
    let status;

    if (type === 'calories') {
        // For calories, we have a range
        const min = userRequirements.calories.min;
        const max = userRequirements.calories.max;

        if (current < min) {
            percentage = (current / min) * 50;
            status = 'Too Low';
            progressElement.className = 'progress-fill progress-warning';
            statusElement.className = 'status-warning';
        } else if (current > max) {
            percentage = 100;
            status = 'Too High';
            progressElement.className = 'progress-fill progress-danger';
            statusElement.className = 'status-danger';
        } else {
            // Scale from 50% to 100% within the target range
            percentage = 50 + ((current - min) / (max - min)) * 50;
            status = 'Optimal';
            progressElement.className = 'progress-fill progress-optimal';
            statusElement.className = 'status-optimal';
        }
    } else if (type === 'positive') {
        // For nutrients where more is better (up to a point)
        percentage = Math.min(100, (current / target) * 100);
        if (percentage >= 80) {
            status = 'Optimal';
            progressElement.className = 'progress-fill progress-optimal';
            statusElement.className = 'status-optimal';
        } else if (percentage >= 50) {
            status = 'Good';
            progressElement.className = 'progress-fill progress-warning';
            statusElement.className = 'status-warning';
        } else {
            status = 'Low';
            progressElement.className = 'progress-fill progress-danger';
            statusElement.className = 'status-danger';
        }
    } else {
        // For nutrients where less is better
        percentage = Math.min(100, (current / target) * 100);
        if (percentage <= 80) {
            status = 'Optimal';
            progressElement.className = 'progress-fill progress-optimal';
            statusElement.className = 'status-optimal';
        } else if (percentage <= 100) {
            status = 'High';
            progressElement.className = 'progress-fill progress-warning';
            statusElement.className = 'status-warning';
        } else {
            status = 'Too High';
            progressElement.className = 'progress-fill progress-danger';
            statusElement.className = 'status-danger';
        }
    }

    progressElement.style.width = `${percentage}%`;
    statusElement.textContent = status;
}

function updatePointsDisplay(protein, carbs, fiber, sodium) {
    if (!userRequirements) return;

    const proteinScoreValue = calculateProteinScore(protein);
    const carbsScoreValue = calculateCarbsScore(carbs);
    const fiberScoreValue = calculateFiberScore(fiber);
    const sodiumScoreValue = calculateSodiumScore(sodium);

    const totalScore = Math.max(0, Math.min(100,
        50 + proteinScoreValue + carbsScoreValue + fiberScoreValue +
        sodiumScoreValue
    ));

    pointsCircle.textContent = Math.round(totalScore);
    pointsCircle.setAttribute('aria-label', `Health Score: ${Math.round(totalScore)} out of 100`);

    if (totalScore >= 80) {
        pointsCircle.style.background = '#2ecc71';
    } else if (totalScore >= 60) {
        pointsCircle.style.background = '#f39c12';
    } else {
        pointsCircle.style.background = '#e74c3c';
    }

    updateBar(proteinBar, proteinScore, proteinScoreValue, 10);
    updateBar(carbsBar, carbsScore, carbsScoreValue, 10);
    updateBar(fiberBar, fiberScore, fiberScoreValue, 15);
    updateBar(sodiumBar, sodiumScore, sodiumScoreValue, -15);
}

function updateBar(barElement, scoreElement, scoreValue, maxScore) {
    const percentage = Math.min(100, Math.abs(scoreValue) / Math.abs(maxScore) * 100);
    barElement.style.width = `${percentage}%`;

    scoreElement.textContent = scoreValue > 0 ? `+${scoreValue}` : scoreValue;

    if (scoreValue > 0) {
        barElement.className = 'points-bar positive';
    } else if (scoreValue < 0) {
        barElement.className = 'points-bar negative';
    } else {
        barElement.className = 'points-bar neutral';
    }
}

function calculateProteinScore(protein) {
    const percent = (protein / userRequirements.protein) * 100;
    if (percent <= 100) {
        return Math.round((percent / 100) * 10);
    } else {
        return 10 - Math.round(((percent - 100) / 100) * 5);
    }
}

function calculateCarbsScore(carbs) {
    const percent = (carbs / userRequirements.carbs.max) * 100;
    if (percent <= 100) {
        return Math.round((percent / 100) * 10);
    } else {
        return 10 - Math.round(((percent - 100) / 100) * 15);
    }
}

function calculateFiberScore(fiber) {
    const percent = (fiber / userRequirements.fiber) * 100;
    if (percent <= 100) {
        return Math.round((percent / 100) * 10);
    } else {
        return 10 + Math.round(((percent - 100) / 100) * 5);
    }
}

function calculateSodiumScore(sodium) {
    const percent = (sodium / userRequirements.sodium) * 100;
    if (percent <= 100) {
        return 0;
    } else {
        return -Math.round(((percent - 100) / 100) * 15);
    }
}

function updateTable() {
    tableBody.innerHTML = '';

    nutritionData.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
                    <td>${item['Reference #'] || 'N/A'}</td>
                    <td>${item['Item'] || 'N/A'}</td>
                    <td>${item['Portion Size'] || 'N/A'}</td>
                    <td>${item.Calories || 0}</td>
                    <td>${item['Protein (g)'] || 0}</td>
                    <td>${item['Protein (%DV)'] || 'N/A'}</td>
                    <td>${item['Sodium (mg)'] || 0}</td>
                    <td>${item['Sodium (%DV)'] || 'N/A'}</td>
                    <td>${item['Fats (g)'] || 0}</td>
                    <td>${item['Fats (%DV)'] || 'N/A'}</td>
                    <td>${item['Carbohydrates (g)'] || 0}</td>
                    <td>${item['Carbohydrates (%DV)'] || 'N/A'}</td>
                    <td>${item['Fiber (g)'] || 0}</td>
                    <td>${item['Fiber (%DV)'] || 'N/A'}</td>
                    <td>${item['Cholesterol (mg)'] || 0}</td>
                    <td>${item['Cholesterol (%DV)'] || 'N/A'}</td>
                    <td>${item['Saturated Fat (g)'] || 0}</td>
                    <td>${item['Saturated Fat (%DV)'] || 'N/A'}</td>
                    <td>${item['Trans Fat (g)'] || 0}</td>
                    <td>${item['Trans Fat (%DV)'] || 'N/A'}</td>
                    <td>${item['Total Sugars (g)'] || 0}</td>
                    <td>${item['Total Sugars (%DV)'] || 'N/A'}</td>
                    <td><span class="meal-type ${getMealTypeClass(item['meal type'])}">${item['meal type'] || 'N/A'}</span></td>
                `;

        tableBody.appendChild(row);
    });
}

function getMealTypeClass(mealType) {
    if (!mealType) return '';
    const type = String(mealType).toLowerCase();
    if (type.includes('breakfast')) return 'breakfast';
    if (type.includes('lunch')) return 'lunch';
    if (type.includes('dinner')) return 'dinner';
    if (type.includes('dessert') || type.includes('fast')) return 'dessert';
    return '';
}

function toggleTable() {
    tableVisible = !tableVisible;
    tableContainer.style.display = tableVisible ? 'block' : 'none';
    toggleTableBtn.textContent = tableVisible ? '📋 Hide Data Table' : '📋 Show Data Table';
    toggleTableBtn.setAttribute('aria-expanded', tableVisible);
}

function resetCsv() {
    nutritionData = [];
    selectedFoods = [];
    foodEntryCount = 1;
    csvFileInput.value = '';
    selectedFileName.textContent = 'No file selected';
    tableBody.innerHTML = '';
    updateCategories();
    updateSummary();
    saveToLocalStorage();
    showMessage('CSV data has been reset.', 'success');
}

function resetCategories() {
    selectedFoods = [];
    foodEntryCount = 1;
    updateCategories();
    updateSummary();
    saveToLocalStorage();
    showMessage('All food items have been removed from categories.', 'success');
}

function saveToLocalStorage() {
    //console.log("Saving to local storage");
    localStorage.setItem('nutritionData', JSON.stringify(nutritionData));
    localStorage.setItem('selectedFoods', JSON.stringify(selectedFoods));
    localStorage.setItem('csvFileName', selectedFileName.textContent);
}

function loadFromLocalStorage() {
    //console.log("Reading from local storage");
    const savedNutritionData = localStorage.getItem('nutritionData');
    const savedSelectedFoods = localStorage.getItem('selectedFoods');
    const savedCsvFileName = localStorage.getItem('csvFileName');

    if (savedNutritionData) {
        //console.log("Restore Nutrition Data");
        nutritionData = JSON.parse(savedNutritionData);
        updateTable();
    }

    if (savedSelectedFoods) {
        //console.log("Restore Selected Foods");
        selectedFoods = JSON.parse(savedSelectedFoods);
        updateCategories();
        updateSummary();
        console.log("Selected Foods now: ", selectedFoods);
    }

    if (savedCsvFileName && savedCsvFileName !== 'No file selected') {
        //console.log("Restore CSV");
        selectedFileName.textContent = savedCsvFileName;
    }
}

function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.classList.remove('hidden');

    // Announce to screen readers
    messageDiv.setAttribute('aria-live', 'polite');

    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 3000);
}