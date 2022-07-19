let config = {
    lang: 'zh-cn',
    time: {
        timeFormat: 24, // 时间格式
    },
    weather: {
        params: {
            url: 'http://127.0.0.1:5000/weather',
        },
        fetchInterval: 2880 * 1000, // 免费版每天30次
        fadeInterval: 1000
    },
    ai: {
        params: {
            url: 'http://127.0.0.1:5000'
        },
        fadeInterval: 500,
        cleanInterval: 900000 // 最后一次接收到新的对话请求之后的等待清理对话列表时间
    },
    compliments: {
        interval: 30000,
        fadeInterval: 4000,
        timeParams: {
            morning: 3,
            afternoon: 12,
            evening: 18
        },
        morning: [
            '喜欢清晨的阳光啊',
            '昨晚睡得好吗',
            '啊哈，又没吃早饭吧'
        ],
        afternoon: [
            '休息，休息一下',
            '喝杯下午茶吧',
            '今天晚上吃什么'
        ],
        evening: [
            '太阳下山啦',
            '要不要来点夜宵',
            '晚安'
        ]
    },
    news: { // 新闻头条
        params: {
            url: 'http://127.0.0.1:5000/news', // 请求地址
        },
        fetchInterval: 2880 * 1000, // 请求接口间隔免费版每天30次
        interval: 30000, // 切换新闻频率
        fadeInterval: 1000 // 动画频率
    }
}

config.init = function () {
}
