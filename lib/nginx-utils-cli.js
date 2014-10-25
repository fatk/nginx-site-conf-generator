var fs = require('fs'),
    path = require('path'),
    program = require('commander');

var _data = {
  pkgFile: {
    path: path.resolve(__dirname, '../package.json'),
    content: undefined,
    obj: undefined
  },

  commands: {
    dir: path.resolve(__dirname, './commands/'),
    list: []
  }
};

var nginxUtilsCLI = {

  init: function() {
    nginxUtilsCLI._loadPackage();
    nginxUtilsCLI._setupProgram();
  },

  getVersion: function() {
    return _data.pkgFile.obj.version;
  },

  _loadPackage: function() {
    if (typeof _data.pkgFile.obj !== 'object') {

      if (fs.existsSync(_data.pkgFile.path) === false) {
        throw new Error('package.json file not found: ' + _data.pkgFile.path);
      }

      _data.pkgFile.content = fs.readFileSync(_data.pkgFile.path, { encoding: 'utf8' });

      if (typeof _data.pkgFile.content !== 'string') {
        throw new Error('package.json file content has unexpected type: ' + typeof _data.pkgFile.content);
      }

      _data.pkgFile.obj = JSON.parse(_data.pkgFile.content);
    }

    return _data.pkgFile.obj;
  },

  _setupProgram: function() {
    nginxUtilsCLI._registerOptions();
    nginxUtilsCLI._registerCommands();
    program.parse(process.argv);
  },

  _registerOptions: function() {
    program
      .version(nginxUtilsCLI.getVersion())
      .option('-c, --config-file', 'set custom config file path (defaults to ~/.nginx-utils.json)');
  },

  _registerCommands: function() {
    if (fs.existsSync(_data.pkgFile.path) === false) {
      throw new Error('commands dir not found: ' + _data.commands.dir);
    }

    _data.commands.list = fs.readdirSync(_data.commands.dir);

    if (typeof _data.commands.list !== 'object') {
      throw new Error('commands list has unexpected type: ' + typeof _data.commands.list);
    }

    _data.commands.list.forEach(nginxUtilsCLI._loadExternalCommand);
  },

  _loadExternalCommand: function(file) {
    require (_data.commands.dir + '/' + file)(program);
  },

  _loadInternalCommand: function() {
    console.log(process.argv);
  }
};


module.exports = function() {
  nginxUtilsCLI.init();
};
