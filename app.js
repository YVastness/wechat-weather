//app.js
const api = require('./libs/api');
App({
    onLaunch: function () {
        // var that = this;
        // wx.login({
        //   success(res) {
        //     if (res.code) {
        //       //向后端发起网络请求
        //       wx.request({
        //         url: 'http://127.0.0.1:80/users/getUserInfo',
        //         data: {
        //           code: res.code
        //         },
        //         success: (response) => {
        //           //打印OpenId
        //           console.log(response.data);
        //           wx.setStorageSync('openid', response.data.openid)
        //           let location = "__location__";
        //           var citySelected = [];
        //           citySelected = citySelected.concat(response.data.cities)
        //           citySelected.unshift(location)
        //           wx.setStorageSync('citySelected', citySelected)
        //           //加载天气数据
        //           that.loadWeatherData();
        //         }
        //       })
        //     } else {
        //       console.log('登录失败！' + res.errMsg)
        //     }
        //   }
        // })
    },
    userLogin: function () {
        const that = this;
        //定义promise方法
        return new Promise(function (resolve, reject) {
            wx.login({
                success: function (res) {
                    if (res.code) {
                        wx.request({
                            url: 'http://127.0.0.1:80/users/getUserInfo',
                            data: {
                                code: res.code
                            },
                            success(res) {
                                console.log(res.data);
                                wx.setStorageSync('token', res.data.token)
                                let location = "__location__";
                                let citySelected = [];
                                if (res.data.cities != null) {
                                    citySelected = citySelected.concat(res.data.cities)
                                }
                                citySelected.unshift(location)
                                wx.setStorageSync('citySelected', citySelected)
                                //加载天气数据
                                that.loadWeatherData();
                                //promise机制放回成功数据
                                resolve(res.data);
                            },
                            fail: function (res) {
                                reject(res);
                                wx.showToast({
                                    title: '系统错误'
                                })
                            },
                            complete: () => {
                            } //complete接口执行后的回调函数，无论成功失败都会调用
                        })
                    } else {
                        reject("error");
                    }
                }
            })
        })
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

    getUserInfo: function () {
        const that = this;
        wx.getUserInfo({
            withCredentials: false,
            success: function (res) {
                that.globalData.userInfo = res.userInfo
            }
        })
    },

    globalData: {
        userInfo: null
    },
})
