# -*- coding: utf-8 -*-
"""
rewrite_roles.py
全JSファイル(app.js, shop.js, studio.js)の関数の【役割】コメントを、
「〜係」「〜役」「〜担当」の直感的で親しみやすい形式に書き換えるスクリプト。
ロジック行は1文字も変更せず、コメント行のみを置換する。
"""

import os
import re

APP_ROLES = {
    "handleRouting": "URLのハッシュ（#homeや#shopなど）を見て、ユーザーを正しい画面へ連れて行く道案内係",
    "updateAuthNoticeBanner": "ログイン画面に来たユーザーに対して「あなた専用の案内メッセージ」を表示する案内係",
    "showView": "指定された画面だけをパッと目の前に出して他を隠す画面切り替え係",
    "highlightNavLink": "メニューバーの「今いる場所」をピカッと光らせて教えてくれる現在地案内係",
    "setupEventListeners": "アプリ全体の「ボタンを押した時に動く仕組み」を作る準備係",
}

SHOP_ROLES = {
    "isMobileLocalStorageMode": "パソコン版かスマホ版（ブラウザ保存モード）かを判定する環境チェック係",
    "lsGetJson": "スマホ用ブラウザ保存（localStorage）からデータを安全に取り出す引き出し係",
    "lsSetJson": "スマホ用ブラウザ保存（localStorage）へデータを綺麗にしまう収納係",
    "getDefaultMobileClosetItems": "スマホ版を初めて開いた人へ「初期手持ち服3点セット」をプレゼントする準備係",
    "ensureMobileUserInitialized": "スマホ版ユーザーの初回登録時に必要な初期データを整えるセットアップ係",
    "purgeAllManekinLocalStorage": "パソコン版で動かす時に、古いブラウザの一時データを綺麗に掃除するお片付け係",
    "getApiBaseUrl": "通信先のPython（Flask）サーバーの住所（URL）を教えてくれる窓口案内係",
    "isServerUserId": "会員IDがサーバー（MySQL）で正式発行された本物の会員番号かを見極める身元確認係",
    "restoreAuthSessionFromBackend": "ページを開いた時に「前回ログインしていた会員」を自動で呼び戻すおかえり係",
    "resetAccountScopedDomInputs": "ログインやログアウト時に、入力フォームに残った文字を真っさらにするリセット係",
    "getDefaultFittingOffsets": "マネキン試着の服の位置や大きさの初期値（デフォルト設定）を作る初期値セッティング係",
    "applyAccountSession": "ログイン・ログアウト時に、その人専用のデータ（カートや服）をごっそり入れ替えるお引っ越し係",
    "createProductCardHTML": "商品の写真・価格・お気に入りボタンを綺麗に並べた「商品カード」を組み立てるカード職人係",
    "renderHomeProducts": "トップ画面（HOME）におすすめ商品と新着商品を並べて華やかに飾るディスプレイ係",
    "renderCatalogProducts": "商品一覧（CATALOG）画面にすべての服をずらりと並べて見せる陳列係",
    "renderNewItems": "新作アイテム一覧画面に「NEW」のタグがついた服だけを集めて並べる新着コーナー担当係",
    "navigateToDetail": "クリックされた服の詳しい情報を開くために「商品詳細画面」へ案内する誘導係",
    "renderItemDetail": "商品詳細画面に大きな写真・説明・サイズ選択肢を細かく描画する詳しい商品説明係",
    "handleSizeSelect": "商品詳細画面でお客さんがサイズ（S/M/Lなど）を選んだ時に見た目を切り替えるサイズ案内係",
    "getCartUserSeq": "カートの通信順番が前後して中身が壊れないように見守る通信連番チェック係",
    "bumpCartUserSeq": "カートの通信連番を +1 進めて最新の通信合図を出すカウントアップ係",
    "syncCartToBackend": "カートの中身をデータベース（MySQL）へ確実に送り届けて保存するカート連絡係",
    "syncCartFromBackend": "データベースから最新のカート内容を読み取って画面にパッと反映するカート復元係",
    "updateCartBadge": "ヘッダーの買い物カゴアイコン右上の「現在の点数バッジ」を最新数に書き換えるバッジ更新係",
    "handleAddToCartFromDetail": "商品詳細画面で「ショッピングバッグに追加」が押された時にカゴに入れるお買い物係",
    "handleBuyNow": "「今すぐ購入」が押された時に、即座にカゴに入れてお会計画面へ直行させるスピード案内係",
    "updateCartItemQty": "お会計画面で商品の数量を「＋」「－」ボタンで増やしたり減らしたりする数量調整係",
    "removeCartItem": "お会計画面で「削除」が押された商品をカートからスッキリ取り除く削除係",
    "updateCheckoutStepper": "購入手続きの「1 カート → 2 お届け先・決済 → 3 完了」進捗バーを進めるステップ進行係",
    "renderCheckoutPage": "お会計画面（#checkout）にカートの中身・お届け先・合計金額を描画するレジ係",
    "calculateNetPointsFromOrders": "過去の注文履歴から、使った分を差し引いた「今本当に使える保有ポイント」を正確に割り出すポイント計算係",
    "getUserPoints": "ログイン中の会員の現在の保有ポイント数をサッと教えてくれるポイント確認係",
    "setUserPoints": "会員の保有ポイント数を新しい数値に書き換えて保存するポイント更新係",
    "fetchUserCoupons": "ログイン中の会員が持っているお得なクーポン一覧をサーバーから取ってくるクーポン集め係",
    "renderCheckoutCoupons": "お会計画面に「今使えるクーポン一覧」のボタンを並べて選べるようにするクーポン案内係",
    "handleApplyCouponCode": "お客さんがクーポンを選んだ時に、即座に割引を適用して安くするクーポン適用係",
    "handleCancelCoupon": "使っていたクーポンを取り消して元の通常価格に戻すクーポン解除係",
    "updateCheckoutCalculations": "お会計画面の「小計・クーポン割引・ポイント利用・送料・最終お支払い合計」を瞬時に再計算する自動計算係",
    "handlePointInput": "お会計画面でお客さんが使いたいポイント数を入力した時に上限チェックを行うポイント受付係",
    "validateShippingFields": "お届け先の「お名前」「郵便番号」「住所」「電話番号」に空欄や誤りがないか厳しくチェックする入力確認係",
    "handlePlaceOrder": "お届け先確認・注文データの保存・カートのお片付けまでを一気に完了させる「注文確定の総責任者」",
    "renderCheckoutSuccess": "注文完了画面（サンクスページ）に注文番号や獲得ポイントを表示してお祝いするお見送り係",
    "fetchOrderHistory": "データベースからログイン会員の過去の注文履歴一覧を取ってくる履歴取得係",
    "renderOrderHistory": "注文履歴画面に過去に買った服の日時や合計金額をカード形式で並べる購入履歴一覧係",
    "fetchFavoriteProducts": "データベースからログイン会員のお気に入り商品一覧を取ってくるお気に入り取得係",
    "renderFavoriteProducts": "お気に入り画面にハートを付けた服をずらりと並べて表示するお気に入り一覧係",
    "toggleFavoriteProduct": "服のカードのハートボタンが押された時に、お気に入り登録・解除をパチパチ切り替えるハート切り替え係",
    "isProductFavorite": "ある商品が「お気に入り登録済みかどうか」を即座にYes/Noで判定するハート判定係",
    "updateHomeCategoryPills": "トップ画面のカテゴリ（ALL, MEN, WOMENなど）を選んだ時にボタンの色を切り替えるピル選択係",
    "handleCategoryClick": "トップ画面でカテゴリが選ばれた時に、表示する商品をサッと絞り込むカテゴリ仕分け係",
    "renderCatalogFilters": "カタログ画面の絞り込みパネル（性別、カテゴリ、色、価格帯）を組み立てるフィルター作成係",
    "handleCatalogFilterChange": "カタログ画面で条件（カテゴリや価格など）が変更された時に、商品を瞬時に絞り込むフィルター実行係",
    "filterCatalogProducts": "選ばれた条件（性別・カテゴリ・価格・キーワード）に一致する服だけを厳選して抜き出す商品選別係",
    "sortCatalogProducts": "抜き出した商品を「おすすめ順」「価格が安い順」「高い順」「新着順」に並び替える並び替え係",
    "renderSortDropdown": "カタログ画面の「並び順セレクトボックス」を画面に設置するソートメニュー係",
    "handleSearchInput": "ヘッダーの検索バーに文字が入力された時に、商品名やブランド名でリアルタイム検索する検索係",
    "openSearchModal": "虫眼鏡アイコンが押された時に「キーワード検索ウィンドウ」を画面いっぱいに広げる検索窓オープン係",
    "closeSearchModal": "検索ウィンドウの「×」や外側が押された時にスッと閉じる検索窓クローズ係",
    "handleAuthLogin": "メールアドレスとパスワードを受け取ってログイン認証を行い、マイページへ案内するログイン受付係",
    "handleAuthRegister": "新しい会員の登録情報を受け取って、アカウントを新規作成する新規会員登録係",
    "handleAuthLogout": "ログイン中のセッションを綺麗に終了して、トップ画面へ安全にお見送りするログアウト係",
    "updateHeaderAuthUI": "ログイン状態に応じて、ヘッダーのアイコンを「ログイン」か「マイページ＆ログアウト」に切り替えるヘッダー案内係",
    "renderMyPageProfile": "マイページ（MY PAGE）にお客さんの会員情報・保有ポイント・過去の注文数をまとめて描画する会員ダッシュボード係",
    "openEditProfileModal": "「会員情報を編集する」ボタンが押された時に、プロフィール変更ウィンドウを開くプロフィール編集窓係",
    "closeEditProfileModal": "プロフィール変更ウィンドウを閉じるプロフィール編集窓クローズ係",
    "handleSaveProfile": "編集された新しいお名前や住所をデータベースに上書き保存するプロフィール更新係",
    "showToast": "画面右下に「カートに追加しました」「保存しました」などの通知ポップアップをフワッと出すお知らせ係",
}

