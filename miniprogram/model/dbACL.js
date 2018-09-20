const db = wx.cloud.database();
const _ = db.command;
var app = getApp();
class ACL {
  constructor (dataName) {
    wx.getStorage({
      key: dataName,
      success: function (res) {
        if (res.data) {
          this[dataName] = res.data
        } else {
          getData(true,dataName).then()
        };
      }
    })

  }
  SendMessage(queueName, msgBody) {
    return this.cmq_client.request({
      Action: 'SendMessage',
      queueName: queueName,
      msgBody: msgBody
    })
  }
  ListQueue(searchWord, offset = 0, limit = 20) {
    let reqParmart = { Action: 'ListQueue'}
    if (searchWord) { reqParmart.searchWord = searchWord }
    reqParmart.offset = offset;
    reqParmart.limit = limit
    return this.cmq_client.request(reqParmart)
  }
  ReceiveMessage(queueName, pollingWaitSeconds = 0) {
    return this.cmq_client.request({
      Action: 'ReceiveMessage',
      queueName: queueName,
      pollingWaitSeconds: pollingWaitSeconds
    })
  }
  /**
   * 创建队列
   * @param {string} queueName 队列名称
   * @param {init} maxMsgHeapNum
   * @more https://www.qcloud.com/doc/api/431/5832
   */
  CreateQueue (queueName, maxMsgHeapNum = 10000000, pollingWaitSeconds = 0, visibilityTimeout = 30, maxMsgSize = 65536, msgRetentionSeconds = 345600, next = function () {}) {
    if (typeof maxMsgHeapNum === 'function') {
      next = maxMsgHeapNum
      maxMsgHeapNum = 10000000
    }

    this.cmq_client.request({
        Action: 'CreateQueue',
        queueName: queueName,
        maxMsgHeapNum: maxMsgHeapNum,
        pollingWaitSeconds: pollingWaitSeconds,
        visibilityTimeout: visibilityTimeout,
        maxMsgSize: maxMsgSize,
        msgRetentionSeconds: msgRetentionSeconds
    }, function(error, data) {
        next(error, data)
    })
  }

  /**
   * 取保获取课程队列，如果存在则返回true, 如果不存在则创建
   * @param  {[type]}   ) {}          [description]
   * @return {Function}   [description]
   */
  AssertQueue(queueName, maxMsgHeapNum = 10000000, pollingWaitSeconds = 0, visibilityTimeout = 30, maxMsgSize = 65536, msgRetentionSeconds = 345600, next = function () {}){
    if (typeof maxMsgHeapNum === 'function') {
      next = maxMsgHeapNum
      maxMsgHeapNum = 10000000
    }

    this.cmq_client.request({
      Action: 'GetQueueAttributes',
      queueName: queueName
    }, function(error, data) {
      if (error) {
        return next(error, data)
      }

      if (data && data.code === 0) {
        return next(null, data)
      }

      if (data && data.code === 4440) {
        this.cmq_client.request({
          Action: 'CreateQueue',
          queueName: queueName,
          maxMsgHeapNum: maxMsgHeapNum,
          pollingWaitSeconds: pollingWaitSeconds,
          visibilityTimeout: visibilityTimeout,
          maxMsgSize: maxMsgSize,
          msgRetentionSeconds: msgRetentionSeconds
        }, function(error, data) {
          if(error) {
            return next(error)
          }

          // 4460为重复名称错误
          if (data && (
            data.code == 4460
            || (data.code == 4000 && data.message && data.message.indexOf('4460') >= 0))
          ) {
            return next(null, data)
          }

          return next(data)
        })
      }

      return next(data)
    })
  }

  // ListQueue (searchWord, offset = 0, limit = 20, next = function () {}) {
  //   if (typeof offset === 'function') {
  //     next = offset
  //     offset = 0
  //   }
  //   this.cmq_client.request({
  //       Action: 'ListQueue',
  //       searchWord: searchWord,
  //       offset: offset,
  //       limit: limit
  //   }, function(error, data) {
  //       next(error, data)
  //   })
  // }

  GetQueueAttributes (queueName, next = function () {}) {
    this.cmq_client.request({
        Action: 'GetQueueAttributes',
        queueName: queueName
    }, function(error, data) {
        next(error, data)
    })
  }

  SetQueueAttributes (queueName, maxMsgHeapNum = 10000000, pollingWaitSeconds = 0, visibilityTimeout = 30, maxMsgSize = 65536, msgRetentionSeconds = 345600, next = function () {}) {
    if (typeof maxMsgHeapNum === 'function') {
      next = maxMsgHeapNum
      maxMsgHeapNum = 10000000
    }
    this.cmq_client.request({
        Action: 'SetQueueAttributes',
        queueName: queueName,
        maxMsgHeapNum: maxMsgHeapNum,
        pollingWaitSeconds: pollingWaitSeconds,
        visibilityTimeout: visibilityTimeout,
        maxMsgSize: maxMsgSize,
        msgRetentionSeconds: msgRetentionSeconds
    }, function(error, data) {
        next(error, data)
    })
  }

  DeleteQueue (queueName, next = function () {}) {
    this.cmq_client.request({
        Action: 'DeleteQueue',
        queueName: queueName
    }, function(error, data) {
        next(error, data)
    })
  }

  BatchSendMessage (queueName, msgBodys, next = function() {}) {
    let qBody = {
        Action: 'BatchSendMessage',
        queueName: queueName,
    }
    for (let i in msgBodys) {
      qBody[`msgBody.${i}`] = msgBodys[i]
    }
    this.cmq_client.request(qBody, function(error, data) {
        next(error, data)
    })
  }

  // ReceiveMessage (queueName, pollingWaitSeconds = 0, next = function () {}) {
  //   this.cmq_client.request({
  //       Action: 'ReceiveMessage',
  //       queueName: queueName,
  //       pollingWaitSeconds: pollingWaitSeconds
  //   }, function(error, data) {
  //       next(error, data)
  //   })
  // }

  BatchReceiveMessage (queueName, numOfMsg, pollingWaitSeconds, next = function () {}) {
    this.cmq_client.request({
        Action: 'BatchReceiveMessage',
        queueName: queueName,
        numOfMsg: numOfMsg,
        pollingWaitSeconds: pollingWaitSeconds
    }, function(error, data) {
        next(error, data)
    })
  }

  DeleteMessage (queueName, receiptHandle, next = function() {}) {
    this.cmq_client.request({
        Action: 'DeleteMessage',
        queueName: queueName,
        receiptHandle: receiptHandle
    }, function(error, data) {
        next(error, data)
    })
  }

  BatchDeleteMessage (queueName, receiptHandles, next = function() {}) {
    let qBody = {
        Action: 'BatchDeleteMessage',
        queueName: queueName
    }
    for (let i in receiptHandles) {
        qBody[`receiptHandle.${i}`] = receiptHandles[i]
    }
    this.cmq_client.request(qBody, function(error, data) {
        next(error, data)
    })
  }
}

module.exports = ACL
