/* eslint complexity: ["error", {"max": 50}] */
/* eslint-disable indent */
const DEFAULT_SHOW_SCREENS = 4
const DEFAULT_MAX_SHOW_SCREENS = 8
const RECT_SIZE = 200
const DEBUG = false
const BOUNDARY_INTERVAL = 400 // 到达边界多少距离的时候, 直接改为边界位置
const THROTTLE_DISTANCE = 2000 // 超过这个的滚动距离必须要抛弃掉
const SETDATA_INTERVAL_BOUNDARY = 300 // 大于300ms则减少MAX_SHOW_SCREEN的值
const SETDATA_INTERVAL_BOUNDARY_1 = 500
const transformRpx = require('../utils/transformRpx.js').transformRpx
var app = getApp()
let SHOW_SCREENS = app.sysinfo.itemtotal
let MAX_SHOW_SCREENS = SHOW_SCREENS+1 //最多显示条数
const { getData } = require('../../model/db-get-data');
Component({
  options: {
    addGlobalClass: true,
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  relations: {
    '../recycle-item/recycle-item': {
      type: 'child', // 关联的目标节点应为子节点
      linked(target) {
        // 检查第一个的尺寸就好了吧
        if (!this._hasCheckSize) {
          this._hasCheckSize = true
          const size = this.boundingClientRect(this._pos.beginIndex)
          if (!size) {
            return
          }
          setTimeout(() => {
            try {
              target.createSelectorQuery().select('.wx-recycle-item').boundingClientRect((rect) => {
                if (rect && (rect.width !== size.width || rect.height !== size.height)) {
                  // eslint-disable-next-line no-console
                  console.warn('[recycle-view] the size in <recycle-item> is not the same with param ' +
                    `itemSize, expect {width: ${rect.width}, height: ${rect.height}} but got ` +
                    `{width: ${size.width}, height: ${size.height}}`)
                }
              }).exec()
            } catch (e) {
              // do nothing
            }
          }, 10)
        }
      }
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    debug: {
      type: Boolean,
      value: false
    },
    batch: {
      type: Boolean,
      value: false,
      observer: '_recycleInnerBatchDataChanged'
    },
    scrollTop: {
      type: Number,
      value: 0,
      public: true,
      observer: '_scrollTopChanged',
      observeAssignments: true
    },
    height: {
      type: Number,
      value: app.sysinfo.windowHeight,
      public: true,
      observer: '_heightChanged'
    },
    width: {
      type: Number,
      value: app.sysinfo.windowWidth,
      public: true,
      observer: '_widthChanged'
    },
    // 距顶部/左边多远时，触发bindscrolltoupper
    upperThreshold: {
      type: Number,
      value: 50,
      public: true,
    },
    // 距底部/右边多远时，触发bindscrolltolower
    lowerThreshold: {
      type: Number,
      value: 50,
      public: true,
    },
    scrollToIndex: {
      type: Number,
      public: true,
      value: 0,
      observer: '_scrollToIndexChanged',
      observeAssignments: true
    },
    scrollWithAnimation: {
      type: Boolean,
      public: true,
      value: false
    },
    enableBackToTop: {
      type: Boolean,
      public: true,
      value: false
    },
    // 是否节流，默认是
    throttle: {
      type: Boolean,
      public: true,
      value: true
    },
    placeholderImage: {
      type: String,
      public: true,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    innerBeforeHeight: 0,
    innerAfterHeight: 0,
    innerScrollTop: 0,
    innerScrollIntoView: '',
    placeholderImageStr: ''

  },
  attached() {
    if (this.data.placeholderImage) {
      this.setData({
        placeholderImageStr: transformRpx(this.data.placeholderImage, true)
      })
    }
  },
  ready() {
    this._initPosition(() => {
      this._isReady = true // DOM结构ready了
      // 有一个更新的timer在了
      if (this._updateTimerId) return

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
    this.page = null
    // 销毁对应的RecycleContext
    if (this.context) {
      this.context.destroy()
      this.context = null
    }
    if (this.timerId) clearTimeout(this.timerId)
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
      return this.page && this.context && this.context.isDataReady
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
      const scrollDistance = Math.abs(scrollTop - this._lastScrollTop)

      this._lastScrollTop = scrollTop
      this._lastRenderTime = Date.now()
      // 当scroll触发时间大于200ms且大于滚动距离，下一个滚动距离会极高，容易出现白屏，因此需要马上渲染
      const isNextScrollExpose = false
      // const mustRender = force || isMatchBoundary || isNextScrollExpose
      const mustRender = force || isNextScrollExpose
      this._log('scrollTop', e.detail.scrollTop, isMatchBoundary, mustRender)
      if (!mustRender) {
        if ((Math.abs(scrollTop - pos.top) < pos.height * 1.5)) {
          this._log('【not exceed height')
          return
        }
        if ((scrollDistance > THROTTLE_DISTANCE || this._isScrollRendering)) {
          this._throttle = true
          this._log('【throttle because', scrollDistance, this._throttle)
          return
        }
      }
      if (force && this.timerId) {
        clearTimeout(this.timerId)
      }
      SHOW_SCREENS = DEFAULT_SHOW_SCREENS // 固定4屏幕

      this._calcViewportIndexes(scrollLeft, scrollTop,
          (beginIndex, endIndex) => {
        // 渲染的数据不变
        if (!force && pos.beginIndex === beginIndex && pos.endIndex === endIndex) {
          return
        }
        // 如果这次渲染的范围比上一次的范围小，则忽略
        that._throttle = false
        pos.left = scrollLeft
        pos.top = scrollTop
        pos.beginIndex = beginIndex
        pos.endIndex = endIndex
        pos.ignoreBeginIndex = pos.ignoreEndIndex = -1
        pos.lastSetDataTime = Date.now() // 用于节流时间判断
        that._isScrollRendering = true
        const st = Date.now()
        that.page._recycleViewportChange({
          detail: {
            data: that._pos,
            id: that.id
          }
        }, () => {
          that._isScrollRendering = false
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
          if (e.detail.cb) {
            e.detail.cb()
          }
        })
      })
    },
    // 计算在视窗内渲染的数据
    _calcViewportIndexes(left, top, cb) {
      const that = this
      // const st = +new Date
      this._getBeforeSlotHeight(() => {
        const {
          beginIndex, endIndex
        } = that.__calcViewportIndexes(left, top)
        if (cb) {
          cb(beginIndex, endIndex)
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
    __calcViewportIndexes(left, top) {
      if (!this.sizeArray.length) return {}
      const pos = this._pos
      if (typeof left === 'undefined') {
        (left = pos.left)
      }
      if (typeof top === 'undefined') {
        (top = pos.top)
      }
      // top = Math.max(top, this.data.beforeSlotHeight)
      const beforeSlotHeight = this.data.beforeSlotHeight || 0
      // 和direction无关了
      const indexObj = this._getIndexes()
      const beginIndex = indexObj.beginIndex
      let endIndex = indexObj.endIndex
      if (endIndex >= this.sizeArray.length) {
        endIndex = this.sizeArray.length - 1
      }
      // 校验一下beginIndex和endIndex的有效性,
      if (!this._isIndexValid(beginIndex, endIndex)) {
        return {
          beginIndex: -1,
          endIndex: -1
        }
      }
      return {
        beginIndex,
        endIndex
      }
    },

    setList(key, newList) {
      this._currentSetDataKey = key
      this._currentSetDataList = newList
    },
    setPage(page) {
      this.page = page
    },
    forceUpdate(cb, reInit) {
      if (!this._isReady) {
        if (this._updateTimerId) {
          // 合并多次的forceUpdate
          clearTimeout(this._updateTimerId)
        }
        this._updateTimerId = setTimeout(() => {
          this.forceUpdate(cb, reInit)
        }, 10)
        return
      }
      this._updateTimerId = null
      const that = this
      if (reInit) {
        this.reRender(() => {
          that._scrollViewDidScroll({
            detail: {
              scrollLeft: that._pos.left,
              scrollTop: that.currentScrollTop || that.data.scrollTop || 0,
              ignoreScroll: true,
              cb
            }
          }, true)
        })
      } else {
        this._scrollViewDidScroll({
          detail: {
            scrollLeft: that._pos.left,
            scrollTop: that.currentScrollTop || that.data.scrollTop || 0,
            ignoreScroll: true,
            cb
          }
        }, true)
      }
    },
    _initPosition(cb) {
      const that = this
      that._pos = {
        left: that.data.scrollLeft || 0,
        top: that.data.scrollTop || 0,
        width: this.data.width,
        height: Math.max(500, this.data.height), // 一个屏幕的高度
        direction: 0
      }
      this.reRender(cb)
    },
    _widthChanged(newVal) {
      if (!this._isReady) return newVal
      this._pos.width = newVal
      this.forceUpdate()
      return newVal
    },
    _heightChanged(newVal) {
      if (!this._isReady) return newVal
      this._pos.height = Math.max(500, newVal)
      this.forceUpdate()
      return newVal
    },
    reRender(cb) {
      let beforeSlotHeight
      let afterSlotHeight
      const that = this
      // const reRenderStart = Date.now()
      function newCb() {
        if (that._lastBeforeSlotHeight !== beforeSlotHeight ||
            that._lastAfterSlotHeight !== afterSlotHeight) {
          that.setData({
            hasBeforeSlotHeight: true,
            hasAfterSlotHeight: true,
            beforeSlotHeight,
            afterSlotHeight
          })
        }
        that._lastBeforeSlotHeight = beforeSlotHeight
        that._lastAfterSlotHeight = afterSlotHeight
        // console.log('_getBeforeSlotHeight use time', Date.now() - reRenderStart)
        if (cb) {
          cb()
        }
      }
      // 重新渲染事件发生
      let beforeReady = false
      let afterReady = false
      this.createSelectorQuery().select('.slot-before').boundingClientRect((rect) => {
        beforeSlotHeight = rect.height
        beforeReady = true
        if (afterReady) {
          if (newCb) { newCb() }
        }
      }).exec()
      this.createSelectorQuery().select('.slot-after').boundingClientRect((rect) => {
        afterSlotHeight = rect.height
        afterReady = true
        if (beforeReady) {
          if (newCb) { newCb() }
        }
      }).exec()
    },
    _setInnerBeforeAndAfterHeight(obj) {
      if (typeof obj.beforeHeight !== 'undefined') {
        this._tmpBeforeHeight = obj.beforeHeight
      }
      if (obj.afterHeight) {
        this._tmpAfterHeight = obj.afterHeight
      }
    },
    _recycleInnerBatchDataChanged() {
      if (typeof this._tmpBeforeHeight !== 'undefined') {
        const setObj = {
          innerBeforeHeight: this._tmpBeforeHeight || 0,
          innerAfterHeight: this._tmpAfterHeight || 0
        }
        if (typeof this._tmpInnerScrollTop !== 'undefined') {
          setObj.innerScrollTop = this._tmpInnerScrollTop
        }
        const pageObj = {}
        if (typeof this._currentSetDataKey !== 'undefined') {
          pageObj[this._currentSetDataKey] = this._currentSetDataList
          this.page.setData(pageObj)
        }
        const saveScrollWithAnimation = this.data.scrollWithAnimation
        this.setData(setObj, () => {
          this.setData({
            scrollWithAnimation: saveScrollWithAnimation
          })
        })
        delete this._currentSetDataKey
        delete this._currentSetDataList
        this._tmpBeforeHeight = undefined
        this._tmpAfterHeight = undefined
        this._tmpInnerScrollTop = undefined
      }
    },
    _scrollTopChanged(newVal, oldVal) {
      // if (newVal === oldVal && newVal === 0) return
      if (!this._isInitScrollTop && newVal === 0) {
        this._isInitScrollTop = true
        return newVal
      }
      this.currentScrollTop = newVal
      if (!this._isReady) {
        if (this._scrollTopTimerId) {
          clearTimeout(this._scrollTopTimerId)
        }
        this._scrollTopTimerId = setTimeout(() => {
          this._scrollTopChanged(newVal, oldVal)
        }, 10)
        return newVal
      }
      this._isInitScrollTop = true
      this._scrollTopTimerId = null
      // this._lastScrollTop = oldVal
      if (typeof this._lastScrollTop === 'undefined') {
        this._lastScrollTop = this.data.scrollTop
      }
      // 滑动距离小于一个屏幕的高度, 直接setData
      if (Math.abs(newVal - this._lastScrollTop) < this._pos.height) {
        this.setData({
          innerScrollTop: newVal
        })
        return newVal
      }
      if (this.data.scrollWithAnimation) {
        // 先setData把目标位置的数据补齐
        this._scrollViewDidScroll({
          detail: {
            scrollLeft: this._pos.scrollLeft,
            scrollTop: newVal,
            ignoreScroll: true
          }
        }, true)
        this._isScrollingWithAnimation = true
        this.setData({
          innerScrollTop: newVal
        })
        // this._innerScrollChangeWithAnimation(newVal, newVal - this._lastScrollTop > 0)
      } else if (!this._isScrollTopChanged) {
        // 首次的值需要延后一点执行才能生效
        setTimeout(() => {
          this._isScrollTopChanged = true
          this.setData({
            innerScrollTop: newVal
          })
        }, 10)
      } else {
        this.setData({
          innerScrollTop: newVal
        })
      }
      return newVal
    },
    _scrollToIndexChanged(newVal, oldVal) {
      // if (newVal === oldVal && newVal === 0) return
      // 首次滚动到0的不执行
      if (!this._isInitScrollToIndex && newVal === 0) {
        this._isInitScrollToIndex = true
        return newVal
      }
      if (!this._isReady) {
        if (this._scrollToIndexTimerId) {
          clearTimeout(this._scrollToIndexTimerId)
        }
        this._scrollToIndexTimerId = setTimeout(() => {
          this._scrollToIndexChanged(newVal, oldVal)
        }, 10)
        return newVal
      }
      this._isInitScrollToIndex = true
      this._scrollToIndexTimerId = null
      if (typeof this._lastScrollTop === 'undefined') {
        this._lastScrollTop = this.data.scrollTop
      }
      const rect = this.boundingClientRect(newVal)
      if (!rect) return newVal
        // console.log('rect top', rect, this.data.beforeSlotHeight)
      const calScrollTop = rect.top + (this.data.beforeSlotHeight || 0)
      this.currentScrollTop = calScrollTop
      if (Math.abs(calScrollTop - this._lastScrollTop) < this._pos.height) {
        this.setData({
          innerScrollTop: calScrollTop
        })
        return newVal
      }
      if (this.data.scrollWithAnimation) {
        // 有动画效果的话, 需要和scrollTopChange类似的处理方式
        // 获取newVal对应的id的clientRect
        this._scrollViewDidScroll({
          detail: {
            scrollLeft: this._pos.scrollLeft,
            scrollTop: calScrollTop,
            ignoreScroll: true
          }
        }, true)
        this._isScrollingWithAnimation = true
        this.setData({
          innerScrollTop: calScrollTop
        })
      } else if (!this._isScrollToIndexChanged) {
        setTimeout(() => {
          this._isScrollToIndexChanged = true
          this.setData({
            innerScrollTop: calScrollTop
          })
        }, 10)
      } else {
        this.setData({
          innerScrollTop: calScrollTop
        })
      }
      return newVal
    },
    // 提供给开发者使用的接口
    clickeditem({detail:{id}}) {
      if (id) {
        this.setData({clickedid:id})
      }
    }
  }
})
