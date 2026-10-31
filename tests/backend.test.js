import test from 'node:test';import assert from 'node:assert/strict';import {validateSearch,plan,safeAction,xpForVerified,match,demo} from '../server/core.mjs';
test('input validation and bounded query',()=>{assert.throws(()=>validateSearch({query:''}));assert.throws(()=>validateSearch({query:'x'.repeat(181)}));assert.equal(validateSearch({query:' invoice '}).query,'invoice')});
test('mission plan grounded in request',()=>assert.match(plan({mission:'invoice',query:'Acme'}).steps[0],/Acme/));
test('search matches real records only',()=>assert.equal(demo.filter(r=>match(r,'Aurora')).length,2));
test('actions cannot select missing or wrong source evidence',()=>{assert.throws(()=>safeAction({type:'gmail_archive',ids:['d-1']},demo));assert.throws(()=>safeAction({type:'gmail_archive',ids:['fake']},demo));assert.throws(()=>safeAction({type:'gmail_label',ids:['g-1'],label:'bad!'},demo))});
test('verified XP requires progress',()=>{assert.equal(xpForVerified(0),0);assert.equal(xpForVerified(1),150)});
