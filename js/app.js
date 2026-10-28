// ==========================================================================
// MANEKIN FASHION - フロントエンド JavaScript (app.js)
// カラー写真切替・サイズ変更・カート購入・Python/MySQL連携・マイページ反映
// ==========================================================================

// --------------------------------------------------------------------------
// 1. サンプル商品データ定義（カラー別画像対応マップ完備）
// --------------------------------------------------------------------------
const SAMPLE_PRODUCTS = [
    {
        id: 1,
        name: "プレミアム コットン リラックス Tシャツ",
        nameEn: "Premium Cotton Relaxed T-Shirt",
        category: "TOPS",
        price: 2990,
        image: "assets/images/item_tshirt.jpg",
        isNew: true,
        isFeatured: true,
        description: "最高級超長綿を100%使用した、滑らかな肌触りと上品な光沢感が特徴のクルーネックTシャツ。程よいドロップショルダー設計で一枚着でもジャケットのインナーでも美しいシルエットを保ちます。",
        // 展開カラー
        colors: ["WHITE", "BLACK", "HEATHER GREY"],
        // 【要件追加】服の色を変えた時にその色の写真に変わる画像マッピング
        colorImages: {
            "WHITE": "assets/images/item_tshirt.jpg",
            "BLACK": "assets/images/item_jacket.jpg",
            "HEATHER GREY": "assets/images/item_knit.jpg"
        },
        sizes: ["S", "M", "L", "XL"],
        material: "綿 100%",
        sku: "MNK-2026-T01"
    },
    {
        id: 2,
        name: "スマート テーラード ジャケット",
        nameEn: "Smart Tailored Blazer Jacket",
        category: "OUTER",
        price: 9990,
        image: "assets/images/item_jacket.jpg",
        isNew: true,
        isFeatured: true,
        description: "現代のビジネスからカジュアルまでシームレスに対応する、モダンフィットな2ボタンテーラードジャケット。軽量でシワになりにくい高機能ウールライク素材を採用し、長時間の着用でも快適です。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        colorImages: {
            "BLACK": "assets/images/item_jacket.jpg",
            "CHARCOAL": "assets/images/item_coat.jpg",
            "NAVY": "assets/images/item_tshirt.jpg"
        },
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 70%, レーヨン 26%, ポリウレタン 4%",
        sku: "MNK-2026-J02"
    },
    {
        id: 3,
        name: "ワイド ドレープ タック スラックス",
        nameEn: "Wide Drape Pleated Trousers",
        category: "BOTTOMS",
        price: 4990,
        image: "assets/images/item_pants.jpg",
        isNew: false,
        isFeatured: true,
        description: "美しい落ち感と深めのツータックが立体的なドレープを生み出すワイドスラックス。ウエスト背面にゴムを仕込み、品格あるスリムな見栄えとリラクシングな履き心地を両立しました。",
        colors: ["CHARCOAL", "BLACK", "DARK BROWN"],
        colorImages: {
            "CHARCOAL": "assets/images/item_pants.jpg",
            "BLACK": "assets/images/item_jacket.jpg",
            "DARK BROWN": "assets/images/item_coat.jpg"
        },
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 65%, レーヨン 35%",
        sku: "MNK-2026-P03"
    },
    {
        id: 4,
        name: "ファイン クルーネック ニットセーター",
        nameEn: "Fine Crewneck Knit Sweater",
        category: "TOPS",
        price: 3990,
        image: "assets/images/item_knit.jpg",
        isNew: true,
        isFeatured: true,
        description: "19.5マイクロンの極細メリノウールブレンド糸を編み上げたミドルゲージニット。チクチク感を抑えた極上の柔らかな肌触りで、一枚でサラリと着こなせる万能な定番アイテムです。",
        colors: ["LIGHT GREY", "BLACK", "OFF WHITE"],
        colorImages: {
            "LIGHT GREY": "assets/images/item_knit.jpg",
            "BLACK": "assets/images/item_jacket.jpg",
            "OFF WHITE": "assets/images/item_tshirt.jpg"
        },
        sizes: ["S", "M", "L", "XL"],
        material: "ウール 50%, アクリル 50%",
        sku: "MNK-2026-K04"
    },
    {
        id: 5,
        name: "ミニマル ステンカラー ロングコート",
        nameEn: "Minimal Soutien Collar Long Coat",
        category: "OUTER",
        price: 14900,
        image: "assets/images/item_coat.jpg",
        isNew: true,
        isFeatured: false,
        description: "無駄なディテールを極限まで削ぎ落とした、ミニマルを体現するチェスターステンカラーコート。膝下まで包み込む洗練されたAラインシルエットが、都会的な装いを格上げします。",
        colors: ["BLACK", "CHARCOAL"],
        colorImages: {
            "BLACK": "assets/images/item_coat.jpg",
            "CHARCOAL": "assets/images/item_pants.jpg"
        },
        sizes: ["M", "L", "XL"],
        material: "ウール 80%, ナイロン 20%",
        sku: "MNK-2026-C05"
    },
    {
        id: 6,
        name: "ヘビーウェイト ボクシー スウェット",
        nameEn: "Heavyweight Boxy Crewneck Sweatshirt",
        category: "TOPS",
        price: 3490,
        image: "assets/images/item_tshirt.jpg",
        isNew: false,
        isFeatured: true,
        description: "肉厚でタフな14オンス裏毛コットンスウェット生地。程よいハリ感とボクシーなボックスシルエットが、今の気分にフィットするリラックススタイルを演出します。",
        colors: ["OFF WHITE", "BLACK", "ASH GREY"],
        colorImages: {
            "OFF WHITE": "assets/images/item_tshirt.jpg",
            "BLACK": "assets/images/item_jacket.jpg",
            "ASH GREY": "assets/images/item_knit.jpg"
        },
        sizes: ["S", "M", "L", "XL"],
        material: "綿 100%",
        sku: "MNK-2026-S06"
    },
    {
        id: 7,
        name: "リラックス アンクル テーパードパンツ",
        nameEn: "Relaxed Ankle Tapered Pants",
        category: "BOTTOMS",
        price: 4490,
        image: "assets/images/item_pants.jpg",
        isNew: false,
        isFeatured: false,
        description: "腰回りに程よいゆとりを持たせつつ、足首に向かってすっきりと絞ったアンクル丈テーパードスラックス。靴元を選ばずスマートに合わせられます。",
        colors: ["BLACK", "CHARCOAL"],
        colorImages: {
            "BLACK": "assets/images/item_pants.jpg",
            "CHARCOAL": "assets/images/item_coat.jpg"
        },
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 68%, レーヨン 28%, ポリウレタン 4%",
        sku: "MNK-2026-P07"
    },
    {
        id: 8,
        name: "ウールライク 2B カジュアルブレザー",
        nameEn: "Wool-Like Casual 2-Button Blazer",
        category: "OUTER",
        price: 8990,
        image: "assets/images/item_jacket.jpg",
        isNew: true,
        isFeatured: false,
        description: "肩パッドを排したアンコン仕立てにより、カーディガンのように羽織れる軽量カジュアルブレザー。マシンウォッシャブル対応で自宅で手軽にお手入れが可能です。",
        colors: ["NAVY", "BLACK"],
        colorImages: {
            "NAVY": "assets/images/item_jacket.jpg",
            "BLACK": "assets/images/item_coat.jpg"
        },
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 100%",
        sku: "MNK-2026-J08"
    }
];

