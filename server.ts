import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, fetchUserData, syncUserData } from "./src/db/queries.ts";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization function for GoogleGenAI
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key in the Secrets panel (Settings > Secrets).");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API endpoint to generate listing descriptions & social media updates
app.post("/api/write-listing", async (req, res) => {
  const { beds, baths, sqft, price, features, address, style, customNotes, tone, audience } = req.body;

  try {
    const client = getGeminiClient();
    
    const prompt = `You are an elite real estate copywriter and digital marketer. Generate a comprehensive, high-converting real estate content marketing pack based on these details:
    Address/Location: ${address || "Unspecified Location"}
    Beds: ${beds}
    Baths: ${baths}
    Square Feet: ${sqft} sqft
    Price: $${price}
    Property Style/Type: ${style || "Home"}
    Key Features: ${features && features.length > 0 ? features.join(", ") : "None specified"}
    Target Audience Segment: ${audience || "General Buyers"}
    Desired Copywriting Tone/Style: ${tone || "Professional & Welcoming"}
    Additional Notes/Instructions: ${customNotes || "None"}

    You must generate five distinct content pieces as specified in the output schema:
    1. MLS Listing Description (mls): Write a catchy, attention-grabbing headline at the top, followed by 2-3 engaging, well-structured paragraphs highlighting the layout, character, and top features. Keep the tone professional, welcoming, and high-end.
    2. TikTok Video Script & Caption (tiktok): Create a short, high-energy video script concept. Include an attention-grabbing opening Hook text, visual scene directions, voiceover/audio cues, and a social caption section with 4-6 trending real estate hashtags (e.g. #DreamHome, #HouseTour, #RealEstate).
    3. Facebook Feed Post (facebook): A warm, community-oriented feed update. Include relevant emojis, structured bullet points of top features, an invitation to a private tour or open house, and an engaging conversational question at the end to boost comments and reach.
    4. Instagram Post & Reel Guide (instagram): A highly aesthetic, lifestyle-focused caption. Include creative suggestions for photo slides or Reels scenes (e.g., "Slide 1: Sunset curb appeal", "Slide 2: Chef's kitchen details"), elegant emojis, and a highly polished tag cloud of 6-8 target real estate and design hashtags.
    5. Google Business Post (google): A professional, highly localized updates post. Keep it concise (under 1500 characters), optimized for local search keywords, highlighting primary benefits, and ending with a clear Call to Action (e.g. "Call to schedule a tour!").`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mls: { 
              type: Type.STRING, 
              description: "The complete, formatted real estate MLS description with headline and paragraphs." 
            },
            tiktok: { 
              type: Type.STRING, 
              description: "TikTok video script draft with voiceover, visual cues, hook, and caption + hashtags." 
            },
            facebook: { 
              type: Type.STRING, 
              description: "Facebook update containing emojis, feature bullets, and engagement question." 
            },
            instagram: { 
              type: Type.STRING, 
              description: "Instagram aesthetic caption with photo/reel visual suggestions and styled hashtags." 
            },
            google: { 
              type: Type.STRING, 
              description: "Concise Google Business update with localized keywords and a strong call-to-action." 
            }
          },
          required: ["mls", "tiktok", "facebook", "instagram", "google"]
        }
      }
    });

    const rawText = response.text || "{}";
    const data = JSON.parse(rawText.trim());
    
    res.json({ 
      success: true, 
      listing: data.mls || "No text generated.",
      pack: {
        mls: data.mls || "",
        tiktok: data.tiktok || "",
        facebook: data.facebook || "",
        instagram: data.instagram || "",
        google: data.google || ""
      }
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "An error occurred while generating the listing." 
    });
  }
});

