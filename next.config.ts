import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product media can come from Vercel Blob or any HTTPS URL an admin pastes.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // RestoPulse Tablet (offline PWA): the barcode scanner may use the tablet camera
        source: "/restopulse-tablet/:path*",
        headers: [{ key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" }],
      },
    ];
  },
  async rewrites() {
    return [{ source: "/restopulse-tablet", destination: "/restopulse-tablet/index.html" }];
  },
};

export default nextConfig;
