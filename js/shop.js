// ==========================================================================
//  MANEKIN FASHION - ショップ機能・会員認証・注文決済・マイページ (js/shop.js)
//  【このファイル全体で何をしているの？】
//  ・商品カタログ一覧表示、並び替え、絞り込み、商品詳細画面の表示
//  ・ショッピングカート機能（追加、数量変更、削除、バッジ数字の更新）
//  ・お会計・注文決済（配送先入力、クーポン割引、ポイント利用計算、注文確定）
//  ・会員認証機能（ログイン、新規会員登録、デモログイン、ログアウト）
//  ・マイページ機能（会員ランク、ポイント残高、過去の注文履歴、保有クーポン確認）
//  ・お気に入り機能（ハートボタンの登録/解除、お気に入り一覧画面）
//  ・Python(Flask)バックエンド＆MySQLデータベースとの全通信・自動データ同期
// ==========================================================================

// ==========================================================================


// ==========================================================================
//  第1章：端末判定・ローカルストレージ・セッション初期化
//  【このセクションの役割】
//  ・パソコン版（Python+MySQL）とスマホ版（localStorage）の自動判別
//  ・前回ログインしていた会員のCookieセッション復元
//  ・アカウント切り替え時の一時データ初期化
// ==========================================================================
// 【関数】isOfflineDemoUser(user)
// 【役割】テストアカウント（簡単ログイン）かどうかを判定する係
// 【処理内容】
//   ・「テストアカウントで簡単ログイン」で利用している時は true を返します。
//   ・このユーザーは MySQL データベースや Python サーバーに接続せず、
//     ブラウザ内（localStorage / メモリ）だけで安全・高速に全機能が動作します。
// ==========================================================================
function isOfflineDemoUser(user = (typeof AppState !== 'undefined' ? AppState.currentUser : null)) {
    if (user) {
        return !!(user.isDemo || user.isLocalStorage || user.email === 'demo@manekin.jp');
    }
    try {
        const raw = window.localStorage.getItem('manekin_ls_current_user');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.isDemo || parsed.isLocalStorage || parsed.email === 'demo@manekin.jp')) {
                return true;
            }
        }
    } catch (e) { }
    return false;
}

// 直接 localStorage を安全に取得・保存するヘルパー関数
function lsGetJsonDirect(key, fallback) {
    try {
        const raw = window.localStorage.getItem(key);
        if (raw === null || raw === undefined) return fallback;
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
}
function lsSetJsonDirect(key, val) {
    try {
        window.localStorage.setItem(key, JSON.stringify(val));
        return true;
    } catch (e) {
        return false;
    }
}

// ==========================================================================
// 【関数】isMobileLocalStorageMode()
// 【役割】今使っているのが「パソコン版」か「スマホ版」かをサッと見分ける環境調べ係
// 【具体的な処理内容】
//   ・テストアカウント（簡単ログイン）時、またはスマホ版環境のときは true（localStorageモード）を返します
//   ・通常ログインしたPCユーザーのみ false（MySQLデータベース接続モード）を返します
// ==========================================================================
function isMobileLocalStorageMode() {
    // 0. テストアカウント（簡単ログイン）時は、PCでもスマホでも常にデータベース接続不要（localStorage完結モード）！
    if (isOfflineDemoUser()) {
        return true;
    }
    try {
        const ua = navigator.userAgent || '';
        // 1. 実機スマートフォン（iPhone / Android / Mobile UA）または DevTools スマホ端末エミュレーション時のみ true
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) {
            return true;
        }
        // 2. タッチ専用端末（hover不可・coarseポインタ）かつ画面幅768px以下の場合のみ true
        // ※PCのデスクトップブラウザでウィンドウ幅を狭めただけや、F12開発者ツールを横に開いただけでは false（MySQL）を維持します
        if (window.matchMedia && window.matchMedia('(max-width: 768px) and (pointer: coarse) and (hover: none)').matches) {
            return true;
        }
    } catch (e) { }
    return false;
}

// ==========================================================================
// 【関数】lsGetJson(key, fallback)
// 【役割】スマホのブラウザ保存箱から、保存しておいた服やデータを安全に取り出す引き出し係
// 【具体的な処理内容】
//   ・保存されているJSONデータをJavaScriptオブジェクトに変換して返します
//   ・データが無い場合や壊れている場合は初期値（fallback）を返します
// ==========================================================================
function lsGetJson(key, fallback) {
    if (!isMobileLocalStorageMode()) return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        if (raw === null || raw === undefined) return fallback;
        return JSON.parse(raw);
    } catch (e) {
        return fallback;
    }
}

// ==========================================================================
// 【関数】lsSetJson(key, val)
// 【役割】スマホのブラウザ保存箱へ、服や設定データを壊さず大切にしまうお片付け係
// 【具体的な処理内容】
//   ・配列やオブジェクトをJSON文字列に変換してlocalStorageに書き込みます
// ==========================================================================
function lsSetJson(key, val) {
    if (!isMobileLocalStorageMode()) return false;
    try {
        window.localStorage.setItem(key, JSON.stringify(val));
        return true;
    } catch (e) {
        console.warn('localStorage 保存失敗:', key, e);
        return false;
    }
}

// ==========================================================================
// 【関数】getDefaultMobileClosetItems()
// 【役割】スマホ版を初めて開いた人に「最初のサンプル服3点セット」をプレゼントする初期服配り係
// 【具体的な処理内容】
//   ・クローゼットが空っぽだと試着が楽しめないため、最初から使える
//     トップス・ボトムスの初期サンプル服データを返します
// ==========================================================================
function getDefaultMobileClosetItems() {
    return [
        {
            id: 'c1',
            name: '黒ワイドスラックス',
            category: 'BOTTOMS',
            color: 'BLACK',
            season: 'オールシーズン',
            image: 'assets/images/men/ストレートレープセミフレアスラックス.png',
            isOwned: true,
            isPurchased: false
        },
        {
            id: 'c2',
            name: '白オックスフォードシャツ',
            category: 'TOPS',
            color: 'WHITE',
            season: '春・秋',
            image: 'assets/images/men/スカイオックスフォードシャツ.png',
            isOwned: true,
            isPurchased: false
        }
    ];
}

// ==========================================================================
// 【関数】ensureMobileUserInitialized(user)
// 【役割】スマホ版で新しく使い始めた人へ、初期データを準備してあげるセットアップ係
// 【具体的な処理内容】
//   ・「サンプルの手持ち服」やカート・注文履歴をスマホの保存領域に自動セットします
//   ※ クーポンは新規会員登録したユーザーにのみ付与されます
// ==========================================================================
function ensureMobileUserInitialized(user) {
    if (!isMobileLocalStorageMode() || !user || !user.id) return;
    const uid = String(user.id);
    if (lsGetJson(`manekin_ls_closet_${uid}`, null) === null) {
        lsSetJson(`manekin_ls_closet_${uid}`, getDefaultMobileClosetItems());
    }
    if (lsGetJson(`manekin_ls_cart_${uid}`, null) === null) {
        lsSetJson(`manekin_ls_cart_${uid}`, []);
    }
    if (lsGetJson(`manekin_ls_orders_${uid}`, null) === null) {
        lsSetJson(`manekin_ls_orders_${uid}`, []);
    }
    if (lsGetJson(`manekin_ls_favorites_${uid}`, null) === null) {
        lsSetJson(`manekin_ls_favorites_${uid}`, []);
    }
    if (lsGetJson(`manekin_ls_outfits_${uid}`, null) === null) {
        lsSetJson(`manekin_ls_outfits_${uid}`, []);
    }
}

// ==========================================================================
// 【関数】purgeAllManekinLocalStorage()
// 【役割】パソコン版で遊ぶときに、スマホ用の古い一時データが混ざらないよう綺麗に大掃除するお掃除係
// 【具体的な処理内容】
//   ・PC版ではMySQLサーバーのみを使うため、以前のlocalStorageデータが
//     混ざって誤作動しないように削除します
// ==========================================================================
function purgeAllManekinLocalStorage() {
    const isMobile = isMobileLocalStorageMode();
    [window.localStorage, window.sessionStorage].forEach(storage => {
        if (!storage) return;
        try {
            const targetKeys = [];
            for (let i = 0; i < storage.length; i++) {
                const k = storage.key(i);
                if (!k || !k.startsWith('manekin')) continue;
                if (isMobile && storage === window.localStorage && k.startsWith('manekin_ls_')) {
                    continue;
                }
                targetKeys.push(k);
            }
            targetKeys.forEach(k => storage.removeItem(k));
        } catch (e) { }
    });
}

// 開発者ツール等でスマホ表示 ⇔ デスクトップ表示を切り替えた際、デスクトップ版では即座にlocalStorageを破棄してMySQLへ切り替えます
let _lastMobileStorageModeState = isMobileLocalStorageMode();
window.addEventListener('resize', () => {
    const currentMode = isMobileLocalStorageMode();
    if (currentMode !== _lastMobileStorageModeState) {
        _lastMobileStorageModeState = currentMode;
        purgeAllManekinLocalStorage();
        if (typeof restoreAuthSessionFromBackend === 'function' && typeof applyAccountSession === 'function') {
            restoreAuthSessionFromBackend().then(u => applyAccountSession(u, { fromSessionRestore: true }));
        }
    }
});

// ==========================================================================
// 【関数】getApiBaseUrl()
// 【役割】通信先のPythonサーバー（住所）がどこにあるかを教えてくれる案内係
// 【具体的な処理内容】
//   ・現在開いているURLから、APIサーバー（http://127.0.0.1:8080 など）のアドレスを判定して返します
// ==========================================================================
function getApiBaseUrl() {
    // 条件（window.location.protocol !== 'file:' && (window.loca…）が成り立つか判定し、該当する場合の処理を実行します
    if (window.location.protocol !== 'file:' && (window.location.port === '8080' || window.__MANEKIN_API_ORIGIN__ === 'self')) {
        // 結果（''）を呼び出し元へ返却します
        return '';
    }
    // 定数 host を宣言し、値（(window.location.hostname === 'localho…）をセットします
    // MySQLの場合(localhostと127.0.0.1はどちらもMySQL)
    const host = (window.location.hostname === 'localhost') ? 'localhost' : '127.0.0.1';
    // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
    return `http://${host}:8080`;
}

// ==========================================================================
// 【関数】isServerUserId(uid)
// 【役割】会員番号がデータベースでちゃんと発行された本物の番号かを見極める身元チェック係
// 【具体的な処理内容】
//   ・IDが正の数値（1, 2, 3...など）かどうかを判定し、本物のログイン会員かどうかを確かめます
// ==========================================================================
function isServerUserId(uid) {
    // 結果（uid !== null && uid !== undefined && /^\d+$/.tes…）を呼び出し元へ返却します
    // /が正規表現の開始と終わり
    // ^が文字列の先頭
    // \dが0~9の数字一文字
    // +は１回以上くり返す
    // $は文字列の末尾
    // 先頭から末尾まで、1文字以上の数字だけでできている
    return uid !== null && uid !== undefined && /^\d+$/.test(String(uid));
}

// ==========================================================================
// 【関数】restoreAuthSessionFromBackend()
// 【役割】ページを開いたときに「さっきログインしていた人」を自動で呼び戻すおかえり係
// 【具体的な処理内容】
//   ・ブラウザのCookie（セッション）を使ってサーバーに問い合わせ、
//     ログイン中ならそのユーザー情報を取り出して画面に反映します
// ==========================================================================
async function restoreAuthSessionFromBackend() {
    // テストアカウントまたはスマホ版の場合は localStorage からログインセッションを復元します
    if (isMobileLocalStorageMode()) {
        const savedUser = lsGetJsonDirect('manekin_ls_current_user', null);
        if (savedUser && isServerUserId(savedUser.id)) {
            savedUser.isLocalStorage = true;
            if (savedUser.email === 'demo@manekin.jp') savedUser.isDemo = true;
            ensureMobileUserInitialized(savedUser);
            return savedUser;
        }
        // テストアカウントとして保存されている場合はバックエンドに問い合わせず即座に復元
        if (savedUser && (savedUser.isDemo || savedUser.email === 'demo@manekin.jp')) {
            ensureMobileUserInitialized(savedUser);
            return savedUser;
        }
        return null;
    }

    // PC版：通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/auth/me）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
            // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
            method: 'GET',
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include',
            // ブラウザが昔の通信結果をキャッシュ再利用しないよう 'no-store' を指定します
            cache: 'no-store'
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) return null;
        // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
        const data = await res.json();
        // 条件（data && data.authenticated && data.user && isServerU…）が成り立つか判定し、該当する場合の処理を実行します
        if (data && data.authenticated && data.user && isServerUserId(data.user.id)) {
            // 結果（data.user）を呼び出し元へ返却します
            return data.user;
        }
        // 処理結果の基準値として null を呼び出し元へ返して関数を終了します
        return null;
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 処理結果の基準値として null を呼び出し元へ返して関数を終了します
        return null;
    }
}

// ==========================================================================
// 【関数】resetAccountScopedDomInputs(user)
// 【役割】ログインやログアウトをしたときに、入力欄に残っている文字をスッキリ空っぽにするリセット係
// 【具体的な処理内容】
//   ・別のアカウントの情報が残らないよう、配送先住所やポイント入力欄の数値をクリアします
// ==========================================================================
function resetAccountScopedDomInputs(user) {
    // 条件（typeof checkoutUsedPoints !== 'undefined'）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof checkoutUsedPoints !== 'undefined') {
        // 変数・配列項目 checkoutUsedPoints の値を更新・計算します
        checkoutUsedPoints = 0;
    }
    if (typeof currentAppliedCoupon !== 'undefined') {
        currentAppliedCoupon = null;
    }
    // HTML 要素 #order-name を取得して変数 orderName に格納します
    const orderName = document.getElementById('order-name');
    // HTML 要素 #order-phone を取得して変数 orderPhone に格納します
    const orderPhone = document.getElementById('order-phone');
    // HTML 要素 #order-email を取得して変数 orderEmail に格納します
    const orderEmail = document.getElementById('order-email');
    // HTML 要素 #order-postal を取得して変数 orderPostal に格納します
    const orderPostal = document.getElementById('order-postal');
    // HTML 要素 #order-address を取得して変数 orderAddress に格納します
    const orderAddress = document.getElementById('order-address');
    // HTML 要素 #checkout-use-points を取得して変数 usePtsInput に格納します
    const usePtsInput = document.getElementById('checkout-use-points');
    // HTML 要素 #outfit-name-input を取得して変数 outfitNameInput に格納します
    const outfitNameInput = document.getElementById('outfit-name-input');
    // HTML 要素 #closet-item-name を取得して変数 closetItemName に格納します
    const closetItemName = document.getElementById('closet-item-name');

    // 条件（orderName）が成り立つか判定し、該当する場合の処理を実行します
    if (orderName) orderName.value = (user && user.name) ? user.name : '';
    // 条件（orderPhone）が成り立つか判定し、該当する場合の処理を実行します
    if (orderPhone) orderPhone.value = '';
    // 条件（orderEmail）が成り立つか判定し、該当する場合の処理を実行します
    if (orderEmail) orderEmail.value = (user && user.email) ? user.email : '';
    // 条件（orderPostal）が成り立つか判定し、該当する場合の処理を実行します
    if (orderPostal) orderPostal.value = '';
    // 条件（orderAddress）が成り立つか判定し、該当する場合の処理を実行します
    if (orderAddress) orderAddress.value = '';
    // 条件（usePtsInput）が成り立つか判定し、該当する場合の処理を実行します
    if (usePtsInput) usePtsInput.value = '';
    // 条件（outfitNameInput）が成り立つか判定し、該当する場合の処理を実行します
    if (outfitNameInput) outfitNameInput.value = '';
    // 条件（closetItemName）が成り立つか判定し、該当する場合の処理を実行します
    if (closetItemName) closetItemName.value = '';
}

// ==========================================================================
// 【関数】getDefaultFittingOffsets()
// 【役割】試着するときに、服の最初の位置や大きさをちょうどいい真ん中に合わせる初期位置セッティング係
// 【具体的な処理内容】
//   ・帽子・アウター・トップス・ボトムス・靴の各部位について、
//     ズレ量0、大きさ100%の基本設定オブジェクトを返します
// ==========================================================================
function getDefaultFittingOffsets() {
    // まとめた結果オブジェクトを生成して呼び出し元へ返却します
    return {
        // オブジェクトの 'hat' プロパティ値を設定します
        hat: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // オブジェクトの 'tops' プロパティ値を設定します
        tops: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // オブジェクトの 'outer' プロパティ値を設定します
        outer: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // オブジェクトの 'bottoms' プロパティ値を設定します
        bottoms: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // オブジェクトの 'shoes' プロパティ値を設定します
        shoes: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 }
    };
}

// ==========================================================================
// 【関数】applyAccountSession(user, options = {})
// 【役割】別の会員でログインしたときに、その人の専用データ（カゴの中身や手持ち服）に入れ替えるお引っ越し係
// 【具体的な処理内容】
//   ・前の人のデータをメモリから消去し、新しくログインした会員のカートや
//     お気に入り、クローゼットなどをサーバーから読み込んで画面を更新します
// ==========================================================================
async function applyAccountSession(user, options = {}) {
    // ブラウザ旧ストレージに残っていた manekin* データを完全消去して MySQL 単一運用を保ちます
    // 前の人の情報(古いやつ)だけ消す
    purgeAllManekinLocalStorage();

    // デバウンス待ち中の試着変更があれば先に MySQL へ確定送信してから後続処理へ進みます
    if (typeof flushPendingStudioStateSync === 'function') {
        // デバウンス待ち中の試着変更があれば先に MySQL へ確定送信してから後続処理へ進みます
        await flushPendingStudioStateSync();
    }

    // 定数 wasGuest を宣言し、値（!AppState.currentUser）をセットします
    const wasGuest = !AppState.currentUser;
    // 定数 guestCartSnapshot を宣言し、値（(options.preserveGuestCart && wasGuest…）をセットします
    const guestCartSnapshot = (options.preserveGuestCart && wasGuest && Array.isArray(AppState.cart))
        // 三項演算子・真(True)の場合の選択値（JSON.parse(JSON.stringify(AppState.cart))）
        ? JSON.parse(JSON.stringify(AppState.cart))
        // 三項演算子・偽(False)の場合の選択値（[];）
        : [];
    // 関連処理 resetAccountScopedDomInputs() を呼び出して処理・画面を更新します
    resetAccountScopedDomInputs(user || null);

    // アプリ全体状態 AppState.orderHistory を最新値（[]）に更新します
    AppState.orderHistory = [];
    // アプリ全体状態 AppState.favorites を最新値（[]）に更新します
    AppState.favorites = [];
    // アプリ全体状態 AppState.cart を最新値（[]）に更新します
    AppState.cart = [];
    // アプリ全体状態 AppState.myCloset を最新値（[]）に更新します
    AppState.myCloset = [];
    // アプリ全体状態 AppState.savedOutfits を最新値（[]）に更新します
    AppState.savedOutfits = [];
    // アプリ全体状態 AppState.currentOutfit を最新値（{ hat: null, outer: null, tops: null, …）に更新します
    AppState.currentOutfit = { hat: null, outer: null, tops: null, bottoms: null, shoes: null };
    // アプリ全体状態 AppState.fittingOffsets を最新値（getDefaultFittingOffsets()）に更新します
    AppState.fittingOffsets = getDefaultFittingOffsets();
    // アプリ全体状態 AppState.userCoupons を最新値（[]）に更新します
    AppState.userCoupons = [];
    // 現在適用中のクーポンを初期化します
    currentAppliedCoupon = null;

    // 条件（!user）が成り立つか判定し、該当する場合の処理を実行します
    if (!user) {
        // アプリ全体状態 AppState.currentUser を最新値（null）に更新します
        AppState.currentUser = null;
        // 条件（typeof renderMannequinStage === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderMannequinStage === 'function') renderMannequinStage();
        // 条件（typeof updateCartBadge === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateCartBadge === 'function') updateCartBadge();
        // 条件（typeof updateFavoriteBadges === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateFavoriteBadges === 'function') updateFavoriteBadges();
        // 条件（typeof updateAuthNavUI === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateAuthNavUI === 'function') updateAuthNavUI();
        // 条件（typeof renderMyPage === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderMyPage === 'function') renderMyPage();
        // 条件（typeof renderHomeProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderHomeProducts === 'function') renderHomeProducts();
        // 条件（typeof renderCatalogProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
        // 条件（typeof renderNewItems === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderNewItems === 'function') renderNewItems();
        // 条件（typeof renderFavoriteProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // アプリ全体状態 AppState.currentUser を最新値（user）に更新します
    AppState.currentUser = user;

    try {
        // 条件（typeof renderMannequinStage === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderMannequinStage === 'function') renderMannequinStage();
        // 条件（typeof updateCartBadge === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateCartBadge === 'function') updateCartBadge();
        // 条件（typeof updateFavoriteBadges === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateFavoriteBadges === 'function') updateFavoriteBadges();
        // 条件（typeof updateAuthNavUI === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateAuthNavUI === 'function') updateAuthNavUI();
        // 条件（typeof renderMyPage === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderMyPage === 'function') renderMyPage();
        // 条件（typeof renderHomeProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderHomeProducts === 'function') renderHomeProducts();
        // 条件（typeof renderCatalogProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
        // 条件（typeof renderNewItems === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderNewItems === 'function') renderNewItems();
        // 条件（typeof renderFavoriteProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
        // 条件（typeof renderManekinStudio === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderManekinStudio === 'function') renderManekinStudio(AppState.studioActiveTab || 'create');
    } catch (uiErr) {
        console.warn('UI初期描画中の軽微なエラー:', uiErr);
    }

    // ログインユーザーの複数データを MySQL バックエンドから並列（同時）に読み込んで完了を待ちます
    // ログインした後にサーバー（MySQL）から自分の最新データをまとめて一斉にとってくる処理
    try {
        // カート・注文履歴・お気に入り商品・クローゼット・コーデ・スタジオ状態・クーポンを一つずつ順番待ちせず同時に取りに行く仕組み
        await Promise.all([
            // 関連処理 syncCartFromBackend() を呼び出して処理・画面を更新します
            // さっき退避しておいたGEST時代(未ログイン時)のカートの中身を渡して、ログイン後のカートに合体させている
            syncCartFromBackend({ mergeItems: guestCartSnapshot }),
            // 関連処理 syncOrdersFromBackend() を呼び出して処理・画面を更新します
            syncOrdersFromBackend(),
            // 関連処理 syncFavoritesFromBackend() を呼び出して処理・画面を更新します
            syncFavoritesFromBackend(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            // 関数がまだ読み込まれていない場合でも、エラーにならないように何もしない完了状態(Promise.resolve)を返す
            (typeof syncClosetFromBackend === 'function') ? syncClosetFromBackend() : Promise.resolve(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncOutfitsFromBackend === 'function') ? syncOutfitsFromBackend() : Promise.resolve(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncStudioStateFromBackend === 'function') ? syncStudioStateFromBackend() : Promise.resolve(),
            // ユーザーが所持するクーポン一覧を取得して画面に反映します
            fetchUserCoupons()
        ]);
        // どれかの通信や同期でエラーが出ても警告文だけで済ませる
    } catch (syncErr) {
        console.warn('ログイン後のMySQL並列同期エラー:', syncErr);
    }
}

// ==========================================================================


// ==========================================================================
//  第2章：商品カタログ・商品一覧・詳細画面の描画
//  【このセクションの役割】
//  ・全商品一覧、メンズ・ウィメンズの絞り込み、おすすめ・新作商品の表示
//  ・商品詳細画面（大きな写真、価格、説明文、サイズ選びチップなど）の描画
// ==========================================================================
// 【関数】createProductCardHTML(product)
// 【役割】服の写真や値段、ハートボタンをきれいに並べた「商品カード」を1枚組み立てるカード職人係
// 【具体的な処理内容】
//   ・商品の写真、名前、価格、NEWバッジ、お気に入りハートボタンなどが
//     揃ったカードのHTMLを作って返します
// ==========================================================================
function createProductCardHTML(product) {
    // 定数 isFav を宣言し、値（AppState.favorites.includes(product.id…）をセットします
    const isFav = Array.isArray(AppState.favorites) && AppState.favorites.some(f => Number(f) === Number(product.id));
    // 定数 formattedPrice を宣言し、値（"¥" + product.price.toLocaleString()）をセットします
    const formattedPrice = "¥" + product.price.toLocaleString();

    // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
    // src=〇〇..画像URL  alt=〇〇..画像が表示できない時の画像の説明文
    // loading = "lazy"..遅延読み込みを行う  onerror="〇〇"..画像の読み込みに失敗したときに代替画像が表示

    // stopPropagation.. イベントを止める(商品詳細に飛ぶイベントを防ぎお気に入りに登録するボタンを子要素として指定する)
    return `
        <article class="product-card" data-id="${product.id}">
            <div class="product-img-wrapper" onclick="navigateToDetail(${product.id})">
                ${product.isNew ? '<span class="badge-new">NEW</span>' : ''}
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22800%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20800%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22600%22%20height%3D%22800%22%2F%3E%3Cpath%20d%3D%22M250%20320%20L350%20320%20L370%20420%20L230%20420%20Z%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%223%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22480%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20letter-spacing%3D%222%22%3EMANEKIN%20COLLECTION%3C%2Ftext%3E%3C%2Fsvg%3E'">
                <button class="fav-btn ${isFav ? 'is-favorite' : ''}" 
                        onclick="event.stopPropagation(); handleToggleFavorite(${product.id})" 
                        aria-label="${isFav ? 'お気に入りを解除' : 'お気に入りに追加'}">
                    <svg viewBox="0 0 24 24" fill="${isFav ? '#e53935' : 'none'}" stroke="${isFav ? '#e53935' : 'currentColor'}" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name" onclick="navigateToDetail(${product.id})">${product.name}</h3>
                <p class="product-price">${formattedPrice}<span class="tax"> (税込)</span></p>
            </div>
        </article>
    `;
}

// ==========================================================================
// 【関数】renderHomeProducts()
// 【役割】トップ画面（HOME）におすすめの服と新着の服を並べて華やかに飾るディスプレイ係
// 【具体的な処理内容】
//   ・全商品の中からおすすめ4点と新作4点をピックアップし、
//     トップ画面のグリッドに並べて表示します
// ==========================================================================
function renderHomeProducts() {
    // HTML 要素 #home-featured-grid を取得して変数 featuredContainer に格納します
    const featuredContainer = document.getElementById('home-featured-grid');
    // HTML 要素 #home-new-grid を取得して変数 newContainer に格納します
    const newContainer = document.getElementById('home-new-grid');
    // 条件（featuredContainer）が成り立つか判定し、該当する場合の処理を実行します
    if (featuredContainer) {
        // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して featuredItems に入れます
        const featuredItems = SAMPLE_PRODUCTS.filter(p => p.isFeatured).slice(0, 4);
        // 生成・変換した HTML 文字列を要素 featuredContainer の中身として描画します
        featuredContainer.innerHTML = featuredItems.map(p => createProductCardHTML(p)).join('');
    }
    // 条件（newContainer）が成り立つか判定し、該当する場合の処理を実行します
    if (newContainer) {
        // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して newItems に入れます
        const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew).slice(0, 4);
        // 生成・変換した HTML 文字列を要素 newContainer の中身として描画します
        newContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
    }
}

// ==========================================================================
// 【関数】renderCatalogProducts()
// 【役割】カタログ画面（CATALOG）にすべての服をずらりと並べて見せる商品陳列係
// 【具体的な処理内容】
//   ・選ばれているカテゴリ（トップス、ボトムスなど）や
//     並び順（おすすめ順、価格が安い順など）に合わせて商品を絞り込んで表示します
// ==========================================================================
function renderCatalogProducts() {
    // HTML 要素 #catalog-product-grid を取得して変数 gridContainer に格納します
    const gridContainer = document.getElementById('catalog-product-grid');
    // 条件（!gridContainer）が成り立つか判定し、該当する場合の処理を実行します
    if (!gridContainer) return;

    // HTML 要素 #catalog-breadcrumb-current を取得して変数 breadcrumbCurrent に格納します
    const breadcrumbCurrent = document.getElementById('catalog-breadcrumb-current');
    // HTML 要素 #catalog-page-title を取得して変数 pageTitle に格納します
    const pageTitle = document.getElementById('catalog-page-title');
    // HTML 要素 #catalog-page-subtitle を取得して変数 pageSubtitle に格納します
    const pageSubtitle = document.getElementById('catalog-page-subtitle');

    // 条件（AppState.selectedGender === 'MEN' || AppState.selectedGender === 'MAN'）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.selectedGender === 'MEN' || AppState.selectedGender === 'MAN') {
        // 条件（breadcrumbCurrent）が成り立つか判定し、該当する場合の処理を実行します
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'MEN COLLECTION';
        // 条件（pageTitle）が成り立つか判定し、該当する場合の処理を実行します
        if (pageTitle) pageTitle.textContent = "MEN COLLECTION";
        // 条件（pageSubtitle）が成り立つか判定し、該当する場合の処理を実行します
        if (pageSubtitle) pageSubtitle.textContent = "現代の男性に向けた、洗練されたモダンウェア（全12アイテム）";
        // 前の if が偽で、かつ（AppState.selectedGender === 'WOMEN' || AppState.selectedGender === 'WOMAN'）を満たす場合の別条件分岐です
    } else if (AppState.selectedGender === 'WOMEN' || AppState.selectedGender === 'WOMAN') {
        // 条件（breadcrumbCurrent）が成り立つか判定し、該当する場合の処理を実行します
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'WOMEN COLLECTION';
        // 条件（pageTitle）が成り立つか判定し、該当する場合の処理を実行します
        if (pageTitle) pageTitle.textContent = "WOMEN COLLECTION";
        // 条件（pageSubtitle）が成り立つか判定し、該当する場合の処理を実行します
        if (pageSubtitle) pageSubtitle.textContent = "凛とした美しさと現代的なリラックス感を纏うウィメンズウェア（全12アイテム）";
        // 上記の if 条件に当てはまらなかった場合の分岐処理です（デフォルト: HOMEからすべて見るを押した時など）
    } else {
        // 条件（breadcrumbCurrent）が成り立つか判定し、該当する場合の処理を実行します
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'ALL COLLECTION';
        // 条件（pageTitle）が成り立つか判定し、該当する場合の処理を実行します
        if (pageTitle) pageTitle.textContent = "ALL COLLECTION";
        // 条件（pageSubtitle）が成り立つか判定し、該当する場合の処理を実行します
        if (pageSubtitle) pageSubtitle.textContent = "すべての最新アイテム一覧（全24アイテム）";
    }

    // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して items に入れます
    let items = [...SAMPLE_PRODUCTS];
    // 条件（AppState.selectedGender && AppState.selectedGender !…）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.selectedGender && AppState.selectedGender !== 'ALL') {
        // 変数・配列項目 items の値を更新・計算します
        items = items.filter(p => p.gender === AppState.selectedGender);
    }
    // 条件（AppState.selectedCategory !== 'ALL'）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.selectedCategory !== 'ALL') {
        // 変数・配列項目 items の値を更新・計算します
        items = items.filter(p => p.category === AppState.selectedCategory);
    }

    // 値（AppState.selectedSort)）に応じて処理ケースを分岐する switch 文を開始します
    switch (AppState.selectedSort) {
        // 値が 'price-asc' だった場合の専用処理ルートです
        case 'price-asc':
            // 選択中の並び順指定（安い順／高い順／名前順／新着順）に沿って商品配列 items を並べ替えます
            items.sort((a, b) => a.price - b.price);
            // 現在の case / ループ処理をここで抜けます
            break;
        // 値が 'price-desc' だった場合の専用処理ルートです
        case 'price-desc':
            // 選択中の並び順指定（安い順／高い順／名前順／新着順）に沿って商品配列 items を並べ替えます
            items.sort((a, b) => b.price - a.price);
            // 現在の case / ループ処理をここで抜けます
            break;
        // 値が 'name-asc' だった場合の専用処理ルートです
        case 'name-asc':
            // 選択中の並び順指定（安い順／高い順／名前順／新着順）に沿って商品配列 items を並べ替えます
            //  あいうえお順
            items.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            // 現在の case / ループ処理をここで抜けます
            break;
        // どの case にも該当しなかった場合の既定（デフォルト）処理です
        default:
            // 選択中の並び順指定（安い順／高い順／名前順／新着順）に沿って商品配列 items を並べ替えます
            // idの若いやつ順
            items.sort((a, b) => a.id - b.id);
            // 現在の case / ループ処理をここで抜けます
            break;
    }
    // 生成・変換した HTML 文字列を要素 gridContainer の中身として描画します
    gridContainer.innerHTML = items.map(p => createProductCardHTML(p)).join('');
}

