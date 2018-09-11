// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async ({ userInfo, pModel, dObjectId, sData, processState }, context) => {
  function setRole(dProcedure,userId,sLine,sPosition) {
    return new Promise((resolve, reject) => {
      if (dProcedure == '_Role') {                    //是否单位审批流程
        db.collection('_User').doc(userId).update({
          data: {                   //负责人的ID与单位ID相同
            line: sLine,
            position: sPosition
          }
        }).then(() => { resolve(true) })
      } else { resolve(false) }
    }).catch(console.error);
  };
  return new Promise((resolve, reject) => {
    switch (processState) {
      case 1:                    //审批流程修改流程记录
        db.collection('sengpi').doc(dObjectId).update({ data: sData }).then(pEnd => {
          resolve(pEnd.stats)
        }).catch(err => { reject(err) })
        break;
      case 2:                    //审批流程结束修改原记录的发布
        db.collection(pModel).doc(dObjectId).update({ data: sData }).then(pEnd => {
          setRole(pModel, dObjectId,8,8).then(() => { resolve(pEnd.stats) })
        }).catch(err => { reject(err) })
        break;
      
      default:
    }
  });
}