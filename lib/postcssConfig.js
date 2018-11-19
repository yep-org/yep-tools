const autoprefixer = require('autoprefixer');

module.exports = {
  plugins:[
    autoprefixer({
      browsers: [
        'last 2 versions',
        'Firefox ESR',
        '> 1%',
        'ie >= 9',//PC端项目
        'iOS >= 7',
        'Android >= 4.1', //移动端项目
      ],
    }),
  ]
};
