Component({
  behaviors: [],
  properties: {
    width: {
      type: String,
    },
    height: {
      type: String,
    },
    initTop: {
      type: String,
      observer (newVal, oldVal) {
        if (newVal !== oldVal) {
          this._initPosTop(newVal)
        }
      }
    },
    initLeft: {
      type: String,
      observer (newVal, oldVal) {
        if (newVal !== oldVal) {
          this._initPosTop(newVal)
        }
      }
    }
  },

  // 私有数据，可用于模版渲染
  data: {
    left: 0,
    top: 0
  }, 

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached () {
    wx.getSystemInfo({
      success: ({ windowHeight, windowWidth }) => {
        this.windowHeight = windowHeight
        this.windowWidth = windowWidth
        this._initWidth()
        this._initHeight()
        this._initPosTop(this.properties.initTop)
        this._initPosLeft(this.properties.initLeft)
      }
    })
  },
  moved () {},
  detached () {},

  windowHeight: 0,
  windowWidth: 0,
  clientHeight: 0,
  clientWidth: 0,
  start: false,

  methods: {
    _initWidth () {
      let rpxPos = this.data.width.indexOf('rpx')
      let percentPos = this.data.width.indexOf('%')
      this.clientWidth = this.data.width
      if (rpxPos !== -1) {
        let x = this.data.width.substr(0, rpxPos)
        this.clientWidth = this.windowWidth / 750 * x
      } else if (percentPos !== -1) {
        let x = this.windowWidth * (this.data.width.substr(0, percentPos)) / 100
        this.clientWidth = x
      }
    },
    _initHeight () {
      let rpxPos = this.data.height.indexOf('rpx')
      let percentPos = this.data.height.indexOf('%')
      this.clientHeight = this.data.height
      if (rpxPos !== -1) {
        let y = this.data.height.substr(0, rpxPos)
        this.clientHeight = this.windowWidth / 750 * y
      } else if (percentPos !== -1) {
        let y = this.windowHeight * (this.data.height.substr(0, percentPos)) / 100
        this.clientHeight = y
      }
    },
    _initPosTop (top) {
      let rpxPos = top.indexOf('rpx')
      let percentPos = top.indexOf('%')
      if (percentPos !== -1) {
        top = top.substr(0, percentPos) * this.windowHeight / 100
      } else if (rpxPos !== -1) {
        top = this.windowWidth / 750 * top.substr(0, rpxPos)
      }
      if (top < 0) {
        top = 0
      }
      if (top > this.windowHeight - this.clientHeight) {
        top = this.windowHeight - this.clientHeight
      }
      this.setData({
        top
      })
    },
    _initPosLeft(left) {
      let rpxPos = left.indexOf('rpx')
      let percentPos = left.indexOf('%')
      if (percentPos !== -1) {
        left = left.substr(0, percentPos) * this.windowWidth / 100
      } else if (rpxPos !== -1) {
        left = this.windowWidth / 750 * left.substr(0, rpxPos)
      }
      if (left < 0) {
        left = 0
      }
      if (left > this.windowWidth - this.clientWidth) {
        left = this.windowWidth - this.clientWidth
      }
      this.setData({
        left
      })
    },
    startMove (e) {
      this.start = true
    },
    move (e) {
      if (!this.start) return
      const pos = e.changedTouches[0]

      let left = pos.pageX - (this.clientWidth / 2)
      let top = pos.pageY - (this.clientHeight / 2)

      if (left < 0) {
        left = 0
      } else if (left >= this.windowWidth - this.clientWidth) {
        left = this.windowWidth - this.clientWidth
      }

      if (top < 0) {
        top = 0
      } else if (top >= this.windowHeight - this.clientHeight) {
        top = this.windowHeight - this.clientHeight
      }

      this.setData({
        left,
        top
      })
    }
  }
})
