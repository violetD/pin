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

    wx.showLoading({
      title: '加载中',
    })

    app.getMoney().then(function (data) {
      that.setData({
        money: data
      })
    }).catch(function () {

    }).then(function () {
      wx.hideLoading()
    })
  }
})
