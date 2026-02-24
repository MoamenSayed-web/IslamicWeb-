document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const surahSelect = document.getElementById("surah-select");
  const ayahSelect = document.getElementById("ayah-select");
  const scholarSelect = document.getElementById("scholar-select");
  const tafseerContent = document.getElementById("tafseer-content");
  const tafseerLoading = document.getElementById("tafseer-loading");
  const tafseerResult = document.getElementById("tafseer-result");
  const tafseerInitialMsg = document.getElementById("tafseer-initial-msg");

  const ayahDisplay = document.getElementById("ayah-display");
  const scholarBadge = document.getElementById("scholar-badge");
  const tafseerText = document.getElementById("tafseer-text");

  let surahsData = [];

  // 1. Fetch Surahs Meta
  async function fetchSurahs() {
    try {
      const response = await fetch("https://api.alquran.cloud/v1/meta");
      const data = await response.json();

      if (data.code === 200) {
        surahsData = data.data.surahs.references;
        populateSurahSelect();
      }
    } catch (error) {
      console.error("Error fetching surahs:", error);
      surahSelect.innerHTML = '<option value="">خطأ في التحميل</option>';
    }
  }

  function populateSurahSelect() {
    surahSelect.innerHTML = '<option value="">-- اختر السورة --</option>';
    surahsData.forEach((surah) => {
      const option = document.createElement("option");
      option.value = surah.number;
      option.textContent = `${surah.number}. سورة ${surah.name}`;
      option.dataset.ayahsCount = surah.numberOfAyahs;
      surahSelect.appendChild(option);
    });
  }

  // 2. Handle Surah Selection
  surahSelect.addEventListener("change", (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const ayahsCount = selectedOption.dataset.ayahsCount;

    if (ayahsCount) {
      populateAyahSelect(parseInt(ayahsCount));
      ayahSelect.disabled = false;
    } else {
      ayahSelect.innerHTML = '<option value="">اختر السورة أولاً</option>';
      ayahSelect.disabled = true;
    }

    checkAndFetchTafseer();
  });

  function populateAyahSelect(count) {
    ayahSelect.innerHTML = '<option value="">-- اختر الآية --</option>';
    for (let i = 1; i <= count; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `الآية ${i}`;
      ayahSelect.appendChild(option);
    }
  }

  // 3. Handle Ayah and Scholar Selection
  ayahSelect.addEventListener("change", checkAndFetchTafseer);
  scholarSelect.addEventListener("change", checkAndFetchTafseer);

  async function checkAndFetchTafseer() {
    const surahNumber = surahSelect.value;
    const ayahNumber = ayahSelect.value;
    const scholar = scholarSelect.value;

    if (!surahNumber || !ayahNumber || !scholar) {
      tafseerResult.style.display = "none";
      tafseerInitialMsg.style.display = "block";
      return;
    }

    tafseerInitialMsg.style.display = "none";
    tafseerResult.style.display = "none";
    tafseerLoading.style.display = "block";

    try {
      // Fetch both the ayah text in Uthmani and the tafseer text
      const [ayahResponse, tafseerResponse] = await Promise.all([
        fetch(
          `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/quran-uthmani`,
        ),
        fetch(
          `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${scholar}`,
        ),
      ]);

      const ayahData = await ayahResponse.json();
      const tafseerData = await tafseerResponse.json();

      if (ayahData.code === 200 && tafseerData.code === 200) {
        displayTafseer(
          ayahData.data.text,
          tafseerData.data.text,
          scholarSelect.options[scholarSelect.selectedIndex].text,
        );
      } else {
        throw new Error("API returned non-200 code");
      }
    } catch (error) {
      console.error("Error fetching tafseer:", error);
      tafseerLoading.style.display = "none";
      tafseerInitialMsg.style.display = "block";
      tafseerInitialMsg.innerHTML =
        '<span style="color:var(--danger-color)">عذراً، حدث خطأ أثناء جلب التفسير. يرجى المحاولة مرة أخرى.</span>';
    }
  }

  function displayTafseer(ayahStr, tafseerStr, scholarName) {
    tafseerLoading.style.display = "none";
    tafseerResult.style.display = "block";

    // Add ayah number styling symbol at the end
    const ayahEndSymbol = ` \u06DD`;
    ayahDisplay.textContent = ayahStr;
    scholarBadge.textContent = scholarName;
    tafseerText.textContent = tafseerStr;
  }

  // Initialize
  fetchSurahs();

  // -----------------------------------------------------------------
  // Chatbot Logic
  // -----------------------------------------------------------------
  const chatbotToggle = document.getElementById("chatbot-toggle");
  const chatbotWindow = document.getElementById("chatbot-window");
  const closeChatbot = document.getElementById("close-chatbot");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotMessages = document.getElementById("chatbot-messages");

  chatbotToggle.addEventListener("click", () => {
    chatbotWindow.classList.toggle("active");
    if (chatbotWindow.classList.contains("active")) {
      chatbotInput.focus();
    }
  });

  closeChatbot.addEventListener("click", () => {
    chatbotWindow.classList.remove("active");
  });

  function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender);
    msgDiv.textContent = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function handleUserMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatbotInput.value = "";

    // Simulate typing delay
    setTimeout(() => {
      generateBotResponse(text);
    }, 600);
  }

  chatbotSend.addEventListener("click", handleUserMessage);
  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleUserMessage();
    }
  });

  function generateBotResponse(userText) {
    const text = userText.toLowerCase();
    let response =
      "عذراً، أنا مجرد مساعد ديني مبسط ولا أملك إجابة على هذا السؤال حالياً. يرجى سؤال أحد العلماء المتخصصين أو استخدام موقع إسلام ويب.";

    // Simple keyword matching for simulated AI
    if (
      text.includes("سلام") ||
      text.includes("مرحبا") ||
      text.includes("اهلا")
    ) {
      response =
        "وعليكم السلام ورحمة الله وبركاته. أهلاً بك أخي الكريم في سراج. كيف يمكنني إفادتك اليوم؟";
    } else if (
      text.includes("صلاة") ||
      text.includes("صلي") ||
      text.includes("الصلاة")
    ) {
      response =
        "الصلاة هي الركن الثاني من أركان الإسلام، وهي عماد الدين. تجب خمس صلوات في اليوم والليلة. إذا كان لديك سؤال محدد عن صفة الصلاة أو مواقيتها، تفضل بطرحه.";
    } else if (
      text.includes("وضوء") ||
      text.includes("الوضوء") ||
      text.includes("طهارة")
    ) {
      response =
        "الوضوء شرط أساسي لصحة الصلاة. يبدأ بالنية وغسل اليدين، ثم المضمضة والاستنشاق، ثم غسل الوجه واليدين إلى المرفقين، ثم مسح الرأس، وأخيراً غسل الرجلين إلى الكعبين.";
    } else if (
      text.includes("صيام") ||
      text.includes("رمضان") ||
      text.includes("صوم")
    ) {
      response =
        "الصيام هو الإمساك عن المفطرات من طلوع الفجر إلى غروب الشمس بنية التعبد. وصيام شهر رمضان ركن من أركان الإسلام فرض على كل مسلم بالغ عاقل.";
    } else if (
      text.includes("زكاة") ||
      text.includes("صدقة") ||
      text.includes("الزكاة")
    ) {
      response =
        "الزكاة هي الركن الثالث من أركان الإسلام، وتجب في أموال المسلمين متى بلغت النصاب وحال عليها الحول، ومقدارها غالباً ربع العشر (2.5%).";
    } else if (
      text.includes("تفسير") ||
      text.includes("قرآن") ||
      text.includes("القرآن")
    ) {
      response =
        "القرآن كلام الله المعجز المنزل على نبينا محمد صلى الله عليه وسلم. يمكنك استخدام صفحة 'التفسير' للبحث عن تفسير جميع آيات القرآن الكريم للعديد من العلماء.";
    } else if (
      text.includes("دعاء") ||
      text.includes("ادعية") ||
      text.includes("أدعية")
    ) {
      response =
        "الدعاء هو العبادة كما قال النبي ﷺ. يمكنك زيارة صفحة 'الأذكار' في موقعنا للحصول على العديد من الأذكار والأدعية الصباحية والمسائية المنوعة.";
    } else if (
      text.includes("برمجة") ||
      text.includes("كود") ||
      text.includes("شات")
    ) {
      response =
        "أنا مساعد ديني مخصص للأسئلة الإسلامية البسيطة. لا أستطيع مساعدتك في الاستفسارات التقنية!";
    }

    addMessage(response, "bot");
  }
});
