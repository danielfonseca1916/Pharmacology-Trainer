export const en = {
  // Navigation
  nav: {
    dashboard: "Dashboard",
    modules: "Modules",
    drugs: "Drugs",
    progress: "Progress",
    guide: "Dataset Guide",
    account: "Account",
    logout: "Logout",
    login: "Login",
  },
  
  // Modules
  modules: {
    questionBank: "Question Bank",
    caseReasoning: "Case-Based Reasoning",
    moa: "Mechanism of Action",
    ae_ci: "Adverse Effects & Contraindications",
    interactions: "Interactions Sandbox",
    calculations: "Dose Calculations",
  },

  // Auth
  auth: {
    email: "Email",
    password: "Password",
    signUp: "Register",
    signIn: "Sign In",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    passwordMin: "Password must be at least 6 characters",
    userExists: "This email is already registered",
    invalidCredentials: "Invalid email or password",
  },

  // Disclaimers
  disclaimer: {
    title: "⚠️ Educational Use Only",
    content: "This application is designed exclusively for educational purposes. It is NOT intended for clinical decision-making or medical practice. All information provided is for learning and training purposes only.",
    clinicalWarning: "Do NOT use this tool for patient care or clinical decisions. Always consult qualified healthcare professionals and official medical references.",
    iUnderstand: "I understand and accept",
  },

  // Questions
  questions: {
    selectAnswer: "Select the correct answer:",
    submit: "Submit Answer",
    correct: "Correct!",
    incorrect: "Incorrect",
    explanation: "Explanation",
  },

  // Cases
  cases: {
    patientInfo: "Patient Information",
    vitals: "Vital Signs",
    labs: "Laboratory Values",
    selectTherapy: "Select the most appropriate therapy:",
    submit: "Submit Case",
    feedback: "Feedback",
    missed: {
      contraindications: "Contraindications missed",
      interactions: "Drug interactions missed",
      monitoring: "Monitoring parameters missed",
    },
  },

  // Drugs
  drugs: {
    search: "Search drugs, classes...",
    class: "Class",
    indications: "Indications",
    mechanism: "Mechanism of Action",
    adverseEffects: "Adverse Effects",
    contraindications: "Contraindications",
    monitoring: "Monitoring",
    doseText: "Typical Dose (Educational)",
  },

  // Progress
  progress: {
    title: "Your Progress",
    byModule: "by Module",
    byTag: "by Topic",
    accuracyRate: "Accuracy Rate",
    attempts: "Attempts",
  },

  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    back: "Back",
    next: "Next",
    close: "Close",
    cancel: "Cancel",
    save: "Save",
  },
};

export type I18nDict = typeof en;
