# ==============================================================================
# 注文履歴初期化スクリプト (clear_orders.py)
# XAMPP MySQL の orders および order_items を完全にクリアして初期状態（0件）にします
# ==============================================================================
import pymysql
from pymysql.cursors import DictCursor

DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': '',
    'database': 'manekin_db',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor
}

def main():
    print("=" * 60)
    print("【MANEKIN FASHION】注文履歴の完全初期化（クリア）ツール")
    print("=" * 60)
    try:
        conn = pymysql.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM `order_items`;")
            cursor.execute("DELETE FROM `orders`;")
        conn.commit()
        conn.close()
        print("✅ 完了: MySQL (manekin_db) 内の全注文履歴を完全に削除しました（0件）。")
        print("   これで初期状態から新しく注文をお試しいただけます。")
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        print("   ※ XAMPPのMySQLが起動しているか確認してください。")

if __name__ == '__main__':
    main()

