// Set the current year in footer
document.getElementById("current-year").textContent = new Date().getFullYear();

// --- Theme Toggle functionality (Dark/Light Mode) ---
const themeToggleBtn = document.getElementById("theme-toggle");
const rootElement = document.documentElement;
const themeIcon = themeToggleBtn.querySelector("i");

// Check localStorage for saved theme
const savedTheme = localStorage.getItem("islamic-theme") || "light";
if (savedTheme === "dark") {
  rootElement.setAttribute("data-theme", "dark");
  themeIcon.classList.replace("fa-cloud-sun", "fa-moon");
}

themeToggleBtn.addEventListener("click", () => {
  if (rootElement.getAttribute("data-theme") === "dark") {
    rootElement.removeAttribute("data-theme");
    themeIcon.classList.replace("fa-moon", "fa-cloud-sun");
    localStorage.setItem("islamic-theme", "light");
  } else {
    rootElement.setAttribute("data-theme", "dark");
    themeIcon.classList.replace("fa-cloud-sun", "fa-moon");
    localStorage.setItem("islamic-theme", "dark");
  }
});

// --- Mobile Navigation Toggle ---
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const menuIcon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  if (navLinks.classList.contains("active")) {
    menuIcon.classList.replace("fa-bars", "fa-xmark");
  } else {
    menuIcon.classList.replace("fa-xmark", "fa-bars");
  }
});

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
});
