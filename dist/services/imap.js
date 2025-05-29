"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_imap_connection = get_imap_connection;
exports.get_imap_connection_ms = get_imap_connection_ms;
exports.raw_emails = raw_emails;
exports.sender_and_subject_since_date_callback = sender_and_subject_since_date_callback;
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
    return imap;
}
function get_imap_connection_ms(email, xoauth2) {
    let imap = new Imap({
        user: email,
        xoauth2: xoauth2,
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
        tlsOptions: { servername: 'outlook.office365.com' },
    });
    return imap;
}
// ===================================================================
// This function is used to attach commands to the imap connection.
// If you pass this a callback, it will run when you do imap.connect()
// ===================================================================
function open_inbox(callback, imap) {
    imap.openBox('INBOX', true, callback);
}
function raw_emails(imap, date, response) {
    var fs = require('fs'), fileStream;
    imap.once('ready', function () {
        open_inbox(function (err, box) {
            if (err)
                throw err;
            imap.search(['UNSEEN', ['SINCE', 'May 20, 2025']], function (err, results) {
                if (err)
                    throw err;
                var f = imap.fetch(results, { bodies: ['1.1.TEXT'] });
                f.on('message', function (msg, seqno) {
                    console.log('Message #%d', seqno);
                    var prefix = '(#' + seqno + ') ';
                    msg.on('body', function (stream, info) {
                        console.log(prefix + 'Body');
                        stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
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
            });
        }, imap);
    });
}
// ===================================================================
// This is a sample of a callback to get the sender and subject of the
// most recent email.
// ===================================================================
function sender_and_subject_since_date_callback(imap, date, response) {
    let emails = [];
    let page_data = '<ul>';
    imap.once('ready', function () {
        open_inbox(function (err, box) {
            if (err)
                throw err;
            // ==========================================================
            // Search params can narrow the search but we're seeking all
            // emails since X date.
            //
            // We can then take note of the most recent email and when a
            // user logs in or refreshes inbox we can look for all emails
            // after the id of the most recent one.
            // ===========================================================
            imap.search(['ALL', ['SINCE', date]], function (err, results) {
                var f = imap.fetch(results, { bodies: ['HEADER', 'TEXT'] });
                if (err)
                    throw err;
                f.on('message', function (msg, seqno) {
                    var prefix = '(#' + seqno + ') ';
                    let sender = '';
                    let subject = '';
                    msg.on('body', function (stream, info) {
                        var buffer = '', count = 0;
                        stream.on('data', function (chunk) {
                            count += chunk.length;
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', function () {
                            if (info.which !== 'TEXT') {
                                sender = inspect(Imap.parseHeader(buffer).from[0]);
                                subject = inspect(Imap.parseHeader(buffer).subject[0]);
                                page_data += '<li>Sender: ' + sender + '\n' + 'Subject: ' + subject + '</li>';
                            }
                        });
                    });
                    msg.once('attributes', function (attrs) {
                    });
                    msg.once('end', function () {
                        console.log(prefix + 'Finished');
                        emails.push({ prefix, sender, subject });
                    });
                });
                f.once('error', function (err) {
                    console.log('Fetch error: ' + err);
                });
                f.once('end', function () {
                    console.log('Done fetching all messages!');
                    console.log(emails);
                    page_data += '</ul>';
                    imap.end();
                    response.send(page_data);
                });
            });
        }, imap);
    });
}
;
