# 📘 MANEKIN FASHION 初心者向け完全解説書
**〜 ID名・クラス名と HTML / CSS / JavaScript / Python の動きがひと目でわかるガイド 〜**

---

## 1. サイト全体の仕組み（4つの言語の役割分担）

このサイトは、人間やお店に例えると次の **4つの役割** がバトンパスをしながら動いています。

1. **HTML ([index.html](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/index.html)) ＝【骨組み・名札】**
   - 画面にボタンや入力欄・箱を置き、それぞれに **`id`（世界に1つの名札）** と **`class`（グループ用の制服）** を付けます。
2. **CSS ([css/style.css](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/css/style.css) ほか4ファイル) ＝【見た目・デザイン】**
   - 主に **`class`（`.〇〇`）** を見て、色・文字サイズ・余白・横並び（Flexbox / Grid）・スマホ画面対応を整えます。
3. **JavaScript ([js/shop.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/shop.js), [js/studio.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/studio.js), [js/app.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/app.js)) ＝【画面の動き・司令塔】**
   - 主に **`id`（`#〇〇`）** を `document.getElementById('〇〇')` で見つけ出し、クリックされた時に金額やポイントの文字を書き換えたり、Pythonサーバーへ通信（`fetch`）を送ったりします。
4. **Python ([app.py](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/app.py)) & MySQL ([setup_db.py](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/setup_db.py)) ＝【裏方の金庫番】**
   - JavaScriptから送られてきた「会員登録」「ログイン」「注文確定」「手持ち服登録」などのデータを MySQL（`manekin_db`）のテーブルに永久保存します（※スマホ版ではPython/MySQLの代わりにブラウザ内の `localStorage` に自動保存します）。

---

## 2. ファイル構成マップ（どこに何が書いてある？）

| 種類 | ファイル名 | 役割（何をしているファイルか） |
| :--- | :--- | :--- |
| **HTML** | [index.html](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/index.html) | 全10画面の骨組みが1ファイルに入った **SPA（シングルページアプリケーション）** 本体 |
| **CSS親** | [css/style.css](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/css/style.css) | 下の4つのCSSファイルを順番に読み込む目次ファイル |
| **CSS①** | [css/base.css](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/css/base.css) | サイト共通の色変数（`--color-black`等）、フォント、固定ヘッダー、ボタン、画面切替（`.page-view`） |
| **CSS②** | [css/shop.css](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/css/shop.css) | トップ看板、商品カード、商品詳細、カート・注文画面、ログイン、マイページの見た目 |
| **CSS③** | [css/studio.css](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/css/studio.css) | MANEKIN AI試着スタジオ（3列レイアウト、マネキン舞台、クローゼット、AI診断）の見た目 |
| **CSS④** | [css/responsive.css](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/css/responsive.css) | タブレット（`1024px`以下）・スマホ（`768px`以下）になった時にレイアウトを自動変形する設定 |
| **JS①** | [js/products-data.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/products-data.js) | 全24着の商品データ辞書（`SAMPLE_PRODUCTS`）と着回しヒント辞書 |
| **JS②** | [js/shop.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/shop.js) | お買い物機能・カート・ポイント＆クーポン計算・ログイン認証・MySQL/localStorage通信 |
| **JS③** | [js/studio.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/studio.js) | AI試着スタジオ機能（着せ替え、サイズ・位置微調整、写真アップロード＆AI背景透過、色彩診断） |
| **JS④** | [js/app.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/app.js) | サイト起動時の初期設定、全体状態（`AppState`）、URLハッシュ（`#home`等）による画面切替ルーター |
| **Python** | [app.py](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/app.py) | Flask Webサーバー。JSからの通信（`/api/...`）を受け取り、MySQLデータベースを読み書きする裏方 |
| **Python** | [setup_db.py](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/setup_db.py) | MySQLに `manekin_db` データベースと全テーブルを自動作成する初期セットアップ用スクリプト |

---

## 3. 画面切り替え（SPA）の仕組み

