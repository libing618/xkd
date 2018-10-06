//订单统计
const db = wx.cloud.database();
const _ = db.command;
const { formatTime,indexClick } = require('../../libs/util.js');
const { checkRols } =  require('../../model/initForm');
var app = getApp();

Page({
  data:{
    vData: {},
    iClicked: '0'
  },
  onLoad:function(options){
    checkRols(9,app.roleData.user)
  },

  onReady:function(){
    var that = this;
    that.data.vData.start_end = [formatTime(Date.now() - 864000000, true), formatTime(Date.now(), true)];
    that.sumOrders();
  },

  indexClick: indexClick,

  sumOrders:function(){
    var that = this;
    db.collection('orders').where({
      unitId: app.roleData.uUnit._id,
      updatedAt: _.gt(new Date(that.data.vData.sDate])).and(_.lt( new Date(that.data.vData.eDate+86400000)))
    }).count().then(orderlist=>{
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
  }

})
