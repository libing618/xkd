//消息编辑发送框
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    sIndex: 0,
    mgrids: ['产品','图像','音频','视频','位置','文件']
  },

  /**
   * 组件的方法列表
   */
  methods: {
    fMultimedia(){
      this.setData({enMultimedia: !this.data.enMultimedia});
    },
    iMultimedia(){
      let that = this;
      var sIndex = parseInt(e.currentTarget.dataset.n);      //选择的菜单id;
      return new Promise( (resolve, reject) =>{
        let showPage = {};
        switch (sIndex){
          case 1:             //选择产品
            resolve({_id:'0',uName:'选择商品'});
            break;
          case 2:               //选择相册图片或拍照
            wx.chooseImage({
              count: 1, // 默认9
              sizeType: ['original', 'compressed'],             //可以指定是原图还是压缩图，默认二者都有
              sourceType: ['album', 'camera'],                 //可以指定来源是相册还是相机，默认二者都有
              success: function (res) { resolve(res.tempFilePaths[0]) },               //返回选定照片的本地文件路径列表
              fail: function(err){ reject(err) }
            });
            break;
          case 3:               //录音
            wx.startRecord({
              success: function (res) { resolve( res.tempFilePath ); },
              fail: function(err){ reject(err) }
            });
            break;
          case 4:               //选择视频或拍摄
            wx.chooseVideo({
              sourceType: ['album','camera'],
              maxDuration: 60,
              camera: ['front','back'],
              success: function(res) { resolve( res.tempFilePath ); },
              fail: function(err){ reject(err) }
            })
            break;
          case 5:                    //选择位置
            wx.chooseLocation({
              success: function(res){ resolve( { latitude: res.latitude, longitude: res.longitude } ); },
              fail: function(err){ reject(err) }
            })
            break;
          case 6:                     //选择文件
            resolve({'选择文件'});
            break;
          default:
            resolve('输入文字');
            break;
        }
      }).then( (wcontent)=>{
        that.setData({ mtype: -sIndex ,wcontent: content });
      })
    }
  }
})
