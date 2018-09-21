const db = wx.cloud.database();
const { getData } = require('../../model/db-get-data');
const { unitData } = require('../../model/initForm.js');
const qqmap_wx = require('../../libs/qqmap-wx-jssdk.min.js');   //微信地图
var QQMapWX = new qqmap_wx({ key: '6JIBZ-CWPW4-SLJUB-DPPNI-4TWIZ-Q4FWY' });   //开发密钥（key）
var app = getApp();
function setRole(puRoles,suRoles){      //流程审批权限列表
  let cManagers = [app.roleData.user.unit+app.roleData.user.line+app.roleData.user.position];
  if (app.roleData.uUnit.afamily > 2 && puRoles) {          //单位类型为企业且有本单位审批设置
    let pRolesNum = 0, pRoleUser;
    for (let i = 0; i < puRoles.length; i++) {
      pRoleUser = false;
      app.roleData.uUnit.unitUsers.forEach((pUser) => {
        if ((pUser.line+''+pUser.position) == puRoles[i]) {
          pRoleUser = true;
        }
      })
      if (pRoleUser) {
        pRolesNum = pRolesNum + 1;
        cManagers.push(app.roleData.user.unit+puRoles[i]);
      }
    };
    if (pRolesNum==0 && app.roleData.user.line!=8) {
      cManagers.push(app.roleData.user.unit+'88');
    }
  }
  if (suRoles) {                 //上级单位类型有审批设置
    let sRolesNum = 0, sRoleUser;
    if (app.roleData.sUnit.afamily>2) {     //单位类型为企业
      for (let i = 0; i < suRoles.length; i++) {
        sRoleUser = false;
        app.roleData.sUnit.unitUsers.forEach((sUser) => {
          if (sUser.line+''+sUser.position == suRoles[i]) {
            sRoleUser = true;
          }
        });
        if (sRoleUser) {
          sRolesNum = sRolesNum + 1;
          cManagers.push(app.roleData.sUnit._id+suRoles[i]);
        }
      }
    }
    if (sRolesNum == 0) {
      cManagers.push(app.roleData.sUnit._id+'88');
    }
  };
  return cManagers
};

