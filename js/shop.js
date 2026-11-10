// ==========================================================================
// MANEKIN FASHION - ECショッピング機能モジュール (shop.js)a
// ==========================================================================

// 5. 商品カード生成 & カタログ表示
// --------------------------------------------------------------------------
function createProductCardHTML(product) {
    const isFav = AppState.favorites.includes(product.id);
    const formattedPrice = "¥" + product.price.toLocaleString();

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

    // 性別に応じた動的タイトル・パンくずの更新
    const breadcrumbCurrent = document.getElementById('catalog-breadcrumb-current');
    const pageTitle = document.getElementById('catalog-page-title');
    const pageSubtitle = document.getElementById('catalog-page-subtitle');

    if (AppState.selectedGender === 'MAN') {
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'MAN';
        if (pageTitle) pageTitle.textContent = "MEN'S COLLECTION";
        if (pageSubtitle) pageSubtitle.textContent = "現代の男性に向けた、洗練されたモダンウェア（全12アイテム）";
    } else if (AppState.selectedGender === 'WOMAN') {
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'WOMAN';
        if (pageTitle) pageTitle.textContent = "WOMEN'S COLLECTION";
        if (pageSubtitle) pageSubtitle.textContent = "凛とした美しさと現代的なリラックス感を纏うウィメンズウェア（全12アイテム）";
    } else {
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'ALL COLLECTION';
        if (pageTitle) pageTitle.textContent = "ALL COLLECTION";
        if (pageSubtitle) pageSubtitle.textContent = "すべての最新アイテム一覧（全24アイテム）";
    }

    let items = [...SAMPLE_PRODUCTS];
    if (AppState.selectedGender && AppState.selectedGender !== 'ALL') {
        items = items.filter(p => p.gender === AppState.selectedGender);
    }
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
// 6. 商品詳細表示ロジック（写真切替 & サイズ変更）
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

    AppState.selectedColor = product.colors[0];
    AppState.selectedSize = product.sizes[1] || "M";

    const isFav = AppState.favorites.includes(product.id);
    const formattedPrice = "¥" + product.price.toLocaleString();
    const initialImgUrl = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

    // カラーチップのHTML生成
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

    // サイズチップのHTML生成
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

// カラー選択ハンドラ
function handleColorSelect(chipEl, colorName, imageUrl) {
    const parent = chipEl.parentElement;
    parent.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
    chipEl.classList.add('selected');

    AppState.selectedColor = colorName;

    const labelColor = document.getElementById('label-selected-color');
    if (labelColor) labelColor.textContent = colorName;

    // 写真の切り替え
    const mainImg = document.getElementById('detail-main-img');
    if (mainImg && imageUrl) {
        mainImg.style.opacity = '0.25';
        setTimeout(() => {
            mainImg.src = imageUrl;
            mainImg.style.opacity = '1';
        }, 120);
    }

    showToast(`カラー: ${colorName} に切り替えました`);
}

// サイズ選択ハンドラ
function handleSizeSelect(chipEl, sizeName) {
    const parent = chipEl.parentElement;
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
    if (!AppState.cart || !Array.isArray(AppState.cart)) {
        AppState.cart = [];
    }
    const totalCount = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const cartBadge = document.getElementById('header-cart-badge');
    if (cartBadge) {
        cartBadge.textContent = isNaN(totalCount) ? 0 : totalCount;
    }
}

function handleAddToCartFromDetail(productId) {
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const currentImg = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

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

function handleBuyNow(productId) {
    handleAddToCartFromDetail(productId);
    if (!AppState.currentUser) {
        AppState.pendingAuthTarget = 'checkout';
        showToast('⚠️ ご購入には会員登録またはログインが必要です');
        window.location.hash = '#login';
        return;
    }
    window.location.hash = '#checkout';
}

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

function removeCartItem(index) {
    if (!AppState.cart[index]) return;
    AppState.cart.splice(index, 1);
    localStorage.setItem('manekin_cart', JSON.stringify(AppState.cart));
    updateCartBadge();
    renderCheckoutPage();
    showToast('バッグから商品を削除しました');
}

function renderCheckoutPage() {
    const cartListEl = document.getElementById('checkout-cart-list');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const mainLayout = document.getElementById('checkout-layout-main');
    const completedView = document.getElementById('order-completed-view');

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

    if (cartListEl) {
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

    // チェックアウト時のポイントと金額サマリーを計算・初期化
    updateCheckoutCalculations();
}

// ==============================================================================
// 7. ポイント管理 & チェックアウト計算（1pt = 1円）
// ==============================================================================

// ユーザーの保有ポイント取得ヘルパー
function getUserPoints() {
    if (!AppState.currentUser) return 0;
    if (AppState.currentUser.points === undefined || AppState.currentUser.points === null) {
        AppState.currentUser.points = 1000; // 初期ボーナス付与
        localStorage.setItem('manekin_user', JSON.stringify(AppState.currentUser));
    }
    return AppState.currentUser.points;
}

// ユーザーの保有ポイント更新ヘルパー
function setUserPoints(points) {
    if (!AppState.currentUser) return;
    AppState.currentUser.points = Math.max(0, points);
    localStorage.setItem('manekin_user', JSON.stringify(AppState.currentUser));

    // マイページ等の表示もリアルタイム更新
    const mypagePoints = document.getElementById('mypage-points');
    if (mypagePoints) {
        mypagePoints.innerHTML = `${AppState.currentUser.points.toLocaleString()} <span class="stat-unit">pt</span>`;
    }
}

// チェックアウト時のポイント利用入力ステート
let checkoutUsedPoints = 0;

/**
 * チェックアウトサマリー計算・更新ヘルパー
 */
function updateCheckoutCalculations() {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const shippingEl = document.getElementById('checkout-shipping');
    const taxEl = document.getElementById('checkout-tax');
    const totalEl = document.getElementById('checkout-total');
    const pointDiscountRow = document.getElementById('checkout-point-discount-row');
    const pointDiscountEl = document.getElementById('checkout-point-discount');
    const earnedPointsEl = document.getElementById('checkout-earned-points');
    const userPointsEl = document.getElementById('checkout-user-points');
    const pointInput = document.getElementById('checkout-use-points');
    const pointMessage = document.getElementById('checkout-point-message');

    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 5000 ? 0 : 550;
    const grossTotal = subtotal + shipping;

    const availablePoints = getUserPoints();
    if (userPointsEl) userPointsEl.textContent = availablePoints.toLocaleString();

    // 利用可能ポイント上限（保有ポイントと支払合計の小さい方）
    const maxUsable = Math.min(availablePoints, grossTotal);

    if (checkoutUsedPoints > maxUsable) {
        checkoutUsedPoints = maxUsable;
    }
    if (checkoutUsedPoints < 0) {
        checkoutUsedPoints = 0;
    }

    if (pointInput && document.activeElement !== pointInput) {
        pointInput.value = checkoutUsedPoints > 0 ? checkoutUsedPoints : '';
    }

    const netTotal = Math.max(0, grossTotal - checkoutUsedPoints);
    const tax = Math.round(netTotal * 10 / 110);

    // 今回獲得ポイント: 実質支払い金額の1%（端数切り捨て、購入額があれば最低1pt）
    const earnedPoints = netTotal > 0 ? Math.max(1, Math.floor(netTotal * 0.01)) : 0;

    if (subtotalEl) subtotalEl.textContent = `¥${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "無料 (5,000円以上)" : `¥${shipping.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `¥${tax.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `¥${netTotal.toLocaleString()}`;

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
            pointMessage.innerHTML = `<span style="color: #059669; font-weight: 700;">✓ ${checkoutUsedPoints.toLocaleString()} pt（${checkoutUsedPoints.toLocaleString()}円引き）を適用中</span>（残り: ${(availablePoints - checkoutUsedPoints).toLocaleString()} pt）`;
        } else {
            pointMessage.textContent = '1ポイント＝1円として、今回のお買い物代金にそのままご利用いただけます。';
        }
    }

    return { subtotal, shipping, grossTotal, usedPoints: checkoutUsedPoints, netTotal, earnedPoints };
}

function handlePointsInputChange() {
    const pointInput = document.getElementById('checkout-use-points');
    const val = parseInt(pointInput ? pointInput.value : 0, 10) || 0;
    checkoutUsedPoints = Math.max(0, val);
    updateCheckoutCalculations();
}

function handleUseAllPoints() {
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 5000 ? 0 : 550;
    const grossTotal = subtotal + shipping;
    const available = getUserPoints();

    if (available <= 0) {
        showToast('現在ご利用可能な保有ポイントはありません');
        return;
    }

    checkoutUsedPoints = Math.min(available, grossTotal);
    const pointInput = document.getElementById('checkout-use-points');
    if (pointInput) pointInput.value = checkoutUsedPoints;
    updateCheckoutCalculations();
    showToast(`✨ 保有ポイントから ${checkoutUsedPoints.toLocaleString()} pt（${checkoutUsedPoints.toLocaleString()}円分）を適用しました`);
}

function handleResetPoints() {
    checkoutUsedPoints = 0;
    const pointInput = document.getElementById('checkout-use-points');
    if (pointInput) pointInput.value = '';
    updateCheckoutCalculations();
    showToast('ポイント利用を取り消しました');
}

/**
 * 過去の注文履歴から手動でクローゼットへ同期する
 */
async function importOrderToCloset(idx) {
    const order = AppState.orderHistory[idx];
    const itemsList = (order && (order.items || order.items_detail)) ? (order.items || order.items_detail) : [];
    if (!order || itemsList.length === 0) return;

    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    const userId = AppState.currentUser ? AppState.currentUser.id : 1;
    let added = 0;

    for (let i = 0; i < itemsList.length; i++) {
        const it = itemsList[i];
        const itName = it.name || it.product_name || '購入商品';
        const itColor = it.color || 'BLACK';
        const itId = it.id || it.product_id || Date.now();
        const itImg = it.image || it.image_url || 'assets/images/men/スカイオックスフォードシャツ.png';
        const itPrice = it.price || it.unit_price || 0;

        const exists = AppState.myCloset.some(c => c.name === itName && c.color === itColor);
        if (!exists) {
            const newItem = {
                id: 'purchased-' + itId + '-' + i + '-' + Date.now(),
                productId: itId,
                name: itName,
                category: it.category || 'TOPS',
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

            try {
                await fetch(`${apiBase}/api/closet/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        id: newItem.id,
                        productId: newItem.productId,
                        name: newItem.name,
                        category: newItem.category,
                        color: newItem.color,
                        season: newItem.season,
                        image: newItem.image,
                        isOwned: true,
                        isPurchased: true,
                        price: newItem.price,
                        purchaseDate: newItem.purchaseDate
                    })
                });
            } catch (e) {}
        }
    }
    localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));

    if (added > 0) {
        showToast(`👗 注文商品をマイクローゼットに登録・MySQL保存しました（${added}点）`);
    } else {
        showToast('この注文の商品はすでにマイクローゼットに登録済みです');
    }
}

