/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  env: {
    APP_URL:
      process.env.NODE_ENV == "production"
        ? process.env.APP_URL_PRODUCTION
        : process.env.APP_URL_DEVELOPMENT,
    NEXT_AUTH_SECRET: process.env.NEXTAUTH_URL,
  },
};

export default nextConfig;
