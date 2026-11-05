// ==========================================================================
// MANEKIN FASHION - フロントエンド JavaScript (app.js)
// ==========================================================================
//
// ★★★【写真（画像ファイル）の差し替え場所について】★★★
// ご自身で生成・撮影された写真は、以下のフォルダに保存するだけで自動反映されます：
// 
// 保存先フォルダ: assets/images/
//
// 【画像ファイル名 一覧】
// ■ 1. プレミアム コットン リラックス Tシャツ
//    - WHITE (白)        : assets/images/tshirt_white.jpg
//    - BLACK (黒)        : assets/images/tshirt_black.jpg
//    - HEATHER GREY (灰) : assets/images/tshirt_grey.jpg
//
// ■ 2. スマート テーラード ジャケット
//    - BLACK (黒)        : assets/images/jacket_black.jpg
//    - CHARCOAL (炭灰)   : assets/images/jacket_charcoal.jpg
//    - NAVY (紺)         : assets/images/jacket_navy.jpg
//
// ■ 3. ワイド ドレープ タック スラックス
//    - CHARCOAL (炭灰)   : assets/images/pants_charcoal.jpg
//    - BLACK (黒)        : assets/images/pants_black.jpg
//    - DARK BROWN (茶)   : assets/images/pants_brown.jpg
//
// ■ 4. ファイン クルーネック ニットセーター
//    - LIGHT GREY (明灰) : assets/images/knit_grey.jpg
//    - BLACK (黒)        : assets/images/knit_black.jpg
//    - OFF WHITE (白)    : assets/images/knit_white.jpg
//
// ■ 5. ミニマル ステンカラー ロングコート
//    - BLACK (黒)        : assets/images/coat_black.jpg
//    - CHARCOAL (炭灰)   : assets/images/coat_charcoal.jpg
//
// ■ 6. ヘビーウェイト ボクシー スウェット
//    - OFF WHITE (白)    : assets/images/sweat_white.jpg
//    - BLACK (黒)        : assets/images/sweat_black.jpg
//    - ASH GREY (灰)     : assets/images/sweat_grey.jpg
//
// ■ 7. リラックス アンクル テーパードパンツ
//    - BLACK (黒)        : assets/images/tapered_black.jpg
//    - CHARCOAL (炭灰)   : assets/images/tapered_charcoal.jpg
//
// ■ メインビジュアル (トップページ看板画像): assets/images/hero.jpg
// ==========================================================================

