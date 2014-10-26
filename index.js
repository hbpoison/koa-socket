/**
 * Koa-socket
 * ---
 *
 * © 2014 Matt Styles @personalurban
 */

var http = require( 'http' ),
    socketIO = require( 'socket.io' ),
    Namespace = require( './lib/namespace' );


/**
 * Middleware list
 */
var _middleware = [];


/**
 * Socket.io connection handler.
 */
var io = null;


/**
 * Store initialed namespaces
 */
var nps = [];


/**
 * Expose object to manage attaching listeners to connections
 */
var koaSocket = module.exports = {};


/**
 * Takes a koa instance (or any object that implements an http handler) and attaches socket.io to it
 *
 * @param koa {Koa || http handler} koa instance or object that implements handler as callback function
 */
koaSocket.start = function( koa ) {
    if ( koa.server || koa.io ) {
        console.error( 'Sockets failed to initialise\nInstance may already exist' );
        return;
    }

    koa.server = http.createServer( koa.callback() );
    io = koa.io = socketIO( koa.server );
    return new Namespace(io, _middleware);
};


/**
 * Add a function to the stack of middleware
 *
 * @param fn {function}
 */
koaSocket.use = function( fn ) {
    _middleware.push( fn );
    return koaSocket;
};


/**
 * Initializes and retrieves the given Namespace by its pathname
 *
 * @param path {String}
 */
koaSocket.of = function( path ) {
    if ( !socket ) {
        console.error( 'Connection not exists!' );
        return;
    }

    return new Namespace(io, _middleware, path);
}

