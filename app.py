import os
import urllib
from flask import Flask, request, render_template, url_for
import requests
from datetime import timedelta
from flask_cors import CORS
from flask_socketio import SocketIO
import json

app = Flask(__name__)

async_mode = None
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True
socket_io = SocketIO(app)


# CORS(app, supports_credentials=True)


# region index
@app.route('/')
def index():
    return render_template('index.html')


# endregion

# region socket of ai
@socket_io.on('event_connect', namespace='/mirror')
def on_client_connect(data):
    print('client connected', data)
    send_msg = {
        'user': 1,
        'word': "你他妈可连上了"
    }
    socket_io.emit('server_say', json.dumps(send_msg), namespace='/mirror')


@app.route('/sendmsg')
def chat():
    msg = request.args['msg']
    print("User:" + ">>>:", msg)
    send_msg = {
        'user': 0,
        'word': msg
    }
    socket_io.emit('server_say', json.dumps(send_msg), namespace='/mirror')
    url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg={}'.format(urllib.parse.quote(msg))
    html = requests.get(url)
    robot_msg = html.json()["content"]
    print("Robot>>>:", robot_msg)
    send_msg = {
        'user': 1,
        'word': robot_msg
    }
    socket_io.emit('server_say', json.dumps(send_msg), namespace='/mirror')
    return "send success"


@socket_io.on('ping', namespace='/mirror')
def ping_pong():
    print('get server ping')
    socket_io.emit('server_pong', 'server_can_pong', namespace='/mirror')


# endregion

# region weather
@app.route('/weather')
def get_weather():
    url = 'http://apis.juhe.cn/simpleWeather/query'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36'}
    params = {
        'key': '7a1569cd8be1b4d396f86570eee61155',
        'city': '天津'.encode(encoding="utf-8"),
    }
    res = requests.get(url, params, headers=headers)
    print('响应状态码：', res.status_code)
    print('请求头信息：', res.request.headers)
    print('响应正文：', res.text)
    return res.text


# endregion

# region news
@app.route('/news')
def get_news():
    url = "http://v.juhe.cn/toutiao/index"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.193 Safari/537.36'}
    params = {
        'key': '04c653dda3e185c7674fd5cdd245bd5b',
        'type': 'caijing',
        'page': 1,
        'page_size': 30
    }
    res = requests.get(url, params, headers=headers)
    print('响应状态码：', res.status_code)
    print('请求头信息：', res.request.headers)
    print('响应正文：', res.text)
    return res.text


# endregion

# region clear server h5 cache
@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
    if filename:
        file_path = os.path.join(app.root_path, endpoint, filename)
        values['q'] = int(os.stat(file_path).st_mtime)
        return url_for(endpoint, **values)


# endregion


@app.route('/upload_main')
def upload_main():
    return render_template('upload_main.html')


@app.route('/upload')
def upload_file():
    return render_template('upload.html')

# @app.route('/exec_upload', methods=['GET', 'POST'])
# TODO


def _get_file():
    print(os.getcwd())
    path1 = os.getcwd() + '/upload_files'
    path2 = os.getcwd()
    # 跳转目录 跳转到下载文件目录, 获得下载文件目录里面的list之后, 然后再跳转出来
    # 这个跳转的步骤是为了获取到upload_files目录下的文件的名字, 然后把它放进f_list中
    os.chdir(path1)
    f_list = os.listdir()
    os.chdir(path2)
    print(os.getcwd())
    return f_list


def _is_have_file(filename):
    path1 = os.getcwd() + '/upload_files'
    path2 = os.getcwd()
    os.chdir(path1)
    flag = os.path.isfile(filename)
    os.chdir(path2)
    return flag


if __name__ == '__main__':
    socket_io.run(app, debug=True)
