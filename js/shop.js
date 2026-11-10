// ==========================================================================
// MANEKIN FASHION - ECショッピング機能モジュール (shop.js)a
// ==========================================================================

// --------------------------------------------------------------------------
// アカウント別ストレージ管理ヘルパー（アカウント間のデータ継承・混在を完全に防止）
// --------------------------------------------------------------------------
// ↓ 現在ログイン中のユーザーIDを取得する関数（未ログイン時はnullを返します）
function getScopedUserId() {
    // ↓ アプリ全体状態 AppState にログイン中ユーザー情報があればそのidを返却
    if (typeof AppState !== 'undefined' && AppState.currentUser && AppState.currentUser.id) {
        // ↓ メモリ上のユーザーIDを返します
        return AppState.currentUser.id;
    }
    // ↓ 念のためブラウザ保存領域(localStorage)からログイン情報を取り出してみます
    try {
        // ↓ JSON文字列として保存されたユーザー情報をオブジェクトに復元
        const storedUser = JSON.parse(localStorage.getItem('manekin_user'));
        // ↓ 復元成功かつidが存在すればそれを返却
        if (storedUser && storedUser.id) {
            // ↓ localStorage上のユーザーIDを返します
            return storedUser.id;
        }
    // ↓ JSONパース失敗等のエラーが起きてもアプリを止めずに無視します
    } catch (e) {}
    // ↓ どちらも見つからなければゲスト状態としてnullを返します
    return null;
}

// ↓ ユーザーごとに独立したlocalStorageのキー名（「〇〇_u_12」や「〇〇_guest」）を作る関数
function getScopedKey(baseKey, userIdOverride) {
    // ↓ 明示指定がなければ現在ログイン中のユーザーIDを取得
    const uid = (userIdOverride !== undefined) ? userIdOverride : getScopedUserId();
    // ↓ ユーザーIDがあれば `_u_番号`、未ログイン(null)なら `_guest` を末尾に付けて衝突を防ぎます
    return uid ? `${baseKey}_u_${uid}` : `${baseKey}_guest`;
}

// ↓ 指定されたアカウント専用の保存キーへJSON形式でデータを保存する関数
function saveScopedData(baseKey, value, userIdOverride) {
    // ↓ 容量上限エラー等でクラッシュしないようtry-catchで保護
    try {
        // ↓ オブジェクトや配列をJSON文字列へ変換してlocalStorageに書き込みます
        localStorage.setItem(getScopedKey(baseKey, userIdOverride), JSON.stringify(value));
    // ↓ 書き込み失敗時は静かに無視
    } catch (e) {}
}

// ↓ 指定されたアカウント専用の保存データをlocalStorageから削除する関数
function removeScopedData(baseKey, userIdOverride) {
    // ↓ エラー保護付きで削除を実行
    try {
        // ↓ スコープ付きキーに一致するデータを消去
        localStorage.removeItem(getScopedKey(baseKey, userIdOverride));
    // ↓ 削除失敗時は無視
    } catch (e) {}
}

// ↓ アカウント専用キーから保存データを読み出し、無ければ初期値(fallbackValue)の複製を返す関数
function loadScopedData(baseKey, fallbackValue, userIdOverride) {
    // ↓ 読み出し・パースエラーに備えてtry-catchで囲みます
    try {
        // ↓ アカウント固有キーから文字列を取得
        const raw = localStorage.getItem(getScopedKey(baseKey, userIdOverride));
        // ↓ データがあればJSON復元し、無ければ初期値をディープコピー(元配列を壊さない複製)して返します
        return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallbackValue));
    // ↓ 壊れたJSON等があった場合は安全な初期値の複製を返します
    } catch (e) {
        // ↓ 安全なデフォルト値をコピーして返却
        return JSON.parse(JSON.stringify(fallbackValue));
    }
}

// ↓ 以前の旧バージョンで使われていた「アカウント共通(共有)キー」をすべて削除してデータ混在を防ぐ関数
function purgeLegacyGlobalStorage() {
    // ↓ 削除対象となる旧式の共有キー一覧
    const legacyKeys = [
        'manekin_orders',
        'manekin_favorites',
        'manekin_cart',
        'manekin_my_closet',
        'manekin_saved_outfits',
        'manekin_current_outfit',
        'manekin_fitting_offsets',
        'manekin_studio_gender',
        'manekin_body_profile',
        'manekin_clean_initial_v2',
        'manekin_clean_orders_v3',
        'manekin_clean_saved_outfits_v1',
        'manekin_clean_outfit_v2'
    ];
    // ↓ 一覧のキーを1つずつlocalStorageから完全に消去します
    legacyKeys.forEach(k => localStorage.removeItem(k));
}

// ↓ APIサーバーのベースURLを返すヘルパー（ローカルHTML直開きや別ポート8080以外なら8080番を指定）
function getApiBaseUrl() {
    // ↓ file://プロトコルまたはポート8080以外で開かれている場合は明示的に http://127.0.0.1:8080 へ通信します
    return (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
}

// ↓ ユーザーIDがサーバー側MySQLで管理される数字のみの正式会員IDかどうかを判定する関数
function isServerUserId(uid) {
    // ↓ null/undefinedでなく、正規表現 `/^\d+$/`（数字のみ）に一致すればMySQLユーザーと判定
    return uid !== null && uid !== undefined && /^\d+$/.test(String(uid));
}

// ↓ ログイン切替・ログアウト時に配送先フォームや入力欄に前の人の文字が残らないようリセットする関数
function resetAccountScopedDomInputs(user) {
    // ↓ レジで使用する入力中ポイント数を0に初期化
    if (typeof checkoutUsedPoints !== 'undefined') {
        // ↓ 0ポイントに戻します
        checkoutUsedPoints = 0;
    }
    // ↓ 配送先氏名の入力欄要素を取得
    const orderName = document.getElementById('order-name');
    // ↓ 電話番号の入力欄要素を取得
    const orderPhone = document.getElementById('order-phone');
    // ↓ メールアドレス入力欄要素を取得
    const orderEmail = document.getElementById('order-email');
    // ↓ 郵便番号入力欄要素を取得
    const orderPostal = document.getElementById('order-postal');
    // ↓ 住所入力欄要素を取得
    const orderAddress = document.getElementById('order-address');
    // ↓ ポイント利用数入力欄を取得
    const usePtsInput = document.getElementById('checkout-use-points');
    // ↓ スタジオコーデ保存名入力欄を取得
    const outfitNameInput = document.getElementById('outfit-name-input');
    // ↓ 手持ち服名入力欄を取得
    const closetItemName = document.getElementById('closet-item-name');

    // ↓ 新しいユーザー名があれば自動セット、無ければ空欄にリセット
    if (orderName) orderName.value = (user && user.name) ? user.name : '';
    // ↓ 電話番号は空欄へクリア
    if (orderPhone) orderPhone.value = '';
    // ↓ 新しいユーザーのメールがあれば自動セット、無ければ空欄へ
    if (orderEmail) orderEmail.value = (user && user.email) ? user.email : '';
    // ↓ 郵便番号をクリア
    if (orderPostal) orderPostal.value = '';
    // ↓ 住所欄をクリア
    if (orderAddress) orderAddress.value = '';
    // ↓ 利用ポイント入力欄をクリア
    if (usePtsInput) usePtsInput.value = '';
    // ↓ コーデ名入力欄をクリア
    if (outfitNameInput) outfitNameInput.value = '';
    // ↓ 手持ち服名入力欄をクリア
    if (closetItemName) closetItemName.value = '';
}

// ↓ 試着マネキンの各パーツ（帽子・トップス・アウター・ボトムス・靴）の初期位置・拡大率データを返す関数
function getDefaultFittingOffsets() {
    // ↓ 各スロット位置ズレ(x:0, y:0)と基本倍率(100%)、標準サイズ(M)のオブジェクトを返します
    return {
        // ↓ 帽子スロット初期値
        hat: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // ↓ トップススロット初期値
        tops: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // ↓ アウタースロット初期値
        outer: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // ↓ ボトムススロット初期値
        bottoms: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 },
        // ↓ 靴スロット初期値
        shoes: { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 }
    };
}

// ↓ スタジオ用シルエット基準値の初期オブジェクトを返す関数
function getDefaultBodyProfile() {
    // ↓ 基準設定オブジェクトを返却
    return { height: 172, bodyType: 'REGULAR', styleTaste: 'MINIMAL' };
}

// ↓ ログイン／ログアウト／アカウント切替の中核関数：前の人のメモリ・画面を完全消去し新しいアカウントのデータに差し替えます
function applyAccountSession(user, options = {}) {
    // ↓ 旧方式の共有ストレージキーが残っていたら即消去
    purgeLegacyGlobalStorage();

    // 旧アカウントの保留中デバウンス同期があれば旧ユーザーIDで即時確定させてから切替
    if (typeof flushPendingStudioStateSync === 'function') {
        // ↓ 未送信の変更を旧アカウント側へ確実に保存してから次へ進みます
        flushPendingStudioStateSync();
    }

    // ↓ 切り替え前がゲスト(未ログイン)だったかどうかを記憶
    const wasGuest = !AppState.currentUser;
    // ↓ ゲスト状態でカートに商品を入れてからログインする場合のみ、カート内容を新アカウントへ引き継ぐため退避
    const guestCartSnapshot = (options.preserveGuestCart && wasGuest && Array.isArray(AppState.cart))
        ? JSON.parse(JSON.stringify(AppState.cart))
        : [];
    // ↓ 各フォーム入力欄を新アカウント向けに初期化
    resetAccountScopedDomInputs(user || null);

    // ↓ ログアウト時（user が null/空のとき）の処理分岐
    if (!user) {
        // ↓ ログインユーザーを空に
        AppState.currentUser = null;
        // ↓ ブラウザに保存していた現在ログインユーザーキーを削除
        localStorage.removeItem('manekin_user');
        // ↓ 注文履歴を空に（他人の履歴が見えないように）
        AppState.orderHistory = [];
        // ↓ ゲスト用のお気に入りリストを読込
        AppState.favorites = loadScopedData('manekin_favorites', [], null);
        // ↓ ゲスト用のカートリストを読込
        AppState.cart = loadScopedData('manekin_cart', [], null);
        // ↓ マイクローゼットを空に
        AppState.myCloset = [];
        // ↓ 保存済みコーデ一覧を空に
        AppState.savedOutfits = [];
        // ↓ マネキンの着用服をすべて脱がせた状態に初期化
        AppState.currentOutfit = { hat: null, outer: null, tops: null, bottoms: null, shoes: null };
        // ↓ 試着微調整値を初期値へ
        AppState.fittingOffsets = getDefaultFittingOffsets();
        // ↓ スタジオ性別をMENへ戻す
        AppState.studioGender = 'MEN';
        // ↓ 体型基準を初期値へ
        AppState.userBodyProfile = getDefaultBodyProfile();
        // ↓ 各UIパーツが存在する場合のみ順番に再描画を実行
        if (typeof syncGenderToggleUI === 'function') syncGenderToggleUI();
        // ↓ マネキンステージ再描画
        if (typeof renderMannequinStage === 'function') renderMannequinStage();
        // ↓ カート数バッジ更新
        if (typeof updateCartBadge === 'function') updateCartBadge();
        // ↓ お気に入り数バッジ更新
        if (typeof updateFavoriteBadges === 'function') updateFavoriteBadges();
        // ↓ ヘッダーのLOGIN表記等へ更新
        if (typeof updateAuthNavUI === 'function') updateAuthNavUI();
        // ↓ マイページ再描画
        if (typeof renderMyPage === 'function') renderMyPage();
        // ↓ トップ画面再描画
        if (typeof renderHomeProducts === 'function') renderHomeProducts();
        // ↓ 一覧画面再描画
        if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
        // ↓ 新着画面再描画
        if (typeof renderNewItems === 'function') renderNewItems();
        // ↓ お気に入り画面再描画
        if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
        // ↓ ログアウト完了のためここで終了
        return;
    }

    // ↓ ログイン成功時：ユーザーの固有IDを取り出します
    const uid = user.id;
    // ↓ AppState.currentUser を新アカウントで上書き
    AppState.currentUser = user;
    // ↓ リロードしてもログイン状態を維持できるようブラウザへ保存
    localStorage.setItem('manekin_user', JSON.stringify(user));

    // ↓ ゲスト時のカート引き継ぎデータがある場合は会員カートと重複まとめ(マージ)を行います
    if (guestCartSnapshot.length > 0) {
        // ↓ 新ユーザーの保存済みカートを読込
        const userCart = loadScopedData('manekin_cart', [], uid);
        // ↓ 配列をコピー
        const mergedCart = [...userCart];
        // ↓ ゲストカートの各商品をループしてチェック
        guestCartSnapshot.forEach(item => {
            // ↓ ID・カラー・サイズが完全一致する商品がすでに会員カートにあるか検索
            const idx = mergedCart.findIndex(c => c.id === item.id && c.color === item.color && c.size === item.size);
            // ↓ あれば数量だけ加算、無ければ新しい商品として追加
            if (idx > -1) mergedCart[idx].quantity += (item.quantity || 1);
            // ↓ 未登録の組み合わせなら要素をコピーして追加
            else mergedCart.push({ ...item });
        });
        // ↓ マージ完了したカートをAppStateに反映
        AppState.cart = mergedCart;
        // ↓ 新ユーザーのローカルストレージキーへ保存
        saveScopedData('manekin_cart', AppState.cart, uid);
        // ↓ ゲスト側の一時カートを削除
        removeScopedData('manekin_cart', null);
    // ↓ ゲスト引き継ぎが無い通常のログイン切替時
    } else {
        // ↓ 新ユーザーのカートのみを読み込みます
        AppState.cart = loadScopedData('manekin_cart', [], uid);
    }

    // ↓ ここからアカウントID(uid)別の各種データだけをローカルキャッシュから即座に展開（すぐ画面を出すため）
    AppState.orderHistory = loadScopedData('manekin_orders', [], uid);
    // ↓ お気に入りID配列を読込
    AppState.favorites = loadScopedData('manekin_favorites', [], uid);
    // ↓ マイクローゼット配列を読込
    AppState.myCloset = loadScopedData('manekin_my_closet', [], uid);
    // ↓ 保存コーデ一覧を読込
    AppState.savedOutfits = loadScopedData('manekin_saved_outfits', [], uid);
    // ↓ 試着中コーデを読込
    AppState.currentOutfit = loadScopedData('manekin_current_outfit', { hat: null, outer: null, tops: null, bottoms: null, shoes: null }, uid);
    // ↓ 試着微調整値を読込
    AppState.fittingOffsets = loadScopedData('manekin_fitting_offsets', getDefaultFittingOffsets(), uid);
    // ↓ マネキン性別設定を読込
    AppState.studioGender = loadScopedData('manekin_studio_gender', 'MEN', uid);
    // ↓ プロフィール基準値を読込
    AppState.userBodyProfile = loadScopedData('manekin_body_profile', getDefaultBodyProfile(), uid);

    // ↓ 全画面UIを一斉に最新アカウントの内容へ描き直します
    if (typeof syncGenderToggleUI === 'function') syncGenderToggleUI();
    // ↓ マネキン試着ステージ描画
    if (typeof renderMannequinStage === 'function') renderMannequinStage();
    // ↓ カート個数バッジ更新
    if (typeof updateCartBadge === 'function') updateCartBadge();
    // ↓ お気に入りハート数更新
    if (typeof updateFavoriteBadges === 'function') updateFavoriteBadges();
    // ↓ ヘッダーのユーザー名表示更新
    if (typeof updateAuthNavUI === 'function') updateAuthNavUI();
    // ↓ マイページ内容更新
    if (typeof renderMyPage === 'function') renderMyPage();
    // ↓ トップおすすめ更新
    if (typeof renderHomeProducts === 'function') renderHomeProducts();
    // ↓ 商品一覧更新
    if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
    // ↓ 新着一覧更新
    if (typeof renderNewItems === 'function') renderNewItems();
    // ↓ お気に入り画面更新
    if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
    // ↓ AIスタジオ全体更新
    if (typeof renderManekinStudio === 'function') renderManekinStudio(AppState.studioActiveTab || 'create');

    // MySQLからログインアカウントだけの最新データを取得（ゲストカートがある場合は安全にマージ同期）
    syncCartFromBackend({ mergeItems: guestCartSnapshot });
    // ↓ 注文履歴をMySQLと同期
    syncOrdersFromBackend();
    // ↓ お気に入り一覧をMySQLと同期
    syncFavoritesFromBackend();
    // ↓ クローゼット項目をMySQLと同期
    if (typeof syncClosetFromBackend === 'function') syncClosetFromBackend();
    // ↓ 保存済みコーデをMySQLと同期
    if (typeof syncOutfitsFromBackend === 'function') syncOutfitsFromBackend();
    // ↓ スタジオ着用状態をMySQLと同期
    if (typeof syncStudioStateFromBackend === 'function') syncStudioStateFromBackend();
}

