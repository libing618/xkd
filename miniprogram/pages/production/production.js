const { unitData } = require('../../model/initForm.js');
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
    this.setPage(app.mData.cargo[app.roleData.uUnit._id]);
  },

  setPage: function(){
    cargoCount(['canSupply', 'cargoStock']).then(cSum=>{
      this.setData({
        mPage:app.mData.cargo[app.roleData.uUnit._id],
        pageData:unitData('cargo'),
        pandect:cSum
      })
    })
  },

  onReady:function(){
    var that = this;
    this.setPage();
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
