// leftmoney.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    leftmoney: 0.00,
    withdrawals: '',
    inWithdrawals: 0.00
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
  },
  onShow () {
    wx.showLoading({
      title: '加载中',
    })
    app.getMoney().then((data) => {
      this.setData({
        leftmoney: data
      })
      return app.request('/pay/get_withdraw')
    }).then((data) => {
      this.setData({
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
    let withdrawals = this.data.withdrawals;

    if (!withdrawals) {
      return wx.showModal({
        title: '提示',
        content: '提现金额不能为空',
      })
    }
    if (!util.testMoney(withdrawals)) {
      return wx.showModal({
        title: '提示',
        content: '提现金额格式错误，只能有两位小数',
      })
    }
    withdrawals = Number(withdrawals)
    if (withdrawals > this.data.leftmoney) {
      return wx.showModal({
        title: '提示',
        content: '提现金额不能超过余额',
      })
    }

    if (withdrawals < 1) {
      return wx.showModal({
        title: '提示',
        content: '提现金额必须大于等于1元',
      })
    }
    wx.showLoading({
      title: '提交中',
    })
    
    app.request('/pay/order_withdraw', {
      money: this.data.withdrawals * 100
    }).then(function () {
      
      wx.showModal({
        title: '提示',
        content: '提交提现成功',
        success: function () {
          app.clearMoney()
          that.setData({
            withdrawals: '',
            leftmoney: (that.data.leftmoney - withdrawals).toFixed(2),
            inWithdrawals: (that.data.inWithdrawals - 0 + withdrawals).toFixed(2)
          })
        }
      })
    }).catch(function (error) {
      let message
      if (error && error.errno) {
        switch (error.errno) {
          case 4:
            message = '提现订单不能超过3笔，请稍后再试'
            break;
          case 5:
            message = '提现金额不能超过余额'
            break;
        }
      }
      if (message) {
        wx.showModal({
          title: '提示',
          content: message
        })
      }
    }).then(function () {
      wx.hideLoading()
    })
  }
})
