# Leaderboard API 返回格式更新

## 📋 更新概述

将 Leaderboard API (`/api/leaderboard/me/`) 的返回格式从嵌套结构改为扁平化结构,以匹配项目中其他后端 API 的统一返回格式。

## 🔄 格式变更

### 旧格式（嵌套结构）

```json
{
  "me": {
    "user_id": 42,
    "username": "john@example.com",
    "attempts": 15,
    "correct": 10,
    "points": 150,
    "last_activity": "2025-10-19T10:30:00Z",
    "rank": 5
  },
  "around": [
    { "user_id": 30, "rank": 3, ... },
    { "user_id": 25, "rank": 4, ... },
    { "user_id": 42, "rank": 5, ... },
    { "user_id": 18, "rank": 6, ... }
  ]
}
```

### 新格式（扁平化结构）

```json
{
  "user_id": 42,
  "username": "john@example.com",
  "attempts": 15,
  "correct": 10,
  "points": 150,
  "last_activity": "2025-10-19T10:30:00Z",
  "rank": 5,
  "total_users": 100
}
```

## 🎯 设计理由

### 1. **与其他 API 保持一致**

项目中其他 API 的返回格式示例：

**用户登录 API** (`/api/user/login/`)
```json
{
  "ok": true,
  "message": "Login successful",
  "user": { ... }
}
```

**创建答题记录 API** (`/api/attempts/`)
```json
{
  "id": 123,
  "is_correct": true,
  "answer": "A",
  "submitted_at": "2025-10-19T10:30:00Z"
}
```

**当前用户信息 API** (`/api/me/`)
```json
{
  "id": 42,
  "email": "john@example.com",
  "display_name": "John Doe",
  ...
}
```

➡️ **统一模式**: 直接返回所需数据,不额外嵌套

### 2. **简化前端代码**

**旧代码**（需要访问嵌套属性）:
```javascript
const me = response.data.me;
return {
    points: me.points ?? 0,
    ranking: me.rank ?? null,
    total_users: response.data.around?.length ?? 0
};
```

**新代码**（直接访问）:
```javascript
return {
    points: response.data.points ?? 0,
    ranking: response.data.rank ?? null,
    total_users: response.data.total_users ?? 0
};
```

### 3. **明确的语义**

- 旧格式: `around` 字段长度代表周围用户数量（不明确）
- 新格式: `total_users` 字段明确表示总用户数

### 4. **职责单一**

- `/api/leaderboard/me/` → 返回**当前用户**的排名统计
- `/api/leaderboard/` → 返回**所有用户**的排行榜列表

如果前端需要"周围用户"信息,应该:
1. 调用 `/api/leaderboard/?page=...` 获取完整列表
2. 在前端基于 `rank` 进行切片显示

## 📝 文件变更

### 后端变更

#### 1. `backend/leaderboard/views.py`

**变更**: `MyLeaderboardView` 类

```python
class MyLeaderboardView(RetrieveAPIView):
    """
    GET /api/leaderboard/me/
    返回当前用户的排名信息（扁平化格式以匹配其他 API）
    """
    permission_classes = [IsAuthenticated]
    serializer_class = LeaderboardRowSerializer  # 改为使用单个行序列化器

    def retrieve(self, request, *args, **kwargs):
        rows = _base_rows(request)
        my_id = request.user.id
        idx = next((i for i, r in enumerate(rows) if r["user_id"] == my_id), None)

        if idx is None:
            # 新用户或无活动用户
            me = {
                "user_id": my_id,
                "username": request.user.username,
                "attempts": 0,
                "correct": 0,
                "points": 0,
                "last_activity": None,
                "rank": len(rows) + 1,
                "total_users": len(rows),  # 添加总用户数
            }
        else:
            me = rows[idx].copy()
            me["total_users"] = len(rows)  # 添加总用户数

        ser = self.get_serializer(me)  # 直接序列化用户数据
        return Response(ser.data)
```

**关键改动**:
- ❌ 移除 `around` 字段（周围用户列表）
- ✅ 添加 `total_users` 字段（总用户数）
- ✅ 使用 `LeaderboardRowSerializer` 而非 `MyLeaderboardSerializer`
- ✅ 直接返回用户数据,不嵌套在 `me` 中

#### 2. `backend/leaderboard/serializers.py`

**变更**: `LeaderboardRowSerializer` 类

```python
class LeaderboardRowSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    attempts = serializers.IntegerField()
    correct = serializers.IntegerField()
    points = serializers.IntegerField()
    last_activity = serializers.DateTimeField(allow_null=True)
    rank = serializers.IntegerField()
    total_users = serializers.IntegerField(required=False)  # 新增字段
```

**关键改动**:
- ✅ 添加 `total_users` 字段（可选,仅在 `/me/` 端点返回）

