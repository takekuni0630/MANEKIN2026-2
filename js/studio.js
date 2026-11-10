// ==========================================================================
// MANEKIN FASHION - MANEKIN AI STUDIO（試着スタジオ）モジュール (studio.js)a
// ==========================================================================

// ==========================================================================
// 15. MANEKIN AI STUDIO（AIコーデシミュレーション機能）ロジック
// ==========================================================================

// クイック選択用プリセット画像マッピング
const PRESET_CLOSET_PRESETS = {
    'black_cap': {
        name: 'クラシック コットンキャップ',
        category: 'HAT',
        color: 'BLACK',
        season: '通年',
        image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22180%22%20text-anchor%3D%22middle%22%20fill%3D%22%23888888%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20letter-spacing%3D%222%22%20font-weight%3D%22600%22%3ECLASSIC%20CAP%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    'black_pants': {
        name: '黒ワイドスラックス',
        category: 'BOTTOMS',
        color: 'BLACK',
        season: '通年',
        image: 'assets/images/men/ストレートレープセミフレアスラックス.png'
    },
    'white_sneakers': {
        name: '白レザースニーカー',
        category: 'SHOES',
        color: 'WHITE',
        season: '通年',
        image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22300%22%20height%3D%22300%22%2F%3E%3Cpath%20d%3D%22M40%20200%20C40%20170%2090%20150%20140%20150%20C170%20150%20200%20130%20230%20140%20C260%20150%20270%20180%20270%20210%20L40%20210%20Z%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23111111%22%20stroke-width%3D%226%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M40%20210%20L270%20210%20L270%20230%20C270%20235%20265%20240%20260%20240%20L50%20240%20C45%20240%2040%20235%2040%20230%20Z%22%20fill%3D%22%23e5e7eb%22%20stroke%3D%22%23111111%22%20stroke-width%3D%226%22%2F%3E%3Cpath%20d%3D%22M150%20150%20L180%20170%20M170%20150%20L200%20170%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22270%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-size%3D%2214%22%20font-family%3D%22sans-serif%22%20letter-spacing%3D%221%22%3ESNEAKERS%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    'grey_hoodie': {
        name: 'ヘビーウェイト グレーパーカー',
        category: 'TOPS',
        color: 'GREY',
        season: '秋冬',
        image: 'assets/images/men/アーバングレイジップフーディ.png'
    },
    'white_tshirt': {
        name: 'プレミアム リラックス 白Tシャツ',
        category: 'TOPS',
        color: 'WHITE',
        season: '春夏',
        image: 'assets/images/men/スカイオックスフォードシャツ.png'
    },
    'denim_jacket': {
        name: 'オーバーサイズ デニムジャケット',
        category: 'OUTER',
        color: 'BLUE',
        season: '春秋',
        image: 'assets/images/men/リラックスダブルブレストテーラードジャケット.png'
    }
};

let currentClosetUploadDataUrl = '';
let originalClosetUploadDataUrl = '';
let isCurrentUploadTransparent = false;

/**
 * スタジオ内のサブタブ切り替え
 */
function switchStudioTab(tabKey) {
    AppState.studioActiveTab = tabKey;

    // タブボタンのアクティブ更新
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-studio-tab') === tabKey);
    });

    // パネルのアクティブ更新
    document.querySelectorAll('.studio-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`studio-pane-${tabKey}`);
    if (targetPane) {
        targetPane.classList.add('active');
    }

    renderManekinStudio(tabKey);
}

/**
 * MANEKIN AI STUDIOの全般描画
 */
function renderManekinStudio(activeTab = 'create') {
    // ユーザー名反映
    const userNameElem = document.getElementById('studio-user-name');
    const avatarCharElem = document.getElementById('studio-avatar-char');
    const userRankElem = document.getElementById('studio-user-rank');
    if (AppState.currentUser) {
        if (userNameElem) userNameElem.textContent = AppState.currentUser.name || '会員 様';
        if (avatarCharElem) avatarCharElem.textContent = (AppState.currentUser.name || 'M').charAt(0);
        if (userRankElem) userRankElem.textContent = AppState.currentUser.rank || 'MEMBER';
    } else {
        if (userNameElem) userNameElem.textContent = 'ゲスト 様';
        if (avatarCharElem) avatarCharElem.textContent = 'G';
        if (userRankElem) userRankElem.textContent = 'GUEST';
    }

    // バッジ件数更新
    const closetBadge = document.getElementById('studio-closet-badge');
    if (closetBadge) closetBadge.textContent = AppState.myCloset.length;

    const favBadge = document.getElementById('studio-fav-badge');
    if (favBadge) favBadge.textContent = AppState.favorites.length;

    const savedBadge = document.getElementById('studio-saved-badge');
    if (savedBadge) savedBadge.textContent = AppState.savedOutfits.length;

    const mobClosetCnt = document.getElementById('mob-closet-cnt');
    if (mobClosetCnt) mobClosetCnt.textContent = AppState.myCloset.length;

    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');
    if (mobBrandFavCnt) mobBrandFavCnt.textContent = AppState.favorites.length;

    // ホームサマリーの数値
    const homeCloset = document.getElementById('home-stat-closet');
    if (homeCloset) homeCloset.innerHTML = `${AppState.myCloset.length} <small>点</small>`;

    const homeSaved = document.getElementById('home-stat-saved');
    if (homeSaved) homeSaved.innerHTML = `${AppState.savedOutfits.length} <small>組</small>`;

    const homeFav = document.getElementById('home-stat-fav');
    if (homeFav) homeFav.innerHTML = `${AppState.favorites.length} <small>点</small>`;

    // プロフィール情報反映
    const profName = document.getElementById('prof-display-name');
    const profEmail = document.getElementById('prof-display-email');
    const profRank = document.getElementById('prof-display-rank');
    if (AppState.currentUser) {
        if (profName) profName.textContent = AppState.currentUser.name || '会員 様';
        if (profEmail) profEmail.textContent = AppState.currentUser.email || '';
        if (profRank) profRank.textContent = AppState.currentUser.rank || 'REGULAR MEMBER';
    } else {
        if (profName) profName.textContent = 'ゲスト 様';
        if (profEmail) profEmail.textContent = '未ログイン（ログインが必要です）';
        if (profRank) profRank.textContent = 'GUEST';
    }

    // 各タブごとの描画
    switch (activeTab) {
        case 'home':
            break;
        case 'closet':
            renderPaneClosetGrid();
            break;
        case 'favorites':
            renderStudioFavoritesGrid();
            break;
        case 'create':
            renderStudioClosetList();
            renderStudioBrandList();
            renderMannequinStage();
            updateAIStylingComment();
            break;
        case 'saved':
            renderSavedOutfitsGrid();
            break;
        case 'profile':
            break;
    }
}

// 販売商品向け5段階サイズ定義（左からXS、S、M、L、XL）
const BRAND_SIZE_LIST = ['XS', 'S', 'M', 'L', 'XL'];
const BRAND_SIZE_SCALES = {
    'XS': 88,   // 88% (タイト)
    'S': 94,    // 94% (スリム)
    'M': 100,  // 100% (標準)
    'L': 106,   // 106% (ゆったり)
    'XL': 112   // 112% (ワイド)
};

// --------------------------------------------------------------------------
// 15.1 マイクローゼット（手持ち服）の描画 & 操作
// --------------------------------------------------------------------------

/**
 * パネル2（マイクローゼット画面）のグリッド描画
 */
function renderPaneClosetGrid() {
    const grid = document.getElementById('closet-items-grid');
    if (!grid) return;

    const filter = AppState.studioClosetFilter || 'ALL';
    const items = (filter === 'ALL')
        ? AppState.myCloset
        : AppState.myCloset.filter(item => item.category === filter);

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="closet-empty-card">
                <div class="closet-empty-icon">🧥</div>
                <h3 class="closet-empty-title">まだ手持ちの服が登録されていません</h3>
                <p class="closet-empty-desc">お気に入りの服やよく着る服を登録すると、ブランド商品とのコーディネートを試着できます。</p>
                <button class="btn btn-primary" onclick="openAddClosetModal()">+ 手持ちの服を登録する</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map(item => {
        const isWearing = isItemWearing(item);
        const colorHex = getColorHex(item.color);

        return `
            <div class="closet-card ${isWearing ? 'is-wearing' : ''}">
                <div class="closet-card-thumb-wrap">
                    <img src="${item.image}" alt="${item.name}" class="closet-card-img" onerror="this.src='assets/images/men/スカイオックスフォードシャツ.png'">
                    <span class="closet-badge-owned">手持ち服</span>
                    ${isWearing ? '<span class="closet-badge-wearing">● 着用中</span>' : ''}
                </div>
                <div class="closet-card-body">
                    <div class="closet-card-meta">
                        <span class="closet-card-cat">${getCategoryNameJP(item.category)}</span>
                        <span class="closet-color-dot" style="background-color: ${colorHex};" title="${item.color}"></span>
                    </div>
                    <h4 class="closet-card-name">${item.name}</h4>
                    <p class="closet-card-season">季節: ${item.season || '通年'}</p>
                    <div class="closet-card-actions">
                        <button class="btn-wear-toggle ${isWearing ? 'is-active' : ''}" onclick="toggleWearItem('${item.id}', true)">
                            ${isWearing ? '試着を外す' : 'マネキンに着せる'}
                        </button>
                        <button class="btn-closet-del" onclick="deleteClosetItem('${item.id}')" title="削除">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * スタジオ内（左カラム）の手持ち服リスト描画
 */
function renderStudioClosetList() {
    const list = document.getElementById('studio-closet-list');
    if (!list) return;

    const filter = AppState.studioClosetFilter || 'ALL';
    const items = (filter === 'ALL')
        ? AppState.myCloset
        : AppState.myCloset.filter(item => item.category === filter);

    if (items.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 30px 10px; color: var(--color-gray-medium);">
                <p style="font-size: 0.85rem; margin-bottom: 12px;">該当する手持ち服がありません</p>
                <button class="btn btn-outline-xs" onclick="openAddClosetModal()">+ 手持ち服を登録</button>
            </div>
        `;
        return;
    }

    list.innerHTML = items.map(item => {
        const isWearing = isItemWearing(item);
        const colorHex = getColorHex(item.color);
        const fallback = getCategoryFallbackImage(item.category);

        return `
            <div class="studio-item-card ${isWearing ? 'is-active' : ''}" draggable="true" ondragstart="handleCardDragStart(event, '${item.id}', true)" onclick="toggleWearItem('${item.id}', true)" title="${isWearing ? 'クリックして脱がす' : 'クリックまたはドラッグしてマネキンに試着'}">
            <img src="${item.image}" alt="${item.name}" class="studio-item-card-img" onerror="this.onerror=null;this.src='${fallback}';" >
                <div class="studio-item-card-info">
                    <div class="studio-card-cat-row">
                        <span class="studio-card-cat">${getCategoryNameJP(item.category)}</span>
                        <span class="closet-color-dot" style="background-color: ${colorHex}; width: 9px; height: 9px;" title="${item.color}"></span>
                    </div>
                    <div class="studio-card-name" title="${item.name}">${item.name}</div>
                    <div class="studio-card-sub">${item.season || '通年'}</div>
                </div>
                ${isWearing ? '<span class="studio-card-badge-wearing">着用中</span>' : ''}
            </div>
            `;
    }).join('');
}

function handlePaneClosetFilter(cat) {
    AppState.studioClosetFilter = cat;
    document.querySelectorAll('#pane-closet-filter-bar .filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    renderPaneClosetGrid();
}

function handleStudioClosetFilter(cat) {
    AppState.studioClosetFilter = cat;
    document.querySelectorAll('#col-closet-filter .mini-chip').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    renderStudioClosetList();
}

// --------------------------------------------------------------------------
// 15.2 ブランド商品（右カラム & お気に入り）の描画
// --------------------------------------------------------------------------

/**
 * スタジオ内（右カラム）のブランド商品リスト描画（お気に入りに登録された服のみ表示）
 */
function renderStudioBrandList() {
    const list = document.getElementById('studio-brand-list');
    if (!list) return;

    const filter = AppState.studioBrandFilter || 'ALL';
    const gender = AppState.studioGender || 'MEN';

    // お気に入りに登録されているブランド商品のみを抽出
    const favIds = Array.isArray(AppState.favorites) ? AppState.favorites : [];
    const allFavProducts = SAMPLE_PRODUCTS.filter(p => favIds.includes(p.id));

    // モバイル用タブのカウント更新
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');
    if (mobBrandFavCnt) {
        mobBrandFavCnt.textContent = allFavProducts.length;
    }

    // 性別によるフィルタリング（MEN / WOMEN）
    let products = allFavProducts.filter(p => !p.gender || p.gender === gender);
    if (filter !== 'ALL') {
        products = products.filter(p => p.category === filter);
    }

    // お気に入りアイテムが1件も登録されていない場合
    if (allFavProducts.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 16px; color: var(--color-gray-medium);">
                <div style="font-size: 2rem; margin-bottom: 8px; color: var(--color-accent); opacity: 0.85;">♥</div>
                <p style="font-size: 0.88rem; font-weight: 600; color: var(--color-black); margin-bottom: 6px;">お気に入りの服がありません</p>
                <p style="font-size: 0.78rem; line-height: 1.5; margin-bottom: 14px;">商品一覧でハート（♥）を押してお気に入り登録すると、ここに表示されてマネキンに試着できます。</p>
                <a href="#items" class="btn btn-outline-xs" style="display: inline-block; padding: 6px 16px; font-size: 0.75rem;">商品一覧を見に行く</a>
            </div>
        `;
        return;
    }

    // お気に入りは登録されているが、現在の性別やカテゴリフィルターに合致しない場合
    if (products.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 36px 12px; color: var(--color-gray-medium);">
                <p style="font-size: 0.85rem; font-weight: 600; color: var(--color-dark); margin-bottom: 6px;">該当するお気に入りアイテムがありません</p>
                <p style="font-size: 0.75rem; color: var(--color-gray-medium); line-height: 1.4;">他のカテゴリまたはマネキンの性別（${gender === 'MEN' ? 'WOMEN' : 'MEN'}）をお試しください。</p>
            </div>
        `;
        return;
    }

    list.innerHTML = products.map(product => {
        const isWearing = isItemWearing(product);
        const fallback = getCategoryFallbackImage(product.category);

        return `
            <div class="studio-item-card ${isWearing ? 'is-active' : ''}" draggable="true" ondragstart="handleCardDragStart(event, ${product.id}, false)" onclick="toggleWearItem(${product.id}, false)" title="${isWearing ? 'クリックして脱がす' : 'クリックまたはドラッグしてマネキンに試着'}">
                <img src="${product.image}" alt="${product.name}" class="studio-item-card-img" onerror="this.onerror=null;this.src='${fallback}';">
                <div class="studio-item-card-info">
                    <div class="studio-card-cat-row">
                        <span class="studio-card-cat">${product.category}</span>
                        <span style="color: var(--color-accent); font-size: 0.75rem;" title="お気に入り登録済み">♥</span>
                    </div>
                    <div class="studio-card-name" title="${product.name}">${product.name}</div>
                    <div class="studio-card-sub">¥${product.price.toLocaleString()}</div>
                </div>
                ${isWearing ? '<span class="studio-card-badge-wearing">着用中</span>' : ''}
            </div>
        `;
    }).join('');
}

function handleStudioBrandFilter(cat) {
    AppState.studioBrandFilter = cat;
    document.querySelectorAll('#col-brand-filter .mini-chip').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-brand-cat') === cat);
    });
    renderStudioBrandList();
}

function toggleBrandFavFilter(chk) {
    AppState.studioBrandFavOnly = chk.checked;
    renderStudioBrandList();
}

/**
 * パネル3（お気に入りブランド商品）の描画
 */
function renderStudioFavoritesGrid() {
    const grid = document.getElementById('studio-fav-grid');
    if (!grid) return;

    const favProducts = SAMPLE_PRODUCTS.filter(p => AppState.favorites.includes(p.id));

    if (favProducts.length === 0) {
        grid.innerHTML = `
            <div class="closet-empty-card" >
                <div class="closet-empty-icon">♥</div>
                <h3 class="closet-empty-title">お気に入りに登録されたアイテムはありません</h3>
                <p class="closet-empty-desc">商品一覧でお気に入り（ハート）を登録すると、ここに一覧表示されワンクリックでマネキンに着せ替えることができます。</p>
                <a href="#items" class="btn btn-primary">商品コレクションを見る</a>
            </div>
            `;
        return;
    }

    grid.innerHTML = favProducts.map(product => {
        const isWearing = isItemWearing(product);
        return `
            <article class="product-card" data - id="${product.id}" >
                <div class="product-img-wrapper" onclick="toggleWearItem(${product.id}, false); switchStudioTab('create');">
                    <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='assets/images/men/スカイオックスフォードシャツ.png'">
                    <span class="badge-new" style="background: var(--color-black);">試着する</span>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name" onclick="toggleWearItem(${product.id}, false); switchStudioTab('create');">${product.name}</h3>
                    <p class="product-price">¥${product.price.toLocaleString()}</p>
                    <button class="btn btn-primary btn-block btn-sm mt-2" onclick="toggleWearItem(${product.id}, false); switchStudioTab('create');">
                        ${isWearing ? '試着中 (スタジオを開く)' : 'マネキンに着せて試着する'}
                    </button>
                </div>
            </article>
            `;
    }).join('');
}

// --------------------------------------------------------------------------
// 15.3 マネキン試着室 & 自動反映 & レイヤード表示
// --------------------------------------------------------------------------

/**
 * 
 * アイテムが現在マネキンに着用されているか判定
 */
function isItemWearing(item) {
    const outfit = AppState.currentOutfit;
    if (!outfit) return false;
    for (const slotKey in outfit) {
        const worn = outfit[slotKey];
        if (worn && String(worn.id) === String(item.id)) {
            return true;
        }
    }
    return false;
}

/**
 * 試着トグル（着用 / 脱がす）
 */
function toggleWearItem(itemId, isOwned) {
    let targetItem = null;
    if (isOwned) {
        targetItem = AppState.myCloset.find(c => String(c.id) === String(itemId));
    } else {
        targetItem = SAMPLE_PRODUCTS.find(p => p.id === parseInt(itemId, 10));
    }

    if (!targetItem) return;

    const slotKey = getSlotKeyByCategory(targetItem.category);
    if (!slotKey) return;

    const currentWorn = AppState.currentOutfit[slotKey];
    if (currentWorn && String(currentWorn.id) === String(targetItem.id)) {
        // すでに着用中なら脱がす
        AppState.currentOutfit[slotKey] = null;
        showToastNotification(`「${targetItem.name}」を外しました`);
    } else {
        // スロットに着用
        AppState.currentOutfit[slotKey] = {
            id: targetItem.id,
            name: targetItem.name,
            category: targetItem.category,
            color: targetItem.color || (targetItem.colors ? targetItem.colors[0] : 'BLACK'),
            price: targetItem.price || 0,
            image: targetItem.image,
            isOwned: !!isOwned
        };
        showToastNotification(`「${targetItem.name}」をマネキンに試着しました`);
        AppState.activeAdjustSlot = slotKey;
    }

    localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));

    // UI更新
    renderMannequinStage();
    renderStudioClosetList();
    renderStudioBrandList();
    updateAIStylingComment();
}

