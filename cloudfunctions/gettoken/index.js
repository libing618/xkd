// 云函数入口文件
const cloud = require('wx-server-sdk')
const request = require('request');
const qs = require('qs');
cloud.init()
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  let reqUrl = 'https://api.weixin.qq.com/cgi-bin/token?';
  let params = {
    appid: process.env.appid,     //微信小程序appid
    secret: process.env.secret,     //微信小程序secret
    grant_type: 'client_credential'
  };
  let options = {
    method: 'get',
    url: reqUrl + qs.stringify(params)
  };
  return new Promise((resolve, reject) => {
    request(options, function (err, res, body) {
      if (res) {
        let access_info = JSON.parse(body);
        db.collection('accessToken').add({
          data: { accessToken: access_info.access_token, accessOverTime: Date.now() + 7200000 }
        }).then(resid => {
          resolve(access_info.access_token);
        }).catch(adderr => { reject(adderr) })
      } else {
        console.log('get access error:', err);
        reject(err);
      }
    });
  })
}