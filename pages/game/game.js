//game.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
const mathHelper = require('../../utils/math.js')
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
      text: 'XXX',
      status: 0
    },
    words: [],
    resultWords: '',
    leftTime: 0,
    showShare: false,
    hasPlay: false,
    list: [],
    marginTop: '-250rpx',
    activity: false
  },
  //事件处理函数
  onLoad: function (options) {
    this.setData({
      options
    })

    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      //更新数据
      this.setData({
        userInfo
      })
    })  
  },

  onShow: function () {
    
    this.initGameInfo()
    this.initSendList()

    app.request('/api/ActivityIsOpen', {}).then((data) => {
      this.setData({
        activity: data.is_open == 1 ? 1 : 0
      })
    }).catch(() => {})
  },
  initSendList: function () {
    app.request('/game/getSendList', {
      game_id: this.data.options.id
    }).then((data) => {
      this.setData({
        list: data.list.map((item) => {
          return {
            ...item,
            formatTime: util.formatSimpleTime(item.create_time),
            formatMoney: (item.money / 100).toFixed(2)
          }
        })
      })
    }).catch(() => {})
  },
  resetModal (textLength) {
    this.setData({
      marginTop: '-' + ((textLength / 4) * 40 + 250) + 'rpx'
    })
  },
  initGameInfo: function () {
    app.request('/game/fetch', { id: this.data.options.id, game: 1 }).then((data) => {
      this.setData({
        gameInfo: data.game,
        hasPlay: data.has_play
      })
      if (data.game.text.length > 8) this.resetModal(data.game.text.length)
      if (this.data.options.share == 1) {
        this.showShare()
      } else {
        this.initGame()
      }
    }).catch(() => {
      this.setData({
        status: 2
      })
    })
  },
  initGame: function () {
    const game = this.data.gameInfo
    let words = []
    for (let i = 0; i < game.text.length; i++) {
      words.push({
        text: game.text[i],
        checked: false
      })
    }
    words.shuffle()
    game.money = (game.money / 100).toFixed(2)

    this.setData({
      status: this.data.hasPlay ? 2 : 1,
      leftTime: game.time,
      resultWords: '',
      words
    })
  },
  interval: null,
  showModal: function () {
    this.setData({
      showModal: true
    })

    this.interval = setInterval(() => {
      this.setData({
        leftTime: this.data.leftTime - 1
      })
      if (this.data.leftTime <= 0) {
        clearInterval(this.interval);
        wx.showToast({
          title: '超时啦',
          complete () {
            this.initGameInfo()
            this.hideModal()
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

    let key = 'words[' + e.target.dataset.index + '].checked'
    this.setData({
      resultWords: this.data.resultWords + this.data.words[e.target.dataset.index].text,
      [key]: true
    })
    if (this.data.words.length <= this.data.resultWords.length) {
      clearInterval(this.interval);
      this.interval = null;
      this.submit();
      this.hideModal();
    }
  },
  submit: function () {
    let message
    if (this.data.resultWords !== this.data.gameInfo.text) {
      message = '文字错啦，请重新拼字'
    }
    if (this.data.gameInfo.time - this.data.leftTime <= 0) {
      message = '超时啦，请重新拼字'
    }
    if (message) {
      return wx.showModal({
        title: '提示',
        content: message,
        complete: () => {
          this.initGameInfo()
        }
      })
    }

    app.request('/game/rush', {
      id: this.options.id,
      time: this.data.gameInfo.time - this.data.leftTime,
      text: this.data.resultWords
    }).then((data) => {
      wx.showModal({
        title: '中奖啦',
        content: '恭喜获得' + mathHelper.divide(data.money, 100) + '元红包',
        success: function () {
          app.clearMoney()
        }
      })
      this.initSendList()
    }).catch(function (err) {
      if (err && err.errmsg) {
        wx.showModal({
          title: '警告',
          content: err.errmsg,
        })
      }
    }).then(() => {
      this.initGameInfo()
    })
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
    this.initGame()
    this.setData({
      showShare: false
    })
  },

  picture: function () {
    wx.setStorageSync('game_info', this.data.gameInfo)
    wx.navigateTo({
      url: '/pages/picture/picture?id=' + this.options.id
    })
  },

  showActivity: function () {
    wx.navigateTo({
      url: '/pages/otherpage/otherpage?type=activity',
    })
  }
})
