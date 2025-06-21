# Review Schema và API

## Các vấn đề cần giải quyết:

-   **`src/app/api/users/route.ts`**:
    -   Không import và sử dụng các enums `UserRole` và `UserStatus`.
    -   Sử dụng các giá trị string `STAFF` và `ACTIVE` thay vì các enums.
-   **`src/app/api/orders/create/route.ts`**:
    -   Không import và sử dụng enum `PaymentMethod`.
    -   Sử dụng các giá trị string `COD`, `MOMO`, `BANK_TRANSFER`, và `CREDIT_CARD` thay vì enum.
-   **`src/app/api/products/[id]/route.ts`**:
    -   Không import và sử dụng enum `ProductStatus`.
    -   Sử dụng giá trị string thay vì enum.
-   **`src/app/api/posts/[id]/route.ts`**:
    -   Không import và sử dụng enum `PostStatus`.
    -   Sử dụng giá trị string thay vì enum.

## Các bước thực hiện:

1.  **`src/app/api/users/route.ts`**:
    -   Import các enums `UserRole` và `UserStatus` từ `@/lib/prisma`.
    -   Thay thế các giá trị string `STAFF` và `ACTIVE` bằng các enums `UserRole.STAFF` và `UserStatus.ACTIVE`.
2.  **`src/app/api/orders/create/route.ts`**:
    -   Import enum `PaymentMethod` từ `@/lib/prisma`.
    -   Thay thế các giá trị string `COD`, `MOMO`, `BANK_TRANSFER`, và `CREDIT_CARD` bằng các giá trị enum tương ứng.
3.  **`src/app/api/products/[id]/route.ts`**:
    -   Import enum `ProductStatus` từ `@/lib/prisma`.
    -   Thay thế giá trị string bằng enum tương ứng.
4.  **`src/app/api/posts/[id]/route.ts`**:
    -   Import enum `PostStatus` từ `@/lib/prisma`.
    -   Thay thế giá trị string bằng enum tương ứng.

## Các file cần kiểm tra thêm:

-   Xem xét các API khác để tìm các vấn đề tương tự.