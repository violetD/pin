// leftmoney.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    leftmoney: '0.00',
    withdrawals: '',
    inWithdrawals: '¥0.00'
  },
  //事件处理函数
  onLoad: function () {

    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

    wx.showLoading({
      title: '加载中',
    })
    app.getMoney().then(function (data) {
      that.setData({
        leftmoney: data
      })
      return app.request('/pay/get_withdraw')
    }).then(function (data) {
      that.setData({
        inWithdrawals: (data.money / 100).toFixed(2)
      })
    }).catch(function () {

    }).then(function () {
      wx.hideLoading()
    })
  },
  bindSetValue: function (e) {
    this.setData({
      withdrawals: e.detail.value
    })
  },
  bindTap: function () {
    this.setData({
      withdrawals: this.data.leftmoney
    })
  },
  bindWithdrawTap: function () {
    const that = this;
    const withdrawals = this.data.withdrawals;
    wx.showLoading({
      title: '提交中',
    })
    
    app.request('/pay/order_withdraw', {
      money: this.data.withdrawals * 100
    }).then(function () {
      wx.showToast({
        title: '提现成功',
      })
      that.setData({
        withdrawals: '',
        leftmoney: (that.data.leftmoney - withdrawals).toFixed(),
        inWithdrawals: (that.data.inWithdrawals + withdrawals).toFixed()
      })
    }).catch(function () {

    }).then(function () {
      wx.hideLoading()
    })
  }
})
