// ==========================================================================
//  MANEKIN FASHION - アプリ全体制御・画面切り替え (js/app.js)
//  【このファイル全体で何をしているの？】
//  ・サイト全体の共通データ管理（AppState：今ログインしている人、カートの中身、試着服など）
//  ・画面切り替え（SPAルーター：URL末尾の #home や #shop を見てページを切り替える）
//  ・ページを開いた時のログイン状態復元（Cookieを使って前回ログインしていた会員を復元）
//  ・サイト全体のボタンやリンクが押されたときのイベント一括登録（初期化処理）
// ==========================================================================

// ==========================================================================
// 【データ管理】AppState（アプリ全体の共通メモリデータ）
// 【役割】現在開いている画面の状態や、ログイン情報、カートの中身などを一時記憶しておく場所です
// ==========================================================================
const AppState = {
    // ハートを押してお気に入りにした商品のID一覧（例: [1, 5, 8]）
    favorites: [],
    // いまログインしている会員の情報（名前やメールアドレスなど。未ログイン時は null）
    currentUser: null,
    // ショッピングカートに入っている商品リスト
    cart: [],
    // 商品詳細ページで現在開いている商品のID番号
    currentDetailId: 1,
    // 商品詳細ページで選ばれている服のサイズ（初期値は M）
    selectedSize: "M",
    // ログイン中の会員の過去の注文履歴リスト
    orderHistory: [],
    // ログイン中の会員が持っているクーポン一覧（10%OFFクーポンなど）
    userCoupons: [],
    // 商品一覧ページで絞り込んでいる性別（'ALL', 'MEN', 'WOMEN'）
    selectedGender: "ALL",
    // 商品一覧ページで絞り込んでいるカテゴリ（'ALL', 'TOPS', 'BOTTOMS'など）
    selectedCategory: "ALL",
    // 商品一覧ページの並び順（'default': おすすめ順, 'price-asc': 価格が安い順など）
    selectedSort: "default",
    // 未ログインの人が「試着室」や「お会計」を押した時の、ログイン後の戻り先画面
    pendingAuthTarget: null,

    // --- ここから試着室（MANEKIN AIスタジオ）用のデータ ---
    // 自分が持っている服のリスト（手持ち服の写真や、過去に購入した服）
    myCloset: [],
    // マネキンが現在着ている服（帽子・アウター・トップス・ボトムス・靴の5箇所）
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
    // お気に入りのコーディネートとして保存したセットの一覧
    savedOutfits: [],
    // 試着室の中で今開いているタブの名前（初期値はコーデ作成 'create'）
    studioActiveTab: 'create',
    // 試着室の手持ち服リストで絞り込んでいるカテゴリ（'ALL' は全表示）
    studioClosetFilter: 'ALL',
    // 試着室のショップ商品リストで絞り込んでいるカテゴリ（'ALL' は全表示）
    studioBrandFilter: 'ALL',
    // スマホ画面幅でスタジオを表示するときのアクティブ表示切り替え（'mannequin' 優先）
    studioMobileView: 'mannequin',
    // 服の位置・サイズ微調整パネルで、いま動かしている服の部位（初期値 'outer'）
    activeAdjustSlot: 'outer',
    // 各部位の服の位置ズレ（上下・左右）や拡大率の微調整データ
    fittingOffsets: getDefaultFittingOffsets()
};

// 起動時 MySQL セッション復元が先に終わるまでルート判定を待たせるための同期制御変数
// 起動直後の MySQL ログイン状態確認（/api/auth/me）が完了したかどうかを記録するフラグ
let _authBootstrapDone = false;
// 上記確認処理の完了を他関数が await して待つための Promise 参照を保持します
let _authBootstrapPromise = null;

