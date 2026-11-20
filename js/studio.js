// ==========================================================================
//  js/studio.js - MANEKIN AI 試着スタジオ総合エンジン
//  仮想試着マネキン制御、手持ち服のブラウザ完結AI背景透過＆形状自動認識、
//  位置・サイズ微調整、AIコーデ診断、保存ルックブック、MySQL状態同期を担当します。
// ==========================================================================

// ==========================================================================
//  1. 定数・アップロード一時状態・スタジオタブ切り替え制御
// ==========================================================================
// 登録モーダルですぐ試せるサンプル手持ち服（帽子・パンツ・靴等）のプリセット辞書を定義します
const PRESET_CLOSET_PRESETS = {
    // オブジェクトの 'black_cap' プロパティ値を設定します
    'black_cap': {
        // 商品名またはアイテム名称
        name: 'クラシック コットンキャップ',
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: 'HAT',
        // カラー名
        color: 'BLACK',
        // 着用シーズン
        season: '通年',
        // 画像ファイルパスまたは DataURL
        image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22180%22%20text-anchor%3D%22middle%22%20fill%3D%22%23888888%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20letter-spacing%3D%222%22%20font-weight%3D%22600%22%3ECLASSIC%20CAP%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    // オブジェクトの 'black_pants' プロパティ値を設定します
    'black_pants': {
        // 商品名またはアイテム名称
        name: '黒ワイドスラックス',
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: 'BOTTOMS',
        // カラー名
        color: 'BLACK',
        // 着用シーズン
        season: '通年',
        // 画像ファイルパスまたは DataURL
        image: 'assets/images/men/ストレートレープセミフレアスラックス.png'
    },
    // オブジェクトの 'white_sneakers' プロパティ値を設定します
    'white_sneakers': {
        // 商品名またはアイテム名称
        name: '白レザースニーカー',
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: 'SHOES',
        // カラー名
        color: 'WHITE',
        // 着用シーズン
        season: '通年',
        // 画像ファイルパスまたは DataURL
        image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22300%22%20height%3D%22300%22%2F%3E%3Cpath%20d%3D%22M40%20200%20C40%20170%2090%20150%20140%20150%20C170%20150%20200%20130%20230%20140%20C260%20150%20270%20180%20270%20210%20L40%20210%20Z%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23111111%22%20stroke-width%3D%226%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M40%20210%20L270%20210%20L270%20230%20C270%20235%20265%20240%20260%20240%20L50%20240%20C45%20240%2040%20235%2040%20230%20Z%22%20fill%3D%22%23e5e7eb%22%20stroke%3D%22%23111111%22%20stroke-width%3D%226%22%2F%3E%3Cpath%20d%3D%22M150%20150%20L180%20170%20M170%20150%20L200%20170%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22270%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-size%3D%2214%22%20font-family%3D%22sans-serif%22%20letter-spacing%3D%221%22%3ESNEAKERS%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    // オブジェクトの 'grey_hoodie' プロパティ値を設定します
    'grey_hoodie': {
        // 商品名またはアイテム名称
        name: 'ヘビーウェイト グレーパーカー',
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: 'TOPS',
        // カラー名
        color: 'GREY',
        // 着用シーズン
        season: '秋冬',
        // 画像ファイルパスまたは DataURL
        image: 'assets/images/men/アーバングレイジップフーディ.png'
    },
    // オブジェクトの 'white_tshirt' プロパティ値を設定します
    'white_tshirt': {
        // 商品名またはアイテム名称
        name: 'プレミアム リラックス 白Tシャツ',
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: 'TOPS',
        // カラー名
        color: 'WHITE',
        // 着用シーズン
        season: '春夏',
        // 画像ファイルパスまたは DataURL
        image: 'assets/images/men/スカイオックスフォードシャツ.png'
    },
    // オブジェクトの 'denim_jacket' プロパティ値を設定します
    'denim_jacket': {
        // 商品名またはアイテム名称
        name: 'オーバーサイズ デニムジャケット',
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: 'OUTER',
        // カラー名
        color: 'BLUE',
        // 着用シーズン
        season: '春秋',
        // 画像ファイルパスまたは DataURL
        image: 'assets/images/men/リラックスダブルブレストテーラードジャケット.png'
    }
};


// 手持ち服登録モーダルで今選択・透過済みの表示用画像 DataURL を一時保持する変数です
let currentClosetUploadDataUrl = '';
// AI背景透過をかける前の元の画像 DataURL を保持し、「元画像に戻す」に使う変数です
let originalClosetUploadDataUrl = '';
// 現在選択中の画像に背景透過処理が完了しているかを示すフラグです
let isCurrentUploadTransparent = false;

// ==========================================================================
// 【関数】switchStudioTab(tabKey)
// 【役割】スタジオ上部のメインタブ（ホーム/クローゼット/お気に入り/コーデ作成/保存済み）を切り替える
// 【具体的な処理内容】
//   ・選ばれたタブに応じて、表示するパネルやボタンの表示・非表示を切り替えます
// ==========================================================================
function switchStudioTab(tabKey) {
    // メディアクエリの画面設計（992px以下）の時だけ、独立したお気に入り画面を開かず、コーデ作成画面内の「お気に入り商品」列へ誘導します
    if (tabKey === 'favorites' && window.innerWidth <= 992) {
        tabKey = 'create';
        setTimeout(() => {
            if (typeof switchMobileStudioView === 'function') {
                switchMobileStudioView('brand');
            }
        }, 50);
    }

    // アプリ全体状態 AppState.studioActiveTab を最新値（tabKey）に更新します
    AppState.studioActiveTab = tabKey;

    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（btn.classList.toggle('active', btn.getAttr…）
        btn.classList.toggle('active', btn.getAttribute('data-studio-tab') === tabKey);
    });

    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('.studio-pane').forEach(pane => {
        // 要素から CSS クラスを外して強調や表示を戻します（pane.classList.remove('active');）
        pane.classList.remove('active');
    });
    // HTML 要素 #対象ID を取得して変数 targetPane に格納します
    const targetPane = document.getElementById(`studio-pane-${tabKey}`);
    // 条件（targetPane）が成り立つか判定し、該当する場合の処理を実行します
    if (targetPane) {
        // 要素に CSS クラスを付与して見た目・表示状態を変更します（targetPane.classList.add('active');）
        targetPane.classList.add('active');
    }

    // 関連処理 renderManekinStudio() を呼び出して処理・画面を更新します
    renderManekinStudio(tabKey);
}

// ==========================================================================
// 【関数】renderManekinStudio(activeTab = 'create')
// 【役割】試着スタジオ画面全体（会員情報、タブ表示、服一覧）を最新状態に描画する
// 【具体的な処理内容】
//   ・ログイン中の会員名やポイントを表示し、指定されたタブ（初期値はコーデ作成）の内容を描画します
// ==========================================================================
function renderManekinStudio(activeTab = 'create') {
    // HTML 要素 #studio-user-name を取得して変数 userNameElem に格納します
    const userNameElem = document.getElementById('studio-user-name');
    // HTML 要素 #studio-avatar-char を取得して変数 avatarCharElem に格納します
    const avatarCharElem = document.getElementById('studio-avatar-char');
    // HTML 要素 #studio-user-rank を取得して変数 userRankElem に格納します
    const userRankElem = document.getElementById('studio-user-rank');
    // 条件（AppState.currentUser）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser) {
        // 条件（userNameElem）が成り立つか判定し、該当する場合の処理を実行します
        if (userNameElem) userNameElem.textContent = AppState.currentUser.name || '会員 様';
        // 条件（avatarCharElem）が成り立つか判定し、該当する場合の処理を実行します
        if (avatarCharElem) avatarCharElem.textContent = (AppState.currentUser.name || 'M').charAt(0);
        // 条件（userRankElem）が成り立つか判定し、該当する場合の処理を実行します
        if (userRankElem) userRankElem.textContent = AppState.currentUser.rank || 'MEMBER';
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 条件（userNameElem）が成り立つか判定し、該当する場合の処理を実行します
        if (userNameElem) userNameElem.textContent = 'ゲスト 様';
        // 条件（avatarCharElem）が成り立つか判定し、該当する場合の処理を実行します
        if (avatarCharElem) avatarCharElem.textContent = 'G';
        // 条件（userRankElem）が成り立つか判定し、該当する場合の処理を実行します
        if (userRankElem) userRankElem.textContent = 'GUEST';
    }

    // HTML 要素 #studio-closet-badge を取得して変数 closetBadge に格納します
    const closetBadge = document.getElementById('studio-closet-badge');
    // 条件（closetBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (closetBadge) closetBadge.textContent = AppState.myCloset.length;

    // HTML 要素 #studio-fav-badge を取得して変数 favBadge に格納します
    const favBadge = document.getElementById('studio-fav-badge');
    // 条件（favBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (favBadge) favBadge.textContent = AppState.favorites.length;

    // HTML 要素 #studio-saved-badge を取得して変数 savedBadge に格納します
    const savedBadge = document.getElementById('studio-saved-badge');
    // 条件（savedBadge）が成り立つか判定し、該当する場合の処理を実行します
    if (savedBadge) savedBadge.textContent = AppState.savedOutfits.length;

    // HTML 要素 #mob-closet-cnt を取得して変数 mobClosetCnt に格納します
    const mobClosetCnt = document.getElementById('mob-closet-cnt');
    // 条件（mobClosetCnt）が成り立つか判定し、該当する場合の処理を実行します
    if (mobClosetCnt) mobClosetCnt.textContent = AppState.myCloset.length;

    // HTML 要素 #mob-brand-fav-cnt を取得して変数 mobBrandFavCnt に格納します
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');
    // 条件（mobBrandFavCnt）が成り立つか判定し、該当する場合の処理を実行します
    if (mobBrandFavCnt) mobBrandFavCnt.textContent = AppState.favorites.length;

    // HTML 要素 #home-stat-closet を取得して変数 homeCloset に格納します
    const homeCloset = document.getElementById('home-stat-closet');
    // 条件（homeCloset）が成り立つか判定し、該当する場合の処理を実行します
    if (homeCloset) homeCloset.innerHTML = `${AppState.myCloset.length} <small>点</small>`;

    // HTML 要素 #home-stat-saved を取得して変数 homeSaved に格納します
    const homeSaved = document.getElementById('home-stat-saved');
    // 条件（homeSaved）が成り立つか判定し、該当する場合の処理を実行します
    if (homeSaved) homeSaved.innerHTML = `${AppState.savedOutfits.length} <small>組</small>`;

    // HTML 要素 #home-stat-fav を取得して変数 homeFav に格納します
    const homeFav = document.getElementById('home-stat-fav');
    // 条件（homeFav）が成り立つか判定し、該当する場合の処理を実行します
    if (homeFav) homeFav.innerHTML = `${AppState.favorites.length} <small>点</small>`;

    // HTML 要素 #prof-display-name を取得して変数 profName に格納します
    const profName = document.getElementById('prof-display-name');
    // HTML 要素 #prof-display-email を取得して変数 profEmail に格納します
    const profEmail = document.getElementById('prof-display-email');
    // HTML 要素 #prof-display-rank を取得して変数 profRank に格納します
    const profRank = document.getElementById('prof-display-rank');
    // 条件（AppState.currentUser）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser) {
        // 条件（profName）が成り立つか判定し、該当する場合の処理を実行します
        if (profName) profName.textContent = AppState.currentUser.name || '会員 様';
        // 条件（profEmail）が成り立つか判定し、該当する場合の処理を実行します
        if (profEmail) profEmail.textContent = AppState.currentUser.email || '';
        // 条件（profRank）が成り立つか判定し、該当する場合の処理を実行します
        if (profRank) profRank.textContent = AppState.currentUser.rank || 'REGULAR MEMBER';
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 条件（profName）が成り立つか判定し、該当する場合の処理を実行します
        if (profName) profName.textContent = 'ゲスト 様';
        // 条件（profEmail）が成り立つか判定し、該当する場合の処理を実行します
        if (profEmail) profEmail.textContent = '未ログイン（ログインが必要です）';
        // 条件（profRank）が成り立つか判定し、該当する場合の処理を実行します
        if (profRank) profRank.textContent = 'GUEST';
    }

    // 値（activeTab)）に応じて処理ケースを分岐する switch 文を開始します
    switch (activeTab) {
        // 値が 'home' だった場合の専用処理ルートです
        case 'home':
            // 本日の気温・季節に連動した TODAY'S AI STYLING を動的更新します
            if (typeof updateTodaySeasonalStyling === 'function') {
                updateTodaySeasonalStyling();
            }
            // 現在の case / ループ処理をここで抜けます
            break;
        // 値が 'closet' だった場合の専用処理ルートです
        case 'closet':
            // 関連処理 renderPaneClosetGrid() を呼び出して処理・画面を更新します
            renderPaneClosetGrid();
            // 現在の case / ループ処理をここで抜けます
            break;
        // 値が 'favorites' だった場合の専用処理ルートです
        case 'favorites':
            // 関連処理 renderStudioFavoritesGrid() を呼び出して処理・画面を更新します
            renderStudioFavoritesGrid();
            // 現在の case / ループ処理をここで抜けます
            break;
        // 値が 'create' だった場合の専用処理ルートです
        case 'create':
            // 関連処理 renderStudioClosetList() を呼び出して処理・画面を更新します
            renderStudioClosetList();
            // 関連処理 renderStudioBrandList() を呼び出して処理・画面を更新します
            renderStudioBrandList();
            // 関連処理 renderMannequinStage() を呼び出して処理・画面を更新します
            renderMannequinStage();
            // 関連処理 updateAIStylingComment() を呼び出して処理・画面を更新します
            updateAIStylingComment();
            // 現在の case / ループ処理をここで抜けます
            break;
        // 値が 'saved' だった場合の専用処理ルートです
        case 'saved':
            // 関連処理 renderSavedOutfitsGrid() を呼び出して処理・画面を更新します
            renderSavedOutfitsGrid();
            // 現在の case / ループ処理をここで抜けます
            break;
        // 値が 'profile' だった場合の専用処理ルートです
        case 'profile':
            // 現在の case / ループ処理をここで抜けます
            break;
    }
}


// ==========================================================================
//  2. ブランド規格サイズ定数・手持ち服棚／ブランド一覧／お気に入りペイン描画
// ==========================================================================
// ブランド販売商品のサイズ調整スライダー(0〜4)に対応するサイズ名配列です
const BRAND_SIZE_LIST = ['XS', 'S', 'M', 'L', 'XL'];
// XS〜XL の各サイズ選択時にマネキン上で服画像を拡大縮小する倍率(%)マップです
const BRAND_SIZE_SCALES = {
    // オブジェクトの 'XS' プロパティ値を設定します
    'XS': 88,
    // オブジェクトの 'S' プロパティ値を設定します
    'S': 94,
    // オブジェクトの 'M' プロパティ値を設定します
    'M': 100,
    // オブジェクトの 'L' プロパティ値を設定します
    'L': 106,
    // オブジェクトの 'XL' プロパティ値を設定します
    'XL': 112
};

