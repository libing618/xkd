// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
// 云函数入口函数
exports.main = async ({ pModel, dObjectId, sData, processOperate }, context) => {
  const {OPENID,APPID,UNIONID} = cloud.getWxContext;
  function setRole(userId,sLine,sPosition) {
    return new Promise((resolve, reject) => {
      if (pModel=='_Role'){
        db.collection('_User').doc(userId).update({
          data: {                   //负责人的ID与单位ID相同
            line: sLine,
            position: sPosition,
            updatedAt: db.serverDate()
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
    return new Promise((resolve, reject) => {
      db.collection('_User').where({
        _openid: OPENID
      }).get().then(({data}) => {
        let user = data[0];
        if (user.unit == '0' || user.line==9) {
          reject({errMsg:'用户没有审批权限'})
        } else {
          user.processRole = user.unit+user.line+user.position;
          resolve(user)
        };
      })
    }).catch (error=> { reject(error) });
  }
  sData.updatedAt = db.serverDate();
  return new Promise((resolve, reject) => {
    switch (processOperate) {
      case 0:                    //查询待用户批的流程
        userRole().then(user=>{
          let terms = {
            cFlowStep: user.processRole,
            processState: _.lt(2)
          }
          db.collection('sengpi').where(terms).count().then(qCount=>{
            if (qCount.total>0){
              terms.updatedAt = sData.isDown=='asc' ? _.gt(new Date(sData.rDate[1])) : _.lt(sData.rDate[0]);
              db.collection('sengpi').where(terms).orderBy('updatedAt',sData.isDown).limit(20).get().then(({data}) => {
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
          let terms = {
            processUser: db.RegExp({regexp:user._id}),    //已处理人ID
            cFlowStep: _.neq(user.processRole),
            processState: 1
          }
          db.collection('sengpi').where(terms).count().then(qCount=>{
            if (qCount.total>0){
              terms.updatedAt = sData.isDown=='asc' ? _.gt(new Date(sData.rDate[1])) : _.lt(sData.rDate[0]);
              db.collection('sengpi').where(terms).orderBy('updatedAt',sData.isDown).limit(20).get().then(({data}) => {
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
          let terms = {
            processUser: db.RegExp({regexp:user._id}),    //已处理人ID
            processState: 2,
          };
          db.collection('sengpi').where(terms).count().then(qCount=>{
            if (qCount.total>0){
              terms.dProcedure = pModel;
              terms.updatedAt = sData.isDown=='asc' ? _.gt(new Date(sData.rDate[1])) : _.lt(sData.rDate[0]);
              db.collection('sengpi').where(terms).orderBy('updatedAt',sData.isDown).limit(20).get().then(({data}) => {
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
            if(unitUser.userId==dObjectId){ sData.unitUsers[i].line=8 }
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
