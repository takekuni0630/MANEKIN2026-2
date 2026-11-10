// ==========================================================================
// MANEKIN FASHION - メインアプリケーション制御 (app.js)a
// アプリケーション全体の状態管理、ルーティング、初期化、イベント登録
// ==========================================================================

// 2. アプリケーション状態管理（State - アカウント別に厳密分離）
// --------------------------------------------------------------------------
// ↓ ブラウザの localStorage から前回ログインしていたユーザー情報を即時実行関数（IIFE）で安全に読み込みます
const _initialUser = (() => {
    // ↓ 保存データが壊れていて JSON.parse でエラーが出てもアプリが止まらないよう try-catch で囲みます
    try {
        // ↓ 'manekin_user' キーのJSON文字列を取り出してオブジェクトに戻し、無ければ null を返します
        return JSON.parse(localStorage.getItem('manekin_user')) || null;
    // ↓ 読み込み・変換に失敗した場合の受け皿
    } catch (e) {
        // ↓ 安全に未ログイン状態(null)として扱います
        return null;
    }
})();
// ↓ ログイン済みユーザーが見つかればそのID(_initialUser.id)を、未ログインなら null を初期ユーザーIDとします
const _initialUid = (_initialUser && _initialUser.id) ? _initialUser.id : null;

// ↓ アプリ全体の現在状態（ログインユーザー、カート、お気に入り、試着中アイテム等）を一元管理するオブジェクト
const AppState = {
    // お気に入り登録IDリスト（アカウント別、未ログイン時はゲスト専用キー）
    // ↓ ユーザーIDに紐づく専用キーから、過去に保存したお気に入り商品ID配列を読み込みます
    favorites: loadScopedData('manekin_favorites', [], _initialUid),
    // ログイン中の会員情報（初期値は未ログイン）
    // ↓ 先ほど復元したログインユーザー情報（名前・ID・保有ポイント等）をセットします
    currentUser: _initialUser,
    // ショッピングカート内アイテム（アカウント別、未ログイン時はゲスト専用キー）
    // ↓ ユーザー別のカート配列を読み込みます
    cart: loadScopedData('manekin_cart', [], _initialUid),
    // ↓ 商品詳細ページで今開いている商品のID（初期値1番）
    currentDetailId: 1,
    // ↓ 詳細ページでユーザーが選択中のカラー名（初期値WHITE）
    selectedColor: "WHITE",
    // ↓ 詳細ページでユーザーが選択中のサイズ（初期値M）
    selectedSize: "M",
    // 注文履歴データ（ログイン中アカウント分のみ読み込み）
    // ↓ ログイン中のアカウントがある場合のみ、その人の注文履歴を読み込みます（未ログイン時は空配列）
    orderHistory: _initialUid ? loadScopedData('manekin_orders', [], _initialUid) : [],
    // ↓ 商品一覧ページでのカテゴリ絞り込み状態（'ALL'＝全件）
    selectedCategory: "ALL",
    // ↓ 商品一覧ページの並び替え基準（'default'＝標準順）
    selectedSort: "default",
    // 未ログイン時のアクセス制御復帰ターゲット ('checkout' または 'manekin')
    // ↓ ログイン必須ページに未ログインで入ろうとした際、認証完了後に自動で戻す先のURL目印
    pendingAuthTarget: null,

    // =========================================================================
    // ■ AIコーデシミュレーション（MANEKIN AI STUDIO）状態管理
    // =========================================================================
    // マイクローゼット（ログイン中アカウント分のみ読み込み）
    // ↓ スタジオに登録した自分の服・購入済み商品リストを読み込みます
    myCloset: _initialUid ? loadScopedData('manekin_my_closet', [], _initialUid) : [],
    // マネキン現在着用スロット
    // ↓ マネキンが今着ている5部位のアイテムデータ（ログイン時のみ復元、未ログイン時はすべて空）
    currentOutfit: _initialUid ? loadScopedData('manekin_current_outfit', {
        // ↓ 帽子スロット（未着用時は null）
        hat: null,
        // ↓ アウタースロット
        outer: null,
        // ↓ トップススロット
        tops: null,
        // ↓ ボトムススロット
        bottoms: null,
        // ↓ シューズスロット
        shoes: null
    }, _initialUid) : {
        // ↓ 未ログイン時の初期帽子スロット
        hat: null,
        // ↓ 未ログイン時の初期アウタースロット
        outer: null,
        // ↓ 未ログイン時の初期トップススロット
        tops: null,
        // ↓ 未ログイン時の初期ボトムススロット
        bottoms: null,
        // ↓ 未ログイン時の初期シューズスロット
        shoes: null
    },
    // 保存したコーデ一覧（ルックブック：ログイン中アカウント分のみ読み込み）
    // ↓ ユーザーが「コーデを保存」で登録したルックブック配列
    savedOutfits: _initialUid ? loadScopedData('manekin_saved_outfits', [], _initialUid) : [],
    // スタジオ内のUI状態
    // ↓ スタジオ画面で現在開いているタブ（初期タブはメインの 'create'＝コーデ作成）
    studioActiveTab: 'create',
    // ↓ マネキンの性別シルエット（MEN / WOMEN）
    studioGender: _initialUid ? loadScopedData('manekin_studio_gender', 'MEN', _initialUid) : 'MEN',
    // ↓ スタジオ左列「マイ服」のカテゴリ絞り込み状態
    studioClosetFilter: 'ALL',
    // ↓ スタジオ右列「BRAND」のカテゴリ絞り込み状態
    studioBrandFilter: 'ALL',
    // ↓ ブランド商品一覧を「お気に入り商品のみ」に絞るチェック状態（false＝全表示）
    studioBrandFavOnly: false,
    // ↓ スマホ表示時のスタジオ3タブのうち現在見ている列（'closet' / 'mannequin' / 'brand'）
    studioMobileView: 'mannequin',
    // ↓ 位置・サイズ微調整パネルで現在選ばれている部位スロット
    activeAdjustSlot: 'outer',
    // ↓ 各部位のX/Y座標・拡大率(scale)のズレ調整値マップを読み込みます
    fittingOffsets: loadScopedData('manekin_fitting_offsets', getDefaultFittingOffsets(), _initialUid),
    // ↓ 体型プロフィール互換オブジェクトを読み込みます
    userBodyProfile: loadScopedData('manekin_body_profile', getDefaultBodyProfile(), _initialUid)
};

