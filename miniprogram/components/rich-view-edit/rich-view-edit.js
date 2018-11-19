Component({
  behaviors: ['wx://form-field'],
  properties: {
    value: {
      type: Object,
      value: {},
    },
    name: {
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
    parse_id: '',
    richStyle
  },

  lifetimes: {
    attached(){
      let setRich = {};
      if (this.data.value){
        setRich = this.richAnalysis(rStyle)
      } else {
        setRich = this.richAnalysis(this.data.richStyle)
        setRich.value = {
          t: 're'
          r: '3110D9D9D9ECECEC',
          e: ''
        }
      }
      this.setData(setRich)
    }
  },

  methods: {
    richAnalysis(rStyle) {
      return {
        rich_h: rStyle.substr(0,1),             //字体大小
        rich_s: rStyle.substr(1,1),             //字体强调
        rich_a: rStyle.substr(2,1),             //对齐
        rich_i: rStyle.substr(3,1),             //左空格数
        rich_c: rStyle.substr(4,6),             //字色
        rich_b: rStyle.substr(10)               //背景色
      }
    },

    styleGroup(){
      return this.data.rich_h+this.data.rich_s+this.data.rich_a+this.data.rich_i+this.data.rich_c+this.data.rich_b
    },

    // onInput({currentTarget:{id,dataset},detail:{value}}) {
    //   this.setData({
    //     richText: value,
    //     value: this.data.richStyle+value
    //   })
    // },

    onStyle({currentTarget:{id,dataset},detail:{value}}) {
      let setRich = {};
      setRich[id] = value;
      setRich.value.r = this.styleGroup();
      this.setData(setRich)
    }
  }

})
