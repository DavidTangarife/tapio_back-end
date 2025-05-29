import { Response } from "express";
import Connection from "node-imap";
import { json } from "node:stream/consumers";

var Imap = require('node-imap'), inspect = require('util').inspect;

// =============================================================
// Get the imap connection object with the users authentication
// =============================================================
export function get_imap_connection(email: string, xoauth2: string) {
  let imap: Connection = new Imap({
    user: email,
    xoauth2: xoauth2,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { servername: 'imap.gmail.com' }
  })
  return imap;
}

export function get_imap_connection_ms(email: string, xoauth2: string) {
  let imap: Connection = new Imap({
    user: email,
    xoauth2: xoauth2,
    host: 'outlook.office365.com',
    port: 993,
    tls: true,
    tlsOptions: { servername: 'outlook.office365.com' },
  })
  return imap;
}
// ===================================================================
// This function is used to attach commands to the imap connection.
// If you pass this a callback, it will run when you do imap.connect()
// ===================================================================
function open_inbox(callback: any, imap: Connection) {
  imap.openBox('INBOX', true, callback)
}

export function raw_emails(imap: Connection, date: String, response: Response) {
  var fs = require('fs'), fileStream;
  imap.once('ready', function() {
    open_inbox(function(err: any, box: any) {
      if (err) throw err;
      imap.search(['UNSEEN', ['SINCE', 'May 20, 2025']], function(err, results) {
        if (err) throw err;
        var f = imap.fetch(results, { bodies: ['1.1.TEXT'] });
        f.on('message', function(msg, seqno) {
          console.log('Message #%d', seqno);
          var prefix = '(#' + seqno + ') ';
          msg.on('body', function(stream, info) {
            console.log(prefix + 'Body');
            stream.pipe(fs.createWriteStream('msg-' + seqno + '-body.txt'));
          });
          msg.once('attributes', function(attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          msg.once('end', function() {
            console.log(prefix + 'Finished');
          });
        });
        f.once('error', function(err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
          console.log('Done fetching all messages!');
          imap.end();
        });
      });
    }, imap);
  })
}
// ===================================================================
// This is a sample of a callback to get the sender and subject of the
// most recent email.
// ===================================================================
export function sender_and_subject_since_date_callback(imap: Connection, date: String, response: any) {
  let emails: any = []
  let page_data = '<ul>'
  imap.once('ready', function() {
    open_inbox(function(err: any, box: any) {
      if (err) throw err;
      // ==========================================================
      // Search params can narrow the search but we're seeking all
      // emails since X date.
      //
      // We can then take note of the most recent email and when a
      // user logs in or refreshes inbox we can look for all emails
      // after the id of the most recent one.
      // ===========================================================
      imap.search(['ALL', ['SINCE', date]], function(err, results) {
        var f = imap.fetch(results, { bodies: ['HEADER', 'TEXT'] });
        if (err) throw err;
        f.on('message', function(msg, seqno) {
          var mailBoxId = seqno;
          let from = ''
          let subject = ''
          msg.on('body', function(stream, info) {
            var buffer = '', count = 0;
            stream.on('data', function(chunk) {
              count += chunk.length;
              buffer += chunk.toString('utf8');
            });
            stream.once('end', function() {
              if (info.which !== 'TEXT') {
                from = inspect(Imap.parseHeader(buffer).from[0]);
                subject = inspect(Imap.parseHeader(buffer).subject[0]);
                page_data += '<li>Sender: ' + from + '\n' + 'Subject: ' + subject + '</li>'
              }
            });
          });
          msg.once('attributes', function(attrs) {
          })
          msg.once('end', function() {
            console.log(mailBoxId + 'Finished');
            emails.push({ mailBoxId, from, subject })
          });
        });
        f.once('error', function(err) {
          console.log('Fetch error: ' + err);
        });
        f.once('end', function() {
          console.log('Done fetching all messages!');
          console.log(emails)
          page_data += '</ul>'
          imap.end();
          response.send(page_data)
        });
      });
    }, imap);
  });
};
