const cloudPath = require('../../config.js').cloudFileRoot
const {sysinfo} = getApp();
module.exports = Behavior({
  data: {
    useWindowTop: sysinfo.menuButton.bottom+5,
    useWindowHeight: sysinfo.useWindowHeight,
    animationData: {},
    showModalBox: false
  },
  methods: {
    fileNameAnaly(fileName,pathName,occupy){
      return new Promise((resolve,reject)=>{
        let sFile = {};
        let placeFiles = {
          img: 'cloud://cyfwtest-07b693.2c28-cyfwtest-07b693/零分.png',
          pic: 'cloud://cyfwtest-07b693.2c28-cyfwtest-07b693/零分.png',
          audio: 'cloud://cyfwtest-07b693.2c28-cyfwtest-07b693/中国好人 - 王玮玮.mp3',
          video: 'cloud://cyfwtest-07b693.2c28-cyfwtest-07b693/x0691yxjflz_1.mp4',
          pics: [
            'https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/790f500d14e467fe28e3.jpg',
            'https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/ff933806fce411614341.jpg',
            'https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/c4b4edf57363e801162c.jpg',
            'https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/4827cf0d996f80a86266.JPG',
            'https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/d5140a5a494b03139854.jpg',
            'https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/42e17b8efd6a01896496.JPG'
          ]
        };
        function checkFile(fName){     //检查是否本地文件
          return new Promise((resolve,reject)={
            let fs = wx.getFileSystemManager();
            fs.access({
              path: fName,
              success: (res) => {
                if (res.errMsg == 'fail') {     //云文件
                  resolve(cloudPath+ pathName + '/' + fName);
                } else {resolve(fName)};
              },
              fail: () => {
                resolve(fName)
              }
            })
          })
        }
        switch (pathName) {
          case 'documents':
            resolve({placeFile: this.data.name == 'uPhoto' ? 'http://ady3cqpl0902fnph-10007535.file.myqcloud.com/80b1db6d2b4f0a1cc7cf.jpg' : 'http://ady3cqpl0902fnph-10007535.file.myqcloud.com/667b99d135e2d8fa876d.jpg'});
            break;
          case 'base64':
            resolve({placeFile: "data:image/jpeg;base64,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"});
            break;
          case 'pics':
            sFile.placeFile = placeFiles[pathName];
            if (fileName) {
              sFile.explain = fileName.e;
              let checkAllFile = fileName.f.map((f,i)=>{
                return checkFile(f).then(rf=>{ sFile.filepaths[i]=rf })
              });
              Promise.all(checkAllFile).then(()=>{ resolve(sFile) })
            } else {
              resolve( {explain: sFile.placeFile.map(()=>{return '图片集说明'}) })
            }
            break;
          default:
            sFile.placeFile = placeFiles[pathName];
            if (fileName){
              sFile.value = {e: fileName.e};
              checkFile(fileName.f).then(rf=>{
                sFile.value.f = rf;
                resolve(sFile);
              });
            } else {
              resolve(sFile);
            }
        }
      }).then(showFile=>{
        this.setData(showFile)
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