/**
 * カテゴリをスロットキーにマッピング
 */
function getSlotKeyByCategory(category) {
    switch (category) {
        case 'OUTER': return 'outer';
        case 'TOPS': return 'tops';
        case 'BOTTOMS': return 'bottoms';
        case 'SHOES': return 'shoes';
        case 'HAT': case 'HATS': case 'CAP': return 'hat';
        default: return 'tops';
    }
}

/**
 * スロットの服を脱がせる
 */
function unwearSlot(slotKey) {
    if (AppState.currentOutfit[slotKey]) {
        const name = AppState.currentOutfit[slotKey].name;
        AppState.currentOutfit[slotKey] = null;
        localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));
        showToastNotification(`「${name}」を外しました`);

        renderMannequinStage();
        renderStudioClosetList();
        renderStudioBrandList();
        updateAIStylingComment();
    }
}

/**
 * 全身クリア（すべての服を脱がす）
 */
function resetMannequinOutfit(silent = false) {
    AppState.currentOutfit = {
        hat: null,
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    };
    localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));
    if (!silent) {
        showToastNotification('マネキンの着用服をすべてクリアしました');
    }

    renderMannequinStage();
    renderStudioClosetList();
    renderStudioBrandList();
    updateAIStylingComment();
}

function clearMannequin() {
    resetMannequinOutfit(false);
}

/**
 * マネキンステージの描画更新
 */
// =========================================================================
// カテゴリ別フォールバックSVG画像
// =========================================================================
function getCategoryFallbackImage(category) {
    switch (category) {
        case 'SHOES':
            return "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20140%2065%22%3E%3Cpath%20d%3D%22M15%2048%20C25%2048%2C%2035%2046%2C%2045%2040%20C55%2032%2C%2065%2022%2C%2085%2020%20C95%2019%2C%20110%2025%2C%20125%2038%20C132%2044%2C%20130%2050%2C%20120%2052%20L15%2052%20Z%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M10%2052%20L128%2052%20C132%2052%2C%20132%2058%2C%20126%2058%20L10%2058%20C6%2058%2C%206%2052%2C%2010%2052%20Z%22%20fill%3D%22%23e2e8f0%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%2F%3E%3Cpath%20d%3D%22M65%2026%20L80%2032%20M60%2031%20L75%2037%20M55%2036%20L70%2042%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E";
        case 'BOTTOMS':
            return 'assets/images/men/ストレートレープセミフレアスラックス.png';
        case 'OUTER':
            return 'assets/images/men/オーバードレープダブルトレンチコート.png';
        case 'HAT': case 'HATS': case 'CAP':
            return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E";
        case 'TOPS':
        default:
            return 'assets/images/men/アーバングレイジップフーディ.png';
    }
}

