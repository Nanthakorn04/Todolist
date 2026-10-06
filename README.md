# Daylist

เว็บ To-Do List ที่มีบัญชีผู้ใช้ หมวดหมู่ สถานะงาน รายละเอียดงาน และผู้เกี่ยวข้อง

## ฟังชั่นต่างๆของTodolist

- สมัครสมาชิก เข้าสู่ระบบ และออกจากระบบ
- เพิ่ม แก้ไข และลบงาน
- ใส่รายละเอียด หมวดหมู่ สถานะ และกำหนดส่งให้แต่ละงาน
- เลือกผู้ใช้ที่เกี่ยวข้องกับงานได้
- ดูงานบน Dashboard และดูจำนวนงานตามสถานะ
- ค้นหางาน และกรองตามหมวดหมู่หรือสถานะ
- ดูรายการหมวดหมู่ แล้วกดเพื่อดูงานในหมวดนั้น
- เก็บข้อมูลงานและบัญชีผู้ใช้ใน MongoDB โดยแยกงานตามบัญชี

## เริ่มใช้งาน

ติดตั้งแพ็กเกจ:

```sh
npm install
```

สร้างไฟล์ `.env` จากตัวอย่าง แล้วกรอกค่า MongoDB กับ secret สำหรับ session:

```sh
cp .env.example .env
```

เปิด API และหน้าเว็บใน terminal แยกกัน โดยสั่งจากโฟลเดอร์ `Todolist`:

```sh
npm run dev:api
```

```sh
npm run dev
```

## คำสั่งที่ใช้บ่อย

- `npm run dev` เปิดหน้าเว็บสำหรับพัฒนา
- `npm run dev:api` เปิด Express API
- `npm run build` สร้างไฟล์สำหรับ deploy
- `npm run lint` ตรวจโค้ด

## Deploy บน Vercel

1. Push โปรเจกต์ขึ้น GitHub แล้ว Import repository ใน Vercel.
2. ใช้ Root Directory `./` ซึ่งเป็นโฟลเดอร์ที่มี `package.json`.
3. เพิ่ม Environment Variables ใน Vercel: `MONGODB_URI`, `MONGODB_DB`, และ `AUTH_SECRET`.
4. ใช้ Build Command `npm run build` และ Output Directory `dist`.

ไฟล์ `.env` ใช้เก็บค่าลับในเครื่องเท่านั้น อย่า push ขึ้น GitHub; ให้เพิ่มค่าจริงใน Vercel Project Settings แทน

## โครงสร้างหลัก

- `src/App.jsx` จัดการสถานะหลักและเชื่อมหน้าเว็บเข้ากับ API
- `src/components/` เก็บส่วนหน้าเว็บ เช่น Dashboard, กระดานงาน และ modal
- `src/api/` รวมฟังก์ชันเรียก API
- `src/tailwind.css` เก็บ Tailwind และคลาสที่ใช้ซ้ำในหน้าเว็บ
- `api/` มีไฟล์ทางเข้าสำหรับแต่ละ API route บน Vercel และเรียก Express app ร่วมกัน
- `server/app.js` เก็บ Express routes และ `server/index.js` ใช้เปิด API ในเครื่อง
- `server/auth.js` และ `server/db.js` ดูแล session กับ MongoDB
