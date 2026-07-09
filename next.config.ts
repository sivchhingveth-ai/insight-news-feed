import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "static01.nyt.com" },
      { protocol: "https", hostname: "ichef.bbci.co.uk" },
      { protocol: "https", hostname: "nav.files.bbci.co.uk" },
      { protocol: "https", hostname: "images.mktw.net" },
      { protocol: "https", hostname: "image.cnbcfm.com" },
    ],
  },
};

export default nextConfig;
