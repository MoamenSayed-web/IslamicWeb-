<<<<<<< HEAD
// Using a reliable public JSON for Husn Al Muslim / Azkar
const AZKAR_API =
  "https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json";

const tabs = document.querySelectorAll(".azkar-tab");
const azkarListEl = document.getElementById("azkar-list");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const loading = document.getElementById("loading");

let allAzkarData = {};
let currentCategoryAzkar = [];
let totalCountRequired = 0;
let currentCountCompleted = 0;

const categoryMapping = {
  morning: "أذكار الصباح والمساء",
  evening: "أذكار الصباح والمساء",
  sleep: "أذكار النوم",
  prayer: "أذكار الاستيقاظ من النوم", // Using a valid category from this repo
};

// Play a subtle sound on click (Optional to enhance UI feedback, using a tiny beep if available, or just visual)
function playTickSound() {
  // A very short subtle click oscillator
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // high pitch beep
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.05,
    ); // quick fade
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch (e) {} // Ignore if browser blocks auto-play AudioContext
}

async function fetchAzkar() {
  loading.style.display = "block";
  azkarListEl.innerHTML = "";

  try {
    const response = await fetch(AZKAR_API);
    allAzkarData = await response.json();

    // initialize with morning azkar
    loadCategory("morning");
  } catch (error) {
    console.error("Error fetching Azkar: ", error);
    azkarListEl.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل الأذكار.</p>';
    loading.style.display = "none";
  }
}

function loadCategory(categoryKey) {
  const arabicCategoryName = categoryMapping[categoryKey];

  let azkarArr = [];
  const categoryObj = allAzkarData.find(
    (item) => item.category === arabicCategoryName,
  );

  if (categoryObj && categoryObj.array) {
    azkarArr = categoryObj.array;
  } else if (categoryObj && Array.isArray(categoryObj)) {
    azkarArr = categoryObj;
  }

  currentCategoryAzkar = azkarArr;
  renderAzkar(currentCategoryAzkar);
}

function renderAzkar(azkarArray) {
  azkarListEl.innerHTML = "";
  totalCountRequired = 0;
  currentCountCompleted = 0;

  if (azkarArray.length === 0) {
    azkarListEl.innerHTML =
      '<p style="text-align:center;">لا يوجد بيانات لهذه الفئة حالياً.</p>';
    loading.style.display = "none";
    updateProgress();
    return;
  }

  azkarArray.forEach((zikr, index) => {
    // Zikr string, Fadl(description), Count
    const text = zikr.ARABIC_TEXT || zikr.text || "ذكر غير متوفر";
    // Parse count (sometimes it's string, sometimes int)
    let count = parseInt(zikr.REPEAT) || 1;
    totalCountRequired += count;

    const card = document.createElement("div");
    card.className = "zikr-card fade-in-up";
    card.style.animationDelay = `${(index % 10) * 0.1}s`;
    card.id = `zikr-card-${index}`;

    // Let's create an interactive counter
    card.innerHTML = `
            <div class="zikr-text">${text}</div>
            ${zikr.TRANSLATION ? `<div class="zikr-desc">${zikr.TRANSLATION}</div>` : ""}
            <div class="zikr-counter-area">
                <button class="counter-btn" id="counter-btn-${index}" data-count="${count}" data-current="0">
                    <span id="counter-val-${index}">${count}</span>
                    <span class="counter-label">المرات المتبقية</span>
                </button>
            </div>
        `;

    azkarListEl.appendChild(card);

    // Attach Event Listener to Button
    const btn = document.getElementById(`counter-btn-${index}`);
    btn.addEventListener("click", () => handleZikrClick(btn, card, count));
  });

  updateProgress();
  loading.style.display = "none";
}

function handleZikrClick(btn, card, targetCount) {
  let current = parseInt(btn.getAttribute("data-current"));

  if (current < targetCount) {
    current++;
    btn.setAttribute("data-current", current);

    const remaining = targetCount - current;
    btn.querySelector("span").textContent = remaining;

    playTickSound();

    // Global progress
    currentCountCompleted++;
    updateProgress();

    if (remaining === 0) {
      btn.classList.add("done");
      btn.innerHTML =
        '<i class="fa-solid fa-check"></i><span class="counter-label">تم بإذن الله</span>';
      card.classList.add("completed");
    }
  }
}

