// hongbao.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    currentTab: 0,
    clientHeight: 400,
    swiperTabHeight: 100,
    scrollViewHeight: 200,
    me: {
      money: '0.00',
      number: 0,
      text: '加载中...',
      list: []
    },
    recieve: {
      money: '0.00',
      number: 0,
      text: '加载中...',
      list: []
    }
  },
  //事件处理函数
  onLoad () {

    const that = this
    wx.getSystemInfo({
      success (res) {
        that.setData({
          clientHeight: res.windowHeight
        })
      }
    })

    wx.createSelectorQuery().in(this)
      .select('.swiper-tab').boundingClientRect()
      .select('#meInfoView').boundingClientRect().exec((res) => {
      this.setData({
        swiperTabHeight: res[0].height,
        scrollViewHeight: res[1].height
      })
    })

    //调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      //更新数据
      this.setData({
        userInfo
      })
    })
  },

  onShow () {

    this.me = new PageList({
      sizeUrl: '/game/getAllSummary',
      sizeCallback: (data) => {
        this.setData({
          ['me.money']: (data.data.money / 100).toFixed(2),
          ['me.number']: data.data.num,
        })
      },
      dataUrl: '/game/getAll',
      dataCallback: (data) => {
        this.setData({
          ['me.list']: this.data.me.list.concat(data.list.map(function (item) {
            return {
              ...item,
              formatCreateTime: util.formatTime(item.create_time)
            }
          }))
        })
      },
      loading: (show) => {
        if (show) {
          this.setData({
            ['me.text']: '加载中...'
          })
        } else {
          this.setData({
            ['me.text']: '下拉加载更多'
          })
        }
      },
      finished: () => {
        if (this.data.me.number > 0) {
          this.setData({
            ['me.text']: '没有更多项目啦'
          })
        } else {
          this.setData({
            ['me.text']: '您还没有发过红包哦'
          })
        }
      }
    })
    this.me.fetchSize()

    this.recieve = new PageList({
      sizeUrl: '/game/getRecieveSummary',
      sizeCallback: (data) => {
        this.setData({
          ['recieve.money']: (data.data.money / 100).toFixed(2),
          ['recieve.number']: data.data.num,
        })
      },
      dataUrl: '/game/getRecieveList',
      dataCallback: (data) => {
        this.setData({
          ['recieve.list']: this.data.me.list.concat(data.list.map(function (item) {
            return {
              ...item,
              formatMoney: (item.money / 100).toFixed(2),
              formatCreateTime: util.formatTime(item.create_time)
            }
          }))
        })
      },
      loading: (show) => {
        if (show) {
          this.setData({
            ['recieve.text']: '加载中...'
          })
        } else {
          this.setData({
            ['recieve.text']: '下拉加载更多'
          })
        }
      },
      finished: () => {
        if (this.data.recieve.number > 0) {
          this.setData({
            ['recieve.text']: '没有更多项目啦'
          })
        } else {
          this.setData({
            ['recieve.text']: '您还没有收到红包哦'
          })
        }
      }
    })
  },
  // TODO
  scroll(e) {
    console.log(e)
    return
    this.me.fetchData()
  },
  bindRecieveScroll: function () {
    this.recieve.fetchData()
  },

  swichNav: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.current
    })
  },
  loaded: false,
  bindChange (e) {
    this.setData({
      currentTab: e.detail.current
    })
    if (e.detail.current == 1) {
      if (this.loaded) return
      this.loaded = true
      this.recieve.fetchSize()
    }
  }
})

class PageList {

  constructor (options) {
    this.options = options
    this.pageSize = options.pageSize || 10
    this.start = 0
    this.finished = false
    this.loading = false
  }

  fetchSize () {
    app.request(this.options.sizeUrl).then((data) => {
      this.fetchData()
      typeof this.options.sizeCallback === 'function' && this.options.sizeCallback(data)
    }).catch(() => {})
  }

  fetchData () {
    if (this.finished || this.loading) return
    this.loading = true
    typeof this.options.loading === 'function' && this.options.loading(true)
    app.request(this.options.dataUrl, {
      start: this.start,
      end: this.pageSize,
    }).then((data) => {
      typeof this.options.dataCallback === 'function' && this.options.dataCallback(data)
      this.start += this.pageSize
      this.loading = false
      typeof this.options.loading === 'function' && this.options.loading(false)
      if (data.list.length === 0 || data.list.length < this.pageSize) {
        typeof this.options.finished === 'function' && this.options.finished()
        this.finished = true
      }
    }).catch(() => {})
  }
}