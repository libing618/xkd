var app = getApp()
let SHOW_SCREENS = app.sysinfo.itemtotal //最多显示条数
const getData = require('../../model/db-get-data');
const { transformRpx } = require('../utils/transformRpx');
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  options: {
    addGlobalClass: true
  },
  relations: {
    '../recycle-item/recycle-item': {
      type: 'child', // 关联的目标节点应为子节点
    }
  },

  properties: {
    showitems: {           //本块显示内容条数
      type: Number,
      value: 4,
    },
    c: {
      type: Object,
      value:{ _id: '0', sName: '点此处进行选择' }
    }
    name: {
      type: String,
      value: 'goods',
    },
    afamily: {           //数据表的类型
      type: Number,
    //  value: 0,
    },
    filterId: {
      type: String,
      value: 'updatedAtdesc'
    }
  },

  data: {
    pNo: '',
    mPage: [],
    pageData: {},
    height: app.sysinfo.windowHeight,
    clickedid: '0'
  },
  lifetimes: {
    attached() {
      if (this.data.c._id == '0') { this.selectid() }
    }
    detached() {
      if (this.gData) {
        this.gData.closeData().then(() => {
          this.gData.destroy();
          this.gData = null
        })
      };
    }
  },

  methods: {

    scrollToUpper(e) {
      this.gData.upData().then(topItem=>{
        this._addViewData(topItem)
      })
    },
    scrollToLower(e) {
      this.gData.downData().then(topItem=>{
        this._addViewData(topItem)
      })
    },

    _isValid() {
      return this.data.pageData && this.gData
    },

    _addViewData(addItem) {
      if (!this._isValid()) {    // 如果还没有初始化, 不做任何事情
        return
      }
      let spData = {mPage: this.gData.mData.indArr}
      addItem.forEach(mId=>{ spData['pageData.'+mId]=this.gData.aData[mId] });
      this.setData({spData})
    },
    selectid() {            //单项选择面板弹出页
      this.setData({
        height: transformRpx(Math.max(this.data.showitems, SHOW_SCREENS)* 160, true)
      });
      this.gData = new getData(this.data.name, this.data.afamily, this.data.filterId)
      this.gData.gStorage().then(()=> {
        if (this.gData.mData.indArr.length>0){
          let aData = {};
          this.gData.mData.indArr.forEach(mId=>{ aData[mId]=this.gData.aData[mId] })
          this.setData({
            mPage: this.gData.mData.indArr,
            pageData: aData
          });
          this.gData.upData().then(topItem=>{
            this._addViewData(topItem)
          })
        }
      });
      this.popModal();
    },

    successid(e) {                  //选定返回
      if (this.data.clickedid!='0'){
        this.setData({
          c: {_id:this.gData.aData[this.data.clickedid]._id,sName:this.gData.aData[this.data.clickedid].uName},
          value: {_id:this.gData.aData[this.data.clickedid]._id,sName:this.gData.aData[this.data.clickedid].uName}
        });
        this.downModal()
      }
    },

    clickeditem({detail:{itemid}}) {                         //选择ID
      if (id) {
        this.setData({clickedid:itemid})
      }
    }
  }
})
