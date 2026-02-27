import os
import re
import sys

# Change to the script's directory (should be g:\My Work\Islamic)
os.chdir(os.path.dirname(os.path.abspath(__file__)))

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

navbar_template = """    <!-- Header/Navbar -->
    <header class="main-header">
      <nav class="navbar">
        <div class="container nav-content">
          <a href="index.html" class="logo">
            <i class="fa-solid fa-moon"></i> سراج
          </a>
          <ul class="nav-links">
            <li><a href="index.html"{index_active}>الرئيسية</a></li>
            <li><a href="quran.html"{quran_active}>القرآن</a></li>
            <li><a href="hadith.html"{hadith_active}>الحديث</a></li>
            <li><a href="azkar.html"{azkar_active}>الأذكار</a></li>
            <li><a href="prayer-times.html"{prayer_times_active}>مواقيت الصلاة</a></li>
            <li><a href="library.html"{library_active}>المكتبة</a></li>
          </ul>
          <div class="nav-actions">
            <button id="theme-toggle" aria-label="Toggle theme">
              <i class="fa-solid fa-cloud-sun"></i>
            </button>
            <div class="menu-toggle">
              <i class="fa-solid fa-bars"></i>
            </div>
          </div>
        </div>
      </nav>
      <nav class="sub-navbar">
        <div class="container sub-nav-content">
          <ul class="sub-nav-links">
            <li><a href="tafseer.html"{tafseer_active}>التفسير</a></li>
            <li><a href="fatwa.html"{fatwa_active}>الفتاوى</a></li>
            <li><a href="cards.html"{cards_active}>البطاقات</a></li>
            <li><a href="qibla.html"{qibla_active}>القبلة</a></li>
            <li><a href="zakat.html"{zakat_active}>الزكاة</a></li>
            <li><a href="names.html"{names_active}>أسماء الله</a></li>
            <li><a href="prayer-tracker.html"{prayer_tracker_active}>متتبع الصلوات</a></li>
            <li><a href="khatma.html"{khatma_active}>الختمة</a></li>
            <li><a href="hajj.html"{hajj_active}>الحج</a></li>
            <li><a href="tasbeeh.html"{tasbeeh_active}>المسبحة</a></li>
            <li><a href="radio.html"{radio_active}>الراديو</a></li>
            <li><a href="live.html"{live_active}>مباشر</a></li>
            <li><a href="calendar.html"{calendar_active}>التقويم</a></li>
            <li><a href="kids.html"{kids_active}>الأطفال</a></li>
            <li><a href="stories.html"{stories_active}>القصص</a></li>
            <li><a href="coloring.html"{coloring_active}>التلوين</a></li>
          </ul>
        </div>
      </nav>
    </header>"""

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    active = {
        'index_active': '', 'quran_active': '', 'tafseer_active': '', 'hadith_active': '',
        'fatwa_active': '', 'cards_active': '', 'azkar_active': '', 'prayer_times_active': '',
        'tasbeeh_active': '', 'radio_active': '', 'calendar_active': '', 'kids_active': '',
        'leaderboard_active': '', 'zakat_active': '', 'qibla_active': '', 'names_active': '',
        'khatma_active': '', 'prayer_tracker_active': '', 'hajj_active': '', 'library_active': '',
        'live_active': '', 'coloring_active': '', 'stories_active': ''
    }
    
    key = file.replace('.html', '_active').replace('-', '_')
    if key in active:
        active[key] = ' class="active"'

    format_kwargs = {k: v for k, v in active.items() if k not in ['leaderboard_active']}

    new_nav = navbar_template.format(**format_kwargs)

    pattern = re.compile(r'(?:<!--\s*Navbar\s*-->\s*)?(?:<header class="main-header">.*?</header>|<nav class="navbar">.*?</nav>)', re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(new_nav, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
    else:
        print(f"Could not find navbar in {file}")

print("Done")
sys.exit(0)
