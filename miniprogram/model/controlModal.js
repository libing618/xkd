const db = wx.cloud.database();
const _ = db.command;
var app = getApp();
function popModal(that){
  if (typeof that.animation=='undefined'){
    that.animation = wx.createAnimation({      //遮罩层
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
  }
  that.animation.height(app.sysinfo.windowHeight).translateY(app.sysinfo.windowHeight).step();
  that.setData({ animationData: that.animation.export() });
  setTimeout(function () {
    that.animation.translateY(0).step()
    that.setData({
      animationData: that.animation.export(),
      showModalBox: true
    });
  }, 200)
};
function downModal(that,hidePage){
  that.animation.translateY(-app.sysinfo.windowHeight).step();
  that.setData({ animationData: that.animation.export() });
  setTimeout(function () {
    let sPages = that.data.sPages;
    sPages.pop();
    hidePage.sPages = sPages;
    that.animation.translateY(0).step();
    hidePage.animationData = that.animation.export();
    hidePage.showModalBox = false;
    that.setData(hidePage);
  }, 200)
}
module.exports = {
  f_modalSwitchBox: function ({ currentTarget:{id,dataset} }) {            //切换选择弹出页
    var that = this;
    let hidePage = {}, showPage = {}, pageNumber = that.data.sPages.length - 1;
    let spmKey = 'sPages[' + pageNumber +'].';
    let nowPage = that.data.sPages[pageNumber];
    switch (id) {
      case 'fSwitch':                  //确认切换到下一数组并返回
        let arrNext = (that.data.ht.pageCk + 1) == that.data.ht.fLength ? 0 : (that.data.ht.pageCk + 1);
        that.data.cPage[arrNext].push(that.data.modalId);
        let oldNo = that.data.cPage[that.data.ht.pageCk].indexOf(that.data.modalId);
        that.data.cPage[that.data.ht.pageCk].splice(oldNo, 1);
        hidePage.cPage = that.data.cPage;
        downModal(that,hidePage)
        break;
      case 'fBack':                  //返回
        downModal(that,hidePage);
        break;
      default:                  //打开弹出页
        that.data.sPages.push({
          pageName: 'modalSwitchBox',
          targetId: id,
          smtName: that.data.ht.modalBtn[that.data.ht.pageCk]
        });
        that.setData({
          sPages: that.data.sPages
        });
        popModal(that)
        break;
    }
  },

  f_modalRecordView: function ({ currentTarget:{id,dataset} }) {            // 记录内容查看弹出页
    var that = this;
    let hidePage = {}, showPage = {}, pageNumber = that.data.sPages.length - 1;
    let spmKey = 'sPages[' + pageNumber +'].';
    let nowPage = that.data.sPages[pageNumber];
    switch (id) {
      case 'fBack':                  //返回
        downModal(that,hidePage);
        break;
      default:                  //打开弹出页
        that.data.sPages.push({
          pageName:'modalRecordView',
          vFormat: app.fData[dataset.pNo].pSuccess,
          targetId:id
        });
        that.setData({ sPages: that.data.sPages });
        popModal(that)
        break;
    }
  },

  f_modalFieldView: function ({ currentTarget:{id,dataset} }) {            //字段内容查看弹出页
    var that = this;
    let hidePage = {}, showPage = {}, pageNumber = that.data.sPages.length - 1;
    let spmKey = 'sPages[' + pageNumber +'].';
    let nowPage = that.data.sPages[pageNumber];
    switch (id) {
      case 'fBack':                  //返回
        downModal(that,hidePage);
        break;
      default:                  //打开弹出页
        that.data.sPages.push({
          pageName:'modalFieldView',
          vFormat: app.fData[dataset.pNo].pSuccess
        });
        that.setData({ sPages: that.data.sPages });
        popModal(that)
        break;
    }
  }

}