// 5. 商品カード生成 & カタログ表示
// --------------------------------------------------------------------------
// ↓ 1つの商品オブジェクトから共通のHTMLカード文字列を生成して返す関数
function createProductCardHTML(product) {
    // ↓ この商品がお気に入り配列に含まれているかを真偽値で判定
    const isFav = AppState.favorites.includes(product.id);
    // ↓ 数値の価格を「¥12,000」のように3桁カンマ区切りの日本円文字列に整形
    const formattedPrice = "¥" + product.price.toLocaleString();

    // ↓ バッククォート(``)を使ったテンプレートリテラルで商品カードHTMLを返します（${...}に値が埋め込まれます）
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

// ↓ トップページ内の「おすすめアイテム4点」「新着コレクション4点」を描画する関数
function renderHomeProducts() {
    // ↓ おすすめグリッド要素を取得
    const featuredContainer = document.getElementById('home-featured-grid');
    // ↓ 新着グリッド要素を取得
    const newContainer = document.getElementById('home-new-grid');
    // ↓ おすすめ欄が存在する場合
    if (featuredContainer) {
        // ↓ 全商品から isFeatured=true を抽出し、先頭4件だけ切り出します
        const featuredItems = SAMPLE_PRODUCTS.filter(p => p.isFeatured).slice(0, 4);
        // ↓ 4件をHTMLカード文字列の配列に変換してjoin('')で連結し画面へ流し込みます
        featuredContainer.innerHTML = featuredItems.map(p => createProductCardHTML(p)).join('');
    }
    // ↓ 新着欄が存在する場合
    if (newContainer) {
        // ↓ isNew=true の商品先頭4件を切り出します
        const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew).slice(0, 4);
        // ↓ カードHTMLを連結して画面へ描画
        newContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
    }
}

// ↓ 商品一覧ページ（MEN / WOMEN / ALL）を絞り込み＆並び替え条件に合わせて描画する関数
function renderCatalogProducts() {
    // ↓ カタログ用グリッド要素を取得
    const gridContainer = document.getElementById('catalog-product-grid');
    // ↓ 要素が見つからなければ何もしない
    if (!gridContainer) return;

    // 性別に応じた動的タイトル・パンくずの更新
    const breadcrumbCurrent = document.getElementById('catalog-breadcrumb-current');
    // ↓ ページ大見出し要素
    const pageTitle = document.getElementById('catalog-page-title');
    // ↓ サブ見出し要素
    const pageSubtitle = document.getElementById('catalog-page-subtitle');

    // ↓ 現在選択中の性別状態に応じてヘッダー文言を切り替え
    if (AppState.selectedGender === 'MAN') {
        // ↓ パンくずをMANに変更
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'MAN';
        // ↓ 大見出しをメンズコレクションに変更
        if (pageTitle) pageTitle.textContent = "MEN'S COLLECTION";
        // ↓ 説明文更新
        if (pageSubtitle) pageSubtitle.textContent = "現代の男性に向けた、洗練されたモダンウェア（全12アイテム）";
    // ↓ WOMEN選択時
    } else if (AppState.selectedGender === 'WOMAN') {
        // ↓ パンくずをWOMANに変更
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'WOMAN';
        // ↓ 大見出しをウィメンズコレクションに変更
        if (pageTitle) pageTitle.textContent = "WOMEN'S COLLECTION";
        // ↓ 説明文更新
        if (pageSubtitle) pageSubtitle.textContent = "凛とした美しさと現代的なリラックス感を纏うウィメンズウェア（全12アイテム）";
    // ↓ ALL選択時
    } else {
        // ↓ パンくずをALL COLLECTIONに変更
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'ALL COLLECTION';
        // ↓ 大見出しをALL COLLECTIONに変更
        if (pageTitle) pageTitle.textContent = "ALL COLLECTION";
        // ↓ 説明文更新
        if (pageSubtitle) pageSubtitle.textContent = "すべての最新アイテム一覧（全24アイテム）";
    }

    // ↓ 元配列を壊さないようスプレッド構文([...])で全商品配列をコピー
    let items = [...SAMPLE_PRODUCTS];
    // ↓ 性別フィルターがALL以外なら一致する商品だけに絞ります
    if (AppState.selectedGender && AppState.selectedGender !== 'ALL') {
        // ↓ genderプロパティでフィルタリング
        items = items.filter(p => p.gender === AppState.selectedGender);
    }
    // ↓ カテゴリフィルターがALL以外（TOPS/BOTTOMS/OUTER）なら更に絞ります
    if (AppState.selectedCategory !== 'ALL') {
        // ↓ categoryプロパティでフィルタリング
        items = items.filter(p => p.category === AppState.selectedCategory);
    }

    // ↓ 選択中のソート条件に応じて配列の並び順を変更
    switch (AppState.selectedSort) {
        // ↓ 価格が安い順（引き算がマイナスならaが先）
        case 'price-asc':
            // ↓ 昇順ソート
            items.sort((a, b) => a.price - b.price);
            // ↓ switchを抜ける
            break;
        // ↓ 価格が高い順
        case 'price-desc':
            // ↓ 降順ソート
            items.sort((a, b) => b.price - a.price);
            // ↓ switchを抜ける
            break;
        // ↓ 商品名順（localeCompare('ja')で日本語五十音順に並べます）
        case 'name-asc':
            // ↓ 日本語順ソート
            items.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            // ↓ switchを抜ける
            break;
        // ↓ 標準おすすめ順（商品ID昇順）
        default:
            // ↓ ID順ソート
            items.sort((a, b) => a.id - b.id);
            // ↓ switchを抜ける
            break;
    }
    // ↓ 絞り込み・ソート済みの全商品をHTMLカードに変換して描画
    gridContainer.innerHTML = items.map(p => createProductCardHTML(p)).join('');
}

// ↓ 新着商品専用ページ(#new-items)の全アイテムを描画する関数
function renderNewItems() {
    // ↓ 新着グリッドを取得
    const gridContainer = document.getElementById('new-items-grid');
    // ↓ 無ければ終了
    if (!gridContainer) return;
    // ↓ isNew=true の全商品を抽出
    const newItems = SAMPLE_PRODUCTS.filter(p => p.isNew);
    // ↓ HTMLカード化して描画
    gridContainer.innerHTML = newItems.map(p => createProductCardHTML(p)).join('');
}

// --------------------------------------------------------------------------
// 6. 商品詳細表示ロジック（写真切替 & サイズ変更）
// --------------------------------------------------------------------------
// ↓ 商品カードの画像や名前をクリックしたとき、詳細ページのハッシュURLへ遷移させる関数
function navigateToDetail(productId) {
    // ↓ URL末尾を `#item-detail?id=番号` に変更するとapp.jsのルーターが自動で詳細画面を開きます
    window.location.hash = `#item-detail?id=${productId}`;
}

