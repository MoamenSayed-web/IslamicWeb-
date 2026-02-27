<<<<<<< HEAD
import os
import glob

html_files = glob.glob('g:/My Work/Islamic/*.html')
old_font = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Tajawal:wght@300;400;500;700&display=swap'
new_font = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@300;400;600;700&family=Reem+Kufi:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_font in content:
        content = content.replace(old_font, new_font)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
=======
import os
import glob

html_files = glob.glob('g:/My Work/Islamic/*.html')
old_font = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Tajawal:wght@300;400;500;700&display=swap'
new_font = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@300;400;600;700&family=Reem+Kufi:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap'

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_font in content:
        content = content.replace(old_font, new_font)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
>>>>>>> 7194fd316f5879c5a1b0c0285d02ac58ee0672e1
