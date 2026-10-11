# 🎮 GameShelf

> A social game discovery and collection platform built with **Spring Boot, React, PostgreSQL, and the IGDB API**.

**[🚀 Live Demo](https://gameshelf-ruby.vercel.app/)** · **[💻 Source Code](https://github.com/Canushka/gameshelf)**

GameShelf is a full-stack web application for discovering games, exploring detailed game information, building a personal game library, saving favourites, rating and reviewing games, and interacting with other players.

It combines a cinematic gaming interface with a RESTful Spring Boot backend, JWT authentication, and game data from IGDB.

---

## ✨ Features

### 🎮 Game Discovery
- Discover games through curated sections
- Search games using the IGDB API
- Explore detailed game information
- View game artwork, genres, platforms, ratings, and release information
- Browse cinematic game-detail pages

### 📚 Personal Library
- Add games to a personal collection
- Track games with different statuses:
  - `PLAYING`
  - `COMPLETED`
  - `WISHLIST`
- Remove games from the collection

### ⭐ Favourites
- Save favourite games
- View and manage the favourites collection

### 📝 Ratings & Reviews
- Rate games and write reviews
- View community reviews
- Prevent duplicate reviews for the same game

### 👥 Social Features
- Follow and unfollow users
- View follower and following counts
- Explore a community activity feed
- View activity from followed users

### 🔐 Authentication & Security
- User registration and login
- JWT-based stateless authentication
- Protected API endpoints
- Password hashing
- Environment-based configuration for sensitive credentials

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Java | Backend programming |
| Spring Boot | REST API and application framework |
| Spring Security | Authentication and authorization |
| JWT | Stateless authentication |
| Spring Data JPA | Database access |
| Hibernate | Object-relational mapping |
| PostgreSQL | Relational database |
| Maven | Build and dependency management |
| IGDB API | Game data and artwork |

### Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Frontend tooling and build |
| React Router | Client-side routing |
| Tailwind CSS | Styling and responsive UI |
| Axios | HTTP requests to the backend |
| JavaScript | Frontend logic |

---

## ☁️ Deployment

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Game data | IGDB API |

**Try it live:** [gameshelf-ruby.vercel.app](https://gameshelf-ruby.vercel.app/)

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js and npm
- PostgreSQL database
- IGDB API credentials

### 1. Clone the repository

```bash
git clone https://github.com/Canushka/gameshelf.git
cd gameshelf
```

### 2. Configure the backend

Navigate to the backend directory:

```bash
cd backend
```

Configure the required database, JWT, and IGDB credentials using environment variables or your local `application.properties` file. Use the example configuration as a reference.

**Never commit real credentials or production secrets.**

### 3. Run the backend

```bash
./mvnw spring-boot:run
```

On Windows, use:

```powershell
.\mvnw.cmd spring-boot:run
```

### 4. Configure and run the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

## 👩‍💻 Author

**Anushka Chatterjee**  

Interested in full-stack development, Java, Spring Boot, and data-driven applications.

## Connect

- **GitHub:** [@Canushka](https://github.com/Canushka)
- **LinkedIn:** [Anushka Chatterjee](https://www.linkedin.com/in/anushka-chatterjee-624877305/)

---

## 📄 License

This project is intended as a personal portfolio and learning project.

## 🙏 Acknowledgements

- [IGDB](https://www.igdb.com/) — Game data and artwork
- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [PostgreSQL](https://www.postgresql.org/)
- [Tailwind CSS](https://tailwindcss.com/)
