export const ACADEMY_BUG_BOUNTY = [
  {
    id: 'recon-mastery', 
    name: 'Recon Mastery: The Hunter Methodology', 
    path: '/recon', 
    tier: 'Pro', 
    color: 'from-brand-500 to-red-500',
    overview: 'Recon is not a "scan" — it is a psychological battle against the target infrastructure. Professionals do not look for bugs; they look for mistakes in logic, architecture, and deployment. This guide teaches you how to use the CyberMindSpace Recon Engine to map an entire organization, find forgotten assets, and identify "The Weakest Link" before you ever send a single payload. If you master recon, the exploitation becomes easy.',
    sections: [
      {
        t: '🧠 The Hunter Mindset — Hunting vs. Scanning',
        c: 'The #1 mistake beginners make is running a tool, seeing "0 bugs", and giving up. Professionals know that tools find data, but humans find bugs.\n\n🔥 Vertical vs. Horizontal Recon\n• Horizontal: Finding new domains owned by the same company (ASNs, Acquisitions, WHOIS).\n• Vertical: Going deep into a single domain (Subdomains, Endpoints, Hidden Paths).\n\n👉 Pro Tip: Most bounties live in the vertical depth. The further you get from the "www" main page, the higher the chance of finding an unpatched legacy server.\n\n🔥 The "Forgotten Server" Theory\nEvery large company has a server that was spun up by an intern 3 years ago and forgotten. It has no WAF, no monitoring, and old code. Your goal in Recon is to find that server.'
      },
      {
        t: '⚡ Using the Recon Engine — Tactical Workflow',
        c: 'Our Recon Engine is designed to automate the boring parts so you can focus on the bugs. Here is the professional workflow:\n\n🔍 Phase 1 — Target Acquisition\nDrop the main domain into the engine. Start with "Standard" mode to map the surface. Look for the "Subdomain Count" and "Tech Stack" density.\n\n🔍 Phase 2 — Asset Triage\nFilter the subdomains. Ignore the "cdn.*" or "static.*" assets. Focus on:\n• dev.*, staging.*, uat.* (Development leaks)\n• api.*, graphql.* (Data exposure)\n• admin.*, internal.*, portal.* (Auth bypasses)\n\n🔍 Phase 3 — Pivot Probing\nUse the **[⚡ PIVOT]** button on any interesting subdomain. This launches a dedicated research mission into that specific asset. This is where you find the "instants" like exposed .git or .env files.'
      },
      {
        t: '🚨 Analyzing the Signals — Low vs. High Noise',
        c: 'Recon produces a lot of data. You must learn to ignore the noise and focus on the "Signal."\n\n🚨 High Signal (Investigate Immediately):\n• Different Tech Stack: If the main site is React but a subdomain is old PHP, that is a 90% chance of a bug.\n• Missing Security Headers: Lack of CSP or HSTS often points to a "Quick Win" misconfiguration.\n• IP Mismatch: If a subdomain points to a different IP range than the main site, it might be hosted on a legacy network with no firewall.\n\n🚨 Low Noise (Triage Later):\n• Standard 404 pages.\n• Common JS libraries (jQuery, etc.) that are patched.\n• Publicly documented API endpoints.'
      },
      {
        t: '📊 Risk Scoring — Turning Numbers into Bounties',
        c: 'Our Risk Score is not a grade; it is a "Likelihood of Payout."\n\n📊 Score > 70 (Critical Opportunity)\nThe infrastructure is fragmented. Many different technologies are being used. This usually means the security team is overwhelmed and missing things.\n\n📊 Score 40-70 (Standard Hunting)\nGood for IDORs and Logic flaws. The infrastructure is solid, so you need to test the application logic itself.\n\n📊 Score < 40 (Hard Target)\nHigh-security program (e.g. Google/Facebook). You will need complex Exploit Chains to get a payout here.'
      }
    ],
    tip: 'Never trust a 403 Forbidden. Professionals see a 403 as an invitation. It means there is content there, but you are not allowed to see it. Use the Recon Engine to find "Alternative Paths" like /api/v2/admin instead of /admin. Often, developers block the main path but forget to block the API equivalent.'
  },
  {
    id: 'exploitation-logic',
    name: 'Exploitation: From Signal to Proof',
    path: '/recon',
    tier: 'Pro',
    color: 'from-emerald-500 to-brand-500',
    overview: 'Exploitation is not about running a "hack" script. It is about proving impact. Bug bounty programs do not pay for "vulnerabilities" — they pay for "Risk." This guide shows you how to take the raw signals from the Recon Engine and turn them into a "Verified Finding" that gets a P1/P2 payout.',
    sections: [
      {
        t: '🧠 Defining Impact — The Key to $1,000+ Bounties',
        c: 'A bug with no impact is worth $0. A bug with impact is worth $5,000.\n\n❌ Low Impact: "I found a missing header." (P5 - N/A)\n✅ High Impact: "I can use the missing header to bypass CSP and steal user session tokens." (P2 - $1,500)\n\n👉 Focus on **Exploitability**. Our engine flags findings as "Verified" only if they show live proof of impact. Use this evidence in your report to force a higher payout.'
      },
      {
        t: '⚡ XSS & Reflection — The Modern Methodology',
        c: 'XSS is not dead; it just evolved. The Recon Engine automatically tests for "Reflection Patterns."\n\n🔍 The Workflow:\n1. Identify reflected parameters in the "Endpoints" tab.\n2. Look for "Verified Reflection" tags in our results.\n3. Test for "Context" (Is it inside a script tag? Is it an attribute?).\n\n⚠️ Caution: Do not use `alert(1)`. Use `print()` or a custom callback to a Burp Collaborator. It looks more professional and proves you can execute arbitrary code.'
      },
      {
        t: '🚨 Auth Anomalies & Session Security',
        c: 'Broken Authentication is the #1 way to get a "Critical" (P1) bounty. Look for:\n• Session Fixation: Does the cookie change after login?\n• JWT Misconfigs: Is the signature being verified? (Use our JWT Analyzer tool).\n• OAuth Over-privilege: Can you ask for "scope=*" and get admin access?\n\n👉 Our engine flags "Auth Anomaly Detected" when it sees inconsistent status codes during probing. This is your signal to start manual fuzzing.'
      },
      {
        t: '🧠 Building Exploit Chains — The Pro Strategy',
        c: 'A single bug is a "finding." Two bugs together are a "chain."\n\n🔥 Example Chain:\n1. OSINT finds an exposed .env file (Info Leak).\n2. .env file contains a SendGrid API key.\n3. You use the key to spoof emails from the company (Account Takeover).\n\n👉 The Recon Engine automatically detects "Potential Exploit Chains." Always check the Analysis tab for these strategic vectors.'
      }
    ],
    tip: 'Documentation is your secret weapon. When you find a bug, record a clean video PoC. Use our "One-Click Report" feature to generate a professional markdown report. Triagers are human — if your report is easy to read and the impact is clear, they will triage it faster and potentially award a higher bounty.'
  },
  {
    id: 'career-starter',
    name: 'Bug Bounty Career: The Beginner Roadmap',
    path: '/dashboard',
    tier: 'Free',
    color: 'from-orange-500 to-yellow-500',
    overview: 'Starting a career in bug bounties is overwhelming. Where do you start? HackerOne? Bugcrowd? VDPs? This guide gives you the "Zero to Hero" roadmap to earning your first $100 and eventually building a full-time income from security research.',
    sections: [
      {
        t: '1️⃣ Phase 1: The Learning Foundation',
        c: 'Do not touch a live target yet. You need to understand the web first.\n\n• Learn HTTP: Requests, Responses, Verbs, Headers.\n• Learn JS: How browsers handle data and DOM.\n• Complete the "Academy" guides in CyberMindSpace for every tool.\n\n👉 Goal: Be able to explain "What happens when I type google.com?" in detail.'
      },
      {
        t: '2️⃣ Phase 2: The First Bounty (VDPs)',
        c: 'Do not go for Google or Facebook yet. They are too hard for beginners.\n\n• Join a VDP (Vulnerability Disclosure Program) that offers "Points" or "Hall of Fame" but no money.\n• Why? Less competition. Higher chance of success. Great for your resume.\n• Look for: Government programs, Universities, and Large Non-profits.\n\n👉 Goal: Get your first "Triaged" report.'
      },
      {
        t: '3️⃣ Phase 3: Moving to Paid Programs',
        c: 'Once you have 5-10 triaged reports, move to paid programs.\n\n• Use the "Recon Engine" on CyberMindSpace to find "Wide Scope" programs.\n• Target: Domains with `*.target.com` scope. More assets = more chances for mistakes.\n• Stay consistent: Spend 2 hours every day on one single program for a week. Deep knowledge of one target is better than shallow knowledge of ten.'
      }
    ],
    tip: 'Consistency beats talent. Most hunters quit after their first 5 "Duplicates." The ones who make $100k+ are the ones who kept digging. Use our "Workspaces" to keep track of your targets and never scan the same thing twice. Efficiency is the difference between a hobby and a career.'
  }
];