// ==========================================================================
// 【関数】renderPaneClosetGrid()
// 【役割】スタジオの「マイクローゼット」タブに、持っている服の一覧カードを表示する
// 【具体的な処理内容】
//   ・自分が登録した手持ち服や購入した服のカードをグリッド状に並べて表示します
// ==========================================================================
function renderPaneClosetGrid() {
    // HTML 要素 #closet-items-grid を取得して変数 grid に格納します
    const grid = document.getElementById('closet-items-grid');
    // 条件（!grid）が成り立つか判定し、該当する場合の処理を実行します
    if (!grid) return;

    // 定数 filter を宣言し、値（AppState.studioClosetFilter || 'ALL'）をセットします
    const filter = AppState.studioClosetFilter || 'ALL';
    // 定数 items を宣言し、値（(filter === 'ALL')）をセットします
    const items = (filter === 'ALL')
        // 三項演算子・真(True)の場合の選択値（AppState.myCloset）
        ? AppState.myCloset
        // 三項演算子・偽(False)の場合の選択値（AppState.myCloset.filter(item => item.cate…）
        : AppState.myCloset.filter(item => item.category === filter);

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (items.length === 0) {
        // テンプレートリテラルで組み立てた HTML を要素 grid 内に書き込んで画面を更新します
        grid.innerHTML = `
            <div class="closet-empty-card">
                <div class="closet-empty-icon">🧥</div>
                <h3 class="closet-empty-title">まだ手持ちの服が登録されていません</h3>
                <p class="closet-empty-desc">お気に入りの服やよく着る服を登録すると、ブランド商品とのコーディネートを試着できます。</p>
                <button class="btn btn-primary" onclick="openAddClosetModal()">+ 手持ちの服を登録する</button>
            </div>
        `;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 配列の各アイテムを順番に加工・HTMLカード化して新しい配列に変換します
    grid.innerHTML = items.map(item => {
        // 定数 isWearing を宣言し、値（isItemWearing(item)）をセットします
        const isWearing = isItemWearing(item);
        // 定数 colorHex を宣言し、値（getColorHex(item.color)）をセットします
        const colorHex = getColorHex(item.color);

        // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
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
        // 上で配列ごとに生成した HTML 文字列を 1 つの連続した HTML テキストに連結します
    }).join('');
}

// ==========================================================================
// 【関数】renderStudioClosetList()
// 【役割】試着室の左側カラム「手持ちの服一覧」を描画する
// 【具体的な処理内容】
//   ・ドラッグ＆ドロップまたはクリックでマネキンに着せられる手持ち服のリストを表示します
// ==========================================================================
function renderStudioClosetList() {
    // HTML 要素 #studio-closet-list を取得して変数 list に格納します
    const list = document.getElementById('studio-closet-list');
    // 条件（!list）が成り立つか判定し、該当する場合の処理を実行します
    if (!list) return;

    // 定数 filter を宣言し、値（AppState.studioClosetFilter || 'ALL'）をセットします
    const filter = AppState.studioClosetFilter || 'ALL';
    // 定数 items を宣言し、値（(filter === 'ALL')）をセットします
    const items = (filter === 'ALL')
        // 三項演算子・真(True)の場合の選択値（AppState.myCloset）
        ? AppState.myCloset
        // 三項演算子・偽(False)の場合の選択値（AppState.myCloset.filter(item => item.cate…）
        : AppState.myCloset.filter(item => item.category === filter);

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (items.length === 0) {
        // テンプレートリテラルで組み立てた HTML を要素 list 内に書き込んで画面を更新します
        list.innerHTML = `
            <div style="text-align: center; padding: 30px 10px; color: var(--color-gray-medium);">
                <p style="font-size: 0.85rem; margin-bottom: 12px;">該当する手持ち服がありません</p>
                <button class="btn btn-outline-xs" onclick="openAddClosetModal()">+ 手持ち服を登録</button>
            </div>
        `;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 配列の各アイテムを順番に加工・HTMLカード化して新しい配列に変換します
    list.innerHTML = items.map(item => {
        // 定数 isWearing を宣言し、値（isItemWearing(item)）をセットします
        const isWearing = isItemWearing(item);
        // 定数 colorHex を宣言し、値（getColorHex(item.color)）をセットします
        const colorHex = getColorHex(item.color);
        // 定数 fallback を宣言し、値（getCategoryFallbackImage(item.category…）をセットします
        const fallback = getCategoryFallbackImage(item.category);

        // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
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
        // 上で配列ごとに生成した HTML 文字列を 1 つの連続した HTML テキストに連結します
    }).join('');
}

// ==========================================================================
// 【関数】handlePaneClosetFilter(cat)
// 【役割】マイクローゼットタブでカテゴリ（帽子、トップス等）を絞り込んだときの処理
// 【具体的な処理内容】
//   ・選ばれたカテゴリの服だけを抽出してマイクローゼット画面を再描画します
// ==========================================================================
function handlePaneClosetFilter(cat) {
    // アプリ全体状態 AppState.studioClosetFilter を最新値（cat）に更新します
    AppState.studioClosetFilter = cat;
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('#pane-closet-filter-bar .filter-pill').forEach(btn => {
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（btn.classList.toggle('active', btn.getAttr…）
        btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    // 関連処理 renderPaneClosetGrid() を呼び出して処理・画面を更新します
    renderPaneClosetGrid();
}

// ==========================================================================
// 【関数】handleStudioClosetFilter(cat)
// 【役割】試着室左側カラムのカテゴリフィルター（ALL、TOPS等）を切り替えたときの処理
// 【具体的な処理内容】
//   ・選ばれたカテゴリの手持ち服だけを左カラムに表示します
// ==========================================================================
function handleStudioClosetFilter(cat) {
    // アプリ全体状態 AppState.studioClosetFilter を最新値（cat）に更新します
    AppState.studioClosetFilter = cat;
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('#col-closet-filter .mini-chip').forEach(btn => {
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（btn.classList.toggle('active', btn.getAttr…）
        btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    // 関連処理 renderStudioClosetList() を呼び出して処理・画面を更新します
    renderStudioClosetList();
}

// ==========================================================================
// 【関数】renderStudioBrandList()
// 【役割】試着室の右側カラム「ブランド商品一覧」を描画する
// 【具体的な処理内容】
//   ・マネキンに試着できるショップの販売商品を一覧表示します
// ==========================================================================
function renderStudioBrandList() {
    // HTML 要素 #studio-brand-list を取得して変数 list に格納します
    const list = document.getElementById('studio-brand-list');
    // 条件（!list）が成り立つか判定し、該当する場合の処理を実行します
    if (!list) return;

    // 定数 filter を宣言し、値（AppState.studioBrandFilter || 'ALL'）をセットします
    const filter = AppState.studioBrandFilter || 'ALL';

    // 定数 favIds を宣言し、値（Array.isArray(AppState.favorites) ? Ap…）をセットします
    const favIds = Array.isArray(AppState.favorites) ? AppState.favorites : [];
    // 全商品マスター SAMPLE_PRODUCTS からお気に入り登録された商品を抽出
    const allFavProducts = SAMPLE_PRODUCTS.filter(p => favIds.some(f => Number(f) === Number(p.id)));

    // HTML 要素 #mob-brand-fav-cnt を取得して変数 mobBrandFavCnt に格納します
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');
    // 条件（mobBrandFavCnt）が成り立つか判定し、該当する場合の処理を実行します
    if (mobBrandFavCnt) {
        // 文字要素 mobBrandFavCnt の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        mobBrandFavCnt.textContent = allFavProducts.length;
    }

    // お気に入りに設定された商品を性別問わずすべて全件表示します
    let products = [...allFavProducts];
    // 条件（filter !== 'ALL'）が成り立つか判定し、該当する場合の処理を実行します
    if (filter !== 'ALL') {
        // 変数・配列項目 products の値を更新・計算します
        products = products.filter(p => p.category === filter);
    }

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (allFavProducts.length === 0) {
        // テンプレートリテラルで組み立てた HTML を要素 list 内に書き込んで画面を更新します
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 16px; color: var(--color-gray-medium);">
                <div style="font-size: 2rem; margin-bottom: 8px; color: var(--color-accent); opacity: 0.85;">♥</div>
                <p style="font-size: 0.88rem; font-weight: 600; color: var(--color-black); margin-bottom: 6px;">お気に入りの服がありません</p>
                <p style="font-size: 0.78rem; line-height: 1.5; margin-bottom: 14px;">商品一覧でハート（♥）を押してお気に入り登録すると、ここに表示されてマネキンに試着できます。</p>
                <a href="#items" class="btn btn-outline-xs" style="display: inline-block; padding: 6px 16px; font-size: 0.75rem;">商品一覧を見に行く</a>
            </div>
        `;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (products.length === 0) {
        // テンプレートリテラルで組み立てた HTML を要素 list 内に書き込んで画面を更新します
        list.innerHTML = `
            <div style="text-align: center; padding: 36px 12px; color: var(--color-gray-medium);">
                <p style="font-size: 0.85rem; font-weight: 600; color: var(--color-dark); margin-bottom: 6px;">該当するお気に入りアイテムがありません</p>
                <p style="font-size: 0.75rem; color: var(--color-gray-medium); line-height: 1.4;">上のカテゴリ切り替えで「ALL」を選択するか、商品一覧でお気に入り（♥）を追加してください。</p>
            </div>
        `;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 配列の各アイテムを順番に加工・HTMLカード化して新しい配列に変換します
    list.innerHTML = products.map(product => {
        // 定数 isWearing を宣言し、値（isItemWearing(product)）をセットします
        const isWearing = isItemWearing(product);
        // 定数 fallback を宣言し、値（getCategoryFallbackImage(product.categ…）をセットします
        const fallback = getCategoryFallbackImage(product.category);

        // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
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
        // 上で配列ごとに生成した HTML 文字列を 1 つの連続した HTML テキストに連結します
    }).join('');
}

// ==========================================================================
// 【関数】handleStudioBrandFilter(cat)
// 【役割】試着室右側カラムのカテゴリフィルターを切り替えたときの処理
// 【具体的な処理内容】
//   ・選ばれたカテゴリの販売商品だけを右カラムに表示します
// ==========================================================================
function handleStudioBrandFilter(cat) {
    // アプリ全体状態 AppState.studioBrandFilter を最新値（cat）に更新します
    AppState.studioBrandFilter = cat;
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('#col-brand-filter .mini-chip').forEach(btn => {
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（btn.classList.toggle('active', btn.getAttr…）
        btn.classList.toggle('active', btn.getAttribute('data-brand-cat') === cat);
    });
    // 関連処理 renderStudioBrandList() を呼び出して処理・画面を更新します
    renderStudioBrandList();
}

// ==========================================================================
// 【関数】renderStudioFavoritesGrid()
// 【役割】スタジオの「お気に入り商品」タブにハートを付けた服の一覧を表示する
// 【具体的な処理内容】
//   ・ショップでお気に入り登録した商品カードを一覧表示し、そこから直接試着できるようにします
// ==========================================================================
function renderStudioFavoritesGrid() {
    // HTML 要素 #studio-fav-grid を取得して変数 grid に格納します
    const grid = document.getElementById('studio-fav-grid');
    // 条件（!grid）が成り立つか判定し、該当する場合の処理を実行します
    if (!grid) return;

    // 定数 favIds を宣言し、値（Array.isArray(AppState.favorites) ? AppState.favorites : []）をセットします
    const favIds = Array.isArray(AppState.favorites) ? AppState.favorites : [];
    // 全商品マスター SAMPLE_PRODUCTS からお気に入り登録された商品を抽出
    const favProducts = SAMPLE_PRODUCTS.filter(p => favIds.some(f => Number(f) === Number(p.id)));

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (favProducts.length === 0) {
        // テンプレートリテラルで組み立てた HTML を要素 grid 内に書き込んで画面を更新します
        grid.innerHTML = `
            <div class="closet-empty-card" >
                <div class="closet-empty-icon">♥</div>
                <h3 class="closet-empty-title">お気に入りに登録されたアイテムはありません</h3>
                <p class="closet-empty-desc">商品一覧でお気に入り（ハート）を登録すると、ここに一覧表示されワンクリックでマネキンに着せ替えることができます。</p>
                <a href="#items" class="btn btn-primary">商品コレクションを見る</a>
            </div>
            `;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 配列の各アイテムを順番に加工・HTMLカード化して新しい配列に変換します
    grid.innerHTML = favProducts.map(product => {
        // 定数 isWearing を宣言し、値（isItemWearing(product)）をセットします
        const isWearing = isItemWearing(product);
        // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
        return `
            <article class="product-card" data-id="${product.id}">
                <div class="product-img-wrapper" onclick="toggleWearItem(${product.id}, false); switchStudioTab('create');">
                    <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='assets/images/men/スカイオックスフォードシャツ.png'">
                    <span class="badge-new" style="background: var(--color-black);">試着する</span>
                    <button class="fav-btn is-favorite" 
                            onclick="event.stopPropagation(); handleToggleFavorite(${product.id})" 
                            aria-label="お気に入りを解除">
                        <svg viewBox="0 0 24 24" fill="#e53935" stroke="#e53935" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
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
        // 上で配列ごとに生成した HTML 文字列を 1 つの連続した HTML テキストに連結します
    }).join('');
}

// ==========================================================================
// 【関数】isItemWearing(item)
// 【役割】その服が「いまマネキンに着せられているか」を判定する
// 【具体的な処理内容】
//   ・マネキンの帽子・トップス・ボトムス等のスロットを調べ、同じ服を着ていればtrueを返します
// ==========================================================================
function isItemWearing(item) {
    // 定数 outfit を宣言し、値（AppState.currentOutfit）をセットします
    const outfit = AppState.currentOutfit;
    // 条件（!outfit）が成り立つか判定し、該当する場合の処理を実行します
    if (!outfit) return false;
    // 配列要素やインデックスを順番に繰り返すループ処理（for (const slotKey in outfit) {）を開始します
    for (const slotKey in outfit) {
        // 定数 worn を宣言し、値（outfit[slotKey]）をセットします
        const worn = outfit[slotKey];
        // 条件（worn && String(worn.id) === String(item.id)）が成り立つか判定し、該当する場合の処理を実行します
        if (worn && String(worn.id) === String(item.id)) {
            // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
            return true;
        }
    }
    // 処理結果の基準値として false を呼び出し元へ返して関数を終了します
    return false;
}

// ==========================================================================
// 【関数】toggleWearItem(itemId, isOwned)
// 【役割】服カードをクリックしたときに「着る / 脱ぐ」を切り替える
// 【具体的な処理内容】
//   ・まだ着ていなければマネキンに着せ、すでに着ていれば脱がせて、
//     画面を再描画しサーバーに保存します
// ==========================================================================
function toggleWearItem(itemId, isOwned) {
    // 再代入可能な変数 targetItem を宣言し、値（null）をセットします
    let targetItem = null;
    // 条件（isOwned）が成り立つか判定し、該当する場合の処理を実行します
    if (isOwned) {
        // 変数・配列項目 targetItem の値を更新・計算します
        targetItem = AppState.myCloset.find(c => String(c.id) === String(itemId));
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 変数・配列項目 targetItem の値を更新・計算します
        targetItem = SAMPLE_PRODUCTS.find(p => p.id === parseInt(itemId, 10));
    }

    // 条件（!targetItem）が成り立つか判定し、該当する場合の処理を実行します
    if (!targetItem) return;

    // 定数 slotKey を宣言し、値（getSlotKeyByCategory(targetItem.catego…）をセットします
    const slotKey = getSlotKeyByCategory(targetItem.category);
    // 条件（!slotKey）が成り立つか判定し、該当する場合の処理を実行します
    if (!slotKey) return;

    // 定数 currentWorn を宣言し、値（AppState.currentOutfit[slotKey]）をセットします
    const currentWorn = AppState.currentOutfit[slotKey];
    // 条件（currentWorn && String(currentWorn.id) === String(tar…）が成り立つか判定し、該当する場合の処理を実行します
    if (currentWorn && String(currentWorn.id) === String(targetItem.id)) {
        // 変数・配列項目 AppState.currentOutfit[slotKey] の値を更新・計算します
        AppState.currentOutfit[slotKey] = null;
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification(`「${targetItem.name}」を外しました`);
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 変数・配列項目 AppState.currentOutfit[slotKey] の値を更新・計算します
        AppState.currentOutfit[slotKey] = {
            // レコード・商品・コーデを識別する ID プロパティをセットします
            id: targetItem.id,
            // 商品名またはアイテム名称
            name: targetItem.name,
            // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
            category: targetItem.category,
            // カラー名
            color: targetItem.color || (targetItem.colors ? targetItem.colors[0] : 'BLACK'),
            // 単価・価格（円）
            price: targetItem.price || 0,
            // 画像ファイルパスまたは DataURL
            image: targetItem.image,
            // ユーザーの手持ち私物であるかどうかのフラグ
            isOwned: !!isOwned
        };
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification(`「${targetItem.name}」をマネキンに試着しました`);
        // アプリ全体状態 AppState.activeAdjustSlot を最新値（slotKey）に更新します
        AppState.activeAdjustSlot = slotKey;
    }

    // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
    syncStudioStateToBackend({ immediate: true });

    // 関連処理 renderMannequinStage() を呼び出して処理・画面を更新します
    renderMannequinStage();
    // 関連処理 renderStudioClosetList() を呼び出して処理・画面を更新します
    renderStudioClosetList();
    // 関連処理 renderStudioBrandList() を呼び出して処理・画面を更新します
    renderStudioBrandList();
    // 関連処理 updateAIStylingComment() を呼び出して処理・画面を更新します
    updateAIStylingComment();
}

// ==========================================================================
// 【関数】getSlotKeyByCategory(category)
// 【役割】服のカテゴリ名（'TOPS'など）をマネキンの部位名（'tops'など）に変換する
// 【具体的な処理内容】
//   ・大文字のカテゴリ名を小文字の部位スロットキーに直して返します
// ==========================================================================
function getSlotKeyByCategory(category) {
    // 値（category)）に応じて処理ケースを分岐する switch 文を開始します
    switch (category) {
        // 値が 'OUTER' 系だった場合、対応値 'outer' を即返却します
        case 'OUTER': return 'outer';
        // 値が 'TOPS' 系だった場合、対応値 'tops' を即返却します
        case 'TOPS': return 'tops';
        // 値が 'BOTTOMS' 系だった場合、対応値 'bottoms' を即返却します
        case 'BOTTOMS': return 'bottoms';
        // 値が 'SHOES' 系だった場合、対応値 'shoes' を即返却します
        case 'SHOES': return 'shoes';
        // 値が 'HAT' 系だった場合、対応値 'hat' を即返却します
        case 'HAT': case 'HATS': case 'CAP': return 'hat';
        // オブジェクトの 'default' プロパティ値を設定します
        default: return 'tops';
    }
}

// ==========================================================================
// 【関数】unwearSlot(slotKey)
// 【役割】マネキンの指定部位（帽子、トップスなど）の服を脱がせる
// 【具体的な処理内容】
//   ・その部位の服を空（null）にして、マネキンを再描画しサーバーへ保存します
// ==========================================================================
function unwearSlot(slotKey) {
    // 条件（AppState.currentOutfit[slotKey]）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentOutfit[slotKey]) {
        // 定数 name を宣言し、値（AppState.currentOutfit[slotKey].name）をセットします
        const name = AppState.currentOutfit[slotKey].name;
        // 変数・配列項目 AppState.currentOutfit[slotKey] の値を更新・計算します
        AppState.currentOutfit[slotKey] = null;
        // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
        syncStudioStateToBackend({ immediate: true });
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification(`「${name}」を外しました`);

        // 関連処理 renderMannequinStage() を呼び出して処理・画面を更新します
        renderMannequinStage();
        // 関連処理 renderStudioClosetList() を呼び出して処理・画面を更新します
        renderStudioClosetList();
        // 関連処理 renderStudioBrandList() を呼び出して処理・画面を更新します
        renderStudioBrandList();
        // 関連処理 updateAIStylingComment() を呼び出して処理・画面を更新します
        updateAIStylingComment();
    }
}

// ==========================================================================
// 【関数】resetMannequinOutfit(silent = false)
// 【役割】マネキンに着せている服を全身すべて脱がせてリセットする
// 【具体的な処理内容】
//   ・5部位すべての服を空にし、マネキンを初期状態に戻します
// ==========================================================================
function resetMannequinOutfit(silent = false) {
    // アプリ全体状態 AppState.currentOutfit を最新値（{）に更新します
    AppState.currentOutfit = {
        // オブジェクトの 'hat' プロパティ値を設定します
        hat: null,
        // オブジェクトの 'outer' プロパティ値を設定します
        outer: null,
        // オブジェクトの 'tops' プロパティ値を設定します
        tops: null,
        // オブジェクトの 'bottoms' プロパティ値を設定します
        bottoms: null,
        // オブジェクトの 'shoes' プロパティ値を設定します
        shoes: null
    };
    // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
    syncStudioStateToBackend({ immediate: true });
    // 条件（!silent）が成り立つか判定し、該当する場合の処理を実行します
    if (!silent) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('マネキンの着用服をすべてクリアしました');
    }

    // 関連処理 renderMannequinStage() を呼び出して処理・画面を更新します
    renderMannequinStage();
    // 関連処理 renderStudioClosetList() を呼び出して処理・画面を更新します
    renderStudioClosetList();
    // 関連処理 renderStudioBrandList() を呼び出して処理・画面を更新します
    renderStudioBrandList();
    // 関連処理 updateAIStylingComment() を呼び出して処理・画面を更新します
    updateAIStylingComment();
}

// ==========================================================================
// 【関数】clearMannequin()
// 【役割】ツールバーの「全身クリア」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・マネキンの服をすべて脱がせて、「マネキンをクリアしました」と通知します
// ==========================================================================
function clearMannequin() {
    // 関連処理 resetMannequinOutfit() を呼び出して処理・画面を更新します
    resetMannequinOutfit(false);
}

// ==========================================================================
// 【関数】getCategoryFallbackImage(category)
// 【役割】写真の読み込みに失敗したときの「代わりのダミー画像」を取得する
// 【具体的な処理内容】
//   ・画像のリンク切れが起きた際に、カテゴリに応じた標準の服画像を表示して画面崩れを防ぎます
// ==========================================================================
function getCategoryFallbackImage(category) {
    // 値（category)）に応じて処理ケースを分岐する switch 文を開始します
    switch (category) {
        // 値が 'SHOES' だった場合の専用処理ルートです
        case 'SHOES':
            // 結果（"data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns…）を呼び出し元へ返却します
            return "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20140%2065%22%3E%3Cpath%20d%3D%22M15%2048%20C25%2048%2C%2035%2046%2C%2045%2040%20C55%2032%2C%2065%2022%2C%2085%2020%20C95%2019%2C%20110%2025%2C%20125%2038%20C132%2044%2C%20130%2050%2C%20120%2052%20L15%2052%20Z%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M10%2052%20L128%2052%20C132%2052%2C%20132%2058%2C%20126%2058%20L10%2058%20C6%2058%2C%206%2052%2C%2010%2052%20Z%22%20fill%3D%22%23e2e8f0%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%2F%3E%3Cpath%20d%3D%22M65%2026%20L80%2032%20M60%2031%20L75%2037%20M55%2036%20L70%2042%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E";
        // 値が 'BOTTOMS' だった場合の専用処理ルートです
        case 'BOTTOMS':
            // 結果（'assets/images/men/ストレートレープセミフレアスラックス.png'）を呼び出し元へ返却します
            return 'assets/images/men/ストレートレープセミフレアスラックス.png';
        // 値が 'OUTER' だった場合の専用処理ルートです
        case 'OUTER':
            // 結果（'assets/images/men/オーバードレープダブルトレンチコート.png'）を呼び出し元へ返却します
            return 'assets/images/men/オーバードレープダブルトレンチコート.png';
        // 値が 'HAT': case 'HATS': case 'CAP' だった場合の専用処理ルートです
        case 'HAT': case 'HATS': case 'CAP':
            // 結果（"data:image/svg+xml;charset=UTF-8,%3Csvg%20width…）を呼び出し元へ返却します
            return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E";
        // 値が 'TOPS' だった場合の専用処理ルートです
        case 'TOPS':
        // どの case にも該当しなかった場合の既定（デフォルト）処理です
        default:
            // 結果（'assets/images/men/アーバングレイジップフーディ.png'）を呼び出し元へ返却します
            return 'assets/images/men/アーバングレイジップフーディ.png';
    }
}

// ==========================================================================
// 【関数】migrateOldBrokenAssets()
// 【役割】古い服データの画像パスを、現在の正しい画像パスへ自動補正する
// 【具体的な処理内容】
//   ・ファイル名が変わった古い画像URLを最新の画像URLへ置き換えます
// ==========================================================================
function migrateOldBrokenAssets() {
    // ブラウザ旧ストレージに残っていた manekin* データを完全消去して MySQL 単一運用を保ちます
    if (typeof purgeAllManekinLocalStorage === 'function') {
        // ブラウザ旧ストレージに残っていた manekin* データを完全消去して MySQL 単一運用を保ちます
        purgeAllManekinLocalStorage();
    }

    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser) {
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 defaultSneaker を宣言し、値（getCategoryFallbackImage('SHOES')）をセットします
    const defaultSneaker = getCategoryFallbackImage('SHOES');
    // 条件（Array.isArray(AppState.myCloset)）が成り立つか判定し、該当する場合の処理を実行します
    if (Array.isArray(AppState.myCloset)) {
        // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
        AppState.myCloset.forEach(item => {
            // 条件（!item）が成り立つか判定し、該当する場合の処理を実行します
            if (!item) return;
            // 条件（!item.image || item.image.includes('pants_black.jpg'…）が成り立つか判定し、該当する場合の処理を実行します
            if (!item.image || item.image.includes('pants_black.jpg') || item.image.includes('tapered_black.jpg')) {
                // 変数・配列項目 item.image の値を更新・計算します
                item.image = 'assets/images/men/ストレートレープセミフレアスラックス.png';
                // 前の if が偽で、かつ（item.image.includes('shoes_white.jpg')）を満たす場合の別条件分岐です
            } else if (item.image.includes('shoes_white.jpg')) {
                // 変数・配列項目 item.image の値を更新・計算します
                item.image = defaultSneaker;
                // 前の if が偽で、かつ（item.image.includes('sweat_grey.jpg') || item.image.…）を満たす場合の別条件分岐です
            } else if (item.image.includes('sweat_grey.jpg') || item.image.includes('sweat_white.jpg')) {
                // 変数・配列項目 item.image の値を更新・計算します
                item.image = 'assets/images/men/アーバングレイジップフーディ.png';
                // 前の if が偽で、かつ（item.image.includes('tshirt_white.jpg') || item.imag…）を満たす場合の別条件分岐です
            } else if (item.image.includes('tshirt_white.jpg') || item.image.includes('tshirt_black.jpg')) {
                // 変数・配列項目 item.image の値を更新・計算します
                item.image = 'assets/images/men/スカイオックスフォードシャツ.png';
            }
        });
    }

    // 再代入可能な変数 outfitChanged を宣言し、値（false）をセットします
    let outfitChanged = false;
    // 条件（AppState.currentOutfit）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentOutfit) {
        // 配列要素やインデックスを順番に繰り返すループ処理（for (const slotKey in AppState.currentOutfit) {）を開始します
        for (const slotKey in AppState.currentOutfit) {
            // 条件（slotKey.startsWith("data:image")）が成り立つか判定し、該当する場合の処理を実行します
            if (slotKey.startsWith("data:image")) {
                // オブジェクトから該当キーの着用データ・項目を削除します（delete AppState.currentOutfit[slotKey];）
                delete AppState.currentOutfit[slotKey];
                // 変数・配列項目 outfitChanged の値を更新・計算します
                outfitChanged = true;
            }
        }
        // 配列要素やインデックスを順番に繰り返すループ処理（for (const slot in AppState.currentOutfit) {）を開始します
        for (const slot in AppState.currentOutfit) {
            // 定数 item を宣言し、値（AppState.currentOutfit[slot]）をセットします
            const item = AppState.currentOutfit[slot];
            // 条件（item && item.image）が成り立つか判定し、該当する場合の処理を実行します
            if (item && item.image) {
                // 条件（item.image.includes('pants_black.jpg') || item.image…）が成り立つか判定し、該当する場合の処理を実行します
                if (item.image.includes('pants_black.jpg') || item.image.includes('tapered_black.jpg')) {
                    // 変数・配列項目 item.image の値を更新・計算します
                    item.image = 'assets/images/men/ストレートレープセミフレアスラックス.png';
                    // 変数・配列項目 outfitChanged の値を更新・計算します
                    outfitChanged = true;
                    // 前の if が偽で、かつ（item.image.includes('shoes_white.jpg')）を満たす場合の別条件分岐です
                } else if (item.image.includes('shoes_white.jpg')) {
                    // 変数・配列項目 item.image の値を更新・計算します
                    item.image = defaultSneaker;
                    // 変数・配列項目 outfitChanged の値を更新・計算します
                    outfitChanged = true;
                    // 前の if が偽で、かつ（item.image.includes('sweat_grey.jpg') || item.image.…）を満たす場合の別条件分岐です
                } else if (item.image.includes('sweat_grey.jpg') || item.image.includes('sweat_white.jpg')) {
                    // 変数・配列項目 item.image の値を更新・計算します
                    item.image = 'assets/images/men/アーバングレイジップフーディ.png';
                    // 変数・配列項目 outfitChanged の値を更新・計算します
                    outfitChanged = true;
                    // 前の if が偽で、かつ（item.image.includes('tshirt_white.jpg') || item.imag…）を満たす場合の別条件分岐です
                } else if (item.image.includes('tshirt_white.jpg') || item.image.includes('tshirt_black.jpg')) {
                    // 変数・配列項目 item.image の値を更新・計算します
                    item.image = 'assets/images/men/スカイオックスフォードシャツ.png';
                    // 変数・配列項目 outfitChanged の値を更新・計算します
                    outfitChanged = true;
                }
            }
        }
    }
    // 条件（outfitChanged）が成り立つか判定し、該当する場合の処理を実行します
    if (outfitChanged) {
        // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
        syncStudioStateToBackend({ immediate: true });
    }
}

// ==========================================================================
// 【関数】renderMannequinStage()
// 【役割】中央のマネキン試着室ステージ（重なり順、服の画像、着用中スロット）を描画する
// 【具体的な処理内容】
//   ・マネキンの素体画像の上に、現在着ている服の画像を正しい重なり順
//     （下着→ボトムス→トップス→アウター→帽子）で重ねて表示します
// ==========================================================================
function renderMannequinStage() {
    // 定数 outfit を宣言し、値（AppState.currentOutfit || {}）をセットします
    const outfit = AppState.currentOutfit || {};
    // 定数 slots を宣言し、値（['shoes', 'bottoms', 'tops', 'outer', …）をセットします
    const slots = ['shoes', 'bottoms', 'tops', 'outer', 'hat'];

    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    slots.forEach(slot => {
        // HTML 要素 #対象ID を取得して変数 slotElem に格納します
        const slotElem = document.getElementById(`layer-${slot}`);
        // HTML 要素 #対象ID を取得して変数 layerContent に格納します
        const layerContent = document.getElementById(`layer-content-${slot}`);
        // 定数 item を宣言し、値（outfit[slot]）をセットします
        const item = outfit[slot];

        // 条件（slotElem）が成り立つか判定し、該当する場合の処理を実行します
        if (slotElem) {
            // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（slotElem.classList.toggle('has-item', !!(i…）
            slotElem.classList.toggle('has-item', !!(item && item.image));
        }

        // 条件（layerContent）が成り立つか判定し、該当する場合の処理を実行します
        if (layerContent) {
            // 条件（item && item.image）が成り立つか判定し、該当する場合の処理を実行します
            if (item && item.image) {
                // 定数 fallback を宣言し、値（getCategoryFallbackImage(item.category…）をセットします
                const fallback = getCategoryFallbackImage(item.category);
                // テンプレートリテラルで組み立てた HTML を要素 layerContent 内に書き込んで画面を更新します
                layerContent.innerHTML = `<img src="${item.image}" alt="${item.name}" class="layer-img" onerror="this.onerror=null;this.src='${fallback}';">`;
                // 上記の if 条件に当てはまらなかった場合の分岐処理です
            } else {
                // 生成・変換した HTML 文字列を要素 layerContent の中身として描画します
                layerContent.innerHTML = '';
            }
        }
    });

    // HTML 要素 #wearing-slots-bar を取得して変数 slotsBar に格納します
    const slotsBar = document.getElementById('wearing-slots-bar');
    // 条件（slotsBar）が成り立つか判定し、該当する場合の処理を実行します
    if (slotsBar) {
        // 定数 chipsHtml を宣言し、値（[]）をセットします
        const chipsHtml = [];
        // 配列要素やインデックスを順番に繰り返すループ処理（for (const slotKey of slots) {）を開始します
        for (const slotKey of slots) {
            // 定数 item を宣言し、値（outfit[slotKey]）をセットします
            const item = outfit[slotKey];
            // 条件（item）が成り立つか判定し、該当する場合の処理を実行します
            if (item) {
                // 定数 badgeLabel を宣言し、値（item.isOwned ? '手持ち' : 'ブランド'）をセットします
                const badgeLabel = item.isOwned ? '手持ち' : 'ブランド';
                // 定数 isFreeSlot を宣言し、値（(slotKey === 'shoes' || slotKey === 'h…）をセットします
                const isFreeSlot = (slotKey === 'shoes' || slotKey === 'hat');
                // 定数 sizeBadge を宣言し、値（(!item.isOwned && item.size && !isFree…）をセットします
                const sizeBadge = (!item.isOwned && item.size && !isFreeSlot) ? ` [${item.size}]` : '';
                // 配列の末尾に新しい要素を追加します（chipsHtml.push(`）
                chipsHtml.push(`
                    <span class="wearing-chip">
                        <span>${getCategoryNameJP(item.category)}: ${item.name}${sizeBadge} (${badgeLabel})</span>
                        <button class="wearing-chip-del" onclick="unwearSlot('${slotKey}')" title="脱がせる">×</button>
                    </span>
                `);
            }
        }
        // 生成・変換した HTML 文字列を要素 slotsBar の中身として描画します
        slotsBar.innerHTML = chipsHtml.join('');
    }

    // 再代入可能な変数 brandCount を宣言し、値（0）をセットします
    let brandCount = 0;
    // 再代入可能な変数 brandPrice を宣言し、値（0）をセットします
    let brandPrice = 0;
    // 配列要素やインデックスを順番に繰り返すループ処理（for (const slotKey of slots) {）を開始します
    for (const slotKey of slots) {
        // 定数 item を宣言し、値（outfit[slotKey]）をセットします
        const item = outfit[slotKey];
        // 条件（item && !item.isOwned）が成り立つか判定し、該当する場合の処理を実行します
        if (item && !item.isOwned) {
            // 変数・配列項目 brandCount の値を更新・計算します
            brandCount++;
            // 変数・配列項目 brandPrice の値を更新・計算します
            brandPrice += (item.price || 0);
        }
    }

    // HTML 要素 #brand-sum-count を取得して変数 countElem に格納します
    const countElem = document.getElementById('brand-sum-count');
    // 条件（countElem）が成り立つか判定し、該当する場合の処理を実行します
    if (countElem) countElem.textContent = `${brandCount}点`;

    // HTML 要素 #brand-sum-price を取得して変数 priceElem に格納します
    const priceElem = document.getElementById('brand-sum-price');
    // 条件（priceElem）が成り立つか判定し、該当する場合の処理を実行します
    if (priceElem) priceElem.textContent = `¥${brandPrice.toLocaleString()}`;

    // HTML 要素 #btn-add-brand-to-cart を取得して変数 cartBtn に格納します
    const cartBtn = document.getElementById('btn-add-brand-to-cart');
    // 条件（cartBtn）が成り立つか判定し、該当する場合の処理を実行します
    if (cartBtn) {
        // 変数・配列項目 cartBtn.disabled の値を更新・計算します
        cartBtn.disabled = (brandCount === 0);
    }

    // 関連処理 applyFittingOffsets() を呼び出して処理・画面を更新します
    applyFittingOffsets();

    // HTML 要素 #fitting-adjust-panel を取得して変数 adjustPanel に格納します
    const adjustPanel = document.getElementById('fitting-adjust-panel');
    // 条件（adjustPanel && adjustPanel.style.display !== 'none'）が成り立つか判定し、該当する場合の処理を実行します
    if (adjustPanel && adjustPanel.style.display !== 'none') {
        // 関連処理 syncAdjustPanelUI() を呼び出して処理・画面を更新します
        syncAdjustPanelUI();
    }
}

// ==========================================================================
// 【関数】handleStageSlotClick(slotKey)
// 【役割】試着室下部の着用スロット（帽子・トップス等）をクリックしたときの処理
// 【具体的な処理内容】
//   ・服を着ていれば「サイズ微調整パネル」を開き、
//     着ていなければ「簡易着せ替えピッカー」を開きます
// ==========================================================================
function handleStageSlotClick(slotKey) {
    // 定数 outfit を宣言し、値（AppState.currentOutfit || {}）をセットします
    const outfit = AppState.currentOutfit || {};
    // 定数 item を宣言し、値（outfit[slotKey]）をセットします
    const item = outfit[slotKey];

    // 条件（item）が成り立つか判定し、該当する場合の処理を実行します
    if (item) {
        // 専用ヘルパー関数 unwearSlot() を実行して状態や表示ラベルを更新します
        unwearSlot(slotKey);
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 関連処理 openStageQuickPicker() を呼び出して処理・画面を更新します
        openStageQuickPicker(slotKey);
    }
}

// ==========================================================================
// 【関数】openStageQuickPicker(slotKey)
// 【役割】部位を選んで直接着せ替えられる「簡易選択ポップアップ」を開く
// 【具体的な処理内容】
//   ・その部位に着せられる手持ち服と販売商品を一覧表示し、
//     選んですぐに着せ替えられます
// ==========================================================================
function openStageQuickPicker(slotKey) {
    // HTML 要素 #stage-quick-picker を取得して変数 picker に格納します
    const picker = document.getElementById('stage-quick-picker');
    // HTML 要素 #quick-picker-title を取得して変数 title に格納します
    const title = document.getElementById('quick-picker-title');
    // HTML 要素 #quick-picker-body を取得して変数 body に格納します
    const body = document.getElementById('quick-picker-body');
    // 条件（!picker || !body）が成り立つか判定し、該当する場合の処理を実行します
    if (!picker || !body) return;

    // 定数 catNameMap を宣言し、値（{）をセットします
    const catNameMap = {
        // オブジェクトの 'outer' プロパティ値を設定します
        outer: { name: 'アウター', cat: 'OUTER' },
        // オブジェクトの 'tops' プロパティ値を設定します
        tops: { name: 'トップス', cat: 'TOPS' },
        // オブジェクトの 'bottoms' プロパティ値を設定します
        bottoms: { name: 'ボトムス', cat: 'BOTTOMS' },
        // オブジェクトの 'shoes' プロパティ値を設定します
        shoes: { name: '靴', cat: 'SHOES' },
        // オブジェクトの 'hat' プロパティ値を設定します
        hat: { name: '帽子', cat: 'HAT' }
    };
    // 定数 catInfo を宣言し、値（catNameMap[slotKey] || { name: 'アイテム',…）をセットします
    const catInfo = catNameMap[slotKey] || { name: 'アイテム', cat: 'ALL' };
    // 条件（title）が成り立つか判定し、該当する場合の処理を実行します
    if (title) title.textContent = `${catInfo.name} を選択して試着`;

    // 定数 myItems を宣言し、値（AppState.myCloset.filter(c => c.catego…）をセットします
    const myItems = AppState.myCloset.filter(c => c.category === catInfo.cat);
    // 全商品マスター SAMPLE_PRODUCTS から条件に合う商品を検索・抽出して brandItems に入れます
    const brandItems = SAMPLE_PRODUCTS.filter(p => p.category === catInfo.cat);

    // 再代入可能な変数 html を宣言し、値（''）をセットします
    let html = '';
    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (myItems.length === 0 && brandItems.length === 0) {
        // 変数・配列項目 html の値を更新・計算します
        html = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; font-size: 0.75rem; padding: 12px;">選択できるアイテムがありません</p>';
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
        myItems.forEach(item => {
            // 定数 fb を宣言し、値（getCategoryFallbackImage(item.category…）をセットします
            const fb = getCategoryFallbackImage(item.category);
            // 変数・配列項目 html の値を更新・計算します
            html += `
            <div class="quick-picker-card" onclick="toggleWearItem('${item.id}', true); closeStageQuickPicker();" title="${item.name}" >
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${fb}';">
                    <div class="quick-picker-card-name">${item.name}</div>
                    <span style="font-size: 0.6rem; color: #0284c7; font-weight: 600;">[手持ち]</span>
                </div>
        `;
        });
        // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
        brandItems.forEach(p => {
            // 定数 fb を宣言し、値（getCategoryFallbackImage(p.category)）をセットします
            const fb = getCategoryFallbackImage(p.category);
            // 変数・配列項目 html の値を更新・計算します
            html += `
            <div class="quick-picker-card" onclick="toggleWearItem(${p.id}, false); closeStageQuickPicker();" title="${p.name}" >
                <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='${fb}';">
                    <div class="quick-picker-card-name">${p.name}</div>
                    <span style="font-size: 0.6rem; color: #e11d48; font-weight: 600;">¥${p.price.toLocaleString()}</span>
                </div>
        `;
        });
    }

    // 生成・変換した HTML 文字列を要素 body の中身として描画します
    body.innerHTML = html;
    // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（picker.style.display = 'block';）
    picker.style.display = 'block';

    // 関連処理 handleStudioClosetFilter() を呼び出して処理・画面を更新します
    handleStudioClosetFilter(catInfo.cat);
    // 関連処理 handleStudioBrandFilter() を呼び出して処理・画面を更新します
    handleStudioBrandFilter(catInfo.cat);
}

// ==========================================================================
// 【関数】closeStageQuickPicker()
// 【役割】簡易選択ポップアップを閉じる
// 【具体的な処理内容】
//   ・開いていたポップアップを画面から消去します
// ==========================================================================
function closeStageQuickPicker() {
    // HTML 要素 #stage-quick-picker を取得して変数 picker に格納します
    const picker = document.getElementById('stage-quick-picker');
    // 条件（picker）が成り立つか判定し、該当する場合の処理を実行します
    if (picker) picker.style.display = 'none';
}

// ==========================================================================
// 【関数】handleCardDragStart(event, itemId, isOwned)
// 【役割】服カードをドラッグし始めたときの処理
// 【具体的な処理内容】
//   ・つかんだ服のIDや手持ち服フラグをドラッグデータ（dataTransfer）に記憶させます
// ==========================================================================
function handleCardDragStart(event, itemId, isOwned) {
    // ドラッグ中のアイテム種類とIDを文字列データとしてブラウザの転送領域へ格納します
    event.dataTransfer.setData('text/plain', JSON.stringify({ itemId, isOwned }));
    // 変数・配列項目 event.dataTransfer.effectAllowed の値を更新・計算します
    event.dataTransfer.effectAllowed = 'copy';
}

// ==========================================================================
// 【関数】handleStageDragOver(event)
// 【役割】服をマネキンステージの上にドラッグして持ってきたときの処理
// 【具体的な処理内容】
//   ・ドロップ可能であることをブラウザに伝え、ステージに青い枠線を付けて目立たせます
// ==========================================================================
function handleStageDragOver(event) {
    // フォーム送信やボタン押下に伴うページリロード等のブラウザ標準動作をキャンセルします
    event.preventDefault();
    // 変数・配列項目 event.dataTransfer.dropEffect の値を更新・計算します
    event.dataTransfer.dropEffect = 'copy';
    // HTML 要素 #mannequin-stage-box を取得して変数 box に格納します
    const box = document.getElementById('mannequin-stage-box');
    // 条件（box）が成り立つか判定し、該当する場合の処理を実行します
    if (box) box.classList.add('is-dragover');
}

// ==========================================================================
// 【関数】handleStageDragLeave(event)
// 【役割】ドラッグ中の服がマネキンステージの外へ離れたときの処理
// 【具体的な処理内容】
//   ・ステージの枠線の強調表示を元に戻します
// ==========================================================================
function handleStageDragLeave(event) {
    // HTML 要素 #mannequin-stage-box を取得して変数 box に格納します
    const box = document.getElementById('mannequin-stage-box');
    // 条件（box）が成り立つか判定し、該当する場合の処理を実行します
    if (box) box.classList.remove('is-dragover');
}

// ==========================================================================
// 【関数】handleStageDrop(event)
// 【役割】マネキンステージの上で服を離した（ドロップした）ときの処理
// 【具体的な処理内容】
//   ・ドラッグしていた服をマネキンに着用させ、画面を更新してサーバーに保存します
// ==========================================================================
function handleStageDrop(event) {
    // フォーム送信やボタン押下に伴うページリロード等のブラウザ標準動作をキャンセルします
    event.preventDefault();
    // HTML 要素 #mannequin-stage-box を取得して変数 box に格納します
    const box = document.getElementById('mannequin-stage-box');
    // 条件（box）が成り立つか判定し、該当する場合の処理を実行します
    if (box) box.classList.remove('is-dragover');

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // 定数 data を宣言し、値（JSON.parse(event.dataTransfer.getData(…）をセットします
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        // 条件（data && data.itemId !== undefined）が成り立つか判定し、該当する場合の処理を実行します
        if (data && data.itemId !== undefined) {
            // 関連処理 toggleWearItem() を呼び出して処理・画面を更新します
            toggleWearItem(data.itemId, !!data.isOwned);
        }
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.error('Drop error:', e);
    }
}

// ==========================================================================
// 【関数】applyFittingOffsets()
// 【役割】スライダーで変更した服の位置や大きさをマネキン上の服に即時反映する
// 【具体的な処理内容】
//   ・CSSの `transform: translate(...) scale(...)` を使って、
//     服画像をミリ単位・パーセント単位で動かします
// ==========================================================================
function applyFittingOffsets() {
    // 定数 offsets を宣言し、値（AppState.fittingOffsets || {}）をセットします
    const offsets = AppState.fittingOffsets || {};
    // 定数 slots を宣言し、値（['outer', 'tops', 'bottoms', 'shoes', …）をセットします
    const slots = ['outer', 'tops', 'bottoms', 'shoes', 'hat'];
    // 定数 outfit を宣言し、値（AppState.currentOutfit || {}）をセットします
    const outfit = AppState.currentOutfit || {};

    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    slots.forEach(slot => {
        // HTML 要素 #対象ID を取得して変数 layerElem に格納します
        const layerElem = document.getElementById(`layer-${slot}`);
        // 条件（!layerElem）が成り立つか判定し、該当する場合の処理を実行します
        if (!layerElem) return;
        // 定数 off を宣言し、値（offsets[slot] || { x: 0, y: 0, scale: …）をセットします
        const off = offsets[slot] || { x: 0, y: 0, scale: 100, brandSize: 'M' };
        // 定数 item を宣言し、値（outfit[slot]）をセットします
        const item = outfit[slot];

        // 再代入可能な変数 effectiveScale を宣言し、値（100）をセットします
        let effectiveScale = 100;
        // 定数 isFreeScaleSlot を宣言し、値（(slot === 'shoes' || slot === 'hat')）をセットします
        const isFreeScaleSlot = (slot === 'shoes' || slot === 'hat');
        // 条件（!isFreeScaleSlot && item && !item.isOwned）が成り立つか判定し、該当する場合の処理を実行します
        if (!isFreeScaleSlot && item && !item.isOwned) {
            // 定数 bSize を宣言し、値（off.brandSize || item.size || 'M'）をセットします
            const bSize = off.brandSize || item.size || 'M';
            // 変数・配列項目 effectiveScale の値を更新・計算します
            effectiveScale = BRAND_SIZE_SCALES[bSize] || 100;
            // 前の if が偽で、かつ（item && (item.isOwned || isFreeScaleSlot)）を満たす場合の別条件分岐です
        } else if (item && (item.isOwned || isFreeScaleSlot)) {
            // 変数・配列項目 effectiveScale の値を更新・計算します
            effectiveScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 変数・配列項目 effectiveScale の値を更新・計算します
            effectiveScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        }

        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（layerElem.style.setProperty('--offset-x', …）
        layerElem.style.setProperty('--offset-x', `${off.x || 0}px`);
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（layerElem.style.setProperty('--offset-y', …）
        layerElem.style.setProperty('--offset-y', `${off.y || 0}px`);
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（layerElem.style.setProperty('--scale', eff…）
        layerElem.style.setProperty('--scale', effectiveScale / 100);
    });
}

// ==========================================================================
// 【関数】toggleFittingAdjustPanel()
// 【役割】ツールバーの「服の位置・サイズ微調整」パネルを開閉する
// 【具体的な処理内容】
//   ・調整パネルの表示／非表示を切り替えます
// ==========================================================================
function toggleFittingAdjustPanel() {
    // HTML 要素 #fitting-adjust-panel を取得して変数 panel に格納します
    const panel = document.getElementById('fitting-adjust-panel');
    // HTML 要素 #btn-toggle-adjust-mode を取得して変数 btn に格納します
    const btn = document.getElementById('btn-toggle-adjust-mode');
    // 条件（!panel）が成り立つか判定し、該当する場合の処理を実行します
    if (!panel) return;

    // 定数 isHidden を宣言し、値（panel.style.display === 'none' || pane…）をセットします
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（panel.style.display = isHidden ? 'block' :…）
    panel.style.display = isHidden ? 'block' : 'none';
    // 条件（btn）が成り立つか判定し、該当する場合の処理を実行します
    if (btn) btn.classList.toggle('active', isHidden);

    // 条件（isHidden）が成り立つか判定し、該当する場合の処理を実行します
    if (isHidden) {
        // 関連処理 syncAdjustPanelUI() を呼び出して処理・画面を更新します
        syncAdjustPanelUI();
    }
}

// ==========================================================================
// 【関数】switchAdjustSlot(slotKey)
// 【役割】調整パネル内で微調整する部位（帽子／アウター／トップス／ボトムス／靴）を切り替える
// 【具体的な処理内容】
//   ・選ばれた部位のタブをアクティブにし、その服の現在の位置・サイズ数値をスライダーに反映します
// ==========================================================================
function switchAdjustSlot(slotKey) {
    // アプリ全体状態 AppState.activeAdjustSlot を最新値（slotKey）に更新します
    AppState.activeAdjustSlot = slotKey;
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('#adjust-slot-tabs .adjust-tab-btn').forEach(btn => {
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（btn.classList.toggle('active', btn.getAttr…）
        btn.classList.toggle('active', btn.getAttribute('data-adjust-slot') === slotKey);
    });
    // 関連処理 syncAdjustPanelUI() を呼び出して処理・画面を更新します
    syncAdjustPanelUI();
}

// ==========================================================================
// 【関数】syncAdjustPanelUI()
// 【役割】選択中の部位に合わせて、調整パネルのスライダーや数値を最新表示に同期する
// 【具体的な処理内容】
//   ・「販売商品（XS〜XL規格サイズ）」か「手持ち服（自由拡大率）」かに応じて、
//     適切な調整バーを表示します
// ==========================================================================
function syncAdjustPanelUI() {
    // 定数 slotKey を宣言し、値（AppState.activeAdjustSlot || 'outer'）をセットします
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('#adjust-slot-tabs .adjust-tab-btn').forEach(btn => {
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（btn.classList.toggle('active', btn.getAttr…）
        btn.classList.toggle('active', btn.getAttribute('data-adjust-slot') === slotKey);
    });
    // 定数 offsets を宣言し、値（AppState.fittingOffsets || {}）をセットします
    const offsets = AppState.fittingOffsets || {};
    // 定数 off を宣言し、値（offsets[slotKey] || { x: 0, y: 0, scal…）をセットします
    const off = offsets[slotKey] || { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    // 定数 outfit を宣言し、値（AppState.currentOutfit || {}）をセットします
    const outfit = AppState.currentOutfit || {};
    // 定数 item を宣言し、値（outfit[slotKey]）をセットします
    const item = outfit[slotKey];
    // 定数 isFreeScaleSlot を宣言し、値（(slotKey === 'shoes' || slotKey === 'h…）をセットします
    const isFreeScaleSlot = (slotKey === 'shoes' || slotKey === 'hat');

    // HTML 要素 #slider-adjust-y を取得して変数 sliderY に格納します
    const sliderY = document.getElementById('slider-adjust-y');
    // HTML 要素 #slider-adjust-x を取得して変数 sliderX に格納します
    const sliderX = document.getElementById('slider-adjust-x');
    // HTML 要素 #val-adjust-y を取得して変数 valY に格納します
    const valY = document.getElementById('val-adjust-y');
    // HTML 要素 #val-adjust-x を取得して変数 valX に格納します
    const valX = document.getElementById('val-adjust-x');

    // HTML 要素 #adjust-item-badge を取得して変数 badgeElem に格納します
    const badgeElem = document.getElementById('adjust-item-badge');
    // HTML 要素 #adjust-item-name を取得して変数 nameElem に格納します
    const nameElem = document.getElementById('adjust-item-name');
    // HTML 要素 #adjust-item-type-desc を取得して変数 descElem に格納します
    const descElem = document.getElementById('adjust-item-type-desc');
    // HTML 要素 #adjust-row-scale-brand を取得して変数 rowBrand に格納します
    const rowBrand = document.getElementById('adjust-row-scale-brand');
    // HTML 要素 #adjust-row-scale-free を取得して変数 rowFree に格納します
    const rowFree = document.getElementById('adjust-row-scale-free');
    // HTML 要素 #.adjust-hint を取得して変数 hintElem に格納します
    const hintElem = document.querySelector('.adjust-hint') || document.getElementById('adjust-hint-text');

    // HTML 要素 #slider-adjust-brand-size を取得して変数 sliderBrandSize に格納します
    const sliderBrandSize = document.getElementById('slider-adjust-brand-size');
    // HTML 要素 #val-adjust-brand-size を取得して変数 valBrandSize に格納します
    const valBrandSize = document.getElementById('val-adjust-brand-size');
    // HTML 要素 #btn-brand-size-minus を取得して変数 btnBrandMinus に格納します
    const btnBrandMinus = document.getElementById('btn-brand-size-minus');
    // HTML 要素 #btn-brand-size-plus を取得して変数 btnBrandPlus に格納します
    const btnBrandPlus = document.getElementById('btn-brand-size-plus');

    // HTML 要素 #slider-adjust-scale を取得して変数 sliderScale に格納します
    const sliderScale = document.getElementById('slider-adjust-scale');
    // HTML 要素 #val-adjust-scale を取得して変数 valScale に格納します
    const valScale = document.getElementById('val-adjust-scale');

    // 条件（sliderY）が成り立つか判定し、該当する場合の処理を実行します
    if (sliderY) sliderY.value = off.y || 0;
    // 条件（sliderX）が成り立つか判定し、該当する場合の処理を実行します
    if (sliderX) sliderX.value = off.x || 0;
    // 条件（valY）が成り立つか判定し、該当する場合の処理を実行します
    if (valY) valY.textContent = `${off.y > 0 ? '+' : ''}${off.y || 0}px`;
    // 条件（valX）が成り立つか判定し、該当する場合の処理を実行します
    if (valX) valX.textContent = `${off.x > 0 ? '+' : ''}${off.x || 0}px`;

    // 条件（!item）が成り立つか判定し、該当する場合の処理を実行します
    if (!item) {
        // 条件（badgeElem）が成り立つか判定し、該当する場合の処理を実行します
        if (badgeElem) {
            // 変数・配列項目 badgeElem.className の値を更新・計算します
            badgeElem.className = 'adjust-item-tag empty';
            // 文字要素 badgeElem の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
            badgeElem.textContent = '未着用';
        }
        // 条件（nameElem）が成り立つか判定し、該当する場合の処理を実行します
        if (nameElem) nameElem.textContent = `${getCategoryNameJP(slotKey.toUpperCase())}（未着用）`;
        // 条件（descElem）が成り立つか判定し、該当する場合の処理を実行します
        // if(descElem)はもしステージ上に服が存在していたら
        // descElem.textContent = .... その表示エリアを書き換える
        // isFreeScaleSlot ? A : B 条件？が正しいとき(A):違うとき(B)に書き換える

        if (descElem) descElem.textContent = isFreeScaleSlot ? '自由サイズ調整（70%〜140%）' : '試着すると調整可能';

        // 条件（sliderY）が成り立つか判定し、該当する場合の処理を実行します
        if (sliderY) sliderY.disabled = true;
        // 条件（sliderX）が成り立つか判定し、該当する場合の処理を実行します
        if (sliderX) sliderX.disabled = true;

        // 条件（isFreeScaleSlot）が成り立つか判定し、該当する場合の処理を実行します
        if (isFreeScaleSlot) {
            // 条件（rowBrand）が成り立つか判定し、該当する場合の処理を実行します
            if (rowBrand) rowBrand.style.display = 'none';
            // 条件（rowFree）が成り立つか判定し、該当する場合の処理を実行します
            if (rowFree) rowFree.style.display = 'flex';
            // 条件（sliderScale）が成り立つか判定し、該当する場合の処理を実行します
            if (sliderScale) {
                // 変数・配列項目 sliderScale.disabled の値を更新・計算します
                sliderScale.disabled = true;
                // 入力フォーム部品 sliderScale の現在の入力値を更新・リセットします
                sliderScale.value = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
            }
            // 条件（valScale）が成り立つか判定し、該当する場合の処理を実行します
            if (valScale) valScale.textContent = `${(off.customScale !== undefined) ? off.customScale : (off.scale || 100)}%`;
            // 条件（hintElem）が成り立つか判定し、該当する場合の処理を実行します
            if (hintElem) hintElem.textContent = `💡 ${slotKey === 'hat' ? '帽子' : '靴'}をクローゼットから着用すると、マネキンに合わせてサイズ（70%〜140%）や位置を自由に微調整できます`;
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 条件（rowBrand）が成り立つか判定し、該当する場合の処理を実行します
            if (rowBrand) rowBrand.style.display = 'flex';
            // 条件（rowFree）が成り立つか判定し、該当する場合の処理を実行します
            if (rowFree) rowFree.style.display = 'none';
            // 条件（sliderBrandSize）が成り立つか判定し、該当する場合の処理を実行します
            if (sliderBrandSize) sliderBrandSize.disabled = true;
            // 条件（btnBrandMinus）が成り立つか判定し、該当する場合の処理を実行します
            if (btnBrandMinus) btnBrandMinus.disabled = true;
            // 条件（btnBrandPlus）が成り立つか判定し、該当する場合の処理を実行します
            if (btnBrandPlus) btnBrandPlus.disabled = true;
            // 条件（hintElem）が成り立つか判定し、該当する場合の処理を実行します
            if (hintElem) hintElem.textContent = '💡 クローゼットまたは商品一覧から服を選んでマネキンに試着してください';
        }
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 条件（sliderY）が成り立つか判定し、該当する場合の処理を実行します
    if (sliderY) sliderY.disabled = false;
    // 条件（sliderX）が成り立つか判定し、該当する場合の処理を実行します
    if (sliderX) sliderX.disabled = false;
    // 条件（sliderBrandSize）が成り立つか判定し、該当する場合の処理を実行します
    if (sliderBrandSize) sliderBrandSize.disabled = false;
    // 条件（sliderScale）が成り立つか判定し、該当する場合の処理を実行します
    if (sliderScale) sliderScale.disabled = false;

    // 条件（isFreeScaleSlot）が成り立つか判定し、該当する場合の処理を実行します
    if (isFreeScaleSlot) {
        // 条件（badgeElem）が成り立つか判定し、該当する場合の処理を実行します
        if (badgeElem) {
            // 変数・配列項目 badgeElem.className の値を更新・計算します
            badgeElem.className = (item.isOwned !== false) ? 'adjust-item-tag closet' : 'adjust-item-tag brand';
            // 文字要素 badgeElem の表示テキストを新しい値へ書き換えます（すべてのジャンルでマイクローゼットに統一）
            badgeElem.textContent = (item.isOwned !== false) ? '👕 マイクローゼット' : '🏷️ 販売商品';
        }
        // 条件（nameElem）が成り立つか判定し、該当する場合の処理を実行します
        if (nameElem) nameElem.textContent = item.name;
        // 条件（descElem）が成り立つか判定し、該当する場合の処理を実行します
        if (descElem) descElem.textContent = '自由サイズ調整（70%〜140%）';

        // 条件（rowBrand）が成り立つか判定し、該当する場合の処理を実行します
        if (rowBrand) rowBrand.style.display = 'none';
        // 条件（rowFree）が成り立つか判定し、該当する場合の処理を実行します
        if (rowFree) rowFree.style.display = 'flex';

        // 定数 currentScale を宣言し、値（(off.customScale !== undefined) ? off.…）をセットします
        const currentScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        // 条件（sliderScale）が成り立つか判定し、該当する場合の処理を実行します
        if (sliderScale) sliderScale.value = currentScale;
        // 条件（valScale）が成り立つか判定し、該当する場合の処理を実行します
        if (valScale) valScale.textContent = `${currentScale}%`;

        // 条件（hintElem）が成り立つか判定し、該当する場合の処理を実行します
        if (hintElem) hintElem.textContent = `💡 ${slotKey === 'hat' ? '帽子' : '靴'}はスライダーで大きさを70%〜140%まで自由に拡大・縮小できます（自動保存）`;

        // 前の if が偽で、かつ（!item.isOwned）を満たす場合の別条件分岐です
    } else if (!item.isOwned) {
        // 条件（badgeElem）が成り立つか判定し、該当する場合の処理を実行します
        if (badgeElem) {
            // 変数・配列項目 badgeElem.className の値を更新・計算します
            badgeElem.className = 'adjust-item-tag brand';
            // 文字要素 badgeElem の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
            badgeElem.textContent = '🏷️ 販売商品';
        }
        // 条件（nameElem）が成り立つか判定し、該当する場合の処理を実行します
        if (nameElem) nameElem.textContent = item.name;
        // 条件（descElem）が成り立つか判定し、該当する場合の処理を実行します
        if (descElem) descElem.textContent = '規格サイズ（XS〜XL）';

        // 条件（rowBrand）が成り立つか判定し、該当する場合の処理を実行します
        if (rowBrand) rowBrand.style.display = 'flex';
        // 条件（rowFree）が成り立つか判定し、該当する場合の処理を実行します
        if (rowFree) rowFree.style.display = 'none';

        // 定数 currentSize を宣言し、値（off.brandSize || item.size || 'M'）をセットします
        const currentSize = off.brandSize || item.size || 'M';
        // 定数 sizeIdx を宣言し、値（BRAND_SIZE_LIST.indexOf(currentSize)）をセットします
        const sizeIdx = BRAND_SIZE_LIST.indexOf(currentSize);
        // 定数 validIdx を宣言し、値（(sizeIdx >= 0) ? sizeIdx : 2）をセットします
        const validIdx = (sizeIdx >= 0) ? sizeIdx : 2;

        // 条件（sliderBrandSize）が成り立つか判定し、該当する場合の処理を実行します
        if (sliderBrandSize) sliderBrandSize.value = validIdx;
        // 条件（valBrandSize）が成り立つか判定し、該当する場合の処理を実行します
        if (valBrandSize) valBrandSize.textContent = BRAND_SIZE_LIST[validIdx];

        // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
        document.querySelectorAll('#brand-size-ticks .brand-size-tick').forEach(tick => {
            // 定数 tIdx を宣言し、値（parseInt(tick.getAttribute('data-size-…）をセットします
            const tIdx = parseInt(tick.getAttribute('data-size-idx'), 10);
            // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（tick.classList.toggle('active', tIdx === v…）
            tick.classList.toggle('active', tIdx === validIdx);
        });

        // 条件（btnBrandMinus）が成り立つか判定し、該当する場合の処理を実行します
        if (btnBrandMinus) btnBrandMinus.disabled = (validIdx <= 0);
        // 条件（btnBrandPlus）が成り立つか判定し、該当する場合の処理を実行します
        if (btnBrandPlus) btnBrandPlus.disabled = (validIdx >= BRAND_SIZE_LIST.length - 1);

        // 条件（hintElem）が成り立つか判定し、該当する場合の処理を実行します
        if (hintElem) hintElem.textContent = '💡 販売商品はXS〜XLのサイズ規格でマネキン上の表示サイズが変わります（自動保存）';

        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 条件（badgeElem）が成り立つか判定し、該当する場合の処理を実行します
        if (badgeElem) {
            // 変数・配列項目 badgeElem.className の値を更新・計算します
            badgeElem.className = 'adjust-item-tag closet';
            // 文字要素 badgeElem の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
            badgeElem.textContent = '👕 マイクローゼット';
        }
        // 条件（nameElem）が成り立つか判定し、該当する場合の処理を実行します
        if (nameElem) nameElem.textContent = item.name;
        // 条件（descElem）が成り立つか判定し、該当する場合の処理を実行します
        if (descElem) descElem.textContent = '自由サイズ調整（見た目補正）';

        // 条件（rowBrand）が成り立つか判定し、該当する場合の処理を実行します
        if (rowBrand) rowBrand.style.display = 'none';
        // 条件（rowFree）が成り立つか判定し、該当する場合の処理を実行します
        if (rowFree) rowFree.style.display = 'flex';

        // 定数 currentScale を宣言し、値（(off.customScale !== undefined) ? off.…）をセットします
        const currentScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        // 条件（sliderScale）が成り立つか判定し、該当する場合の処理を実行します
        if (sliderScale) sliderScale.value = currentScale;
        // 条件（valScale）が成り立つか判定し、該当する場合の処理を実行します
        if (valScale) valScale.textContent = `${currentScale}%`;

        // 条件（hintElem）が成り立つか判定し、該当する場合の処理を実行します
        if (hintElem) hintElem.textContent = '💡 手持ちの服はブランドによって実寸が異なるため、見た目の大きさを自由に調整できます（自動保存）';
    }
}

// ==========================================================================
// 【関数】handleBrandSizeInput(val)
// 【役割】販売商品のサイズスライダー（XS〜XL）を動かしたときの処理
// 【具体的な処理内容】
//   ・選ばれたサイズ規格に合わせてマネキン上の服の大きさを拡大・縮小し、自動保存します
// ==========================================================================
function handleBrandSizeInput(val) {
    // 定数 slotKey を宣言し、値（AppState.activeAdjustSlot || 'outer'）をセットします
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // 条件（slotKey === 'shoes' || slotKey === 'hat'）が成り立つか判定し、該当する場合の処理を実行します
    if (slotKey === 'shoes' || slotKey === 'hat') return;

    // 条件（!AppState.fittingOffsets[slotKey]）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.fittingOffsets[slotKey]) {
        // 変数・配列項目 AppState.fittingOffsets[slotKey] の値を更新・計算します
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    // 定数 idx を宣言し、値（parseInt(val, 10)）をセットします
    const idx = parseInt(val, 10);
    // 定数 clampedIdx を宣言し、値（Math.max(0, Math.min(BRAND_SIZE_LIST.l…）をセットします
    const clampedIdx = Math.max(0, Math.min(BRAND_SIZE_LIST.length - 1, idx));
    // 定数 sizeName を宣言し、値（BRAND_SIZE_LIST[clampedIdx]）をセットします
    const sizeName = BRAND_SIZE_LIST[clampedIdx];
    // 定数 targetScale を宣言し、値（BRAND_SIZE_SCALES[sizeName] || 100）をセットします
    const targetScale = BRAND_SIZE_SCALES[sizeName] || 100;

    // 変数・配列項目 AppState.fittingOffsets[slotKey]… の値を更新・計算します
    AppState.fittingOffsets[slotKey].brandSize = sizeName;
    // 変数・配列項目 AppState.fittingOffsets[slotKey]… の値を更新・計算します
    AppState.fittingOffsets[slotKey].scale = targetScale;

    // 条件（AppState.currentOutfit && AppState.currentOutfit[slo…）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentOutfit && AppState.currentOutfit[slotKey]) {
        // 変数・配列項目 AppState.currentOutfit[slotKey].… の値を更新・計算します
        AppState.currentOutfit[slotKey].size = sizeName;
    }

    // HTML 要素 #slider-adjust-brand-size を取得して変数 slider に格納します
    const slider = document.getElementById('slider-adjust-brand-size');
    // 条件（slider）が成り立つか判定し、該当する場合の処理を実行します
    if (slider) slider.value = clampedIdx;

    // HTML 要素 #val-adjust-brand-size を取得して変数 valElem に格納します
    const valElem = document.getElementById('val-adjust-brand-size');
    // 条件（valElem）が成り立つか判定し、該当する場合の処理を実行します
    if (valElem) valElem.textContent = sizeName;

    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('#brand-size-ticks .brand-size-tick').forEach(tick => {
        // 定数 tIdx を宣言し、値（parseInt(tick.getAttribute('data-size-…）をセットします
        const tIdx = parseInt(tick.getAttribute('data-size-idx'), 10);
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（tick.classList.toggle('active', tIdx === c…）
        tick.classList.toggle('active', tIdx === clampedIdx);
    });

    // HTML 要素 #btn-brand-size-minus を取得して変数 btnMinus に格納します
    const btnMinus = document.getElementById('btn-brand-size-minus');
    // HTML 要素 #btn-brand-size-plus を取得して変数 btnPlus に格納します
    const btnPlus = document.getElementById('btn-brand-size-plus');
    // 条件（btnMinus）が成り立つか判定し、該当する場合の処理を実行します
    if (btnMinus) btnMinus.disabled = (clampedIdx <= 0);
    // 条件（btnPlus）が成り立つか判定し、該当する場合の処理を実行します
    if (btnPlus) btnPlus.disabled = (clampedIdx >= BRAND_SIZE_LIST.length - 1);

    // 関連処理 applyFittingOffsets() を呼び出して処理・画面を更新します
    applyFittingOffsets();

    // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
    syncStudioStateToBackend({ immediate: false });
}

// ==========================================================================
// 【関数】stepBrandSize(delta)
// 【役割】販売商品サイズの「＋」「－」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・サイズを1段階大きく（S→M）または小さく（L→M）変更します
// ==========================================================================
function stepBrandSize(delta) {
    // 定数 slotKey を宣言し、値（AppState.activeAdjustSlot || 'outer'）をセットします
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // 条件（slotKey === 'shoes' || slotKey === 'hat'）が成り立つか判定し、該当する場合の処理を実行します
    if (slotKey === 'shoes' || slotKey === 'hat') return;

    // 定数 off を宣言し、値（(AppState.fittingOffsets && AppState.f…）をセットします
    const off = (AppState.fittingOffsets && AppState.fittingOffsets[slotKey]) || {};
    // 定数 outfit を宣言し、値（AppState.currentOutfit || {}）をセットします
    const outfit = AppState.currentOutfit || {};
    // 定数 item を宣言し、値（outfit[slotKey]）をセットします
    const item = outfit[slotKey];
    // 定数 currentSize を宣言し、値（off.brandSize || (item && item.size) |…）をセットします
    const currentSize = off.brandSize || (item && item.size) || 'M';
    // 定数 currentIdx を宣言し、値（BRAND_SIZE_LIST.indexOf(currentSize)）をセットします
    const currentIdx = BRAND_SIZE_LIST.indexOf(currentSize);
    // 定数 baseIdx を宣言し、値（(currentIdx >= 0) ? currentIdx : 2）をセットします
    const baseIdx = (currentIdx >= 0) ? currentIdx : 2;
    // 関連処理 handleBrandSizeInput() を呼び出して処理・画面を更新します
    handleBrandSizeInput(baseIdx + delta);
}

// ==========================================================================
// 【関数】handleAdjustInput(prop, val)
// 【役割】服の上下位置(Y軸)・左右位置(X軸)・拡大率スライダーを動かしたときの処理
// 【具体的な処理内容】
//   ・スライダーの数値を服画像にリアルタイム反映し、位置を微調整します
// ==========================================================================
function handleAdjustInput(prop, val) {
    // 定数 slotKey を宣言し、値（AppState.activeAdjustSlot || 'outer'）をセットします
    const slotKey = AppState.activeAdjustSlot || 'outer';

    // 条件（!AppState.fittingOffsets[slotKey]）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.fittingOffsets[slotKey]) {
        // 変数・配列項目 AppState.fittingOffsets[slotKey] の値を更新・計算します
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    // 定数 numVal を宣言し、値（parseInt(val, 10)）をセットします
    const numVal = parseInt(val, 10);
    // 変数・配列項目 AppState.fittingOffsets[slotKey]… の値を更新・計算します
    AppState.fittingOffsets[slotKey][prop] = numVal;
    // 条件（prop === 'scale'）が成り立つか判定し、該当する場合の処理を実行します
    if (prop === 'scale') {
        // 変数・配列項目 AppState.fittingOffsets[slotKey]… の値を更新・計算します
        AppState.fittingOffsets[slotKey].customScale = numVal;
    }

    // 条件（prop === 'y'）が成り立つか判定し、該当する場合の処理を実行します
    if (prop === 'y') {
        // HTML 要素 #val-adjust-y を取得して変数 valElem に格納します
        const valElem = document.getElementById('val-adjust-y');
        // 条件（valElem）が成り立つか判定し、該当する場合の処理を実行します
        if (valElem) valElem.textContent = `${numVal > 0 ? '+' : ''}${numVal}px`;
        // 前の if が偽で、かつ（prop === 'x'）を満たす場合の別条件分岐です
    } else if (prop === 'x') {
        // HTML 要素 #val-adjust-x を取得して変数 valElem に格納します
        const valElem = document.getElementById('val-adjust-x');
        // 条件（valElem）が成り立つか判定し、該当する場合の処理を実行します
        if (valElem) valElem.textContent = `${numVal > 0 ? '+' : ''}${numVal}px`;
        // 前の if が偽で、かつ（prop === 'scale'）を満たす場合の別条件分岐です
    } else if (prop === 'scale') {
        // HTML 要素 #val-adjust-scale を取得して変数 valElem に格納します
        const valElem = document.getElementById('val-adjust-scale');
        // 条件（valElem）が成り立つか判定し、該当する場合の処理を実行します
        if (valElem) valElem.textContent = `${numVal}%`;
    }

    // 関連処理 applyFittingOffsets() を呼び出して処理・画面を更新します
    applyFittingOffsets();

    // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
    syncStudioStateToBackend({ immediate: false });
}

// ==========================================================================
// 【関数】stepAdjust(prop, delta)
// 【役割】位置調整スライダー横の「＋」「－」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・位置やサイズを1ステップずつ細かく刻んで変更します
// ==========================================================================
function stepAdjust(prop, delta) {
    // 定数 slotKey を宣言し、値（AppState.activeAdjustSlot || 'outer'）をセットします
    const slotKey = AppState.activeAdjustSlot || 'outer';

    // 条件（!AppState.fittingOffsets[slotKey]）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.fittingOffsets[slotKey]) {
        // 変数・配列項目 AppState.fittingOffsets[slotKey] の値を更新・計算します
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    // 再代入可能な変数 current を宣言し、値（AppState.fittingOffsets[slotKey][prop]）をセットします
    let current = AppState.fittingOffsets[slotKey][prop];
    // 条件（current === undefined）が成り立つか判定し、該当する場合の処理を実行します
    if (current === undefined) {
        // 変数・配列項目 current の値を更新・計算します
        current = (prop === 'scale') ? 100 : 0;
    }
    // 定数 nextVal を宣言し、値（current + delta）をセットします
    const nextVal = current + delta;
    // 関連処理 handleAdjustInput() を呼び出して処理・画面を更新します
    handleAdjustInput(prop, nextVal);

    // HTML 要素 #対象ID を取得して変数 slider に格納します
    const slider = document.getElementById(`slider-adjust-${prop}`);
    // 条件（slider）が成り立つか判定し、該当する場合の処理を実行します
    if (slider) slider.value = nextVal;
}

// ==========================================================================
// 【関数】resetFittingOffsets()
// 【役割】調整パネルの「リセット」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・現在選んでいる部位の位置ズレや拡大率を初期値（0, 100%）に戻します
// ==========================================================================
function resetFittingOffsets() {
    // 定数 slotKey を宣言し、値（AppState.activeAdjustSlot || 'outer'）をセットします
    const slotKey = AppState.activeAdjustSlot || 'outer';

    // 変数・配列項目 AppState.fittingOffsets[slotKey] の値を更新・計算します
    AppState.fittingOffsets[slotKey] = {
        // 左右位置ズレ量 X（初期値 0）
        x: 0,
        // 上下位置ズレ量 Y（初期値 0）
        y: 0,
        // 拡大率 %（初期値 100）
        scale: 100,
        // ブランド商品用の規格サイズ（初期値 'M'）
        brandSize: 'M',
        // 手持ち登録服用の拡大率 %（初期値 100）
        customScale: 100
    };

    // 条件（AppState.currentOutfit && AppState.currentOutfit[slo…）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentOutfit && AppState.currentOutfit[slotKey] && !AppState.currentOutfit[slotKey].isOwned) {
        // 変数・配列項目 AppState.currentOutfit[slotKey].… の値を更新・計算します
        AppState.currentOutfit[slotKey].size = 'M';
    }

    // 関連処理 syncAdjustPanelUI() を呼び出して処理・画面を更新します
    syncAdjustPanelUI();
    // 関連処理 applyFittingOffsets() を呼び出して処理・画面を更新します
    applyFittingOffsets();
    // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
    syncStudioStateToBackend({ immediate: true });
    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToastNotification(`「${getCategoryNameJP(slotKey.toUpperCase())}」の位置とサイズをリセットしました`);
}

// ==========================================================================
// 【関数】switchMobileStudioView(viewKey)
// 【役割】スマホ表示時の「試着室／手持ち服／商品リスト」の表示切り替えタブ
// 【具体的な処理内容】
//   ・画面幅が狭いスマホで、マネキン画面・左棚・右棚を切り替えて表示します
// ==========================================================================
function switchMobileStudioView(viewKey) {
    // アプリ全体状態 AppState.studioMobileView を最新値（viewKey）に更新します
    AppState.studioMobileView = viewKey;

    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        // 条件に応じて要素の CSS クラスを ON / OFF 切り替えします（btn.classList.toggle('active', btn.getAttr…）
        btn.classList.toggle('active', btn.getAttribute('data-mobile-view') === viewKey);
    });

    // HTML 要素 #col-studio-closet を取得して変数 colCloset に格納します
    const colCloset = document.getElementById('col-studio-closet');
    // HTML 要素 #col-studio-mannequin を取得して変数 colMannequin に格納します
    const colMannequin = document.getElementById('col-studio-mannequin');
    // HTML 要素 #col-studio-brand を取得して変数 colBrand に格納します
    const colBrand = document.getElementById('col-studio-brand');

    // 条件（colCloset）が成り立つか判定し、該当する場合の処理を実行します
    if (colCloset) colCloset.classList.toggle('mobile-active', viewKey === 'closet');
    // 条件（colMannequin）が成り立つか判定し、該当する場合の処理を実行します
    if (colMannequin) colMannequin.classList.toggle('mobile-active', viewKey === 'mannequin');
    // 条件（colBrand）が成り立つか判定し、該当する場合の処理を実行します
    if (colBrand) colBrand.classList.toggle('mobile-active', viewKey === 'brand');
}

// ==========================================================================
// 【関数】analyzeOutfitColorComposition(outfit)
// 【役割】現在着ているコーディネートの色合い（カラー構成比率）を分析する
// 【具体的な処理内容】
//   ・着ている服の色を抽出して、全体の色バランスを算出します
// ==========================================================================
function analyzeOutfitColorComposition(outfit) {
    if (!outfit) return { breakdown: [], schemeType: '--', schemeComment: '', tags: [] };

    // 部位ごとの視覚的面積重み（アウター有無で配分を自動調整）
    const hasOuter = !!outfit.outer;
    const weights = hasOuter
        ? { outer: 40, tops: 25, bottoms: 25, shoes: 7, hat: 3 }
        : { tops: 45, bottoms: 35, shoes: 12, hat: 8 };

    const colorWeights = {};
    let totalWeight = 0;

    for (const [slot, item] of Object.entries(outfit)) {
        if (!item) continue;
        const color = (item.color || 'BLACK').toUpperCase();
        const w = weights[slot] || 10;
        colorWeights[color] = (colorWeights[color] || 0) + w;
        totalWeight += w;
    }

    if (totalWeight === 0) return { breakdown: [], schemeType: '--', schemeComment: '', tags: [] };

    // 各色の比率（%）を算出
    const entries = Object.entries(colorWeights).map(([color, weight]) => ({
        color,
        hex: typeof getColorHex === 'function' ? getColorHex(color) : '#666666',
        ratio: Math.round((weight / totalWeight) * 100),
        weight
    })).sort((a, b) => b.weight - a.weight);

    // 比率の合計を100%に補正（端数処理）
    const ratioSum = entries.reduce((acc, cur) => acc + cur.ratio, 0);
    if (ratioSum !== 100 && entries.length > 0) {
        entries[0].ratio += (100 - ratioSum);
    }

    // 役割を付与
    entries.forEach((item, idx) => {
        if (idx === 0) {
            item.role = item.ratio >= 50 ? 'ベースカラー (基調色)' : 'メインカラー';
        } else if (idx === 1) {
            item.role = 'アソートカラー (配合色)';
        } else {
            item.role = 'アクセントカラー (差し色)';
        }
    });

    // 配色パターンの判定
    const achromatics = ['BLACK', 'WHITE', 'CHARCOAL', 'GREY', 'ASH GREY', 'HEATHER GREY'];
    const earthTones = ['BEIGE', 'BROWN', 'DARK BROWN', 'KHAKI', 'GREEN', 'OLIVE', 'ECRU'];
    const blueTones = ['NAVY', 'BLUE', 'VINTAGE BLUE'];

    const allColors = entries.map(e => e.color);
    const areAllAchromatic = allColors.every(c => achromatics.includes(c));
    const achromaticRatio = entries.filter(e => achromatics.includes(e.color)).reduce((sum, e) => sum + e.ratio, 0);
    const earthRatio = entries.filter(e => earthTones.includes(e.color)).reduce((sum, e) => sum + e.ratio, 0);

    let schemeType = 'バランス配色';
    let schemeComment = '各アイテムの明暗と色味が美しく整った調和のあるスタイリングです。';
    let tags = ['#カラーバランス'];

    if (entries.length === 1) {
        if (entries[0].color === 'BLACK') {
            schemeType = 'オールブラック';
            schemeComment = '黒の統一感で極めて洗練されたモードな重厚感とスタイル引き締め効果を発揮しています。';
            tags = ['#オールブラック', '#モード'];
        } else {
            schemeType = 'ワンカラーワントーン';
            schemeComment = `${entries[0].color}で統一されたミニマルで洗練されたシルエットです。`;
            tags = ['#ワントーンコーデ'];
        }
    } else if (areAllAchromatic) {
        schemeType = 'モノトーンシック';
        schemeComment = '白・黒・グレーの無彩色のみで構成された、無駄のない都会的で上品なミニマリズムです。';
        tags = ['#モノトーンシック', '#モードミニマル'];
    } else if (achromaticRatio >= 70 && entries.length >= 2) {
        const accentItem = entries.find(e => !achromatics.includes(e.color));
        if (accentItem) {
            schemeType = 'モノトーン＋1差し色';
            schemeComment = `ベースのモノトーンに「${accentItem.color}」が絶妙なアクセント（差し色）として際立つ黄金比の配色です。`;
            tags = ['#モノトーン+1', '#差し色アクセント'];
        }
    } else if (earthRatio >= 65) {
        schemeType = 'アースカラー / ナチュラル';
        schemeComment = 'ベージュやブラウンなどの温もりある自然色でまとまり、落ち着いたこなれ感とリラックスした大人の余裕を演出しています。';
        tags = ['#アースカラー', '#ナチュラルシック'];
    } else if (allColors.every(c => blueTones.includes(c) || achromatics.includes(c))) {
        schemeType = 'ノーブルネイビー / クール';
        schemeComment = 'ネイビーとブルーを基調とした、清潔感と知的さを兼ね備えた好印象なトーンです。';
        tags = ['#ノーブルネイビー', '#清潔感'];
    } else if (allColors.includes('WHITE') && (allColors.includes('BLACK') || allColors.includes('NAVY'))) {
        schemeType = 'コントラスト配色';
        schemeComment = '明暗のコントラストが効いており、遠目から見ても輪郭が引き締まるメリハリのあるコーディネートです。';
        tags = ['#コントラスト配色', '#メリハリ'];
    }

    return {
        breakdown: entries,
        schemeType,
        schemeComment,
        tags
    };
}

// ==========================================================================
// 【関数】updateAIStylingComment()
// 【役割】マネキンのコーデを見て「AIスタイリングアドバイス」を自動生成して表示する
// 【具体的な処理内容】
//   ・着ている服の種類や色の組み合わせ、季節をAIが総合診断し、
//     褒め言葉やアドバイスコメントを表示します
// ==========================================================================
function updateAIStylingComment() {
    // 定数 outfit を宣言し、値（AppState.currentOutfit || {}）をセットします
    const outfit = AppState.currentOutfit || {};
    // HTML 要素 #ai-comment-text を取得して変数 commentElem に格納します
    const commentElem = document.getElementById('ai-comment-text');
    // HTML 要素 #ai-tags-wrap を取得して変数 tagsElem に格納します
    const tagsElem = document.getElementById('ai-tags-wrap');
    // HTML 要素 #palette-dots を取得して変数 dotsElem に格納します
    const dotsElem = document.getElementById('palette-dots');
    // HTML 要素 #ai-score-val を取得して変数 scoreValElem に格納します
    const scoreValElem = document.getElementById('ai-score-val');
    // HTML 要素 #ai-score-stars を取得して変数 scoreStarsElem に格納します
    const scoreStarsElem = document.getElementById('ai-score-stars');
    // カラー構成診断ボックス要素を取得します
    const colorBox = document.getElementById('ai-color-diagnosis-box');

    // 定数 wornItems を宣言し、値（Object.values(outfit).filter(Boolean)）をセットします
    const wornItems = Object.values(outfit).filter(Boolean);

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (wornItems.length === 0) {
        // 条件（commentElem）が成り立つか判定し、該当する場合の処理を実行します
        if (commentElem) {
            // 文字要素 commentElem の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
            commentElem.textContent = '左側の「手持ちの服」または右側の「お気に入り商品」をクリックすると、マネキンが試着しAIスタイリストがリアルタイムでコーディネート診断を行います。';
        }
        // 条件（tagsElem）が成り立つか判定し、該当する場合の処理を実行します
        if (tagsElem) tagsElem.innerHTML = '<span class="ai-tag">#試着待ち</span>';
        // 条件（dotsElem）が成り立つか判定し、該当する場合の処理を実行します
        if (dotsElem) dotsElem.innerHTML = '';
        // 条件（scoreValElem）が成り立つか判定し、該当する場合の処理を実行します
        if (scoreValElem) scoreValElem.textContent = '--点';
        // 条件（scoreStarsElem）が成り立つか判定し、該当する場合の処理を実行します
        if (scoreStarsElem) scoreStarsElem.textContent = '';
        // カラー構成診断ボックスを非表示にします
        if (colorBox) colorBox.style.display = 'none';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 hasBottoms を宣言し、値（!!outfit.bottoms）をセットします
    const hasBottoms = !!outfit.bottoms;
    // 定数 hasTops を宣言し、値（!!outfit.tops）をセットします
    const hasTops = !!outfit.tops;
    // 定数 hasOuter を宣言し、値（!!outfit.outer）をセットします
    const hasOuter = !!outfit.outer;
    // 定数 hasShoes を宣言し、値（!!outfit.shoes）をセットします
    const hasShoes = !!outfit.shoes;
    // 定数 hasHat を宣言し、値（!!outfit.hat）をセットします
    const hasHat = !!outfit.hat;

    // 定数 colors を宣言し、値（wornItems.map(item => item.color || 'B…）をセットします
    const colors = wornItems.map(item => item.color || 'BLACK');
    // 定数 uniqueColors を宣言し、値（[...new Set(colors)]）をセットします
    const uniqueColors = [...new Set(colors)];

    // 条件（dotsElem）が成り立つか判定し、該当する場合の処理を実行します
    if (dotsElem) {
        // 生成・変換した HTML 文字列を要素 dotsElem の中身として描画します
        dotsElem.innerHTML = uniqueColors.map(c => `
            <span class="palette-dot" style="background-color: ${getColorHex(c)};" title="${c}" ></span>
                `).join('');
    }

    // AIカラー構成診断を実行し、比率バーと内訳を描画します
    const colorDiag = analyzeOutfitColorComposition(outfit);
    if (colorBox && colorDiag.breakdown.length > 0) {
        colorBox.style.display = 'block';
        const typeElem = document.getElementById('ai-color-scheme-type');
        if (typeElem) typeElem.textContent = colorDiag.schemeType;

        const ratioBar = document.getElementById('ai-color-ratio-bar');
        if (ratioBar) {
            ratioBar.innerHTML = colorDiag.breakdown.map(item => `
                <div style="width: ${item.ratio}%; background-color: ${item.hex}; height: 100%; transition: width 0.3s;" title="${item.color}: ${item.ratio}%"></div>
            `).join('');
        }

        const listElem = document.getElementById('ai-color-breakdown-list');
        if (listElem) {
            listElem.innerHTML = colorDiag.breakdown.map(item => `
                <div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.06); padding: 2px 7px; border-radius: 4px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${item.hex}; border: 1px solid rgba(255,255,255,0.3); display: inline-block;"></span>
                    <span>${item.color} <b>${item.ratio}%</b> <span style="opacity: 0.68; font-size: 0.68rem;">(${item.role})</span></span>
                </div>
            `).join('');
        }
    }

    // 再代入可能な変数 comment を宣言し、値（''）をセットします
    let comment = '';
    // 再代入可能な変数 tags を宣言し、値（[]）をセットします
    let tags = [];
    // 再代入可能な変数 score を宣言し、値（95）をセットします
    let score = 95;

    // 条件（hasBottoms && hasShoes && outfit.bottoms.color === '…）が成り立つか判定し、該当する場合の処理を実行します
    if (hasBottoms && hasShoes && outfit.bottoms.color === 'BLACK' && outfit.shoes.color === 'WHITE' && hasTops) {
        // 変数・配列項目 comment の値を更新・計算します
        comment = `「${outfit.bottoms.name}」と「${outfit.tops.name}」の組み合わせは落ち着いた印象を与えます。足元の「${outfit.shoes.name}」がアクセントとなり、視線が自然に抜けるバランスの良いカジュアルコーデです。`;
        // 条件（hasOuter）が成り立つか判定し、該当する場合の処理を実行します
        if (hasOuter) {
            // 変数・配列項目 comment の値を更新・計算します
            comment += ` さらに「${outfit.outer.name}」を羽織ることで、程よい大人の上品さとこなれ感がプラスされます。`;
            // 変数・配列項目 tags の値を更新・計算します
            tags = ['#大人の品格', '#モノトーン+1', '#Aラインシルエット'];
            // 変数・配列項目 score の値を更新・計算します
            score = 98;
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 変数・配列項目 tags の値を更新・計算します
            tags = ['#キレイめカジュアル', '#通学デイリー', '#モノトーンアクセント'];
            // 変数・配列項目 score の値を更新・計算します
            score = 95;
        }
    }
    // 前の if が偽で、かつ（hasOuter && hasBottoms）を満たす場合の別条件分岐です
    else if (hasOuter && hasBottoms) {
        // 変数・配列項目 comment の値を更新・計算します
        comment = `「${outfit.outer.name}」の優美なドレープ感が全体のシルエットを引き締めています。ボトムスに「${outfit.bottoms.name}」を合わせることで、現代的で清潔感のあるミニマルな装いに仕上がっています。`;
        // 変数・配列項目 tags の値を更新・計算します
        tags = ['#スマートシルエット', '#都会派モード', '#大人の休日'];
        // 変数・配列項目 score の値を更新・計算します
        score = 96;
    }
    // 前の if が偽で、かつ（hasTops && hasBottoms）を満たす場合の別条件分岐です
    else if (hasTops && hasBottoms) {
        // 変数・配列項目 comment の値を更新・計算します
        comment = `「${outfit.tops.name}」と「${outfit.bottoms.name}」の明度バランスが非常に美しく調和しています。手持ち服の日常感にブランドの上質さが加わり、抜け感のある洗練されたスタイルです。`;
        // 変数・配列項目 tags の値を更新・計算します
        tags = ['#黄金バランス', '#デイリーシック', '#着回し自在'];
        // 変数・配列項目 score の値を更新・計算します
        score = 94;
    }
    // 上記の if 条件に当てはまらなかった場合の分岐処理です
    else {
        // 定数 singleItem を宣言し、値（wornItems[0]）をセットします
        const singleItem = wornItems[0];
        // 変数・配列項目 comment の値を更新・計算します
        comment = `「${singleItem.name}」を着用中。美しいカッティングが際立っています。さらに相性の良い${hasTops ? 'ボトムスや靴' : 'トップスやアウター'} を組み合わせると、全体のトータルバランスを診断できます。`;
        // 変数・配列項目 tags の値を更新・計算します
        tags = ['#シルエット重視', '#スタイリング途中'];
        // 変数・配列項目 score の値を更新・計算します
        score = 90;
    }

    // 条件（hasHat && outfit.hat）が成り立つか判定し、該当する場合の処理を実行します
    if (hasHat && outfit.hat) {
        // 変数・配列項目 comment の値を更新・計算します
        comment += ` 頭元の「${outfit.hat.name}」が全体のアイキャッチとなり、こなれたストリート感を演出しています。`;
        // 条件（!tags.includes('#アクセント小物')）が成り立つか判定し、該当する場合の処理を実行します
        if (!tags.includes('#アクセント小物')) tags.push('#アクセント小物');
    }

    // AIカラー診断のコメントとタグを統合
    if (colorDiag && colorDiag.schemeComment) {
        comment += ` 【🎨 AIカラー構成: ${colorDiag.schemeType}】${colorDiag.schemeComment}`;
        if (colorDiag.tags) {
            for (const t of colorDiag.tags) {
                if (!tags.includes(t)) tags.push(t);
            }
        }
    }

    // 条件（commentElem）が成り立つか判定し、該当する場合の処理を実行します
    if (commentElem) commentElem.textContent = comment;
    // 条件（tagsElem）が成り立つか判定し、該当する場合の処理を実行します
    if (tagsElem) {
        // 生成・変換した HTML 文字列を要素 tagsElem の中身として描画します
        tagsElem.innerHTML = tags.map(t => `<span class="ai-tag" > ${t}</span> `).join('');
    }
    // 条件（scoreValElem）が成り立つか判定し、該当する場合の処理を実行します
    if (scoreValElem) scoreValElem.textContent = `${score}点`;
    // 条件（scoreStarsElem）が成り立つか判定し、該当する場合の処理を実行します
    if (scoreStarsElem) scoreStarsElem.textContent = '';
}

// ==========================================================================
// 【関数】applyPresetName(name)
// 【役割】コーデ保存モーダルで、提案されたコーデ名をクリックして入力欄に入れる
// 【具体的な処理内容】
//   ・「春の爽やかデニムコーデ」などのプリセット名を保存名入力欄に自動セットします
// ==========================================================================
function applyPresetName(name) {
    // HTML 要素 #outfit-name-input を取得して変数 input に格納します
    const input = document.getElementById('outfit-name-input');
    // 条件（input）が成り立つか判定し、該当する場合の処理を実行します
    if (input) input.value = name;
}


// 再代入可能な変数 _outfitsMutationSeq を宣言し、値（0）をセットします
let _outfitsMutationSeq = 0;

// ==========================================================================
// 【関数】handleSaveOutfit(e)
// 【役割】「このコーディネートを保存する」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・現在着ている服の組み合わせに名前を付けて、サーバー（MySQL）の
//     保存済みコーデ一覧に登録します
// ==========================================================================
async function handleSaveOutfit(e) {
    // 条件（e）が成り立つか判定し、該当する場合の処理を実行します
    if (e) e.preventDefault();

    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !AppState.currentUser.id || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ コーデをMySQLに保存するにはログインが必要です');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 wornItems を宣言し、値（Object.values(AppState.currentOutfit).…）をセットします
    const wornItems = Object.values(AppState.currentOutfit).filter(Boolean);
    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (wornItems.length === 0) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('マネキンに服を1着以上着せてから保存してください');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 定数 userId を宣言し、値（AppState.currentUser.id）をセットします
    const userId = AppState.currentUser.id;
    // HTML 要素 #outfit-name-input を取得して変数 input に格納します
    const input = document.getElementById('outfit-name-input');
    // 定数 title を宣言し、値（(input && input.value.trim()) ? input.…）をセットします
    const title = (input && input.value.trim()) ? input.value.trim() : 'マイスタイリングコーデ';

    // HTML 要素 #ai-comment-text を取得して変数 commentElem に格納します
    const commentElem = document.getElementById('ai-comment-text');
    // 定数 comment を宣言し、値（commentElem ? commentElem.textContent …）をセットします
    const comment = commentElem ? commentElem.textContent : '';

    // 変数・配列項目 _outfitsMutationSeq の値を更新・計算します
    _outfitsMutationSeq++;
    // 定数 newOutfit を宣言し、値（{）をセットします
    const newOutfit = {
        // レコード・商品・コーデを識別する ID プロパティをセットします
        id: 'outfit-' + userId + '-' + Date.now(),
        // MySQL でどの会員アカウントのデータか区別するための user_id をセットします
        user_id: userId,
        // モーダル見出しまたはコーデ保存タイトル
        title: title,
        // 登録・保存日付文字列
        date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        // AIスタイリストからの診断コメント本文
        comment: comment,
        // 対象商品・着用アイテムの一覧データです
        items: JSON.parse(JSON.stringify(AppState.currentOutfit))
    };

    // スマホ版の場合は localStorage にコーディネートを保存します
    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        AppState.savedOutfits.unshift(newOutfit);
        if (typeof lsSetJson === 'function') {
            lsSetJson(`manekin_ls_outfits_${userId}`, AppState.savedOutfits);
        }
        showToastNotification(`「${title}」を保存しました！`);
        if (input) input.value = '';
        renderManekinStudio(AppState.studioActiveTab);
        return;
    }

    // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
    const apiBase = (typeof getApiBaseUrl === 'function')
        // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
        ? getApiBaseUrl()
        // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');
    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/outfits/save）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/outfits/save`, {
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
                id: newOutfit.id,
                // モーダル見出しまたはコーデ保存タイトル
                title: newOutfit.title,
                // 登録・保存日付文字列
                date: newOutfit.date,
                // AIスタイリストからの診断コメント本文
                comment: newOutfit.comment,
                // 対象商品・着用アイテムの一覧データです
                items: newOutfit.items
            })
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('API Error');

        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(userId)) return;
        // 新規追加された最新データを配列 AppState.savedOutfits の先頭へ挿入して即画面反映します
        AppState.savedOutfits.unshift(newOutfit);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification(`「${title}」をMySQLに保存しました！`);
        // 条件（input）が成り立つか判定し、該当する場合の処理を実行します
        if (input) input.value = '';
        // 関連処理 renderManekinStudio() を呼び出して処理・画面を更新します
        renderManekinStudio(AppState.studioActiveTab);
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (err) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLコーデ保存失敗:', err);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ MySQLへのコーディネート保存に失敗しました（サーバー・DB接続を確認してください）');
    }
}

// ==========================================================================
// 【関数】renderSavedOutfitsGrid()
// 【役割】スタジオの「保存済み」タブに過去に保存したコーデ一覧を表示する
// 【具体的な処理内容】
//   ・以前保存したコーディネートカードを一覧表示し、ワンクリックで
//     マネキンに着せ替えられるようにします
// ==========================================================================
function renderSavedOutfitsGrid() {
    // HTML 要素 #saved-outfits-grid を取得して変数 grid に格納します
    const grid = document.getElementById('saved-outfits-grid');
    // 条件（!grid）が成り立つか判定し、該当する場合の処理を実行します
    if (!grid) return;

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (AppState.savedOutfits.length === 0) {
        // テンプレートリテラルで組み立てた HTML を要素 grid 内に書き込んで画面を更新します
        grid.innerHTML = `
            <div class="closet-empty-card" >
                <div class="closet-empty-icon">📖</div>
                <h3 class="closet-empty-title">保存したコーディネートはありません</h3>
                <p class="closet-empty-desc">コーデ作成スタジオで組み合わせを作り、名前を付けて保存するとここにルックブックとしてストックされます。</p>
                <button class="btn btn-primary" onclick="switchStudioTab('create')">コーデを作成する</button>
            </div>
            `;
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 配列の各アイテムを順番に加工・HTMLカード化して新しい配列に変換します
    grid.innerHTML = AppState.savedOutfits.map(outfit => {
        // 定数 items を宣言し、値（outfit.items || {}）をセットします
        const items = outfit.items || {};
        // 定数 itemList を宣言し、値（Object.values(items).filter(Boolean)）をセットします
        const itemList = Object.values(items).filter(Boolean);

        // 定数 stripsHtml を宣言し、値（itemList.map(it => `）をセットします
        const stripsHtml = itemList.map(it => `
            <div class="saved-strip-item" title="${it.name}" >
                <img src="${it.image}" alt="${it.name}" class="saved-strip-img" onerror="this.src='assets/images/men/スカイオックスフォードシャツ.png'">
                    <span class="saved-strip-tag">${it.isOwned ? '手持ち' : 'ブランド'}</span>
                </div>
        `).join('');

        // 変数値を埋め込んだテンプレートリテラル文字列（HTMLカードやテキスト）を生成して呼び出し元へ返します
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
        // 上で配列ごとに生成した HTML 文字列を 1 つの連続した HTML テキストに連結します
    }).join('');
}

// ==========================================================================
// 【関数】restoreOutfit(outfitId)
// 【役割】保存済みコーデカードの「このコーデを着る」を押したときの処理
// 【具体的な処理内容】
//   ・保存されていた5部位の服を一括でマネキンに丸ごと着せ替えます
// ==========================================================================
function restoreOutfit(outfitId) {
    // 定数 target を宣言し、値（AppState.savedOutfits.find(o => o.id =…）をセットします
    const target = AppState.savedOutfits.find(o => o.id === outfitId);
    // 条件（!target）が成り立つか判定し、該当する場合の処理を実行します
    if (!target) return;

    // アプリ全体状態 AppState.currentOutfit を最新値（JSON.parse(JSON.stringify(target.items…）に更新します
    AppState.currentOutfit = JSON.parse(JSON.stringify(target.items));
    // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
    syncStudioStateToBackend({ immediate: true });

    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToastNotification(`「${target.title}」をマネキンに復元しました`);
    // 専用ヘルパー関数 switchStudioTab() を実行して状態や表示ラベルを更新します
    switchStudioTab('create');
}

// ==========================================================================
// 【関数】deleteSavedOutfit(outfitId)
// 【役割】保存済みコーデカードの「削除」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・そのコーディネートをサーバー（MySQL）から削除します
// ==========================================================================
async function deleteSavedOutfit(outfitId) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !AppState.currentUser.id || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ ログインが必要です');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 userId を宣言し、値（AppState.currentUser.id）をセットします
    const userId = AppState.currentUser.id;
    // 条件（!confirm('この保存コーディネートを削除しますか？')）が成り立つか判定し、該当する場合の処理を実行します
    if (!confirm('この保存コーディネートを削除しますか？')) return;

    // 変数・配列項目 _outfitsMutationSeq の値を更新・計算します
    _outfitsMutationSeq++;

    // スマホ版の場合は localStorage から保存コーデを削除します
    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        AppState.savedOutfits = AppState.savedOutfits.filter(o => o.id !== outfitId);
        if (typeof lsSetJson === 'function') {
            lsSetJson(`manekin_ls_outfits_${userId}`, AppState.savedOutfits);
        }
        showToastNotification('コーディネートを削除しました');
        renderSavedOutfitsGrid();
        renderManekinStudio(AppState.studioActiveTab);
        return;
    }

    // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
    const apiBase = (typeof getApiBaseUrl === 'function')
        // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
        ? getApiBaseUrl()
        // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/outfits/delete/${encodeURIComponent）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/outfits/delete/${encodeURIComponent(outfitId)}?user_id=${userId}`, {
            // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
            method: 'DELETE',
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include'
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('API Error');

        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(userId)) return;
        // アプリ全体状態 AppState.savedOutfits を最新値（AppState.savedOutfits.filter(o => o.id…）に更新します
        AppState.savedOutfits = AppState.savedOutfits.filter(o => o.id !== outfitId);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('コーディネートを削除しました');
        // 関連処理 renderSavedOutfitsGrid() を呼び出して処理・画面を更新します
        renderSavedOutfitsGrid();
        // 関連処理 renderManekinStudio() を呼び出して処理・画面を更新します
        renderManekinStudio(AppState.studioActiveTab);
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (err) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLコーデ削除失敗:', err);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ MySQLからのコーディネート削除に失敗しました（サーバー接続を確認してください）');
    }
}

