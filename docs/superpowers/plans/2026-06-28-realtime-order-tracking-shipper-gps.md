# Realtime order tracking / shipper GPS Ke hoach implementation

**Muc tieu:** Them tracking Order phia Customer voi MVP uu tien timeline va location polling tuy chon.

**Kien truc:** Order detail tai status va tracking point moi nhat qua Repository; ViewModel expose timeline/map state; Fragment render khong chua business logic.

**Tech stack:** Android Java, MVVM, Retrofit, Supabase REST/RPC, tuy chon Google Maps.

## Rang buoc chung
- Khong xay app Shipper trong repo nay.
- Tracking phai degrade gracefully khi khong co map key.
- Realtime co the la polling trong MVP.

## Cau truc file
- Sua: `ui/order/OrderDetailFragment.java`
- Sua: `ui/order/OrderDetailViewModel.java` neu da tao/refactor.
- Tao: `data/repository/TrackingRepository.java`
- Tao: `data/model/TrackingPoint.java`
- Sua: `data/remote/apis/ApiService.java`
- Sua: `res/layout/order_fragment_detail.xml`

## Interface tao ra/tieu thu
- Tieu thu `orderId` va status.
- Tao ra `TrackingUiState(status,lastPoint,isStale,error)`.
- Tieu thu API latest tracking point.

## Task theo thu tu
- [ ] Them model `TrackingPoint`.
- [ ] Them test fake repository cho no point, fresh point, stale point.
- [ ] Them `TrackingUiState` vao Order detail ViewModel.
- [ ] Them method polling/refresh co dung an toan theo lifecycle.
- [ ] Them UI timeline cho moi status.
- [ ] Them location card cho state delivering.
- [ ] Chi them map tuy chon sau khi key/dependency duoc duyet.
- [ ] Them Retrofit API cho point moi nhat.
- [ ] Compile bang `./gradlew.bat assembleDebug`.
- [ ] Unit-test bang `./gradlew.bat testDebugUnitTest`.
- [ ] Kiem tra thu cong bang cach cap nhat tracking point trong Supabase.

## File can tao/sua
Chi cac file da liet ke sau khi duoc duyet.

## Buoc compile-check
Chay `./gradlew.bat assembleDebug`.

## Buoc unit test
Chay test tap trung cho OrderDetail/Tracking ViewModel.

## Buoc kiem tra thu cong
Cap nhat thu cong status va tracking point; verify timeline va stale state.

## Ghi chu rollback
An phan location; giu status timeline.
