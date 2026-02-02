/**
 * IP Extraction Middleware for Node.js/Express
 * V2 Logic: Environment-aware (dev/prod)
 */

/**
 * Extract real client IP from request
 * @param {Object} req - Express request object
 * @returns {string} Real client IP
 */
function getClientIP(req) {
    const environment = process.env.NODE_ENV || 'development';

    // PRODUCTION: Cloudflare environment
    if (environment === 'production') {
        const cfIP = req.headers['cf-connecting-ip'];
        if (cfIP) {
            return cfIP;
        }
        console.warn('[PROD] CF-Connecting-IP missing, falling back to XFF');
    }

    // DEVELOPMENT: ALB-only environment
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        // X-Forwarded-For format: "client-ip, proxy1, proxy2"
        // First IP is the real client
        return xForwardedFor.split(',')[0].trim();
    }

    // FALLBACK: Direct connection (local development)
    return req.ip || req.connection.remoteAddress || '0.0.0.0';
}

/**
 * Middleware to extract and log client IP
 */
function clientIPMiddleware(req, res, next) {
    // Extract real client IP
    const clientIP = getClientIP(req);

    // Store in request object for easy access
    req.clientIP = clientIP;

    // Log to pod logs (CloudWatch in AWS)
    if (!req.path.startsWith('/health')) {
        console.log(`${req.method} ${req.path} | IP: ${clientIP}`);
    }

    // Add to response headers for debugging
    res.setHeader('X-Client-IP', clientIP);

    next();
}

module.exports = {
    getClientIP,
    clientIPMiddleware
};
