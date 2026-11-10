# ==============================================================================
# MANEKIN FASHION - MySQLデータベース初期化スクリプト (setup_db.py)
# ユーザー様が自分で作った写真を入れやすい分かりやすいファイル名に設定
# ==============================================================================

# Pythonの実行環境に関する情報や機能を使うための標準モジュール「sys」を読み込みます
import sys
# ファイルやフォルダの操作（OS機能）を使うための標準モジュール「os」を読み込みます
import os
# PythonからMySQLデータベースへ接続してSQLを実行するための外部ライブラリ「pymysql」を読み込みます
import pymysql
# データベースの検索結果を番号ではなく列名（辞書形式）で受け取れるようにする機能「DictCursor」を読み込みます
from pymysql.cursors import DictCursor

# MySQLデータベースへ接続するための設定情報をまとめた辞書（DB_CONFIG）を定義します
DB_CONFIG = {
    'host': '127.0.0.1',      # データベースが動いているコンピュータの住所（127.0.0.1は自分のパソコン＝localhostを指します）
    'port': 3306,             # MySQLが通信を待ち受けるポート番号（XAMPPの標準は3306番です）
    'user': 'root',           # MySQLにログインするユーザー名（初期状態では管理者アカウントのrootを使用します）
    'password': '',           # MySQLのパスワード（XAMPPの初期設定では空文字＝パスワードなしです）
    'charset': 'utf8mb4'      # 日本語や絵文字も文字化けせず保存できる最新のUTF-8文字コード設定です
}

# 操作対象となるこのアプリ専用のデータベース名を定数「DB_NAME」に入れます
DB_NAME = 'manekin_db'

# ==============================================================================
# ★【ユーザー様用 写真差し替え対応リスト】
# ここに指定されている画像ファイル（assets/images/...）をご自身の写真に上書き保存するだけでOKです
# ==============================================================================
# 商品ごとのカラーバリエーションと画像パスの組み合わせをリスト（タプルの配列）として定義します
PRODUCT_IMAGE_MAPPING = [
    # 1. プレミアム コットン リラックス Tシャツ（商品ID=1 の3色展開: 白・黒・ヘザーグレー）
    (1, 'WHITE',        '#ffffff', 'assets/images/tshirt_white.jpg'),   # 商品1: ホワイト用のカラーコードと画像パス
    (1, 'BLACK',        '#111111', 'assets/images/tshirt_black.jpg'),   # 商品1: ブラック用のカラーコードと画像パス
    (1, 'HEATHER GREY', '#999999', 'assets/images/tshirt_grey.jpg'),    # 商品1: ヘザーグレー用のカラーコードと画像パス

    # 2. スマート テーラード ジャケット（商品ID=2 の3色展開: 黒・チャコール・ネイビー）
    (2, 'BLACK',        '#111111', 'assets/images/jacket_black.jpg'),   # 商品2: ブラック用のカラーコードと画像パス
    (2, 'CHARCOAL',     '#333333', 'assets/images/jacket_charcoal.jpg'),# 商品2: チャコール用のカラーコードと画像パス
    (2, 'NAVY',         '#1a237e', 'assets/images/jacket_navy.jpg'),    # 商品2: ネイビー用のカラーコードと画像パス

    # 3. ワイド ドレープ タック スラックス（商品ID=3 の3色展開: チャコール・黒・ダークブラウン）
    (3, 'CHARCOAL',     '#444444', 'assets/images/pants_charcoal.jpg'), # 商品3: チャコール用のカラーコードと画像パス
    (3, 'BLACK',        '#111111', 'assets/images/pants_black.jpg'),    # 商品3: ブラック用のカラーコードと画像パス
    (3, 'DARK BROWN',   '#4e342e', 'assets/images/pants_brown.jpg'),    # 商品3: ダークブラウン用のカラーコードと画像パス

    # 4. ファイン クルーネック ニットセーター（商品ID=4 の3色展開: ライトグレー・黒・オフホワイト）
    (4, 'LIGHT GREY',   '#d6d6d6', 'assets/images/knit_grey.jpg'),      # 商品4: ライトグレー用のカラーコードと画像パス
    (4, 'BLACK',        '#111111', 'assets/images/knit_black.jpg'),     # 商品4: ブラック用のカラーコードと画像パス
    (4, 'OFF WHITE',    '#fafafa', 'assets/images/knit_white.jpg'),     # 商品4: オフホワイト用のカラーコードと画像パス

    # 5. ミニマル ステンカラー ロングコート（商品ID=5 の2色展開: 黒・チャコール）
    (5, 'BLACK',        '#111111', 'assets/images/coat_black.jpg'),     # 商品5: ブラック用のカラーコードと画像パス
    (5, 'CHARCOAL',     '#333333', 'assets/images/coat_charcoal.jpg'),  # 商品5: チャコール用のカラーコードと画像パス

    # 6. ヘビーウェイト ボクシー スウェット（商品ID=6 の3色展開: オフホワイト・黒・アッシュグレー）
    (6, 'OFF WHITE',    '#fafafa', 'assets/images/sweat_white.jpg'),    # 商品6: オフホワイト用のカラーコードと画像パス
    (6, 'BLACK',        '#111111', 'assets/images/sweat_black.jpg'),    # 商品6: ブラック用のカラーコードと画像パス
    (6, 'ASH GREY',     '#9e9e9e', 'assets/images/sweat_grey.jpg'),     # 商品6: アッシュグレー用のカラーコードと画像パス

    # 7. リラックス アンクル テーパードパンツ（商品ID=7 の2色展開: 黒・チャコール）
    (7, 'BLACK',        '#111111', 'assets/images/tapered_black.jpg'),  # 商品7: ブラック用のカラーコードと画像パス
    (7, 'CHARCOAL',     '#424242', 'assets/images/tapered_charcoal.jpg')# 商品7: チャコール用のカラーコードと画像パス
]

