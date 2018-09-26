var app = getApp()
Page ({
  data: {
    pNo: '',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    mPage: [],                 //页面管理数组
    artId: 0,             //已建数据的ID作为修改标志，则为新建
    pageData: []
  },

  onLoad: function (ops) {        //传入参数为pNo,不得为空
    var that = this;
    that.artid = Number(ops.artId);
    that.setData({
      pNo: ops.pNo,
      artId: isNaN(that.artid) ? ops.pNo : that.artid,
      navBarTitle: isNaN(that.artid) ? app.fData[ops.pNo].pName : app.fData[ops.pNo].pName+'--'+app.fData[ops.pNo].afamily[that.artid]
    });
  },

  onShareAppMessage: require('../../model/initForm').shareMessage
})
