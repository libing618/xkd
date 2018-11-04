const {sysinfo,fData,cargoStock} = getApp();
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
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
    statusBar: sysinfo.statusBarHeight,
    windowHeight: sysinfo.windowHeight,
    fieldName: [],
    fieldType: {}
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 's_cargo':
          cargototal = cargoStock[this.data.sitem._id]
          this.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
            csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
          });
          break;
        default:
      }
    },
  },

  methods: {
    shareOrder(){
      if (this.data.clickid==this.data.sitem._id){
        this.setData({
          fieldName: fData[this.data.pno].pSuccess,
          fieldType: fData[this.data.pno].fieldType
        });
        this.popModal()
      } else {
        let clickEventDetail = {itemid:this.data.sitem._id};
        this.triggerEvent('clickeditem',clickEventDetail)
      }
    },
    fSave(){

    }
  }
})
