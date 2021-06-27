const { src, dest, series, parallel, watch } = require('gulp')
const del  = require('del')
const loadPlugins = require('gulp-load-plugins')

const browserSync = require('browser-sync')

const plugins = loadPlugins() // 自动加载所有插件
// const sass = require('gulp-sass')(require('sass'))
// const plugins.babel = require('gulp-babel')
// const plugins.swig = require('gulp-swig')
// const plugins.imagemin = require('gulp-imagemin')

const bs = browserSync.create() // 创建一个开发服务器

const data = {
  pkg: {
    name: 'long'
  },
  date: new Date()
}
// 清除文件
const clean = () => {
  return del(['dist', 'temp'])
}

// 样式文件转换任务
const style = () => {
  return src('src/assets/styles/*.scss', { base: 'src' })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest('temp'))
}


const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
}

const page = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data }))
    .pipe(dest('temp'))
}

const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

const extra = () => {
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'))
}

const serve = () => {
  // 必须执行的文件
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/script/*.js', script)
  watch('src/*.html', page)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**',
  ], bs.reload) //监听文件的变化 不需要编译的文件
  bs.init({
    notify: false,
    port: 30002,
    open: true,
    // files: ['dist/**'],
    server: {
      baseDir: ['temp', 'src', 'public'], // 依次查找
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

// 处理依赖的文件
const useref = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
    // 压缩文件 html css js
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest('dist'))
}

const compile = parallel(style, script, page)

//上线之前执行的任务
const build = series(
  clean,
  parallel(
    series(compile, useref),
    image,
    font,
    extra
  )
)

const develop = series(compile, serve)

module.exports = {
  clean,
  build,
  develop,
}