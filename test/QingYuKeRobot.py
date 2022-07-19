import requests
import urllib


def qyk_chat(msg):
    url = 'http://api.qingyunke.com/api.php?key=free&appid=0&msg={}'.format(urllib.parse.quote(msg))
    html = requests.get(url)
    return html.json()["content"]


if __name__ == '__main__':
    msg = "我帅不帅"
    print("我:", msg)
    res = qyk_chat(msg)
    print("Robot:", res)
