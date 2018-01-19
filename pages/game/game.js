//game.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    enabled: true,
    showModal: false,
    words: [{
      text: '吧',
      checked: false
    }, {
      text: '厉',
      checked: true
    }, {
      text: '我',
      checked: true
    }, {
      text: '害',
      checked: false
    }, {
      text: '们',
      checked: false
    }],
    resultWords: '厉我',
    leftTime: 10
  },
  //事件处理函数
  onLoad: function (id) {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

    wx.showLoading({
      title: '获取数据中',
    })
    app.request('', {}).then(function () {
      console.log('set data')
    }).catch(function () {
      console.log('error')
    }).then(function () {
      wx.hideLoading();
    });
  },
  interval: null,
  showModal: function () {
    const that = this;
    this.setData({
      showModal: true
    })

    this.interval = setInterval(function () {
      that.setData({
        leftTime: that.data.leftTime - 1
      })
      if (that.data.leftTime <= 0) {
        clearInterval(that.interval);
        console.log('out time')
      }
    }, 1000);
  },
  hideModal: function () {
    this.setData({
      showModal: false
    })
  },
  bindTap: function (e) {
    if (this.data.words[e.target.dataset.index].checked) return;
    var param = {
      resultWords: this.data.resultWords + this.data.words[e.target.dataset.index].text
    }
    var key = 'words[' + e.target.dataset.index + '].checked'
    param[key] = true
    this.setData(param)
    if (this.data.words.length <= this.data.resultWords.length) {
      this.submit();
    }
  },
  submit: function () {
    wx.showLoading({
      title: '提交中',
    })

    app.request('', {}).then(function () {
      console.log('done')
    }).catch(function () {
      console.log('error')
    }).then(function () {
      wx.hideLoading();
    });
  }
})
