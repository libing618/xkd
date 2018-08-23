//单位（机构类）组织架构管理
const AV = require('../../libs/leancloud-storage.js');
var app = getApp()          //设置组织架构
Page({
	data:{
    userRolName: '',
		uUnitUsers: {},
		navBarTitle: app.roleData.uUnit.nick+'的组织架构',      //将页面标题设置成单位名称
		statusBar: app.sysinfo.statusBarHeight,
		mRols: [
			['办公','产品','营销','客服'],
			['负责人','部门管理','员工']
		],
		crole: {},
		applyUser: [],
		cmRole:[0,0],
		reqrole: [0,0],
    reqstate: 0,
		eRole: '00'                        //岗位代码
	},
  aUser: {},

  onLoad: function () {
    var that = this;
    if (app.roleData.user.mobilePhoneNumber && app.roleData.uUnit.length>0) {			// 当前用户已注册且已有单位
      if (app.roleData.uUnit.afamily<3) {
        wx.showToast({ title: '非机构类单位,没有下级员工设置。', duration: 7500 })
        wx.navigateBack({ delta: 1 })                // 回退前1 页面
      } else {
        if (app.roleData.uUnit.name == app.roleData.user.objectId) {                //创建人读取单位员工信息
          new AV.Query('reqUnit').equalTo('rUnit', app.roleData.user.unit).find().then((applyUser) => {
            that.setData({ applyUser: applyUser });
          }).catch(console.error);
          let crole = {};
          app.roleData.uUnit.unitUsers.map((cuser) => { return crole[cuser.objectId] = true });
          that.setData({
            crole: crole,
            uUnitUsers: app.roleData.uUnit.unitUsers
          })
        } else {
          new AV.Query('reqUnit').equalTo('userId', app.roleData.user.objectId).find().then((resus) => {
            if (resus.length == 0) {
              let reso = AV.Object.extend('reqUnit');
              that.aUser = new reso();
              that.aUser.set('userId', app.roleData.user.objectId);
              that.aUser.set('uName', app.roleData.user.uName);
              that.aUser.set('avatarUrl', app.roleData.user.avatarUrl);
              that.aUser.set('nickName', app.roleData.user.nickName);
              that.aUser.set('rUnit', app.roleData.user.unit);
              that.aUser.set('rRolArray', [4, 4]);
            } else {
              that.setData({ reqstate: 1, reqrole: resus[0].get('rRolArray') });
            }
          }).catch(console.error())
        }
      };
    } else {
      wx.showToast({ title: '没有注册用户或申请单位,请在个人信息菜单注册。', duration: 7500 })
      wx.navigateBack({ delta: 1 })                // 回退前1 页面
    };
    that.setData({
			userRolName: app.roleData.user.userRolName
		})
  },
	giveRole: function(operation,sRole) {
		let sUser = AV.Object.createWithoutData('_User',operation);
		if (sRole=='sessionuser'){
		  sUser.set('emailVerified', false );
		  sUser.set('unit', '0' );
		} else {
		  sUser.set('emailVerified', true );
		}
		sUser.set('userRolName',sRole);
		return sUser.save();
	},

	fSpicker: function(e) {                         //选择岗位和条线
		let rval = e.detail.value;
		this.setData({ reqrole: rval,
			eRole: rval[0].toString()+ rval[1].toString() });     //对申请条线和岗位进行编码
	},

	fManageRole: function(e) {                         //点击解职、调岗操作
    var that = this;
		let unitRole = new AV.Role(app.roleData.uUnit.name);
		let rN = Number(e.currentTarget.dataset.id), muRole = 'sessionuser';
		return new Promise((resolve, reject) => {
			var uId = app.roleData.uUnit.unitUsers[rn].objectId;
      if (e.currentTarget.id=='mr_0') {               //解职
        unitRole.getUsers().remove(uId);
				app.roleData.uUnit.unitUsers.splice(rN,1);
      } else {                                     //调岗
				that.data.crole[uId] = true;
	    	that.setData({ crole: that.data.crole });
				app.roleData.uUnit.unitUsers[rN].userRolName = (app.roleData.uUnit.indType.indexOf(620406)>=0 ? 'bu.' : 'au.')+that.data.cmRole[0]+'.'+ that.data.cmRole[1] ;
				muRole = app.roleData.uUnit.unitUsers[rN].userRolName;
			};
			unitRole.set('unitUsers',app.roleData.uUnit.unitUsers);
			unitRole.save().then((muser) => { resolve(muRole); })
		}).then((uSetRole)=>{
			that.giveRole(uId , uSetRole).then( ()=>{
				that.setData({ uUnitUsers: app.roleData.uUnit.unitUsers });
			})
    }).catch(console.error())
	},

	fManageApply: function(rn){
		var that = this;
		let unitRole = new AV.Role(app.roleData.uUnit.name);
		let rN = Number(e.currentTarget.dataset.id);
		return new Promise((resolve, reject) => {
			var uId = that.data.applyUser[rN].userId;
      if (e.currentTarget.id=='mr_2') {                          //同意
					let auRole = (app.roleData.uUnit.indType.indexOf(620406)>=0 ? 'bu.' : 'au.') + that.data.applyUser[rN].rRolArray[0]+'.'+that.data.applyUser[rn].rRolArray[1]
					app.roleData.uUnit.unitUsers.push({"objectId":uId, "userRolName":auRole, 'uName':that.data.applyUser[rn].uName, 'avatarUrl':that.data.applyUser[rn].avatarUrl,'nickName':that.data.applyUser[rn].nickName})
					that.setData({ uUnitUsers: app.roleData.uUnit.unitUsers });
					unitRole.getUsers().add(uId);
					unitRole.set('unitUsers',app.roleData.uUnit.unitUsers);
          unitRole.save().then((adduser) => { resolve(auRole) })
      } else {             //拒绝
				resolve('sessionuser');
			};
		}).then((uSetRole)=>{
			that.giveRole(uId , uSetRole).then( ()=>{
				AV.Object.createWithoutData('reqUnit',that.data.applyUser[rN].objectId).destroy().then(()=>{
					that.data.applyUser[rn].splice(rN,1);
					that.setData({applyUser:that.data.applyUser});
				})
			})
    }).catch(console.error)
	},

	fChangeRole: function(e){                  //打开调岗选择
    this.data.crole[e.currentTarget.dataset.id] = !this.data.crole[e.currentTarget.dataset.id];
    this.setData({ crole: this.data.crole })
	},
	rChange: function (e) {
    this.setData({ mIndex: e.detail.value })
  },

	mColumnChange: function (e) {
		this.data.cmRole[e.detail.column] = e.detail.value;
    this.setData({ cmRole: this.data.cmRole })
  },

	fApply: function (e) {
		if (this.data.reqstate==1){
			wx.showToast({title: '岗位申请等待审批。',duration: 3500});
		} else {
			this.aUser.set('rRolArray',this.data.reqrole );
			let mReqUnit = new AV.Role(app.roleData.uUnit.name);
			let mReqACL = new AV.ACL();
			mReqACL.setPublicReadAccess(false);
			mReqACL.setPublicWriteAccess(false);
			mReqACL.setRoleWriteAccess(mReqUnit,true);
			mReqACL.setRoleReadAccess(mReqUnit,true);
			mReqACL.setReadAccess(app.roleData.user.objectId,true)
			this.aUser.setACL(mReqACL);
	    this.aUser.save().then((suser)=>{
				wx.showToast({title: '岗位申请已提交,请等待审批。',duration: 3500});
			}).catch(console.error())
		};
		wx.navigateBack({ delta: 1 })
  }
})
