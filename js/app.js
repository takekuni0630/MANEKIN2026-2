// ==========================================================================
//  MANEKIN FASHION - メイン制御・画面ルーティング (js/app.js)
//  ・サイト全体の状態管理（AppState）、SPA画面切り替え（handleRouting）、
//  ・ページ起動時の MySQL セッション復元（Cookie 認証）、全UIイベント登録を行います。
// ==========================================================================

// 1. アプリケーション状態管理（AppState）: メモリ上で画面状態を一元管理（※永続化は MySQL のみ）
// 現在ログイン中のユーザーやカート・試着状態などをまとめる管理オブジェクト AppState を定義します
const AppState = {
    // お気に入り登録した商品IDを並べる配列（ログイン後に MySQL favorites テーブルから同期します）
    favorites: [],
    // ログイン中の会員情報オブジェクト（未ログイン時は null）
    currentUser: null,
    // ショッピングカート内の商品リスト配列（ログイン中は MySQL cart_items と連動します）
    cart: [],
    // 商品詳細ページで現在表示対象になっている商品ID（初期値は 1 番）
    currentDetailId: 1,
    // 商品詳細ページで選択中のカラー名（初期値は WHITE）
    selectedColor: "WHITE",
    // 商品詳細ページで選択中のサイズ名（初期値は M）
    selectedSize: "M",
    // ログインユーザーの注文履歴配列（MySQL orders テーブルから取得します）
    orderHistory: [],
    // ログインユーザーの所持クーポン一覧配列（MySQL user_coupons テーブルから取得）
    userCoupons: [],
    // 商品一覧ページの対象性別（'ALL' / 'MEN' / 'WOMEN'）
    selectedGender: "ALL",
    // 商品一覧ページのカテゴリ絞り込み状態（'ALL' は全カテゴリ表示）
    selectedCategory: "ALL",
    // 商品一覧ページの並び順（'default' はおすすめ順）
    selectedSort: "default",
    // 未ログインで認証必須画面へ入った場合の、ログイン完了後の自動復帰先（'manekin' / 'checkout'）
    pendingAuthTarget: null,

    // AI試着スタジオ用：自分の登録服や購入済みアイテム一覧配列（MySQL closet_items から取得）
    myCloset: [],
    // AI試着スタジオ用：マネキンに今着せている5部位のスロット管理オブジェクト
    currentOutfit: {
        // 帽子スロット（未着用時は null）
        hat: null,
        // アウタースロット（未着用時は null）
        outer: null,
        // トップススロット（未着用時は null）
        tops: null,
        // ボトムススロット（未着用時は null）
        bottoms: null,
        // シューズスロット（未着用時は null）
        shoes: null
    },
    // スタジオで保存したコーディネート一覧配列（MySQL saved_outfits から取得）
    savedOutfits: [],
    // スタジオ画面で今開いている左/下パネルのタブ名（初期値 'create'）
    studioActiveTab: 'create',
    // マネキンの性別モデル設定（'MEN' または 'WOMEN'）
    studioGender: 'MEN',
    // スタジオ内のマイクローゼット絞り込みカテゴリ（'ALL' は全表示）
    studioClosetFilter: 'ALL',
    // スタジオ内のブランド商品絞り込みカテゴリ（'ALL' は全表示）
    studioBrandFilter: 'ALL',
    // ブランド商品リストを「お気に入りのみ」に絞るかどうかの真偽フラグ
    studioBrandFavOnly: false,
    // スマホ画面幅でスタジオを表示するときのアクティブ表示切り替え（'mannequin' 優先）
    studioMobileView: 'mannequin',
    // 位置・拡大率調整パネルで現在操作中の部位キー（初期値 'outer'）
    activeAdjustSlot: 'outer',
    // 部位ごとの X/Y ズレ・拡大率・サイズ設定を shop.js のヘルパーから初期化します
    fittingOffsets: getDefaultFittingOffsets(),
    // 身長・体型・スタイル設定の初期値を shop.js のヘルパーから初期化します
    userBodyProfile: getDefaultBodyProfile()
};

// 起動時 MySQL セッション復元が先に終わるまでルート判定を待たせるための同期制御変数
// 起動直後の MySQL ログイン状態確認（/api/auth/me）が完了したかどうかを記録するフラグ
let _authBootstrapDone = false;
// 上記確認処理の完了を他関数が await して待つための Promise 参照を保持します
let _authBootstrapPromise = null;

