//单位信息编辑
const db = wx.cloud.database();
const wImpEdit = require('../../libs/impedit');
var app = getApp()
Page({
  data: {
    pNo: '_Role',                       //流程的序号
    navBarTitle: app.roleData.uUnit.uName ? app.roleData.uUnit.uName : '创业服务平台--单位信息',              //申请项目名称
    statusBar: app.sysinfo.statusBarHeight,
    sPages: [{
      pageName: 'tabPanelIndex'
    }],
    targetId: '0',              //流程申请表的ID
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    vData: {},                 //编辑值的对象
    unEdit: false,           //新建信息页面,可以提交和保存
    selectd: -1,                       //详情项选中字段序号
    iFormat: [],
    showModalBox: false,
    animationData: {}
  },

  onLoad: function (options) {
    var that = this;
    if (app.roleData.user.position==8) {
      db.collection('sengpi').where({
        unitId: app.roleData.user._id,       //单位ID等于用户ID则为负责人
        dProcedure: '_Role'
      }).orderBy('updatedAt','desc').limit(1).get().then(({data}) =>{
        if (data.length==1) {
          that.data.vData = data[0].dObject;
          that.data.unEdit = data[0].cInstance > 0 && data[0].cInstance < data[0].cManagers.length;        //流程起点或已结束才能提交
        } else { that.data.vData=require('../../test/irole.js')};
        that.data.dObjectId = app.roleData.user.unit;
        wImpEdit.initFunc(app.fData._Role.pSuccess).forEach(functionName => { that[functionName] = wImpEdit[functionName] });
        that.data.iFormat = app.fData._Role.pSuccess;
        that.setData( that.data );
      }).catch(console.error )
    } else {
      wx.showToast({ title: '您不是单位创始人，请在《我的信息》页创建单位！', icon: 'none', duration: 2500 });
      setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
    }
  },

  fSubmit: wImpEdit.fSubmit

})
