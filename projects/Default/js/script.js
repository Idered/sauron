(function ( $ ) {

    function Theme() {
        // Your options goes here
        this.foo = false;

        // Kickstart your methods
        this.nav();
    }

    Theme.prototype.nav = function () {
        // Here you have access to this.foo
    };

    $( document ).ready( function () {
        new Theme();
    } );

})( jQuery );
