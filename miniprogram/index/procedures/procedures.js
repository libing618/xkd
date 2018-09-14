//审批流程列表
const db = wx.cloud.database();
const { hTabClick } = require('../../libs/util.js');
var app = getApp();

Page({
  data:{
    pClassName: {},
    wWidth: app.sysinfo.windowWidth,
    statusBar: app.sysinfo.statusBarHeight,
    ht: {
      navTabs: ['待我审', '我已审', '已发布'],
      fLength: 3,
      pageCk: 0
    },
    pageData: {},
    indexPage: [[],[],[]],
    anClicked: app.mData.proceduresCk
  },

  onLoad:function(options){
    let procedure,userRole=app.roleData.user.ling+''+app.roleData.user.position;
    this.data.pClassName = [];
    for (procedure in app.fData) {
      this.data.pClassName.push({id:procedure,pName:app.fData[procedure].pName});
      if (!app.mData.procedures[procedure]) {
        app.mData.procedures[procedure]=[];
        app.mData.proceduresAt[procedure]=[new Date(0),new Date(0)];
      }
    };

    this.setData({
      pClassName: this.data.pClassName,
      indexPage: app.mData.prodessing,
      procedures:app.mData.procedures,
      anClicked: app.mData.proceduresCk,
      pageData: app.procedures
    });
  },

  onReady: function(){
    wx.setNavigationBarTitle({
      title: app.roleData.uUnit.nick+'的审批流程' ,
    })
  },

  hTabClick: hTabClick,

  anClick: function(e){                           //选择审批流程类型
    app.mData.proceduresCk = e.currentTarget.id;
    this.setData({ anClicked: app.mData.proceduresCk });
  },

  updatepending: function(isDown,nProcess){   //更新数据(true上拉刷新，false下拉刷新)
    var that=this;
    wx.cloud.callFunction({
      name:'prosess',
      data:{
       sData:{
         pName: app.mData.proceduresCk,
         rDate: nProcess==3 ? app.mData.proceduresAt[app.mData.proceduresCk] : app.mData.processingAt[nProcess],
         isDown: isDown ? 'asc' : 'desc'
       },
       processState: nProcess    //类型(0待我审,1处理中,2已结束)
      }
    }).then(({result}) => {
      let lena = result.records.length ;
      if (lena>0){
        let aprove = {},uSetData = {}, aPlace = -1;
        if (isDown) {                     //下拉刷新
          app.mData.processingAt[1] = result.records[lena-1].updatedAt;                          //更新本地最新时间
          app.mData.processingAt[0] = result.records[0].updatedAt;                 //更新本地最后更新时间
        } else {
          app.mData.processingAt[0] = result.records[lena - 1].updatedAt;          //更新本地最后更新时间
        };
        result.records.forEach( aprove =>{              //dProcedure为审批流程的序号
          if (isDown) {                               //ats为各类审批流程的ID数组
            aPlace = app.mData.procedures[aprove.dProcedure].indexOf(aprove._id)
            if (aPlace >= 0) { app.mData.procedures[aprove.dProcedure].splice(aPlace, 1) }           //删除本地的重复记录列表
            app.mData.procedures[aprove.dProcedure].unshift(aprove._id);                   //按流程类别加到管理数组中
          } else {
            app.mData.procedures[aprove.dProcedure].push(aprove._id);                   //按流程类别加到管理数组中
          };
          if (aprove.cInstance==aprove.cManagers.length ){   //最后一个节点
            aprove.apState = 2;                 //将流程状态标注为‘已结束’
          } else {
            if (aprove.cFlowStep.indexOf(app.roleData.user._id)>=0) {
              aprove.apState = 0;                 //将流程状态标注为‘待我审’
            } else {aprove.apState =1}                 //将流程状态标注为‘已处理’
          }
          app.procedures[aprove._id] = aprove;            //pageData是ID为KEY的JSON格式的审批流程数据
          uSetData['pageData.'+aprove._id] = aprove;                  //增加页面中的新收到数据
        });
        uSetData.indexPage = app.mData.processing;
        that.setData( uSetData );
      }
     }).catch( console.error );
  },

  onShow: function() {
    this.updatepending(true,this.data.ht.pageCk);
  },
  onPullDownRefresh: function () {
    this.updatepending(true,this.data.ht.pageCk);
  },

  onReachBottom: function () {
    this.updatepending(false,this.data.ht.pageCk);
  },

  onShareAppMessage: function () {    // 用户点击右上角分享
    return {
      title: '侠客岛创业服务平台', // 分享标题
      desc: '扶贫济困，共享良品。', // 分享描述
      path: '/pages/manage/manage' // 分享路径
    }
  }
})
