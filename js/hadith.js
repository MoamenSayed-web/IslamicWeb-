<<<<<<< HEAD
// Using this public API for Hadith: https://github.com/fawazahmed0/hadith-api
const BOOKS_API =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json";
// Example pattern: https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json

const booksContainer = document.getElementById("books-container");
const loadingBooks = document.getElementById("loading-books");
const booksView = document.getElementById("books-view");

const hadithsView = document.getElementById("hadiths-view");
const hadithsList = document.getElementById("hadiths-list");
const loadingHadiths = document.getElementById("loading-hadiths");
const currentBookNameEl = document.getElementById("current-book-name");
const backBtn = document.getElementById("back-to-books");
const paginationEl = document.getElementById("pagination");

let allBooks = [];
// Main state for pagination
let currentHadiths = [];
let currentPage = 1;
const itemsPerPage = 20;

// Hardcoded Arabic translations mapping for popular books if the API returns english names
const bookNamesArabic = {
  bukhari: "صحيح البخاري",
  muslim: "صحيح مسلم",
  abudawud: "سنن أبي داود",
  ibnmajah: "سنن ابن ماجه",
  tirmidhi: "جامع الترمذي",
  nasai: "سنن النسائي",
  malik: "موطأ مالك",
};

async function fetchBooks() {
  try {
    const response = await fetch(BOOKS_API);
    const data = await response.json();

    // We only want arabic editions
    allBooks = Object.values(data).filter((book) => book.language === "Arabic");

    // Prioritize major books
    const majorBooksKeys = [
      "ara-bukhari",
      "ara-muslim",
      "ara-abudawud",
      "ara-ibnmajah",
      "ara-tirmidhi",
      "ara-nasai",
      "ara-malik",
    ];

    const majorBooks = allBooks.filter((b) => majorBooksKeys.includes(b.name));

    displayBooks(majorBooks);

    // Auto-load Sahih Al-Bukhari so that ahadith are visible immediately upon visiting the page
    openBook("ara-bukhari", "صحيح البخاري");
  } catch (error) {
    console.error("Error fetching books:", error);
    booksContainer.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل الكتب.</p>';
  } finally {
    loadingBooks.style.display = "none";
  }
}

function displayBooks(books) {
  booksContainer.innerHTML = "";

  books.forEach((book) => {
    // Extract basic name (e.g., 'bukhari' from 'ara-bukhari')
    const collectionKey = book.collection[0].name;
    // fallback to english name if not mapped
    const displayName =
      bookNamesArabic[collectionKey] || book.collection[0].title;

    const card = document.createElement("div");
    card.className = "book-card reveal active";
    card.onclick = () => openBook(book.name, displayName);

    card.innerHTML = `
            <div class="book-icon">
                <i class="fa-solid fa-book-open"></i>
            </div>
            <h3>${displayName}</h3>
            <p>يحتوي الآلاف من الأحاديث الصحيحة والحسنة</p>
            <span class="badge">اقرأ الأحاديث</span>
        `;
    booksContainer.appendChild(card);
  });
}

