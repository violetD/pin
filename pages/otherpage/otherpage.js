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
      pageSrc: options.type === 'activity' ? 'https://mp.weixin.qq.com/s/0hyYBSqAOEg7o5rqH_94Pw' : 'https://mp.weixin.qq.com/s/0hyYBSqAOEg7o5rqH_94Pw'
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
  
  }
})