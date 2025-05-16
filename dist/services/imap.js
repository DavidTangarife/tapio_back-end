"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_imap_connection = get_imap_connection;
var Imap = require('node-imap'), inspect = require('util').inspect;
// =============================================================
// Get the imap connection object with the users authentication
// =============================================================
function get_imap_connection(email, xoauth2) {
    let imap = new Imap({
        user: email,
        xoauth2: xoauth2,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'imap.gmail.com' }
    });
}
// ===================================================================
// This function is used to attach commands to the imap connection.
// If you pass this a callback, it will run when you do imap.connect()
// ===================================================================
function open_inbox(callback, imap) {
    imap.openBox('INBOX', true, callback);
}
// ===================================================================
// This is a sample of a callback to get the sender and subject of the
// most recent email.
// ===================================================================
function most_recent_sender_and_subject_callback(imap) {
    imap.once('ready', function () {
        open_inbox(function (err, box) {
            if (err)
                throw err;
            var f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM SUBJECT)', 'TEXT'] });
            f.on('message', function (msg, seqno) {
                console.log('Message #%d', seqno);
                var prefix = '(#' + seqno + ') ';
                msg.on('body', function (stream, info) {
                    if (info.which === 'TEXT')
                        console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
                    var buffer = '', count = 0;
                    stream.on('data', function (chunk) {
                        count += chunk.length;
                        buffer += chunk.toString('utf8');
                        if (info.which === 'TEXT')
                            console.log(prefix + 'Body [%s] (%d/%d)', inspect(info.which), count, info.size);
                    });
                    stream.once('end', function () {
                        if (info.which !== 'TEXT')
                            console.log(prefix + 'Parsed header: %s', inspect(Imap.parseHeader(buffer)));
                        else
                            console.log(prefix + 'Body [%s] Finished', inspect(info.which));
                    });
                });
                msg.once('attributes', function (attrs) {
                    console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                });
                msg.once('end', function () {
                    console.log(prefix + 'Finished');
                });
            });
            f.once('error', function (err) {
                console.log('Fetch error: ' + err);
            });
            f.once('end', function () {
                console.log('Done fetching all messages!');
                imap.end();
            });
        }, imap);
    });
}
;
