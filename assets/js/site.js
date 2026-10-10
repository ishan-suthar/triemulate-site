/* Shared page behaviour: hero entrance and the demo request form. */
(function(){
  /* reveal the hero in sequence (the head script hid it before first paint) */
  requestAnimationFrame(function(){ document.documentElement.classList.add('jgo'); });

  /* demo form: no backend, so it composes an email to the research inbox */
  var f = document.getElementById('demoform');
  if (f) f.addEventListener('submit', function(e){
    e.preventDefault();
    var name = f.elements.name, email = f.elements.email;
    var ok = true;
    [name, email].forEach(function(el){
      var bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.style.borderColor = bad ? '#E58A1F' : '';
      if (bad && ok){ el.focus(); ok = false; }
    });
    if (!ok) return;
    var body = 'Name: ' + name.value.trim() +
      '\nEmail: ' + email.value.trim() +
      '\nOrganization: ' + (f.elements.org.value.trim() || 'Not given') +
      '\n\nQuestion to emulate:\n' + (f.elements.q.value.trim() || 'To discuss');
    location.href = 'mailto:research@triemulate.com?subject=' + encodeURIComponent('TriEmulate demo request') +
      '&body=' + encodeURIComponent(body);
  });
})();

/* Watch page: chapter list seeks the video and follows playback. */
(function(){
  var v = document.getElementById('demo'), list = document.getElementById('chaps');
  if (!v || !list) return;
  var btns = [].slice.call(list.querySelectorAll('.chap'));
  var times = btns.map(function(b){ return +b.getAttribute('data-t'); });
  btns.forEach(function(b, i){
    b.addEventListener('click', function(){
      v.currentTime = times[i];
      var p = v.play(); if (p && p.catch) p.catch(function(){});
    });
  });
  function mark(){
    var t = v.currentTime, cur = 0;
    for (var i = 0; i < times.length; i++) if (t >= times[i] - 0.05) cur = i;
    btns.forEach(function(b, i){ b.classList.toggle('on', i === cur && (t > 0 || !v.paused)); });
  }
  v.addEventListener('timeupdate', mark);
  v.addEventListener('seeked', mark);
})();
