//共享信息管理
const AV = require('../../libs/leancloud-storage.js');
const { checkRols } = require('../../model/initForm');
const { initupdate } = require('../../model/initupdate');
const {f_modalRecordView} = require('../../model/controlModal');
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
    pageData: {},
    sPages: [{
      pageName: 'tabPanel'
    }],
    showModalBox: false,
    animationData: {},
    vData: {},
    iFormat:app.fData.share.pSuccess
  },

  onLoad: function (options) {
    var that = this;
    if (checkRols(1,app.roleData.user)) {       //单位名等于用户ID则为创始人
      updateData(true,'share').then(()=>{
        let pageData = {};
        app.fData.share.afamily.forEach((afamily,i)=>{
          app.mData.share[app.roleData.uUnit.objectId][i].forEach(ufod=>{
            pageData[ufod] = {uName:app.aData.share[ufod].uName,thumbnail:app.aData.share[ufod].thumbnail};
            pageData[ufod].title = pageSuccess[1].p+app.aData.unfinishedorder[ufod].amount +'/'+ pageSuccess[2].p+app.aData.unfinishedorder[ufod].amount;
          })
        })
        that.setData({
          cPage: app.mData.share[app.roleData.uUnit.objectId],
          pageData: pageData
        });
      }).catch( console.error );
    };
  },

  hTabClick: require('../../libs/util').hTabClick,

  f_modalSwitchBox: function ({ currentTarget:{id,dataset} }) {            //切换选择弹出页
    var that = this;
    let hidePage = {};
    switch (id) {
      case 'fSwitch':                  //确认切换到下一数组并返回
        let arrNext = (that.data.ht.pageCk + 1) == that.data.ht.fLength ? 0 : (that.data.ht.pageCk + 1);
        AV.Object.createWithoutData('share',that.data.modalId).set('afamily',arrNext).save().then(()=>{
          that.data.cPage[arrNext].push(that.data.modalId);
          let oldNo = that.data.cPage[that.data.ht.pageCk].indexOf(that.data.modalId);
          that.data.cPage[that.data.ht.pageCk].splice(oldNo, 1);
          hidePage.cPage = that.data.cPage;
          downModal(that,hidePage)
        });
        break;
      case 'fBack':                  //返回
        downModal(that,hidePage);
        break;
      default:                  //打开弹出页
        that.data.sPages.push({
          pageName: 'modalSwitchBox',
          targetId: id,
          smtName: that.data.ht.modalBtn[that.data.ht.pageCk]
        });
        that.setData({
          sPages: that.data.sPages
        });
        popModal(that)
        break;
    }
  },

  fRegisterShare: function({currentTarget:{id}}){
    var that = this;
    switch (id) {
      case 'fSave':
        updateData(true,'asset').then(()=>{
          let services = new Set();
          app.mData.asset[app.roleData.uUnit.objectId].forEach(asId=>{
            services.add(app.aData.asset[asId].manageParty)
          });
          return new Promise.all(services.map(suId=>{ return updateData(true,'service'),suId})).then(()=>{
            that.data.iFormat = that.data.iFormat.map(req=>{
              if (req.t=='sId') {
                req.maData = app.mData[req.gname][app.roleData.uUnit.objectId].map(mId=>{
                  return {
                      objectId: mId, sName: app.aData[req.gname][mId].uName + ':  ' + app.aData[req.gname][mId].title }
                  });
                req.mn = 0;
              };
              return req
            });

            that.setData({iFormat:that.data.iFormat})
          })
        })
        break;
      default:
        wx.navigateBack({ delta: 1 });
    }
  }

})
