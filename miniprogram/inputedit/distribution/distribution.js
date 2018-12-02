//货架管理
import {checkRols} from '../../modules/initForm';
const db = wx.cloud.database();
var app = getApp();

Page({
  data:{
    navBarTitle: app.roleData.uUnit.uName+'的货架',
    statusBar: app.sysinfo.statusBarHeight,
    pageData: {}
  },
  onLoad:function(options){
    checkRols(8,app.roleData.user)
  },

  clickSave:function({currentTarget:{id}}){
    var that = this;
    db.collection('goods').doc(id).update({                  //选择商品的ID
      inSale:!app.aData.goods[id].inSale
    }).then(()=>{
      let aSetData = {};
      app.aData.goods[id].inSale = !app.aData.goods[id].inSale;
      aSetData['pageData.'+id+'.inSale'] = app.aData.goods[id].inSale;
      that.setData(aSetData);
    }).catch( console.error );
  }
})
