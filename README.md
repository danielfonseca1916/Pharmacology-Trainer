# Pharmacology Trainer

A production-ready web application for pharmacology education, built with Next.js 14, TypeScript, Tailwind CSS, and Prisma. The platform provides interactive learning modules for students to master pharmacological concepts through MCQs, case-based reasoning, mechanism-of-action training, and more.

**⚠️ EDUCATIONAL USE ONLY** - This application is designed for student education and training purposes only. It is NOT intended for clinical decision-making or patient care.

## Features

- **Interactive Learning Modules:**
  - Question Bank (MCQ/SBA questions with immediate feedback)
  - Case-Based Clinical Reasoning
  - Mechanism-of-Action Trainer
  - Adverse Effects & Contraindications Drill
  - Interactions Sandbox
  - Dose Calculation Practice

- **Comprehensive Content:**
  - 5 Course Blocks: ANS, Cardiovascular, Antibiotics, CNS, Endocrine
  - 14+ drugs with bilingual information (EN/CS)
  - 10+ MCQ/SBA questions per block
  - 5 clinical case studies with scoring rubric
  - 10+ drug-drug interaction rules
  - 5+ dose calculation templates

- **Multi-language Support:**
  - English (EN) and Czech (CS)
  - All content and UI fully bilingual
  - Language preference persisted to localStorage

- **Authentication & Progress Tracking:**
  - Secure user registration and login with bcryptjs
  - Session-based authentication with NextAuth.js
  - Progress tracking by module and topic
  - Spaced repetition system support

- **Data Validation:**
  - Zod schemas for all content types
  - CLI validation script for seed data
  - Type-safe database operations with Prisma

- **Admin Dataset Tools:**
  - Protected admin area for dataset management
  - Upload and validate JSON files
  - Comprehensive linting (duplicate IDs, broken refs, missing translations)
  - Export dataset as single JSON bundle
  - Import custom dataset overrides
  - Role-based access control (ADMIN role required)

- **Comprehensive Testing:**
  - 24+ unit tests with Vitest (all passing)
  - E2E test suite with Playwright
  - Tests cover: validation, content loading, i18n, scoring, interactions

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js 5 with Credentials provider
- **Security:** bcryptjs for password hashing
- **Validation:** Zod 3.24.1
- **Localization:** Custom i18n context (EN/CS)
- **Testing:** Vitest 2.1.5, Playwright 1.49.1

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pharmacology-trainer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database with demo data:**
   ```bash
   npm run seed
   ```

### Running the Application

**Development mode:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production build:**
```bash
npm run build
npm start
```

## Testing

### Unit Tests

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with coverage:
```bash
npm test -- --coverage
```

**Test Suites:**
- `tests/validation.test.ts` (5 tests) - Zod schema validation
- `tests/content.test.ts` (6 tests) - Content loading and search
- `tests/i18n.test.ts` (5 tests) - Localization consistency
- `tests/scoring.test.ts` (5 tests) - Case scoring logic
- `tests/interactions.test.ts` (3 tests) - Interaction rule validation

**Current Status:** ✅ All 24 tests passing

### E2E Tests

Run end-to-end tests with Playwright:
```bash
npx playwright test
```

Run tests in headed mode (with browser UI):
```bash
npx playwright test --headed
```

Run tests for a specific browser:
```bash
npx playwright test --project=chromium
```

**Test Coverage:**
- User registration with unique email
- User login with credentials
- Education disclaimer acceptance
- Dashboard navigation and course blocks display
- Question Bank MCQ interaction:
  - Select answer
  - Submit
  - View feedback and explanation
- API verification (POST /api/attempts)
- Progress page navigation
- User session persistence
- Account page and logout

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run unit tests |
| `npm run seed` | Seed database with demo data |
| `npm run validate:data` | Validate seed data against schemas |
| `npm run dataset:lint` | Run comprehensive dataset linting |
| `npm run dataset:export` | Export dataset to exports/ folder |
| `npm run dataset:validate` | Alias for validate:data |
| `npm run admin:promote` | Promote user to ADMIN role |
| `npm run e2e` | Run Playwright E2E tests |

## Project Structure

