# -*- coding: utf-8 -*-
"""
replace_html_block_comments.py
index.html 内の無機質な
「<!-- デザイン・配置用のブロック要素（<div class="...">）を開始します -->」や
「<!-- 特定機能・領域のブロック要素（<div id="...">）を開始します -->」を、
そのブロック要素が【サイトのどの部分で何を表しているのか】がひと目でわかる
具体的な日本語説明コメントに書き換えるスクリプト。
"""

import re
import json

# 代表的なクラス・IDから、何を表すブロック要素なのかを判定する辞書
BLOCK_DEFINITIONS = {
    # サイトヘッダー・共通ナビゲーション
    'header-container': 'ヘッダー内のロゴ・ナビメニュー・操作ボタンを横並びで整列させるコンテナ枠',
    'header-tools': 'ヘッダー右側の機能アイコン群（検索・お気に入り・カート・会員メニュー）をまとめるブロック',
    'mobile-menu-drawer': 'スマホ表示時に画面左からスライドして現れる引き出し式メニュー枠',
    'drawer-content': 'スマホメニュー内のリンク一覧や閉じるボタンを包む中身コンテンツ領域ブロック',
    'drawer-header': 'スマホメニューの最上部（閉じるボタンやロゴ）を配置するヘッダーブロック',
    'drawer-footer': 'スマホメニューの最下部（ログインや会員情報へのショートカット）を配置するフッターブロック',
    'menu-overlay': 'スマホメニューが開いているときに画面の奥を薄暗く覆う背景オーバーレイ枠',

    # トップ画面（HOME）
    'hero-section': 'トップ画面最上部でブランドの世界観を大きく魅せるメインビジュアル（ヒーロー）枠',
    'hero-image-wrap': 'ヒーロー用の大きな写真画像を綺麗にトリミング・配置する画像ラッパー枠',
    'hero-overlay': '写真の上に半透明の黒を重ねて文字をくっきり読みやすくする明暗フィルター枠',
    'hero-content': 'ヒーロー写真の中央に載せるキャッチコピーと「商品一覧を見る」ボタンのブロック',
    'concept-section': 'ブランドのこだわりやコンセプトを伝える紹介エリアを表すブロック',
    'concept-grid': '3つのコンセプトカード（シンプル、モダン、試着体験）を3列に並べるグリッド枠',
    'concept-card': 'コンセプトの1項目（アイコン・見出し・説明文）をまとめたカード枠',
    'featured-section': '「TODAY\'S PICKUP」として今日のおすすめ商品を並べる特集セクション枠',
    'section-header': '各セクションの大見出しタイトルと英語サブタイトルを配置するヘッダー枠',
    'section-title-wrap': '見出しテキストを中央揃え・レイアウトするためのラッパー枠',
    'products-grid': '複数の商品カードを均等なタイル状に並べるグリッドレイアウト枠',
    'category-pills-bar': '「ALL」「MEN」「WOMEN」などの対象ジャンルをタブ感覚で切り替えるピルボタン枠',
    'new-arrivals-section': '「NEW ARRIVALS」として新着アイテムをピックアップして並べる新着セクション枠',

    # カタログ画面（CATALOG / ITEMS）
    'catalog-layout': '左側の絞り込みサイドバーと右側の全商品一覧を2列に並べるメイン配置枠',
    'catalog-sidebar': '性別・カテゴリ・価格帯などの絞り込み条件（フィルター）をまとめた左側サイドバー枠',
    'filter-group': '「カテゴリ」「価格」「性別」など、1つの絞り込み項目とその選択肢をまとめる枠',
    'catalog-main-content': '並び替えソート選択と商品カード一覧がずらりと並ぶカタログの右側メイン枠',
    'catalog-top-bar': '該当商品数（件数表示）と「おすすめ順・価格順」ソートメニューを並べる上部バー枠',
    'sort-select-wrap': '並び替え（ソート順）を選ぶプルダウンセレクトボックスを包む枠',

    # 商品詳細画面（ITEM DETAIL）
    'detail-layout': '左側の大きな商品写真と右側の価格・サイズ・購入ボタンを横並びにするレイアウト枠',
    'detail-gallery': '商品の大きなメイン写真をきれいに拡大・表示する画像ギャラリー枠',
    'detail-main-img-box': '商品写真を枠いっぱいに美しく収めるメイン画像ボックス枠',
    'detail-info-column': '商品名、価格、取扱サイズ、購入ボタン、商品概要を縦に整列させる右カラム枠',
    'detail-price-box': '商品の価格（税込）と税抜表示を強調して見せる金額表示枠',
    'detail-options': '商品の色やサイズなどの選択肢・仕様情報を並べるオプション枠',
    'option-group': '取扱サイズ展開やカラーバリエーションを1項目としてまとめる枠',
    'size-chips': '各商品の取扱サイズ（S, M, L, XLなど）をバッジ状に並べて見せるサイズ一覧枠',
    'detail-actions': '「今すぐ購入する」「カートに追加」「お気に入り登録」の各ボタンを並べる注文アクション枠',
    'detail-description-box': '商品の特徴、素材、お手入れ方法（洗濯表示等）を掲載する詳しい説明ボックス枠',

    # お気に入り画面（FAVORITES）
    'favorites-container': 'ユーザーがハートマークを付けたお気に入り商品を一覧表示するコレクション枠',
    'favorites-empty-box': 'お気に入りが1件も登録されていないときに「ハートを押してお気に入り登録してみよう」と案内する空っぽ時案内枠',

    # お会計・注文手続き画面（CHECKOUT）
    'checkout-stepper': '「1 カート → 2 お届け先・決済 → 3 完了」の注文進み具合を視覚的に示すステップバー枠',
    'step-item': '進捗バーの1ステップ（アイコン・ステップ番号・ラベル）を表すブロック',
    'step-line': 'ステップとステップの間をつなぐ進行ライン枠',
    'checkout-layout': '左側のお届け先・決済フォームと、右側のご注文内容・金額サマリーを並べる2カラム枠',
    'checkout-form-column': 'お届け先住所やクーポン・ポイントの入力欄をまとめる左側入力カラム枠',
    'checkout-summary-column': 'カゴの中身の商品リストと最終お支払い合計金額を計算・表示する右側サマリー枠',
    'checkout-section-card': '「お届け先情報」「クーポンの適用」「ポイント利用」などの1つの手続き単位をまとめる白いカード枠',
    'form-row': '入力欄を横並び（郵便番号と都道府県など）で綺麗に2分割・3分割して配置する行ブロック',
    'form-group': '入力項目の「見出しラベル」と「テキスト入力ボックス」を1セットにする入力フォーム枠',
    'summary-card': '小計・クーポン割引額・利用ポイント・送料・最終お支払い合計をわかりやすくまとめる計算カード枠',
    'summary-row': '「小計」や「消費税」「送料」など、金額計算の1行（項目名と金額）を表す行ブロック',
    'summary-total': '最終的に支払う「合計金額（税込）」を大きく太字で強調表示する合計行ブロック',
    'checkout-success-box': '注文完了（サンクスページ）で「ご注文ありがとうございました！」と注文番号を表示するお祝いブロック',

    # ログイン・新規会員登録画面（AUTH）
    'auth-wrapper': '画面の中央にログインや新規登録フォームを美しく中央配置するレイアウト枠',
    'auth-card': 'メールアドレスやパスワードの入力欄、ログインボタンを包む白い認証カード枠',
    'auth-notice-banner': '未ログイン時に「マイページや試着室を利用するにはログインが必要です」と知らせる黄色い案内帯枠',
    'auth-header': '「ログイン」や「新規会員登録」のタイトルと案内メッセージを配置するカード上部ブロック',
    'auth-body': '入力フォームや「ログイン状態を保持する」チェックボックスを配置するカード本体ブロック',
    'auth-footer': '「パスワードを忘れた方」や「新規登録はこちら」の切り替えリンクを並べるカード下部ブロック',
    'demo-login-box': 'ワンクリックですぐに機能を体験できる「デモアカウントで簡単お試しログイン」ボタン枠',

    # マイページ画面（MY PAGE）
    'mypage-layout': '会員プロフィールの概要と過去の注文履歴一覧をまとめるマイページ全体枠',
    'profile-summary-card': '会員名、メールアドレス、会員ランク（ゴールド等）、保有ポイント数を一覧できるプロフィールカード枠',
    'stat-card': '「保有ポイント: 500pt」「保有クーポン: 2枚」などの数字を大きく見せるステータスカード枠',
    'order-history-section': 'これまでにお買い物した過去の注文リストを時系列で並べる購入履歴一覧セクション枠',
    'order-card': '1回分の注文データ（注文番号・購入日時・買った服・合計金額）をまとめた注文カード枠',

    # AI試着マネキンスタジオ画面（STUDIO）
    'studio-today-styling-banner': '気象庁のリアルタイム気温と天気から今日ぴったりの着こなしを自動提案する「TODAY\'S AI STYLING」バナー枠',
    'styling-banner-content': '今日のお天気アイコン、気温、スタイリングアドバイス文、一括試着ボタンを配置するバナー中身枠',
    'studio-layout': '左棚（手持ち服）、中央（マネキンステージ）、右棚（ショップ商品）の3列を配置するスタジオ全体枠',
    'studio-column-closet': '自分が登録した手持ちの服を一覧表示し、試着室へ持っていける左側カラム枠',
    'studio-column-stage': '中央でマネキンに服を着せ替え、サイズや位置を微調整する中央メイン試着室カラム枠',
    'studio-column-brand': 'お店で販売中の服を一覧表示し、試着やまとめ買いができる右側カラム枠',
    'col-header': '各カラムの最上部にカラム名（「マイクローゼット」「試着室」「ショップアイテム」）を表示する見出しバー枠',
    'col-title-wrap': 'カラムタイトルと服の件数バッジを横並びに配置するラッパー枠',
    'studio-tab-bar': '「試着室」「手持ち服一覧」「お気に入り」「保存済みコーデ」を切り替えるメインタブ枠',
    'manekin-stage-wrapper': 'マネキンの全身画像と服の重なり順（レイヤー）をきれいに中央配置する試着室ステージ外枠',
    'manekin-stage': '帽子・トップス・インナー・ボトムス・靴の5枚の画像を正しい重なり順で合成・描画するマネキン試着ステージ枠',
    'manekin-slots-bar': 'マネキンの足元に「帽子」「トップス」「靴」などの着用アイコンと脱衣×ボタンを並べる着用スロットバー枠',
    'fitting-adjust-panel': '着ている服の上下位置(Y軸)・左右位置(X軸)・拡大縮小率をスライダーでミリ単位で動かす微調整パネル枠',
    'adjust-slider-row': '1つの調整項目（上下、左右、サイズ）のスライダーと＋/－微動ボタンを横並びにする行ブロック',
    'studio-action-bar': '「全身クリア」「このコーデを保存」「着ている服をまとめてカゴへ」などの便利ボタンを並べる操作バー枠',
    'saved-outfits-grid': '過去に自分で作って保存したお気に入りコーディネートをカードで並べる保存済みコーデコレクション枠',

    # モーダル・ポップアップ小窓（MODAL）
    'modal-backdrop': 'ポップアップが開いたときに画面の奥を薄暗くブロックする半透明の背景オーバーレイ枠',
    'modal-dialog': '画面の中央に浮かび上がる白いポップアップウィンドウ本体ブロック',
    'modal-header': 'ポップアップのタイトルと右上の「×（閉じる）」ボタンを配置するヘッダー枠',
    'modal-body': 'ポップアップ内の入力フォームやリスト一覧がスクロールできる本体コンテンツ枠',
    'modal-actions': '「保存する」「キャンセル」「登録する」などの決定ボタンを並べるフッター操作枠',

    # 手持ち服登録モーダル（ADD CLOSET MODAL）
    'upload-dropzone': 'スマホのカメラ撮影や、PCから服の写真をドラッグ＆ドロップして読み込ませる写真アップロード枠',
    'closet-preview-container': 'アップロードした写真やAI切り抜き後の透明画像をプレビュー表示する枠',
    'ai-progress-container': 'AIが写真を解析して背景を切り抜いているときの進行度プログレスバー枠',
    'ai-cutout-toolbar': '「✨ AIで背景を自動透過する」チェックや「🪄 背景を透過」「↺ 元写真に戻す」ボタンを並べるAI操作バー枠',
    'zipper-cutout-panel': 'チャックの隙間や襟元を手動でなぞって透明化しインナーが見えるようにする「チャック・襟元の隙間くり抜きツール」枠',
    'cutout-tools-bar': '消しゴム、直線定規、1手戻すなどのくり抜き操作ツールボタンを並べるツールバー枠',
    'cutout-size-slider-box': '消しゴムの太さ（サイズ）をスライダーで変更する操作枠',
    'cutout-canvas-container': '服の写真を直接なぞって透明化を描き込むキャンバス（Canvas）配置枠',
    'cutout-footer-actions': 'くり抜き作業の「完了（反映する）」や「閉じる」ボタンを並べるフッター枠',
    'ai-diagnosis-card': 'AIが写真の形やシルエットを分析して服のカテゴリ（シャツ、ズボン等）を自動判定して知らせる診断カード枠',

    # サイトフッター（FOOTER）
    'site-footer': 'サイトの最下部に常駐し、ブランド情報やリンク集、著作権をまとめるサイト共通フッター枠',
    'footer-container': 'フッター内の各コンテンツを横並び・中央揃えで整列させるコンテナ枠',
    'footer-brand-column': 'ブランドロゴ、コンセプトメッセージ、SNSリンクを配置するフッター左側カラム枠',
    'footer-nav-column': 'ショッピングガイドや利用規約、お問い合わせへのリンクを並べるフッター右側カラム枠',
    'footer-links-column': 'フッター内のリンク一覧をカテゴリごとに縦に並べるリンク列ブロック',
    'footer-bottom': '最下部のコピーライト（© 2026 MANEKIN FASHION）と免責事項を配置する最下行ブロック',

    # パンくずリスト・共通コンポーネント
    'page-breadcrumb': '「HOME > SHOP > 商品名」のように今いる階層をナビゲートするパンくずリスト枠',
    'container': 'ページ全体の横幅が広がりすぎないように最大幅を制限して中央揃えにするコンテナ枠',
    'page-container': '各ページのメインコンテンツを画面中央に心地よい余白で配置するコンテナ枠'
}

