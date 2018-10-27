Component({
  behaviors: ['wx://form-field'],
  properties: {
    item: {
      type: Object,
      value: {},
    },
    value: {
      type: String,
      value: '',
    },
    richStyle: {
      type: String,
      value: '',
    },
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    parse_id: {},
    imageWidths: {}
  },

  lifetimes: {
    attached(){
      if (this.data.value){
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
  },

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
