import { fileUpload } from '../modules/wxcloudcf';
const db = wx.cloud.database();
var app = getApp();

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
  i_integer: function({currentTarget:{id,dataset},detail:{value}}) {
    let vdSet = {};
    vdSet['vData.' + id] = isNaN(Number(value)) ? 0 : parseInt(Number(value));      //不能输入非数字,转换为整数
    this.setData(vdSet);
  },

  i_digit: function ({currentTarget:{id,dataset},detail:{value}}) {
    let vdSet = {};
    vdSet['vData.' + id] = isNaN(Number(value)) ? '0.00' : parseFloat(Number(value).toFixed(2));      //不能输入非数字,转换为浮点数保留两位小数
    this.setData(vdSet);
  },

  i_listsel: function ({currentTarget:{id,dataset},detail:{value}}) {                         //选择类型
    let reqset = {};
    reqset['vData.' +id] = Number(value);
    this.setData(reqset)
  },

  i_eDetail: function (e) {                                 //内容可以插入和删除
    this.setData({
      selectd: parseInt(e.currentTarget.id.substring(3)),      //选择文章内容的数组下标
      startX : e.currentTarget.x                 //touchstart记录起点
    })
  },

  m_touchmove: function (e) {                          //手指滑动过程
    const x = e.detail.x
    this.setData({
      moveInstance: this.data.openWidth - x,    // 阈值，移动超过则显示菜单项，否则隐藏（一般为菜单宽的40%）
      currentX: x
    });
  },

  m_touchend: function (e) {                          //详情插入或替换数据
    if (this.data.currentX === 0) {    // 如果松开手指的时候，已经被拖拽到最左边或者最右边，则不处理
      this.setData({ open: true })
      return
    }
    if (this.data.currentX === this.data.openWidth) {
      this.setData({ open: false })
      return
    }

    if (this.data.open && this.data.currentX > 0) {    // 如果当前菜单是打开的，只要往右移动的距离大于0就马上关闭菜单
      this.setData({ open: false })
      return
    }
    if (this.data.moveInstance < this.data.moveThreshold) {    // 如果当前菜单是关着的，只要往左移动超过阀值就马上打开菜单
      this.setData({
        open: false,
        x: this.data.openWidth
      })
    } else {
      this.setData({ open: true })
    }
  },

  initFunc: function(cName) {      //对数据录入或编辑的格式数组增加函数
    let funcArr = [];
    app.fData[cName].pSuccess.forEach(fieldName=> {
      if (app.fData[cName].fieldType[fieldName].t.length > 3) {             //每个输入类型定义的字段长度大于3则存在对应处理过程
        funcArr.push('i_' + app.fData[cName].fieldType[fieldName].t);
      };
    });
    return funcArr;
  },

  fSubmit: function ({ currentTarget: { id, dataset }, detail:{target,value} }) {
    let that = this;
    let existDetails = ( that.data.fieldName.indexOf('details')>0 && Array.isArray(that.data.vData.details) );
    if (existDetails) {
      for (let i = 0; i < that.data.vData.details.length; i++) {     //有附件字段正文的内容为媒体
        that.data.vData.details[i] = value['adc' + i];
      };
    };
    switch (target.id) {
      case 'fdeldata':                                 //删除内容部分选中的字段
        if (that.data.selectd >= 0) {                         //内容部分容许删除
          that.data.vData.details.splice(that.data.selectd, 1);
          that.setData({ 'vData.details': that.data.vData.details });
        } else { wx.showToast({ title: '此处禁止删除！' }) }
        break;
      case 'fenins':                   //允许显示插入菜单
        let artArray = that.data.vData.details;       //详情的内容
        let sIndex = parseInt(e.currentTarget.dataset.n);      //选择的菜单id;
        let mgrids = ['标题', '正文','产品', '订单','位置', '图片集', '图片', '音频', '视频', '文件'];
        let sI = ['T', 'p','sg','so', 'Geo', '-1', '-2', '-3', '-4','-5' ].indexOf(sIndex);
        artArray.splice(that.data.selectd, 0, { t: sIndex, c:{e: '点击此处输入' + mgrids[sI] + '的说明', f: ''} });
        that.setData({ 'vData.details': artArray, enIns: false })      //‘插入’菜单栏关闭
        break;
      case 'fBack':                   //退出编辑
        wx.navigateBack({ delta: 1 });
        break;
      default:                   //保存或提交
        let sFilePath = [];         //媒体文件归类
        return new Promise((resolve,reject)=>{
          wx.getSavedFileList({
            success: function (res) {
              resolve ( res.fileList.map(fList => { return fList.filePath }) );
            },
            fail: function () { resolve([]) }
          });
        }).then(saveFileList => {                   //检查媒体文件
          function mType(typeClass,eventName){
            return new Promise((resolve, reject) => {
              if (saveFileList.indexOf(value[eventName]) >= 0) {
                resolve(2);            //该文件已暂存
              } else {
                wx.getFileInfo({
                  filePath: value[eventName],
                  success: function () {
                    resolve(1);            //该文件为临时文件
                  },
                  fail: () => {
                    resolve(0);            //该文件为云文件
                  }
                });
              }
            }).then(fStart=>{
              return new Promise((resolve, reject) => {
                if (fStart) {            //该文件为本地文件
                  let sfa = { na: eventName, fs:fStart, t:typeClass};
                  switch (typeClass) {
                    case -1:                   //该组件为图片组
                      for (let b = 0; b < value[eventName].length; b++) {
                        sfa.fPath = value[eventName].f[b];
                        sfa.e = value[eventName].e[b];
                        sfa.fn = b;
                      };
                      break;
                    case -6:                   //该组件为无说明图片
                      sfa.fPath = value[eventName];
                      sfa.e = '图片说明';
                      sfa.fn = -2;
                      break;
                    default:
                      sfa.fPath = value[eventName].f;
                      sfa.e = value[eventName].e;
                      sfa.fn = -1;
                      break;
                  }
                  sFilePath.push(sfa);
                  resolve(true)
                } else {
                  resolve(false)
                }
              })
            }).catch(console.error)
          };
          return new Promise((resolve, reject) => {
            let nft, fileProm = [];
            if (existDetails) {     //有附件字段正文的内容为媒体
              for (let i = 0; i < that.data.vData.details.length; i++) {
                nft = Number(that.data.vData.details[i].t);
                if (nft < 0) {            //该附件的form组件为文件类型
                  fileProm.push(mType(nft,'adc' + i));
                }
              };
            };
            let emptyField = '';                   //检查是否有字段输入为空
            that.data.fieldName.forEach(fName=>{
              if (fName in value){ that.data.vData[fName]=value[fName]; }
              if (typeof that.data.vData[fName]=='undefined'){
                emptyField += '《' + that.data.fieldType[fName].p + '》';
              } else {
                nft = Number(that.data.fieldType[fName].t);
                if (nft < 0) {            //该form组件为文件类型
                  fileProm.push(mType(nft,fName));
                };
              }
            });
            console.log(emptyField, fileProm.length)
            if (fileProm.length>0){
              Promise.all(fileProm).then(()=>{
                function mergeFileField(sfPath,savedFilePath){
                  switch (sfPath.fn) {
                    case -2:
                      value[sfPath.na] = savedFilePath;
                      break;
                    case -1:
                      value[sfPath.na].f = savedFilePath;
                      break;
                    default:
                      value[sfPath.na].f[sfPath.fn] = savedFilePath;
                      break;
                  }
                  if (substr(sfPath.na,0,3)=='adc'){
                    that.data.vData.details[Number(substr(sfPath.na,3))] = value[sfPath.na]
                  } else { that.data.vData[sfPath.na] = value[sfPath.na]}
                };
                if (target.id=='fStorage' && that.data.targetId == '0') {           //新建文件编辑内容不提交流程审批,在本机保存
                  let storageFile = sFilePath.filter(sFile => { return sFile.fs==1 });
                  if (storageFile.length > 0) {                               //将临时文件暂存
                    let saveFiles = storageFile.map(sfPath => {
                      return new Promise((resolve, reject) => {
                        wx.saveFile({
                          tempFilePath: sfPath.fPath,
                          success: function (res2) {
                            resolve(mergeFileField(sfPath,res2.savedFilePath))
                          }
                        })
                      })
                    });
                    Promise.all(saveFiles).then(() => { resolve(emptyField) }).catch(console.error);      //临时文件已暂存
                  } else { resolve(emptyField)}            //所有文件均已保存
                } else if(target.id=='fSave'){
                  if (emptyField) {
                    wx.showToast({ title: '请检查未输入项目:'+emptyField , icon:'none',duration: 5000 })
                    resolve(emptyField)            //有空的字段
                  } else {
                    let uploadFiles = sFilePath.filter(sFile => { return sFile.fs>0 });
                    if (uploadFiles.length > 0) {            //将本地文件上传
                      uploadFiles.map(ulFile => () => fileUpload( ulFile.t, ulFile.fPath,ulFile.e ).then(sfile => {
                        if (ulFile.fs == 2) { wx.removeSavedFile({ filePath: ulFile.fPath }) };      //删除本机保存的文件
                        mergeFileField(ulFile,sfile);
                      })
                      ).reduce(
                        (m, p) => m.then(v => Promise.all([...v, p()])),
                        Promise.resolve([])
                      ).then(() => { resolve(emptyField) })            //所有文件均已上传
                    } else { resolve(emptyField) };            //没有需要上传的文件
                  }
                }
              })
            } else { resolve(emptyField) }            //没有需要上传或保存的文件
          });
          }).then(emptyField => {
          if (!emptyField && target.id == 'fSave'){
            let saveData = that.data.vData;
            for (let fName in that.data.vData) {       //多字段对象类型分解
              if (that.data.fieldType[fName].addFields) {
                saveData[fName] = that.data.vData[fName]._id;
                switch (that.data.fieldType[fName].t) {
                  case 'Geo':
                    saveData[fName+'_aGeoPoint'] = that.data.vData[fName].aGeoPoint;
                    saveData[fName+'_code'] = Number(that.data.vData[fName].code);
                    break;
                  default:
                    that.data.fieldType[fName].addFields.forEach(aField => {
                      saveData[fName + '_' + aField] = that.data.vData[fName][aField];
                    })
                }
              };
              if (['tVE', 'dVe'].includes(that.data.fieldType[fName].t)) {
                saveData[fName] = new Date(that.data.vData[fName])
              };
              if (['integer', 'digit', 'listsel'].includes(that.data.fieldType[fName].t)) {       //数字类型定义
                saveData[fName] = Number(that.data.vData[fName]);
              }
            }
            if (that.data.targetId == '0') {                    //新建流程的提交
              let cManagers = setRole(app.fData[that.data.pNo].puRoles, app.fData[that.data.pNo].suRoles);
              if (cManagers.length == 1) {                  //流程无后续审批人
                saveData.unitId = app.roleData.uUnit._id;
                saveData.unitName = app.roleData.uUnit.uName;
                saveData.updatedAt = db.serverDate();
                db.collection(that.data.pNo).add({ data: saveData }).then(() => {
                  wx.showToast({ title: '审批内容已发布', duration: 2000 });
                }).catch((error) => {
                  wx.showToast({ title: '审批内容发布出现错误' + error.errMsg, icon: 'none', duration: 2000 });
                })
              } else {
                db.collection('sengpi').add({        //创建审批流程
                  data: {
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
                    updatedAt: db.serverDate(),
                    dObject: saveData            //流程审批内容
                  }
                }).then(() => {
                  wx.showToast({ title: '流程已提交,请查询审批结果。', icon: 'none', duration: 2000 }) // 保存成功
                }).catch(wx.showToast({ title: '提交保存失败!', icon: 'loading', duration: 2000 })) // 保存失败
              }
            } else {
              app.procedures[that.data.targetId].dObject = saveData;
              app.logData.push([Date.now(), that.data.targetId + '修改内容：' + JSON.stringify(saveData)]);
            };
          } else {
            app.aData[that.data.pNo][that.data.dObjectId] = that.data.vData;
          }
        }).catch(error => {
          app.logData.push([Date.now(), '编辑提交发生错误:' + JSON.stringify(error)]);
          console.log(Date.now(), '编辑提交发生错误:' ,error);
        });
        setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
        break;
    }
  }
}
