const { cargoCount } = require('../../model/dataAnalysis.js');

var app = getApp()
Page({
  data:{
    mPage: [],
    pNo: 'cargo',                       //成品信息
    pageData: {},
    grids: []
  },
  onLoad:function(options){
    this.setPage();
  },

  setPage: function(){
    cargoCount(['canSupply', 'cargoStock']).then(cSum=>{
      this.setData({
        pandect:cSum
      })
    })
  },

  onReady:function(){
    this.grids = require('../../libs/allmenu.js').iMenu(2,app.roleData.wmenu[2]);
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: this.grids
    })
  },

  onPullDownRefresh: function() {
    this.setPage();
  },

  onShareAppMessage: require('../../model/initForm').shareMessage
})
