// pages/picture/picture.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: null,
    userInfo: null,
    windowWidth: 0,
    windowHeight: 0,
    contentHeight: 0,
    lineHeight: 30,
    title: '发送了一个拼字有奖',
    gameInfo: null,
    footer: '长按识别小程序，拼好字领奖金',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;

    this.setData({
      options: options,
    })

    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowWidth: res.windowWidth - 30,
          windowHeight: res.windowHeight - 60
        });
      }
    });

    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
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

    wx.showLoading({
      title: '图片生成中',
    })
    this.setData({
      gameInfo: wx.getStorageSync('game_info')
    })

    let charList = [];
    let chars = '';
    let charsNum = 0;
    for (let char of this.data.gameInfo.text) {
      if (charsNum === 9) {
        charList.push(chars);
        charsNum = 1;
        chars = char;
      } else {
        chars += char;
        charsNum ++;
      }
    }
    charList.push(chars);

    this.createImage(charList);
  },

  createImage: function (charList) {
    let ctx = wx.createCanvasContext('canvasid');
    let offsetHeight = 120;
    let avatarR = 40;
    let qrR = 60;
    let contentHeight = offsetHeight + avatarR * 2 + (charList.length + 2) * this.data.lineHeight + qrR * 2;

    let hLeft = this.data.windowWidth / 2 - avatarR;
    let qrLeft = (this.data.windowWidth / 2 - qrR);

    this.setData({ contentHeight });

    let height = avatarR * 2 + 30;

    ctx.drawImage('/assets/images/hongbao/2.png', 0, 0, this.data.windowWidth, this.data.contentHeight)

    this.drawCircleImg(ctx, this.data.userInfo.avatarUrl, hLeft, 10, avatarR).then(() => {

      this.drawFont(ctx, this.data.title, height);
      height += this.data.lineHeight;

      for (let chars of charList) {
        height += this.data.lineHeight;
        this.drawFont(ctx, chars, height, 24, '#ffedbb');
      }
      
      height += this.data.lineHeight;

      return this.drawCircleImg(ctx, this.data.gameInfo.qrcode, qrLeft, height, qrR)

    }).then(() => {
      height += qrR * 2 + this.data.lineHeight;
      this.drawFont(ctx, this.data.footer, height);
      ctx.draw();
    }).catch(function () {
      wx.showModal({
        title: '提示',
        content: '生成图片失败，请稍后再试',
      })
    }).then(() => {
      wx.hideLoading()
    })
  },

  drawCircleImg: function (ctx, src, x, y, r) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: ({ path }) => {

          let d = 2 * r;
          let cx = x + r;
          let cy = y + r;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, 2 * Math.PI);
          ctx.setStrokeStyle("#00FFFF");
          ctx.clip();
          ctx.drawImage(path, x, y, d, d);
          ctx.restore();

          resolve()
        }
      })
    })

  },

  drawFont: function (ctx, content, height, fontsize, color) {
    ctx.setFontSize(fontsize || 14);
    ctx.setFillStyle(color || '#ffffff');
    ctx.setTextAlign('center')
    ctx.fillText(content, this.data.windowWidth / 2, height);
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

  saveImageToPhotosAlbum: function () {
    wx.canvasToTempFilePath({
      canvasId: 'canvasid',
      success: function (res) {   
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: '已保存',
            })
          },
          fail: function () {
            wx.showModal({
              title: '提示',
              content: '保存图片失败',
            })
          }
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '保存图片失败',
        })
      }
    });
  },

  help() {
    wx.showModal({
      title: '说明',
      content: '将二维码图片保存到手机，发朋友圈时选择该图片即可',
    })
  }
})