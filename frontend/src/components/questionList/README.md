# Question List Module

问题列表模块 - 统一管理所有问题显示相关组件

## 📁 文件结构

```
questionList/
├── index.js                  # 模块导出
├── QuestionDisplay.jsx       # 核心显示组件
├── QuestionGrid.jsx          # 网格布局wrapper
├── QuestionList.jsx          # 列表布局wrapper
├── QuestionPagination.jsx    # 分页组件
├── ListItem.jsx              # 列表项组件 (List模式)
├── GridCard.jsx              # 卡片组件 (Grid模式)
├── ListSearch.jsx            # 搜索组件
├── FilterOption.jsx          # 过滤选项组件
├── SortingOption.jsx         # 排序选项组件
└── README.md                 # 文档
```

## 🎯 设计决策

### 为什么分离 ListItem 和 GridCard？

虽然两个组件都用于展示问题，但它们有本质区别：

1. **布局差异**
   - ListItem: 横向布局，使用 ListGroupItem，4列信息展示
   - GridCard: 纵向布局，使用 Card，紧凑的卡片设计

2. **信息密度**
   - ListItem: 详细信息，包含评分、尝试次数等统计数据
   - GridCard: 精简信息，根据 displayMode 动态显示不同 badges

3. **交互模式**
   - ListItem: 适合扫描大量问题，快速对比
   - GridCard: 适合浏览式查看，视觉导向

4. **可维护性**
   - 分离后每个组件职责单一，易于理解和修改
   - 避免过多的条件判断，提高代码可读性

**结论：** 保持两个组件独立可以提升代码质量和可维护性，降低复杂度。

## 🎯 组件说明

### 1. QuestionDisplay (核心组件)

统一的问题显示组件,支持多种显示模式和数据源。

**Props:**
```javascript
{
  mode: 'list' | 'grid'                    // 显示模式
  type: 'all' | 'attempted' | 'posted'     // 数据类型
  showSearch: boolean                       // 显示搜索控件
  usePagination: boolean | null             // 使用分页
  title: string | null                      // 可选标题
}
```

**特性:**
- ✅ 双模式渲染 (Grid/List)
- ✅ 多数据源支持
- ✅ 内置搜索过滤
- ✅ 集成分页组件
- ✅ 完整的加载/错误/空状态处理

### 2. QuestionGrid (网格组件)

专门用于网格卡片布局的简化组件。

**Props:**
```javascript
{
  type: 'attempted' | 'posted'  // 数据类型
}
```

**特性:**
- ✅ 3列响应式网格
- ✅ 卡片样式,彩色边框
- ✅ 自动分页 (12项/页)
- ✅ 完整的徽章系统

**使用场景:**
- 用户个人资料页
- 需要视觉识别的场景

### 3. QuestionList (列表组件)

专门用于列表布局的简化组件。

**Props:**
```javascript
{
  title: string  // 列表标题 (可选)
}
```

**特性:**
- ✅ ListGroup 紧凑布局
- ✅ 内置搜索/过滤/排序
- ✅ QuestionListItem 组件
- ✅ 无分页,滚动查看

**使用场景:**
- 问题库主页面
- 需要搜索筛选的场景

### 4. QuestionPagination (分页组件)

可复用的分页控件。

**Props:**
```javascript
{
  currentPage: number         // 当前页码 (1-indexed)
  totalPages: number          // 总页数
  onPageChange: function      // 页面改变回调
  maxVisiblePages: number     // 最大显示页码数 (默认: 5)
}
```

**特性:**
- ✅ 智能省略号显示
- ✅ 首页/末页快速跳转
- ✅ 上一页/下一页
- ✅ 自动隐藏 (只有1页时)
- ✅ 禁用状态处理

## 📦 使用方式

### 方式1: 使用具名导出 (推荐)

```javascript
import { QuestionGrid, QuestionList, QuestionPagination } from '../components/questionList';

// 网格显示
<QuestionGrid type="attempted" />

// 列表显示
<QuestionList title="All Questions" />

// 独立分页
<QuestionPagination 
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>
```

### 方式2: 使用直接导入

```javascript
import QuestionGrid from '../components/questionList/QuestionGrid';
import QuestionList from '../components/questionList/QuestionList';

<QuestionGrid type="posted" />
<QuestionList />
```

### 方式3: 高级用法 (直接使用核心组件)

```javascript
import { QuestionDisplay } from '../components/questionList';

<QuestionDisplay 
  mode="grid" 
  type="all" 
  showSearch={true}
  usePagination={true}
  title="Browse Questions"
/>
```