// 過去のlocalStorageに残っている存在しない旧画像パスを安全にマイグレーション
function migrateOldBrokenAssets() {
    // 過去のlocalStorageに残っている初期値ダミーデータ（お気に入り、初期カート、初期ユーザー）を一括クリーンアップ
    if (!localStorage.getItem('manekin_clean_initial_v2')) {
        // 1. お気に入りの初期ダミー（[1, 2] や [1]）を空にリセット
        if (JSON.stringify(AppState.favorites) === JSON.stringify([1, 2]) || JSON.stringify(AppState.favorites) === JSON.stringify([1])) {
            AppState.favorites = [];
            localStorage.setItem('manekin_favorites', JSON.stringify([]));
        }
        // 2. カートの初期ダミー商品を空にリセット
        if (Array.isArray(AppState.cart) && AppState.cart.length === 1 && AppState.cart[0].id === 1) {
            AppState.cart = [];
            localStorage.setItem('manekin_cart', JSON.stringify([]));
        }
        // 3. 初期ダミーユーザー（山田 太郎 様 / demo@manekin.com）を未ログイン状態にリセット
        if (AppState.currentUser && AppState.currentUser.name === "山田 太郎 様" && AppState.currentUser.email === "demo@manekin.com") {
            AppState.currentUser = null;
            localStorage.removeItem('manekin_user');
        }
        localStorage.setItem('manekin_clean_initial_v2', 'true');
    }

    // 注文履歴の初期ダミー（プレミアムコットンリラックスTシャツ等）を完全リセットして0件にする
    if (!localStorage.getItem('manekin_clean_orders_v3')) {
        AppState.orderHistory = [];
        localStorage.setItem('manekin_orders', JSON.stringify([]));
        try {
            const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
            fetch(`${apiBase}/api/orders`, { method: 'DELETE' }).catch(() => { });
        } catch (e) { }
        localStorage.setItem('manekin_clean_orders_v3', 'true');
    }

    // 初期サンプル注文データやTシャツ履歴のクリーンアップ（誤認防止のため初期値ダミー注文を完全削除）
    if (Array.isArray(AppState.orderHistory)) {
        const cleanedOrders = AppState.orderHistory.filter(o => {
            if (!o) return false;
            if (o.order_no === "ORD-2026-0982" || o.order_no === "ORD-2026-0851") return false;
            const summary = (o.items_summary || "");
            const isTshirt = summary.includes("プレミアム コットン リラックス Tシャツ") || summary.includes("リラックス Tシャツ") || summary.includes("item_tshirt");
            return !isTshirt;
        });
        if (cleanedOrders.length !== AppState.orderHistory.length) {
            AppState.orderHistory = cleanedOrders;
            localStorage.setItem('manekin_orders', JSON.stringify(AppState.orderHistory));
        }
    }

    // 保存したコーデの初期ダミー（秋の通学・デイリーコーデ / outfit-sample-1）を完全削除
    if (Array.isArray(AppState.savedOutfits)) {
        const cleanedOutfits = AppState.savedOutfits.filter(o => o && o.id !== 'outfit-sample-1');
        if (cleanedOutfits.length !== AppState.savedOutfits.length || !localStorage.getItem('manekin_clean_saved_outfits_v1')) {
            AppState.savedOutfits = cleanedOutfits;
            localStorage.setItem('manekin_saved_outfits', JSON.stringify(cleanedOutfits));
            localStorage.setItem('manekin_clean_saved_outfits_v1', 'true');
        }
    }

    // 試着室マネキンの初期状態を完全クリア（何も着せていない未着用状態をデフォルトに）
    if (!localStorage.getItem('manekin_clean_outfit_v2')) {
        AppState.currentOutfit = {
            hat: null,
            outer: null,
            tops: null,
            bottoms: null,
            shoes: null
        };
        localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));
        localStorage.setItem('manekin_clean_outfit_v2', 'true');
    }

    const defaultSneaker = getCategoryFallbackImage('SHOES');
    let closetChanged = false;
    if (Array.isArray(AppState.myCloset)) {
        AppState.myCloset.forEach(item => {
            if (!item.image || item.image.includes('pants_black.jpg') || item.image.includes('tapered_black.jpg')) {
                item.image = 'assets/images/men/ストレートレープセミフレアスラックス.png';
                closetChanged = true;
            } else if (item.image.includes('shoes_white.jpg')) {
                item.image = defaultSneaker;
                closetChanged = true;
            } else if (item.image.includes('sweat_grey.jpg') || item.image.includes('sweat_white.jpg')) {
                item.image = 'assets/images/men/アーバングレイジップフーディ.png';
                closetChanged = true;
            } else if (item.image.includes('tshirt_white.jpg') || item.image.includes('tshirt_black.jpg')) {
                item.image = 'assets/images/men/スカイオックスフォードシャツ.png';
                closetChanged = true;
            }
        });
    }
    if (Array.isArray(AppState.myCloset) && !AppState.myCloset.some(item => item && (item.category === 'HAT' || item.category === 'CAP'))) {
        AppState.myCloset.push({
            id: 'c5',
            name: 'クラシック コットンキャップ',
            category: 'HAT',
            color: 'BLACK',
            season: '通年',
            image: "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E",
            isOwned: true
        });
        AppState.myCloset.push({
            id: 'c6',
            name: 'ウォッシュド バケットハット',
            category: 'HAT',
            color: 'CHARCOAL',
            season: '通年',
            image: "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20140%22%3E%3Cpath%20d%3D%22M20%20110%20C20%20110%2040%2095%2060%2090%20C75%2086%20125%2086%20140%2090%20C160%2095%20180%20110%20180%20110%20C150%20125%2050%20125%2020%20110%20Z%22%20fill%3D%22%23262626%22%2F%3E%3Cpath%20d%3D%22M58%2090%20C58%2060%2065%2035%20100%2035%20C135%2035%20142%2060%20142%2090%20Z%22%20fill%3D%22%231a1a1a%22%2F%3E%3Cpath%20d%3D%22M58%2090%20C75%2096%20125%2096%20142%2090%22%20stroke%3D%22%23333333%22%20stroke-width%3D%222%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E",
            isOwned: true
        });
        closetChanged = true;
    }
    if (closetChanged) {
        localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));
    }

    let outfitChanged = false;
    if (AppState.currentOutfit) {
        for (const slotKey in AppState.currentOutfit) {
            if (slotKey.startsWith("data:image")) {
                delete AppState.currentOutfit[slotKey];
                outfitChanged = true;
            }
        }
        for (const slot in AppState.currentOutfit) {
            const item = AppState.currentOutfit[slot];
            if (item && item.image) {
                if (item.image.includes('pants_black.jpg') || item.image.includes('tapered_black.jpg')) {
                    item.image = 'assets/images/men/ストレートレープセミフレアスラックス.png';
                    outfitChanged = true;
                } else if (item.image.includes('shoes_white.jpg')) {
                    item.image = defaultSneaker;
                    outfitChanged = true;
                } else if (item.image.includes('sweat_grey.jpg') || item.image.includes('sweat_white.jpg')) {
                    item.image = 'assets/images/men/アーバングレイジップフーディ.png';
                    outfitChanged = true;
                } else if (item.image.includes('tshirt_white.jpg') || item.image.includes('tshirt_black.jpg')) {
                    item.image = 'assets/images/men/スカイオックスフォードシャツ.png';
                    outfitChanged = true;
                }
            }
        }
    }
    if (outfitChanged) {
        localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));
    }
}

/**
 * マネキンステージの描画更新（ゴーストマネキン試着機能）
 */
function renderMannequinStage() {
    const outfit = AppState.currentOutfit || {};
    const slots = ['shoes', 'bottoms', 'tops', 'outer', 'hat'];

    slots.forEach(slot => {
        const slotElem = document.getElementById(`layer-${slot}`);
        const layerContent = document.getElementById(`layer-content-${slot}`);
        const item = outfit[slot];

        if (slotElem) {
            slotElem.classList.toggle('has-item', !!(item && item.image));
        }

        if (layerContent) {
            if (item && item.image) {
                const fallback = getCategoryFallbackImage(item.category);
                layerContent.innerHTML = `<img src="${item.image}" alt="${item.name}" class="layer-img" onerror="this.onerror=null;this.src='${fallback}';">`;
            } else {
                layerContent.innerHTML = '';
            }
        }
    });

    // 着用中チップバーの更新
    const slotsBar = document.getElementById('wearing-slots-bar');
    if (slotsBar) {
        const chipsHtml = [];
        for (const slotKey of slots) {
            const item = outfit[slotKey];
            if (item) {
                const badgeLabel = item.isOwned ? '手持ち' : 'ブランド';
                const isFreeSlot = (slotKey === 'shoes' || slotKey === 'hat');
                const sizeBadge = (!item.isOwned && item.size && !isFreeSlot) ? ` [${item.size}]` : '';
                chipsHtml.push(`
                    <span class="wearing-chip">
                        <span>${getCategoryNameJP(item.category)}: ${item.name}${sizeBadge} (${badgeLabel})</span>
                        <button class="wearing-chip-del" onclick="unwearSlot('${slotKey}')" title="脱がせる">×</button>
                    </span>
                `);
            }
        }
        slotsBar.innerHTML = chipsHtml.join('');
    }

    // ブランド商品サマリー計算
    let brandCount = 0;
    let brandPrice = 0;
    for (const slotKey of slots) {
        const item = outfit[slotKey];
        if (item && !item.isOwned) {
            brandCount++;
            brandPrice += (item.price || 0);
        }
    }

    const countElem = document.getElementById('brand-sum-count');
    if (countElem) countElem.textContent = `${brandCount}点`;

    const priceElem = document.getElementById('brand-sum-price');
    if (priceElem) priceElem.textContent = `¥${brandPrice.toLocaleString()}`;

    const cartBtn = document.getElementById('btn-add-brand-to-cart');
    if (cartBtn) {
        cartBtn.disabled = (brandCount === 0);
    }

    // 服の位置・サイズ微調整オフセットを適用
    applyFittingOffsets();

    // 微調整パネルが開いていればUIを再同期
    const adjustPanel = document.getElementById('fitting-adjust-panel');
    if (adjustPanel && adjustPanel.style.display !== 'none') {
        syncAdjustPanelUI();
    }
}

function handleStageSlotClick(slotKey) {
    const outfit = AppState.currentOutfit || {};
    const item = outfit[slotKey];

    if (item) {
        // 着用中の場合：脱がす
        unwearSlot(slotKey);
    } else {
        // 未着用の場合：クイック選択ポップオーバーを開く
        openStageQuickPicker(slotKey);
    }
}

/**
 * ステージ内クイック選択ポップオーバーを開く
 */
function openStageQuickPicker(slotKey) {
    const picker = document.getElementById('stage-quick-picker');
    const title = document.getElementById('quick-picker-title');
    const body = document.getElementById('quick-picker-body');
    if (!picker || !body) return;

    const catNameMap = {
        outer: { name: 'アウター', cat: 'OUTER' },
        tops: { name: 'トップス', cat: 'TOPS' },
        bottoms: { name: 'ボトムス', cat: 'BOTTOMS' },
        shoes: { name: '靴', cat: 'SHOES' },
        hat: { name: '帽子', cat: 'HAT' }
    };
    const catInfo = catNameMap[slotKey] || { name: 'アイテム', cat: 'ALL' };
    if (title) title.textContent = `${catInfo.name} を選択して試着`;

    // 候補アイテムを抽出（手持ち服 ＋ ブランド商品）
    const myItems = AppState.myCloset.filter(c => c.category === catInfo.cat);
    const brandItems = SAMPLE_PRODUCTS.filter(p => p.category === catInfo.cat && (!p.gender || p.gender === AppState.studioGender));

    let html = '';
    if (myItems.length === 0 && brandItems.length === 0) {
        html = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; font-size: 0.75rem; padding: 12px;">選択できるアイテムがありません</p>';
    } else {
        myItems.forEach(item => {
            const fb = getCategoryFallbackImage(item.category);
            html += `
            <div class="quick-picker-card" onclick="toggleWearItem('${item.id}', true); closeStageQuickPicker();" title="${item.name}" >
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${fb}';">
                    <div class="quick-picker-card-name">${item.name}</div>
                    <span style="font-size: 0.6rem; color: #0284c7; font-weight: 600;">[手持ち]</span>
                </div>
        `;
        });
        brandItems.forEach(p => {
            const fb = getCategoryFallbackImage(p.category);
            html += `
            <div class="quick-picker-card" onclick="toggleWearItem(${p.id}, false); closeStageQuickPicker();" title="${p.name}" >
                <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='${fb}';">
                    <div class="quick-picker-card-name">${p.name}</div>
                    <span style="font-size: 0.6rem; color: #e11d48; font-weight: 600;">¥${p.price.toLocaleString()}</span>
                </div>
        `;
        });
    }

    body.innerHTML = html;
    picker.style.display = 'block';

    // 左・右カラムのフィルターも連動してそのカテゴリに切り替え
    handleStudioClosetFilter(catInfo.cat);
    handleStudioBrandFilter(catInfo.cat);
}

function closeStageQuickPicker() {
    const picker = document.getElementById('stage-quick-picker');
    if (picker) picker.style.display = 'none';
}

// ドラッグ＆ドロップ試着機能
function handleCardDragStart(event, itemId, isOwned) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ itemId, isOwned }));
    event.dataTransfer.effectAllowed = 'copy';
}

function handleStageDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    const box = document.getElementById('mannequin-stage-box');
    if (box) box.classList.add('is-dragover');
}

function handleStageDragLeave(event) {
    const box = document.getElementById('mannequin-stage-box');
    if (box) box.classList.remove('is-dragover');
}

function handleStageDrop(event) {
    event.preventDefault();
    const box = document.getElementById('mannequin-stage-box');
    if (box) box.classList.remove('is-dragover');

    try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (data && data.itemId !== undefined) {
            toggleWearItem(data.itemId, !!data.isOwned);
        }
    } catch (e) {
        console.error('Drop error:', e);
    }
}

/**
 * 服の位置・サイズ微調整オフセットを各レイヤーに適用
 * 販売商品はXS〜XLの5段階サイズに応じたスケールを適用し、手持ち服は自由なカスタム倍率を適用
 */
