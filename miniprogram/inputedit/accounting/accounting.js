//帐务中心
import { formatTime,indexClick } from '../../model/util.js';
const { checkRols } =  require('../../model/initForm');
const db = wx.cloud.database();
const _ = db.command;
var app = getApp();

Page({
  data:{
    pNo: 'orderlist',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    vData: {start_end: [formatTime(Date.now() - 864000000, true), formatTime(Date.now(), true)]},
    iClicked: ''
  },

  onReady:function(){
    this.sumOrders();
  },

  indexClick: indexClick,
  sumOrders:function(){
    var that = this;
    db.collection('cargoSupplies').where({
      unitId:app.roleData.uUnit._id,
      updatedAt: _.gt(new Date(that.data.vData.sDate)).and(_.lt(new Date(that.data.vData.eDate+86400000)))
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