// 2. アプリ起動時の初期化処理（HTML読込完了時 DOMContentLoaded に1回だけ実行）
// HTML要素がすべて解析されたタイミング(DOMContentLoaded)で非同期初期化処理を開始します
document.addEventListener('DOMContentLoaded', async () => {
    // 過去バージョン等のブラウザ側キャッシュ（manekin* キー）が残っていれば最初に完全削除します
    if (typeof purgeAllManekinLocalStorage === 'function') purgeAllManekinLocalStorage();
    // ヘッダー等のお気に入り件数バッジを初期値(0)で描画します
    updateFavoriteBadges();
    // ヘッダーのカート点数バッジを初期値(0)で描画します
    updateCartBadge();
    // ヘッダー右のログイン／マイページ表示を未ログイン状態で初期更新します
    updateAuthNavUI();
    // URL変更・クリック・フォーム送信などの各種イベントリスナーをまとめて登録します
    setupEventListeners();
    // トップページのおすすめ・PICK UP商品カードを描画します
    renderHomeProducts();
    // 全商品カタログ画面の商品カードを描画します
    renderCatalogProducts();
    // 新作一覧画面（NEW ITEM）の商品カードを描画します
    renderNewItems();
    // スタジオ性別切替ボタンの見た目（MEN/WOMEN）を AppState に合わせて同期します
    if (typeof syncGenderToggleUI === 'function') syncGenderToggleUI();

    // サーバー側の HttpOnly セッション Cookie を検証し、ログイン中アカウントを復元する非同期処理を開始します
    _authBootstrapPromise = (async () => {
        // 通信失敗等でも初期化が止まらないよう try 〜 finally で保護します
        try {
            // shop.js のセッション復元関数が読込済みなら実行し、ログインユーザー情報を取得します
            const restoredUser = (typeof restoreAuthSessionFromBackend === 'function')
                // バックエンド API（/api/auth/me）へ問い合わせて認証済みユーザーを受け取ります
                ? await restoreAuthSessionFromBackend()
                // 関数未定義時や未ログイン時は null として扱います
                : null;
            // 有効な会員情報が返ってきて、セッション適用関数が利用可能かチェックします
            if (restoredUser && typeof applyAccountSession === 'function') {
                // そのアカウント専用のカート・注文・お気に入り・スタジオ状態を MySQL から一括復元します
                await applyAccountSession(restoredUser, { fromSessionRestore: true });
            // 未ログイン（ゲスト状態）だった場合の分岐です
            } else {
                // 未ログイン状態の注文リストは空として安全に同期終了します
                await syncOrdersFromBackend();
            }
        // 成功・失敗に関わらず最後に必ず実行される後処理ブロックです
        } finally {
            // 認証確認の完了フラグを true にして、ルーティング処理が進めるようにします
            _authBootstrapDone = true;
        }
    })();
    // 上記の MySQL セッション復元処理が完全に終わるまでここで待機します
    await _authBootstrapPromise;

    // 復元データ内に古い画像ファイル名があれば現在の正しい画像パスへメモリ上で補正します
    migrateOldBrokenAssets();
    // 現在のブラウザURLのハッシュ（例: #home, #mypage）に応じた最初の画面を表示します
    await handleRouting();
});

