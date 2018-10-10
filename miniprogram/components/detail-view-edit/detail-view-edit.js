// components/detail-view-edit/detail-view-edit.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value:  [                     //内容部分定义：t为类型,e为文字或说明,c为媒体文件地址或内容
      { t: "h2", e: "大标题" },
      { t: "p", e: "正文简介" },
      { t: "h3", e: "中标题" },
      { t: "p", e: "正文" },
      { t: "h4", e: "1、小标题" },
      { t: "p", e: "图片文章混排说明" },
      { t: "-2", c: 'http://ac-trce3aqb.clouddn.com/eb90b6ebd3ef72609afc.png', e: "图片内容说明" },
      { t: "p", e: "正文" },
      { t: "h4", e: "2、小标题" },
      { t: "p", e: "音频文章混排" },
      { t: "-3", c: "https://i.y.qq.com/v8/playsong.html?songid=108407446&source=yqq", e: "录音内容说明" },
      { t: "p", e: "正文" },
      { t: "h4", p: "3、小标题" },
      { t: "p", p: "视频文章混排" },
      { t: "-4", c: "https://v.qq.com/x/page/f05269wf11h.html?ptag=2_5.9.0.13560_copy", e: "视频内容说明" },
      { t: "p", e: "正文" },
      { t: "p", e: "章节结尾" },
      { t: "p", e: "文章结尾" }
    ]
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
