const { cargoCount } = require('../../model/dataAnalysis.js');
const { unitData, shareMessage } = require('../../model/initForm.js');

var app = getApp()
Page({
  data:{
    pNo: "cargo",                       //流程的序号5为成品信息
    grids: []
  },

  setPage: function(iu){
    cargoCount(['sold', 'reserve', 'payment', 'delivering', 'delivered']).then(cSum=>{
      this.setData({
        mPage:app.mData.cargo[app.roleData.uUnit._id],
        pageData:unitData('cargo'),
        pandect:cSum
      })
    })
  },

  onReady:function(){
    this.setPage();
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: require('../../libs/allmenu.js').iMenu(3,app.roleData.wmenu[3])
    })
  },

  onPullDownRefresh: function() {
    this.setPage();
  },

  onShareAppMessage: shareMessage
})