// --------------------------------------------------------------------------
// 3. アプリケーション初期化処理
// --------------------------------------------------------------------------
// ↓ HTMLの解析（DOM構築）が終わった瞬間に自動実行される起動メイン処理
document.addEventListener('DOMContentLoaded', () => {
    // ↓ アカウント共有バグの原因になっていた古い無印（非スコープ）localStorageキーを掃除します
    if (typeof purgeLegacyGlobalStorage === 'function') purgeLegacyGlobalStorage();
    // ↓ 以前の壊れたダミー画像URLデータがあれば新しいSVGデータ等へ自動修復します
    migrateOldBrokenAssets();
    // ↓ ヘッダー等のお気に入り件数バッジを最新数に更新します
    updateFavoriteBadges();
    // ↓ ヘッダーのカートアイコン上の商品数量バッジを更新します
    updateCartBadge();
    // ↓ ログイン状態に応じて右上の認証ナビ表示（ログイン / マイページ）を切り替えます
    updateAuthNavUI();
    // ↓ ボタンクリックやフォーム送信などの操作イベントを一括で配線します
    setupEventListeners();
    // ↓ トップページの新着・おすすめ商品カードを描画します
    renderHomeProducts();
    // ↓ 商品一覧ページの商品グリッドを描画します
    renderCatalogProducts();
    // ↓ NEW ARRIVALS（新着）ページの商品を描画します
    renderNewItems();
    // ↓ スタジオのメンズ／ウィメンズ切り替えボタンの見た目を現在状態に合わせます
    if (typeof syncGenderToggleUI === 'function') syncGenderToggleUI();
    // ↓ ログイン中ならサーバー(MySQL)から最新のカート内容を取得して同期します
    if (typeof syncCartFromBackend === 'function') syncCartFromBackend();
    // ↓ MySQLから最新の注文履歴データを取得して同期します
    syncOrdersFromBackend();
    // ↓ MySQLからお気に入り一覧を取得して同期します
    if (typeof syncFavoritesFromBackend === 'function') syncFavoritesFromBackend();
    // ↓ MySQLからマイクローゼット一覧を取得して同期します
    if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
    // ↓ MySQLから保存済みコーディネート一覧を取得して同期します
    if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();
    // ↓ MySQLから試着中の服や位置微調整オフセットなどを取得して同期します
    if (typeof syncStudioStateFromBackend === 'function') syncStudioStateFromBackend();
    // ↓ ブラウザURLの末尾（#home や #items など）を読み取って最初の画面を表示します
    handleRouting();
});

