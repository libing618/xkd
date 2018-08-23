// 通用的内容编辑pages
const wImpEdit = require('../import/impedit.js');
const { initData,fSubmit } = require('../import/unitEdit');
var app = getApp()
Page({
  data: {
    navBarTitle: '编辑--',              //申请项目名称
    statusBar: app.sysinfo.statusBarHeight,
    sPages: [{
      pageName: 'tabPanelIndex'
    }],
    selectd: -1,                       //详情项选中字段序号
    enMenu: 'none',                  //‘插入、删除、替换’菜单栏关闭
    enIns: true,                  //插入grid菜单组关闭
    targetId: '0',              //流程申请表的ID
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    showModalBox: false,
    animationData: {},              //弹出动画
    vData: {},
    iFormat: []
  },
  onLoad: function (options) {        //传入参数为tgId或pNo/artId,不得为空
    var that = this;
    let aaData;
    that.data.uEV = app.roleData.user.emailVerified;            //用户已通过单位和职位审核
    return new Promise((resolve, reject) => {
      if (typeof options.tgId == 'string') {                   //传入参数含审批流程ID，则为编辑审批中的数据
        if (app.procedures[options.tgId].length>0) {
          aaData = app.procedures[options.tgId].dObject;
          that.data.targetId = options.tgId;
          resolve({pNo:app.procedures[options.tgId].dProcedure,pId:app.procedures[options.tgId].dObjectId});
        } else { reject() };
      } else {
        let artid = Number(options.artId);
        resolve({ pNo: options.pNo, pId: isNaN(artid) ? options.artId : artid });
      }
    }).then(ops=>{
      switch (typeof ops.pId){
        case 'number':           //传入参数为一位数字的代表该类型新建数据或读缓存数据
          that.data.dObjectId = ops.pNo + ops.pId;      //根据类型建缓存KEY
          that.data.navBarTitle += app.fData[ops.pNo].afamily[ops.pId]
          break;
        case 'string':                   //传入参数为已发布ID，重新编辑已发布的数据
          that.data.dObjectId = ops.pId;
          that.data.navBarTitle += app.fData[ops.pNo].pName;
          break;
        case 'undefined':               //未提交或新建的数据KEY为审批流程pModel的值
          that.data.dObjectId = ops.pNo;
          that.data.navBarTitle += app.fData[ops.pNo].pName;
          break;
      }
      if (typeof aaData == 'undefined') { aaData = app.aData[ops.pNo][that.data.dObjectId] || {} }//require('../../test/goods0')[0]
      initData(app.fData[ops.pNo].pSuccess, aaData).then(({ iFormat, vData, funcArr })=>{
        funcArr.forEach(functionName => {
          that[functionName] = wImpEdit[functionName];
          if (functionName == 'i_eDetail') {             //每个输入类型定义的字段长度大于2则存在对应处理过程
            that.farrData = wImpEdit.farrData;
            that.i_insdata = wImpEdit.i_insdata;
          }
        });
        iFormat.unshift({gname:"uName", t:"h2", p:"名称" });
        that.setData({
          pNo: ops.pNo,
          navBarTitle: that.data.navBarTitle,
          iFormat: iFormat,
          vData: vData
        });
      })
    }).catch((error)=>{
      console.log(error)
      wx.showToast({ title: '数据传输有误',icon:'loading', duration: 2500 });
      setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
    });
  },

  fSubmit: fSubmit

})
