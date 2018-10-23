// 通用的内容编辑pages
const wImpEdit = require('../../libs/impedit.js');
var app = getApp()
Page({
  data: {
    navBarTitle: '编辑--',              //申请项目名称
    statusBar: app.sysinfo.statusBarHeight,
    selectd: -1,                       //详情项选中字段序号

    enIns: true,                  //插入grid菜单组关闭
    targetId: '0',              //流程申请表的ID
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    showModalBox: false,
    animationData: {},              //弹出动画
    vData: {},
    fieldType: {},
    fieldName: []
  },
  onLoad: function (options) {        //传入参数为tgId或pNo/artId,不得为空
    var that = this;
    let aaData;
    that.data.uEV = (app.roleData.user.line!=9);            //用户已通过单位和职位审核
    return new Promise((resolve, reject) => {
      if (typeof options.tgId == 'string') {                   //传入参数含审批流程ID，则为编辑审批中的数据
        if (app.procedures[options.tgId].length>0) {
          aaData = app.procedures[options.tgId].dObject;
          that.data.targetId = options.tgId;
          resolve({pNo:app.procedures[options.tgId].dProcedure,pId:app.procedures[options.tgId].dObjectId});
        } else { reject() };
      } else {
        let artid = Number(options.artId);
        resolve({ pNo: options.pNo, pId: isNaN(artid) ? options.artId : artid });
      }
    }).then(ops=>{
      switch (typeof ops.pId){
        case 'number':           //传入参数为一位数字的代表该类型新建数据或读缓存数据
          that.data.dObjectId = ops.pNo + ops.pId;      //根据类型建缓存KEY
          that.data.navBarTitle += app.fData[ops.pNo].afamily[ops.pId]
          break;
        case 'string':                   //传入参数为已发布ID，重新编辑已发布的数据
          that.data.dObjectId = ops.pId;
          that.data.navBarTitle += app.fData[ops.pNo].pName;
          break;
        case 'undefined':               //未提交或新建的数据KEY为审批流程pModel的值
          that.data.dObjectId = ops.pNo;
          that.data.navBarTitle += app.fData[ops.pNo].pName;
          break;
      }
      let fieldName = app.fData[ops.pNo].pSuccess;
      let fieldType = app.fData[ops.pNo].fieldType;
      fieldName.unshift("uName");
      fData.uName = {t:"h2", p:"名称" };
      if (typeof aaData == 'undefined') {
        aaData = require('../../model/initForm').initData(fData,app.aData[ops.pNo][that.data.dObjectId])
      }//require('../../test/goods0')[0]
      wImpEdit.initFunc(fieldName).forEach(functionName => {
        that[functionName] = wImpEdit[functionName];
        if (functionName == 'i_eDetail') {             //每个输入类型定义的字段长度大于3则存在对应处理过程
          let vDataKeys = Object.keys(aaData);            //数据对象是否为空
          that.farrData = wImpEdit.farrData;
          that.i_insdata = wImpEdit.i_insdata;
          if (vDataKeys.length == 0){
            aaData.eDetail = [                     //内容部分定义：t为类型,e为文字或说明,c为媒体文件地址或内容
              { t: "h", c:{e: "大标题" ,r:"2110D9D9D9ECECEC"}},
              { t: "p", c:{e: "正文简介" ,r:"3002D9D9D9ECECEC"}},
              { t: "h", c:{e: "中标题" ,r:"3110D9D9D9ECECEC"}},
              { t: "p", c:{e: "正文" ,r:"3002D9D9D9ECECEC"}},
              { t: "h", c:{e: "1、小标题" ,r:"4110D9D9D9ECECEC"}},
              { t: "p", c:{e: "图片文章混排说明" ,r:"4002D9D9D9ECECEC"}},
              { t: "-4", c: {filepath:'http://ac-trce3aqb.clouddn.com/eb90b6ebd3ef72609afc.png', e: "图片内容说明",r:"4010D9D9D9ECECEC"} },
              { t: "p", c:{e: "正文" ,r:"4002D9D9D9ECECEC"}},
              { t: "h", c:{e: "2、小标题" ,r:"4110D9D9D9ECECEC"}},
              { t: "p", c:{e: "音频文章混排" ,r:"4002D9D9D9ECECEC"}},
              { t: "-6", c: {filepath:"https://i.y.qq.com/v8/playsong.html?songid=108407446&source=yqq", e: "录音内容说明",r:"4010D9D9D9ECECEC"} },
              { t: "p", c:{e: "正文" ,r:"4002D9D9D9ECECEC"}},
              { t: "h", c:{e: "3、小标题" ,r:"4110D9D9D9ECECEC"}},
              { t: "p", c:{e: "视频文章混排" ,r:"4002D9D9D9ECECEC"}},
              { t: "-7", c: {filepath:"https://v.qq.com/x/page/f05269wf11h.html?ptag=2_5.9.0.13560_copy", e: "视频内容说明",r:"4010D9D9D9ECECEC"} },
              { t: "p", c:{e: "正文" ,r:"4002D9D9D9ECECEC"}},
              { t: "p", c:{e: "章节结尾" ,r:"4002D9D9D9ECECEC"}},
              { t: "p", c:{e: "文章结尾" ,r:"4002D9D9D9ECECEC"}}
            ]
          }
        }
      });
      that.setData({
        pNo: ops.pNo,
        navBarTitle: that.data.navBarTitle,
        fieldName: fieldName,
        vData: aaData
      });
    }).catch((error)=>{
      console.log(error)
      wx.showToast({ title: '数据传输有误',icon:'loading', duration: 2500 });
      setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
    });
  },

  properties: {
      // 阈值，往左移动超过则显示菜单项，否则隐藏（一般为菜单宽的40%）
      moveThreshold: {
        type: Number,
        value: 30
      },
      // 可以往左拖动的最大距离,同时它也是组件的初始x坐标，此时菜单不可见
      openWidth: {
        type: Number,
        value: 75
      },
      // 菜单是否打开了，true表示打开，false表示关闭
      open: {
        type: Boolean,
        value: false,
        observer: function (open) {
          this.setData({
            x: open ? 0 : this.data.openWidth
          })

          this.triggerEvent('change', {
            open
          })
        }
      }

    },

    /**
     * 组件的初始数据
     */
    data: {
      x: 75, // 单位px

      currentX: 75, // 当前记录组件被拖动时的x坐标
      moveInstance: 0 // 记录往左移动的距离
    },
    attached: function () {
      this.setData({
        x: this.data.open ? 0 : this.data.openWidth
      })
    },
    methods: {
      handleChange: function (e) {
        const x = e.detail.x
        this.data.moveInstance = this.data.openWidth - x
        this.data.currentX = x
        // console.log(this.data.moveInstance)
      },
      handleTouchend: function () {
        // 如果松开手指的时候，已经被拖拽到最左边或者最右边，则不处理
        if (this.data.currentX === 0) {
          this.setData({ open: true })
          return
        }
        if (this.data.currentX === this.data.openWidth) {
          this.setData({ open: false })
          return
        }
        // 如果当前菜单是打开的，只要往右移动的距离大于0就马上关闭菜单
        if (this.data.open && this.data.currentX > 0) {
          this.setData({ open: false })
          return
        }

        // 如果当前菜单是关着的，只要往左移动超过阀值就马上打开菜单
        if (this.data.moveInstance < this.data.moveThreshold) {
          this.setData({
            open: false,
            x: this.data.openWidth
          })
        } else {
          this.setData({ open: true })
        }
      },
      // 点击删除按钮触发的事件
      handleDelete: function () {
        this.setData({ open: false })
        this.triggerEvent('delete')
      },
      // 开始左滑时触发（轻触摸的时候也会触发），主要用于显示当前删除按钮前先 隐藏掉其它项的删除按钮
      handleTouchestart: function () {
        if (!this.data.open) {
          this.triggerEvent('sliderLeftStart')
        }
      }
    }


  fSubmit: wImpEdit.fSubmit

})
