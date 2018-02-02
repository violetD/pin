function formatTime(timestamp) {
  var date = new Date(timestamp*1000)
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  // var second = date.getSeconds()
  
  return [year, '年', month, '月', day, '日'].join('') + ' ' + [hour, minute].map(formatNumber).join(':')
}

function formatSimpleTime(timestamp) {
  var date = new Date(timestamp * 1000)
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  // var second = date.getSeconds()

  return [month, '-', day].join('') + ' ' + [hour, minute].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function testNumber(n) {
  return !!/^[0-9]*[1-9][0-9]*$/.exec(n.toString())
}

function testMoney(n) {
  return !!/^[0-9]+([.]\d{1,2})?$/.test(n.toString())
}

module.exports = {
  formatTime: formatTime,
  testNumber: testNumber,
  testMoney: testMoney,
  formatSimpleTime
}
