# Real Password Recovery Kế hoạch implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Mục tiêu:** Replace the fake forgot-password flow with a real Supabase Auth email OTP recovery flow.

**Kiến trúc:** Keep the existing Android Java + MVVM + Retrofit style. Add a recovery-specific Retrofit client that never reads `SessionManager`, and share recovery state across `ForgetPassFragment`, `VerifyOtpFragment`, and `PasswordFormFragment` through an `AuthActivity`-scoped `PasswordRecoveryViewModel`.

**Tech stack:** Android Java, AndroidX Fragment/ViewModel/LiveData, Retrofit, OkHttp, Gson, Supabase Auth REST API.

## Global Constraints

- Do not change login, signup, profile, cart, order, menu, or home behavior.
- Do not add Supabase SDK in this task.
- Do not add Supabase Edge Functions in this task.
- Do not store recovery token in `SessionManager`, `SharedPreferences`, `Bundle`, local database, logs, or crash reports.
- Use only Supabase anon key in the app; never use `service_role` or secret keys.
- Recovery API headers:
  - all recovery requests include `apikey: <SUPABASE_ANON_KEY>` and `Content-Type: application/json`
  - `/recover` and `/verify` use `Authorization: Bearer <SUPABASE_ANON_KEY>`
  - `/user` password update uses `Authorization: Bearer <recovery access token>`
- Email is `trim()` + lowercase before Auth/recovery.
- OTP is one existing `EditText`, numeric, max length 6, and only verified by Supabase.
- Password rule: 8-20 chars, at least one letter, one digit, one special character, confirm must match.
- Supabase Reset Password email template must contain `{{ .Token }}`.

---

## File Structure

- Create `app/src/main/java/com/example/fooddelivery/data/remote/apis/PasswordRecoveryApiService.java`
  - Retrofit interface for `auth/v1/recover`, `auth/v1/verify`, and `auth/v1/user`.
- Create `app/src/main/java/com/example/fooddelivery/data/remote/PasswordRecoveryClient.java`
  - Retrofit instance with recovery-specific headers and no `SessionManager`.
- Create `app/src/main/java/com/example/fooddelivery/data/repository/PasswordRecoveryRepository.java`
  - Thin wrapper around recovery API calls.
- Create models under `app/src/main/java/com/example/fooddelivery/data/remote/response/`
  - `RecoveryEmailRequest`
  - `RecoveryVerifyRequest`
  - `RecoveryUpdatePasswordRequest`
  - `SupabaseAuthError`
  - reuse or extend `AuthResponse` if it already exposes `access_token`.
- Create `app/src/main/java/com/example/fooddelivery/ui/auth/PasswordRecoveryViewModel.java`
  - Holds normalized email, masked email, recovery access token, cooldown, loading/error/event state, and in-flight `Call` references.
- Modify `app/src/main/java/com/example/fooddelivery/ui/auth/ForgetPassFragment.java`
  - Validate email, send OTP, observe send events.
- Modify `app/src/main/java/com/example/fooddelivery/ui/auth/VerifyOtpFragment.java`
  - Remove hard-coded OTP, verify OTP, resend OTP, masked email, cooldown UI.
- Modify `app/src/main/java/com/example/fooddelivery/ui/auth/PasswordFormFragment.java`
  - Only `MODE_RESET` uses recovery update password. `MODE_CREATE` and `MODE_CHANGE` stay unchanged.
- Modify layouts only where necessary:
  - `app/src/main/res/layout/auth_fragment_forget_password.xml`
  - `app/src/main/res/layout/auth_fragment_verify_otp.xml`
  - `app/src/main/res/layout/fragment_password_form.xml`
- Modify `app/src/main/res/values/strings.xml` only if moving hard-coded Vietnamese copy into resources.
- Use existing colors:
  - enabled resend: `@color/brand_primary` or `@color/orange_primary`
  - disabled resend: `@color/text_secondary`

---

### Task 1: Add Recovery API Contract

