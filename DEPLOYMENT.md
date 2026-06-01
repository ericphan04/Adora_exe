# HƯỚNG DẪN DEPLOY ADORA LED MARKETPLACE LÊN GCP VM
> **Domain:** `adora.io.vn`  
> **GCP IP Address:** `35.221.242.185`

Dự án này sử dụng mô hình Docker hóa toàn bộ (React frontend, Spring Boot backend, PostgreSQL database) được chạy thông qua Docker Compose và bảo mật bằng SSL Let's Encrypt trên Nginx.

---

## 1. Cấu Hình DNS
Trước khi cài đặt phần mềm trên VM, hãy truy cập vào trang quản lý tên miền `adora.io.vn` của bạn (ví dụ: Cloudflare, Mắt Bão, Nhân Hòa...) và cấu hình trỏ IP như sau:

| Loại (Type) | Tên (Name) | Giá trị (Value) | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `@` (hoặc rỗng) | `35.221.242.185` | Tự động / 3600 |
| **A** | `www` | `35.221.242.185` | Tự động / 3600 |

*Lưu ý: Chờ vài phút để DNS cập nhật (bạn có thể kiểm tra bằng lệnh `ping adora.io.vn` hoặc dùng công cụ online [DNS Checker](https://dnschecker.org/)).*

---

## 2. Chuẩn Bị VM trên GCP (Ubuntu 22.04 LTS / Debian)
SSH vào VM của bạn thông qua GCP Console hoặc terminal:
```bash
ssh <username>@35.221.242.185
```

### Bước 2.1: Cập nhật hệ thống
```bash
sudo apt update && sudo apt upgrade -y
```

### Bước 2.2: Cài đặt Docker & Docker Compose
Chạy script cài đặt nhanh chính thức của Docker:
```bash
# Tải và cài đặt Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user hiện tại vào group docker để không cần gõ sudo khi chạy docker
sudo usermod -aG docker $USER
newgrp docker # Áp dụng thay đổi ngay lập tức
```

Kiểm tra xem docker đã chạy thành công chưa:
```bash
docker --version
docker compose version
```

---

## 3. Cài Đặt SSL Certificate (HTTPS) qua Certbot & Nginx Host
Để bảo mật kết nối (HTTPS) trên domain `adora.io.vn`, cách tối ưu nhất là cài đặt Nginx trực tiếp trên VM Host để làm cổng đón (Edge Reverse Proxy), nhận chứng chỉ SSL từ Let's Encrypt và chuyển hướng traffic vào Docker container (chạy ở cổng 80).

### Bước 3.1: Cài đặt Nginx & Certbot trên máy ảo (Host VM)
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Bước 3.2: Cấu hình tạm thời Nginx trên Host để Certbot xác thực
Tạo file cấu hình Nginx tạm thời cho domain của bạn:
```bash
sudo nano /etc/nginx/sites-available/adora.conf
```
Dán cấu hình sau (lưu ý đổi cổng hoặc domain nếu cần):
```nginx
server {
    listen 80;
    server_name adora.io.vn www.adora.io.vn;

    location / {
        proxy_pass http://127.0.0.1:8080; # Chuyển hướng tới cổng container frontend
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
*Lưu ý: Do Nginx host đã sử dụng cổng 80, chúng ta cần cấu hình Docker Frontend chạy ở một cổng khác (ví dụ: `8080`). Hãy xem Bước 4 để điều chỉnh file `docker-compose.yml` trên server.*

Kích hoạt cấu hình và restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/adora.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Bước 3.3: Lấy chứng chỉ SSL Let's Encrypt
Chạy lệnh sau để Certbot tự động lấy và cài cấu hình SSL cho Nginx:
```bash
sudo certbot --nginx -d adora.io.vn -d www.adora.io.vn
```
*Nhập email của bạn, chọn đồng ý các điều khoản và chọn tùy chọn tự động chuyển hướng HTTP sang HTTPS (Redirect).*

Sau khi chạy xong, Certbot sẽ tự động chỉnh sửa file `/etc/nginx/sites-available/adora.conf` để kích hoạt SSL (cổng 443).

---

## 4. Cấu Hình & Chạy Docker Compose Trên VM

### Bước 4.1: Clone/Tải source code dự án lên VM
Bạn có thể dùng Git để clone repo lên máy ảo GCP:
```bash
git clone <URL_REPO_CỦA_BẠN> adora-app
cd adora-app
```

### Bước 4.2: Điều chỉnh cổng Frontend trong `docker-compose.yml`
Vì cổng `80` trên máy ảo đã bị chiếm dụng bởi Nginx Host (đang giữ nhiệm vụ SSL), chúng ta cần đổi port mapping của dịch vụ `frontend` trong `docker-compose.yml` từ `"80:80"` thành `"8080:80"`.

Mở file `docker-compose.yml` bằng nano:
```bash
nano docker-compose.yml
```
Tìm phần dịch vụ `frontend` và sửa lại:
```yaml
  # Frontend Service
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: adora_frontend
    restart: always
    depends_on:
      - backend
    ports:
      - "8080:80" # Đổi từ "80:80" sang "8080:80"
    networks:
      - adora_net
```
*(Ấn `Ctrl+O` để lưu và `Ctrl+X` để thoát).*

### Bước 4.3: Tạo file cấu hình môi trường `.env`
Tạo một file chứa các biến môi trường cấu hình hệ thống thực tế (database, email, JWT, Cloudflare R2):
```bash
nano .env
```
Copy và điền các thông tin của bạn vào:
```env
# Database Credentials
DB_NAME=adora
DB_USERNAME=adora_user
DB_PASSWORD=Dien_Mat_Khau_Manh_Cua_Ban_O_Day

# JWT Config (Khóa bí mật tối thiểu 256-bit dạng Hex)
JWT_SECRET=9a4f2c8d3b7a1e5f8c6d4b2a0f8e6d4c2b0a8f6e4d2c0b8a6f4e2d0c8b6a4f2e
JWT_EXPIRATION_MS=86400000

# Google Login Integration
GOOGLE_CLIENT_ID=948345920089-7j515dqe1ihqph3lnapho8c7l6auo9r8.apps.googleusercontent.com

# Cloudflare R2 / S3 Storage (Chứa ảnh/video của Billboard và Creative)
R2_ENDPOINT=https://f57aad0e4caab95af1c52c46175ca7a6.r2.cloudflarestorage.com
R2_ACCESS_KEY=dien_access_key_r2
R2_SECRET_KEY=dien_secret_key_r2
R2_BUCKET_NAME=billboard
R2_PUBLIC_URL=https://pub-f57aad0e4caab95af1c52c46175ca7a6.r2.dev
```

### Bước 4.4: Khởi động hệ thống bằng Docker Compose
Build image và kích hoạt container chạy ngầm (detached mode):
```bash
docker compose up -d --build
```
Quá trình build có thể mất khoảng 2-5 phút trong lần chạy đầu tiên để cài thư viện Node và build backend Spring Boot JAR.

---

## 5. Quản Lý & Bảo Trì Ứng Dụng

* **Xem log thời gian thực để debug:**
  ```bash
  docker compose logs -f
  ```
  *(Hoặc xem riêng log backend: `docker compose logs -f backend`)*

* **Dừng ứng dụng:**
  ```bash
  docker compose down
  ```

* **Khởi động lại ứng dụng:**
  ```bash
  docker compose restart
  ```

* **Cập nhật code mới (khi bạn push code mới lên Git):**
  ```bash
  git pull
  docker compose up -d --build
  ```

* **Kiểm tra trạng thái các container:**
  ```bash
  docker compose ps
  ```

---

## 6. Khắc Phục Lỗi Thường Gặp (Troubleshooting)

### 1. Không truy cập được domain `https://adora.io.vn`
* Hãy kiểm tra Firewall của GCP VM (VPC Network Firewall). Bạn cần mở rule cho phép nhận traffic cổng **80** (HTTP) và **443** (HTTPS) từ mọi IP (`0.0.0.0/0`).
* Kiểm tra xem Nginx Host có đang chạy không: `sudo systemctl status nginx`.

### 2. Certbot hết hạn chứng chỉ
* Let's Encrypt tự động gia hạn 90 ngày một lần. Cronjob của Certbot sẽ tự xử lý. Bạn có thể kiểm tra gia hạn tự động (dry-run) bằng lệnh:
  ```bash
  sudo certbot renew --dry-run
  ```

Chúc bạn deploy thành công ứng dụng ADORA!
