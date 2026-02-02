# 🎓 Aggie Review  
_A Course & Professor Review Platform for NC A&T_

---

## 📌 Project Overview
**Aggie Review** is a full-stack web application designed to help **North Carolina A&T State University** students discover, review, and evaluate courses and professors based on real student experiences.

The platform allows students to search for professors and courses, view detailed profiles, and submit reviews in a clean, modern interface. This project was developed as a **Final Year Project (FYP)** with a focus on usability, scalability, and real-world deployment readiness.

---

## 🚀 Features
- 🔍 Search professors and courses  
- 🧑‍🏫 Detailed professor and course profile pages  
- ⭐ Student ratings and written reviews  
- 🔐 Authentication with secure sign-in/sign-up  
- 🗄️ Backend integration with Supabase  
- 🎨 Modern responsive UI built with Tailwind CSS  

---

## 🧠 System Architecture
- **Frontend:** React + TypeScript + Vite  
- **Backend / Database:** Supabase (PostgreSQL + Auth)  
- **Styling:** Tailwind CSS  
- **State Management:** React Context API  
- **Build Tooling:** Vite  
- **Version Control:** Git & GitHub  

---

## 📁 Project Structure
Aggie-Review-3/
│
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Application pages
│ ├── contexts/ # Authentication & global state
│ └── assets/ # Static assets
│
├── supabase/ # Supabase configuration
├── scripts/ # Data population scripts
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md


---

## ⚙️ How to Run Locally

### 1️⃣ Clone the repository
```bash
git clone git@github.com:realabdullahbinzubair/Aggie-Review-3.git
cd Aggie-Review-3
```
2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a .env file in the root directory and add:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```
---

## 📌 Results & Outcomes
Successfully built a production-ready full-stack web application
Implemented secure authentication and database-backed reviews
Designed an intuitive UI for student usability
Demonstrated real-world software engineering and deployment practices

---

## 🔮 Future Enhancements
Advanced filtering and sorting of reviews
Professor rating analytics and trends
Admin moderation dashboard
Mobile-first UI improvements
Cloud deployment (Vercel / Netlify)








