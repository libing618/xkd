//帐务中心
const db = wx.cloud.database();
const { formatTime,indexClick } = require('../../libs/util.js');
const { checkRols } =  require('../../model/initForm');
const _ = db.command;
const { i_sedate } = require('../import/impedit');
var app = getApp();

Page({
  data:{
    pNo: 'orderlist',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    iFormat: [{ gname:"seDate", p:'起止日期', t:"sedate",endif:false}],
    vData: {start_end: [formatTime(Date.now() - 864000000, true), formatTime(Date.now(), true)]},
    iClicked: ''
  },

  onReady:function(){
    this.sumOrders();
  },
  i_sedate: i_sedate,
  indexClick: indexClick,
  sumOrders:function(){
    var that = this;
    db.collection('cargoSupplies').where({
      unitId:app.roleData.uUnit._id,
      updatedAt: _.gt(new Date(that.data.vData.seDate[0])).and(_.lt(new Date(that.data.vData.seDate[1]+86400000)))
    }).limit(20)
    .get().then(orderlist=>{
      if (orderlist) {
        that.data.mPage.forEach(product=>{
          let sumPro = 0;
          that.data.specPage[product].forEach(cargo=>{
            let sumOrder = 0, specOrder = [];
            orderlist.forEach(order=>{
              if (order.cargo==cargo) {
                specOrder.push(order);
                sumOrder += order.amount};
            })
            that.data.specOrder = specOrder;
            that.data.sumspec[cargo] = sumOrder;
            sumPro += sumOrder;
          })
          that.data.sumpro[product] = sumPro;
        })
        that.setData(that.data);
      }
    }).catch(console.error);
  },
  orderquery:function(e){
    this.sumOrders();
  },
  onShareAppMessage: require('../../model/initForm').shareMessage

})
