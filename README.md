# ⚡ WeDoList — Gamified Co-op Habit & Activity Tracker

WeDoList is a premium, real-time co-op habit and activity tracker designed for partners, friends, or teammates. Built with a retro-cyberpunk, monospace brutalist aesthetic, it gamifies everyday tasks and habits with levels, experience points (XP), active streaks, a live activity feed, and secure profile management.

---

## ✨ Features

- **🎮 Gamified Habit Grid**: Initialize, edit, and check off custom habits ("protocols") categorized by *Health*, *Work*, *Mind*, and *Environment*. Completing habits awards XP and keeps your daily streak alive.
- **🛡️ Secure Dynamic Profiles**: Create custom profile cards directly inside the app. Customize your avatar emoji, choose a color theme, specify a default goal, and protect your profile with a 4-digit PIN.
- **🔗 Real-Time Partner Syncing**: Connect with any other registered player on the platform. Keep track of your partner's level, XP progress, and streaks on your live dashboard.
- **📋 Daily System Logs**: Track daily metrics like sleep hours, energy levels, mood state (Peak, Good, Okay, Low), tasks (quests), and general notes (Captain's Log).
- **🔥 Live Activity Feed**: A real-time timeline displaying all habit completions and daily log entries of your partner/team, showing timestamps and XP awards.
- **🏆 Global Leaderboards**: Compare total XP rankings among all registered profiles on the instance.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 19, Vite (for ultra-fast HMR and bundling)
- **Styling**: Tailwind CSS (Monospace, retro-cyberpunk dark theme)
- **Database / Backend**: Firebase & Firestore (for instantaneous, reactive data-syncing using `onSnapshot` listeners)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed (v18+ recommended) and a Firebase project set up.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AceRushank/Gamified-Activity-Tracker.git
   cd Gamified-Activity-Tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   If running locally or deploying to production, make sure the Firebase config credentials are set in `src/App.jsx` under `firebaseConfig`.

4. **Run development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📸 Interface Preview

The application is styled with a sleek, minimalist dark theme featuring:
- Harse `#333` borders and high-contrast `#FFF` accents.
- Responsive design tailored for both desktop sidebars and mobile bottom navigation.
- Smooth CSS micro-animations for card hovers and level progress transitions.
