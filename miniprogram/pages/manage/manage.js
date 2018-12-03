import {iMenu} from '../../modules/allmenu.js';
import {tabClick,addViewData} from '../../modules/util.js';
import { loginAndMenu, shareMessage } from '../../modules/initForm';
import { openWxLogin } from '../../modules/wxcloudcf';
import {getData} from '../../modules/db-get-data';
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
    app.aIndex.banner = require('../../test/articles').banner;
    app.aIndex.articles = require('../../test/articles').articles;
    Object.assign(app.aData, require('../../test/articles').artdata);
    that.setData({
      statusBar: app.sysinfo.statusBarHeight,
      wWidth: app.sysinfo.windowWidth / 3,                      //每个nav宽度
      mSwiper: app.aIndex.banner,
      mPage: app.aIndex.articles,
      pageData: app.aData,
      pageCk: app.aIndex.pCkarticles
    });
    that.banner = new getData('banner');
    that.articles = []
    for (let i=0;i<3;i++){ that.articles.push(new getData('articles',i)) };
    loginAndMenu(app.roleData).then( rData => {
      app.roleData = rData;
      iMenu(0, rData.wmenu[0]).then(grids =>{
        grids[0].mIcon = rData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
        that.setData({
          unAuthorize: false,
          grids: grids
        });
      });
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
