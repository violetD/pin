//game.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
if (!Array.prototype.shuffle) {
  Array.prototype.shuffle = function () {
    for (var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    return this;
  };
}
Page({
  data: {
    options: null,
    userInfo: {},
    status: 0,
    showModal: false,
    gameInfo: {
      money: '0.00',
      number: 1,
      send_num: 0,
      text: 'XXX'
    },
    words: [],
    resultWords: '',
    leftTime: 0,
    showShare: false,
    hasPlay: false
  },
  //事件处理函数
  onLoad: function (options) {
    this.setData({
      options
    })

    var that = this
    //调用应用实例的方法获取全局数据
    wx.showLoading({
      title: '获取数据中',
    }) 
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

    this.initGameInfo();
  },
  initGameInfo: function () {
    const that = this;
    app.request('/game/fetch', { id: this.data.options.id, game: 1 }).then(function (data) {
      that.setData({
        gameInfo: data.game,
        hasPlay: data.has_play
      })
      if (that.data.options.share == 1) {
        that.showShare();
      } else {
        that.initGame();
      }
    }).catch(function () {
      that.setData({
        status: 2
      });
    }).then(function () {
      wx.hideLoading();
    });
  },
  initGame: function () {
    const game = this.data.gameInfo;
    let status = game.status == 1 ? 1 : game.status == 2 ? 3 : -1;
    let words = [];
    for (let i = 0; i < game.text.length; i++) {
      words.push({
        text: game.text[i],
        checked: false
      })
    }
    words.shuffle();
    game.money = (game.money / 100).toFixed(2);

    if (this.data.hasPlay) status = 4
    this.setData({
      status,
      leftTime: game.time,
      resultWords: '',
      words
    })
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
        wx.showToast({
          title: '超时啦',
          complete: () => {
            that.initGameInfo();
            that.hideModal();
          }
        })

      }
    }, 1000);
  },
  hideModal: function () {
    clearInterval(this.interval)
    this.initGameInfo()
    this.setData({
      showModal: false
    })
  },
  bindTap: function (e) {
    if (this.data.showModal === false) return;
    if (this.data.words[e.target.dataset.index].checked) return;

    var param = {
      resultWords: this.data.resultWords + this.data.words[e.target.dataset.index].text
    }
    var key = 'words[' + e.target.dataset.index + '].checked'
    param[key] = true
    this.setData(param)
    if (this.data.words.length <= this.data.resultWords.length) {
      clearInterval(this.interval);
      this.interval = null;
      this.submit();
      this.hideModal();
    }
  },
  submit: function () {
    if (this.data.resultWords !== this.data.gameInfo.text) {
      return wx.showModal({
        title: '提示',
        content: '文字错啦，请重新拼字',
        complete: () => {
          this.initGameInfo()
        }
      })
    }
    if (this.data.gameInfo.time - this.data.leftTime <= 0) {
      return wx.showModal({
        title: '提示',
        content: '超时啦，请重新拼字',
        complete: () => {
          this.initGameInfo()
        }
      })
    }

    wx.showLoading({
      title: '提交中',
    })   

    const that = this;

    app.request('/game/rush', {
      id: this.options.id,
      time: this.data.gameInfo.time - this.data.leftTime,
      text: this.data.resultWords
    }).then(function (data) {
      wx.showModal({
        title: '中奖啦',
        content: '恭喜获得' + (data.money / 100) + '元红包',
        success: function () {
          app.clearMoney()
        }
      })
    }).catch(function (err) {
      if (err && err.errmsg) {
        wx.showModal({
          title: '提示',
          content: err.errmsg,
        })
      }
    }).then(function () {
      that.initGameInfo();
      wx.hideLoading();
    });
  },
  showShare: function () {
    this.setData({
      showShare: true
    })
  },
  onShareAppMessage: function () {
    return {
      title: this.data.gameInfo.text,
      path: '/pages/index/index' + (this.data.options.id ? '?id=' + this.data.options.id : ''),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  play: function () {
    this.initGame();
    this.setData({
      showShare: false
    })
  },
  picture: function () {
    wx.setStorageSync('game_info', this.data.gameInfo);
    wx.navigateTo({
      url: '/pages/picture/picture?id=' + this.options.id
    });
  }
})
