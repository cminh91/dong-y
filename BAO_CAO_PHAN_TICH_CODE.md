# Báo cáo phân tích Codebase dự án Đông Y Pharmacy

## 1. Tổng quan dự án

Dự án "Đông Y Pharmacy" là một ứng dụng web được xây dựng trên nền tảng Next.js, sử dụng TypeScript cho ngôn ngữ lập trình. Các công nghệ và thư viện chính được sử dụng bao gồm:

*   **Framework**: Next.js 15.2.4
*   **Ngôn ngữ**: TypeScript
*   **Cơ sở dữ liệu**: Prisma (với MySQL provider)
*   **Xác thực**: NextAuth.js (tùy chỉnh server actions)
*   **UI/CSS**: Tailwind CSS, shadcn/ui (với cấu hình New York style), Font Awesome, Swiper
*   **Trình soạn thảo**: TinyMCE React
*   **Xác thực dữ liệu**: Zod
*   **Hash mật khẩu**: bcryptjs

Dự án có cấu trúc rõ ràng với các phần riêng biệt cho giao diện người dùng (client) và giao diện quản trị (admin).

## 2. Cấu trúc thư mục chính

*   `prisma/`: Chứa schema cơ sở dữ liệu Prisma.
*   `public/`: Chứa các tài nguyên tĩnh như hình ảnh, favicon.
*   `src/app/`: Chứa các trang (routes) của ứng dụng, được tổ chức theo cấu trúc thư mục của Next.js App Router.
    *   `src/app/admin/`: Các trang quản trị.
    *   `src/app/san-phams/`: Các trang hiển thị sản phẩm cho người dùng.
    *   `src/app/tai-khoan/`: Các trang quản lý tài khoản người dùng.
    *   Các trang khác như `gio-hang`, `thanh-toan`, `dang-nhap`, `dang-ky`, v.v.
*   `src/components/`: Chứa các thành phần UI có thể tái sử dụng.
    *   `src/components/admin/`: Các thành phần dành riêng cho phần quản trị.
    *   `src/components/home/`: Các thành phần cho trang chủ.
    *   `src/components/layout/`: Các thành phần layout chung (Header, Footer).
    *   `src/components/ui/`: Các thành phần UI cơ bản (có thể là từ shadcn/ui).
*   `src/data/`: Chứa các file dữ liệu JSON (ví dụ: `herosction.json`, `layout.json`).
*   `src/lib/`: Chứa các file thư viện và tiện ích cốt lõi.
    *   `src/lib/auth.ts`: Logic xác thực.
    *   `src/lib/prisma.ts`: Khởi tạo Prisma Client.
    *   `src/lib/utils.ts`: Các hàm tiện ích chung.
*   `src/types/`: Định nghĩa các kiểu TypeScript.
*   `src/utils/`: Các hàm tiện ích khác (ví dụ: `stringUtils.ts`).

## 3. Phân tích các phần chính của ứng dụng

### 3.1. Cơ sở dữ liệu (Prisma Schema)

File [`prisma/schema.prisma`](prisma/schema.prisma) định nghĩa các mô hình sau:

*   **`User`**: Quản lý thông tin người dùng, bao gồm `fullName`, `phoneNumber`, `email`, `address`, `role` (ADMIN, STAFF, COLLABORATOR, AGENT, CUSTOMER), `balance`, `referralCode`, `idCardNumber`, `password` (đã hash), `idCardFront`, `idCardBack` (URL ảnh), thông tin ngân hàng, `isVerified`, `resetToken`, `status` (ACTIVE, INACTIVE, PENDING_VERIFICATION, BLOCKED).
*   **`Session`**: Quản lý phiên người dùng, liên kết với `User`.
*   **`Category`**: Quản lý danh mục sản phẩm/bài viết, bao gồm `name`, `slug`, `description`, `imageUrl`.
*   **`Product`**: Quản lý thông tin sản phẩm, bao gồm `name`, `slug`, `description`, `price`, `stock`, `imageUrl`, `categoryId`.
*   **`Order`**: Quản lý đơn hàng, bao gồm `userId`, `totalAmount`, `status`.
*   **`OrderItem`**: Chi tiết các sản phẩm trong một đơn hàng, liên kết với `Order` và `Product`.
*   **`Post`**: Quản lý bài viết/tin tức, bao gồm `title`, `slug`, `content`, `imageUrl`, `authorId`.
*   **`Promotion`**: Quản lý các chương trình khuyến mãi, bao gồm `name`, `code`, `discount`, `discountType`, `startDate`, `endDate`, `isActive`.

