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
| **Live Frontend** | [Questify Frontend (GitHub Pages)](https://questify-frontend.onrender.com/) |
| **Backend API (Render)** | [Questify API – Render Deployment](https://questify-backend.onrender.com/) |

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

## Documentation (PDF Exports)
Located in `/Docs/` folder.  
| Document | Description |
|-----------|-------------|
| [System Architecture Design Model](../Docs/System_Architecture_Design_Model.pdf) | Detailed architecture and component diagrams |
| [Requirements Specification](../Docs/Requirements.pdf) | User stories, personas, motivational model |
| [Testing Plan and Report](../Docs/Testing_Report.pdf) | Test design, coverage, and results |
| [Ethics and Security Report](../Docs/Ethics_and_Security_Report.pdf) | Ethical and security considerations |
| [Sprint Reviews](../Docs/Sprint1.pdf – Sprint4.pdf) | Planning and outcomes for each sprint |

---

## System Setup & Requirements
| Component | Description |
|------------|-------------|
| **Frontend:** | React (Node v20+) |
| **Backend:** | Django REST Framework (Python 3.11) |
| **Database:** | SQLite (default), can migrate to PostgreSQL |
| **External APIs:** | OpenAI API (AI explanations) |
| **Deployment:** | Backend – Render / Frontend – GitHub Pages |

For setup, environment variables, and deployment instructions, see **[README.md](../README.md#setup-instructions)**.

---

## Architecture & Data Models
| File | Description |
|------|-------------|
| [Architecture_Diagram.png](./Architecture_Diagram.png) | High-level overview of system components |
| [ERD_Database_Structure.png](./ERD_Database_Structure.png) | Entity Relationship Diagram of database schema |

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
