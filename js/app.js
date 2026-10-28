// ==========================================================================
// MANEKIN FASHION - フロントエンド JavaScript (app.js)
// UNIQLO/GU風の洗練されたECサイトロジック・ステート管理・画面遷移
// ==========================================================================

// --------------------------------------------------------------------------
// 1. サンプル商品データ定義（データベース不要でスタンドアロン動作）
// --------------------------------------------------------------------------
const SAMPLE_PRODUCTS = [
    {
        // 商品ID（一意の識別番号）
        id: 1,
        // 商品名（日本語表示）
        name: "プレミアム コットン リラックス Tシャツ",
        // 英語表記
        nameEn: "Premium Cotton Relaxed T-Shirt",
        // カテゴリ（TOPS, BOTTOMS, OUTER）
        category: "TOPS",
        // 価格（日本円・税込）
        price: 2990,
        // 商品画像ファイルへのパス
        image: "assets/images/item_tshirt.jpg",
        // 新着アイテムフラグ
        isNew: true,
        // おすすめアイテムフラグ
        isFeatured: true,
        // 商品詳細解説文
        description: "最高級超長綿を100%使用した、滑らかな肌触りと上品な光沢感が特徴のクルーネックTシャツ。程よいドロップショルダー設計で、一枚着でもジャケットのインナーでも美しいシルエットを保ちます。",
        // 展開カラー
        colors: ["WHITE", "BLACK", "HEATHER GREY"],
        // 展開サイズ
        sizes: ["S", "M", "L", "XL"],
        // 素材情報
        material: "綿 100%",
        // 型番・商品コード
        sku: "MNK-2026-T01"
    },
    {
        // 商品ID
        id: 2,
        // 商品名
        name: "スマート テーラード ジャケット",
        // 英語表記
        nameEn: "Smart Tailored Blazer Jacket",
        // カテゴリ
        category: "OUTER",
        // 価格
        price: 9990,
        // 商品画像
        image: "assets/images/item_jacket.jpg",
        // 新着フラグ
        isNew: true,
        // おすすめフラグ
        isFeatured: true,
        // 商品説明
        description: "現代のビジネスからカジュアルまでシームレスに対応する、モダンフィットな2ボタンテーラードジャケット。軽量でシワになりにくい高機能ウールライク素材を採用し、長時間の着用でも快適です。",
        // 展開カラー
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        // 展開サイズ
        sizes: ["S", "M", "L", "XL"],
        // 素材情報
        material: "ポリエステル 70%, レーヨン 26%, ポリウレタン 4%",
        // 型番
        sku: "MNK-2026-J02"
    },
    {
        // 商品ID
        id: 3,
        // 商品名
        name: "ワイド ドレープ タック スラックス",
        // 英語表記
        nameEn: "Wide Drape Pleated Trousers",
        // カテゴリ
        category: "BOTTOMS",
        // 価格
        price: 4990,
        // 商品画像
        image: "assets/images/item_pants.jpg",
        // 新着フラグ
        isNew: false,
        // おすすめフラグ
        isFeatured: true,
        // 商品説明
        description: "美しい落ち感と深めのツータックが立体的なドレープを生み出すワイドスラックス。ウエスト背面にゴムを仕込み、品格あるスリムな見栄えとリラクシングな履き心地を両立しました。",
        // 展開カラー
        colors: ["CHARCOAL", "BLACK", "DARK BROWN"],
        // 展開サイズ
        sizes: ["S", "M", "L", "XL"],
        // 素材情報
        material: "ポリエステル 65%, レーヨン 35%",
        // 型番
        sku: "MNK-2026-P03"
    },
    {
        // 商品ID
        id: 4,
        // 商品名
        name: "ファイン クルーネック ニットセーター",
        // 英語表記
        nameEn: "Fine Crewneck Knit Sweater",
        // カテゴリ
        category: "TOPS",
        // 価格
        price: 3990,
        // 商品画像
        image: "assets/images/item_knit.jpg",
        // 新着フラグ
        isNew: true,
        // おすすめフラグ
        isFeatured: true,
        // 商品説明
        description: "19.5マイクロンの極細メリノウールブレンド糸を編み上げたミドルゲージニット。チクチク感を抑えた極上の柔らかな肌触りで、一枚でサラリと着こなせる万能な定番アイテムです。",
        // 展開カラー
        colors: ["LIGHT GREY", "BLACK", "OFF WHITE"],
        // 展開サイズ
        sizes: ["S", "M", "L", "XL"],
        // 素材情報
        material: "ウール 50%, アクリル 50%",
        // 型番
        sku: "MNK-2026-K04"
    },
    {
        // 商品ID
        id: 5,
        // 商品名
        name: "ミニマル ステンカラー ロングコート",
        // 英語表記
        nameEn: "Minimal Soutien Collar Long Coat",
        // カテゴリ
        category: "OUTER",
        // 価格
        price: 14900,
        // 商品画像
        image: "assets/images/item_coat.jpg",
        // 新着フラグ
        isNew: true,
        // おすすめフラグ
        isFeatured: false,
        // 商品説明
        description: "無駄なディテールを極限まで削ぎ落とした、ミニマルを体現するチェスターステンカラーコート。膝下まで包み込む洗練されたAラインシルエットが、都会的な装いを格上げします。",
        // 展開カラー
        colors: ["BLACK", "CHARCOAL"],
        // 展開サイズ
        sizes: ["M", "L", "XL"],
        // 素材情報
        material: "ウール 80%, ナイロン 20%",
        // 型番
        sku: "MNK-2026-C05"
    },
    {
        // 商品ID
        id: 6,
        // 商品名
        name: "ヘビーウェイト ボクシー スウェット",
        // 英語表記
        nameEn: "Heavyweight Boxy Crewneck Sweatshirt",
        // カテゴリ
        category: "TOPS",
        // 価格
        price: 3490,
        // 商品画像（Tシャツバリエーション画像を活用）
        image: "assets/images/item_tshirt.jpg",
        // 新着フラグ
        isNew: false,
        // おすすめフラグ
        isFeatured: true,
        // 商品説明
        description: "肉厚でタフな14オンス裏毛コットンスウェット生地。程よいハリ感とボクシーなボックスシルエットが、今の気分にフィットするリラックススタイルを演出します。",
        // 展開カラー
        colors: ["OFF WHITE", "BLACK", "ASH GREY"],
        // 展開サイズ
        sizes: ["S", "M", "L", "XL"],
        // 素材情報
        material: "綿 100%",
        // 型番
        sku: "MNK-2026-S06"
    },
    {
        // 商品ID
        id: 7,
        // 商品名
        name: "リラックス アンクル テーパードパンツ",
        // 英語表記
        nameEn: "Relaxed Ankle Tapered Pants",
        // カテゴリ
        category: "BOTTOMS",
        // 価格
        price: 4490,
        // 商品画像（パンツ画像を流用）
        image: "assets/images/item_pants.jpg",
        // 新着フラグ
        isNew: false,
        // おすすめフラグ
        isFeatured: false,
        // 商品説明
        description: "腰回りに程よいゆとりを持たせつつ、足首に向かってすっきりと絞ったアンクル丈テーパードスラックス。靴元を選ばず、スニーカーにも革靴にもスマートに合わせられます。",
        // 展開カラー
        colors: ["BLACK", "CHARCOAL"],
        // 展開サイズ
        sizes: ["S", "M", "L", "XL"],
        // 素材情報
        material: "ポリエステル 68%, レーヨン 28%, ポリウレタン 4%",
        // 型番
        sku: "MNK-2026-P07"
    },
    {
        // 商品ID
        id: 8,
        // 商品名
        name: "ウールライク 2B カジュアルブレザー",
        // 英語表記
        nameEn: "Wool-Like Casual 2-Button Blazer",
        // カテゴリ
        category: "OUTER",
        // 価格
        price: 8990,
        // 商品画像（ジャケット画像を流用）
        image: "assets/images/item_jacket.jpg",
        // 新着フラグ
        isNew: true,
        // おすすめフラグ
        isFeatured: false,
        // 商品説明
        description: "肩パッドを排したアンコン仕立てにより、カーディガンのように羽織れる軽量カジュアルブレザー。マシンウォッシャブル対応で自宅で手軽にお手入れが可能です。",
        // 展開カラー
        colors: ["NAVY", "BLACK"],
        // 展開サイズ
        sizes: ["S", "M", "L", "XL"],
        // 素材情報
        material: "ポリエステル 100%",
        // 型番
        sku: "MNK-2026-J08"
    }
];

