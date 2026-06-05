const { checkUserStatus } = require('../../utils/auth')

Page({
  data: {
    activeTab: 'received',
    reviews: []
  },

  onLoad() {
    if (!checkUserStatus()) {
      return
    }
    this.loadReviews();
  },

  onShow() {
    if (!checkUserStatus()) {
      return
    }
    this.loadReviews();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.loadReviews();
  },

  loadReviews() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '加载中...' });

    const url = this.data.activeTab === 'received'
      ? `http://localhost:8881/api/reviews/user/${userInfo.id}`
      : `http://localhost:8881/api/reviews/reviewer/${userInfo.id}`;

    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const reviews = res.data.map(review => ({
            ...review,
            tags: review.tags ? review.tags.split(',') : [],
            images: review.images ? review.images.split(',').map(img => this.processImage(img)) : []
          }));
          this.setData({ reviews });
        }
      },
      fail: () => {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },
  
  processImage(image) {
    if (!image) {
      return '';
    }
    if (image.includes('http://tmp/') || image.includes('_tmp_')) {
      return '';
    }
    if (image.startsWith('/')) {
      if (image.startsWith('/api/')) {
        return 'http://localhost:8881' + image;
      } else {
        return 'http://localhost:8881/api' + image;
      }
    }
    return image;
  },

  formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 2592000000) return Math.floor(diff / 86400000) + '天前';
    
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  },

  navigateBack() {
    wx.navigateBack();
  }
});