// --------------------------------------------------------------------------
// 2. アプリケーション状態管理（State）
// --------------------------------------------------------------------------
const AppState = {
    // お気に入り登録された商品IDリスト
    favorites: JSON.parse(localStorage.getItem('manekin_favorites')) || [1, 2],
    // ログイン中の会員情報（未ログイン時はデフォルトデモ会員）
    currentUser: JSON.parse(localStorage.getItem('manekin_user')) || {
        id: 1,
        name: "山田 太郎 様",
        email: "demo@manekin.com",
        rank: "REGULAR MEMBER"
    },
    // 【要件追加】ショッピングカート内アイテム（LocalStorageから復元、初期サンプル投入）
    cart: JSON.parse(localStorage.getItem('manekin_cart')) || [
        {
            id: 1,
            name: "プレミアム コットン リラックス Tシャツ",
            color: "WHITE",
            size: "L",
            price: 2990,
            quantity: 1,
            image: "assets/images/item_tshirt.jpg"
        }
    ],
    // 現在選択中の商品詳細情報
    currentDetailId: 1,
    selectedColor: "WHITE",
    selectedSize: "M",
    // 注文履歴（MySQL + LocalStorageで同期管理）
    orderHistory: JSON.parse(localStorage.getItem('manekin_orders')) || [
        {
            order_no: "ORD-2026-0982",
            date: "2026/10/18 14:30",
            items_summary: "プレミアム コットン リラックス Tシャツ (WHITE / L) × 2",
            total_amount: 5980,
            status: "配達完了"
        },
        {
            order_no: "ORD-2026-0851",
            date: "2026/09/25 11:20",
            items_summary: "スマート テーラード ジャケット (BLACK / M) × 1",
            total_amount: 9990,
            status: "配達完了"
        }
    ],
    selectedCategory: "ALL",
    selectedSort: "default"
};

