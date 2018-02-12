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
  onLoad (options) {
    this.setData({ options, reasons })
  },

  handleChange (e) {
    this.setData({
      reason: e.detail.value
    })
  },

  handleSubmit () {
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
        complete: () => {
          wx.navigateBack({
            
          })
        }
      })
    })
  }
})