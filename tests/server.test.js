/*
 * Test suite for src/server.js
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const wams = require('../src/server.js');
const WorkSpace = wams.WorkSpace;
const Connection = wams.Connection;
const ServerWSObject = wams.ServerWSObject;
const ServerViewSpace = wams.ServerViewSpace;

expect.extend({
    toHaveImmutableProperty(received, argument) {
        const descs = Object.getOwnPropertyDescriptor(received, argument);
        const pass = Boolean(descs && !(descs.configurable || descs.writable));
        const not = pass ? 'not ' : ''
        return {
            message: () =>
                `expected ${received} ${not}to have immutable property '${argument}'`,
            pass: pass,
        };
    },
});

describe('WorkSpace', () => {
    const DEFAULTS = Object.freeze({
        debug: false,
        color: '#aaaaaa',
        boundaries: {
            x: 10000,
            y: 10000,
        },
        clientLimit: 10,
    });

    describe('constructor(port, settings)', () => {
        test('constructs correct type of object', () => {
            expect(new WorkSpace()).toBeInstanceOf(WorkSpace);
        });

        test('Uses default port 9000 if none provided', () => {
            expect(new WorkSpace().port).toBe(9000);
        });

        test('Uses user-defined port, if provided', () => {
            expect(new WorkSpace(8080).port).toBe(8080);
        });

        test('Uses port as its ID', () => {
            const ws1 = new WorkSpace();
            expect(ws1.port).toBe(9000);
            expect(ws1.id).toBe(9000);
            
            const ws2 = new WorkSpace(1264);
            expect(ws2.id).toBe(1264);
            expect(ws2.port).toBe(1264);
        });

        test('ID and port are immutable', () => {
            const ws = new WorkSpace(8080);
            expect(ws.id).toBe(8080);
            expect(ws.port).toBe(8080);
            expect(ws).toHaveImmutableProperty('id');
            expect(ws).toHaveImmutableProperty('port');
        });

        test('Uses default settings if none provided', () => {
            expect(new WorkSpace().settings).toEqual(DEFAULTS);
        });

        test('Uses user-defined settings, if provided', () => {
            const custom = {
                debug: true,
                color: 'rgb(155,72, 84)',
                boundaries: {
                    x: 1080,
                    y: 1920,
                },
                clientLimit: 2,
            };
            expect(new WorkSpace(8080, custom).settings).toEqual(custom);

            const ws = new WorkSpace(8080, {clientLimit: 7});
            expect(ws.settings).not.toEqual(DEFAULTS);
            expect(ws.settings.debug).toEqual(DEFAULTS.debug);
            expect(ws.settings.color).toEqual(DEFAULTS.color);
            expect(ws.settings.boundaries).toEqual(DEFAULTS.boundaries);
            expect(ws.settings.clientLimit).toBe(7);
        });
    });

});
