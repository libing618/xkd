const { getData } = require('../../model/wx_data');
const { integration } = require('../../model/dataAnalysis');
const { unitData } = require('../../model/initForm.js');
var app = getApp();
Page({
  data:{
    mPage: [],
    pNo: 'goods',                       //商品信息
    pageData: {},

    grids: []
  },
  onLoad:function(options){    // 生命周期函数--监听页面加载
    this.setData({

    })
    this.setPage(app.mData.goods[app.roleData.uUnit._id]);
  },

  setPage: function(iu){
    if (iu){
      this.setData({
        mPage:app.mData.goods[app.roleData.uUnit._id],
        pageData:unitData('goods'),
        pandect:[app.mData.goods[app.roleData.uUnit._id].length,app.mData.specs[app.roleData.uUnit._id].length]
      })
    }
  },

  onReady: function(){
    integration('goods','specs',app.roleData.uUnit._id).then((isupdated)=>{ this.setPage(isupdated) });              //更新缓存以后有变化的数据
    this.grids = require('../../libs/allmenu.js').iMenu(1,app.roleData.wmenu[1]);
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      wWidth: app.sysinfo.windowWidth,
      grids: this.grids
    })
  },

  onPullDownRefresh:function(){
    getData(true,'goods').then(isupdated=>{ this.setPage(isupdated) });
  },

  onReachBottom:function(){
    getData(false,'goods').then(isupdated=>{ this.setPage(isupdated) });
  },

  onShareAppMessage: require('../../model/initForm').shareMessage
})
