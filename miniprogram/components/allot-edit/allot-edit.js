// components/input-scan/edit-scan.js
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

      }
  },

  methods: {
    distry(value){
      let inmcost = Number(value);
      if (isNaN(inmcost)){
        inmcost = 0;      //不能输入非数字
      } else {
        if (inmcost>29) { inmcost=29 };      //不能超过29%
      };
      return  parseFloat(inmcost.toFixed(2));  //不能输入非数字,转换为浮点数保留两位小数
    };

    i_digit: function ({currentTarget:{id,dataset},detail:{value}}) {
      let vdSet = {};
      this.data[id] = distry(value)
      this.setData(vdSet);
    },

    f_allot:function({currentTarget:{id,dataset},detail:{value}}){
      let vdSet = {};

      vdSet[id] = inmcost;
      vdSet.distribution = 87 -inmcost- (this.data.channel ? this.data.channel : 0) - (this.data.extension ? this.data.extension :0);
      this.setData( vdSet );
    }
  }
})
