const { getData,getAllData } = require('../../model/wx_data');
const { cargoCount } = require('../../model/dataAnalysis.js');
const { unitData, shareMessage } = require('../../model/initForm.js');

var app = getApp()
Page({
  data:{
    pNo: "cargo",                       //流程的序号5为成品信息
    grids: []
  },
  onLoad:function(options){
    this.setPage(app.mData.cargo[app.roleData.uUnit._id]);
  },

  setPage: function(iu){
    if (iu){
      cargoCount(['sold', 'reserve', 'payment', 'delivering', 'delivered']).then(cSum=>{
        this.setData({
          mPage:app.mData.cargo[app.roleData.uUnit._id],
          pageData:unitData('cargo'),
          pandect:cSum
        })
      })
    }
  },

  onReady:function(){
    getData(true, "cargo",app.roleData.uUnit._id).then(isupdated=>{ this.setPage(isupdated) });
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: require('../../libs/allmenu.js').iMenu(3,app.roleData.wmenu[3])
    })
  },

  onPullDownRefresh: function() {
    getData(true,'cargo').then(isupdated=>{ this.setPage(isupdated) });
  },
  onReachBottom: function() {
    getData(false,'cargo').then(isupdated=>{ this.setPage(isupdated) });
  },
  onShareAppMessage: shareMessage
})
