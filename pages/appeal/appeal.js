// pages/appeal/appeal.js

const app = getApp()
const { reasons } = require('./data')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    reasons: [],
    options: null,
    reason: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ options, reasons })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  handleChange(e) {
    this.setData({
      reason: e.detail.value
    })
  },

  handleSubmit() {
    if (!this.data.reason) {
      return wx.showModal({
        title: '提示',
        content: '请选择投诉原因',
      })
    }

    app.request('/api/Report', {
      'reason': this.data.reason,
      'game_id': this.data.options.id
    }).then(() => {
      wx.showModal({
        title: '提示',
        content: '提交成功，感谢您的反馈',
      })
    })
  }
})