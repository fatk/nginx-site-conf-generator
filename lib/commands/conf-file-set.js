var fs = require('fs'),
    path = require('path'),
    util = require('util');

var _data = {
  programOptions: [
    'subdomain',
    'rootDir',
    'logDir',
    'outputDir',
    'templateFile'
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
        .option('--template-file <template-file>', 'set a site config file template')
        .option('--output-dir <output-dir>', 'set the output directory for generated files')
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
      if (typeof options[programOption] !== 'undefined') {
        if (typeof _data._parent.confFile.obj === 'undefined') {
          _data._parent.confFile.obj = {};
        }
        console.log(_data._parent.output.info('Setting entry %j => %j'), programOption, options[programOption]);
        _data._parent.confFile.obj[programOption] = options[programOption];
      }
    });
  },

  _saveConfFile: function() {
    data = JSON.stringify(_data._parent.confFile.obj, null, 2);
    fs.writeFileSync(_data._parent.confFile.path, data);
    console.log(_data._parent.output.success('Config file saved.'));
  }
};

module.exports = confFileSet.init;
