# AIGuru — Smart Classroom Assessment Platform

An AI-powered classroom assessment platform where **teachers generate tests with Gemini AI** and **students receive personalised performance feedback**.

---

## Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | React 18 + Vite         |
| Styling  | Tailwind CSS            |
| Routing  | React Router v6         |
| Auth     | Firebase Authentication |
| Database | Firebase Firestore      |
| AI       | Google Gemini 1.5 Flash |
| Charts   | Recharts                |

---

## Project Structure

```
aiguru/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky nav with role-aware links
│   │   ├── ProtectedRoute.jsx  # Role-based route guard
│   │   └── QuestionCard.jsx    # MCQ card with result overlay
│   │
│   ├── pages/
│   │   ├── Login.jsx           # Email/password login
│   │   ├── Register.jsx        # Register with role selection
│   │   ├── TeacherDashboard.jsx # Analytics + test overview
│   │   ├── StudentDashboard.jsx # Progress + recent results
│   │   ├── GenerateTest.jsx    # 3-step AI test creation wizard
│   │   ├── TestList.jsx        # Browse & filter published tests
│   │   ├── AttemptTest.jsx     # Paginated test-taking interface
│   │   └── Result.jsx          # Score + AI feedback + review
│   │
│   ├── firebase/
│   │   ├── firebaseConfig.js   # Firebase init
│   │   ├── auth.js             # Auth helpers
│   │   └── firestore.js        # All DB operations
│   │
│   ├── services/
│   │   └── aiService.js        # Gemini API calls
│   │
│   └── context/
│       └── AuthContext.jsx     # Global auth state
│
├── firestore.rules             # Security rules
├── .env.example                # Environment variable template
└── README.md
```

---

## Setup Instructions

### 1. Clone & install

```bash
git clone <your-repo-url>
cd aiguru
npm install
```

### 2. Firebase setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create project**
2. Enable **Authentication** → Email/Password provider
3. Enable **Firestore Database** → Start in **production mode**
4. Register a **Web App** → copy config values
5. Deploy Firestore rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

### 3. Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key

### 4. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_GEMINI_API_KEY=...
```

### 5. Create Firestore indexes

In Firebase Console → Firestore → Indexes, add these **composite indexes**:

| Collection | Fields                              | Order |
| ---------- | ----------------------------------- | ----- |
| `tests`    | `createdBy` ASC, `createdAt` DESC   | —     |
| `tests`    | `published` ASC, `createdAt` DESC   | —     |
| `results`  | `studentId` ASC, `submittedAt` DESC | —     |
| `results`  | `testId` ASC, `submittedAt` DESC    | —     |

### 6. Run the app

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Usage Flow

### Teacher

1. Register with role **Teacher**
2. Go to **Generate Test** → enter topic, difficulty, question count
3. AI generates MCQs → review and edit
4. Publish the test
5. View student scores and analytics on **Dashboard**

### Student

1. Register with role **Student**
2. Go to **Browse Tests** → pick a test
3. Answer all questions, navigate with number pad
4. Submit → AI analyses performance in real-time
5. View score, AI feedback, and full answer review on **Results page**

---

## AI Features

| Feature                     | Implementation                                                |
| --------------------------- | ------------------------------------------------------------- |
| **AI Test Generation**      | Gemini generates structured JSON MCQs                         |
| **AI Performance Analysis** | Gemini analyses wrong answers and gives personalized feedback |
| **Editable Questions**      | Teachers can edit any generated question before publishing    |

---

## Security

- All Firebase API calls are authenticated
- Firestore rules enforce role-based access
- Teachers can only manage their own tests
- Students can only read their own results
- `.env` is gitignored — API keys never committed

---

## Build for production

```bash
npm run build
```

Output is in `dist/`. Deploy to Firebase Hosting, Vercel, or Netlify.

---

## Common Issues

**Q: Firestore permission denied?**  
A: Deploy `firestore.rules` and add the composite indexes listed above.

**Q: Gemini returns invalid JSON?**  
A: The prompt uses strict formatting instructions. If it fails once, retry — Gemini may occasionally add markdown fences which are stripped automatically.

**Q: Auth redirect loop?**  
A: Clear browser storage and re-login. Ensure your Firebase project's `authDomain` matches exactly.
