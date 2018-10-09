//顺序切换分类数据
var app = getApp()
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
    vFormat: [],
    animationData: {},
    showModalBox: false
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 'cargo':
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
    clickitem(){            //切换选择弹出页
      if (this.data.clickid==this.data.sitem._id){
        this.setData({
          vFormat: app.fData[this.data.pno].pSuccess,
          targetId: id,
          smtName: app.fData[this.data.pno].pSuccess.afamily[that.data.ht.pageCk]
        });
        this.popModal()
      }
    },
    fSwitch(){                  //确认切换到下一数组并返回
      let that = this;
      let arrNext = (that.data.ht.pageCk + 1) == that.data.ht.fLength ? 0 : (that.data.ht.pageCk + 1);
      db.collection(that.data.pno).doc(that.data.modalId).set('afamily',arrNext).save().then(()=>{
        that.data.cPage[arrNext].push(that.data.modalId);
        let oldNo = that.data.cPage[that.data.ht.pageCk].indexOf(that.data.modalId);
        that.data.cPage[that.data.ht.pageCk].splice(oldNo, 1);
        hidePage.cPage = that.data.cPage;
        this.downModal();
      })
    }
  }
})
