# ==============================================================================
# MANEKIN FASHION - バックエンド API サーバー (app.py)
# Python + Flask + MySQL (PyMySQL) を使用した本格的なECバックエンド
# ==============================================================================

# システム操作用標準モジュール
# ↑ sys: Pythonのバージョンやシステム終了などの基本機能を使うための標準モジュールです
import sys
# オペレーティングシステム用標準モジュール
# ↑ os: OSの環境変数（例: PORT番号）やフォルダ・ファイルパスを扱う標準モジュールです
import os
# JSONデータ操作用標準モジュール
# ↑ json: JavaScriptとやり取りするデータ形式「JSON」とPythonの辞書・配列を相互変換します
import json
# ランダム文字列生成用モジュール（注文番号生成等）
# ↑ random: 英数字をランダムに選んで重複しにくい注文番号などを作ります
import random
# 文字列生成用モジュール
# ↑ string: アルファベット大文字（A-Z）や数字（0-9）の定数セットを提供します
import string
# 日付と時刻の処理モジュール
# ↑ datetime: 注文日時や今日の日付（YYYYMMDDなど）を取得・書式整形するために使います
from datetime import datetime

# Flaskフレームワーク関連のインポート
# pyrefly: ignore[missing-import]
# ↑ 型チェッカー向けの警告抑制コメントです
# ↓ Flask本体、辞書をJSON応答に変えるjsonify、受信データのrequest、HTML等ファイルを返すsend_from_directoryを読み込みます
from flask import Flask, jsonify, request, send_from_directory
# CORS（クロスオリジンリソース共有）モジュールのインポート
# ↓ ブラウザが違うポートやOriginからAPIを呼び出してもセキュリティブロックされないよう許可します
from flask_cors import CORS
# MySQL接続用PyMySQLモジュール
# ↓ PythonプログラムからXAMPPのMySQLデータベースへ接続・SQL実行するライブラリです
import pymysql
# 辞書型カーソルを使用するためのモジュール
# ↓ SQL検索結果を「row[0]」の番号ではなく「row['name']」のように列名で取り出せるようにします
from pymysql.cursors import DictCursor

# Flaskアプリケーションのインスタンスを生成
# ↓ static_folder='.' と static_url_path='' を指定すると、HTML/CSS/JS/画像もこの同じサーバーから配信できます
app = Flask(__name__, static_folder='.', static_url_path='')
# フロントエンドからの全APIリクエストに対してCORSを許可
# ↓ APIの通信許可設定をアプリ全体に適用します
CORS(app)

# ==============================================================================
# MySQLデータベース接続設定
# ==============================================================================
# ↓ データベース接続に必要な住所・アカウント・文字コードなどを1つの辞書変数 DB_CONFIG にまとめます
DB_CONFIG = {
    'host': '127.0.0.1',      # MySQLホスト（XAMPP標準ローカルホスト：自分のパソコン自身を指します）
    'port': 3306,             # MySQL標準ポート番号（通信の出入口番号）
    'user': 'root',           # データベース接続ユーザー名（XAMPP既定の管理者名）
    'password': '',           # パスワード（XAMPP標準は空文字＝未設定）
    'database': 'manekin_db', # 使用するデータベース名（事前に作成済みのmanekin_db）
    'charset': 'utf8mb4',     # 文字コード（日本語や絵文字も安全に保存できるUTF-8拡張版）
    'cursorclass': DictCursor # 結果を辞書型（{'列名': 値}）で取得する指定
}

# ↓ DBへの接続（コネクション）を毎回安全に開くための共通関数を定義します
def get_db_connection():
    """
    MySQLデータベースへのコネクションを取得するヘルパー関数
    """
    # ↓ 接続失敗時にサーバーごと落ちないよう try 〜 except でエラーを捕捉します
    try:
        # ↓ **DB_CONFIG で辞書の中身を引数として展開してMySQLへ接続します
        connection = pymysql.connect(**DB_CONFIG)
        # ↓ 取得できた接続オブジェクトを呼び出し元に返します
        return connection
    # ↓ MySQLが起動していない等の理由で接続できなかったときの処理です
    except Exception as err:
        # ↓ 黒い画面（コンソール）にエラー内容を表示して開発者に知らせます
        print(f"[!] MySQL接続エラー: {err}")
        # ↓ 接続できなかった合図として None（空）を返します
        return None


# ↓ 外部から届いたユーザーID（文字列や数値）が「1以上の正しい整数」かチェックしてintに変換する関数です
def parse_user_id(raw_uid):
    """user_idを整数として検証・変換する"""
    # ↓ 未指定（None）または空文字 '' のときは有効なIDではないので None を返します
    if raw_uid is None or raw_uid == '':
        return None
    # ↓ 整数への変換を試みます（"abc" などが来ると ValueError になります）
    try:
        # ↓ 文字列等を整数型 int に変換します
        uid = int(raw_uid)
        # ↓ 会員IDは1番から始まる正の整数のみ有効とし、0以下なら不正として None を返します
        return uid if uid > 0 else None
    # ↓ 変換できない値（配列や文字列など）だった場合はエラーにせず None を返します
    except (TypeError, ValueError):
        return None


# ↓ アカウント別にデータを分離して保存するための2テーブルを起動時に自動用意する関数です
def ensure_account_tables():
    """
    アカウント別永続化に必要なテーブル(cart_items, user_studio_states)の存在と
    基本スキーマ制約をサーバー起動時に保証する
    """
    # ↓ DB接続を取得します
    conn = get_db_connection()
    # ↓ DBに繋がらない場合は初期化できないので False を返して中断します
    if not conn:
        return False
    # ↓ テーブル作成SQLを実行します（try〜finallyで最後に必ず接続を閉じます）
    try:
        # ↓ cursor（SQL実行ウィンドウ）を開きます
        with conn.cursor() as cursor:
            # ↓ 【重要SQL】cart_items（アカウント別カートテーブル）が無ければ自動作成します
            # ↓ user_id, product_id, color, size の組み合わせに UNIQUE 制約を付けて同一商品の重複行を防ぎ、
            # ↓ FOREIGN KEY ... ON DELETE CASCADE により会員削除時にその人のカートも自動削除されるようにします
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `cart_items` (
                  `id` int(11) NOT NULL AUTO_INCREMENT,
                  `user_id` int(11) NOT NULL,
                  `product_id` int(11) NOT NULL,
                  `name` varchar(255) NOT NULL,
                  `category` varchar(50) NOT NULL DEFAULT 'TOPS',
                  `color` varchar(50) NOT NULL DEFAULT 'STANDARD',
                  `size` varchar(20) NOT NULL DEFAULT 'M',
                  `price` int(11) NOT NULL DEFAULT 0,
                  `quantity` int(11) NOT NULL DEFAULT 1,
                  `image_url` text DEFAULT NULL,
                  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `uk_user_cart_item` (`user_id`, `product_id`, `color`, `size`),
                  KEY `idx_cart_user_id` (`user_id`),
                  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            """)
            # ↓ 【重要SQL】user_studio_states（アカウント別のマネキン着用服・座標微調整・性別設定テーブル）を作成します
            # ↓ user_id に UNIQUE 制約があるため「1ユーザーにつき1レコード」で最新の試着状態が保持されます
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `user_studio_states` (
                  `id` int(11) NOT NULL AUTO_INCREMENT,
                  `user_id` int(11) NOT NULL,
                  `current_outfit_json` longtext DEFAULT NULL,
                  `fitting_offsets_json` longtext DEFAULT NULL,
                  `studio_gender` varchar(16) NOT NULL DEFAULT 'MEN',
                  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `uk_studio_state_user` (`user_id`),
                  CONSTRAINT `fk_studio_state_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            """)
        # ↓ テーブル作成結果を確定保存します
        conn.commit()
        # ↓ 正常完了として True を返します
        return True
    # ↓ SQLエラー等が起きたら内容を表示して False を返します
    except Exception as e:
        print(f"[!] テーブル初期化確認エラー: {e}")
        return False
    # ↓ 成功しても失敗しても、最後に必ずデータベース接続を閉じます（接続漏れ防止）
    finally:
        conn.close()


# ==============================================================================
# 1. 商品関連 API (PRODUCTS)
# ==============================================================================

