/* eslint complexity: ["error", {"max": 50}] */
/* eslint-disable indent */
const DEFAULT_SHOW_SCREENS = 4
const DEFAULT_MAX_SHOW_SCREENS = 8
const RECT_SIZE = 200
const BOUNDARY_INTERVAL = 400 // 到达边界多少距离的时候, 直接改为边界位置
const SETDATA_INTERVAL_BOUNDARY = 300 // 大于300ms则减少MAX_SHOW_SCREEN的值
const SETDATA_INTERVAL_BOUNDARY_1 = 500
var app = getApp()
let SHOW_SCREENS = app.sysinfo.itemtotal
let MAX_SHOW_SCREENS = SHOW_SCREENS+1 //最多显示条数
const { getData } = require('../../model/db-get-data');
const { transformRpx } = require('../utils/transformRpx');
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  relations: {
    '../recycle-item/recycle-item': {
      type: 'child', // 关联的目标节点应为子节点
      linked(target) {
      }
    }
  },

  properties: {
    scrollTop: {
      type: Number,
      value: 0,
      observer: '_scrollTopChanged',
    },
    height: {
      type: Number,
      value: app.sysinfo.windowHeight,
    },
    width: {
      type: Number,
      value: app.sysinfo.windowWidth,
      observer: '_widthChanged'
    },
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
      value: 0,
    },
    filterId: {
      type: String,
      value: ''
    }
  },

  data: {
    pNo '',
    mPage: [],
    pageData: {},
    innerScrollIntoView: ''
  },
  attached() {
    this.gData = new getData(this.data.dataname,this.data.afamily,this.data.filterId)
    if (this.gData.pageData) {
      this.setData({
        height: transformRpx(this.data.showitems*160 , true)
      })
    }
  },
  ready() {
    that._pos = {
      left: that.data.scrollLeft || 0,
      top: that.data.scrollTop || 0,
      width: this.data.width,
      height: Math.max(500, this.data.height), // 一个屏幕的高度
      direction: 0
    }
      this._isReady = true // DOM结构ready了

      this._scrollViewDidScroll({
        detail: {
          scrollLeft: this._pos.left,
          scrollTop: this._pos.top,
          ignoreScroll: true
        }
      }, true)
    })
    this._totalTime = this._totalCount = 0
  },

  detached() {
    if (this.gData) {
      this.gData.destroy()
      this.gData = null
    };
  },
  /**
   * 组件的方法列表
   */
  methods: {

    _scrollToUpper(e) {
      this.triggerEvent('scrolltoupper', e.detail)
    },
    _scrollToLower(e) {
      this.triggerEvent('scrolltolower', e.detail)
    },
    _beginToScroll() {
      this._lastRenderTime = Date.now()
      if (!this._lastScrollTop) {
        this._lastScrollTop = this._pos && (this._pos.top || 0)
      }
    },

    // 判断RecycleContext是否Ready
    _isValid() {
      return this.data.mPage && this.gData
    },
    // eslint-disable-next-line no-complexity
    _scrollViewDidScroll(e, force) {
      // 如果RecycleContext还没有初始化, 不做任何事情
      if (!this._isValid()) {
        return
      }
      // 监测白屏时间
      if (!e.detail.ignoreScroll) {
        this.triggerEvent('scroll', e.detail)
      }
      this.currentScrollTop = e.detail.scrollTop
      // 高度为0的情况, 不做任何渲染逻辑
      if (!this._pos.height || !this.sizeArray.length) {
        // 没有任何数据的情况下, 直接清理所有的状态
        this._clearList(e.detail.cb)
        return
      }

      // 在scrollWithAnimation动画最后会触发一次scroll事件, 这次scroll事件必须要被忽略
      if (this._isScrollingWithAnimation) {
        this._isScrollingWithAnimation = false
        return
      }
      const pos = this._pos
      const that = this
      const scrollLeft = e.detail.scrollLeft
      const scrollTop = e.detail.scrollTop
      let isMatchBoundary = false
      if (scrollTop - BOUNDARY_INTERVAL < 0) {
        // scrollTop = 0
        isMatchBoundary = true
      }

      const usetime = Date.now() - this._lastRenderTime


      this._lastScrollTop = scrollTop
      this._lastRenderTime = Date.now()
      // 当scroll触发时间大于200ms且大于滚动距离，下一个滚动距离会极高，容易出现白屏，因此需要马上渲染
      const isNextScrollExpose = false
      // const mustRender = force || isMatchBoundary || isNextScrollExpose
      const mustRender = force || isNextScrollExpose

      if (!mustRender) {
        if ((Math.abs(scrollTop - pos.top) < pos.height * 1.5)) {
          this._log('【not exceed height')
          return
        }

      }

      SHOW_SCREENS = DEFAULT_SHOW_SCREENS // 固定4屏幕


        // 渲染的数据不变
        if (!force && pos.beginIndex === beginIndex && pos.endIndex === endIndex) {
          return
        }
        // 如果这次渲染的范围比上一次的范围小，则忽略

        pos.left = scrollLeft
        pos.top = scrollTop
        pos.beginIndex = beginIndex
        pos.endIndex = endIndex
        pos.ignoreBeginIndex = pos.ignoreEndIndex = -1
        pos.lastSetDataTime = Date.now() // 用于节流时间判断

        const st = Date.now()
        that.page._recycleViewportChange({
          detail: {
            data: that._pos,
            id: that.id
          }
        }, () => {

          if (that._totalCount < 5) {
            that._totalCount++
            that._totalTime += (Date.now() - st)
          } else {
            that._totalCount = 1
            that._totalTime = (Date.now() - st)
          }
          pos.lastSetDataTime = 0 // 用于节流时间判断
          // if (that._totalCount / that._totalTime <= SETDATA_INTERVAL_BOUNDARY) {
          //   MAX_SHOW_SCREENS = DEFAULT_MAX_SHOW_SCREENS + 1 // 多渲染2个屏幕的内容
          if (that._totalTime / that._totalCount > SETDATA_INTERVAL_BOUNDARY) {
            MAX_SHOW_SCREENS = DEFAULT_MAX_SHOW_SCREENS - 1
          } else if (that._totalTime / that._totalCount > SETDATA_INTERVAL_BOUNDARY_1) {
            MAX_SHOW_SCREENS = DEFAULT_MAX_SHOW_SCREENS - 2
          }


      })
    },

    _getIndexes() {
      if () {
        return {
          beginIndex: -1,
          endIndex: -1
        }
      }
      const rectEachLine = Math.floor(this.data.width / RECT_SIZE)
      let beginIndex
      let endIndex
      const sizeMap = this.sizeMap
      for (let i = startLine; i <= endLine; i++) {
        for (let col = 0; col < rectEachLine; col++) {
          const key = `${i}.${col}`
          // 找到sizeMap里面的最小值和最大值即可
          if (!sizeMap[key]) continue
          for (let j = 0; j < sizeMap[key].length; j++) {
            if (typeof beginIndex === 'undefined') {
              beginIndex = endIndex = sizeMap[key][j]
              continue
            }
            if (beginIndex > sizeMap[key][j]) {
              beginIndex = sizeMap[key][j]
            } else if (endIndex < sizeMap[key][j]) {
              endIndex = sizeMap[key][j]
            }
          }
        }
      }
      return {
        beginIndex,
        endIndex
      }
    },
    _isIndexValid(beginIndex, endIndex) {
      if (typeof beginIndex === 'undefined' || beginIndex === -1 ||
        typeof endIndex === 'undefined' || endIndex === -1 || endIndex >= this.sizeArray.length) {
        return false
      }
      return true
    },

    setList(key, newList) {
      this._currentSetDataKey = key
      this._currentSetDataList = newList
    },

    _widthChanged(newVal) {                //横屏时宽度有变化
      if (!this._isReady) return newVal
      this._pos.width = newVal;
      this._pos.height
      return newVal
    },

    clickeditem({detail:{itemid}}) {
      if (id) {
        this.setData({clickedid:itemid})
      }
    }
  }
})
