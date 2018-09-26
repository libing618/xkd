//缩略图编辑
var app = getApp()
var sysinfo = app.sysinfo;
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior, 'wx://form-field'],
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
  /**
   * 组件的初始数据
   */
  data: {
    x: 0,
    y: 0,
    animationData: {},
    showModalBox: false
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 's_cargo':
          cargototal = app.cargototal[this.data.sitem._id]
          this.data.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
            csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
          });
          break;
        default:
      }
      this.setData({ vFormat: app.fData[this.data.pno].pSuccess });
    },
  },
  methods: {
    i_thumbnail({ currentTarget: { id, dataset }, detail }){
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
                let xMaxScall = app.sysinfo.windowWidth/res.width;
                let yMaxScall = (app.sysinfo.windowHeight-260)/res.height;
                let imageScall = xMaxScall>yMaxScall ? yMaxScall : xMaxScall;
                let cutScallMax = xMaxScall>yMaxScall ? res.height/225 : res.width/300;
                this.setData({
                  iscr:restem.tempFilePaths[0],
                  xImage: res.width*imageScall,
                  yImage: res.height*imageScall,
                  cScale: imageScall,
                  xOff: 300 /imageScall,
                  yOff: 225 /imageScall,
                  x:0,
                  y:0
                });
                this.popModal();
                this.ctx = wx.createCanvasContext('cei');
                this.ctx.drawImage(restem.tempFilePaths[0], 0, 0, 300, 225, 0, 0, 300, 225);
                this.ctx.draw();
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
        this.ctx.drawImage(nowPage.iscr, nowPage.x, nowPage.y,detail.scale*nowPage.xOff, detail.scale*nowPage.yOff,0,0, 300, 225);
      } else {
        showPage.x = detail.x;
        showPage.y = detail.y;
        this.ctx.drawImage(nowPage.iscr,detail.x,detail.y,nowPage.cScale*nowPage.xOff, nowPage.cScale*nowPage.yOff,0,0, 300, 225);
      }
      this.setData(showPage);
      this.ctx.draw();
    },
    fSave(){                  //确认返回数据
      wx.canvasGetImageData({
        canvasId: 'cei',
        x: 0,
        y: 0,
        width: 300,
        height: 225,
        success(res) {
          //比较重要的代码
          const upng =require("../libs/UPNG.js")
          let png = upng.encode([res.data.buffer],res.width,res.height)
          this.setData({ vale: wx.arrayBufferToBase64(png) });
          this.downModal();
        }
      });
    }
  }
})
