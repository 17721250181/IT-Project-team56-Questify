# UserProfile 排名显示简化

## 📋 更新概述

简化 UserProfileHeader 组件中的排名显示,移除花哨的奖牌图标和特殊动画,只显示简洁的数字格式。

## 🎯 设计理念

**之前**: 复杂的排名显示
- 前三名: 显示奖牌图标 (🥇🥈🥉) + 脉冲动画
- 其他排名: 显示星星图标 ⭐ + `#数字`
- 特殊 CSS 类和动画效果

**现在**: 简洁的数字显示
- 所有排名: 统一显示 `#数字` 格式
- 无排名: 显示 "Unranked"
- 无特殊图标或动画

## 📝 代码变更

### UserProfileHeader.jsx

#### 1. 移除 import

```jsx
// 移除前
import { getRankBadge } from '../../utils/leaderboardUtils';

// 移除后
// (已删除该行)
```

#### 2. 简化排名显示

```jsx
// 之前的复杂实现
<div className="fw-bold fs-5">
    {ranking != null ? (
        <div className={`ranking-display ${ranking <= 3 ? 'ranking-top3' : ''}`}>
            <span className="ranking-medal">{getRankBadge(ranking)}</span>
            {ranking > 3 && <span className="ranking-number">#{ranking}</span>}
        </div>
    ) : (
        <span className="text-muted">Unranked</span>
    )}
</div>

// 现在的简洁实现
<div className="fw-bold fs-5">
    {ranking != null ? `#${ranking}` : <span className="text-muted">Unranked</span>}
</div>
```

## 🎨 显示效果

### 有排名的用户

```
┌─────────────────┐
│   🏆 Ranking    │
│      #5         │  ← 简洁的数字显示
└─────────────────┘
```

### 无排名的用户

```
┌─────────────────┐
│   🏆 Ranking    │
│   Unranked      │  ← 灰色文字
└─────────────────┘
```

## ✅ 优势

1. **简洁**: 移除不必要的视觉元素
2. **一致**: 所有排名显示方式统一
3. **性能**: 无额外的 CSS 动画和样式计算
4. **代码**: 更少的依赖和更简单的逻辑
5. **可读**: 数字格式一目了然

## 🔄 不受影响的功能

- LeaderboardPage 仍然保留奖牌显示(那里更合适)
- 积分、尝试次数、发布题目数量显示不变
- 后端 API 调用逻辑不变

## 📅 更新日期

2025年10月19日 - UserProfile 排名显示简化完成