**Điểm mạnh**: Schema đã được định nghĩa khá đầy đủ cho một hệ thống thương mại điện tử cơ bản.

**Điểm cần cải thiện**:
*   Chưa có mô hình cho `Settings` để lưu trữ các cài đặt hệ thống (thông tin chung, mạng xã hội, vận chuyển, thanh toán, SEO) đang được hardcode trong [`src/app/admin/settings/page.tsx`](src/app/admin/settings/page.tsx).

### 3.2. Xác thực (NextAuth.js, Server Actions)

File [`src/lib/auth.ts`](src/lib/auth.ts) chứa các server actions cho:

*   **Đăng ký (`registerUser`)**: Xác thực dữ liệu bằng Zod, kiểm tra trùng lặp email/số điện thoại/CCCD, hash mật khẩu bằng `bcryptjs`, tạo người dùng mới với vai trò `CUSTOMER` và `isVerified: false`, `balance: 0`.
*   **Đăng nhập (`loginUser`)**: Xác thực dữ liệu bằng Zod, tìm người dùng, kiểm tra `isVerified`, so sánh mật khẩu, tạo session và đặt cookie. Chuyển hướng dựa trên vai trò người dùng.
*   **Xác minh người dùng (`verifyUser`)**: Cập nhật trạng thái `isVerified` của người dùng.
*   **Cập nhật vai trò người dùng (`updateUserRole`)**: Cập nhật vai trò của người dùng.
*   **Lấy người dùng hiện tại (`getCurrentUser`)**: Lấy thông tin người dùng từ session cookie.
*   **Yêu cầu xác thực (`requireAuth`, `requireAdmin`, `requireStaff`)**: Các hàm bảo vệ route dựa trên trạng thái đăng nhập và vai trò.
*   **Đăng xuất (`logout`)**: Xóa session khỏi DB và cookie.

**Điểm mạnh**:
*   Sử dụng server actions giúp bảo mật và hiệu suất tốt hơn.
*   Sử dụng Zod để xác thực dữ liệu đầu vào.
*   Mật khẩu được hash bằng `bcryptjs`.
*   Có cơ chế quản lý phiên và phân quyền cơ bản.

**Điểm cần cải thiện**:
*   Logic xác thực admin trong [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) đang bị comment, cần được kích hoạt lại để đảm bảo bảo mật.
*   Script [`creat-admin.js`](creat-admin.js) tạo admin với mật khẩu hardcode và cần đảm bảo trường `status` trong mô hình `User` được định nghĩa đúng.

### 3.3. Phần quản trị (Admin)

Các trang quản trị (`src/app/admin/*`) và các thành phần liên quan (`src/components/admin/*`) được thiết kế để quản lý các khía cạnh khác nhau của hệ thống.