// ==========================================================================
// 【関数】renderNewItems()
// 【役割】新作一覧画面に「NEW」のタグがついたピカピカの新しい服だけを集めて並べる新着コーナー係
// 【具体的な処理内容】
//   ・新作フラグ（isNew: true）が付いている商品だけを抽出して画面に並べます
// ==========================================================================
function renderNewItems() {
    // HTML 要素 #new-items-grid を取得して変数 gridContainer に格納します
    const gridContainer = document.getElementById('new-items-grid');
    // 条件（!gridContainer）が成り立つか判定し、該当する場合の処理を実行します
    if (!gridContainer) return;
    // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して newItems に入れます
    const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew);
    // 生成・変換した HTML 文字列を要素 gridContainer の中身として描画します
    gridContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
}

// ==========================================================================
// 【関数】navigateToDetail(productId)
// 【役割】気になる服がクリックされたときに、「商品の詳しい説明画面」へ連れて行ってあげる誘導係
// 【具体的な処理内容】
//   ・URLの末尾を `#item-detail?id=商品番号` に変更して、詳細画面を開きます
// ==========================================================================
function navigateToDetail(productId) {
    // 変数・配列項目 window.location.hash の値を更新・計算します
    window.location.hash = `#item-detail?id=${productId}`;
}

// ==========================================================================
// 【関数】renderItemDetail(productId)
// 【役割】商品詳細画面に大きな写真・説明・選べるサイズを細かく描画して説明する詳しい店員さん係
// 【具体的な処理内容】
//   ・指定された商品の写真、説明文、素材情報、サイズ選択チップ、
//     今すぐ購入ボタン、カート追加ボタンを画面に組み立てて表示します
// ==========================================================================
function renderItemDetail(productId) {
    // HTML 要素 #item-detail-layout を取得して変数 detailLayout に格納します
    const detailLayout = document.getElementById('item-detail-layout');
    // HTML 要素 #detail-breadcrumb-name を取得して変数 breadcrumbName に格納します
    const breadcrumbName = document.getElementById('detail-breadcrumb-name');
    // 条件（!detailLayout）が成り立つか判定し、該当する場合の処理を実行します
    if (!detailLayout) return;

    // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して product に入れます
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    // 条件（!product）が成り立つか判定し、該当する場合の処理を実行します
    if (!product) {
        // 生成・変換した HTML 文字列を要素 detailLayout の中身として描画します
        detailLayout.innerHTML = '<p>商品が見つかりませんでした。</p>';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 条件（breadcrumbName）が成り立つか判定し、該当する場合の処理を実行します
    if (breadcrumbName) {
        // 文字要素 breadcrumbName の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        breadcrumbName.textContent = product.name;
    }

    // 定数 isFav を宣言し、値（AppState.favorites.includes(product.id…）をセットします
    const isFav = Array.isArray(AppState.favorites) && AppState.favorites.some(f => Number(f) === Number(product.id));
    // 定数 formattedPrice を宣言し、値（"¥" + product.price.toLocaleString()）をセットします
    const formattedPrice = "¥" + product.price.toLocaleString();
    // 定数 initialImgUrl を宣言し、値（product.image）をセットします
    const initialImgUrl = product.image;

    // テンプレートリテラルで組み立てた HTML を要素 detailLayout 内に書き込んで画面を更新します
    detailLayout.innerHTML = `
        <div class="detail-gallery">
            <div class="detail-main-img-box">
                <!-- 写真切り替えメイン画像（画像がない場合も安全にフォールバック） -->
                <img src="${initialImgUrl}" alt="${product.name}" class="detail-main-img" id="detail-main-img" onerror="this.src='${product.image}'">
            </div>
        </div>

        <div class="detail-info-column">
            <p class="detail-meta">${product.category} | 型番: ${product.sku}</p>
            <h1 class="detail-title">${product.name}</h1>
            <div class="detail-price-box">
                <span class="detail-price">${formattedPrice}</span>
                <span class="detail-tax">(税込)</span>
            </div>

            <div class="detail-actions">
                <button type="button" class="btn btn-buy-now btn-block" onclick="handleBuyNow(${product.id})">
                    今すぐ購入する (ご注文手続きへ) &rarr;
                </button>
                <button type="button" class="btn btn-secondary btn-block" onclick="handleAddToCartFromDetail(${product.id})">
                    ショッピングバッグに追加する
                </button>
                <button type="button" class="btn-detail-fav ${isFav ? 'is-favorite' : ''}" id="detail-fav-btn" onclick="handleToggleFavorite(${product.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    ${isFav ? 'お気に入り解除' : 'お気に入りに追加'}
                </button>
            </div>

            <div class="detail-description-box">
                <h3 class="detail-desc-heading">商品概要</h3>
                <p class="detail-desc-text">${product.description}</p>
                <h3 class="detail-desc-heading">素材・仕様</h3>
                <ul class="detail-spec-list">
                    <li>・素材：${product.material}</li>
                    <li>・洗濯機洗い可（ネット使用推奨）</li>
                    <li>・透け感：なし</li>
                    <li>・伸縮性：適度にあり</li>
                </ul>
            </div>
        </div>
    `;
}

// ==========================================================================
//  3. ショッピングカート管理（シーケンス保護 ＋ MySQL cart_items 同期）
// ==========================================================================
// 複数回のカート保存 API 通信が順番を追い越さないよう直列に繋ぐための待機用 Promise です
// 続けてカートに保存するとエラーが起こる可能性があるから一回保存されるごとに終了している
let _cartSyncPromise = Promise.resolve();
// ユーザーごとの最新カート操作順番を記録し、古い通信応答による先祖返りを防ぐ連番管理マップです
const _cartSyncSeqByUser = {};

// ==========================================================================


// ==========================================================================
//  第3章：ショッピングカート機能・数量変更・MySQL同期
//  【このセクションの役割】
//  ・「カートに追加」「今すぐ購入」ボタンの処理
//  ・カート内商品の数量増減（＋／－）と削除
//  ・ヘッダーのカート点数バッジの更新、MySQLデータベースとの自動同期
// ==========================================================================
// 【関数】getCartUserSeq(uid)
// 【役割】買い物カゴの通信順番が前後して中身が壊れないように見守る通信の順番チェック係
// 【具体的な処理内容】
//   ・非同期通信のズレによる上書きを防ぐための連番を管理します
// ==========================================================================
function getCartUserSeq(uid) {
    // 結果（_cartSyncSeqByUser[String(uid)] || 0）を呼び出し元へ返却します
    return _cartSyncSeqByUser[String(uid)] || 0;
}

// ==========================================================================
// 【関数】bumpCartUserSeq(uid)
// 【役割】買い物カゴの通信番号をカチッと +1 進めて最新の通信合図を出すカウント係
// 【具体的な処理内容】
//   ・新しい操作が行われたことを示すために連番を増やします
// ==========================================================================
function bumpCartUserSeq(uid) {
    // 定数 k を宣言し、値（String(uid)）をセットします
    const k = String(uid);
    // 変数・配列項目 _cartSyncSeqByUser[k] の値を更新・計算します
    _cartSyncSeqByUser[k] = (_cartSyncSeqByUser[k] || 0) + 1;
    // 結果（_cartSyncSeqByUser[k]）を呼び出し元へ返却します
    return _cartSyncSeqByUser[k];
}

// ==========================================================================
// 【関数】syncCartToBackend()
// 【役割】買い物カゴに入っている服をデータベースへ確実に届けて保存するカゴの連絡係
// 【具体的な処理内容】
//   ・カートに入っている商品のリストをサーバーへ送信して、データベースを最新状態に更新します
// ==========================================================================
async function syncCartToBackend() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // 処理結果の基準値として false を呼び出し元へ返して関数を終了します
        return false;
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して snapshot に保存します
    const snapshot = JSON.parse(JSON.stringify(AppState.cart || []));

    // スマホ版の場合は localStorage にカート内容を保存します
    if (isMobileLocalStorageMode()) {
        bumpCartUserSeq(targetUserId);
        return lsSetJson(`manekin_ls_cart_${targetUserId}`, snapshot);
    }

    // 定数 seq を宣言し、値（bumpCartUserSeq(targetUserId)）をセットします
    const seq = bumpCartUserSeq(targetUserId);

    // 定数 runSync を宣言し、値（async () => {）をセットします
    const runSync = async () => {
        // 条件（seq !== getCartUserSeq(targetUserId)）が成り立つか判定し、該当する場合の処理を実行します
        if (seq !== getCartUserSeq(targetUserId)) {
            // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
            return true;
        }
        // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
        try {
            // Flask バックエンド API（/api/cart/sync）へ非同期リクエストを送信し、応答を待ち受けます
            const res = await fetch(`${getApiBaseUrl()}/api/cart/sync`, {
                // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
                method: 'POST',
                // サーバーへ送るデータの形式が JSON であることを伝える Content-Type ヘッダです
                headers: { 'Content-Type': 'application/json' },
                // Cookie（HttpOnly の manekin_session）を API リクエストに複数のものをひとまとめにして送信する必須指定です
                credentials: 'include',
                // JavaScript オブジェクトを JSON 文字列へ変換して送信ボディに乗せます
                body: JSON.stringify({
                    // MySQL でどの会員アカウントのデータか区別するための user_id をセットします
                    user_id: targetUserId,
                    // 対象商品・着用アイテムの一覧データです
                    items: snapshot
                })
            });
            // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
            if (!res.ok) throw new Error('Cart sync failed');
            // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
            return true;
            // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
        } catch (e) {
            // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
            console.warn('[MySQL] カート同期エラー:', e);
            // 処理結果の基準値として false を呼び出し元へ返して関数を終了します
            return false;
        }
    };

    // 変数・配列項目 _cartSyncPromise の値を更新・計算します
    _cartSyncPromise = _cartSyncPromise.then(runSync, runSync);
    // 結果（_cartSyncPromise）を呼び出し元へ返却します
    return _cartSyncPromise;
}

// ==========================================================================
// 【関数】syncCartFromBackend(options = {})
// 【役割】データベースから最新のカゴの中身を取り出して画面にパッと映し出すカゴの復元係
// 【具体的な処理内容】
//   ・データベースに保存されているカート商品を取得し、
//     ヘッダーの数字バッジやお会計画面のリストを更新します
// ==========================================================================
async function syncCartFromBackend(options = {}) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
        updateCartBadge();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 定数 mergeItems を宣言し、値（Array.isArray(options.mergeItems) ? op…）をセットします
    const mergeItems = Array.isArray(options.mergeItems) ? options.mergeItems : [];

    // スマホ版の場合は localStorage からカート内容を取得・マージします
    if (isMobileLocalStorageMode()) {
        const savedItems = lsGetJson(`manekin_ls_cart_${targetUserId}`, []);
        const finalCart = Array.isArray(savedItems) ? [...savedItems] : [];
        if (mergeItems.length > 0) {
            mergeItems.forEach(item => {
                const idx = finalCart.findIndex(c => c.id === item.id);
                if (idx > -1) {
                    finalCart[idx].quantity = (finalCart[idx].quantity || 1) + (item.quantity || 1);
                } else {
                    finalCart.push({ ...item });
                }
            });
            lsSetJson(`manekin_ls_cart_${targetUserId}`, finalCart);
        }
        AppState.cart = finalCart;
        updateCartBadge();
        if (window.location.hash === '#checkout' && typeof renderCheckoutPage === 'function') {
            renderCheckoutPage();
        }
        return;
    }

    // 定数 fetchStartSeq を宣言し、値（getCartUserSeq(targetUserId)）をセットします
    const fetchStartSeq = getCartUserSeq(targetUserId);

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/cart/${targetUserId}）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${getApiBaseUrl()}/api/cart/${targetUserId}`, {
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include',
            // ブラウザが昔の通信結果をキャッシュ再利用しないよう 'no-store' を指定します
            cache: 'no-store'
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('Cart fetch failed');
        // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
        const data = await res.json();
        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;

        // 定数 serverItems を宣言し、値（Array.isArray(data.items) ? data.items…）をセットします
        const serverItems = Array.isArray(data.items) ? data.items : [];
        // 条件（fetchStartSeq !== getCartUserSeq(targetUserId)）が成り立つか判定し、該当する場合の処理を実行します
        if (fetchStartSeq !== getCartUserSeq(targetUserId)) {
            // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
            if (mergeItems.length === 0) return;
            // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して mergedCurrent に保存します
            const mergedCurrent = JSON.parse(JSON.stringify(AppState.cart || []));
            // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
            serverItems.forEach(item => {
                // 定数 idx を宣言し、値（mergedCurrent.findIndex(c => c.id === item.id)）をセットします
                const idx = mergedCurrent.findIndex(c => c.id === item.id);
                // 条件（idx > -1）が成り立つか判定し、該当する場合の処理を実行します
                if (idx > -1) {
                    // 変数・配列項目 mergedCurrent[idx].quantity の値を更新・計算します
                    mergedCurrent[idx].quantity = Math.max(mergedCurrent[idx].quantity || 1, item.quantity || 1);
                    // 上記の if 条件に当てはまらなかった場合の分岐処理です
                } else {
                    // 配列の末尾に新しい要素を追加します（mergedCurrent.push({ ...item });）
                    mergedCurrent.push({ ...item });
                }
            });
            // アプリ全体状態 AppState.cart を最新値（mergedCurrent）に更新します
            AppState.cart = mergedCurrent;
            // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
            updateCartBadge();
            // 条件（window.location.hash === '#checkout' && typeof rende…）が成り立つか判定し、該当する場合の処理を実行します
            if (window.location.hash === '#checkout' && typeof renderCheckoutPage === 'function') {
                // 関連処理 renderCheckoutPage() を呼び出して処理・画面を更新します
                renderCheckoutPage();
            }
            // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
            await syncCartToBackend();
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }

        // 定数 finalCart を宣言し、値（[...serverItems]）をセットします
        const finalCart = [...serverItems];
        // 再代入可能な変数 needPushToServer を宣言し、値（false）をセットします
        // マージした後にサーバーへ送り返す必要があるか
        let needPushToServer = false;

        // 条件（mergeItems.length > 0）が成り立つか判定し、該当する場合の処理を実行します
        if (mergeItems.length > 0) {
            // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
            mergeItems.forEach(item => {
                // 定数 idx を宣言し、値（finalCart.findIndex(c => c.id === item.id)）をセットします
                // 商品IDが一致する商品があるかどうかfinalCartの中から探す
                const idx = finalCart.findIndex(c => c.id === item.id);
                // 条件（idx > -1）が成り立つか判定し、該当する場合の処理を実行します
                // 0個以上一致するものがある場合は、
                if (idx > -1) {
                    // 変数・配列項目 finalCart[idx].quantity の値を更新・計算します
                    // 既存の正本の数量に追加分の数量を足します。quantity=既存の商品の数量
                    finalCart[idx].quantity = (finalCart[idx].quantity || 1) + (item.quantity || 1);
                    // 上記の if 条件に当てはまらなかった場合の分岐処理です
                } else {
                    // 配列の末尾に新しい要素を追加します（finalCart.push({ ...item });）
                    // 見つからなかった場合は、カートの末尾に追加
                    finalCart.push({ ...item });
                }
            });
            // 変数・配列項目 needPushToServer の値を更新・計算します
            // カートに反映したのでサーバーへ送信が必要だよって判定しておく
            needPushToServer = true;
        }

        // アプリ全体状態 AppState.cart を最新値（finalCart）に更新します
        AppState.cart = finalCart;
        // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
        updateCartBadge();
        // 条件（window.location.hash === '#checkout' && typeof rende…）が成り立つか判定し、該当する場合の処理を実行します
        if (window.location.hash === '#checkout' && typeof renderCheckoutPage === 'function') {
            // 関連処理 renderCheckoutPage() を呼び出して処理・画面を更新します
            renderCheckoutPage();
        }

        // 条件（needPushToServer）が成り立つか判定し、該当する場合の処理を実行します
        if (needPushToServer) {
            // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
            await syncCartToBackend();
        }
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLからのカート取得に失敗しました:', e);
    }
}

// ==========================================================================
// 【関数】updateCartBadge()
// 【役割】画面右上にある買い物カゴアイコンの「現在の点数バッジ」を最新の数に書き換えるバッジ係
// 【具体的な処理内容】
//   ・カート内の商品の合計数量（例: 3点）を計算し、赤いバッジの数字を書き換えます
// ==========================================================================
function updateCartBadge() {
    // 条件（!AppState.cart || !Array.isArray(AppState.cart)）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.cart || !Array.isArray(AppState.cart)) {
        // アプリ全体状態 AppState.cart を最新値（[]）に更新します
        AppState.cart = [];
    }
    // 定数 totalCount を宣言し、値（AppState.cart.reduce((sum, item) => su…）をセットします
    // reduce=配列の中身を順番に足し算(まとめて)ひとまとめにする
    // カート内の商品の個数を全部足して、合計数を出す
    // sumが足し算で、既存の商品数または追加されるたびに1足されていく
    const totalCount = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    // HTML 要素 #header-cart-badge を取得して変数 cartBadge に格納します
    const cartBadge = document.getElementById('header-cart-badge');
    // 条件（cartBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (cartBadge) {
        // 文字要素 cartBadge の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        // isNaN = もし計算結果が数字にならない場合
        // isNaN= not a number
        cartBadge.textContent = isNaN(totalCount) ? 0 : totalCount;
    }
}

// ==========================================================================
// 【関数】handleAddToCartFromDetail(productId)
// 【役割】商品詳細画面で「ショッピングバッグに追加」が押されたときにカゴに入れるお買い物係
// 【具体的な処理内容】
//   ・商品をカートに追加（すでにあれば数量を+1）し、
//     サーバーに保存して完了通知メッセージを出します
// ==========================================================================
async function handleAddToCartFromDetail(productId) {
    // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して product に入れます
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    // 条件（!product）が成り立つか判定し、該当する場合の処理を実行します
    if (!product) return false;

    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して prevCart に保存します
    // 今のカートの中身を丸ごとコピーしてバックアップしている = あとで処理に失敗したときなどに元の状態に戻せる状態にしておく目的(現在の配列か空配列)
    const prevCart = JSON.parse(JSON.stringify(AppState.cart || []));

    // 定数 currentImg を宣言し、値（product.image）をセットします
    const currentImg = product.image;

    // 定数 existingIndex を宣言し、値（AppState.cart.findIndex(）をセットします
    const existingIndex = AppState.cart.findIndex(
        // 変数・配列項目 item の値を更新・計算します
        item => item.id === product.id
    );

    // 条件（existingIndex > -1）が成り立つか判定し、該当する場合の処理を実行します
    // カートに追加する商品で同じものがあった時　既に一つ存在しているので個数を増やす
    if (existingIndex > -1) {
        // 変数・配列項目 AppState.cart[existingIndex].qua… の値を更新・計算します
        // カート内の見つかった位置がexistingIndexで既存商品の数を一つ増やす。
        AppState.cart[existingIndex].quantity += 1;
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
        // 全く新しい商品を追加しようとしているときに新しい商品の情報を追加する
    } else {
        // 配列の末尾に新しい要素を追加します（AppState.cart.push({）
        AppState.cart.push({
            // レコード・商品・コーデを識別する ID プロパティをセットします
            id: product.id,
            // 商品名またはアイテム名称
            name: product.name,
            // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
            category: product.category || 'TOPS',
            // 単価・価格（円）
            price: product.price,
            // 数量
            quantity: 1,
            // 画像ファイルパスまたは DataURL
            image: currentImg
        });
    }

    // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
    updateCartBadge();

    // 条件（AppState.currentUser && isServerUserId(AppState.curr…）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser && isServerUserId(AppState.currentUser.id)) {
        // 定数 ok を宣言し、値（await syncCartToBackend()）をセットします
        // その人のアカウント情報(マイクローゼット、保有ポイントなど)を復元する
        const ok = await syncCartToBackend();
        // 条件（!ok）が成り立つか判定し、該当する場合の処理を実行します
        // もし、アカウント情報が復元できなかったら
        if (!ok) {
            // アプリ全体状態 AppState.cart を最新値（prevCart）に更新します
            // 現在のカートの中にバックアップしたカートの情報を入れる
            AppState.cart = prevCart;
            // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
            updateCartBadge();
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ MySQLへのカート保存に失敗しました（サーバー接続を確認してください）');
            // 処理結果の基準値として false を呼び出し元へ返して関数を終了します
            return false;
        }
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast(`「${product.name}」をバッグに追加しMySQLに保存しました`);
        // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
        return true;
    }

    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast(`「${product.name}」をバッグに追加しました（ログインでMySQLに保存）`);
    // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
    return true;
}

// ==========================================================================
// 【関数】handleBuyNow(productId)
// 【役割】「今すぐ購入」が押されたときに、カゴに入れて即座にお会計レジへ直行させるスピード案内係
// 【具体的な処理内容】
//   ・その商品をカートに追加した上で、そのまま購入手続きページ（#checkout）へ
//     一気に移動します（未ログインならログインへ誘導）
// ==========================================================================
async function handleBuyNow(productId) {
    // 定数 added を宣言し、値（await handleAddToCartFromDetail(produc…）をセットします
    const added = await handleAddToCartFromDetail(productId);
    // 条件（!added）が成り立つか判定し、該当する場合の処理を実行します
    if (!added) return;
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser) {
        // アプリ全体状態 AppState.pendingAuthTarget を最新値（'checkout'）に更新します
        AppState.pendingAuthTarget = 'checkout';
        sessionStorage.setItem('manekin_pending_auth_target', 'checkout');
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ ご購入には会員登録またはログインが必要です');
        // 変数・配列項目 window.location.hash の値を更新・計算します
        window.location.hash = '#login';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 変数・配列項目 window.location.hash の値を更新・計算します
    window.location.hash = '#checkout';
}

// ==========================================================================
// 【関数】updateCartItemQty(index, delta)
// 【役割】お会計画面で服の数を「＋」「－」ボタンで増やしたり減らしたりする個数調整係
// 【具体的な処理内容】
//   ・数量を1つ増やしたり減らしたり（0個になったらカートから削除）して、
//     合計金額を自動再計算しサーバーへ保存します
// ==========================================================================
async function updateCartItemQty(index, delta) {
    // 条件（!AppState.cart[index]）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.cart[index]) return;
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して prevCart に保存します
    const prevCart = JSON.parse(JSON.stringify(AppState.cart || []));
    // 変数・配列項目 AppState.cart[index].quantity の値を更新・計算します
    // AppState.cart[index]番目の小ン本の個数にdeltaを足す delta(+と-どっちもつかさどってる)
    AppState.cart[index].quantity += delta;
    // 条件（AppState.cart[index].quantity <= 0）が成り立つか判定し、該当する場合の処理を実行します
    // 増減した結果個数が０以下になったかチェックして、
    if (AppState.cart[index].quantity <= 0) {
        // 配列の指定位置から要素を取り除いて削除します（AppState.cart.splice(index, 1);）
        // index番目にある商品をAppState.cart配列から一つ削除
        AppState.cart.splice(index, 1);
    }
    // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
    updateCartBadge();
    // 関連処理 renderCheckoutPage() を呼び出して処理・画面を更新します
    renderCheckoutPage();

    // 条件（AppState.currentUser && isServerUserId(AppState.curr…）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser && isServerUserId(AppState.currentUser.id)) {
        // 定数 ok を宣言し、値（await syncCartToBackend()）をセットします
        const ok = await syncCartToBackend();
        // 条件（!ok）が成り立つか判定し、該当する場合の処理を実行します
        if (!ok) {
            // アプリ全体状態 AppState.cart を最新値（prevCart）に更新します
            AppState.cart = prevCart;
            // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
            updateCartBadge();
            // 関連処理 renderCheckoutPage() を呼び出して処理・画面を更新します
            renderCheckoutPage();
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ MySQLへのカート更新に失敗しました（サーバー接続を確認してください）');
        }
    }
}

// ==========================================================================
// 【関数】removeCartItem(index)
// 【役割】お会計画面で「削除」が押された服をカゴからスッキリ取り除く削除係
// 【具体的な処理内容】
//   ・指定された商品をカートから完全に削除し、金額を再計算してサーバーへ保存します
// ==========================================================================
async function removeCartItem(index) {
    // 条件（!AppState.cart[index]）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.cart[index]) return;
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して prevCart に保存します
    const prevCart = JSON.parse(JSON.stringify(AppState.cart || []));
    // 配列の指定位置から要素を取り除いて削除します（AppState.cart.splice(index, 1);）
    // カートの中身からindex番目を1つ削除する
    AppState.cart.splice(index, 1);
    // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
    updateCartBadge();
    // 関連処理 renderCheckoutPage() を呼び出して処理・画面を更新します
    renderCheckoutPage();

    // 条件（AppState.currentUser && isServerUserId(AppState.curr…）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser && isServerUserId(AppState.currentUser.id)) {
        // 定数 ok を宣言し、値（await syncCartToBackend()）をセットします
        const ok = await syncCartToBackend();
        // 条件（!ok）が成り立つか判定し、該当する場合の処理を実行します
        if (!ok) {
            // アプリ全体状態 AppState.cart を最新値（prevCart）に更新します
            AppState.cart = prevCart;
            // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
            updateCartBadge();
            // 関連処理 renderCheckoutPage() を呼び出して処理・画面を更新します
            renderCheckoutPage();
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ MySQLからの商品削除に失敗しました（サーバー接続を確認してください）');
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
    }
    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast('バッグから商品を削除しました');
}

// ==========================================================================


// ==========================================================================
//  第4章：お会計・注文手続き・クーポン＆ポイント計算
//  【このセクションの役割】
//  ・お会計画面の描画と、進捗ステップバー（1:注文商品 → 2:決済 → 3:完了）の制御
//  ・保有クーポンの適用・解除、ポイント利用による自動割引計算
//  ・配送料（5,000円以上無料）の計算と最終お支払い合計額の算出
// ==========================================================================
// 【関数】updateCheckoutStepper(step = 2)
// 【役割】「1 カート → 2 お届け先 → 3 完了」の進み具合バーを1歩進めるステップ案内係
// 【具体的な処理内容】
//   ・「1:注文商品 → 2:お届け先・決済 → 3:完了」の進捗に合わせて、
//     ステップバーの丸い数字を青く光らせます
// ==========================================================================
function updateCheckoutStepper(step = 2) {
    // 画面の中から進捗バー全体の親要素（.checkout-stepper）を取得して変数 stepper に格納します
    const stepper = document.querySelector('.checkout-stepper');
    // 進捗バーが画面内に見つからない場合はエラー防止のため処理をここで終了します
    if (!stepper) return;
    // 進捗バー内の丸い各ステップ番号要素（.step-item）をすべて取得します（①注文商品、②お届け先・決済、③注文確定）
    const items = stepper.querySelectorAll('.step-item');
    // ステップ同士をつなぐ進行ライン要素（.step-line）をすべて取得します
    const lines = stepper.querySelectorAll('.step-line');

    // 各ステップの丸要素を1つずつ順番に取り出して処理します（idx は 0 から始まるインデックス番号）
    items.forEach((item, idx) => {
        // 現在のステップ番号（step）より前の丸、または現在地の丸であるか判定します（例: stepが2の時は idx:0 と idx:1 が対象）
        if (idx < step) {
            // 条件を満たす丸に 'active' クラスを付与して光らせます（色をつけて達成状態にする）
            item.classList.add('active');
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // まだ到達していない先のステップの丸からは 'active' クラスを外して未達成状態（グレー）にします
            item.classList.remove('active');
        }
    });

    // ステップ間をつなぐ各進行ラインを1本ずつ順番に取り出して処理します
    lines.forEach((line, idx) => {
        // 現在地の手前にあるラインであるか判定します（線は丸の数より1本少ないため idx < step - 1 で判定）
        if (idx < step - 1) {
            // 到達済みのラインに 'active' クラスを付与して色づけます（実線でつなぐ）
            line.classList.add('active');
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // まだ到達していない先のラインからは 'active' クラスを外して未到達状態にします
            line.classList.remove('active');
        }
    });
}

// ==========================================================================
// 【関数】renderCheckoutPage()
// 【役割】お会計画面（#checkout）にカゴの中身・お届け先入力欄・合計金額を描画するレジ係
// 【具体的な処理内容】
//   ・カート内の商品一覧、お届け先住所フォーム、使えるクーポン一覧、
//     ポイント入力欄、お支払い金額の計算表を画面に表示します
// ==========================================================================
function renderCheckoutPage() {
    // ステップバーをお届け先・決済入力中（ステップ2）に設定します
    updateCheckoutStepper(2);

    // HTML 要素 #checkout-cart-list を取得して変数 cartListEl に格納します
    // 注文商品一覧
    const cartListEl = document.getElementById('checkout-cart-list');
    // HTML 要素 #checkout-subtotal を取得して変数 subtotalEl に格納します
    // 商品合計
    const subtotalEl = document.getElementById('checkout-subtotal');
    // HTML 要素 #checkout-shipping を取得して変数 shippingEl に格納します
    // 配送料
    const shippingEl = document.getElementById('checkout-shipping');
    // HTML 要素 #checkout-tax を取得して変数 taxEl に格納します
    // 消費税
    const taxEl = document.getElementById('checkout-tax');
    // HTML 要素 #checkout-total を取得して変数 totalEl に格納します
    // お支払合計(税込み)
    const totalEl = document.getElementById('checkout-total');
    // HTML 要素 #checkout-layout-main を取得して変数 mainLayout に格納します
    // お届け先情報
    const mainLayout = document.getElementById('checkout-layout-main');
    // HTML 要素 #order-completed-view を取得して変数 completedView に格納します
    // 注文確定画面
    const completedView = document.getElementById('order-completed-view');

    // 条件（completedView）が成り立つか判定し、該当する場合の処理を実行します
    // 注文確定画面を隠して、
    if (completedView) completedView.style.display = 'none';
    // 条件（mainLayout）が成り立つか判定し、該当する場合の処理を実行します
    // 購入手続き画面を表示する
    if (mainLayout) mainLayout.style.display = 'grid';

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    // 注文商品一覧にカートの中身が無くて何も表示する商品が無いとき
    if (AppState.cart.length === 0) {
        // 条件（cartListEl）が成り立つか判定し、該当する場合の処理を実行します
        if (cartListEl) {
            // テンプレートリテラルで組み立てた HTML を要素 cartListEl 内に書き込んで画面を更新します
            cartListEl.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <p style="margin-bottom: 16px; font-weight: 600;">ショッピングバッグに商品が入っていません。</p>
                    <a href="#items" class="btn btn-primary">商品を探す</a>
                </div>
            `;
        }
        // 条件（subtotalEl）が成り立つか判定し、該当する場合の処理を実行します
        // 商品合計
        if (subtotalEl) subtotalEl.textContent = "¥0";
        // 条件（shippingEl）が成り立つか判定し、該当する場合の処理を実行します
        // 配送料
        if (shippingEl) shippingEl.textContent = "¥0";
        // 条件（taxEl）が成り立つか判定し、該当する場合の処理を実行します
        // 消費税
        if (taxEl) taxEl.textContent = "¥0";
        // 条件（totalEl）が成り立つか判定し、該当する場合の処理を実行します
        // お支払合計(税込み)
        if (totalEl) totalEl.textContent = "¥0";
        // 獲得予定ポイント表示をデフォルトの 0 pt に更新します
        // 今回獲得予定のポイント
        const earnedPointsEl = document.getElementById('checkout-earned-points');
        if (earnedPointsEl) earnedPointsEl.textContent = "0 pt";
        // HTML 要素 #btn-place-order を取得して変数 placeBtn に格納します
        // 注文確定ボタン
        const placeBtn = document.getElementById('btn-place-order');
        // 条件（placeBtn）が成り立つか判定し、該当する場合の処理を実行します
        // disabled = true だったら無効化にする
        // このif文はそもそも商品が一つもないときだから押せないようにしているよ
        if (placeBtn) placeBtn.disabled = true;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // HTML 要素 #btn-place-order を取得して変数 placeBtn に格納します
    const placeBtn = document.getElementById('btn-place-order');
    // 条件（placeBtn）が成り立つか判定し、該当する場合の処理を実行します
    // 注文確定ボタンを押せるようにする
    if (placeBtn) placeBtn.disabled = false;

    // 条件（cartListEl）が成り立つか判定し、該当する場合の処理を実行します
    // placeBtnが押せるようになっている = 注文商品一覧が存在してる(カートの中身がある時だから)
    if (cartListEl) {
        // 生成・変換した HTML 文字列を要素 cartListEl の中身として描画します
        cartListEl.innerHTML = AppState.cart.map((item, idx) => `
            <div class="cart-item-row">
                <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22800%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20800%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22600%22%20height%3D%22800%22%2F%3E%3Cpath%20d%3D%22M250%20320%20L350%20320%20L370%20420%20L230%20420%20Z%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%223%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22480%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20letter-spacing%3D%222%22%3EMANEKIN%20COLLECTION%3C%2Ftext%3E%3C%2Fsvg%3E'">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">¥${item.price.toLocaleString()} (税込)</p>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
                    <span class="cart-qty-text">${item.quantity}</span>
                    <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
                    <button type="button" class="cart-remove-btn" onclick="removeCartItem(${idx})">削除</button>
                </div>
            </div>
        `).join('');
    }

    // 条件（AppState.currentUser）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser) {
        // HTML 要素 #order-name を取得して変数 orderName に格納します
        // お届け先情報に入した名前と
        const orderName = document.getElementById('order-name');
        // HTML 要素 #order-email を取得して変数 orderEmail に格納します
        // お届け先情報に入力したメールアドレス
        const orderEmail = document.getElementById('order-email');
        // 条件（orderName && !orderName.value.trim() && AppState.cur…）が成り立つか判定し、該当する場合の処理を実行します
        // 名前欄の自動入力が行われている　
        // オーダーネームが存在するかつオーダーネームの中身が空っぽかつ現在ログイン中の人の名前だったら
        if (orderName && !orderName.value.trim() && AppState.currentUser.name) {
            // 入力フォーム部品 orderName の現在の入力値を更新・リセットします
            orderName.value = AppState.currentUser.name;
        }
        // 条件（orderEmail && !orderEmail.value.trim() && AppState.c…）が成り立つか判定し、該当する場合の処理を実行します
        if (orderEmail && !orderEmail.value.trim() && AppState.currentUser.email) {
            // 入力フォーム部品 orderEmail の現在の入力値を更新・リセットします
            orderEmail.value = AppState.currentUser.email;
        }
    }
    // ユーザー所持クーポン一覧の取得と再描画（初期配布クーポンなど）
    if (typeof fetchUserCoupons === 'function') {
        fetchUserCoupons();
    }
    // 関連処理 updateCheckoutCalculations() を呼び出して処理・画面を更新します
    // ご請求内容(商品合計、配送料、消費税、お支払合計、獲得予定ポイントなどを計算して更新する)
    updateCheckoutCalculations();
}

