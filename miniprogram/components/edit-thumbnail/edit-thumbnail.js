//缩略图编辑
const sysinfo = getApp().sysinfo;
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
  properties: {
    p: {
      type: String,
      value: '缩略图',
    },
    csc: {
      type: String,
      value: 'thumbnail',
    },
    c: {
      type: String,
      value: '/images/2.png',
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    xImage: 300,
    yImage: 225,
    cScale: 1,
    xOff: 300,
    yOff: 225,
    x: 0,
    y: 0,
    animationData: {},
    showModalBox: false
  },

  methods: {
    i_thumbnail({ currentTarget: { id, dataset }, detail }){
      let that = this;
      wx.chooseImage({
        count: 1,                                     // 最多可以选择的图片张数，默认9
        sizeType: ['compressed'],         // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'],             // album 从相册选图，camera 使用相机，默认二者都有
        success: function (restem) {                     // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          wx.getImageInfo({
            src: restem.tempFilePaths[0],
            success: function (res){
              if (res.width<300 || res.height<225){
                wx.showToast({ title: '照片尺寸太小！' })
              } else {
                let xMaxScall = sysinfo.windowWidth/res.width;
                let yMaxScall = (sysinfo.windowHeight-260)/res.height;
                let imageScall = xMaxScall>yMaxScall ? yMaxScall : xMaxScall;
                let cutScallMax = xMaxScall>yMaxScall ? res.height/225 : res.width/300;
                that.setData({
                  c:restem.tempFilePaths[0],
                  xImage: res.width*imageScall,
                  yImage: res.height*imageScall,
                  cScale: imageScall.toFixed(3)
                  // xOff: 300 /imageScall,
                  // yOff: 225 /imageScall,
                  // x:0,
                  // y:0
                });
                that.popModal();
                that.ctx = wx.createCanvasContext('cei',that);
                that.ctx.drawImage(restem.tempFilePaths[0], 0, 0, 300, 225, 0, 0, 300, 225);
                that.ctx.draw();
              };
            }
          })
        },
        fail: function () { wx.showToast({ title: '选取照片失败！' }) }
      })
    },
    fHandle({ currentTarget: { id, dataset }, detail }){
      let showPage = {}
      if (detail.scale){
        showPage.cScale = detail.scale;
        this.ctx.drawImage(this.data.c, this.data.x, this.data.y,detail.scale*this.data.xOff, detail.scale*this.data.yOff,0,0, 300, 225);
      } else {
        showPage.x = detail.x;
        showPage.y = detail.y;
        this.ctx.drawImage(this.data.c,detail.x,detail.y,this.data.cScale*this.data.xOff, this.data.cScale*this.data.yOff,0,0, 300, 225);
      }
      this.setData(showPage);
      this.ctx.draw();
    },
    fSave(){                  //确认返回数据
      let that = this;
      if (that.data.csc=='base64'){
        wx.canvasGetImageData({
          canvasId: 'cei',
          x: 0,
          y: 0,
          width: 300,
          height: 225,
          success:(res)=> {
            const upng =require("../../libs/UPNG.js")          //比较重要的代码
            let png = upng.encode([res.data.buffer],res.width,res.height)
            that.setData({ c: 'data:image/png;base64,'+wx.arrayBufferToBase64(png) });
            that.downModal();
          }
        },that);
      } else {
        wx.canvasToTempFilePath({
          canvasId: 'cei',
          success: function(resTem){
            that.setData({ c: resTem.tempFilePath });
            that.downModal();
          }
        })
      }
    }
  }
})
