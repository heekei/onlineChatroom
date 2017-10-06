var gulp = require('gulp');
var minify = require('gulp-minify');
var csscomb = require('gulp-csscomb');
var cleancss = require('gulp-clean-css');
var concatcss = require('gulp-concat-css');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');

gulp.task('html', function () {
    return gulp.src('./*.html')
        .pipe(gulp.dest('./dist/'))
        .pipe(livereload());
})
gulp.task('js', function () {
    return gulp.src('./js/**/*.*')
        .pipe(gulp.dest('./dist/js/'))
        .pipe(livereload());
})
gulp.task('css', function () {
    return gulp.src('./css/*.css')
        // .pipe(concatcss("bundle.css"))
        .pipe(autoprefixer())
        .pipe(csscomb())
        .pipe(cleancss({
            "keepBreaks": true,
            "compatibility": 'ie7'
        }))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(livereload());
})
gulp.task('images', function () {
    return gulp.src('./images/*')
        .pipe(cache(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true, //类型：Boolean 默认：false 多次优化svg直到完全优化
            svgoPlugins: [{ removeViewBox: false }],//不要移除svg的viewbox属性
            use: [pngquant()] //使用pngquant深度压缩png图片的imagemin插件
        })))
        .pipe(gulp.dest('./dist/images/'))
        .pipe(livereload());
})

// 注册任务
gulp.task('webserver', function () {
    gulp.src('.') // 服务器目录（.代表根目录）
        .pipe(webserver({ // 运行gulp-webserver
            livereload: true, // 启用LiveReload
            open: false // 服务器启动时自动打开网页
            , port: 8000
        }));
});

gulp.task('watch', function () {
    gulp.watch('./css/*.css', ['css'])
    gulp.watch('./images/*', ['images'])
    gulp.watch('./js/*', ['js'])
    gulp.watch('./*.html', ['html'])
    livereload.listen();
})
gulp.task('default', ['webserver', 'html', 'js', 'css', 'images', 'watch'])