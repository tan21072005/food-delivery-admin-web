# Reorder nang cao Ke hoach implementation

**Muc tieu:** Dung lai Cart tu mot Order completed truoc do, co validation va UI ket qua tung phan ro rang.

**Kien truc:** Order detail goi RPC reorder qua Repository; ViewModel hien thi ket qua validation; Cart reload tu backend sau khi merge.

**Tech stack:** Android Java, MVVM, Retrofit, Supabase REST/RPC.

## Rang buoc chung
- Reorder khong duoc tin snapshot gia cu nhu gia hien tai.
- Viec merge vao Cart hien co phai ro rang.
- Option phuc tap phu thuoc plan topping/options.

## Cau truc file
- Tao: `data/model/ReorderResult.java`
- Tao: `data/repository/ReorderRepository.java`
- Sua: `data/remote/apis/ApiService.java`
- Sua: `ui/order/OrderDetailFragment.java`
- Sua: `ui/order/OrderDetailViewModel.java`
- Sua: reload/navigation Cart sau khi Cart flow duoc implement.

## Interface tao ra/tieu thu
- Tieu thu `orderId`, session Customer hien tai.
- Tao ra `ReorderResult(added,changed,unavailable,cartId)`.
- Tieu thu RPC `reorder_order`.

## Task theo thu tu
- [ ] Dinh nghia rule du dieu kien reorder.
- [ ] Them test cho completed du dieu kien va pending/cancelled khong du dieu kien.
- [ ] Them test cho ket qua doi gia.
- [ ] Them test cho ket qua item khong kha dung.
- [ ] Them model `ReorderResult`.
- [ ] Them method Repository.
- [ ] Them state reorder trong ViewModel.
- [ ] Them bottom sheet xac nhan.
- [ ] Navigate sang Cart/Checkout sau khi thanh cong.
- [ ] Compile bang `./gradlew.bat assembleDebug`.
- [ ] Unit-test bang `./gradlew.bat testDebugUnitTest`.
- [ ] Kiem tra thu cong Order completed da seed.

## File can tao/sua
Chi cac file da liet ke sau khi duoc duyet.

## Buoc compile-check
Chay `./gradlew.bat assembleDebug`.

## Buoc unit test
Chay cac test tap trung cho OrderDetail/Reorder.

## Buoc kiem tra thu cong
Order completed co doi gia va item khong kha dung; xac nhan ket qua Cart.

## Ghi chu rollback
An nut Reorder; lich su Order giu nguyen.
