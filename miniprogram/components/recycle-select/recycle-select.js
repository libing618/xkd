import {getData} from '../../modules/db-get-data'
const {sysinfo} = getApp();
const { transformRpx } = require('../utils/transformRpx');
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  options: {
    addGlobalClass: true
  },
  relations: {
    '../record-view/record-view': {
      type: 'child', // 关联的目标节点应为子节点
    }
  },

  properties: {
    name: {
      type: String,
      value: ''
    },
    value: {
      type: Object,
      value:{ _id: '0', sName: '点此处进行选择' }
    },
    csc: {
      type: String,
      value: 'goods'
    },
    editable: {
      type: Number,
      value: 0
    }
  },

  data: {
    mPage: [],
    pageData: {},
    clickedid: '0'
  },
  lifetimes: {
    attached() {
      if (this.data.editable == 2) { this.selectid() }
    },
    detached() {
      if (this.gData) {
          this.gData.destroy();
          this.gData = null
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
      let spData = {mPage: this.gData.aIndex.indArr}
      addItem.forEach(mId=>{ spData['pageData.'+mId]=this.gData.aData[mId] });
      this.setData({spData})
    },
    selectid() {            //单项选择面板弹出页
      if (this.data.editable){
        this.gData = new getData(this.data.name, this.data.afamily, this.data.filterId)
        this.gData.gStorage().then(()=> {
          if (this.gData.aIndex.indArr.length>0){
            let aData = {};
            this.gData.aIndex.indArr.forEach(mId=>{ aData[mId]=this.gData.aData[mId] })
            this.setData({
              mPage: this.gData.aIndex.indArr,
              pageData: aData
            });
            this.gData.upData().then(topItem=>{
              this._addViewData(topItem)
            })
          }
        });
        this.popModal();
      };
    },

    successid(e) {                  //选定返回
      if (this.data.clickedid!='0'){
        this.setData({
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
