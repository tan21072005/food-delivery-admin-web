# Quản lý DeliveryAddress Kế hoạch implementation

> **Danh cho worker agentic:** SUB-SKILL BAT BUOC: Dung superpowers:subagent-driven-development (khuyen nghi) hoac superpowers:executing-plans de trien khai plan nay theo tung task. Cac buoc dung co phap checkbox (`- [ ]`) de theo doi tien do.

**Mục tiêu:** Xay dung day du CRUD DeliveryAddress cua Customer, quan ly default, va noi DeliveryAddress da chon vao checkout Ordering MVP.

**Kiến trúc:** Theo shape MVVM hien co: Fragment so huu UI/rendering, ViewModel so huu screen state va validation, Repository so huu Supabase calls. Backend phai enforce quyen so huu cua Customer va tinh duy nhat cua default; app Android phai xem backend la source of truth.

**Tech stack:** Android Java, AndroidX Fragment/Navigation/ViewModel/LiveData, RecyclerView, Retrofit, Supabase REST/RPC, PostgreSQL/RLS.

## Rang buoc chung

- Nguon plan: `docs/prd/2026-06-28-delivery-address-management.md`.
- Tu vung domain: dung `Customer` va `DeliveryAddress`; tranh `Address` chung chung trong domain code moi, tru cac class compatibility hien co.
- Hien trang: `AddressListFragment` is dummy-only; do not build on dummy data as production state.
- Hien trang: checkout dang co ca Activity/local path va ViewModel/Supabase path; implementation phai quy ve mot huong hoac danh dau transition ro rang.
- Bảo mật: Customer không được đọc/cập nhật/xóa DeliveryAddress của Customer khác.
- Quyen rieng tu: do not log full address, phone, latitude, longitude, or recipient name in analytics/logcat beyond local debug messages.
- Schema: execute real SQL only in an implementation phase with human approval; this plan does not change schema.

---

## Cau truc file

Tao:
- `app/src/main/java/com/example/fooddelivery/data/model/DeliveryAddress.java` - canonical Android model.
- `app/src/main/java/com/example/fooddelivery/data/model/DeliveryAddressRequest.java` - create/update request body.
- `app/src/main/java/com/example/fooddelivery/data/repository/DeliveryAddressRepository.java` - API wrapper.
- `app/src/main/java/com/example/fooddelivery/ui/profile/DeliveryAddressViewModel.java` - list/form/default/delete state and validation.
- `app/src/main/res/layout/fragment_delivery_address_form.xml` - add/edit form.
- `app/src/test/java/com/example/fooddelivery/ui/profile/DeliveryAddressViewModelTest.java` - test ViewModel voi fake repository.

Sua:
- `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java` - DeliveryAddress REST/RPC endpoints.
- `app/src/main/java/com/example/fooddelivery/ui/profile/AddressListFragment.java` - thay dummy list bang list duoc backing boi ViewModel.
- `app/src/main/java/com/example/fooddelivery/ui/profile/AddressAdapter.java` - bind canonical DeliveryAddress fields and expose edit/default/delete/select actions.
- `app/src/main/java/com/example/fooddelivery/data/model/AddressItem.java` - deprecate or adapt only if needed for compatibility.
- `app/src/main/res/layout/fragment_address_list.xml` - add loading/error/empty states if missing.
- `app/src/main/res/layout/item_address.xml` - add controls for edit/delete/set default or contextual menu.
- `app/src/main/res/navigation/nav_profile.xml` - add form destination and selection arguments.
- `app/src/main/java/com/example/fooddelivery/ui/cart/CheckoutViewModel.java` - expose da chon DeliveryAddress state.
- `app/src/main/java/com/example/fooddelivery/ui/cart/Checkout.java` or tuong lai `CheckoutFragment` - hien thi address da chon va chan checkout neu thieu.
- `app/src/main/java/com/example/fooddelivery/data/model/CheckoutRequest.java` - transition from `p_delivery_address` text to da chon address contract when backend is ready.
- `docs/rpc_cart_order.sql` - tuong lai implementation only: update checkout RPC to validate ownership and snapshot address fields.

Khong sua trong handoff lap ke hoach nay:
- `docs/prd/2026-06-28-delivery-address-management.md`
- app code during planning-only worker execution
- schema Supabase that khi chua co phe duyet implementation ro rang

## Task 1: Thiet ke contract backend va RLS

**File:**
- Sua sau: `docs/rpc_cart_order.sql`
- Sua sau: SQL migration file created by implementation worker
- Read: `docs/sql.sql`

**Interface:**
- Tao ra: canonical table/API contract used by Android tasks.
- Tieu thu: hien co `users.auth_uid`, `user_addresses`, `orders`, `checkout_cart`.

- [ ] Buoc 1: Decide table strategy before SQL.

Quy tac quyet dinh:
```text
Prefer extending existing public.user_addresses for MVP if it is the active deployed table.
Prefer creating public.delivery_addresses only if the team accepts a migration and can update all docs/code in one pass.
```

