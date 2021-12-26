const { override, fixBabelImports, addLessLoader } = require('customize-cra');
const path = require('path');
const resolve = dir => path.join(__dirname, dir);

module.exports = override(
  fixBabelImports('import', {
    libraryName: '@mui',
    libraryDirectory: 'es',
    style: 'css',
  }),
  //Configure path alias
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true
    }
  }),
  //Close the production environment to generate a map file
  config => {
    if (process.env.NODE_ENV === 'production') {
      config.devtool = false;
    }
    return config;
  },
);