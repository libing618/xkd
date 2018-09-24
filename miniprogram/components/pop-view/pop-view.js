//弹出显示组件
var app = getApp()
f_modalRecordView: function ({ currentTarget:{id,dataset} }) {            // 记录内容查看弹出页
  var that = this;
  let hidePage = {}, showPage = {}, pageNumber = that.data.sPages.length - 1;
  let spmKey = 'sPages[' + pageNumber +'].';
  let nowPage = that.data.sPages[pageNumber];
  switch (id) {
    case 'fBack':                  //返回
      downModal(that,hidePage);
      break;
    default:                  //打开弹出页
      that.data.sPages.push({
        pageName:'modalRecordView',
        vFormat: app.fData[dataset.pNo].pSuccess,
        targetId:id
      });
      that.setData({ sPages: that.data.sPages });
      popModal(that)
      break;
  }
},

f_modalFieldView: function ({ currentTarget:{id,dataset} }) {            //字段内容查看弹出页
  var that = this;
  let hidePage = {}, showPage = {}, pageNumber = that.data.sPages.length - 1;
  let spmKey = 'sPages[' + pageNumber +'].';
  let nowPage = that.data.sPages[pageNumber];
  switch (id) {
    case 'fBack':                  //返回
      downModal(that,hidePage);
      break;
    default:                  //打开弹出页
      that.data.sPages.push({
        pageName:'modalFieldView',
        vFormat: app.fData[dataset.pNo].pSuccess
      });
      that.setData({ sPages: that.data.sPages });
      popModal(that)
      break;
  }
},
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pno: {
      type: String,
      value: 'default value',
    },
    vFormat: {
      type: Array,
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

  },

  lifetimes:{
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
    }
  },
  methods: {

  }
})
