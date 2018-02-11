// hongbao.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')
Page({
  data: {
    userInfo: {},
    currentTab: 0,
    me: [],
    clientHeight: 400,
    swiperTabHeight: 100,
    meScrollViewHeight: 200,
    totalMoney: '0.00',
    totalNumber: 0,
    meLoadingText: '加载中。。。',
    meLoadingShow: false,
    totalRecieveMoney: '0.00',
    totalRecieveNumber: 0,
    recieve: [],
    recieveLoadingText: '加载中。。。',
    recieveLoadingShow: false,
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
        meScrollViewHeight: res[1].height
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

    app.request("/game/getAllSummary").then((data) => {
      this.setData({
        totalMoney: (data.data.money / 100).toFixed(2),
        totalNumber: data.data.num,
      })
    }).catch(function () { })

    this.loadList()
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
    console.log(e.detail)
    if (e.detail.current == 1) {
      if (this.loaded) return
      this.loaded = true
      app.request("/game/getRecieveSummary").then((data) => {
        this.setData({
          totalRecieveMoney: (data.data.money / 100).toFixed(2),
          totalRecieveNumber: data.data.num,
        })
      }).catch(() => {})
      this.loadRecieveList()
    }
  },
  meStart: 0,
  meListPageSize: 10,
  meFinished: false,
  bindMeScroll (e) {
    if (this.meFinished) return
    
    this.loadList()
  },
  loadList () {
    const that = this

    this.setData({
      meLoadingShow: true
    })
    
    app.request("/game/getAll", {
      start: this.meStart,
      end: this.meListPageSize,
    }).then((data) => {
      if (data.list.length === 0 || data.list.length < this.meListPageSize) {
        that.setData({
          meLoadingText: '已加载完'
        })
        that.meFinished = true;
      }
      that.setData({
        me: that.data.me.concat(data.list.map(function (item) {
          return {
            ...item,
            formatCreateTime: util.formatTime(item.create_time)
          }
        }))
      })
      this.meStart += this.meListPageSize;
    }).catch(function () {})
  },
  recieveStart: 0,
  recieveListPageSize: 10,
  recieveFinished: false,
  bindRecieveScroll: function () {
    if (this.recieveFinished) return;
    this.loadRecieveList();
  },
  loadRecieveList: function () {
    const that = this;

    this.setData({
      recieveLoadingShow: true
    })
    
    app.request("/game/getRecieveList", {
      start: this.recieveStart,
      end: this.recieveListPageSize,
    }).then(function (data) {
      that.setData({
        recieve: that.data.recieve.concat(data.list.map(function (item) {
          return {
            ...item,
            formatCreateTime: util.formatTime(item.create_time)
          }
        }))
      })
      that.recieveStart += that.recieveListPageSize;
      if (data.list.length === 0 || data.list.length < that.recieveListPageSize) {
        that.setData({
          recieveLoadingText: '已加载完'
        })
        that.recieveFinished = true;
      }
    }).catch(function () {})
  }
})
