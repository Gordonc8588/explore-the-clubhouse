# Cloudflare Migration Status

**Date:** 2026-01-23
**Status:** Nameservers changed, waiting for DNS propagation

---

## ✅ What We've Completed

### 1. Cloudflare Account Setup
- Created Cloudflare account
- Added both domains to Cloudflare

### 2. DNS Configuration (Complete)

**exploretheclubhouse.co.uk:**
- ✅ A record: `exploretheclubhouse.co.uk` → `76.76.21.21` (Vercel)
- ✅ CNAME: `www` → `cname.vercel-dns.com`
- ✅ All 5 Gmail MX records configured
- ✅ Email TXT records preserved (SPF, DKIM, DMARC, Google verification)
- ✅ Resend email records preserved (for transactional emails)

**craigiesclubhouse.co.uk:**
- ✅ A record: `craigiesclubhouse.co.uk` → `76.76.21.21` (Vercel)
- ✅ CNAME: `www` → `cname.vercel-dns.com`
- ✅ All 5 Gmail MX records configured
- ✅ Email TXT records preserved (SPF, DKIM, DMARC)

### 3. Nameservers Changed at Krystal

**Both domains now use:**
- `gene.ns.cloudflare.com`
- `sean.ns.cloudflare.com`

**Status:** Waiting for DNS propagation (1-24 hours, usually 2-4 hours)

---

## 🔑 Important Information

### Cloudflare API Token
```
9r0YFekpdhehKUADhHFWPf9gTyq85M6Xd8Baso8q
```
**Note:** You can revoke this token after migration is complete in Cloudflare dashboard under My Profile → API Tokens

### Cloudflare Zone IDs
- exploretheclubhouse.co.uk: `4b6f766c7b28c33294b112d986e2bdfe`
- craigiesclubhouse.co.uk: `a11437aebf8ee7c88f931d52eaf04830`

---

## 📋 Next Steps (After DNS Propagation)

### Step 1: Verify Cloudflare is Active

**Check Cloudflare Dashboard:**
- Go to https://dash.cloudflare.com
- Both domains should show status: "Active"
- You'll receive confirmation emails from Cloudflare

**Or check DNS:**
```bash
dig NS exploretheclubhouse.co.uk
dig NS craigiesclubhouse.co.uk
```
Should return Cloudflare nameservers.

---

### Step 2: Set Up Redirect (craigiesclubhouse → exploretheclhouse)

**Option A: Cloudflare Page Rules (Recommended)**

1. In Cloudflare dashboard, select **craigiesclubhouse.co.uk**
2. Go to **Rules** → **Page Rules** (or **Redirect Rules** in newer UI)
3. Click **Create Page Rule**

**Rule 1:**
- URL pattern: `*craigiesclubhouse.co.uk/*`
- Setting: **Forwarding URL**
- Status Code: **301 - Permanent Redirect**
- Destination URL: `https://exploretheclubhouse.co.uk/$1`
- Click **Save and Deploy**

**Rule 2:**
- URL pattern: `*www.craigiesclubhouse.co.uk/*`
- Setting: **Forwarding URL**
- Status Code: **301 - Permanent Redirect**
- Destination URL: `https://exploretheclubhouse.co.uk/$1`
- Click **Save and Deploy**

**Option B: Vercel Redirect (Alternative)**

Add to your `next.config.js`:
```javascript
async redirects() {
  return [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'craigiesclubhouse.co.uk',
        },
      ],
      destination: 'https://exploretheclubhouse.co.uk/:path*',
      permanent: true,
    },
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.craigiesclubhouse.co.uk',
        },
      ],
      destination: 'https://exploretheclubhouse.co.uk/:path*',
      permanent: true,
    },
  ]
}
```

---

### Step 3: Configure Domains in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: **explore-the-clubhouse**
3. Go to **Settings** → **Domains**
4. Add these domains one by one:
   - `exploretheclubhouse.co.uk`
   - `www.exploretheclubhouse.co.uk`
   - `craigiesclubhouse.co.uk`
   - `www.craigiesclubhouse.co.uk`

**Note:** Vercel will automatically detect Cloudflare proxy and configure SSL. If you see any SSL errors, wait 10-15 minutes for propagation.

---

### Step 4: Test Everything

**Website Tests:**
```bash
# Should load your site
curl -I https://exploretheclubhouse.co.uk
curl -I https://www.exploretheclubhouse.co.uk

# Should redirect to exploretheclubhouse.co.uk
curl -I https://craigiesclubhouse.co.uk
curl -I https://www.craigiesclubhouse.co.uk
```

Or test in browser:
- ✓ https://exploretheclubhouse.co.uk
- ✓ https://www.exploretheclubhouse.co.uk
- ✓ https://craigiesclubhouse.co.uk (should redirect)
- ✓ https://www.craigiesclubhouse.co.uk (should redirect)

