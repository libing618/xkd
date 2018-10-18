// components/map-select-unit/map=select-unit.js
var modalBehavior = require('../utils/poplib.js');
const db = wx.cloud.database();
const _ = db.command;
var app = getApp();
const qqmap_wx = require('../utils/qqmap-wx-jssdk.min.js');   //微信地图
var QQMapWX = new qqmap_wx({ key: '6JIBZ-CWPW4-SLJUB-DPPNI-4TWIZ-Q4FWY' });   //开发密钥（key）
Component({
  behaviors: [modalBehavior],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    value: {
      type: String,
      value: '请输入地址',
    },
    name: {
      type: String,
      value: 'thumbnail',
    },
    indTypes: {
      type: Number,
      value: 620406
    },
    code: {
      type: Number,
      value: 11000,
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    location: { latitude: 23, longitude: 113 },
  },
  methods: {
    mapSelectUnit: function (e) {      //地图选择单位弹出页
      let that = this;
      let newPage={
        Height: app.sysinfo.windowHeight-300,
        scale: 16,
        sId: 0,
        markers:[],
        unitArray: [],
        reqProIsSuperior: typeof that.data.indTypes == 'number',
        selIndtypes:[]
      };
      if ( newPage.reqProIsSuperior ) {
        newPage.selIndtypes.push(that.data.indTypes);
        wx.showToast({title:'选择服务单位，请注意：选定后不能更改！',icon: 'none'});
      } else {newPage.selIndtypes=that.data.indTypes}
      wx.getLocation({
        type: 'gcj02',//'wgs84',
        success: function(res){
          let points = [{ latitude: res.latitude, longitude: res.longitude }]
          db.collection('_Role').where({'indType.code': _.in(that.data.indTypes)}).get().then( ({data})=> {
            if (data.length>0) {
              let resJSON,badd,inInd;
              data.forEach((resJSON,i)=>{
                inInd = false;     //先假设单位的类型不在查找范围内
                newPage.selIndtypes.forEach(indType=>{
                  if (resJSON.indType.code.indexOf(indType) >= 0) { inInd = true }
                })
                if (inInd) {
                  newPage.markers.push({
                    id:i,
                    latitude:resJSON.aGeoPoint.latitude,
                    longitude:resJSON.aGeoPoint.longitude,
                    title:resJSON.nick,
                    iconPath: resJSON.afamily < 3 ? '/images/icon-personal.png' : '/images/icon-company.png',   //单位是个人还是企业
                  });
                  badd = new AV.GeoPoint(resJSON.aGeoPoint);
                  resJSON.distance = parseInt(badd.kilometersTo() * 1000 +0.5);
                  newPage.unitArray.push( resJSON );
                  points.push({ latitude: resJSON.aGeoPoint.latitude, longitude: resJSON.aGeoPoint.longitude})
                }
              });
              newPage.latitude = res.latitude;
              newPage.longitude = res.longitude;
              newPage.circles = [{
                  latitude: res.latitude,
                  longitude: res.longitude,
                  color: '#FF0000DD',
                  fillColor: '#7cb5ec88',
                  radius: 3000,
                  strokeWidth: 1
                }];
              that.setData(newPage);
              that.popModal();
              that.mapCtx = wx.createMapContext('mapSelect',that);
              that.mapCtx.includePoints({points});
            } else { wx.showToast({ title: '未发现合适单位' }) }
          }).catch( console.error );
        }
      });
    },

    fSave({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      if (this.data.reqProIsSuperior) {
        app.roleData.sUnit._id = this.data.sId;
        this.setData({value:this.data.unitArray[this.data.sId]._id});
      } else {
        this.setData({value:this.data.unitArray[this.data.sId]})
      };
      this.downModal()
    },

    mapMarker({ currentTarget:{id,dataset},detail:{value},markerId }){      //点击merkers气泡
      this.setData({sId: markerId});
    },
    moveLocation({type}){                 //移动点击
      let that = this;
      switch (type){
        case 'begin':
          that.mapCtx.moveToLocation();
          break;
        case 'end':
          that.mapCtx.getCenterLocation({
            success: (res)=>{
              that.setData({
                latitude:res.latitude,
                longitude: res.longitude
              });
            }
          });
          break;
      }
    }
  }
})
