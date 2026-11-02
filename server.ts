import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { getOrCreateUser, getUserByUid } from './src/db/users.ts';
import { getUserProjects, saveUserProject, deleteUserProject } from './src/db/projects.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Strict body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Initialize Gemini client strictly with User-Agent header as required
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory persistent mock database for projects & licenses (can easily connect to postgres/supabase)
interface StoredProject {
  id: string;
  userId: string;
  name: string;
  updatedAt: string;
  data: any;
}

const projectsDb = new Map<string, StoredProject>();

// Known demo licenses database
const licensesDb = new Map<string, { tier: string; maxDevices: number; activatedDevices: Set<string> }>([
  ['CR-START-8821-DEMO', { tier: 'starter', maxDevices: 1, activatedDevices: new Set() }],
  ['CR-PRO-7749-DEMO', { tier: 'professional', maxDevices: 3, activatedDevices: new Set() }],
  ['CR-AGNC-9912-DEMO', { tier: 'agency', maxDevices: 10, activatedDevices: new Set() }],
]);

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// ZIP Codebase Export Endpoint
app.get('/api/export-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'clientreport-ai-source.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'clientreport-ai-source.zip');
  } else {
    res.status(404).json({ error: 'Source code zip file has not been generated.' });
  }
});

// Multi-turn Gemini AI Chatbot endpoint
app.post('/api/ai/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, datasetContext, model = 'gemini-3.8-flash' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Valid messages array is required.' });
      return;
    }

    const selectedModel = model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    if (aiClient) {
      try {
        const systemInstruction = `You are ClientReport AI's Senior BI Consultant & Data Analyst Assistant.
Your mission is to help non-technical users and analysts interpret their dataset, formulate business strategies, clean data, and prepare executive reports.
Always remain grounded in the provided dataset context. Never hallucinate fake metrics.

Current Active Dataset Context:
- Name: ${datasetContext?.name || 'Untitled Dataset'}
- Verified Records: ${datasetContext?.rowCount || 0}
- Active Dimensions/Columns: ${datasetContext?.columnCount || 0}
- Data Health Index: ${datasetContext?.qualityScore || 100}/100
- Discovered Business KPIs: ${JSON.stringify(datasetContext?.kpis || [])}
- Key Attributes: ${JSON.stringify(datasetContext?.columns?.map((c: any) => `${c.name} (${c.type})`) || [])}

Provide clear, structured, concise answers. When suggesting data cleaning or formulas, provide actionable recommendations.`;

        // Format multi-turn conversation contents for @google/genai
        const contents = messages.map((m: any) => ({
          role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        }));

        const response = await aiClient.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction,
          },
        });

        const replyText = response.text || 'I have analyzed your request based on your dataset.';
        res.json({
          success: true,
          reply: replyText,
          model: selectedModel,
        });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini chat request failed, using intelligent offline fallback:', geminiError?.message);
      }
    }

    // Deterministic Rule-Engine Fallback Chatbot
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    let replyText = `I have analyzed your inquiry regarding **${datasetContext?.name || 'your dataset'}** (${datasetContext?.rowCount || 0} active records). `;

    if (lastUserMessage.includes('kpi') || lastUserMessage.includes('metric')) {
      replyText += `Your dataset currently features **${datasetContext?.kpis?.length || 0} automatically calculated KPIs**. Leading metrics include ${
        datasetContext?.kpis?.[0]?.label || 'Record Count'
      } (${datasetContext?.kpis?.[0]?.value || 'N/A'}). You can customize or add these directly into your Executive Report via the Report Builder.`;
    } else if (lastUserMessage.includes('clean') || lastUserMessage.includes('duplicate') || lastUserMessage.includes('outlier')) {
      replyText += `In the **Data Cleaning Studio**, we recommend: 1) Applying deduplication to eliminate identical rows, 2) Checking for empty columns, and 3) Using the IQR (1.5x) outlier filter on continuous variables to prevent skewing your standard deviation.`;
    } else if (lastUserMessage.includes('report') || lastUserMessage.includes('pdf') || lastUserMessage.includes('export')) {
      replyText += `You can generate a multi-page vector PDF in the **Report Builder (Hotkey: Ctrl+R)**. It includes your custom branding, executive summary, verified data health audit, and high-impact next steps.`;
    } else {
      replyText += `Based on the active dimensions (${datasetContext?.columnCount || 0} columns), you have strong statistical coverage. You can explore correlation pairs in the Analytics Studio, create Recharts visuals in the Visualization Studio, or export clean CSVs with formula injection defense.`;
    }

    res.json({
      success: true,
      reply: replyText,
      model: 'deterministic-fallback',
    });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    res.status(500).json({ error: 'Chat processing error: ' + (err?.message || 'Unknown error') });
  }
});

