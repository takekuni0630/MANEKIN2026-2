// ==========================================================================
// MANEKIN FASHION - メインアプリケーション制御 (app.js)a
// アプリケーション全体の状態管理、ルーティング、初期化、イベント登録
// ==========================================================================

// 2. アプリケーション状態管理（State）
// --------------------------------------------------------------------------
const AppState = {
    // お気に入り登録IDリスト（初期値は0件）
    favorites: JSON.parse(localStorage.getItem('manekin_favorites')) || [],
    // ログイン中の会員情報（初期値は未ログイン）
    currentUser: JSON.parse(localStorage.getItem('manekin_user')) || null,
    // ショッピングカート内アイテム（初期値は0件）
    cart: JSON.parse(localStorage.getItem('manekin_cart')) || [],
    currentDetailId: 1,
    selectedColor: "WHITE",
    selectedSize: "M",
    // 注文履歴データ（初期値は0件）
    orderHistory: JSON.parse(localStorage.getItem('manekin_orders')) || [],
    selectedCategory: "ALL",
    selectedSort: "default",
    // 未ログイン時のアクセス制御復帰ターゲット ('checkout' または 'manekin')
    pendingAuthTarget: null,

    // =========================================================================
    // ■ AIコーデシミュレーション（MANEKIN AI STUDIO）状態管理
    // =========================================================================
    // マイクローゼット（手持ち服データ）
    myCloset: JSON.parse(localStorage.getItem('manekin_my_closet')) || [
        {
            id: 'c1',
            name: '黒ワイドスラックス',
            category: 'BOTTOMS',
            color: 'BLACK',
            season: '通年',
            image: 'assets/images/men/ストレートレープセミフレアスラックス.png',
            isOwned: true
        },
        {
            id: 'c2',
            name: 'クラシック 白レザースニーカー',
            category: 'SHOES',
            color: 'WHITE',
            season: '通年',
            image: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20140%2065%22%3E%3Cpath%20d%3D%22M15%2048%20C25%2048%2C%2035%2046%2C%2045%2040%20C55%2032%2C%2065%2022%2C%2085%2020%20C95%2019%2C%20110%2025%2C%20125%2038%20C132%2044%2C%20130%2050%2C%20120%2052%20L15%2052%20Z%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M10%2052%20L128%2052%20C132%2052%2C%20132%2058%2C%20126%2058%20L10%2058%20C6%2058%2C%206%2052%2C%2010%2052%20Z%22%20fill%3D%22%23e2e8f0%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%2F%3E%3Cpath%20d%3D%22M65%2026%20L80%2032%20M60%2031%20L75%2037%20M55%2036%20L70%2042%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E",
            isOwned: true
        },
        {
            id: 'c3',
            name: 'ヘビーウェイト ジップパーカー',
            category: 'TOPS',
            color: 'GREY',
            season: '秋冬',
            image: 'assets/images/men/アーバングレイジップフーディ.png',
            isOwned: true
        },
        {
            id: 'c4',
            name: 'スカイ オックスフォードシャツ',
            category: 'TOPS',
            color: 'BLUE',
            season: '通年',
            image: 'assets/images/men/スカイオックスフォードシャツ.png',
            isOwned: true
        },
        {
            id: 'c5',
            name: 'クラシック コットンキャップ',
            category: 'HAT',
            color: 'BLACK',
            season: '通年',
            image: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E",
            isOwned: true
        },
        {
            id: 'c6',
            name: 'ウォッシュド バケットハット',
            category: 'HAT',
            color: 'CHARCOAL',
            season: '通年',
            image: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20140%22%3E%3Cpath%20d%3D%22M20%20110%20C20%20110%2040%2095%2060%2090%20C75%2086%20125%2086%20140%2090%20C160%2095%20180%20110%20180%20110%20C150%20125%2050%20125%2020%20110%20Z%22%20fill%3D%22%23262626%22%2F%3E%3Cpath%20d%3D%22M58%2090%20C58%2060%2065%2035%20100%2035%20C135%2035%20142%2060%20142%2090%20Z%22%20fill%3D%22%231a1a1a%22%2F%3E%3Cpath%20d%3D%22M58%2090%20C75%2096%20125%2096%20142%2090%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E",
            isOwned: true
        }
    ],
    // マネキン現在着用スロット
    currentOutfit: JSON.parse(localStorage.getItem('manekin_current_outfit')) || {
        hat: null,
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    },
    // 保存したコーデ一覧（ルックブック）（初期値は0件）
    savedOutfits: JSON.parse(localStorage.getItem('manekin_saved_outfits')) || [],
    // スタジオ内のUI状態
    studioActiveTab: 'create',
    studioGender: 'MEN',
    studioClosetFilter: 'ALL',
    studioBrandFilter: 'ALL',
    studioBrandFavOnly: false,
    studioMobileView: 'mannequin',
    activeAdjustSlot: 'outer',
    fittingOffsets: JSON.parse(localStorage.getItem('manekin_fitting_offsets')) || {
        hat: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        tops: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        outer: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        bottoms: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        shoes: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 }
    },
    userBodyProfile: JSON.parse(localStorage.getItem('manekin_body_profile')) || {
        height: 172,
        bodyType: 'REGULAR',
        styleTaste: 'MINIMAL'
    }
};