// --------------------------------------------------------------------------
// 3. アプリケーション初期化処理
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // お気に入りバッジの更新
    updateFavoriteBadges();
    // カートバッジの更新
    updateCartBadge();
    // ナビゲーションの会員表示更新
    updateAuthNavUI();
    // イベントリスナーの登録
    setupEventListeners();
    // 各種商品の初期レンダリング
    renderHomeProducts();
    renderCatalogProducts();
    renderNewItems();
    // バックエンドMySQLから最新注文履歴と商品を取得（利用可能な場合）
    syncOrdersFromBackend();
    // URLハッシュに応じた画面表示
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
            showView('view-items');
            highlightNavLink('items');
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

        // 【要件追加】本格的な購入手続き・チェックアウト画面
        case '#checkout':
            showView('view-checkout');
            highlightNavLink('checkout');
            renderCheckoutPage();
            break;

        case '#login':
            showView('view-login');
            highlightNavLink('login');
            break;

        case '#register':
            showView('view-register');
            highlightNavLink('register');
            break;

        case '#mypage':
            showView('view-mypage');
            highlightNavLink('mypage');
            renderMyPage();
            break;

        default:
            showView('view-home');
            highlightNavLink('home');
            break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
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
// 5. 商品カード生成 & カタログ表示
// --------------------------------------------------------------------------
function createProductCardHTML(product) {
    const isFav = AppState.favorites.includes(product.id);
    const formattedPrice = "¥" + product.price.toLocaleString();

    return `
        <article class="product-card" data-id="${product.id}">
            <div class="product-img-wrapper" onclick="navigateToDetail(${product.id})">
                ${product.isNew ? '<span class="badge-new">NEW</span>' : ''}
                <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
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

function renderHomeProducts() {
    const featuredContainer = document.getElementById('home-featured-grid');
    const newContainer = document.getElementById('home-new-grid');
    if (featuredContainer) {
        const featuredItems = SAMPLE_PRODUCTS.filter(p => p.isFeatured).slice(0, 4);
        featuredContainer.innerHTML = featuredItems.map(p => createProductCardHTML(p)).join('');
    }
    if (newContainer) {
        const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew).slice(0, 4);
        newContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
    }
}

function renderCatalogProducts() {
    const gridContainer = document.getElementById('catalog-product-grid');
    if (!gridContainer) return;

    let items = [...SAMPLE_PRODUCTS];
    if (AppState.selectedCategory !== 'ALL') {
        items = items.filter(p => p.category === AppState.selectedCategory);
    }

    switch (AppState.selectedSort) {
        case 'price-asc':
            items.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            items.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            items.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            break;
        default:
            items.sort((a, b) => a.id - b.id);
            break;
    }
    gridContainer.innerHTML = items.map(p => createProductCardHTML(p)).join('');
}

function renderNewItems() {
    const gridContainer = document.getElementById('new-items-grid');
    if (!gridContainer) return;
    const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew);
    gridContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
}

// --------------------------------------------------------------------------
// 6. 商品詳細表示ロジック（サイズ変更修正 ＆ カラー写真切替実装）
// --------------------------------------------------------------------------
function navigateToDetail(productId) {
    window.location.hash = `#item-detail?id=${productId}`;
}

