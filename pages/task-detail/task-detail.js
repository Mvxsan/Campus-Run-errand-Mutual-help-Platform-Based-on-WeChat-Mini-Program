// task-detail.js
const { requireLogin, checkUserStatus } = require('../../utils/auth')

Page({
  data: {
    task: {},
    taskStatus: '',
    statusColor: '',
    canAccept: false,
    canCancelAccept: false,
    canPickup: false,
    canDeliver: false,
    canComplete: false,
    canConfirm: false,
    canReview: false,
    actionText: '',
    loading: false,
    isAdmin: false,
    reviews: []
  },
  
  onLoad(options) {
    // 获取任务 ID
    const taskId = options.id
    console.log('task-detail.js onLoad() - taskId:', taskId)
    if (!taskId) {
      wx.showToast({ title: '任务 ID 不存在', icon: 'none' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
      return
    }
    
    // 保存任务ID
    this.setData({
      taskId: taskId
    })
    
    // 获取任务详情
    this.loadTaskDetail(taskId)
  },
  
  onShow() {
    // 检查用户状态
    if (!checkUserStatus()) {
      return
    }
    
    // 页面显示时重新加载评价数据
    console.log('onShow被调用，当前task:', this.data.task);
    console.log('onShow被调用，当前taskId:', this.data.taskId);
    if (this.data.task && this.data.task.id) {
      console.log('使用task.id加载评价数据:', this.data.task.id);
      this.loadTaskReviews(this.data.task.id)
    } else if (this.data.taskId) {
      console.log('使用taskId加载任务详情:', this.data.taskId);
      this.loadTaskDetail(this.data.taskId)
    }
  },
  
  // 加载任务详情
  loadTaskDetail(taskId) {
    // 从本地存储获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    console.log('loadTaskDetail() - userInfo:', userInfo)
    
    // 检查userInfo是否存在
    if (!userInfo) {
      console.log('loadTaskDetail() - userInfo不存在，跳转到登录页面')
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    
    // 处理taskId格式，移除前缀
    const cleanTaskId = String(taskId).replace('task_', '')
    console.log('loadTaskDetail() - cleanTaskId:', cleanTaskId)
    
    // 发送请求获取任务详情
    wx.request({
      url: `http://localhost:8881/api/tasks/${cleanTaskId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const task = res.data
          
          // 处理发布者的头像路径
          if (task.publisher && task.publisher.avatar) {
            let publisherAvatar = task.publisher.avatar;
            if (publisherAvatar.startsWith('/')) {
              if (publisherAvatar.startsWith('/api/')) {
                task.publisher.avatar = 'http://localhost:8881' + publisherAvatar;
              } else {
                task.publisher.avatar = 'http://localhost:8881/api' + publisherAvatar;
              }
              console.log('处理发布者相对路径的头像，构建完整URL:', task.publisher.avatar);
            }
          }
          
          // 处理接单人的头像路径
          if (task.acceptor && task.acceptor.avatar) {
            let acceptorAvatar = task.acceptor.avatar;
            if (acceptorAvatar.startsWith('/')) {
              if (acceptorAvatar.startsWith('/api/')) {
                task.acceptor.avatar = 'http://localhost:8881' + acceptorAvatar;
              } else {
                task.acceptor.avatar = 'http://localhost:8881/api' + acceptorAvatar;
              }
              console.log('处理接单人相对路径的头像，构建完整URL:', task.acceptor.avatar);
            }
          }
          
          // 设置任务状态
          let taskStatus = ''
          let statusColor = ''
          switch (task.status) {
            case 0:
              taskStatus = '待接单'
              statusColor = '#1890ff'
              break
            case 1:
              taskStatus = '已接单'
              statusColor = '#faad14'
              break
            case 2:
              taskStatus = '已取货'
              statusColor = '#722ed1'
              break
            case 3:
              taskStatus = '已送达'
              statusColor = '#52c41a'
              break
            case 4:
              taskStatus = '已完成'
              statusColor = '#8c8c8c'
              break
            case 5:
              if (task.cancelType === 2) {
                taskStatus = '已禁止'
              } else {
                taskStatus = '已取消'
              }
              statusColor = '#ff4d4f'
              break
            case 6:
              taskStatus = '已确认收货'
              statusColor = '#52c41a'
              break
            default:
              taskStatus = '未知状态'
              statusColor = '#8c8c8c'
          }
          
          // 格式化时间
          const startTime = this.formatTime(task.startTime)
          const endTime = this.formatTime(task.endTime)
          
          // 判断用户是否可以执行操作
          let canAccept = false
          let canCancelAccept = false
          let canPickup = false
          let canDeliver = false
          let canComplete = false
          let canConfirm = false
          let canReview = false
          let actionText = ''
          
          // 只有任务发布者和接单人可以执行操作
          const isPublisher = task.publisher && task.publisher.id == userInfo.id
          const isAcceptor = task.acceptor && task.acceptor.id == userInfo.id
          
          if (task.status === 0) {
            // 待接单状态
            if (!isPublisher && !(userInfo.phone === 'admin' && userInfo.role === 1)) {
              // 非发布者且不是预设管理员admin可以接单
              canAccept = true
            } else {
              // 发布者或预设管理员admin看到的提示
              actionText = '任务发布中'
            }
          } else if (task.status === 1) {
            // 已接单状态
            if (isAcceptor) {
              // 接单人可以取消接单或标记为已取货
              canCancelAccept = true
              canPickup = true
              actionText = '等待取货'
            } else if (isPublisher) {
              // 发布者看到的提示
              actionText = '任务已被接单'
            }
          } else if (task.status === 2) {
            // 已取货状态
            if (isAcceptor) {
              // 接单人可以标记为已送达
              canDeliver = true
              actionText = '等待送达'
            } else if (isPublisher) {
              // 发布者看到的提示
              actionText = '任务已取货'
            }
          } else if (task.status === 3) {
            // 已送达状态
            if (isAcceptor) {
              // 接单人可以标记为已完成
              canComplete = true
              actionText = '等待完成确认'
            } else if (isPublisher) {
              // 发布者看到的提示
              actionText = '任务已送达'
            }
          } else if (task.status === 4) {
            // 已完成状态
            if (isPublisher) {
              // 发布者可以确认收货
              canConfirm = true
            } else {
              // 其他人看到的提示
              actionText = '任务已完成'
            }
            // 已完成状态，双方都可以评价
            if (isPublisher || isAcceptor) {
              canReview = true
            }
          } else if (task.status === 5) {
            // 已取消状态
            actionText = '任务已取消'
          } else if (task.status === 6) {
            // 已确认收货状态
            actionText = '任务已确认收货'
            // 已确认收货状态，双方都可以评价
            if (isPublisher || isAcceptor) {
              canReview = true
            }
          }
          
          // 检查是否是管理员
          const isAdmin = userInfo.role === 1
          
          // 更新页面数据
          this.setData({
            task,
            taskStatus,
            statusColor,
            startTime,
            endTime,
            canAccept,
            canCancelAccept,
            canPickup,
            canDeliver,
            canComplete,
            canConfirm,
            canReview,
            actionText,
            isAdmin
          })
          
          // 加载评价数据（如果任务已完成）
          if (task.status >= 4) {
            this.loadTaskReviews(task.id)
          }
        } else {
          wx.showToast({ title: '获取任务详情失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      }
    })
  },
  
  // 接单
  handleAcceptTask() {
    const taskId = this.data.task.id
    const userInfo = wx.getStorageSync('userInfo')
    
    // 检查是否是自己发布的任务
    if (this.data.task.publisher && this.data.task.publisher.id === userInfo.id) {
      wx.showToast({ title: '不能接自己发布的任务', icon: 'none' })
      return
    }
    
    this.setData({ loading: true })
    
    // 发送接单请求
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}/accept?acceptorId=${userInfo.id}`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '接单成功', icon: 'success' })
          
          // 添加接单成功的通知消息
          const messagePage = getApp().globalData.messagePage
          const message = {
            title: '任务已接单',
            body: `您已成功接取任务，准备开始执行。`,
            type: 1,
            orderStatus: 1
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
          
          // 重新加载任务详情
          setTimeout(() => {
            this.loadTaskDetail(taskId)
          }, 1000)
        } else {
          wx.showToast({ title: '接单失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  // 标记为已取货
  handlePickupTask() {
    const taskId = this.data.task.id
    
    this.setData({ loading: true })
    
    // 发送已取货请求
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}/pickup`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          wx.showToast({ title: '标记已取货成功', icon: 'success' })
          
          // 添加已取货的通知消息
          const messagePage = getApp().globalData.messagePage
          const message = {
            title: '任务已取货',
            body: `您已成功标记任务为已取货，正在前往目的地。`,
            type: 1,
            orderStatus: 2
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
          
          // 重新加载任务详情
          setTimeout(() => {
            this.loadTaskDetail(taskId)
          }, 1000)
        } else {
          wx.showToast({ title: '标记已取货失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  // 标记为已送达
  handleDeliverTask() {
    const taskId = this.data.task.id
    
    this.setData({ loading: true })
    
    // 发送已送达请求
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}/deliver`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '送达成功', icon: 'success' })
          
          // 添加送达成功的通知消息
                const messagePage = getApp().globalData.messagePage
                const message = {
                  title: '任务已完成',
                  body: `您已成功送达，任务已完成。`,
                  type: 1,
                  orderStatus: 4
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
          
          // 重新加载任务详情
          setTimeout(() => {
            this.loadTaskDetail(taskId)
          }, 1000)
        } else {
          wx.showToast({ title: '送达失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  // 取消接单
  handleCancelAccept() {
    const taskId = this.data.task.id
    
    this.setData({ loading: true })
    
    // 发送取消接单请求
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}/cancel-accept`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          wx.showToast({ 
            title: '取消接单成功', 
            icon: 'success',
            duration: 1500
          })
          // 取消接单成功后，跳转到首页（任务列表页），让任务可以被其他人接单
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            })
          }, 1500)
        } else {
          wx.showToast({ title: '取消接单失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  // 完成任务
  handleCompleteTask() {
    const taskId = this.data.task.id
    
    this.setData({ loading: true })
    
    // 发送完成任务请求
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}/complete`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          wx.showToast({ title: '任务完成成功', icon: 'success' })
          // 重新加载任务详情
          setTimeout(() => {
            this.loadTaskDetail(taskId)
          }, 1000)
        } else {
          wx.showToast({ title: '任务完成失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  // 确认收获
  handleConfirmTask() {
    const taskId = this.data.task.id
    
    this.setData({ loading: true })
    
    // 发送确认收获请求
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}/confirm`,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          wx.showToast({ title: '确认收获成功', icon: 'success' })
          // 重新加载任务详情
          setTimeout(() => {
            this.loadTaskDetail(taskId)
          }, 1000)
        } else {
          wx.showToast({ title: '确认收获失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },
  
  // 导航到用户主页
  navigateToUserProfile(e) {
    console.log('navigateToUserProfile被调用', e)
    const userId = e.currentTarget.dataset.userId
    const userName = e.currentTarget.dataset.userName
    console.log('获取到的userId:', userId)
    console.log('获取到的userName:', userName)
    if (userId && userName) {
      console.log('准备跳转到用户主页')
      wx.navigateTo({
        url: '../user-info/user-info?userId=' + userId + '&userName=' + encodeURIComponent(userName),
        success: function(res) {
          console.log('跳转成功:', res)
        },
        fail: function(res) {
          console.log('跳转失败:', res)
        }
      })
    } else {
      console.log('userId或userName为空，无法跳转')
    }
  },
  
  // 格式化时间（处理北京时间）
  formatTime(time) {
    if (!time) return ''
    
    let date;
    if (typeof time === 'string') {
      if (time.includes('T')) {
        // ISO 8601 格式（如 2026-05-09T07:40:00）
        // 后端存储的是 UTC 时间（前端发送时用 toISOString() 转换的）
        // 需要将 UTC 时间转换为北京时间（UTC+8）
        
        // 将时间字符串转换为毫秒时间戳（此时解析为本地时间，需要调整）
        const parts = time.split('T')
        const datePart = parts[0]
        const timePart = parts[1] || '00:00:00'
        
        const dateParts = datePart.split('-')
        const timeParts = timePart.split(':')
        
        const year = parseInt(dateParts[0])
        const month = parseInt(dateParts[1]) - 1
        const day = parseInt(dateParts[2])
        const hour = parseInt(timeParts[0]) + 8  // 关键：UTC时间加8小时转换为北京时间
        const minute = parseInt(timeParts[1]) || 0
        const second = parseInt(timeParts[2]) || 0
        
        // 处理跨天
        let finalYear = year
        let finalMonth = month
        let finalDay = day
        let finalHour = hour
        
        if (finalHour >= 24) {
          finalHour -= 24
          finalDay += 1
          const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
          if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
            daysInMonth[1] = 29
          }
          if (finalDay > daysInMonth[finalMonth]) {
            finalDay = 1
            finalMonth += 1
            if (finalMonth >= 12) {
              finalMonth = 0
              finalYear += 1
            }
          }
        }
        
        return `${finalYear}-${(finalMonth + 1).toString().padStart(2, '0')}-${finalDay.toString().padStart(2, '0')} ${finalHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      } else if (time.includes('-') && time.includes(':')) {
        // 普通日期时间格式（如 2026-05-09 15:40:00）
        const parts = time.split(' ')
        const datePart = parts[0]
        const timePart = parts[1] || '00:00:00'
        
        const dateParts = datePart.split('-')
        const timeParts = timePart.split(':')
        
        const year = parseInt(dateParts[0])
        const month = parseInt(dateParts[1])
        const day = parseInt(dateParts[2])
        const hour = parseInt(timeParts[0])
        const minute = parseInt(timeParts[1]) || 0
        
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      } else {
        const timestamp = parseInt(time)
        if (!isNaN(timestamp)) {
          date = new Date(timestamp)
        } else {
          return time
        }
      }
    } else if (typeof time === 'number') {
      date = new Date(time)
    } else {
      return String(time)
    }
    
    // 使用本地时间方法获取年月日时分
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  },
  
  // 管理员禁用任务
  handleDisableTask() {
    const taskId = this.data.task.id
    
    wx.showModal({
      title: '确认禁止',
      content: '确定要禁止该任务吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          // 发送禁止任务请求
          wx.request({
            url: `http://localhost:8881/api/tasks/${taskId}/disable`,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({ 
                  title: '任务已禁止', 
                  icon: 'success',
                  duration: 2000
                })
                
                // 跳转到任务列表页面
                setTimeout(() => {
                  wx.navigateBack()
                }, 2000)
              } else {
                wx.showToast({ title: '禁止任务失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
            },
            complete: () => {
              this.setData({ loading: false })
            }
          })
        }
      }
    })
  },
  
  // 管理员恢复任务
  handleRestoreTask() {
    const taskId = this.data.task.id
    
    wx.showModal({
      title: '确认恢复',
      content: '确定要恢复该任务吗？恢复后任务将重新进入任务列表供他人接单。',
      success: (res) => {
        if (res.confirm) {
          this.setData({ loading: true })
          
          // 发送恢复任务请求
          wx.request({
            url: `http://localhost:8881/api/tasks/${taskId}/restore`,
            method: 'PUT',
            success: (res) => {
              if (res.statusCode === 200) {
                wx.showToast({ 
                  title: '任务已恢复', 
                  icon: 'success',
                  duration: 2000
                })
                
                // 重新加载任务详情
                setTimeout(() => {
                  this.loadTaskDetail(taskId)
                }, 2000)
              } else {
                wx.showToast({ title: res.data || '恢复任务失败', icon: 'none' })
              }
            },
            fail: () => {
              wx.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
            },
            complete: () => {
              this.setData({ loading: false })
            }
          })
        }
      }
    })
  },
  
  // 评价任务
  handleReviewTask() {
    const taskId = this.data.task.id
    wx.navigateTo({
      url: `../review/review?taskId=${taskId}`
    })
  },
  
  // 加载任务评价
  loadTaskReviews(taskId) {
    console.log('loadTaskReviews被调用，taskId:', taskId);
    wx.request({
      url: `http://localhost:8881/api/reviews/task/${taskId}`,
      method: 'GET',
      success: (res) => {
        console.log('加载评价成功，响应:', res);
        if (res.statusCode === 200 && res.data) {
          console.log('评价数据:', res.data);
          // 处理评价数据
          const reviews = res.data.map(review => {
            console.log('单个评价数据:', review);
            // 处理评价者的头像路径
            if (review.reviewer && review.reviewer.avatar) {
              let reviewerAvatar = review.reviewer.avatar;
              if (reviewerAvatar.startsWith('/')) {
                if (reviewerAvatar.startsWith('/api/')) {
                  review.reviewer.avatar = 'http://localhost:8881' + reviewerAvatar;
                } else {
                  review.reviewer.avatar = 'http://localhost:8881/api' + reviewerAvatar;
                }
              }
            }
            // 处理评价图片路径
            if (review.images) {
              console.log('原始图片路径:', review.images);
              const images = review.images.split(',');
              console.log('分割后的图片路径:', images);
              const processedImages = images.map(image => {
                console.log('处理前的单个图片路径:', image);
                if (image.startsWith('/')) {
                  if (image.startsWith('/api/')) {
                    const processed = 'http://localhost:8881' + image;
                    console.log('处理后的单个图片路径:', processed);
                    return processed;
                  } else {
                    const processed = 'http://localhost:8881/api' + image;
                    console.log('处理后的单个图片路径:', processed);
                    return processed;
                  }
                } else if (image.startsWith('uploads/')) {
                  const processed = 'http://localhost:8881/api/' + image;
                  console.log('处理后的单个图片路径:', processed);
                  return processed;
                } else {
                  console.log('不需要处理的单个图片路径:', image);
                  return image;
                }
              });
              // 存储为数组格式，方便WXML遍历
              review.imagesArray = processedImages;
              console.log('处理后的图片数组:', review.imagesArray);
            } else {
              console.log('评价没有图片:', review.id);
              review.imagesArray = [];
            }
            // 处理时间格式，去掉T字
            if (review.createdAt) {
              review.createdAt = review.createdAt.replace('T', ' ');
            }
            if (review.updatedAt) {
              review.updatedAt = review.updatedAt.replace('T', ' ');
            }
            return review;
          });
          
          console.log('处理后的评价数据:', reviews);
          
          // 按评价者ID分组，然后按时间排序（最早的在前面）
          const reviewsByReviewer = {};
          reviews.forEach(review => {
            const reviewerId = review.reviewer.id;
            if (!reviewsByReviewer[reviewerId]) {
              reviewsByReviewer[reviewerId] = [];
            }
            reviewsByReviewer[reviewerId].push(review);
          });
          
          console.log('按评价者分组后的评价数据:', reviewsByReviewer);
          
          // 对每个用户的评价按时间排序（最早的在前面）
          for (const reviewerId in reviewsByReviewer) {
            reviewsByReviewer[reviewerId].sort((a, b) => {
              return new Date(a.updatedAt) - new Date(b.updatedAt);
            });
          }
          
          // 转换为合并后的评价格式
          const mergedReviews = [];
          for (const reviewerId in reviewsByReviewer) {
            const userReviews = reviewsByReviewer[reviewerId];
            if (userReviews.length > 0) {
              // 处理追加评价的图片路径
              const additionalReviews = userReviews.slice(1).map(review => {
                // 处理评价图片路径
                if (review.images) {
                  const images = review.images.split(',');
                  const processedImages = images.map(image => {
                    if (image.startsWith('/')) {
                      if (image.startsWith('/api/')) {
                        return 'http://localhost:8881' + image;
                      } else {
                        return 'http://localhost:8881/api' + image;
                      }
                    } else if (image.startsWith('uploads/')) {
                      return 'http://localhost:8881/api/' + image;
                    }
                    return image;
                  });
                  // 存储为数组格式，方便WXML遍历
                  review.imagesArray = processedImages;
                } else {
                  review.imagesArray = [];
                }
                return review;
              });
              // 第一个评价作为主评价
              const mainReview = {
                ...userReviews[0],
                additionalReviews: additionalReviews // 后续评价作为追加评价
              };
              mergedReviews.push(mainReview);
            }
          }
          
          console.log('合并后的评价数据:', mergedReviews);
          
          this.setData({
            reviews: mergedReviews
          }, () => {
            console.log('reviews更新成功:', this.data.reviews);
          });
        }
      },
      fail: (err) => {
        console.error('加载评价失败:', err);
      }
    })
  }
})