// --------------------------------------------------------------------------
// 1. サンプル商品データ定義（服の種類・カラーバリエーションはそのまま保持）
// --------------------------------------------------------------------------
const SAMPLE_PRODUCTS = [
    // =========================================================================
    // ■ MEN'S COLLECTION (メンズ 12着)
    // =========================================================================
    {   // 1~2まで終わった　10~12まで終わった
        id: 1,
        gender: "MEN",
        name: "オーバードレープ ダブルトレンチコート",
        nameEn: "Over-Draped Double Trench Coat",
        category: "OUTER",
        price: 8800,
        image: "assets/images/men/オーバードレープダブルトレンチコート.png",
        isNew: true,
        isFeatured: true,
        description: "たっぷりとした身幅とラグランスリーブが生み出す優美な落ち感が魅力。撥水性と防風性を備えた高密度ギャバジン素材を使用し、クラシックなディテールを削ぎ落とした現代的なオーバーサイズトレンチ。",
        colors: ["CHARCOAL", "BLACK", "DARK BROWN"],
        sizes: ["M", "L", "XL"],
        material: "ポリエステル 70%, レーヨン 28%, ポリウレタン 2%",
        sku: "MNK-2026-M01"
    },
    {
        id: 2,
        gender: "MEN",
        name: "リラックス ダブル ブレスト テーラードジャケット",
        nameEn: "Relaxed Double Breasted Tailored Jacket",
        category: "OUTER",
        price: 8000,
        image: "assets/images/men/リラックスダブルブレストテーラードジャケット.png",
        isNew: false,
        isFeatured: false,
        description: "リラックスしたサイジングと、端正なダブルプレストデザインが融合したテーラードジャケット。滑らかなウールブレンド素材を使用し、肩パッドを排すことでカーディガン感覚で羽織れる軽やかさを実現しました。ドレスシーンからカジュアルダウンまで、幅広いスタイリングに洗練されたムードを加えます。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        sizes: ["S", "M", "L", "XL"],
        material: "ウール 50%、ポリエステル 48%、ポリウレタン 2%",
        sku: "MNK-2026-M02"
    },
    {
        id: 3,
        gender: "MEN",
        name: "シングルブレストフェイクレザージャケット",
        nameEn: "Single Breasted Faux Leather Jacket",
        category: "OUTER",
        price: 12000,
        image: "assets/images/men/シングルブレストフェイクレザージャケット.png",
        isNew: false,
        isFeatured: false,
        description: "上品な光沢感としっとりとした質感が魅力の、ミニマルなシングル仕立てのレザージャケット。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        sizes: ["S", "M", "L", "XL"],
        material: "ウール 50%、ポリエステル 48%、ポリウレタン 2%",
        sku: "MNK-2026-M02"
    },
    {
        id: 4,
        gender: "MEN",
        name: "バッファローチェックボアジップジャケット",
        nameEn: "Buffalo Check Fleece Zip Jacket",
        category: "OUTER",
        price: 10000,
        image: "assets/images/men/バッファローチェックボアジップジャケット.png",
        isNew: false,
        isFeatured: false,
        description: "温かみのあるウォーム感豊かなボア素材に、存在感のある赤と黒のバッファローチェックを落とし込んだジップアップジャケット。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        sizes: ["S", "M", "L", "XL"],
        material: "ウール 50%、ポリエステル 48%、ポリウレタン 2%",
        sku: "MNK-2026-M02"
    },
    {
        id: 5,
        gender: "MEN",
        name: "アーバン グレイ ジップフーディ",
        nameEn: "Urban Gray Zip Hoodie",
        category: "TOPS",
        price: 2500,
        image: "assets/images/men/アーバングレイジップフーディ.png",
        isNew: true,
        isFeatured: true,
        description: "",
        colors: ["HEATHER GREY", "CHARCOAL", "BLACK", "BROWN"],
        sizes: ["S", "M", "L", "XL"],
        material: "綿 100%（裏パイル仕立て）",
        sku: "MNK-2026-M03"
    },
    {
        id: 6,
        gender: "MEN",
        name: "チャコール ブーク ニット",
        nameEn: "Charcoal Bouclé Knit",
        category: "TOPS",
        price: 4990,
        image: "assets/images/men/チャコールブークニット.png",
        isNew: true,
        isFeatured: false,
        description: "",
        colors: ["OFF WHITE", "BLACK", "NAVY", "TERRACOTTA"],
        sizes: ["S", "M", "L", "XL"],
        material: "エクストラファインメリノウール 100%",
        sku: "MNK-2026-M04"
    },
    {
        id: 7,
        gender: "MEN",
        name: "スカイ オックス フォードシャツ",
        nameEn: "Sky Ox Ford Shirt",
        category: "TOPS",
        price: 4490,
        image: "assets/images/men/スカイオックスフォードシャツ.png",
        isNew: true,
        isFeatured: false,
        description: "爽やかな水色のストライプシャツ。",
        colors: ["WHITE", "STRIPE BLUE", "CHARCOAL"],
        sizes: ["S", "M", "L", "XL"],
        material: "綿 100%",
        sku: "MNK-2026-M07"
    },
    {
        id: 8,
        gender: "MEN",
        name: "アーバン ワイン ニット",
        nameEn: "Urban Wine Knit",
        category: "TOPS",
        price: 3990,
        image: "assets/images/men/アーバンワインニット.png",
        isNew: false,
        isFeatured: false,
        description: "深みのあるワインカラーが上品さを演出する、大人のベーシックニット。",
        colors: ["CHARCOAL", "OFF WHITE", "BLACK", "BLUE"],
        sizes: ["S", "M", "L", "XL"],
        material: "レーヨン 55%, ポリエステル 45%",
        sku: "MNK-2026-M06"
    },
    {
        id: 9,
        gender: "MEN",
        name: "ストレートレープセミフレアスラックス",
        nameEn: "Straight Drape Semi-Flare Trousers",
        category: "BOTTOMS",
        price: 5490,
        image: "assets/images/men/ストレートレープセミフレアスラックス.png",
        isNew: false,
        isFeatured: false,
        description: "膝位置をわずかに高く設定し、裾にかけて自然に広がる美脚シルエットスラックス。センタープレスが半永久的に保たれるクリース加工を施し、スタイルアップを約束します。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 100%",
        sku: "MNK-2026-M09"
    },
    {
        id: 10,
        gender: "MEN",
        name: "2WAYデタッチャブルナイロンカーゴパンツ",
        nameEn: "2-Way Detachable Nylon Cargo Pants",
        category: "BOTTOMS",
        price: 6020,
        image: "assets/images/men/2WAYデタッチャブルナイロンカーゴパンツ.png",
        isNew: false,
        isFeatured: false,
        description: "膝付近のジップ切り替えによりショーツとしても着用可能な、クリーンなライトグレーの2WAYナイロンカーゴパンツ。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 100%",
        sku: "MNK-2026-M09"
    },
    {   // 10~12まで完了
        id: 11,
        gender: "MEN",
        name: "スマートアンクルテーパードイージースラックス",
        nameEn: "Smart Ankle Tapered Easy Pants",
        category: "BOTTOMS",
        price: 4990,
        image: "assets/images/men/スマートアンクルテーパードイージースラックス.png",
        isNew: true,
        isFeatured: false,
        description: "立体裁断による緩やかなカーブラインが現代的。",
        colors: ["OLIVE", "BLACK", "CHARCOAL"],
        sizes: ["S", "M", "L", "XL"],
        material: "綿 80%, リネン 20%",
        sku: "MNK-2026-M10"
    },
    {
        id: 12,
        gender: "MEN",
        name: "ストライプ パンツ",
        nameEn: "Stripe Pants",
        category: "BOTTOMS",
        price: 4200,
        image: "assets/images/men/newsimapants.png",
        isNew: true,
        isFeatured: true,
        description: "しましま模様なのでシマウマ気分で日常生活が送れます。",
        colors: ["BLACK", "NAVY", "CHARCOAL"],
        sizes: ["M", "L"],
        material: "ポリエステル 100%",
        sku: "MNK-2026-M12"
    },

    // =========================================================================
    // ■ WOMEN'S COLLECTION (ウィメンズ 12着)
    // =========================================================================
    { // 女性は画像の差し替えすべて完了
        id: 13,
        gender: "WOMEN",
        name: "フリースジャケット",
        nameEn: "Fleece Jacket",
        category: "OUTER",
        price: 6000,
        image: "assets/images/women/フリースジャケット.png",
        isNew: true,
        isFeatured: true,
        description: "軽くて暖かいシェルパ素材を使用し、肌触りは柔らかく、見た目にも上品。高めのスタンドカラーが首元までしっかり包み込み、冷たい風を防ぎます。",
        colors: ["OATMEAL", "BLACK", "CHARCOAL"],
        sizes: ["S", "M", "L"],
        material: "ポリエステル 100%",
        sku: "MNK-2026-W13"
    },
    {
        id: 14,
        gender: "WOMEN",
        name: "グリッドパフジャケット",
        nameEn: "Grid Puff Jacket",
        category: "OUTER",
        price: 9100,
        image: "assets/images/women/グリッドパフジャケット.png",
        isNew: true,
        isFeatured: true,
        description: "細かなチェック柄が特徴の軽量パフジャケット。しっかり暖かい中綿仕様で、冬の外出でも快適。高めのスタンドカラーと袖口のゴムで冷気を防ぎ、デイリーに使いやすい一着。",
        colors: ["BLACK", "CHARCOAL", "OFF WHITE"],
        sizes: ["S", "M", "L"],
        material: "ポリエステル 100%",
        sku: "MNK-2026-W14"
    },
    {
        id: 15,
        gender: "WOMEN",
        name: "スタンドカラーパテッドパフジャケット",
        nameEn: "Stand Collar Padded Puff Jacket",
        category: "OUTER",
        price: 9000,
        image: "assets/images/women/スタンドカラーパテッドパフジャケット.png",
        isNew: false,
        isFeatured: false,
        description: "首元を包み込むスタンドカラーとマットな質感の生地が、都会的で洗練された印象を与える中綿パフジャケット。",
        colors: ["BLACK", "IVORY", "CHARCOAL"],
        sizes: ["S", "M", "L"],
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        sku: "MNK-2026-W15"
    },
    {
        id: 16,
        gender: "WOMEN",
        name: "レザージャケット",
        nameEn: "Leather Jacket",
        category: "OUTER",
        price: 12900,
        image: "assets/images/women/レザージャケット.png",
        isNew: false,
        isFeatured: false,
        description: "レザーの質感とボア襟が特徴のジャケット。暖かく、冬のアウターとして使いやすい一着。フロントのジップとフラップポケットで、機能性とデザインを両立。",
        colors: ["BLACK", "IVORY", "CHARCOAL"],
        sizes: ["S", "M", "L"],
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        sku: "MNK-2026-W15"
    },
    {
        id: 17,
        gender: "WOMEN",
        name: "シャギーニットオーバーサイズクルーネックセーター",
        nameEn: "Shaggy Oversized Crewneck Sweater",
        category: "TOPS",
        price: 3990,
        image: "assets/images/women/シャギーニットオーバーサイズクルーネックセーター.png",
        isNew: true,
        isFeatured: true,
        description: "ふんわりとした毛足の長いシャギー素材が心地よく、上品なネイビーとゆるめのオーバーサイズシルエットで抜け感のあるニットプルオーバー。",
        colors: ["OFF WHITE", "CHARCOAL", "ICE BLUE", "BLACK"],
        sizes: ["S", "M", "L"],
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        sku: "MNK-2026-W16"
    },
    // 13~20まで設定完了
    {
        id: 18,
        gender: "WOMEN",
        name: "ヘビーウェイトルーズクルーネックスウェット",
        nameEn: "Heavyweight Loose Crewneck Sweatshirt",
        category: "TOPS",
        price: 2990,
        image: "assets/images/women/ヘビーウェイトルーズクルーネックスウェット.png",
        isNew: true,
        isFeatured: false,
        description: "しっかりとした肉厚感と、ドロップショルダーのゆったりシルエットで洗練された雰囲気に仕上がる万能スウェットプルオーバー。",
        colors: ["OFF WHITE", "CHARCOAL", "ICE BLUE", "BLACK"],
        sizes: ["S", "M", "L"],
        material: "ウール 85%, カシミヤ 15%",
        sku: "MNK-2026-W17"
    },
    {
        id: 19,
        gender: "WOMEN",
        name: "ヴィンテージウォッシュフルジップパーカー",
        nameEn: "Vintage Wash Full-Zip Hoodie",
        category: "TOPS",
        price: 3000,
        image: "assets/images/women/ヴィンテージウォッシュフルジップパーカー.png",
        isNew: false,
        isFeatured: false,
        description: "味のあるヴィンテージ加工とシックなブラウンカラーが魅力的で、羽織るだけでこなれ感を演出できるオーバーサイズジップパーカー。",
        colors: ["HEATHER GREY", "BLACK", "MOCHA BROWN"],
        sizes: ["S", "M", "L"],
        material: "綿 100%",
        sku: "MNK-2026-W18"
    },
    {
        id: 20,
        gender: "WOMEN",
        name: "ドット柄シアーヘンリーネッククロップドTシャツ",
        nameEn: "Polka Dot Sheer Henley Crop Top",
        category: "TOPS",
        price: 2010,
        image: "assets/images/women/ドット柄シアーヘンリーネッククロップドTシャツ.png",
        isNew: true,
        isFeatured: false,
        description: "程よい透け感のあるシアー素材とキュートなドット柄が印象的な、ヘンリーネックデザインのクロップド丈長袖カットソー。",
        colors: ["WHITE", "BLACK", "CHARCOAL"],
        sizes: ["S", "M", "L"],
        material: "スビンコットン 100%",
        sku: "MNK-2026-W19"
    },
    {
        id: 21,
        gender: "WOMEN",
        name: "ハイウエストワイドドレープタックトラウザー(インディゴデニム)",
        nameEn: "High-Waist Wide Drape Pleated Trousers",
        category: "BOTTOMS",
        price: 3490,
        image: "assets/images/women/ハイウエストワイドドレープタックトラウザー(インディゴデニム).png",
        isNew: true,
        isFeatured: true,
        description: "タックの立体的なドレープとハイウエストが魅力の、上品できれいめに履ける濃紺デニムトラウザー。",
        colors: ["CHARCOAL", "BLACK", "ECRU"],
        sizes: ["S", "M", "L"],
        material: "ポリエステル 65%, レーヨン 35%",
        sku: "MNK-2026-W21"
    },
    {
        id: 22,
        gender: "WOMEN",
        name: "ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム)",
        nameEn: "High-Waist Wide Drape Pleated Trousers",
        category: "BOTTOMS",
        price: 2990,
        image: "assets/images/women/ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム).png",
        isNew: false,
        isFeatured: false,
        description: "綺麗なドレープ感はそのままに、爽やかなブリーチ加工で抜け感をプラスしたライトブルーデニム。",
        colors: ["BLACK", "CHARCOAL", "BROWN"],
        sizes: ["S", "M", "L"],
        material: "ポリエステル 95%, ポリウレタン 5%",
        sku: "MNK-2026-W22"
    },
    {
        id: 23,
        gender: "WOMEN",
        name: "カモフラージュスーパーワイドバギーデニムパンツ",
        nameEn: "Camouflage Super Wide Baggy Denim Pants",
        category: "BOTTOMS",
        price: 3090,
        image: "assets/images/women/カモフラージュスーパーワイドバギーデニムパンツ.png",
        isNew: true,
        isFeatured: false,
        description: "落ち着いた迷彩柄と圧倒的なスーパーワイドシルエットで、コーデの主役になるストリートデニム。",
        colors: ["VINTAGE BLUE", "BLACK", "WHITE"],
        sizes: ["S", "M", "L"],
        material: "コットン 100%（12ozセルビッジ調デニム）",
        sku: "MNK-2026-W23"
    },
    {
        id: 24,
        gender: "WOMEN",
        name: "タックイージーワイドスウェットパンツ",
        nameEn: "Pleated Easy Wide Sweatpants",
        category: "BOTTOMS",
        price: 3900,
        image: "assets/images/women/タックイージーワイドスウェットパンツ.png",
        isNew: true,
        isFeatured: true,
        description: "ウエストゴムで楽な履き心地ながら、フロントタックでスラックス風にキレイ見えするスウェットパンツ。",
        colors: ["BLACK", "CHARCOAL", "MOCHA"],
        sizes: ["S", "M"],
        material: "レーヨン 60%, ナイロン 40%",
        sku: "MNK-2026-W24"
    }
];

