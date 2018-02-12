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
  onLoad () {

    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      //更新数据
      this.setData({
        userInfo
      })
    })
  },
  onShow () {
    app.getMoney().then((data) => {
      this.setData({
        leftmoney: data
      })
      return app.request('/pay/get_withdraw')
    }).then((data) => {
      this.setData({
        inWithdrawals: (data.money / 100).toFixed(2)
      })
    }).catch(() => {})
  },
  bindSetValue (e) {
    this.setData({
      withdrawals: e.detail.value
    })
  },
  bindTap () {
    this.setData({
      withdrawals: this.data.leftmoney
    })
  },
  bindWithdrawTap () {
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
    }, 'GET', {
      '4': '提现订单不能超过3笔，请稍后再试',
      '5': '提现金额不能超过余额'
    }).then(() => {
      
      wx.showModal({
        title: '提示',
        content: '提交提现成功',
        success: () => {
          app.clearMoney()
          this.setData({
            withdrawals: '',
            leftmoney: (this.data.leftmoney - withdrawals).toFixed(2),
            inWithdrawals: (this.data.inWithdrawals - 0 + withdrawals).toFixed(2)
          })
        }
      })
    }).catch(() => {})
  }
})
