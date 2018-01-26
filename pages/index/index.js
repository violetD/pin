//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    textRange: ['测试字符', '测试字符2'],
    userInfo: {},
    text: "我厉害吧",
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
    orderId: null
  },
  //事件处理函数
  onLoad: function (options) {
    // wx.navigateTo({
    //   url: '/pages/picture/picture?id=36',
    // })

    // options.id = 4;
    //this.play(36, 1)
    if (options.id) {
      this.play(options.id)
    }

    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo: userInfo
      })
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
    const that = this;
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
    if ('' === e.detail.value.number) {
      this.showError('请输入红包个数');
      return;
    }
    if (e.detail.value.number / e.detail.value.money < 0.01) {
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
    app.request('/game/create', data).then(function (data) {   
      that.setData({
        orderId: data.orderid,
        text: e.detail.value.text
      })
      if (!data.has_payed) {
        return that.pay(JSON.parse(data.para));
      }
    }).then(function () {
      that.play(that.data.orderId, 1)
    }).catch(function () {
      console.log(arguments)
    }).then(function () {
      wx.hideLoading();
    })
  },
  pay: function (data) {
    return new Promise(function (resolve, reject) {
      // TODO
      resolve();
      // wx.requestPayment({
      //   ...data,
      //   success: function () {
      //     console.log(arguments)
      //     resolve();
      //   },
      //   fail: function () {
      //     reject();
      //   }
      // })
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