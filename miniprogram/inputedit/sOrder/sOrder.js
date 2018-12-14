//共享信息管理
import {checkRols,shareMessage} from '../../modules/initForm';
var app = getApp()
Page({
  data: {
    pNo: 'share',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    mPage: [],
    pageData: {}
  },

  onLoad: function (options) {
    checkRols(0,app.roleData.user)     //负责人或综合条线员工
  },
  onShareAppMessage: shareMessage
})
