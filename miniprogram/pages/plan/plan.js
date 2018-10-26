import {iMenu} from '../../model/allmenu.js'
import {shareMessage} from '../../model/initForm';
const db = wx.cloud.database();
var app = getApp();
Page({
  data:{
    mPage: [],
    pNo: 'goods',                       //商品信息
    pageData: {},
    grids: []
  },

  setPage: function(){
    db.collection('goods').where({unitId:app.roleData.user.unit}).count().then(({total})=>{
      this.setData({pandect:total})
    })
  },

  onReady: function(){
    this.setPage();              //更新缓存以后有变化的数据
    this.grids = iMenu(1,app.roleData.wmenu[1]);
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      wWidth: app.sysinfo.windowWidth,
      grids: this.grids
    })
  },

  onPullDownRefresh:function(){
    this.setPage()
  },

  onShareAppMessage: shareMessage
})
