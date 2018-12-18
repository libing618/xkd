//gname为字段名称，p为显示的没字名，t为编辑类型，css为存储和显示类型
//iNd行业数组选择，存储{code:代码数组，sName:代码对应值的数组}
//csc对应关系:codename数组选择，存储{code:选择值，sName:选择对应的值}
//gSt对象选择，存储gname对应数据表选择的ID值，显示slave对应uName:选择记录的名称，title:选择记录的简介，thumbnail:选择记录的缩略图}
//csc对应关系:idname数组选择，存储gname对应数据表选择的ID值，显示选择对应的uName
//数据型对应关系:t的digit代表2位小数点浮点数，integer则为整数型
//address包括三个字段地址、地理位置"aGeoPoint"、行政编码"address_code"
module.exports = {
"_Role":{
  "pName": "单位名称和负责人",
  "pSuccess": ["uniType","indType","nick","title","desc","thumbnail","address","sUnit","licenseNumber","pPhoto","uPhoto"],
  "fieldType":{
    "uniType":{p:'厂商类型', t:"listsel", aList:['产品制造人','物流服务人','电商服务站','生产厂家及经销商','电子商务企业']},
    "indType":{p:'主营业务', t:"iNd"},
    "nick":{p:'单位简称',t:"h3" },
    "title":{p:'单位简介', t:"h3"},
    "desc":{p: '单位描述', t: "p"},
    "thumbnail":{p: '图片简介', t:"t64" },
    "address":{ p: '常用地址', t: "Geo",addFields:['aGeoPoint','code','poi']},
    "sUnit": { p: '上级单位(或总部)', t: "mSU", addFields: ['uName']},
    "radius":{p:'可送达半径,单位km', t:"digit" },
    "licenseNumber":{p:'社会信用代码', t: "h3" },
    "pPhoto":{p:'申请人手持身份证的照片',t:"tDM", e:'http://ady3cqpl0902fnph-10007535.file.myqcloud.com/667b99d135e2d8fa876d.jpg' },
    "uPhoto":{p:'单位营业执照或个人身份证背面的照片',t:"tDM", e:'http://ady3cqpl0902fnph-10007535.file.myqcloud.com/80b1db6d2b4f0a1cc7cf.jpg' }
  },
  "pBewrite": "单位负责人提出岗位和单位设置或修改申请，提交单位或个人身份证明文件的照片，由电子商务服务公司进行审批。",
  "suRoles": [
    "32",
    "31"
  ]
},
"articles":{
  "pName": "文章",
  "afamily": ['品牌建设','扶持优惠','产品宣传'],
  "pSuccess": ["title","thumbnail","desc","details"],
  "fieldType":{
    "title":{t:"h2", p:"标题" },
    "thumbnail":{p: '上传用于缩略图的图片',t: "-6" },
    "desc":{t:"p", p:"摘要" },
    "details":{p:'详情',t:"eDetail" }
  },
  "puRoles": [
    "20",
    "88"
  ],
  "pBewrite": "编写各类文章，经单位领导审批后发布。个人编写的此类文章由所属服务机构审批。",
  "suRoles": [
    "21",
    "20"
  ]
},
"banner":{
  "pName": "公告公示",
  "pSuccess": ["title","thumbnail","desc","details"],
  "fieldType":{
    "title":{t:"h2", p:"标题" },
    "thumbnail":{p: '上传用于缩略图的图片',t: "-6" },
    "desc":{t:"p", p:"摘要" },
    "details":{p:'详情',t:"eDetail" }
  },
  "puRoles": [
    "20",
    "88"
  ],
  "pBewrite": "编写公告公示，经单位领导审批后发布。个人编写的此类文章由所属服务机构审批。",
  "suRoles": [
    "21",
    "20"
  ]
},
"qa":{
  "pName": "常见问题",
  "pSuccess": ["title","thumbnail","desc","details"],
  "fieldType":{
    "title":{t:"h2", p:"标题" },
    "thumbnail":{p: '上传用于缩略图的图片',t: "-6" },
    "desc":{t:"p", p:"摘要" },
    "details":{p:'详情',t:"eDetail" }
  },
  "puRoles": [
    "20",
    "88"
  ],
  "pBewrite": "编写常见问题，经单位领导审批后发布。",
  "suRoles": [
    "21",
    "20"
  ]
},
"asset":{
  "pName": "固定资产",
  "pSuccess": ["assetType","title","desc","address","thumbnail","fcode","_Role"],
  "fieldType":{
    "assetType":{p:'固定资产类别',t:"ast", addFields:['uName']},
    "title":{p:'固定资产简介',t:"h3" },
    "desc":{p:'固定资产描述',t:"p" },
    "address":{p: '详细地址', t: "Geo",addFields:['aGeoPoint','code']},
    "thumbnail":{p: '图片简介',t:"-6" },
    "fcode":{p: '编号',t: "iSc" },
    "_Role":{p:'管理方', t:"sId", addFields:['uName','title','thumbnail'] }
  },
  "pBewrite": "综合条线提出固定资产设置或修改申请，由条线负责人进行审批。",
  "puRoles": [
    "32",
    "31"
  ]
},
"product":{
  "pName": "产品",
  "pSuccess": ["protype","title","thumbnail","address","PARM_content","PARM_additive","PARM_attention","PARM_period","standard_code","license_no"],
  "fieldType":{
    "protype":{p:'产品类别',t:"pDt",addFields:['uName'] },
    "title":{p:'简介',t:"h4" },
    "thumbnail":{p:'图片简介',t:"-6" },
    "address":{p:'出产地址', t: "Geo",addFields:['aGeoPoint','code'] },
    "PARM_content":{p:'内容', t:"h4" },
    "PARM_additive":{p:'附加', t:"h4" },
    "PARM_attention":{p:'注意事项', t:"h4" },
    "PARM_period":{p:'期限(天)', t:"digit" },
    "standard_code":{p:'执行标准', t:"h4" },
    "license_no":{p:'许可证号', t:"h4" }
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "12",
    "11"
  ]
},
"service":{
  "pName": "服务项目",
  "pSuccess": ["serFamily","title","thumbnail","address","priceClass","priceMax","price","factory","serName","serPhone"],
  "fieldType":{
    "serFamily":{p:'服务类型',  t:"pDt",  addFields:['uName']},
    "title":{p:'简介',t:"h4" },
    "thumbnail":{p:'图片简介',t:"-6" },
    "address":{p:'服务地址', t: "Geo",addFields:['aGeoPoint','code'] },
    "priceClass":{p:'计价类型', t:"listsel", aList:['每30分钟','每次','每千克','每千米'] },
    "priceMax":{p:'价格区间', t:"digit" },
    "price":{p:'价格', t:"digit" },
    "channel":{p:'渠道分成比例%',t:"allot"},
    "extension":{p:'推广分成比例%',t:"allot"},
    "factory":{p:'电商服务费', t: "allot"},
    "serName":{p:'联系人姓名', t:"h4" },
    "serPhone":{p:'联系人电话', t:"h4" }
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "12",
    "11"
  ]
},
"share":{
  "pName": "共享服务",
  "afamily":['停止','开始','服务'],
  "pSuccess": ["title","thumbnail","service","asset","address","fcode","priceClass","price","serParty","serName","serPhone","manageParty","manageName","managePhone","startTime","endTime"],
  "fieldType":{
    "title":{p:'简介',t:"h4" },
    "thumbnail":{p:'图片简介',t:"-6" },
    "service":{p:'服务', t:"sId", addFields:['uName','title','thumbnail'] },
    "asset":{p:'固定资产', t:"sId", addFields:['uName','title','thumbnail'] },
    "address":{p:'服务地址', t: "Geo",addFields:['aGeoPoint','code'] },
    "fcode":{p: '编号',t: "iSc" },
    "priceClass":{p:'计价类型', t: "h3" },
    "price":{p:'价格', t:"digit" },
    "serParty":{p:'服务方', t:"h4" },
    "serName":{p:'联系人姓名', t:"h4" },
    "serPhone":{p:'联系人电话', t:"h4" },
    "manageParty":{p:'管理方', t:"h4" },
    "manageName":{p:'管理人姓名', t:"h4" },
    "managePhone":{p:'管理人电话', t:"h4" },
    "startTime":{p:'开始时间', t:"tVE",csc:"time"},
    "endTime":{p:'结束时间', t:"tVE",csc:"time"}
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "12",
    "11"
  ]
},
"cargo":{
  "pName": "成品",
  "pSuccess": ["title","thumbnail","serFamily","surface","size","weight","product","retail_price","cargoStock","canSupply"],
  "fieldType":{
    "title":{p:'成品简介',t:"h4" },
    "thumbnail":{p:'图片简介',t:"-6" },
    "serFamily":{p:'送货类型', t:"listsel", aList:['快递送货','货运自提','柜台提货','店铺消费'] },
    "surface":{p:'外观', t:"h4" },
    "size":{p:'尺寸', t:"h4" },
    "weight":{p:'重量', t:"h4" },
    "product":{p:'内含物', t:"cAe" },
    "price":{p:'零售价', t:"digit", addFields:['old_price'] },
    "cargoStock":{p:'库存', t:"integer"},
    "canSupply":{p:'可供销售', t:"integer"}
  },
  "pBewrite": "产品条线提出服务设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "12",
    "11"
  ]
},
"goods":{
  "pName": "商品",
  "pSuccess": ["goodstype","title","thumbnail","desc","specstype","cargo","pics","video","details"],
  "fieldType":{
    "goodstype":{ p:'商品类别',t:"gSt" },
    "title":{p:'简介',t:"h3" },
    "thumbnail":{p:'图片简介',t:"-6" },
    "desc":{p:'描述',t:"p" },
    "specstype":{p:'供应类型', t:"listsel", aList:['单品','套餐']},
    "cargo":{p:'成品规格', t:"sku" },
    "pics":{p:'图片集',t:"-1"},
    "video":{p:'视频简介',t:"-4"},
    "details":{p:'详情',t:"eDetail" }
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "12",
    "11"
  ],
  "suRoles": ["12"]
},
"expense":{
  "pName": "费用分配设置",
  "pSuccess": ["channel","extension","factory"],
  "fieldType":{
    "channel":{p:'渠道分成比例%',t:"allot"},
    "extension":{p:'推广分成比例%',t:"allot"},
    "factory":{p:'销售管理总占比', t: "allot"}
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "12",
    "11"
  ],
  "suRoles": ["12"]
},
"promotion":{
  "pName": "众筹团购及促销",
  "afamily":['众筹','团购','促销'],
  "pSuccess": ["goods","base_price","base_amount","big_price","big_amount","start_date","end_date"],
  "fieldType":{
    "goods":{ p: '商品', t: "sId", addFields: ['uName', 'title', 'thumbnail'] },
    "base_price":{p: '基础优惠价', t: "digit" },
    "base_amount":{p: '基础目标数量', t: "integer" },
    "big_price":{p: '大额优惠价', t: "digit" },
    "big_amount":{p: '大额目标数量', t: "integer" },
    "start_date":{p: '活动开始日期', t: "dVE" },
    "end_date":{p: '活动截止日期', t: "dVE" }
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由营销条线负责人进行审批。",
  "puRoles": [
    "12",
    "31"
  ]
},
"material":{
  "pName": "原材料与包装",
  "pSuccess": ["title","dafamily","thumbnail","rawStocks"],
  "fieldType":{
    "title":{p:'材料简述',t:"p" },
    "dafamily":{p:'材料类型',t:"listsel", aList:['自产原料','外购原料','包装'] },
    "thumbnail":{p:'图片',t:"-6" },
    "rawStocks":{p:'原材料库存', t:"integer" }
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "11",
    "10"
  ]
},
"cargoOrder": {
  "pName": "商品订单",
  "pSuccess": ["tradeId","tradeType","goods","shopid","user","ip","quantity","cargo","serFamily","recaddress","_Role","prepayId","paidAt","confirmerArr","confirmTotal","deliverArr","deliverTotal","receiptArr","receiptTotal"],
  "fieldType":{
    "tradeId":{p:'成交单号', t:"h2" },
    "tradeType":{p:'成交类型', t:"h2" },
    "goods":{p:'商品', t:"sId", addFields:['uName'] },
    "shopid":{ p: "商城", t:"sId", addFields:['uName'] },
    "user":{p:' 购买人', t:"sId", addFields:['uName'] },
    "ip":{p:'下单IP地址', t:"h3" },
    "quantity":{p:'数量', t:"integer" },
    "cargo":{p:'成品', t:"sId", addFields:['uName'] },
    "serFamily":{p:'送货类型', t:"listsel", aList:['快递送货','货运自提','柜台提货','店铺消费'] },
    "recaddress":{p:'收货地址', t:"sId", csc:"recAddress" },
    "_Role":{p:'厂家', t:"sId", addFields:['uName'] },
    "prepayId":{p:' 订单ID', t:"h2" },
    "paidAt":{p:'下单时间', t:"dtE" },
    "confirmerArr":{p:'订单确认出库', t:"sAr", csc:"cOrderArray" },
    "confirmTotal":{p:'订单确认出库数量', t:"integer" },
    "deliverArr":{p:'货运信息', t:"sAr", csc:"deliverArray" },
    "deliverTotal":{p:'已发货数量',t:"integer" },
    "receiptArr":{p:'收货信息', t:"sAr", csc:"cOrderArray" },
    "receiptTotal":{p:'已收货数量', t:"integer" }
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "11",
    "10"
  ]
},
"sOrder":{
  "pName": "服务订单",
  "pSuccess": ["ledger_id","src_account","dst_account","asset_type","amount","sign_in_date"],
  "fieldType":{
    "ledger_id":{p:"账本ID",t:"sId"},
    "src_account":{p:"资产转出帐户",t:"sId"},
    "dst_account":{p:"资产转入帐户",t:"sId"},
    "asset_type":{p:"资产类型",t:"sId"},
    "amount":{p:"转让份额",t:"integer"},
    "sign_in_date":{p:"要求签收时间",t:"dtE"}
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "11",
    "10"
  ]
},
"prodesign":{
  "pName": "生产计划",
  "afamily":['原材料供应','加工及包装'],
  "pSuccess": ["cargo","title","thumbnail","dOutput","startDate","endDate"],
  "fieldType":{
    "cargo":{p:'成品', t:"sId",addFields:['uName','title','thumbnail'] },
    "title":{p:'计划简述',t:"h3" },
    "thumbnail":{p:'图片',t:"-6" },
    "dOutput":{p:'计划产量', t:"integer" },
    "startDate":{p:'开始时间', t:"dtE"},
    "endDate":{p:'结束时间', t:"dtE"}
  },
  "pBewrite": "产品条线提出产品设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "11",
    "10"
  ]
},
"wholesale":{
  "pName": "产品批发",
  "pSuccess": ["product","title","thumbnail","surface","size","weight","whole_price","wholeStock","canwholesale"],
  "fieldType":{
    "product":{p:'产品', t:"sId", addFields:['uName','title','thumbnail'] },
    "title":{p:'批发品简介',t:"h4" },
    "thumbnail":{p:'图片简介',t:"-6" },
    "surface":{p:'外观', t:"h4" },
    "size":{p:'尺寸', t:"h4" },
    "weight":{p:'重量', t:"h4" },
    "whole_price":{p:'零售价', t:"digit" },
    "wholeStock":{p:'库存', t:"integer"},
    "canwholesale":{p:'可供销售',t:'integer'}
  },
  "pBewrite": "产品条线提出服务设置或修改申请，由产品条线负责人进行审批。",
  "puRoles": [
    "12",
    "11"
  ]
},
"rawOperate":{
  "pName": "原料采供",
  "oprocess": ['采供下单', '原料供应', '原料入库'],
  "pSuccess": ["material","thumbnail","_Role","_User"],
  "fieldType":{
    "material":{p:'原料(包装)', t:"sId",addFields:['uName','title','thumbnail'] },
    "thumbnail":{p: '图片', t:"-6" },
    "_Role":{p: '供货商', t: "h3", e: '单位名称' },
    "_User":{p: '签收人', t: "h3", e: '签收人名称' }
  },
  "oModel": "rawStock",
  "oSuccess": [
    { indexField: 'cargo', sumField: ['quantity']},
    { indexField: 'material', sumField: ['deliverTotal'] },
    { indexField: 'material', sumField: ['receiptTotal'] }
  ],
  "ouRoles": [1,0,0],
  "oBewrite": "产品条线确认采购计划,综合条线采购原料并入库。"
},
"packOperate":{
  "pName": "加工入库",
  "oprocess": ['安排生产', '生产加工', '成品入库'],
  "pSuccess": ["cargo","thumbnail","_Role","_User"],
  "fieldType":{
    "cargo":{p:'成品',t:"sId",addFields:['uName','title','thumbnail'] },
    "thumbnail":{p: '图片', t:"-6" },
    "_Role":{p: '加工商', t: "h3", e: '单位名称' },
    "_User":{p: '签收人', t: "h3", e: '签收人名称' }
  },
  "oModel": "packing",
  "oSuccess": [
    { indexField: 'cargo', sumField: ['quantity']},
    { indexField: 'cargo', sumField: ['deliverTotal'] },
    { indexField: 'cargo', sumField: ['receiptTotal'] }
  ],
  "ouRoles": [1,1,0],
  "oBewrite": "产品条线确认出品计划,产品条线包装并入库。"
},
"supplies":{
  "pName": "订单处理",
  "oprocess": ['订单确认', '成品出货', '到货确认'],
  "pSuccess": ["cargo","thumbnail","_Role","_User"],
  "fieldType":{
    "cargo":{p:'成品',t:"sId",addFields:['uName','title','thumbnail'] },
    "thumbnail":{p: '图片', t:"-6" },
    "_Role":{p: '物流商', t: "h3", e: '单位名称' },
    "_User":{p: '签收人', t: "h3", e: '签收人名称' }
  },
  "oModel": "orderlist",
  "oSuccess": [
    { indexField: 'cargo', sumField: ['quantity']},
    { indexField: 'address', sumField: ['deliverTotal'] },
    { indexField: 'address', sumField: ['receiptTotal'] }
  ],
  "ouRoles": [1,1,3],
  "oBewrite": "产品条线确认订单并出货,服务条线进行店铺确认。"
}
}
