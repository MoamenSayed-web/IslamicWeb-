// Elements
const locationSpan = document.getElementById("user-location");
const hijriDateSpan = document.getElementById("hijri-date");
const mainNextPrayerName = document.getElementById("main-next-prayer-name");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");
const timesGrid = document.getElementById("times-grid");
const qiblaAngleText = document.getElementById("qibla-angle");
const compassArrow = document.getElementById("compass-arrow");

// Default location (e.g., Cairo, Egypt) if user denies permission
let currentLat = 30.0444;
let currentLng = 31.2357;
let currentLocationName = "القاهرة، مصر (افتراضي)";
let currentPrayerData = null;
let countdownInterval = null;

const prayerNamesAr = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const prayerIcons = {
  Fajr: "fa-cloud-moon",
  Sunrise: "fa-sun",
  Dhuhr: "fa-sun",
  Asr: "fa-cloud-sun",
  Maghrib: "fa-sunset", // Since fa-sunset doesn't exist in standard free set, we'll use alternate icons
  Isha: "fa-moon",
};

// Alternate valid FA free icons
const iconsFallback = {
  Fajr: "fa-cloud-moon",
  Sunrise: "fa-sun",
  Dhuhr: "fa-circle-half-stroke",
  Asr: "fa-cloud-sun",
  Maghrib: "fa-cloud-moon",
  Isha: "fa-moon",
};

// Sunnah Details for each prayer
const sunnahDetails = {
  Fajr: "ركعتان قبلها (سنة مؤكدة - راتبة)",
  Sunrise: "وقت الشروق (لا صلاة فيه)",
  Dhuhr: "٤ ركعات قبلها، وركعتان بعدها (سنن رواتب)",
  Asr: "٤ ركعات قبلها (سنة غير مؤكدة)",
  Maghrib: "ركعتان بعدها (سنة مؤكدة - راتبة)",
  Isha: "ركعتان بعدها (سنة مؤكدة - راتبة) <br> + الشفع والوتر",
};

// Different Adhan Audio URLs for each prayer
const prayerAdhans = {
  Fajr: "https://server11.mp3quran.net/Alafasi/Al-Athane/01.mp3", // Includes As-Salatu Khayrun Minan-Naum
  Dhuhr: "https://server11.mp3quran.net/Alafasi/Al-Athane/02.mp3",
  Asr: "https://server11.mp3quran.net/Alafasi/Al-Athane/03.mp3",
  Maghrib: "https://server11.mp3quran.net/Alafasi/Al-Athane/04.mp3",
  Isha: "https://server11.mp3quran.net/Alafasi/Al-Athane/05.mp3",
};

// Adhan UI Elements
const adhanPopup = document.getElementById("adhan-popup");
const adhanTitle = document.getElementById("adhan-title");
const stopAdhanBtn = document.getElementById("stop-adhan-btn");
const adhanAudioEl = document.getElementById("adhan-audio-el");

if (stopAdhanBtn) {
  stopAdhanBtn.addEventListener("click", () => {
    adhanAudioEl.pause();
    adhanAudioEl.currentTime = 0;
    adhanPopup.classList.remove("show");
  });
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Try to get saved location or use default
  if (navigator.geolocation) {
    requestLocation();
  } else {
    fetchPrayerTimes(currentLat, currentLng);
  }

  // Request Notification permission for Adhan alerts
  if (
    "Notification" in window &&
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission();
  }

  // Set up listeners globally
  // Assuming 'close-adhan' button exists in the HTML for the adhan popup
  const closeAdhanBtn = document.getElementById("close-adhan");
  if (closeAdhanBtn) {
    closeAdhanBtn.addEventListener("click", () => {
      adhanAudioEl.pause();
      adhanAudioEl.currentTime = 0;
      adhanPopup.classList.remove("show");
      // Optionally, re-fetch location/prayer times after closing adhan popup
      // requestLocation();
    });
  }
});

function requestLocation() {
  locationSpan.textContent = "جاري تحديد الموقع...";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
        // Reverse geocode to get city name (Using bigdatacloud free api for simplicity without key)
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${currentLat}&longitude=${currentLng}&localityLanguage=ar`,
        )
          .then((res) => res.json())
          .then((data) => {
            currentLocationName = `${data.city || data.locality}, ${data.countryName}`;
            locationSpan.textContent = currentLocationName;
            fetchPrayerTimes(currentLat, currentLng);
          })
          .catch(() => {
            locationSpan.textContent = "تم تحديد الإحداثيات بنجاح";
            fetchPrayerTimes(currentLat, currentLng);
          });
      },
      (error) => {
        console.warn("Geolocation blocked/failed:", error);
        locationSpan.textContent = currentLocationName; // Fallback to default
        fetchPrayerTimes(currentLat, currentLng);
      },
    );
  }
}

async function fetchPrayerTimes(lat, lng) {
  // Using Aladhan API based on coordinates
  const date = new Date();
  const timestamp = Math.floor(date.getTime() / 1000);
  // method 5 is Egyptian General Authority of Survey (can leave blank for auto based on location)
  const apiUrl = `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=5`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    currentPrayerData = data.data;
    updateUI();

    // Fetch Qibla direction
    fetchQibla(lat, lng);

    // Also update the index.html widget if it exists globally, but we only run this script on prayer page.
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    timesGrid.innerHTML = '<p style="color:red;">خطأ في الاتصال بالخادم.</p>';
  }
}

function fetchQibla(lat, lng) {
  fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`)
    .then((res) => res.json())
    .then((data) => {
      const angle = Math.round(data.data.direction);
      qiblaAngleText.textContent = `${angle}°`;
      compassArrow.style.transform = `rotate(${angle}deg)`;
    })
    .catch((err) => console.error("Error fetching Qibla", err));
}

