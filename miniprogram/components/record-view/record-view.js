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
    animationData: {},
    showModalBox: false
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 's_cargo':
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
        this.setData({ vFormat: app.fData[this.data.pno].pSuccess });
        this.popModal()
      } else {
        let clickEventDetail = {itemid:this.data.sitem._id};
        this.triggerEvent('clickeditem',clickEventDetail)
      }
    }
  }
})