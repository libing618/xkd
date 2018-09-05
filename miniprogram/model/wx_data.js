const db = wx.cloud.database();
const _ = db.command;
var app = getApp();
module.exports = {
getData: function(isDown,pNo,isAll,requirement,uId){    //查询方向，表名，是否全部，条件
  let allUnit = (pNo=='articles') ;               //是否全部单位数组
  let inFamily = typeof app.fData[pNo].afamily != 'undefined';            //是否有分类数组
  let allData = (requirement ? false : true);               //是否无条件查询
  var umdata = [], updAt = [0, 0];
  if (allUnit) {
    updAt = app.mData.pAt[pNo];
    umdata = app.mData[pNo] || [];
  } else {
    var unitId = uId ? uId : app.roleData.uUnit._id;
    if (allData){
      var aData = {};
      if (app.mData.pAt[pNo][unitId]) { updAt = app.mData.pAt[pNo][unitId] };
      if (typeof app.mData[pNo][unitId] == 'undefined') {       //添加以单位ID为Key的JSON初值
        let umobj = {};
        if (typeof app.mData[pNo] != 'undefined') { umobj = app.mData[pNo] };
        umobj[unitId] = [];
        app.mData[pNo] = umobj;
      } else {
        umdata = app.mData[pNo][unitId] || [];
      }
    };
  };
  if (allData) {
    requirement = {updatedAt: isDown ? _.gt(new Date(updAt[1])) : _.lt(new Date(updAt[0]))};
  }          //查询本地最新时间后修改的或最后更新时间前修改的记录
  if (allUnit){
    requirement.unitId = _.eq(unitId);                //除文章类数据外只能查指定单位的数据
  };
  let dQuery = db.collection(pNo).where(requirement).orderBy('updatedAt',isDown ? 'asc' : 'desc').limit(20)  //按更新时间排列
  return new Promise((resolve, reject) => {
    dQuery.get().then(res => {
      let aProcedure = res.data;
      if (isAll && aProcedure.length>0){
        let reaAll = Promise.resolve(dQuery.skip().get()).then(notEnd => {
          if (notEnd.data.length>0) {
            aProcedure = aProcedure.concat(notEnd.data)
            return readAll();
          } else {
            resolve(aProcedure);
          }
        });
      }
    });
  }).then(results => {
    if (results) {
      let aPlace = -1, aProcedure = {};
      if (isDown) {
        updAt[1] = results[lena - 1].updatedAt;                          //更新本地最新时间
        updAt[0] = results[0].updatedAt; //若本地记录时间为空，则更新本地最后更新时间
      } else {
        updAt[0] = results[lena - 1].updatedAt;          //更新本地最后更新时间
      };
      results.forEach(aProc => {
        if (inFamily) {                         //存在afamily类别
          if (typeof umdata[aProc.afamily] == 'undefined') { umdata[aProc.afamily] = [] };
          if (isDown) {
            aPlace = umdata[aProc.afamily].indexOf(aProc._id);
            if (aPlace >= 0) { umdata[aProc.afamily].splice(aPlace, 1) }           //删除本地的重复记录列表
            umdata[aProc.afamily].unshift(aProc._id);
          } else {
            umdata[aProc.afamily].push(aProc._id);
          }
        } else {
          if (isDown) {
            aPlace = umdata.indexOf(aProc._id);
            if (aPlace >= 0) { umdata.splice(aPlace, 1) }           //删除本地的重复记录列表
            umdata.unshift(aProc._id);
          } else {
            umdata.push(aProc._id);                   //分类ID数组增加对应ID
          }
        };
        if (allData){
          app.aData[pNo][aProc._id] = aProc;                 //将数据对象记录到本机
        } else {
          aData[aProc._id] = aProc;
        }
      });
      if (allData){
        if (allUnit) {
          app.mData[pNo] = umdata;
          app.mData.pAt[pNo] = updAt;
        } else {
          app.mData[pNo][unitId] = umdata;
          app.mData.pAt[pNo][unitId] = updAt;
        };
        resolve(lena > 0);               //数据更新状态
      } else {
        resolve({umdata,aData});
      }
    };
  }).catch(error => {
    if (!that.netState) { wx.showToast({ title: '请检查网络！' }) }
    console.error()
  });
},

getToken:function(){
  return new Promise((resolve, reject) => {
    db.collection('accessToken').orderBy('accessOverTime', 'asc').limit(1).get().then(({ data }) => {
      if (Date.now() > data[0].accessOverTime) {
        wx.cloud.callFunction({ name: 'wxcustomer', data: { customerState: 0 } }).then(sToken => { resolve(sToken.result) })
      } else {
        resolve(data[0].accessToken)
      }
    }).catch(err => { reject(err) })
  })
}


}