- [ ] Buoc 2: Dinh nghia cac cot muc tieu toi thieu.

Cac cot muc tieu toi thieu:
```text
id
user_id
label
recipient_name
recipient_phone
full_address or address_detail
latitude
longitude
is_default
deleted_at
created_at
updated_at
```

- [ ] Buoc 3: Dinh nghia cac policy RLS.

Hanh vi policy bat buoc:
```text
SELECT: authenticated Customer can read only rows where user_id maps to auth.uid()
INSERT: authenticated Customer can create only rows for their own user_id
UPDATE: authenticated Customer can update only their own non-deleted rows and cannot reassign user_id
DELETE: prefer soft delete via UPDATE deleted_at; hard DELETE only for own rows if allowed
```

- [ ] Buoc 4: Dinh nghia RPC doi default.

Contract ham backend:
```text
set_default_delivery_address(p_delivery_address_id bigint) returns void
- resolve v_user_id from auth.uid()
- verify selected row belongs to v_user_id and deleted_at is null
- update all v_user_id non-deleted addresses to is_default=false
- update selected row to is_default=true
- run in one transaction/function body
- revoke execute from public
- grant execute to authenticated
```

- [ ] Buoc 5: Dinh nghia thay doi RPC checkout.

Contract ham backend:
```text
checkout_cart(p_delivery_address_id bigint, p_note text) returns bigint[]
- resolve v_user_id from auth.uid()
- select DeliveryAddress row where id=p_delivery_address_id and user_id=v_user_id and deleted_at is null
- raise if missing
- snapshot recipient/address/coordinates into each created Order
- never trust client-submitted user_id or recipient snapshot for ownership
```

- [ ] Buoc 6: Verify thu cong sau implementation.

Kiem tra RLS thu cong:
```text
Customer A can list Customer A addresses.
Customer A cannot list Customer B addresses.
Customer A cannot update Customer B address by id.
Customer A cannot set Customer B address as default.
Checkout fails when p_delivery_address_id belongs to Customer B.
```

## Task 2: Model va API Android cho DeliveryAddress

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/DeliveryAddress.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/DeliveryAddressRequest.java`
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`

**Interface:**
- Tao ra: `DeliveryAddress` model duoc Repository/ViewModel/UI tieu thu.
- Tieu thu: Supabase REST/RPC contract tu Task 1.

- [ ] Buoc 1: Them field model khop PRD.
- [ ] Buoc 2: Them request type chi gom cac field co the sua: label, recipientName, recipientPhone, fullAddress/addressDetail, latitude, longitude, isDefault.
- [ ] Buoc 3: Them API method cho list/create/update/soft-delete/set-default.
- [ ] Buoc 4: Dung `@SerializedName` de tach naming Java khoi ten cot SQL.
- [ ] Buoc 5: Khong dua legacy `AddressItem` vao state ViewModel moi.

Dung API ky vong:
```java
@GET("rest/v1/user_addresses")
Call<List<DeliveryAddress>> getDeliveryAddresses(
        @Query("select") String select,
        @Query("deleted_at") String deletedAtFilter,
        @Query("order") String order
);

@POST("rest/v1/user_addresses")
Call<Void> createDeliveryAddress(@Body DeliveryAddressRequest request);

@PATCH("rest/v1/user_addresses")
Call<Void> updateDeliveryAddress(@Query("id") String idFilter,
                                 @Body DeliveryAddressRequest request);

@PATCH("rest/v1/user_addresses")
Call<Void> softDeleteDeliveryAddress(@Query("id") String idFilter,
                                     @Body DeliveryAddressRequest request);

@POST("rest/v1/rpc/set_default_delivery_address")
Call<Void> setDefaultDeliveryAddress(@Body SetDefaultDeliveryAddressRequest request);
```

## Task 3: Repository va ViewModel co the test

**File:**
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/DeliveryAddressRepository.java`
- Tao: `app/src/main/java/com/example/fooddelivery/ui/profile/DeliveryAddressViewModel.java`
- Tao: `app/src/test/java/com/example/fooddelivery/ui/profile/DeliveryAddressViewModelTest.java`

**Interface:**
- Tieu thu: API/model from Task 2.
- Tao ra: list/form state for Profile and checkout selection.

- [ ] Buoc 1: Xay repository methods: `list()`, `create()`, `update()`, `softDelete()`, `setDefault()`.
- [ ] Buoc 2: Xay ViewModel state: `isLoading`, `addresses`, `da chonAddress`, `error`, `successEvent`, `validationErrors`.
- [ ] Buoc 3: Validate bat buoc fields before repository calls.
- [ ] Buoc 4: First address created with no hien co default should request/set default.
- [ ] Buoc 5: After create/update/delete/set-default, reload list from source of truth.
- [ ] Buoc 6: Unit test validation, hanh vi default, delete reload va selection bang fake repository.

Bo test toi thieu:
```text
create_without_recipient_name_sets_validation_error
create_first_address_marks_default
set_default_reloads_list_and_has_one_default
delete_default_reloads_and_exposes_no_selected_deleted_address
checkout_selection_requires_non_deleted_address
```

## Task 4: UI danh sach DeliveryAddress trong Profile

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/profile/AddressListFragment.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/profile/AddressAdapter.java`
- Sua: `app/src/main/res/layout/fragment_address_list.xml`
- Sua: `app/src/main/res/layout/item_address.xml`
- Sua: `app/src/main/res/navigation/nav_profile.xml`