*   **Layout (`src/app/admin/layout.tsx`)**: Bao gồm `AdminSidebar` và nội dung chính. Logic xác thực admin đang bị vô hiệu hóa.
*   **Dashboard (`src/app/admin/dashboard/page.tsx`)**: Hiển thị tổng quan với dữ liệu mẫu.
*   **Quản lý danh mục (`src/app/admin/categories/page.tsx`, `src/app/admin/categories/add/page.tsx`)**: Hiển thị danh sách danh mục với tìm kiếm, lọc, thêm, sửa, xóa. Hiện đang dùng dữ liệu mẫu và các chức năng CRUD chưa tích hợp API.
*   **Quản lý sản phẩm (`src/app/admin/products/page.tsx`, `src/app/admin/products/add/page.tsx`, `src/app/admin/products/edit/[id]/page.tsx`)**: Hiển thị danh sách sản phẩm với tìm kiếm, lọc, thêm, sửa, xóa. Hiện đang dùng dữ liệu mẫu, chức năng upload ảnh chỉ là preview, và các chức năng CRUD chưa tích hợp API.
*   **Quản lý đơn hàng (`src/app/admin/orders/page.tsx`)**: Hiển thị danh sách đơn hàng với tìm kiếm, lọc, xuất Excel. Hiện đang dùng dữ liệu mẫu và các chức năng chưa tích hợp API.
*   **Quản lý bài viết (`src/app/admin/posts/page.tsx`)**: Hiển thị danh sách bài viết với tìm kiếm, lọc, thêm, sửa, xóa. Hiện đang dùng dữ liệu mẫu và các chức năng chưa tích hợp API.
*   **Quản lý khuyến mãi (`src/app/admin/promotions/page.tsx`)**: Hiển thị danh sách khuyến mãi với tìm kiếm, lọc, thêm, sửa, xóa. Hiện đang dùng dữ liệu mẫu và các chức năng chưa tích hợp API.
*   **Cài đặt hệ thống (`src/app/admin/settings/page.tsx`)**: Giao diện quản lý cài đặt chung, mạng xã hội, vận chuyển, thanh toán, SEO. Hiện đang dùng dữ liệu mẫu và chưa có logic lưu/tải từ API.
*   **Quản lý người dùng (`src/app/admin/users/page.tsx`)**: Hiển thị danh sách người dùng với tìm kiếm, lọc, xuất Excel, import đối tác, thêm, sửa, xóa. Hiện đang dùng dữ liệu mẫu và các chức năng chưa tích hợp API.

**Điểm cần cải thiện chung cho phần Admin**:
*   Hầu hết các trang quản trị đang sử dụng dữ liệu mẫu (mock data) thay vì fetch từ API backend.
*   Các chức năng CRUD (thêm, sửa, xóa) chưa được tích hợp với API thực tế.
*   Chức năng upload file (ví dụ: hình ảnh sản phẩm, CCCD) chỉ là preview, chưa có logic upload lên server/cloud storage.
*   Phân trang và lọc/tìm kiếm chưa được triển khai đầy đủ với backend.

### 3.4. Phần người dùng (Client)

Các trang người dùng (`src/app/*` không thuộc admin) và các thành phần liên quan (`src/components/home/*`, `src/components/layout/*`) cung cấp giao diện cho khách hàng.

*   **Trang chủ (`src/app/page.tsx`)**: Tập hợp nhiều thành phần con như `HeroSection`, `AboutSection`, `ProductCategories`, `FeaturedProducts`, v.v.
*   **Trang sản phẩm (`src/app/san-phams/page.tsx`)**: Hiển thị danh sách sản phẩm với lọc theo danh mục, giá, đánh giá và sắp xếp. Dữ liệu sản phẩm và danh mục đang là mẫu.
*   **Trang chi tiết sản phẩm (`src/app/san-phams/[slug]/page.tsx`)**: Hiển thị thông tin chi tiết sản phẩm. Dữ liệu sản phẩm đang là mẫu.
*   **Giỏ hàng (`src/app/gio-hang/page.tsx`)**: Hiển thị các sản phẩm trong giỏ hàng, cho phép điều chỉnh số lượng, áp dụng mã giảm giá. Dữ liệu giỏ hàng và mã giảm giá đang là mẫu.
*   **Thanh toán (`src/app/thanh-toan/page.tsx`)**: Form thông tin giao hàng và lựa chọn phương thức thanh toán. Dữ liệu và logic xử lý đơn hàng chưa được tích hợp.
*   **Tài khoản của tôi (`src/app/tai-khoan/page.tsx`)**: Hiển thị thông tin cá nhân và đơn hàng gần đây. Dữ liệu người dùng và đơn hàng đang là mẫu.
*   **Đơn hàng của tôi (`src/app/tai-khoan/dat-hang/page.tsx`, `src/app/tai-khoan/dat-hang/[id]/page.tsx`)**: Danh sách và chi tiết đơn hàng. Dữ liệu đang là mẫu.
*   **Sổ địa chỉ (`src/app/tai-khoan/dia-chi/page.tsx`)**: Quản lý các địa chỉ giao hàng. Dữ liệu đang là mẫu.
*   **Sản phẩm yêu thích (`src/app/tai-khoan/yeu-thich/page.tsx`)**: Danh sách sản phẩm yêu thích. Dữ liệu đang là mẫu.

