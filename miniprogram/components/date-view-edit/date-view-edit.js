import {formatTime} from '../../modules/util.js';
const today = new Date()
const week = [
  { value: '周日', classed: 'weekend' },
  { value: '周一', classed: '' },
  { value: '周二', classed: '' },
  { value: '周三', classed: '' },
  { value: '周四', classed: '' },
  { value: '周五', classed: '' },
  { value: '周六', classed: 'weekend' }
];
Component({
  behaviors: ['wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '日期',
    },
    enableTime: {
      type: Boolean,
      value: false,
    },
    value: {
      type: String,
      value: '',
      observer: 'init'
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
    inclose: false,
    currYear:2018,
    currMonth:12,
    emptyGrids:[],
    days:[],
    selected:[],
    time:'',
    dayInWeek:'',
    dayInMonth:'',
    week: week
  },

  lifetimes: {
    ready: function() {
      this.init()
    }
  },
  methods: {
    selclose(){
      this.setData({inclose: !this.data.inclose});
    },
    inputdate({ currentTarget:{id,dataset},detail:{value} }) {
      this.setData({                       //日期选择
        value: new Date(value)
      });
    },

    isDate(date) {
      if (date == null || date == undefined) {
        return false
      }
      return new Date(date).getDate() == date.substring(date.length - 2)
    },

    isLeapYear(y) {
      return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0)
    },

    isToday(y, m, d) {
      return y == today.getFullYear() && m == today.getMonth() + 1 && d == today.getDate()
    },

    isWeekend(emptyGrids, d) {
      return (emptyGrids + d) % 7 == 0 || (emptyGrids + d - 1) % 7 == 0
    },

    calEmptyGrid(y, m) {
      const result = new Date(`${y}/${m}/01 00:00:00`).getUTCDay()
      return result + 1 || ''
    },

    calDaysInMonth(y, m) {
      let leapYear = this.isLeapYear(y)
      if (m == 2 && leapYear) {
        return 29
      }
      if (m == 2 && !leapYear) {
        return 28
      }
      if ([4, 6, 9, 11].includes(m)) {
        return 30
      }
      return 31
    },

    calWeekDay(y, m, d) {
      return new Date(`${y}/${m}/${d} 00:00:00`).getUTCDay() || ''
    },

    calDays(y, m) {
      let { selected } = this.data
      let emptyGrids = this.calEmptyGrid(y, m)
      let days = []
      for (let i = 1; i <= 31; i++) {
        let ifToday = this.isToday(y, m, i)
        let isSelected = selected[0] == y && selected[1] == m && selected[2] == i
        let today = ifToday ? 'today' : ''
        let select = isSelected ? 'selected' : ''
        let weekend = this.isWeekend(emptyGrids, i) ? 'weekend' : ''
        let todaySelected = ifToday && isSelected ? 'today-selected' : ''
        let day = {
          value: i,
          class: `date-bg ${weekend} ${today} ${select} ${todaySelected}`,
        }
        days.push(day)
      }
      return days.slice(0, this.calDaysInMonth(y, m))
    },

    changeMonth: function(e) {
      let id = e.currentTarget.dataset.id
      let currYear = this.data.currYear
      let currMonth = this.data.currMonth
      currMonth = id == 'prev' ? currMonth - 1 : currMonth + 1
      if (id == 'prev' && currMonth < 1) {
        currYear -= 1
        currMonth = 12
      }
      if (id == 'next' && currMonth > 12) {
        currYear += 1
        currMonth = 1
      }
      this.setData({
        currYear:currYear,
        currMonth:currMonth,
        emptyGrids: this.calEmptyGrid(currYear, currMonth),
        days: this.calDays(currYear, currMonth)
      })
    },

    handleSelectDate: function(e) {
      let data = e.target.dataset.selected
      this.setData({
          selected: [data[0], data[1], data[2]],
        currYear: data[0],
        currMonth: data[1],
        days: this.calDays(data[0], data[1])
      })
    },

    handleDatePickerChange(e) {
      let [year, month] = e.detail.value.split('-')
      year = parseInt(year)
      month = parseInt(month)
      this.setData({
        currYear: year,
        currMonth: month,
        emptyGrids: this.calEmptyGrid(year, month),
        days: this.calDays(year, month)
      })
    },

    handleTimePickerChange(e) {
      this.setData({ time: e.detail.value })
    },

    handleReset(e) {
      this.setData({
        selected: [],
        time: '',
        days: this.calDays(this.data.currYear, this.data.currMonth)
      })
    },

    init() {
      const dateTime = this.isDate(this.data.value) ? new Date(this.data.value) : today
      const year = dateTime.getFullYear()
      const month = dateTime.getMonth() + 1
      const dayInMonth = dateTime.getDate()
      const dayInWeek = dateTime.getDay()
      let hour = dateTime.getHours()
      let minute = dateTime.getMinutes()
      let second = dateTime.getSeconds();
      this.setData({
        currYear: year,
        currMonth: month,
        dayInWeek,
        dayInMonth,
        time:hour+':'+minute+':'+second,
        selected:[year, month, dayInMonth],
        emptyGrids: this.calEmptyGrid(year, month),
        days: this.calDays(year, month)
      })
    },

    handleChooseToday() {
      this.setData({ value: today.toString() })
      this.init()
    },

    handleConfirm(e) {
      const { selected, enableTime } = this.data
      if (selected && selected.length > 0) {
        const dateStr = selected.join('/') + ' ' + this.data.time
        const dateStr1 = this.formatTime(new Date(dateStr),!enableTime)
        this.setData({ value: dateStr1 })
      };
    }
  }
})