// --------------------------------------------------------------------------
// 4. ルーティング（SPA画面切り替え）
// --------------------------------------------------------------------------
// ↓ URLの「#〇〇」部分に応じて、リロードなしで表示ページを切り替えるSPAルーター関数
function handleRouting() {
    // ↓ 現在のURLハッシュを取得（空なら初期ルート '#home' として扱います）
    const hash = window.location.hash || '#home';
    // ↓ パラメータを除いた純粋な画面ルート名を入れておく変数
    let routeName = hash;
    // ↓ 「?id=123」のような詳細ページ用商品IDを入れておく変数
    let paramId = null;

    // ↓ URLハッシュに「?id=」が含まれている場合（商品詳細画面など）
    if (hash.includes('?id=')) {
        // ↓ 「?id=」の前後で文字列を2つに分割します
        const parts = hash.split('?id=');
        // ↓ 前半（例: '#item-detail'）をルート名にセット
        routeName = parts[0];
        // ↓ 後半の商品ID文字列を10進数の整数に変換して保持
        paramId = parseInt(parts[1], 10);
    }

    // ↓ HTML内にあるすべての画面コンテナ（.page-view）を取得します
    const allViews = document.querySelectorAll('.page-view');
    // ↓ いったん全画面から active クラスを外してすべて非表示にします
    allViews.forEach(view => view.classList.remove('active'));

    // ↓ PCナビ・モバイルナビの全リンクを取得します
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    // ↓ ナビリンクの現在地ハイライト（active）もすべてリセットします
    navLinks.forEach(link => link.classList.remove('active'));

    // ↓ 取り出したルート名ごとに表示すべき画面と実行関数を分岐させます
    switch (routeName) {
        // ↓ トップページ
        case '#home':
            // ↓ ホーム画面を表示
            showView('view-home');
            // ↓ メニューの HOME を黒字太線ハイライト
            highlightNavLink('home');
            // ↓ 分岐終了
            break;

        // ↓ 全商品一覧ページ
        case '#items':
            // ↓ 性別指定を「ALL（メンズ・ウィメンズ両方）」に
            AppState.selectedGender = 'ALL';
            // ↓ カタログ画面を表示
            showView('view-items');
            // ↓ ITEMS メニューをハイライト
            highlightNavLink('items');
            // ↓ 全商品を画面に描画
            renderCatalogProducts();
            // ↓ 分岐終了
            break;

        // ↓ メンズ商品一覧ページ
        case '#men':
            // ↓ 性別フィルターを MEN に設定
            AppState.selectedGender = 'MEN';
            // ↓ カタログ画面を再利用して表示
            showView('view-items');
            // ↓ MEN メニューをハイライト
            highlightNavLink('men');
            // ↓ メンズ商品だけを描画
            renderCatalogProducts();
            // ↓ 分岐終了
            break;

        // ↓ ウィメンズ商品一覧ページ
        case '#women':
            // ↓ 性別フィルターを WOMEN に設定
            AppState.selectedGender = 'WOMEN';
            // ↓ カタログ画面を表示
            showView('view-items');
            // ↓ WOMEN メニューをハイライト
            highlightNavLink('women');
            // ↓ ウィメンズ商品だけを描画
            renderCatalogProducts();
            // ↓ 分岐終了
            break;

        // ↓ 新着商品ページ
        case '#new-items':
            // ↓ 新着ページを表示
            showView('view-new-items');
            // ↓ NEW メニューをハイライト
            highlightNavLink('new-items');
            // ↓ 新着アイテムを描画
            renderNewItems();
            // ↓ 分岐終了
            break;

        // ↓ お気に入り一覧ページ
        case '#favorites':
            // ↓ お気に入り画面を表示
            showView('view-favorites');
            // ↓ FAVORITES をハイライト
            highlightNavLink('favorites');
            // ↓ お気に入り済みアイテムを描画
            renderFavoriteProducts();
            // ↓ 分岐終了
            break;

        // ↓ 商品詳細ページ
        case '#item-detail':
            // ↓ 詳細画面を表示
            showView('view-item-detail');
            // ↓ URLに商品IDが正しく付いていた場合
            if (paramId) {
                // ↓ 開いている商品IDを状態に保存
                AppState.currentDetailId = paramId;
                // ↓ 指定IDの商品情報・色・サイズボタンなどを描画
                renderItemDetail(paramId);
            // ↓ ID指定無しで来た場合
            } else {
                // ↓ 商品一覧ページへ安全にリダイレクトします
                window.location.hash = '#items';
            }
            // ↓ 分岐終了
            break;

        // ↓ カート・購入手続き（チェックアウト）ページ
        case '#checkout':
            // ↓ チェックアウト画面を表示
            showView('view-checkout');
            // ↓ ハイライト更新
            highlightNavLink('checkout');
            // ↓ カート内容・合計金額・ポイント欄を描画
            renderCheckoutPage();
            // ↓ ログイン中ならサーバー側カートとも最新同期
            if (typeof syncCartFromBackend === 'function') syncCartFromBackend();
            // ↓ 分岐終了
            break;

        // ↓ ログインページ
        case '#login':
            // ↓ ログイン画面を表示
            showView('view-login');
            // ↓ ハイライト更新
            highlightNavLink('login');
            // ↓ 購入やスタジオからの強制誘導なら赤／橙の案内バナーを表示
            updateAuthNoticeBanner();
            // ↓ 分岐終了
            break;

        // ↓ 新規会員登録ページ
        case '#register':
            // ↓ 会員登録画面を表示
            showView('view-register');
            // ↓ ハイライト更新
            highlightNavLink('register');
            // ↓ 誘導元に応じた案内バナーを更新
            updateAuthNoticeBanner();
            // ↓ 分岐終了
            break;

        // ↓ 会員マイページ
        case '#mypage':
            // ↓ マイページを表示
            showView('view-mypage');
            // ↓ ハイライト更新
            highlightNavLink('mypage');
            // ↓ 保有ポイント・プロフィール・統計・注文履歴を描画
            renderMyPage();
            // ↓ MySQLから最新注文履歴を再取得して反映
            syncOrdersFromBackend();
            // ↓ MySQLからお気に入りを再取得して同期
            if (typeof syncFavoritesFromBackend === 'function') syncFavoritesFromBackend();
            // ↓ 分岐終了
            break;

        // ↓ MANEKIN AI試着スタジオ（旧ハッシュ #manekin も互換対応）
        case '#manekin':
        case '#manekin-studio':
            // ↓ 未ログイン状態なら試着スタジオへは入れないようにガードします
            if (!AppState.currentUser) {
                // ↓ ログイン後にスタジオへ戻すための目印を記録
                AppState.pendingAuthTarget = 'manekin';
                // ↓ 画面右下にトースト通知で理由をお知らせ
                showToast('⚠️ MANEKIN機能のご利用にはログインまたは会員登録が必要です');
                // ↓ ログイン画面へ移動します
                window.location.hash = '#login';
                // ↓ 以降のスタジオ描画処理を行わずにここで中断します
                return;
            }
            // ↓ ログイン済みなので試着スタジオ画面を表示
            showView('view-manekin-studio');
            // ↓ スタジオボタンをハイライト
            highlightNavLink('manekin-studio');
            // ↓ 最新のマイクローゼットをMySQLから同期
            if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
            // ↓ 最新の保存コーデをMySQLから同期
            if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();
            // ↓ 最新の着用状態と位置微調整をMySQLから同期
            if (typeof syncStudioStateFromBackend === 'function') syncStudioStateFromBackend();
            // ↓ 前回開いていたスタジオ内タブ（無ければ 'create'）を描画
            renderManekinStudio(AppState.studioActiveTab || 'create');
            // ↓ 分岐終了
            break;

        // ↓ 存在しないハッシュURLに来た時のフォールバック
        default:
            // ↓ 安全のためトップページを表示します
            showView('view-home');
            // ↓ HOMEハイライト
            highlightNavLink('home');
            // ↓ 分岐終了
            break;
    }

    // ↓ 画面切り替え後は毎回ページ一番上へなめらかにスクロールします
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ↓ ログイン／登録画面にある「〇〇機能にはログインが必要です」注意バナーの表示内容を切り替える関数
function updateAuthNoticeBanner() {
    // ↓ ログイン画面の警告枠要素
    const loginAlert = document.getElementById('login-checkout-notice');
    // ↓ 登録画面の警告枠要素
    const regAlert = document.getElementById('reg-checkout-notice');
    // ↓ ログイン警告枠の見出し
    const loginTitle = document.getElementById('login-notice-title');
    // ↓ ログイン警告枠の説明文
    const loginDesc = document.getElementById('login-notice-desc');
    // ↓ 登録警告枠の見出し
    const regTitle = document.getElementById('reg-notice-title');
    // ↓ 登録警告枠の説明文
    const regDesc = document.getElementById('reg-notice-desc');

    // ↓ 試着スタジオから弾かれてログイン画面へ来たケース
    if (AppState.pendingAuthTarget === 'manekin') {
        // ↓ 両フォームの警告バナーを表示
        if (loginAlert) loginAlert.style.display = 'block';
        if (regAlert) regAlert.style.display = 'block';
        // ↓ スタジオ用の見出し文言
        const titleText = '⚠️ MANEKIN AIスタジオのご利用には会員登録またはログインが必要です';
        // ↓ スタジオ用の詳細案内（完了後に自動復帰する説明付き）
        const descText = 'バーチャル試着やAIコーデ診断機能をご利用いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、自動的にMANEKINスタジオへ移動します。';
        // ↓ それぞれのHTML要素に文言を流し込みます
        if (loginTitle) loginTitle.textContent = titleText;
        if (loginDesc) loginDesc.innerHTML = descText;
        if (regTitle) regTitle.textContent = titleText;
        if (regDesc) regDesc.innerHTML = descText;
    // ↓ 購入（チェックアウト）から弾かれてログイン画面へ来たケース
    } else if (AppState.pendingAuthTarget === 'checkout') {
        // ↓ 両フォームの警告バナーを表示
        if (loginAlert) loginAlert.style.display = 'block';
        if (regAlert) regAlert.style.display = 'block';
        // ↓ 購入手続き用の見出し文言
        const titleText = '⚠️ ご購入手続きには会員登録またはログインが必要です';
        // ↓ 購入手続き用の案内文
        const descText = '商品をご購入いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、自動的にご注文手続き画面へ戻ります。';
        // ↓ 各要素へ反映
        if (loginTitle) loginTitle.textContent = titleText;
        if (loginDesc) loginDesc.innerHTML = descText;
        if (regTitle) regTitle.textContent = titleText;
        if (regDesc) regDesc.innerHTML = descText;
    // ↓ ヘッダー等から普通にログイン／登録を開いた場合
    } else {
        // ↓ 不要なので警告バナーを非表示にします
        if (loginAlert) loginAlert.style.display = 'none';
        if (regAlert) regAlert.style.display = 'none';
    }
}

// ↓ 指定したIDの .page-view 要素に active クラスを付けて画面上に表示する小さな補助関数
function showView(viewId) {
    // ↓ IDでDOM要素を検索
    const targetView = document.getElementById(viewId);
    // ↓ 要素が存在すれば表示クラスを追加
    if (targetView) targetView.classList.add('active');
}

// ↓ デスクトップメニューとスマホドロワーメニューの該当項目を同時に選択中状態にする関数
function highlightNavLink(navKey) {
    // ↓ data-nav 属性が一致するPCリンクを探して active 付与
    const desktopLink = document.querySelector(`.nav-link[data-nav="${navKey}"]`);
    // ↓ 見つかったら active クラス追加
    if (desktopLink) desktopLink.classList.add('active');
    // ↓ data-mobile-nav 属性が一致するスマホリンクを探して active 付与
    const mobileLink = document.querySelector(`.mobile-nav-link[data-mobile-nav="${navKey}"]`);
    // ↓ 見つかったら active クラス追加
    if (mobileLink) mobileLink.classList.add('active');
}

// --------------------------------------------------------------------------


// 14. イベントリスナー一括登録
// --------------------------------------------------------------------------
// ↓ ユーザー操作（クリック・入力・フォーム送信・URL変化）に対する反応を一括登録する関数
function setupEventListeners() {
    // ↓ URL末尾の #〇〇 が変わったりブラウザの戻るボタンが押されたら画面を切り替えます
    window.addEventListener('hashchange', handleRouting);

    // ↓ ナビやドロワー内の「MANEKINスタジオ」ボタンが押された時の処理
    document.querySelectorAll('.nav-manekin-btn, #manekin-menu-btn, #mobile-manekin-btn').forEach(btn => {
        // ↓ クリックイベント登録
        btn.addEventListener('click', (e) => {
            // ↓ リンクの標準挙動を抑止し
            e.preventDefault();
            // ↓ ハッシュを書き換えてルーター経由でスタジオ画面へ遷移させます
            window.location.hash = '#manekin-studio';
        });
    });

    // ↓ 詳細モーダルの「×」ボタン要素
    const modalCloseBtn = document.getElementById('modal-close-btn');
    // ↓ 詳細モーダルの「OK」ボタン要素
    const modalOkBtn = document.getElementById('modal-ok-btn');
    // ↓ モーダル背景オーバーレイ全体要素
    const manekinModal = document.getElementById('manekin-modal');

    // ↓ ×ボタンでモーダルを閉じます
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeManekinModal);
    // ↓ OKボタンでモーダルを閉じます
    if (modalOkBtn) modalOkBtn.addEventListener('click', closeManekinModal);
    // ↓ 黒い半透明の背景部分をクリックした時もモーダルを閉じる親切設計
    if (manekinModal) {
        // ↓ クリックリスナー
        manekinModal.addEventListener('click', (e) => {
            // ↓ 内側の白い箱ではなく背景自身(e.target === manekinModal)が押された時だけ閉じます
            if (e.target === manekinModal) closeManekinModal();
        });
    }

    // ↓ 「マイ服を追加」モーダルの背景要素
    const closetModal = document.getElementById('modal-add-closet');
    // ↓ 背景クリックで閉じられるように設定
    if (closetModal) {
        // ↓ クリックリスナー
        closetModal.addEventListener('click', (e) => {
            // ↓ モーダル外側クリック時に閉じる関数を呼び出し
            if (e.target === closetModal) closeAddClosetModal();
        });
    }

    // ↓ マイ服追加モーダル内の送信フォーム要素
    const closetForm = document.getElementById('form-add-closet');
    // ↓ 送信時にハンドラ（AI判定＋登録処理）が走るよう紐付け
    if (closetForm) {
        // ↓ submit イベント登録
        closetForm.addEventListener('submit', handleAddClosetItem);
    }

    // ↓ スマホ用ハンバーガーメニューボタン
    const hamburgerBtn = document.getElementById('hamburger-btn');
    // ↓ スマホドロワー内の閉じるボタン
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    // ↓ ドロワー背後の暗い幕オーバーレイ
    const menuOverlay = document.getElementById('menu-overlay');

    // ↓ ハンバーガーボタンでドロワーを開く
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileDrawer);
    // ↓ 閉じるボタンでドロワーを閉じる
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    // ↓ 背景クリックでもドロワーを閉じる
    if (menuOverlay) menuOverlay.addEventListener('click', closeMobileDrawer);

    // ↓ スマホメニュー内のリンクを押したらページ移動と同時にドロワーを自動で閉じます
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        // ↓ クリック時にドロワー閉鎖
        link.addEventListener('click', closeMobileDrawer);
    });

    // ↓ 商品一覧ページ上部のカテゴリボタン群（ALL / OUTER / TOPS / BOTTOMS）
    const filterGroup = document.getElementById('category-filter-group');
    // ↓ 要素があれば各ボタンへクリック処理を登録
    if (filterGroup) {
        // ↓ カテゴリボタンをループ
        filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
            // ↓ クリックされたボタンだけ active にし、選択カテゴリを更新して再描画
            btn.addEventListener('click', () => {
                // ↓ いったんすべてのボタンから選択状態を解除
                filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // ↓ 押されたボタンを選択状態に
                btn.classList.add('active');
                // ↓ HTMLの data-category 属性からカテゴリ名を読み取り AppState に保存
                AppState.selectedCategory = btn.getAttribute('data-category');
                // ↓ 商品一覧を新しい条件で描き直します
                renderCatalogProducts();
            });
        });
    }

    // ↓ 並び替えドロップダウン（おすすめ順／価格の安い順／高い順）
    const sortSelect = document.getElementById('sort-select');
    // ↓ 選択肢変更時に並び順を再計算して描画し直します
    if (sortSelect) {
        // ↓ change イベント登録
        sortSelect.addEventListener('change', (e) => {
            // ↓ 選ばれた並び順値を保存
            AppState.selectedSort = e.target.value;
            // ↓ 一覧を再描画
            renderCatalogProducts();
        });
    }

    // ↓ ログイン画面の「ワンクリック デモアカウントでログイン」ボタン
    const demoBtn = document.getElementById('demo-login-btn');
    // ↓ デモログイン処理を実行
    if (demoBtn) demoBtn.addEventListener('click', handleDemoLogin);

    // ↓ 通常ログインフォーム
    const loginForm = document.getElementById('login-form');
    // ↓ 送信時にログインAPI呼び出しを実行
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // ↓ 新規会員登録フォーム
    const registerForm = document.getElementById('register-form');
    // ↓ 送信時に会員登録API（初期1000pt付与含む）を実行
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // ↓ マイページ内のログアウトボタン
    const logoutBtn = document.getElementById('logout-btn');
    // ↓ ログアウト処理（別ユーザー混在防止のセッション清掃付き）を実行
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // ↓ チェックアウトページの「注文を確定する」ボタン
    const placeOrderBtn = document.getElementById('btn-place-order');
    // ↓ 注文確定処理へ接続
    if (placeOrderBtn) {
        // ↓ クリック時に注文送信・ポイント処理・自動クローゼット追加を実行
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // ↓ チェックアウト画面の支払い方法ラジオボタン群（クレカ / 代引き / コンビニ等）
    document.querySelectorAll('.payment-option-label input[type="radio"]').forEach(radio => {
        // ↓ 選択変更時にカードの選択枠クラスを付け替え、クレカ時だけカード番号入力欄を開きます
        radio.addEventListener('change', () => {
            // ↓ すべてのカードラベルから selected を外す
            document.querySelectorAll('.payment-option-label').forEach(lbl => lbl.classList.remove('selected'));
            // ↓ 選ばれたラジオボタンを包む親ラベルに selected を付与
            radio.closest('.payment-option-label').classList.add('selected');

            // ↓ クレジットカード専用の追加入力フォーム要素を取得
            const cardSubform = document.getElementById('credit-card-subform');
            // ↓ 値が 'クレジットカード' の時だけ flex 表示し、それ以外なら非表示にします
            if (cardSubform) {
                cardSubform.style.display = (radio.value === 'クレジットカード') ? 'flex' : 'none';
            }
        });
    });

    // ↓ マイページ内のタブ切り替えボタン（注文履歴 / お気に入り / アカウント設定等）
    const mypageTabBtns = document.querySelectorAll('.mypage-tab-btn');
    // ↓ 各タブにクリックリスナーを設定
    mypageTabBtns.forEach(btn => {
        // ↓ クリック時にタブボタンと中身パネル両方の active クラスを切り替えます
        btn.addEventListener('click', () => {
            // ↓ 全タブボタンの active を解除
            mypageTabBtns.forEach(b => b.classList.remove('active'));
            // ↓ 押されたタブを active に
            btn.classList.add('active');
            // ↓ data-tab 属性から対象タブ名（例: 'orders'）を取得
            const targetTab = btn.getAttribute('data-tab');
            // ↓ いったんすべてのタブ本文パネルを非表示にします
            document.querySelectorAll('.mypage-tab-content').forEach(content => {
                // ↓ active クラス除去
                content.classList.remove('active');
            });
            // ↓ ID名「tab-〇〇」に一致するパネルを探します
            const activeContent = document.getElementById(`tab-${targetTab}`);
            // ↓ 該当パネルだけ active を付けて画面表示します
            if (activeContent) activeContent.classList.add('active');
        });
    });
}



