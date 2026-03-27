/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk', 'pptxgenjs', 'docx'],
  },
};

export default nextConfig;