**File:**
- Create: `app/src/main/java/com/example/fooddelivery/data/remote/apis/PasswordRecoveryApiService.java`
- Create: `app/src/main/java/com/example/fooddelivery/data/remote/response/RecoveryEmailRequest.java`
- Create: `app/src/main/java/com/example/fooddelivery/data/remote/response/RecoveryVerifyRequest.java`
- Create: `app/src/main/java/com/example/fooddelivery/data/remote/response/RecoveryUpdatePasswordRequest.java`
- Create: `app/src/main/java/com/example/fooddelivery/data/remote/response/SupabaseAuthError.java`

**Interface:**
- Produces:
  - `Call<Void> recover(RecoveryEmailRequest request)`
  - `Call<AuthResponse> verify(RecoveryVerifyRequest request)`
  - `Call<AuthResponse> updatePassword(String authorization, RecoveryUpdatePasswordRequest request)`

- [ ] **Step 1: Create request/error models**

```java
package com.example.fooddelivery.data.remote.response;

import com.google.gson.annotations.SerializedName;

public class RecoveryEmailRequest {
    @SerializedName("email")
    public final String email;

    public RecoveryEmailRequest(String email) {
        this.email = email;
    }
}
```

```java
package com.example.fooddelivery.data.remote.response;

import com.google.gson.annotations.SerializedName;

public class RecoveryVerifyRequest {
    @SerializedName("email")
    public final String email;

    @SerializedName("token")
    public final String token;

    @SerializedName("type")
    public final String type;

    public RecoveryVerifyRequest(String email, String token) {
        this.email = email;
        this.token = token;
        this.type = "recovery";
    }
}
```

```java
package com.example.fooddelivery.data.remote.response;

import com.google.gson.annotations.SerializedName;

public class RecoveryUpdatePasswordRequest {
    @SerializedName("password")
    public final String password;

    public RecoveryUpdatePasswordRequest(String password) {
        this.password = password;
    }
}
```

```java
package com.example.fooddelivery.data.remote.response;

import com.google.gson.annotations.SerializedName;

public class SupabaseAuthError {
    @SerializedName("code")
    public String code;

    @SerializedName("message")
    public String message;

    @SerializedName("error")
    public String error;

    @SerializedName("error_description")
    public String errorDescription;
}
```

- [ ] **Step 2: Create Retrofit interface**

```java
package com.example.fooddelivery.data.remote.apis;

import com.example.fooddelivery.data.remote.response.AuthResponse;
import com.example.fooddelivery.data.remote.response.RecoveryEmailRequest;
import com.example.fooddelivery.data.remote.response.RecoveryUpdatePasswordRequest;
import com.example.fooddelivery.data.remote.response.RecoveryVerifyRequest;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;

public interface PasswordRecoveryApiService {
    @POST("auth/v1/recover")
    Call<Void> recover(@Body RecoveryEmailRequest request);

    @POST("auth/v1/verify")
    Call<AuthResponse> verify(@Body RecoveryVerifyRequest request);

    @PUT("auth/v1/user")
    Call<AuthResponse> updatePassword(
            @Header("Authorization") String authorization,
            @Body RecoveryUpdatePasswordRequest request
    );
}
```

- [ ] **Step 3: Compile-check**

Run:

```powershell
.\gradlew.bat :app:compileDebugJavaWithJavac
```

Expected: compile succeeds or only fails on later missing recovery classes not yet added.

---

### Task 2: Add Recovery Client And Repository

**File:**
- Create: `app/src/main/java/com/example/fooddelivery/data/remote/PasswordRecoveryClient.java`
- Create: `app/src/main/java/com/example/fooddelivery/data/repository/PasswordRecoveryRepository.java`

**Interface:**
- Consumes: `PasswordRecoveryApiService`
- Produces:
  - `Call<Void> sendRecoveryOtp(String email)`
  - `Call<AuthResponse> verifyRecoveryOtp(String email, String otp)`
  - `Call<AuthResponse> updatePassword(String recoveryAccessToken, String newPassword)`

- [ ] **Step 1: Create recovery Retrofit client**

```java
package com.example.fooddelivery.data.remote;

import com.example.fooddelivery.utils.Constants;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class PasswordRecoveryClient {
    private static Retrofit retrofit;

    public static Retrofit getInstance() {
        if (retrofit == null) {
            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(chain -> {
                        Request request = chain.request();
                        Request.Builder builder = request.newBuilder()
                                .header("apikey", Constants.SUPABASE_ANON_KEY);

                        if (request.header("Authorization") == null) {
                            builder.header("Authorization", "Bearer " + Constants.SUPABASE_ANON_KEY);
                        }

                        if (request.header("Content-Type") == null) {
                            builder.header("Content-Type", "application/json");
                        }

                        return chain.proceed(builder.build());
                    })
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(Constants.SUPABASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }

        return retrofit;
    }
}
```

