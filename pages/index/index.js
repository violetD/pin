//index.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    textRange: ['测试字符', '测试字符2'],
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
    showModal: false
  },
  //事件处理函数
  onLoad: function () {

    wx.switchTab({
      url: '/pages/rank/rank',
    })
    return;

    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  setTextValue: function (e) {
    this.setData({
      text: this.data.textRange[e.detail.value]
    })
  },
  setMoney: function (e) {
    this.setData({
      tips: e.detail.value * 0.03
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
    if (!e.detail.value.text.length > 24) {
      this.showError('要拼接的文字内容不能超过24个字');
      return;
    }
    if ('' === e.detail.value.money) {
      this.showError('请输入总赏金');
      return;
    }
    if ('' === e.detail.value.number) {
      this.showError('请输入红包个数');
      return;
    }
    console.log(e.detail.value)
  }
})
