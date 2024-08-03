/** @type {import('next').NextConfig} */

const nextConfig = {
    async redirects() {
        return [
            {
                source: "/",
                destination: "/flows",
                permanent: true
            }
        ]
    }
};

export default nextConfig;
