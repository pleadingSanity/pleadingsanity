/* Profile songs list. Moved out of an inline <script> in profile.html on 15 Nov 2026 because the page CSP blocked it. Same code, unchanged. */
 (function(){
   'use strict';
   var KEY='ps-profile-songs-v1';
   var apiOk=false;
   function readLocal(){ try{ var a=JSON.parse(localStorage.getItem(KEY)||'[]'); return Array.isArray(a)?a.filter(function(s){return s&&typeof s.id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(s.id);}).slice(0,20):[]; }catch(e){ return []; } }
   function writeLocal(a){ try{ localStorage.setItem(KEY,JSON.stringify(a)); }catch(e){} }
   function ytId(url){ try{ var u=new URL(url); if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com'].indexOf(u.hostname)>=0){ var v=u.searchParams.get('v'); if(v&&/^[A-Za-z0-9_-]{11}$/.test(v)) return v; var sh=u.pathname.split('/').filter(Boolean); if(sh.length&&sh[0]==='shorts'&&sh[1]&&/^[A-Za-z0-9_-]{11}$/.test(sh[1])) return sh[1]; if(sh.length&&sh[0]==='embed'&&sh[1]&&/^[A-Za-z0-9_-]{11}$/.test(sh[1])) return sh[1]; } if(u.hostname==='youtu.be'){ var id=u.pathname.replace(/^\//,''); if(/^[A-Za-z0-9_-]{11}$/.test(id)) return id; } }catch(e){} if(typeof url==='string'&&/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim(); return null; }
   var status=document.getElementById('ps-song-status'), list=document.getElementById('ps-song-list'), syncNote=document.getElementById('ps-song-sync');
   var songs=readLocal();
   function render(){
     list.replaceChildren();
     songs.forEach(function(s,i){
       var li=document.createElement('li'); li.style.cssText='border:1px solid rgba(0,255,240,.2);border-radius:12px;padding:.75rem;background:rgba(11,15,25,.6)';
       var head=document.createElement('div'); head.style.cssText='display:flex;justify-content:space-between;gap:.5rem;align-items:center;margin-bottom:.5rem';
       var t=document.createElement('strong'); t.style.color='#eef6ff'; t.textContent=(s.title||'Untitled')+(s.artist?' — '+s.artist:'')+(s.visibility==='public'?' · public':'');
       var rm=document.createElement('button'); rm.type='button'; rm.textContent='Remove'; rm.style.cssText='min-height:36px;padding:.35rem .8rem;border-radius:8px;border:1px solid rgba(245,158,11,.5);background:transparent;color:#f59e0b;cursor:pointer'; rm.setAttribute('aria-label','Remove '+(s.title||'song'));
       rm.addEventListener('click',function(){
         if(apiOk&&s.serverId){ fetch('/api/profile-songs/'+encodeURIComponent(s.serverId),{method:'DELETE'}).catch(function(){}); }
         songs.splice(i,1); writeLocal(songs.map(function(x){return {id:x.youtubeId||x.id,title:x.title,artist:x.artist,isPublic:x.visibility==='public'||x.isPublic};})); render();
       });
       head.appendChild(t); head.appendChild(rm); li.appendChild(head);
       var frame=document.createElement('iframe'); frame.src='https://www.youtube-nocookie.com/embed/'+(s.youtubeId||s.id); frame.title='YouTube player: '+(s.title||'song'); frame.loading='lazy'; frame.referrerPolicy='strict-origin-when-cross-origin'; frame.allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; frame.style.cssText='display:block;width:100%;aspect-ratio:16/9;border:0;border-radius:10px';
       li.appendChild(frame); list.appendChild(li);
     });
     if(!songs.length){ var p=document.createElement('p'); p.style.color='#64748b'; p.textContent='No songs added yet.'; list.appendChild(p); }
   }
   function setSync(text, ok){ if(syncNote){ syncNote.textContent=text; syncNote.style.color=ok?'#5eead4':'#fbbf24'; } }
   // Try to load from backend when signed in
   fetch('/api/profile-songs',{credentials:'same-origin'}).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }).then(function(d){
     if(d&&d.ok&&Array.isArray(d.songs)){ apiOk=true; songs=d.songs; writeLocal(d.songs.map(function(x){return {id:x.youtubeId,title:x.title,artist:x.artist,isPublic:x.visibility==='public'};})); setSync('Synced to your account', true); render(); }
   }).catch(function(){ apiOk=false; setSync('Saved on this device only (sign in to sync across devices)', false); render(); });
   document.getElementById('ps-song-add').addEventListener('click',function(){
     var url=document.getElementById('ps-song-url').value.trim();
     var id=ytId(url); status.textContent='';
     if(!id){ status.textContent='Please paste a valid YouTube link or 11-character video ID.'; return; }
     if(songs.some(function(s){return (s.youtubeId||s.id)===id;})){ status.textContent='That song is already in your list.'; return; }
     var pub=document.getElementById('ps-song-public').checked;
     var payload={url:url,title:document.getElementById('ps-song-title').value.trim().slice(0,80),artist:document.getElementById('ps-song-artist').value.trim().slice(0,60),visibility:pub?'public':'private'};
     var localSong={id:id,title:payload.title,artist:payload.artist,isPublic:pub};
     songs.unshift({youtubeId:id,title:payload.title,artist:payload.artist,visibility:pub?'public':'private'});
     writeLocal(songs.map(function(x){return {id:x.youtubeId||x.id,title:x.title,artist:x.artist,isPublic:x.visibility==='public'||x.isPublic};})); render();
     document.getElementById('ps-song-url').value=''; document.getElementById('ps-song-title').value=''; document.getElementById('ps-song-artist').value='';
     if(apiOk){ fetch('/api/profile-songs',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).then(function(r){return r.json();}).then(function(d){ if(d&&d.ok){ setSync('Synced to your account',true); } else { setSync('Saved on this device only',false); } }).catch(function(){ setSync('Saved on this device only',false); }); }
   });
   render();
 })();
 
