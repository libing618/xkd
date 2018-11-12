var sysinfo = getApp().sysinfo
module.exports = Behavior({
  data: {
    statusBar: sysinfo.statusBarHeight,
    windowHeight: sysinfo.windowHeight,
    Height: sysinfo.windowHeight-300,
    animationData: {},
    showModalBox: false
  },
  methods: {
    fileNameAnaly(fileName){
      return new Promise((resolve,reject)=>{
        switch (typeof fileName) {
          case 'string':
            let extIndex = fileName.lastIndexOf('.');
            this.setData({
              filepath: require('../../config.js').cloudFileRoot+pathName+fileName,
              explain: fileName.substring(0,extIndex)
            },resolve(true))
            break;
          case 'object':
            this.setData({
              filepath: fileName.f,
              explain: fileName.e
            },resolve(true))
            break;
          default:
            resolve(true);
        }
      })
    },
    popModal() {
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
    downModal() {
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