// --------------------------------------------------------------------------
// 2. マイページ用 サンプル購入履歴データ
// --------------------------------------------------------------------------
const SAMPLE_ORDER_HISTORY = [
    {
        // 注文番号
        orderId: "ORD-2026-0982",
        // 注文日時
        date: "2026/10/18",
        // 注文商品名と数量
        items: "プレミアム コットン リラックス Tシャツ (WHITE / L) × 2",
        // 合計支払金額
        totalPrice: "¥5,980",
        // 配送ステータス
        status: "配達完了"
    },
    {
        // 注文番号
        orderId: "ORD-2026-0851",
        // 注文日時
        date: "2026/09/25",
        // 注文商品名と数量
        items: "スマート テーラード ジャケット (BLACK / M) × 1",
        // 合計支払金額
        totalPrice: "¥9,990",
        // 配送ステータス
        status: "配達完了"
    },
    {
        // 注文番号
        orderId: "ORD-2026-0710",
        // 注文日時
        date: "2026/08/12",
        // 注文商品名と数量
        items: "ワイド ドレープ タック スラックス (CHARCOAL / M) × 1",
        // 合計支払金額
        totalPrice: "¥4,990",
        // 配送ステータス
        status: "配達完了"
    }
];

// --------------------------------------------------------------------------
// 3. アプリケーション状態管理（State）
// --------------------------------------------------------------------------
const AppState = {
    // お気に入り登録された商品IDのリスト（LocalStorageから復元）
    favorites: JSON.parse(localStorage.getItem('manekin_favorites')) || [1, 2],
    // ログイン中の会員情報（LocalStorageから復元、未ログイン時はnull）
    currentUser: JSON.parse(localStorage.getItem('manekin_user')) || null,
    // 現在選択されているカタログカテゴリフィルター
    selectedCategory: "ALL",
    // 現在選択されているカタログ並び替え順
    selectedSort: "default",
    // 現在閲覧中の商品詳細ID
    currentDetailId: null
};

