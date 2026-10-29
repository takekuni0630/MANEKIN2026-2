# ==============================================================================
# MANEKIN FASHION - MySQLデータベース初期化スクリプト (setup_db.py)
# ユーザー様が自分で作った写真を入れやすい分かりやすいファイル名に設定
# ==============================================================================

import sys
import os
import pymysql
from pymysql.cursors import DictCursor

DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '',
    'charset': 'utf8mb4'
}

DB_NAME = 'manekin_db'

# ==============================================================================
# ★【ユーザー様用 写真差し替え対応リスト】
# ここに指定されている画像ファイル（assets/images/...）をご自身の写真に上書き保存するだけでOKです
# ==============================================================================
PRODUCT_IMAGE_MAPPING = [
    # 1. プレミアム コットン リラックス Tシャツ
    (1, 'WHITE',        '#ffffff', 'assets/images/tshirt_white.jpg'),
    (1, 'BLACK',        '#111111', 'assets/images/tshirt_black.jpg'),
    (1, 'HEATHER GREY', '#999999', 'assets/images/tshirt_grey.jpg'),

    # 2. スマート テーラード ジャケット
    (2, 'BLACK',        '#111111', 'assets/images/jacket_black.jpg'),
    (2, 'CHARCOAL',     '#333333', 'assets/images/jacket_charcoal.jpg'),
    (2, 'NAVY',         '#1a237e', 'assets/images/jacket_navy.jpg'),

    # 3. ワイド ドレープ タック スラックス
    (3, 'CHARCOAL',     '#444444', 'assets/images/pants_charcoal.jpg'),
    (3, 'BLACK',        '#111111', 'assets/images/pants_black.jpg'),
    (3, 'DARK BROWN',   '#4e342e', 'assets/images/pants_brown.jpg'),

    # 4. ファイン クルーネック ニットセーター
    (4, 'LIGHT GREY',   '#d6d6d6', 'assets/images/knit_grey.jpg'),
    (4, 'BLACK',        '#111111', 'assets/images/knit_black.jpg'),
    (4, 'OFF WHITE',    '#fafafa', 'assets/images/knit_white.jpg'),

    # 5. ミニマル ステンカラー ロングコート
    (5, 'BLACK',        '#111111', 'assets/images/coat_black.jpg'),
    (5, 'CHARCOAL',     '#333333', 'assets/images/coat_charcoal.jpg'),

    # 6. ヘビーウェイト ボクシー スウェット
    (6, 'OFF WHITE',    '#fafafa', 'assets/images/sweat_white.jpg'),
    (6, 'BLACK',        '#111111', 'assets/images/sweat_black.jpg'),
    (6, 'ASH GREY',     '#9e9e9e', 'assets/images/sweat_grey.jpg'),

    # 7. リラックス アンクル テーパードパンツ
    (7, 'BLACK',        '#111111', 'assets/images/tapered_black.jpg'),
    (7, 'CHARCOAL',     '#424242', 'assets/images/tapered_charcoal.jpg')
]

def setup_database():
    print("=" * 60)
    print("MANEKIN FASHION - データベース画像マッピング更新を開始します...")
    print("=" * 60)

    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        cursor.execute(f"USE `{DB_NAME}`;")

        # 代表商品画像のパスを更新
        main_images = [
            (1, 'assets/images/tshirt_white.jpg'),
            (2, 'assets/images/jacket_black.jpg'),
            (3, 'assets/images/pants_charcoal.jpg'),
            (4, 'assets/images/knit_grey.jpg'),
            (5, 'assets/images/coat_black.jpg'),
            (6, 'assets/images/sweat_white.jpg'),
            (7, 'assets/images/tapered_black.jpg'),
        ]
        for pid, img in main_images:
            cursor.execute("UPDATE `products` SET `image` = %s WHERE `id` = %s;", (img, pid))

        # 削除された商品（id: 8）があればテーブルから削除
        cursor.execute("DELETE FROM `products` WHERE `id` = 8;")

        # バリエーションテーブルのデータを全削除して再投入
        cursor.execute("DELETE FROM `product_variants`;")
        insert_variant_sql = """
        INSERT INTO `product_variants` (`product_id`, `color`, `color_code`, `image_url`)
        VALUES (%s, %s, %s, %s);
        """
        cursor.executemany(insert_variant_sql, PRODUCT_IMAGE_MAPPING)

        conn.commit()
        cursor.close()
        conn.close()

        print("[+] MySQLの画像ファイルパスをわかりやすい名称に更新完了！")
        return True

    except Exception as e:
        print(f"[!] エラー: {e}")
        return False

if __name__ == '__main__':
    setup_database()
