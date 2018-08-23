const AV = require('../../libs/leancloud-storage.js');
const { loginAndMenu, shareMessage } = require('../../model/initForm');
const { openWxLogin } = require('../../libs/util');
import { updateData } from '../../model/initupdate'
var app = getApp();

Page({
  data: {
    autoplay: true,
    scrollTop : 0,
    pNo: 'articles',                       //文章类信息
    fLength:3,
    tabs: ["品牌建设", "政策扶持", "我的商圈"],
    pageCk: app.mData.pCk1
  },

  onLoad: function () {
    var that = this;
    loginAndMenu(AV.User.current(), app.roleData).then( rData => {
      app.roleData = rData;
      that.data.grids = require('../../libs/allmenu.js').iMenu(app.roleData.wmenu.manage, 'manage');
      that.data.grids[0].mIcon = app.roleData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
      that.setData({
        statusBar: app.sysinfo.statusBarHeight,
        wWidth: app.sysinfo.windowWidth,
        grids: that.data.grids,
        unAuthorize: app.roleData.user.objectId == '0',
        mSwiper: app.mData.articles[0],
        mPage: [app.mData.articles[1], app.mData.articles[2], app.mData.articles[3]],
        pageData: app.aData.articles
      });
      if (!app.roleData.user.emailVerified){ wx.hideTabBar() };
    });
  },

  setPage: function(iu){
    if (iu){
      this.setData({
        mSwiper: app.mData.articles[0],
        mPage:[app.mData.articles[1],app.mData.articles[2],app.mData.articles[3]],
        pageData:app.aData.articles
      })
    }
  },

  onReady: function(){
    updateData(true,'articles').then(isupdated=>{ this.setPage(isupdated) });        //更新缓存以后有变化的数据
  },

  userInfoHandler: function (e) {
    var that = this;
    openWxLogin(app.roleData).then( mstate=> {
      app.roleData = mstate;
      app.logData.push([Date.now(), '用户授权' + app.sysinfo.toString()]);                      //用户授权时间记入日志
      that.grids = require('../libs/allmenu.js').iMenu(app.roleData.wmenu.manage,'manage');
      that.grids[0].mIcon=app.roleData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
      that.setData({ unAuthorize: false, grids: that.grids })
    }).catch( console.error );
  },

  tabClick: require('../../model/initupdate').tabClick,

  onPullDownRefresh:function(){
   updateData(true,'articles').then(isupdated=>{ this.setPage(isupdated) });
  },

  onReachBottom:function(){
    updateData(false,'articles').then(isupdated=>{ this.setPage(isupdated) });
  },

  onShareAppMessage: shareMessage    // 用户点击右上角分享

})
