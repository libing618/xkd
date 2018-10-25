//通讯录
import indexClick from '../../model/util.js';
const app=getApp();
Page({
  data:{
    vData:[],
    statusBar: app.sysinfo.statusBarHeight,
    navBarTitle: app.roleData.uUnit.nick+'的通讯录',
    iClicked: '0'
  },
  onLoad:function(options){
    this.setData({vData:[app.roleData.uUnit,app.roleData.sUnit]});
    this.indexClick = indexClick;
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})