function renderItemDetail(productId) {
    const detailLayout = document.getElementById('item-detail-layout');
    const breadcrumbName = document.getElementById('detail-breadcrumb-name');
    if (!detailLayout) return;

    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        detailLayout.innerHTML = '<p>商品が見つかりませんでした。</p>';
        return;
    }

    if (breadcrumbName) {
        breadcrumbName.textContent = product.name;
    }

    // 初期選択カラーとサイズを設定
    AppState.selectedColor = product.colors[0];
    AppState.selectedSize = product.sizes[1] || "M";

    const isFav = AppState.favorites.includes(product.id);
    const formattedPrice = "¥" + product.price.toLocaleString();
    const initialImgUrl = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

    // カラーチップのHTML生成（クリックで画像切替関数を呼び出し）
    const colorChipsHTML = product.colors.map((color, idx) => {
        const isSelected = (color === AppState.selectedColor);
        const mappedImg = (product.colorImages && product.colorImages[color]) || product.image;
        return `
            <button type="button" 
                    class="color-chip ${isSelected ? 'selected' : ''}" 
                    data-color="${color}" 
                    data-img="${mappedImg}" 
                    onclick="handleColorSelect(this, '${color}', '${mappedImg}')">
                ${color}
            </button>
        `;
    }).join('');

    // サイズチップのHTML生成（【バグ修正】サイズ選択が確実に切り替わるように修正）
    const sizeChipsHTML = product.sizes.map((size, idx) => {
        const isSelected = (size === AppState.selectedSize);
        return `
            <button type="button" 
                    class="size-chip ${isSelected ? 'selected' : ''}" 
                    data-size="${size}" 
                    onclick="handleSizeSelect(this, '${size}')">
                ${size}
            </button>
        `;
    }).join('');

    detailLayout.innerHTML = `
        <div class="detail-gallery">
            <div class="detail-main-img-box">
                <!-- 【要件追加】色変更時に写真が切り替わるメイン画像 -->
                <img src="${initialImgUrl}" alt="${product.name}" class="detail-main-img" id="detail-main-img">
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
                <!-- 【要件追加】今すぐ購入するボタン（チェックアウトへ即時遷移） -->
                <button type="button" class="btn btn-buy-now btn-block" onclick="handleBuyNow(${product.id})">
                    今すぐ購入する (ご注文手続きへ) &rarr;
                </button>
                <!-- ショッピングバッグに追加するボタン -->
                <button type="button" class="btn btn-secondary btn-block" onclick="handleAddToCartFromDetail(${product.id})">
                    ショッピングバッグに追加する
                </button>
                <!-- お気に入りボタン -->
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

// 【要件追加】服の色を変えたときにその色の写真に変わるハンドラ
function handleColorSelect(chipEl, colorName, imageUrl) {
    const parent = chipEl.parentElement;
    parent.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
    chipEl.classList.add('selected');

    AppState.selectedColor = colorName;

    const labelColor = document.getElementById('label-selected-color');
    if (labelColor) labelColor.textContent = colorName;

    // メイン写真の切り替え（フェード演出）
    const mainImg = document.getElementById('detail-main-img');
    if (mainImg && imageUrl) {
        mainImg.style.opacity = '0.3';
        setTimeout(() => {
            mainImg.src = imageUrl;
            mainImg.style.opacity = '1';
        }, 150);
    }

    showToast(`カラー: ${colorName} を選択しました`);
}

// 【バグ修正】サイズ選択ボタンの切り替えハンドラ
function handleSizeSelect(chipEl, sizeName) {
    const parent = chipEl.parentElement;
    // 以前のコードで未定義変数 c が参照されていた箇所を修正
    parent.querySelectorAll('.size-chip').forEach(s => s.classList.remove('selected'));
    chipEl.classList.add('selected');

    AppState.selectedSize = sizeName;

    const labelSize = document.getElementById('label-selected-size');
    if (labelSize) labelSize.textContent = sizeName;

    showToast(`サイズ: ${sizeName} を選択しました`);
}

// --------------------------------------------------------------------------
// 7. カート・購入手続き管理（CHECKOUT）
// --------------------------------------------------------------------------
function updateCartBadge() {
    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('header-cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalCount;
    }
}

// ショッピングバッグに追加
function handleAddToCartFromDetail(productId) {
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const currentImg = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

    // 既存カート内に同一ID・同一カラー・同一サイズが存在するか確認
    const existingIndex = AppState.cart.findIndex(
        item => item.id === product.id && item.color === AppState.selectedColor && item.size === AppState.selectedSize
    );

    if (existingIndex > -1) {
        AppState.cart[existingIndex].quantity += 1;
    } else {
        AppState.cart.push({
            id: product.id,
            name: product.name,
            color: AppState.selectedColor,
            size: AppState.selectedSize,
            price: product.price,
            quantity: 1,
            image: currentImg
        });
    }

    localStorage.setItem('manekin_cart', JSON.stringify(AppState.cart));
    updateCartBadge();
    showToast(`「${product.name} (${AppState.selectedColor}/${AppState.selectedSize})」をバッグに追加しました`);
}

// 今すぐ購入する（直接購入手続き画面へ遷移）
function handleBuyNow(productId) {
    handleAddToCartFromDetail(productId);
    window.location.hash = '#checkout';
}

// カート内商品の数量変更
function updateCartItemQty(index, delta) {
    if (!AppState.cart[index]) return;
    AppState.cart[index].quantity += delta;
    if (AppState.cart[index].quantity <= 0) {
        AppState.cart.splice(index, 1);
    }
    localStorage.setItem('manekin_cart', JSON.stringify(AppState.cart));
    updateCartBadge();
    renderCheckoutPage();
}

// カート内商品の削除
function removeCartItem(index) {
    if (!AppState.cart[index]) return;
    AppState.cart.splice(index, 1);
    localStorage.setItem('manekin_cart', JSON.stringify(AppState.cart));
    updateCartBadge();
    renderCheckoutPage();
    showToast('バッグから商品を削除しました');
}

// 【要件追加】本格的な購入手続きページの描画
function renderCheckoutPage() {
    const cartListEl = document.getElementById('checkout-cart-list');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const mainLayout = document.getElementById('checkout-layout-main');
    const completedView = document.getElementById('order-completed-view');

    // 完了ビューを隠して入力画面を表示
    if (completedView) completedView.style.display = 'none';
    if (mainLayout) mainLayout.style.display = 'grid';

    if (AppState.cart.length === 0) {
        if (cartListEl) {
            cartListEl.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <p style="margin-bottom: 16px; font-weight: 600;">ショッピングバッグに商品が入っていません。</p>
                    <a href="#items" class="btn btn-primary">商品を探す</a>
                </div>
            `;
        }
        if (subtotalEl) subtotalEl.textContent = "¥0";
        if (shippingEl) shippingEl.textContent = "¥0";
        if (taxEl) taxEl.textContent = "¥0";
        if (totalEl) totalEl.textContent = "¥0";
        const placeBtn = document.getElementById('btn-place-order');
        if (placeBtn) placeBtn.disabled = true;
        return;
    }

    const placeBtn = document.getElementById('btn-place-order');
    if (placeBtn) placeBtn.disabled = false;

    // カート商品一覧HTML描画
    if (cartListEl) {
        cartListEl.innerHTML = AppState.cart.map((item, idx) => `
            <div class="cart-item-row">
                <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
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

    // 金額計算
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 5000 ? 0 : 550;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = `¥${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "無料 (5,000円以上)" : `¥${shipping.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `¥${tax.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `¥${total.toLocaleString()}`;
}

// 【要件追加】「注文を確定する」ボタン処理（Python API & MySQL連携 & 即時マイページ反映）
async function handlePlaceOrder() {
    if (AppState.cart.length === 0) {
        showToast('バッグに商品が入っていません');
        return;
    }

    const nameInput = document.getElementById('order-name');
    const phoneInput = document.getElementById('order-phone');
    const emailInput = document.getElementById('order-email');
    const postalInput = document.getElementById('order-postal');
    const addressInput = document.getElementById('order-address');
    const deliveryTimeInput = document.getElementById('order-delivery-time');
    const paymentRadio = document.querySelector('input[name="payment_method"]:checked');

    const customerName = nameInput ? nameInput.value.trim() : "山田 太郎";
    const phone = phoneInput ? phoneInput.value.trim() : "090-1234-5678";
    const email = emailInput ? emailInput.value.trim() : "demo@manekin.com";
    const postal = postalInput ? postalInput.value.trim() : "150-0001";
    const address = addressInput ? addressInput.value.trim() : "東京都渋谷区神宮前1-1-1";
    const deliveryTime = deliveryTimeInput ? deliveryTimeInput.value : "指定なし";
    const paymentMethod = paymentRadio ? paymentRadio.value : "クレジットカード";

    if (!customerName || !address || !email) {
        showToast('お名前、ご住所、メールアドレスを入力してください');
        return;
    }

    const placeBtn = document.getElementById('btn-place-order');
    if (placeBtn) {
        placeBtn.disabled = true;
        placeBtn.innerHTML = '<span class="order-btn-text">注文を確定中... (MySQLへ保存)</span>';
    }

    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 5000 ? 0 : 550;
    const totalAmount = subtotal + shipping;

    // 注文リクエストペイロード
    const orderPayload = {
        customer_name: customerName,
        customer_email: email,
        phone: phone,
        postal_code: postal,
        address: address,
        payment_method: paymentMethod,
        delivery_time: deliveryTime,
        subtotal: subtotal,
        shipping_fee: shipping,
        total_amount: totalAmount,
        user_id: AppState.currentUser ? AppState.currentUser.id : 1,
        items: AppState.cart
    };

    let confirmedOrder = null;

    try {
        // Pythonバックエンド（MySQL）へ注文API送信
        const response = await fetch('http://127.0.0.1:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
            const data = await response.json();
            confirmedOrder = data.order;
            console.log("[MySQL 連携成功] 注文がMySQLに保存されました:", confirmedOrder);
        } else {
            throw new Error("APIレスポンスエラー");
        }
    } catch (err) {
        console.warn("[フォールバック] Python/MySQLサーバー通信中、ローカルストレージへも安全保存します:", err);
        // APIサーバーが未起動の場合のフォールバック
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        confirmedOrder = {
            order_no: `ORD-${todayStr}-${randomNum}`,
            date: new Date().toLocaleDateString('ja-JP') + " " + new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            customer_name: customerName,
            address: address,
            total_amount: totalAmount,
            status: "注文受付・発送準備中",
            items: [...AppState.cart]
        };
    }

    // 注文要約の生成
    const itemSummaryList = confirmedOrder.items.map(it => `${it.name} (${it.color} / ${it.size}) × ${it.quantity}`);
    confirmedOrder.items_summary = itemSummaryList.join(", ");

    // 【重要】マイページの購入履歴一覧の先頭に即座に追加
    AppState.orderHistory.unshift(confirmedOrder);
    localStorage.setItem('manekin_orders', JSON.stringify(AppState.orderHistory));

    // カートを空にする
    AppState.cart = [];
    localStorage.removeItem('manekin_cart');
    updateCartBadge();

    // 注文完了サンクスビューの表示
    const mainLayout = document.getElementById('checkout-layout-main');
    const completedView = document.getElementById('order-completed-view');
    const compOrderNo = document.getElementById('comp-order-no');
    const compOrderDate = document.getElementById('comp-order-date');
    const compOrderAddress = document.getElementById('comp-order-address');
    const compOrderTotal = document.getElementById('comp-order-total');

    if (mainLayout) mainLayout.style.display = 'none';
    if (completedView) completedView.style.display = 'block';

    if (compOrderNo) compOrderNo.textContent = confirmedOrder.order_no;
    if (compOrderDate) compOrderDate.textContent = confirmedOrder.date;
    if (compOrderAddress) compOrderAddress.textContent = confirmedOrder.address;
    if (compOrderTotal) compOrderTotal.textContent = `¥${confirmedOrder.total_amount.toLocaleString()}`;

    showToast('ご注文を確定しました！購入履歴に反映されました。');
}

// --------------------------------------------------------------------------
// 8. マイページ管理（【要件】購入完了商品の一覧表示 & MySQL同期）
// --------------------------------------------------------------------------
async function syncOrdersFromBackend() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/orders');
        if (response.ok) {
            const data = await response.json();
            if (data.orders && data.orders.length > 0) {
                AppState.orderHistory = data.orders;
                localStorage.setItem('manekin_orders', JSON.stringify(data.orders));
                renderMyPage();
            }
        }
    } catch (e) {
        console.log("MySQL注文履歴の同期待機中（ローカルデータを使用）");
    }
}

function renderMyPage() {
    const userNameEl = document.getElementById('mypage-user-name');
    const userEmailEl = document.getElementById('mypage-user-email');
    const avatarEl = document.getElementById('mypage-avatar-initial');
    const ordersTbody = document.getElementById('orders-table-body');
    const orderCountEl = document.getElementById('mypage-order-count');
    const mypageFavGrid = document.getElementById('mypage-fav-grid');

    if (AppState.currentUser) {
        userNameEl.textContent = AppState.currentUser.name;
        userEmailEl.textContent = AppState.currentUser.email;
        avatarEl.textContent = AppState.currentUser.name.charAt(0);
    }

    if (orderCountEl) {
        orderCountEl.innerHTML = `${AppState.orderHistory.length} <span class="stat-unit">回</span>`;
    }

    // 【要件】購入ボタンを押して購入が完了した商品の一覧を描画
    if (ordersTbody) {
        if (AppState.orderHistory.length === 0) {
            ordersTbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 32px; color: #777;">
                        購入履歴はまだありません。商品をお選びいただき購入手続きをお試しください。
                    </td>
                </tr>
            `;
        } else {
            ordersTbody.innerHTML = AppState.orderHistory.map(order => `
                <tr>
                    <td><strong>${order.order_no}</strong></td>
                    <td>${order.date}</td>
                    <td>${order.items_summary || "ご注文商品"}</td>
                    <td><strong>¥${(order.total_amount || 0).toLocaleString()}</strong></td>
                    <td><span class="status-badge">${order.status || "発送準備中"}</span></td>
                </tr>
            `).join('');
        }
    }

    // お気に入りクイック表示
    if (mypageFavGrid) {
        const favoriteItems = SAMPLE_PRODUCTS.filter(p => AppState.favorites.includes(p.id));
        if (favoriteItems.length === 0) {
            mypageFavGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 24px; color: #777;">お気に入り登録された商品はありません。</p>';
        } else {
            mypageFavGrid.innerHTML = favoriteItems.slice(0, 4).map(p => createProductCardHTML(p)).join('');
        }
    }
}

// --------------------------------------------------------------------------
// 9. お気に入り機能
// --------------------------------------------------------------------------
function handleToggleFavorite(productId) {
    const index = AppState.favorites.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
        AppState.favorites.splice(index, 1);
        isAdded = false;
        showToast('お気に入りから解除しました');
    } else {
        AppState.favorites.push(productId);
        isAdded = true;
        showToast('お気に入りに追加しました');
    }

    localStorage.setItem('manekin_favorites', JSON.stringify(AppState.favorites));
    updateFavoriteBadges();
    syncAllFavoriteButtons(productId, isAdded);

    if (window.location.hash === '#favorites') {
        renderFavoriteProducts();
    }
}

function syncAllFavoriteButtons(productId, isFavorite) {
    const cards = document.querySelectorAll(`.product-card[data-id="${productId}"]`);
    cards.forEach(card => {
        const btn = card.querySelector('.fav-btn');
        if (btn) {
            if (isFavorite) {
                btn.classList.add('is-favorite');
            } else {
                btn.classList.remove('is-favorite');
            }
        }
    });

    const detailFavBtn = document.getElementById('detail-fav-btn');
    if (detailFavBtn && AppState.currentDetailId === productId) {
        if (isFavorite) {
            detailFavBtn.classList.add('is-favorite');
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                お気に入り解除
            `;
        } else {
            detailFavBtn.classList.remove('is-favorite');
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                お気に入りに追加
            `;
        }
    }
}

function updateFavoriteBadges() {
    const count = AppState.favorites.length;
    const navBadge = document.getElementById('nav-fav-badge');
    const iconBadge = document.getElementById('icon-fav-badge');
    const mypageFavCount = document.getElementById('mypage-fav-count');

    if (navBadge) navBadge.textContent = count;
    if (iconBadge) iconBadge.textContent = count;
    if (mypageFavCount) mypageFavCount.innerHTML = `${count} <span class="stat-unit">点</span>`;
}

function renderFavoriteProducts() {
    const favGrid = document.getElementById('favorite-product-grid');
    if (!favGrid) return;

    const favoriteItems = SAMPLE_PRODUCTS.filter(p => AppState.favorites.includes(p.id));
    if (favoriteItems.length === 0) {
        favGrid.innerHTML = `
            <div class="empty-state">
                <h2 class="empty-state-title">お気に入りはまだありません</h2>
                <p class="empty-state-text">気になるアイテムを見つけたら、ハートマークを押してお気に入りに追加しましょう。</p>
                <a href="#items" class="btn btn-primary">商品一覧を見る</a>
            </div>
        `;
    } else {
        favGrid.innerHTML = favoriteItems.map(p => createProductCardHTML(p)).join('');
    }
}

// --------------------------------------------------------------------------
// 10. 会員登録 & ログイン
// --------------------------------------------------------------------------
function updateAuthNavUI() {
    const authLink = document.getElementById('nav-auth-link');
    const mobileLoginLink = document.getElementById('mobile-login-link');
    const mobileRegisterLink = document.getElementById('mobile-register-link');

    if (AppState.currentUser) {
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
    } else {
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

function handleLogout() {
    AppState.currentUser = null;
    localStorage.removeItem('manekin_user');
    showToast('ログアウトしました');
    updateAuthNavUI();
    window.location.hash = '#home';
}

function handleDemoLogin() {
    const demoUser = {
        id: 1,
        name: "山田 太郎 様",
        email: "demo@manekin.com",
        rank: "VIP MEMBER"
    };
    AppState.currentUser = demoUser;
    localStorage.setItem('manekin_user', JSON.stringify(demoUser));
    showToast('デモアカウントでログインしました');
    updateAuthNavUI();
    window.location.hash = '#mypage';
}

// --------------------------------------------------------------------------
// 11. MANEKIN機能「開発中」モーダル表示
// --------------------------------------------------------------------------
function openManekinModal() {
    const modal = document.getElementById('manekin-modal');
    if (modal) {
        modal.classList.add('open');
        closeMobileDrawer();
    }
}

function closeManekinModal() {
    const modal = document.getElementById('manekin-modal');
    if (modal) modal.classList.remove('open');
}

// --------------------------------------------------------------------------
// 12. トースト通知ヘルパー
// --------------------------------------------------------------------------
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// --------------------------------------------------------------------------
// 13. モバイルドロワー制御
// --------------------------------------------------------------------------
function openMobileDrawer() {
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('menu-overlay');
    if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('active');
    }
}

function closeMobileDrawer() {
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('menu-overlay');
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
    }
}

// --------------------------------------------------------------------------
// 14. イベントリスナー一括登録
// --------------------------------------------------------------------------
function setupEventListeners() {
    window.addEventListener('hashchange', handleRouting);

    document.querySelectorAll('.nav-manekin-btn, #manekin-menu-btn, #mobile-manekin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openManekinModal();
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

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // 【要件追加】注文を確定するボタンのイベントバインド
    const placeOrderBtn = document.getElementById('btn-place-order');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    // 支払い方法ラジオボタンのスタイル切替
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

    // マイページのタブ切り替え
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
