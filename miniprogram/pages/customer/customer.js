import {iMenu} from '../../modules/allmenu.js'
import {shareMessage} from '../../modules/initForm';
import { cargoCount } from '../../modules/dataAnalysis.js';

var app = getApp()
Page({
  data:{
    pNo: "cargo",                       //流程的序号5为成品信息
    grids: []
  },

  setPage: function(iu){
    cargoCount(['sold', 'reserve', 'payment', 'delivering', 'delivered']).then(cSum=>{
      this.setData({
        pandect:cSum
      })
    })
  },

  onReady:function(){
    this.setPage();
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: iMenu(3,app.roleData.wmenu[3])
    })
  },

  onPullDownRefresh: function() {
    this.setPage();
  },

  onShareAppMessage: shareMessage
})