このサイトはページを移動するたびに別HTMLを読み込むのではなく、[index.html](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/index.html) の中にある **10個の `<section class="page-view" id="view-〇〇">` のうち、今見たい1つだけに `.active` クラスを付けて表示する** 仕組み（SPA）になっています。

| ID名 / クラス名 | HTMLでの場所 | CSSでの動き (`base.css`) | JavaScriptでの動き (`app.js`) |
| :--- | :--- | :--- | :--- |
| `.page-view` | 全10画面の `<section>` に共通で付与 | 普段は `display: none;` で画面から隠しておく | `handleRoute()` 関数が画面切替時に一度すべての `.page-view` から `.active` を外す |
| `.page-view.active` | 現在表示中の画面1つだけに付く | `display: block;` になり、ふわっと浮かび上がるアニメーション（`fadeInView`）が動く | URLの `#〇〇` に応じて、対象画面（例：`#view-home`）に `classList.add('active')` する |
| `#view-home` | View 1: トップページ | トップ画面の枠 | `#home` のときに表示。`renderHomeProducts()` でおすすめ商品を描画 |
| `#view-items` | View 2: 商品一覧（ALL ITEMS） | カタログ画面の枠 | `#items` のときに表示。カテゴリ・性別・並び順で絞り込み描画 |
| `#view-new-items` | View 3: 新作一覧（NEW ITEM） | 新作画面の枠 | `#new-items` のときに表示。`isNew: true` の商品だけを描画 |
| `#view-item-detail` | View 4: 商品詳細画面 | 商品詳細2列レイアウト枠 | 商品クリック時に `openItemDetail(id)` で色・サイズ・写真を差し替えて表示 |
| `#view-favorites` | View 5: お気に入り一覧 | お気に入り画面の枠 | `#favorites` のときに表示。ハートを押した商品一覧を描画 |
| `#view-manekin` | View 6: AI試着スタジオ | スタジオ専用画面枠 | `#manekin` のときに表示（未ログイン時は `#login` へ誘導） |
| `#view-checkout` | View 7: カート＆注文手続き | レジ画面の2列枠 | `#checkout` のときに表示。カート中身・クーポン・ポイント・請求額を計算 |
| `#view-mypage` | View 8: マイページ | 会員情報＆注文履歴枠 | `#mypage` のときに表示。ランク・保有ポイント・クーポン枚数・注文履歴を表示 |
| `#view-login` | View 9: ログイン画面 | 中央寄せログインカード枠 | `#login` のときに表示。ログイン成功時は即 `#home` へ自動遷移 |
| `#view-register` | View 10: 新規会員登録画面 | 中央寄せ会員登録カード枠 | `#register` のときに表示。登録成功時は即 `#home` へ自動遷移 |

---

## 4. 機能別：ID名・クラス名と CSS / JS / Python の詳細連携表

### ① 共通ヘッダー・ナビゲーション（画面上部）

| ID名 / クラス名 | 種類 | CSSの動き (`base.css`) | JavaScriptの動き (`shop.js` / `app.js`) | Pythonの動き (`app.py`) |
| :--- | :---: | :--- | :--- | :--- |
| `#site-header` / `.site-header` | ID / Class | `position: fixed; top: 0;` でスクロールしても常に画面上部に固定表示（高さ `68px`） | スクロール量に応じて影を付けたり、メニュー開閉を制御 | — |
| `.nav-link` | Class | 横並びメニュー文字。`.active` が付くと下に黒い太線が出る | `handleRoute()` が現在のページに対応する `.nav-link` に `.active` を付与 | — |
| `#header-fav-count` | ID | ハートアイコン右上の赤い丸バッジ（`.icon-badge`） | `updateFavoriteBadges()` が `AppState.favorites.length`（お気に入り件数）を書き込む | `GET /api/favorites` でDBの件数を返却 |
| `#header-cart-count` | ID | バッグアイコン右上の黒い丸バッジ（`.cart-badge`） | `updateCartBadge()` がカートの合計点数を計算して数字を書き込む | `GET /api/cart/<uid>` でDBのカートを返却 |
| `#header-auth-text` | ID | MYPAGEアイコン下の小さな文字ラベル | `updateAuthNavUI()` が未ログインなら `MYPAGE`、ログイン中なら会員名に書き換える | `GET /api/auth/me` でログイン中会員を返却 |
| `#mobile-menu-drawer` | ID | 普段は画面左外（`translateX(-100%)`）に隠れているスマホ用メニュー。`.open` で右へスライド出現 | `openMobileDrawer()` / `closeMobileDrawer()` で `.open` クラスを付け外しする | — |

