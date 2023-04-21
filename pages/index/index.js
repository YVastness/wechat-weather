//index.js
const api = require('../../libs/api');

Page({
    data: {
        citySelected: {},
        weatherData: {},
        topCity: {},
        current: 0
    },

    /**
     * 显示天气管理页面
     */
    showDetailPage: function (event) {
        // 从属性data-city_code获取数据
        let cityCode = event.currentTarget.dataset.city_code || '';

        wx.navigateTo({
            url: '../detail/detail?city_code=' + cityCode
        })
    },
    /**
     * 显示城市管理页面
     */
    showSettingPage: function () {
        wx.navigateTo({
            url: '../setting/setting'
        })
    },
    /**
     * 更新首页顶部的显示的城市信息
     * @param event 事件发生后返回的数据
     */
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
            if (citySelected[current - 1] !== undefined) {
                topCity.left = weatherData[citySelected[current - 1]].realtime.city_name;
            }
        } catch (e) {
            console.error(e.message)
        }
        try {
            topCity.center = weatherData[citySelected[current]].realtime.city_name;
        } catch (e) {
            console.error(e.message)
        }
        try {
            if (citySelected[current + 1] !== undefined) {
                topCity.right = weatherData[citySelected[current + 1]].realtime.city_name;
            }
        } catch (e) {
            console.error(e.message)
        }

        this.setData({
            topCity: topCity,
        })
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        wx.setStorageSync('isSettings', false)
        wx.setStorageSync('isDetail', false)
        let defaultCityCode = "__location__";
        let citySelected = wx.getStorageSync('citySelected') || [];
        let weatherData = wx.getStorageSync('weatherData') || {};
        let that = this;
        if (citySelected.length === 0) {
            citySelected.unshift("__location__");
            wx.setStorageSync('citySelected', citySelected);
        }
        if (citySelected.length === 0 || weatherData.length === 0) {
            api.loadWeatherData(defaultCityCode, function (cityCode, data) {
                let weatherData = {};
                weatherData[cityCode] = data;
                that.setHomeData([cityCode], weatherData);
            });
        } else {
            this.updateWeatherData();
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let isSettings = wx.getStorageSync("isSettings") || false;
        let isDetail = wx.getStorageSync("isDetail") || false;
        let removeCount = wx.getStorageSync('removeCount');
        if (!isSettings && !isDetail) {
            this.updateWeatherData();
        }
        if (isSettings) {
            let citySelected = wx.getStorageSync('citySelected');
            let weatherData = wx.getStorageSync('weatherData');
            let topCity = {
                left: "",
                center: "",
                right: "",
            };
            let currentPage = wx.getStorageSync('currentPage');
            if (currentPage == 0 || removeCount >= 2) {
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
            wx.setStorageSync('isDetail', false)
        }
    },

    /**
     * 更新天气数据
     */
    updateWeatherData() {
        let citySelected = wx.getStorageSync('citySelected');
        let weatherData = wx.getStorageSync('weatherData') || {};
        let that = this;
        for (let idx in citySelected) {
            let cityCode = citySelected[idx];
            api.loadWeatherData(cityCode, function (cityCode, data) {
                weatherData = wx.getStorageSync('weatherData') || {};
                weatherData[cityCode] = data;
                wx.setStorageSync('weatherData', weatherData);
                that.setHomeData(citySelected, weatherData);
            });
        }
    },

    /**
     * 设置主页数据
     * @param citySelected 已经被管理的城市信息
     * @param weatherData 天气信息
     */
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