// ==========================================================================
// 【関数】syncOutfitsFromBackend()
// 【役割】サーバー（MySQL）から保存済みコーディネート一覧を取得する
// 【具体的な処理内容】
//   ・ログイン会員が保存したコーデをデータベースから読み込んで画面に反映します
// ==========================================================================
async function syncOutfitsFromBackend() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !AppState.currentUser.id) {
        // アプリ全体状態 AppState.savedOutfits を最新値（[]）に更新します
        AppState.savedOutfits = [];
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 条件（typeof isServerUserId === 'function' && !isServerUse…）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof isServerUserId === 'function' && !isServerUserId(targetUserId)) {
        // アプリ全体状態 AppState.savedOutfits を最新値（[]）に更新します
        AppState.savedOutfits = [];
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // スマホ版の場合は localStorage から保存済みコーデ一覧を取得します
    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        const savedOutfits = (typeof lsGetJson === 'function')
            ? lsGetJson(`manekin_ls_outfits_${targetUserId}`, [])
            : [];
        AppState.savedOutfits = Array.isArray(savedOutfits) ? savedOutfits : [];
        const savedBadge = document.getElementById('studio-saved-badge');
        if (savedBadge) savedBadge.textContent = AppState.savedOutfits.length;
        const homeSaved = document.getElementById('home-stat-saved');
        if (homeSaved) homeSaved.innerHTML = `${AppState.savedOutfits.length} <small>組</small>`;
        if (AppState.studioActiveTab === 'saved') {
            renderSavedOutfitsGrid();
        }
        return;
    }

    // 定数 fetchStartSeq を宣言し、値（_outfitsMutationSeq）をセットします
    const fetchStartSeq = _outfitsMutationSeq;
    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
        const apiBase = (typeof getApiBaseUrl === 'function')
            // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
            ? getApiBaseUrl()
            // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
            : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');
        // Flask バックエンド API（/api/outfits/${targetUserId}）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/outfits/${targetUserId}`, {
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
            // 条件（fetchStartSeq !== _outfitsMutationSeq）が成り立つか判定し、該当する場合の処理を実行します
            if (fetchStartSeq !== _outfitsMutationSeq) return;
            // 条件（Array.isArray(data.outfits)）が成り立つか判定し、該当する場合の処理を実行します
            if (Array.isArray(data.outfits)) {
                // アプリ全体状態 AppState.savedOutfits を最新値（data.outfits）に更新します
                AppState.savedOutfits = data.outfits;
                // HTML 要素 #studio-saved-badge を取得して変数 savedBadge に格納します
                const savedBadge = document.getElementById('studio-saved-badge');
                // 条件（savedBadge）が成り立つか判定し、該当する場合の処理を実行します
                if (savedBadge) savedBadge.textContent = data.outfits.length;
                // HTML 要素 #home-stat-saved を取得して変数 homeSaved に格納します
                const homeSaved = document.getElementById('home-stat-saved');
                // 条件（homeSaved）が成り立つか判定し、該当する場合の処理を実行します
                if (homeSaved) homeSaved.innerHTML = `${data.outfits.length} <small>組</small>`;
                // 条件（AppState.studioActiveTab === 'saved'）が成り立つか判定し、該当する場合の処理を実行します
                if (AppState.studioActiveTab === 'saved') {
                    // 関連処理 renderSavedOutfitsGrid() を呼び出して処理・画面を更新します
                    renderSavedOutfitsGrid();
                }
            }
        }
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLからの保存コーデ取得に失敗しました:', e);
    }
}

