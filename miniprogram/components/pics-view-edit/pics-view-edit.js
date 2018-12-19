var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    value: Array,
    name: String,
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    explain: [],
    replacefile: false,
    filepaths: placeFiles
  },
  lifetimes:{
    attached(){
      this.fileNameAnaly(this.data.value,this.data.csc);
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
      }).then(picssrc=>{
        that.setData({
          filepaths: picssrc,
          replacefile: true
        });
        that.popModal();
      }).catch(console.error)
    },

    fSave: function({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      this.setData({
        value: {f:this.data.filepaths,e:this.data.explain}
      });
      this.downModal()
    }
  }
})
