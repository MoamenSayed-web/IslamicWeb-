// Navigation logic for Kids Sections
const mainMenu = document.getElementById("kids-main-menu");
const sections = {
  pillars: document.getElementById("section-pillars"),
  prophets: document.getElementById("section-prophets"),
  surahs: document.getElementById("section-surahs"),
  quiz: document.getElementById("section-quiz"),
  basics: document.getElementById("section-basics"),
};

function showSection(sectionId) {
  mainMenu.style.display = "none";
  for (const key in sections) {
    if (sections[key]) sections[key].classList.remove("active");
  }

  if (sectionId === "main") {
    mainMenu.style.display = "grid"; // because it's a grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    if (sections[sectionId]) {
      sections[sectionId].classList.add("active");
      if (sectionId === "quiz") loadQuizData();
      if (sectionId === "surahs") loadAmmaSurahs();
      if (sectionId === "prophets") loadProphetsStories();
    }
  }
}

// ====== PULLING DATA FROM APIS ======

// 1. Surahs (Juz Amma - Short Surahs) using api.alquran.cloud
// We'll fetch Juz Amma (Surahs 78 to 114)
async function loadAmmaSurahs() {
  const surahsContainer = sections.surahs.querySelector(".content-grid");
  // If already loaded, skip
  if (surahsContainer.children.length > 2) return;

  surahsContainer.innerHTML =
    '<div style="text-align:center; width: 100%;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i> جاري تحميل سور جزء عم...</div>';

  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah");
    const data = await res.json();
    // Juz Amma: Surahs 78 to 114
    const juzAmma = data.data.slice(77, 114);

    let htmlStr = "";
    juzAmma.forEach((surah) => {
      // We will link to Mishary Alafasy audio
      htmlStr += `
            <div class="info-card" style="text-align: center; border: 2px solid var(--accent-gold);">
              <h4 style="font-size:1.8rem; font-family:'Amiri', serif; color: var(--primary-color);">سورة ${surah.name.replace("سُورَةُ ", "")}</h4>
              <p style="color: var(--text-muted); margin-bottom: 10px;">عدد الآيات: ${surah.numberOfAyahs}</p>
              <div style="margin-top: 15px; background: #f8fafc; padding: 10px; border-radius: 10px;">
                 <p style="color: var(--primary-color); font-weight: bold; margin-bottom: 10px; font-size: 0.9rem;"><i class="fa-solid fa-microphone-lines"></i> تلاوة العفاسي</p>
                 <audio controls style="width: 100%; height: 35px; outline: none;" src="https://server8.mp3quran.net/afs/${String(surah.number).padStart(3, "0")}.mp3"></audio>
              </div>
            </div>
            `;
    });

    surahsContainer.innerHTML = htmlStr;
  } catch (e) {
    surahsContainer.innerHTML =
      '<p style="color:red; text-align:center;">عذراً، حدث خطأ في تحميل السور.</p>';
    console.error(e);
  }
}

// 2. Prophets Stories via local API Endpoint
async function loadProphetsStories() {
  const prophetsContainer = sections.prophets.querySelector(".content-grid");
  if (prophetsContainer.children.length > 0) return; // already loaded

  prophetsContainer.innerHTML =
    '<div style="text-align:center; width: 100%;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i> جاري تحميل القصص...</div>';

  try {
    const response = await fetch("data/prophets-stories.json");
    if (!response.ok) throw new Error("Network response was not ok");
    const storiesData = await response.json();

    let htmlStr = "";
    storiesData.forEach((p) => {
      htmlStr += `
             <div class="info-card">
               <h4>${p.name}</h4>
               <p>${p.story}</p>
             </div>
             `;
    });
    prophetsContainer.innerHTML = htmlStr;
  } catch (err) {
    console.error("Error fetching stories:", err);
    prophetsContainer.innerHTML =
      '<p style="color:red; text-align:center;">عذراً، حدث خطأ في تحميل القصص.</p>';
  }
}

// 3. Fun Quiz Logic via API JSON
let quizQuestions = [];
let currentQuestion = 0;
let score = 0;

