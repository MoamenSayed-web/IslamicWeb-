// Set the current year in footer
const currentYearEl = document.getElementById("current-year");
if (currentYearEl) {
  currentYearEl.textContent = new Date().getFullYear();
}

// --- Theme Toggle functionality (Dark/Light Mode) ---
const themeToggleBtn = document.getElementById("theme-toggle");
const rootElement = document.documentElement;

if (themeToggleBtn) {
  const themeIcon = themeToggleBtn.querySelector("i");

  // Check localStorage for saved theme
  const savedTheme = localStorage.getItem("islamic-theme") || "light";
  if (savedTheme === "dark") {
    rootElement.setAttribute("data-theme", "dark");
    if (themeIcon) themeIcon.classList.replace("fa-cloud-sun", "fa-moon");
  }

  themeToggleBtn.addEventListener("click", () => {
    if (rootElement.getAttribute("data-theme") === "dark") {
      rootElement.removeAttribute("data-theme");
      if (themeIcon) themeIcon.classList.replace("fa-moon", "fa-cloud-sun");
      localStorage.setItem("islamic-theme", "light");
    } else {
      rootElement.setAttribute("data-theme", "dark");
      if (themeIcon) themeIcon.classList.replace("fa-cloud-sun", "fa-moon");
      localStorage.setItem("islamic-theme", "dark");
    }
  });
}

// --- Mobile Navigation Toggle ---
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (menuToggle && navLinks) {
  const menuIcon = menuToggle.querySelector("i");

  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    if (menuIcon) {
      if (navLinks.classList.contains("active")) {
        menuIcon.classList.replace("fa-bars", "fa-xmark");
      } else {
        menuIcon.classList.replace("fa-xmark", "fa-bars");
      }
    }
  });
}

// --- Scroll Reveal Animation ---
function revealElements() {
  const reveals = document.querySelectorAll(".reveal");
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add("active");
    }
  }
}

window.addEventListener("scroll", revealElements);
// Trigger once on load
revealElements();

// --- See More Button Logic ---
const seeMoreBtn = document.getElementById("see-more-btn");
const extraCards = document.querySelectorAll(".extra-card");