function applyFittingOffsets() {
    const offsets = AppState.fittingOffsets || {};
    const slots = ['outer', 'tops', 'bottoms', 'shoes', 'hat'];
    const outfit = AppState.currentOutfit || {};

    slots.forEach(slot => {
        const layerElem = document.getElementById(`layer-${slot}`);
        if (!layerElem) return;
        const off = offsets[slot] || { x: 0, y: 0, scale: 100, brandSize: 'M' };
        const item = outfit[slot];

        let effectiveScale = 100;
        const isFreeScaleSlot = (slot === 'shoes' || slot === 'hat');
        if (!isFreeScaleSlot && item && !item.isOwned) {
            // 販売されている服（アウター・トップス・ボトムス）: XS〜XLの5段階サイズ
            const bSize = off.brandSize || item.size || 'M';
            effectiveScale = BRAND_SIZE_SCALES[bSize] || 100;
        } else if (item && (item.isOwned || isFreeScaleSlot)) {
            // 帽子・靴、および手持ちの服: スライダーによる自由な拡大縮小スケール (70%〜140%)
            effectiveScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        } else {
            effectiveScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        }

        layerElem.style.setProperty('--offset-x', `${off.x || 0}px`);
        layerElem.style.setProperty('--offset-y', `${off.y || 0}px`);
        layerElem.style.setProperty('--scale', effectiveScale / 100);
    });
}

/**
 * 位置微調整パネルの開閉トグル
 */
function toggleFittingAdjustPanel() {
    const panel = document.getElementById('fitting-adjust-panel');
    const btn = document.getElementById('btn-toggle-adjust-mode');
    if (!panel) return;

    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    panel.style.display = isHidden ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', isHidden);

    if (isHidden) {
        syncAdjustPanelUI();
    }
}

/**
 * 微調整対象スロットタブ切り替え
 */
function switchAdjustSlot(slotKey) {
    AppState.activeAdjustSlot = slotKey;
    document.querySelectorAll('#adjust-slot-tabs .adjust-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-adjust-slot') === slotKey);
    });
    syncAdjustPanelUI();
}

/**
 * スライダーUIの値を現在の服種別（販売商品 vs 手持ち服）およびオフセットに同期
 */
function syncAdjustPanelUI() {
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // 微調整タブボタンのアクティブ表示を同期
    document.querySelectorAll('#adjust-slot-tabs .adjust-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-adjust-slot') === slotKey);
    });
    const offsets = AppState.fittingOffsets || {};
    const off = offsets[slotKey] || { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    const outfit = AppState.currentOutfit || {};
    const item = outfit[slotKey];
    const isFreeScaleSlot = (slotKey === 'shoes' || slotKey === 'hat');

    // UI要素の取得
    const sliderY = document.getElementById('slider-adjust-y');
    const sliderX = document.getElementById('slider-adjust-x');
    const valY = document.getElementById('val-adjust-y');
    const valX = document.getElementById('val-adjust-x');

    const badgeElem = document.getElementById('adjust-item-badge');
    const nameElem = document.getElementById('adjust-item-name');
    const descElem = document.getElementById('adjust-item-type-desc');
    const rowBrand = document.getElementById('adjust-row-scale-brand');
    const rowFree = document.getElementById('adjust-row-scale-free');
    const hintElem = document.querySelector('.adjust-hint') || document.getElementById('adjust-hint-text');

    const sliderBrandSize = document.getElementById('slider-adjust-brand-size');
    const valBrandSize = document.getElementById('val-adjust-brand-size');
    const btnBrandMinus = document.getElementById('btn-brand-size-minus');
    const btnBrandPlus = document.getElementById('btn-brand-size-plus');

    const sliderScale = document.getElementById('slider-adjust-scale');
    const valScale = document.getElementById('val-adjust-scale');

    // 共通: 上下・左右位置の反映
    if (sliderY) sliderY.value = off.y || 0;
    if (sliderX) sliderX.value = off.x || 0;
    if (valY) valY.textContent = `${off.y > 0 ? '+' : ''}${off.y || 0}px`;
    if (valX) valX.textContent = `${off.x > 0 ? '+' : ''}${off.x || 0}px`;

    // 1. 未着用状態
    if (!item) {
        if (badgeElem) {
            badgeElem.className = 'adjust-item-tag empty';
            badgeElem.textContent = '未着用';
        }
        if (nameElem) nameElem.textContent = `${getCategoryNameJP(slotKey.toUpperCase())}（未着用）`;
        if (descElem) descElem.textContent = isFreeScaleSlot ? '自由サイズ調整（70%〜140%）' : '試着すると調整可能';

        if (sliderY) sliderY.disabled = true;
        if (sliderX) sliderX.disabled = true;

        if (isFreeScaleSlot) {
            // 帽子・靴は未着用でも自由サイズUIを表示（XS〜XLの服規格ではなく自由拡縮）
            if (rowBrand) rowBrand.style.display = 'none';
            if (rowFree) rowFree.style.display = 'flex';
            if (sliderScale) {
                sliderScale.disabled = true;
                sliderScale.value = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
            }
            if (valScale) valScale.textContent = `${(off.customScale !== undefined) ? off.customScale : (off.scale || 100)}%`;
            if (hintElem) hintElem.textContent = `💡 ${slotKey === 'hat' ? '帽子' : '靴'}をクローゼットから着用すると、マネキンに合わせてサイズ（70%〜140%）や位置を自由に微調整できます`;
        } else {
            // 服（アウター・トップス・ボトムス）は規格サイズUIを表示（非活性）
            if (rowBrand) rowBrand.style.display = 'flex';
            if (rowFree) rowFree.style.display = 'none';
            if (sliderBrandSize) sliderBrandSize.disabled = true;
            if (btnBrandMinus) btnBrandMinus.disabled = true;
            if (btnBrandPlus) btnBrandPlus.disabled = true;
            if (hintElem) hintElem.textContent = '💡 クローゼットまたは商品一覧から服を選んでマネキンに試着してください';
        }
        return;
    }

    // 2. 着用中：操作可能に戻す
    if (sliderY) sliderY.disabled = false;
    if (sliderX) sliderX.disabled = false;
    if (sliderBrandSize) sliderBrandSize.disabled = false;
    if (sliderScale) sliderScale.disabled = false;

    if (isFreeScaleSlot) {
        // =====================================================================
        // 【帽子・靴: 常に自由サイズ調整（70%〜140%）】
        // 帽子と靴は衣類のXS〜XL規格ではなく、頭の形や足元に合わせて自由にサイズ・位置を微調整できる
        // =====================================================================
        if (badgeElem) {
            badgeElem.className = 'adjust-item-tag closet';
            badgeElem.textContent = slotKey === 'hat' ? '🧢 帽子' : '👟 靴';
        }
        if (nameElem) nameElem.textContent = item.name;
        if (descElem) descElem.textContent = '自由サイズ調整（70%〜140%）';

        if (rowBrand) rowBrand.style.display = 'none';
        if (rowFree) rowFree.style.display = 'flex';

        const currentScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        if (sliderScale) sliderScale.value = currentScale;
        if (valScale) valScale.textContent = `${currentScale}%`;

        if (hintElem) hintElem.textContent = `💡 ${slotKey === 'hat' ? '帽子' : '靴'}はスライダーで大きさを70%〜140%まで自由に拡大・縮小できます（自動保存）`;

    } else if (!item.isOwned) {
        // =====================================================================
        // 【販売されている服（アウター・トップス・ボトムス）: XS〜XLの5段階サイズ】
        // =====================================================================
        if (badgeElem) {
            badgeElem.className = 'adjust-item-tag brand';
            badgeElem.textContent = '🏷️ 販売商品';
        }
        if (nameElem) nameElem.textContent = item.name;
        if (descElem) descElem.textContent = '規格サイズ（XS〜XL）';

        if (rowBrand) rowBrand.style.display = 'flex';
        if (rowFree) rowFree.style.display = 'none';

        const currentSize = off.brandSize || item.size || 'M';
        const sizeIdx = BRAND_SIZE_LIST.indexOf(currentSize);
        const validIdx = (sizeIdx >= 0) ? sizeIdx : 2;

        if (sliderBrandSize) sliderBrandSize.value = validIdx;
        if (valBrandSize) valBrandSize.textContent = BRAND_SIZE_LIST[validIdx];

        // 目盛りのアクティブ表示更新
        document.querySelectorAll('#brand-size-ticks .brand-size-tick').forEach(tick => {
            const tIdx = parseInt(tick.getAttribute('data-size-idx'), 10);
            tick.classList.toggle('active', tIdx === validIdx);
        });

        if (btnBrandMinus) btnBrandMinus.disabled = (validIdx <= 0);
        if (btnBrandPlus) btnBrandPlus.disabled = (validIdx >= BRAND_SIZE_LIST.length - 1);

        if (hintElem) hintElem.textContent = '💡 販売商品はXS〜XLのサイズ規格でマネキン上の表示サイズが変わります（自動保存）';

    } else {
        // =====================================================================
        // 【手持ちの服（アウター・トップス・ボトムス）: 自由サイズ調整】
        // =====================================================================
        if (badgeElem) {
            badgeElem.className = 'adjust-item-tag closet';
            badgeElem.textContent = '👕 マイクローゼット';
        }
        if (nameElem) nameElem.textContent = item.name;
        if (descElem) descElem.textContent = '自由サイズ調整（見た目補正）';

        if (rowBrand) rowBrand.style.display = 'none';
        if (rowFree) rowFree.style.display = 'flex';

        const currentScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        if (sliderScale) sliderScale.value = currentScale;
        if (valScale) valScale.textContent = `${currentScale}%`;

        if (hintElem) hintElem.textContent = '💡 手持ちの服はブランドによって実寸が異なるため、見た目の大きさを自由に調整できます（自動保存）';
    }
}

/**
 * 販売商品用: 5段階サイズ選択（XS・S・M・L・XL）変更処理
 */
function handleBrandSizeInput(val) {
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // 帽子と靴はXS〜XL規格サイズではなく自由拡大縮小のためガード
    if (slotKey === 'shoes' || slotKey === 'hat') return;

    if (!AppState.fittingOffsets[slotKey]) {
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    const idx = parseInt(val, 10);
    const clampedIdx = Math.max(0, Math.min(BRAND_SIZE_LIST.length - 1, idx));
    const sizeName = BRAND_SIZE_LIST[clampedIdx];
    const targetScale = BRAND_SIZE_SCALES[sizeName] || 100;

    // オフセット状態に記録
    AppState.fittingOffsets[slotKey].brandSize = sizeName;
    AppState.fittingOffsets[slotKey].scale = targetScale;

    // 着用中アイテムのサイズ情報も同期
    if (AppState.currentOutfit && AppState.currentOutfit[slotKey]) {
        AppState.currentOutfit[slotKey].size = sizeName;
        localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));
    }

    // UI表示更新
    const slider = document.getElementById('slider-adjust-brand-size');
    if (slider) slider.value = clampedIdx;

    const valElem = document.getElementById('val-adjust-brand-size');
    if (valElem) valElem.textContent = sizeName;

    document.querySelectorAll('#brand-size-ticks .brand-size-tick').forEach(tick => {
        const tIdx = parseInt(tick.getAttribute('data-size-idx'), 10);
        tick.classList.toggle('active', tIdx === clampedIdx);
    });

    const btnMinus = document.getElementById('btn-brand-size-minus');
    const btnPlus = document.getElementById('btn-brand-size-plus');
    if (btnMinus) btnMinus.disabled = (clampedIdx <= 0);
    if (btnPlus) btnPlus.disabled = (clampedIdx >= BRAND_SIZE_LIST.length - 1);

    // マネキン上の服の表示サイズを即座に更新
    applyFittingOffsets();

    // ローカルストレージ保存
    localStorage.setItem('manekin_fitting_offsets', JSON.stringify(AppState.fittingOffsets));
}

/**
 * 販売商品用: 1段階サイズ増減ステップ（－ / ＋）
 */
function stepBrandSize(delta) {
    const slotKey = AppState.activeAdjustSlot || 'outer';
    if (slotKey === 'shoes' || slotKey === 'hat') return;

    const off = (AppState.fittingOffsets && AppState.fittingOffsets[slotKey]) || {};
    const outfit = AppState.currentOutfit || {};
    const item = outfit[slotKey];
    const currentSize = off.brandSize || (item && item.size) || 'M';
    const currentIdx = BRAND_SIZE_LIST.indexOf(currentSize);
    const baseIdx = (currentIdx >= 0) ? currentIdx : 2;
    handleBrandSizeInput(baseIdx + delta);
}

