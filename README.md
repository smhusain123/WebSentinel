# WebSentinel

WebSentinel is an autonomous website monitoring and alert system that continuously monitors websites, detects availability and content changes, records monitoring history, and notifies users when important changes occur.

The system combines scheduled monitoring, JWT authentication, Redis caching, Playwright-based page rendering, Gemini AI, and email notifications to reduce the need for manual website checking.

---

## 🚀 Features

- 🔐 User registration and JWT-based authentication
- 🌐 Add and manage monitored websites
- 📡 Automatic website monitoring
- ⚡ HTTP availability and response-time monitoring
- 🔴 Detect website downtime
- 🟢 Automatically detect website recovery
- 🔔 Create and resolve monitoring alerts
- 📧 Email notifications for website downtime and recovery
- 🔄 Scheduled monitoring using Node-Cron
- 📝 Store monitoring history in MongoDB
- 🧠 Detect website content changes
- 🤖 Gemini AI explanations for detected content changes
- 🌍 Playwright-based rendering for dynamic websites
- ⚡ Redis caching for frequently requested website data
- 🐳 Dockerized frontend, backend, and Redis
- 🧩 Docker Compose for managing multiple services

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      User/Browser   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   + Vite + Nginx    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │ Express + JWT Auth  │
                    └──────┬─────┬────────┘
                           │     │
             ┌─────────────┘     └──────────────┐
             ▼                                  ▼
    ┌─────────────────┐                ┌─────────────────┐
    │ MongoDB Atlas   │                │     Redis       │
    │                 │                │     Cache       │
    └─────────────────┘                └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │ Monitoring      │
    │ Node-Cron       │
    └───────┬─────────┘
            │
      ┌─────┴───────────────┐
      ▼                     ▼
┌───────────────┐    ┌────────────────┐
│    Axios      │    │   Playwright   │
│ Availability  │    │ Rendered Page  │
└───────────────┘    └───────┬────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Gemini AI   │
                      │ Change       │
                      │ Explanation  │
                      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Nodemailer   │
                      │ Email Alerts │
                      └──────────────┘
