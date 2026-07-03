import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { db } from './src/db/index.ts';
import { userSettings } from './src/db/schema.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { eq } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/settings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || '';
      
      // Ensure user exists in our SQL DB
      await getOrCreateUser(uid, email);

      const result = await db.select().from(userSettings).where(eq(userSettings.userId, uid));
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        // Return default empty settings
        res.json({});
      }
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/settings', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || '';
      
      await getOrCreateUser(uid, email);

      const newSettings = req.body;
      const result = await db.insert(userSettings)
        .values({
          userId: uid,
          ...newSettings
        })
        .onConflictDoUpdate({
          target: userSettings.userId,
          set: {
            ...newSettings
          }
        })
        .returning();
      
      res.json(result[0]);
    } catch (error: any) {
      console.error('Failed to update settings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
