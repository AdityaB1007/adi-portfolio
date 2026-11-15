import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const page = readFileSync(new URL('../google-apps-script/Form.html',import.meta.url),'utf8');
const script = page.match(/<script>([\s\S]*?)<\/script>/)[1].replace('<?= formToken ?>','test-token');
const staticScript = readFileSync(new URL('../dist/brief-builder.js',import.meta.url),'utf8');
function harness(connected = true) {
  const fields={company:'Example Ltd',service:'Agentic AI & knowledge assistants',problem:'Build a research agent that answers questions from our internal documents.',timeline:'Next month',name:'Example Person',email:'example@example.com',website:''};
  const events={};
  const form={addEventListener:(event,handler)=>{events[event]=handler;},reportValidity:()=>true,reset:()=>{for(const key of Object.keys(fields))fields[key]='';fields.service='Workflow integrations & automation';}};
  const button={disabled:false,setAttribute(){}};
  const status={textContent:''};const preview={textContent:''};const privacy={textContent:''};
  const nodes={'#brief-form':form,'#send-brief':button,'#brief-status':status,'#brief-preview-text':preview,'#brief-privacy':privacy};
  const calls=[];let success;let failure;
  const run={withSuccessHandler(handler){success=handler;return run;},withFailureHandler(handler){failure=handler;return run;},submitBrief(payload){calls.push(payload);}};
  const context={document:{querySelector:id=>nodes[id]},crypto:webcrypto,FormData:class{constructor(){}*[Symbol.iterator](){yield* Object.entries(fields);}},localStorage:{getItem(){return null;},setItem(){}}};
  if(connected)context.google={script:{run}};
  vm.runInNewContext(connected?script:staticScript,context);
  return {fields,button,status,preview,privacy,calls,submit:()=>events.submit({preventDefault(){}}),input:()=>events.input(),success:value=>success(value),failure:()=>failure()};
}
test('static draft renders safely and cannot claim a message was sent before configuration',()=>{
  const h=harness(false);h.fields.company='<img src=x onerror=alert(1)>';h.input();
  assert.match(h.preview.textContent,/<img src=x onerror=alert\(1\)>/);assert.equal(h.button.disabled,true);
  h.submit();assert.equal(h.calls.length,0);assert.match(h.status.textContent,/not connected/);
});
test('Google submission prevents double clicks; failure preserves input and retry identifier',()=>{
  const h=harness();h.submit();h.submit();assert.equal(h.calls.length,1);assert.equal(h.button.disabled,true);
  assert.equal(h.calls[0].company,'Example Ltd');assert.equal(h.calls[0].token,'test-token');
  h.failure();assert.equal(h.button.disabled,false);assert.equal(h.fields.company,'Example Ltd');
  h.submit();assert.equal(h.calls.length,2);assert.equal(h.calls[0].requestId,h.calls[1].requestId);
  h.success({received:true,reference:'BRIEF-EXAMPLE'});assert.match(h.status.textContent,/received and saved for review/);assert.match(h.status.textContent,/BRIEF-EXAMPLE/);assert.equal(h.fields.company,'');
});
test('unconfirmed receipt leaves the draft intact; edited retries get a fresh request identifier',()=>{
  const h=harness();h.submit();h.success({received:false});assert.equal(h.fields.company,'Example Ltd');assert.match(h.status.textContent,/could not be confirmed/);
  h.fields.problem+=' We also need reporting.';h.submit();assert.notEqual(h.calls[0].requestId,h.calls[1].requestId);
});
