var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior,'wx://form-field'],
  properties: {
    name: {
      type: String,
      value: '',
    },
    value: {
      type: Object,
      value: {},
    },
    csc: {
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

  lifetimes: {
    attached(){
      this.richAnalysis()
    }
  },

  methods: {

    // onInput({currentTarget:{id,dataset},detail:{value}}) {
    //   this.setData({
    //     richText: value,
    //     value: this.data.richStyle+value
    //   })
    // },


  }

})
