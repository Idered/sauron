var fs           = require( 'fs-extra' ),
    gulp         = require( 'gulp' ),
    watch        = require( 'gulp-watch' ),
    sass         = require( 'gulp-sass' ),
    util         = require( 'gulp-util' ),
    concat       = require( 'gulp-concat' ),
    uglify       = require( 'gulp-uglify' ),
    autoprefixer = require( 'gulp-autoprefixer' ),
    minifycss    = require( 'gulp-minify-css' ),
    livereload   = require( 'gulp-livereload' ),
    rename       = require( 'gulp-rename' ),
    install      = require( "gulp-install" );

var theme = util.env.theme ? util.env.theme : 'default';

var paths = {
    base: './themes/' + theme + '/',
    styles: 'themes/' + theme + '/sass',
    scripts: 'themes/' + theme + '/js',
    dist: 'themes/' + theme + '/dist/',
    config: './themes/' + theme + '/config.json'
};

gulp.task( 'add', function () {
    var name = util.env.name;
    var dir = './themes/' + name;

    if ( name ) {
        fs.copy( './themes/default', dir, function ( err ) {
            if ( err ) return console.error( err );

            console.log(
                '  ' + util.colors.cyan( name + ' theme was created. Installing dependencies...' )
            );

            gulp.src( [ dir + '/bower.json' ] ).pipe( install() );
        } );
    } else {
        console.log(
            '  ' + util.colors.red( '--name NAME' ) + ' flag is required'
        );
    }
} );

gulp.task( 'check', function () {
    if ( theme == 'default' ) {
        console.log(
            '   Usage:',
            '\n   ' + util.colors.red( 'gulp --theme NAME' ) + ' - ' + util.colors.cyan('Compile and watch resources, run live reload.'),
            '\n   ' + util.colors.red( 'gulp add --name NAME' ) + ' - ' + util.colors.cyan('Create new theme.')
        );

        process.exit( 1 );
    }

    if ( ! fs.existsSync( paths.base ) ) {
        console.log(
            '  ' + util.colors.red( theme + ' theme was not found.' ),
            '\n  To create new theme run \'' + util.colors.cyan( 'gulp add --new NAME' ) + '\''
        );

        process.exit( 1 );
    }
} );

gulp.task( 'styles', function () {
    return gulp.src( paths.styles + '/**/*.scss' )
        .pipe( sass( { style: 'expanded' } ) )
        .pipe( autoprefixer( 'last 2 version', 'safari 5', 'ie 9', 'opera 12.1' ) )
        .pipe( rename( { suffix: '.min' } ) )
        .pipe( minifycss() )
        .pipe( gulp.dest( paths.dist ) );
} );

gulp.task( 'vendor', function () {
    var files = require( paths.config ).vendor;

    files.forEach( function ( file, index ) {
        files[ index ] = paths.base + file;
    } );

    return gulp.src( files )
        .pipe( concat( 'vendor.js' ) )
        .pipe( uglify() )
        .pipe( rename( { extname: '.min.js' } ) )
        .pipe( gulp.dest( paths.dist ) );
} );

gulp.task( 'scripts', function () {
    return gulp.src( paths.scripts + '/**/*.js' )
        .pipe( uglify() )
        .pipe( rename( { extname: '.min.js' } ) )
        .pipe( gulp.dest( paths.dist ) );
} );

gulp.task( 'livereload', function () {
    livereload.listen();

    gulp.watch( paths.dist + '/**/*.*' ).on( 'change', livereload.changed );
} );

gulp.task( 'watch', function () {
    gulp.watch( paths.scripts + '/**/*.js', [ 'scripts' ] );
    gulp.watch( paths.styles + '/**/*.*', [ 'styles' ] );
    gulp.watch( paths.vendorFile, [ 'vendor' ] );
} );

gulp.task( 'default', [ 'check', 'styles', 'scripts', 'vendor', 'watch', 'livereload' ] );