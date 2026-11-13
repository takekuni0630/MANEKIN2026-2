// ==========================================================================
//  js/shop.js - ECショップ機能・会員認証・MySQLデータ同期・共通UI
//  商品カード生成、詳細表示、カート＆チェックアウト、ポイント計算、認証、
//  お気に入り、マイページ描画、および Flask API (MySQL) 同期を担当します。
// ==========================================================================

// ==========================================================================
//  1. 認証・セッション管理 & API通信基盤（MySQL一本化・Cookieセッション復元）
// ==========================================================================
// スマホ版かどうかを判定します（スマホ版のみ localStorage を使用し、デスクトップ版は必ず Python + MySQL を使用します）
function isMobileLocalStorageMode() {
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
    } catch (e) {}
    return false;
}

// スマホ版 localStorage 安全読み書きヘルパー
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

// スマホ版：新規ユーザー用の初期手持ち服3点セット
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
        },
        {
            id: 'c3',
            name: '黒レザーローファー',
            category: 'SHOES',
            color: 'BLACK',
            season: 'オールシーズン',
            image: 'assets/images/men/アーバンレザースニーカー.png',
            isOwned: true,
            isPurchased: false
        }
    ];
}

// スマホ版：ユーザーの初期データ（初回限定10%OFFクーポン・初期クローゼット等）をlocalStorageに準備します
function ensureMobileUserInitialized(user) {
    if (!isMobileLocalStorageMode() || !user || !user.id) return;
    const uid = String(user.id);
    if (lsGetJson(`manekin_ls_coupons_${uid}`, null) === null) {
        lsSetJson(`manekin_ls_coupons_${uid}`, [
            {
                id: 1,
                code: 'WELCOME10',
                name: '【初回限定】1割引クーポン (10% OFF)',
                discount_rate: 0.10,
                discount_label: '1割引 (10% OFF)',
                is_used: 0
            }
        ]);
    }
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

// デスクトップ版ではすべての manekin* キー（manekin_ls_* を含む）を完全消去して MySQL 一本化を保証します。
// スマホ版（isMobileLocalStorageMode() === true）のときだけ manekin_ls_* キーを保持します。
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


// 通信先の Flask API サーバーURLを返します（8080番ポート配信時は相対パス ''、それ以外は http://ホスト:8080）
function getApiBaseUrl() {
    // 条件（window.location.protocol !== 'file:' && (window.loca…）が成り立つか判定し、該当する場合の処理を実行します
    if (window.location.protocol !== 'file:' && (window.location.port === '8080' || window.__MANEKIN_API_ORIGIN__ === 'self')) {
        // 結果（''）を呼び出し元へ返却します
        return '';
    }
    // 定数 host を宣言し、値（(window.location.hostname === 'localho…）をセットします
    const host = (window.location.hostname === 'localhost') ? 'localhost' : '127.0.0.1';
    // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
    return `http://${host}:8080`;
}


// 渡されたユーザーIDが MySQL が採番した有効な正の整数（例: 1, 2, 15）かを正規表現で判定します
function isServerUserId(uid) {
    // 結果（uid !== null && uid !== undefined && /^\d+$/.tes…）を呼び出し元へ返却します
    return uid !== null && uid !== undefined && /^\d+$/.test(String(uid));
}


// ページ読込時にログイン会員を復元します（スマホ版はlocalStorageから、PC版はバックエンド /api/auth/me から復元）
async function restoreAuthSessionFromBackend() {
    // スマホ版の場合は localStorage からログインセッションを復元します
    if (isMobileLocalStorageMode()) {
        const savedUser = lsGetJson('manekin_ls_current_user', null);
        if (savedUser && isServerUserId(savedUser.id)) {
            savedUser.isLocalStorage = true;
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


// ログイン／ログアウト／アカウント切替時に注文フォームやポイント入力欄の残留文字を初期化します
function resetAccountScopedDomInputs(user) {
    // 条件（typeof checkoutUsedPoints !== 'undefined'）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof checkoutUsedPoints !== 'undefined') {
        // 変数・配列項目 checkoutUsedPoints の値を更新・計算します
        checkoutUsedPoints = 0;
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


// 試着スタジオ5部位の位置ズレ(X/Y)・拡大率・ブランドサイズの初期値オブジェクトを新しく生成して返します
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


// 身長・体型・好みのテイストのデフォルトプロフィール辞書を返します
function getDefaultBodyProfile() {
    // 結果（{ height: 172, bodyType: 'REGULAR', styleTaste: …）を呼び出し元へ返却します
    return { height: 172, bodyType: 'REGULAR', styleTaste: 'MINIMAL' };
}


// アカウント切り替え時の総括関数：旧ストレージ消去→保留スタジオ同期→メモリ初期化→MySQLから全データ並列復元を行います
async function applyAccountSession(user, options = {}) {
    // ブラウザ旧ストレージに残っていた manekin* データを完全消去して MySQL 単一運用を保ちます
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
    // アプリ全体状態 AppState.studioGender を最新値（'MEN'）に更新します
    AppState.studioGender = 'MEN';
    // アプリ全体状態 AppState.userBodyProfile を最新値（getDefaultBodyProfile()）に更新します
    AppState.userBodyProfile = getDefaultBodyProfile();
    // アプリ全体状態 AppState.userCoupons を最新値（[]）に更新します
    AppState.userCoupons = [];
    // 現在適用中のクーポンを初期化します
    currentAppliedCoupon = null;

    // 条件（!user）が成り立つか判定し、該当する場合の処理を実行します
    if (!user) {
        // アプリ全体状態 AppState.currentUser を最新値（null）に更新します
        AppState.currentUser = null;
        // 条件（typeof syncGenderToggleUI === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof syncGenderToggleUI === 'function') syncGenderToggleUI();
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
        // 条件（typeof syncGenderToggleUI === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof syncGenderToggleUI === 'function') syncGenderToggleUI();
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
    try {
        await Promise.all([
            // 関連処理 syncCartFromBackend() を呼び出して処理・画面を更新します
            syncCartFromBackend({ mergeItems: guestCartSnapshot }),
            // 関連処理 syncOrdersFromBackend() を呼び出して処理・画面を更新します
            syncOrdersFromBackend(),
            // 関連処理 syncFavoritesFromBackend() を呼び出して処理・画面を更新します
            syncFavoritesFromBackend(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncClosetFromBackend === 'function') ? syncClosetFromBackend() : Promise.resolve(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncOutfitsFromBackend === 'function') ? syncOutfitsFromBackend() : Promise.resolve(),
            // 関連モジュール側に関数が定義されている場合のみ、その同期・補助処理を呼び出します
            (typeof syncStudioStateFromBackend === 'function') ? syncStudioStateFromBackend() : Promise.resolve(),
            // ユーザーが所持するクーポン一覧を取得して画面に反映します
            fetchUserCoupons()
        ]);
    } catch (syncErr) {
        console.warn('ログイン後のMySQL並列同期エラー:', syncErr);
    }
}


// ==========================================================================
//  2. 商品カード生成・カタログ一覧・新作一覧・商品詳細表示
// ==========================================================================
// 1商品オブジェクトを受け取り、お気に入りハートボタン・NEWバッジ・画像・価格付きのカードHTML文字列を作ります
function createProductCardHTML(product) {
    // 定数 isFav を宣言し、値（AppState.favorites.includes(product.id…）をセットします
    const isFav = AppState.favorites.includes(product.id);
    // 定数 formattedPrice を宣言し、値（"¥" + product.price.toLocaleString()）をセットします
    const formattedPrice = "¥" + product.price.toLocaleString();

    // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
    return `
        <article class="product-card" data-id="${product.id}">
            <div class="product-img-wrapper" onclick="navigateToDetail(${product.id})">
                ${product.isNew ? '<span class="badge-new">NEW</span>' : ''}
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22800%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20800%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22600%22%20height%3D%22800%22%2F%3E%3Cpath%20d%3D%22M250%20320%20L350%20320%20L370%20420%20L230%20420%20Z%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%223%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22480%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20letter-spacing%3D%222%22%3EMANEKIN%20COLLECTION%3C%2Ftext%3E%3C%2Fsvg%3E'">
                <button class="fav-btn ${isFav ? 'is-favorite' : ''}" 
                        onclick="event.stopPropagation(); handleToggleFavorite(${product.id})" 
                        aria-label="${isFav ? 'お気に入りを解除' : 'お気に入りに追加'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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


// トップ画面に PICK UP おすすめ商品（4点）と新着商品（4点）を描画します
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


// 選択中の性別(ALL/MEN/WOMEN)・カテゴリ・並び順で商品を絞り込みソートしてカタログ画面へ描画します
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
            items.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            // 現在の case / ループ処理をここで抜けます
            break;
        // どの case にも該当しなかった場合の既定（デフォルト）処理です
        default:
            // 選択中の並び順指定（安い順／高い順／名前順／新着順）に沿って商品配列 items を並べ替えます
            items.sort((a, b) => a.id - b.id);
            // 現在の case / ループ処理をここで抜けます
            break;
    }
    // 生成・変換した HTML 文字列を要素 gridContainer の中身として描画します
    gridContainer.innerHTML = items.map(p => createProductCardHTML(p)).join('');
}


// 新着フラグ(isNew: true)が付いた新作アイテムだけを抽出して新作一覧画面へ描画します
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


// クリックされた商品IDの詳細画面('#item-detail?id=〇〇')へハッシュ遷移させます
function navigateToDetail(productId) {
    // 変数・配列項目 window.location.hash の値を更新・計算します
    window.location.hash = `#item-detail?id=${productId}`;
}


// 指定IDの商品を詳細画面へ描画します（色ボタン・サイズボタン・お気に入り状態・カート追加・今すぐ購入）
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

    // アプリ全体状態 AppState.selectedColor を最新値（product.colors[0]）に更新します
    AppState.selectedColor = product.colors[0];
    // アプリ全体状態 AppState.selectedSize を最新値（product.sizes[1] || "M"）に更新します
    AppState.selectedSize = product.sizes[1] || "M";

    // 定数 isFav を宣言し、値（AppState.favorites.includes(product.id…）をセットします
    const isFav = AppState.favorites.includes(product.id);
    // 定数 formattedPrice を宣言し、値（"¥" + product.price.toLocaleString()）をセットします
    const formattedPrice = "¥" + product.price.toLocaleString();
    // 定数 initialImgUrl を宣言し、値（(product.colorImages && product.colorI…）をセットします
    const initialImgUrl = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

    // 配列の各アイテムを順番に加工・HTMLカード化して新しい配列に変換します
    const colorChipsHTML = product.colors.map((color, idx) => {
        // 定数 isSelected を宣言し、値（(color === AppState.selectedColor)）をセットします
        const isSelected = (color === AppState.selectedColor);
        // 定数 mappedImg を宣言し、値（(product.colorImages && product.colorI…）をセットします
        const mappedImg = (product.colorImages && product.colorImages[color]) || product.image;
        // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
        return `
            <button type="button" 
                    class="color-chip ${isSelected ? 'selected' : ''}" 
                    data-color="${color}" 
                    data-img="${mappedImg}" 
                    onclick="handleColorSelect(this, '${color}', '${mappedImg}')">
                ${color}
            </button>
        `;
    // 上で配列ごとに生成した HTML 文字列を 1 つの連続した HTML テキストに連結します
    }).join('');

    // 配列の各アイテムを順番に加工・HTMLカード化して新しい配列に変換します
    const sizeChipsHTML = product.sizes.map((size, idx) => {
        // 定数 isSelected を宣言し、値（(size === AppState.selectedSize)）をセットします
        const isSelected = (size === AppState.selectedSize);
        // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
        return `
            <button type="button" 
                    class="size-chip ${isSelected ? 'selected' : ''}" 
                    data-size="${size}" 
                    onclick="handleSizeSelect(this, '${size}')">
                ${size}
            </button>
        `;
    // 上で配列ごとに生成した HTML 文字列を 1 つの連続した HTML テキストに連結します
    }).join('');

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

            <div class="detail-options">
                <div class="option-group">
                    <p class="option-group-title">
                        COLOR: <span class="current-selected-label" id="label-selected-color">${AppState.selectedColor}</span>
                    </p>
                    <div class="color-chips" id="detail-color-chips">${colorChipsHTML}</div>
                </div>

                <div class="option-group">
                    <p class="option-group-title">
                        SIZE: <span class="current-selected-label" id="label-selected-size">${AppState.selectedSize}</span>
                    </p>
                    <div class="size-chips" id="detail-size-chips">${sizeChipsHTML}</div>
                </div>
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
                    <li>・透け感：なし（WHITEのみ極微小）</li>
                    <li>・伸縮性：適度にあり</li>
                </ul>
            </div>
        </div>
    `;
}


// 商品詳細でカラーボタンが押されたときに AppState.selectedColor を更新しボタン枠と表示文言を切り替えます
function handleColorSelect(chipEl, colorName, imageUrl) {
    // 定数 parent を宣言し、値（chipEl.parentElement）をセットします
    const parent = chipEl.parentElement;
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    parent.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
    // 要素に CSS クラスを付与して見た目・表示状態を変更します（chipEl.classList.add('selected');）
    chipEl.classList.add('selected');

    // アプリ全体状態 AppState.selectedColor を最新値（colorName）に更新します
    AppState.selectedColor = colorName;

    // HTML 要素 #label-selected-color を取得して変数 labelColor に格納します
    const labelColor = document.getElementById('label-selected-color');
    // 条件（labelColor）が成り立つか判定し、該当する場合の処理を実行します
    if (labelColor) labelColor.textContent = colorName;

    // HTML 要素 #detail-main-img を取得して変数 mainImg に格納します
    const mainImg = document.getElementById('detail-main-img');
    // 条件（mainImg && imageUrl）が成り立つか判定し、該当する場合の処理を実行します
    if (mainImg && imageUrl) {
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（mainImg.style.opacity = '0.25';）
        mainImg.style.opacity = '0.25';
        // 遅延実行タイマーのセットまたは重複防止用キャンセルを行います
        setTimeout(() => {
            // 変数・配列項目 mainImg.src の値を更新・計算します
            mainImg.src = imageUrl;
            // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（mainImg.style.opacity = '1';）
            mainImg.style.opacity = '1';
        // 上の処理を指定ミリ秒後（120ms 後）に実行するタイマー呼び出しを閉じます
        }, 120);
    }

    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast(`カラー: ${colorName} に切り替えました`);
}


// 商品詳細でサイズボタンが押されたときに AppState.selectedSize を更新します
function handleSizeSelect(chipEl, sizeName) {
    // 定数 parent を宣言し、値（chipEl.parentElement）をセットします
    const parent = chipEl.parentElement;
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    parent.querySelectorAll('.size-chip').forEach(s => s.classList.remove('selected'));
    // 要素に CSS クラスを付与して見た目・表示状態を変更します（chipEl.classList.add('selected');）
    chipEl.classList.add('selected');

    // アプリ全体状態 AppState.selectedSize を最新値（sizeName）に更新します
    AppState.selectedSize = sizeName;

    // HTML 要素 #label-selected-size を取得して変数 labelSize に格納します
    const labelSize = document.getElementById('label-selected-size');
    // 条件（labelSize）が成り立つか判定し、該当する場合の処理を実行します
    if (labelSize) labelSize.textContent = sizeName;

    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast(`サイズ: ${sizeName} を選択しました`);
}


// ==========================================================================
//  3. ショッピングカート管理（シーケンス保護 ＋ MySQL cart_items 同期）
// ==========================================================================
// 複数回のカート保存 API 通信が順番を追い越さないよう直列に繋ぐための待機用 Promise です
let _cartSyncPromise = Promise.resolve();
// ユーザーごとの最新カート操作順番を記録し、古い通信応答による先祖返りを防ぐ連番管理マップです
const _cartSyncSeqByUser = {};

// カート非同期同期の競合(古い応答による上書き)を防ぐため、ユーザーごとの連番シーケンスを取得します
function getCartUserSeq(uid) {
    // 結果（_cartSyncSeqByUser[String(uid)] || 0）を呼び出し元へ返却します
    return _cartSyncSeqByUser[String(uid)] || 0;
}

// カート変更や送信ごとにユーザー別シーケンス番号を +1 進めます
function bumpCartUserSeq(uid) {
    // 定数 k を宣言し、値（String(uid)）をセットします
    const k = String(uid);
    // 変数・配列項目 _cartSyncSeqByUser[k] の値を更新・計算します
    _cartSyncSeqByUser[k] = (_cartSyncSeqByUser[k] || 0) + 1;
    // 結果（_cartSyncSeqByUser[k]）を呼び出し元へ返却します
    return _cartSyncSeqByUser[k];
}


// 現在の AppState.cart 配列を直列チェーン化し、保存同期します（スマホ版はlocalStorage、PC版はMySQL）
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
                // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
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


// 該当ユーザーのカートを取得し（ゲストカート引き継ぎ指定があれば加算合算して）画面更新します（スマホ版はlocalStorage、PC版はMySQL）
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
                const idx = finalCart.findIndex(c => c.id === item.id && c.color === item.color && c.size === item.size);
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
                // 定数 idx を宣言し、値（mergedCurrent.findIndex(c => c.id === …）をセットします
                const idx = mergedCurrent.findIndex(c => c.id === item.id && c.color === item.color && c.size === item.size);
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
        let needPushToServer = false;

        // 条件（mergeItems.length > 0）が成り立つか判定し、該当する場合の処理を実行します
        if (mergeItems.length > 0) {
            // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
            mergeItems.forEach(item => {
                // 定数 idx を宣言し、値（finalCart.findIndex(c => c.id === item…）をセットします
                const idx = finalCart.findIndex(c => c.id === item.id && c.color === item.color && c.size === item.size);
                // 条件（idx > -1）が成り立つか判定し、該当する場合の処理を実行します
                if (idx > -1) {
                    // 変数・配列項目 finalCart[idx].quantity の値を更新・計算します
                    finalCart[idx].quantity = (finalCart[idx].quantity || 1) + (item.quantity || 1);
                // 上記の if 条件に当てはまらなかった場合の分岐処理です
                } else {
                    // 配列の末尾に新しい要素を追加します（finalCart.push({ ...item });）
                    finalCart.push({ ...item });
                }
            });
            // 変数・配列項目 needPushToServer の値を更新・計算します
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


// ヘッダー右側カートアイコン等の数量バッジ（現在合計点数）を再計算して表示更新します
function updateCartBadge() {
    // 条件（!AppState.cart || !Array.isArray(AppState.cart)）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.cart || !Array.isArray(AppState.cart)) {
        // アプリ全体状態 AppState.cart を最新値（[]）に更新します
        AppState.cart = [];
    }
    // 定数 totalCount を宣言し、値（AppState.cart.reduce((sum, item) => su…）をセットします
    const totalCount = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    // HTML 要素 #header-cart-badge を取得して変数 cartBadge に格納します
    const cartBadge = document.getElementById('header-cart-badge');
    // 条件（cartBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (cartBadge) {
        // 文字要素 cartBadge の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        cartBadge.textContent = isNaN(totalCount) ? 0 : totalCount;
    }
}


// 詳細画面で選んだ商品（ID・カラー・サイズ）を AppState.cart へ追加（同一仕様なら数量加算）し、MySQL同期します
async function handleAddToCartFromDetail(productId) {
    // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して product に入れます
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    // 条件（!product）が成り立つか判定し、該当する場合の処理を実行します
    if (!product) return false;

    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して prevCart に保存します
    const prevCart = JSON.parse(JSON.stringify(AppState.cart || []));

    // 定数 currentImg を宣言し、値（(product.colorImages && product.colorI…）をセットします
    const currentImg = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

    // 定数 existingIndex を宣言し、値（AppState.cart.findIndex(）をセットします
    const existingIndex = AppState.cart.findIndex(
        // 変数・配列項目 item の値を更新・計算します
        item => item.id === product.id && item.color === AppState.selectedColor && item.size === AppState.selectedSize
    );

    // 条件（existingIndex > -1）が成り立つか判定し、該当する場合の処理を実行します
    if (existingIndex > -1) {
        // 変数・配列項目 AppState.cart[existingIndex].qua… の値を更新・計算します
        AppState.cart[existingIndex].quantity += 1;
    // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 配列の末尾に新しい要素を追加します（AppState.cart.push({）
        AppState.cart.push({
            // レコード・商品・コーデを識別する ID プロパティをセットします
            id: product.id,
            // 商品名またはアイテム名称
            name: product.name,
            // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
            category: product.category || 'TOPS',
            // カラー名
            color: AppState.selectedColor,
            // 選択サイズ
            size: AppState.selectedSize,
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
        const ok = await syncCartToBackend();
        // 条件（!ok）が成り立つか判定し、該当する場合の処理を実行します
        if (!ok) {
            // アプリ全体状態 AppState.cart を最新値（prevCart）に更新します
            AppState.cart = prevCart;
            // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
            updateCartBadge();
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ MySQLへのカート保存に失敗しました（サーバー接続を確認してください）');
            // 処理結果の基準値として false を呼び出し元へ返して関数を終了します
            return false;
        }
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast(`「${product.name} (${AppState.selectedColor}/${AppState.selectedSize})」をバッグに追加しMySQLに保存しました`);
        // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
        return true;
    }

    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToast(`「${product.name} (${AppState.selectedColor}/${AppState.selectedSize})」をバッグに追加しました（ログインでMySQLに保存）`);
    // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
    return true;
}


// 今すぐ購入ボタン押下時に商品をカートへ追加した上で購入手続きページ('#checkout')へ遷移します
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


// チェックアウト画面の「＋／－」ボタンでカート商品の数量を増減（0個以下なら削除）し、MySQL同期＆合計再計算します
async function updateCartItemQty(index, delta) {
    // 条件（!AppState.cart[index]）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.cart[index]) return;
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して prevCart に保存します
    const prevCart = JSON.parse(JSON.stringify(AppState.cart || []));
    // 変数・配列項目 AppState.cart[index].quantity の値を更新・計算します
    AppState.cart[index].quantity += delta;
    // 条件（AppState.cart[index].quantity <= 0）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.cart[index].quantity <= 0) {
        // 配列の指定位置から要素を取り除いて削除します（AppState.cart.splice(index, 1);）
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


// チェックアウト画面の削除ボタンでカートから該当商品を削除し、MySQL同期＆再描画します
async function removeCartItem(index) {
    // 条件（!AppState.cart[index]）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.cart[index]) return;
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して prevCart に保存します
    const prevCart = JSON.parse(JSON.stringify(AppState.cart || []));
    // 配列の指定位置から要素を取り除いて削除します（AppState.cart.splice(index, 1);）
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


// カート確認・注文手続き画面を描画し、ログイン会員名メール自動補完・利用ポイントリセット・金額計算を行います
function renderCheckoutPage() {
    // HTML 要素 #checkout-cart-list を取得して変数 cartListEl に格納します
    const cartListEl = document.getElementById('checkout-cart-list');
    // HTML 要素 #checkout-subtotal を取得して変数 subtotalEl に格納します
    const subtotalEl = document.getElementById('checkout-subtotal');
    // HTML 要素 #checkout-shipping を取得して変数 shippingEl に格納します
    const shippingEl = document.getElementById('checkout-shipping');
    // HTML 要素 #checkout-tax を取得して変数 taxEl に格納します
    const taxEl = document.getElementById('checkout-tax');
    // HTML 要素 #checkout-total を取得して変数 totalEl に格納します
    const totalEl = document.getElementById('checkout-total');
    // HTML 要素 #checkout-layout-main を取得して変数 mainLayout に格納します
    const mainLayout = document.getElementById('checkout-layout-main');
    // HTML 要素 #order-completed-view を取得して変数 completedView に格納します
    const completedView = document.getElementById('order-completed-view');

    // 条件（completedView）が成り立つか判定し、該当する場合の処理を実行します
    if (completedView) completedView.style.display = 'none';
    // 条件（mainLayout）が成り立つか判定し、該当する場合の処理を実行します
    if (mainLayout) mainLayout.style.display = 'grid';

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
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
        if (subtotalEl) subtotalEl.textContent = "¥0";
        // 条件（shippingEl）が成り立つか判定し、該当する場合の処理を実行します
        if (shippingEl) shippingEl.textContent = "¥0";
        // 条件（taxEl）が成り立つか判定し、該当する場合の処理を実行します
        if (taxEl) taxEl.textContent = "¥0";
        // 条件（totalEl）が成り立つか判定し、該当する場合の処理を実行します
        if (totalEl) totalEl.textContent = "¥0";
        // HTML 要素 #btn-place-order を取得して変数 placeBtn に格納します
        const placeBtn = document.getElementById('btn-place-order');
        // 条件（placeBtn）が成り立つか判定し、該当する場合の処理を実行します
        if (placeBtn) placeBtn.disabled = true;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // HTML 要素 #btn-place-order を取得して変数 placeBtn に格納します
    const placeBtn = document.getElementById('btn-place-order');
    // 条件（placeBtn）が成り立つか判定し、該当する場合の処理を実行します
    if (placeBtn) placeBtn.disabled = false;

    // 条件（cartListEl）が成り立つか判定し、該当する場合の処理を実行します
    if (cartListEl) {
        // 生成・変換した HTML 文字列を要素 cartListEl の中身として描画します
        cartListEl.innerHTML = AppState.cart.map((item, idx) => `
            <div class="cart-item-row">
                <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22800%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20800%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22600%22%20height%3D%22800%22%2F%3E%3Cpath%20d%3D%22M250%20320%20L350%20320%20L370%20420%20L230%20420%20Z%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%223%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22480%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20letter-spacing%3D%222%22%3EMANEKIN%20COLLECTION%3C%2Ftext%3E%3C%2Fsvg%3E'">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-meta">カラー: <strong>${item.color}</strong> | サイズ: <strong>${item.size}</strong></p>
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
        const orderName = document.getElementById('order-name');
        // HTML 要素 #order-email を取得して変数 orderEmail に格納します
        const orderEmail = document.getElementById('order-email');
        // 条件（orderName && !orderName.value.trim() && AppState.cur…）が成り立つか判定し、該当する場合の処理を実行します
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
    updateCheckoutCalculations();
}


// ==========================================================================
//  4. チェックアウト（購入手続き）・ポイント割引計算・注文確定トランザクション
// ==========================================================================
// 現在ログイン中の会員が持つ利用可能ポイント残高（数値）を返します（初期ポイントは0から）
function getUserPoints() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser) return 0;
    // 条件（AppState.currentUser.points === undefined || AppState.currentUser.points === null）
    if (AppState.currentUser.points === undefined || AppState.currentUser.points === null) {
        // 初期配布はクーポンに変更されたため、ポイントは 0 からスタートします
        AppState.currentUser.points = 0;
    }
    // 結果（AppState.currentUser.points）を呼び出し元へ返却します
    return AppState.currentUser.points;
}


// 注文でのポイント増減後に AppState.currentUser.points と表示UIを最新値へ更新します（スマホ版はlocalStorageも更新）
function setUserPoints(points) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser) return;
    // アプリ全体状態 AppState.currentUser.points を最新値（Math.max(0, points)）に更新します
    AppState.currentUser.points = Math.max(0, points);

    // スマホ版の場合は localStorage のユーザー情報にもポイント残高を反映します
    if (isMobileLocalStorageMode()) {
        lsSetJson('manekin_ls_current_user', AppState.currentUser);
        const users = lsGetJson('manekin_ls_users', []);
        const uIdx = users.findIndex(u => String(u.id) === String(AppState.currentUser.id));
        if (uIdx > -1) {
            users[uIdx].points = AppState.currentUser.points;
            lsSetJson('manekin_ls_users', users);
        }
    }

    // HTML 要素 #mypage-points を取得して変数 mypagePoints に格納します
    const mypagePoints = document.getElementById('mypage-points');
    // 条件（mypagePoints）が成り立つか判定し、該当する場合の処理を実行します
    if (mypagePoints) {
        // テンプレートリテラルで組み立てた HTML を要素 mypagePoints 内に書き込んで画面を更新します
        mypagePoints.innerHTML = `${AppState.currentUser.points.toLocaleString()} <span class="stat-unit">pt</span>`;
    }
}


// 再代入可能な変数 checkoutUsedPoints を宣言し、値（0）をセットします
let checkoutUsedPoints = 0;
// 現在チェックアウトで適用されているクーポンオブジェクト（未適用時は null）
let currentAppliedCoupon = null;

// ユーザーの保有クーポン一覧を取得して同期します（スマホ版はlocalStorage、PC版はAPI）
async function fetchUserCoupons() {
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        AppState.userCoupons = [];
        renderCheckoutCoupons();
        return [];
    }
    const uid = AppState.currentUser.id;

    // スマホ版の場合は localStorage から所持クーポンを読み込みます
    if (isMobileLocalStorageMode()) {
        ensureMobileUserInitialized(AppState.currentUser);
        const savedCoupons = lsGetJson(`manekin_ls_coupons_${uid}`, []);
        AppState.userCoupons = Array.isArray(savedCoupons) ? savedCoupons : [];
        renderCheckoutCoupons();
        const mypageCouponCount = document.getElementById('mypage-coupon-count');
        if (mypageCouponCount) {
            const activeCoupons = (AppState.userCoupons || []).filter(c => !c.is_used);
            mypageCouponCount.innerHTML = `${activeCoupons.length} <span class="stat-unit">枚</span>`;
        }
        return AppState.userCoupons;
    }

    const apiBase = getApiBaseUrl();
    try {
        const resp = await fetch(`${apiBase}/api/coupons?user_id=${AppState.currentUser.id}`, {
            credentials: 'include'
        });
        const data = await resp.json().catch(() => ({}));
        if (resp.ok && Array.isArray(data.coupons)) {
            AppState.userCoupons = data.coupons;
        } else {
            AppState.userCoupons = [];
        }
    } catch (e) {
        console.warn('クーポン取得エラー:', e);
        AppState.userCoupons = [];
    }
    renderCheckoutCoupons();
    // マイページのクーポン枚数バッジも更新
    const mypageCouponCount = document.getElementById('mypage-coupon-count');
    if (mypageCouponCount) {
        const activeCoupons = (AppState.userCoupons || []).filter(c => !c.is_used);
        mypageCouponCount.innerHTML = `${activeCoupons.length} <span class="stat-unit">枚</span>`;
    }
    return AppState.userCoupons;
}

