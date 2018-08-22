exports.main = ({ userInfo, code, encryptedData, iv }, context) => {
  const appid = userInfo.appId;     //微信小程序appid
  const secret = process.env.secret;     //微信小程序secret
  var requestWx = require('request');
  var wxurl = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code';
  return new Promise((resolve, reject) => {
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
  }).then(res => {
    return res
  })
}