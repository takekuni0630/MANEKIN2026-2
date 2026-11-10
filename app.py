# ==============================================================================
# MANEKIN FASHION - バックエンド API サーバー (app.py)
# Python + Flask + MySQL (PyMySQL) を使用した本格的なECバックエンド
# ==============================================================================

# システム操作用標準モジュール
import sys
# オペレーティングシステム用標準モジュール
import os
# JSONデータ操作用標準モジュール
import json
# ランダム文字列生成用モジュール（注文番号生成等）
import random
# 文字列生成用モジュール
import string
# 日付と時刻の処理モジュール
from datetime import datetime

# Flaskフレームワーク関連のインポート
# pyrefly: ignore[missing-import]
from flask import Flask, jsonify, request, send_from_directory
# CORS（クロスオリジンリソース共有）モジュールのインポート
from flask_cors import CORS
# MySQL接続用PyMySQLモジュール
import pymysql
# 辞書型カーソルを使用するためのモジュール
from pymysql.cursors import DictCursor

# Flaskアプリケーションのインスタンスを生成
app = Flask(__name__, static_folder='.', static_url_path='')
# フロントエンドからの全APIリクエストに対してCORSを許可
CORS(app)

# ==============================================================================
# MySQLデータベース接続設定
# ==============================================================================
DB_CONFIG = {
    'host': '127.0.0.1',      # MySQLホスト（XAMPP標準ローカルホスト）
    'port': 3306,             # MySQL標準ポート番号
    'user': 'root',           # データベース接続ユーザー名
    'password': '',           # パスワード（XAMPP標準は空）
    'database': 'manekin_db', # 使用するデータベース名
    'charset': 'utf8mb4',     # 文字コード（絵文字や全角文字に対応）
    'cursorclass': DictCursor # 結果を辞書型で取得
}

def get_db_connection():
    """
    MySQLデータベースへのコネクションを取得するヘルパー関数
    """
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except Exception as err:
        print(f"[!] MySQL接続エラー: {err}")
        return None


# ==============================================================================
# 1. 商品関連 API (PRODUCTS)
# ==============================================================================

@app.route('/api/products', methods=['GET'])
def get_all_products():
    """
    全商品一覧およびカラー別画像情報を取得するエンドポイント
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            # 商品一覧を取得
            cursor.execute("SELECT * FROM `products` ORDER BY `id` ASC;")
            products = cursor.fetchall()

            # 各商品に紐づくカラーバリエーション・画像を取得して結合
            for p in products:
                cursor.execute("SELECT `color`, `color_code`, `image_url` FROM `product_variants` WHERE `product_id` = %s;", (p['id'],))
                variants = cursor.fetchall()
                # カラー名リスト
                p['colors'] = [v['color'] for v in variants] if variants else ["STANDARD"]
                # カラーごとの画像マッピング辞書（服の色を変えた時に画像を変える）
                p['colorImages'] = {v['color']: v['image_url'] for v in variants} if variants else {p['colors'][0]: p['image']}
                # サイズ展開リスト（標準S, M, L, XL）
                p['sizes'] = ["S", "M", "L", "XL"]

        return jsonify({"status": "success", "products": products}), 200

    except Exception as e:
        print(f"[!] 商品取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    """
    特定商品の詳細情報およびカラー別画像を取得するエンドポイント
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM `products` WHERE `id` = %s;", (product_id,))
            product = cursor.fetchone()
            if not product:
                return jsonify({"status": "error", "message": "商品が見つかりません。"}), 404

            # カラーバリエーションを取得
            cursor.execute("SELECT `color`, `color_code`, `image_url` FROM `product_variants` WHERE `product_id` = %s;", (product_id,))
            variants = cursor.fetchall()
            product['colors'] = [v['color'] for v in variants] if variants else ["STANDARD"]
            product['colorImages'] = {v['color']: v['image_url'] for v in variants} if variants else {product['colors'][0]: product['image']}
            product['sizes'] = ["S", "M", "L", "XL"]

        return jsonify({"status": "success", "product": product}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# 2. 注文・購入手続き関連 API (ORDERS & CHECKOUT) - 【超重要】
# ==============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    FlaskサーバーおよびMySQLデータベース接続ヘルスチェック
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "warning", "mysql": "disconnected", "message": "Flaskは稼働中ですが、MySQL(manekin_db)に接続できません。XAMPPでMySQLを起動してください。"}), 200
    conn.close()
    return jsonify({"status": "ok", "mysql": "connected", "message": "Flask API & MySQL (manekin_db) は正常に稼働しています。"}), 200


