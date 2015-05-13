nginx-utils
=========================

A cli, running on node that performs nginx-related stuff.

These scripts are meant to answer custom needs and should not be used as-is.

```
  Usage: nginx-utils [options] [command]

  Commands:

    conf-file:get [options] [entry-name]      reads conf file entry and displays value
    conf-file:set [options]                   sets a config file entry
    conf-file:unset <entry-name>              unsets a config file entry
    site-conf:generate [options] <site-name>  generates a nginx site config file

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -c, --config-file  set config file path (default: /Users/fatk/.nginx-utils/config.json)
```
