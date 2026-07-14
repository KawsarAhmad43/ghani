COD Order System (Meta Ads + React + Node + CAPI) — SHORT BRIEF
🎯 Goal
Build a COD system for sorisha oil where:
Meta Ads brings traffic
Orders are stored in backend
Only confirmed orders are sent to Meta as Purchase via CAPI
Fake orders are filtered manually
🧠 FLOW
Meta Ad → React Landing Page → Order Form →  Backend (Pending Order) → Admin Call → Confirmed → Send Purchase (CAPI)
🟢 FRONTEND (React)
Pages:
Single Landing Page
Events (Meta Pixel):
PageView → page load
InitiateCheckout → click order button
Lead → form submit
❌ DO NOT send Purchase from frontend
🟡 BACKEND (Node.js)
POST /order
Generate a UUID → save as event_id in DB
Save order in DB
status = "Pending"
store fbclid + UTM
DB Column: event_id VARCHAR UNIQUE NOT NULL
⚠️ Validation: UUID generation fail হলে order save করবে না — error return করবে
🟠 ORDER STATUS
Pending → Confirmed → Rejected → Shipped
🔵 ADMIN PANEL
View Pending Orders
Button: Confirm / Reject
IMPORTANT:
When "Confirm" clicked:
Check করো order status already "Confirmed" কিনা — যদি হয়, CAPI পাঠাবে না, return করবে
Update status = Confirmed
Immediately trigger Meta CAPI Purchase event
Use stored event_id from DB in CAPI payload
🔴 META CAPI RULE
ONLY send Purchase event when:
order status == Confirmed
Payload:
order_id
event_id ← (stored UUID from DB, for deduplication)
value
currency = BDT
hashed phone/email ← SHA256, lowercase, no spaces, country code ছাড়া
fbclid (if available)
⚠️ RULES
No Purchase event on form submit
No auto-confirm system
1 order = 1 Purchase event only
Same event_id must never be sent to CAPI twice
Already Confirmed order-এ আবার Confirm click করলে CAPI fire হবে না
CAPI পাঠানোর পর Meta Test Events Tool দিয়ে verify করতে হবে
🚨 KNOWN RISKS & SOLUTIONS
Risk → Solution
Double Confirm click → double Purchase — Backend check: status already Confirmed হলে CAPI block
event_id null হয়ে CAPI blank যাওয়া — UUID generate না হলে order save হবে না
fbclid 7 দিন পর expire — Order যত দ্রুত সম্ভব confirm করতে হবে
Phone hashing ভুল format — SHA256, lowercase, no spaces, no country code
Silent CAPI failure — Meta Test Events Tool দিয়ে go-live এর আগে verify করো
🎯 RESULT
Clean Meta tracking
Reduced fake COD orders
Better ad optimization
Zero duplicate Purchase events (Meta auto-deduplication via event_id)
Production-ready risk coverage