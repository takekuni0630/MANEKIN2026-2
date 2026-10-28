# ==============================================================================
# MANEKIN FASHION - MySQLデータベース初期化スクリプト (setup_db.py)
# データベース作成・テーブル作成・初期サンプル商品データの投入を行います。
# ==============================================================================

# システム操作用モジュール
import sys
# オペレーティングシステム用モジュール
import os
# MySQL接続用PyMySQLモジュール
import pymysql
# 辞書型カーソルを使用するためのモジュール
from pymysql.cursors import DictCursor

# MySQL接続設定（XAMPP標準設定: ホスト=localhost, ポート=3306, ユーザー=root, パスワードなし）
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '',
    'charset': 'utf8mb4'
}

# 作成するデータベース名
DB_NAME = 'manekin_db'

def setup_database():
    """
    MySQLデータベースおよび必要なテーブルを自動構築する関数
    """
    print("=" * 60)
    print("MANEKIN FASHION - データベース初期化を開始します...")
    print("=" * 60)

    try:
        # まずMySQLサーバー本体に接続（DB指定なし）
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # データベースの作成（存在しない場合のみ作成、utf8mb4文字コード指定）
        create_db_query = f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        cursor.execute(create_db_query)
        print(f"[*] データベース `{DB_NAME}` の存在を確認/作成しました。")

        # 作成したデータベースを選択
        cursor.execute(f"USE `{DB_NAME}`;")

        # ----------------------------------------------------------------------
        # 1. users テーブル（会員情報）
        # ----------------------------------------------------------------------
        create_users_table = """
        CREATE TABLE IF NOT EXISTS `users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL COMMENT '会員氏名',
            `email` VARCHAR(150) NOT NULL UNIQUE COMMENT 'メールアドレス',
            `password_hash` VARCHAR(255) NOT NULL COMMENT 'パスワード',
            `rank` VARCHAR(50) DEFAULT 'REGULAR MEMBER' COMMENT '会員ランク',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登録日時'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_users_table)
        print("[*] `users` テーブルを作成/確認しました。")

        # ----------------------------------------------------------------------
        # 2. products テーブル（商品マスタ）
        # ----------------------------------------------------------------------
        create_products_table = """
        CREATE TABLE IF NOT EXISTS `products` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(150) NOT NULL COMMENT '商品名（日本語）',
            `name_en` VARCHAR(150) NOT NULL COMMENT '商品名（英語）',
            `category` VARCHAR(50) NOT NULL COMMENT 'カテゴリ（TOPS, BOTTOMS, OUTER）',
            `price` INT NOT NULL COMMENT '価格（税込・日本円）',
            `image` VARCHAR(255) NOT NULL COMMENT '代表画像URL',
            `description` TEXT COMMENT '商品説明文',
            `material` VARCHAR(255) COMMENT '素材情報',
            `sku` VARCHAR(50) COMMENT '型番・商品コード',
            `is_new` TINYINT(1) DEFAULT 0 COMMENT '新作フラグ',
            `is_featured` TINYINT(1) DEFAULT 0 COMMENT 'おすすめフラグ',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_products_table)
        print("[*] `products` テーブルを作成/確認しました。")

        # ----------------------------------------------------------------------
        # 3. product_variants テーブル（カラー別画像・サイズ・在庫）
        # ----------------------------------------------------------------------
        create_variants_table = """
        CREATE TABLE IF NOT EXISTS `product_variants` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `product_id` INT NOT NULL COMMENT '対象商品ID',
            `color` VARCHAR(50) NOT NULL COMMENT 'カラー名',
            `color_code` VARCHAR(20) DEFAULT '#000000' COMMENT 'カラー表示コード',
            `image_url` VARCHAR(255) NOT NULL COMMENT 'そのカラーに対応する商品画像URL',
            FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_variants_table)
        print("[*] `product_variants` テーブルを作成/確認しました。")

        # ----------------------------------------------------------------------
        # 4. orders テーブル（注文ヘッダー情報）
        # ----------------------------------------------------------------------
        create_orders_table = """
        CREATE TABLE IF NOT EXISTS `orders` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `order_no` VARCHAR(60) NOT NULL UNIQUE COMMENT '注文管理番号',
            `user_id` INT DEFAULT NULL COMMENT '購入会員ID（ゲスト購入時はNULL）',
            `customer_name` VARCHAR(100) NOT NULL COMMENT 'お届け先氏名',
            `customer_email` VARCHAR(150) NOT NULL COMMENT '購入者メールアドレス',
            `postal_code` VARCHAR(20) NOT NULL COMMENT '郵便番号',
            `address` VARCHAR(255) NOT NULL COMMENT 'お届け先住所',
            `phone` VARCHAR(30) NOT NULL COMMENT '電話番号',
            `payment_method` VARCHAR(50) NOT NULL COMMENT '支払方法',
            `delivery_time` VARCHAR(50) DEFAULT '指定なし' COMMENT '配送希望時間帯',
            `subtotal` INT NOT NULL COMMENT '商品小計',
            `shipping_fee` INT NOT NULL DEFAULT 0 COMMENT '送料',
            `total_amount` INT NOT NULL COMMENT '総合計金額',
            `status` VARCHAR(50) DEFAULT '注文受付済み' COMMENT '配送状況ステータス',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注文確定日時'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_orders_table)
        print("[*] `orders` テーブルを作成/確認しました。")

        # ----------------------------------------------------------------------
        # 5. order_items テーブル（注文明細・商品情報）
        # ----------------------------------------------------------------------
        create_order_items_table = """
        CREATE TABLE IF NOT EXISTS `order_items` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `order_id` INT NOT NULL COMMENT '注文ID',
            `product_id` INT NOT NULL COMMENT '商品ID',
            `product_name` VARCHAR(150) NOT NULL COMMENT '商品名',
            `color` VARCHAR(50) NOT NULL COMMENT '選択カラー',
            `size` VARCHAR(20) NOT NULL COMMENT '選択サイズ',
            `quantity` INT NOT NULL DEFAULT 1 COMMENT '購入数量',
            `unit_price` INT NOT NULL COMMENT '商品単価',
            `image_url` VARCHAR(255) COMMENT '購入時の商品画像URL',
            FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_order_items_table)
        print("[*] `order_items` テーブルを作成/確認しました。")

        # ----------------------------------------------------------------------
        # 6. favorites テーブル（お気に入り情報）
        # ----------------------------------------------------------------------
        create_favorites_table = """
        CREATE TABLE IF NOT EXISTS `favorites` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `user_id` INT DEFAULT NULL,
            `product_id` INT NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_favorites_table)
        print("[*] `favorites` テーブルを作成/確認しました。")

        # ----------------------------------------------------------------------
        # 7. 初期サンプル商品データの投入（未登録時のみ）
        # ----------------------------------------------------------------------
        cursor.execute("SELECT COUNT(*) AS cnt FROM `products`;")
        count = cursor.fetchone()[0]

        if count == 0:
            print("[*] 初期商品データを投入します...")

            initial_products = [
                (1, 'プレミアム コットン リラックス Tシャツ', 'Premium Cotton Relaxed T-Shirt', 'TOPS', 2990, 'assets/images/item_tshirt.jpg', '最高級超長綿を100%使用した、滑らかな肌触りと上品な光沢感が特徴のクルーネックTシャツ。程よいドロップショルダー設計で一枚着でもジャケットのインナーでも美しいシルエットを保ちます。', '綿 100%', 'MNK-2026-T01', 1, 1),
                (2, 'スマート テーラード ジャケット', 'Smart Tailored Blazer Jacket', 'OUTER', 9990, 'assets/images/item_jacket.jpg', '現代のビジネスからカジュアルまでシームレスに対応する、モダンフィットな2ボタンテーラードジャケット。軽量でシワになりにくい高機能ウールライク素材を採用し、長時間の着用でも快適です。', 'ポリエステル 70%, レーヨン 26%, ポリウレタン 4%', 'MNK-2026-J02', 1, 1),
                (3, 'ワイド ドレープ タック スラックス', 'Wide Drape Pleated Trousers', 'BOTTOMS', 4990, 'assets/images/item_pants.jpg', '美しい落ち感と深めのツータックが立体的なドレープを生み出すワイドスラックス。ウエスト背面にゴムを仕込み、品格あるスリムな見栄えとリラクシングな履き心地を両立しました。', 'ポリエステル 65%, レーヨン 35%', 'MNK-2026-P03', 0, 1),
                (4, 'ファイン クルーネック ニットセーター', 'Fine Crewneck Knit Sweater', 'TOPS', 3990, 'assets/images/item_knit.jpg', '19.5マイクロンの極細メリノウールブレンド糸を編み上げたミドルゲージニット。チクチク感を抑えた極上の柔らかな肌触りで、一枚でサラリと着こなせる万能な定番アイテムです。', 'ウール 50%, アクリル 50%', 'MNK-2026-K04', 1, 1),
                (5, 'ミニマル ステンカラー ロングコート', 'Minimal Soutien Collar Long Coat', 'OUTER', 14900, 'assets/images/item_coat.jpg', '無駄なディテールを極限まで削ぎ落とした、ミニマルを体現するチェスターステンカラーコート。膝下まで包み込む洗練されたAラインシルエットが都会的な装いを格上げします。', 'ウール 80%, ナイロン 20%', 'MNK-2026-C05', 1, 0),
                (6, 'ヘビーウェイト ボクシー スウェット', 'Heavyweight Boxy Crewneck Sweatshirt', 'TOPS', 3490, 'assets/images/item_tshirt.jpg', '肉厚でタフな14オンス裏毛コットンスウェット生地。程よいハリ感とボクシーなボックスシルエットが、今の気分にフィットするリラックススタイルを演出します。', '綿 100%', 'MNK-2026-S06', 0, 1),
                (7, 'リラックス アンクル テーパードパンツ', 'Relaxed Ankle Tapered Pants', 'BOTTOMS', 4490, 'assets/images/item_pants.jpg', '腰回りに程よいゆとりを持たせつつ、足首に向かってすっきりと絞ったアンクル丈テーパードスラックス。靴元を選ばず、スニーカーにも革靴にもスマートに合わせられます。', 'ポリエステル 68%, レーヨン 28%, ポリウレタン 4%', 'MNK-2026-P07', 0, 0),
                (8, 'ウールライク 2B カジュアルブレザー', 'Wool-Like Casual 2-Button Blazer', 'OUTER', 8990, 'assets/images/item_jacket.jpg', '肩パッドを排したアンコン仕立てにより、カーディガンのように羽織れる軽量カジュアルブレザー。マシンウォッシャブル対応で自宅で手軽にお手入れが可能です。', 'ポリエステル 100%', 'MNK-2026-J08', 1, 0)
            ]

            insert_product_sql = """
            INSERT INTO `products` (`id`, `name`, `name_en`, `category`, `price`, `image`, `description`, `material`, `sku`, `is_new`, `is_featured`)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """
            cursor.executemany(insert_product_sql, initial_products)

            # カラーバリエーションごとの画像対応データ
            # （服の色を変えた時にその色の写真に変わる連動データ）
            initial_variants = [
                # Tシャツ (WHITE, BLACK, HEATHER GREY)
                (1, 'WHITE', '#ffffff', 'assets/images/item_tshirt.jpg'),
                (1, 'BLACK', '#111111', 'assets/images/item_jacket.jpg'),
                (1, 'HEATHER GREY', '#cccccc', 'assets/images/item_knit.jpg'),
                # ジャケット (BLACK, CHARCOAL, NAVY)
                (2, 'BLACK', '#111111', 'assets/images/item_jacket.jpg'),
                (2, 'CHARCOAL', '#333333', 'assets/images/item_coat.jpg'),
                (2, 'NAVY', '#1a237e', 'assets/images/item_tshirt.jpg'),
                # スラックス (CHARCOAL, BLACK, DARK BROWN)
                (3, 'CHARCOAL', '#444444', 'assets/images/item_pants.jpg'),
                (3, 'BLACK', '#111111', 'assets/images/item_jacket.jpg'),
                (3, 'DARK BROWN', '#4e342e', 'assets/images/item_coat.jpg'),
                # ニット (LIGHT GREY, BLACK, OFF WHITE)
                (4, 'LIGHT GREY', '#d6d6d6', 'assets/images/item_knit.jpg'),
                (4, 'BLACK', '#111111', 'assets/images/item_jacket.jpg'),
                (4, 'OFF WHITE', '#fafafa', 'assets/images/item_tshirt.jpg'),
                # コート (BLACK, CHARCOAL)
                (5, 'BLACK', '#111111', 'assets/images/item_coat.jpg'),
                (5, 'CHARCOAL', '#333333', 'assets/images/item_pants.jpg'),
                # スウェット
                (6, 'OFF WHITE', '#fafafa', 'assets/images/item_tshirt.jpg'),
                (6, 'BLACK', '#111111', 'assets/images/item_jacket.jpg'),
                (6, 'ASH GREY', '#9e9e9e', 'assets/images/item_knit.jpg'),
                # テーパードパンツ
                (7, 'BLACK', '#111111', 'assets/images/item_pants.jpg'),
                (7, 'CHARCOAL', '#424242', 'assets/images/item_coat.jpg'),
                # カジュアルブレザー
                (8, 'NAVY', '#1a237e', 'assets/images/item_jacket.jpg'),
                (8, 'BLACK', '#111111', 'assets/images/item_coat.jpg')
            ]

            insert_variant_sql = """
            INSERT INTO `product_variants` (`product_id`, `color`, `color_code`, `image_url`)
            VALUES (%s, %s, %s, %s);
            """
            cursor.executemany(insert_variant_sql, initial_variants)

            # サンプル注文履歴データ
            initial_orders = [
                (1, 'ORD-2026-0982', 1, '山田 太郎', 'demo@manekin.com', '150-0001', '東京都渋谷区神宮前1-1-1', '090-1234-5678', 'クレジットカード', '午前中', 5980, 0, 5980, '配達完了'),
                (2, 'ORD-2026-0851', 1, '山田 太郎', 'demo@manekin.com', '150-0001', '東京都渋谷区神宮前1-1-1', '090-1234-5678', 'クレジットカード', '14:00-16:00', 9990, 0, 9990, '配達完了'),
                (3, 'ORD-2026-0710', 1, '山田 太郎', 'demo@manekin.com', '150-0001', '東京都渋谷区神宮前1-1-1', '090-1234-5678', 'PayPay', '指定なし', 4990, 550, 5540, '配達完了')
            ]

            insert_order_sql = """
            INSERT INTO `orders` (`id`, `order_no`, `user_id`, `customer_name`, `customer_email`, `postal_code`, `address`, `phone`, `payment_method`, `delivery_time`, `subtotal`, `shipping_fee`, `total_amount`, `status`)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """
            cursor.executemany(insert_order_sql, initial_orders)

            initial_order_items = [
                (1, 1, 'プレミアム コットン リラックス Tシャツ', 'WHITE', 'L', 2, 2990, 'assets/images/item_tshirt.jpg'),
                (2, 2, 'スマート テーラード ジャケット', 'BLACK', 'M', 1, 9990, 'assets/images/item_jacket.jpg'),
                (3, 3, 'ワイド ドレープ タック スラックス', 'CHARCOAL', 'M', 1, 4990, 'assets/images/item_pants.jpg')
            ]

            insert_order_items_sql = """
            INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `color`, `size`, `quantity`, `unit_price`, `image_url`)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """
            cursor.executemany(insert_order_items_sql, initial_order_items)

            conn.commit()
            print("[+] サンプル商品および注文データを投入しました。")

        # 接続の終了
        conn.commit()
        cursor.close()
        conn.close()

        print("=" * 60)
        print("MySQLデータベースのセットアップが正常に完了しました！")
        print("=" * 60)
        return True

    except Exception as e:
        print(f"[!] データベース初期化エラー: {e}")
        return False

if __name__ == '__main__':
    setup_database()
