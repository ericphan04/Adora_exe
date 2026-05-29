# ADORA - LED Billboard Rental Marketplace

ADORA là nền tảng thương mại điện tử kết nối người thuê quảng cáo (Advertiser/Renter) với các chủ sở hữu màn hình LED quảng cáo ngoài trời/trong nhà (Owner) và được quản lý bởi Quản trị viên hệ thống (Admin). Nền tảng hỗ trợ tìm kiếm trực quan, đặt chỗ theo ngày/tháng, thanh toán trực tuyến qua cổng VNPay Sandbox, và quản lý doanh thu/chiến dịch qua dashboard trực quan.

---

## 🚀 Tính Năng Chính Theo Vai Trò (User Roles)

### 1. RENTER / Advertiser (Người thuê quảng cáo)
- Tìm kiếm màn hình LED theo địa điểm (Tỉnh/Thành phố, Quận/Huyện), danh mục (Đường cao tốc, TTTM, tòa nhà...) và từ khóa.
- Đặt chỗ màn hình LED theo khoảng thời gian tùy chọn (kiểm tra lịch trống trực tuyến).
- Thanh toán hóa đơn thuê quảng cáo an toàn qua cổng **VNPay Sandbox**.
- Xem thống kê hiệu quả chiến dịch (lượt hiển thị, số click chuột) và chi tiêu cá nhân qua Dashboard riêng biệt.
- Đánh giá (Review) màn hình LED sau khi kết thúc chiến dịch và báo cáo tranh chấp (Dispute Report) nếu có sự cố.

### 2. OWNER (Chủ sở hữu màn hình LED)
- Đăng tải và quản lý danh sách màn hình LED (kích thước, độ phân giải, độ sáng, giá cả ngày/tháng, hình ảnh...).
- Duyệt hoặc từ chối các yêu cầu đặt lịch thuê của Renters.
- Quản lý doanh thu, xem biểu đồ doanh số hàng tháng và tỷ lệ lấp đầy (Fill Rate) màn hình LED thông qua Dashboard chi tiết.

### 3. ADMIN (Quản trị viên hệ thống)
- Phê duyệt/Từ chối danh sách màn hình LED mới đăng ký của Owner trước khi được hiển thị công khai.
- Giám sát các giao dịch thanh toán trên nền tảng.
- Tự động thu phí hoa hồng **5%** trên mỗi giao dịch thành công.
- Tiếp nhận và xử lý các báo cáo tranh chấp từ phía Renter.
- Theo dõi tổng GMV toàn sàn và số lượng người dùng/billboard hoạt động qua Admin Dashboard.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend (Giao diện)
- **Framework**: React 18 & TypeScript (Vite làm công cụ đóng gói).
- **Routing**: React Router v7.
- **Styling**: Tailwind CSS v4.
- **Biểu đồ & Icons**: Recharts & Lucide React.
- **API Client**: Axios (giao tiếp với Backend qua cổng mặc định `8085`).
- **Bản đồ (Map)**: Sử dụng **Vietmap GL JS** (tối ưu hóa vị trí Việt Nam), tự động tích hợp cơ chế dự phòng (fallback) sang **OpenFreeMap** & **OpenStreetMap** khi thiếu API Key để đảm bảo chạy không lỗi.

### Backend (Xử lý & Cơ sở dữ liệu)
- **Framework**: Java 17, Spring Boot 3.3.0.
- **Database**: PostgreSQL (hỗ trợ cả Local DB hoặc Neon Cloud DB).
- **ORM**: Spring Data JPA & Hibernate.
- **Security**: Spring Security JWT (Phân quyền Role-based: `ADMIN`, `OWNER`, `RENTER`).
- **Payment Gateway**: VNPay Sandbox Integration.
- **API Documentation**: Swagger OpenAPI UI.

---

## 💻 Hướng Dẫn Cài Đặt & Khởi Chạy (Setup & Run Guide)

