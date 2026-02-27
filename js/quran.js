// API URL for fetching complete list of Surahs
const SURAHS_API = "https://api.alquran.cloud/v1/surah";
// API URL for fetching specific Surah Text (Uthmani)
const SURAH_TEXT_API = "https://api.alquran.cloud/v1/surah/";

const surahContainer = document.getElementById("surah-container");
const loadingIndicator = document.getElementById("loading");
const searchInput = document.getElementById("search-surah");

let allSurahs = [];

// Fetch all Surahs
async function fetchSurahs() {
  try {
    const response = await fetch(SURAHS_API);
    const data = await response.json();
    allSurahs = data.data;
    displaySurahs(allSurahs);
  } catch (error) {
    console.error("Error fetching Surahs:", error);
    surahContainer.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل السور. يرجى المحاولة لاحقاً.</p>';
  } finally {
    loadingIndicator.style.display = "none";
  }
}

// Display Surahs in Grid
function displaySurahs(surahs) {
  surahContainer.innerHTML = "";

  if (surahs.length === 0) {
    surahContainer.innerHTML =
      '<p style="text-align:center; grid-column: 1/-1;">لا توجد نتائج مطابقة للبحث.</p>';
    return;
  }

  surahs.forEach((surah) => {
    const type = surah.revelationType === "Meccan" ? "مكية" : "مدنية";

    const card = document.createElement("div");
    card.className = "surah-card reveal active";
    card.onclick = () => openSurah(surah.number, surah.name);

    card.innerHTML = `
            <div class="surah-info">
                <div class="surah-number">${surah.number}</div>
                <div class="surah-details">
                    <h3>${surah.englishName}</h3>
                    <p>${type} • ${surah.numberOfAyahs} آيات</p>
                </div>
            </div>
            <div class="surah-name-arabic">${surah.name.replace("سُورَةُ ", "")}</div>
        `;
    surahContainer.appendChild(card);
  });
}

// Search functionality
searchInput.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase().trim();
  const filtered = allSurahs.filter(
    (surah) =>
      surah.name.includes(term) ||
      surah.englishName.toLowerCase().includes(term) ||
      surah.englishNameTranslation.toLowerCase().includes(term),
  );
  displaySurahs(filtered);
});

// ---- Reading Modal Functionality ----
const readingModal = document.getElementById("reading-modal");
const closeModalBtn = document.getElementById("close-modal");
const ayahsContainer = document.getElementById("ayahs-container");
const readingLoading = document.getElementById("reading-loading");
const modalSurahName = document.getElementById("modal-surah-name");
const bismillahText = document.getElementById("bismillah");

// New Audio Elements
const reciterSelect = document.getElementById("reciter-select");
const audioPlayer = document.getElementById("quran-audio-player");
let currentAudioList = [];
let currentAudioIndex = 0;
let currentSurahNumber = 1;
let currentSurahName = "";

async function openSurah(number, name) {
  currentSurahNumber = number;
  currentSurahName = name;

  readingModal.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling

  modalSurahName.textContent = name;
  ayahsContainer.innerHTML = "";
  readingLoading.style.display = "block";
  audioPlayer.pause();
  audioPlayer.src = "";

  // Hide bismillah for Surah Al-Tawbah (number 9)
  if (number === 9) {
    bismillahText.style.display = "none";
  } else {
    bismillahText.style.display = "block";
  }

  await loadSurahData();
}

