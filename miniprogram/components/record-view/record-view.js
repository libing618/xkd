//显示数据的关键要素
import {initData} from '../../modules/initForm';
var app = getApp()
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
  relations: {
    '../field-view/field-view': {
      type: 'child'                // 关联的目标节点应为子节点
    }
  },
  properties: {
    pno: {
      type: String,
      value: 'goods'
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
    fieldName: [],
    fieldType: {},
    uEV: app.roleData.user.line!=9,    //用户已通过单位和职位审核
    enUpdate: false,
    vData:{},
    scale: 0,
    csupply: 0
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 'goods':
          if (app.cargoStock) {      //[this.data.sitem._id]
            cargototal = app.cargoStock[this.data.sitem._id]
            this.setData({
              scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
              csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
            });
          }
          break;
        default:
          break;
      }
    }
  },

  methods:{
    clickitem(){
      if (this.data.clickid == e.currentTarget.id){
        this.setData({
          fieleName: app.fData[this.data.pno].pSuccess,
          fieldType: app.fData[this.data.pno].fieldType,
          vData: initData(app.fData[this.data.pno].pSuccess, app.fData[this.data.pno].fieldType, this.data.sitem),
          enUpdate: this.data.sitem.unitId==app.roleData.uUnit._id && typeof app.fData[this.data.pno].suRoles!='undefined'
        });
        this.popModal()
      } else {
        this.setData({ clickid: e.currentTarget.id});
      }
    },

    fEditProcedure(e){
      var that = this;
      var url='/pluginPage/fprocedure/fprocedure?pNo='+that.data.pno;
      switch (e.currentTarget.id){
        case 'fModify' :
          url += '&artId='+that.data.vData._id;
          break;
        case 'fTemplate' :
          url += typeof app.fData[that.data.pno].afamily != 'undefined' ? '&artId='+that.data.vData.afamily : '';
          let newRecord = typeof that.data.fieldType.afamily!='undefined' ? that.data.pno+that.data.vData.afamily : that.data.pno;
          app.aData[that.data.pno][newRecord] = that.data.vData;
          break;
      };
      this.downModal();
      wx.navigateTo({ url: url});
    }
  }

})
