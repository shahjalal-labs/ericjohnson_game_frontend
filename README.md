# Internet Bachelor - Virtual Dating Game Show & Elimination Web Platform

<p align="center">
  <img src="assets/banner.svg" alt="Internet Bachelor Frontend Banner" width="100%">
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react" alt="React"></a>
  <a href="https://next-auth.js.org"><img src="https://img.shields.io/badge/NextAuth.js-v4-purple?style=for-the-badge&logo=next.js" alt="NextAuth"></a>
  <a href="https://stripe.com"><img src="https://img.shields.io/badge/Stripe-Checkout-008CDD?style=for-the-badge&logo=stripe" alt="Stripe"></a>
  <a href="https://firebase.google.com"><img src="https://img.shields.io/badge/Firebase-FCM%20Push-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind%20CSS-v3.4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge" alt="License"></a>
</p>

---

## 📖 Overview

**Internet Bachelor Frontend (`ericjohnson_game_frontend`)** is an interactive live-format dating game show and virtual elimination platform built with Next.js 15 and React 19. Designed for engaging broadcast-style social interaction, the platform features dedicated host and contestant portals, multi-round elimination stages (Round One & Round Two with real-time progression), in-app token purchases via Stripe, direct messaging, and Firebase Cloud Messaging alerts.

---

## ⚡ Key Features

- **🎙️ Master Game Show Host Portal:** Control console allowing showrunners to advance rounds, initiate contestant questions, trigger elimination votes, and declare winners.
- **🏆 Multi-Stage Elimination Rounds:**
  - *Round One*: Rapid-fire introduction and initial cutdowns (Stages 1 through 5 and Final selection).
  - *Round Two*: In-depth compatibility trials and elimination playoffs (Stages 1 through 6 and Championship).
- **🪙 Token Economy & Stripe Checkout:** In-app virtual token bundles enabling viewers and contestants to unlock perks, vote, and participate in special challenges.
- **🔐 NextAuth Multi-Provider Authentication:** Seamless Google OAuth and credentials authentication with onboarding profile wizards.
- **🔔 Push Alerts & Notifications:** Integrated Firebase Cloud Messaging (FCM) background worker for live show invitations and game-start triggers.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Host_Contestant_Roles ["Game Show Roles & Flow"]
        Host[Show Host Portal] --> Round1[Round 1: 5-Stage Elimination]
        Round1 --> Round2[Round 2: 6-Stage Elimination]
        Round2 --> Winner[Final Match / Winner Podium]
        Contestant[Contestant Q&A Portal] --> Round1
        Contestant --> Round2
    end

    subgraph Platform_Services ["Platform & Monetization"]
        Tokens[Buy Tokens Portal] --> Stripe[Stripe Checkout]
        Auth[NextAuth Session] --> Google[Google OAuth]
        Push[FCM Service Worker] --> Mobile[Live Match Push Alerts]
    end

    Host_Contestant_Roles <--> Platform_Services
```

---

## 🗂️ Project Structure

```
ericjohnson_game_frontend/
├── assets/
│   └── banner.svg               # Architectural repository banner
├── public/
│   └── firebase-messaging-sw.js # FCM background service worker
├── src/
│   ├── app/
│   │   ├── (game)/              # Host console, Round 1 & Round 2 elimination routes
│   │   ├── (contestant)/        # Contestant response forms & ready room
│   │   ├── (default)/           # Game lobby, Buy tokens, Checkout, Chat
│   │   ├── (AuthLayout)/        # Login, Signup, Dating preferences
│   │   ├── api/auth/            # NextAuth API endpoints
│   │   └── layout.tsx
│   ├── components/              # Host control panels & contestant UI
│   ├── lib/                     # Firebase, NextAuth, and Stripe helpers
│   └── redux/                   # Redux Toolkit state slices
├── package.json
└── tsconfig.json
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 15** | Server and client rendering framework with App Router |
| **React 19** | Component architecture and UI state |
| **NextAuth.js** | Google OAuth and session authentication |
| **Stripe Checkout** | Token purchase payments |
| **Firebase FCM** | Real-time Web Push show reminders |
| **Tailwind CSS** | Neon game-show UI styling |
| **Radix UI** | Headless modal and interaction primitives |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shahjalal-labs/ericjohnson_game_frontend.git
   cd ericjohnson_game_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
