const db = wx.cloud.database();
const { loginAndMenu, shareMessage } = require('../../model/initForm') ;
const { openWxLogin, tabClick } = require('../../libs/util');

var app = getApp();

Page({
  data: {
    autoplay: true,
    scrollTop : 0,
    pNo: 'articles',                       //文章类信息
    fLength:3,
    pageCk:1,
    tabs: ["品牌建设", "政策扶持", "我的商圈"]
  },

  onLoad: function () {
    var that = this;
    app.mData.articles0 = require('../../test/articles').articles0;
    app.mData.articles1 = require('../../test/articles').articles1;
    app.mData.articles2 = require('../../test/articles').articles2;
    app.mData.articles3 = require('../../test/articles').articles3;
    app.aData.articles = require('../../test/articles').artdata;
    that.setData({
      statusBar: app.sysinfo.statusBarHeight,
      wWidth: app.sysinfo.windowWidth,
      mSwiper: app.mData.articles0,
      mPage: [app.mData.articles1, app.mData.articles2, app.mData.articles3],
      pageData: app.aData.articles,
      pageCk: app.mData.pCkarticles
    });
    loginAndMenu(app.roleData).then( rData => {
      app.roleData = rData;
      that.data.grids = require('../../libs/allmenu.js').iMenu(0,app.roleData.wmenu[0]);
      that.data.grids[0].mIcon = app.roleData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
      that.setData({
        unAuthorize: false,
        grids: that.data.grids
      });
      if (app.roleData.user.line==9){ wx.hideTabBar() };
    }).catch(loginerr=>{
      app.logData.push(loginerr);
      that.setData({
        unAuthorize: true
      });
    });
  },

  userInfoHandler: function (e) {
    var that = this;
    openWxLogin().then( mstate=> {
      app.roleData = mstate;
      app.logData.push([Date.now(), '用户授权' + app.sysinfo.toString()]);                      //用户授权时间记入日志
      let grids = require('../libs/allmenu.js').iMenu(0,app.roleData.wmenu[0]);
      grids[0].mIcon=app.roleData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
      that.setData({ unAuthorize: false, grids: grids })
    }).catch( console.error );
  },

  tabClick: tabClick,

  onShareAppMessage: shareMessage    // 用户点击右上角分享

})
