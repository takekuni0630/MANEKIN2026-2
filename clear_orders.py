# ==============================================================================
#  注文履歴初期化ツール (clear_orders.py)
#  XAMPP の MySQL (manekin_db) に保存されている全アカウントの注文データを 0 件に初期化します
# ==============================================================================

# Python から MySQL データベースへ接続・SQL 実行するためのライブラリ pymysql を読み込みます
import pymysql
# SQL の検索結果を番号ではなく列名（辞書形式）で取得できる DictCursor 設定を読み込みます
from pymysql.cursors import DictCursor

# 接続先の MySQL（XAMPP）の住所・ログイン情報をまとめた辞書定数 DB_CONFIG を定義します
DB_CONFIG = {
    # 接続先サーバーの IP アドレス（127.0.0.1 ＝ このパソコン自身）を指定します
    'host': '127.0.0.1',
    # MySQL が待ち受けている通信ポート番号（XAMPP 標準の 3306）を指定します
    'port': 3306,
    # MySQL へログインするユーザー名（XAMPP 初期設定の管理者 root）を指定します
    'user': 'root',
    # ログインパスワード（XAMPP 初期状態では空文字）を指定します
    'password': '',
    # 操作対象となるデータベース名（manekin_db）を指定します
    'database': 'manekin_db',
    # 日本語や絵文字が文字化けしない文字コード utf8mb4 を指定します
    'charset': 'utf8mb4',
    # 取得結果の各行を辞書 {'列名': 値} で返すように設定します
    'cursorclass': DictCursor
}


# 注文明細（order_items）と注文ヘッダ（orders）を全件削除する main 関数を定義します
def main():
    # コンソール見出しの上線（'=' を 60 個つなげた線）を表示します
    print("=" * 60)
    # ツールの実行タイトルをコンソールへ表示します
    print("【MANEKIN FASHION】注文履歴の完全初期化（クリア）ツール")
    # コンソール見出しの下線を表示します
    print("=" * 60)

    # MySQL 停止中などのエラーでプログラムが強制終了しないよう try ブロックで例外を監視します
    try:
        # DB_CONFIG の辞書内容をキーワード引数（**）として展開し、MySQL へ実際に接続します
        conn = pymysql.connect(**DB_CONFIG)
        # SQL 命令を実行するためのカーソルを取得します（with で抜けたら自動解放されます）
        with conn.cursor() as cursor:
            # 外部キー制約に引っかからないよう、まず子テーブルの「注文明細（order_items）」を全削除します
            cursor.execute("DELETE FROM `order_items`;")
            # 続いて親テーブルの「注文本体（orders）」を全削除します
            cursor.execute("DELETE FROM `orders`;")

        # トランザクションを確定（commit）し、削除変更をデータベースに正式反映させます
        conn.commit()
        # 使い終わった MySQL との接続を閉じます
        conn.close()
        # 全注文データの削除が成功したことをコンソールに表示します
        print("✅ 完了: MySQL (manekin_db) 内の全注文履歴を完全に削除しました（0件）。")
        # 初期状態から再テストできる案内メッセージを表示します
        print("   これで初期状態から新しく注文をお試しいただけます。")
    # 接続エラーや SQL エラーが起きたときに処理を引き継ぐ except ブロックです
    except Exception as e:
        # 発生した具体的なエラー内容（e）をコンソールに表示します
        print(f"❌ エラーが発生しました: {e}")
        # XAMPP Control Panel で MySQL が起動中か確認するよう案内します
        print("   ※ XAMPPのMySQLが起動しているか確認してください。")


# このファイルがコマンド「python clear_orders.py」で直接実行された場合だけ True になります
if __name__ == '__main__':
    # 上で定義した main() 関数を呼び出して削除処理を実行します
    main()
