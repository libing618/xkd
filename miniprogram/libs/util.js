const db = wx.cloud.database();

var app=getApp()
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
};

module.exports = {

hTabClick: function (e) {                                //点击头部tab
  this.setData({
    "ht.pageCk": Number(e.currentTarget.id)
  });
},

tabClick: function (e) {                                //点击tab
  app.mData['pCk'+this.data.pNo] = Number(e.currentTarget.id)
  this.setData({
    pageCk: app.mData['pCk'+this.data.pNo]               //点击序号切换
  });
},

indexRecordFamily: function(requery,indexField,aFamilyLength) {             //按索引字段和类型整理已读数据
  return new Promise((resolve, reject) => {
    let aData = {}, indexList = new Array(aFamilyLength), aPlace = -1, iField, aFamily, fieldFamily, mData = {};
    indexList.fill([]);
    requery.forEach(onedata => {
      aData[onedata.id] = onedata;
      iField = onedata.get(indexField);                  //索引字段读数据数
      aFamily = onedata.get('afamily');
      fieldFamily = iField+''+aFamily;
      if (indexList[aFamily].indexOf(iField)<0) {
        indexList[aFamily].push(iField);
        mData[fieldFamily] = {
          uName:onedata.get('uName'),
          indexFieldId:[onedata.id]
        };                   //分类ID数组增加对应ID
      } else {
        mData[fieldFamily].indexFieldId.push(onedata.id);
      };
    });
    let cPage = indexList.map((tId,family)=>{
      return tId.map(fi=>{
        return { indexId: fi, uName: mData[fi + family].uName,iCount:mData[fi+family].indexFieldId.length}
      })
    })
    resolve({indexList,aData}) ;
  }).catch( error=> {reject(error)} );
},

fetchRecord: function(requery,indexField,sumField) {                     //同步云端数据到本机
  return new Promise((resolve, reject) => {
    let aData = {}, mData = {}, indexList = [], aPlace = -1, iField, iSum = {}, mChecked = {};
    arp.forEach(onedata => {
      aData[onedata.id] = onedata;
      iField = onedata.get(indexField);                  //索引字段读数据数
      if (indexList.indexOf(iField<0)) {
        indexList.push(iField);
        mData[iField] = [onedata.id];                   //分类ID数组增加对应ID
        iSum[iField] = onedata.get(sumField);
      } else {
        iSum[iField] += onedata.get(sumField);
        mData[iField].push(onedata.id);
      };
      mChecked[onedata.id] = true;
    });
    resolve({indexList:indexList,pageData:aData,quantity:iSum,mCheck:mChecked}) ;
  }).catch( error=> {reject(error)} );
},

binddata: (subscription, initialStats, onChange) => {
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
},

indexClick: function(e){                           //选择打开的索引数组本身id
  this.setData({ iClicked: e.currentTarget.id });
},

mClick: function (e) {                      //点击mClick
  let pSet = {};
  pSet['mChecked['+e.currentTarget.id+']'] = !this.data.mClicked[e.currentTarget.id];
  this.setData(pSet)
},

familySel: function(pNo){              //数据表有分类控制的返回分类长度和选择记录
  let psData = {};
  if (typeof app.fData[pNo].afamily != 'undefined') {
    psData.fLength = app.fData[pNo].afamily.length;
    psData.pageCk = app.mData['pCk'+pNo];
    psData.tabs = app.fData[pNo].afamily;
  };
  return psData;
},

i_msgEditSend:function(e){            //消息编辑发送框
  var that = this;
  switch (e.currentTarget.id) {
    case 'sendMsg':
      app.sendM(e.detail.value,that.data.cId).then( (rsm)=>{
        if (rsm){
          that.setData({
            vData: {mtype:-1,mtext:'',wcontent},
            messages: app.conMsg[that.data.cId]
          })
        }
      });
      break;
    case 'fMultimedia':
      that.setData({enMultimedia: !that.data.enMultimedia});
      break;
    case 'iMultimedia':
      var sIndex = parseInt(e.currentTarget.dataset.n);      //选择的菜单id;
      return new Promise( (resolve, reject) =>{
        let showPage = {};
        switch (sIndex){
          case 1:             //选择产品
            if (!that.f_modalSelectPanel) {that.f_modalSelectPanel = require('../../model/controlModal').f_modalSelectPanel}
            showPage.pageData = app.aData.goods;
            showPage.tPage = app.mData.goods;
            showPage.idClicked = '0';
            that.data.sPages.push({ pageName: 'modalSelectPanel', pNo: 'goods', gname:'wcontent',p:'产品' });
            showPage.sPages = that.data.sPages;
            that.setData(showPage);
            popModal(that);
            resolve(true);
            break;
          case 2:               //选择相册图片或拍照
            wx.chooseImage({
              count: 1, // 默认9
              sizeType: ['original', 'compressed'],             //可以指定是原图还是压缩图，默认二者都有
              sourceType: ['album', 'camera'],                 //可以指定来源是相册还是相机，默认二者都有
              success: function (res) { resolve(res.tempFilePaths[0]) },               //返回选定照片的本地文件路径列表
              fail: function(err){ reject(err) }
            });
            break;
          case 3:               //录音
            wx.startRecord({
              success: function (res) { resolve( res.tempFilePath ); },
              fail: function(err){ reject(err) }
            });
            break;
          case 4:               //选择视频或拍摄
            wx.chooseVideo({
              sourceType: ['album','camera'],
              maxDuration: 60,
              camera: ['front','back'],
              success: function(res) { resolve( res.tempFilePath ); },
              fail: function(err){ reject(err) }
            })
            break;
          case 5:                    //选择位置
            wx.chooseLocation({
              success: function(res){ resolve( { latitude: res.latitude, longitude: res.longitude } ); },
              fail: function(err){ reject(err) }
            })
            break;
          case 6:                     //选择文件

            break;
          default:
            resolve('输入文字');
            break;
        }
      }).then( (wcontent)=>{
        return new Promise( (resolve, reject) => {
          if (sIndex>1 && sIndex<5){
            wx.saveFile({
              tempFilePath : icontent,
              success: function(cres){ resolve(cres.savedFilePath); },
              fail: function(cerr){ reject('媒体文件保存错误！') }
            });
          }else{
            resolve(wcontent);
          };
        });
      }).then( (content) =>{
        that.setData({ mtype: -sIndex ,wcontent: content });
      }).catch((error)=>{console.log(error)});
    break;
  default:
    break;
  }
},

formatTime: function(date=new Date(),isDay=false) {
  date = new Date(date)
  var year = date.getFullYear()+''
  var month = date.getMonth() + 1
  var day = date.getDate()
  if (isDay){
    return [year, month, day].map(formatNumber).join('/')
  } else {
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
}

}
