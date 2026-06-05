// order.js
Page({
  data: {
    activeTab: 0,
    orderList: [],
    allOrders: [],
    userInfo: null,
    isLoggedIn: false,
    isAdmin: false,
    refresherTriggered: false // 下拉刷新状态
  },
  
  onLoad() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ 
        userInfo: userInfo,
        isLoggedIn: true,
        isAdmin: userInfo.role === 1
      })
      // 加载订单列表
      this.loadOrders()
    } else {
      this.setData({ 
        userInfo: null,
        isLoggedIn: false,
        isAdmin: false
      })
    }
  },
  
  loadOrders() {
    // 获取当前登录用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.id) {
      this.setData({ allOrders: [], orderList: [] })
      return
    }
    
    // 显示加载提示
    wx.showLoading({ title: '加载中...' })
    
    // 构建请求数组
    const requests = [
      // 获取当前用户发布的任务列表
      new Promise((resolve) => {
        wx.request({
          url: `http://localhost:8881/api/tasks/publisher/${userInfo.id}`,
          method: 'GET',
          success: (taskRes) => {
            if (taskRes.statusCode === 200 && taskRes.data) {
              // 处理后端返回的任务数据，转换为订单格式
              const processedTasks = taskRes.data.map(task => {
                // 根据任务状态设置相应的状态名称和状态码
                let statusText = '未知状态'
                let statusCode = 0
                
                switch (task.status) {
                  case 0:
                    statusText = '待接单'
                    statusCode = 0
                    break
                  case 1:
                    statusText = '已接单'
                    statusCode = 1
                    break
                  case 2:
                    statusText = '已取货'
                    statusCode = 1
                    break
                  case 3:
                    statusText = '已送达'
                    statusCode = 1
                    break
                  case 4:
                    statusText = '待确认收货'
                    statusCode = 4
                    break
                  case 5:
                    if (task.cancelType === 2) {
                      statusText = '已禁止'
                      statusCode = 5
                    } else {
                      statusText = '已取消'
                      statusCode = 3
                    }
                    break
                  case 6:
                    statusText = '已完成'
                    statusCode = 2
                    break
                  default:
                    statusText = '未知状态'
                    statusCode = 3
                    break
                }
                
                // 处理发布者的头像路径
                let publisherAvatar = null;
                if (userInfo.avatar) {
                  publisherAvatar = userInfo.avatar;
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
                
                return {
                  id: `task_${task.id}`, // 使用前缀区分任务和订单
                  taskId: task.id, // 保存原始任务ID，用于去重
                  status: statusText,
                  statusCode: statusCode, // 对应订单的状态码
                  originalStatus: task.status, // 保存原始任务状态，用于权限检查
                  title: task.title || '未知任务',
                  location: task.location || '未知地点',
                  reward: task.reward || 0,
                  time: task.createdAt ? task.createdAt.replace('T', ' ') : '',
                  publisher: userInfo.nickname || '未知用户',
                  publisherAvatar: publisherAvatar,
                  publisherId: userInfo.id,
                  acceptorId: task.acceptor ? task.acceptor.id : null,
                  isTask: true // 标记为任务
                }
              })
              resolve(processedTasks)
            } else {
              resolve([])
            }
          },
          fail: () => resolve([])
        })
      }),
      
      // 获取当前用户作为接单人的任务列表
      new Promise((resolve) => {
        wx.request({
          url: `http://localhost:8881/api/tasks/acceptor/${userInfo.id}`,
          method: 'GET',
          success: (acceptorTaskRes) => {
            if (acceptorTaskRes.statusCode === 200 && acceptorTaskRes.data) {
              // 处理后端返回的任务数据，转换为订单格式
              const processedAcceptorTasks = acceptorTaskRes.data.map(task => {
                // 根据任务状态设置相应的状态名称和状态码
                let statusText = '未知状态'
                let statusCode = 0
                
                switch (task.status) {
                  case 0:
                    statusText = '待接单'
                    statusCode = 0
                    break
                  case 1:
                    statusText = '已接单'
                    statusCode = 1
                    break
                  case 2:
                    statusText = '已取货'
                    statusCode = 1
                    break
                  case 3:
                    statusText = '已送达'
                    statusCode = 1
                    break
                  case 4:
                    statusText = '待确认收货'
                    statusCode = 4
                    break
                  case 5:
                    if (task.cancelType === 2) {
                      statusText = '已禁止'
                      statusCode = 5
                    } else {
                      statusText = '已取消'
                      statusCode = 3
                    }
                    break
                  case 6:
                    statusText = '已完成'
                    statusCode = 2
                    break
                  default:
                    statusText = '未知状态'
                    statusCode = 3
                    break
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
                
                return {
                  id: `task_${task.id}`, // 使用前缀区分任务和订单
                  taskId: task.id, // 保存原始任务ID，用于去重
                  status: statusText,
                  statusCode: statusCode, // 对应订单的状态码
                  originalStatus: task.status, // 保存原始任务状态，用于权限检查
                  title: task.title || '未知任务',
                  location: task.location || '未知地点',
                  reward: task.reward || 0,
                  time: task.createdAt ? task.createdAt.replace('T', ' ') : '',
                  publisher: task.publisher ? task.publisher.nickname || '未知用户' : '未知用户',
                  publisherAvatar: publisherAvatar,
                  publisherId: task.publisher ? task.publisher.id : null,
                  acceptorId: userInfo.id,
                  isTask: true // 标记为任务
                }
              })
              resolve(processedAcceptorTasks)
            } else {
              resolve([])
            }
          },
          fail: () => resolve([])
        })
      })
    ]
    
    // 如果是管理员，添加获取所有任务的请求
    if (userInfo.role === 1) {
      requests.push(
        // 获取所有任务列表（系统管理员权限）
        new Promise((resolve) => {
          wx.request({
            url: 'http://localhost:8881/api/tasks',
            method: 'GET',
            success: (allTasksRes) => {
              if (allTasksRes.statusCode === 200 && allTasksRes.data) {
                // 处理后端返回的所有任务数据，转换为订单格式
                const processedAllTasks = allTasksRes.data.map(task => {
                  // 根据任务状态设置相应的状态名称和状态码
                  let statusText = '未知状态'
                  let statusCode = 0
                  
                  switch (task.status) {
                    case 0:
                      statusText = '待接单'
                      statusCode = 0
                      break
                    case 1:
                      statusText = '已接单'
                      statusCode = 1
                      break
                    case 2:
                      statusText = '已取货'
                      statusCode = 1
                      break
                    case 3:
                      statusText = '已送达'
                      statusCode = 1
                      break
                    case 4:
                      statusText = '待确认收货'
                      statusCode = 4
                      break
                    case 5:
                      if (task.cancelType === 2) {
                        statusText = '已禁止'
                        statusCode = 5
                      } else {
                        statusText = '已取消'
                        statusCode = 3
                      }
                      break
                    case 6:
                      statusText = '已确认收货'
                      statusCode = 2
                      break
                    default:
                      statusText = '未知状态'
                      statusCode = 3
                      break
                  }
                  
                  // 处理发布者的头像路径
                  let publisherAvatar = null;
                  if (task.publisher && task.publisher.avatar) {
                    publisherAvatar = task.publisher.avatar;
                    // 去掉/api前缀，确保路径正确
                    if (publisherAvatar.startsWith('/api')) {
                      publisherAvatar = publisherAvatar.substring(4);
                    }
                  }
                  
                  return {
                  id: `task_${task.id}`, // 使用前缀区分任务和订单
                  taskId: task.id, // 保存原始任务ID，用于去重
                  status: statusText,
                  statusCode: statusCode, // 对应订单的状态码
                  originalStatus: task.status, // 保存原始任务状态，用于权限检查
                  title: task.title || '未知任务',
                  location: task.location || '未知地点',
                  reward: task.reward || 0,
                  time: task.createdAt ? task.createdAt.replace('T', ' ') : '',
                  publisher: task.publisher ? task.publisher.nickname || '未知用户' : '未知用户',
                  publisherAvatar: publisherAvatar,
                  publisherId: task.publisher ? task.publisher.id : null,
                  acceptorId: task.acceptor ? task.acceptor.id : null, // 使用任务真正的接单人ID
                  isTask: true // 标记为任务
                }
                })
                resolve(processedAllTasks)
              } else {
                resolve([])
              }
            },
            fail: () => resolve([])
          })
        })
      )
    }
    
    // 并行执行所有请求
    Promise.all(requests).then((results) => {
      // 提取所有任务数据
      let publishedTasks = results[0]
      let acceptedTasks = results[1]
      let allTasks = results[2] || []
      
      // 合并所有任务
      let allOrders = [...publishedTasks, ...acceptedTasks, ...allTasks]
      
      // 去重：确保每个任务只显示一次，优先保留接单人视角的任务，其次是管理员视角的任务
      const taskIdMap = new Map()
      allOrders.forEach(order => {
        if (order.isTask && order.taskId) {
          // 优先顺序：接单人视角 > 发布人视角 > 管理员视角
          if (!taskIdMap.has(order.taskId) || 
              acceptedTasks.some(t => t.taskId === order.taskId) ||
              (publishedTasks.some(t => t.taskId === order.taskId) && !acceptedTasks.some(t => t.taskId === order.taskId))) {
            taskIdMap.set(order.taskId, order)
          }
        } else {
          // 非任务订单直接添加
          taskIdMap.set(order.id, order)
        }
      })
      
      // 转换为数组
      const uniqueOrders = Array.from(taskIdMap.values())
      
      // 更新页面数据
      this.setData({
        allOrders: uniqueOrders,
        orderList: this.filterOrders(uniqueOrders, this.data.activeTab, this.data.isAdmin)
      })
      
      // 隐藏加载提示
      wx.hideLoading()
    }).catch(() => {
      // 隐藏加载提示
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    })
  },
  
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    this.setData({
      activeTab: index,
      orderList: this.filterOrders(this.data.allOrders || [], index, this.data.isAdmin)
    })
  },
  
  filterOrders(orders, tabIndex, isAdmin) {
    switch (tabIndex) {
      case 0: // 待接单
        return orders.filter(order => order.statusCode === 0)
      case 1: // 进行中（包含待确认收货的订单）
        return orders.filter(order => order.statusCode === 1 || order.statusCode === 4)
      case 2: // 已完成
        return orders.filter(order => order.statusCode === 2)
      case 3: // 已禁止（仅管理员）或全部（普通用户）
        return isAdmin ? orders.filter(order => order.statusCode === 5) : orders
      case 4: // 全部（管理员）
        return orders
      default:
        return orders
    }
  },
  
  navigateToOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../task-detail/task-detail?id=' + orderId
    })
  },
  
  handleCancelOrder(e) {
    const orderId = e.currentTarget.dataset.id
    // 提取任务ID（去除task_前缀）
    const taskId = orderId.replace('task_', '')
    
    // 获取当前用户信息
    const userInfo = this.data.userInfo
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    // 查找订单信息
    const order = this.data.allOrders.find(item => item.id === orderId)
    if (!order) {
      wx.showToast({ title: '订单不存在', icon: 'none' })
      return
    }
    
    // 只有待接单和已接单的任务才能取消
    // 已取货、已送达、已完成、已确认收货的任务不能取消
    if (order.statusCode !== 0 && order.statusCode !== 1) {
      wx.showToast({ title: '该订单状态不允许取消', icon: 'none' })
      return
    }
    
    // 检查原始任务状态，确保已取货的任务不能取消
    const originalTaskStatus = order.originalStatus || 0;
    if (originalTaskStatus >= 2) {
      wx.showToast({ title: '任务已取货，不能取消', icon: 'none' })
      return
    }
    
    // 判断用户角色：发布者还是接单人
    const isPublisher = order.publisherId && order.publisherId == userInfo.id
    const isAcceptor = order.acceptorId && order.acceptorId == userInfo.id
    
    // 根据角色设置不同的提示和接口
    let title = '取消订单'
    let content = '确定要取消此订单吗？'
    let apiUrl = `http://localhost:8881/api/tasks/${taskId}/cancel`
    let successMessage = '取消成功'
    
    if (isAcceptor) {
      // 接单人取消接单
      title = '取消接单'
      content = '确定要取消接单吗？任务将重新回到任务列表供他人接单。'
      apiUrl = `http://localhost:8881/api/tasks/${taskId}/cancel-accept`
      successMessage = '取消接单成功'
    }
    
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: apiUrl,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: successMessage,
                  icon: 'success',
                  duration: 1500
                })
                
                if (isAcceptor) {
                  // 接单人取消接单后跳转到首页（任务列表页）
                  setTimeout(() => {
                    wx.switchTab({
                      url: '/pages/index/index'
                    })
                  }, 1500)
                } else {
                  // 发布者取消订单后刷新订单列表
                  // 添加取消订单成功的通知消息
                  const messagePage = getApp().globalData.messagePage
                  const message = {
                    title: '订单已取消',
                    body: `您的订单已成功取消。`,
                    type: 1,
                    orderStatus: 3
                  }
                  
                  if (messagePage) {
                    messagePage.addMessage(message)
                  } else {
                    const pendingMessages = wx.getStorageSync('pendingMessages') || []
                    pendingMessages.push(message)
                    wx.setStorageSync('pendingMessages', pendingMessages)
                  }
                  
                  // 重新加载订单列表
                  this.loadOrders()
                }
              } else {
                wx.showToast({
                  title: '取消失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  handleCompleteOrder(e) {
    const orderId = e.currentTarget.dataset.id
    // 提取任务ID（去除task_前缀）
    const taskId = orderId.replace('task_', '')
    
    wx.showModal({
      title: '确认完成',
      content: '确定要确认此订单已完成吗？',
      success: (res) => {
        if (res.confirm) {
          // 确认完成任务请求
          wx.request({
            url: `http://localhost:8881/api/tasks/${taskId}/complete`,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '确认成功',
                  icon: 'success'
                })
                
                // 添加确认完成的通知消息
                const messagePage = getApp().globalData.messagePage
                if (messagePage) {
                  messagePage.addMessage({
                    title: '订单已完成',
                    body: `您的订单已确认完成，感谢您的使用。`,
                    type: 1,
                    orderStatus: 4
                  })
                }
                
                // 跳转到评价页面
                setTimeout(() => {
                  wx.navigateTo({
                    url: `../review/review?taskId=${taskId}`
                  })
                }, 1500)
              } else {
                wx.showToast({
                  title: '确认失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  handleConfirmOrder(e) {
    const orderId = e.currentTarget.dataset.id
    // 提取任务ID（去除task_前缀）
    const taskId = orderId.replace('task_', '')
    
    wx.showModal({
      title: '确认收货',
      content: '确定要确认此订单已收货吗？',
      success: (res) => {
        if (res.confirm) {
          // 确认收货任务请求
          wx.request({
            url: `http://localhost:8881/api/tasks/${taskId}/confirm`,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '确认收货成功',
                  icon: 'success'
                })
                
                // 添加确认收货的通知消息
                const messagePage = getApp().globalData.messagePage
                if (messagePage) {
                  messagePage.addMessage({
                    title: '订单已确认收货',
                    body: `您的订单已确认收货，感谢您的使用。`,
                    type: 1,
                    orderStatus: 6
                  })
                }
                
                // 重新加载订单列表
                setTimeout(() => {
                  this.loadOrders()
                }, 1000)
              } else {
                wx.showToast({
                  title: '确认失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  navigateToLogin() {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  
  navigateToPublish() {
    wx.navigateTo({
      url: '../publish/publish'
    })
  },

  // 管理员禁止订单
  handleBanOrder(e) {
    const orderId = e.currentTarget.dataset.id
    // 提取任务ID（去除task_前缀）
    const taskId = orderId.replace('task_', '')
    
    // 查找订单信息
    const order = this.data.allOrders.find(item => item.id === orderId)
    if (!order) {
      wx.showToast({ title: '订单不存在', icon: 'none' })
      return
    }
    
    // 检查订单状态，已确认收货的订单不能禁止
    if (order.originalStatus === 6) {
      wx.showToast({ title: '已确认收货的订单不能禁止', icon: 'none' })
      return
    }
    
    wx.showModal({
      title: '禁止订单',
      content: '确定要禁止此订单吗？',
      success: (res) => {
        if (res.confirm) {
          // 禁止订单请求
          wx.request({
            url: `http://localhost:8881/api/tasks/${taskId}/disable`,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '禁止成功',
                  icon: 'success'
                })
                
                // 添加禁止订单成功的通知消息
                const messagePage = getApp().globalData.messagePage
                const message = {
                  title: '订单已禁止',
                  body: `您的订单已被管理员禁止。`,
                  type: 1,
                  orderStatus: 5
                }
                
                if (messagePage) {
                  // 如果消息页面已打开，直接添加消息
                  messagePage.addMessage(message)
                } else {
                  // 如果消息页面未打开，将消息保存到本地存储
                  const pendingMessages = wx.getStorageSync('pendingMessages') || []
                  pendingMessages.push(message)
                  wx.setStorageSync('pendingMessages', pendingMessages)
                }
                
                // 重新加载订单列表
                this.loadOrders()
              } else {
                wx.showToast({
                  title: '禁止失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 管理员恢复订单
  handleRestoreOrder(e) {
    const orderId = e.currentTarget.dataset.id
    const taskId = orderId.replace('task_', '')
    
    wx.showModal({
      title: '恢复订单',
      content: '确定要恢复此订单吗？恢复后订单将重新进入任务列表供他人接单。',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `http://localhost:8881/api/tasks/${taskId}/restore`,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({
                  title: '恢复成功',
                  icon: 'success'
                })
                
                // 添加恢复订单成功的通知消息
                const messagePage = getApp().globalData.messagePage
                const message = {
                  title: '订单已恢复',
                  body: `您的订单已被管理员恢复，现在可以被他人接单。`,
                  type: 1,
                  orderStatus: 0
                }
                
                if (messagePage) {
                  messagePage.addMessage(message)
                } else {
                  const pendingMessages = wx.getStorageSync('pendingMessages') || []
                  pendingMessages.push(message)
                  wx.setStorageSync('pendingMessages', pendingMessages)
                }
                
                // 重新加载订单列表
                this.loadOrders()
              } else {
                wx.showToast({
                  title: res.data || '恢复失败',
                  icon: 'none'
                })
              }
            },
            fail: () => {
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('开始下拉刷新')
    this.setData({ refresherTriggered: true })
    
    // 检查登录状态并重新加载订单列表
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ 
        userInfo: userInfo,
        isLoggedIn: true,
        isAdmin: userInfo.role === 1
      })
      this.loadOrders()
    } else {
      this.setData({ 
        userInfo: null,
        isLoggedIn: false,
        isAdmin: false
      })
    }
    
    // 模拟网络请求时间，然后结束刷新
    setTimeout(() => {
      this.setData({ refresherTriggered: false })
    }, 1000)
  }
})