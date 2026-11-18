# ==============================================================================
#  js/app.js の AppState に selectedGender プロパティを追加する使い切り補助スクリプト
#  ※ 過去の修正時に性別絞り込み状態を追加するために使ったファイルです（通常は再実行不要）
# ==============================================================================

# js/app.js を UTF-8 の読み取りモード('r')で開き、終了時に自動で閉じる with ブロックを開始します
with open('js/app.js', 'r', encoding='utf-8') as f:
    # 開いた js/app.js の中身すべてを 1 つの大きな文字列として変数 c に読み込みます
    c = f.read()

# ファイル内で書き換え位置の目印にする既存の文字列（selectedCategory と selectedSort）を変数 target に用意します
target = '    selectedCategory: "ALL",\n    selectedSort: "default"'
# 目印の先頭に 'selectedGender: "ALL",' を差し込んだ新しい文字列を変数 replacement に用意します
replacement = '    selectedGender: "ALL",\n    selectedCategory: "ALL",\n    selectedSort: "default"'

# 読み込んだコード文字列 c の中に target が本当に含まれているか確認します
if target in c:
    # 見つかった最初の 1 か所だけ target を replacement に置き換えます
    c = c.replace(target, replacement, 1)
    # js/app.js を UTF-8 の書き込みモード('w')で開き直します
    with open('js/app.js', 'w', encoding='utf-8') as f:
        # 置き換え後の全テキスト c をファイルに上書き保存します
        f.write(c)
    # 追記が成功したことをコンソール画面に表示します
    print("selectedGender added to AppState!")
# 目印となる文字列が見つからなかった（すでに適用済み等の）場合の分岐です
else:
    # 書き換えは行わずに、対象が見つからなかったことをコンソールへ表示します
    print("Target not found")
