# Daily Flow

Create a modern, responsive single-page "Daily Activity Tracker" web app with a clean UI and light/dark theme support.



Key Features & Specifications:



1. Onboarding Modal (First Visit):

   - Show a popup modal requesting User Details: Name, Age, Profession/Role (Dropdown: Student, Job/Employee, Business, Other), and Qualification.

   - Save details in localStorage and hide the modal once submitted.

   - Personalize the main header to: "Welcome, [Name]! 👋 Daily Activity Tracker".



2. Task Input & Controls:

   - Search input bar to filter tasks in real-time.

   - Task creation inputs: Task Name, Time Picker (due time), Sound Selector Dropdown (e.g., Chime, Alarm), and a Green "Add" button (#28a745).



3. Progress & Task Item UI:

   - Progress status displaying "Completed: X / Y".

   - Render each task in a styled list item with a completion checkbox, task name, due time badge, an Orange "Edit" button (#ff9800), and a Red "Delete" button (#dc3545).



4. Global Controls & Filters:

   - Action Buttons: "Clear Completed" in Gray (#6c757d) and "Reset for Today" in Purple (#6f42c1).

   - Filter Buttons: "All", "Completed", "Pending" in Blue (#0d6efd).

   - Theme Toggle: Dark/Light Mode toggle button (#34495e) that updates background and text colors.



5. Reminders & Notifications:

   - Request Notification permission on initial load.

   - Check due times every 10 seconds. When a task due time matches current time, play the selected Web Audio API sound and trigger a System Push Notification (fallback to browser alert if blocked).



6. Persistence & PWA Setup:

   - Save tasks, user details, and theme settings to localStorage.

   - Include manifest.json and sw.js configuration so the app can be installed as 

a Progressive Web App (PWA).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cozy-day-doer.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/198f1b2a-63a8-4169-9816-51bb3a8aec19).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>


npm i


npm run dev
```
