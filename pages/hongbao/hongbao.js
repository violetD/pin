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
  onLoad: function () {

    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          clientHeight: res.windowHeight
        })
      }
    })
    var query = wx.createSelectorQuery().in(that);
    query.select('.swiper-tab').boundingClientRect(function (rect) {
      that.setData({
        swiperTabHeight: rect.height
      });

    }).exec()
    query.select('#meInfoView').boundingClientRect(function (rect) {
      that.setData({
        meScrollViewHeight: rect.height
      });
    }).exec()

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
    app.request("/game/getAllSummary").then((data) => {
      that.setData({
        totalMoney: (data.data.money / 100).toFixed(2),
        totalNumber: data.data.num,
      })
    }).catch(function () {}).then(function () {
      wx.hideLoading()
    })

    this.loadList()
  },
  swichNav: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.current
    })
  },
  loaded: false,
  bindChange: function (e) {
    this.setData({
      currentTab: e.detail.current
    })
    if (e.detail.current == 1) {
      const that = this
      if (this.loaded) return;
      this.loaded = true;
      wx.showLoading({
        title: '加载中',
      })
      app.request("/game/getRecieveSummary").then(function (data) {
        that.setData({
          totalRecieveMoney: (data.data.money / 100).toFixed(2),
          totalRecieveNumber: data.data.num,
        })
      }).catch(function () {
      }).then(function () {
        wx.hideLoading();
      });
      this.loadRecieveList();
    }
  },
  meStart: 0,
  meListPageSize: 10,
  meFinished: false,
  bindMeScroll: function (e) {
    if (this.meFinished) return;
    
    this.loadList();
  },
  loadList: function () {
    const that = this;

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
    }).catch(function () {

    }).then(function () {
    })
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
    wx.showLoading({
      title: '加载中',
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
    }).catch(function () {
    }).then(function () {
      wx.hideLoading();
    })
  }
})
