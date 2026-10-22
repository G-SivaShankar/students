# Student Management

A Next.js student management app for creating student records, viewing student details, and tracking enrollment status.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```sh
npm install
npm run dev
```

Open `http://localhost:3000`.

## Pages

- `/students` — search, filter, and browse student records
- `/students/new` — add a student
- `/students/[id]` — view, edit, or delete a student
- `/students/status` — review enrollment counts and update statuses
- `/attendance` — mark active students Present, Absent, or Half day for a selected date

The API is served by the Next.js app under `/api/students`.

## Data storage

Student and attendance records are read from and written to `db.json` by the Node.js API routes. Attendance is stored by student and date; half days count as half a day in profile attendance rates. This file-backed storage is intended for local development and a single running instance. It is not suitable for serverless or multi-instance hosting; use a database before deploying that way.
