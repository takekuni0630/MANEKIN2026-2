import re

with open('js/shop.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove comments
clean = re.sub(r'//[^\r\n]*', '', text)
clean = re.sub(r'/\*[\s\S]*?\*/', '', clean)

# Check functions
funcs = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', clean)
print('Total functions in shop.js:', len(funcs))
print('handleSizeSelect in shop.js?:', 'handleSizeSelect' in funcs)