// ↓ 商品詳細画面の中身（ギャラリー画像、価格、カラー切替、サイズ選択、カート追加ボタン等）を描画する関数
function renderItemDetail(productId) {
    // ↓ 詳細レイアウト枠を取得
    const detailLayout = document.getElementById('item-detail-layout');
    // ↓ パンくずの現在位置テキスト要素を取得
    const breadcrumbName = document.getElementById('detail-breadcrumb-name');
    // ↓ 枠が無ければ終了
    if (!detailLayout) return;

    // ↓ SAMPLE_PRODUCTSから指定IDと一致する商品データを1件検索
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    // ↓ 万が一存在しない商品IDだった場合はエラーメッセージを表示して中断
    if (!product) {
        // ↓ 見つからない旨を表示
        detailLayout.innerHTML = '<p>商品が見つかりませんでした。</p>';
        // ↓ 関数終了
        return;
    }

    // ↓ パンくずに商品名を表示
    if (breadcrumbName) {
        // ↓ 商品名をセット
        breadcrumbName.textContent = product.name;
    }

    // ↓ 初期選択カラーを配列1番目に設定
    AppState.selectedColor = product.colors[0];
    // ↓ 初期選択サイズを2番目（たいてい"M"）に設定
    AppState.selectedSize = product.sizes[1] || "M";

    // ↓ お気に入り済みかどうかを判定
    const isFav = AppState.favorites.includes(product.id);
    // ↓ 価格のカンマ整形
    const formattedPrice = "¥" + product.price.toLocaleString();
    // ↓ 選択中カラー専用の画像パスがあれば優先採用し、無ければメイン画像を使用
    const initialImgUrl = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

    // カラーチップのHTML生成
    const colorChipsHTML = product.colors.map((color, idx) => {
        // ↓ 初期選択中カラーと一致するか判定
        const isSelected = (color === AppState.selectedColor);
        // ↓ その色に対応する画像パスを取得
        const mappedImg = (product.colorImages && product.colorImages[color]) || product.image;
        // ↓ カラー選択ボタンHTMLを返却
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
        // ↓ 初期選択サイズと一致するか判定
        const isSelected = (size === AppState.selectedSize);
        // ↓ サイズ選択ボタンHTMLを返却
        return `
            <button type="button" 
                    class="size-chip ${isSelected ? 'selected' : ''}" 
                    data-size="${size}" 
                    onclick="handleSizeSelect(this, '${size}')">
                ${size}
            </button>
        `;
    }).join('');

    // ↓ 左の大きい商品写真エリア＋右の価格・カラー・サイズ・購入ボタンエリアを一括で描画します
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

// カラー選択ハンドラ（商品詳細ページで色チップを押した時の処理）
function handleColorSelect(chipEl, colorName, imageUrl) {
    // ↓ 同じ色チップ一覧の親要素を取得
    const parent = chipEl.parentElement;
    // ↓ まず全ての色ボタンから選択中クラス(selected)を外します
    parent.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
    // ↓ 今回クリックされたボタンにだけ selected を付与
    chipEl.classList.add('selected');

    // ↓ アプリ全体状態に選択されたカラー名を保存
    AppState.selectedColor = colorName;

    // ↓ 「COLOR: ○○」の表示テキストを更新
    const labelColor = document.getElementById('label-selected-color');
    // ↓ 要素があればカラー名を書き換え
    if (labelColor) labelColor.textContent = colorName;

    // 写真の切り替え（一度薄くフェードアウトしてから画像を差し替えて戻す演出）
    const mainImg = document.getElementById('detail-main-img');
    // ↓ メイン画像要素と差し替え画像URLの両方がある場合
    if (mainImg && imageUrl) {
        // ↓ 透明度を0.25に下げて切り替え予兆を演出
        mainImg.style.opacity = '0.25';
        // ↓ 0.12秒後に新しい色の写真へ差し替えて透明度を1(不透明)へ戻します
        setTimeout(() => {
            // ↓ 画像ソースを切り替え
            mainImg.src = imageUrl;
            // ↓ 透明度を元に戻す
            mainImg.style.opacity = '1';
        }, 120);
    }

    // ↓ 画面右下に「カラーを切り替えました」トースト通知を表示
    showToast(`カラー: ${colorName} に切り替えました`);
}

// サイズ選択ハンドラ（S / M / L などのサイズチップを押した時の処理）
function handleSizeSelect(chipEl, sizeName) {
    // ↓ 親コンテナを取得
    const parent = chipEl.parentElement;
    // ↓ 全サイズボタンのselectedを一旦解除
    parent.querySelectorAll('.size-chip').forEach(s => s.classList.remove('selected'));
    // ↓ クリックされたサイズボタンに selected を付与
    chipEl.classList.add('selected');

    // ↓ 選択されたサイズを全体状態に保存
    AppState.selectedSize = sizeName;

    // ↓ 「SIZE: ○」ラベルを書き換え
    const labelSize = document.getElementById('label-selected-size');
    // ↓ 要素があればサイズ名を反映
    if (labelSize) labelSize.textContent = sizeName;

    // ↓ トースト通知を表示
    showToast(`サイズ: ${sizeName} を選択しました`);
}

// --------------------------------------------------------------------------
// 7. カート・購入手続き管理（CHECKOUT & MySQLアカウント別同期）
// --------------------------------------------------------------------------
// ↓ カートのサーバー送信が並列に走って順番が前後しないよう直列化(1列並び)するためのPromise鎖
let _cartSyncPromise = Promise.resolve();
// ↓ ユーザーIDごとにカート更新の世代番号を記録する辞書（古い通信結果で最新操作を上書きするのを防ぐレース対策）
const _cartSyncSeqByUser = {};

// ↓ 指定ユーザーの現在のカート同期世代番号を取得するヘルパー
function getCartUserSeq(uid) {
    // ↓ まだ記録がなければ0を返します
    return _cartSyncSeqByUser[String(uid)] || 0;
}

// ↓ カート変更のたびに世代番号を +1 カウントアップするヘルパー
function bumpCartUserSeq(uid) {
    // ↓ 文字列キーに統一
    const k = String(uid);
    // ↓ 現在の値に1を足して保存
    _cartSyncSeqByUser[k] = (_cartSyncSeqByUser[k] || 0) + 1;
    // ↓ 新しい世代番号を返却
    return _cartSyncSeqByUser[k];
}

// ↓ 現在のAppState.cartの中身をバックエンド(Python/Flask → MySQL cart_itemsテーブル)へ保存する非同期関数
async function syncCartToBackend() {
    // ↓ 未ログインや数値IDでないローカルユーザーの場合はサーバー送信せずfalseを返して終了
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // ↓ 同期スキップ
        return false;
    }
    // ↓ この処理開始時点の対象ユーザーIDを固定（途中で別アカウントに切り替わっても混同しないため）
    const targetUserId = AppState.currentUser.id;
    // ↓ 送信用にカート配列のディープコピーを取得
    const snapshot = JSON.parse(JSON.stringify(AppState.cart || []));
    // ↓ 新しい世代番号を発行
    const seq = bumpCartUserSeq(targetUserId);

    // ↓ 直前の同期が終わってから順次実行される実処理関数
    const runSync = async () => {
        // ↓ すでにさらに新しい操作で世代が進んでいれば、この古いスナップショットは送らずスキップします
        if (seq !== getCartUserSeq(targetUserId)) {
            // ↓ 古い処理なのでスキップ完了扱い
            return true;
        }
        // ↓ サーバーへのPOST通信を実行
        try {
            // ↓ /api/cart/sync エンドポイントへJSONでカート丸ごと同期リクエストを送信
            const res = await fetch(`${getApiBaseUrl()}/api/cart/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: targetUserId,
                    items: snapshot
                })
            });
            // ↓ HTTPエラーなら例外を投げてcatch側(未同期フラグ保存)へ回します
            if (!res.ok) throw new Error('Cart sync failed');
            // ↓ この処理が依然として最新世代なら「未送信変更あり(dirty)」フラグを消去
            if (seq === getCartUserSeq(targetUserId)) {
                // ↓ サーバーと完全同期済みになったためdirtyマークを削除
                removeScopedData('manekin_cart_dirty', targetUserId);
            }
            // ↓ 同期成功
            return true;
        // ↓ サーバー未起動やネットエラー時のフォールバック
        } catch (e) {
            // ↓ 「まだMySQLへ送れていない未同期変更がある」ことをローカルに記録しておきます
            saveScopedData('manekin_cart_dirty', true, targetUserId);
            // ↓ 同期失敗
            return false;
        }
    };

    // ↓ 前回の通信チェーンの末尾につなげて順番通りに実行します
    _cartSyncPromise = _cartSyncPromise.then(runSync, runSync);
    // ↓ 呼び出し元がawaitできるようPromiseを返します
    return _cartSyncPromise;
}

// ↓ サーバー(MySQL)から対象アカウントのカート内容を取得し、必要に応じてローカル変更・ゲストカートと安全に統合する関数
async function syncCartFromBackend(options = {}) {
    // ↓ サーバー管理ユーザーでなければバッジ表示のみ更新して終了
    if (!AppState.currentUser || !isServerUserId(AppState.currentUser.id)) {
        // ↓ ヘッダーのカート点数バッジ更新
        updateCartBadge();
        // ↓ 終了
        return;
    }
    // ↓ 取得対象のユーザーIDを固定
    const targetUserId = AppState.currentUser.id;
    // ↓ ログイン直前にゲストが入れていた商品リストがあれば取り出し
    const mergeItems = Array.isArray(options.mergeItems) ? options.mergeItems : [];
    // ↓ 前回のオフライン中などに未送信の変更(dirty)が残っていないか確認
    const isDirty = loadScopedData('manekin_cart_dirty', false, targetUserId) === true;
    // ↓ 通信開始時の世代番号を記録（通信中にユーザーが操作したか見分けるため）
    const fetchStartSeq = getCartUserSeq(targetUserId);

    // ↓ サーバーのカート取得APIを呼び出し
    try {
        // ↓ GET /api/cart/<user_id> へアクセス
        const res = await fetch(`${getApiBaseUrl()}/api/cart/${targetUserId}`);
        // ↓ HTTPエラー時は例外扱い
        if (!res.ok) throw new Error('Cart fetch failed');
        // ↓ JSONデータを読み取り
        const data = await res.json();
        // ↓ 通信待ちの間にログアウトや別アカウント切替が起きていたら古いレスポンスを破棄して終了
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;

        // ↓ サーバーに保存されていたカート配列を取り出し
        const serverItems = Array.isArray(data.items) ? data.items : [];
        // ↓ 通信中に別操作で世代番号が進んでしまっていた場合のレースコンディション回避分岐
        if (fetchStartSeq !== getCartUserSeq(targetUserId)) {
            // ↓ マージすべきゲスト商品がなければ今のユーザー操作を優先して何もせず終了
            if (mergeItems.length === 0) return;
            // ログイン直後に追加変更が走っていた場合もサーバー側既存カートを失わずに統合
            const mergedCurrent = JSON.parse(JSON.stringify(AppState.cart || []));
            // ↓ サーバーから届いた商品を1つずつ現在カートへ安全に統合
            serverItems.forEach(item => {
                // ↓ 同一商品・色・サイズを探す
                const idx = mergedCurrent.findIndex(c => c.id === item.id && c.color === item.color && c.size === item.size);
                // ↓ 既にあれば少ない方で消えないよう多い方の数量を採用
                if (idx > -1) {
                    // ↓ 大きい数量を保持
                    mergedCurrent[idx].quantity = Math.max(mergedCurrent[idx].quantity || 1, item.quantity || 1);
                // ↓ 無ければ要素を追加
                } else {
                    // ↓ コピーを追加
                    mergedCurrent.push({ ...item });
                }
            });
            // ↓ 統合結果を反映・保存・画面更新・再同期
            AppState.cart = mergedCurrent;
            // ↓ アカウント専用ストレージ保存
            saveScopedData('manekin_cart', AppState.cart, targetUserId);
            // ↓ バッジ更新
            updateCartBadge();
            // ↓ 今レジ画面を開いていれば即時再描画
            if (window.location.hash === '#checkout' && typeof renderCheckoutPage === 'function') {
                // ↓ レジ再描画
                renderCheckoutPage();
            }
            // ↓ サーバーへ最新状態を押し戻して終了
            await syncCartToBackend();
            // ↓ 完了
            return;
        }

        // ↓ 未送信ローカル変更(isDirty)があればローカルを優先、そうでなければサーバーデータを正として採用
        let finalCart = isDirty
            ? JSON.parse(JSON.stringify(loadScopedData('manekin_cart', [], targetUserId)))
            : [...serverItems];
        // ↓ 後からサーバーへ書き戻す必要があるかどうかのフラグ
        let needPushToServer = isDirty;

        // ↓ ゲストカートから引き継ぐ商品がある場合は加算マージします
        if (mergeItems.length > 0) {
            // ↓ 各引き継ぎ商品をループ
            mergeItems.forEach(item => {
                // ↓ 既存品と重複するか検索
                const idx = finalCart.findIndex(c => c.id === item.id && c.color === item.color && c.size === item.size);
                // ↓ 重複があれば数量を足し算、なければ新規追加
                if (idx > -1) {
                    // ↓ 数量合算
                    finalCart[idx].quantity = (finalCart[idx].quantity || 1) + (item.quantity || 1);
                } else {
                    // ↓ 新規追加
                    finalCart.push({ ...item });
                }
            });
            // ↓ マージが発生したためサーバー側DBも更新が必要
            needPushToServer = true;
        }

        // ↓ 最終決定したカートをAppStateとlocalStorageに保存
        AppState.cart = finalCart;
        // ↓ アカウント固有キーへ書き込み
        saveScopedData('manekin_cart', AppState.cart, targetUserId);
        // ↓ ヘッダーバッジ更新
        updateCartBadge();
        // ↓ レジ画面表示中なら画面リフレッシュ
        if (window.location.hash === '#checkout' && typeof renderCheckoutPage === 'function') {
            // ↓ レジ再描画
            renderCheckoutPage();
        }

        // ↓ ローカル側が更新された場合は即座にMySQLへ同期送信
        if (needPushToServer) {
            // ↓ DBへ送信完了を待ちます
            await syncCartToBackend();
        }
    // ↓ 通信エラー時はローカルデータを壊さず待機メッセージだけログ出力
    } catch (e) {
        // ↓ 開発用ログ出力
        console.log('MySQLカート同期待機中 (アカウント別ローカルストレージを使用)');
    }
}

// ↓ ヘッダー右上のカートアイコン右肩に付く「合計点数バッジ」を再計算して更新する関数
function updateCartBadge() {
    // ↓ 万が一配列でなければ空配列に補正
    if (!AppState.cart || !Array.isArray(AppState.cart)) {
        // ↓ 空配列化
        AppState.cart = [];
    }
    // ↓ 全商品のquantityを合計(reduceで順番に足し合わせ)
    const totalCount = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    // ↓ バッジDOM要素を取得
    const cartBadge = document.getElementById('header-cart-badge');
    // ↓ 数値が異常(NaN)なら0、正常ならその数字を表示
    if (cartBadge) {
        // ↓ バッジ文字更新
        cartBadge.textContent = isNaN(totalCount) ? 0 : totalCount;
    }
}

// ↓ 商品詳細ページの「ショッピングバッグに追加する」ボタンが押された時の処理
function handleAddToCartFromDetail(productId) {
    // ↓ 対象商品のマスターデータを検索
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);
    // ↓ 見つからなければ終了
    if (!product) return;

    // ↓ 現在選ばれている色に応じた商品写真URLを決定
    const currentImg = (product.colorImages && product.colorImages[AppState.selectedColor]) || product.image;

    // ↓ すでに同じ商品ID・同じ色・同じサイズでカートに入っていないかインデックス検索
    const existingIndex = AppState.cart.findIndex(
        item => item.id === product.id && item.color === AppState.selectedColor && item.size === AppState.selectedSize
    );

    // ↓ すでにある場合は数量を +1 するだけ
    if (existingIndex > -1) {
        // ↓ 数量インクリメント
        AppState.cart[existingIndex].quantity += 1;
    // ↓ 新しい色・サイズ・商品の場合はカート配列末尾に新規追加
    } else {
        // ↓ 商品オブジェクトをカート形式にして追加
        AppState.cart.push({
            // ↓ 商品ID
            id: product.id,
            // ↓ 商品名
            name: product.name,
            // ↓ カテゴリ名
            category: product.category || 'TOPS',
            // ↓ 選択色
            color: AppState.selectedColor,
            // ↓ 選択サイズ
            size: AppState.selectedSize,
            // ↓ 単価
            price: product.price,
            // ↓ 数量1
            quantity: 1,
            // ↓ 画像URL
            image: currentImg
        });
    }

    // ↓ アカウント別にlocalStorageへ即保存
    saveScopedData('manekin_cart', AppState.cart);
    // ↓ ヘッダーバッジの数字を最新化
    updateCartBadge();
    // ↓ ログイン中なら裏側でMySQLへ同期送信
    syncCartToBackend();
    // ↓ 追加完了トーストを表示
    showToast(`「${product.name} (${AppState.selectedColor}/${AppState.selectedSize})」をバッグに追加しました`);
}

// ↓ 商品詳細ページの「今すぐ購入する」ボタンが押された時の処理
function handleBuyNow(productId) {
    // ↓ まず通常通り商品をカートに追加
    handleAddToCartFromDetail(productId);
    // ↓ 未ログインユーザーの場合は購入後ページ名を予約してログイン画面へ誘導
    if (!AppState.currentUser) {
        // ↓ ログイン完了後に自動で '#checkout' へ飛ばす予約フラグをセット
        AppState.pendingAuthTarget = 'checkout';
        // ↓ 注意メッセージを表示
        showToast('⚠️ ご購入には会員登録またはログインが必要です');
        // ↓ ログインページへ遷移
        window.location.hash = '#login';
        // ↓ 処理中断
        return;
    }
    // ↓ すでにログイン済みならそのままチェックアウト画面へ遷移
    window.location.hash = '#checkout';
}

// ↓ レジ画面上の「-」「+」ボタンで商品の個数を変更する関数（0以下になったらカートから自動削除）
function updateCartItemQty(index, delta) {
    // ↓ 指定番号の商品が存在しなければ終了
    if (!AppState.cart[index]) return;
    // ↓ delta(+1 または -1)を加算
    AppState.cart[index].quantity += delta;
    // ↓ 個数が0以下になった場合はspliceで配列から取り除きます
    if (AppState.cart[index].quantity <= 0) {
        // ↓ 該当インデックスを1件削除
        AppState.cart.splice(index, 1);
    }
    // ↓ 保存・バッジ・画面再描画・DB同期を一気に実行
    saveScopedData('manekin_cart', AppState.cart);
    // ↓ ヘッダー個数更新
    updateCartBadge();
    // ↓ レジ金額明細を再計算・再描画
    renderCheckoutPage();
    // ↓ MySQLへ同期
    syncCartToBackend();
}

// ↓ レジ画面の各行にある「削除」ボタンで指定商品を丸ごと取り消す関数
function removeCartItem(index) {
    // ↓ 指定商品がなければ終了
    if (!AppState.cart[index]) return;
    // ↓ 配列から削除
    AppState.cart.splice(index, 1);
    // ↓ 保存・バッジ・画面再描画・DB同期・トースト通知
    saveScopedData('manekin_cart', AppState.cart);
    // ↓ バッジ更新
    updateCartBadge();
    // ↓ レジ再描画
    renderCheckoutPage();
    // ↓ MySQLへ同期
    syncCartToBackend();
    // ↓ 削除通知表示
    showToast('バッグから商品を削除しました');
}

// ↓ ご注文手続き(チェックアウト)ページ全体を描画し、空表示・商品リスト・初期宛先・ポイント割引計算を行う関数
function renderCheckoutPage() {
    // ↓ カート一覧エリアを取得
    const cartListEl = document.getElementById('checkout-cart-list');
    // ↓ 小計表示要素
    const subtotalEl = document.getElementById('checkout-subtotal');
    // ↓ 送料表示要素
    const shippingEl = document.getElementById('checkout-shipping');
    // ↓ 消費税表示要素
    const taxEl = document.getElementById('checkout-tax');
    // ↓ 合計金額表示要素
    const totalEl = document.getElementById('checkout-total');
    // ↓ 入力フォーム2カラム全体枠
    const mainLayout = document.getElementById('checkout-layout-main');
    // ↓ 注文完了画面枠
    const completedView = document.getElementById('order-completed-view');

    // ↓ 毎回レジを開いた直後は完了画面を隠して購入フォーム側を表示状態に戻します
    if (completedView) completedView.style.display = 'none';
    // ↓ 購入レイアウトをCSS Grid表示に戻します
    if (mainLayout) mainLayout.style.display = 'grid';

    // ↓ カートが空っぽの場合は「商品が入っていません」メッセージを表示して確定ボタンを無効化
    if (AppState.cart.length === 0) {
        // ↓ 空案内HTMLをセット
        if (cartListEl) {
            // ↓ 空表示テンプレート挿入
            cartListEl.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <p style="margin-bottom: 16px; font-weight: 600;">ショッピングバッグに商品が入っていません。</p>
                    <a href="#items" class="btn btn-primary">商品を探す</a>
                </div>
            `;
        }
        // ↓ 右側金額欄をすべて¥0にリセット
        if (subtotalEl) subtotalEl.textContent = "¥0";
        // ↓ 送料¥0
        if (shippingEl) shippingEl.textContent = "¥0";
        // ↓ 税¥0
        if (taxEl) taxEl.textContent = "¥0";
        // ↓ 合計¥0
        if (totalEl) totalEl.textContent = "¥0";
        // ↓ 注文確定ボタンを押せない(disabled)ように無効化
        const placeBtn = document.getElementById('btn-place-order');
        // ↓ ボタン無効化
        if (placeBtn) placeBtn.disabled = true;
        // ↓ 空のため以降のポイント計算はせず終了
        return;
    }

    // ↓ 商品が入っているなら「注文を確定する」ボタンを有効化
    const placeBtn = document.getElementById('btn-place-order');
    // ↓ 押せるようにする
    if (placeBtn) placeBtn.disabled = false;

    // ↓ カート内全商品の数量増減・削除付き明細行を生成して挿入
    if (cartListEl) {
        // ↓ mapで各行のHTML文字列を作りjoin('')で結合
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

    // チェックアウト時の氏名・メール自動補完（空欄のときだけログイン会員情報からプリセット）
    if (AppState.currentUser) {
        // ↓ 氏名欄要素
        const orderName = document.getElementById('order-name');
        // ↓ メール欄要素
        const orderEmail = document.getElementById('order-email');
        // ↓ 未入力なら会員氏名を自動入力
        if (orderName && !orderName.value.trim() && AppState.currentUser.name) {
            // ↓ 会員氏名をセット
            orderName.value = AppState.currentUser.name;
        }
        // ↓ 未入力なら会員メールアドレスを自動入力
        if (orderEmail && !orderEmail.value.trim() && AppState.currentUser.email) {
            // ↓ 会員メールをセット
            orderEmail.value = AppState.currentUser.email;
        }
    }
    // ↓ 合計金額・送料・使用ポイント・獲得予定ポイントのリアルタイム再計算を呼び出し
    updateCheckoutCalculations();
}

// ==============================================================================
// 7. ポイント管理 & チェックアウト計算（1pt = 1円）
// ==============================================================================

// ユーザーの保有ポイント取得ヘルパー
function getUserPoints() {
    // ↓ 未ログインなら保有ポイント0を返します
    if (!AppState.currentUser) return 0;
    // ↓ もし旧データ等でpoints項目が無い場合は会員特典の初期1000ポイントを補完
    if (AppState.currentUser.points === undefined || AppState.currentUser.points === null) {
        AppState.currentUser.points = 1000; // 初期ボーナス付与
        // ↓ ユーザー情報ごとlocalStorageへ保存
        localStorage.setItem('manekin_user', JSON.stringify(AppState.currentUser));
    }
    // ↓ 現在の保有ポイント数を返却
    return AppState.currentUser.points;
}

// ユーザーの保有ポイント更新ヘルパー（使用減算・還元加算後に呼ばれ画面表示も同期）
function setUserPoints(points) {
    // ↓ 未ログインなら何もしない
    if (!AppState.currentUser) return;
    // ↓ マイナスにならないよう0以上(Math.max)で丸めて更新
    AppState.currentUser.points = Math.max(0, points);
    // ↓ 最新の保有ポイントをmanekin_userへ保存
    localStorage.setItem('manekin_user', JSON.stringify(AppState.currentUser));

    // マイページ上のポイント表示カードも即座に書き換え
    const mypagePoints = document.getElementById('mypage-points');
    // ↓ 要素が存在すれば最新ポイントを表示
    if (mypagePoints) {
        // ↓ カンマ区切り＋pt単位で描画
        mypagePoints.innerHTML = `${AppState.currentUser.points.toLocaleString()} <span class="stat-unit">pt</span>`;
    }
}

// チェックアウト画面で現在「何ポイント使うつもりか」を一時記憶する変数
let checkoutUsedPoints = 0;

/**
 * チェックアウトサマリー計算・更新ヘルパー
 */
// ↓ カート合計・配送料・利用ポイント割引・最終お支払額・1%還元予定ポイントを一括計算してUIを更新する関数
function updateCheckoutCalculations() {
    // ↓ 各表示パーツのDOM要素を取得
    const subtotalEl = document.getElementById('checkout-subtotal');
    // ↓ 配送料表示欄
    const shippingEl = document.getElementById('checkout-shipping');
    // ↓ 消費税表示欄
    const taxEl = document.getElementById('checkout-tax');
    // ↓ 最終支払額表示欄
    const totalEl = document.getElementById('checkout-total');
    // ↓ ポイント割引行のコンテナ
    const pointDiscountRow = document.getElementById('checkout-point-discount-row');
    // ↓ ポイント割引金額欄
    const pointDiscountEl = document.getElementById('checkout-point-discount');
    // ↓ 獲得予定ポイント表示欄
    const earnedPointsEl = document.getElementById('checkout-earned-points');
    // ↓ 保有ポイント残高バッジ
    const userPointsEl = document.getElementById('checkout-user-points');
    // ↓ ポイント利用数入力ボックス
    const pointInput = document.getElementById('checkout-use-points');
    // ↓ ポイント注記メッセージ
    const pointMessage = document.getElementById('checkout-point-message');

    // ↓ 商品小計 = 各商品の(単価 × 数量)の合計
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // ↓ 送料判定：5,000円以上なら送料無料(0円)、未満なら550円
    const shipping = subtotal >= 5000 ? 0 : 550;
    // ↓ 割引前の総額
    const grossTotal = subtotal + shipping;

    // ↓ 現在の保有ポイント残高を取得して表示
    const availablePoints = getUserPoints();
    // ↓ 「保有ポイント: 〇 pt」を更新
    if (userPointsEl) userPointsEl.textContent = availablePoints.toLocaleString();

    // 利用可能ポイント上限（保有ポイントと支払総額の小さい方を超えられないように制限）
    const maxUsable = Math.min(availablePoints, grossTotal);

    // ↓ 上限を超えて入力された場合は自動で使える上限値に切り詰めます
    if (checkoutUsedPoints > maxUsable) {
        // ↓ 上限値に補正
        checkoutUsedPoints = maxUsable;
    }
    // ↓ 負の数が来た場合は0に補正
    if (checkoutUsedPoints < 0) {
        // ↓ 0に補正
        checkoutUsedPoints = 0;
    }

    // ↓ キーボード入力中（フォーカス中）でない時は、入力欄の数字も上限補正後の正しい値に同期
    if (pointInput && document.activeElement !== pointInput) {
        // ↓ 0のときは空文字にしてプレースホルダー0を見せる
        pointInput.value = checkoutUsedPoints > 0 ? checkoutUsedPoints : '';
    }

    // ↓ 割引適用後の実質お支払い金額（最低0円）
    const netTotal = Math.max(0, grossTotal - checkoutUsedPoints);
    // ↓ 内税10%分の参考消費税額（総額 ÷ 1.1 × 0.1）を四捨五入で算出
    const tax = Math.round(netTotal * 10 / 110);

    // 今回獲得ポイント: 実質支払い金額の1%（端数切り捨て、1円でも支払いがあれば最低1pt保証）
    const earnedPoints = netTotal > 0 ? Math.max(1, Math.floor(netTotal * 0.01)) : 0;

    // ↓ 各UI欄にフォーマットした金額を表示
    if (subtotalEl) subtotalEl.textContent = `¥${subtotal.toLocaleString()}`;
    // ↓ 送料欄（0円の時は「無料」ラベル）
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "無料 (5,000円以上)" : `¥${shipping.toLocaleString()}`;
    // ↓ 消費税欄
    if (taxEl) taxEl.textContent = `¥${tax.toLocaleString()}`;
    // ↓ お支払い合計金額欄
    if (totalEl) totalEl.textContent = `¥${netTotal.toLocaleString()}`;

    // ↓ 1pt以上使う時だけ赤い「ポイント利用割引 -¥〇〇」行を画面に表示します
    if (pointDiscountRow && pointDiscountEl) {
        // ↓ 利用ポイントがあるかチェック
        if (checkoutUsedPoints > 0) {
            // ↓ 行を表示
            pointDiscountRow.style.display = 'flex';
            // ↓ 値引き額をセット
            pointDiscountEl.textContent = `-¥${checkoutUsedPoints.toLocaleString()}`;
        } else {
            // ↓ 利用0なら行を隠す
            pointDiscountRow.style.display = 'none';
        }
    }

    // ↓ 右側カードの獲得予定ポイントを書き換え
    if (earnedPointsEl) {
        // ↓ +〇〇 pt 表示
        earnedPointsEl.textContent = `+${earnedPoints.toLocaleString()} pt`;
    }

    // ↓ ポイントカードのメッセージ文を更新（適用中は緑色で残り残高も提示）
    if (pointMessage) {
        // ↓ 利用中の場合
        if (checkoutUsedPoints > 0) {
            // ↓ 割引額と残ポイントを緑強調表示
            pointMessage.innerHTML = `<span style="color: #059669; font-weight: 700;">✓ ${checkoutUsedPoints.toLocaleString()} pt（${checkoutUsedPoints.toLocaleString()}円引き）を適用中</span>（残り: ${(availablePoints - checkoutUsedPoints).toLocaleString()} pt）`;
        // ↓ 未使用の場合
        } else {
            // ↓ 標準説明テキストへ戻す
            pointMessage.textContent = '1ポイント＝1円として、今回のお買い物代金にそのままご利用いただけます。';
        }
    }

    // ↓ 計算結果一式を呼び出し元（注文確定処理など）でも再利用できるようオブジェクトで返却
    return { subtotal, shipping, grossTotal, usedPoints: checkoutUsedPoints, netTotal, earnedPoints };
}

// ↓ ポイント入力欄に数字が打ち込まれるたび(oninput)呼ばれるイベントハンドラ
function handlePointsInputChange() {
    // ↓ 入力ボックス要素を取得
    const pointInput = document.getElementById('checkout-use-points');
    // ↓ 文字列を10進数整数に変換（数字でなければ0にフォールバック）
    const val = parseInt(pointInput ? pointInput.value : 0, 10) || 0;
    // ↓ 0以上になるようセットして再計算を実行
    checkoutUsedPoints = Math.max(0, val);
    // ↓ 上限チェックと画面反映を実施
    updateCheckoutCalculations();
}

// ↓ 「全額使う」ボタンが押された時に、保有ポイントと注文総額のうち小さい方(最大適用可能額)を自動セットする関数
function handleUseAllPoints() {
    // ↓ カートの商品合計金額を算出
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // ↓ 5,000円以上送料無料判定で送料を決定
    const shipping = subtotal >= 5000 ? 0 : 550;
    // ↓ 割引前お支払総額を計算
    const grossTotal = subtotal + shipping;
    // ↓ ログイン会員の現在保有ポイントを取得
    const available = getUserPoints();

    // ↓ ポイントが0なら警告通知だけ出して終了
    if (available <= 0) {
        // ↓ 案内トースト表示
        showToast('現在ご利用可能な保有ポイントはありません');
        // ↓ 終了
        return;
    }

    // ↓ 保有ポイントと購入総額の小さい方を最大利用額に設定
    checkoutUsedPoints = Math.min(available, grossTotal);
    // ↓ 入力欄の表示値も同期
    const pointInput = document.getElementById('checkout-use-points');
    // ↓ 要素があれば値をセット
    if (pointInput) pointInput.value = checkoutUsedPoints;
    // ↓ 割引後の請求金額と還元予定ポイントを再計算
    updateCheckoutCalculations();
    // ↓ 適用完了メッセージ表示
    showToast(`✨ 保有ポイントから ${checkoutUsedPoints.toLocaleString()} pt（${checkoutUsedPoints.toLocaleString()}円分）を適用しました`);
}

// ↓ 「取消」ボタンが押された時にポイント利用を0ptへ戻す関数
function handleResetPoints() {
    // ↓ 利用ポイントを0にクリア
    checkoutUsedPoints = 0;
    // ↓ 入力ボックスも空欄へクリア
    const pointInput = document.getElementById('checkout-use-points');
    // ↓ 値を空に
    if (pointInput) pointInput.value = '';
    // ↓ 請求額を再計算
    updateCheckoutCalculations();
    // ↓ 取消通知を表示
    showToast('ポイント利用を取り消しました');
}

/**
 * 過去の注文履歴から手動でクローゼットへ同期する
 */
// ↓ マイページの注文履歴行などから、購入済み商品を後から手動でマイクローゼットへ登録する補助関数
async function importOrderToCloset(idx) {
    // ↓ 未ログインなら実行不可
    if (!AppState.currentUser) {
        // ↓ 警告トースト
        showToast('⚠️ ログインが必要です');
        // ↓ 終了
        return;
    }
    // ↓ 注文履歴配列から該当インデックスの注文データを取得
    const order = AppState.orderHistory[idx];
    // ↓ サーバー由来(items_detail)またはローカル由来(items)の商品明細配列を取り出し
    const itemsList = (order && (order.items || order.items_detail)) ? (order.items || order.items_detail) : [];
    // ↓ 注文データや明細が空なら何もしない
    if (!order || itemsList.length === 0) return;

    // ↓ APIベースURLを取得
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    // ↓ 現在ログイン中のユーザーID
    const userId = AppState.currentUser.id;
    // ↓ 新規追加できた点数のカウント
    let added = 0;
    // ↓ 追加処理中にGET同期で上書きされないよう変更世代を進める
    if (typeof bumpClosetMutationSeq === 'function') bumpClosetMutationSeq();

    // ↓ 注文に含まれる各商品を1点ずつチェック
    for (let i = 0; i < itemsList.length; i++) {
        // ↓ 商品明細オブジェクト
        const it = itemsList[i];
        // ↓ 商品名
        const itName = it.name || it.product_name || '購入商品';
        // ↓ カラー名
        const itColor = it.color || 'BLACK';
        // ↓ 商品ID
        const itId = it.id || it.product_id || Date.now();
        // ↓ 商品マスターからカテゴリ等を補完するため検索
        const productMaster = (typeof SAMPLE_PRODUCTS !== 'undefined') ? SAMPLE_PRODUCTS.find(p => p.id === itId) : null;
        // ↓ カテゴリ決定
        const itCategory = it.category || (productMaster ? productMaster.category : 'TOPS');
        // ↓ 商品画像パス（未記録時は標準シャツ画像）
        const itImg = it.image || it.image_url || 'assets/images/men/スカイオックスフォードシャツ.png';
        // ↓ 単価
        const itPrice = it.price || it.unit_price || 0;

        // ↓ すでに同じ名前＋色の服がクローゼットに無いか重複確認
        const exists = AppState.myCloset.some(c => c.name === itName && c.color === itColor);
        // ↓ 未登録ならマイクローゼットアイテムとして新規作成しMySQLへも送信
        if (!exists) {
            // ↓ 購入品アイテムオブジェクトを構築（サーバー側と同じID命名規則）
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
            // ↓ クローゼット先頭に追加
            AppState.myCloset.unshift(newItem);
            // ↓ 件数インクリメント
            added++;

            // ↓ バックエンドの /api/closet/add へPOST送信
            try {
                // ↓ MySQLクローゼットテーブルへ永続化
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
            // ↓ オフライン等で送信失敗時は未送信マークを付けて後で一括同期できるようにします
            } catch (e) {
                // ↓ 未同期フラグ設定
                newItem.offlinePending = true;
            }
        }
    }
    // ↓ アカウント別localStorageを更新保存
    saveScopedData('manekin_my_closet', AppState.myCloset, userId);

    // ↓ 1件以上追加できたかどうかに応じて結果を通知
    if (added > 0) {
        // ↓ 登録成功トースト
        showToast(`👗 注文商品をマイクローゼットに登録・MySQL保存しました（${added}点）`);
    } else {
        // ↓ 既登録通知
        showToast('この注文の商品はすでにマイクローゼットに登録済みです');
    }
}

// ↓ 「注文を確定する」ボタン押下時に動く購入トランザクション関数（検証→MySQL送信→ポイント精算→自動クローゼット登録→完了画面表示）
async function handlePlaceOrder() {
    // ↓ カートが空なら警告して中断
    if (AppState.cart.length === 0) {
        // ↓ 空バッグ警告
        showToast('バッグに商品が入っていません');
        // ↓ 中断
        return;
    }

    // 未ログインの場合は購入不可とし、ログイン・会員登録画面へ誘導（完了後に自動で戻す予約を記憶）
    if (!AppState.currentUser) {
        // ↓ 認証後の戻り先を予約
        AppState.pendingAuthTarget = 'checkout';
        // ↓ メッセージ表示
        showToast('⚠️ ご購入には会員登録またはログインが必要です');
        // ↓ ログインページへ移動
        window.location.hash = '#login';
        // ↓ 中断
        return;
    }

    // ↓ 入力フォームの各欄DOM要素を取得
    const nameInput = document.getElementById('order-name');
    // ↓ 電話番号入力欄
    const phoneInput = document.getElementById('order-phone');
    // ↓ メール入力欄
    const emailInput = document.getElementById('order-email');
    // ↓ 郵便番号入力欄
    const postalInput = document.getElementById('order-postal');
    // ↓ 住所入力欄
    const addressInput = document.getElementById('order-address');
    // ↓ 配送希望時間帯セレクト欄
    const deliveryTimeInput = document.getElementById('order-delivery-time');
    // ↓ 選択中の支払い方法ラジオボタンを取得
    const paymentRadio = document.querySelector('input[name="payment_method"]:checked');

    // ↓ 各入力値の前後空白をtrim()で除去して取り出し
    const customerName = nameInput ? nameInput.value.trim() : "";
    // ↓ 電話番号文字列
    const phone = phoneInput ? phoneInput.value.trim() : "";
    // ↓ メールアドレス文字列
    const email = emailInput ? emailInput.value.trim() : "";
    // ↓ 郵便番号文字列
    const postal = postalInput ? postalInput.value.trim() : "";
    // ↓ ご住所文字列
    const address = addressInput ? addressInput.value.trim() : "";
    // ↓ 配送希望時間帯
    const deliveryTime = deliveryTimeInput ? deliveryTimeInput.value : "指定なし";
    // ↓ 選択決済方法
    const paymentMethod = paymentRadio ? paymentRadio.value : "クレジットカード";

    // ↓ 必須項目のお名前・住所・メールが空でないかを簡易バリデーション
    if (!customerName || !address || !email) {
        // ↓ 未入力エラーを通知
        showToast('お名前、ご住所、メールアドレスを入力してください');
        // ↓ 確定処理中断
        return;
    }

    // ↓ 二重注文（連打）を防ぐため確定ボタンを処理中は無効化して文言変更
    const placeBtn = document.getElementById('btn-place-order');
    // ↓ ボタンがあれば処理中状態にロック
    if (placeBtn) {
        // ↓ クリック無効化
        placeBtn.disabled = true;
        // ↓ 「注文を確定中...」へ一時書き換え
        placeBtn.innerHTML = '<span class="order-btn-text">注文を確定中... (MySQLへ保存)</span>';
    }

    // ↓ 最新の小計・送料・利用ポイント・最終金額・獲得予定ポイントを確定計算
    const calc = updateCheckoutCalculations();

    // ↓ ログイン中アカウントIDを取得
    const targetUserId = AppState.currentUser.id;
    // ↓ Python API (/api/orders) へPOST送信するJSONペイロードを組み立て
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
        user_id: targetUserId,
        items: AppState.cart
    };

    // ↓ サーバーURL
    const apiBase = getApiBaseUrl();
    // ↓ 確定後の注文データ受け取り変数
    let confirmedOrder = null;
    // ↓ サーバーMySQL側で正しく計算・保存された最新の保有ポイントを受け取る変数
    let backendUpdatedPoints = null;

    // 進行中のカート同期が完了してから注文を送信（直前のカート同期が注文後のMySQLカートクリアを上書きしないように保護）
    bumpCartUserSeq(targetUserId);
    // ↓ 注文一覧変更世代もカウントアップ
    _ordersMutationSeq++;
    // ↓ 前のカート同期が終わるのを待ってから注文確定APIを叩きます
    try { await _cartSyncPromise; } catch (e) {}

    // ↓ サーバーの注文確定トランザクションAPI (POST /api/orders) を実行
    try {
        // ↓ 注文内容一式をJSON送信
        const response = await fetch(`${apiBase}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        // ↓ HTTP 200/201 ならMySQL保存・ポイント処理・カートクリア・自動クローゼット登録までサーバー完了
        if (response.ok) {
            // ↓ レスポンスJSONを取得
            const data = await response.json();
            // ↓ DB確定済みの注文データを取得
            confirmedOrder = data.order;
            // ↓ サーバーが計算した残高ポイントがあれば受け取り
            if (data.updated_points !== undefined && data.updated_points !== null) {
                // ↓ サーバー正値ポイントを採用
                backendUpdatedPoints = data.updated_points;
            }
        // ↓ 4xx/5xxエラーはオフラインフォールバックへ分岐
        } else {
            // ↓ 例外を送出してcatch側へ
            throw new Error("APIレスポンスエラー");
        }
    // ↓ サーバー停止時・通信断時はLocalStorageフォールバックとして仮確定注文を生成
    } catch (err) {
        // ↓ 今日の日付をYYYYMMDD形式で取得
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        // ↓ 4桁のランダム数字を生成
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        // ↓ 未送信フラグ(offlinePending: true)付きの一時注文データを作成
        confirmedOrder = {
            order_no: `ORD-${todayStr}-${randomNum}`,
            user_id: targetUserId,
            offlinePending: true,
            date: new Date().toLocaleDateString('ja-JP') + " " + new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            customer_name: customerName,
            customer_email: email,
            address: address,
            total_amount: calc.netTotal,
            used_points: calc.usedPoints,
            earned_points: calc.earnedPoints,
            status: "注文受付・発送準備中",
            items: [...AppState.cart]
        };
    }

    // ↓ 注文一覧テーブル表示用の「商品名 (色/サイズ) × 個数」カンマ連結サマリー文字列を生成
    const itemSummaryList = confirmedOrder.items.map(it => `${it.name} (${it.color} / ${it.size}) × ${it.quantity}`);
    // ↓ 注文オブジェクトへ格納
    confirmedOrder.items_summary = itemSummaryList.join(", ");

    // 1. ポイント更新（利用ポイント減算 ＋ 今回獲得ポイント付与。サーバー応答値があればそれを優先）
    const currentPts = getUserPoints();
    // ↓ 新残高を確定
    const updatedPts = backendUpdatedPoints !== null ? backendUpdatedPoints : (Math.max(0, currentPts - calc.usedPoints) + calc.earnedPoints);
    // ↓ ユーザー情報・画面上の残高を更新
    setUserPoints(updatedPts);

    // 2. 【要件1】購入商品をマイクローゼットに自動保存！（MySQLのordersトリガー処理と同一のitem_uid命名規則）
    if (typeof bumpClosetMutationSeq === 'function') bumpClosetMutationSeq();
    // ↓ 購入商品一覧を複製
    const purchasedItems = [...confirmedOrder.items];
    // ↓ オフラインフォールバック注文だったかのフラグ
    const isOfflineOrder = !!confirmedOrder.offlinePending;
    // ↓ 新規登録件数カウンタ
    let addedCount = 0;
    // ↓ 購入アイテムごとにクローゼット重複チェック＋先頭追加を実施
    purchasedItems.forEach((it, idx) => {
        // ↓ 商品マスターからカテゴリを補完参照
        const productMaster = (typeof SAMPLE_PRODUCTS !== 'undefined') ? SAMPLE_PRODUCTS.find(p => p.id === (it.id || it.product_id)) : null;
        // ↓ カテゴリ決定
        const cat = it.category || (productMaster ? productMaster.category : 'TOPS');
        // ↓ 同じ商品名＋色が既にクローゼットにあるか判定
        const exists = AppState.myCloset.some(c => c.name === it.name && c.color === it.color);
        // ↓ 無ければ購入フラグ(isPurchased: true)付きでマイクローゼットに追加
        if (!exists) {
            // ↓ クローゼット項目オブジェクト組み立て
            const newClosetItem = {
                id: 'purchased-' + (it.id || it.product_id || 0) + '-' + confirmedOrder.order_no + '-' + idx,
                productId: it.id || it.product_id,
                name: it.name,
                category: cat,
                color: it.color || 'BLACK',
                season: '通年',
                image: it.image,
                isOwned: true,
                isPurchased: true,
                price: it.price,
                purchaseDate: new Date().toLocaleDateString('ja-JP'),
                ...(isOfflineOrder ? { offlinePending: true } : {})
            };
            // ↓ 配列先頭へ追加
            AppState.myCloset.unshift(newClosetItem);
            // ↓ 件数加算
            addedCount++;
        }
    });
    // ↓ 更新後のクローゼットをアカウント専用ストレージへ保存
    saveScopedData('manekin_my_closet', AppState.myCloset, targetUserId);

    // 3. 注文履歴配列の先頭へ今回の確定注文を追加・保存
    AppState.orderHistory.unshift(confirmedOrder);
    // ↓ アカウント専用注文履歴ストレージへ保存
    saveScopedData('manekin_orders', AppState.orderHistory, targetUserId);

    // 4. 購入完了したためショッピングカートを空にリセット
    AppState.cart = [];
    // ↓ 保存中カートデータを削除
    removeScopedData('manekin_cart', targetUserId);
    // ↓ オフライン注文ならカート空化も未同期(dirty)として記録、オンライン完了ならdirty解除
    if (isOfflineOrder) {
        // ↓ 同期保留フラグ立てる
        saveScopedData('manekin_cart_dirty', true, targetUserId);
    } else {
        // ↓ 同期不要フラグ消去
        removeScopedData('manekin_cart_dirty', targetUserId);
    }
    // ↓ ヘッダーのカート点数バッジを0へ更新
    updateCartBadge();
    // ↓ 使用予定ポイント変数を0へ初期化
    checkoutUsedPoints = 0;

    // ↓ ボタン文言と有効状態を次回注文のため元の状態へ復元
    if (placeBtn) {
        // ↓ ボタン再有効化
        placeBtn.disabled = false;
        // ↓ 元のラベルに戻す
        placeBtn.innerHTML = '<span class="order-btn-text">注文を確定する</span><span class="order-btn-sub">（Python &amp; MySQLへ保存されます）</span>';
    }

    // ↓ 注文完了(サンクス)画面の各DOM要素を取得
    const mainLayout = document.getElementById('checkout-layout-main');
    // ↓ 完了カード表示領域
    const completedView = document.getElementById('order-completed-view');
    // ↓ 完了番号表示欄
    const compOrderNo = document.getElementById('comp-order-no');
    // ↓ 注文日時表示欄
    const compOrderDate = document.getElementById('comp-order-date');
    // ↓ お届け先表示欄
    const compOrderAddress = document.getElementById('comp-order-address');
    // ↓ お支払い金額表示欄
    const compOrderTotal = document.getElementById('comp-order-total');
    // ↓ 獲得ポイント表示欄
    const compEarnedPoints = document.getElementById('comp-earned-points');
    // ↓ 最新保有残高表示欄
    const compBalancePoints = document.getElementById('comp-balance-points');
    // ↓ 自動クローゼット登録お知らせ文言
    const closetBannerMsg = document.getElementById('completed-closet-msg');

    // ↓ フォーム側を非表示にし、完了(サンクス)ビューを表示に切り替え
    if (mainLayout) mainLayout.style.display = 'none';
    // ↓ 完了ビューを表示
    if (completedView) completedView.style.display = 'block';

    // ↓ 注文明細値を完了カードの各行へ流し込み
    if (compOrderNo) compOrderNo.textContent = confirmedOrder.order_no;
    // ↓ 日時セット
    if (compOrderDate) compOrderDate.textContent = confirmedOrder.date;
    // ↓ 住所セット
    if (compOrderAddress) compOrderAddress.textContent = confirmedOrder.address;
    // ↓ 合計金額セット
    if (compOrderTotal) compOrderTotal.textContent = `¥${confirmedOrder.total_amount.toLocaleString()}`;
    // ↓ 獲得ポイントセット
    if (compEarnedPoints) compEarnedPoints.textContent = `+${calc.earnedPoints.toLocaleString()} pt`;
    // ↓ 更新後の最新保有ポイントセット
    if (compBalancePoints) compBalancePoints.textContent = `${updatedPts.toLocaleString()} pt`;
    
    // ↓ DB保存結果バッジを緑(MySQL完了)またはオレンジ(オフライン一時保存)に切り替え
    const compDbStatus = document.getElementById('comp-db-status');
    // ↓ 要素が存在すれば表示色を更新
    if (compDbStatus) {
        // ↓ DB保存が成功していれば緑完了表示
        if (backendUpdatedPoints !== null || confirmedOrder.order_id) {
            // ↓ 完了文言
            compDbStatus.textContent = '🟢 MySQL (manekin_db) 保存完了';
            // ↓ 淡い緑背景
            compDbStatus.style.background = '#dcfce7';
            // ↓ 緑文字
            compDbStatus.style.color = '#15803d';
        // ↓ オフライン時
        } else {
            // ↓ 一時保存注意文言
            compDbStatus.textContent = '⚠️ LocalStorage一時保存 (Python API停止中)';
            // ↓ 淡い黄背景
            compDbStatus.style.background = '#fef3c7';
            // ↓ 黄茶文字
            compDbStatus.style.color = '#b45309';
        }
    }

    // ↓ クローゼット自動保存バナー文言を購入商品名入りに更新
    if (closetBannerMsg && purchasedItems.length > 0) {
        // ↓ 商品名と点数をメッセージに埋め込み
        closetBannerMsg.textContent = `購入された「${purchasedItems[0].name}」など ${purchasedItems.length} 点をマイクローゼットに自動登録しました！スタジオで手持ち服との組み合わせや着せ替え比較をすぐにお試しいただけます。`;
    }

    // ↓ 画面右下に豪華完了トースト通知
    showToast(`🎉 ご注文確定！${calc.earnedPoints}ポイントを獲得し、商品をマイクローゼットに保存しました`);
}

// --------------------------------------------------------------------------
// 8. マイページ管理
// --------------------------------------------------------------------------
// ↓ 注文の確定・全消去が通信と競合しないよう追跡する世代番号カウンタ
let _ordersMutationSeq = 0;

// ↓ サーバー(MySQL)から現在ログイン中のアカウントの注文履歴のみを読み込んで反映する非同期関数
async function syncOrdersFromBackend() {
    // ↓ MySQL接続状態を示すマイページ内のピル要素を取得
    const statusPill = document.getElementById('mysql-status-pill');
    // ↓ APIベースURLを取得
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    // ↓ バックエンド通信とDB状態反映を実行
    try {
        // ↓ 未ログイン状態ならヘルスチェック(/api/health)だけ確認し、他人の注文を見せないよう履歴は空[]に統一
        if (!AppState.currentUser) {
            // ↓ ヘルスエンドポイント問い合わせ
            const hRes = await fetch(`${apiBase}/api/health`);
            // ↓ MySQL接続正常なら緑ピル表示
            if (hRes.ok && statusPill) {
                // ↓ 接続中テキスト
                statusPill.textContent = '🟢 MySQL (manekin_db) 接続中';
                // ↓ 緑背景
                statusPill.style.background = '#dcfce7';
                // ↓ 緑文字
                statusPill.style.color = '#15803d';
            }
            // ↓ ゲストは注文履歴空にリセットしてマイページ描画
            AppState.orderHistory = [];
            // ↓ マイページ描画
            renderMyPage();
            // ↓ 終了
            return;
        }

        // ↓ ログインユーザーのIDを取得
        const userId = AppState.currentUser.id;
        // ↓ MySQL管轄の数値IDでなければローカル履歴のまま再描画して終了
        if (!isServerUserId(userId)) {
            // ↓ マイページ再描画
            renderMyPage();
            // ↓ 終了
            return;
        }
        // ↓ 通信開始時の注文変更世代を記録
        const fetchStartSeq = _ordersMutationSeq;
        // ↓ 指定ユーザーIDの注文履歴のみを返すAPI (/api/orders?user_id=...) を呼び出し
        const response = await fetch(`${apiBase}/api/orders?user_id=${userId}`);
        // ↓ 通信成功時
        if (response.ok) {
            // ↓ JSONデータをパース
            const data = await response.json();
            // ↓ 通信待ちの間に別アカウントに切り替わっていたら結果を破棄（他人の注文混在を絶対防止）
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(userId)) return;
            // ↓ 通信中に新規注文や削除が起きて世代が変わっていたら古い取得結果を破棄
            if (fetchStartSeq !== _ordersMutationSeq) return;
            // ↓ ステータスピルを「MySQL 接続中」に更新
            if (statusPill) {
                // ↓ 接続中表記
                statusPill.textContent = '🟢 MySQL (manekin_db) 接続中';
                // ↓ 緑背景
                statusPill.style.background = '#dcfce7';
                // ↓ 緑文字
                statusPill.style.color = '#15803d';
            }
            // ↓ 注文配列が正常に返ってきた場合
            if (data.orders && Array.isArray(data.orders)) {
                // ↓ 古いデモ時代の一部のレガシーテストデータが残っていれば除外フィルタリング
                const validOrders = data.orders.filter(o => {
                    // ↓ null除け
                    if (!o) return false;
                    // ↓ サマリー文字列を取得
                    const summary = (o.items_summary || "");
                    // ↓ 旧初期ダミーデータに該当するかを判定
                    const isLegacyTshirt = summary.includes("プレミアム コットン リラックス Tシャツ") || summary.includes("リラックス Tシャツ") || summary.includes("item_tshirt");
                    // ↓ レガシーダミーではない注文だけ残します
                    return !isLegacyTshirt && o.order_no !== "ORD-2026-0982" && o.order_no !== "ORD-2026-0851";
                });
                // ローカルの一時オフライン未同期注文（同一アカウントのみ）があれば保持してマージ
                const offlineOrders = AppState.orderHistory.filter(localOrd =>
                    localOrd &&
                    localOrd.offlinePending === true &&
                    !localOrd.order_id &&
                    (!localOrd.user_id || String(localOrd.user_id) === String(userId)) &&
                    !validOrders.some(m => m.order_no === localOrd.order_no)
                );
                // ↓ 未同期注文を先頭、DB上の注文を続けて並べ、アカウント専用ストレージへ保存＋描画
                AppState.orderHistory = [...offlineOrders, ...validOrders];
                // ↓ localStorage保存
                saveScopedData('manekin_orders', AppState.orderHistory, userId);
                // ↓ マイページ画面を更新
                renderMyPage();
            }
        // ↓ HTTPエラー時
        } else {
            // ↓ エラー処理へ
            throw new Error('API response not ok');
        }
    // ↓ APIサーバー未起動・接続エラー時
    } catch (e) {
        // ↓ コンソールへ控えめログ
        console.log("MySQL注文履歴の同期待機中 (ローカルモード)");
        // ↓ ステータスピルをオレンジ色(LocalStorage稼働中)へ変更
        if (statusPill) {
            // ↓ ローカル稼働テキスト
            statusPill.textContent = '🟠 LocalStorage稼働中 (Python API未接続)';
            // ↓ 淡いオレンジ背景
            statusPill.style.background = '#fef3c7';
            // ↓ オレンジ茶文字
            statusPill.style.color = '#b45309';
            // ↓ マウスオーバー時の詳細ツールチップ
            statusPill.title = 'Pythonサーバー(app.py)が起動すると自動的にMySQL連携に切り替わります';
        }
    }
}

// ↓ マイページの「履歴をすべて初期化」ボタンでログイン会員の注文履歴のみを全削除する関数
async function handleClearOrderHistory() {
    // ↓ 未ログインなら拒否
    if (!AppState.currentUser) {
        // ↓ 警告トースト
        showToast('⚠️ ログインが必要です');
        // ↓ 終了
        return;
    }
    // ↓ 誤操作防止の確認ダイアログでキャンセルされたら何もしない
    if (!confirm('現在のアカウントのご注文履歴をすべて初期化して、0件にしますか？')) return;

    // ↓ 世代番号を進めて他通信の上書きを防ぎます
    _ordersMutationSeq++;
    // ↓ メモリ上の履歴を空に
    AppState.orderHistory = [];
    // ↓ アカウント別ストレージも空配列で上書き
    saveScopedData('manekin_orders', []);

    // ↓ サーバー側のMySQL ordersテーブルからも該当ユーザーのレコードをDELETEリクエストで削除
    try {
        // ↓ APIベースURL取得
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        // ↓ ユーザーID付きでDELETE実行
        await fetch(`${apiBase}/api/orders?user_id=${AppState.currentUser.id}`, { method: 'DELETE' });
    // ↓ 通信失敗時はコンソール警告
    } catch (e) {
        // ↓ 警告ログ
        console.warn('Backend orders delete failed', e);
    }

    // ↓ 画面を再描画して0件表示にし、完了トーストを表示
    renderMyPage();
    // ↓ トースト通知
    showToast('このアカウントのご注文履歴を初期化しました（0件）');
}

/**
 * LocalStorageに保存されている未同期データをMySQLへ一括反映する
 */
// async キーワードにより、内部で await（サーバー応答待ち）を使える非同期関数を定義します
async function handleSyncAllToMySQL() {
    // 未ログイン（currentUser が空）の場合は同期できないためログインページへ誘導します
    if (!AppState.currentUser) {
        // 画面下部に警告トースト通知を表示します
        showToast('⚠️ 同期を行うにはログインしてください');
        // URLの # 以降（ハッシュ）を書き換えてログイン画面へ移動します
        window.location.hash = '#login';
        // これ以降の同期処理を行わず関数を終了します
        return;
    }

    // file:// 閲覧または 8080 番以外のポートならローカルFlaskサーバーのURLを、そうでなければ相対パス '' を使います
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    // 接続確認開始のメッセージをトーストで通知します
    showToast('🔄 Pythonサーバー / MySQL接続確認中...');

    // 各データ種別ごとに何件新規同期できたかを数えるカウンター変数です
    let syncedOrders = 0;
    let syncedCloset = 0;
    let syncedOutfits = 0;

    // 通信失敗やサーバー停止時のエラーを捕まえて安全にメッセージを出すため try...catch で囲みます
    try {
        // 0. ヘルスチェック（Flask & MySQL稼働確認）
        // /api/health にGETリクエストを送り、サーバーの応答を待ちます
        const healthRes = await fetch(`${apiBase}/api/health`);
        // HTTPステータスが 200番台以外（失敗）だった場合は手動でエラーを発生させて catch ブロックへ飛ばします
        if (!healthRes.ok) {
            throw new Error('サーバーエラー');
        }
        // 応答ボディをJSON形式のオブジェクトに変換します
        const healthData = await healthRes.json();
        // Python側は動いていても MySQL が接続できていない状態をチェックします
        if (healthData.mysql !== 'connected') {
            // ユーザーに XAMPP で MySQL を起動するよう案内を出します
            showToast('⚠️ XAMPPでMySQLが起動していません。XAMPPコントロールパネルでMySQLをStartしてください。');
            // 同期を中断して抜けます
            return;
        }

        // ログイン中ユーザーの固有IDを変数に控えておきます（アカウント分離の基準キー）
        const userId = AppState.currentUser.id;

        // 1. 注文データの同期（重複防止・同一ユーザー限定のため order_no と sync_mode を送信）
        // 注文履歴配列が存在し、1件以上データがあるか確認します
        if (AppState.orderHistory && AppState.orderHistory.length > 0) {
            // for...of 文で注文履歴を1件ずつ順番に取り出します
            for (const order of AppState.orderHistory) {
                // 別アカウントの注文データが誤って混入していた場合（ID不一致）はスキップします
                if (order.user_id && String(order.user_id) !== String(userId)) continue;
                // items または items_detail プロパティから購入商品の明細配列を取り出します
                const itemsList = order.items || order.items_detail || [];
                // 商品明細が1つ以上ある注文のみサーバーへ送信します
                if (itemsList.length > 0) {
                    // 1件の送信失敗で全体の同期が止まらないよう、個別の try...catch で保護します
                    try {
                        // /api/orders へ POST で注文JSONを送ります
                        const res = await fetch(`${apiBase}/api/orders`, {
                            // データ登録用HTTPメソッド POST を指定します
                            method: 'POST',
                            // 送信データが JSON であることをヘッダーで知らせます
                            headers: { 'Content-Type': 'application/json' },
                            // JSオブジェクトをJSON文字列に変換して送信ボディに入れます
                            body: JSON.stringify({
                                // 重複登録を防ぐための注文番号
                                order_no: order.order_no,
                                // 同期モードフラグ（既存番号があればスキップするようサーバーへ指示）
                                sync_mode: true,
                                // 注文者名（欠損時は会員名またはデフォルト値で補完）
                                customer_name: order.customer_name || AppState.currentUser.name || '会員 様',
                                // メールアドレス（欠損時は現在会員のメール等で補完）
                                customer_email: order.customer_email || AppState.currentUser.email || 'user@manekin.com',
                                // 郵便番号・住所・電話番号などの配送情報（過去データ互換のためデフォルトあり）
                                postal_code: order.postal_code || '150-0001',
                                address: order.address || '東京都渋谷区',
                                phone: order.phone || '090-0000-0000',
                                payment_method: order.payment_method || 'クレジットカード',
                                delivery_time: order.delivery_time || '指定なし',
                                // 金額・ポイント内訳
                                subtotal: order.subtotal || order.total_amount || 0,
                                shipping_fee: order.shipping_fee || 0,
                                used_points: order.used_points || 0,
                                earned_points: order.earned_points || 0,
                                total_amount: order.total_amount || 0,
                                // 所有者を特定するためのユーザーID
                                user_id: userId,
                                // 購入した商品リスト配列
                                items: itemsList
                            })
                        });
                        // 送信が成功したら同期完了フラグを整理し、新規件数をカウントします
                        if (res.ok) {
                            // サーバーからのレスポンスJSONを取得します
                            const d = await res.json();
                            // 「未同期フラグ(offlinePending)」をオブジェクトから削除します
                            delete order.offlinePending;
                            // サーバー側に元々無かった新規注文だった場合のみカウントを +1 します
                            if (!d.already_exists) syncedOrders++;
                        }
                    } catch (e) {}
                }
            }
        }

        // 2. マイクローゼットの同期
        // クローゼット配列に1着以上登録されているかチェックします
        if (AppState.myCloset && AppState.myCloset.length > 0) {
            // 手持ち服を1着ずつ順番にループ処理します
            for (const item of AppState.myCloset) {
                // 各服の送信エラーが他へ波及しないよう try...catch で囲みます
                try {
                    // マイクローゼット追加APIへPOST送信します
                    const res = await fetch(`${apiBase}/api/closet/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            // 誰の服かを識別するユーザーID
                            user_id: userId,
                            // 服のユニークIDと元の商品ID（ブランド購入品の場合）
                            id: item.id,
                            productId: item.productId || null,
                            // 服の名前・カテゴリ・色・季節・画像（Base64等）
                            name: item.name,
                            category: item.category,
                            color: item.color,
                            season: item.season,
                            image: item.image,
                            // 手持ちフラグ・購入済みフラグ・価格・購入日
                            isOwned: item.isOwned,
                            isPurchased: item.isPurchased,
                            price: item.price || 0,
                            purchaseDate: item.purchaseDate || ''
                        })
                    });
                    // 成功時は未同期フラグを消し、同期数をカウントアップします
                    if (res.ok) {
                        delete item.offlinePending;
                        syncedCloset++;
                    }
                } catch (e) {}
            }
        }

        // 3. お気に入りの同期
        // お気に入り商品IDの配列が存在し空でない場合に同期APIを呼びます
        if (AppState.favorites && AppState.favorites.length > 0) {
            try {
                // ログイン中ユーザーのお気に入りID配列を丸ごとMySQLへ同期します
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
        // 保存済みコーディネート（ルックブック）配列にデータがある場合
        if (AppState.savedOutfits && AppState.savedOutfits.length > 0) {
            // 各コーデを1件ずつ取り出してサーバーへ保存リクエストを送ります
            for (const outfit of AppState.savedOutfits) {
                try {
                    // コーデ保存APIへPOST送信します
                    const res = await fetch(`${apiBase}/api/outfits/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            // 所有ユーザーIDとコーデID
                            user_id: userId,
                            id: outfit.id,
                            // タイトル・保存日・AIコメント・5部位アイテムのオブジェクト
                            title: outfit.title,
                            date: outfit.date,
                            comment: outfit.comment,
                            items: outfit.items
                        })
                    });
                    // 同期成功時はオフライン待機フラグを削除しカウントを増やします
                    if (res.ok) {
                        delete outfit.offlinePending;
                        syncedOutfits++;
                    }
                } catch (e) {}
            }
        }

        // 5. 会員ポイントの同期
        // 現在保持しているポイント残高を users テーブルへ反映させます
        if (AppState.currentUser) {
            try {
                // ユーザー同期APIへ現在のユーザーIDとポイント数を送信します
                await fetch(`${apiBase}/api/user/sync`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: userId,
                        points: getUserPoints()
                    })
                });
            } catch (e) {}
        }

        // 5.5 カートの同期（未送信変更またはローカルカートがある場合）
        // アカウント専用の LocalStorage に「カート未同期（dirty）」印があるか確認します
        const isCartDirty = loadScopedData('manekin_cart_dirty', false, userId) === true;
        // 未同期フラグが true か、カート内に商品が残っている場合はサーバーへ同期します
        if (isCartDirty || (AppState.cart && AppState.cart.length > 0)) {
            await syncCartToBackend();
        }

        // 5.6 スタジオ試着状態の同期（未送信変更または試着中・性別変更がある場合）
        // スタジオ状態に未送信の変更があるかフラグを読み込みます
        const isStudioDirty = loadScopedData('manekin_studio_dirty', false, userId) === true;
        // 5部位（outer, tops, bottoms, shoes, hat）のいずれか1つでも服を着ているか判定します
        const hasWornItems = Object.values(AppState.currentOutfit || {}).some(Boolean);
        // 未変更でない、試着中、または性別設定がデフォルトの MEN 以外のときにサーバーへ即時保存します
        if (isStudioDirty || hasWornItems || (AppState.studioGender && AppState.studioGender !== 'MEN')) {
            // studio.js が読み込まれており syncStudioStateToBackend 関数が存在するか確認してから呼びます
            if (typeof syncStudioStateToBackend === 'function') {
                await syncStudioStateToBackend({ immediate: true });
            }
        }

        // 6. MySQLから最新データを再取得
        // 送り終えたあと、サーバー側で正規化された最新データを各テーブルから取得して画面へ反映します
        await syncOrdersFromBackend();
        await syncFavoritesFromBackend();
        await syncCartFromBackend();
        // スタジオ側の各関数が定義されている場合のみ順番に最新取得を行います
        if (typeof syncClosetFromBackend === 'function') {
            await syncClosetFromBackend();
        }
        if (typeof syncOutfitsFromBackend === 'function') {
            await syncOutfitsFromBackend();
        }
        if (typeof syncStudioStateFromBackend === 'function') {
            await syncStudioStateFromBackend();
        }

        // すべての同期が完了した件数サマリーをトースト通知します
        showToast(`✨ MySQL連携完了！（新規注文:${syncedOrders}件, 服:${syncedCloset}点, コーデ:${syncedOutfits}件, カート/試着状態を保存）`);
    } catch (err) {
        // fetch がネットワークエラー等で失敗（Pythonサーバー未起動など）した場合の案内です
        showToast('⚠️ Pythonサーバー(ポート8080)が起動していません。start_server.bat または python app.py を起動してください');
    }
}

// マイページ画面（会員プロフィール・保有ポイント・注文履歴・お気に入り）を描画する関数です
function renderMyPage() {
    // HTML上のユーザー情報表示要素やテーブルのDOM参照を取得します
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

    // ログインしている場合はアカウント情報を画面に反映します
    if (AppState.currentUser) {
        // 名前を表示（無い場合は '会員 様'）
        if (userNameEl) userNameEl.textContent = AppState.currentUser.name || '会員 様';
        // メールアドレスを表示
        if (userEmailEl) userEmailEl.textContent = AppState.currentUser.email || '';
        // 名前の先頭1文字（charAt(0)）を丸いアバターアイコンの中央に表示します
        if (avatarEl) avatarEl.textContent = (AppState.currentUser.name || 'M').charAt(0);
        // 会員ランクを表示します
        if (rankEl) rankEl.textContent = AppState.currentUser.rank || 'REGULAR MEMBER';
        // 保有ポイントを3桁カンマ区切り（toLocaleString）で pt 単位を付けて表示します
        if (pointsEl) pointsEl.innerHTML = `${getUserPoints().toLocaleString()} <span class="stat-unit">pt</span>`;
        // アクションボタンを「ログアウト」ボタンに差し替えます
        if (actionsWrapper) {
            actionsWrapper.innerHTML = '<button class="btn btn-outline-sm" id="logout-btn" onclick="handleLogout()">ログアウト</button>';
        }
    } else {
        // 未ログイン（ゲスト）時の表示内容へ切り替えます
        if (userNameEl) userNameEl.textContent = 'ゲスト 様';
        if (userEmailEl) userEmailEl.textContent = 'ログインしていません';
        if (avatarEl) avatarEl.textContent = 'G';
        if (rankEl) rankEl.textContent = 'GUEST';
        if (pointsEl) pointsEl.innerHTML = `0 <span class="stat-unit">pt</span>`;
        // アクションボタンを「ログイン」画面へのリンクボタンにします
        if (actionsWrapper) {
            actionsWrapper.innerHTML = '<a href="#login" class="btn btn-outline-sm" id="mypage-action-btn">ログイン</a>';
        }
    }

    // 累計注文回数の表示を更新します
    if (orderCountEl) {
        // 配列かどうかを Array.isArray() で確認し、安全に要素数（length）を取得します
        const orderCount = Array.isArray(AppState.orderHistory) ? AppState.orderHistory.length : 0;
        orderCountEl.innerHTML = `${orderCount} <span class="stat-unit">回</span>`;
    }

    // お気に入り登録数の表示を更新します
    if (mypageFavCount) {
        const favCount = Array.isArray(AppState.favorites) ? AppState.favorites.length : 0;
        mypageFavCount.innerHTML = `${favCount} <span class="stat-unit">点</span>`;
    }

    // 購入履歴テーブル（tbody）の中身を組み立てます
    if (ordersTbody) {
        // 注文履歴がまだ0件のときは案内用の1行メッセージを出します
        if (!AppState.orderHistory || AppState.orderHistory.length === 0) {
            ordersTbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 32px; color: #777;">
                        購入履歴はまだありません。商品をお選びいただき購入手続きをお試しください。
                    </td>
                </tr>
            `;
        } else {
            // .map() で注文ごとの <tr> 行HTMLを作り、.join('') で1つの文字列に連結して挿入します
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

    // マイページ下部のお気に入りプレビューグリッドを更新します
    if (mypageFavGrid) {
        // お気に入りID一覧を取得します
        const favList = Array.isArray(AppState.favorites) ? AppState.favorites : [];
        // 全商品マスタ SAMPLE_PRODUCTS の中から、IDがお気に入りリストに含まれる商品だけ抽出（filter）します
        const favoriteItems = SAMPLE_PRODUCTS.filter(p => favList.includes(p.id));
        // お気に入りが0件ならプレースホルダー文言を表示します
        if (favoriteItems.length === 0) {
            mypageFavGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 24px; color: #777;">お気に入り登録された商品はありません。</p>';
        } else {
            // 最大4点まで（slice(0, 4)）商品カードHTMLを生成して表示します
            mypageFavGrid.innerHTML = favoriteItems.slice(0, 4).map(p => createProductCardHTML(p)).join('');
        }
    }
}

// --------------------------------------------------------------------------
// 9. お気に入り機能 (MySQL同期・アカウント完全分離対応)
// --------------------------------------------------------------------------
// 通信中に別操作や別ユーザー切替が起きたとき、古い取得結果で上書きしないための操作世代カウンターです
let _favoritesMutationSeq = 0;

// サーバー（MySQL）からログイン中ユーザー専用のお気に入りID一覧を取得して同期する関数です
async function syncFavoritesFromBackend() {
    // ログインしていない場合はサーバー通信せずバッジ表示のみ更新して戻ります
    if (!AppState.currentUser || !AppState.currentUser.id) {
        updateFavoriteBadges();
        return;
    }
    // リクエスト開始時点のユーザーIDを固定変数に保持します（途中でログアウト等されても判別できるように）
    const targetUserId = AppState.currentUser.id;
    // DB上に存在する正規の数値IDを持つユーザーでなければローカルのみの運用とします
    if (!isServerUserId(targetUserId)) {
        updateFavoriteBadges();
        return;
    }
    // 通信開始時の操作シーケンス番号を控えておきます
    const fetchStartSeq = _favoritesMutationSeq;
    try {
        // 環境に応じたAPIのベースURLを決定します
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        // 指定ユーザーIDに紐づくお気に入りリストをGETで取得します
        const res = await fetch(`${apiBase}/api/favorites?user_id=${targetUserId}`);
        // HTTPステータスが成功のときのみデータ処理を行います
        if (res.ok) {
            // JSONデータを解析します
            const data = await res.json();
            // 通信待ちの間に別ユーザーへログインし直されていたら古い結果を破棄します
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;
            // 通信待ちの間にユーザーがお気に入りボタンを押していた場合も、上書き事故を防ぐため結果を無視します
            if (fetchStartSeq !== _favoritesMutationSeq) return;
            // data.favorites が配列として返ってきたらアプリ状態と画面各所へ反映します
            if (Array.isArray(data.favorites)) {
                // アプリ全体状態のお気に入り一覧を更新します
                AppState.favorites = data.favorites;
                // アカウント別に隔離されたLocalStorage領域へも保存します
                saveScopedData('manekin_favorites', AppState.favorites, targetUserId);
                // ヘッダーなどの数字バッジを更新します
                updateFavoriteBadges();
                // 各ページのハート状態・表示リストがレンダリング可能なら再描画します
                if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
                if (typeof renderFavoriteProducts === 'function') renderFavoriteProducts();
                if (typeof renderHomeProducts === 'function') renderHomeProducts();
                if (typeof renderCatalogProducts === 'function') renderCatalogProducts();
                if (typeof renderNewItems === 'function') renderNewItems();
                if (typeof renderMyPage === 'function') renderMyPage();
            }
        }
    } catch (e) {}
}

// ハートアイコンがクリックされたとき、お気に入りの追加／解除をトグル（切り替え）する関数です
function handleToggleFavorite(productId) {
    // お気に入り状態を変更したことを記録するため世代カウンターを進めます
    _favoritesMutationSeq++;
    // 現在お気に入り配列の何番目にこの商品IDが入っているか調べます（無ければ -1）
    const index = AppState.favorites.indexOf(productId);
    // 追加か解除かを記録するフラグ変数です
    let isAdded = false;

    // すでに配列に含まれていれば（0以上なら）削除、無ければ末尾に追加します
    if (index > -1) {
        // index の位置から1要素だけ配列から取り除きます
        AppState.favorites.splice(index, 1);
        isAdded = false;
        showToast('お気に入りから解除しました');
    } else {
        // 配列の末尾へ商品IDを追加します
        AppState.favorites.push(productId);
        isAdded = true;
        showToast('お気に入りに追加しました');
    }

    // 変更後の配列をアカウントスコープ付きでLocalStorageに保存します
    saveScopedData('manekin_favorites', AppState.favorites);
    // ナビやアイコンのお気に入り件数バッジを更新します
    updateFavoriteBadges();
    // 画面上の同じ商品のハートボタン見た目をすべて一斉更新します
    syncAllFavoriteButtons(productId, isAdded);

    // ログイン中の場合のみ MySQL (favoritesテーブル) に該当ユーザー分として即時同期
    if (AppState.currentUser && AppState.currentUser.id) {
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        // トグルAPIに商品IDとユーザーIDを送り、バックグラウンドでDBへ反映します（失敗してもUIを止めない）
        fetch(`${apiBase}/api/favorites/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                user_id: AppState.currentUser.id
            })
        }).catch(() => {});
    }

    // スタジオ画面のブランドお気に入り一覧も即時同期
    if (typeof renderStudioBrandList === 'function') renderStudioBrandList();

    // 現在お気に入り一覧ページを開いているなら、解除したカードが消えるよう一覧を再描画します
    if (window.location.hash === '#favorites') {
        renderFavoriteProducts();
    }
}

// 画面内のあらゆる場所にある該当商品の「お気に入りハートボタン」の見た目を一括同期する関数です
function syncAllFavoriteButtons(productId, isFavorite) {
    // 同じ商品IDを持つ商品カード要素（トップ・カタログ等）をすべて取得します
    const cards = document.querySelectorAll(`.product-card[data-id="${productId}"]`);
    // 見つかったすべてのカードを1つずつ処理します
    cards.forEach(card => {
        // カード内のハートボタン（.fav-btn）を探します
        const btn = card.querySelector('.fav-btn');
        if (btn) {
            // お気に入り状態なら .is-favorite クラスを付け（赤塗り等）、そうでなければ外します
            if (isFavorite) {
                btn.classList.add('is-favorite');
            } else {
                btn.classList.remove('is-favorite');
            }
        }
    });

    // 商品詳細ページ（#item-detail）を開いていて、表示中の商品IDと一致する場合もボタンを更新します
    const detailFavBtn = document.getElementById('detail-fav-btn');
    if (detailFavBtn && AppState.currentDetailId === productId) {
        if (isFavorite) {
            detailFavBtn.classList.add('is-favorite');
            // 塗りつぶしハートSVG（fill="currentColor"）と解除テキストへ書き換えます
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 0z"></path>
                </svg>
                お気に入り解除
            `;
        } else {
            detailFavBtn.classList.remove('is-favorite');
            // 中抜きハートSVG（fill="none"）と追加テキストへ書き換えます
            detailFavBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                お気に入りに追加
            `;
        }
    }
}

// 画面上のお気に入り点数を示す各バッジ要素を現在の登録数で一括更新する関数です
function updateFavoriteBadges() {
    // お気に入り配列の長さ（件数）を取得します
    const count = AppState.favorites.length;
    // PCナビ・モバイルアイコン・マイページ・スタジオ・スマホタブにある各バッジ要素を取得します
    const navBadge = document.getElementById('nav-fav-badge');
    const iconBadge = document.getElementById('icon-fav-badge');
    const mypageFavCount = document.getElementById('mypage-fav-count');
    const studioFavBadge = document.getElementById('studio-fav-badge');
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');

    // 各要素がHTML上に存在していれば最新の件数をセットします
    if (navBadge) navBadge.textContent = count;
    if (iconBadge) iconBadge.textContent = count;
    if (mypageFavCount) mypageFavCount.innerHTML = `${count} <span class="stat-unit">点</span>`;
    if (studioFavBadge) studioFavBadge.textContent = count;
    if (mobBrandFavCnt) mobBrandFavCnt.textContent = count;
}

// お気に入り一覧ページ（#favorites）の中身を描画する関数です
function renderFavoriteProducts() {
    // 商品カードを表示するグリッド要素を取得します
    const favGrid = document.getElementById('favorite-product-grid');
    if (!favGrid) return;

    // 商品マスタの中から、お気に入りID配列に含まれている商品だけを抽出します
    const favoriteItems = SAMPLE_PRODUCTS.filter(p => AppState.favorites.includes(p.id));
    // お気に入りが0件のときは空状態メッセージと商品一覧への誘導ボタンを表示します
    if (favoriteItems.length === 0) {
        favGrid.innerHTML = `
            <div class="empty-state">
                <h2 class="empty-state-title">お気に入りはまだありません</h2>
                <p class="empty-state-text">気になるアイテムを見つけたら、ハートマークを押してお気に入りに追加しましょう。</p>
                <a href="#items" class="btn btn-primary">商品一覧を見る</a>
            </div>
        `;
    } else {
        // 抽出した全お気に入り商品を商品カードHTMLに変換し、繋げてグリッドに挿入します
        favGrid.innerHTML = favoriteItems.map(p => createProductCardHTML(p)).join('');
    }
}

// --------------------------------------------------------------------------
// 10. 会員登録 & ログイン
// --------------------------------------------------------------------------
// ヘッダーやモバイルメニューの「LOGIN / LOGOUT」表示をログイン状態に合わせて切り替える関数です
function updateAuthNavUI() {
    // PCナビ・モバイルドロワーの認証リンク要素を取得します
    const authLink = document.getElementById('nav-auth-link');
    const mobileLoginLink = document.getElementById('mobile-login-link');
    const mobileRegisterLink = document.getElementById('mobile-register-link');

    // ログイン中の場合は「LOGOUT」表示にし、クリックで handleLogout が呼ばれるよう設定します
    if (AppState.currentUser) {
        if (authLink) {
            authLink.textContent = 'LOGOUT';
            // ページ遷移（#）を行わないよう javascript:void(0) にして onclick にログアウト処理を割り当てます
            authLink.href = 'javascript:void(0)';
            authLink.onclick = handleLogout;
        }
        if (mobileLoginLink) {
            mobileLoginLink.textContent = 'LOGOUT (ログアウト)';
            mobileLoginLink.href = 'javascript:void(0)';
            mobileLoginLink.onclick = handleLogout;
        }
        // ログイン済みなら新規会員登録リンクは非表示にします
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'none';
    } else {
        // 未ログイン（ゲスト）時は「LOGIN」表示に戻し、#login ページへ遷移させます
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
        // 未ログイン時は新規会員登録リンクを表示します
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'block';
    }
}

// バックエンド未接続時に、メールアドレスから決定論的（毎回同じ値）なローカル専用IDを生成する関数です
function buildOfflineLocalUserId(email) {
    // 小文字化＆前後空白除去で表記揺れをなくします
    const clean = (email || 'guest').toLowerCase().trim();
    // 簡易ハッシュ計算用の整数変数を初期化します
    let hash = 0;
    // 文字コードを1文字ずつビットシフト計算して32bitハッシュを作ります
    for (let i = 0; i < clean.length; i++) {
        hash = ((hash << 5) - hash) + clean.charCodeAt(i);
        // |= 0 で32ビット整数へ丸めます
        hash |= 0;
    }
    // 絶対値を取り 36進数文字列化して 'local_' プレフィックスを付けます
    return 'local_' + Math.abs(hash).toString(36);
}

// ログアウトボタン押下時の処理関数です
function handleLogout() {
    // null を渡してアカウントセッションを完全にリセット（ゲスト状態へ安全に復帰）します
    applyAccountSession(null);
    showToast('ログアウトしました');
    // トップページへ移動します
    window.location.hash = '#home';
}

// 「デモアカウントで即ログイン」ボタン押下時の処理関数です
async function handleDemoLogin() {
    // レジ画面（checkout）からログインへ誘導された場合は、ゲスト中にカートへ入れた商品を引き継ぐフラグを立てます
    const preserveGuestCart = (AppState.pendingAuthTarget === 'checkout');
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    // 取得したユーザー情報を受け取る変数です
    let demoUser = null;

    // まずサーバーのデモログインAPIを呼び出し、MySQL上の正規デモアカウント情報の取得を試みます
    try {
        const res = await fetch(`${apiBase}/api/auth/demo`, { method: 'POST' });
        if (res.ok) {
            const data = await res.json();
            demoUser = data.user;
        }
    } catch (e) {}

    // サーバー接続できない環境（静的プレビュー等）のときはローカル用フォールバックデモユーザーを使います
    if (!demoUser) {
        demoUser = {
            id: 'demo',
            name: "テストユーザー（デモ）",
            email: "demo@manekin.com",
            rank: "VIP MEMBER",
            points: 1000
        };
    }

    // ユーザー情報をアプリ状態へ適用し、前の人のデータを破棄してアカウント専用データをロードします
    applyAccountSession(demoUser, { preserveGuestCart });

    // ログイン前に開こうとしていた目的ページ（スタジオ or チェックアウト）に応じて適切なページへ自動遷移します
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
        showToast(`🎉 デモアカウントでログインしました！ようこそ、${demoUser.name}`);
        window.location.hash = '#mypage';
    }
}

// ログインフォーム送信時に実行される認証処理関数です
async function handleLogin(e) {
    // フォーム標準のページリロードを防止します
    if (e) e.preventDefault();
    // 入力欄要素と入力値（前後空白除去）を取得します
    const emailEl = document.getElementById('login-email');
    const passEl = document.getElementById('login-password');
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '';

    // メールアドレス未入力チェックを行い、問題があれば入力欄にフォーカスして中断します
    if (!email) {
        showToast('メールアドレスを入力してください');
        if (emailEl) emailEl.focus();
        return;
    }
    // パスワード未入力チェックを行います
    if (!password) {
        showToast('パスワードを入力してください');
        if (passEl) passEl.focus();
        return;
    }

    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    let loggedInUser = null;

    // サーバーのログイン認証API（POST /api/auth/login）へメールアドレスとパスワードを送信します
    try {
        const response = await fetch(`${apiBase}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // 認証成功（200 OK）ならサーバーが返した会員オブジェクトを受け取ります
        if (response.ok) {
            const data = await response.json();
            loggedInUser = data.user;
        } else {
            // 認証失敗（パスワード誤り等）はサーバーからのエラーメッセージを表示して終了します
            const errData = await response.json().catch(() => ({}));
            showToast(errData.message || 'メールアドレスまたはパスワードが正しくありません');
            return;
        }
    } catch (err) {
        // バックエンドオフ時のローカルフォールバック（メール固有IDを割り当てて他アカウントと分離）
        // email から @ 以前を取り出して仮表示名にします
        const namePart = email.split('@')[0] || '会員';
        loggedInUser = {
            id: buildOfflineLocalUserId(email),
            name: `${namePart} 様`,
            email: email,
            rank: 'REGULAR MEMBER'
        };
    }

    // ユーザー情報の確定後、アカウント別セッション切り替えと目的画面へのリダイレクトを行います
    if (loggedInUser) {
        // ポイント値が未設定の場合のみデフォルトの 1000 を補います
        loggedInUser.points = (loggedInUser.points !== undefined && loggedInUser.points !== null) ? loggedInUser.points : 1000;
        const preserveGuestCart = (AppState.pendingAuthTarget === 'checkout');
        applyAccountSession(loggedInUser, { preserveGuestCart });

        // セキュリティのためフォーム入力欄のテキストを空に戻します
        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        // 元の遷移目的（スタジオ／注文画面／マイページ）へ誘導します
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

// 新規会員登録フォーム送信時に実行される登録処理関数です
async function handleRegister(e) {
    // フォーム送信によるページリロードを抑制します
    if (e) e.preventDefault();
    // 各入力要素（氏名・メール・パスワード・利用規約同意チェック）を取得します
    const nameEl = document.getElementById('reg-name');
    const emailEl = document.getElementById('reg-email');
    const passEl = document.getElementById('reg-password');
    const agreeEl = document.getElementById('reg-agree');

    // 入力値の前後空白を取り除きます（利用規約同意チェックはチェック有無 true/false）
    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const password = passEl ? passEl.value.trim() : '';
    const isAgree = agreeEl ? agreeEl.checked : true;

    // 入力値のバリデーション（検証）を順に行います
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
    // パスワードは最低4文字以上必要とします
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

    // 新規登録API（POST /api/auth/register）へ氏名・メール・パスワードを送ります
    try {
        const response = await fetch(`${apiBase}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        // 登録成功時はサーバーが発行したユーザーID付きアカウント情報を受け取ります
        if (response.ok) {
            const data = await response.json();
            newUser = data.user;
        } else {
            // メール重複などのエラー時はサーバーメッセージを通知して中断します
            const errData = await response.json().catch(() => ({}));
            showToast(errData.message || '会員登録に失敗しました');
            return;
        }
    } catch (err) {
        // バックエンドオフ時のローカルフォールバック
        newUser = {
            id: buildOfflineLocalUserId(email),
            name: `${name} 様`,
            email: email,
            rank: 'REGULAR MEMBER'
        };
    }

    // 登録成功後、初回特典1,000ポイント付与状態で新規セッションを開始します
    if (newUser) {
        newUser.points = 1000; // 新規会員登録で1,000ポイント（1,000円分）プレゼント！
        const preserveGuestCart = (AppState.pendingAuthTarget === 'checkout');
        applyAccountSession(newUser, { preserveGuestCart });

        // 入力欄をクリアします
        if (nameEl) nameEl.value = '';
        if (emailEl) emailEl.value = '';
        if (passEl) passEl.value = '';
        // 元の遷移目的に応じてページ遷移します
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
// MANEKIN開発中案内モーダルを開く関数です
function openManekinModal() {
    const modal = document.getElementById('manekin-modal');
    if (modal) {
        // open クラスを付けて画面に表示し、モバイルメニューが開いていたら閉じます
        modal.classList.add('open');
        closeMobileDrawer();
    }
}

// MANEKIN開発中案内モーダルを閉じる関数です
function closeManekinModal() {
    const modal = document.getElementById('manekin-modal');
    if (modal) modal.classList.remove('open');
}

// --------------------------------------------------------------------------
// 12. トースト通知ヘルパー
// --------------------------------------------------------------------------
// 画面右下に一時的な通知メッセージ（トースト）を表示して2.5秒後に自動消滅させる関数です
function showToast(message) {
    // 通知を並べる親コンテナを取得します
    const container = document.getElementById('toast-container');
    if (!container) return;

    // 新しい div 要素を作成し、CSSクラスとテキストを設定します
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    // コンテナの末尾に追加して画面へ表示します
    container.appendChild(toast);

    // 2500ミリ秒（2.5秒）後にフェードアウトアニメーションクラスを付け、さらに0.3秒後にDOMから削除します
    setTimeout(() => {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// --------------------------------------------------------------------------
// 13. モバイルドロワー制御
// --------------------------------------------------------------------------
// スマホ画面のハンバーガーメニュー（スライドドロワー）を開く関数です
function openMobileDrawer() {
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('menu-overlay');
    if (drawer && overlay) {
        // ドロワーを右外からスライドインさせ、暗転オーバーレイを表示し、背面ページのスクロールを禁止します
        drawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// スマホ用スライドドロワーを閉じて背面スクロールを元に戻す関数です
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
// 他の分割ファイル（app.js / studio.js）や HTML内の onclick="..." から確実に呼び出せるよう window に明示的に登録します
window.getApiBaseUrl = getApiBaseUrl;
window.isServerUserId = isServerUserId;
window.getScopedUserId = getScopedUserId;
window.getScopedKey = getScopedKey;
window.saveScopedData = saveScopedData;
window.removeScopedData = removeScopedData;
window.loadScopedData = loadScopedData;
window.purgeLegacyGlobalStorage = purgeLegacyGlobalStorage;
window.getDefaultFittingOffsets = getDefaultFittingOffsets;
window.getDefaultBodyProfile = getDefaultBodyProfile;
window.applyAccountSession = applyAccountSession;
window.getUserPoints = getUserPoints;
window.setUserPoints = setUserPoints;
window.handlePointsInputChange = handlePointsInputChange;
window.handleUseAllPoints = handleUseAllPoints;
window.handleResetPoints = handleResetPoints;
window.importOrderToCloset = importOrderToCloset;
window.handleSyncAllToMySQL = handleSyncAllToMySQL;
window.syncCartToBackend = syncCartToBackend;
window.syncCartFromBackend = syncCartFromBackend;
window.syncOrdersFromBackend = syncOrdersFromBackend;
window.syncFavoritesFromBackend = syncFavoritesFromBackend;
window.handleClearOrderHistory = handleClearOrderHistory;

// --------------------------------------------------------------------------
