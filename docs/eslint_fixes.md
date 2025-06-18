# Hướng dẫn sửa lỗi ESLint và TypeScript

## Tổng quan

File này liệt kê các lỗi và cảnh báo từ quá trình lint và cung cấp hướng dẫn cụ thể để sửa chúng.

## Các loại lỗi

*   **Error:** Lỗi cần được sửa để đảm bảo code hoạt động đúng.
*   **Warning:** Cảnh báo về các vấn đề tiềm ẩn, nên được xem xét và sửa nếu cần thiết.

## Chi tiết lỗi và cách sửa

### 1. Các lỗi "defined but never used" (`@typescript-eslint/no-unused-vars`)

Các lỗi này chỉ ra rằng bạn đã import hoặc khai báo một biến, component, hoặc function nhưng không sử dụng nó trong file.

**Cách sửa:**

*   **Xóa import/khai báo:** Nếu bạn chắc chắn không cần sử dụng, hãy xóa dòng import hoặc khai báo đó.
*   **Sử dụng biến/component/function:** Nếu bạn định sử dụng nó sau này, hãy đảm bảo bạn thực sự sử dụng nó trong code.

**Ví dụ:**

*   `./src/app/admin/affiliate/analytics/page.tsx`
    *   `5:15 Error: 'TrendingDown' is defined but never used.`
    *   `5:36 Error: 'Link2' is defined but never used.`
    *   `6:25 Error: 'Calendar' is defined but never used.`

    **Sửa:** Kiểm tra xem bạn có thực sự sử dụng `TrendingDown`, `Link2`, và `Calendar` trong file này không. Nếu không, hãy xóa các dòng import tương ứng.

### 2. Các cảnh báo "React Hook useEffect has a missing dependency" (`react-hooks/exhaustive-deps`)

Các cảnh báo này chỉ ra rằng bạn đã sử dụng `useEffect` mà không khai báo đầy đủ các dependency. Điều này có thể dẫn đến các hành vi không mong muốn, đặc biệt khi bạn sử dụng các biến hoặc function bên trong `useEffect` mà không đưa chúng vào dependency array.

**Cách sửa:**

*   **Thêm dependency:** Thêm các biến hoặc function mà `useEffect` sử dụng vào dependency array.
*   **Loại bỏ dependency array:** Nếu bạn không cần dependency array, hãy xóa nó đi. Tuy nhiên, hãy cẩn thận vì điều này có thể gây ra infinite loop nếu bạn không kiểm soát được các side effect.
*   **Sử dụng `useCallback` hoặc `useMemo`:** Nếu bạn cần sử dụng một function bên trong `useEffect` và không muốn nó thay đổi mỗi khi component re-render, hãy sử dụng `useCallback` để memoize function đó.

**Ví dụ:**

*   `./src/app/admin/affiliate/analytics/page.tsx`
    *   `68:6 Warning: React Hook useEffect has a missing dependency: 'fetchAnalyticsData'.`

    **Sửa:** Thêm `fetchAnalyticsData` vào dependency array của `useEffect`:

    ```typescript
    useEffect(() => {
      fetchAnalyticsData();
    }, [fetchAnalyticsData]);
    ```

    Hoặc, nếu `fetchAnalyticsData` không thay đổi, bạn có thể sử dụng `useCallback`:

    ```typescript
    const fetchAnalyticsData = useCallback(() => {
      // ...
    }, []);

    useEffect(() => {
      fetchAnalyticsData();
    }, [fetchAnalyticsData]);
    ```

### 3. Các lỗi "Unexpected any. Specify a different type." (`@typescript-eslint/no-explicit-any`)

Các lỗi này chỉ ra rằng bạn đã sử dụng kiểu `any` một cách không cần thiết. Sử dụng `any` làm mất đi lợi ích của TypeScript, vì nó tắt type checking cho biến đó.

**Cách sửa:**

*   **Chỉ định kiểu cụ thể:** Thay `any` bằng một kiểu cụ thể hơn, ví dụ: `string`, `number`, `object`, hoặc một interface/type bạn đã định nghĩa.
*   **Sử dụng `unknown`:** Nếu bạn không biết kiểu của biến, hãy sử dụng `unknown`. `unknown` buộc bạn phải kiểm tra kiểu trước khi sử dụng biến đó, giúp tránh các lỗi runtime.
*   **Generic type:** Sử dụng generic type để định nghĩa kiểu một cách linh hoạt hơn.

**Ví dụ:**

*   `./src/app/admin/affiliate/commissions/page.tsx`
    *   `52:38 Error: Unexpected any. Specify a different type.`

    **Sửa:** Thay `any` bằng một kiểu cụ thể hơn, ví dụ:

    ```typescript
    const [commissions, setCommissions] = useState<Commission[]>([]);
    ```

    Trong đó `Commission` là một interface hoặc type bạn đã định nghĩa.