- [ ] **Step 2: Create repository**

```java
package com.example.fooddelivery.data.repository;

import com.example.fooddelivery.data.remote.PasswordRecoveryClient;
import com.example.fooddelivery.data.remote.apis.PasswordRecoveryApiService;
import com.example.fooddelivery.data.remote.response.AuthResponse;
import com.example.fooddelivery.data.remote.response.RecoveryEmailRequest;
import com.example.fooddelivery.data.remote.response.RecoveryUpdatePasswordRequest;
import com.example.fooddelivery.data.remote.response.RecoveryVerifyRequest;

import retrofit2.Call;

public class PasswordRecoveryRepository {
    private final PasswordRecoveryApiService api;

    public PasswordRecoveryRepository() {
        api = PasswordRecoveryClient.getInstance().create(PasswordRecoveryApiService.class);
    }

    public Call<Void> sendRecoveryOtp(String email) {
        return api.recover(new RecoveryEmailRequest(email));
    }

    public Call<AuthResponse> verifyRecoveryOtp(String email, String otp) {
        return api.verify(new RecoveryVerifyRequest(email, otp));
    }

    public Call<AuthResponse> updatePassword(String recoveryAccessToken, String newPassword) {
        return api.updatePassword(
                "Bearer " + recoveryAccessToken,
                new RecoveryUpdatePasswordRequest(newPassword)
        );
    }
}
```

- [ ] **Step 3: Compile-check**

Run:

```powershell
.\gradlew.bat :app:compileDebugJavaWithJavac
```

Expected: compile succeeds or only fails on later missing ViewModel/UI references.

---

### Task 3: Add PasswordRecoveryViewModel

**File:**
- Create: `app/src/main/java/com/example/fooddelivery/ui/auth/PasswordRecoveryViewModel.java`

**Interface:**
- Consumes: `PasswordRecoveryRepository`
- Produces public methods:
  - `String normalizeEmail(String rawEmail)`
  - `boolean isValidEmail(String email)`
  - `boolean isValidOtp(String otp)`
  - `boolean isValidPassword(String password)`
  - `boolean hasRecoveryToken()`
  - `String getMaskedEmailValue()`
  - `void sendRecoveryOtp(String rawEmail)`
  - `void verifyOtp(String otp)`
  - `void resendOtp()`
  - `void updatePassword(String password)`
  - `void clearRecoveryState()`
  - `void clearForEmailChange()`

- [ ] **Step 1: Implement ViewModel state shape**

Use `AndroidViewModel` because repository does not need UI context. State can use `MutableLiveData<Boolean>` for loading flags and `MutableLiveData<RecoveryEvent>` for one-time events. Include:

```java
private String normalizedEmail;
private String recoveryAccessToken;
private long resendAvailableAtElapsedMs;
private int requestSequence;
private Call<Void> recoverCall;
private Call<AuthResponse> verifyCall;
private Call<Void> resendCall;
private Call<AuthResponse> updatePasswordCall;
```

- [ ] **Step 2: Add validators**

```java
public String normalizeEmail(String rawEmail) {
    if (rawEmail == null) {
        return "";
    }
    return rawEmail.trim().toLowerCase(Locale.US);
}

public boolean isValidEmail(String email) {
    return !TextUtils.isEmpty(email) && Patterns.EMAIL_ADDRESS.matcher(email).matches();
}

public boolean isValidOtp(String otp) {
    return otp != null && otp.matches("\\d{6}");
}

public boolean isValidPassword(String password) {
    return password != null
            && password.length() >= 8
            && password.length() <= 20
            && password.matches(".*[A-Za-z].*")
            && password.matches(".*\\d.*")
            && password.matches(".*[^A-Za-z0-9].*");
}
```

- [ ] **Step 3: Add masking**

