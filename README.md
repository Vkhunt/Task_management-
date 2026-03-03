# TaskFlow – Modern Task Manager

A sleek, production-quality **Task Manager** built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. Tasks are persisted in **localStorage** — no backend required.

## ✨ Features

- **CRUD** — Create, view, edit, and delete tasks
- **Status tracking** — `To Do`, `In Progress`, `Done`
- **Priority levels** — `Low`, `Medium`, `High`
- **Due dates** with overdue highlighting
- **Search** tasks by title and description
- **Filter** by status and priority
- **Stats dashboard** with live counts
- **Form validation** via React Hook Form + Zod
- **Responsive** dark-mode UI

---

## 🗂 Project Structure

```
task-manager/
├── app/
│   ├── layout.tsx          # Root layout (Navbar, fonts)
│   ├── page.tsx            # Dashboard – task list, search, filter
│   ├── globals.css         # Global styles
│   └── tasks/
│       ├── new/page.tsx    # Create new task
│       └── [id]/page.tsx   # Task detail & edit
├── components/
│   ├── Navbar.tsx
│   ├── TaskCard.tsx
│   ├── TaskForm.tsx
│   ├── FilterBar.tsx
│   ├── StatsCards.tsx
│   └── EmptyState.tsx
├── lib/
│   ├── storage.ts          # localStorage CRUD
│   ├── validations.ts      # Zod schema
│   └── utils.ts            # Helpers, filtering
├── types/
│   └── task.ts             # TypeScript interfaces
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone / navigate to the project
cd task-manager

# 2. Install dependencies
npm install

# 3. Copy env example (no values needed for localStorage mode)
cp .env.example .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Key Dependencies

| Package                   | Purpose               |
| ------------------------- | --------------------- |
| `next` 14                 | App Router framework  |
| `typescript`              | Type safety           |
| `tailwindcss`             | Utility-first styling |
| `react-hook-form`         | Performant forms      |
| `zod`                     | Schema validation     |
| `@hookform/resolvers`     | RHF + Zod integration |
| `lucide-react`            | Icon library          |
| `date-fns`                | Date formatting       |
| `uuid`                    | Unique task IDs       |
| `clsx` + `tailwind-merge` | Class name utilities  |

---

## 🏗 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🗄 Data Storage

All tasks are stored in the browser's **localStorage** under the key `task-manager-tasks` as a JSON array. Data persists across page refreshes but is **per-browser and per-device**.

To migrate to a real database, replace the functions in `lib/storage.ts` with API calls and implement corresponding API routes in `app/api/`.

---

## 📄 License

MIT
