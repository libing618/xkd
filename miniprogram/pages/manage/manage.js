import {iMenu} from '../../modules/allmenu.js';
import {tabClick} from '../../modules/util.js';
import { loginAndMenu, shareMessage } from '../../modules/initForm';
import { openWxLogin } from '../../modules/wxcloudcf';
var app = getApp();

Page({
  data: {
    autoplay: true,
    pNo: 'articles',                       //文章类信息
    fLength: 4,                       //nav文字数
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
      wWidth: app.sysinfo.windowWidth / 3,                      //每个nav宽度
      mSwiper: app.mData.articles0,
      mPage: [app.mData.articles1, app.mData.articles2, app.mData.articles3],
      pageData: app.aData.articles,
      pageCk: app.mData.pCkarticles
    });
    loginAndMenu(app.roleData).then( rData => {
      app.roleData = rData;
      iMenu(0, rData.wmenu[0]).then(grids =>{
        grids[0].mIcon = rData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
        that.setData({
          unAuthorize: false,
          grids: grids
        });
      })
      if (app.roleData.user.line==9){ wx.hideTabBar() };
    }).catch(loginerr=>{
      app.logData.push([Date.now(),JSON.stringify(loginerr)]);
      that.setData({
        unAuthorize: true
      });
    });
  },

  userInfoHandler: function (e) {
    var that = this;
    openWxLogin().then( mstate=> {
      app.roleData = mstate;
      app.logData.push([Date.now(), '用户授权' + JSON.stringify(app.sysinfo)]);                      //用户授权时间记入日志
      let grids = iMenu(0,app.roleData.wmenu[0]);
      grids[0].mIcon=app.roleData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
      that.setData({ unAuthorize: false, grids: grids })
    }).catch( console.error );
  },

  tabClick: tabClick,

  onShareAppMessage: shareMessage    // 用户点击右上角分享

})
