# Push notification trang thai Order Ke hoach implementation

**Muc tieu:** Thong bao cho Customer khi status cua Order thay doi, bat dau bang luong local notification an toan cho demo.

**Kien truc:** Luong polling/status cua Order dua du lieu vao notification mapper; dang ky FCM token that co the thay polling local sau.

**Tech stack:** Android Java, MVVM, Retrofit, Supabase, Android NotificationManager, tuy chon Firebase Cloud Messaging.

## Rang buoc chung
- Khong lam app Seller/Shipper trong repo nay.
- App phai hoat dong khi permission bi tu choi.
- Khong luu server key trong Android.

## Cau truc file
- Tao: `ui/notifications/OrderNotificationMapper.java`
- Tao: `data/repository/NotificationRepository.java`
- Sua: `ui/order/OrderListFragment.java` hoac ViewModel sau khi status polling ton tai.
- Sua: `AndroidManifest.xml` cho permission/service chi sau khi FCM duoc duyet.

## Interface tao ra/tieu thu
- Tieu thu `Order(id,status,restaurantName)`.
- Tao ra `NotificationEvent(orderId,title,body)`.
- Tieu thu API dang ky token trong tuong lai.

## Task theo thu tu
- [ ] Them setup notification channel khi app khoi dong.
- [ ] Them test mapper cho tung status cua Order.
- [ ] Them xu ly permission cho Android 13+.
- [ ] Them luong local notification tu status change phat hien duoc.
- [ ] Luu last notified status local de tranh thong bao trung.
- [ ] Noi tap notification toi Order detail.
- [ ] Them token registration repository tuy chon.
- [ ] Chi them FCM service sau khi co backend trigger.
- [ ] Compile bang `./gradlew.bat assembleDebug`.
- [ ] Unit-test bang `./gradlew.bat testDebugUnitTest`.
- [ ] Cap nhat thu cong Order status va verify notification.

## File can tao/sua
Theo danh sach tren; khong lam SQL hoac FCM cho toi khi duoc duyet.

## Buoc compile-check
Chay `./gradlew.bat assembleDebug`.

## Buoc unit test
Chay test mapper va ViewModel.

## Buoc kiem tra thu cong
Dat Order, cap nhat status, quan sat local notification va deep link.

## Ghi chu rollback
Tat feature flag notification; cac man hinh Order van hien thi status.
