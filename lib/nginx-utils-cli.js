var fs = require('fs'),
    path = require('path'),
    untildify = require('untildify'),
    program = require('commander'),
    chalk = require('chalk');

var _data = {
  pkgFile: {
    path: path.resolve(__dirname, '../package.json'),
    content: undefined,
    obj: undefined
  },

  confFile: {
    path: path.resolve(untildify('~/'), '.nginx-utils/config.json'),
    content: undefined,
    obj: undefined
  },

  commands: {
    dir: path.resolve(__dirname, './commands/'),
    list: []
  },

  output: {
    normal: chalk.reset,
    error: chalk.bold.red,
    info: chalk.cyan,
    warning: chalk.yellow,
    success: chalk.green
  }
};

var nginxUtilsCLI = {

  init: function() {
    nginxUtilsCLI._loadPackage(_data.pkgFile, true);
    nginxUtilsCLI._loadPackage(_data.confFile, false);
    nginxUtilsCLI._setupProgram();
  },

  getVersion: function() {
    return _data.pkgFile.obj.version;
  },

  getName: function() {
    return _data.pkgFile.obj.name;
  },

  getDescription: function() {
    return _data.pkgFile.obj.description;
  },

  _loadPackage: function(pkgFileObj, throwError) {
    if (typeof pkgFileObj.obj !== 'object') {

      if (fs.existsSync(pkgFileObj.path) === false) {
        if (throwError) {
          throw new Error(pkgFileObj.path + ' file not found: ' + pkgFileObj.path);
        } else {
          return;
        }
      }

      pkgFileObj.content = fs.readFileSync(pkgFileObj.path, { encoding: 'utf8' });

      if (typeof pkgFileObj.content !== 'string') {
        throw new Error(pkgFileObj.path + ' file content has unexpected type: ' + typeof pkgFileObj.content);
      }
      try {
        pkgFileObj.obj = JSON.parse(pkgFileObj.content);
      } catch (err) {
        pkgFileObj.obj = {};
        if (throwError) {
          throw new Error(pkgFileObj.path + ' does not contain valid JSON');
        } else {
          return;
        }
      }
    }

    return pkgFileObj.obj;
  },

  _setupProgram: function() {
    nginxUtilsCLI._registerOptions();
    nginxUtilsCLI._registerCommands();

    try {
      program.parse(process.argv);
    } catch (e) {
      console.log(_data.output.error(e));
    }
  },

  _registerOptions: function() {
    program
      .version(nginxUtilsCLI.getVersion())
      .option('-c, --config-file', 'set config file path (default: ' + _data.confFile.path + ')');
  },

  _registerCommands: function() {
    if (fs.existsSync(_data.pkgFile.path) === false) {
      throw new Error('commands dir not found: ' + _data.commands.dir);
    }

    _data.commands.list = fs.readdirSync(_data.commands.dir);

    if (typeof _data.commands.list !== 'object') {
      throw new Error('commands list has unexpected type: ' + typeof _data.commands.list);
    }

    _data.commands.list.forEach(nginxUtilsCLI._loadCommands);
  },

  _loadCommands: function(file) {
    require (_data.commands.dir + '/' + file)(program, _data);
  }
};

module.exports = nginxUtilsCLI.init;
