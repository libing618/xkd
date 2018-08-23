module.exports = {
  openWxLogin: function () {              //取无登录状态数据
    return new Promise((resolve, reject) => {
      wx.login({
        success: function (wxlogined) {
          if (wxlogined.code) {
            wx.getUserInfo({
              withCredentials: true,
              success: function (wxuserinfo) {
                if (wxuserinfo) {
                  wx.cloud.callFunction({                  // 调用云函数
                    name: 'login1',
                    data: { code: wxlogined.code, encryptedData: wxuserinfo.encryptedData, iv: wxuserinfo.iv }
                  }).then(res => {
                    if (res.errMsg == "request:ok"){
                      app.globalData.openid = res.result.oId
                      wx.setStorage({ key: 'loginInfo', data: res.result })
                      resolve(res.result)
                    }
                  }).catch(err => {
                    reject({ ec: 1, ee: err })     //云端登录失败
                  })
                }
              }
            })
          } else { reject({ ec: 3, ee: '微信用户登录返回code失败！' }) };
        },
        fail: function (err) { reject({ ec: 4, ee: err.errMsg }); }     //微信用户登录失败
      })
    });
  },

  fileUpload: function (cloudPath, filePath) {
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)

        app.globalData.fileID = res.fileID
        app.globalData.cloudPath = cloudPath
        app.globalData.imagePath = filePath

        wx.navigateTo({
          url: '../storageConsole/storageConsole'
        })
      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
}