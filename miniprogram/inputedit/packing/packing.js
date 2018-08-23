// inputedit/packing.js
var {cosUploadFile} = require('../../model/initForm');
var app = getApp()
Page({
  data: {
    navBarTitle: '编辑--',              //申请项目名称
    statusBar: app.sysinfo.statusBarHeight,
    sPages: [{
      pageName: 'editFields'
    }],
    selectd: -1,                       //详情项选中字段序号
    enMenu: 'none',                  //‘插入、删除、替换’菜单栏关闭
    enIns: true,                  //插入grid菜单组关闭
    targetId: '0',              //流程申请表的ID
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    showModalBox: false,
    animationData: {},              //弹出动画
    vData: {},
    iFormat: []
  },
  onLoad: function (options) {        //传入参数为tgId或pNo/artId
    var that = this;
    wx.downloadFile({
      url: 'https://lg-la2p7duw-1254249743.cos.ap-shanghai.myqcloud.com/agree/P020130603537924184482.doc',
      success: function(res) {
    // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success:(sf)=>{
              wx.openDocument({filePath:sf.savedFilePath})
            }
          })
        }
      }
    })
  },
  simpleUpload:function () {
    wx.chooseImage({    // 选择文件
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          cosUploadFile(res.tempFilePaths[0]);
        }
    })
  }
})
