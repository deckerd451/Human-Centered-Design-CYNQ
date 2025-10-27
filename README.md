# CodeStream: Seamless GitHub Integration

A minimalist web application for securely connecting and visualizing your GitHub account information.

[cloudflarebutton]

## Overview

CodeStream is a visually stunning, minimalist web application designed to provide a seamless and secure way for users to connect their GitHub accounts. The application features a clean, single-page interface where users can initiate a mock OAuth flow to authorize CodeStream. Once 'connected', it displays a summary of their public profile information, such as their avatar, username, bio, and key statistics (repositories, followers, following).

The entire experience is designed with a focus on simplicity, security, and visual elegance, leveraging a minimalist design aesthetic with ample white space, a refined color palette, and subtle micro-interactions. The application is built to run on Cloudflare's serverless infrastructure, ensuring high performance and reliability.

## Key Features

-   **Simulated GitHub OAuth Flow**: A safe, mock authentication process to demonstrate the connection flow without requiring real credentials.
-   **Dynamic UI States**: The interface smoothly transitions between 'disconnected', 'connecting', and 'connected' states.
-   **GitHub Profile Summary**: Displays mock user data including avatar, name, bio, and key stats in a clean, organized card.
-   **Minimalist & Responsive Design**: A beautiful, clutter-free UI that looks great on all devices, from mobile phones to desktops.
-   **State Management with Zustand**: Efficient and minimal state management for a reactive and performant user experience.
-   **Built on Cloudflare**: Leverages the power of Cloudflare Workers for a fast, globally distributed, and serverless backend.

## Technology Stack

-   **Frontend**: React, TypeScript, Vite
-   **Styling**: Tailwind CSS, shadcn/ui
-   **State Management**: Zustand
-   **Animation**: Framer Motion
-   **Icons**: Lucide React
-   **Backend**: Hono on Cloudflare Workers

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd codestream
    ```

2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```bash
    bun install
    ```

## Development

To run the application in development mode, which includes hot-reloading for both the frontend and the worker backend, use the following command:

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

2.  **Deploy the application:**
    Run the deploy script, which builds the project and deploys it to Cloudflare.
    ```bash
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository using the button below.

[cloudflarebutton]

## Project Structure

The project is organized into three main directories:

-   `src/`: Contains all the frontend React application code, including pages, components, hooks, and styles.
-   `worker/`: Contains the backend Hono application code that runs on Cloudflare Workers.
-   `shared/`: Contains shared code, primarily TypeScript types, that is used by both the frontend and the backend to ensure type safety.

## License

This project is licensed under the MIT License.