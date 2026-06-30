# Topping / size / options Ke hoach implementation

**Muc tieu:** Them chon option da validate cho Mon va giu selection xuyen suot Cart va Order.

**Kien truc:** Menu detail tai option group; ViewModel validate selection; RPC add-to-cart validate lai va luu snapshot.

**Tech stack:** Android Java, MVVM, Retrofit, Supabase REST/RPC.

## Rang buoc chung
- Backend la nguon su that cho tinh hop le va gia cua option.
- Khong pha luong Mon don gian khong co option.
- Giu MVP o option group mot cap.

## Cau truc file
- Sua: `ui/home/ToppingBottomSheet.java`
- Sua/Tao: `ui/detail/FoodDetailViewModel.java` hoac `ui/home/ToppingViewModel.java`
- Tao: `data/model/MenuOptionGroup.java`
- Tao: `data/model/MenuOptionChoice.java`
- Tao: `data/model/SelectedOption.java`
- Sua: `data/model/CartAddRequest.java`
- Sua: `data/repository/OrderRepository.java`
- Sua: `data/remote/apis/ApiService.java`

## Interface tao ra/tieu thu
- Tieu thu `menuId`.
- Tao ra danh sach `SelectedOption` va display total da tinh.
- Tieu thu RPC add-to-cart chap nhan option choice IDs.

## Task theo thu tu
- [ ] Dinh nghia model option group/choice.
- [ ] Them test validation cho required single group.
- [ ] Them test validation cho multi max.
- [ ] Them test tinh gia.
- [ ] Tai option group cung menu detail.
- [ ] Render group trong bottom sheet.
- [ ] Disable nut Add cho toi khi required group hop le.
- [ ] Mo rong add-to-cart request voi selected choices.
- [ ] Render option summary trong Cart va Checkout.
- [ ] Snapshot option vao OrderLine sau khi backend duoc duyet.
- [ ] Compile bang `./gradlew.bat assembleDebug`.
- [ ] Unit-test bang `./gradlew.bat testDebugUnitTest`.
- [ ] Kiem tra thu cong luong size+topping.

## File can tao/sua
Chi cac file da liet ke sau khi duoc duyet.

## Buoc compile-check
Chay `./gradlew.bat assembleDebug`.

## Buoc unit test
Chay test validation option va gia.

## Buoc kiem tra thu cong
Chon size/topping, them vao Cart, checkout, xac nhan snapshot trong Order detail.

## Ghi chu rollback
An option group va fallback ve add-to-cart don gian cho Mon khong co required option.
