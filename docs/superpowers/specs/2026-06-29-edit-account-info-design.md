# Chinh sua thong tin tai khoan - Thiet ke

## Muc tieu

Cho phep nguoi dung chinh sua tung truong tren man hinh Thong tin tai khoan bang hop thoai phu hop. Noi dong Mat khau tren trang Tai khoan den man hinh thay doi mat khau hien co. Sau khi bieu mau mat khau hop le, quay ve trang Tai khoan va hien thong bao "Mat khau da duoc thay doi".

Phien ban nay o muc do do an: uu tien de doc, de bao tri va tan dung kien truc san co; khong tich hop doi mat khau that voi Supabase Auth.

## Kien truc

- `AccountInfoFragment` phu trach mo `AlertDialog` hoac `DatePickerDialog` va hien thi loi nhap lieu.
- `AccountInfoViewModel` phu trach tai du lieu, tao ban cap nhat mot truong va goi `UserRepository`.
- `UserRepository` tiep tuc su dung Retrofit `PATCH rest/v1/users?id=eq.<id>`.
- Ket qua dieu huong cua man hinh mat khau duoc gui ve `AccountMenuFragment` qua Navigation `SavedStateHandle`, tranh hien lai thong bao khi quay lai man hinh sau nay.

## Chinh sua tung truong

- Ten: hop thoai nhap van ban; bo khoang trang dau/cuoi; khong chap nhan gia tri rong.
- So dien thoai: hop thoai voi ban phim dien thoai; chap nhan dau `+` o dau va chuoi chu so co do dai hop ly.
- Email: hop thoai voi ban phim email; kiem tra bang `Patterns.EMAIL_ADDRESS`.
- Ngay sinh: `DatePickerDialog`; khong cho chon ngay trong tuong lai; gui database theo `yyyy-MM-dd` va hien thi `dd/MM/yyyy` khi doc duoc dinh dang nay.
- Quoc gia: hop thoai nhap van ban de phu hop pham vi do an; khong chap nhan rong.

Moi lan luu chi gui mot doi tuong `User` chua truong duoc sua. Trong luc dang cap nhat, khong cho gui lap. Thanh cong thi cap nhat giao dien ngay va hien Toast "Cap nhat thanh cong". That bai thi giu gia tri cu va hien Toast "Khong the cap nhat. Vui long thu lai".

Neu database khong co gia tri, giao dien hien "khong co".

## Luong mat khau

- Nhan dong `Mat khau` tai `AccountMenuFragment` de mo `PasswordFormFragment` voi `MODE=CHANGE`.
- Fragment tiep tuc kiem tra mat khau cu, mat khau moi toi thieu 6 ky tu va xac nhan trung khop.
- Neu hop le, fragment dat ket qua thanh cong va `popBackStack()`.
- `AccountMenuFragment` nhan ket qua mot lan va hien Snackbar "Mat khau da duoc thay doi".
- Khong goi API xac thuc va khong thay doi mat khau that trong pham vi nay.

## Kiem thu

- Kiem tra validation cho ten, dien thoai, email va ngay sinh.
- Kiem tra payload chi chua truong dang sua va UI cap nhat khi PATCH thanh cong.
- Kiem tra dong Mat khau dieu huong dung mode.
- Kiem tra submit mat khau hop le quay ve va thong bao chi hien mot lan.
- Chay `:app:assembleDebug` de xac minh Java, resource va Navigation graph.

## Ngoai pham vi

- Doi mat khau that qua Supabase Auth.
- Dong bo email trong bang `users` voi email cua Auth.
- Danh sach quoc gia day du, tim kiem quoc gia, hoac quan ly ma vung dien thoai.
