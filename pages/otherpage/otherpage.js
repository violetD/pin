// pages/otherpage/otherpage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: null,
    pageSrc: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options,
      pageSrc: options.type === 'activity' ? 'https://moneyminiapp.guolaiwanba.com/api/ActivityService' : 'https://moneyminiapp.guolaiwanba.com/api/CustomService'
    })
  }
})