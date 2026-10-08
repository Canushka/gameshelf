# 🎮 GameShelf

> A social game discovery and collection platform built with Spring Boot, React, PostgreSQL and the IGDB API.

GameShelf is a full-stack web application for discovering games, exploring detailed game information, building a personal game library, saving favourites, rating and reviewing games, and interacting with other players.

The project combines a modern cinematic gaming interface with a RESTful Spring Boot backend and the IGDB game database.

---

## ✨ Features

### 🎮 Game Discovery
- Discover games through curated sections
- Search games using the IGDB API
- View detailed information about individual games
- Game artwork, genres, platforms, ratings and release information
- Cinematic game-detail pages

### 📚 Personal Library
- Add games to your personal shelf
- Track games using different statuses:
  - `PLAYING`
  - `COMPLETED`
  - `WISHLIST`
- Remove games from your shelf

### ⭐ Favourites
- Save games to your favourites
- View all favourite games in one place
- Remove games from favourites

### 📝 Ratings & Reviews
- Rate games
- Write reviews
- View community reviews
- Prevent duplicate reviews for the same game

### 👥 Social Features
- Follow other users
- Unfollow users
- View follower/following counts
- Community activity feed
- Following-only feed

### ❤️ Social Interaction
- Like reviews/activity
- Explore activity from other players
- User profiles and social connections

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication
- Protected API endpoints
- Passwords are not exposed through API responses
- Environment variables used for sensitive configuration

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Java | Backend programming language |
| Spring Boot | REST API & application framework |
| Spring Security | Authentication & authorization |
| JWT | Stateless authentication |
| Spring Data JPA | Database access |
| Hibernate | ORM |
| PostgreSQL | Relational database |
| Maven | Dependency management |
| IGDB API | Game data |

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend tooling |
| React Router | Client-side routing |
| Tailwind CSS | UI styling |
| Axios | API communication |
| JavaScript | Frontend logic |

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │       React         │
                         │       + Vite        │
                         │    Tailwind CSS     │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │    Spring Boot     │
                         │                     │
                         │ Controllers         │
                         │ Services            │
                         │ Security / JWT      │
                         │ JPA / Hibernate     │
                         └───────┬───────┬─────┘
                                 │       │
                    ┌────────────┘       └─────────────┐
                    ▼                                  ▼
          ┌──────────────────┐               ┌──────────────────┐
          │   PostgreSQL     │               │      IGDB        │
          │                  │               │      API         │
          │ Users            │               │                  │
          │ Games            │               │ Game information │
          │ Libraries        │               │ Artwork          │
          │ Reviews          │               │ Genres           │
          │ Favourites       │               │ Platforms        │
          │ Follows          │               │ Ratings          │
          └──────────────────┘               └──────────────────┘

👩‍💻 Author
Anushka
B.Tech — Electrical Engineering
Interested in full-stack development, Java, Spring Boot and data-driven applications.
Connect
- GitHub: @Canushka
📄 License
This project is currently intended as a personal portfolio and learning project.
⭐ Acknowledgements
- IGDB — Game data and artwork
- Spring Boot
- React
- Vite
- PostgreSQL
- Tailwind CSS
