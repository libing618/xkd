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
        switch (pathName) {
          case 'documents':
            sFile.value = fileName;
            break;
          case 'base64':
            sFile.value = fileName;
            sFile.placeFile = this.data.name == 'uPhoto' ? 'http://ady3cqpl0902fnph-10007535.file.myqcloud.com/80b1db6d2b4f0a1cc7cf.jpg' : 'http://ady3cqpl0902fnph-10007535.file.myqcloud.com/667b99d135e2d8fa876d.jpg';
            break;
          case 'pics':
            if (typeof this.data.value == 'undefined') {
              sFile.explain = placeFile.map(()=>{return '图片集说明'})
            } else {
              if (typeof fileName[0] == 'string'){
                let explains = [],extIndex;
                let filePaths = this.data.value.map(fileName=>{
                  extIndex = fileName.lastIndexOf('.');
                  explains.push(fileName.substring(0,extIndex));
                  return cloudPath+fileName
                });
                this.setData({
                  filepaths: filePaths,
                  explain: explains
                })
              } else {
                this.setData({
                  filepaths: this.data.value.f,
                  explain: this.data.value.e
                })
              }
            }
            break;
          default:
            let fs = wx.getFileSystemManager();
            if (typeof fileName == 'object') {
              sFile.explain = fileName.e;
              sFile.value = fileName.f;
            }
            fs.access({
              path: fileName,
              success: (res) => {
                if (res.errMsg == 'fail') {
                  sFile.value = cloudPath+ pathName + '/' + sFile.value;
                };
                resolve(sFile)
              },
              fail: () => {
                resolve(sFile)
              }
            })
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
