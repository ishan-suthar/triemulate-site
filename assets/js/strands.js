/* Confounded population separating into two arms.
   Illustrative only. No data is read or computed here. */
(function(){
  var cv=document.getElementById('stage');
  if(!cv)return;
  var ctx=cv.getContext('2d');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var GLYPHS=['\u22A5','\u22A5','\u03B2','\u03C3','\u00B1','\u2260','\u03BB','\u2211','\u03B8','t\u2080','HR','95% CI','ATE','age','creatinine','lactate','severity','baseline_egfr','comorbidity'];
  var COLORS={ink:'#141414',blue:'#1351AA'};
  var sprites={};

  function buildSprites(dpr){
    sprites={};
    for(var k in COLORS){
      sprites[k]={};
      for(var i=0;i<GLYPHS.length;i++){
        var g=GLYPHS[i];
        var c=document.createElement('canvas'),x=c.getContext('2d');
        x.font='700 9px "JetBrains Mono", monospace';
        var w=Math.ceil(x.measureText(g).width)+4;
        c.width=w*dpr;c.height=14*dpr;x.scale(dpr,dpr);
        x.font='700 9px "JetBrains Mono", monospace';
        x.fillStyle=COLORS[k];x.textBaseline='middle';x.fillText(g,2,7);
        sprites[k][g]={c:c,w:w,h:14};
      }
    }
  }

  var N=52,SEG=18,GRAV=.30,DAMP=.984,ITER=4;
  var W=0,H=0,nodeY=0,nodeX=0,strands=[],dpr=1,adjusted=false,assumeAlpha=0;
  var mouse={x:-9999,y:-9999};
  var ASSUMPTIONS=['EXCHANGEABILITY','CONSISTENCY','POSITIVITY'];

  function rand(s){var v=s;return function(){v=v*16807%2147483647;return v/2147483647}}

  function build(){
    var r=rand(31);strands=[];
    var w=Math.min(W*.42,360),left=nodeX-w/2;
    for(var i=0;i<N;i++){
      var t=i/(N-1),ax=left+w*t;
      var len=(H-nodeY)*(.40+.50*Math.sin(Math.PI*t)+.10*r());
      var rest=len/SEG,pts=[],marks=[];
      for(var j=0;j<=SEG;j++){
        pts.push({x:ax,y:nodeY+j*rest,ox:ax,oy:nodeY+j*rest});
        marks.push(GLYPHS[Math.floor(r()*GLYPHS.length)]);
      }
      strands.push({pts:pts,rest:rest,home:ax,arm:i%2,t:t,marks:marks,tx:ax});
    }
    layout();
  }

  function layout(){
    var gap=Math.min(W*.20,190);
    for(var i=0;i<strands.length;i++){
      var s=strands[i];
      if(adjusted){
        var side=s.arm?1:-1;
        var within=(s.t*2%1)-.5;
        s.tx=nodeX+side*gap+within*70;
      } else s.tx=s.home;
    }
  }

  function step(time){
    assumeAlpha+=((adjusted?1:0)-assumeAlpha)*.06;
    var wind=reduce?0:Math.sin(time/1500)*.09+Math.sin(time/460)*.025;
    for(var i=0;i<strands.length;i++){
      var s=strands[i];
      for(var j=1;j<s.pts.length;j++){
        var p=s.pts[j];
        var vx=(p.x-p.ox)*DAMP,vy=(p.y-p.oy)*DAMP;
        p.ox=p.x;p.oy=p.y;
        p.x+=vx+(adjusted?0:wind*(j/SEG));
        p.y+=vy+(adjusted?GRAV*.5:GRAV);
        if(adjusted){
          var ty=nodeY+j*s.rest*.86;
          p.x+=(s.tx-p.x)*.10;p.y+=(ty-p.y)*.10;
        }
        var dx=p.x-mouse.x,dy=p.y-mouse.y,d2=dx*dx+dy*dy;
        if(!adjusted&&d2<2200&&d2>.01){
          var f=(1-d2/2200)*3/Math.sqrt(d2);
          p.x+=dx*f;p.y+=dy*f;
        }
      }
      var ax=adjusted?s.tx:s.home;
      for(var k=0;k<ITER;k++){
        s.pts[0].x+=(ax-s.pts[0].x)*.2;s.pts[0].y=nodeY;
        for(var m=0;m<s.pts.length-1;m++){
          var a=s.pts[m],b=s.pts[m+1];
          var ddx=b.x-a.x,ddy=b.y-a.y,d=Math.hypot(ddx,ddy)||1e-4;
          var diff=(d-s.rest)/d*.5,ox=ddx*diff,oy=ddy*diff;
          if(m>0){a.x+=ox;a.y+=oy}
          b.x-=ox;b.y-=oy;
        }
      }
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.setLineDash([4,3]);
    ctx.strokeStyle=adjusted?'#1351AA':'#7A7A7A';ctx.lineWidth=1;
    var bw=150,bh=32;
    ctx.strokeRect(nodeX-bw/2,nodeY-bh,bw,bh);
    ctx.setLineDash([]);
    ctx.fillStyle=adjusted?'#1351AA':'#444343';
    ctx.font='700 10px "JetBrains Mono", monospace';ctx.textAlign='center';
    ctx.fillText('TARGET TRIAL',nodeX,nodeY-bh/2+4);
    if(adjusted){
      ctx.font='700 9px "JetBrains Mono", monospace';
      var gap=Math.min(W*.20,190);
      ctx.fillText('EARLY',nodeX-gap,nodeY+18);
      ctx.fillText('DELAYED',nodeX+gap,nodeY+18);
    }
    for(var i=0;i<strands.length;i++){
      var s=strands[i];
      var bank=adjusted?sprites.blue:sprites.ink;
      for(var j=1;j<s.pts.length;j++){
        var p=s.pts[j],sp=bank[s.marks[j]];
        if(!sp)continue;
        ctx.globalAlpha=(adjusted?.32:.20)+.55*(1-j/SEG);
        ctx.drawImage(sp.c,p.x-sp.w/2,p.y-7,sp.w,sp.h);
      }
    }
    ctx.globalAlpha=1;
    if(assumeAlpha>.02){
      var midY=nodeY+(H-nodeY)*.42;
      ctx.globalAlpha=Math.min(1,assumeAlpha);
      ctx.textAlign='center';
      ctx.font='700 11px "JetBrains Mono", monospace';
      ctx.fillStyle='#1351AA';
      for(var q=0;q<ASSUMPTIONS.length;q++)ctx.fillText(ASSUMPTIONS[q],nodeX,midY+q*30);
      ctx.strokeStyle='#1351AA';ctx.lineWidth=1;
      ctx.globalAlpha=Math.min(.5,assumeAlpha*.5);
      ctx.beginPath();ctx.moveTo(nodeX-58,midY-24);ctx.lineTo(nodeX+58,midY-24);ctx.stroke();
      ctx.beginPath();ctx.moveTo(nodeX-58,midY+72);ctx.lineTo(nodeX+58,midY+72);ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.textAlign='start';
  }

  function resize(){
    var r=cv.getBoundingClientRect();W=r.width;H=r.height;
    dpr=Math.min(window.devicePixelRatio||1,2);
    cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    nodeY=Math.round(H*.16);nodeX=Math.round(W*.5);
    buildSprites(dpr);build();
  }

  var last=0;
  function loop(t){if(t-last>12){step(t);draw();last=t}requestAnimationFrame(loop)}

  function setPaths(n){
    var el=document.getElementById('paths');
    el.textContent=n;
    el.classList.toggle('closed',n===0);
  }

  document.getElementById('run').onclick=function(){
    adjusted=true;layout();
    var n=11;
    var iv=setInterval(function(){n--;setPaths(n);if(n<=0)clearInterval(iv)},110);
  };
  document.getElementById('reset').onclick=function(){
    adjusted=false;layout();setPaths(11);
  };

  window.addEventListener('resize',resize);
  cv.addEventListener('pointermove',function(e){
    var r=cv.getBoundingClientRect();
    mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;
  });
  cv.addEventListener('pointerleave',function(){mouse.x=mouse.y=-9999});

  resize();requestAnimationFrame(loop);
})();
