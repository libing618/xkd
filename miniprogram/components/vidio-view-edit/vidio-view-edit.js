var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    value: {
      type: Object,
      value: {
        _id:require('../../config.js').video      //占位视频文件
      }
    },
    p: {
      type: String,
      value: '视频文件',
    },
    editen: {
      type: Boolean,
      value: false,
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    vdsrc: '',
    animationData: {},
    showModalBox: false
  },
  lifetimes:{
    attached(){
      this.videoContext = wx.createVideoContext('myVideo');
    }
  },
  methods: {
    choosevideo: function (e) {                         //选择视频文件
      var that = this;
      return new Promise((resolve,reject)=>{
        if (editen){
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
