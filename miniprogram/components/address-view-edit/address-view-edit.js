const db = wx.cloud.database();
var modalBehavior = require('../utils/poplib.js')
var mapBahavior = require('../utils/mapAnalysis.js');   //位置授权及解析

Component({
  behaviors: [modalBehavior,mapBahavior,'wx://form-field'],
  properties: {
    name: {
      type: String,
      value: 'thumbnail',
    },
    value: {
      type: Object,
      value: {
        _id:'请输入地址',
        aGeoPoint:[113, 23],
        code: 110000
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
    address1:''
  },

  lifetimes:{
    attached(){
      let that = this;
      let location=[],noAdd=true;
      if (that.data.value) {
        noAdd = false;
        if('aGeoPoint' in that.data.value){
          location = that.data.value.aGeoPoint;
        }
      }
      that.authorizeLocation(location).then(aGeoPoint => {
        if (that.data.editable && noAdd){
          that.buildAdd(aGeoPoint).then(addGroup=>{
            that.setData({
              address1: addGroup.address,
              'value._id': addGroup.address,
              'value.code': addGroup.code,
              'value.aGeoPoint': aGeoPoint,
              region: addGroup.region
            });
          });
        };
        if (that.data.editable==2){
          that.popModal();                 //打开弹出页
        }
      });
    }
  },
  methods: {
    modalEditAddress: function ({ currentTarget:{id,dataset},detail:{value} }) {      //地址编辑弹出页
      if (this.data.editable){
        this.setData({address1: this.data.value._id});
        this.popModal();                 //打开弹出页
      }
    },

    chooseAd: function (e) {                         //选择地理位置
      let that = this;
      wx.chooseLocation({
        success: function (res) {
          if (that.data.editable) {
            that.buildAdd(db.Geo.Point(res.longitude,res.latitude)).then(addGroup=>{
              that.setData({
                address1: addGroup.address,
                'value._id': addGroup.address,
                'value.code': addGroup.code,
                'value.aGeoPoint': db.Geo.Point(res.longitude,res.latitude),
                region: addGroup.region
              });
            })
          };
        }
      })
    },

    fSave: function({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      this.data.value._id = this.data.address1
      this.setData({ value: this.data.value });
      this.downModal();
    },

    faddclass: function({ currentTarget:{id,dataset},detail:{value,code} }){      //选择行政区划
      let that = this;
      that.data.value.code = code;
      that.data.value._id = region[0]+region[1]+region[2];
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
