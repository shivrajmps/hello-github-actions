#!/usr/bin/env python3
"""Every rupee figure on screen comes from here. Inputs are the numbers Shiv says."""
import math
def emi(P, annual_pct, months):
    r = annual_pct / 1200; return P * r * (1 + r) ** months / ((1 + r) ** months - 1)
def months_for(P, annual_pct, pay):
    r = annual_pct / 1200; return -math.log(1 - P * r / pay) / math.log(1 + r)
P, N = 50_00_000, 360
for rate in (7.0, 7.5):
    e = emi(P, rate, N); print(f"rate {rate}%: EMI {e:,.0f}  total {e*N:,.0f}  interest {e*N-P:,.0f} ({(e*N-P)/1e5:.2f} L)")
eA, eB = emi(P, 7.0, N), emi(P, 7.5, N)
print(f"monthly gap {eB-eA:,.0f}; 30y gap {(eB-eA)*N:,.0f} ({(eB-eA)*N/1e5:.2f} L)")
for pay in (44_000, 40_000, 50_000):
    m = months_for(P, 7.5, pay); print(f"pay {pay:,}: {m:.0f} months = {m/12:.1f} y; interest {pay*m-P:,.0f} ({(pay*m-P)/1e5:.1f} L); saved vs 30y {(eB*N-P)-(pay*m-P):,.0f} ({((eB*N-P)-(pay*m-P))/1e5:.1f} L)")
# 30 lakh variant
for P2 in (30_00_000,):
    e = emi(P2, 7.5, N); print(f"30L @7.5%: EMI {e:,.0f}, interest {(e*N-P2)/1e5:.1f} L")
