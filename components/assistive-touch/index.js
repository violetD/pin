Component({
  behaviors: [],
  properties: {
    // 属性名
    initPosLeft: {
      // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      type: Number,
      // 属性初始值（可选），如果未指定则会根据类型选择一个
      value: 0,
      // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
      observer: function (newVal, oldVal) {}
    },
    initPosTop: {
      type: Number,
      value: 0,
      observer: (newVal, oldVal) => {
      }
    },
    // 简化的定义方式
    className: String
  },

  // 私有数据，可用于模版渲染
  data: {
    left: 0,
    top: 0
  }, 

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {
    wx.getSystemInfo(({ windowHeight, windowWidth }) => {
      this.windowHeight = windowHeight
      this.windowWidth = windowWidth
    })
  },
  moved: function () {},
  detached: function () {},

  windowHeight: 0,
  windowWidth: 0,
  offsetLeft: 0,
  offsetTop: 0,

  methods: {
    onMyButtonTap: function () {
      // 更新属性和数据的方法与更新页面数据的方法类似
      this.setData({
      })
    },
    startMove: (e) => {
      this.offsetLeft = e.changedTouches[0].pageX - this.data.left
      this.offsetTop = e.changedTouches[0].pageY - this.data.top
    },
    move: function (e) {
      const pos = e.changedTouches[0]
      if (pos.pageY - this.offsetTop >= 0 &&
        this.windowHeight >= pos.pageY + this.initPosData.height - this.offsetTop &&
        pos.pageX - this.offsetLeft >= 0 &&
        this.windowWidth >= pos.pageX + this.initPosData.width - this.offsetLeft
      ) {
        this.setData({
          top: (pos.pageY - this.offsetTop),
          left: (pos.pageX - this.offsetLeft)
        })
      }
    },
    // 内部方法建议以下划线开头
    _myPrivateMethod: function () {
      this.replaceDataOnPath(['A', 0, 'B'], 'myPrivateData') // 这里将 data.A[0].B 设为 'myPrivateData'
      this.applyDataUpdates()
    },
    _propertyChange: function (newVal, oldVal) {
    }
  }
})
