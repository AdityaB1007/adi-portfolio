import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { randomUUID, createHmac } from 'node:crypto';

const source = readFileSync(new URL('../google-apps-script/Code.gs', import.meta.url), 'utf8');
function harness() {
  class Sheet {
    constructor(name, data) { this.name = name; this.data = data; }
    getLastRow() { return this.data.length; }
    appendRow(row) { this.data.push([...row]); }
    getRange(row, column, height = 1, width = 1) {
      return {
        getValues: () => Array.from({length:height}, (_, r) => Array.from({length:width}, (_, c) => this.data[row-1+r]?.[column-1+c] ?? '')),
        setValue: value => { this.data[row-1][column-1] = value; }
      };
    }
    getName() { return this.name; }
  }
  const properties = new Map([['SPREADSHEET_ID','private-book'], ['SIGNING_SECRET','test-only-secret'], ['NOTIFICATION_EMAIL','adityaworkone@gmail.com']]);
  const enquiries = new Sheet('Enquiries', []);
  const audit = new Sheet('Audit', [['UTC','Reference','Event','Detail']]);
  const sheets = { Enquiries:enquiries, Audit:audit };
  let selected = 2;
  const book = { getSheetByName: name => sheets[name], getUrl: () => 'https://docs.google.com/spreadsheets/d/private-book/edit' };
  const sent = [];
  const context = {
    console: {error() {}},
    Utilities: {getUuid:randomUUID, computeHmacSha256Signature: (value, secret) => createHmac('sha256',secret).update(value).digest(), base64EncodeWebSafe: bytes => Buffer.from(bytes).toString('base64url')},
    PropertiesService:{getScriptProperties:()=>({getProperty:key=>properties.get(key),setProperty:(key,value)=>properties.set(key,value)})},
    LockService:{getScriptLock:()=>({tryLock:()=>context.allowLock,releaseLock(){},waitLock(){if(!context.allowLock) throw new Error('busy');}})},
    SpreadsheetApp:{openById:()=>book,flush(){},getActiveRange:()=>({getSheet:()=>enquiries,getRow:()=>selected,getLastRow:()=>selected})},
    MailApp:{getRemainingDailyQuota:()=>context.quota,sendEmail: message=>{sent.push(message); if(context.failSend) throw new Error('failure'); if(context.afterSend) context.afterSend();}},
    allowLock:true,quota:100,failSend:false,
  };
  vm.createContext(context);vm.runInContext(source,context);enquiries.appendRow(context.HEADERS);
  const token = (age=3000) => {const payload = `${Date.now()-age}.${randomUUID()}`;return `${payload}.${context.signature_(payload)}`;};
  const message = (overrides={}) => ({name:'Jane Example',email:'jane@example.com',company:'Example Ltd',service:'Workflow integrations & automation',problem:'We need to automate invoice processing and reporting across our ERP systems.',timeline:'Next month',website:'',requestId:randomUUID(),browserId:randomUUID(),token:token(),...overrides});
  return {context,enquiries,audit,sent,message,token,properties,select:row=>{selected=row;}};
}

