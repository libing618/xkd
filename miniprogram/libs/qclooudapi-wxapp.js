var crypto = require('crypto')

function sortKeys(obj) {
  let newobj = {};
  Object.keys(obj).sort().forEach(value => newobj[value] = obj[value]);
  return newobj
}

function codeObj(obj) {
  let arr = [];
  for (let k in obj) {
    arr.push(k + '=' + obj[k])
  }
  return arr.join('&')
}

/**
 * API 构造函数
 * @param {Object} [defaults] 默认参数及配置
 * @param {String} defaults.serviceType 服务类型. 如: cvm, vpc, dfw, lb 等. 根据 `serviceType` 和 `baseHost` 将拼装成请求域名, 如: `vpc.api.qcloud.com`
 * @param {String} defaults.path='/v2/index.php' Api 请求路径
 * @param {String} defaults.method='POST' 请求方法
 * @param {String} defaults.baseHost='api.qcloud.com' Api 的基础域名
 * @param {String} defaults.SecretId secretId
 * @param {String} defaults.SecretKey secretKey
 * @param {String} defaults.signatureMethod 签名方法，默认sha1
 * @constructor
 */
var QcloudApi = function(configs) {
  this.defaults = {
    path: '/v2/index.php',
    method: 'GET',
    protocol: 'https',
    baseHost: 'api.qcloud.com',
    RequestClient: 'qcloud-api-miniprogram',
    signatureMethod: 'sha1'
  }
  Object.assign( this.defaults,configs)
}

/**
 * 生成 API 的请求地址
 * @param {Object} opts
 * @returns {string}
 */
QcloudApi.prototype.generateUrl = function(opts) {
  opts = opts || {}
  var host = this._getHost(opts)
  var path = opts.path === undefined ? this.defaults.path : opts.path
  return (opts.protocol || this.defaults.protocol) + '://' + host + path
}

/**
 * 生成请求参数.
 * @param {Object} data 该次请求的参数. 同 `request` 方法的 `data` 参数
 * @param {Object} [opts] 请求配置. 同 `request` 方法的 `opts` 参数
 * @returns {string} 包括签名的参数字符串
 */
QcloudApi.prototype.generateParams = function(data, opts) {
  opts = opts || this.defaults
  var defaults = this.defaults

  //附上公共参数
  var param = (
    Action: data.Action,
    Region: opts.Region || defaults.Region,
    SignatureMethod: opts.signatureMethod || defaults.signatureMethod,
    SecretId: opts.SecretId || defaults.SecretId,
    Timestamp: Math.round(Date.now() / 1000),
    Nonce: Math.round(Math.random() * 65535)
  )

  // 初始化配置和传入的参数冲突时，以传入的参数为准
  Object.assign(param,data);
  var isSha256 = defaults.signatureMethod === 'sha256' || opts.signatureMethod === 'sha256'
  if (isSha256 && !data.SignatureMethod) { param.SignatureMethod = 'HmacSHA256' };
  var host = this._getHost(opts)
  var method = (opts.method || defaults.method).toUpperCase()
  var path = opts.path === undefined ? defaults.path : opts.path
  let qstr = codeObj(sortKeys(param))

  let hashResult // 16进制负载hash值
  if ( param.SignatureMethod === 'HmacSHA256' ) {
    hashResult = crypto
      .createHash(opts.signatureMethod)
      .update(qstr)
      .digest('hex')
    qstr = '\n' + hashResult
  }

  param.Signature = this.sign(
    method + host + path + '?' + qstr,
    opts.SecretKey || defaults.SecretKey,
    opts.signatureMethod || defaults.signatureMethod
  )
  return param
}

/**
 * 请求 API
 * @param {Object} data 该次请求的参数.
 * @param {Object} [data.SecretId] Api SecrectId, 通过 `data` 参数传入时将覆盖 `opt` 传入及默认的 `secretId`
 * @param {Object} [opts] 请求配置. 配置里的参数缺省使用默认配置 (`this.defaults`) 里的对应项
 * @param {String} opts.host 该次请求使用的 API host. 当传入该参数的时候, 将忽略 `serviceType` 及默认 `host`
 * @param {requestCallback} callback 请求回调
 * @param {Object} [extra] 传给 request 库的额外参数
 */
QcloudApi.prototype.request = function(data, opts, callback, extra) {
  if (typeof opts === 'function') {
    callback = opts
    opts = this.defaults
  }
  opts = opts || this.defaults
  callback = callback || Function.prototype
  Object.assign(data, extra)
  var params = this.generateParams(data, opts)
  wx.request({       //请求回调callback,error 请求错误,data API的请求结果
    method: (opts.method || this.defaults.method).toUpperCase(),
    url: this.generateUrl(opts),
    dataType: opts.dataType || 'json',
    header: opts.header || {'content-type': 'application/json'},
    data: params,
    success: function success(res) {
     return callback(
       error:{},
       data:{
       statusCode: res.statusCode,
       responseText: res.data,
       headers: res.header,
       statusMessage: res.errMsg
     });
    },
    fail: function fail(res) {
     return callback(
       error:{
       statusCode: res.statusCode || 0,
       statusMessage: res.errMsg
     });
    }
  })
}

/**
 * 生成签名
 * @param {String} str 需签名的参数串
 * @param {String} secretKey
 * @param {String} signatureMethod 签名方法，默认sha1
 * @returns {String} 签名
 */
QcloudApi.prototype.sign = function(str, secretKey, signatureMethod = 'sha1') {
  var hmac = crypto.createHmac(signatureMethod, secretKey || '')
  return hmac.update(new Buffer(str, 'utf8')).digest('base64')
}

/**
 * 获取 API host
 * @param opts 请求配置
 * @param {String} [opts.serviceType] 服务类型. 如: cvm, vpc, dfw, lb 等
 * @param {String} [opts.host] 如果配置中直接传入 host, 则直接返回该 host
 * @returns {String}
 * @private
 */
QcloudApi.prototype._getHost = function(opts) {
  var host = opts.host
  if (!host) {
    host =
      (opts.serviceType || this.defaults.serviceType) +
      '.' +
      (opts.baseHost || this.defaults.baseHost)
  }
  return host
}

module.exports = QcloudApi
