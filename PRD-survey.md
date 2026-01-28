# PRD: Parent Survey

## Status: 📋 PLANNED

**Implementation Lead**: Ralphy
**Target**: Q1 2026

---

## Overview

Build a market research survey system to understand demand for holiday/half-term clubs. The survey will be shared via link by a partner organisation (not emailed by us). Results feed into an admin analytics dashboard with visualisations and CSV export.

### Goals

1. **Gather market intelligence** - Understand parent needs, preferences, and demand
2. **Professional UX** - Excellent mobile-first survey experience
3. **Unbranded** - Uses Clubhouse colours/fonts but no company name
4. **Capture partial responses** - Auto-save as users progress to maximise data
5. **Actionable analytics** - Visual dashboard with charts and exportable data

### Key Decisions

| Decision | Choice |
|----------|--------|
| Skip logic if "No" interest | Show all questions anyway (market research value) |
| Partial responses | Save automatically on each step |
| Multiple submissions | Allowed (families share devices) |
| Branding | Colours/fonts only, no company name |
| Q12 max selections | Strict enforcement (3 max) |
| Email collection | With GDPR consent checkbox |
| Location data | Full postcode |

---

## User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Parent | Complete a survey on my phone | I can share feedback quickly |
| Parent | See my progress through the survey | I know how much is left |
| Parent | Go back to previous questions | I can change my answers |
| Parent | Not be forced to answer every question | I can skip what doesn't apply |
| Admin | See response statistics visually | I can quickly understand trends |
| Admin | Export all responses to CSV | I can do deeper analysis in Excel |
| Admin | See partial responses | I still get value from incomplete surveys |

---

## Survey Structure

**URL**: `/survey/holiday-club-survey`
**Format**: 7-page wizard with progress bar

### Page 1: About Your Children
| # | Question | Type | Options |
|---|----------|------|---------|
| 1 | How many children aged 5-12 do you have? | Single select | 1, 2, 3, 4+ |
| 2 | What are their ages? | Multi-select | 5-6, 7-8, 9-10, 11-12 |

### Page 2: Demand for a Club
| # | Question | Type | Options |
|---|----------|------|---------|
| 3 | Would you be interested in a holiday or half-term club? | Single select | Yes definitely, Possibly, No |
| 4 | Which times would you be most interested in? | Multi-select | School half-terms, Summer holidays, Easter holidays, Christmas holidays, Occasional inset days |

### Page 3: Days & Times
| # | Question | Type | Options |
|---|----------|------|---------|
| 5 | What days would you be most likely to use the club? | Single select + conditional | Weekdays only, Specific days (shows Mon-Fri checkboxes), Flexible/varies |
| 6 | What times would suit your family best? | Multi-select | Morning only (9am-12pm), Afternoon only (12pm-3pm), School day hours (9am-3pm), Full day (8:30am-4:30pm) |
| 7 | How many days per week would you likely use the club? | Single select | 1 day, 2-3 days, 4-5 days, Varies week to week |

### Page 4: Activities
| # | Question | Type | Options |
|---|----------|------|---------|
| 8 | Which activities would your children enjoy? | Multi-select | Arts and crafts, Sports and outdoor games, Drama/role play, Music & dance, STEM activities, Baking/cooking, Board games & puzzles, Free play, Trips/special visitors, Quiet activities |
| 9 | Are there any activities your child particularly loves or dislikes? | Text area | Optional, 500 char max |

### Page 5: Age Groups & Structure
| # | Question | Type | Options |
|---|----------|------|---------|
| 10 | Would you prefer activities to be: | Single select | Mixed ages (5-12 together), Split into age groups, A mix of both |
| 11 | Would you prefer a club that is: | Single select | Structured (planned timetable), Flexible (choice-based activities), A mix of both |

### Page 6: Practical Considerations
| # | Question | Type | Options |
|---|----------|------|---------|
| 12 | What would be most important when choosing a club? | Multi-select (MAX 3) | Cost, Qualified/experienced staff, Variety of activities, Safe & familiar environment, Outdoor time, Flexible booking, Location, Quality of experience |
| 13 | Would you be interested in: | Multi-select | Early drop-off, Late pick-up, Sibling discounts |
| — | What is your postcode? | Text input | UK postcode validation |

### Page 7: Final Thoughts
| # | Question | Type | Options |
|---|----------|------|---------|
| 14 | Is there anything else you'd like to see in a holiday or half-term club? | Text area | Optional, 1000 char max |
| 15 | If we organised a club for the next holiday period, would you be interested? | Single select | Yes definitely, Possibly, No |
| 16 | Would you like to be contacted when plans are confirmed? | Yes/No + Email + GDPR | Yes shows email field + required GDPR consent checkbox |