STUDIO_ROLES = {
    "getStudioCurrentUserId": "今マネキンを着せ替えしているユーザーのIDを素早く確認するユーザー確認係",
    "setStudioCategory": "スタジオのタブ（トップス、ボトムス、シューズ等）が切り替わった時に画面を更新するタブ切り替え係",
    "setStudioSubcategory": "「半袖Tシャツ」「パーカー」などの細かい分類を選んだ時に服を絞り込むサブカテゴリ仕分け係",
    "setStudioSource": "「ショップの販売商品」と「自分のクローゼット手持ち服」のどちらを表示するか切り替える服の出どころ切り替え係",
    "renderStudioInventory": "スタジオ右側の棚（インベントリ）に、試着できる服をずらりと並べて見せる服棚ディスプレイ係",
    "createStudioItemCard": "服の棚に並べる商品カード（試着中バッジや手持ちタグ付き）を1枚ずつ綺麗に組み立てるアイテムカード職人係",
    "onStudioItemClick": "服カードがクリックされた時に、マネキンの指定部位にその服をサッと着せる試着着せ替え係",
    "removeClothingFromStage": "マネキンが着ている服の「×」ボタンが押された時に、その部位の服を脱がせる脱衣係",
    "renderMannequinStage": "5つの部位（帽子・トップス・インナー・ボトムス・靴）の服を正しい重ね順でマネキンに着せる「試着室ステージのスタイリスト係」",
    "updateSelectedClothingLayers": "今選ばれている服のレイヤー重ね順（インナーの上にてトップスを着る等）を整理するレイヤー重ね順係",
    "setupFittingSliders": "サイズや位置を微調整するスライダー（上下、左右、拡大縮小）を動かせるように準備するスライダー配線係",
    "onFittingSliderChange": "スライダーが左右に動かされた瞬間に、服の位置や大きさをミリ単位で変化させるスライダー連動係",
    "applyFittingOffsets": "スライダーの数値を読み取って、マネキンが着ている服のCSS（移動や拡大縮小）に直接反映する微調整反映係",
    "resetFittingOffsets": "「位置を元に戻す」が押された時に、服のズレを綺麗にゼロに戻す位置リセット係",
    "selectClothingPartForAdjustment": "「今からトップスを調整する」「次はパンツ」と、調整対象の服を選び分ける調整対象セレクト係",
    "renderFittingAdjustmentPanel": "選ばれた服のサイズや位置をいじるための「微調整コントローラーパネル」を描画する調整パネル係",
    "handleStudioReset": "マネキンが着ているすべての服を脱がせて、最初のすっぴん状態に戻すマネキン全脱ぎリセット係",
    "openOutfitSaveModal": "「このコーディネートを保存する」が押された時に、コーデ名を入力するポップアップを開くコーデ保存窓オープン係",
    "closeOutfitSaveModal": "コーデ保存ポップアップを閉じるコーデ保存窓クローズ係",
    "selectSuggestedOutfitName": "「春のお出かけコーデ」などの候補名がクリックされた時に、入力欄にパッと代入するコーデ名提案入力係",
    "handleSaveOutfit": "現在のマネキンの服の組み合わせを「保存済みコーディネート」としてデータベースに記録するコーデ保存係",
    "renderSavedOutfitsGrid": "スタジオの「保存済み」タブに、過去に作ったお気に入りコーデ一覧をカードで並べる保存コーデコレクション係",
    "restoreOutfit": "保存済みコーデカードの「このコーデを着る」が押された時に、マネキンに一瞬でその服一式を着せるコーデ一括復元係",
    "deleteSavedOutfit": "保存済みコーデカードの「削除」ボタンが押された時に、リストとデータベースから削除するコーデ削除係",
    "syncOutfitsFromBackend": "データベース（MySQL）からログイン会員の保存済みコーディネート一覧を取り寄せるコーデ読み込み係",
    "addCurrentBrandItemsToCart": "「マネキンが着ているショップ商品をまとめてカゴへ」が押された時に、販売中の服だけを一気にカートへ届ける一括お買い物係",
    "openAddClosetModal": "「自分の服を登録する」ボタンが押された時に、写真アップロード画面を開くクローゼット登録窓オープン係",
    "closeAddClosetModal": "手持ち服登録画面を閉じるクローゼット登録窓クローズ係",
    "resizeImageForAi": "アップロードされた写真が大きすぎる場合に、AIが解析しやすい軽やかなサイズに縮小する画像リサイズ係",
    "runAiBackgroundRemoval": "服の写真から背景（お部屋の壁や床）をAIで一瞬で消し去る「背景透明化の切り抜き職人係」",
    "updateClosetPreviewUI": "手持ち服登録ウィンドウ内の「プレビュー写真枠」を新しい画像に更新するプレビュー表示係",
    "getMobileNetModel": "服の種類（シャツ、ズボンなど）を自動で見分ける画像認識AIモデル（MobileNet）を呼び出すAIモデル準備係",
    "updateAiDiagnosisUI": "AIの服診断状況（解析中… / 成功！ / 失敗）を画面にリアルタイム表示するAI診断ステータス案内係",
    "analyzeClothingItemShape": "写真のシルエット（縦横比や形）を分析して、トップかボトムかを推測する輪郭形状分析係",
    "processClosetImageWithAi": "写真が選ばれた瞬間に「AI背景切り抜き」と「AI服種別診断」を連続で実行するAIトータル画像解析係",
    "selectPresetImage": "「白Tシャツ」「デニム」などのサンプル写真チップが選ばれた時に画像をセットするサンプル写真セット係",
    "handleClosetImageSelect": "ユーザーがスマホやPCから服の写真を選択（またはカメラ撮影）した時に受け取るファイル受付係",
    "triggerManualBgRemoval": "「もう一度AIで背景を消す」ボタンが押された時に、切り抜きAIを再実行する切り抜き再挑戦係",
    "restoreOriginalUploadImage": "「切り抜き前の元の写真に戻す」が押された時に、最初の写真に戻すオリジナル写真復元係",
    "bumpClosetMutationSeq": "クローゼット通信の順番が狂わないように管理カウンタを +1 進めるクローゼット連番係",
    "handleAddClosetItem": "切り抜いた写真と服の名前を受け取って、自分のクローゼット（手持ち服）として保存する手持ち服登録係",
    "deleteClosetItem": "手持ち服カードの「ゴミ箱」ボタンが押された時に、クローゼットから服を削除する手持ち服お別れ係",
    "syncClosetFromBackend": "データベース（MySQL）からログイン会員の手持ち服一覧をすべて取り寄せる手持ち服同期係",
    "calculateEstimatedTemperature": "現在の日時（月と時間帯）から愛知県（名古屋）のリアルな推定気温を賢く割り出す気温推定係",
    "fetchCurrentTemperature": "気象庁（JMA）の公式データにアクセスして、最新の気温とお天気を取ってくる気象庁お天気速報係",
    "getCurrentSeasonInfo": "今日の日付から「春・夏・秋・冬」のどの季節かを判定する四季判定係",
    "getMonthlyStylingPlan": "月別（1月〜12月）のおすすめコーディネート提案データを準備する月別スタイリング提案係",
    "onSelectStylingMonth": "AIスタイリングバナーで別の月が選ばれた時に、その月の季節コーデに切り替える月選択コーディネート係",
    "renderTodayStylingBanner": "「TODAY\'S AI STYLING」バナーに今日の天気・気温・おすすめ服を描画するお天気コーデ看板係",
    "updateTodaySeasonalStyling": "気象庁のリアルタイム気温を取得して、今のお天気に一番ぴったりの服を提案する「天気予報スタイリスト係」",
    "applyTodaySeasonalPresetLook": "AIスタイリングバナーの「このコーデを一括試着」が押された時に、マネキンに提案コーデを着せるお天気コーデ一括試着係",
    "applyPresetLook": "指定されたプリセットコーデを着用するための互換用着せ替え係",
    "sendStudioStateRequest": "マネキンの現在の試着服やミリ単位の位置調整データをサーバー（MySQL）へ送信する通信メッセンジャー係",
    "flushPendingStudioStateSync": "保留中のマネキン保存処理があれば、タイマーを待たずに即座に送信完了させる即時セーブ係",
    "syncStudioStateToBackend": "着せ替えやサイズ調整の連続操作を、少し手が止まるのを待ってから自動セーブする気配りセーブ係（デバウンス保存）",
    "syncStudioStateFromBackend": "ログイン時やスタジオを開いた時に、前回試着していた服とサイズ設定を呼び戻すマネキン状態復元係",
    "getCategoryNameJP": "英語のカテゴリ名（'HAT', 'TOPS'など）を親しみやすい日本語（'帽子', 'トップス'など）に翻訳するカテゴリ通訳係",
    "getColorHex": "英語のカラー名（'BLACK', 'NAVY'など）を画面描画用のカラーコード（#000000など）に変換するカラー通訳係",
    "showToastNotification": "スタジオ画面で「コーデを保存しました」などの小さなメッセージをピョコッと表示するスタジオ通知係",
}

