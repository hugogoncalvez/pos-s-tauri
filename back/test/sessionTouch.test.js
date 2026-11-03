import test from 'node:test';
import assert from 'node:assert/strict';
import { createThrottledTouch } from '../database/sessionTouch.js';

test('throttles repeated touches for the same session', () => {
    let currentTime = 1000;
    const calls = [];
    const callbacks = [];

    const throttled = createThrottledTouch((sessionId, session, callback) => {
        calls.push(sessionId);
        callback(null);
    }, {
        intervalMs: 1000,
        now: () => currentTime
    });

    assert.equal(throttled.touch('session-a', {}, (error) => callbacks.push(error)), true);
    assert.equal(throttled.touch('session-a', {}, (error) => callbacks.push(error)), false);
    assert.equal(callbacks.length, 2);
    assert.equal(calls.length, 1);

    currentTime += 1001;

    assert.equal(throttled.touch('session-a', {}, (error) => callbacks.push(error)), true);
    assert.equal(calls.length, 2);
    assert.equal(callbacks.length, 3);
});

test('does not mix different sessions', () => {
    let currentTime = 0;
    const calls = [];

    const throttled = createThrottledTouch((sessionId, session, callback) => {
        calls.push(sessionId);
        callback(null);
    }, {
        intervalMs: 1000,
        now: () => currentTime
    });

    throttled.touch('session-a', {}, () => {});
    throttled.touch('session-b', {}, () => {});

    assert.deepEqual(calls, ['session-a', 'session-b']);
    assert.equal(throttled.size(), 2);
});

test('cleanup removes stale sessions', () => {
    let currentTime = 0;

    const throttled = createThrottledTouch((sessionId, session, callback) => {
        callback(null);
    }, {
        intervalMs: 1000,
        now: () => currentTime
    });

    throttled.touch('old-session', {}, () => {});
    currentTime += 2000;
    throttled.touch('new-session', {}, () => {});

    throttled.cleanup(1500);

    assert.equal(throttled.size(), 1);
});