/**
 * 手持ち服および位置の微調整スライダー変更時処理
 */
function handleAdjustInput(prop, val) {
    const slotKey = AppState.activeAdjustSlot || 'outer';

    if (!AppState.fittingOffsets[slotKey]) {
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    const numVal = parseInt(val, 10);
    AppState.fittingOffsets[slotKey][prop] = numVal;
    if (prop === 'scale') {
        AppState.fittingOffsets[slotKey].customScale = numVal;
    }

    // UI表示更新
    if (prop === 'y') {
        const valElem = document.getElementById('val-adjust-y');
        if (valElem) valElem.textContent = `${numVal > 0 ? '+' : ''}${numVal}px`;
    } else if (prop === 'x') {
        const valElem = document.getElementById('val-adjust-x');
        if (valElem) valElem.textContent = `${numVal > 0 ? '+' : ''}${numVal}px`;
    } else if (prop === 'scale') {
        const valElem = document.getElementById('val-adjust-scale');
        if (valElem) valElem.textContent = `${numVal}%`;
    }

    // 画面のマネキン服へ即座に反映
    applyFittingOffsets();

    // ローカルストレージへ保存
    localStorage.setItem('manekin_fitting_offsets', JSON.stringify(AppState.fittingOffsets));
}

/**
 * 微調整ボタン（▲▼◀▶＋－）クリック時の増減
 */
function stepAdjust(prop, delta) {
    const slotKey = AppState.activeAdjustSlot || 'outer';

    if (!AppState.fittingOffsets[slotKey]) {
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    let current = AppState.fittingOffsets[slotKey][prop];
    if (current === undefined) {
        current = (prop === 'scale') ? 100 : 0;
    }
    const nextVal = current + delta;
    handleAdjustInput(prop, nextVal);

    const slider = document.getElementById(`slider-adjust-${prop}`);
    if (slider) slider.value = nextVal;
}

/**
 * オフセット初期化リセット
 */
function resetFittingOffsets() {
    const slotKey = AppState.activeAdjustSlot || 'outer';

    AppState.fittingOffsets[slotKey] = {
        x: 0,
        y: 0,
        scale: 100,
        brandSize: 'M',
        customScale: 100
    };

    if (AppState.currentOutfit && AppState.currentOutfit[slotKey] && !AppState.currentOutfit[slotKey].isOwned) {
        AppState.currentOutfit[slotKey].size = 'M';
        localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));
    }

    syncAdjustPanelUI();
    applyFittingOffsets();
    localStorage.setItem('manekin_fitting_offsets', JSON.stringify(AppState.fittingOffsets));
    showToastNotification(`「${getCategoryNameJP(slotKey.toUpperCase())}」の位置とサイズをリセットしました`);
}

/**
 * 性別切り替え
 */
function setMannequinGender(gender) {
    AppState.studioGender = gender;
    const btnMen = document.getElementById('btn-gender-men');
    const btnWomen = document.getElementById('btn-gender-women');
    if (btnMen) btnMen.classList.toggle('active', gender === 'MEN');
    if (btnWomen) btnWomen.classList.toggle('active', gender === 'WOMEN');

    // ブランド商品リストを性別に連動して再描画
    renderStudioBrandList();

    showToastNotification(`マネキンモデルを「${gender}」に切り替えました`);
}

/**
 * モバイルビューの切り替え
 */
function switchMobileStudioView(viewKey) {
    AppState.studioMobileView = viewKey;

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mobile-view') === viewKey);
    });

    const colCloset = document.getElementById('col-studio-closet');
    const colMannequin = document.getElementById('col-studio-mannequin');
    const colBrand = document.getElementById('col-studio-brand');

    if (colCloset) colCloset.classList.toggle('mobile-active', viewKey === 'closet');
    if (colMannequin) colMannequin.classList.toggle('mobile-active', viewKey === 'mannequin');
    if (colBrand) colBrand.classList.toggle('mobile-active', viewKey === 'brand');
}

// --------------------------------------------------------------------------
// 15.4 AIコメント生成エンジン & スタイリング診断
// --------------------------------------------------------------------------

/**
 * マネキンの現在着用状態からリアルタイムAIコメントを生成
 */
function updateAIStylingComment() {
    const outfit = AppState.currentOutfit || {};
    const commentElem = document.getElementById('ai-comment-text');
    const tagsElem = document.getElementById('ai-tags-wrap');
    const dotsElem = document.getElementById('palette-dots');
    const scoreValElem = document.getElementById('ai-score-val');
    const scoreStarsElem = document.getElementById('ai-score-stars');

    const wornItems = Object.values(outfit).filter(Boolean);

    if (wornItems.length === 0) {
        if (commentElem) {
            commentElem.textContent = '左側の「手持ちの服」または右側の「ブランド商品」をクリックすると、マネキンが試着しAIスタイリストがリアルタイムでコーディネート診断を行います。';
        }
        if (tagsElem) tagsElem.innerHTML = '<span class="ai-tag">#試着待ち</span>';
        if (dotsElem) dotsElem.innerHTML = '';
        if (scoreValElem) scoreValElem.textContent = '--点';
        if (scoreStarsElem) scoreStarsElem.textContent = '';
        return;
    }

    const hasBottoms = !!outfit.bottoms;
    const hasTops = !!outfit.tops;
    const hasOuter = !!outfit.outer;
    const hasShoes = !!outfit.shoes;
    const hasHat = !!outfit.hat;

    // カラーパレット抽出
    const colors = wornItems.map(item => item.color || 'BLACK');
    const uniqueColors = [...new Set(colors)];

    if (dotsElem) {
        dotsElem.innerHTML = uniqueColors.map(c => `
            <span class="palette-dot" style="background-color: ${getColorHex(c)};" title="${c}" ></span>
                `).join('');
    }

    // AI診断ロジックの構築
    let comment = '';
    let tags = [];
    let score = 95;

    // パターン1: 黒ボトムス + 白スニーカー + パーカー/トップス（要件例の完全再現）
    if (hasBottoms && hasShoes && outfit.bottoms.color === 'BLACK' && outfit.shoes.color === 'WHITE' && hasTops) {
        comment = `「${outfit.bottoms.name}」と「${outfit.tops.name}」の組み合わせは落ち着いた印象を与えます。足元の「${outfit.shoes.name}」がアクセントとなり、視線が自然に抜けるバランスの良いカジュアルコーデです。`;
        if (hasOuter) {
            comment += ` さらに「${outfit.outer.name}」を羽織ることで、程よい大人の上品さとこなれ感がプラスされます。`;
            tags = ['#大人の品格', '#モノトーン+1', '#Aラインシルエット'];
            score = 98;
        } else {
            tags = ['#キレイめカジュアル', '#通学デイリー', '#モノトーンアクセント'];
            score = 95;
        }
    }
    // パターン2: アウターがある全身コーデ
    else if (hasOuter && hasBottoms) {
        comment = `「${outfit.outer.name}」の優美なドレープ感が全体のシルエットを引き締めています。ボトムスに「${outfit.bottoms.name}」を合わせることで、現代的で清潔感のあるミニマルな装いに仕上がっています。`;
        tags = ['#スマートシルエット', '#都会派モード', '#大人の休日'];
        score = 96;
    }
    // パターン3: トップス + ボトムス
    else if (hasTops && hasBottoms) {
        comment = `「${outfit.tops.name}」と「${outfit.bottoms.name}」の明度バランスが非常に美しく調和しています。手持ち服の日常感にブランドの上質さが加わり、抜け感のある洗練されたスタイルです。`;
        tags = ['#黄金バランス', '#デイリーシック', '#着回し自在'];
        score = 94;
    }
    // パターン4: 単品試着
    else {
        const singleItem = wornItems[0];
        comment = `「${singleItem.name}」を着用中。美しいカッティングが際立っています。さらに相性の良い${hasTops ? 'ボトムスや靴' : 'トップスやアウター'} を組み合わせると、全体のトータルバランスを診断できます。`;
        tags = ['#シルエット重視', '#スタイリング途中'];
        score = 90;
    }

    // 帽子のアクセント診断
    if (hasHat && outfit.hat) {
        comment += ` 頭元の「${outfit.hat.name}」が全体のアイキャッチとなり、こなれたストリート感を演出しています。`;
        if (!tags.includes('#アクセント小物')) tags.push('#アクセント小物');
    }

    // DOMへ反映
    if (commentElem) commentElem.textContent = comment;
    if (tagsElem) {
        tagsElem.innerHTML = tags.map(t => `<span class="ai-tag" > ${t}</span> `).join('');
    }
    if (scoreValElem) scoreValElem.textContent = `${score}点`;
    if (scoreStarsElem) scoreStarsElem.textContent = '';
}

// --------------------------------------------------------------------------
// 15.5 コーデ保存機能 & ルックブック
// --------------------------------------------------------------------------

/**
 * プリセットコーデ名の適用
 */
function applyPresetName(name) {
    const input = document.getElementById('outfit-name-input');
    if (input) input.value = name;
}

/**
 * コーデの保存処理 (MySQL連携)
 */
