/* Eligibility attrition. Illustrative figures only —
   no dataset is read and no cohort is constructed here. */
(function(){
  var cc=document.getElementById('cohort');
  if(!cc)return;
  var cx=cc.getContext('2d');
  var TOTAL=61532,CUTS=[12410,38207,6842,2133];
  var M=['\u00b7','\u00b7','\u00b7','\u00b7','\u00b7','\u00b7','+','\u00d7','\u25e6'];
  var CW=0,CH=0,dpr=1,dots=[],stage=0;
  var crits=[].slice.call(document.querySelectorAll('#crits .crit'));

  function rnd(s){var v=s;return function(){v=v*16807%2147483647;return v/2147483647}}

  function build(){
    var r=rnd(97);dots=[];
    var n=760,share=CUTS.map(function(c){return c/TOTAL});
    for(var i=0;i<n;i++){
      var u=r(),cutAt=null,acc=0;
      for(var k=0;k<share.length;k++){acc+=share[k];if(u<acc){cutAt=k;break}}
      dots.push({
        x:14+r()*(CW-28),
        y:12+r()*(CH-24),
        m:M[Math.floor(r()*M.length)],
        cutAt:cutAt
      });
    }
  }

  function paint(){
    cx.clearRect(0,0,CW,CH);
    cx.font='700 10px "JetBrains Mono", monospace';
    cx.textAlign='center';cx.textBaseline='middle';
    for(var i=0;i<dots.length;i++){
      var d=dots[i];
      var gone=d.cutAt!==null&&d.cutAt<stage;
      cx.globalAlpha=gone?.16:.72;
      cx.fillStyle=gone?'#7A7A7A':'#1351AA';
      cx.fillText(d.m,d.x,d.y);
    }
    cx.globalAlpha=1;cx.textAlign='start';cx.textBaseline='alphabetic';
  }

  function counts(){
    var out=0;
    for(var k=0;k<stage;k++)out+=CUTS[k];
    document.getElementById('c-out').textContent=out.toLocaleString();
    document.getElementById('c-in').textContent=(TOTAL-out).toLocaleString();
    document.getElementById('cstatus').textContent=stage+' of 4 applied \u00b7 Illustrative';
    crits.forEach(function(el,i){el.classList.toggle('on',i<stage)});
    document.getElementById('cut').disabled=stage>=4;
  }

  function resize(){
    var r=cc.getBoundingClientRect();CW=r.width;CH=r.height;
    dpr=Math.min(window.devicePixelRatio||1,2);
    cc.width=CW*dpr;cc.height=CH*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
    build();paint();
  }

  document.getElementById('cut').onclick=function(){if(stage<4){stage++;counts();paint()}};
  document.getElementById('creset').onclick=function(){stage=0;counts();paint()};
  window.addEventListener('resize',resize);
  resize();counts();
})();