**Email Tests:**
1. Send test email **TO** nicole@exploretheclubhouse.co.uk
2. Check it arrives in Gmail
3. Reply **FROM** nicole@exploretheclubhouse.co.uk
4. Verify it sends successfully
5. Check email doesn't go to spam

**Booking System Test:**
- Make a test booking (use Stripe test mode if available)
- Verify confirmation emails arrive
- Check transactional emails work

---

## 🔧 Optional: Cloudflare Optimizations

Once everything is working, consider enabling:

**SSL/TLS Settings:**
- SSL/TLS mode: **Full (strict)** (SSL/TLS → Overview)
- Always Use HTTPS: **ON** (SSL/TLS → Edge Certificates)
- Automatic HTTPS Rewrites: **ON**

**Speed Settings:**
- Brotli: **ON** (Speed → Optimization)
- Early Hints: **ON**
- HTTP/3: **ON** (Network)

**Caching:**
- Browser Cache TTL: **4 hours** or **Respect Existing Headers** (Caching → Configuration)

**Security:**
- Security Level: **Medium** (Security → Settings)
- Challenge Passage: **30 minutes**

---

## 📧 Email Configuration Summary

Both domains have identical Gmail MX records:

**MX Records:**
1. `aspmx.l.google.com` (priority 1)
2. `alt1.aspmx.l.google.com` (priority 5)
3. `alt2.aspmx.l.google.com` (priority 5)
4. `alt3.aspmx.l.google.com` (priority 10)
5. `alt4.aspmx.l.google.com` (priority 10)

**SPF Records:**
- exploretheclubhouse.co.uk: `v=spf1 include:_spf.google.com include:amazonses.com ~all`
- craigiesclubhouse.co.uk: `v=spf1 include:_spf.google.com ~all`

**Both domains also have:**
- DKIM records (Google and Resend for exploretheclubhouse)
- DMARC records
- Google verification TXT records

---

## ⏰ Timeline

**Completed:**
- DNS records configured in Cloudflare ✓
- Nameservers changed at Krystal ✓

**In Progress:**
- DNS propagation (1-24 hours, check Cloudflare dashboard for status)

**To Do (After DNS Active):**
- Set up craigies → explore redirect
- Add domains to Vercel
- Test website and email
- Monitor for 7 days

**After 7 Days of Stable Operation:**
- Can safely cancel Krystal hosting (keep domain registration active)
- Revoke Cloudflare API token if not needed

---

## 🆘 Troubleshooting

### Website Not Loading
1. Check Cloudflare status is "Active"
2. Verify domains added to Vercel
3. Check DNS records in Cloudflare match configuration above
4. Clear browser cache / try incognito mode
5. Wait longer - DNS can take up to 24 hours

### Email Not Working
1. Check MX records in Cloudflare dashboard
2. Verify they match the 5 Gmail records listed above
3. Use Google Workspace MX record checker: https://toolbox.googleapps.com/apps/checkmx/
4. Check SPF/DKIM/DMARC records present

### SSL Certificate Issues
1. Wait 15 minutes after adding domain to Vercel
2. Check Cloudflare SSL/TLS mode is "Full (strict)"
3. Verify domain is proxied (orange cloud) in Cloudflare
4. Check Vercel SSL is "Provisioned" in domain settings

### Redirect Not Working
1. Verify Page Rules are active in Cloudflare
2. Check URL pattern includes `*` at start and end
3. Clear browser cache
4. Test with curl: `curl -I https://craigiesclubhouse.co.uk`

---

## 📞 Support Contacts

**Cloudflare:**
- Dashboard: https://dash.cloudflare.com
- Community: https://community.cloudflare.com
- Docs: https://developers.cloudflare.com

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: https://vercel.com/help

**Krystal:**
- Client Area: https://krystal.io/client/clientarea.php
- Support: https://krystal.io/support

---

## 📝 Notes

- This is a **live production business** - all changes affect real customers
- Krystal hosting can be cancelled after 7 days of stable operation
- Domain registration still with Krystal - needs annual renewal
- Can transfer domain registration to Cloudflare later if desired
- Keep this API token secure - it has edit access to DNS records
- Both domains point to Vercel - redirect handled by Cloudflare or Vercel config

---

## Current Status Check

**To check current status, run:**
```bash
# Check if nameservers have propagated
dig NS exploretheclubhouse.co.uk +short
dig NS craigiesclubhouse.co.uk +short

# Check if DNS records are resolving through Cloudflare
dig A exploretheclubhouse.co.uk +short
dig A craigiesclubhouse.co.uk +short

# Check MX records
dig MX exploretheclubhouse.co.uk +short
```

**Expected results after propagation:**
- NS queries should return `gene.ns.cloudflare.com` and `sean.ns.cloudflare.com`
- A queries should return `76.76.21.21`
- MX queries should return 5 Google mail servers

---

**Last Updated:** 2026-01-23
**Migration Status:** In Progress (Awaiting DNS Propagation)