**Điểm cần cải thiện chung cho phần Client**:
*   Hầu hết các trang đang sử dụng dữ liệu mẫu thay vì fetch từ API backend.
*   Các chức năng tương tác (thêm vào giỏ hàng, cập nhật số lượng, áp dụng mã giảm giá, đặt hàng, quản lý địa chỉ, quản lý danh sách yêu thích) chưa được tích hợp với API thực tế hoặc hệ thống quản lý trạng thái.

### 3.5. Các tiện ích và thành phần dùng chung

*   **`src/components/ClientLayoutWrapper.tsx`**: Bọc toàn bộ ứng dụng, có thể chứa logic client-side chung.
*   **`src/components/login-form.tsx`, `src/components/register-form.tsx`**: Các form đăng nhập/đăng ký sử dụng server actions từ `src/lib/auth.ts`.
*   **`src/components/admin/TinyMCEEditor.tsx`**: Thành phần editor cho phép nhập nội dung rich text.
*   **`src/lib/utils.ts`, `src/utils/stringUtils.ts`**: Chứa các hàm tiện ích chung như xử lý chuỗi (slug, trích xuất ID).

## 4. Các vấn đề và điểm cần cải thiện

1.  **Thiếu tích hợp API Backend**: Đây là vấn đề lớn nhất. Hầu hết các trang và chức năng (cả admin và client) đang sử dụng dữ liệu mẫu và chưa gọi API backend thực tế để fetch, tạo, cập nhật, xóa dữ liệu.
2.  **Bảo mật phần Admin**: Logic xác thực admin trong `src/app/admin/layout.tsx` đang bị comment, khiến phần admin không được bảo vệ.
3.  **Quản lý file upload**: Chức năng upload hình ảnh (sản phẩm, CCCD) chỉ là preview, chưa có logic lưu trữ file thực tế lên server hoặc dịch vụ cloud (ví dụ: Cloudinary, S3).
4.  **Thiếu API Routes/Server Actions**: Cần triển khai các API routes hoặc server actions tương ứng cho tất cả các chức năng CRUD (danh mục, sản phẩm, đơn hàng, bài viết, khuyến mãi, người dùng, cài đặt, giỏ hàng, địa chỉ, yêu thích).
5.  **Quản lý trạng thái giỏ hàng/yêu thích**: Cần một giải pháp quản lý trạng thái toàn cục (Context API, Redux, Zustand) hoặc tích hợp hoàn toàn với backend để quản lý giỏ hàng và danh sách yêu thích một cách nhất quán.
6.  **Hardcode dữ liệu**: Nhiều nơi đang hardcode dữ liệu (ví dụ: danh mục, phí vận chuyển, mật khẩu admin trong script). Cần fetch từ DB hoặc file cấu hình.
7.  **Xử lý lỗi**: Mặc dù có `try-catch` và `toast` thông báo lỗi, cần đảm bảo xử lý lỗi toàn diện hơn, bao gồm hiển thị thông báo lỗi chi tiết cho người dùng và log lỗi trên server.
8.  **Tối ưu hóa hiệu suất**: Việc import CSS từ CDN trong `layout.tsx` có thể được tối ưu bằng cách tự host hoặc sử dụng các phương pháp tối ưu hóa khác của Next.js.

## 5. Các task cần tiếp tục triển khai

Dựa trên phân tích trên, đây là các task ưu tiên cần được triển khai:

