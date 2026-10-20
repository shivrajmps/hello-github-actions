// Checks every number shown in the order-book scene.
const BIDS = [[99.0, 500], [98.5, 1200], [98.0, 800], [97.5, 2000]], ASKS = [[100.0, 400], [100.5, 900], [101.0, 1500], [101.5, 700]], Q = 100;
const ok = (c, m) => { if (!c) { console.error("FAIL", m); process.exit(1); } console.log("ok ", m); };
ok(Math.max(...BIDS.map(b => b[0])) === BIDS[0][0], "best bid is the highest bid ($99.00)");
ok(Math.min(...ASKS.map(a => a[0])) === ASKS[0][0], "best ask is the lowest ask ($100.00)");
ok(ASKS[0][0] - BIDS[0][0] === 1, "spread = 100.00 - 99.00 = $1.00");
ok(Q <= ASKS[0][1], "market buy of 100 fully fills at the best ask, no walk up the book");
ok(ASKS[0][1] - Q === 300, "best ask size after fill = 400 - 100 = 300");
ok(BIDS[0][1] === 500, "limit buy @ $99 queues behind 500 shares (price-time priority)");
