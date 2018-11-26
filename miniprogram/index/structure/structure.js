//单位（机构类）组织架构管理
import { checkRols } from '../../modules/initForm';
const db = wx.cloud.database();
const {roleData,sysinfo} = getApp()          //设置组织架构
Page({
	data:{
		uUnitUsers: {},
		navBarTitle: roleData.uUnit.nick+'的组织架构',      //将页面标题设置成单位名称
		statusBar: sysinfo.statusBarHeight,
		mRols: [
			['办公','产品','营销','客服'],
			['负责人','部门管理','员工']
		],
		crole: {},
		applyUser: [],
		mrrole:[0,0],
		reqrole: [0,0],
    reqstate: 0
	},
  aUser: {},

  onLoad: function () {
    var that = this;
    if (checkRols(9, roleData.user)) {			// 当前用户是单位负责人
      if (roleData.uUnit.afamily<3) {
        wx.showToast({ title: '非机构类单位,没有下级员工设置。', duration: 7500 })
        wx.navigateBack({ delta: 1 })                // 回退前1 页面
      } else {
				db.collection('_Role').doc(roleData.user.unit).get().then(unitInfo => {
          if (roleData.uUnit._id == roleData.user._id) {                //创建人读取单位所有员工信息
            let crole = {};
            roleData.uUnit.unitUsers.forEach(cuser => {
							crole[cuser._id] = true
						});
            that.setData({
              crole: crole,
              uUnitUsers: roleData.uUnit.unitUsers
            })
            wx.cloud.callFunction({
							name: 'process',
							data: { pModel:'_User', dObjectId:roleData.user.unit, processOperate:5}
						}).then(({result}) => {
              if (result.length > 0) {
                that.setData({ reqstate: 1, applyUser: result });
              }
            }).catch(console.error())
          }
        })
      };
    } else {
      wx.showToast({ title: '没有注册用户或申请单位,请在个人信息菜单注册。', duration: 7500 })
      wx.navigateBack({ delta: 1 })                // 回退前1 页面
    };
  },

	fSpicker: function(e) {                         //选择岗位和条线
		let rval = e.detail.value;
		this.setData({ reqrole: rval});
	},

	fManageRole: function(e) {                         //点击解职、调岗操作
    var that = this;
		let rN = Number(e.currentTarget.dataset.id), muRole = 'sessionuser';
		return new Promise((resolve, reject) => {
			var uId = roleData.uUnit.unitUsers[rn]._id;
      if (e.currentTarget.id=='mr_0') {               //解职
				roleData.uUnit.unitUsers.splice(rN,1);
      } else {                                     //调岗
				that.data.crole[uId] = true;
	    	that.setData({ crole: that.data.crole });
				roleData.uUnit.unitUsers[rN].line = that.data.mrrole[0];
				roleData.uUnit.unitUsers[rN].position =that.data.mrrole[1];
			};
			db.collection('_Role').doc(roleData.user.unit).update({
				data:{'unitUsers':roleData.uUnit.unitUsers}
			}).then((muser) => { resolve(muRole); })
		}).then((uSetRole)=>{
			wx.cloud.callFunction({
				name:'process',
				data: { pModel:'_User', dObjectId:, processOperate:4}
			}).then( ()=>{
				that.setData({ uUnitUsers: roleData.uUnit.unitUsers });
			})
    }).catch(console.error())
	},

	fManageApply: function(rn){
		var that = this;
		let rN = Number(e.currentTarget.dataset.id);
		return new Promise((resolve, reject) => {
			var uId = ;
      if (e.currentTarget.id=='mr_2') {                          //同意
					roleData.uUnit.unitUsers.push({
						"_id":that.data.applyUser[rN]._id,
						"line": that.data.mrrole[0],
						"position": that.data.mrrole[1],
						'uName':that.data.applyUser[rn].uName,
						'avatarUrl':that.data.applyUser[rn].avatarUrl,
						'nickName':that.data.applyUser[rn].nickName
					})
					that.setData({ uUnitUsers: roleData.uUnit.unitUsers });
					unitRole.set('unitUsers',roleData.uUnit.unitUsers);
          unitRole.save().then((adduser) => { resolve(auRole) })
      } else {             //拒绝
				resolve('sessionuser');
			};
		}).then((uSetRole)=>{
			that.giveRole(uId , uSetRole).then( ()=>{
				AV.Object.createWithoutData('reqUnit',that.data.applyUser[rN]._id).destroy().then(()=>{
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
		this.data.mrrole[e.detail.column] = e.detail.value;
    this.setData({ mrrole: this.data.mrrole })
  }
})
