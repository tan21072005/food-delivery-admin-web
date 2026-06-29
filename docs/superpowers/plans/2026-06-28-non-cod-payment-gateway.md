# Payment gateway ngoai COD Ke hoach implementation

> Cho worker tuong lai: artifact nay chi lap ke hoach. Khong implement cho toi khi duoc duyet.

**Muc tieu:** Them luong thanh toan ngoai COD co the demo, dong thoi giu checkout COD on dinh.

**Kien truc:** UI Checkout chon `PaymentMethod`; `CheckoutViewModel` so huu state; `PaymentRepository` goi Supabase RPC; backend la nguon quyet dinh trang thai da thanh toan.

**Tech stack:** Android Java, MVVM, Retrofit, Supabase REST/RPC.

## Rang buoc chung
- Khong luu secret cua provider hoac du lieu the trong Android.
- COD phai tiep tuc hoat dong.
- Thay doi schema/provider that can duoc duyet.
- App Seller/Shipper nam ngoai scope repo.

## Cau truc file
- Sua: `app/src/main/java/com/example/fooddelivery/ui/cart/CheckoutViewModel.java`
- Sua: `app/src/main/java/com/example/fooddelivery/data/repository/OrderRepository.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/repository/PaymentRepository.java`
- Sua: `app/src/main/java/com/example/fooddelivery/data/remote/apis/ApiService.java`
- Tao: `app/src/main/java/com/example/fooddelivery/data/model/PaymentAttempt.java`
- Sua: layout/fragment checkout sau khi `CheckoutFragment` ton tai.

## Interface tao ra/tieu thu
- Tieu thu Cart total tu checkout state.
- Tao ra `PaymentUiState(method,status,reference,errorMessage)`.
- Tieu thu RPC `create_payment_intent`, `confirm_payment`.

## Task theo thu tu
- [ ] Them hang `PaymentMethod` va gia tri `PaymentStatus` o tang model.
- [ ] Them seam test `PaymentRepository` fake cho test ViewModel.
- [ ] Mo rong checkout state voi method da chon va payment state.
- [ ] Them unit test: COD bo qua payment intent va goi checkout.
- [ ] Them unit test: online success luu reference roi checkout.
- [ ] Them unit test: online failure giu Cart khong doi.
- [ ] Them khai bao Retrofit cho cac RPC da duyet.
- [ ] Noi selector method trong UI checkout.
- [ ] Them man hinh hoac dialog xac nhan sandbox/thu cong.
- [ ] Verify `./gradlew.bat test`.
- [ ] Kiem tra thu cong: COD, sandbox success, sandbox fail, offline.

## File can tao/sua
Chi cac file liet ke trong Cau truc file sau khi schema/API duoc duyet.

## Buoc compile-check
Chay `./gradlew.bat assembleDebug`.

## Buoc unit test
Chay `./gradlew.bat testDebugUnitTest` va cac test ViewModel checkout tap trung.

## Buoc kiem tra thu cong
Dung Cart da seed, thu COD, sandbox online success, sandbox online failure, roi kiem tra Supabase `orders`.

## Ghi chu rollback
An method ngoai COD sau feature flag hoac go khoi selector; COD van la luong on dinh.
