/* ============================================
   FULIZA BOOST - APPLICATION JAVASCRIPT
   ============================================ */

// DOM Elements
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const feeBox = document.getElementById("feeBox");
const liveBox = document.getElementById("liveBox");
const activityBar = document.getElementById("activityBar");
const payBtn = document.getElementById("payBtn");
const statusContainer = document.getElementById("status");

// State Management
let appState = {
    clientName: "",
    clientPhone: "",
    selectedAmount: 0,
    processingFee: 0
};

// Configuration
const CONFIG = {
    MIN_AMOUNT: 500,
    MAX_AMOUNT: 15000,
    PAYBILL: "247247",
    ACCOUNT: "1100185777880",
    FEE_THRESHOLD: 7000,
    FEE_RATE_LOW: 0.2,      // 20% for amounts <= 7000
    FEE_RATE_HIGH: 0.1      // 10% for amounts > 7000
};

// Available amounts
const AMOUNTS = [500, 1000, 2000, 3000, 4000, 5000, 7000, 9000, 10000, 12000, 15000];

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (07XXXXXXXX)
 */
function isValidPhoneNumber(phone) {
    return /^07\d{8}$/.test(phone);
}

/**
 * Calculate processing fee based on amount
 */
function calculateFee(amount) {
    if (amount <= CONFIG.FEE_THRESHOLD) {
        return Math.round(amount * CONFIG.FEE_RATE_LOW);
    }
    return Math.round(amount * CONFIG.FEE_RATE_HIGH);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return "KES " + amount.toLocaleString();
}

/**
 * Show error message
 */
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = "block";
    }
}

/**
 * Clear error message
 */
function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = "";
        element.style.display = "none";
    }
}

/**
 * Log activity
 */
