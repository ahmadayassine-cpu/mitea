import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Menu photography lives in Airtable attachments. The URLs Airtable
        // hands out expire after roughly two hours, which is fine because the
        // catalog cache is five minutes — but it does mean next/image has to
        // be told the host is allowed. Wildcarded because the subdomain is
        // versioned (v5 today) and has been bumped before.
        protocol: "https",
        hostname: "**.airtableusercontent.com",
      },
    ],
  },
};

export default nextConfig;