const questionTitle = document.getElementById("question-title");
const optionsGrid = document.getElementById("options-grid");
const qCounter = document.getElementById("q-counter");
const quizArea = document.getElementById("quiz-question-area");
const scoreArea = document.getElementById("quiz-score");
const quizContainer = document.getElementById("quiz-container");

async function loadQuizData() {
  if (quizQuestions.length > 0) {
    startQuiz();
    return;
  }

  quizArea.style.display = "none";
  quizContainer.innerHTML =
    '<div style="text-align:center;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i> جاري تحميل المسابقة...</div>';

  try {
    const response = await fetch("data/kids-quiz.json");
    if (!response.ok) throw new Error("Network response was not ok");
    const fetchedQuestions = await response.json();

    quizQuestions = fetchedQuestions;

    // Restore DOM structure
    quizContainer.innerHTML = `
          <div class="quiz-score" id="quiz-score" style="display:none;">
            <i class="fa-solid fa-crown"></i>
            أحسنت يا بطل!
            <br>
            <button class="back-to-menu" onclick="startQuiz()" style="margin-top:20px;"><i class="fa-solid fa-rotate-right"></i> إلعب مرة أخرى</button>
          </div>
          <div id="quiz-question-area">
            <h3 class="question-text" id="question-title"></h3>
            <div class="options-grid" id="options-grid"></div>
            <p style="text-align:center; margin-top:20px; color:var(--text-muted);" id="q-counter"></p>
          </div>
        `;

    startQuiz();
  } catch (err) {
    console.error("Error fetching quiz data:", err);
    quizContainer.innerHTML =
      '<p style="color:red; text-align:center;">عذراً، حدث خطأ في تحميل المسابقة.</p>';
  }
}

// Sound Effects for Kids
function playSound(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "correct") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        1200,
        audioCtx.currentTime + 0.1,
      );
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.3,
      );
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else {
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        150,
        audioCtx.currentTime + 0.2,
      );
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.2,
      );
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.2);
    }
  } catch (err) {}
}

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  document.getElementById("quiz-score").style.display = "none";
  document.getElementById("quiz-question-area").style.display = "block";
  loadQuestion();
}

function loadQuestion() {
  const qData = quizQuestions[currentQuestion];
  document.getElementById("question-title").textContent = qData.q;
  document.getElementById("q-counter").textContent =
    `سؤال ${currentQuestion + 1} من ${quizQuestions.length}`;

  const optsGrid = document.getElementById("options-grid");
  optsGrid.innerHTML = "";

  qData.a.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optionText;
    btn.onclick = () => checkAnswer(index, btn);
    optsGrid.appendChild(btn);
  });
}

function checkAnswer(selectedIndex, btnElement) {
  const correctIndex = quizQuestions[currentQuestion].correct;
  const optsGrid = document.getElementById("options-grid");
  const allBtns = optsGrid.querySelectorAll("button");

  // Disable all buttons
  allBtns.forEach((b) => (b.disabled = true));

  if (selectedIndex === correctIndex) {
    btnElement.classList.add("correct");
    score++;
    playSound("correct");
  } else {
    btnElement.classList.add("wrong");
    allBtns[correctIndex].classList.add("correct"); // Show correct answer
    playSound("wrong");
  }

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < quizQuestions.length) {
      loadQuestion();
    } else {
      finishQuiz();
    }
  }, 1500);
}

function finishQuiz() {
  document.getElementById("quiz-question-area").style.display = "none";
  const sArea = document.getElementById("quiz-score");
  sArea.style.display = "block";

  let encouragment =
    score > 3
      ? "أنت رائع، بطل حقيقي!"
      : "محاولة جيدة، حاول مرة أخرى لتصبح بطلاً!";

  sArea.innerHTML = `
        <i class="fa-solid fa-crown" style="font-size:3rem; color:var(--accent-gold); margin-bottom:15px; display:block;"></i>
        لقد أجبت ${score} من ${quizQuestions.length} إجابات صحيحة!
        <p style="font-size:1.1rem; color:var(--text-muted); margin-top:10px;">${encouragment}</p>
    `;

  setTimeout(() => saveScoreAndRedirect(score), 1000);
}

