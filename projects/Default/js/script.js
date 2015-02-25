(function ( $ ) {

    function App() {
        // Your options goes here
        this.foo = false;

        // Kickstart your methods
        this.nav();
    }

    App.prototype.nav = function () {
        // Here you have access to this.foo, go crazy
    };

    $( document ).ready( function () {
        new App();
    } );

})( jQuery );
