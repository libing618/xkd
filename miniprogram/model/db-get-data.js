const db = wx.cloud.database();
const _ = db.command;
class getData {               //无条件查询
  constructor (dataName,afamily=0,uId= app.roleData.uUnit._id) {
    this.pNo = dataName;
    if(dataName=='articles'){               //是否全部单位数组
      this.unitFamily = 'allUnit' + afamily;
      this.requirement = {afamily: _.eq(afamily)};
    } else {
      this.unitFamily = uId;
      this.requirement = {unitId: _.eq(uId)};                //除文章类数据外只能查指定单位的数据
      if (typeof app.fData[pNo].afamily != 'undefined'){       //是否有分类数组
        this.requirement.afamily = _.eq(afamily);
        this.unitFamily  += afamily;
      }
    };
    this.indexKey = 'updatedAtdesc';
    this.mData = getApp().mData[this.pNo];
    return new Promise(resolve=>{
      if (this.mData.hasOwnProperty(this.unitFamily)) {       //添加以单位ID为Key的JSON初值
        if (this.mData[this.unitFamily].hasOwnProperty(this.indexKey)) {
          wx.getStorage({
            key: dataName,
            success: function (res) {
              if (res.data) {
                this.aData = res.data
                this.bufferTop = this.aData[this.mData[this.unitFamily][this.indexKey][0]].updatedAt;
                resolve(this.aData[this.mData[this.unitFamily][this.indexKey][0]].updatedAt)
              } else {
                this.aData = {};
                resolve(0)
              };
            },
            fail: function (err){
              resolve(0)
            }
          })
        } else {
          resolve(0)
        };
      } else {
        this.mData[this.unitFamily] = {};
        resolve(0)
      };
    })
  }

  _gData(isDown ){    //查询方向，是否全部
    this.requirement.updatedAt = _.gt(new Date(isDown ? this.bufferTop : 0));        //查询本地最新时间后修改的或最后更新时间前修改的记录
    let dQuery = db.collection(pNo).where(this.requirement).orderBy('updatedAt','desc')  //按更新时间排列
    return new Promise((resolve, reject) => {
      dQuery.limit(20).get().then(res => {
        let aProcedure = res.data;
        if (isDown && aProcedure.length>19){
          let reaAll = Promise.resolve(dQuery.skip(aProcedure.length).get()).then(notEnd => {
            aProcedure = aProcedure.concat(notEnd.data)
            if (notEnd.data.length>19) {
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
          let aPlace = -1;
          if (isDown) {
            this.bufferTop = results[0].updatedAt;          //更新本地最后更新时间
          };
          let umdata = results.map(aProc => {
            aPlace = this.mData[this.unitFamily][this.indexKey].indexOf(aProc._id);
            if (aPlace >= 0) { this.mData[this.unitFamily][this.indexKey].splice(aPlace, 1) }           //删除本地的重复记录列表
            aData[aProc._id] = aProc;
            return aProc._id;                   //分类ID数组增加对应ID
          });
          if (isDown){
            this.mData[this.unitFamily][this.indexKey] = umdata.concat(this.mData[this.unitFamily][this.indexKey]);
          } else {
            this.mData[this.unitFamily][this.indexKey] = this.mData[this.unitFamily][this.indexKey].concat(umdata);
          }
          resolve(true);
        }
      });
    }).catch(error => {
      if (!app.netState) { wx.showToast({ title: '请检查网络！' }) }
      console.error()
    });
  }

}
module.exports = getData