def update_file_roles(filepath, role_dict):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified_count = 0
    missing = []

    # パターン:
    # // 【関数】(関数名)(引数...)
    # // 【役割】(任意の文字列)
    def replacer(match):
        nonlocal modified_count
        func_line = match.group(1) # "// 【関数】..."
        func_name = match.group(2).strip() # 関数名
        old_role = match.group(3) # 旧役割

        if func_name in role_dict:
            new_role = role_dict[func_name]
            modified_count += 1
            return f"// 【関数】{func_line}\n// 【役割】{new_role}"
        else:
            missing.append(func_name)
            return match.group(0)

    # 正規表現: // 【関数】([^\r\n]*?([a-zA-Z0-9_]+)\s*\([^\r\n]*\))\r?\n// 【役割】[^\r\n]+
    # ※ 関数名を取り出すためにグループ化
    pattern = re.compile(r'// 【関数】\s*(([a-zA-Z0-9_]+)\s*\([^\r\n]*\))\r?\n// 【役割】[^\r\n]+')
    new_content = pattern.sub(replacer, content)

    if missing:
        print(f"Warning in {filepath}: {len(missing)} functions not in role_dict: {missing}")

    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)

    print(f"Updated {filepath}: {modified_count} functions updated.")

if __name__ == '__main__':
    update_file_roles('js/app.js', APP_ROLES)
    update_file_roles('js/shop.js', SHOP_ROLES)
    update_file_roles('js/studio.js', STUDIO_ROLES)
