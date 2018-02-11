//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
const mathHelper = require('../../utils/math.js')

class TransactionError extends Error {
  constructor(message) {
    super(message)
    this.name = 'TransactionError'
  }
}

Page({
  data: {
    textRange: [
      '大吉大利恭喜发财', 
      '大吉大利，今晚吃鸡',
      '科学究研表明序汉字的排不怎么响影阅读',
      '新年快乐，阖家幸福'
    ],
    options: null,
    userInfo: {},
    text: "",
    timeValue: 30,
    setTime: "",
    tips: "0.00",
    items: [{
      name: '10秒',
      value: 10
    }, {
      name: '20秒',
      value: 20
    }, {
      name: '30秒',
      value: 30
    }],
    showModal: false,
    hasPayed: false,
    para: null,
    orderId: null,
    gameId: null,
    leftmoney: '0.00',
    activity: false,
  },
  //事件处理函数
  onLoad (options) {
    
    this.setData({
      options
    })

    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      //更新数据
      this.setData({
        userInfo
      })

      if (this.data.options.id) {
        this.play(this.data.options.id)
      }
    })
  },

  onShow () {

    app.request('/api/ActivityIsOpen', {}).then((data) => {
      this.setData({
        activity: data.is_open == 1 ? 1 : 0
      })
    }).then(() => {
      return app.getMoney()
    }).then((data) => {
      this.setData({
        leftmoney: data
      })
    }).catch(() => {})
  },

  play (id, share) {
    wx.navigateTo({
      url: '/pages/game/game?id=' + id + '&share=' + (share || 0),
    })
  },

  setTextValue (e) {
    this.setData({
      text: this.data.textRange[e.detail.value]
    })
  },
  setMoney (e) {
    let tips = mathHelper.multiply(e.detail.value, 2, 0)
    if (isNaN(tips)) return
    tips = mathHelper.divide(Math.floor(tips), 100)
    this.setData({
      tips
    })
  },
  showSetTime () {
    this.setData({
      setTime: this.data.timeValue,
      showModal: true
    })
  },
  hideModal () {
    this.setData({
      showModal: false
    })
  },
  setTime (e) {
    this.setData({
      setTime: e.detail.value
    })
  },
  onConfirm () {
    this.setData({
      timeValue: this.data.setTime,
    })
    this.hideModal();
  },
  showError (message) {
    wx.showModal({
      title: '提示',
      content: message,
      showCancel: false,
    })
  },
  formSubmit (e) {
    let text = e.detail.value.text || ''
    text = text.replace(/\s+/g, '')
    if (!text) {
      return this.showError('请输入要拼接的文字内容，不能输入空格')
    }
    if (text.length > 24) {
      return this.showError('要拼接的文字内容不能超过24个字')
    }
    if ('' === e.detail.value.money) {
      return this.showError('请输入总赏金')
    }
    if (e.detail.value.money < 1) {
      return this.showError('总赏金不能少于1元')
    }
    if (e.detail.value.money > 10000) {
      return this.showError('总赏金不能大于10000元')
    }
    if (!util.testMoney(e.detail.value.money)) {
      return this.showError('总赏金不能超过两位小数')
    }
    if ('' === e.detail.value.number) {
      return this.showError('请输入红包个数')
    }
    if (e.detail.value.money / e.detail.value.number < 0.01) {
      return this.showError('人均赏金不能小于0.01元')
    }
    if (e.detail.value.time > 60) {
      return this.showError('挑战时间不能超过60秒')
    }
    
    let data = e.detail.value
    data.text = text
    data.money = mathHelper.multiply(data.money, 100)
    data.time = data.time.replace('秒', '')
    data.form_id = e.detail.formId
    app.request('/game/create', data).then((data) => {   
      this.setData({
        gameId: data.gameid,
        orderId: data.orderid,
        text,
        hasPayed: !!data.has_payed,
        para: data.para
      })
      // 用余额付款时，清除余额缓存
      if (!!data.has_payed) {
        app.clearMoney()
      }
    }).catch((error) => {
      if (error && error.errmsg) {
        throw new TransactionError(error.errmsg)
      } else {
        throw new TransactionError('生成订单错误，请稍后重试')
      }
    }).then(() => {
      if (!this.data.hasPayed) {
        return this.pay(JSON.parse(this.data.para))
      }
    }).then(() => {
      this.play(this.data.gameId, 1)
    }).catch((error) => {
      if (error && error.name === 'TransactionError') {
        wx.showModal({
          title: '警告',
          content: error.message,
        })
      } else {
        wx.showModal({
          title: '警告',
          content: '支付失败',
        })
      } 
    })
  },
  checkPay (orderId) {
    return app.request('/pay/check', {
      orderId
    })
  },
  pay (data) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...data,
        success () {
          this.checkPay(this.data.orderId).then(() => {
            resolve()
          }).catch(() => {
            reject()
          })
        },
        fail () {
          wx.showModal({
            title: '警告',
            content: '微信付款失败',
          })
        }
      })
    }) 
  },

  onShareAppMessage () {
    return {
      title: '拼一拼来福',
      path: '/pages/index/index',
      success (res) {
        // 转发成功
      },
      fail (res) {
        // 转发失败
      }
    }
  },

  showActivity () {
    wx.navigateTo({
      url: '/pages/otherpage/otherpage?type=activity',
    })
  },
})