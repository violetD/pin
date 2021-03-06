//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

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
      '新年快乐, 阖家幸福'
    ],
    options: null,
    userInfo: {},
    text: "",
    time: "30秒",
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
    leftmoney: '0.00'
  },
  //事件处理函数
  onLoad: function (options) {

    this.setData({
      options
    })

    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      //更新数据
      this.setData({
        userInfo
      })
    })
  },
  onShow () {

    if (this.data.options.id) {
      this.play(this.data.options.id)
    }

    wx.showLoading({
      title: '加载中'
    })

    if (!app.finishLogin) this.init()
  },
  init () {
    const that = this;
    app.getMoney().then((data) => {
      this.setData({
        leftmoney: data
      })
    }).catch(function (res) {
      if (res && res.errno && res.errno == -1) {
        setTimeout(function () {
          if (!app.finishLogin || app.passportInfo) {
            that.init()
          }
        }, 500);
      }
    }).then(function () {
      wx.hideLoading()
    })
  },
  play: function (id, share) {
    wx.navigateTo({
      url: '/pages/game/game?id=' + id + '&share=' + (share || 0),
    })
  },
  setTextValue: function (e) {
    this.setData({
      text: this.data.textRange[e.detail.value]
    })
  },
  setMoney: function (e) {
    this.setData({
      tips: e.detail.value * 0.02
    })
  },
  showSetTime: function () {
    this.setData({
      setTime: this.data.timeValue,
      showModal: true
    })
  },
  hideModal: function () {
    this.setData({
      showModal: false
    })
  },
  setTime: function (e) {
    this.setData({
      setTime: e.detail.value
    })
  },
  onCancel: function () {
    this.hideModal();
  },
  onConfirm: function () {
    this.setData({
      timeValue: this.data.setTime,
      time: this.data.setTime + "秒"
    })
    this.hideModal();
  },
  showError: function (message) {
    wx.showModal({
      title: '提示',
      content: message,
      showCancel: false,
      success: function () {

      }
    })
  },
  formSubmit: function (e) {
    if (!e.detail.value.text) {
      this.showError('请输入要拼接的文字内容');
      return;
    }
    if (e.detail.value.text.length > 24) {
      this.showError('要拼接的文字内容不能超过24个字');
      return;
    }
    if ('' === e.detail.value.money) {
      this.showError('请输入总赏金');
      return;
    }
    if (e.detail.value.money < 1) {
      this.showError('总赏金不能少于1元');
      return;
    }
    if (e.detail.value.money > 10000) {
      this.showError('总赏金不能大于10000元');
      return;
    }
    if ('' === e.detail.value.number) {
      this.showError('请输入红包个数');
      return;
    }
    if (e.detail.value.money / e.detail.value.number < 0.01) {
      this.showError('人均赏金不能小于0.01元');
      return;
    }
    if (e.detail.value.time > 60) {
      this.showError('挑战时间不能超过60秒');
      return;
    }
    
    wx.showLoading({
      title: '提交中',
    })
    let data = e.detail.value;
    data.money = data.money * 100;
    data.time = data.time.replace('秒', '');
    data.form_id = e.detail.formId;
    app.request('/game/create', data).then((data) => {   
      this.setData({
        gameId: data.gameid,
        orderId: data.orderid,
        text: e.detail.value.text,
        hasPayed: !!data.has_payed,
        para: data.para
      })
      if (!!data.has_payed) {
        app.clearMoney()
      }
    }, (error) => {
      if (error.errmsg) {
        throw new TransactionError(error.errmsg)
      } else {
        throw new TransactionError('生成订单错误，请稍后重试')
      }
    }).then(() => {
      if (!this.data.hasPayed) {
        return this.pay(JSON.parse(this.data.para));
      }
    }).then(() => {
      this.play(this.data.gameId)
    }).catch((error) => {
      if (error && error.name === 'TransactionError') {
        wx.showModal({
          title: '提示',
          content: error.message,
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '支付失败',
        })
      } 
    }).then(function () {  
      wx.hideLoading();
    })
  },
  checkPay: function (orderId) {
    return app.request('/pay/check', {
      orderId
    })
  },
  pay: function (data) {
    const that = this;
    return new Promise(function (resolve, reject) {
      wx.requestPayment({
        ...data,
        success: function () {
          that.checkPay(that.data.orderId).then(() => {
            resolve()
          }).catch(() => {
            reject()
          })
        },
        fail: function () {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '微信付款失败',
          })
        }
      })
    }) 
  },
  onShareAppMessage: function () {
    return {
      title: '小程序',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})