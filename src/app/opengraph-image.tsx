import { ImageResponse } from "next/og";

export const alt = "PowerPulse: One Ecosystem. Unlimited Possibilities.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "radial-gradient(circle at 75% 40%, #1d3fa8 0%, #050816 55%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 40, fontWeight: 700 }}>
          <svg width="64" height="64" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="9" fill="#0B1226" stroke="#00D4FF" strokeWidth="1.5" /><path d="M5 17h5l2.5-6 4 11 3-8 1.8 3H27" fill="none" stroke="#00D4FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          PowerPulse
        </div>
        <div style={{ fontSize: 78, fontWeight: 700, marginTop: 40, lineHeight: 1.05, letterSpacing: -2 }}>One Ecosystem.</div>
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: "#00D4FF" }}>Unlimited Possibilities.</div>
        <div style={{ fontSize: 30, marginTop: 30, color: "#AAB5CC" }}>Powering Businesses Through Intelligent Software.</div>
      </div>
    ),
    size,
  );
}
