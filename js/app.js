// ==========================================================================
// MANEKIN FASHION - メインアプリケーション制御 (app.js)a
// アプリケーション全体の状態管理、ルーティング、初期化、イベント登録
// ==========================================================================

// 2. アプリケーション状態管理（State - アカウント別に厳密分離）
// --------------------------------------------------------------------------
const _initialUser = (() => {
    try {
        return JSON.parse(localStorage.getItem('manekin_user')) || null;
    } catch (e) {
        return null;
    }
})();
const _initialUid = (_initialUser && _initialUser.id) ? _initialUser.id : null;

const AppState = {
    // お気に入り登録IDリスト（アカウント別、未ログイン時はゲスト専用キー）
    favorites: loadScopedData('manekin_favorites', [], _initialUid),
    // ログイン中の会員情報（初期値は未ログイン）
    currentUser: _initialUser,
    // ショッピングカート内アイテム（アカウント別、未ログイン時はゲスト専用キー）
    cart: loadScopedData('manekin_cart', [], _initialUid),
    currentDetailId: 1,
    selectedColor: "WHITE",
    selectedSize: "M",
    // 注文履歴データ（ログイン中アカウント分のみ読み込み）
    orderHistory: _initialUid ? loadScopedData('manekin_orders', [], _initialUid) : [],
    selectedCategory: "ALL",
    selectedSort: "default",
    // 未ログイン時のアクセス制御復帰ターゲット ('checkout' または 'manekin')
    pendingAuthTarget: null,

    // =========================================================================
    // ■ AIコーデシミュレーション（MANEKIN AI STUDIO）状態管理
    // =========================================================================
    // マイクローゼット（ログイン中アカウント分のみ読み込み）
    myCloset: _initialUid ? loadScopedData('manekin_my_closet', [], _initialUid) : [],
    // マネキン現在着用スロット
    currentOutfit: _initialUid ? loadScopedData('manekin_current_outfit', {
        hat: null,
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    }, _initialUid) : {
        hat: null,
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    },
    // 保存したコーデ一覧（ルックブック：ログイン中アカウント分のみ読み込み）
    savedOutfits: _initialUid ? loadScopedData('manekin_saved_outfits', [], _initialUid) : [],
    // スタジオ内のUI状態
    studioActiveTab: 'create',
    studioGender: _initialUid ? loadScopedData('manekin_studio_gender', 'MEN', _initialUid) : 'MEN',
    studioClosetFilter: 'ALL',
    studioBrandFilter: 'ALL',
    studioBrandFavOnly: false,
    studioMobileView: 'mannequin',
    activeAdjustSlot: 'outer',
    fittingOffsets: loadScopedData('manekin_fitting_offsets', getDefaultFittingOffsets(), _initialUid),
    userBodyProfile: loadScopedData('manekin_body_profile', getDefaultBodyProfile(), _initialUid)
};

// --------------------------------------------------------------------------
// 3. アプリケーション初期化処理
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (typeof purgeLegacyGlobalStorage === 'function') purgeLegacyGlobalStorage();
    migrateOldBrokenAssets();
    updateFavoriteBadges();
    updateCartBadge();
    updateAuthNavUI();
    setupEventListeners();
    renderHomeProducts();
    renderCatalogProducts();
    renderNewItems();
    if (typeof syncGenderToggleUI === 'function') syncGenderToggleUI();
    if (typeof syncCartFromBackend === 'function') syncCartFromBackend();
    syncOrdersFromBackend();
    if (typeof syncFavoritesFromBackend === 'function') syncFavoritesFromBackend();
    if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
    if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();
    if (typeof syncStudioStateFromBackend === 'function') syncStudioStateFromBackend();
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
            if (typeof syncCartFromBackend === 'function') syncCartFromBackend();
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
            if (typeof syncFavoritesFromBackend === 'function') syncFavoritesFromBackend();
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
            if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
            if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();
            if (typeof syncStudioStateFromBackend === 'function') syncStudioStateFromBackend();
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
window.handlePointsInputChange = handlePointsInputChange;
window.handleUseAllPoints = handleUseAllPoints;
window.handleResetPoints = handleResetPoints;
window.getUserPoints = getUserPoints;
window.setUserPoints = setUserPoints;
window.syncCartToBackend = syncCartToBackend;
window.syncCartFromBackend = syncCartFromBackend;
window.syncClosetFromBackend = syncClosetFromBackend;
window.syncFavoritesFromBackend = syncFavoritesFromBackend;
window.syncOutfitsFromBackend = syncOutfitsFromBackend;
window.syncStudioStateToBackend = syncStudioStateToBackend;
window.syncStudioStateFromBackend = syncStudioStateFromBackend;
window.handleSyncAllToMySQL = handleSyncAllToMySQL;
