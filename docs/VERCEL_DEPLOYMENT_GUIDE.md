# Deploying MonsterLink to Vercel & Testing Physical NFC

This guide describes how to deploy the web prototype to **Vercel** with full **HTTPS** and test physical NFC cards (MEZASTAR / NTAG213 / NTAG215) on your mobile device.

---

## 1. Prerequisites

1. An account on [Vercel](https://vercel.com).
2. An Android smartphone with NFC hardware enabled.
3. Google Chrome on Android (Web NFC API is enabled by default in Chrome on Android).
4. Compatible physical NFC cards or tags (ISO 14443 Type A, NTAG213, NTAG215, NTAG216, or official Pokémon MEZASTAR tags).

---

## 2. Deploy to Vercel

### Option A: Via GitHub (Recommended)
1. Push your repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<your-username>/pokemon-inspired-game.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New Project"**.
3. Import your repository.
4. Framework Preset will automatically detect **Next.js**.
5. (Optional) In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` (if using cloud persistence)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**.

### Option B: Via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run deployment:
   ```bash
   vercel
   ```
3. Follow prompts to deploy to production:
   ```bash
   vercel --prod
   ```

---

## 3. Web NFC Permission Header

Vercel deployment is pre-configured via `vercel.json` with the mandatory W3C Web NFC permission header:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Permissions-Policy",
          "value": "nfc=*"
        }
      ]
    }
  ]
}
```
This ensures your Android browser can access physical NFC hardware over the deployed HTTPS domain.

---

## 4. How to Test Physical NFC Cards on Android

1. Open your deployed Vercel URL (e.g., `https://your-app.vercel.app`) in **Google Chrome on Android**.
2. Tap the **"Scan NFC"** tab on the bottom navigation bar.
3. You will see:
   - A green button: **"Start Physical NFC Reading"**.
4. Tap **"Start Physical NFC Reading"**.
5. When prompted by Chrome: **"Allow your-app.vercel.app to use NFC?"**, tap **"Allow"**.
6. Hold your physical NFC card or Pokémon MEZASTAR tag against the back of your phone near the NFC antenna.
7. The reader will read the tag UID (e.g. `ML-MEZASTAR-001` or raw hex serial number) and register the creature into your collection!
8. Tap **"Collection"** to view your monster, or tap **"Battle"** to test turn-based combat!
