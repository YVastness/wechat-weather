// detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topCity: {},
    weatherInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //加载天气数据
    this.loadWeatherData(options)
  },

  loadWeatherData: function (options) {
    let cityCode = options.city_code || '';
    if (cityCode === "") {
      wx.navigateBack();
    }
    let weatherData = wx.getStorageSync('weatherData');
    let weatherInfo = weatherData[cityCode];
    if (weatherInfo === undefined) {
      wx.navigateBack();
    }

    let topCity = {
      left: "",
      center: "",
      right: "",
    };
    try {
      topCity.center = weatherInfo.realtime.city_name;
    } catch (e) {
    }

    this.setData({
      weatherInfo: weatherInfo,
      topCity: topCity,
    })
  },
})