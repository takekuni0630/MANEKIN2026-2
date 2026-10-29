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
        price: 16900,
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
        price: 9990,
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
        name: "ミニマル スタンドカラー ジップアップブルゾーン",
        nameEn: "Heavyweight Full-Zip Sweat Hoodie",
        category: "TOPS",
        price: 6990,
        image: "assets/images/men/TOPS5.png",
        isNew: true,
        isFeatured: true,
        description: "",
        colors: ["HEATHER GREY", "CHARCOAL", "BLACK", "BROWN"],
        sizes: ["S", "M", "L", "XL"],
        material: "綿 100%（裏パイル仕立て）",
        sku: "MNK-2026-M03"
    },
    {
        id: 4,
        gender: "MEN",
        name: "ファインメリノ リラックス モックネックセーター",
        nameEn: "Fine Merino Relaxed Mockneck Sweater",
        category: "TOPS",
        price: 4990,
        image: "assets/images/men/TOPS4.png",
        isNew: true,
        isFeatured: false,
        description: "",
        colors: ["OFF WHITE", "BLACK", "NAVY", "TERRACOTTA"],
        sizes: ["S", "M", "L", "XL"],
        material: "エクストラファインメリノウール 100%",
        sku: "MNK-2026-M04"
    },
    {
        id: 5,
        gender: "MEN",
        name: "プレミアム コットン ドロップショルダー ボクシーTシャツ",
        nameEn: "Premium Cotton Drop-Shoulder Boxy T-Shirt",
        category: "TOPS",
        price: 2990,
        image: "assets/images/men/TOPS3.png",
        isNew: false,
        isFeatured: true,
        description: "毛羽立ちを抑えた極上のガス焼きシルケットコットン天竺。肘にかかる絶妙な袖丈と美しいボクシーシルエットで、一枚着でも透けにくくクリーンな印象を保ちます。",
        colors: ["WHITE", "BLACK", "NAVY", "ASH GREY"],
        sizes: ["S", "M", "L", "XL"],
        material: "超長綿 100%",
        sku: "MNK-2026-M05"
    },
    {
        id: 6,
        gender: "MEN",
        name: "ウォッシャブル ミラノリブ クルーネックニット",
        nameEn: "Washable Milano Rib Crewneck Knit",
        category: "TOPS",
        price: 3990,
        image: "assets/images/men/TOPS2.png",
        isNew: false,
        isFeatured: false,
        description: "型崩れしにくくハリのあるミラノリブ編みを採用。スウェットのような気軽さで着られ、スラックスと合わせるだけで洗練された大人カジュアルが完成します。マシンウォッシャブル対応。",
        colors: ["CHARCOAL", "OFF WHITE", "BLACK", "BLUE"],
        sizes: ["S", "M", "L", "XL"],
        material: "レーヨン 55%, ポリエステル 45%",
        sku: "MNK-2026-M06"
    },
    {
        id: 7,
        gender: "MEN",
        name: "ブルーシャツ",
        nameEn: "Blue Shirt",
        category: "TOPS",
        price: 4490,
        image: "assets/images/men/TOPS1.png",
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
        name: "ワイド 2タック ドレープ バギースラックス",
        nameEn: "Wide 2-Tuck Drape Baggy Trousers",
        category: "BOTTOMS",
        price: 5990,
        image: "assets/images/pants_charcoal.jpg",
        isNew: true,
        isFeatured: true,
        description: "深めのインタックが美しい縦の落ち感を生み出す最旬ワイドバギー。高密度TRツイル素材により、歩くたびに流麗なドレープを描き、スニーカーから革靴まで相性抜群です。",
        colors: ["CHARCOAL", "BLACK", "DARK BROWN"],
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 65%, レーヨン 33%, ポリウレタン 2%",
        sku: "MNK-2026-M08"
    },
    {
        id: 9,
        gender: "MEN",
        name: "ストレート ドレープ セミフレアスラックス",
        nameEn: "Straight Drape Semi-Flare Trousers",
        category: "BOTTOMS",
        price: 5490,
        image: "assets/images/men/〇〇.png",
        isNew: false,
        isFeatured: false,
        description: "膝位置をわずかに高く設定し、裾にかけて自然に広がる美脚シルエットスラックス。センタープレスが半永久的に保たれるクリース加工を施し、スタイルアップを約束します。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 100%",
        sku: "MNK-2026-M09"
    },
    {   // 10~12まで完了
        id: 10,
        gender: "MEN",
        name: "スマート アンクル テーパードイージースラックス",
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
        id: 11,
        gender: "MEN",
        name: "ストレート ドレープ セミフレアスラックス",
        nameEn: "Straight Drape Semi-Flare Trousers",
        category: "BOTTOMS",
        price: 4490,
        image: "assets/images/men/ストレートドレープセミフレアスラックス.png",
        isNew: false,
        isFeatured: false,
        description: "ウエストゴムと内側ドローコードを備えた快適設計ながら、脚長効果が実感できるセミフレアシルエット。素材はドレープ感を美しく見せる高密度のTRツイル素材を使用。",
        colors: ["BLACK", "CHARCOAL", "NAVY"],
        sizes: ["S", "M", "L", "XL"],
        material: "ポリエステル 72%, レーヨン 24%, ポリウレタン 4%",
        sku: "MNK-2026-M11"
    },
    {
        id: 12,
        gender: "MEN",
        name: "ストライプ パンツ",
        nameEn: "Stripe Pants",
        category: "BOTTOMS",
        price: 11900,
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
        price: 16900,
        image: "assets/images/women/outer1.png",
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
        price: 10900,
        image: "assets/images/women/outer2.png",
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
        name: "スタンドカラー パテッド パフジャケット",
        nameEn: "Stand Collar Padded Puff Jacket",
        category: "OUTER",
        price: 12900,
        image: "assets/images/women/outer4.png",
        isNew: false,
        isFeatured: false,
        description: "首元までしっかり暖かなスタンドカラーとマットな質感が魅力の、ミニマルでスタイリッシュな中綿パフジャケット。",
        name: "レザージャケット",
        nameEn: "Leather Jacket",
        category: "OUTER",
        price: 12900,
        image: "assets/images/women/outer3.png",
        isNew: false,
        isFeatured: false,
        description: "レザーの質感とボア襟が特徴のジャケット。暖かく、冬のアウターとして使いやすい一着。フロントのジップとフラップポケットで、機能性とデザインを両立。",
        colors: ["BLACK", "IVORY", "CHARCOAL"],
        sizes: ["S", "M", "L"],
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        sku: "MNK-2026-W15"
    },
    {
        id: 16,
        gender: "WOMEN",
        name: "シャギーニット オーバーサイズ クルーネックセーター",
        nameEn: "Shaggy Oversized Crewneck Sweater",
        category: "TOPS",
        price: 4990,
        image: "assets/images/women/tops1.png",
        isNew: true,
        isFeatured: true,
        description: "ふんわりとした毛足の長いシャギー素材が心地よく、上品なネイビーとゆるめのオーバーサイズシルエットで抜け感のあるニットプルオーバー。",
        colors: ["OFF WHITE", "CHARCOAL", "ICE BLUE", "BLACK"],
        name: "スタンドカラー パテッド パフジャケット",
        nameEn: "Stand Collar Padded Puff Jacket",
        category: "OUTER",
        price: 12900,
        image: "assets/images/women/outer4.png",
        isNew: false,
        isFeatured: false,
        description: "首元までしっかり暖かなスタンドカラーとマットな質感が魅力の、ミニマルでスタイリッシュな中綿パフジャケット。",
        colors: ["BLACK", "IVORY", "CHARCOAL"],
        sizes: ["S", "M", "L"],
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        sku: "MNK-2026-W16"
    },
    // 13~20まで設定完了
    {
        id: 17,
        gender: "WOMEN",
        name: "ヘビーウェイト ルーズクルーネック スウェット",
        nameEn: "Heavyweight Loose Crewneck Sweatshirt",
        category: "TOPS",
        price: 5990,
        image: "assets/images/women/tops2.png",
        isNew: true,
        isFeatured: false,
        description: "しっかりとした肉厚感と、ドロップショルダーのゆったりシルエットで洗練された雰囲気に仕上がる万能スウェットプルオーバー。",
        colors: ["HEATHER GREY", "BLACK", "MOCHA BROWN"],
        name: "シャギーニット オーバーサイズ クルーネックセーター",
        nameEn: "Shaggy Oversized Crewneck Sweater",
        category: "TOPS",
        price: 4990,
        image: "assets/images/women/tops1.png",
        isNew: true,
        isFeatured: true,
        description: "ふんわりとした毛足の長いシャギー素材が心地よく、上品なネイビーとゆるめのオーバーサイズシルエットで抜け感のあるニットプルオーバー。",
        colors: ["OFF WHITE", "CHARCOAL", "ICE BLUE", "BLACK"],
        sizes: ["S", "M", "L"],
        material: "ウール 85%, カシミヤ 15%",
        sku: "MNK-2026-W17"
    },
    {
        id: 18,
        gender: "WOMEN",
        name: "ヴィンテージウォッシュ フルジップパーカー",
        nameEn: "Vintage Wash Full-Zip Hoodie",
        category: "TOPS",
        price: 2990,
        image: "assets/images/women/tops3.png",
        isNew: false,
        isFeatured: false,
        description: "味のあるヴィンテージ加工とシックなブラウンカラーが魅力的で、羽織るだけでこなれ感を演出できるオーバーサイズジップパーカー。",
        colors: ["WHITE", "BLACK", "CHARCOAL"],
        name: "ヘビーウェイト ルーズクルーネック スウェット",
        nameEn: "Heavyweight Loose Crewneck Sweatshirt",
        category: "TOPS",
        price: 5990,
        image: "assets/images/women/tops2.png",
        isNew: true,
        isFeatured: false,
        description: "しっかりとした肉厚感と、ドロップショルダーのゆったりシルエットで洗練された雰囲気に仕上がる万能スウェットプルオーバー。",
        colors: ["HEATHER GREY", "BLACK", "MOCHA BROWN"],
        sizes: ["S", "M", "L"],
        material: "綿 100%",
        sku: "MNK-2026-W18"
    },
    {
        id: 19,
        gender: "WOMEN",
        name: "ドット柄 シアーヘンリーネック クロップドTシャツ",
        nameEn: "Polka Dot Sheer Henley Crop Top",
        category: "TOPS",
        price: 3990,
        image: "assets/images/women/tops4.png",
        isNew: true,
        isFeatured: false,
        description: "程よい透け感のあるシアー素材とキュートなドット柄が印象的な、ヘンリーネックデザインのクロップド丈長袖カットソー。",
        colors: ["CHARCOAL", "OFF WHITE", "BLACK"],
        sizes: ["FREE"],
        material: "アクリル 55%, コットン 45%",
        name: "ヴィンテージウォッシュ フルジップパーカー",
        nameEn: "Vintage Wash Full-Zip Hoodie",
        category: "TOPS",
        price: 2990,
        image: "assets/images/women/tops3.png",
        isNew: false,
        isFeatured: false,
        description: "味のあるヴィンテージ加工とシックなブラウンカラーが魅力的で、羽織るだけでこなれ感を演出できるオーバーサイズジップパーカー。",
        colors: ["WHITE", "BLACK", "CHARCOAL"],
        sizes: ["S", "M", "L"],
        material: "スビンコットン 100%",
        sku: "MNK-2026-W19"
    },
    {
        id: 20,
        gender: "WOMEN",
        name: "ドット柄 シアーヘンリーネック クロップドTシャツ",
        nameEn: "Polka Dot Sheer Henley Crop Top",
        category: "TOPS",
        price: 3990,
        image: "assets/images/women/tops4.png",
        isNew: true,
        isFeatured: false,
        description: "程よい透け感のあるシアー素材とキュートなドット柄が印象的な、ヘンリーネックデザインのクロップド丈長袖カットソー。",
        colors: ["CHARCOAL", "OFF WHITE", "BLACK"],
        sizes: ["FREE"],
        material: "アクリル 55%, コットン 45%",
        sku: "MNK-2026-W20"
    },
    {
        id: 21,
        gender: "WOMEN",
        name: "ハイウエスト ワイドドレープ タックトラウザー (インディゴデニム)",
        nameEn: "High-Waist Wide Drape Pleated Trousers",
        category: "BOTTOMS",
        price: 5490,
        image: "assets/images/women/denim1.jpg",
        image: "assets/images/women/denim1.png",
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
        name: "ハイウエスト ワイドドレープ タックトラウザー (ライトインディゴデニム)",
        nameEn: "High-Waist Wide Drape Pleated Trousers",
        category: "BOTTOMS",
        price: 4990,
        image: "assets/images/women/denim2.jpg",
        image: "assets/images/women/denim2.png",
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
        name: "カモフラージュ スーパーワイドバギーデニムパンツ",
        nameEn: "Camouflage Super Wide Baggy Denim Pants",
        category: "BOTTOMS",
        price: 5990,
        image: "assets/images/women/denim3.jpg",
        image: "assets/images/women/denim3.png",
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
        name: "タック イージーワイドスウェットパンツ",
        nameEn: "Pleated Easy Wide Sweatpants",
        category: "ONEPIECE",
        price: 7990,
        image: "assets/images/women/denim4.jpg",
        image: "assets/images/women/denim4.png",
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
    selectedSort: "default"
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