async function handlePlaceOrder() {
    if (AppState.cart.length === 0) {
        showToast('バッグに商品が入っていません');
        return;
    }

    // 未ログインの場合は購入不可とし、ログイン・会員登録画面へ誘導
    if (!AppState.currentUser) {
        AppState.pendingAuthTarget = 'checkout';
        showToast('⚠️ ご購入には会員登録またはログインが必要です');
        window.location.hash = '#login';
        return;
    }

    const nameInput = document.getElementById('order-name');
    const phoneInput = document.getElementById('order-phone');
    const emailInput = document.getElementById('order-email');
    const postalInput = document.getElementById('order-postal');
    const addressInput = document.getElementById('order-address');
    const deliveryTimeInput = document.getElementById('order-delivery-time');
    const paymentRadio = document.querySelector('input[name="payment_method"]:checked');

    const customerName = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const postal = postalInput ? postalInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
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

    const calc = updateCheckoutCalculations();

    const orderPayload = {
        customer_name: customerName,
        customer_email: email,
        phone: phone,
        postal_code: postal,
        address: address,
        payment_method: paymentMethod,
        delivery_time: deliveryTime,
        subtotal: calc.subtotal,
        shipping_fee: calc.shipping,
        used_points: calc.usedPoints,
        total_amount: calc.netTotal,
        earned_points: calc.earnedPoints,
        user_id: AppState.currentUser ? AppState.currentUser.id : 1,
        items: AppState.cart
    };

    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    let confirmedOrder = null;
    let backendUpdatedPoints = null;

    try {
        const response = await fetch(`${apiBase}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
            const data = await response.json();
            confirmedOrder = data.order;
            if (data.updated_points !== undefined && data.updated_points !== null) {
                backendUpdatedPoints = data.updated_points;
            }
        } else {
            throw new Error("APIレスポンスエラー");
        }
    } catch (err) {
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        confirmedOrder = {
            order_no: `ORD-${todayStr}-${randomNum}`,
            date: new Date().toLocaleDateString('ja-JP') + " " + new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            customer_name: customerName,
            address: address,
            total_amount: calc.netTotal,
            used_points: calc.usedPoints,
            earned_points: calc.earnedPoints,
            status: "注文受付・発送準備中",
            items: [...AppState.cart]
        };
    }

    const itemSummaryList = confirmedOrder.items.map(it => `${it.name} (${it.color} / ${it.size}) × ${it.quantity}`);
    confirmedOrder.items_summary = itemSummaryList.join(", ");

    // 1. ポイント更新（利用ポイント減算 ＋ 今回獲得ポイント付与）
    const currentPts = getUserPoints();
    const updatedPts = backendUpdatedPoints !== null ? backendUpdatedPoints : (Math.max(0, currentPts - calc.usedPoints) + calc.earnedPoints);
    setUserPoints(updatedPts);

    // 2. 【要件1】購入商品をマイクローゼットに自動保存！
    const purchasedItems = [...confirmedOrder.items];
    let addedCount = 0;
    purchasedItems.forEach((it, idx) => {
        // 重複チェック
        const exists = AppState.myCloset.some(c => c.name === it.name && c.color === it.color);
        if (!exists) {
            const newClosetItem = {
                id: 'purchased-' + (it.id || Date.now()) + '-' + idx,
                productId: it.id,
                name: it.name,
                category: it.category || 'TOPS',
                color: it.color || 'BLACK',
                season: '通年',
                image: it.image,
                isOwned: true,
                isPurchased: true,
                price: it.price,
                purchaseDate: new Date().toLocaleDateString('ja-JP')
            };
            AppState.myCloset.unshift(newClosetItem);
            addedCount++;
        }
    });
    localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));

    // 3. 注文履歴追加
    AppState.orderHistory.unshift(confirmedOrder);
    localStorage.setItem('manekin_orders', JSON.stringify(AppState.orderHistory));

    // 4. カート初期化
    AppState.cart = [];
    localStorage.removeItem('manekin_cart');
    updateCartBadge();
    checkoutUsedPoints = 0;

    const mainLayout = document.getElementById('checkout-layout-main');
    const completedView = document.getElementById('order-completed-view');
    const compOrderNo = document.getElementById('comp-order-no');
    const compOrderDate = document.getElementById('comp-order-date');
    const compOrderAddress = document.getElementById('comp-order-address');
    const compOrderTotal = document.getElementById('comp-order-total');
    const compEarnedPoints = document.getElementById('comp-earned-points');
    const compBalancePoints = document.getElementById('comp-balance-points');
    const closetBannerMsg = document.getElementById('completed-closet-msg');

    if (mainLayout) mainLayout.style.display = 'none';
    if (completedView) completedView.style.display = 'block';

    if (compOrderNo) compOrderNo.textContent = confirmedOrder.order_no;
    if (compOrderDate) compOrderDate.textContent = confirmedOrder.date;
    if (compOrderAddress) compOrderAddress.textContent = confirmedOrder.address;
    if (compOrderTotal) compOrderTotal.textContent = `¥${confirmedOrder.total_amount.toLocaleString()}`;
    if (compEarnedPoints) compEarnedPoints.textContent = `+${calc.earnedPoints.toLocaleString()} pt`;
    if (compBalancePoints) compBalancePoints.textContent = `${updatedPts.toLocaleString()} pt`;
    
    const compDbStatus = document.getElementById('comp-db-status');
    if (compDbStatus) {
        if (backendUpdatedPoints !== null || confirmedOrder.order_id) {
            compDbStatus.textContent = '🟢 MySQL (manekin_db) 保存完了';
            compDbStatus.style.background = '#dcfce7';
            compDbStatus.style.color = '#15803d';
        } else {
            compDbStatus.textContent = '⚠️ LocalStorage一時保存 (Python API停止中)';
            compDbStatus.style.background = '#fef3c7';
            compDbStatus.style.color = '#b45309';
        }
    }

    if (closetBannerMsg && purchasedItems.length > 0) {
        closetBannerMsg.textContent = `購入された「${purchasedItems[0].name}」など ${purchasedItems.length} 点をマイクローゼットに自動登録しました！スタジオで手持ち服との組み合わせや着せ替え比較をすぐにお試しいただけます。`;
    }

    showToast(`🎉 ご注文確定！${calc.earnedPoints}ポイントを獲得し、商品をマイクローゼットに保存しました`);
}

// --------------------------------------------------------------------------
// 8. マイページ管理
// --------------------------------------------------------------------------
async function syncOrdersFromBackend() {
    const statusPill = document.getElementById('mysql-status-pill');
    try {
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        const response = await fetch(`${apiBase}/api/orders`);
        if (response.ok) {
            const data = await response.json();
            if (statusPill) {
                statusPill.textContent = '🟢 MySQL (manekin_db) 接続中';
                statusPill.style.background = '#dcfce7';
                statusPill.style.color = '#15803d';
            }
            if (data.orders && Array.isArray(data.orders)) {
                // 初期ダミー（プレミアム コットン リラックス Tシャツのみの旧注文など）をフィルタ
                const validOrders = data.orders.filter(o => {
                    if (!o) return false;
                    const summary = (o.items_summary || "");
                    const isLegacyTshirt = summary.includes("プレミアム コットン リラックス Tシャツ") || summary.includes("リラックス Tシャツ") || summary.includes("item_tshirt");
                    return !isLegacyTshirt && o.order_no !== "ORD-2026-0982" && o.order_no !== "ORD-2026-0851";
                });
                AppState.orderHistory = validOrders;
                localStorage.setItem('manekin_orders', JSON.stringify(validOrders));
                renderMyPage();
            }
        } else {
            throw new Error('API response not ok');
        }
    } catch (e) {
        console.log("MySQL注文履歴の同期待機中 (ローカルモード)");
        if (statusPill) {
            statusPill.textContent = '🟠 LocalStorage稼働中 (Python API未接続)';
            statusPill.style.background = '#fef3c7';
            statusPill.style.color = '#b45309';
            statusPill.title = 'Pythonサーバー(app.py)が起動すると自動的にMySQL連携に切り替わります';
        }
    }
}

async function handleClearOrderHistory() {
    if (!confirm('ご注文履歴をすべて初期化して、まだ何も注文していない初期状態（0件）にしますか？')) return;

    AppState.orderHistory = [];
    localStorage.setItem('manekin_orders', JSON.stringify([]));

    try {
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        await fetch(`${apiBase}/api/orders`, { method: 'DELETE' });
    } catch (e) {
        console.warn('Backend orders delete failed', e);
    }

    renderMyPage();
    showToast('ご注文履歴をすべて初期化しました（0件）');
}

/**
 * LocalStorageに保存されている未同期データをMySQLへ一括反映する
 */
async function handleSyncAllToMySQL() {
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    showToast('🔄 Pythonサーバー / MySQL接続確認中...');

    let syncedOrders = 0;
    let syncedCloset = 0;
    let syncedOutfits = 0;

    try {
        // 0. ヘルスチェック（Flask & MySQL稼働確認）
        const healthRes = await fetch(`${apiBase}/api/health`);
        if (!healthRes.ok) {
            throw new Error('サーバーエラー');
        }
        const healthData = await healthRes.json();
        if (healthData.mysql !== 'connected') {
            showToast('⚠️ XAMPPでMySQLが起動していません。XAMPPコントロールパネルでMySQLをStartしてください。');
            return;
        }

        const userId = AppState.currentUser ? AppState.currentUser.id : 1;

        // 1. 注文データの同期（重複防止のため order_no と sync_mode を送信）
        if (AppState.orderHistory && AppState.orderHistory.length > 0) {
            for (const order of AppState.orderHistory) {
                const itemsList = order.items || order.items_detail || [];
                if (itemsList.length > 0) {
                    try {
                        const res = await fetch(`${apiBase}/api/orders`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                order_no: order.order_no,
                                sync_mode: true,
                                customer_name: order.customer_name || '会員 様',
                                customer_email: order.customer_email || 'user@manekin.com',
                                postal_code: order.postal_code || '150-0001',
                                address: order.address || '東京都渋谷区',
                                phone: order.phone || '090-0000-0000',
                                payment_method: order.payment_method || 'クレジットカード',
                                delivery_time: order.delivery_time || '指定なし',
                                subtotal: order.subtotal || order.total_amount || 0,
                                shipping_fee: order.shipping_fee || 0,
                                used_points: order.used_points || 0,
                                earned_points: order.earned_points || 0,
                                total_amount: order.total_amount || 0,
                                user_id: userId,
                                items: itemsList
                            })
                        });
                        if (res.ok) {
                            const d = await res.json();
                            if (!d.already_exists) syncedOrders++;
                        }
                    } catch (e) {}
                }
            }
        }

        // 2. マイクローゼットの同期
        if (AppState.myCloset && AppState.myCloset.length > 0) {
            for (const item of AppState.myCloset) {
                try {
                    const res = await fetch(`${apiBase}/api/closet/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            id: item.id,
                            productId: item.productId || null,
                            name: item.name,
                            category: item.category,
                            color: item.color,
                            season: item.season,
                            image: item.image,
                            isOwned: item.isOwned,
                            isPurchased: item.isPurchased,
                            price: item.price || 0,
                            purchaseDate: item.purchaseDate || ''
                        })
                    });
                    if (res.ok) syncedCloset++;
                } catch (e) {}
            }
        }

        // 3. お気に入りの同期
        if (AppState.favorites && AppState.favorites.length > 0) {
            try {
                await fetch(`${apiBase}/api/favorites/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        product_ids: AppState.favorites
                    })
                });
            } catch (e) {}
        }

        // 4. 保存コーデの同期
        if (AppState.savedOutfits && AppState.savedOutfits.length > 0) {
            for (const outfit of AppState.savedOutfits) {
                try {
                    const res = await fetch(`${apiBase}/api/outfits/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: userId,
                            id: outfit.id,
                            title: outfit.title,
                            date: outfit.date,
                            comment: outfit.comment,
                            items: outfit.items
                        })
                    });
                    if (res.ok) syncedOutfits++;
                } catch (e) {}
            }
        }

        // 5. 会員ポイント・体型プロフィールの同期
        if (AppState.currentUser) {
            try {
                await fetch(`${apiBase}/api/user/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        points: getUserPoints(),
                        height: AppState.userBodyProfile ? AppState.userBodyProfile.height : 172,
                        bodyType: AppState.userBodyProfile ? AppState.userBodyProfile.bodyType : 'REGULAR',
                        styleTaste: AppState.userBodyProfile ? AppState.userBodyProfile.styleTaste : 'MINIMAL'
                    })
                });
            } catch (e) {}
        }

        // 6. MySQLから最新データを再取得
        await syncOrdersFromBackend();
        await syncFavoritesFromBackend();
        if (typeof syncClosetFromBackend === 'function') {
            await syncClosetFromBackend();
        }
        if (typeof syncOutfitsFromBackend === 'function') {
            await syncOutfitsFromBackend();
        }

        showToast(`✨ MySQL連携完了！（新規注文:${syncedOrders}件, 服:${syncedCloset}点, コーデ:${syncedOutfits}件を保存）`);
    } catch (err) {
        showToast('⚠️ Pythonサーバー(ポート8080)が起動していません。start_server.bat または python app.py を起動してください');
    }
}

function renderMyPage() {
    const userNameEl = document.getElementById('mypage-user-name');
    const userEmailEl = document.getElementById('mypage-user-email');
    const avatarEl = document.getElementById('mypage-avatar-initial');
    const rankEl = document.getElementById('mypage-user-rank');
    const pointsEl = document.getElementById('mypage-points');
    const actionsWrapper = document.getElementById('mypage-actions-wrapper');
    const ordersTbody = document.getElementById('orders-table-body');
    const orderCountEl = document.getElementById('mypage-order-count');
    const mypageFavCount = document.getElementById('mypage-fav-count');
    const mypageFavGrid = document.getElementById('mypage-fav-grid');

    if (AppState.currentUser) {
        if (userNameEl) userNameEl.textContent = AppState.currentUser.name || '会員 様';
        if (userEmailEl) userEmailEl.textContent = AppState.currentUser.email || '';
        if (avatarEl) avatarEl.textContent = (AppState.currentUser.name || 'M').charAt(0);
        if (rankEl) rankEl.textContent = AppState.currentUser.rank || 'REGULAR MEMBER';
        if (pointsEl) pointsEl.innerHTML = `${getUserPoints().toLocaleString()} <span class="stat-unit">pt</span>`;
        if (actionsWrapper) {
            actionsWrapper.innerHTML = '<button class="btn btn-outline-sm" id="logout-btn" onclick="handleLogout()">ログアウト</button>';
        }
    } else {
        if (userNameEl) userNameEl.textContent = 'ゲスト 様';
        if (userEmailEl) userEmailEl.textContent = 'ログインしていません';
        if (avatarEl) avatarEl.textContent = 'G';
        if (rankEl) rankEl.textContent = 'GUEST';
        if (pointsEl) pointsEl.innerHTML = `0 <span class="stat-unit">pt</span>`;
        if (actionsWrapper) {
            actionsWrapper.innerHTML = '<a href="#login" class="btn btn-outline-sm" id="mypage-action-btn">ログイン</a>';
        }
    }

    if (orderCountEl) {
        const orderCount = Array.isArray(AppState.orderHistory) ? AppState.orderHistory.length : 0;
        orderCountEl.innerHTML = `${orderCount} <span class="stat-unit">回</span>`;
    }

    if (mypageFavCount) {
        const favCount = Array.isArray(AppState.favorites) ? AppState.favorites.length : 0;
        mypageFavCount.innerHTML = `${favCount} <span class="stat-unit">点</span>`;
    }

    if (ordersTbody) {
        if (!AppState.orderHistory || AppState.orderHistory.length === 0) {
            ordersTbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 32px; color: #777;">
                        購入履歴はまだありません。商品をお選びいただき購入手続きをお試しください。
                    </td>
                </tr>
            `;
        } else {
            ordersTbody.innerHTML = AppState.orderHistory.map((order, idx) => `
                <tr>
                    <td><strong>${order.order_no}</strong></td>
                    <td>${order.date}</td>
                    <td>
                        <div>${order.items_summary || "ご注文商品"}</div>
                        <button class="btn btn-outline-xs mt-1" onclick="importOrderToCloset(${idx})" style="font-size: 0.72rem; padding: 2px 8px; margin-top: 4px;" title="購入した服をマイクローゼットへ登録">
                            + クローゼットへ登録
                        </button>
                    </td>
                    <td><strong>¥${(order.total_amount || 0).toLocaleString()}</strong></td>
                    <td><span class="status-badge">${order.status || "発送準備中"}</span></td>
                </tr>
            `).join('');
        }
    }

    if (mypageFavGrid) {
        const favList = Array.isArray(AppState.favorites) ? AppState.favorites : [];
        const favoriteItems = SAMPLE_PRODUCTS.filter(p => favList.includes(p.id));
        if (favoriteItems.length === 0) {
            mypageFavGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 24px; color: #777;">お気に入り登録された商品はありません。</p>';
        } else {
            mypageFavGrid.innerHTML = favoriteItems.slice(0, 4).map(p => createProductCardHTML(p)).join('');
        }
    }
}

