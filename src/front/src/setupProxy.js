const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/atel/',
        createProxyMiddleware({
            target: 'https://www.astronomerstelegram.org',
            changeOrigin: true,
            pathRewrite: {
                '^/atel/': '/'
            }
        })
    );
    app.use(
        '/gcn/',
        createProxyMiddleware({
            target: 'https://gcn.nasa.gov/circulars',
            changeOrigin: true,
            pathRewrite: {
                '^/gcn/': '/'
            }
        })
    );
};
