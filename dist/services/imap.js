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
function sender_and_subject_since_date_callback(imap, date, projectId, callback) {
    const emails = [];
    let page_data = '<ul>';
    console.log('IMAP is ready');
    imap.once('ready', function () {
        open_inbox(function (err, box) {
            if (err) {
                console.error('Open inbox error:', err);
                callback([]);
                return;
            }
            imap.search(['ALL', ['SINCE', date]], function (err, results) {
                if (err || !results || results.length === 0) {
                    console.error('Search error or no results:', err);
                    imap.end();
                    callback([]);
                    return;
                }
                const f = imap.fetch(results, { bodies: ['HEADER', 'TEXT'] });
                f.on('message', function (msg, seqno) {
                    let from = '';
                    let subject = '';
                    const mailBoxId = seqno;
                    msg.on('body', function (stream, info) {
                        let buffer = '';
                        stream.on('data', function (chunk) {
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', function () {
                            if (info.which !== 'TEXT') {
                                from = inspect(Imap.parseHeader(buffer).from[0]);
                                subject = inspect(Imap.parseHeader(buffer).subject[0]);
                                page_data += '<li>Sender: ' + from + '\n' + 'Subject: ' + subject + '</li>';
                            }
                        });
                    });
                    msg.once('end', function () {
                        console.log(mailBoxId + 'Finished');
                        emails.push({ mailBoxId, from, subject, projectId });
                    });
                });
                f.once('error', function (err) {
                    console.error('Fetch error:', err);
                    imap.end();
                    callback([]);
                });
                f.once('end', function () {
                    imap.end();
                    callback(emails);
                });
            });
        }, imap);
    });
    imap.once('error', function (err) {
        console.error('IMAP connection error:', err);
        callback([]);
    });
    imap.connect();
}
