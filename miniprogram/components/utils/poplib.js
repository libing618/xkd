var sysinfo = getApp().sysinfo
module.exports = {
  popModal: function (that){
    if (typeof that.animation=='undefined'){
      that.animation = wx.createAnimation({      //遮罩层
        duration: 200,
        timingFunction: "linear",
        delay: 0
      })
    }
    that.animation.height(sysinfo.windowHeight).translateY(sysinfo.windowHeight).step();
    that.setData({ animationData: that.animation.export() });
    setTimeout(function () {
      that.animation.translateY(0).step()
      that.setData({
        animationData: that.animation.export(),
        showModalBox: true
      });
    }, 200)
  };
  downModal: function (that,hidePage){
    that.animation.translateY(-sysinfo.windowHeight).step();
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
}
