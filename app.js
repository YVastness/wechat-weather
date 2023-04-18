//app.js
const api = require('./libs/api');
App({
  onLaunch: function () {
    //加载天气数据
    this.loadWeatherData();
  },

  loadWeatherData: function () {
    let citySelected = wx.getStorageSync('citySelected') || [];
    if (citySelected.length === 0) {
      citySelected.unshift("__location__");
      wx.setStorageSync('citySelected', citySelected);
    }

    for (let idx in citySelected) {
      let cityCode = citySelected[idx];
      api.loadWeatherData(cityCode, function (cityCode, data) {
        let weatherData = wx.getStorageSync('weatherData') || {};
        weatherData[cityCode] = data;
        wx.setStorageSync('weatherData', weatherData);
      });
    }
  },
})
