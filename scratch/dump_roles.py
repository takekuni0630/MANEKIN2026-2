import re
import json

files = ['js/app.js', 'js/shop.js', 'js/studio.js']
res = {}

for filename in files:
    res[filename] = {}
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    pattern = re.compile(r'// 【関数】\s*([a-zA-Z0-9_]+)\s*\([^\r\n]*\)\r?\n// 【役割】\s*([^\r\n]+)')
    for match in pattern.finditer(content):
        fn = match.group(1)
        role = match.group(2)
        res[filename][fn] = role

with open('scratch/current_roles.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, ensure_ascii=False, indent=2)

print("Dumped successfully:")
for k, v in res.items():
    print(k, len(v))