function updateProgress() {
  if (totalCountRequired === 0) {
    progressBar.style.width = "0%";
    progressText.textContent = `0% (0 / 0)`;
    return;
  }

  const percentage = Math.round(
    (currentCountCompleted / totalCountRequired) * 100,
  );
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}% (${currentCountCompleted} / ${totalCountRequired})`;

  if (percentage === 100) {
    progressText.innerHTML = `${percentage}% <i class="fa-solid fa-trophy" style="color:var(--accent-gold)"></i> اكتمل الورد!`;
  }
}

// Tabs Event Listeners
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const category = tab.getAttribute("data-category");
    loadCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Init
document.addEventListener("DOMContentLoaded", fetchAzkar);
=======
// Using a reliable public JSON for Husn Al Muslim / Azkar
const AZKAR_API =
  "https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json";

const tabs = document.querySelectorAll(".azkar-tab");
const azkarListEl = document.getElementById("azkar-list");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const loading = document.getElementById("loading");

let allAzkarData = {};
let currentCategoryAzkar = [];
let totalCountRequired = 0;
let currentCountCompleted = 0;

const categoryMapping = {
  morning: "أذكار الصباح والمساء",
  evening: "أذكار الصباح والمساء",
  sleep: "أذكار النوم",
  prayer: "أذكار الاستيقاظ من النوم", // Using a valid category from this repo
};

// Play a subtle sound on click (Optional to enhance UI feedback, using a tiny beep if available, or just visual)
function playTickSound() {
  // A very short subtle click oscillator
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // high pitch beep
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.05,
    ); // quick fade
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch (e) {} // Ignore if browser blocks auto-play AudioContext
}

async function fetchAzkar() {
  loading.style.display = "block";
  azkarListEl.innerHTML = "";

  try {
    const response = await fetch(AZKAR_API);
    allAzkarData = await response.json();

    // initialize with morning azkar
    loadCategory("morning");
  } catch (error) {
    console.error("Error fetching Azkar: ", error);
    azkarListEl.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل الأذكار.</p>';
    loading.style.display = "none";
  }
}

function loadCategory(categoryKey) {
  const arabicCategoryName = categoryMapping[categoryKey];

  let azkarArr = [];
  const categoryObj = allAzkarData.find(
    (item) => item.category === arabicCategoryName,
  );

  if (categoryObj && categoryObj.array) {
    azkarArr = categoryObj.array;
  } else if (categoryObj && Array.isArray(categoryObj)) {
    azkarArr = categoryObj;
  }

  currentCategoryAzkar = azkarArr;
  renderAzkar(currentCategoryAzkar);
}

function renderAzkar(azkarArray) {
  azkarListEl.innerHTML = "";
  totalCountRequired = 0;
  currentCountCompleted = 0;

  if (azkarArray.length === 0) {
    azkarListEl.innerHTML =
      '<p style="text-align:center;">لا يوجد بيانات لهذه الفئة حالياً.</p>';
    loading.style.display = "none";
    updateProgress();
    return;
  }

  azkarArray.forEach((zikr, index) => {
    // Zikr string, Fadl(description), Count
    const text = zikr.ARABIC_TEXT || zikr.text || "ذكر غير متوفر";
    // Parse count (sometimes it's string, sometimes int)
    let count = parseInt(zikr.REPEAT) || 1;
    totalCountRequired += count;

    const card = document.createElement("div");
    card.className = "zikr-card fade-in-up";
    card.style.animationDelay = `${(index % 10) * 0.1}s`;
    card.id = `zikr-card-${index}`;

    // Let's create an interactive counter
    card.innerHTML = `
            <div class="zikr-text">${text}</div>
            ${zikr.TRANSLATION ? `<div class="zikr-desc">${zikr.TRANSLATION}</div>` : ""}
            <div class="zikr-counter-area">
                <button class="counter-btn" id="counter-btn-${index}" data-count="${count}" data-current="0">
                    <span id="counter-val-${index}">${count}</span>
                    <span class="counter-label">المرات المتبقية</span>
                </button>
            </div>
        `;

    azkarListEl.appendChild(card);

    // Attach Event Listener to Button
    const btn = document.getElementById(`counter-btn-${index}`);
    btn.addEventListener("click", () => handleZikrClick(btn, card, count));
  });

  updateProgress();
  loading.style.display = "none";
}

function handleZikrClick(btn, card, targetCount) {
  let current = parseInt(btn.getAttribute("data-current"));

  if (current < targetCount) {
    current++;
    btn.setAttribute("data-current", current);

    const remaining = targetCount - current;
    btn.querySelector("span").textContent = remaining;

    playTickSound();

    // Global progress
    currentCountCompleted++;
    updateProgress();

    if (remaining === 0) {
      btn.classList.add("done");
      btn.innerHTML =
        '<i class="fa-solid fa-check"></i><span class="counter-label">تم بإذن الله</span>';
      card.classList.add("completed");
    }
  }
}

function updateProgress() {
  if (totalCountRequired === 0) {
    progressBar.style.width = "0%";
    progressText.textContent = `0% (0 / 0)`;
    return;
  }

  const percentage = Math.round(
    (currentCountCompleted / totalCountRequired) * 100,
  );
  progressBar.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}% (${currentCountCompleted} / ${totalCountRequired})`;

  if (percentage === 100) {
    progressText.innerHTML = `${percentage}% <i class="fa-solid fa-trophy" style="color:var(--accent-gold)"></i> اكتمل الورد!`;
  }
}

// Tabs Event Listeners
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const category = tab.getAttribute("data-category");
    loadCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Init
document.addEventListener("DOMContentLoaded", fetchAzkar);
>>>>>>> 7194fd316f5879c5a1b0c0285d02ac58ee0672e1
