const db = wx.cloud.database();
const { shareMessage } = require('../../model/initForm');
var app = getApp()
Page({
  data:{
    user: {},
    statusBar: app.sysinfo.statusBarHeight,
    sysheight: app.sysinfo.windowHeight-300,
    swcheck: true,
    uName: '',
    phonen: '',
    wxlogincode: '',
    cUnitInfo: '创建或加入单位(必须输入姓名)'
	},

  getLoginCode: function() {
    var that=this;
    return new Promise((resolve, reject) => {
      wx.login({
        success: (wxlogined)=> {
          wx.cloud.callFunction({                  // 调用云函数
          name: 'login',
          data: { code: wxlogined.code, loginState:3 }
          }).then(res => {
            resolve('sessionOk')
          })
        },
        fail: (error)=> {
          reject(error)
        }
      });
    })
  },

  onLoad: function () {
    var that = this;
    return new Promise((resolve, reject) => {
      wx.checkSession({
        success: function () {            //session_key 未过期，并且在本生命周期一直有效
          resolve('sessionOk')
        },
        fail: function () {
          resolve(that.getLoginCode())
        }
      })
    }).then(ressession=>{
      if (app.roleData.user.unit!='0') {
        that.data.uName = app.roleData.uUnit.uName;
        if (app.roleData.user.line==9) {
          that.data.cUnitInfo = (app.roleData.user.unit == app.roleData.user._id) ? '您创建的单位正在审批中' : '您申请的岗位正在审批中'
        }
      }
      that.setData({		    		// 获得当前用户
        user: app.roleData.user,
        iName: app.roleData.user.uName,
        wxlogincode: ressession,
        navBarTitle: '尊敬的' + app.roleData.user.nickName + (app.roleData.user.gender == 1 ? '先生' : '女士'),
        cUnitInfo: that.data.cUnitInfo,
        uName: that.data.uName
      });
    }).catch(err=>{
      wx.showToast({ title: '用户登录出错', duration: 2500 });
      setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
    })
  },

	fswcheck: function(e){
		this.setData({ swcheck: !this.data.swcheck });
	},

  gUserPhoneNumber: function(e) {
    var that = this;
    if (e.detail.errMsg == 'getPhoneNumber:ok'){
      return new Promise((resolve, reject) => {
        wx.checkSession({
          success: function () {            //session_key未过期
            resolve('sessionOk')
          },
          fail: function () {
            wx.showToast({
              title: '需要进行微信登录，请再次点击注册。', icon: 'none',duration: 2000
            });
            resolve(that.getLoginCode())
          }
        })
      }).then(ressession=>{
        wx.cloud.callFunction({                  // 调用云函数
          name: 'login',
          data: { code: that.data.wxlogincode, encryptedData: e.detail.encryptedData, iv: e.detail.iv, loginState: 2}
        }).then(phone=> {
          app.roleData.user.mobilePhoneNumber = phone;
          wx.showToast({
            title: '微信绑定的手机号注册成功', icon: 'none',duration: 2000
          })
          that.setData({ user:app.roleData.user })
        }).catch(console.error());
      });
    } else {
        wx.showToast({
          title: '不授权使用微信手机号则不可注册！',icon:'none', duration: 2000
        });
    }
  },

  i_Name: function(e) {							//修改用户姓名
    if ( e.detail.value.uName ) {                  //结束输入后验证是否为空
			app.roleData.user._id
        .set({ "uName": e.detail.value.uName })  // 设置并保存用户姓名
				.save()
				.then((user)=> {
          app.roleData.user['uName'] = e.detail.value.uName;
          this.setData({ iName: e.detail.value.uName})
			}).catch((error)=>{console.log(error)
        wx.showToast({ title: '修改姓名出现问题,请重试。',icon: 'none'})
			});
		}else{
			wx.showModal({
  			title: '姓名输入错误',
  			content: '姓名输入不能为空！'
      });
		}
  },

  makeunit: function(e) {                         //创建单位并申请负责人岗位
    var that = this;
		var reqUnitName = e.detail.value.unitName;
    if (reqUnitName){
      db.collection('_Role').where({uName:reqUnitName}).get().then(results=>{
        if (results.length == 0) {                      //申请单位名称无重复
          db.collection('_Role').add({
            data: {
              _id: app.roleData.user._id,   //用创建人的ID作ROLE的ID
              uName: reqUnitName,
              afamily: 0,
              unitUsers: [{ "_id": app.roleData.user._id, "line": 9, "position": 8, "uName": app.roleData.user.uName, "avatarUrl": app.roleData.user.avatarUrl, "nickName": app.roleData.user.nickName }]
            }
          }).then(() => {
            app.roleData.uUnit.uName = reqUnitName;
            db.collection('_User').doc(app.roleData.user._id).update({
              data: {
                unit: app.roleData.user._id,  // 设置并保存单位ID,设定菜单为applyAdmin
                line: 9,                   //条线
                position: 8               //岗位
              }
            }).then(() => {
              app.roleData.user.unit = app.roleData.user._id;
              app.roleData.user.line = 9;
              app.roleData.user.position = 8;
              wx.navigateTo({ url: '/inputedit/f_Role/f_Role' })
            }).catch((error) => {
              console.log(error)
              wx.showToast({ title: '修改用户单位信息出现问题,请重试。', icon: 'none' })
            });
          }).catch(error => {
            console.log(error);
            wx.showToast({ title: '新建单位时出现问题,请重试。', icon: 'none', duration: 7500 })
          })
        } else {
          wx.showModal({
            title: '已存在同名单位',
            content: '选择取消进行核实修改，选择确定则申请加入该单位！',
            success: function (res) {
              if (res.confirm) {              //用户点击确定则申请加入该单位
                db.collection('_User').doc(app.roleData.user._id).update({
                  data: {
                    unit: res.data[0]._id,        //申请加入该单位
                    line: 9,                   //条线
                    position: 7               //岗位
                  }
                }).then(function (user) {
                  app.roleData.uUnit.uName = reqUnitName
                  app.roleData.user.unit = res.data[0]._id;
                  app.roleData.user.line = 9;
                  app.roleData.user.position = 7;
                  wx.navigateTo({ url: '/index/structure/structure' });
                })
              } else if (res.cancel) {        //用户点击取消
                that.setData({ uName: '' });
              }
            }
          })
        }
      }).catch(error=> { console.log(error) });                                     //打印错误日志
    }
	}

})
