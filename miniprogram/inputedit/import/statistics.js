//订单统计
const db = wx.cloud.database();
const _ = db.command;
const orders = require('../../model/supplies');
const { formatTime,indexClick } = require('../../libs/util.js');
const { checkRols } =  require('../../model/initForm');
const { getData } = require('../../model/wx_data');
const { i_sedate } = require('../import/impedit');
var app = getApp();

Page({
  data:{
    iFormat: [{ gname:"seDate", p:'起止日期', t:"sedate",endif:false}],
    vData: {},
    iClicked: '0'
  },
  onLoad:function(options){
    var that = this;
    if ( checkRols(9,app.roleData.user) ) {
      getData(true,'order').then(proData=>{
        if (proData){
          that.data.mPage = app.mData.order;
          that.data.pageData = app.aData.order;
          getData(true,'cargo').then(specData=>{
            if(specData){
              that.data.specData = app.aData.cargo;
              let shelves={};
              that.data.mPage.forEach(pObjectId=>{
                shelves[pObjectId] = specData.mPage.filter(spec => {return that.data.specPage[spec].product==pObjectId})
              })
              that.data.specPage = shelves;
            }
          }).catch(console.error);
        }
      }).catch(console.error);
    }
  },

  onReady:function(){
    var that = this;
    that.data.vData.start_end = [formatTime(Date.now() - 864000000, true), formatTime(Date.now(), true)];
    that.sumOrders();
  },

  i_sedate: i_sedate,

  indexClick: indexClick,

  sumOrders:function(){
    var that = this;
    db.collection('orders').where({
      unitId: app.roleData.uUnit._id,
      updatedAt: _.gt(new Date(that.data.vData.seDate[0])).and(_.lt( new Date(that.data.vData.seDate[1])+86400000)))
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
