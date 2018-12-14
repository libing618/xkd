import {getData} from '../../modules/db-get-data'
var app = getApp()
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
    clickedid: '',
    movableViewPosition:{
      x:0,
      y:0
    },
    scrollPosition:{
      everyOptionCell:65,
      top:47,
      scrollTop:0,
      scrollY:true,
      scrollViewHeight:1000,
      scrollViewWidth:375,
      windowViewHeight:1000,
    },
    selectItemInfo:{
      selectIndex: -1,
      selectPosition:0,
    }
  },
  lifetimes: {
    attached() {
      this.gData = new getData(this.data.dataname, this.data.afamily, this.data.filterId)
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
      })
    },

    detached() {
      if (this.gData) {
        this.gData.destroy();
        this.gData = null
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
    let spData = {mPage: this.gData.aIndex.indArr}
    addItem.forEach(mId=>{ spData['pageData.'+mId]=this.gData.aData[mId] });
    this.setData({spData})
  },

  clickeditem({ detail: { itemid } }) {
    if (id) {
      this.setData({ clickedid: itemid })
    }
  },
  bindscroll:function (event) {
      var scrollTop = event.detail.scrollTop;
      this.setData({
          'scrollPosition.scrollTop':scrollTop
      })
  },
  getOptionInfo:function (code) {
      for(var i=0,j=this.data.optionsListData.length;i<j;i++){
          var optionData= this.data.optionsListData[i];
          if(optionData.sDtSecCode == code){
              optionData.selectIndex = i;
              return optionData;
          }
      }
      return {};
  },
  getPositionDomByXY:function (potions) {
      var y = potions.y-this.data.scrollPosition.top+this.data.scrollPosition.scrollTop;
      var optionsListData = this.data.optionsListData;
      var everyOptionCell = this.data.scrollPosition.everyOptionCell;
      for(var i=0,j=optionsListData.length;i<j;i++){
          if(y>=i*everyOptionCell&&y<(i+1)*everyOptionCell){
              return optionsListData[i];
          }
      }
      return optionsListData[0];
  },
  draggleTouch:function (event) {
      var touchType = event.type;
      switch(touchType){
          case "touchstart":
              this.scrollTouchStart(event);
              break;
          case "touchmove":
              this.scrollTouchMove(event);
              break;
          case "touchend":
              this.scrollTouchEnd(event);
              break;
      }
  },
  scrollTouchStart:function (event) {
      // console.log(event);
      var firstTouchPosition = {
          x:event.changedTouches[0].pageX,
          y:event.changedTouches[0].pageY,
      }
      console.log("firstTouchPosition:",firstTouchPosition);
      var doaIndex = this.getPositionDomByXY(firstTouchPosition);
      console.log("doaIndex:",doaIndex);

      //movable-area滑块位置处理
      var movableX = 0;
      var movableY = firstTouchPosition.y-this.data.scrollPosition.top-this.data.scrollPosition.everyOptionCell/2;

      this.setData({
          movableViewPosition:{
              x:movableX,
              y:movableY,
              className:"",
              data:doaIndex
          }
      })

      var secCode = doaIndex.sDtSecCode;
      var secInfo = this.getOptionInfo(secCode);
      secInfo.selectPosition =  event.changedTouches[0].clientY;
      secInfo.selectClass = "dragSelected";

      this.data.optionsListData[secInfo.selectIndex].selectClass = "dragSelected";

      var optionsListData = this.data.optionsListData;

      this.setData({
          'scrollPosition.scrollY':false,
          selectItemInfo:secInfo,
          optionsListData:optionsListData,
          'scrollPosition.selectIndex':secInfo.selectIndex
      })
  },
  scrollTouchMove:function (event) {
      var selectItemInfo = this.data.selectItemInfo;
      var selectPosition = selectItemInfo.selectPosition;
      var moveDistance   = event.changedTouches[0].clientY;
      var everyOptionCell = this.data.scrollPosition.everyOptionCell;
      var optionsListData = this.data.optionsListData;
      var selectIndex = selectItemInfo.selectIndex;

      console.log("event.changedTouches:",event.changedTouches);
      //movable-area滑块位置处理
      var movableX = 0;
      var movableY = event.changedTouches[0].pageY-this.data.scrollPosition.top-this.data.scrollPosition.everyOptionCell/2;


      this.setData({
          movableViewPosition:{
              x:movableX,
              y:movableY,
              className:"",
              data:this.data.movableViewPosition.data
          }
      })

      if(moveDistance - selectPosition > 0 && selectIndex < optionsListData.length - 1){
          if (optionsListData[selectIndex].sDtSecCode == selectItemInfo.sDtSecCode) {
              optionsListData.splice(selectIndex, 1);
              optionsListData.splice(++selectIndex, 0, selectItemInfo);
              selectPosition += everyOptionCell;
          }
      }

      if (moveDistance - selectPosition < 0 && selectIndex > 0) {
          if (optionsListData[selectIndex].sDtSecCode == selectItemInfo.sDtSecCode) {
              optionsListData.splice(selectIndex, 1);
              optionsListData.splice(--selectIndex, 0, selectItemInfo);
              selectPosition -= everyOptionCell;
          }
      }

      this.setData({
          'selectItemInfo.selectPosition': selectPosition,
          'selectItemInfo.selectIndex': selectIndex,
          optionsListData: optionsListData,
      });
  },
  scrollTouchEnd:function (event) {
      console.log(event);
      var optionsListData = this.optionsDataTranlate(this.data.optionsListData,"");

      this.setData({
          optionsListData:optionsListData,
          'scrollPosition.scrollY':true,
          'movableViewPosition.className':"none"
      })
  },
  optionsDataTranlate:function (optionsList,selectClass) {
      for(var i=0,j=optionsList.length;i<j;i++){
          optionsList[i].selectClass = selectClass;
      }
      return optionsList;
  }
}
})
