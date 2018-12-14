//审批流程列表
import {hTabClick} from '../../modules/util.js';
import { shareMessage,checkRols } from '../../modules/initForm';
const db = wx.cloud.database();
var app = getApp();

Page({
  data:{
    pClassName: {},
    statusBar: app.sysinfo.statusBarHeight,
    ht: {
      navTabs: ['待我审', '我已审', '已发布'],
      tWidth: 470 * app.sysinfo.rpxTopx / 3,   //每个tab宽度470rpx÷3
      fLength: 3,
      twwHalf: 48 * app.sysinfo.rpxTopx,   //每个tab字体宽度一半32rpx*3÷2
      pageCk: 0
    },
    tabExplain: ['需要您审批', '在他人审批过程中', '可供查阅'],
    pTotal: [0,0,0],
    pageData: {},
    pAt:[[new Date(0),new Date(0)],[new Date(0),new Date(0)]],
    indexPage: app.pIndex.prodessing,
    procedures: app.pIndex.procedures,
    anClicked: app.pIndex.proceduresCk
  },

  onLoad:function(options){
    if (checkRols(app.roleData.user.line == 9 ? -1 : app.roleData.user.line,app.roleData.user) ){
      let pSetData = { pClassName: [], processName:{}};
      for (let procedure in app.fData) {
        pSetData.pClassName.push(procedure);
        pSetData.processName[procedure] = app.fData[procedure].pName;
        if (!app.pIndex.procedures[procedure]) {
          app.pIndex.procedures[procedure]=[];
          app.pIndex.proceduresAt[procedure]=[new Date(0),new Date(0)];
        }
      };
      return new Promise((resolve,reject)=>{
        wx.getStorage({
          key: 'procedures',
          success: function (res) {
            if (res.data) {
              app.pData = res.data;
              resolve(res.data)
            } else { resolve( {} ) };
          }
        })
      }).then( storData=>{
        pSetData.pageData = storData;
        this.updatepending(true,0).then(usData=>{
          if (usData){
            Object.assign(pSetData,usData)
          };
          this.setData(pSetData);
        })
      })
    };
  },

  onReady: function(){
    this.updatepending(true,1).then(ps1=>{
      this.updatepending(true,2).then(ps2=>{
        if (ps1){
          if (ps2){
            Object.assign(ps1,ps2);
          }
          this.setData(ps1);
        } else {
          if (ps2){
            this.setData(ps2);
          }
        }
      })
    });
  },

  hTabClick: hTabClick,

  anClick: function(e){                           //选择审批流程类型
    app.pIndex.proceduresCk = e.currentTarget.id;
    this.setData({ anClicked: app.pIndex.proceduresCk });
    this.updatepending(true).then(pSetData={
      if (pSetData) {that.setData(pSetData)}
    })
  },

  updatepending: function(isDown, pck = this.data.ht.pageCk){   //更新数据(true上拉刷新，false下拉刷新)
    var that=this;
    return new Promise((resolve,reject) =>{
      if (isDown || (!isDown && that.data.pTotal[pck]>0) ){
        wx.cloud.callFunction({
          name:'process',
          data:{
            pModel: app.pIndex.proceduresCk,
            sData:{
              rDate: pck==2 ? app.pIndex.processingAt[app.pIndex.proceduresCk] : that.data.pAt[pck],
              isDown: isDown ? 'asc' : 'desc',
              lastTotal: that.data.pTotal[pck]
            },
            processOperate: pck    //操作类型(0待我审,1处理中,2已结束)
          }
        }).then(({result}) => {
          that.data.pTotal[pck] = result.total;
          let uSetData = {pTotal: that.data.pTotal};
          let lena = result.records.length ;
          if (lena>0){
            let aprove = {}, aPlace = -1;
            uSetData.pAt = that.data.pAt;
            if (isDown) {                     //下拉刷新
              if (pck==2){
                app.pIndex.processingAt[app.pIndex.proceduresCk][1] = result.records[lena-1].updatedAt;                          //更新本地最新时间
                app.pIndex.processingAt[app.pIndex.proceduresCk][0] = result.records[0].updatedAt;                 //更新本地最后更新时间
              } else {
                uSetData.pAt[pck][1] = result.records[lena-1].updatedAt;                          //更新本地最新时间
                uSetData.pAt[pck][0] = result.records[0].updatedAt;                 //更新本地最后更新时间
              }
            } else {
              if (pck==2){
                app.pIndex.processingAt[app.pIndex.proceduresCk][0] = result.records[lena - 1].updatedAt;          //更新本地最后更新时间
              } else {
                uSetData.pAt[pck][0] = result.records[lena - 1].updatedAt;
              }
            };
            result.records.forEach( aprove =>{              //dProcedure为审批流程的表名
              if (aprove.processState==2 ){                   //已发布
                if (isDown) {                               //各类审批流程的ID数组
                  aPlace = app.pIndex.procedures[aprove.dProcedure].indexOf(aprove._id)
                  if (aPlace >= 0) { app.pIndex.procedures[aprove.dProcedure].splice(aPlace, 1) }           //删除本地的重复记录列表
                  app.pIndex.procedures[aprove.dProcedure].unshift(aprove._id);                   //按流程类别加到管理数组中
                } else {
                  app.pIndex.procedures[aprove.dProcedure].push(aprove._id);                   //按流程类别加到管理数组中
                };
              } else {
                if (isDown) {                               //审批流程的ID数组
                  aPlace = app.pIndex.processing[pck].indexOf(aprove._id);
                  if (aPlace >= 0) { app.pIndex.procedures[pck].splice(aPlace, 1) }           //删除本地的重复记录列表
                  app.pIndex.processing[pck].unshift(aprove._id);                   //按流程类别加到管理数组中
                } else {
                  app.pIndex.processing[pck].push(aprove._id);                   //按流程类别加到管理数组中
                };
              }
              app.pData[aprove._id] = aprove;            //pageData是ID为KEY的JSON格式的审批流程数据
              uSetData['pageData.'+aprove._id] = aprove;                  //增加页面中的新收到数据
            });
            uSetData.indexPage = app.pIndex.processing;
          }
          resolve( uSetData );
        }).catch( console.error );
      } else {
        resolve(false)
      }
    })
   },

  onPullDownRefresh: function () {
    this.updatepending(true).then(pSetData={
      if (pSetData) {this.setData(pSetData)}
    });
  },

  onReachBottom: function () {
    this.updatepending(false).then(pSetData={
      if (pSetData) {this.setData(pSetData)}
    });
  },

  onHide: function () {             //进入后台时缓存数据。
    wx.getStorageInfo({             //查缓存的信息
      success: function (res) {
        if (res.currentSize < (res.limitSize - 512)) {          //如缓存占用大于限制容量减512kb，将大数据量的缓存移除。
          wx.setStorage({ key: 'pData', data: app.pData });
        }
      }
    });
  },

  onShareAppMessage: shareMessage
})
