// components/detail-view-edit/detail-view-edit.js
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
    parse_id: {
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
    imageWidths: {}
  },

  /**
   * 组件的方法列表
   */
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
