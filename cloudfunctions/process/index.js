// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async ({ userInfo, pModel, dObjectId, sData, processState }, context) => {
  function setRole(userId,sLine,sPosition) {
    return new Promise((resolve, reject) => {
      if (pModel=='_Role'){
        db.collection('_User').doc(userId).update({
          data: {                   //负责人的ID与单位ID相同
            line: sLine,
            position: sPosition,
            updatedAt: db.serverData()
          }
        }).then(() => {
          resolve(true)
        })
      } else {
        resolve(true)
      }
    }).catch(error=>{reject(error)});
  };
  function userRole(){           //获取用户数据
    db.collection('_User').where({
      _openid: userInfo.openId
    }).get().then(({data}) => {
      let user = data[0];
      if (user.unit == '0' || user.line==9) {
        reject({errMsg:'用户没有审批权限'})
      } else {
        user.processRole = user.uUnit+user.line+user.position;
        resolve(user)
      };
    }).catch (error=> { reject(error) });
  }
  sData.updatedAt = db.serverData();
  return new Promise((resolve, reject) => {
    switch (processState) {
      case 0:                    //查询待用户批的流程
        userRole().then(user=>{
          let reqProcess = db.collection('sengpi').where({
            cFlowStep: user.processRole,
            updatedAt: sData.isDown=='asc' ? _.gt(sData.rDate[1]) : _.lt(sData.rDate[0])
          })
          reqProcess.count().then(qCount=>{
            if (qCount.total>0){
              reqProcess.orderBy('updatedAt',sData.isDown).limit(20).get().then(({data}) => {
                resolve({total:qCount.total,records:data})
              })
            } else {
              resolve({total:0,records:[]})
            }
          })
        }).catch(err => { reject(err) })
        break;
      case 1:                    //查询待用户处理过未发布的流程
        userRole().then(user=>{
          let reqProcess = db.collection('sengpi').where({
            processUser: user._id,    //已处理人ID
            processState: 1,
            updatedAt: sData.isDown=='asc' ? _.gt(sData.rDate[1]) : _.lt(sData.rDate[0])
          })
          reqProcess.count().then(qCount=>{
            if (qCount.total>0){
              reqProcess.orderBy('updatedAt',sData.isDown).limit(20).get().then(({data}) => {
                resolve({total:qCount.total,records:data})
              })
            } else {
              resolve({total:0,records:[]})
            }
          })
        }).catch(err => { reject(err) })
        break;
      case 2:                    //查询用户岗位可阅读和审批过的已发布流程
        userRole().then(user=>{
          let reqProcess = db.collection('sengpi').where({
            processUser: user._id,    //已处理人ID
            processState: 2,
            updatedAt: sData.isDown=='asc' ? _.gt(sData.rDate[1]) : _.lt(sData.rDate[0])
          })
          reqProcess.count().then(qCount=>{
            if (qCount.total>0){
              reqProcess.orderBy('updatedAt',sData.isDown).limit(20).get().then(({data}) => {
                resolve({total:qCount.total,records:data})
              })
            } else {
              resolve({total:0,records:[]})
            }
          })
        }).catch(err => { reject(err) })
        break;
      case 3:                    //审批流程修改流程记录
        db.collection('sengpi').doc(dObjectId).update({ data: sData }).then(pEnd => {
          resolve(pEnd.stats)
        }).catch(err => { reject(err) })
        break;
      case 4:                    //审批，修改原记录后发布
        if (pModel=='_Role') {
          delete sData.uPhoto;     //删除证件照
          delete sData.pPhoto;     //删除申请人照
          sData.unitUsers.forEach((unitUser,i)=>{
            if(unitUser.userId==dObjectId){ sData.unitUsers[i].line=9}
          })
        }
        db.collection(pModel).doc(dObjectId).update({ data: sData }).then(pEnd => {
          setRole(dObjectId,8,8).then(() => { resolve(pEnd.stats) })
        }).catch(err => { reject(err) })
        break;
      case 5:                    //查询申请单位岗位的用户
        db.collection('_User').where({
          unit:dObjectId,
          line: 9,
          position: 7,
          updatedAt: sData.isDown=='asc' ? _.gt(sData.rDate[1]) : _.lt(sData.rDate[0])
        }).orderBy('updatedAt',sData.isDown).limit(20).get().then(rUsers => {
          resolve(rUsers.data)
        }).catch(err => { reject(err) })
        break;
      default:
    }
  });
}
