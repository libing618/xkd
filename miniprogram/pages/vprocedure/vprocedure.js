// 浏览pages
const { readShowFormat } = require('../../libs/util');
var app=getApp()
Page({
  data:{
    uEV: app.roleData.user.emailVerified,
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
    that.data.navBarTitle = app.roleData.user.emailVerified ? app.roleData.uUnit.nick : '体验用户';     //用户已通过单位和职位审核
    that.data.pNo = options.pNo;
    let artid = Number(options.artId);
    that.inFamily = (typeof app.fData[that.data.pNo].afamily != 'undefined');
    that.data.vData = app.aData[that.data.pNo][options.artId];
    let showFormat = app.fData[that.data.pNo].pSuccess;
    switch (that.data.pNo) {
      case 'goods':
        showFormat = [
          {gname:"pics", p:'图片集',t:"pics"},
          {gname:"uName", p:'名称', t:"h1" },
          {gname:"title", p:'简介',t:"h2" },
          {gname:"tvidio", p:'',t: "vidio" },
          {gname:"desc", p:'',t:"p" },
          {gname:"specstype", p:'规格类型', t:"listsel", aList:['单品','套餐']},
          {gname:"specs", p:'规格',t:"specsel",csc:"specsel" },
          {gname:"details", p:'详情',t:"eDetail" }]
        break;
    };
    readShowFormat(showFormat, that.data.vData).then(req=>{
      that.data.vFormat=req;
      that.data.navBarTitle += '的' + (that.inFamily ? app.fData[that.data.pNo].afamily[that.data.vData.afamily] : app.fData[that.data.pNo].pName);
      that.data.enUpdate = that.data.vData.unitId==app.roleData.uUnit.objectId && typeof app.fData[that.data.pNo].suRoles!='undefined';  //本单位信息且流程有上级审批的才允许修改
      that.setData(that.data);
    });
  },

  fEditProcedure: function(e){
    var that = this;
    var url='/inputedit/fprocedure/fprocedure?pNo='+that.data.pNo;
    switch (e.currentTarget.id){
      case 'fModify' :
        url += '&artId='+that.data.vData.objectId;
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
