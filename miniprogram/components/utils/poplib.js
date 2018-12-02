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
        let sFile={filepath: fileName};
        if (typeof fileName=='object') {
          sFile.explain = fileName.e;
          sFile.filepath  = fileName.f;
        }
        fs.access({
          path: fName,
          success: (res)=> {
            if (res.errMsg=='fail'){
              sFile.filepath = require('../../config.js').cloudFileRoot+pathName+sFile.filepath ;
            };
            this.setData(sFile,resolve(true))
          },
          fail: ()=>{
            this.setData(sFile,resolve(true))
          }
        })
      })
    },
    richAnalysis() {
      let setRich = {},rStyle;
      if (this.data.value){
        rStyle = this.data.value.r
      } else {
        rStyle = '3110D9D9D9ECECEC'
        setRich.value = {
          t: 're',
          r: '3110D9D9D9ECECEC',
          e: ''
        }
      };
      setRich.rich_h = rStyle.charAt(0);             //字体大小
      setRich.rich_s = rStyle.charAt(1);             //字体强调
      setRich.rich_a = rStyle.charAt(2);             //对齐
      setRich.rich_i = rStyle.charAt(3);             //左空格数
      setRich.rich_c = rStyle.substr(4,6);             //字色
      setRich.rich_b = rStyle.substr(10);               //背景色
      this.setData(setRich);
    },
    onStyle({currentTarget:{id,dataset},detail:{value}}) {
      let setRich = {};
      setRich[id] = value;
      this.data[id] = value;
      setRich.value.r = this.data.rich_h+this.data.rich_s+this.data.rich_a+this.data.rich_i+this.data.rich_c+this.data.rich_b;
      this.setData(setRich)
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