// --------------------------------------------------------------------------
// 2. アプリケーション状態管理（State）
// --------------------------------------------------------------------------
const AppState = {
    // お気に入り登録IDリスト
    favorites: JSON.parse(localStorage.getItem('manekin_favorites')) || [1, 2],
    // ログイン中の会員情報
    currentUser: JSON.parse(localStorage.getItem('manekin_user')) || {
        id: 1,
        name: "山田 太郎 様",
        email: "demo@manekin.com",
        rank: "REGULAR MEMBER"
    },
    // ショッピングカート内アイテム
    cart: JSON.parse(localStorage.getItem('manekin_cart')) || [
        {
            id: 1,
            name: "プレミアム コットン リラックス Tシャツ",
            color: "WHITE",
            size: "L",
            price: 2990,
            quantity: 1,
            image: "assets/images/tshirt_white.jpg"
        }
    ],
    currentDetailId: 1,
    selectedColor: "WHITE",
    selectedSize: "M",
    // 注文履歴データ
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
    selectedSort: "default",

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
            image: 'assets/images/pants_black.jpg',
            isOwned: true
        },
        {
            id: 'c2',
            name: 'クラシック 白レザースニーカー',
            category: 'SHOES',
            color: 'WHITE',
            season: '通年',
            image: 'assets/images/shoes_white.jpg',
            isOwned: true
        },
        {
            id: 'c3',
            name: 'ヘビーウェイト グレーパーカー',
            category: 'TOPS',
            color: 'GREY',
            season: '秋冬',
            image: 'assets/images/sweat_grey.jpg',
            isOwned: true
        },
        {
            id: 'c4',
            name: 'プレミアム リラックス 白Tシャツ',
            category: 'TOPS',
            color: 'WHITE',
            season: '春夏',
            image: 'assets/images/tshirt_white.jpg',
            isOwned: true
        }
    ],
    // マネキン現在着用スロット
    currentOutfit: JSON.parse(localStorage.getItem('manekin_current_outfit')) || {
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    },
    // 保存したコーデ一覧（ルックブック）
    savedOutfits: JSON.parse(localStorage.getItem('manekin_saved_outfits')) || [
        {
            id: 'outfit-sample-1',
            title: '秋の通学・デイリーコーデ',
            date: '2026/10/26 15:20',
            comment: '黒パンツとグレーパーカーの組み合わせは落ち着いた印象を与えます。白スニーカーがアクセントとなりバランスの良いカジュアルコーデです。',
            tags: ['#キレイめカジュアル', '#通学デイリー', '#モノトーン+1'],
            score: 95,
            items: {
                bottoms: { id: 'c1', name: '黒ワイドスラックス', category: 'BOTTOMS', color: 'BLACK', isOwned: true, image: 'assets/images/pants_black.jpg' },
                shoes: { id: 'c2', name: 'クラシック 白レザースニーカー', category: 'SHOES', color: 'WHITE', isOwned: true, image: 'assets/images/shoes_white.jpg' },
                tops: { id: 6, name: 'ヘビーウェイト ボクシー スウェット', category: 'TOPS', color: 'ASH GREY', isOwned: false, price: 3490, image: 'assets/images/sweat_grey.jpg' }
            }
        }
    ],
    // スタジオ内のUI状態
    studioActiveTab: 'create',
    studioGender: 'MEN',
    studioClosetFilter: 'ALL',
    studioBrandFilter: 'ALL',
    studioBrandFavOnly: false,
    studioMobileView: 'mannequin',
    activeAdjustSlot: 'tops',
    fittingOffsets: JSON.parse(localStorage.getItem('manekin_fitting_offsets')) || {
        tops: { x: 0, y: 0, scale: 100 },
        outer: { x: 0, y: 0, scale: 100 },
        bottoms: { x: 0, y: 0, scale: 100 },
        shoes: { x: 0, y: 0, scale: 100 }
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

        case '#manekin':
        case '#manekin-studio':
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
    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById('header-cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalCount;
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

    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 5000 ? 0 : 550;
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = `¥${subtotal.toLocaleString()}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? "無料 (5,000円以上)" : `¥${shipping.toLocaleString()}`;
    if (taxEl) taxEl.textContent = `¥${tax.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `¥${total.toLocaleString()}`;
}

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
        const response = await fetch('http://127.0.0.1:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
            const data = await response.json();
            confirmedOrder = data.order;
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
            total_amount: totalAmount,
            status: "注文受付・発送準備中",
            items: [...AppState.cart]
        };
    }

    const itemSummaryList = confirmedOrder.items.map(it => `${it.name} (${it.color} / ${it.size}) × ${it.quantity}`);
    confirmedOrder.items_summary = itemSummaryList.join(", ");

    AppState.orderHistory.unshift(confirmedOrder);
    localStorage.setItem('manekin_orders', JSON.stringify(AppState.orderHistory));

    AppState.cart = [];
    localStorage.removeItem('manekin_cart');
    updateCartBadge();

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
// 8. マイページ管理
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
        console.log("MySQL注文履歴の同期待機中");
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
// 15. MANEKIN AI STUDIO（AIコーデシミュレーション機能）ロジック
// ==========================================================================

// クイック選択用プリセット画像マッピング
const PRESET_CLOSET_PRESETS = {
    'black_pants': {
        name: '黒ワイドスラックス',
        category: 'BOTTOMS',
        color: 'BLACK',
        season: '通年',
        image: 'assets/images/pants_black.jpg'
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
        image: 'assets/images/sweat_grey.jpg'
    },
    'white_tshirt': {
        name: 'プレミアム リラックス 白Tシャツ',
        category: 'TOPS',
        color: 'WHITE',
        season: '春夏',
        image: 'assets/images/tshirt_white.jpg'
    },
    'denim_jacket': {
        name: 'オーバーサイズ デニムジャケット',
        category: 'OUTER',
        color: 'BLUE',
        season: '春秋',
        image: 'assets/images/jacket_black.jpg'
    }
};

let currentClosetUploadDataUrl = '';

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
    if (userNameElem && AppState.currentUser) {
        userNameElem.textContent = AppState.currentUser.name || '会員 様';
    }
    const avatarCharElem = document.getElementById('studio-avatar-char');
    if (avatarCharElem && AppState.currentUser) {
        avatarCharElem.textContent = (AppState.currentUser.name || 'M').charAt(0);
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

    // ホームサマリーの数値
    const homeCloset = document.getElementById('home-stat-closet');
    if (homeCloset) homeCloset.innerHTML = `${AppState.myCloset.length} <small>点</small>`;

    const homeSaved = document.getElementById('home-stat-saved');
    if (homeSaved) homeSaved.innerHTML = `${AppState.savedOutfits.length} <small>組</small>`;

    const homeFav = document.getElementById('home-stat-fav');
    if (homeFav) homeFav.innerHTML = `${AppState.favorites.length} <small>点</small>`;

    // プロフィール情報反映
    const profName = document.getElementById('prof-display-name');
    if (profName && AppState.currentUser) profName.textContent = AppState.currentUser.name;
    const profEmail = document.getElementById('prof-display-email');
    if (profEmail && AppState.currentUser) profEmail.textContent = AppState.currentUser.email;

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
    'XS': 90,   // 90% (タイト)
    'S':  95,   // 95% (スリム)
    'M':  100,  // 100% (標準)
    'L':  105,  // 105% (ゆったり)
    'XL': 110   // 110% (ワイド)
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
                    <img src="${item.image}" alt="${item.name}" class="closet-card-img" onerror="this.src='assets/images/tshirt_white.jpg'">
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

        return `
            <div class="studio-item-card ${isWearing ? 'is-active' : ''}" onclick="toggleWearItem('${item.id}', true)">
                <img src="${item.image}" alt="${item.name}" class="studio-item-card-img" onerror="this.src='assets/images/tshirt_white.jpg'">
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
 * スタジオ内（右カラム）のブランド商品リスト描画
 */
function renderStudioBrandList() {
    const list = document.getElementById('studio-brand-list');
    if (!list) return;

    const filter = AppState.studioBrandFilter || 'ALL';
    let products = (filter === 'ALL')
        ? SAMPLE_PRODUCTS
        : SAMPLE_PRODUCTS.filter(p => p.category === filter);

    if (AppState.studioBrandFavOnly) {
        products = products.filter(p => AppState.favorites.includes(p.id));
    }

    if (products.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 30px 10px; color: var(--color-gray-medium);">
                <p style="font-size: 0.85rem;">該当するアイテムがありません</p>
            </div>
        `;
        return;
    }

    list.innerHTML = products.map(product => {
        const isWearing = isItemWearing(product);
        const isFav = AppState.favorites.includes(product.id);

        return `
            <div class="studio-item-card ${isWearing ? 'is-active' : ''}" onclick="toggleWearItem(${product.id}, false)">
                <img src="${product.image}" alt="${product.name}" class="studio-item-card-img" onerror="this.src='assets/images/tshirt_white.jpg'">
                <div class="studio-item-card-info">
                    <div class="studio-card-cat-row">
                        <span class="studio-card-cat">${product.category}</span>
                        ${isFav ? '<span style="color: var(--color-accent); font-size: 0.7rem;">♥</span>' : ''}
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
            <div class="closet-empty-card">
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
            <article class="product-card" data-id="${product.id}">
                <div class="product-img-wrapper" onclick="toggleWearItem(${product.id}, false); switchStudioTab('create');">
                    <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='assets/images/tshirt_white.jpg'">
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
function clearMannequin() {
    AppState.currentOutfit = {
        outer: null,
        tops: null,
        bottoms: null,
        shoes: null
    };
    localStorage.setItem('manekin_current_outfit', JSON.stringify(AppState.currentOutfit));
    showToastNotification('マネキンの着用服をすべてクリアしました');

    renderMannequinStage();
    renderStudioClosetList();
    renderStudioBrandList();
    updateAIStylingComment();
}

/**
 * マネキンステージの描画更新
 */
function renderMannequinStage() {
    const outfit = AppState.currentOutfit || {};

    const slots = ['shoes', 'bottoms', 'tops', 'outer'];
    slots.forEach(slot => {
        const layerContent = document.getElementById(`layer-content-${slot}`);
        const labelElem = document.getElementById(`label-${slot}`);
        const item = outfit[slot];

        if (layerContent) {
            if (item && item.image) {
                layerContent.innerHTML = `<img src="${item.image}" alt="${item.name}" class="layer-img" onerror="this.src='assets/images/tshirt_white.jpg'">`;
                if (labelElem) labelElem.style.display = 'none';
            } else {
                layerContent.innerHTML = '';
                if (labelElem) labelElem.style.display = 'block';
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
                chipsHtml.push(`
                    <span class="wearing-chip">
                        <span>${getCategoryNameJP(item.category)}: ${item.name} (${badgeLabel})</span>
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

    // 微調整パネルが開いていればUIを再同期（着せ替え時の即時反映）
    const adjustPanel = document.getElementById('fitting-adjust-panel');
    if (adjustPanel && adjustPanel.style.display !== 'none') {
        syncAdjustPanelUI();
    }
}

/**
 * 服の位置・サイズ微調整オフセットを各レイヤーに適用
 * 販売商品はXS〜XLの5段階サイズに応じたスケールを適用し、手持ち服は自由なカスタム倍率を適用
 */
function applyFittingOffsets() {
    const offsets = AppState.fittingOffsets || {};
    const slots = ['shoes', 'bottoms', 'tops', 'outer'];
    const outfit = AppState.currentOutfit || {};

    slots.forEach(slot => {
        const layerElem = document.getElementById(`layer-${slot}`);
        if (!layerElem) return;
        const off = offsets[slot] || { x: 0, y: 0, scale: 100 };
        const item = outfit[slot];

        let effectiveScale = 100;
        if (item && !item.isOwned) {
            // 販売されている服: XS〜XLの5段階サイズに応じたスケール（自由な数値変更不可）
            const bSize = off.brandSize || item.size || 'M';
            effectiveScale = BRAND_SIZE_SCALES[bSize] || 100;
        } else if (item && item.isOwned) {
            // 手持ちの服: スライダーによる自由な拡大縮小スケール
            effectiveScale = (off.customScale !== undefined) ? off.customScale : (off.scale || 100);
        } else {
            effectiveScale = off.scale || 100;
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
    const slotKey = AppState.activeAdjustSlot || 'tops';
    const offsets = AppState.fittingOffsets || {};
    const off = offsets[slotKey] || { x: 0, y: 0, scale: 100, brandSize: 'M', customScale: 100 };
    const outfit = AppState.currentOutfit || {};
    const item = outfit[slotKey];

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
    const hintElem = document.getElementById('adjust-hint-text');

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

    // 着用服の種別判別
    if (!item) {
        // 未着用状態
        if (badgeElem) {
            badgeElem.className = 'adjust-item-tag empty';
            badgeElem.textContent = '未着用';
        }
        if (nameElem) nameElem.textContent = `${getCategoryNameJP(slotKey.toUpperCase())}（未着用）`;
        if (descElem) descElem.textContent = '服を着せると調整可能';

        // 未着用時は販売商品サイズUIを非活性表示
        if (rowBrand) rowBrand.style.display = 'flex';
        if (rowFree) rowFree.style.display = 'none';
        if (sliderBrandSize) sliderBrandSize.disabled = true;
        if (btnBrandMinus) btnBrandMinus.disabled = true;
        if (btnBrandPlus) btnBrandPlus.disabled = true;
        if (sliderY) sliderY.disabled = true;
        if (sliderX) sliderX.disabled = true;
        if (hintElem) hintElem.textContent = '💡 クローゼットまたは商品一覧から服を選んでマネキンに試着してください';
        return;
    }

    // 服が着用されている場合は操作可能に戻す
    if (sliderY) sliderY.disabled = false;
    if (sliderX) sliderX.disabled = false;
    if (sliderBrandSize) sliderBrandSize.disabled = false;

    if (!item.isOwned) {
        // =====================================================================
        // 【1. 販売されている服】
        // ・大きさの調整をXS・S・M・L・XLの5段階から選択する方式
        // ・スライダーの左からXS、S、M、L、XLの順に表示
        // ・自由な数値による拡大・縮小はできない
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
        const validIdx = (sizeIdx >= 0) ? sizeIdx : 2; // デフォルトM (index 2)

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
        // 【2. 手持ちの服】
        // ・スライダーで自由に拡大・縮小できる仕様を維持（70%〜140%）
        // ・上下位置（Y）と左右位置（X）の調整機能も維持
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
    const slotKey = AppState.activeAdjustSlot || 'tops';
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
    const slotKey = AppState.activeAdjustSlot || 'tops';
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
    const slotKey = AppState.activeAdjustSlot || 'tops';
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
    const slotKey = AppState.activeAdjustSlot || 'tops';
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
    const slotKey = AppState.activeAdjustSlot || 'tops';
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
    document.getElementById('btn-gender-men').classList.toggle('active', gender === 'MEN');
    document.getElementById('btn-gender-women').classList.toggle('active', gender === 'WOMEN');

    // マネキンSVGのプロポーション切り替え
    const torso = document.querySelector('#torso-group');
    if (torso) {
        torso.style.transform = (gender === 'WOMEN') ? 'scale(0.95)' : 'none';
        torso.style.transformOrigin = 'center 120px';
    }

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
        if (scoreStarsElem) scoreStarsElem.textContent = '☆☆☆☆☆';
        return;
    }

    const hasBottoms = !!outfit.bottoms;
    const hasTops = !!outfit.tops;
    const hasOuter = !!outfit.outer;
    const hasShoes = !!outfit.shoes;

    // カラーパレット抽出
    const colors = wornItems.map(item => item.color || 'BLACK');
    const uniqueColors = [...new Set(colors)];

    if (dotsElem) {
        dotsElem.innerHTML = uniqueColors.map(c => `
            <span class="palette-dot" style="background-color: ${getColorHex(c)};" title="${c}"></span>
        `).join('');
    }

    // AI診断ロジックの構築
    let comment = '';
    let tags = [];
    let score = 95;

    // パターン1: 黒パンツ + 白スニーカー + パーカー/トップス（要件例の完全再現）
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
        comment = `「${singleItem.name}」を着用中。美しいカッティングが際立っています。さらに相性の良い${hasTops ? 'パンツや靴' : 'トップスやアウター'}を組み合わせると、全体のトータルバランスを診断できます。`;
        tags = ['#シルエット重視', '#スタイリング途中'];
        score = 90;
    }

    // DOMへ反映
    if (commentElem) commentElem.textContent = comment;
    if (tagsElem) {
        tagsElem.innerHTML = tags.map(t => `<span class="ai-tag">${t}</span>`).join('');
    }
    if (scoreValElem) scoreValElem.textContent = `${score}点`;
    if (scoreStarsElem) scoreStarsElem.textContent = '★★★★★';
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
 * コーデの保存処理
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
            <div class="closet-empty-card">
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
            <div class="saved-strip-item" title="${it.name}">
                <img src="${it.image}" alt="${it.name}" class="saved-strip-img" onerror="this.src='assets/images/tshirt_white.jpg'">
                <span class="saved-strip-tag">${it.isOwned ? '手持ち' : 'ブランド'}</span>
            </div>
        `).join('');

        return `
            <div class="saved-outfit-card">
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
 * 保存コーデの削除
 */
function deleteSavedOutfit(outfitId) {
    if (confirm('この保存コーディネートを削除しますか？')) {
        AppState.savedOutfits = AppState.savedOutfits.filter(o => o.id !== outfitId);
        localStorage.setItem('manekin_saved_outfits', JSON.stringify(AppState.savedOutfits));
        showToastNotification('コーディネートを削除しました');
        renderSavedOutfitsGrid();
        renderManekinStudio(AppState.studioActiveTab);
    }
}

// --------------------------------------------------------------------------
// 15.6 EC連携（試着中ブランド商品の1クリックカート追加）
// --------------------------------------------------------------------------

/**
 * 着用中のブランド商品をショッピングカートへ一括追加
 */
function addCurrentBrandItemsToCart() {
    const outfit = AppState.currentOutfit || {};
    const brandItems = Object.values(outfit).filter(it => it && !it.isOwned);

    if (brandItems.length === 0) {
        showToastNotification('現在マネキンが着用しているブランド商品はありません');
        return;
    }

    const offsets = AppState.fittingOffsets || {};
    brandItems.forEach(item => {
        const slotKey = getSlotKeyByCategory(item.category);
        const off = offsets[slotKey] || {};
        const chosenSize = item.size || off.brandSize || 'M';

        const existing = AppState.cart.find(c => c.id === item.id && c.size === chosenSize);
        if (existing) {
            existing.quantity += 1;
        } else {
            AppState.cart.push({
                id: item.id,
                name: item.name,
                color: item.color || 'BLACK',
                size: chosenSize,
                price: item.price || 0,
                quantity: 1,
                image: item.image
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
    const preview = document.getElementById('closet-img-preview');
    const placeholder = document.getElementById('closet-img-placeholder');
    if (preview) preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    const form = document.getElementById('form-add-closet');
    if (form) form.reset();
}

/**
 * クイック写真の選択
 */
function selectPresetImage(presetKey, presetName) {
    const preset = PRESET_CLOSET_PRESETS[presetKey];
    if (!preset) return;

    currentClosetUploadDataUrl = preset.image;

    const preview = document.getElementById('closet-img-preview');
    const previewImg = document.getElementById('closet-preview-img');
    const placeholder = document.getElementById('closet-img-placeholder');

    if (preview && previewImg && placeholder) {
        previewImg.src = preset.image;
        preview.style.display = 'flex';
        placeholder.style.display = 'none';
    }

    const nameInput = document.getElementById('closet-item-name');
    if (nameInput) nameInput.value = preset.name;

    const catRadio = document.querySelector(`input[name="closet_category"][value="${preset.category}"]`);
    if (catRadio) catRadio.checked = true;

    const colorSelect = document.getElementById('closet-item-color');
    if (colorSelect) colorSelect.value = preset.color;

    const seasonSelect = document.getElementById('closet-item-season');
    if (seasonSelect) seasonSelect.value = preset.season;
}

/**
 * ファイル選択プレビュー
 */
function handleClosetImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        currentClosetUploadDataUrl = evt.target.result;
        const preview = document.getElementById('closet-img-preview');
        const previewImg = document.getElementById('closet-preview-img');
        const placeholder = document.getElementById('closet-img-placeholder');

        if (preview && previewImg && placeholder) {
            previewImg.src = currentClosetUploadDataUrl;
            preview.style.display = 'flex';
            placeholder.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

/**
 * 新規手持ち服の登録
 */
function handleAddClosetItem(e) {
    if (e) e.preventDefault();

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

    // 画像が手動アップロードされていない場合、カテゴリに即した最適なデフォルト写真を自動セット
    let image = currentClosetUploadDataUrl;
    if (!image) {
        if (category === 'BOTTOMS') {
            image = 'assets/images/pants_black.jpg';
        } else if (category === 'SHOES') {
            image = PRESET_CLOSET_PRESETS['white_sneakers'].image;
        } else if (category === 'OUTER') {
            image = 'assets/images/jacket_black.jpg';
        } else {
            image = 'assets/images/tshirt_white.jpg';
        }
    }

    const newItem = {
        id: 'c-' + Date.now(),
        name: name,
        category: category,
        color: color,
        season: season,
        image: image,
        isOwned: true
    };

    AppState.myCloset.unshift(newItem);
    localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));

    showToastNotification(`「${name}」をマイクローゼットに登録しました！`);
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

        showToastNotification('手持ちの服を削除しました');
        renderManekinStudio(AppState.studioActiveTab);
    }
}

/**
 * おすすめプリセットコーデの適用（ホームバナー用）
 */
function applyPresetLook(lookKey) {
    // 例: 手持ち黒パンツ + 白スニーカー + トレンチコート
    const blackPants = AppState.myCloset.find(c => c.category === 'BOTTOMS') || {
        id: 'c1', name: '黒ワイドスラックス', category: 'BOTTOMS', color: 'BLACK', isOwned: true, image: 'assets/images/pants_black.jpg'
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
 * 体型プロフィールの保存
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
        case 'BOTTOMS': return 'パンツ';
        case 'SHOES': return '靴';
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

/**
 * 購入履歴からマイクローゼットへインポートする連携機能
 */
function importOrderToCloset(orderIndex) {
    const order = AppState.orderHistory[orderIndex];
    if (!order) return;

    const rawSummary = order.items_summary || "購入アイテム";
    // 商品名部分を抽出
    let itemName = rawSummary.split('(')[0].trim();
    if (!itemName) itemName = "購入アイテム";

    // カテゴリと色を推定
    let cat = 'TOPS';
    let img = 'assets/images/tshirt_white.jpg';
    let color = 'BLACK';

    if (itemName.includes('パンツ') || itemName.includes('スラックス') || itemName.includes('トラウザー') || itemName.includes('デニム')) {
        cat = 'BOTTOMS';
        img = 'assets/images/pants_black.jpg';
    } else if (itemName.includes('ジャケット') || itemName.includes('コート')) {
        cat = 'OUTER';
        img = 'assets/images/jacket_black.jpg';
    } else if (itemName.includes('靴') || itemName.includes('スニーカー')) {
        cat = 'SHOES';
        img = PRESET_CLOSET_PRESETS['white_sneakers'].image;
        color = 'WHITE';
    } else if (itemName.includes('スウェット') || itemName.includes('パーカー')) {
        cat = 'TOPS';
        img = 'assets/images/sweat_grey.jpg';
        color = 'GREY';
    }

    const newItem = {
        id: 'c-order-' + Date.now(),
        name: itemName,
        category: cat,
        color: color,
        season: '通年',
        image: img,
        isOwned: true
    };

    AppState.myCloset.unshift(newItem);
    localStorage.setItem('manekin_my_closet', JSON.stringify(AppState.myCloset));

    showToastNotification(`「${itemName}」をマイクローゼットにインポートしました！`);

    // スタジオバッジ等の更新
    const closetBadge = document.getElementById('studio-closet-badge');
    if (closetBadge) closetBadge.textContent = AppState.myCloset.length;
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



