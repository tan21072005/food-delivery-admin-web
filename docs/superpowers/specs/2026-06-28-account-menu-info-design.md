# Account Menu And Account Info Design

## Goal

Build the account submenu flow shown in the reference images: tapping `Tài khoản` from the profile screen opens a compact account menu, and tapping `Thông tin tài khoản` opens a compact account information page.

## User Experience

The account menu screen uses a light gray background, a simple top bar with a back arrow and title `Tài khoản`, and one white rounded card containing four rows:

- `Thông tin tài khoản`
- `Mật khẩu`
- `Tải về dữ liệu cá nhân`
- `Hủy kích hoạt hoặc xóa tài khoản`

The account information screen uses the same visual structure, with title `Thông tin tài khoản` and one white rounded card containing:

- `Tên`
- `Số điện thoại`
- `Email`
- `Ngày sinh`
- `Quốc gia`

Each row has a chevron on the right, matching the screenshot.

## Architecture

Use the existing Android native Java/XML stack and MVVM shape. Fragments own only view binding and navigation. ViewModels prepare display-ready values. `UserRepository` remains the only path to Retrofit/Supabase user data.

## Data

The account information ViewModel loads the current user by `SessionManager.getUserId()` through `UserRepository.getUserById("eq.<id>")`. If the database returns no row, a null field, or a blank string, the UI displays the exact text `không có`.

Existing session values can be used as a fallback for name and email only when the database request fails or returns no row. Missing database-only fields still display `khong co`.

## Scope

This change does not add editing, password changing, personal-data download, or account deletion behavior. Those menu rows can remain navigable-looking but non-functional for now, except `Thong tin tai khoan`.

## Verification

Build the Android debug APK with `.\gradlew.bat :app:assembleDebug`. The build must pass.
