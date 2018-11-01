// 渠道分成编辑组件
var app = getApp()
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: 'goods',
    },
    name: {
      type: String,
      value: '0'
    },
    c: {
      type: String,
      value: '0'
    }
  },
  options: {
    addGlobalClass: true
  },

  data: {
    distribution: 0
  },

  lifetimes:{
    attached: function(){
      if (!this.data.c){ this.data.c = {channel:0,extension:0,_id:87} }
      this.setData({
        c: this.data.c,
        distribution: this.data.c.channel+this.data.c.extension+13
      })
    }
  },

  methods: {
    i_digit: function ({currentTarget:{id,dataset},detail:{value}}) {
      let inmcost = Number(value);
      if (isNaN(inmcost)){
        inmcost = 0;      //不能输入非数字
      } else {
        if (inmcost>29) { inmcost=29 };      //不能超过29%
      };
      this.data.c[id] = parseFloat(inmcost.toFixed(2));  //不能输入非数字,转换为浮点数保留两位小数
      this.data.c._id = 87 - this.data.c.channel- this.data.c.extension
      this.setData({
        c: this.data.c,
        distribution: this.data.c.channel+this.data.c.extension+13
      });
    }
  }
})
