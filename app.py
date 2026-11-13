# ==============================================================================
#  MANEKIN FASHION - バックエンド API サーバー (app.py)
#  Python の Web フレームワーク「Flask」と XAMPP「MySQL」をつなぎ、
#  画面HTML/JS/画像配信、HttpOnlyセッション認証、注文・カート・試着データの永続化を担当します。
# ==============================================================================

# ==============================================================================
#  1. 標準・外部ライブラリの読み込み & Flask / CORS / Cookie 初期設定
# ==============================================================================
# Python のシステム機能を提供する標準ライブラリ sys を読み込みます
import sys
# 環境変数（PORT番号等）やファイル操作を行う標準ライブラリ os を読み込みます
import os
# JavaScript とやり取りする JSON データ形式を変換するための標準ライブラリ json を読み込みます
import json
# ランダムな英数字から重複しにくい注文番号を生成するため random を読み込みます
import random
# ランダム文字列の候補となる英大文字(A-Z)・数字(0-9)定数を使うため string を読み込みます
import string
# 現在日時の取得・書式整形（YYYYMMDD 等）のために datetime クラスを読み込みます
from datetime import datetime
# ログインセッション用に暗号学的に安全な推測困難トークンを作る secrets を読み込みます
import secrets

# Web サーバー本体の Flask、JSON応答の jsonify、受信取得の request 等を読み込みます
from flask import Flask, jsonify, request, send_from_directory, make_response
# 別オリジン（別ポートの XAMPP や localhost 等）からの Cookie 付き API 通信を許可する CORS を読み込みます
from flask_cors import CORS
# Python から XAMPP の MySQL データベースへ接続・SQL 実行するライブラリ pymysql を読み込みます
import pymysql
# SQL 検索結果を番号ではなく列名（辞書形式）で受け取る DictCursor 設定を読み込みます
from pymysql.cursors import DictCursor

# 現在のディレクトリ('.')を静的配信先に含めた Flask アプリケーション本体を作成します
app = Flask(__name__, static_folder='.', static_url_path='')
# 静的ファイル（HTML/JS/CSS）のブラウザキャッシュ有効期限を 0 秒に設定し、常に最新ファイルを配信します
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
# フロント側 fetch(..., credentials: 'include') での Cookie 送受信を許可する CORS 設定を有効化します
CORS(app, supports_credentials=True)

# ブラウザの Cookie に保存するセッション鍵の名前定数です
SESSION_COOKIE_NAME = 'manekin_session'
# ログイン状態（セッションCookie）を有効維持する日数（7日間）です
SESSION_TTL_DAYS = 7

# すべての Flask レスポンスがクライアントへ返却される直前に自動実行されるフックを登録します
@app.after_request
# すべての HTTP レスポンス返却直前に割り込み、キャッシュ禁止ヘッダを付ける関数です
def disable_api_cache(response):
    # ブラウザがHTML/JS/CSSや/api/応答を古いキャッシュで保持しないよう Cache-Control: no-store 等を指定します
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    # 古い HTTP/1.0 互換キャッシュ機構にもキャッシュ禁止を伝える Pragma: no-cache を付与します
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    # 結果（response）を呼び出し元へ返却します
    return response

# ==============================================================================
#  2. MySQL データベース接続設定 & 起動時テーブル自動作成ヘルパー
# ==============================================================================
# XAMPP で動かしている MySQL（manekin_db）への接続設定辞書です
DB_CONFIG = {
    # 接続先 MySQL サーバーのホストIP（XAMPP 標準はローカル 127.0.0.1）
    'host': '127.0.0.1',
    # MySQL 通信ポート番号（XAMPP 標準は 3306）
    'port': 3306,
    # MySQL 接続ユーザー名（XAMPP 初期値は root）
    'user': 'root',
    # MySQL 接続パスワード（XAMPP 初期設定は空文字）
    'password': '',
    # 使用するデータベース名（事前に作成した manekin_db）
    'database': 'manekin_db',
    # 日本語・絵文字の文字化けを防ぐ utf8mb4 文字コード設定
    'charset': 'utf8mb4',
    # SQL 検索結果を番号ではなく列名（辞書形式）で取得する指定
    'cursorclass': DictCursor
}

# MySQL データベース（manekin_db）へ新しく接続を開き、失敗時は None を返す共通関数です
def get_db_connection():
    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # 右辺の結果（pymysql.connect(**DB_CONFIG)）を変数 connection に代入して以降の処理で使います
        connection = pymysql.connect(**DB_CONFIG)
        # 結果（connection）を呼び出し元へ返却します
        return connection
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as err:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] MySQL接続エラー: {err}")
        # 有効な値が取得できなかった合図として None（空）を返します
        return None

# 文字列や数値のユーザーIDを検証し、「1以上の正しい整数」なら int・不正なら None を返す関数です
def parse_user_id(raw_uid):
    # 条件式（if raw_uid is None or raw_uid == ''）が成り立つかチェックして処理を分岐します
    if raw_uid is None or raw_uid == '':
        # 有効な値が取得できなかった合図として None（空）を返します
        return None
    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # URL等で受け取ったユーザーIDが1以上の正しい整数か検証して変換します
        uid = int(raw_uid)
        # 結果（uid if uid > 0 else None）を呼び出し元へ返却します
        return uid if uid > 0 else None
    # 型変換エラー等（(TypeError, ValueError)）を捕捉した場合のフォールバック処理です
    except (TypeError, ValueError):
        # 有効な値が取得できなかった合図として None（空）を返します
        return None

# テーブル自動初期化が完了したかを記憶するキャッシュフラグ
_tables_ensured = False

