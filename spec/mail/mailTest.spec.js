var MailClient = require('../../lib/mail/MailClient');
var path = require('path');

describe('Example test', function () {

    beforeAll(function () {
        // init mail client
        this.mailClient = new MailClient();
        this.mailClient.init(path.resolve(__dirname, '../../config/mailListener.json'));
    });

    it('works', function (done) {
        // Searching criteria
        var criteria = {
            subject: 'test'
            // body: 'some text'
            // from: 'someperson@gmail.com'
        };
        // Assertion logic
        var check = function (mail) {
            expect(mail.text).toContain('some words');
            // expect(mail.subject).toEqual('test');
            done();
        };
        // Timeout action
        var timeout = function () {
            fail('Message not found');
            done();
        };
        this.mailClient.listenForMessage(criteria, check, 60 * 1000, timeout);
        expect(true).toBe(true);
    }, 120 * 1000);

    afterEach(function () {
        this.mailClient.stopListening();
    });
});