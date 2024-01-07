const { createProxyMiddleware } = require('http-proxy-middleware');
//websocket 사용 
//개발환경에 필요한.
module.exports = function(app){
  app.use(
      createProxyMiddleware('/api', {
          target: 'http://localhost:3002', 
          changeOrigin: true
      })
  )
};