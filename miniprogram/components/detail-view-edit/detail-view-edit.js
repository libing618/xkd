// components/detail-view-edit/detail-view-edit.js
Component({
  behaviors: ['wx://form-field'],
  properties: {

    p: {
      type: String,
      value: '地址',
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

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
