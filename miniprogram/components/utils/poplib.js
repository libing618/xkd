const {sysinfo} = getApp();
module.exports = Behavior({
  data: {
    useWindowTop: sysinfo.menuButton.bottom+5,
    useWindowHeight: sysinfo.useWindowHeight,
    animationData: {},
    showModalBox: false
  },
  methods: {
    fileNameAnaly(fileName,pathName){
      return new Promise((resolve,reject)=>{
        let fs = wx.getFileSystemManager();
        let sFile={value: fileName};
        if (typeof fileName=='object') {
          sFile.explain = fileName.e;
          sFile.value  = fileName.f;
        }
        fs.access({
          path: fileName,
          success: (res)=> {
            if (res.errMsg=='fail'){
              sFile.value = require('../../config.js').cloudFileRoot+pathName+sFile.value ;
            };
            this.setData(sFile,resolve(true))
          },
          fail: ()=>{
            this.setData(sFile,resolve(true))
          }
        })
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
      animation.height(sysinfo.useWindowHeight).translateY(sysinfo.useWindowHeight).step();
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
      animation.translateY(-sysinfo.useWindowHeight).step();
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
