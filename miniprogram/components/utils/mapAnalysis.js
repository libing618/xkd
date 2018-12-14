const db = wx.cloud.database();
const gscode = require('apdv.js');
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
          if (location){
            that.setData({
              latitude: location.latitude,
              longitude: location.longitude
            });
            resolve(location)
          } else {
            wx.getLocation({
              type: 'gcj02',
              success(res) {
                resolve(db.Geo.Point(res.longitude, res.latitude))
              },
              fail() { reject('获取位置失败'); }
            })
          }
        })
      }).catch(err=>{
        wx.showToast({ title: err, duration: 2500, icon: 'loading' });
        setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
      });
    },

    buildAdd: function (aGeoPoint) {                         //地理位置解析
      let that = this;
      return new Promise((resolve, reject) => {
        QQMapWX.reverseGeocoder({                    //解析地理位置
          location: { latitude: aGeoPoint.latitude, longitude: aGeoPoint.longitude },
          success: function ({ result: { ad_info, address_component, address } }) {
            that.setData({
              latitude: aGeoPoint.latitude,
              longitude: aGeoPoint.longitude
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

    calDistance: function (aGeoPoint,unitArray) {                         //地理位置解析
      let that = this;
      return new Promise((resolve, reject) => {
        let points = [],markers = []
        unitArray.forEach((resJSON,i)=>{
          markers.push({
            id:i,
            latitude: resJSON.address_aGeoPoint.latitude,
            longitude: resJSON.address_aGeoPoint.longitude,
            title:resJSON.nick,
            iconPath: resJSON.afamily < 3 ? '/images/icon-personal.png' : '/images/icon-company.png',   //单位是个人还是企业
          });
          unitArray[i].typeName = resJSON.indType.split(',').map(itype=>{return gscode[itype]}).join();
          points.push({ latitude: resJSON.address_aGeoPoint.latitude, longitude: resJSON.address_aGeoPoint.longitude})
        })
        QQMapWX.calculateDistance({                    //计算地理位置的距离
          "from": { latitude: aGeoPoint.latitude, longitude: aGeoPoint.longitude },
          "to": points,
          success: function ({ result: { elements } }) {
            if (elements.length>0){
              elements.forEach(({from,to,distance})=>{
                unitArray.forEach((ui,i)=>{
                  if (ui.address_aGeoPoint.latitude == to.lat && ui.address_aGeoPoint.longitude==to.lng){
                    unitArray[i].distance = distance
                  }
                })
              })
              points.unshift({ latitude: aGeoPoint.latitude, longitude: aGeoPoint.longitude})
              resolve({markers,unitArray,points});
            }
          }
        });
      });
    }

  }
})
