<<<<<<< HEAD
import os
import glob

html_files = glob.glob('*.html')
if 'tafseer.html' in html_files:
    html_files.remove('tafseer.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('href="quran.html"')
    if len(parts) == 2:
        part0 = parts[0] + 'href="quran.html"'
        part1 = parts[1]
        
        li_end_idx = part1.find('</li>')
        if li_end_idx != -1:
            insertion_point = li_end_idx + 5
            new_nav_item = '\n          <li><a href="tafseer.html">التفسير</a></li>'
            
            new_content = part0 + part1[:insertion_point] + new_nav_item + part1[insertion_point:]
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        else:
            print(f"Could not find </li> in {filepath}")
    else:
        print(f"Could not find quran.html exactly once in {filepath}: {len(parts)} parts")
=======
import os
import glob

html_files = glob.glob('*.html')
if 'tafseer.html' in html_files:
    html_files.remove('tafseer.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    parts = content.split('href="quran.html"')
    if len(parts) == 2:
        part0 = parts[0] + 'href="quran.html"'
        part1 = parts[1]
        
        li_end_idx = part1.find('</li>')
        if li_end_idx != -1:
            insertion_point = li_end_idx + 5
            new_nav_item = '\n          <li><a href="tafseer.html">التفسير</a></li>'
            
            new_content = part0 + part1[:insertion_point] + new_nav_item + part1[insertion_point:]
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        else:
            print(f"Could not find </li> in {filepath}")
    else:
        print(f"Could not find quran.html exactly once in {filepath}: {len(parts)} parts")
>>>>>>> 7194fd316f5879c5a1b0c0285d02ac58ee0672e1
