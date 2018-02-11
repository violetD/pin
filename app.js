//app.js
App({
  onLaunch: function () {
    this.globalData.passportInfo = wx.getStorageSync('local-sid');
    if (!this.globalData.passportInfo) {
      this.login().then(() => {}).catch(() => {})
    }
  },

  login: function () {
    const that = this;

    return new Promise(function (resolve, reject) {
      function login () {
        wx.showLoading({
          title: '登录中',
        })
        wx.login({
          success: function (res) {
            if (res.code) {
              // 发起网络请求
              that.thirdLogin(res.code).then(function (data) {
                wx.hideLoading();
                wx.setStorageSync('local-sid', data);
                resolve();
              }).catch(function () {
                wx.hideLoading();
                wx.clearStorageSync('local-sid');
                wx.showModal({
                  title: '警告',
                  content: '登录失败，请查看网络状况，重新登录。',
                })
                reject()
              });
            }
          }
        });
      }
      // 避免多次请求
      if (!that.globalData.login) {
        that.globalData.login = true
        login()
      // 反复检测登陆标识位
      } else {
        function tryLogin () {
          if (!that.globalData.finishLogin) {
            setTimeout(() => {
              tryLogin()
            }, 500)
          } else {
            if (that.globalData.passportInfo) {
              resolve()
            } else {
              reject()
            }
          }
        }
        return tryLogin()
      }
    })
  },
  thirdLogin: function (code) {
    const that = this;
    return new Promise((resolve, reject) => {
      this.getUserInfo(function (userInfo) {
        wx.request({
          url: that.globalData.requestUrl + '/login',
          data: {
            code,
            uname: userInfo.nickName,
            avatar: userInfo.avatarUrl
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
          },
          complete: function () {
            that.globalData.finishLogin = true
          }
        })
      })
    });
  },

  userInfoCallbacks: [],
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      if (typeof cb == "function") {
        this.userInfoCallbacks.push(cb)
      }
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          that.userInfoCallbacks.forEach((cb) => {
            cb(that.globalData.userInfo)
          })
          that.userInfoCallbacks = []
        },
        fail: function () {
          wx.showModal({
            title: '警告',
            content: '您点击了拒绝授权，无法使用此功能，点击确定重新获取授权。',
            success (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                      wx.getUserInfo({
                        success: function (res) {
                          that.globalData.userInfo = res.userInfo
                          that.userInfoCallbacks.forEach((cb) => {
                            cb(that.globalData.userInfo)
                          })
                          that.userInfoCallbacks = []
                        }
                      })
                    }
                  },
                  fail: function (res) {
                  }
                })
              }
            }
          })
          wx.hideLoading()
        }
      })
    }
  },

  request: function (path, params, method, errors) {
    const that = this;
    errors = errors || {}
    return new Promise((resolve, reject) => {
      if (path === '/game/create') {
        reject()
        return
      }
      this.login().then(() => {
        wx.showLoading({
          title: '加载中',
        })
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
                resolve(data)
              } else if (data.errno === -1) {
                wx.showModal({
                  title: '警告',
                  content: '该功能只能登陆后使用',
                })
                reject()
              } else {
                let message = errors[data.errno] || '系统异常，请联系客服'
                wx.showModal({
                  title: '警告',
                  content: message,
                });
                reject(data);
              }
            } else {
              wx.showModal({
                title: '警告',
                content: '您的网络有问题哦，请联网后再次请求',
              });
              reject();
            }
          },
          fail: function () {
            wx.showModal({
              title: '错误提示',
              content: '您的网络有问题哦，请联网后再次请求',
            })
            reject();
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }).catch(() => {
        reject()
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
          that.globalData.isAuthorization = data.status == 0 ? true : false;
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
    systemInfo: null,
    leftMoney: null,
    isAuthorization: false,
    login: false,
    finishLogin: false,
    requestUrl: 'https://moneyminiapp.guolaiwanba.com',
  }
})
