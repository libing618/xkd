const db = wx.cloud.database();
const _ = db.command;
const CLOUD_FILE_ROOT = require('../config').cloudFileRoot;
let app = getApp();
function _mapResData(rData){           //处理查询到的数组
  return iData = rData.map(aProc =>{
    this.aData[aProc._id] = aProc;
    return aProc._id
  });
};

function  _getError(error) {
  if (!app.netState) { wx.showToast({ title: '请检查网络！' }) }
  app.logData.push([Date.now(), JSON.stringify(error)]);
};
export class getData {               //wxcloud查询
  constructor (dataName,afamily=0,filterId='updatedAtdesc',uId=app.roleData.uUnit._id) {
    let requirement,orderArr=['updatedAt','desc'];
    this.pNo = dataName;
    if(dataName=='articles'){               //是否全部单位数组
      this.unitFamily = 'allUnit' + afamily;
      requirement = {afamily: _.eq(afamily)};
    } else {
      this.unitFamily = uId;
      requirement = {unitId: _.eq(uId)};                //除文章类数据外只能查指定单位的数据
      if (typeof app.fData[dataName].afamily != 'undefined'){       //是否有分类数组
        requirement.afamily = _.eq(afamily);
        this.unitFamily  += afamily;
      }
    };
    this.filterId = filterId;
    if (app.mData[this.pNo].hasOwnProperty(this.unitFamily)) {       //添加以单位ID为Key的JSON初值
      if (app.mData[this.pNo][this.unitFamily].hasOwnProperty(this.filterId)) {
        this.mData = app.mData[this.pNo][this.unitFamily][this.filterId];
      } else {
        this.mData = {};
      };
    } else {
     this.mData = {};
     app.mData[this.pNo][this.unitFamily] = {};
    };
    this.aData = {};
    if (filterId!=='updatedAtdesc'){
      if (this.mData.requirement) {Object.assign(requirement,this.mData.requirement)};
      if (this.mData.orderArr) {orderArr=this.mData.orderArr}  //默认按更新时间排列
    }
    this.dQuery = db.collection(this.pNo).where(requirement)
    orderArr.forEach(ind=> {this.dQuery=this.dQuery.orderBy(ind[0],ind[1])} );
    this.isEnd = false;
  };

  gStorage(){
    return new Promise(resolve=>{
      wx.getStorage({
        key: this.pNo,
        success: function (res) {
          if (res.data) {
            this.aData = res.data;
            let dataKeys = Object.keys(this.aData);
            this.mData.indArr = this.mData.indArr.filter(indkey=>{ return dataKeys.indexOf(indkey)>=0 })
            resolve(this.mData.indArr)
          } else {
            resolve([])
          };
        },
        fail: function (err){
          resolve([])
        }
      })
    }).then(bufferData=>{
      this.mData.indArr = bufferData;
    })
  };

  downData(){    //向下查询
    if (!this.isEnd){
      return new Promise((resolve, reject) => {
        this.dQuery.skip(this.mData.indArr.length).limit(20).get().then(({data}) => {
          if (data.length>0){
            let addItemId = _mapResData(data);
            this.mData.indArr = this.mData.indArr.filter(indkey=>{ return addItemId.indexOf(indkey)>=0 })
            this.mData.indArr = this.mData.indArr.concat(addItemId)
            if (this.bufferData.length>0){            //原来有缓存数据
              let buffTopAt=this.aData[this.bufferData[0]].updatedAt;
              let aPlace = addItemId.indexOf(this.bufferData[0]);
              if (aPlace>-1){            //从顶部查询的数据与原来的缓存数据相交
                if (this.aData[addItemId[aPlace]].updatedAt==buffTopAt) {
                  addItemId = addItemId.slice(0,aPlace)
                  this.bufferData = this.bufferData.filter(indkey=>{ return this.mData.indArr.indexOf(indkey)>=0 })
                  this.mData.indArr = this.mData.indArr.concat(this.bufferData);
                };
                this.bufferData = [];
              };
            }
            resolve(addItemId);
          } else {
            resolve([]);
          }
        })
      })
    }
  };
  upData(){    //从头查询
    return new Promise((resolve, reject) => {
      this.dQuery.limit(20).get().then(({data}) => {
        if (data.length>0){
          let addItemId = _mapResData(data);
          if (this.mData.indArr.length>0){            //原来有缓存数据
            let buffTopAt=this.aData[this.mData.indArr[0]].updatedAt;
            let aPlace = addItemId.indexOf(this.mData.indArr[0]);
            if (aPlace>-1){            //从顶部查询的数据与原来的缓存数据相交
              if (this.aData[addItemId[aPlace]].updatedAt==buffTopAt) {
                addItemId = addItemId.slice(0,aPlace);
                this.mData.indArr = this.mData.indArr.filter(indkey=>{ return addItemId.indexOf(indkey)>=0 })
                this.mData.indArr = addItemId.concat(this.mData.indArr);
                bData.forEach(bini=>{
                  if(addItemId.indexOf(bini)<0) {
                    this.mData.indArr.push(bini)
                  }
                })
              } else {           //相交的缓存数据时间有变化则不再考虑缓存数据
                this.mData.indArr = addItemId
              }
            } else {
              this.bufferData = this.mData.indArr;
              this.mData.indArr = addItemId;
            }
          }
          resolve(addItemId);
        } else {
          resolve([]);
        }
      })
    })
  };
  allData(){    //查询全部
    return new Promise((resolve, reject) => {
      this.dQuery.limit(20).get().then(res => {
        let aProcedure = res.data;
        if (aProcedure.length>19){
          let reaAll = Promise.resolve(dQuery.skip(aProcedure.length).get()).then(notEnd => {
            aProcedure = aProcedure.concat(notEnd.data)
            if (notEnd.data.length>19) {
              return readAll();
            } else {
              this.mData.indArr = _mapResData(aProcedure);
              this.isEnd = true;
              resolve(this.mData.indArr);
            }
          });
        }
      });
    })
  };
  closeData(){
    app.mData[this.pNo][this.unitFamily][this.filterId] = this.mData;
    return new Promise(function(resolve, reject) {
      wx.setStorage({
        key:this.pNo,
        data:this.aData,
        success: ()=>{
          wx.setStorage({
            key: 'mData',
            data: app.mData,
            success: ()=>{
              resolve(true)
            },
            fail: ()=>{ reject() }
          })
        },
        fail: ()=>{ reject() }
      });
    });
  }
}
