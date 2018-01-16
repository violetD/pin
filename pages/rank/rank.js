// rank.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    ranks: []
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

    this.setData({
      ranks: [{
        nickName: 'Sunshine',
        money: '3000',
        avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/zLF1pC6vRF38fUvvDgMG6I8rDYHiceOO2cFiaQvU7u0dpIicymrJc8jEPXpdoQfF4EevsFruqpExFIZvthibHqZ5PQ/0'
      }, {
        nickName: '小小鱼',
        money: '1000',
        avatarUrl: 'https://wx.qlogo.cn/mmopen/vi_32/zLF1pC6vRF38fUvvDgMG6I8rDYHiceOO2cFiaQvU7u0dpIicymrJc8jEPXpdoQfF4EevsFruqpExFIZvthibHqZ5PQ/0'
      }]
    })
  }
})
