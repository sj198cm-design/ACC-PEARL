// ACC Pearl Ledger - Google Apps Script. Install as Code.gs.
const ACC_ID='1iSrCGf2WluHtA6ss2N-0PfS5dCLYW4-KGwjNqkIL45I';
const COL={
 Purchases:['ID','Date','Supplier','Lot','Serial','Pearl Type','Size','Grade','Color','Shape','Drilling','Quantity','Unit','Unit Cost','Total','Currency','FX to JPY','Paid','Credit','Notes'],
 Sales:['ID','Date','Customer','Purchase ID','Lot','Serial','Quantity','Unit','Unit Price','Total','Currency','FX to JPY','Received','Credit','Notes'],
 Expenses:['ID','Date','Payee','Category','Description','Amount','Currency','FX to JPY','Notes'],
 Receivables:['ID','Date','Customer','Sale ID','Description','Amount','Received','Outstanding','Currency','Due Date','Notes'],
 Payables:['ID','Date','Supplier','Purchase ID','Description','Amount','Paid','Outstanding','Currency','Due Date','Notes'],
 Customers:['Customer','Contact','Notes'],Suppliers:['Supplier','Contact','Notes']
};
function doGet(){return HtmlService.createHtmlOutputFromFile('Index').setTitle('ACC Pearl Ledger').addMetaTag('viewport','width=device-width,initial-scale=1');}
function accBook(){return SpreadsheetApp.openById(ACC_ID);}
function accSheet(t){const s=accBook().getSheetByName(t);if(!s)throw Error('Missing sheet '+t);return s;}
function accNum(v){const n=Number(v);if(!Number.isFinite(n))throw Error('Invalid number');return n;}
function accRows(t){const s=accSheet(t),h=COL[t],last=s.getLastRow();if(last<2)return [];return s.getRange(2,1,last-1,h.length).getValues().filter(r=>r.some(x=>x!==''&&x!==null)).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i] instanceof Date?Utilities.formatDate(r[i],'Asia/Tokyo','yyyy-MM-dd'):r[i]])));}
function accSafe(v){if(typeof v!=='string')return v??'';return /^[=+\-@]/.test(v)? "'"+v:v;}
function accAppend(t,o){accSheet(t).appendRow(COL[t].map(k=>accSafe(o[k])));}
function accParty(t,name){const k=t==='Customers'?'Customer':'Supplier';if(!accRows(t).some(r=>String(r[k]).toLowerCase()===name.toLowerCase()))accAppend(t,{[k]:name});}
function accInventory(purchases,sales){const sold={};sales.forEach(s=>sold[s['Purchase ID']]=(sold[s['Purchase ID']]||0)+Number(s.Quantity));return purchases.map(p=>({...p,sold:sold[p.ID]||0,remaining:Number(p.Quantity)-(sold[p.ID]||0)}));}
function accData(){
 const purchases=accRows('Purchases'),sales=accRows('Sales'),expenses=accRows('Expenses'),receivables=accRows('Receivables'),payables=accRows('Payables'),inventory=accInventory(purchases,sales);
 const map=Object.fromEntries(purchases.map(p=>[p.ID,p]));
 const revenue=sales.reduce((a,s)=>a+Number(s.Total)*Number(s['FX to JPY']||1),0);
 const cogs=sales.reduce((a,s)=>{const p=map[s['Purchase ID']];return a+(p?Number(s.Quantity)*Number(p['Unit Cost'])*Number(p['FX to JPY']||1):0);},0);
 const costs=expenses.reduce((a,e)=>a+Number(e.Amount)*Number(e['FX to JPY']||1),0);
 const stock=inventory.reduce((a,p)=>a+Math.max(0,p.remaining)*Number(p['Unit Cost'])*Number(p['FX to JPY']||1),0);
 const categories=[...new Set(['Shipping','Office','Transport','Packaging','Bank Charges','Rent','Utilities','Salary','Drilling',...expenses.map(e=>String(e.Category)).filter(Boolean)])].sort();
 return {purchases,sales,expenses,receivables,payables,inventory,customers:accRows('Customers'),suppliers:accRows('Suppliers'),categories,summary:{revenue,cogs,gross:revenue-cogs,expenses:costs,net:revenue-cogs-costs,stock,receivables:receivables.reduce((a,r)=>a+Number(r.Outstanding)*Number(r['FX to JPY']||1),0),payables:payables.reduce((a,r)=>a+Number(r.Outstanding)*Number(r['FX to JPY']||1),0)}};
}
function accSave(type,p){
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  if(!['Purchase','Sale','Expense','Receivable','Payable'].includes(type))throw Error('Invalid entry');
  const id=String(p.requestId||'');if(!/^[a-zA-Z0-9_-]{12,100}$/.test(id))throw Error('Invalid request ID');
  const main={Purchase:'Purchases',Sale:'Sales',Expense:'Expenses',Receivable:'Receivables',Payable:'Payables'}[type];
  if(accRows(main).some(r=>String(r.ID)===id))return {ok:true,id,duplicate:true};
  const date=String(p.date||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Select date');
  const party=String(p.party||'').trim(),currency=String(p.currency||'JPY'),fx=accNum(p.fx);
  if(!['JPY','USD','EUR'].includes(currency)||fx<=0)throw Error('Check currency / FX');
  const base={ID:id,Date:date,Currency:currency,'FX to JPY':fx,Notes:p.notes||''};
  if(type==='Purchase'){
   const qty=accNum(p.qty),rate=accNum(p.rate),paid=accNum(p.paid),total=qty*rate;
   if(!party||!String(p.lot||'').trim()||qty<=0||rate<0||paid<0||paid>total)throw Error('Check purchase values');
   accAppend('Purchases',{...base,Supplier:party,Lot:p.lot,Serial:p.serial||'','Pearl Type':p.pearlType||'',Size:p.size||'',Grade:p.grade||'',Color:p.color||'',Shape:p.shape||'',Drilling:p.drilling||'',Quantity:qty,Unit:p.unit||'PCS','Unit Cost':rate,Total:total,Paid:paid,Credit:paid<total?'Yes':'No'});
   if(paid<total)accAppend('Payables',{ID:'P-'+id,Date:date,Supplier:party,'Purchase ID':id,Description:'Purchase '+p.lot,Amount:total,Paid:paid,Outstanding:total-paid,Currency:currency});
   accParty('Suppliers',party);
  }else if(type==='Sale'){
   const item=accInventory(accRows('Purchases'),accRows('Sales')).find(x=>String(x.ID)===String(p.purchaseId));
   const qty=accNum(p.qty),rate=accNum(p.rate),received=accNum(p.paid),total=qty*rate;
   if(!item||!party||qty<=0||qty>item.remaining||rate<0||received<0||received>total)throw Error('Check sale values and available stock');
   accAppend('Sales',{...base,Customer:party,'Purchase ID':item.ID,Lot:item.Lot,Serial:item.Serial,Quantity:qty,Unit:item.Unit,'Unit Price':rate,Total:total,Received:received,Credit:received<total?'Yes':'No'});
   if(received<total)accAppend('Receivables',{ID:'R-'+id,Date:date,Customer:party,'Sale ID':id,Description:'Sale '+item.Lot,Amount:total,Received:received,Outstanding:total-received,Currency:currency});
   accParty('Customers',party);
  }else if(type==='Expense'){
   const amount=accNum(p.amount),category=String(p.category||'').trim();
   if(!category||amount<=0)throw Error('Enter category and amount');
   accAppend('Expenses',{...base,Payee:party,Category:category,Description:p.notes||'',Amount:amount});
  }else{
   const amount=accNum(p.amount),paid=accNum(p.paid),isR=type==='Receivable';
   if(!party||amount<=0||paid<0||paid>amount)throw Error('Check balance');
   accAppend(main,{...base,[isR?'Customer':'Supplier']:party,Description:p.notes||'Opening balance',Amount:amount,[isR?'Received':'Paid']:paid,Outstanding:amount-paid,'Due Date':p.dueDate||''});
   accParty(isR?'Customers':'Suppliers',party);
  }
  SpreadsheetApp.flush();
  if(!accRows(main).some(r=>String(r.ID)===id))throw Error('Save not verified');
  return {ok:true,id};
 }finally{lock.releaseLock();}
}
function accPayment(type,id,amount){
 if(!['Receivables','Payables'].includes(type))throw Error('Invalid account');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const s=accSheet(type),h=COL[type],rows=s.getDataRange().getValues(),amt=accNum(amount);
  if(amt<=0)throw Error('Invalid amount');
  const paidCol=h.indexOf(type==='Receivables'?'Received':'Paid')+1,outCol=h.indexOf('Outstanding')+1;
  for(let i=1;i<rows.length;i++)if(String(rows[i][0])===String(id)){
   const outstanding=Number(rows[i][outCol-1]),paid=Number(rows[i][paidCol-1]);
   if(amt>outstanding)throw Error('Payment exceeds balance');
   s.getRange(i+1,paidCol).setValue(paid+amt);s.getRange(i+1,outCol).setValue(outstanding-amt);
   SpreadsheetApp.flush();return {ok:true};
  }
  throw Error('Account not found');
 }finally{lock.releaseLock();}
}