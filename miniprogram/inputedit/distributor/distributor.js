//分销招募
const AV = require('../../libs/leancloud-storage.js');
const { checkRols } =  require('../../model/initForm');;
const {hTabClick} = require('../../libs/util.js');
const {f_modalRecordView} = require('../../model/controlModal');
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
      {gname: "agreeState", p:'合同状态',inclose:false,t:"listsel", aList:['签约',' 解约']},
      {gname: "shopName", p: '店铺名称', t: "h2" },
      {gname: "shopLogo", p: '店铺标记', t: "thumb" },
      {gname: "address", p: '店铺详细地址', t:"ed"}
    ]
  },

  onLoad:function(options){
    var that = this;
    if (checkRols(9,app.roleData.user)) {
      new AV.Query('distributor').equalTo('unitId',app.roleData.uUnit.objectId).ascending('updatedAt').find().then(channel=>{
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
  f_modalRecordView:f_modalRecordView
})
