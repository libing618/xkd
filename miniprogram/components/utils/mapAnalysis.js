const qqmap_wx = require('qqmap-wx-jssdk.min.js');   //微信地图
var QQMapWX = new qqmap_wx({ key: '6JIBZ-CWPW4-SLJUB-DPPNI-4TWIZ-Q4FWY' });   //开发密钥（key）
module.exports = Behavior({
  data: {
    latitude: 23,
    longitude: 113
  },
  methods: {
    authorizeLocation(location) {
      let that = this;
      return new Promise((resolve, reject) => {
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userLocation']) {                   //用户已经同意小程序使用用户地理位置
              resolve(true)
            } else {
              wx.authorize({
                scope: 'scope.userLocation',
                success() { resolve(true) },
                fail() { reject('请授权使用位置'); }
              })
            };
          }
        })
      }).then(() => {
        return new Promise((resolve, reject) => {
          if (location.length==0){
            wx.getLocation({
              type: 'gcj02',
              success(res) {
                resolve([res.latitude,res.longitude])
              },
              fail() { reject('获取位置失败'); }
            })
          } else {
            that.setData({
              latitude: location[0],
              longitude: location[1]
            });
            resolve(location)
          }
        })
      }).catch(err=>{
        wx.showToast({ title: err, duration: 2500, icon: 'loading' });
        setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
      });
    },

    buildAdd: function ([latitude, longitude]) {                         //地理位置解析
      let that = this;
      return new Promise((resolve, reject) => {
        QQMapWX.reverseGeocoder({                    //解析地理位置
          location: { latitude: latitude, longitude: longitude },
          success: function ({ result: { ad_info, address_component, address } }) {
            that.setData({
              latitude: latitude,
              longitude: longitude
            });
            resolve({
              address: address,
              code: ad_info.adcode,
              region: [address_component.province, address_component.city, address_component.district]
            });
          }
        });
      });
    },

    calDistance: function ([latitude, longitude],unitArray) {                         //地理位置解析
      let that = this;
      return new Promise((resolve, reject) => {
        let points = [],markers = []
        unitArray.forEach((resJSON,i)=>{
          markers.push({
            id:i,
            latitude:resJSON.aGeoPoint[0],
            longitude:resJSON.aGeoPoint[1],
            title:resJSON.nick,
            iconPath: resJSON.afamily < 3 ? '/images/icon-personal.png' : '/images/icon-company.png',   //单位是个人还是企业
          });
          points.push({ latitude: resJSON.aGeoPoint[0], longitude: resJSON.aGeoPoint[1]})
        })
        QQMapWX.calculateDistance({                    //计算地理位置的距离
          from: { latitude: latitude, longitude: longitude },
          to: points,
          success: function ({ result: { elements } }) {
            if (elements.length>0){
              elements.forEach(({from,to,distance})=>{
                unitArray.forEach((ui,i)=>{
                  if (ui.aGeoPoint[0]==to.lat && ui.aGeoPoint[1]==to.lng){
                    unitArray[i].distance = distance
                  }
                })
              })
              points.unshift({latitude: latitude, longitude: longitude})
              resolve({markers,unitArray,points});
            }
          }
        });
      });
    }

  }
})
