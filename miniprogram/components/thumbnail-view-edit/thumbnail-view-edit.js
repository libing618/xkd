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
    x: 0,
    y: 0,
    canvasX: 300,
    canvasY: 225,
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
                let yMaxScale = (sysinfo.windowHeight-80*sysinfo.rpxTopx-230)/res.height;
                let imageScale = xMaxScale>yMaxScale ? yMaxScale : xMaxScale;
                let cutScaleMax = xMaxScale > yMaxScale ? res.width / xm[that.data.csc] : res.height / ym[that.data.csc];
                let xOff = xm[that.data.csc] * cutScaleMax;
                let yOff = ym[that.data.csc] * cutScaleMax;
                that.setData({
                  statusBar: sysinfo.statusBarHeight,
                  windowHeight: sysinfo.windowHeight,
                  filepath:restem.tempFilePaths[0],
                  xImage: res.width*imageScale,
                  yImage: res.height*imageScale,
                  imageScale: imageScale,
                  cScale: 10,
                  xOff: xOff/10,
                  yOff: yOff/10,
                  x:0,
                  y:0
                });
                that.popModal();
                that.ctx = wx.createCanvasContext('cei',that);
                that.ctx.drawImage(restem.tempFilePaths[0], 0, 0, xOff, yOff, 0, 0, 300, 225);
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
      this.ctx.drawImage(this.data.filepath, this.data.x / this.data.imageScale, this.data.y / this.data.imageScale, detail.scale * this.data.xOff, detail.scale * this.data.yOff, 0, 0, 300, 225);
      this.ctx.draw();
    },
    onChange({ currentTarget: { id, dataset }, detail }){
      let cScale = Number(this.data.cScale);
      this.ctx.drawImage(this.data.filepath, detail.x / this.data.imageScale, detail.y / this.data.imageScale, cScale * this.data.xOff, cScale * this.data.yOff, 0, 0, 300, 225);
      this.ctx.draw();
      this.setData({
        x: detail.x,
        y: detail.y
      });
    },
    fSave({ currentTarget: { id, dataset }, detail }){                  //确认返回数据
      let that = this;
      that.setData({
        canvasX: xm[that.data.csc],
        canvasY: ym[that.data.csc]
      });
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
          that.ctx.drawImage(that.data.filepath, that.data.x / that.data.imageScale, that.data.y / that.data.imageScale, that.data.cScale * that.data.xOff, that.data.cScale * that.data.yOff, 0, 0, 600, 450);
          that.ctx.draw(
            false,
            ()=>{wx.canvasGetImageData({
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
            },that);}
          );
          break;
      }
    }
  }
})
