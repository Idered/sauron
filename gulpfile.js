var fs           = require( 'fs-extra' ),
    gulp         = require( 'gulp' ),
    watch        = require( 'gulp-watch' ),
    sass         = require( 'gulp-sass' ),
    util         = require( 'gulp-util' ),
    concat       = require( 'gulp-concat' ),
    uglify       = require( 'gulp-uglify' ),
    autoprefixer = require( 'gulp-autoprefixer' ),
    minifycss    = require( 'gulp-minify-css' ),
    rename       = require( 'gulp-rename' ),
    connect      = require( 'gulp-connect'),
    install      = require( "gulp-install" );

var project = util.env.project ? util.env.project : null;

var paths = setupPaths( project );

gulp.task( 'new', function () {
    var projectName = util.env.name;
    var projectDir = './projects/' + projectName;

    if ( projectName ) {

        // Check if project exists
        if ( fs.existsSync( projectDir ) ) {
            console.log( util.colors.red( projectName + ' project already exists in your project directory.' ) );

            process.exit( 1 );
        }

        // Copy default project files into new project
        fs.copy( './projects/default', projectDir, function ( err ) {
            if ( err ) return console.error( err );

            console.log( '  ' + util.colors.cyan( projectName + ' project was created. Installing dependencies...' ) );

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
            '\n   ' + util.colors.red( 'gulp new --name NAME' ) + ' - ' + util.colors.cyan( 'Create new project.' )
        );

        process.exit( 1 );
    }

    // No project was found with given name
    if ( ! fs.existsSync( paths.project ) ) {
        console.log(
            '  ' + util.colors.red( project + ' project was not found.' ),
            '\n  To create new project run \'' + util.colors.cyan( 'gulp new --name NAME' ) + '\''
        );

        process.exit( 1 );
    }
} );

gulp.task( 'styles', function () {
    return gulp.src( paths.styles + '/**/*.scss' )
        .pipe( sass( {
            style: 'expanded',
            onError: function (error) {
                util.log(util.colors.red('Error: ' + error.message));
                util.log('File: ' + util.colors.red(error.file + ':'  + error.line));
                util.beep();
            }
        } ) )
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

gulp.task( 'reload', function () {
    gulp.src(paths.dist + '/**/*.*')
        .pipe(connect.reload())
} );

gulp.task('server', function () {
    connect.server({
        root: [ paths.dist ],
        port: 1234,
        livereload: true
    });
});

gulp.task( 'watch', function () {
    gulp.watch( paths.scripts + '/**/*.js', [ 'scripts' ] );
    gulp.watch( paths.styles + '/**/*.*', [ 'styles' ] );
    gulp.watch( paths.config, [ 'vendor' ] );

    gulp.watch([ paths.dist + '**/*.*'], ['reload']);
} );

gulp.task( 'build', [ 'check', 'styles', 'scripts', 'vendor' ] );
gulp.task( 'default', [ 'build', 'watch', 'server' ] );

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
