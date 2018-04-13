// Modules dependencies
var
  gulp = require('gulp'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync'),
  bs = browserSync.create('My server'),
  nodemon = require('gulp-nodemon'),
  cssnano = require('gulp-cssnano'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  config = require('./config/config-dev'),
  path = require('path'),
  gutil = require('gulp-util'),
	pug = require('gulp-pug2'),
	ejs = require('gulp-ejs')

/**
 * 路径配置
 */
var 
  basedir = './',
  publicdir = './public',
  filepath = {
    'css': path.join(publicdir, 'css/**/*.css'),
    'scss': path.join(basedir, 'sass/**/*.scss'),
    'js': path.join(publicdir, 'js/**/*.js'),
    'view': path.join(basedir,'views/**/*.pug')
  }

var
  STATIC_PATH = './generate/',
	PUG_PATH = './views_pug/',
	EJS_PATH = './views_ejs/'

/**
 * 页面静态化配置
 */
var configPages = require('./config/config-pages')
var ENGINE_LIST = configPages.slice(0)

var USEMIN_HTML_LIST = []
configPages.forEach(function (item) {
  USEMIN_HTML_LIST.push(item.page + '.html')
})

/**
 * HTML模板编译任务
 */
var staticTasks = []
var engine = require('./config/config-dev').engine

console.log('your html engine language is ' + engine + '.')

if (engine === 'pug') { // PUG模板
	ENGINE_LIST.forEach(function (tpl) {
		var task = 'static-' + tpl.page + '.pug'
		staticTasks.push(task)
	
		gulp.task(task, function () {
	
			// pug模板路径
			var fileName = PUG_PATH + tpl.page + '.pug'
	
			// 文件相对路径
			var dir = path.dirname(tpl.page)
		
			// 编译
			gulp.src(fileName)
				.pipe(pug(tpl.data).on('error', gutil.log))
				// .pipe(pug({
				//   pretty: true
				//   // tpl.datanpm i gulp-pug2
				// }).on('error', gutil.log))
				.pipe(rename({
					extname: '.html'
				}))
				.pipe(gulp.dest(STATIC_PATH + dir))
		})
	})
} else if (engine === 'ejs') { // EJS模板
	ENGINE_LIST.forEach(function (tpl) {
		var task = 'static-' + tpl.page + '.ejs'
			staticTasks.push(task)
			gulp.task(task, function() {
				// ejs 模板路径
				var fileName = EJS_PATH + tpl.page + '.ejs'

				// 文件相对路径
				var dir = path.dirname(tpl.page)

				// 编译ejs
				gulp.src(fileName)
					.pipe(ejs(tpl.data).on('error', gutil.log))
					.pipe(rename({
						extname: '.html'
					}))
					.pipe(gulp.dest(STATIC_PATH + dir))
			})
	})
}

gulp.task('static', staticTasks, function () {
  console.info('Static html finished.'.green)
})

/**
 * 编译 scss
 */
gulp.task('css', function () {
	return gulp.src(path.join(basedir,'sass/main.scss'))
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.join(publicdir,'css')))
		.pipe(bs.stream())
})

/** 
 * dev server
 * 启动 express 并添加 browserSync 支持 
 */
gulp.task('dev:server', function () {
	nodemon({
		script: 'server.js',
		ignore: ['.vscode', '.idea', 'node_modules'],
		env: {
			'NODE_ENV': 'development'
		}
	})
	bs.init(null, {
		proxy: 'http://localhost:' + config.port,
		files: [filepath.js, filepath.view],
		notify: false,
		open: true,
		port: 5000
	})
})


/**
 * 联调服务
 */
gulp.task('api:server', function () {
	nodemon({
		script: 'server.js',
		ignore: ['.vscode', '.idea', 'node_modules'],
		env: {
			'NODE_ENV': 'api',
			'REMOTE_API': config.remoteApi
		}
	})
	bs.init(null, {
		proxy: 'http://localhost:' + config.port,
		files: [filepath.js, filepath.view],
		notify: false,
		open: false,
		port: 5000
	})
})

/**
 * 产品阶段css压缩
 */
gulp.task('cssmin', function () {
	return gulp.src(path.join(publicdir,'css/main.css'))
		.pipe(cssnano())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(path.join(publicdir,'css')))
})

/**
 * 产品阶段js压缩
 */
gulp.task('jsmin', function () {
	return gulp.src(filepath.js)
		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(path.join(publicdir,'js')))
})

gulp.task('build', ['cssmin', 'jsmin'])

/**
 * 监听
 */
gulp.task('watch', function () {
	gulp.watch(filepath.scss, ['css'])
})

gulp.task('dev', ['dev:server', 'css', 'watch'])
gulp.task('api', ['api:server', 'css', 'watch'])

