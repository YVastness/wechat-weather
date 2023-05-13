// setting.js
const api = require('../../libs/api');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        weatherData: {},
        citySelected: {},
        selectorVisible: false,
        removeCount: 0
    },
    /**
     * 显示城市选择器组件
     */
    showSelector() {
        this.setData({
            selectorVisible: true,
        });
    },

    /**
     * 当用户选择了组件中的城市之后的回调函数
     *
     * @param event 事件发生后返回的数据
     */
    onSelectCity(event) {
        let that = this;
        api.convertCityAdCode(event.detail.city.id, function (cityAdCode) {
            that.addCity(cityAdCode);
        });

    },

    onLoad: function () {
        this.setData({
            weatherData: wx.getStorageSync('weatherData'),
            citySelected: wx.getStorageSync('citySelected'),
        })
    },

    onShow: function () {
        wx.setStorageSync('removeCount', 0);
    },

    /**
     * 添加城市
     * @param cityAdCode 城市代码
     */
    addCity: function (cityAdCode) {
        try {
            let citySelected = wx.getStorageSync('citySelected') || [];

            if (this.data.weatherData['local_adCode'].realtime.city_code === cityAdCode) {
                return
            }
            if (citySelected.find(item => item === cityAdCode) !== undefined) {
                return
            }

            let that = this;
            api.getWeatherData(cityAdCode, function (cityAdCode, data) {
                let weatherData = wx.getStorageSync('weatherData') || {};
                weatherData[cityAdCode] = data;
                wx.setStorageSync('weatherData', weatherData);
                citySelected.push(cityAdCode);
                wx.setStorageSync('citySelected', citySelected);
                that.setData({
                    citySelected: citySelected,
                    weatherData: weatherData
                })
            });
        } catch (e) {
            console.log('addCity错误:', e)
        }
    },

    /**
     * 删除城市
     * @param event 点击删除按钮后传的值
     */
    removeCity: function (event) {
        let removeCount = wx.getStorageSync('removeCount');
        try {
            let cityAdCode = event.currentTarget.dataset.city_code || '';
            if (cityAdCode === "") {
                return
            }
            let citySelected = wx.getStorageSync('citySelected');
            for (let key in citySelected) {
                if (citySelected[key] === cityAdCode) {
                    if (citySelected[key] === "local_adCode") {
                        wx.showToast({title: '本地城市不能删除！', icon: 'none', duration: 2000});
                        break;
                    }
                    citySelected.splice(key, 1);
                    removeCount++;
                    break;
                }
            }
            wx.setStorageSync('citySelected', citySelected);
            wx.setStorageSync('removeCount', removeCount)
            this.setData({
                citySelected: citySelected,
            });
        } catch (e) {
            console.log('removeCity错误:', e.message);
        }
    },
})
