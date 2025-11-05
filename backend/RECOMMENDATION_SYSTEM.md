# Smart Recommendation System

## Overview
The recommendation system provides personalized question recommendations based on user activity and question quality metrics.

## API Endpoint
**GET** `/api/questions/recommended/`

**Authentication:** Required

**Returns:** Array of up to 6 recommended questions

## Recommendation Strategy

### 1. **Same Topic Questions (50% - 3 questions)**
- Recommends questions from the same topic as user's most recent attempt
- Helps reinforce learning in current area of focus
- Weighted by: verification status → rating → popularity → newness

### 2. **High-Rated Questions (30% - 2 questions)**
- Recommends highly-rated questions (rating ≥ 3.5) from different topics
- Provides exposure to quality content from other areas
- Excludes same topic to ensure diversity

### 3. **Popular Questions (20% - 1 question)**
- Recommends questions with high attempt counts (≥ 5 attempts)
- Shows what other students are practicing
- Community-validated content

## Key Features

### ✅ Filters Out Attempted Questions
- Automatically excludes questions the user has already attempted
- Ensures fresh content every time

### ✅ Verification Status Weighting
- **APPROVED**: +1000 priority points (highest priority)
- **PENDING**: +100 priority points
- **REJECTED/NEW**: 0 points
- Verified questions appear first but unverified questions are still included

### ✅ Randomization for Diversity
- Fetches top 10 candidates per category
- Randomly samples from top candidates
- Prevents showing the same recommendations repeatedly

### ✅ Intelligent Fallback
- If not enough questions match criteria, fills with best available
- Ensures 6 recommendations when possible

## Algorithm Details

```python
# Priority Scoring
priority_score = Case(
    When(verify_status='APPROVED', then=1000),
    When(verify_status='PENDING', then=100),
    default=0
)

# Sorting Order (per category)
ORDER BY:
    1. priority_score DESC     # Verified first
    2. rating DESC             # Then quality
    3. num_attempts DESC       # Then popularity
    4. created_at DESC         # Then newness
```

## Example Response

```json
[
    {
        "id": "uuid",
        "question": "Question text...",
        "type": "MCQ",
        "topic": "Classes and Objects",
        "week": "Week3",
        "rating": 4.5,
        "num_attempts": 42,
        "verify_status": "APPROVED",
        "creator": {...},
        ...
    },
    ...
]
```

## Integration

### Frontend Usage
```javascript
import { QuestionService } from './services/QuestionService';

const recommendations = await QuestionService.getRecommendedQuestions();
```

### When Recommendations Update
- New recommendations loaded on HomePage mount
- Refreshed when user completes an attempt
- Triggered by changes in `lastAttempt.question`

## Performance Considerations

- **Efficient queries**: Uses Django ORM with proper indexing
- **Single database query** per category with prefetch
- **Sampling**: Reduces predictability without heavy computation
- **Excludes list**: Prevents N+1 queries for attempted questions

## Future Enhancements

Potential improvements to consider:
1. **User success rate matching**: Recommend easier/harder questions based on user's accuracy
2. **Collaborative filtering**: "Users like you also practiced..."
3. **Time-based decay**: Prioritize recent/trending questions
4. **Week progression**: Recommend questions from user's current week
5. **Personalized weights**: Allow users to adjust recommendation preferences
