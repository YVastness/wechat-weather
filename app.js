//app.js
var api = require('./libs/api')
App({
    onLaunch: function () {
        let that = this;
        wx.login({
            success(res) {
                if (res.code) {
                    //向后端发起网络请求
                    wx.request({
                        url: 'http://47.113.179.118:8080/users/getOpenId',
                        data: {
                            code: res.code
                        },
                        success: (response) => {
                          console.log(response)
                            wx.setStorageSync('openId', response.data.openId)
                            if (response.data.cities!=null) {
                              let location = '__location__';
                              let citySelected = [];
                              citySelected = citySelected.concat(response.data.cities)
                              citySelected.unshift(location)
                              wx.setStorageSync('citySelected', citySelected)
                            }
                            //加载天气数据
                            that.loadWeatherData();
                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
                 //加载天气数据
                 that.loadWeatherData();
            }
        })
    },
    // userLogin: function () {
    //     const that = this;
    //     //定义promise方法
    //     return new Promise(function (resolve, reject) {
    //         wx.login({
    //             success: function (res) {
    //                 if (res.code) {
    //                     wx.request({
    //                         url: 'http://127.0.0.1:80/users/getOpenId',
    //                         data: {
    //                             code: res.code
    //                         },
    //                         header: {
    //                             'content-type': 'application/json' // 默认值
    //                         },
    //                         success(res) {
    //                             console.log("wx.login: ", res.data);
    //                             wx.setStorageSync('openId', res.data.openId)
    //                             let location = "__location__";
    //                             var citySelected = [];
    //                             if (res.data.cities != null) {
    //                                 citySelected = citySelected.concat(res.data.cities)
    //                             }
    //                             citySelected.unshift(location)
    //                             wx.setStorageSync('citySelected', citySelected)
    //                             //加载天气数据
    //                             // that.loadWeatherData();
    //                             //promise机制放回成功数据
    //                             resolve(citySelected);
    //                         },
    //                         fail: function (res) {
    //                             reject(res);
    //                             wx.showToast({
    //                                 title: '系统错误'
    //                             })
    //                         },
    //                         complete: () => {
    //                         } //complete接口执行后的回调函数，无论成功失败都会调用
    //                     })
    //                 } else {
    //                     reject("error");
    //                 }
    //             }
    //         })
    //     })
    // },
    loadWeatherData: function () {
        let citySelected = wx.getStorageSync('citySelected') || [];
        if (citySelected.length === 0) {
            citySelected.unshift("__location__");
            wx.setStorageSync('citySelected', citySelected);
        }

        for (var idx in citySelected) {
            var cityCode = citySelected[idx];
            api.loadWeatherData(cityCode, function (cityCode, data) {
                var weatherData = wx.getStorageSync('weatherData') || {};
                weatherData[cityCode] = data;
                wx.setStorageSync('weatherData', weatherData);
            });
        }
    },

    getUserInfo: function () {
        var that = this
        wx.getUserInfo({
            withCredentials: false,
            success: function (res) {
                that.globalData.userInfo = res.userInfo
            }
        })
    },

    globalData: {
        userInfo: null,
        weatherData: {}
    },
})
