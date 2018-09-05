const db = wx.cloud.database();
import { loginAndMenu, shareMessage } from '../../model/initForm';
import { openWxLogin,tabClick } from '../../libs/util';
import { getData } from '../../model/wx_data';
const CMQ = require('../../model/cmq')
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
    app.mData.articles = require('../../test/articles').articles;
    app.aData.articles = require('../../test/articles').artdata;
    that.setData({
      statusBar: app.sysinfo.statusBarHeight,
      wWidth: app.sysinfo.windowWidth,
      mSwiper: app.mData.articles[0],
      mPage: [app.mData.articles[1], app.mData.articles[2], app.mData.articles[3]],
      pageData: app.aData.articles
    });
    console.log(db.serverDate())
    loginAndMenu(app.roleData).then( rData => {
      app.roleData = rData;
      that.data.grids = require('../../libs/allmenu.js').iMenu(0,app.roleData.wmenu[0]);
      that.data.grids[0].mIcon = app.roleData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
      that.setData({
        unAuthorize: false,
        grids: that.data.grids
      });
      if (!app.roleData.user.unitVerified){ wx.hideTabBar() };
    }).catch(loginerr=>{
      app.logData.push(loginerr);
      that.setData({
        unAuthorize: true
      });
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
    getData(true,'articles',true,{}).then(isupdated=>{ this.setPage(isupdated) });        //更新缓存以后有变化的数据
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

  onPullDownRefresh:function(){
   getData(true,'articles',false,{}).then(isupdated=>{ this.setPage(isupdated) });
  },

  onReachBottom:function(){
    getData(false,'articles',false,{}).then(isupdated=>{ this.setPage(isupdated) });
  },

  onShareAppMessage: shareMessage    // 用户点击右上角分享

})
