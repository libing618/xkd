Component({
  behaviors: ['wx://form-field'],
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
data:{
  inclose: false
}
  lifetimes: {
    attached(){
      this.richAnalysis()
    }
  },

  methods: {
    richAnalysis() {
      let setRich = {},rStyle;
      if (this.data.value){
        rStyle = this.data.value.r
      } else {
        rStyle = '3110D9D9D9ECECEC'
        setRich.value = {
          t: 're',
          r: '3110D9D9D9ECECEC',
          e: ''
        }
      };
      setRich.rich_h = rStyle.charAt(0);             //字体大小
      setRich.rich_s = rStyle.charAt(1);             //字体强调
      setRich.rich_a = rStyle.charAt(2);             //对齐
      setRich.rich_i = rStyle.charAt(3);             //左空格数
      setRich.rich_c = rStyle.substr(4,6);             //字色
      setRich.rich_b = rStyle.substr(10);               //背景色
      this.setData(setRich);
    },
    onStyle({currentTarget:{id,dataset},detail:{value}}) {
      let setRich = {};
      setRich[id] = value;
      this.data[id] = value;
      setRich.value.r = this.data.rich_h+this.data.rich_s+this.data.rich_a+this.data.rich_i+this.data.rich_c+this.data.rich_b;
      this.setData(setRich)
    },
    onInput({currentTarget:{id,dataset},detail:{value}}) {
      this.setData({
        richText: value,
        value: this.data.richStyle+value
      })
    },


  }

})
