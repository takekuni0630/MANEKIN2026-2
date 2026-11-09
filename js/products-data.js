// ==========================================================================
// MANEKIN FASHION - 商品カタログ・マスターデータ定義 (products-data.js)
// ==========================================================================

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
        colors: ["CHARCOAL"],
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
        colors: ["BLACK"],
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
        colors: ["BLACK"],
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
        colors: ["RED CHECK"],
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
        colors: ["HEATHER GREY"],
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
        colors: ["CHARCOAL"],
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
        colors: ["STRIPE BLUE"],
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
        colors: ["WINE"],
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
        colors: ["BLACK"],
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
        colors: ["LIGHT GREY"],
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
        colors: ["OLIVE"],
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
        colors: ["STRIPE BLACK"],
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
        colors: ["OATMEAL"],
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
        colors: ["BLACK"],
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
        colors: ["IVORY"],
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
        colors: ["BLACK"],
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
        colors: ["ICE BLUE"],
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
        colors: ["OFF WHITE"],
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
        colors: ["MOCHA BROWN"],
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
        colors: ["WHITE"],
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
        colors: ["INDIGO"],
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
        colors: ["LIGHT INDIGO"],
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
        colors: ["CAMOUFLAGE"],
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
        colors: ["CHARCOAL"],
        sizes: ["S", "M"],
        material: "レーヨン 60%, ナイロン 40%",
        sku: "MNK-2026-W24"
    }
];

// --------------------------------------------------------------------------
