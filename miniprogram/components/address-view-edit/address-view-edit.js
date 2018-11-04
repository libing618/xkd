const db = wx.cloud.database();
var modalBehavior = require('../utils/poplib.js')
const qqmap_wx = require('../utils/qqmap-wx-jssdk.min.js');   //微信地图
const sysinfo = getApp().sysinfo;
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    name: {
      type: String,
      value: 'thumbnail',
    },
    value: {
      type: Object,
      value: {
        adinfo:'请输入地址',
        aGeoPoint:[113, 23],
        _id: 110000,
        post: '010001'
      }
    },
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    statusBar: sysinfo.statusBarHeight,
    windowHeight: sysinfo.windowHeight,
    address1:''
  },

  lifetimes:{
    attached(){
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
                fail() {
                  wx.showToast({ title: '请授权使用位置', duration: 2500, icon: 'loading' });
                  setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
                  reject();
                }
              })
            };
          }
        })
      }).then((vifAuth) => {
        if (vifAuth) {
          if (!that.data.value && that.data.editable){
            wx.getLocation({
              type: 'gcj02',
              success(res) {
                that.buildAdd([res.latitude,res.longitude]);
                if (that.data.editable==2){
                  that.popModal();                 //打开弹出页
                }
              },
              fail() { wx.navigateBack({ delta: 1 }) }
            })
          }
        } else {wx.navigateBack({ delta: 1 }) }
      });
    }
  },
  methods: {
    modalEditAddress: function ({ currentTarget:{id,dataset},detail:{value} }) {      //地址编辑弹出页
      if (this.data.editable){
        this.setData({address1: this.data.value.adinfo});
        this.popModal();                 //打开弹出页
      }
    },

    chooseAd: function (e) {                         //选择地理位置
      let that = this;
      wx.chooseLocation({
        success: function (res) {
          if (that.data.editable) {
            this.buildAdd([res.latitude, res.longitude])
          };
        }
      })
    },

    buildAdd: function ([latitude, longitude]) {                         //地理位置解析
      let that = this;
      let QQMapWX = new qqmap_wx({ key: '6JIBZ-CWPW4-SLJUB-DPPNI-4TWIZ-Q4FWY' });   //开发密钥（key）
      QQMapWX.reverseGeocoder({                    //解析地理位置
        location: { latitude: latitude, longitude: longitude },
        success: function ({ result: { ad_info, address_component, address } }) {
          that.data.value.adinfo = address;
          that.data.value.aGeoPoint = [res.longitude, res.latitude];
          that.data.value._id = ad_info.adcode;
          that.setData({
            address1: address,
            value: that.data.value,
            region: [address_component.province, address_component.city, address_component.district]
          });
        }
      });
    },

    fSave: function({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      this.data.value.adinfo = this.data.address1
      this.setData({ value: this.data.value });
      this.downModal();
    },

    faddclass: function({ currentTarget:{id,dataset},detail:{value,code,post} }){      //选择行政区划
      let that = this;
      that.data.value.post = post;
      that.data.value._id = code;
      that.data.value.adinfo = region[0]+region[1]+region[2];
      that.setData({
        address1: region[0]+region[1]+region[2],
        value: that.data.value
      })
    },

    raddgroup: function({ currentTarget:{id,dataset},detail:{value} }){                  //读村镇区划数据
      if (this.data.saddv != 0) {
        let db = wx.cloud.database();
        db.collection('ssq4').where({tncode: this.data.saddv}).get()
        .then(({data}) => {
          if (data.length>0){
            this.setData({dglist: data[0].tn});
          };
        }).catch( console.error );
      };
    },

    saddgroup: function({ currentTarget:{id,dataset},detail:{value} }){                  //选择村镇
      let showPage = {};
      if (this.data.adgvalue[0] == value[0]) {
        showPage.address1 = this.data.address1 + this.data.adglist[value[0]].n + this.data.adglist[value[0]].cm[value[1]].n;
      } else { value[1]=0 }
      showPage.adgvalue = value;
      that.setData(showPage);
    }
  }
})
