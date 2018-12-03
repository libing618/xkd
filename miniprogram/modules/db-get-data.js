const db = wx.cloud.database();
const _ = db.command;
const crypto = require('../libs/crypto');
let app = getApp();
function _mapResData(rData){           //处理查询到的数组
  return iData = rData.map(aProc =>{
    app.aData[aProc._id] = aProc;
    return aProc._id
  });
};

function objToStrArr(obj) {
  let arr = [];
  for (let k in obj) {
    arr.push(k + '=' + obj[k])
  }
  return arr
}

function  _getError(error) {
  if (!app.netState) { wx.showToast({ title: '请检查网络！' }) }
  app.logData.push([Date.now(), JSON.stringify(error)]);
};
export class getData {               //wxcloud查询
  constructor (dataName,afamily=0,uId=app.roleData.user.unit,requirement={},orderArr=['updatedAt','desc']) {
    this.pNo = dataName;
    if(['articles','banner','qa'].includes(dataName)){               //是否全部单位数组
      this.unitFamily = 'allUnit' + afamily;
      requirement = {afamily: _.eq(afamily)};
    } else {
      this.unitFamily = uId;
      requirement = {unitId: _.eq(uId)};                //除文章类数据外只能查指定单位的数据
      if (app.fData[dataName].afamily){       //是否有分类数组
        requirement.afamily = _.eq(afamily);
        this.unitFamily  += afamily;
      }
    };
    let orderStrArr = orderArr.map(aOrder=>{ return aOrder[0]+'^'+aOrder[1] });  //排序条件生成字符串数组
    let requirStrArr = objToStrArr(requirement).concat(orderStrArr);  //查询条件生成字符串数组合并排序条件字符串数组
    let requirString = requirStrArr.sort().join('&');
    this.filterId = crypto.enc.Base64.stringify(crypto.HmacSHA1(requirString, this.unitFamily));  //生成条件签名
console.log(requirString,'-----',this.filterId)
    if (app.aIndex[this.pNo].hasOwnProperty(this.filterId)) {       //添加以条件签名为Key的JSON初值
      this.aIndex = app.aIndex[this.pNo][this.filterId].filter(indkey=>{ return indkey in app.aData })
    } else {
      this.aIndex = [];
    };
    this.dQuery = db.collection(this.pNo).where(requirement)
    orderArr.forEach(ind=> {this.dQuery=this.dQuery.orderBy(ind[0],ind[1])} );
    this.isEnd = false;
  };

  downData(){    //向下查询
    if (!this.isEnd){
      return new Promise((resolve, reject) => {
        this.dQuery.skip(this.aIndex.length).limit(20).get().then(({data}) => {
          if (data.length>0){
            let addItemId = _mapResData(data);
            this.aIndex = this.aIndex.filter(indkey=>{ return addItemId.indexOf(indkey)>=0 })
            this.aIndex = this.aIndex.concat(addItemId)
            if (this.bufferData.length>0){            //原来有缓存数据
              let buffTopAt=app.aData[this.bufferData[0]].updatedAt;
              let aPlace = addItemId.indexOf(this.bufferData[0]);
              if (aPlace>-1){            //从顶部查询的数据与原来的缓存数据相交
                if (app.aData[addItemId[aPlace]].updatedAt==buffTopAt) {
                  addItemId = addItemId.slice(0,aPlace)
                  this.bufferData = this.bufferData.filter(indkey=>{ return this.aIndex.indexOf(indkey)>=0 })
                  this.aIndex = this.aIndex.concat(this.bufferData);
                };
                this.bufferData = [];
              };
            }
            resolve(addItemId);
          } else {
            this.isEnd = true;
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
          if (this.aIndex.length>0){            //原来有缓存数据
            let buffTopAt=app.aData[this.aIndex[0]].updatedAt;
            let aPlace = addItemId.indexOf(this.aIndex[0]);
            if (aPlace>-1){            //从顶部查询的数据与原来的缓存数据相交
              if (app.aData[addItemId[aPlace]].updatedAt==buffTopAt) {
                addItemId = addItemId.slice(0,aPlace);
                this.aIndex = this.aIndex.filter(indkey=>{ return addItemId.indexOf(indkey)>=0 })
                this.aIndex = addItemId.concat(this.aIndex);
                bData.forEach(bini=>{
                  if(addItemId.indexOf(bini)<0) {
                    this.aIndex.push(bini)
                  }
                })
              } else {           //相交的缓存数据时间有变化则不再考虑缓存数据
                this.aIndex = addItemId
              }
            } else {
              this.bufferData = this.aIndex;
              this.aIndex = addItemId;
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
              this.aIndex = _mapResData(aProcedure);
              this.isEnd = true;
              resolve(this.aIndex);
            }
          });
        }
      });
    })
  };
  closeData(){
    app.aIndex[this.pNo][this.filterId] = this.aIndex;
    wx.setStorage({
      key: 'aIndex.'+this.pNo,
      data: app.aIndex[this.pNo]
    })
  }
}
