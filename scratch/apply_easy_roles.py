# -*- coding: utf-8 -*-
"""
apply_easy_roles.py
全JSファイルの関数の【役割】を、直感的な「〜係」「〜役」スタイルに書き換える。
"""

import json
import re
import os

EASY_ROLES = {
  "js/app.js": {
    "handleRouting": "URLのハッシュ（#home, #shopなど）を見て、正しい画面へ案内して切り替える「道案内係」",
    "updateAuthNoticeBanner": "ログイン画面に来たユーザーに対して「あなた専用の案内メッセージ」を表示する案内係",
    "showView": "指定されたページだけをパッと目の前に表示して、他の画面を隠す「画面切り替え係」",
    "highlightNavLink": "メニューバーの「今いるページ」をピカッと光らせて教えてくれる「現在地ランプ係」",
    "setupEventListeners": "アプリ全体の「ボタンを押した時に動く仕組み」を作る準備係"
  },
  "js/shop.js": {
    "isMobileLocalStorageMode": "PCモードかスマホ版（ブラウザ保存モード）かを判定する「動作環境チェック係」",
    "lsGetJson": "スマホ用ブラウザ保存（localStorage）からデータを安全に取り出す「引き出し係」",
    "lsSetJson": "スマホ用ブラウザ保存（localStorage）へデータを壊さず安全にしまう「収納係」",
    "getDefaultMobileClosetItems": "スマホ版を初めて開いた人に「初期手持ち服3点セット」をプレゼントする「初回プレゼント係」",
    "ensureMobileUserInitialized": "スマホ版ユーザーの初回登録時に必要な初期データを整える「初期セットアップ係」",
    "purgeAllManekinLocalStorage": "PCモードで動かす時に、古いブラウザの一時データを綺麗に掃除する「お片付け係」",
    "getApiBaseUrl": "通信先のPython（Flask）サーバーの接続先住所を教える「窓口案内係」",
    "isServerUserId": "会員番号がデータベース（MySQL）で発行された本物のIDかを見極める「身元確認係」",
    "restoreAuthSessionFromBackend": "ページを開いた時に「前回ログインしていた会員」を自動で呼び戻す「おかえり係」",
    "resetAccountScopedDomInputs": "ログインやログアウト時に、入力フォームに残った文字を真っさらにする「リセット係」",
    "getDefaultFittingOffsets": "マネキン試着の服の位置や大きさの初期値（デフォルト設定）を作る「初期値セッティング係」",
    "applyAccountSession": "ログイン・ログアウト時に、その人専用のデータをごっそり入れ替える「お引っ越し係」",
    "createProductCardHTML": "商品の写真・価格・お気に入りボタンを綺麗に並べた「商品カード」を作る「カード職人係」",
    "renderHomeProducts": "トップ画面（HOME）におすすめ商品と新着商品を並べて華やかに飾る「ディスプレイ係」",
    "renderCatalogProducts": "カタログ画面（CATALOG）に商品をずらりと並べて見せる「陳列係」",
    "renderNewItems": "新作アイテム一覧画面に「NEW」のタグがついた服だけを集めて並べる「新着コーナー担当係」",
    "navigateToDetail": "クリックされた服の詳しい情報を開くために「商品詳細画面」へ案内する「誘導係」",
    "renderItemDetail": "商品詳細画面に大きな写真・説明・サイズ選択肢を細かく描画する「詳しい商品説明係」",
    "handleSizeSelect": "商品詳細画面でお客さんがサイズ（S/M/Lなど）を選んだ時に見た目を切り替える「サイズ案内係」",
    "getCartUserSeq": "カート通信の順番が前後して中身が壊れないように見守る「通信連番チェック係」",
    "bumpCartUserSeq": "カート通信の管理番号を +1 カウントアップして最新合図を出す「カウントアップ係」",
    "syncCartToBackend": "現在のカートの中身をデータベース（MySQL）へ確実に送り届けて保存する「カート連絡係」",
    "syncCartFromBackend": "データベースから最新のカート内容を読み取って画面にパッと反映する「カート復元係」",
    "updateCartBadge": "ヘッダーの買い物カゴアイコン右上の「現在の点数バッジ」を最新数に書き換える「バッジ更新係」",
    "handleAddToCartFromDetail": "商品詳細画面で「ショッピングバッグに追加」が押された時にカゴに入れる「お買い物係」",
    "handleBuyNow": "「今すぐ購入」が押された時に、即座にカゴに入れてお会計画面へ直行させる「スピード案内係」",
    "updateCartItemQty": "お会計画面で商品の数量を「＋」「－」ボタンで増やしたり減らしたりする「数量調整係」",
    "removeCartItem": "お会計画面で「削除」が押された商品をカートからスッキリ取り除く「削除係」",
    "updateCheckoutStepper": "購入手続きの「1 カート → 2 お届け先・決済 → 3 完了」進捗バーを進める「ステップ進行係」",
    "renderCheckoutPage": "お会計画面（#checkout）にカートの中身・お届け先・合計金額を描画する「レジ係」",
    "calculateNetPointsFromOrders": "過去の注文履歴から、使った分を差し引いた「今本当に使える保有ポイント」を正確に割り出す「ポイント計算係」",
    "getUserPoints": "ログイン中の会員の現在の保有ポイント数をサッと教えてくれる「ポイント確認係」",
    "setUserPoints": "会員の保有ポイント数を新しい数値に書き換えて保存する「ポイント更新係」",
    "fetchUserCoupons": "ログイン中の会員が持っているお得なクーポン一覧をサーバーから取ってくる「クーポン集め係」",
    "renderCheckoutCoupons": "お会計画面に「今使えるクーポン一覧」の選択ボタンを並べる「クーポン案内係」",
    "handleApplyCouponCode": "お客さんがクーポンを選んだ時に、即座に割引を適用して安くする「クーポン適用係」",
    "handleCancelCoupon": "使っていたクーポンを取り消して元の通常価格に戻す「クーポン解除係」",
    "updateCheckoutCalculations": "お会計画面の「小計・クーポン割引・ポイント利用・送料・最終お支払い合計」を瞬時に再計算する「自動計算係」",
    "handlePointsInputChange": "お会計画面でお客さんが使いたいポイント数を手入力した時に上限チェックを行う「ポイント受付係」",
    "handleUseAllPoints": "「全ポイントを使う」ボタンが押された時に、使える最大ポイントを一発入力する「ポイントまとめ使い係」",
    "handleResetPoints": "ポイントの「解除」ボタンが押された時に、ポイント利用をゼロに戻す「ポイントリセット係」",
    "importOrderToCloset": "購入履歴から「買った服」をワンクリックでマイクローゼットへ取り込む「購入服お持ち帰り係」",
    "handlePlaceOrder": "お届け先確認・注文データの保存・カートのお片付けまでを一気に完了させる「注文確定の総責任者」",
    "syncOrdersFromBackend": "データベース（MySQL）からログイン会員の過去の注文履歴を取り寄せる「注文履歴取得係」",
    "handleClearOrderHistory": "マイページの注文履歴を全削除（リセット）してお掃除する「注文履歴お掃除係」",
    "handleRefreshFromMySQL": "マイページの「最新データに更新」が押された時に最新情報を読み込み直す「マイページ更新係」",
    "renderMyPage": "マイページ画面（会員ランク、ポイント、購入履歴、お気に入り服など）を綺麗に描画する「マイページ案内係」",
    "getOwnedProductIds": "マイクローゼットに登録済みの服のID一覧をサッとリストアップする「手持ち服チェック係」",
    "cleanPurchasedFavorites": "商品を購入した後に、買った服をお気に入りリストから自動で外す「お気に入り整理係」",
    "syncFavoritesFromBackend": "データベース（MySQL）から「お気に入り登録した商品のID一覧」を取り寄せる「お気に入りリスト取得係」",
    "handleToggleFavorite": "商品の「ハート（お気に入り）」ボタンが押された時に、お気に入りの追加・解除をパチパチ切り替える「ハート切り替え係」",
    "syncAllFavoriteButtons": "画面上にある同じ商品のハートボタンの見た目（赤ハート／白抜き）を一斉に揃える「ハート同期係」",
    "updateFavoriteBadges": "ヘッダーやお気に入りタブにある「お気に入り件数バッジ」の数字を最新にする「お気に入り件数係」",
    "renderFavoriteProducts": "お気に入り画面（#favorites）にお気に入り登録した商品のカード一覧を表示する「お気に入りコレクション係」",
    "updateAuthNavUI": "ログイン状態に応じて、ヘッダーのボタン（ログイン／マイページ）を切り替える「ヘッダー案内係」",
    "handleLogout": "「ログアウト」ボタンが押された時に、安全にサインアウト処理を行う「お見送り係」",
    "redirectToHome": "ログイン成功時やログアウト時に、確実にホーム画面（#home）へ安全に戻す「安全誘導係」",
    "handleDemoLogin": "「デモアカウントで簡単お試しログイン」が押された時にワンクリックでログインさせる「お試し体験係」",
    "handleLogin": "メールアドレスとパスワードを受け取ってログイン認証を行い、マイページへ案内する「ログイン受付係」",
    "handleRegister": "新規会員登録フォームの情報を受け取って、アカウントを新規作成する「新規会員登録係」",
    "openManekinModal": "お知らせやガイドなどのポップアップ画面（モーダル）を開く「モーダルオープン係」",
    "closeManekinModal": "開いているポップアップ画面（モーダル）を閉じる「モーダルクローズ係」",
    "escapeHtml": "悪意あるスクリプト（XSS攻撃）を防ぐために文字を安全な形に変換する「セキュリティ番犬係」",
    "openMyPageCouponsModal": "マイページの「保有クーポン一覧を見る」が押された時にクーポン一覧ウィンドウを開く「クーポン一覧窓オープン係」",
    "closeMyPageCouponsModal": "クーポン一覧ウィンドウを閉じる「クーポン一覧窓クローズ係」",
    "showToast": "画面右下に「カートに追加しました」などの通知メッセージをフワッと出して消す「お知らせ通知係」",
    "openMobileDrawer": "スマホ画面で左上のメニューボタン（三本線）が押された時にメニューを開く「スマホメニューオープン係」",
    "closeMobileDrawer": "スマホメニューの外側が押された時にスッとメニューを閉じる「スマホメニュークローズ係」"
  },
  "js/studio.js": {
    "switchStudioTab": "スタジオ上部のタブ（ホーム/クローゼット/お気に入り/コーデ作成/保存済み）をパチッと切り替える「スタジオタブ切り替え係」",
    "renderManekinStudio": "試着スタジオ画面全体（会員情報、タブ表示、服一覧）を最新状態に整えて描画する「スタジオ総支配人係」",
    "renderPaneClosetGrid": "スタジオの「マイクローゼット」タブに、持っている服の一覧カードを並べる「クローゼット展示係」",
    "renderStudioClosetList": "試着室の左側カラム「手持ちの服一覧」を描画する「左棚ディスプレイ係」",
    "handlePaneClosetFilter": "マイクローゼットタブでカテゴリ（帽子、トップス等）が選ばれた時に服を絞り込む「クローゼット仕分け係」",
    "handleStudioClosetFilter": "試着室左棚のカテゴリフィルター（ALL、TOPS等）を切り替えた時に服を絞り込む「左棚フィルター係」",
    "renderStudioBrandList": "試着室の右側カラム「ブランド商品一覧」を描画する「右棚ディスプレイ係」",
    "handleStudioBrandFilter": "試着室右棚のカテゴリフィルターを切り替えた時に服を絞り込む「右棚フィルター係」",
    "renderStudioFavoritesGrid": "スタジオの「お気に入り商品」タブにハートを付けた服の一覧を表示する「スタジオお気に入り展示係」",
    "isItemWearing": "その服が「いまマネキンに着せられているかどうか」を即座に判定する「着用中チェック係」",
    "toggleWearItem": "服カードをクリックした時に「着る / 脱ぐ」を切り替える「着せ替えスイッチ係」",
    "getSlotKeyByCategory": "服のカテゴリ名（'TOPS'など）をマネキンの着用部位名（'tops'など）に翻訳する「部位名通訳係」",
    "unwearSlot": "マネキンの指定部位（帽子、トップスなど）の服をスッと脱がせる「脱衣係」",
    "resetMannequinOutfit": "マネキンに着せている服を全身すべて脱がせてすっぴんに戻す「全身脱衣リセット係」",
    "clearMannequin": "ツールバーの「全身クリア」ボタンが押された時に確認して全脱ぎさせる「全身クリア実行係」",
    "getCategoryFallbackImage": "写真の読み込みに失敗した時に「代わりのダミー画像」を差し出す「代用画像係」",
    "migrateOldBrokenAssets": "古い服データの画像パスを現在の正しい画像パスへ自動修正する「画像リンク修理係」",
    "renderMannequinStage": "中央のマネキン試着室ステージ（重ね順、服の写真、着用中スロット）を綺麗に描画する「試着室ステージのスタイリスト係」",
    "handleStageSlotClick": "試着室下部の着用スロット（帽子・トップス等）がクリックされた時に脱衣や選択を行う「着用スロット受付係」",
    "openStageQuickPicker": "部位を選んで直接着せ替えられる「簡易選択ポップアップ」を開く「クイック着せ替え窓係」",
    "closeStageQuickPicker": "簡易選択ポップアップを閉じる「クイック着せ替え窓クローズ係」",
    "handleCardDragStart": "服カードがドラッグされ始めた時に、服のデータを運べるよう準備する「ドラッグ開始係」",
    "handleStageDragOver": "ドラッグ中の服がマネキンステージの上に来た時に「ここに置けますよ」と合図する「ドロップ受け入れ案内係」",
    "handleStageDragLeave": "ドラッグ中の服がマネキンステージの外へ離れた時に合図を引っ込める「ドロップ領域見送り係」",
    "handleStageDrop": "マネキンステージの上で服が離された（ドロップされた）瞬間にその服を着せる「ドロップ着せ替え係」",
    "applyFittingOffsets": "スライダーで動かした服の位置やサイズをマネキン上の服にミリ単位で即時反映する「微調整反映係」",
    "toggleFittingAdjustPanel": "ツールバーの「服の位置・サイズ微調整」パネルを開閉する「微調整パネル開閉係」",
    "switchAdjustSlot": "調整パネル内で微調整する部位（帽子／トップス／ボトムス等）を切り替える「調整部位セレクト係」",
    "syncAdjustPanelUI": "選ばれた部位に合わせて、調整パネルのスライダー位置や数値を最新に合わせる「スライダー同期係」",
    "handleBrandSizeInput": "販売商品のサイズスライダー（XS〜XL）を動かした時に服の縮尺を変える「ブランドサイズ調整係」",
    "stepBrandSize": "販売商品サイズ横の「＋」「－」ボタンが押された時にサイズを1段階変える「サイズステップ係」",
    "handleAdjustInput": "服の上下位置(Y軸)・左右位置(X軸)・拡大率スライダーを動かした時に位置を変える「位置調整スライダー受付係」",
    "stepAdjust": "位置調整スライダー横の「＋」「－」ボタンが押された時に微量に位置を動かす「位置微動ステップ係」",
    "resetFittingOffsets": "調整パネルの「リセット」ボタンが押された時に服のズレを綺麗に元に戻す「位置リセット係」",
    "switchMobileStudioView": "スマホ表示時に「試着室／手持ち服／商品リスト」の表示をパッと切り替える「スマホ試着ビュー切り替え係」",
    "analyzeOutfitColorComposition": "マネキンが着ている服全体の色合い（カラー構成比率）を瞬時に分析する「カラーバランス分析係」",
    "updateAIStylingComment": "マネキンの服の組み合わせを見て「AIスタイリングアドバイス」を自動生成する「AIファッションアドバイザー係」",
    "applyPresetName": "コーデ保存ウィンドウで、提案されたおすすめコーデ名をクリックして入力欄に入れる「コーデ名入力サポート係」",
    "handleSaveOutfit": "「このコーディネートを保存する」が押された時に、組み合わせをデータベースへ保存する「コーデ保存係」",
    "renderSavedOutfitsGrid": "スタジオの「保存済み」タブに、過去に作ったお気に入りコーデ一覧をカードで並べる「保存コーデコレクション係」",
    "restoreOutfit": "保存済みコーデカードの「このコーデを着る」が押された時に、マネキンに一瞬でその服一式を着せる「コーデ一括着せ替え係」",
    "deleteSavedOutfit": "保存済みコーデカードの「削除」ボタンが押された時に、コーデを安全に消去する「保存コーデ削除係」",
    "syncOutfitsFromBackend": "データベース（MySQL）からログイン会員の保存済みコーディネート一覧を取り寄せる「コーデ一覧読み込み係」",
    "addCurrentBrandItemsToCart": "「マネキンが着ている販売商品をまとめてカゴへ」が押された時に、販売中の服だけを一気にカートへ届ける「一括お買い物係」",
    "openAddClosetModal": "「手持ちの服を登録する」ボタンが押された時に、写真アップロード画面を開く「手持ち服登録窓オープン係」",
    "closeAddClosetModal": "手持ち服登録画面を閉じる「手持ち服登録窓クローズ係」",
    "resizeImageForAi": "アップロードされた写真が大きすぎる場合に、AIが解析しやすい軽やかなサイズに縮小する「画像リサイズ係」",
    "runAiBackgroundRemoval": "服の写真から背景（お部屋の壁や床）をAIで一瞬で消し去る「背景透明化の切り抜き職人係」",
    "updateClosetPreviewUI": "手持ち服登録ウィンドウ内の「プレビュー画像枠」を新しい写真に更新する「プレビュー表示係」",
    "getMobileNetModel": "服の種類（シャツ、パンツなど）を自動で見分ける画像認識AIモデル（MobileNet）を呼び出す「AIモデル準備係」",
    "updateAiDiagnosisUI": "AIの服診断状況（解析中… / 成功！ / 失敗）を画面にリアルタイム表示する「AI診断ステータス案内係」",
    "analyzeClothingItemShape": "写真のシルエット（縦横比や形）を分析して服のカテゴリを自動判定する「輪郭形状分析係」",
    "processClosetImageWithAi": "写真が選ばれた瞬間に「AI背景切り抜き」と「AI服種別診断」を連続で実行する「AIトータル画像解析係」",
    "selectPresetImage": "「白Tシャツ」「デニム」などのサンプル写真チップが選ばれた時に画像をセットする「サンプル写真セット係」",
    "handleClosetImageSelect": "ユーザーがスマホやPCから服の写真を選択（またはカメラ撮影）した時に受け取る「写真ファイル受付係」",
    "triggerManualBgRemoval": "「もう一度AIで背景を消す」ボタンが押された時に切り抜きAIを再実行する「切り抜き再挑戦係」",
    "restoreOriginalUploadImage": "「切り抜き前の元の写真に戻す」が押された時に最初の元写真に戻す「オリジナル写真復元係」",
    "bumpClosetMutationSeq": "クローゼット通信の順番が狂わないように管理カウンタを +1 進める「クローゼット連番係」",
    "handleAddClosetItem": "切り抜いた写真と服の名前を受け取って、自分のクローゼット（手持ち服）として保存する「手持ち服登録係」",
    "deleteClosetItem": "手持ち服カードの「ゴミ箱」ボタンが押された時に、クローゼットから服を削除する「手持ち服お別れ係」",
    "syncClosetFromBackend": "データベース（MySQL）からログイン会員の手持ち服一覧を取り寄せる「手持ち服同期係」",
    "calculateEstimatedTemperature": "現在の日時（月と時間帯）から愛知県（名古屋）のリアルな推定気温を賢く割り出す「気温推定係」",
    "fetchCurrentTemperature": "気象庁（JMA）の公式データにアクセスして最新の気温とお天気を取ってくる「気象庁お天気速報係」",
    "getCurrentSeasonInfo": "今日の日付から「春・夏・秋・冬」のどの季節かを判定する「四季判定係」",
    "getMonthlyStylingPlan": "月別（1月〜12月）のおすすめコーディネート提案データを準備する「月別スタイリング提案係」",
    "onSelectStylingMonth": "AIスタイリングバナーで別の月が選ばれた時に、その月の季節コーデに切り替える「月選択コーディネート係」",
    "renderTodayStylingBanner": "「TODAY'S AI STYLING」バナーに今日の天気・気温・おすすめ服を描画する「お天気コーデ看板係」",
    "updateTodaySeasonalStyling": "気象庁のリアルタイム気温を取得して、今のお天気に一番ぴったりの服を提案する「天気予報スタイリスト係」",
    "applyTodaySeasonalPresetLook": "AIスタイリングバナーの「このコーデを一括試着」が押された時に、マネキンに提案コーデを着せる「お天気コーデ一括試着係」",
    "applyPresetLook": "指定されたプリセットコーデを着用するための「互換用着せ替え係」",
    "sendStudioStateRequest": "マネキンの現在の着用服や位置調整データをサーバー（MySQL）へ送信する「通信メッセンジャー係」",
    "flushPendingStudioStateSync": "保留中のマネキン保存処理があれば、タイマーを待たずに即座に送信完了させる「即時セーブ係」",
    "syncStudioStateToBackend": "着せ替えやサイズ調整の連続操作を、少し手が止まるのを待ってから自動セーブする「気配りセーブ係（デバウンス保存）」",
    "syncStudioStateFromBackend": "ログイン時やスタジオを開いた時に、前回試着していた服とサイズ設定を呼び戻す「マネキン状態復元係」",
    "getCategoryNameJP": "英語のカテゴリ名（'HAT', 'TOPS'など）を親しみやすい日本語（'帽子', 'トップス'など）に翻訳する「カテゴリ通訳係」",
    "getColorHex": "英語のカラー名（'BLACK', 'NAVY'など）を画面描画用のカラーコード（#000000など）に変換する「カラー通訳係」",
    "showToastNotification": "スタジオ画面で「コーデを保存しました」などの小さなメッセージをピョコッと表示する「スタジオ通知係」"
  }
}

for filepath, roles in EASY_ROLES.items():
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    stats = {'updated': 0, 'missing': []}

    def replacer(match):
        fn_name = match.group(1).strip()
        rest = match.group(2)
        if fn_name in roles:
            new_role = roles[fn_name]
            stats['updated'] += 1
            return f"// 【関数】{fn_name}{rest}\n// 【役割】{new_role}"
        else:
            stats['missing'].append(fn_name)
            return match.group(0)

    pattern = re.compile(r'// 【関数】\s*([a-zA-Z0-9_]+)(\s*\([^\r\n]*\))\r?\n// 【役割】[^\r\n]+')
    new_content = pattern.sub(replacer, content)

    if stats['missing']:
        print(f"Error: missing functions in {filepath}: {stats['missing']}")

    with open(filepath, 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)

    print(f"{filepath}: updated {stats['updated']} / {len(roles)} functions.")
