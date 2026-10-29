# MANEKIN FASHION - ECサイト プロジェクト

UNIQLOやGUのようなシンプル・ミニマル・モノトーンを基調とした、20〜30代向けモダンアパレルECサイトです。

---

## ★ 写真（画像ファイル）の差し替え方法

ご自身で生成・撮影された写真画像は、**`assets/images/` フォルダ** 内の各ファイルに「上書き保存」するだけで即座にWebサイトへ反映されます。  
コード（HTML / CSS / JS / Python）やデータベースを変更する必要はありません。

### 【差し替え用 画像ファイル名一覧】（全8アイテム × 全カラー）

| 商品名 | カラー | 保存先ファイル名 |
| :--- | :--- | :--- |
| **1. プレミアム コットン リラックス Tシャツ** | WHITE (白) | `assets/images/tshirt_white.jpg` |
| | BLACK (黒) | `assets/images/tshirt_black.jpg` |
| | HEATHER GREY (灰) | `assets/images/tshirt_grey.jpg` |
| **2. スマート テーラード ジャケット** | BLACK (黒) | `assets/images/jacket_black.jpg` |
| | CHARCOAL (炭灰) | `assets/images/jacket_charcoal.jpg` |
| | NAVY (紺) | `assets/images/jacket_navy.jpg` |
| **3. ワイド ドレープ タック スラックス** | CHARCOAL (炭灰) | `assets/images/pants_charcoal.jpg` |
| | BLACK (黒) | `assets/images/pants_black.jpg` |
| | DARK BROWN (茶) | `assets/images/pants_brown.jpg` |
| **4. ファイン クルーネック ニットセーター** | LIGHT GREY (明灰) | `assets/images/knit_grey.jpg` |
| | BLACK (黒) | `assets/images/knit_black.jpg` |
| | OFF WHITE (白) | `assets/images/knit_white.jpg` |
| **5. ミニマル ステンカラー ロングコート** | BLACK (黒) | `assets/images/coat_black.jpg` |
| | CHARCOAL (炭灰) | `assets/images/coat_charcoal.jpg` |
| **6. ヘビーウェイト ボクシー スウェット** | OFF WHITE (白) | `assets/images/sweat_white.jpg` |
| | BLACK (黒) | `assets/images/sweat_black.jpg` |
| | ASH GREY (灰) | `assets/images/sweat_grey.jpg` |
| **7. リラックス アンクル テーパードパンツ** | BLACK (黒) | `assets/images/tapered_black.jpg` |
| | CHARCOAL (炭灰) | `assets/images/tapered_charcoal.jpg` |
| **トップページ 看板メイン画像** | - | `assets/images/hero.jpg` |

> **画像の推奨形式**:
> - 商品写真: JPEG (`.jpg`)、縦横比 `3:4` または `1:1`（例: 800×1000px）
> - メイン看板 (hero.jpg): JPEG (`.jpg`)、横長 `16:9`（例: 1920×1080px）

---

## サイトの確認・起動方法

### 方法1: ブラウザで開く（一番簡単）
- [index.html](file:///c:/xampp/htdocs/Antigravity/MANEKIN2026-2/index.html) をGoogle Chromeなどのブラウザでダブルクリックして開くだけで、商品一覧・詳細・色切り替え・カート・チェックアウトの全デザインと動作を確認できます。

### 方法2: Python + MySQL バックエンド連携（本格稼働）
1. XAMPPでMySQLを起動
2. ターミナルで `python app.py` を実行（現在ポート5000でバックグラウンド稼働中）
3. ブラウザで `http://localhost:5000` または `http://localhost/Antigravity/MANEKIN2026-2/` にアクセス

---

## ファイル構成と役割

- [index.html](file:///c:/xampp/htdocs/Antigravity/MANEKIN2026-2/index.html) : サイトの骨組み（全ページUI、モーダル、通知）
- [css/style.css](file:///c:/xampp/htdocs/Antigravity/MANEKIN2026-2/css/style.css) : デザイン・スタイリング（モノトーン、レスポンシブ、アニメーション）
- [js/app.js](file:///c:/xampp/htdocs/Antigravity/MANEKIN2026-2/js/app.js) : フロントエンド機能（色切り替え、サイズ選択、カート、購入履歴表示など）
- [app.py](file:///c:/xampp/htdocs/Antigravity/MANEKIN2026-2/app.py) : バックエンドAPI（Python Flask + MySQLトランザクション）
- [setup_db.py](file:///c:/xampp/htdocs/Antigravity/MANEKIN2026-2/setup_db.py) : MySQLデータベース・テーブル自動初期化スクリプト
- `assets/images/` : 商品写真・バナー画像の格納フォルダ
