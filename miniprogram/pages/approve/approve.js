//流程审批模块
const AV = require('../../libs/leancloud-storage.js');
const { readShowFormat } = require('../../libs/util');
var app=getApp()
Page({
  data:{
    statusBar: app.sysinfo.statusBarHeight,
    biType: [
      { gname:"unitName", p:'申请单位', t:"h3" },
      { gname:"sponsorName", p:'发起人姓名', t:"h3" }
    ],
    bsType: [],
    aValue: {},
    uIdearArray: ['通 过', '退回发起人 ','废 弃' ],
    cResult: -1,
    pBewrite: '',
    aprvClicked: [true,true,false]
  },

  onLoad:function(options){
    var that = this;
    let procedureClass = app.fData[app.procedures[options.approveId].dProcedure];
    app.procedures[options.approveId].dObject.unitId = app.procedures[options.approveId].unitId;
    readShowFormat(procedureClass.pSuccess,app.procedures[options.approveId].dObject).then(req=>{
      that.setData({
        bsType: req,      //流程内容格式
        navBarTitle: procedureClass.pName,     //将页面标题设置成流程名称
        pBewrite: procedureClass.pBewrite,     //流程说明
        pModel: app.procedures[options.approveId].dProcedure,         //流程写入的数据表名
        aValue: app.procedures[options.approveId],        //流程缓存
        enEdit: app.roleData.uUnit.objectId==app.procedures[options.approveId].unitId,          //本单位的流程允许编辑
        enApprove: app.procedures[options.approveId].cFlowStep.indexOf(app.roleData.user.objectId) >= 0,     //当前用户为流程处理人
        afamilys: procedureClass.afamily ? procedureClass.afamily : false,                              //流程内容分组
        cmLength: app.procedures[options.approveId].cManagers.length    //流程审批节点长度
      });
    }).catch(console.error);
  },

  aprvClick: function(e){
    let i = parseInt(e.currentTarget.id.substring(3))      //选择审批流程类型的数组下标
    this.data.aprvClicked[i] = ! this.data.aprvClicked[i];
    this.setData({ aprvClicked: this.data.aprvClicked })
  },

  resultChange: function(e){
    var nInstace = Number(this.data.aValue.cInstance);
	  switch (e.detail.value) {
      case "0":
        nInstace++;
        break;
      case "1":
        nInstace=0;
        break;
      case "2":
        nInstace=this.data.cmLength;
        break;
    };
    this.setData({cResult:Number(e.detail.value), "aValue.cInstance":nInstace})
  },

  fsave:function(e) {                         //保存审批意见，流向下一节点
    var that = this;
    function setRole(){
      return new Promise((resolve, reject) => {
        if (that.data.aValue.dProcedure == '_Role') {                    //是否单位审批流程
          let setUser = AV.Object.createWithoutData('_User',that.data.aValue.unitId);
          setUser.set('emailVerified',true);
          setUser.set('userRolName','u'+that.data.aValue.afamily+'.admin');
          setUser.save().then(()=>{ resolve(true) })
        } else { resolve(false) }
      }).catch(console.error);
    };
    var nInstace = Number(that.data.aValue.cInstance);        //下一流程节点
    if (nInstace>=0) {
      var rResultId = Number(e.detail.value.dResult)+1;
      return new Promise((resolve, reject) => {
        if ( nInstace==that.data.cmLength && rResultId === 1 ){   //最后一个节点审批通过
          let sData = that.data.aValue.dObject;
          let sObject;
          if (that.data.aValue.dObjectId=='0'){       //新建数据
            let dObject = AV.Object.extend(that.data.pModel);
            sObject = new dObject();
          } else {       //修改数据
            sObject = AV.Object.createWithoutData(that.data.pModel,that.data.aValue.dObjectId)
          }
          if (that.data.aValue.dProcedure !== '_Role') {
            sData.unitId = that.data.aValue.unitId;
            sData.unitName = that.data.aValue.unitName;
          };
          let unitRole = new AV.ACL();
          unitRole.setPublicReadAccess(true);
          unitRole.setRoleWriteAccess(that.data.aValue.unitId,true);  //为单位角色设置写权限
          sObject.setACL(unitRole);
          sObject.set(sData).save().then((sd)=>{
            setRole().then(()=>{
              wx.showToast({ title: '审批内容已发布', duration:2000 });
              resolve(sd.objectId);
            })
          }).catch((error)=>{
            wx.showToast({ title: '审批内容发布出现错误'+error.error, duration: 2000 });
            reject(error);
          })
        } else { resolve(0) };
      }).then((sObjectId)=>{
        let cApproval = AV.Object.createWithoutData('sengpi', that.data.aValue.objectId);
        if (sObjectId) {cApproval.set('dObjectId',sObjectId);}
        cApproval.set('dResult', rResultId);                //流程处理结果
        let uIdear = that.data.aValue.dIdear;
        uIdear.unshift({ un: app.roleData.user.uName, dt: new Date(), di:that.data.uIdearArray[rResultId-1] , dIdear:e.detail.value.dIdear })
        cApproval.set('dIdear', uIdear);       //流程处理意见
        cApproval.set('cInstance', nInstace);             //下一处理节点
        cApproval.set('cFlowStep', nInstace == that.data.cmLength ? ['流程结束'] : that.data.aValue.cManagers[nInstace]); //下一流程审批人
        cApproval.save().then(function () {
          wx.showToast({ title: '流程已提交,请查询结果。', duration: 2000 }) // 保存成功
          setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
        })
      }).catch(console.error);
    } else {
      wx.showToast({title: '请进行审批处理', duration: 2500, icon: 'loading'})
    }
  },

})
