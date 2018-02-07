//me.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    money: '0.00'
  },
  //事件处理函数
  onLoad: function () {
    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      //更新数据
      this.setData({
        userInfo: userInfo
      })
    })
  },
  onShow () {

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
    }).catch(() => {})
  }
})
