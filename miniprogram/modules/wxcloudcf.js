const db = wx.cloud.database();
const _ = db.command;

export function openWxLogin() {              //解密unionid并进行注册
    return new Promise((resolve, reject) => {
      wx.login({
        success: function (wxlogined) {
          if (wxlogined.code) {
            wx.getUserInfo({
              withCredentials: true,
              lang: 'zh_CN',
              success: function (wxuserinfo) {
                if (wxuserinfo.errMsg=='getUserInfo:ok') {
                  wx.cloud.callFunction({                  // 调用云函数
                    name: 'login',
                    data: { code: wxlogined.code, encryptedData: wxuserinfo.encryptedData, iv: wxuserinfo.iv, loginState:0 }
                  }).then(res => {
                    let roleData = {
                      user: {                          //用户的原始定义
                        updatedAt: db.serverDate(),
                        line: 9,                   //条线
                        position: 9,               //岗位
                        nickName: res.result.nickName,
                        gender: res.result.gender,
                        language: res.result.language,
                        city: res.result.city,
                        province: res.result.province,
                        country: res.result.country,
                        avatarUrl: res.result.avatarUrl,
                        uName: res.result.nickName,
                        unionid: res.result.unionId || null,
                        unit: '0',
                        mobilePhoneNumber: "0"
                      }
                    };
                    db.collection('_User').add({
                      data: roleData.user
                    }).then(_id => {
                      roleData.user._id = _id;
                      roleData.wmenu = [            //用户刚注册时的基础菜单
                        [100, 107, 108, 109, 110, 111, 114],
                        [200, 201, 202, 203, 204],
                        [308],
                        [401]
                      ];
                      roleData.uUnit = { };            //用户单位信息（若有）
                      roleData.sUnit = { };
                      resolve(roleData);
                      }).catch(err => { reject({ ec: 2, ee: err }) })     //云端注册失败
                  }).catch(err => {
                    reject({ ec: 1, ee: err })     //云端解密失败
                  })
                }
              }
            })
          } else { reject({ ec: 3, ee: '微信用户登录返回code失败！' }) };
        },
        fail: function (err) { reject({ ec: 4, ee: err.errMsg }); }     //微信用户登录失败
      })
    });
  };

export function getToken(){
  return new Promise((resolve, reject) => {
    db.collection('accessToken').orderBy('accessOverTime', 'asc').limit(1).get().then(({ data }) => {
      if (Date.now() > data[0].accessOverTime) {
        wx.cloud.callFunction({ name: 'wxcustomer', data: { customerState: 0 } }).then(sToken => { resolve(sToken.result) })
      } else {
        resolve(data[0].accessToken)
      }
    }).catch(err => { reject(err) })
  })
};

export function fileUpload(cSavePath, filePath, fe) {
  return new Promise((resolve, reject) => {
    let nameIndex = filePath.lastIndexOf("\\");
    let fileName = filePath.substring(nameIndex+1);
    wx.showLoading({title:'正在上传《'+fe+'》',mack:true})
    wx.cloud.uploadFile({
      cloudPath: 'f'+cSavePath+'\\'+fileName,
      filePath: filePath
    }).then( res => {
      wx.hideLoading()
      resolve(fileName)
    }).catch(e => {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '上传失败'+e.errMsg,
      })
    })
  })
}
