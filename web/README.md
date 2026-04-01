# Setorial Web Landing Page

This is the premium React landing page for Setorial, built with Vite, React, and Three.js.

## 🚀 Getting Started

To start the development server locally:

1. **Navigate to the web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies** (if you haven't already):
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

The site will be available at [http://localhost:5173/](http://localhost:5173/).

## 🛠️ Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Animations**: [react-spring](https://www.react-spring.dev/) (Scroll-triggered animations)
- **3D Hero**: [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [Three.js](https://threejs.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS with Glassmorphism and modern design patterns.

## 🚢 Deployment

This service is ready to be deployed to **Railway**.

1. Connect your repository to Railway.
2. Create a new service from the `/web` root directory.
3. Railway will use the included `Dockerfile` to build and serve the static assets.
4. Ensure the port is mapped to `8080`.

## 📂 Project Structure

- `src/components/`: Modular UI components (Navbar, Hero, FAQ, etc.)
- `src/hooks/`: Custom React hooks (e.g., `useScrollAnimation`)
- `src/index.css`: Main design system and global styles.
- `public/`: Static assets like the logo.
