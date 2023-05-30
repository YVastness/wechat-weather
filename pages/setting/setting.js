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
        // 从本地存储获取删除计数
        let removeCount = wx.getStorageSync('removeCount');
        try {
            // 获取要删除的城市行政代码
            let cityAdCode = event.currentTarget.dataset.city_code || '';

            if (cityAdCode === "") {
                return;
            }
            // 从本地存储获取已选择的城市列表
            let citySelected = wx.getStorageSync('citySelected');
            // 遍历城市列表，查找要删除的城市
            for (let key in citySelected) {
                if (citySelected[key] === cityAdCode) {
                    if (citySelected[key] === "local_adCode") {
                        // 如果要删除的城市是当前位置的城市行政代码，则显示提示信息并停止删除操作
                        wx.showToast({title: '本地城市不能删除！', icon: 'none', duration: 2000});
                        break;
                    }
                    // 从城市列表中移除要删除的城市行政代码
                    citySelected.splice(key, 1);
                    // 增加删除计数
                    removeCount++;
                    break;
                }
            }
            // 更新本地存储中的城市列表和删除计数
            wx.setStorageSync('citySelected', citySelected);
            wx.setStorageSync('removeCount', removeCount);
            // 更新组件的城市列表属性，以在界面上反映出删除后的结果
            this.setData({
                citySelected: citySelected,
            });
        } catch (e) {
            console.log('removeCity错误:', e.message);
        }
    }
})
