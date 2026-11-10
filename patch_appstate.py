# ==============================================================================
# js/app.js の AppState 定義へ selectedGender を追加するための補助パッチスクリプト
# ==============================================================================

# 'js/app.js' を読み込み専用('r')・文字コードUTF-8で開き、閉じ忘れを防ぐ with 構文で変数 f に割り当てます
with open('js/app.js', 'r', encoding='utf-8') as f:
    # ファイルの中身を丸ごと文字列として読み込み、変数 c に保存します
    c = f.read()

# 書き換えたい元の記述パターン（選択カテゴリと並び順の行）を探しやすいように変数 target に入れます
target = '    selectedCategory: "ALL",\n    selectedSort: "default"'
# 上のパターンの先頭に「selectedGender: "ALL",」を追加した新しい文字列を変数 replacement に作ります
replacement = '    selectedGender: "ALL",\n    selectedCategory: "ALL",\n    selectedSort: "default"'

# 読み込んだ js/app.js の中身（c）の中に、目的の文字列（target）が存在するかを判定します
if target in c:
    # 最初に見つかった1か所（第3引数の 1）だけを新しい文字列（replacement）に置換して c を更新します
    c = c.replace(target, replacement, 1)
    # 今度は同じ 'js/app.js' を書き込み専用('w')・UTF-8で開き直します（既存内容は上書きされます）
    with open('js/app.js', 'w', encoding='utf-8') as f:
        # 置換済みの新しいプログラム文字列をファイルへ書き戻します
        f.write(c)
    # 正常にパッチが当たったことを画面へ表示します
    print("selectedGender added to AppState!")
# もし target の文字列が見つからなかった場合（すでに適用済みかコード変更後など）の処理です
else:
    # 対象が見つからず何も変更しなかったことを画面へ知らせます
    print("Target not found")