function resetQuiz() {
  startQuiz();
}

// ====== AI CHALLENGE LOGIC ======
let aiQuestions = [];
let aiUserScore = 0;
let aiBotScore = 0;
let aiCurrentQIndex = 0;
let aiTimerTimeout;
let aiAnswered = false;

async function startAiChallenge() {
  document.getElementById("ai-intro").style.display = "none";
  document.getElementById("ai-game-area").style.display = "block";
  document.getElementById("ai-result-area").style.display = "none";

  aiUserScore = 0;
  aiBotScore = 0;
  aiCurrentQIndex = 0;
  document.getElementById("user-score").textContent = aiUserScore;
  document.getElementById("ai-score").textContent = aiBotScore;

  if (aiQuestions.length === 0) {
    document.getElementById("ai-question-title").innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...';
    try {
      const res = await fetch("data/kids-quiz.json");
      let data = await res.json();
      // shuffle questions for variation and pick 5
      aiQuestions = data.sort(() => 0.5 - Math.random()).slice(0, 5);
    } catch (e) {
      document.getElementById("ai-question-title").innerHTML =
        "تعذر تحميل الآسئلة";
      return;
    }
  } else {
    // reshuffle if playing again
    aiQuestions = aiQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  loadAiQuestion();
}

function loadAiQuestion() {
  if (aiCurrentQIndex >= aiQuestions.length) {
    endAiChallenge();
    return;
  }

  aiAnswered = false;
  const qData = aiQuestions[aiCurrentQIndex];
  document.getElementById("ai-question-title").textContent = qData.q;

  const optionsGrid = document.getElementById("ai-options-grid");
  optionsGrid.innerHTML = "";

  qData.a.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.onclick = () => handleAiUserAnswer(index, qData.correct, btn);
    optionsGrid.appendChild(btn);
  });

  // Timer Logic for AI thinking (simulate bot)
  const timerFill = document.getElementById("ai-timer-fill");
  timerFill.style.transition = "none";
  timerFill.style.width = "100%";

  // Random AI answer time between 2 to 6 seconds
  const aiThinkTime = Math.floor(Math.random() * 4000) + 2000;

  setTimeout(() => {
    timerFill.style.transition = `width ${aiThinkTime}ms linear`;
    timerFill.style.width = "0%";
  }, 50);

  clearTimeout(aiTimerTimeout);
  aiTimerTimeout = setTimeout(() => {
    if (!aiAnswered) {
      handleAiBotAnswer(qData.correct);
    }
  }, aiThinkTime);
}

function handleAiUserAnswer(selectedIndex, correctIndex, btnNode) {
  if (aiAnswered) return;
  aiAnswered = true;
  clearTimeout(aiTimerTimeout);
  document.getElementById("ai-timer-fill").style.transition = "none";

  const optionsGrid = document.getElementById("ai-options-grid");
  const correctBtn = optionsGrid.children[correctIndex];

  if (selectedIndex === correctIndex) {
    btnNode.classList.add("correct");
    playSound("correct");
    aiUserScore++;
    document.getElementById("user-score").textContent = aiUserScore;
  } else {
    btnNode.classList.add("wrong");
    correctBtn.classList.add("correct");
    playSound("wrong");
  }

  setTimeout(() => {
    aiCurrentQIndex++;
    loadAiQuestion();
  }, 2000);
}

function handleAiBotAnswer(correctIndex) {
  if (aiAnswered) return;
  aiAnswered = true;

  const optionsGrid = document.getElementById("ai-options-grid");
  const correctBtn = optionsGrid.children[correctIndex];

  // Simulate AI taking the point
  correctBtn.style.background = "#ef4444";
  correctBtn.style.color = "white";

  playSound("wrong");

  aiBotScore++;
  document.getElementById("ai-score").textContent = aiBotScore;

  setTimeout(() => {
    aiCurrentQIndex++;
    loadAiQuestion();
  }, 2000);
}