// ==========================================================================
// 【関数】calculateNetPointsFromOrders(ordersList)
// 【役割】これまでの注文履歴から「今本当に使える保有ポイント」を正確に計算するポイント計算係
// 【具体的な処理内容】
//   ・注文で獲得したポイントを足し、利用したポイントを引いて、
//     現在の正しいポイント残高を算出します
// ==========================================================================
// 注文履歴から獲得ポイントの合計 ー 使ったポイントの合計を計算し、マイナスにならないように現在残っているポイントを返す関数です
function calculateNetPointsFromOrders(ordersList) {
    // 渡されたオーダーリストが配列ならそれを使いそうでなければ、アプリ全体の注文履歴(AppState.orderHistory)を使用する
    const list = Array.isArray(ordersList) ? ordersList : (AppState.orderHistory || []);
    // 注文履歴が0件ならポイントは0なのでリターンも0で終了
    if (!list || list.length === 0) return 0;
    // これまで獲得した合計ポイントを入れる箱
    let totalEarned = 0;
    // これまで使用した合計ポイントを入れる箱
    let totalUsed = 0;
    // 注文履歴を一件ずつ(oとして)順番に取り出してチェックします
    list.forEach(o => {
        // もしその注文データが空ならスキップして次の朱蒙データに飛ぶよ
        if (!o) return;
        // その注文の合計金額{(total_amount)、なければsubtotal(商品合計) それもなければ0(終了)}を数字として取り出します
        const totalAmt = Number(o.total_amount || o.subtotal || 0);
        // その注文でもらった獲得ポイント(earned_points、なければ0)を数字として取り出す
        let earned = Number(o.earned_points || 0);
        // もし獲得ポイントが記録されておらず、0以下かつ注文金額が0円より大きければif文はいる
        if (earned <= 0 && totalAmt > 0) {
            // 注文金額の1％を計算し、最低でも1ポイントになるように獲得ポイントを保管する
            earned = Math.max(1, Math.floor(totalAmt * 0.01));
            // 今計算した獲得ポイントをその注文データ自身にも書き込んで保存する
            o.earned_points = earned;
        }
        // その注文で使ったポイント(used_points)をマイナスにならないように0以上の数字として取り出します
        const used = Math.max(0, Number(o.used_points || 0));
        // この注文での獲得ポイント(earned)をtotalEarned(獲得合計)に足します
        totalEarned += earned;
        // この注文で使ったポイント(used)をtotalUsed(利用合計)に足します
        totalUsed += used;
    });
    // 獲得合計 ー 利用合計を計算しマイナスにならないように0以上の値にして結果を返します
    return Math.max(0, totalEarned - totalUsed);
}

// ==========================================================================
// 【関数】getUserPoints()
// 【役割】今ログインしている会員がポイントを何ポイント持っているかを教えてくれるポイント確認係
// 【具体的な処理内容】
//   ・会員データや注文履歴から現在のポイントを調べて返します
// ==========================================================================
function getUserPoints() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser) return 0;
    // 条件（AppState.currentUser.points === undefined || AppState.currentUser.points === null）
    if (AppState.currentUser.points === undefined || AppState.currentUser.points === null) {
        // 初期配布はクーポンに変更されたため、ポイントは 0 からスタートします
        AppState.currentUser.points = 0;
    }
    // 注文履歴がある場合は、購入で加算されたポイント合計（−利用分）を確実に反映します
    if (Array.isArray(AppState.orderHistory) && AppState.orderHistory.length > 0) {
        // 獲得ポイント合計と使用ポイント合計の差を注文履歴(Appstate.orderHistory)から計算して出して、netFromOrdersに入れる
        // 現在使用することができる残りのポイント
        const netFromOrders = calculateNetPointsFromOrders(AppState.orderHistory);
        // 現在使用可な残りのポイントが0より大きいかつログインユーザーのポイントが数値で扱われていてその数値が現在使用可な残りポイントより小さいときに
        if (netFromOrders > 0 && Number(AppState.currentUser.points) < netFromOrders) {
            // 現在の保有ポイントを現在使用可の残りのポイントにする
            AppState.currentUser.points = netFromOrders;
        }
    }
    // 結果（AppState.currentUser.points）を呼び出し元へ返却します
    // 初期値の0か現在使用が可能な保有ポイントを返します。
    return Number(AppState.currentUser.points) || 0;
}

// ==========================================================================
// 【関数】setUserPoints(points, options = {})
// 【役割】会員のポイント数を新しい数字に書き換えて保存するポイント更新係
// 【具体的な処理内容】
//   ・ポイント数値をメモリや画面の表示に反映します
// ==========================================================================
function setUserPoints(points, options = {}) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser) return;
    // アプリ全体状態 AppState.currentUser.points を最新値（Math.max(0, points)）に更新します
    // ポイントを小数点切り捨てた0~の数字に計算したものをnormalizePtsに格納して、現在のユーザーのポイントを小数以下切り捨てポイントに変更
    const normalizedPts = Math.max(0, Math.floor(Number(points) || 0));
    AppState.currentUser.points = normalizedPts;

    // スマホ版の場合は localStorage のユーザー情報にもポイント残高を反映します
    if (isMobileLocalStorageMode()) {
        // isSetJsonで現在のログインユーザーを画面に表示
        lsSetJson('manekin_ls_current_user', AppState.currentUser);
        // usersにログインユーザーか未ログイン(ゲスト)の情報を入れる
        const users = lsGetJson('manekin_ls_users', []);
        // uIdxにlocalStorageに保存されているユーザーのIDと現在のログイン(未ログイン)ユーザーのIDが一致するものを格納
        const uIdx = users.findIndex(u => String(u.id) === String(AppState.currentUser.id));
        // 未ログイン時も含むログインユーザーがいるなら
        if (uIdx > -1) {
            // その人のポイントを小数点を切り捨てしたポイントに更新する
            users[uIdx].points = normalizedPts;
            // ポイントが更新されたユーザーを画面表示
            lsSetJson('manekin_ls_users', users);
        }
        // MySQLとPythonサーバーが接続されているかつデータベースに現在のログインユーザーのIDが保存されていれば、
    } else if (options.syncToBackend && isServerUserId(AppState.currentUser.id)) {
        // デスクトップ版では MySQL の users.points にも最新残高を同期保存します
        // APIサーバーのベースURLを取得し、対象のユーザーのURLを作っています。
        // `{getApiBaseUrl()}/api/users/${AppState.currentUser.id}`
        // で、MySQLのリンクを取得(fetch)してその中のusersテーブルから現在のユーザーを取得(fetch)
        fetch(`${getApiBaseUrl()}/api/users/${AppState.currentUser.id}`, {
            // POST送信
            method: 'POST',
            // これから送るものの形式を決める、今回は(json)
            headers: { 'Content-Type': 'application/json' },
            // ブラウザからリクエストするときにクッキーも送信する(ログインセッションなどを一緒に)
            credentials: 'include',
            // 送信するデータをpoints：数値というオブジェクトにし、Json,stringifyで文字列に変換している
            body: JSON.stringify({ points: normalizedPts })
            // 通信が失敗したら画面処理を止めないようにするための記述
        }).catch(() => { });
    }

    // チェックアウト画面の「保有ポイント: XX pt」表示を即時更新します
    // 購入手続きのポイントの更新
    const checkoutUserPoints = document.getElementById('checkout-user-points');
    if (checkoutUserPoints) {
        // toLocalStringは3桁ごとに、が入る
        checkoutUserPoints.textContent = normalizedPts.toLocaleString();
    }

    // 注文完了画面の「現在の保有ポイント」表示も即時更新します
    // 注文確定時に表示される現在の保有ポイント(購入確定時にリアルタイム更新)
    const compBalancePoints = document.getElementById('comp-balance-points');
    if (compBalancePoints) {
        compBalancePoints.textContent = `${normalizedPts.toLocaleString()} pt`;
    }

    // HTML 要素 #mypage-points を取得して変数 mypagePoints に格納します
    // マイページで確認できる保有ポイントの更新
    const mypagePoints = document.getElementById('mypage-points');
    // 条件（mypagePoints）が成り立つか判定し、該当する場合の処理を実行します
    if (mypagePoints) {
        // テンプレートリテラルで組み立てた HTML を要素 mypagePoints 内に書き込んで画面を更新します
        mypagePoints.innerHTML = `${normalizedPts.toLocaleString()} <span class="stat-unit">pt</span>`;
    }
}


// 購入手続きの時に、使用するポイントは初期値が０、クーポンの利用は初期値が使用しない
// 再代入可能な変数 checkoutUsedPoints を宣言し、値（0）をセットします
let checkoutUsedPoints = 0;
// 現在チェックアウトで適用されているクーポンオブジェクト（未適用時は null）
let currentAppliedCoupon = null;

// ==========================================================================
// 【関数】fetchUserCoupons()
// 【役割】ログインしている会員が持っているお得なクーポン一覧をサーバーから集めてくるクーポン集め係
// 【具体的な処理内容】
//   ・利用可能な割引クーポン（新規登録時の初回10%OFFなど）のデータをサーバーから読み込みます
//   ※ クーポンは新規会員登録したユーザーにのみ付与され、未ログイン時には配布・表示されません
// ==========================================================================
async function fetchUserCoupons() {
    // ログイン中のユーザー(AppState.currentUser)が存在しない、または会員IDがサーバーの正規IDでない場合
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // ユーザーが持っているクーポン配列(AppState.userCoupons)を空の配列[]にして所持ゼロにする
        AppState.userCoupons = [];
        // 今レジ・注文画面で選択されているクーポン(currentAppliedCoupon)を解除してnull(未選択)にする
        currentAppliedCoupon = null;
        // renderCheckoutCoupons関数を実行して、注文画面に「ログイン・新規登録はこちら」の案内メッセージを表示する
        renderCheckoutCoupons();
        // HTMLの中からマイページのクーポン枚数を表示する要素（id="mypage-coupon-count"）を探して取得する
        const mypageCouponCount = document.getElementById('mypage-coupon-count');
        // そのHTML要素が画面に存在している場合
        if (mypageCouponCount) {
            // 未ログインなのでマイページの枚数表示のHTMLを「0 枚」に書き換える
            mypageCouponCount.innerHTML = `0 <span class="stat-unit">枚</span>`;
        }
        // 空のクーポン配列[]を関数の結果として返却して、ここで処理を終了する
        return AppState.userCoupons;
    }
    // ログインしているユーザーのID（例: 1）を取り出して変数 uid に入れる
    const uid = AppState.currentUser.id;

    // スマホ表示モード（画面幅が狭くlocalStorageで動いている状態）かどうかを判定する
    if (isMobileLocalStorageMode()) {
        // ブラウザのlocalStorageから「manekin_ls_coupons_ユーザーID」というキーで保存されたクーポン配列を取り出す（保存されていなければ空配列[]）
        const savedCoupons = lsGetJson(`manekin_ls_coupons_${uid}`, []);
        // 取り出したデータが配列であればそのまま、配列でなければ安全のために空配列[]をAppState.userCouponsに代入する
        AppState.userCoupons = Array.isArray(savedCoupons) ? savedCoupons : [];
        // 注文画面のクーポン一覧表示(renderCheckoutCoupons)を呼び出して、取り出したクーポンを画面に並べる
        renderCheckoutCoupons();
        // マイページのクーポン枚数表示要素（id="mypage-coupon-count"）を取得する
        const mypageCouponCount = document.getElementById('mypage-coupon-count');
        // マイページの枚数表示要素が存在する場合
        if (mypageCouponCount) {
            // クーポン配列の中から filter を使い、is_usedが0（まだ使われていない未使用）のクーポンだけを抽出する
            const activeCoupons = (AppState.userCoupons || []).filter(c => !c.is_used);
            // まだ使えるクーポンの件数(activeCoupons.length)をマイページのHTMLに「○ 枚」として表示する
            mypageCouponCount.innerHTML = `${activeCoupons.length} <span class="stat-unit">枚</span>`;
        }
        // スマホ版のクーポン配列を返却してここで処理を終了する
        return AppState.userCoupons;
    }

    // PC・MySQL版：Python(Flask)サーバーのURL（例: http://127.0.0.1:8080）を取得して変数 apiBase に入れる
    const apiBase = getApiBaseUrl();
    // サーバーとの通信が失敗したりネットが切れたりしても画面が止まらないよう、try〜catchで通信エラーをキャッチする
    try {
        // サーバーへ「ログイン中の自分(user_id)が持っているクーポンをください」とリクエストを送信する
        // （※全ユーザーの一覧ではなく、MySQLから『自分のクーポンデータ（割引内容など）』だけを検索して返してもらいます）
        const resp = await fetch(`${apiBase}/api/coupons?user_id=${AppState.currentUser.id}`, {
            // ログイン認証用のCookie（セッション情報 manekin_session）をリクエストに一緒に含めて送信する
            credentials: 'include'
        });
        // サーバーから届いた自分専用のクーポンデータ（JSON）をJavaScriptのオブジェクトに変換(翻訳)して data に入れる
        // （dataの中身の例: { coupons: [ { name: "【初回限定】1割引クーポン", discount_rate: 0.10 } ] }）
        const data = await resp.json().catch(() => ({}));
        // サーバー通信が成功（resp.ok）し、かつ自分のクーポン一覧（data.coupons）が配列で正しく届いたか確認する
        if (resp.ok && Array.isArray(data.coupons)) {
            // サーバーから受け取った「自分のクーポン情報」を、アプリ全体で使える変数（AppState.userCoupons）に保存する
            AppState.userCoupons = data.coupons;
            // 通信に失敗した、またはクーポンが1枚もなかった場合の処理
        } else {
            // 所持クーポンを空っぽ（[]）にする
            AppState.userCoupons = [];
        }
        // サーバーが起動していないなど通信例外(エラー)が発生した場合にこのcatchブロックが実行される
    } catch (e) {
        // ブラウザの開発者ツールのConsole（コンソール）にエラー内容を警告表示する
        console.warn('クーポン取得エラー:', e);
        // もしAppState.userCouponsが配列以外の状態（undefinedなど）になっていたら空配列[]にして画面エラーを防ぐ
        if (!Array.isArray(AppState.userCoupons)) {
            // クーポン配列を空の[]にする
            AppState.userCoupons = [];
        }
    }
    // 注文手続き画面のクーポン表示関数(renderCheckoutCoupons)を呼んで、取得した最新のクーポンを画面に再描画する
    renderCheckoutCoupons();
    // マイページのクーポン枚数を表示するHTML要素（id="mypage-coupon-count"）を取得する
    const mypageCouponCount = document.getElementById('mypage-coupon-count');
    // その要素が画面に存在する場合
    if (mypageCouponCount) {
        // クーポンの中から !c.is_used（使用済みフラグが立っていない＝まだ使える）クーポンだけを抽出する
        const activeCoupons = (AppState.userCoupons || []).filter(c => !c.is_used);
        // 使えるクーポンの枚数を計算し、マイページの要素のHTMLを「○ 枚」に書き換えて表示する
        mypageCouponCount.innerHTML = `${activeCoupons.length} <span class="stat-unit">枚</span>`;
    }
    // 最終的に取得・更新されたクーポン一覧の配列(AppState.userCoupons)を返す
    return AppState.userCoupons;
}

