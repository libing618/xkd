//客户评价及统计
const {checkRols} =  require('../../model/initForm');
var app = getApp();
Page({
  data:{
    mPage: [],                 //页面管理数组
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    pageData: []
  },
  onLoad:function(options){          //参数oState为0客户评价1评价统计
    var that = this;
    if (checkRols(3,app.roleData.user)){  //检查用户操作权限

      wx.setNavigationBarTitle({
        title: app.roleData.uUnit.nick+'的'+ options.oState ? '评价统计' : '客户评价'
      })
    }
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
