//单位（机构类）组织架构管理
import { checkRols } from '../../modules/initForm';
const db = wx.cloud.database();
const {roleData,sysinfo} = getApp()          //设置组织架构
Page({
	data:{
		uUnitUsers: {},
		ht: {
      navTabs: ['员工表', '申请人'],
      tWidth: 470 * sysinfo.rpxTopx / 2,   //每个tab宽度470rpx÷3
      fLength: 2,
      twwHalf: 48 * sysinfo.rpxTopx,   //每个tab字体宽度一半32rpx*3÷2
      pageCk: 0
    },
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
    if (checkRols(8, roleData.user)) {			// 当前用户是单位负责人
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
      wx.showToast({ title: '没有注册用户或申请单位,请在个人信息菜单注册。', icon:'none',duration: 7500 })
      wx.navigateBack({ delta: 1 })                // 回退前1 页面
    };
  },

	fSpicker: function(e) {                         //选择岗位和条线
		let rval = e.detail.value;
		this.setData({ reqrole: rval});
	},

	fManageRole: function(e) {                         //点击解职、调岗操作
    var that = this;
		let rN = Number(e.currentTarget.dataset.id);
		let uId;
		return new Promise((resolve, reject) => {
			switch (e.currentTarget.id) {
				case 'mr_0':               //解职
					uId = roleData.uUnit.unitUsers[rN]._id;
					roleData.uUnit.unitUsers.splice(rN,1);
					break;
				case 'mr_1':               //调岗
					uId = roleData.uUnit.unitUsers[rN]._id;
					that.data.crole[uId] = true;
					that.setData({ crole: that.data.crole });
					roleData.uUnit.unitUsers[rN].line = that.data.mrrole[0];
					roleData.uUnit.unitUsers[rN].position =that.data.mrrole[1];
					break;
				case 'mr_2':                  //入职
					uId = that.data.applyUser[rN]._id;
					roleData.uUnit.unitUsers.push({
						"_id": uId,
						"line": that.data.mrrole[0],
						"position": that.data.mrrole[1],
						'uName':that.data.applyUser[rn].uName,
						'avatarUrl':that.data.applyUser[rn].avatarUrl,
						'nickName':that.data.applyUser[rn].nickName
					})
					break;
				default:             //拒绝
					uId = that.data.applyUser[rN]._id;
					resolve(true);
			};
			db.collection('_Role').doc(roleData.user.unit).update({
				data:{'unitUsers':roleData.uUnit.unitUsers}
			}).then(() => { resolve(e.currentTarget.id=='mr_0'); })
		}).then(mr0=>{
			wx.cloud.callFunction({
				name:'process',
				data: {
					pModel:'_User',
					dObjectId: uId,
					sData:{
						line: mr0 ? 9 : that.data.mrrole[0],
						position: mr0 ? 7 : that.data.mrrole[1],
						unit: mr0 ? '0' : roleData.user.unit
					},
					processOperate:4
				}
			}).then( ()=>{
				that.setData({ uUnitUsers: roleData.uUnit.unitUsers });
			})
    }).catch(console.error())
	},

	fChangeRole: function(e){                  //打开岗位选择
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