// ==========================================================================
// 【関数】addCurrentBrandItemsToCart()
// 【役割】「マネキンが着ている販売商品をまとめてカートに追加」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・マネキンが着ている服のうち、ショップの販売商品を一括でショッピングカートへ追加します
// ==========================================================================
async function addCurrentBrandItemsToCart() {
    // 条件（!AppState.cart || !Array.isArray(AppState.cart)）が成り立つか判定し、該当する場合の処理を実行します
    if (!AppState.cart || !Array.isArray(AppState.cart)) {
        // アプリ全体状態 AppState.cart を最新値（[]）に更新します
        AppState.cart = [];
    }
    // 定数 outfit を宣言し、値（AppState.currentOutfit || {}）をセットします
    const outfit = AppState.currentOutfit || {};
    // 定数 brandItems を宣言し、値（Object.values(outfit).filter(it => it …）をセットします
    const brandItems = Object.values(outfit).filter(it => it && !it.isOwned);

    // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
    if (brandItems.length === 0) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('現在マネキンが着用しているお気に入り商品はありません');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して prevCart に保存します
    const prevCart = JSON.parse(JSON.stringify(AppState.cart || []));

    // 定数 offsets を宣言し、値（AppState.fittingOffsets || {}）をセットします
    const offsets = AppState.fittingOffsets || {};
    // 配列の中の要素を 1 件ずつ取り出して順番にコールバック処理を実行します
    brandItems.forEach(item => {
        // 条件（!item）が成り立つか判定し、該当する場合の処理を実行します
        if (!item) return;
        // 定数 slotKey を宣言し、値（getSlotKeyByCategory(item.category) ||…）をセットします
        const slotKey = getSlotKeyByCategory(item.category) || 'tops';
        // 定数 off を宣言し、値（offsets[slotKey] || {}）をセットします
        const off = offsets[slotKey] || {};
        // 定数 chosenSize を宣言し、値（item.size || off.brandSize || 'M'）をセットします
        const chosenSize = item.size || off.brandSize || 'M';

        // 定数 existing を宣言し、値（AppState.cart.find(c => c && c.id === …）をセットします
        const existing = AppState.cart.find(c => c && c.id === item.id && c.size === chosenSize);
        // 条件（existing）が成り立つか判定し、該当する場合の処理を実行します
        if (existing) {
            // 変数・配列項目 existing.quantity の値を更新・計算します
            existing.quantity = (existing.quantity || 1) + 1;
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 配列の末尾に新しい要素を追加します（AppState.cart.push({）
            AppState.cart.push({
                // レコード・商品・コーデを識別する ID プロパティをセットします
                id: item.id,
                // 商品名またはアイテム名称
                name: item.name || '商品',
                // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                category: item.category || 'TOPS',
                // カラー名
                color: item.color || 'BLACK',
                // 選択サイズ
                size: chosenSize,
                // 単価・価格（円）
                price: item.price || 0,
                // 数量
                quantity: 1,
                // 画像ファイルパスまたは DataURL
                image: item.image || getCategoryFallbackImage(item.category)
            });
        }
    });

    // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
    updateCartBadge();

    // 条件（AppState.currentUser && (typeof isServerUserId !== '…）が成り立つか判定し、該当する場合の処理を実行します
    if (AppState.currentUser && (typeof isServerUserId !== 'function' || isServerUserId(AppState.currentUser.id))) {
        // 条件（typeof syncCartToBackend === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof syncCartToBackend === 'function') {
            // 定数 ok を宣言し、値（await syncCartToBackend()）をセットします
            const ok = await syncCartToBackend();
            // 条件（!ok）が成り立つか判定し、該当する場合の処理を実行します
            if (!ok) {
                // アプリ全体状態 AppState.cart を最新値（prevCart）に更新します
                AppState.cart = prevCart;
                // 関連処理 updateCartBadge() を呼び出して処理・画面を更新します
                updateCartBadge();
                // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
                showToastNotification('⚠️ MySQLへのカート保存に失敗しました（サーバー接続を確認してください）');
                // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
                return;
            }
        }
    }
    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToastNotification(`試着中のブランドアイテム（${brandItems.length}点）をカートに追加しMySQLへ保存しました！`);
}

// ==========================================================================
// 【関数】openAddClosetModal()
// 【役割】「手持ちの服を登録する」ポップアップ（モーダル）を開く
// 【具体的な処理内容】
//   ・写真アップロードや服の名前入力を行う登録ウィンドウを画面に表示します
// ==========================================================================
function openAddClosetModal() {
    // HTML 要素 #modal-add-closet を取得して変数 modal に格納します
    const modal = document.getElementById('modal-add-closet');
    // 条件（modal）が成り立つか判定し、該当する場合の処理を実行します
    if (modal) {
        // 要素に CSS クラスを付与して見た目・表示状態を変更します（modal.classList.add('open');）
        modal.classList.add('open');
        // 要素に CSS クラスを付与して見た目・表示状態を変更します（modal.classList.add('active');）
        modal.classList.add('active');
        // 変数・配列項目 modal.onclick の値を更新・計算します
        modal.onclick = function (e) {
            // 条件（e.target === modal）が成り立つか判定し、該当する場合の処理を実行します
            if (e.target === modal) closeAddClosetModal();
        };
    }
}

// ==========================================================================
// 【関数】closeAddClosetModal()
// 【役割】手持ち服登録ポップアップを閉じる
// 【具体的な処理内容】
//   ・登録ウィンドウを非表示にし、プレビュー画像をリセットします
// ==========================================================================
function closeAddClosetModal() {
    // HTML 要素 #modal-add-closet を取得して変数 modal に格納します
    const modal = document.getElementById('modal-add-closet');
    // 条件（modal）が成り立つか判定し、該当する場合の処理を実行します
    if (modal) {
        // 要素から CSS クラスを外して強調や表示を戻します（modal.classList.remove('open');）
        modal.classList.remove('open');
        // 要素から CSS クラスを外して強調や表示を戻します（modal.classList.remove('active');）
        modal.classList.remove('active');
    }
    // 変数・配列項目 currentClosetUploadDataUrl の値を更新・計算します
    currentClosetUploadDataUrl = '';
    // 変数・配列項目 originalClosetUploadDataUrl の値を更新・計算します
    originalClosetUploadDataUrl = '';
    // 変数・配列項目 isCurrentUploadTransparent の値を更新・計算します
    isCurrentUploadTransparent = false;
    // 変数・配列項目 currentAiAnalysisResult の値を更新・計算します
    currentAiAnalysisResult = null;
    // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
    updateAiDiagnosisUI(null);

    // HTML 要素 #closet-img-preview を取得して変数 preview に格納します
    const preview = document.getElementById('closet-img-preview');
    // HTML 要素 #closet-img-placeholder を取得して変数 placeholder に格納します
    const placeholder = document.getElementById('closet-img-placeholder');
    // HTML 要素 #preview-badge-transparent を取得して変数 badgeTrans に格納します
    const badgeTrans = document.getElementById('preview-badge-transparent');
    // HTML 要素 #ai-action-btns を取得して変数 actionBtns に格納します
    const actionBtns = document.getElementById('ai-action-btns');
    // HTML 要素 #ai-processing-overlay を取得して変数 overlay に格納します
    const overlay = document.getElementById('ai-processing-overlay');

    // 条件（preview）が成り立つか判定し、該当する場合の処理を実行します
    if (preview) {
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（preview.style.display = 'none';）
        preview.style.display = 'none';
        // 要素から CSS クラスを外して強調や表示を戻します（preview.classList.remove('is-transparent')…）
        preview.classList.remove('is-transparent');
    }
    // 条件（badgeTrans）が成り立つか判定し、該当する場合の処理を実行します
    if (badgeTrans) badgeTrans.style.display = 'none';
    // 条件（actionBtns）が成り立つか判定し、該当する場合の処理を実行します
    if (actionBtns) actionBtns.style.display = 'none';
    // 条件（overlay）が成り立つか判定し、該当する場合の処理を実行します
    if (overlay) overlay.style.display = 'none';
    // 条件（placeholder）が成り立つか判定し、該当する場合の処理を実行します
    if (placeholder) placeholder.style.display = 'block';

    // HTML 要素 #form-add-closet を取得して変数 form に格納します
    const form = document.getElementById('form-add-closet');
    // 条件（form）が成り立つか判定し、該当する場合の処理を実行します
    if (form) form.reset();
}

// ==========================================================================
// 【関数】resizeImageForAi(imageSource, maxDim = 1024)
// 【役割】アップロードされた写真が大きすぎる場合に、AIが解析しやすいサイズに縮小する
// 【具体的な処理内容】
//   ・高画質な写真でもブラウザがフリーズしないよう、最大幅1024pxに安全にリサイズします
// ==========================================================================
function resizeImageForAi(imageSource, maxDim = 1024) {
    // 条件（typeof Image === 'undefined'）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof Image === 'undefined') return Promise.resolve(imageSource);
    // 非同期完了を await で待てる Promise オブジェクトを作成して返します
    return new Promise((resolve) => {
        // Canvas 画像処理・ピクセル解析を行うために画像オブジェクト Image() を作成します
        const img = new Image();
        // 変数・配列項目 img.crossOrigin の値を更新・計算します
        img.crossOrigin = 'anonymous';
        // 変数・配列項目 img.onload の値を更新・計算します
        img.onload = () => {
            // 再代入可能な変数 width を宣言し、値（img.width）をセットします
            let width = img.width;
            // 再代入可能な変数 height を宣言し、値（img.height）をセットします
            let height = img.height;
            // 条件（width <= maxDim && height <= maxDim）が成り立つか判定し、該当する場合の処理を実行します
            if (width <= maxDim && height <= maxDim) {
                // 非同期 Promise を完了し、結果値（imageSource）を呼び出し元へ返します
                resolve(imageSource);
                // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
                return;
            }
            // 条件（width > height）が成り立つか判定し、該当する場合の処理を実行します
            if (width > height) {
                // 変数・配列項目 height の値を更新・計算します
                height = Math.round((height * maxDim) / width);
                // 変数・配列項目 width の値を更新・計算します
                width = maxDim;
                // 上記の if 条件に当てはまらなかった場合の分岐処理です
            } else {
                // 変数・配列項目 width の値を更新・計算します
                width = Math.round((width * maxDim) / height);
                // 変数・配列項目 height の値を更新・計算します
                height = maxDim;
            }
            // 画像の縮小・ピクセル色解析を行うためのメモリ上お絵描き領域(Canvas)を作ります
            const canvas = document.createElement('canvas');
            // 変数・配列項目 canvas.width の値を更新・計算します
            canvas.width = width;
            // 変数・配列項目 canvas.height の値を更新・計算します
            canvas.height = height;
            // 定数 ctx を宣言し、値（canvas.getContext('2d')）をセットします
            const ctx = canvas.getContext('2d');
            // 元の画像を圧縮用 Canvas 領域へ縮小描画します
            ctx.drawImage(img, 0, 0, width, height);
            // 縮小した Canvas 画像を PNG バイナリ形式（Blob）へ変換開始します
            canvas.toBlob((blob) => {
                // 非同期 Promise を完了し、結果値（blob || imageSource）を呼び出し元へ返します
                resolve(blob || imageSource);
                // Canvas 画像を PNG 形式（透過対応）で書き出す処理を閉じます
            }, 'image/png');
        };
        // 変数・配列項目 img.onerror の値を更新・計算します
        img.onerror = () => resolve(imageSource);

        // 条件（typeof imageSource === 'string'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof imageSource === 'string') {
            // 変数・配列項目 img.src の値を更新・計算します
            img.src = imageSource;
            // 前の if が偽で、かつ（imageSource instanceof Blob）を満たす場合の別条件分岐です
        } else if (imageSource instanceof Blob) {
            // 変数・配列項目 img.src の値を更新・計算します
            img.src = URL.createObjectURL(imageSource);
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 非同期 Promise を完了し、結果値（imageSource）を呼び出し元へ返します
            resolve(imageSource);
        }
    });
}

