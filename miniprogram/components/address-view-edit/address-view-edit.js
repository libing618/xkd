// components/edit-address/edit-address.js
var modalBehavior = require('../utils/poplib.js')
const qqmap_wx = require('../utils/qqmap-wx-jssdk.min.js');   //微信地图
var QQMapWX = new qqmap_wx({ key: '6JIBZ-CWPW4-SLJUB-DPPNI-4TWIZ-Q4FWY' });   //开发密钥（key）
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    c: {
      type: Object,
      value: {
        address:'请输入地址',
        location:{latitude: 23, longitude:113},
        code: 110000,
        post: '010001'
      }
    },
    editen: {
      type: Boolean,
      value: false,
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    animationData: {},
    showModalBox: false
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
          wx.getLocation({
            type: 'wgs84',
            success(res) {
              QQMapWX.reverseGeocoder({
                location: { latitude: res.latitude, longitude: res.longitude },
                success: function ({ result: { ad_info, address_component,address } }) {
                  that.data.c.address = address;
                  that.data.c.location = { latitude: res.latitude, longitude: res.longitude };
                  that.data.c.code = ad_info.adcode;
                  that.setData({
                    c: that.data.c,
                    region:[address_component.province,address_component.city,address_component.district]
                  });
                }
              });
            },
            fail() { wx.navigateBack({ delta: 1 }) }
          })
        } else {wx.navigateBack({ delta: 1 }) }
      });
    }
  },
  methods: {
    modalEditAddress: function ({ currentTarget:{id,dataset},detail:{value} }) {      //地址编辑弹出页
      this.setData({address1: this.data.c.address
        // adclist: require('addresclass.js'),   //读取行政区划分类数据
        // adglist: [],
        // saddv: 0,
        // adcvalue: [3, 9, 15],
        // adgvalue: [0, 0]
      });
      this.popModal();                 //打开弹出页
    },

    chooseAd: function (e) {                         //选择地理位置
      let that = this;
      wx.chooseLocation({
        success: function (res) {
          QQMapWX.reverseGeocoder({                    //解析地理位置
            location: { latitude: res.latitude, longitude: res.longitude },
            success: function ({ result: { ad_info, address_component,address } }) {
              that.data.c.address = address;
              that.data.c.location = { latitude: res.latitude, longitude: res.longitude };
              that.data.c.code = ad_info.adcode;
              that.setData({
                c: that.data.c,
                region:[address_component.province,address_component.city,address_component.district]
              });
            }
          });
        }
      })
    },

    fSave: function({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      this.data.c.address = this.data.address1
      this.setData({ value: this.data.c, c: this.data.c });
      this.downModal()
    },

    faddclass: function({ currentTarget:{id,dataset},detail:{value,code,postcode} }){              //选择行政区划
      let that = this;
      that.data.c.postcode = postcode;
      that.data.c.code = code;
      that.data.c.address = region[0]+region[1]+region[2];
      that.setData({
        address1: region[0]+region[1]+region[2],
        c: that.data.c
      })
      //let showPage={};
      // if (this.data.adcvalue[0] == value[0]){
      //   if (this.data.adcvalue[1] == value[1]) {
      //     showPage.saddv = this.data.adclist[value[0]].st[value[1]].ct[value[2]].c;
      //     showPage.address1 = this.data.adclist[value[0]].n + this.data.adclist[value[0]].st[value[1]].n + this.data.adclist[value[0]].st[value[1]].ct[value[2]].n;
      //   } else { value[2]=0 }
      // } else { value[1]=0 }
      // showPage.adcvalue = value;
      // this.setData(showPage);
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
      let showPage = {adgvalue: value};
      if (this.data.adgvalue[0] == value[0]) {
        showPage.address1 = this.data.address1 + this.data.adglist[value[0]].n + this.data.adglist[value[0]].cm[value[1]].n;
      }
      that.setData(showPage);
    }
  }
})
