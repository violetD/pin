//me.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    money: '0.00'
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
        money: data
      })

      if (!app.globalData.isAuthorization) {
        wx.showModal({
          title: '提示',
          content: '您还没有完成实名认证，将影响您的提现功能。请前往微信完成认证。如果已完成认证，请忽略该提示。',
        })
      }
    }).catch(function () {

    }).then(function () {
      wx.hideLoading()
    })
  },
  showService: function () {
    wx.navigateTo({
      url: '/pages/otherpage/otherpage?type=service',
    })
  }
})