### 📋 Yêu cầu hệ thống
- **Java 17** hoặc cao hơn.
- **Node.js** phiên bản v18 trở lên.
- **Maven 3** trở lên.
- **PostgreSQL** Database.

---

### 1. Cấu Hình & Chạy Backend (Spring Boot)

#### Bước 1: Cấu hình cơ sở dữ liệu
Mặc định hệ thống kết nối tới cơ sở dữ liệu cloud Neon PostgreSQL. Bạn có thể sử dụng kết nối mặc định này hoặc cấu hình kết nối local trong file [backend/src/main/resources/application.properties](file:///d:/Ericcc/DuAN/Adora_exe/backend/src/main/resources/application.properties):

```properties
# Sử dụng PostgreSQL local
spring.datasource.url=jdbc:postgresql://localhost:5432/adora_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver
```

#### Bước 2: Chạy Backend
Di chuyển vào thư mục `backend` và chạy lệnh sau để Maven tự động tải thư viện, biên dịch và khởi chạy máy chủ:

```bash
cd backend
mvn spring-boot:run
```
Sau khi khởi chạy thành công, Backend sẽ lắng nghe tại cổng `http://localhost:8085`.
- **Swagger API Docs**: Truy cập đường dẫn `http://localhost:8085/swagger-ui/index.html` để kiểm tra danh sách API và test thử.

---

### 2. Cấu Hình & Chạy Frontend (React)

#### Bước 1: Cài đặt các dependencies
Từ thư mục gốc của dự án, chạy lệnh:

```bash
npm install
```

#### Bước 2: Cấu hình biến môi trường (.env)
Để bản đồ và các tính năng định vị hoạt động chính xác và không bị lỗi, bạn cần cấu hình các biến môi trường cho Frontend:

1. Sao chép tệp cấu hình mẫu `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
2. Mở tệp `.env` vừa tạo và cập nhật các khóa API của Vietmap:
   - **`VITE_VIETMAP_API_KEY`**: Khóa API dùng cho các dịch vụ tìm kiếm địa chỉ tự động (Autocomplete), xem chi tiết địa điểm (Place Details) và tìm địa chỉ từ tọa độ (Reverse Geocoding). Bạn có thể lấy khóa này từ cổng phát triển của [Vietmap](https://maps.vietmap.vn/).
   - **`VITE_VIETMAP_TILEMAP_API_KEY`**: Khóa API dùng để hiển thị lớp bản đồ trực quan (Tilemap styles).

> [!NOTE]
> **Cơ chế hoạt động dự phòng (Fallback):**
> Để đảm bảo dự án chạy ổn định mà không yêu cầu người dùng cấu hình khóa API ngay lập tức, hệ thống có cơ chế tự động kiểm tra tính hợp lệ của Key:
> - Nếu `VITE_VIETMAP_TILEMAP_API_KEY` bị thiếu hoặc ở dạng mặc định (`your_vietmap...`), bản đồ sẽ hiển thị thông qua nguồn mở **OpenFreeMap** (Bright style) mà không báo lỗi.
> - Nếu `VITE_VIETMAP_API_KEY` bị thiếu hoặc ở dạng mặc định, việc tìm kiếm và chọn vị trí trên bản đồ sẽ tự động sử dụng **OpenStreetMap Nominatim** thay thế.

> [!IMPORTANT]
> **Cấu hình Aliases cho Vietmap trong Vite:**
> Thư viện `@vietmap/vietmap-gl-js` không xuất ra một entry point chuẩn cho môi trường đóng gói (Vite). Do đó, tệp cấu hình [vite.config.ts](file:///d:/Ericcc/DuAN/Adora_exe/vite.config.ts) đã thiết lập sẵn một alias để chuyển tiếp import trực tiếp vào phân phối:
> ```typescript
> '@vietmap/vietmap-gl-js': path.resolve(__dirname, './node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl.js')
> ```
> Hãy đảm bảo cấu hình này không bị thay đổi hoặc xóa bỏ để tránh lỗi biên dịch khi khởi chạy frontend.

#### Bước 3: Chạy Frontend ở chế độ Developer
Chạy lệnh khởi tạo Vite server:

```bash
npm run dev
```
Trình duyệt sẽ tự động mở hoặc bạn có thể truy cập bằng đường dẫn: `http://localhost:5173/`.

---

## 🗄️ Khởi Tạo Dữ Liệu Demo (Database Seeding)

Hệ thống tích hợp một lớp tự động khởi tạo dữ liệu mẫu mang tên `DatabaseInitializer`. Khi chạy backend lần đầu, nếu các bảng tương ứng trong cơ sở dữ liệu trống, nó sẽ tự động nạp các dữ liệu bao gồm:
- **5 Danh mục màn hình LED** (Highways, Retail, Landmarks, Transit, Shelters).
- **3 Tài khoản mẫu đại diện cho 3 vai trò** (với mật khẩu mặc định là `password`).
- **4 Màn hình LED mẫu tại Đà Nẵng** (Cầu Rồng, Bạch Đằng, Nguyễn Văn Linh, Vincom Plaza).
- **Các hóa đơn, thanh toán, đánh giá và báo cáo mẫu**.

### 🔑 Danh sách tài khoản thử nghiệm:
| Vai trò | Email đăng nhập | Mật khẩu |
|:---|:---|:---|
| **ADMIN** | `admin@adora.com` | `password` |
| **OWNER (Chủ LED)** | `owner@adora.com` | `password` |
| **RENTER (Người thuê)** | `renter@adora.com` | `password` |

---

## 💳 Hướng Dẫn Test Thanh Toán VNPay Sandbox

Để thử nghiệm tính năng thanh toán đặt chỗ màn hình LED bằng VNPay:
1. Đăng nhập bằng tài khoản **Renter** (`renter@adora.com` / `password`).
2. Nhấp chọn màn hình LED mong muốn và tạo yêu cầu đặt lịch (hoặc sử dụng booking ở trạng thái **Chờ thanh toán** trên Dashboard).
3. Nhấn **Thanh toán**. Hệ thống sẽ tự động chuyển hướng đến cổng thanh toán VNPay Sandbox.
4. Chọn thanh toán qua **Thẻ nội địa và tài khoản ngân hàng**.
5. Nhập thông tin thẻ thử nghiệm của **Ngân hàng NCB** (mặc định do VNPay cung cấp):
   - **Số thẻ**: `9704198526191432198`
   - **Tên chủ thẻ**: `NGUYEN VAN A`
   - **Ngày phát hành**: `07/15`
   - **Mã OTP**: `123456`
6. Sau khi xác nhận OTP thành công, VNPay sẽ xử lý giao dịch và chuyển hướng bạn quay trở lại trang trạng thái thanh toán của ứng dụng (`/payment/status`), hiển thị thông báo thanh toán thành công và cập nhật tức thì trạng thái Đặt chỗ thành **Đang hoạt động (PAID)**.

---

## 📤 Hướng Dẫn Đẩy Dự Án Lên Git (Push to Git)

Nếu bạn muốn đẩy toàn bộ source code này lên một kho chứa Git từ xa mới (như GitHub hoặc GitLab), hãy mở Terminal tại thư mục gốc dự án và thực hiện các lệnh sau:

```bash
# 1. Khởi tạo Git repository local (nếu chưa khởi tạo)
git init

# 2. Add tất cả các files vào staging area (đã loại trừ node_modules và target thông qua .gitignore)
git add .

# 3. Commit code phiên bản đầu tiên
git commit -m "feat: init ADORA LED Billboard Rental Marketplace platform"

# 4. Tạo nhánh chính
git branch -M main

# 5. Liên kết local repository với kho lưu trữ remote của bạn
# (Thay thế đường dẫn bên dưới bằng URL kho chứa Git thực tế của bạn)
git remote add origin https://github.com/username/adora-marketplace.git

# 6. Đẩy code lên Git remote
git push -u origin main
```