// components/input-array/input-array.js
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    c: {
      type: Array,
      value: []
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
    inclouse: true,
    iValue: '输入内容'
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
    inputarr({ currentTarget:{id,dataset},detail:{value} }) {
      this.setData({iValue: value});
    },
    seccessarr({ currentTarget:{id,dataset},detail:{value} }) {
      this.data.c.push(dataset.add);
      this.setData({
        c: this.data.c,
        value: this.data.c,
        iValue: '输入内容'
      });
    },
    arrdel({ currentTarget:{id,dataset},detail:{value} }) {                //按显示名称进行删除
      let i = Number(id);
      this.data.c.splice(i, 1);
      this.setData({
        c: this.data.c,
        value: this.data.c
      })
    },
  }
})