// 3. SPAルーティング（URL末尾の #〇〇 を読み取り、リロードなしで画面を表示切替）
// URL末尾の #〇〇 に合わせて画面セクションを切り替えるメインルーター関数です
async function handleRouting() {
    // まだ起動時のセッション復元が終わっていなければ、未ログイン誤判定を防ぐため完了を待ちます
    if (!_authBootstrapDone && _authBootstrapPromise) {
        // 復元処理の Promise が完了するまで await で待機します
        await _authBootstrapPromise;
    }
    // 現在のURLハッシュを取得します（空の場合はトップ画面 '#home' を既定値にします）
    const hash = window.location.hash || '#home';
    // パラメータ分離前の純粋な画面名を入れる変数 routeName を用意します
    let routeName = hash;
    // 商品詳細ページの '?id=3' 等から取り出す数値ID用変数を null で初期化します
    let paramId = null;

    // ハッシュ文字列に詳細ID指定の '?id=' が含まれているか判定します
    if (hash.includes('?id=')) {
        // '?id=' を境に文字列を前半（ルート名）と後半（ID文字）へ分割します
        const parts = hash.split('?id=');
        // 分割した前半を遷移先ルート名（例: '#item-detail'）としてセットします
        routeName = parts[0];
        // 後半の数字文字列を 10 進数の整数（例: 3）に変換して paramId に入れます
        paramId = parseInt(parts[1], 10);
    }

    // HTML内のすべての画面コンテナ（.page-view）を取得します
    const allViews = document.querySelectorAll('.page-view');
    // いったんすべての画面から .active クラスを外して非表示に戻します
    allViews.forEach(view => view.classList.remove('active'));

    // PC用およびモバイル用の全ナビゲーションリンク要素を取得します
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    // すべてのメニュー項目の選択強調（.active クラス）をいったん解除します
    navLinks.forEach(link => link.classList.remove('active'));

    // 切り替えるルート名（routeName）ごとの分岐処理を開始します
    switch (routeName) {
        // '#home'（トップページ）の場合の処理
        case '#home':
            // トップ画面要素（#view-home）に active を付けて表示します
            showView('view-home');
            // ナビゲーションの HOME ボタンを選択状態にします
            highlightNavLink('home');
            // switch 分岐を抜けます
            break;

        // '#items'（全商品一覧）の場合の処理
        case '#items':
            // 性別フィルタを 'ALL'（メンズ・ウィメンズ両方）に戻します
            AppState.selectedGender = 'ALL';
            // 商品一覧画面（#view-items）を表示します
            showView('view-items');
            // 対応するメニュー項目を選択状態にします
            highlightNavLink('items');
            // 現在のフィルタ・並び順設定で商品カード一覧を再描画します
            renderCatalogProducts();
            // switch 分岐を抜けます
            break;

        // '#men'（メンズ商品一覧）の場合の処理
        case '#men':
            // 性別フィルタを 'MEN' に切り替えます
            AppState.selectedGender = 'MEN';
            // 共通の商品一覧画面（#view-items）を表示します
            showView('view-items');
            // ナビゲーションの MEN ボタンを選択状態にします
            highlightNavLink('men');
            // メンズ商品だけに絞ってカタログを再描画します
            renderCatalogProducts();
            // switch 分岐を抜けます
            break;

        // '#women'（ウィメンズ商品一覧）の場合の処理
        case '#women':
            // 性別フィルタを 'WOMEN' に切り替えます
            AppState.selectedGender = 'WOMEN';
            // 共通の商品一覧画面（#view-items）を表示します
            showView('view-items');
            // ナビゲーションの WOMEN ボタンを選択状態にします
            highlightNavLink('women');
            // ウィメンズ商品だけに絞ってカタログを再描画します
            renderCatalogProducts();
            // switch 分岐を抜けます
            break;

        // '#new-items'（新作一覧）の場合の処理
        case '#new-items':
            // 新作商品画面（#view-new-items）を表示します
            showView('view-new-items');
            // 新作ナビゲーションを選択状態にします
            highlightNavLink('new-items');
            // isNew が true の新作商品カードを抽出して描画します
            renderNewItems();
            // switch 分岐を抜けます
            break;

        // '#favorites'（お気に入り一覧）の場合の処理
        case '#favorites':
            // お気に入り一覧画面（#view-favorites）を表示します
            showView('view-favorites');
            // お気に入りナビを選択状態にします
            highlightNavLink('favorites');
            // 現在のお気に入り配列に応じた商品カードを描画します
            renderFavoriteProducts();
            // switch 分岐を抜けます
            break;

        // '#item-detail'（商品詳細画面）の場合の処理
        case '#item-detail':
            // 商品詳細画面（#view-item-detail）を表示します
            showView('view-item-detail');
            // URLに有効な商品ID（paramId）が指定されているか確認します
            if (paramId) {
                // 現在開いている商品IDとして AppState.currentDetailId を更新します
                AppState.currentDetailId = paramId;
                // 該当商品の写真・カラー・サイズボタン・在庫説明を描画します
                renderItemDetail(paramId);
            // ID指定が無かった場合のフォールバック処理です
            } else {
                // 不正な空詳細ページを防ぐため一覧画面 '#items' へ戻します
                window.location.hash = '#items';
            }
            // switch 分岐を抜けます
            break;

        // '#checkout'（ショッピングカート・購入手続き）の場合の処理
        case '#checkout':
            // 購入手続き画面（#view-checkout）を表示します
            showView('view-checkout');
            // カート／チェックアウトナビを選択状態にします
            highlightNavLink('checkout');
            // 現在 AppState.cart に入っている商品明細と小計・送料・ポイント割引を描画します
            renderCheckoutPage();
            // ログイン中なら MySQL cart_items とも最新同期してズレを防ぎます
            if (typeof syncCartFromBackend === 'function') syncCartFromBackend();
            // switch 分岐を抜けます
            break;

        // '#login'（ログイン画面）の場合の処理
        case '#login':
            // ログイン画面（#view-login）を表示します
            showView('view-login');
            // ナビの LOGIN ボタンを選択状態にします
            highlightNavLink('login');
            // 遷移前の保護ページ案内（チェックアウト／スタジオ誘導バナー）を更新します
            updateAuthNoticeBanner();
            // switch 分岐を抜けます
            break;

        // '#register'（新規会員登録画面）の場合の処理
        case '#register':
            // 会員登録画面（#view-register）を表示します
            showView('view-register');
            // 登録用ナビを選択状態にします
            highlightNavLink('register');
            // 誘導バナーが表示対象なら文言を最新化します
            updateAuthNoticeBanner();
            // switch 分岐を抜けます
            break;

        // '#mypage'（マイページ）の場合の処理
        case '#mypage':
            // マイページ画面（#view-mypage）を表示します
            showView('view-mypage');
            // ナビの MYPAGE ボタンを選択状態にします
            highlightNavLink('mypage');
            // 会員プロフィール・保有ポイント・注文履歴・お気に入りタブの現在内容を描画します
            renderMyPage();
            // バックエンド（MySQL）から最新の注文履歴を取り直して画面に反映します
            syncOrdersFromBackend();
            // バックエンド（MySQL）からお気に入りリストも最新同期します
            if (typeof syncFavoritesFromBackend === 'function') syncFavoritesFromBackend();
            // switch 分岐を抜けます
            break;

        // '#manekin' または '#manekin-studio'（AI試着スタジオ）の両ルートを受け付けます
        case '#manekin':
        // AI試着スタジオ画面のルート指定です
        case '#manekin-studio':
            // まだログインしていない（AppState.currentUser が null）かチェックするアクセス制御です
            if (!AppState.currentUser) {
                // ログイン完了後に自動でスタジオへ戻すための目的地 'manekin' を記憶します
                AppState.pendingAuthTarget = 'manekin';
                // ログインが必要なことを右下のトースト通知で案内します
                showToast('⚠️ MANEKIN機能のご利用にはログインまたは会員登録が必要です');
                // 強制的にログイン画面（#login）へ誘導します
                window.location.hash = '#login';
                // 未ログイン時はここで処理を打ち切り、スタジオ画面を開かせません
                return;
            }
            // ログイン済みなので AI試着スタジオ画面（#view-manekin-studio）を表示します
            showView('view-manekin-studio');
            // ナビの MANEKIN AI ボタンを選択状態にします
            highlightNavLink('manekin-studio');
            // MySQL からこの会員の登録クローゼット一覧（closet_items）を最新取得します
            if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
            // MySQL から保存済みコーデ一覧（saved_outfits）を最新取得します
            if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();
            // MySQL からマネキン着用中スロット＆位置調整値（user_studio_states）を最新取得します
            if (typeof syncStudioStateFromBackend === 'function') syncStudioStateFromBackend();
            // スタジオ全体（マネキン・棚リスト・調整パネル）を描画します
            renderManekinStudio(AppState.studioActiveTab || 'create');
            // switch 分岐を抜けます
            break;

        // どの定義済みルートにも当てはまらない URL ハッシュだった場合の安全フォールバック
        default:
            // トップ画面（#view-home）を表示します
            showView('view-home');
            // HOME ナビを選択状態にします
            highlightNavLink('home');
            // switch 分岐を抜けます
            break;
    }

    // ページ切り替え時に前のスクロール位置を引き継がないよう、画面一番上へ滑らかに戻します
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. 未ログイン保護ページ遷移時の案内バナー文言切り替え関数
// 未ログインリダイレクト時に表示する警告バナー（ログイン・会員登録両画面用）を更新する関数です
function updateAuthNoticeBanner() {
    // ログイン画面側の誘導アラートボックス要素を取得します
    const loginAlert = document.getElementById('login-checkout-notice');
    // 会員登録画面側の誘導アラートボックス要素を取得します
    const regAlert = document.getElementById('reg-checkout-notice');
    // ログイン画面側アラートの見出しテキスト要素を取得します
    const loginTitle = document.getElementById('login-notice-title');
    // ログイン画面側アラートの説明文要素を取得します
    const loginDesc = document.getElementById('login-notice-desc');
    // 会員登録画面側アラートの見出しテキスト要素を取得します
    const regTitle = document.getElementById('reg-notice-title');
    // 会員登録画面側アラートの説明文要素を取得します
    const regDesc = document.getElementById('reg-notice-desc');

    // 直前に MANEKIN AIスタジオへ入ろうとして弾かれた場合の専用文言を設定します
    if (AppState.pendingAuthTarget === 'manekin') {
        // ログイン画面側の警告バナーを表示状態にします
        if (loginAlert) loginAlert.style.display = 'block';
        // 会員登録画面側の警告バナーを表示状態にします
        if (regAlert) regAlert.style.display = 'block';
        // AI試着スタジオ利用にはアカウントが必要である見出し文言を用意します
        const titleText = '⚠️ MANEKIN AIスタジオのご利用には会員登録またはログインが必要です';
        // ログイン後に自動でAIスタジオへ戻る旨の案内HTML文言を用意します
        const descText = 'バーチャル試着やAIコーデ診断機能をご利用いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、自動的にMANEKINスタジオへ移動します。';
        // ログイン画面側アラートの見出しを書き換えます
        if (loginTitle) loginTitle.textContent = titleText;
        // ログイン画面側アラートの本文をHTMLとして反映します
        if (loginDesc) loginDesc.innerHTML = descText;
        // 会員登録画面側アラートの見出しを書き換えます
        if (regTitle) regTitle.textContent = titleText;
        // 会員登録画面側アラートの本文をHTMLとして反映します
        if (regDesc) regDesc.innerHTML = descText;
    // 直前に注文手続きページ（checkout）から認証誘導された場合の分岐です
    } else if (AppState.pendingAuthTarget === 'checkout') {
        // ログイン画面側の警告バナーを表示状態にします
        if (loginAlert) loginAlert.style.display = 'block';
        // 会員登録画面側の警告バナーを表示状態にします
        if (regAlert) regAlert.style.display = 'block';
        // 購入手続きにはログインが必要である見出し文言を用意します
        const titleText = '⚠️ ご購入手続きには会員登録またはログインが必要です';
        // ログイン後に自動で注文画面へ戻る旨の案内HTML文言を用意します
        const descText = '商品をご購入いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、自動的にご注文手続き画面へ戻ります。';
        // ログイン画面側アラートの見出しを書き換えます
        if (loginTitle) loginTitle.textContent = titleText;
        // ログイン画面側アラートの本文を反映します
        if (loginDesc) loginDesc.innerHTML = descText;
        // 会員登録画面側アラートの見出しを書き換えます
        if (regTitle) regTitle.textContent = titleText;
        // 会員登録画面側アラートの本文を反映します
        if (regDesc) regDesc.innerHTML = descText;
    // 通常のログイン／新規登録アクセス（誘導元なし）の場合の分岐です
    } else {
        // ログイン画面側の誘導バナーを非表示にします
        if (loginAlert) loginAlert.style.display = 'none';
        // 会員登録画面側の誘導バナーを非表示にします
        if (regAlert) regAlert.style.display = 'none';
    }
}

// 5. 指定IDの画面(.page-view)だけ表示し、対応するナビリンクをアクティブにする補助関数
// 指定したIDのセクション(.page-view)に .active クラスを付けて画面に表示する関数です
function showView(viewId) {
    // 引数 viewId に対応するHTML要素を検索します
    const targetView = document.getElementById(viewId);
    // 要素が存在すれば .active クラスを追加して画面に現します
    if (targetView) targetView.classList.add('active');
}

// 現在開いている画面に対応するPC・スマホ両方のナビゲーションリンクに下線等を付ける関数です
function highlightNavLink(navKey) {
    // data-nav 属性が一致するPC版ナビリンク要素を探します
    const desktopLink = document.querySelector(`.nav-link[data-nav="${navKey}"]`);
    // 見つかれば .active クラスを付与します
    if (desktopLink) desktopLink.classList.add('active');
    // data-mobile-nav 属性が一致するスマホドロワー内リンクを探します
    const mobileLink = document.querySelector(`.mobile-nav-link[data-mobile-nav="${navKey}"]`);
    // 見つかれば .active クラスを付与します
    if (mobileLink) mobileLink.classList.add('active');
}

// 6. 画面上のボタン・フォーム・モーダル等へクリック／送信イベントを一括登録
// ページ全体のクリック・入力変更・フォーム送信イベントリスナーを初期設定する関数です
function setupEventListeners() {
    // URLの #〇〇（ハッシュ）が切り替わるたびに自動で handleRouting() を走らせます
    window.addEventListener('hashchange', handleRouting);

    // ヘッダーやスマホメニュー内にあるすべての MANEKIN AI ボタンを取得して繰り返します
    document.querySelectorAll('.nav-manekin-btn, #manekin-menu-btn, #mobile-manekin-btn').forEach(btn => {
        // ボタンクリック時にカスタムハンドラを実行します
        btn.addEventListener('click', (e) => {
            // リンクの通常ジャンプ前にイベント既定動作を明示的に制御します
            e.preventDefault();
            // ハッシュを '#manekin-studio' に変更し、上記の hashchange で画面遷移を発火させます
            window.location.hash = '#manekin-studio';
        });
    });

    // 汎用モーダルウィンドウの右上「×」ボタン要素を取得します
    const modalCloseBtn = document.getElementById('modal-close-btn');
    // 汎用モーダルの「OK」ボタン要素を取得します
    const modalOkBtn = document.getElementById('modal-ok-btn');
    // 汎用モーダル全体の暗い背景ラッパー要素を取得します
    const manekinModal = document.getElementById('manekin-modal');

    // 「×」ボタンが押されたら汎用モーダルを閉じます
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeManekinModal);
    // 「OK」ボタンが押されたら汎用モーダルを閉じます
    if (modalOkBtn) modalOkBtn.addEventListener('click', closeManekinModal);
    // モーダル本体が存在する場合に背景クリックでの閉じる動作を設定します
    if (manekinModal) {
        // モーダル上のどこかがクリックされたときの判定処理です
        manekinModal.addEventListener('click', (e) => {
            // 内側ボックスではなく外側の暗い背景自体が押されたときだけモーダルを閉じます
            if (e.target === manekinModal) closeManekinModal();
        });
    }

    // クローゼットアイテム登録モーダルの外側ラッパー要素を取得します
    const closetModal = document.getElementById('modal-add-closet');
    // クローゼットモーダルが存在する場合に背景クリック処理を登録します
    if (closetModal) {
        // モーダルクリック時の判定を行います
        closetModal.addEventListener('click', (e) => {
            // 外側の暗い背景部分がクリックされた場合のみ登録モーダルを閉じます
            if (e.target === closetModal) closeAddClosetModal();
        });
    }

    // クローゼットアイテム新規追加フォーム（#form-add-closet）を取得します
    const closetForm = document.getElementById('form-add-closet');
    // フォームが存在する場合に送信イベントを設定します
    if (closetForm) {
        // フォーム送信時にページリロードせず studio.js の handleAddClosetItem を実行します
        closetForm.addEventListener('submit', handleAddClosetItem);
    }

    // スマホ用ハンバーガーメニュー（三本線）ボタンを取得します
    const hamburgerBtn = document.getElementById('hamburger-btn');
    // モバイルメニュー内の「×」閉じるボタンを取得します
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    // モバイルメニュー表示中に背後を暗くするオーバーレイ要素を取得します
    const menuOverlay = document.getElementById('menu-overlay');

    // ハンバーガーボタン押下で横からスマホメニューを開きます
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileDrawer);
    // 閉じるボタン押下でスマホメニューを閉じます
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    // 暗いオーバーレイ押下でもスマホメニューを閉じます
    if (menuOverlay) menuOverlay.addEventListener('click', closeMobileDrawer);

    // スマホメニュー内のすべての項目リンクを取得してループします
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        // どれか項目をタップして画面遷移したら、自動でスマホメニューを閉じます
        link.addEventListener('click', closeMobileDrawer);
    });

    // 商品一覧ページのカテゴリ絞り込みボタングループ（ALL/TOPS 等）を取得します
    const filterGroup = document.getElementById('category-filter-group');
    // カタログ絞り込みグループが存在する場合のみイベント設定を行います
    if (filterGroup) {
        // グループ内の各フィルタボタンに対してクリック処理を設定します
        filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
            // カテゴリボタンがクリックされたときの処理です
            btn.addEventListener('click', () => {
                // いったん全カテゴリボタンから選択状態(.active)を外します
                filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // 今クリックしたボタンだけに選択状態(.active)を付けます
                btn.classList.add('active');
                // ボタンの data-category 属性（'OUTER' など）を読み取って AppState を更新します
                AppState.selectedCategory = btn.getAttribute('data-category');
                // 新しいカテゴリ条件で商品カタログを再描画します
                renderCatalogProducts();
            });
        });
    }

    // 商品一覧ページの並び替えドロップダウン（おすすめ順／価格順）を取得します
    const sortSelect = document.getElementById('sort-select');
    // 並び替えセレクトボックスが存在する場合に選択変更イベントを設定します
    if (sortSelect) {
        // ユーザーが並び順を変更（change）したときの処理です
        sortSelect.addEventListener('change', (e) => {
            // 選ばれた値（例: 'price-asc'）を AppState.selectedSort へ保存します
            AppState.selectedSort = e.target.value;
            // 新しい並び順で商品カタログを再描画します
            renderCatalogProducts();
        });
    }

    // ワンクリックお試し体験用「デモアカウントでログイン」ボタンを取得します
    const demoBtn = document.getElementById('demo-login-btn');
    // クリックされたら shop.js の handleDemoLogin を呼んで即ログインします
    if (demoBtn) demoBtn.addEventListener('click', handleDemoLogin);

    // 通常ログインフォームを取得します
    const loginForm = document.getElementById('login-form');
    // 送信（submit）時に handleLogin を呼び出してバックエンド認証を行います
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // 新規会員登録フォームを取得します
    const registerForm = document.getElementById('register-form');
    // 送信時に handleRegister を呼び出して MySQL users テーブルへ会員を作成します
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // ログアウトボタンを取得します
    const logoutBtn = document.getElementById('logout-btn');
    // クリック時にサーバーセッション Cookie 破棄とメモリリセットを行う handleLogout を呼びます
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // 購入手続きページの「注文を確定する」ボタンを取得します
    const placeOrderBtn = document.getElementById('btn-place-order');
    // 注文確定ボタンが存在する場合にクリック処理を登録します
    if (placeOrderBtn) {
        // クリック時に在庫確認・ポイント清算・MySQL注文保存を行う handlePlaceOrder を呼びます
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // 支払い方法選択用の全ラジオボタン（クレカ／代金引換等）を取得してループします
    document.querySelectorAll('.payment-option-label input[type="radio"]').forEach(radio => {
        // 選択が切り替わったときのUI更新イベントを設定します
        radio.addEventListener('change', () => {
            // すべての支払い方法カード枠から選択枠線(.selected)をいったん外します
            document.querySelectorAll('.payment-option-label').forEach(lbl => lbl.classList.remove('selected'));
            // チェックされたラジオボタンを包む親ラベルだけに .selected 枠線を付けます
            radio.closest('.payment-option-label').classList.add('selected');

            // クレジットカード番号等を入力するサブフォーム要素を取得します
            const cardSubform = document.getElementById('credit-card-subform');
            // カード入力欄が存在する場合に表示状態を切り替えます
            if (cardSubform) {
                // 'クレジットカード' が選ばれたときだけ flex 表示し、他方法なら隠します
                cardSubform.style.display = (radio.value === 'クレジットカード') ? 'flex' : 'none';
            }
        });
    });

    // マイページ上部のタブ切り替えボタン群（プロフィール／注文履歴／お気に入り等）を取得します
    const mypageTabBtns = document.querySelectorAll('.mypage-tab-btn');
    // 各タブボタンへクリックイベントを設定します
    mypageTabBtns.forEach(btn => {
        // タブボタンがクリックされたときの切り替え処理です
        btn.addEventListener('click', () => {
            // すべてのタブボタンから .active をいったん外します
            mypageTabBtns.forEach(b => b.classList.remove('active'));
            // クリックされたタブボタンだけに .active を付けます
            btn.classList.add('active');
            // data-tab 属性から切り替え対象のタブ識別名（例: 'orders'）を取得します
            const targetTab = btn.getAttribute('data-tab');
            // マイページ内の全タブ中身コンテナを取得してループします
            document.querySelectorAll('.mypage-tab-content').forEach(content => {
                // いったんすべてのタブコンテンツを非表示にします
                content.classList.remove('active');
            });
            // 'tab-' + タブ識別名 のIDを持つ表示対象コンテナを取得します
            const activeContent = document.getElementById(`tab-${targetTab}`);
            // 対象のタブ中身だけに .active を付けて表示します
            if (activeContent) activeContent.classList.add('active');
        });
    });
}

