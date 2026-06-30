# Edit Account Info Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phep sua tung truong thong tin tai khoan qua hop thoai va dieu huong doi mat khau voi Snackbar thanh cong tren trang Tai khoan.

**Architecture:** `AccountInfoFragment` quan ly hop thoai va validation giao dien; `AccountInfoViewModel` quan ly PATCH va trang thai bat dong bo. Luong mat khau tra mot Navigation result ve `AccountMenuFragment` bang `SavedStateHandle`.

**Tech Stack:** Android Java, XML, AndroidX Fragment/Lifecycle/Navigation, Material Snackbar, Retrofit, Supabase REST.

## Global Constraints

- Khong tich hop doi mat khau that voi Supabase Auth.
- Moi PATCH chi chua mot truong duoc sua.
- Du lieu thieu phai hien thi chinh xac `khong co`.
- Khong them dependency moi.

---

### Task 1: Account update state and validation helpers

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/profile/AccountInfoViewModel.java`
- Modify: `app/src/test/java/com/example/fooddelivery/BugRegressionTest.java`

**Interfaces:**
- Produces: `updateField(AccountField field, String value)`, `getUpdateEvent()`, `AccountField` enum, and static validation/format helpers used by the Fragment.

- [ ] **Step 1: Write failing unit tests**

Add tests that assert valid/invalid phone and email values, reject future birth dates, convert `yyyy-MM-dd` to `dd/MM/yyyy`, and verify `User` payload setters selected by every `AccountField`.

- [ ] **Step 2: Run the focused test**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests com.example.fooddelivery.BugRegressionTest`

Expected: FAIL because the new ViewModel helpers and enum do not exist.

- [ ] **Step 3: Implement update state**

Add:

```java
public enum AccountField { NAME, PHONE, EMAIL, BIRTH_DATE, COUNTRY }

public void updateField(AccountField field, String value) {
    int userId = sessionManager.getUserId();
    if (userId <= 0 || updating) return;
    User patch = createPatch(field, value.trim());
    updating = true;
    userRepository.updateUser("eq." + userId, patch).enqueue(/* publish success/failure */);
}
```

On success, merge the value into the current `AccountInfoUiState` and emit a one-shot update event. On failure, leave the state unchanged and emit failure. Add pure static helpers for email, phone, date validation and date display formatting.

- [ ] **Step 4: Run tests**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests com.example.fooddelivery.BugRegressionTest`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/java/com/example/fooddelivery/ui/profile/AccountInfoViewModel.java app/src/test/java/com/example/fooddelivery/BugRegressionTest.java
git commit -m "feat: update account information fields"
```

### Task 2: In-place edit dialogs

**Files:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/profile/AccountInfoFragment.java`

**Interfaces:**
- Consumes: `AccountInfoViewModel.AccountField`, validation helpers, `updateField`, UI state and update event.
- Produces: click behavior for all five existing account rows.

- [ ] **Step 1: Extend regression assertions**

Assert `AccountInfoFragment.java` contains click handlers for `rowName`, `rowPhone`, `rowEmail`, `rowBirthday`, and `rowCountry`, plus `DatePickerDialog` and `updateField`.

- [ ] **Step 2: Run test and verify failure**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests com.example.fooddelivery.BugRegressionTest`

Expected: FAIL because the row click handlers are absent.

- [ ] **Step 3: Add text dialogs**

Create an `EditText` programmatically in `AlertDialog.Builder` and select input type by field:

```java
input.setInputType(field == AccountField.EMAIL
        ? InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS
        : field == AccountField.PHONE
        ? InputType.TYPE_CLASS_PHONE
        : InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_FLAG_CAP_WORDS);
```

Validate name/country non-empty, phone with the ViewModel helper, and email with the ViewModel helper. Keep the dialog open and set `input.setError(...)` when invalid.

- [ ] **Step 4: Add date picker and event feedback**

Use `DatePickerDialog`; reject future dates; send `yyyy-MM-dd`. Observe update events and show `Toast` with `Cap nhat thanh cong` or `Khong the cap nhat. Vui long thu lai`.

- [ ] **Step 5: Run focused tests**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests com.example.fooddelivery.BugRegressionTest`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/java/com/example/fooddelivery/ui/profile/AccountInfoFragment.java app/src/test/java/com/example/fooddelivery/BugRegressionTest.java
git commit -m "feat: add account information edit dialogs"
```

### Task 3: Password navigation result and Snackbar

**Files:**
- Modify: `app/src/main/res/layout/fragment_account_menu.xml`
- Modify: `app/src/main/java/com/example/fooddelivery/ui/profile/AccountMenuFragment.java`
- Modify: `app/src/main/java/com/example/fooddelivery/ui/auth/PasswordFormFragment.java`
- Modify: `app/src/main/res/navigation/nav_profile.xml`
- Modify: `app/src/test/java/com/example/fooddelivery/BugRegressionTest.java`

**Interfaces:**
- Produces: `PASSWORD_CHANGED_RESULT` Boolean result consumed by `AccountMenuFragment`.

- [ ] **Step 1: Write navigation regression test**

Assert that `rowPassword` exists, `action_accountMenu_to_changePassword` targets `changePasswordFragment`, and the Java sources contain `PASSWORD_CHANGED_RESULT` and `Snackbar.make`.

- [ ] **Step 2: Run test and verify failure**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests com.example.fooddelivery.BugRegressionTest`

Expected: FAIL because the password row has no id/action/result.

- [ ] **Step 3: Wire navigation**

Assign `@+id/rowPassword` in XML. Move/add this action under `accountMenuFragment`:

```xml
<action
    android:id="@+id/action_accountMenu_to_changePassword"
    app:destination="@id/changePasswordFragment" />
```

Navigate from the row click listener.

- [ ] **Step 4: Return and consume success once**

Before `popBackStack()` in CHANGE mode:

```java
NavController controller = NavHostFragment.findNavController(this);
NavBackStackEntry previous = controller.getPreviousBackStackEntry();
if (previous != null) {
    previous.getSavedStateHandle().set(AccountMenuFragment.PASSWORD_CHANGED_RESULT, true);
}
controller.popBackStack();
```

Observe the current entry in `AccountMenuFragment`, remove the result after handling, and call:

```java
Snackbar.make(view, "Mat khau da duoc thay doi", Snackbar.LENGTH_SHORT).show();
```

Use Vietnamese Unicode text in source so the visible copy is `Mật khẩu đã được thay đổi`.

- [ ] **Step 5: Run focused tests**

Run: `.\gradlew.bat :app:testDebugUnitTest --tests com.example.fooddelivery.BugRegressionTest`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/res/layout/fragment_account_menu.xml app/src/main/res/navigation/nav_profile.xml app/src/main/java/com/example/fooddelivery/ui/profile/AccountMenuFragment.java app/src/main/java/com/example/fooddelivery/ui/auth/PasswordFormFragment.java app/src/test/java/com/example/fooddelivery/BugRegressionTest.java
git commit -m "feat: connect password change navigation feedback"
```

### Task 4: Full verification

**Files:**
- Verify all modified files.

**Interfaces:**
- Consumes: completed account edit and password navigation flows.

- [ ] **Step 1: Run unit tests**

Run: `.\gradlew.bat :app:testDebugUnitTest`

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 2: Build debug APK**

Run: `.\gradlew.bat :app:assembleDebug`

Expected: `BUILD SUCCESSFUL` and APK at `app/build/outputs/apk/debug/app-debug.apk`.

- [ ] **Step 3: Review diff scope**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; only planned files plus pre-existing user changes are present.
