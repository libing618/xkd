//显示数据的关键要素
var app = getApp()
var sysinfo = app.sysinfo;
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
  /**
   * 组件的初始数据
   */
  data: {
    vFormat: [],
    animationData: {},
    showModalBox: false
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 's_cargo':
          cargototal = app.cargototal[this.data.sitem._id]
          this.data.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
            csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
          });
          break;
        default:
      }
    },
  },
  /**
   * 组件的方法列表
   */
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
