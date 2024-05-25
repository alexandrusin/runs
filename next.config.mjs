/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/awesome',
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;