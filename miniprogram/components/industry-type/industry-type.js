const gscode = require('../utils/apdv.js');
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '地址',
    },
    name: String,
    value: String,
    editable: {
      type: Number,
      value: 0
    }
  },
  options: {
    addGlobalClass: true
  },
  data: {
    _id:[],
    inclose: true,
    succId:'1010101',
    aVl:[0,0,0]
  },

  lifetimes: {
    attached() {
      let iSetData = { apdv: {}, drone: {}};
      if (this.data.editable) {
        iSetData.gsroot = ["101","102","103","104","105","106","107","108","109","110","201","202","203","204","301","302","303","304","305","306","307","401","402","403","404","405","406","501","502","503","601","602","603","604","605","606","607","608","609","610","611","612"];
        function nextKeys(nKey){
          let knArr = [],kEach;
          for (let n=0;n<100;n++){
            kEach = ''+(nKey*100+n)
            if (kEach in gscode){
              knArr.push(kEach);
              iSetData.apdv[kEach] = gscode[kEach]
            }
          }
          if (knArr.length>0) {iSetData.drone['' + nKey] = knArr}
          return knArr.length
        }
        iSetData.gsroot.forEach(k2 => {
          if (nextKeys(k2)) {
            iSetData.drone['' + k2].forEach(k3 => {
              if (nextKeys(k3)) {
                iSetData.drone['' + k3].forEach(k4 => { nextKeys(k4); })
              };
            })
          };
          iSetData.apdv[k2] = gscode[k2]
        })
        if (this.data.value) {
          iSetData._id = this.data.value.split(',');
        }
      } else {
        iSetData._id = this.data.value.split(',')
        iSetData._id.forEach(ikv => { iSetData.apdv[ikv] = gscode[ikv] });
      }
      this.setData(iSetData)
    }
  },
  methods: {
    selclose(){                         //按下载ICON打开选择框
      this.setData({inclose: !this.data.inclose});
    },
    industrysel({ currentTarget:{id,dataset},detail:{value} }) {                         //选择行业类型
      if (!this.data.inclose && this.data.editable) {
        this.data._id.push(dataset.ca);
        this.setData({
          value: this.data._id.join(','),
          _id: this.data._id
        });
      }

    },
    itemsel({ currentTarget:{id,dataset},detail:{value} }) {
      let succId = this.data.gsroot[value[0]];
      if (this.data.aVl[0] == value[0]) {
        if (this.data.aVl[1] != value[1]) {
          value[2] = 0;
        }
      } else { value[1] = 0; value[2] = 0; }
      if (this.data.drone[succId]) {
        succId = this.data.drone[succId][value[1]];
        if (this.data.drone[succId]) {
          succId = this.data.drone[succId][value[2]];
        }
      }
      this.setData({
        aVl: value,
        succId: succId
      });
    },
    selectdel({ currentTarget:{id,dataset},detail:{value} }) {      //按显示类型名称进行删除
      if (his.data.editable) {
        let i = Number(dataset.id);
        this.data._id.splice(i, 1);
        this.setData({
          _id: this.data._id,
          value: his.data._id.join(',')
        });
      };
    }
  }
})