function endAiChallenge() {
  document.getElementById("ai-game-area").style.display = "none";
  const resultArea = document.getElementById("ai-result-area");
  resultArea.style.display = "block";

  const winnerText = document.getElementById("ai-winner-text");
  if (aiUserScore > aiBotScore) {
    winnerText.innerHTML = "🎉 مبروك! لقد تغلبت على الروبوت الذكي!";
    winnerText.style.color = "#10b981";
    playSound("correct");
  } else if (aiUserScore < aiBotScore) {
    winnerText.innerHTML = "🤖 لقد فاز الروبوت هذه المرة! حاول مجدداً";
    winnerText.style.color = "#ef4444";
    playSound("wrong");
  } else {
    winnerText.innerHTML = "🤝 تعادل! أنتما بطلان!";
    winnerText.style.color = "#f59e0b";
  }

  if (aiUserScore >= 0) {
    setTimeout(() => saveScoreAndRedirect(aiUserScore), 1500);
  }
}

function saveScoreAndRedirect(points) {
  // Ensure Swal is defined (SweetAlert2)
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "أحسنت يا بطل! 🎉",
      text: `لقد حصلت على ${points} نقطة. أدخل اسمك لتنضم لقائمة الأوائل:`,
      input: "text",
      inputPlaceholder: "اسم البطل/البطلة",
      showCancelButton: true,
      confirmButtonText: "حفظ النتيجة",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      inputValidator: (value) => {
        if (!value || value.trim() === "") {
          return "يجب إدخال اسمك يا بطل!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const name = result.value.trim();
        const scores = JSON.parse(
          localStorage.getItem("kidsLeaderboard") || "[]",
        );
        scores.push({
          name: name,
          score: points,
          date: new Date().toISOString(),
        });

        // Sort scores descending
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem("kidsLeaderboard", JSON.stringify(scores));

        Swal.fire({
          icon: "success",
          title: "تم الحفظ بنجاح!",
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          window.location.href = "leaderboard.html";
        });
      }
    });
  }
}

// ====== DAILY GOODNESS (خير كل يوم) ======
const dailyGoodness = [
  { type: "حديث اليوم", text: "قال رسول الله ﷺ: «الكلمة الطيبة صدقة»." },
  {
    type: "دعاء اليوم",
    text: "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً.",
  },
  {
    type: "سنة نبوية",
    text: "البسملة قبل الأكل والحمد بعده: «باسم الله»، وبعد الانتهاء «الحمد لله».",
  },
  {
    type: "خُلُق المسلم",
    text: "الصدق يهدي إلى البر، فكن دائماً صادقاً يا بطل.",
  },
  {
    type: "أذكار",
    text: "سبحان الله وبحمده، سبحان الله العظيم. (ثقيلتان في الميزان، حبيبتان للرحمن).",
  },
  {
    type: "آية وعبرة",
    text: "«وَقُل رَّبِّ زِدْنِي عِلْمًا» اسأل الله دائماً أن يزيدك من علمه.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const heroContent = document.querySelector(".kids-hero-content");
  if (heroContent) {
    const todayItem =
      dailyGoodness[Math.floor(Math.random() * dailyGoodness.length)];
    const banner = document.createElement("div");
    // Ensure styling is nice, has animations
    banner.style.cssText =
      "margin-top:25px; background:linear-gradient(135deg, #fef08a, #fde047); color:#854d0e; padding:15px 25px; border-radius:30px; box-shadow:0 10px 25px rgba(234, 179, 8, 0.2); display:inline-block; max-width:90%; border:2px dashed #ca8a04; animation: fadeIn 1.5s ease-out forwards;";
    banner.innerHTML = `
      <h3 style="font-family:var(--font-cairo); font-size:1.4rem; margin-bottom:5px;"><i class="fa-solid fa-star" style="color:#ca8a04;"></i> خير كل يوم - ${todayItem.type}</h3>
      <p style="font-size:1.2rem; font-family:var(--font-tajawal); font-weight:bold; margin:0;">${todayItem.text}</p>
    `;
    heroContent.appendChild(banner);
  }
});