// ==========================================================================
// 【初期化処理】DOMContentLoaded イベントリスナー
// 【役割】HTMLの読み込みが終わった瞬間に、アプリの初期準備をまとめて実行する
// 【具体的な処理内容】
//   1. 過去の不要な一時データをクリアする
//   2. ヘッダーの数字（お気に入り数やカート点数）を初期化する
//   3. 画面上の全ボタンにクリック時の動作（setupEventListeners）を登録する
//   4. トップ画面・商品一覧・新作一覧の商品カードを描画する
//   5. 1回ログインした人がサーバーに問い合わせて前回ログインしていた会員を自動復元する
//   6. URLの末尾（#homeなど）を見て、最初の画面を表示する（handleRouting）
//   7. 今日の愛知県の気温を取得して、おすすめコーデバナーを表示する
// ==========================================================================
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
    // 起動時に現在の気温・季節に応じた AIコーデ提案（TODAY'S AI STYLING）を初期反映します
    if (typeof updateTodaySeasonalStyling === 'function') {
        updateTodaySeasonalStyling();
    }
});

// ==========================================================================
// 【関数】handleRouting(forcedRoute)
// 【役割】画面のURLを見て「今どのページを表示すればいいか」を判断して切り替える道案内係
// 【具体的な処理内容】
//   1. 起動直後の場合、サーバーからのログイン確認が終わるまで待つ
//   2. 今開いている古い画面（.page-view）をすべて非表示にする
//   3. URLの末尾（例: #shop, #item-detail?id=3 など）に応じた画面を表示する
//   4. 「試着室」や「マイページ」など、ログインが必要なページに未ログインで入ろうとしたら
//      自動でログイン画面（#login）へ誘導する
//   5. ナビゲーションメニュー（ヘッダーやスマホメニュー）の現在地アイコンを点灯させる
// ==========================================================================
async function handleRouting(forcedRoute) {
    // まだ起動時のセッション復元が終わっていなければ、未ログイン誤判定を防ぐため完了を待ちます
    if (!_authBootstrapDone && _authBootstrapPromise) {
        // 復元処理の Promise が完了するまで await で待機します
        await _authBootstrapPromise;
    }
    // 現在のURLハッシュを取得します（引数指定があればそれを最優先、空の場合はトップ画面 '#home' を既定値にします）
    const hash = (typeof forcedRoute === 'string' && forcedRoute) ? forcedRoute : (window.location.hash || '#home');
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
            // マイページ画面（#view-mypage）を表示します（未ログイン時もゲスト状態で開け、中のログインボタンからログイン可能）
            showView('view-mypage');
            // ナビの MYPAGE ボタンを選択状態にします
            highlightNavLink('mypage');
            // 会員プロフィール・保有ポイント・注文履歴・お気に入りタブの現在内容を描画します
            renderMyPage();
            // ログイン中の場合のみバックエンド（MySQL）から最新データを同期します
            if (AppState.currentUser) {
                syncOrdersFromBackend();
                if (typeof syncFavoritesFromBackend === 'function') syncFavoritesFromBackend();
                if (typeof fetchUserCoupons === 'function') fetchUserCoupons();
            }
            // switch 分岐を抜けます
            break;

        // '#manekin' または '#manekin-studio'（AI試着スタジオ）の両ルートを受け付けます
        case '#manekin':
        // AI試着スタジオ画面のルート指定です
        case '#manekin-studio':
            // まだログインしていない（AppState.currentUser が null）かチェックするアクセス制御です
            if (!AppState.currentUser) {
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
            // お気に入り商品一覧（favorites）を最新取得・同期します
            if (typeof syncFavoritesFromBackend === 'function') syncFavoritesFromBackend();
            // スタジオ全体（マネキン・棚リスト・調整パネル）を描画します
            // デフォルトで確実に試着室（コーデ作成: 'create'）タブを表示させます
            if (typeof switchStudioTab === 'function') {
                switchStudioTab('create');
            } else {
                renderManekinStudio('create');
            }
            // スマホ表示時も確実に試着室（マネキンステージ）を表示させます
            if (typeof switchMobileStudioView === 'function') {
                switchMobileStudioView('mannequin');
            }
            // 本日の気温・季節に応じた AIコーデ提案（TODAY'S AI STYLING）を更新します
            if (typeof updateTodaySeasonalStyling === 'function') {
                updateTodaySeasonalStyling();
            }
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

// ==========================================================================
// 【関数】updateAuthNoticeBanner()
// 【役割】ログイン画面に来たユーザーに対して「あなた専用の案内メッセージ」を表示する案内係
// 【具体的な処理内容】
//   ・未ログイン状態で「マイページ」「試着室」「お会計」を開こうとしたときに、
//     ログイン画面の上に「⚠️ ご利用には会員登録またはログインが必要です」という黄色い注意帯を表示する
//   ・何を開こうとしていたか（マイページなのか、試着室なのか、お会計なのか）に合わせて、
//     案内文のタイトルや説明テキストを自動で切り替える
// ==========================================================================
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
    // 既にログイン中の場合はマイページへスムーズに自動転送
    if (AppState.currentUser) {
        window.location.hash = '#mypage';
        return;
    }

    const target = AppState.pendingAuthTarget || sessionStorage.getItem('manekin_pending_auth_target');

    // マイページへ入ろうとして誘導された場合
    if (target === 'mypage') {
        if (loginAlert) loginAlert.style.display = 'block';
        if (regAlert) regAlert.style.display = 'block';
        const titleText = '⚠️ マイページのご利用には会員登録またはログインが必要です';
        const descText = 'ご購入履歴の確認やクーポン利用、マイクローゼットの管理にはアカウントが必要です。<br>ログインまたは新規会員登録が完了すると、ホーム画面へ戻ります。';
        if (loginTitle) loginTitle.textContent = titleText;
        if (loginDesc) loginDesc.innerHTML = descText;
        if (regTitle) regTitle.textContent = titleText;
        if (regDesc) regDesc.innerHTML = descText;
        // 直前に MANEKIN AIスタジオへ入ろうとして弾かれた場合の専用文言を設定します
    } else if (target === 'manekin') {
        // ログイン画面側の警告バナーを表示状態にします
        if (loginAlert) loginAlert.style.display = 'block';
        // 会員登録画面側の警告バナーを表示状態にします
        if (regAlert) regAlert.style.display = 'block';
        // AI試着スタジオ利用にはアカウントが必要である見出し文言を用意します
        const titleText = '⚠️ MANEKIN AIスタジオのご利用には会員登録またはログインが必要です';
        // ログイン後にホームへ戻る旨の案内HTML文言を用意します
        const descText = 'バーチャル試着やAIコーデ診断機能をご利用いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、ホーム画面へ戻ります。';
        // ログイン画面側アラートの見出しを書き換えます
        if (loginTitle) loginTitle.textContent = titleText;
        // ログイン画面側アラートの本文をHTMLとして反映します
        if (loginDesc) loginDesc.innerHTML = descText;
        // 会員登録画面側アラートの見出しを書き換えます
        if (regTitle) regTitle.textContent = titleText;
        // 会員登録画面側アラートの本文をHTMLとして反映します
        if (regDesc) regDesc.innerHTML = descText;
        // 直前に注文手続きページ（checkout）から認証誘導された場合の分岐です
    } else if (target === 'checkout') {
        // ログイン画面側の警告バナーを表示状態にします
        if (loginAlert) loginAlert.style.display = 'block';
        // 会員登録画面側の警告バナーを表示状態にします
        if (regAlert) regAlert.style.display = 'block';
        // 購入手続きにはログインが必要である見出し文言を用意します
        const titleText = '⚠️ ご購入手続きには会員登録またはログインが必要です';
        // ログイン後にホームへ戻る旨の案内HTML文言を用意します
        const descText = '商品をご購入いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、ホーム画面へ戻ります。';
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

// ==========================================================================
// 【関数】showView(viewId)
// 【役割】見たいページだけを画面に出して、関係ないページをパッと隠す画面切り替え係
// 【具体的な処理内容】
//   ・渡された画面ID（例: 'view-home', 'view-shop' など）の要素を探し、
//     `.active` クラスを付けて画面に表示させます（CSSで display: block(見える状態) になる(元々diplay: none(見えない状態から))）
// ==========================================================================
function showView(viewId) {
    // 引数 viewId に対応するHTML要素を検索します
    const targetView = document.getElementById(viewId);
    // 要素が存在すれば .active クラスを追加して画面に現します
    if (targetView) targetView.classList.add('active');
}

// ==========================================================================
// 【関数】highlightNavLink(navKey)
// 【役割】メニューバーの「今あなたが居るページ」のボタンをピカッと光らせて目立たせる目印係
// 【具体的な処理内容】
//   ・PC用のヘッダーメニューやスマホ用の引き出しメニューから、
//     今見ているページ（例: 'home', 'shop', 'favorites' など）に対応するボタンを探し、
//     `.active` クラスを付けて「今ここを開いていますよ」と目立たせます
// ==========================================================================
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

// ==========================================================================
// 【関数】setupEventListeners()
// 【役割】アプリ全体の「ボタンを押した時に動く仕組み」を作る準備係
// 【具体的な処理内容】
//   1. ブラウザの「戻る・進む」やURL変更時に自動で画面を切り替えるリスナーを登録
//   2. 「試着室」ボタンを押したときの未ログイン判定（未ログインならログインへ誘導）
//   3. 商品一覧のカテゴリフィルター（TOPS、BOTTOMSなど）ボタンの切り替え
//   4. ログイン・会員登録・お問い合わせ・注文確定などのフォーム送信イベントの登録
//   5. モーダルウィンドウの開閉ボタンや背景クリックで閉じる処理の登録
// ==========================================================================
function setupEventListeners() {
    // --------------------------------------------------------------------------
    // 1. URLの変更監視（ブラウザの「戻る・進む」やリンククリック時に画面を自動切替）
    // --------------------------------------------------------------------------
    window.addEventListener('hashchange', handleRouting);

    // --------------------------------------------------------------------------
    // 2. 試着室（MANEKIN AI）ボタンのクリック処理（未ログインならログイン画面へ誘導）
    // --------------------------------------------------------------------------
    document.querySelectorAll('.nav-manekin-btn, #manekin-menu-btn, #mobile-manekin-btn, #banner-manekin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!AppState.currentUser) {
                showToast('⚠️ MANEKIN機能のご利用にはログインまたは会員登録が必要です');
                window.location.hash = '#login';
                handleRouting('#login');
                return;
            }
            window.location.hash = '#manekin-studio';
            handleRouting('#manekin-studio');
        });
    });

    // --------------------------------------------------------------------------
    // 3. ポップアップ画面（モーダル）の「閉じる」ボタン＆背景クリックで閉じる処理
    // --------------------------------------------------------------------------
    // 汎用お知らせモーダルの「×」ボタンと「OK」ボタン
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalOkBtn = document.getElementById('modal-ok-btn');
    const manekinModal = document.getElementById('manekin-modal');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeManekinModal);
    if (modalOkBtn) modalOkBtn.addEventListener('click', closeManekinModal);
    if (manekinModal) {
        manekinModal.addEventListener('click', (e) => {
            if (e.target === manekinModal) closeManekinModal();
        });
    }

    // 手持ち服登録モーダルの背景クリックで閉じる処理
    const closetModal = document.getElementById('modal-add-closet');
    if (closetModal) {
        closetModal.addEventListener('click', (e) => {
            if (e.target === closetModal) closeAddClosetModal();
        });
    }

    // 保有クーポン一覧モーダルの背景クリックで閉じる処理
    const userCouponsModal = document.getElementById('modal-user-coupons');
    if (userCouponsModal) {
        userCouponsModal.addEventListener('click', (e) => {
            if (e.target === userCouponsModal && typeof closeMyPageCouponsModal === 'function') {
                closeMyPageCouponsModal();
            }
        });
    }

    // --------------------------------------------------------------------------
    // 4. 手持ち服登録フォームの送信（写真・服の名前をサーバーへ保存）
    // --------------------------------------------------------------------------
    const closetForm = document.getElementById('form-add-closet');
    if (closetForm) {
        closetForm.addEventListener('submit', handleAddClosetItem);
    }

    // --------------------------------------------------------------------------
    // 5. スマホ用スライドメニュー（ハンバーガーボタンで開閉、項目タップで閉じる）
    // --------------------------------------------------------------------------
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const menuOverlay = document.getElementById('menu-overlay');

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMobileDrawer);

    // メニュー内のリンクをタップした時に自動でメニューを引っ込める
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileDrawer);
    });

    // --------------------------------------------------------------------------
    // 6. 商品一覧ページのカテゴリ絞り込み（ALL / TOPS / BOTTOMS など）
    // --------------------------------------------------------------------------
    const filterGroup = document.getElementById('category-filter-group');
    if (filterGroup) {
        filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                AppState.selectedCategory = btn.getAttribute('data-category');
                renderCatalogProducts();
            });
        });
    }

    // --------------------------------------------------------------------------
    // 7. 商品一覧ページの並び替え（おすすめ順 / 価格が安い順など）
    // --------------------------------------------------------------------------
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            AppState.selectedSort = e.target.value;
            renderCatalogProducts();
        });
    }

    // --------------------------------------------------------------------------
    // 8. 会員認証（デモログイン / 通常ログイン / 新規会員登録 / ログアウト）
    // --------------------------------------------------------------------------
    // ワンクリックお試しデモログインボタン
    const demoBtn = document.getElementById('demo-login-btn');
    if (demoBtn) demoBtn.addEventListener('click', handleDemoLogin);

    // 通常ログインフォームの送信
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    // 新規会員登録フォームの送信
    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    // ログアウトボタン
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // --------------------------------------------------------------------------
    // 9. お会計画面の「注文を確定する」ボタン
    // --------------------------------------------------------------------------
    const placeOrderBtn = document.getElementById('btn-place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // --------------------------------------------------------------------------
    // 10. 支払い方法の選択切り替え（クレジットカード選択時のみカード入力欄を表示）
    // --------------------------------------------------------------------------
    document.querySelectorAll('.payment-option-label input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-option-label').forEach(lbl => lbl.classList.remove('selected'));
            radio.closest('.payment-option-label').classList.add('selected');

            const cardSubform = document.getElementById('credit-card-subform');
            if (cardSubform) {
                cardSubform.style.display = (radio.value === 'クレジットカード') ? 'flex' : 'none';
            }
        });
    });

    // --------------------------------------------------------------------------
    // 11. マイページのタブ切り替え（プロフィール / 注文履歴 / お気に入り）
    // --------------------------------------------------------------------------
    const mypageTabBtns = document.querySelectorAll('.mypage-tab-btn');
    mypageTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mypageTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.mypage-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const activeContent = document.getElementById(`tab-${targetTab}`);
            if (activeContent) activeContent.classList.add('active');
        });
    });
}

// ==========================================================================
// 【グローバル公開】HTMLの onclick などから直接呼べるように window へ登録
// 【役割】各ファイルで定義した関数をブラウザ全体（window）から呼び出せるようにして、
//         HTMLのボタン（onclick="〇〇()" など）から動かせるようにします
// ==========================================================================
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
// スマホ表示時のマネキン画面／操作パネル切り替え関数を公開します
window.switchMobileStudioView = switchMobileStudioView;
// 現在のコーディネートを MySQL saved_outfits へ保存する関数を公開します
window.handleSaveOutfit = handleSaveOutfit;
// コーデ名の入力プリセット反映関数を公開します
window.applyPresetName = applyPresetName;
// おすすめルックの一括試着適用関数を公開します
window.applyPresetLook = applyPresetLook;
window.applyTodaySeasonalPresetLook = applyTodaySeasonalPresetLook;
window.updateTodaySeasonalStyling = updateTodaySeasonalStyling;
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
