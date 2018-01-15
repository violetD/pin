// hongbao.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    currentTab: 0
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
  swichNav: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.current
    })
  },
  bindChange: function (e) {
console.log(e)
  }
})
