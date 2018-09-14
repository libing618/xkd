const { getData } = require('../../model/wx_data');
const { unitData } = require('../../model/initForm.js');
const { cargoSum,integration } = require('../../model/dataAnalysis.js');
const {indexClick} = require('../../libs/util.js');

var app = getApp()
Page({
  data:{
    mPage: [],
    pNo: 'cargo',                       //成品信息
    pageData: {},
    iClicked: '0',
    mSum: {},
    grids: []
  },
  onLoad:function(options){
    this.setPage(app.mData.product[app.roleData.uUnit._id]);
  },

  setPage: function(iu){
    if (iu){
      cargoSum(['canSupply', 'cargoStock']).then(cSum=>{
        this.setData({
          mPage:app.mData.product[app.roleData.uUnit._id],
          pageData:unitData('product'),
          cargo:unitData('cargo'),
          pandect:cSum.rSum,
          mSum: cSum.mSum
        })
      })
    }
  },

  onReady:function(){
    var that = this;
    integration("product", "cargo",app.roleData.uUnit._id).then(isupdated=>{this.setPage(isupdated)});
    this.grids = require('../../libs/allmenu.js').iMenu(2,app.roleData.wmenu[2]);
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: this.grids
    })
  },

  indexClick:indexClick,

  onPullDownRefresh: function() {
    getData(true,'cargo').then(isupdated=>{ this.setPage(isupdated) });
  },
  onReachBottom: function() {
    getData(false,'cargo').then(isupdated=>{ this.setPage(isupdated) });
  },
  onShareAppMessage: require('../../model/initForm').shareMessage
})
