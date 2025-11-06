# Questify – Table of Contents

This page provides a structured overview of all materials included in the Questify handover package.  
It allows clients or future developers to quickly locate documentation, understand system structure, and run the project independently.

---

## Project Overview
**Project Name:** Questify (IT Project Team 56 – OOSD)  
**Purpose:** An AI-assisted question bank platform designed to enhance student engagement through question creating, attempting, and AI explanations.  
**Team Members:**  
- Chen Ma – Product Owner / Frontend Developer  
- Chih-Yi Huang – Scrum Master / Backend Developer  
- Bill Park – Testing Lead / Backend Developer  
- Chang Chang – Frontend Lead  
- Ziyi Zhang – Backend Leader  

---

## Demo
| Type | Link |
|------|------|
| **Live Frontend** | [Questify Frontend (GitHub Pages)]([https://questify-frontend.onrender.com/](https://questify-frontend.onrender.com)) |
| **Backend API (Render)** | [Questify API – Render Deployment]([https://questify-backend.onrender.com/](https://questify-backend-wv3e.onrender.com)) |

---

## Features (by Sprint)
| Sprint | Key Deliverables |
|---------|------------------|
| Sprint 1 | Requirement analysis, UI prototype, architecture design |
| Sprint 2 | Core functions: registration/login, posting/attempting questions, question list |
| Sprint 3 | Profile page, comments system, leaderboard integration |
| Sprint 4 | Admin Panel, save question, integration testing, handover preparation |

For the complete feature set, refer to **[README.md – Key Features](../README.md#key-features)**.  
For detailed progress and bug fixes, see **[Changelog.md](./Changelog.md)**.

---

## Documents
All detailed artefacts and design records are consolidated in the Confluence export located under
**[/Handover/documents/](./documents/)**.

This export contains the complete project documentation, including:
- Planning and Requirements – sprint plans, user stories, personas, and motivational models.
- System Design – architecture diagrams, domain and data models, and API reference.
- Development Process – coding standards, workflows, and role responsibilities.
- Testing and Quality Assurance – test cases, results, coverage, and review reports.
- Meeting Notes and Reviews – stand-up records, client meeting notes, and retrospective summaries.

---

## System Setup & Requirements
| Component | Description |
|------------|-------------|
| **Frontend:** | React (Node v20+) |
| **Backend:** | Django REST Framework (Python 3.11) |
| **Database:** | SQLite (during development), PostgreSQL (production) |
| **External APIs:** | OpenAI API (AI explanations) |
| **Deployment:** | Backend – Render / Frontend – GitHub Pages |

For setup, environment variables, and deployment instructions, see **[README.md](../README.md#setup-instructions)**.

---

## Architecture & Data Models
| File | Description |
|------|-------------|
| [Architecture_Diagram.png](./Architecture_Diagram.png) | High-level overview of system components |
| [ERD_Database_Structure.png](./ERD_Database_Structure.png) | Entity Relationship Diagram of database schema |
| [Description_of_Key_Classes_and_Layers.md](./Description_of_Key_Classes_and_Layers.md) | Detailed description of key backend classes, frontend structure, and how each application layer interacts |


---

## Change History & Traceability
| Document | Description |
|-----------|-------------|
| [Changelog.md](./Changelog.md) | Feature development and fixes per sprint |
| [Traceability_Matrix.xlsx](./Traceability_Matrix.xlsx) | Mapping between user stories, sprints, and implemented features |

---

## License
| Document | Description |
|-----------|-------------|
| [License.md](./License.md) | Describes project license terms and third-party dependencies |
| [LICENSE](../LICENSE) | Full MIT License text |

---

## Future Development
| Document | Description |
|-----------|-------------|
| [Future_Work.md](./Future_Work.md) | Proposed future extensions and system enhancements |

---

**End of Handover Package**  
_Last updated: November 2025_
