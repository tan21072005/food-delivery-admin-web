# Refund / dispute / khieu nai Ke hoach implementation

**Muc tieu:** Cho Customer gui va xem complaint ho tro gan voi cac Order du dieu kien.

**Kien truc:** Order detail mo UI Complaint; ViewModel so huu validation; Repository goi Supabase; backend/admin thu cong so huu ket qua xu ly cuoi.

**Tech stack:** Android Java, MVVM, Retrofit, Supabase REST/RPC, tuy chon Supabase Storage.

## Rang buoc chung
- Khong trien khai app admin/seller.
- Customer khong the tu duyet refund.
- Hoan tien that la scope tuong lai.

## Cau truc file
- Tao: `ui/support/ComplaintFragment.java`
- Tao: `ui/support/ComplaintViewModel.java`
- Tao: `data/repository/ComplaintRepository.java`
- Tao: `data/model/Complaint.java`
- Sua: `ui/order/OrderDetailFragment.java`
- Sua: `data/remote/apis/ApiService.java`
- Tao layout: `res/layout/fragment_complaint.xml`

## Interface tao ra/tieu thu
- Tieu thu `Order(id,status,customerId,total)`.
- Tao ra `Complaint(id,orderId,status,reason)`.
- Tieu thu API tao/list complaint.

## Task theo thu tu
- [ ] Dinh nghia reason complaint va ma tran du dieu kien.
- [ ] Them test ViewModel cho Order completed du dieu kien.
- [ ] Them test ViewModel cho Order pending khong du dieu kien.
- [ ] Them test duplicate-active complaint.
- [ ] Them model Complaint va interface repository.
- [ ] Them UI form complaint voi reason/note/photo placeholder.
- [ ] Noi submit state va success state.
- [ ] Them complaint summary vao Order detail.
- [ ] Them endpoint Retrofit sau khi schema duoc duyet.
- [ ] Compile bang `./gradlew.bat assembleDebug`.
- [ ] Unit-test bang `./gradlew.bat testDebugUnitTest`.
- [ ] Kiem tra thu cong tao/doc complaint.

## File can tao/sua
Chi cac file da liet ke sau khi duoc duyet.

## Buoc compile-check
Chay `./gradlew.bat assembleDebug`.

## Buoc unit test
Chay test ComplaintViewModel.

## Buoc kiem tra thu cong
Gui complaint cho Order completed; verify Order pending bi chan; kiem tra Supabase.

## Ghi chu rollback
Go nut Report problem; cac man hinh Order hien co khong bi anh huong.
