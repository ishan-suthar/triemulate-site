/* Landing page: a camera journey along the eight design stages.
   Illustrative only. No data is read or computed here.
   Falls back to a static list when WebGL is missing or motion is reduced. */
(function(){
  var S = [
    {t:'Restate',   x:'Rewrites the question as a contrast between strategies over a defined period, and classifies the clinical decision behind it.', d:'the population, the strategies compared, and the outcome.'},
    {t:'Anchor',    x:'Weighs candidate time zeros on whether eligibility, assignment, and follow-up can all begin there, and explains the choice against the rejected ones.', d:'the one instant where eligibility, assignment, and follow-up align.'},
    {t:'Specify',   x:'Writes eligibility, exclusions, strategies, and outcomes as rules a query could execute, each timed relative to time zero.', d:'who is in, what is compared, and what is measured.'},
    {t:'Structure', x:'Assigns every covariate a causal role and builds an explicit graph. The adjustment set is derived from the graph, not asserted beside it.', d:'which variables enter the adjustment set, and which stay out.'},
    {t:'Map',       x:'Resolves each concept to a field in your schema, with timing and reliability. Concepts with no field behind them are reported, not approximated.', d:'whether the design is executable against the data you hold.'},
    {t:'Audit',     x:'Works through known bias mechanisms one at a time: why each could arise here, what reduces it, and what stays unresolved.', d:'what the design addresses, and what it cannot.'},
    {t:'Report',    x:'Names the estimand, rates feasibility, and assembles the plan against the reporting checklist, with open questions listed rather than hidden.', d:'the estimand, the effect measure, and the reporting structure.'},
    {t:'Hand off',  x:'Every decision carries its provenance, so a reviewer can trace why each choice was made.', d:'nothing new. This stage exists so the other seven can be audited.'}
  ];

  var fl = document.getElementById('jflist');
  if (fl) S.forEach(function(s,i){
    var li = document.createElement('li');
    li.innerHTML = '<span class="n">'+String(i+1).padStart(2,'0')+'</span><div><h3>'+s.t+'</h3><p>'+s.x+'</p></div>';
    fl.appendChild(li);
  });

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = (function(){ try{ var c=document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl')||c.getContext('experimental-webgl'))); }catch(e){ return false; } })();
  if (!gl || typeof THREE === 'undefined' || reduce){ document.documentElement.classList.add('jstatic'); return; }

  function css(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  var COL = {bg:css('--cream')||'#E3E2DE', ink:css('--jet')||'#141414', mid:css('--gray-m')||'#7A7A7A', blue:css('--cobalt')||'#1351AA'};

  var canvas = document.getElementById('jcanvas');
  var renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(COL.bg);
  scene.fog = new THREE.Fog(COL.bg, 18, 58);
  var camera = new THREE.PerspectiveCamera(46, 1, .1, 200);

  /* ---------- the route ---------- */
  var P = [];
  for (var i=0;i<8;i++) P.push(new THREE.Vector3(Math.sin(i*.95)*5.5, Math.cos(i*.7)*1.6, -i*17));
  var look = new THREE.CatmullRomCurve3(P, false, 'catmullrom', .5);
  /* the camera rides a parallel track to one side, so it never passes through a station */
  var OFF = new THREE.Vector3(6.5, 2.4, 9.5);
  var camPts = P.map(function(p){ return p.clone().add(OFF); });
  camPts.unshift(new THREE.Vector3(P[0].x + 5, P[0].y + 4.5, P[0].z + 27));
  var lookPts = P.slice(); lookPts.unshift(P[0].clone());
  var camCurve = new THREE.CatmullRomCurve3(camPts, false, 'catmullrom', .5);
  var lookCurve = new THREE.CatmullRomCurve3(lookPts, false, 'catmullrom', .5);

  var routeN = 600;
  var routeGeo = new THREE.BufferGeometry().setFromPoints(look.getSpacedPoints(routeN));
  var routeBase = new THREE.Line(routeGeo, new THREE.LineDashedMaterial({color:COL.mid, dashSize:.5, gapSize:.35, transparent:true, opacity:.55}));
  routeBase.computeLineDistances(); scene.add(routeBase);
  var routeDone = new THREE.Line(routeGeo.clone(), new THREE.LineBasicMaterial({color:COL.blue}));
  scene.add(routeDone);

  /* ---------- helpers for line-only objects ---------- */
  function mat(){ return new THREE.LineBasicMaterial({color:COL.ink, transparent:true, opacity:.35}); }
  function edges(geo){ return new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat()); }
  function seg(a,b){ return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]), mat()); }
  function rect(w,h,x,y,z){ var g=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-w/2,-h/2,0),new THREE.Vector3(w/2,-h/2,0),new THREE.Vector3(w/2,h/2,0),new THREE.Vector3(-w/2,h/2,0),new THREE.Vector3(-w/2,-h/2,0)]);
    var l=new THREE.Line(g,mat()); l.position.set(x||0,y||0,z||0); return l; }
  function circle(r,x,y){ var pts=[]; for(var k=0;k<=48;k++){var a=k/48*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0));}
    var l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat()); l.position.set(x,y,0); return l; }
  function fillSq(w,h,x,y){ var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({color:COL.blue, transparent:true, opacity:0})); m.position.set(x,y,.01); m.userData.fill=true; return m; }
  var V = function(x,y,z){ return new THREE.Vector3(x,y,z||0); };

  /* ---------- the eight stations ---------- */
  var builders = [
    function(g){ /* Restate */
      g.add(edges(new THREE.IcosahedronGeometry(2.1,0)));
      var inner = edges(new THREE.OctahedronGeometry(1.0,0)); inner.userData.spin = -1.6; g.add(inner);
    },
    function(g){ /* Anchor */
      g.add(seg(V(-4,0,0),V(4,0,0)));
      for (var k=-3;k<=3;k++) g.add(seg(V(k,-.18,0),V(k,.18,0)));
      g.add(rect(.02,3.6,0,0,0));
      var frame = rect(3.2,3.6,0,0,0); frame.rotation.y = Math.PI/2; g.add(frame);
      [-2.4,1.7,3.1].forEach(function(x){ g.add(circle(.16,x,.55)); });
    },
    function(g){ /* Specify */
      for (var k=0;k<5;k++){ var r = edges(new THREE.BoxGeometry(4.2,.5,.3)); r.position.y = 1.5 - k*.75; r.position.z = -k*.12; g.add(r); }
    },
    function(g){ /* Structure */
      var nodes = [V(-2.4,1.3,0),V(0,2,0),V(2.4,1.3,0),V(-1.8,-1.4,0),V(1.8,-1.4,0),V(0,-.1,.8)];
      nodes.forEach(function(n){ var o=edges(new THREE.OctahedronGeometry(.36,0)); o.position.copy(n); g.add(o); });
      [[0,3],[1,3],[1,4],[2,4],[0,5],[2,5],[3,4],[5,4]].forEach(function(e){ g.add(seg(nodes[e[0]],nodes[e[1]])); });
    },
    function(g){ /* Map */
      var cols=5, rows=4, w=.8, h=.6;
      for (var r=0;r<rows;r++) for (var c=0;c<cols;c++){
        var x=(c-(cols-1)/2)*w, y=((rows-1)/2-r)*h;
        g.add(rect(w,h,x,y,0));
        if ((r*cols+c)%3===1) g.add(fillSq(w*.86,h*.8,x,y));
      }
    },
    function(g){ /* Audit */
      for (var k=0;k<6;k++){
        var x=(k%3-1)*1.6, y=(k<3?.8:-.8);
        g.add(circle(.55,x,y));
        if (k===2||k===4) g.add(seg(V(x-.4,y-.4,0),V(x+.4,y+.4,0)));
      }
    },
    function(g){ /* Report */
      for (var k=0;k<21;k++){
        var x=(k%7-3)*.62, y=(1-Math.floor(k/7))*.62;
        g.add(rect(.48,.48,x,y,0));
        if (k<6 || k===9 || k===14) g.add(fillSq(.42,.42,x,y));
      }
    },
    function(g){ /* Hand off */
      g.add(rect(3,3.9,0,0,0));
      for (var k=0;k<6;k++){ var w = k%2 ? 1.6 : 2.2; g.add(seg(V(-1.15,1.3-k*.42,0),V(-1.15+w,1.3-k*.42,0))); }
      g.add(seg(V(.4,-1.35,0),V(.75,-1.65,0))); g.add(seg(V(.75,-1.65,0),V(1.3,-1.0,0)));
    }
  ];
  var stations = builders.map(function(b,i){
    var g = new THREE.Group(); b(g); g.position.copy(P[i]);
    g.rotation.y = (i%2 ? .35 : -.35); scene.add(g); return g;
  });

  /* ---------- on-load draw-in: the first station and the route draw themselves ---------- */
  var drawIn = [];
  stations[0].children.forEach(function(ch, k){
    if (!ch.geometry || !ch.geometry.attributes.position) return;
    var n = ch.geometry.attributes.position.count;
    ch.geometry.setDrawRange(0, 0);
    drawIn.push({obj:ch, n:n, from: k===0 ? .15 : .9, to: k===0 ? 1.9 : 2.3, pairs:true});
  });
  routeBase.geometry.setDrawRange(0, 0);
  drawIn.push({obj:routeBase, n:routeN+1, from:1.3, to:3.4, pairs:false});
  function runDrawIn(elapsed){
    var busy = false;
    drawIn.forEach(function(d){
      var p = Math.min(1, Math.max(0, (elapsed - d.from) / (d.to - d.from)));
      if (p < 1) busy = true;
      var c = Math.floor(d.n * p);
      if (d.pairs) c -= c % 2;
      d.obj.geometry.setDrawRange(0, p >= 1 ? Infinity : c);
    });
    return busy;
  }
  var introDone = false, introStart = performance.now();

  var dust = new THREE.BufferGeometry(), dp=[];
  for (var d=0; d<500; d++) dp.push((Math.random()-.5)*44, (Math.random()-.5)*20, 12 - Math.random()*150);
  dust.setAttribute('position', new THREE.Float32BufferAttribute(dp,3));
  var dustPts = new THREE.Points(dust, new THREE.PointsMaterial({color:COL.mid, size:.06, transparent:true, opacity:.5}));
  scene.add(dustPts);

  /* ---------- HTML overlay ---------- */
  var panel=document.getElementById('jpanel'), rail=document.getElementById('jrail'), cue=document.getElementById('jcue');
  var pix=document.getElementById('jpix'), pname=document.getElementById('jpname'), ptext=document.getElementById('jptext'), pdec=document.getElementById('jpdec');
  var railBtns = S.map(function(s,i){
    var b=document.createElement('button'); b.type='button';
    b.setAttribute('aria-label','Stage '+(i+1)+': '+s.t);
    b.innerHTML='<span>'+s.t+'</span><i></i>';
    b.onclick=function(){ scrollToStage(i); };
    rail.appendChild(b); return b;
  });

  var journey=document.getElementById('journey');
  function range(){ var top=journey.offsetTop - innerHeight*.35, end=journey.offsetTop + journey.offsetHeight - innerHeight; return [top,end]; }
  function scrollToStage(i){ var r=range(); window.scrollTo({top:r[0]+(r[1]-r[0])*((i+1)/8), behavior:'smooth'}); }

  var target=0, current=0, stage=-1, clock=new THREE.Clock(), running=true;
  function onScroll(){
    var r=range(); target=Math.min(1,Math.max(0,(scrollY-r[0])/(r[1]-r[0])));
    var inJourney = scrollY > r[0] + innerHeight*.15 && scrollY < r[1] + innerHeight*.2;
    panel.classList.toggle('on', inJourney); rail.classList.toggle('on', inJourney);
    /* stop rendering once the page has scrolled past the journey */
    running = scrollY < journey.offsetTop + journey.offsetHeight + innerHeight*.2;
  }
  function setStage(i){
    if (i===stage) return; stage=i;
    pix.textContent=String(i+1).padStart(2,'0')+' of 08'; pname.textContent=S[i].t; ptext.textContent=S[i].x; pdec.textContent=S[i].d;
    railBtns.forEach(function(b,j){ b.classList.toggle('cur',j===i); b.classList.toggle('done',j<i); });
  }
  function resize(){
    var w=innerWidth, h=innerHeight; renderer.setSize(w,h,false);
    camera.aspect=w/h; camera.fov = w<760 ? 58 : 46; camera.updateProjectionMatrix();
  }
  function tint(g, on){
    var dist = camera.position.distanceTo(g.position);
    var near = Math.min(1, Math.max(0, (dist - 3.5) / 5));
    g.visible = near > .02;
    g.traverse(function(o){
      if (!o.material || o.isPoints) return;
      if (o.userData.fill){ o.material.opacity += ((on?.9:0)*near - o.material.opacity)*.08; return; }
      o.material.color.set(on ? COL.blue : COL.ink);
      o.material.opacity += ((on ? 1 : .28)*near - o.material.opacity)*.1;
    });
  }
  function frame(){
    requestAnimationFrame(frame);
    var dt=clock.getDelta();
    if (!running) return;
    if (!introDone) introDone = !runDrawIn((performance.now() - introStart) / 1000);
    current += (target-current)*Math.min(1, dt*4.5);
    var cp=camCurve.getPoint(current), lp=lookCurve.getPoint(current);
    var narrow = innerWidth < 760;
    lp.x += narrow ? 0 : -2.6; lp.y += narrow ? -1.9 : -.5;
    camera.position.copy(cp); camera.lookAt(lp);

    var idx=Math.min(7,Math.max(0,Math.round(current*8)-1));
    setStage(idx);
    routeDone.geometry.setDrawRange(0, Math.floor(routeN * Math.min(1,Math.max(0,(current*8-1)/7))));

    stations.forEach(function(g,i){
      var on = i===idx;
      tint(g,on);
      g.rotation.y += (on ? .25 : .05)*dt;
      g.children.forEach(function(ch){ if (ch.userData.spin) ch.rotation.y += ch.userData.spin*dt; });
    });
    dustPts.rotation.y += .01*dt;
    renderer.render(scene,camera);
  }

  addEventListener('resize', function(){ resize(); onScroll(); });
  addEventListener('scroll', onScroll, {passive:true});
  /* the head script already hid the hero text; reveal it in sequence */
  setTimeout(function(){ document.documentElement.classList.add('jgo'); }, 60);
  resize(); onScroll(); setStage(0); requestAnimationFrame(frame);
})();
