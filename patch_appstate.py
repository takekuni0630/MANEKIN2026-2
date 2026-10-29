with open('js/app.js', 'r', encoding='utf-8') as f:
    c = f.read()

target = '    selectedCategory: "ALL",\n    selectedSort: "default"'
replacement = '    selectedGender: "ALL",\n    selectedCategory: "ALL",\n    selectedSort: "default"'

if target in c:
    c = c.replace(target, replacement, 1)
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(c)
    print("selectedGender added to AppState!")
else:
    print("Target not found")

