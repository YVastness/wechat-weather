//index.js
const api = require('../../libs/api');

Page({
    data: {
        citySelected: {},
        weatherData: {},
        topCity: {},
    },

    //事件处理函数
    showDetailPage: function (e) {
        let cityCode = e.currentTarget.dataset.city_code || '';

        wx.navigateTo({
            url: '../detail/detail?city_code=' + cityCode
        })
    },
    showSettingPage: function () {
        wx.navigateTo({
            url: '../setting/setting'
        })
    },
    updateTopCity: function (event) {
        let citySelected = wx.getStorageSync('citySelected');
        let weatherData = wx.getStorageSync('weatherData');
        let topCity = {
            left: "",
            center: "",
            right: "",
        };

        let current = event.detail.current;
        wx.setStorageSync('currentPage', current);
        try {
            topCity.left = weatherData[citySelected[current - 1]].realtime.city_name;
        } catch (e) {
        }
        try {
            topCity.center = weatherData[citySelected[current]].realtime.city_name;
        } catch (e) {
        }
        try {
            topCity.right = weatherData[citySelected[current + 1]].realtime.city_name;
        } catch (e) {
        }

        this.setData({
            topCity: topCity,
        })
    },

    onLoad: function () {
        wx.setStorageSync('isSettings', false)
        let defaultCityCode = "__location__";
        let citySelected = wx.getStorageSync('citySelected');
        let weatherData = wx.getStorageSync('weatherData');
        if (citySelected.length === 0 || weatherData.length === 0) {
            let that = this;
            api.loadWeatherData(defaultCityCode, function (cityCode, data) {
                let weatherData = {};
                weatherData[cityCode] = data;
                that.setHomeData([cityCode], weatherData);
            });
        } else {
            this.setHomeData(citySelected, weatherData);
        }
    },

    onShow: function () {
        let isSettings = wx.getStorageSync("isSettings");
        if (isSettings) {
            let citySelected = wx.getStorageSync('citySelected');
            let weatherData = wx.getStorageSync('weatherData');
            let topCity = {
                left: "",
                center: "",
                right: "",
            };
            let currentPage = wx.getStorageSync('currentPage');
            if (currentPage == 0) {
                try {
                    topCity.center = weatherData[citySelected[0]].realtime.city_name;
                } catch (e) {
                }
                try {
                    topCity.right = weatherData[citySelected[1]].realtime.city_name;
                } catch (e) {
                }
            } else {
                try {
                    topCity.left = weatherData[citySelected[currentPage - 1]].realtime.city_name;
                } catch (e) {
                }
                try {
                    topCity.center = weatherData[citySelected[currentPage]].realtime.city_name;
                } catch (e) {
                }
                try {
                    topCity.right = weatherData[citySelected[currentPage + 1]].realtime.city_name;
                } catch (e) {
                }
            }
            this.setData({
                weatherData: weatherData,
                topCity: topCity,
                citySelected: citySelected,
            })
            wx.setStorageSync('isSettings', false)
        }
    },

    setHomeData: function (citySelected, weatherData) {
        let topCity = {
            left: "",
            center: "",
            right: "",
        };
        try {
            topCity.center = weatherData[citySelected[0]].realtime.city_name;
        } catch (e) {
        }
        try {
            topCity.right = weatherData[citySelected[1]].realtime.city_name;
        } catch (e) {
        }

        this.setData({
            weatherData: weatherData,
            topCity: topCity,
            citySelected: citySelected,
        })
    },
})
