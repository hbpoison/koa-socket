
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
    this._listeners = [];

    /**
     * List of id's of active connections
     */
    this._connections = [];

    /**
     * Middleware list
     */
    this._middleware = middleware;

    /**
     * Connection callback.
     * Expects to pass the socket to the callback.
     */
    this.onConnect = null;

    /**
     * Discount callback.
     * Expects to pass the socket to the callback.
     */
    this.onDisconnect = null;

    this.io = io;

    if (!!namespace) {
        this.io = io.of(namespace);
    }

    this.init();
};


/**
 * Initialises the connection
 */
Namespace.prototype.init = function() {

    var self = this;

    this.nsp.on( 'connection', function( socket ) {
        console.log( 'Socket connected', socket.id );

        socket.on( 'disconnect', function() {
            console.log( 'Socket disconnected', this.id );
            if ( self.onDisconnect ) {
                self.onDisconnect( this );
            }
            self.removeConnection( this.id );
        });
        
        if ( self.onConnect ) {
            self.onConnect( socket );
        }
        self.attach( socket );
    });

    /**
    * @get numConnections
    */
    Object.defineProperty( this, 'numConnections', {
        get: function() {
            return this._connections.length;
        }
    });
};

/**
 * Getter for the list of connected sockets
 *
 * @returns {array}
 */
Namespace.prototype.getConnections = function() {
    return this._connections;
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

    this._listeners.push({
        event: event,
        handler: handler
    });
};


/**
 * Binds listeners to the socket connection
 *
 * @param socket - socket.io socket connection
 */
Namespace.prototype.attach = function( socket ) {
    var sock = new Socket( socket, this._listeners, this._middleware );
    this.addConnection( socket );
    return sock;
};

/**
 * Adds a new connection to the list
 *
 * @param socket {Socket instance}
 * @private
 */
Namespace.prototype.addConnection = function( socket ) {
    this._connections.push({
        id: socket.id,
        socket: socket
    });
};


/**
 * Removes a connection from the list
 */
Namespace.prototype.removeConnection = function( id ) {
    var i = this._connections.length - 1;
    while( i > 0 ) {
        if ( this._connections[ i ].id === id ) {
            break;
        }
        i--;
    }

    this._connections.splice( i, 1 );
};
