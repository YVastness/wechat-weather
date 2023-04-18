const apiLocalWeatherUrl = 'https://open.onebox.so.com/Dataapi?&query=%E5%A4%A9%E6%B0%94&type=weather&ip=&src=soindex&d=pc&url=weather';
const apiCityWeatherUrl = 'https://open.onebox.so.com/Dataapi?callback=&query=%E5%8C%97%E4%BA%AC%E5%B8%82%E5%8C%97%E4%BA%AC%E6%B5%B7%E6%B7%80%E5%A4%A9%E6%B0%94&type=weather&ip=&src=soindex&d=pc&url=http%253A%252F%252Fcdn.weather.hao.360.cn%252Fsed_api_weather_info.php%253Fapp%253DguideEngine%2526fmt%253Djson%2526code%253D';
const cdnWeatherHaoUrl = 'http://cdn.weather.hao.360.cn/sed_api_area_query.php?app=guideEngine&fmt=json&grade=';
const qweather = 'https://geoapi.qweather.com/v2/city/lookup?key=8cbf558f85dd40ff86f528b2370236b8&location=';
let cityConfCache = {};
let lifeNameConf = {
    chuanyi: "穿衣",
    ganmao: "感冒",
    xiche: "行车",
    yundong: "运动",
    ziwaixian: "紫外线",
    diaoyu: "钓鱼",
    daisan: "带伞",
    guomin: "过敏",
};

/**
 * 加载获取天气数据
 *
 * @param cityCode 城市代码
 * @param callback 回调函数
 */
function loadWeatherData(cityCode, callback) {
    let apiWeatherUrl = apiLocalWeatherUrl;
    if (cityCode !== "" && cityCode !== "__location__") {
        apiWeatherUrl = apiCityWeatherUrl + cityCode;
    }
    wx.request({
        url: apiWeatherUrl,
        data: {},
        success: res => {
            if (res.statusCode !== 200 || res.data.length === 0) {
                return;
            }
            let weatherData = parseWeatherData(res.data);
            typeof callback == "function" && callback(cityCode, weatherData)
        }
    })
}

/**
 *从api中获取数据并解析为展示的数据
 *
 * @param data 从api中获取数据
 * @returns {*} 解析的展示的数据
 */
function parseWeatherData(data) {
    data.realtime.weather.pic = weatherPic(data.realtime.weather.img);
    for (let i = 0; i < data.weather.length; i++) {
        data.weather[i].shortDate = shortDate(data.weather[i].date);
        data.weather[i].day_pic = weatherPic(data.weather[i].info.day[0]);
        data.weather[i].night_pic = weatherPic(data.weather[i].info.night[0]);
    }
    let lifeConf = [];
    for (let key in data.life.info) {
        let name = lifeName(key);
        if (name !== undefined) {
            lifeConf.push({
                key: key,
                name: name,
                pic: lifePic(key)
            });
        }
    }
    /*
        获取生活指数conf.key，name，pic
        key: 来获取life.info里生活指数信息
     */
    data.life['conf'] = lifeConf;
    return data;
}

/**
 * 获取照片地址
 *
 * @param pictureNo 照片的代码
 * @returns {string} 照片的api地址
 */
function weatherPic(pictureNo) {
    // api里照片名都是两位数，所以需要转换照片名
    if (pictureNo.length === 1) {
        pictureNo = '0' + pictureNo;
    }
    return 'https://p0.ssl.qhimg.com/d/f239f0e2/' + pictureNo + '.png'
}

/**
 * 获取生活指数照片
 *
 * @param key 特定的生活指数的key（例如：带伞），用来获取值（是否带伞，照片等）
 * @returns {string} 生活指数照片地址
 */
function lifePic(key) {
    return 'https://p0.ssl.qhimg.com/d/f239f0e2/' + key + '.png';
}

/**
 * 根据生活指数key自定义的生活指数名
 * @param key 生活指数key
 * @returns {*} 自定义的生活指数名
 */
function lifeName(key) {
    return lifeNameConf[key];
}

/**
 * 转换日期格式
 *
 * @param oldDate 需要被转换的日期
 * @returns {string} 新日期
 */
function shortDate(oldDate) {
    let date = new Date(Date.parse(oldDate));
    let now = new Date();
    let newDate = (date.getMonth() + 1) + "/" + date.getDate();
    if (now.getDate() === date.getDate()) {
        newDate = "今天";
    }
    return newDate;
}

function loadCityConf(level, code, cb) {
    let cacheKey = level + ":" + code;
    if (cityConfCache[cacheKey] !== undefined && cityConfCache[cacheKey].length > 0) {
        typeof cb == "function" && cb(level, code, cityConfCache[cacheKey])
        return
    }
    wx.request({
        url: apiCityConfUrl(level, code),
        data: {},
        success: function (res) {
            if (res.statusCode !== 200 || res.data.length === 0) {
                return;
            }
            cityConfCache[cacheKey] = res.data;
            typeof cb == "function" && cb(level, code, res.data)
            loadCityConf(level, code, cb)
        }
    })
}

function apiCityConfUrl(level, code) {
    var url = cdnWeatherHaoUrl + level
    if (code !== "") {
        url += '&code=' + code
    }
    return url
}

function selectCity(city_id, cb) {
    wx.request({
        url: qweather + city_id,
        data: {},
        success: function (res) {
            if (res.statusCode !== 200 || res.data.length === 0) {
                return;
            }
            cb(res.data.location[0].id)
        }
    })
}

module.exports = {
    loadWeatherData: loadWeatherData,
    loadCityConf: loadCityConf,
    selectCity: selectCity
}