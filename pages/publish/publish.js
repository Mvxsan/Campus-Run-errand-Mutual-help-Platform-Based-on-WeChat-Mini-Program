// publish.js
const { requireLogin, canPublishTask, requirePermission, sendMessageToBackend, checkUserStatus } = require('../../utils/auth')

Page({
  data: {
    // 任务基本信息
    title: '',
    selectedType: '取快递',
    taskTypes: ['取快递', '代买', '代取件', '代送'],
    
    // 地点信息
    startLocation: '',
    endLocation: '',
    commonLocations: [],
    
    // 时间信息
    selectedTimeOption: 'asap', // asap: 尽快, today: 今日内, custom: 自定义
    timeOptions: [
      { label: '尽快', value: 'asap' },
      { label: '今日内', value: 'today' }
    ],
    startTime: '',
    endTime: '',
    startTimeText: '请选择开始时间',
    endTimeText: '请选择结束时间',
    startDate: '',
    startTimeValue: '',
    endDate: '',
    endTimeValue: '',
    startDateText: '请选择日期',
    endDateText: '请选择日期',
    minDate: '',
    maxDate: '',
    
    // 报酬信息
    reward: '',
    
    // 其他信息
    description: '',
    
    // 帮助弹窗
    showHelpModal: false
  },
  
  onLoad() {
    // 检查用户状态
    if (!checkUserStatus()) {
      return
    }
    
    // 检查登录状态
    if (!requireLogin()) {
      // 延迟执行，确保requireLogin的跳转逻辑先执行
      setTimeout(() => {
        wx.navigateBack()
      }, 100)
      return
    }
    
    // 检查发布任务权限
    if (!requirePermission(canPublishTask(), '您没有发布任务的权限')) {
      // 延迟执行，确保requirePermission的提示逻辑先执行
      setTimeout(() => {
        wx.navigateBack()
      }, 100)
      return
    }
    
    // 设置时间选择器的起始和结束时间（使用字符串格式，符合picker的date模式要求）
    const now = new Date()
    const minDate = this.formatDate(now)
    const maxDate = this.formatDate(new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000))
    
    // 设置默认时间为当前时间和2小时后
    const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    const startDate = this.formatDate(now)
    const startTimeValue = this.formatTimeValue(now)
    const endDateValue = this.formatDate(endDate)
    const endTimeValue = this.formatTimeValue(endDate)
    
    // 加载常用地点
    this.loadCommonLocations()
    
    this.setData({
      minDate,
      maxDate,
      startDate,
      startTimeValue,
      endDate: endDateValue,
      endTimeValue,
      startTime: this.combineDateTime(startDate, startTimeValue),
      endTime: this.combineDateTime(endDateValue, endTimeValue),
      startTimeText: startTimeValue,
      endTimeText: endTimeValue,
      startDateText: startDate,
      endDateText: endDateValue
    })
  },
  
  // 加载常用地点
  loadCommonLocations() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) return
    
    // 从本地存储获取常用地点
    const commonLocations = wx.getStorageSync('commonLocations') || []
    if (commonLocations.length > 0) {
      this.setData({
        commonLocations: commonLocations.slice(0, 3) // 最多显示3个
      })
    } else {
      // 如果没有常用地点，使用默认地点
      this.setData({
        commonLocations: ['宿舍', '教学楼', '快递点']
      })
    }
  },
  
  // 保存地点到常用地点
  saveLocationToCommon(location) {
    if (!location) return
    
    let commonLocations = wx.getStorageSync('commonLocations') || []
    
    // 如果地点已存在，先移除
    commonLocations = commonLocations.filter(loc => loc !== location)
    
    // 添加到开头
    commonLocations.unshift(location)
    
    // 只保留最多5个常用地点
    commonLocations = commonLocations.slice(0, 5)
    
    // 保存到本地存储
    wx.setStorageSync('commonLocations', commonLocations)
    
    // 更新页面显示
    this.setData({
      commonLocations: commonLocations.slice(0, 3)
    })
  },
  
  // 任务标题输入
  handleTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },
  
  // 任务类型选择
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type
    })
    
    // 根据任务类型智能推荐地点
    this.recommendLocations(type)
  },
  
  // 智能推荐地点
  recommendLocations(type) {
    let recommendedLocations = ['宿舍', '教学楼', '快递点', '食堂', '图书馆']
    
    if (type === '取快递') {
      recommendedLocations = ['快递点', '菜鸟驿站', '宿舍', '教学楼']
    } else if (type === '代买') {
      recommendedLocations = ['食堂', '超市', '便利店', '宿舍']
    } else if (type === '代取件') {
      recommendedLocations = ['快递点', '菜鸟驿站', '宿舍', '教学楼']
    } else if (type === '代送') {
      recommendedLocations = ['宿舍', '教学楼', '图书馆', '食堂']
    }
    
    this.setData({
      commonLocations: recommendedLocations
    })
  },
  
  // 起点输入
  handleStartLocationInput(e) {
    const location = e.detail.value
    this.setData({
      startLocation: location
    })
    // 保存到常用地点
    this.saveLocationToCommon(location)
  },
  
  // 终点输入
  handleEndLocationInput(e) {
    const location = e.detail.value
    this.setData({
      endLocation: location
    })
    // 保存到常用地点
    this.saveLocationToCommon(location)
  },
  
  // 获取当前位置
  getCurrentLocation(e) {
    const type = e.currentTarget.dataset.type
    
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        const latitude = res.latitude
        const longitude = res.longitude
        
        // 逆地理编码获取地址
        wx.chooseLocation({
          latitude,
          longitude,
          success: (locationRes) => {
            if (type === 'start') {
              this.setData({ startLocation: locationRes.name })
            } else {
              this.setData({ endLocation: locationRes.name })
            }
          },
          fail: () => {
            wx.showToast({
              title: '获取位置失败，请手动输入',
              icon: 'none'
            })
          }
        })
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败，请手动输入',
          icon: 'none'
        })
      }
    })
  },
  
  // 选择常用地点
  selectCommonLocation(e) {
    const location = e.currentTarget.dataset.location
    
    // 如果起点为空，优先填充起点
    if (!this.data.startLocation) {
      this.setData({ startLocation: location })
    } else if (!this.data.endLocation) {
      this.setData({ endLocation: location })
    } else {
      // 起点终点都已填写，询问用户
      wx.showModal({
        title: '选择地点',
        content: '请选择要填充的位置',
        confirmText: '起点',
        cancelText: '终点',
        success: (res) => {
          if (res.confirm) {
            this.setData({ startLocation: location })
          } else if (res.cancel) {
            this.setData({ endLocation: location })
          }
        }
      })
    }
  },
  
  // 时间选项选择
  selectTimeOption(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ selectedTimeOption: value })
    
    // 设置默认时间（使用字符串格式）
    if (value === 'asap') {
      const now = new Date()
      const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2小时后
      const startDate = this.formatDate(now)
      const startTimeValue = this.formatTimeValue(now)
      const endDateValue = this.formatDate(endDate)
      const endTimeValue = this.formatTimeValue(endDate)
      
      this.setData({
        startDate,
        startTimeValue,
        endDate: endDateValue,
        endTimeValue,
        startTime: this.combineDateTime(startDate, startTimeValue),
        endTime: this.combineDateTime(endDateValue, endTimeValue),
        startTimeText: startTimeValue,
        endTimeText: endTimeValue,
        startDateText: '尽快',
        endDateText: this.formatDate(endDate)
      })
    } else if (value === 'today') {
      const now = new Date()
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      const startDate = this.formatDate(now)
      const startTimeValue = this.formatTimeValue(now)
      const endDateValue = this.formatDate(endDate)
      const endTimeValue = '23:59'
      
      this.setData({
        startDate,
        startTimeValue,
        endDate: endDateValue,
        endTimeValue,
        startTime: this.combineDateTime(startDate, startTimeValue),
        endTime: this.combineDateTime(endDateValue, endTimeValue),
        startTimeText: startTimeValue,
        endTimeText: endTimeValue,
        startDateText: '今日',
        endDateText: '今日'
      })
    }
  },
  
  // 开始日期选择
  handleStartDateChange(e) {
    const startDate = e.detail.value
    this.setData({
      startDate,
      startDateText: startDate,
      startTime: this.combineDateTime(startDate, this.data.startTimeValue)
    })
  },
  
  // 开始时间选择
  handleStartTimeChange(e) {
    const startTimeValue = e.detail.value
    this.setData({
      startTimeValue,
      startTimeText: startTimeValue,
      startTime: this.combineDateTime(this.data.startDate, startTimeValue)
    })
  },
  
  // 结束日期选择
  handleEndDateChange(e) {
    const endDate = e.detail.value
    this.setData({
      endDate,
      endDateText: endDate,
      endTime: this.combineDateTime(endDate, this.data.endTimeValue)
    })
  },
  
  // 结束时间选择
  handleEndTimeChange(e) {
    const endTimeValue = e.detail.value
    
    // 检查是否选择深夜
    const hour = parseInt(endTimeValue.split(':')[0])
    if (hour >= 22 || hour <= 6) {
      wx.showModal({
        title: '提示',
        content: '您选择的时间为深夜时段，接单率较低，是否确认？',
        success: (res) => {
          if (res.confirm) {
            this.setData({
              endTimeValue,
              endTimeText: endTimeValue,
              endTime: this.combineDateTime(this.data.endDate, endTimeValue)
            })
          }
        }
      })
    } else {
      this.setData({
        endTimeValue,
        endTimeText: endTimeValue,
        endTime: this.combineDateTime(this.data.endDate, endTimeValue)
      })
    }
  },
  
  // 报酬输入
  handleRewardInput(e) {
    const reward = e.detail.value
    this.setData({ reward })
    
    // 实时反馈报酬水平
    this.checkRewardLevel(reward)
  },
  
  // 报酬滑块调整
  handleRewardSlider(e) {
    const reward = e.detail.value
    this.setData({ reward })
    
    // 实时反馈报酬水平
    this.checkRewardLevel(reward)
  },
  
  // 检查报酬水平
  checkRewardLevel(reward) {
    if (reward < 5) {
      wx.showToast({
        title: '报酬低于平均水平，可能影响接单率',
        icon: 'none',
        duration: 2000
      })
    } else if (reward > 15) {
      wx.showToast({
        title: '报酬高于平均水平，接单率较高',
        icon: 'none',
        duration: 2000
      })
    }
  },
  
  // 描述输入
  handleDescriptionInput(e) {
    this.setData({
      description: e.detail.value
    })
  },
  
  // 日期格式化（用于picker的date模式）
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  
  // 时间格式化（用于picker的time模式）
  formatTimeValue(date) {
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
  },
  
  // 组合日期和时间为完整的datetime字符串
  combineDateTime(date, time) {
    return `${date} ${time}:00`
  },
  
  // 格式化显示时间
  formatDateTime(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`
  },
  
  formatTime(time) {
    const date = new Date(time)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    return `${year}-${month}-${day} ${hour}:${minute}`
  },
  
  // 显示帮助弹窗
  showHelp() {
    this.setData({ showHelpModal: true })
  },
  
  // 关闭帮助弹窗
  closeHelp() {
    this.setData({ showHelpModal: false })
  },
  
  // 取消发布
  handleCancel() {
    wx.showModal({
      title: '取消发布',
      content: '确定要取消发布任务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  },
  
  // 发布任务
  handlePublish() {
    const { title, selectedType, startLocation, endLocation, selectedTimeOption, startTime, endTime, reward, description } = this.data
    
    // 表单验证
    if (!title) {
      wx.showToast({ title: '请输入任务标题', icon: 'none' })
      return
    }
    
    if (!startLocation || !endLocation) {
      wx.showToast({ title: '请输入起点和终点', icon: 'none' })
      return
    }
    
    if (!reward) {
      wx.showToast({ title: '请输入任务报酬', icon: 'none' })
      return
    }
    
    if (!startTime || !endTime) {
      wx.showToast({ title: '请选择任务时间', icon: 'none' })
      return
    }
    
    // 时间校验
    const now = new Date()
    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    
    if (startDate < now) {
      wx.showToast({ title: '开始时间不能早于当前时间', icon: 'none' })
      return
    }
    
    if (endDate <= startDate) {
      wx.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' })
      return
    }
    
    // 获取当前登录用户信息
    const userInfo = wx.getStorageSync('userInfo')
    
    // 准备发布任务请求
    wx.request({
      url: 'http://localhost:8881/api/tasks',
      method: 'POST',
      data: {
        title,
        description,
        type: selectedType,
        location: `${startLocation} → ${endLocation}`,
        reward: parseFloat(reward),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        publisher: {
          id: userInfo.id
        }
      },
      success: (res) => {
        // 检查响应是否成功
        if (res.statusCode === 200 && res.data.id) {
          wx.showToast({
            title: '发布成功',
            icon: 'success'
          })
          
          // 添加发布任务成功的通知消息
          const messagePage = getApp().globalData.messagePage
          const message = {
            title: '任务发布成功',
            body: `您发布的任务"${title}"已成功发布，等待其他用户接单。`,
            type: 1,
            orderStatus: 0
          }
          
          // 发送消息到后端存储到数据库
          sendMessageToBackend(message)
          
          if (messagePage) {
            // 如果消息页面已打开，直接添加消息
            messagePage.addMessage(message)
          } else {
            // 如果消息页面未打开，将消息保存到本地存储
            const pendingMessages = wx.getStorageSync('pendingMessages') || []
            pendingMessages.push(message)
            wx.setStorageSync('pendingMessages', pendingMessages)
          }
          
          // 跳转到首页
          setTimeout(() => {
            wx.switchTab({ url: '../index/index' })
          }, 1000)
        } else {
          wx.showToast({
            title: '发布失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      }
    })
  }
})