// ==========================================================================
// 【関数】renderCheckoutCoupons()
// 【役割】お会計画面に「今使えるクーポン」を並べてポチッと選べるようにするクーポン案内係
// 【具体的な処理内容】
//   ・持っているクーポンを並べて表示し、ワンクリックで適用できるようにします
//   ※ 未ログイン時は会員登録・ログインを案内します
// ==========================================================================
function renderCheckoutCoupons() {
    // HTMLの中からクーポン一覧を表示する枠（id="checkout-coupons-list"）を取得する
    const listEl = document.getElementById('checkout-coupons-list');
    // HTMLの中からクーポンの適用状態を表示するバッジ（id="checkout-coupon-status-badge"）を取得する
    const badgeEl = document.getElementById('checkout-coupon-status-badge');
    // クーポン表示枠が画面内に存在しない場合はエラー防止のためここで終了する
    if (!listEl) return;

    // 未ログイン時：クーポン利用にはログインが必要であることを明示し、勝手な配布・利用を防止します
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // 適用中のクーポンを解除して未選択（null）にする
        currentAppliedCoupon = null;
        // バッジ要素が存在する場合に実行する
        if (badgeEl) {
            // バッジの文字を「クーポン利用にはログインが必要です」に書き換える
            badgeEl.textContent = 'クーポン利用にはログインが必要です';
            // バッジの文字色をグレー（#6b7280）にする
            badgeEl.style.color = '#6b7280';
        }
        // クーポン表示枠に「ログイン・新規会員登録はこちら」の案内リンクを表示してここで終了する
        listEl.innerHTML = `<div style="padding: 10px 12px; background: #ffffff; border: 1px dashed #d1d5db; border-radius: 6px; font-size: 0.8rem; color: #6b7280;">クーポンは新規会員登録した会員様に配布されます。<a href="#login" style="color: #2563eb; text-decoration: underline; margin-left: 6px; font-weight: 600;">ログイン・新規会員登録はこちら</a></div>`;
        return;
    }

    // ユーザーの保有クーポン一覧が配列ならそのまま取得し、未設定なら空配列 [] にする
    const coupons = Array.isArray(AppState.userCoupons) ? AppState.userCoupons : [];
    // クーポン一覧の中から「まだ使っていない未使用（!c.is_used）」のものだけを絞り込む
    const availableCoupons = coupons.filter(c => !c.is_used);

    // もし現在選んでいるクーポンが既に使用済みになっていた場合は適用を解除する
    if (currentAppliedCoupon && !availableCoupons.some(c => c.code === currentAppliedCoupon.code)) {
        // 適用中クーポンをリセット（null）にする
        currentAppliedCoupon = null;
    }

    // 現在クーポンが適用されている（選択中）の場合
    if (currentAppliedCoupon) {
        // バッジ要素が存在する場合に実行する
        if (badgeEl) {
            // バッジに「✓ 適用中のクーポン名」を表示する
            badgeEl.textContent = `現在：✓ ${currentAppliedCoupon.name} を適用中`;
            // バッジの文字色を緑色（#059669）にして適用中を目立たせる
            badgeEl.style.color = '#059669';
        }
        // クーポンが適用されていない（未選択）の場合
    } else {
        // バッジ要素が存在する場合に実行する
        if (badgeEl) {
            // 使えるクーポンがあれば「現在：利用しない」、0枚なら「利用可能なクーポンなし」と文字を表示する
            badgeEl.textContent = availableCoupons.length > 0 ? '現在：利用しない（未適用）' : '利用可能なクーポンなし（使用済み）';
            // バッジの文字色を落ち着いたグレー（#6b7280）にする
            badgeEl.style.color = '#6b7280';
        }
    }

    // 使えるクーポンが1枚もない（0枚）の場合
    if (availableCoupons.length === 0) {
        // クーポン枠に「現在ご利用可能な未使用クーポンはありません」というメッセージを表示して終了する
        listEl.innerHTML = `<div style="padding: 10px 12px; background: #ffffff; border: 1px dashed #d1d5db; border-radius: 6px; font-size: 0.8rem; color: #6b7280;">現在ご利用可能な未使用クーポンはありません</div>`;
        return;
    }

    // 使えるクーポンを1枚ずつループ処理してHTMLカードの形に組み立てる
    listEl.innerHTML = availableCoupons.map(c => {
        // このクーポンが現在選択中のクーポンと一致しているかを判定する（一致していれば true）
        const isApplied = Boolean(currentAppliedCoupon && currentAppliedCoupon.code === c.code);
        // クーポン1枚分のHTMLカード文字列を返す（選択中ならオレンジ色の枠線と背景にする）
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 12px 14px; background: ${isApplied ? '#ffedd5' : '#ffffff'}; border: ${isApplied ? '2px solid #ea580c' : '1px solid #fed7aa'}; border-radius: 8px;">
                <div>
                    <div style="font-size: 0.9rem; font-weight: 700; color: #111827;">${c.name}</div>
                    <div style="font-size: 0.76rem; color: #c2410c; font-weight: 600;">商品代金（小計）から ${c.discount_label} 割引</div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button type="button" class="btn btn-outline-xs" onclick="handleApplyCouponCode('${c.code}')"
                        style="padding: 8px 16px; font-size: 0.82rem; font-weight: 700; border: 2px solid #ea580c; background: ${isApplied ? '#ea580c' : '#ffffff'}; color: ${isApplied ? '#ffffff' : '#ea580c'}; border-radius: 6px; cursor: pointer; white-space: nowrap;">
                        ${isApplied ? '✓ 適用する（選択中）' : '適用する'}
                    </button>
                    <button type="button" class="btn btn-outline-xs" onclick="handleCancelCoupon()"
                        style="padding: 8px 16px; font-size: 0.82rem; font-weight: 700; border: 2px solid #374151; background: ${!isApplied ? '#374151' : '#ffffff'}; color: ${!isApplied ? '#ffffff' : '#374151'}; border-radius: 6px; cursor: pointer; white-space: nowrap;">
                        ${!isApplied ? '✓ 利用しない（選択中）' : '利用しない'}
                    </button>
                </div>
            </div>
        `;
        // 配列のHTML文字列をすべて結合して1つのHTMLにする
    }).join('');
}

// ==========================================================================
// 【関数】handleApplyCouponCode(code)
// 【役割】お客さんがクーポンを選んだ瞬間に、お会計からパッと値引きしてあげるクーポン値引き係
// 【具体的な処理内容】
//   ・選ばれたクーポンが有効かチェックし、合計金額から値引き（10%OFFや500円引きなど）を
//     計算して画面に反映します
// ==========================================================================
function handleApplyCouponCode(code) {
    // ログインしていない場合はクーポンを使えないようにチェックする
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // トースト通知で「ログインしてください」と画面にメッセージを出す
        showToast('⚠️ クーポンのご利用には新規会員登録またはログインが必要です');
        // 処理をここで中断して終了する
        return;
    }
    // 選択されたクーポンコード（例: 'WELCOME10'）の空白を除去して大文字に揃える
    const targetCode = String(code || '').trim().toUpperCase();
    // 自分の所持クーポンの中から、コードが一致してかつ未使用のクーポンを探す
    let coupon = (AppState.userCoupons || []).find(c => c.code === targetCode && !c.is_used);
    // コードが一致するものが見つからなければ、未使用のクーポンを1つ探す
    if (!coupon) {
        coupon = (AppState.userCoupons || []).find(c => !c.is_used) || null;
    }

    // 使えるクーポンが見つからなかった場合
    if (!coupon) {
        // トースト通知で「利用可能なクーポンがありません」と知らせる
        showToast('⚠️ ご利用可能なクーポンがありません（使用済み）');
        // 処理をここで中断して終了する
        return;
    }

    // 見つかったクーポンを現在適用中のクーポン変数（currentAppliedCoupon）に代入する
    currentAppliedCoupon = coupon;
    // お会計画面のクーポン選択ボタンの見た目を「選択中」に更新する
    renderCheckoutCoupons();
    // 割引額（10%OFFなど）やお支払い合計金額を自動再計算して画面を更新する
    updateCheckoutCalculations();
    // 画面に「クーポンを適用しました」と割引内容をトースト通知でお知らせする
    showToast(`🎉 クーポン「${coupon.name}」を適用しました！（商品代金から ${coupon.discount_label} 引き）`);
}

// ==========================================================================
// 【関数】handleCancelCoupon()
// 【役割】使っていたクーポンを取り消して元の普通のお値段に戻すクーポン取り消し係
// 【具体的な処理内容】
//   ・クーポンの利用を取り消し、通常のお支払い金額に戻します
// ==========================================================================
function handleCancelCoupon() {
    // 今クーポンが適用されていたかどうかを true / false で記録しておく
    const hadCoupon = Boolean(currentAppliedCoupon);
    // 適用中のクーポンを未選択（null）にリセットして解除する
    currentAppliedCoupon = null;
    // お会計画面のクーポン選択ボタンの見た目を「利用しない」選択中に描き直す
    renderCheckoutCoupons();
    // クーポン割引を0円に戻してお支払い合計金額を再計算する
    updateCheckoutCalculations();
    // もともとクーポンを使っていた場合のみ通知を出す
    if (hadCoupon) {
        // 画面に「利用しないに変更しました」とトースト通知を表示する
        showToast('クーポンを「利用しない」に変更しました');
    }
}

// ==========================================================================
// 【関数】updateCheckoutCalculations()
// 【役割】お会計画面の「商品の合計・クーポン値引き・ポイント利用・送料・最終支払い額」を一瞬で再計算する自動計算係
// 【具体的な処理内容】
//   ・商品代金からクーポン値引きとポイント利用を引き、
//     送料（税込5,000円以上で無料、未満は550円）を足して、最終的な支払合計を計算します
// ==========================================================================
function updateCheckoutCalculations() {
    // 画面の「商品合計」を表示するHTML要素を取得する
    const subtotalEl = document.getElementById('checkout-subtotal');
    // 画面の「配送料」を表示するHTML要素を取得する
    const shippingEl = document.getElementById('checkout-shipping');
    // 画面の「消費税」を表示するHTML要素を取得する
    const taxEl = document.getElementById('checkout-tax');
    // 画面の「お支払い合計金額」を表示するHTML要素を取得する
    const totalEl = document.getElementById('checkout-total');
    // 画面の「ポイント割引の行全体」を表示・非表示切り替えするためのHTML要素を取得する
    const pointDiscountRow = document.getElementById('checkout-point-discount-row');
    // 画面の「ポイント割引額（-¥XX）」を表示するHTML要素を取得する
    const pointDiscountEl = document.getElementById('checkout-point-discount');
    // 画面の「クーポン割引の行全体」を表示・非表示切り替えするためのHTML要素を取得する
    const couponDiscountRow = document.getElementById('checkout-coupon-discount-row');
    // 画面の「クーポン割引のラベル（例: クーポン割引 (10% OFF)）」を表示するHTML要素を取得する
    const couponDiscountLabel = document.getElementById('checkout-coupon-discount-label');
    // 画面の「クーポン割引額（-¥XX）」を表示するHTML要素を取得する
    const couponDiscountEl = document.getElementById('checkout-coupon-discount');
    // 画面の「今回獲得予定ポイント（+XX pt）」を表示するHTML要素を取得する
    const earnedPointsEl = document.getElementById('checkout-earned-points');
    // 画面の「保有ポイント（現在使えるポイント残高）」を表示するHTML要素を取得する
    const userPointsEl = document.getElementById('checkout-user-points');
    // お客さんが使いたいポイント数を入力するテキストボックス（input）を取得する
    const pointInput = document.getElementById('checkout-use-points');
    // ポイント利用に関する案内メッセージを表示する枠を取得する
    const pointMessage = document.getElementById('checkout-point-message');

    // カートに入っている各商品の「価格 × 数量」を足し算して商品合計（小計）を計算する
    // reduce... ひとまとめにする
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // 商品合計が5,000円以上のときは送料無料（0円）、5,000円未満のときは送料550円にする
    const shipping = subtotal >= 5000 ? 0 : 550;

    // クーポン割引額を入れる変数を0円で初期化する
    let couponDiscount = 0;
    // クーポンが選択されており、かつ商品合計が0円より大きい場合に割引額を計算する
    if (currentAppliedCoupon && subtotal > 0) {
        // クーポンの割引率（例: 0.10＝10%OFF）を取得する（未設定なら0.10）
        const rate = currentAppliedCoupon.discount_rate || 0.10;
        // 「商品合計 × 割引率」を計算し、四捨五入して値引き額を算出する
        couponDiscount = Math.round(subtotal * rate);
    }
    // 商品合計からクーポン割引を引いた「割引後小計」を計算する（マイナスにならないよう max(0, ...) にする）
    // クーポン適用後のお支払合計を計算している
    // 商品合計からクーポン割引額を引いた　割引後の合計金額がこれ
    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

    // ログイン中の会員が持っている利用可能ポイント残高を取得する
    const availablePoints = getUserPoints();
    // 画面の保有ポイント表示要素(HTMLの骨組み)があれば、3桁区切りの数字（例: 1,000）で表示を更新する
    if (userPointsEl) userPointsEl.textContent = availablePoints.toLocaleString();

    // 【仕様】ポイントは商品代金（割引後小計）にのみ使え、配送料には使えないため上限を計算する
    // 使用できるポイントの上限を保有ポイントから割引後小計額(割引されてない小計額)まで使用可能と範囲を決める
    // 割引き後小計額までポイントが使えるよ
    const maxUsablePoints = Math.min(availablePoints, discountedSubtotal);

    // お客さんが入力した利用ポイントが上限を超えていたら、上限値（maxUsablePoints）に制限する
    // 使用するポイントが割引後小計金額より大きかったら
    if (checkoutUsedPoints > maxUsablePoints) {
        // 使用するポイントは割引後小計金額と同じ数しか使えない
        checkoutUsedPoints = maxUsablePoints;
    }
    // 利用ポイントがマイナス値になっていたら0に戻す
    if (checkoutUsedPoints < 0) {
        checkoutUsedPoints = 0;
    }

    // ポイント入力枠があり、かつ現在入力中（フォーカス中）でなければ枠内の数値を最新値に更新する
    // 今カーソルが当たっていて操作中になっている(入力中)かどうかチェック(document.activeElement != pointInput)
    if (pointInput && document.activeElement !== pointInput) {
        pointInput.value = checkoutUsedPoints > 0 ? checkoutUsedPoints : '';
    }

    // 最終お支払い金額を計算する: (割引後小計 - 利用ポイント) + 配送料
    const netTotal = (discountedSubtotal - checkoutUsedPoints) + shipping;
    // 内税（消費税10%分）を計算する
    const tax = Math.round(netTotal * 10 / 110);
    // お支払い金額の1%を獲得ポイントとして計算する（合計が0円なら0pt）
    // 0円より大きければお支払合計の1%を獲得できるが1ポイントは確定で獲得できる
    const earnedPoints = netTotal > 0 ? Math.max(1, Math.floor(netTotal * 0.01)) : 0;

    // 画面の商品小計を「¥XX」形式で更新する
    if (subtotalEl) subtotalEl.textContent = `¥${subtotal.toLocaleString()}`;
    // 画面の配送料を「無料」または「¥550」で更新する
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "無料 (5,000円以上)" : `¥${shipping.toLocaleString()}`;
    // 画面の消費税を「¥XX」形式で更新する
    if (taxEl) taxEl.textContent = `¥${tax.toLocaleString()}`;
    // 画面の最終お支払い合計金額を「¥XX」形式で更新する
    if (totalEl) totalEl.textContent = `¥${netTotal.toLocaleString()}`;

    // クーポン割引行の表示・非表示と割引額の更新処理
    if (couponDiscountRow && couponDiscountEl) {
        // クーポン値引きがあり、かつクーポンが選択されている場合
        if (couponDiscount > 0 && currentAppliedCoupon) {
            // クーポン割引行を画面に表示する（display: flex）
            couponDiscountRow.style.display = 'flex';
            // クーポン名と割引率のラベル（例: クーポン割引 (10% OFF)）を表示する
            if (couponDiscountLabel) couponDiscountLabel.textContent = `クーポン割引 (${currentAppliedCoupon.discount_label || '10% OFF'})`;
            // 値引き額をマイナス表示（例: -¥300）にする
            couponDiscountEl.textContent = `-¥${couponDiscount.toLocaleString()}`;
            // クーポンを使っていない場合
        } else {
            // クーポン割引行を画面から隠す（非表示）
            couponDiscountRow.style.display = 'none';
        }
    }

    // ポイント利用割引行の表示・非表示と割引額の更新処理
    if (pointDiscountRow && pointDiscountEl) {
        // ポイントを使っている場合
        if (checkoutUsedPoints > 0) {
            // ポイント割引行を画面に表示する
            pointDiscountRow.style.display = 'flex';
            // 割引額をマイナス表示（例: -¥500）にする
            pointDiscountEl.textContent = `-¥${checkoutUsedPoints.toLocaleString()}`;
            // ポイントを使っていない場合
        } else {
            // ポイント割引行を画面から隠す
            pointDiscountRow.style.display = 'none';
        }
    }

    if (earnedPointsEl) {
        // お支払い合計が 0 円の時または獲得ポイントが 0 の時はデフォルトで「0 pt」を表示します
        earnedPointsEl.textContent = (netTotal <= 0 || earnedPoints <= 0) ? "0 pt" : `+${earnedPoints.toLocaleString()} pt`;
    }

    if (pointMessage) {
        if (checkoutUsedPoints > 0) {
            pointMessage.innerHTML = `<span style="color: #059669; font-weight: 700;">✓ ${checkoutUsedPoints.toLocaleString()} pt（${checkoutUsedPoints.toLocaleString()}円引き）を商品代金に適用中</span>（残り: ${(availablePoints - checkoutUsedPoints).toLocaleString()} pt）<br><small style="color: #666;">※配送料（${shipping === 0 ? '無料' : `¥${shipping.toLocaleString()}`}）はポイント適用外のため確実に発生します</small>`;
        } else {
            pointMessage.innerHTML = '1ポイント＝1円として、商品代金（割引後小計）にのみご利用いただけます。<strong>※配送料には影響せず、確実に配送料は別途発生します。</strong>';
        }
    }

    return {
        subtotal,
        shipping,
        grossTotal: subtotal + shipping,
        couponDiscount,
        discountedSubtotal,
        usedPoints: checkoutUsedPoints,
        netTotal,
        earnedPoints
    };
}

// ==========================================================================
// 【関数】handlePointsInputChange()
// 【役割】お会計画面で「何ポイント使うか」を入力されたときに使える範囲かチェックするポイント受付係
// 【具体的な処理内容】
//   ・持っているポイント数や商品代金を超えないよう安全にチェックして、支払額を再計算します
// ==========================================================================
function handlePointsInputChange() {
    // HTML 要素 #checkout-use-points を取得して変数 pointInput に格納します
    const pointInput = document.getElementById('checkout-use-points');
    // 定数 val を宣言し、値（parseInt(pointInput ? pointInput.value…）をセットします
    // parseIntで文字列を整数(少数の無い数値)に変換する
    // parseIntの中で入力されたポイントを十進数に変換するか、初期値の0を十進数に変換している
    // または　初期値の0 
    const val = parseInt(pointInput ? pointInput.value : 0, 10) || 0;
    // 変数・配列項目 checkoutUsedPoints の値を更新・計算します
    // 使用できるポイントは0から入力されたポイント数まで使用可能
    checkoutUsedPoints = Math.max(0, val);
    // 関連処理 updateCheckoutCalculations() を呼び出して処理・画面を更新します
    updateCheckoutCalculations();
}

// ==========================================================================
// 【関数】handleUseAllPoints()
// 【役割】「全ポイントを使う」ボタンが押されたときに、持っているポイントを全額パッと入力するまとめ使い係
// 【具体的な処理内容】
//   ・持っているポイントを上限いっぱいまで自動入力して、最大割引を適用します
// ==========================================================================
function handleUseAllPoints() {
    // 商品単価×商品の個数(既存商品)の値段をひとまとめにして、商品合計を出す
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // クーポンの割引額を初期値０にする
    let couponDiscount = 0;
    // 現在クーポンの利用が適用されている　かつ　商品合計が0より大きいとき
    if (currentAppliedCoupon && subtotal > 0) {
        // クーポンの割引額を　商品合計×(適用したクーポンの割り引く割合または初期値0.10)
        couponDiscount = Math.round(subtotal * (currentAppliedCoupon.discount_rate || 0.10));
    }
    // 割引後の商品合計金額は　0から商品合計－クーポンの割引額
    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
    // 現在使用できる保有ポイントを持ってくる
    const available = getUserPoints();
    // 保有できるポイントが0以下だったら
    if (available <= 0) {
        showToast('現在ご利用可能な保有ポイントはありません（保有ポイント: 0 pt）');
        return;
    }

    // 配送料にはポイントを使えないため、割引後小計を上限とする 
    // 使用できるポイントの上限は、保有ポイント数の内からクーポン割引後の商品合計金額まで
    checkoutUsedPoints = Math.min(available, discountedSubtotal);
    // HTMLの使用ポイント入力欄の骨組みを持ってきて
    const pointInput = document.getElementById('checkout-use-points');
    // HTMLの入力欄の骨組みが存在するなら　入力される値をポイントの上限までなら何でもInputできます。
    if (pointInput) pointInput.value = checkoutUsedPoints;
    // 使用したらポイント減るし、クーポン使えなくなるからそういった画面の更新
    updateCheckoutCalculations();
    showToast(`✨ 保有ポイントから ${checkoutUsedPoints.toLocaleString()} pt（${checkoutUsedPoints.toLocaleString()}円分）を商品代金に適用しました（※配送料はポイント対象外です）`);
}

// ==========================================================================
// 【関数】handleResetPoints()
// 【役割】ポイントの「解除」ボタンが押されたときに、ポイント利用をゼロに戻すポイントリセット係
// 【具体的な処理内容】
//   ・利用ポイントを0に戻して、通常のお支払い金額に再計算します
// ==========================================================================
function handleResetPoints() {
    // 変数・配列項目 checkoutUsedPoints の値を更新・計算します
    checkoutUsedPoints = 0;
    // HTML 要素 #checkout-use-points を取得して変数 pointInput に格納します
    const pointInput = document.getElementById('checkout-use-points');
    // 条件（pointInput）が成り立つか判定し、該当する場合の処理を実行します
    if (pointInput) pointInput.value = '';
    // 関連処理 updateCheckoutCalculations() を呼び出して処理・画面を更新します
    updateCheckoutCalculations();
    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast('ポイント利用を取り消しました');
}

// ==========================================================================


// ==========================================================================
//  第5章：注文確定・購入履歴・マイクローゼット取り込み
//  【このセクションの役割】
//  ・お届け先入力チェックと、サーバーへの注文確定データ送信（MySQL保存）
//  ・過去の購入履歴の取得・表示・リセット
//  ・購入した服をワンクリックで試着室（マイクローゼット）へ追加する機能
// ==========================================================================
// 【関数】importOrderToCloset(idx)
// 【役割】買った服の一覧から、ワンクリックで自分のクローゼットへ服を取り込める購入服お持ち帰り係
// 【具体的な処理内容】
//   ・過去に注文した服を、試着マネキンで着せ替えられる手持ち服としてクローゼットに追加登録します
// ==========================================================================
// 引数のidxは購入された商品が購入履歴の配列に入る時の番地
async function importOrderToCloset(idx) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ ログインが必要です');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 order を宣言し、値（AppState.orderHistory[idx]）をセットします
    const order = AppState.orderHistory[idx];
    // 定数 itemsList を宣言し、値（(order && (order.items || order.items_…）をセットします
    const itemsList = (order && (order.items || order.items_detail)) ? (order.items || order.items_detail) : [];
    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (!order || itemsList.length === 0) return;

    // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
    const apiBase = getApiBaseUrl();
    // 定数 userId を宣言し、値（AppState.currentUser.id）をセットします
    const userId = AppState.currentUser.id;
    // 再代入可能な変数 added を宣言し、値（0）をセットします
    let added = 0;
    // 再代入可能な変数 failed を宣言し、値（0）をセットします
    let failed = 0;
    // 条件（typeof bumpClosetMutationSeq === 'function'）が成り立つか判定し、該当する場合の処理を実行します
    // この関数は、マイクローゼットの登録・削除時に最新操作を保証する連番
    if (typeof bumpClosetMutationSeq === 'function') bumpClosetMutationSeq();

    // スマホ版の場合は localStorage のクローゼットに直接追加します
    if (isMobileLocalStorageMode()) {
        // 注文に含まれる商品を1件ずつループ処理します
        for (let i = 0; i < itemsList.length; i++) {
            // 現在の注文商品データを取り出します
            const it = itemsList[i];
            // 商品名を取得します（未設定時は'購入商品'）
            const itName = it.name || it.product_name || '購入商品';
            // 商品の色を取得します（未設定時は'BLACK'）
            const itColor = it.color || 'BLACK';
            // 商品のIDを取得します
            const itId = it.id || it.product_id || Date.now();
            // 全商品マスターから該当商品の情報を検索します
            const productMaster = (typeof SAMPLE_PRODUCTS !== 'undefined') ? SAMPLE_PRODUCTS.find(p => p.id === itId) : null;
            // 商品カテゴリ（TOPSなど）を取得します
            const itCategory = it.category || (productMaster ? productMaster.category : 'TOPS');
            // 商品の画像URLを取得します
            const itImg = it.image || it.image_url || 'assets/images/men/スカイオックスフォードシャツ.png';
            // 商品の購入単価を取得します
            const itPrice = it.price || it.unit_price || 0;

            // すでに同じ名前と色の服がクローゼットにあるか重複チェックします
            const exists = AppState.myCloset.some(c => c.name === itName && c.color === itColor);
            // まだクローゼットに存在しない服の場合のみ新しく追加します
            if (!exists) {
                // クローゼットに追加する手持ち服データを作成します
                const newItem = {
                    id: 'purchased-' + itId + '-' + (order.order_no || Date.now()) + '-' + i,
                    productId: itId,
                    name: itName,
                    category: itCategory,
                    color: itColor,
                    season: '通年',
                    image: itImg,
                    isOwned: true,
                    isPurchased: true,
                    price: itPrice,
                    purchaseDate: order.date || ''
                };
                // 作成した服をクローゼット配列の先頭に追加します
                AppState.myCloset.unshift(newItem);
                // 追加成功数を1増やします
                added++;

                // 購入商品がお気に入りに登録されていた場合、クローゼット入りに伴いお気に入りから自動解除します
                const fIdx = AppState.favorites.indexOf(Number(itId));
                // お気に入りリストに含まれていた場合
                if (fIdx > -1) {
                    // お気に入り配列から削除します
                    AppState.favorites.splice(fIdx, 1);
                    // 画面上のハートマークボタンを解除状態（OFF）に同期します
                    syncAllFavoriteButtons(itId, false);
                }
            }
        }
        // 1点以上クローゼットに追加された場合
        if (added > 0) {
            // localStorageのクローゼットデータを最新状態に保存します
            lsSetJson(`manekin_ls_closet_${userId}`, AppState.myCloset);
            // localStorageのお気に入りデータも最新状態に保存します
            lsSetJson(`manekin_ls_favorites_${userId}`, AppState.favorites);
            // ナビバーやヘッダーのお気に入りバッジ数を更新します
            updateFavoriteBadges();
            // スタジオのブランド一覧画面を再描画します
            if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
            // スタジオのアイテム一覧画面を再描画します
            if (typeof renderStudioItems === 'function') renderStudioItems();
            // スタジオのクローゼット一覧画面を再描画します
            if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
            // 右サイドパネルのクローゼットグリッドを再描画します
            if (typeof renderPaneClosetGrid === 'function') renderPaneClosetGrid();
            // 現在お気に入り画面を開いている場合はお気に入り一覧を再描画します
            if (window.location.hash === '#favorites') renderFavoriteProducts();
            // 画面に「マイクローゼットに登録しました」とトースト通知を表示します
            showToast(`👗 注文商品をマイクローゼットに登録しました（${added}点）`);
            // すべてすでにクローゼットに登録済みだった場合
        } else {
            // 画面に「すでに登録済みです」と案内トーストを表示します
            showToast('この注文の商品はすでにマイクローゼットに登録済みです');
        }
        // スマホ版の処理をここで終了します
        return;
    }

    // 配列要素やインデックスを順番に繰り返すループ処理（for (let i = 0; i < itemsList.length; i++) {）を開始します
    for (let i = 0; i < itemsList.length; i++) {
        // 定数 it を宣言し、値（itemsList[i]）をセットします
        const it = itemsList[i];
        // 定数 itName を宣言し、値（it.name || it.product_name || '購入商品'）をセットします
        const itName = it.name || it.product_name || '購入商品';
        // 定数 itColor を宣言し、値（it.color || 'BLACK'）をセットします
        const itColor = it.color || 'BLACK';
        // 定数 itId を宣言し、値（it.id || it.product_id || Date.now()）をセットします
        const itId = it.id || it.product_id || Date.now();
        // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して productMaster に入れます
        const productMaster = (typeof SAMPLE_PRODUCTS !== 'undefined') ? SAMPLE_PRODUCTS.find(p => p.id === itId) : null;
        // 定数 itCategory を宣言し、値（it.category || (productMaster ? produc…）をセットします
        const itCategory = it.category || (productMaster ? productMaster.category : 'TOPS');
        // 定数 itImg を宣言し、値（it.image || it.image_url || 'assets/im…）をセットします
        const itImg = it.image || it.image_url || 'assets/images/men/スカイオックスフォードシャツ.png';
        // 定数 itPrice を宣言し、値（it.price || it.unit_price || 0）をセットします
        const itPrice = it.price || it.unit_price || 0;

        // 定数 exists を宣言し、値（AppState.myCloset.some(c => c.name ===…）をセットします
        const exists = AppState.myCloset.some(c => c.name === itName && c.color === itColor);
        // 条件（!exists）が成り立つか判定し、該当する場合の処理を実行します
        if (!exists) {
            // 定数 newItem を宣言し、値（{）をセットします
            const newItem = {
                // レコード・商品・コーデを識別する ID プロパティをセットします
                id: 'purchased-' + itId + '-' + (order.order_no || Date.now()) + '-' + i,
                // 紐づくブランド商品の元 ID
                productId: itId,
                // 商品名またはアイテム名称
                name: itName,
                // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                category: itCategory,
                // カラー名
                color: itColor,
                // 着用シーズン
                season: '通年',
                // 画像ファイルパスまたは DataURL
                image: itImg,
                // ユーザーの手持ち私物であるかどうかのフラグ
                isOwned: true,
                // ストアで購入してクローゼット取り込みされた品かどうかのフラグ
                isPurchased: true,
                // 単価・価格（円）
                price: itPrice,
                // 購入した日付
                purchaseDate: order.date || ''
            };

            // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
            try {
                // Flask バックエンド API（/api/closet/add）へ非同期リクエストを送信し、応答を待ち受けます
                // データベースの中のclosetにadd(追加したいですよ)リクエストをPOST送信で送ります
                const res = await fetch(`${apiBase}/api/closet/add`, {
                    // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
                    method: 'POST',
                    // サーバーへ送るデータの形式が JSON であることを伝える Content-Type ヘッダです
                    headers: { 'Content-Type': 'application/json' },
                    // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
                    credentials: 'include',
                    // JavaScript オブジェクトを JSON 文字列へ変換して送信ボディに乗せます
                    body: JSON.stringify({
                        // MySQL でどの会員アカウントのデータか区別するための user_id をセットします
                        user_id: userId,
                        // レコード・商品・コーデを識別する ID プロパティをセットします
                        id: newItem.id,
                        // 紐づくブランド商品の元 ID
                        productId: newItem.productId,
                        // 商品名またはアイテム名称
                        name: newItem.name,
                        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                        category: newItem.category,
                        // カラー名
                        color: newItem.color,
                        // 着用シーズン
                        season: newItem.season,
                        // 画像ファイルパスまたは DataURL
                        image: newItem.image,
                        // ユーザーの手持ち私物であるかどうかのフラグ
                        isOwned: true,
                        // ストアで購入してクローゼット取り込みされた品かどうかのフラグ
                        isPurchased: true,
                        // 単価・価格（円）
                        price: newItem.price,
                        // 購入した日付
                        purchaseDate: newItem.purchaseDate
                    })
                });
                // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
                if (!res.ok) throw new Error('API Error');
                // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
                const data = await res.json();
                // サーバーから返ってきた JSON のステータス結果が成功かエラーかを検証します
                if (data.status === 'success') {
                    // 条件（AppState.currentUser && String(AppState.currentUser.…）が成り立つか判定し、該当する場合の処理を実行します
                    if (AppState.currentUser && String(AppState.currentUser.id) === String(userId)) {
                        // 新規追加された最新データを配列 AppState.myCloset の先頭へ挿入(unshift)して即画面反映します
                        // 新しく追加する衣服の情報が先頭に来るよ
                        AppState.myCloset.unshift(newItem);
                        // 変数・配列項目 added の値を更新・計算します
                        // 新しく追加することに成功したら成功したアイテムの数を数えるもの
                        added++;

                        // 購入商品がお気に入りに登録されていた場合、クローゼット入りに伴いお気に入りから自動解除
                        const fIdx = AppState.favorites.indexOf(Number(itId));
                        if (fIdx > -1) {
                            // 現在のお気に入り商品の一覧から指定したお気に入り番地の商品を1つ削除
                            AppState.favorites.splice(fIdx, 1);
                            // お気に入り一覧で表示する商品とデフォで表示している商品は、すべてにハートがついていて
                            // お気に入り一覧で表示するときは、赤色のハートでそろえるよ
                            // 画面上にある同じ服のハートボタンの見た目（赤色／白抜き）をぜんぶ一斉に揃えるハート合わせ係
                            // お気に入り一覧から削除したいからハートの色を白に戻すつまり(false)
                            syncAllFavoriteButtons(itId, false);
                            try {
                                // データベースのfavoritesテーブルのハートの赤白切替についてのデータをくださいよってPOST送信でリクエスト
                                fetch(`${apiBase}/api/favorites/toggle`, {
                                    method: 'POST',
                                    // JSON形式でリクエスト
                                    headers: { 'Content-Type': 'application/json' },
                                    // ひとまとめで
                                    credentials: 'include',
                                    // 持ってきたいデータの中身は、商品のIDをitIDとして使いたい　また　user_idをUserIDとして使いたい
                                    body: JSON.stringify({ product_id: itId, user_id: userId })
                                }).catch(() => { });
                            } catch (_) { }
                        }
                    }
                    // 上記の if 条件に当てはまらなかった場合の分岐処理です
                } else {
                    // 変数・配列項目 failed の値を更新・計算します
                    // 新しく商品を登録するときに、失敗した数を数えます
                    failed++;
                }
                // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
            } catch (e) {
                // 変数・配列項目 failed の値を更新・計算します
                // エラーでも失敗したときと同じく数える
                failed++;
            }
        }
    }

    // 条件（added > 0）が成り立つか判定し、該当する場合の処理を実行します
    // 追加が成功したアイテムの数が0より大きいとき
    if (added > 0) {
        // お気に入り商品のハートのバッジの数を更新します
        updateFavoriteBadges();
        // スタジオのコーデ作成の右側で確認できるお気に入り一覧に保存できるかチェック
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        // 試着スタジオの試着室やアイテム全般の更新ができるかチェック
        // 例：来ている服をステージに反映など
        if (typeof renderStudioItems === 'function') renderStudioItems();
        // お気に入り商品一覧の更新ができるかチェック　
        if (window.location.hash === '#favorites') renderFavoriteProducts();
        // 条件（typeof renderStudioClosetList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        // PC版スタジオのコーデ作成の左側で確認できる手持ちの服一覧に保存できるかチェック
        if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
        // 条件（typeof renderPaneClosetGrid === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        // スマホ版のクローゼットは表示のされ方が違うのでそれぞれ表示できるかチェック
        if (typeof renderPaneClosetGrid === 'function') renderPaneClosetGrid();
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast(`👗 注文商品をMySQLのマイクローゼットに登録しました（${added}点）`);
        // 前の if が偽で、かつ（failed > 0）を満たす場合の別条件分岐です
        // 失敗した数が1つでもあればこれが出る
    } else if (failed > 0) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ MySQLへのマイクローゼット登録に失敗しました（サーバー接続を確認してください）');
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('この注文の商品はすでにマイクローゼットに登録済みです');
    }
}

// ==========================================================================
// 【関数】handlePlaceOrder()
// 【役割】お届け先確認・注文データの保存・カゴのお片付けまでを一気に完了させる「注文確定の総責任者」
// 【具体的な処理内容】
//   1. お届け先住所や電話番号の入力チェック
//   2. サーバーへ注文データを送信（MySQLへ保存）
//   3. カートを空にして、購入完了モーダルを表示
// ==========================================================================
async function handlePlaceOrder() {
    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (AppState.cart.length === 0) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('バッグに商品が入っていません');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // アプリ全体状態 AppState.pendingAuthTarget を最新値（'checkout'）に更新します
        //pendingAuthTarget ログインが終わったら購入手続きにとぶようにしている
        AppState.pendingAuthTarget = 'checkout';
        // ログイン後の処理として購入手続き画面に飛ぶよって言ってます
        sessionStorage.setItem('manekin_pending_auth_target', 'checkout');
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ ご購入には会員登録またはログインが必要です');
        // 変数・配列項目 window.location.hash の値を更新・計算します
        // ログイン画面に飛ぶ
        window.location.hash = '#login';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // HTML 要素 #order-name を取得して変数 nameInput に格納します
    // お名前
    const nameInput = document.getElementById('order-name');
    // HTML 要素 #order-phone を取得して変数 phoneInput に格納します
    // 電話番号
    const phoneInput = document.getElementById('order-phone');
    // HTML 要素 #order-email を取得して変数 emailInput に格納します
    // メールアドレス
    const emailInput = document.getElementById('order-email');
    // HTML 要素 #order-postal を取得して変数 postalInput に格納します
    // 郵便番号
    const postalInput = document.getElementById('order-postal');
    // HTML 要素 #order-address を取得して変数 addressInput に格納します
    // 住所
    const addressInput = document.getElementById('order-address');
    // HTML 要素 #order-delivery-time を取得して変数 deliveryTimeInput に格納します
    // 配送希望時間帯
    const deliveryTimeInput = document.getElementById('order-delivery-time');
    // CSS セレクタに最初に一致した HTML 要素を取得して変数 paymentRadio に入れます
    // 購入手続き画面のお支払方法の選択部分で、この領域にある特定のボタン(クレジットカード)が既に押されている状態にしてね
    // タグまるごと持ってくるときはquerySelectorで指定
    const paymentRadio = document.querySelector('input[name="payment_method"]:checked');

    // 定数 customerName を宣言し、値（nameInput ? nameInput.value.trim() : "…）をセットします
    const customerName = nameInput ? nameInput.value.trim() : "";
    // 定数 phone を宣言し、値（phoneInput ? phoneInput.value.trim() :…）をセットします
    const phone = phoneInput ? phoneInput.value.trim() : "";
    // 定数 email を宣言し、値（emailInput ? emailInput.value.trim() :…）をセットします
    const email = emailInput ? emailInput.value.trim() : "";
    // 定数 postal を宣言し、値（postalInput ? postalInput.value.trim()…）をセットします
    const postal = postalInput ? postalInput.value.trim() : "";
    // 定数 address を宣言し、値（addressInput ? addressInput.value.trim…）をセットします
    const address = addressInput ? addressInput.value.trim() : "";
    // 定数 deliveryTime を宣言し、値（deliveryTimeInput ? deliveryTimeInput.…）をセットします
    const deliveryTime = deliveryTimeInput ? deliveryTimeInput.value : "指定なし";
    // 定数 paymentMethod を宣言し、値（paymentRadio ? paymentRadio.value : "ク…）をセットします
    const paymentMethod = paymentRadio ? paymentRadio.value : "クレジットカード";

    // 条件（!customerName || !address || !email）が成り立つか判定し、該当する場合の処理を実行します
    if (!customerName || !address || !email) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('お名前、ご住所、メールアドレスを入力してください');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // HTML 要素 #btn-place-order を取得して変数 placeBtn に格納します
    // 注文確定ボタンの骨組みをIDから取得
    const placeBtn = document.getElementById('btn-place-order');
    // 定数 restorePlaceBtn を宣言し、値（() => {）をセットします
    const restorePlaceBtn = () => {
        // 条件（placeBtn）が成り立つか判定し、該当する場合の処理を実行します
        // 注文確定ボタンの骨組みが存在している
        if (placeBtn) {
            // 変数・配列項目 placeBtn.disabled の値を更新・計算します
            // 念のためボタンを押したときに判定されない時が無いように解除しておく
            placeBtn.disabled = false;
            // 生成・変換した HTML 文字列を要素 placeBtn の中身として描画します
            placeBtn.innerHTML = '<span class="order-btn-text">注文を確定する</span><span class="order-btn-sub">（Python &amp; MySQLへ保存されます）</span>';
        }
    };

    // 定数 calc を宣言し、値（updateCheckoutCalculations()）をセットします
    // 購入手続き画面の数値をすべて計算する関数
    const calc = updateCheckoutCalculations();

    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 定数 orderPayload を宣言し、値（{）をセットします
    // お届け先情報、クーポン・ポイントの利用、支払い方法、請求内容など購入に必要な情報を書いて置く
    const orderPayload = {
        // 注文者氏名データをセットします（誰が購入したか保存）
        customer_name: customerName || AppState.currentUser.name || '会員様',
        // 注文確認メールアドレスをセットします
        customer_email: email,
        // 連絡先電話番号をセットします
        phone: phone,
        // 配送先郵便番号をセットします
        postal_code: postal,
        // 配送先住所をセットします
        address: address,
        // 選択されたお支払い方法をセットします
        payment_method: paymentMethod,
        // 希望配送時間帯をセットします
        delivery_time: deliveryTime,
        // 税込み商品小計金額をセットします
        subtotal: calc.subtotal,
        // 送料金額をセットします（ポイントでは引かれません）
        shipping_fee: calc.shipping,
        // クーポンコードおよびクーポン割引額
        coupon_code: currentAppliedCoupon ? String(currentAppliedCoupon.code || '') : '',
        coupon_name: currentAppliedCoupon ? (currentAppliedCoupon.name || currentAppliedCoupon.title || '') : '',
        coupon_discount: calc.couponDiscount || 0,
        // 今回支払いに使うポイント数をセットします（商品小計のみ対象）
        used_points: calc.usedPoints,
        // 最終お支払い合計金額をセットします（確実に送料を含みます）
        total_amount: calc.netTotal,
        // 今回獲得するポイント数をセットします
        earned_points: calc.earnedPoints,
        // MySQL でどの会員アカウントのデータか区別するための user_id をセットします
        user_id: targetUserId,
        // 対象商品・着用アイテムの一覧データです
        items: AppState.cart
    };

    // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
    const apiBase = getApiBaseUrl();
    // 再代入可能な変数 confirmedOrder を宣言し、値（null）をセットします
    let confirmedOrder = null;
    // 再代入可能な変数 backendUpdatedPoints を宣言し、値（null）をセットします
    let backendUpdatedPoints = null;

    // 専用ヘルパー関数 bumpCartUserSeq() を実行して状態や表示ラベルを更新します
    // 買い物カゴの通信番号をカチッと +1 進めて最新の通信合図を出すカウント係
    bumpCartUserSeq(targetUserId);
    // 変数・配列項目 _ordersMutationSeq の値を更新・計算します
    // 注文データを更新、変更した回数を数える変数を＋1
    _ordersMutationSeq++;
    // 先行する非同期通信の完了を待機します（万一失敗してもエラーで止まらず続行）
    // カートに入れた商品の情報をデータベースに保存できるようにしている
    try { await _cartSyncPromise; } catch (e) { }

    // スマホ版の場合は localStorage 上で注文データを生成・保存します
    if (isMobileLocalStorageMode()) {
        // 現在の日時オブジェクトを作成します
        const now = new Date();
        // 1000〜9999のランダムな4桁の数字を生成します
        const rand4 = Math.floor(1000 + Math.random() * 9000);
        // スマホ保存用の注文データオブジェクトを組み立てます
        confirmedOrder = {
            // 「ORD-年-4桁乱数」の注文番号を発行します
            order_no: `ORD-${now.getFullYear()}-${rand4}`,
            // 注文した会員のID
            user_id: targetUserId,
            // 注文者のお名前
            customer_name: orderPayload.customer_name,
            // 注文者のメールアドレス
            customer_email: orderPayload.customer_email,
            // 連絡先電話番号
            phone: orderPayload.phone,
            // 配送先郵便番号
            postal_code: orderPayload.postal_code,
            // 配送先住所
            address: orderPayload.address,
            // 支払い方法（クレジットカードなど）
            payment_method: orderPayload.payment_method,
            // 配達希望時間帯
            delivery_time: orderPayload.delivery_time,
            // 注文日付（YYYY/MM/DD形式）
            date: now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
            // 商品合計金額（小計）
            subtotal: orderPayload.subtotal,
            // 配送料（5,000円以上無料 / 未満550円）
            shipping_fee: orderPayload.shipping_fee,
            // 適用されたクーポンコード
            coupon_code: orderPayload.coupon_code,
            // クーポン割引額
            coupon_discount: orderPayload.coupon_discount,
            // 利用したポイント数
            used_points: orderPayload.used_points,
            // 最終お支払い合計金額
            total_amount: orderPayload.total_amount,
            // 今回獲得するポイント数
            earned_points: orderPayload.earned_points,
            // 注文状況ステータス
            status: '発送準備中',
            // カート内商品の完全なコピー配列
            items: JSON.parse(JSON.stringify(AppState.cart || []))
        };
    } else {
        // PC版：通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
        try {
            // 購入確定時に、購入手続きで入力した情報が何だったかをデータベースからもってこれるのかリクエストしている
            // Flask バックエンド API（/api/orders）へ非同期リクエストを送信し、応答を待ち受けます
            const response = await fetch(`${apiBase}/api/orders`, {
                // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
                method: 'POST',
                // サーバーへ送るデータの形式が JSON であることを伝える Content-Type ヘッダです
                headers: { 'Content-Type': 'application/json' },
                // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
                credentials: 'include',
                // JavaScript オブジェクトを JSON 文字列へ変換して送信ボディに乗せます
                body: JSON.stringify(orderPayload)
            });

            // 定数 data を宣言し、値（await response.json().catch(() => ({})…）をセットします
            const data = await response.json().catch(() => ({}));
            // サーバーから返ってきた JSON のステータス結果が成功かエラーかを検証します
            if (!response.ok || !data.order) {
                // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
                showToast(data.message || '⚠️ MySQLへの注文保存に失敗しました（データベース接続を確認してください）');
                // 専用ヘルパー関数 restorePlaceBtn() を実行して状態や表示ラベルを更新します
                restorePlaceBtn();
                // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
                return;
            }
            // 変数・配列項目 confirmedOrder の値を更新・計算します
            confirmedOrder = data.order;
            // 条件（data.updated_points !== undefined && data.updated_po…）が成り立つか判定し、該当する場合の処理を実行します
            if (data.updated_points !== undefined && data.updated_points !== null) {
                // 変数・配列項目 backendUpdatedPoints の値を更新・計算します
                backendUpdatedPoints = data.updated_points;
            }
            // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
        } catch (err) {
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ PythonサーバーまたはMySQLに接続できないため注文を確定できませんでした（app.pyとMySQLの起動を確認してください）');
            // 専用ヘルパー関数 restorePlaceBtn() を実行して状態や表示ラベルを更新します
            // ｴﾗｰは起きるけど　別に注文確定ボタンは押せます
            restorePlaceBtn();
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
    }

    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) {
        // 専用ヘルパー関数 restorePlaceBtn() を実行して状態や表示ラベルを更新します
        // ログインして無くてもボタンは押せるよ　押したらログイン画面に飛ぶよ
        restorePlaceBtn();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 itemSummaryList を宣言し、値（confirmedOrder.items.map(it => `${it.name} (${it.size}) × ${it.quantity}`)）をセットします
    // 注文した商品リスト(confirmedOrder)を一つずつ取り出して商品名×個数という配列を作り出している
    // 例：オーバーシャツ(L)×2
    const itemSummaryList = confirmedOrder.items.map(it => `${it.name} (${it.size}) × ${it.quantity}`);
    // 変数・配列項目 confirmedOrder.items_summary の値を更新・計算します
    // 上で作った配列の要素をjoin(",")でつなげて一個にしている
    // 例：Tシャツ×１、デニム×１
    confirmedOrder.items_summary = itemSummaryList.join(", ");

    // 定数 currentPts を宣言し、値（getUserPoints()）をセットします
    // 今の所持ポイントをまずは取得
    const currentPts = getUserPoints();
    // サーバーから帰ってきた獲得ポイント(backendUpdatedPoints)があるかどうかをチェック
    // 定数 updatedPts を宣言し、値（backendUpdatedPoints !== null ? backen…）をセットします
    // 現在のポイントから使ったポイントを引いて獲得したポイントを足す、その答えがマイナスにならないように最大0から計算結果にしている
    const updatedPts = backendUpdatedPoints !== null ? backendUpdatedPoints : (Math.max(0, currentPts - calc.usedPoints) + calc.earnedPoints);
    // 専用ヘルパー関数 setUserPoints() を実行して状態や表示ラベルを更新します
    // 最終的なポイント数をsetUserPointsに渡して、ポイント表示を更新している
    setUserPoints(updatedPts);

    // 条件（typeof bumpClosetMutationSeq === 'function'）が成り立つか判定し、該当する場合の処理を実行します
    // クローゼットの登録・削除時に最新操作を保証する連番を進めます
    if (typeof bumpClosetMutationSeq === 'function') bumpClosetMutationSeq();
    // 定数 purchasedItems を宣言し、値（[...confirmedOrder.items]）をセットします
    const purchasedItems = [...confirmedOrder.items];
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    purchasedItems.forEach((it, idx) => {
        // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して productMaster に入れます
        // 商品一覧から購入した商品なのかをIDでチェックしている
        const productMaster = (typeof SAMPLE_PRODUCTS !== 'undefined') ? SAMPLE_PRODUCTS.find(p => p.id === (it.id || it.product_id)) : null;
        // 定数 cat を宣言し、値（it.category || (productMaster ? produc…）をセットします
        // 購入した商品のカテゴリ　又は　商品一覧から購入した商品のカテゴリをcatに入れる
        const cat = it.category || (productMaster ? productMaster.category : 'TOPS');
        // 定数 exists を宣言し、値（AppState.myCloset.some(c => c.name ===…）をセットします
        // 購入した商品をクローゼットに入れた結果、
        // 現在のクローゼットに保存された商品の名前と色が　購入した商品と一緒かどうかを見て同じだったらexistsに入れる
        const exists = AppState.myCloset.some(c => c.name === it.name && c.color === it.color);
        // 条件（!exists）が成り立つか判定し、該当する場合の処理を実行します
        // 買ってないものかつ色が違うものがマイクローゼットに入っていたら
        if (!exists) {
            // 新規追加された最新データを配列 AppState.myCloset の先頭へ挿入(unshift)して即画面反映します
            AppState.myCloset.unshift({
                // レコード・商品・コーデを識別する ID プロパティをセットします
                id: 'purchased-' + (it.id || it.product_id || 0) + '-' + confirmedOrder.order_no + '-' + idx,
                // 紐づくブランド商品の元 ID
                productId: it.id || it.product_id,
                // 商品名またはアイテム名称
                name: it.name,
                // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                category: cat,
                // カラー名
                color: it.color || 'BLACK',
                // 着用シーズン
                season: '通年',
                // 画像ファイルパスまたは DataURL
                image: it.image,
                // ユーザーの手持ち私物であるかどうかのフラグ
                isOwned: true,
                // ストアで購入してクローゼット取り込みされた品かどうかのフラグ
                isPurchased: true,
                // 単価・価格（円）
                price: it.price,
                // 購入した日付
                purchaseDate: new Date().toLocaleDateString('ja-JP')
            });
        }
    });

    // 購入した商品がお気に入りに登録されていた場合、お気に入り一覧から即座に削除・解除します
    // 今回購入した商品一覧から商品IDを取り出し、有効な正の数値（ID）のみを配列として抽出します
    const purchasedIds = purchasedItems.map(it => Number(it.id || it.product_id)).filter(id => !isNaN(id) && id > 0);
    // 購入商品が1件以上あり、かつお気に入りリストが配列として存在する場合に解除処理を実行します
    if (purchasedIds.length > 0 && Array.isArray(AppState.favorites)) {
        // 購入された商品IDを1件ずつ順番に取り出してループ処理します
        purchasedIds.forEach(pId => {
            // 型に依存せず数値一致で配列から完全に削除します（購入した商品は手持ち服になるためお気に入りから除外）

            // pIdが購入した商品　お気に入り商品のIDがfavIdで
            // 購入前のお気に入り一覧があって購入した商品(元々お気に入りに登録されていた商品)を除外して削除している
            // お気に入り一覧の中から購入した商品をもうお気に入り商品とは見なさないとして
            // お気に入り一覧から購入された商品を除外して購入されていないお気に入り商品だけの配列に絞り込んでいる
            // それを現在のお気に入り一覧として使う
            AppState.favorites = AppState.favorites.filter(favId => Number(favId) !== pId);
            // ハートボタンの表示を解除状態に更新するため、同期関数が存在するか確認します
            // お気に入り一覧を表示するときに、全ハートボタンを赤色にする処理が書かれている
            if (typeof syncAllFavoriteButtons === 'function') {
                // 画面上にある該当商品のハートマークボタンをすべて解除（OFF / 白抜き）に同期します
                // お気に入り一覧から購入された商品のIDを見てその商品のハートを白に変える
                syncAllFavoriteButtons(pId, false);
            }
            // MySQL データベースを利用しているログイン会員かどうかを判定します
            if (AppState.currentUser && isServerUserId(AppState.currentUser.id)) {
                // 通信エラーで注文処理が中断しないよう try ブロックで安全に実行します
                try {
                    // PythonバックエンドAPI（/api/favorites/remove）へ非同期でお気に入り削除リクエストを送信します
                    // データベースのfavoritesの何かしらを消したい(remove)したいですってPOST送信でリクエスト送信している
                    // 削除したい具体的な中身(body)として、
                    // pIdとして扱っているproduct_idとAppState.currentUser.idとして扱っているuser_idを消したいよって言ってます
                    fetch(`${getApiBaseUrl()}/api/favorites/remove`, {
                        // POSTメソッドで送信します
                        method: 'POST',
                        // 送信形式が JSON であることを指定します
                        headers: { 'Content-Type': 'application/json' },
                        // ログインセッション用の Cookie を一緒に送信します
                        credentials: 'include',
                        // 削除対象の商品IDと会員IDを JSON 文字列に変換して送信ボディにセットします
                        body: JSON.stringify({ product_id: pId, user_id: AppState.currentUser.id })
                        // 通信失敗時も注文完了処理を止めないよう安全に空関数でキャッチします
                    }).catch(() => { });
                    // 万が一の例外発生時も画面を止めずに安全にスルーします
                } catch (_) { }
            }
        });

        // ナビバッジ・スタジオ表示・お気に入り画面をすべて即時同期します
        // お気に入り削除するから数が減る更新がされるハートマークのバッジから
        updateFavoriteBadges();
        // スタジオのバッジ表示を更新します
        // MANEKIN AIのお気に入り商品のバッジ
        if (typeof updateStudioBadges === 'function') updateStudioBadges();
        // スタジオのお気に入りグリッドを再描画します
        // MANEKIN AIのお気に入り商品のタブを開いた時の画面の一覧表示の個数を更新
        if (typeof renderStudioFavoritesGrid === 'function') renderStudioFavoritesGrid();
        // スタジオのブランド一覧画面を再描画します
        // コーデ作成の右側のお気に入りブランドリスト
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        // スタジオのアイテム一覧画面を再描画します
        // MANEKINで見る事が出来るすべてのITEMを更新
        if (typeof renderStudioItems === 'function') renderStudioItems();
        // お気に入り一覧画面を再描画します
        // MANEKIN関係なく開けるお気に入り一覧の更新
        if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
        // マイページ画面を再描画します
        if (typeof renderMyPage === 'function') renderMyPage();
        // スマホ版の場合はlocalStorageのお気に入りデータも最新状態に保存します
        // スマホ版の時、アカウントのIDごとに最新のお気に入り一覧データをlocalStorageに保存する
        if (isMobileLocalStorageMode()) {
            lsSetJson(`manekin_ls_favorites_${targetUserId}`, AppState.favorites);
        }
    }

    // 購入者のお名前を注文データに確実に紐付けます（誰が購入したか保存）
    // 購入者の名前が無かったら　かつ　ログインユーザーがいたら
    if (!confirmedOrder.customer_name && AppState.currentUser) {
        // 会員名が注文データになければログイン中の会員名を代入します
        // 購入者の名前が無いので、現在ログインしている人の名前を購入者の名前にします
        confirmedOrder.customer_name = AppState.currentUser.name;
    }
    // 注文完了画面表示用に適用中クーポンのスナップショットを保持します
    const appliedCouponSnapshot = currentAppliedCoupon ? {
        // クーポン名
        name: currentAppliedCoupon.name || currentAppliedCoupon.title || '会員優待クーポン',
        // クーポンコード
        code: currentAppliedCoupon.code || '',
        // 割引額（円）
        discount: calc.couponDiscount || 0
    } : null;

    // 使用したクーポンを消滅（1回限り有効）させます
    // 注文を確定するときにクーポンが存在していたら
    if (currentAppliedCoupon) {
        // クーポン一覧が配列として存在する場合
        if (Array.isArray(AppState.userCoupons)) {
            // 使ったクーポンとコードが一致するものを探します
            const usedC = AppState.userCoupons.find(c => c.code === currentAppliedCoupon.code);
            // 見つかったら使用済みフラグ（is_used = 1）を立てます
            if (usedC) {
                usedC.is_used = 1;
            }
        }
        // スマホ版の場合は更新されたクーポン一覧をlocalStorageに保存します
        if (isMobileLocalStorageMode()) {
            lsSetJson(`manekin_ls_coupons_${targetUserId}`, AppState.userCoupons || []);
        }
        // 適用中クーポンを解除（null）にします
        // nullにしないと一生適用されたままになる次の商品を購入するときも
        // いちいち購入をし終わったらクーポンの効力を解除しないと次の買い物にも引き継いでしまう
        currentAppliedCoupon = null;
        // お会計画面のクーポン選択欄を描き直します
        // クーポンを適用して購入画面に進むともうクーポンの適用状態から利用しないなどを選べなくなるから
        // 上の文でクーポンの効力を無くして、もう既に使用されましたよの表示に変更する
        renderCheckoutCoupons();
    }

    // 新規追加された最新データを配列 AppState.orderHistory の先頭へ挿入(unshift)して即画面反映します
    // 購入者が入力したお届け先情報や使用クーポン・ポイントやお支払方法、請求内容(商品合計、内税価格、配送料、お支払合計金額)をもってきます
    AppState.orderHistory.unshift(confirmedOrder);

    // アプリ全体状態 AppState.cart を最新値（[]）に更新します
    // 購入後はカートを空にする
    AppState.cart = [];
    // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
    // カートのバッジも最新の状態(0)にする
    updateCartBadge();
    // 変数・配列項目 checkoutUsedPoints の値を更新・計算します
    // 使用するポイントは会計時に使用し終わっているので、デフォルト表示の0に戻す
    checkoutUsedPoints = 0;

    // スマホ版の場合は注文履歴・クローゼット・空になったカートを localStorage に保存します
    if (isMobileLocalStorageMode()) {
        // その人の最新の購入履歴を再読み込みする(履歴の追加)
        // その人の最新のクローゼットの中身を再読み込みする(購入した商品をクローゼットに追加)
        // その人の最新のカートの中身を再読み込みする(カートの中身を0に戻す)
        lsSetJson(`manekin_ls_orders_${targetUserId}`, AppState.orderHistory);
        lsSetJson(`manekin_ls_closet_${targetUserId}`, AppState.myCloset);
        lsSetJson(`manekin_ls_cart_${targetUserId}`, []);
    }

    // 専用ヘルパー関数 restorePlaceBtn() を実行して状態や表示ラベルを更新します
    restorePlaceBtn();

    // HTML 要素 #checkout-layout-main を取得して変数 mainLayout に格納します
    // 注文確定画面のデザイン含む骨組み
    const mainLayout = document.getElementById('checkout-layout-main');
    // HTML 要素 #order-completed-view を取得して変数 completedView に格納します
    // 画面切り替えのactiveをつけて画面表示するところ(注文画面全体に指定されているのでそこのdisplayがnoneかblockかで表示を切り替え)
    const completedView = document.getElementById('order-completed-view');
    // HTML 要素 #comp-order-no を取得して変数 compOrderNo に格納します
    // 注文管理番号
    const compOrderNo = document.getElementById('comp-order-no');
    // HTML 要素 #comp-order-date を取得して変数 compOrderDate に格納します
    // ご注文日時
    const compOrderDate = document.getElementById('comp-order-date');
    // HTML 要素 #comp-order-address を取得して変数 compOrderAddress に格納します
    // お届け先
    const compOrderAddress = document.getElementById('comp-order-address');
    // HTML 要素 #comp-order-total を取得して変数 compOrderTotal に格納します
    // お支払合計金額
    const compOrderTotal = document.getElementById('comp-order-total');
    // HTML 要素 #comp-earned-points を取得して変数 compEarnedPoints に格納します
    // 今回の獲得ポイント
    const compEarnedPoints = document.getElementById('comp-earned-points');
    // HTML 要素 #comp-balance-points を取得して変数 compBalancePoints に格納します
    // 購入後に現在の保有しているポイント
    const compBalancePoints = document.getElementById('comp-balance-points');
    // HTML 要素 #completed-closet-msg を取得して変数 closetBannerMsg に格納します
    // 購入した商品をマイクローゼットに保存できたかどうか表示するとこ
    const closetBannerMsg = document.getElementById('completed-closet-msg');

    // 条件（mainLayout）が成り立つか判定し、該当する場合の処理を実行します
    // 購入確定画面全体は、普段はdisplay: none;で隠れている状態
    if (mainLayout) mainLayout.style.display = 'none';
    // 条件（completedView）が成り立つか判定し、該当する場合の処理を実行します
    // 注文画面全体を領域ごとに縦ならべ(block)で表示
    if (completedView) completedView.style.display = 'block';

    // 注文完了に合わせてステップバーを「3: 注文確定（黒丸・黒線）」へ更新します
    updateCheckoutStepper(3);
    // 注文画面全体の一番上(top: 0)まで滑らかな(smooth)動き(behavior)でスクロール(scrollTo)する
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 条件（compOrderNo）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderNo) compOrderNo.textContent = confirmedOrder.order_no;
    // 条件（compOrderDate）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderDate) compOrderDate.textContent = confirmedOrder.date;
    // 条件（compOrderAddress）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderAddress) compOrderAddress.textContent = confirmedOrder.address;
    // 条件（compOrderTotal）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderTotal) compOrderTotal.textContent = `¥${confirmedOrder.total_amount.toLocaleString()}`;
    // 条件（compEarnedPoints）が成り立つか判定し、該当する場合の処理を実行します
    if (compEarnedPoints) compEarnedPoints.textContent = (calc.earnedPoints > 0) ? `+${calc.earnedPoints.toLocaleString()} pt` : '0 pt';
    // 条件（compBalancePoints）が成り立つか判定し、該当する場合の処理を実行します
    if (compBalancePoints) compBalancePoints.textContent = `${updatedPts.toLocaleString()} pt`;

    // クーポン利用情報の表示（クーポン適用時のみ行を表示）

    // 注文完了画面表示用に適用中クーポンのスナップショットを保持します
    // const appliedCouponSnapshot = currentAppliedCoupon ? {
    // クーポン名
    // name: currentAppliedCoupon.name || currentAppliedCoupon.title || '会員優待クーポン',
    // クーポンコード
    //code: currentAppliedCoupon.code || '',
    // 割引額（円）
    //discount: calc.couponDiscount || 0

    // 注文完了画面の「クーポン割引」表示行（横並び枠）のHTML要素を取得します
    const compCouponRow = document.getElementById('comp-coupon-row');
    // クーポン名・クーポンコード・割引金額を表示するテキストHTML要素を取得します
    const compCouponInfo = document.getElementById('comp-coupon-info');
    // クーポン行とテキスト要素の両方が画面上に存在するか判定します（存在時のみ処理実行）
    if (compCouponRow && compCouponInfo) {
        // 注文確定データまたは適用中クーポンから、実際の割引額（円）を安全に決定します
        // confirmedOrderの中には購入手続き時の情報がすべて入っていて、
        // その中から購入時のクーポンの割引金額をもってきています。
        // 条件としては、購入手続き時にクーポンの割引額が算出されている　かつ　算出されたクーポンの割引額が0より大きかったら
        const discount = (confirmedOrder.coupon_discount && confirmedOrder.coupon_discount > 0)
            // 確定注文データに割引金額があればその数値をそのまま採用します
            ? confirmedOrder.coupon_discount
            // 注文データに無ければスナップショットの割引額（どちらも無ければ0円）を採用します
            : (appliedCouponSnapshot ? appliedCouponSnapshot.discount : 0);
        // クーポン割引額が1円以上ある場合（クーポンを使った場合）の表示処理です
        if (discount > 0) {
            // クーポン行のスタイルを 'flex' に切り替えて画面　に表示させます
            compCouponRow.style.display = 'flex';
            // 表示用のクーポン名を取得します（未設定時は'クーポン割引'）
            const cName = (appliedCouponSnapshot && appliedCouponSnapshot.name) || confirmedOrder.coupon_name || 'クーポン割引';
            // 表示用のクーポンコードを取得します（未設定時は空文字）
            const cCode = (appliedCouponSnapshot && appliedCouponSnapshot.code) || confirmedOrder.coupon_code || '';
            // クーポンコードがある場合は「 [WELCOME10]」のようなバッジ文字列を作成します
            const codeBadge = cCode ? ` [${cCode}]` : '';
            // 「クーポン名 [コード] -¥割引額」という形式で文字を組み立てて画面に書き込みます
            compCouponInfo.textContent = `${cName}${codeBadge} -¥${discount.toLocaleString()}`;
            // クーポンを使っていない（割引額が0円）場合の処理です
        } else {
            // クーポン行のスタイルを 'none' にして画面から非表示にして隠します
            compCouponRow.style.display = 'none';
        }
    }

    // ポイント利用情報の表示（ポイント利用時のみ行を表示）
    // 注文完了画面の「ポイント利用」表示行（横並び枠）のHTML要素を取得します
    const compUsedPointsRow = document.getElementById('comp-used-points-row');
    // 利用したポイント数を表示するテキストHTML要素を取得します
    const compUsedPoints = document.getElementById('comp-used-points');
    // ポイント行とテキスト要素の両方が画面上に存在するか判定します（存在時のみ処理実行）
    if (compUsedPointsRow && compUsedPoints) {
        // 今回の注文で利用したポイント数を安全に取得します（使っていなければ0ポイント）
        const usedPts = confirmedOrder.used_points || calc.usedPoints || 0;
        // ポイントを1pt以上使った場合の表示処理です
        if (usedPts > 0) {
            // ポイント行のスタイルを 'flex' に切り替えて画面に表示させます
            compUsedPointsRow.style.display = 'flex';
            // 「-500 pt」のようにカンマ区切りで利用ポイント数を画面に書き込みます
            compUsedPoints.textContent = `-${usedPts.toLocaleString()} pt`;
            // ポイントを使っていない（0pt）場合の処理です
        } else {
            // ポイント行のスタイルを 'none' にして画面から非表示にして隠します
            compUsedPointsRow.style.display = 'none';
        }
    }

    // HTML 要素 #comp-db-status を取得して変数 compDbStatus に格納します
    const compDbStatus = document.getElementById('comp-db-status');
    // 条件（compDbStatus）が成り立つか判定し、該当する場合の処理を実行します
    if (compDbStatus) {
        // 文字要素 compDbStatus の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        compDbStatus.textContent = isMobileLocalStorageMode() ? '🟢 スマホ＆デモ版 (localStorage) 保存完了' : '🟢 MySQL (manekin_db) 保存完了';
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（compDbStatus.style.background = '#dcfce7';）
        compDbStatus.style.background = '#dcfce7';
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（compDbStatus.style.color = '#15803d';）
        compDbStatus.style.color = '#15803d';
    }

    // 条件（closetBannerMsg && purchasedItems.length > 0）が成り立つか判定し、該当する場合の処理を実行します
    if (closetBannerMsg && purchasedItems.length > 0) {
        // 文字要素 closetBannerMsg の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        closetBannerMsg.textContent = `購入された「${purchasedItems[0].name}」など ${purchasedItems.length} 点をMySQLのマイクローゼットに自動登録しました！スタジオで手持ち服との組み合わせや着せ替え比較をすぐにお試しいただけます。`;
    }

    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    const buyerName = confirmedOrder.customer_name || AppState.currentUser?.name || 'お客様';
    showToast(`🎉【${buyerName} 様】ご注文完了！注文番号「${confirmedOrder.order_no}」をご注文履歴に保存しました`);
}


// 再代入可能な変数 _ordersMutationSeq を宣言し、値（0）をセットします
let _ordersMutationSeq = 0;

// ==========================================================================
// 【関数】syncOrdersFromBackend()
// 【役割】データベースからログインしている会員の過去の買い物履歴を取り寄せる履歴お届け係
// 【具体的な処理内容】
//   ・注文番号、購入日時、商品、合計金額などの一覧をサーバーから読み込んで画面に反映します
// ==========================================================================
async function syncOrdersFromBackend() {
    // HTML 要素 #mysql-status-pill を取得して変数 statusPill に格納します
    const statusPill = document.getElementById('mysql-status-pill');
    // 定数 setConnectedPill を宣言し、値（() => {）をセットします
    const setConnectedPill = () => {
        // 条件（!statusPill）が成り立つか判定し、該当する場合の処理を実行します
        if (!statusPill) return;
        // 文字要素 statusPill の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        statusPill.textContent = '🟢 MySQL (manekin_db) 接続中';
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（statusPill.style.background = '#dcfce7';）
        statusPill.style.background = '#dcfce7';
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（statusPill.style.color = '#15803d';）
        statusPill.style.color = '#15803d';
        // 変数・配列項目 statusPill.title の値を更新・計算します
        statusPill.title = 'Python APIサーバーとMySQL(manekin_db)に正常接続されています';
    };
    const setMobileLocalStoragePill = () => {
        if (!statusPill) return;
        statusPill.textContent = '🟢 スマホ＆デモ版 (localStorage 保存モード)';
        statusPill.style.background = '#dcfce7';
        statusPill.style.color = '#15803d';
        statusPill.title = 'スマホ＆デモ版ではPythonサーバー・MySQLを使わずlocalStorageに保存しています';
    };
    // 定数 setDisconnectedPill を宣言し、値（() => {）をセットします
    const setDisconnectedPill = () => {
        // 条件（!statusPill）が成り立つか判定し、該当する場合の処理を実行します
        if (!statusPill) return;
        // 文字要素 statusPill の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        statusPill.textContent = '🔴 MySQL未接続 (Pythonサーバー/MySQLを確認してください)';
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（statusPill.style.background = '#fee2e2';）
        statusPill.style.background = '#fee2e2';
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（statusPill.style.color = '#b91c1c';）
        statusPill.style.color = '#b91c1c';
        // 変数・配列項目 statusPill.title の値を更新・計算します
        statusPill.title = 'Pythonサーバー(app.py)とXAMPPのMySQLが起動しているか確認してください';
    };

    // スマホ版の場合は localStorage から注文履歴を取得して画面を更新します
    if (isMobileLocalStorageMode()) {
        // ステータス表示バッジを「スマホ＆デモ版 (localStorage)」の緑色表示に切り替えます
        setMobileLocalStoragePill();
        // ログインしていない（または正規会員でない）場合は注文履歴を空にしてマイページを描画し終了します
        if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
            // 注文履歴を空（[]）にします
            AppState.orderHistory = [];
            // マイページ画面を更新します
            renderMyPage();
            // お会計画面の計算を更新します
            updateCheckoutCalculations();
            // 処理を終了します
            return;
        }
        // localStorageからこの会員専用の注文履歴配列を取り出します
        const savedOrders = lsGetJson(`manekin_ls_orders_${AppState.currentUser.id}`, []);
        // 正しい配列なら注文履歴にセットし、配列でなければ空配列（[]）にします
        AppState.orderHistory = Array.isArray(savedOrders) ? savedOrders : [];
        // 過去の注文履歴から実質ポイント残高（獲得−利用）を正確に計算します
        const netPts = calculateNetPointsFromOrders(AppState.orderHistory);
        // 計算したポイント残高をお客さんの保有ポイントに反映します
        setUserPoints(Math.max(Number(AppState.currentUser.points || 0), netPts));
        // マイページ画面を最新データで描き直します
        renderMyPage();
        // お会計画面の計算を更新します
        updateCheckoutCalculations();
        // スマホ版の処理をここで終了します
        return;
    }

    // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
    const apiBase = getApiBaseUrl();
    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser) {
            // Flask バックエンド API（/api/health）へ非同期リクエストを送信し、応答を待ち受けます
            const hRes = await fetch(`${apiBase}/api/health`, { cache: 'no-store' });
            // 定数 hData を宣言し、値（hRes.ok ? await hRes.json().catch(() =…）をセットします
            const hData = hRes.ok ? await hRes.json().catch(() => ({})) : {};
            // 条件（hRes.ok && hData && hData.mysql === 'connected'）が成り立つか判定し、該当する場合の処理を実行します
            if (hRes.ok && hData && hData.mysql === 'connected') {
                // 専用ヘルパー関数 setConnectedPill() を実行して状態や表示ラベルを更新します
                setConnectedPill();
                // 上記の if 条件に当てはまらなかった場合の分岐処理です
            } else {
                // 専用ヘルパー関数 setDisconnectedPill() を実行して状態や表示ラベルを更新します
                setDisconnectedPill();
            }
            // アプリ全体状態 AppState.orderHistory を最新値（[]）に更新します
            AppState.orderHistory = [];
            // 関連処理 renderMyPage() を呼び出して処理・画面を更新します
            renderMyPage();
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }

        // 定数 userId を宣言し、値（AppState.currentUser.id）をセットします
        const userId = AppState.currentUser.id;
        // 条件（!isServerUserId(userId)）が成り立つか判定し、該当する場合の処理を実行します
        if (!isServerUserId(userId)) {
            // アプリ全体状態 AppState.orderHistory を最新値（[]）に更新します
            AppState.orderHistory = [];
            // 専用ヘルパー関数 setDisconnectedPill() を実行して状態や表示ラベルを更新します
            setDisconnectedPill();
            // 関連処理 renderMyPage() を呼び出して処理・画面を更新します
            renderMyPage();
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
        // 定数 fetchStartSeq を宣言し、値（_ordersMutationSeq）をセットします
        const fetchStartSeq = _ordersMutationSeq;
        // Flask バックエンド API（/api/orders）へ非同期リクエストを送信し、応答を待ち受けます
        const response = await fetch(`${apiBase}/api/orders?user_id=${userId}`, {
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include',
            // ブラウザが昔の通信結果をキャッシュ再利用しないよう 'no-store' を指定します
            cache: 'no-store'
        });
        // 条件（response.ok）が成り立つか判定し、該当する場合の処理を実行します
        if (response.ok) {
            // 定数 data を宣言し、値（await response.json()）をセットします
            const data = await response.json();
            // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(userId)) return;
            // 条件（fetchStartSeq !== _ordersMutationSeq）が成り立つか判定し、該当する場合の処理を実行します
            if (fetchStartSeq !== _ordersMutationSeq) return;
            // 専用ヘルパー関数 setConnectedPill() を実行して状態や表示ラベルを更新します
            setConnectedPill();
            // 条件（data.orders && Array.isArray(data.orders)）が成り立つか判定し、該当する場合の処理を実行します
            if (data.orders && Array.isArray(data.orders)) {
                // 定数 validOrders を宣言し、値（data.orders.filter(o => {）をセットします
                const validOrders = data.orders.filter(o => {
                    // 条件（!o）が成り立つか判定し、該当する場合の処理を実行します
                    if (!o) return false;
                    // 定数 summary を宣言し、値（(o.items_summary || "")）をセットします
                    const summary = (o.items_summary || "");
                    // 定数 isLegacyTshirt を宣言し、値（summary.includes("プレミアム コットン リラックス Tシャ…）をセットします
                    const isLegacyTshirt = summary.includes("プレミアム コットン リラックス Tシャツ") || summary.includes("リラックス Tシャツ") || summary.includes("item_tshirt");
                    // 結果（!isLegacyTshirt && o.order_no !== "ORD-2026-0982…）を呼び出し元へ返却します
                    return !isLegacyTshirt && o.order_no !== "ORD-2026-0982" && o.order_no !== "ORD-2026-0851";
                });
                // アプリ全体状態 AppState.orderHistory を最新値（validOrders）に更新します
                AppState.orderHistory = validOrders;
                // 購入した注文履歴から加算されたポイント合計（−利用分）を算出し、保有ポイントとして反映します
                const netPts = calculateNetPointsFromOrders(validOrders);
                const prevPts = Number(AppState.currentUser.points || 0);
                if (validOrders.length > 0 && netPts !== prevPts) {
                    setUserPoints(netPts, { syncToBackend: true });
                } else {
                    setUserPoints(Math.max(prevPts, netPts));
                }
                // 関連処理 renderMyPage() を呼び出して処理・画面を更新します
                renderMyPage();
                // チェックアウト画面の保有ポイント表示も最新値へ更新します
                updateCheckoutCalculations();
            }
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 処理を中断して呼び出し元の catch へエラー内容（throw new Error('API response not ok');）を渡します
            throw new Error('API response not ok');
        }
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn("MySQL注文履歴の取得に失敗しました:", e);
        // 専用ヘルパー関数 setDisconnectedPill() を実行して状態や表示ラベルを更新します
        setDisconnectedPill();
    }
}

// ==========================================================================
// 【関数】handleClearOrderHistory()
// 【役割】マイページの買い物履歴をぜんぶ消してリセットする注文履歴お掃除係
// 【具体的な処理内容】
//   ・テスト用などに保存されている過去の注文履歴をすべて消去します
// ==========================================================================
async function handleClearOrderHistory() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ ログインが必要です');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 条件（!confirm('現在のアカウントのご注文履歴をすべて初期化して、0件にしますか？')）が成り立つか判定し、該当する場合の処理を実行します
    if (!confirm('現在のアカウントのご注文履歴をすべて初期化して、0件にしますか？')) return;

    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 変数・配列項目 _ordersMutationSeq の値を更新・計算します
    _ordersMutationSeq++;

    // スマホ版の場合は localStorage の注文履歴を初期化します
    if (isMobileLocalStorageMode()) {
        // localStorageのこの会員の注文履歴を空配列（[]）にして保存します
        lsSetJson(`manekin_ls_orders_${targetUserId}`, []);
        // アプリ全体の注文履歴配列を空にします
        AppState.orderHistory = [];
        // 保有ポイントも0にリセットします
        setUserPoints(0);
        // マイページ画面を初期化状態（0件）で描き直します
        renderMyPage();
        // お会計画面の計算を更新します
        updateCheckoutCalculations();
        // 画面に「初期化しました」とトースト通知を表示します
        showToast('このアカウントのご注文履歴を初期化しました（0件）');
        // スマホ版の処理をここで終了します
        return;
    }

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
        const apiBase = getApiBaseUrl();
        // Flask バックエンド API（/api/orders）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/orders?user_id=${targetUserId}`, {
            // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
            method: 'DELETE',
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include'
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('Backend orders delete failed');
        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;

        // アプリ全体状態 AppState.orderHistory を最新値（[]）に更新します
        AppState.orderHistory = [];
        setUserPoints(0, { syncToBackend: true });
        // 関連処理 renderMyPage() を呼び出して処理・画面を更新します
        renderMyPage();
        updateCheckoutCalculations();
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('このアカウントのMySQLご注文履歴を初期化しました（0件）');
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('Backend orders delete failed', e);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ MySQLから注文履歴を削除できませんでした（サーバー接続を確認してください）');
    }
}

// ==========================================================================
// 【関数】handleRefreshFromMySQL()
// 【役割】マイページの「最新データに更新」ボタンが押されたときに、最新データを読み込み直すマイページ更新係
// 【具体的な処理内容】
//   ・注文履歴・お気に入り・カート・クローゼットの全データをサーバーから一括で再取得して画面を最新化します
// ==========================================================================
async function handleRefreshFromMySQL() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ データを読み込むにはログインしてください');
        // 変数・配列項目 window.location.hash の値を更新・計算します
        window.location.hash = '#login';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // スマホ版の場合は localStorage から全データを再読込します
    if (isMobileLocalStorageMode()) {
        // バックエンド・端末から最新のログイン会員情報を復帰させます
        const refreshedUser = await restoreAuthSessionFromBackend();
        // 会員情報が取得できた場合
        if (refreshedUser) {
            // アプリ全体のログイン会員情報を最新化します
            AppState.currentUser = refreshedUser;
            // ナビバーやヘッダーのログイン状態UIを更新します
            if (typeof updateAuthNavUI === 'function') updateAuthNavUI();
        }
        // 注文履歴・お気に入り・カート・クーポン・クローゼット・コーデ・スタジオ状態をすべて同時に再読込します
        await Promise.all([
            // 注文履歴を再取得します
            syncOrdersFromBackend(),
            // お気に入り商品を再取得します
            syncFavoritesFromBackend(),
            // カート内の商品を再取得します
            syncCartFromBackend(),
            // 保有クーポン一覧を再取得します
            fetchUserCoupons(),
            // クローゼット内の手持ち服を再取得します
            (typeof syncClosetFromBackend === 'function') ? syncClosetFromBackend() : Promise.resolve(),
            // 保存したコーデ一覧を再取得します
            (typeof syncOutfitsFromBackend === 'function') ? syncOutfitsFromBackend() : Promise.resolve(),
            // スタジオの試着マネキン状態を再取得します
            (typeof syncStudioStateFromBackend === 'function') ? syncStudioStateFromBackend() : Promise.resolve()
        ]);
        // マイページ画面を最新データで描き直します
        renderMyPage();
        // 最新データの件数サマリーをトースト通知で画面に表示します
        showToast(`✨ スマホ＆デモ版(localStorage)から最新データを再読込しました！（注文:${AppState.orderHistory.length}件, 服:${AppState.myCloset.length}点, コーデ:${AppState.savedOutfits.length}件, 保有:${getUserPoints().toLocaleString()}pt）`);
        // スマホ版の処理をここで終了します
        return;
    }

    // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
    const apiBase = getApiBaseUrl();
    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast('🔄 Pythonサーバー / MySQLから最新データを再読込中...');

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/health）へ非同期リクエストを送信し、応答を待ち受けます
        const healthRes = await fetch(`${apiBase}/api/health`, { cache: 'no-store' });
        // 条件（!healthRes.ok）が成り立つか判定し、該当する場合の処理を実行します
        if (!healthRes.ok) {
            // 処理を中断して呼び出し元の catch へエラー内容（throw new Error('サーバーエラー');）を渡します
            throw new Error('サーバーエラー');
        }
        // 定数 healthData を宣言し、値（await healthRes.json()）をセットします
        const healthData = await healthRes.json();
        // 条件（healthData.mysql !== 'connected'）が成り立つか判定し、該当する場合の処理を実行します
        if (healthData.mysql !== 'connected') {
            // 関連処理 syncOrdersFromBackend() を呼び出して処理・画面を更新します
            await syncOrdersFromBackend();
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ XAMPPでMySQLが起動していません。XAMPPコントロールパネルでMySQLをStartしてください。');
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }

        // 定数 refreshedUser を宣言し、値（await restoreAuthSessionFromBackend()）をセットします
        const refreshedUser = await restoreAuthSessionFromBackend();
        // 条件（!refreshedUser）が成り立つか判定し、該当する場合の処理を実行します
        if (!refreshedUser) {
            // 関連処理 applyAccountSession() を呼び出して処理・画面を更新します
            await applyAccountSession(null);
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ セッションが切れています。再度ログインしてください');
            // 変数・配列項目 window.location.hash の値を更新・計算します
            window.location.hash = '#login';
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
        // アプリ全体状態 AppState.currentUser を最新値（refreshedUser）に更新します
        AppState.currentUser = refreshedUser;
        // 条件（typeof updateAuthNavUI === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateAuthNavUI === 'function') updateAuthNavUI();

        // ログインユーザーの複数データを MySQL バックエンドから並列（同時）に読み込んで完了を待ちます
        await Promise.all([
            // 関連処理 syncOrdersFromBackend() を呼び出して処理・画面を更新します
            syncOrdersFromBackend(),
            // 関連処理 syncFavoritesFromBackend() を呼び出して処理・画面を更新します
            syncFavoritesFromBackend(),
            // 関連処理 syncCartFromBackend() を呼び出して処理・画面を更新します
            syncCartFromBackend(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncClosetFromBackend === 'function') ? syncClosetFromBackend() : Promise.resolve(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncOutfitsFromBackend === 'function') ? syncOutfitsFromBackend() : Promise.resolve(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncStudioStateFromBackend === 'function') ? syncStudioStateFromBackend() : Promise.resolve()
        ]);

        // 関連処理 renderMyPage() を呼び出して処理・画面を更新します
        renderMyPage();
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast(`✨ MySQLから最新データを再読込しました！（注文:${AppState.orderHistory.length}件, 服:${AppState.myCloset.length}点, コーデ:${AppState.savedOutfits.length}件, 保有:${getUserPoints().toLocaleString()}pt）`);
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (err) {
        // 関連処理 syncOrdersFromBackend() を呼び出して処理・画面を更新します
        await syncOrdersFromBackend();
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ Pythonサーバー(ポート8080)またはMySQLに接続できません。起動状態を確認してください');
    }
}

// ==========================================================================
// 【関数】renderMyPage()
// 【役割】マイページ画面（会員ランク、ポイント、過去の買い物、お気に入りの服など）を綺麗に並べるマイページ案内係
// 【具体的な処理内容】
//   ・現在の会員ランクや保有ポイント数、過去に買った注文履歴の一覧表、
//     お気に入り商品などを綺麗に整えて画面に表示します
// ==========================================================================
function renderMyPage() {
    // HTML 要素 #mypage-user-name を取得して変数 userNameEl に格納します
    const userNameEl = document.getElementById('mypage-user-name');
    // HTML 要素 #mypage-user-email を取得して変数 userEmailEl に格納します
    const userEmailEl = document.getElementById('mypage-user-email');
    // HTML 要素 #mypage-avatar-initial を取得して変数 avatarEl に格納します
    const avatarEl = document.getElementById('mypage-avatar-initial');
    // HTML 要素 #mypage-user-rank を取得して変数 rankEl に格納します
    const rankEl = document.getElementById('mypage-user-rank');
    // HTML 要素 #mypage-points を取得して変数 pointsEl に格納します
    const pointsEl = document.getElementById('mypage-points');
    // HTML 要素 #mypage-actions-wrapper を取得して変数 actionsWrapper に格納します
    const actionsWrapper = document.getElementById('mypage-actions-wrapper');
    // HTML 要素 #orders-table-body を取得して変数 ordersTbody に格納します
    const ordersTbody = document.getElementById('orders-table-body');
    // HTML 要素 #mypage-order-count を取得して変数 orderCountEl に格納します
    const orderCountEl = document.getElementById('mypage-order-count');
    // HTML 要素 #mypage-fav-count を取得して変数 mypageFavCount に格納します
    const mypageFavCount = document.getElementById('mypage-fav-count');
    // HTML 要素 #mypage-fav-grid を取得して変数 mypageFavGrid に格納します
    const mypageFavGrid = document.getElementById('mypage-fav-grid');

    // 条件（AppState.currentUser）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser) {
        // 条件（userNameEl）が成り立つか判定し、該当する場合の処理を実行します
        if (userNameEl) userNameEl.textContent = AppState.currentUser.name || '会員 様';
        // 条件（userEmailEl）が成り立つか判定し、該当する場合の処理を実行します
        if (userEmailEl) userEmailEl.textContent = AppState.currentUser.email || '';
        // 条件（avatarEl）が成り立つか判定し、該当する場合の処理を実行します
        if (avatarEl) avatarEl.textContent = (AppState.currentUser.name || 'M').charAt(0);
        // 条件（rankEl）が成り立つか判定し、該当する場合の処理を実行します
        if (rankEl) rankEl.textContent = AppState.currentUser.rank || 'REGULAR MEMBER';
        // 条件（pointsEl）が成り立つか判定し、該当する場合の処理を実行します
        if (pointsEl) pointsEl.innerHTML = `${getUserPoints().toLocaleString()} <span class="stat-unit">pt</span>`;
        // 条件（actionsWrapper）が成り立つか判定し、該当する場合の処理を実行します
        if (actionsWrapper) {
            // ログアウトボタンを分かりやすく赤枠アイコン付きで描画します
            actionsWrapper.innerHTML = `
                <button type="button" class="btn btn-outline-danger btn-sm" id="logout-btn" onclick="handleLogout()" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-weight: 600;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    ログアウト
                </button>
            `;
        }
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 条件（userNameEl）が成り立つか判定し、該当する場合の処理を実行します
        if (userNameEl) userNameEl.textContent = 'ゲスト 様';
        // 条件（userEmailEl）が成り立つか判定し、該当する場合の処理を実行します
        if (userEmailEl) userEmailEl.textContent = 'ログインしていません';
        // 条件（avatarEl）が成り立つか判定し、該当する場合の処理を実行します
        if (avatarEl) avatarEl.textContent = 'G';
        // 条件（rankEl）が成り立つか判定し、該当する場合の処理を実行します
        if (rankEl) rankEl.textContent = 'GUEST';
        // 条件（pointsEl）が成り立つか判定し、該当する場合の処理を実行します
        if (pointsEl) pointsEl.innerHTML = `0 <span class="stat-unit">pt</span>`;
        // 条件（actionsWrapper）が成り立つか判定し、該当する場合の処理を実行します
        if (actionsWrapper) {
            // 未ログイン時はログインおよび新規登録ボタンを表示します
            actionsWrapper.innerHTML = `
                <a href="#login" class="btn btn-primary btn-sm" id="mypage-action-btn" style="padding: 6px 14px; margin-right: 6px;">ログイン</a>
                <a href="#register" class="btn btn-outline-dark btn-sm" style="padding: 6px 14px;">新規会員登録</a>
            `;
        }
    }

    // 定数 orderCount を宣言し、値（Array.isArray(AppState.orderHistory) ?…）をセットします
    const orderCount = Array.isArray(AppState.orderHistory) ? AppState.orderHistory.length : 0;
    // 条件（orderCountEl）が成り立つか判定し、該当する場合の処理を実行します
    if (orderCountEl) {
        // テンプレートリテラルで組み立てた HTML を要素 orderCountEl 内に書き込んで画面を更新します
        orderCountEl.innerHTML = `${orderCount} <span class="stat-unit">回</span>`;
    }

    // 保有クーポン枚数の更新（初期配布クーポンなど）
    const mypageCouponCount = document.getElementById('mypage-coupon-count');
    // クーポン枚数表示枠がある場合
    if (mypageCouponCount) {
        // 未使用のクーポン（!c.is_used）だけを絞り込んで数えます
        const activeCoupons = (AppState.userCoupons || []).filter(c => !c.is_used);
        // マイページ画面に「○ 枚」と書き込みます
        mypageCouponCount.innerHTML = `${activeCoupons.length} <span class="stat-unit">枚</span>`;
    }

    // 注文履歴見出し横のアカウント表示バッジ（誰の注文履歴か明示）
    const ordersAccountBadge = document.getElementById('orders-account-badge');
    // バッジ要素がある場合
    if (ordersAccountBadge) {
        // ログイン中の場合
        if (AppState.currentUser) {
            // 「お名前 様（○件）」の文字をセットします
            ordersAccountBadge.textContent = `${AppState.currentUser.name} 様 (${orderCount}件)`;
            // バッジを表示（inline-block）にします
            ordersAccountBadge.style.display = 'inline-block';
            // 未ログインの場合
        } else {
            // バッジを非表示にします
            ordersAccountBadge.style.display = 'none';
        }
    }

    // 条件（mypageFavCount）が成り立つか判定し、該当する場合の処理を実行します
    if (mypageFavCount) {
        // 定数 favCount を宣言し、値（Array.isArray(AppState.favorites) ? Ap…）をセットします
        const favCount = Array.isArray(AppState.favorites) ? AppState.favorites.length : 0;
        // テンプレートリテラルで組み立てた HTML を要素 mypageFavCount 内に書き込んで画面を更新します
        mypageFavCount.innerHTML = `${favCount} <span class="stat-unit">点</span>`;
    }

    // 条件（ordersTbody）が成り立つか判定し、該当する場合の処理を実行します
    if (ordersTbody) {
        // 未ログイン時の専用メッセージ（ログイン案内）
        if (!AppState.currentUser) {
            ordersTbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 36px 20px; color: #555;">
                        <div style="font-weight: 700; margin-bottom: 6px; font-size: 1rem;">ログインしていません</div>
                        <div style="font-size: 0.88rem; color: #777; margin-bottom: 14px;">ご購入履歴やクーポンの確認にはログインが必要です。</div>
                        <a href="#login" class="btn btn-primary btn-sm" style="padding: 6px 16px;">ログインして購入履歴を表示</a>
                    </td>
                </tr>
            `;
            // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
        } else if (!AppState.orderHistory || AppState.orderHistory.length === 0) {
            // テンプレートリテラルで組み立てた HTML を要素 ordersTbody 内に書き込んで画面を更新します
            ordersTbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px; color: #777;">
                        購入履歴はまだありません。商品をお選びいただき購入手続きをお試しください。
                    </td>
                </tr>
            `;
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 生成・変換した HTML 文字列を要素 ordersTbody の中身として描画します（購入者列・クーポン割引を追加）
            ordersTbody.innerHTML = AppState.orderHistory.map((order, idx) => `
                <tr>
                    <td><strong>${order.order_no}</strong></td>
                    <td>
                        <div style="font-weight: 700; color: #111;">${order.customer_name || AppState.currentUser?.name || "会員様"}</div>
                        <div style="font-size: 0.72rem; color: #888;">${order.customer_email || ""}</div>
                    </td>
                    <td>${order.date}</td>
                    <td>
                        <div>${order.items_summary || "ご注文商品"}</div>
                        ${order.coupon_discount ? `<div style="font-size: 0.72rem; color: #ea580c; font-weight: 600; margin-top: 2px;">🎫 クーポン割引: -¥${Number(order.coupon_discount).toLocaleString()}</div>` : ''}
                        <button class="btn btn-outline-xs mt-1" onclick="importOrderToCloset(${idx})" style="font-size: 0.72rem; padding: 2px 8px; margin-top: 4px;" title="購入した服をマイクローゼットへ登録">
                            + クローゼットへ登録
                        </button>
                    </td>
                    <td>
                        <strong>¥${(order.total_amount || 0).toLocaleString()}</strong>
                        <div style="font-size: 0.7rem; color: #888;">(うち送料 ¥${(order.shipping_fee !== undefined ? order.shipping_fee : (order.subtotal >= 5000 ? 0 : 550)).toLocaleString()})</div>
                    </td>
                    <td><span class="status-badge">${order.status || "発送準備中"}</span></td>
                </tr>
            `).join('');
        }
    }

    // 条件（mypageFavGrid）が成り立つか判定し、該当する場合の処理を実行します
    if (mypageFavGrid) {
        // 定数 favList を宣言し、値（Array.isArray(AppState.favorites) ? Ap…）をセットします
        const favList = Array.isArray(AppState.favorites) ? AppState.favorites : [];
        // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して favoriteItems に入れます
        const favoriteItems = SAMPLE_PRODUCTS.filter(p => favList.includes(p.id));
        // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
        if (favoriteItems.length === 0) {
            // 生成・変換した HTML 文字列を要素 mypageFavGrid の中身として描画します
            mypageFavGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 24px; color: #777;">お気に入り登録された商品はありません。</p>';
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 生成・変換した HTML 文字列を要素 mypageFavGrid の中身として描画します
            mypageFavGrid.innerHTML = favoriteItems.slice(0, 4).map(p => createProductCardHTML(p)).join('');
        }
    }
}


