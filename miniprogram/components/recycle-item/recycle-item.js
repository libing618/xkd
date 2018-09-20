//显示数据的关键要素
var app = getApp()
Component({

  properties: {
    pno: {
      type: String,
      value: 'default value',
    },
    sitem: {type: Object}
  },
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的初始数据
   */
  data: {
    // height: 100
  },
  ready: function(){
    switch (this.data.pno) {
      case 's_cargo':
        cargototal = app.cargototal[this.data.sitem._id]
        that.setData({
          scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
          csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
        });
        break;
      default:
    }
  },
  lifetimes:{

  },
  /**
   * 组件的方法列表
   */
  methods: {
    heightChange() {
    }
  }
})