// --------------------------------------------------------------------------
// 4. アプリケーション初期化処理
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // お気に入りバッジ件数の初期表示を更新
    updateFavoriteBadges();
    // 認証ナビゲーションリンクの初期状態（ログインまたはマイページ）を更新
    updateAuthNavUI();
    // イベントリスナーの登録処理を実行
    setupEventListeners();
    // トップページのおすすめ商品・新作商品を初期レンダリング
    renderHomeProducts();
    // カタログ一覧ページの商品を初期レンダリング
    renderCatalogProducts();
    // 新作一覧ページの商品をレンダリング
    renderNewItems();
    // 現在のURLハッシュに基づく画面ルーティングを初期実行
    handleRouting();
});

// --------------------------------------------------------------------------
// 5. ルーティング（SPA画面切り替えロジック）
// --------------------------------------------------------------------------
function handleRouting() {
    // 現在のハッシュ文字列を取得（例: "#items"、空なら"#home"）
    const hash = window.location.hash || '#home';
    
    // 詳細ページパラメータ（例: "#item-detail?id=1"）の解析
    let routeName = hash;
    let paramId = null;

    if (hash.includes('?id=')) {
        // ハッシュ文字列を分割してルート名とIDを抽出
        const parts = hash.split('?id=');
        routeName = parts[0];
        paramId = parseInt(parts[1], 10);
    }

    // 全てのページビュー要素を取得
    const allViews = document.querySelectorAll('.page-view');
    // 全てのページビューからactiveクラスを一旦削除
    allViews.forEach(view => view.classList.remove('active'));

    // ナビゲーションリンクのアクティブ状態更新用
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    // ルートに応じたビューの表示切り替え
    switch (routeName) {
        case '#home':
            // トップページを表示
            showView('view-home');
            highlightNavLink('home');
            break;

        case '#items':
            // 商品一覧ページを表示
            showView('view-items');
            highlightNavLink('items');
            renderCatalogProducts();
            break;

        case '#new-items':
            // 新作商品ページを表示
            showView('view-new-items');
            highlightNavLink('new-items');
            renderNewItems();
            break;

        case '#favorites':
            // お気に入り一覧ページを表示
            showView('view-favorites');
            highlightNavLink('favorites');
            renderFavoriteProducts();
            break;

        case '#item-detail':
            // 商品詳細ページを表示
            showView('view-item-detail');
            if (paramId) {
                AppState.currentDetailId = paramId;
                renderItemDetail(paramId);
            } else {
                // IDがない場合は商品一覧へ戻す
                window.location.hash = '#items';
            }
            break;

        case '#login':
            // ログインページを表示（すでにログイン済みの場合はマイページへ案内）
            if (AppState.currentUser) {
                window.location.hash = '#mypage';
                return;
            }
            showView('view-login');
            highlightNavLink('login');
            break;

        case '#register':
            // 会員登録ページを表示
            if (AppState.currentUser) {
                window.location.hash = '#mypage';
                return;
            }
            showView('view-register');
            highlightNavLink('register');
            break;

        case '#mypage':
            // マイページを表示
            showView('view-mypage');
            highlightNavLink('mypage');
            renderMyPage();
            break;

        default:
            // 未知のハッシュの場合はホームへ戻す
            showView('view-home');
            highlightNavLink('home');
            break;
    }

    // 画面遷移時にスクロールトップへ戻す
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 指定したIDのページビューを表示するヘルパー関数
function showView(viewId) {
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
}

// ナビゲーションバーの現在位置ハイライト更新
function highlightNavLink(navKey) {
    const desktopLink = document.querySelector(`.nav-link[data-nav="${navKey}"]`);
    if (desktopLink) desktopLink.classList.add('active');
    
    const mobileLink = document.querySelector(`.mobile-nav-link[data-mobile-nav="${navKey}"]`);
    if (mobileLink) mobileLink.classList.add('active');
}

// --------------------------------------------------------------------------
// 6. 商品カードのHTML生成関数
// --------------------------------------------------------------------------
function createProductCardHTML(product) {
    // 当該商品がお気に入り登録されているか判定
    const isFav = AppState.favorites.includes(product.id);
    
    // 価格の日本円フォーマット
    const formattedPrice = "¥" + product.price.toLocaleString();
    
    // HTML文字列を構築して返却
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

// --------------------------------------------------------------------------
// 7. 各画面の商品一覧レンダリング
// --------------------------------------------------------------------------
// トップページの商品描画（おすすめ商品＆新作コレクション）
function renderHomeProducts() {
    const featuredContainer = document.getElementById('home-featured-grid');
    const newContainer = document.getElementById('home-new-grid');

    if (featuredContainer) {
        // おすすめアイテムを抽出して最大4件表示
        const featuredItems = SAMPLE_PRODUCTS.filter(p => p.isFeatured).slice(0, 4);
        featuredContainer.innerHTML = featuredItems.map(p => createProductCardHTML(p)).join('');
    }

    if (newContainer) {
        // 新作アイテムを抽出して最大4件表示
        const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew).slice(0, 4);
        newContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
    }
}

// 商品一覧（カタログ）ページの描画（フィルタリング＆ソート反映）
function renderCatalogProducts() {
    const gridContainer = document.getElementById('catalog-product-grid');
    if (!gridContainer) return;

    // カテゴリフィルターの適用
    let items = [...SAMPLE_PRODUCTS];
    if (AppState.selectedCategory !== 'ALL') {
        items = items.filter(p => p.category === AppState.selectedCategory);
    }

    // 並び替えソートの適用
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
            // デフォルト（ID順）
            items.sort((a, b) => a.id - b.id);
            break;
    }

    // HTMLを描画
    gridContainer.innerHTML = items.map(p => createProductCardHTML(p)).join('');
}

