var sysinfo = getApp().sysinfo
module.exports = Behavior({
  data: {
    vFormat: [],
    animationData: {},
    showModalBox: false
  },
  methods: {
    popModal({ currentTarget: { id, dataset } }) {
      if (typeof animation == 'undefined') {
        var animation = wx.createAnimation({      //遮罩层
          duration: 200,
          timingFunction: "linear",
          delay: 0
        })
      }
      this.animation = animation;
      animation.height(sysinfo.windowHeight).translateY(sysinfo.windowHeight).step();
      this.setData({
        animationData: animation.export(),
        showModalBox: true
      });
      setTimeout(function () {
        animation.translateY(0).step()
        this.setData({
          animationData: animation.export()
        });
      }.bind(this), 200)
    },
    downModal({ currentTarget: { id, dataset } }) {
      var animation = this.animation;
      animation.translateY(-sysinfo.windowHeight).step();
      this.setData({ animationData: animation.export() });
      setTimeout(function () {
        this.animation.translateY(0).step();
        this.setData({
          animationData: animation.export(),
          showModalBox: false
        });
      }.bind(this), 200)
    }
  }
})
