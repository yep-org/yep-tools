const autoprefixer = require('autoprefixer');

module.exports = {
  plugins:[
    autoprefixer({
      browserslist: [
        'iOS >= 7',
        'Android >= 4.1', //移动端项目
      ],
    }),
  ]
};
