//显示数据的关键要素
var app = getApp()
Component({
  relations: {
    './recycle-view': {
      type: 'parent', // 关联的目标节点应为子节点
      linked() {}
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    // height: 100
  },
  lifetimes:{
    attached:()=>{
      var that = this;
      
      switch (that.data.item.pNo){
        case 's_cargo':
          cargototal = app.cargototal[that.data.item._id]
          that.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / package).toFixed(0),
            csupply: (cargototal.canSupply / cargototal.package - 0.5).toFixed(0)
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
    heightChange() {
    }
  }
})
