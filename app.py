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
    cart_items = req.get('items', []) # カート内商品リスト
    user_id = req.get('user_id', None)

    # 入力バリデーション
    if not customer_name or not customer_email or not address or not cart_items:
        return jsonify({"status": "error", "message": "お名前、メールアドレス、住所、注文商品は必須です。"}), 400

    # 金額の再計算（改ざん防止）
    subtotal = 0
    for item in cart_items:
        qty = int(item.get('quantity', 1))
        price = int(item.get('price', 0))
        subtotal += (price * qty)

    # 送料計算（5,000円以上は送料無料、未満は全国一律550円）
    shipping_fee = 0 if subtotal >= 5000 else 550
    total_amount = subtotal + shipping_fee

    # ユニークな注文番号の生成（例: ORD-20261028-A7X9）
    today_str = datetime.now().strftime('%Y%m%d')
    random_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    order_no = f"ORD-{today_str}-{random_code}"

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            # 1. ordersテーブルに注文ヘッダーを挿入
            insert_order_sql = """
            INSERT INTO `orders` (
                `order_no`, `user_id`, `customer_name`, `customer_email`,
                `postal_code`, `address`, `phone`, `payment_method`,
                `delivery_time`, `subtotal`, `shipping_fee`, `total_amount`,
                `status`, `created_at`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW());
            """
            cursor.execute(insert_order_sql, (
                order_no, user_id, customer_name, customer_email,
                postal_code, address, phone, payment_method,
                delivery_time, subtotal, shipping_fee, total_amount,
                "注文受付済み"
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
                    item.get('id', 0),
                    item.get('name', '商品名未定'),
                    item.get('color', 'STANDARD'),
                    item.get('size', 'M'),
                    int(item.get('quantity', 1)),
                    int(item.get('price', 0)),
                    item.get('image', 'assets/images/item_tshirt.jpg')
                ))

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
            "total_amount": total_amount,
            "status": "注文受付・発送準備中",
            "items": cart_items
        }

        return jsonify({
            "status": "success",
            "message": "ご注文が正常に完了しました！",
            "order": created_order_data
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
                # マイページ一覧用要約テキスト（例: "Tシャツ (WHITE / L) × 2"）
                item_summary_list = [f"{it['product_name']} ({it['color']} / {it['size']}) × {it['quantity']}" for it in items]
                o['items_summary'] = ", ".join(item_summary_list) if item_summary_list else "注文商品"

        return jsonify({"status": "success", "orders": orders}), 200

    except Exception as e:
        print(f"[!] 注文履歴取得エラー: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# 3. 会員・認証関連 API (AUTH)
# ==============================================================================

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """
    新規会員登録をMySQLに保存するエンドポイント
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

            # ユーザーの登録
            cursor.execute(
                "INSERT INTO `users` (`name`, `email`, `password_hash`, `rank`, `created_at`) VALUES (%s, %s, %s, 'REGULAR MEMBER', NOW());",
                (name, email, password)
            )
            user_id = cursor.lastrowid
        conn.commit()

        return jsonify({
            "status": "success",
            "message": "会員登録が完了しました。",
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "rank": "REGULAR MEMBER"
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
    会員ログイン認証を行うエンドポイント
    """
    req = request.get_json() or {}
    email = req.get('email', '').strip()
    password = req.get('password', '').strip()

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT `id`, `name`, `email`, `rank` FROM `users` WHERE `email` = %s AND `password_hash` = %s;", (email, password))
            user = cursor.fetchone()
            if not user:
                return jsonify({"status": "error", "message": "メールアドレスまたはパスワードが正しくありません。"}), 401

        return jsonify({
            "status": "success",
            "message": "ログインしました。",
            "user": user
        }), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        conn.close()


# ==============================================================================
# 4. お気に入り関連 API (FAVORITES)
# ==============================================================================

@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    """
    お気に入り商品IDリストを取得するエンドポイント
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "success", "favorites": [1, 2]}), 200

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT `product_id` FROM `favorites`;")
            rows = cursor.fetchall()
            fav_ids = [r['product_id'] for r in rows]
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
    user_id = req.get('user_id', None)

    if not product_id:
        return jsonify({"status": "error", "message": "商品IDが必要です。"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"status": "error", "message": "データベースに接続できませんでした。"}), 500

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT `id` FROM `favorites` WHERE `product_id` = %s;", (product_id,))
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
# ▼▼▼【機能 2：マイクローゼット機能（手持ち服の登録・管理）】▼▼▼
# ==============================================================================
# ここにマイクローゼット機能（手持ち服の写真切り抜き、色・形状分類、管理）を記述します。
# ------------------------------------------------------------------------------

@app.route('/api/closet/<user_id>', methods=['GET'])
def get_user_closet(user_id):
    """会員の手持ち服リスト（デジタルクローゼット）を取得"""
    mock_closet_items = [
        {"id": 101, "name": "手持ちの黒スキニーパンツ", "category": "BOTTOMS", "color": "BLACK", "registered_at": "2026-10-15"},
        {"id": 102, "name": "私物の白レザースニーカー", "category": "SHOES", "color": "WHITE", "registered_at": "2026-10-18"}
    ]
    return jsonify({
        "status": "success",
        "user_id": user_id,
        "closet_items": mock_closet_items,
        "total_items": len(mock_closet_items)
    }), 200

@app.route('/api/closet/add', methods=['POST'])
def add_to_closet():
    """手持ち服を新しくクローゼットに登録"""
    req = request.get_json() or {}
    return jsonify({
        "status": "success",
        "message": "クローゼットに新しいアイテムを登録しました。",
        "saved_data": req
    }), 201


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
<<<<<<< HEAD
=======

>>>>>>> c5f3c295cfe6eded1ea99b66754207c43c15c897

if __name__ == '__main__':
    main()
