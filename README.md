# Innovation Engine
An application to foster, develop, and collaborate on new ideas.
[cloudflarebutton]
## Overview
The Innovation Engine is a web platform designed to capture, refine, and build upon creative ideas. It provides a collaborative space where users can submit their concepts, form teams with skilled individuals, and manage their projects from inception to completion. The platform includes features like idea submission, team building, a leaderboard to recognize top innovators, and an interactive graph to visualize the entire innovation ecosystem.
Built on Cloudflare's serverless infrastructure and backed by Supabase, the application is fast, reliable, and scalable, providing a seamless experience for innovators worldwide.
## Key Features
-   **Magic Link Authentication**: Secure, passwordless login using one-time magic links.
-   **Idea Submission & Management**: A structured form for submitting new ideas and tools for authors to edit or delete their submissions.
-   **Interactive Dashboard**: A personalized dashboard for users to view their profile, submitted ideas, and team memberships.
-   **Team Builder**: A dedicated page to discover projects seeking collaborators and filter them by required skills.
-   **Leaderboard**: Showcases top innovators and trending ideas to foster healthy competition and recognition.
-   **Idea Detail Pages**: Comprehensive views for each idea, including description, author details, team members, and a discussion section.
-   **Interactive Project Board**: A Kanban-style board for managing tasks and tracking the progress of an idea.
-   **GitHub Integration**: Connect a GitHub account to display developer stats and link repositories to projects.
-   **Real-time Notifications**: An in-app notification system for events like new comments or team join requests.
-   **Synapse Idea Graph**: A dynamic, interactive visualization of the relationships between ideas, users, and skills.
## Technology Stack
-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, shadcn/ui
-   **State Management**: Zustand
-   **Animation**: Framer Motion
-   **Data Fetching**: TanStack Query (React Query)
-   **Backend**: Hono on Cloudflare Workers
-   **Database**: Supabase
-   **Visualization**: @xyflow/react
## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
-   A [Supabase project](https://supabase.com/).
### Installation
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd innovation-engine
    ```
2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```bash
    bun install
    ```
## Development
To run the application in development mode, which includes hot-reloading for both the frontend and the worker backend, you'll need to set up local environment variables.
1.  Create a `.dev.vars` file in the root of the project.
2.  Add your Supabase credentials to this file:
    ```
    SUPABASE_URL="https://your-project-url.supabase.co"
    SUPABASE_KEY="your-project-anon-key"
    ```
3.  Run the development server:
    ```bash
    bun dev
    ```
This will start the Vite development server for the React frontend and a local `workerd` instance for the Hono API. The application will be available at `http://localhost:3000`.
## Deployment
This application is designed for easy deployment to Cloudflare's global network.
1.  **Login to Wrangler:**
    Authenticate with your Cloudflare account.
    ```bash
    bunx wrangler login
    ```
2.  **Configure Environment Variables:**
    Before deploying, you must configure your Supabase credentials as secrets in Cloudflare. See the **Environment Configuration** section below for detailed steps.
3.  **Deploy the application:**
    Run the deploy script, which builds the project and deploys it to Cloudflare.
    ```bash
    bun run deploy
    ```
### Environment Configuration
For the application to connect to the database upon deployment, you must configure two environment variables as secrets in your Cloudflare Worker settings.
1.  Navigate to your Cloudflare Dashboard.
2.  Go to **Workers & Pages** and select your deployed application (e.g., `codestream-vkcw4hai2hmtkthjxbpbn`).
3.  Click on the **Settings** tab.
4.  Select the **Variables** section from the side menu.
5.  Under **Environment Variables**, click **Add variable** for each of the following secrets:
    -   **Variable name**: `SUPABASE_URL`
        -   **Value**: `https://hvmotpzhliufzomewzfl.supabase.co`
        -   Make sure to click the **Encrypt** button to secure your variable.
    -   **Variable name**: `SUPABASE_KEY`
        -   **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bW90cHpobGl1ZnpvbWV3emZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NzY2NDUsImV4cCI6MjA1ODE1MjY0NX0.foHTGZVtRjFvxzDfMf1dpp0Zw4XFfD-FPZK-zRnjc6s`
        -   Make sure to click the **Encrypt** button.
6.  After adding both variables, redeploy your application for the changes to take effect. You can do this from the **Deployments** tab by triggering a new deployment, or by running `bun run deploy` again.
## Project Structure
The project is organized into three main directories:
-   `src/`: Contains all the frontend React application code, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Hono application code that runs on Cloudflare Workers, including the Durable Object and Supabase client.
-   `shared/`: Contains shared code, primarily TypeScript types, that is used by both the frontend and the backend to ensure type safety.
## License
This project is licensed under the MIT License.