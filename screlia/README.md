# MULTITOOL v2.0

MULTITOOL is a comprehensive, full-stack multi-functional dashboard and toolset designed to provide seamless access to AI assistants, productivity tools, and real-time information. Built meticulously with modern web technologies.

## Features

- ** Advanced AI Chat:** Integrated chat leveraging Gemini, ChatGPT, and Claude models. Supports text and vision (image analysis) modes, plus AI image generation.
- ** Secure Authentication:** Powered by Firebase Authentication with Google SSO and Email/Password support, including 2FA and email verification.
- ** Cloud Persistence:** User preferences, chat histories, and settings are securely stored in a PostgreSQL database (Cloud SQL) using Drizzle ORM.
- ** Productivity Suite:**
  - **Notes:** Create, edit, and organize personal notes.
  - **Search:** Enhanced search functionality.
  - **Weather & News:** Real-time information pulled from external services.
  - **Code Studio:** A dedicated space for quick coding and technical problem solving.
- ** Globalization (i18n):** Deeply integrated language support for English, Deutsch (German), and Türkçe (Turkish).
- ** Highly Customizable UI:** Fully responsive design with multiple themes (Light, Dark, Midnight, Forest, System) crafted with Tailwind CSS.

##  Tech Stack

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Framer Motion (Animations)
- Lucide React (Icons)

**Backend:**
- Node.js & Express
- PostgreSQL (via Google Cloud SQL)
- Drizzle ORM
- Firebase Admin SDK

##  Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd multitool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your configuration details. You will need:
   - Firebase Client Credentials
   - Firebase Admin Credentials (for backend user validation)
   - Cloud SQL Database connection details (Host, DB Name, User, Password)
   
4. **Database Configuration:**
   Make sure you push the schema to your instance using Drizzle.
   ```bash
   npx drizzle-kit push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

## Credits

**MULTITOOL v2.0** is meticulously developed and designed by **Rahman Ege Karasu** (Rahman Studio).

**Warring**
To utilize AI models, obtain your API key.
