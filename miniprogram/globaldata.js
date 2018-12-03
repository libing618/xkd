const date0 = [
  new Date(0),                          //最早更新时间
  new Date(0)                          //目前记录时间
]
module.exports={
  roleData:{
    user: {                                     //用户的原始定义
      "line": 9,                   //条线
      "position": 9,               //岗位
      "unit": "0",
      "city": "Taiyuan",
      "uName": "0",
      "nickName": "游客",
      "language": "zh_CN",
      "gender": 1,
      "province": "Shanxi",
      "avatarUrl": "../../images/index.png",
      "country": "CN",
      "mobilePhoneNumber": "0",
      "_id": "0"
    },
    wmenu: [
      [100,114],                         //用户未注册时的基础菜单
      [],
      [],
      []
    ],
    uUnit:{},                           //用户单位信息（若有）
    sUnit:{}                           //上级单位信息（若有）
  },
  aIndex: {
    banner: [],
    articles: [[], [], []],              //已发布文章分类缓存数组
    qa: [],
    pCkarticles: 1,            //已发布文章分类阅读选中序号
    pCkpromotion: 1,            //已发布团购众筹分类阅读选中序号
    asset: [],              //已发布固定资产缓存数组
    product: [],              //已发布产品分类缓存数组
    service: [],              //已发布服务分类缓存数组
    cargo: [],              //已发布成品分类缓存数组
    goods: [],              //已发布商品分类缓存数组
    share: [],              //已发布规格分类缓存数组
    promotion: [[],[], []]              //已发布团购众筹分类缓存数组
  },
  pIndex: {
    processingAt:[date0,date0],           //缓存中处理中流程更新时间
    proceduresAt:{"articles":date0,"asset":date0,"product":date0,"service":date0,"cargo":date0,"goods":date0,"share":date0,"promotion":date0,"material":date0,"sOrder":date0,"prodesign":date0,"wholesale":date0,"rawStock":date0,"packing":date0,"order":date0},
    prodessing: [[],[]],              //流程分类缓存数组
    procedures: [],              //已发布流程缓存数组
    proceduresCk: 'goods'             //选中的已发布流程
  },
  aCount: { "articles": {}, "asset": {}, "product": {}, "service": {}, "cargo": {}, "goods": {}, "share": {}, "promotion": {}, "material": {}, "sOrder": {}, "prodesign": {}, "wholesale": {}, "rawStock": {}, "packing": {}, "order": {} }
}
