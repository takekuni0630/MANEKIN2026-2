# ==============================================================================
#  MySQL データベース初期化・初期商品画像マッピング更新スクリプト (setup_db.py)
#  manekin_db の作成確認と、products / product_variants テーブルの商品画像パスを登録します
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

# (商品ID, カラー名, 色見本コード, 画像パス) の組み合わせ一覧を配列で定義します
PRODUCT_IMAGE_MAPPING = [
    # 商品ID 1 の WHITE カラー用色コードと画像パスを定義します
    (1, 'WHITE',        '#ffffff', 'assets/images/tshirt_white.jpg'),
    # 商品ID 1 の BLACK カラー用色コードと画像パスを定義します
    (1, 'BLACK',        '#111111', 'assets/images/tshirt_black.jpg'),
    # 商品ID 1 の HEATHER GREY カラー用色コードと画像パスを定義します
    (1, 'HEATHER GREY', '#999999', 'assets/images/tshirt_grey.jpg'),

    # 商品ID 2 の BLACK カラー用色コードと画像パスを定義します
    (2, 'BLACK',        '#111111', 'assets/images/jacket_black.jpg'),
    # 商品ID 2 の CHARCOAL カラー用色コードと画像パスを定義します
    (2, 'CHARCOAL',     '#333333', 'assets/images/jacket_charcoal.jpg'),
    # 商品ID 2 の NAVY カラー用色コードと画像パスを定義します
    (2, 'NAVY',         '#1a237e', 'assets/images/jacket_navy.jpg'),

    # 商品ID 3 の CHARCOAL カラー用色コードと画像パスを定義します
    (3, 'CHARCOAL',     '#444444', 'assets/images/pants_charcoal.jpg'),
    # 商品ID 3 の BLACK カラー用色コードと画像パスを定義します
    (3, 'BLACK',        '#111111', 'assets/images/pants_black.jpg'),
    # 商品ID 3 の DARK BROWN カラー用色コードと画像パスを定義します
    (3, 'DARK BROWN',   '#4e342e', 'assets/images/pants_brown.jpg'),

    # 商品ID 4 の LIGHT GREY カラー用色コードと画像パスを定義します
    (4, 'LIGHT GREY',   '#d6d6d6', 'assets/images/knit_grey.jpg'),
    # 商品ID 4 の BLACK カラー用色コードと画像パスを定義します
    (4, 'BLACK',        '#111111', 'assets/images/knit_black.jpg'),
    # 商品ID 4 の OFF WHITE カラー用色コードと画像パスを定義します
    (4, 'OFF WHITE',    '#fafafa', 'assets/images/knit_white.jpg'),

    # 商品ID 5 の BLACK カラー用色コードと画像パスを定義します
    (5, 'BLACK',        '#111111', 'assets/images/coat_black.jpg'),
    # 商品ID 5 の CHARCOAL カラー用色コードと画像パスを定義します
    (5, 'CHARCOAL',     '#333333', 'assets/images/coat_charcoal.jpg'),

    # 商品ID 6 の OFF WHITE カラー用色コードと画像パスを定義します
    (6, 'OFF WHITE',    '#fafafa', 'assets/images/sweat_white.jpg'),
    # 商品ID 6 の BLACK カラー用色コードと画像パスを定義します
    (6, 'BLACK',        '#111111', 'assets/images/sweat_black.jpg'),
    # 商品ID 6 の ASH GREY カラー用色コードと画像パスを定義します
    (6, 'ASH GREY',     '#9e9e9e', 'assets/images/sweat_grey.jpg'),

    # 商品ID 7 の BLACK カラー用色コードと画像パスを定義します
    (7, 'BLACK',        '#111111', 'assets/images/tapered_black.jpg'),
    # 商品ID 7 の CHARCOAL カラー用色コードと画像パスを定義します
    (7, 'CHARCOAL',     '#424242', 'assets/images/tapered_charcoal.jpg')
]


# データベース作成と商品画像マッピングの一括更新を実行する関数 setup_database() を定義します
def setup_database():
    # 開始メッセージ上部の区切り線を表示します
    print("=" * 60)
    # データベース更新処理の開始メッセージを画面に表示します
    print("MANEKIN FASHION - データベース画像マッピング更新を開始します...")
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
            # 商品ID 1 の代表画像パスをセットします
            (1, 'assets/images/tshirt_white.jpg'),
            # 商品ID 2 の代表画像パスをセットします
            (2, 'assets/images/jacket_black.jpg'),
            # 商品ID 3 の代表画像パスをセットします
            (3, 'assets/images/pants_charcoal.jpg'),
            # 商品ID 4 の代表画像パスをセットします
            (4, 'assets/images/knit_grey.jpg'),
            # 商品ID 5 の代表画像パスをセットします
            (5, 'assets/images/coat_black.jpg'),
            # 商品ID 6 の代表画像パスをセットします
            (6, 'assets/images/sweat_white.jpg'),
            # 商品ID 7 の代表画像パスをセットします
            (7, 'assets/images/tapered_black.jpg'),
        ]
        # 代表画像リストを 1 件ずつ順番に取り出しながらループ処理します
        for pid, img in main_images:
            # プレースホルダ %s を安全に使って products テーブルの代表画像列を更新します
            cursor.execute("UPDATE `products` SET `image` = %s WHERE `id` = %s;", (img, pid))

        # 旧データ仕様で残っていた不要な商品（ID=8）があれば削除します
        cursor.execute("DELETE FROM `products` WHERE `id` = 8;")

        # 古い色バリエーション設定を一度リセットするため product_variants を全削除します
        cursor.execute("DELETE FROM `product_variants`;")
        # product_variants テーブルへ 4 列（商品ID・色名・色コード・画像URL）を挿入する複数行SQL文を定義します
        insert_variant_sql = """
        INSERT INTO `product_variants` (`product_id`, `color`, `color_code`, `image_url`)
        VALUES (%s, %s, %s, %s);
        """
        # PRODUCT_IMAGE_MAPPING の全データを executemany() で一気に一括登録します
        cursor.executemany(insert_variant_sql, PRODUCT_IMAGE_MAPPING)

        # UPDATE / DELETE / INSERT の変更をすべてデータベースへ保存確定（commit）します
        conn.commit()
        # 使い終わったカーソルを閉じます
        cursor.close()
        # MySQL サーバーとの接続を閉じます
        conn.close()

        # 画像マッピングの更新が正常完了したことを画面に表示します
        print("[+] MySQLの画像ファイルパスをわかりやすい名称に更新完了！")
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