// ==========================================================================
// 【関数】runAiBackgroundRemoval(imageSource)
// 【役割】服の写真から背景を自動で切り抜く（背景透明化AI）
// 【具体的な処理内容】
//   ・AIを使って服の輪郭を検出し、壁や床などの背景を透明にして服だけの画像を作ります
// ==========================================================================
async function runAiBackgroundRemoval(imageSource) {
    // 再代入可能な変数 removeBgFunc を宣言し、値（window.imglyRemoveBackground）をセットします
    let removeBgFunc = window.imglyRemoveBackground;
    // 条件（!removeBgFunc）が成り立つか判定し、該当する場合の処理を実行します
    if (!removeBgFunc) {
        // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
        try {
            // 定数 mod を宣言し、値（await import('https://cdn.jsdelivr.net…）をセットします
            const mod = await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal/+esm');
            // 変数・配列項目 removeBgFunc の値を更新・計算します
            removeBgFunc = mod.removeBackground;
            // 変数・配列項目 window.imglyRemoveBackground の値を更新・計算します
            window.imglyRemoveBackground = removeBgFunc;
            // 変数・配列項目 window.imglyAiReady の値を更新・計算します
            window.imglyAiReady = true;
            // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
        } catch (e) {
            // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
            console.error('AIモジュール読み込みエラー:', e);
            // 処理を中断して呼び出し元の catch へエラー内容（throw new Error('AI背景削除モジュールをロードできませんでした。ネ…）を渡します
            throw new Error('AI背景削除モジュールをロードできませんでした。ネットワーク接続を確認してください。');
        }
    }

    // HTML 要素 #ai-processing-overlay を取得して変数 overlay に格納します
    const overlay = document.getElementById('ai-processing-overlay');
    // HTML 要素 #ai-progress-fill を取得して変数 progressFill に格納します
    const progressFill = document.getElementById('ai-progress-fill');
    // HTML 要素 #ai-progress-percent を取得して変数 progressPct に格納します
    const progressPct = document.getElementById('ai-progress-percent');
    // HTML 要素 #ai-status-subtitle を取得して変数 subtitle に格納します
    const subtitle = document.getElementById('ai-status-subtitle');

    // 条件（overlay）が成り立つか判定し、該当する場合の処理を実行します
    if (overlay) overlay.style.display = 'flex';
    // 条件（progressFill）が成り立つか判定し、該当する場合の処理を実行します
    if (progressFill) progressFill.style.width = '0%';
    // 条件（progressPct）が成り立つか判定し、該当する場合の処理を実行します
    if (progressPct) progressPct.textContent = '0%';
    // 条件（subtitle）が成り立つか判定し、該当する場合の処理を実行します
    if (subtitle) subtitle.textContent = 'AIモデルを初期化中...';

    // 定数 resizedSource を宣言し、値（await resizeImageForAi(imageSource, 10…）をセットします
    const resizedSource = await resizeImageForAi(imageSource, 1024);

    // 定数 config を宣言し、値（{）をセットします
    const config = {
        // オブジェクトの 'model' プロパティ値を設定します
        model: 'small',
        // オブジェクトの 'progress' プロパティ値を設定します
        progress: (key, current, total) => {
            // 条件（total > 0）が成り立つか判定し、該当する場合の処理を実行します
            if (total > 0) {
                // 定数 pct を宣言し、値（Math.min(100, Math.round((current / to…）をセットします
                const pct = Math.min(100, Math.round((current / total) * 100));
                // 条件（progressFill）が成り立つか判定し、該当する場合の処理を実行します
                if (progressFill) progressFill.style.width = `${pct}%`;
                // 条件（progressPct）が成り立つか判定し、該当する場合の処理を実行します
                if (progressPct) progressPct.textContent = `${pct}%`;
                // 条件（subtitle）が成り立つか判定し、該当する場合の処理を実行します
                if (subtitle) {
                    // 条件（key.includes('model') || key.includes('onnx')）が成り立つか判定し、該当する場合の処理を実行します
                    if (key.includes('model') || key.includes('onnx')) {
                        // 文字要素 subtitle の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
                        subtitle.textContent = `AIモデル読込中... (${pct}%)`;
                        // 上記の if 条件に当てはまらなかった場合の分岐処理です
                    } else {
                        // 文字要素 subtitle の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
                        subtitle.textContent = `服の輪郭をAI解析・透過処理中... (${pct}%)`;
                    }
                }
            }
        }
    };

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // 定数 outputBlob を宣言し、値（await removeBgFunc(resizedSource, conf…）をセットします
        const outputBlob = await removeBgFunc(resizedSource, config);
        // 条件（overlay）が成り立つか判定し、該当する場合の処理を実行します
        if (overlay) overlay.style.display = 'none';
        // 結果（outputBlob）を呼び出し元へ返却します
        return outputBlob;
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (err) {
        // 条件（overlay）が成り立つか判定し、該当する場合の処理を実行します
        if (overlay) overlay.style.display = 'none';
        // 処理を中断して呼び出し元の catch へエラー内容（throw err;）を渡します
        throw err;
    }
}

// ==========================================================================
// 【関数】updateClosetPreviewUI(imgUrl, isTransparent = false)
// 【役割】手持ち服登録モーダル内の「プレビュー画像枠」を更新する
// 【具体的な処理内容】
//   ・切り抜かれた服の画像をプレビュー枠に表示します
// ==========================================================================
function updateClosetPreviewUI(imgUrl, isTransparent = false) {
    // HTML 要素 #closet-img-preview を取得して変数 preview に格納します
    const preview = document.getElementById('closet-img-preview');
    // HTML 要素 #closet-preview-img を取得して変数 previewImg に格納します
    const previewImg = document.getElementById('closet-preview-img');
    // HTML 要素 #closet-img-placeholder を取得して変数 placeholder に格納します
    const placeholder = document.getElementById('closet-img-placeholder');
    // HTML 要素 #preview-badge-transparent を取得して変数 badgeTrans に格納します
    const badgeTrans = document.getElementById('preview-badge-transparent');
    // HTML 要素 #ai-action-btns を取得して変数 actionBtns に格納します
    const actionBtns = document.getElementById('ai-action-btns');

    // 条件（preview && previewImg && placeholder）が成り立つか判定し、該当する場合の処理を実行します
    if (preview && previewImg && placeholder) {
        // 変数・配列項目 previewImg.src の値を更新・計算します
        previewImg.src = imgUrl;
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（preview.style.display = 'flex';）
        preview.style.display = 'flex';
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（placeholder.style.display = 'none';）
        placeholder.style.display = 'none';

        // 条件（isTransparent）が成り立つか判定し、該当する場合の処理を実行します
        if (isTransparent) {
            // 要素に CSS クラスを付与して見た目・表示状態を変更します（preview.classList.add('is-transparent');）
            preview.classList.add('is-transparent');
            // 条件（badgeTrans）が成り立つか判定し、該当する場合の処理を実行します
            if (badgeTrans) badgeTrans.style.display = 'block';
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 要素から CSS クラスを外して強調や表示を戻します（preview.classList.remove('is-transparent')…）
            preview.classList.remove('is-transparent');
            // 条件（badgeTrans）が成り立つか判定し、該当する場合の処理を実行します
            if (badgeTrans) badgeTrans.style.display = 'none';
        }

        // 条件（actionBtns）が成り立つか判定し、該当する場合の処理を実行します
        if (actionBtns) {
            // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（actionBtns.style.display = 'flex';）
            actionBtns.style.display = 'flex';
            // HTML 要素 #btn-re-remove-bg を取得して変数 btnReRemove に格納します
            const btnReRemove = document.getElementById('btn-re-remove-bg');
            // HTML 要素 #btn-restore-original を取得して変数 btnRestore に格納します
            const btnRestore = document.getElementById('btn-restore-original');
            // 条件（btnReRemove）が成り立つか判定し、該当する場合の処理を実行します
            if (btnReRemove) btnReRemove.style.display = isTransparent ? 'none' : 'inline-block';
            // 条件（btnRestore）が成り立つか判定し、該当する場合の処理を実行します
            if (btnRestore) btnRestore.style.display = isTransparent ? 'inline-block' : 'none';
        }
    }
}


// 再代入可能な変数 currentAiAnalysisResult を宣言し、値（null）をセットします
let currentAiAnalysisResult = null;
// 再代入可能な変数 _mobilenetModelPromise を宣言し、値（null）をセットします
let _mobilenetModelPromise = null;

// ==========================================================================
// 【関数】getMobileNetModel()
// 【役割】服の種類（シャツ、パンツなど）を自動判定する画像認識AIモデルを読み込む
// 【具体的な処理内容】
//   ・ブラウザ上で画像分類AIモデル（MobileNet）を1度だけロードしてキャッシュします
// ==========================================================================
function getMobileNetModel() {
    // 条件（!window.mobilenet）が成り立つか判定し、該当する場合の処理を実行します
    if (!window.mobilenet) return Promise.resolve(null);
    // 条件（!_mobilenetModelPromise）が成り立つか判定し、該当する場合の処理を実行します
    if (!_mobilenetModelPromise) {
        // 変数・配列項目 _mobilenetModelPromise の値を更新・計算します
        _mobilenetModelPromise = window.mobilenet.load({ version: 2, alpha: 0.5 }).catch(err => {
            // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
            console.warn('MobileNetモデルのロードをスキップしました (形状幾何学解析でフォールバック動作):', err);
            // 処理結果の基準値として null を呼び出し元へ返して関数を終了します
            return null;
        });
    }
    // 結果（_mobilenetModelPromise）を呼び出し元へ返却します
    return _mobilenetModelPromise;
}