---

### ② 商品一覧・商品カード・商品詳細画面

| ID名 / クラス名 | 種類 | CSSの動き (`shop.css`) | JavaScriptの動き (`shop.js`) | Pythonの動き (`app.py`) |
| :--- | :---: | :--- | :--- | :--- |
| `.product-grid` | Class | `display: grid; grid-template-columns: repeat(4, 1fr);` で商品を4列（スマホは2列）に整列 | — | — |
| `#home-pickup-grid`<br/>`#catalog-product-grid`<br/>`#new-items-grid` | ID | `.product-grid` が適用された商品一覧の親箱 | `renderHomeProducts()` / `renderCatalogProducts()` / `renderNewItems()` が商品カードHTMLを作って流し込む | `GET /api/products` で商品一覧を返却 |
| `.product-card` | Class | 商品1枚のカード枠。ホバーすると画像が少し拡大（`scale(1.04)`） | `createProductCardHTML(product)` 関数がこのHTMLを自動生成する | — |
| `.fav-heart-btn` | Class | 商品画像右上の丸いハートボタン。`.active` が付くと赤色になる | ハート押下時に `handleToggleFavorite(id)` が動き、お気に入り配列とバッジを更新 | `POST /api/favorites/toggle` でMySQLの `favorites` テーブルに追加・削除 |
| `.color-dot` | Class | 商品カードの小さな丸い色見本ボタン。`.active` で二重枠になる | `selectCardColor()` が押された色の写真に `<img id="card-img-〇〇">` を即座に差し替える | — |
| `#item-detail-layout` | ID | 左に大きな写真、右にサイズ選択・カート追加ボタンを並べる2列枠 | `openItemDetail(productId)` が選択商品の詳細HTMLを組み立てて挿入し、`#item-detail` 画面へ遷移 | — |
| `.size-btn` | Class | `S / M / L / XL` の四角いサイズ選択ボタン。`.active` で黒塗りになる | `selectDetailSize(size)` で選択サイズ（`detailSelectedSize`）を切り替え | — |

---

### ③ カート＆チェックアウト（注文手続き・クーポン・ポイント）画面（`#view-checkout`）

