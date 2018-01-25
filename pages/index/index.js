//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
import { $wuxActionSheet } from '../../components/wux'

Page({
  data: {
    textRange: ['测试字符', '测试字符2'],
    userInfo: {},
    text: "我厉害吧",
    time: "30秒",
    timeValue: 30,
    setTime: "",
    tips: "0.00",
    items: [{
      name: '10秒',
      value: 10
    }, {
      name: '20秒',
      value: 20
    }, {
      name: '30秒',
      value: 30
    }],
    showModal: false,
    showResult: false,
    showCanvas: false,
    imageUrl: null,
    orderId: null
  },
  //事件处理函数
  onLoad: function (options) {

    // options.id = 8;
    if (options.id) {
      wx.redirectTo({
        url: '/pages/game/game?id=' + options.id,
      })
    }

    // wx.redirectTo({
    //   url: '/pages/hongbao/hongbao',
    // })
    // wx.switchTab({
    //   url: '/pages/rank/rank',
    // })
    // return;

    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  setTextValue: function (e) {
    this.setData({
      text: this.data.textRange[e.detail.value]
    })
  },
  setMoney: function (e) {
    this.setData({
      tips: e.detail.value * 0.03
    })
  },
  showSetTime: function () {
    this.setData({
      setTime: this.data.timeValue,
      showModal: true
    })
  },
  hideModal: function () {
    this.setData({
      showModal: false
    })
  },
  setTime: function (e) {
    this.setData({
      setTime: e.detail.value
    })
  },
  onCancel: function () {
    this.hideModal();
  },
  onConfirm: function () {
    this.setData({
      timeValue: this.data.setTime,
      time: this.data.setTime + "秒"
    })
    this.hideModal();
  },
  showError: function (message) {
    wx.showModal({
      title: '提示',
      content: message,
      showCancel: false,
      success: function () {

      }
    })
  },
  formSubmit: function (e) {
    const that = this;
    if (!e.detail.value.text) {
      this.showError('请输入要拼接的文字内容');
      return;
    }
    if (e.detail.value.text.length > 24) {
      this.showError('要拼接的文字内容不能超过24个字');
      return;
    }
    if ('' === e.detail.value.money) {
      this.showError('请输入总赏金');
      return;
    }
    if ('' === e.detail.value.number) {
      this.showError('请输入红包个数');
      return;
    }
    
    wx.showLoading({
      title: '提交中',
    })
    let data = e.detail.value;
    data.money = data.money * 100;
    data.time = data.time.replace('秒', '');
    app.request('/game/create', data).then(function (data) {   
      that.setData({
        orderId: data.orderid
      })  
      return that.pay(JSON.parse(data.para));
    }).then(function () {
      that.setData({
        // showResult: true,
        text: e.detail.value.text
      })
      return app.getSystemInfo()
    }).then(function () {
      return that.draw();
    }).then(function () {
      return that.saveCanvasToTempFilePath();
    }).then(function () {
      that.share();
      // that.setData({
      //   showCanvas: false
      // })
    }).catch(function () {
      console.log(arguments)
    }).then(function () {
      wx.hideLoading();
    })
  },
  pay: function (data) {
    return new Promise(function (resolve, reject) {
      // TODO
      resolve();
      // wx.requestPayment({
      //   ...data,
      //   success: function () {
      //     console.log(arguments)
      //   },
      //   fail: function () {
      //     reject();
      //   }
      // })
    }) 
  },
  hideResult: function () {
    this.setData({
      showResult: false
    })
  },
  share: function () {
    // wx.request({
    //   url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + app.globalData.authority.access_token,
    //   data: {
    //     scene: 'id=12',
    //     path: 'pages/index/index',
    //     width: 430
    //   },
    //   method: 'POST',
    //   success: function ({data}) {
    //     console.log(arguments)
    //   }
    // })

    const that = this;
    wx.showActionSheet({
      itemList: ['转发给朋友或群聊', '生成朋友圈图片', '我先领个试试'],
      success: function ({ tapIndex }) {
        switch (tapIndex) {
          case 0:
            wx.showShareMenu({
              success: function () {
                console.log("success")
              },
              fail: function () {
                console.log("fail")
              }
            })
          break;
          case 1:
            that.saveImageToPhotosAlbum().then(function () {

            }).catch(function () {});
          break;
          case 2:
          break;
        }
      }
    })
  },
  setText: function (context) {
    const text = this.data.text;
    const { windowWidth, windowHeight } = app.globalData.systemInfo;
    const fontSize = 24;
    context.setFontSize(fontSize);
    context.setFillStyle("#ffedbb");
    context.fillText(text, windowWidth / 2 - fontSize * text.length / 2, windowHeight * 0.7 * 0.7);
  },
  setUserAvatar: function (context) {

    const that = this;
    const { windowWidth, windowHeight } = app.globalData.systemInfo;
    const r = windowWidth / 8;
    return new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: that.data.userInfo.avatarUrl,
        success: function ({ path, height, width }) {
          context.save();
          context.beginPath()
          context.arc(windowWidth / 2, windowHeight * 0.2, r, 0, 2 * Math.PI)
          context.clip()
          context.drawImage(path, windowWidth / 2 - r, windowHeight * 0.2 - r, r * 2, r * 2);
          context.restore();

          resolve();
        }
      });
    })
  },
  draw: function () {
    this.setData({
      showCanvas: true
    })
    const that = this;
    const context = wx.createCanvasContext('canvasid', this);
    const path = '/assets/images/hongbao/1.png';
    const { windowWidth, windowHeight } = app.globalData.systemInfo;
    context.drawImage(path, 0, 0, windowWidth, windowHeight);

    return this.setUserAvatar(context).then(function () {
      that.setText(context);

      context.setFontSize(20);
      context.setFillStyle("#ffedbb");
      context.fillText("发了一个拼字有奖", windowWidth / 2 - 80, windowHeight * 0.35);

      context.draw();
    });
  },
  saveCanvasToTempFilePath: function () {
    const that = this;
    return new Promise(function (resolve, reject) {
      // 将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
      setTimeout(function () {
        wx.canvasToTempFilePath({
          canvasId: 'canvasid',
          success: function (res) {
            that.setData({
              imageUrl: res.tempFilePath
            });
            resolve();
          },
          fail: function (res) {
            console.log(res);
            reject();
          }
        });
      }, 200);     
    });
  },
  onShareAppMessage: function () {
    console.log("share")
    return {
      title: '自定义转发标题',
      path: '/pages/index/index?id=123',
      imageUrl: this.data.imageUrl,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  saveImageToPhotosAlbum: function () {
    return new Promise(function (resolve, reject) {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        }
      })
    });  
  }
})
