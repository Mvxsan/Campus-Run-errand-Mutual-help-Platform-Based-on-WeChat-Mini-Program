// auth.js - 用户角色权限管理模块

/**
 * 检查用户是否登录
 * @returns {boolean} 是否登录
 */
function checkLogin() {
    const token = wx.getStorageSync('token');
    return !!token;
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息
 */
function getUserInfo() {
    return wx.getStorageSync('userInfo') || null;
}

/**
 * 检查用户是否被禁用
 * @returns {boolean} 是否被禁用
 */
function isUserDisabled() {
    const userInfo = getUserInfo();
    return userInfo && userInfo.status === 0;
}

/**
 * 强制退出登录，清除本地存储并跳转登录页
 */
function forceLogout(message = '账号已被禁用') {
    wx.clearStorageSync();
    wx.showToast({
        title: message,
        icon: 'none',
        duration: 3000,
        success: () => {
            setTimeout(() => {
                wx.redirectTo({
                    url: '/pages/login/login'
                });
            }, 1500);
        }
    });
}

/**
 * 检查用户状态，如果被禁用则强制退出
 * @returns {boolean} 用户是否正常
 */
function checkUserStatus() {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.status === 0) {
        forceLogout('账号已被禁用，请联系管理员');
        return false;
    }
    return true;
}

/**
 * 检查用户是否有发布任务的权限
 * @returns {boolean} 是否有发布任务的权限
 */
function canPublishTask() {
    // 所有登录用户都可以发布任务
    return checkLogin();
}

/**
 * 检查用户是否有接取任务的权限
 * @returns {boolean} 是否有接取任务的权限
 */
function canAcceptTask() {
    // 所有登录用户都可以接取任务
    return checkLogin();
}

/**
 * 检查用户是否是任务的发布者
 * @param {number} taskPublisherId 任务发布者ID
 * @returns {boolean} 是否是任务的发布者
 */
function isTaskPublisher(taskPublisherId) {
    const userInfo = getUserInfo();
    return userInfo && userInfo.id === taskPublisherId;
}

/**
 * 检查用户是否是任务的接取者
 * @param {number} taskAcceptorId 任务接取者ID
 * @returns {boolean} 是否是任务的接取者
 */
function isTaskAcceptor(taskAcceptorId) {
    const userInfo = getUserInfo();
    return userInfo && userInfo.id === taskAcceptorId;
}

/**
 * 检查用户是否可以操作任务（发布者或接取者）
 * @param {number} taskPublisherId 任务发布者ID
 * @param {number} taskAcceptorId 任务接取者ID
 * @returns {boolean} 是否可以操作任务
 */
function canOperateTask(taskPublisherId, taskAcceptorId) {
    return isTaskPublisher(taskPublisherId) || isTaskAcceptor(taskAcceptorId);
}

/**
 * 检查用户是否可以取消任务
 * @param {number} taskPublisherId 任务发布者ID
 * @param {string} taskStatus 任务状态
 * @returns {boolean} 是否可以取消任务
 */
function canCancelTask(taskPublisherId, taskStatus) {
    // 只有任务发布者可以取消任务，且任务状态为待接单
    return isTaskPublisher(taskPublisherId) && taskStatus === '待接单';
}

/**
 * 检查用户是否可以确认完成任务
 * @param {number} taskPublisherId 任务发布者ID
 * @param {string} taskStatus 任务状态
 * @returns {boolean} 是否可以确认完成任务
 */
function canCompleteTask(taskPublisherId, taskStatus) {
    // 只有任务发布者可以确认完成任务，且任务状态为已送达
    return isTaskPublisher(taskPublisherId) && taskStatus === '已送达';
}

/**
 * 检查用户是否可以评价任务
 * @param {number} taskPublisherId 任务发布者ID
 * @param {number} taskAcceptorId 任务接取者ID
 * @param {string} taskStatus 任务状态
 * @returns {boolean} 是否可以评价任务
 */
function canReviewTask(taskPublisherId, taskAcceptorId, taskStatus) {
    // 任务发布者和接取者都可以评价任务，且任务状态为已完成或已确认收货
    return (isTaskPublisher(taskPublisherId) || isTaskAcceptor(taskAcceptorId)) && (taskStatus === '已完成' || taskStatus === '已确认收货');
}

/**
 * 检查用户是否是管理员
 * @returns {boolean} 是否是管理员
 */
function isAdmin() {
    const userInfo = getUserInfo();
    return userInfo && userInfo.role === 1;
}

/**
 * 跳转到登录页面
 */
function redirectToLogin() {
    wx.navigateTo({
        url: '/pages/login/login'
    });
}

/**
 * 检查登录状态，如果未登录则跳转到登录页面
 * @returns {boolean} 是否已登录
 */
function requireLogin() {
    try {
        const token = wx.getStorageSync('token');
        const userInfo = wx.getStorageSync('userInfo');
        console.log('requireLogin() - token:', token);
        console.log('requireLogin() - userInfo:', userInfo);
        if (!token || !userInfo) {
            console.log('requireLogin() - token或userInfo不存在，跳转到登录页面');
            redirectToLogin();
            return false;
        }
        console.log('requireLogin() - 用户已登录，返回true');
        return true;
    } catch (error) {
        console.error('requireLogin() - 出错:', error);
        redirectToLogin();
        return false;
    }
}

/**
 * 检查权限，如果没有权限则显示提示
 * @param {boolean} hasPermission 是否有权限
 * @param {string} message 提示消息
 * @returns {boolean} 是否有权限
 */
function requirePermission(hasPermission, message = '您没有权限执行此操作') {
    if (!hasPermission) {
        wx.showToast({
            title: message,
            icon: 'none'
        });
        return false;
    }
    return true;
}

// 发送消息到后端
function sendMessageToBackend(message) {
    try {
        const userInfo = wx.getStorageSync('userInfo');
        if (!userInfo) {
            console.error('sendMessageToBackend() - 用户未登录，无法发送消息');
            return;
        }
        
        console.log('sendMessageToBackend() - 用户信息:', userInfo);
        console.log('sendMessageToBackend() - 消息内容:', message);
        
        const requestData = {
            title: message.title,
            content: message.body,
            type: 'order', // 订单消息类型
            senderId: userInfo.id, // 使用实际登录用户的ID
            receiverId: userInfo.id,
            isRead: false
        };
        
        console.log('sendMessageToBackend() - 发送的请求数据:', requestData);
        
        wx.request({
            url: 'http://localhost:8881/api/messages',
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            data: requestData,
            success: (res) => {
                console.log('sendMessageToBackend() - 响应状态码:', res.statusCode);
                console.log('sendMessageToBackend() - 响应数据:', res.data);
                if (res.statusCode === 200) {
                    console.log('sendMessageToBackend() - 消息发送成功:', res.data);
                } else {
                    console.error('sendMessageToBackend() - 消息发送失败，状态码:', res.statusCode);
                    console.error('sendMessageToBackend() - 失败原因:', res.data);
                }
            },
            fail: (err) => {
                console.error('sendMessageToBackend() - 网络请求失败:', err);
            }
        });
    } catch (error) {
        console.error('sendMessageToBackend() - 出错:', error);
    }
}

// 导出所有函数
module.exports = {
    checkLogin,
    getUserInfo,
    isUserDisabled,
    forceLogout,
    checkUserStatus,
    canPublishTask,
    canAcceptTask,
    isTaskPublisher,
    isTaskAcceptor,
    canOperateTask,
    canCancelTask,
    canCompleteTask,
    canReviewTask,
    isAdmin,
    redirectToLogin,
    requireLogin,
    requirePermission,
    sendMessageToBackend
};
