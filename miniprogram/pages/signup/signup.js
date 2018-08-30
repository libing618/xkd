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
    wx.login({
      success: function (wxlogined) {
        that.setData({wxlogincode: wxlogined.code ? wxlogined.code : '' })
      }
    });
    return
  },

  onLoad: function () {
    var that = this;
    wx.checkSession({
      success: function () {            //session_key 未过期，并且在本生命周期一直有效
        if (app.roleData.user.unit!='0') {
          that.data.uName = app.roleData.uUnit.uName;
          if (app.roleData.user.mobilePhoneNumber=='0') { that.getLoginCode();}
          if (app.roleData.uUnit._id == app.roleData.user._id) {
            that.data.cUnitInfo = '您创建的单位' + (app.roleData.user.unitVerified ? '' : '正在审批中')
          } else {
            that.data.cUnitInfo = '您申请的' + (app.roleData.user.unitVerified ? '' : '岗位正在审批中')
          }
        }
        that.setData({		    		// 获得当前用户
          user: app.roleData.user,
          iName: app.roleData.user.uName,
          navBarTitle: '尊敬的' + app.roleData.user.nickName + (app.roleData.user.gender == 1 ? '先生' : '女士'),
          cUnitInfo: that.data.cUnitInfo,
          uName: that.data.uName
        })
      },
      fail: function () {
        wx.login({
          fail: () => {
            wx.showToast({ title: '用户登录出错', duration: 2500 });
            setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000); }
        })
      }
    })
  },

	fswcheck: function(e){
		this.setData({ swcheck: !this.data.swcheck });
	},

  gUserPhoneNumber: function(e) {
    var that = this;
    if (that.data.wxlogincode) {
      if (e.detail.errMsg == 'getPhoneNumber:ok'){
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
      } else {
        wx.showToast({
          title: '不授权使用微信手机号则不可注册！',icon:'none', duration: 2000
        });
      }
    } else {
      wx.showToast({
        title: '需要进行微信登录，请再次点击本按钮。', icon: 'none',duration: 2000
      });
      that.getLoginCode();
    }
  },

  i_Name: function(e) {							//修改用户姓名
    if ( e.detail.value.uName ) {                  //结束输入后验证是否为空
			AV.User.current()
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
      var fSeatch = new AV.Query('_Role');
      fSeatch.equalTo('uName',reqUnitName);
      fSeatch.find().then((results)=>{
        let crUnit = new AV.ACL();
        crUnit.setWriteAccess(AV.User.current(), true)     // 当前用户是该角色的创建者，因此具备对该角色的写权限
        crUnit.setPublicReadAccess(true);
        crUnit.setPublicWriteAccess(false);
        if (results.length==0){                      //申请单位名称无重复
          let unitRole = new AV.Role(app.roleData.user._id,crUnit);   //用创建人的ID作ROLE的名称
          unitRole.getUsers().add(AV.User.current());
          unitRole.set('uName',reqUnitName)
          unitRole.set('unitUsers',[{"_id":app.roleData.user._id, "userRolName":'csradmin', 'uName':app.roleData.user.uName, 'avatarUrl':app.roleData.user.avatarUrl,'nickName':app.roleData.user.nickName}] );
          unitRole.save().then((res)=>{
            app.roleData.uUnit = res.toJSON();
            AV.User.current()
              .set({ "unit": res._id, "userRolName": 'applyAdmin' })  // 设置并保存单位ID,设定菜单为applyAdmin
              .save()
              .then(function(user) {
                app.getRols(res._id);
                wx.navigateTo({ url: '/inputedit/f_Role/f_Role' })
              }).catch((error) => { console.log(error)
                wx.showToast({ title: '修改用户单位信息出现问题,请重试。', icon: 'none'})	});
          }).catch((error) => { console.log(error);
            wx.showToast({ title: '新建单位时出现问题,请重试。', icon: 'none',duration: 7500}) })
        }else{
          wx.showModal({
            title: '已存在同名单位',
            content: '选择取消进行核实修改，选择确定则申请加入该单位！',
            success: function(res) {
              if (res.confirm) {              //用户点击确定则申请加入该单位
                let resUnit = results[0].toJSON();
                crUnit.setRoleWriteAccess(resUnit._id,true);
                crUnit.setRoleReadAccess(resUnit._id,true);
                let rQuery = AV.Object.createWithoutData('userInit', '59af7119ac502e006abee06a')  //设定菜单为sessionuser
                AV.User.current()
                  .set({ "unit": resUnit._id, "userRolName": 'sessionuser', "userRol": rQuery } )  // 设置并保存单位ID
                  .setACL(crUnit)
                  .save()
                  .then(function(user) {
                    app.roleData.uUnit = resUnit;
                    app.roleData.user.unit = resUnit._id;
                    that.setData({user : app.roleData.user});
                    wx.navigateTo({ url: '/index/structure/structure' });
                  })
              } else if (res.cancel) {        //用户点击取消
                that.setData({uName: ''});
              }
            }
          })
        }
      }).catch(function(error) { console.log(error) });                                     //打印错误日志
    }
	}

})
