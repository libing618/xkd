var modalBehavior = require('../utils/poplib.js');
const placeFile = require('../../config.js').placevideo;      //占位视频文件
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    name: String,
    value: String,
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    explain: '视频文件说明',
    placefile: placeFile,
    filepath: placeFile
  },
  lifetimes:{
    attached(){
      this.fileNameAnaly(this.data.value,'/video/').then(()=>{
        this.videoContext = wx.createVideoContext('myVideo')
      });
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
        that.setData({filepath:vdsrc});
        that.popModal();
      }).catch(console.error)
    },

    fSave: function({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      this.setData({
        value: {f:this.data.filepath,e:this.data.explain}
      });
      this.downModal()
    }
  }
})
