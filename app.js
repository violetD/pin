//app.js
App({
  onLaunch: function () {
    this.globalData.passportInfo = wx.getStorageSync('local-sid');
    if (!this.globalData.passportInfo) {
      this.login();
    }
  },

  login: function () {
    const that = this;

    wx.showLoading({
      title: '登录中',
    })

    return new Promise(function (resolve, reject) {
      // 避免多次请求
      if (that.globalData.tryLogin) reject();
      that.globalData.tryLogin = true;
      wx.login({
        success: function (res) {
          if (res.code) {
            // 发起网络请求
            wx.request({
              url: 'https://api.weixin.qq.com/cgi-bin/token',
              data: {
                appid: 'wxf0706f4278bb92c8',
                secret: 'eb42ad3459a11fcf831cfca331a3e3db',
                grant_type: 'client_credential'
              },
              method: 'GET',
              dataType: 'json',
              success: function ({ data }) {
                that.globalData.authority = data
              }
            })
            that.thirdLogin(res.code).then(function (data) {
              wx.setStorageSync('local-sid', data);
              resolve();
            }).catch(function () {
              wx.clearStorageSync('local-sid');
              wx.showModal({
                title: '警告',
                content: '登录失败，请查看网络状况，重新登录。',
              })
              reject();
            }).then(function () {
              wx.hideLoading();
            });

          } else {
            wx.showModal({
              title: '警告',
              content: '您点击了拒绝授权，无法使用此功能。',
            })
            wx.hideLoading();
            reject();
          }
        }
      });
    })
  },
  thirdLogin: function (code) {
    const that = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: that.globalData.requestUrl + '/login',
        data: {
          code
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        success: function ({ statusCode, data }) {
          if (statusCode === 200 && data.errno === 0) {
            that.globalData.passportInfo = data;
            resolve(data);
          } else {
            reject();
          }
        },
        fail: function () {
          reject();
        }
      })
    });
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo && this.globalData.passportInfo) {
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

  request: function (path, params, method, showCommonError) {
    const that = this;
    showCommonError = showCommonError || 1
    return new Promise(function (resolve, reject) {
      wx.request({
        url: that.globalData.requestUrl + path + '?token=' + (that.globalData.passportInfo ? that.globalData.passportInfo.token : ''),
        data: params,
        method: method || 'GET',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function ({ statusCode, data }) {
          if (statusCode === 200) {
            if (data.errno === 0) {
              resolve(data);
            } else if (data.errno === -1) {
              // 重新登录
              that.login().then(function () {
                that.request(path, params, method).then(function (data) {
                  resolve(data);
                }).catch(function () {
                  reject();
                });
              }).catch(function () {
                reject();
              });
            } else {
              wx.showModal({
                title: '错误提示',
                content: '网络错误',
              });
              reject(data);
            }
          } else {
            wx.showModal({
              title: '错误提示',
              content: '网络错误',
            });
            reject();
          }      
        },
        fail: function () {
          reject();
        }
      })
    });
  },

  getSystemInfo: function () {
    const that = this;
    return new Promise(function (resolve, reject) {
      if (null !== that.globalData.systemInfo) {
        resolve();
      } else {
        wx.getSystemInfo({
          success: function (res) {
            that.globalData.systemInfo = res;
            resolve();
          },
          fail: function (res) {
            reject();
          }
        })
      }
    })
  },
  getMoney: function () {
    const that = this;
    return new Promise(function (resolve, reject) {
      if (null !== that.globalData.leftMoney) {
        resolve(that.globalData.leftMoney)
      } else {
        that.request('/pay/get_info').then(function (data) {
          that.globalData.leftMoney = (data.money / 100).toFixed(2);
          resolve(that.globalData.leftMoney)

        }).catch(function () {
          reject();
        })
      }     
    })
  },
  clearMoney () {
    this.globalData.leftMoney = null
  },
  globalData: {
    userInfo: null,
    passportInfo: null,
    authority: null,
    systemInfo: null,
    tryLogin: false,
    leftMoney: null,
    requestUrl: 'https://moneyminiapp.guolaiwanba.com',
  }
})
