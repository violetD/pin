// pages/questions/questions.js

const app = getApp()
const { questions } = require('./data')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.setData({
      questions: questions.map((item) => {
        
        return {
          ...item,
          hidden: true
        }
      })
    })
  },

  bindTap (e) {
    const key = 'questions[' + e.currentTarget.dataset.index + '].hidden';
    this.setData({
      [key]: !this.data.questions[e.currentTarget.dataset.index].hidden
    })
  },

  showService () {
    wx.navigateTo({
      url: '/pages/otherpage/otherpage?type=service',
    })
  }
})