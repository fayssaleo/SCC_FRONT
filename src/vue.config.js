module.exports = {
    devServer: {
      proxy: {
        '/consommateurs': {
          target: 'http://10.20.33.112:9017',
          changeOrigin: true,
          pathRewrite: { '^/consommateurs': '' },
        },
      },
    },
  };
  