// components/goods-type/goods-type.js
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    c: {
      type: Object,
      value: {code: [], sName: []}
    },
    inclose: {
      type: Boolean,
      value: false,
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    osv:[0,0]
  },

  lifetimes: {
    attached() {
      this.setData({inclose:this.data.c.code.length!=0})
    }
  },
  methods: {
    selclose(){                         //按下载ICON打开选择框
      this.setData({inclose: !this.data.inclose});
    },
    goodssel({ currentTarget:{id,dataset},detail:{value} }) {            //选择商品类型
      let vdSet = {inclose: true};                      //按确定ICON确认选择
      if (!this.data.inclose) {
        vdSet.c = dataset.ca;
        vdSet.value = dataset.ca;
      }
      this.setData(vdSet);
    },
    itemsel({ currentTarget:{id,dataset},detail:{value} }) {
      if (this.data.osv[0] != value[0]) {
        value[1] = 0;
      }
      this.setData({osv: value});
    }
  }
})
