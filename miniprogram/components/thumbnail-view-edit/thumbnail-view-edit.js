//缩略图编辑
const placeFile = require('../../config.js').placeimg     //占位图像文件
const sysinfo = getApp().sysinfo;
const xm = {"base64":300,"documents":600,"pic":900,"img":1200};
const ym = {"base64":225,"documents":450,"pic":675,"img":900};
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    csc: {
      type: String,
      value: 'pic'
    },
    editable: {
      type: Number,
      value: 0
    },
    name: {
      type: String,
      value: 'thumbnail'
    },
    value: String
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
    filepath:''
  },

  lifetimes:{
    attached(){
      if (this.data.value){
        if (this.data.csc == 'base64'){
          this.setData({ filepath: this.data.value })
        } else {this.fileNameAnaly(this.data.value,this.data.csc)}
      }// else {this.setData({filepath:placeFile})}
    }
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
              if (res.width<xm[that.data.csc] || res.height<ym[that.data.csc]){
                wx.showToast({ title: '照片尺寸太小！' })
              } else {
                let xMaxScale = sysinfo.windowWidth*71/(75*res.width);
                let yMaxScale = (sysinfo.windowHeight-60*sysinfo.rpxTopx-230)/res.height;
                let imageScale = xMaxScale>yMaxScale ? yMaxScale : xMaxScale;
                let cutScaleMax = xMaxScale > yMaxScale ? res.height / ym[that.data.csc] : res.width / xm[that.data.csc];
                let xOff = cutScaleMax > 10 ? xm[that.data.csc] * 10 / cutScaleMax : xm[that.data.csc] * imageScale;
                let yOff = cutScaleMax > 10 ? ym[that.data.csc] * 10 / cutScaleMax : ym[that.data.csc] * imageScale
                that.setData({
                  statusBar: sysinfo.statusBarHeight,
                  windowHeight: sysinfo.windowHeight,
                  filepath:restem.tempFilePaths[0],
                  xImage: res.width*imageScale,
                  yImage: res.height*imageScale,
                  scaleMin: cutScaleMax > 10 ? 1/cutScaleMax : imageScale,
                  scaleMax: cutScaleMax>10 ? 10 : cutScaleMax,
                  cScale: 1,
                  xOff: xOff,
                  yOff: yOff,
                  x:0,
                  y:0
                });
                that.popModal();
                that.ctx = wx.createCanvasContext('cei',that);
                that.ctx.drawImage(restem.tempFilePaths[0], 0, 0, xOff, yOff, 0, 0, xm[that.data.csc], ym[that.data.csc]);
                that.ctx.draw();
              };
            }
          })
        },
        fail: function () { wx.showToast({ title: '选取照片失败！' }) }
      })
    },
    onScale({ currentTarget: { id, dataset }, detail }){
      this.setData({
        cScale: Number(detail.scale.toFixed(3))
      });
      this.ctx.drawImage(this.data.filepath, this.data.x, this.data.y, detail.scale * this.data.xOff, detail.scale * this.data.yOff, 0, 0, xm[this.data.csc], ym[this.data.csc]);
      this.ctx.draw();
    },
    onChange({ currentTarget: { id, dataset }, detail }){
      let cScale = Number(this.data.cScale);
      this.ctx.drawImage(this.data.filepath, detail.x / this.data.scaleMin, detail.y / this.data.scaleMin, cScale * this.data.xOff, cScale * this.data.yOff, 0, 0, xm[this.data.csc], ym[this.data.csc]);
      this.ctx.draw();
      this.setData({
        x: detail.x,
        y: detail.y
      });
    },
    fSave({ currentTarget: { id, dataset }, detail }){                  //确认返回数据
      let that = this;
      switch (that.data.csc) {
        case 'base64':
          wx.canvasGetImageData({
            canvasId: 'cei',
            x: 0,
            y: 0,
            width: 300,
            height: 225,
            success:(res)=> {
              const upng =require("../../libs/UPNG.js")          //比较重要的代码
              let png = upng.encode([res.data.buffer], res.width,res.height)
              that.setData({ value: 'data:image/png;base64,'+wx.arrayBufferToBase64(png) });
              that.downModal();
            }
          },that);
          break;
        case 'img':
          wx.canvasToTempFilePath({
            canvasId: 'cei',
            destWidth: 1200,
            destHeight: 900,
            success: function(resTem){
              that.setData({ value: resTem.tempFilePath });
              that.downModal();
            }
          },that);
          break;
        case 'pic':
          wx.canvasToTempFilePath({
            canvasId: 'cei',
            destWidth: 900,
            destHeight: 675,
            success: function(resTem){
              that.setData({ value: {f:resTem.tempFilePath, e:this.data.explain } });
              that.downModal();
            }
          },that);
          break;
        default:                   //documents
          wx.canvasGetImageData({
            canvasId: 'cei',
            x: 0,
            y: 0,
            width: 600,
            height: 450,
            success:(res)=> {
              const upng =require("../../libs/UPNG.js")
              let png = upng.encode([res.data.buffer], res.width,res.height)
              that.setData({ value: 'data:image/png;base64,'+wx.arrayBufferToBase64(png) });
              that.downModal();
            }
          },that);
          break;
      }
    }
  }
})