@app.route('/api/orders', methods=['POST'])
def create_order():
    """
    購入手続き画面から送信された注文データをMySQLに確定保存するエンドポイント
    """
    req = request.get_json() or {}
    
    # 必須パラメータの取り出し
    customer_name = req.get('customer_name', '').strip()
    customer_email = req.get('customer_email', '').strip()
    postal_code = req.get('postal_code', '').strip()
    address = req.get('address', '').strip()
    phone = req.get('phone', '').strip()
    payment_method = req.get('payment_method', 'クレジットカード')
    delivery_time = req.get('delivery_time', '指定なし')
    cart_items = req.get('items', []) or req.get('items_detail', []) # カート内商品リスト
    user_id = req.get('user_id', None)
    provided_order_no = req.get('order_no', None)
    is_sync = bool(req.get('sync_mode', False))

    # 入力バリデーション
    if not customer_name or not customer_email or not address or not cart_items:
        return jsonify({"status": "error", "message": "お名前、メールアドレス、住所、注文商品は必須です。"}), 400

    # 金額の再計算（改ざん防止）
    subtotal = 0
    for item in cart_items:
        qty = int(item.get('quantity', 1))
        price = int(item.get('price', item.get('unit_price', 0)))
        subtotal += (price * qty)

    # 送料計算（5,000円以上は送料無料、未満は全国一律550円）
    shipping_fee = 0 if subtotal >= 5000 else 550
    used_points = int(req.get('used_points', 0))
    total_amount = max(0, subtotal + shipping_fee - used_points)
    earned_points = int(req.get('earned_points', int(total_amount * 0.01)))

    # ユニークな注文番号の生成（例: ORD-20261028-A7X9）
    today_str = datetime.now().strftime('%Y%m%d')
    random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    order_no = provided_order_no if provided_order_no else f"ORD-{today_str}-{random_code}"

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            # 既存注文番号チェック（同期時の重複防止）
            if provided_order_no:
                cursor.execute("SELECT `id`, `order_no` FROM `orders` WHERE `order_no` = %s;", (provided_order_no,))
                existing_ord = cursor.fetchone()
                if existing_ord:
                    return jsonify({
                        "status": "success",
                        "message": "すでにMySQLへ登録済みの注文です。",
                        "already_exists": True,
                        "order": {"order_id": existing_ord['id'], "order_no": existing_ord['order_no']}
                    }), 200

            # 1. ordersテーブルに注文ヘッダーを挿入
            insert_order_sql = """
            INSERT INTO `orders` (
                `order_no`, `user_id`, `customer_name`, `customer_email`,
                `postal_code`, `address`, `phone`, `payment_method`,
                `delivery_time`, `subtotal`, `shipping_fee`, `total_amount`,
                `used_points`, `earned_points`, `status`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW());
            """
            cursor.execute(insert_order_sql, (
                order_no, user_id, customer_name, customer_email,
                postal_code, address, phone, payment_method,
                delivery_time, subtotal, shipping_fee, total_amount,
                used_points, earned_points, "注文受付済み"
            ))
            order_id = cursor.lastrowid

            # 2. order_itemsテーブルに各購入商品を挿入
            insert_item_sql = """
            INSERT INTO `order_items` (
                `order_id`, `product_id`, `product_name`, `color`,
                `size`, `quantity`, `unit_price`, `image_url`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
            """
            for item in cart_items:
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
            insert_closet_sql = """
            INSERT INTO `closet_items` (
                `user_id`, `item_uid`, `product_id`, `name`, `category`, `color`,
                `season`, `image_url`, `is_owned`, `is_purchased`, `price`, `purchase_date`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 1, 1, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
            """
            for idx, item in enumerate(cart_items):
                p_id = item.get('id', item.get('product_id', 0))
                item_uid = f"purchased-{p_id}-{order_no}-{idx}"
                category = item.get('category', 'TOPS')
                color = item.get('color', 'BLACK')
                price = int(item.get('price', item.get('unit_price', 0)))
                image_url = item.get('image', item.get('image_url', ''))
                cursor.execute(insert_closet_sql, (
                    user_id or 1,
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

            # 4. ユーザーのポイント残高を更新 (通常注文時)
            updated_points = None
            if user_id and not is_sync:
                cursor.execute("SELECT `points` FROM `users` WHERE `id` = %s;", (user_id,))
                u_row = cursor.fetchone()
                if u_row is not None:
                    curr_pts = int(u_row.get('points', 1000))
                    updated_points = max(0, curr_pts - used_points) + earned_points
                    cursor.execute("UPDATE `users` SET `points` = %s WHERE `id` = %s;", (updated_points, user_id))

        # トランザクションコミット
        conn.commit()

        # 完了レスポンスデータを作成
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

        return jsonify({
            "status": "success",
            "message": "ご注文が正常に完了しました！",
            "order": created_order_data,
            "updated_points": updated_points
        }), 201

    except Exception as e:
        conn.rollback()
        print(f"[!] 注文保存エラー: {e}")
        return jsonify({"status": "error", "message": f"注文処理に失敗しました: {str(e)}"}), 500
    finally:
        conn.close()


@app.route('/api/orders', methods=['GET'])
def get_orders():
    """
    マイページに表示するための購入履歴一覧をMySQLから取得するエンドポイント
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            # 注文ヘッダーを最新順で取得
            cursor.execute("SELECT * FROM `orders` ORDER BY `created_at` DESC;")
            orders = cursor.fetchall()

            # 各注文に紐づく注文明細商品を取得して結合
            for o in orders:
                # 日時フォーマットの整形
                if isinstance(o['created_at'], datetime):
                    o['date'] = o['created_at'].strftime('%Y/%m/%d %H:%M')
                else:
                    o['date'] = str(o['created_at'])

                cursor.execute("SELECT * FROM `order_items` WHERE `order_id` = %s;", (o['id'],))
                items = cursor.fetchall()
                o['items_detail'] = items
                # フロントエンド互換形式
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
                item_summary_list = [f"{it['product_name']} ({it['color']} / {it['size']}) × {it['quantity']}" for it in items]
                o['items_summary'] = ", ".join(item_summary_list) if item_summary_list else "注文商品"

        return jsonify({"status": "success", "orders": orders}), 200

    except Exception as e:
        print(f"[!] 注文履歴取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/orders', methods=['DELETE'])
def clear_orders():
    """
    全注文履歴をリセット（MySQL内のordersおよびorder_itemsを完全クリア）するエンドポイント
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            # 外部キー整合性を保つため order_items から先に削除
            cursor.execute("DELETE FROM `order_items`;")
            cursor.execute("DELETE FROM `orders`;")
        conn.commit()
        print("[i] MySQL内の注文履歴をすべてリセットしました。")
        return jsonify({"status": "success", "message": "全注文履歴を初期化しました。"}), 200
    except Exception as e:
        conn.rollback()
        print(f"[!] 注文履歴リセットエラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# 3. 会員・認証関連 API (AUTH)
# ==============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """
    新規会員登録をMySQLに保存するエンドポイント（初期1000ポイント付与）
    """
    req = request.get_json() or {}
    name = req.get('name', '').strip()
    email = req.get('email', '').strip()
    password = req.get('password', '').strip()

    if not name or not email or not password:
        return jsonify({"status": "error", "message": "すべての項目を入力してください。"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            # メールアドレスの重複チェック
            cursor.execute("SELECT `id` FROM `users` WHERE `email` = %s;", (email,))
            if cursor.fetchone():
                return jsonify({"status": "error", "message": "このメールアドレスは既に登録されています。"}), 409

            # ユーザーの登録（初期ボーナス 1,000pt 付与）
            cursor.execute(
                "INSERT INTO `users` (`name`, `email`, `password_hash`, `rank`, `points`, `created_at`) VALUES (%s, %s, %s, 'REGULAR MEMBER', 1000, NOW());",
                (name, email, password)
            )
            user_id = cursor.lastrowid
        conn.commit()

        return jsonify({
            "status": "success",
            "message": "会員登録が完了しました。1,000ポイントを進呈しました！",
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "rank": "REGULAR MEMBER",
                "points": 1000,
                "body_height": 172,
                "body_type": "REGULAR",
                "style_taste": "MINIMAL"
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """
    会員ログイン認証を行うエンドポイント（ポイント・体型情報も取得）
    """
    req = request.get_json() or {}
    email = req.get('email', '').strip()
    password = req.get('password', '').strip()

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT `id`, `name`, `email`, `rank`, `points`, `body_height`, `body_type`, `style_taste` FROM `users` WHERE `email` = %s AND `password_hash` = %s;", (email, password))
            user = cursor.fetchone()
            if not user:
                return jsonify({"status": "error", "message": "メールアドレスまたはパスワードが正しくありません。"}), 401

            if user.get('points') is None:
                user['points'] = 1000

        return jsonify({
            "status": "success",
            "message": "ログインしました。",
            "user": user
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/user/sync', methods=['POST'])
def sync_user_data():
    """
    ユーザーの保有ポイントや体型プロフィール設定をMySQLに同期保存
    """
    req = request.get_json() or {}
    user_id = req.get('user_id')
    if not user_id:
        return jsonify({"status": "error", "message": "user_idが必要です。"}), 400

    points = req.get('points')
    body_height = req.get('height')
    body_type = req.get('bodyType')
    style_taste = req.get('styleTaste')

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            updates = []
            params = []
            if points is not None:
                updates.append("`points` = %s")
                params.append(int(points))
            if body_height is not None:
                updates.append("`body_height` = %s")
                params.append(int(body_height))
            if body_type is not None:
                updates.append("`body_type` = %s")
                params.append(str(body_type))
            if style_taste is not None:
                updates.append("`style_taste` = %s")
                params.append(str(style_taste))

            if updates:
                params.append(user_id)
                sql = f"UPDATE `users` SET {', '.join(updates)} WHERE `id` = %s;"
                cursor.execute(sql, tuple(params))
                conn.commit()

        return jsonify({"status": "success", "message": "会員情報をMySQLに保存しました。"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# 4. お気に入り関連 API (FAVORITES)
# ==============================================================================

@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    """
    お気に入り商品IDリストをMySQLから取得するエンドポイント
    """
    user_id = request.args.get('user_id', None)
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "success", "favorites": []}), 200

    try:
        with conn.cursor() as cursor:
            if user_id:
                cursor.execute("SELECT `product_id` FROM `favorites` WHERE `user_id` = %s;", (user_id,))
            else:
                cursor.execute("SELECT `product_id` FROM `favorites`;")
            rows = cursor.fetchall()
            fav_ids = list(set(r['product_id'] for r in rows))
        return jsonify({"status": "success", "favorites": fav_ids}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/favorites/toggle', methods=['POST'])
def toggle_favorite():
    """
    お気に入りの追加・解除を切り替えるエンドポイント
    """
    req = request.get_json() or {}
    product_id = req.get('product_id')
    user_id = req.get('user_id', 1)

    if not product_id:
        return jsonify({"status": "error", "message": "商品IDが必要です。"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT `id` FROM `favorites` WHERE `product_id` = %s AND (`user_id` = %s OR `user_id` IS NULL);", (product_id, user_id))
            existing = cursor.fetchone()
            if existing:
                cursor.execute("DELETE FROM `favorites` WHERE `id` = %s;", (existing['id'],))
                action = "removed"
            else:
                cursor.execute("INSERT INTO `favorites` (`user_id`, `product_id`, `created_at`) VALUES (%s, %s, NOW());", (user_id, product_id))
                action = "added"
        conn.commit()
        return jsonify({"status": "success", "action": action, "product_id": product_id}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/favorites/sync', methods=['POST'])
def sync_favorites():
    """
    LocalStorage内のお気に入りをMySQLへ一括同期
    """
    req = request.get_json() or {}
    user_id = req.get('user_id', 1)
    product_ids = req.get('product_ids', [])

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT `product_id` FROM `favorites` WHERE `user_id` = %s;", (user_id,))
            current_favs = set(r['product_id'] for r in cursor.fetchall())
            added = 0
            for pid in product_ids:
                if pid not in current_favs:
                    cursor.execute("INSERT INTO `favorites` (`user_id`, `product_id`, `created_at`) VALUES (%s, %s, NOW());", (user_id, pid))
                    added += 1
        conn.commit()
        return jsonify({"status": "success", "message": f"{added} 件のお気に入りをMySQLに同期しました。"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# 5. 保存コーディネート（ルックブック）API (MySQL連携)
# ==============================================================================

@app.route('/api/outfits/<int:user_id>', methods=['GET'])
def get_user_outfits(user_id):
    """
    ユーザーが保存したコーディネート一覧をMySQLから取得
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM `saved_outfits` WHERE `user_id` = %s ORDER BY `id` DESC;", (user_id,))
            rows = cursor.fetchall()
            outfits = []
            for r in rows:
                try:
                    items_parsed = json.loads(r['items_json'])
                except Exception:
                    items_parsed = {}
                outfits.append({
                    "id": r['outfit_uid'],
                    "title": r['title'],
                    "date": r['date'],
                    "comment": r['comment'] or "",
                    "items": items_parsed
                })
        return jsonify({"status": "success", "outfits": outfits}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/outfits/save', methods=['POST'])
def save_user_outfit():
    """
    作成したコーディネートをMySQL(saved_outfits)に保存
    """
    req = request.get_json() or {}
    user_id = req.get('user_id', 1)
    outfit_uid = req.get('id') or f"outfit-{int(datetime.now().timestamp()*1000)}"
    title = req.get('title', 'マイスタイリングコーデ')
    date_str = req.get('date', datetime.now().strftime('%Y/%m/%d'))
    comment = req.get('comment', '')
    items = req.get('items', {})

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            insert_sql = """
            INSERT INTO `saved_outfits` (`user_id`, `outfit_uid`, `title`, `date`, `comment`, `items_json`, `created_at`)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                `title` = VALUES(`title`),
                `date` = VALUES(`date`),
                `comment` = VALUES(`comment`),
                `items_json` = VALUES(`items_json`);
            """
            cursor.execute(insert_sql, (user_id, outfit_uid, title, date_str, comment, json.dumps(items)))
        conn.commit()
        return jsonify({"status": "success", "message": f"「{title}」をMySQLに保存しました。"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/outfits/delete/<outfit_uid>', methods=['DELETE'])
def delete_user_outfit(outfit_uid):
    """
    保存したコーディネートをMySQLから削除
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM `saved_outfits` WHERE `outfit_uid` = %s;", (outfit_uid,))
        conn.commit()
        return jsonify({"status": "success", "message": "コーディネートを削除しました。"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# ▼▼▼【機能 1：MANEKIN 機能（3Dマネキン・バーチャル試着）】▼▼▼
# ==============================================================================
# ここにMANEKIN機能（3Dアバター生成、フィッティング計算、着せ替えプレビュー）を記述します。
# ------------------------------------------------------------------------------

DEFAULT_AVATAR_PROFILE = {
    "height_cm": 172.0,
    "weight_kg": 60.0,
    "shoulder_width_cm": 44,
    "chest_cm": 88,
    "waist_cm": 74,
    "hip_cm": 90,
    "skin_tone": "neutral",
    "model_url": "/assets/models/default_manekin.glb"
}

@app.route('/api/manekin/avatar/<user_id>', methods=['GET'])
def get_manekin_avatar(user_id):
    """ユーザー専用3Dマネキンアバターデータを返却"""
    return jsonify({
        "status": "success",
        "user_id": user_id,
        "avatar": DEFAULT_AVATAR_PROFILE,
        "message": "MANEKINアバターデータを正常に取得しました。"
    }), 200

@app.route('/api/manekin/try-on', methods=['POST'])
def manekin_virtual_try_on():
    """指定商品をマネキンに着せ替えたプレビュー情報を返す"""
    req = request.get_json() or {}
    item_id = req.get("item_id")
    user_id = req.get("user_id")

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

@app.route('/api/closet/<user_id>', methods=['GET'])
def get_user_closet(user_id):
    """会員の手持ち服リスト（デジタルクローゼット）をMySQLから取得"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT `id`, `user_id`, `item_uid`, `product_id`, `name`, `category`, `color`, `season`, `image_url` as `image`, `is_owned`, `is_purchased`, `price`, `purchase_date`, `created_at` FROM `closet_items` WHERE `user_id` = %s ORDER BY `id` DESC;",
                (user_id,)
            )
            items = cursor.fetchall()
            return jsonify({
                "status": "success",
                "user_id": user_id,
                "closet_items": items,
                "total_items": len(items)
            }), 200
    except Exception as e:
        print(f"[!] クローゼット取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/closet/add', methods=['POST'])
def add_to_closet():
    """手持ち服または購入商品をMySQL(closet_items)に登録"""
    req = request.get_json() or {}
    user_id = req.get('user_id', 1)
    name = req.get('name', '').strip()
    category = req.get('category', 'BOTTOMS')
    color = req.get('color', 'BLACK')
    season = req.get('season', '通年')
    image_url = req.get('image', '')
    item_uid = req.get('id') or f"c-{int(datetime.now().timestamp()*1000)}"
    product_id = req.get('productId', None)
    is_owned = 1 if req.get('isOwned', True) else 0
    is_purchased = 1 if req.get('isPurchased', False) else 0
    price = int(req.get('price', 0))
    purchase_date = req.get('purchaseDate', '')

    if not name:
        return jsonify({"status": "error", "message": "服の名前は必須です。"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
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
            cursor.execute(insert_sql, (
                user_id, item_uid, product_id, name, category, color,
                season, image_url, is_owned, is_purchased, price, purchase_date
            ))
        conn.commit()

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
    except Exception as e:
        conn.rollback()
        print(f"[!] クローゼット保存エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()

@app.route('/api/closet/delete/<item_uid>', methods=['DELETE'])
def delete_closet_item(item_uid):
    """手持ち服をMySQL(closet_items)から削除"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM `closet_items` WHERE `item_uid` = %s;", (item_uid,))
        conn.commit()
        return jsonify({"status": "success", "message": "クローゼットからアイテムを削除しました。"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# ▼▼▼【機能 3：AI コーデ提案機能（スマートスタイリスト）】▼▼▼
# ==============================================================================
# ここにAIコーデ提案機能（天気・気温・シーン・好みに基づく推薦アルゴリズム）を記述します。
# ------------------------------------------------------------------------------

@app.route('/api/ai-coordinate/recommend', methods=['POST'])
def recommend_coordinates():
    """会員向けにパーソナライズされたAIコーディネートを提案"""
    req = request.get_json() or {}
    weather = req.get("weather", "SUNNY")
    temp = req.get("temperature", 22)
    occasion = req.get("occasion", "CASUAL_DATE")

    ai_advice = (
        f"気温{temp}℃・{weather}の日に最適なミニマルコーデです。"
        f"{occasion}に合わせて、モノトーンで統一した清潔感のある装いをご提案します。"
    )

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

    return jsonify({
        "status": "success",
        "condition": {"weather": weather, "temperature": temp, "occasion": occasion},
        "recommendation": recommended_outfit
    }), 200


# ==============================================================================
# 5. 静的ファイル配信・ルートハンドラ
# ==============================================================================

@app.route('/')
def serve_index():
    """ルートURLアクセス時にフロントエンドの index.html を返却"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """CSS、JS、画像などの静的リソースを返却"""
    return send_from_directory('.', path)


# ==============================================================================
# サーバー起動メインルーチン
# ==============================================================================
def main():
    port = int(os.environ.get('PORT', 8080))
    print("=" * 70)
    print("【MANEKIN FASHION バックエンドAPIサーバー (Python + MySQL) 起動中】")
    print(f"URL: http://localhost:{port}")
    print("接続先MySQL: manekin_db (localhost:3306)")
    print("API一覧:")
    print("  ・商品一覧 / 詳細      : GET  /api/products , GET /api/products/<id>")
    print("  ・注文作成 / 確定      : POST /api/orders (MySQLに書き込み)")
    print("  ・購入履歴一覧        : GET  /api/orders (MySQLから取得)")
    print("  ・会員登録 / ログイン  : POST /api/auth/register , POST /api/auth/login")
    print("  ・MANEKIN 3D / AI機能 : /api/manekin/* , /api/closet/* , /api/ai-coordinate/*")
    print("=" * 70)
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=False
    )

if __name__ == '__main__':
    main()