// --------------------------------------------------------------------------
// 9. お気に入り機能 (MySQL同期対応)
// --------------------------------------------------------------------------
async function syncFavoritesFromBackend() {
    try {
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        const userId = AppState.currentUser ? AppState.currentUser.id : '';
        const res = await fetch(`${apiBase}/api/favorites${userId ? '?user_id=' + userId : ''}`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.favorites) && data.favorites.length > 0) {
                const merged = Array.from(new Set([...AppState.favorites, ...data.favorites]));
                AppState.favorites = merged;
                localStorage.setItem('manekin_favorites', JSON.stringify(merged));
                updateFavoriteBadges();
                if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
            }
        }
    } catch (e) {}
}

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

    // MySQL (favoritesテーブル) にも即時同期
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    fetch(`${apiBase}/api/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            product_id: productId,
            user_id: AppState.currentUser ? AppState.currentUser.id : 1
        })
    }).catch(() => {});

    // スタジオ画面のブランドお気に入り一覧も即時同期
    if (typeof renderStudioBrandList === 'function') renderStudioBrandList();

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
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0z"></path>
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
    const studioFavBadge = document.getElementById('studio-fav-badge');
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');

    if (navBadge) navBadge.textContent = count;
    if (iconBadge) iconBadge.textContent = count;
    if (mypageFavCount) mypageFavCount.innerHTML = `${count} <span class="stat-unit">点</span>`;
    if (studioFavBadge) studioFavBadge.textContent = count;
    if (mobBrandFavCnt) mobBrandFavCnt.textContent = count;
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
    resetMannequinOutfit(true);
    showToast('ログアウトしました');
    updateAuthNavUI();
    renderMyPage();
    window.location.hash = '#home';
}

function handleDemoLogin() {
    const demoUser = {
        id: 1,
        name: "山田 太郎 様",
        email: "demo@manekin.com",
        rank: "VIP MEMBER",
        points: 1000
    };
    AppState.currentUser = demoUser;
    localStorage.setItem('manekin_user', JSON.stringify(demoUser));
    resetMannequinOutfit(true);
    updateAuthNavUI();
    if (AppState.pendingAuthTarget === 'manekin') {
        AppState.pendingAuthTarget = null;
        showToast('🎉 デモログイン完了！MANEKINスタジオへ移動します');
        window.location.hash = '#manekin-studio';
    } else if (AppState.pendingAuthTarget === 'checkout' && AppState.cart && AppState.cart.length > 0) {
        AppState.pendingAuthTarget = null;
        showToast('🎉 デモログイン完了！ご注文手続きへ戻ります');
        window.location.hash = '#checkout';
    } else {
        AppState.pendingAuthTarget = null;
        showToast('🎉 デモアカウントでログインしました！ようこそ、山田 太郎 様');
        window.location.hash = '#mypage';
    }
}

async function handleLogin(e) {
    if (e) e.preventDefault();
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '';

    if (!email) {
        showToast('メールアドレスを入力してください');
        if (emailEl) emailEl.focus();
        return;
    }
    if (!password) {
        showToast('パスワードを入力してください');
        if (passEl) passEl.focus();
        return;
    }

    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    let loggedInUser = null;

    try {
        const response = await fetch(`${apiBase}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            loggedInUser = data.user;
        } else {
            const errData = await response.json().catch(() => ({}));
            showToast(errData.message || 'メールアドレスまたはパスワードが正しくありません');
            return;
        }
    } catch (err) {
        // バックエンドオフ時のローカルフォールバック
        const namePart = email.split('@')[0] || '会員';
        loggedInUser = {
            id: Date.now(),
            name: `${namePart} 様`,
            email: email,
            rank: 'REGULAR MEMBER'
        };
    }

    if (loggedInUser) {
        loggedInUser.points = (loggedInUser.points !== undefined && loggedInUser.points !== null) ? loggedInUser.points : 1000;
        if (loggedInUser.body_height && AppState.userBodyProfile) {
            AppState.userBodyProfile.height = loggedInUser.body_height;
            AppState.userBodyProfile.bodyType = loggedInUser.body_type || 'REGULAR';
            AppState.userBodyProfile.styleTaste = loggedInUser.style_taste || 'MINIMAL';
            localStorage.setItem('manekin_body_profile', JSON.stringify(AppState.userBodyProfile));
        }
        AppState.currentUser = loggedInUser;
        localStorage.setItem('manekin_user', JSON.stringify(loggedInUser));
        resetMannequinOutfit(true);
        updateAuthNavUI();

        // ログインしたユーザーのデータをMySQLから同期
        syncOrdersFromBackend();
        syncFavoritesFromBackend();
        if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
        if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();

        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        if (AppState.pendingAuthTarget === 'manekin') {
            AppState.pendingAuthTarget = null;
            showToast(`🎉 ログイン完了！ようこそ、${loggedInUser.name}。MANEKINスタジオへ移動します`);
            window.location.hash = '#manekin-studio';
        } else if (AppState.pendingAuthTarget === 'checkout' && AppState.cart && AppState.cart.length > 0) {
            AppState.pendingAuthTarget = null;
            showToast(`🎉 ログイン完了！ようこそ、${loggedInUser.name}。ご注文手続きへ戻ります`);
            window.location.hash = '#checkout';
        } else {
            AppState.pendingAuthTarget = null;
            showToast(`🎉 ログインに成功しました！ようこそ、${loggedInUser.name}`);
            window.location.hash = '#mypage';
        }
    }
}

