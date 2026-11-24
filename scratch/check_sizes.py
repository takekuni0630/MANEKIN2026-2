import re

with open('js/products-data.js', 'r', encoding='utf-8') as f:
    text = f.read()

products = re.findall(r'name:\s*[\'"]([^\'"]+)[\'"].*?sizes:\s*(\[[^\]]+\])', text, re.DOTALL)
for name, sizes in products:
    print(f'{name}: {sizes}')