// Fetch and display specific book
async function openBook(apiName, displayName) {
  // UI Transitions
  booksView.style.display = "none";
  hadithsView.classList.add("active");
  currentBookNameEl.textContent = displayName;

  hadithsList.innerHTML = "";
  paginationEl.innerHTML = "";
  loadingHadiths.style.display = "block";

  try {
    // Fetch specific book data
    const response = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${apiName}.json`,
    );
    const data = await response.json();

    currentHadiths = data.hadiths;
    currentPage = 1; // reset page
    renderHadithsPage(currentPage);
  } catch (error) {
    console.error("Error fetching Hadiths:", error);
    hadithsList.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل الأحاديث.</p>';
    loadingHadiths.style.display = "none";
  }
}

function renderHadithsPage(page) {
  loadingHadiths.style.display = "none";
  hadithsList.innerHTML = "";

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = currentHadiths.slice(startIndex, endIndex);

  pageData.forEach((hadith) => {
    // Some API data might have empty text arrays
    if (!hadith.text) return;

    const item = document.createElement("div");
    item.className = "hadith-item fade-in-up";

    // Clean up the text minimally
    let text = hadith.text.replace("\n", "<br>");

    // Attempt to extract rawi (narrator) visually if it starts with "عن"
    let parts = text.split(/(عن .+? قال|عن .+? أن)/);
    let formattedText = text;

    item.innerHTML = `
            <div class="arabic-text">${formattedText}</div>
            <div class="info">
                <span><i class="fa-solid fa-tag"></i> حديث رقم: <span class="hadith-number">${hadith.hadithnumber}</span></span>
                ${hadith.grades && hadith.grades.length > 0 ? `<span>حكم الحديث: <strong style="color:var(--primary-color)">${hadith.grades[0].grade}</strong></span>` : ""}
            </div>
        `;
    hadithsList.appendChild(item);
  });

  renderPagination();

  // Scroll to top of the view
  hadithsView.scrollIntoView({ behavior: "smooth" });
}

function renderPagination() {
  paginationEl.innerHTML = "";
  const totalPages = Math.ceil(currentHadiths.length / itemsPerPage);

  if (totalPages <= 1) return;

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i> السابق';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderHadithsPage(currentPage);
  };
  paginationEl.appendChild(prevBtn);

  // Logic to show a limited window of page numbers (e.g., surrounding current page)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    const btn = document.createElement("button");
    btn.textContent = "1";
    btn.onclick = () => {
      currentPage = 1;
      renderHadithsPage(currentPage);
    };
    paginationEl.appendChild(btn);
    if (startPage > 2)
      paginationEl.appendChild(document.createTextNode(" ... "));
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      renderHadithsPage(currentPage);
    };
    paginationEl.appendChild(btn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1)
      paginationEl.appendChild(document.createTextNode(" ... "));
    const btn = document.createElement("button");
    btn.textContent = totalPages;
    btn.onclick = () => {
      currentPage = totalPages;
      renderHadithsPage(currentPage);
    };
    paginationEl.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = 'التالي <i class="fa-solid fa-angle-left"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderHadithsPage(currentPage);
  };
  paginationEl.appendChild(nextBtn);
}

// Back Button Logic
backBtn.addEventListener("click", () => {
  hadithsView.classList.remove("active");
  setTimeout(() => {
    hadithsView.style.display = "none";
    booksView.style.display = "block";
  }, 300); // match transition time
});

// Initialize
document.addEventListener("DOMContentLoaded", fetchBooks);
=======
// Using this public API for Hadith: https://github.com/fawazahmed0/hadith-api
const BOOKS_API =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions.json";
// Example pattern: https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json

const booksContainer = document.getElementById("books-container");
const loadingBooks = document.getElementById("loading-books");
const booksView = document.getElementById("books-view");

const hadithsView = document.getElementById("hadiths-view");
const hadithsList = document.getElementById("hadiths-list");
const loadingHadiths = document.getElementById("loading-hadiths");
const currentBookNameEl = document.getElementById("current-book-name");
const backBtn = document.getElementById("back-to-books");
const paginationEl = document.getElementById("pagination");

let allBooks = [];
// Main state for pagination
let currentHadiths = [];
let currentPage = 1;
const itemsPerPage = 20;

// Hardcoded Arabic translations mapping for popular books if the API returns english names
const bookNamesArabic = {
  bukhari: "صحيح البخاري",
  muslim: "صحيح مسلم",
  abudawud: "سنن أبي داود",
  ibnmajah: "سنن ابن ماجه",
  tirmidhi: "جامع الترمذي",
  nasai: "سنن النسائي",
  malik: "موطأ مالك",
};

async function fetchBooks() {
  try {
    const response = await fetch(BOOKS_API);
    const data = await response.json();

    // We only want arabic editions
    allBooks = Object.values(data).filter((book) => book.language === "Arabic");

    // Prioritize major books
    const majorBooksKeys = [
      "ara-bukhari",
      "ara-muslim",
      "ara-abudawud",
      "ara-ibnmajah",
      "ara-tirmidhi",
      "ara-nasai",
      "ara-malik",
    ];

    const majorBooks = allBooks.filter((b) => majorBooksKeys.includes(b.name));

    displayBooks(majorBooks);

    // Auto-load Sahih Al-Bukhari so that ahadith are visible immediately upon visiting the page
    openBook("ara-bukhari", "صحيح البخاري");
  } catch (error) {
    console.error("Error fetching books:", error);
    booksContainer.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل الكتب.</p>';
  } finally {
    loadingBooks.style.display = "none";
  }
}

function displayBooks(books) {
  booksContainer.innerHTML = "";

  books.forEach((book) => {
    // Extract basic name (e.g., 'bukhari' from 'ara-bukhari')
    const collectionKey = book.collection[0].name;
    // fallback to english name if not mapped
    const displayName =
      bookNamesArabic[collectionKey] || book.collection[0].title;

    const card = document.createElement("div");
    card.className = "book-card reveal active";
    card.onclick = () => openBook(book.name, displayName);

    card.innerHTML = `
            <div class="book-icon">
                <i class="fa-solid fa-book-open"></i>
            </div>
            <h3>${displayName}</h3>
            <p>يحتوي الآلاف من الأحاديث الصحيحة والحسنة</p>
            <span class="badge">اقرأ الأحاديث</span>
        `;
    booksContainer.appendChild(card);
  });
}

// Fetch and display specific book
async function openBook(apiName, displayName) {
  // UI Transitions
  booksView.style.display = "none";
  hadithsView.classList.add("active");
  currentBookNameEl.textContent = displayName;

  hadithsList.innerHTML = "";
  paginationEl.innerHTML = "";
  loadingHadiths.style.display = "block";

  try {
    // Fetch specific book data
    const response = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${apiName}.json`,
    );
    const data = await response.json();

    currentHadiths = data.hadiths;
    currentPage = 1; // reset page
    renderHadithsPage(currentPage);
  } catch (error) {
    console.error("Error fetching Hadiths:", error);
    hadithsList.innerHTML =
      '<p style="text-align:center; color: red;">عذراً، حدث خطأ أثناء تحميل الأحاديث.</p>';
    loadingHadiths.style.display = "none";
  }
}

