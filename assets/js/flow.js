/* Design sequence. Each stage states what it decides and what it
   constrains downstream, which is why the pipeline runs in order. */
(function(){
  var rail=document.getElementById('rail');
  if(!rail)return;

  var S=[
    {t:'Restate',
     x:'Rewrites the question in formal causal terms and classifies the clinical decision behind it. Until the question reads as a contrast between strategies over a defined period, there is nothing to design.',
     d:'The population, the strategies being compared, and the outcome.',
     c:'Which anchors are even candidates for time zero.'},
    {t:'Anchor',
     x:'Weighs candidate time zeros on whether eligibility is knowable there, whether treatment can be assigned there, and whether follow-up can begin there. The chosen anchor is explained against the ones rejected.',
     d:'The single instant at which eligibility, assignment, and follow-up align.',
     c:'What counts as baseline, and therefore what may enter the adjustment set.'},
    {t:'Specify',
     x:'Writes eligibility, exclusions, treatment strategies, and outcomes as rules a query could execute, each with an operational definition and its timing relative to time zero.',
     d:'The protocol: who is in, what is compared, what is measured.',
     c:'Whether a grace period exists, which in turn determines the estimand.'},
    {t:'Structure',
     x:'Assigns every covariate one of nine causal roles and builds an explicit graph with declared nodes and edges. The adjustment set is derived from that graph rather than asserted alongside it.',
     d:'Which variables belong in the adjustment set, and which must stay out.',
     c:'What the identifying assumptions rest on.'},
    {t:'Map',
     x:'Resolves each clinical concept to a field in your schema, with timing relative to time zero and a stated reliability. Concepts with no field behind them are reported as unresolved rather than approximated.',
     d:'Whether the design is executable against the data you hold.',
     c:'The feasibility rating, and which questions go back to the investigator.'},
    {t:'Audit',
     x:'Works through known bias mechanisms one at a time. Each gets why it could occur in this design, the choice that reduces it, what remains unresolvable, and the empirical check to run once data is extracted.',
     d:'What the design addresses and what it cannot.',
     c:'Which limitations have to appear in the write-up.'},
    {t:'Report',
     x:'Names the estimand, selects the participant-flow template, rates feasibility across data-availability dimensions, and assembles the plan against the reporting checklist with open questions listed rather than hidden.',
     d:'The estimand, the effect measure, and the reporting structure.',
     c:'What the investigator must supply before anything can be run.'},
    {t:'Hand off',
     x:'Every decision carries its provenance, so a reviewer can trace why each choice was made and disagree with it specifically rather than in general.',
     d:'Nothing. This stage exists so the previous seven can be audited.',
     c:'Your review, which is where the design is meant to end up.'}
  ];

  var i=0;
  S.forEach(function(s,k){
    var b=document.createElement('button');
    b.className='stg';b.type='button';
    b.setAttribute('aria-label','Stage '+(k+1)+': '+s.t);
    b.innerHTML='<span class="sn">'+String(k+1).padStart(2,'0')+'</span><span class="st">'+s.t+'</span>';
    b.onclick=function(){show(k)};
    rail.appendChild(b);
  });

  var btns=[].slice.call(rail.children);

  function show(k){
    i=k;
    var s=S[k];
    btns.forEach(function(b,j){
      b.classList.toggle('on',j===k);
      b.classList.toggle('done',j<k);
      b.setAttribute('aria-current',j===k?'true':'false');
    });
    document.getElementById('d-ix').textContent=String(k+1).padStart(2,'0');
    document.getElementById('d-name').textContent=s.t;
    document.getElementById('d-text').textContent=s.x;
    document.getElementById('d-dec').textContent=s.d;
    document.getElementById('d-con').textContent=s.c;
    document.getElementById('prev').disabled=k===0;
    document.getElementById('next').disabled=k===S.length-1;
  }

  document.getElementById('next').onclick=function(){if(i<S.length-1)show(i+1)};
  document.getElementById('prev').onclick=function(){if(i>0)show(i-1)};
  show(0);
})();
