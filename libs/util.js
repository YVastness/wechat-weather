var backendUrl = 'http://47.113.179.118:8080/cities';
function setCityInfo(cityInfo) {
	wx.request({
		url: backendUrl,
		method: 'POST',
		data: cityInfo,
		success: function (res) {
			console.log('object :>> ', res);
		}
	})
}
function deleteCityInfo(cityCode) {
  let city = {};
  city["openId"] = wx.getStorageSync('openId');
  city["cityCode"] = cityCode;
  console.log(city)
	wx.request({
		url: backendUrl,
		method: 'DELETE',
		data: city,
		success: function (res) {
			console.log('object :>> ', res);
		}
	})
}


module.exports = {
  setCityInfo: setCityInfo,
  deleteCityInfo: deleteCityInfo
}