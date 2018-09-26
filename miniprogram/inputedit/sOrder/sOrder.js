//共享信息管理
const { checkRols } =  require('../../model/initForm');
const {f_modalRecordView} = require('../../model/controlModal');

var app = getApp()
Page({
  data: {
    pNo: 'share',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    mPage: [],
    pageData: {},
    sPages: [{
      pageName: 'tabPanel'
    }],
    showModalBox: false,
    animationData: {},
    vFormat:app.fData.share.pSuccess
  },

  onLoad: function (options) {
    checkRols(0,app.roleData.user)     //负责人或综合条线员工
  },

})