// チェックアウト画面の所持クーポン一覧を描画します
function renderCheckoutCoupons() {
    const listEl = document.getElementById('checkout-coupons-list');
    const badgeEl = document.getElementById('checkout-coupon-status-badge');
    const cancelBtn = document.getElementById('btn-cancel-coupon');
    const codeInput = document.getElementById('checkout-coupon-code-input');
    if (!listEl) return;

    const coupons = AppState.userCoupons || [];
    const availableCoupons = coupons.filter(c => !c.is_used);

    if (currentAppliedCoupon) {
        if (badgeEl) badgeEl.textContent = `✓ ${currentAppliedCoupon.name} 適用中`;
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        if (codeInput) codeInput.value = currentAppliedCoupon.code;
    } else {
        if (badgeEl) badgeEl.textContent = availableCoupons.length > 0 ? `${availableCoupons.length}枚のクーポン利用可能` : '利用可能なクーポンはありません';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }

    if (availableCoupons.length === 0) {
        listEl.innerHTML = `<p style="font-size: 0.78rem; color: #888; margin: 0;">所持している未使用クーポンはありません（コード直接入力も可能です）</p>`;
        return;
    }

    listEl.innerHTML = availableCoupons.map(c => {
        const isApplied = currentAppliedCoupon && currentAppliedCoupon.code === c.code;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: ${isApplied ? '#ffedd5' : '#ffffff'}; border: 1px solid ${isApplied ? '#ea580c' : '#fed7aa'}; border-radius: 6px;">
                <div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #111;">${c.name}</div>
                    <div style="font-size: 0.72rem; color: #666;">コード: <strong style="color: #c2410c;">${c.code}</strong> | ${c.discount_label}</div>
                </div>
                <div>
                    ${isApplied
                        ? `<button type="button" class="btn btn-outline-xs" onclick="handleCancelCoupon()" style="padding: 4px 10px; font-size: 0.75rem; color: #888; border-color: #ccc;">適用解除</button>`
                        : `<button type="button" class="btn btn-outline-xs" onclick="handleApplyCouponCode('${c.code}')" style="padding: 4px 12px; font-size: 0.75rem; font-weight: 700; color: #ea580c; border-color: #ea580c;">適用する</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// クーポンコードの適用処理（何割引きクーポン）
function handleApplyCouponCode(code) {
    const input = document.getElementById('checkout-coupon-code-input');
    const targetCode = (code || (input ? input.value : '')).trim().toUpperCase();

    if (!targetCode) {
        showToast('クーポンコードを入力してください');
        return;
    }

    // ユーザー所持クーポンまたはビルトイン（WELCOME10 等）を検索
    let coupon = (AppState.userCoupons || []).find(c => c.code === targetCode && !c.is_used);

    // 未所持でも WELCOME10（初回限定1割引クーポン）なら即時適用可能
    if (!coupon && targetCode === 'WELCOME10') {
        coupon = {
            code: 'WELCOME10',
            name: '【初回限定】1割引クーポン (10% OFF)',
            discount_rate: 0.10,
            discount_label: '1割引 (10% OFF)',
            is_used: 0
        };
    }

    if (!coupon) {
        showToast(`⚠️ クーポン「${targetCode}」は見つからないか、既に使用済みです`);
        return;
    }

    currentAppliedCoupon = coupon;
    renderCheckoutCoupons();
    updateCheckoutCalculations();
    showToast(`🎉 クーポン「${coupon.name}」を適用しました！（商品代金から ${coupon.discount_label} 引き）`);
}

// クーポンの適用解除
function handleCancelCoupon() {
    currentAppliedCoupon = null;
    const input = document.getElementById('checkout-coupon-code-input');
    if (input) input.value = '';
    renderCheckoutCoupons();
    updateCheckoutCalculations();
    showToast('クーポンの適用を解除しました');
}


// カート小計・送料(5,000円以上無料 / 未満550円)・クーポン割引・利用ポイント割引・最終支払額をリアルタイム計算します
// ※重要: ポイントは配送料には影響せず、確実に配送料は払う必要があります（ポイント上限は割引後小計まで）
function updateCheckoutCalculations() {
    // HTML 要素の取得
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const pointDiscountRow = document.getElementById('checkout-point-discount-row');
    const pointDiscountEl = document.getElementById('checkout-point-discount');
    const couponDiscountRow = document.getElementById('checkout-coupon-discount-row');
    const couponDiscountLabel = document.getElementById('checkout-coupon-discount-label');
    const couponDiscountEl = document.getElementById('checkout-coupon-discount');
    const earnedPointsEl = document.getElementById('checkout-earned-points');
    const userPointsEl = document.getElementById('checkout-user-points');
    const pointInput = document.getElementById('checkout-use-points');
    const pointMessage = document.getElementById('checkout-point-message');

    // 商品小計
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // 配送料（5,000円以上無料 / 未満550円）
    const shipping = subtotal >= 5000 ? 0 : 550;

    // クーポン割引（商品小計に対して何割引きかを適用）
    let couponDiscount = 0;
    if (currentAppliedCoupon && subtotal > 0) {
        const rate = currentAppliedCoupon.discount_rate || 0.10;
        couponDiscount = Math.round(subtotal * rate);
    }
    // クーポン適用後の商品小計
    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

    // ポイント利用計算:
    // 【仕様】ポイントは配送料には影響せず、確実に配送料は払う必要がある。
    // そのため、ポイントが充当できる上限は「割引後商品小計（discountedSubtotal）」まで！配送料には一切使えません。
    const availablePoints = getUserPoints();
    if (userPointsEl) userPointsEl.textContent = availablePoints.toLocaleString();

    const maxUsablePoints = Math.min(availablePoints, discountedSubtotal);

    if (checkoutUsedPoints > maxUsablePoints) {
        checkoutUsedPoints = maxUsablePoints;
    }
    if (checkoutUsedPoints < 0) {
        checkoutUsedPoints = 0;
    }

    if (pointInput && document.activeElement !== pointInput) {
        pointInput.value = checkoutUsedPoints > 0 ? checkoutUsedPoints : '';
    }

    // 最終お支払い金額: (割引後小計 - ポイント) + 配送料（※確実に配送料は加算されます）
    const netTotal = (discountedSubtotal - checkoutUsedPoints) + shipping;
    const tax = Math.round(netTotal * 10 / 110);
    const earnedPoints = netTotal > 0 ? Math.max(1, Math.floor(netTotal * 0.01)) : 0;

    if (subtotalEl) subtotalEl.textContent = `¥${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "無料 (5,000円以上)" : `¥${shipping.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `¥${tax.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `¥${netTotal.toLocaleString()}`;

    // クーポン割引行の更新
    if (couponDiscountRow && couponDiscountEl) {
        if (couponDiscount > 0 && currentAppliedCoupon) {
            couponDiscountRow.style.display = 'flex';
            if (couponDiscountLabel) couponDiscountLabel.textContent = `クーポン割引 (${currentAppliedCoupon.discount_label || '10% OFF'})`;
            couponDiscountEl.textContent = `-¥${couponDiscount.toLocaleString()}`;
        } else {
            couponDiscountRow.style.display = 'none';
        }
    }

    // ポイント割引行の更新
    if (pointDiscountRow && pointDiscountEl) {
        if (checkoutUsedPoints > 0) {
            pointDiscountRow.style.display = 'flex';
            pointDiscountEl.textContent = `-¥${checkoutUsedPoints.toLocaleString()}`;
        } else {
            pointDiscountRow.style.display = 'none';
        }
    }

    if (earnedPointsEl) {
        earnedPointsEl.textContent = `+${earnedPoints.toLocaleString()} pt`;
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


// 利用ポイント数入力欄の手入力値を保有ポイント・上限金額以内に丸め、支払額を再計算します
function handlePointsInputChange() {
    // HTML 要素 #checkout-use-points を取得して変数 pointInput に格納します
    const pointInput = document.getElementById('checkout-use-points');
    // 定数 val を宣言し、値（parseInt(pointInput ? pointInput.value…）をセットします
    const val = parseInt(pointInput ? pointInput.value : 0, 10) || 0;
    // 変数・配列項目 checkoutUsedPoints の値を更新・計算します
    checkoutUsedPoints = Math.max(0, val);
    // 関連処理 updateCheckoutCalculations() を呼び出して処理・画面を更新します
    updateCheckoutCalculations();
}


// 「すべて使う」ボタン押下時に保有ポイントとお支払い金額（商品代金上限）の小さい方を自動入力します
// ※配送料にはポイントを使えないため、商品代金が上限となります
function handleUseAllPoints() {
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let couponDiscount = 0;
    if (currentAppliedCoupon && subtotal > 0) {
        couponDiscount = Math.round(subtotal * (currentAppliedCoupon.discount_rate || 0.10));
    }
    const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
    const available = getUserPoints();

    if (available <= 0) {
        showToast('現在ご利用可能な保有ポイントはありません（保有ポイント: 0 pt）');
        return;
    }

    // 配送料にはポイントを使えないため、割引後小計を上限とする
    checkoutUsedPoints = Math.min(available, discountedSubtotal);
    const pointInput = document.getElementById('checkout-use-points');
    if (pointInput) pointInput.value = checkoutUsedPoints;
    updateCheckoutCalculations();
    showToast(`✨ 保有ポイントから ${checkoutUsedPoints.toLocaleString()} pt（${checkoutUsedPoints.toLocaleString()}円分）を商品代金に適用しました（※配送料はポイント対象外です）`);
}


// 「解除」ボタン押下時に利用ポイントを 0 に戻して再計算します
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


// 注文履歴から過去の購入服をワンクリックでマイクローゼットへ取り込みます（スマホ版はlocalStorage、PC版はMySQL）
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
    if (typeof bumpClosetMutationSeq === 'function') bumpClosetMutationSeq();

    // スマホ版の場合は localStorage のクローゼットに直接追加します
    if (isMobileLocalStorageMode()) {
        for (let i = 0; i < itemsList.length; i++) {
            const it = itemsList[i];
            const itName = it.name || it.product_name || '購入商品';
            const itColor = it.color || 'BLACK';
            const itId = it.id || it.product_id || Date.now();
            const productMaster = (typeof SAMPLE_PRODUCTS !== 'undefined') ? SAMPLE_PRODUCTS.find(p => p.id === itId) : null;
            const itCategory = it.category || (productMaster ? productMaster.category : 'TOPS');
            const itImg = it.image || it.image_url || 'assets/images/men/スカイオックスフォードシャツ.png';
            const itPrice = it.price || it.unit_price || 0;

            const exists = AppState.myCloset.some(c => c.name === itName && c.color === itColor);
            if (!exists) {
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
                AppState.myCloset.unshift(newItem);
                added++;
            }
        }
        if (added > 0) {
            lsSetJson(`manekin_ls_closet_${userId}`, AppState.myCloset);
            if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
            if (typeof renderPaneClosetGrid === 'function') renderPaneClosetGrid();
            showToast(`👗 注文商品をマイクローゼットに登録しました（${added}点）`);
        } else {
            showToast('この注文の商品はすでにマイクローゼットに登録済みです');
        }
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
                        // 新規追加された最新データを配列 AppState.myCloset の先頭へ挿入して即画面反映します
                        AppState.myCloset.unshift(newItem);
                        // 変数・配列項目 added の値を更新・計算します
                        added++;
                    }
                // 上記の if 条件に当てはまらなかった場合の分岐処理です
                } else {
                    // 変数・配列項目 failed の値を更新・計算します
                    failed++;
                }
            // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
            } catch (e) {
                // 変数・配列項目 failed の値を更新・計算します
                failed++;
            }
        }
    }

    // 条件（added > 0）が成り立つか判定し、該当する場合の処理を実行します
    if (added > 0) {
        // 条件（typeof renderStudioClosetList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
        // 条件（typeof renderPaneClosetGrid === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderPaneClosetGrid === 'function') renderPaneClosetGrid();
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast(`👗 注文商品をMySQLのマイクローゼットに登録しました（${added}点）`);
    // 前の if が偽で、かつ（failed > 0）を満たす場合の別条件分岐です
    } else if (failed > 0) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ MySQLへのマイクローゼット登録に失敗しました（サーバー接続を確認してください）');
    // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('この注文の商品はすでにマイクローゼットに登録済みです');
    }
}


// 注文確定ボタン押下時の処理：ログイン確認→配送先バリデーション→POST /api/orders送信→履歴更新→カート空化→完了モーダル表示
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
        AppState.pendingAuthTarget = 'checkout';
        sessionStorage.setItem('manekin_pending_auth_target', 'checkout');
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ ご購入には会員登録またはログインが必要です');
        // 変数・配列項目 window.location.hash の値を更新・計算します
        window.location.hash = '#login';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // HTML 要素 #order-name を取得して変数 nameInput に格納します
    const nameInput = document.getElementById('order-name');
    // HTML 要素 #order-phone を取得して変数 phoneInput に格納します
    const phoneInput = document.getElementById('order-phone');
    // HTML 要素 #order-email を取得して変数 emailInput に格納します
    const emailInput = document.getElementById('order-email');
    // HTML 要素 #order-postal を取得して変数 postalInput に格納します
    const postalInput = document.getElementById('order-postal');
    // HTML 要素 #order-address を取得して変数 addressInput に格納します
    const addressInput = document.getElementById('order-address');
    // HTML 要素 #order-delivery-time を取得して変数 deliveryTimeInput に格納します
    const deliveryTimeInput = document.getElementById('order-delivery-time');
    // CSS セレクタに最初に一致した HTML 要素を取得して変数 paymentRadio に入れます
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
    const placeBtn = document.getElementById('btn-place-order');
    // 定数 restorePlaceBtn を宣言し、値（() => {）をセットします
    const restorePlaceBtn = () => {
        // 条件（placeBtn）が成り立つか判定し、該当する場合の処理を実行します
        if (placeBtn) {
            // 変数・配列項目 placeBtn.disabled の値を更新・計算します
            placeBtn.disabled = false;
            // 生成・変換した HTML 文字列を要素 placeBtn の中身として描画します
            placeBtn.innerHTML = '<span class="order-btn-text">注文を確定する</span><span class="order-btn-sub">（Python &amp; MySQLへ保存されます）</span>';
        }
    };
    // 条件（placeBtn）が成り立つか判定し、該当する場合の処理を実行します
    if (placeBtn) {
        // 変数・配列項目 placeBtn.disabled の値を更新・計算します
        placeBtn.disabled = true;
        // 生成・変換した HTML 文字列を要素 placeBtn の中身として描画します
        placeBtn.innerHTML = '<span class="order-btn-text">注文を確定中... (MySQLへ保存)</span>';
    }

    // 定数 calc を宣言し、値（updateCheckoutCalculations()）をセットします
    const calc = updateCheckoutCalculations();

    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 定数 orderPayload を宣言し、値（{）をセットします
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
    bumpCartUserSeq(targetUserId);
    // 変数・配列項目 _ordersMutationSeq の値を更新・計算します
    _ordersMutationSeq++;
    // 先行する非同期通信の完了を待機します（万一失敗してもエラーで止まらず続行）
    try { await _cartSyncPromise; } catch (e) { }

    // スマホ版の場合は localStorage 上で注文データを生成・保存します
    if (isMobileLocalStorageMode()) {
        const now = new Date();
        const rand4 = Math.floor(1000 + Math.random() * 9000);
        confirmedOrder = {
            order_no: `ORD-${now.getFullYear()}-${rand4}`,
            user_id: targetUserId,
            customer_name: orderPayload.customer_name,
            customer_email: orderPayload.customer_email,
            phone: orderPayload.phone,
            postal_code: orderPayload.postal_code,
            address: orderPayload.address,
            payment_method: orderPayload.payment_method,
            delivery_time: orderPayload.delivery_time,
            date: now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
            subtotal: orderPayload.subtotal,
            shipping_fee: orderPayload.shipping_fee,
            coupon_code: orderPayload.coupon_code,
            coupon_discount: orderPayload.coupon_discount,
            used_points: orderPayload.used_points,
            total_amount: orderPayload.total_amount,
            earned_points: orderPayload.earned_points,
            status: '発送準備中',
            items: JSON.parse(JSON.stringify(AppState.cart || []))
        };
    } else {
        // PC版：通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
        try {
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
            restorePlaceBtn();
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
    }

    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) {
        // 専用ヘルパー関数 restorePlaceBtn() を実行して状態や表示ラベルを更新します
        restorePlaceBtn();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 itemSummaryList を宣言し、値（confirmedOrder.items.map(it => `${it.n…）をセットします
    const itemSummaryList = confirmedOrder.items.map(it => `${it.name} (${it.color} / ${it.size}) × ${it.quantity}`);
    // 変数・配列項目 confirmedOrder.items_summary の値を更新・計算します
    confirmedOrder.items_summary = itemSummaryList.join(", ");

    // 定数 currentPts を宣言し、値（getUserPoints()）をセットします
    const currentPts = getUserPoints();
    // 定数 updatedPts を宣言し、値（backendUpdatedPoints !== null ? backen…）をセットします
    const updatedPts = backendUpdatedPoints !== null ? backendUpdatedPoints : (Math.max(0, currentPts - calc.usedPoints) + calc.earnedPoints);
    // 専用ヘルパー関数 setUserPoints() を実行して状態や表示ラベルを更新します
    setUserPoints(updatedPts);

    // 条件（typeof bumpClosetMutationSeq === 'function'）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof bumpClosetMutationSeq === 'function') bumpClosetMutationSeq();
    // 定数 purchasedItems を宣言し、値（[...confirmedOrder.items]）をセットします
    const purchasedItems = [...confirmedOrder.items];
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    purchasedItems.forEach((it, idx) => {
        // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して productMaster に入れます
        const productMaster = (typeof SAMPLE_PRODUCTS !== 'undefined') ? SAMPLE_PRODUCTS.find(p => p.id === (it.id || it.product_id)) : null;
        // 定数 cat を宣言し、値（it.category || (productMaster ? produc…）をセットします
        const cat = it.category || (productMaster ? productMaster.category : 'TOPS');
        // 定数 exists を宣言し、値（AppState.myCloset.some(c => c.name ===…）をセットします
        const exists = AppState.myCloset.some(c => c.name === it.name && c.color === it.color);
        // 条件（!exists）が成り立つか判定し、該当する場合の処理を実行します
        if (!exists) {
            // 新規追加された最新データを配列 AppState.myCloset の先頭へ挿入して即画面反映します
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

    // 購入者のお名前を注文データに確実に紐付けます（誰が購入したか保存）
    if (!confirmedOrder.customer_name && AppState.currentUser) {
        confirmedOrder.customer_name = AppState.currentUser.name;
    }
    // 使用したクーポンを消滅（1回限り有効）させます
    if (currentAppliedCoupon) {
        if (Array.isArray(AppState.userCoupons)) {
            const usedC = AppState.userCoupons.find(c => c.code === currentAppliedCoupon.code);
            if (usedC) {
                usedC.is_used = 1;
            }
        }
        if (isMobileLocalStorageMode()) {
            lsSetJson(`manekin_ls_coupons_${targetUserId}`, AppState.userCoupons || []);
        }
        currentAppliedCoupon = null;
        renderCheckoutCoupons();
    }

    // 新規追加された最新データを配列 AppState.orderHistory の先頭へ挿入して即画面反映します
    AppState.orderHistory.unshift(confirmedOrder);

    // アプリ全体状態 AppState.cart を最新値（[]）に更新します
    AppState.cart = [];
    // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
    updateCartBadge();
    // 変数・配列項目 checkoutUsedPoints の値を更新・計算します
    checkoutUsedPoints = 0;

    // スマホ版の場合は注文履歴・クローゼット・空になったカートを localStorage に保存します
    if (isMobileLocalStorageMode()) {
        lsSetJson(`manekin_ls_orders_${targetUserId}`, AppState.orderHistory);
        lsSetJson(`manekin_ls_closet_${targetUserId}`, AppState.myCloset);
        lsSetJson(`manekin_ls_cart_${targetUserId}`, []);
    }

    // 専用ヘルパー関数 restorePlaceBtn() を実行して状態や表示ラベルを更新します
    restorePlaceBtn();

    // HTML 要素 #checkout-layout-main を取得して変数 mainLayout に格納します
    const mainLayout = document.getElementById('checkout-layout-main');
    // HTML 要素 #order-completed-view を取得して変数 completedView に格納します
    const completedView = document.getElementById('order-completed-view');
    // HTML 要素 #comp-order-no を取得して変数 compOrderNo に格納します
    const compOrderNo = document.getElementById('comp-order-no');
    // HTML 要素 #comp-order-date を取得して変数 compOrderDate に格納します
    const compOrderDate = document.getElementById('comp-order-date');
    // HTML 要素 #comp-order-address を取得して変数 compOrderAddress に格納します
    const compOrderAddress = document.getElementById('comp-order-address');
    // HTML 要素 #comp-order-total を取得して変数 compOrderTotal に格納します
    const compOrderTotal = document.getElementById('comp-order-total');
    // HTML 要素 #comp-earned-points を取得して変数 compEarnedPoints に格納します
    const compEarnedPoints = document.getElementById('comp-earned-points');
    // HTML 要素 #comp-balance-points を取得して変数 compBalancePoints に格納します
    const compBalancePoints = document.getElementById('comp-balance-points');
    // HTML 要素 #completed-closet-msg を取得して変数 closetBannerMsg に格納します
    const closetBannerMsg = document.getElementById('completed-closet-msg');

    // 条件（mainLayout）が成り立つか判定し、該当する場合の処理を実行します
    if (mainLayout) mainLayout.style.display = 'none';
    // 条件（completedView）が成り立つか判定し、該当する場合の処理を実行します
    if (completedView) completedView.style.display = 'block';

    // 条件（compOrderNo）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderNo) compOrderNo.textContent = confirmedOrder.order_no;
    // 条件（compOrderDate）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderDate) compOrderDate.textContent = confirmedOrder.date;
    // 条件（compOrderAddress）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderAddress) compOrderAddress.textContent = confirmedOrder.address;
    // 条件（compOrderTotal）が成り立つか判定し、該当する場合の処理を実行します
    if (compOrderTotal) compOrderTotal.textContent = `¥${confirmedOrder.total_amount.toLocaleString()}`;
    // 条件（compEarnedPoints）が成り立つか判定し、該当する場合の処理を実行します
    if (compEarnedPoints) compEarnedPoints.textContent = `+${calc.earnedPoints.toLocaleString()} pt`;
    // 条件（compBalancePoints）が成り立つか判定し、該当する場合の処理を実行します
    if (compBalancePoints) compBalancePoints.textContent = `${updatedPts.toLocaleString()} pt`;

    // HTML 要素 #comp-db-status を取得して変数 compDbStatus に格納します
    const compDbStatus = document.getElementById('comp-db-status');
    // 条件（compDbStatus）が成り立つか判定し、該当する場合の処理を実行します
    if (compDbStatus) {
        // 文字要素 compDbStatus の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        compDbStatus.textContent = isMobileLocalStorageMode() ? '🟢 スマホ版 (localStorage) 保存完了' : '🟢 MySQL (manekin_db) 保存完了';
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
//  5. 注文履歴同期・MySQL接続再読込・マイページ描画
// ==========================================================================
// 現在ログイン会員の注文履歴を取得して画面更新します（スマホ版はlocalStorage、PC版はバックエンドMySQL）
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
        statusPill.textContent = '🟢 スマホ版 (localStorage 保存モード)';
        statusPill.style.background = '#dcfce7';
        statusPill.style.color = '#15803d';
        statusPill.title = 'スマホ版ではPythonサーバー・MySQLを使わずlocalStorageに保存しています';
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
        setMobileLocalStoragePill();
        if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
            AppState.orderHistory = [];
            renderMyPage();
            return;
        }
        const savedOrders = lsGetJson(`manekin_ls_orders_${AppState.currentUser.id}`, []);
        AppState.orderHistory = Array.isArray(savedOrders) ? savedOrders : [];
        renderMyPage();
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
                // 関連処理 renderMyPage() を呼び出して処理・画面を更新します
                renderMyPage();
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


// 現在のログイン会員の注文履歴を初期化削除します（スマホ版はlocalStorage、PC版はサーバーMySQL）
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
        lsSetJson(`manekin_ls_orders_${targetUserId}`, []);
        AppState.orderHistory = [];
        renderMyPage();
        showToast('このアカウントのご注文履歴を初期化しました（0件）');
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
        // 関連処理 renderMyPage() を呼び出して処理・画面を更新します
        renderMyPage();
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


// マイページの「最新データに更新」ボタン押下時に注文・お気に入り・カート・クローゼットを再取得します
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
        const refreshedUser = await restoreAuthSessionFromBackend();
        if (refreshedUser) {
            AppState.currentUser = refreshedUser;
            if (typeof updateAuthNavUI === 'function') updateAuthNavUI();
        }
        await Promise.all([
            syncOrdersFromBackend(),
            syncFavoritesFromBackend(),
            syncCartFromBackend(),
            fetchUserCoupons(),
            (typeof syncClosetFromBackend === 'function') ? syncClosetFromBackend() : Promise.resolve(),
            (typeof syncOutfitsFromBackend === 'function') ? syncOutfitsFromBackend() : Promise.resolve(),
            (typeof syncStudioStateFromBackend === 'function') ? syncStudioStateFromBackend() : Promise.resolve()
        ]);
        renderMyPage();
        showToast(`✨ スマホ版(localStorage)から最新データを再読込しました！（注文:${AppState.orderHistory.length}件, 服:${AppState.myCloset.length}点, コーデ:${AppState.savedOutfits.length}件, 保有:${getUserPoints().toLocaleString()}pt）`);
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


// マイページ画面に会員ランク・ポイント・注文履歴テーブル・統計・お気に入り商品一覧を描画します
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
    if (mypageCouponCount) {
        const activeCoupons = (AppState.userCoupons || []).filter(c => !c.is_used);
        mypageCouponCount.innerHTML = `${activeCoupons.length} <span class="stat-unit">枚</span>`;
    }

    // 注文履歴見出し横のアカウント表示バッジ（誰の注文履歴か明示）
    const ordersAccountBadge = document.getElementById('orders-account-badge');
    if (ordersAccountBadge) {
        if (AppState.currentUser) {
            ordersAccountBadge.textContent = `${AppState.currentUser.name} 様 (${orderCount}件)`;
            ordersAccountBadge.style.display = 'inline-block';
        } else {
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
//  6. お気に入り管理（ハートボタン状態同期 ＋ MySQL favorites テーブル連動）
// ==========================================================================
// ログイン会員のお気に入り商品ID一覧を取得してハートUIを同期します（スマホ版はlocalStorage、PC版はMySQL）
async function syncFavoritesFromBackend() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // アプリ全体状態 AppState.favorites を最新値（[]）に更新します
        AppState.favorites = [];
        // 関連処理 updateFavoriteBadges() を呼び出して処理・画面を更新します
        updateFavoriteBadges();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;

    // スマホ版の場合は localStorage からお気に入り一覧を取得します
    if (isMobileLocalStorageMode()) {
        const savedFavs = lsGetJson(`manekin_ls_favorites_${targetUserId}`, []);
        AppState.favorites = Array.isArray(savedFavs) ? savedFavs : [];
        updateFavoriteBadges();
        if (AppState.currentDetailId && typeof syncAllFavoriteButtons === 'function') {
            syncAllFavoriteButtons(AppState.currentDetailId, AppState.favorites.includes(AppState.currentDetailId));
        }
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
        if (typeof renderHomeProducts === 'function') renderHomeProducts();
        if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
        if (typeof renderNewItems === 'function') renderNewItems();
        if (typeof renderMyPage === 'function') renderMyPage();
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
                AppState.favorites = data.favorites;
                // 関連処理 updateFavoriteBadges() を呼び出して処理・画面を更新します
                updateFavoriteBadges();
                // 条件（AppState.currentDetailId && typeof syncAllFavoriteBu…）が成り立つか判定し、該当する場合の処理を実行します
                if (AppState.currentDetailId && typeof syncAllFavoriteButtons === 'function') {
                    // 関連処理 syncAllFavoriteButtons() を呼び出して処理・画面を更新します
                    syncAllFavoriteButtons(AppState.currentDetailId, AppState.favorites.includes(AppState.currentDetailId));
                }
                // 条件（typeof renderStudioBrandList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
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


// ハートボタン押下時のお気に入り登録／解除トグル処理を行います（スマホ版はlocalStorage、PC版はMySQL保存）
async function handleToggleFavorite(productId) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ お気に入りを保存するにはログインが必要です');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 変数・配列項目 _favoritesMutationSeq の値を更新・計算します
    _favoritesMutationSeq++;

    // スマホ版の場合は localStorage でお気に入りをトグル保存します
    if (isMobileLocalStorageMode()) {
        const index = AppState.favorites.indexOf(productId);
        let isAdded = false;
        if (index === -1) {
            AppState.favorites.push(productId);
            isAdded = true;
        } else {
            AppState.favorites.splice(index, 1);
            isAdded = false;
        }
        lsSetJson(`manekin_ls_favorites_${targetUserId}`, AppState.favorites);
        updateFavoriteBadges();
        syncAllFavoriteButtons(productId, isAdded);
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        if (window.location.hash === '#favorites') renderFavoriteProducts();
        if (typeof renderMyPage === 'function') renderMyPage();
        showToast(isAdded ? 'お気に入りに追加しました' : 'お気に入りから解除しました');
        return;
    }

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/favorites/toggle）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${getApiBaseUrl()}/api/favorites/toggle`, {
            // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
            method: 'POST',
            // サーバーへ送るデータの形式が JSON であることを伝える Content-Type ヘッダです
            headers: { 'Content-Type': 'application/json' },
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include',
            // JavaScript オブジェクトを JSON 文字列へ変換して送信ボディに乗せます
            body: JSON.stringify({
                // 対象商品のマスタ ID をセットします
                product_id: productId,
                // MySQL でどの会員アカウントのデータか区別するための user_id をセットします
                user_id: targetUserId
            })
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('Favorite toggle API failed');
        // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
        const data = await res.json();
        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;

        // 定数 isAdded を宣言し、値（(data.action === 'added')）をセットします
        const isAdded = (data.action === 'added');
        // 定数 index を宣言し、値（AppState.favorites.indexOf(productId)）をセットします
        const index = AppState.favorites.indexOf(productId);
        // 条件（isAdded && index === -1）が成り立つか判定し、該当する場合の処理を実行します
        if (isAdded && index === -1) {
            // 配列の末尾に新しい要素を追加します（AppState.favorites.push(productId);）
            AppState.favorites.push(productId);
        // 前の if が偽で、かつ（!isAdded && index > -1）を満たす場合の別条件分岐です
        } else if (!isAdded && index > -1) {
            // 配列の指定位置から要素を取り除いて削除します（AppState.favorites.splice(index, 1);）
            AppState.favorites.splice(index, 1);
        }

        // 関連処理 updateFavoriteBadges() を呼び出して処理・画面を更新します
        updateFavoriteBadges();
        // 関連処理 syncAllFavoriteButtons() を呼び出して処理・画面を更新します
        syncAllFavoriteButtons(productId, isAdded);
        // 条件（typeof renderStudioBrandList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        // 条件（window.location.hash === '#favorites'）が成り立つか判定し、該当する場合の処理を実行します
        if (window.location.hash === '#favorites') {
            // 関連処理 renderFavoriteProducts() を呼び出して処理・画面を更新します
            renderFavoriteProducts();
        }
        // 条件（typeof renderMyPage === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderMyPage === 'function') renderMyPage();

        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast(isAdded ? 'お気に入りに追加しました（MySQL保存）' : 'お気に入りから解除しました（MySQL保存）');
    // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLお気に入り更新エラー:', e);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast('⚠️ MySQLへお気に入りを保存できませんでした（サーバー接続を確認してください）');
    }
}


// 画面上のすべてのハートボタンと「お気に入り登録済み」ボタン見た目を AppState.favorites に合わせて一括同期します
function syncAllFavoriteButtons(productId, isFavorite) {
    // CSS セレクタに一致する複数要素リストを取得し変数 cards に入れます
    const cards = document.querySelectorAll(`.product-card[data-id="${productId}"]`);
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    cards.forEach(card => {
        // 定数 btn を宣言し、値（card.querySelector('.fav-btn')）をセットします
        const btn = card.querySelector('.fav-btn');
        // 条件（btn）が成り立つか判定し、該当する場合の処理を実行します
        if (btn) {
            // 条件（isFavorite）が成り立つか判定し、該当する場合の処理を実行します
            if (isFavorite) {
                // 要素に CSS クラスを付与して見た目・表示状態を変更します（btn.classList.add('is-favorite');）
                btn.classList.add('is-favorite');
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
            } else {
                // 要素から CSS クラスを外して強調や表示を戻します（btn.classList.remove('is-favorite');）
                btn.classList.remove('is-favorite');
            }
        }
    });

    // HTML 要素 #detail-fav-btn を取得して変数 detailFavBtn に格納します
    const detailFavBtn = document.getElementById('detail-fav-btn');
    // 条件（detailFavBtn && AppState.currentDetailId === product…）が成り立つか判定し、該当する場合の処理を実行します
    if (detailFavBtn && AppState.currentDetailId === productId) {
        // 条件（isFavorite）が成り立つか判定し、該当する場合の処理を実行します
        if (isFavorite) {
            // 要素に CSS クラスを付与して見た目・表示状態を変更します（detailFavBtn.classList.add('is-favorite');）
            detailFavBtn.classList.add('is-favorite');
            // テンプレートリテラルで組み立てた HTML を要素 detailFavBtn 内に書き込んで画面を更新します
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0z"></path>
                </svg>
                お気に入り解除
            `;
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 要素から CSS クラスを外して強調や表示を戻します（detailFavBtn.classList.remove('is-favorite…）
            detailFavBtn.classList.remove('is-favorite');
            // テンプレートリテラルで組み立てた HTML を要素 detailFavBtn 内に書き込んで画面を更新します
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                お気に入りに追加
            `;
        }
    }
}


// ヘッダーやタブ等のお気に入り件数バッジ（.icon-badge 等）を一括更新します
function updateFavoriteBadges() {
    // 定数 count を宣言し、値（AppState.favorites.length）をセットします
    const count = AppState.favorites.length;
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


// お気に入り一覧画面('#favorites')に該当商品カード（0件時は案内カード）を描画します
function renderFavoriteProducts() {
    // HTML 要素 #favorite-product-grid を取得して変数 favGrid に格納します
    const favGrid = document.getElementById('favorite-product-grid');
    // 条件（!favGrid）が成り立つか判定し、該当する場合の処理を実行します
    if (!favGrid) return;

    // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して favoriteItems に入れます
    const favoriteItems = SAMPLE_PRODUCTS.filter(p => AppState.favorites.includes(p.id));
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
        // 生成・変換した HTML 文字列を要素 favGrid の中身として描画します
        favGrid.innerHTML = favoriteItems.map(p => createProductCardHTML(p)).join('');
    }
}


// ==========================================================================
//  7. 会員認証 UI（ログイン・新規登録・デモログイン・ログアウト）
// ==========================================================================
// ヘッダーやマイページのログイン状態表示（ユーザーアイコンのオンライン表示など）を切り替えます
function updateAuthNavUI() {
    // HTML 要素 #nav-auth-link を取得（ナビから削除された場合は null）
    const authLink = document.getElementById('nav-auth-link');
    // HTML 要素 #mobile-login-link を取得（ナビから削除された場合は null）
    const mobileLoginLink = document.getElementById('mobile-login-link');
    // HTML 要素 #mobile-register-link を取得（ナビから削除された場合は null）
    const mobileRegisterLink = document.getElementById('mobile-register-link');
    // ヘッダーのユーザーアイコン（マイページ遷移）横のステータスドット
    const headerUserOnlineDot = document.getElementById('header-user-online-dot');
    const headerUserBtn = document.getElementById('header-user-btn');

    // 条件（AppState.currentUser）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser) {
        if (headerUserOnlineDot) headerUserOnlineDot.style.display = 'block';
        if (headerUserBtn) headerUserBtn.title = `${AppState.currentUser.name || '会員'} 様でログイン中（マイページへ）`;
        if (authLink) {
            authLink.textContent = 'LOGOUT';
            authLink.href = 'javascript:void(0)';
            authLink.onclick = handleLogout;
        }
        if (mobileLoginLink) {
            mobileLoginLink.textContent = 'LOGOUT (ログアウト)';
            mobileLoginLink.href = 'javascript:void(0)';
            mobileLoginLink.onclick = handleLogout;
        }
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'none';
    // 上記の if 条件に当てはまらなかった場合の分岐処理です（未ログイン・ゲスト）
    } else {
        if (headerUserOnlineDot) headerUserOnlineDot.style.display = 'none';
        if (headerUserBtn) headerUserBtn.title = 'マイページ / ログイン';
        if (authLink) {
            authLink.textContent = 'LOGIN';
            authLink.href = '#login';
            authLink.onclick = null;
        }
        if (mobileLoginLink) {
            mobileLoginLink.textContent = 'LOGIN (ログイン)';
            mobileLoginLink.href = '#login';
            mobileLoginLink.onclick = null;
        }
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'block';
    }
}


// ログアウト実行：スマホ版はlocalStorageのログインセッションを解除、PC版はPOST /api/auth/logoutでサーバーセッションを破棄し、HOMEへ戻ります
async function handleLogout(e) {
    // 条件（e && typeof e.preventDefault === 'function'）が成り立つか判定し、該当する場合の処理を実行します
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    // スマホ版のlocalStorageログインセッションをクリアします
    try {
        window.localStorage.removeItem('manekin_ls_current_user');
    } catch (e) {}

    // PC版の場合はバックエンド API（/api/auth/logout）へリクエストを送信します
    if (!isMobileLocalStorageMode()) {
        try {
            await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
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


// ログイン成功後に確実にHOME画面へ自動復帰する関数（どこにも行かず一旦HOMEに戻る）
async function redirectToHome(user, options = {}) {
    // 保持していた一時遷移先を完全にクリア
    AppState.pendingAuthTarget = null;
    try {
        sessionStorage.removeItem('manekin_pending_auth_target');
        localStorage.removeItem('manekin_pending_auth_target');
    } catch (e) {}

    // 1. DOM上の全.page-viewからactiveを外し、確実に#view-homeを表示
    const allViews = document.querySelectorAll('.page-view');
    allViews.forEach(v => v.classList.remove('active'));
    const homeView = document.getElementById('view-home');
    if (homeView) homeView.classList.add('active');

    // 2. ナビゲーションのハイライトもHOMEに更新
    const allNavs = document.querySelectorAll('.nav-link, .mobile-nav-link');
    allNavs.forEach(n => n.classList.remove('active'));
    const homeNav = document.querySelector('.nav-link[data-nav="home"]');
    if (homeNav) homeNav.classList.add('active');

    // 3. URLハッシュを#homeに更新（ブラウザURLと履歴を同期）
    try {
        if (window.location.hash !== '#home') {
            window.location.hash = '#home';
        }
    } catch (e) {}

    // 4. HOMEのおすすめ商品カードを再描画
    if (typeof renderHomeProducts === 'function') {
        try { renderHomeProducts(); } catch (err) { console.error(err); }
    }

    // 5. 画面最上部へ即時スクロール
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) {}

    // 6. トースト通知を表示
    if (user && !options.silentToast && typeof showToast === 'function') {
        showToast(`🎉 ログインしました！ようこそ、${user.name || '会員'} 様`);
    }

    // 7. handleRoutingも#homeを明示指定して呼んで状態を完全同期
    if (typeof handleRouting === 'function') {
        try { await handleRouting('#home'); } catch (e) {}
    }

    // 8. 念押しで最上部スクロール＆#view-homeアクティブ保証
    if (homeView && !homeView.classList.contains('active')) {
        allViews.forEach(v => v.classList.remove('active'));
        homeView.classList.add('active');
    }
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) {}
}

// 互換用エイリアス
const navigateAfterAuth = redirectToHome;
window.redirectToHome = redirectToHome;


// デモログインボタン用：スマホ版はlocalStorage、PC版はPOST /api/auth/demoでデモ会員へログインし、HOME画面へ戻ります
async function handleDemoLogin(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const target = AppState.pendingAuthTarget || sessionStorage.getItem('manekin_pending_auth_target');
    // 定数 preserveGuestCart を宣言し、値（(target === 'checkout')）をセットします
    const preserveGuestCart = (target === 'checkout');
    // 定数 apiBase を宣言し、値（getApiBaseUrl()）をセットします
    const apiBase = getApiBaseUrl();
    // 再代入可能な変数 demoUser を宣言し、値（null）をセットします
    let demoUser = null;

    // スマホ版の場合は localStorage でデモアカウントを発行・復元します
    if (isMobileLocalStorageMode()) {
        const users = lsGetJson('manekin_ls_users', []);
        let existingDemo = users.find(u => u && u.email === 'demo@manekin.jp');
        if (!existingDemo) {
            existingDemo = {
                id: 99999,
                name: 'テスト 太郎 (DEMO)',
                email: 'demo@manekin.jp',
                password: 'password123',
                rank: 'GOLD MEMBER',
                points: 0,
                isLocalStorage: true
            };
            users.push(existingDemo);
            lsSetJson('manekin_ls_users', users);
        } else {
            existingDemo.isLocalStorage = true;
        }
        demoUser = existingDemo;
        ensureMobileUserInitialized(demoUser);
        lsSetJson('manekin_ls_current_user', demoUser);
    } else {
        // PC版：通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
        try {
            // Flask バックエンド API（/api/auth/demo）へ非同期リクエストを送信し、応答を待ち受けます
            const res = await fetch(`${apiBase}/api/auth/demo`, {
                // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
                method: 'POST',
                // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
                credentials: 'include'
            });
            // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
            const data = await res.json().catch(() => ({}));
            // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
            if (!res.ok || !data.user || !isServerUserId(data.user.id)) {
                // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
                showToast(data.message || '⚠️ デモアカウントでログインできませんでした（MySQL接続を確認してください）');
                // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
                return;
            }
            // 変数・配列項目 demoUser の値を更新・計算します
            demoUser = data.user;
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
        } catch (e) {
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToast('⚠️ Pythonサーバー(ポート8080)に接続できないためログインできません（app.pyとMySQLの起動を確認してください）');
            // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
            return;
        }
    }

    // ログインした瞬間に即座にHOME画面へ切り替える
    AppState.currentUser = demoUser;
    await redirectToHome(demoUser);

    // ログイン成功アラートを表示
    alert('ログインされました');

    // アラートOK直後にも確実にHOME画面表示を維持
    await redirectToHome(demoUser, { silentToast: true });

    // 関連処理 applyAccountSession() を呼び出してデータを復元し、再度HOME画面を保証します
    await applyAccountSession(demoUser, { preserveGuestCart });
    await redirectToHome(demoUser, { silentToast: true });
}


// ログインフォーム送信処理：スマホ版はlocalStorage、PC版はPOST /api/auth/loginで認証し、HOME画面へ戻ります
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
        const users = lsGetJson('manekin_ls_users', []);
        const lowerEmail = email.toLowerCase();
        let matched = users.find(u => u && String(u.email || '').toLowerCase() === lowerEmail);

        if (matched) {
            if (matched.password && matched.password !== password) {
                showToast('メールアドレスまたはパスワードが正しくありません');
                return;
            }
            matched.isLocalStorage = true;
            loggedInUser = matched;
        } else {
            // スマホ版で未登録メールアドレスが入力された場合も、その場でlocalStorage会員として登録＆ログインできるようにします
            const isDemo = (lowerEmail === 'demo@manekin.jp');
            const newMobileUser = {
                id: isDemo ? 99999 : Date.now(),
                name: isDemo ? 'テスト 太郎 (DEMO)' : (email.split('@')[0] || '会員'),
                email: email,
                password: password,
                rank: isDemo ? 'GOLD MEMBER' : 'REGULAR MEMBER',
                points: 0,
                isLocalStorage: true
            };
            users.push(newMobileUser);
            lsSetJson('manekin_ls_users', users);
            loggedInUser = newMobileUser;
        }
        ensureMobileUserInitialized(loggedInUser);
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


// 会員登録フォーム送信処理：スマホ版はlocalStorage、PC版はPOST /api/auth/registerで新規会員作成＆ログインし、HOME画面へ戻ります
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
        const users = lsGetJson('manekin_ls_users', []);
        const lowerEmail = email.toLowerCase();
        const existingIdx = users.findIndex(u => u && String(u.email || '').toLowerCase() === lowerEmail);
        if (existingIdx > -1) {
            users[existingIdx].name = name;
            users[existingIdx].password = password;
            users[existingIdx].isLocalStorage = true;
            newUser = users[existingIdx];
        } else {
            newUser = {
                id: Date.now(),
                name: name,
                email: email,
                password: password,
                rank: 'REGULAR MEMBER',
                points: 0,
                isLocalStorage: true
            };
            users.push(newUser);
        }
        lsSetJson('manekin_ls_users', users);
        ensureMobileUserInitialized(newUser);
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
//  8. 共通 UI 部品（モーダルダイアログ・トースト通知・スマホドロワー）
// ==========================================================================
// 汎用通知モーダル（注文完了や利用ガイドなど）を指定タイトル・本文HTMLで開きます
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


// 汎用通知モーダルを非表示に閉じます
function closeManekinModal() {
    // HTML 要素 #manekin-modal を取得して変数 modal に格納します
    const modal = document.getElementById('manekin-modal');
    // 条件（modal）が成り立つか判定し、該当する場合の処理を実行します
    if (modal) modal.classList.remove('open');
}


// 画面右下に数秒間だけ表示して自動で消えるトースト通知バナーを表示します
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


// スマートフォン用ハンバーガーメニュー（スライドドロワー）と暗い背景幕を開きます
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


// スマートフォン用スライドメニューと背景暗転幕を閉じます
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
// 変数・配列項目 window.getDefaultBodyProfile の値を更新・計算します
window.getDefaultBodyProfile = getDefaultBodyProfile;
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
