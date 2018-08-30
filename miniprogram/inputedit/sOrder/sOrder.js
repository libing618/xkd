//共享信息管理
const { checkRols } =  require('../../model/initForm');
const {f_modalRecordView} = require('../../model/controlModal');
const { initData, fSubmit } = require('../import/unitEdit');
var app = getApp()
Page({
  data: {
    pNo: 'service',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    mPage: [],
    pageData: {},
    sPages: [{
      pageName: 'tabPanel'
    }],
    showModalBox: false,
    animationData: {},
    vFormat:app.fData.service.pSuccess
  },

  onLoad: function (options) {
    var that = this;
    if (checkRols(0,app.roleData.user)) {       //负责人或综合条线员工
      that.updateService()
    };
  },

  updateService: function() {    //更新页面显示数据
    var that = this;
    return new Promise((resolve, reject) => {
      var umdata = new Array(app.fData.service.afamily.length);
      umdata.fill([]);
      var readProcedure = new AV.Query('service');                                      //进行数据库初始化操作
      var unitId = uId ? uId : app.roleData.uUnit._id;
      readProcedure.equalTo('unitId', unitId);                //除权限和文章类数据外只能查指定单位的数据
      readProcedure.greaterThan('startDate', new Date());
      readProcedure.lessThan('endDate', new Date());          //查询本地最新时间后修改的记录
      readProcedure.ascending('updatedAt');           //按更新时间升序排列
      readProcedure.limit(1000);                      //取最大数量
      readProcedure.find().then(results => {
        var lena = results.length;
        if (lena > 0) {
          let aProcedure,aData = {};
          for (let i = 0; i < lena; i++) {
            aProcedure = results[i].toJSON();
            umdata[aProcedure.afamily].unshift(aProcedure._id);
            aData[aProcedure._id] = aProcedure;                        //将数据对象记录到本机
          };
          that.setData({
            cPage: umdata,
            pageData: aData
          })
        };
        resolve(lena > 0);               //数据更新状态
      }).catch(error => {
        if (!that.netState) { wx.showToast({ title: '请检查网络！' }) }
      });
    }).catch(console.error);
  },

  fSubmit: fSubmit

})
