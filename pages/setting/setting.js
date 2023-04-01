// setting.js
var api = require('../../libs/api')
var util = require('../../libs/util');

//获取应用实例
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    cityInfo: { openid: '', cityCode: '' },
    citySelected: {},
    weatherData: {},
    multiConf: [],
    multiSelected: [0, 0, 0],
    chinaCityConf: [],
    chinaCitySelected: [0, 0, 0],
    selectorVisible: false,
  },
  // 显示组件
  showSelector() {
    this.setData({
      selectorVisible: true,
    });
  },

  // 当用户选择了组件中的城市之后的回调函数
  onSelectCity(e) {
    var that = this;
    console.log(e.detail.city.id)
    api.selectCity(e.detail.city.id, function (cityCode) {
      that.addCity(cityCode);
    });

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      userInfo: app.globalData.userInfo,
      weatherData: wx.getStorageSync('weatherData'),
      citySelected: wx.getStorageSync('citySelected'),
    })
    console.log("-=-=-=-=-=-"+ this.data.citySelected)
  },

  onShow: function () {
    wx.setStorageSync('isSettings', true)
  },

  addCity: function (cityCode) {
    console.log(cityCode)
    try {
      var citySelected = wx.getStorageSync('citySelected') || []
      console.log(citySelected)
      if (this.data.weatherData['__location__'].realtime.city_code == cityCode) {
        return
      }
      if (citySelected.find(function (item) { return item === cityCode; }) != undefined) {
        return
      }

      var that = this;
      api.loadWeatherData(cityCode, function (cityCode, data) {
        var weatherData = wx.getStorageSync('weatherData') || {};
        var openId = wx.getStorageSync('openId') || {};
        weatherData[cityCode] = data;
        wx.setStorageSync('weatherData', weatherData);
        citySelected.push(cityCode);
        console.log("-----------" + citySelected);
        wx.setStorageSync('citySelected', citySelected);
        that.setData({
          chinaCitySelected: cityCode,
          citySelected: citySelected,
          weatherData: weatherData,
          'cityInfo.openId': openId,
          'cityInfo.cityCode': cityCode
        })
        util.setCityInfo(that.data.cityInfo);
      });
    } catch (e) { console.log(e) }
  },

  removeCity: function (e) {
    try {
      var cityCode = e.currentTarget.dataset.city_code || '';
      if (cityCode == "") {
        return
      }
      var citySelected = wx.getStorageSync('citySelected')
      for (var k in citySelected) {
        if (citySelected[k] == cityCode) {
          citySelected.splice(k, 1)
          break;
        }
      }
      wx.setStorageSync('citySelected', citySelected);
      this.setData({
        citySelected: citySelected,
      })
    } catch (e) { }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})