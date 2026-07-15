# AeroView — Aircraft 3D Viewer

Viewer máy bay 3D toàn màn hình, tối ưu cho điện thoại và PC bằng Next.js 16, React 19, React Three Fiber, Three.js và shadcn/ui.

Ứng dụng được xuất thành website tĩnh. Máy chủ production không cần Node.js và không chạy `next start` — IIS chỉ phục vụ nội dung trong thư mục `dist/`.

## Chạy và kiểm tra tại máy phát triển

Yêu cầu Node.js `>= 20.9.0`.

```powershell
npm ci
npm run dev
```

Mở `http://localhost:3000`.

Kiểm tra và tạo static export:

```powershell
npm run typecheck
npm run lint
npm run build
npm run start
```

`npm run build` tạo thư mục `dist/`. Lệnh `npm run start` chỉ dùng `serve` để xem thử chính thư mục này tại máy phát triển.

## Hai model PC và Mobile

File nguồn `aircraft.glb` chỉ dùng trong quá trình authoring, không được đưa lên IIS. Viewer tự chọn:

| Profile | Texture tối đa | Dung lượng GLB | VRAM texture tối thiểu | Thiết bị mục tiêu |
| --- | ---: | ---: | ---: | --- |
| `aircraft-mobile.glb` | 512 px | ~5,6 MB | ~11,8 MiB | Điện thoại, tablet, màn hình nhỏ, thiết bị RAM thấp hoặc mạng chậm |
| `aircraft-pc.glb` | 1024 px | ~11,7 MB | ~47 MiB | PC và thiết bị có tài nguyên tốt hơn |

Các số VRAM là ước tính tối thiểu cho texture ETC1S sau khi Basis transcoder chọn định dạng nén phù hợp với GPU; thiết bị cũ có thể dùng nhiều hơn. Toàn bộ thư mục static export hiện khoảng 22,6 MB, còn `aircraft.glb` nguồn không được deploy.

Viewer không tải cả hai file. Khi mở trang, code chọn đúng một model trước khi dựng Canvas:

- Chọn `aircraft-mobile.glb` khi trình duyệt báo mobile, viewport tối đa 820 px, con trỏ touch/coarse, RAM thiết bị tối đa 6 GB, bật Data Saver hoặc đang dùng mạng 2G/3G.
- Các trường hợp còn lại chọn `aircraft-pc.glb`.

Nhờ vậy điện thoại chỉ tải asset mobile; PC yếu hoặc mạng chậm cũng tự được bảo vệ bằng profile nhẹ.

Pipeline chuẩn hóa kính `Mat 20`, bỏ các texture kính không còn cần thiết, tạo hai profile, giảm geometry opaque có kiểm soát, gộp primitive cùng material để giảm draw call và nén geometry bằng Meshopt. Kính được loại khỏi bước simplify nên vẫn giữ nguyên hình học và alpha.

Tạo bản production ETC1S KTX2 có mipmap + Meshopt:

```powershell
npm run optimize:model
```

Nếu cần bản WebP + Meshopt để đối chiếu hoặc dùng làm fallback:

```powershell
npm run optimize:model:webp
```

Pipeline KTX2 dùng encoder WASM cục bộ từ dependencies của dự án; không cần cài `toktx` hoặc KTX-Software toàn hệ thống. KTX2 có thể lớn hơn WebP khi tải qua mạng, nhưng giảm đáng kể VRAM texture, chi phí upload GPU và hiện tượng rung texture ở khoảng cách xa nhờ mipmap — phù hợp hơn cho điện thoại.

Hai lệnh ghi vào cùng hai file trong `public/models/`; pipeline chạy sau cùng là phiên bản được build và deploy. `KTX2Loader`, Basis transcoder, Meshopt decoder và Draco decoder đều được self-host trong `public/decoders/`.

Sau khi tạo model, luôn build lại để model mới được chép vào `dist/models/`:

```powershell
npm run optimize:model
npm run typecheck
npm run lint
npm run build
```

## Static export cần deploy

Sau build, kiểm tra tối thiểu:

```text
dist/
├── index.html
├── 404.html
├── web.config
├── _next/static/
├── models/
│   ├── aircraft-mobile.glb
│   └── aircraft-pc.glb
└── decoders/
    ├── basis/
    └── draco/
```

Chỉ sao chép **nội dung của `dist/`** lên IIS. Không deploy các thư mục/file sau:

- `.next/`
- `node_modules/`
- `app/`, `components/`, `scripts/`
- `aircraft.glb` gốc
- toàn bộ repository

Đây là điểm quan trọng để tránh đưa hàng trăm MB hoặc hơn 1 GB file build/source không cần thiết lên máy chủ.

## Deploy IIS cho aircraft-3d.hongvan.net

### 1. Chuẩn bị IIS

Bật các role service:

- Static Content
- Default Document
- Static Content Compression
- Request Filtering

Cài thêm **IIS URL Rewrite 2.1**. Nếu thiếu module này, IIS sẽ báo lỗi cấu hình `500.19` tại section `<rewrite>`.