def get_explanation_for_tag_and_attrs(tag_str):
    # 例: div class="header-container"
    #     div id="mobile-menu-drawer" class="mobile-menu-drawer"
    classes = re.findall(r'class=[\'"]([^\'"]+)[\'"]', tag_str)
    ids = re.findall(r'id=[\'"]([^\'"]+)[\'"]', tag_str)
    
    class_tokens = []
    if classes:
        for c in classes[0].split():
            class_tokens.append(c)
    id_val = ids[0] if ids else ''

    # ID や Class からマッチする説明を探す
    candidates = []
    if id_val and id_val in BLOCK_DEFINITIONS:
        return f"【{id_val}】" + BLOCK_DEFINITIONS[id_val]
    
    for c in class_tokens:
        if c in BLOCK_DEFINITIONS:
            candidates.append(BLOCK_DEFINITIONS[c])

    if candidates:
        return f"【{class_tokens[0]}】" + candidates[0]

    # 特殊なパターン判定
    if 'form-group' in tag_str:
        return "【入力欄セット】ラベル見出しと入力ボックスを1つにまとめたフォーム入力枠"
    if 'form-row' in tag_str:
        return "【横並び入力行】複数の入力欄（郵便番号や都道府県など）を横一列に整列させる行枠"
    if 'roadmap' in tag_str:
        return "【ロードマップ項目】開発計画や機能追加の進捗を案内する項目枠"
    if 'slider' in tag_str:
        return "【スライダー操作枠】数値や位置を調整するスライダー入力枠"
    if 'card' in tag_str:
        return "【カード型表示枠】関連する情報や画像・ボタンを1つにまとめたカードブロック"

    # デフォルト
    name = id_val or (class_tokens[0] if class_tokens else 'block')
    return f"【{name}】画面のレイアウトや配置を整えるブロック要素"

def run_replacement():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    count = 0
    def replacer(match):
        nonlocal count
        tag_content = match.group(1).strip() # 例: div class="header-container"
        explanation = get_explanation_for_tag_and_attrs(tag_content)
        count += 1
        return f'<!-- {explanation}（<{tag_content}>）を開始します -->'

    # パターン: <!-- (?:デザイン・配置用|特定機能・領域)のブロック要素（<([^>]+)>）を開始します -->
    pattern = re.compile(r'<!-- (?:デザイン・配置用|特定機能・領域)のブロック要素（<([^>]+)>）を開始します -->')
    new_content = pattern.sub(replacer, content)

    with open('index.html', 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)

    print(f'Successfully replaced {count} block comments in index.html!')

if __name__ == '__main__':
    run_replacement()
