// 浏览pages
const { readShowFormat } = require('../../libs/util');
var app=getApp()
Page({
  data:{
    uEV: app.roleData.user.line!=9,
    enUpdate: false,
    pNo: 'articles',
    statusBar: app.sysinfo.statusBarHeight,
    sPages: ['viewRecord'],
    vData: {},
    vFormat: []
  },
  inFamily:false,

  onLoad: function(options) {
    var that = this ;
    that.data.navBarTitle = app.roleData.user.line!=9 ? app.roleData.uUnit.nick : '体验用户';     //用户已通过单位和职位审核
    that.data.pNo = options.pNo;
    let artid = Number(options.artId);
    that.inFamily = (typeof app.fData[that.data.pNo].afamily != 'undefined');
    that.data.vData = app.aData[that.data.pNo][options.artId];
    let showFormat = app.fData[that.data.pNo].pSuccess;
    readShowFormat(showFormat, that.data.vData).then(req=>{
      that.data.vFormat=req;
      that.data.navBarTitle += '的' + (that.inFamily ? app.fData[that.data.pNo].afamily[that.data.vData.afamily] : app.fData[that.data.pNo].pName);
      that.data.enUpdate = that.data.vData.unitId==app.roleData.uUnit._id && typeof app.fData[that.data.pNo].suRoles!='undefined';  //本单位信息且流程有上级审批的才允许修改
      that.setData(that.data);
    });
  },

  fEditProcedure: function(e){
    var that = this;
    var url='/inputedit/fprocedure/fprocedure?pNo='+that.data.pNo;
    switch (e.currentTarget.id){
      case 'fModify' :
        url += '&artId='+that.data.vData._id;
        break;
      case 'fTemplate' :
        url += that.inFamily ? '&artId='+that.data.vData.afamily : '';
        let newRecord = that.inFamily ? that.data.pNo+that.data.vData.afamily : that.data.pNo;
        app.aData[that.data.pNo][newRecord] = that.data.vData;
        break;
    };
    wx.navigateTo({ url: url});
  }

})
