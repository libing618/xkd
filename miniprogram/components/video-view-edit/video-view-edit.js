const sysinfo = getApp().sysinfo;
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    value: {
      type: Object,
      value: {
        _id:require('../../config.js').placevideo      //占位视频文件
      }
    },
    p: {
      type: String,
      value: '视频文件',
    },
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    statusBar: sysinfo.statusBarHeight,
    windowHeight: sysinfo.windowHeight,
    vdsrc: ''
  },
  lifetimes:{
    attached(){
      this.videoContext = wx.createVideoContext('myVideo');
      if (this.data.editable==2){ this.choosevideo() }
    }
  },
  methods: {
    choosevideo: function () {                         //选择视频文件
      var that = this;
      return new Promise((resolve,reject)=>{
        if (editable){
          wx.chooseVideo({
            sourceType: ['album', 'camera'],
            maxDuration: 60,
            camera: 'back',
            success: function (res) {
              resolve(res.tempFilePath)
            },
            fail: function () { wx.showToast({ title: '选取视频失败！' }) }
          });
        } else { resolve(value._id ? value._id : value.filepath) }
      }).then(vdsrc=>{
        that.setData({vdsrc:vdsrc});
        that.popModal();
      }).catch(console.error)
    },

    fSave: function({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      this.setData({
        value: {filepath:this.data.vdsrc,e:value.explain}
      });
      this.downModal()
    }
  }
})