// ==========================================================================
// 【関数】updateAiDiagnosisUI(result, isAnalyzing = false)
// 【役割】AI服種別診断のステータス（解析中 / 成功 / エラー）を画面に表示する
// 【具体的な処理内容】
//   ・「解析中...」や「トップスと判定されました」などのメッセージを表示します
// ==========================================================================
function updateAiDiagnosisUI(result, isAnalyzing = false) {
    // HTML 要素 #ai-diagnosis-card を取得して変数 card に格納します
    const card = document.getElementById('ai-diagnosis-card');
    // HTML 要素 #ai-diag-badge を取得して変数 badge に格納します
    const badge = document.getElementById('ai-diag-badge');
    // HTML 要素 #ai-diag-badge-text を取得して変数 badgeText に格納します
    const badgeText = document.getElementById('ai-diag-badge-text');
    // HTML 要素 #ai-diag-spinner を取得して変数 spinner に格納します
    const spinner = document.getElementById('ai-diag-spinner');
    // HTML 要素 #ai-diag-confidence を取得して変数 confidence に格納します
    const confidence = document.getElementById('ai-diag-confidence');
    // HTML 要素 #ai-diag-title を取得して変数 title に格納します
    const title = document.getElementById('ai-diag-title');
    // HTML 要素 #ai-diag-desc を取得して変数 desc に格納します
    const desc = document.getElementById('ai-diag-desc');

    // 条件（!card）が成り立つか判定し、該当する場合の処理を実行します
    if (!card) return;

    // 条件（isAnalyzing）が成り立つか判定し、該当する場合の処理を実行します
    if (isAnalyzing) {
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（card.style.display = 'block';）
        card.style.display = 'block';
        // 変数・配列項目 card.className の値を更新・計算します
        card.className = 'ai-diagnosis-card is-analyzing';
        // 条件（badgeText）が成り立つか判定し、該当する場合の処理を実行します
        if (badgeText) badgeText.textContent = 'AI形状・アイテム診断中...';
        // 条件（spinner）が成り立つか判定し、該当する場合の処理を実行します
        if (spinner) spinner.style.display = 'inline-block';
        // 条件（confidence）が成り立つか判定し、該当する場合の処理を実行します
        if (confidence) confidence.textContent = '';
        // 条件（title）が成り立つか判定し、該当する場合の処理を実行します
        if (title) title.textContent = '被写体の形状を解析中';
        // 条件（desc）が成り立つか判定し、該当する場合の処理を実行します
        if (desc) desc.textContent = 'アウター、ボトムス、トップス、靴、帽子のいずれかかAIが判定しています...';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 条件（!result）が成り立つか判定し、該当する場合の処理を実行します
    if (!result) {
        // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（card.style.display = 'none';）
        card.style.display = 'none';
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // JavaScript から直接 CSS インラインスタイルを変更して見た目を更新します（card.style.display = 'block';）
    card.style.display = 'block';
    // 条件（spinner）が成り立つか判定し、該当する場合の処理を実行します
    if (spinner) spinner.style.display = 'none';

    // 条件（result.isValid）が成り立つか判定し、該当する場合の処理を実行します
    if (result.isValid) {
        // 変数・配列項目 card.className の値を更新・計算します
        card.className = 'ai-diagnosis-card is-valid';
        // 条件（badgeText）が成り立つか判定し、該当する場合の処理を実行します
        if (badgeText) badgeText.textContent = 'AI形状・カラー判定: OK';
        // 条件（confidence）が成り立つか判定し、該当する場合の処理を実行します
        if (confidence) confidence.textContent = `${result.confidence}% 適合`;
        // 条件（title）が成り立つか判定し、該当する場合の処理を実行します
        if (title) {
            if (result.colorLabel) {
                title.innerHTML = `${result.title}<div style="margin-top: 5px; font-size: 0.8rem; font-weight: 700; color: #fbbf24; display: flex; align-items: center; gap: 6px;"><span>🎨 AIカラー診断:</span> <span style="background: rgba(251,191,36,0.2); padding: 1px 8px; border-radius: 6px; border: 1px solid rgba(251,191,36,0.4);">${result.colorLabel}</span></div>`;
            } else {
                title.textContent = result.title;
            }
        }
        // 条件（desc）が成り立つか判定し、該当する場合の処理を実行します
        if (desc) desc.textContent = result.desc;

        // 条件（result.category）が成り立つか判定し、該当する場合の処理を実行します
        if (result.category) {
            // CSS セレクタに最初に一致した HTML 要素を取得して変数 radio に入れます
            const radio = document.querySelector(`input[name="closet_category"][value="${result.category}"]`);
            // 条件（radio）が成り立つか判定し、該当する場合の処理を実行します
            if (radio) {
                // 変数・配列項目 radio.checked の値を更新・計算します
                radio.checked = true;
            }
        }

        // AI診断されたカラーをマイクローゼット登録フォームの選択欄へ自動反映します
        if (result.color) {
            const colorSelect = document.getElementById('closet-item-color');
            if (colorSelect) {
                colorSelect.value = result.color;
            }
        }
        // 上記の if 条件に当てはまらなかった場合の分岐処理です
    } else {
        // 変数・配列項目 card.className の値を更新・計算します
        card.className = 'ai-diagnosis-card is-invalid';
        // 条件（badgeText）が成り立つか判定し、該当する場合の処理を実行します
        if (badgeText) badgeText.textContent = '⚠️ 登録不可（非対象）';
        // 条件（confidence）が成り立つか判定し、該当する場合の処理を実行します
        if (confidence) confidence.textContent = '判定不可';
        // 条件（title）が成り立つか判定し、該当する場合の処理を実行します
        if (title) title.textContent = result.title;
        // 条件（desc）が成り立つか判定し、該当する場合の処理を実行します
        if (desc) desc.textContent = result.desc;
    }
}

// ==========================================================================
// 【関数】analyzeClothingItemShape(source)
// 【役割】写真の形（縦横比やシルエット）から服のカテゴリを自動判定する
// 【具体的な処理内容】
//   ・細長いからボトムス、正方形に近いからトップスなど、服の形状をAIで分析してカテゴリを推測します
// ==========================================================================
async function analyzeClothingItemShape(source) {
    // 非同期完了を await で待てる Promise オブジェクトを作成して返します
    return new Promise((resolve) => {
        // Canvas 画像処理・ピクセル解析を行うために画像オブジェクト Image() を作成します
        const img = new Image();
        // 変数・配列項目 img.crossOrigin の値を更新・計算します
        img.crossOrigin = 'anonymous';

        // 変数・配列項目 img.onload の値を更新・計算します
        img.onload = async () => {
            // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
            try {
                // 画像の縮小・ピクセル色解析を行うためのメモリ上お絵描き領域(Canvas)を作ります
                const canvas = document.createElement('canvas');
                // 定数 cw を宣言し、値（180）をセットします
                const cw = 180;
                // 定数 ch を宣言し、値（180）をセットします
                const ch = 180;
                // 変数・配列項目 canvas.width の値を更新・計算します
                canvas.width = cw;
                // 変数・配列項目 canvas.height の値を更新・計算します
                canvas.height = ch;
                // 定数 ctx を宣言し、値（canvas.getContext('2d', { willReadFreq…）をセットします
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                // 元の画像を圧縮用 Canvas 領域へ縮小描画します
                ctx.drawImage(img, 0, 0, cw, ch);

                // 定数 imgData を宣言し、値（ctx.getImageData(0, 0, cw, ch)）をセットします
                const imgData = ctx.getImageData(0, 0, cw, ch);
                // 定数 data を宣言し、値（imgData.data）をセットします
                const data = imgData.data;

                // 再代入可能な変数 totalAlpha を宣言し、値（0）をセットします
                let totalAlpha = 0;
                // 配列要素やインデックスを順番に繰り返すループ処理（for (let i = 3; i < data.length; i += 4) {）を開始します
                for (let i = 3; i < data.length; i += 4) {
                    // 変数・配列項目 totalAlpha の値を更新・計算します
                    totalAlpha += data[i];
                }
                // 定数 isAlreadyTransparent を宣言し、値（(totalAlpha / (cw * ch)) < 240）をセットします
                const isAlreadyTransparent = (totalAlpha / (cw * ch)) < 240;

                // 再代入可能な変数 bgR を宣言し、値（0, bgG = 0, bgB = 0, bgSamples = 0）をセットします
                let bgR = 0, bgG = 0, bgB = 0, bgSamples = 0;
                // 定数 cornerCoords を宣言し、値（[）をセットします
                const cornerCoords = [
                    // 配列要素データ（[5, 5], [cw - 5, 5], [5, ch - 5], [cw - 5,…）を定義します
                    [5, 5], [cw - 5, 5], [5, ch - 5], [cw - 5, ch - 5],
                    // 配列要素データ（[10, 10], [cw - 10, 10], [10, ch - 10], [c…）を定義します
                    [10, 10], [cw - 10, 10], [10, ch - 10], [cw - 10, ch - 10]
                ];
                // 配列要素やインデックスを順番に繰り返すループ処理（for (const [cx, cy] of cornerCoords) {）を開始します
                for (const [cx, cy] of cornerCoords) {
                    // 定数 idx を宣言し、値（(cy * cw + cx) * 4）をセットします
                    const idx = (cy * cw + cx) * 4;
                    // 変数・配列項目 bgR の値を更新・計算します
                    bgR += data[idx];
                    // 変数・配列項目 bgG の値を更新・計算します
                    bgG += data[idx + 1];
                    // 変数・配列項目 bgB の値を更新・計算します
                    bgB += data[idx + 2];
                    // 変数・配列項目 bgSamples の値を更新・計算します
                    bgSamples++;
                }
                // 変数・配列項目 bgR の値を更新・計算します
                bgR /= bgSamples;
                // 変数・配列項目 bgG の値を更新・計算します
                bgG /= bgSamples;
                // 変数・配列項目 bgB の値を更新・計算します
                bgB /= bgSamples;

                // 定数 mask を宣言し、値（new Uint8Array(cw * ch)）をセットします
                const mask = new Uint8Array(cw * ch);
                // 再代入可能な変数 fgCount を宣言し、値（0）をセットします
                let fgCount = 0;
                // 再代入可能な変数 minX を宣言し、値（cw, maxX = 0, minY = ch, maxY = 0）をセットします
                let minX = cw, maxX = 0, minY = ch, maxY = 0;
                // 前景ピクセルのカラー集計用変数
                let sumR = 0, sumG = 0, sumB = 0;

                // 配列要素やインデックスを順番に繰り返すループ処理（for (let y = 0; y < ch; y++) {）を開始します
                for (let y = 0; y < ch; y++) {
                    // 配列要素やインデックスを順番に繰り返すループ処理（for (let x = 0; x < cw; x++) {）を開始します
                    for (let x = 0; x < cw; x++) {
                        // 定数 idx を宣言し、値（(y * cw + x) * 4）をセットします
                        const idx = (y * cw + x) * 4;
                        // 定数 r を宣言し、値（data[idx]）をセットします
                        const r = data[idx];
                        // 定数 g を宣言し、値（data[idx + 1]）をセットします
                        const g = data[idx + 1];
                        // 定数 b を宣言し、値（data[idx + 2]）をセットします
                        const b = data[idx + 2];
                        // 定数 a を宣言し、値（data[idx + 3]）をセットします
                        const a = data[idx + 3];

                        // 再代入可能な変数 isFg を宣言し、値（false）をセットします
                        let isFg = false;
                        // 条件（isAlreadyTransparent）が成り立つか判定し、該当する場合の処理を実行します
                        if (isAlreadyTransparent) {
                            // 変数・配列項目 isFg の値を更新・計算します
                            isFg = a > 35;
                            // 上記の if 条件に当てはまらなかった場合の分岐処理です
                        } else {
                            // 定数 diff を宣言し、値（Math.hypot(r - bgR, g - bgG, b - bgB)）をセットします
                            const diff = Math.hypot(r - bgR, g - bgG, b - bgB);
                            // 変数・配列項目 isFg の値を更新・計算します
                            isFg = (diff > 25) || (a < 220);
                        }

                        // 条件（isFg）が成り立つか判定し、該当する場合の処理を実行します
                        if (isFg) {
                            // 変数・配列項目 mask[y * cw + x] の値を更新・計算します
                            mask[y * cw + x] = 1;
                            // 変数・配列項目 fgCount の値を更新・計算します
                            fgCount++;
                            // 前景ピクセルの RGB 値を集計します
                            sumR += r;
                            sumG += g;
                            sumB += b;
                            // 条件（x < minX）が成り立つか判定し、該当する場合の処理を実行します
                            if (x < minX) minX = x;
                            // 条件（x > maxX）が成り立つか判定し、該当する場合の処理を実行します
                            if (x > maxX) maxX = x;
                            // 条件（y < minY）が成り立つか判定し、該当する場合の処理を実行します
                            if (y < minY) minY = y;
                            // 条件（y > maxY）が成り立つか判定し、該当する場合の処理を実行します
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                // 定数 coverage を宣言し、値（fgCount / (cw * ch)）をセットします
                const coverage = fgCount / (cw * ch);

                // 条件（coverage < 0.035 || fgCount < 200）が成り立つか判定し、該当する場合の処理を実行します
                if (coverage < 0.035 || fgCount < 200) {
                    // 判定・解析結果オブジェクトを resolve() に渡して Promise を完了返却します
                    return resolve({
                        // 有効なファッションアイテム画像として許可するかどうかの真偽値
                        isValid: false,
                        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                        category: null,
                        // AI 形状判定の信頼度スコア（%）
                        confidence: 0,
                        // モーダル見出しまたはコーデ保存タイトル
                        title: 'アイテムが検出できません',
                        // 画面に表示する補足説明文
                        desc: '服や靴、帽子がはっきりと写った写真を選択してください。'
                    });
                }

                // 定数 boxW を宣言し、値（Math.max(1, maxX - minX + 1)）をセットします
                const boxW = Math.max(1, maxX - minX + 1);
                // 定数 boxH を宣言し、値（Math.max(1, maxY - minY + 1)）をセットします
                const boxH = Math.max(1, maxY - minY + 1);
                // 定数 aspectRatio を宣言し、値（boxH / boxW）をセットします
                const aspectRatio = boxH / boxW;
                // 定数 boxFillRatio を宣言し、値（fgCount / (boxW * boxH)）をセットします
                const boxFillRatio = fgCount / (boxW * boxH);

                // 条件（boxFillRatio > 0.94 && coverage > 0.85）が成り立つか判定し、該当する場合の処理を実行します
                if (boxFillRatio > 0.94 && coverage > 0.85) {
                    // 判定・解析結果オブジェクトを resolve() に渡して Promise を完了返却します
                    return resolve({
                        // 有効なファッションアイテム画像として許可するかどうかの真偽値
                        isValid: false,
                        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                        category: null,
                        // AI 形状判定の信頼度スコア（%）
                        confidence: 0,
                        // モーダル見出しまたはコーデ保存タイトル
                        title: '服の形状が認識できません',
                        // 画面に表示する補足説明文
                        desc: '四角い写真や背景が検出されました。アウター・トップス・ボトムス・靴・帽子の写真を選択してください。'
                    });
                }

                // 定数 sliceH を宣言し、値（boxH / 10.0）をセットします
                const sliceH = boxH / 10.0;
                // 定数 sliceWidths を宣言し、値（[]）をセットします
                const sliceWidths = [];
                // 再代入可能な変数 crotchSlices を宣言し、値（0）をセットします
                let crotchSlices = 0;
                // 再代入可能な変数 maxSliceIdx を宣言し、値（0）をセットします
                let maxSliceIdx = 0;
                // 再代入可能な変数 maxSliceWidth を宣言し、値（0）をセットします
                let maxSliceWidth = 0;

                // 配列要素やインデックスを順番に繰り返すループ処理（for (let s = 0; s < 10; s++) {）を開始します
                for (let s = 0; s < 10; s++) {
                    // 定数 sy1 を宣言し、値（Math.floor(minY + s * sliceH)）をセットします
                    const sy1 = Math.floor(minY + s * sliceH);
                    // 定数 sy2 を宣言し、値（Math.min(ch, Math.floor(minY + (s + 1)…）をセットします
                    const sy2 = Math.min(ch, Math.floor(minY + (s + 1) * sliceH));
                    // 再代入可能な変数 rowCount を宣言し、値（0）をセットします
                    let rowCount = 0;
                    // 再代入可能な変数 prevWasFg を宣言し、値（false）をセットします
                    let prevWasFg = false;
                    // 再代入可能な変数 transitions を宣言し、値（0）をセットします
                    let transitions = 0;

                    // 配列要素やインデックスを順番に繰り返すループ処理（for (let x = minX; x <= maxX; x++) {）を開始します
                    for (let x = minX; x <= maxX; x++) {
                        // 再代入可能な変数 colHasFg を宣言し、値（false）をセットします
                        let colHasFg = false;
                        // 配列要素やインデックスを順番に繰り返すループ処理（for (let y = sy1; y < sy2; y++) {）を開始します
                        for (let y = sy1; y < sy2; y++) {
                            // 条件（mask[y * cw + x]）が成り立つか判定し、該当する場合の処理を実行します
                            if (mask[y * cw + x]) {
                                // 変数・配列項目 colHasFg の値を更新・計算します
                                colHasFg = true;
                                // 現在の case / ループ処理をここで抜けます
                                break;
                            }
                        }
                        // 条件（colHasFg）が成り立つか判定し、該当する場合の処理を実行します
                        if (colHasFg) {
                            // 変数・配列項目 rowCount の値を更新・計算します
                            rowCount++;
                            // 条件（!prevWasFg）が成り立つか判定し、該当する場合の処理を実行します
                            if (!prevWasFg) transitions++;
                            // 変数・配列項目 prevWasFg の値を更新・計算します
                            prevWasFg = true;
                            // 上記の if 条件に当てはまらなかった場合の分岐処理です
                        } else {
                            // 変数・配列項目 prevWasFg の値を更新・計算します
                            prevWasFg = false;
                        }
                    }

                    // 配列の末尾に新しい要素を追加します（sliceWidths.push(rowCount / boxW);）
                    sliceWidths.push(rowCount / boxW);
                    // 条件（rowCount / boxW > maxSliceWidth）が成り立つか判定し、該当する場合の処理を実行します
                    if (rowCount / boxW > maxSliceWidth) {
                        // 変数・配列項目 maxSliceWidth の値を更新・計算します
                        maxSliceWidth = rowCount / boxW;
                        // 変数・配列項目 maxSliceIdx の値を更新・計算します
                        maxSliceIdx = s;
                    }

                    // 条件（transitions >= 2 && s >= 4）が成り立つか判定し、該当する場合の処理を実行します
                    if (transitions >= 2 && s >= 4) {
                        // 変数・配列項目 crotchSlices の値を更新・計算します
                        crotchSlices++;
                    }
                }

                // 定数 topW を宣言し、値（(sliceWidths[0] + sliceWidths[1]) / 2）をセットします
                const topW = (sliceWidths[0] + sliceWidths[1]) / 2;
                // 定数 midW を宣言し、値（(sliceWidths[4] + sliceWidths[5]) / 2）をセットします
                const midW = (sliceWidths[4] + sliceWidths[5]) / 2;
                // 定数 bottomW を宣言し、値（(sliceWidths[8] + sliceWidths[9]) / 2）をセットします
                const bottomW = (sliceWidths[8] + sliceWidths[9]) / 2;

                // 定数 scores を宣言し、値（{）をセットします
                const scores = {
                    // オブジェクトの 'BOTTOMS' プロパティ値を設定します
                    BOTTOMS: 10,
                    // オブジェクトの 'SHOES' プロパティ値を設定します
                    SHOES: 10,
                    // オブジェクトの 'HAT' プロパティ値を設定します
                    HAT: 10,
                    // オブジェクトの 'TOPS' プロパティ値を設定します
                    TOPS: 10,
                    // オブジェクトの 'OUTER' プロパティ値を設定します
                    OUTER: 10
                };

                // 条件（aspectRatio >= 1.25）が成り立つか判定し、該当する場合の処理を実行します
                if (aspectRatio >= 1.25) scores.BOTTOMS += 35;
                // 条件（aspectRatio >= 1.5）が成り立つか判定し、該当する場合の処理を実行します
                if (aspectRatio >= 1.5) scores.BOTTOMS += 20;
                // 条件（crotchSlices >= 2）が成り立つか判定し、該当する場合の処理を実行します
                if (crotchSlices >= 2) scores.BOTTOMS += 45;
                // 条件（topW < 0.8 && bottomW > 0.4 && crotchSlices >= 1）が成り立つか判定し、該当する場合の処理を実行します
                if (topW < 0.8 && bottomW > 0.4 && crotchSlices >= 1) scores.BOTTOMS += 20;

                // 条件（aspectRatio <= 1.1）が成り立つか判定し、該当する場合の処理を実行します
                if (aspectRatio <= 1.1) scores.SHOES += 35;
                // 条件（aspectRatio <= 0.85）が成り立つか判定し、該当する場合の処理を実行します
                if (aspectRatio <= 0.85) scores.SHOES += 25;
                // 条件（bottomW >= 0.65）が成り立つか判定し、該当する場合の処理を実行します
                if (bottomW >= 0.65) scores.SHOES += 25;
                // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
                if (crotchSlices === 0) scores.SHOES += 10;

                // 条件（aspectRatio >= 0.55 && aspectRatio <= 1.25）が成り立つか判定し、該当する場合の処理を実行します
                if (aspectRatio >= 0.55 && aspectRatio <= 1.25) scores.HAT += 30;
                // 条件（sliceWidths[0] < 0.4 && sliceWidths[2] > 0.6）が成り立つか判定し、該当する場合の処理を実行します
                if (sliceWidths[0] < 0.4 && sliceWidths[2] > 0.6) scores.HAT += 35;
                // 対象データが 0 件（空）だった場合の専用メッセージ／空表示ルートを判定します
                if (crotchSlices === 0) scores.HAT += 15;

                // 条件（aspectRatio >= 0.75 && aspectRatio <= 1.45）が成り立つか判定し、該当する場合の処理を実行します
                if (aspectRatio >= 0.75 && aspectRatio <= 1.45) scores.TOPS += 25;
                // 条件（maxSliceIdx >= 1 && maxSliceIdx <= 3）が成り立つか判定し、該当する場合の処理を実行します
                if (maxSliceIdx >= 1 && maxSliceIdx <= 3) scores.TOPS += 35;
                // 条件（crotchSlices <= 1）が成り立つか判定し、該当する場合の処理を実行します
                if (crotchSlices <= 1) scores.TOPS += 20;

                // 条件（aspectRatio >= 1.15 && aspectRatio <= 2.2）が成り立つか判定し、該当する場合の処理を実行します
                if (aspectRatio >= 1.15 && aspectRatio <= 2.2) scores.OUTER += 30;
                // 条件（maxSliceIdx >= 1 && maxSliceIdx <= 4）が成り立つか判定し、該当する場合の処理を実行します
                if (maxSliceIdx >= 1 && maxSliceIdx <= 4) scores.OUTER += 25;
                // 条件（crotchSlices <= 1）が成り立つか判定し、該当する場合の処理を実行します
                if (crotchSlices <= 1) scores.OUTER += 15;

                // 再代入可能な変数 isNonClothingAi を宣言し、値（false）をセットします
                let isNonClothingAi = false;
                // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
                try {
                    // 定数 model を宣言し、値（await getMobileNetModel()）をセットします
                    const model = await getMobileNetModel();
                    // 条件（model）が成り立つか判定し、該当する場合の処理を実行します
                    if (model) {
                        // 定数 predictions を宣言し、値（await model.classify(canvas)）をセットします
                        const predictions = await model.classify(canvas);
                        // 条件（predictions && predictions.length > 0）が成り立つか判定し、該当する場合の処理を実行します
                        if (predictions && predictions.length > 0) {
                            // 定数 top を宣言し、値（predictions[0]）をセットします
                            const top = predictions[0];
                            // 定数 label を宣言し、値（(top.className || '').toLowerCase()）をセットします
                            const label = (top.className || '').toLowerCase();

                            // 定数 nonClothingKeywords を宣言し、値（[）をセットします
                            const nonClothingKeywords = [
                                // 配列要素データ（'dog', 'cat', 'bird', 'animal', 'pizza', '…）を定義します
                                'dog', 'cat', 'bird', 'animal', 'pizza', 'sandwich', 'burger', 'food',
                                // 配列要素データ（'car', 'vehicle', 'truck', 'traffic', 'com…）を定義します
                                'car', 'vehicle', 'truck', 'traffic', 'computer', 'laptop', 'cellular',
                                // 配列要素データ（'phone', 'book', 'bottle', 'cup', 'mug', '…）を定義します
                                'phone', 'book', 'bottle', 'cup', 'mug', 'desk', 'chair', 'table'
                            ];
                            // 配列要素やインデックスを順番に繰り返すループ処理（for (const kw of nonClothingKeywords) {）を開始します
                            for (const kw of nonClothingKeywords) {
                                // 条件（label.includes(kw) && top.probability > 0.25）が成り立つか判定し、該当する場合の処理を実行します
                                if (label.includes(kw) && top.probability > 0.25) {
                                    // 変数・配列項目 isNonClothingAi の値を更新・計算します
                                    isNonClothingAi = true;
                                    // 現在の case / ループ処理をここで抜けます
                                    break;
                                }
                            }

                            // 条件（label.match(/shoe|sneaker|boot|loafer|sandal|clog/)）が成り立つか判定し、該当する場合の処理を実行します
                            if (label.match(/shoe|sneaker|boot|loafer|sandal|clog/)) {
                                // 変数・配列項目 scores.SHOES の値を更新・計算します
                                scores.SHOES += 60;
                                // 前の if が偽で、かつ（label.match(/hat|cap|bonnet|beret|helmet/)）を満たす場合の別条件分岐です
                            } else if (label.match(/hat|cap|bonnet|beret|helmet/)) {
                                // 変数・配列項目 scores.HAT の値を更新・計算します
                                scores.HAT += 60;
                                // 前の if が偽で、かつ（label.match(/jean|pant|trouser|skirt/)）を満たす場合の別条件分岐です
                            } else if (label.match(/jean|pant|trouser|skirt/)) {
                                // 変数・配列項目 scores.BOTTOMS の値を更新・計算します
                                scores.BOTTOMS += 60;
                                // 前の if が偽で、かつ（label.match(/coat|jacket|trench|overcoat/)）を満たす場合の別条件分岐です
                            } else if (label.match(/coat|jacket|trench|overcoat/)) {
                                // 変数・配列項目 scores.OUTER の値を更新・計算します
                                scores.OUTER += 60;
                                // 前の if が偽で、かつ（label.match(/jersey|shirt|t-shirt|sweater|sweatshirt…）を満たす場合の別条件分岐です
                            } else if (label.match(/jersey|shirt|t-shirt|sweater|sweatshirt|cardigan|vest|top/)) {
                                // 変数・配列項目 scores.TOPS の値を更新・計算します
                                scores.TOPS += 60;
                            }
                        }
                    }
                    // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
                } catch (e) {
                    // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
                    console.warn('AIモデル判定スキップ:', e);
                }

                // 条件（isNonClothingAi）が成り立つか判定し、該当する場合の処理を実行します
                if (isNonClothingAi) {
                    // 判定・解析結果オブジェクトを resolve() に渡して Promise を完了返却します
                    return resolve({
                        // 有効なファッションアイテム画像として許可するかどうかの真偽値
                        isValid: false,
                        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                        category: null,
                        // AI 形状判定の信頼度スコア（%）
                        confidence: 0,
                        // モーダル見出しまたはコーデ保存タイトル
                        title: 'ファッションアイテムではありません',
                        // 画面に表示する補足説明文
                        desc: '服や靴、帽子の写真ではありません。アウター、トップス、ボトムス、靴、帽子を撮影または選択してください。'
                    });
                }

                // 再代入可能な変数 bestCategory を宣言し、値（'TOPS'）をセットします
                let bestCategory = 'TOPS';
                // 再代入可能な変数 highestScore を宣言し、値（-1）をセットします
                let highestScore = -1;
                // 配列要素やインデックスを順番に繰り返すループ処理（for (const cat in scores) {）を開始します
                for (const cat in scores) {
                    // 条件（scores[cat] > highestScore）が成り立つか判定し、該当する場合の処理を実行します
                    if (scores[cat] > highestScore) {
                        // 変数・配列項目 highestScore の値を更新・計算します
                        highestScore = scores[cat];
                        // 変数・配列項目 bestCategory の値を更新・計算します
                        bestCategory = cat;
                    }
                }

                // 条件（highestScore < 45）が成り立つか判定し、該当する場合の処理を実行します
                if (highestScore < 45) {
                    // 判定・解析結果オブジェクトを resolve() に渡して Promise を完了返却します
                    return resolve({
                        // 有効なファッションアイテム画像として許可するかどうかの真偽値
                        isValid: false,
                        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                        category: null,
                        // AI 形状判定の信頼度スコア（%）
                        confidence: 0,
                        // モーダル見出しまたはコーデ保存タイトル
                        title: '服の形状が特定できません',
                        // 画面に表示する補足説明文
                        desc: 'アウター、ボトムス、トップス、靴、帽子のいずれかの形状がはっきりわかる写真をご使用ください。'
                    });
                }

                // 定数 catNames を宣言し、値（{）をセットします
                const catNames = {
                    // オブジェクトの 'OUTER' プロパティ値を設定します
                    OUTER: 'アウター (コート/ジャケット形状)',
                    // オブジェクトの 'BOTTOMS' プロパティ値を設定します
                    BOTTOMS: 'ボトムス (パンツ/スラックス形状)',
                    // オブジェクトの 'TOPS' プロパティ値を設定します
                    TOPS: 'トップス (Tシャツ/スウェット形状)',
                    // オブジェクトの 'SHOES' プロパティ値を設定します
                    SHOES: '靴 (スニーカー/シューズ形状)',
                    // オブジェクトの 'HAT' プロパティ値を設定します
                    HAT: '帽子 (キャップ/ハット形状)'
                };

                // 定数 confidence を宣言し、値（Math.min(99, Math.max(82, Math.round(h…）をセットします
                const confidence = Math.min(99, Math.max(82, Math.round(highestScore * 0.95)));

                // 前景ピクセルから代表カラーをAI検出（RGB -> HSL判定）
                const avgR = fgCount > 0 ? Math.round(sumR / fgCount) : 0;
                const avgG = fgCount > 0 ? Math.round(sumG / fgCount) : 0;
                const avgB = fgCount > 0 ? Math.round(sumB / fgCount) : 0;

                const rf = avgR / 255, gf = avgG / 255, bf = avgB / 255;
                const cMax = Math.max(rf, gf, bf), cMin = Math.min(rf, gf, bf);
                let h = 0, s = 0, l = (cMax + cMin) / 2;
                if (cMax !== cMin) {
                    const d = cMax - cMin;
                    s = l > 0.5 ? d / (2 - cMax - cMin) : d / (cMax + cMin);
                    if (cMax === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
                    else if (cMax === gf) h = ((bf - rf) / d + 2) / 6;
                    else h = ((rf - gf) / d + 4) / 6;
                }
                const hue = Math.round(h * 360);
                const sat = Math.round(s * 100);
                const light = Math.round(l * 100);

                let detectedColor = 'BLACK';
                let detectedColorLabel = 'BLACK (ブラック・黒)';

                if (light < 18) {
                    detectedColor = 'BLACK';
                    detectedColorLabel = 'BLACK (ブラック・黒)';
                } else if (light > 80 && sat < 18) {
                    detectedColor = 'WHITE';
                    detectedColorLabel = 'WHITE (ホワイト・白)';
                } else if (sat < 14) {
                    if (light < 45) {
                        detectedColor = 'CHARCOAL';
                        detectedColorLabel = 'CHARCOAL (チャコール・濃灰)';
                    } else {
                        detectedColor = 'GREY';
                        detectedColorLabel = 'GREY (グレー・灰)';
                    }
                } else if (hue >= 170 && hue <= 260) {
                    if (light < 35) {
                        detectedColor = 'NAVY';
                        detectedColorLabel = 'NAVY (ネイビー・紺)';
                    } else {
                        detectedColor = 'BLUE';
                        detectedColorLabel = 'BLUE (ブルー・青・デニム)';
                    }
                } else if (hue >= 15 && hue <= 50) {
                    if (light > 62 && sat < 50) {
                        detectedColor = 'BEIGE';
                        detectedColorLabel = 'BEIGE (ベージュ・生成)';
                    } else if (light <= 48) {
                        detectedColor = 'BROWN';
                        detectedColorLabel = 'BROWN (ブラウン・茶)';
                    } else {
                        detectedColor = 'BEIGE';
                        detectedColorLabel = 'BEIGE (ベージュ・生成)';
                    }
                } else {
                    detectedColor = 'OTHER';
                    detectedColorLabel = 'OTHER (その他)';
                }

                // 最終結果を resolve() に渡して非同期 Promise を完了させます
                resolve({
                    // 有効なファッションアイテム画像として許可するかどうかの真偽値
                    isValid: true,
                    // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                    category: bestCategory,
                    // AI 形状判定の信頼度スコア（%）
                    confidence: confidence,
                    // AI 検出カラー
                    color: detectedColor,
                    // AI 検出カラー表示ラベル
                    colorLabel: detectedColorLabel,
                    // モーダル見出しまたはコーデ保存タイトル
                    title: `✨ AI形状認識: ${catNames[bestCategory]}`,
                    // 画面に表示する補足説明文
                    desc: `マイクローゼットに登録可能です。カテゴリとカラー（${detectedColorLabel}）を自動判定しました。`
                });

                // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
            } catch (err) {
                // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
                console.error('形状解析エラー:', err);
                // 最終結果を resolve() に渡して非同期 Promise を完了させます
                resolve({
                    // 有効なファッションアイテム画像として許可するかどうかの真偽値
                    isValid: true,
                    // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                    category: 'TOPS',
                    // AI 形状判定の信頼度スコア（%）
                    confidence: 80,
                    // AI 検出カラー
                    color: 'BLACK',
                    colorLabel: 'BLACK (ブラック・黒)',
                    // モーダル見出しまたはコーデ保存タイトル
                    title: '✨ 形状解析完了',
                    // 画面に表示する補足説明文
                    desc: 'マイクローゼットに登録可能です。'
                });
            }
        };

        // 変数・配列項目 img.onerror の値を更新・計算します
        img.onerror = () => {
            // 最終結果を resolve() に渡して非同期 Promise を完了させます
            resolve({
                // 有効なファッションアイテム画像として許可するかどうかの真偽値
                isValid: false,
                // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                category: null,
                // AI 形状判定の信頼度スコア（%）
                confidence: 0,
                // モーダル見出しまたはコーデ保存タイトル
                title: '画像の読み込みに失敗しました',
                // 画面に表示する補足説明文
                desc: '有効な画像ファイルを選択してください。'
            });
        };

        // 条件（typeof source === 'string'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof source === 'string') {
            // 変数・配列項目 img.src の値を更新・計算します
            img.src = source;
            // 前の if が偽で、かつ（source instanceof Blob）を満たす場合の別条件分岐です
        } else if (source instanceof Blob) {
            // 変数・配列項目 img.src の値を更新・計算します
            img.src = URL.createObjectURL(source);
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 最終結果を resolve() に渡して非同期 Promise を完了させます
            resolve({
                // 有効なファッションアイテム画像として許可するかどうかの真偽値
                isValid: false,
                // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                category: null,
                // AI 形状判定の信頼度スコア（%）
                confidence: 0,
                // モーダル見出しまたはコーデ保存タイトル
                title: '無効な画像データです',
                // 画面に表示する補足説明文
                desc: '画像を選択してください。'
            });
        }
    });
}

// ==========================================================================
// 【関数】processClosetImageWithAi(source)
// 【役割】写真を選んだあとの「AI切り抜き＆カテゴリ自動判定」の一連の流れを実行する
// 【具体的な処理内容】
//   ・写真を受け取り、①背景除去 → ②プレビュー表示 → ③カテゴリ自動判定 を順番に行います
// ==========================================================================
async function processClosetImageWithAi(source) {
    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // 定数 blob を宣言し、値（await runAiBackgroundRemoval(source)）をセットします
        const blob = await runAiBackgroundRemoval(source);
        // 選択された画像ファイルをブラウザメモリ内 DataURL へ変換するための FileReader を生成します
        const reader = new FileReader();
        // 変数・配列項目 reader.onload の値を更新・計算します
        reader.onload = async function (evt) {
            // 変数・配列項目 currentClosetUploadDataUrl の値を更新・計算します
            currentClosetUploadDataUrl = evt.target.result;
            // 変数・配列項目 isCurrentUploadTransparent の値を更新・計算します
            isCurrentUploadTransparent = true;
            // 関連処理 updateClosetPreviewUI() を呼び出して処理・画面を更新します
            updateClosetPreviewUI(currentClosetUploadDataUrl, true);
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToastNotification('✨ AIが服の背景を綺麗に切り抜きました！');

            // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
            updateAiDiagnosisUI(null, true);
            // 変数・配列項目 currentAiAnalysisResult の値を更新・計算します
            currentAiAnalysisResult = await analyzeClothingItemShape(currentClosetUploadDataUrl);
            // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
            updateAiDiagnosisUI(currentAiAnalysisResult, false);
        };
        // 選択ファイルをブラウザ内でそのまま画像表示できる DataURL 文字列へ非同期変換開始します
        reader.readAsDataURL(blob);
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (err) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('AI背景削除に失敗、元画像を使用:', err);
        // 変数・配列項目 currentClosetUploadDataUrl の値を更新・計算します
        currentClosetUploadDataUrl = originalClosetUploadDataUrl;
        // 変数・配列項目 isCurrentUploadTransparent の値を更新・計算します
        isCurrentUploadTransparent = false;
        // 関連処理 updateClosetPreviewUI() を呼び出して処理・画面を更新します
        updateClosetPreviewUI(currentClosetUploadDataUrl, false);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('AI背景切り抜きをスキップし、元の写真を設定しました');

        // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
        updateAiDiagnosisUI(null, true);
        // 変数・配列項目 currentAiAnalysisResult の値を更新・計算します
        currentAiAnalysisResult = await analyzeClothingItemShape(currentClosetUploadDataUrl);
        // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
        updateAiDiagnosisUI(currentAiAnalysisResult, false);
    }
}

// ==========================================================================
// 【関数】selectPresetImage(presetKey, presetName)
// 【役割】サンプル写真チップを選んだときの処理
// 【具体的な処理内容】
//   ・サンプルの服写真を選んだときに、自動で名前やカテゴリを入力欄にセットします
// ==========================================================================
function selectPresetImage(presetKey, presetName) {
    // 定数 preset を宣言し、値（PRESET_CLOSET_PRESETS[presetKey]）をセットします
    const preset = PRESET_CLOSET_PRESETS[presetKey];
    // 条件（!preset）が成り立つか判定し、該当する場合の処理を実行します
    if (!preset) return;

    // 変数・配列項目 originalClosetUploadDataUrl の値を更新・計算します
    originalClosetUploadDataUrl = preset.image;
    // 変数・配列項目 currentClosetUploadDataUrl の値を更新・計算します
    currentClosetUploadDataUrl = preset.image;
    // 変数・配列項目 isCurrentUploadTransparent の値を更新・計算します
    isCurrentUploadTransparent = false;

    // 関連処理 updateClosetPreviewUI() を呼び出して処理・画面を更新します
    updateClosetPreviewUI(preset.image, false);

    // HTML 要素 #closet-item-name を取得して変数 nameInput に格納します
    const nameInput = document.getElementById('closet-item-name');
    // 条件（nameInput）が成り立つか判定し、該当する場合の処理を実行します
    if (nameInput) nameInput.value = preset.name;

    // CSS セレクタに最初に一致した HTML 要素を取得して変数 catRadio に入れます
    const catRadio = document.querySelector(`input[name="closet_category"][value="${preset.category}"]`);
    // 条件（catRadio）が成り立つか判定し、該当する場合の処理を実行します
    if (catRadio) catRadio.checked = true;

    // HTML 要素 #closet-item-color を取得して変数 colorSelect に格納します
    const colorSelect = document.getElementById('closet-item-color');
    // 条件（colorSelect）が成り立つか判定し、該当する場合の処理を実行します
    if (colorSelect) colorSelect.value = preset.color;

    // HTML 要素 #closet-item-season を取得して変数 seasonSelect に格納します
    const seasonSelect = document.getElementById('closet-item-season');
    // 条件（seasonSelect）が成り立つか判定し、該当する場合の処理を実行します
    if (seasonSelect) seasonSelect.value = preset.season;

    // 変数・配列項目 currentAiAnalysisResult の値を更新・計算します
    currentAiAnalysisResult = {
        // 有効なファッションアイテム画像として許可するかどうかの真偽値
        isValid: true,
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: preset.category,
        // AI 形状判定の信頼度スコア（%）
        confidence: 100,
        // モーダル見出しまたはコーデ保存タイトル
        title: `✨ クイック写真: ${preset.name}`,
        // 画面に表示する補足説明文
        desc: '公式アイテムとしてマイクローゼットに登録可能です。'
    };
    // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
    updateAiDiagnosisUI(currentAiAnalysisResult, false);
}

// ==========================================================================
// 【関数】handleClosetImageSelect(e)
// 【役割】手持ち服登録で画像ファイルを選択（または撮影）したときの処理
// 【具体的な処理内容】
//   ・選ばれた写真ファイルを読み込み、AI背景切り抜き処理を開始します
// ==========================================================================
function handleClosetImageSelect(e) {
    // 定数 file を宣言し、値（e.target.files[0]）をセットします
    const file = e.target.files[0];
    // 条件（!file）が成り立つか判定し、該当する場合の処理を実行します
    if (!file) return;

    // 選択された画像ファイルをブラウザメモリ内 DataURL へ変換するための FileReader を生成します
    const reader = new FileReader();
    // 変数・配列項目 reader.onload の値を更新・計算します
    reader.onload = async function (evt) {
        // 変数・配列項目 originalClosetUploadDataUrl の値を更新・計算します
        originalClosetUploadDataUrl = evt.target.result;
        // 変数・配列項目 currentClosetUploadDataUrl の値を更新・計算します
        currentClosetUploadDataUrl = evt.target.result;
        // 変数・配列項目 isCurrentUploadTransparent の値を更新・計算します
        isCurrentUploadTransparent = false;

        // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
        updateAiDiagnosisUI(null, true);

        // HTML 要素 #check-auto-remove-bg を取得して変数 autoRemove に格納します
        const autoRemove = document.getElementById('check-auto-remove-bg')?.checked;

        // 条件（autoRemove）が成り立つか判定し、該当する場合の処理を実行します
        if (autoRemove) {
            // 関連処理 updateClosetPreviewUI() を呼び出して処理・画面を更新します
            updateClosetPreviewUI(originalClosetUploadDataUrl, false);
            // 選んだ画像またはリサイズ済み画像に対して AI 背景透過と形状分析パイプラインを実行します
            await processClosetImageWithAi(file);
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // 関連処理 updateClosetPreviewUI() を呼び出して処理・画面を更新します
            updateClosetPreviewUI(originalClosetUploadDataUrl, false);
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToastNotification('服の写真を読み込みました');
            // 変数・配列項目 currentAiAnalysisResult の値を更新・計算します
            currentAiAnalysisResult = await analyzeClothingItemShape(originalClosetUploadDataUrl);
            // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
            updateAiDiagnosisUI(currentAiAnalysisResult, false);
        }
    };
    // 選択ファイルをブラウザ内でそのまま画像表示できる DataURL 文字列へ非同期変換開始します
    reader.readAsDataURL(file);
}

// ==========================================================================
// 【関数】triggerManualBgRemoval()
// 【役割】「もう一度AIで背景を切り抜く」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・背景の切り抜きを最初から再実行します
// ==========================================================================
async function triggerManualBgRemoval() {
    // 定数 target を宣言し、値（originalClosetUploadDataUrl || current…）をセットします
    const target = originalClosetUploadDataUrl || currentClosetUploadDataUrl;
    // 条件（!target）が成り立つか判定し、該当する場合の処理を実行します
    if (!target) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('先に服の写真を選択してください');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 選んだ画像またはリサイズ済み画像に対して AI 背景透過と形状分析パイプラインを実行します
    await processClosetImageWithAi(target);
}

// ==========================================================================
// 【関数】restoreOriginalUploadImage()
// 【役割】「切り抜き前の元の写真に戻す」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・AIで切り抜く前の元写真にプレビューを戻します
// ==========================================================================
async function restoreOriginalUploadImage() {
    // 条件（!originalClosetUploadDataUrl）が成り立つか判定し、該当する場合の処理を実行します
    if (!originalClosetUploadDataUrl) return;
    // 変数・配列項目 currentClosetUploadDataUrl の値を更新・計算します
    currentClosetUploadDataUrl = originalClosetUploadDataUrl;
    // 変数・配列項目 isCurrentUploadTransparent の値を更新・計算します
    isCurrentUploadTransparent = false;
    // 関連処理 updateClosetPreviewUI() を呼び出して処理・画面を更新します
    updateClosetPreviewUI(originalClosetUploadDataUrl, false);
    // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
    showToastNotification('元の写真に戻しました');

    // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
    updateAiDiagnosisUI(null, true);
    // 変数・配列項目 currentAiAnalysisResult の値を更新・計算します
    currentAiAnalysisResult = await analyzeClothingItemShape(originalClosetUploadDataUrl);
    // 関連処理 updateAiDiagnosisUI() を呼び出して処理・画面を更新します
    updateAiDiagnosisUI(currentAiAnalysisResult, false);
}


// ==========================================================================
//  7. クローゼット MySQL CRUD ＆ スタジオ試着状態のデバウンス自動保存
// ==========================================================================
// 再代入可能な変数 _closetMutationSeq を宣言し、値（0）をセットします
let _closetMutationSeq = 0;

// ==========================================================================
// 【関数】bumpClosetMutationSeq()
// 【役割】クローゼット操作の連番管理カウンタを進める
// 【具体的な処理内容】
//   ・登録や削除の通信が前後して狂わないよう管理番号を増やします
// ==========================================================================
function bumpClosetMutationSeq() {
    // 変数・配列項目 _closetMutationSeq の値を更新・計算します
    _closetMutationSeq++;
}

// ==========================================================================
// 【関数】handleAddClosetItem(e)
// 【役割】「クローゼットに登録する」ボタンを押したときの保存処理
// 【具体的な処理内容】
//   ・服の名前・カテゴリ・切り抜き画像をサーバー（MySQL）へ送信して保存し、試着室に追加します
// ==========================================================================
async function handleAddClosetItem(e) {
    // 条件（e）が成り立つか判定し、該当する場合の処理を実行します
    if (e) e.preventDefault();

    // 条件（!currentClosetUploadDataUrl）が成り立つか判定し、該当する場合の処理を実行します
    if (!currentClosetUploadDataUrl) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ 服の写真を選択または撮影してください');
        // HTML 要素 #closet-upload-box を取得して変数 uploadBox に格納します
        const uploadBox = document.getElementById('closet-upload-box');
        // 条件（uploadBox）が成り立つか判定し、該当する場合の処理を実行します
        if (uploadBox) uploadBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // 条件（currentAiAnalysisResult && !currentAiAnalysisResult.…）が成り立つか判定し、該当する場合の処理を実行します
    if (currentAiAnalysisResult && !currentAiAnalysisResult.isValid) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification(`⚠️ 登録できません: ${currentAiAnalysisResult.title}。アウター、ボトムス、トップス、靴、帽子の写真のみ登録可能です`);
        // HTML 要素 #ai-diagnosis-card を取得して変数 diagCard に格納します
        const diagCard = document.getElementById('ai-diagnosis-card');
        // 条件（diagCard）が成り立つか判定し、該当する場合の処理を実行します
        if (diagCard) diagCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // HTML 要素 #closet-item-name を取得して変数 nameInput に格納します
    const nameInput = document.getElementById('closet-item-name');
    // 定数 name を宣言し、値（nameInput ? nameInput.value.trim() : '…）をセットします
    const name = nameInput ? nameInput.value.trim() : '';
    // 条件（!name）が成り立つか判定し、該当する場合の処理を実行します
    if (!name) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('服の名前を入力してください');
        // 条件（nameInput）が成り立つか判定し、該当する場合の処理を実行します
        if (nameInput) nameInput.focus();
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !AppState.currentUser.id || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ クローゼットをMySQLに保存するにはログインが必要です');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 userId を宣言し、値（AppState.currentUser.id）をセットします
    const userId = AppState.currentUser.id;

    // CSS セレクタに最初に一致した HTML 要素を取得して変数 catInput に入れます
    const catInput = document.querySelector('input[name="closet_category"]:checked');
    // 定数 category を宣言し、値（catInput ? catInput.value : 'BOTTOMS'）をセットします
    const category = catInput ? catInput.value : 'BOTTOMS';

    // HTML 要素 #closet-item-color を取得して変数 colorSelect に格納します
    const colorSelect = document.getElementById('closet-item-color');
    // 定数 color を宣言し、値（colorSelect ? colorSelect.value : 'BLA…）をセットします
    const color = colorSelect ? colorSelect.value : 'BLACK';

    // HTML 要素 #closet-item-season を取得して変数 seasonSelect に格納します
    const seasonSelect = document.getElementById('closet-item-season');
    // 定数 season を宣言し、値（seasonSelect ? seasonSelect.value : '通…）をセットします
    const season = seasonSelect ? seasonSelect.value : '通年';

    // HTML 要素 #btn-closet-submit を取得して変数 submitBtn に格納します
    const submitBtn = document.getElementById('btn-closet-submit');
    // 定数 originalBtnText を宣言し、値（submitBtn ? submitBtn.textContent : ''）をセットします
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    // 条件（submitBtn）が成り立つか判定し、該当する場合の処理を実行します
    if (submitBtn) {
        // 変数・配列項目 submitBtn.disabled の値を更新・計算します
        submitBtn.disabled = true;
        // 文字要素 submitBtn の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
        submitBtn.textContent = 'MySQLへ登録中...';
    }

    // 変数・配列項目 _closetMutationSeq の値を更新・計算します
    _closetMutationSeq++;
    // 定数 newItem を宣言し、値（{）をセットします
    const newItem = {
        // レコード・商品・コーデを識別する ID プロパティをセットします
        id: 'c-' + userId + '-' + Date.now(),
        // MySQL でどの会員アカウントのデータか区別するための user_id をセットします
        user_id: userId,
        // 商品名またはアイテム名称
        name: name,
        // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
        category: category,
        // カラー名
        color: color,
        // 着用シーズン
        season: season,
        // 画像ファイルパスまたは DataURL
        image: currentClosetUploadDataUrl,
        // ユーザーの手持ち私物であるかどうかのフラグ
        isOwned: true
    };

    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        AppState.myCloset.unshift(newItem);
        if (typeof lsSetJson === 'function') {
            lsSetJson('manekin_ls_closet_' + userId, AppState.myCloset);
        }
        showToastNotification(`「${name}」をマイクローゼットに登録しました！`);
        closeAddClosetModal();
        renderManekinStudio(AppState.studioActiveTab);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText || 'クローゼットに登録する';
        }
        return;
    }

    // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
    const apiBase = (typeof getApiBaseUrl === 'function')
        // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
        ? getApiBaseUrl()
        // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');

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
                isPurchased: false
            })
        });
        // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
        const data = await res.json().catch(() => ({}));
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok || data.status !== 'success') {
            // 処理を中断して呼び出し元の catch へエラー内容（throw new Error(data.message || 'API Error…）を渡します
            throw new Error(data.message || 'API Error');
        }
        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(userId)) return;

        // 新規追加された最新データを配列 AppState.myCloset の先頭へ挿入して即画面反映します
        AppState.myCloset.unshift(newItem);
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.log('✨ [MySQL] マイクローゼットにアイテムを保存しました:', data);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification(`「${name}」をマイクローゼット(MySQL)に登録しました！`);
        // 関連処理 closeAddClosetModal() を呼び出して処理・画面を更新します
        closeAddClosetModal();
        // 関連処理 renderManekinStudio() を呼び出して処理・画面を更新します
        renderManekinStudio(AppState.studioActiveTab);
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (err) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLクローゼット保存エラー:', err);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification(`⚠️ MySQLへの手持ち服保存に失敗しました（${err.message || 'サーバー接続を確認してください'}）`);
        // 成功・失敗に関わらず最後に必ず実行される後始末(finally)ブロックです
    } finally {
        // 条件（submitBtn）が成り立つか判定し、該当する場合の処理を実行します
        if (submitBtn) {
            // 変数・配列項目 submitBtn.disabled の値を更新・計算します
            submitBtn.disabled = false;
            // 文字要素 submitBtn の表示テキストを新しい値へ書き換えます（HTML解釈なし・XSS安全）
            submitBtn.textContent = originalBtnText || 'クローゼットに登録する';
        }
    }
}

