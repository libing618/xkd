const db = wx.cloud.database();
const { openWxLogin } = require('wxcloudcf');
const COS = require('../libs/cos-wx-sdk-v5');
const config = require('../config');
var cos = new COS({
  getAuthorization: function (params, callback) {//获取签名 必填参数
    var authorization = COS.getAuthorization({
      SecretId: config.SecretId,
      SecretKey: config.SecretKey,
      Method: params.Method,
      Key: params.Key
    });
    callback(authorization);
  }
});
var app = getApp();
function requestCallback(err, data) {
  if (err && err.error) {
    wx.showModal({title: '上传文件', content: '请求失败：' + err.error.Message + '；状态码：' + err.statusCode, showCancel: false});
  } else if (err) {
    wx.showModal({title: '上传文件', content: '请求出错：' + err + '；状态码：' + err.statusCode, showCancel: false});
  } else { return data}
};

module.exports = {

loginAndMenu: function (roleData) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success:(res)=> {
        if (res.authSetting['scope.userInfo']) {            //用户已经同意小程序使用用户信息
          wx.getStorage({
            key: 'roleData',
            success: function (res) {
              resolve(res.data)
            },
            fail: function(){
              resolve(roleData)
            }
          })
        } else { resolve(roleData) }
      },
      fail: (resFail) => { reject('用户没有授权登录') }
    })
  }).then(rData=>{
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({ name: 'login',data:{loginState:1} }).then((rfmData) => {
        resolve(rfmData.result)           //用户如已注册则返回菜单和单位数据，否则进行注册登录
      }).catch(err=>{
        openWxLogin().then(rlgData => {
          resolve(rlgData)
        }).catch(err=> { reject(err) });
      });
    });
  }).then(reData=>{
    return new Promise((resolve, reject) => {
      wx.getUserInfo({        //检查客户信息
        withCredentials: false,
        lang: 'zh_CN',
        success: function ({ userInfo }) {
          if (userInfo) {
            let updateInfo = false,gData={};
            for (var iKey in userInfo) {
              if (userInfo[iKey] != reData.user[iKey]) {             //客户信息有变化
                updateInfo = true;
                reData.user[iKey] = userInfo[iKey];
                gData[iKey] = userInfo[iKey];
              }
            };
            if (updateInfo) {
              db.collection('_User').doc(reData.user._id).update({
                data: gData
              }).then(() => {
                resolve(reData);
              })
            } else {
              resolve(reData);
            };
          }
        }
      });
    });
  }).catch((loginErr) => { reject('系统登录失败:' + JSON.stringify(loginErr) ) });
},

checkRols: function(ouLine,user,ouPosition){  //要求的条线，用户数据，要求的岗位
  if (user.line==8 && user.position==8){        //单位负责人
    return true;
  } else {
    let verPosition = ouPosition ? user.position==ouPosition : true ;
    if (user.line==ouLine && verPosition) {
      return true;
    } else {
      wx.showToast({ title: '权限不足请检查', duration: 2500 });
      setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);;
      return false
    }
  }
},

shareMessage: function () {
  return {
    title: '侠客岛创业服务平台', // 分享标题
    desc: '扶贫济困，共享良品。', // 分享描述
    path: '/pages/manage/manage' // 分享路径
  }
},

cosUploadFile: function(filePath){
  let Key = filePath.substr(filePath.lastIndexOf('/') + 1); // 这里指定上传的文件名
  cos.postObject({
    Bucket: 'lg-la2p7duw-1254249743',
    Region: 'ap-shanghai',
    Key: Key,
    FilePath: filePath,
    onProgress: function (info) { console.log(JSON.stringify(info)) }
  }, requestCallback);
}
}
