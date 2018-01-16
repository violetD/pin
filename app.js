//app.js
App({
  onLaunch: function () {
    const that = this;

    wx.showLoading({
      title: '登录中',
    })

    wx.login({
      success: function (res) {
        if (res.code) {
          // 发起网络请求
          that.login(res.code).then(function () {
            wx.setStorageSync('local-sid', Math.random());
          }).catch(function () {
            wx.clearStorageSync('local-sid');
            wx.showModal({
              title: '警告',
              content: '登录失败，请查看网络状况，重新登录。',
            })
          }).then(function () {
            wx.hideLoading();
          });
          
        } else {
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，无法使用此功能。',
          })
          // console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });

  },

  login: function (code) {
    return new Promise(function (resolve, reject) {
      setTimeout(function() {
        resolve();
        // reject();
      }, 200);
    });
    // TODO
    return new Promise(function (resolve, reject) {
      wx.request({
        url: 'https://test.com/onLogin',
        data: {
          code: res.code
        },
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        }
      })
    });
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        },
        fail: function () {
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，无法使用此功能。',
          })
        }
      })
    }
  },

  request: function (url, data) {
    return new Promise(function (resolve, reject) {
      wx.request({
        url: url,
        data: data,
        success: function () {
          resolve();
        },
        fail: function () {
          reject();
        }
      })
    });
  },

  globalData: {
    userInfo: null
  }
})
