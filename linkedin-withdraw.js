/**
 * ============================================================================
 * LinkedIn Invitation Withdrawer (Production Edition with Safety Jitter)
 * ============================================================================
 * 
 * ⚠️ CRITICAL DISCLAIMER & RISK WARNING:
 * 1. Educational Use Only: This script is a proof-of-concept designed to demonstrate 
 *    DOM manipulation, asynchronous JavaScript execution, and frontend debugging.
 * 2. Terms of Service Violation: Automating interactions on social platforms like 
 *    LinkedIn strictly violates their User Agreement (Section 8.2 regarding scraping, 
 *    bots, and unauthorized automated tools).
 * 3. Account Ban Risk: Running automated scripts—even with safety delays—can trigger 
 *    LinkedIn's anomaly detection algorithms. If flagged, you risk temporary account 
 *    restrictions, security captchas, or permanent bans. 
 * 4. Use at Your Own Risk: The author assumes zero liability for any restrictions 
 *    or bans placed on your account. Always use responsibly in small batches.
 * ============================================================================
 */

(function () {
    'use strict';

    // ==========================================================
    // 1. CONFIGURATION & TUNING VARIABLES
    // ==========================================================
    const CONFIG = {
        // DOM Selectors mapped from LinkedIn structure
        CARD_SELECTOR: 'div[role="listitem"]',
        WITHDRAW_BTN_SELECTOR: 'a[aria-label^="Withdraw invitation"], button[aria-label^="Withdraw invitation"]',
        MODAL_CONFIRM_SELECTOR: 'button[aria-label^="Withdraw invitation sent to"]',
        
        // Safety delays (in milliseconds) with human-like jitter ranges
        MODAL_WAIT_MIN_MS: 3000,       // Minimum buffer to wait for the confirmation modal
        MODAL_WAIT_MAX_MS: 5000,       // Maximum buffer for modal rendering
        
        BETWEEN_PROFILES_MIN_MS: 4000, // Minimum delay between profiles to mimic human pace
        BETWEEN_PROFILES_MAX_MS: 7000, // Maximum delay between profiles
        
        // Default fallback if prompt is skipped or canceled
        DEFAULT_TARGET_TIMESTAMP: 'sent 3 weeks ago'
    };

    // Helper to generate random jitter so execution doesn't look like a robotic metronome
    function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ==========================================================
    // 2. HELPER FUNCTIONS: DOM Parsing & Timestamp Extraction
    // ==========================================================
    function getCardDetails(card) {
        const textContent = card.innerText || "";
        const lines = textContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        const profileName = lines.length > 0 ? lines[0] : "Unknown Name";
        const sentLine = lines.find(l => l.toLowerCase().includes('sent')) || "Unknown Time";
        
        return { profileName, sentLine: sentLine.toLowerCase(), originalSentLine: sentLine };
    }

    // ==========================================================
    // 3. PHASE 1: SCANNING & REPORTING DISTINCT TIMESTAMPS
    // ==========================================================
    console.clear();
    console.log(`%c[DEBUG - STEP 1] Scanning DOM for invitation containers using selector: '${CONFIG.CARD_SELECTOR}'`, 'color: #0a66c2; font-weight: bold;');
    console.log(`💡 How we found this: LinkedIn lists invitations inside repeating list items ('div[role="listitem"]').`);

    const cards = document.querySelectorAll(CONFIG.CARD_SELECTOR);
    
    if (cards.length === 0) {
        console.error("❌ CRITICAL ERROR [Step 1: DOM Scan]: No invitation cards found using selector:", CONFIG.CARD_SELECTOR);
        console.log("ℹ️ Ensure you are on the LinkedIn Sent Invitations management page and that items are loaded.");
        return;
    }

    const timestampMap = new Map();
    const allParsedCards = [];

    cards.forEach((card, index) => {
        const { profileName, sentLine, originalSentLine } = getCardDetails(card);
        const withdrawBtn = card.querySelector(CONFIG.WITHDRAW_BTN_SELECTOR);

        allParsedCards.push({ index, profileName, sentLine, originalSentLine, card, withdrawBtn });

        if (!timestampMap.has(originalSentLine)) {
            timestampMap.set(originalSentLine, 0);
        }
        timestampMap.set(originalSentLine, timestampMap.get(originalSentLine) + 1);
    });

    console.log(`%c[DEBUG - STEP 2] Text Parsing & Timestamp Extraction completed across ${cards.length} cards.`, 'color: #0a66c2; font-weight: bold;');
    
    const distinctSummary = Array.from(timestampMap.entries()).map(([timeStr, count]) => ({
        "Timestamp Category": timeStr,
        "Count": count
    }));
    console.table(distinctSummary);

    // ==========================================================
    // 4. PHASE 2: USER PROMPT & SELECTION
    // ==========================================================
    const availableTimestampsList = Array.from(timestampMap.keys()).join('\n - ');
    const userPromptMessage = 
        `Found ${cards.length} total invitations across these categories:\n - ${availableTimestampsList}\n\n` +
        `Type the exact timestamp category you want to withdraw (e.g., 'Sent 3 weeks ago'):`;

    let selectedFilter = prompt(userPromptMessage, CONFIG.DEFAULT_TARGET_TIMESTAMP);

    if (!selectedFilter) {
        console.log("⚠️ Operation cancelled by user.");
        return;
    }

    selectedFilter = selectedFilter.toLowerCase().trim();
    const targets = allParsedCards.filter(item => item.sentLine.includes(selectedFilter) && item.withdrawBtn !== null);

    console.log(`\n%c[DEBUG - STEP 3] Target Filtering: Selected '${selectedFilter}' yielded ${targets.length} valid profiles ready for processing.`, 'color: green; font-weight: bold;');

    if (targets.length === 0) {
        console.warn(`⚠️ No profiles matched your filter '${selectedFilter}' with a valid withdraw button.`);
        return;
    }

    // ==========================================================
    // 5. PHASE 3: SEQUENTIAL BATCH EXECUTION WITH RANDOMIZED JITTER
    // ==========================================================
    let currentIndex = 0;

    function processNextTarget() {
        if (currentIndex >= targets.length) {
            console.log(`\n%c✨ BATCH COMPLETE: Successfully processed all ${targets.length} target invitations!`, 'color: green; font-size: 15px; font-weight: bold;');
            return;
        }

        const item = targets[currentIndex];
        console.log(`\n========================================`);
        console.log(`%c[Profile ${currentIndex + 1} of ${targets.length}] Target: ${item.profileName}`, 'color: purple; font-weight: bold; font-size: 13px;');
        console.log(`• DOM Index : ${item.index}`);
        console.log(`• Timestamp : ${item.originalSentLine}`);

        // --- STEP A: INITIAL CARD WITHDRAW CLICK ---
        console.log(`%c[DEBUG - STEP 4] Initial Button Identification: Located via '${CONFIG.WITHDRAW_BTN_SELECTOR}'`, 'color: #0a66c2;');
        console.log(`🚀 Clicking initial card withdraw button...`);
        
        try {
            item.withdrawBtn.click();
        } catch (err) {
            console.error(`❌ ERROR [Step 1 Click Failed] for ${item.profileName}:`, err);
            moveToNextWithDelay();
            return;
        }

        // --- STEP B: MODAL CONFIRMATION WITH RANDOMIZED BUFFER ---
        const currentModalWait = getRandomDelay(CONFIG.MODAL_WAIT_MIN_MS, CONFIG.MODAL_WAIT_MAX_MS);
        console.log(`⏳ [DEBUG - STEP 5] Waiting ${(currentModalWait / 1000).toFixed(1)}s (jittered) for confirmation modal to render...`);
        
        setTimeout(() => {
            const confirmBtn = document.querySelector(CONFIG.MODAL_CONFIRM_SELECTOR) ||
                               Array.from(document.querySelectorAll('div[role="dialog"] button, div._1957d19a button, div[data-testid="dialog-content"] button'))
                               .find(btn => btn.innerText.trim() === 'Withdraw');

            if (confirmBtn) {
                console.log(`🚀 Modal confirmation button detected. Clicking final 'Withdraw' button...`);
                try {
                    confirmBtn.click();
                    console.log(`✅ Successfully withdrawn invitation for: ${item.profileName}`);
                } catch (err) {
                    console.error(`❌ ERROR [Step 2 Click Failed] for ${item.profileName}:`, err);
                }
            } else {
                console.error(`❌ ERROR [Step 2 Failed] Modal confirmation button could not be located for ${item.profileName}. DOM structure may have shifted.`);
            }

            moveToNextWithDelay();
        }, currentModalWait);
    }

    function moveToNextWithDelay() {
        currentIndex++;
        if (currentIndex < targets.length) {
            const currentProfileDelay = getRandomDelay(CONFIG.BETWEEN_PROFILES_MIN_MS, CONFIG.BETWEEN_PROFILES_MAX_MS);
            console.log(`⏳ Waiting ${(currentProfileDelay / 1000).toFixed(1)}s (jittered) before selecting next profile...`);
            setTimeout(processNextTarget, currentProfileDelay);
        } else {
            processNextTarget(); // Triggers final completion log
        }
    }

    // Kick off execution loop
    processNextTarget();

})();
