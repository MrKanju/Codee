// ==========================
// 🚀 EXTENSION START
// ==========================
console.log("🚀 Extension Loaded");


// ==========================
// 🧠 STATE TRACKING
// ==========================
let hintLevel = 0;
let lastCode = "";


// ==========================
// 🧠 GET CURRENT CODE
// ==========================
function getCurrentCode() {
    let code = "";

    const editor = document.querySelector('.monaco-editor');
    if (editor) {
        const lines = editor.querySelectorAll('.view-line');
        code = Array.from(lines)
            .map(line => line.innerText)
            .join("\n");
    }

    return code || "";
}


// ==========================
// 🧠 GET PROBLEM DATA
// ==========================
function getProblemData() {
    const titleElement = document.querySelector('div.text-title-large');
    const descriptionElement = document.querySelector('[data-track-load="description_content"]');

    return {
        title: titleElement ? titleElement.innerText : "",
        description: descriptionElement ? descriptionElement.innerText : ""
    };
}


// ==========================
// 🧠 PROBLEM TYPE DETECTION
// ==========================
function getProblemType(title, description) {
    const text = (title + " " + description).toLowerCase();

    if (text.includes("two sum") || text.includes("pair")) return "two_sum";
    if (text.includes("substring") || text.includes("window")) return "sliding_window";
    if (text.includes("sorted")) return "two_pointer";
    if (text.includes("tree")) return "tree";
    if (text.includes("graph") || text.includes("node")) return "graph";
    if (text.includes("backtracking") || text.includes("recursion")) return "recursion";

    return "general";
}


// ==========================
// 🧠 STATE DETECTION
// ==========================
function detectState(code, problemType) {

    if ((code.match(/for/g) || []).length >= 2) return "brute";

    if (code.includes("HashMap") || code.includes("map")) return "hashmap";

    if (problemType === "sliding_window" && code.includes("left") && code.includes("right")) {
        return "optimal";
    }

    if (problemType === "two_pointer" && code.includes("left") && code.includes("right")) {
        return "optimal";
    }

    return "unknown";
}


// ==========================
// 🧠 RULE-BASED HINT ENGINE
// ==========================
function generateHint(code, level) {

    const { title, description } = getProblemData();
    const problemType = getProblemType(title, description);
    const state = detectState(code, problemType);

    if (!code || code.trim().length === 0) {
        return "Start by identifying the pattern in this problem.";
    }

    // TWO SUM
    if (problemType === "two_sum") {

        if (state === "brute") {
            if (level === 1) return "You are checking all pairs. Can this be optimized?";
            if (level === 2) return "Think about storing seen values.";
            return "Use a HashMap to check complement in O(n).";
        }

        if (state === "hashmap") {
            return "Good approach! Check complement before inserting.";
        }
    }

    // SLIDING WINDOW
    if (problemType === "sliding_window") {

        if (state === "optimal") {
            if (level === 1) return "Your sliding window approach looks correct.";
            if (level === 2) return "Ensure proper updates when duplicates occur.";
            if (level === 3) return "Check edge cases carefully.";
            return "Can you explain why this is O(n)?";
        }

        if (state === "brute") {
            return "Try avoiding recalculations. Can you maintain a window?";
        }

        return "AI_FALLBACK";
    }

    // GENERAL
    if (state === "brute") {
        if (level === 1) return "This might be brute force.";
        if (level === 2) return "Can you reduce nested loops?";
        return "Use better data structures.";
    }

    return "AI_FALLBACK"; // 🔥 IMPORTANT FLAG
}


// ==========================
// 🎨 UI CREATION
// ==========================
function createUI() {
    const container = document.createElement("div");
    container.id = "ai-helper";

    container.innerHTML = `
        <div id="ai-header">🤖</div>
        <div id="ai-panel" class="hidden">
            <div id="ai-title">AI Helper</div>
            <button id="hint-btn">Get Hint</button>
            <div id="hint-output"></div>
        </div>
    `;

    document.body.appendChild(container);

    document.getElementById("ai-header").onclick = () => {
        document.getElementById("ai-panel").classList.toggle("hidden");
    };

    document.getElementById("hint-btn").addEventListener("click", handleHintClick);

    makeDraggable(container);
}


// ==========================
// 🧠 MAIN LOGIC (HYBRID)
// ==========================
async function handleHintClick() {

    const code = getCurrentCode();
    const { title, description } = getProblemData();

    if (code !== lastCode) {
        hintLevel = 0;
        lastCode = code;
    }

    hintLevel++;

    const output = document.getElementById("hint-output");

    // BEFORE CODING
    if (!code || code.trim().length === 0) {
        output.innerText = "Start by identifying the pattern.";
        return;
    }

    // SHOW LOADING
    output.innerText = "⚡ Thinking...";

    try {
        const response = await fetch("https://codee-backend-nhux.onrender.com/hint", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                code,
                hint_level: hintLevel
            })
        });

        const data = await response.json();

        console.log("API RESPONSE:", data);

        const hintText = data.hint || "No hint received";
        const nextStepText = data.next_step || "";

        output.innerHTML = `
            <b>💡 Hint:</b> ${hintText}<br><br>
            <b>➡️ Next Step:</b> ${nextStepText}
        `;

    } catch (error) {
        console.log("ERROR:", error);
        output.innerText = "⚠️ Backend error / timeout";
    }
}

// ==========================
// 🎨 STYLES
// ==========================
const style = document.createElement("style");
style.innerHTML = `
#ai-helper {
    position: fixed;
    top: 120px;
    right: 20px;
    z-index: 9999;
    font-family: Arial;
}

#ai-header {
    background: #4CAF50;
    color: white;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    width: 40px;
    height: 40px;
    text-align: center;
}

#ai-panel {
    margin-top: 8px;
    width: 230px;
    background: #1e1e1e;
    color: white;
    padding: 10px;
    border-radius: 10px;
}

.hidden {
    display: none;
}

#hint-btn {
    width: 100%;
    padding: 8px;
    background: #4CAF50;
    border: none;
    color: white;
    cursor: pointer;
}

#hint-output {
    margin-top: 10px;
    font-size: 12px;
}
`;
document.head.appendChild(style);


// ==========================
// 🖱️ DRAG FUNCTION
// ==========================
function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - element.offsetLeft;
        offsetY = e.clientY - element.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            element.style.left = e.clientX - offsetX + "px";
            element.style.top = e.clientY - offsetY + "px";
            element.style.right = "auto";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
}


// ==========================
// 🚀 INIT
// ==========================
setTimeout(createUI, 4000);