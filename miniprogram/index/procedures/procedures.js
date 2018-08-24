//审批流程列表
const db = wx.cloud.database();
const { hTabClick } = require('../../libs/util.js');
var app = getApp();
function ats(){
  let rats = [{},{},{}], j;
  for (j in app.fData) {
    if (app.mData.procedures[j]) {
      app.mData.procedures[j].forEach(mpoId => {
        if (typeof rats[app.procedures[mpoId].apState][j] == 'undefined') { rats[app.procedures[mpoId].apState][j] = [] };
        rats[app.procedures[mpoId].apState][j].push(mpoId);
      })
    }
  };
  let atotal = [];
  for (let i = 0; i < 3; i++) {
    let total = {};
    for (j in rats[i]){
      total[j] = typeof rats[i][j] == 'undefined' ? 0 : rats[i][j].length
    }
    atotal.push({ ats: rats[i], total: total})
  };
  return atotal;
}
Page({
  data:{
    pClassName: {},
    wWidth: app.sysinfo.windowWidth,
    statusBar: app.sysinfo.statusBarHeight,
    ht: {
      navTabs: ['待我审', '处理中', '已结束'],
      fLength: 3,
      pageCk: 0
    },
    pageData: {},
    indexPage: [[],[],[]],
    anClicked: app.mData.proceduresCk
  },

  onLoad:function(options){
    let procedure;
    for (procedure in app.fData) {
      this.data.pClassName[procedure] = app.fData[procedure].pName;
      if (!app.mData.procedures[procedure]) { app.mData.procedures[procedure]=[] }
    };
    this.setData({
      pClassName: this.data.pClassName,
      indexPage: ats(),
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

  anClick: function(e){                           //选择审批流程类型的数组下标
    app.mData.proceduresCk = e.currentTarget.id.substring(3);
    this.setData({ anClicked: app.mData.proceduresCk });
  },

  updatepending: function(isDown){                          //更新数据 ，0上拉刷新，1下拉刷新
    var that=this;
    var readProcedure = new AV.Query('sengpi');                                      //进行数据库初始化操作
    if (isDown) {
      readProcedure.greaterThan('updatedAt',new Date(app.mData.proceduresAt[1]));         //查询本地最新时间后修改的记录
      readProcedure.ascending('updatedAt');           //按更新时间升序排列
      readProcedure.limit(1000);                      //取最大数量新闻
    } else {
      readProcedure.lessThan('updatedAt',new Date(app.mData.proceduresAt[0]));          //查询最后更新时间前修改的记录
      readProcedure.descending('updatedAt');           //按更新时间降序排列
    };
    readProcedure.find().then((results) => {
      let lena = results.length ;
      if (lena>0){
        let aprove = {},uSetData = {}, aPlace = -1;
        if (isDown) {                     //下拉刷新
          app.mData.proceduresAt[1] = results[lena-1].updatedAt;                          //更新本地最新时间
          app.mData.proceduresAt[0] = results[0].updatedAt;                 //更新本地最后更新时间
        } else {
          app.mData.proceduresAt[0] = results[lena - 1].updatedAt;          //更新本地最后更新时间
        };
        results.forEach( (region) =>{
          aprove=region.toJSON();                      //dProcedure为审批流程的序号
          if (isDown) {                               //ats为各类审批流程的ID数组
            aPlace = app.mData.procedures[aprove.dProcedure].indexOf(aprove.objectId)
            if (aPlace >= 0) { app.mData.procedures[aprove.dProcedure].splice(aPlace, 1) }           //删除本地的重复记录列表
            app.mData.procedures[aprove.dProcedure].unshift(aprove.objectId);                   //按流程类别加到管理数组中
          } else {
            app.mData.procedures[aprove.dProcedure].push(aprove.objectId);                   //按流程类别加到管理数组中
          };
          if (aprove.cInstance==aprove.cManagers.length ){   //最后一个节点
            aprove.apState = 2;                 //将流程状态标注为‘已结束’
          } else {
            if (aprove.cFlowStep.indexOf(app.roleData.user.objectId)>=0) {
              aprove.apState = 0;                 //将流程状态标注为‘待我审’
            } else {aprove.apState =1}                 //将流程状态标注为‘已处理’
          }
          app.procedures[aprove.objectId] = aprove;            //pageData是ID为KEY的JSON格式的审批流程数据
          uSetData['pageData.'+aprove.objectId] = aprove;                  //增加页面中的新收到数据
        });
        uSetData.indexPage = ats();
        that.setData( uSetData );
      }
     }).catch( console.error );
  },

  onShow: function() {
    this.updatepending(true);
  },
  onPullDownRefresh: function () {
    this.updatepending(true);
  },

  onReachBottom: function () {
    this.updatepending(false);
  },

  onShareAppMessage: function () {    // 用户点击右上角分享
    return {
      title: '侠客岛创业服务平台', // 分享标题
      desc: '扶贫济困，共享良品。', // 分享描述
      path: '/pages/manage/manage' // 分享路径
    }
  }
})
