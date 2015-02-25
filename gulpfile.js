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

var project = util.env.project ? util.env.project : null;

var paths = setupPaths( project );

gulp.task( 'new', function () {
    var projectName = util.env.name;
    var projectDir = './project/' + name;

    if ( projectName ) {

        // Check if project exists
        if ( fs.existsSync( dir ) ) {
            console.log( util.colors.red( name + ' project already exists in your project directory.' ) );

            process.exit( 1 );
        }

        // Copy default project files into new project
        fs.copy( './project/Default', projectDir, function ( err ) {
            if ( err ) return console.error( err );

            console.log( '  ' + util.colors.cyan( name + ' project was created. Installing dependencies...' ) );

            // Install bower dependencies
            gulp.src( [ projectDir + '/bower.json' ] ).pipe( install() );
        } );
    } else {
        console.log( '  ' + util.colors.red( '--name NAME' ) + ' flag is required' );
    }
} );

gulp.task( 'check', function () {
    // No project name was passed, show info about options
    if ( ! project ) {
        console.log(
            '   Usage:',
            '\n   ' + util.colors.red( 'gulp --project NAME' ) + ' - ' + util.colors.cyan( 'Compile and watch resources, run live reload.' ),
            '\n   ' + util.colors.red( 'gulp add --name NAME' ) + ' - ' + util.colors.cyan( 'Create new project.' )
        );

        process.exit( 1 );
    }

    // No project was found with given name
    if ( ! fs.existsSync( paths.project ) ) {
        console.log(
            '  ' + util.colors.red( project + ' project was not found.' ),
            '\n  To create new project run \'' + util.colors.cyan( 'gulp add --new NAME' ) + '\''
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
        files[ index ] = paths.project + file;
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

/**
 * ============================================================================
 */

function setupPaths( name ) {
    var base = './projects/' + name + '/';

    return {
        project: base,
        styles: base + '/sass',
        scripts: base + '/js',
        dist: base + '/dist/',
        config: base + '/bower.json'
    };
}