### 前端变更

#### 3. `frontend/src/services/authService.js`

**变更**: `getUserStats()` 方法

```javascript
getUserStats: async () => {
    try {
        const response = await apiClient.get('/leaderboard/me/');
        // API now returns flat structure: { points, rank, total_users, ... }
        return {
            points: response.data.points ?? 0,
            ranking: response.data.rank ?? null,
            total_users: response.data.total_users ?? 0
        };
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Failed to fetch user stats:', error);
        }
        return {
            points: 0,
            ranking: null,
            total_users: 0
        };
    }
}
```

**关键改动**:
- ✅ 从 `response.data.points` 直接读取,而非 `response.data.me.points`
- ✅ 从 `response.data.rank` 直接读取,而非 `response.data.me.rank`
- ✅ 从 `response.data.total_users` 读取,而非 `response.data.around?.length`

## 🔍 API 响应示例

### 成功响应 - 有排名的用户

**请求**: `GET /api/leaderboard/me/`

**响应**: 200 OK
```json
{
  "user_id": 42,
  "username": "john@example.com",
  "attempts": 15,
  "correct": 10,
  "points": 150,
  "last_activity": "2025-10-19T10:30:00Z",
  "rank": 5,
  "total_users": 100
}
```

**解读**:
- 用户完成了 15 次答题
- 其中 10 次正确
- 总积分 150 分
- 排名第 5 名
- 系统共有 100 个用户

### 成功响应 - 新用户（无活动）

**请求**: `GET /api/leaderboard/me/`

**响应**: 200 OK
```json
{
  "user_id": 99,
  "username": "newuser@example.com",
  "attempts": 0,
  "correct": 0,
  "points": 0,
  "last_activity": null,
  "rank": 101,
  "total_users": 100
}
```

**解读**:
- 新用户,尚无任何答题记录
- 排名为 101（即最后一名,系统有 100 个有积分的用户）
- 总用户数 100（不包括自己）

### 错误响应 - 未登录

**请求**: `GET /api/leaderboard/me/`（无身份验证）

**响应**: 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

## 🧪 测试场景

### 后端测试

```python
# test_leaderboard.py
def test_my_leaderboard_format(self):
    """测试 /api/leaderboard/me/ 返回扁平化格式"""
    self.client.login(username='testuser@example.com', password='password')
    response = self.client.get('/api/leaderboard/me/')
    
    self.assertEqual(response.status_code, 200)
    data = response.json()
    
    # 验证顶层字段存在
    self.assertIn('user_id', data)
    self.assertIn('username', data)
    self.assertIn('points', data)
    self.assertIn('rank', data)
    self.assertIn('total_users', data)
    
    # 验证不再有嵌套结构
    self.assertNotIn('me', data)
    self.assertNotIn('around', data)
```

### 前端测试

```javascript
// authService.test.js
test('getUserStats returns flat structure', async () => {
  const mockResponse = {
    user_id: 42,
    username: 'john@example.com',
    points: 150,
    rank: 5,
    total_users: 100
  };
  
  apiClient.get.mockResolvedValue({ data: mockResponse });
  
  const result = await AuthService.getUserStats();
  
  expect(result).toEqual({
    points: 150,
    ranking: 5,
    total_users: 100
  });
});
```

## ✅ 迁移检查清单

- [x] 更新 `MyLeaderboardView` 返回扁平化数据
- [x] 在 `LeaderboardRowSerializer` 添加 `total_users` 字段
- [x] 更新前端 `getUserStats()` 以适配新格式
- [x] 验证无编译错误
- [ ] 运行后端单元测试
- [ ] 运行前端单元测试
- [ ] 在浏览器中测试用户资料页显示
- [ ] 测试新用户（无活动）场景
- [ ] 测试错误处理（API 失败）

## 📊 影响范围

### 不受影响的功能

✅ `/api/leaderboard/` (完整排行榜列表) - 无变更
✅ `LeaderboardPage` 组件 - 使用 `/api/leaderboard/` 端点
✅ 积分计算逻辑 - 无变更
✅ 排名计算逻辑 - 无变更

### 受影响的功能

🔄 `/api/leaderboard/me/` 端点 - 返回格式变更
🔄 `authService.getUserStats()` - 数据提取逻辑变更
🔄 `UserProfileHeader` 组件 - 依赖 `getUserStats()`

## 🎉 优势总结

1. **一致性**: 与其他 API 格式统一
2. **简洁性**: 减少嵌套层级
3. **可维护性**: 代码更易理解和维护
4. **明确性**: `total_users` 语义清晰
5. **职责分离**: `/me/` 专注于当前用户,`/` 返回完整列表

## 📅 更新日期

2025年10月19日 - Leaderboard API 返回格式统一化完成
