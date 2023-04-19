// setting.js
const api = require('../../libs/api');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        citySelected: {},
        weatherData: {},
        multiConf: [],
        multiSelected: [0, 0, 0],
        chinaCityConf: [],
        chinaCitySelected: [0, 0, 0],
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
        api.selectCity(event.detail.city.id, function (cityCode) {
            that.addCity(cityCode);
        });

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function () {
        this.setData({
            weatherData: wx.getStorageSync('weatherData'),
            citySelected: wx.getStorageSync('citySelected'),
        })
    },

    onShow: function () {
        wx.setStorageSync('removeCount', 0);
        wx.setStorageSync('isSettings', true)
    },

    /**
     * 添加城市
     * @param cityCode 城市代码
     */
    addCity: function (cityCode) {
        try {
            let citySelected = wx.getStorageSync('citySelected') || [];

            if (this.data.weatherData['__location__'].realtime.city_code === cityCode) {
                return
            }
            if (citySelected.find(item => item === cityCode) !== undefined) {
                return
            }

            let that = this;
            api.loadWeatherData(cityCode, function (cityCode, data) {
                let weatherData = wx.getStorageSync('weatherData') || {};
                weatherData[cityCode] = data;
                wx.setStorageSync('weatherData', weatherData);
                citySelected.push(cityCode);
                wx.setStorageSync('citySelected', citySelected);
                that.setData({
                    chinaCitySelected: cityCode,
                    citySelected: citySelected,
                    weatherData: weatherData
                })
            });
        } catch (e) {
            console.log(e)
        }
    },

    /**
     * 删除城市
     * @param event 点击删除按钮后传的值
     */
    removeCity: function (event) {
        let removeCount = wx.getStorageSync('removeCount');
        try {
            let cityCode = event.currentTarget.dataset.city_code || '';
            if (cityCode === "") {
                return
            }
            let citySelected = wx.getStorageSync('citySelected');
            for (let key in citySelected) {
                if (citySelected[key] === cityCode) {
                    if (citySelected[key] === "__location__") {
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
            console.log(e.message);
        }
    },
})