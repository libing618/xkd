const db = wx.cloud.database();
function wxUserSignup(user){
  return new Promise((resolve, reject) => {
    db.collection('_User').add({
      data: {                                     //用户的原始定义
        _id: user.openid,
        line: 9,                   //条线
        position: 9,               //岗位
        nickName: user.nickName,
        gender: user.gender,
        language: user.language,
        city: user.city,
        province: user.province,
        country: user.country,
        avatarUrl: user.avatarUrl
        uName: user.nickName,
        unionid: user.unionid,
        unit: '0',
        unitVerified: false,
        mobilePhoneNumber: "0"
      }
    }).then(_id=>{ resolve(_id) });
  }).catch(err=> { reject(err) })
};
module.exports = {
  openWxLogin: function (sState) {              //登录sState为0、第一次授权，1、已授权未登录，2、session过期
    return new Promise((resolve, reject) => {
      wx.login({
        success: function (wxlogined) {
          if (wxlogined.code) {
            wx.getUserInfo({
              withCredentials: true,
              success: function (wxuserinfo) {
                if (wxuserinfo) {
                  wx.cloud.callFunction({                  // 调用云函数
                    name: 'login',
                    data: { code: wxlogined.code, encryptedData: wxuserinfo.encryptedData, iv: wxuserinfo.iv, sessionState: sState }
                  }).then(res => {
                    if (res.result.user){
                      resolve(res.result)
                    } else {
                      wxuserinfo.openid = res.result.openid;
                      wxuserinfo.unionid = res.result.unionid || null;
                      wxUserSignup(wxuserinfo).then(()=>{
                        let roleData = {
                          user: wxuserinfo,
                          wmenu: {
                            manage:[100,114],                         //用户刚注册时的基础菜单
                            plan:[],
                            production:[],
                            customer:[]
                          },
                          uUnit:{},                           //用户单位信息（若有）
                          sUnit:{}
                        };
                        resolve(roleData);
                      })
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
