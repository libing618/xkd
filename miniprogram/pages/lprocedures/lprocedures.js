const { getData } = require('../../model/wx_data');
var app = getApp()
Page ({
  data: {
    pNo: '',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    mPage: [],                 //页面管理数组
    artId: 0,             //已建数据的ID作为修改标志，则为新建
    pageData: []
  },
  isAll:false,
  inFamily: false,

  onLoad: function (ops) {        //传入参数为pNo,不得为空
    var that = this;
    that.artid = Number(ops.artId);
    that.inFamily = (typeof app.fData[ops.pNo].afamily != 'undefined');
    that.isAll = isAllData(ops.pNo);
    that.setData({
      pNo: ops.pNo,
      artId: isNaN(that.artid) ? ops.pNo : that.artid,
      navBarTitle: isNaN(that.artid) ? app.fData[ops.pNo].pName : app.fData[ops.pNo].pName+'--'+app.fData[ops.pNo].afamily[that.artid]
    });
    that.setPage(true);
  },

  setPage: function(iu){     //有更新则重新传输页面数据
    if (iu){
      if (this.isAll){
        if (this.inFamily){
          this.data.mPage = app.mData[this.data.pNo][this.artid] || []
        } else {
          this.data.mPage = app.mData[this.data.pNo] || []
        }
      } else {
        if (this.inFamily){
          this.data.mPage = app.mData[this.data.pNo][app.roleData.uUnit.objectId][this.artid] || []
        } else {
          this.data.mPage = app.mData[this.data.pNo][app.roleData.uUnit.objectId] || []
        }
      }
      this.setData({
        mPage: this.data.mPage,
        pageData: app.aData[this.data.pNo]
      })
    }
  },

  onReady: function(){
    getData(true,this.data.pNo).then(isupdated=>{ this.setPage(isupdated)});                       //更新缓存以后有变化的数据
  },
  onPullDownRefresh: function () {
    getData(true,this.data.pNo).then(isupdated=>{ this.setPage(isupdated)});
  },
  onReachBottom: function () {
    getData(false,this.data.pNo).then(isupdated=>{ this.setPage(isupdated)});
  },
  onShareAppMessage: require('../../model/initForm').shareMessage
})
