const { getData } = require('../../model/wx_data');
const { cargoSum,integration } = require('../../model/dataAnalysis.js');
const { unitData, shareMessage } = require('../../model/initForm.js');
const {indexClick} = require('../../libs/util.js');

var app = getApp()
Page({
  data:{
    pNo: "cargo",                       //流程的序号5为成品信息
    iClicked: '0',
    grids: []
  },
  onLoad:function(options){
    this.setPage(app.mData.product[app.roleData.uUnit.objectId]);

  },

  setPage: function(iu){
    if (iu){
      cargoSum(['sold', 'reserve', 'payment', 'delivering', 'delivered']).then(cSum=>{
        this.setData({
          mPage:app.mData.product[app.roleData.uUnit.objectId],
          pageData:unitData('product'),
          cargo:unitData('cargo'),
          pandect:cSum.rSum,
          mSum: cSum.mSum
        })
      })
    }
  },

  onReady:function(){
    integration("product", "cargo",app.roleData.uUnit.objectId).then(isupdated=>{ this.setPage(isupdated) });
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: require('../../libs/allmenu.js').iMenu(3,app.roleData.wmenu[3])
    })
  },

  indexClick:indexClick,

  onPullDownRefresh: function() {
    getData(true,'cargo').then(isupdated=>{ this.setPage(isupdated) });
  },
  onReachBottom: function() {
    getData(false,'cargo').then(isupdated=>{ this.setPage(isupdated) });
  },
  onShareAppMessage: shareMessage
})