# データベースと商品画像マッピングを更新するメイン関数「setup_database」を定義します
def setup_database():
    # コンソール（黒い画面）に区切り線の「=」を60個並べて表示します
    print("=" * 60)
    # 処理が開始されたことを知らせるメッセージを表示します
    print("MANEKIN FASHION - データベース画像マッピング更新を開始します...")
    # 再び区切り線を60文字分表示します
    print("=" * 60)

    # データベース接続やSQL実行でエラーが起きても安全に捕捉できるよう try ブロックを開始します
    try:
        # **DB_CONFIG で辞書の接続設定を展開して渡し、MySQLサーバーに接続（conn）します
        conn = pymysql.connect(**DB_CONFIG)
        # SQL文をデータベースに送信して実行するためのカーソル（操作窓口）を作成します
        cursor = conn.cursor()

        # もし指定名のデータベースがまだ存在しなければ、UTF-8（utf8mb4）対応で新規作成するSQLを実行します
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        # これから実行するSQLの操作対象として、先ほどのデータベース（manekin_db）を選択します
        cursor.execute(f"USE `{DB_NAME}`;")

        # 代表商品画像のパスを更新
        # 商品一覧などで最初に表示される各商品のメイン画像パスを (商品ID, 画像パス) のペアでリスト化します
        main_images = [
            (1, 'assets/images/tshirt_white.jpg'),   # 商品1（Tシャツ）の代表画像パス
            (2, 'assets/images/jacket_black.jpg'),   # 商品2（ジャケット）の代表画像パス
            (3, 'assets/images/pants_charcoal.jpg'), # 商品3（スラックス）の代表画像パス
            (4, 'assets/images/knit_grey.jpg'),      # 商品4（ニット）の代表画像パス
            (5, 'assets/images/coat_black.jpg'),     # 商品5（コート）の代表画像パス
            (6, 'assets/images/sweat_white.jpg'),    # 商品6（スウェット）の代表画像パス
            (7, 'assets/images/tapered_black.jpg'),  # 商品7（テーパードパンツ）の代表画像パス
        ]
        # main_images リストから商品ID（pid）と画像パス（img）を1件ずつ取り出してループします
        for pid, img in main_images:
            # 対象IDの商品の image 列を新しい画像パスで上書き更新（UPDATE）します（%s はSQLインジェクションを防ぐプレースホルダ）
            cursor.execute("UPDATE `products` SET `image` = %s WHERE `id` = %s;", (img, pid))

        # 削除された商品（id: 8）があればテーブルから削除
        # 旧バージョンに存在した不要な商品ID=8のレコードを products テーブルから削除します
        cursor.execute("DELETE FROM `products` WHERE `id` = 8;")

        # バリエーションテーブルのデータを全削除して再投入
        # 古い色バリエーションデータが残って重複しないよう、product_variants テーブルを一度空にします
        cursor.execute("DELETE FROM `product_variants`;")
        # 4つの値（商品ID, 色名, カラーコード, 画像URL）をバリエーションテーブルに挿入するSQL文を用意します
        insert_variant_sql = """
        INSERT INTO `product_variants` (`product_id`, `color`, `color_code`, `image_url`)
        VALUES (%s, %s, %s, %s);
        """
        # executemany を使って PRODUCT_IMAGE_MAPPING の全レコードを一括で INSERT（登録）します
        cursor.executemany(insert_variant_sql, PRODUCT_IMAGE_MAPPING)

        # これまで実行した更新・削除・登録内容をデータベースに正式確定（コミット）させます
        conn.commit()
        # 使い終わったカーソル（操作窓口）を閉じます
        cursor.close()
        # MySQLサーバーとの接続を安全に切断します
        conn.close()

        # すべての更新処理が成功したことを表示します
        print("[+] MySQLの画像ファイルパスをわかりやすい名称に更新完了！")
        # 成功を意味する True を呼び出し元に返します
        return True

    # try ブロック内で何らかの例外（接続エラーやSQLエラーなど）が発生した場合の処理です
    except Exception as e:
        # 発生したエラー内容（e）を画面に表示して原因を分かるようにします
        print(f"[!] エラー: {e}")
        # 失敗を意味する False を呼び出し元に返します
        return False

# このファイルが他のファイルから読み込まれたのではなく、直接「python setup_db.py」として実行されたときだけ動く判定です
if __name__ == '__main__':
    # データベース更新処理関数を呼び出して実行します
    setup_database()