```
pharmacology-trainer/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, register)
│   ├── (protected)/              # Protected routes (require auth)
│   │   ├── dashboard/
│   │   ├── modules/
│   │   ├── drugs/
│   │   ├── progress/
│   │   ├── account/
│   │   └── layout.tsx
│   ├── admin/                    # Admin-only routes
│   │   ├── dataset/              # Dataset management UI
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── register/
│   │   ├── attempts/
│   │   ├── srs/
│   │   └── admin/                # Admin API routes
│   │       ├── validate/
│   │       ├── lint/
│   │       ├── export/
│   │       ├── import/
│   │       └── overrides/[id]/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root redirect
│   └── dataset/                 # Dataset management library
│   │   ├── schemas.ts           # Zod schemas for all entity types
│   │   ├── linter.ts            # Validation and linting functions
│   │   ├── loader.ts            # Load seed data
│   │   ├── types.ts             # TypeScript types
│   │   └── index.ts             # Public API
│   ├── schemas.ts               # Legacy schemas (use lib/dataset instead)
│   ├── content.ts               # Content loader and search
│   ├── admin-auth.ts            # Admin route protections
│   ├── DisclaimerModal.tsx
│   └── LanguageToggle.tsx
├── lib/                          # Utility functions and configurations
│   ├── i18n/                     # Localization
│   │   ├── en.ts                # English translations
│   │   ├── cs.ts                # Czech translations
│   │   └── index.tsx            # i18n context provider
│   ├── schemas.ts               # Zod validation schemas
│   ├── content.ts               # Content loader and search
│   └── prisma.ts                # Prisma client singleton
├── data/seed/                   # Seed data (JSON)
│   ├── courseBlocks.json        # 5 course blocks
│   ├── drugs.json               # 14 drugs with complete pharmacology
│   ├── questions.json           # 10 MCQ questions
│   ├── cases.json               # 5 clinical case studies
│   ├── validate-data.ts         # CLI script to validate seed data
│   ├── dataset-lint.ts          # CLI script to lint dataset
│   ├── dataset-export.ts        # CLI script to export dataset
│   └── promote-admin.ts         # CLI script to promote user to ADMIN
│   └── doseTemplates.json       # 5 dose calculation templates
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── dev.db                   # SQLite database (created after migration)
├── scripts/
│   └── validate-data.ts         # CLI script to validate seed data
├── tests/                       # Unit tests (Vitest)
│   ├── validation.test.ts
│   ├── interactions.test.ts
│   └── admin-dataset.test.ts    # Dataset validation/linting tes
│   ├── i18n.test.ts
│   ├── scoring.test.ts
│   └── interactions.test.ts
├── e2e/                         # E2E tests (Playwright)
│   ├── auth-and-mcq.spec.ts
│   └── admin-dataset.spec.ts    # Admin UI tests
├── .env                         # Environment variables
├── playwright.config.ts         # Playwright configuration
├── vitest.config.ts             # Vitest configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── next.config.ts              # Next.js configuration
└── package.json                # Dependencies and scripts
```

## Database Schema

### Users & Authenticationrole (USER/ADMIN), createdAt
- **UserSettings:** language preference, timezone, notifications

### Learning & Progress
- **Bookmark:** User bookmarks for drugs, questions, cases
- **Attempt:** User attempts with answers, scores, and feedback
- **ProgressByTag:** Aggregated progress by module, course block, and tag
- **SpacedRepetitionItem:** Spaced repetition tracking for items

### Admin & Dataset Management
- **DatasetOverride:** Custom dataset imports (name, jsonText, isActive, createdBy), and tag
- **SpacedRepetitionItem:** Spaced repetition tracking for items

## Seed Data

The application includes realistic seed data with 5 course blocks:

### 1. ANS (Autonomic Nervous System)
- Drugs: Neostigmine, Atropine, Propranolol
- Questions: Cholinergic pharmacology, anticholinergic effects
- Cases: Cholinergic crisis management

### 2. Cardiovascular (CV)
- Drugs: Metoprolol, Amlodipine, Lisinopril, Warfarin
- Questions: Beta-blockers, ACE inhibitors, anticoagulation
- Cases: Hypertension management, atrial fibrillation

### 3. Antibiotics (ABX)
- Drugs: Amoxicillin, Azithromycin, Vancomycin, Clindamycin
- Questions: C. difficile risk, beta-lactam allergy
- Cases: Strep pharyngitis, bacterial infections

### 4. CNS (Central Nervous System)
- Drugs: Sertraline, Lorazepam, Fluoxetine
- Questions: SSRIs, benzodiazepines, serotonin syndrome
- Cases: Panic disorder, depression treatment

