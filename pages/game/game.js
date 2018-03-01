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
    activity: false,
    top: '60%',
    left: 0,
    windowHeight: null,
    windowWidth: null,
    initPosData: null
  },
  //事件处理函数
  onLoad: function (options) {
    this.setData({
      options
    })

    var that = this
    //调用应用实例的方法获取全局数据
    
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })

    wx.getSystemInfo({
      success: ({ windowHeight, windowWidth }) => {
        this.setData({
          windowHeight,
          windowWidth
        })
      },
    })
    
  },
  onShow: function () {
    
    wx.showLoading({
      title: '获取数据中',
    })
    this.initGameInfo();
    this.initSendList();

    app.request('/api/ActivityIsOpen', {}).then((data) => {
      this.setData({
        activity: data.is_open == 1 ? 1 : 0
      })

      if (data.is_open == 1) {
        setTimeout(() => {
          let query = wx.createSelectorQuery()
          query.select('#button').boundingClientRect()
          query.exec((res) => {
            this.setData({
              initPosData: {
                ...res[0],
                left: 0
              },
              left: 0,
              top: res[0].top
            })
          })
        }, 300)
      }
      
    })
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
    })
  },
  resetModal (textLength) {
    this.setData({
      marginTop: '-' + ((textLength / 4) * 40 + 250) + 'rpx'
    })
  },
  initGameInfo: function () {
    const that = this;
    app.request('/game/fetch', { id: this.data.options.id, game: 1 }).then(function (data) {
      that.setData({
        gameInfo: data.game,
        hasPlay: data.has_play
      })
      if (data.game.text.length > 8) that.resetModal(data.game.text.length)
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
    let words = [];
    for (let i = 0; i < game.text.length; i++) {
      words.push({
        text: game.text[i],
        checked: false
      })
    }
    words.shuffle();
    game.money = (game.money / 100).toFixed(2);

    this.setData({
      status: this.data.hasPlay ? 2 : 1,
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
      that.initSendList()
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
  },
  showActivity: function () {
    wx.navigateTo({
      url: '/pages/otherpage/otherpage?type=activity',
    })
  },

  offsetLeft: 0,
  offsetTop: 0,
  startMove(e) {
    this.offsetLeft = e.changedTouches[0].pageX - this.data.left
    this.offsetTop = e.changedTouches[0].pageY - this.data.top
  },

  move: function (e) {

    const pos = e.changedTouches[0]
    if (pos.pageY - this.offsetTop >= 0 &&
      this.data.windowHeight >= pos.pageY + this.data.initPosData.height - this.offsetTop &&
      pos.pageX - this.offsetLeft >= 0 &&
      this.data.windowWidth >= pos.pageX + this.data.initPosData.width - this.offsetLeft
    ) {
      this.setData({
        top: (pos.pageY - this.offsetTop),
        left: (pos.pageX - this.offsetLeft)
      })
    }
  }
})
