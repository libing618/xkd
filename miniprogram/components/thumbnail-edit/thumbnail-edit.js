//缩略图编辑
const sysinfo = getApp().sysinfo;
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '缩略图',
    },
    csc: {
      type: String,
      value: 'pic',
    },
    name: {
      type: String,
      value: 'thumbnail',
    },
    value: {
      type: String,
      observer(newVal){
        if (typeof newVal=='undefined'){
          value = require('../../config.js').placeimg     //占位图像文件
        }
      }

    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    statusBar: sysinfo.statusBarHeight,
    windowHeight: sysinfo.windowHeight,
    xImage: 300,
    yImage: 225,
    cScale: 1,
    xOff: 300,
    yOff: 225,
    x: 0,
    y: 0,
    editimg:''
  },

  lifetimes:{
    attached(){
      if (this.data.value){
        if (this.data.csc == 'img') {
          this.setData({ value: value._id ? value._id : value.filepath })
        }
      } else {
        this.setData({ value: require('../../config.js').placeimg})
      }

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
              if (res.width<300 || res.height<225){
                wx.showToast({ title: '照片尺寸太小！' })
              } else {
                let xMaxScall = sysinfo.windowWidth/res.width;
                let yMaxScall = (sysinfo.windowHeight-260)/res.height;
                let imageScall = xMaxScall>yMaxScall ? yMaxScall : xMaxScall;
                let cutScallMax = xMaxScall>yMaxScall ? res.height/225 : res.width/300;
                that.setData({
                  statusBar: sysinfo.statusBarHeight,
                  windowHeight: sysinfo.windowHeight,
                  editimg:restem.tempFilePaths[0],
                  xImage: res.width*imageScall,
                  yImage: res.height*imageScall,
                  cScale: imageScall.toFixed(3),
                  xOff: 300*imageScall,
                  yOff: 225*imageScall,
                  x:0,
                  y:0
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
    onScale({ currentTarget: { id, dataset }, detail }){
      this.setData({
        scScale: detail.scale
      });
      this.ctx.drawImage(this.data.editimg, this.data.x, this.data.y,detail.scale*this.data.xOff, detail.scale*this.data.yOff,0,0, 300, 225);
      this.ctx.draw();
    },
    onChange({ currentTarget: { id, dataset }, detail }){
      let cScale = Number(this.data.cScale);
      this.ctx.drawImage(this.data.editimg,detail.x-this.data.windowWidth*2/75,detail.y-this.data.statusBar-42,cScale*this.data.xOff, cScale*this.data.yOff,0,0, 300, 225);
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
              let png = upng.encode([res.data.buffer],res.width,res.height)
              that.setData({ value: 'data:image/png;base64,'+wx.arrayBufferToBase64(png) });
              that.downModal();
            }
          },that);
          break;
        case 'pic':
          wx.canvasToTempFilePath({
            canvasId: 'cei',
            success: function(resTem){
              that.setData({ value: resTem.tempFilePath });
              that.downModal();
            }
          },that);
          break;
        default:
          wx.canvasToTempFilePath({
            canvasId: 'cei',
            success: function(resTem){
              that.setData({ value: {filepath:resTem.tempFilePath, e:value.explain } });
              that.downModal();
            }
          },that);
          break;
      }
    }
  }
})