module.exports = {

initData: function(req, vData) {      //对数据录入或编辑的格式数组和数据对象进行初始化操作
  let vDataKeys = Object.keys(vData);            //数据对象是否为空
  let vifData = (vDataKeys.length == 0);
  var funcArr = [],getAddress;
  let unitId = vData.unitId ? vData.unitId : app.roleData.uUnit._id;  //数据中没有单位代码则用使用人的单位代码
  return new Promise((resolve, reject) => {
    let promArr = [];               //定义一个Promise数组
    let setPromise = new Set();
    var iFormat=req.map(reqField=>{
      switch (reqField.t) {
        case 'mapSelectUnit':
          reqField.e = vifData ? '点击选择服务单位' : app.roleData.sUnit.uName;
          break;
        case 'sId':
          setPromise.add(reqField.gname);
          break;
        case 'producttype':
          reqField.indlist = app.roleData.uUnit.indType.code;
          break;
      };
      if (vifData) {
        switch (reqField.t) {
          case 'chooseAd':
            const cLocation=()=> {
              return new Promise((resolve, reject) => {
                wx.getSetting({
                  success(res) {
                    if (res.authSetting['scope.userLocation']) {                   //用户已经同意小程序使用用户地理位置
                      resolve(true)
                    } else {
                      wx.authorize({
                        scope: 'scope.userLocation',
                        success() { resolve(true) },
                        fail() {
                          wx.showToast({ title: '请授权使用位置', duration: 2500, icon: 'loading' });
                          setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
                          reject();
                        }
                      })
                    };
                  }
                })
              }).then((vifAuth) => {
                return new Promise((resolve, reject) => {
                  wx.getLocation({
                    type: 'wgs84',
                    success: function (res) {
                      vData[reqField.gname] = new db.Geo.Point(res.longitude,res.latitude);
                      QQMapWX.reverseGeocoder({
                        location: { latitude: res.latitude, longitude: res.longitude },
                        success: function ({ result: { ad_info, address } }) {
                          getAddress = { code: ad_info.adcode, sName: address }
                          resolve(true);
                        }
                      });
                    },
                    fail() { reject() }
                  })
                })
              }).catch(console.error)
            };
            promArr.push(cLocation());          //地理位置字段
            break;
          case 'eDetail':                      //详情字段
            vData[reqField.gname] = [                     //内容部分定义：t为类型,e为文字或说明,c为媒体文件地址或内容
              { t: "h2", e: "大标题" },
              { t: "p", e: "正文简介" },
              { t: "h3", e: "中标题" },
              { t: "p", e: "正文" },
              { t: "h4", e: "1、小标题" },
              { t: "p", e: "图片文章混排说明" },
              { t: "-2", c: 'http://ac-trce3aqb.clouddn.com/eb90b6ebd3ef72609afc.png', e: "图片内容说明" },
              { t: "p", e: "正文" },
              { t: "h4", e: "2、小标题" },
              { t: "p", e: "音频文章混排" },
              { t: "-3", c: "https://i.y.qq.com/v8/playsong.html?songid=108407446&source=yqq", e: "录音内容说明" },
              { t: "p", e: "正文" },
              { t: "h4", p: "3、小标题" },
              { t: "p", p: "视频文章混排" },
              { t: "-4", c: "https://v.qq.com/x/page/f05269wf11h.html?ptag=2_5.9.0.13560_copy", e: "视频内容说明" },
              { t: "p", e: "正文" },
              { t: "p", e: "章节结尾" },
              { t: "p", e: "文章结尾" }
            ];
            break;
          case 'assettype':
            vData[reqField.gname] = { code: 0, sName: '点此处进行选择' };
            break;
          case 'producttype':
            vData[reqField.gname] = { code: 0, sName: '点此处进行选择' };
            break;
          case 'industrytype':
            vData[reqField.gname] = { code: [], sName: [] };
            break;
          case 'modalEditAddress':
            if (typeof vData.aGeoPoint =='undefined') { vData[reqField.gname]= { code: 0, sName: '点此处进入编辑' } };
            break;
          case 'listsel':
            vData[reqField.gname] = 0;
            break;
          case 'arrList':
            vData[reqField.gname] = [];
            break;
          case 'sedate':
            vData[reqField.gname] = [getdate(Date.now()), getdate(Date.now() + 864000000)];
            break;
          case 'idate':
            vData[reqField.gname] = getdate(Date.now());
            break;
          case 'fg' :
            vData[reqField.gname] = 0;
            break;
        }
      };
      return reqField;
    })
    setPromise.forEach(nPromise=> {promArr.push(getData(true, nPromise, unitId))})
    return Promise.all(promArr).then(() => {
      for (let i = 0; i < iFormat.length; i++) {
        switch (iFormat[i].t) {
          case 'chooseAd':
            vData.address = getAddress;
            break;
          case 'sId':
            iFormat[i].maData = app.mData[iFormat[i].gname][unitId].map(mId=>{
              return {
                _id: mId, sName: app.aData[iFormat[i].gname][mId].uName + ':  ' + app.aData[iFormat[i].gname][mId].title }
            });
            iFormat[i].mn = vifData ? 0 : app.mData[iFormat[i].gname][unitId].indexOf(vData[iFormat[i].gname]);
            break;
        }
        if (iFormat[i].csc) {
          funcArr.push('f_' + iFormat[i].csc);
          if (['aslist', 'arrsel'].indexOf(iFormat[i].csc) >= 0) {
            iFormat[i].aVl = [0, 0, 0];
            iFormat[i].inclose = vifData ? true : false;
          };
        } else {
          if (iFormat[i].t.length > 2) { funcArr.push('i_' + iFormat[i].t) };             //每个输入类型定义的字段长度大于2则存在对应处理过程
        };
      };
      resolve({ iFormat, vData, funcArr });
    });
  }).catch(console.error);
},

fSubmit: function (e) {
  var that = this;
  var subData = e.detail.value;
  let cNumber = ['fg','dg','listsel'];       //数字类型定义
  let cObject = ['assettype','producttype','modalEditAddress'];       //对象类型定义
  if (Array.isArray(that.data.vData.details)) {
    for (let i = 0; i < that.data.vData.details.length; i++) {
      that.data.vData.details[i].e = subData['ade' + i];
      that.data.vData.details[i].c = subData['adc' + i];
    };
  };
  var emptyField = '';                   //检查是否有字段输入为空
  that.data.iFormat.forEach(req=>{
    if (req.gname in subData){ that.data.vData[req.gname]=subData[req.gname]; }
    if (typeof that.data.vData[req.gname]=='undefined'){
      emptyField += '《' + req.p + '》';
    } else {
      if (req.t=='itime') {that.data.vData[req.gname] = Number(that.data.vData[req.gname].replace(':',''))};
      if ( cNumber.indexOf(req.t)>=0 ) { that.data.vData[req.gname] = Number(that.data.vData[req.gname]); }
      if ( cObject.indexOf(req.t)>=0 && typeof that.data.vData[req.gname]=='string') {that.data.vData[req.gname] = JSON.parse(that.data.vData[req.gname])}
    }
  });
  var sFilePath = new Promise(function (resolve, reject) {         //本地媒体文件归类
    let filePaths = [];
    const mdtn = ['pic', 'thumb', 'vidio', 'file'];
    const mdt = ['-2', '-3', '-4', '-6'];
    that.data.iFormat.forEach(nField => {
      switch (nField.t) {
        case 'eDetail':
          for (let a = 0; a < that.data.vData[nField.gname].length; a++) {
            if (mdt.indexOf(that.data.vData[nField.gname][a].t) >= 0) {     //该字段正文的内容为媒体
              filePaths.push({ na: [nField.gname, a], fPath: that.data.vData[nField.gname][a].c, fType: 2, fn: 2 });
            }
          }
          break;
        case 'pics':
          for (let b = 0; b < that.data.vData[nField.gname].length; b++) {     //该字段为图片组
            filePaths.push({ na: [nField.gname, b], fPath: that.data.vData[nField.gname][b], fType: 2, fn: 1 });
          }
          break;
        default:
          if (mdtn.indexOf(nField.t) >= 0) {            //该字段为媒体
            filePaths.push({ na: [nField.gname, -1], fPath: that.data.vData[nField.gname], fType: 2, fn: 0 });
          }
          break;
      }
    });
    wx.getSavedFileList({
      success: function (res) {
        let saveFileList = res.fileList.map(fList => { return fList.filePath });
        let saveFiles = filePaths.map(sfPath => {
          return new Promise((resolve, reject) => {
            if (saveFileList.indexOf(sfPath.fPath) >= 0) {
              sfPath.fType = 1;
              resolve(sfPath);
            } else {
              wx.getFileInfo({
                filePath: sfPath.fPath,
                success: function () {
                  sfPath.fType = 0;
                  resolve(sfPath);
                },
                fail: () => { resolve(sfPath) }
              })
            }
          });
        });
        Promise.all(saveFiles).then((sFileList) => { resolve(sFileList) });
      },
      fail: function () { resolve([]) }
    });
  });
  switch (e.detail.target.id) {
    case 'fdeldata':                                 //删除内容部分选中的字段
      if (that.data.selectd >= 0) {                         //内容部分容许删除
        that.data.vData.details.splice(that.data.selectd, 1);
        that.setData({ 'vData.details': that.data.vData.details, enMenu: 'none' });
      } else { wx.showToast({ title: '此处禁止删除！' }) }
      break;
    case 'fenins':                   //允许显示插入菜单
      that.setData({ enMenu: 'none', enIns: false })      //‘插入、删除、替换’菜单栏关闭
      break;
    case 'fupdate':                          //替换数据
      that.setData({ enMenu: 'none' })
      that.farrData(that.data.vData.details[that.data.selectd].t, 1);      //选择多媒体项目内容;
      break;
    case 'fStorage':           //编辑内容不提交流程审批,在本机保存
      if (that.data.targetId == '0') {
        sFilePath.then(fileArr => {
          let tFileArr = fileArr.filter(function (tFile) { return tFile.fType == 0 });
          if (tFileArr.length > 0) {
            let sFileArr = tFileArr.map((tFileStr) => {
              return new Promise((resolve, reject) => {
                wx.saveFile({
                  tempFilePath: tFileStr.fPath,
                  success: function (res2) {
                    switch (tFileStr.fn) {
                      case 0:
                        that.data.vData[tFileStr.na[0]] = res2.savedFilePath;
                        break;
                      case 1:
                        that.data.vData[tFileStr.na[0]][tFileStr.na[1]] = res2.savedFilePath;
                        break;
                      case 2:
                        that.data.vData[tFileStr.na[0]][tFileStr.na[1]].c = res2.savedFilePath;
                        break;
                    }
                    resolve(res2.savedFilePath)
                  }
                })
              })
            });
            Promise.all(sFileArr).then(() => {
              app.aData[that.data.pNo][that.data.dObjectId] = that.data.vData;
            }).catch(console.error);
          } else { app.aData[that.data.pNo][that.data.dObjectId] = that.data.vData; }
        });
      }
      break;
    case 'fSave':
      if (emptyField) {
        wx.showToast({ title: '请检查下列未输入项目:'+emptyField , icon:'none',duration: 5000 })
      } else {
        sFilePath.then(sFileLists => {
          let sFileArr = sFileLists.filter(sFile => { return sFile.fType < 2 });
          return new Promise((resolve, reject) => {
            if (sFileArr.length > 0) {
              wx.showLoading({ title: '文件提交中' });
              sFileArr.map(sFileStr => () => wx.cloud.uploadFile({ cloudPath:'editpath', filePath: sFileStr.fPath }).then(sfile => {
                if (sfile.statusCode == 1) { wx.removeSavedFile({ filePath: sFileStr.fPath }) };      //删除本机保存的文件
                switch (sFileStr.fn) {
                  case 0:
                    that.data.vData[sFileStr.na[0]] = sfile.fileID;
                    break;
                  case 1:
                    that.data.vData[sFileStr.na[0]][sFileStr.na[1]] = sfile.fileID;
                    break;
                  case 2:
                    that.data.vData[sFileStr.na[0]][sFileStr.na[1]].c = sfile.fileID;
                    break;
                  default:
                    break;
                }
              })
              ).reduce(
                (m, p) => m.then(v => Promise.all([...v, p()])),
                Promise.resolve([])
              ).then(files => {
                wx.hideLoading();
                resolve(files);
              }).catch(console.error)
            } else { resolve('no files save') };
          })
        }).then((sFiles) => {
          if (that.data.targetId == '0') {                    //新建流程的提交
            let cManagers = setRole(app.fData[that.data.pNo].puRoles,app.fData[that.data.pNo].suRoles);
            if (cManagers.length==1){                  //流程无后续审批人
              that.data.vData.unitId = app.roleData.uUnit._id;
              that.data.vData.unitName = app.roleData.uUnit.uName;
              db.collection(that.data.pNo).add({data:that.data.vData}).then(()=>{
                wx.showToast({ title: '审批内容已发布', duration:2000 });
              }).catch((error)=>{
                wx.showToast({ title: '审批内容发布出现错误'+error.error, icon:'none', duration: 2000 });
              })
            } else {
              db.collection('sengpi').add({        //创建审批流程
                data:{
                  dProcedure that.data.pNo,                //流程
                  processState: 0,                //流程处理结果0为提交
                  processUser: [app.roleData.user._id]       //流程处理人ID
                  unitName: app.roleData.uUnit.uName,                 //申请单位
                  sponsorName: app.roleData.user.uName,         //申请人
                  unitId: app.roleData.uUnit._id,        //申请单位的ID
                  dIdear: [{ un: app.roleData.user.uName, dt: new Date(), di: '提交流程', dIdear: '发起审批流程' }]);       //流程处理意见
                  cManagers: cManagers,             //单位条线岗位数组
                  cInstance: 1,                     //下一处理节点
                  cFlowStep: cManagers[1],              //下一流程审批人单位条线岗位
                  dObject: that.data.vData            //流程审批内容
                }
              }).then(() => {
                wx.showToast({ title: '流程已提交,请查询审批结果。', icon:'none',duration: 2000 }) // 保存成功
              }).catch(wx.showToast({ title: '提交保存失败!', icon:'loading',duration: 2000 })) // 保存失败
            }
          } else {
            app.procedures[that.data.targetId].dObject = that.data.vData;
            app.logData.push([Date.now(),that.data.targetId+'修改内容：'+that.data.vData.toString()]);
          }
          }).catch(error => {
            app.logData.push([Date.now(), '编辑提交发生错误:' + error.toString()]);
          });
        setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
      }
      break;
  };
}
}
