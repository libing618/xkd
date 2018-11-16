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
    fileNameAnaly(fileName,pathName){
      return new Promise((resolve,reject)=>{
        let fs = wx.getFileSystemManager();
        let stringFileName = ();
        let sFile={filepath: fileName},fName=fileName;
        if (typeof fileName=='object') {
          sFile.explain = fileName.e;
          fName = fileName.f;
          sFile.filepath = fName
        }
        fs.access({
          path: fName,
          success: ({errMsg})=> {
            if (errMsg=='fail'){
              sFile.filepath = require('../../config.js').cloudFileRoot+pathName+fName;
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
