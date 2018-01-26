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
    this.setData({
      gameInfo: wx.getStorageSync('game_info')
    })

    let charList = [];
    let chars = '';
    let charsNum = 0;
    for (let char of this.data.gameInfo.text) {
      if (charsNum === 19) {
        charList.push(chars);
        charsNum = 1;
        chars = char;
      } else {
        chars += char;
        charsNum ++;
      }
    }
    charList.push(chars);

    this.createImage(10, charList);
  },

  createImage: function (lineNum, charList) {
    let ctx = wx.createCanvasContext('canvasid');
    let offsetHeight = 120;
    let contentHeight = lineNum * this.data.lineHeight + offsetHeight + 20;

    let avatarR = 40;
    let hLeft = this.data.windowWidth / 2 - avatarR;

    let qrR = 60;
    let qrLeft = (this.data.windowWidth / 2 - qrR);

    this.setData({ contentHeight });
    this.drawSquare(ctx, offsetHeight + this.data.lineHeight * charList.length + avatarR + qrR * 2);


    this.drawCircleImg(ctx, this.data.userInfo.avatarUrl, hLeft, 10, avatarR);
    this.drawFont(ctx, this.data.title, offsetHeight);

    let height = offsetHeight + 20;
    for (let chars of charList) {
      height += this.data.lineHeight;
      this.drawFont(ctx, chars, height, 24, '#ffedbb');
    }

    this.drawCircleImg(ctx, this.data.userInfo.avatarUrl, qrLeft, height + qrR + 20, qrR);

    this.drawFont(ctx, this.data.footer, height + qrR * 2 + 120);

    ctx.draw();
  },

  drawCircleImg: function (ctx, src, x, y, r) {
    let d = 2 * r;
    let cx = x + r;
    let cy = y + r;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.setStrokeStyle("#00FFFF");
    ctx.clip();
    ctx.drawImage(src, x, y, d, d);
    ctx.restore();
  },

  drawSquare: function (ctx, begin) {
    let halfLineWidth = 4;
    let lineWidth = halfLineWidth * 2;
    ctx.save();
    ctx.beginPath();
    ctx.strokeRect(0, 0, this.data.windowWidth, this.data.contentHeight);
    ctx.rect(halfLineWidth, halfLineWidth, this.data.windowWidth - lineWidth, this.data.contentHeight - lineWidth);
    ctx.setFillStyle('#B31800');
    ctx.fill();
    ctx.closePath();

    // 半弧
    let x = this.data.windowWidth - halfLineWidth;
    let cx = x / 2;
    let h = 30;
    let r = (cx * cx - h * h) / (2 * h);
    let cy = begin - r;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.setFillStyle('#d93c2b');
    ctx.fill();
    ctx.closePath();

    // 外层框
    ctx.beginPath();
    ctx.setStrokeStyle('#e7c41f');
    ctx.setLineWidth(lineWidth);
    ctx.strokeRect(0, 0, this.data.windowWidth, this.data.contentHeight);

    ctx.restore();
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
      title: this.gameInfo.text,
      path: '/pages/index/index' + (this.options.id ? '?id=' + this.options.id : ''),
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
            console.log(arguments)
          }
        })
      },
      fail: function (res) {
        console.log(arguments)
      }
    });
  },

  share: function () {
    wx.showShareMenu({
      
    })
  }
})