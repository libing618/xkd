const db = wx.cloud.database();
const { updateData } = require('initupdate');
const menuKeys=['manage', 'plan', 'production', 'customer'];
import { openWxLogin } from '../model/wxcloudcf';
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
function fetchMenu(roleData) {
  return new Promise((resolve, reject) => {
    new AV.Query('userInit')
    .equalTo('initName', roleData.user.userRolName)
    .notEqualTo('updatedAt', new Date(roleData.wmenu.updatedAt))
    .select(menuKeys)
    .find().then(fetchMenu => {
      if (fetchMenu.length > 0) {                          //菜单在云端有变化
        roleData.wmenu = fetchMenu[0].toJSON();
        menuKeys.forEach(mname => {
          roleData.wmenu[mname] = roleData.wmenu[mname].filter(rn => { return rn != 0 });
        });
      };
      wx.getUserInfo({        //检查客户信息
        withCredentials: false,
        success: function ({ userInfo }) {
          if (userInfo) {
            let updateInfo = false;
            for (var iKey in userInfo) {
              if (userInfo[iKey] != roleData.user[iKey]) {             //客户信息有变化
                updateInfo = true;
                roleData.user[iKey] = userInfo[iKey];
              }
            };
            if (updateInfo) {
              AV.User.become(AV.User.current().getSessionToken()).then((rLoginUser) => {
                rLoginUser.set(userInfo).save().then(() => { resolve(true) });
              })
            } else {
              resolve(false);
            };
          }
        }
      });
    });
  }).then(uMenu => {
    return new Promise((resolve, reject) => {
      if (roleData.user.unit != '0') {
        return new AV.Query('_Role')
          .notEqualTo('updatedAt', new Date(roleData.uUnit.updatedAt))
          .equalTo('objectId', roleData.user.unit).first().then(uRole => {
            if (uRole) {                          //本单位信息在云端有变化
              roleData.uUnit = uRole.toJSON();
            };
            if (roleData.uUnit.sUnit != '0') {
              return new AV.Query('_Role')
                .notEqualTo('updatedAt', new Date(roleData.sUnit.updatedAt))
                .equalTo('objectId', roleData.uUnit.sUnit).first().then(sRole => {
                  if (sRole) {
                    roleData.sUnit = sRole.toJSON();
                  };
                  resolve(roleData);
                }).catch(console.error)
            } else { resolve(roleData) }
          }).catch(console.error)
      } else { resolve(roleData) };
    });
  }).catch(console.error);
};
function exitPage(){
  wx.showToast({ title: '权限不足请检查', duration: 2500 });
  setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
};

module.exports = {

loginAndMenu: function (roleData) {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: 'roleData',
      success: function (res) {
        if (res.data) { roleData.user = res.data };
        resolve(roleData)
      },
      fail: function(){
        resolve(roleData)
      }
    })
  }).then(rData=>{
    return new Promise((resolve, reject) => {
      if (rData.user._id != '0') {             //用户如已注册并在本机登录过,则有数据缓存，否则进行注册登录
        if (rData.user.mobilePhoneNumber != '0') {
          fetchMenu(rData).then((rfmData) => { resolve(rfmData) });
        } else {
          resolve(rData);
        };
      } else {
        wx.getSetting({
          success:(res)=> {
            if (res.authSetting['scope.userInfo']) {                   //用户已经同意小程序使用用户信息
              openWxLogin(rData).then(rlgData => {
                if (rlgData.user.mobilePhoneNumber != '0') {
                  fetchMenu(rlgData).then(rfmData => { resolve(rfmData) });
                } else { resolve(rlgData) }
              }).catch((loginErr) => { reject('系统登录失败:' + loginErr.toString()) });
            } else { resolve(roleData) }
          },
          fail: (resFail) => { resolve(roleData) }
        })
      }
    });
  }).catch(console.error);
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
