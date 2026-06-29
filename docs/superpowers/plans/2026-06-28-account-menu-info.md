# Account Menu And Account Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an MVVM account submenu flow and account information page matching the provided mobile screenshots.

**Architecture:** Add two focused profile fragments with XML layouts. Keep Retrofit access behind `UserRepository`; use a ViewModel to expose display-ready account fields with `không có` fallbacks.

**Tech Stack:** Android Java, XML layouts, AndroidX Navigation, LiveData/ViewModel, Retrofit through the existing Supabase client.

## Global Constraints

- Follow existing Java/XML Android patterns in `app/src/main`.
- Do not introduce new dependencies.
- Display the exact fallback text `không có` for missing account information.
- Keep menu-only rows present but non-functional except `Thong tin tai khoan`.

---

### Task 1: Account UI Shell

**Files:**
- Create: `app/src/main/res/layout/fragment_account_menu.xml`
- Create: `app/src/main/res/layout/fragment_account_info.xml`
- Create: `app/src/main/res/drawable/bg_account_card.xml`

**Interfaces:**
- Produces view ids: `btnBack`, `rowAccountInfo`, `tvNameValue`, `tvPhoneValue`, `tvEmailValue`, `tvBirthdayValue`, `tvCountryValue`.

- [ ] Create the two screenshot-style XML layouts with gray backgrounds, top bars, white cards, and row chevrons.

### Task 2: ViewModel Data

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/data/model/User.java`
- Create: `app/src/main/java/com/example/fooddelivery/ui/profile/AccountInfoViewModel.java`

**Interfaces:**
- Produces `LiveData<AccountInfoUiState> getUiState()`.
- Produces `void loadAccountInfo()`.
- Produces `String valueOrEmpty(String value)` indirectly through UI state fields normalized to `khong co`.

- [ ] Add `birth_date` and `country` fields to `User`.
- [ ] Load user by current session id through `UserRepository`.
- [ ] Normalize missing values to `không có`.

### Task 3: Fragment Navigation

**Files:**
- Create: `app/src/main/java/com/example/fooddelivery/ui/profile/AccountMenuFragment.java`
- Create: `app/src/main/java/com/example/fooddelivery/ui/profile/AccountInfoFragment.java`
- Modify: `app/src/main/java/com/example/fooddelivery/ui/profile/ProfileFragment.java`
- Modify: `app/src/main/res/navigation/nav_profile.xml`
- Modify: `app/src/main/java/com/example/fooddelivery/MainActivity.java`

**Interfaces:**
- `AccountMenuFragment` navigates via `R.id.action_accountMenu_to_accountInfo`.
- `ProfileFragment` navigates via `R.id.action_profile_to_accountMenu`.

- [ ] Wire `ProfileFragment` account row to the new account menu.
- [ ] Wire account menu row to the account info page.
- [ ] Hide bottom navigation on account submenu and account info destinations.

### Task 4: Verification

**Files:**
- No source file edits unless build failures require fixes.

- [ ] Run `.\gradlew.bat :app:assembleDebug`.
- [ ] Fix compile errors, if any.
- [ ] Confirm the build reports success.