function handleSaveOutfit(e) {
    if (e) e.preventDefault();

    const wornItems = Object.values(AppState.currentOutfit).filter(Boolean);
    if (wornItems.length === 0) {
        showToastNotification('マネキンに服を1着以上着せてから保存してください');
        return;
    }

    const input = document.getElementById('outfit-name-input');
    const title = (input && input.value.trim()) ? input.value.trim() : 'マイスタイリングコーデ';

    const commentElem = document.getElementById('ai-comment-text');
    const comment = commentElem ? commentElem.textContent : '';

    const newOutfit = {
        id: 'outfit-' + Date.now(),
        title: title,
        date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        comment: comment,
        items: JSON.parse(JSON.stringify(AppState.currentOutfit))
    };

    AppState.savedOutfits.unshift(newOutfit);
    localStorage.setItem('manekin_saved_outfits', JSON.stringify(AppState.savedOutfits));

    // MySQLに保存
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    fetch(`${apiBase}/api/outfits/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: AppState.currentUser ? AppState.currentUser.id : 1,
            id: newOutfit.id,
            title: newOutfit.title,
            date: newOutfit.date,
            comment: newOutfit.comment,
            items: newOutfit.items
        })
    }).catch(err => console.warn('MySQLコーデ保存オフライン:', err));

    showToastNotification(`「${title}」を保存しました！`);
    if (input) input.value = '';

    // バッジ等の更新
    renderManekinStudio(AppState.studioActiveTab);
}

/**
 * 保存したコーデ一覧（ルックブック）の描画
 */
function renderSavedOutfitsGrid() {
    const grid = document.getElementById('saved-outfits-grid');
    if (!grid) return;

    if (AppState.savedOutfits.length === 0) {
        grid.innerHTML = `
            <div class="closet-empty-card" >
                <div class="closet-empty-icon">📖</div>
                <h3 class="closet-empty-title">保存したコーディネートはありません</h3>
                <p class="closet-empty-desc">コーデ作成スタジオで組み合わせを作り、名前を付けて保存するとここにルックブックとしてストックされます。</p>
                <button class="btn btn-primary" onclick="switchStudioTab('create')">コーデを作成する</button>
            </div>
            `;
        return;
    }

    grid.innerHTML = AppState.savedOutfits.map(outfit => {
        const items = outfit.items || {};
        const itemList = Object.values(items).filter(Boolean);

        const stripsHtml = itemList.map(it => `
            <div class="saved-strip-item" title="${it.name}" >
                <img src="${it.image}" alt="${it.name}" class="saved-strip-img" onerror="this.src='assets/images/men/スカイオックスフォードシャツ.png'">
                    <span class="saved-strip-tag">${it.isOwned ? '手持ち' : 'ブランド'}</span>
                </div>
        `).join('');

        return `
            <div class="saved-outfit-card" >
                <div class="saved-outfit-header">
                    <div>
                        <h4 class="saved-outfit-title">${outfit.title}</h4>
                        <span class="saved-outfit-date">保存日: ${outfit.date}</span>
                    </div>
                    <button class="btn-closet-del" onclick="deleteSavedOutfit('${outfit.id}')" title="削除">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
                <div class="saved-items-preview-strip">
                    ${stripsHtml}
                </div>
                <div class="saved-comment-excerpt">
                    ${outfit.comment || 'AIスタイリング診断'}
                </div>
                <div class="saved-outfit-actions">
                    <button class="btn-restore-outfit" onclick="restoreOutfit('${outfit.id}')">
                        このコーデをマネキンに再現
                    </button>
                </div>
            </div>
            `;
    }).join('');
}

/**
 * 保存したコーデをマネキンに再現
 */
function restoreOutfit(outfitId) {
    const target = AppState.savedOutfits.find(o => o.id === outfitId);
    if (!target) return;

    AppState.currentOutfit = JSON.parse(JSON.stringify(target.items));
    localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));

    showToastNotification(`「${target.title}」をマネキンに復元しました`);
    switchStudioTab('create');
}

/**
 * 保存コーデの削除 (MySQL連携)
 */
function deleteSavedOutfit(outfitId) {
    if (confirm('この保存コーディネートを削除しますか？')) {
        AppState.savedOutfits = AppState.savedOutfits.filter(o => o.id !== outfitId);
        localStorage.setItem('manekin_saved_outfits', JSON.stringify(AppState.savedOutfits));

        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        fetch(`${apiBase}/api/outfits/delete/${outfitId}`, { method: 'DELETE' })
            .catch(err => console.warn('MySQLコーデ削除オフライン:', err));

        showToastNotification('コーディネートを削除しました');
        renderSavedOutfitsGrid();
        renderManekinStudio(AppState.studioActiveTab);
    }
}

/**
 * MySQLから保存済みコーデを同期取得
 */
async function syncOutfitsFromBackend() {
    try {
        const userId = AppState.currentUser ? AppState.currentUser.id : 1;
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        const res = await fetch(`${apiBase}/api/outfits/${userId}`);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.outfits) && data.outfits.length > 0) {
                const merged = [...data.outfits];
                AppState.savedOutfits.forEach(local => {
                    if (!merged.some(m => String(m.id) === String(local.id))) {
                        merged.push(local);
                    }
                });
                AppState.savedOutfits = merged;
                localStorage.setItem('manekin_saved_outfits', JSON.stringify(merged));
            }
        }
    } catch (e) {}
}

// --------------------------------------------------------------------------
// 15.6 EC連携（試着中ブランド商品の1クリックカート追加）
// --------------------------------------------------------------------------

/**
 * 着用中のブランド商品をショッピングカートへ一括追加
 */
function addCurrentBrandItemsToCart() {
    if (!AppState.cart || !Array.isArray(AppState.cart)) {
        AppState.cart = [];
    }
    const outfit = AppState.currentOutfit || {};
    const brandItems = Object.values(outfit).filter(it => it && !it.isOwned);

    if (brandItems.length === 0) {
        showToastNotification('現在マネキンが着用しているブランド商品はありません');
        return;
    }

    const offsets = AppState.fittingOffsets || {};
    brandItems.forEach(item => {
        if (!item) return;
        const slotKey = getSlotKeyByCategory(item.category) || 'tops';
        const off = offsets[slotKey] || {};
        const chosenSize = item.size || off.brandSize || 'M';

        const existing = AppState.cart.find(c => c && c.id === item.id && c.size === chosenSize);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            AppState.cart.push({
                id: item.id,
                name: item.name || '商品',
                color: item.color || 'BLACK',
                size: chosenSize,
                price: item.price || 0,
                quantity: 1,
                image: item.image || getCategoryFallbackImage(item.category)
            });
        }
    });

    localStorage.setItem('manekin_cart', JSON.stringify(AppState.cart));
    updateCartBadge();
    showToastNotification(`試着中のブランドアイテム（${brandItems.length}点）をカートに追加しました！`);
}

// --------------------------------------------------------------------------
// 15.7 手持ち服の登録モーダル処理
// --------------------------------------------------------------------------

function openAddClosetModal() {
    const modal = document.getElementById('modal-add-closet');
    if (modal) {
        modal.classList.add('open');
        modal.classList.add('active');
        // 背景クリックで閉じる処理
        modal.onclick = function (e) {
            if (e.target === modal) closeAddClosetModal();
        };
    }
}

function closeAddClosetModal() {
    const modal = document.getElementById('modal-add-closet');
    if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
    }
    currentClosetUploadDataUrl = '';
    originalClosetUploadDataUrl = '';
    isCurrentUploadTransparent = false;
    currentAiAnalysisResult = null;
    updateAiDiagnosisUI(null);

    const preview = document.getElementById('closet-img-preview');
    const placeholder = document.getElementById('closet-img-placeholder');
    const badgeTrans = document.getElementById('preview-badge-transparent');
    const actionBtns = document.getElementById('ai-action-btns');
    const overlay = document.getElementById('ai-processing-overlay');

    if (preview) {
        preview.style.display = 'none';
        preview.classList.remove('is-transparent');
    }
    if (badgeTrans) badgeTrans.style.display = 'none';
    if (actionBtns) actionBtns.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';

    const form = document.getElementById('form-add-closet');
    if (form) form.reset();
}

/**
 * 画像リサイズ前処理（AI処理の高速化・メモリ節約）
 */
function resizeImageForAi(imageSource, maxDim = 1024) {
    if (typeof Image === 'undefined') return Promise.resolve(imageSource);
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            if (width <= maxDim && height <= maxDim) {
                resolve(imageSource);
                return;
            }
            if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                resolve(blob || imageSource);
            }, 'image/png');
        };
        img.onerror = () => resolve(imageSource);

        if (typeof imageSource === 'string') {
            img.src = imageSource;
        } else if (imageSource instanceof Blob) {
            img.src = URL.createObjectURL(imageSource);
        } else {
            resolve(imageSource);
        }
    });
}

/**
 * ブラウザ完結型AI背景削除コア処理（@imgly/background-removal）
 */
async function runAiBackgroundRemoval(imageSource) {
    // グローバルまたは動的インポートでモジュール取得
    let removeBgFunc = window.imglyRemoveBackground;
    if (!removeBgFunc) {
        try {
            const mod = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal/+esm');
            removeBgFunc = mod.removeBackground;
            window.imglyRemoveBackground = removeBgFunc;
            window.imglyAiReady = true;
        } catch (e) {
            console.error('AIモジュール読み込みエラー:', e);
            throw new Error('AI背景削除モジュールをロードできませんでした。ネットワーク接続を確認してください。');
        }
    }

    const overlay = document.getElementById('ai-processing-overlay');
    const progressFill = document.getElementById('ai-progress-fill');
    const progressPct = document.getElementById('ai-progress-percent');
    const subtitle = document.getElementById('ai-status-subtitle');

    if (overlay) overlay.style.display = 'flex';
    if (progressFill) progressFill.style.width = '0%';
    if (progressPct) progressPct.textContent = '0%';
    if (subtitle) subtitle.textContent = 'AIモデルを初期化中...';

    // 高解像度画像の場合は1024pxにリサイズして高速化
    const resizedSource = await resizeImageForAi(imageSource, 1024);

    const config = {
        model: 'small', // small: 約40MBの軽量モデル。服の輪郭切り抜きに十分な精度で高速
        progress: (key, current, total) => {
            if (total > 0) {
                const pct = Math.min(100, Math.round((current / total) * 100));
                if (progressFill) progressFill.style.width = `${pct}%`;
                if (progressPct) progressPct.textContent = `${pct}%`;
                if (subtitle) {
                    if (key.includes('model') || key.includes('onnx')) {
                        subtitle.textContent = `AIモデル読込中... (${pct}%)`;
                    } else {
                        subtitle.textContent = `服の輪郭をAI解析・透過処理中... (${pct}%)`;
                    }
                }
            }
        }
    };

    try {
        const outputBlob = await removeBgFunc(resizedSource, config);
        if (overlay) overlay.style.display = 'none';
        return outputBlob;
    } catch (err) {
        if (overlay) overlay.style.display = 'none';
        throw err;
    }
}

/**
 * プレビュー表示の更新ヘルパー
 */
function updateClosetPreviewUI(imgUrl, isTransparent = false) {
    const preview = document.getElementById('closet-img-preview');
    const previewImg = document.getElementById('closet-preview-img');
    const placeholder = document.getElementById('closet-img-placeholder');
    const badgeTrans = document.getElementById('preview-badge-transparent');
    const actionBtns = document.getElementById('ai-action-btns');

    if (preview && previewImg && placeholder) {
        previewImg.src = imgUrl;
        preview.style.display = 'flex';
        placeholder.style.display = 'none';

        if (isTransparent) {
            preview.classList.add('is-transparent');
            if (badgeTrans) badgeTrans.style.display = 'block';
        } else {
            preview.classList.remove('is-transparent');
            if (badgeTrans) badgeTrans.style.display = 'none';
        }

        if (actionBtns) {
            actionBtns.style.display = 'flex';
            const btnReRemove = document.getElementById('btn-re-remove-bg');
            const btnRestore = document.getElementById('btn-restore-original');
            if (btnReRemove) btnReRemove.style.display = isTransparent ? 'none' : 'inline-block';
            if (btnRestore) btnRestore.style.display = isTransparent ? 'inline-block' : 'none';
        }
    }
}

// AI形状・アイテム診断結果のステート
let currentAiAnalysisResult = null;
let _mobilenetModelPromise = null;

/**
 * MobileNet画像分類AIモデルの遅延ロード
 */
function getMobileNetModel() {
    if (!window.mobilenet) return Promise.resolve(null);
    if (!_mobilenetModelPromise) {
        _mobilenetModelPromise = window.mobilenet.load({ version: 2, alpha: 0.5 }).catch(err => {
            console.warn('MobileNetモデルのロードをスキップしました (形状幾何学解析でフォールバック動作):', err);
            return null;
        });
    }
    return _mobilenetModelPromise;
}

/**
 * AI形状診断結果カードのUI更新
 */
function updateAiDiagnosisUI(result, isAnalyzing = false) {
    const card = document.getElementById('ai-diagnosis-card');
    const badge = document.getElementById('ai-diag-badge');
    const badgeText = document.getElementById('ai-diag-badge-text');
    const spinner = document.getElementById('ai-diag-spinner');
    const confidence = document.getElementById('ai-diag-confidence');
    const title = document.getElementById('ai-diag-title');
    const desc = document.getElementById('ai-diag-desc');

    if (!card) return;

    if (isAnalyzing) {
        card.style.display = 'block';
        card.className = 'ai-diagnosis-card is-analyzing';
        if (badgeText) badgeText.textContent = 'AI形状・アイテム診断中...';
        if (spinner) spinner.style.display = 'inline-block';
        if (confidence) confidence.textContent = '';
        if (title) title.textContent = '被写体の形状を解析中';
        if (desc) desc.textContent = 'アウター、ボトムス、トップス、靴、帽子のいずれかかAIが判定しています...';
        return;
    }

    if (!result) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';
    if (spinner) spinner.style.display = 'none';

    if (result.isValid) {
        card.className = 'ai-diagnosis-card is-valid';
        if (badgeText) badgeText.textContent = 'AI形状判定: OK';
        if (confidence) confidence.textContent = `${result.confidence}% 適合`;
        if (title) title.textContent = result.title;
        if (desc) desc.textContent = result.desc;

        // カテゴリラジオボタンを自動選択
        if (result.category) {
            const radio = document.querySelector(`input[name="closet_category"][value="${result.category}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    } else {
        card.className = 'ai-diagnosis-card is-invalid';
        if (badgeText) badgeText.textContent = '⚠️ 登録不可（非対象）';
        if (confidence) confidence.textContent = '判定不可';
        if (title) title.textContent = result.title;
        if (desc) desc.textContent = result.desc;
    }
}

/**
 * 服・アイテムの画像形状およびAIモデルによる診断を行う
 * アウター(OUTER)、ボトムス(BOTTOMS)、トップス(TOPS)、靴(SHOES)、帽子(HAT)のみ判定・登録可能
 */
async function analyzeClothingItemShape(source) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
            try {
                // 1. オフスクリーンCanvasで180x180にリサイズ描画してピクセル解析
                const canvas = document.createElement('canvas');
                const cw = 180;
                const ch = 180;
                canvas.width = cw;
                canvas.height = ch;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, cw, ch);

                const imgData = ctx.getImageData(0, 0, cw, ch);
                const data = imgData.data;

                // 2. 背景透過度および色差による被写体マスク作成
                let totalAlpha = 0;
                for (let i = 3; i < data.length; i += 4) {
                    totalAlpha += data[i];
                }
                const isAlreadyTransparent = (totalAlpha / (cw * ch)) < 240;

                // 四隅の平均背景色（非透過画像用）
                let bgR = 0, bgG = 0, bgB = 0, bgSamples = 0;
                const cornerCoords = [
                    [5, 5], [cw - 5, 5], [5, ch - 5], [cw - 5, ch - 5],
                    [10, 10], [cw - 10, 10], [10, ch - 10], [cw - 10, ch - 10]
                ];
                for (const [cx, cy] of cornerCoords) {
                    const idx = (cy * cw + cx) * 4;
                    bgR += data[idx];
                    bgG += data[idx + 1];
                    bgB += data[idx + 2];
                    bgSamples++;
                }
                bgR /= bgSamples;
                bgG /= bgSamples;
                bgB /= bgSamples;

                const mask = new Uint8Array(cw * ch);
                let fgCount = 0;
                let minX = cw, maxX = 0, minY = ch, maxY = 0;

                for (let y = 0; y < ch; y++) {
                    for (let x = 0; x < cw; x++) {
                        const idx = (y * cw + x) * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        const a = data[idx + 3];

                        let isFg = false;
                        if (isAlreadyTransparent) {
                            isFg = a > 35;
                        } else {
                            const diff = Math.hypot(r - bgR, g - bgG, b - bgB);
                            isFg = (diff > 25) || (a < 220);
                        }

                        if (isFg) {
                            mask[y * cw + x] = 1;
                            fgCount++;
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                const coverage = fgCount / (cw * ch);

                // 被写体が小さすぎる・あるいは画像全体がベタ塗り/無背景
                if (coverage < 0.035 || fgCount < 200) {
                    return resolve({
                        isValid: false,
                        category: null,
                        confidence: 0,
                        title: 'アイテムが検出できません',
                        desc: '服や靴、帽子がはっきりと写った写真を選択してください。'
                    });
                }

                const boxW = Math.max(1, maxX - minX + 1);
                const boxH = Math.max(1, maxY - minY + 1);
                const aspectRatio = boxH / boxW; // 縦横比
                const boxFillRatio = fgCount / (boxW * boxH); // 充填率

                // 四角い写真（書類や壁、風景写真、スクショなど）は充填率が95%超で服の輪郭がない
                if (boxFillRatio > 0.94 && coverage > 0.85) {
                    return resolve({
                        isValid: false,
                        category: null,
                        confidence: 0,
                        title: '服の形状が認識できません',
                        desc: '四角い写真や背景が検出されました。アウター・トップス・ボトムス・靴・帽子の写真を選択してください。'
                    });
                }

                // 3. 10スライス幾何学的プロファイル解析
                const sliceH = boxH / 10.0;
                const sliceWidths = [];
                let crotchSlices = 0; // 二股（股下）スライス数
                let maxSliceIdx = 0;
                let maxSliceWidth = 0;

                for (let s = 0; s < 10; s++) {
                    const sy1 = Math.floor(minY + s * sliceH);
                    const sy2 = Math.min(ch, Math.floor(minY + (s + 1) * sliceH));
                    let rowCount = 0;
                    let prevWasFg = false;
                    let transitions = 0;

                    for (let x = minX; x <= maxX; x++) {
                        let colHasFg = false;
                        for (let y = sy1; y < sy2; y++) {
                            if (mask[y * cw + x]) {
                                colHasFg = true;
                                break;
                            }
                        }
                        if (colHasFg) {
                            rowCount++;
                            if (!prevWasFg) transitions++;
                            prevWasFg = true;
                        } else {
                            prevWasFg = false;
                        }
                    }

                    sliceWidths.push(rowCount / boxW);
                    if (rowCount / boxW > maxSliceWidth) {
                        maxSliceWidth = rowCount / boxW;
                        maxSliceIdx = s;
                    }

                    // 二股判定: スライス4以降（下半分）で2回以上のブロック開始があれば二股
                    if (transitions >= 2 && s >= 4) {
                        crotchSlices++;
                    }
                }

                const topW = (sliceWidths[0] + sliceWidths[1]) / 2;
                const midW = (sliceWidths[4] + sliceWidths[5]) / 2;
                const bottomW = (sliceWidths[8] + sliceWidths[9]) / 2;

                // 4. カテゴリスコアリング
                const scores = {
                    BOTTOMS: 10,
                    SHOES: 10,
                    HAT: 10,
                    TOPS: 10,
                    OUTER: 10
                };

                // BOTTOMS 特徴: 縦長 (AR >= 1.25) かつ下半分が二股、または台形Aライン
                if (aspectRatio >= 1.25) scores.BOTTOMS += 35;
                if (aspectRatio >= 1.5) scores.BOTTOMS += 20;
                if (crotchSlices >= 2) scores.BOTTOMS += 45;
                if (topW < 0.8 && bottomW > 0.4 && crotchSlices >= 1) scores.BOTTOMS += 20;

                // SHOES 特徴: 横長〜スクエア (AR <= 1.15)、底面がフラットで広い、履き口
                if (aspectRatio <= 1.1) scores.SHOES += 35;
                if (aspectRatio <= 0.85) scores.SHOES += 25;
                if (bottomW >= 0.65) scores.SHOES += 25;
                if (crotchSlices === 0) scores.SHOES += 10;

                // HAT 特徴: スクエア〜やや横長 (0.55 <= AR <= 1.25)、上部が丸いドーム、ツバ
                if (aspectRatio >= 0.55 && aspectRatio <= 1.25) scores.HAT += 30;
                if (sliceWidths[0] < 0.4 && sliceWidths[2] > 0.6) scores.HAT += 35; // ドーム形状
                if (crotchSlices === 0) scores.HAT += 15;

                // TOPS 特徴: T字型（肩・袖の張り出し）、0.75 <= AR <= 1.45、裾が二股でない
                if (aspectRatio >= 0.75 && aspectRatio <= 1.45) scores.TOPS += 25;
                if (maxSliceIdx >= 1 && maxSliceIdx <= 3) scores.TOPS += 35; // 上部袖の広がり
                if (crotchSlices <= 1) scores.TOPS += 20;

                // OUTER 特徴: コート・ジャケット（T字型で縦長 AR >= 1.15）
                if (aspectRatio >= 1.15 && aspectRatio <= 2.2) scores.OUTER += 30;
                if (maxSliceIdx >= 1 && maxSliceIdx <= 4) scores.OUTER += 25;
                if (crotchSlices <= 1) scores.OUTER += 15;

                // 5. MobileNet AI による分類アシスト（利用可能な場合）
                let isNonClothingAi = false;
                try {
                    const model = await getMobileNetModel();
                    if (model) {
                        const predictions = await model.classify(canvas);
                        if (predictions && predictions.length > 0) {
                            const top = predictions[0];
                            const label = (top.className || '').toLowerCase();

                            // 非衣類キーワードの検出
                            const nonClothingKeywords = [
                                'dog', 'cat', 'bird', 'animal', 'pizza', 'sandwich', 'burger', 'food',
                                'car', 'vehicle', 'truck', 'traffic', 'computer', 'laptop', 'cellular',
                                'phone', 'book', 'bottle', 'cup', 'mug', 'desk', 'chair', 'table'
                            ];
                            for (const kw of nonClothingKeywords) {
                                if (label.includes(kw) && top.probability > 0.25) {
                                    isNonClothingAi = true;
                                    break;
                                }
                            }

                            // ファッションキーワード照合
                            if (label.match(/shoe|sneaker|boot|loafer|sandal|clog/)) {
                                scores.SHOES += 60;
                            } else if (label.match(/hat|cap|bonnet|beret|helmet/)) {
                                scores.HAT += 60;
                            } else if (label.match(/jean|pant|trouser|skirt/)) {
                                scores.BOTTOMS += 60;
                            } else if (label.match(/coat|jacket|trench|overcoat/)) {
                                scores.OUTER += 60;
                            } else if (label.match(/jersey|shirt|t-shirt|sweater|sweatshirt|cardigan|vest|top/)) {
                                scores.TOPS += 60;
                            }
                        }
                    }
                } catch (e) {
                    console.warn('AIモデル判定スキップ:', e);
                }

                // AIが明らかな非衣類と判断した場合
                if (isNonClothingAi) {
                    return resolve({
                        isValid: false,
                        category: null,
                        confidence: 0,
                        title: 'ファッションアイテムではありません',
                        desc: '服や靴、帽子の写真ではありません。アウター、トップス、ボトムス、靴、帽子を撮影または選択してください。'
                    });
                }

                // 最高スコアのカテゴリを特定
                let bestCategory = 'TOPS';
                let highestScore = -1;
                for (const cat in scores) {
                    if (scores[cat] > highestScore) {
                        highestScore = scores[cat];
                        bestCategory = cat;
                    }
                }

                // 最低適合スコアの基準（服・靴・帽子としての十分な特徴があるか）
                if (highestScore < 45) {
                    return resolve({
                        isValid: false,
                        category: null,
                        confidence: 0,
                        title: '服の形状が特定できません',
                        desc: 'アウター、ボトムス、トップス、靴、帽子のいずれかの形状がはっきりわかる写真をご使用ください。'
                    });
                }

                const catNames = {
                    OUTER: 'アウター (コート/ジャケット形状)',
                    BOTTOMS: 'ボトムス (パンツ/スラックス形状)',
                    TOPS: 'トップス (Tシャツ/スウェット形状)',
                    SHOES: '靴 (スニーカー/シューズ形状)',
                    HAT: '帽子 (キャップ/ハット形状)'
                };

                const confidence = Math.min(99, Math.max(82, Math.round(highestScore * 0.95)));

                resolve({
                    isValid: true,
                    category: bestCategory,
                    confidence: confidence,
                    title: `✨ AI形状認識: ${catNames[bestCategory]}`,
                    desc: 'マイクローゼットに登録可能です。カテゴリを自動選択しました。'
                });

            } catch (err) {
                console.error('形状解析エラー:', err);
                resolve({
                    isValid: true, // フォールバック
                    category: 'TOPS',
                    confidence: 80,
                    title: '✨ 形状解析完了',
                    desc: 'マイクローゼットに登録可能です。'
                });
            }
        };

        img.onerror = () => {
            resolve({
                isValid: false,
                category: null,
                confidence: 0,
                title: '画像の読み込みに失敗しました',
                desc: '有効な画像ファイルを選択してください。'
            });
        };

        if (typeof source === 'string') {
            img.src = source;
        } else if (source instanceof Blob) {
            img.src = URL.createObjectURL(source);
        } else {
            resolve({
                isValid: false,
                category: null,
                confidence: 0,
                title: '無効な画像データです',
                desc: '画像を選択してください。'
            });
        }
    });
}