function renderHadithsPage(page) {
  loadingHadiths.style.display = "none";
  hadithsList.innerHTML = "";

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = currentHadiths.slice(startIndex, endIndex);

  pageData.forEach((hadith) => {
    // Some API data might have empty text arrays
    if (!hadith.text) return;

    const item = document.createElement("div");
    item.className = "hadith-item fade-in-up";

    // Clean up the text minimally
    let text = hadith.text.replace("\n", "<br>");

    // Attempt to extract rawi (narrator) visually if it starts with "عن"
    let parts = text.split(/(عن .+? قال|عن .+? أن)/);
    let formattedText = text;

    item.innerHTML = `
            <div class="arabic-text">${formattedText}</div>
            <div class="info">
                <span><i class="fa-solid fa-tag"></i> حديث رقم: <span class="hadith-number">${hadith.hadithnumber}</span></span>
                ${hadith.grades && hadith.grades.length > 0 ? `<span>حكم الحديث: <strong style="color:var(--primary-color)">${hadith.grades[0].grade}</strong></span>` : ""}
            </div>
        `;
    hadithsList.appendChild(item);
  });

  renderPagination();

  // Scroll to top of the view
  hadithsView.scrollIntoView({ behavior: "smooth" });
}

function renderPagination() {
  paginationEl.innerHTML = "";
  const totalPages = Math.ceil(currentHadiths.length / itemsPerPage);

  if (totalPages <= 1) return;

  // Prev Button
  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = '<i class="fa-solid fa-angle-right"></i> السابق';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    currentPage--;
    renderHadithsPage(currentPage);
  };
  paginationEl.appendChild(prevBtn);

  // Logic to show a limited window of page numbers (e.g., surrounding current page)
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    const btn = document.createElement("button");
    btn.textContent = "1";
    btn.onclick = () => {
      currentPage = 1;
      renderHadithsPage(currentPage);
    };
    paginationEl.appendChild(btn);
    if (startPage > 2)
      paginationEl.appendChild(document.createTextNode(" ... "));
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      renderHadithsPage(currentPage);
    };
    paginationEl.appendChild(btn);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1)
      paginationEl.appendChild(document.createTextNode(" ... "));
    const btn = document.createElement("button");
    btn.textContent = totalPages;
    btn.onclick = () => {
      currentPage = totalPages;
      renderHadithsPage(currentPage);
    };
    paginationEl.appendChild(btn);
  }

  // Next Button
  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = 'التالي <i class="fa-solid fa-angle-left"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    currentPage++;
    renderHadithsPage(currentPage);
  };
  paginationEl.appendChild(nextBtn);
}

// Back Button Logic
backBtn.addEventListener("click", () => {
  hadithsView.classList.remove("active");
  setTimeout(() => {
    hadithsView.style.display = "none";
    booksView.style.display = "block";
  }, 300); // match transition time
});

// Initialize
document.addEventListener("DOMContentLoaded", fetchBooks);
>>>>>>> 7194fd316f5879c5a1b0c0285d02ac58ee0672e1