---

## Technical Requirements

### Database Schema

```sql
-- Sessions for auto-save (partial responses)
CREATE TABLE survey_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  current_step INT NOT NULL DEFAULT 1,
  responses JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Completed responses (flattened for analytics)
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES survey_sessions(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_complete BOOLEAN NOT NULL DEFAULT false,

  -- Q1-2: About Children
  num_children VARCHAR(10),
  children_ages TEXT[],

  -- Q3-4: Demand
  interest_level VARCHAR(50),
  holiday_periods TEXT[],

  -- Q5-7: Days & Times
  preferred_days VARCHAR(50),
  specific_days TEXT[],
  preferred_times TEXT[],
  days_per_week VARCHAR(50),

  -- Q8-9: Activities
  activities TEXT[],
  activities_notes TEXT,

  -- Q10-11: Structure
  age_group_preference VARCHAR(50),
  structure_preference VARCHAR(50),

  -- Q12-13 + Postcode: Practical
  important_factors TEXT[],
  additional_services TEXT[],
  postcode VARCHAR(10),

  -- Q14-16: Final
  other_feedback TEXT,
  next_holiday_interest VARCHAR(50),
  contact_consent BOOLEAN DEFAULT false,
  email VARCHAR(255),
  gdpr_consent BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_survey_responses_submitted_at ON survey_responses(submitted_at);
CREATE INDEX idx_survey_responses_is_complete ON survey_responses(is_complete);
CREATE INDEX idx_survey_responses_interest_level ON survey_responses(interest_level);
CREATE INDEX idx_survey_responses_postcode ON survey_responses(postcode);
```

### TypeScript Types

```typescript
export interface SurveySession {
  id: string;
  started_at: string;
  completed_at: string | null;
  current_step: number;
  responses: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  session_id: string | null;
  submitted_at: string;
  is_complete: boolean;

  num_children: string | null;
  children_ages: string[] | null;
  interest_level: string | null;
  holiday_periods: string[] | null;
  preferred_days: string | null;
  specific_days: string[] | null;
  preferred_times: string[] | null;
  days_per_week: string | null;
  activities: string[] | null;
  activities_notes: string | null;
  age_group_preference: string | null;
  structure_preference: string | null;
  important_factors: string[] | null;
  additional_services: string[] | null;
  postcode: string | null;
  other_feedback: string | null;
  next_holiday_interest: string | null;
  contact_consent: boolean;
  email: string | null;
  gdpr_consent: boolean;

  created_at: string;
}

export type SurveySessionInsert = Omit<SurveySession, 'id' | 'created_at' | 'updated_at'>;
export type SurveySessionUpdate = Partial<SurveySessionInsert>;
export type SurveyResponseInsert = Omit<SurveyResponse, 'id' | 'created_at'>;
export type SurveyResponseUpdate = Partial<SurveyResponseInsert>;
```

---

## Feature Breakdown

### Feature 1: Survey Wizard UI

**Location**: `/survey/holiday-club-survey`

#### 1.1 Progress Bar
- Shows steps 1-7 with current step highlighted
- Step names visible on desktop, numbers only on mobile
- Percentage complete indicator

#### 1.2 Navigation
- "Next" button (validates current step before proceeding)
- "Back" button (except on step 1)
- "Submit" button on final step

#### 1.3 Auto-Save
- On each step change, PATCH session with current responses
- Creates session on survey start
- Marks session complete on successful submit

### Feature 2: Question Components

**Location**: `src/components/survey/questions/`

#### 2.1 SingleSelect
- Radio button group with labels
- Optional "Other" with text input
- Keyboard accessible

#### 2.2 MultiSelect
- Checkbox group with labels
- Optional maxSelections prop

#### 2.3 MultiSelectLimited (Q12)
- Checkbox group with strict max enforcement
- Shows "X/3 selected" counter
- Disables unchecked options when limit reached
- Visual feedback on limit

#### 2.4 TextArea
- Optional free text input
- Character counter
- Placeholder text

#### 2.5 DaySelector (Q5)
- Mon-Fri checkboxes
- Only shown when "Specific days" selected
- Horizontal layout on desktop, vertical on mobile

#### 2.6 EmailConsent (Q16)
- Yes/No toggle
- Email input (shown if Yes)
- GDPR checkbox (required if email provided)
- GDPR text: "I consent to being contacted about holiday club plans"