### 5. Endocrine
- Drugs: Insulin glargine, Metformin, Levothyroxine
- Questions: Insulin types, diabetes management
- Cases: Type 2 diabetes, hypothyroidism

## Extending the Dataset

### Important: Use the Admin Tools

For easier dataset management, use the admin web interface at `/admin/dataset` or the CLI tools:

```bash
# Validate dataset
npm run dataset:validate

# Run comprehensive linting
npm run dataset:lint

# Export dataset
npm run dataset:export
```

### Promoting a User to Admin

To access the admin tools, promote a user account to ADMIN:

```bash
npm run admin:promote -- --email=user@example.com
```

Or manually update in SQLite:
```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'user@example.com';
```

### Admin Dataset Management UI

Access `/admin/dataset` (requires ADMIN role) for:

1. **Schemas Tab** - View all entity schemas and examples
2. **Validate Files Tab** - Upload JSON files for validation
3. **Lint Dataset Tab** - Run comprehensive checks on current data:
   - Duplicate IDs
   - Missing translations (EN required, CS warned)
   - Broken references (courseBlockId, drugId, etc.)
   - Tag format issues
4. **Export Tab** - Download complete dataset bundle as JSON
5. **Import Tab** - Upload and activate custom dataset overrides

### Dataset Override System

Admins can import alternative datasets that override the default seed data:

- **Import:** Upload a JSON bundle via `/admin/dataset` → Import tab
- **Activate:** Set one override as active (deactivates others)
- **Fallback:** If no override is active, app uses seed data
- **Storage:** Overrides stored in `DatasetOverride` table

### Linting Rules

The dataset linter checks for:

| Check | Severity | Description |
|-------|----------|-------------|
| Duplicate IDs | Error | Same ID used twice in a collection |
| Missing EN translation | Error | Empty or missing English text |
| Missing CS translation | Warning | Empty or missing Czech text |
| Broken courseBlockId | Error | References non-existent course block |
| Broken drugId | Error | Interaction references unknown drug |
| No correct option | Error | Question has no correct answer marked |
| Invalid rubric ref | Error | Case rubric references non-existent choice |
| Tag format | Warning | Tags should be lowercase and trimmed |

Run linting before importing or in CI:
```bash
npm run dataset:lint
# Exits with code 1 if errors found
```

### Adding a New Drug

1. Edit `data/seed/drugs.json`:
   ```json
   {
     "id": "drug-newdrug",
     "name": { "en": "New Drug Name", "cs": "Nový název léku" },
     "class": { "en": "Drug Class", "cs": "Třída léku" },
     "indications": { "en": "Indication text...", "cs": "Text indikace..." },
     "mechanism": { "en": "Mechanism...", "cs": "Mechanismus..." },
     "adverseEffects": { "en": "Side effects...", "cs": "Nežádoucí účinky..." },
     "contraindications": { "en": "Contraindications...", "cs": "Kontraindikace..." },
     "monitoring": { "en": "Monitoring parameters...", "cs": "Monitorování..." },
     "interactionsSummary": { "en": "Key interactions...", "cs": "Klíčové interakce..." },
     "typicalDoseText": { "en": "Dosing...", "cs": "Dávkování..." },
     "tags": ["tag1", "tag2"],
     "courseBlockId": "block-cv"
   }
   ```

2. Validate with:
   ```bash
   npm run validate:data
   ```

### Adding a New Question

1. Edit `data/seed/questions.json`:
   ```json
   {
     "id": "q-newquestion",
     "stem": { 
       "en": "Question text?", 
       "cs": "Text otázky?" 
     },
     "options": [
       { "id": "a", "text": { "en": "Option A", "cs": "Možnost A" }, "correct": true },
       { "id": "b", "text": { "en": "Option B", "cs": "Možnost B" }, "correct": false }
     ],
     "explanation": { 
       "en": "Explanation of correct answer...", 
       "cs": "Vysvětlení správné odpovědi..." 
     },
     "tags": ["topic-tag"],
     "courseBlockId": "block-cv"
   }
   ```

2. Validate with:
   ```bash
   npm run validate:data
   ```

### Adding a New Case

1. Edit `data/seed/cases.json`:
   ```json
   {
  # API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/register` - User registration

