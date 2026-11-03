# CharlesAndDavid Portfolio

A personal portfolio built with Laravel, Inertia.js, React, and Vite. Project
records are stored in SQLite and can be created, viewed, updated, and deleted
through the project-management pages.

## Requirements

- PHP 8.2 or newer with SQLite support
- Composer
- Node.js and npm

## Setup

From the project directory, run:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
if (-not (Test-Path database\database.sqlite)) { New-Item database\database.sqlite -ItemType File }
php artisan migrate
npm ci
npm run build
```

If you already have a local `.env`, keep it rather than replacing it with the
example file. The default configuration uses SQLite.

## Run locally

In one terminal:

```powershell
php artisan serve
```

In another terminal, to work on the frontend with Vite:

```powershell
npm run dev
```

Open the URL printed by Laravel, usually `http://127.0.0.1:8000`.

## Project CRUD

- `/` displays the public portfolio and its project cards.
- `/projects` lists project records.
- `/projects/create` opens the create form.
- Each project can be edited or deleted from the project list.

The project form validates required fields, unique titles, URLs, image type and
size, and allowed status values on the Laravel server.

## Tests

```powershell
php artisan test
```

## Build assets

```powershell
npm run build
```
