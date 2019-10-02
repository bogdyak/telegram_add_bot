const replace = require('replace-in-file');
const options = {
    files: [
        './node_modules/scrypt/*',
        './node_modules/@aloborio/blockchain/node_modules/scrypt/*'
    ],
    from: './build/Release/scrypt',
    to: 'scrypt',
};
replace(options)
  .then(results => {
    console.log('Replacement results:', results);
  })
  .catch(error => {
    console.error('Error occurred:', error);
  });