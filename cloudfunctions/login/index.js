const cloud = require('wx-server-sdk')
cloud.init({env:'cyfwtest-07b693'})
const db = cloud.database()
const _ = db.command
const mRole = require('roleMenu');
//loginState为0、第一次授权，1、已授权，2、读手机号
exports.main = async ({ userInfo, code, encryptedData, iv,loginState }, context) => {
  const appid = userInfo.appId;     //微信小程序appid
  const secret = process.env.secret;     //微信小程序secret
  function reqSession(rcode){
    return new Promise((resolve, reject) => {
      if (rcode=='sessionOk'){
        db.collection('miniProgramSession').doc(userInfo.openId).get().then(sk=>{resolve(sk.data.sessionKey)}).catch(err=>{reject(err)})
      } else {
        var requestWx = require('request');
        var wxurl = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + rcode + '&grant_type=authorization_code';
        requestWx({ url: wxurl, header: { 'content-type': 'application/json' }, }, function (err, res, body) {
          if (!err) {
            var wxLoginInfo = JSON.parse(body);
            var wxsk = String(wxLoginInfo.session_key);
            db.collection('miniProgramSession').doc(userInfo.openId).set({
              data:{
                sessionKey: wxsk
              }
            });
            resolve(wxsk)
          } else {
            reject(err);
          }
        });
      }
    });
  };
  function deWxCode(wxsk){
    return new Promise((resolve, reject) => {
      var crypto = require('crypto');
      var ecData = new Buffer(encryptedData, 'base64');
      var niv = new Buffer(iv, 'base64');
      var wxSession = new Buffer(wxsk, 'base64');
      try {                    // 解密
        var decipher = crypto.createDecipheriv('aes-128-cbc', wxSession, niv);    // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true);
        var decoded = decipher.update(ecData, 'binary', 'utf8');
        decoded = decoded + decipher.final('utf8');
        decoded = JSON.parse(decoded);
        if (decoded.watermark.appid == appid) {
          resolve(decoded);
        } else {
          reject('解密后appid不一致');
        }
      } catch (cerr) {
        reject('解密中出现错误：' + cerr);
      }
    });
  }
  return new Promise((resolve, reject) => {
    switch (loginState) {
      case 0:
        reqSession(code).then(wxsk=>{
          deWxCode(wxsk).then(dewxcoded=>{
            resolve(dewxcoded)
          })
        }).catch(err=>{ reject(err) });
        break;
      case 1:
        db.collection('_User').where({
          _openid: userInfo.openId
        })
        .get()
        .then(user => {
          let roleData = {
            user: user.data[0],
            uUnit: {},
            sUnit: {}
          };
          roleData.wmenu = mRole['m' + roleData.user.line + roleData.user.position]
          if (roleData.user.unit != '0') {
            db.collection('_Role').doc(roleData.user.unit).get().then(uRole => {
              if (uRole.data) {                          //本单位信息在云端有变化
                roleData.uUnit = uRole.data;
                if (roleData.uUnit.sUnit != '0') {
                  db.collection('_Role').doc(roleData.uUnit.sUnit).get().then(sRole => {
                    if (sRole.data) {
                      roleData.sUnit = sRole.data;
                    };
                    resolve(roleData);
                  });
                } else { resolve(roleData) }
              } else { resolve(roleData) };
            })
          } else { resolve(roleData) };
        }).catch (error=> { reject(error) });
        break;
      default:
        reqSession(code).then(wxsk=>{
          deWxCode(wxsk).then(dewxcoded=>{
            db.collection('_User').where({
              _openid: userInfo.openId
            }).update({                         //设置并保存手机号
              data:{
                mobilePhoneNumber: decoded.phoneNumber,
                updatedAt: db.serverDate()
              }
            }).then(()=>{
              resolve(decoded.phoneNumber);
            })
          })
        }).then(err=>{reject(err);});
        break;
    }
  });
}