async function handleRegister(e) {
    if (e) e.preventDefault();
    const nameEl = document.getElementById('reg-name');
    const emailEl = document.getElementById('reg-email');
    const passEl = document.getElementById('reg-password');
    const agreeEl = document.getElementById('reg-agree');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '';
    const isAgree = agreeEl ? agreeEl.checked : true;

    if (!name) {
        showToast('氏名を入力してください');
        if (nameEl) nameEl.focus();
        return;
    }
    if (!email) {
        showToast('メールアドレスを入力してください');
        if (emailEl) emailEl.focus();
        return;
    }
    if (!password || password.length < 4) {
        showToast('パスワードは4文字以上で入力してください');
        if (passEl) passEl.focus();
        return;
    }
    if (!isAgree) {
        showToast('利用規約およびプライバシーポリシーに同意してください');
        return;
    }

    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    let newUser = null;

    try {
        const response = await fetch(`${apiBase}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            newUser = data.user;
        } else {
            const errData = await response.json().catch(() => ({}));
            showToast(errData.message || '会員登録に失敗しました');
            return;
        }
    } catch (err) {
        // バックエンドオフ時のローカルフォールバック
        newUser = {
            id: Date.now(),
            name: `${name} 様`,
            email: email,
            rank: 'REGULAR MEMBER'
        };
    }

    if (newUser) {
        newUser.points = 1000; // 新規会員登録で1,000ポイント（1,000円分）プレゼント！
        AppState.currentUser = newUser;
        localStorage.setItem('manekin_user', JSON.stringify(newUser));
        resetMannequinOutfit(true);
        updateAuthNavUI();

        syncOrdersFromBackend();
        syncFavoritesFromBackend();
        if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
        if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();

        if (nameEl) nameEl.value = '';
        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        if (AppState.pendingAuthTarget === 'manekin') {
            AppState.pendingAuthTarget = null;
            showToast(`🎉 会員登録完了！1,000ポイント（1,000円分）を進呈しました！ようこそ、${newUser.name}`);
            window.location.hash = '#manekin-studio';
        } else if (AppState.pendingAuthTarget === 'checkout' && AppState.cart && AppState.cart.length > 0) {
            AppState.pendingAuthTarget = null;
            showToast(`🎉 会員登録完了！1,000ポイント（1,000円分）を進呈しました！ご注文手続きへ戻ります`);
            window.location.hash = '#checkout';
        } else {
            AppState.pendingAuthTarget = null;
            showToast(`🎉 会員登録完了！特典として 1,000 ポイント（1,000円分）をプレゼントしました！ようこそ、${newUser.name}`);
            window.location.hash = '#mypage';
        }
    }
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
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileDrawer() {
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('menu-overlay');
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// グローバル公開
window.getUserPoints = getUserPoints;
window.setUserPoints = setUserPoints;
window.handlePointsInputChange = handlePointsInputChange;
window.handleUseAllPoints = handleUseAllPoints;
window.handleResetPoints = handleResetPoints;
window.importOrderToCloset = importOrderToCloset;
window.handleSyncAllToMySQL = handleSyncAllToMySQL;
window.syncOrdersFromBackend = syncOrdersFromBackend;
window.syncFavoritesFromBackend = syncFavoritesFromBackend;
window.handleClearOrderHistory = handleClearOrderHistory;

// --------------------------------------------------------------------------
