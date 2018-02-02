// pages/questions/questions.js

const app = getApp()
const { questions } = require('./data')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [],
    top: '60%',
    left: 0,
    windowHeight: null,
    windowWidth: null,
    initPosData: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      questions: questions.map(function (item) {
        
        return {
          ...item,
          hidden: true
        }
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let query = wx.createSelectorQuery()
    query.select('#button').boundingClientRect()
    query.exec((res) => {
      this.setData({
        initPosData: res[0],
        left: res[0].left,
        top: res[0].top
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  bindTap: function (e) {
    const key = 'questions[' + e.currentTarget.dataset.index + '].hidden';
    this.setData({
      [key]: !this.data.questions[e.currentTarget.dataset.index].hidden
    })
  },

  offsetLeft: 0,
  offsetTop: 0,
  startMove (e) {
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