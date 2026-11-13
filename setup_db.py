# ==============================================================================
#  MySQL データベース初期化・初期商品画像マッピング更新スクリプト (setup_db.py)
#  manekin_db の作成確認と、products テーブルの商品画像パスを登録します
#  ※商品ごとのカラーバリエーションは廃止されたため、PRODUCT_IMAGE_MAPPING は不要となりました
# ==============================================================================

# Python のシステム機能を提供する標準ライブラリ sys を読み込みます
import sys
# OS のパス・環境操作を行う標準ライブラリ os を読み込みます
import os
# Python から MySQL へ接続して SQL を実行するための pymysql を読み込みます
import pymysql
# SQL 結果を辞書形式で扱うための DictCursor を読み込みます
from pymysql.cursors import DictCursor

# データベース作成前でも接続できるよう、database 名を指定しない初期接続設定を定義します
DB_CONFIG = {
    # 接続先 MySQL の IP アドレス（127.0.0.1 ＝ ローカル環境）です
    'host': '127.0.0.1',
    # XAMPP の MySQL 標準ポート番号（3306）です
    'port': 3306,
    # MySQL の接続ユーザー名（XAMPP 既定の root）です
    'user': 'root',
    # MySQL の接続パスワード（XAMPP 初期設定は空文字）です
    'password': '',
    # 日本語・絵文字対応の UTF-8 文字コード（utf8mb4）を指定します
    'charset': 'utf8mb4'
}

# 作成および操作対象にするデータベース名 'manekin_db' を定数に入れます
DB_NAME = 'manekin_db'


# データベース作成と商品代表画像の更新を実行する関数 setup_database() を定義します
def setup_database():
    # 開始メッセージ上部の区切り線を表示します
    print("=" * 60)
    # データベース更新処理の開始メッセージを画面に表示します
    print("MANEKIN FASHION - データベース初期化・画像パス更新を開始します...")
    # 開始メッセージ下部の区切り線を表示します
    print("=" * 60)

    # MySQL 接続や SQL 実行の失敗に備えて try ブロックを開始します
    try:
        # DB_CONFIG の設定を使って MySQL サーバーへ接続します
        conn = pymysql.connect(**DB_CONFIG)
        # SQL クエリを送るためのカーソルオブジェクトを作成します
        cursor = conn.cursor()

        # manekin_db が未作成なら utf8mb4 文字コード設定付きで新しくデータベースを作成します
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        # 以降の SQL 命令を実行する対象データベースを manekin_db に切り替えます
        cursor.execute(f"USE `{DB_NAME}`;")

        # 各商品カードに最初に表示される代表画像パス (商品ID, 画像パス) の一覧を用意します
        main_images = [
            (1, 'assets/images/men/オーバードレープダブルトレンチコート.png'),
            (2, 'assets/images/men/リラックスダブルブレストテーラードジャケット.png'),
            (3, 'assets/images/men/シングルブレストフェイクレザージャケット.png'),
            (4, 'assets/images/men/バッファローチェックボアジップジャケット.png'),
            (5, 'assets/images/men/アーバングレイジップフーディ.png'),
            (6, 'assets/images/men/チャコールブークニット.png'),
            (7, 'assets/images/men/スカイオックスフォードシャツ.png'),
        ]
        # 代表画像リストを 1 件ずつ順番に取り出しながらループ処理します
        for pid, img in main_images:
            # プレースホルダ %s を安全に使って products テーブルの代表画像列を更新します
            cursor.execute("UPDATE `products` SET `image` = %s WHERE `id` = %s;", (img, pid))

        # 旧データ仕様で残っていた不要な商品（ID=8）があれば削除します
        cursor.execute("DELETE FROM `products` WHERE `id` = 8;")

        # カラーバリエーションは廃止されたため、古い product_variants レコードをクリアします
        cursor.execute("SHOW TABLES LIKE 'product_variants';")
        if cursor.fetchone():
            cursor.execute("DELETE FROM `product_variants`;")

        # 会員別所持クーポン管理テーブル `user_coupons` を作成します（使用したら消滅）
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS `user_coupons` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `user_id` int(11) NOT NULL,
              `code` varchar(50) NOT NULL,
              `name` varchar(255) NOT NULL,
              `discount_rate` decimal(4,2) NOT NULL DEFAULT 0.10,
              `discount_label` varchar(50) NOT NULL DEFAULT '1割引 (10% OFF)',
              `is_used` tinyint(1) NOT NULL DEFAULT 0,
              `used_at` datetime DEFAULT NULL,
              `created_at` datetime NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`id`),
              KEY `idx_coupon_user` (`user_id`),
              CONSTRAINT `fk_coupon_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        """)

        # orders テーブルに customer_name / coupon_code / coupon_discount カラムを追加します
        cursor.execute("SHOW COLUMNS FROM `orders` LIKE 'customer_name';")
        if not cursor.fetchone():
            try:
                cursor.execute("ALTER TABLE `orders` ADD COLUMN `customer_name` varchar(255) DEFAULT NULL AFTER `user_id`;")
            except Exception:
                pass

        cursor.execute("SHOW COLUMNS FROM `orders` LIKE 'coupon_code';")
        if not cursor.fetchone():
            try:
                cursor.execute("ALTER TABLE `orders` ADD COLUMN `coupon_code` varchar(50) DEFAULT NULL AFTER `earned_points`;")
            except Exception:
                pass

        cursor.execute("SHOW COLUMNS FROM `orders` LIKE 'coupon_discount';")
        if not cursor.fetchone():
            try:
                cursor.execute("ALTER TABLE `orders` ADD COLUMN `coupon_discount` int(11) NOT NULL DEFAULT 0 AFTER `coupon_code`;")
            except Exception:
                pass

        # UPDATE / DELETE の変更をすべてデータベースへ保存確定（commit）します
        conn.commit()
        # 使い終わったカーソルを閉じます
        cursor.close()
        # MySQL サーバーとの接続を閉じます
        conn.close()

        # 画像マッピングの更新が正常完了したことを画面に表示します
        print("[+] MySQLの代表画像ファイルパス更新完了！（カラーバリエーションは廃止・整理済）")
        # 処理成功を表す True を呼び出し元へ返します
        return True

    # 途中で例外エラーが発生した場合の処理を受け持ちます
    except Exception as e:
        # エラー内容を画面に表示します
        print(f"[!] エラー: {e}")
        # 処理失敗を表す False を返します
        return False


# コマンドプロンプト等から「python setup_db.py」で直接起動された場合だけ実行します
if __name__ == '__main__':
    # setup_database() を呼び出して更新を実行します
    setup_database()