### Learning
- `POST /api/attempts` - Log user attempt and update progress
- `POST /api/srs` - Update spaced repetition system

### Admin (requires ADMIN role)
- `POST /api/admin/validate` - Validate uploaded JSON files
- `GET /api/admin/lint` - Lint current seed dataset
- `GET /api/admin/export` - Export dataset bundle
- `POST /api/admin/import` - Import dataset override
- `GET /api/admin/import` - List stored overrides
- `POST /api/admin/overrides/[id]` - Activate override
- `DELETE /api/admin/overrides/[id]` - Delete override
     },
     "vitals": {
       "bp": "150/90",
       "hr": 88,
       "temp": 37.0
     },
     "labs": {
       "K": 5.5,
       "Cr": 1.0
     },
     "choices": [
       {
         "id": "1",
         "option": { "en": "Treatment option 1", "cs": "Léčebná volba 1" },
         "explanation": { "en": "Why this works...", "cs": "Proč funguje..." }
       }
     ],
     "rubric": {
       "correctChoiceId": "1",
       "contraindicationsMissed": [],
       "interactionsMissed": [],
       "monitoringMissing": [],
       "scoring": {
         "correct": 70,
         "safety": 20,
         "monitoring": 10
       }
     },
     "courseBlockId": "block-cv",
     "tags": ["hypertension"]
   }
   ```

2. Validate with:
   ```bash
   npm run validate:data
   ```

## Default Credentials (Demo)

For testing purposes, a demo user is seeded:

- **Email:** `demo@pharmtrainer.test`
- **Password:** `Password123!`

You can also create new accounts via the registration page.

## Education-Only Disclaimer

This application displays a prominent disclaimer on first visit:

> **⚠️ EDUCATION ONLY DISCLAIMER**
>
> This application is designed for **educational purposes only**. It is NOT intended for:
> - Clinical decision-making
> - Patient care
> - Prescribing medications
> - Diagnosis or treatment
>
> The content is educational and may not reflect current clinical guidelines. Always consult with qualified healthcare professionals for patient care decisions.

The disclaimer is available in both English and Czech and must be accepted before using the application.

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/register` - User registration

### Learning
- `POST /api/attempts` - Log user attempt and update progress
- `POST /api/srs` - Update spaced repetition system

## Localization (i18n)

All UI strings and content support English and Czech. The language is:
1. Loaded from localStorage on client mount
2. Defaults to English if not set
3. Can be changed via LanguageToggle component
4. All content JSON files have bilingual fields (en/cs)

**Translation Files:**
- `lib/i18n/en.ts` - English translations
- `lib/i18n/cs.ts` - Czech translations

## Performance & Security

- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT-based sessions with NextAuth.js
- ✅ Protected routes via (protected) layout group
- ✅ Type-safe database operations with Prisma
- ✅ Input validation with Zod
- ✅ No sensitive data in environment (secrets in .env)
- ✅ Static site generation where possible
- ✅ Dynamic rendering for auth-dependent pages

## Troubleshooting

### Database Connection Issues
- Ensure `prisma/dev.db` exists
- Run `npx prisma migrate dev --name init`
- Check `.env` DATABASE_URL is correct

### Authentication Not Working
- Clear cookies and localStorage
- Check NEXTAUTH_SECRET in .env
- Verify demo user exists: `npx prisma db push`
- Check `/api/auth/signin` is accessible

### i18n Not Loading
- Browser localStorage must be enabled
- Check browser console for errors
- Language defaults to EN if not found

### Tests Failing
- Run `npm install` to ensure all dependencies
- Delete `.next` and `node_modules`, then reinstall
- Run `npm run validate:data` to check seed data

## Contributing

To extend the application:

1. Add content to JSON seed files and validate
2. Update Prisma schema if adding new models
3. Add corresponding Zod schemas in `lib/schemas.ts`
4. Create new components in `components/`
5. Add new pages in `app/(protected)/`
6. Write tests for new functionality
7. Run `npm test` to verify all tests pass

## License

This is an educational project. Use for learning purposes only.

## Support & Questions

For issues or questions about the application architecture:
1. Check the Project Structure section
2. Review the test files for usage examples
3. Check Zod schema definitions for data structure
4. Review API route implementations

---

**Last Updated:** January 2025  
**Status:** Production-Ready ✅  
**Test Coverage:** 24/24 unit tests passing ✅  
**E2E Tests:** Configured ✅