async function loadSurahData() {
  readingLoading.style.display = "block";
  ayahsContainer.innerHTML = "";
  audioPlayer.pause();
  audioPlayer.src = "";

  const reciter = reciterSelect.value;

  try {
    // Fetch text and audio simultaneously
    const [textResponse, audioResponse] = await Promise.all([
      fetch(`${SURAH_TEXT_API}${currentSurahNumber}/quran-uthmani`),
      fetch(`${SURAH_TEXT_API}${currentSurahNumber}/${reciter}`),
    ]);

    const textData = await textResponse.json();
    const audioData = await audioResponse.json();

    const textAyahs = textData.data.ayahs;
    const audioAyahs = audioData.data.ayahs;

    currentAudioList = audioAyahs.map((a) => a.audio);
    currentAudioIndex = 0;

    if (currentAudioList.length > 0) {
      audioPlayer.src = currentAudioList[0];
    }

    let ayahsHTML = "";
    textAyahs.forEach((ayah, index) => {
      let text = ayah.text;
      if (
        currentSurahNumber !== 1 &&
        ayah.numberInSurah === 1 &&
        text.startsWith("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")
      ) {
        text = text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ", "");
      }

      const arabicNumber = convertToArabicNum(ayah.numberInSurah);

      ayahsHTML += `<span class="ayah-text" id="ayah-${index}" style="transition: color 0.3s;">${text}</span> <span class="ayah-number">${arabicNumber}</span> `;
    });

    ayahsContainer.innerHTML = ayahsHTML;
  } catch (error) {
    console.error("Error fetching Ayahs:", error);
    ayahsContainer.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل الآيات.</p>';
  } finally {
    readingLoading.style.display = "none";
    readingModal.scrollTop = 0;
  }
}

// Sequential playback and highlighting logic
audioPlayer.addEventListener("play", () => {
  highlightAyah(currentAudioIndex);
});

audioPlayer.addEventListener("ended", () => {
  removeHighlight(currentAudioIndex);
  currentAudioIndex++;
  if (currentAudioIndex < currentAudioList.length) {
    audioPlayer.src = currentAudioList[currentAudioIndex];
    audioPlayer.play();
  } else {
    // Reset when finished
    currentAudioIndex = 0;
    audioPlayer.src = currentAudioList[0];
  }
});

function highlightAyah(index) {
  const ayahs = document.querySelectorAll(".ayah-text");
  ayahs.forEach((el, i) => {
    if (i === index) {
      el.style.color = "var(--primary-color)";
      el.style.fontWeight = "bold";
      // Optional: Auto scroll to the playing verse
      // el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      el.style.color = "var(--text-main)";
      el.style.fontWeight = "normal";
    }
  });
}

function removeHighlight(index) {
  const el = document.getElementById(`ayah-${index}`);
  if (el) {
    el.style.color = "var(--text-main)";
    el.style.fontWeight = "normal";
  }
}

// Reload when changing reciter
reciterSelect.addEventListener("change", () => {
  if (currentSurahNumber) {
    // Check if currently playing to auto-play after changing
    const wasPlaying = !audioPlayer.paused;
    loadSurahData().then(() => {
      if (wasPlaying && currentAudioList.length > 0) {
        audioPlayer.play();
      }
    });
  }
});

closeModalBtn.addEventListener("click", () => {
  readingModal.classList.remove("active");
  document.body.style.overflow = "auto";
  audioPlayer.pause();
});

// Close modal on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && readingModal.classList.contains("active")) {
    closeModalBtn.click();
  }
});

// Helper to convert numbers to Arabic format (optional but gives a nice touch)
function convertToArabicNum(num) {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((char) => arabicNumbers[char] || char)
    .join("");
}

// ---- Tabs Logic ----
function switchQuranTab(tabId) {
  // Update Buttons
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(`btn-${tabId}`).classList.add("active");

  // Update Content
  document
    .querySelectorAll(".quran-tab-content")
    .forEach((content) => (content.style.display = "none"));
  document.getElementById(`tab-${tabId}`).style.display = "block";

  if (tabId === "tracker") initTracker();
  if (tabId === "shared") initSharedKhatmah();
}

// ---- Tracker Logic ----
function initTracker() {
  const trackerData = JSON.parse(
    localStorage.getItem("quranTracker") || '{"readCount": 0, "lastRead": ""}',
  );

  const percentage = Math.min(
    100,
    Math.round((trackerData.readCount / 114) * 100),
  );
  const fillElement = document.getElementById("khatmah-progress-fill");
  const textElement = document.getElementById("khatmah-progress-text");

  if (fillElement) fillElement.style.width = `${percentage}%`;
  if (textElement) textElement.textContent = `${percentage}% من الختمة`;

  const lastReadEl = document.getElementById("last-read-info");
  if (lastReadEl)
    lastReadEl.textContent = trackerData.lastRead || "لم تبدأ بعد";
}

