const db = wx.cloud.database();
const { updateData } = require('initupdate');
const { openWxLogin } = require('wxcloudcf');
const COS = require('../libs/cos-wx-sdk-v5')
var cos = new COS({
  getAuthorization: function (params, callback) {//获取签名 必填参数
    var authorization = COS.getAuthorization({
      SecretId: 'AKIDkJdhV4nUM2ThhTxukKflcDZfV5RXt5Ui',
      SecretKey: 'A5lCRSFpEQN6aqsfDVYMuEI6f081g8LK',
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

function exitPage(){
  wx.showToast({ title: '权限不足请检查', duration: 2500 });
  setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
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
      if (rData.user._id != '0') {             //用户如已注册并在本机登录过,则有数据缓存，否则进行注册登录
        wx.checkSession({
          success: function(){            //session_key 未过期，并且在本生命周期一直有效
            wx.cloud.callFunction({ name: 'login',data:{sessionState:3} }).then((rfmData) => {
              resolve(rfmData.result)
            });
          },
          fail: function(){
            openWxLogin(2).then(rlgData => { resolve(rlgData) });
          }
        })
      } else {
        openWxLogin(1).then(rlgData => { resolve(rlgData) });
      }
    });
  }).then(reData=>{
    return new Promise((resolve, reject) => {
      wx.getUserInfo({        //检查客户信息
        withCredentials: false,
        lang: 'zh_CN',
        success: function ({ userInfo }) {
          if (userInfo) {
            let updateInfo = false,updateData={};
            for (var iKey in userInfo) {
              if (userInfo[iKey] != reData.user[iKey]) {             //客户信息有变化
                updateInfo = true;
                reData.user[iKey] = userInfo[iKey];
                updateData[iKey] = userInfo[iKey];
              }
            };
            if (updateInfo) {
              db.collection('_User').doc(reData.user._id).update({
                data: updateData
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
  }).catch((loginErr) => { reject('系统登录失败:' + loginErr.toString()) });
},

checkRols: function(ouRole,user){
  let uRoleName = user.userRolName.split('.')
  if (uRoleName[1]=='admin' && user.unitVerified){
    return true;
  } else {
    if (parseInt(uRoleName[1])==ouRole && user.unitVerified) {
      return true;
    } else {
      exitPage();
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

unitData: function(cName,uId){
  let uData = {};
  let unitId = uId ? uId : app.roleData.uUnit.objectId;
  if (app.mData[cName][unitId]) { app.mData[cName][unitId].forEach(cuId => { uData[cuId]=app.aData[cName][cuId]})};
  return uData;
},

allUnitData: function(dataClass, unitId) {
  updateData(true, dataClass, unitId).then(() => {
    let readDown = Promise.resolve(updateData(false, dataClass, unitId)).then(notEnd => {
      if (notEnd) {
        return readDown();
      } else {
        return true;
      }
    });
  });
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