Khuyến nghị IIS 10 trên Windows Server được cập nhật đầy đủ. Thuộc tính `removeServerHeader` trong `web.config` có thể không được hỗ trợ trên IIS cũ.

### 2. Chuẩn bị DNS và chứng chỉ

1. Trỏ bản ghi `A`/`AAAA` của `aircraft-3d.hongvan.net` về máy chủ IIS.
2. Cấp chứng chỉ có CN/SAN chứa chính xác `aircraft-3d.hongvan.net`, bằng win-acme/Let's Encrypt hoặc nhà cung cấp chứng chỉ đang dùng.
3. Thiết lập gia hạn tự động và kiểm tra lại HTTPS sau một lần renew thử.

`web.config` cho phép đường dẫn `/.well-known/acme-challenge/` đi qua trước rule chuyển hướng để hỗ trợ HTTP-01 challenge.

### 3. Chép đúng static export

Ví dụ dùng một thư mục IIS dành riêng cho website:

```powershell
$target = "C:\Sites\aircraft-3d"
New-Item -ItemType Directory -Force -Path $target | Out-Null
robocopy .\dist $target /MIR /R:2 /W:2
if ($LASTEXITCODE -ge 8) { throw "Deploy thất bại, robocopy exit code $LASTEXITCODE" }
```

`/MIR` xóa file build cũ không còn xuất hiện trong `dist/`, vì vậy chỉ dùng với thư mục đích dành riêng cho website này. Tài khoản của Application Pool cần quyền `Read & execute` trên thư mục đích.

### 4. Tạo website và binding

Trong IIS Manager:

1. Tạo Application Pool riêng, đặt `.NET CLR version: No Managed Code` và pipeline `Integrated`.
2. Tạo website với physical path `C:\Sites\aircraft-3d`.
3. Thêm binding HTTP: port `80`, host name `aircraft-3d.hongvan.net`.
4. Thêm binding HTTPS: port `443`, cùng host name, bật SNI và chọn đúng chứng chỉ.
5. Giữ Anonymous Authentication bật.
6. Không bật `Require SSL` trong IIS SSL Settings; rule trong `web.config` cần nhận request HTTP để trả redirect chuẩn sang HTTPS.

Binding HTTP vẫn cần thiết vì `web.config` chịu trách nhiệm redirect vĩnh viễn về HTTPS và canonical host.

## MIME, cache và CSP đã cấu hình

`public/web.config` được Next.js chép thành `dist/web.config` và cấu hình:

- MIME cho `.glb`, `.gltf`, `.bin`, `.ktx2`, `.ktx`, `.wasm`, `.webp`, `.drc` và `.mjs`.
- HTML và file không có rule riêng: không cache, phù hợp để nhận bản deploy mới.
- `/_next/static/`: cache 365 ngày với `immutable`; các filename này đã có hash.
- `/models/`: cache 7 ngày và có ETag.
- `/decoders/`: cache 30 ngày và có ETag.
- CSP chỉ cho tài nguyên self-host, đồng thời cho phép WebAssembly và blob worker của Basis/Draco.
- HSTS, `nosniff`, Referrer Policy, Permissions Policy và các header bảo vệ framing.

Tên model hiện là URL cố định. Khi thay GLB nhưng giữ nguyên filename, trình duyệt cũ có thể giữ model trước đó tối đa 7 ngày. Khi cần phát hành model khẩn cấp, hãy đổi version trong URL/filename hoặc điều chỉnh chiến lược cache trước khi deploy.

CSP và `X-Frame-Options: SAMEORIGIN` hiện chặn nhúng viewer từ website khác. Nếu sau này thêm analytics, CDN hoặc iframe cross-origin, cần mở đúng origin trong CSP thay vì tắt toàn bộ policy.

## Kiểm tra sau deploy

```powershell
curl.exe -I http://aircraft-3d.hongvan.net/
curl.exe -I https://aircraft-3d.hongvan.net/
curl.exe -I https://aircraft-3d.hongvan.net/models/aircraft-mobile.glb
curl.exe -I https://aircraft-3d.hongvan.net/models/aircraft-pc.glb
curl.exe -I https://aircraft-3d.hongvan.net/decoders/basis/basis_transcoder.wasm
```

Kết quả mong đợi:

- HTTP trả redirect `301` về HTTPS canonical host.
- Trang HTTPS trả `200` và có CSP/HSTS.
- GLB trả `Content-Type: model/gltf-binary` và cache 7 ngày.
- WASM trả `Content-Type: application/wasm` và cache 30 ngày.
- DevTools Network không có request ra CDN; model, worker và decoder đều tải từ cùng domain.

Cuối cùng, kiểm tra trên ít nhất một điện thoại thật và một PC: model Mobile/PC được chọn đúng, kính trong suốt nhìn được cockpit, orbit/pinch mượt và không có lỗi WebGL trong Console.

## Điều khiển viewer

- Kéo chuột hoặc một ngón: orbit.
- Cuộn hoặc pinch: zoom.
- `Space`: bật/tắt tự xoay.
- `R`: reset; `G`: grid; `W`: wireframe.
- `1`–`4`: phối cảnh, chính diện, cạnh bên và từ trên.
