//调整当日成品生产计划
const db = wx.cloud.database();
const { checkRols,shareMessage } =  require('../../model/initForm');
const {hTabClick} = require('../../libs/util.js');
const {f_modalRecordView} = require('../../model/controlModal');
var app = getApp();

Page({
  data: {
    pNo: 'prodesign',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    ht:{
      navTabs: app.fData.prodesign.afamily,
      fLength: app.fData.prodesign.afamily.length,
      pageCk: 0
    },
    cPage: [],
    pageData: {},
    sPages: [{
      pageName: 'tabPanel'
    }],
    showModalBox: false,
    animationData: {},
    iFormat:app.fData.prodesign.pSuccess
  },

  onLoad: function (ops) {        //传入参数为pNo
    var that = this;
    if (checkRols(1,app.roleData.user)) {  //检查用户操作权限
      updateTodo('prodesign');
    };
  },

  updateTodo: function(pNo) {    //更新页面显示数据
    var that = this;
    return new Promise((resolve, reject) => {
      var umdata = new Array(app.fData.prodesign.afamily.length);
      umdata.fill([]);
      var readProcedure = new AV.Query(pNo);                                      //进行数据库初始化操作
      var unitId = uId ? uId : app.roleData.uUnit._id;
      readProcedure.equalTo('unitId', unitId);                //除权限和文章类数据外只能查指定单位的数据
      readProcedure.greaterThan('startTime', new Date());
      readProcedure.lessThan('endTime', new Date());          //查询本地最新时间后修改的记录
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
  hTabClick: hTabClick,

  onPullDownRefresh: function () {                   //更新缓存以后有变化的数据
    updateTodo('prodesign');
  },
  onReachBottom: function () {
    updateTodo('prodesign');
  },
  onShareAppMessage: shareMessage
})
