# 👜 Bagséa – Full-Stack E-Commerce Platform

Bagséa is a complete E-Commerce platform for selling bags including backpacks, totes, briefcases, and more. Built from scratch using the **MERN stack-like architecture**, it supports full user interaction, authentication, admin controls, and responsive design.

---

<img width="1431" alt="3" src="https://github.com/user-attachments/assets/2b89b279-b44b-4ae1-9dff-c7269f6d67d4" />

## 📦 Features

- 👤 **User Authentication** (JWT + bcrypt)
- 🛍️ Product Browsing, Search & Filter
- 🛒 Cart & Checkout System
- 💳 Order History Tracking
- 📦 Inventory Management
- 🧑‍💼 Admin Panel (Products + Users)
- 📱 Fully Responsive Design (Bootstrap)

---

## 🛠️ Technologies Used

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=flat&logo=bootstrap&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/Bcrypt-00599C?style=flat)

---

## 📂 Main Components

### 🔐 Authentication
- Signup/Login with **bcrypt-hashed passwords**
- Secure **JWT token-based** session handling
- Protected API routes for users/admins

### 🛒 Shopping Features
- Add to cart, adjust quantity, delete items
- Order summary and checkout with shipping & tax
- Track order history per user

### 🧑‍💼 Admin Dashboard
- Product CRUD (Create, Edit, Delete)
- Manage inventory and availability
- View, search, and manage users and orders

---

## 🖥️ Pages

- Homepage  
- Sign Up / Sign In  
- Product List (by category)  
- Product Details  
- Cart Page  
- Checkout Page  
- Profile & Order History  
- Admin Panel (Products / Users)

---

## 🧪 Database Models (MongoDB + Mongoose)

- `User`: {name, email, password (hashed), role}
- `Product`: {title, category, price, stock, image, description}
- `Order`: {userID, items[], total, status}
- `Review`: {userID, productID, rating, comment}

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start backend server
node app.js

# Open the app
http://localhost:3000
