import {iMenu} from '../../modules/allmenu.js'
import {shareMessage} from '../../modules/initForm';
import { cargoCount } from '../../modules/dataAnalysis.js';

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
    this.grids = iMenu(2,app.roleData.wmenu[2]);
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: this.grids
    })
  },

  onPullDownRefresh: function() {
    this.setPage();
  },

  onShareAppMessage: shareMessage
})