// ==========================================================================
// 15.9 グローバル関数登録（HTMLのonclick/onsubmitからの確実な呼び出し保証）
// ==========================================================================
// ↓ HTML属性内の onclick="..." やモジュール外スクリプトから直接呼べるよう window オブジェクトへ公開します
// ↓ 「手持ち服追加モーダルを開く」関数をグローバル公開
window.openAddClosetModal = openAddClosetModal;
// ↓ 「手持ち服追加モーダルを閉じる」関数をグローバル公開
window.closeAddClosetModal = closeAddClosetModal;
// ↓ 手持ち服追加の送信処理を公開
window.handleAddClosetItem = handleAddClosetItem;
// ↓ ファイル選択時のAI背景透過・形状判定ハンドラを公開
window.handleClosetImageSelect = handleClosetImageSelect;
// ↓ プリセット画像選択ハンドラを公開
window.selectPresetImage = selectPresetImage;
// ↓ クローゼットアイテム削除関数を公開
window.deleteClosetItem = deleteClosetItem;
// ↓ スタジオ内タブ切り替え関数を公開
window.switchStudioTab = switchStudioTab;
// ↓ マネキン着脱トグル関数を公開
window.toggleWearItem = toggleWearItem;
// ↓ 特定スロットを外す関数を公開
window.unwearSlot = unwearSlot;
// ↓ マネキンの着用服を全脱ぎリセットする関数を公開
window.clearMannequin = clearMannequin;
// ↓ マネキンの性別切り替え関数を公開
window.setMannequinGender = setMannequinGender;
// ↓ スマホ表示用スタジオ列切り替え関数を公開
window.switchMobileStudioView = switchMobileStudioView;
// ↓ 現在のコーデをルックブックに保存する関数を公開
window.handleSaveOutfit = handleSaveOutfit;
// ↓ クイックコーデ名チップ入力関数を公開
window.applyPresetName = applyPresetName;
// ↓ おまかせサンプルコーデ適用関数を公開
window.applyPresetLook = applyPresetLook;
// ↓ 保存済みコーデをマネキンに復元する関数を公開
window.restoreOutfit = restoreOutfit;
// ↓ 保存済みコーデを削除する関数を公開
window.deleteSavedOutfit = deleteSavedOutfit;
// ↓ 着用中のショップ商品をまとめてカートに入れる関数を公開
window.addCurrentBrandItemsToCart = addCurrentBrandItemsToCart;
// ↓ 注文商品をマイクローゼットへ取り込む関数を公開
window.importOrderToCloset = importOrderToCloset;
// ↓ クローゼットタブ内のカテゴリ絞り込み関数を公開
window.handlePaneClosetFilter = handlePaneClosetFilter;
// ↓ スタジオ左列のカテゴリ絞り込み関数を公開
window.handleStudioClosetFilter = handleStudioClosetFilter;
// ↓ スタジオ右列のカテゴリ絞り込み関数を公開
window.handleStudioBrandFilter = handleStudioBrandFilter;
// ↓ お気に入り絞り込みチェック切り替え関数を公開
window.toggleBrandFavFilter = toggleBrandFavFilter;
// ↓ 旧プロフィール保存関数（互換用）を公開
window.handleSaveBodyProfile = handleSaveBodyProfile;
// ↓ 位置・サイズ微調整アコーディオン開閉関数を公開
window.toggleFittingAdjustPanel = toggleFittingAdjustPanel;
// ↓ 微調整対象スロットの切り替え関数を公開
window.switchAdjustSlot = switchAdjustSlot;
// ↓ スライダー入力時のリアルタイム調整関数を公開
window.handleAdjustInput = handleAdjustInput;
// ↓ +/- ボタンによる1段階微調整関数を公開
window.stepAdjust = stepAdjust;
// ↓ 位置調整をデフォルト位置にリセットする関数を公開
window.resetFittingOffsets = resetFittingOffsets;
// ↓ 調整数値を実際のマネキン画像スタイルへ反映する関数を公開
window.applyFittingOffsets = applyFittingOffsets;
// ↓ ブランドアイテムのサイズ（XS〜XL）変更関数を公開
window.handleBrandSizeInput = handleBrandSizeInput;
// ↓ ブランドサイズの +/- 切り替え関数を公開
window.stepBrandSize = stepBrandSize;
// ↓ 手動のAI背景透過再実行ボタン用関数を公開
window.triggerManualBgRemoval = triggerManualBgRemoval;
// ↓ 背景透過前の元画像へ戻すボタン用関数を公開
window.restoreOriginalUploadImage = restoreOriginalUploadImage;