| ID名 / クラス名 | 種類 | CSSの動き (`shop.css`) | JavaScriptの動き (`shop.js`) | Pythonの動き (`app.py`) |
| :--- | :---: | :--- | :--- | :--- |
| `#checkout-cart-items` | ID | カート内商品のリスト枠（左カラム上部） | `renderCheckoutView()` がカート内の商品写真・色・サイズ・数量（`＋`/`ー`）・削除ボタンを描画 | `POST /api/cart/sync` で変更ごとにMySQLの `cart_items` テーブルへ同期保存 |
| `#checkout-coupon-box` | ID | オレンジ背景（`#fffcf7`）のクーポン利用選択枠 | — | — |
| `#checkout-coupons-list` | ID | クーポン名と「**適用する**」「**利用しない**」ボタンが並ぶコンテナ | `renderCheckoutCoupons()` が保有クーポンを描画。ボタン押下で `handleApplyCouponCode()` / `handleCancelCoupon()` が動き10%割引を適用・解除 | `GET /api/coupons` で未使用クーポンを取得。注文確定時に `user_coupons.is_used = 1` に更新して消滅 |
| `#checkout-point-card` / `.checkout-point-card` | ID / Class | 左に太い黒線が入ったポイント利用枠 | — | — |
| `#checkout-user-points` | ID | 「保有ポイント: **〇〇** pt」の緑色の数字部分 | `setUserPoints()` と `updateCheckoutCalculations()` が、**購入履歴から加算されたポイント合計（−利用分）** を自動計算して表示 | `GET /api/orders` や `POST /api/orders` で `users.points` を計算・保存 |
| `.point-input-group` / `#checkout-use-points` | Class / ID | 横幅 `145px` に収めたコンパクトなポイント数値入力欄（右横に「全額使う」「取消」ボタンが並ぶ） | `handlePointsInputChange()` / `handleUseAllPoints()` / `handleResetPoints()` が利用ポイント数を変更し、即座に請求額を再計算（※配送料にはポイントは使えず商品小計のみ対象） | `POST /api/orders` で `used_points` を検証し、`users.points` から差し引く |
| `#checkout-subtotal`<br/>`#checkout-coupon-discount`<br/>`#checkout-point-discount`<br/>`#checkout-shipping`<br/>`#checkout-total` | ID | 右カラム「ご請求内容」カード内の各金額表示行 | `updateCheckoutCalculations()` がリアルタイムに `商品合計 − クーポン割引 − ポイント割引 ＋ 配送料(5,000円以上無料/未満550円) ＝ お支払い合計` を計算して書き換える | `POST /api/orders` でも同じ計算式で不正がないか再計算してDB保存 |
| `.checkout-earned-points-card` / `#checkout-earned-points` | Class / ID | 緑の点線枠「✨ 今回獲得予定のポイント（`+〇〇 pt`）」 | `updateCheckoutCalculations()` がお支払い合計の **1%**（最低1pt）を計算し、`+88 pt` のように表示 | `POST /api/orders` で `orders.earned_points` に記録し、`users.points` に加算 |
| `#btn-place-order` | ID | 黒い大きな「**注文を確定する**」ボタン | クリックで `handlePlaceOrder()` が実行され、入力チェック→注文送信→ポイント加算→購入した服をマイクローゼットへ自動追加→完了画面表示を行う | `POST /api/orders` で `orders`・`order_items`・`closet_items`・`users.points`・`user_coupons`・`cart_items` を1トランザクションで一括更新 |

---

### ④ ログイン・新規会員登録・マイページ画面

| ID名 / クラス名 | 種類 | CSSの動き (`shop.css`) | JavaScriptの動き (`shop.js`) | Pythonの動き (`app.py`) |
| :--- | :---: | :--- | :--- | :--- |
| `#login-form`<br/>`#login-email`<br/>`#login-password` | ID | ログイン画面の入力フォームとテキスト欄 | `handleLogin(e)` が入力値を取得し認証後、`redirectToHome()` で **即座にHOME画面（`#home`）へ自動遷移** させ `alert('ログインされました')` を表示 | `POST /api/auth/login` でMySQLの `users` を照合し、HttpOnly Cookie（`manekin_session`）を発行 |
| `#register-form`<br/>`#reg-name`<br/>`#reg-email`<br/>`#reg-password` | ID | 新規会員登録画面の入力フォーム | `handleRegister(e)` が新規登録を行い、完了と同時に **HOME画面（`#home`）へ自動遷移** させる | `POST /api/auth/register` で `users` に新規追加（初期ポイント0pt）し、初回限定10%OFFクーポン（`WELCOME10`）を `user_coupons` に自動付与 |
| `#mypage-user-name`<br/>`#mypage-points`<br/>`#mypage-coupon-count`<br/>`#mypage-order-count` | ID | マイページ上部の会員プロフィール・ステータスカード | `renderMyPage()` がログイン中会員の氏名・保有ポイント・未使用クーポン枚数・注文回数を流し込む | `GET /api/auth/me`, `GET /api/orders`, `GET /api/coupons` のデータを反映 |
| `#orders-table-body` | ID | マイページの「ご注文履歴」テーブル本体（`<tbody>`） | `renderMyPage()` が注文番号・日付・購入者名・商品内訳・支払金額・獲得ポイント・クローゼット取込ボタンを行ごとに生成 | `GET /api/orders` でMySQLの `orders` と `order_items` を結合して返却 |

