// 浏览pages
const {initData} = require('../../model/initForm');
var app=getApp()
Page({
  data:{
    uEV: app.roleData.user.line!=9,    //用户已通过单位和职位审核
    enUpdate: false,
    pNo: 'articles',
    statusBar: app.sysinfo.statusBarHeight,
    vData: {},
    vFormat: []
  },
  inFamily:false,

  onLoad: function(options) {
    var that = this ;
    that.data.pNo = options.pNo;
    that.inFamily = (typeof app.fData[that.data.pNo].afamily != 'undefined');
    that.data.vData = initData(app.fData[that.data.pNo].pSuccess,app.aData[that.data.pNo][options.artId]);
    that.data.fieleName = app.fData[this.data.pno].pSuccess;
    that.data.vFormat=app.fData[this.data.pno].fieldType;
    that.data.navBarTitle = app.aData[that.data.pNo][options.artId].uName;
    that.data.enUpdate = that.data.vData.unitId==app.roleData.uUnit._id && typeof app.fData[that.data.pNo].suRoles!='undefined';  //本单位信息且流程有上级审批的才允许修改
    that.setData(that.data);
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
