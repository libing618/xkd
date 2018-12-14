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
    let grids;
    wx.hideTabBar();
    app.aIndex.banner = require('../../test/articles').banner;
    app.aIndex.articles = require('../../test/articles').articles;
    Object.assign(app.aData, require('../../test/articles').artdata);
    that.banner = new getData('banner');
    that.articles = []
    for (let i = 0; i < 3; i++) { that.articles.push(new getData('articles', i)) };
    return new Promise((resolve,reject)=>{
      wx.getStorage({
        key: 'roleData',
        success: function (res) {
          resolve(res.data);
        },
        fail: ()=>{
          resolve(false)
        }
      })
    }).then(stoRole=>{
      return new Promise((resolve, reject) => {
        if (stoRole){app.roleData=stoRole};
        grids = iMenu(0,app.roleData.wmenu[0]);
        grids[0].mIcon = app.roleData.user.avatarUrl;
        that.setData({
          statusBar: app.sysinfo.statusBarHeight,
          wWidth: app.sysinfo.windowWidth / 3,                      //每个nav宽度
          mSwiper: that.banner.aIndex,
          mPage: that.articles.map(a=>{return a.aIndex}),
          pageData: app.aData,
          grids: grids,
          pageCk: app.aIndex.pCkarticles
        },resolve(true));
      })
      }).then(() => {
        loginAndMenu(app.roleData).then(rData => {
          let succPage = { unAuthorize: false }
          if (app.roleData.wmenu[0].toString() != rData.wmenu[0].toString()) {
            succPage.grids = iMenu(0, rData.wmenu[0]);
            succPage.grids[0].mIcon = rData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
          };
          app.roleData = rData;
          that.setData(succPage);
          if (app.roleData.user.line != 9) { wx.showTabBar() };
      })
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

  onPullDownRefresh: function () {
    this.articles[this.data.pageCk].upData().then(aSetData={
      if (aSetData) {addViewData(aSetData,'mPage['+this.data.pageCk+']',this.articles[this.data.pageCk].aIndex)}
    });
  },

  onReachBottom: function () {
    this.articles[this.data.pageCk].downData().then(aSetData={
      if (aSetData) {addViewData(aSetData,'mPage['+this.data.pageCk+']',this.articles[this.data.pageCk].aIndex)}
    });
  },

  onShareAppMessage: shareMessage    // 用户点击右上角分享

})
