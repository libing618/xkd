// components/input-scan/edit-scan.js
var app = getApp()
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: 'goods',
    },
    name: String,
    value: {
      type: String,
      value: '0'
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {

  },

  lifetimes:{
    attached: function(){

      }
  },

  methods: {
    inscan(){
      let that = this;
      wx.scanCode({
        success: (res) => {
          that.setData({value: res.result});
        }
      })
    },
  }
})
