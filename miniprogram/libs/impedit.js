const db = wx.cloud.database();
var app = getApp();
const vdSet = function (sname, sVal) {
  let reqset = {};
  reqset['vData.' + sname] = sVal;
  return reqset;
};
const rdSet = function (n, rdg, rdn) {
  let reqdataset = {};
  reqdataset['iFormat[' + n + '].' + rdg] = rdn;
  return reqdataset;
};
function getdate(idate) {
  let rdate = new Date(idate)
  var year = rdate.getFullYear()+'';
  var month = rdate.getMonth() + 1;
  var day = rdate.getDate();
  return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)
};
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
  f_number: function (e) {
    let n = parseInt(e.currentTarget.id.substring(3));      //数组下标
    let vdSet = {};
    vdSet['vData.' + this.data.iFormat[n].gname] = isNaN(Number(e.detail.value)) ? 0 : parseInt(Number(e.detail.value));      //不能输入非数字,转换为整数
    this.setData(vdSet);
  },

  f_digit: function (e) {
    let n = parseInt(e.currentTarget.id.substring(3));      //数组下标
    let vdSet = {};
    vdSet['vData.' + this.data.iFormat[n].gname] = isNaN(Number(e.detail.value)) ? '0.00' : parseFloat(Number(e.detail.value).toFixed(2));      //不能输入非数字,转换为浮点数保留两位小数
    this.setData(vdSet);
  },

  f_mCost:function(e){
    let n = parseInt(e.currentTarget.id.substring(3));      //数组下标
    let inmcost = Number(e.detail.value);
    let vdSet = {};
    if (isNaN(inmcost)){
      vdSet['vData.'+this.data.iFormat[n].gname] = 0;      //不能输入非数字
    } else {
      vdSet['vData.'+this.data.iFormat[n].gname] = inmcost>30 ? 30 : inmcost ;      //不能超过30%
    }
    this.data.vData[this.data.iFormat[n].gname] = isNaN(inmcost) ? 0 : (inmcost > 30 ? 30 : inmcost)
    vdSet['vData.mCost'] = 87 - (this.data.vData.channel ? this.data.vData.channel : 0) - (this.data.vData.extension ? this.data.vData.extension :0);
    this.setData( vdSet );
  },

  i_listsel: function (e) {                         //选择类型
    let n = parseInt(e.currentTarget.id.substring(3))      //数组下标
    this.setData(vdSet(this.data.iFormat[n].gname, Number(e.detail.value)))
  },

  i_pics: function (e) {                         //选择图片组
    var that = this;
    let n = parseInt(e.currentTarget.id.substring(3))      //数组下标
    wx.chooseImage({
      count: 9,                                     // 最多可以选择的图片张数，默认9
      sizeType: ['compressed'],         // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'],             // album 从相册选图，camera 使用相机，默认二者都有
      success: function (restem) {                     // 返回选定照片的本地文件路径列表
        that.setData(vdSet(that.data.iFormat[n].gname, restem.tempFilePaths));
      },
      fail: function () { wx.showToast({ title: '选取照片失败！' }) }
    })
  },

  i_eDetail: function (e) {                                 //内容可以插入和删除
    var that = this;
    that.setData({
      selectd: parseInt(e.currentTarget.id.substring(3)),      //选择文章内容的数组下标
      enMenu: 'inline-block'
    })
  },

  i_insdata: function (e) {                          //插入数据
    this.farrData(e.currentTarget.id, 0);      //选择的菜单id;
  },

  farrData: function (sIndex, instif) {                          //详情插入或替换数据
    var that = this;
    var artArray = that.data.vData.details;       //详情的内容
    let mgrids = ['产品', '图像', '音频', '视频', '位置', '文件', '大标题', '中标题', '小标题', '正文'];
    let sI = ['-1', '-2', '-3', '-4', '-5', '-6', 'h2', 'h3', 'h4', 'p'].indexOf(sIndex);
    artArray.splice(that.data.selectd, instif, { t: sIndex, c:{e: '点击此处输入' + mgrids[sI] + '的说明', filepath: ''} });
    that.setData({ 'vData.details': artArray, enIns: true });
  },

  initFunc: function(iFormat) {      //对数据录入或编辑的格式数组增加函数
    let funcArr = [];
    for (let i = 0; i < iFormat.length; i++) {
      if (iFormat[i].csc) {
        funcArr.push('f_' + iFormat[i].itype);
      } else {
        if (iFormat[i].t.length > 3) {             //每个输入类型定义的字段长度大于3则存在对应处理过程
          funcArr.push('i_' + iFormat[i].t);
        };
      };
    };
    return funcArr;
  },

  fSubmit: function (e) {
    var that = this;
    var subData = e.detail.value;
    let cNumber = ['fg','dg','listsel'];       //数字类型定义
    let cObject = ['ast','iNd','pDt','eAd','gds','sId','cId'];       //对象类型定义
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
        if (req.t=='tVE') {that.data.vData[req.gname] = Number(that.data.vData[req.gname].replace(':',''))};
        if ( cNumber.indexOf(req.t)>=0 ) { that.data.vData[req.gname] = Number(that.data.vData[req.gname]); }
        if ( cObject.indexOf(req.t)>=0 && typeof that.data.vData[req.gname]=='string') {that.data.vData[req.gname] = JSON.parse(that.data.vData[req.gname])}
      }
    });
    var sFilePath = new Promise(function (resolve, reject) {         //本地媒体文件归类
      let filePaths = [];
      that.data.iFormat.forEach(nField => {
        switch (nField.t) {
          case 'eDetail':
            for (let a = 0; a < that.data.vData[nField.gname].length; a++) {
              if (['-2', '-3', '-4', '-6'].indexOf(that.data.vData[nField.gname][a].t) >= 0) {     //该字段正文的内容为媒体
                filePaths.push({ na: [nField.gname, a], fPath: that.data.vData[nField.gname][a].c.filepath, fType: 2, fn: 2 });
              }
            }
            break;
          case 'pics':
            for (let b = 0; b < that.data.vData[nField.gname].length; b++) {     //该字段为图片组
              filePaths.push({ na: [nField.gname, b], fPath: that.data.vData[nField.gname][b], fType: 2, fn: 1 });
            }
            break;
          default:
            if (['pic', 'audio', 'vidio', 'file'].indexOf(nField.csc) >= 0) {            //该字段为媒体
              filePaths.push({ na: [nField.gname, -1], fPath: that.data.vData[nField.gname].filepath, fType: 2, fn: 0 });
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
                          that.data.vData[tFileStr.na[0]][tFileStr.na[1]].c.filepath = res2.savedFilePath;
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
                    dProcedure: that.data.pNo,                //流程
                    processState: 0,                //流程处理结果0为提交
                    processUser: [app.roleData.user._id],       //流程处理人ID
                    unitName: app.roleData.uUnit.uName,                 //申请单位
                    sponsorName: app.roleData.user.uName,         //申请人
                    unitId: app.roleData.uUnit._id,        //申请单位的ID
                    dIdear: [{ un: app.roleData.user.uName, dt: new Date(), di: '提交流程', dIdear: '发起审批流程' }],       //流程处理意见
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
              app.logData.push([Date.now(),that.data.targetId+'修改内容：'+JSON.stringify(that.data.vData)]);
            }
            }).catch(error => {
              app.logData.push([Date.now(), '编辑提交发生错误:' + JSON.stringify(error)]);
            });
          setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
        }
        break;
    };
  }
}