# 起動時にアカウント別保存に必要なテーブル群を自動作成します
def ensure_account_tables():
    global _tables_ensured
    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # 処理結果の成否フラグとして False を呼び出し元へ返します
        return False
    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 会員別カートテーブル `cart_items` が無ければ自動作成します（user_id+商品+色+サイズで一意制約）
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
            # 会員別スタジオ状態テーブル `user_studio_states` が無ければ自動作成します（着用服JSON・調整値JSON・性別）
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
            # 会員別所持クーポン管理テーブル `user_coupons` が無ければ自動作成します（使用したら消滅）
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
            # orders テーブルに customer_name カラムが無ければ自動追加します
            cursor.execute("SHOW COLUMNS FROM `orders` LIKE 'customer_name';")
            if not cursor.fetchone():
                try:
                    cursor.execute("ALTER TABLE `orders` ADD COLUMN `customer_name` varchar(255) DEFAULT NULL AFTER `user_id`;")
                except Exception:
                    pass

            # orders テーブルに coupon_code / coupon_discount カラムが無ければ自動追加します
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
            # HttpOnly Cookie 認証用セッション管理テーブル `user_sessions` が無ければ自動作成します
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS `user_sessions` (
                  `id` int(11) NOT NULL AUTO_INCREMENT,
                  `session_token` varchar(128) NOT NULL,
                  `user_id` int(11) NOT NULL,
                  `expires_at` datetime NOT NULL,
                  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
                  PRIMARY KEY (`id`),
                  UNIQUE KEY `uk_session_token` (`session_token`),
                  KEY `idx_session_user_id` (`user_id`),
                  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
            """)
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # テーブル初期化成功フラグを立てます
        _tables_ensured = True
        # 処理結果の成否フラグとして True を呼び出し元へ返します
        return True
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] テーブル初期化確認エラー: {e}")
        # 処理結果の成否フラグとして False を呼び出し元へ返します
        return False
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()


# すべてのリクエスト受信前にテーブル作成が確実に完了しているか自動チェックするフック
@app.before_request
def auto_ensure_tables():
    global _tables_ensured
    if not _tables_ensured:
        ensure_account_tables()


# 会員に初回限定1割引クーポンを安全に付与する共通ヘルパー（SQL内の%プレースホルダ衝突を防止）
def grant_welcome_coupon(cursor, user_id):
    if not user_id:
        return False
    try:
        cursor.execute("SELECT count(*) as cnt FROM `user_coupons` WHERE `user_id` = %s;", (user_id,))
        c_cnt = cursor.fetchone()
        if not c_cnt or c_cnt['cnt'] == 0:
            cursor.execute("""
                INSERT INTO `user_coupons` (`user_id`, `code`, `name`, `discount_rate`, `discount_label`, `is_used`, `created_at`)
                VALUES (%s, %s, %s, %s, %s, 0, NOW());
            """, (user_id, 'WELCOME10', '【初回限定】1割引クーポン (10% OFF)', 0.10, '1割引 (10% OFF)'))
            return True
    except Exception as e:
        print(f"[!] クーポン付与スキップ: {e}")
        try:
            ensure_account_tables()
        except Exception:
            pass
    return False

# ==============================================================================
#  3. 商品カタログ取得 & ヘルスチェック API (/api/products, /api/health)
# ==============================================================================
# URL パス「/api/products」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/products', methods=['GET'])
# 全商品一覧と各商品の色バリエーション画像配列を取得して JSON で返す GET API 関数です
def get_all_products():
    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 商品マスタ products テーブルから商品情報（全件または特定ID）を取得します
            cursor.execute("SELECT * FROM `products` ORDER BY `id` ASC;")
            # SQL 検索で取得した全商品行データのリストを受け取ります
            products = cursor.fetchall()

            # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for p in products）
            for p in products:
                # 色バリエーション管理テーブル product_variants から対象商品の色一覧と色別画像URLを取得します
                cursor.execute("SELECT `color`, `color_code`, `image_url` FROM `product_variants` WHERE `product_id` = %s;", (p['id'],))
                # 対象商品の色別画像バリエーション行すべてを配列として取得します
                variants = cursor.fetchall()
                # カラーバリエーション一覧配列を作成して商品辞書に追加します（未登録時は STANDARD）
                p['colors'] = [v['color'] for v in variants] if variants else ["STANDARD"]
                # カラー名をキー、対応画像URLを値とするマップ辞書を作成して商品辞書に追加します
                p['colorImages'] = {v['color']: v['image_url'] for v in variants} if variants else {p['colors'][0]: p['image']}
                # 共通展開サイズ一覧 ['S', 'M', 'L', 'XL'] を商品辞書へセットします
                p['sizes'] = ["S", "M", "L", "XL"]

        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "products": products}), 200

    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] 商品取得エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/products/<int:product_id>」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/products/<int:product_id>', methods=['GET'])
# URLで指定された商品ID 1件の詳細情報と色バリエーションを取得して返す GET API 関数です
def get_product_detail(product_id):
    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 商品マスタ products テーブルから商品情報（全件または特定ID）を取得します
            cursor.execute("SELECT * FROM `products` WHERE `id` = %s;", (product_id,))
            # 指定IDの商品を 1 件だけ辞書形式で取り出します
            product = cursor.fetchone()
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not product:
                # 指定した会員や商品が見つからない旨を HTTP 404 (Not Found) で返します
                return jsonify({"status": "error", "message": "商品が見つかりません。"}), 404

            # 色バリエーション管理テーブル product_variants から対象商品の色一覧と色別画像URLを取得します
            cursor.execute("SELECT `color`, `color_code`, `image_url` FROM `product_variants` WHERE `product_id` = %s;", (product_id,))
            # 対象商品の色別画像バリエーション行すべてを配列として取得します
            variants = cursor.fetchall()
            # カラーバリエーション一覧配列を作成して商品辞書に追加します（未登録時は STANDARD）
            product['colors'] = [v['color'] for v in variants] if variants else ["STANDARD"]
            # カラー名をキー、対応画像URLを値とするマップ辞書を作成して商品辞書に追加します
            product['colorImages'] = {v['color']: v['image_url'] for v in variants} if variants else {product['colors'][0]: product['image']}
            # 共通展開サイズ一覧 ['S', 'M', 'L', 'XL'] を商品辞書へセットします
            product['sizes'] = ["S", "M", "L", "XL"]

        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "product": product}), 200

    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/health」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/health', methods=['GET'])
# Flask サーバーと MySQL 接続が生きているかを確認して返すヘルスチェック GET API 関数です
def health_check():
    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "warning", "mysql": "disconnected", "message": "Flaskは稼働中ですが、MySQL(manekin_db)に接続できません。XAMPPでMySQLを起動してください。"}), 200
    # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
    conn.close()
    # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
    return jsonify({"status": "ok", "mysql": "connected", "message": "Flask API & MySQL (manekin_db) は正常に稼働しています。"}), 200

# ==============================================================================
#  4. 注文作成（ポイント清算＋クローゼット自動追加）・注文履歴 API (/api/orders)
# ==============================================================================
# URL パス「/api/orders」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/orders', methods=['POST'])
# 新規注文を受け取り、注文登録・明細保存・クローゼット自動追加・ポイント精算・カート空化を1トランザクションで処理します
def create_order():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}

    # 注文者のお名前を前後の空白を除いて取得します
    customer_name = (req.get('customer_name') or '').strip()
    # 注文確認用メールアドレスを前後の空白を除いて取得します
    customer_email = (req.get('customer_email') or '').strip()
    # 配送先の郵便番号を取得します
    postal_code = (req.get('postal_code') or '').strip()
    # 配送先住所を前後の空白を除いて取得します
    address = (req.get('address') or '').strip()
    # 連絡先電話番号を取得します
    phone = (req.get('phone') or '').strip()
    # お支払い方法（未指定時は 'クレジットカード'）を取得します
    payment_method = req.get('payment_method') or 'クレジットカード'
    # 希望配送時間帯（未指定時は '指定なし'）を取得します
    delivery_time = req.get('delivery_time') or '指定なし'
    # カートに入っていた注文商品の詳細配列を受け取ります
    cart_items = req.get('items', []) or req.get('items_detail', [])
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id', None))
    # フロント側から明示的に渡された注文番号（二重送信防止キー）があれば受け取ります
    provided_order_no = req.get('order_no', None)
    # 過去データの同期モードかどうかを表す真偽フラグを取得します
    is_sync = bool(req.get('sync_mode', False))

    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "ご注文には有効な会員ログインが必要です（user_idが不足または不正です）。"}), 400
    # 条件式（if not customer_name or not customer_email or not addre）が成り立つかチェックして処理を分岐します
    if not customer_name or not customer_email or not address or not cart_items:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "お名前、メールアドレス、住所、注文商品は必須です。"}), 400

    # 注文商品の税込み小計金額を合計計算するための変数を 0 で初期化します
    subtotal = 0
    # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for item in cart_items）
    for item in cart_items:
        # 右辺の結果（int(item.get('quantity', 1))）を変数 qty に代入して以降の処理で使います
        qty = int(item.get('quantity', 1))
        # 右辺の結果（int(item.get('price', item.get('unit_price', ）を変数 price に代入して以降の処理で使います
        price = int(item.get('price', item.get('unit_price', 0)))
        # 注文商品の税込み小計金額を合計計算するための変数を 0 で初期化します
        subtotal += (price * qty)

    # 商品小計が 5,000 円以上なら送料無料（0円）、未満なら送料 550 円に設定します
    shipping_fee = 0 if subtotal >= 5000 else 550
    # クーポンコードとクーポンの割引額を初期化します
    coupon_code = (req.get('coupon_code') or '').strip()
    coupon_discount = 0
    coupon_id = None
    applied_coupon_label = None

    # 今日の日付を 'YYYYMMDD' 形式の 8 桁文字列（例: 20261112）で作ります
    today_str = datetime.now().strftime('%Y%m%d')
    # 英大文字と数字からランダムに 4 文字を選んで注文番号末尾の識別コードを作ります
    random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    # 重複しない一意の注文番号（'ORD-日付-ランダム4文字'、事前指定があればそれ）を決めます
    order_no = provided_order_no if provided_order_no else f"ORD-{today_str}-{random_code}"

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 不正なユーザーIDや退会済み会員への操作を防ぐため、users テーブルに会員が実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not cursor.fetchone():
                # 指定した会員や商品が見つからない旨を HTTP 404 (Not Found) で返します
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404

            # 条件式（if provided_order_no）が成り立つかチェックして処理を分岐します
            if provided_order_no:
                # orders テーブルから該当ユーザー・注文番号の注文レコードを検索します
                cursor.execute("SELECT `id`, `order_no`, `user_id` FROM `orders` WHERE `order_no` = %s;", (provided_order_no,))
                # SQL 検索結果の先頭 1 行を辞書として変数 existing_ord に受け取ります（0件時は None）
                existing_ord = cursor.fetchone()
                # すでに同じデータのレコードがデータベースに存在しているか分岐チェックします
                if existing_ord:
                    # すでに同じデータのレコードがデータベースに存在しているか分岐チェックします
                    if str(existing_ord.get('user_id')) == str(user_id):
                        # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
                        return jsonify({
                            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
                            "status": "success",
                            # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
                            "message": "すでにMySQLへ登録済みの注文です。",
                            # レスポンス／設定辞書の 'already_exists' 項目をセットします
                            "already_exists": True,
                            # 注文完了直後に画面や注文履歴へ反映する注文サマリーオブジェクト
                            "order": {"order_id": existing_ord['id'], "order_no": existing_ord['order_no']}
                        # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
                        }), 200
                    # 重複しない一意の注文番号（'ORD-日付-ランダム4文字'、事前指定があればそれ）を決めます
                    order_no = f"ORD-{today_str}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=4))}"

            # クーポンが指定されている場合、未使用の所持クーポンか検証して割引を計算します
            if coupon_code and user_id:
                try:
                    cursor.execute(
                        "SELECT `id`, `name`, `discount_rate`, `discount_label` FROM `user_coupons` WHERE `user_id` = %s AND `code` = %s AND `is_used` = 0;",
                        (user_id, coupon_code)
                    )
                    c_row = cursor.fetchone()
                    if c_row:
                        coupon_id = c_row['id']
                        applied_coupon_label = c_row['name']
                        d_rate = float(c_row.get('discount_rate') or 0.10)
                        coupon_discount = int(subtotal * d_rate)
                except Exception as e_c:
                    print(f"[!] 注文時クーポン検証スキップ: {e_c}")

            # クーポン割引適用後の商品小計（0円未満にはならない）
            discounted_subtotal = max(0, subtotal - coupon_discount)

            # ポイントは配送料には影響せず、確実に配送料は払う必要がある
            # （ポイントは商品小計 discounted_subtotal までしか充当できません）
            raw_used_points = max(0, int(req.get('used_points', 0) or 0))
            used_points = min(raw_used_points, discounted_subtotal)

            # 最終支払金額: (割引後商品小計 - 利用ポイント) + 配送料（確実に配送料を支払う）
            total_amount = (discounted_subtotal - used_points) + shipping_fee
            # 獲得予定ポイント（支払総額の1%）
            earned_points = int(req.get('earned_points', int(total_amount * 0.01)))

            # クーポンを使用済みに更新（使用したら消滅）
            if coupon_id:
                try:
                    cursor.execute("UPDATE `user_coupons` SET `is_used` = 1, `used_at` = NOW() WHERE `id` = %s;", (coupon_id,))
                except Exception as e_c:
                    print(f"[!] クーポン消滅更新エラー: {e_c}")

            # orders テーブルへ 1 件分の注文ヘッダ（注文番号・配送先・合計金額・使用/獲得ポイント・クーポン・注文日時）を追加します
            insert_order_sql = """
            INSERT INTO `orders` (
                `order_no`, `user_id`, `customer_name`, `customer_email`,
                `postal_code`, `address`, `phone`, `payment_method`,
                `delivery_time`, `subtotal`, `shipping_fee`, `total_amount`,
                `used_points`, `earned_points`, `coupon_code`, `coupon_discount`, `status`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW());
            """
            # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
            cursor.execute(insert_order_sql, (
                # 配列要素または直前の SQL プレースホルダへ渡す値（order_no, user_id, customer_name, customer_em）です
                order_no, user_id, customer_name, customer_email,
                # 配列要素または直前の SQL プレースホルダへ渡す値（postal_code, address, phone, payment_method）です
                postal_code, address, phone, payment_method,
                # 配列要素または直前の SQL プレースホルダへ渡す値（delivery_time, subtotal, shipping_fee, total_）です
                delivery_time, subtotal, shipping_fee, total_amount,
                # SQL プレースホルダ(%s)や関数引数へ順番どおりに渡すデータ値です
                used_points, earned_points,
                coupon_code if coupon_id else None, coupon_discount, "注文受付済み"
            ))
            # 今 INSERT した orders テーブルの自動採番 ID（PRIMARY KEY）を取得します
            order_id = cursor.lastrowid

            # order_items テーブルへ各注文商品の明細（商品名・色・サイズ・数量・単価・画像URL）を追加します
            insert_item_sql = """
            INSERT INTO `order_items` (
                `order_id`, `product_id`, `product_name`, `color`,
                `size`, `quantity`, `unit_price`, `image_url`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """
            # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for item in cart_items）
            for item in cart_items:
                # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
                cursor.execute(insert_item_sql, (
                    # 配列要素または直前の SQL プレースホルダへ渡す値（order_id）です
                    order_id,
                    # 配列要素または直前の SQL プレースホルダへ渡す値（item.get('id', item.get('product_id', 0))）です
                    item.get('id', item.get('product_id', 0)),
                    # 配列要素または直前の SQL プレースホルダへ渡す値（item.get('name', item.get('product_name', '商品）です
                    item.get('name', item.get('product_name', '商品名未定')),
                    # 配列要素または直前の SQL プレースホルダへ渡す値（item.get('color', 'STANDARD')）です
                    item.get('color', 'STANDARD'),
                    # 配列要素または直前の SQL プレースホルダへ渡す値（item.get('size', 'M')）です
                    item.get('size', 'M'),
                    # 配列要素または直前の SQL プレースホルダへ渡す値（int(item.get('quantity', 1))）です
                    int(item.get('quantity', 1)),
                    # 配列要素または直前の SQL プレースホルダへ渡す値（int(item.get('price', item.get('unit_price', ）です
                    int(item.get('price', item.get('unit_price', 0))),
                    # SQL プレースホルダ(%s)や関数引数へ順番どおりに渡すデータ値（item.get('image', item.get('image_url', 'ass）です
                    item.get('image', item.get('image_url', 'assets/images/item_tshirt.jpg'))
                ))

            # closet_items テーブルへ購入商品や手持ち服を登録します（同一キー重複時は項目を上書き更新）
            insert_closet_sql = """
            INSERT INTO `closet_items` (
                `user_id`, `item_uid`, `product_id`, `name`, `category`, `color`,
                `season`, `image_url`, `is_owned`, `is_purchased`, `price`, `purchase_date`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, 1, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
            """
            # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for idx, item in enumerate(cart_items)）
            for idx, item in enumerate(cart_items):
                # 右辺の結果（item.get('id', item.get('product_id', 0))）を変数 p_id に代入して以降の処理で使います
                p_id = item.get('id', item.get('product_id', 0))
                # 右辺の結果（f"purchased-{p_id}-{order_no}-{idx}"）を変数 item_uid に代入して以降の処理で使います
                item_uid = f"purchased-{p_id}-{order_no}-{idx}"
                # 右辺の結果（item.get('category', 'TOPS')）を変数 category に代入して以降の処理で使います
                category = item.get('category', 'TOPS')
                # 右辺の結果（item.get('color', 'BLACK')）を変数 color に代入して以降の処理で使います
                color = item.get('color', 'BLACK')
                # 右辺の結果（int(item.get('price', item.get('unit_price', ）を変数 price に代入して以降の処理で使います
                price = int(item.get('price', item.get('unit_price', 0)))
                # 右辺の結果（item.get('image', item.get('image_url', ''))）を変数 image_url に代入して以降の処理で使います
                image_url = item.get('image', item.get('image_url', ''))
                # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
                cursor.execute(insert_closet_sql, (
                    # 配列要素または直前の SQL プレースホルダへ渡す値（user_id）です
                    user_id,
                    # 配列要素または直前の SQL プレースホルダへ渡す値（item_uid）です
                    item_uid,
                    # 配列要素または直前の SQL プレースホルダへ渡す値（p_id）です
                    p_id,
                    # 配列要素または直前の SQL プレースホルダへ渡す値（item.get('name', item.get('product_name', '購入）です
                    item.get('name', item.get('product_name', '購入商品')),
                    # 配列要素または直前の SQL プレースホルダへ渡す値（category）です
                    category,
                    # 配列要素または直前の SQL プレースホルダへ渡す値（color）です
                    color,
                    # 配列要素または直前の SQL プレースホルダへ渡す値（item.get('season', '通年')）です
                    item.get('season', '通年'),
                    # 配列要素または直前の SQL プレースホルダへ渡す値（image_url）です
                    image_url,
                    # 配列要素または直前の SQL プレースホルダへ渡す値（price）です
                    price,
                    # SQL プレースホルダ(%s)や関数引数へ順番どおりに渡すデータ値（today_str）です
                    today_str
                ))

            # 注文後の残高ポイント数（フロントへ返す最新値）の変数を初期化します
            updated_points = None
            # 条件式（if user_id and not is_sync）が成り立つかチェックして処理を分岐します
            if user_id and not is_sync:
                # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
                cursor.execute("SELECT `points` FROM `users` WHERE `id` = %s;", (user_id,))
                # SQL 検索結果の先頭 1 行を辞書として変数 u_row に受け取ります（0件時は None）
                u_row = cursor.fetchone()
                # 条件式（if u_row is not None）が成り立つかチェックして処理を分岐します
                if u_row is not None:
                    # 初期保有ポイント（ポイントは0から）を取り出します
                    curr_pts = int(u_row.get('points', 0) if u_row.get('points') is not None else 0)
                    # 注文後の残高ポイント数（フロントへ返す最新値）の変数を初期化します
                    updated_points = max(0, curr_pts - used_points) + earned_points
                    # 計算した最新の保有ポイント残高を users テーブルに上書き更新します
                    cursor.execute("UPDATE `users` SET `points` = %s WHERE `id` = %s;", (updated_points, user_id))
                # カート内容を入れ替え・または注文確定により空にするため対象ユーザーの cart_items を全削除します
                cursor.execute("DELETE FROM `cart_items` WHERE `user_id` = %s;", (user_id,))

        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()

        # フロントエンドへ返却する新規注文完了サマリー辞書を組み立てます
        created_order_data = {
            # データベースが自動採番した注文テーブルの内部連番 ID
            "order_id": order_id,
            # ORD-日付-英数字 形式の画面表示用注文番号
            "order_no": order_no,
            # 注文日時（YYYY/MM/DD HH:MM 形式文字列）
            "date": datetime.now().strftime('%Y/%m/%d %H:%M'),
            # レスポンス／設定辞書の 'customer_name' 項目をセットします
            "customer_name": customer_name,
            # レスポンス／設定辞書の 'customer_email' 項目をセットします
            "customer_email": customer_email,
            # レスポンス／設定辞書の 'address' 項目をセットします
            "address": address,
            # レスポンス／設定辞書の 'payment_method' 項目をセットします
            "payment_method": payment_method,
            # レスポンス／設定辞書の 'delivery_time' 項目をセットします
            "delivery_time": delivery_time,
            # 注文商品の小計金額（円）
            "subtotal": subtotal,
            # 配送送料（5,000円以上なら 0 円、未満なら 550 円）
            "shipping_fee": shipping_fee,
            # 適用されたクーポンコードおよび割引額
            "coupon_code": coupon_code if coupon_id else None,
            "coupon_discount": coupon_discount,
            # 今回の注文支払いに充当したポイント数（商品小計のみ対象・送料には影響なし）
            "used_points": used_points,
            # 今回の注文で新たに獲得したポイント数
            "earned_points": earned_points,
            # 送料加算・クーポン・ポイント割引後の最終請求金額（円・確実に送料は含まれる）
            "total_amount": total_amount,
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "注文受付・発送準備中",
            # 含まれる商品アイテムリスト配列
            "items": cart_items
        }

        # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
        return jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
            "message": "ご注文が正常に完了しました！",
            # 注文完了直後に画面や注文履歴へ反映する注文サマリーオブジェクト
            "order": created_order_data,
            # 清算反映後の最新保有ポイント残高
            "updated_points": updated_points
        # 直前で組み立てた JSON 辞書と HTTP ステータスコード 201 をセットでクライアントへ返却します
        }), 201

    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] 注文保存エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": f"注文処理に失敗しました: {str(e)}"}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/orders」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/orders', methods=['GET'])
# ログイン中の user_id に紐づく注文履歴と各注文明細を MySQL から取得して返す GET API 関数です
def get_orders():
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(request.args.get('user_id', None))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "orders": []}), 200

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 注文者ユーザーの名前を users テーブルから取得します
            cursor.execute("SELECT `name` FROM `users` WHERE `id` = %s;", (user_id,))
            u_row = cursor.fetchone()
            current_user_name = u_row['name'] if u_row and u_row.get('name') else '会員様'

            # orders テーブルから該当ユーザー・注文番号の注文レコードを検索します
            cursor.execute("SELECT * FROM `orders` WHERE `user_id` = %s ORDER BY `created_at` DESC;", (user_id,))
            # ユーザーIDに一致する注文レコード一覧を新しい順で取得します
            orders = cursor.fetchall()

            # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for o in orders）
            total_earned_pts = 0
            total_used_pts = 0
            for o in orders:
                # 注文者の名前を確実にセット（誰が購入したか保存・表示用）
                if not o.get('customer_name'):
                    o['customer_name'] = current_user_name
                # 過去注文で earned_points が 0 の場合はお支払い金額の 1% を補完して DB も更新します
                t_amt = int(o.get('total_amount') or o.get('subtotal') or 0)
                e_pts = int(o.get('earned_points') or 0)
                if e_pts <= 0 and t_amt > 0:
                    e_pts = max(1, int(t_amt * 0.01))
                    o['earned_points'] = e_pts
                    try:
                        cursor.execute("UPDATE `orders` SET `earned_points` = %s WHERE `id` = %s;", (e_pts, o['id']))
                    except Exception:
                        pass
                u_pts = max(0, int(o.get('used_points') or 0))
                total_earned_pts += e_pts
                total_used_pts += u_pts

                # 条件式（if isinstance(o['created_at'], datetime)）が成り立つかチェックして処理を分岐します
                if isinstance(o['created_at'], datetime):
                    # 辞書・配列要素 o['date'] に最新の値をセットします
                    o['date'] = o['created_at'].strftime('%Y/%m/%d %H:%M')
                # 上記の if / elif 条件に当てはまらなかった場合の分岐処理です
                else:
                    # 辞書・配列要素 o['date'] に最新の値をセットします
                    o['date'] = str(o['created_at'])

                # order_items テーブルから該当注文に含まれる商品明細行を取得します
                cursor.execute("SELECT * FROM `order_items` WHERE `order_id` = %s;", (o['id'],))
                # SQL 検索で見つかった全行データを辞書のリストとして変数 items に受け取ります
                items = cursor.fetchall()
                # 辞書・配列要素 o['items_detail'] に最新の値をセットします
                o['items_detail'] = items
                # 辞書・配列要素 o['items'] に最新の値をセットします
                o['items'] = [
                    # リストや返却データへ格納する新しい辞書（キーと値のペア）の記述を開始します
                    {
                        # レコード・商品・アイテムを識別する ID
                        "id": it['product_id'],
                        # 表示名称
                        "name": it['product_name'],
                        # カラーバリエーション名
                        "color": it['color'],
                        # 選択サイズ名（XS / S / M / L / XL 等）
                        "size": it['size'],
                        # 数量（個数）
                        "quantity": it['quantity'],
                        # 販売価格（円・整数）
                        "price": it['unit_price'],
                        # 商品・服画像の URL / パス文字列
                        "image": it['image_url']
                    }
                    # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for it in item）
                    for it in items
                ]
                # 右辺の結果（[f"{it['product_name']} ({it['color']} / {it[）を変数 item_summary_list に代入して以降の処理で使います
                item_summary_list = [f"{it['product_name']} ({it['color']} / {it['size']}) × {it['quantity']}" for it in items]
                # 辞書・配列要素 o['items_summary'] に最新の値をセットします
                o['items_summary'] = ", ".join(item_summary_list) if item_summary_list else "注文商品"

            # 購入で加算されたポイント合計（−利用ポイント）を users.points にも同期します
            net_user_points = max(0, total_earned_pts - total_used_pts)
            if orders:
                try:
                    cursor.execute("UPDATE `users` SET `points` = %s WHERE `id` = %s;", (net_user_points, user_id))
                    conn.commit()
                except Exception:
                    pass

        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "orders": orders, "user_points": net_user_points}), 200

    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] 注文履歴取得エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/orders」（HTTP メソッド: DELETE）へのリクエストを下の関数へ割り当てます
@app.route('/api/orders', methods=['DELETE'])
# 指定 user_id の注文明細と注文レコードを MySQL から全削除する DELETE API 関数です
def clear_orders():
    # クエリパラメータ（?user_id=...）やリクエスト本体から未検証のままID文字列を取り出します
    raw_uid = request.args.get('user_id', None)
    # 条件式（if not raw_uid）が成り立つかチェックして処理を分岐します
    if not raw_uid:
        # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
        req = request.get_json(silent=True) or {}
        # クエリパラメータ（?user_id=...）やリクエスト本体から未検証のままID文字列を取り出します
        raw_uid = req.get('user_id')
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(raw_uid)

    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 外部キー制約に違反しないよう先に子テーブル order_items の明細行を削除します
            cursor.execute("DELETE FROM `order_items` WHERE `order_id` IN (SELECT `id` FROM `orders` WHERE `user_id` = %s);", (user_id,))
            # 続いて親テーブル orders の該当ユーザー注文レコードを削除します
            cursor.execute("DELETE FROM `orders` WHERE `user_id` = %s;", (user_id,))
            # 注文履歴リセット時は保有ポイントも 0 にリセットします
            cursor.execute("UPDATE `users` SET `points` = 0 WHERE `id` = %s;", (user_id,))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[i] ユーザーID {user_id} の注文履歴をMySQLからリセットしました。")
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "message": "アカウントの注文履歴を初期化しました。"}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] 注文履歴リセットエラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# ==============================================================================
#  5. 会員認証 & HttpOnly Cookie セッション管理 API (/api/auth/*)
# ==============================================================================
# 推測不可能な 32 バイト乱数セッショントークンを発行し、MySQL user_sessions テーブルへ 7 日間期限で登録します
def create_user_session(conn, user_id):
    # Cookie から取り出したセッション識別トークン（未ログイン時は None）です
    token = secrets.token_urlsafe(32)
    # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
    with conn.cursor() as cursor:
        # 有効期限切れ、またはログアウト済みのセッションレコードを user_sessions テーブルから削除します
        cursor.execute("DELETE FROM `user_sessions` WHERE `expires_at` <= NOW();")
        # 新しく発行したランダムセッショントークンと 7 日後の有効期限を user_sessions テーブルへ登録します
        cursor.execute(
            # 上のカーソルで実行する INSERT 新規登録 SQL 文です（%s に下の値が埋め込まれます）
            "INSERT INTO `user_sessions` (`session_token`, `user_id`, `expires_at`) VALUES (%s, %s, DATE_ADD(NOW(), INTERVAL %s DAY));",
            # 配列要素または直前の SQL プレースホルダへ渡す値（(token, user_id, SESSION_TTL_DAYS)）です
            (token, user_id, SESSION_TTL_DAYS)
        )
    # 結果（token）を呼び出し元へ返却します
    return token

# ブラウザの JS から盗み読みできない安全な HttpOnly フラグ付き Cookie にトークンを書き込む関数です
def attach_session_cookie(response, token):
    # HttpOnly 等のセキュリティオプション付きで Set-Cookie ヘッダを設定開始します
    response.set_cookie(
        # Cookie 設定関数 response.set_cookie() へ渡す引数（SESSION_COOKIE_NAME）です
        SESSION_COOKIE_NAME,
        # Cookie 設定関数 response.set_cookie() へ渡す引数（token）です
        token,
        # Cookie の有効期限（秒数＝日数 × 24時間 × 60分 × 60秒）
        max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
        # JavaScript(document.cookie) からの読み取りを禁止して XSS 盗難を防ぐ最重要セキュリティ設定
        httponly=True,
        # 他サイト経由の不審リクエスト(CSRF)でもCookie送出を抑える 'Lax' 設定
        samesite='Lax',
        # サイト内の全パス('/')で同じセッション Cookie を有効にする指定
        path='/'
    )
    # 結果（response）を呼び出し元へ返却します
    return response

# ログアウトや期限切れ時にブラウザのセッション Cookie を削除指示する関数です
def clear_session_cookie(response):
    # ブラウザ側の manekin_session Cookie を即時期限切れにして削除させます
    response.delete_cookie(SESSION_COOKIE_NAME, path='/')
    # 結果（response）を呼び出し元へ返却します
    return response

# URL パス「/api/auth/register」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/auth/register', methods=['POST'])
# 新規会員登録（重複メールチェック、会員レコード作成、初回1000ポイント付与、セッションCookie発行）を行う API です
def register_user():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 右辺の結果（req.get('name', '').strip()）を変数 name に代入して以降の処理で使います
    name = req.get('name', '').strip()
    # 右辺の結果（req.get('email', '').strip()）を変数 email に代入して以降の処理で使います
    email = req.get('email', '').strip()
    # 右辺の結果（req.get('password', '').strip()）を変数 password に代入して以降の処理で使います
    password = req.get('password', '').strip()

    # 条件式（if not name or not email or not password）が成り立つかチェックして処理を分岐します
    if not name or not email or not password:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "すべての項目を入力してください。"}), 400

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 入力されたメールアドレスが既に users テーブルに登録済みか重複チェックします
            cursor.execute("SELECT `id` FROM `users` WHERE `email` = %s;", (email,))
            # 条件式（if cursor.fetchone()）が成り立つかチェックして処理を分岐します
            if cursor.fetchone():
                # メールアドレス重複などを示す HTTP 409 (Conflict) エラーを JSON で返します
                return jsonify({"status": "error", "message": "このメールアドレスは既に登録されています。"}), 409

            # 新しい会員レコード（ポイントは0から！）を MySQL users テーブルへ登録します
            cursor.execute(
                # 上のカーソルで実行する INSERT 新規登録 SQL 文です（%s に下の値が埋め込まれます）
                "INSERT INTO `users` (`name`, `email`, `password_hash`, `rank`, `points`, `created_at`) VALUES (%s, %s, %s, 'REGULAR MEMBER', 0, NOW());",
                # 直前の SQL クエリの %s に安全に埋め込むパラメータタプル (name, email, password) です
                (name, email, password)
            )
            # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
            user_id = cursor.lastrowid

            # 初期配布クーポン（初回限定 1割引クーポン）を付与（使用したら消滅）
            grant_welcome_coupon(cursor, user_id)
        # MySQL user_sessions テーブルに保存し Cookie へセットする乱数トークンを発行します
        session_token = create_user_session(conn, user_id)
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()

        # JSON レスポンスに Set-Cookie ヘッダを後から載せられる Response オブジェクトを作ります
        resp = make_response(jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
            "message": "会員登録が完了しました。【初回限定】1割引クーポンを進呈しました！",
            # フロントエンド AppState.currentUser に格納する会員情報オブジェクト
            "user": {
                # レコード・商品・アイテムを識別する ID
                "id": user_id,
                # 表示名称
                "name": name,
                # メールアドレス
                "email": email,
                # 会員ランク名称（REGULAR MEMBER / VIP MEMBER）
                "rank": "REGULAR MEMBER",
                # 現在保有している利用可能ポイント残高（0からスタート）
                "points": 0
            }
        # ここまで組み立てた辞書を JSON 化し、HTTP ステータス 201 番を添えて返却します
        }), 201)
        # 応答オブジェクトに安全な HttpOnly セッションCookieを付与してからクライアントへ返却します
        return attach_session_cookie(resp, session_token)

    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/auth/login」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/auth/login', methods=['POST'])
# メールアドレスとパスワードを MySQL で照合し、一致したら新しいセッションCookieを発行して会員情報を返します
def login_user():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 右辺の結果（req.get('email', '').strip()）を変数 email に代入して以降の処理で使います
    email = req.get('email', '').strip()
    # 右辺の結果（req.get('password', '').strip()）を変数 password に代入して以降の処理で使います
    password = req.get('password', '').strip()

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 入力されたメールアドレスとパスワードに一致する会員を users テーブルから検索します
            cursor.execute("SELECT `id`, `name`, `email`, `rank`, `points` FROM `users` WHERE `email` = %s AND `password_hash` = %s;", (email, password))
            # SQL で検索した会員 1 名分のユーザー情報辞書（または未存在時 None）を取得します
            user = cursor.fetchone()
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not user:
                # 認証失敗（ログイン情報不一致）を示すエラー応答（HTTP 401 Unauthorized）を返します
                return jsonify({"status": "error", "message": "メールアドレスまたはパスワードが正しくありません。"}), 401

            # 条件式（if user.get('points') is None）が成り立つかチェックして処理を分岐します
            if user.get('points') is None:
                # 初期ポイントは 0 からスタートします
                user['points'] = 0

            # クーポンを未所持（初回ログイン）の場合は初回限定1割引クーポンを自動配布します
            grant_welcome_coupon(cursor, user['id'])

        # MySQL user_sessions テーブルに保存し Cookie へセットする乱数トークンを発行します
        session_token = create_user_session(conn, user['id'])
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()

        # JSON レスポンスに Set-Cookie ヘッダを後から載せられる Response オブジェクトを作ります
        resp = make_response(jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
            "message": "ログインしました。",
            # フロントエンド AppState.currentUser に格納する会員情報オブジェクト
            "user": user
        # ここまで組み立てた辞書を JSON 化し、HTTP ステータス 200 番を添えて返却します
        }), 200)
        # 応答オブジェクトに安全な HttpOnly セッションCookieを付与してからクライアントへ返却します
        return attach_session_cookie(resp, session_token)

    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/auth/demo」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/auth/demo', methods=['POST'])
# デモ体験用アカウント(demo@manekin.com)を検索（無ければ自動作成）し、ワンクリックログインさせる API です
def demo_login_user():
    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # デモログイン用アカウント（demo@manekin.com）が既に users テーブルに登録済みか調べます
            cursor.execute(
                # 上のカーソルで実行する SELECT 検索 SQL 文です（%s に下のパラメータが安全に埋め込まれます）
                "SELECT `id`, `name`, `email`, `rank`, `points` FROM `users` WHERE `email` = %s;",
                # 配列要素または直前の SQL プレースホルダへ渡す値（('demo@manekin.com',)）です
                ('demo@manekin.com',)
            )
            # SQL で検索した会員 1 名分のユーザー情報辞書（または未存在時 None）を取得します
            user = cursor.fetchone()
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not user:
                # 新しい会員レコード（ポイントは0から！）を MySQL users テーブルへ登録します
                cursor.execute(
                    # 上のカーソルで実行する INSERT 新規登録 SQL 文です（%s に下の値が埋め込まれます）
                    "INSERT INTO `users` (`name`, `email`, `password_hash`, `rank`, `points`, `created_at`) VALUES (%s, %s, %s, %s, 0, NOW());",
                    # 直前の SQL クエリの %s に安全に埋め込むパラメータタプル ('テストユーザー（デモ）', 'demo@manekin.com', 'demo1234 です
                    ('テストユーザー（デモ）', 'demo@manekin.com', 'demo1234', 'VIP MEMBER')
                )
                # 受信データから取り出したユーザーIDを取得します
                demo_uid = cursor.lastrowid
                # 初期配布クーポン（初回限定 1割引クーポン）を付与（使用したら消滅）
                if grant_welcome_coupon(cursor, demo_uid):
                    conn.commit()
                # デモログイン用アカウント（demo@manekin.com）が既に users テーブルに登録済みか調べます
                cursor.execute(
                    # 上のカーソルで実行する SELECT 検索 SQL 文です（%s に下のパラメータが安全に埋め込まれます）
                    "SELECT `id`, `name`, `email`, `rank`, `points` FROM `users` WHERE `email` = %s;",
                    # 配列要素または直前の SQL プレースホルダへ渡す値（('demo@manekin.com',)）です
                    ('demo@manekin.com',)
                )
                # SQL で検索した会員 1 名分のユーザー情報辞書（または未存在時 None）を取得します
                user = cursor.fetchone()
            # 条件式（if user and user.get('points') is None）が成り立つかチェックして処理を分岐します
            if user and user.get('points') is None:
                # 初期ポイントは 0 からスタートします
                user['points'] = 0

            # 既存デモアカウントでクーポンを一度も付与されていない場合は初期クーポンを付与します
            if grant_welcome_coupon(cursor, user['id']):
                conn.commit()

        # MySQL user_sessions テーブルに保存し Cookie へセットする乱数トークンを発行します
        session_token = create_user_session(conn, user['id'])
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()

        # JSON レスポンスに Set-Cookie ヘッダを後から載せられる Response オブジェクトを作ります
        resp = make_response(jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
            "message": "テストアカウントでログインしました。",
            # フロントエンド AppState.currentUser に格納する会員情報オブジェクト
            "user": user
        # ここまで組み立てた辞書を JSON 化し、HTTP ステータス 200 番を添えて返却します
        }), 200)
        # 応答オブジェクトに安全な HttpOnly セッションCookieを付与してからクライアントへ返却します
        return attach_session_cookie(resp, session_token)
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/auth/me」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/auth/me', methods=['GET'])
# リクエストCookieのトークンを MySQL user_sessions と突合し、リロード後も現在ログイン中の会員を返します
def get_current_auth_user():
    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # Cookie から取り出したセッション識別トークン（未ログイン時は None）です
    token = request.cookies.get(SESSION_COOKIE_NAME)
    # 条件式（if not token）が成り立つかチェックして処理を分岐します
    if not token:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "authenticated": False, "user": None}), 200

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # user_sessions と users を結合(JOIN)し、有効期限切れ前のセッションに紐づく会員を取得します
            cursor.execute(
                """
                SELECT u.`id`, u.`name`, u.`email`, u.`rank`, u.`points`
                FROM `user_sessions` s
                INNER JOIN `users` u ON u.`id` = s.`user_id`
                WHERE s.`session_token` = %s AND s.`expires_at` > NOW()
                LIMIT 1;
                """,
                # 配列要素または直前の SQL プレースホルダへ渡す値（(token,)）です
                (token,)
            )
            # SQL で検索した会員 1 名分のユーザー情報辞書（または未存在時 None）を取得します
            user = cursor.fetchone()
            # 条件式（if user）が成り立つかチェックして処理を分岐します
            if user:
                # 条件式（if user.get('points') is None）が成り立つかチェックして処理を分岐します
                if user.get('points') is None:
                    # 初期保有ポイントは 0 からです
                    user['points'] = 0
                # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
                return jsonify({"status": "success", "authenticated": True, "user": user}), 200

            # 有効期限切れ、またはログアウト済みのセッションレコードを user_sessions テーブルから削除します
            cursor.execute("DELETE FROM `user_sessions` WHERE `session_token` = %s;", (token,))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # JSON レスポンスに Set-Cookie ヘッダを後から載せられる Response オブジェクトを作ります
        resp = make_response(jsonify({"status": "success", "authenticated": False, "user": None}), 200)
        # ブラウザ側の古いセッションCookieを消去する指示を付けてレスポンスを返します
        return clear_session_cookie(resp)
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] セッション復元エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/auth/logout」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/auth/logout', methods=['POST'])
# 現在のセッショントークンを MySQL から削除し、ブラウザのセッションCookieも無効化するログアウト API です
def logout_user():
    # Cookie から取り出したセッション識別トークン（未ログイン時は None）です
    token = request.cookies.get(SESSION_COOKIE_NAME)
    # 条件式（if token）が成り立つかチェックして処理を分岐します
    if token:
        # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
        conn = get_db_connection()
        # 条件式（if conn）が成り立つかチェックして処理を分岐します
        if conn:
            # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
            try:
                # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
                with conn.cursor() as cursor:
                    # 有効期限切れ、またはログアウト済みのセッションレコードを user_sessions テーブルから削除します
                    cursor.execute("DELETE FROM `user_sessions` WHERE `session_token` = %s;", (token,))
                # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
                conn.commit()
            # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
            except Exception as e:
                # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
                conn.rollback()
                # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
                print(f"[!] ログアウトセッション削除エラー: {e}")
            # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
            finally:
                # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
                conn.close()

    # JSON レスポンスに Set-Cookie ヘッダを後から載せられる Response オブジェクトを作ります
    resp = make_response(jsonify({"status": "success", "message": "ログアウトしました。"}), 200)
    # ブラウザ側の古いセッションCookieを消去する指示を付けてレスポンスを返します
    return clear_session_cookie(resp)

# URL パス「/api/coupons」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/coupons', methods=['GET'])
# ログイン中のユーザーの保有クーポン一覧（未使用・使用済み）を取得して返す API です
def get_user_coupons():
    user_id = parse_user_id(request.args.get('user_id', None))
    if not user_id:
        return jsonify({"status": "success", "coupons": []}), 200

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            # 既存会員でクーポンをまだ1つも受け取っていない場合は初期配布クーポンを付与します
            if grant_welcome_coupon(cursor, user_id):
                conn.commit()

            # ユーザーの所持クーポン一覧を取得します（未使用を優先表示）
            cursor.execute("SELECT * FROM `user_coupons` WHERE `user_id` = %s ORDER BY `is_used` ASC, `created_at` DESC;", (user_id,))
            coupons = cursor.fetchall()
            for c in coupons:
                if isinstance(c.get('created_at'), datetime):
                    c['created_at'] = c['created_at'].strftime('%Y/%m/%d %H:%M')
                if isinstance(c.get('used_at'), datetime):
                    c['used_at'] = c['used_at'].strftime('%Y/%m/%d %H:%M')
                if c.get('discount_rate') is not None:
                    c['discount_rate'] = float(c['discount_rate'])

        return jsonify({"status": "success", "coupons": coupons}), 200
    except Exception as e:
        print(f"[!] クーポン取得エラー: {e}")
        ensure_account_tables()
        return jsonify({"status": "success", "coupons": []}), 200
    finally:
        conn.close()

# URL パス「/api/user/sync」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/user/sync', methods=['POST'])
# ユーザーの保有ポイント変更などを MySQL users テーブルへ反映する POST API 関数です
def sync_user_data():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id'))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # 右辺の結果（req.get('points')）を変数 points に代入して以降の処理で使います
    points = req.get('points')

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 条件式（if points is not None）が成り立つかチェックして処理を分岐します
            if points is not None:
                # 計算した最新の保有ポイント残高を users テーブルに上書き更新します
                cursor.execute("UPDATE `users` SET `points` = %s WHERE `id` = %s;", (int(points), user_id))
                # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
                conn.commit()

        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "message": "会員ポイントをMySQLに保存しました。"}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# ==============================================================================
#  6. アカウント別お気に入り管理 API (/api/favorites/*)
# ==============================================================================
# URL パス「/api/favorites」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/favorites', methods=['GET'])
# 指定 user_id がお気に入り登録している商品ID一覧を MySQL favorites から取得します
def get_favorites():
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(request.args.get('user_id', None))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "favorites": []}), 200

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # favorites テーブルからお気に入り登録済みのレコード・商品IDを取得します
            cursor.execute("SELECT `product_id` FROM `favorites` WHERE `user_id` = %s;", (user_id,))
            # SQL 検索で見つかった全行データを辞書のリストとして変数 rows に受け取ります
            rows = cursor.fetchall()
            # 右辺の結果（list(set(r['product_id'] for r in rows))）を変数 fav_ids に代入して以降の処理で使います
            fav_ids = list(set(r['product_id'] for r in rows))
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "favorites": fav_ids}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/favorites/toggle」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/favorites/toggle', methods=['POST'])
# お気に入り登録が「あれば削除 / 無ければ追加」をトグル切り替えして保存する POST API 関数です
def toggle_favorite():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 右辺の結果（req.get('product_id')）を変数 product_id に代入して以降の処理で使います
    product_id = req.get('product_id')
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id'))

    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not product_id or not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "商品IDと有効なユーザーIDが必要です。"}), 400

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # favorites テーブルからお気に入り登録済みのレコード・商品IDを取得します
            cursor.execute("SELECT `id` FROM `favorites` WHERE `product_id` = %s AND `user_id` = %s;", (product_id, user_id))
            # SQL 検索結果の先頭 1 行を辞書として変数 existing に受け取ります（0件時は None）
            existing = cursor.fetchone()
            # すでに同じデータのレコードがデータベースに存在しているか分岐チェックします
            if existing:
                # 既に登録済みだったので、そのお気に入りレコードを favorites テーブルから削除（解除）します
                cursor.execute("DELETE FROM `favorites` WHERE `id` = %s;", (existing['id'],))
                # 右辺の結果（"removed"）を変数 action に代入して以降の処理で使います
                action = "removed"
            # 上記の if / elif 条件に当てはまらなかった場合の分岐処理です
            else:
                # 指定の商品IDをユーザーのお気に入りとして favorites テーブルへ新規追加します
                cursor.execute("INSERT INTO `favorites` (`user_id`, `product_id`, `created_at`) VALUES (%s, %s, NOW());", (user_id, product_id))
                # 右辺の結果（"added"）を変数 action に代入して以降の処理で使います
                action = "added"
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "action": action, "product_id": product_id}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/favorites/sync」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/favorites/sync', methods=['POST'])
# 複数のお気に入り商品IDを重複無視(INSERT IGNORE)でまとめて MySQL favorites へ登録します
def sync_favorites():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id'))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400
    # 右辺の結果（req.get('product_ids', [])）を変数 product_ids に代入して以降の処理で使います
    product_ids = req.get('product_ids', [])

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 不正なユーザーIDや退会済み会員への操作を防ぐため、users テーブルに会員が実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not cursor.fetchone():
                # 指定した会員や商品が見つからない旨を HTTP 404 (Not Found) で返します
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404
            # 右辺の結果（0）を変数 added に代入して以降の処理で使います
            added = 0
            # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for pid in product_ids）
            for pid in product_ids:
                # 指定の商品IDをユーザーのお気に入りとして favorites テーブルへ新規追加します
                cursor.execute("INSERT IGNORE INTO `favorites` (`user_id`, `product_id`, `created_at`) VALUES (%s, %s, NOW());", (user_id, int(pid)))
                # 変数 added に右辺の値（cursor.rowcount）を累計加算します
                added += cursor.rowcount
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "message": f"{added} 件のお気に入りをMySQLに同期しました。"}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# ==============================================================================
#  7. 保存済みコーディネート（ルックブック）API (/api/outfits/*)
# ==============================================================================
# URL パス「/api/outfits/<int:user_id>」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/outfits/<int:user_id>', methods=['GET'])
# 指定 user_id が保存したコーディネート（saved_outfits）を新しい順で全件取得します
def get_user_outfits(user_id):
    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # saved_outfits テーブルから対象ユーザーの保存済みコーデを新しい順で全取得します
            cursor.execute("SELECT * FROM `saved_outfits` WHERE `user_id` = %s ORDER BY `id` DESC;", (user_id,))
            # SQL 検索で見つかった全行データを辞書のリストとして変数 rows に受け取ります
            rows = cursor.fetchall()
            # 右辺の結果（[]）を変数 outfits に代入して以降の処理で使います
            outfits = []
            # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for r in rows）
            for r in rows:
                # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
                try:
                    # MySQL に保存されていた JSON 文字列を Python の辞書/配列オブジェクトへ復元し items_parsed に入れます
                    items_parsed = json.loads(r['items_json'])
                # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
                except Exception:
                    # 右辺の結果（{}）を変数 items_parsed に代入して以降の処理で使います
                    items_parsed = {}
                # 整形・抽出した 1 件分のデータを結果リスト outfits の末尾に追加します
                outfits.append({
                    # レコード・商品・アイテムを識別する ID
                    "id": r['outfit_uid'],
                    # レスポンス／設定辞書の 'title' 項目をセットします
                    "title": r['title'],
                    # 注文日時（YYYY/MM/DD HH:MM 形式文字列）
                    "date": r['date'],
                    # レスポンス／設定辞書の 'comment' 項目をセットします
                    "comment": r['comment'] or "",
                    # 含まれる商品アイテムリスト配列
                    "items": items_parsed
                })
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "outfits": outfits}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/outfits/save」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/outfits/save', methods=['POST'])
# 作成したコーディネートを MySQL saved_outfits へ保存（同IDがあれば上書き更新）します
def save_user_outfit():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id'))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400
    # 右辺の結果（req.get('id') or f"outfit-{int(datetime.now()）を変数 outfit_uid に代入して以降の処理で使います
    outfit_uid = req.get('id') or f"outfit-{int(datetime.now().timestamp()*1000)}"
    # 右辺の結果（req.get('title', 'マイスタイリングコーデ')）を変数 title に代入して以降の処理で使います
    title = req.get('title', 'マイスタイリングコーデ')
    # 右辺の結果（req.get('date', datetime.now().strftime('%Y/%）を変数 date_str に代入して以降の処理で使います
    date_str = req.get('date', datetime.now().strftime('%Y/%m/%d'))
    # 右辺の結果（req.get('comment', '')）を変数 comment に代入して以降の処理で使います
    comment = req.get('comment', '')
    # 右辺の結果（req.get('items', {})）を変数 items に代入して以降の処理で使います
    items = req.get('items', {})

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 不正なユーザーIDや退会済み会員への操作を防ぐため、users テーブルに会員が実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not cursor.fetchone():
                # 指定した会員や商品が見つからない旨を HTTP 404 (Not Found) で返します
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404
            # saved_outfits テーブルへコーデ名・日付・AIコメント・着用アイテムJSONを登録・更新します
            insert_sql = """
            INSERT INTO `saved_outfits` (`user_id`, `outfit_uid`, `title`, `date`, `comment`, `items_json`, `created_at`)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                `title` = VALUES(`title`),
                `date` = VALUES(`date`),
                `comment` = VALUES(`comment`),
                `items_json` = VALUES(`items_json`);
            """
            # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
            cursor.execute(insert_sql, (user_id, outfit_uid, title, date_str, comment, json.dumps(items)))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # 新規作成完了を示す HTTP ステータス 201 (Created) と共に JSON データを返却します
        return jsonify({"status": "success", "message": f"「{title}」をMySQLに保存しました。"}), 201
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/outfits/delete/<outfit_uid>」（HTTP メソッド: DELETE）へのリクエストを下の関数へ割り当てます
@app.route('/api/outfits/delete/<outfit_uid>', methods=['DELETE'])
# 指定されたコーディネート（outfit_uid）を本人のレコードに限定して削除します
def delete_user_outfit(outfit_uid):
    # クエリパラメータ（?user_id=...）やリクエスト本体から未検証のままID文字列を取り出します
    raw_uid = request.args.get('user_id', None)
    # 条件式（if not raw_uid）が成り立つかチェックして処理を分岐します
    if not raw_uid:
        # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
        req = request.get_json(silent=True) or {}
        # クエリパラメータ（?user_id=...）やリクエスト本体から未検証のままID文字列を取り出します
        raw_uid = req.get('user_id')
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(raw_uid)
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 指定したコーディネートIDかつ本人のレコードだけを saved_outfits テーブルから削除します
            cursor.execute("DELETE FROM `saved_outfits` WHERE `outfit_uid` = %s AND `user_id` = %s;", (outfit_uid, user_id))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "message": "コーディネートを削除しました。"}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# ==============================================================================
#  8. マネキン体型・仮想試着・マイクローゼット API (/api/manekin/*, /api/closet/*)
# ==============================================================================
# アバター体型プロフィール API が返す既定体型パラメータ辞書です
DEFAULT_AVATAR_PROFILE = {
    # レスポンス／設定辞書の 'height_cm' 項目をセットします
    "height_cm": 172.0,
    # レスポンス／設定辞書の 'weight_kg' 項目をセットします
    "weight_kg": 60.0,
    # レスポンス／設定辞書の 'shoulder_width_cm' 項目をセットします
    "shoulder_width_cm": 44,
    # レスポンス／設定辞書の 'chest_cm' 項目をセットします
    "chest_cm": 88,
    # レスポンス／設定辞書の 'waist_cm' 項目をセットします
    "waist_cm": 74,
    # レスポンス／設定辞書の 'hip_cm' 項目をセットします
    "hip_cm": 90,
    # レスポンス／設定辞書の 'skin_tone' 項目をセットします
    "skin_tone": "neutral",
    # レスポンス／設定辞書の 'model_url' 項目をセットします
    "model_url": "/assets/models/default_manekin.glb"
}

# URL パス「/api/manekin/avatar/<user_id>」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/manekin/avatar/<user_id>', methods=['GET'])
# マネキン用デフォルト体型データ辞書を返す互換GET API関数です
def get_manekin_avatar(user_id):
    # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
    return jsonify({
        # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
        "status": "success",
        # 処理対象となっている会員の一意な数値 ID
        "user_id": user_id,
        # レスポンス／設定辞書の 'avatar' 項目をセットします
        "avatar": DEFAULT_AVATAR_PROFILE,
        # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
        "message": "MANEKINアバターデータを正常に取得しました。"
    # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
    }), 200

# URL パス「/api/manekin/try-on」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/manekin/try-on', methods=['POST'])
# バーチャル試着シミュレーション API の互換レスポンスを返します
def manekin_virtual_try_on():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 右辺の結果（req.get("item_id")）を変数 item_id に代入して以降の処理で使います
    item_id = req.get("item_id")
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = req.get("user_id")

    # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
    return jsonify({
        # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
        "status": "success",
        # 処理対象となっている会員の一意な数値 ID
        "user_id": user_id,
        # レスポンス／設定辞書の 'item_id' 項目をセットします
        "item_id": item_id,
        # レスポンス／設定辞書の 'rendering_result' 項目をセットします
        "rendering_result": {
            # レスポンス／設定辞書の 'view_angle' 項目をセットします
            "view_angle": "front",
            # レスポンス／設定辞書の 'preview_image_url' 項目をセットします
            "preview_image_url": "assets/images/item_jacket.jpg",
            # レスポンス／設定辞書の 'fit_analysis' 項目をセットします
            "fit_analysis": {
                # レスポンス／設定辞書の 'fit_status' 項目をセットします
                "fit_status": "OPTIMAL_FIT",
                # レスポンス／設定辞書の 'description' 項目をセットします
                "description": "ジャストサイズからややゆとりのあるリラックスフィットです。"
            }
        },
        # レスポンス／設定辞書の 'timestamp' 項目をセットします
        "timestamp": datetime.now().isoformat()
    # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
    }), 200

# URL パス「/api/closet/<user_id>」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/closet/<user_id>', methods=['GET'])
# 指定 user_id のマイクローゼット服（登録服＋購入済み服）を MySQL closet_items から取得します
def get_user_closet(user_id):
    # URL等で受け取ったユーザーIDが1以上の正しい整数か検証して変換します
    uid = parse_user_id(user_id)
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not uid:
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "user_id": user_id, "closet_items": [], "total_items": 0}), 200

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # closet_items テーブルから対象ユーザーの登録服・購入済み服を新しい順で取得します
            cursor.execute(
                # 上のカーソルで実行する SELECT 検索 SQL 文です（%s に下のパラメータが安全に埋め込まれます）
                "SELECT `id`, `user_id`, `item_uid`, `product_id`, `name`, `category`, `color`, `season`, `image_url` as `image`, `is_owned`, `is_purchased`, `price`, `purchase_date`, `created_at` FROM `closet_items` WHERE `user_id` = %s ORDER BY `id` DESC;",
                # 配列要素または直前の SQL プレースホルダへ渡す値（(uid,)）です
                (uid,)
            )
            # SQL 検索で見つかった全行データを辞書のリストとして変数 items に受け取ります
            items = cursor.fetchall()
            # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
            return jsonify({
                # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
                "status": "success",
                # 処理対象となっている会員の一意な数値 ID
                "user_id": uid,
                # レスポンス／設定辞書の 'closet_items' 項目をセットします
                "closet_items": items,
                # レスポンス／設定辞書の 'total_items' 項目をセットします
                "total_items": len(items)
            # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
            }), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] クローゼット取得エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/closet/add」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/closet/add', methods=['POST'])
# ユーザーが登録した手持ち服データ（画像DataURL等含む）を MySQL closet_items へ保存・更新します
def add_to_closet():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id'))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400
    # 右辺の結果（req.get('name', '').strip()）を変数 name に代入して以降の処理で使います
    name = req.get('name', '').strip()
    # 右辺の結果（req.get('category', 'BOTTOMS')）を変数 category に代入して以降の処理で使います
    category = req.get('category', 'BOTTOMS')
    # 右辺の結果（req.get('color', 'BLACK')）を変数 color に代入して以降の処理で使います
    color = req.get('color', 'BLACK')
    # 右辺の結果（req.get('season', '通年')）を変数 season に代入して以降の処理で使います
    season = req.get('season', '通年')
    # 右辺の結果（req.get('image', '')）を変数 image_url に代入して以降の処理で使います
    image_url = req.get('image', '')
    # 右辺の結果（req.get('id') or f"c-{int(datetime.now().time）を変数 item_uid に代入して以降の処理で使います
    item_uid = req.get('id') or f"c-{int(datetime.now().timestamp()*1000)}"
    # 右辺の結果（req.get('productId', None)）を変数 product_id に代入して以降の処理で使います
    product_id = req.get('productId', None)
    # 右辺の結果（1 if req.get('isOwned', True) else 0）を変数 is_owned に代入して以降の処理で使います
    is_owned = 1 if req.get('isOwned', True) else 0
    # 右辺の結果（1 if req.get('isPurchased', False) else 0）を変数 is_purchased に代入して以降の処理で使います
    is_purchased = 1 if req.get('isPurchased', False) else 0
    # 右辺の結果（int(req.get('price', 0))）を変数 price に代入して以降の処理で使います
    price = int(req.get('price', 0))
    # 右辺の結果（req.get('purchaseDate', '')）を変数 purchase_date に代入して以降の処理で使います
    purchase_date = req.get('purchaseDate', '')

    # 条件式（if not name）が成り立つかチェックして処理を分岐します
    if not name:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "服の名前は必須です。"}), 400

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 不正なユーザーIDや退会済み会員への操作を防ぐため、users テーブルに会員が実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not cursor.fetchone():
                # 指定した会員や商品が見つからない旨を HTTP 404 (Not Found) で返します
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404
            # closet_items テーブルへ購入商品や手持ち服を登録します（同一キー重複時は項目を上書き更新）
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
            # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
            cursor.execute(insert_sql, (
                # 配列要素または直前の SQL プレースホルダへ渡す値（user_id, item_uid, product_id, name, category）です
                user_id, item_uid, product_id, name, category, color,
                # SQL プレースホルダ(%s)や関数引数へ順番どおりに渡すデータ値（season, image_url, is_owned, is_purchased, p）です
                season, image_url, is_owned, is_purchased, price, purchase_date
            ))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()

        # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
        return jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
            "message": f"「{name}」をMySQLクローゼットに保存しました。",
            # レスポンス／設定辞書の 'item' 項目をセットします
            "item": {
                # レコード・商品・アイテムを識別する ID
                "id": item_uid,
                # 表示名称
                "name": name,
                # 部位・商品カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                "category": category,
                # カラーバリエーション名
                "color": color,
                # レスポンス／設定辞書の 'season' 項目をセットします
                "season": season,
                # 商品・服画像の URL / パス文字列
                "image": image_url,
                # レスポンス／設定辞書の 'isOwned' 項目をセットします
                "isOwned": bool(is_owned),
                # レスポンス／設定辞書の 'isPurchased' 項目をセットします
                "isPurchased": bool(is_purchased),
                # 販売価格（円・整数）
                "price": price,
                # レスポンス／設定辞書の 'purchaseDate' 項目をセットします
                "purchaseDate": purchase_date
            }
        # 直前で組み立てた JSON 辞書と HTTP ステータスコード 201 をセットでクライアントへ返却します
        }), 201
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] クローゼット保存エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/closet/delete/<item_uid>」（HTTP メソッド: DELETE）へのリクエストを下の関数へ割り当てます
@app.route('/api/closet/delete/<item_uid>', methods=['DELETE'])
# 指定 item_uid の手持ち服を本人の user_id 条件付きで削除します
def delete_closet_item(item_uid):
    # クエリパラメータ（?user_id=...）やリクエスト本体から未検証のままID文字列を取り出します
    raw_uid = request.args.get('user_id', None)
    # 条件式（if not raw_uid）が成り立つかチェックして処理を分岐します
    if not raw_uid:
        # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
        req = request.get_json(silent=True) or {}
        # クエリパラメータ（?user_id=...）やリクエスト本体から未検証のままID文字列を取り出します
        raw_uid = req.get('user_id')
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(raw_uid)
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 指定したアイテムIDかつ本人の服だけを closet_items テーブルから削除します
            cursor.execute("DELETE FROM `closet_items` WHERE `item_uid` = %s AND `user_id` = %s;", (item_uid, user_id))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "message": "クローゼットからアイテムを削除しました。"}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/ai-coordinate/recommend」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/ai-coordinate/recommend', methods=['POST'])
# 気温・天候・利用シーン条件からAIスタイリング提案メッセージを返す POST API 関数です
def recommend_coordinates():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 右辺の結果（req.get("weather", "SUNNY")）を変数 weather に代入して以降の処理で使います
    weather = req.get("weather", "SUNNY")
    # 右辺の結果（req.get("temperature", 22)）を変数 temp に代入して以降の処理で使います
    temp = req.get("temperature", 22)
    # 右辺の結果（req.get("occasion", "CASUAL_DATE")）を変数 occasion に代入して以降の処理で使います
    occasion = req.get("occasion", "CASUAL_DATE")

    # 右辺の結果（(）を変数 ai_advice に代入して以降の処理で使います
    ai_advice = (
        # AI スタイリング診断の返却サンプル（メッセージまたは初期おすすめアイテム辞書）を設定します
        f"気温{temp}℃・{weather}の日に最適なミニマルコーデです。"
        # AI スタイリング診断の返却サンプル（メッセージまたは初期おすすめアイテム辞書）を設定します
        f"{occasion}に合わせて、モノトーンで統一した清潔感のある装いをご提案します。"
    )

    # 右辺の結果（{）を変数 recommended_outfit に代入して以降の処理で使います
    recommended_outfit = {
        # レスポンス／設定辞書の 'title' 項目をセットします
        "title": "都会的洗練 モノトーンレイヤードスタイル",
        # レスポンス／設定辞書の 'styling_advice' 項目をセットします
        "styling_advice": ai_advice,
        # 含まれる商品アイテムリスト配列
        "items": [
            # 配列要素または直前の SQL プレースホルダへ渡す値（{"type": "BRAND_ITEM", "product_id": 2, "name）です
            {"type": "BRAND_ITEM", "product_id": 2, "name": "スマート テーラード ジャケット", "role": "羽織り"},
            # 配列要素または直前の SQL プレースホルダへ渡す値（{"type": "BRAND_ITEM", "product_id": 1, "name）です
            {"type": "BRAND_ITEM", "product_id": 1, "name": "プレミアム コットン リラックス Tシャツ", "role": "インナー"},
            # AI スタイリング診断の返却サンプル（メッセージまたは初期おすすめアイテム辞書）を設定します
            {"type": "CLOSET_ITEM", "item_name": "私物の黒スキニーパンツ", "role": "ボトムス"}
        ],
        # レスポンス／設定辞書の 'confidence_score' 項目をセットします
        "confidence_score": 0.94
    }

    # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
    return jsonify({
        # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
        "status": "success",
        # レスポンス／設定辞書の 'condition' 項目をセットします
        "condition": {"weather": weather, "temperature": temp, "occasion": occasion},
        # レスポンス／設定辞書の 'recommendation' 項目をセットします
        "recommendation": recommended_outfit
    # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
    }), 200

# ==============================================================================
#  9. アカウント別ショッピングカート同期 API (/api/cart/*)
# ==============================================================================
# URL パス「/api/cart/<int:user_id>」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/cart/<int:user_id>', methods=['GET'])
# 指定 user_id のショッピングカート内容（cart_items テーブル）を取得して返します
def get_user_cart(user_id):
    # URL等で受け取ったユーザーIDが1以上の正しい整数か検証して変換します
    uid = parse_user_id(user_id)
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not uid:
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "items": []}), 200

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 指定ユーザーの cart_items テーブルからカート内商品を登録順に取り出します
            cursor.execute(
                """
                SELECT `product_id`, `name`, `category`, `color`, `size`, `price`, `quantity`, `image_url`
                FROM `cart_items`
                WHERE `user_id` = %s
                ORDER BY `id` ASC;
                """,
                # 配列要素または直前の SQL プレースホルダへ渡す値（(uid,)）です
                (uid,)
            )
            # SQL 検索で見つかった全行データを辞書のリストとして変数 rows に受け取ります
            rows = cursor.fetchall()
            # 右辺の結果（[）を変数 items に代入して以降の処理で使います
            items = [
                # リストや返却データへ格納する新しい辞書（キーと値のペア）の記述を開始します
                {
                    # レコード・商品・アイテムを識別する ID
                    "id": int(r['product_id']),
                    # 表示名称
                    "name": r['name'],
                    # 部位・商品カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                    "category": r['category'] or 'TOPS',
                    # カラーバリエーション名
                    "color": r['color'] or 'STANDARD',
                    # 選択サイズ名（XS / S / M / L / XL 等）
                    "size": r['size'] or 'M',
                    # 販売価格（円・整数）
                    "price": int(r['price'] or 0),
                    # 数量（個数）
                    "quantity": int(r['quantity'] or 1),
                    # 商品・服画像の URL / パス文字列
                    "image": r['image_url'] or ''
                }
                # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for r in row）
                for r in rows
            ]
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "user_id": uid, "items": items}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] カート取得エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/cart/sync」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/cart/sync', methods=['POST'])
# クライアントから受け取ったカート一覧を重複統合して MySQL cart_items へ安全に同期保存します
def sync_user_cart():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id'))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # 右辺の結果（req.get('items', [])）を変数 raw_items に代入して以降の処理で使います
    raw_items = req.get('items', [])
    # 条件式（if not isinstance(raw_items, list)）が成り立つかチェックして処理を分岐します
    if not isinstance(raw_items, list):
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "itemsは配列である必要があります。"}), 400

    # 同一商品(product_id + color + size)の重複行を数量加算で 1 つにまとめる作業用辞書です
    merged_map = {}
    # 画面上の表示順序を維持するため、初出キーの順番を記録する配列を用意します
    ordered_keys = []
    # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for it in raw_items）
    for it in raw_items:
        # 条件式（if not isinstance(it, dict)）が成り立つかチェックして処理を分岐します
        if not isinstance(it, dict):
            # 不正または数量0の項目だったためこのループ回をスキップして次の要素へ進みます
            continue
        # 右辺の結果（it.get('id', it.get('product_id'))）を変数 pid に代入して以降の処理で使います
        pid = it.get('id', it.get('product_id'))
        # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
        try:
            # 右辺の結果（int(pid)）を変数 pid_int に代入して以降の処理で使います
            pid_int = int(pid)
        # 型変換エラー等（(TypeError, ValueError)）を捕捉した場合のフォールバック処理です
        except (TypeError, ValueError):
            # 不正または数量0の項目だったためこのループ回をスキップして次の要素へ進みます
            continue
        # 右辺の結果（int(it.get('quantity', 1) or 1)）を変数 qty に代入して以降の処理で使います
        qty = int(it.get('quantity', 1) or 1)
        # 条件式（if qty <= 0）が成り立つかチェックして処理を分岐します
        if qty <= 0:
            # 不正または数量0の項目だったためこのループ回をスキップして次の要素へ進みます
            continue
        # 右辺の結果（str(it.get('color') or 'STANDARD')[:50]）を変数 color に代入して以降の処理で使います
        color = str(it.get('color') or 'STANDARD')[:50]
        # 右辺の結果（str(it.get('size') or 'M')[:20]）を変数 size に代入して以降の処理で使います
        size = str(it.get('size') or 'M')[:20]
        # 右辺の結果（(pid_int, color, size)）を変数 key に代入して以降の処理で使います
        key = (pid_int, color, size)
        # 条件式（if key in merged_map）が成り立つかチェックして処理を分岐します
        if key in merged_map:
            # 既存の辞書・配列要素 merged_map[key]['quantity'] に qty を加算合計します
            merged_map[key]['quantity'] += qty
        # 上記の if / elif 条件に当てはまらなかった場合の分岐処理です
        else:
            # 整形・抽出した 1 件分のデータを結果リスト ordered_keys の末尾に追加します
            ordered_keys.append(key)
            # 辞書・マップ項目 merged_map[key] の値として新しい辞書オブジェクトを開始します
            merged_map[key] = {
                # レコード・商品・アイテムを識別する ID
                "id": pid_int,
                # 表示名称
                "name": str(it.get('name') or '商品')[:255],
                # 部位・商品カテゴリ（OUTER / TOPS / BOTTOMS / HAT / SHOES）
                "category": str(it.get('category') or 'TOPS')[:50],
                # カラーバリエーション名
                "color": color,
                # 選択サイズ名（XS / S / M / L / XL 等）
                "size": size,
                # 販売価格（円・整数）
                "price": int(it.get('price') or 0),
                # 数量（個数）
                "quantity": qty,
                # 商品・服画像の URL / パス文字列
                "image": str(it.get('image') or '')
            }

    # 重複統合と型チェックが終わった正規化済みカートアイテム一覧を作ります
    normalized_items = [merged_map[k] for k in ordered_keys]

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 不正なユーザーIDや退会済み会員への操作を防ぐため、users テーブルに会員が実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not cursor.fetchone():
                # 指定した会員や商品が見つからない旨を HTTP 404 (Not Found) で返します
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404

            # カート内容を入れ替え・または注文確定により空にするため対象ユーザーの cart_items を全削除します
            cursor.execute("DELETE FROM `cart_items` WHERE `user_id` = %s;", (user_id,))
            # 条件式（if normalized_items）が成り立つかチェックして処理を分岐します
            if normalized_items:
                # cart_items テーブルへ正規化したカート内の各商品を 1 行ずつ登録します
                insert_sql = """
                INSERT INTO `cart_items` (
                    `user_id`, `product_id`, `name`, `category`, `color`, `size`, `price`, `quantity`, `image_url`
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
                """
                # リスト・配列から要素を 1 件ずつ順番に取り出してループ処理します（for item in normalized_items）
                for item in normalized_items:
                    # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
                    cursor.execute(insert_sql, (
                        # 配列要素または直前の SQL プレースホルダへ渡す値（user_id, item['id'], item['name'], item['cate）です
                        user_id, item['id'], item['name'], item['category'],
                        # SQL プレースホルダ(%s)や関数引数へ順番どおりに渡すデータ値（item['color'], item['size'], item['price'], ）です
                        item['color'], item['size'], item['price'], item['quantity'], item['image']
                    ))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
        return jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # ユーザー画面またはログに表示する処理結果・エラー案内メッセージ
            "message": "カートをMySQLに同期しました。",
            # 処理対象となっている会員の一意な数値 ID
            "user_id": user_id,
            # 含まれる商品アイテムリスト配列
            "items": normalized_items
        # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
        }), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] カート保存エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/cart/<int:user_id>」（HTTP メソッド: DELETE）へのリクエストを下の関数へ割り当てます
@app.route('/api/cart/<int:user_id>', methods=['DELETE'])
# 指定 user_id のショッピングカートをすべて空にする DELETE API 関数です
def clear_user_cart(user_id):
    # URL等で受け取ったユーザーIDが1以上の正しい整数か検証して変換します
    uid = parse_user_id(user_id)
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not uid:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # カート内容を入れ替え・または注文確定により空にするため対象ユーザーの cart_items を全削除します
            cursor.execute("DELETE FROM `cart_items` WHERE `user_id` = %s;", (uid,))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "message": "カートをクリアしました。"}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# ==============================================================================
#  10. マネキン着用状態・位置調整・性別永続化 API (/api/studio-state/*)
# ==============================================================================
# 試着マネキンの初期状態（5部位すべて未着用の空辞書）です
DEFAULT_STUDIO_OUTFIT = {"hat": None, "outer": None, "tops": None, "bottoms": None, "shoes": None}
# 部位ごとの初期位置ズレ(X/Y)・拡大率・サイズ設定辞書です
DEFAULT_FITTING_OFFSETS = {
    # レスポンス／設定辞書の 'hat' 項目をセットします
    "hat": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100},
    # レスポンス／設定辞書の 'tops' 項目をセットします
    "tops": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100},
    # レスポンス／設定辞書の 'outer' 項目をセットします
    "outer": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100},
    # レスポンス／設定辞書の 'bottoms' 項目をセットします
    "bottoms": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100},
    # レスポンス／設定辞書の 'shoes' 項目をセットします
    "shoes": {"x": 0, "y": 0, "scale": 100, "brandSize": "M", "customScale": 100}
}

# URL パス「/api/studio-state/<int:user_id>」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/api/studio-state/<int:user_id>', methods=['GET'])
# マネキンの着用中5部位・位置拡大微調整・性別設定を MySQL user_studio_states から復元します
def get_user_studio_state(user_id):
    # URL等で受け取ったユーザーIDが1以上の正しい整数か検証して変換します
    uid = parse_user_id(user_id)
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not uid:
        # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
        return jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # MySQL 上にこのユーザー向けの保存データが既に存在するか（True/False）
            "exists": False,
            # マネキンの現在着用スロット・位置拡大オフセット・性別設定をまとめたオブジェクト
            "studio_state": {
                # マネキン5部位（hat/outer/tops/bottoms/shoes）に着用中のアイテム情報
                "current_outfit": DEFAULT_STUDIO_OUTFIT,
                # 部位ごとの X/Y 位置ズレ・拡大率・ブランドサイズ設定データ
                "fitting_offsets": DEFAULT_FITTING_OFFSETS,
                # 試着マネキンの現在モデル性別（'MEN' または 'WOMEN'）
                "studio_gender": "MEN"
            }
        # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
        }), 200

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # user_studio_states テーブルから対象ユーザーの試着状態（着用服・調整値・性別JSON）を取得します
            cursor.execute(
                # 上のカーソルで実行する SELECT 検索 SQL 文です（%s に下のパラメータが安全に埋め込まれます）
                "SELECT `current_outfit_json`, `fitting_offsets_json`, `studio_gender` FROM `user_studio_states` WHERE `user_id` = %s;",
                # 配列要素または直前の SQL プレースホルダへ渡す値（(uid,)）です
                (uid,)
            )
            # SQL 検索結果の先頭 1 行を辞書として変数 row に受け取ります（0件時は None）
            row = cursor.fetchone()
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not row:
                # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
                return jsonify({
                    # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
                    "status": "success",
                    # 処理対象となっている会員の一意な数値 ID
                    "user_id": uid,
                    # MySQL 上にこのユーザー向けの保存データが既に存在するか（True/False）
                    "exists": False,
                    # マネキンの現在着用スロット・位置拡大オフセット・性別設定をまとめたオブジェクト
                    "studio_state": {
                        # マネキン5部位（hat/outer/tops/bottoms/shoes）に着用中のアイテム情報
                        "current_outfit": DEFAULT_STUDIO_OUTFIT,
                        # 部位ごとの X/Y 位置ズレ・拡大率・ブランドサイズ設定データ
                        "fitting_offsets": DEFAULT_FITTING_OFFSETS,
                        # 試着マネキンの現在モデル性別（'MEN' または 'WOMEN'）
                        "studio_gender": "MEN"
                    }
                # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
                }), 200

            # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
            try:
                # MySQL に保存されていた JSON 文字列を Python の辞書/配列オブジェクトへ復元し outfit に入れます
                outfit = json.loads(row['current_outfit_json']) if row.get('current_outfit_json') else dict(DEFAULT_STUDIO_OUTFIT)
            # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
            except Exception:
                # 右辺の結果（dict(DEFAULT_STUDIO_OUTFIT)）を変数 outfit に代入して以降の処理で使います
                outfit = dict(DEFAULT_STUDIO_OUTFIT)
            # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
            try:
                # MySQL に保存されていた JSON 文字列を Python の辞書/配列オブジェクトへ復元し offsets に入れます
                offsets = json.loads(row['fitting_offsets_json']) if row.get('fitting_offsets_json') else dict(DEFAULT_FITTING_OFFSETS)
            # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
            except Exception:
                # 右辺の結果（dict(DEFAULT_FITTING_OFFSETS)）を変数 offsets に代入して以降の処理で使います
                offsets = dict(DEFAULT_FITTING_OFFSETS)

            # 右辺の結果（row.get('studio_gender') if row.get('studio_g）を変数 gender に代入して以降の処理で使います
            gender = row.get('studio_gender') if row.get('studio_gender') in ('MEN', 'WOMEN') else 'MEN'

        # JSON 形式のレスポンス（HTTP ステータスコード付き）をフロントエンドへ返却します
        return jsonify({
            # API 処理の結果ステータス（'success' / 'error' / 'ok' / 'warning'）
            "status": "success",
            # 処理対象となっている会員の一意な数値 ID
            "user_id": uid,
            # MySQL 上にこのユーザー向けの保存データが既に存在するか（True/False）
            "exists": True,
            # マネキンの現在着用スロット・位置拡大オフセット・性別設定をまとめたオブジェクト
            "studio_state": {
                # マネキン5部位（hat/outer/tops/bottoms/shoes）に着用中のアイテム情報
                "current_outfit": outfit,
                # 部位ごとの X/Y 位置ズレ・拡大率・ブランドサイズ設定データ
                "fitting_offsets": offsets,
                # 試着マネキンの現在モデル性別（'MEN' または 'WOMEN'）
                "studio_gender": gender
            }
        # 直前で組み立てた JSON 辞書と HTTP ステータスコード 200 をセットでクライアントへ返却します
        }), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] スタジオ状態取得エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# URL パス「/api/studio-state/save」（HTTP メソッド: POST）へのリクエストを下の関数へ割り当てます
@app.route('/api/studio-state/save', methods=['POST'])
# マネキンの試着中服・位置サイズ微調整・性別を JSON 化して MySQL user_studio_states へ保存します
def save_user_studio_state():
    # フロントエンドから送られた JSON リクエストボディを辞書で受け取ります（空なら空辞書 {}）
    req = request.get_json() or {}
    # 受信データから取り出したユーザーIDを「1以上の整数」に検証・変換します
    user_id = parse_user_id(req.get('user_id'))
    # 有効な数値ユーザーIDが指定されていない場合のチェックです
    if not user_id:
        # 入力パラメータ不足・不正を示すエラー応答（HTTP 400 Bad Request）を JSON で返します
        return jsonify({"status": "error", "message": "有効なuser_idが必要です。"}), 400

    # 右辺の結果（req.get('current_outfit', DEFAULT_STUDIO_OUTF）を変数 current_outfit に代入して以降の処理で使います
    current_outfit = req.get('current_outfit', DEFAULT_STUDIO_OUTFIT)
    # 右辺の結果（req.get('fitting_offsets', DEFAULT_FITTING_OF）を変数 fitting_offsets に代入して以降の処理で使います
    fitting_offsets = req.get('fitting_offsets', DEFAULT_FITTING_OFFSETS)
    # 右辺の結果（req.get('studio_gender', 'MEN')）を変数 studio_gender に代入して以降の処理で使います
    studio_gender = req.get('studio_gender', 'MEN')
    # 条件式（if studio_gender not in ('MEN', 'WOMEN')）が成り立つかチェックして処理を分岐します
    if studio_gender not in ('MEN', 'WOMEN'):
        # 右辺の結果（'MEN'）を変数 studio_gender に代入して以降の処理で使います
        studio_gender = 'MEN'

    # get_db_connection() を呼んで MySQL データベースへの新しい接続を開きます
    conn = get_db_connection()
    # MySQL へ接続できなかった（conn が None）場合に 500 エラーを返すためのチェックです
    if not conn:
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    # データベースエラーや想定外例外でサーバーが落ちないよう try ブロックで監視を開始します
    try:
        # MySQL に SQL 命令を送るためのカーソルを取得します（with ブロック終了時に自動解放されます）
        with conn.cursor() as cursor:
            # 不正なユーザーIDや退会済み会員への操作を防ぐため、users テーブルに会員が実在するか確認します
            cursor.execute("SELECT `id` FROM `users` WHERE `id` = %s;", (user_id,))
            # データベース上に該当レコードが見つからなかった場合のチェックです
            if not cursor.fetchone():
                # 指定した会員や商品が見つからない旨を HTTP 404 (Not Found) で返します
                return jsonify({"status": "error", "message": "該当会員が見つかりません。"}), 404

            # user_studio_states テーブルへ着用服・位置サイズ調整・性別設定を登録（既存時は上書き更新）します
            upsert_sql = """
            INSERT INTO `user_studio_states` (
                `user_id`, `current_outfit_json`, `fitting_offsets_json`, `studio_gender`
            ) VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                `current_outfit_json` = VALUES(`current_outfit_json`),
                `fitting_offsets_json` = VALUES(`fitting_offsets_json`),
                `studio_gender` = VALUES(`studio_gender`);
            """
            # カーソル経由で SQL クエリ（必要に応じて %s パラメータを安全に埋め込み）を MySQL へ実行します
            cursor.execute(upsert_sql, (
                # 配列要素または直前の SQL プレースホルダへ渡す値（user_id）です
                user_id,
                # 配列要素または直前の SQL プレースホルダへ渡す値（json.dumps(current_outfit, ensure_ascii=False）です
                json.dumps(current_outfit, ensure_ascii=False),
                # 配列要素または直前の SQL プレースホルダへ渡す値（json.dumps(fitting_offsets, ensure_ascii=Fals）です
                json.dumps(fitting_offsets, ensure_ascii=False),
                # SQL プレースホルダ(%s)や関数引数へ順番どおりに渡すデータ値（studio_gender）です
                studio_gender
            ))
        # ここまでの INSERT / UPDATE / DELETE 変更を MySQL へ正式に確定保存（コミット）します
        conn.commit()
        # 処理成功を示す HTTP ステータス 200 (OK) と共に JSON データをクライアントへ返却します
        return jsonify({"status": "success", "message": "スタジオ試着状態をMySQLに保存しました。"}), 200
    # try ブロック内で例外エラーが発生したときに安全にエラー応答へ切り替える受け皿です
    except Exception as e:
        # 途中でエラーが起きたため途中の変更をすべて取り消し（ロールバック）、データ不整合を防ぎます
        conn.rollback()
        # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
        print(f"[!] スタジオ状態保存エラー: {e}")
        # サーバー内部エラーまたは DB エラー（HTTP 500 Internal Server Error）を JSON で返します
        return jsonify({"status": "error", "message": str(e)}), 500
    # 成功しても途中で return・エラーが起きても最後に必ず実行される後始末ブロックです
    finally:
        # 使い終わった MySQL データベース接続を閉じ、サーバーの接続リソースを解放します
        conn.close()

# ==============================================================================
#  11. HTML / 静的ファイル配信ルート & Web サーバー起動メイン処理
# ==============================================================================
# URL パス「/」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/')
# トップアクセス('/')に対して SPA の本体 index.html ファイルを配信します
def serve_index():
    # 現在のフォルダから静的ファイル（send_from_directory('.', 'index.html')）を読み取ってブラウザへ配信します
    return send_from_directory('.', 'index.html')

# URL パス「/<path:path>」（HTTP メソッド: GET）へのリクエストを下の関数へ割り当てます
@app.route('/<path:path>')
# CSS / JS / 商品画像などの静的ファイルリクエストに対して実ファイルを配信します
def serve_static(path):
    # 現在のフォルダから静的ファイル（send_from_directory('.', path)）を読み取ってブラウザへ配信します
    return send_from_directory('.', path)

# テーブル確認後に起動案内をコンソール表示し、ポート 8080 で Flask Webサーバーを立ち上げるメイン関数です
def main():
    # サーバー待ち受け前に 3 つのアカウント専用テーブル（cart_items 等）が存在するか確認し、無ければ自動作成します
    ensure_account_tables()
    # 右辺の結果（int(os.environ.get('PORT', 8080))）を変数 port に代入して以降の処理で使います
    port = int(os.environ.get('PORT', 8080))
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("=" * 70)
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("【MANEKIN FASHION バックエンドAPIサーバー (Python + MySQL) 起動中】")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print(f"URL: http://localhost:{port}")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("接続先MySQL: manekin_db (localhost:3306)")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("API一覧:")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("  ・商品一覧 / 詳細      : GET  /api/products , GET /api/products/<id>")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("  ・注文作成 / 確定      : POST /api/orders (MySQLに書き込み)")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("  ・購入履歴一覧        : GET  /api/orders (MySQLから取得)")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("  ・カート管理          : GET/DELETE /api/cart/<user_id> , POST /api/cart/sync")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("  ・スタジオ状態管理    : GET /api/studio-state/<user_id> , POST /api/studio-state/save")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("  ・会員登録 / ログイン  : POST /api/auth/register , POST /api/auth/login , GET /api/auth/me , POST /api/auth/logout")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("  ・MANEKIN 3D / AI機能 : /api/manekin/* , /api/closet/* , /api/ai-coordinate/*")
    # サーバーを起動しているコンソール（黒い画面）へ実行ログや案内メッセージを出力します
    print("=" * 70)
    # 指定したホスト・ポートで開発用 Flask HTTP Web サーバーの待ち受けを開始します
    app.run(
        # Flask WebサーバーをローカルPC内限定（127.0.0.1）で待ち受けます
        host='127.0.0.1',
        # 待ち受けHTTPポート番号（既定 8080 番）を指定します
        port=port,
        # 開発中にエラー詳細やログを出力するデバッグモードを有効にします
        debug=True,
        # ファイル保存時の自動二重起動リロードを無効化し、ポート競合を防ぎます
        use_reloader=False
    )

# このファイルが他のコードから import されず、「python app.py」等で直接起動されたときだけ実行します
if __name__ == '__main__':
    # 上で定義したサーバー起動メイン関数 main() を実行します
    main()