# ↓ ブラウザ等から「GET /api/products」にアクセスされたときに下の関数を実行するルーティング定義です
@app.route('/api/products', methods=['GET'])
def get_all_products():
    """
    全商品一覧およびカラー別画像情報を取得するエンドポイント
    """
    # ↓ DB接続を開きます
    conn = get_db_connection()
    # ↓ 接続失敗時は HTTPステータス 500（サーバー内部エラー）とJSONエラーメッセージを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 商品と色バリエーションの取得を開始します
    try:
        # ↓ カーソルを開いてSQLを実行します
        with conn.cursor() as cursor:
            # 商品一覧を取得
            # ↓ productsテーブルから全商品をIDの小さい順（ASC）に並べて取得します
            cursor.execute("SELECT * FROM `products` ORDER BY `id` ASC;")
            # ↓ 見つかったすべての商品行をリスト（辞書の配列）として取得します
            products = cursor.fetchall()

            # 各商品に紐づくカラーバリエーション・画像を取得して結合
            # ↓ 商品1件ずつに対してループし、別テーブルにある色バリエーション情報を合体させます
            for p in products:
                # ↓ product_variantsテーブルから、この商品ID（p['id']）に対応する色と画像URLを検索します
                cursor.execute("SELECT `color`, `color_code`, `image_url` FROM `product_variants` WHERE `product_id` = %s;", (p['id'],))
                # ↓ この商品の色バリエーション一覧を取得します
                variants = cursor.fetchall()
                # カラー名リスト
                # ↓ バリエーションがあれば色名だけを抜き出して配列化し、無ければ ["STANDARD"] を設定します
                p['colors'] = [v['color'] for v in variants] if variants else ["STANDARD"]
                # カラーごとの画像マッピング辞書（服の色を変えた時に画像を変える）
                # ↓ 例: {'WHITE': 'assets/images/...', 'BLACK': '...'} の辞書を作成し、JS側で色変更時に参照します
                p['colorImages'] = {v['color']: v['image_url'] for v in variants} if variants else {p['colors'][0]: p['image']}
                # サイズ展開リスト（標準S, M, L, XL）
                # ↓ 各商品に共通のサイズ選択肢配列を付与します
                p['sizes'] = ["S", "M", "L", "XL"]

        # ↓ 完成した全商品配列を JSON形式＋HTTP 200（成功）でブラウザへ返却します
        return jsonify({"status": "success", "products": products}), 200

    # ↓ 例外発生時はエラーログを出して 500 エラーを返します
    except Exception as e:
        print(f"[!] 商品取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 処理終了後、確実にDB接続を閉じます
    finally:
        conn.close()


# ↓ URLの一部（<int:product_id>）を数値として関数引数 product_id に受け取る詳細取得APIです
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    """
    特定商品の詳細情報およびカラー別画像を取得するエンドポイント
    """
    # ↓ DB接続を取得します
    conn = get_db_connection()
    # ↓ 接続できなければ 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 指定IDの商品検索を実行します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ 指定された product_id と一致する商品を1件だけ検索します
            cursor.execute("SELECT * FROM `products` WHERE `id` = %s;", (product_id,))
            # ↓ fetchone() は検索結果から最初の1件だけを取得します（無ければ None）
            product = cursor.fetchone()
            # ↓ 該当商品が存在しない場合は HTTP 404（見つかりません）を返します
            if not product:
                return jsonify({"status": "error", "message": "商品が見つかりません。"}), 404

            # カラーバリエーションを取得
            # ↓ 同様に product_variants テーブルからこの商品の色別画像データを取得します
            cursor.execute("SELECT `color`, `color_code`, `image_url` FROM `product_variants` WHERE `product_id` = %s;", (product_id,))
            # ↓ 取得結果を variants に入れます
            variants = cursor.fetchall()
            # ↓ 色名配列を整形します
            product['colors'] = [v['color'] for v in variants] if variants else ["STANDARD"]
            # ↓ 色名→画像URLの対応辞書を作成します
            product['colorImages'] = {v['color']: v['image_url'] for v in variants} if variants else {product['colors'][0]: product['image']}
            # ↓ サイズ配列を付与します
            product['sizes'] = ["S", "M", "L", "XL"]

        # ↓ 商品1件のJSONと HTTP 200 を返します
        return jsonify({"status": "success", "product": product}), 200

    # ↓ DBエラーなどの例外時は 500 を返します
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 必ず接続をクローズします
    finally:
        conn.close()


# ==============================================================================
# 2. 注文・購入手続き関連 API (ORDERS & CHECKOUT) - 【超重要】
# ==============================================================================

# ↓ サーバーとMySQLデータベースが元気に動いているか診断するヘルスチェックAPIです
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    FlaskサーバーおよびMySQLデータベース接続ヘルスチェック
    """
    # ↓ MySQLへの接続を試みます
    conn = get_db_connection()
    # ↓ 接続できなかった場合は、アプリ自体は動いていることを伝えつつDB未接続を返します（HTTP 200で詳細通知）
    if not conn:
        return jsonify({"status": "warning", "mysql": "disconnected", "message": "Flaskは稼働中ですが、MySQL(manekin_db)に接続できません。XAMPPでMySQLを起動してください。"}), 200
    # ↓ 接続テストが成功したので接続をすぐ閉じます
    conn.close()
    # ↓ サーバーもMySQLも両方正常稼働中であることを返します
    return jsonify({"status": "ok", "mysql": "connected", "message": "Flask API & MySQL (manekin_db) は正常に稼働しています。"}), 200


# ↓ 購入確定ボタンを押したときに呼ばれ、「注文・注文明細・マイクローゼット自動保存・ポイント精算・カート空化」を一気に行う重要APIです
@app.route('/api/orders', methods=['POST'])
def create_order():
    """
    購入手続き画面から送信された注文データをMySQLに確定保存するエンドポイント
    """
    # ↓ ブラウザからPOSTで送られたJSONボディを取得します（空なら空辞書 {} にします）
    req = request.get_json() or {}
    
    # 必須パラメータの取り出し
    # ↓ .strip() は前後の余分な半角/全角スペースを取り除くPythonのメソッドです
    customer_name = req.get('customer_name', '').strip()
    # ↓ お客様のメールアドレスを取り出します
    customer_email = req.get('customer_email', '').strip()
    # ↓ 郵便番号を取り出します
    postal_code = req.get('postal_code', '').strip()
    # ↓ 配送先住所を取り出します
    address = req.get('address', '').strip()
    # ↓ 電話番号を取り出します
    phone = req.get('phone', '').strip()
    # ↓ 支払い方法（未指定時は 'クレジットカード' を既定値にします）
    payment_method = req.get('payment_method', 'クレジットカード')
    # ↓ 配送希望時間帯（未指定時は '指定なし' を既定値にします）
    delivery_time = req.get('delivery_time', '指定なし')
    # ↓ 購入商品一覧を 'items' または 'items_detail' キーから取得します
    cart_items = req.get('items', []) or req.get('items_detail', []) # カート内商品リスト
    # ↓ ログイン中の会員IDを整数検証して取得します（他人のIDや不正文字を防ぐため parse_user_id を通します）
    user_id = parse_user_id(req.get('user_id', None))
    # ↓ 過去データの再同期などで既存の注文番号が送られてきた場合に受け取ります
    provided_order_no = req.get('order_no', None)
    # ↓ 同期モード（Trueのときは過去の注文データの同期登録なので、ポイントを再計算・重複増減しない）フラグです
    is_sync = bool(req.get('sync_mode', False))

    # 入力バリデーション
    # ↓ 未ログイン状態や不正user_idでの注文はセキュリティ上 400 エラーで拒否します
    if not user_id:
        return jsonify({"status": "error", "message": "ご注文には有効な会員ログインが必要です（user_idが不足または不正です）。"}), 400
    # ↓ 名前・メール・住所・商品のいずれかが空なら注文できないため 400 エラーを返します
    if not customer_name or not customer_email or not address or not cart_items:
        return jsonify({"status": "error", "message": "お名前、メールアドレス、住所、注文商品は必須です。"}), 400

    # 金額の再計算（改ざん防止）
    # ↓ ブラウザ側で送られた合計金額をそのまま信用せず、サーバー側で商品単価×数量を足し直して小計を算出します
    subtotal = 0
    # ↓ カート内の全商品を1点ずつループします
    for item in cart_items:
        # ↓ 購入数量を整数で取得します
        qty = int(item.get('quantity', 1))
        # ↓ 商品単価を整数で取得します
        price = int(item.get('price', item.get('unit_price', 0)))
        # ↓ 小計（subtotal）に「単価 × 数量」を加算していきます
        subtotal += (price * qty)

    # 送料計算（5,000円以上は送料無料、未満は全国一律550円）
    # ↓ Pythonの三項演算子：小計が5000以上なら送料0円、そうでなければ550円とします
    shipping_fee = 0 if subtotal >= 5000 else 550
    # ↓ お客様が使う指定をしたポイント数（1ポイント=1円）を取り出します
    used_points = int(req.get('used_points', 0))
    # ↓ お支払い総額 = 小計 + 送料 - 利用ポイント。max(0, ...) でマイナス円になるのを防ぎます
    total_amount = max(0, subtotal + shipping_fee - used_points)
    # ↓ 今回付与するポイント数（未指定時はお支払い総額の1%を還元）を計算します
    earned_points = int(req.get('earned_points', int(total_amount * 0.01)))

    # ユニークな注文番号の生成（例: ORD-20261028-A7X9）
    # ↓ 今日の日付を '20261110' のような8桁文字列にします
    today_str = datetime.now().strftime('%Y%m%d')
    # ↓ 英大文字と数字の中からランダムに4文字選んで連結します
    random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    # ↓ 送信された注文番号があればそれを、無ければ「ORD-日付-ランダム4文字」の新しい注文番号を採用します
    order_no = provided_order_no if provided_order_no else f"ORD-{today_str}-{random_code}"

    # ↓ DB接続を開きます
    conn = get_db_connection()
    # ↓ 接続できない場合は 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ ここから複数のテーブルをまたぐ一連の注文登録処理（トランザクション）を開始します
    try:
        # ↓ カーソルを取得します
        with conn.cursor() as cursor:
            # ↓ 注文しようとしている user_id の会員が実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            # ↓ 会員レコードが見つからなければ 404 エラーを返します
            if not cursor.fetchone():
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404

            # 既存注文番号チェック（同期時の重複防止）
            # ↓ すでに注文番号が指定されていた場合、二重登録にならないか確認します
            if provided_order_no:
                # ↓ 同じ order_no が既に orders テーブルにあるか検索します
                cursor.execute("SELECT `id`, `order_no`, `user_id` FROM `orders` WHERE `order_no` = %s;", (provided_order_no,))
                # ↓ 該当レコードを取り出します
                existing_ord = cursor.fetchone()
                # ↓ 既に同じ注文番号が存在した場合の処理です
                if existing_ord:
                    # ↓ もし本人の既存注文だった場合は二重登録せず「登録済み」として正常終了(200)を返します
                    if str(existing_ord.get('user_id')) == str(user_id):
                        return jsonify({
                            "status": "success",
                            "message": "すでにMySQLへ登録済みの注文です。",
                            "already_exists": True,
                            "order": {"order_id": existing_ord['id'], "order_no": existing_ord['order_no']}
                        }), 200
                    # 別ユーザーの注文番号と万が一衝突した場合は新しい注文番号を再発行
                    # ↓ 別人が使っている番号と偶然一致していた場合は重複エラーを避けるため新しい番号を作り直します
                    order_no = f"ORD-{today_str}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=4))}"

            # 1. ordersテーブルに注文ヘッダーを挿入
            # ↓ 注文の親レコード（誰が・どこに・いくらで注文したか）を1行登録するSQL文を用意します（NOW()はMySQLの現在時刻関数）
            insert_order_sql = """
            INSERT INTO `orders` (
                `order_no`, `user_id`, `customer_name`, `customer_email`,
                `postal_code`, `address`, `phone`, `payment_method`,
                `delivery_time`, `subtotal`, `shipping_fee`, `total_amount`,
                `used_points`, `earned_points`, `status`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW());
            """
            # ↓ 上のSQLの各 %s に実際の注文値を安全に埋め込んで実行します
            cursor.execute(insert_order_sql, (
                order_no, user_id, customer_name, customer_email,
                postal_code, address, phone, payment_method,
                delivery_time, subtotal, shipping_fee, total_amount,
                used_points, earned_points, "注文受付済み"
            ))
            # ↓ 今INSERTした親注文の自動採番ID（主キー id）を取得し、子テーブルの紐づけに使います
            order_id = cursor.lastrowid

            # 2. order_itemsテーブルに各購入商品を挿入
            # ↓ 注文に含まれる1つひとつの商品名・色・サイズ・数量・単価を登録するSQL文を用意します
            insert_item_sql = """
            INSERT INTO `order_items` (
                `order_id`, `product_id`, `product_name`, `color`,
                `size`, `quantity`, `unit_price`, `image_url`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """
            # ↓ カート内の購入商品を1件ずつループして order_items テーブルに書き込みます
            for item in cart_items:
                # ↓ 先ほど取得した親注文ID（order_id）を先頭に入れて明細行を登録します
                cursor.execute(insert_item_sql, (
                    order_id,
                    item.get('id', item.get('product_id', 0)),
                    item.get('name', item.get('product_name', '商品名未定')),
                    item.get('color', 'STANDARD'),
                    item.get('size', 'M'),
                    int(item.get('quantity', 1)),
                    int(item.get('price', item.get('unit_price', 0))),
                    item.get('image', item.get('image_url', 'assets/images/item_tshirt.jpg'))
                ))

            # 3. 【要件追加】購入された商品をマイクローゼット(MySQL: closet_items)へ自動保存
            # ↓ 購入したら自動でそのユーザー専用のクローゼット（is_purchased=1）に登録し、マネキンで手持ち服比較できるようにするSQLです
            # ↓ ON DUPLICATE KEY UPDATE により、同じitem_uidが再送信されてもエラーにせず名前だけ更新します
            insert_closet_sql = """
            INSERT INTO `closet_items` (
                `user_id`, `item_uid`, `product_id`, `name`, `category`, `color`,
                `season`, `image_url`, `is_owned`, `is_purchased`, `price`, `purchase_date`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, 1, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
            """
            # ↓ enumerate を使ってリストのインデックス番号(idx)付きで各購入商品をループします
            for idx, item in enumerate(cart_items):
                # ↓ 商品IDを取り出します
                p_id = item.get('id', item.get('product_id', 0))
                # ↓ 注文番号と順番を使った重複しない固有ID（purchased-商品ID-注文番号-連番）を作ります
                item_uid = f"purchased-{p_id}-{order_no}-{idx}"
                # ↓ カテゴリ名を取得します（試着時の配置スロット判定に必要）
                category = item.get('category', 'TOPS')
                # ↓ カラー名を取得します
                color = item.get('color', 'BLACK')
                # ↓ 単価を取得します
                price = int(item.get('price', item.get('unit_price', 0)))
                # ↓ 画像パスを取得します
                image_url = item.get('image', item.get('image_url', ''))
                # ↓ このユーザーの closet_items テーブルに購入アイテムを1件登録します
                cursor.execute(insert_closet_sql, (
                    user_id,
                    item_uid,
                    p_id,
                    item.get('name', item.get('product_name', '購入商品')),
                    category,
                    color,
                    item.get('season', '通年'),
                    image_url,
                    price,
                    today_str
                ))

            # 4. ユーザーのポイント残高を更新 & カート(cart_items)をクリア (通常注文時)
            # ↓ 更新後の最新ポイント数をレスポンスで返すための変数を用意します
            updated_points = None
            # ↓ 通常の注文処理（過去データの同期モードではない場合）のみポイント残高を増減しカートを空にします
            if user_id and not is_sync:
                # ↓ データベース上の現在の会員ポイント残高を照会します
                cursor.execute("SELECT `points` FROM `users` WHERE `id` = %s;", (user_id,))
                # ↓ ユーザー行を取得します
                u_row = cursor.fetchone()
                # ↓ ユーザー行が存在すれば新しい残高を計算してUPDATEします
                if u_row is not None:
                    # ↓ 現在の保有ポイントを取得します（万一NULLなら初期値1000）
                    curr_pts = int(u_row.get('points', 1000))
                    # ↓ 新残高 = (現在ポイント - 使用ポイント ※0未満防止) + 今回獲得ポイント
                    updated_points = max(0, curr_pts - used_points) + earned_points
                    # ↓ usersテーブルの保有ポイントを最新値に更新します
                    cursor.execute("UPDATE `users` SET `points` = %s WHERE `id` = %s;", (updated_points, user_id))
                # MySQL上のアカウント別カートから注文済み商品をクリア
                # ↓ 購入が完了したため、このユーザー(user_id)のMySQLカート(cart_items)を空にします
                cursor.execute("DELETE FROM `cart_items` WHERE `user_id` = %s;", (user_id,))

        # トランザクションコミット
        # ↓ 注文・明細・クローゼット登録・ポイント更新・カート削除の全処理が成功したため一気に確定保存します
        conn.commit()

        # 完了レスポンスデータを作成
        # ↓ フロントエンド（注文完了モーダル・マイページ履歴）に即座に反映できるよう注文内容オブジェクトを組み立てます
        created_order_data = {
            "order_id": order_id,
            "order_no": order_no,
            "date": datetime.now().strftime('%Y/%m/%d %H:%M'),
            "customer_name": customer_name,
            "customer_email": customer_email,
            "address": address,
            "payment_method": payment_method,
            "delivery_time": delivery_time,
            "subtotal": subtotal,
            "shipping_fee": shipping_fee,
            "used_points": used_points,
            "earned_points": earned_points,
            "total_amount": total_amount,
            "status": "注文受付・発送準備中",
            "items": cart_items
        }

        # ↓ 作成完了を意味する HTTP 201（Created）と注文データ・更新後ポイントを返します
        return jsonify({
            "status": "success",
            "message": "ご注文が正常に完了しました！",
            "order": created_order_data,
            "updated_points": updated_points
        }), 201

    # ↓ 途中で1つでもエラーが起きた場合は全変更を取り消し（ロールバック）してデータの不整合を防ぎます
    except Exception as e:
        conn.rollback()
        print(f"[!] 注文保存エラー: {e}")
        return jsonify({"status": "error", "message": f"注文処理に失敗しました: {str(e)}"}), 500
    # ↓ 成功・失敗を問わず必ずデータベース接続を閉じます
    finally:
        conn.close()


# ↓ 指定ユーザー自身の購入履歴一覧だけを取り出すGETエンドポイントです
@app.route('/api/orders', methods=['GET'])
def get_orders():
    """
    マイページに表示するための購入履歴一覧をMySQLから取得するエンドポイント（アカウント別フィルタ）
    """
    # ↓ URLクエリパラメータ（?user_id=...）から会員IDを取り出します
    user_id = parse_user_id(request.args.get('user_id', None))
    # ↓ 未ログイン等で有効なuser_idがない場合は、他人の履歴を見せないよう空配列を返します
    if not user_id:
        return jsonify({"status": "success", "orders": []}), 200

    # ↓ DB接続を開きます
    conn = get_db_connection()
    # ↓ 接続失敗時は 500 を返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 該当ユーザーの注文ヘッダと各明細を取得して整形します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ログインユーザーの注文ヘッダーのみを最新順で取得
            # ↓ WHERE `user_id` = %s でアカウント分離を保証し、created_at の新しい順（DESC）で取得します
            cursor.execute("SELECT * FROM `orders` WHERE `user_id` = %s ORDER BY `created_at` DESC;", (user_id,))
            # ↓ 注文一覧リストを取得します
            orders = cursor.fetchall()

            # 各注文に紐づく注文明細商品を取得して結合
            # ↓ 注文1件ずつに対して明細テーブルから購入商品の詳細を引き当てます
            for o in orders:
                # 日時フォーマットの整形
                # ↓ MySQLのdatetime型なら '2026/11/10 14:00' の読みやすい文字列に変換します
                if isinstance(o['created_at'], datetime):
                    o['date'] = o['created_at'].strftime('%Y/%m/%d %H:%M')
                # ↓ 文字列等の場合はそのまま str() で変換します
                else:
                    o['date'] = str(o['created_at'])

                # ↓ この注文ID（o['id']）に紐づく全購入商品を order_items テーブルから取得します
                cursor.execute("SELECT * FROM `order_items` WHERE `order_id` = %s;", (o['id'],))
                # ↓ 明細リストを取得します
                items = cursor.fetchall()
                # ↓ DB生データ形式として items_detail に保持します
                o['items_detail'] = items
                # フロントエンド互換形式
                # ↓ JavaScriptの描画関数が扱いやすいキー名（id, name, price, image等）に詰め替えた配列を作ります
                o['items'] = [
                    {
                        "id": it['product_id'],
                        "name": it['product_name'],
                        "color": it['color'],
                        "size": it['size'],
                        "quantity": it['quantity'],
                        "price": it['unit_price'],
                        "image": it['image_url']
                    }
                    for it in items
                ]
                # マイページ一覧用要約テキスト（例: "Tシャツ (WHITE / L) × 2"）
                # ↓ リスト内包表記で各明細を「商品名 (色 / サイズ) × 個数」という1行文字列に変換します
                item_summary_list = [f"{it['product_name']} ({it['color']} / {it['size']}) × {it['quantity']}" for it in items]
                # ↓ カンマ区切りでつなげて要約文字列を作り、もし明細が空なら「注文商品」とします
                o['items_summary'] = ", ".join(item_summary_list) if item_summary_list else "注文商品"

        # ↓ 整形済みの注文履歴リストを HTTP 200 で返します
        return jsonify({"status": "success", "orders": orders}), 200

    # ↓ エラー発生時はログを出して 500 を返します
    except Exception as e:
        print(f"[!] 注文履歴取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 必ず接続を閉じます
    finally:
        conn.close()


# ↓ 指定したアカウントの注文履歴だけを削除（リセット）するDELETEエンドポイントです
@app.route('/api/orders', methods=['DELETE'])
def clear_orders():
    """
    指定したユーザーの注文履歴のみをリセットするエンドポイント
    """
    # ↓ まずURLクエリパラメータ（?user_id=...）からユーザーIDを取得しようとします
    raw_uid = request.args.get('user_id', None)
    # ↓ クエリになければリクエストボディ（JSON）からも user_id を探します
    if not raw_uid:
        req = request.get_json(silent=True) or {}
        raw_uid = req.get('user_id')
    # ↓ 整数値として検証します
    user_id = parse_user_id(raw_uid)

    # ↓ user_idが有効でなければ誤って全員の注文を消さないよう 400 エラーで拒否します
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # ↓ DB接続を取得します
    conn = get_db_connection()
    # ↓ 接続できなければ 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 該当ユーザーの注文データのみを削除します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # 対象ユーザーの注文明細から先に削除
            # ↓ サブクエリで本人の注文IDだけを抽出し、子テーブル order_items から該当明細を削除します
            cursor.execute("DELETE FROM `order_items` WHERE `order_id` IN (SELECT `id` FROM `orders` WHERE `user_id` = %s);", (user_id,))
            # ↓ 続いて親テーブル orders から本人の注文行だけを削除します
            cursor.execute("DELETE FROM `orders` WHERE `user_id` = %s;", (user_id,))
        # ↓ 削除を確定（コミット）します
        conn.commit()
        # ↓ サーバーコンソールにログを残します
        print(f"[i] ユーザーID {user_id} の注文履歴をMySQLからリセットしました。")
        # ↓ 正常完了レスポンスを返します
        return jsonify({"status": "success", "message": "アカウントの注文履歴を初期化しました。"}), 200
    # ↓ 失敗時はロールバックして元に戻し 500 を返します
    except Exception as e:
        conn.rollback()
        print(f"[!] 注文履歴リセットエラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ DB接続をクローズします
    finally:
        conn.close()


# ==============================================================================
# 3. 会員・認証関連 API (AUTH)
# ==============================================================================

# ↓ 新規会員登録フォームの送信を受け付け、usersテーブルへ新会員を作成するPOSTエンドポイントです
@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """
    新規会員登録をMySQLに保存するエンドポイント（初期1000ポイント付与）
    """
    # ↓ フォームから送られたJSONデータを受け取ります
    req = request.get_json() or {}
    # ↓ 入力された名前（前後の空白を削除）を取り出します
    name = req.get('name', '').strip()
    # ↓ 入力されたメールアドレスを取り出します
    email = req.get('email', '').strip()
    # ↓ 入力されたパスワードを取り出します
    password = req.get('password', '').strip()

    # ↓ 名前・メール・パスワードのどれか1つでも未入力なら登録させず 400 エラーを返します
    if not name or not email or not password:
        return jsonify({"status": "error", "message": "すべての項目を入力してください。"}), 400

    # ↓ MySQLデータベースへ接続します
    conn = get_db_connection()
    # ↓ 接続できなければ 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 重複メール確認と新規レコード挿入を行います
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # メールアドレスの重複チェック
            # ↓ すでに同じメールアドレスで登録されている会員がいないか検索します
            cursor.execute("SELECT `id` FROM `users` WHERE `email` = %s;", (email,))
            # ↓ 見つかった場合は HTTP 409（Conflict：競合・重複）を返して登録を止めます
            if cursor.fetchone():
                return jsonify({"status": "error", "message": "このメールアドレスは既に登録されています。"}), 409

            # ユーザーの登録（初期ボーナス 1,000pt 付与）
            # ↓ usersテーブルに新会員を登録します。ランクは既定のREGULAR MEMBER、初回特典として1000ポイントを付与します
            cursor.execute(
                "INSERT INTO `users` (`name`, `email`, `password_hash`, `rank`, `points`, `created_at`) VALUES (%s, %s, %s, 'REGULAR MEMBER', 1000, NOW());",
                (name, email, password)
            )
            # ↓ MySQLが自動で割り振った新しい会員ID（user_id）を取得します
            user_id = cursor.lastrowid
        # ↓ 会員登録を確定（コミット）保存します
        conn.commit()

        # ↓ 登録成功レスポンス(201 Created)と新しい会員オブジェクト（1000pt込み）をフロントへ返します
        return jsonify({
            "status": "success",
            "message": "会員登録が完了しました。1,000ポイントを進呈しました！",
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "rank": "REGULAR MEMBER",
                "points": 1000
            }
        }), 201

    # ↓ 登録途中に例外が起きた場合はロールバックし 500 エラーを返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 必ず接続を閉じます
    finally:
        conn.close()


# ↓ メールアドレスとパスワードを受け取ってログイン認証するPOSTエンドポイントです
@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """
    会員ログイン認証を行うエンドポイント（ポイント情報も取得）
    """
    # ↓ 送られてきたログイン入力JSONを取り出します
    req = request.get_json() or {}
    # ↓ メールアドレスの前後の空白を除去して取得します
    email = req.get('email', '').strip()
    # ↓ パスワードの前後の空白を除去して取得します
    password = req.get('password', '').strip()

    # ↓ DB接続を取得します
    conn = get_db_connection()
    # ↓ 接続できない場合は 500 を返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 会員照合を開始します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ email と password_hash の両方が完全一致する会員情報を取得します（パスワード自体は返さず除外しています）
            cursor.execute("SELECT `id`, `name`, `email`, `rank`, `points` FROM `users` WHERE `email` = %s AND `password_hash` = %s;", (email, password))
            # ↓ 一致した会員1件を取り出します
            user = cursor.fetchone()
            # ↓ 見つからなければ HTTP 401（Unauthorized：認証失敗）を返します
            if not user:
                return jsonify({"status": "error", "message": "メールアドレスまたはパスワードが正しくありません。"}), 401

            # ↓ 旧データなどでポイント列が未設定（None）だった場合のみ既定値1000で補完します
            if user.get('points') is None:
                user['points'] = 1000

        # ↓ 認証成功レスポンス(200)と会員情報を返却し、フロント側のアカウント別セッション切り替えに使います
        return jsonify({
            "status": "success",
            "message": "ログインしました。",
            "user": user
        }), 200

    # ↓ 予期せぬエラー時は 500 を返します
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ DB接続を閉じます
    finally:
        conn.close()


# ↓ 「ワンクリックでテストログイン」ボタン専用のエンドポイント（常に固定のデモ会員IDで認証し他の実会員と混ざりません）
@app.route('/api/auth/demo', methods=['POST'])
def demo_login_user():
    """
    テストアカウント（demo@manekin.com）用の専用ログイン（既存会員とID衝突させない）
    """
    # ↓ DB接続を開きます
    conn = get_db_connection()
    # ↓ 接続できなければ 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ デモアカウント検索・未作成時の自動作成処理です
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ まずすでに 'demo@manekin.com' が登録済みか検索します
            cursor.execute(
                "SELECT `id`, `name`, `email`, `rank`, `points` FROM `users` WHERE `email` = %s;",
                ('demo@manekin.com',)
            )
            # ↓ 検索結果を取得します
            user = cursor.fetchone()
            # ↓ まだDBにデモ用ユーザーがいない場合（初回起動後など）は自動でVIPテスト会員を作成します
            if not user:
                # ↓ デモ用会員を新規登録（1000pt付与・VIP MEMBERランク）します
                cursor.execute(
                    "INSERT INTO `users` (`name`, `email`, `password_hash`, `rank`, `points`, `created_at`) VALUES (%s, %s, %s, %s, 1000, NOW());",
                    ('テストユーザー（デモ）', 'demo@manekin.com', 'demo1234', 'VIP MEMBER')
                )
                # ↓ 登録をコミットします
                conn.commit()
                # ↓ 作成されたデモ会員の自動採番ID込みのレコードを取得し直します
                cursor.execute(
                    "SELECT `id`, `name`, `email`, `rank`, `points` FROM `users` WHERE `email` = %s;",
                    ('demo@manekin.com',)
                )
                # ↓ 取得結果を user に入れます
                user = cursor.fetchone()
            # ↓ ポイントが NULL の場合だけ 1000 で補完します
            if user and user.get('points') is None:
                user['points'] = 1000

        # ↓ デモ会員でのログイン成功を返します
        return jsonify({
            "status": "success",
            "message": "テストアカウントでログインしました。",
            "user": user
        }), 200
    # ↓ DB書き込み等に失敗した場合はロールバックし 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 最後に必ず接続を閉じます
    finally:
        conn.close()


# ↓ フロントエンド側から保有ポイント値をMySQL側へ明示的に同期保存したいときに呼ぶPOST APIです
@app.route('/api/user/sync', methods=['POST'])
def sync_user_data():
    """
    ユーザーの保有ポイントをMySQLに同期保存
    """
    # ↓ リクエストJSONを受け取ります
    req = request.get_json() or {}
    # ↓ 有効な会員IDか検証します
    user_id = parse_user_id(req.get('user_id'))
    # ↓ IDが不正なら 400 エラーを返します
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # ↓ 更新したいポイント値を取り出します
    points = req.get('points')

    # ↓ DB接続を取得します
    conn = get_db_connection()
    # ↓ 接続できなければ 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ usersテーブルのポイント列を更新します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ points が送られてきている場合のみ UPDATE を実行してコミットします
            if points is not None:
                cursor.execute("UPDATE `users` SET `points` = %s WHERE `id` = %s;", (int(points), user_id))
                conn.commit()

        # ↓ 保存完了を返します
        return jsonify({"status": "success", "message": "会員ポイントをMySQLに保存しました。"}), 200
    # ↓ エラー発生時はロールバックして 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 接続を閉じます
    finally:
        conn.close()


# ==============================================================================
# 4. お気に入り関連 API (FAVORITES)
# ==============================================================================

# ↓ ログイン中の会員だけのお気に入り商品ID配列をMySQLから取得するGETエンドポイントです
@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    """
    ログイン中アカウントのお気に入り商品IDリストをMySQLから取得するエンドポイント
    """
    # ↓ クエリから user_id を検証付きで取り出します
    user_id = parse_user_id(request.args.get('user_id', None))
    # ↓ 未ログイン時はセキュリティとエラー防止のため空リストを正常応答として返します
    if not user_id:
        return jsonify({"status": "success", "favorites": []}), 200

    # ↓ DB接続を取得します（もしDB停止中でもお気に入り一覧表示が固まらないよう空リストを返します）
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "success", "favorites": []}), 200

    # ↓ favoritesテーブルから本人のレコードのみを取得します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ user_id で絞り込んでお気に入り登録済みの商品ID一覧を取得します
            cursor.execute("SELECT `product_id` FROM `favorites` WHERE `user_id` = %s;", (user_id,))
            # ↓ 結果行すべてを取得します
            rows = cursor.fetchall()
            # ↓ Pythonの set() で万が一の重複を取り除きながら商品IDのみの純粋な配列を作ります
            fav_ids = list(set(r['product_id'] for r in rows))
        # ↓ お気に入り商品ID配列を返します
        return jsonify({"status": "success", "favorites": fav_ids}), 200
    # ↓ DBエラー時は 500 を返します
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ DB接続を閉じます
    finally:
        conn.close()


# ↓ ハートボタンをクリックしたときに、お気に入りの「登録」と「解除」を1つのAPIで切り替えるトグルエンドポイントです
@app.route('/api/favorites/toggle', methods=['POST'])
def toggle_favorite():
    """
    お気に入りの追加・解除を切り替えるエンドポイント（アカウント単位）
    """
    # ↓ 送信されたJSONから対象の商品IDとユーザーIDを受け取ります
    req = request.get_json() or {}
    product_id = req.get('product_id')
    user_id = parse_user_id(req.get('user_id'))

    # ↓ 商品IDまたは会員IDが不足している場合は 400 エラーを返します
    if not product_id or not user_id:
        return jsonify({"status": "error", "message": "商品IDと有効なユーザーIDが必要です。"}), 400

    # ↓ DB接続を取得します
    conn = get_db_connection()
    # ↓ 接続できなければ 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ すでにお気に入り済みか確認し、あれば削除・無ければ追加します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ 「このユーザー」かつ「この商品」のレコードが既にあるか確認します
            cursor.execute("SELECT `id` FROM `favorites` WHERE `product_id` = %s AND `user_id` = %s;", (product_id, user_id))
            # ↓ 既存レコードを取得します
            existing = cursor.fetchone()
            # ↓ すでに登録済みだった場合はお気に入り解除（DELETE）します
            if existing:
                cursor.execute("DELETE FROM `favorites` WHERE `id` = %s;", (existing['id'],))
                action = "removed"
            # ↓ まだ登録されていなかった場合は新規お気に入り登録（INSERT）します
            else:
                cursor.execute("INSERT INTO `favorites` (`user_id`, `product_id`, `created_at`) VALUES (%s, %s, NOW());", (user_id, product_id))
                action = "added"
        # ↓ 追加または削除の結果をデータベースに確定保存します
        conn.commit()
        # ↓ 実行された操作（added / removed）をフロントへ返却します
        return jsonify({"status": "success", "action": action, "product_id": product_id}), 200
    # ↓ エラー発生時はロールバックして 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 接続を閉じます
    finally:
        conn.close()


# ↓ ブラウザ（ゲスト時など）に溜まっていたお気に入り配列をログイン中会員のMySQLへ一括登録する同期APIです
@app.route('/api/favorites/sync', methods=['POST'])
def sync_favorites():
    """
    LocalStorage内のお気に入りをMySQLへ一括同期
    """
    # ↓ リクエストJSONから会員IDと商品ID配列を受け取ります
    req = request.get_json() or {}
    user_id = parse_user_id(req.get('user_id'))
    # ↓ 有効な会員IDでなければ 400 を返します
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400
    # ↓ 同期したい商品IDの配列を取り出します
    product_ids = req.get('product_ids', [])

    # ↓ DB接続を取得します
    conn = get_db_connection()
    # ↓ 接続失敗時は 500 を返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 重複登録を避けながら MySQL に一括追加します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ 対象ユーザーが実在するか先に確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            if not cursor.fetchone():
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404
            # ↓ 新規に追加できた件数を数えるカウンタを0で初期化します
            added = 0
            # ↓ 商品IDリストを1件ずつループします
            for pid in product_ids:
                # ↓ INSERT IGNORE を使うことで、すでに登録済みの商品があってもエラーにならずスキップされます
                cursor.execute("INSERT IGNORE INTO `favorites` (`user_id`, `product_id`, `created_at`) VALUES (%s, %s, NOW());", (user_id, int(pid)))
                # ↓ cursor.rowcount には実際に挿入された行数（0または1）が入るので加算します
                added += cursor.rowcount
        # ↓ 一括同期結果をコミットします
        conn.commit()
        # ↓ 同期件数をメッセージで返します
        return jsonify({"status": "success", "message": f"{added} 件のお気に入りをMySQLに同期しました。"}), 200
    # ↓ エラー発生時はロールバックして 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 必ずDB接続を閉じます
    finally:
        conn.close()


# ==============================================================================
# 5. 保存コーディネート（ルックブック）API (MySQL連携)
# ==============================================================================

# ↓ URLに指定したユーザーID(user_id)が過去に保存したコーディネート一覧を取り出すGETエンドポイントです
@app.route('/api/outfits/<int:user_id>', methods=['GET'])
def get_user_outfits(user_id):
    """
    ユーザーが保存したコーディネート一覧をMySQLから取得
    """
    # ↓ DB接続を開きます
    conn = get_db_connection()
    # ↓ 接続できなければ 500 エラーを返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ saved_outfits テーブルを検索してフロント用配列に組み立てます
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ このユーザーID(user_id)が保存したコーデだけを新しい順(id DESC)で取得します
            cursor.execute("SELECT * FROM `saved_outfits` WHERE `user_id` = %s ORDER BY `id` DESC;", (user_id,))
            # ↓ 全件取得します
            rows = cursor.fetchall()
            # ↓ フロントエンドへ返す整形済みリストを用意します
            outfits = []
            # ↓ データベースから取れた1件ずつをループして整形します
            for r in rows:
                # ↓ DBでは着用アイテム5スロット情報をJSON文字列(items_json)で保存しているため辞書に戻します
                try:
                    items_parsed = json.loads(r['items_json'])
                # ↓ 万一JSON形式が壊れていた場合でも落とさず空辞書 {} として安全に扱います
                except Exception:
                    items_parsed = {}
                # ↓ フロントのAppState.savedOutfitsと同じ形にキーを揃えてリストに追加します
                outfits.append({
                    "id": r['outfit_uid'],
                    "title": r['title'],
                    "date": r['date'],
                    "comment": r['comment'] or "",
                    "items": items_parsed
                })
        # ↓ 取得したコーデ配列と HTTP 200 を返却します
        return jsonify({"status": "success", "outfits": outfits}), 200
    # ↓ DBアクセスエラー時は 500 を返します
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 接続をクローズします
    finally:
        conn.close()


# ↓ スタジオで作ったコーディネートのタイトル・着用服・AIコメントをMySQLへ保存（または同IDなら上書き更新）するPOST APIです
@app.route('/api/outfits/save', methods=['POST'])
def save_user_outfit():
    """
    作成したコーディネートをMySQL(saved_outfits)に保存
    """
    # ↓ ブラウザから送られたJSONデータを取得します
    req = request.get_json() or {}
    # ↓ ユーザーIDを整数チェックします
    user_id = parse_user_id(req.get('user_id'))
    # ↓ 有効なユーザーIDが無ければ 400 エラーを返します
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400
    # ↓ コーデの一意ID（無ければ現在のUNIX時間ミリ秒を使ったIDを自動発行）を決めます
    outfit_uid = req.get('id') or f"outfit-{int(datetime.now().timestamp()*1000)}"
    # ↓ コーデのタイトルを取り出します
    title = req.get('title', 'マイスタイリングコーデ')
    # ↓ 保存日を取り出します
    date_str = req.get('date', datetime.now().strftime('%Y/%m/%d'))
    # ↓ AIアドバイスやメモのコメントを取り出します
    comment = req.get('comment', '')
    # ↓ 5つの部位（hat/outer/tops/bottoms/shoes）に着せている商品データを取り出します
    items = req.get('items', {})

    # ↓ DB接続を開きます
    conn = get_db_connection()
    # ↓ 接続失敗時は 500 を返します
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 会員確認と saved_outfits テーブルへのUpsert（無ければ挿入・あれば更新）を行います
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ 該当ユーザーが実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            if not cursor.fetchone():
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404
            # ↓ コーデを保存するSQL文（同じuser_id＋outfit_uidが既に存在する場合はタイトル・日付・コメント・着用アイテムを上書き更新します）
            insert_sql = """
            INSERT INTO `saved_outfits` (`user_id`, `outfit_uid`, `title`, `date`, `comment`, `items_json`, `created_at`)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                `title` = VALUES(`title`),
                `date` = VALUES(`date`),
                `comment` = VALUES(`comment`),
                `items_json` = VALUES(`items_json`);
            """
            # ↓ items辞書は json.dumps() でJSON文字列に変換してMySQLのTEXT列に格納します
            cursor.execute(insert_sql, (user_id, outfit_uid, title, date_str, comment, json.dumps(items)))
        # ↓ 変更をコミットします
        conn.commit()
        # ↓ 作成成功(201)を返します
        return jsonify({"status": "success", "message": f"「{title}」をMySQLに保存しました。"}), 201
    # ↓ エラー発生時はロールバックして 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ DB接続を閉じます
    finally:
        conn.close()


# ↓ URLに指定したコーデID（outfit_uid）を、必ず「本人のuser_id条件付き」で安全に削除するDELETEエンドポイントです
@app.route('/api/outfits/delete/<outfit_uid>', methods=['DELETE'])
def delete_user_outfit(outfit_uid):
    """
    保存したコーディネートをMySQLから削除（該当アカウント分のみ削除）
    """
    # ↓ クエリまたはJSONボディから操作中のユーザーIDを取り出します
    raw_uid = request.args.get('user_id', None)
    if not raw_uid:
        req = request.get_json(silent=True) or {}
        raw_uid = req.get('user_id')
    # ↓ ユーザーIDの妥当性を検証します
    user_id = parse_user_id(raw_uid)
    # ↓ 不正・未ログイン時は削除を許可せず 400 を返します
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 指定されたコーデをアカウント所有条件付きで削除します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ AND `user_id` = %s を付けることで、他人のコーデが誤って削除されるのを防ぎます
            cursor.execute("DELETE FROM `saved_outfits` WHERE `outfit_uid` = %s AND `user_id` = %s;", (outfit_uid, user_id))
        # ↓ 削除を確定します
        conn.commit()
        # ↓ 完了レスポンス(200)を返します
        return jsonify({"status": "success", "message": "コーディネートを削除しました。"}), 200
    # ↓ エラー発生時はロールバックして 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 必ず接続を閉じます
    finally:
        conn.close()


# ==============================================================================
# ▼▼▼【機能 1：MANEKIN 機能（3Dマネキン・バーチャル試着）】▼▼▼
# ==============================================================================
# ここにMANEKIN機能（3Dアバター生成、フィッティング計算、着せ替えプレビュー）を記述します。
# ------------------------------------------------------------------------------

# ↓ 将来の3Dアバター拡張機能で使用する標準体型プロファイル定数です
DEFAULT_AVATAR_PROFILE = {
    "height_cm": 172.0,                   # 標準身長(cm)
    "weight_kg": 60.0,                    # 標準体重(kg)
    "shoulder_width_cm": 44,              # 標準肩幅(cm)
    "chest_cm": 88,                       # 標準胸囲(cm)
    "waist_cm": 74,                       # 標準ウエスト(cm)
    "hip_cm": 90,                         # 標準ヒップ(cm)
    "skin_tone": "neutral",               # アバター肌色設定
    "model_url": "/assets/models/default_manekin.glb" # 3Dモデル(.glb)ファイルパス
}

# ↓ 指定ユーザーの3Dマネキン用初期プロファイルを返すGETエンドポイントです
@app.route('/api/manekin/avatar/<user_id>', methods=['GET'])
def get_manekin_avatar(user_id):
    """ユーザー専用3Dマネキンアバターデータを返却"""
    # ↓ ユーザーIDと標準アバタープロファイルをJSONで返します
    return jsonify({
        "status": "success",
        "user_id": user_id,
        "avatar": DEFAULT_AVATAR_PROFILE,
        "message": "MANEKINアバターデータを正常に取得しました。"
    }), 200

# ↓ 指定商品のバーチャル試着プレビュー＆フィット診断結果を返すPOSTエンドポイントです
@app.route('/api/manekin/try-on', methods=['POST'])
def manekin_virtual_try_on():
    """指定商品をマネキンに着せ替えたプレビュー情報を返す"""
    # ↓ リクエストから商品IDとユーザーIDを受け取ります
    req = request.get_json() or {}
    item_id = req.get("item_id")
    user_id = req.get("user_id")

    # ↓ 試着プレビューとサイズ診断結果、現在時刻(isoformat)をJSONで返します
    return jsonify({
        "status": "success",
        "user_id": user_id,
        "item_id": item_id,
        "rendering_result": {
            "view_angle": "front",
            "preview_image_url": "assets/images/item_jacket.jpg",
            "fit_analysis": {
                "fit_status": "OPTIMAL_FIT",
                "description": "ジャストサイズからややゆとりのあるリラックスフィットです。"
            }
        },
        "timestamp": datetime.now().isoformat()
    }), 200


# ==============================================================================
# ▼▼▼【機能 2：マイクローゼット機能（MySQL連携 手持ち服・購入商品の保存・管理）】▼▼▼
# ==============================================================================

# ↓ 指定アカウント(user_id)が登録した手持ち服および自動保存された購入商品をMySQLから取得するGET APIです
@app.route('/api/closet/<user_id>', methods=['GET'])
def get_user_closet(user_id):
    """会員の手持ち服リスト（デジタルクローゼット）をMySQLから取得"""
    # ↓ URLパラメータの user_id が正の整数か検証します
    uid = parse_user_id(user_id)
    # ↓ 無効・未ログインIDなら他人の服が見えないよう空のリストを返します
    if not uid:
        return jsonify({"status": "success", "user_id": user_id, "closet_items": [], "total_items": 0}), 200

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ closet_items テーブルから対象ユーザーの服一覧を取得します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ WHERE `user_id` = %s でアカウント分離し、image_url 列をフロント側と同じキー名 `image` に別名変換して取得します
            cursor.execute(
                "SELECT `id`, `user_id`, `item_uid`, `product_id`, `name`, `category`, `color`, `season`, `image_url` as `image`, `is_owned`, `is_purchased`, `price`, `purchase_date`, `created_at` FROM `closet_items` WHERE `user_id` = %s ORDER BY `id` DESC;",
                (uid,)
            )
            # ↓ 全件取得します
            items = cursor.fetchall()
            # ↓ 取得できたクローゼット配列と合計点数を返します
            return jsonify({
                "status": "success",
                "user_id": uid,
                "closet_items": items,
                "total_items": len(items)
            }), 200
    # ↓ 取得エラー時はログを残して 500 を返します
    except Exception as e:
        print(f"[!] クローゼット取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 接続を閉じます
    finally:
        conn.close()

# ↓ アップロード写真や手持ち服情報をアカウント専用クローゼット(closet_items)へ保存するPOSTエンドポイントです
@app.route('/api/closet/add', methods=['POST'])
def add_to_closet():
    """手持ち服または購入商品をMySQL(closet_items)に登録"""
    # ↓ リクエストJSONを受け取ります
    req = request.get_json() or {}
    # ↓ ログイン中の会員IDを検証します
    user_id = parse_user_id(req.get('user_id'))
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400
    # ↓ 服の名前（前後の空白除去）・カテゴリ・色・季節・画像データ（DataURIまたはパス）を取り出します
    name = req.get('name', '').strip()
    category = req.get('category', 'BOTTOMS')
    color = req.get('color', 'BLACK')
    season = req.get('season', '通年')
    image_url = req.get('image', '')
    # ↓ フロント側で生成されたIDがあれば使い、無ければ「c-現在ミリ秒」で固有IDを生成します
    item_uid = req.get('id') or f"c-{int(datetime.now().timestamp()*1000)}"
    # ↓ ブランド購入品と紐づく場合の元商品ID（手持ち服アップロード時は None）です
    product_id = req.get('productId', None)
    # ↓ MySQLのtinyint(1)用にPythonの真偽値を 1 / 0 の整数に変換します（所有中フラグ・購入済みフラグ）
    is_owned = 1 if req.get('isOwned', True) else 0
    is_purchased = 1 if req.get('isPurchased', False) else 0
    # ↓ 価格と購入日を取り出します
    price = int(req.get('price', 0))
    purchase_date = req.get('purchaseDate', '')

    # ↓ 服の名前が空なら登録できないため 400 エラーを返します
    if not name:
        return jsonify({"status": "error", "message": "服の名前は必須です。"}), 400

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ closet_items テーブルにアイテムを挿入または重複時更新します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ 対象ユーザーがDBに実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            if not cursor.fetchone():
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404
            # ↓ アイテム登録SQL（同じ user_id + item_uid が既にあれば名前・カテゴリ・色・季節・画像を最新に更新します）
            insert_sql = """
            INSERT INTO `closet_items` (
                `user_id`, `item_uid`, `product_id`, `name`, `category`, `color`,
                `season`, `image_url`, `is_owned`, `is_purchased`, `price`, `purchase_date`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                `name` = VALUES(`name`),
                `category` = VALUES(`category`),
                `color` = VALUES(`color`),
                `season` = VALUES(`season`),
                `image_url` = VALUES(`image_url`);
            """
            # ↓ SQLを実行してデータを格納します
            cursor.execute(insert_sql, (
                user_id, item_uid, product_id, name, category, color,
                season, image_url, is_owned, is_purchased, price, purchase_date
            ))
        # ↓ 変更内容をコミットします
        conn.commit()

        # ↓ 保存したアイテムオブジェクトと一緒に HTTP 201（作成完了）を返します
        return jsonify({
            "status": "success",
            "message": f"「{name}」をMySQLクローゼットに保存しました。",
            "item": {
                "id": item_uid,
                "name": name,
                "category": category,
                "color": color,
                "season": season,
                "image": image_url,
                "isOwned": bool(is_owned),
                "isPurchased": bool(is_purchased),
                "price": price,
                "purchaseDate": purchase_date
            }
        }), 201
    # ↓ エラー発生時はロールバックして 500 を返します
    except Exception as e:
        conn.rollback()
        print(f"[!] クローゼット保存エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ DB接続をクローズします
    finally:
        conn.close()

# ↓ 指定したクローゼットアイテム(item_uid)を、ログイン中の本人のデータに限定して削除するDELETE APIです
@app.route('/api/closet/delete/<item_uid>', methods=['DELETE'])
def delete_closet_item(item_uid):
    """手持ち服をMySQL(closet_items)から削除（該当アカウント分のみ削除）"""
    # ↓ クエリまたはJSONから user_id を取り出し整数検証します
    raw_uid = request.args.get('user_id', None)
    if not raw_uid:
        req = request.get_json(silent=True) or {}
        raw_uid = req.get('user_id')
    user_id = parse_user_id(raw_uid)
    # ↓ 有効なユーザーIDが無ければ 400 を返します
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # ↓ DB接続を取得します
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 削除SQLを実行します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ item_uid だけでなく必ず user_id も条件に含め、他アカウントの服が消されないように保護しています
            cursor.execute("DELETE FROM `closet_items` WHERE `item_uid` = %s AND `user_id` = %s;", (item_uid, user_id))
        # ↓ 削除をコミットします
        conn.commit()
        # ↓ 削除完了を返します
        return jsonify({"status": "success", "message": "クローゼットからアイテムを削除しました。"}), 200
    # ↓ エラー時はロールバックし 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 必ず接続を閉じます
    finally:
        conn.close()


# ==============================================================================
# ▼▼▼【機能 3：AI コーデ提案機能（スマートスタイリスト）】▼▼▼
# ==============================================================================
# ここにAIコーデ提案機能（天気・気温・シーン・好みに基づく推薦アルゴリズム）を記述します。
# ------------------------------------------------------------------------------

# ↓ 天気・気温・外出シーンに応じてAIおすすめのコーディネートとアドバイスを返すPOST APIです
@app.route('/api/ai-coordinate/recommend', methods=['POST'])
def recommend_coordinates():
    """会員向けにパーソナライズされたAIコーディネートを提案"""
    # ↓ リクエストJSONから天気(weather)・気温(temperature)・シーン(occasion)を取り出します
    req = request.get_json() or {}
    weather = req.get("weather", "SUNNY")
    temp = req.get("temperature", 22)
    occasion = req.get("occasion", "CASUAL_DATE")

    # ↓ 受け取った気候・シーン条件を組み込んだスタイリスト風アドバイス文を生成します
    ai_advice = (
        f"気温{temp}℃・{weather}の日に最適なミニマルコーデです。"
        f"{occasion}に合わせて、モノトーンで統一した清潔感のある装いをご提案します。"
    )

    # ↓ おすすめのコーディネート案（販売商品＋手持ち服の組み合わせとAI信頼度スコア）を辞書にまとめます
    recommended_outfit = {
        "title": "都会的洗練 モノトーンレイヤードスタイル",
        "styling_advice": ai_advice,
        "items": [
            {"type": "BRAND_ITEM", "product_id": 2, "name": "スマート テーラード ジャケット", "role": "羽織り"},
            {"type": "BRAND_ITEM", "product_id": 1, "name": "プレミアム コットン リラックス Tシャツ", "role": "インナー"},
            {"type": "CLOSET_ITEM", "item_name": "私物の黒スキニーパンツ", "role": "ボトムス"}
        ],
        "confidence_score": 0.94
    }

    # ↓ 条件と推薦コーデをJSONで返します
    return jsonify({
        "status": "success",
        "condition": {"weather": weather, "temperature": temp, "occasion": occasion},
        "recommendation": recommended_outfit
    }), 200


# ==============================================================================
# ▼▼▼【機能 4：ショッピングカート（アカウント別 MySQL 同期）】▼▼▼
# ==============================================================================

# ↓ 指定アカウント(user_id)のMySQLカート(cart_itemsテーブル)から入っている全商品を取り出すGET APIです
@app.route('/api/cart/<int:user_id>', methods=['GET'])
def get_user_cart(user_id):
    """指定アカウントのカート内商品一覧をMySQLから取得"""
    # ↓ URLパラメータの user_id が正しい正の整数かチェックします
    uid = parse_user_id(user_id)
    # ↓ 不正なIDの場合はエラーにせず空配列を返します
    if not uid:
        return jsonify({"status": "success", "items": []}), 200

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ cart_items テーブルを検索し、フロントエンドのカート形式に整形して返します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ ログイン中の本人のカート商品だけを追加順(id ASC)に取得するSQLを実行します
            cursor.execute(
                """
                SELECT `product_id`, `name`, `category`, `color`, `size`, `price`, `quantity`, `image_url`
                FROM `cart_items`
                WHERE `user_id` = %s
                ORDER BY `id` ASC;
                """,
                (uid,)
            )
            # ↓ 見つかった全カート行を取得します
            rows = cursor.fetchall()
            # ↓ リスト内包表記を使ってフロントエンド（AppState.cart）と同じキー名のオブジェクト配列に詰め替えます
            items = [
                {
                    "id": int(r['product_id']),
                    "name": r['name'],
                    "category": r['category'] or 'TOPS',
                    "color": r['color'] or 'STANDARD',
                    "size": r['size'] or 'M',
                    "price": int(r['price'] or 0),
                    "quantity": int(r['quantity'] or 1),
                    "image": r['image_url'] or ''
                }
                for r in rows
            ]
        # ↓ 取得したユーザー別のカート商品配列を返します
        return jsonify({"status": "success", "user_id": uid, "items": items}), 200
    # ↓ 例外時はエラーログを出して 500 を返します
    except Exception as e:
        print(f"[!] カート取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ DB接続をクローズします
    finally:
        conn.close()


# ↓ フロント側の現在カート配列を受け取り、MySQL上の該当アカウントのカート丸ごと最新状態へ同期するPOST APIです
@app.route('/api/cart/sync', methods=['POST'])
def sync_user_cart():
    """指定アカウントのカート内容をMySQLに同期保存（全置換方式で厳密管理）"""
    # ↓ リクエストJSONを受け取ります
    req = request.get_json() or {}
    # ↓ 同期先のユーザーIDを検証します
    user_id = parse_user_id(req.get('user_id'))
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # ↓ 同期したいカート配列を受け取ります
    raw_items = req.get('items', [])
    # ↓ リスト(配列)型でなければ形式エラー 400 を返します
    if not isinstance(raw_items, list):
        return jsonify({"status": "error", "message": "itemsは配列である必要があります。"}), 400

    # 同一(product_id, color, size)を集約し不正行を除外
    # ↓ 同じ商品・同じ色・同じサイズの要素が複数に分かれていた場合に数量を合算するため辞書を用意します
    merged_map = {}
    # ↓ 元の並び順を保つためキーの登録順を記録するリストを用意します
    ordered_keys = []
    # ↓ 送信された全カート要素を1件ずつ検査・正規化します
    for it in raw_items:
        # ↓ 辞書型でない不正要素はスキップします
        if not isinstance(it, dict):
            continue
        # ↓ 商品IDを取り出し整数に変換できるか試みます（変換不能な行はスキップ）
        pid = it.get('id', it.get('product_id'))
        try:
            pid_int = int(pid)
        except (TypeError, ValueError):
            continue
        # ↓ 数量を整数で取得し、0以下の不要アイテムはカートから除外します
        qty = int(it.get('quantity', 1) or 1)
        if qty <= 0:
            continue
        # ↓ カラム文字数上限に合わせて色(50文字)とサイズ(20文字)を切り詰めます
        color = str(it.get('color') or 'STANDARD')[:50]
        size = str(it.get('size') or 'M')[:20]
        # ↓ 「商品ID + 色 + サイズ」の3つ組をユニークキーにします
        key = (pid_int, color, size)
        # ↓ すでに同じキーが登録済みなら数量だけを足し合わせます
        if key in merged_map:
            merged_map[key]['quantity'] += qty
        # ↓ 新規の組み合わせなら登録順リストと辞書へ保存します
        else:
            ordered_keys.append(key)
            merged_map[key] = {
                "id": pid_int,
                "name": str(it.get('name') or '商品')[:255],
                "category": str(it.get('category') or 'TOPS')[:50],
                "color": color,
                "size": size,
                "price": int(it.get('price') or 0),
                "quantity": qty,
                "image": str(it.get('image') or '')
            }

    # ↓ 元の順番通りに整列・集約された最終アイテム配列を作ります
    normalized_items = [merged_map[k] for k in ordered_keys]

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 既存カート全削除→正規化後アイテム全挿入（全置換方式）をトランザクション内で実行します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ 会員存在チェックを行います
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            if not cursor.fetchone():
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404

            # ↓ まずこのユーザーの古いカート行をすべて削除します（これにより削除した商品が復活しません）
            cursor.execute("DELETE FROM `cart_items` WHERE `user_id` = %s;", (user_id,))
            # ↓ カート内に1点以上アイテムが残っていれば順番にDBへ登録し直します
            if normalized_items:
                # ↓ カート明細を1行ずつ挿入するINSERT文を用意します
                insert_sql = """
                INSERT INTO `cart_items` (
                    `user_id`, `product_id`, `name`, `category`, `color`, `size`, `price`, `quantity`, `image_url`
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """
                # ↓ 正規化済みアイテムを1つずつDBへINSERTします
                for item in normalized_items:
                    cursor.execute(insert_sql, (
                        user_id, item['id'], item['name'], item['category'],
                        item['color'], item['size'], item['price'], item['quantity'], item['image']
                    ))
        # ↓ 全置換結果をコミットして確定させます
        conn.commit()
        # ↓ 同期結果と正規化後アイテム配列を返却します
        return jsonify({
            "status": "success",
            "message": "カートをMySQLに同期しました。",
            "user_id": user_id,
            "items": normalized_items
        }), 200
    # ↓ 失敗時はロールバックして直前のカート状態を保護し 500 を返します
    except Exception as e:
        conn.rollback()
        print(f"[!] カート保存エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 接続を閉じます
    finally:
        conn.close()


# ↓ 指定アカウント(user_id)のカートだけを空にするDELETEエンドポイントです
@app.route('/api/cart/<int:user_id>', methods=['DELETE'])
def clear_user_cart(user_id):
    """指定アカウントのカートをMySQLからクリア"""
    # ↓ ユーザーIDを整数検証します
    uid = parse_user_id(user_id)
    if not uid:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ 該当ユーザーの cart_items を削除します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM `cart_items` WHERE `user_id` = %s;", (uid,))
        # ↓ 削除をコミットします
        conn.commit()
        # ↓ クリア完了レスポンスを返します
        return jsonify({"status": "success", "message": "カートをクリアしました。"}), 200
    # ↓ エラー時はロールバックし 500 を返します
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 接続を閉じます
    finally:
        conn.close()


# ==============================================================================
# ▼▼▼【機能 5：スタジオ試着状態（マネキン着用・微調整・性別 アカウント別同期）】▼▼▼
# ==============================================================================

# ↓ マネキンに何も着せていない初期状態の5スロット辞書定数です
DEFAULT_STUDIO_OUTFIT = {"hat": None, "outer": None, "tops": None, "bottoms": None, "shoes": None}
# ↓ 各スロットの初期位置ズレ(x, y)・拡大縮小(scale, customScale)・ブランドサイズ(brandSize)定数です
DEFAULT_FITTING_OFFSETS = {
    "hat": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100},     # 帽子スロットの初期微調整値
    "tops": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100},    # トップススロットの初期微調整値
    "outer": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100},   # アウタースロットの初期微調整値
    "bottoms": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100}, # ボトムススロットの初期微調整値
    "shoes": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100}    # 靴スロットの初期微調整値
}


# ↓ 指定アカウントが前回マネキンに着せていた服・位置調整・性別設定をMySQLから復元するGET APIです
@app.route('/api/studio-state/<int:user_id>', methods=['GET'])
def get_user_studio_state(user_id):
    """指定アカウントの現在のマネキン着用状態・位置サイズ微調整・性別設定を取得"""
    # ↓ ユーザーIDを整数検証します
    uid = parse_user_id(user_id)
    # ↓ 無効IDの場合はデフォルトの空マネキン状態（exists=False）を返します
    if not uid:
        return jsonify({
            "status": "success",
            "exists": False,
            "studio_state": {
                "current_outfit": DEFAULT_STUDIO_OUTFIT,
                "fitting_offsets": DEFAULT_FITTING_OFFSETS,
                "studio_gender": "MEN"
            }
        }), 200

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ user_studio_states テーブルを検索します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ この会員(user_id)専用のスタジオ保存行を取得します
            cursor.execute(
                "SELECT `current_outfit_json`, `fitting_offsets_json`, `studio_gender` FROM `user_studio_states` WHERE `user_id` = %s;",
                (uid,)
            )
            # ↓ 1件取得します（未保存のユーザーなら None）
            row = cursor.fetchone()
            # ↓ まだ一度もスタジオ状態が保存されていないユーザーなら exists=False と初期値を返します
            if not row:
                return jsonify({
                    "status": "success",
                    "user_id": uid,
                    "exists": False,
                    "studio_state": {
                        "current_outfit": DEFAULT_STUDIO_OUTFIT,
                        "fitting_offsets": DEFAULT_FITTING_OFFSETS,
                        "studio_gender": "MEN"
                    }
                }), 200

            # ↓ JSON文字列で保存されている着用5スロット情報を辞書に復元します（破損時は初期値を採用）
            try:
                outfit = json.loads(row['current_outfit_json']) if row.get('current_outfit_json') else dict(DEFAULT_STUDIO_OUTFIT)
            except Exception:
                outfit = dict(DEFAULT_STUDIO_OUTFIT)
            # ↓ JSON文字列で保存されている微調整座標・サイズ設定を辞書に復元します
            try:
                offsets = json.loads(row['fitting_offsets_json']) if row.get('fitting_offsets_json') else dict(DEFAULT_FITTING_OFFSETS)
            except Exception:
                offsets = dict(DEFAULT_FITTING_OFFSETS)

            # ↓ 選択されていたマネキン性別（'MEN' または 'WOMEN' 以外は安全のため 'MEN' に丸めます）を取り出します
            gender = row.get('studio_gender') if row.get('studio_gender') in ('MEN', 'WOMEN') else 'MEN'

        # ↓ 復元したスタジオ状態（exists=True）を返却します
        return jsonify({
            "status": "success",
            "user_id": uid,
            "exists": True,
            "studio_state": {
                "current_outfit": outfit,
                "fitting_offsets": offsets,
                "studio_gender": gender
            }
        }), 200
    # ↓ 取得エラー時はログを出し 500 を返します
    except Exception as e:
        print(f"[!] スタジオ状態取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ DB接続をクローズします
    finally:
        conn.close()


# ↓ マネキンへの着脱・スライダー微調整・性別切替のたびにデバウンス送信される試着状態をMySQLへ保存するPOST APIです
@app.route('/api/studio-state/save', methods=['POST'])
def save_user_studio_state():
    """指定アカウントの現在のマネキン着用状態・位置サイズ微調整・性別設定をMySQLへ保存"""
    # ↓ リクエストJSONを受け取ります
    req = request.get_json() or {}
    # ↓ ユーザーIDを検証します
    user_id = parse_user_id(req.get('user_id'))
    if not user_id:
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # ↓ 送られてきた着用コーデ・位置オフセット・性別を取り出し、安全チェックを行います
    current_outfit = req.get('current_outfit', DEFAULT_STUDIO_OUTFIT)
    fitting_offsets = req.get('fitting_offsets', DEFAULT_FITTING_OFFSETS)
    studio_gender = req.get('studio_gender', 'MEN')
    if studio_gender not in ('MEN', 'WOMEN'):
        studio_gender = 'MEN'

    # ↓ DB接続を開きます
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # ↓ user_studio_states テーブルへ登録または上書き更新（Upsert）します
    try:
        # ↓ カーソルを開きます
        with conn.cursor() as cursor:
            # ↓ 会員の実在確認を行います
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            if not cursor.fetchone():
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404

            # ↓ 同じuser_idの行がすでに存在すれば最新状態で上書き更新するSQL文を用意します
            upsert_sql = """
            INSERT INTO `user_studio_states` (
                `user_id`, `current_outfit_json`, `fitting_offsets_json`, `studio_gender`
            ) VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                `current_outfit_json` = VALUES(`current_outfit_json`),
                `fitting_offsets_json` = VALUES(`fitting_offsets_json`),
                `studio_gender` = VALUES(`studio_gender`);
            """
            # ↓ ensure_ascii=False を付けて日本語商品名を \uXXXX 形式にせずそのまま読めるJSON文字列で保存します
            cursor.execute(upsert_sql, (
                user_id,
                json.dumps(current_outfit, ensure_ascii=False),
                json.dumps(fitting_offsets, ensure_ascii=False),
                studio_gender
            ))
        # ↓ 保存内容を確定（コミット）します
        conn.commit()
        # ↓ 保存完了を返します
        return jsonify({"status": "success", "message": "スタジオ試着状態をMySQLに保存しました。"}), 200
    # ↓ 失敗時はロールバックし 500 を返します
    except Exception as e:
        conn.rollback()
        print(f"[!] スタジオ状態保存エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    # ↓ 接続をクローズします
    finally:
        conn.close()


# ==============================================================================
# 5. 静的ファイル配信・ルートハンドラ
# ==============================================================================

# ↓ トップURL「http://127.0.0.1:8080/」にアクセスされたときメイン画面である index.html を返します
@app.route('/')
def serve_index():
    """ルートURLアクセス時にフロントエンドの index.html を返却"""
    # ↓ カレントフォルダ('.')から index.html をブラウザへ配信します
    return send_from_directory('.', 'index.html')

# ↓ CSS・JS・商品画像など「/api/...」以外のあらゆる静的ファイルリクエストに実ファイルを返すルートです
@app.route('/<path:path>')
def serve_static(path):
    """CSS、JS、画像などの静的リソースを返却"""
    # ↓ リクエストされたパス文字列に対応するファイルをフォルダ内から探して返します
    return send_from_directory('.', path)


# ==============================================================================
# サーバー起動メインルーチン
# ==============================================================================
# ↓ サーバー起動前に必要な準備と起動メッセージ表示を行いWebサーバーを待ち受け状態にする関数です
def main():
    # ↓ 起動時にまず cart_items / user_studio_states テーブルがMySQLに存在するか自動確認・作成します
    ensure_account_tables()
    # ↓ 環境変数 PORT が設定されていればその番号を、無ければ既定の 8080 番ポートを使います
    port = int(os.environ.get('PORT', 8080))
    # ↓ コンソールにサーバー起動案内バナーと主要APIエンドポイント一覧を見やすく表示します
    print("=" * 70)
    print("【MANEKIN FASHION バックエンドAPIサーバー (Python + MySQL) 起動中】")
    print(f"URL: http://localhost:{port}")
    print("接続先MySQL: manekin_db (localhost:3306)")
    print("API一覧:")
    print("  ・商品一覧 / 詳細      : GET  /api/products , GET /api/products/<id>")
    print("  ・注文作成 / 確定      : POST /api/orders (MySQLに書き込み)")
    print("  ・購入履歴一覧        : GET  /api/orders (MySQLから取得)")
    print("  ・カート管理          : GET/DELETE /api/cart/<user_id> , POST /api/cart/sync")
    print("  ・スタジオ状態管理    : GET /api/studio-state/<user_id> , POST /api/studio-state/save")
    print("  ・会員登録 / ログイン  : POST /api/auth/register , POST /api/auth/login")
    print("  ・MANEKIN 3D / AI機能 : /api/manekin/* , /api/closet/* , /api/ai-coordinate/*")
    print("=" * 70)
    # ↓ Flask内蔵の開発Webサーバーを起動します（use_reloader=False によりバックグラウンド二重起動を防止します）
    app.run(
        host='127.0.0.1',   # 自分のパソコン内（ローカルホスト）からのアクセスを受け付けます
        port=8080,          # 待ち受けるポート番号（8080番）
        debug=True,         # エラー詳細ログをコンソールに表示するデバッグモードON
        use_reloader=False  # ファイル変更時の自動再起動をOFFにして二重プロセスを防ぎます
    )

# ↓ 「python app.py」として直接起動されたときのみサーバーの main() 関数を実行します
if __name__ == '__main__':
    main()
