var app = getApp()
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
  properties: {
    name: {
      type: String,
      value: 'goods',
    },
    p: {
      type: String,
      value: '0'
    },
    value: {type: Array},
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
    fieldType: {}
  },

  methods: {
    clickfield({ currentTarget:{id,dataset},detail:{value} }){            //字段内容查看弹出页
      if (this.data.clickid==this.data.sitem._id){
        this.setData({
          fieldName: app.fData[this.data.pno].pSuccess,
          fieldType: app.fData[this.data.pno].fieldType
        });
        this.popModal();
        if (this.data.name=='goods') {
          cargototal = app.cargoStock[this.data.sfield[id]._id]
          this.data.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
            csupply: (cargototal.canSupply / this.data.sfield[id].packages - 0.5).toFixed(0)
          });
        }
      }
    }
  }
})
