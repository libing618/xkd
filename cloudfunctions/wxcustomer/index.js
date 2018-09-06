// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    switch (event.customerState){
      case 0:
        let getAccessToken = require('./src/webtoken')
        getAccessToken().then(rest => {
          setInterval(getAccessToken(),7200000);
          resolve(rest)
        }).catch(err => { reject(err) })
        break;
      default:

    }

  })
}
