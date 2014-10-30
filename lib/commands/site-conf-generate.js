var fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars'),
    prompt = require('prompt');

var _data = {
  params: {},
  programOptions: [
    'tld',
    'subdomain',
    'rootDir',
    'logDir',
    'outputDir',
    'templateFile'
  ]
};

var siteConf = {
  init: function(program, data) {
    _data._parent = data;
    siteConf._registerCommand(program);
  },

  _registerCommand: function(program) {
    program
      .command('site-conf:generate <site-name>')
        .description('generates a nginx site config file')
        .option('--tld <tld>', 'specify a custom TLD')
        .option('--subdomain <subdomain>', 'specify a custom subdomain')
        .option('--root-dir <root-dir>', 'specify a custom root directory')
        .option('--log-dir <log-dir>', 'specify a custom error log directory')
        .option('--template-file <template-file>', 'set a site config file template')
        .option('--output-dir <output-dir>', 'set the output directory for generated files')
        .action(siteConf._run);
  },

  _run: function(siteName, options) {
    siteConf._loadOptions(options);
    siteConf._checkReqParams(siteName, options);
    siteConf._checkTemplateFile();
    siteConf._generateConfFile(siteName);
  },

  _loadOptions: function(options) {
    _data.params = typeof _data._parent.confFile.obj === 'object' ? _data._parent.confFile.obj : {};
    _data.programOptions.forEach(function (programOption) {
      if (typeof options[programOption] !== 'undefined') {
        _data.params[programOption] = options[programOption];
      }
    });
  },

  _checkReqParams: function(siteName, options) {
    if (typeof siteName !== 'string') {
      throw new Error('siteName parameter (string) is required ');
    }

    _data.programOptions.forEach(function (programOption) {
      if (typeof _data.params[programOption] === 'undefined') {
        throw new Error('Missing required option ' + programOption);
      }
    });
  },

  _checkTemplateFile: function() {
    if (fs.existsSync(_data.params.templateFile) === false) {
      throw new Error('TemplateFile is not an existing path');
    }
  },

  _generateConfFile: function(siteName) {
    var source = fs.readFileSync(_data.params.templateFile, { encoding: 'utf8' }),
        template = handlebars.compile(source),
        fileName = siteName + '.' + _data.params.subdomain + '.' + _data.params.tld + '.conf',
        filePath = path.resolve(_data.params.outputDir, fileName);

      _data.params.siteName = siteName;
      var contents = template(_data.params);

      if (fs.existsSync(filePath) !== false) {
        throw new Error('Target file already exists "' + filePath + '"');
      }

      console.log(_data._parent.output.info('The following content will be written to %j :'), filePath);
      console.log(contents);

      prompt.message = '';
      prompt.delimiter = '';

      var schema = {
            properties: {
              confirmation: {
                description: 'Shall we proceed? (y/n)',
                pattern: /^(y|n)+$/,
                message: 'y(es) or n(o)',
                required: true
              }
            }
          };

      prompt.start();
      prompt.get(schema, function (err, input) {
        if (err) {
          throw new Error(err);
        }

        if (input.confirmation !== 'y') {
          console.log(_data._parent.output.warning('No file written.'));
          return;
        }

        fs.writeFileSync(path.resolve(_data.params.outputDir, fileName), contents);
        console.log(_data._parent.output.success('Successfully wrote file.'));
      });
  }
};

module.exports = siteConf.init;
