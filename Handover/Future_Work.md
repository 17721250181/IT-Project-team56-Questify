# Future Work

Although the Questify system is now fully functional and ready for handover, several improvements and extensions could be explored in future iterations to enhance scalability, usability, and student engagement.

---

### 1. Deployment and Database Scalability
Currently, Questify is deployed on **Render (backend)** and **GitHub Pages (frontend)** for convenience, as these platforms are free, lightweight, and suitable for an academic-scale project.  
In the future, to allow higher traffic, continuous integration, and enterprise-level reliability, the system could be migrated to **cloud infrastructure (e.g., AWS or Azure)** with automated CI/CD pipelines.  
Additionally, the current database uses **SQLite** for simplicity; migrating to **PostgreSQL**, which integrates seamlessly with Django, would improve performance and support concurrent access.

---

### 2. University SSO Authentication
At present, authentication is handled by the default Django system.  
In the future, **University of Melbourne Single Sign-On (SSO)** could be integrated to simplify login and improve security.  
This would require institutional approval and configuration with the university’s Identity Provider (IdP).

---

### 3. Gamification and Rewards
The current leaderboard awards points for general activities (posting, attempting, commenting).  
To further boost engagement, **course instructors could introduce small tangible rewards**, such as chocolates or public announcements, periodically recognising top performers.  
Additionally, expanding the gamification layer with badges, activity streaks, and weekly challenges would encourage sustained participation.

---

### 4. Leaderboard Enhancements
At present, leaderboard ranking is calculated based on total activity points.  
Future improvements could introduce more **metrics**, such as quiz accuracy rate, number of verified questions, or most-liked comments.  
This would make ranking fairer and reflect both participation and quality.

---

### 5. Peer Profile Visibility
Currently, students can only view their own profile page.  
Future iterations could allow **students to view each other’s profiles**, including information such as posted questions, total attempts, accuracy, and engagement level.  
This would foster peer learning and friendly competition within the course community.

---

### 6. AI-Powered Question Recommendation
Implement a **personalised question recommendation system** that suggests relevant questions to each student based on their past performance, topics of interest, and difficulty levels.  
This would help students focus on their weak areas and enhance the adaptive learning experience.

---

### 7. Improved AI Feedback Quality
The current OpenAI integration generates explanations for questions, but prompts are general-purpose.  
Future work could explore **fine-tuned educational prompts** or custom-trained models to provide more accurate and pedagogically aligned feedback.

---

### 8. Mobile Responsiveness
Although the system works well on desktop browsers, the React frontend could be further **optimised for mobile and tablet users**, improving accessibility and convenience for students engaging on different devices.

## Development Priority Table

| Priority | Future Work Item | Rationale |
|-----------|------------------|------------|
| **High** | Cloud deployment (AWS/Azure) & PostgreSQL migration | Essential for scalability, stability, and real-world deployment. |
| **High** | University SSO integration | Strengthens security and aligns with institutional authentication. |
| **Medium** | Gamification & tangible course rewards | Directly enhances student motivation and engagement. |
| **Medium** | Leaderboard metric expansion | Encourages fairer, multi-dimensional ranking. |
| **Medium** | Peer profile visibility | Builds community and competitive learning atmosphere. |
| **Low** | AI-powered question recommendation | Long-term enhancement for personalised learning. |
| **Low** | Improved AI feedback quality (fine-tuned prompts) | Research-intensive improvement requiring additional resources. |
| **Low** | Mobile responsiveness optimisation | Improves accessibility but non-critical for desktop-first environment. |

---

**Summary:**
The Questify platform has established a strong foundation as an interactive, AI-assisted question bank system.  
Future improvements address both current technical limitations and potential pedagogical enhancements, and should prioritise **cloud scalability, personalised learning, richer gamification, and accessibility**, enabling the system to evolve from a classroom prototype into a fully deployable, real-world educational platform.
