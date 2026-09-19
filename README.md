# LinkedIn Sent Invitation Cleaner 🧹🤖

A lightweight, production-ready vanilla JavaScript script designed to run directly in your browser console to clean up clutter from your LinkedIn sent invitations list. 

Built with a **discovery-first approach**, step-by-step modal verification, and human-like randomized jitter.

---

> ⚠️ **CRITICAL DISCLAIMER & RISK WARNING:**
> 1. **Educational Use Only:** This script is shared strictly as an educational proof-of-concept to demonstrate DOM manipulation, asynchronous JavaScript execution, and frontend debugging techniques.
> 2. **Terms of Service Violation:** Automating interactions on social platforms like LinkedIn violates their User Agreement (Section 8.2 regarding bots, scraping, and unauthorized automated tools).
> 3. **Account Ban Risk:** Running automated scripts—even with safety delays—can trigger LinkedIn's anomaly detection algorithms. If flagged, you risk temporary account restrictions, security captchas, or permanent bans. 
> 4. **Use at Your Own Risk:** The author assumes zero liability for any restrictions or bans placed on your account. Always use responsibly in small batches.

---

## 🤔 Why This Exists
LinkedIn allows you to send connection requests easily, but cleaning up old, ignored requests is a tedious manual chore. Because LinkedIn intentionally lacks a "Select All" or bulk-withdraw button for sent invitations, this project explores how a simple frontend script can solve the friction using standard web developer tools.

---

## ✨ Key Features
* **Discovery-First Scanning:** Automatically scans the DOM, parses text lines, and groups your invitations by distinct timestamp categories (e.g., *Sent 3 weeks ago*, *Sent 4 months ago*).
* **Interactive Prompt:** Prompts you right in the browser window so you can specify exactly which category you want to target before any action is taken.
* **Two-Step Modal Handling:** Safely handles LinkedIn's dynamic two-step workflow (clicking the card's withdraw button, waiting for the pop-up modal, and clicking the final confirmation).
* **Randomized Jitter Delays:** Avoids robotic, linear pacing by injecting randomized time buffers between clicks and modal waits to mimic human interaction.
* **Granular Step-by-Step Logging:** Clear, color-coded console logs trace every phase of execution, making it easy to debug if LinkedIn updates its frontend code.

---

## 🚀 How to Use It

1. Navigate to your LinkedIn **My Network -> Manage Invitations -> Sent** page: [linkedin.com/mynetwork/invitation-manager/sent/](https://www.linkedin.com/mynetwork/invitation-manager/sent/)
2. Open your browser's Developer Console:
   * **Mac:** `Cmd + Option + J` (Chrome) or `Cmd + Option + C` (Safari)
   * **Windows/Linux:** `Ctrl + Shift + J` (Chrome/Edge) or `Ctrl + Shift + K` (Firefox)
3. Copy the code from `linkedin-withdraw.js`.
4. Paste it into the console and press **Enter**.
5. Follow the browser prompt to type the exact timestamp category you want to clean up (e.g., `sent 3 weeks ago`).
6. Watch the live console logs as it processes your requests safely with built-in buffers.

---

## 🛠️ The Technical Journey: How We Built It
If you are following along or learning frontend automation, here is a quick breakdown of how the selectors and logic were mapped:

1. **Isolating Cards:** LinkedIn renders invitation lists inside repeating container elements identified via `div[role="listitem"]`.
2. **Text Parsing:** Since raw DOM nodes change class names frequently due to obfuscated CSS modules, the script extracts `card.innerText`, splits it by lines, and isolates the first line as the **Profile Name** and the line containing `"sent"` as the **Timestamp Category**.
3. **Handling the Asynchronous Modal:** Clicking the initial card withdraw button triggers a React-rendered pop-up modal. The script uses a safe jittered buffer (`3s - 5s`) to ensure the DOM has time to render the modal, then locates the final confirmation button using its unique `aria-label` pattern (`button[aria-label^="Withdraw invitation sent to"]`).

---

## ⚙️ Customization (`CONFIG`)
You can tweak safety parameters at the very top of the script before running it:

```javascript
const CONFIG = {
    CARD_SELECTOR: 'div[role="listitem"]',
    MODAL_WAIT_MIN_MS: 3000,       // Minimum modal load wait
    MODAL_WAIT_MAX_MS: 5000,       // Maximum modal load wait
    BETWEEN_PROFILES_MIN_MS: 4000, // Min pause between profiles
    BETWEEN_PROFILES_MAX_MS: 7000, // Max pause between profiles
    DEFAULT_TARGET_TIMESTAMP: 'sent 3 weeks ago'
};
