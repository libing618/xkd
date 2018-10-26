import {getData} from '../../model/db-get-data'
var app = getApp()
let SHOW_SCREENS = app.sysinfo.itemtotal //最多显示条数
const { transformRpx } = require('../utils/transformRpx');
Component({
  options: {
    addGlobalClass: true
  },
  relations: {
    '../record-view/record-view': {
      type: 'child', // 关联的目标节点应为子节点
    }
  },

  properties: {
    showitems: {           //本块显示内容条数
      type: Number,
      value: 4,
    },
    dataname: {
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
    clickedid: ''
  },
  lifetimes: {
    attached() {
      this.setData({
        height: transformRpx(Math.max(this.data.showitems, SHOW_SCREENS)* 160, true)
      });
      this.gData = new getData(this.data.dataname, this.data.afamily, this.data.filterId)
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
      })
    },

    detached() {
      if (this.gData) {
        this.gData.closeData().then(() => {
          this.gData.destroy();
          this.gData = null
        })
      };
    }
  },

/**
 * 组件的方法列表
 */
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

  clickeditem({ detail: { itemid } }) {
    if (id) {
      this.setData({ clickedid: itemid })
    }
  }
}
})
