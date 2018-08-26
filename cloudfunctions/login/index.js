const cloud = require('wx-server-sdk')
cloud.init({env:'cyfwtest-07b693'})
const db = cloud.database()
const _ = db.command
const menuKeys=['manage', 'plan', 'production', 'customer'];
const mRole = {
  m00:[]
};
function fetchMenu(openid){
  return new Promise((resolve, reject) => {
    db.collection('_User').doc(openid).get().then(user=>{
      let roleData = {
        user: user.data,
        uUnit:{},
        sUnit:{}
      };
      roleData.wmenu = mRole['m'+user.line+user.position]
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
    });
  }).catch(console.error);
};
//sessionState为0、第一次授权，1、已授权未登录，2、session过期，3、session未过期
exports.main = ({ userInfo, code, encryptedData, iv,sessionState }, context) => {
  const appid = userInfo.appId;     //微信小程序appid
  const secret = process.env.secret;     //微信小程序secret
  return new Promise((resolve, reject) => {
    if (sessionState>1) {
      resolve({openid:userInfo.openid});
    } else {
      var requestWx = require('request');
      var wxurl = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code';
      requestWx({ url: wxurl, header: { 'content-type': 'application/json' }, }, function (err, res, body) {
        if (!err) {
          var wxLoginInfo = JSON.parse(body);
          var crypto = require('crypto');
          var wxsk = String(wxLoginInfo.session_key);
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
        } else {
          reject(err);
        }
      });
    }
  }).then(user => {
    switch (sessionState) {
      case 0:
        return user
        break;
      case 1:
        fetchMenu(user.openid).then(roleData=>{
          return roleData
        }).catch(return user)
        break;
      default:
        fetchMenu(user.openid).then(roleData=>{
          return roleData
        }).catch(error=>{return error})
    }
  })
}