// 再代入可能な変数 _favoritesMutationSeq を宣言し、値（0）をセットします
let _favoritesMutationSeq = 0;

// ==========================================================================


// ==========================================================================
//  第6章：お気に入り（ハートマーク）機能・マイページ描画
//  【このセクションの役割】
//  ・商品のハートボタンを押したときの登録／解除トグル処理
//  ・画面上のすべてのハートボタンの見た目同期と、ヘッダー件数バッジの更新
//  ・マイページ（会員ランク、ポイント残高、注文履歴、お気に入り服）の描画
// ==========================================================================
// 【関数】getOwnedProductIds()
// 【役割】自分のクローゼットに入っている服の番号一覧をサッと調べる手持ち服チェック係
// 【具体的な処理内容】
//   ・すでに自分が持っている服のIDを調べてリストで返します
// ==========================================================================
function getOwnedProductIds() {
    // 重複のない商品ID一覧を保存するSetオブジェクトを作成します
    const ownedIds = new Set();
    // クローゼット内の服一覧が配列として存在する場合
    if (Array.isArray(AppState.myCloset)) {
        // クローゼット内の服を1着ずつループ処理します
        AppState.myCloset.forEach(c => {
            // 服に元のブランド商品ID（productId）が記録されている場合
            if (c.productId) {
                // その商品IDを数値としてSetに追加します
                ownedIds.add(Number(c.productId));
            }
            // 商品マスターが存在し、服の名前がある場合
            if (typeof SAMPLE_PRODUCTS !== 'undefined' && c.name) {
                // 商品マスターの中から同じ名前の商品を探します
                const matched = SAMPLE_PRODUCTS.find(p => p.name === c.name);
                // 見つかった場合はその商品IDもSetに追加します
                if (matched) {
                    ownedIds.add(matched.id);
                }
            }
        });
    }
    // 集めた手持ち服の商品ID一覧（Set）を返却します
    return ownedIds;
}
window.getOwnedProductIds = getOwnedProductIds;

