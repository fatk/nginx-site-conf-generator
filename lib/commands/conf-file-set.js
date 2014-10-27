var fs = require('fs'),
    path = require('path'),
    util = require('util');

var _data = {
  programOptions: [
    'subdomain',
    'rootDir',
    'logDir'
  ]
};

var confFileSet = {
  init: function(program, data) {
    _data._parent = data;
    confFileSet._registerCommand(program);
  },

  _registerCommand: function(program) {
    program
      .command('conf-file:set')
        .description('sets a config file entry')
        .option('--subdomain <subdomain>', 'set a custom subdomain')
        .option('--root-dir <root-dir>', 'set a custom root directory')
        .option('--log-dir <log-dir>', 'set a custom error log directory')
        .action(confFileSet._run);
  },

  _run: function(options) {
    confFileSet._checkConfFile();
    confFileSet._setOptions(options);
    confFileSet._saveConfFile();
  },

  _checkConfFile: function() {
    if (fs.existsSync(_data._parent.confFile.path) === false) {
      var filePath = _data._parent.confFile.path,
          fileName = path.basename(filePath),
          dirPath = path.dirname(filePath);

      if (fs.existsSync(dirPath) === false) {
        console.log(_data._parent.output.warning('Configuration directory does not exists. %j'), dirPath);

        if (fs.mkdirSync(dirPath) === false) {
          throw new Error('Unable to create config directory %j', dirPath);
        } else {
          console.log(_data._parent.output.info('Configuration directory created %j'), dirPath);
        }
      }

      console.log(_data._parent.output.warning('Configuration file does not exists. %j'), filePath);

      if (fs.writeFileSync(filePath, '') === false) {
        throw new Error('Unable to create config file %j', filePath);
      } else {
        console.log(_data._parent.output.info('Configuration file created %j'), filePath);
      }
    }
  },

  _setOptions: function(options) {
    _data.programOptions.forEach(function (programOption) {
      console.log(_data._parent.output.info('Saving option %j => %j'), programOption, options[programOption]);
      if (typeof options[programOption] !== 'undefined') {
        if (typeof _data._parent.confFile.obj === 'undefined') {
          _data._parent.confFile.obj = {};
        }
        _data._parent.confFile.obj[programOption] = options[programOption];
      }
    });
  },

  _saveConfFile: function() {
    var data = '';
    
    try {
      data = JSON.stringify(_data._parent.confFile.obj, null, 2);
    } catch (e) {
      throw new Error('Unable to stringify config file object\'s JSON');
    }

    fs.writeFileSync(_data._parent.confFile.path, data);

    console.log(_data._parent.output.success('Config file saved.'));
  }
};

module.exports = confFileSet.init;
