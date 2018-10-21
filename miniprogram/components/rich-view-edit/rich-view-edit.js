Component({
  behaviors: ['wx://form-field'],
  properties: {
    item: {
      type: Object,
      value: {},
    },
    images: {
      type: Array,
      value: [],
    },
    richStyle: {
      type: String,
      value: '',
    },
    editen: {
      type: Boolean,
      value: false,
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    parse_id: {},
    imageWidths: {}
  },

  /**
   * 组件自定义格式数组rich：大小h1~h6,强调s0~s7,对齐a0~a2,缩进i,颜色c#,背景b
   */
  lifetimes: {
    attached():{
      this.setData({
        rich_h: this.data.richStrle.substr(0,1),
        rich_s: this.data.richStrle.substr(1,1),
        rich_a: this.data.richStrle.substr(2,1),
        rich_i: this.data.richStrle.substr(3,1),
        rich_c: this.data.richStrle.substr(4,6),
        rich_b: this.data.richStrle.substr(10)
      })
    }
  }
  methods: {
    onImgTap(e) {
      global.richParses[this.data.parse_id].onImgTap(e)
    },

    onLinkTap(e) {
      global.richParses[this.data.parse_id].onLinkTap(e)
    },

    onImgLoad(e) {
      this.data.imageWidths[e.target.dataset.src] = e.detail.width + 'px'
      this.setData({ imageWidths: this.data.imageWidths })
    }
  }

})