function updateUI() {
  if (!currentPrayerData) return;

  // Hijri Date
  const hijri = currentPrayerData.date.hijri;
  hijriDateSpan.textContent = `${hijri.day} ${hijri.month.ar} ${hijri.year} هـ`;

  // Times parsing
  const timings = currentPrayerData.timings;

  // Filter the keys we actually want to display
  const targetKeys = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  timesGrid.innerHTML = "";

  // Convert current time to numerical form for comparison
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayerFound = false;
  let targetTimeForNext = null;

  targetKeys.forEach((key) => {
    const timeStr = timings[key]; // "HH:MM"
    const [hoursStr, minutesStr] = timeStr.split(":");
    const h = parseInt(hoursStr);
    const m = parseInt(minutesStr);
    const prayerTotalMinutes = h * 60 + m;

    // Format to 12-hour AM/PM purely for display if desired, or keep 24h
    // Aladhan returns 24h format.

    const card = document.createElement("div");
    card.className = "time-box";

    let sunnahHtml = "";
    if (key === "Sunrise") {
      sunnahHtml = `<div class="sunnah-text" style="opacity: 0.7;">${sunnahDetails[key]}</div>`;
    } else {
      sunnahHtml = `<div class="sunnah-text" style="line-height: 1.5; padding-top: 8px;">
           <span style="display:block; font-weight:bold; margin-bottom: 2px; color: var(--primary-color);">السنن والرواتب:</span>
           <span style="font-size: 0.9rem;">${sunnahDetails[key]}</span>
         </div>`;
    }

    card.innerHTML =
      "" +
      '<i class="fa-solid ' +
      iconsFallback[key] +
      ' icon-bg"></i>' +
      '<div class="time-name">' +
      prayerNamesAr[key] +
      "</div>" +
      '<div class="time-value">' +
      timeStr +
      "</div>" +
      sunnahHtml;

    // Logic to highlight next prayer
    if (
      !nextPrayerFound &&
      prayerTotalMinutes > currentTotalMinutes &&
      key !== "Sunrise"
    ) {
      card.classList.add("next");
      mainNextPrayerName.textContent = prayerNamesAr[key];
      targetTimeForNext = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        h,
        m,
        0,
      ).getTime();
      nextPrayerFound = true;
    }

    timesGrid.appendChild(card);
  });

  // If all prayers passed today, next is Fajr tomorrow
  if (!nextPrayerFound) {
    mainNextPrayerName.textContent = prayerNamesAr["Fajr"];
    const fajrTime = timings["Fajr"].split(":");
    targetTimeForNext = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      parseInt(fajrTime[0]),
      parseInt(fajrTime[1]),
      0,
    ).getTime();
    timesGrid.firstElementChild.classList.add("next");
  }

  startCountdown(targetTimeForNext);
}

function startCountdown(targetTime) {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetTime - now;

    if (distance < 0) {
      clearInterval(countdownInterval);
      cdHours.textContent = "00";
      cdMinutes.textContent = "00";
      cdSeconds.textContent = "00";

      // Play specific Adhan if it's not Sunrise
      const currentNextPrayerKey = Object.keys(prayerNamesAr).find(
        (key) => prayerNamesAr[key] === mainNextPrayerName.textContent,
      );

      if (currentNextPrayerKey && currentNextPrayerKey !== "Sunrise") {
        playAdhan(currentNextPrayerKey);
      }

      setTimeout(() => requestLocation(), 60000); // refresh after 1 min heavily
      return;
    }

    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    cdHours.textContent = h.toString().padStart(2, "0");
    cdMinutes.textContent = m.toString().padStart(2, "0");
    cdSeconds.textContent = s.toString().padStart(2, "0");
  }, 1000);
}

function playAdhan(prayerKey) {
  if (!prayerAdhans[prayerKey]) return;

  const adhanMsg = `حان الآن موعد أذان ${prayerNamesAr[prayerKey]}`;
  adhanTitle.textContent = adhanMsg;

  // Trigger Browser Notification Request
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("سراج - الصلاة", {
      body: adhanMsg,
      icon: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png", // Mosque icon
    });
  }

  adhanAudioEl.src = prayerAdhans[prayerKey];

  adhanAudioEl
    .play()
    .then(() => {
      adhanPopup.classList.add("show");
    })
    .catch((err) => console.log("Adhan Autoplay prevented:", err));

  // Auto hide when audio ends
  adhanAudioEl.onended = () => {
    adhanPopup.classList.remove("show");
  };
}
