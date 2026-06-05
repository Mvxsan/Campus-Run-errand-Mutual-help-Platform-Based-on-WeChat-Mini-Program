Page({
  data: {
    totalIncome: 0,
    totalWithdrawal: 0,
    balance: 0,
    incomeRecords: [],
    withdrawalRecords: []
  },

  onLoad() {
    this.loadIncomeDetail()
  },

  onShow() {
    this.loadIncomeDetail()
  },

  loadIncomeDetail() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    wx.showLoading({ title: '加载中...' })

    wx.request({
      url: `http://localhost:8881/api/users/income-detail/${userInfo.id}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const data = res.data
          
          // 格式化收入记录
          const incomeRecords = (data.incomeRecords || []).map(record => ({
            id: record.id,
            taskTitle: record.taskTitle,
            amount: record.amount,
            time: this.formatTime(record.time)
          }))

          // 格式化提现记录
          const withdrawalRecords = (data.withdrawalRecords || []).map(record => ({
            id: record.id,
            amount: record.amount,
            time: this.formatTime(record.time)
          }))

          this.setData({
            totalIncome: data.totalIncome || 0,
            totalWithdrawal: data.totalWithdrawal || 0,
            balance: userInfo.balance || 0,
            incomeRecords: incomeRecords,
            withdrawalRecords: withdrawalRecords
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  formatTime(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0') + ' ' +
           String(date.getHours()).padStart(2, '0') + ':' +
           String(date.getMinutes()).padStart(2, '0')
  },

  navigateBack() {
    wx.navigateBack()
  }
})