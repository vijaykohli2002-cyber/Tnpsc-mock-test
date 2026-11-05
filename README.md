# TNPSC Group 4 Daily Mock Test

Static, no-build mock exam (HTML + CSS + JS). Pattern: 200 questions, 300 marks, 180 minutes
(General Tamil 100, General Studies 75, Aptitude 25; 1.5 marks each, no negative marking).

## Run
Open `index.html` in a browser, or serve the folder (`python3 -m http.server`).
GitHub Pages: Settings > Pages > deploy from the `main` branch root.

## Add a new day
1. Copy `data/day1.js` to `data/day2.js`, set `const TEST_NO = 2;` and replace the questions
   (keep exactly 200: 100 `T`, 75 `G`, 25 `A`).
2. In `index.html`, change `data/day1.js` to `data/day2.js`.
Progress is stored per test number in the browser's localStorage.

## Question format
`[section, topic, difficulty, question, correct, wrong1, wrong2, wrong3, explanation]`
The correct answer is always listed first; the app shuffles display order (numeric options are sorted).

All questions are newly written practice questions, not previous-year questions.