1.  **Kích hoạt và hoàn thiện xác thực Admin**:
    *   Bỏ comment logic xác thực trong [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx) và đảm bảo nó hoạt động đúng.
    *   Kiểm tra và đảm bảo script [`creat-admin.js`](creat-admin.js) hoạt động đúng sau khi thêm trường `status` vào mô hình `User`.

2.  **Triển khai API Backend cho tất cả các mô hình**:
    *   Tạo các API routes hoặc server actions cho `Category`, `Product`, `Order`, `Post`, `Promotion`, `User`, `Address`, `Wishlist`, `Settings`.
    *   Các API này cần hỗ trợ các thao tác CRUD (Create, Read, Update, Delete) và các chức năng tìm kiếm, lọc, phân trang.

3.  **Tích hợp Frontend với API Backend**:
    *   **Phần Admin**:
        *   Dashboard: Fetch dữ liệu thống kê, đơn hàng gần đây, sản phẩm bán chạy từ API.
        *   Quản lý danh mục: Fetch danh mục, thêm/sửa/xóa danh mục thông qua API.
        *   Quản lý sản phẩm: Fetch sản phẩm, thêm/sửa/xóa sản phẩm thông qua API. Triển khai upload hình ảnh thực tế.
        *   Quản lý đơn hàng: Fetch đơn hàng, cập nhật trạng thái, xóa đơn hàng thông qua API. Triển khai chức năng xuất Excel.
        *   Quản lý bài viết: Fetch bài viết, thêm/sửa/xóa bài viết thông qua API.
        *   Quản lý khuyến mãi: Fetch khuyến mãi, thêm/sửa/xóa khuyến mãi thông qua API.
        *   Cài đặt hệ thống: Fetch cài đặt, cập nhật cài đặt thông qua API.
        *   Quản lý người dùng: Fetch người dùng, thêm/sửa/xóa người dùng thông qua API. Triển khai chức năng xuất Excel, DS chờ chi trả, Import đối tác.
    *   **Phần Client**:
        *   Trang sản phẩm: Fetch sản phẩm và danh mục từ API. Triển khai lọc, sắp xếp, phân trang.
        *   Trang chi tiết sản phẩm: Fetch chi tiết sản phẩm từ API.
        *   Giỏ hàng: Triển khai hệ thống quản lý giỏ hàng (có thể dùng Context API/Redux kết hợp với API backend). Tích hợp thêm/xóa/cập nhật số lượng sản phẩm, áp dụng mã giảm giá.
        *   Thanh toán: Fetch thông tin giỏ hàng, xử lý thông tin giao hàng, tích hợp cổng thanh toán, tạo đơn hàng qua API.
        *   Tài khoản người dùng: Fetch thông tin cá nhân, đơn hàng, địa chỉ, sản phẩm yêu thích từ API. Triển khai cập nhật thông tin, quản lý địa chỉ, quản lý danh sách yêu thích.
        *   Đăng xuất: Gọi API đăng xuất.

4.  **Triển khai chức năng Upload File**:
    *   Xây dựng API endpoint để xử lý việc upload hình ảnh (sản phẩm, CCCD).
    *   Tích hợp với dịch vụ lưu trữ file (ví dụ: Cloudinary, AWS S3, hoặc lưu trữ cục bộ nếu phù hợp).
    *   Cập nhật các form liên quan để gửi file và lưu URL trả về vào cơ sở dữ liệu.

5.  **Hoàn thiện các trang còn lại**:
    *   Kiểm tra và tích hợp dữ liệu cho các trang như `chinh-sach`, `faq`, `gioi-thieu`, `lien-he`, `bai-viet`.

6.  **Tối ưu hóa và xử lý lỗi**:
    *   Cải thiện việc xử lý lỗi và hiển thị thông báo cho người dùng.
    *   Xem xét tối ưu hóa hiệu suất tải tài nguyên (CSS, JS, hình ảnh).

Báo cáo này cung cấp một cái nhìn tổng quan về trạng thái hiện tại của codebase và các bước tiếp theo cần thiết để hoàn thiện dự án.