if (seeMoreBtn && extraCards.length > 0) {
  let isExpanded = false;

  seeMoreBtn.addEventListener("click", () => {
    isExpanded = !isExpanded;

    extraCards.forEach((card, index) => {
      if (isExpanded) {
        // Add a slight delay to each card for a cascading effect
        setTimeout(() => {
          card.classList.add("show");
        }, index * 50);
      } else {
        card.classList.remove("show");
      }
    });

    if (isExpanded) {
      seeMoreBtn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> عرض أقل';
    } else {
      seeMoreBtn.innerHTML =
        '<i class="fa-solid fa-chevron-down"></i> عرض المزيد';
      // Scroll back smoothly to the top of the services section if closing
      const servicesSection = document.querySelector(".services");
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
}

// --- Real Prayer Widget Logic for Main Page ---
function startRealPrayerCountdown() {
  const countdownEl = document.getElementById("countdown-timer");
  if (!countdownEl) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchMainPrayerTimes(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        fetchMainPrayerTimes(30.0444, 31.2357); // Cairo fallback
      },
    );
  } else {
    fetchMainPrayerTimes(30.0444, 31.2357);
  }
}

async function fetchMainPrayerTimes(lat, lng) {
  const date = new Date();
  const timestamp = Math.floor(date.getTime() / 1000);
  const apiUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=5`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    calculateNextPrayerTimer(data.data.timings);
  } catch (error) {
    console.error("Error fetching prayer times:", error);
  }
}

function calculateNextPrayerTimer(timings) {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  const targetKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const prayerNamesAr = {
    Fajr: "الفجر",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  let nextPrayerFound = false;
  let targetTimeForNext = null;

  for (let key of targetKeys) {
    const [h, m] = timings[key].split(":");
    const prayerTotalMinutes = parseInt(h) * 60 + parseInt(m);

    if (prayerTotalMinutes > currentTotalMinutes) {
      document.getElementById("next-prayer-time").textContent =
        `صلاة ${prayerNamesAr[key]}`;
      targetTimeForNext = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        parseInt(h),
        parseInt(m),
        0,
      ).getTime();
      nextPrayerFound = true;
      break;
    }
  }

  if (!nextPrayerFound) {
    document.getElementById("next-prayer-time").textContent = "صلاة الفجر";
    const [h, m] = timings["Fajr"].split(":");
    targetTimeForNext = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      parseInt(h),
      parseInt(m),
      0,
    ).getTime();
  }

  setInterval(() => {
    const nowTime = new Date().getTime();
    const distance = targetTimeForNext - nowTime;

    if (distance < 0) return;

    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    const countdownEl = document.getElementById("countdown-timer");
    if (countdownEl) {
      countdownEl.textContent = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
  }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  startRealPrayerCountdown();
  requestNotificationPermission();
});

// --- Browser Notifications for Adhkar ---
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      // Ask after 3 seconds
      setTimeout(() => {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: "تنبيهات الأذكار",
            text: "هل تود تفعيل الإشعارات لتذكيرك بأذكار الصباح والمساء ومواعيد الصلاة؟",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "نعم، تفعيل",
            cancelButtonText: "لا شكراً",
            confirmButtonColor: "#10b981",
          }).then((result) => {
            if (result.isConfirmed) {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") scheduleAdhkarReminders();
              });
            }
          });
        } else {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") scheduleAdhkarReminders();
          });
        }
      }, 3000);
    } else if (Notification.permission === "granted") {
      scheduleAdhkarReminders();
    }
  }
}

function scheduleAdhkarReminders() {
  setInterval(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const lastNotif = localStorage.getItem("lastAdhkarNotifDate");
    const todayStr = now.toDateString();

    if (hours === 6 && minutes === 0 && lastNotif !== `morning-${todayStr}`) {
      new Notification("سراج", {
        body: "حان وقت أذكار الصباح، ابدأ يومك بذكر الله.",
      });
      localStorage.setItem("lastAdhkarNotifDate", `morning-${todayStr}`);
    }

    if (hours === 17 && minutes === 0 && lastNotif !== `evening-${todayStr}`) {
      new Notification("سراج", {
        body: "حان وقت أذكار المساء، حصن نفسك واختم يومك بذكر الله.",
      });
      localStorage.setItem("lastAdhkarNotifDate", `evening-${todayStr}`);
    }
  }, 60000);
}

// --- Service Worker Registration (PWA) ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope,
        );
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}

// --- Daily Message Popup Logic ---
const dailyMessages = [
  "قال رسول الله ﷺ: «من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة».",
  "«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»",
  "قال رسول الله ﷺ: «كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن: سبحان الله وبحمده، سبحان الله العظيم».",
  "لا تنسَ قراءة وردك من القرآن اليوم وحافظ على صلواتك في وقتها.",
  "قال رسول الله ﷺ: «البخيل من ذُكِرتُ عنده فلم يُصلِّ عليّ».. اللهم صل وسلم على نبينا محمد.",
];

function showDailyPopup() {
  const popup = document.getElementById("daily-popup");
  const popupText = document.getElementById("daily-popup-text");
  const closeBtn = document.getElementById("close-popup");
  const shareBtn = document.getElementById("share-popup");

  if (!popup || !popupText) return;

  const today = new Date().toDateString();
  const lastPopupDate = localStorage.getItem("lastDailyPopupDate");

  if (lastPopupDate !== today) {
    const msg = dailyMessages[Math.floor(Math.random() * dailyMessages.length)];
    popupText.textContent = msg;

    setTimeout(() => {
      popup.classList.add("active");
    }, 2000);

    closeBtn.addEventListener("click", () => {
      popup.classList.remove("active");
      localStorage.setItem("lastDailyPopupDate", today);
    });

    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        if (navigator.share) {
          navigator
            .share({
              title: "رسالة اليوم من سراج",
              text: msg,
              url: window.location.href,
            })
            .catch(console.error);
        } else {
          alert("خاصية المشاركة غير مدعومة في متصفحك أو جهازك.");
        }
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showDailyPopup();
});