// 7. HTMLの onclick 属性等から直接呼び出せるよう主要関数を window グローバルへ公開
// HTML側の onclick='openAddClosetModal()' 等から参照できるよう window オブジェクトに公開します
window.openAddClosetModal = openAddClosetModal;
// クローゼット追加モーダルを閉じる関数をグローバル公開します
window.closeAddClosetModal = closeAddClosetModal;
// クローゼット新規登録処理関数をグローバル公開します
window.handleAddClosetItem = handleAddClosetItem;
// 画像ファイル選択時のプレビュー＆AI切抜処理関数を公開します
window.handleClosetImageSelect = handleClosetImageSelect;
// プリセット服画像の選択関数を公開します
window.selectPresetImage = selectPresetImage;
// クローゼットアイテム削除関数を公開します
window.deleteClosetItem = deleteClosetItem;
// AI試着スタジオ内のタブ切り替え関数を公開します
window.switchStudioTab = switchStudioTab;
// マネキンに服を着せる／脱がすトグル関数を公開します
window.toggleWearItem = toggleWearItem;
// 指定部位スロットを脱がす関数を公開します
window.unwearSlot = unwearSlot;
// マネキンの全着用服をまとめてリセットする関数を公開します
window.clearMannequin = clearMannequin;
// マネキンの性別（MEN / WOMEN）切り替え関数を公開します
window.setMannequinGender = setMannequinGender;
// スマホ表示時のマネキン画面／操作パネル切り替え関数を公開します
window.switchMobileStudioView = switchMobileStudioView;
// 現在のコーディネートを MySQL saved_outfits へ保存する関数を公開します
window.handleSaveOutfit = handleSaveOutfit;
// コーデ名の入力プリセット反映関数を公開します
window.applyPresetName = applyPresetName;
// おすすめルックの一括試着適用関数を公開します
window.applyPresetLook = applyPresetLook;
// 保存済みコーデをマネキンへワンクリック復元する関数を公開します
window.restoreOutfit = restoreOutfit;
// 保存済みコーデ削除関数を公開します
window.deleteSavedOutfit = deleteSavedOutfit;
// 試着中の自社ブランド商品をまとめてカートへ追加する関数を公開します
window.addCurrentBrandItemsToCart = addCurrentBrandItemsToCart;
// 注文履歴の購入商品をマイクローゼットへ取り込む関数を公開します
window.importOrderToCloset = importOrderToCloset;
// 右棚パネルのクローゼット絞り込み関数を公開します
window.handlePaneClosetFilter = handlePaneClosetFilter;
// スタジオ全体のクローゼット絞り込み関数を公開します
window.handleStudioClosetFilter = handleStudioClosetFilter;
// ブランド商品リストの部位絞り込み関数を公開します
window.handleStudioBrandFilter = handleStudioBrandFilter;
// ブランドリストのお気に入り限定トグル関数を公開します
window.toggleBrandFavFilter = toggleBrandFavFilter;
// 体型プロフィール（身長・体型・好み）保存関数を公開します
window.handleSaveBodyProfile = handleSaveBodyProfile;
// 位置・サイズ微調整パネルの開閉関数を公開します
window.toggleFittingAdjustPanel = toggleFittingAdjustPanel;
// 位置調整対象スロット切替関数を公開します
window.switchAdjustSlot = switchAdjustSlot;
// スライダー入力による微調整値反映関数を公開します
window.handleAdjustInput = handleAdjustInput;
// 微調整＋／－ボタン刻み変更関数を公開します
window.stepAdjust = stepAdjust;
// 調整中スロットの位置・拡大率初期化関数を公開します
window.resetFittingOffsets = resetFittingOffsets;
// 微調整値の確定保存関数を公開します
window.applyFittingOffsets = applyFittingOffsets;
// ブランドサイズ（S〜XL 等）入力変更関数を公開します
window.handleBrandSizeInput = handleBrandSizeInput;
// ブランドサイズのステップ変更関数を公開します
window.stepBrandSize = stepBrandSize;
// 手動での背景透過やり直し起動関数を公開します
window.triggerManualBgRemoval = triggerManualBgRemoval;
// 切り抜き前の元画像へ戻す関数を公開します
window.restoreOriginalUploadImage = restoreOriginalUploadImage;

