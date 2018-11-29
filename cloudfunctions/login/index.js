const cloud = require('wx-server-sdk')
cloud.init({env:'cyfwtest-07b693'})
const db = cloud.database()
const _ = db.command
const mRole = require('roleMenu');
//loginState为0、第一次授权，1、已授权，2、读手机号，3、重新登录获得session_key
exports.main = async ({ code, encryptedData, iv,loginState }, context) => {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();     //微信小程序APPID
  const secret = process.env.secret;     //微信小程序secret
  function reqSession(rcode){
    return new Promise((resolve, reject) => {
      if (rcode=='sessionOk'){
        db.collection('miniProgramSession').doc(OPENID).get().then(({data}) => {
          resolve(data.sessionKey)
        }).catch(err => { resolve(false)})
      } else {
        resolve(false)
      }
    }).then(sessionOk=>{
      return new Promise((resolve, reject) => {
        if (sessionOk){
          resolve(sessionOk)
        } else {
          var requestWx = require('request');
          var wxurl = 'https://api.weixin.qq.com/sns/jscode2session?APPID=' + APPID + '&secret=' + secret + '&js_code=' + rcode + '&grant_type=authorization_code';
          requestWx({ url: wxurl, header: { 'content-type': 'application/json' }, }, function (err, res, body) {
            if (!err) {
              var wxLoginInfo = JSON.parse(body);
              var wxsk = String(wxLoginInfo.session_key);
              db.collection('miniProgramSession').doc(OPENID).get().then(({ data }) => {
                if (data) {
                  db.collection('miniProgramSession').doc(OPENID).update({
                    data: {
                      sessionKey: wxsk
                    }
                  }).then(() => {
                    resolve(wxsk)
                  })
                }
              }).catch( serr=> {
                db.collection('miniProgramSession').add({
                  data: {
                    _id: OPENID,
                    sessionKey: wxsk
                  }
                }).then(() => {
                  resolve(wxsk)
                });
              })

            } else {
              reject(err);
            }
          });
        }
      });
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
        if (decoded.watermark.appid == APPID) {
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
          _openid: OPENID
        })
        .get()
        .then(user => {
          let roleData = {
            user: user.data[0],
            uUnit: {},
            sUnit: {}
          };
          if (roleData.user.line != 9) {
            db.collection('_Role').doc(roleData.user.unit).get().then(uRole => {
              roleData.wmenu = mRole['m' + uRole.data.afamily+roleData.user.line + roleData.user.position]
              roleData.uUnit = uRole.data;
              if (roleData.uUnit.sUnit != '0') {
                db.collection('_Role').doc(roleData.uUnit.sUnit).get().then(sRole => {
                  if (sRole.data) {
                    roleData.sUnit = sRole.data;
                  };
                  resolve(roleData);
                });
              } else { resolve(roleData) }
            })
          } else {
            roleData.wmenu = mRole['m0' + roleData.user.line + roleData.user.position]
            resolve(roleData)
          };
        }).catch (error=> { reject(error) });
        break;
      case 2:
        reqSession(code).then(wxsk=>{
          deWxCode(wxsk).then(dewxcoded=>{
            db.collection('_User').where({
              _openid: OPENID
            }).update({                         //设置并保存手机号
              data:{
                mobilePhoneNumber: dewxcoded.phoneNumber,
                updatedAt: db.serverDate()
              }
            }).then(()=>{
              resolve({phoneNumber:dewxcoded.phoneNumber});
            })
          })
        }).then(err=>{reject(err);});
        break;
      default:
        reqSession(code).then(()=>{
          resolve({sessionOk:true})
        }).catch(err=>{ reject(err) });
        break;
    }
  });
}