#### 2.7 PostcodeInput
- Text input
- UK postcode validation (regex)
- Uppercase formatting

### Feature 3: Admin Analytics Dashboard

**Location**: `/admin/survey`

#### 3.1 Summary Cards
- Total responses
- Completion rate (complete / total)
- Responses this week
- Most popular interest level

#### 3.2 Question Charts
- Bar or pie chart for each question
- Shows count and percentage
- Sorted by frequency

#### 3.3 Responses Table
- Paginated list of individual responses
- Columns: Date, Postcode, Interest, Children, Complete
- Click to view full response detail

#### 3.4 Export
- CSV download button
- Includes all fields
- Filename: `survey-responses-YYYY-MM-DD.csv`

---

## File Structure

```
src/
├── app/
│   ├── survey/
│   │   └── holiday-club-survey/
│   │       ├── page.tsx                      # Server component with metadata
│   │       └── SurveyWizard.tsx              # Client wizard component
│   └── admin/
│       └── survey/
│           ├── page.tsx                      # Analytics dashboard
│           ├── SurveyAnalytics.tsx           # Client analytics component
│           └── [id]/
│               └── page.tsx                  # Single response detail
│   └── api/
│       └── survey/
│           ├── session/route.ts              # POST create, PATCH update
│           └── submit/route.ts               # POST final submission
│       └── admin/
│           └── survey/
│               ├── responses/route.ts        # GET list with filters
│               ├── analytics/route.ts        # GET aggregated stats
│               └── export/route.ts           # GET CSV download
├── components/
│   └── survey/
│       ├── SurveyProgress.tsx                # Progress bar
│       ├── questions/
│       │   ├── SingleSelect.tsx
│       │   ├── MultiSelect.tsx
│       │   ├── MultiSelectLimited.tsx
│       │   ├── TextArea.tsx
│       │   ├── DaySelector.tsx
│       │   ├── EmailConsent.tsx
│       │   └── PostcodeInput.tsx
│       └── steps/
│           ├── IntroStep.tsx
│           ├── Step1AboutChildren.tsx
│           ├── Step2Demand.tsx
│           ├── Step3DaysTimes.tsx
│           ├── Step4Activities.tsx
│           ├── Step5Structure.tsx
│           ├── Step6Practical.tsx
│           ├── Step7Final.tsx
│           └── ThankYouStep.tsx
│   └── admin/
│       └── survey/
│           ├── ResponsesTable.tsx
│           ├── QuestionChart.tsx
│           └── AnalyticsSection.tsx
```

---

## API Routes

### `POST /api/survey/session`
Creates new survey session, returns session_id.

### `PATCH /api/survey/session`
Updates session with current step and responses (auto-save).

### `POST /api/survey/submit`
Finalizes survey response, validates required fields, saves to survey_responses.

### `GET /api/admin/survey/responses`
Returns paginated list of responses with optional filters (is_complete, date range).

### `GET /api/admin/survey/analytics`
Returns aggregated statistics for each question.

### `GET /api/admin/survey/export`
Returns CSV file of all responses.

---

## Styling Guidelines

### Colors (Craigies Palette - No Branding)
| Name | Hex | Usage |
|------|-----|-------|
| Olive | #7A7C4A | Progress bar, selected states |
| Cream | #F5F4ED | Page background |
| Burnt Orange | #D4843E | CTAs, buttons, focus states |
| Dark Olive | #5A5C3A | Headings, labels |

### Typography
| Element | Font | Weight |
|---------|------|--------|
| Page titles | Playfair Display | 700 |
| Question text | Nunito Sans | 600 |
| Options/labels | Nunito Sans | 400 |
| Buttons | Nunito Sans | 600 |

### Components
- **Buttons**: Burnt orange background, white text, rounded corners
- **Radio/Checkbox**: Custom styled with olive/burnt-orange accents
- **Progress bar**: Olive fill, cream background, step indicators
- **Cards**: White on cream with subtle shadow

### Mobile First
- Full-width inputs and buttons on mobile
- Stack vertically on small screens
- Touch-friendly tap targets (min 44px)

---

## Success Metrics

1. **Completion rate**: Target > 70% of started surveys
2. **Mobile usability**: Works perfectly on phones (primary use case)
3. **Time to complete**: Target < 5 minutes
4. **Data quality**: < 5% invalid postcodes
5. **Admin utility**: Can generate insights within 2 minutes of viewing dashboard