## 🎨 实际应用示例

### UserProfilePage

```jsx
import QuestionGrid from '../components/questionList/QuestionGrid';

<Tabs>
  <Tab eventKey="attempted" title="Attempted Questions">
    <QuestionGrid type="attempted" />
  </Tab>
  <Tab eventKey="posted" title="Posted Questions">
    <QuestionGrid type="posted" />
  </Tab>
</Tabs>
```

### QuestionListPage

```jsx
import QuestionList from '../components/questionList/QuestionList';

<QuestionList title="Question Bank" />
```

### 自定义分页示例

```jsx
import { QuestionPagination } from '../components/questionList';
import { useState } from 'react';

const MyComponent = () => {
  const [page, setPage] = useState(1);
  const totalPages = 10;

  return (
    <div>
      {/* Your content */}
      <QuestionPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        maxVisiblePages={7}
      />
    </div>
  );
};
```

## 🔧 组件依赖关系

```
QuestionDisplay (核心)
    ├── 依赖: QuestionPagination (分页)
    ├── 依赖: QuestionListItem (列表项)
    ├── 依赖: QuestionListSearch (搜索)
    ├── 依赖: QuestionListFilterOption (过滤)
    ├── 依赖: QuestionListSortingOption (排序)
    ├── 依赖: AttemptService (数据)
    └── 依赖: QuestionService (数据)

QuestionGrid → QuestionDisplay
QuestionList → QuestionDisplay
QuestionPagination (独立组件,可复用)
```

## 📊 数据流

```
1. 用户操作
   ↓
2. QuestionGrid/QuestionList (wrapper)
   ↓
3. QuestionDisplay (核心逻辑)
   ↓
4. AttemptService/QuestionService (API调用)
   ↓
5. 后端API
   ↓
6. 数据返回
   ↓
7. QuestionDisplay 渲染
   ├→ Grid Mode: 卡片网格
   └→ List Mode: ListGroup
   ↓
8. QuestionPagination (分页控制)
```

## ✨ 组件优势

### 1. 模块化设计
- 清晰的文件夹结构
- 独立的功能模块
- 易于定位和维护

### 2. 组件复用
- QuestionPagination 可独立使用
- 统一的分页逻辑
- 减少代码重复

### 3. 简洁的API
- QuestionGrid/QuestionList 开箱即用
- QuestionDisplay 提供灵活配置
- 一致的Props接口

### 4. 易于扩展
- 新增显示模式容易
- 分页组件可用于其他场景
- 清晰的扩展点

## 🎯 分页组件特性

### 智能显示逻辑

```
总页数 ≤ 5:  [1] [2] [3] [4] [5]

总页数 > 5:
  当前页 = 1:   [1] [2] [3] [...] [10]
  当前页 = 5:   [1] [...] [4] [5] [6] [...] [10]
  当前页 = 10:  [1] [...] [8] [9] [10]
```

### 控制按钮

- **First**: 跳转到第1页
- **Prev**: 上一页
- **Numbers**: 页码直接跳转
- **Next**: 下一页
- **Last**: 跳转到最后一页

### 自动优化

- 只有1页时不显示
- 边界页自动禁用按钮
- 响应式设计

## 🚀 性能优化

1. **条件渲染**: 只渲染当前页的数据
2. **智能搜索**: 客户端过滤,无需重复请求
3. **分页缓存**: 切换页面保持滚动位置
4. **懒加载友好**: 支持虚拟滚动扩展

## 📝 开发建议

### 添加新的显示模式

```javascript
// 在 QuestionDisplay.jsx 中添加
const renderTableMode = () => (
  // Your table implementation
);

// 在主渲染中添加条件
{mode === 'table' ? renderTableMode() : /* existing */}
```

### 自定义分页样式

```javascript
// 使用 QuestionPagination 的同时添加自定义样式
<div className="my-custom-pagination">
  <QuestionPagination {...props} />
</div>
```

### 扩展搜索功能

```javascript
// 在 QuestionDisplay 中扩展 handleSearch
const handleSearch = (query) => {
  setSearchQuery(query);
  // 添加其他逻辑
};
```

## 🎉 总结

questionList 模块提供了:

✅ **统一管理**: 所有问题显示组件集中管理
✅ **分离关注**: 分页逻辑独���提取
✅ **易于使用**: 简洁的API和导出
✅ **可复用**: 组件可独立使用
✅ **易维护**: 清晰的文件结构

这是一个优雅、高效的组件架构! 🚀
