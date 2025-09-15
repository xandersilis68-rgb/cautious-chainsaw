
// --- SPA navigation ---
document.querySelectorAll('.nav-btn').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const s = btn.dataset.section;
    document.querySelectorAll('.section').forEach(sec=>sec.classList.remove('active'));
    document.getElementById(s).classList.add('active');
  });
});
// Home tiles navigation
document.querySelectorAll('.tile').forEach(tile=>{
  tile.addEventListener('click', ()=>{
    const target = tile.dataset.section;
    document.querySelector('.nav-btn[data-section="' + target + '"]').click();
  });
});

// -------- Playbook --------
const court = document.getElementById('court');
const playNameInput = document.getElementById('playName');
const playerNameInput = document.getElementById('playerName');
const playerRole = document.getElementById('playerRole');
const playerNumberInput = document.getElementById('playerNumber');
const savedPlays = document.getElementById('savedPlays');
const photoInput = document.getElementById('photoInput');

let plays = JSON.parse(localStorage.getItem('plays') || '{}');
let playerPhotos = JSON.parse(localStorage.getItem('playerPhotos') || '{}');
let currentPlay = null;
let selectedElement = null;

function refreshSavedPlays(){
  savedPlays.innerHTML = '<option value="">--Select saved play--</option>';
  Object.keys(plays).forEach(k=>{
    const opt = document.createElement('option'); opt.value=k; opt.textContent=k;
    savedPlays.appendChild(opt);
  });
}
refreshSavedPlays();

document.getElementById('savePlay').addEventListener('click', ()=>{
  const name = playNameInput.value.trim();
  if(!name) return alert('Enter a play name');
  const frames = Array.from(court.querySelectorAll('.player')).map(el=>{
    return {id: el.dataset.id, x: el.querySelector('circle').getAttribute('cx'), y: el.querySelector('circle').getAttribute('cy'), name: el.dataset.name, role: el.dataset.role, num: el.dataset.num, photo: el.dataset.photo || ''};
  });
  plays[name] = {frames};
  localStorage.setItem('plays', JSON.stringify(plays));
  refreshSavedPlays();
  alert('Play saved');
});

document.getElementById('newFrame').addEventListener('click', ()=> {
  // create default players for a new frame
  for(let i=1;i<=6;i++){
    addPlayerToCourt('P'+i, 'OH', 100+80*(i-1), 200 + ((i%2)?-60:60), i, '');
  }
});

document.getElementById('presetPlays').addEventListener('change', (e)=>{
  const val = e.target.value;
  court.querySelectorAll('.player').forEach(n=>n.remove());
  if(val==='quick1'){
    addPlayerToCourt('S', 'Setter', 300, 180, 5, '');
    addPlayerToCourt('OH1', 'OH', 240, 120, 11, '');
    addPlayerToCourt('OH2', 'OH', 360, 120, 9, '');
    addPlayerToCourt('MB1', 'MB', 260, 220, 2, '');
    addPlayerToCourt('MB2', 'MB', 340, 220, 6, '');
    addPlayerToCourt('L', 'Libero', 300, 280, 1, '');
  } else if(val==='outside'){
    addPlayerToCourt('S', 'Setter', 300, 180, 5, '');
    addPlayerToCourt('OH', 'OH', 200, 120, 8, '');
    addPlayerToCourt('Opp', 'Opp', 400, 120, 12, '');
    addPlayerToCourt('MB1', 'MB', 260, 220, 3, '');
    addPlayerToCourt('MB2', 'MB', 340, 220, 7, '');
    addPlayerToCourt('L', 'Libero', 300, 280, 1, '');
  }
});

