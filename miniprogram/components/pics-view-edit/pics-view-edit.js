var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    value: {
      type: Object,
      value: {
        _id:require('../../config.js').placeaudio      //占位音频文件
      }
    },
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
    audsrc: '',
    animationData: {},
    showModalBox: false
  },
  lifetimes:{
    attached(){
      if (this.data.value) {
        value:['https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/790f500d14e467fe28e3.jpg','https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/ff933806fce411614341.jpg','https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/c4b4edf57363e801162c.jpg','https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/4827cf0d996f80a86266.JPG','https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/d5140a5a494b03139854.jpg','https://e3sl2viw1q4ta7me-10007535.file.myqcloud.com/42e17b8efd6a01896496.JPG']
      };
      if (this.data.editable==2){ this.choosepics() }
    }
  },
  methods: {
    choosepics: function () {                         //选择视频文件
      var that = this;
      return new Promise((resolve,reject)=>{
        if (this.data.editable){
          wx.chooseImage({
            count: 9,                                     // 最多可以选择的图片张数，默认9
            sizeType: ['compressed'],         // original 原图，compressed 压缩图，默认二者都有
            sourceType: ['album', 'camera'],             // album 从相册选图，camera 使用相机，默认二者都有
            success: function (res) {
              resolve(res.tempFilePaths);
            },
            fail: function () { wx.showToast({ title: '选取照片失败！' }) }
          });
        } else { resolve(value._id ? value._id : value.filepath) }
      }).then(audsrc=>{
        that.setData({picssrc:picssrc});
        that.popModal();
      }).catch(console.error)
    },

    fSave: function({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      this.setData({
        value: {filepath:this.data.audsrc,e:value.explain}
      });
      this.downModal()
    }
  }
})
