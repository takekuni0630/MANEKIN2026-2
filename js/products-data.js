// ==========================================================================
// MANEKIN FASHION - 商品カタログ・マスターデータ定義 (products-data.js)a
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
// ↓ サイト内で販売・表示する全24着の商品マスターデータ配列（読み取り専用の定数 SAMPLE_PRODUCTS に格納）
const SAMPLE_PRODUCTS = [
    // =========================================================================
    // ■ MEN'S COLLECTION (メンズ 12着)
    // =========================================================================
    // ↓ 【メンズ 1着目】トレンチコートのオブジェクト開始（1~2まで終わった　10~12まで終わった）
    {   // 1~2まで終わった　10~12まで終わった
        // ↓ 商品を一意に識別する背番号（URLの ?id=1 やカート管理で使用）
        id: 1,
        // ↓ 性別カテゴリ（'MEN' または 'WOMEN'。一覧ページの絞り込みに使用）
        gender: "MEN",
        // ↓ 画面に表示される日本語の商品名
        name: "オーバードレープ ダブルトレンチコート",
        // ↓ 英語表記のサブ商品名（カードや詳細画面の演出用）
        nameEn: "Over-Draped Double Trench Coat",
        // ↓ アイテム種別（OUTER / TOPS / BOTTOMS。マネキンの着せ替え先スロットとも連動）
        category: "OUTER",
        // ↓ 販売価格（日本円、税込み整数値）
        price: 8800,
        // ↓ 商品画像の保存先相対パス（assetsフォルダ内のPNGを参照）
        image: "assets/images/men/オーバードレープダブルトレンチコート.png",
        // ↓ 新着商品フラグ（trueなら「NEW」バッジが付き、新着ページにも並びます）
        isNew: true,
        // ↓ トップページのPICK UPセクションに表示するおすすめ商品フラグ
        isFeatured: true,
        // ↓ 商品詳細ページに表示する詳しい説明文
        description: "たっぷりとした身幅とラグランスリーブが生み出す優美な落ち感が魅力。撥水性と防風性を備えた高密度ギャバジン素材を使用し、クラシックなディテールを削ぎ落とした現代的なオーバーサイズトレンチ。",
        // ↓ 選択可能なカラー名の配列（detailページで色ボタンを生成）
        colors: ["CHARCOAL"],
        // ↓ 選択可能なサイズ名の配列（detailページでサイズボタンを生成）
        sizes: ["M", "L", "XL"],
        // ↓ 生地の素材・混紡率の説明テキスト
        material: "ポリエステル 70%, レーヨン 28%, ポリウレタン 2%",
        // ↓ 店舗・在庫管理用の型番コード（SKU = Stock Keeping Unit）
        sku: "MNK-2026-M01"
    // ↓ 1着目のオブジェクト終了（カンマで次の商品へ続く）
    },
    // ↓ 【メンズ 2着目】テーラードジャケットのデータ開始
    {
        // ↓ 商品ID: 2
        id: 2,
        // ↓ メンズ向け商品
        gender: "MEN",
        // ↓ 商品名
        name: "リラックス ダブル ブレスト テーラードジャケット",
        // ↓ 英語名
        nameEn: "Relaxed Double Breasted Tailored Jacket",
        // ↓ カテゴリ：アウター
        category: "OUTER",
        // ↓ 価格：8,000円
        price: 8000,
        // ↓ 商品画像パス
        image: "assets/images/men/リラックスダブルブレストテーラードジャケット.png",
        // ↓ 新着対象外（false）
        isNew: false,
        // ↓ トップPICK UP対象外
        isFeatured: false,
        // ↓ 商品の特徴文
        description: "リラックスしたサイジングと、端正なダブルプレストデザインが融合したテーラードジャケット。滑らかなウールブレンド素材を使用し、肩パッドを排すことでカーディガン感覚で羽織れる軽やかさを実現しました。ドレスシーンからカジュアルダウンまで、幅広いスタイリングに洗練されたムードを加えます。",
        // ↓ カラーバリエーション（黒）
        colors: ["BLACK"],
        // ↓ サイズ展開（S〜XLの4サイズ）
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材表記
        material: "ウール 50%、ポリエステル 48%、ポリウレタン 2%",
        // ↓ 商品型番
        sku: "MNK-2026-M02"
    // ↓ 2着目終了
    },
    // ↓ 【メンズ 3着目】フェイクレザージャケットのデータ開始
    {
        // ↓ 商品ID: 3
        id: 3,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "シングルブレストフェイクレザージャケット",
        // ↓ 英語名
        nameEn: "Single Breasted Faux Leather Jacket",
        // ↓ カテゴリ：アウター
        category: "OUTER",
        // ↓ 価格：12,000円
        price: 12000,
        // ↓ 商品画像パス
        image: "assets/images/men/シングルブレストフェイクレザージャケット.png",
        // ↓ 通常商品（新着なし）
        isNew: false,
        // ↓ 通常商品（おすすめ欄なし）
        isFeatured: false,
        // ↓ 商品紹介テキスト
        description: "上品な光沢感としっとりとした質感が魅力の、ミニマルなシングル仕立てのレザージャケット。",
        // ↓ カラー：黒
        colors: ["BLACK"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材表記
        material: "ウール 50%、ポリエステル 48%、ポリウレタン 2%",
        // ↓ 型番
        sku: "MNK-2026-M02"
    // ↓ 3着目終了
    },
    // ↓ 【メンズ 4着目】ボアジップジャケットのデータ開始
    {
        // ↓ 商品ID: 4
        id: 4,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "バッファローチェックボアジップジャケット",
        // ↓ 英語名
        nameEn: "Buffalo Check Fleece Zip Jacket",
        // ↓ カテゴリ：アウター
        category: "OUTER",
        // ↓ 価格：10,000円
        price: 10000,
        // ↓ 商品画像パス
        image: "assets/images/men/バッファローチェックボアジップジャケット.png",
        // ↓ 新着ではない
        isNew: false,
        // ↓ トップPick Upではない
        isFeatured: false,
        // ↓ 説明文
        description: "温かみのあるウォーム感豊かなボア素材に、存在感のある赤と黒のバッファローチェックを落とし込んだジップアップジャケット。",
        // ↓ カラー：赤チェック
        colors: ["RED CHECK"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材表記
        material: "ウール 50%、ポリエステル 48%、ポリウレタン 2%",
        // ↓ 型番
        sku: "MNK-2026-M02"
    // ↓ 4着目終了
    },
    // ↓ 【メンズ 5着目】ジップフーディのデータ開始
    {
        // ↓ 商品ID: 5
        id: 5,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "アーバン グレイ ジップフーディ",
        // ↓ 英語名
        nameEn: "Urban Gray Zip Hoodie",
        // ↓ カテゴリ：トップス（インナー・上着の中核）
        category: "TOPS",
        // ↓ 価格：2,500円
        price: 2500,
        // ↓ 商品画像パス
        image: "assets/images/men/アーバングレイジップフーディ.png",
        // ↓ 新着アイテムとして表示
        isNew: true,
        // ↓ トップページのPICK UPに表示
        isFeatured: true,
        // ↓ 説明文が空の場合は画面側で既定の補完文を表示する仕組みになっています
        description: "",
        // ↓ カラー：杢グレー
        colors: ["HEATHER GREY"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材：綿100%
        material: "綿 100%（裏パイル仕立て）",
        // ↓ 型番
        sku: "MNK-2026-M03"
    // ↓ 5着目終了
    },
    // ↓ 【メンズ 6着目】ブークレニットのデータ開始
    {
        // ↓ 商品ID: 6
        id: 6,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "チャコール ブーク ニット",
        // ↓ 英語名
        nameEn: "Charcoal Bouclé Knit",
        // ↓ カテゴリ：トップス
        category: "TOPS",
        // ↓ 価格：4,990円
        price: 4990,
        // ↓ 商品画像パス
        image: "assets/images/men/チャコールブークニット.png",
        // ↓ 新着バッジ対象
        isNew: true,
        // ↓ おすすめ対象外
        isFeatured: false,
        // ↓ 説明文（空）
        description: "",
        // ↓ カラー：チャコール
        colors: ["CHARCOAL"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材：メリノウール100%
        material: "エクストラファインメリノウール 100%",
        // ↓ 型番
        sku: "MNK-2026-M04"
    // ↓ 6着目終了
    },
    // ↓ 【メンズ 7着目】オックスフォードシャツのデータ開始
    {
        // ↓ 商品ID: 7
        id: 7,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "スカイ オックス フォードシャツ",
        // ↓ 英語名
        nameEn: "Sky Ox Ford Shirt",
        // ↓ カテゴリ：トップス
        category: "TOPS",
        // ↓ 価格：4,490円
        price: 4490,
        // ↓ 商品画像パス
        image: "assets/images/men/スカイオックスフォードシャツ.png",
        // ↓ 新着バッジ対象
        isNew: true,
        // ↓ PICK UP対象外
        isFeatured: false,
        // ↓ 説明文
        description: "爽やかな水色のストライプシャツ。",
        // ↓ カラー：ストライプブルー
        colors: ["STRIPE BLUE"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材：綿100%
        material: "綿 100%",
        // ↓ 型番
        sku: "MNK-2026-M07"
    // ↓ 7着目終了
    },
    // ↓ 【メンズ 8着目】ワインカラーニットのデータ開始
    {
        // ↓ 商品ID: 8
        id: 8,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "アーバン ワイン ニット",
        // ↓ 英語名
        nameEn: "Urban Wine Knit",
        // ↓ カテゴリ：トップス
        category: "TOPS",
        // ↓ 価格：3,990円
        price: 3990,
        // ↓ 商品画像パス
        image: "assets/images/men/アーバンワインニット.png",
        // ↓ 通常商品
        isNew: false,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "深みのあるワインカラーが上品さを演出する、大人のベーシックニット。",
        // ↓ カラー：ワインレッド
        colors: ["WINE"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材：レーヨン・ポリエステル混紡
        material: "レーヨン 55%, ポリエステル 45%",
        // ↓ 型番
        sku: "MNK-2026-M06"
    // ↓ 8着目終了
    },
    // ↓ 【メンズ 9着目】セミフレアスラックスのデータ開始
    {
        // ↓ 商品ID: 9
        id: 9,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "ストレートレープセミフレアスラックス",
        // ↓ 英語名
        nameEn: "Straight Drape Semi-Flare Trousers",
        // ↓ カテゴリ：ボトムス（パンツ類）
        category: "BOTTOMS",
        // ↓ 価格：5,490円
        price: 5490,
        // ↓ 商品画像パス
        image: "assets/images/men/ストレートレープセミフレアスラックス.png",
        // ↓ 通常商品
        isNew: false,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "膝位置をわずかに高く設定し、裾にかけて自然に広がる美脚シルエットスラックス。センタープレスが半永久的に保たれるクリース加工を施し、スタイルアップを約束します。",
        // ↓ カラー：黒
        colors: ["BLACK"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材：ポリエステル100%
        material: "ポリエステル 100%",
        // ↓ 型番
        sku: "MNK-2026-M09"
    // ↓ 9着目終了
    },
    // ↓ 【メンズ 10着目】2WAYカーゴパンツのデータ開始
    {
        // ↓ 商品ID: 10
        id: 10,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "2WAYデタッチャブルナイロンカーゴパンツ",
        // ↓ 英語名
        nameEn: "2-Way Detachable Nylon Cargo Pants",
        // ↓ カテゴリ：ボトムス
        category: "BOTTOMS",
        // ↓ 価格：6,020円
        price: 6020,
        // ↓ 商品画像パス
        image: "assets/images/men/2WAYデタッチャブルナイロンカーゴパンツ.png",
        // ↓ 通常商品
        isNew: false,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "膝付近のジップ切り替えによりショーツとしても着用可能な、クリーンなライトグレーの2WAYナイロンカーゴパンツ。",
        // ↓ カラー：ライトグレー
        colors: ["LIGHT GREY"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材
        material: "ポリエステル 100%",
        // ↓ 型番
        sku: "MNK-2026-M09"
    // ↓ 10着目終了
    },
    // ↓ 【メンズ 11着目】イージースラックスのデータ開始（作業メモコメントあり）
    {   // 10~12まで完了
        // ↓ 商品ID: 11
        id: 11,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "スマートアンクルテーパードイージースラックス",
        // ↓ 英語名
        nameEn: "Smart Ankle Tapered Easy Pants",
        // ↓ カテゴリ：ボトムス
        category: "BOTTOMS",
        // ↓ 価格：4,990円
        price: 4990,
        // ↓ 商品画像パス
        image: "assets/images/men/スマートアンクルテーパードイージースラックス.png",
        // ↓ 新着商品
        isNew: true,
        // ↓ トップPICK UP対象外
        isFeatured: false,
        // ↓ 説明文
        description: "立体裁断による緩やかなカーブラインが現代的。",
        // ↓ カラー：オリーブ
        colors: ["OLIVE"],
        // ↓ サイズ：S〜XL
        sizes: ["S", "M", "L", "XL"],
        // ↓ 素材：綿・リネン混紡
        material: "綿 80%, リネン 20%",
        // ↓ 型番
        sku: "MNK-2026-M10"
    // ↓ 11着目終了
    },
    // ↓ 【メンズ 12着目】ストライプパンツのデータ開始
    {
        // ↓ 商品ID: 12
        id: 12,
        // ↓ メンズ向け
        gender: "MEN",
        // ↓ 商品名
        name: "ストライプ パンツ",
        // ↓ 英語名
        nameEn: "Stripe Pants",
        // ↓ カテゴリ：ボトムス
        category: "BOTTOMS",
        // ↓ 価格：4,200円
        price: 4200,
        // ↓ 商品画像パス
        image: "assets/images/men/newsimapants.png",
        // ↓ 新着バッジあり
        isNew: true,
        // ↓ トップPICK UPあり
        isFeatured: true,
        // ↓ 説明文
        description: "しましま模様なのでシマウマ気分で日常生活が送れます。",
        // ↓ カラー：ストライプブラック
        colors: ["STRIPE BLACK"],
        // ↓ サイズ：M, Lの2サイズ
        sizes: ["M", "L"],
        // ↓ 素材：ポリエステル100%
        material: "ポリエステル 100%",
        // ↓ 型番
        sku: "MNK-2026-M12"
    // ↓ 12着目終了
    },

    // =========================================================================
    // ■ WOMEN'S COLLECTION (ウィメンズ 12着)
    // =========================================================================
    // ↓ 【ウィメンズ 1着目(ID:13)】フリースジャケットのデータ開始（女性は画像の差し替えすべて完了）
    { // 女性は画像の差し替えすべて完了
        // ↓ 商品ID: 13
        id: 13,
        // ↓ レディース向け（'WOMEN'）に設定
        gender: "WOMEN",
        // ↓ 商品名
        name: "フリースジャケット",
        // ↓ 英語名
        nameEn: "Fleece Jacket",
        // ↓ カテゴリ：アウター
        category: "OUTER",
        // ↓ 価格：6,000円
        price: 6000,
        // ↓ レディース用画像フォルダ内のPNGパス
        image: "assets/images/women/フリースジャケット.png",
        // ↓ 新着アイテム表示対象
        isNew: true,
        // ↓ トップPICK UP表示対象
        isFeatured: true,
        // ↓ 詳細説明文
        description: "軽くて暖かいシェルパ素材を使用し、肌触りは柔らかく、見た目にも上品。高めのスタンドカラーが首元までしっかり包み込み、冷たい風を防ぎます。",
        // ↓ カラー：オートミール
        colors: ["OATMEAL"],
        // ↓ レディースサイズは S, M, L の3サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材：ポリエステル100%
        material: "ポリエステル 100%",
        // ↓ 型番コード
        sku: "MNK-2026-W13"
    // ↓ ID:13終了
    },
    // ↓ 【ウィメンズ 2着目(ID:14)】グリッドパフジャケットのデータ開始
    {
        // ↓ 商品ID: 14
        id: 14,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "グリッドパフジャケット",
        // ↓ 英語名
        nameEn: "Grid Puff Jacket",
        // ↓ カテゴリ：アウター
        category: "OUTER",
        // ↓ 価格：9,100円
        price: 9100,
        // ↓ 画像パス
        image: "assets/images/women/グリッドパフジャケット.png",
        // ↓ 新着対象
        isNew: true,
        // ↓ おすすめ対象
        isFeatured: true,
        // ↓ 説明文
        description: "細かなチェック柄が特徴の軽量パフジャケット。しっかり暖かい中綿仕様で、冬の外出でも快適。高めのスタンドカラーと袖口のゴムで冷気を防ぎ、デイリーに使いやすい一着。",
        // ↓ カラー：ブラック
        colors: ["BLACK"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材表記
        material: "ポリエステル 100%",
        // ↓ 型番
        sku: "MNK-2026-W14"
    // ↓ ID:14終了
    },
    // ↓ 【ウィメンズ 3着目(ID:15)】中綿パフジャケットのデータ開始
    {
        // ↓ 商品ID: 15
        id: 15,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "スタンドカラーパテッドパフジャケット",
        // ↓ 英語名
        nameEn: "Stand Collar Padded Puff Jacket",
        // ↓ カテゴリ：アウター
        category: "OUTER",
        // ↓ 価格：9,000円
        price: 9000,
        // ↓ 画像パス
        image: "assets/images/women/スタンドカラーパテッドパフジャケット.png",
        // ↓ 通常商品
        isNew: false,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "首元を包み込むスタンドカラーとマットな質感の生地が、都会的で洗練された印象を与える中綿パフジャケット。",
        // ↓ カラー：アイボリー
        colors: ["IVORY"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材表記（表地と中綿の構成）
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        // ↓ 型番
        sku: "MNK-2026-W15"
    // ↓ ID:15終了
    },
    // ↓ 【ウィメンズ 4着目(ID:16)】レザージャケットのデータ開始
    {
        // ↓ 商品ID: 16
        id: 16,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "レザージャケット",
        // ↓ 英語名
        nameEn: "Leather Jacket",
        // ↓ カテゴリ：アウター
        category: "OUTER",
        // ↓ 価格：12,900円
        price: 12900,
        // ↓ 画像パス
        image: "assets/images/women/レザージャケット.png",
        // ↓ 通常商品
        isNew: false,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "レザーの質感とボア襟が特徴のジャケット。暖かく、冬のアウターとして使いやすい一着。フロントのジップとフラップポケットで、機能性とデザインを両立。",
        // ↓ カラー：ブラック
        colors: ["BLACK"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材表記
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        // ↓ 型番
        sku: "MNK-2026-W15"
    // ↓ ID:16終了
    },
    // ↓ 【ウィメンズ 5着目(ID:17)】シャギーニットのデータ開始
    {
        // ↓ 商品ID: 17
        id: 17,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "シャギーニットオーバーサイズクルーネックセーター",
        // ↓ 英語名
        nameEn: "Shaggy Oversized Crewneck Sweater",
        // ↓ カテゴリ：トップス
        category: "TOPS",
        // ↓ 価格：3,990円
        price: 3990,
        // ↓ 画像パス
        image: "assets/images/women/シャギーニットオーバーサイズクルーネックセーター.png",
        // ↓ 新着対象
        isNew: true,
        // ↓ おすすめ対象
        isFeatured: true,
        // ↓ 説明文
        description: "ふんわりとした毛足の長いシャギー素材が心地よく、上品なネイビーとゆるめのオーバーサイズシルエットで抜け感のあるニットプルオーバー。",
        // ↓ カラー：アイスブルー
        colors: ["ICE BLUE"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材表記
        material: "表地: ポリエステル 100%, 中綿: リサイクルダウン 90%, フェザー 10%",
        // ↓ 型番
        sku: "MNK-2026-W16"
    // ↓ ID:17終了
    },
    // ↓ 作者による進捗メモコメントをそのまま保持（13~20まで設定完了）
    // 13~20まで設定完了
    // ↓ 【ウィメンズ 6着目(ID:18)】クルーネックスウェットのデータ開始
    {
        // ↓ 商品ID: 18
        id: 18,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "ヘビーウェイトルーズクルーネックスウェット",
        // ↓ 英語名
        nameEn: "Heavyweight Loose Crewneck Sweatshirt",
        // ↓ カテゴリ：トップス
        category: "TOPS",
        // ↓ 価格：2,990円
        price: 2990,
        // ↓ 画像パス
        image: "assets/images/women/ヘビーウェイトルーズクルーネックスウェット.png",
        // ↓ 新着対象
        isNew: true,
        // ↓ PICK UP対象外
        isFeatured: false,
        // ↓ 説明文
        description: "しっかりとした肉厚感と、ドロップショルダーのゆったりシルエットで洗練された雰囲気に仕上がる万能スウェットプルオーバー。",
        // ↓ カラー：オフホワイト
        colors: ["OFF WHITE"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材：ウール・カシミヤ混
        material: "ウール 85%, カシミヤ 15%",
        // ↓ 型番
        sku: "MNK-2026-W17"
    // ↓ ID:18終了
    },
    // ↓ 【ウィメンズ 7着目(ID:19)】ヴィンテージフルジップパーカーのデータ開始
    {
        // ↓ 商品ID: 19
        id: 19,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "ヴィンテージウォッシュフルジップパーカー",
        // ↓ 英語名
        nameEn: "Vintage Wash Full-Zip Hoodie",
        // ↓ カテゴリ：トップス
        category: "TOPS",
        // ↓ 価格：3,000円
        price: 3000,
        // ↓ 画像パス
        image: "assets/images/women/ヴィンテージウォッシュフルジップパーカー.png",
        // ↓ 通常商品
        isNew: false,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "味のあるヴィンテージ加工とシックなブラウンカラーが魅力的で、羽織るだけでこなれ感を演出できるオーバーサイズジップパーカー。",
        // ↓ カラー：モカブラウン
        colors: ["MOCHA BROWN"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材：綿100%
        material: "綿 100%",
        // ↓ 型番
        sku: "MNK-2026-W18"
    // ↓ ID:19終了
    },
    // ↓ 【ウィメンズ 8着目(ID:20)】ドット柄クロップドTシャツのデータ開始
    {
        // ↓ 商品ID: 20
        id: 20,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "ドット柄シアーヘンリーネッククロップドTシャツ",
        // ↓ 英語名
        nameEn: "Polka Dot Sheer Henley Crop Top",
        // ↓ カテゴリ：トップス
        category: "TOPS",
        // ↓ 価格：2,010円
        price: 2010,
        // ↓ 画像パス
        image: "assets/images/women/ドット柄シアーヘンリーネッククロップドTシャツ.png",
        // ↓ 新着対象
        isNew: true,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "程よい透け感のあるシアー素材とキュートなドット柄が印象的な、ヘンリーネックデザインのクロップド丈長袖カットソー。",
        // ↓ カラー：ホワイト
        colors: ["WHITE"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材：スビンコットン100%
        material: "スビンコットン 100%",
        // ↓ 型番
        sku: "MNK-2026-W19"
    // ↓ ID:20終了
    },
    // ↓ 【ウィメンズ 9着目(ID:21)】インディゴデニムワイドパンツのデータ開始
    {
        // ↓ 商品ID: 21
        id: 21,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "ハイウエストワイドドレープタックトラウザー(インディゴデニム)",
        // ↓ 英語名
        nameEn: "High-Waist Wide Drape Pleated Trousers",
        // ↓ カテゴリ：ボトムス
        category: "BOTTOMS",
        // ↓ 価格：3,490円
        price: 3490,
        // ↓ 画像パス
        image: "assets/images/women/ハイウエストワイドドレープタックトラウザー(インディゴデニム).png",
        // ↓ 新着対象
        isNew: true,
        // ↓ おすすめ対象
        isFeatured: true,
        // ↓ 説明文
        description: "タックの立体的なドレープとハイウエストが魅力の、上品できれいめに履ける濃紺デニムトラウザー。",
        // ↓ カラー：インディゴ
        colors: ["INDIGO"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材表記
        material: "ポリエステル 65%, レーヨン 35%",
        // ↓ 型番
        sku: "MNK-2026-W21"
    // ↓ ID:21終了
    },
    // ↓ 【ウィメンズ 10着目(ID:22)】ライトインディゴデニムワイドパンツのデータ開始
    {
        // ↓ 商品ID: 22
        id: 22,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム)",
        // ↓ 英語名
        nameEn: "High-Waist Wide Drape Pleated Trousers",
        // ↓ カテゴリ：ボトムス
        category: "BOTTOMS",
        // ↓ 価格：2,990円
        price: 2990,
        // ↓ 画像パス
        image: "assets/images/women/ハイウエストワイドドレープタックトラウザー(ライトインディゴデニム).png",
        // ↓ 通常商品
        isNew: false,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "綺麗なドレープ感はそのままに、爽やかなブリーチ加工で抜け感をプラスしたライトブルーデニム。",
        // ↓ カラー：ライトインディゴ
        colors: ["LIGHT INDIGO"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材表記
        material: "ポリエステル 95%, ポリウレタン 5%",
        // ↓ 型番
        sku: "MNK-2026-W22"
    // ↓ ID:22終了
    },
    // ↓ 【ウィメンズ 11着目(ID:23)】迷彩バギーデニムのデータ開始
    {
        // ↓ 商品ID: 23
        id: 23,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "カモフラージュスーパーワイドバギーデニムパンツ",
        // ↓ 英語名
        nameEn: "Camouflage Super Wide Baggy Denim Pants",
        // ↓ カテゴリ：ボトムス
        category: "BOTTOMS",
        // ↓ 価格：3,090円
        price: 3090,
        // ↓ 画像パス
        image: "assets/images/women/カモフラージュスーパーワイドバギーデニムパンツ.png",
        // ↓ 新着対象
        isNew: true,
        // ↓ 通常商品
        isFeatured: false,
        // ↓ 説明文
        description: "落ち着いた迷彩柄と圧倒的なスーパーワイドシルエットで、コーデの主役になるストリートデニム。",
        // ↓ カラー：カモフラージュ
        colors: ["CAMOUFLAGE"],
        // ↓ サイズ展開
        sizes: ["S", "M", "L"],
        // ↓ 素材：コットン100%
        material: "コットン 100%（12ozセルビッジ調デニム）",
        // ↓ 型番
        sku: "MNK-2026-W23"
    // ↓ ID:23終了
    },
    // ↓ 【ウィメンズ 12着目(ID:24)】ワイドスウェットパンツのデータ開始
    {
        // ↓ 商品ID: 24
        id: 24,
        // ↓ レディース向け
        gender: "WOMEN",
        // ↓ 商品名
        name: "タックイージーワイドスウェットパンツ",
        // ↓ 英語名
        nameEn: "Pleated Easy Wide Sweatpants",
        // ↓ カテゴリ：ボトムス
        category: "BOTTOMS",
        // ↓ 価格：3,900円
        price: 3900,
        // ↓ 画像パス
        image: "assets/images/women/タックイージーワイドスウェットパンツ.png",
        // ↓ 新着対象
        isNew: true,
        // ↓ おすすめ対象
        isFeatured: true,
        // ↓ 説明文
        description: "ウエストゴムで楽な履き心地ながら、フロントタックでスラックス風にキレイ見えするスウェットパンツ。",
        // ↓ カラー：チャコール
        colors: ["CHARCOAL"],
        // ↓ サイズ：S, Mの2サイズ展開
        sizes: ["S", "M"],
        // ↓ 素材：レーヨン・ナイロン混
        material: "レーヨン 60%, ナイロン 40%",
        // ↓ 型番
        sku: "MNK-2026-W24"
    // ↓ 24着目（配列末尾）終了
    }
// ↓ SAMPLE_PRODUCTS 配列定義の閉じ括弧
];

// --------------------------------------------------------------------------