document.getElementById('exportPlays').addEventListener('click', ()=>{
  const data = JSON.stringify(plays, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='plays.json'; a.click();
  URL.revokeObjectURL(url);
});

savedPlays.addEventListener('change', ()=> {
  const name = savedPlays.value;
  if(!name) return;
  loadPlay(name);
});

document.getElementById('deletePlay').addEventListener('click', ()=>{
  const name = savedPlays.value;
  if(!name) return alert('Select a play to delete');
  if(confirm('Delete play '+name+'?')) {
    delete plays[name];
    localStorage.setItem('plays', JSON.stringify(plays));
    refreshSavedPlays();
    court.querySelectorAll('.player').forEach(n=>n.remove());
  }
});

function loadPlay(name){
  court.querySelectorAll('.player').forEach(n=>n.remove());
  const p = plays[name];
  if(!p) return;
  p.frames.forEach(f=>{
    addPlayerToCourt(f.name, f.role, +f.x, +f.y, f.num || '', f.photo || '');
  });
  playNameInput.value = name;
}

let playerCounter = 0;
function addPlayerToCourt(name, role, x=150, y=150, num='', photo=''){
  playerCounter++;
  const g = document.createElementNS('http://www.w3.org/2000/svg','g');
  g.classList.add('player');
  g.dataset.id = 'pl'+playerCounter;
  g.dataset.name = name;
  g.dataset.role = role;
  g.dataset.num = num;
  if(photo) { g.dataset.photo = photo; playerPhotos[g.dataset.id]=photo; localStorage.setItem('playerPhotos', JSON.stringify(playerPhotos)); }
  const circ = document.createElementNS('http://www.w3.org/2000/svg','circle');
  circ.setAttribute('cx', x); circ.setAttribute('cy', y); circ.setAttribute('r', 22); circ.setAttribute('fill','#1e88e5');
  const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
  txt.setAttribute('x', x); txt.setAttribute('y', y+6); txt.setAttribute('text-anchor','middle'); txt.setAttribute('fill','#fff');
  txt.setAttribute('font-size','12'); txt.textContent = name + (num? ' #'+num : '');
  const roleLabel = document.createElementNS('http://www.w3.org/2000/svg','text');
  roleLabel.setAttribute('x', x+34); roleLabel.setAttribute('y', y); roleLabel.setAttribute('font-size','10');
  roleLabel.textContent = role;
  g.appendChild(circ); g.appendChild(txt); g.appendChild(roleLabel);

  // if photo exists, add image overlay using foreignObject
  if(photo){
    const fo = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
    fo.setAttribute('x', x-26); fo.setAttribute('y', y-26); fo.setAttribute('width', 52); fo.setAttribute('height', 52);
    const div = document.createElement('div');
    div.innerHTML = '<img src="'+photo+'" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.15)"/>';
    fo.appendChild(div);
    g.appendChild(fo);
  }

  court.appendChild(g);
  makeDraggable(g);
  g.addEventListener('click',(e)=> {
    e.stopPropagation();
    selectElement(g);
  });
  g.addEventListener('dblclick', ()=> editPlayerDialog(g));
}

function selectElement(el){
  if(selectedElement) deselect();
  selectedElement = el;
  el.querySelector('circle').setAttribute('stroke','#0ea5e9'); el.querySelector('circle').setAttribute('stroke-width','3');
}

function deselect(){
  if(!selectedElement) return;
  const c = selectedElement.querySelector('circle');
  if(c){ c.removeAttribute('stroke'); c.removeAttribute('stroke-width'); }
  selectedElement = null;
}

document.addEventListener('click',(e)=> { if(!e.target.closest('.player')) deselect(); });

function makeDraggable(el){
  let dragging=false, offsetX=0, offsetY=0;
  const circ = el.querySelector('circle'), txt = el.querySelector('text'), roleLabel = el.querySelectorAll('text')[1];
  circ.addEventListener('mousedown', start);
  circ.addEventListener('touchstart', start);
  function start(e){
    e.preventDefault();
    dragging=true;
    const pt = getEventPoint(e);
    offsetX = pt.x - parseFloat(circ.getAttribute('cx'));
    offsetY = pt.y - parseFloat(circ.getAttribute('cy'));
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
  }
  function move(e){
    if(!dragging) return;
    const pt = getEventPoint(e);
    const nx = pt.x - offsetX, ny = pt.y - offsetY;
    circ.setAttribute('cx', nx); circ.setAttribute('cy', ny);
    txt.setAttribute('x', nx); txt.setAttribute('y', ny+6);
    roleLabel.setAttribute('x', nx+34); roleLabel.setAttribute('y', ny);
    // move any foreignObject (photo)
    const fo = el.querySelector('foreignObject');
    if(fo){
      fo.setAttribute('x', nx-26); fo.setAttribute('y', ny-26);
    }
  }
  function end(){
    dragging=false;
    window.removeEventListener('mousemove', move);
    window.removeEventListener('touchmove', move);
    window.removeEventListener('mouseup', end);
    window.removeEventListener('touchend', end);
  }
}

function getEventPoint(e){
  const svgPt = court.createSVGPoint();
  if(e.touches && e.touches[0]){ svgPt.x = e.touches[0].clientX; svgPt.y = e.touches[0].clientY; }
  else { svgPt.x = e.clientX; svgPt.y = e.clientY; }
  const ctm = court.getScreenCTM().inverse();
  return svgPt.matrixTransform(ctm);
}

document.getElementById('playerName').addEventListener('keypress', (e)=> {
  if(e.key==='Enter'){ addPlayerToCourt(playerNameInput.value || 'P', playerRole.value, 150, 150, playerNumberInput.value || '', ''); }
});

document.addEventListener('keydown', (e)=>{
  if(e.key==='Delete' && selectedElement){ selectedElement.remove(); selectedElement=null; }
});

function editPlayerDialog(g){
  const id = g.dataset.id;
  const currentName = g.dataset.name || '';
  const currentRole = g.dataset.role || '';
  const currentNum = g.dataset.num || '';
  const currentPhoto = g.dataset.photo || '';
  const name = prompt('Player name:', currentName);
  if(name===null) return;
  const num = prompt('Number:', currentNum);
  if(num===null) return;
  const role = prompt('Role:', currentRole);
  if(role===null) return;
  g.dataset.name = name; g.dataset.role = role; g.dataset.num = num;
  const txt = g.querySelector('text'); txt.textContent = name + (num? ' #'+num : '');
  g.querySelectorAll('text')[1].textContent = role;
  // Ask if user wants to upload photo
  if(confirm('Upload/change photo for this player?')){
    photoInput.onchange = function(ev){
      const f = ev.target.files[0];
      if(!f) return;
      const reader = new FileReader();
      reader.onload = function(evt){
        const data = evt.target.result;
        g.dataset.photo = data;
        playerPhotos[id] = data;
        localStorage.setItem('playerPhotos', JSON.stringify(playerPhotos));
        // remove existing foreignObject and add new one
        const existing = g.querySelector('foreignObject');
        if(existing) existing.remove();
        const fo = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
        const cx = +g.querySelector('circle').getAttribute('cx');
        const cy = +g.querySelector('circle').getAttribute('cy');
        fo.setAttribute('x', cx-26); fo.setAttribute('y', cy-26); fo.setAttribute('width', 52); fo.setAttribute('height', 52);
        const div = document.createElement('div');
        div.innerHTML = '<img src="'+data+'" style="width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.15)"/>';
        fo.appendChild(div);
        g.appendChild(fo);
      };
      reader.readAsDataURL(f);
      photoInput.value='';
    };
    photoInput.click();
  }
}

// -------- Scoreboard --------
const homePoints = document.getElementById('homePoints');
const awayPoints = document.getElementById('awayPoints');
const homeSets = document.getElementById('homeSets');
const awaySets = document.getElementById('awaySets');
const homeName = document.getElementById('homeName');
const awayName = document.getElementById('awayName');
const spectatorMode = document.getElementById('spectatorMode');
const scoreboardArea = document.getElementById('scoreboardArea');
const homeHalf = document.getElementById('homeHalf');
const awayHalf = document.getElementById('awayHalf');

function loadScore(){
  const s = JSON.parse(localStorage.getItem('scoreboard')||'{"home":0,"away":0,"homeSets":0,"awaySets":0,"homeName":"Home","awayName":"Away"}');
  homePoints.textContent = s.home; awayPoints.textContent = s.away;
  homeSets.textContent = s.homeSets; awaySets.textContent = s.awaySets;
  homeName.textContent = s.homeName || 'Home'; awayName.textContent = s.awayName || 'Away';
  spectatorMode.checked = false;
}
function saveScore(){
  const s = {home:+homePoints.textContent, away:+awayPoints.textContent, homeSets:+homeSets.textContent, awaySets:+awaySets.textContent, homeName:homeName.textContent.trim(), awayName:awayName.textContent.trim()};
  localStorage.setItem('scoreboard', JSON.stringify(s));
}

scoreboardArea.addEventListener('click', (e)=>{
  if(spectatorMode.checked) return;
  const rect = scoreboardArea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  if(x < rect.width/2){
    homePoints.textContent = +homePoints.textContent + 1;
  } else {
    awayPoints.textContent = +awayPoints.textContent + 1;
  }
  saveScore();
});

homeName.addEventListener('input', saveScore);
awayName.addEventListener('input', saveScore);

document.getElementById('resetScore').addEventListener('click', ()=>{ if(confirm('Reset score?')){ homePoints.textContent='0'; awayPoints.textContent='0'; homeSets.textContent='0'; awaySets.textContent='0'; saveScore(); }});
document.getElementById('endSet').addEventListener('click', ()=> {
  const h = +homePoints.textContent, a = +awayPoints.textContent;
  if(h===a) return alert('Tie — cannot end set');
  if(h>a) homeSets.textContent = +homeSets.textContent + 1; else awaySets.textContent = +awaySets.textContent + 1;
  homePoints.textContent='0'; awayPoints.textContent='0'; saveScore();
});

spectatorMode.addEventListener('change', ()=> {
  const read = spectatorMode.checked;
  document.querySelectorAll('#scoreboard input, #scoreboard button, .team-name').forEach(el=>{
    if(el.id==='spectatorMode') return;
    el.contentEditable = !read;
  });
});

// -------- Lineup Manager --------
const roster = JSON.parse(localStorage.getItem('roster')||'[]');
const rosterList = document.getElementById('rosterList');
const rotationList = document.getElementById('rotationList');

function renderRoster(){
  rosterList.innerHTML='';
  roster.forEach((p,idx)=>{
    const li = document.createElement('li');
    const imgHtml = p.photo? '<img src="'+p.photo+'" alt="photo"/>': '<div style="width:36px;height:36px;border-radius:50%;background:#eef2f6;display:inline-block;margin-right:8px"></div>';
    li.innerHTML = '<div style="display:flex;align-items:center;"><div>'+imgHtml+'</div><div><strong>'+p.name+'</strong><div style="font-size:12px;color:#666">#'+(p.num||'')+' • '+(p.pos||'')+'</div></div></div>' +
      '<div><button data-idx="'+idx+'" class="edit">Edit</button> <button data-idx="'+idx+'" class="remove">Remove</button></div>';
    rosterList.appendChild(li);
  });
  rosterList.querySelectorAll('.remove').forEach(b=>b.addEventListener('click', (e)=>{
    roster.splice(+e.target.dataset.idx,1); saveRoster(); renderRoster(); renderRotation();
  }));
  rosterList.querySelectorAll('.edit').forEach(b=>b.addEventListener('click', (e)=>{
    const i = +e.target.dataset.idx;
    const name = prompt('Name', roster[i].name); if(name===null) return;
    const num = prompt('Number', roster[i].num); if(num===null) return;
    const pos = prompt('Position', roster[i].pos); if(pos===null) return;
    if(confirm('Change photo?')){
      const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
      inp.onchange = function(ev){ const f=ev.target.files[0]; const r=new FileReader(); r.onload=function(evt){ roster[i].photo = evt.target.result; saveRoster(); renderRoster(); renderRotation(); }; r.readAsDataURL(f); inp.value=''; };
      inp.click();
    }
    roster[i].name = name; roster[i].num = num; roster[i].pos = pos;
    saveRoster(); renderRoster(); renderRotation();
  }));
}

function saveRoster(){ localStorage.setItem('roster', JSON.stringify(roster)); }
function loadRoster(){ renderRoster(); renderRotation(); }
loadRoster();

document.getElementById('addPlayer').addEventListener('click', ()=>{
  const name = document.getElementById('playerInput').value.trim();
  const num = document.getElementById('playerNum').value.trim();
  const pos = document.getElementById('positionSelect').value;
  if(!name) return;
  roster.push({name, num, pos, photo: ''});
  document.getElementById('playerInput').value=''; document.getElementById('playerNum').value='';
  saveRoster(); renderRoster(); renderRotation();
});

document.getElementById('presetRoster').addEventListener('change', (e)=>{
  const v = e.target.value;
  if(v==='sample1'){
    roster.splice(0, roster.length, 
      {name:'Alice', num:'3', pos:'OH', photo:''},
      {name:'Beth', num:'7', pos:'MB', photo:''},
      {name:'Cara', num:'5', pos:'Setter', photo:''},
      {name:'Dana', num:'1', pos:'Libero', photo:''},
      {name:'Erin', num:'11', pos:'OH', photo:''},
      {name:'Fay', num:'9', pos:'Opp', photo:''},
    );
    saveRoster(); renderRoster(); renderRotation();
  }
});

document.getElementById('exportRoster').addEventListener('click', ()=>{
  const data = JSON.stringify(roster, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='roster.json'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('autoRotate').addEventListener('click', ()=> renderRotation(true));

function renderRotation(generate=false){
  rotationList.innerHTML='';
  if(roster.length===0) return;
  const order = roster.map(r=>r.name);
  for(let i=0;i<6;i++){
    const li = document.createElement('li'); li.textContent = `Position ${i+1}: ${order[i % order.length] || '—'}`;
    rotationList.appendChild(li);
  }
  if(generate) alert('Rotation generated from roster order');
}

// -------- Rules & Glossary data --------
const rules = [
  {id:'libero', title:'Libero Restrictions', body:'The libero is a defensive specialist who wears a contrasting jersey. They may replace any back-row player without prior notice to the officials. They cannot attack the ball above the height of the net, block, or attempt to block.'},
  {id:'rotation', title:'Rotation Faults', body:'Players must remain in correct rotational order when the ball is served. A rotation fault occurs if a player is out of position at the time of serve. Correct serving order must be maintained.'},
  {id:'substitutions', title:'Substitutions', body:'Teams have a limited number of substitutions per set (rule dependent). Substitutions occur in the substitution zone and must be authorized by the referee.'},
  {id:'timeouts', title:'Timeouts', body:'Each team is entitled to a set number of timeouts (commonly two per set). A timeout is 30 seconds unless otherwise specified.'},
  {id:'net', title:'Net Contact', body:'It is a fault to touch the net or antenna while playing the ball. Incidental contact away from play may be allowed.'},
  {id:'serve', title:'Serve Rules', body:'The server must be completely behind the end line until the ball is contacted. A serve that touches the net and continues into the opponent\\'s court is legal (let serve).'},
  {id:'attack', title:'Attack Hit', body:'Front-row players may attack the ball at any height. Back-row players may only attack above the net if they jump from behind the attack line.'},
  {id:'block', title:'Blocking', body:'Only front-row players may participate in a block. Blocking a serve is illegal. A block does not count as one of the team\\'s three hits.'},
  {id:'ballinout', title:'Ball In/Out', body:'The ball is in if it touches any part of the boundary line. The ball is out if it lands completely outside the boundary lines, touches an antenna, or crosses the net outside the crossing space.'},
  {id:'scoring', title:'Scoring System', body:'Most competitions use rally scoring to 25 points, must win by 2. Matches are best of 5 sets, with the fifth set played to 15 points.'},
  {id:'delay', title:'Delay of Game', body:'A team that deliberately delays the game may be sanctioned with warnings or penalties. Examples include excessive time to serve or slow substitutions.'},
  {id:'footfault', title:'Foot Fault', body:'If the server steps on or over the end line before contacting the ball, a foot fault is called and the serve is lost.'},
  {id:'doublecontact', title:'Double Contact', body:'A player may not make two consecutive contacts with the ball except during a single attempt to block, or during the first contact of the team where some double contact may be allowed depending on the situation.'},
  {id:'carry', title:'Carry/Throw', body:'The ball must be hit cleanly. If the ball is caught or thrown, it is a carrying fault.'}
];

const glossary = [
  {term:'Ace', def:'A serve that results directly in a point, either untouched or unreturnable.'},
  {term:'Approach', def:'The steps a hitter takes before jumping to attack.'},
  {term:'Attack', def:'An attempt to direct the ball into the opponent\\'s court.'},
  {term:'Block', def:'A defensive play to stop or alter an opponent\\'s attack.'},
  {term:'Bump', def:'A forearm pass used to receive serves or low balls (also called passing).'},
  {term:'Dig', def:'A controlled contact following an opponent attack.'},
  {term:'Double', def:'Two consecutive contacts by the same player (illegal).'},
  {term:'Floater Serve', def:'A serve with no spin that moves unpredictably in flight.'},
  {term:'Free Ball', def:'An easily playable ball returned over the net, usually from the opponent\\'s forecourt.'},
  {term:'Kill', def:'An attack that results directly in a point.'},
  {term:'Pancake', def:'A defensive move where a player thins the hand on the floor to keep the ball alive.'},
  {term:'Rotation', def:'The order in which players rotate positions when gaining the serve.'},
  {term:'Setter', def:'The player who sets the ball for attackers, usually the team's playmaker.'},
  {term:'Side Out', def:'When the serving team loses the rally and the other team gains the right to serve.'},
  {term:'Spike', def:'A powerful downward attack.'},
  {term:'Tips/Off-speed', def:'A soft attack meant to place the ball away from blockers.'},
  {term:'Tool', def:'An attack that hits the opponent\\'s block and goes out of bounds, scoring a point.'},
  {term:'Transition', def:'The phase when a team switches from defense to offense.'},
  {term:'Wipe', def:'When a hitter uses the blocker's hands to direct the ball out of bounds.'}
];

function renderRules(filter=''){
  const container = document.getElementById('rulesList');
  container.innerHTML='';
  rules.filter(r=>r.title.toLowerCase().includes(filter) || r.body.toLowerCase().includes(filter)).forEach(r=>{
    const el = document.createElement('div'); el.className='rule';
    el.innerHTML = '<strong>'+r.title+'</strong><p>'+r.body+'</p>';
    container.appendChild(el);
  });
}
function renderGloss(filter=''){
  const container = document.getElementById('glossaryList'); container.innerHTML='';
  glossary.filter(g=>g.term.toLowerCase().includes(filter) || g.def.toLowerCase().includes(filter)).forEach(g=>{
    const el = document.createElement('div'); el.className='term';
    el.innerHTML = '<strong>'+g.term+'</strong><p>'+g.def+'</p>';
    container.appendChild(el);
  });
}
document.getElementById('ruleSearch').addEventListener('input',(e)=> renderRules(e.target.value.toLowerCase()));
document.getElementById('glossSearch').addEventListener('input',(e)=> renderGloss(e.target.value.toLowerCase()));
renderRules(); renderGloss();

// Init saved state
loadScore();
loadRoster();
refreshSavedPlays();

// --- PDF Export ---
function loadLogo(){
  return fetch('logo.svg').then(r=>r.text());
}
function exportPlaybookPDF(){
  loadLogo().then(logoSvg=>{
    const doc = new jsPDF();
    const yStart = 20;
    doc.html('<div style="text-align:center">'+logoSvg+'<h2>Playbook Export</h2></div>', {x:15,y:yStart, callback:function(){
      // Capture court SVGs as canvas
      const svg = document.getElementById('court');
      html2canvas(svg).then(canvas=>{
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData,'PNG',15,60,180,120);
        doc.save('playbook.pdf');
      });
    }});
  });
}
function exportLineupPDF(){
  loadLogo().then(logoSvg=>{
    const doc = new jsPDF();
    let html = '<div style="text-align:center">'+logoSvg+'<h2>Lineup Export</h2></div>';
    html += '<table style="width:100%;border:1px solid #000;border-collapse:collapse;"><tr><th>Name</th><th>Number</th><th>Position</th></tr>';
    JSON.parse(localStorage.getItem('roster')||'[]').forEach(p=>{
      html += '<tr><td>'+p.name+'</td><td>'+p.num+'</td><td>'+p.pos+'</td></tr>';
    });
    html += '</table>';
    doc.html(html,{x:15,y:20,callback:function(){doc.save('lineup.pdf');}});
  });
}
function exportScoreboardPDF(){
  loadLogo().then(logoSvg=>{
    const doc = new jsPDF();
    const s = JSON.parse(localStorage.getItem('scoreboard')||'{"home":"Home","away":"Away","homeSets":0,"awaySets":0,"home":0,"away":0}');
    const html = '<div style="text-align:center">'+logoSvg+'<h2>Match Summary</h2></div>'+
      '<p><strong>'+s.home+'</strong> vs <strong>'+s.away+'</strong></p>'+
      '<p>Sets: '+s.homeSets+' - '+s.awaySets+'</p>'+
      '<p>Points: '+s.home+' - '+s.away+'</p>';
    doc.html(html,{x:15,y:20,callback:function(){doc.save('match_summary.pdf');}});
  });
}
// Add export buttons dynamically
['playbook','lineup','scoreboard'].forEach(sec=>{
  const section = document.getElementById(sec);
  const btn = document.createElement('button');
  btn.style.marginTop='10px';
  if(sec==='playbook') {btn.textContent='Export Plays to PDF'; btn.onclick=exportPlaybookPDF;}
  if(sec==='lineup') {btn.textContent='Export Lineup to PDF'; btn.onclick=exportLineupPDF;}
  if(sec==='scoreboard') {btn.textContent='Export Match Summary to PDF'; btn.onclick=exportScoreboardPDF;}
  section.appendChild(btn);
});


// --- Section Navigation (fixed) ---
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const section = btn.dataset.section;
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(section).classList.add('active');
  });
});

// Home tiles also switch sections
document.querySelectorAll('.tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const section = tile.dataset.section;
    document.querySelector(`.nav-btn[data-section="${section}"]`).click();
  });
});
