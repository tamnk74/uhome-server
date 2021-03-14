module.exports = {
  apps: [
    {
      name: 'uhome',
      script: 'dist/index.js',
      watch: '.',
    },
  ],

  deploy: {
    develop: {
      user: 'root',
      host: '112.78.4.141',
      ref: 'origin/develop',
      repo: 'git@github.com:build2successteam/u-home-server.git',
      path: '/root/u-home-server',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