test('accepted brief is recorded before an owner-only notification; retries reuse the receipt',()=>{
 const h=harness();const input=h.message({to:'attacker@example.com'});const receipt=h.context.submitBrief(input);
 assert.equal(receipt.received,true);assert.equal(h.enquiries.data.length,2);assert.equal(h.sent.length,1);
 assert.equal(h.sent[0].to,'adityaworkone@gmail.com');assert.equal(h.sent[0].replyTo,'jane@example.com');
 assert.equal(h.enquiries.data[1][10],'sent');assert.equal(h.context.submitBrief(input).reference,receipt.reference);
 assert.equal(h.enquiries.data.length,2);assert.equal(h.sent.length,1);assert.ok(h.audit.data.some(row=>row[2]==='submission_retry'));
});
test('spam and irrelevant messages are retained, flagged, and held from email',()=>{
 for(const override of [{website:'bot-filled'}, {problem:'Buy backlinks and guest post service now. A very special promotion just for you.'}, {problem:'Hello there, it is a beautiful day outside and I would like to chat about the weather.'}]) {
  const h=harness();h.context.submitBrief(h.message(override));assert.equal(h.enquiries.data.length,2);assert.equal(h.enquiries.data[1][10],'held');assert.equal(h.sent.length,0);assert.notEqual(h.enquiries.data[1][8],'accepted');assert.ok(h.enquiries.data[1][17]);
 }
});
test('invalid, expired, and too-fast tokens are recorded and held rather than silently dropped',()=>{
 const h=harness();for(const token of ['forged',h.token(3*60*60*1000),h.token(1)])h.context.submitBrief(h.message({token}));
 assert.equal(h.enquiries.data.length,4);assert.ok(h.enquiries.data.slice(1).every(row=>row[10]==='held'));assert.equal(h.sent.length,0);
});
test('duplicates and rapid repeat visitors are logged but do not flood the mailbox',()=>{
 const h=harness();let original=h.message();h.context.submitBrief(original);h.context.submitBrief({...original,requestId:randomUUID()});
 assert.match(h.enquiries.data[2][9],/duplicate_content/);assert.equal(h.sent.length,1);
 const browserId=randomUUID();for(let i=0;i<4;i++)h.context.submitBrief(h.message({browserId,email:`visitor${i}@example.com`,problem:`Automate workflow number ${i} using our data and reporting infrastructure.`}));
 assert.match(h.enquiries.data.at(-1)[9],/browser_or_form_rate_limit/);assert.equal(h.enquiries.data.length,7);
});
test('spreadsheet formulas are escaped without losing the original message snapshot',()=>{
 const h=harness();for(const value of ['=IMPORTXML("https://example.com","//a")',' +SUM(1,2)','\t@IMPORTDATA("x")','-1+2'])assert.equal(h.context.safeCell_(value),`'${value}`);
 const name='=SUM(1,2)';h.context.submitBrief(h.message({name}));assert.equal(h.enquiries.data[1][2],`'${name}`);assert.equal(JSON.parse(h.enquiries.data[1][17]).name,name);
 assert.ok(!h.enquiries.data[1][14].includes('browser'));assert.equal(h.enquiries.data[1][14].length,43);
});
test('daily and Google mail limits retain queued messages for a later worker run',()=>{
 for(const cause of ['daily','google']) {
  const h=harness();if(cause==='daily')h.properties.set('DAILY_EMAIL_ATTEMPTS',JSON.stringify({date:new Date().toISOString().slice(0,10),count:20}));else h.context.quota=0;
  h.context.submitBrief(h.message());assert.equal(h.enquiries.data[1][10],'queued');assert.equal(h.sent.length,0);
  h.context.quota=100;h.properties.delete('DAILY_EMAIL_ATTEMPTS');h.context.deliverNext_();assert.equal(h.sent.length,1);assert.equal(h.enquiries.data[1][10],'sent');
 }
});
test('delivery failures and interrupted sends require owner review, never automatic duplicate retries',()=>{
 const h=harness();h.context.failSend=true;h.context.submitBrief(h.message());assert.equal(h.enquiries.data[1][10],'delivery_needs_review');h.context.deliverNext_();assert.equal(h.sent.length,1);
 h.enquiries.data[1][10]='sending';h.enquiries.data[1][11]=new Date(Date.now()-11*60000).toISOString();h.context.deliverNext_();assert.equal(h.enquiries.data[1][10],'delivery_uncertain');assert.equal(h.sent.length,1);
});
test('owner can approve a flagged record or mark it irrelevant without deleting its contents',()=>{
 const h=harness();h.context.submitBrief(h.message({website:'bot-filled'}));h.context.reviewSelected_('approve');assert.equal(h.enquiries.data[1][10],'queued');h.context.reviewSelected_('irrelevant');assert.equal(h.enquiries.data[1][10],'held');assert.equal(h.enquiries.data[1][8],'irrelevant');assert.ok(h.enquiries.data[1][17]);assert.ok(h.audit.data.some(row=>row[2]==='owner_irrelevant'));
});
test('busy storage fails honestly before claiming receipt',()=>{
 const h=harness();h.context.allowLock=false;assert.throws(()=>h.context.submitBrief(h.message()),/not confirmed saved/);assert.equal(h.enquiries.data.length,1);assert.equal(h.sent.length,0);
});
test('delivery status follows the reference if the owner sorts rows during sending',()=>{
 const h=harness();h.context.quota=0;h.context.submitBrief(h.message());h.context.submitBrief(h.message({email:'second@example.com',problem:'Build a dashboard for our sales data and workflow reporting systems.'}));
 const first=h.enquiries.data[1][0];h.context.quota=100;h.context.afterSend=()=>{const [a,b]=h.enquiries.data.slice(1);h.enquiries.data.splice(1,2,b,a);};h.context.deliverNext_();assert.equal(h.enquiries.data.find(row=>row[0]===first)[10],'sent');assert.equal(h.enquiries.data[1][10],'queued');
});
