const db = wx.cloud.database();
let app=getApp()
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
};

export function hTabClick(e) {                                //点击头部tab
  this.setData({
    "ht.pageCk": Number(e.currentTarget.id)
  });
};

export function tabClick(e) {                                //点击tab
  app.aIndex['pCk'+this.data.pNo] = Number(e.currentTarget.id);
  this.setData({
    pageCk: app.aIndex['pCk'+this.data.pNo]               //点击序号切换
  });
};

export function indexRecordFamily(requery,indexField,aFamilyLength) {             //按索引字段和类型整理已读数据
  return new Promise((resolve, reject) => {
    let aData = {}, indexList = new Array(aFamilyLength), aPlace = -1, iField, aFamily, fieldFamily, aIndex = {};
    indexList.fill([]);
    requery.forEach(onedata => {
      aData[onedata.id] = onedata;
      iField = onedata.get(indexField);                  //索引字段读数据数
      aFamily = onedata.get('afamily');
      fieldFamily = iField+''+aFamily;
      if (indexList[aFamily].indexOf(iField)<0) {
        indexList[aFamily].push(iField);
        aIndex[fieldFamily] = {
          uName:onedata.get('uName'),
          indexFieldId:[onedata.id]
        };                   //分类ID数组增加对应ID
      } else {
        aIndex[fieldFamily].indexFieldId.push(onedata.id);
      };
    });
    let cPage = indexList.map((tId,family)=>{
      return tId.map(fi=>{
        return { indexId: fi, uName: aIndex[fi + family].uName,iCount:aIndex[fi+family].indexFieldId.length}
      })
    })
    resolve({indexList,aData}) ;
  }).catch( error=> {reject(error)} );
};

export function noEmptyObject(obj){
  for (let k in obj){
    return true;
  }
  return false;
};

export function addViewData(addItem,mPage,indArr) {
  let spData = {}
  spData[mPage] = indArr;
  addItem.forEach(mId=>{ spData['pageData.'+mId]=app.aData[mId] });
  this.setData(spData)
};

export function fetchRecord(requery,indexField,sumField) {                     //同步云端数据到本机
  return new Promise((resolve, reject) => {
    let aData = {}, aIndex = {}, indexList = [], aPlace = -1, iField, iSum = {}, mChecked = {};
    arp.forEach(onedata => {
      aData[onedata.id] = onedata;
      iField = onedata.get(indexField);                  //索引字段读数据数
      if (indexList.indexOf(iField<0)) {
        indexList.push(iField);
        aIndex[iField] = [onedata.id];                   //分类ID数组增加对应ID
        iSum[iField] = onedata.get(sumField);
      } else {
        iSum[iField] += onedata.get(sumField);
        aIndex[iField].push(onedata.id);
      };
      mChecked[onedata.id] = true;
    });
    resolve({indexList:indexList,pageData:aData,quantity:iSum,mCheck:mChecked}) ;
  }).catch( error=> {reject(error)} );
};

export function binddata(subscription, initialStats, onChange){
  let stats = [...initialStats]
  const remove = value => {
    stats = stats.filter(target => {return target.id !== value.id})
    return onChange(stats)
  }
  const upsert = value => {
    let existed = false;
    stats = stats.map(target => (target.id === value.id ? ((existed = true), value) : target))
    if (!existed) stats = [value, ...stats]
    return onChange(stats)
  }
  subscription.on('create', upsert)
  subscription.on('update', upsert)
  subscription.on('enter', upsert)
  subscription.on('leave', remove)
  subscription.on('delete', remove)
  return () => {
  subscription.off('create', upsert)
  subscription.off('update', upsert)
  subscription.off('enter', upsert)
  subscription.off('leave', remove)
  subscription.off('delete', remove)
  }
};

export function indexClick(e){                           //选择打开的索引数组本身id
  this.setData({ iClicked: e.currentTarget.id });
};

export function mClick(e) {                      //点击mClick
  let pSet = {};
  pSet['mChecked['+e.currentTarget.id+']'] = !this.data.mClicked[e.currentTarget.id];
  this.setData(pSet)
};

export function familySel(pNo){              //数据表有分类控制的返回分类长度和选择记录
  let psData = {};
  if (typeof app.fData[pNo].afamily != 'undefined') {
    psData.fLength = app.fData[pNo].afamily.length;
    psData.pageCk = app.aIndex['pCk'+pNo];
    psData.tabs = app.fData[pNo].afamily;
  };
  return psData;
};

export function formatTime(date=new Date(),isDay=false) {
  date = new Date(date)
  let year = date.getFullYear()+''
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (isDay){
    return [year, month, day].map(formatNumber).join('-')
  } else {
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
}
