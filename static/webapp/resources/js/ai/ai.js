const ai = {
    aiLocation: '.ai',
    sayingLocation: '.saying',
    url: config.ai.params.url,
    fadeInterval: config.ai.fadeInterval,
    cleanInterval: config.ai.cleanInterval,
    mmAvatar: 'lmm.jpg',
    defAvatar: 'avatar.png',
    sayingTime: new Date(),
    intervalId: null
};

ai.saying = function (data) {
    let dt_head = '<dt><image class="avatar ';
    let dt_mid1 = '" src="../static/webapp/resources/images/';
    let dt_mid2 = '" /><div class="words ';
    let dt_mid3 = '">';
    let dt_tail = '</div><br class="clear" /></dt>';
    let avatar = ai.mmAvatar;
    let words = data.word;
    let loc = 'fleft';

    let line = "";
    /*
     * 0 —— AI
     * 1 —— 用户
     */

    switch (data.user) {
        case 0:
            avatar = ai.defAvatar;
            loc = 'fright';
        case 1:
            line = dt_head + loc + dt_mid1 + avatar + dt_mid2 + loc + dt_mid3 + words + dt_tail;
            break;
        default:
            console.log('不支持的数据:' + data);
            break;
    }

    $(ai.sayingLocation).append(line);
    ai.scrollWords();
    ai.sayingTime = new Date();
}

ai.scrollWords = function () {
    let height = $(ai.sayingLocation).outerHeight();
    let offset = 795 - height;
    if (offset < 0) {
        $(ai.sayingLocation).animate({
            marginTop: offset + 'px',
        }, ai.fadeInterval);
    }
}

ai.clearWords = function () {
    let nowTime = new Date();
    if (nowTime - ai.sayingTime > ai.cleanInterval) {
        $(ai.sayingLocation).empty();
        $(ai.sayingLocation).css({"marginTop": "0"});
    }
}

ai.init = function () {
    console.log('ai init start');
    const name_space = "/mirror";

    let socket = io.connect(ai.url + name_space);
    // 连接成功后发送消息
    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    socket.on('connect', function () {
        console.log('send connect msg');
        socket.emit('event_connect', {data: 'mirror client connected!'});
    });

    socket.on('server_say', (msg) => {
        console.log("mirror", JSON.parse(msg));
        // 更新ui
        ai.saying(JSON.parse(msg));
    });
    // Interval function that tests message latency by sending a "ping"
    // message. The server then responds with a "pong" message and the
    // round trip time is measured.
    let ping_pong_times = [];
    let start_time;
    window.setInterval(function () {
        start_time = (new Date).getTime();
        console.log('client ping')
        socket.emit('ping');
    }, 10000);

    // Handler for the "pong" message. When the pong is received, the
    // time from the ping is stored, and the average of the last 30
    // samples is average and displayed.
    socket.on('server_pong', function () {
        let latency = (new Date).getTime() - start_time;
        ping_pong_times.push(latency);
        ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
        let sum = 0;
        for (let i = 0; i < ping_pong_times.length; i++) {
            sum += ping_pong_times[i];
            console.log('server_pong', sum)
        }
    });
    // 定时清理与机器人聊天消息
    this.intervalId = setInterval(function () {
        this.clearWords();
    }.bind(this), this.cleanInterval);
    console.log('ai init end');
};