// --------------------------------------------------------------------------
// 3. アプリケーション初期化処理
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    migrateOldBrokenAssets();
    updateFavoriteBadges();
    updateCartBadge();
    updateAuthNavUI();
    setupEventListeners();
    renderHomeProducts();
    renderCatalogProducts();
    renderNewItems();
    syncOrdersFromBackend();
    handleRouting();
});

// --------------------------------------------------------------------------
// 4. ルーティング（SPA画面切り替え）
// --------------------------------------------------------------------------
function handleRouting() {
    const hash = window.location.hash || '#home';
    let routeName = hash;
    let paramId = null;

    if (hash.includes('?id=')) {
        const parts = hash.split('?id=');
        routeName = parts[0];
        paramId = parseInt(parts[1], 10);
    }

    const allViews = document.querySelectorAll('.page-view');
    allViews.forEach(view => view.classList.remove('active'));

    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    switch (routeName) {
        case '#home':
            showView('view-home');
            highlightNavLink('home');
            break;

        case '#items':
            AppState.selectedGender = 'ALL';
            showView('view-items');
            highlightNavLink('items');
            renderCatalogProducts();
            break;

        case '#men':
            AppState.selectedGender = 'MEN';
            showView('view-items');
            highlightNavLink('men');
            renderCatalogProducts();
            break;

        case '#women':
            AppState.selectedGender = 'WOMEN';
            showView('view-items');
            highlightNavLink('women');
            renderCatalogProducts();
            break;

        case '#new-items':
            showView('view-new-items');
            highlightNavLink('new-items');
            renderNewItems();
            break;

        case '#favorites':
            showView('view-favorites');
            highlightNavLink('favorites');
            renderFavoriteProducts();
            break;

        case '#item-detail':
            showView('view-item-detail');
            if (paramId) {
                AppState.currentDetailId = paramId;
                renderItemDetail(paramId);
            } else {
                window.location.hash = '#items';
            }
            break;

        case '#checkout':
            showView('view-checkout');
            highlightNavLink('checkout');
            renderCheckoutPage();
            break;

        case '#login':
            showView('view-login');
            highlightNavLink('login');
            updateAuthNoticeBanner();
            break;

        case '#register':
            showView('view-register');
            highlightNavLink('register');
            updateAuthNoticeBanner();
            break;

        case '#mypage':
            showView('view-mypage');
            highlightNavLink('mypage');
            renderMyPage();
            syncOrdersFromBackend();
            break;

        case '#manekin':
        case '#manekin-studio':
            if (!AppState.currentUser) {
                AppState.pendingAuthTarget = 'manekin';
                showToast('⚠️ MANEKIN機能のご利用にはログインまたは会員登録が必要です');
                window.location.hash = '#login';
                return;
            }
            showView('view-manekin-studio');
            highlightNavLink('manekin-studio');
            renderManekinStudio(AppState.studioActiveTab || 'create');
            break;

        default:
            showView('view-home');
            highlightNavLink('home');
            break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateAuthNoticeBanner() {
    const loginAlert = document.getElementById('login-checkout-notice');
    const regAlert = document.getElementById('reg-checkout-notice');
    const loginTitle = document.getElementById('login-notice-title');
    const loginDesc = document.getElementById('login-notice-desc');
    const regTitle = document.getElementById('reg-notice-title');
    const regDesc = document.getElementById('reg-notice-desc');

    if (AppState.pendingAuthTarget === 'manekin') {
        if (loginAlert) loginAlert.style.display = 'block';
        if (regAlert) regAlert.style.display = 'block';
        const titleText = '⚠️ MANEKIN AIスタジオのご利用には会員登録またはログインが必要です';
        const descText = 'バーチャル試着やAIコーデ診断機能をご利用いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、自動的にMANEKINスタジオへ移動します。';
        if (loginTitle) loginTitle.textContent = titleText;
        if (loginDesc) loginDesc.innerHTML = descText;
        if (regTitle) regTitle.textContent = titleText;
        if (regDesc) regDesc.innerHTML = descText;
    } else if (AppState.pendingAuthTarget === 'checkout') {
        if (loginAlert) loginAlert.style.display = 'block';
        if (regAlert) regAlert.style.display = 'block';
        const titleText = '⚠️ ご購入手続きには会員登録またはログインが必要です';
        const descText = '商品をご購入いただくにはアカウントが必要となります。<br>ログインまたは新規会員登録が完了すると、自動的にご注文手続き画面へ戻ります。';
        if (loginTitle) loginTitle.textContent = titleText;
        if (loginDesc) loginDesc.innerHTML = descText;
        if (regTitle) regTitle.textContent = titleText;
        if (regDesc) regDesc.innerHTML = descText;
    } else {
        if (loginAlert) loginAlert.style.display = 'none';
        if (regAlert) regAlert.style.display = 'none';
    }
}

function showView(viewId) {
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');
}

function highlightNavLink(navKey) {
    const desktopLink = document.querySelector(`.nav-link[data-nav="${navKey}"]`);
    if (desktopLink) desktopLink.classList.add('active');
    const mobileLink = document.querySelector(`.mobile-nav-link[data-mobile-nav="${navKey}"]`);
    if (mobileLink) mobileLink.classList.add('active');
}

// --------------------------------------------------------------------------


// 14. イベントリスナー一括登録
// --------------------------------------------------------------------------
function setupEventListeners() {
    window.addEventListener('hashchange', handleRouting);

    document.querySelectorAll('.nav-manekin-btn, #manekin-menu-btn, #mobile-manekin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = '#manekin-studio';
        });
    });

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

    const closetModal = document.getElementById('modal-add-closet');
    if (closetModal) {
        closetModal.addEventListener('click', (e) => {
            if (e.target === closetModal) closeAddClosetModal();
        });
    }

    const closetForm = document.getElementById('form-add-closet');
    if (closetForm) {
        closetForm.addEventListener('submit', handleAddClosetItem);
    }

    const hamburgerBtn = document.getElementById('hamburger-btn');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const menuOverlay = document.getElementById('menu-overlay');

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMobileDrawer);

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileDrawer);
    });

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

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            AppState.selectedSort = e.target.value;
            renderCatalogProducts();
        });
    }

    const demoBtn = document.getElementById('demo-login-btn');
    if (demoBtn) demoBtn.addEventListener('click', handleDemoLogin);

    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const placeOrderBtn = document.getElementById('btn-place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

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
// 15.9 グローバル関数登録（HTMLのonclick/onsubmitからの確実な呼び出し保証）
// ==========================================================================
window.openAddClosetModal = openAddClosetModal;
window.closeAddClosetModal = closeAddClosetModal;
window.handleAddClosetItem = handleAddClosetItem;
window.handleClosetImageSelect = handleClosetImageSelect;
window.selectPresetImage = selectPresetImage;
window.deleteClosetItem = deleteClosetItem;
window.switchStudioTab = switchStudioTab;
window.toggleWearItem = toggleWearItem;
window.unwearSlot = unwearSlot;
window.clearMannequin = clearMannequin;
window.setMannequinGender = setMannequinGender;
window.switchMobileStudioView = switchMobileStudioView;
window.handleSaveOutfit = handleSaveOutfit;
window.applyPresetName = applyPresetName;
window.applyPresetLook = applyPresetLook;
window.restoreOutfit = restoreOutfit;
window.deleteSavedOutfit = deleteSavedOutfit;
window.addCurrentBrandItemsToCart = addCurrentBrandItemsToCart;
window.importOrderToCloset = importOrderToCloset;
window.handlePaneClosetFilter = handlePaneClosetFilter;
window.handleStudioClosetFilter = handleStudioClosetFilter;
window.handleStudioBrandFilter = handleStudioBrandFilter;
window.toggleBrandFavFilter = toggleBrandFavFilter;
window.handleSaveBodyProfile = handleSaveBodyProfile;
window.toggleFittingAdjustPanel = toggleFittingAdjustPanel;
window.switchAdjustSlot = switchAdjustSlot;
window.handleAdjustInput = handleAdjustInput;
window.stepAdjust = stepAdjust;
window.resetFittingOffsets = resetFittingOffsets;
window.applyFittingOffsets = applyFittingOffsets;
window.handleBrandSizeInput = handleBrandSizeInput;
window.stepBrandSize = stepBrandSize;
window.triggerManualBgRemoval = triggerManualBgRemoval;
window.restoreOriginalUploadImage = restoreOriginalUploadImage;



window.handleStageSlotClick = handleStageSlotClick;
window.openStageQuickPicker = openStageQuickPicker;
window.closeStageQuickPicker = closeStageQuickPicker;
window.handleCardDragStart = handleCardDragStart;
window.handleStageDragOver = handleStageDragOver;
window.handleStageDragLeave = handleStageDragLeave;
window.handleStageDrop = handleStageDrop;
window.getCategoryFallbackImage = getCategoryFallbackImage;
window.migrateOldBrokenAssets = migrateOldBrokenAssets;