```java
public String maskEmail(String email) {
    if (TextUtils.isEmpty(email) || !email.contains("@")) {
        return "";
    }
    String[] parts = email.split("@", 2);
    String local = parts[0];
    String domain = parts[1];
    if (local.length() <= 1) {
        return local + "***@" + domain;
    }
    if (local.length() == 2) {
        return local.charAt(0) + "***@" + domain;
    }
    return local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
}
```

- [ ] **Step 4: Add event model**

```java
public static class RecoveryEvent {
    public static final int OTP_SENT = 1;
    public static final int OTP_VERIFIED = 2;
    public static final int PASSWORD_UPDATED = 3;
    public static final int ERROR = 4;
    public static final int REQUIRE_EMAIL_STEP = 5;

    public final int type;
    public final String message;
    private boolean consumed;

    public RecoveryEvent(int type, String message) {
        this.type = type;
        this.message = message;
    }

    public boolean consume() {
        if (consumed) {
            return false;
        }
        consumed = true;
        return true;
    }
}
```

- [ ] **Step 5: Add request handling**

Implement each API method with:

```java
final int requestId = ++requestSequence;
```

In callbacks, first check:

```java
if (requestId != requestSequence) {
    return;
}
```

Map messages:

```text
"MÃ£ xÃ¡c minh Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n há»™p thÆ° cá»§a báº¡n."
"MÃ£ xÃ¡c minh khÃ´ng Ä‘Ãºng hoáº·c Ä‘Ã£ háº¿t háº¡n."
"Báº¡n thao tÃ¡c quÃ¡ nhanh, vui lÃ²ng thá»­ láº¡i sau."
"Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i máº¡ng vÃ  thá»­ láº¡i."
"Há»‡ thá»‘ng Ä‘ang gáº·p sá»± cá»‘. Vui lÃ²ng thá»­ láº¡i sau."
"PhiÃªn khÃ´i phá»¥c Ä‘Ã£ háº¿t háº¡n, vui lÃ²ng thá»±c hiá»‡n láº¡i."
"Äá»•i máº­t kháº©u thÃ nh cÃ´ng. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i."
```

- [ ] **Step 6: Add cleanup**

```java
@Override
protected void onCleared() {
    cancelCall(recoverCall);
    cancelCall(verifyCall);
    cancelCall(resendCall);
    cancelCall(updatePasswordCall);
    clearRecoveryState();
    super.onCleared();
}

private void cancelCall(Call<?> call) {
    if (call != null && !call.isCanceled() && !call.isExecuted()) {
        call.cancel();
    }
}
```

- [ ] **Step 7: Compile-check**

Run:

```powershell
.\gradlew.bat :app:compileDebugJavaWithJavac
```

Expected: ViewModel compiles after imports are resolved.

---

### Task 4: Wire ForgetPassFragment

**File:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/auth/ForgetPassFragment.java`
- Modify: `app/src/main/res/layout/auth_fragment_forget_password.xml`

**Interface:**
- Consumes: `PasswordRecoveryViewModel.sendRecoveryOtp(rawEmail)`
- Produces: navigation to `R.id.action_forget_to_otp` only after OTP sent event.

- [ ] **Step 1: Update copy/input**

In `auth_fragment_forget_password.xml`:

```xml
android:hint="Nháº­p email cá»§a báº¡n"
android:inputType="textEmailAddress"
```

For `tvNote`, remove phone copy:

```xml
android:text="ChÃºng tÃ´i sáº½ gá»­i mÃ£ xÃ¡c minh Ä‘áº¿n email cá»§a báº¡n."
```

- [ ] **Step 2: Replace direct navigation**

In `ForgetPassFragment`, remove direct `navController.navigate(...)` from button click. Use:

```java
passwordRecoveryViewModel = new ViewModelProvider(requireActivity()).get(PasswordRecoveryViewModel.class);
```

On click:

```java
String email = edEmailPhone.getText().toString();
String normalized = passwordRecoveryViewModel.normalizeEmail(email);
if (TextUtils.isEmpty(normalized)) {
    edEmailPhone.setError("Vui lÃ²ng nháº­p email.");
    edEmailPhone.requestFocus();
    return;
}
if (!passwordRecoveryViewModel.isValidEmail(normalized)) {
    edEmailPhone.setError("Email khÃ´ng há»£p lá»‡.");
    edEmailPhone.requestFocus();
    return;
}
passwordRecoveryViewModel.sendRecoveryOtp(email);
```

- [ ] **Step 3: Observe loading/events**

When loading send OTP:

```java
edEmailPhone.setEnabled(!isLoading);
btnNext.setEnabled(!isLoading);
```

On `OTP_SENT` event:

```java
Toast.makeText(requireContext(), event.message, Toast.LENGTH_SHORT).show();
navController.navigate(R.id.action_forget_to_otp);
```

- [ ] **Step 4: Back clears recovery state**

```java
tvBack.setOnClickListener(v -> {
    passwordRecoveryViewModel.clearRecoveryState();
    navController.popBackStack();
});
```

---

### Task 5: Wire VerifyOtpFragment

**File:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/auth/VerifyOtpFragment.java`
- Modify: `app/src/main/res/layout/auth_fragment_verify_otp.xml`