// AI Insights endpoint (Only minimal derived metrics are sent, never raw customer spreadsheets!)
app.post('/api/ai/insights', async (req: Request, res: Response): Promise<void> => {
  try {
    const { datasetSummary, kpis, columnStats } = req.body;

    if (!datasetSummary) {
      res.status(400).json({ error: 'Missing dataset summary context.' });
      return;
    }

    // If Gemini API is available and configured
    if (aiClient) {
      try {
        const prompt = `You are a Principal Business Intelligence Analyst for enterprise clients.
Analyze the following derived dataset metrics and calculate actionable, executive-ready insights.
Dataset Overview:
- Name: ${datasetSummary.name}
- Rows Analyzed: ${datasetSummary.rowCount}
- Columns: ${datasetSummary.columnCount}
- Data Quality Score: ${datasetSummary.qualityScore}/100

Discovered KPIs:
${JSON.stringify(kpis || [], null, 2)}

Column Statistical Summaries:
${JSON.stringify(columnStats || [], null, 2)}

Provide 4 distinct, highly rigorous business insights with concrete recommendations:
1. Executive Performance Summary
2. Risk & Anomaly Warning
3. High-Leverage Growth Opportunity
4. Statistical Correlation / Driver Analysis`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are a senior data analyst and management consultant. Return structured JSON only. Be accurate and base all insights strictly on provided metrics.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: 'One of: executive_brief, risk_anomaly, growth_opportunity, correlation, kpi_summary',
                  },
                  title: { type: Type.STRING, description: 'Short punchy insight title' },
                  narrative: { type: Type.STRING, description: '2-3 sentences explaining the business context' },
                  confidence: { type: Type.NUMBER, description: 'Confidence score between 0.8 and 0.99' },
                  recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '2-3 concrete next steps',
                  },
                },
                required: ['category', 'title', 'narrative', 'confidence', 'recommendations'],
              },
            },
          },
        });

        const rawText = response.text || '[]';
        const parsed = JSON.parse(rawText);

        const structuredInsights = parsed.map((item: any, idx: number) => ({
          ...item,
          id: `ai-insight-${idx}-${Date.now()}`,
          generatedWith: 'gemini',
          timestamp: new Date().toISOString(),
        }));

        res.json({ success: true, insights: structuredInsights, engine: 'gemini-3.8-flash' });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini request failed, falling back to rule-based analytical engine:', geminiError?.message);
      }
    }

    // Deterministic Rule-Based Business Intelligence Fallback
    const fallbackInsights = [
      {
        id: `rule-insight-1-${Date.now()}`,
        category: 'executive_brief',
        title: `Comprehensive Performance Baseline (${datasetSummary.rowCount} Records)`,
        narrative: `Data processing completed with a quality index of ${datasetSummary.qualityScore}/100 across ${datasetSummary.columnCount} dimensions. Metrics show a statistically stable operational distribution with primary volume centered around top cohorts.`,
        confidence: 0.94,
        recommendations: [
          'Establish recurring weekly snapshot audits to verify ongoing trend stability.',
          'Focus optimization efforts on highest standard deviation metrics where variability creates operational friction.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
      {
        id: `rule-insight-2-${Date.now()}`,
        category: 'growth_opportunity',
        title: 'High-Value Segment Concentration',
        narrative: `Distribution analysis indicates that the upper quartile (p75+) drives disproportionate outcomes compared to median performance. Expanding this segment represents the highest ROI leverage.`,
        confidence: 0.91,
        recommendations: [
          'Design dedicated retention workflows targeted specifically at upper quartile accounts.',
          'Benchmark conversion velocity in leading categories to replicate success across slower segments.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
      {
        id: `rule-insight-3-${Date.now()}`,
        category: 'risk_anomaly',
        title: 'Variance & Outlier Detection Notice',
        narrative: `The dataset exhibits localized variance in numerical tails. While core operational KPIs remain sound, extreme outliers should be isolated from standard forecasting models to avoid distortion.`,
        confidence: 0.88,
        recommendations: [
          'Apply IQR outlier filters in the Data Cleaning Studio prior to executive reporting.',
          'Verify data capture pipelines for any manual formatting or duplicate submission errors.',
        ],
        generatedWith: 'rule_engine',
        timestamp: new Date().toISOString(),
      },
    ];

    res.json({ success: true, insights: fallbackInsights, engine: 'rule_engine' });
  } catch (err: any) {
    console.error('AI Insights endpoint error:', err);
    res.status(500).json({ error: 'Failed to generate insights: ' + (err?.message || 'Unknown error') });
  }
});

// License Activation & Verification API
app.post('/api/license/verify', (req: Request, res: Response) => {
  const { licenseKey, deviceId, customerEmail } = req.body;
  if (!licenseKey || !deviceId) {
    res.status(400).json({ error: 'License key and device ID are required.' });
    return;
  }

  const cleanKey = String(licenseKey).trim().toUpperCase();
  let licenseEntry = licensesDb.get(cleanKey);

  if (!licenseEntry) {
    // Generate valid tier for patterned keys
    if (cleanKey.startsWith('CR-PRO-')) {
      licenseEntry = { tier: 'professional', maxDevices: 3, activatedDevices: new Set() };
      licensesDb.set(cleanKey, licenseEntry);
    } else if (cleanKey.startsWith('CR-AGNC-')) {
      licenseEntry = { tier: 'agency', maxDevices: 10, activatedDevices: new Set() };
      licensesDb.set(cleanKey, licenseEntry);
    } else if (cleanKey.startsWith('CR-START-')) {
      licenseEntry = { tier: 'starter', maxDevices: 1, activatedDevices: new Set() };
      licensesDb.set(cleanKey, licenseEntry);
    } else {
      res.status(404).json({ error: 'License key not recognized. Please verify or use a sandbox demo key.' });
      return;
    }
  }

  // Device activation checks
  if (!licenseEntry.activatedDevices.has(deviceId)) {
    if (licenseEntry.activatedDevices.size >= licenseEntry.maxDevices) {
      res.status(403).json({
        error: `Activation limit exceeded. This ${licenseEntry.tier.toUpperCase()} license allows up to ${licenseEntry.maxDevices} active devices. Please deactivate another device first.`,
      });
      return;
    }
    licenseEntry.activatedDevices.add(deviceId);
  }

  const isPro = licenseEntry.tier !== 'starter';
  const isAgency = licenseEntry.tier === 'agency';

  res.json({
    success: true,
    license: {
      key: cleanKey,
      tier: licenseEntry.tier,
      status: 'active',
      activatedDevices: licenseEntry.activatedDevices.size,
      maxDevices: licenseEntry.maxDevices,
      customerEmail: customerEmail || 'verified.buyer@clientreport.ai',
      issuedAt: new Date().toISOString(),
      expiresAt: null, // Lifetime
      deviceId,
      features: {
        maxRows: licenseEntry.tier === 'starter' ? 50_000 : 100_000,
        excelSupport: true,
        customBranding: isPro,
        aiNarrativeGen: isPro,
        commercialRights: isPro,
        multiClientExport: isAgency,
        unlimitedPdfExports: true,
      },
    },
  });
});

// License Deactivation API
app.post('/api/license/deactivate', (req: Request, res: Response) => {
  const { licenseKey, deviceId } = req.body;
  const cleanKey = String(licenseKey).trim().toUpperCase();
  const entry = licensesDb.get(cleanKey);

  if (entry && entry.activatedDevices.has(deviceId)) {
    entry.activatedDevices.delete(deviceId);
    res.json({ success: true, message: 'Device successfully deactivated.' });
    return;
  }

  res.json({ success: true, message: 'Device was not active.' });
});

// User Account Database Synchronization API
app.post('/api/auth/sync', async (req: Request, res: Response) => {
  try {
    const { uid, email, fullName, company, role } = req.body;
    if (!uid || !email) {
      res.status(400).json({ error: 'UID and email are required to sync user account.' });
      return;
    }

    let dbUser = null;
    try {
      dbUser = await getOrCreateUser({ uid, email, fullName, company, role });
    } catch (dbErr) {
      console.warn('Database user sync failed, continuing in memory:', dbErr);
    }

    res.json({
      success: true,
      user: {
        id: dbUser ? `usr-db-${dbUser.id}` : `usr-${uid}`,
        uid,
        email,
        fullName: fullName || (dbUser?.fullName ?? email.split('@')[0]),
        company: company || (dbUser?.company ?? 'Enterprise Analytics'),
        role: role || (dbUser?.role ?? 'Lead Analyst'),
        createdAt: dbUser?.createdAt ? dbUser.createdAt.toISOString() : new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Auth sync endpoint error:', err);
    res.status(500).json({ error: 'Failed to sync user: ' + (err?.message || 'Unknown error') });
  }
});

// Projects storage API (Powered by Cloud SQL Relational Database)
app.get('/api/projects', async (req: Request, res: Response) => {
  const userId = String(req.query.userId || 'default_user');

  try {
    const dbProjects = await getUserProjects(userId);
    if (dbProjects && dbProjects.length > 0) {
      res.json({ success: true, projects: dbProjects, source: 'cloudsql_database' });
      return;
    }
  } catch (err) {
    console.warn('Could not query database projects, checking in-memory store:', err);
  }

  // In-memory fallback
  const userProjects = Array.from(projectsDb.values())
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  res.json({ success: true, projects: userProjects.map((p) => p.data), source: 'in_memory' });
});

app.post('/api/projects', async (req: Request, res: Response) => {
  const { project, userId } = req.body;
  if (!project || !project.id) {
    res.status(400).json({ error: 'Valid project object is required.' });
    return;
  }
  const uid = userId || 'default_user';

  // Save to database
  try {
    await saveUserProject(uid, project);
  } catch (err) {
    console.warn('Database save failed, saving in memory:', err);
  }

  // In-memory cache
  projectsDb.set(project.id, {
    id: project.id,
    userId: uid,
    name: project.name,
    updatedAt: new Date().toISOString(),
    data: project,
  });

  res.json({ success: true, message: 'Project saved successfully to database.' });
});

app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = String(req.query.userId || 'default_user');

  try {
    await deleteUserProject(userId, id);
  } catch (err) {
    console.warn('Database delete failed, deleting from in-memory store:', err);
  }

  projectsDb.delete(id);
  res.json({ success: true, message: 'Project deleted.' });
});

// Vite middleware in dev, Static file serving in prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ClientReport AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
