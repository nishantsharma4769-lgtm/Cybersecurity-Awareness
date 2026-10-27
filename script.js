// CyberShield interactions. All features run in the visitor's browser.
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.textContent = "☰";
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();

// Educational password feedback: this is intentionally a simple heuristic, not a security audit.
const passwordInput = document.querySelector("#passwordInput");
const togglePassword = document.querySelector("#togglePassword");
const strengthBar = document.querySelector("#strengthBar");
const strengthResult = document.querySelector("#strengthResult");
const criteria = {
  length: document.querySelector('[data-rule="length"]'),
  lower: document.querySelector('[data-rule="lower"]'),
  number: document.querySelector('[data-rule="number"]'),
  symbol: document.querySelector('[data-rule="symbol"]')
};

passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  const checks = {
    length: value.length >= 12,
    lower: /[a-z]/.test(value) && /[A-Z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value)
  };
  Object.entries(checks).forEach(([key, passed]) => criteria[key].classList.toggle("met", passed));

  const score = Object.values(checks).filter(Boolean).length;
  const width = value.length === 0 ? 0 : Math.max(10, score * 25);
  strengthBar.style.width = `${width}%`;
  strengthBar.style.background = score <= 1 ? "#ff8390" : score <= 2 ? "#ffbf69" : "#63f0b1";

  if (!value) strengthResult.textContent = "Enter a sample to see feedback.";
  else if (score <= 1) strengthResult.textContent = "Weak characteristics — try a longer, less predictable phrase.";
  else if (score <= 2) strengthResult.textContent = "Getting started — add length and variety.";
  else if (score === 3) strengthResult.textContent = "Good characteristics — uniqueness is also important.";
  else strengthResult.textContent = "All listed checks passed. Use a unique password and consider a password manager.";
});

togglePassword.addEventListener("click", () => {
  const show = passwordInput.type === "password";
  passwordInput.type = show ? "text" : "password";
  togglePassword.textContent = show ? "Hide" : "Show";
  togglePassword.setAttribute("aria-label", show ? "Hide password" : "Show password");
});

// Five-question awareness quiz.
const questions = [
  {
    question: "You receive an unexpected message asking you to verify your account immediately. What should you do?",
    answers: ["Click the link quickly to avoid account closure.", "Verify through the official app or website.", "Reply with your password to confirm your identity.", "Forward it to friends to ask if it looks real."],
    correct: 1,
    explanation: "Correct. Avoid the message link and independently open the official app or type the known website address. Urgency is a common phishing tactic.",
    hint: "Tip: urgency is a common warning sign."
  },
  {
    question: "Which password practice is safest?",
    answers: ["Reuse one memorable password everywhere.", "Use your name and birth year.", "Use a long, unique password for every account.", "Change one character in the same password for each site."],
    correct: 2,
    explanation: "Correct. Unique passwords reduce the chance that one breached account puts your other accounts at risk. A password manager can help.",
    hint: "Tip: one compromised password should not unlock every account."
  },
  {
    question: "What does multi-factor authentication (MFA) add?",
    answers: ["A second type of proof when signing in.", "A guarantee that phishing cannot happen.", "A way to avoid software updates.", "A public profile badge."],
    correct: 0,
    explanation: "Correct. MFA adds another verification factor. It improves account security, although you should still watch for phishing and approve only sign-ins you initiated.",
    hint: "Tip: more than one proof of identity."
  },
  {
    question: "A caller claims to be IT support and asks for your one-time login code. What is the safest response?",
    answers: ["Share it if they sound professional.", "Send a screenshot of the code.", "Ask them to wait while you find all your account details.", "Do not share it; verify the request through an official channel."],
    correct: 3,
    explanation: "Correct. One-time codes are meant for your sign-in flow and should not be shared with callers or chat contacts. Contact support through a trusted channel.",
    hint: "Tip: legitimate support should not need you to disclose your sign-in code."
  },
  {
    question: "Why are backups useful against ransomware?",
    answers: ["They make suspicious links safe.", "They can help restore files without relying on the attacker.", "They prevent every type of malware infection.", "They replace the need for updates."],
    correct: 1,
    explanation: "Correct. Separate, tested backups can help recover data. They do not prevent infection, so combine backups with updates and cautious behaviour.",
    hint: "Tip: think about recovery if your files become unavailable."
  }
];

let questionIndex = 0;
let score = 0;
let answered = false;
const questionCount = document.querySelector("#questionCount");
const scoreDisplay = document.querySelector("#scoreDisplay");
const quizProgress = document.querySelector("#quizProgress");
const questionText = document.querySelector("#questionText");
const answerList = document.querySelector("#answerList");
const quizFeedback = document.querySelector("#quizFeedback");
const nextQuestion = document.querySelector("#nextQuestion");
const quizHint = document.querySelector("#quizHint");

function renderQuestion() {
  const item = questions[questionIndex];
  answered = false;
  questionCount.textContent = `QUESTION ${questionIndex + 1} OF ${questions.length}`;
  scoreDisplay.textContent = `Score: ${score}`;
  quizProgress.style.width = `${(questionIndex / questions.length) * 100}%`;
  questionText.textContent = item.question;
  quizHint.textContent = item.hint;
  quizFeedback.textContent = "";
  quizFeedback.className = "quiz-feedback";
  answerList.replaceChildren();

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.textContent = answer;
    button.addEventListener("click", () => chooseAnswer(index));
    answerList.appendChild(button);
  });

  nextQuestion.disabled = true;
  nextQuestion.textContent = questionIndex === questions.length - 1 ? "See results →" : "Next question →";
}

function chooseAnswer(selectedIndex) {
  if (answered) return;
  answered = true;
  const item = questions[questionIndex];
  const buttons = [...answerList.querySelectorAll("button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.correct) button.classList.add("correct");
    if (index === selectedIndex && selectedIndex !== item.correct) button.classList.add("incorrect");
  });

  const isCorrect = selectedIndex === item.correct;
  if (isCorrect) score += 1;
  scoreDisplay.textContent = `Score: ${score}`;
  quizFeedback.textContent = `${isCorrect ? "Correct! " : "Not quite. "}${item.explanation}`;
  quizFeedback.classList.add(isCorrect ? "good" : "bad");
  nextQuestion.disabled = false;
  quizProgress.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
}

nextQuestion.addEventListener("click", () => {
  if (!answered) return;
  if (questionIndex < questions.length - 1) {
    questionIndex += 1;
    renderQuestion();
    return;
  }

  const percentage = Math.round((score / questions.length) * 100);
  questionCount.textContent = "QUIZ COMPLETE";
  scoreDisplay.textContent = `Score: ${score}/${questions.length}`;
  questionText.textContent = `You scored ${score} out of ${questions.length} (${percentage}%).`;
  answerList.replaceChildren();
  quizFeedback.className = `quiz-feedback ${score >= 4 ? "good" : ""}`;
  quizFeedback.textContent = score >= 4
    ? "Great work. Keep practising these habits and share reliable security advice."
    : "Good start. Review the safety tips above, then try again to reinforce what you learned.";
  quizHint.textContent = "This quiz is for learning, not a formal security assessment.";
  quizProgress.style.width = "100%";
  nextQuestion.textContent = "Try again ↻";
  nextQuestion.disabled = false;
  nextQuestion.onclick = () => {
    questionIndex = 0;
    score = 0;
    nextQuestion.onclick = null;
    renderQuestion();
  };
});

renderQuestion();