function saveProgress() {
  if (!currentSurahName) return;
  const trackerData = JSON.parse(
    localStorage.getItem("quranTracker") || '{"readCount": 0, "lastRead": ""}',
  );

  let readSurahs = JSON.parse(localStorage.getItem("readSurahs") || "[]");
  if (!readSurahs.includes(currentSurahNumber)) {
    readSurahs.push(currentSurahNumber);
    localStorage.setItem("readSurahs", JSON.stringify(readSurahs));
    trackerData.readCount = readSurahs.length;
  }

  trackerData.lastRead = `سورة ${currentSurahName.replace("سُورَةُ ", "")} - وقت الحفظ: ${new Date().toLocaleDateString("ar-EG")}`;
  localStorage.setItem("quranTracker", JSON.stringify(trackerData));

  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "success",
      title: "تم الحفظ!",
      text: "تم حفظ تقدمك في الختمة بنجاح، تقبل الله.",
      confirmButtonColor: "#10b981",
      confirmButtonText: "حسناً",
    });
  } else {
    alert("تم حفظ تقدمك بنجاح!");
  }

  initTracker();
}

if (document.getElementById("save-progress-btn")) {
  document
    .getElementById("save-progress-btn")
    .addEventListener("click", saveProgress);
}

// ---- Shared Khatmah Logic ----
function initSharedKhatmah() {
  const juzGrid = document.getElementById("juz-grid");
  if (!juzGrid) return;

  juzGrid.innerHTML = "";
  const sharedData = JSON.parse(localStorage.getItem("sharedKhatmah") || "{}");

  for (let i = 1; i <= 30; i++) {
    const card = document.createElement("div");
    const isClaimed = sharedData[i];

    card.className = `juz-card ${isClaimed ? "claimed" : ""}`;
    card.innerHTML = `
      <div>الجزء ${i}</div>
      ${isClaimed ? `<div style="font-size:0.85rem; margin-top:5px; font-weight:normal;">قرأه: <br/><b>${isClaimed}</b></div><i class="fa-solid fa-check-circle" style="margin-top:8px; font-size:1.2rem;"></i>` : '<div style="font-size:0.8rem; margin-top:5px; font-weight:normal;">متاح للقراءة</div>'}
    `;

    if (!isClaimed) {
      card.onclick = () => claimJuz(i);
    }

    juzGrid.appendChild(card);
  }
}

function claimJuz(juzIndex) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: `حجز الجزء ${juzIndex}`,
      text: "أدخل اسمك للمشاركة في قراءة هذا الجزء (الختمة المجتمعية):",
      input: "text",
      inputPlaceholder: "الاسم الكريم",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "تأكيد الحجز",
      cancelButtonText: "إلغاء",
    }).then((result) => {
      if (result.isConfirmed && result.value.trim() !== "") {
        saveClaim(juzIndex, result.value.trim());
      }
    });
  } else {
    const name = prompt(`أدخل اسمك لحجز الجزء ${juzIndex}:`);
    if (name && name.trim() !== "") {
      saveClaim(juzIndex, name.trim());
    }
  }
}

function saveClaim(juzIndex, name) {
  const sharedData = JSON.parse(localStorage.getItem("sharedKhatmah") || "{}");
  sharedData[juzIndex] = name;
  localStorage.setItem("sharedKhatmah", JSON.stringify(sharedData));
  initSharedKhatmah();

  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "success",
      title: "تم الحجز!",
      text: `تم تسجيل الجزء ${juzIndex} باسمك. تقبل الله صالح أعمالك.`,
      showConfirmButton: false,
      timer: 2000,
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  fetchSurahs();
  initTracker();
});