// Secure endpoint to create or sync a Google Spreadsheet
app.post("/api/sheets/sync", async (req, res) => {
  const { accessToken, spreadsheetId, properties, deals, clients, financialHistory } = req.body;

  if (!accessToken) {
    return res.status(400).json({ success: false, error: "Access token is required." });
  }

  try {
    let targetSpreadsheetId = spreadsheetId;
    let spreadsheetUrl = "";

    if (targetSpreadsheetId) {
      // 1. Sync with an existing spreadsheet
      // Check if it exists and fetch sheet titles
      const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!metaResponse.ok) {
        const errText = await metaResponse.text();
        console.error("Fetch spreadsheet meta error:", errText);
        return res.status(400).json({ 
          success: false, 
          error: "Spreadsheet not found, or access is unauthorized. Please check your sheet link or ID." 
        });
      }

      const metadata = await metaResponse.json();
      spreadsheetUrl = metadata.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${targetSpreadsheetId}`;
      const existingTitles = metadata.sheets?.map((s: any) => s.properties?.title) || [];

      // Ensure our 4 required sheets exist
      const requiredTitles = ["Properties", "Deals & Pipeline", "Clients", "Financials"];
      const missingTitles = requiredTitles.filter(title => !existingTitles.includes(title));

      if (missingTitles.length > 0) {
        const addRequests = missingTitles.map(title => ({
          addSheet: {
            properties: { title }
          }
        }));

        const addResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}:batchUpdate`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ requests: addRequests })
        });

        if (!addResponse.ok) {
          const addErrText = await addResponse.text();
          console.error("Add sheets error:", addErrText);
          return res.status(500).json({ 
            success: false, 
            error: "Failed to initialize missing sheets in your spreadsheet." 
          });
        }
      }
    } else {
      // 2. Create a new spreadsheet
      const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          properties: {
            title: "ApexEstate Real Estate Live Tracker"
          },
          sheets: [
            { properties: { title: "Properties" } },
            { properties: { title: "Deals & Pipeline" } },
            { properties: { title: "Clients" } },
            { properties: { title: "Financials" } }
          ]
        })
      });

      if (!createResponse.ok) {
        const createErrText = await createResponse.text();
        console.error("Create spreadsheet error:", createErrText);
        return res.status(500).json({ 
          success: false, 
          error: "Failed to create a new spreadsheet in your Google Drive." 
        });
      }

      const sheetData = await createResponse.json();
      targetSpreadsheetId = sheetData.spreadsheetId;
      spreadsheetUrl = sheetData.spreadsheetUrl;
    }

    // 3. Clear old contents in target tabs to prevent ghost/hanging rows
    const clearResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values:batchClear`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ranges: ["Properties!A1:Z1000", "'Deals & Pipeline'!A1:Z1000", "Clients!A1:Z1000", "Financials!A1:Z1000"]
      })
    });

    if (!clearResponse.ok) {
      const clearErr = await clearResponse.text();
      console.warn("Clear sheets warning (non-blocking if sheets were just created):", clearErr);
    }

    // 4. Batch update values for all sheets
    const valueData = [
      {
        range: "Properties!A1",
        values: [
          ["Property ID", "Address", "City", "State", "Price ($)", "Beds", "Baths", "Square Feet", "Type", "Status", "Monthly Rent ($)", "Monthly NOI ($)", "Purchase Price ($)", "Cap Rate (%)", "Equity Gain ($)"],
          ...properties.map((p: any) => [
            p.id, p.address, p.city, p.state, p.price, p.beds, p.baths, p.sqft, p.type, p.status,
            p.monthlyRent || 0, p.monthlyNOI || 0, p.purchasePrice || 0, p.capRate || 0, p.equityGain || 0
          ])
        ]
      },
      {
        range: "'Deals & Pipeline'!A1",
        values: [
          ["Deal ID", "Client Name", "Property Address", "Stage", "Price ($)", "Commission Rate (%)", "Projected Commission ($)", "Date", "Type"],
          ...deals.map((d: any) => [
            d.id, d.clientName, d.propertyAddress, d.stage, d.price, (d.commissionRate * 100), d.projectedCommission, d.date, d.type
          ])
        ]
      },
      {
        range: "Clients!A1",
        values: [
          ["Client ID", "Full Name", "Role", "Email", "Phone", "Budget ($)", "Notes"],
          ...clients.map((c: any) => [
            c.id, c.name, c.role, c.email, c.phone, c.budget, c.notes
          ])
        ]
      },
      {
        range: "Financials!A1",
        values: [
          ["Month", "Commission Earned ($)", "Projected Income ($)", "Rental Income ($)", "Net Operating Income ($)"],
          ...financialHistory.map((f: any) => [
            f.month, f.commissionEarned, f.projectedIncome, f.rentalIncome, f.noi
          ])
        ]
      }
    ];

    const updateResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${targetSpreadsheetId}/values:batchUpdate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: valueData
      })
    });

    if (!updateResponse.ok) {
      const updateErrText = await updateResponse.text();
      console.error("Batch update values error:", updateErrText);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to write real estate records into the spreadsheet tabs." 
      });
    }

    res.json({
      success: true,
      spreadsheetId: targetSpreadsheetId,
      spreadsheetUrl
    });

  } catch (error: any) {
    console.error("Google Sheets Sync Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "An unexpected error occurred during Google Sheets synchronization." 
    });
  }
});

// Fetch user data from Cloud SQL
app.get("/api/db/fetch", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || "";
    const dbUser = await getOrCreateUser(uid, email);
    const userData = await fetchUserData(dbUser.id);
    res.json({ success: true, ...userData });
  } catch (error: any) {
    console.error("Database fetch error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync client data to Cloud SQL
app.post("/api/db/sync", requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user!.uid;
    const email = req.user!.email || "";
    const { properties, deals, clients, financialHistory } = req.body;

    const dbUser = await getOrCreateUser(uid, email);
    await syncUserData(dbUser.id, { properties, deals, clients, financialHistory });

    res.json({ success: true });
  } catch (error: any) {
    console.error("Database sync error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server and mount Vite

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
