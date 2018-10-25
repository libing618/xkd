//共享信息管理
import hTabClick from '../../model/util.js';
const db = wx.cloud.database();
const { checkRols } = require('../../model/initForm');
var app = getApp()
Page({
  data: {
    pNo: 'share',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    ht:{
      navTabs: app.fData.share.afamily,
      modalBtn: ['可以开始','等待订单','停止服务'],
      fLength: app.fData.share.afamily.length,
      pageCk: 0
    },
    mPage: [],
    pageData: {}
  },

  onLoad: function (options) {
    var that = this;
    if (checkRols(1,app.roleData.user)) {       //检查用户权限
      app.fData.share.afamily.forEach((afamily,i)=>{
        app.mData.share[app.roleData.uUnit._id][i].forEach(ufod=>{
          pageData[ufod] = {uName:app.aData.share[ufod].uName,thumbnail:app.aData.share[ufod].thumbnail};
          pageData[ufod].title = pageSuccess[1].p+app.aData.unfinishedorder[ufod].amount +'/'+ pageSuccess[2].p+app.aData.unfinishedorder[ufod].amount;
        })
      })
      that.setData({
        cPage: app.mData.share[app.roleData.uUnit._id],
        pageData: pageData
      });
    };
  },

  hTabClick: hTabClick,

  fRegisterShare: function({currentTarget:{id}}){
    var that = this;
    switch (id) {
      case 'fSave':
        db.collection('share')
        break;
      default:
        wx.navigateBack({ delta: 1 });
    }
  }

})