// ==========================================================================
// 【関数】cleanPurchasedFavorites(purchasedIds)
// 【役割】服を買い終わったあとに、買った服をお気に入り一覧から自動で外してあげるお気に入り整理係
// 【具体的な処理内容】
//   ・「もう買った服」はお気に入りに入れておく必要がないため、自動で整理します
// ==========================================================================
function cleanPurchasedFavorites(purchasedIds) {
    // お気に入り一覧が配列でない場合は処理を行わず終了します
    if (!Array.isArray(AppState.favorites)) return false;
    // 今回削除対象とする商品IDの配列を用意します
    let targetIds = [];
    // 買った商品のID一覧が配列で渡された場合
    if (Array.isArray(purchasedIds) && purchasedIds.length > 0) {
        // 有効な正の数値IDだけを抽出して配列にします
        targetIds = purchasedIds.map(id => Number(id)).filter(id => !isNaN(id) && id > 0);
    }
    // 削除対象の商品IDが1つもなければ何もせず終了します
    if (targetIds.length === 0) return false;

    // 高速検索用に対象ID一覧をSetオブジェクトにします
    const targetSet = new Set(targetIds);
    // 1件でもお気に入りから削除されたかを記録するフラグです
    let removedAny = false;
    // 実際に削除された商品IDを記録する配列です
    const removedIds = [];
    // お気に入り配列から買った商品を除外（filter）します
    AppState.favorites = AppState.favorites.filter(id => {
        // 数値IDに変換します
        const numId = Number(id);
        // 今回買った商品IDに含まれている場合
        if (targetSet.has(numId)) {
            // 削除フラグをtrueにします
            removedAny = true;
            // 削除リストに追加します
            removedIds.push(numId);
            // 画面上のハートボタンをOFF（未選択）状態に同期します
            syncAllFavoriteButtons(numId, false);
            // filterで除外するためfalseを返します
            return false;
        }
        // 残す商品はtrueを返します
        return true;
    });

    // 1件以上お気に入りから削除された場合
    if (removedAny) {
        // スマホ版の場合はlocalStorageのお気に入りデータを更新保存します
        if (AppState.currentUser && isMobileLocalStorageMode()) {
            lsSetJson(`manekin_ls_favorites_${AppState.currentUser.id}`, AppState.favorites);
            // PC版（MySQL）の場合はサーバーのお気に入りテーブルからも削除します
        } else if (AppState.currentUser && isServerUserId(AppState.currentUser.id)) {
            // 削除された商品IDを1件ずつサーバーへ削除リクエスト送信します
            removedIds.forEach(pId => {
                try {
                    // APIへ削除リクエストを送ります
                    fetch(`${getApiBaseUrl()}/api/favorites/remove`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ product_id: pId, user_id: AppState.currentUser.id })
                    }).catch(() => { });
                } catch (_) { }
            });
        }
        // ナビバーやヘッダーのお気に入りバッジ数を最新化します
        updateFavoriteBadges();
        // スタジオのお気に入りバッジも更新します
        if (typeof updateStudioBadges === 'function') updateStudioBadges();
    }
    // 削除が行われたかどうか（true/false）を返却します
    return removedAny;
}
window.cleanPurchasedFavorites = cleanPurchasedFavorites;