// ↓ マネキンステージ上の各スロット枠クリックハンドラを公開
window.handleStageSlotClick = handleStageSlotClick;
// ↓ クイックアイテム選択ピッカーを開く関数を公開
window.openStageQuickPicker = openStageQuickPicker;
// ↓ クイックアイテム選択ピッカーを閉じる関数を公開
window.closeStageQuickPicker = closeStageQuickPicker;
// ↓ カードのドラッグ開始イベントハンドラを公開
window.handleCardDragStart = handleCardDragStart;
// ↓ ステージ上へのドラッグオーバーハンドラを公開
window.handleStageDragOver = handleStageDragOver;
// ↓ ステージからのドラッグ離脱ハンドラを公開
window.handleStageDragLeave = handleStageDragLeave;
// ↓ ステージ上へのドロップ着せ替えハンドラを公開
window.handleStageDrop = handleStageDrop;
// ↓ カテゴリ別代替SVGイラスト取得関数を公開
window.getCategoryFallbackImage = getCategoryFallbackImage;
// ↓ 古い無効アセットパス自動修復関数を公開
window.migrateOldBrokenAssets = migrateOldBrokenAssets;
// ↓ 利用ポイント数入力変更ハンドラを公開
window.handlePointsInputChange = handlePointsInputChange;
// ↓ 「保有ポイントをすべて使う」ボタン関数を公開
window.handleUseAllPoints = handleUseAllPoints;
// ↓ 「ポイント利用をリセット」ボタン関数を公開
window.handleResetPoints = handleResetPoints;
// ↓ 現在ユーザーの保有ポイント取得関数を公開
window.getUserPoints = getUserPoints;
// ↓ 保有ポイント更新・画面反映関数を公開
window.setUserPoints = setUserPoints;
// ↓ カートデータのMySQL送信関数を公開
window.syncCartToBackend = syncCartToBackend;
// ↓ カートデータのMySQL取得関数を公開
window.syncCartFromBackend = syncCartFromBackend;
// ↓ クローゼットのMySQL取得関数を公開
window.syncClosetFromBackend = syncClosetFromBackend;
// ↓ お気に入りのMySQL取得関数を公開
window.syncFavoritesFromBackend = syncFavoritesFromBackend;
// ↓ 保存済みコーデのMySQL取得関数を公開
window.syncOutfitsFromBackend = syncOutfitsFromBackend;
// ↓ スタジオ状態のMySQL送信関数を公開
window.syncStudioStateToBackend = syncStudioStateToBackend;
// ↓ スタジオ状態のMySQL取得関数を公開
window.syncStudioStateFromBackend = syncStudioStateFromBackend;
// ↓ マイページの手動全データ同期ボタン用関数を公開
window.handleSyncAllToMySQL = handleSyncAllToMySQL;
