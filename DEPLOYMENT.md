# Mockzy - Free Deployment Guide

## 🚀 Complete Free Deployment Stack

| Component | Platform | Limits |
|-----------|----------|--------|
| Database | [Neon](https://neon.tech) | 0.5GB storage, always-on |
| Backend | [Render](https://render.com) | 750 hours/month, auto-sleep after 15min |
| Frontend | [Vercel](https://vercel.com) | 100GB bandwidth/month |

---

## 📋 Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/mockzy.git
git branch -M main
git push -u origin main
```

---

### Step 2: Set Up Free PostgreSQL Database (Neon)

1. Go to [neon.tech](https://neon.tech)
2. Click **"Sign Up"** (use GitHub for easy login)
3. Click **"Create Project"** → Name: `mockzy`
4. Copy the **connection string**:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/mockzy?sslmode=require
   ```
5. Save this - you'll need it in Step 3!

---

### Step 3: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up (use GitHub)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `mockzy-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | `superkey@2004jakkani` (make it random!) |
   | `FRONTEND_URL` | `https://mockzy.vercel.app` (update after Step 4) |
   | `NODE_ENV` | `production` |

6. Click **"Create Web Service"**
7. Wait for deployment (~5 minutes)
8. Copy your backend URL: `https://mockzy-backend.onrender.com`

---

### Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (use GitHub)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://mockzy-backend.onrender.com/api` |

6. Click **"Deploy"**
7. Your frontend will be live at: `https://your-project.vercel.app`

---

### Step 5: Update Backend CORS (Important!)

After getting your Vercel URL, go back to Render:
1. Go to your backend service
2. Click **"Environment"**
3. Update `FRONTEND_URL` to your actual Vercel URL
4. Render will auto-redeploy

---

## ✅ Final Checklist

- [ ] GitHub repo created and code pushed
- [ ] Neon database created
- [ ] Render backend deployed with env variables
- [ ] Vercel frontend deployed with `VITE_API_URL`
- [ ] Backend `FRONTEND_URL` updated with Vercel URL

---

## 🔧 Troubleshooting

### Backend shows "Service Unavailable"
- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider using [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes

### Database connection errors
- Ensure `?sslmode=require` is in your DATABASE_URL
- Check Neon dashboard for connection limits

### CORS errors
- Ensure `FRONTEND_URL` matches your exact Vercel URL (with https://)
- Don't include trailing slash

### Build fails on Vercel
- Make sure `frontend` is selected as root directory
- Check that all dependencies are in `package.json`

---

## 💡 Pro Tips for Free Tier

1. **Keep Backend Awake**: Use [cron-job.org](https://cron-job.org) (free) to ping your backend every 14 minutes

2. **Custom Domain**: Both Vercel and Render support free custom domains

3. **Database Backups**: Neon has automatic backups on free tier

4. **Scaling**: When you need to upgrade:
   - Render: $7/month for always-on
   - Neon: $19/month for more storage
   - Vercel: Pro plan $20/month

---

## 🎉 You're Done!

Your Mockzy app is now live at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://mockzy-backend.onrender.com`
- **Database**: Managed by Neon

Share your app link and enjoy! 🚀
