# 🏥 Hospital Booking System

A full-stack web app built using **React**, **SQLite**, and **Val Town**, enabling patients to book appointments with doctors and manage schedules dynamically.

---

### ✨ Features

- 🧑‍⚕️ Role-based login for **patients** and **doctors**
- 🗓️ View doctor availability in real time
- 📝 Book and manage appointments
- 👨‍⚕️ Doctors can see their scheduled visits
- 🔐 Password validation and local storage sessions
- 💾 SQLite backend with versioned schema management (via Val Town)
- 📦 React frontend with local state and persistent storage

---

### 🧰 Tech Stack

| Layer        | Tech Used                           |
|--------------|-------------------------------------|
| Frontend     | React 18 (ESM via esm.sh)           |
| Backend      | SQLite on [Val Town](https://val.town) |
| State Mgmt   | React Hooks                         |
| UI           | Basic HTML + CSS (inline styling)   |
| Auth         | LocalStorage (mock session)         |
| Deployment   | Server & client in a single Val     |

---

### 🚀 Getting Started

This app is hosted and runs entirely inside [Val Town](https://val.town), an online platform for scripting with persistent state.

To try it yourself:

1. Go to Val Town and create a new script.
2. Paste the entire `HospitalBookingSystem` source code.
3. Click **Preview** or open the URL to access the app.

---

### 🔐 Authentication Notes

- Login & registration are **mocked** (passwords are stored in SQLite – hash them in production).
- LocalStorage is used for session persistence.
- Doctors have extra fields like `specialty`, and appointment availability is validated on creation.

---

### 🧪 Planned Enhancements

- ✅ Doctor schedule blocking
- ✅ Real-time availability per slot
- 🔜 Email notifications
- 🔒 JWT or OAuth-based secure login
- 💬 Appointment status updates and cancelation

---

### 🧑‍💻 Author

- [Opeoluwa Muritala](https://github.com/Opeoluwa-Muritala)

---

### 📄 License

MIT — open for improvement and contribution!
"""
