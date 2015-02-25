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
    install      = require( "gulp-install" ),
    replace      = require( 'gulp-replace' );

var theme = util.env.theme ? util.env.theme : null;

var paths = {
    base: './themes/' + theme + '/',
    styles: 'themes/' + theme + '/sass',
    scripts: 'themes/' + theme + '/js',
    dist: 'themes/' + theme + '/dist/',
    bower: './themes/' + theme + '/bower.json'
};

gulp.task( 'new', function () {
    var name = util.env.name;
    var dir = './themes/' + name;

    if ( name ) {
        // Check if theme exists
        if ( fs.existsSync( dir ) ) {
            console.log( util.colors.red( name + ' theme already exists in your themes directory.' ) );

            process.exit( 1 );
        }

        // Copy default theme files into new theme
        fs.copy( './themes/default', dir, function ( err ) {
            if ( err ) return console.error( err );

            console.log( '  ' + util.colors.cyan( name + ' theme was created. Installing dependencies...' ) );

            var bower = dir + '/bower.json';
            var config = require( bower );

            // Install bower dependencies
            gulp.src( [ bower ] ).pipe( install() );

            // Update theme info
            gulp.src( [ dir + '/dist/index.html', dir + '/sass/style.scss' ] )
                .pipe( replace( '{NAME}', name ) )
                .pipe( replace( '{AUTHOR}', config.author ) )
                .pipe( replace( '{VERSION}', config.version ) )
                .pipe( gulp.dest( function ( file ) {
                    return file.base;
                } ) );

            config.name = name + ' theme';
        } );
    } else {
        console.log( '  ' + util.colors.red( '--name NAME' ) + ' flag is required' );
    }
} );

gulp.task( 'check', function () {
    // No theme name was passed, show info about options
    if ( ! theme ) {
        console.log(
            '   Usage:',
            '\n   ' + util.colors.red( 'gulp --theme NAME' ) + ' - ' + util.colors.cyan( 'Compile and watch resources, run live reload.' ),
            '\n   ' + util.colors.red( 'gulp add --name NAME' ) + ' - ' + util.colors.cyan( 'Create new theme.' )
        );

        process.exit( 1 );
    }

    // No theme was found with given name
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
    var files = require( paths.bower ).vendor;

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

gulp.task( 'build', [ 'check', 'styles', 'scripts', 'vendor' ] );
gulp.task( 'default', [ 'build', 'watch', 'livereload' ] );