// ==========================================================================
// 【関数】deleteClosetItem(itemId)
// 【役割】手持ち服カードの「ゴミ箱（削除）」ボタンを押したときの処理
// 【具体的な処理内容】
//   ・その服をクローゼットから削除し、マネキンが着ていれば自動で脱がせます
// ==========================================================================
async function deleteClosetItem(itemId) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !AppState.currentUser.id || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ ログインが必要です');
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 userId を宣言し、値（AppState.currentUser.id）をセットします
    const userId = AppState.currentUser.id;
    // 条件（!confirm('この手持ちの服をクローゼットから削除しますか？')）が成り立つか判定し、該当する場合の処理を実行します
    if (!confirm('この手持ちの服をクローゼットから削除しますか？')) return;

    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        let wasWearingDeleted = false;
        for (const slotKey in AppState.currentOutfit) {
            if (AppState.currentOutfit[slotKey] && String(AppState.currentOutfit[slotKey].id) === String(itemId)) {
                AppState.currentOutfit[slotKey] = null;
                wasWearingDeleted = true;
            }
        }
        if (wasWearingDeleted) {
            await syncStudioStateToBackend({ immediate: true });
        }
        AppState.myCloset = AppState.myCloset.filter(c => String(c.id) !== String(itemId));
        _closetMutationSeq++;
        if (typeof lsSetJson === 'function') {
            lsSetJson('manekin_ls_closet_' + userId, AppState.myCloset);
        }
        showToastNotification('手持ちの服を削除しました');
        renderManekinStudio(AppState.studioActiveTab);
        return;
    }

    // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
    const apiBase = (typeof getApiBaseUrl === 'function')
        // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
        ? getApiBaseUrl()
        // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/closet/delete/${encodeURIComponent）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/closet/delete/${encodeURIComponent(itemId)}?user_id=${userId}`, {
            // HTTP 通信メソッド（GET=取得 / POST=送信作成 / DELETE=削除）を指定します
            method: 'DELETE',
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include'
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('Delete failed');
        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(userId)) return;

        // 再代入可能な変数 wasWearingDeleted を宣言し、値（false）をセットします
        let wasWearingDeleted = false;
        // 配列要素やインデックスを順番に繰り返すループ処理（for (const slotKey in AppState.currentOutfit) {）を開始します
        for (const slotKey in AppState.currentOutfit) {
            // 条件（AppState.currentOutfit[slotKey] && String(AppState.c…）が成り立つか判定し、該当する場合の処理を実行します
            if (AppState.currentOutfit[slotKey] && String(AppState.currentOutfit[slotKey].id) === String(itemId)) {
                // 変数・配列項目 AppState.currentOutfit[slotKey] の値を更新・計算します
                AppState.currentOutfit[slotKey] = null;
                // 変数・配列項目 wasWearingDeleted の値を更新・計算します
                wasWearingDeleted = true;
            }
        }
        // 条件（wasWearingDeleted）が成り立つか判定し、該当する場合の処理を実行します
        if (wasWearingDeleted) {
            // メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
            await syncStudioStateToBackend({ immediate: true });
        }

        // アプリ全体状態 AppState.myCloset を最新値（AppState.myCloset.filter(c => String(c…）に更新します
        AppState.myCloset = AppState.myCloset.filter(c => String(c.id) !== String(itemId));
        // 変数・配列項目 _closetMutationSeq の値を更新・計算します
        _closetMutationSeq++;

        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('手持ちの服をMySQLから削除しました');
        // 関連処理 renderManekinStudio() を呼び出して処理・画面を更新します
        renderManekinStudio(AppState.studioActiveTab);
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (err) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLクローゼット削除エラー:', err);
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToastNotification('⚠️ MySQLから手持ち服を削除できませんでした（サーバー接続を確認してください）');
    }
}

// ==========================================================================
// 【関数】syncClosetFromBackend()
// 【役割】サーバー（MySQL）からログイン会員の手持ち服一覧を取得する
// 【具体的な処理内容】
//   ・データベースに登録されている自分の服を読み込んで、左カラムやクローゼット画面に並べます
// ==========================================================================
async function syncClosetFromBackend() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || !AppState.currentUser.id) {
        // アプリ全体状態 AppState.myCloset を最新値（[]）に更新します
        AppState.myCloset = [];
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 条件（typeof isServerUserId === 'function' && !isServerUse…）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof isServerUserId === 'function' && !isServerUserId(targetUserId)) {
        // アプリ全体状態 AppState.myCloset を最新値（[]）に更新します
        AppState.myCloset = [];
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }

    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        let saved = (typeof lsGetJson === 'function') ? lsGetJson('manekin_ls_closet_' + targetUserId, null) : null;
        if (!Array.isArray(saved)) {
            saved = (typeof getDefaultMobileClosetItems === 'function') ? getDefaultMobileClosetItems() : [];
            if (typeof lsSetJson === 'function') {
                lsSetJson('manekin_ls_closet_' + targetUserId, saved);
            }
        }
        AppState.myCloset = saved;
        const closetBadge = document.getElementById('studio-closet-badge');
        if (closetBadge) closetBadge.textContent = AppState.myCloset.length;
        const mobClosetCnt = document.getElementById('mob-closet-cnt');
        if (mobClosetCnt) mobClosetCnt.textContent = AppState.myCloset.length;
        const homeCloset = document.getElementById('home-stat-closet');
        if (homeCloset) homeCloset.innerHTML = `${AppState.myCloset.length} <small>点</small>`;
        if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
        if (AppState.studioActiveTab === 'closet' && typeof renderPaneClosetGrid === 'function') {
            renderPaneClosetGrid();
        }
        return;
    }

    // 定数 fetchStartSeq を宣言し、値（_closetMutationSeq）をセットします
    const fetchStartSeq = _closetMutationSeq;
    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
        const apiBase = (typeof getApiBaseUrl === 'function')
            // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
            ? getApiBaseUrl()
            // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
            : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');
        // Flask バックエンド API（/api/closet/${targetUserId}）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/closet/${targetUserId}`, {
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
            // 条件（fetchStartSeq !== _closetMutationSeq）が成り立つか判定し、該当する場合の処理を実行します
            if (fetchStartSeq !== _closetMutationSeq) return;
            // 条件（data.closet_items && Array.isArray(data.closet_items…）が成り立つか判定し、該当する場合の処理を実行します
            if (data.closet_items && Array.isArray(data.closet_items)) {
                // 定数 mysqlItems を宣言し、値（data.closet_items.map(it => ({）をセットします
                const mysqlItems = data.closet_items.map(it => ({
                    // レコード・商品・コーデを識別する ID プロパティをセットします
                    id: it.item_uid || it.id,
                    // 紐づくブランド商品の元 ID
                    productId: it.product_id,
                    // 商品名またはアイテム名称
                    name: it.name,
                    // 部位カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                    category: it.category,
                    // カラー名
                    color: it.color,
                    // 着用シーズン
                    season: it.season || '通年',
                    // 画像ファイルパスまたは DataURL
                    image: it.image || it.image_url,
                    // ユーザーの手持ち私物であるかどうかのフラグ
                    isOwned: Boolean(it.is_owned),
                    // ストアで購入してクローゼット取り込みされた品かどうかのフラグ
                    isPurchased: Boolean(it.is_purchased),
                    // 単価・価格（円）
                    price: it.price || 0,
                    // 購入した日付
                    purchaseDate: it.purchase_date
                }));

                // アプリ全体状態 AppState.myCloset を最新値（mysqlItems）に更新します
                AppState.myCloset = mysqlItems;
                // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
                console.log(`✨ [MySQL] マイクローゼット同期完了 (user_id=${targetUserId}): ${AppState.myCloset.length} 点`);

                // HTML 要素 #studio-closet-badge を取得して変数 closetBadge に格納します
                const closetBadge = document.getElementById('studio-closet-badge');
                // 条件（closetBadge）が成り立つか判定し、該当する場合の処理を実行します
                if (closetBadge) closetBadge.textContent = AppState.myCloset.length;
                // HTML 要素 #mob-closet-cnt を取得して変数 mobClosetCnt に格納します
                const mobClosetCnt = document.getElementById('mob-closet-cnt');
                // 条件（mobClosetCnt）が成り立つか判定し、該当する場合の処理を実行します
                if (mobClosetCnt) mobClosetCnt.textContent = AppState.myCloset.length;
                // HTML 要素 #home-stat-closet を取得して変数 homeCloset に格納します
                const homeCloset = document.getElementById('home-stat-closet');
                // 条件（homeCloset）が成り立つか判定し、該当する場合の処理を実行します
                if (homeCloset) homeCloset.innerHTML = `${AppState.myCloset.length} <small>点</small>`;

                // 条件（typeof renderStudioClosetList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
                if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
                // 条件（AppState.studioActiveTab === 'closet' && typeof rend…）が成り立つか判定し、該当する場合の処理を実行します
                if (AppState.studioActiveTab === 'closet' && typeof renderPaneClosetGrid === 'function') {
                    // 関連処理 renderPaneClosetGrid() を呼び出して処理・画面を更新します
                    renderPaneClosetGrid();
                }
            }
        }
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLクローゼット取得エラー:', e);
    }
}


// ==========================================================================
//  TODAY'S AI STYLING: 現在の気温・日時・季節に応じた動的コーデ提案エンジン
// ==========================================================================

// 気温キャッシュ（過度なAPI通信を防ぐため5分間有効）
let _todayStylingWeatherCache = {
    temp: null,
    tempMin: null,
    tempMax: null,
    weatherText: '',
    locationName: '愛知・名古屋',
    provider: 'JMA',
    fetchedAt: 0
};

// ==========================================================================
// 【関数】calculateEstimatedTemperature(date = new Date())
// 【役割】現在日時（月と時間帯）から愛知県（名古屋）のリアルな推定気温を計算する
// 【具体的な処理内容】
//   ・気象庁との通信が取れないときの予備として、季節と昼夜に応じた現実的な気温を計算します
// ==========================================================================
function calculateEstimatedTemperature(date = new Date()) {
    const month = date.getMonth() + 1; // 1〜12月
    const hour = date.getHours();       // 0〜23時
    const monthBaseTemps = {
        1: { day: 9, night: 2 },
        2: { day: 10, night: 2 },
        3: { day: 14, night: 5 },
        4: { day: 20, night: 10 },
        5: { day: 24, night: 15 },
        6: { day: 27, night: 20 },
        7: { day: 32, night: 24 },
        8: { day: 34, night: 25 },
        9: { day: 28, night: 20 },
        10: { day: 23, night: 14 },
        11: { day: 16, night: 9 },
        12: { day: 12, night: 4 }
    };
    const base = monthBaseTemps[month] || { day: 18, night: 12 };
    if (hour >= 10 && hour <= 16) {
        return base.day;
    } else if ((hour >= 7 && hour < 10) || (hour > 16 && hour <= 20)) {
        return Math.round((base.day + base.night) / 2);
    }
    return base.night;
}

// ==========================================================================
// 【関数】fetchCurrentTemperature()
// 【役割】気象庁（JMA）公式データから愛知県（名古屋）の気温と天気を取得する
// 【具体的な処理内容】
//   ・気象庁の最新天気予報・アメダスから、最低気温・最高気温・天気を自動取得します
// ==========================================================================
async function fetchCurrentTemperature() {
    const now = Date.now();
    // 5分以内のキャッシュがあれば再利用
    if (_todayStylingWeatherCache.temp !== null && (now - _todayStylingWeatherCache.fetchedAt < 300000)) {
        return _todayStylingWeatherCache;
    }
    // デフォルトの愛知推定気温を即座に計算
    const estimatedTemp = calculateEstimatedTemperature(new Date());
    let result = {
        temp: estimatedTemp,
        tempMin: Math.max(estimatedTemp - 5, 0),
        tempMax: estimatedTemp + 4,
        weatherText: '心地よい秋晴れ',
        locationName: '愛知・名古屋',
        provider: '気象庁(JMA)',
        fetchedAt: now
    };

    // 1. 気象庁（JMA）公式APIから愛知県（名古屋）の予報（最低・最高気温・天候）を取得
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const jmaRes = await fetch('https://www.jma.go.jp/bosai/forecast/data/forecast/230000.json', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (jmaRes.ok) {
            const jmaData = await jmaRes.json();
            let parsedMin = null;
            let parsedMax = null;
            let parsedWeather = '晴れ';

            // 天気テキストの抽出（西部: 名古屋）
            try {
                if (jmaData[0] && jmaData[0].timeSeries && jmaData[0].timeSeries[0] && jmaData[0].timeSeries[0].areas) {
                    const area0 = jmaData[0].timeSeries[0].areas[0];
                    if (area0 && area0.weathers && area0.weathers[0]) {
                        parsedWeather = area0.weathers[0].replace(/[\s\u3000]+/g, ' ').trim();
                    }
                }
            } catch (we) { }

            // 気温（最低・最高）の抽出（名古屋: 51106）
            try {
                if (jmaData[0] && jmaData[0].timeSeries && jmaData[0].timeSeries[2] && jmaData[0].timeSeries[2].areas) {
                    for (const a of jmaData[0].timeSeries[2].areas) {
                        if (a.area && (a.area.code === '51106' || a.area.name === '名古屋')) {
                            const nums = (a.temps || []).map(t => parseInt(t, 10)).filter(n => !isNaN(n));
                            if (nums.length > 0) {
                                parsedMin = Math.min(...nums);
                                parsedMax = Math.max(...nums);
                            }
                            break;
                        }
                    }
                }
                // 週間予報から補完
                if (parsedMin === null && jmaData[1] && jmaData[1].timeSeries && jmaData[1].timeSeries[1] && jmaData[1].timeSeries[1].areas) {
                    for (const a of jmaData[1].timeSeries[1].areas) {
                        if (a.area && (a.area.code === '51106' || a.area.name === '名古屋')) {
                            const minNums = (a.tempsMin || []).map(t => parseInt(t, 10)).filter(n => !isNaN(n));
                            const maxNums = (a.tempsMax || []).map(t => parseInt(t, 10)).filter(n => !isNaN(n));
                            if (minNums.length > 0) parsedMin = minNums[0];
                            if (maxNums.length > 0) parsedMax = maxNums[0];
                            break;
                        }
                    }
                }
            } catch (te) { }

            if (parsedMin !== null) {
                result.tempMin = parsedMin;
                result.tempMax = (parsedMax !== null) ? parsedMax : (parsedMin + 7);
                result.weatherText = parsedWeather;
                result.provider = '気象庁(JMA)';
                result.locationName = '愛知・名古屋';
            }
        }
    } catch (jmaErr) {
        // JMA失敗時はフォールバック
    }

    // 2. 気象庁アメダス最新実況から「現在の観測気温」を取得（タイムアウト2秒）
    try {
        const amedasCtrl = new AbortController();
        const amedasTimer = setTimeout(() => amedasCtrl.abort(), 2000);
        const timeRes = await fetch('https://www.jma.go.jp/bosai/amedas/data/latest_time.txt', { signal: amedasCtrl.signal });
        if (timeRes.ok) {
            const timeTxt = (await timeRes.text()).trim();
            const formattedTime = timeTxt.replace(/[-T:]/g, '').split('+')[0];
            const dataRes = await fetch(`https://www.jma.go.jp/bosai/amedas/data/map/${formattedTime}.json`, { signal: amedasCtrl.signal });
            clearTimeout(amedasTimer);
            if (dataRes.ok) {
                const mapData = await dataRes.json();
                const nagoyaAmedas = mapData['51106'];
                if (nagoyaAmedas && nagoyaAmedas.temp && typeof nagoyaAmedas.temp[0] === 'number') {
                    result.temp = Math.round(nagoyaAmedas.temp[0]);
                }
            }
        }
    } catch (amedasErr) {
        // アメダス取得に失敗した場合はOpen-Meteoで現在気温を補完
        if (result.temp === estimatedTemp) {
            try {
                const omCtrl = new AbortController();
                const omTimer = setTimeout(() => omCtrl.abort(), 1500);
                const omRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.1815&longitude=136.9066&current=temperature_2m&timezone=Asia%2FTokyo', { signal: omCtrl.signal });
                clearTimeout(omTimer);
                if (omRes.ok) {
                    const omData = await omRes.json();
                    if (omData && omData.current && typeof omData.current.temperature_2m === 'number') {
                        result.temp = Math.round(omData.current.temperature_2m);
                    }
                }
            } catch (oe) { }
        }
    }

    _todayStylingWeatherCache = result;
    return result;
}

// ==========================================================================
// 【関数】getCurrentSeasonInfo(date = new Date())
// 【役割】現在の日時から「春・夏・秋・冬」の季節情報を判定する
// 【具体的な処理内容】
//   ・3〜5月は春、6〜8月は夏、9〜11月は秋、12〜2月は冬として季節ラベルを返します
// ==========================================================================
function getCurrentSeasonInfo(date = new Date()) {
    const month = date.getMonth() + 1; // 1〜12月
    if (month >= 3 && month <= 5) {
        return { key: 'spring', name: '春', sub: '春の陽気' };
    } else if (month >= 6 && month <= 8) {
        return { key: 'summer', name: '夏', sub: '初夏・真夏' };
    } else if (month >= 9 && month <= 11) {
        return { key: 'autumn', name: '秋', sub: '深まる秋' };
    } else {
        return { key: 'winter', name: '冬', sub: '冬の寒さ' };
    }
}

// ==========================================================================
//  月別（1月〜12月）・ブランド商品おすすめコーデデータ（すべて SAMPLE_PRODUCTS から選定）
// ==========================================================================
const MONTHLY_STYLING_PLANS = {
    1: {
        monthName: '1月',
        seasonName: '厳冬期',
        themeTitle: '真冬の寒さを乗り切るウォームレイヤード',
        MEN: {
            outerId: 4,  // バッファローチェックボアジップジャケット (¥10,000)
            topsId: 6,   // チャコール ブーク ニット (¥5,500)
            bottomsId: 10, // 2WAYデタッチャブルナイロンカーゴパンツ (¥6,800)
            leadText: '真冬の厳しい寒さに備え、防寒性とストリート感を兼ね備えた「バッファローチェックボアジップジャケット」に保温性の高いブークニットと機能的な2WAYナイロンカーゴパンツを合わせました。'
        },
        WOMEN: {
            outerId: 14, // グリッドパフジャケット (¥12,800)
            topsId: 17,  // シャギーニットオーバーサイズクルーネックセーター (¥5,900)
            bottomsId: 24, // タックイージーワイドスウェットパンツ (¥5,200)
            leadText: '凍える真冬の気候を暖かく包み込むボリューム感のある「グリッドパフジャケット」に、ふわふわなシャギーニットセーターとリラックスしたスウェットパンツを組み合わせた快適な防寒スタイルです。'
        }
    },
    2: {
        monthName: '2月',
        seasonName: '晩冬・早春',
        themeTitle: '春の気配を感じるシックなウィンタースタイル',
        MEN: {
            outerId: 3,  // シングルブレストフェイクレザージャケット (¥12,000)
            topsId: 8,   // アーバン ワイン ニット (¥5,800)
            bottomsId: 9, // ストレートレープセミフレアスラックス (¥5,800)
            leadText: 'まだ冷え込む2月もスタイリッシュに。上質な光沢感の「シングルブレストフェイクレザージャケット」に深みのあるワインニットと美しいセミフレアスラックスを効かせた洗練コーデです。'
        },
        WOMEN: {
            outerId: 13, // フリースジャケット (¥7,500)
            topsId: 18,  // ヘビーウェイトルーズクルーネックスウェット (¥4,800)
            bottomsId: 21, // ハイウエストワイドドレープタックトラウザー(インディゴデニム) (¥6,800)
            leadText: '軽くて暖かい「フリースジャケット」に肉厚なルーズクルーネックスウェットとシルエットの美しいインディゴデニムを合わせた抜け感のある旬カジュアルです。'
        }
    },
    3: {
        monthName: '3月',
        seasonName: '早春',
        themeTitle: '季節の変わり目を快適に繋ぐ春アウタースタイル',
        MEN: {
            outerId: 1,  // オーバードレープ ダブルトレンチコート (¥8,800)
            topsId: 5,   // アーバン グレイ ジップフーディ (¥2,500)
            bottomsId: 9, // ストレートレープセミフレアスラックス (¥5,800)
            leadText: '朝晩と日中の気温差が大きい3月に重宝する「オーバードレープ ダブルトレンチコート」に、着脱しやすいジップフーディとスラックスをレイヤードした大人の春スタイルです。'
        },
        WOMEN: {
            outerId: 15, // ボックスシルエットショートトレンチコート (¥8,500)
            topsId: 18,  // ヘビーウェイトルーズクルーネックスウェット (¥4,800)
            bottomsId: 22, // ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム) (¥6,800)
            leadText: '春の訪れを感じさせる軽快な「ボックスシルエットショートトレンチコート」に、スウェットと爽やかなライトインディゴデニムを合わせたスプリングスタイルです。'
        }
    },
    4: {
        monthName: '4月',
        seasonName: '春本番',
        themeTitle: '新生活や春の外出を彩るスマートカジュアル',
        MEN: {
            outerId: 2,  // リラックス ダブル ブレスト テーラードジャケット (¥8,000)
            topsId: 7,   // スカイ オックス フォードシャツ (¥4,800)
            bottomsId: 11, // スマートアンクルテーパードイージースラックス (¥5,200)
            leadText: '心地よい春風が吹く4月に最適な、端正な「リラックス ダブル ブレスト テーラードジャケット」と清潔感溢れるオックスフォードシャツ、アンクルスラックスの好印象コーデです。'
        },
        WOMEN: {
            outerId: 15, // ボックスシルエットショートトレンチコート (¥8,500)
            topsId: 19,  // ヴィンテージウォッシュフルジップパーカー (¥5,800)
            bottomsId: 22, // ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム) (¥6,800)
            leadText: '暖かな春の陽気にぴったりな「ボックスシルエットショートトレンチコート」にフルジップパーカーをインした、こなれ感漂う大人カジュアルです。'
        }
    },
    5: {
        monthName: '5月',
        seasonName: '初夏・新緑',
        themeTitle: '爽やかな初夏の風を楽しむ軽快シャツスタイル',
        MEN: {
            outerId: null,
            topsId: 7,   // スカイ オックス フォードシャツ (¥4,800)
            bottomsId: 9, // ストレートレープセミフレアスラックス (¥5,800)
            leadText: 'アウターなしで心地よく過ごせる5月。爽快なスカイブルーの「スカイ オックス フォードシャツ」を主役に、ドレープの美しいセミフレアスラックスを合わせました。'
        },
        WOMEN: {
            outerId: null,
            topsId: 19,  // ヴィンテージウォッシュフルジップパーカー (¥5,800)
            bottomsId: 23, // カモフラージュスーパーワイドバギーデニムパンツ (¥7,500)
            leadText: '日差しが心地よい初夏に、存在感ある「カモフラージュスーパーワイドバギーデニムパンツ」とヴィンテージパーカーを合わせたストリートライクな着こなしです。'
        }
    },
    6: {
        monthName: '6月',
        seasonName: '梅雨・初夏',
        themeTitle: '雨の日も快適に過ごすリラックスストリート',
        MEN: {
            outerId: null,
            topsId: 5,   // アーバン グレイ ジップフーディ (¥2,500)
            bottomsId: 11, // スマートアンクルテーパードイージースラックス (¥5,200)
            leadText: '湿気や朝晩の冷え込み・冷房対策にちょうどいい「アーバン グレイ ジップフーディ」に、足元を濡らしにくいアンクル丈スラックスを組み合わせました。'
        },
        WOMEN: {
            outerId: null,
            topsId: 20,  // ドット柄シアーヘンリーネッククロップドTシャツ (¥3,900)
            bottomsId: 22, // ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム) (¥6,800)
            leadText: 'ほんのり透け感のある「ドット柄シアーヘンリーネッククロップドTシャツ」でジメジメした梅雨時も涼やかに。涼感とトレンド感を両立させたコーデです。'
        }
    },
    7: {
        monthName: '7月',
        seasonName: '盛夏',
        themeTitle: '夏の暑さを爽やかに乗り切るサマースタイル',
        MEN: {
            outerId: null,
            topsId: 7,   // スカイ オックス フォードシャツ (¥4,800)
            bottomsId: 11, // スマートアンクルテーパードイージースラックス (¥5,200)
            leadText: '吸湿性と通気性に優れた薄手の「スカイ オックス フォードシャツ」を腕まくりして着こなす、暑い夏でも清潔感をキープできる都会派サマースタイルです。'
        },
        WOMEN: {
            outerId: null,
            topsId: 20,  // ドット柄シアーヘンリーネッククロップドTシャツ (¥3,900)
            bottomsId: 23, // カモフラージュスーパーワイドバギーデニムパンツ (¥7,500)
            leadText: 'トレンドの「ドット柄シアーヘンリーネッククロップドTシャツ」にワイドなバギーデニムを合わせ、真夏の太陽に映えるアクティブなストリート感を出しました。'
        }
    },
    8: {
        monthName: '8月',
        seasonName: '真夏',
        themeTitle: '猛暑日も涼しく快適なサマーホリデースタイル',
        MEN: {
            outerId: null,
            topsId: 7,   // スカイ オックス フォードシャツ (¥4,800)
            bottomsId: 10, // 2WAYデタッチャブルナイロンカーゴパンツ (¥6,800)
            leadText: '真夏の暑さでもサラリとした肌触りの「スカイ オックス フォードシャツ」に、軽量な「2WAYデタッチャブルナイロンカーゴパンツ」を合わせた機能的リゾートコーデです。'
        },
        WOMEN: {
            outerId: null,
            topsId: 20,  // ドット柄シアーヘンリーネッククロップドTシャツ (¥3,900)
            bottomsId: 24, // タックイージーワイドスウェットパンツ (¥5,200)
            leadText: '通気性抜群のシアーTシャツに、柔らかく開放的な「タックイージーワイドスウェットパンツ」をセレクトした真夏の休日リラックススタイルです。'
        }
    },
    9: {
        monthName: '9月',
        seasonName: '初秋',
        themeTitle: '秋の気配を取り入れるスイッチコーディネート',
        MEN: {
            outerId: null,
            topsId: 5,   // アーバン グレイ ジップフーディ (¥2,500)
            bottomsId: 12, // ビッグポケットパラシュートカーゴパンツ (¥6,000)
            leadText: '少しずつ秋風を感じる9月。重厚感のある「ビッグポケットパラシュートカーゴパンツ」にジップフーディを合わせた、季節の変わり目に最適なコーデです。'
        },
        WOMEN: {
            outerId: 16, // レザージャケット (¥9,200)
            topsId: 20,  // ドット柄シアーヘンリーネッククロップドTシャツ (¥3,900)
            bottomsId: 22, // ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム) (¥6,800)
            leadText: '涼感のあるシアーTシャツの上にさっと「レザージャケット」を羽織り、秋の先取りトレンドを表現したスマートコーデです。'
        }
    },
    10: {
        monthName: '10月',
        seasonName: '秋晴れ・中秋',
        themeTitle: '深まる秋を楽しむ大人のテーラード＆ニット',
        MEN: {
            outerId: 2,  // リラックス ダブル ブレスト テーラードジャケット (¥8,000)
            topsId: 8,   // アーバン ワイン ニット (¥5,800)
            bottomsId: 9, // ストレートレープセミフレアスラックス (¥5,800)
            leadText: '心地よい秋晴れが続く10月に、差し色の「アーバン ワイン ニット」と端正な「リラックス ダブル テーラードジャケット」を合わせた洗練のドレスカジュアルです。'
        },
        WOMEN: {
            outerId: 16, // レザージャケット (¥9,200)
            topsId: 18,  // ヘビーウェイトルーズクルーネックスウェット (¥4,800)
            bottomsId: 21, // ハイウエストワイドドレープタックトラウザー(インディゴデニム) (¥6,800)
            leadText: '秋の定番「レザージャケット」に肉厚なクルーネックスウェットと濃紺インディゴデニムを合わせ、シックで温かみのある大人の装いに仕上げました。'
        }
    },
    11: {
        monthName: '11月',
        seasonName: '深秋・晩秋',
        themeTitle: '晩秋の冷え込みに映えるブランド人気No.1スタイル',
        MEN: {
            outerId: 1,  // オーバードレープ ダブルトレンチコート (¥8,800)
            topsId: 8,   // アーバン ワイン ニット (¥5,800)
            bottomsId: 9, // ストレートレープセミフレアスラックス (¥5,800)
            leadText: '深まる秋の気候に合わせて、MANEKIN人気No.1の「オーバードレープ ダブルトレンチコート」に深みのあるワインニットと美しい落ち感のスラックスをセレクトしました。'
        },
        WOMEN: {
            outerId: 13, // フリースジャケット (¥7,500)
            topsId: 17,  // シャギーニットオーバーサイズクルーネックセーター (¥5,900)
            bottomsId: 21, // ハイウエストワイドドレープタックトラウザー(インディゴデニム) (¥6,800)
            leadText: '11月の冷たい風に寄り添うふんわり暖かい「フリースジャケット」に、トレンドのシャギーニットとシルエットの美しいインディゴデニムを合わせた親しみやすい旬スタイルです。'
        }
    },
    12: {
        monthName: '12月',
        seasonName: '初冬・冬本番',
        themeTitle: 'ホリデーシーズンを暖かく包むウィンタールック',
        MEN: {
            outerId: 4,  // バッファローチェックボアジップジャケット (¥10,000)
            topsId: 6,   // チャコール ブーク ニット (¥5,500)
            bottomsId: 10, // 2WAYデタッチャブルナイロンカーゴパンツ (¥6,800)
            leadText: '寒さが本格化する12月に、存在感のあるチェック柄「バッファローチェックボアジップジャケット」と防寒ニットを合わせた暖かく華やかな冬スタイルです。'
        },
        WOMEN: {
            outerId: 14, // グリッドパフジャケット (¥12,800)
            topsId: 18,  // ヘビーウェイトルーズクルーネックスウェット (¥4,800)
            bottomsId: 24, // タックイージーワイドスウェットパンツ (¥5,200)
            leadText: '真冬の冷気もしっかりシャットアウトする「グリッドパフジャケット」にスウェットを合わせた、冬の外出をアクティブに楽しむスタイルです。'
        }
    }
};