### 4. Lỗi "Do not use an `<a>` element to navigate to `/`. Use `<Link />` from `next/link` instead." (`@next/next/no-html-link-for-pages`)

Lỗi này chỉ ra rằng bạn đang sử dụng thẻ `<a>` để điều hướng đến một trang trong ứng dụng Next.js của bạn. Thay vào đó, bạn nên sử dụng component `<Link />` từ `next/link` để tận dụng các tính năng tối ưu hóa của Next.js.

**Cách sửa:**

*   Thay thế thẻ `<a>` bằng component `<Link />` từ `next/link`.

**Ví dụ:**

*   `./src/app/admin/layout.tsx`
    *   `81:17 Error: Do not use an \`<a>\` element to navigate to \`/\`.`

    **Sửa:**

    ```jsx
    import Link from 'next/link';

    // ...
    <Link href="/">Trang chủ</Link>
    ```

### 5. Lỗi "is never reassigned. Use 'const' instead." (`prefer-const`)

Lỗi này chỉ ra rằng bạn đã khai báo một biến bằng `let` nhưng không bao giờ gán lại giá trị cho nó. Trong trường hợp này, bạn nên sử dụng `const` để khai báo biến đó.

**Cách sửa:**

*   Thay thế `let` bằng `const`.

**Ví dụ:**

*   `./src/app/api/affiliate/commissions/route.ts`
    *   `28:9 Error: 'whereClause' is never reassigned. Use 'const' instead.`

    **Sửa:**

    ```typescript
    const whereClause = {};
    ```

### 6. Lỗi "Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image`" (`@next/next/no-img-element`)

Lỗi này chỉ ra rằng bạn đang sử dụng thẻ `<img>` thay vì component `<Image />` từ `next/image`. Component `<Image />` cung cấp các tính năng tối ưu hóa hình ảnh như lazy loading, responsive images, và placeholder, giúp cải thiện hiệu suất trang web của bạn.

**Cách sửa:**

*   Thay thế thẻ `<img>` bằng component `<Image />` từ `next/image`.

**Ví dụ:**

*   `./src/app/admin/users/page.tsx`
    *   `351:25 Warning: Using \`<img>\` could result in slower LCP and higher bandwidth.`

    **Sửa:**

    ```jsx
    import Image from 'next/image';

    // ...
    <Image src="/path/to/image.jpg" alt="Mô tả ảnh" width={200} height={200} />
    ```

### 7. Lỗi "An interface declaring no members is equivalent to its supertype." (`@typescript-eslint/no-empty-object-type`)

Lỗi này chỉ ra rằng bạn đã định nghĩa một interface không có thuộc tính nào. Interface này tương đương với kiểu `object`, vì vậy bạn có thể sử dụng `object` thay vì định nghĩa một interface mới.

**Cách sửa:**

*   Thay thế interface bằng kiểu `object`.

**Ví dụ:**

*   `./src/components/ui/textarea.tsx`
    *   `5:18 Error: An interface declaring no members is equivalent to its supertype.`

    **Sửa:**

    ```typescript
    interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
    ```

    Có thể thay bằng:

    ```typescript
    type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    ```

### 8. Lỗi "can be escaped with `"`, `&ldquo;`, `&#34;`, `&rdquo;`." (`react/no-unescaped-entities`)

Lỗi này chỉ ra rằng bạn đang sử dụng dấu ngoặc kép (`"`) trong một chuỗi JSX mà không escape nó. Điều này có thể gây ra lỗi khi trình duyệt render trang web.

**Cách sửa:**

*   Escape dấu ngoặc kép bằng `"`, `&ldquo;`, `&#34;`, hoặc `&rdquo;`.

**Ví dụ:**

*   `./src/components/payment/momo-payment.tsx`
    *   `192:59 Error: \`"\` can be escaped with \`"\`, \`&ldquo;\`, \`&#34;\`, \`&rdquo;\`.`

    **Sửa:**

    ```jsx
    <p>Ví dụ: "Thanh toán thành công"</p>
    ```

## Lưu ý

*   Hãy sửa các lỗi theo thứ tự từ trên xuống dưới.
*   Sau khi sửa xong một lỗi, hãy chạy lại `npm run lint` để kiểm tra xem lỗi đó đã được sửa chưa và có lỗi mới nào phát sinh không.
*   Nếu bạn gặp khó khăn trong việc sửa một lỗi, hãy tìm kiếm trên Google hoặc Stack Overflow để được giúp đỡ.

Chúc bạn thành công!