---

### ⑤ MANEKIN AI試着スタジオ画面（`#view-manekin`）

| ID名 / クラス名 | 種類 | CSSの動き (`studio.css`) | JavaScriptの動き (`studio.js`) | Pythonの動き (`app.py`) |
| :--- | :---: | :--- | :--- | :--- |
| `.studio-workspace-grid` | Class | 左（手持ち服クローゼット）・中央（マネキン試着舞台）・右（ブランド商品＆AI診断）の **3列グリッド** | — | — |
| `#studio-pane-create`<br/>`#studio-pane-saved`<br/>`#studio-pane-closet` | ID | スタジオ上部の3つのタブ（「コーデ作成」「保存したコーデ」「マイクローゼット管理」）で切り替わる画面枠 | `switchStudioTab(tabName)` が `.active` を付け替えて表示タブを切り替える | — |
| `#mannequin-stage` / `.mannequin-figure-container` | ID / Class | 中央のマネキン全身ステージ（`position: relative;`） | `renderMannequinStage()` がマネキンシルエットの上に5部位の服レイヤーを重ねて描画し、ドラッグ移動やピンチ拡大縮小を受け付ける | `POST /api/studio-state/save` で現在の着用服と位置・拡大率をMySQLの `user_studio_state` に自動保存 |
| `#layer-hat`<br/>`#layer-outer`<br/>`#layer-tops`<br/>`#layer-bottoms`<br/>`#layer-shoes` | ID | マネキンの頭・アウター・トップス・ボトムス・靴の位置に `position: absolute;` で重なる5つの服レイヤー枠 | `equipClosetItem()` や `equipBrandItem()` で服を着せると画像が表示され、`updateLayerTransform()` がX/Y座標と拡大率（`transform: translate(...) scale(...)`）をリアルタイム反映する | — |
| `#studio-closet-list` | ID | 左カラムの「手持ちの服（マイクローゼット）」一覧枠 | `renderStudioClosetList()` が手持ち服＆購入済み服のカードを描画する | `GET /api/closet/<uid>` でMySQLの `closet_items` から取得 |
| `#add-closet-modal`<br/>`#closet-file-input` | ID | 「＋ 手持ちの服を写真登録」で開くモーダルと写真ファイル選択欄 | `handleClosetImageUpload()` が選んだ写真から **AI（`@imgly/background-removal`）またはCanvasエッジ透過アルゴリズムで背景を自動切り抜き** し、さらに **MobileNet AIでカテゴリ（TOPS/BOTTOMS等）と色を自動判定** する | `POST /api/closet/add` で切り抜いた服画像（DataURL）とカテゴリ・色をMySQLの `closet_items` に保存 |
| `#ai-stylist-card`<br/>`#ai-score-val`<br/>`#ai-color-diagnosis-box` | ID | 右カラムの「AI STYLIST 診断カード」と「🎨 AIカラー構成診断バー」 | `updateAIStylingComment()` が現在マネキンが着ている服の組み合わせから **ベースカラー・アソートカラー・アクセントカラーの比率と色彩調和スコア（最大98点）** をリアルタイム計算して表示 | — |
| `#outfit-name-input`<br/>`#saved-outfits-grid` | ID | コーデ名入力欄と「保存したコーデ」一覧グリッド | `handleSaveOutfit()` で現在の全身コーデを名前付きで保存し、`renderSavedOutfitsGrid()` で一覧カード表示（ワンクリックで再着用可能） | `POST /api/outfits/save` / `GET /api/outfits/<uid>` でMySQLの `saved_outfits` テーブルに保存・取得 |

---

## 5. デスクトップ版（MySQL）とスマホ版（localStorage）の自動切り替えの仕組み