// ユーザーが手動選択したスタイリング提案の月（null の場合は現在の月を自動適用）
let _selectedStylingMonth = null;

// ==========================================================================
// 【関数】getMonthlyStylingPlan(month = null, gender = 'MEN')
// 【役割】月別（1月〜12月）のおすすめコーディネート提案データを取得する
// 【具体的な処理内容】
//   ・季節の気温にぴったりなおすすめブランド服の組み合わせプランを返します
// ==========================================================================
function getMonthlyStylingPlan(month = null, gender = 'MEN') {
    const currentRealMonth = new Date().getMonth() + 1;
    const m = (typeof month === 'number' && month >= 1 && month <= 12)
        ? month
        : (_selectedStylingMonth || currentRealMonth);
    const g = (gender === 'WOMEN') ? 'WOMEN' : 'MEN';
    const monthData = MONTHLY_STYLING_PLANS[m] || MONTHLY_STYLING_PLANS[11];
    const plan = monthData[g] || monthData.MEN;

    // 実在の SAMPLE_PRODUCTS から商品オブジェクトを取得
    const outerProd = plan.outerId ? SAMPLE_PRODUCTS.find(p => p.id === plan.outerId) : null;
    const topsProd = plan.topsId ? SAMPLE_PRODUCTS.find(p => p.id === plan.topsId) : null;
    const bottomsProd = plan.bottomsId ? SAMPLE_PRODUCTS.find(p => p.id === plan.bottomsId) : null;

    return {
        month: m,
        monthName: monthData.monthName,
        seasonName: monthData.seasonName,
        themeTitle: monthData.themeTitle,
        plan,
        isCurrentMonth: (m === currentRealMonth),
        prods: {
            outer: outerProd,
            tops: topsProd,
            bottoms: bottomsProd
        }
    };
}

// ==========================================================================
// 【関数】onSelectStylingMonth(monthVal)
// 【役割】AIスタイリングバナーで別の月を選んだときの処理
// 【具体的な処理内容】
//   ・選ばれた月のおすすめコーデ提案にバナーの表示を切り替えます
// ==========================================================================
function onSelectStylingMonth(monthVal) {
    const parsed = parseInt(monthVal, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
        _selectedStylingMonth = parsed;
    } else {
        _selectedStylingMonth = null;
    }
    // バナー再描画を実行
    updateTodaySeasonalStyling();
}
window.onSelectStylingMonth = onSelectStylingMonth;

// ==========================================================================
// 【関数】renderTodayStylingBanner(temp, weatherText, seasonInfo, gender, month, date, ...)
// 【役割】「TODAY'S AI STYLING」バナーを描画する
// 【具体的な処理内容】
//   ・気象庁の気温・天気、季節のアドバイス、おすすめアイテムをバナーに綺麗に表示します
// ==========================================================================
function renderTodayStylingBanner(temp, weatherText, seasonInfo, gender, month, date, locationName = '愛知・名古屋', tempMin = null, tempMax = null, provider = '気象庁(JMA)') {
    const badgeElem = document.getElementById('today-styling-badge');
    const titleElem = document.getElementById('today-styling-title');
    const descElem = document.getElementById('today-styling-desc');
    const btnElem = document.getElementById('btn-apply-today-styling');
    const selectElem = document.getElementById('today-styling-month-select');
    if (!titleElem || !descElem) return;

    // 月別（1月〜12月）のおすすめブランド商品プランを取得
    const targetMonth = _selectedStylingMonth || month;
    const stylingData = getMonthlyStylingPlan(targetMonth, gender);
    const { monthName, themeTitle, plan, prods, isCurrentMonth } = stylingData;

    // 月選択セレクターの選択状態を同期
    if (selectElem && selectElem.value !== String(targetMonth)) {
        selectElem.value = String(targetMonth);
    }

    const hasMinMax = (tempMin !== null && tempMax !== null);
    const minMaxLabel = hasMinMax ? `最低${tempMin}℃ / 最高${tempMax}℃ (現在${temp}℃)` : `気温${temp}℃`;

    if (badgeElem) {
        const monthBadgeLabel = isCurrentMonth ? `今月（${monthName}）のおすすめ` : `${monthName}のおすすめ`;
        badgeElem.innerHTML = `TODAY'S AI STYLING ・ <span>${monthBadgeLabel}（${month}月${date}日 ${locationName} ${minMaxLabel} / ${weatherText} 【${provider}】）</span>`;
    }

    // 見出しタイトル：月ごとのおすすめとして商品名を明示
    const mainItemTitle = prods.outer ? `「${prods.outer.name}」×「${prods.tops.name}」` : `「${prods.tops.name}」スタイル`;
    const headingMonthLabel = isCurrentMonth ? `今月（${monthName}）` : `${monthName}`;
    titleElem.textContent = `【${headingMonthLabel}のおすすめ】${themeTitle}・${mainItemTitle}`;

    // 「今月（○月）は商品の中からこのコーデがおすすめ！」の月全体としての情報を表示（日ごとの気温・寒暖差情報は除外）
    descElem.textContent = `今月（${monthName}）はブランド商品の中からこのコーデがおすすめ！${plan.leadText}`;

    if (btnElem) {
        btnElem.textContent = `${headingMonthLabel}のおすすめ商品コーデを試着する`;
    }
}

// ==========================================================================
// 【関数】updateTodaySeasonalStyling()
// 【役割】TODAY'S AI STYLING バナーの気温と提案テキストを最新状態に更新する
// 【具体的な処理内容】
//   ・気象庁から名古屋の最新気温を取得し、バナーを自動更新します
// ==========================================================================
async function updateTodaySeasonalStyling() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const seasonInfo = getCurrentSeasonInfo(now);
    const gender = 'MEN';

    // 1. まず即座に愛知の推定気温で仮描画（待たずに即時表示）
    const initialTemp = calculateEstimatedTemperature(now);
    renderTodayStylingBanner(initialTemp, '穏やか', seasonInfo, gender, month, date, '愛知・名古屋', Math.max(initialTemp - 5, 0), initialTemp + 4, '気象庁(JMA)推定');

    // 2. 非同期で気象庁（JMA）公式から名古屋の最低気温・最高気温・現在気温を取得してスムーズに更新
    try {
        const weather = await fetchCurrentTemperature();
        if (weather && weather.temp !== null) {
            renderTodayStylingBanner(
                weather.temp,
                weather.weatherText,
                seasonInfo,
                gender,
                month,
                date,
                weather.locationName || '愛知・名古屋',
                weather.tempMin,
                weather.tempMax,
                weather.provider || '気象庁(JMA)'
            );
        }
    } catch (e) {
        // エラー時は初期描画を維持
    }
}

// ==========================================================================
// 【関数】applyTodaySeasonalPresetLook()
// 【役割】AIスタイリングバナーの「このコーデを一括試着」を押したときの処理
// 【具体的な処理内容】
//   ・今月おすすめの季節コーディネート一式を、ワンクリックでマネキンに着せ替えます
// ==========================================================================
function applyTodaySeasonalPresetLook() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const gender = 'MEN';

    // 選択中の月（または現在の月）のブランド商品（SAMPLE_PRODUCTS）を取得
    const targetMonth = _selectedStylingMonth || month;
    const stylingData = getMonthlyStylingPlan(targetMonth, gender);
    const { monthName, prods, isCurrentMonth } = stylingData;

    const newOutfit = {
        hat: null,
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    };

    // アウター（商品カタログから選定）
    if (prods.outer) {
        newOutfit.outer = {
            id: prods.outer.id,
            name: prods.outer.name,
            category: prods.outer.category,
            color: (prods.outer.colors && prods.outer.colors[0]) || 'STANDARD',
            price: prods.outer.price,
            image: prods.outer.image,
            isOwned: false
        };
    }

    // トップス（商品カタログから選定）
    if (prods.tops) {
        newOutfit.tops = {
            id: prods.tops.id,
            name: prods.tops.name,
            category: prods.tops.category,
            color: (prods.tops.colors && prods.tops.colors[0]) || 'STANDARD',
            price: prods.tops.price,
            image: prods.tops.image,
            isOwned: false
        };
    }

    // ボトムス（商品カタログから選定）
    if (prods.bottoms) {
        newOutfit.bottoms = {
            id: prods.bottoms.id,
            name: prods.bottoms.name,
            category: prods.bottoms.category,
            color: (prods.bottoms.colors && prods.bottoms.colors[0]) || 'STANDARD',
            price: prods.bottoms.price,
            image: prods.bottoms.image,
            isOwned: false
        };
    }

    // シューズは商品カタログ外のためセットせず未着用のままにします（newOutfit.shoes = null）

    AppState.currentOutfit = newOutfit;
    syncStudioStateToBackend({ immediate: true });

    const mainName = prods.outer ? prods.outer.name : (prods.tops ? prods.tops.name : '');
    const toastMonthLabel = isCurrentMonth ? `今月（${monthName}）` : `${monthName}`;
    showToastNotification(`【${toastMonthLabel}おすすめ】ブランド商品「${mainName}」等の全身コーデをマネキンにセットしました！`);
    switchStudioTab('create');
}

// ==========================================================================
// 【関数】applyPresetLook(lookKey)
// 【役割】プリセットコーデを着用するための互換用関数
// 【具体的な処理内容】
//   ・指定されたコーデをマネキンに着用させます
// ==========================================================================
function applyPresetLook(lookKey) {
    applyTodaySeasonalPresetLook();
}


// 再代入可能な変数 _studioStateSyncTimer を宣言し、値（null）をセットします
let _studioStateSyncTimer = null;
// 再代入可能な変数 _studioStateSyncSeq を宣言し、値（0）をセットします
let _studioStateSyncSeq = 0;
// 再代入可能な変数 _lastStudioSyncErrorToastAt を宣言し、値（0）をセットします
let _lastStudioSyncErrorToastAt = 0;

// ==========================================================================
// 【関数】sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot)
// 【役割】マネキンの現在の着用服や位置調整データをサーバー（MySQL）へ送信する通信処理
// 【具体的な処理内容】
//   ・ページを閉じたり移動しても試着中の服が消えないよう、データベースに保存します
// ==========================================================================
async function sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot) {
    // 条件（typeof isServerUserId === 'function' && !isServerUse…）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof isServerUserId === 'function' && !isServerUserId(targetUserId)) {
        // 処理結果の基準値として false を呼び出し元へ返して関数を終了します
        return false;
    }
    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        if (typeof lsSetJson === 'function') {
            lsSetJson('manekin_ls_studio_' + targetUserId, {
                current_outfit: outfitSnapshot,
                fitting_offsets: offsetsSnapshot,
                studio_gender: genderSnapshot
            });
        }
        return true;
    }
    // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
    const apiBase = (typeof getApiBaseUrl === 'function')
        // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
        ? getApiBaseUrl()
        // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');
    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/studio-state/save）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/studio-state/save`, {
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
                // マネキンの全5部位着用状態オブジェクトを送信データにセットします
                current_outfit: outfitSnapshot,
                // 部位ごとの X/Y・拡大率・サイズ設定マップを送信データにセットします
                fitting_offsets: offsetsSnapshot,
                // 現在のマネキン性別設定（'MEN' / 'WOMEN'）をセットします
                studio_gender: genderSnapshot
            })
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('Studio state save failed');
        // 処理結果の基準値として true を呼び出し元へ返して関数を終了します
        return true;
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLスタジオ状態保存エラー:', e);
        // 定数 now を宣言し、値（Date.now()）をセットします
        const now = Date.now();
        // 条件（now - _lastStudioSyncErrorToastAt > 3000）が成り立つか判定し、該当する場合の処理を実行します
        if (now - _lastStudioSyncErrorToastAt > 3000) {
            // 変数・配列項目 _lastStudioSyncErrorToastAt の値を更新・計算します
            _lastStudioSyncErrorToastAt = now;
            // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
            showToastNotification('⚠️ スタジオ試着状態のMySQL保存に失敗しました（サーバー接続を確認してください）');
        }
        // 処理結果の基準値として false を呼び出し元へ返して関数を終了します
        return false;
    }
}

// ==========================================================================
// 【関数】flushPendingStudioStateSync()
// 【役割】保留中のマネキン保存処理があれば、タイマーを待たずに即時送信する
// 【具体的な処理内容】
//   ・ログアウトや画面移動の直前に、未保存の着せ替えデータを確実にMySQLへ保存完了させます
// ==========================================================================
function flushPendingStudioStateSync() {
    // 条件（!_studioStateSyncTimer）が成り立つか判定し、該当する場合の処理を実行します
    if (!_studioStateSyncTimer) return Promise.resolve(false);
    // 遅延実行タイマーのセットまたは重複防止用キャンセルを行います
    clearTimeout(_studioStateSyncTimer);
    // 変数・配列項目 _studioStateSyncTimer の値を更新・計算します
    _studioStateSyncTimer = null;

    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        // 結果（Promise.resolve(false)）を呼び出し元へ返却します
        return Promise.resolve(false);
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して outfitSnapshot に保存します
    const outfitSnapshot = JSON.parse(JSON.stringify(AppState.currentOutfit || { hat: null, outer: null, tops: null, bottoms: null, shoes: null }));
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して offsetsSnapshot に保存します
    const offsetsSnapshot = JSON.parse(JSON.stringify(AppState.fittingOffsets || getDefaultFittingOffsets()));
    // 定数 genderSnapshot を宣言し、値（'MEN'）をセットします
    const genderSnapshot = 'MEN';
    // 結果（sendStudioStateRequest(targetUserId, outfitSnaps…）を呼び出し元へ返却します
    return sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot);
}

// ==========================================================================
// 【関数】syncStudioStateToBackend(options = {})
// 【役割】マネキンの着せ替えやサイズ調整の連続操作を、少し待ってから自動保存する（デバウンス保存）
// 【具体的な処理内容】
//   ・スライダーを動かしている途中で通信がパンクしないよう、操作が止まってからサーバーへ保存します
// ==========================================================================
function syncStudioStateToBackend(options = {}) {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        // 結果（Promise.resolve(false)）を呼び出し元へ返却します
        return Promise.resolve(false);
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;
    // 定数 immediate を宣言し、値（!!options.immediate）をセットします
    const immediate = !!options.immediate;

    // 条件（_studioStateSyncTimer）が成り立つか判定し、該当する場合の処理を実行します
    if (_studioStateSyncTimer) {
        // 遅延実行タイマーのセットまたは重複防止用キャンセルを行います
        clearTimeout(_studioStateSyncTimer);
        // 変数・配列項目 _studioStateSyncTimer の値を更新・計算します
        _studioStateSyncTimer = null;
    }

    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して outfitSnapshot に保存します
    const outfitSnapshot = JSON.parse(JSON.stringify(AppState.currentOutfit || { hat: null, outer: null, tops: null, bottoms: null, shoes: null }));
    // 元配列・元オブジェクトへの参照切り離し（ディープコピー）を作成して offsetsSnapshot に保存します
    const offsetsSnapshot = JSON.parse(JSON.stringify(AppState.fittingOffsets || getDefaultFittingOffsets()));
    // 定数 genderSnapshot を宣言し、値（'MEN'）をセットします
    const genderSnapshot = 'MEN';
    // 定数 seq を宣言し、値（++_studioStateSyncSeq）をセットします
    const seq = ++_studioStateSyncSeq;

    // 条件（immediate）が成り立つか判定し、該当する場合の処理を実行します
    if (immediate) {
        // 結果（sendStudioStateRequest(targetUserId, outfitSnaps…）を呼び出し元へ返却します
        return sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot);
    }

    // 非同期完了を await で待てる Promise オブジェクトを作成して返します
    return new Promise((resolve) => {
        // 遅延実行タイマーのセットまたは重複防止用キャンセルを行います
        _studioStateSyncTimer = setTimeout(async () => {
            // 変数・配列項目 _studioStateSyncTimer の値を更新・計算します
            _studioStateSyncTimer = null;
            // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId) || seq !== _studioStateSyncSeq) {
                // 非同期 Promise を完了し、結果値（false）を呼び出し元へ返します
                resolve(false);
                // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
                return;
            }
            // 定数 ok を宣言し、値（await sendStudioStateRequest(targetUse…）をセットします
            const ok = await sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot);
            // 非同期 Promise を完了し、結果値（ok）を呼び出し元へ返します
            resolve(ok);
            // 上の処理を指定ミリ秒後（400ms 後）に実行するタイマー呼び出しを閉じます
        }, 400);
    });
}

// ==========================================================================
// 【関数】syncStudioStateFromBackend()
// 【役割】ログイン時やスタジオを開いた時に、前回試着していた服とサイズ設定を復元する
// 【具体的な処理内容】
//   ・サーバーから前回のマネキン状態を読み込み、着ていた服や位置の微調整をそのまま元通りに再現します
// ==========================================================================
async function syncStudioStateFromBackend() {
    // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
    if (!AppState.currentUser || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        // 条件を満たさないため、以降の処理を行わずここで関数を早期終了します
        return;
    }
    // 定数 targetUserId を宣言し、値（AppState.currentUser.id）をセットします
    const targetUserId = AppState.currentUser.id;

    if (typeof isMobileLocalStorageMode === 'function' && isMobileLocalStorageMode()) {
        const saved = (typeof lsGetJson === 'function') ? lsGetJson('manekin_ls_studio_' + targetUserId, null) : null;
        if (saved && typeof saved === 'object') {
            AppState.currentOutfit = saved.current_outfit || { hat: null, outer: null, tops: null, bottoms: null, shoes: null };
            AppState.fittingOffsets = saved.fitting_offsets || getDefaultFittingOffsets();
        } else {
            AppState.currentOutfit = { hat: null, outer: null, tops: null, bottoms: null, shoes: null };
            AppState.fittingOffsets = getDefaultFittingOffsets();
        }
        if (typeof renderMannequinStage === 'function') renderMannequinStage();
        if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        if (typeof updateAIStylingComment === 'function') updateAIStylingComment();
        return;
    }

    // 定数 fetchStartSeq を宣言し、値（_studioStateSyncSeq）をセットします
    const fetchStartSeq = _studioStateSyncSeq;
    // 定数 apiBase を宣言し、値（(typeof getApiBaseUrl === 'function')）をセットします
    const apiBase = (typeof getApiBaseUrl === 'function')
        // 三項演算子・真(True)の場合の選択値（getApiBaseUrl()）
        ? getApiBaseUrl()
        // 三項演算子・偽(False)の場合の選択値（((window.location.protocol === 'file:' || …）
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');

    // 通信失敗や処理エラーで画面が止まらないよう try ブロックで監視開始します
    try {
        // Flask バックエンド API（/api/studio-state/${targetUserId}）へ非同期リクエストを送信し、応答を待ち受けます
        const res = await fetch(`${apiBase}/api/studio-state/${targetUserId}`, {
            // Cookie（HttpOnly の manekin_session）を API リクエストに同梱送信する必須指定です
            credentials: 'include',
            // ブラウザが昔の通信結果をキャッシュ再利用しないよう 'no-store' を指定します
            cache: 'no-store'
        });
        // HTTP 応答ステータスがエラー（4xx / 5xx）だった場合に例外として異常ルートへ飛ばします
        if (!res.ok) throw new Error('Studio state fetch failed');
        // サーバーから届いた HTTP レスポンスボディを JSON オブジェクトとして読み取り data に入れます
        const data = await res.json();
        // まだログインしていない（またはサーバー発行会員IDでない）状態かを安全チェックします
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;
        // 条件（fetchStartSeq !== _studioStateSyncSeq）が成り立つか判定し、該当する場合の処理を実行します
        if (fetchStartSeq !== _studioStateSyncSeq) return;

        // 条件（data.exists && data.studio_state）が成り立つか判定し、該当する場合の処理を実行します
        if (data.exists && data.studio_state) {
            // アプリ全体状態 AppState.currentOutfit を最新値（data.studio_state.current_outfit || { …）に更新します
            AppState.currentOutfit = data.studio_state.current_outfit || { hat: null, outer: null, tops: null, bottoms: null, shoes: null };
            // アプリ全体状態 AppState.fittingOffsets を最新値（data.studio_state.fitting_offsets || g…）に更新します
            AppState.fittingOffsets = data.studio_state.fitting_offsets || getDefaultFittingOffsets();
            // 上記の if 条件に当てはまらなかった場合の分岐処理です
        } else {
            // アプリ全体状態 AppState.currentOutfit を最新値（{ hat: null, outer: null, tops: null, …）に更新します
            AppState.currentOutfit = { hat: null, outer: null, tops: null, bottoms: null, shoes: null };
            // アプリ全体状態 AppState.fittingOffsets を最新値（getDefaultFittingOffsets()）に更新します
            AppState.fittingOffsets = getDefaultFittingOffsets();
        }

        // 条件（typeof renderMannequinStage === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderMannequinStage === 'function') renderMannequinStage();
        // 条件（typeof renderStudioClosetList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
        // 条件（typeof renderStudioBrandList === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
        // 条件（typeof updateAIStylingComment === 'function'）が成り立つか判定し、該当する場合の処理を実行します
        if (typeof updateAIStylingComment === 'function') updateAIStylingComment();
        // try ブロック内で通信エラーや例外が発生したときに受け止めて安全に処理する catch ブロックです
    } catch (e) {
        // 開発者ツール(F12)のコンソールへデバッグ／エラーログを記録します
        console.warn('MySQLスタジオ状態取得エラー:', e);
    }
}

// ==========================================================================
// 【関数】getCategoryNameJP(cat)
// 【役割】英語のカテゴリ名（'HAT'、'TOPS'等）を日本語（'帽子'、'トップス'等）に変換する
// 【具体的な処理内容】
//   ・画面に分かりやすく表示するための翻訳ヘルパー関数です
// ==========================================================================
function getCategoryNameJP(cat) {
    // 値（cat)）に応じて処理ケースを分岐する switch 文を開始します
    switch (cat) {
        // 値が 'OUTER' 系だった場合、対応値 'アウター' を即返却します
        case 'OUTER': return 'アウター';
        // 値が 'TOPS' 系だった場合、対応値 'トップス' を即返却します
        case 'TOPS': return 'トップス';
        // 値が 'BOTTOMS' 系だった場合、対応値 'ボトムス' を即返却します
        case 'BOTTOMS': return 'ボトムス';
        // 値が 'SHOES' 系だった場合、対応値 '靴' を即返却します
        case 'SHOES': return '靴';
        // 値が 'HAT' 系だった場合、対応値 '帽子' を即返却します
        case 'HAT': case 'HATS': case 'CAP': return '帽子';
        // オブジェクトの 'default' プロパティ値を設定します
        default: return cat;
    }
}

// ==========================================================================
// 【関数】getColorHex(colorName)
// 【役割】英語のカラー名（'BLACK'、'NAVY'等）を16進カラーコード（#000000等）に変換する
// 【具体的な処理内容】
//   ・カラーパレットのドットや色見本を描画するための色コードを返します
// ==========================================================================
function getColorHex(colorName) {
    // 値（colorName)）に応じて処理ケースを分岐する switch 文を開始します
    switch (colorName) {
        // 値が 'BLACK' 系だった場合、対応値 '#111111' を即返却します
        case 'BLACK': return '#111111';
        // 値が 'WHITE' 系だった場合、対応値 '#ffffff' を即返却します
        case 'WHITE': return '#ffffff';
        // 値が 'CHARCOAL' 系だった場合、対応値 '#333333' を即返却します
        case 'CHARCOAL': return '#333333';
        // 値が 'GREY' 系だった場合、対応値 '#888888' を即返却します
        case 'GREY': case 'ASH GREY': case 'HEATHER GREY': return '#888888';
        // 値が 'NAVY' 系だった場合、対応値 '#1a2a44' を即返却します
        case 'NAVY': return '#1a2a44';
        // 値が 'BEIGE' 系だった場合、対応値 '#e8ddcb' を即返却します
        case 'BEIGE': case 'ECRU': return '#e8ddcb';
        // 値が 'BROWN' 系だった場合、対応値 '#593822' を即返却します
        case 'BROWN': case 'DARK BROWN': return '#593822';
        // 値が 'BLUE' 系だった場合、対応値 '#2b5876' を即返却します
        case 'BLUE': case 'VINTAGE BLUE': return '#2b5876';
        // オブジェクトの 'default' プロパティ値を設定します
        default: return '#666666';
    }
}

// ==========================================================================
// 【関数】showToastNotification(message)
// 【役割】スタジオ用のトースト通知を表示する補助関数
// 【具体的な処理内容】
//   ・画面右下に操作結果メッセージを通知します
// ==========================================================================
function showToastNotification(message) {
    // 条件（typeof showToast === 'function'）が成り立つか判定し、該当する場合の処理を実行します
    if (typeof showToast === 'function') {
        // 画面右下のトースト通知バナーで操作結果や案内メッセージをユーザーへ知らせます
        showToast(message);
    }
}


// 変数・配列項目 window.syncClosetFromBackend の値を更新・計算します
window.syncClosetFromBackend = syncClosetFromBackend;
// 変数・配列項目 window.syncOutfitsFromBackend の値を更新・計算します
window.syncOutfitsFromBackend = syncOutfitsFromBackend;
// メモリ上の最新変更をバックエンド API 経由で MySQL へ同期保存します
window.syncStudioStateToBackend = syncStudioStateToBackend;
// 変数・配列項目 window.syncStudioStateFromBacken… の値を更新・計算します
window.syncStudioStateFromBackend = syncStudioStateFromBackend;
// デバウンス待ち中の試着変更があれば先に MySQL へ確定送信してから後続処理へ進みます
window.flushPendingStudioStateSync = flushPendingStudioStateSync;
// 変数・配列項目 window.bumpClosetMutationSeq の値を更新・計算します
window.bumpClosetMutationSeq = bumpClosetMutationSeq;
window.updateTodaySeasonalStyling = updateTodaySeasonalStyling;
window.applyTodaySeasonalPresetLook = applyTodaySeasonalPresetLook;
