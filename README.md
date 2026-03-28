# 🌿 AgriKewi Solution

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/>
</p>

---

## 🇫🇷 Français

### 📌 Description

**AgriKewi Solution** est une plateforme agricole full-stack multi-rôles développée avec **Laravel + React (Inertia.js)**. Elle permet de gérer l'ensemble de la chaîne agricole : de la production à la vente, en passant par la gestion des stocks, des tâches, des commandes et des rapports.

Le projet est structuré en **3 applications indépendantes** pour plus de sécurité, de flexibilité et une meilleure détection des erreurs :

| Application | Rôle | Port |
|-------------|------|------|
| 🟦 Superviseur | Gestion globale de la plateforme | 8001 |
| 🟩 Agriculteur | Suivi des plantations et des tâches | 8002 |
| 🟨 Client | Catalogue, commandes et paiements | 8003 |

### ✨ Fonctionnalités principales

- 🌾 Gestion des produits agricoles, intrants et transformés
- 📦 Gestion des stocks et des entrepôts
- 🛒 Panier, commandes, paiements et facturation
- 🌱 Suivi des plantations et zones de production
- ✅ Système de tâches Superviseur → Agriculteur
- 📊 Rapports (production, stock, finance)
- 🔔 Notifications internes
- 🧮 Calculateur agricole (irrigation, engrais, surface, coût)
- 👁️ Vue catalogue dynamique avec gestion du stock en temps réel

### 🛠️ Technologies utilisées

- **Backend** : Laravel 11, PHP 8+
- **Frontend** : React 18, TypeScript, Inertia.js
- **Styles** : Tailwind CSS
- **Base de données** : MySQL
- **Outils** : Vite, Wayfinder, Laravel Starter Kit

### ⚙️ Installation locale

```bash
# Cloner le projet
git clone https://github.com/akayajef/agrikewi.git
cd agrikewi

# Installer les dépendances pour chaque app
cd superviseur && composer install && npm install
cd ../agriculteur && composer install && npm install
cd ../client && composer install && npm install

# Configurer les variables d'environnement
cp .env.example .env
php artisan key:generate

# Importer la base de données
mysql -u root -p < ma_BD.sql

# Lancer les serveurs
php artisan serve --port=8001  # Superviseur
php artisan serve --port=8002  # Agriculteur
php artisan serve --port=8003  # Client
npm run dev
```

---

## 🇬🇧 English

### 📌 Description

**AgriKewi Solution** is a full-stack multi-role agricultural platform built with **Laravel + React (Inertia.js)**. It manages the entire agricultural chain — from production to sales — including stock management, task tracking, orders, and reporting.

The project is split into **3 independent applications** for better security, flexibility, and easier debugging:

| Application | Role | Port |
|-------------|------|------|
| 🟦 Supervisor | Overall platform management | 8001 |
| 🟩 Farmer | Plantation and task tracking | 8002 |
| 🟨 Client | Catalog, orders and payments | 8003 |

### ✨ Key Features

- 🌾 Management of agricultural, input, and processed products
- 📦 Stock and warehouse management
- 🛒 Cart, orders, payments and invoicing
- 🌱 Plantation and production zone tracking
- ✅ Task system: Supervisor → Farmer
- 📊 Reports (production, stock, finance)
- 🔔 Internal notifications
- 🧮 Agricultural calculator (irrigation, fertilizer, surface, cost)
- 👁️ Dynamic product catalog with real-time stock tracking

### 🛠️ Tech Stack

- **Backend**: Laravel 11, PHP 8+
- **Frontend**: React 18, TypeScript, Inertia.js
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Tools**: Vite, Wayfinder, Laravel Starter Kit

### ⚙️ Local Setup

```bash
# Clone the repository
git clone https://github.com/akayajef/agrikewi.git
cd agrikewi

# Install dependencies for each app
cd superviseur && composer install && npm install
cd ../agriculteur && composer install && npm install
cd ../client && composer install && npm install

# Set up environment variables
cp .env.example .env
php artisan key:generate

# Import the database
mysql -u root -p < ma_BD.sql

# Start the servers
php artisan serve --port=8001  # Supervisor
php artisan serve --port=8002  # Farmer
php artisan serve --port=8003  # Client
npm run dev
```

---

## 👤 Author / Auteur

**Akaya Onanga Jef-Wilfried**  
📧 akayajef596@gmail.com  
📍 Dakar, Sénégal  

---

<p align="center">Fait avec ❤️ pour l'agriculture • Made with ❤️ for agriculture</p>