// マネキンステージの部位スロットクリック処理をグローバル公開します
window.handleStageSlotClick = handleStageSlotClick;
// 部位スロット用のクイック服選びポップアップを開く関数を公開します
window.openStageQuickPicker = openStageQuickPicker;
// クイック服選びポップアップを閉じる関数を公開します
window.closeStageQuickPicker = closeStageQuickPicker;
// 商品カード／クローゼットカードのドラッグ開始処理を公開します
window.handleCardDragStart = handleCardDragStart;
// マネキンステージ上へのドラッグ中ホバー処理を公開します
window.handleStageDragOver = handleStageDragOver;
// マネキンステージ外へドラッグが離れたときの処理を公開します
window.handleStageDragLeave = handleStageDragLeave;
// マネキンステージへのドロップ着せ替え処理を公開します
window.handleStageDrop = handleStageDrop;
// カテゴリ別のフォールバック画像取得関数を公開します
window.getCategoryFallbackImage = getCategoryFallbackImage;
// 旧画像パスを現行パスへ補正する関数を公開します
window.migrateOldBrokenAssets = migrateOldBrokenAssets;
// 注文画面でのポイント利用数入力変更処理を公開します
window.handlePointsInputChange = handlePointsInputChange;
// 保有ポイント全額使用ボタン処理を公開します
window.handleUseAllPoints = handleUseAllPoints;
// ポイント利用取り消しボタン処理を公開します
window.handleResetPoints = handleResetPoints;
// 現在ログインユーザーの保有ポイント取得関数を公開します
window.getUserPoints = getUserPoints;
// 現在ログインユーザーのポイント数更新関数を公開します
window.setUserPoints = setUserPoints;
// カート内容を MySQL cart_items へ保存同期する関数を公開します
window.syncCartToBackend = syncCartToBackend;
// MySQL cart_items からカートを読み込む関数を公開します
window.syncCartFromBackend = syncCartFromBackend;
// MySQL closet_items からクローゼットを読み込む関数を公開します
window.syncClosetFromBackend = syncClosetFromBackend;
// MySQL favorites からお気に入りを読み込む関数を公開します
window.syncFavoritesFromBackend = syncFavoritesFromBackend;
// MySQL saved_outfits から保存コーデを読み込む関数を公開します
window.syncOutfitsFromBackend = syncOutfitsFromBackend;
// マネキンの試着状態を MySQL user_studio_states へ保存する関数を公開します
window.syncStudioStateToBackend = syncStudioStateToBackend;
// MySQL user_studio_states から試着状態を復元する関数を公開します
window.syncStudioStateFromBackend = syncStudioStateFromBackend;
// 画面内の最新MySQL再取得ボタン用リフレッシュ関数を公開します
window.handleRefreshFromMySQL = handleRefreshFromMySQL;
// 旧互換エイリアス（handleSyncAllToMySQL）として同期リフレッシュ関数を公開します
window.handleSyncAllToMySQL = handleRefreshFromMySQL;
