const db = wx.cloud.database();
const _ = db.command;
var app = getApp();
class filterData {               //有条件查询
  constructor (isDown,dataName, requirement,isAll = false, unitId = app.roleData.uUnit._id) {
    wx.getStorage({
      key: dataName,
      success: function (res) {
        if (res.data) {
          this[dataName] = res.data
        } else {
          _fData(true,dataName).then()
        };
      }
    })

  },

  _fData: function (isDown, pNo, isAll = false = {}, unitId = app.roleData.uUnit._id){    //查询方向，表名，是否全部，条件
    let allUnit = (pNo=='articles') ;               //是否全部单位数组
    let inFamily = typeof app.fData[pNo].afamily != 'undefined';            //是否有分类数组

    var umdata = [], updAt = [0, 0];
    if (allUnit) {
      updAt = app.mData.pAt[pNo];
      umdata = app.mData[pNo] || [];
    } else {

          umdata = app.mData[pNo][unitId] || [];
        }
      };
    };

    if (allUnit){
      requirement.unitId = _.eq(unitId);                //除文章类数据外只能查指定单位的数据
    };
    let dQuery = db.collection(pNo).where(requirement).orderBy('updatedAt',isDown ? 'asc' : 'desc').limit(20)  //按更新时间排列
    return new Promise((resolve, reject) => {
      dQuery.get().then(res => {
        let aProcedure = res.data;
        if (isAll && aProcedure.length>19){
          let reaAll = Promise.resolve(dQuery.skip(aProcedure.length).get()).then(notEnd => {
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
      return new Promise(resolve => {
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
            aData[aProc._id] = aProc;
          });
          if (allUnit) {
            app.mData[pNo] = umdata;
            app.mData.pAt[pNo] = updAt;
          } else {
            app.mData[pNo][unitId] = umdata;
            app.mData.pAt[pNo][unitId] = updAt;
          };
          resolve(aData);
        }
      });
    }).catch(error => {
      if (!app.netState) { wx.showToast({ title: '请检查网络！' }) }
      console.error()
    });
  },

}

module.exports = filterData
