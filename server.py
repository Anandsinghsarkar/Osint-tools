from flask import Flask, request, jsonify, render_template
import requests
import json
import os

app = Flask(__name__)
USERS_FILE = "users.json"
ADMIN_ID = "5432109876"

# Load users
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE) as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

@app.route('/log')
def log_action():
    uid = request.args.get("uid")
    action = request.args.get("action")
    tool = request.args.get("tool")
    query = request.args.get("query")

    users = load_users()
    if uid not in users:
        users[uid] = {
            "userid": uid,
            "name": f"User_{uid[-4:]}",
            "username": "unknown",
            "credit": 7,
            "logs": []
        }
        # Notify admin via Telegram
        try:
            requests.get(
                f"https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?"
                f"chat_id={ADMIN_ID}&text="
                f"%F0%9F%9A%A8+*New+User+Joined!%0AID:+{uid}%0A7+free+credits.*"
                f"&parse_mode=Markdown"
            )
        except:
            pass
    else:
        if users[uid]["credit"] <= 0:
            return jsonify({"error": "no_credit"}), 403

        if tool:
            users[uid]["credit"] -= 1
            users[uid]["logs"].append({"tool": tool, "query": query, "ts": request.args.get('t', '')})

    save_users(users)
    return jsonify({"status": "logged"})

@app.route('/api/proxy')
def proxy():
    url = request.args.get("url")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(url, headers=headers, timeout=10)
        return (resp.text, resp.status_code, resp.headers.items())
    except Exception as e:
        return str(e), 500

@app.route('/get_user')
def get_user():
    uid = request.args.get("get_user")
    users = load_users()
    user = users.get(uid, {"name":"Unknown","username":"N/A","userid":uid,"credit":0})
    return jsonify(user)

@app.route('/')
def home():
    return open('index.html').read()

@app.route('/<page>')
def page(page):
    if page in ['dashboard.html', 'profile.html']:
        return open(page).read()
    return open('index.html').read()

@app.route('/admin/panel.html')
def admin_panel():
    users = load_users()
    html = "<h1>🛡 Admin Panel</h1><table border='1'><tr><th>ID</th><th>Name</th><th>Credit</th><th>Action</th></tr>"
    for u in users.values():
        html += f"<tr><td>{u['userid']}</td><td>{u['name']}</td><td>{u['credit']}</td>" \
                f"<td><a href='/add?uid={u['userid']}&amt=50'>+50</a> | " \
                f"<a href='/add?uid={u['userid']}&amt=100'>+100</a></td></tr>"
    html += "</table>"
    return html

@app.route('/add')
def add_credit():
    uid = request.args.get("uid")
    amt = int(request.args.get("amt"))
    users = load_users()
    if uid in users:
        users[uid]["credit"] += amt
        save_users(users)
        # Notify user
        try:
            requests.get(
                f"https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?"
                f"chat_id={uid}&text="
                f"%F0%9F%92%B5+*{amt}+credits+added!+%0ATotal:+{users[uid]['credit']}*"
                f"&parse_mode=Markdown"
            )
        except:
            pass
    return "Done", 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