/**
 * AIによる背景削除の実行とプレビュー反映（完了後にAI形状診断も実行）
 */
async function processClosetImageWithAi(source) {
    try {
        const blob = await runAiBackgroundRemoval(source);
        const reader = new FileReader();
        reader.onload = async function (evt) {
            currentClosetUploadDataUrl = evt.target.result;
            isCurrentUploadTransparent = true;
            updateClosetPreviewUI(currentClosetUploadDataUrl, true);
            showToastNotification('✨ AIが服の背景を綺麗に切り抜きました！');

            // 背景透過後の画像でAI形状診断を実行
            updateAiDiagnosisUI(null, true);
            currentAiAnalysisResult = await analyzeClothingItemShape(currentClosetUploadDataUrl);
            updateAiDiagnosisUI(currentAiAnalysisResult, false);
        };
        reader.readAsDataURL(blob);
    } catch (err) {
        console.warn('AI背景削除に失敗、元画像を使用:', err);
        currentClosetUploadDataUrl = originalClosetUploadDataUrl;
        isCurrentUploadTransparent = false;
        updateClosetPreviewUI(currentClosetUploadDataUrl, false);
        showToastNotification('AI背景切り抜きをスキップし、元の写真を設定しました');

        // 元画像でAI形状診断を実行
        updateAiDiagnosisUI(null, true);
        currentAiAnalysisResult = await analyzeClothingItemShape(currentClosetUploadDataUrl);
        updateAiDiagnosisUI(currentAiAnalysisResult, false);
    }
}

