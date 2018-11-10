const placeFile = require('../../config.js').placeaudio      //占位音频文件
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    name: String,
    value: String,
    p: {
      type: String,
      value: '单频文件',
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
    explain: '单频文件说明',
    placefile: placeFile,
    filepath: placeFile
  },
  lifetimes:{
    attached(){
      this.fileNameAnaly(this.data.value,'/audio/').then(()=>{
        this.videoContext = wx.createVideoContext('myAudio');
      });
      if (this.data.editable==2){ this.chooseaudio() }
    }
  },
  methods: {
    chooseaudio: function () {                         //选择视频文件
      var that = this;
      return new Promise((resolve,reject)=>{
        if (this.data.editable){
          wx.startRecord({
            success: function (res) {
              wx.saveFile({
                tempFilePath: res.tempFilePath,
                success: function (cres) { resolve(cres.savedFilePath); },
                fail: function (cerr) { reject('录音文件保存错误！') }
              });
            },
            fail: function () { wx.showToast({ title: '选取视频失败！' }) }
          });
        } else { resolve(value._id ? value._id : value.filepath) }
      }).then(audsrc=>{
        that.setData({filepath:audsrc});
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
