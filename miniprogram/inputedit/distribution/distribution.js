//货架管理
const db = wx.cloud.database();
const { checkRols,unitData } =  require('../../model/initForm');
const { getData } = require('../../model/wx_data');
var app = getApp();

Page({
  data:{
    navBarTitle: app.roleData.uUnit.uName+'的货架',
    statusBar: app.sysinfo.statusBarHeight,
    pageData: {}
  },
  onLoad:function(options){
    if ( checkRols(9,app.roleData.user) ) {
      this.setPage(true);
    }
  },

  setPage: function(reNew){
    if (reNew) {                     //商品数据有更新
      this.setData({
        pageData: unitData('goods'),
        mPage:app.mData.goods[app.roleData.uUnit._id]
      });
    };
  },

  onReady: function(){
    getData(true,'goods').then((isupdated)=>{ this.setPage(isupdated) });              //更新缓存以后有变化的数据
  },

  clickSave:function({currentTarget:{id}}){
    var that = this;
    return new AV.Object.createWithoutData('goods',id).set({                  //选择商品的ID
      inSale:!app.aData.goods[id].inSale
    }).save().then((prodata)=>{
      let aSetData = {};
      app.aData.goods[id].inSale = !app.aData.goods[id].inSale;
      aSetData['pageData.'+id+'.inSale'] = app.aData.goods[id].inSale;
      that.setData(aSetData);
    }).catch( console.error );
  }
})
