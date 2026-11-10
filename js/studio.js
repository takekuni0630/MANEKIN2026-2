// ==========================================================================
// MANEKIN FASHION - MANEKIN AI STUDIO（試着スタジオ）モジュール (studio.js)a
// ==========================================================================

// ==========================================================================
// 15. MANEKIN AI STUDIO（AIコーデシミュレーション機能）ロジック
// ==========================================================================

// クイック選択用プリセット画像マッピング（手持ち服登録モーダルの「サンプルから選ぶ」ボタンで使われるひな形辞書）
const PRESET_CLOSET_PRESETS = {
    // ↓ 1. 黒コットンキャップのプリセット定義
    'black_cap': {
        // ↓ 表示名
        name: 'クラシック コットンキャップ',
        // ↓ カテゴリコード（帽子）
        category: 'HAT',
        // ↓ カラー名
        color: 'BLACK',
        // ↓ 対応シーズン
        season: '通年',
        // ↓ 文字化けしないSVG Data URIとして埋め込まれた帽子イラスト画像
        image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22180%22%20text-anchor%3D%22middle%22%20fill%3D%22%23888888%22%20font-size%3D%2212%22%20font-family%3D%22sans-serif%22%20letter-spacing%3D%222%22%20font-weight%3D%22600%22%3ECLASSIC%20CAP%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    // ↓ 2. 黒スラックスのプリセット定義
    'black_pants': {
        // ↓ 表示名
        name: '黒ワイドスラックス',
        // ↓ カテゴリコード（ボトムス）
        category: 'BOTTOMS',
        // ↓ カラー名
        color: 'BLACK',
        // ↓ 対応シーズン
        season: '通年',
        // ↓ 画像パス
        image: 'assets/images/men/ストレートレープセミフレアスラックス.png'
    },
    // ↓ 3. 白レザースニーカーのプリセット定義
    'white_sneakers': {
        // ↓ 表示名
        name: '白レザースニーカー',
        // ↓ カテゴリコード（靴）
        category: 'SHOES',
        // ↓ カラー名
        color: 'WHITE',
        // ↓ 対応シーズン
        season: '通年',
        // ↓ SVG Data URIとして埋め込まれたスニーカーイラスト画像
        image: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22300%22%20height%3D%22300%22%2F%3E%3Cpath%20d%3D%22M40%20200%20C40%20170%2090%20150%20140%20150%20C170%20150%20200%20130%20230%20140%20C260%20150%20270%20180%20270%20210%20L40%20210%20Z%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%23111111%22%20stroke-width%3D%226%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M40%20210%20L270%20210%20L270%20230%20C270%20235%20265%20240%20260%20240%20L50%20240%20C45%20240%2040%20235%2040%20230%20Z%22%20fill%3D%22%23e5e7eb%22%20stroke%3D%22%23111111%22%20stroke-width%3D%226%22%2F%3E%3Cpath%20d%3D%22M150%20150%20L180%20170%20M170%20150%20L200%20170%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22270%22%20text-anchor%3D%22middle%22%20fill%3D%22%236b7280%22%20font-size%3D%2214%22%20font-family%3D%22sans-serif%22%20letter-spacing%3D%221%22%3ESNEAKERS%3C%2Ftext%3E%3C%2Fsvg%3E'
    },
    // ↓ 4. グレーパーカーのプリセット定義
    'grey_hoodie': {
        // ↓ 表示名
        name: 'ヘビーウェイト グレーパーカー',
        // ↓ カテゴリコード（トップス）
        category: 'TOPS',
        // ↓ カラー名
        color: 'GREY',
        // ↓ 対応シーズン
        season: '秋冬',
        // ↓ 画像パス
        image: 'assets/images/men/アーバングレイジップフーディ.png'
    },
    // ↓ 5. 白Tシャツ（シャツ代用）のプリセット定義
    'white_tshirt': {
        // ↓ 表示名
        name: 'プレミアム リラックス 白Tシャツ',
        // ↓ カテゴリコード（トップス）
        category: 'TOPS',
        // ↓ カラー名
        color: 'WHITE',
        // ↓ 対応シーズン
        season: '春夏',
        // ↓ 画像パス
        image: 'assets/images/men/スカイオックスフォードシャツ.png'
    },
    // ↓ 6. デニムジャケット（テーラード代用）のプリセット定義
    'denim_jacket': {
        // ↓ 表示名
        name: 'オーバーサイズ デニムジャケット',
        // ↓ カテゴリコード（アウター）
        category: 'OUTER',
        // ↓ カラー名
        color: 'BLUE',
        // ↓ 対応シーズン
        season: '春秋',
        // ↓ 画像パス
        image: 'assets/images/men/リラックスダブルブレストテーラードジャケット.png'
    }
};

// ↓ モーダル内で現在プレビュー中の画像データ（AI背景透過後または元画像）を保持する変数
let currentClosetUploadDataUrl = '';
// ↓ 「元画像に戻す」トグル用に透過処理前のオリジナルData URLを保持する変数
let originalClosetUploadDataUrl = '';
// ↓ 現在表示中のアップロード画像が背景透過済みかどうかの状態フラグ
let isCurrentUploadTransparent = false;

/**
 * スタジオ内のサブタブ切り替え
 */
// ↓ スタジオ上部ナビの「ホーム／マイクローゼット／お気に入り／試着スタジオ／保存コーデ／プロフィール」を切り替える関数
function switchStudioTab(tabKey) {
    // ↓ 現在選択中のタブ名を全体状態へ記録
    AppState.studioActiveTab = tabKey;

    // タブボタンのアクティブ更新（一致するタブにだけactiveクラスを付けます）
    document.querySelectorAll('.studio-tab-btn').forEach(btn => {
        // ↓ data-studio-tab属性の値と引数が同じならtrue、違えばfalse
        btn.classList.toggle('active', btn.getAttribute('data-studio-tab') === tabKey);
    });

    // パネルのアクティブ更新：まず全パネルのactiveを外して隠します
    document.querySelectorAll('.studio-pane').forEach(pane => {
        // ↓ 非表示に戻す
        pane.classList.remove('active');
    });
    // ↓ 目的のペイン要素を取得（例: studio-pane-create）
    const targetPane = document.getElementById(`studio-pane-${tabKey}`);
    // ↓ 見つかったらactiveを付けて表示します
    if (targetPane) {
        // ↓ 表示状態にする
        targetPane.classList.add('active');
    }

    // ↓ 新しく開いたタブの中身を描画します
    renderManekinStudio(tabKey);
}

/**
 * MANEKIN AI STUDIOの全般描画
 */
// ↓ スタジオ画面共通のユーザー名・件数バッジ更新＋開いているタブ専用の描画処理を呼び出す関数
function renderManekinStudio(activeTab = 'create') {
    // ユーザー名反映（スタジオヘッダーのユーザーチップ＋プロフィール画面の両方）
    const userNameElem = document.getElementById('studio-user-name');
    // ↓ アバター丸文字要素
    const avatarCharElem = document.getElementById('studio-avatar-char');
    // ↓ ランクバッジ要素
    const userRankElem = document.getElementById('studio-user-rank');
    // ↓ ログイン済みユーザーがいる場合
    if (AppState.currentUser) {
        // ↓ 会員名を表示
        if (userNameElem) userNameElem.textContent = AppState.currentUser.name || '会員 様';
        // ↓ 名前の先頭1文字を丸アイコンに表示
        if (avatarCharElem) avatarCharElem.textContent = (AppState.currentUser.name || 'M').charAt(0);
        // ↓ 会員ランク表示
        if (userRankElem) userRankElem.textContent = AppState.currentUser.rank || 'MEMBER';
    // ↓ 未ログインのゲスト状態の場合
    } else {
        // ↓ ゲスト様と表示
        if (userNameElem) userNameElem.textContent = 'ゲスト 様';
        // ↓ Gアイコンを表示
        if (avatarCharElem) avatarCharElem.textContent = 'G';
        // ↓ GUESTと表示
        if (userRankElem) userRankElem.textContent = 'GUEST';
    }

    // バッジ件数更新（手持ち服・お気に入り・保存済みコーデの数値をリアルタイム反映）
    const closetBadge = document.getElementById('studio-closet-badge');
    // ↓ クローゼット総数を反映
    if (closetBadge) closetBadge.textContent = AppState.myCloset.length;

    // ↓ お気に入り件数バッジ
    const favBadge = document.getElementById('studio-fav-badge');
    // ↓ お気に入り配列の長さをセット
    if (favBadge) favBadge.textContent = AppState.favorites.length;

    // ↓ 保存コーデ件数バッジ
    const savedBadge = document.getElementById('studio-saved-badge');
    // ↓ 保存済み配列の長さをセット
    if (savedBadge) savedBadge.textContent = AppState.savedOutfits.length;

    // ↓ スマホ切替タブ内の手持ち服数バッジ
    const mobClosetCnt = document.getElementById('mob-closet-cnt');
    // ↓ 長さを反映
    if (mobClosetCnt) mobClosetCnt.textContent = AppState.myCloset.length;

    // ↓ スマホ切替タブ内のブランドお気に入り数バッジ
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');
    // ↓ 長さを反映
    if (mobBrandFavCnt) mobBrandFavCnt.textContent = AppState.favorites.length;

    // ホームサマリーの数値（スタジオホーム画面の上部3枚カード）
    const homeCloset = document.getElementById('home-stat-closet');
    // ↓ 「〇〇 点」をHTML挿入
    if (homeCloset) homeCloset.innerHTML = `${AppState.myCloset.length} <small>点</small>`;

    // ↓ 保存コーデ数カード
    const homeSaved = document.getElementById('home-stat-saved');
    // ↓ 「〇〇 組」をHTML挿入
    if (homeSaved) homeSaved.innerHTML = `${AppState.savedOutfits.length} <small>組</small>`;

    // ↓ お気に入りブランド数カード
    const homeFav = document.getElementById('home-stat-fav');
    // ↓ 「〇〇 点」をHTML挿入
    if (homeFav) homeFav.innerHTML = `${AppState.favorites.length} <small>点</small>`;

    // プロフィール情報反映（ペイン6のアカウントカード用）
    const profName = document.getElementById('prof-display-name');
    // ↓ メール表示欄
    const profEmail = document.getElementById('prof-display-email');
    // ↓ ランク表示欄
    const profRank = document.getElementById('prof-display-rank');
    // ↓ ログイン中ならアカウント情報を表示
    if (AppState.currentUser) {
        // ↓ 氏名
        if (profName) profName.textContent = AppState.currentUser.name || '会員 様';
        // ↓ メールアドレス
        if (profEmail) profEmail.textContent = AppState.currentUser.email || '';
        // ↓ ランク名
        if (profRank) profRank.textContent = AppState.currentUser.rank || 'REGULAR MEMBER';
    // ↓ 未ログインならゲスト案内を表示
    } else {
        // ↓ ゲスト表記
        if (profName) profName.textContent = 'ゲスト 様';
        // ↓ 要ログイン案内
        if (profEmail) profEmail.textContent = '未ログイン（ログインが必要です）';
        // ↓ ランク表記
        if (profRank) profRank.textContent = 'GUEST';
    }

    // 性別ボタンUIの同期（MEN / WOMEN切り替えトグルのアクティブ状態を最新化）
    syncGenderToggleUI();

    // 各タブごとの描画（開いているペインだけを再構築して無駄な処理を省きます）
    switch (activeTab) {
        // ↓ ホームペインは静的HTML＋上記数値更新のみ
        case 'home':
            break;
        // ↓ クローゼット一覧ペイン
        case 'closet':
            // ↓ グリッドを描画
            renderPaneClosetGrid();
            break;
        // ↓ お気に入りブランドペイン
        case 'favorites':
            // ↓ お気に入りグリッドを描画
            renderStudioFavoritesGrid();
            break;
        // ↓ メインの試着スタジオペイン（左リスト・中央マネキン・右リスト・AI診断）
        case 'create':
            // ↓ 左カラムの手持ち服リスト描画
            renderStudioClosetList();
            // ↓ 右カラムのお気に入りブランド服リスト描画
            renderStudioBrandList();
            // ↓ 中央マネキンと5層レイヤー描画
            renderMannequinStage();
            // ↓ AIスタイリスト診断カードを更新
            updateAIStylingComment();
            break;
        // ↓ 保存済みコーデ一覧ペイン
        case 'saved':
            // ↓ コーデギャラリーを描画
            renderSavedOutfitsGrid();
            break;
        // ↓ プロフィールペイン
        case 'profile':
            break;
    }
}

// 販売商品向け5段階サイズ定義（左からXS、S、M、L、XLの順番でスライダー値0〜4に対応）
const BRAND_SIZE_LIST = ['XS', 'S', 'M', 'L', 'XL'];
// ↓ 各サイズ表記に対応するマネキン上の拡大率(%)マッピング辞書（M=100%を基準に±6%ずつ変化）
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
// ↓ ペイン2の大きいカード一覧として登録済み手持ち服を描画する関数
function renderPaneClosetGrid() {
    // ↓ グリッド枠を取得
    const grid = document.getElementById('closet-items-grid');
    // ↓ 無ければ終了
    if (!grid) return;

    // ↓ 現在選択中のカテゴリフィルター（ALL/TOPS等）を取得
    const filter = AppState.studioClosetFilter || 'ALL';
    // ↓ ALLなら全件、特定カテゴリなら一致する手持ち服のみ抽出
    const items = (filter === 'ALL')
        ? AppState.myCloset
        : AppState.myCloset.filter(item => item.category === filter);

    // ↓ 該当アイテムが0件のときは登録ボタン付きエンプティカードを表示
    if (items.length === 0) {
        // ↓ 空状態カードHTMLを挿入
        grid.innerHTML = `
            <div class="closet-empty-card">
                <div class="closet-empty-icon">🧥</div>
                <h3 class="closet-empty-title">まだ手持ちの服が登録されていません</h3>
                <p class="closet-empty-desc">お気に入りの服やよく着る服を登録すると、ブランド商品とのコーディネートを試着できます。</p>
                <button class="btn btn-primary" onclick="openAddClosetModal()">+ 手持ちの服を登録する</button>
            </div>
        `;
        // ↓ 終了
        return;
    }

    // ↓ 手持ち服それぞれをカードHTMLへ変換して連結描画
    grid.innerHTML = items.map(item => {
        // ↓ 現在マネキンが試着中かどうかを判定
        const isWearing = isItemWearing(item);
        // ↓ カラー名から表示用ドット色コード(#HEX)を取得
        const colorHex = getColorHex(item.color);

        // ↓ カード1枚分のHTMLテンプレートを返却
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
// ↓ 試着画面の左パネルに表示されるコンパクトな手持ち服リストを描画する関数
function renderStudioClosetList() {
    // ↓ 左パネルのリストコンテナを取得
    const list = document.getElementById('studio-closet-list');
    // ↓ 無ければ終了
    if (!list) return;

    // ↓ カテゴリフィルターを取得
    const filter = AppState.studioClosetFilter || 'ALL';
    // ↓ フィルタリング後のリストを生成
    const items = (filter === 'ALL')
        ? AppState.myCloset
        : AppState.myCloset.filter(item => item.category === filter);

    // ↓ 0件時は簡易登録ボタンを表示
    if (items.length === 0) {
        // ↓ 空メッセージHTMLを挿入
        list.innerHTML = `
            <div style="text-align: center; padding: 30px 10px; color: var(--color-gray-medium);">
                <p style="font-size: 0.85rem; margin-bottom: 12px;">該当する手持ち服がありません</p>
                <button class="btn btn-outline-xs" onclick="openAddClosetModal()">+ 手持ち服を登録</button>
            </div>
        `;
        // ↓ 終了
        return;
    }

    // ↓ クリックで試着、ドラッグ&ドロップにも対応(draggable="true")させたコンパクトカードを描画
    list.innerHTML = items.map(item => {
        // ↓ 着用中チェック
        const isWearing = isItemWearing(item);
        // ↓ カラーコード取得
        const colorHex = getColorHex(item.color);
        // ↓ 画像読み込みエラー時の代用SVGパス取得
        const fallback = getCategoryFallbackImage(item.category);

        // ↓ リスト項目カードHTMLを返却
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

// ↓ マイクローゼット画面（ペイン2）上のカテゴリチップが押されたときの絞り込み関数
function handlePaneClosetFilter(cat) {
    // ↓ 選択カテゴリを保存
    AppState.studioClosetFilter = cat;
    // ↓ 押されたチップにだけactiveクラスを付与
    document.querySelectorAll('#pane-closet-filter-bar .filter-pill').forEach(btn => {
        // ↓ data-cat属性と一致するか判定
        btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    // ↓ グリッドを再描画
    renderPaneClosetGrid();
}

// ↓ 試着スタジオ画面（ペイン4）左カラムのミニカテゴリチップが押されたときの絞り込み関数
function handleStudioClosetFilter(cat) {
    // ↓ 選択カテゴリを保存
    AppState.studioClosetFilter = cat;
    // ↓ ミニチップのactive状態を切り替え
    document.querySelectorAll('#col-closet-filter .mini-chip').forEach(btn => {
        // ↓ data-catと一致するか判定
        btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
    });
    // ↓ 左リストを再描画
    renderStudioClosetList();
}

// --------------------------------------------------------------------------
// 15.2 ブランド商品（右カラム & お気に入り）の描画
// --------------------------------------------------------------------------

/**
 * スタジオ内（右カラム）のブランド商品リスト描画（お気に入りに登録された服のみ表示）
 */
// ↓ 試着画面の右パネルにお気に入り登録済みのブランド商品リストを描画する関数
function renderStudioBrandList() {
    // ↓ 右リストコンテナを取得
    const list = document.getElementById('studio-brand-list');
    // ↓ 無ければ終了
    if (!list) return;

    // ↓ カテゴリフィルターとマネキン性別を取得
    const filter = AppState.studioBrandFilter || 'ALL';
    // ↓ MENまたはWOMENを取得
    const gender = AppState.studioGender || 'MEN';

    // お気に入りに登録されているブランド商品のみを抽出
    const favIds = Array.isArray(AppState.favorites) ? AppState.favorites : [];
    // ↓ 全ブランド商品からお気に入りID配列に含まれるものだけ抽出
    const allFavProducts = SAMPLE_PRODUCTS.filter(p => favIds.includes(p.id));

    // モバイル用タブのカウント更新
    const mobBrandFavCnt = document.getElementById('mob-brand-fav-cnt');
    // ↓ 要素があればお気に入り件数を反映
    if (mobBrandFavCnt) {
        // ↓ 数値文字列を設定
        mobBrandFavCnt.textContent = allFavProducts.length;
    }

    // 性別によるフィルタリング（MEN / WOMEN）
    let products = allFavProducts.filter(p => !p.gender || p.gender === gender);
    // ↓ カテゴリ指定があればさらに絞り込み
    if (filter !== 'ALL') {
        // ↓ 指定カテゴリと一致する商品だけに絞る
        products = products.filter(p => p.category === filter);
    }

    // お気に入りアイテムが1件も登録されていない場合は案内画面を表示
    if (allFavProducts.length === 0) {
        // ↓ 商品一覧への誘導HTMLを挿入
        list.innerHTML = `
            <div style="text-align: center; padding: 40px 16px; color: var(--color-gray-medium);">
                <div style="font-size: 2rem; margin-bottom: 8px; color: var(--color-accent); opacity: 0.85;">♥</div>
                <p style="font-size: 0.88rem; font-weight: 600; color: var(--color-black); margin-bottom: 6px;">お気に入りの服がありません</p>
                <p style="font-size: 0.78rem; line-height: 1.5; margin-bottom: 14px;">商品一覧でハート（♥）を押してお気に入り登録すると、ここに表示されてマネキンに試着できます。</p>
                <a href="#items" class="btn btn-outline-xs" style="display: inline-block; padding: 6px 16px; font-size: 0.75rem;">商品一覧を見に行く</a>
            </div>
        `;
        // ↓ 終了
        return;
    }

    // お気に入りは登録されているが、現在の性別やカテゴリフィルターに合致しない場合
    if (products.length === 0) {
        // ↓ 別カテゴリや別性別(MEN/WOMEN切替)を促す案内HTMLを挿入
        list.innerHTML = `
            <div style="text-align: center; padding: 36px 12px; color: var(--color-gray-medium);">
                <p style="font-size: 0.85rem; font-weight: 600; color: var(--color-dark); margin-bottom: 6px;">該当するお気に入りアイテムがありません</p>
                <p style="font-size: 0.75rem; color: var(--color-gray-medium); line-height: 1.4;">他のカテゴリまたはマネキンの性別（${gender === 'MEN' ? 'WOMEN' : 'MEN'}）をお試しください。</p>
            </div>
        `;
        // ↓ 終了
        return;
    }

    // ↓ 条件に合うお気に入り商品をドラッグ&クリック試着可能なカードとして描画
    list.innerHTML = products.map(product => {
        // ↓ マネキン着用中判定
        const isWearing = isItemWearing(product);
        // ↓ 画像エラー時の代用SVG取得
        const fallback = getCategoryFallbackImage(product.category);

        // ↓ 右リスト用ブランドカードHTMLを返却（isCloset=falseを指定）
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

// ↓ 試着スタジオ右カラムのカテゴリフィルター切り替え関数
function handleStudioBrandFilter(cat) {
    // ↓ フィルター値を更新
    AppState.studioBrandFilter = cat;
    // ↓ ボタンのアクティブ表示を同期
    document.querySelectorAll('#col-brand-filter .mini-chip').forEach(btn => {
        // ↓ data-brand-cat属性と一致するか判定
        btn.classList.toggle('active', btn.getAttribute('data-brand-cat') === cat);
    });
    // ↓ 右リストを再描画
    renderStudioBrandList();
}

// ↓ 「お気に入りのみ表示」チェックボックス用ハンドラ
function toggleBrandFavFilter(chk) {
    // ↓ チェック状態を保存
    AppState.studioBrandFavOnly = chk.checked;
    // ↓ 右リストを再描画
    renderStudioBrandList();
}

/**
 * パネル3（お気に入りブランド商品）の描画
 */
// ↓ スタジオのタブ3「お気に入りアイテム」画面にハート登録済みの全ブランド商品を並べて描画する関数
function renderStudioFavoritesGrid() {
    // ↓ お気に入りグリッド容器を取得
    const grid = document.getElementById('studio-fav-grid');
    // ↓ 要素がなければ終了
    if (!grid) return;

    // ↓ 全ブランド商品の中から、AppState.favoritesにお気に入りIDが含まれる商品だけを抽出
    const favProducts = SAMPLE_PRODUCTS.filter(p => AppState.favorites.includes(p.id));

    // ↓ お気に入りが1件もない場合は案内カードを表示して終了
    if (favProducts.length === 0) {
        // ↓ 空案内HTMLをセット
        grid.innerHTML = `
            <div class="closet-empty-card" >
                <div class="closet-empty-icon">♥</div>
                <h3 class="closet-empty-title">お気に入りに登録されたアイテムはありません</h3>
                <p class="closet-empty-desc">商品一覧でお気に入り（ハート）を登録すると、ここに一覧表示されワンクリックでマネキンに着せ替えることができます。</p>
                <a href="#items" class="btn btn-primary">商品コレクションを見る</a>
            </div>
            `;
        // ↓ 終了
        return;
    }

    // ↓ お気に入り商品をカードHTML配列に変換し、クリックで即試着＋スタジオタブ移動できるようにします
    grid.innerHTML = favProducts.map(product => {
        // ↓ 現在マネキンが試着中かどうか判定
        const isWearing = isItemWearing(product);
        // ↓ カードHTMLを返却
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
// ↓ 指定アイテムが現在マネキンの5部位スロット(hat/outer/tops/bottoms/shoes)のどこかに着用中か判定する関数
function isItemWearing(item) {
    // ↓ 現在の試着状態を保持するオブジェクトを取得
    const outfit = AppState.currentOutfit;
    // ↓ 状態が存在しなければfalse(未着用)
    if (!outfit) return false;
    // ↓ 全スロットキーを1つずつ確認
    for (const slotKey in outfit) {
        // ↓ その部位に着ている服を取り出し
        const worn = outfit[slotKey];
        // ↓ ID文字列が一致すれば現在着用中と判定してtrueを返します
        if (worn && String(worn.id) === String(item.id)) {
            // ↓ 着用中
            return true;
        }
    }
    // ↓ 全スロットで見つからなければfalse
    return false;
}

/**
 * 試着トグル（着用 / 脱がす）
 */
// ↓ 服カードをクリックまたはドロップしたとき「着ていなければ着せる／すでに着ていれば脱がす」切り替え関数
function toggleWearItem(itemId, isOwned) {
    // ↓ クリックされた服オブジェクトを探索して入れる変数
    let targetItem = null;
    // ↓ 手持ち服(isOwned=true)ならmyClosetから、ブランド商品(false)ならSAMPLE_PRODUCTSから検索
    if (isOwned) {
        // ↓ 手持ち服配列からID一致を検索
        targetItem = AppState.myCloset.find(c => String(c.id) === String(itemId));
    } else {
        // ↓ ブランド商品配列から数値ID一致を検索
        targetItem = SAMPLE_PRODUCTS.find(p => p.id === parseInt(itemId, 10));
    }

    // ↓ 対象が見つからなければ終了
    if (!targetItem) return;

    // ↓ カテゴリ名（TOPS等）をマネキン部位スロットキー（'tops'等）へ変換
    const slotKey = getSlotKeyByCategory(targetItem.category);
    // ↓ 不明なスロットなら終了
    if (!slotKey) return;

    // ↓ いまその部位に着ている服を取得
    const currentWorn = AppState.currentOutfit[slotKey];
    // ↓ 同じアイテムをすでに着ている場合は「脱がせる」動作にします
    if (currentWorn && String(currentWorn.id) === String(targetItem.id)) {
        // すでに着用中なら脱がす（nullにクリア）
        AppState.currentOutfit[slotKey] = null;
        // ↓ 解除トースト通知
        showToastNotification(`「${targetItem.name}」を外しました`);
    // ↓ 違う服または空のスロットなら「試着させる」動作にします
    } else {
        // スロットに着用情報をセット（後から手持ち/ブランド区別できるようisOwnedも記録）
        AppState.currentOutfit[slotKey] = {
            // ↓ アイテムID
            id: targetItem.id,
            // ↓ アイテム名
            name: targetItem.name,
            // ↓ カテゴリ
            category: targetItem.category,
            // ↓ 代表カラー（設定がなければ色配列先頭またはBLACK）
            color: targetItem.color || (targetItem.colors ? targetItem.colors[0] : 'BLACK'),
            // ↓ ブランド価格（手持ち服は0）
            price: targetItem.price || 0,
            // ↓ 画像URL
            image: targetItem.image,
            // ↓ 真偽値に統一した手持ち服フラグ
            isOwned: !!isOwned
        };
        // ↓ 試着通知を表示
        showToastNotification(`「${targetItem.name}」をマネキンに試着しました`);
        // ↓ 微調整パネルでいま着た部位がすぐいじれるよう選択部位も自動で切り替えます
        AppState.activeAdjustSlot = slotKey;
    }

    // ↓ 現在のコーデをアカウント専用localStorageへ保存
    saveScopedData('manekin_current_outfit', AppState.currentOutfit);
    // ↓ デバウンスなしで即座にMySQLサーバー側にも保存します
    syncStudioStateToBackend({ immediate: true });

    // UI更新（ステージ・左リスト・右リスト・AI診断を一斉再描画）
    renderMannequinStage();
    // ↓ 左の手持ち服リスト更新
    renderStudioClosetList();
    // ↓ 右のブランド服リスト更新
    renderStudioBrandList();
    // ↓ 下部のAIスタイリストアドバイスを再生成
    updateAIStylingComment();
}

/**
 * カテゴリをスロットキーにマッピング
 */
// ↓ 大文字カテゴリ名('OUTER','TOPS'等)から小文字スロットキー('outer','tops'等)へ変換する関数
function getSlotKeyByCategory(category) {
    // ↓ カテゴリごとに部位名を割り振り
    switch (category) {
        // ↓ アウター部位
        case 'OUTER': return 'outer';
        // ↓ トップス部位
        case 'TOPS': return 'tops';
        // ↓ ボトムス部位
        case 'BOTTOMS': return 'bottoms';
        // ↓ 靴部位
        case 'SHOES': return 'shoes';
        // ↓ 帽子各種表記をまとめて 'hat' に正規化
        case 'HAT': case 'HATS': case 'CAP': return 'hat';
        // ↓ 該当しない場合の保険としてtopsへ割り当て
        default: return 'tops';
    }
}

/**
 * スロットの服を脱がせる
 */
// ↓ 着用中タグの「×」ボタンやマネキンクリックで指定1部位だけ脱がす関数
function unwearSlot(slotKey) {
    // ↓ その部位に服が着せられていれば実行
    if (AppState.currentOutfit[slotKey]) {
        // ↓ 通知用に服の名前を覚えておきます
        const name = AppState.currentOutfit[slotKey].name;
        // ↓ スロットをnullにして脱がします
        AppState.currentOutfit[slotKey] = null;
        // ↓ localStorage保存
        saveScopedData('manekin_current_outfit', AppState.currentOutfit);
        // ↓ MySQLへ即時保存
        syncStudioStateToBackend({ immediate: true });
        // ↓ 解除メッセージ表示
        showToastNotification(`「${name}」を外しました`);

        // ↓ マネキン・左右リスト・AI診断を再描画
        renderMannequinStage();
        // ↓ 左リスト更新
        renderStudioClosetList();
        // ↓ 右リスト更新
        renderStudioBrandList();
        // ↓ AIコメント更新
        updateAIStylingComment();
    }
}

/**
 * 全身クリア（すべての服を脱がす）
 */
// ↓ マネキンに着せている全5部位のアイテムを一括リセットする関数（silent=trueなら通知を出さない）
function resetMannequinOutfit(silent = false) {
    // ↓ 全スロットをnullに戻した新オブジェクトで上書き
    AppState.currentOutfit = {
        hat: null,
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    };
    // ↓ ローカル保存
    saveScopedData('manekin_current_outfit', AppState.currentOutfit);
    // ↓ MySQL即時同期
    syncStudioStateToBackend({ immediate: true });
    // ↓ サイレントモードでなければクリア通知を表示
    if (!silent) {
        // ↓ トースト通知
        showToastNotification('マネキンの着用服をすべてクリアしました');
    }

    // ↓ ステージ・左右リスト・AIアドバイスをすべて初期化反映
    renderMannequinStage();
    // ↓ 左リスト
    renderStudioClosetList();
    // ↓ 右リスト
    renderStudioBrandList();
    // ↓ AIアドバイス
    updateAIStylingComment();
}

// ↓ index.html側ボタンから呼ばれるエイリアス(別名ショートカット)関数
function clearMannequin() {
    // ↓ 通知付きで全身リセットを実行
    resetMannequinOutfit(false);
}

/**
 * マネキンステージの描画更新
 */
// =========================================================================
// カテゴリ別フォールバックSVG画像
// =========================================================================
// ↓ 画像リンク切れ時にカテゴリーに合う綺麗な代用SVG/PNGを返す安全用フォールバック関数
function getCategoryFallbackImage(category) {
    // ↓ カテゴリごとに代替パスまたはSVG Data URIを返却
    switch (category) {
        // ↓ 靴の場合のインラインSVGスニーカー画像
        case 'SHOES':
            return "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20140%2065%22%3E%3Cpath%20d%3D%22M15%2048%20C25%2048%2C%2035%2046%2C%2045%2040%20C55%2032%2C%2065%2022%2C%2085%2020%20C95%2019%2C%20110%2025%2C%20125%2038%20C132%2044%2C%20130%2050%2C%20120%2052%20L15%2052%20Z%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M10%2052%20L128%2052%20C132%2052%2C%20132%2058%2C%20126%2058%20L10%2058%20C6%2058%2C%206%2052%2C%2010%2052%20Z%22%20fill%3D%22%23e2e8f0%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%2F%3E%3Cpath%20d%3D%22M65%2026%20L80%2032%20M60%2031%20L75%2037%20M55%2036%20L70%2042%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E";
        // ↓ ボトムスの場合
        case 'BOTTOMS':
            return 'assets/images/men/ストレートレープセミフレアスラックス.png';
        // ↓ アウターの場合
        case 'OUTER':
            return 'assets/images/men/オーバードレープダブルトレンチコート.png';
        // ↓ 帽子の場合はクラシックキャップSVG画像
        case 'HAT': case 'HATS': case 'CAP':
            return "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22200%22%20viewBox%3D%220%200%20300%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22capGrad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232a2a2a%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23111111%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M70%20120%20C75%2060%20140%2040%20200%2055%20C215%2060%20230%2080%20235%20115%20C205%20122%20140%20128%2070%20120%20Z%22%20fill%3D%22url(%23capGrad)%22%20stroke%3D%22%23111111%22%20stroke-width%3D%223%22%2F%3E%3Cpath%20d%3D%22M45%20125%20C85%20120%20165%20122%20235%20115%20C260%20118%20275%20125%20268%20138%20C240%20150%20170%20148%2055%20140%20C42%20138%2038%20130%2045%20125%20Z%22%20fill%3D%22%23111111%22%2F%3E%3Ccircle%20cx%3D%22155%22%20cy%3D%2248%22%20r%3D%225%22%20fill%3D%22%23444444%22%2F%3E%3Cpath%20d%3D%22M155%2052%20Q150%2085%20145%20124%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.18)%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E";
        // ↓ トップスおよびその他標準
        case 'TOPS':
        default:
            return 'assets/images/men/アーバングレイジップフーディ.png';
    }
}

// 過去の旧共通localStorageキーの削除および現在のアカウントデータ内の旧画像パス補完
function migrateOldBrokenAssets() {
    // アカウント未分離時代の旧共通localStorageキーを完全に削除してデータ混在を防止
    if (typeof purgeLegacyGlobalStorage === 'function') {
        // ↓ 旧キーを削除
        purgeLegacyGlobalStorage();
    }

    // ↓ 未ログインならマイグレーション対象がないので終了
    if (!AppState.currentUser) {
        // ↓ 終了
        return;
    }

    // ↓ デフォルト靴画像を取得
    const defaultSneaker = getCategoryFallbackImage('SHOES');
    // ↓ 手持ち服側の修正有無フラグ
    let closetChanged = false;
    // ↓ 旧ファイル名('pants_black.jpg'等)のまま残っている手持ち服データを新ファイルパスへ自動修復
    if (Array.isArray(AppState.myCloset)) {
        // ↓ 全アイテムを巡回チェック
        AppState.myCloset.forEach(item => {
            // ↓ 空要素ならスキップ
            if (!item) return;
            // ↓ 旧パンツ画像パスなら現行スラックス画像へ差し替え
            if (!item.image || item.image.includes('pants_black.jpg') || item.image.includes('tapered_black.jpg')) {
                // ↓ 新画像パスへ更新
                item.image = 'assets/images/men/ストレートレープセミフレアスラックス.png';
                // ↓ 更新フラグを立てる
                closetChanged = true;
            // ↓ 旧靴画像パスならSVGスニーカーへ差し替え
            } else if (item.image.includes('shoes_white.jpg')) {
                // ↓ 新画像へ更新
                item.image = defaultSneaker;
                // ↓ 更新フラグ
                closetChanged = true;
            // ↓ 旧スウェット画像パスならジップフーディ画像へ差し替え
            } else if (item.image.includes('sweat_grey.jpg') || item.image.includes('sweat_white.jpg')) {
                // ↓ 新画像へ更新
                item.image = 'assets/images/men/アーバングレイジップフーディ.png';
                // ↓ 更新フラグ
                closetChanged = true;
            // ↓ 旧Tシャツ画像パスならオックスフォードシャツ画像へ差し替え
            } else if (item.image.includes('tshirt_white.jpg') || item.image.includes('tshirt_black.jpg')) {
                // ↓ 新画像へ更新
                item.image = 'assets/images/men/スカイオックスフォードシャツ.png';
                // ↓ 更新フラグ
                closetChanged = true;
            }
        });
    }
    // ↓ 1件でも修復したらlocalStorageに上書き保存
    if (closetChanged) {
        // ↓ 更新後クローゼット保存
        saveScopedData('manekin_my_closet', AppState.myCloset);
    }

    // ↓ 現在着用中コーデ(currentOutfit)側の修復有無フラグ
    let outfitChanged = false;
    // ↓ 着用中コーデ内の不正キーや旧画像パスも同様に修復
    if (AppState.currentOutfit) {
        // ↓ 誤ってBase64文字列自体がスロットキーとして保存されてしまっていた異常データを除去
        for (const slotKey in AppState.currentOutfit) {
            // ↓ 'data:image'で始まる不正キーがあれば削除
            if (slotKey.startsWith("data:image")) {
                // ↓ プロパティ削除
                delete AppState.currentOutfit[slotKey];
                // ↓ 更新フラグ
                outfitChanged = true;
            }
        }
        // ↓ 各正常スロット内の旧画像パスを確認して新画像パスへ修復
        for (const slot in AppState.currentOutfit) {
            // ↓ スロット内のアイテムを取得
            const item = AppState.currentOutfit[slot];
            // ↓ 画像URLを持っていれば旧パス判定を実施
            if (item && item.image) {
                // ↓ 旧パンツ画像チェック
                if (item.image.includes('pants_black.jpg') || item.image.includes('tapered_black.jpg')) {
                    // ↓ 新パスへ差し替え
                    item.image = 'assets/images/men/ストレートレープセミフレアスラックス.png';
                    // ↓ 更新フラグ
                    outfitChanged = true;
                // ↓ 旧靴画像チェック
                } else if (item.image.includes('shoes_white.jpg')) {
                    // ↓ SVG画像へ差し替え
                    item.image = defaultSneaker;
                    // ↓ 更新フラグ
                    outfitChanged = true;
                // ↓ 旧スウェット画像チェック
                } else if (item.image.includes('sweat_grey.jpg') || item.image.includes('sweat_white.jpg')) {
                    // ↓ 新パスへ差し替え
                    item.image = 'assets/images/men/アーバングレイジップフーディ.png';
                    // ↓ 更新フラグ
                    outfitChanged = true;
                // ↓ 旧Tシャツ画像チェック
                } else if (item.image.includes('tshirt_white.jpg') || item.image.includes('tshirt_black.jpg')) {
                    // ↓ 新パスへ差し替え
                    item.image = 'assets/images/men/スカイオックスフォードシャツ.png';
                    // ↓ 更新フラグ
                    outfitChanged = true;
                }
            }
        }
    }
    // ↓ 修復が行われたらアカウント別ストレージに再保存
    if (outfitChanged) {
        // ↓ 着用状態保存
        saveScopedData('manekin_current_outfit', AppState.currentOutfit);
    }
}

/**
 * マネキンステージの描画更新（ゴーストマネキン試着機能）
 */
// ↓ 中央のマネキン人形に5層の服画像を重ねて描画し、足元の着用チップ・販売品サマリー・微調整UIまで更新する核心関数
function renderMannequinStage() {
    // ↓ 着用状態オブジェクトを取得
    const outfit = AppState.currentOutfit || {};
    // ↓ 奥(shoes/bottoms)から手前(tops/outer/hat)まで5部位スロット定義配列
    const slots = ['shoes', 'bottoms', 'tops', 'outer', 'hat'];

    // ↓ 各部位のPNG/SVG画像をステージの該当レイヤーDOMへ差し込みます
    slots.forEach(slot => {
        // ↓ 外枠スロット要素（例: layer-tops）
        const slotElem = document.getElementById(`layer-${slot}`);
        // ↓ 服画像が入る内側枠要素（例: layer-content-tops）
        const layerContent = document.getElementById(`layer-content-${slot}`);
        // ↓ 現在その部位に着ている服データ
        const item = outfit[slot];

        // ↓ 服が着せられていれば has-item クラスを付けて「空の点線プレースホルダー枠」を隠します
        if (slotElem) {
            // ↓ itemとimageが両方あるか真偽値変換(!!)でトグル
            slotElem.classList.toggle('has-item', !!(item && item.image));
        }

        // ↓ 服画像<img>タグを描画（脱いでいれば中身を空文字にして消去）
        if (layerContent) {
            // ↓ 画像あり時は<img>生成
            if (item && item.image) {
                // ↓ 読み込み失敗時用フォールバック取得
                const fallback = getCategoryFallbackImage(item.category);
                // ↓ 重ね着用のlayer-imgをセット
                layerContent.innerHTML = `<img src="${item.image}" alt="${item.name}" class="layer-img" onerror="this.onerror=null;this.src='${fallback}';">`;
            // ↓ 画像なし時はクリア
            } else {
                // ↓ HTMLを空に
                layerContent.innerHTML = '';
            }
        }
    });

    // 着用中チップバーの更新（ステージ下部に並ぶ脱着タグ一覧）
    const slotsBar = document.getElementById('wearing-slots-bar');
    // ↓ チップバー要素があれば着用中部位だけタグを生成
    if (slotsBar) {
        // ↓ 生成したHTML断片を溜める配列
        const chipsHtml = [];
        // ↓ 5スロットをループ
        for (const slotKey of slots) {
            // ↓ スロット内の服を取得
            const item = outfit[slotKey];
            // ↓ 着用中ならチップHTMLを作成
            if (item) {
                // ↓ 手持ち服かブランド販売品かの表示文言を決定
                const badgeLabel = item.isOwned ? '手持ち' : 'ブランド';
                // ↓ 靴と帽子はサイズ無し(フリー)扱い
                const isFreeSlot = (slotKey === 'shoes' || slotKey === 'hat');
                // ↓ ブランド服でサイズ情報があれば `[L]` のような表記を追加
                const sizeBadge = (!item.isOwned && item.size && !isFreeSlot) ? ` [${item.size}]` : '';
                // ↓ タグ＋解除ボタンのHTMLを追加
                chipsHtml.push(`
                    <span class="wearing-chip">
                        <span>${getCategoryNameJP(item.category)}: ${item.name}${sizeBadge} (${badgeLabel})</span>
                        <button class="wearing-chip-del" onclick="unwearSlot('${slotKey}')" title="脱がせる">×</button>
                    </span>
                `);
            }
        }
        // ↓ 配列を連結して画面に描画
        slotsBar.innerHTML = chipsHtml.join('');
    }

    // ブランド商品サマリー計算（手持ち服は除き、販売ブランド品だけの点数と合計金額を集計）
    let brandCount = 0;
    // ↓ 販売アイテム合計額の初期値
    let brandPrice = 0;
    // ↓ 5部位を走査
    for (const slotKey of slots) {
        // ↓ アイテム取り出し
        const item = outfit[slotKey];
        // ↓ 存在し、かつ私物(isOwned)ではないブランド商品のみ加算
        if (item && !item.isOwned) {
            // ↓ 点数加算
            brandCount++;
            // ↓ 金額加算
            brandPrice += (item.price || 0);
        }
    }

    // ↓ 「○点」カウントテキスト更新
    const countElem = document.getElementById('brand-sum-count');
    // ↓ 要素があれば更新
    if (countElem) countElem.textContent = `${brandCount}点`;

    // ↓ 合計価格表示更新
    const priceElem = document.getElementById('brand-sum-price');
    // ↓ 要素があれば更新
    if (priceElem) priceElem.textContent = `¥${brandPrice.toLocaleString()}`;

    // ↓ 着用中ブランド品が0点のときは一括カート投入ボタンを無効化(disabled)
    const cartBtn = document.getElementById('btn-add-brand-to-cart');
    // ↓ disabled状態を切り替え
    if (cartBtn) {
        // ↓ 0点ならtrue(押せない)
        cartBtn.disabled = (brandCount === 0);
    }

    // 服の位置・サイズ微調整オフセット（translateとscaleのCSS変換）をDOMへ適用
    applyFittingOffsets();

    // 微調整パネルが開いていればスライダー値やタグ表示も最新に再同期
    const adjustPanel = document.getElementById('fitting-adjust-panel');
    // ↓ 非表示(none)でなければ開いていると判断して同期
    if (adjustPanel && adjustPanel.style.display !== 'none') {
        // ↓ パネルUI同期
        syncAdjustPanelUI();
    }
}

// ↓ ステージ上の各部位ボックス（アウター・トップス・ボトムス等）がクリックされた時の処理
function handleStageSlotClick(slotKey) {
    // ↓ 現在の着用状態を取得
    const outfit = AppState.currentOutfit || {};
    // ↓ クリックされた部位のアイテムを確認
    const item = outfit[slotKey];

    // ↓ すでに着ている状態ならクリック1回で脱がせ、未着用ならクイック選択ポップオーバーを開きます
    if (item) {
        // 着用中の場合：脱がす
        unwearSlot(slotKey);
    } else {
        // 未着用の場合：その部位に合う服候補一覧ポップオーバーを開く
        openStageQuickPicker(slotKey);
    }
}

/**
 * ステージ内クイック選択ポップオーバーを開く
 */
// ↓ マネキンの未着用点線枠をクリックした時に、その部位に合う服だけをステージ上に小窓表示する関数
function openStageQuickPicker(slotKey) {
    // ↓ ポップオーバー外枠を取得
    const picker = document.getElementById('stage-quick-picker');
    // ↓ ポップオーバー見出しを取得
    const title = document.getElementById('quick-picker-title');
    // ↓ 候補カード一覧コンテナを取得
    const body = document.getElementById('quick-picker-body');
    // ↓ 要素不足なら終了
    if (!picker || !body) return;

    // ↓ スロット名から日本語名と大文字カテゴリコードへの変換辞書
    const catNameMap = {
        outer: { name: 'アウター', cat: 'OUTER' },
        tops: { name: 'トップス', cat: 'TOPS' },
        bottoms: { name: 'ボトムス', cat: 'BOTTOMS' },
        shoes: { name: '靴', cat: 'SHOES' },
        hat: { name: '帽子', cat: 'HAT' }
    };
    // ↓ 対応カテゴリ情報を取得
    const catInfo = catNameMap[slotKey] || { name: 'アイテム', cat: 'ALL' };
    // ↓ 小窓のヘッダー文字を更新（例: 「トップス を選択して試着」）
    if (title) title.textContent = `${catInfo.name} を選択して試着`;

    // 候補アイテムを抽出（自分のクローゼット内の手持ち服 ＋ マネキン性別に合う全ブランド商品）
    const myItems = AppState.myCloset.filter(c => c.category === catInfo.cat);
    // ↓ ブランド側はこの画面から直接全品試せるようSAMPLE_PRODUCTSから抽出
    const brandItems = SAMPLE_PRODUCTS.filter(p => p.category === catInfo.cat && (!p.gender || p.gender === AppState.studioGender));

    // ↓ 組み立てるHTML文字列変数
    let html = '';
    // ↓ どちらも0件なら空メッセージを表示
    if (myItems.length === 0 && brandItems.length === 0) {
        // ↓ 空メッセージHTML
        html = '<p style="grid-column: 1/-1; text-align: center; color: #94a3b8; font-size: 0.75rem; padding: 12px;">選択できるアイテムがありません</p>';
    // ↓ 候補がある場合は[手持ち]と[ブランド価格]カードを並べて生成
    } else {
        // ↓ まず手持ち服カードを追加
        myItems.forEach(item => {
            // ↓ フォールバック画像取得
            const fb = getCategoryFallbackImage(item.category);
            // ↓ カードHTMLを追記
            html += `
            <div class="quick-picker-card" onclick="toggleWearItem('${item.id}', true); closeStageQuickPicker();" title="${item.name}" >
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${fb}';">
                    <div class="quick-picker-card-name">${item.name}</div>
                    <span style="font-size: 0.6rem; color: #0284c7; font-weight: 600;">[手持ち]</span>
                </div>
        `;
        });
        // ↓ 続けてブランド商品カードを追加
        brandItems.forEach(p => {
            // ↓ フォールバック画像取得
            const fb = getCategoryFallbackImage(p.category);
            // ↓ カードHTMLを追記
            html += `
            <div class="quick-picker-card" onclick="toggleWearItem(${p.id}, false); closeStageQuickPicker();" title="${p.name}" >
                <img src="${p.image}" alt="${p.name}" onerror="this.onerror=null;this.src='${fb}';">
                    <div class="quick-picker-card-name">${p.name}</div>
                    <span style="font-size: 0.6rem; color: #e11d48; font-weight: 600;">¥${p.price.toLocaleString()}</span>
                </div>
        `;
        });
    }

    // ↓ 候補一覧を小窓に挿入して表示状態(block)にします
    body.innerHTML = html;
    // ↓ 表示オン
    picker.style.display = 'block';

    // 左・右カラムのフィルターも連動してクリックした部位カテゴリに自動切り替え
    handleStudioClosetFilter(catInfo.cat);
    // ↓ 右カラムブランドフィルターも同カテゴリに連動
    handleStudioBrandFilter(catInfo.cat);
}

// ↓ ステージ上のクイック選択小窓の×ボタンで閉じる関数
function closeStageQuickPicker() {
    // ↓ 小窓要素を取得
    const picker = document.getElementById('stage-quick-picker');
    // ↓ 非表示に戻します
    if (picker) picker.style.display = 'none';
}

// ドラッグ＆ドロップ試着機能（左右カードをつかんでマネキンへ運ぶ開始処理）
function handleCardDragStart(event, itemId, isOwned) {
    // ↓ ドラッグデータ内にアイテムIDと手持ちフラグをJSON文字列で仕込んでおきます
    event.dataTransfer.setData('text/plain', JSON.stringify({ itemId, isOwned }));
    // ↓ ドロップカーソルをコピー(+)アイコンに設定
    event.dataTransfer.effectAllowed = 'copy';
}

// ↓ ドラッグ中のカードがマネキンステージの上を通過している間に呼ばれるハンドラ
function handleStageDragOver(event) {
    // ↓ ブラウザ標準の「ドロップ禁止」挙動を無効化してドロップを受け入れ可能にします
    event.preventDefault();
    // ↓ マウス横にコピー用カーソルを表示
    event.dataTransfer.dropEffect = 'copy';
    // ↓ ステージ枠を取得してハイライトクラス(is-dragover)を点灯
    const box = document.getElementById('mannequin-stage-box');
    // ↓ ハイライトオン
    if (box) box.classList.add('is-dragover');
}

// ↓ ドラッグ中のカーソルがマネキンステージ外へ出たときのハイライト解除ハンドラ
function handleStageDragLeave(event) {
    // ↓ ステージ枠を取得
    const box = document.getElementById('mannequin-stage-box');
    // ↓ 破線・強調クラスを外します
    if (box) box.classList.remove('is-dragover');
}

// ↓ マネキンステージ上に服カードをドロップした瞬間に自動試着させるハンドラ
function handleStageDrop(event) {
    // ↓ 既定動作（画像URL直接開き等）を禁止
    event.preventDefault();
    // ↓ ハイライトクラスを消灯
    const box = document.getElementById('mannequin-stage-box');
    // ↓ 消灯
    if (box) box.classList.remove('is-dragover');

    // ↓ ドラッグ開始時に埋め込んだJSONデータを取り出して試着関数を呼び出します
    try {
        // ↓ JSON文字列をオブジェクトに復元
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        // ↓ itemIdが含まれていればそのアイテムをマネキンに着せます
        if (data && data.itemId !== undefined) {
            // ↓ toggleWearItem(ID, 手持ちフラグ) を呼び出し
            toggleWearItem(data.itemId, !!data.isOwned);
        }
    // ↓ 服カード以外のファイル等を誤ってドロップした場合のエラー保護
    } catch (e) {
        // ↓ コンソールにエラー出力
        console.error('Drop error:', e);
    }
}

/**
 * 服の位置・サイズ微調整オフセットを各レイヤーに適用
 * 販売商品はXS〜XLの5段階サイズに応じたスケールを適用し、手持ち服は自由なカスタム倍率を適用
 */
// ↓ fittingOffsets に記録された上下(y)・左右(x)・倍率(scale)を各レイヤーのCSSカスタム変数へ反映する関数
function applyFittingOffsets() {
    // ↓ 部位ごとの微調整設定を取得
    const offsets = AppState.fittingOffsets || {};
    // ↓ 全5部位スロット
    const slots = ['outer', 'tops', 'bottoms', 'shoes', 'hat'];
    // ↓ 着用中コーデ情報
    const outfit = AppState.currentOutfit || {};

    // ↓ 各部位レイヤーDIVに CSSカスタム変数 (--offset-x, --offset-y, --scale) を書き込んでリアルタイム変形します
    slots.forEach(slot => {
        // ↓ レイヤー枠を取得
        const layerElem = document.getElementById(`layer-${slot}`);
        // ↓ 無ければスキップ
        if (!layerElem) return;
        // ↓ 該当スロットの設定（無ければ初期値を使用）
        const off = offsets[slot] || { x: 0, y: 0, scale: 100, brandSize: 'M' };
        // ↓ 着用中の服オブジェクト
        const item = outfit[slot];

        // ↓ 最終的に適用する拡大率(%)を入れる変数
        let effectiveScale = 100;
        // ↓ 靴と帽子は衣類規格(XS〜XL)ではなく自由拡大縮小対象
        const isFreeScaleSlot = (slot === 'shoes' || slot === 'hat');
        // ↓ 販売商品（アウター・トップス・ボトムス）の場合：XS(88%)〜XL(112%)の規格倍率に変換
        if (!isFreeScaleSlot && item && !item.isOwned) {
            // 販売されている服（アウター・トップス・ボトムス）: XS〜XLの5段階サイズ
            const bSize = off.brandSize || item.size || 'M';
            // ↓ サイズ名に対応するパーセントを取得
            effectiveScale = BRAND_SIZE_SCALES[bSize] || 100;
        // ↓ 手持ち服や帽子・靴の場合：自由スライダーの数値(70〜140%)をそのまま採用
        } else if (item && (item.isOwned || isFreeScaleSlot)) {
            // 帽子・靴、および手持ちの服: スライダーによる自由な拡大縮小スケール (70%〜140%)
            effectiveScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        // ↓ 未着用などその他の場合もcustomScaleまたはscaleを参照
        } else {
            // ↓ デフォルト100
            effectiveScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        }

        // ↓ CSSの transform: translate(var(--offset-x), var(--offset-y)) scale(var(--scale)) に直結します
        layerElem.style.setProperty('--offset-x', `${off.x || 0}px`);
        // ↓ 上下位置pxをセット
        layerElem.style.setProperty('--offset-y', `${off.y || 0}px`);
        // ↓ 倍率は100で割った小数(1.0 = 100%)としてセット
        layerElem.style.setProperty('--scale', effectiveScale / 100);
    });
}

/**
 * 位置微調整パネルの開閉トグル
 */
// ↓ 「位置・サイズ微調整」ボタンを押したときにパネルを出したり隠したりする関数
function toggleFittingAdjustPanel() {
    // ↓ 微調整パネルDOM
    const panel = document.getElementById('fitting-adjust-panel');
    // ↓ トグルボタンDOM
    const btn = document.getElementById('btn-toggle-adjust-mode');
    // ↓ 無ければ終了
    if (!panel) return;

    // ↓ 現在非表示かどうかを判定
    const isHidden = panel.style.display === 'none' || panel.style.display === '';
    // ↓ 非表示ならblockで開き、表示中ならnoneで閉じます
    panel.style.display = isHidden ? 'block' : 'none';
    // ↓ ボタンにactive色を切り替えます
    if (btn) btn.classList.toggle('active', isHidden);

    // ↓ 開いた瞬間に現在選択部位や服種別に合わせたUIへ最新同期します
    if (isHidden) {
        // ↓ UI同期実行
        syncAdjustPanelUI();
    }
}

/**
 * 微調整対象スロットタブ切り替え
 */
// ↓ 微調整パネル内の部位タブ（アウター / トップス / ボトムス / 靴 / 帽子）を切り替える関数
function switchAdjustSlot(slotKey) {
    // ↓ アクティブな調整対象部位を変更
    AppState.activeAdjustSlot = slotKey;
    // ↓ 全部位タブの中から選ばれたものだけactiveを付与
    document.querySelectorAll('#adjust-slot-tabs .adjust-tab-btn').forEach(btn => {
        // ↓ data-adjust-slot属性一致判定
        btn.classList.toggle('active', btn.getAttribute('data-adjust-slot') === slotKey);
    });
    // ↓ スライダーやアイテム種別バッジを切り替え先の部位に合わせて描き直します
    syncAdjustPanelUI();
}

/**
 * スライダーUIの値を現在の服種別（販売商品 vs 手持ち服）およびオフセットに同期
 */
// ↓ 微調整パネルの中身を「未着用」「帽子・靴」「販売商品のXS〜XLモード」「手持ち服の自由倍率モード」の4通りへ動的に切り替える関数
function syncAdjustPanelUI() {
    // ↓ 現在調整中のスロットを取得（既定はouter）
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // 微調整タブボタンのアクティブ表示を同期
    document.querySelectorAll('#adjust-slot-tabs .adjust-tab-btn').forEach(btn => {
        // ↓ 選択タブにactive付与
        btn.classList.toggle('active', btn.getAttribute('data-adjust-slot') === slotKey);
    });
    // ↓ スロットの位置・サイズ設定を取得
    const offsets = AppState.fittingOffsets || {};
    // ↓ 見つからない場合の初期値フォールバック
    const off = offsets[slotKey] || { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    // ↓ 着用中コーデと対象部位アイテムを取得
    const outfit = AppState.currentOutfit || {};
    // ↓ 対象スロットの服（未着用ならnull/undefined）
    const item = outfit[slotKey];
    // ↓ 靴・帽子スロットかどうかを判定
    const isFreeScaleSlot = (slotKey === 'shoes' || slotKey === 'hat');

    // UI要素の取得（位置スライダー類）
    const sliderY = document.getElementById('slider-adjust-y');
    // ↓ 左右スライダー
    const sliderX = document.getElementById('slider-adjust-x');
    // ↓ 上下数値表示
    const valY = document.getElementById('val-adjust-y');
    // ↓ 左右数値表示
    const valX = document.getElementById('val-adjust-x');

    // ↓ パネル内ヘッダーメタ行とモード別サイズ行
    const badgeElem = document.getElementById('adjust-item-badge');
    // ↓ 服の名前欄
    const nameElem = document.getElementById('adjust-item-name');
    // ↓ 右側モード説明文
    const descElem = document.getElementById('adjust-item-type-desc');
    // ↓ 販売商品向け5段階(XS〜XL)スライダー行
    const rowBrand = document.getElementById('adjust-row-scale-brand');
    // ↓ 手持ち・帽子・靴向け自由倍率スライダー行
    const rowFree = document.getElementById('adjust-row-scale-free');
    // ↓ 下部ヒント説明文
    const hintElem = document.querySelector('.adjust-hint') || document.getElementById('adjust-hint-text');

    // ↓ 販売商品サイズ操作パーツ
    const sliderBrandSize = document.getElementById('slider-adjust-brand-size');
    // ↓ 現在サイズバッジ('M'等)
    const valBrandSize = document.getElementById('val-adjust-brand-size');
    // ↓ サイズ縮小「−」ボタン
    const btnBrandMinus = document.getElementById('btn-brand-size-minus');
    // ↓ サイズ拡大「＋」ボタン
    const btnBrandPlus = document.getElementById('btn-brand-size-plus');

    // ↓ 自由倍率操作パーツ
    const sliderScale = document.getElementById('slider-adjust-scale');
    // ↓ 倍率パーセント表示
    const valScale = document.getElementById('val-adjust-scale');

    // 共通: 上下・左右位置の値をスライダーと数値テキストへ反映（プラス時は + 記号付き）
    if (sliderY) sliderY.value = off.y || 0;
    // ↓ X座標反映
    if (sliderX) sliderX.value = off.x || 0;
    // ↓ Y数値テキスト
    if (valY) valY.textContent = `${off.y > 0 ? '+' : ''}${off.y || 0}px`;
    // ↓ X数値テキスト
    if (valX) valX.textContent = `${off.x > 0 ? '+' : ''}${off.x || 0}px`;

    // 1. 未着用状態：スライダーをすべて無効化して試着を促す表示にします
    if (!item) {
        // ↓ グレーの「未着用」バッジに切り替え
        if (badgeElem) {
            // ↓ emptyクラス設定
            badgeElem.className = 'adjust-item-tag empty';
            // ↓ 文言設定
            badgeElem.textContent = '未着用';
        }
        // ↓ 名前欄に部位名＋(未着用)を表示
        if (nameElem) nameElem.textContent = `${getCategoryNameJP(slotKey.toUpperCase())}（未着用）`;
        // ↓ 説明文設定
        if (descElem) descElem.textContent = isFreeScaleSlot ? '自由サイズ調整（70%〜140%）' : '試着すると調整可能';

        // ↓ 上下左右スライダー操作不可に設定
        if (sliderY) sliderY.disabled = true;
        // ↓ 左右スライダー操作不可
        if (sliderX) sliderX.disabled = true;

        // ↓ 帽子・靴と服で、未着用時に見せておくダミースライダー行を分けます
        if (isFreeScaleSlot) {
            // 帽子・靴は未着用でも自由サイズUIを表示（XS〜XLの服規格ではなく自由拡縮）
            if (rowBrand) rowBrand.style.display = 'none';
            // ↓ 自由行を表示
            if (rowFree) rowFree.style.display = 'flex';
            // ↓ 倍率スライダーを無効状態で値合わせ
            if (sliderScale) {
                // ↓ 無効化
                sliderScale.disabled = true;
                // ↓ 値セット
                sliderScale.value = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
            }
            // ↓ パーセント表示
            if (valScale) valScale.textContent = `${(off.customScale !== undefined) ? off.customScale : (off.scale || 100)}%`;
            // ↓ ヒント文言
            if (hintElem) hintElem.textContent = `💡 ${slotKey === 'hat' ? '帽子' : '靴'}をクローゼットから着用すると、マネキンに合わせてサイズ（70%〜140%）や位置を自由に微調整できます`;
        } else {
            // 服（アウター・トップス・ボトムス）は規格サイズUIを表示（非活性）
            if (rowBrand) rowBrand.style.display = 'flex';
            // ↓ 自由行を隠す
            if (rowFree) rowFree.style.display = 'none';
            // ↓ サイズ操作パーツを一式無効化
            if (sliderBrandSize) sliderBrandSize.disabled = true;
            // ↓ 縮小ボタン無効化
            if (btnBrandMinus) btnBrandMinus.disabled = true;
            // ↓ 拡大ボタン無効化
            if (btnBrandPlus) btnBrandPlus.disabled = true;
            // ↓ ヒント文言
            if (hintElem) hintElem.textContent = '💡 クローゼットまたは商品一覧から服を選んでマネキンに試着してください';
        }
        // ↓ 未着用分岐はここで終了
        return;
    }

    // 2. 着用中：各スライダーのdisabledを解除して操作可能に戻す
    if (sliderY) sliderY.disabled = false;
    // ↓ 左右有効化
    if (sliderX) sliderX.disabled = false;
    // ↓ 5段階サイズ有効化
    if (sliderBrandSize) sliderBrandSize.disabled = false;
    // ↓ 自由倍率有効化
    if (sliderScale) sliderScale.disabled = false;

    // ↓ 帽子・靴／販売ブランド服／手持ち服の3モードでUI切り替え
    if (isFreeScaleSlot) {
        // =====================================================================
        // 【帽子・靴: 常に自由サイズ調整（70%〜140%）】
        // 帽子と靴は衣類のXS〜XL規格ではなく、頭の形や足元に合わせて自由にサイズ・位置を微調整できる
        // =====================================================================
        if (badgeElem) {
            // ↓ オレンジ色のタグに設定
            badgeElem.className = 'adjust-item-tag closet';
            // ↓ 絵文字付きカテゴリ表記
            badgeElem.textContent = slotKey === 'hat' ? '🧢 帽子' : '👟 靴';
        }
        // ↓ アイテム名表示
        if (nameElem) nameElem.textContent = item.name;
        // ↓ 説明文
        if (descElem) descElem.textContent = '自由サイズ調整（70%〜140%）';

        // ↓ 自由倍率スライダー行を表示
        if (rowBrand) rowBrand.style.display = 'none';
        // ↓ display: flex に
        if (rowFree) rowFree.style.display = 'flex';

        // ↓ 現在のカスタム倍率を取得してスライダー・数値へ反映
        const currentScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        // ↓ スライダー位置を合わせる
        if (sliderScale) sliderScale.value = currentScale;
        // ↓ 「100%」等を表示
        if (valScale) valScale.textContent = `${currentScale}%`;

        // ↓ 操作ヒント更新
        if (hintElem) hintElem.textContent = `💡 ${slotKey === 'hat' ? '帽子' : '靴'}はスライダーで大きさを70%〜140%まで自由に拡大・縮小できます（自動保存）`;

    } else if (!item.isOwned) {
        // =====================================================================
        // 【販売されている服（アウター・トップス・ボトムス）: XS〜XLの5段階サイズ】
        // =====================================================================
        if (badgeElem) {
            // ↓ 水色の「🏷️ 販売商品」バッジに切り替え
            badgeElem.className = 'adjust-item-tag brand';
            // ↓ バッジ文字
            badgeElem.textContent = '🏷️ 販売商品';
        }
        // ↓ 商品名
        if (nameElem) nameElem.textContent = item.name;
        // ↓ 規格モード表記
        if (descElem) descElem.textContent = '規格サイズ（XS〜XL）';

        // ↓ 5段階サイズ行を表示、自由行は非表示
        if (rowBrand) rowBrand.style.display = 'flex';
        // ↓ 自由行隠す
        if (rowFree) rowFree.style.display = 'none';

        // ↓ 現在サイズ('M'等)から配列インデックス(0〜4)を求め、見つからなければ標準の2('M')を採用
        const currentSize = off.brandSize || item.size || 'M';
        // ↓ インデックス検索
        const sizeIdx = BRAND_SIZE_LIST.indexOf(currentSize);
        // ↓ 安全な0〜4インデックスへ確定
        const validIdx = (sizeIdx >= 0) ? sizeIdx : 2;

        // ↓ 5段階スライダーの位置とサイズバッジ文字を合わせる
        if (sliderBrandSize) sliderBrandSize.value = validIdx;
        // ↓ バッジ('M'等)更新
        if (valBrandSize) valBrandSize.textContent = BRAND_SIZE_LIST[validIdx];

        // 目盛りのアクティブ表示更新（該当サイズ文字を黒反転強調）
        document.querySelectorAll('#brand-size-ticks .brand-size-tick').forEach(tick => {
            // ↓ 数値変換して一致するかチェック
            const tIdx = parseInt(tick.getAttribute('data-size-idx'), 10);
            // ↓ 一致するものだけactive付与
            tick.classList.toggle('active', tIdx === validIdx);
        });

        // ↓ 両端（XS以下・XL以上）に達していたらマイナス/プラスボタンを無効化
        if (btnBrandMinus) btnBrandMinus.disabled = (validIdx <= 0);
        // ↓ 上限チェック
        if (btnBrandPlus) btnBrandPlus.disabled = (validIdx >= BRAND_SIZE_LIST.length - 1);

        // ↓ ヒント更新
        if (hintElem) hintElem.textContent = '💡 販売商品はXS〜XLのサイズ規格でマネキン上の表示サイズが変わります（自動保存）';

    } else {
        // =====================================================================
        // 【手持ちの服（アウター・トップス・ボトムス）: 自由サイズ調整】
        // =====================================================================
        if (badgeElem) {
            // ↓ オレンジ色のクローゼットバッジを設定
            badgeElem.className = 'adjust-item-tag closet';
            // ↓ 文字設定
            badgeElem.textContent = '👕 マイクローゼット';
        }
        // ↓ 手持ち服名表示
        if (nameElem) nameElem.textContent = item.name;
        // ↓ モード表記
        if (descElem) descElem.textContent = '自由サイズ調整（見た目補正）';

        // ↓ 自由倍率行を表示
        if (rowBrand) rowBrand.style.display = 'none';
        // ↓ flex表示
        if (rowFree) rowFree.style.display = 'flex';

        // ↓ カスタム倍率を取り出して反映
        const currentScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        // ↓ スライダー位置更新
        if (sliderScale) sliderScale.value = currentScale;
        // ↓ %文字更新
        if (valScale) valScale.textContent = `${currentScale}%`;

        // ↓ ヒント更新
        if (hintElem) hintElem.textContent = '💡 手持ちの服はブランドによって実寸が異なるため、見た目の大きさを自由に調整できます（自動保存）';
    }
}

/**
 * 販売商品用: 5段階サイズ選択（XS・S・M・L・XL）変更処理
 */
// ↓ 販売商品の5段階サイズスライダーまたは目盛りクリック時に呼ばれ、対応倍率(88%〜112%)へ変更＆自動保存する関数
function handleBrandSizeInput(val) {
    // ↓ 対象スロット取得
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // 帽子と靴はXS〜XL規格サイズではなく自由拡大縮小のためガード
    if (slotKey === 'shoes' || slotKey === 'hat') return;

    // ↓ 設定オブジェクトが未生成なら初期構造を作っておきます
    if (!AppState.fittingOffsets[slotKey]) {
        // ↓ 初期値セット
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    // ↓ 引数を整数化し、0〜4の範囲に安全にクランプ(挟み込み)します
    const idx = parseInt(val, 10);
    // ↓ 0未満なら0、4超えなら4に制限
    const clampedIdx = Math.max(0, Math.min(BRAND_SIZE_LIST.length - 1, idx));
    // ↓ サイズ名（'XS'〜'XL'）を取得
    const sizeName = BRAND_SIZE_LIST[clampedIdx];
    // ↓ 対応するマネキン表示スケール(%)を取得
    const targetScale = BRAND_SIZE_SCALES[sizeName] || 100;

    // オフセット状態に新サイズ名と倍率を記録
    AppState.fittingOffsets[slotKey].brandSize = sizeName;
    // ↓ スケール値更新
    AppState.fittingOffsets[slotKey].scale = targetScale;

    // 着用中アイテムのサイズ情報も同期（着用中タグの `[L]` 表示やカート一括追加サイズに反映される）
    if (AppState.currentOutfit && AppState.currentOutfit[slotKey]) {
        // ↓ サイズ上書き
        AppState.currentOutfit[slotKey].size = sizeName;
        // ↓ ローカル保存
        saveScopedData('manekin_current_outfit', AppState.currentOutfit);
    }

    // UI表示更新（スライダー・現在サイズ文字・目盛り・＋−ボタン活性化）
    const slider = document.getElementById('slider-adjust-brand-size');
    // ↓ スライダー位置同期
    if (slider) slider.value = clampedIdx;

    // ↓ サイズ表記更新
    const valElem = document.getElementById('val-adjust-brand-size');
    // ↓ サイズ名反映
    if (valElem) valElem.textContent = sizeName;

    // ↓ 目盛り文字ハイライト同期
    document.querySelectorAll('#brand-size-ticks .brand-size-tick').forEach(tick => {
        // ↓ インデックス一致判定
        const tIdx = parseInt(tick.getAttribute('data-size-idx'), 10);
        // ↓ active切替
        tick.classList.toggle('active', tIdx === clampedIdx);
    });

    // ↓ 端に達したボタンを無効化
    const btnMinus = document.getElementById('btn-brand-size-minus');
    // ↓ プラスボタン取得
    const btnPlus = document.getElementById('btn-brand-size-plus');
    // ↓ XSなら−無効
    if (btnMinus) btnMinus.disabled = (clampedIdx <= 0);
    // ↓ XLなら＋無効
    if (btnPlus) btnPlus.disabled = (clampedIdx >= BRAND_SIZE_LIST.length - 1);

    // マネキン上の服の表示サイズを即座に更新
    applyFittingOffsets();

    // スコープ付きローカルストレージ保存 ＋ MySQL同期（連続操作をまとめるデバウンス送信）
    saveScopedData('manekin_fitting_offsets', AppState.fittingOffsets);
    // ↓ バックエンドへ遅延保存予約
    syncStudioStateToBackend({ immediate: false });
}

/**
 * 販売商品用: 1段階サイズ増減ステップ（－ / ＋）
 */
// ↓ 販売商品サイズ横の「−」「＋」ボタンが押されたときに1サイズ分だけ増減させる関数
function stepBrandSize(delta) {
    // ↓ 対象部位取得
    const slotKey = AppState.activeAdjustSlot || 'outer';
    // ↓ 靴・帽子なら何もしない
    if (slotKey === 'shoes' || slotKey === 'hat') return;

    // ↓ 現在設定中のサイズから現在のインデックスを求めます
    const off = (AppState.fittingOffsets && AppState.fittingOffsets[slotKey]) || {};
    // ↓ 着用中情報も確認
    const outfit = AppState.currentOutfit || {};
    // ↓ 対象服
    const item = outfit[slotKey];
    // ↓ 現在サイズ取得
    const currentSize = off.brandSize || (item && item.size) || 'M';
    // ↓ インデックス変換
    const currentIdx = BRAND_SIZE_LIST.indexOf(currentSize);
    // ↓ 基準インデックス決定
    const baseIdx = (currentIdx >= 0) ? currentIdx : 2;
    // ↓ +1 または -1 した新しいサイズインデックスを渡して更新処理を実行
    handleBrandSizeInput(baseIdx + delta);
}

/**
 * 手持ち服および位置の微調整スライダー変更時処理
 */
// ↓ 上下(y)・左右(x)・自由拡大率(scale)スライダーを動かしたときにリアルタイム更新・自動保存する関数
function handleAdjustInput(prop, val) {
    // ↓ 対象部位取得
    const slotKey = AppState.activeAdjustSlot || 'outer';

    // ↓ 未初期化スロットの安全初期化
    if (!AppState.fittingOffsets[slotKey]) {
        // ↓ 初期値セット
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    // ↓ 整数化して対象プロパティへ保存
    const numVal = parseInt(val, 10);
    // ↓ 値を格納
    AppState.fittingOffsets[slotKey][prop] = numVal;
    // ↓ 拡大率なら自由スケール(customScale)側にも同時に記録しておきます
    if (prop === 'scale') {
        // ↓ カスタム倍率同期
        AppState.fittingOffsets[slotKey].customScale = numVal;
    }

    // UI数値表示テキストの更新
    if (prop === 'y') {
        // ↓ 上下ラベル更新
        const valElem = document.getElementById('val-adjust-y');
        // ↓ プラス時は+付きで表示
        if (valElem) valElem.textContent = `${numVal > 0 ? '+' : ''}${numVal}px`;
    } else if (prop === 'x') {
        // ↓ 左右ラベル更新
        const valElem = document.getElementById('val-adjust-x');
        // ↓ プラス時は+付きで表示
        if (valElem) valElem.textContent = `${numVal > 0 ? '+' : ''}${numVal}px`;
    } else if (prop === 'scale') {
        // ↓ 倍率ラベル更新
        const valElem = document.getElementById('val-adjust-scale');
        // ↓ %表示
        if (valElem) valElem.textContent = `${numVal}%`;
    }

    // 画面のマネキン服の見た目へ即座に反映
    applyFittingOffsets();

    // スコープ付きローカルストレージへ保存 ＋ MySQL同期（デバウンス送信）
    saveScopedData('manekin_fitting_offsets', AppState.fittingOffsets);
    // ↓ サーバー同期予約
    syncStudioStateToBackend({ immediate: false });
}

/**
 * 微調整ボタン（▲▼◀▶＋－）クリック時の増減
 */
// ↓ 微調整パネル内の細かい上下左右±矢印ボタンが押されたとき指定量(delta)だけ動かす関数
function stepAdjust(prop, delta) {
    // ↓ 対象部位取得
    const slotKey = AppState.activeAdjustSlot || 'outer';

    // ↓ 未初期化なら初期化
    if (!AppState.fittingOffsets[slotKey]) {
        // ↓ 初期オブジェクトセット
        AppState.fittingOffsets[slotKey] = { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    }

    // ↓ 現在値を取り出し（未定義なら倍率は100、位置は0を初期値に）
    let current = AppState.fittingOffsets[slotKey][prop];
    // ↓ 未定義チェック
    if (current === undefined) {
        // ↓ デフォルト決定
        current = (prop === 'scale') ? 100 : 0;
    }
    // ↓ 差分を足した次の値を算出して反映関数へ渡します
    const nextVal = current + delta;
    // ↓ 画面と保存を更新
    handleAdjustInput(prop, nextVal);

    // ↓ rangeスライダーのつまみ位置もボタン操作後の値に連動させます
    const slider = document.getElementById(`slider-adjust-${prop}`);
    // ↓ スライダー値更新
    if (slider) slider.value = nextVal;
}

/**
 * オフセット初期化リセット
 */
// ↓ 現在選択中の1部位について位置(x:0, y:0)とサイズ(100% / M)を初期状態へ戻すリセット関数
function resetFittingOffsets() {
    // ↓ 対象部位取得
    const slotKey = AppState.activeAdjustSlot || 'outer';

    // ↓ 対象部位の設定だけ初期値へリセット
    AppState.fittingOffsets[slotKey] = {
        x: 0,
        y: 0,
        scale: 100,
        brandSize: 'M',
        customScale: 100
    };

    // ↓ ブランド商品なら着用サイズ情報もMへ戻して保存
    if (AppState.currentOutfit && AppState.currentOutfit[slotKey] && !AppState.currentOutfit[slotKey].isOwned) {
        // ↓ Mサイズに戻す
        AppState.currentOutfit[slotKey].size = 'M';
        // ↓ ローカル保存
        saveScopedData('manekin_current_outfit', AppState.currentOutfit);
    }

    // ↓ パネル表示・ステージ位置・ストレージ・MySQL(即時)をすべて更新して完了通知
    syncAdjustPanelUI();
    // ↓ ステージスタイル更新
    applyFittingOffsets();
    // ↓ ローカル保存
    saveScopedData('manekin_fitting_offsets', AppState.fittingOffsets);
    // ↓ MySQL即時同期
    syncStudioStateToBackend({ immediate: true });
    // ↓ リセット完了通知
    showToastNotification(`「${getCategoryNameJP(slotKey.toUpperCase())}」の位置とサイズをリセットしました`);
}

/**
 * 性別ボタンUIの同期
 */
// ↓ MEN / WOMEN 切替ボタンの黒枠アクティブ表示を現在のAppState.studioGenderに一致させる関数
function syncGenderToggleUI() {
    // ↓ 現在の性別状態（既定MEN）
    const gender = AppState.studioGender || 'MEN';
    // ↓ MENボタン取得
    const btnMen = document.getElementById('btn-gender-men');
    // ↓ WOMENボタン取得
    const btnWomen = document.getElementById('btn-gender-women');
    // ↓ MEN選択時のみbtnMenをactiveに
    if (btnMen) btnMen.classList.toggle('active', gender === 'MEN');
    // ↓ WOMEN選択時のみbtnWomenをactiveに
    if (btnWomen) btnWomen.classList.toggle('active', gender === 'WOMEN');
}

/**
 * 性別切り替え
 */
// スタジオのマネキン表示対象性別（'MEN' または 'WOMEN'）を切り替える関数です
function setMannequinGender(gender) {
    // アプリ全体のスタジオ性別設定を新しい値に更新します
    AppState.studioGender = gender;
    // ログイン中のユーザーごとに分離した LocalStorage 領域へ保存します
    saveScopedData('manekin_studio_gender', gender);
    // MEN / WOMEN ボタンの active 見た目を同期します
    syncGenderToggleUI();
    // サーバー（MySQL）へ性別設定の変更を即時保存します（デバウンス待ちなし）
    syncStudioStateToBackend({ immediate: true });

    // ブランド商品リストを性別に連動して再描画
    // 選択された性別（またはユニセックス）に合う商品だけを表示し直します
    renderStudioBrandList();

    // 切り替え完了のトースト通知を出します
    showToastNotification(`マネキンモデルを「${gender}」に切り替えました`);
}

/**
 * モバイルビューの切り替え
 */
// スマホ・タブレット幅のとき「手持ちの服」「試着ステージ」「ブランド商品」を切り替える関数です
function switchMobileStudioView(viewKey) {
    // 現在のモバイル選択ビューを状態に保存します
    AppState.studioMobileView = viewKey;

    // 3つのモバイルタブボタンすべてについて、data-mobile-view が一致するボタンだけ active を付与します
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mobile-view') === viewKey);
    });

    // 3つのカラム要素（左・中央・右）のDOM参照を取得します
    const colCloset = document.getElementById('col-studio-closet');
    const colMannequin = document.getElementById('col-studio-mannequin');
    const colBrand = document.getElementById('col-studio-brand');

    // 選択されたビュー名に一致するカラムだけに mobile-active クラスを付けて画面に表示させます
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
// 現在マネキンに着せている組み合わせを解析してコメント・タグ・スコア・色ドットを更新します
function updateAIStylingComment() {
    // 現在の着用状態（outer / tops / bottoms / shoes / hat）を取得します
    const outfit = AppState.currentOutfit || {};
    // 画面下部のAI診断パネルにある各DOM要素を取得します
    const commentElem = document.getElementById('ai-comment-text');
    const tagsElem = document.getElementById('ai-tags-wrap');
    const dotsElem = document.getElementById('palette-dots');
    const scoreValElem = document.getElementById('ai-score-val');
    const scoreStarsElem = document.getElementById('ai-score-stars');

    // 各部位の値だけを取り出し、null/undefined を除外（filter(Boolean)）して着ている服だけの配列を作ります
    const wornItems = Object.values(outfit).filter(Boolean);

    // まだ1着も着せていない場合は初期案内テキストをセットして終了します
    if (wornItems.length === 0) {
        if (commentElem) {
            commentElem.textContent = '左側の「手持ちの服」または右側の「ブランド商品」をクリックすると、マネキンが試着しAIスタイリストがリアルタイムでコーディネート診断を行います。';
        }
        if (tagsElem) tagsElem.innerHTML = '<span class="ai-tag">#試着待ち</span>';
        if (dotsElem) dotsElem.innerHTML = '';
        if (scoreValElem) scoreValElem.textContent = '--点';
        if (scoreStarsElem) scoreStarsElem.textContent = '';
        // 未着用のためここで処理を終わります
        return;
    }

    // !! は値を真偽値（true / false）へ変換する記法です。どの部位を着用中か判定します
    const hasBottoms = !!outfit.bottoms;
    const hasTops = !!outfit.tops;
    const hasOuter = !!outfit.outer;
    const hasShoes = !!outfit.shoes;
    const hasHat = !!outfit.hat;

    // カラーパレット抽出
    // 着用アイテムごとの color 属性を取り出します（未設定は 'BLACK' とみなします）
    const colors = wornItems.map(item => item.color || 'BLACK');
    // Set オブジェクトで重複する色を除き、スプレッド構文 [... ] で配列に戻します
    const uniqueColors = [...new Set(colors)];

    // カラー構成ドット（丸い色見本）のHTMLを生成して挿入します
    if (dotsElem) {
        dotsElem.innerHTML = uniqueColors.map(c => `
            <span class="palette-dot" style="background-color: ${getColorHex(c)};" title="${c}" ></span>
                `).join('');
    }

    // AI診断ロジックの構築
    // 生成する診断文・スタイルタグ配列・スコアを格納する変数を初期化します
    let comment = '';
    let tags = [];
    let score = 95;

    // パターン1: 黒ボトムス + 白スニーカー + パーカー/トップス（要件例の完全再現）
    if (hasBottoms && hasShoes && outfit.bottoms.color === 'BLACK' && outfit.shoes.color === 'WHITE' && hasTops) {
        // モノトーンの王道バランスに対するコメントを組み立てます
        comment = `「${outfit.bottoms.name}」と「${outfit.tops.name}」の組み合わせは落ち着いた印象を与えます。足元の「${outfit.shoes.name}」がアクセントとなり、視線が自然に抜けるバランスの良いカジュアルコーデです。`;
        // さらにアウターも重ね着している場合は評価とスコア（98点）を上乗せします
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
        // 着用中の1着目を取り出し、次に合わせると良いカテゴリを提案します
        const singleItem = wornItems[0];
        comment = `「${singleItem.name}」を着用中。美しいカッティングが際立っています。さらに相性の良い${hasTops ? 'ボトムスや靴' : 'トップスやアウター'} を組み合わせると、全体のトータルバランスを診断できます。`;
        tags = ['#シルエット重視', '#スタイリング途中'];
        score = 90;
    }

    // 帽子のアクセント診断
    // 帽子が着用されている場合は追加コメントと小物タグを足します
    if (hasHat && outfit.hat) {
        comment += ` 頭元の「${outfit.hat.name}」が全体のアイキャッチとなり、こなれたストリート感を演出しています。`;
        // タグの重複追加を防ぐため includes() で未登録か確認してから push します
        if (!tags.includes('#アクセント小物')) tags.push('#アクセント小物');
    }

    // DOMへ反映
    // 生成した診断文・タグチップ・点数をそれぞれHTML要素へ書き込みます
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
// プリセットチップ（通学・デイリー等）が押されたときに保存名入力欄へ文字をセットします
function applyPresetName(name) {
    // コーデ名入力の input 要素を取得して value を書き換えます
    const input = document.getElementById('outfit-name-input');
    if (input) input.value = name;
}

// 保存・削除操作と非同期取得（syncOutfitsFromBackend）の競合を防ぐための操作カウンターです
let _outfitsMutationSeq = 0;

/**
 * コーデの保存処理 (MySQL連携・アカウント分離)
 */
// 「このコーデを保存する」フォーム送信時に実行される保存処理関数です
function handleSaveOutfit(e) {
    // form のデフォルト動作（ページ全体のリロード）をキャンセルします
    if (e) e.preventDefault();

    // ログインしていない場合は保存できないため警告を出して終了します
    if (!AppState.currentUser || !AppState.currentUser.id) {
        showToastNotification('⚠️ コーデを保存するにはログインが必要です');
        return;
    }

    // 現在マネキンに着せている服を配列として取得し、0着なら保存不可と通知します
    const wornItems = Object.values(AppState.currentOutfit).filter(Boolean);
    if (wornItems.length === 0) {
        showToastNotification('マネキンに服を1着以上着せてから保存してください');
        return;
    }

    // 現在のユーザーIDを控えます
    const userId = AppState.currentUser.id;
    // 入力されたコーデ名を取り出し、前後の空白（trim）を取り除きます
    const input = document.getElementById('outfit-name-input');
    const title = (input && input.value.trim()) ? input.value.trim() : 'マイスタイリングコーデ';

    // その時点のAIコメント文も一緒にルックブックへ記録するため取得します
    const commentElem = document.getElementById('ai-comment-text');
    const comment = commentElem ? commentElem.textContent : '';

    // 変更世代カウンターを増やします
    _outfitsMutationSeq++;
    // 新規保存用コーデオブジェクトを組み立てます
    const newOutfit = {
        // ユーザーIDと現在ミリ秒を組み合わせた一意なIDを作ります
        id: 'outfit-' + userId + '-' + Date.now(),
        // 所有ユーザーID
        user_id: userId,
        // コーデタイトル
        title: title,
        // 日本語形式（YYYY/MM/DD）の本日日付
        date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        // 診断コメント
        comment: comment,
        // JSON.parse(JSON.stringify(...)) によるディープコピーで現在の試着内容を独立保存します
        items: JSON.parse(JSON.stringify(AppState.currentOutfit)),
        // サーバー通信が成功するまではオフライン未同期印を付けておきます
        offlinePending: true
    };

    // 保存済み配列の先頭（unshift）へ新しいコーデを追加して先頭に表示されるようにします
    AppState.savedOutfits.unshift(newOutfit);
    // ユーザー専用のLocalStorage領域へ保存します
    saveScopedData('manekin_saved_outfits', AppState.savedOutfits, userId);

    // MySQLに保存
    // サーバー起動先URLを判定し、POST /api/outfits/save を呼び出します
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    fetch(`${apiBase}/api/outfits/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            id: newOutfit.id,
            title: newOutfit.title,
            date: newOutfit.date,
            comment: newOutfit.comment,
            items: newOutfit.items
        })
    }).then(res => {
        // HTTPステータスがエラーなら例外を投げて catch へ送ります
        if (!res.ok) throw new Error('API Error');
        // MySQL保存に成功したら未同期フラグを消してLocalStorageを更新します
        delete newOutfit.offlinePending;
        saveScopedData('manekin_saved_outfits', AppState.savedOutfits, userId);
    }).catch(err => {
        // サーバー未起動などで保存できなかった場合はフラグを true のまま残し、後から一括同期できるようにします
        newOutfit.offlinePending = true;
        saveScopedData('manekin_saved_outfits', AppState.savedOutfits, userId);
        console.warn('MySQLコーデ保存オフライン:', err);
    });

    // 保存完了の通知を表示し、名前入力欄を空に戻します
    showToastNotification(`「${title}」を保存しました！`);
    if (input) input.value = '';

    // バッジ等の更新
    renderManekinStudio(AppState.studioActiveTab);
}

/**
 * 保存したコーデ一覧（ルックブック）の描画
 */
// 「保存したコーデ」タブに表示するカード一覧を組み立てる関数です
function renderSavedOutfitsGrid() {
    // 一覧を表示するコンテナ要素を取得します
    const grid = document.getElementById('saved-outfits-grid');
    if (!grid) return;

    // 保存されたコーデが0件のときは、作成タブへ戻る案内カードを表示します
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

    // 各保存コーデをカードHTMLに変換して結合します
    grid.innerHTML = AppState.savedOutfits.map(outfit => {
        // コーデ内の5部位オブジェクトと、着用されている有効アイテム一覧を取り出します
        const items = outfit.items || {};
        const itemList = Object.values(items).filter(Boolean);

        // 各アイテムのミニ画像ストリップ（「手持ち」/「ブランド」タグ付き）を作成します
        const stripsHtml = itemList.map(it => `
            <div class="saved-strip-item" title="${it.name}" >
                <img src="${it.image}" alt="${it.name}" class="saved-strip-img" onerror="this.src='assets/images/men/スカイオックスフォードシャツ.png'">
                    <span class="saved-strip-tag">${it.isOwned ? '手持ち' : 'ブランド'}</span>
                </div>
        `).join('');

        // カード全体のHTMLを返します
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
// ルックブック上の保存コーデをクリックして、試着ステージへ再着用させる関数です
function restoreOutfit(outfitId) {
    // 指定されたIDの保存コーデを配列から検索します
    const target = AppState.savedOutfits.find(o => o.id === outfitId);
    // 見つからなければ何もしません
    if (!target) return;

    // 元の配列を破壊しないようディープコピーで現在の着用状態にセットします
    AppState.currentOutfit = JSON.parse(JSON.stringify(target.items));
    // LocalStorageとMySQLへ再現した試着状態を保存します
    saveScopedData('manekin_current_outfit', AppState.currentOutfit);
    syncStudioStateToBackend({ immediate: true });

    // 復元完了を通知し、試着作成タブ（create）へ自動で切り替えます
    showToastNotification(`「${target.title}」をマネキンに復元しました`);
    switchStudioTab('create');
}

/**
 * 保存コーデの削除 (MySQL連携・アカウント限定)
 */
// 保存済みコーディネートを1件削除する関数です
function deleteSavedOutfit(outfitId) {
    // ログインチェックを行います
    if (!AppState.currentUser || !AppState.currentUser.id) {
        showToastNotification('⚠️ ログインが必要です');
        return;
    }
    const userId = AppState.currentUser.id;
    // 誤操作防止のためブラウザ標準の confirm ダイアログで確認します
    if (confirm('この保存コーディネートを削除しますか？')) {
        // 削除世代カウンターを進めます
        _outfitsMutationSeq++;
        // 指定されたID以外のコーデだけを残すことで配列から削除します
        AppState.savedOutfits = AppState.savedOutfits.filter(o => o.id !== outfitId);
        // 更新後の配列をユーザー別LocalStorageに保存します
        saveScopedData('manekin_saved_outfits', AppState.savedOutfits, userId);

        // MySQL側からも削除するため DELETE リクエストを送ります（ID内の特殊文字をエスケープ）
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        fetch(`${apiBase}/api/outfits/delete/${encodeURIComponent(outfitId)}?user_id=${userId}`, { method: 'DELETE' })
            .catch(err => console.warn('MySQLコーデ削除オフライン:', err));

        // 通知と画面再描画を行います
        showToastNotification('コーディネートを削除しました');
        renderSavedOutfitsGrid();
        renderManekinStudio(AppState.studioActiveTab);
    }
}

/**
 * MySQLからログイン中アカウントだけの保存済みコーデを同期取得
 */
// サーバー上の saved_outfits テーブルからログインユーザー分のコーデを取得・統合する関数です
async function syncOutfitsFromBackend() {
    // 未ログインなら保存コーデ一覧を空にして戻ります
    if (!AppState.currentUser || !AppState.currentUser.id) {
        AppState.savedOutfits = [];
        return;
    }
    const targetUserId = AppState.currentUser.id;
    // サーバー発行IDでない場合はAPI取得をスキップします
    if (typeof isServerUserId === 'function' && !isServerUserId(targetUserId)) {
        return;
    }
    // 取得開始時点の操作シーケンスを記録します
    const fetchStartSeq = _outfitsMutationSeq;
    try {
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        // 該当ユーザーの保存コーデ一覧をGET取得します
        const res = await fetch(`${apiBase}/api/outfits/${targetUserId}`);
        if (res.ok) {
            const data = await res.json();
            // 通信中にユーザーが変わった場合は安全のため破棄します
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;
            // 通信中に新規保存や削除が行われていた場合も古い結果で上書きしないよう中止します
            if (fetchStartSeq !== _outfitsMutationSeq) return;
            if (Array.isArray(data.outfits)) {
                // ローカルにしかない未送信コーデ（offlinePending === true）を残して消えないように抽出します
                const offlinePending = (AppState.savedOutfits || []).filter(local =>
                    local &&
                    local.offlinePending === true &&
                    (!local.user_id || String(local.user_id) === String(targetUserId)) &&
                    !data.outfits.some(m => String(m.id) === String(local.id))
                );
                // 未送信分を先頭、MySQL分を後ろに結合した最新配列を作成します
                const merged = [...offlinePending, ...data.outfits];
                // 状態とLocalStorageを更新します
                AppState.savedOutfits = merged;
                saveScopedData('manekin_saved_outfits', merged, targetUserId);
                // タブバッジやホーム画面の「保存コーデ数」カウント表示を書き換えます
                const savedBadge = document.getElementById('studio-saved-badge');
                if (savedBadge) savedBadge.textContent = merged.length;
                const homeSaved = document.getElementById('home-stat-saved');
                if (homeSaved) homeSaved.innerHTML = `${merged.length} <small>組</small>`;
                // 現在保存済みコーデ一覧タブを開いていれば即座に一覧を再描画します
                if (AppState.studioActiveTab === 'saved') {
                    renderSavedOutfitsGrid();
                }
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
// 試着室の下にある「着用アイテムをカートに追加」ボタンから呼ばれる一括購入支援関数です
function addCurrentBrandItemsToCart() {
    // カート配列が未初期化なら空配列として用意します
    if (!AppState.cart || !Array.isArray(AppState.cart)) {
        AppState.cart = [];
    }
    const outfit = AppState.currentOutfit || {};
    // 着ている服のうち「手持ち服ではない（!it.isOwned）」ブランド商品だけを抽出します
    const brandItems = Object.values(outfit).filter(it => it && !it.isOwned);

    // ブランド商品が1つも試着されていなければメッセージを出して終了します
    if (brandItems.length === 0) {
        showToastNotification('現在マネキンが着用しているブランド商品はありません');
        return;
    }

    // 微調整パネルでユーザーが選んだ規格サイズ（XS〜XL）を参照するためのオフセット設定を取得します
    const offsets = AppState.fittingOffsets || {};
    // 着用中のブランド商品すべてを1着ずつカート配列へ追加します
    brandItems.forEach(item => {
        if (!item) return;
        // カテゴリからスロット名（tops, bottoms 等）を求めます
        const slotKey = getSlotKeyByCategory(item.category) || 'tops';
        // そのスロットで調整・選択された商品サイズを取り出します（未指定時は 'M'）
        const off = offsets[slotKey] || {};
        const chosenSize = item.size || off.brandSize || 'M';

        // すでに同じ商品・同じサイズがカートに入っていないか検索します
        const existing = AppState.cart.find(c => c && c.id === item.id && c.size === chosenSize);
        if (existing) {
            // すでに入っていれば数量だけを +1 増やします
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            // 無ければ新しいカート項目オブジェクトを配列末尾へ追加します
            AppState.cart.push({
                id: item.id,
                name: item.name || '商品',
                category: item.category || 'TOPS',
                color: item.color || 'BLACK',
                size: chosenSize,
                price: item.price || 0,
                quantity: 1,
                image: item.image || getCategoryFallbackImage(item.category)
            });
        }
    });

    // カート情報をアカウント別のLocalStorageへ保存し、ヘッダー等のバッジ件数を更新します
    saveScopedData('manekin_cart', AppState.cart);
    updateCartBadge();
    // MySQLのcartsテーブル同期関数が存在すれば呼び出して永続化します
    if (typeof syncCartToBackend === 'function') {
        syncCartToBackend();
    }
    // 追加点数をトーストで知らせます
    showToastNotification(`試着中のブランドアイテム（${brandItems.length}点）をカートに追加しました！`);
}

// --------------------------------------------------------------------------
// 15.7 手持ち服の登録モーダル処理
// --------------------------------------------------------------------------

// 手持ち服登録モーダルを開く関数です
function openAddClosetModal() {
    // モーダル要素を取得します
    const modal = document.getElementById('modal-add-closet');
    if (modal) {
        // 表示用CSSクラス（open と active）を付与してポップアップ表示します
        modal.classList.add('open');
        modal.classList.add('active');
        // 背景クリックで閉じる処理
        // 白いダイアログの外側（暗い背景幕そのもの）がクリックされたときだけモーダルを閉じます
        modal.onclick = function (e) {
            if (e.target === modal) closeAddClosetModal();
        };
    }
}

// 手持ち服登録モーダルを閉じ、アップロード画像やAI診断結果・フォームを初期化する関数です
function closeAddClosetModal() {
    const modal = document.getElementById('modal-add-closet');
    if (modal) {
        modal.classList.remove('open');
        modal.classList.remove('active');
    }
    // 次回開いたときに前回の写真や診断結果が残らないよう管理変数をすべて空に戻します
    currentClosetUploadDataUrl = '';
    originalClosetUploadDataUrl = '';
    isCurrentUploadTransparent = false;
    currentAiAnalysisResult = null;
    // AI形状診断カードの表示を非表示へリセットします
    updateAiDiagnosisUI(null);

    // プレビュー・プレースホルダー・バッジ・ボタン・オーバーレイの各DOM要素を取得します
    const preview = document.getElementById('closet-img-preview');
    const placeholder = document.getElementById('closet-img-placeholder');
    const badgeTrans = document.getElementById('preview-badge-transparent');
    const actionBtns = document.getElementById('ai-action-btns');
    const overlay = document.getElementById('ai-processing-overlay');

    // 画像プレビューを隠して透明状態クラスを外します
    if (preview) {
        preview.style.display = 'none';
        preview.classList.remove('is-transparent');
    }
    if (badgeTrans) badgeTrans.style.display = 'none';
    if (actionBtns) actionBtns.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    // 点線枠内の「写真を選択・撮影する」案内を再表示します
    if (placeholder) placeholder.style.display = 'block';

    // テキスト入力欄やラジオボタンの選択状態を初期状態へリセットします
    const form = document.getElementById('form-add-closet');
    if (form) form.reset();
}

/**
 * 画像リサイズ前処理（AI処理の高速化・メモリ節約）
 */
// スマホの高解像度写真を最大 maxDim px (既定 1024px) 以下に縮小し、AI透過処理の負担を軽くする関数です
function resizeImageForAi(imageSource, maxDim = 1024) {
    // テスト環境等で Image クラスが存在しない場合はそのまま返します
    if (typeof Image === 'undefined') return Promise.resolve(imageSource);
    // 画像の読み込みとCanvas変換を非同期に完了通知するため Promise を返します
    return new Promise((resolve) => {
        // メモリ上で画像を読み込むための Image オブジェクトを作ります
        const img = new Image();
        // CORS（他ドメイン画像読み込み制限）によるCanvas汚染を防ぐ設定です
        img.crossOrigin = 'anonymous';
        // 画像のロードが完了したあとのサイズ確認＆縮小処理です
        img.onload = () => {
            let width = img.width;
            let height = img.height;
            // 元画像の縦横どちらも maxDim 以下ならリサイズ不要なので元の画像データを返します
            if (width <= maxDim && height <= maxDim) {
                resolve(imageSource);
                return;
            }
            // 長辺が maxDim になるよう、元の縦横比（アスペクト比）を保ったままサイズを計算します
            if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
            } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
            }
            // 画面に見えない一時Canvasを作り、縮小後のサイズで描画します
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            // Canvas内容を PNG形式の Blob（バイナリデータ）に変換して呼び出し元へ渡します
            canvas.toBlob((blob) => {
                resolve(blob || imageSource);
            }, 'image/png');
        };
        // もし画像読み込みが失敗しても処理を止めないよう元データを返します
        img.onerror = () => resolve(imageSource);

        // 引数が文字列（URLやBase64）か Blob（選択ファイル）かに応じて img.src へセットします
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
// 受け取った画像から背景だけを切り抜いて透明PNGの Blob を返す非同期関数です
async function runAiBackgroundRemoval(imageSource) {
    // グローバルまたは動的インポートでモジュール取得
    // index.html の module script で事前読み込みした関数を取り出します
    let removeBgFunc = window.imglyRemoveBackground;
    // まだ読み込めていなかった場合はこの場で CDN から動的 import を試みます
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

    // 進捗バーオーバーレイの各UI要素を取得します
    const overlay = document.getElementById('ai-processing-overlay');
    const progressFill = document.getElementById('ai-progress-fill');
    const progressPct = document.getElementById('ai-progress-percent');
    const subtitle = document.getElementById('ai-status-subtitle');

    // 処理中オーバーレイを表示し、進捗バーを 0% に初期化します
    if (overlay) overlay.style.display = 'flex';
    if (progressFill) progressFill.style.width = '0%';
    if (progressPct) progressPct.textContent = '0%';
    if (subtitle) subtitle.textContent = 'AIモデルを初期化中...';

    // 高解像度画像の場合は1024pxにリサイズして高速化
    const resizedSource = await resizeImageForAi(imageSource, 1024);

    // @imgly ライブラリへ渡す設定オプション（使用モデルサイズと進捗コールバック）です
    const config = {
        model: 'small', // small: 約40MBの軽量モデル。服の輪郭切り抜きに十分な精度で高速
        // モデルダウンロードや画像推論の進行状況が通知されるたびに呼ばれます
        progress: (key, current, total) => {
            if (total > 0) {
                // 0〜100% に丸めた進捗率を計算し、プログレスバーと数値表示をリアルタイム更新します
                const pct = Math.min(100, Math.round((current / total) * 100));
                if (progressFill) progressFill.style.width = `${pct}%`;
                if (progressPct) progressPct.textContent = `${pct}%`;
                if (subtitle) {
                    // AI重みファイルのダウンロード段階か、画像の輪郭解析段階かを文言で出し分けます
                    if (key.includes('model') || key.includes('onnx')) {
                        subtitle.textContent = `AIモデル読込中... (${pct}%)`;
                    } else {
                        subtitle.textContent = `服の輪郭をAI解析・透過処理中... (${pct}%)`;
                    }
                }
            }
        }
    };

    // AI背景削除を実行し、完了または失敗のどちらでも必ずオーバーレイを閉じるよう処理します
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
// 選択またはAI透過した画像をアップロード枠のプレビューエリアに表示し、操作ボタンを整える関数です
function updateClosetPreviewUI(imgUrl, isTransparent = false) {
    const preview = document.getElementById('closet-img-preview');
    const previewImg = document.getElementById('closet-preview-img');
    const placeholder = document.getElementById('closet-img-placeholder');
    const badgeTrans = document.getElementById('preview-badge-transparent');
    const actionBtns = document.getElementById('ai-action-btns');

    if (preview && previewImg && placeholder) {
        // 画像を表示し、元の点線プレースホルダーを隠します
        previewImg.src = imgUrl;
        preview.style.display = 'flex';
        placeholder.style.display = 'none';

        // 背景透過済みかどうかで市松模様背景クラスと「✨ 背景透過済み」バッジを切り替えます
        if (isTransparent) {
            preview.classList.add('is-transparent');
            if (badgeTrans) badgeTrans.style.display = 'block';
        } else {
            preview.classList.remove('is-transparent');
            if (badgeTrans) badgeTrans.style.display = 'none';
        }

        // 「背景を透過」ボタンと「元写真に戻す」ボタンの表示を状態に合わせて排他的に切り替えます
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
// 最新の判定結果オブジェクトを保持（登録ボタン押下時の可否チェックに使います）
let currentAiAnalysisResult = null;
// MobileNet モデルを初回のみロードして使い回すための Promise キャッシュです
let _mobilenetModelPromise = null;

/**
 * MobileNet画像分類AIモデルの遅延ロード
 */
// 必要なときに初めて MobileNet モデルをメモリへ読み込み、以降は同じモデルを再利用します
function getMobileNetModel() {
    // ライブラリが読み込まれていない場合（オフライン等）は null を返します
    if (!window.mobilenet) return Promise.resolve(null);
    if (!_mobilenetModelPromise) {
        // 軽量版 MobileNet v2（alpha=0.5）を読み込み、失敗時は幾何学形状解析のみで動かせるよう null へフォールバックします
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
// 診断中／判定OK／判定NG の状態に応じてモーダル内の結果カード表示を切り替える関数です
function updateAiDiagnosisUI(result, isAnalyzing = false) {
    const card = document.getElementById('ai-diagnosis-card');
    const badge = document.getElementById('ai-diag-badge');
    const badgeText = document.getElementById('ai-diag-badge-text');
    const spinner = document.getElementById('ai-diag-spinner');
    const confidence = document.getElementById('ai-diag-confidence');
    const title = document.getElementById('ai-diag-title');
    const desc = document.getElementById('ai-diag-desc');

    if (!card) return;

    // 診断実行中の表示（ローディングスピナー＋解析中メッセージ）
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

    // 結果が null（初期化時）なら診断カードを隠して終了します
    if (!result) {
        card.style.display = 'none';
        return;
    }

    // 結果が確定したのでカードを表示し、スピナーを止めます
    card.style.display = 'block';
    if (spinner) spinner.style.display = 'none';

    // 対象の5カテゴリの服・小物と判定された場合（OK表示＋カテゴリラジオボタン自動選択）
    if (result.isValid) {
        card.className = 'ai-diagnosis-card is-valid';
        if (badgeText) badgeText.textContent = 'AI形状判定: OK';
        if (confidence) confidence.textContent = `${result.confidence}% 適合`;
        if (title) title.textContent = result.title;
        if (desc) desc.textContent = result.desc;

        // カテゴリラジオボタンを自動選択
        // AIが推測したカテゴリ（HAT / TOPS / BOTTOMS / OUTER / SHOES）に一致するラジオボタンへ自動でチェックを入れます
        if (result.category) {
            const radio = document.querySelector(`input[name="closet_category"][value="${result.category}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    } else {
        // 服以外（風景・書類・その他物体）または判別不能とされた場合（赤色の警告カード表示）
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
// Canvas でのピクセル輪郭解析と MobileNet 画像分類AIを組み合わせて、写真の対象カテゴリと登録可否を診断するメイン関数です
async function analyzeClothingItemShape(source) {
    // 非同期完了を待つ Promise を返します
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
            try {
                // 1. オフスクリーンCanvasで180x180にリサイズ描画してピクセル解析
                // 計算速度と特徴抽出精度を両立するため 180x180 ピクセルのキャンバスを作成します
                const canvas = document.createElement('canvas');
                const cw = 180;
                const ch = 180;
                canvas.width = cw;
                canvas.height = ch;
                // 頻繁にピクセル読み取り（getImageData）を行うため最適化ヒント willReadFrequently: true を付けます
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                ctx.drawImage(img, 0, 0, cw, ch);

                // 画像全ピクセルの RGBA（赤・緑・青・不透明度）の一次元配列を取り出します
                const imgData = ctx.getImageData(0, 0, cw, ch);
                const data = imgData.data;

                // 2. 背景透過度および色差による被写体マスク作成
                // インデックス 3, 7, 11...（4つおき）に入っている Alpha 値を合計して、背景透過画像か判定します
                let totalAlpha = 0;
                for (let i = 3; i < data.length; i += 4) {
                    totalAlpha += data[i];
                }
                // 平均アルファ値が 240 未満なら「すでに背景透過済みの画像」とみなします
                const isAlreadyTransparent = (totalAlpha / (cw * ch)) < 240;

                // 四隅の平均背景色（非透過画像用）
                // 背景透過していない写真の場合は、画像の四隅8点の色をサンプルとして平均背景色を求めます
                let bgR = 0, bgG = 0, bgB = 0, bgSamples = 0;
                const cornerCoords = [
                    [5, 5], [cw - 5, 5], [5, ch - 5], [cw - 5, ch - 5],
                    [10, 10], [cw - 10, 10], [10, ch - 10], [cw - 10, ch - 10]
                ];
                // 8座標のRGB値を合算してサンプル数で割ります
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

                // 各ピクセルが前景（服=1）か背景（=0）かを記録する高速な Uint8Array マスクと外接矩形の座標を準備します
                const mask = new Uint8Array(cw * ch);
                let fgCount = 0;
                let minX = cw, maxX = 0, minY = ch, maxY = 0;

                // 全ピクセル (180 x 180) を走査し、被写体ピクセルをマスクへ登録します
                for (let y = 0; y < ch; y++) {
                    for (let x = 0; x < cw; x++) {
                        const idx = (y * cw + x) * 4;
                        const r = data[idx];
                        const g = data[idx + 1];
                        const b = data[idx + 2];
                        const a = data[idx + 3];

                        // 前景（アイテム部分）かどうかを判定します
                        let isFg = false;
                        if (isAlreadyTransparent) {
                            // 透過画像なら不透明度 a > 35 のピクセルを服として拾います
                            isFg = a > 35;
                        } else {
                            // 非透過画像なら、四隅の平均背景色との色距離（3次元ユークリッド距離）が 25 を超える部分を被写体とします
                            const diff = Math.hypot(r - bgR, g - bgG, b - bgB);
                            isFg = (diff > 25) || (a < 220);
                        }

                        // 前景ピクセルならマスクを立て、前景面積カウントと外接矩形（上下左右の端）を更新します
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

                // 画像全体のうち被写体が占める面積割合（占有率）を計算します
                const coverage = fgCount / (cw * ch);

                // 被写体が小さすぎる・あるいは画像全体がベタ塗り/無背景
                // 被写体が全体の 3.5% 未満または 200ピクセル未満なら検出不能（NG）として返します
                if (coverage < 0.035 || fgCount < 200) {
                    return resolve({
                        isValid: false,
                        category: null,
                        confidence: 0,
                        title: 'アイテムが検出できません',
                        desc: '服や靴、帽子がはっきりと写った写真を選択してください。'
                    });
                }

                // 外接矩形の幅・高さ・縦横比（アスペクト比）・矩形内の充填率を計算します
                const boxW = Math.max(1, maxX - minX + 1);
                const boxH = Math.max(1, maxY - minY + 1);
                const aspectRatio = boxH / boxW; // 縦横比
                const boxFillRatio = fgCount / (boxW * boxH); // 充填率

                // 四角い写真（書類や壁、風景写真、スクショなど）は充填率が95%超で服の輪郭がない
                // 画像の大部分を占めつつ長方形にベタッと埋まっている場合は「服の切り抜き形状がない」として拒否します
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
                // 被写体の高さ（boxH）を上から下まで10等分（スライス0〜9）し、シルエットの横幅の変化を測ります
                const sliceH = boxH / 10.0;
                // 各スライスの横幅比率（0.0〜1.0）を格納する配列です
                const sliceWidths = [];
                let crotchSlices = 0; // 二股（股下）スライス数
                // 最も横幅が広いスライスの位置番号（0〜9）と最大幅を記録します
                let maxSliceIdx = 0;
                let maxSliceWidth = 0;

                // 0番目（最上部）から9番目（最下部）までの10スライスを順番に解析します
                for (let s = 0; s < 10; s++) {
                    // 現在のスライス s の上端Y座標（sy1）と下端Y座標（sy2）を求めます
                    const sy1 = Math.floor(minY + s * sliceH);
                    const sy2 = Math.min(ch, Math.floor(minY + (s + 1) * sliceH));
                    // このスライス帯の中で前景が存在するX列の数（実効横幅）です
                    let rowCount = 0;
                    // 直前のX列に前景があったかを覚えるフラグと、背景→前景への切り替え回数です
                    let prevWasFg = false;
                    let transitions = 0;

                    // 左端 minX から右端 maxX まで左から右へ横方向スキャンします
                    for (let x = minX; x <= maxX; x++) {
                        let colHasFg = false;
                        // X列の縦区間（sy1〜sy2）に1ピクセルでも前景が含まれていれば「列に服がある」と判断します
                        for (let y = sy1; y < sy2; y++) {
                            if (mask[y * cw + x]) {
                                colHasFg = true;
                                break;
                            }
                        }
                        // 横断スキャン中に「背景→前景」の切り替わり（transitions）が2回以上起きると左右の脚に分かれた二股と判定できます
                        if (colHasFg) {
                            rowCount++;
                            if (!prevWasFg) transitions++;
                            prevWasFg = true;
                        } else {
                            prevWasFg = false;
                        }
                    }

                    // 全体横幅 boxW に対するこのスライスの横幅比率を記録します
                    sliceWidths.push(rowCount / boxW);
                    // これまでの最大幅を超えた場合、一番広いスライス位置を更新します（Tシャツの肩や袖の位置検出に利用）
                    if (rowCount / boxW > maxSliceWidth) {
                        maxSliceWidth = rowCount / boxW;
                        maxSliceIdx = s;
                    }

                    // 二股判定: スライス4以降（下半分）で2回以上のブロック開始があれば二股
                    if (transitions >= 2 && s >= 4) {
                        crotchSlices++;
                    }
                }

                // 上部（スライス0・1平均）・中部（4・5平均）・下部（8・9平均）のシルエット幅を算出します
                const topW = (sliceWidths[0] + sliceWidths[1]) / 2;
                const midW = (sliceWidths[4] + sliceWidths[5]) / 2;
                const bottomW = (sliceWidths[8] + sliceWidths[9]) / 2;

                // 4. カテゴリスコアリング
                // 5カテゴリそれぞれに基礎点 10 を入れ、形状の特徴が当てはまるたびに加点していきます
                const scores = {
                    BOTTOMS: 10,
                    SHOES: 10,
                    HAT: 10,
                    TOPS: 10,
                    OUTER: 10
                };

                // BOTTOMS 特徴: 縦長 (AR >= 1.25) かつ下半分が二股、または台形Aライン
                // 縦横比が縦長で、下半分の二股スライス（股下）が多ければボトムスの点数を高くします
                if (aspectRatio >= 1.25) scores.BOTTOMS += 35;
                if (aspectRatio >= 1.5) scores.BOTTOMS += 20;
                if (crotchSlices >= 2) scores.BOTTOMS += 45;
                if (topW < 0.8 && bottomW > 0.4 && crotchSlices >= 1) scores.BOTTOMS += 20;

                // SHOES 特徴: 横長〜スクエア (AR <= 1.15)、底面がフラットで広い、履き口
                // 横幅が広くて靴底部分がしっかり詰まっており、股割れが無い形状に靴スコアを加点します
                if (aspectRatio <= 1.1) scores.SHOES += 35;
                if (aspectRatio <= 0.85) scores.SHOES += 25;
                if (bottomW >= 0.65) scores.SHOES += 25;
                if (crotchSlices === 0) scores.SHOES += 10;

                // HAT 特徴: スクエア〜やや横長 (0.55 <= AR <= 1.25)、上部が丸いドーム、ツバ
                // 最上部が細く丸みを帯び（sliceWidths[0] < 0.4）、クラウン〜ツバ（[2]）で広がる形に帽子スコアを加点します
                if (aspectRatio >= 0.55 && aspectRatio <= 1.25) scores.HAT += 30;
                if (sliceWidths[0] < 0.4 && sliceWidths[2] > 0.6) scores.HAT += 35; // ドーム形状
                if (crotchSlices === 0) scores.HAT += 15;

                // TOPS 特徴: T字型（肩・袖の張り出し）、0.75 <= AR <= 1.45、裾が二股でない
                // 上から2〜4段目付近（肩・袖の位置）が最も横幅が広いシルエットにトップススコアを加点します
                if (aspectRatio >= 0.75 && aspectRatio <= 1.45) scores.TOPS += 25;
                if (maxSliceIdx >= 1 && maxSliceIdx <= 3) scores.TOPS += 35; // 上部袖の広がり
                if (crotchSlices <= 1) scores.TOPS += 20;

                // OUTER 特徴: コート・ジャケット（T字型で縦長 AR >= 1.15）
                // トップス同様に上部が広がりつつ着丈が長めの縦長シルエットにアウタースコアを加点します
                if (aspectRatio >= 1.15 && aspectRatio <= 2.2) scores.OUTER += 30;
                if (maxSliceIdx >= 1 && maxSliceIdx <= 4) scores.OUTER += 25;
                if (crotchSlices <= 1) scores.OUTER += 15;

                // 5. MobileNet AI による分類アシスト（利用可能な場合）
                // 犬・車・パソコン・食べ物などの「服ではない物」が混入した場合にブロックするためのフラグです
                let isNonClothingAi = false;
                // MobileNet がロード済み・通信可能であれば画像認識推論を実行してスコアを補強します
                try {
                    const model = await getMobileNetModel();
                    if (model) {
                        // 180x180キャンバス画像をAIモデルへ入力し、可能性の高い物体名トップ候補を取得します
                        const predictions = await model.classify(canvas);
                        if (predictions && predictions.length > 0) {
                            const top = predictions[0];
                            // モデルが返した英語の物体クラス名を小文字にして判定しやすくします
                            const label = (top.className || '').toLowerCase();

                            // 非衣類キーワードの検出
                            // 動物・食べ物・車両・家電・家具などの代表単語リストと照合します
                            const nonClothingKeywords = [
                                'dog', 'cat', 'bird', 'animal', 'pizza', 'sandwich', 'burger', 'food',
                                'car', 'vehicle', 'truck', 'traffic', 'computer', 'laptop', 'cellular',
                                'phone', 'book', 'bottle', 'cup', 'mug', 'desk', 'chair', 'table'
                            ];
                            // 最有力候補に非衣類ワードが含まれ確信度 25% 超なら「ファッション外」と確定します
                            for (const kw of nonClothingKeywords) {
                                if (label.includes(kw) && top.probability > 0.25) {
                                    isNonClothingAi = true;
                                    break;
                                }
                            }

                            // ファッションキーワード照合
                            // 靴・帽子・パンツ・コート・シャツ等の英語ラベルと一致した場合、該当カテゴリへ大きく +60点 加点します
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
                    // オフライン等で MobileNet が使えなくても上の「10スライス幾何学形状スコア」でそのまま判定を続行します
                    console.warn('AIモデル判定スキップ:', e);
                }

                // AIが明らかな非衣類と判断した場合
                // 服・靴・帽子以外と判明した写真をクローゼット登録できないよう NG 結果を返します
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
                // 5カテゴリ（OUTER / BOTTOMS / TOPS / SHOES / HAT）の中で最も高い得点を得たカテゴリを選びます
                let bestCategory = 'TOPS';
                let highestScore = -1;
                for (const cat in scores) {
                    if (scores[cat] > highestScore) {
                        highestScore = scores[cat];
                        bestCategory = cat;
                    }
                }

                // 最低適合スコアの基準（服・靴・帽子としての十分な特徴があるか）
                // 最高点でも 45点 未満しか特徴が取れなかった曖昧な画像は登録不可とします
                if (highestScore < 45) {
                    return resolve({
                        isValid: false,
                        category: null,
                        confidence: 0,
                        title: '服の形状が特定できません',
                        desc: 'アウター、ボトムス、トップス、靴、帽子のいずれかの形状がはっきりわかる写真をご使用ください。'
                    });
                }

                // 判定結果カードに表示するカテゴリごとのわかりやすい日本語名称マップです
                const catNames = {
                    OUTER: 'アウター (コート/ジャケット形状)',
                    BOTTOMS: 'ボトムス (パンツ/スラックス形状)',
                    TOPS: 'トップス (Tシャツ/スウェット形状)',
                    SHOES: '靴 (スニーカー/シューズ形状)',
                    HAT: '帽子 (キャップ/ハット形状)'
                };

                // UI表示用の適合パーセンテージ（82%〜99%の範囲に調整）を計算します
                const confidence = Math.min(99, Math.max(82, Math.round(highestScore * 0.95)));

                // 判定成功オブジェクトを呼び出し元へ返し、カテゴリラジオ自動選択へ進みます
                resolve({
                    isValid: true,
                    category: bestCategory,
                    confidence: confidence,
                    title: `✨ AI形状認識: ${catNames[bestCategory]}`,
                    desc: 'マイクローゼットに登録可能です。カテゴリを自動選択しました。'
                });

            } catch (err) {
                // Canvasのセキュリティ制限や予期せぬエラー時は登録自体は止めないようフォールバック結果を返します
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

        // 画像ファイルが壊れているなどで読み込めなかった場合はエラー扱い（登録不可）を返します
        img.onerror = () => {
            resolve({
                isValid: false,
                category: null,
                confidence: 0,
                title: '画像の読み込みに失敗しました',
                desc: '有効な画像ファイルを選択してください。'
            });
        };

        // 入力ソースの種類（文字列URL/DataURL か Blobオブジェクトか）に合わせて画像読み込みを開始します
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
// ユーザーが画像を選んだあと、まずAI背景透過を実行し、その切り抜き後画像に対してAI形状判定を実行する一連のフローです
async function processClosetImageWithAi(source) {
    try {
        // 1. @imgly AI で背景を透明化した Blob 画像を受け取ります
        const blob = await runAiBackgroundRemoval(source);
        // Blob を <img src> や保存用に扱いやすい DataURL（Base64文字列）へ変換するため FileReader を使います
        const reader = new FileReader();
        reader.onload = async function (evt) {
            // 透過済み画像URLをステートに保存し、プレビュー枠とトースト通知を更新します
            currentClosetUploadDataUrl = evt.target.result;
            isCurrentUploadTransparent = true;
            updateClosetPreviewUI(currentClosetUploadDataUrl, true);
            showToastNotification('✨ AIが服の背景を綺麗に切り抜きました！');

            // 背景透過後の画像でAI形状診断を実行
            // 透明背景になった輪郭だけの画像を使うことで形状解析の精度をさらに高めます
            updateAiDiagnosisUI(null, true);
            currentAiAnalysisResult = await analyzeClothingItemShape(currentClosetUploadDataUrl);
            updateAiDiagnosisUI(currentAiAnalysisResult, false);
        };
        // Blob の読み込みを開始します（完了すると上の onload が発火します）
        reader.readAsDataURL(blob);
    } catch (err) {
        // AI透過に失敗した場合（オフライン等）は元の画像をそのままセットし、元画像で形状診断だけ行います
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
// 手持ち写真がない場合のお試し用ボタン（黒キャップ、白スニーカー等）を押したときにフォームを一括入力する関数です
function selectPresetImage(presetKey, presetName) {
    // 定義済みプリセット辞書から該当データを引きます
    const preset = PRESET_CLOSET_PRESETS[presetKey];
    if (!preset) return;

    // 元画像・現在画像の両方にプリセット画像のパスを設定します（プリセットは透過処理不要）
    originalClosetUploadDataUrl = preset.image;
    currentClosetUploadDataUrl = preset.image;
    isCurrentUploadTransparent = false;

    // プレビュー欄に画像を表示します
    updateClosetPreviewUI(preset.image, false);

    // 商品名入力欄へプリセット名を自動入力します
    const nameInput = document.getElementById('closet-item-name');
    if (nameInput) nameInput.value = preset.name;

    // 該当カテゴリのラジオボタンをチェック状態にします
    const catRadio = document.querySelector(`input[name="closet_category"][value="${preset.category}"]`);
    if (catRadio) catRadio.checked = true;

    // 色と着用季節のセレクトボックスもプリセットに合わせてセットします
    const colorSelect = document.getElementById('closet-item-color');
    if (colorSelect) colorSelect.value = preset.color;

    const seasonSelect = document.getElementById('closet-item-season');
    if (seasonSelect) seasonSelect.value = preset.season;

    // プリセット用AI診断結果を設定
    // 公式データは事前に検証済みのため適合度 100% として診断カードを即座に OK 表示にします
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
// <input type="file"> でユーザーが画像ファイルを選んだ瞬間に呼ばれるイベントハンドラです
function handleClosetImageSelect(e) {
    // 選択された先頭のファイルオブジェクトを取得します（キャンセル時はそのまま終了）
    const file = e.target.files[0];
    if (!file) return;

    // まず元画像をブラウザ内で読み込み、プレビューおよび元写真復元用に保存します
    const reader = new FileReader();
    reader.onload = async function (evt) {
        originalClosetUploadDataUrl = evt.target.result;
        currentClosetUploadDataUrl = evt.target.result;
        isCurrentUploadTransparent = false;

        // 診断中ステータスを表示
        updateAiDiagnosisUI(null, true);

        // 「✨ AIで背景を自動透過する」チェックボックスがONになっているか確認します（?. は要素がnullでもエラーにしないオプショナルチェーン）
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
    // ローカルファイルを Base64 DataURL として読み込み開始します
    reader.readAsDataURL(file);
}

/**
 * 手動で「🪄 背景を透過」ボタンをクリックした時
 */
// 自動透過がOFFのときに後から手動で背景切り抜きをかけたい場合に呼ばれる関数です
async function triggerManualBgRemoval() {
    // 元画像（または現在の画像）を対象にAI透過フローを実行します
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
// 背景切り抜きを取り消して最初に選んだ元画像に戻し、改めて形状判定を実行する関数です
async function restoreOriginalUploadImage() {
    if (!originalClosetUploadDataUrl) return;
    currentClosetUploadDataUrl = originalClosetUploadDataUrl;
    isCurrentUploadTransparent = false;
    updateClosetPreviewUI(originalClosetUploadDataUrl, false);
    showToastNotification('元の写真に戻しました');

    // 元写真に対して再度AI形状診断を実行します
    updateAiDiagnosisUI(null, true);
    currentAiAnalysisResult = await analyzeClothingItemShape(originalClosetUploadDataUrl);
    updateAiDiagnosisUI(currentAiAnalysisResult, false);
}

// クローゼット追加・削除操作の順番を記録し、古いGET取得結果での上書きを防ぐ世代カウンターです
let _closetMutationSeq = 0;

// 外部ファイル（shop.js の購入後クローゼット自動保存等）からも操作カウンターを進められるようにするヘルパー関数です
function bumpClosetMutationSeq() {
    _closetMutationSeq++;
}

/**
 * 新規手持ち服の登録（AI形状チェック付き：アウター/ボトムス/トップス/靴/帽子のみ保存可能）
 */
// 手持ち服登録モーダルのフォーム送信時に呼ばれ、AI検証とアカウント別保存・MySQL送信を行う関数です
function handleAddClosetItem(e) {
    // フォーム標準のページ再読み込みを防ぎます
    if (e) e.preventDefault();

    // 1. 画像チェック
    // 画像がまだ選択されていない場合はアップロード枠までスクロールして入力を促します
    if (!currentClosetUploadDataUrl) {
        showToastNotification('⚠️ 服の写真を選択または撮影してください');
        const uploadBox = document.getElementById('closet-upload-box');
        if (uploadBox) uploadBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // 2. AI形状・アイテム診断チェック（非衣類・不適合画像はブロック）
    // analyzeClothingItemShape() が対象外（食べ物・風景・書類など）と判定した写真は登録を拒否します
    if (currentAiAnalysisResult && !currentAiAnalysisResult.isValid) {
        showToastNotification(`⚠️ 登録できません: ${currentAiAnalysisResult.title}。アウター、ボトムス、トップス、靴、帽子の写真のみ登録可能です`);
        const diagCard = document.getElementById('ai-diagnosis-card');
        if (diagCard) diagCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // 服の名前を取得し、空文字ならフォーカスを当てて入力を促します
    const nameInput = document.getElementById('closet-item-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        showToastNotification('服の名前を入力してください');
        if (nameInput) nameInput.focus();
        return;
    }

    // 未ログイン状態での登録を防ぎ、必ず特定アカウントへ紐付けます
    if (!AppState.currentUser || !AppState.currentUser.id) {
        showToastNotification('⚠️ クローゼットへの登録にはログインが必要です');
        return;
    }
    const userId = AppState.currentUser.id;

    // 選択されたカテゴリ（ラジオボタン）、メインの色、着用季節をフォームから取得します
    const catInput = document.querySelector('input[name="closet_category"]:checked');
    const category = catInput ? catInput.value : 'BOTTOMS';

    const colorSelect = document.getElementById('closet-item-color');
    const color = colorSelect ? colorSelect.value : 'BLACK';

    const seasonSelect = document.getElementById('closet-item-season');
    const season = seasonSelect ? seasonSelect.value : '通年';

    // クローゼット更新世代カウンターを進め、非同期取得の上書きを防ぎます
    _closetMutationSeq++;
    // 新規登録する手持ち服オブジェクトを構築します
    const newItem = {
        // 'c-ユーザーID-タイムスタンプ' で他アカウントと衝突しない固有IDを作成します
        id: 'c-' + userId + '-' + Date.now(),
        user_id: userId,
        name: name,
        category: category,
        color: color,
        season: season,
        // 背景透過済みまたは元画像の DataURL / パス
        image: currentClosetUploadDataUrl,
        // ユーザーが登録した手持ち品であることを示すフラグです
        isOwned: true,
        // MySQL送信完了までは未同期印（offlinePending）を立てておきます
        offlinePending: true
    };

    // リストの先頭へ追加し、すぐにアカウント専用LocalStorageへ保存して画面反映に備えます
    AppState.myCloset.unshift(newItem);
    saveScopedData('manekin_my_closet', AppState.myCloset, userId);

    // MySQL (closet_items テーブル) にも即座に保存
    // サーバー接続URLを自動判定し、POST /api/closet/add を実行します
    const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
    fetch(`${apiBase}/api/closet/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            id: newItem.id,
            name: newItem.name,
            category: newItem.category,
            color: newItem.color,
            season: newItem.season,
            image: newItem.image,
            isOwned: true,
            isPurchased: false
        })
    }).then(res => {
        // HTTP応答が失敗なら catch ブロックへ流します
        if (!res.ok) throw new Error('API Error');
        // 成功レスポンスをJSONとして読み取ります
        return res.json();
    }).then(data => {
        // MySQL側で正しく保存されたら未同期フラグを外しLocalStorageを更新します
        if (data.status === 'success') {
            delete newItem.offlinePending;
            saveScopedData('manekin_my_closet', AppState.myCloset, userId);
            console.log('✨ [MySQL] マイクローゼットにアイテムを保存しました:', data);
        } else {
            throw new Error(data.message || 'API Error');
        }
    }).catch(err => {
        // サーバー停止時は未同期フラグを保ったまま警告を出し、後から一括同期できるようにします
        newItem.offlinePending = true;
        saveScopedData('manekin_my_closet', AppState.myCloset, userId);
        console.warn('MySQLクローゼット保存はオフライン（ローカルストレージに保存済み）:', err);
    });

    // 登録通知を出し、モーダルを閉じ、スタジオ全体の描画（バッジ件数や左カラムリスト）を更新します
    showToastNotification(`「${name}」をマイクローゼット(MySQL)に登録しました！`);
    closeAddClosetModal();

    // 画面再描画
    renderManekinStudio(AppState.studioActiveTab);
}

/**
 * 手持ち服の削除（ログインアカウント分のみ）
 */
// クローゼットから指定アイテムを1件削除する関数です
function deleteClosetItem(itemId) {
    // ログインユーザー確認
    if (!AppState.currentUser || !AppState.currentUser.id) {
        showToastNotification('⚠️ ログインが必要です');
        return;
    }
    const userId = AppState.currentUser.id;
    // 削除確認ダイアログで「OK」が押されたときのみ実行します
    if (confirm('この手持ちの服をクローゼットから削除しますか？')) {
        // もし現在着用中なら脱がす
        // 削除しようとしている服をマネキンが着ている場合は着用スロットから先に外します
        let wasWearingDeleted = false;
        for (const slotKey in AppState.currentOutfit) {
            if (AppState.currentOutfit[slotKey] && String(AppState.currentOutfit[slotKey].id) === String(itemId)) {
                AppState.currentOutfit[slotKey] = null;
                wasWearingDeleted = true;
            }
        }
        // 更新した試着状態と、もし脱がせた場合はバックエンドへも即時保存します
        saveScopedData('manekin_current_outfit', AppState.currentOutfit, userId);
        if (wasWearingDeleted) {
            syncStudioStateToBackend({ immediate: true });
        }

        // filter() で該当ID以外の服だけを残して配列から削除し、変更世代カウンターを進めます
        AppState.myCloset = AppState.myCloset.filter(c => String(c.id) !== String(itemId));
        _closetMutationSeq++;
        saveScopedData('manekin_my_closet', AppState.myCloset, userId);

        // MySQL からも該当アカウント分のみ削除
        // サーバー上の該当ユーザー所有データだけを狙って DELETE リクエストを送ります
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        fetch(`${apiBase}/api/closet/delete/${encodeURIComponent(itemId)}?user_id=${userId}`, { method: 'DELETE' })
            .catch(err => console.warn('MySQLクローゼット削除オフライン:', err));

        // 通知を出しスタジオを再描画します
        showToastNotification('手持ちの服を削除しました');
        renderManekinStudio(AppState.studioActiveTab);
    }
}

/**
 * MySQLからログイン中アカウントだけのマイクローゼットを同期取得
 */
// ログイン直後や画面初期化時に MySQL の closet_items テーブルから手持ち服・購入品を取得する関数です
async function syncClosetFromBackend() {
    // 未ログインならクローゼットを空にして即終了します（他人のデータを絶対に残さないため）
    if (!AppState.currentUser || !AppState.currentUser.id) {
        AppState.myCloset = [];
        return;
    }
    const targetUserId = AppState.currentUser.id;
    // サーバー発行IDでない場合はMySQL問い合わせをスキップします
    if (typeof isServerUserId === 'function' && !isServerUserId(targetUserId)) {
        return;
    }
    // 通信開始時点の操作カウンターを控えます
    const fetchStartSeq = _closetMutationSeq;
    try {
        const apiBase = (window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '';
        // 指定ユーザー専用のクローゼットアイテム一覧を取得します
        const res = await fetch(`${apiBase}/api/closet/${targetUserId}`);
        if (res.ok) {
            const data = await res.json();
            // 通信中にログアウト／ユーザー切り替えが起きていたら古いレスポンスを破棄します
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;
            // 通信中にローカルで追加・削除・購入自動保存が走った場合も古い取得結果で上書きしません
            if (fetchStartSeq !== _closetMutationSeq) return;
            if (data.closet_items && Array.isArray(data.closet_items)) {
                // DBのカラム名（スネークケース: product_id, is_owned 等）をJS側プロパティ（キャメルケース）へ変換します
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

                // 同一アカウントでオフライン作成した未同期アイテムのみ保持
                // まだサーバーに届いていない新規手持ち服が消えないよう先頭へ残します
                const offlinePending = (AppState.myCloset || []).filter(localItem =>
                    localItem &&
                    localItem.offlinePending === true &&
                    (!localItem.user_id || String(localItem.user_id) === String(targetUserId)) &&
                    !mysqlItems.some(m => String(m.id) === String(localItem.id))
                );

                // 未同期分 ＋ MySQL分 を結合し、状態およびLocalStorageへ反映します
                AppState.myCloset = [...offlinePending, ...mysqlItems];
                saveScopedData('manekin_my_closet', AppState.myCloset, targetUserId);
                console.log(`✨ [MySQL] マイクローゼット同期完了 (user_id=${targetUserId}): ${AppState.myCloset.length} 点`);

                // スタジオ上部タブ・スマホタブ・ホーム統計カードの所持点数表示を更新します
                const closetBadge = document.getElementById('studio-closet-badge');
                if (closetBadge) closetBadge.textContent = AppState.myCloset.length;
                const mobClosetCnt = document.getElementById('mob-closet-cnt');
                if (mobClosetCnt) mobClosetCnt.textContent = AppState.myCloset.length;
                const homeCloset = document.getElementById('home-stat-closet');
                if (homeCloset) homeCloset.innerHTML = `${AppState.myCloset.length} <small>点</small>`;

                // 左カラムおよび現在「マイクローゼット一覧」タブを開いているなら即座に再描画します
                if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
                if (AppState.studioActiveTab === 'closet' && typeof renderPaneClosetGrid === 'function') {
                    renderPaneClosetGrid();
                }
            }
        }
    } catch (e) {
        // サーバー未起動時はローカルデータをそのまま使って表示を維持します
        console.log('MySQLクローゼット同期待機中 (アカウント別ローカルストレージを使用)');
    }
}

/**
 * おすすめプリセットコーデの適用（ホームバナー用）
 */
// サンプルのお手本全身コーディネートを一発でマネキンへ着せる関数です
function applyPresetLook(lookKey) {
    // 例: 手持ち黒ボトムス + 白スニーカー + トレンチコート
    // クローゼットからボトムス・靴を探し、見つからない場合は標準画像データで補います
    const blackPants = AppState.myCloset.find(c => c.category === 'BOTTOMS') || {
        id: 'c1', name: '黒ワイドスラックス', category: 'BOTTOMS', color: 'BLACK', isOwned: true, image: 'assets/images/men/ストレートレープセミフレアスラックス.png'
    };
    const whiteSneakers = AppState.myCloset.find(c => c.category === 'SHOES') || {
        id: 'c2', name: 'クラシック 白レザースニーカー', category: 'SHOES', color: 'WHITE', isOwned: true, image: getCategoryFallbackImage('SHOES')
    };
    // 商品マスタからID:1のトレンチコートを取得します
    const trenchCoat = SAMPLE_PRODUCTS.find(p => p.id === 1) || SAMPLE_PRODUCTS[0];

    // 4アイテムを組み合わせた着用オブジェクトを現在のコーデへセットします
    AppState.currentOutfit = {
        hat: null,
        outer: { id: trenchCoat.id, name: trenchCoat.name, category: trenchCoat.category, color: 'CHARCOAL', price: trenchCoat.price, image: trenchCoat.image, isOwned: false },
        tops: { id: 6, name: 'ヘビーウェイト ボクシー スウェット', category: 'TOPS', color: 'OFF WHITE', price: 3490, image: 'assets/images/men/アーバングレイジップフーディ.png', isOwned: false },
        bottoms: { id: blackPants.id, name: blackPants.name, category: blackPants.category, color: blackPants.color, isOwned: true, image: blackPants.image },
        shoes: { id: whiteSneakers.id, name: whiteSneakers.name, category: whiteSneakers.category, color: whiteSneakers.color, isOwned: true, image: whiteSneakers.image }
    };
    // LocalStorageとMySQLへ保存し、試着作成画面へ移動します
    saveScopedData('manekin_current_outfit', AppState.currentOutfit);
    syncStudioStateToBackend({ immediate: true });

    showToastNotification('AIおすすめコーデをマネキンにセットしました');
    switchStudioTab('create');
}

// --------------------------------------------------------------------------
// 15.7.5 スタジオ試着状態（着用服・微調整・性別）のMySQLアカウント別双方向同期
// --------------------------------------------------------------------------
// スライダーを連続操作したときに毎ミリ秒サーバー通信しないためのデバウンスタイマーIDと世代番号です
let _studioStateSyncTimer = null;
let _studioStateSyncSeq = 0;

// 試着中の服・微調整位置・性別のスナップショットを MySQL の user_studio_states テーブルへ保存するHTTP通信関数です
async function sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot) {
    // サーバー発行アカウントでなければ通信せず false を返します
    if (typeof isServerUserId === 'function' && !isServerUserId(targetUserId)) {
        return false;
    }
    const apiBase = (typeof getApiBaseUrl === 'function')
        ? getApiBaseUrl()
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');
    try {
        // スタジオ状態保存APIへPOST送信します
        const res = await fetch(`${apiBase}/api/studio-state/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: targetUserId,
                current_outfit: outfitSnapshot,
                fitting_offsets: offsetsSnapshot,
                studio_gender: genderSnapshot
            })
        });
        // エラー応答なら catch へ渡して dirty 印を付けます
        if (!res.ok) throw new Error('Studio state save failed');
        // 正常保存できたので「未送信変更（dirty）」印を削除して true を返します
        removeScopedData('manekin_studio_dirty', targetUserId);
        return true;
    } catch (e) {
        // オフライン等で保存失敗した場合は「あとで同期が必要」印をLocalStorageへ残します
        saveScopedData('manekin_studio_dirty', true, targetUserId);
        return false;
    }
}

// アカウント切り替え／ログアウト直前に、まだ送信待ち（400msタイマー待機中）の変更があれば即座に送り切る関数です
function flushPendingStudioStateSync() {
    // 待機中タイマーが無ければ何もしません
    if (!_studioStateSyncTimer) return;
    // タイマーをキャンセルし、その場で送信を実行します
    clearTimeout(_studioStateSyncTimer);
    _studioStateSyncTimer = null;

    if (!AppState.currentUser || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        return;
    }
    // 切り替え直前の現在ユーザーと各試着データの独立コピーを作成して送信します
    const targetUserId = AppState.currentUser.id;
    const outfitSnapshot = JSON.parse(JSON.stringify(AppState.currentOutfit || { hat: null, outer: null, tops: null, bottoms: null, shoes: null }));
    const offsetsSnapshot = JSON.parse(JSON.stringify(AppState.fittingOffsets || getDefaultFittingOffsets()));
    const genderSnapshot = (AppState.studioGender === 'WOMEN') ? 'WOMEN' : 'MEN';
    sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot);
}

// スタジオ状態の変更をバックエンドへ同期する窓口関数です（immediate: true なら即送信、通常時は400ms後に送信）
function syncStudioStateToBackend(options = {}) {
    if (!AppState.currentUser || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        return Promise.resolve(false);
    }
    const targetUserId = AppState.currentUser.id;
    const immediate = !!options.immediate;

    // 前回の送信予約タイマーが残っていれば取り消し（デバウンス）、最後の操作から一定時間後に1回だけ送ります
    if (_studioStateSyncTimer) {
        clearTimeout(_studioStateSyncTimer);
        _studioStateSyncTimer = null;
    }

    // 現時点の状態スナップショットと世代番号を作ります
    const outfitSnapshot = JSON.parse(JSON.stringify(AppState.currentOutfit || { hat: null, outer: null, tops: null, bottoms: null, shoes: null }));
    const offsetsSnapshot = JSON.parse(JSON.stringify(AppState.fittingOffsets || getDefaultFittingOffsets()));
    const genderSnapshot = (AppState.studioGender === 'WOMEN') ? 'WOMEN' : 'MEN';
    const seq = ++_studioStateSyncSeq;

    // 着替えボタンクリック時など即時送信指定なら待たずにすぐ送信します
    if (immediate) {
        return sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot);
    }

    // スライダー操作時などは 400ミリ秒待って連続変更が落ち着いてからMySQLへ送ります
    return new Promise((resolve) => {
        _studioStateSyncTimer = setTimeout(async () => {
            _studioStateSyncTimer = null;
            // 400msの間にログアウトや別ユーザー切替・さらに新しい変更が発生していれば今回の送信は見送ります
            if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId) || seq !== _studioStateSyncSeq) {
                resolve(false);
                return;
            }
            const ok = await sendStudioStateRequest(targetUserId, outfitSnapshot, offsetsSnapshot, genderSnapshot);
            resolve(ok);
        }, 400);
    });
}

// ログイン直後に MySQL から該当アカウントの前回試着状態・微調整オフセット・性別を取得し復元する関数です
async function syncStudioStateFromBackend() {
    if (!AppState.currentUser || (typeof isServerUserId === 'function' && !isServerUserId(AppState.currentUser.id))) {
        return;
    }
    const targetUserId = AppState.currentUser.id;
    // ローカル側にまだサーバー未送信の変更（dirtyフラグ）があるか確認します
    const isDirty = loadScopedData('manekin_studio_dirty', false, targetUserId) === true;
    const fetchStartSeq = _studioStateSyncSeq;
    const apiBase = (typeof getApiBaseUrl === 'function')
        ? getApiBaseUrl()
        : ((window.location.protocol === 'file:' || window.location.port !== '8080') ? 'http://127.0.0.1:8080' : '');

    try {
        // 指定ユーザーのスタジオ状態を取得します
        const res = await fetch(`${apiBase}/api/studio-state/${targetUserId}`);
        if (!res.ok) throw new Error('Studio state fetch failed');
        const data = await res.json();
        // 通信中に別の操作・ユーザー切替があれば古い応答は無視します
        if (!AppState.currentUser || String(AppState.currentUser.id) !== String(targetUserId)) return;
        if (fetchStartSeq !== _studioStateSyncSeq) return;

        // ローカルに未送信の変更が残っていた場合は、サーバーのデータで上書きせずローカル側を即時サーバーへ送って優先します
        if (isDirty) {
            await syncStudioStateToBackend({ immediate: true });
            return;
        }

        // MySQLに保存されたスタジオ状態が見つかった場合はアプリ状態・LocalStorage・画面すべてを復元します
        if (data.exists && data.studio_state) {
            AppState.currentOutfit = data.studio_state.current_outfit || { hat: null, outer: null, tops: null, bottoms: null, shoes: null };
            AppState.fittingOffsets = data.studio_state.fitting_offsets || getDefaultFittingOffsets();
            AppState.studioGender = (data.studio_state.studio_gender === 'WOMEN') ? 'WOMEN' : 'MEN';

            saveScopedData('manekin_current_outfit', AppState.currentOutfit, targetUserId);
            saveScopedData('manekin_fitting_offsets', AppState.fittingOffsets, targetUserId);
            saveScopedData('manekin_studio_gender', AppState.studioGender, targetUserId);

            syncGenderToggleUI();
            if (typeof renderMannequinStage === 'function') renderMannequinStage();
            if (typeof renderStudioClosetList === 'function') renderStudioClosetList();
            if (typeof renderStudioBrandList === 'function') renderStudioBrandList();
            if (typeof updateAIStylingComment === 'function') updateAIStylingComment();
        }
    } catch (e) {
        console.log('MySQLスタジオ状態同期待機中 (アカウント別ローカルストレージを使用)');
    }
}

/**
 * 体型プロフィールの保存（マネキンシミュレーション用ローカル設定）
 */
// ユーザーが画面上で入力した体型設定をアカウント別LocalStorageに保存する関数です
function handleSaveBodyProfile(e) {
    // フォームの通常リロードを止めます
    e.preventDefault();
    // 入力要素から身長・体型・スタイル好みを読み取ります
    const height = document.getElementById('body-height')?.value || 172;
    const type = document.getElementById('body-type')?.value || 'REGULAR';
    const taste = document.getElementById('style-taste')?.value || 'MINIMAL';

    // 状態へ格納し、現在のユーザー専用領域に保存します
    AppState.userBodyProfile = { height, bodyType: type, styleTaste: taste };
    saveScopedData('manekin_body_profile', AppState.userBodyProfile);

    showToastNotification('体型および好みの設定を保存しました');
}

// --------------------------------------------------------------------------
// 15.8 ユーティリティ
// --------------------------------------------------------------------------

// 英語カテゴリコード（OUTER / TOPS / BOTTOMS / SHOES / HAT）を日本語表示名に変換する関数です
function getCategoryNameJP(cat) {
    // switch 文で引数の値に応じた日本語文字を返します
    switch (cat) {
        case 'OUTER': return 'アウター';
        case 'TOPS': return 'トップス';
        case 'BOTTOMS': return 'ボトムス';
        case 'SHOES': return '靴';
        case 'HAT': case 'HATS': case 'CAP': return '帽子';
        default: return cat;
    }
}

// 色名文字列（'BLACK', 'NAVY' 等）をCSSやHTML背景色に使える16進数カラーコード（#111111 等）へ変換する関数です
function getColorHex(colorName) {
    // 登録済みの代表的ファッションカラーに対応するHEXカラーコードを返します
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

// スタジオ内からトースト通知を出したいときに shop.js 側の showToast() を安全に呼び出すラッパー関数です
function showToastNotification(message) {
    if (typeof showToast === 'function') {
        showToast(message);
    }
}

// 他ファイルやセッション管理処理から直接参照できるよう studio.js 側の主要関数を window へ登録します
window.syncClosetFromBackend = syncClosetFromBackend;
window.syncOutfitsFromBackend = syncOutfitsFromBackend;
window.syncStudioStateToBackend = syncStudioStateToBackend;
window.syncStudioStateFromBackend = syncStudioStateFromBackend;
window.flushPendingStudioStateSync = flushPendingStudioStateSync;
window.syncGenderToggleUI = syncGenderToggleUI;
window.bumpClosetMutationSeq = bumpClosetMutationSeq;