**Interface:**
- Consumes: `PasswordRecoveryViewModel.verifyOtp(otp)`, `resendOtp()`, `getMaskedEmailValue()`
- Produces: recovery token in ViewModel and navigation to reset password screen.

- [ ] **Step 1: Remove hard-coded OTP**

Delete:

```java
private static final String CORRECT_OTP = "1";
```

- [ ] **Step 2: Setup masked email**

On view created:

```java
String maskedEmail = passwordRecoveryViewModel.getMaskedEmailValue();
if (TextUtils.isEmpty(maskedEmail)) {
    passwordRecoveryViewModel.clearRecoveryState();
    navController.popBackStack(R.id.forgetPassFragment, false);
    return;
}
tvEmailDesc.setText("Kiá»ƒm tra " + maskedEmail + " Ä‘á»ƒ láº¥y mÃ£ xÃ¡c minh");
```

- [ ] **Step 3: Validate OTP before verify**

```java
String otp = edOtp.getText().toString().trim();
if (TextUtils.isEmpty(otp)) {
    edOtp.setError("Vui lÃ²ng nháº­p mÃ£ xÃ¡c minh.");
    edOtp.requestFocus();
    return;
}
if (!passwordRecoveryViewModel.isValidOtp(otp)) {
    edOtp.setError("MÃ£ xÃ¡c minh gá»“m 6 chá»¯ sá»‘.");
    edOtp.requestFocus();
    return;
}
passwordRecoveryViewModel.verifyOtp(otp);
```

- [ ] **Step 4: Implement resend UI**

Use:

```text
disabled text: "Gá»­i láº¡i mÃ£ sau 60s"
enabled text: "Gá»­i láº¡i mÃ£"
disabled color: R.color.text_secondary
enabled color: R.color.brand_primary or R.color.orange_primary
```

On resend success:

```java
edOtp.setText("");
edOtp.setError(null);
edOtp.requestFocus();
```

- [ ] **Step 5: Change email clears state**

```java
tvChangeEmail.setOnClickListener(v -> {
    passwordRecoveryViewModel.clearForEmailChange();
    navController.popBackStack();
});
```

- [ ] **Step 6: Navigate after verify**

On `OTP_VERIFIED` event:

```java
navController.navigate(R.id.action_otp_to_reset);
```

---

### Task 6: Wire PasswordFormFragment MODE_RESET

**File:**
- Modify: `app/src/main/java/com/example/fooddelivery/ui/auth/PasswordFormFragment.java`
- Modify: `app/src/main/res/layout/fragment_password_form.xml`

**Interface:**
- Consumes: `PasswordRecoveryViewModel.updatePassword(newPass)`
- Produces: password update and navigation to `R.id.action_reset_to_login`.

- [ ] **Step 1: Scope recovery to MODE_RESET**

In `handleSubmit()`, keep existing `MODE_CREATE` and `MODE_CHANGE` behavior intact. Add:

```java
if (MODE_RESET.equals(currentMode)) {
    handleResetPasswordSubmit();
    return;
}
```

- [ ] **Step 2: Add reset validation**

