cd .# Rituu Saarthhii - Tours & Travels Website

A full-stack, production-ready website for a travel agency specializing in spiritual tours and holiday packages.

## Features
- **Public Website**: Home, Packages, About, Contact pages.
- **Enquiry System**: Lead generation form with email notifications and database storage.
- **Admin Panel**: Secure dashboard to manage tour packages and view enquiries.
- **Responsive Design**: Optimized for mobile, tablet, and desktop views.
- **SEO Optimized**: Meta tags and semantic HTML for better search visibility.

## Tech Stack
- **Frontend**: React + Tailwind CSS (v4)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT & Bcrypt

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `server` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file based on the template:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ADMIN_EMAIL=your_email@gmail.com
   ```
4. Start the server: `npm start` (or `node index.js`)

### 2. Frontend Setup
1. Navigate to the `client` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Deployment
- **Frontend**: Ready for Vercel. Connect your GitHub and select the `client` folder.
- **Backend**: Ready for Render or Railway. Deploy the `server` folder and set the environment variables.
- Live Example: https://rituusaarthhii-tours-travels.vercel.app/


