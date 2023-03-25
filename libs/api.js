
var apiLocalWeatherUrl = 'https://open.onebox.so.com/Dataapi?&query=%E5%A4%A9%E6%B0%94&type=weather&ip=&src=soindex&d=pc&url=weather';
var apiCityWeatherUrl = 'https://open.onebox.so.com/Dataapi?callback=&query=%E5%8C%97%E4%BA%AC%E5%B8%82%E5%8C%97%E4%BA%AC%E6%B5%B7%E6%B7%80%E5%A4%A9%E6%B0%94&type=weather&ip=&src=soindex&d=pc&url=http%253A%252F%252Fcdn.weather.hao.360.cn%252Fsed_api_weather_info.php%253Fapp%253DguideEngine%2526fmt%253Djson%2526code%253D';

function loadWeatherData(cityCode, cb) {
  var apiWeatherUrl = apiLocalWeatherUrl;
  if (cityCode != "" && cityCode != "__location__") {
    console.log(cityCode)
    apiWeatherUrl = apiCityWeatherUrl + cityCode;
  }

  wx.request({
    url: apiWeatherUrl,
    data: {},
    success: function (res) {
      if (res.statusCode != 200 || res.data.length == 0) {
        return;
      }
      var weatherData = parseWeatherData(res.data);
      console.log(weatherData)
      typeof cb == "function" && cb(cityCode, weatherData)
    }
  })
}
function parseWeatherData(data) {
  data.realtime.weather.pic = weatherPic(data.realtime.weather.img);
  for (var i = 0; i < data.weather.length; i++) {
    data.weather[i].shortDate = shortDate(data.weather[i].date);
    data.weather[i].day_pic = weatherPic(data.weather[i].info.day[0]);
    data.weather[i].night_pic = weatherPic(data.weather[i].info.night[0]);
  }
  var lifeConf = []
  for (var key in data.life.info) {
    var name = lifeName(key)
    if (name != undefined) {
      lifeConf.push({
        key: key,
        name: name,
        pic: lifePic(key)
      });
    }
  }
  data.life['conf'] = lifeConf;
  return data;
}
function weatherPic(no) {
  if (no.length == 1) {
    no = '0' + no;
  }
  return 'https://p0.ssl.qhimg.com/d/f239f0e2/' + no + '.png'
}
function lifePic(key) {
  return 'https://p0.ssl.qhimg.com/d/f239f0e2/' + key + '.png';
}

var lifeNameConf = {
  chuanyi: "穿衣",
  ganmao: "感冒",
  xiche: "行车",
  yundong: "运动",
  ziwaixian: "紫外线",
  diaoyu: "钓鱼",
  daisan: "带伞",
  guomin: "过敏",
}
function lifeName(key) {
  return lifeNameConf[key];
}
function shortDate(str) {
  var date = new Date(Date.parse(str));
  var now = new Date();

  var result = (date.getMonth() + 1) + "/" + date.getDate();
  if (now.getDate() == date.getDate()) {
    result = "今天";
  }
  return result;
}

var oneboxProxyUrl = 'https://open.onebox.so.com/api/proxy?__url__=';
var cdnWeatherHaoUrl = 'http://cdn.weather.hao.360.cn/sed_api_area_query.php?app=guideEngine&fmt=json&grade=';
var qweather = 'https://geoapi.qweather.com/v2/city/lookup?key=8cbf558f85dd40ff86f528b2370236b8&location=';
var cityConfCache = {}

function loadCityConf(level, code, cb) {
  console.log("2. aaaaaaaaaaaa\n");
  var cacheKey = level + ":" + code
  if (cityConfCache[cacheKey] != undefined && cityConfCache[cacheKey].length > 0) {
  console.log("21. aaaaaaaaaaaa\n");
    typeof cb == "function" && cb(level, code, cityConfCache[cacheKey])
  console.log("22. aaaaaaaaaaaa\n");
    return
  }

  wx.request({
    url: apiCityConfUrl(level, code),
    data: {},
    success: function (res) {
      if (res.statusCode != 200 || res.data.length == 0) {
        return;
      }
      cityConfCache[cacheKey] = res.data;
      console.log("4. =======1========");
      typeof cb == "function" && cb(level, code, res.data)
      loadCityConf(level,code,cb)
      console.log("5 .=======2========");
    }
  })
}
function apiCityConfUrl(level, code) {
  var url = cdnWeatherHaoUrl + level
  if (code != "") {
    url += '&code=' + code
  }
  // url = oneboxProxyUrl + encodeURIComponent(url)
  return url
}

function selectCity(city_id, cb) {
wx.request({
    url: qweather + city_id,
    data: {},
    success: function (res) {
      console.log(res.data.location[0].id)
      if (res.statusCode != 200 || res.data.length == 0) {
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