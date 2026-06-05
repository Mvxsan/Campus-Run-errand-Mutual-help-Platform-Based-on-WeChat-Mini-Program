// index.js
const { requireLogin, sendMessageToBackend, checkUserStatus } = require('../../utils/auth')

Page({
  data: {
    taskList: [],
    filteredTaskList: [],
    searchKeyword: '',
    selectedTaskType: '', // 选中的任务类型
    taskTypes: ['取快递', '代买', '代取件', '代送'], // 任务类型列表
    loading: false,
    isLoggedIn: false,
    userInfo: null,
    activeRankingTab: 0, // 0: 任务完成榜, 1: 获赞榜
    taskCompletionRanking: [],
    likesRanking: [],
    refresherTriggered: false // 下拉刷新状态
  }, 
  onLoad() {
    // 检查登录状态
    console.log('首页加载，检查登录状态')
    this.checkLoginStatus()
    // 加载排行榜数据
    this.loadRankingData()
  },
  
  onShow() {
    // 每次页面显示时都检查登录状态
    console.log('首页显示，检查登录状态')
    this.checkLoginStatus()
  },
  
  checkLoginStatus() {
    // 检查用户是否被禁用
    if (!checkUserStatus()) {
      return
    }
    
    const userInfo = wx.getStorageSync('userInfo')
    console.log('获取到的用户信息:', userInfo)
    const token = wx.getStorageSync('token')
    console.log('获取到的token:', token)
    if (userInfo) {
      console.log('用户已登录，设置isLoggedIn为true')
      // 处理头像路径
      if (userInfo.avatar) {
        // 处理临时文件路径的头像
        if (userInfo.avatar.includes('http://tmp/') || userInfo.avatar.includes('_tmp_')) {
          userInfo.avatar = 'https://img.icons8.com/color/48/000000/user.png';
          console.log('处理临时文件路径的头像，使用默认头像');
        }
        // 处理相对路径的头像
        else if (userInfo.avatar.startsWith('/')) {
          if (userInfo.avatar.startsWith('/api/')) {
            userInfo.avatar = 'http://localhost:8881' + userInfo.avatar;
          } else {
            userInfo.avatar = 'http://localhost:8881/api' + userInfo.avatar;
          }
          console.log('处理相对路径的头像，构建完整URL:', userInfo.avatar);
        }
        // 更新本地存储
        wx.setStorageSync('userInfo', userInfo);
      }
      this.setData({ 
        isLoggedIn: true,
        userInfo: userInfo
      })
    } else {
      console.log('用户未登录，设置isLoggedIn为false')
      this.setData({ 
        isLoggedIn: false,
        userInfo: null
      })
    }
    // 无论是否登录，都加载任务列表
    this.loadTaskList()
  },
  
  loadTaskList() {
    // 从服务器获取任务列表
    wx.request({
      url: 'http://localhost:8881/api/tasks',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          // 处理后端返回的任务数据，只显示待接单和已接单的任务
          const processedTasks = res.data
            .filter(task => task.status === 0 || task.status === 1) // 只显示待接单(0)和已接单(1)的任务
            .sort((a, b) => {
              // 首先按状态排序，未接单的在前面
              if (a.status !== b.status) {
                return a.status - b.status;
              }
              // 然后按创建时间降序排序，最新发布的排在前面
              return new Date(b.createdAt) - new Date(a.createdAt);
            })
            .map(task => {
              // 转换状态码为状态名称
              let statusText = ''
              switch (task.status) {
                case 0:
                  statusText = '待接单'
                  break
                case 1:
                  statusText = '已接单'
                  break
                default:
                  statusText = '未知状态'
              }
              
              // 处理发布者的头像路径
              let publisherAvatar = null;
              if (task.publisher && task.publisher.avatar) {
                publisherAvatar = task.publisher.avatar;
                // 处理临时文件路径的头像
                if (publisherAvatar.includes('http://tmp/') || publisherAvatar.includes('_tmp_')) {
                  publisherAvatar = 'https://img.icons8.com/color/48/000000/user.png';
                }
                // 处理相对路径的头像
                else if (publisherAvatar.startsWith('/')) {
                  if (publisherAvatar.startsWith('/api/')) {
                    publisherAvatar = 'http://localhost:8881' + publisherAvatar;
                  } else {
                    publisherAvatar = 'http://localhost:8881/api' + publisherAvatar;
                  }
                }
              }
              
              // 处理创建时间格式，去掉T字
              let createdAt = task.createdAt || '';
              if (createdAt) {
                createdAt = createdAt.replace('T', ' ');
              }
              
              // 处理开始时间格式，去掉T字
              let startTime = task.startTime || '';
              if (startTime) {
                startTime = startTime.replace('T', ' ');
              }
              
              return {
                id: task.id,
                title: task.title || '未知任务',
                type: task.type || '未知类型',
                location: task.location || '未知地点',
                reward: task.reward || 0,
                time: createdAt,
                publisher: task.publisher ? task.publisher.nickname || '未知用户' : '未知用户',
                publisherId: task.publisher ? task.publisher.id : null,
                publisherAvatar: publisherAvatar,
                status: statusText,
                createdAt: createdAt
              }
            })
          
          this.setData({
            taskList: processedTasks
          })
          
          // 根据选中的任务类型和搜索关键词过滤任务列表
          this.filterTaskList()
        }
      }
    })
  },
  
  handleSearch(e) {
    const searchKeyword = e.detail.value
    console.log('搜索关键词:', searchKeyword)
    this.setData({
      searchKeyword
    })
    
    // 根据搜索关键词和选中的任务类型过滤任务列表
    this.filterTaskList()
  },

  // 选择任务类型
  selectTaskType(e) {
    const taskType = e.currentTarget.dataset.type
    const selectedTaskType = this.data.selectedTaskType === taskType ? '' : taskType
    console.log('选择任务类型:', selectedTaskType)
    this.setData({
      selectedTaskType
    })
    
    // 根据选中的任务类型和搜索关键词过滤任务列表
    this.filterTaskList()
  },

  // 过滤任务列表
  filterTaskList() {
    const { taskList, searchKeyword, selectedTaskType } = this.data
    let filteredTaskList = taskList
    
    // 根据任务类型过滤
    if (selectedTaskType) {
      filteredTaskList = filteredTaskList.filter(task => {
        return task.type === selectedTaskType
      })
    }
    
    // 根据搜索关键词过滤（同时搜索任务标题、类型、地点等）
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      filteredTaskList = filteredTaskList.filter(task => {
        return (task.title && task.title.toLowerCase().includes(keyword)) ||
               (task.type && task.type.toLowerCase().includes(keyword)) ||
               (task.location && task.location.toLowerCase().includes(keyword))
      })
    }
    
    this.setData({
      filteredTaskList
    })
  },
  
  navigateToPublish() {
    // 检查登录状态
    if (!requireLogin()) {
      return
    }
    
    wx.navigateTo({
      url: '../publish/publish'
    })
  },
  
  navigateToTaskDetail(e) {
    // 检查登录状态
    if (!requireLogin()) {
      return
    }
    
    const taskId = e.currentTarget.dataset.id
    console.log('navigateToTaskDetail() - taskId:', taskId)
    wx.navigateTo({
      url: '/pages/task-detail/task-detail?id=' + taskId,
      success: function(res) {
        console.log('navigateToTaskDetail() - 跳转成功:', res)
      },
      fail: function(res) {
        console.log('navigateToTaskDetail() - 跳转失败:', res)
      }
    })
  },
  
  handleAcceptTask(e) {
    // 检查登录状态
    if (!requireLogin()) {
      return
    }
    
    const taskId = e.currentTarget.dataset.id
    const userInfo = wx.getStorageSync('userInfo')
    
    // 查找任务信息，检查是否是自己发布的
    const task = this.data.taskList.find(t => t.id === taskId)
    if (task && task.publisherId === userInfo.id) {
      wx.showToast({ title: '不能接自己发布的任务', icon: 'none' })
      return
    }
    
    // 发送接单请求
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}/accept?acceptorId=${userInfo.id}`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200) {
          // 显示成功提示
          wx.showToast({ title: '接单成功', icon: 'success' })
          
          // 添加接单成功的通知消息
          console.log('index.js handleAcceptTask() - 添加接单成功的通知消息')
          const messagePage = getApp().globalData.messagePage
          console.log('index.js handleAcceptTask() - messagePage:', messagePage)
          const message = {
            title: '任务接单成功',
            body: `您已成功接取任务"${task.title}"，请及时处理。`,
            type: 1,
            orderStatus: 1
          }
          console.log('index.js handleAcceptTask() - 消息内容:', message)
          
          // 发送消息到后端存储到数据库
          sendMessageToBackend(message)
          
          if (messagePage) {
            // 如果消息页面已打开，直接添加消息
            console.log('index.js handleAcceptTask() - 消息页面已打开，直接添加消息')
            messagePage.addMessage(message)
          } else {
            // 如果消息页面未打开，将消息保存到本地存储
            console.log('index.js handleAcceptTask() - 消息页面未打开，将消息保存到本地存储')
            const pendingMessages = wx.getStorageSync('pendingMessages') || []
            console.log('index.js handleAcceptTask() - 之前的未显示消息数量:', pendingMessages.length)
            pendingMessages.push(message)
            console.log('index.js handleAcceptTask() - 之后的未显示消息数量:', pendingMessages.length)
            wx.setStorageSync('pendingMessages', pendingMessages)
            console.log('index.js handleAcceptTask() - 消息保存到本地存储成功')
          }
          
          // 重新加载任务列表
          setTimeout(() => {
            this.loadTaskList()
          }, 1000)
        } else {
          wx.showToast({ title: '接单失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      }
    })
  },
  
  navigateToLogin() {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  
  // 加载排行榜数据
  // 处理头像路径
  processAvatar(avatar) {
    if (!avatar) {
      return 'https://img.icons8.com/color/48/000000/user.png'
    }
    // 处理临时文件路径的头像
    if (avatar.includes('http://tmp/') || avatar.includes('_tmp_')) {
      return 'https://img.icons8.com/color/48/000000/user.png'
    }
    // 处理相对路径的头像
    if (avatar.startsWith('/')) {
      if (avatar.startsWith('/api/')) {
        return 'http://localhost:8881' + avatar
      } else {
        return 'http://localhost:8881/api' + avatar
      }
    }
    return avatar
  },
  
  loadRankingData() {
    // 加载任务完成榜
    wx.request({
      url: 'http://localhost:8881/api/reviews/ranking/task-completion',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          // 只显示前3名并处理头像
          const top3Data = res.data.slice(0, 3).map(user => ({
            ...user,
            avatar: this.processAvatar(user.avatar)
          }));
          this.setData({
            taskCompletionRanking: top3Data
          })
        }
      },
      fail: (err) => {
        console.error('加载任务完成榜失败:', err)
      }
    })
    
    // 加载获赞榜
    wx.request({
      url: 'http://localhost:8881/api/likes/ranking',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.ranking) {
          // 只显示前3名并处理头像
          const top3Data = res.data.ranking.slice(0, 3).map(user => ({
            ...user,
            avatar: this.processAvatar(user.avatar)
          }));
          this.setData({
            likesRanking: top3Data
          })
        }
      },
      fail: (err) => {
        console.error('加载获赞榜失败:', err)
      }
    })
  },
  
  // 切换排行榜标签
  switchRankingTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      activeRankingTab: index
    })
  },
  
  // 导航到排行榜页面
  navigateToRanking() {
    wx.navigateTo({
      url: '../ranking/ranking'
    })
  },
  
  // 导航到用户信息页面
  navigateToUserInfo(e) {
    // 检查登录状态
    if (!requireLogin()) {
      return
    }
    
    const userId = e.currentTarget.dataset.id
    const userName = e.currentTarget.dataset.name || ''
    console.log('navigateToUserInfo() - userId:', userId)
    console.log('navigateToUserInfo() - userName:', userName)
    wx.navigateTo({
      url: '/pages/user-info/user-info?userId=' + userId + '&userName=' + encodeURIComponent(userName),
      success: function(res) {
        console.log('navigateToUserInfo() - 跳转成功:', res)
      },
      fail: function(res) {
        console.log('navigateToUserInfo() - 跳转失败:', res)
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('开始下拉刷新')
    this.setData({ refresherTriggered: true })
    
    // 重新加载登录状态、任务列表和排行榜数据
    this.checkLoginStatus()
    this.loadTaskList()
    this.loadRankingData()
    
    // 模拟网络请求时间，然后结束刷新
    setTimeout(() => {
      this.setData({ refresherTriggered: false })
    }, 1000)
  }
})
