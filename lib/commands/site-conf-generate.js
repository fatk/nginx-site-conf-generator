var chalk = require('chalk');

var _data = {};

var siteConf = {
  init: function(program) {
    siteConf._registerCommand(program);
  },

  _registerCommand: function(program) {
    program
      .command('site-conf:generate <site-name>')
        .description('generates a nginx site config file')
        .option('--subdomain <subdomain>', 'specify a custom subdomain')
        .option('--root-dir <root-dir>', 'specify a custom root directory')
        .option('--log-dir <log-dir>', 'specify a custom error log directory')
        .action(siteConf._run);
  },

  _run: function(siteName, options) {
    console.log(chalk.magenta('site-conf:generate'));
  }
};

module.exports = siteConf.init;
