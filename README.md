# Aura — AI Health Coach Research App

A research study app measuring user perception of AI response timing.  
**Design:** Latin square, 24 participants (p1–p24), 9 questions × 3 delays (1.5 / 4 / 6 s) × 3 cue types (generic / transparent / humorous).

---

## Prerequisites

- **Node.js** 18+
- **Expo Go** app installed on the participant's iPhone
- An **OpenAI API key** (GPT-4o-mini is used to generate answers)
- The Mac running the backend and the iPhone must be on the **same Wi-Fi network**

---

## 1. Clone the repo

```bash
git clone https://github.com/righteousMind/VRI-2026-Raymond.git
cd VRI-2026-Raymond
```

---

## 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=any_random_string
AI_PROVIDER=openai
```

Start the backend:

```bash
npm run dev
```

The server runs on port **3000** by default.

---

## 3. Frontend setup

```bash
cd frontend
npm install
```

Find your Mac's local IP address:

```bash
ipconfig getifaddr en0
# e.g. 192.168.1.42
```

Create a `.env` file in `frontend/`:

```
EXPO_PUBLIC_API_URL=http://<your-mac-ip>:3000
```

Start the Expo dev server:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on the participant's iPhone.

---

## 4. iPhone voice setup (required, one-time)

The app uses **Ava (Premium)** — Apple's high-quality English TTS voice. It must be downloaded on the iPhone before running the study.

1. Open **Settings → Accessibility → Spoken Content → Voices**
2. Select **English → Ava**
3. Tap the download icon next to **Premium**
4. Wait for download to complete (~200 MB)

Without this, the app falls back to a robotic default voice.

---

## 5. Running a session

1. Open Expo Go on the participant's iPhone and scan the QR code
2. Log in with a participant username: `p1` through `p24`
3. Complete the profile setup screen
4. The app generates personalised answers (requires internet for OpenAI)
5. Complete all 9 voice questions
6. The complete screen prompts the participant to fill in the post-session questionnaires
7. Tap **Log out**

---

## 6. Data

Session logs and answers are stored as JSON files in `backend/data/`:

| File | Contents |
|---|---|
| `users.json` | Participant profiles (p1–p24) |
| `answers.json` | Generated AI answers per session |
| `sessions.json` | Trial logs (question index, delay, cue type, answer text) |

To **reset data** between studies, clear `answers.json` and `sessions.json` back to `[]`.

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| App can't reach backend | Check IP in `frontend/.env` matches your Mac's current Wi-Fi IP |
| Voice comes from earpiece | Make sure you started a recording first — the app switches to speaker after recording stops |
| "Failed to prepare session" | Check your OpenAI API key and that the backend is running |
| Second recording doesn't work | Restart Expo Go on the phone |