```java
private void handleResetPasswordSubmit() {
    String newPass = edNewPassword.getText().toString().trim();
    String confirmPass = edConfirmPassword.getText().toString().trim();

    if (TextUtils.isEmpty(newPass)) {
        edNewPassword.setError("Vui lÃ²ng nháº­p máº­t kháº©u má»›i.");
        return;
    }
    if (newPass.length() < 8 || newPass.length() > 20) {
        edNewPassword.setError("Máº­t kháº©u pháº£i tá»« 8 Ä‘áº¿n 20 kÃ½ tá»±.");
        return;
    }
    if (!passwordRecoveryViewModel.isValidPassword(newPass)) {
        edNewPassword.setError("Máº­t kháº©u pháº£i cÃ³ chá»¯ cÃ¡i, chá»¯ sá»‘ vÃ  kÃ½ tá»± Ä‘áº·c biá»‡t.");
        return;
    }
    if (!newPass.equals(confirmPass)) {
        edConfirmPassword.setError("Máº­t kháº©u nháº­p láº¡i khÃ´ng khá»›p.");
        return;
    }
    if (!passwordRecoveryViewModel.hasRecoveryToken()) {
        passwordRecoveryViewModel.clearRecoveryState();
        Navigation.findNavController(requireView()).popBackStack(R.id.forgetPassFragment, false);
        Toast.makeText(requireContext(), "PhiÃªn khÃ´i phá»¥c Ä‘Ã£ háº¿t háº¡n, vui lÃ²ng thá»±c hiá»‡n láº¡i.", Toast.LENGTH_SHORT).show();
        return;
    }
    passwordRecoveryViewModel.updatePassword(newPass);
}
```

- [ ] **Step 3: Toggle password visibility**

Use `ivToggleNew` and `ivToggleConfirm`; default hidden, tap toggles one field only, loading disables icons, and toggling must not clear text.

- [ ] **Step 4: Success navigation**

On `PASSWORD_UPDATED` event:

```java
Toast.makeText(requireContext(), "Äá»•i máº­t kháº©u thÃ nh cÃ´ng. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i.", Toast.LENGTH_SHORT).show();
Navigation.findNavController(requireView()).navigate(R.id.action_reset_to_login);
```

- [ ] **Step 5: Back from reset clears token**

When handling toolbar/system back for reset screen, clear recovery state and return to email step.

---

### Task 7: Tests And Verification

**File:**
- Create or modify: `app/src/test/java/com/example/fooddelivery/PasswordRecoveryViewModelTest.java`

**Interface:**
- Consumes: validators and state methods from `PasswordRecoveryViewModel`.

- [ ] **Step 1: Add unit tests for pure validation**

Cover:

```text
normalize email trims and lowercases
invalid email rejected
OTP accepts exactly 6 digits
password accepts 8-20 with letter/digit/special
password rejects missing letter/digit/special
password rejects shorter than 8 and longer than 20
```

- [ ] **Step 2: Add state tests where feasible**

Cover:

```text
verify success only stores token when access_token exists
update success clears recovery token/email/cooldown
clearForEmailChange clears old email/token/cooldown
MODE_CREATE and MODE_CHANGE remain outside recovery update flow
```

- [ ] **Step 3: Run unit tests**

Run:

```powershell
.\gradlew.bat :app:testDebugUnitTest
```

Expected: all tests pass.

- [ ] **Step 4: Run debug build**

Run:

```powershell
.\gradlew.bat :app:assembleDebug
```

Expected: build succeeds.

- [ ] **Step 5: Manual Supabase test**

Before manual test, configure Supabase Reset Password email template to include:

```text
{{ .Token }}
```

Manual test cases:

```text
email receives 6-digit OTP
wrong OTP shows "MÃ£ xÃ¡c minh khÃ´ng Ä‘Ãºng hoáº·c Ä‘Ã£ háº¿t háº¡n."
correct OTP opens reset password screen
new password can log in
old password cannot log in
resend is disabled with 60s countdown
429 shows "Báº¡n thao tÃ¡c quÃ¡ nhanh, vui lÃ²ng thá»­ láº¡i sau."
```

---

## Self-Review

- Spec coverage: The plan covers real Supabase recovery APIs, OTP validation, recovery token handling, loading/cooldown, errors, security, scope, and verification.
- Placeholder scan: No `TBD`/`TODO` placeholders remain.
- Type consistency: API method names and ViewModel method names are defined before UI tasks consume them.



