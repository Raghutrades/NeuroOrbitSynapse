const C='neuroorbitsynapse-v4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./badge-96.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
 e.respondWith(fetch(e.request).then(r=>{if(r&&r.ok&&u.origin===location.origin){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{})}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(m=>m||caches.match('./index.html'))))});
self.addEventListener('notificationclick',e=>{const n=e.notification,d=n.data||{},act=e.action;n.close();
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
  if(cs.length){const c=cs[0];if(act==='done'&&d.goal)c.postMessage({type:'done',goal:d.goal});else if(d.goal)c.postMessage({type:'open',goal:d.goal});return c.focus()}
  const q=act==='done'&&d.goal?'?done='+encodeURIComponent(d.goal):(d.goal?'?goal='+encodeURIComponent(d.goal):'');return self.clients.openWindow('./'+q)}))});