**Interface:**
- Tieu thu: `DeliveryAddressViewModel`.
- Tao ra: Customer-visible list/default/delete/edit/select workflow.

- [ ] Buoc 1: Go viec tao dummy list production trong `AddressListFragment`.
- [ ] Buoc 2: Observe cac state list/loading/error cua ViewModel.
- [ ] Buoc 3: Bind `label`, `fullAddress`, `recipientName`, `recipientPhone`, and `isDefault`.
- [ ] Buoc 4: Them empty state va retry path.
- [ ] Buoc 5: Them action edit de navigate toi form add/edit voi address id.
- [ ] Buoc 6: Them confirm delete truoc soft delete.
- [ ] Buoc 7: Them action set-default, an/disable voi default hien tai.
- [ ] Buoc 8: Preserve select-mode behavior for checkout: clicking a row returns da chon DeliveryAddress to checkout flow.

## Task 5: UI form tham/sua

**File:**
- Tao: `app/src/main/res/layout/fragment_delivery_address_form.xml`
- Tao hoac sua: `app/src/main/java/com/example/fooddelivery/ui/profile/DeliveryAddressFormFragment.java`
- Sua: `app/src/main/res/navigation/nav_profile.xml`

**Interface:**
- Tieu thu: ViewModel validation and repository state.
- Tao ra: saved DeliveryAddress rows.

- [ ] Buoc 1: Form fields: label, recipient name, recipient phone, full address, tuy chon latitude, tuy chon longitude, default checkbox.
- [ ] Buoc 2: Mode add tai form rong.
- [ ] Buoc 3: Edit mode loads hien tai row and disables editing id/user ownership fields.
- [ ] Buoc 4: Save button disabled while loading.
- [ ] Buoc 5: Show field-level errors for missing/invalid data.
- [ ] Buoc 6: On success navigate back to list and refresh.

## Task 6: Tich hop Checkout

**File:**
- Sua: `app/src/main/java/com/example/fooddelivery/ui/cart/CheckoutViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/ui/cart/Checkout.java` or tuong lai `CheckoutFragment`
- Sua: `app/src/main/res/layout/cart_activity_checkout.xml` or tuong lai checkout layout
- Sua: `app/src/main/java/com/example/fooddelivery/data/model/CheckoutRequest.java`
- Sua sau: `docs/rpc_cart_order.sql`

**Interface:**
- Tieu thu: da chon/default DeliveryAddress from Tasks 1-5.
- Tao ra: checkout request with da chon DeliveryAddress.

- [ ] Buoc 1: On checkout screen load, request default DeliveryAddress.
- [ ] Buoc 2: Render address da chon thay vi "Ban so 5 tang 2".
- [ ] Buoc 3: Them action change-address mo danh sach address o select mode.
- [ ] Buoc 4: If no address exists, show add-address CTA and disable order placement.
- [ ] Buoc 5: Cap nhat signature `checkout` cua ViewModel de dung `DeliveryAddress` da chon.
- [ ] Buoc 6: Transition path: if backend still accepts `p_delivery_address TEXT`, serialize display address as a temporary adapter and mark the code comment with removal condition.
- [ ] Buoc 7: Target path: gui `p_delivery_address_id` va de backend snapshot fields.
- [ ] Buoc 8: Verify checkout fail khi chua chon address va thanh cong voi address cua chinh Customer.

## Task 7: Handoff tai lieu va QA

**File:**
- Sua: `docs/prd-ordering-mvp.md` only if product owner wants canonical mirror updates.
- Sua: `CONTEXT.md` only if DeliveryAddress fields change.
- Tao/sua: implementation QA notes.

**Interface:**
- Tieu thu: implemented behavior.
- Tao ra: human QA checklist.

- [ ] Buoc 1: Document final backend contract and transition state.
- [ ] Buoc 2: Document manual QA script for create/edit/delete/default/select/checkout.
- [ ] Buoc 3: Record RLS test evidence.
- [ ] Buoc 4: Cap nhat reference plan Ordering MVP neu contract checkout thay doi.

## Checklist tu ra soat

- [ ] Every PRD acceptance criterion maps to at least one task.
- [ ] Plan avoids real schema execution until implementation approval.
- [ ] Plan preserves unrelated worker changes.
- [ ] Bảo mật/RLS phải được xử lý trước khi coi Android UI call là hoàn tất.
- [ ] Tich hop Checkout snapshot du lieu address thay vi chi dua vao saved address rows co the thay doi.




