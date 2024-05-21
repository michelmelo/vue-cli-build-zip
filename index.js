'use strict';
const fs = require('fs');
const path = require('path')
// const config = require('../config')
const archiver = require('archiver');
function zip(_path, _fileName) {
  // create a file to stream archive data to.
  const output = fs.createWriteStream(path.resolve(_path, '../${_fileName}.zip'));
  console.log(path.resolve(_path, '../${_fileName}.zip'));

  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // listen for all archive data to be written
  // 'close' event is fired only when a file descriptor is involved
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  // This event is fired when the data source is drained no matter what was the data source.
  // It is not part of this library but rather from the NodeJS Stream API.
  // @see: https://nodejs.org/api/stream.html#stream_event_end
  output.on('end', function () {
    console.log('Data has been drained');
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      // log warning
    } else {
      // throw error
      throw err;
    }
  });

  // good practice to catch this error explicitly
  archive.on('error', function (err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);

  // append files from a sub-directory, putting its contents at the root of archive
  archive.directory(_path, false);

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
  archive.finalize();
}
function fixZero(s){
  return ('00'+s).substr(s.length)
}
module.exports = api => {

  api.registerCommand('zip:build',{
    description: 'Run zip command to archive files from dist folder to dist.zip',
    usage: 'vue-cli-service zip:build',
    details:'https://github.com/greenwheat/vue-cli-plugin-build-zip'
  }, () => {
    const distPath = api.resolve('./extension');
    zip(distPath, 'extension');
  })
  api.registerCommand('zip:build:date',{
    description: 'Run zip command to archive files from dist folder to {publicPath}-{date}.zip',
    usage: 'vue-cli-service zip:build:date',
    details:'https://github.com/greenwheat/vue-cli-plugin-build-zip'
  }, () => {
    let d = new Date();
    let publishPath = options.baseUrl.replace(/(^[\/\\])|([\/\\]$)/g, '').replace('/', '-') || 'dist'
    let zipFileName = publishPath + d.getFullYear() + fixZero(d.getMonth()+1) + fixZero(d.getDate()) + fixZero(d.getHours()) + fixZero(d.getMinutes()) + fixZero(d.getSeconds());
    const distPath = api.resolve('./dist');
    zip(distPath, zipFileName);
  })
}

module.exports.defaultModes = {
  'zip:build': 'production',
  'zip:build:date': 'production',
}
