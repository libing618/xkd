//显示数据的关键要素
var app = getApp()
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
  relations: {
    '../content-edit/content-edit': {
      type: 'child', // 关联的目标节点应为子节点
    }
  },
  properties: {
    pno: {
      type: String,
      value: 'goods',
    },
    id: {
      type: String,
      value: '0'
    },
    sitem: {type: Object},
    clickid: {
      type: String,
      value: '0'
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    vFormat: [],
    uEV: app.roleData.user.line!=9,    //用户已通过单位和职位审核
    enUpdate: false,
    vData: {}
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 'goods':
          cargototal = app.cargoStock[this.data.sitem._id]
          this.data.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
            csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
          });
          break;
        default:
      }
    },
  },

  methods: {
    clickitem(){
      if (this.data.clickid==this.data.sitem._id){
        this.setData({
          fieleName: app.fData[this.data.pno].pSuccess
          vFormat: app.fData[this.data.pno].fieldType,
          vData: require('../../model/initForm').initData(app.fData[that.data.pNo].pSuccess,app.aData[that.data.pNo][options.artId]),
          enUpdate = that.data.vData.unitId==app.roleData.uUnit._id && typeof app.fData[that.data.pNo].suRoles!='undefined'
        });
        this.popModal()
      } else {
        let clickEventDetail = {itemid:this.data.sitem._id};
        this.triggerEvent('clickeditem',clickEventDetail)
      }
    }
  },

  fEditProcedure: function(e){
    var that = this;
    var url='/inputedit/fprocedure/fprocedure?pNo='+that.data.pNo;
    switch (e.currentTarget.id){
      case 'fModify' :
        url += '&artId='+that.data.vData._id;
        break;
      case 'fTemplate' :
        url += typeof app.fData[that.data.pNo].afamily != 'undefined' ? '&artId='+that.data.vData.afamily : '';
        let newRecord = that.inFamily ? that.data.pNo+that.data.vData.afamily : that.data.pNo;
        app.aData[that.data.pNo][newRecord] = that.data.vData;
        break;
    };
    wx.navigateTo({ url: url});
  }
})
