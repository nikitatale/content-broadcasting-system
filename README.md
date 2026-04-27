# Content Broadcasting System

A backend system that allows teachers to upload content (images), principal to approve/reject it, and students to access live/active content via public API.
- This project was built for backend technical assignment focusing on simple and clear implementation.
- I kept scheduling logic intentionally simple for explainability.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Auth**: JWT + bcryptjs
- **File Upload**: Multer (local storage)

---

## Setup & Run

### Before Running
- Node.js v16+
- PostgreSQL running locally

### Steps

**1. Clone & Install**
```bash
git clone <your-repo-url>
cd content-broadcasting-system
npm install
```

**2. Create PostgreSQL Database**
```sql
CREATE DATABASE content_broadcasting;
```

**3. Configure Environment**

Edit `.env` file:
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=content_broadcasting
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
```

**4. Run the Server**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

> Tables will be created automatically when server starts.

Server runs at: `http://localhost:3000`

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register user |
| POST | `/auth/login` | None | Login and get JWT |

**Register Body:**
```json
{
  "name": "John Teacher",
  "email": "john@school.com",
  "password": "password123",
  "role": "teacher"
}
```
> role can be: `teacher` or `principal`

**Login Body:**
```json
{
  "email": "john@school.com",
  "password": "password123"
}
```
**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "name": "John Teacher", "role": "teacher" }
}
```

---

### Content (Teacher)

> Requires: `Authorization: Bearer <token>` + role = teacher

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/content/upload` | Upload content (multipart/form-data) |
| GET | `/content/my` | View own uploaded content |

**Upload Form Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| file | YES | Image file (jpg/png/gif, max 10MB) |
| title | YES | Content title |
| subject | YES | Subject name (e.g., maths, science) |
| description | NO | Optional description |
| start_time | YES* | ISO datetime when content becomes active |
| end_time | YES* | ISO datetime when content stops being active |
| rotation_duration | NO | Minutes this content stays visible (default: 5) |

> *start_time and end_time are required for content to appear in live API

**Example curl:**
```bash
curl -X POST http://localhost:3000/content/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/image.jpg" \
  -F "title=Chapter 1 Questions" \
  -F "subject=maths" \
  -F "start_time=2026-04-27T00:00:00.000Z" \
  -F "end_time=2026-04-28T23:59:59.000Z" \
  -F "rotation_duration=5"
```

---

### Approval (Principal)

> Requires: `Authorization: Bearer <token>` + role = principal

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/content/all` | View all content (optional: ?status=pending) |
| PATCH | `/content/:id/approve` | Approve content |
| PATCH | `/content/:id/reject` | Reject content with reason |

**Reject Body:**
```json
{
  "rejection_reason": "Content is not appropriate for students"
}
```

---

### Public Broadcasting API (Students)

> No authentication required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/content/live/:teacherId` | Get active live content for teacher |
| GET | `/content/live/:teacherId?subject=maths` | Filter by subject |

**Example:**
```
GET /content/live/1
GET /content/live/2?subject=science
```

**Success Response:**
```json
{
  "message": "Live content fetched successfully",
  "teacher": { "id": 1, "name": "John Teacher" },
  "data": {
    "maths": {
      "id": 3,
      "title": "Chapter 2 Questions",
      "subject": "maths",
      "file_url": "/uploads/1234567890.jpg",
      "rotation_duration": 5
    },
    "science": {
      "id": 5,
      "title": "Lab Work Sheet",
      "subject": "science",
      "file_url": "/uploads/9876543210.png",
      "rotation_duration": 3
    }
  }
}
```

**No Content Response:**
```json
{
  "message": "No content available",
  "data": null
}
```

---

## Scheduling Logic

- Each teacher's content is grouped by subject
- Within each subject, content rotates based on `rotation_duration` (minutes)
- Rotation is calculated from start of current day
- Example with 3 Maths contents (5min, 3min, 7min = 15min cycle):
  - 00:00 – 00:05 → Content A shown
  - 00:05 – 00:08 → Content B shown
  - 00:08 – 00:15 → Content C shown
  - 00:15 – 00:20 → Content A shown again (loops)
- Each subject rotates independently

## Content Status Lifecycle

```
Upload → pending → approved → visible in live API
                → rejected  → rejection_reason stored
```

## Cases Covered

- No approved content → "No content available"
- Content not within time window → not shown
- Invalid teacherId → "No content available"
- Invalid subject filter → empty response
- Wrong file type → 400 error
- File too large → 400 error

---

## Notes

- `start_time` and `end_time` must be set by teacher for content to be live (by design)
- Rotation order is based on content upload time (created_at)
- Subject names are case-insensitive (stored as lowercase)
- One principal is enough (no multi-principal support needed)
