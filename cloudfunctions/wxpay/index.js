// 云函数入口函数
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
var Pay = require('./src/pay');
var pfxContent = fs.readFileSync("<location-of-your-apiclient-cert.p12>")
var pay = new Pay(pfxContent);
exports.main = (event, context) => {
  pay[event.payType]({event.payParams}).then(result=>{
    db.collection('payStream').add({
      data:{
        openid: userInfo.appId,
        payType: event.payType,
        timeStamp: Date.now(),
        packPage: result
      }
    })
  })
}