function logActivity(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

/**
 * Show/hide steps with animation
 */
function showStep(currentStep, nextStep) {
    if (!currentStep || !nextStep) {
        console.error("Invalid step elements");
        return;
    }
    
    currentStep.classList.add("hidden");
    setTimeout(() => {
        nextStep.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
}

/**
 * Proceed to Step 2 - Amount Selection
 */
function goStep2() {
    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // Clear previous errors
    clearError("phoneError");

    // Validation
    if (!fullName) {
        alert("Please enter your full name");
        return;
    }

    if (fullName.length < 3) {
        alert("Full name must be at least 3 characters");
        return;
    }

    if (!phone) {
        alert("Please enter your phone number");
        return;
    }

    if (!isValidPhoneNumber(phone)) {
        showError("phoneError", "Invalid phone format. Use 07XXXXXXXX");
        return;
    }

    // Update state
    appState.clientName = fullName;
    appState.clientPhone = phone;

    logActivity(`Client registered: ${fullName} (${phone})`);
    showStep(step1, step2);
}

/**
 * Go back to Step 1
 */
function backTo1() {
    appState.selectedAmount = 0;
    appState.processingFee = 0;
    payBtn.disabled = true;
    document.querySelectorAll(".amount-box").forEach(b => b.classList.remove("selected"));
    showStep(step2, step1);
}

/**
 * Proceed to Step 3 - Payment Confirmation
 */
function goStep3() {
    if (!appState.selectedAmount) {
        alert("Please select an amount first");
        return;
    }

    const totalAmount = appState.selectedAmount + appState.processingFee;
    document.getElementById("summaryBox").innerHTML = `
        <strong>Boost Amount:</strong> ${formatCurrency(appState.selectedAmount)}<br>
        <strong>Processing Fee:</strong> ${formatCurrency(appState.processingFee)}<br>
        <strong style=\\"color: #d32f2f;\\\">Total to Pay:</strong> ${formatCurrency(totalAmount)}
    `;

    logActivity(`Amount selected: KES ${appState.selectedAmount}`);
    showStep(step2, step3);
}

/**
 * Go back to Step 2
 */
function backTo2() {
    showStep(step3, step2);
}

// ============================================
// AMOUNT SELECTION
// ============================================

/**
 * Initialize amount selection boxes
 */
function initializeAmountBoxes() {
    const container = document.getElementById("amountContainer");
    container.innerHTML = ""; // Clear existing

    AMOUNTS.forEach(amount => {
        const box = document.createElement("div");
        box.className = "amount-box";
        box.textContent = formatCurrency(amount);
        box.setAttribute("role", "button");
        box.setAttribute("tabindex", "0");
        box.onclick = () => selectAmount(amount, box);
        box.onkeypress = (e) => {
            if (e.key === "Enter" || e.key === " ") {
                selectAmount(amount, box);
            }
        };
        container.appendChild(box);
    });
}

/**
 * Select amount and calculate fee
 */
function selectAmount(amount, element) {
    // Validate amount
    if (amount < CONFIG.MIN_AMOUNT || amount > CONFIG.MAX_AMOUNT) {
        alert(`Amount must be between ${CONFIG.MIN_AMOUNT} and ${CONFIG.MAX_AMOUNT}`);
        return;
    }

    appState.selectedAmount = amount;
    appState.processingFee = calculateFee(amount);

    // Update UI
    document.querySelectorAll(".amount-box").forEach(box => {
        box.classList.remove("selected");
    });
    element.classList.add("selected");

    // Update fee display
    document.getElementById("feeAmount").textContent = appState.processingFee;

    // Enable proceed button
    payBtn.disabled = false;

    logActivity(`Amount selected: ${formatCurrency(amount)}, Fee: ${formatCurrency(appState.processingFee)}`);
}

// ============================================
// PAYMENT SUBMISSION
// ============================================

/**
 * Submit payment confirmation
 */
function submitPayment() {
    const mpesaConfirmation = document.getElementById("mpesaConfirmation").value.trim();

    // Clear previous errors
    clearError("mpesaError");

    // Validation
    if (!mpesaConfirmation) {
        showError("mpesaError", "Please paste your M-PESA confirmation message");
        return;
    }

    if (mpesaConfirmation.length < 10) {
        showError("mpesaError", "Confirmation message seems incomplete");
        return;
    }

    // Show processing state
    showProcessingState();

    logActivity(`Payment submission initiated for ${appState.clientPhone}`);

    // Simulate API call
    simulatePaymentProcessing(mpesaConfirmation);
}

/**
 * Show loading/processing state
 */
function showProcessingState() {
    statusContainer.innerHTML = `
        <div class="spinner"></div>
        <p style=\"text-align: center; color: #666;\">Processing your payment...</p>
    `;
}

/**
 * Simulate payment processing (Replace with actual API call)
 */
function simulatePaymentProcessing(mpesaConfirmation) {
    setTimeout(() => {
        const isSuccess = Math.random() > 0.1; // 90% success rate for demo

        if (isSuccess) {
            showSuccessState();
            logActivity(`Payment verified successfully for ${appState.clientPhone}`);
            resetForm();
        } else {
            showErrorState();
            logActivity(`Payment verification failed for ${appState.clientPhone}`);
        }
    }, 3000);
}

/**
 * Show success state
 */
function showSuccessState() {
    statusContainer.innerHTML = `
        <div class="success-message">
            <h4>✅ Payment Verified Successfully!</h4>
            <p>Your boost is being processed.</p>
            <p><strong>Reference:</strong> #${generateReference()}</p>
            <p style=\"font-size: 12px; color: #666;\">You will receive a confirmation SMS shortly.</p>
        </div>
    `;
}

/**
 * Show error state
 */
function showErrorState() {
    statusContainer.innerHTML = `
        <div class="error-message">
            <h4>❌ Verification Failed</h4>
            <p>Unable to verify your payment. Please check:</p>
            <ul style=\"text-align: left;\">
                <li>M-PESA confirmation message is complete</li>
                <li>PayBill number is correct (247247)</li>
                <li>Account number matches (1100185777880)</li>
            </ul>
            <button class="btn-primary" onclick=\"backTo3()\">Try Again</button>
        </div>
    `;
}

/**
 * Go back to step 3
 */
function backTo3() {
    statusContainer.innerHTML = "";
    document.getElementById("mpesaConfirmation").value = "";
}

/**
 * Generate reference number
 */
function generateReference() {
    return "FB" + Date.now().toString().slice(-8);
}

/**
 * Reset form for new transaction
 */
function resetForm() {
    setTimeout(() => {
        // Reset state
        appState = {
            clientName: "",
            clientPhone: "",
            selectedAmount: 0,
            processingFee: 0
        };

        // Clear inputs
        document.getElementById("fullName").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("mpesaConfirmation").value = "";

        // Reset UI
        document.querySelectorAll(".amount-box").forEach(box => box.classList.remove("selected"));
        payBtn.disabled = true;
        statusContainer.innerHTML = "";

        // Return to step 1
        step3.classList.add("hidden");
        setTimeout(() => {
            step1.classList.remove("hidden");
        }, 100);

        logActivity("Form reset for new transaction");
    }, 3000);
}

// ============================================
// LIVE TRANSACTIONS FEED
// ============================================

/**
 * Generate random phone number (masked)
 */
function generateRandomPhone() {
    return "07****" + Math.floor(100 + Math.random() * 900);
}

/**
 * Generate random amount from AMOUNTS array
 */
function generateRandomAmount() {
    return AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)];
}

/**
 * Add live transaction to feed
 */
function addLiveTransaction() {
    const item = document.createElement("div");
    item.className = "live-item";
    
    const amount = generateRandomAmount();
    const phone = generateRandomPhone();
    
    item.innerHTML = `
        <span class="live-phone">${phone}</span>
        <span class="amount">${formatCurrency(amount)}</span>
        <span class="processing">⏳ Processing</span>
    `;

    liveBox.prepend(item);

    // Remove placeholder if it exists
    const placeholder = liveBox.querySelector(".live-placeholder");
    if (placeholder) {
        placeholder.remove();
    }

    // Keep only last 15 transactions
    if (liveBox.children.length > 15) {
        liveBox.removeChild(liveBox.lastChild);
    }

    // Update activity bar
    activityBar.textContent = "🔔 New Boost Request Incoming... (" + new Date().toLocaleTimeString() + ")";
    
    logActivity(`Live transaction added: ${phone} - ${formatCurrency(amount)}`);
}

/**
 * Initialize live transaction feed
 */
function initializeLiveTransactionsFeed() {
    setInterval(addLiveTransaction, 4000);
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize application
 */
function initializeApp() {
    logActivity("Initializing Fuliza Boost Dashboard");
    
    // Initialize amount boxes
    initializeAmountBoxes();
    
    // Initialize live transactions feed
    initializeLiveTransactionsFeed();
    
    // Add event listeners for phone validation
    const phoneInput = document.getElementById("phone");
    phoneInput.addEventListener("blur", function() {
        if (this.value && !isValidPhoneNumber(this.value)) {
            showError("phoneError", "Invalid phone format. Use 07XXXXXXXX");
        } else {
            clearError("phoneError");
        }
    });

    logActivity("Dashboard initialized successfully");
}

// Run initialization when DOM is loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}

// ============================================
// LOGGING & DEBUG
// ============================================

logActivity("Fuliza Boost JavaScript loaded");