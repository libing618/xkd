//分销招募
import {hTabClick} from '../../modules/util.js';
import {checkRols,shareMessage} from '../../modules/initForm';
const db = wx.cloud.database();
var app = getApp()
Page({
  data:{
    pNo: 'distributor',
    statusBar: app.sysinfo.statusBarHeight,
    ht:{
      navTabs: ['已签约店铺','已解约店铺'],
      fLength: 2,
      pageCk: 0
    },
    cPage: [new Set(),new Set()],
    pageData: {},
    sPages: [{
      pageName: 'tabDistributor'
    }],
    showModalBox: false,
    animationData: {},
    vFormat:[
      {gname: "agreement", p:'招募文件',t: "agreeFile"},
      {gname: "agreeState", p:'合同状态',t:"listsel", aList:['签约',' 解约']},
      {gname: "shopName", p: '店铺名称', t: "h2" },
      {gname: "shopLogo", p: '店铺标记', t: "thumb" },
      {gname: "address", p: '店铺详细地址', t:"ed"}
    ]
  },

  onLoad:function(options){
    var that = this;
    if (checkRols(9,app.roleData.user)) {
      db.collection('distributor').where({unitId:app.roleData.uUnit._id}).orderBy('updatedAt','asc').get().then(channel=>{
        if (channel) {
          let fc;
          channel.forEach(csi=>{
            fc = csi.toJSON();
            that.data.pageData[fc.shopId] = fc;
            that.data.cPage[fc.agreeState].add(fc.shopId);
          })
          that.setData({
            cPage:that.data.cPage,
            pageData: that.data.pageData
          });
        }
      }).catch( console.error);
    };
  },
  hTabClick:hTabClick,
  onShareAppMessage: shareMessage
})
