
 var Socket = require( './socket' );


/**
 * Namespace constructor.
 * Called when a connection init.
 *
 * @param io {socket.io connection handler}
 * @param middleware {Array} list of middleware to pass event data through
 * @param path {string} namespace path
 */
var Namespace = module.exports = function( io, middleware, path ) {

    /**
     * Listeners ready to attach to a socket instance
     */
    var _listeners = [];

    /**
     * List of id's of active connections
     */
    var _connections = [];

    /**
     * Middleware list
     */
    var _middleware = middleware;

    /**
     * Connection callback.
     * Expects to pass the socket to the callback.
     */
    var onConnect = null;

    /**
     * Discount callback.
     * Expects to pass the socket to the callback.
     */
    var onDisconnect = null;

    this.io = io;

    if (!!path) {
        this.io = io.of(path);
    }

    this.io.on( 'connection', function( socket ) {
        console.log( 'Socket connected', socket.id );

        socket.on( 'disconnect', function() {
            console.log( 'Socket disconnected', this.id );
            if ( onDisconnect ) {
                onDisconnect( this );
            }
            removeConnection( this.id );
        });
        
        if ( onConnect ) {
            onConnect( socket );
        }
        attach( socket );
    });

    /**
    * @get numConnections
    */
    Object.defineProperty( this, 'numConnections', {
        get: function() {
            return _connections.length;
        }
    });

    /**
     * Adds a new connection to the list
     *
     * @param socket {Socket instance}
     * @private
     */
    function addConnection( socket ) {
        _connections.push({
            id: socket.id,
            socket: socket
        });
    };

    /**
     * Removes a connection from the list
     */
    function removeConnection( id ) {
        var i = _connections.length - 1;
        while( i > 0 ) {
            if ( _connections[ i ].id === id ) {
                break;
            }
            i--;
        }

        _connections.splice( i, 1 );
    };

    /**
     * Binds listeners to the socket connection
     *
     * @param socket - socket.io socket connection
     */
    function attach( socket ) {
        var sock = new Socket( socket, _listeners, _middleware );
        addConnection( socket );
        return sock;
    };
};

/**
 * Getter for the list of connected sockets
 *
 * @returns {array}
 */
Namespace.prototype.getConnections = function() {
    return _connections;
};


/**
 * Stores a listener, ready to attach.
 *
 * @param event {String} name of event
 * @param handler {Function} the callback to fire on event
 */
Namespace.prototype.on = function( event, handler ) {
    if ( event === 'connection' ) {
        this.onConnect = handler;
        return;
    }

    if ( event === 'disconnect' ) {
        this.onDisconnect = handler;
        return;
    }

    _listeners.push({
        event: event,
        handler: handler
    });
};
