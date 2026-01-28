export const cs = {
  // Navigation
  nav: {
    dashboard: "Přehled",
    modules: "Moduly",
    drugs: "Léčiva",
    progress: "Pokrok",
    guide: "Průvodce daty",
    account: "Účet",
    logout: "Odhlášení",
    login: "Přihlášení",
  },

  // Modules
  modules: {
    questionBank: "Banka otázek",
    caseReasoning: "Případové studie",
    moa: "Mechanismus účinku",
    ae_ci: "Nežádoucí účinky & Kontraindikace",
    interactions: "Interakční sandbox",
    calculations: "Výpočet dávek",
  },

  // Auth
  auth: {
    email: "E-mail",
    password: "Heslo",
    signUp: "Registrace",
    signIn: "Přihlášení",
    alreadyHaveAccount: "Již máte účet?",
    noAccount: "Nemáte účet?",
    passwordMin: "Heslo musí mít alespoň 6 znaků",
    userExists: "Tento e-mail je již registrován",
    invalidCredentials: "Neplatný e-mail nebo heslo",
  },

  // Disclaimers
  disclaimer: {
    title: "⚠️ Pouze pro vzdělávací účely",
    content:
      "Tato aplikace je určena výhradně pro vzdělávací účely. NENÍ určena pro klinické rozhodování nebo lékařskou praxi. Všechny informace jsou určeny pouze pro učení a školení.",
    clinicalWarning:
      "NEPOUŽÍVEJTE tento nástroj pro péči o pacienty nebo klinická rozhodnutí. Vždy se poraďte s kvalifikovanými zdravotnickými pracovníky a oficiálními lékařskými doporučeními.",
    iUnderstand: "Rozumím a souhlasím",
  },

  // Questions
  questions: {
    selectAnswer: "Vyberte správnou odpověď:",
    submit: "Odeslat odpověď",
    correct: "Správně!",
    incorrect: "Nesprávně",
    explanation: "Vysvětlení",
  },

  // Cases
  cases: {
    patientInfo: "Informace o pacientovi",
    vitals: "Vitální znaky",
    labs: "Laboratorní hodnoty",
    selectTherapy: "Vyberte nejvhodnější léčbu:",
    submit: "Odeslat případ",
    feedback: "Zpětná vazba",
    missed: {
      contraindications: "Zmeškané kontraindikace",
      interactions: "Zmeškané lékové interakce",
      monitoring: "Zmeškané parametry monitorování",
    },
  },

  // Drugs
  drugs: {
    search: "Hledat léčiva, třídy...",
    class: "Třída",
    indications: "Indikace",
    mechanism: "Mechanismus účinku",
    adverseEffects: "Nežádoucí účinky",
    contraindications: "Kontraindikace",
    monitoring: "Monitorování",
    doseText: "Typická dávka (Vzdělávací)",
  },

  // Progress
  progress: {
    title: "Váš pokrok",
    byModule: "podle modulu",
    byTag: "podle tématu",
    accuracyRate: "Procento správných odpovědí",
    attempts: "Pokusy",
  },

  // Common
  common: {
    loading: "Načítání...",
    error: "Chyba",
    back: "Zpět",
    next: "Další",
    close: "Zavřít",
    cancel: "Zrušit",
    save: "Uložit",
  },

  // Admin
  admin: {
    title: "Administrátorský panel",
    dataset: "Správa datasetu",
    validate: "Validovat",
    import: "Importovat",
    export: "Exportovat",
    lint: "Zkontrolovat dataset",
  },

  // Errors
  errors: {
    pageNotFound: "Stránka nenalezena",
    pageNotFoundMessage: "Stránka, kterou hledáte, neexistuje nebo byla přesunuta.",
    dataLoadError: "Chyba načítání dat",
    dataLoadErrorMessage: "Nepodařilo se načíst požadovaná data. Zkuste stránku obnovit.",
    serverError: "Chyba serveru",
    serverErrorMessage: "Něco se pokazilo na naší straně. Zkuste to prosím později.",
    unauthorized: "Neautorizováno",
    unauthorizedMessage: "Nemáte oprávnění k přístupu na tuto stránku.",
    sessionExpired: "Relace vypršela",
    sessionExpiredMessage: "Vaše relace vypršela. Přihlaste se prosím znovu.",
    goHome: "Domů",
    reportIssue: "Nahlásit problém",
    retry: "Zkusit znovu",
  },
};

export type I18nDict = typeof cs;
