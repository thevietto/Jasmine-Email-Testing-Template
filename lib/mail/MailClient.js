var MailListener = require("mail-listener2");
var jsonfile = require("jsonfile");

var MailClient = function () {
    var mailListener = null;
    var listenerProcess = null;
};

var isFittingCriteria = function (criteria, mail) {
    return (!criteria.subject || mail.subject.indexOf(criteria.subject) !== -1)
        && (!criteria.body || mail.text.indexOf(criteria.body) !== -1)
        && (!criteria.from || mail.from.map(function (e) {
            return e.address
        }).filter(function (e) {
            return criteria.from === e
        }).length > 0);
};

MailClient.prototype.init = function (configPath) {
    var config = jsonfile.readFileSync(configPath);
    this.mailListener = new MailListener(config);
    this.mailListener.start();
    this.mailListener.on("server:connected", function () {
        console.log("imapConnected");
    });

    this.mailListener.on("server:disconnected", function () {
        console.log("imapDisconnected");
    });

    this.mailListener.on("error", function (err) {
        console.log(err);
    });
};

/**
 * Waits for a message fitting the given criteria.
 * Empty criteria will return first message received.
 *
 * @param criteria - json array with the following fields: subject, body, from
 * @param callback - function to be called when a message found
 * @param timeout - in milliseconds
 * @param timeoutCallback - function to be called when timeout exceeded
 */
MailClient.prototype.listenForMessage = function (criteria, callback, timeout, timeoutCallback) {
    var it = this;
    if (!it.mailListener) {
        it.init();
    }
    if (it.listenerProcess) {
        console.log('You should stop the previous listener before starting a new one');
        return;
    }
    console.log('Looking for message fitting criteria', criteria);
    it.mailListener.on("mail", function (mail, seqno, attributes) {
        if (isFittingCriteria(criteria, mail)) {
            callback(mail);
        } else {
        }
    });

    it.listenerProcess = setTimeout(function () {
        it.stopListening();
        timeoutCallback();
    }, timeout);
};

MailClient.prototype.stopListening = function () {
    var it = this;
    if (!it.mailListener) {
        return;
    }
    it.mailListener.stop();
    clearTimeout(it.listenerProcess);
};

module.exports = MailClient;
