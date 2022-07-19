var weather = {
    // Default language is Dutch because that is what the original author used
    params: config.weather.params || null,
    iconTable: {
        '00': 'wi-day-sunny', // 晴
        '01': 'wi-day-cloudy', // 晴转多云
        '02': 'wi-cloudy', // 阴
        // '04d': 'wi-cloudy-windy',
        '03': 'wi-showers', // 阵雨
        '04': 'wi-rain', // 雷阵雨
        '05': 'wi-rain', // 雷阵雨伴有冰雹
        '06': 'wi-snow', // 雨夹雪
        '07': 'wi-rain', // 小雨
        '08': 'wi-rain', // 中雨
        '09': 'wi-rain', // 大雨
        '10': 'wi-rain', // 暴雨
        '11': 'wi-rain', // 大暴雨
        '12': 'wi-rain', // 特大暴雨
        '13': 'wi-snow', // 阵雪
        '14': 'wi-snow', // 小雪
        '15': 'wi-snow', // 中雪
        '16': 'wi-snow', // 大雪
        '17': 'wi-snow', // 暴雪
        '18': 'wi-fog', // 雾
        '19': 'wi-rain', // 冻雨
        '20': 'wi-thunderstorm', // 沙尘暴
        '21': 'wi-rain', // 小到中雨
        '22': 'wi-rain', // 中到大雨
        '23': 'wi-rain', // 大到暴雨
        '24': 'wi-rain', // 暴雨到大暴雨
        '25': 'wi-rain', // 大暴雨到特大暴雨
        '26': 'wi-snow', // 小到中雪
        '27': 'wi-snow', // 中到大雪
        '28': 'wi-snow', // 大到暴雪
        '29': 'wi-fog', // 浮尘
        '30': 'wi-fog', // 扬沙
        '31': 'wi-thunderstorm', // 强沙尘暴
        '53': 'wi-fog', // 霾

        // '01n': 'wi-night-clear',
        // '02n': 'wi-night-cloudy',
        // '03n': 'wi-night-cloudy',
        // '04n': 'wi-night-cloudy',
        // '09n': 'wi-night-showers',
        // '10n': 'wi-night-rain',
        // '11n': 'wi-night-thunderstorm',
        // '13n': 'wi-night-snow',
        // '50n': 'wi-night-alt-cloudy-windy'
    },
    temperatureLocation: '.temp',
    windSunLocation: '.windsun',
    forecastLocation: '.forecast',
    url: config.weather.params.url,
    weatherEndpoint: 'weather',
    forecastEndpoint: 'forecast/daily',
    updateInterval: config.weather.fetchInterval || 2880 * 1000,
    fadeInterval: config.weather.fadeInterval || 1000,
    intervalId: null
}

/**
 * Rounds a float to one decimal place
 * @param  {float} temperature The temperature to be rounded
 * @return {string}             The new floating point value
 */
weather.roundValue = function (temperature) {
    return parseFloat(temperature).toFixed(1);
}

/**
 * Converts the wind speed (km/h) into the values given by the Beaufort Wind Scale
 * @see http://www.spc.noaa.gov/faq/tornado/beaufort.html
 * @param  {int} kmh The wind speed in Kilometers Per Hour
 * @return {int}     The wind speed converted into its corresponding Beaufort number
 */
weather.ms2Beaufort = function (ms) {
    let kmh = ms * 60 * 60 / 1000;
    let speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
    for (var beaufort in speeds) {
        var speed = speeds[beaufort];
        if (speed > kmh) {
            return beaufort;
        }
    }
    return 12;
}

/**
 * Retrieves the current temperature and weather patter from the JuHe API
 * https://www.juhe.cn/docs/api/id/73
 */
weather.updateCurrentWeather = function () {
    console.log('请求天气');
    $.ajax({
        type: 'GET',
        url: this.url,
        success: function (res) {
            let data = JSON.parse(res);
            console.log('GetWeather Success !', data);
            if (data && data.error_code === 0) {
                if (!data.result)
                    return;
                let realtime = data.result.realtime;
                if (realtime) {
                    // 今日天气
                    let _temperature = this.roundValue(realtime.temperature),
                        _wind = realtime.power,
                        _iconClass = this.iconTable[realtime.wid];
                    // 天气图标
                    let _icon = '<span class="icon ' + _iconClass + ' dimmed wi"></span>';
                    // 温度
                    let _newTempHtml = _icon + '' + _temperature + '&deg;';
                    //
                    $(this.temperatureLocation).updateWithText(_newTempHtml, this.fadeInterval);
                    // 风力
                    let _newWindHtml = '<span class="wi wi-strong-wind xdimmed"></span> ' + this.ms2Beaufort(_wind);
                    // 填充值
                    $(this.windSunLocation).updateWithText(_newWindHtml, this.fadeInterval);
                }

                // 未来天气
                if (data.result.future) {
                    let _opacity = 1,
                        _forecastHtml = '';
                    _forecastHtml += '<table class="forecast-table">';
                    for (let i = 0; i < data.result.future.length; i++) {
                        var _forecast = data.result.future[i];
                        _forecastHtml += '<tr style="opacity:' + _opacity + '">';
                        // 日期
                        _forecastHtml += '<td class="day">' + _forecast.date + '</td>';
                        // _forecastHtml += '<td class="icon-small ' + this.iconTable[_forecast.weather[0].icon] + '"></td>';
                        _forecastHtml += '<td class="temp-max">' + _forecast.temperature + '</td>';
                        _forecastHtml += '<td class="temp-min">' + _forecast.weather + '</td>';
                        _forecastHtml += '</tr>';
                        _opacity -= 0.155;
                    }
                    _forecastHtml += '</table>';
                    $(this.forecastLocation).updateWithText(_forecastHtml, this.fadeInterval);
                }
            }
        }.bind(this),
        error: function (e) {
            console.log("Get Weather fail", e)
        }
    });

}

weather.init = function () {
    this.updateCurrentWeather();
    this.intervalId = setInterval(function () {
        this.updateCurrentWeather();
    }.bind(this), this.updateInterval);

}
