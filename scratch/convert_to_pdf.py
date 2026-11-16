import re
import os
import subprocess
import html

md_path = 'BEGINNER_GUIDE.md'
html_path = 'BEGINNER_GUIDE_print.html'
pdf_path = 'BEGINNER_GUIDE.pdf'
chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

with open(md_path, 'r', encoding='utf-8') as f:
    md_text = f.read()

def md_to_html(text):
    lines = text.split('\n')
    html_lines = []
    in_code = False
    code_lang = ''
    code_lines = []
    in_table = False
    in_ul = False
    in_ol = False

    def close_lists():
        nonlocal in_ul, in_ol
        res = ''
        if in_ul:
            res += '</ul>\n'
            in_ul = False
        if in_ol:
            res += '</ol>\n'
            in_ol = False
        return res

    def format_inline(line):
        # file:/// リンク対応
        line = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', line)
        # bold **text**
        line = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', line)
        # code `text`
        line = re.sub(r'`([^`]+)`', r'<code>\1</code>', line)
        return line

    for line in lines:
        stripped = line.strip()

        # コードブロック
        if stripped.startswith('```'):
            if not in_code:
                html_lines.append(close_lists())
                in_code = True
                code_lang = stripped[3:].strip()
                code_lines = []
            else:
                in_code = False
                escaped_code = html.escape('\n'.join(code_lines))
                html_lines.append(f'<pre><code class="language-{code_lang}">{escaped_code}</code></pre>')
                code_lines = []
            continue

        if in_code:
            code_lines.append(line)
            continue

        # テーブル
        if stripped.startswith('|') and stripped.endswith('|'):
            html_lines.append(close_lists())
            if re.match(r'^\|[\s:-|]+\|$', stripped):
                continue
            cells = [c.strip() for c in stripped[1:-1].split('|')]
            if not in_table:
                in_table = True
                th_html = ''.join(f'<th>{format_inline(c)}</th>' for c in cells)
                html_lines.append(f'<table><thead><tr>{th_html}</tr></thead><tbody>')
            else:
                td_html = ''.join(f'<td>{format_inline(c)}</td>' for c in cells)
                html_lines.append(f'<tr>{td_html}</tr>')
            continue
        elif in_table:
            in_table = False
            html_lines.append('</tbody></table>')

        # 見出し
        if stripped.startswith('#'):
            html_lines.append(close_lists())
            m = re.match(r'^(#{1,6})\s+(.*)$', stripped)
            if m:
                level = len(m.group(1))
                h_text = format_inline(m.group(2))
                html_lines.append(f'<h{level}>{h_text}</h{level}>')
                continue

        # 水平線
        if stripped in ('---', '***', '___'):
            html_lines.append(close_lists())
            html_lines.append('<hr>')
            continue

        # 順序付きリスト 1. ...
        m_ol = re.match(r'^(\d+)\.\s+(.*)$', stripped)
        if m_ol:
            if in_ul:
                html_lines.append('</ul>\n')
                in_ul = False
            if not in_ol:
                in_ol = True
                html_lines.append('<ol>')
            html_lines.append(f'<li>{format_inline(m_ol.group(2))}</li>')
            continue

        # 順序なしリスト - ... or * ...
        if stripped.startswith('- ') or stripped.startswith('* '):
            if in_ol:
                html_lines.append('</ol>\n')
                in_ol = False
            if not in_ul:
                in_ul = True
                html_lines.append('<ul>')
            html_lines.append(f'<li>{format_inline(stripped[2:])}</li>')
            continue

        # 空行
        if not stripped:
            html_lines.append(close_lists())
            continue

        # 通常の段落
        html_lines.append(close_lists())
        html_lines.append(f'<p>{format_inline(line)}</p>')

    html_lines.append(close_lists())
    if in_table:
        html_lines.append('</tbody></table>')

    return '\n'.join(html_lines)

body_html = md_to_html(md_text)

full_html = f'''<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>MANEKIN FASHION 初心者向け完全解説書</title>
    <style>
        @page {{
            size: A4;
            margin: 16mm 14mm;
            @bottom-right {{
                content: counter(page);
            }}
        }}
        body {{
            font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
            color: #1a1a1a;
            line-height: 1.7;
            font-size: 12.5px;
            padding: 0;
            margin: 0;
        }}
        .header-brand {{
            border-bottom: 2px solid #111;
            padding-bottom: 6px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .header-title {{
            font-size: 13px;
            font-weight: bold;
            color: #111;
            letter-spacing: 0.05em;
        }}
        .header-date {{
            font-size: 11px;
            color: #666;
        }}
        h1 {{
            font-size: 22px;
            color: #111;
            margin-top: 0;
            margin-bottom: 8px;
            line-height: 1.4;
            page-break-after: avoid;
        }}
        h2 {{
            font-size: 16px;
            background: #f4f4f5;
            border-left: 5px solid #111;
            padding: 8px 12px;
            margin-top: 26px;
            margin-bottom: 12px;
            page-break-after: avoid;
        }}
        h3 {{
            font-size: 13.5px;
            color: #27272a;
            margin-top: 20px;
            margin-bottom: 8px;
            border-bottom: 1px dashed #d4d4d8;
            padding-bottom: 4px;
            page-break-after: avoid;
        }}
        h4 {{
            font-size: 12.5px;
            margin-top: 14px;
            margin-bottom: 6px;
            page-break-after: avoid;
        }}
        p {{
            margin: 6px 0 10px;
        }}
        strong {{
            color: #09090b;
        }}
        code {{
            background: #f1f5f9;
            color: #0f172a;
            padding: 1.5px 5px;
            border-radius: 4px;
            font-family: Consolas, Monaco, monospace;
            font-size: 11px;
            border: 1px solid #e2e8f0;
        }}
        pre {{
            background: #18181b;
            color: #fafafa;
            padding: 12px 14px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 11px;
            line-height: 1.55;
            page-break-inside: avoid;
            margin: 10px 0 14px;
        }}
        pre code {{
            background: transparent;
            color: inherit;
            padding: 0;
            border: none;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 18px;
            font-size: 11px;
            page-break-inside: avoid;
        }}
        th, td {{
            border: 1px solid #d4d4d8;
            padding: 6px 9px;
            text-align: left;
            vertical-align: top;
            line-height: 1.5;
        }}
        th {{
            background: #f4f4f5;
            font-weight: bold;
            color: #18181b;
            white-space: nowrap;
        }}
        tr:nth-child(even) td {{
            background: #fafafa;
        }}
        ul, ol {{
            margin: 6px 0 12px;
            padding-left: 20px;
        }}
        li {{
            margin-bottom: 4px;
        }}
        hr {{
            border: none;
            border-top: 1px solid #e4e4e7;
            margin: 22px 0;
        }}
        a {{
            color: #0284c7;
            text-decoration: none;
        }}
    </style>
</head>
<body>
<div class="header-brand">
    <span class="header-title">MANEKIN FASHION 2026 - ARCHITECTURE & CODE MANUAL</span>
    <span class="header-date">BEGINNER GUIDE (PDF版)</span>
</div>
{body_html}
</body>
</html>'''

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print('HTML created. Converting to PDF via Chrome...')
cmd = [
    chrome_path,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--run-all-compositor-stages-before-draw',
    f'--print-to-pdf={os.path.abspath(pdf_path)}',
    os.path.abspath(html_path)
]
res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
print('Return code:', res.returncode)

if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f'SUCCESS! PDF generated: {pdf_path} ({size_kb:.1f} KB)')
else:
    print('FAILED to generate PDF')