[js/shop.js](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/js/shop.js#L11-L24) の先頭にある `isMobileLocalStorageMode()` 関数が、現在の端末を自動判定しています。

1. **デスクトップ版（PCブラウザ）の場合：`isMobileLocalStorageMode() === false`**
   - すべてのデータ（会員登録・ログイン・カート・お気に入り・クーポン・保有ポイント・注文履歴・マイクローゼット・保存コーデ・マネキン試着状態）を **`fetch()` 通信で Python ([app.py](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/app.py)) へ送り、MySQL (`manekin_db`) に保存・復元** します。
   - ブラウザの `localStorage` は `purgeAllManekinLocalStorage()` によって自動的に空に保たれます。
2. **スマホ版（iPhone / Android 実機、またはタッチ端末エミュレーション）の場合：`isMobileLocalStorageMode() === true`**
   - スマホ環境では Python サーバーや MySQL が動かせないため、自動的にブラウザ内の **`localStorage`（キー名：`manekin_ls_*`）へ保存・復元するモード** に切り替わり、ログインから注文・ポイント加算・試着保存まですべてサーバーなしで完結動作します。

---

## 6. Python (`app.py`) の API エンドポイント早見表

JavaScript から `fetch()` で呼び出される [app.py](file:///c:/xampp/htdocs/Antigravity_manekin/MANEKIN2026-2/app.py) の裏方窓口（API）一覧です。

| URLパス | メソッド | Python関数名 | どんな動きをするか（対応するMySQLテーブル） |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | `health_check()` | PythonサーバーとMySQLが正常に繋がっているか確認（マイページの緑バッジ表示用） |
| `/api/auth/register` | `POST` | `register_user()` | 新規会員登録（`users`）＋初回限定1割引クーポン付与（`user_coupons`）＋セッション発行 |
| `/api/auth/login` | `POST` | `login_user()` | メール・パスワード照合（`users`）＋セッションCookie発行（`user_sessions`） |
| `/api/auth/demo` | `POST` | `demo_login()` | デモ会員（`demo@manekin.jp`）でワンクリックログイン |
| `/api/auth/me` | `GET` | `get_current_auth_user()` | ページ再読込時にCookieからログイン中会員（`users`）を復元 |
| `/api/auth/logout` | `POST` | `logout_user()` | ログアウト時にサーバー側セッション（`user_sessions`）とCookieを破棄 |
| `/api/coupons` | `GET` | `get_user_coupons()` | ログイン会員の保有クーポン一覧（`user_coupons`）を取得（未配布なら初回クーポンを自動付与） |
| `/api/orders` | `POST` | `create_order()` | 注文確定処理（`orders`, `order_items` 保存、購入服を `closet_items` へ自動登録、クーポン消滅、ポイント精算＆加算、カート空化） |
| `/api/orders` | `GET` / `DELETE` | `get_orders()` / `clear_orders()` | 注文履歴の取得＆購入ポイント合計の同期（`GET`）、または注文履歴と保有ポイントの初期化（`DELETE`） |
| `/api/cart/<uid>`<br/>`/api/cart/sync` | `GET` / `POST` | `get_cart()` / `sync_cart()` | カートの中身（`cart_items`）の取得と上書き同期 |
| `/api/favorites/<uid>`<br/>`/api/favorites/toggle` | `GET` / `POST` | `get_favorites()` / `toggle_favorite()` | お気に入り商品ID（`favorites`）の取得とハートON/OFF切り替え |
| `/api/closet/<uid>`<br/>`/api/closet/add`<br/>`/api/closet/delete/<id>` | `GET` / `POST` / `DELETE` | `get_closet()` / `add_closet_item()` / `delete_closet_item()` | マイクローゼットの手持ち服・購入服（`closet_items`）の取得・写真追加・削除 |
| `/api/outfits/<uid>`<br/>`/api/outfits/save`<br/>`/api/outfits/delete/<id>` | `GET` / `POST` / `DELETE` | `get_outfits()` / `save_outfit()` / `delete_outfit()` | 保存したマイコーデ（`saved_outfits`）の取得・保存・削除 |
| `/api/studio-state/<uid>`<br/>`/api/studio-state/save` | `GET` / `POST` | `get_studio_state()` / `save_studio_state()` | マネキンが今着ている服・X/Y位置・サイズ拡大率・性別設定（`user_studio_state`）の保存・復元 |

