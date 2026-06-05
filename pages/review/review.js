// review.js
Page({
  data: {
    task: {},
    rating: 0,
    selectedTags: [],
    content: '',
    canSubmit: false,
    tags: ['准时', '服务好', '态度好', '效率高', '认真负责', '专业', '礼貌', '沟通顺畅'],
    tagsWithStatus: [],
    images: []
  },
  
  onLoad(options) {
    const taskId = options.taskId
    // 初始化标签状态数组
    const tagsWithStatus = this.data.tags.map(tag => ({
      name: tag,
      selected: false
    }))
    this.setData({
      tagsWithStatus: tagsWithStatus
    })
    this.loadTaskInfo(taskId)
  },
  
  // 加载任务信息
  loadTaskInfo(taskId) {
    wx.showLoading({ title: '加载中...' })
    
    wx.request({
      url: `http://localhost:8881/api/tasks/${taskId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          this.setData({
            task: res.data
          })
          
          // 检查用户是否有权限评价
          const userInfo = wx.getStorageSync('userInfo')
          const userId = userInfo.id
          const isPublisher = res.data.publisher && res.data.publisher.id === userId
          const isAcceptor = res.data.acceptor && res.data.acceptor.id === userId
          
          if (!isPublisher && !isAcceptor) {
            wx.showToast({ title: '只有发布者和接单者才能评价', icon: 'none' })
            setTimeout(() => {
              wx.navigateBack()
            }, 1500)
            return
          }
          
          // 检查用户是否已经评价过该订单
          this.checkUserReview(taskId, userId, isPublisher, isAcceptor)
        }
      },
      fail: (err) => {
        console.error('加载任务信息失败:', err)
        wx.showToast({ title: '加载任务信息失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  // 检查用户是否已经评价过该订单
  checkUserReview(taskId, userId, isPublisher, isAcceptor) {
    wx.request({
      url: `http://localhost:8881/api/reviews/task/${taskId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          // 查找用户的评价
          const userReview = res.data.find(review => review.reviewer.id === userId)
          
          if (userReview) {
            // 用户已经评价过，显示提示信息，允许追加评价
            this.setData({
              rating: userReview.rating, // 保持之前的评分
              content: '', // 清空内容，让用户输入新的评价
              selectedTags: [], // 清空标签，让用户选择新的标签
              hasReviewed: true,
              canSubmit: true
            })
            
            // 重置标签状态
            const tagsWithStatus = this.data.tags.map(tag => ({
              name: tag,
              selected: false
            }))
            this.setData({
              tagsWithStatus: tagsWithStatus
            })
            
            wx.showToast({ title: '您已评价过该订单，可追加评价内容', icon: 'none' })
          }
        }
      },
      fail: (err) => {
        console.error('检查评价状态失败:', err)
      }
    })
  },
  
  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  },
  
  // 设置评分
  setRating(e) {
    // 如果已经评价过，禁止修改评分
    if (this.data.hasReviewed) {
      wx.showToast({ title: '已评价的订单不能修改评分', icon: 'none' })
      return
    }
    
    const rating = parseInt(e.currentTarget.dataset.rating)
    this.setData({
      rating: rating
    })
    this.checkCanSubmit()
  },
  
  // 切换标签
  toggleTag(e) {
    const tagName = e.currentTarget.dataset.tag
    const tagsWithStatus = [...this.data.tagsWithStatus]
    const selectedTags = [...this.data.selectedTags]
    
    // 找到点击的标签
    const tagIndex = tagsWithStatus.findIndex(tag => tag.name === tagName)
    if (tagIndex === -1) return
    
    const tag = tagsWithStatus[tagIndex]
    
    if (tag.selected) {
      // 取消选择
      tag.selected = false
      // 从selectedTags中移除
      const selectedIndex = selectedTags.indexOf(tagName)
      if (selectedIndex !== -1) {
        selectedTags.splice(selectedIndex, 1)
      }
    } else {
      // 选择标签，最多选择3个
      if (selectedTags.length < 3) {
        tag.selected = true
        selectedTags.push(tagName)
      } else {
        wx.showToast({ title: '最多只能选择3个标签', icon: 'none' })
        return
      }
    }
    
    this.setData({
      tagsWithStatus: tagsWithStatus,
      selectedTags: selectedTags
    })
  },
  
  // 处理评价内容输入
  handleContentInput(e) {
    const content = e.detail.value
    this.setData({
      content: content
    })
  },
  
  // 检查是否可以提交
  checkCanSubmit() {
    // 如果已经评价过，直接允许提交（因为评分已经固定）
    if (this.data.hasReviewed) {
      this.setData({ canSubmit: true })
      return
    }
    
    const canSubmit = this.data.rating > 0
    this.setData({
      canSubmit: canSubmit
    })
  },
  
  // 选择图片
  chooseImage() {
    console.log('chooseImage函数被调用');
    wx.chooseImage({
      count: 3, // 最多选择3张图片
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('wx.chooseImage成功:', res);
        const tempFilePaths = res.tempFilePaths
        console.log('选择的图片路径:', tempFilePaths);
        const maxSize = 10 * 1024 * 1024 // 10MB
        
        // 检查每张图片的大小
        let validImages = []
        let invalidCount = 0
        
        tempFilePaths.forEach((filePath, index) => {
          wx.getFileInfo({
            filePath: filePath,
            success: (fileInfo) => {
              console.log('wx.getFileInfo成功:', fileInfo);
              const fileSize = fileInfo.size // 单位为字节
              console.log('图片大小:', fileSize, '字节');
              
              if (fileSize > maxSize) {
                invalidCount++
                console.log('图片大小超过限制:', filePath);
              } else {
                validImages.push(filePath)
                console.log('图片大小符合要求:', filePath);
              }
              
              // 处理所有图片后更新状态
              if (index === tempFilePaths.length - 1) {
                if (invalidCount > 0) {
                  wx.showToast({ 
                    title: `有${invalidCount}张图片大小超过10MB，已被过滤`, 
                    icon: 'none' 
                  })
                }
                
                if (validImages.length > 0) {
                  const images = [...this.data.images, ...validImages]
                  // 限制最多3张图片
                  if (images.length > 3) {
                    images.splice(3)
                    wx.showToast({ title: '最多只能上传3张图片', icon: 'none' })
                  }
                  console.log('准备更新images:', images);
                  this.setData({
                    images: images
                  }, () => {
                    console.log('images更新成功:', this.data.images);
                    // 显示选择成功的提示
                    wx.showToast({ 
                      title: `成功选择${validImages.length}张图片`, 
                      icon: 'success' 
                    })
                  })
                }
              }
            },
            fail: (err) => {
              console.error('wx.getFileInfo失败:', err);
            }
          })
        })
      },
      fail: (err) => {
        console.error('wx.chooseImage失败:', err);
        wx.showToast({ 
          title: '选择图片失败', 
          icon: 'none' 
        })
      },
      complete: () => {
        console.log('wx.chooseImage调用完成');
      }
    })
  },
  
  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({
      images: images
    })
  },
  
  // 提交评价
  submitReview() {
    if (!this.data.canSubmit) {
      return
    }
    
    const taskId = this.data.task.id
    const userInfo = wx.getStorageSync('userInfo')
    const userId = userInfo.id
    
    console.log('submitReview被调用');
    console.log('当前images长度:', this.data.images.length);
    console.log('当前images:', this.data.images);
    
    // 上传图片
    if (this.data.images.length > 0) {
      console.log('有图片需要上传，调用uploadImages');
      this.uploadImages(taskId, userId)
    } else {
      console.log('没有图片需要上传，直接调用submitReviewData');
      this.submitReviewData(taskId, userId, [])
    }
  },
  
  // 上传图片
  uploadImages(taskId, userId) {
    wx.showLoading({ title: '上传图片中...' })
    const images = this.data.images
    const uploadedImages = []
    let uploadedCount = 0
    
    console.log('开始上传图片:', images);
    console.log('图片数量:', images.length);
    
    if (images.length === 0) {
      console.log('没有图片需要上传');
      wx.hideLoading()
      this.submitReviewData(taskId, userId, uploadedImages)
      return
    }
    
    images.forEach((tempFilePath, index) => {
      console.log('上传第', index + 1, '张图片:', tempFilePath);
      wx.uploadFile({
        url: 'http://localhost:8881/api/upload',
        filePath: tempFilePath,
        name: 'file',
        success: (res) => {
          console.log('上传图片成功:', res);
          console.log('上传图片响应状态:', res.statusCode);
          console.log('上传图片响应数据:', res.data);
          try {
            const data = JSON.parse(res.data)
            console.log('上传图片响应:', data);
            if (data.code === 200 && data.data) {
              uploadedImages.push(data.data)
              console.log('图片上传成功，路径:', data.data);
            } else {
              console.log('图片上传失败，响应:', data);
            }
          } catch (error) {
            console.error('解析上传图片响应失败:', error);
            console.error('原始响应数据:', res.data);
          }
        },
        fail: (err) => {
          console.error('上传图片失败:', err);
        },
        complete: () => {
          uploadedCount++
          console.log('上传完成第', uploadedCount, '张，共', images.length, '张');
          if (uploadedCount === images.length) {
            wx.hideLoading()
            console.log('所有图片上传完成，成功上传', uploadedImages.length, '张');
            console.log('成功上传的图片路径:', uploadedImages);
            this.submitReviewData(taskId, userId, uploadedImages)
          }
        }
      })
    })
  },
  
  // 提交评价数据
  submitReviewData(taskId, userId, images) {
    // 构建评价数据
    const reviewData = {
      rating: this.data.rating,
      content: this.data.content,
      tags: this.data.selectedTags.join(','),
      images: images.join(',')
    }
    
    // 发送评价请求
    wx.showLoading({ title: '提交中...' })
    
    // 检查任务和用户信息
    console.log('Task:', this.data.task)
    console.log('User ID:', userId)
    console.log('Task ID:', taskId)
    console.log('Review Data:', reviewData)
    console.log('Images array:', images)
    console.log('Images string:', images.join(','))
    console.log('Publisher ID:', this.data.task.publisher ? this.data.task.publisher.id : 'null')
    console.log('Acceptor ID:', this.data.task.acceptor ? this.data.task.acceptor.id : 'null')
    
    // 构建请求数据
    const requestData = {
      publisherReview: this.data.task.publisher && this.data.task.publisher.id === userId ? reviewData : null,
      acceptorReview: this.data.task.acceptor && this.data.task.acceptor.id === userId ? reviewData : null
    }
    
    console.log('Request data:', requestData)
    
    wx.request({
      url: `http://localhost:8881/api/reviews/task/${taskId}/mutual`,
      method: 'POST',
      data: requestData,
      success: (res) => {
        console.log('评价请求成功:', res)
        if (res.statusCode === 200) {
          wx.showToast({ 
            title: this.data.hasReviewed ? '评价更新成功' : '评价成功', 
            icon: 'success' 
          })
          // 延迟后返回上一页
          setTimeout(() => {
            wx.navigateBack({
              success: function(res) {
                console.log('返回上一页成功:', res);
              },
              fail: function(res) {
                console.log('返回上一页失败:', res);
              }
            })
          }, 1500)
        } else {
          console.log('评价请求失败:', res)
          wx.showToast({ title: '评价失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('提交评价失败:', err)
        wx.showToast({ title: '评价失败', icon: 'none' })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  }
})