/**
 * クイック写真の選択（公式プリセットは自動でAI診断適合済みに設定）
 */
function selectPresetImage(presetKey, presetName) {
    const preset = PRESET_CLOSET_PRESETS[presetKey];
    if (!preset) return;

    originalClosetUploadDataUrl = preset.image;
    currentClosetUploadDataUrl = preset.image;
    isCurrentUploadTransparent = false;

    updateClosetPreviewUI(preset.image, false);

    const nameInput = document.getElementById('closet-item-name');
    if (nameInput) nameInput.value = preset.name;

    const catRadio = document.querySelector(`input[name="closet_category"][value="${preset.category}"]`);
    if (catRadio) catRadio.checked = true;

    const colorSelect = document.getElementById('closet-item-color');
    if (colorSelect) colorSelect.value = preset.color;

    const seasonSelect = document.getElementById('closet-item-season');
    if (seasonSelect) seasonSelect.value = preset.season;

    // プリセット用AI診断結果を設定
    currentAiAnalysisResult = {
        isValid: true,
        category: preset.category,
        confidence: 100,
        title: `✨ クイック写真: ${preset.name}`,
        desc: '公式アイテムとしてマイクローゼットに登録可能です。'
    };
    updateAiDiagnosisUI(currentAiAnalysisResult, false);
}

/**
 * ファイル選択プレビュー（AI背景削除・AI形状診断連動）
 */
function handleClosetImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (evt) {
        originalClosetUploadDataUrl = evt.target.result;
        currentClosetUploadDataUrl = evt.target.result;
        isCurrentUploadTransparent = false;

        // 診断中ステータスを表示
        updateAiDiagnosisUI(null, true);

        const autoRemove = document.getElementById('check-auto-remove-bg')?.checked;

        if (autoRemove) {
            // 自動でAI背景削除を実行（完了ハンドラ内で形状診断が走ります）
            updateClosetPreviewUI(originalClosetUploadDataUrl, false);
            await processClosetImageWithAi(file);
        } else {
            // 通常の元写真表示で即時形状診断
            updateClosetPreviewUI(originalClosetUploadDataUrl, false);
            showToastNotification('服の写真を読み込みました');
            currentAiAnalysisResult = await analyzeClothingItemShape(originalClosetUploadDataUrl);
            updateAiDiagnosisUI(currentAiAnalysisResult, false);
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 手動で「🪄 背景を透過」ボタンをクリックした時
 */
async function triggerManualBgRemoval() {
    const target = originalClosetUploadDataUrl || currentClosetUploadDataUrl;
    if (!target) {
        showToastNotification('先に服の写真を選択してください');
        return;
    }
    await processClosetImageWithAi(target);
}

/**
 * 「↺ 元写真に戻す」ボタンをクリックした時
 */
async function restoreOriginalUploadImage() {
    if (!originalClosetUploadDataUrl) return;
    currentClosetUploadDataUrl = originalClosetUploadDataUrl;
    isCurrentUploadTransparent = false;
    updateClosetPreviewUI(originalClosetUploadDataUrl, false);
    showToastNotification('元の写真に戻しました');

    updateAiDiagnosisUI(null, true);
    currentAiAnalysisResult = await analyzeClothingItemShape(originalClosetUploadDataUrl);
    updateAiDiagnosisUI(currentAiAnalysisResult, false);
}

/**
 * 新規手持ち服の登録（AI形状チェック付き：アウター/ボトムス/トップス/靴/帽子のみ保存可能）
 */
function handleAddClosetItem(e) {
    if (e) e.preventDefault();

    // 1. 画像チェック
    if (!currentClosetUploadDataUrl) {
        showToastNotification('⚠️ 服の写真を選択または撮影してください');
        const uploadBox = document.getElementById('closet-upload-box');
        if (uploadBox) uploadBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // 2. AI形状・アイテム診断チェック（非衣類・不適合画像はブロック）
    if (currentAiAnalysisResult && !currentAiAnalysisResult.isValid) {
        showToastNotification(`⚠️ 登録できません: ${currentAiAnalysisResult.title}。アウター、ボトムス、トップス、靴、帽子の写真のみ登録可能です`);
        const diagCard = document.getElementById('ai-diagnosis-card');
        if (diagCard) diagCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const nameInput = document.getElementById('closet-item-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        showToastNotification('服の名前を入力してください');
        if (nameInput) nameInput.focus();
        return;
    }

    const catInput = document.querySelector('input[name="closet_category"]:checked');
    const category = catInput ? catInput.value : 'BOTTOMS';

    const colorSelect = document.getElementById('closet-item-color');
    const color = colorSelect ? colorSelect.value : 'BLACK';

    const seasonSelect = document.getElementById('closet-item-season');
    const season = seasonSelect ? seasonSelect.value : '通年';

    const newItem = {
        id: 'c-' + Date.now(),
        name: name,
        category: category,
        color: color,
        season: season,
        image: currentClosetUploadDataUrl,
        isOwned: true
    };

    AppState.myCloset.unshift(newItem);
    localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));

    // MySQL (closet_items テーブル) にも即座に保存
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    fetch(`${apiBase}/api/closet/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: AppState.currentUser ? AppState.currentUser.id : 1,
            id: newItem.id,
            name: newItem.name,
            category: newItem.category,
            color: newItem.color,
            season: newItem.season,
            image: newItem.image,
            isOwned: true,
            isPurchased: false
        })
    }).then(res => res.json()).then(data => {
        if (data.status === 'success') {
            console.log('✨ [MySQL] マイクローゼットにアイテムを保存しました:', data);
        }
    }).catch(err => {
        console.warn('MySQLクローゼット保存はオフライン（ローカルストレージに保存済み）:', err);
    });

    showToastNotification(`「${name}」をマイクローゼット(MySQL)に登録しました！`);
    closeAddClosetModal();

    // 画面再描画
    renderManekinStudio(AppState.studioActiveTab);
}

/**
 * 手持ち服の削除
 */
function deleteClosetItem(itemId) {
    if (confirm('この手持ちの服をクローゼットから削除しますか？')) {
        // もし現在着用中なら脱がす
        for (const slotKey in AppState.currentOutfit) {
            if (AppState.currentOutfit[slotKey] && String(AppState.currentOutfit[slotKey].id) === String(itemId)) {
                AppState.currentOutfit[slotKey] = null;
            }
        }
        localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));

        AppState.myCloset = AppState.myCloset.filter(c => String(c.id) !== String(itemId));
        localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));

        // MySQL からも削除
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        fetch(`${apiBase}/api/closet/delete/${itemId}`, { method: 'DELETE' })
            .catch(err => console.warn('MySQLクローゼット削除オフライン:', err));

        showToastNotification('手持ちの服を削除しました');
        renderManekinStudio(AppState.studioActiveTab);
    }
}

/**
 * MySQLからマイクローゼットのアイテムを同期取得
 */
async function syncClosetFromBackend() {
    try {
        const userId = AppState.currentUser ? AppState.currentUser.id : 1;
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        const res = await fetch(`${apiBase}/api/closet/${userId}`);
        if (res.ok) {
            const data = await res.json();
            if (data.closet_items && Array.isArray(data.closet_items) && data.closet_items.length > 0) {
                // MySQLから取得したアイテムをマージ
                const mysqlItems = data.closet_items.map(it => ({
                    id: it.item_uid || it.id,
                    productId: it.product_id,
                    name: it.name,
                    category: it.category,
                    color: it.color,
                    season: it.season || '通年',
                    image: it.image || it.image_url,
                    isOwned: Boolean(it.is_owned),
                    isPurchased: Boolean(it.is_purchased),
                    price: it.price || 0,
                    purchaseDate: it.purchase_date
                }));

                // 既存のローカルアイテムと重複なしでマージ
                const merged = [...mysqlItems];
                AppState.myCloset.forEach(localItem => {
                    const exists = merged.some(m => String(m.id) === String(localItem.id) || (m.name === localItem.name && m.color === localItem.color));
                    if (!exists) {
                        merged.push(localItem);
                    }
                });

                AppState.myCloset = merged;
                localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));
                console.log(`✨ [MySQL] マイクローゼット同期完了: ${merged.length} 点`);
            }
        }
    } catch (e) {
        console.log('MySQLクローゼット同期待機中 (ローカルストレージを使用)');
    }
}

/**
 * おすすめプリセットコーデの適用（ホームバナー用）
 */
function applyPresetLook(lookKey) {
    // 例: 手持ち黒ボトムス + 白スニーカー + トレンチコート
    const blackPants = AppState.myCloset.find(c => c.category === 'BOTTOMS') || {
        id: 'c1', name: '黒ワイドスラックス', category: 'BOTTOMS', color: 'BLACK', isOwned: true, image: 'assets/images/men/ストレートレープセミフレアスラックス.png'
    };
    const whiteSneakers = AppState.myCloset.find(c => c.category === 'SHOES') || {
        id: 'c2', name: 'クラシック 白レザースニーカー', category: 'SHOES', color: 'WHITE', isOwned: true, image: 'assets/images/shoes_white.jpg'
    };
    const trenchCoat = SAMPLE_PRODUCTS.find(p => p.id === 1) || SAMPLE_PRODUCTS[0];

    AppState.currentOutfit = {
        outer: { id: trenchCoat.id, name: trenchCoat.name, category: trenchCoat.category, color: 'CHARCOAL', price: trenchCoat.price, image: trenchCoat.image, isOwned: false },
        tops: { id: 6, name: 'ヘビーウェイト ボクシー スウェット', category: 'TOPS', color: 'OFF WHITE', price: 3490, image: 'assets/images/sweat_white.jpg', isOwned: false },
        bottoms: { id: blackPants.id, name: blackPants.name, category: blackPants.category, color: blackPants.color, isOwned: true, image: blackPants.image },
        shoes: { id: whiteSneakers.id, name: whiteSneakers.name, category: whiteSneakers.category, color: whiteSneakers.color, isOwned: true, image: whiteSneakers.image }
    };
    localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));

    showToastNotification('AIおすすめコーデをマネキンにセットしました');
    switchStudioTab('create');
}

/**
 * 体型プロフィールの保存（マネキンシミュレーション用ローカル設定）
 */
function handleSaveBodyProfile(e) {
    e.preventDefault();
    const height = document.getElementById('body-height')?.value || 172;
    const type = document.getElementById('body-type')?.value || 'REGULAR';
    const taste = document.getElementById('style-taste')?.value || 'MINIMAL';

    AppState.userBodyProfile = { height, bodyType: type, styleTaste: taste };
    localStorage.setItem('manekin_body_profile', JSON.stringify(AppState.userBodyProfile));

    showToastNotification('体型および好みの設定を保存しました');
}

// --------------------------------------------------------------------------
// 15.8 ユーティリティ
// --------------------------------------------------------------------------

function getCategoryNameJP(cat) {
    switch (cat) {
        case 'OUTER': return 'アウター';
        case 'TOPS': return 'トップス';
        case 'BOTTOMS': return 'ボトムス';
        case 'SHOES': return '靴';
        case 'HAT': case 'HATS': case 'CAP': return '帽子';
        default: return cat;
    }
}

function getColorHex(colorName) {
    switch (colorName) {
        case 'BLACK': return '#111111';
        case 'WHITE': return '#ffffff';
        case 'CHARCOAL': return '#333333';
        case 'GREY': case 'ASH GREY': case 'HEATHER GREY': return '#888888';
        case 'NAVY': return '#1a2a44';
        case 'BEIGE': case 'ECRU': return '#e8ddcb';
        case 'BROWN': case 'DARK BROWN': return '#593822';
        case 'BLUE': case 'VINTAGE BLUE': return '#2b5876';
        default: return '#666666';
    }
}

function showToastNotification(message) {
    if (typeof showToast === 'function') {
        showToast(message);
    }
}

window.syncClosetFromBackend = syncClosetFromBackend;
window.syncOutfitsFromBackend = syncOutfitsFromBackend;