// 新作一覧ページの描画
function renderNewItems() {
    const gridContainer = document.getElementById('new-items-grid');
    if (!gridContainer) return;

    const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew);
    gridContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
}

// --------------------------------------------------------------------------
// 8. お気に入り機能（追加・解除・一覧表示・LocalStorage保存）
// --------------------------------------------------------------------------
function handleToggleFavorite(productId) {
    const index = AppState.favorites.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
        // 既にお気に入りの場合は配列から削除
        AppState.favorites.splice(index, 1);
        isAdded = false;
        showToast('お気に入りから解除しました');
    } else {
        // 未登録の場合は配列に追加
        AppState.favorites.push(productId);
        isAdded = true;
        showToast('お気に入りに追加しました');
    }

    // LocalStorageに最新の状態を保存
    localStorage.setItem('manekin_favorites', JSON.stringify(AppState.favorites));

    // ヘッダーとお気に入りバッジの件数更新
    updateFavoriteBadges();

    // 画面上の全お気に入りボタンの表示状態を即座に同期
    syncAllFavoriteButtons(productId, isAdded);

    // お気に入り一覧画面にいる場合は再描画
    if (window.location.hash === '#favorites') {
        renderFavoriteProducts();
    }
}

// 全ての該当商品のお気に入りボタンのクラスを同期
function syncAllFavoriteButtons(productId, isFavorite) {
    const cards = document.querySelectorAll(`.product-card[data-id="${productId}"]`);
    cards.forEach(card => {
        const btn = card.querySelector('.fav-btn');
        if (btn) {
            if (isFavorite) {
                btn.classList.add('is-favorite');
                btn.setAttribute('aria-label', 'お気に入りを解除');
            } else {
                btn.classList.remove('is-favorite');
                btn.setAttribute('aria-label', 'お気に入りに追加');
            }
        }
    });

    // 詳細ページのお気に入りボタンも同期
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

// お気に入りバッジの数字を更新
function updateFavoriteBadges() {
    const count = AppState.favorites.length;
    const navBadge = document.getElementById('nav-fav-badge');
    const iconBadge = document.getElementById('icon-fav-badge');
    const mypageFavCount = document.getElementById('mypage-fav-count');

    if (navBadge) navBadge.textContent = count;
    if (iconBadge) iconBadge.textContent = count;
    if (mypageFavCount) mypageFavCount.innerHTML = `${count} <span class="stat-unit">点</span>`;
}

// お気に入り一覧画面のレンダリング
function renderFavoriteProducts() {
    const favGrid = document.getElementById('favorite-product-grid');
    if (!favGrid) return;

    // お気に入り配列に含まれる商品データを抽出
    const favoriteItems = SAMPLE_PRODUCTS.filter(p => AppState.favorites.includes(p.id));

    if (favoriteItems.length === 0) {
        // お気に入りが1件もない場合の空ステート表示
        favGrid.innerHTML = `
            <div class="empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <h2 class="empty-state-title">お気に入りはまだありません</h2>
                <p class="empty-state-text">気になるアイテムを見つけたら、ハートマークを押してお気に入りに追加しましょう。</p>
                <a href="#items" class="btn btn-primary">商品一覧を見る</a>
            </div>
        `;
    } else {
        // お気に入り商品をグリッド描画
        favGrid.innerHTML = favoriteItems.map(p => createProductCardHTML(p)).join('');
    }
}

// --------------------------------------------------------------------------
// 9. 商品詳細表示ロジック
// --------------------------------------------------------------------------
function navigateToDetail(productId) {
    // URLハッシュを変更して詳細ページへルーティング
    window.location.hash = `#item-detail?id=${productId}`;
}

function renderItemDetail(productId) {
    const detailLayout = document.getElementById('item-detail-layout');
    const breadcrumbName = document.getElementById('detail-breadcrumb-name');
    if (!detailLayout) return;

    // 対象商品を検索
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    if (!product) {
        detailLayout.innerHTML = '<p>商品が見つかりませんでした。</p>';
        return;
    }

    // パンくずの名称を更新
    if (breadcrumbName) {
        breadcrumbName.textContent = product.name;
    }

    const isFav = AppState.favorites.includes(product.id);
    const formattedPrice = "¥" + product.price.toLocaleString();

    // カラー選択肢HTML
    const colorChipsHTML = product.colors.map((color, idx) => `
        <button class="color-chip ${idx === 0 ? 'selected' : ''}" onclick="selectColorChip(this)">${color}</button>
    `).join('');

    // サイズ選択肢HTML
    const sizeChipsHTML = product.sizes.map((size, idx) => `
        <button class="size-chip ${idx === 1 ? 'selected' : ''}" onclick="selectSizeChip(this)">${size}</button>
    `).join('');

    // 詳細ページ全体のHTMLを挿入
    detailLayout.innerHTML = `
        <div class="detail-gallery">
            <div class="detail-main-img-box">
                <img src="${product.image}" alt="${product.name}" class="detail-main-img" id="detail-main-img">
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
                    <p class="option-group-title">COLOR (カラー)</p>
                    <div class="color-chips">${colorChipsHTML}</div>
                </div>
                <div class="option-group">
                    <p class="option-group-title">SIZE (サイズ)</p>
                    <div class="size-chips">${sizeChipsHTML}</div>
                </div>
            </div>

            <div class="detail-actions">
                <button class="btn btn-primary btn-block" onclick="handleAddToCart('${product.name}')">
                    ショッピングバッグに追加する
                </button>
                <button class="btn-detail-fav ${isFav ? 'is-favorite' : ''}" id="detail-fav-btn" onclick="handleToggleFavorite(${product.id})">
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

// カラー選択チップの切り替え
function selectColorChip(chipEl) {
    const parent = chipEl.parentElement;
    parent.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
    chipEl.classList.add('selected');
}

// サイズ選択チップの切り替え
function selectSizeChip(chipEl) {
    const parent = chipEl.parentElement;
    parent.querySelectorAll('.size-chip').forEach(s => c.classList.remove('selected'));
    chipEl.classList.add('selected');
}

// ショッピングバッグ追加（デモ動作）
function handleAddToCart(productName) {
    showToast(`「${productName}」をバッグに追加しました`);
}

// --------------------------------------------------------------------------
// 10. 会員登録 & ログイン & マイページ管理
// --------------------------------------------------------------------------
// 新規会員登録フォーム送信ハンドラ
function handleRegisterSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById('reg-name');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const nameError = document.getElementById('reg-name-error');
    const emailError = document.getElementById('reg-email-error');
    const passError = document.getElementById('reg-password-error');

    // エラー表示を初期化
    nameError.textContent = '';
    emailError.textContent = '';
    passError.textContent = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // 入力検証（バリデーション）
    let hasError = false;
    if (!name) {
        nameError.textContent = '氏名を入力してください。';
        hasError = true;
    }
    if (!email || !email.includes('@')) {
        emailError.textContent = '有効なメールアドレスを入力してください。';
        hasError = true;
    }
    if (!password || password.length < 8) {
        passError.textContent = 'パスワードは8文字以上で設定してください。';
        hasError = true;
    }

    if (hasError) return;

    // 会員オブジェクトの生成
    const newUser = {
        name: name,
        email: email,
        memberSince: '2026年10月',
        rank: 'REGULAR MEMBER'
    };

    // StateおよびLocalStorageへ保存
    AppState.currentUser = newUser;
    localStorage.setItem('manekin_user', JSON.stringify(newUser));

    showToast(`ようこそ、${name}様。会員登録が完了しました。`);
    updateAuthNavUI();
    // フォームをリセットしてマイページへ遷移
    document.getElementById('register-form').reset();
    window.location.hash = '#mypage';
}

// ログインフォーム送信ハンドラ
function handleLoginSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passError = document.getElementById('login-password-error');

    emailError.textContent = '';
    passError.textContent = '';

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let hasError = false;
    if (!email || !email.includes('@')) {
        emailError.textContent = '有効なメールアドレスを入力してください。';
        hasError = true;
    }
    if (!password) {
        passError.textContent = 'パスワードを入力してください。';
        hasError = true;
    }

    if (hasError) return;

    // ログインユーザーを生成
    const user = {
        name: email.split('@')[0] + " 様",
        email: email,
        memberSince: '2026年10月',
        rank: 'REGULAR MEMBER'
    };

    AppState.currentUser = user;
    localStorage.setItem('manekin_user', JSON.stringify(user));

    showToast('ログインに成功しました。');
    updateAuthNavUI();
    document.getElementById('login-form').reset();
    window.location.hash = '#mypage';
}

// テスト用かんたんログイン
function handleDemoLogin() {
    const demoUser = {
        name: "山田 太郎 様",
        email: "demo@manekin.com",
        memberSince: "2026年10月",
        rank: "VIP MEMBER"
    };

    AppState.currentUser = demoUser;
    localStorage.setItem('manekin_user', JSON.stringify(demoUser));

    showToast('デモアカウントでログインしました。');
    updateAuthNavUI();
    window.location.hash = '#mypage';
}

// ログアウト処理
function handleLogout() {
    AppState.currentUser = null;
    localStorage.removeItem('manekin_user');
    showToast('ログアウトしました。');
    updateAuthNavUI();
    window.location.hash = '#home';
}

// 認証ステータスに応じたナビゲーション表示切り替え
function updateAuthNavUI() {
    const authLink = document.getElementById('nav-auth-link');
    const mobileLoginLink = document.getElementById('mobile-login-link');
    const mobileRegisterLink = document.getElementById('mobile-register-link');

    if (AppState.currentUser) {
        // ログイン中：ナビゲーションをLOGOUTに変更
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
        if (mobileRegisterLink) {
            mobileRegisterLink.style.display = 'none';
        }
    } else {
        // 未ログイン時：LOGINリンク
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
        if (mobileRegisterLink) {
            mobileRegisterLink.style.display = 'block';
        }
    }
}

// マイページの描画処理
function renderMyPage() {
    const userNameEl = document.getElementById('mypage-user-name');
    const userEmailEl = document.getElementById('mypage-user-email');
    const avatarEl = document.getElementById('mypage-avatar-initial');
    const ordersTbody = document.getElementById('orders-table-body');
    const mypageFavGrid = document.getElementById('mypage-fav-grid');

    // ユーザー情報の反映
    if (AppState.currentUser) {
        userNameEl.textContent = AppState.currentUser.name;
        userEmailEl.textContent = AppState.currentUser.email;
        avatarEl.textContent = AppState.currentUser.name.charAt(0);
    } else {
        userNameEl.textContent = 'ゲスト 会員 様';
        userEmailEl.textContent = '未ログイン（ゲスト閲覧中）';
        avatarEl.textContent = 'G';
    }

    // 購入履歴サンプルデータの描画
    if (ordersTbody) {
        ordersTbody.innerHTML = SAMPLE_ORDER_HISTORY.map(order => `
            <tr>
                <td><strong>${order.orderId}</strong></td>
                <td>${order.date}</td>
                <td>${order.items}</td>
                <td>${order.totalPrice}</td>
                <td><span class="status-badge">${order.status}</span></td>
            </tr>
        `).join('');
    }

    // マイページ内お気に入りクイックグリッド描画
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
// 11. MANEKIN機能「開発中」モーダル表示ロジック
// --------------------------------------------------------------------------
function openManekinModal() {
    const modal = document.getElementById('manekin-modal');
    if (modal) {
        modal.classList.add('open');
        // モバイルドロワーが開いていれば閉じる
        closeMobileDrawer();
    }
}

function closeManekinModal() {
    const modal = document.getElementById('manekin-modal');
    if (modal) {
        modal.classList.remove('open');
    }
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

    // 2.5秒後にフェードアウトして削除
    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// --------------------------------------------------------------------------
// 13. モバイルメニューの開閉制御
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
    // ハッシュ変更検知によるSPA画面遷移
    window.addEventListener('hashchange', handleRouting);

    // MANEKINボタン（ヘッダー、モバイル、バナー等すべて）にモーダル表示をバインド
    document.querySelectorAll('.nav-manekin-btn, #manekin-menu-btn, #mobile-manekin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openManekinModal();
        });
    });

    // モーダルの閉じるボタンと背景クリック
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

    // ハンバーガーメニューとオーバーレイ
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const menuOverlay = document.getElementById('menu-overlay');

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMobileDrawer);

    // モバイルメニュー内のリンククリック時にドロワーを閉じる
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMobileDrawer);
    });

    // カテゴリフィルターボタンのクリックイベント
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

    // ソートセレクトボックスの変更イベント
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            AppState.selectedSort = e.target.value;
            renderCatalogProducts();
        });
    }

    // 会員登録フォーム送信
    const regForm = document.getElementById('register-form');
    if (regForm) regForm.addEventListener('submit', handleRegisterSubmit);

    // ログインフォーム送信
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

    // かんたんデモログインボタン
    const demoBtn = document.getElementById('demo-login-btn');
    if (demoBtn) demoBtn.addEventListener('click', handleDemoLogin);

    // マイページのログアウトボタン
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

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

// ==========================================================================
// 15. 将来的な Python バックエンド API 連携用スタブ（明確な区切り）
// 将来、Pythonサーバー (app.py) を起動した際にここからフェッチ接続可能
// ==========================================================================

// 【APIスタブ 1】MANEKIN機能（3Dアバター・マネキン試着データ取得）
async function apiGetManekinAvatar(userId) {
    try {
        // Python APIエンドポイント例: /api/manekin/{user_id}
        // const response = await fetch(`http://localhost:5000/api/manekin/${userId}`);
        // return await response.json();
        console.log(`[Python API 連携予定] MANEKINデータを要求: User ID = ${userId}`);
        return { status: "ready_for_python", message: "MANEKIN API スタブ" };
    } catch (error) {
        console.error("MANEKIN API 呼び出しエラー:", error);
    }
}

// 【APIスタブ 2】マイクローゼット機能（手持ちアイテム一覧取得・登録）
async function apiGetMyCloset(userId) {
    try {
        // Python APIエンドポイント例: /api/closet/{user_id}
        // const response = await fetch(`http://localhost:5000/api/closet/${userId}`);
        // return await response.json();
        console.log(`[Python API 連携予定] マイクローゼットデータを要求: User ID = ${userId}`);
        return { status: "ready_for_python", items: [] };
    } catch (error) {
        console.error("マイクローゼット API 呼び出しエラー:", error);
    }
}

// 【APIスタブ 3】AIコーデ提案機能（気象データ・シチュエーションに基づく提案）
async function apiGetAiCoordinateRecommendation(weather, occasion, preferredColor) {
    try {
        // Python APIエンドポイント例: /api/ai-coordinate
        // const response = await fetch('http://localhost:5000/api/ai-coordinate', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ weather, occasion, preferredColor })
        // });
        // return await response.json();
        console.log(`[Python API 連携予定] AIコーデ提案を要求: Weather=${weather}, Occasion=${occasion}`);
        return { status: "ready_for_python", recommendations: [] };
    } catch (error) {
        console.error("AIコーデ API 呼び出しエラー:", error);
    }
}
