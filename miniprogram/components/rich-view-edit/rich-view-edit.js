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
    cArr: -1,
    cStyle:[3,1,1,0],
    rich_c: 'D9D9D9',
    rich_b: 'ECECEC',
    styleArr:[
      ['超大字体','大字体','中字体','中中字体','中小字体','小字体','超小字体'],
      ['正常','斜体','加粗','下划线','斜体加粗','加粗下划','斜体下划','斜粗下划'],
      ['左对齐','居中','右对齐'],
      ['不空','空一格','空二格','空三格','空四格','空五格','空六格','空七格','空八格']
    ]
  },
  lifetimes: {
    attached(){
      this.richAnalysis()
    }
  },

  methods: {
    richAnalysis() {
      let setRich = {cStyle:[3,1,1,0]};
      if (this.data.value){
        setRich.cStyle.map((n,i)=> { return Number(this.data.value.r.charAt(i)) });   //字体大小、字体强调、对齐、左空格数
        setRich.rich_c = this.data.value.r.substr(4,6);             //字色
        setRich.rich_b = this.data.value.r.substr(10);               //背景色
      } else {
        setRich.value = {
          r: '3110D9D9D9ECECEC',
          e: ''
        };
        if (this.data.name.substr(0,3)=='adc'){ setRich.value.t='r'+this.data.csc }
        if (setRich.cStyle[2]==1) { setRich.cStyle[3]=0 }
      };
      this.setData(setRich);
    },
    onStyle({currentTarget:{id,dataset},detail:{value}}) {
      let setRich = {}, clickedid = id.split('-');
      switch (clickedid[0]) {
        case 'fm':
          setRich.cArr = this.data.cArr==Number(clickedid[1]) ? -1 : Number(clickedid[1]);
          break;
        case 'fs':
          setRich.cStyle = this.data.cStyle;
          if (this.data.cArr!==-1) {  setRich.cStyle[this.data.cArr] = Number(clickedid[1]) };
          break;
        default:
      }
      setRich['value.r'] = ''+this.data.cArr[0]+this.data.cArr[1]+this.data.cArr[2]+this.data.cArr[3]+this.data.rich_c+this.data.rich_b;
      this.setData(setRich)
    },
    onInput({currentTarget:{id,dataset},detail:{value}}) {
      this.setData({
        "value.e": value
      })
    },


  }

})
