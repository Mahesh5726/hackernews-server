# HackerNews Server

A social media-like backend service built using Node.js and Express with authentication, posts, likes, and comments.

## 📖 Table of Contents
- [Features](#-features)
- [Pre-requisites](#-pre-requisites)
- [Installation](#-installation)
- [Password Hashing](#-password-hashing)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Posts](#posts)
  - [Likes](#likes)
  - [Comments](#comments)
- [Folder Structure](#-folder-structure)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features
- JWT-based authentication
- CRUD operations for users, posts, likes, and comments
- Middleware-based access control
- Pagination for fetching users, posts, likes, and comments
- sha256 password hashing for security

## 🔧 Pre-requisites
Before running this project, ensure you have the following installed:
- **Node.js** (latest LTS version recommended)
- **TypeScript** (for type safety and better development experience)
- **Supabase** (for authentication and database management)
- **Prisma** (for ORM and database schema management)

## 🛠️ Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Mahesh5726/hackernews-server.git
   ```
2. Navigate to the project directory:
   ```sh
   cd hackernews-server
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables in a `.env` file:
   ```env
   PORT=3000
   JWT_SECRET=your_secret_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```


## 🎮 Usage

To start the server in development mode:
```sh
npm run dev
```

To start the server in production mode:
```sh
npm start
```

By default, the server runs on `http://localhost:3000/`.

## 📌 API Endpoints

### Authentication
- `GET /auth/sign-in` – Signs up a user (leverages JWT).
- `GET /auth/log-in` – Logs in a user (leverages JWT).

### Users
- `GET /users/me` – Returns the current user's details (based on JWT token).
- `GET /users` – Returns all users in alphabetical order (paginated).

### Posts
- `GET /posts` – Returns all posts in reverse chronological order (paginated).
- `GET /posts/me` – Returns current user's posts (reverse chronological, paginated).
- `POST /posts` – Creates a post (authored by the current user).
- `DELETE /posts/:postId` – Deletes the post (if owned by the user).

### Likes
- `GET /likes/on/:postId` – Fetches likes on a post (reverse chronological, paginated).
- `POST /likes/on/:postId` – Creates a like (one per user per post).
- `DELETE /likes/on/:postId` – Deletes a user's like on a post.

### Comments
- `GET /comments/on/:postId` – Fetches comments on a post (reverse chronological, paginated).
- `POST /comments/on/:postId` – Creates a comment on a post.
- `DELETE /comments/:commentId` – Deletes a user's comment.
- `PATCH /comments/:commentId` – Updates a user's comment.


## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE.txt) file for details.

---

🌐 "Because every great discussion starts with a rock-solid backend—engineered for the front page!"