// ==========================================================================
// 【関数】syncFavoritesFromBackend()
// 【役割】データベースから「ハートを付けたお気に入りの服」の一覧を取り寄せるお気に入り集め係
// 【具体的な処理内容】
//   ・自分がハートを付けた服の一覧をサーバーから読み込んで、
//     画面上のハートマークを赤色（ON）にします
// ==========================================================================
async function syncFavoritesFromBackend() {
    // 未ログイン時はゲスト用ストレージから復元します
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        try {
            // 端末のlocalStorageからゲスト用のお気に入りJSON文字列を取り出します
            const guestFavs = JSON.parse(localStorage.getItem('manekin_guest_favorites') || '[]');
            // 配列であれば数値型に変換してお気に入り配列に入れます
            if (Array.isArray(guestFavs)) {
                AppState.favorites = guestFavs.map(id => Number(id));
            }
        } catch (_) { }
        // ヘッダーやナビのお気に入りバッジ件数を更新します
        updateFavoriteBadges();
        // ここで処理を終了します
        return;
    }
    // ログイン中の会員IDを取得します
    const targetUserId = AppState.currentUser.id;

    // スマホ版の場合は localStorage からお気に入り一覧を取得します
    if (isMobileLocalStorageMode()) {
        // localStorageからこの会員専用のお気に入り配列を取り出します
        const savedFavs = lsGetJson(`manekin_ls_favorites_${targetUserId}`, []);
        // 数値型に変換してお気に入り一覧にセットします
        AppState.favorites = Array.isArray(savedFavs) ? savedFavs.map(id => Number(id)) : [];
        // お気に入り件数バッジを更新します
        updateFavoriteBadges();
        // 商品詳細モーダルが開いていれば詳細のハートボタン表示を同期します
        if (AppState.currentDetailId && typeof syncAllFavoriteButtons === 'function') {
            syncAllFavoriteButtons(AppState.currentDetailId, AppState.favorites.includes(AppState.currentDetailId));
        }
        // スタジオのブランド一覧を再描画します
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        // スタジオのお気に入りグリッドを再描画します
        if (typeof renderStudioFavoritesGrid === 'function') renderStudioFavoritesGrid();
        // お気に入り一覧画面を再描画します
        if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
        // ホーム画面の商品一覧を再描画します
        if (typeof renderHomeProducts === 'function') renderHomeProducts();
        // カタログ画面の商品一覧を再描画します
        if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
        // 新着商品一覧を再描画します
        if (typeof renderNewItems === 'function') renderNewItems();
        // マイページ画面を再描画します
        if (typeof renderMyPage === 'function') renderMyPage();
        // スマホ版の処理をここで終了します
        return;
    }

    // 定数 fetchStartSeq を宣言し、値（_favoritesMutationSeq）をセットします
    const fetchStartSeq = _favoritesMutationSeq;
    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/favorites）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${getApiBaseUrl()}/api/favorites?user_id=${targetUserId}`, {
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include',
            // ブラウザが昔の通信結果をキャッシュ再利用しないよう 'no-store' を指定します
            cache: 'no-store'
        });
        // 条件（res.ok）が成り立つか判定し、該当する場合の処理を実行します
        if (res.ok) {
            // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
            const data = await res.json();
            // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;
            // 条件（fetchStartSeq !== _favoritesMutationSeq）が成り立つか判定し、該当する場合の処理を実行します
            if (fetchStartSeq !== _favoritesMutationSeq) return;
            // 条件（Array.isArray(data.favorites)）が成り立つか判定し、該当する場合の処理を実行します
            if (Array.isArray(data.favorites)) {
                // アプリ全体状態 AppState.favorites を最新値（data.favorites）に更新します
                AppState.favorites = data.favorites.map(id => Number(id));
                // 関連処理 updateFavoriteBadges() を呼び出して処理・画面を更新します
                updateFavoriteBadges();
                // 条件（AppState.currentDetailId && typeof syncAllFavoriteBu…）が成り立つか判定し、該当する場合の処理を実行します
                if (AppState.currentDetailId && typeof syncAllFavoriteButtons === 'function') {
                    // 関連処理 syncAllFavoriteButtons() を呼び出して処理・画面を更新します
                    syncAllFavoriteButtons(AppState.currentDetailId, AppState.favorites.includes(AppState.currentDetailId));
                }
                // 条件（typeof renderStudioBrandList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
                if (typeof renderStudioFavoritesGrid === 'function') renderStudioFavoritesGrid();
                // 条件（typeof renderFavoriteProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
                // 条件（typeof renderHomeProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderHomeProducts === 'function') renderHomeProducts();
                // 条件（typeof renderCatalogProducts === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
                // 条件（typeof renderNewItems === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderNewItems === 'function') renderNewItems();
                // 条件（typeof renderMyPage === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderMyPage === 'function') renderMyPage();
            }
        }
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLお気に入り取得エラー:', e);
    }
}

// ==========================================================================
// 【関数】handleToggleFavorite(productId)
// 【役割】服のカードの「ハート」ボタンが押されたときに、お気に入りの追加と解除をパチパチ切り替えるハート係
// 【具体的な処理内容】
//   ・お気に入りに入っていなければ追加、すでに入っていれば解除して、
//     サーバーに保存しハートの見た目を切り替えます
// ==========================================================================
async function handleToggleFavorite(productId) {
    // 引数の商品IDを数値型に変換します
    const numId = Number(productId);
    // 正しい数値でない場合は処理を中止します
    if (!numId || isNaN(numId)) return;

    // お気に入り一覧が配列でなければ空配列で初期化します
    if (!Array.isArray(AppState.favorites)) {
        AppState.favorites = [];
    }

    // 変数・配列項目 _favoritesMutationSeq の値を更新・計算します
    _favoritesMutationSeq++;

    // 1. 即座にUIを楽観的更新（色を即座に反転、バッジ更新）
    // すでにお気に入り配列に含まれているかを検索します
    const existingIndex = AppState.favorites.findIndex(f => Number(f) === numId);
    // 追加したか解除したかを保持するフラグ変数です
    let isAdded = false;
    // まだお気に入りに入っていなかった場合（追加処理）
    if (existingIndex === -1) {
        // お気に入り配列の末尾に商品IDを追加します
        AppState.favorites.push(numId);
        // 追加フラグをtrueにします
        isAdded = true;
        // すでにお気に入りに入っていた場合（解除処理）
    } else {
        // お気に入り配列からその商品IDを削除します
        AppState.favorites.splice(existingIndex, 1);
        // 追加フラグをfalse（解除）にします
        isAdded = false;
    }
    console.log(`❤️ [Favorite] トグル実行: productId=${numId}, isAdded=${isAdded}, 現在のお気に入り一覧=`, AppState.favorites);

    // ボタンの見た目（赤ハート・解除）とバッジを即座に同期します
    syncAllFavoriteButtons(numId, isAdded);
    // ヘッダーやナビのお気に入りバッジ数を更新します
    updateFavoriteBadges();
    // スタジオのお気に入りバッジを更新します
    if (typeof updateStudioBadges === 'function') updateStudioBadges();
    // スタジオのブランド一覧画面を更新します
    if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
    // お気に入り一覧画面を開いている場合は一覧を再描画します
    if (window.location.hash === '#favorites') renderFavoriteProducts();
    // マイページ画面を再描画します
    if (typeof renderMyPage === 'function') renderMyPage();

    // 2. ログイン状態に応じた永続化処理
    // 未ログインの場合の処理
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        try {
            // ゲスト用のlocalStorageにお気に入り配列をJSON文字列として保存します
            localStorage.setItem('manekin_guest_favorites', JSON.stringify(AppState.favorites));
        } catch (_) { }
        // 画面に「お気に入りに追加/解除しました」とトースト通知を表示します
        showToast(isAdded ? 'お気に入りに追加しました（ログインすると会員データに保存されます）' : 'お気に入りから解除しました');
        // 未ログイン時はここで終了します
        return;
    }

    // ログイン中の会員IDを取得します
    const targetUserId = AppState.currentUser.id;

    // スマホ版 localStorage モードの場合
    if (isMobileLocalStorageMode()) {
        // localStorageのこの会員のお気に入りデータを保存します
        lsSetJson(`manekin_ls_favorites_${targetUserId}`, AppState.favorites);
        // 画面にトースト通知を表示します
        showToast(isAdded ? 'お気に入りに追加しました' : 'お気に入りから解除しました');
        // スマホ版の処理をここで終了します
        return;
    }

    // PC版 MySQL モード（Pythonサーバーへリクエスト送信）
    try {
        // バックエンドAPI（/api/favorites/toggle）へPOST送信してお気に入りをMySQLに保存します
        const res = await fetch(`${getApiBaseUrl()}/api/favorites/toggle`, {
            // POSTメソッドを指定します
            method: 'POST',
            // 送信形式をJSONに指定します
            headers: { 'Content-Type': 'application/json' },
            // ログインCookieを一緒に送信します
            credentials: 'include',
            // 送信ボディに商品ID、会員ID、追加/解除アクションをセットします
            body: JSON.stringify({
                product_id: numId,
                user_id: targetUserId,
                action: isAdded ? 'add' : 'remove'
            })
        });
        // サーバー通信がエラーなら例外を投げます
        if (!res.ok) throw new Error('Favorite toggle API response not ok');
        // レスポンスのJSONデータを受け取ります
        const data = await res.json().catch(() => ({}));
        // 画面にトースト通知を表示します
        showToast(isAdded ? 'お気に入りに追加しました' : 'お気に入りから解除しました');
        // 通信エラー時のフォールバック処理
    } catch (e) {
        // コンソールにエラー警告を出力します
        console.warn('MySQLお気に入り更新エラー (フォールバック保存):', e);
        try {
            // サーバーエラー時でも端末のlocalStorageに保存して保護します
            lsSetJson(`manekin_ls_favorites_${targetUserId}`, AppState.favorites);
        } catch (_) { }
        // 画面にトースト通知を表示します
        showToast(isAdded ? 'お気に入りに追加しました' : 'お気に入りから解除しました');
    }
}

// ==========================================================================
// 【関数】syncAllFavoriteButtons(productId, isFavorite)
// 【役割】画面上にある同じ服のハートボタンの見た目（赤色／白抜き）をぜんぶ一斉に揃えるハート合わせ係
// 【具体的な処理内容】
//   ・トップ画面、一覧画面、詳細画面などで同じ商品のハートマークが
//     ズレないよう、すべて同時にON/OFF切り替えます
// ==========================================================================
function syncAllFavoriteButtons(productId, isFavorite) {
    // 比較できるように商品IDを確実に数値（数値型）に変換します
    const numId = Number(productId);
    // 画面内にあるすべての商品カード要素（.product-card）をまとめて取得します
    const cards = document.querySelectorAll('.product-card');
    // 取得した商品カードを1枚ずつ順番にチェックして処理します
    cards.forEach(card => {
        // カードの data-id 属性から商品ID文字列を取得します
        const rawId = card.getAttribute('data-id') || card.getAttribute('data - id');
        // このカードの商品IDが、今お気に入り変更された商品IDと一致しているか判定します
        if (rawId && Number(rawId) === numId) {
            // カード内にあるお気に入りボタン（ハートボタン）を取得します
            const btn = card.querySelector('.fav-btn');
            // ボタンが見つかった場合の処理を行います
            if (btn) {
                // ボタンの中にあるハートのSVGアイコン画像を取得します
                const svg = btn.querySelector('svg');
                // お気に入り状態がON（追加）の場合の処理です
                if (isFavorite) {
                    // ボタンに is-favorite クラスを付与して赤色デザインを適用します
                    btn.classList.add('is-favorite');
                    // 視覚障がい者向け音声読み上げ用ラベルを「お気に入りを解除」に設定します
                    btn.setAttribute('aria-label', 'お気に入りを解除');
                    // ハートアイコンが存在していれば中身を赤色に塗りつぶします
                    if (svg) {
                        // SVGの塗りつぶし色を赤色（#e53935）にします
                        svg.setAttribute('fill', '#e53935');
                        // SVGの枠線色も赤色（#e53935）にします
                        svg.setAttribute('stroke', '#e53935');
                    }
                    // お気に入り状態がOFF（解除）の場合の処理です
                } else {
                    // ボタンから is-favorite クラスを外して通常デザインに戻します
                    btn.classList.remove('is-favorite');
                    // 視覚障がい者向け音声読み上げ用ラベルを「お気に入りに追加」に設定します
                    btn.setAttribute('aria-label', 'お気に入りに追加');
                    // ハートアイコンが存在していれば白抜き（透明）に戻します
                    if (svg) {
                        // SVGの塗りつぶし色を透明（none）にします
                        svg.setAttribute('fill', 'none');
                        // SVGの枠線色を現在の文字色（黒や灰色）に戻します
                        svg.setAttribute('stroke', 'currentColor');
                    }
                }
            }
        }
    });

    // 商品詳細モーダル／画面内にある大きなハートボタン要素を取得します
    const detailFavBtn = document.getElementById('detail-fav-btn');
    // 詳細画面のお気に入りボタンが存在し、かつ現在開いている商品IDと一致するか判定します
    if (detailFavBtn && Number(AppState.currentDetailId) === numId) {
        // お気に入り状態がON（追加）の場合の処理です
        if (isFavorite) {
            // 詳細ボタンに is-favorite クラスを付与します
            detailFavBtn.classList.add('is-favorite');
            // 赤色に塗りつぶしたハートと「お気に入り解除」の文字HTMLをセットします
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#e53935" stroke="#e53935" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                お気に入り解除
            `;
            // お気に入り状態がOFF（解除）の場合の処理です
        } else {
            // 詳細ボタンから is-favorite クラスを削除します
            detailFavBtn.classList.remove('is-favorite');
            // 白抜きのハートと「お気に入りに追加」の文字HTMLをセットします
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                お気に入りに追加
            `;
        }
    }
}

// ==========================================================================
// 【関数】updateFavoriteBadges()
// 【役割】画面上部のハートマークについている「お気に入りの件数」の数字を最新にするバッジ更新係
// 【具体的な処理内容】
//   ・現在お気に入りに入っている服の合計数を数えて、バッジの数字を書き換えます
// ==========================================================================
function updateFavoriteBadges() {
    // 定数 count を宣言し、値（AppState.favorites.length）をセットします
    const count = Array.isArray(AppState.favorites) ? AppState.favorites.length : 0;
    // HTML 要素 #nav-fav-badge を取得して変数 navBadge に格納します
    const navBadge = document.getElementById('nav-fav-badge');
    // HTML 要素 #icon-fav-badge を取得して変数 iconBadge に格納します
    const iconBadge = document.getElementById('icon-fav-badge');
    // HTML 要素 #mypage-fav-count を取得して変数 mypageFavCount に格納します
    const mypageFavCount = document.getElementById('mypage-fav-count');
    // HTML 要素 #studio-fav-badge を取得して変数 studioFavBadge に格納します
    const studioFavBadge = document.getElementById('studio-fav-badge');
    // HTML 要素 #mob-brand-fav-cnt を取得して変数 mobBrandFavCnt に格納します
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');

    // 条件（navBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (navBadge) navBadge.textContent = count;
    // 条件（iconBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (iconBadge) iconBadge.textContent = count;
    // 条件（mypageFavCount）が成り立つか判定し、該当する場合の処理を実行します
    if (mypageFavCount) mypageFavCount.innerHTML = `${count} <span class="stat-unit">点</span>`;
    // 条件（studioFavBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (studioFavBadge) studioFavBadge.textContent = count;
    // 条件（mobBrandFavCnt）が成り立つか判定し、該当する場合の処理を実行します
    if (mobBrandFavCnt) mobBrandFavCnt.textContent = count;
}

// ==========================================================================
// 【関数】renderFavoriteProducts()
// 【役割】お気に入り画面（#favorites）にハートマークを付けた服をずらりと並べて見せるコレクション係
// 【具体的な処理内容】
//   ・ハートを付けた服だけを並べて表示します（0件の場合は「お気に入りはまだありません」と表示）
// ==========================================================================
function renderFavoriteProducts() {
    // HTML 要素 #favorite-product-grid を取得して変数 favGrid に格納します
    const favGrid = document.getElementById('favorite-product-grid');
    // 条件（!favGrid）が成り立つか判定し、該当する場合の処理を実行します
    if (!favGrid) return;

    // お気に入り配列（AppState.favorites）を安全に配列として取得します
    const favList = Array.isArray(AppState.favorites) ? AppState.favorites : [];
    // 全商品（SAMPLE_PRODUCTS）の中から、お気に入りに入っている商品IDと一致するものだけを抜き出します
    const favoriteItems = SAMPLE_PRODUCTS.filter(p => favList.some(f => Number(f) === Number(p.id)));

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (favoriteItems.length === 0) {
        // テンプレートリテラルで組み立てた HTML を要素 favGrid 内に書き込んで画面を更新します
        favGrid.innerHTML = `
            <div class="empty-state">
                <h2 class="empty-state-title">お気に入りはまだありません</h2>
                <p class="empty-state-text">気になるアイテムを見つけたら、ハートマークを押してお気に入りに追加しましょう。</p>
                <a href="#items" class="btn btn-primary">商品一覧を見る</a>
            </div>
        `;
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 抜き出した商品を1つずつカードHTMLに変換し、まとめてお気に入りグリッドに並べて描画します
        favGrid.innerHTML = favoriteItems.map(p => createProductCardHTML(p)).join('');
    }
}

// ==========================================================================


// ==========================================================================
//  第7章：会員認証（ログイン・新規登録・デモログイン・ログアウト）
//  【このセクションの役割】
//  ・ヘッダーのログイン状態表示（ログインボタン／〇〇様マイページ）の切り替え
//  ・メールアドレス＆パスワードでの通常ログイン、新規会員登録
//  ・ワンクリックお試しデモログイン、ログアウト処理
//  ・認証完了後に確実にホーム画面へ安全に戻す処理（redirectToHome）
// ==========================================================================
// 【関数】updateAuthNavUI()
// 【役割】ログインしているかどうかに応じて、右上のボタン（ログイン／マイページ）を切り替えるヘッダー案内係
// 【具体的な処理内容】
//   ・未ログインなら「ログイン / 会員登録」ボタンを表示
//   ・ログイン中なら「〇〇様（マイページ）」とログアウトボタンを表示します
// ==========================================================================
function updateAuthNavUI() {
    // HTML 要素 #nav-auth-link を取得（ナビから削除された場合は null）
    const authLink = document.getElementById('nav-auth-link');
    // HTML 要素 #mobile-login-link を取得（ナビから削除された場合は null）
    const mobileLoginLink = document.getElementById('mobile-login-link');
    // HTML 要素 #mobile-register-link を取得（ナビから削除された場合は null）
    const mobileRegisterLink = document.getElementById('mobile-register-link');
    // ヘッダーのユーザーアイコン（マイページ遷移）横のステータスドット
    const headerUserOnlineDot = document.getElementById('header-user-online-dot');
    // ヘッダーのユーザーアイコンボタン要素を取得します
    const headerUserBtn = document.getElementById('header-user-btn');

    // 条件（AppState.currentUser）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser) {
        // ログイン中の場合は緑色のオンラインランプ（ドット）を表示します
        if (headerUserOnlineDot) headerUserOnlineDot.style.display = 'block';
        // ユーザーアイコンにマウスを乗せたときのツールチップに会員名を表示します
        if (headerUserBtn) headerUserBtn.title = `${AppState.currentUser.name || '会員'} 様でログイン中（マイページへ）`;
        // PC版ナビゲーションのログインボタンを「LOGOUT」に書き換えます
        if (authLink) {
            // ボタンの文字を「LOGOUT」に変更します
            authLink.textContent = 'LOGOUT';
            // リンク先をJavaScriptダミーリンクにします
            authLink.href = 'javascript:void(0)';
            // クリック時にログアウト関数（handleLogout）を実行するよう登録します
            authLink.onclick = handleLogout;
        }
        // スマホ版引き出しメニューのログインボタンを「LOGOUT」に書き換えます
        if (mobileLoginLink) {
            // ボタンの文字を「LOGOUT (ログアウト)」に変更します
            mobileLoginLink.textContent = 'LOGOUT (ログアウト)';
            // リンク先をJavaScriptダミーリンクにします
            mobileLoginLink.href = 'javascript:void(0)';
            // クリック時にログアウト関数（handleLogout）を実行するよう登録します
            mobileLoginLink.onclick = handleLogout;
        }
        // ログイン中は新規会員登録リンクを非表示にして隠します
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'none';
        // 上記の if 条件に当てはまらなかった場合の分岐処理です（未ログイン・ゲスト）
    } else {
        // 未ログイン時は緑色のオンラインランプ（ドット）を非表示にして消します
        if (headerUserOnlineDot) headerUserOnlineDot.style.display = 'none';
        // ユーザーアイコンのツールチップを「マイページ / ログイン」に戻します
        if (headerUserBtn) headerUserBtn.title = 'マイページ / ログイン';
        // PC版ナビゲーションのボタンを「LOGIN」に戻します
        if (authLink) {
            // ボタンの文字を「LOGIN」に変更します
            authLink.textContent = 'LOGIN';
            // リンク先をログイン画面（#login）に設定します
            authLink.href = '#login';
            // ログアウト用クリックイベントを解除して通常の画面遷移に戻します
            authLink.onclick = null;
        }
        // スマホ版引き出しメニューのボタンを「LOGIN」に戻します
        if (mobileLoginLink) {
            // ボタンの文字を「LOGIN (ログイン)」に変更します
            mobileLoginLink.textContent = 'LOGIN (ログイン)';
            // リンク先をログイン画面（#login）に設定します
            mobileLoginLink.href = '#login';
            // ログアウト用クリックイベントを解除して通常の画面遷移に戻します
            mobileLoginLink.onclick = null;
        }
        // 未ログイン時は新規会員登録リンクを表示します
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'block';
    }
}

// ==========================================================================
// 【関数】handleLogout(e)
// 【役割】「ログアウト」ボタンが押されたときに、安全にサインアウトしてホームへ戻すお見送り係
// 【具体的な処理内容】
//   ・サーバーのログインセッションを終了し、データを初期化して、ホーム画面へ戻ります
// ==========================================================================
async function handleLogout(e) {
    // 条件（e && typeof e.preventDefault === 'function'）が成り立つか判定し、該当する場合の処理を実行します
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    // スマホ版のlocalStorageログインセッションをクリアします
    try {
        // 端末のlocalStorageから現在のログイン中ユーザーデータを削除します
        window.localStorage.removeItem('manekin_ls_current_user');
    } catch (e) { }

    // PC版の場合はバックエンド API（/api/auth/logout）へリクエストを送信します
    if (!isMobileLocalStorageMode()) {
        try {
            // サーバーのログアウトAPIを呼び出してセッションCookieを無効化します
            await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
                // POSTメソッドで送信します
                method: 'POST',
                // セッションCookieを送信してどの会員か伝えます
                credentials: 'include'
            });
        } catch (err) {
            // ログアウト通信エラーをコンソールに警告表示します
            console.warn('ログアウトAPI通信に失敗しました:', err);
        }
    }

    // 関連処理 applyAccountSession() を呼び出して処理・画面を更新します
    await applyAccountSession(null);
    // モバイルメニューが開いていれば閉じます
    if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
    // ログアウト完了後は確実にHOME画面へ戻る
    await redirectToHome(null);
    // ログアウト完了アラートを表示します
    alert('ログアウトしました');
    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast('ログアウトしました');
}

// ==========================================================================
// 【関数】redirectToHome(user, options = {})
// 【役割】ログインしたときやログアウトしたときに、確実にトップ画面（#home）へ安全に戻してあげる安全誘導係
// 【具体的な処理内容】
//   ・表示画面を `#home` に切り替えて、メニューの選択状態や商品一覧を再描画し、
//     ページ最上部へスクロールします
// ==========================================================================
async function redirectToHome(user, options = {}) {
    // ログイン前に一時保持していたリダイレクト先（購入画面など）を初期化してクリアします
    AppState.pendingAuthTarget = null;
    try {
        // セッションストレージの一時リダイレクト先を削除します
        sessionStorage.removeItem('manekin_pending_auth_target');
        // ローカルストレージの一時リダイレクト先を削除します
        localStorage.removeItem('manekin_pending_auth_target');
    } catch (e) { }

    // 1. 画面上の全ページ要素（.page-view）から active クラスを外して非表示にします
    const allViews = document.querySelectorAll('.page-view');
    // 全ページ要素を1つずつ巡回して active クラスを削除します
    allViews.forEach(v => v.classList.remove('active'));
    // トップ画面要素（#view-home）を取得します
    const homeView = document.getElementById('view-home');
    // トップ画面に active クラスを付与して画面に表示させます
    if (homeView) homeView.classList.add('active');

    // 2. メニューバーの全リンクから active クラスを外します
    const allNavs = document.querySelectorAll('.nav-link, .mobile-nav-link');
    // 全ナビゲーションリンクを1つずつ巡回して選択状態を解除します
    allNavs.forEach(n => n.classList.remove('active'));
    // HOMEメニューのリンク要素を取得します
    const homeNav = document.querySelector('.nav-link[data-nav="home"]');
    // HOMEメニューに active クラスを付けて下線や色を強調します
    if (homeNav) homeNav.classList.add('active');

    // 3. ブラウザのアドレスバーURLを #home に更新して履歴を同期します
    try {
        // 現在のハッシュが #home 以外なら #home に書き換えます
        if (window.location.hash !== '#home') {
            window.location.hash = '#home';
        }
    } catch (e) { }

    // 4. HOME画面のおすすめ商品カードを最新データで再描画します
    if (typeof renderHomeProducts === 'function') {
        // 商品描画関数を実行します（エラー時も安全に握りつぶします）
        try { renderHomeProducts(); } catch (err) { console.error(err); }
    }

    // 5. 画面のスクロール位置を最上部（トップ）へ即座に戻します
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { }

    // 6. ログインした会員へのウェルカムトースト通知を表示します
    if (user && !options.silentToast && typeof showToast === 'function') {
        // ようこそメッセージを画面右下に通知します
        showToast(`🎉 ログインしました！ようこそ、${user.name || '会員'} 様`);
    }

    // 7. ルーティング関数を呼び出して全体の状態を #home と完全に同期させます
    if (typeof handleRouting === 'function') {
        // #home のルート処理を実行します
        try { await handleRouting('#home'); } catch (e) { }
    }

    // 8. 念押しで最上部スクロール＆#view-homeアクティブ保証を行います
    if (homeView && !homeView.classList.contains('active')) {
        // 全ページから active を再度外します
        allViews.forEach(v => v.classList.remove('active'));
        // トップ画面を確実に active にします
        homeView.classList.add('active');
    }
    // 念押しでスクロール最上部へ戻します
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { }
}

// 互換用エイリアス
const navigateAfterAuth = redirectToHome;
window.redirectToHome = redirectToHome;

// ==========================================================================
// 【関数】handleDemoLogin(e)
// 【役割】「デモアカウントで簡単お試しログイン」ボタンが押されたときに、ワンクリックで体験ログインさせるお試し係
// 【具体的な処理内容】
//   ・メールアドレスやパスワードを入力せずに、ワンクリックでテスト用ゴールド会員としてログインします
//   ・データベース（MySQL / Pythonサーバー）に接続せず、
//     ローカル環境（localStorage）で即座にテストアカウントとしてログインします！
//   ・PC版・スマホ版・オフライン問わず、全機能（カート・注文・お気に入り・試着室等）が
//     データベース接続なしでサクサク快適に動作します。
// ==========================================================================
async function handleDemoLogin(e) {
    // リンクの標準ジャンプ動作をキャンセルします
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    // ログイン前に見ていたページ（購入手続きなど）を取得します
    const target = AppState.pendingAuthTarget || sessionStorage.getItem('manekin_pending_auth_target');
    // チェックアウト画面からのログインであればゲスト時のかご中身を保持します
    const preserveGuestCart = (target === 'checkout');

    // データベース接続を行わず、端末のlocalStorageから会員一覧を取得します
    const users = lsGetJsonDirect('manekin_ls_users', []);
    // 会員一覧の中からデモ用テストアカウントを探します
    let demoUser = users.find(u => u && (u.email === 'demo@manekin.jp' || u.isDemo));
    // まだテストアカウントが存在していなければ初期作成します
    if (!demoUser) {
        // テスト用デモユーザーオブジェクトを作成します
        demoUser = {
            // テスト用の一意なIDです
            id: 99999,
            // 表示用の会員名です
            name: 'テスト 太郎 (DEMO)',
            // ログイン用のメールアドレスです
            email: 'demo@manekin.jp',
            // ログイン用のパスワードです
            password: 'password123',
            // 会員ランク（ゴールド会員）です
            rank: 'GOLD MEMBER',
            // 初期所持ポイント（500pt）です
            points: 500,
            // localStorage管理フラグです
            isLocalStorage: true,
            // デモユーザー識別フラグです
            isDemo: true
        };
        // 会員一覧配列にテストアカウントを追加します
        users.push(demoUser);
        // localStorageに会員一覧を保存します
        lsSetJsonDirect('manekin_ls_users', users);
        // すでにテストアカウントが存在していた場合です
    } else {
        // localStorage管理フラグを立てます
        demoUser.isLocalStorage = true;
        // デモユーザー識別フラグを立てます
        demoUser.isDemo = true;
    }

    // スマホ版用の初期データ（マイクローゼット等）を準備します
    ensureMobileUserInitialized(demoUser);
    // localStorageに現在ログイン中のユーザーとして保存します
    lsSetJsonDirect('manekin_ls_current_user', demoUser);

    // ログイン中のユーザーとしてAppStateにセットします
    AppState.currentUser = demoUser;
    // ログインした瞬間に即座にHOME画面へ切り替えます
    await redirectToHome(demoUser);

    // ログイン成功アラートを表示します
    alert('ログインされました（テストアカウント）\n※データベース接続なしで全機能をご利用いただけます');

    // アラートOK直後にも確実にHOME画面表示を維持します
    await redirectToHome(demoUser, { silentToast: true });

    // 関連処理 applyAccountSession() を呼び出してデータを復元し、再度HOME画面を保証します
    await applyAccountSession(demoUser, { preserveGuestCart });
    // 確実にHOME画面を表示した状態にします
    await redirectToHome(demoUser, { silentToast: true });
}

// ==========================================================================
// 【関数】handleLogin(e)
// 【役割】「ログイン」ボタンが押されたときに、メールアドレスとパスワードが合っているか確認して中に入れてあげる受付係
// 【具体的な処理内容】
//   ・入力されたメールアドレスとパスワードをサーバーへ送り、
//     認証が成功したらその会員としてログインしてホームへ戻ります
// ==========================================================================
async function handleLogin(e) {
    // 条件（e）が成り立つか判定し、該当する場合の処理を実行します
    if (e) e.preventDefault();
    // HTML 要素 #login-email を取得して変数 emailEl に格納します
    const emailEl = document.getElementById('login-email');
    // HTML 要素 #login-password を取得して変数 passEl に格納します
    const passEl = document.getElementById('login-password');
    // 定数 email を宣言し、値（emailEl ? emailEl.value.trim() : ''）をセットします
    const email = emailEl ? emailEl.value.trim() : '';
    // 定数 password を宣言し、値（passEl ? passEl.value.trim() : ''）をセットします
    const password = passEl ? passEl.value.trim() : '';

    // 条件（!email）が成り立つか判定し、該当する場合の処理を実行します
    if (!email) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('メールアドレスを入力してください');
        // 条件（emailEl）が成り立つか判定し、該当する場合の処理を実行します
        if (emailEl) emailEl.focus();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 条件（!password）が成り立つか判定し、該当する場合の処理を実行します
    if (!password) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('パスワードを入力してください');
        // 条件（passEl）が成り立つか判定し、該当する場合の処理を実行します
        if (passEl) passEl.focus();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
    const apiBase = getApiBaseUrl();
    // 再代入可能な変数 loggedInUser を宣言し、値（null）をセットします
    let loggedInUser = null;

    // スマホ版の場合は localStorage で認証・ログインします
    if (isMobileLocalStorageMode()) {
        // localStorageから登録済み会員一覧配列を取得します
        const users = lsGetJson('manekin_ls_users', []);
        // 大文字小文字の違いでログイン失敗しないよう入力メールアドレスを小文字化します
        const lowerEmail = email.toLowerCase();
        // 会員一覧の中からメールアドレスが一致するユーザーを探します
        let matched = users.find(u => u && String(u.email || '').toLowerCase() === lowerEmail);

        // すでに登録されている会員が見つかった場合の処理です
        if (matched) {
            // パスワードが一致しているか判定し、不一致ならエラーにします
            if (matched.password && matched.password !== password) {
                // パスワード不一致の警告メッセージを画面に表示します
                showToast('メールアドレスまたはパスワードが正しくありません');
                // ログイン失敗のため処理をここで終了します
                return;
            }
            // localStorage会員識別フラグを付与します
            matched.isLocalStorage = true;
            // ログイン成功ユーザーとして変数にセットします
            loggedInUser = matched;
            // 未登録メールアドレスが入力された場合の自動登録・ログイン処理です
        } else {
            // 入力メールがデモ用アドレス（demo@manekin.jp）か判定します
            const isDemo = (lowerEmail === 'demo@manekin.jp');
            // スマホ版用の新規会員データオブジェクトを即座に作成します
            const newMobileUser = {
                // デモなら99999、通常なら現在時刻のミリ秒をユニークIDとします
                id: isDemo ? 99999 : Date.now(),
                // デモならテスト太郎、通常ならメールの@前または会員と命名します
                name: isDemo ? 'テスト 太郎 (DEMO)' : (email.split('@')[0] || '会員'),
                // ログイン用メールアドレスを保存します
                email: email,
                // 入力されたパスワードを保存します
                password: password,
                // 会員ランクを設定します
                rank: isDemo ? 'GOLD MEMBER' : 'REGULAR MEMBER',
                // 初期保有ポイント（0ポイント）を設定します
                points: 0,
                // localStorage会員フラグをONにします
                isLocalStorage: true
            };
            // 作成した新規会員を一覧配列に追加します
            users.push(newMobileUser);
            // localStorageに最新の会員一覧を保存します
            lsSetJson('manekin_ls_users', users);
            // ログイン成功ユーザーとして変数にセットします
            loggedInUser = newMobileUser;
        }
        // スマホ版用の初期データ（マイクローゼット等）を初期化・準備します
        ensureMobileUserInitialized(loggedInUser);
        // localStorageに現在ログイン中のユーザーとして保存します
        lsSetJson('manekin_ls_current_user', loggedInUser);
    } else {
        // PC版：通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
        try {
            // Flask バックエンド API（/api/auth/login）へ非同期リクエストを送信し、応答を待ち受けます
            const response = await fetch(`${apiBase}/api/auth/login`, {
                // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
                method: 'POST',
                // サーバーへ送るデータの形式が JSON であることを伝える Content-Type ヘッダです
                headers: { 'Content-Type': 'application/json' },
                // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
                credentials: 'include',
                // JavaScript オブジェクトを JSON 文字列へ変換して送信ボディに乗せます
                body: JSON.stringify({ email, password })
            });
            // 定数 data を宣言し、値（await response.json().catch(() => ({})…）をセットします
            const data = await response.json().catch(() => ({}));

            // 条件（response.ok && data.user && isServerUserId(data.user…）が成り立つか判定し、該当する場合の処理を実行します
            if (response.ok && data.user && isServerUserId(data.user.id)) {
                // 変数・配列項目 loggedInUser の値を更新・計算します
                loggedInUser = data.user;
                // 上記の if 条件に当てはまらなかった場合の分岐処理です
            } else {
                // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
                showToast(data.message || 'メールアドレスまたはパスワードが正しくありません');
                // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
                return;
            }
            // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
        } catch (err) {
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ Pythonサーバー(ポート8080)に接続できないためログインできません（app.pyとMySQLの起動を確認してください）');
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
    }

    // 条件（loggedInUser）が成り立つか判定し、該当する場合の処理を実行します
    if (loggedInUser) {
        // 変数・配列項目 loggedInUser.points の値を更新・計算します（初期値は0ポイント）
        loggedInUser.points = (loggedInUser.points !== undefined && loggedInUser.points !== null) ? loggedInUser.points : 0;
        const target = AppState.pendingAuthTarget || sessionStorage.getItem('manekin_pending_auth_target');
        // 定数 preserveGuestCart を宣言し、値（(target === 'checkout')）をセットします
        const preserveGuestCart = (target === 'checkout');

        // 条件（emailEl）が成り立つか判定し、該当する場合の処理を実行します
        if (emailEl) emailEl.value = '';
        // 条件（passEl）が成り立つか判定し、該当する場合の処理を実行します
        if (passEl) passEl.value = '';

        // ログインした瞬間に即座にHOMEへ切り替える
        AppState.currentUser = loggedInUser;
        await redirectToHome(loggedInUser);

        // ログイン成功アラートを表示
        alert('ログインされました');

        // アラートOK直後にも確実にHOME画面表示を維持
        await redirectToHome(loggedInUser, { silentToast: true });

        // 関連処理 applyAccountSession() を呼び出してデータを復元し、再度HOME画面を保証します
        await applyAccountSession(loggedInUser, { preserveGuestCart });
        await redirectToHome(loggedInUser, { silentToast: true });
    }
}

// ==========================================================================
// 【関数】handleRegister(e)
// 【役割】「新規会員登録」ボタンが押されたときに、新しいお名前やパスワードを登録してあげる受付係
// 【具体的な処理内容】
//   ・入力された名前、メールアドレス、パスワードをサーバーへ送り、
//     新しい会員アカウントを作成して自動ログインします
// ==========================================================================
async function handleRegister(e) {
    // 条件（e）が成り立つか判定し、該当する場合の処理を実行します
    if (e) e.preventDefault();
    // HTML 要素 #reg-name を取得して変数 nameEl に格納します
    const nameEl = document.getElementById('reg-name');
    // HTML 要素 #reg-email を取得して変数 emailEl に格納します
    const emailEl = document.getElementById('reg-email');
    // HTML 要素 #reg-password を取得して変数 passEl に格納します
    const passEl = document.getElementById('reg-password');
    // HTML 要素 #reg-agree を取得して変数 agreeEl に格納します
    const agreeEl = document.getElementById('reg-agree');

    // 定数 name を宣言し、値（nameEl ? nameEl.value.trim() : ''）をセットします
    const name = nameEl ? nameEl.value.trim() : '';
    // 定数 email を宣言し、値（emailEl ? emailEl.value.trim() : ''）をセットします
    const email = emailEl ? emailEl.value.trim() : '';
    // 定数 password を宣言し、値（passEl ? passEl.value.trim() : ''）をセットします
    const password = passEl ? passEl.value.trim() : '';
    // 定数 isAgree を宣言し、値（agreeEl ? agreeEl.checked : true）をセットします
    const isAgree = agreeEl ? agreeEl.checked : true;

    // 条件（!name）が成り立つか判定し、該当する場合の処理を実行します
    if (!name) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('氏名を入力してください');
        // 条件（nameEl）が成り立つか判定し、該当する場合の処理を実行します
        if (nameEl) nameEl.focus();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 条件（!email）が成り立つか判定し、該当する場合の処理を実行します
    if (!email) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('メールアドレスを入力してください');
        // 条件（emailEl）が成り立つか判定し、該当する場合の処理を実行します
        if (emailEl) emailEl.focus();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 条件（!password || password.length < 4）が成り立つか判定し、該当する場合の処理を実行します
    if (!password || password.length < 4) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('パスワードは4文字以上で入力してください');
        // 条件（passEl）が成り立つか判定し、該当する場合の処理を実行します
        if (passEl) passEl.focus();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 条件（!isAgree）が成り立つか判定し、該当する場合の処理を実行します
    if (!isAgree) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('利用規約およびプライバシーポリシーに同意してください');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
    const apiBase = getApiBaseUrl();
    // 再代入可能な変数 newUser を宣言し、値（null）をセットします
    let newUser = null;

    // スマホ版の場合は localStorage に新規会員を登録・保存します
    if (isMobileLocalStorageMode()) {
        // localStorageから登録済み会員一覧配列を取得します
        const users = lsGetJson('manekin_ls_users', []);
        // 大文字小文字の違いをなくすためメールアドレスを小文字化します
        const lowerEmail = email.toLowerCase();
        // すでに同じメールアドレスが登録されているかインデックス番号を検索します
        const existingIdx = users.findIndex(u => u && String(u.email || '').toLowerCase() === lowerEmail);
        // すでに登録されているメールアドレスだった場合の更新処理です
        if (existingIdx > -1) {
            // お名前を最新の入力値に更新します
            users[existingIdx].name = name;
            // パスワードを最新の入力値に更新します
            users[existingIdx].password = password;
            // localStorage会員識別フラグを付与します
            users[existingIdx].isLocalStorage = true;
            // 更新した会員情報を新規登録ユーザーとしてセットします
            newUser = users[existingIdx];
            // 完全に新規のメールアドレスだった場合の作成処理です
        } else {
            // 新規会員データオブジェクトを組み立てます
            newUser = {
                // 現在時刻のミリ秒を一意なユーザーIDとします
                id: Date.now(),
                // 登録された氏名を保存します
                name: name,
                // 登録されたメールアドレスを保存します
                email: email,
                // 登録されたパスワードを保存します
                password: password,
                // レギュラー会員ランクを付与します
                rank: 'REGULAR MEMBER',
                // 初期ポイント（0ポイント）を設定します
                points: 0,
                // localStorage会員フラグをONにします
                isLocalStorage: true
            };
            // 会員一覧配列に新しい会員を追加します
            users.push(newUser);
            // 新規会員登録したユーザーにのみ初回限定1割引クーポンを付与します
            lsSetJson(`manekin_ls_coupons_${newUser.id}`, [
                {
                    // クーポンの一意なIDです
                    id: 1,
                    // クーポンコードです
                    code: 'WELCOME10',
                    // クーポンのタイトル名称です
                    name: '【初回限定】1割引クーポン (10% OFF)',
                    // 割引率（10% = 0.10）です
                    discount_rate: 0.10,
                    // 割引ラベル文字列です
                    discount_label: '1割引 (10% OFF)',
                    // 使用済みフラグ（0=未使用）です
                    is_used: 0
                }
            ]);
        }
        // 最新の会員一覧配列をlocalStorageに保存します
        lsSetJson('manekin_ls_users', users);
        // スマホ版用の初期データ（マイクローゼット等）を初期化・準備します
        ensureMobileUserInitialized(newUser);
        // localStorageに現在ログイン中のユーザーとして保存します
        lsSetJson('manekin_ls_current_user', newUser);
    } else {
        // PC版：通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
        try {
            // Flask バックエンド API（/api/auth/register）へ非同期リクエストを送信し、応答を待ち受けます
            const response = await fetch(`${apiBase}/api/auth/register`, {
                // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
                method: 'POST',
                // サーバーへ送るデータの形式が JSON であることを伝える Content-Type ヘッダです
                headers: { 'Content-Type': 'application/json' },
                // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
                credentials: 'include',
                // JavaScript オブジェクトを JSON 文字列へ変換して送信ボディに乗せます
                body: JSON.stringify({ name, email, password })
            });
            // 定数 data を宣言し、値（await response.json().catch(() => ({})…）をセットします
            const data = await response.json().catch(() => ({}));

            // 条件（response.ok && data.user && isServerUserId(data.user…）が成り立つか判定し、該当する場合の処理を実行します
            if (response.ok && data.user && isServerUserId(data.user.id)) {
                // 変数・配列項目 newUser の値を更新・計算します
                newUser = data.user;
                // 上記の if 条件に当てはまらなかった場合の分岐処理です
            } else {
                // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
                showToast(data.message || '会員登録に失敗しました');
                // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
                return;
            }
            // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
        } catch (err) {
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ Pythonサーバー(ポート8080)に接続できないため会員登録できません（app.pyとMySQLの起動を確認してください）');
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
    }

    // 条件（newUser）が成り立つか判定し、該当する場合の処理を実行します
    if (newUser) {
        // 変数・配列項目 newUser.points の値を更新・計算します（初期値は0ポイント）
        newUser.points = (newUser.points !== undefined && newUser.points !== null) ? newUser.points : 0;
        const target = AppState.pendingAuthTarget || sessionStorage.getItem('manekin_pending_auth_target');
        // 定数 preserveGuestCart を宣言し、値（(target === 'checkout')）をセットします
        const preserveGuestCart = (target === 'checkout');

        // 条件（nameEl）が成り立つか判定し、該当する場合の処理を実行します
        if (nameEl) nameEl.value = '';
        // 条件（emailEl）が成り立つか判定し、該当する場合の処理を実行します
        if (emailEl) emailEl.value = '';
        // 条件（passEl）が成り立つか判定し、該当する場合の処理を実行します
        if (passEl) passEl.value = '';

        // 登録・ログインした瞬間に即座にHOMEへ切り替える
        AppState.currentUser = newUser;
        await redirectToHome(newUser);

        // 会員登録・ログイン成功アラートを表示
        alert('ログインされました');

        // アラートOK直後にも確実にHOME画面表示を維持
        await redirectToHome(newUser, { silentToast: true });

        // 関連処理 applyAccountSession() を呼び出してデータを復元し、再度HOME画面を保証します
        await applyAccountSession(newUser, { preserveGuestCart });
        await redirectToHome(newUser, { silentToast: true });
    }
}

// ==========================================================================


// ==========================================================================
//  第8章：共通UI部品（モーダルウィンドウ・トースト通知・スマホメニュー）
//  【このセクションの役割】
//  ・お知らせモーダルや保有クーポン一覧モーダルの開閉
//  ・画面右下に数秒だけフワッと表示されるトースト通知バナー
//  ・スマートフォン用のスライド引き出しメニュー（ハンバーガーメニュー）の開閉
// ==========================================================================
// 【関数】openManekinModal(title, contentHtml)
// 【役割】お知らせや案内メッセージのポップアップ画面をフワッと画面に出すオープン係
// 【具体的な処理内容】
//   ・指定されたタイトルと本文で画面中央にポップアップを表示します
// ==========================================================================
function openManekinModal() {
    // HTML 要素 #manekin-modal を取得して変数 modal に格納します
    const modal = document.getElementById('manekin-modal');
    // 条件（modal）が成り立つか判定し、該当する場合の処理を実行します
    if (modal) {
        // 要素に CSS クラスを付与して見た目・表示状態を変更します（modal.classList.add('open');）
        modal.classList.add('open');
        // 関連処理 closeMobileDrawer() を呼び出して処理・画面を更新します
        closeMobileDrawer();
    }
}

// ==========================================================================
// 【関数】closeManekinModal()
// 【役割】開いているポップアップ画面をスッと閉じるクローズ係
// 【具体的な処理内容】
//   ・開いているモーダルを非表示にします
// ==========================================================================
function closeManekinModal() {
    // HTML 要素 #manekin-modal を取得して変数 modal に格納します
    const modal = document.getElementById('manekin-modal');
    // 条件（modal）が成り立つか判定し、該当する場合の処理を実行します
    if (modal) modal.classList.remove('open');
}

// ==========================================================================
// 【関数】escapeHtml(str)
// 【役割】変な文字や危険なイタズラ文字が入ってきたときに、安全な文字に変換して守るセキュリティ番犬係
// 【具体的な処理内容】
//   ・`<` や `>` などの危険な記号を安全な文字コードに変換します
// ==========================================================================
function escapeHtml(str) {
    // 文字列が null または undefined の場合は空文字を返します
    if (str === null || str === undefined) return '';
    // 文字列型に変換した上で、危険な特殊記号を順番にエスケープ変換して返します
    return String(str)
        // & を &amp; に置換します
        .replace(/&/g, '&amp;')
        // < を &lt; に置換します
        .replace(/</g, '&lt;')
        // > を &gt; に置換します
        .replace(/>/g, '&gt;')
        // " を &quot; に置換します
        .replace(/"/g, '&quot;')
        // ' を &#039; に置換します
        .replace(/'/g, '&#039;');
}

// ==========================================================================
// 【関数】openMyPageCouponsModal()
// 【役割】マイページの「保有クーポン一覧を見る」が押されたときにクーポン小窓を開くクーポン窓オープン係
// 【具体的な処理内容】
//   ・持っているクーポンの詳細（割引内容や有効期限）をモーダルウィンドウに一覧表示します
// ==========================================================================
async function openMyPageCouponsModal() {
    // 最新の保有クーポン配列をサーバーまたはlocalStorageから取得して同期します
    await fetchUserCoupons();

    // クーポン表示モーダルウィンドウ要素を取得します
    const modal = document.getElementById('modal-user-coupons');
    // クーポン一覧を差し込む親コンテナ要素を取得します
    const listElem = document.getElementById('mypage-coupons-list');
    // モーダル要素または一覧要素が存在しない場合は処理を終了します
    if (!modal || !listElem) return;

    // 保有クーポン配列を安全に配列型として取得します
    const coupons = Array.isArray(AppState.userCoupons) ? AppState.userCoupons : [];

    // クーポンを1枚も持っていない場合の画面表示処理です
    if (coupons.length === 0) {
        // クーポンなし用の案内メッセージHTMLを書き込みます
        listElem.innerHTML = `
            <div style="text-align: center; padding: 36px 16px; color: #888; background: #fafafa; border-radius: 8px;">
                <div style="font-size: 2rem; margin-bottom: 8px;">🎫</div>
                <p style="font-size: 1rem; font-weight: bold; margin-bottom: 4px; color: #555;">現在ご利用可能なクーポンはありません</p>
                <p style="font-size: 0.8rem; margin: 0;">新規会員登録特典やキャンペーン開催時にクーポンが付与されます。</p>
            </div>
        `;
        // クーポンを1枚以上持っている場合のカード一覧描画処理です
    } else {
        // 各クーポンのカードHTMLを生成して結合し、一覧要素に流し込みます
        listElem.innerHTML = coupons.map(c => {
            // 使用済みフラグ（true / false）を判定します
            const isUsed = Boolean(c.is_used);
            // 割引内容の表示ラベル（例: 10% OFF）を安全に決定します
            const discountLabel = c.discount_label || (c.discount_rate ? `${Math.round(c.discount_rate * 100)}% OFF` : (c.discount_amount ? `¥${c.discount_amount} 割引` : '1割引 (10% OFF)'));
            // クーポンコード（例: WELCOME10）を取得します
            const code = c.code || c.coupon_code || 'WELCOME10';
            // クーポン名（例: 【初回限定】1割引クーポン）を取得します
            const name = c.name || c.title || '【初回限定】1割引クーポン (10% OFF)';

            // すでに使い終わったクーポン（使用済み）のカードHTMLです
            if (isUsed) {
                return `
                    <div class="coupon-item-card is-used" style="border: 1px dashed #d1d5db; border-radius: 10px; padding: 14px 16px; background: #f9fafb; opacity: 0.65; position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                            <div style="font-weight: 600; color: #4b5563; font-size: 0.95rem; line-height: 1.4;">
                                ${escapeHtml(name)}
                            </div>
                            <span style="font-size: 0.72rem; background: #6b7280; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 600; white-space: nowrap;">使用済み</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed #e5e7eb;">
                            <div style="font-size: 0.8rem; color: #9ca3af; font-family: monospace;">
                                コード: <span style="letter-spacing: 0.05em;">${escapeHtml(code)}</span>
                            </div>
                            <div style="font-size: 0.9rem; color: #9ca3af; font-weight: 700;">
                                ${escapeHtml(discountLabel)}
                            </div>
                        </div>
                    </div>
                `;
                // まだ使えるクーポン（利用可能）のカードHTMLです
            } else {
                return `
                    <div class="coupon-item-card" style="border: 2px solid #22c55e; border-radius: 10px; padding: 14px 16px; background: #f0fdf4; box-shadow: 0 3px 10px rgba(34,197,94,0.08); position: relative;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                            <div style="font-weight: 700; color: #166534; font-size: 1rem; line-height: 1.4;">
                                🎁 ${escapeHtml(name)}
                            </div>
                            <span style="font-size: 0.75rem; background: #22c55e; color: #fff; padding: 3px 10px; border-radius: 20px; font-weight: bold; white-space: nowrap; box-shadow: 0 1px 3px rgba(34,197,94,0.3);">利用可能</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px dashed #bbf7d0;">
                            <div>
                                <span style="font-size: 0.75rem; color: #166534; font-weight: 600;">クーポンコード:</span>
                                <span style="font-family: monospace; font-size: 0.95rem; font-weight: bold; background: #fff; padding: 2px 8px; border: 1px solid #86efac; border-radius: 4px; margin-left: 4px; color: #111;">${escapeHtml(code)}</span>
                            </div>
                            <div style="font-size: 1.15rem; color: #dc2626; font-weight: 800;">
                                ${escapeHtml(discountLabel)}
                            </div>
                        </div>
                        <div style="font-size: 0.75rem; color: #15803d; margin-top: 8px; padding-top: 6px; border-top: 1px solid rgba(34,197,94,0.15); display: flex; align-items: center; gap: 4px;">
                            <span>ℹ️ ご注文手続き画面で「適用する」を選択すると割引されます</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    // モーダル要素に open クラスを追加して表示状態にします
    modal.classList.add('open');
    // モーダル要素に active クラスを追加してフェードインさせます
    modal.classList.add('active');
    // モバイルメニューが開いている場合は邪魔にならないよう閉じます
    if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
}

// ==========================================================================
// 【関数】closeMyPageCouponsModal()
// 【役割】開いていたクーポン小窓を閉じるクーポン窓クローズ係
// 【具体的な処理内容】
//   ・クーポンのモーダルを非表示にします
// ==========================================================================
function closeMyPageCouponsModal() {
    // クーポン表示モーダルウィンドウ要素を取得します
    const modal = document.getElementById('modal-user-coupons');
    // モーダル要素が存在していれば非表示にします
    if (modal) {
        // open クラスを外してモーダルを閉じます
        modal.classList.remove('open');
        // active クラスを外して非表示状態に戻します
        modal.classList.remove('active');
    }
}

// ==========================================================================
// 【関数】showToast(message)
// 【役割】画面の右下に「カゴに入れました」などの通知メッセージをフワッと出してすぐ消すお知らせ係
// 【具体的な処理内容】
//   ・「カートに追加しました」「ログインしました」などの完了メッセージを通知します
// ==========================================================================
function showToast(message) {
    // HTML 要素 #toast-container を取得して変数 container に格納します
    const container = document.getElementById('toast-container');
    // 条件（!container）が成り立つか判定し、該当する場合の処理を実行します
    if (!container) return;

    // 定数 toast を宣言し、値（document.createElement('div')）をセットします
    const toast = document.createElement('div');
    // 変数・配列項目 toast.className の値を更新・計算します
    toast.className = 'toast-message';
    // 文字要素 toast の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
    toast.textContent = message;
    // 新しく組み立てた HTML 要素ノードを親コンテナへ組み込んで表示します（container.appendChild(toast);）
    container.appendChild(toast);

    // 遅延実行タイマーのセットまたは重複防止用キャンセルを行います
    setTimeout(() => {
        // 要素に CSS クラスを付与して見た目・表示状態を変更します（toast.classList.add('toast-fadeout');）
        toast.classList.add('toast-fadeout');
        // 遅延実行タイマーのセットまたは重複防止用キャンセルを行います
        setTimeout(() => toast.remove(), 300);
        // 上の処理を指定ミリ秒後（2500ms 後）に実行するタイマー呼び出しを閉じます
    }, 2500);
}

// ==========================================================================
// 【関数】openMobileDrawer()
// 【役割】スマホ画面で左上の三本線メニューボタンが押されたときにメニューを開くスマホメニューオープン係
// 【具体的な処理内容】
//   ・画面左からスライドメニューを出し、背景を暗くします
// ==========================================================================
function openMobileDrawer() {
    // HTML 要素 #mobile-menu-drawer を取得して変数 drawer に格納します
    const drawer = document.getElementById('mobile-menu-drawer');
    // HTML 要素 #menu-overlay を取得して変数 overlay に格納します
    const overlay = document.getElementById('menu-overlay');
    // 条件（drawer && overlay）が成り立つか判定し、該当する場合の処理を実行します
    if (drawer && overlay) {
        // 要素に CSS クラスを付与して見た目・表示状態を変更します（drawer.classList.add('open');）
        drawer.classList.add('open');
        // 要素に CSS クラスを付与して見た目・表示状態を変更します（overlay.classList.add('active');）
        overlay.classList.add('active');
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（document.body.style.overflow = 'hidden';）
        document.body.style.overflow = 'hidden';
    }
}

// ==========================================================================
// 【関数】closeMobileDrawer()
// 【役割】スマホメニューの外側がタップされたときにスッとメニューを閉じるスマホメニュークローズ係
// 【具体的な処理内容】
//   ・開いていたスライドメニューを元の位置に引っ込めます
// ==========================================================================
function closeMobileDrawer() {
    // HTML 要素 #mobile-menu-drawer を取得して変数 drawer に格納します
    const drawer = document.getElementById('mobile-menu-drawer');
    // HTML 要素 #menu-overlay を取得して変数 overlay に格納します
    const overlay = document.getElementById('menu-overlay');
    // 条件（drawer && overlay）が成り立つか判定し、該当する場合の処理を実行します
    if (drawer && overlay) {
        // 要素から CSS クラスを外して強調や表示を戻します（drawer.classList.remove('open');）
        drawer.classList.remove('open');
        // 要素から CSS クラスを外して強調や表示を戻します（overlay.classList.remove('active');）
        overlay.classList.remove('active');
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（document.body.style.overflow = '';）
        document.body.style.overflow = '';
    }
}


// スマホ版 localStorage 判定・操作ヘルパーをグローバルに公開します
window.isOfflineDemoUser = isOfflineDemoUser;
window.isMobileLocalStorageMode = isMobileLocalStorageMode;
window.lsGetJson = lsGetJson;
window.lsSetJson = lsSetJson;
window.getDefaultMobileClosetItems = getDefaultMobileClosetItems;
window.ensureMobileUserInitialized = ensureMobileUserInitialized;
// ブラウザ旧ストレージに残っていた不要な manekin* データを消去します
window.purgeAllManekinLocalStorage = purgeAllManekinLocalStorage;
// 変数・配列項目 window.getApiBaseUrl の値を更新・計算します
window.getApiBaseUrl = getApiBaseUrl;
// 変数・配列項目 window.isServerUserId の値を更新・計算します
window.isServerUserId = isServerUserId;
// 変数・配列項目 window.restoreAuthSessionFromBac… の値を更新・計算します
window.restoreAuthSessionFromBackend = restoreAuthSessionFromBackend;
// 変数・配列項目 window.getDefaultFittingOffsets の値を更新・計算します
window.getDefaultFittingOffsets = getDefaultFittingOffsets;
// 変数・配列項目 window.applyAccountSession の値を更新・計算します
window.applyAccountSession = applyAccountSession;
// 変数・配列項目 window.getUserPoints の値を更新・計算します
window.getUserPoints = getUserPoints;
// 変数・配列項目 window.setUserPoints の値を更新・計算します
window.setUserPoints = setUserPoints;
// 変数・配列項目 window.handlePointsInputChange の値を更新・計算します
window.handlePointsInputChange = handlePointsInputChange;
// 変数・配列項目 window.handleUseAllPoints の値を更新・計算します
window.handleUseAllPoints = handleUseAllPoints;
// 変数・配列項目 window.handleResetPoints の値を更新・計算します
window.handleResetPoints = handleResetPoints;
// 変数・配列項目 window.importOrderToCloset の値を更新・計算します
window.importOrderToCloset = importOrderToCloset;
// 変数・配列項目 window.handleRefreshFromMySQL の値を更新・計算します
window.handleRefreshFromMySQL = handleRefreshFromMySQL;
// 変数・配列項目 window.handleSyncAllToMySQL の値を更新・計算します
window.handleSyncAllToMySQL = handleRefreshFromMySQL;
// メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
window.syncCartToBackend = syncCartToBackend;
// 変数・配列項目 window.syncCartFromBackend の値を更新・計算します
window.syncCartFromBackend = syncCartFromBackend;
// 変数・配列項目 window.syncOrdersFromBackend の値を更新・計算します
window.syncOrdersFromBackend = syncOrdersFromBackend;
// 変数・配列項目 window.syncFavoritesFromBackend の値を更新・計算します
window.syncFavoritesFromBackend = syncFavoritesFromBackend;
// 変数・配列項目 window.handleClearOrderHistory の値を更新・計算します
window.handleClearOrderHistory = handleClearOrderHistory;
// 変数・配列項目 window.handleLogout の値を更新・計算します
window.handleLogout = handleLogout;
// 変数・配列項目 window.handleDemoLogin の値を更新・計算します
window.handleDemoLogin = handleDemoLogin;
// 変数・配列項目 window.handleLogin の値を更新・計算します
window.handleLogin = handleLogin;
// 変数・配列項目 window.handleRegister の値を更新・計算します
window.handleRegister = handleRegister;
// 変数・配列項目 window.handleToggleFavorite の値を更新・計算します
window.handleToggleFavorite = handleToggleFavorite;
// 変数・配列項目 window.handleAddToCartFromDetail の値を更新・計算します
window.handleAddToCartFromDetail = handleAddToCartFromDetail;
// 変数・配列項目 window.handleBuyNow の値を更新・計算します
window.handleBuyNow = handleBuyNow;
// 変数・配列項目 window.updateCartItemQty の値を更新・計算します
window.updateCartItemQty = updateCartItemQty;
// 変数・配列項目 window.removeCartItem の値を更新・計算します
window.removeCartItem = removeCartItem;
// 変数・配列項目 window.handlePlaceOrder の値を更新・計算します
window.handlePlaceOrder = handlePlaceOrder;
// クーポン関連の関数をグローバルに公開します
window.handleApplyCouponCode = handleApplyCouponCode;
window.handleCancelCoupon = handleCancelCoupon;
window.fetchUserCoupons = fetchUserCoupons;
window.updateCheckoutStepper = updateCheckoutStepper;
window.openMyPageCouponsModal = openMyPageCouponsModal;
window.closeMyPageCouponsModal = closeMyPageCouponsModal;
window.escapeHtml = escapeHtml;
