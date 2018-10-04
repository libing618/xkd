const db = wx.cloud.database();
const _ = db.command;
var app = getApp();
class filterData {               //有条件查询
  constructor (dataName,afamily=0, requirement,indexArr=[],isAll = false, unitId = app.roleData.uUnit._id) {
    if (dataName=='articles') {               //是否全部单位数组
      this.unitFamily = 'allUnit' + afamily;
      this.requirement.afamily = _.eq(afamily);
    } else {
      this.unitFamily = unitId;
      this.requirement.unitId = _.eq(uId);                //除文章类数据外只能查指定单位的数据
      if (typeof app.fData[pNo].afamily != 'undefined'){       //是否有分类数组
        this.requirement.afamily = _.eq(afamily);
        this.unitFamily  += afamily;
      }
    };
    this.fQuery = db.collection(dataName).where(requirement);
    this.umKey = JSON.stringif(requirement);
    indexArr.forEach(ind=> {
      this.fQuery=this.fQuery.orderBy(ind[0],ind[1])
      this.umKey+=ind[0]+ind[1]
    });
    this.mData = getApp().mData[this.pNo];
    return new Promise(resolve=>{
      if (this.mData.hasOwnProperty(this.unitFamily)) {       //添加以单位ID为Key的JSON初值
        if (this.mData[this.unitFamily].hasOwnProperty(this.umKey)) {
          wx.getStorage({
            key: dataName,
            success: function (res) {
              if (res.data) {
                this.aData = res.data
                resolve(this.mData[this.unitFamily][this.umKey].length)
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
  };

  _fData(isDown, isAll){    //查询方向，表名，是否全部，条件
    return new Promise((resolve, reject) => {
      this.fQuery.get().then(res => {
        let aProcedure = res.data;
        if (isAll && aProcedure.length>19){
          let reaAll =()=>{ Promise.resolve(dQuery.skip(aProcedure.length).get()).then(notEnd => {
            if (notEnd.data.length>0) {
              aProcedure = aProcedure.concat(notEnd.data)
              return readAll();
            } else {
              resolve(aProcedure);
            }
          });
          }
        }
      });
    }).then(({data}) => {
      return new Promise(resolve => {
        if (data) {
          let aPlace = -1;
          let umdata = data.map(aProc => {
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

module.exports = filterData
