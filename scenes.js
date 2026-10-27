/* Scènes fictives en 3D. Three.js est chargé uniquement quand la personne le demande. */
(() => {
  const host = document.getElementById('scene-3d');
  const status = document.getElementById('scene-status');
  const play = document.getElementById('scene-play');
  const restart = document.getElementById('scene-restart');
  const caption = document.getElementById('scene-caption');
  let T, renderer, scene, camera, people = [], kind = 'individual';
  let running = false, elapsed = 0, last = null, frame = 0, loading = false;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mat = color => new T.MeshStandardMaterial({ color, roughness: .8 });
  function box(w,h,d,color,x,y,z,parent=scene) {
    const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function round(radius,color,x,y,z,parent=scene) {
    const mesh=new T.Mesh(new T.SphereGeometry(radius,20,14),mat(color));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function chair(x,z,angle=0) {
    const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);
    box(.8,.12,.7,'#b9876d',0,.53,0,g);box(.8,.75,.1,'#c79a7e',0,.96,-.31,g);
    for(const px of [-.31,.31])for(const pz of [-.24,.24]) box(.07,.52,.07,'#8a715e',px,.26,pz,g);
    return g;
  }
  function speechIcon(label,color) {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
    const c=canvas.getContext('2d');c.fillStyle='rgba(255,255,255,.96)';c.beginPath();c.roundRect(10,10,236,90,28);c.fill();c.beginPath();c.moveTo(80,100);c.lineTo(102,119);c.lineTo(118,100);c.fill();c.fillStyle=color;c.font='bold 44px system-ui';c.textAlign='center';c.fillText(label,128,71);
    const texture=new T.CanvasTexture(canvas);const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));sprite.scale.set(1.0,.5,1);sprite.position.set(0,1.75,0);sprite.visible=false;return sprite;
  }
  function person(color,skin,x,z,rotation=0,seated=false){
    const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);
    const torso=box(.48,.54,.3,color,0,seated?.95:1.12,0,g);
    const head=round(.22,skin,0,seated?1.47:1.65,0,g);
    const hair=round(.22,'#61564e',0,seated?1.57:1.75,-.055,g);hair.scale.set(1,.55,.9);
    const armL=box(.12,.44,.13,color,-.31,seated?.98:1.1,0,g);const armR=box(.12,.44,.13,color,.31,seated?.98:1.1,0,g);
    const legL=box(.16,seated?.45:.55,.18,'#71817a',-.13,seated?.28:.3,seated?.17:0,g);const legR=box(.16,seated?.45:.55,.18,'#71817a',.13,seated?.28:.3,seated?.17:0,g);
    if(seated){legL.rotation.x=-.15;legR.rotation.x=-.15}
    const talk=speechIcon('•••','#4b886a');talk.position.y=seated?1.96:2.12;g.add(talk);const react=speechIcon('✓','#ad7e63');react.position.y=seated?1.96:2.12;g.add(react);
    const p={g,head,armL,armR,legL,legR,talk,react,baseY:head.position.y};people.push(p);return p;
  }
  function plant(x,z){box(.42,.5,.42,'#c79072',x,.25,z);round(.42,'#83ab86',x,.9,z);round(.32,'#6d9c76',x+.25,1.05,z)}
  function room(){
    box(8,.12,6.2,'#dce9d7',0,-.07,0);box(8,3.3,.12,'#f8f7ef',0,1.64,-3);box(.12,3.3,6.2,'#f2f5eb',-4,1.64,0);
    box(1.4,2.4,.1,'#b8cbb9',-2.9,1.2,-2.9);box(.07,.07,.07,'#d8ab74',-2.43,1.15,-2.82);
    box(1.65,1.12,.08,'#c0d7d2',1.65,2.05,-2.91);box(.07,1.13,.12,'#fffaf0',1.65,2.05,-2.84);box(1.65,.07,.12,'#fffaf0',1.65,2.05,-2.84);
    box(1.05,.8,.08,'#d1b9a3',-.65,2.1,-2.9);box(.87,.62,.09,'#e8e9d2',-.65,2.1,-2.83);plant(3.05,-2.3);plant(-3.4,1.9);
    box(1.6,.72,.42,'#d1bd9f',3,.37,-2.55);for(let i=0;i<4;i++)box(.15,.45,.22,['#b87d76','#7d9988','#e7c988','#b89aaf'][i],2.5+i*.2,.87,-2.5);
  }
  function build(){
    people=[];scene=new T.Scene();scene.background=new T.Color('#e9f1e6');camera=new T.PerspectiveCamera(36,1,.1,100);camera.position.set(6.5,5.7,9.3);camera.lookAt(0,.9,0);
    scene.add(new T.HemisphereLight('#ffffff','#aec6aa',2));const light=new T.DirectionalLight('#ffffff',2.2);light.position.set(3,8,6);scene.add(light);room();
    if(kind==='individual'){
      box(1.8,.13,1,'#d8b89b',.1,.79,-.3);for(const x of [-.65,.85])for(const z of [-.65,.05])box(.1,.76,.1,'#ad917d',x,.38,z);
      box(.45,.04,.3,'#f9f6ee',.05,.88,-.2);box(.22,.03,.15,'#8aa599',.5,.88,-.38);
      chair(.2,1.15,Math.PI);chair(.3,-1.5,0);person('#a57969','#e4bb9c',-2.8,-1.8,Math.PI/2,false);person('#799c88','#d2a184',.3,-1.5,0,true);
      caption.textContent='La personne arrive pour son rendez-vous.';
    }else{
      const colors=['#819d8e','#c38d76','#a294a5','#cfad78','#809eb5'];
      for(let i=0;i<5;i++){let a=i*Math.PI*2/5;let x=Math.sin(a)*1.8,z=Math.cos(a)*1.45;chair(x,z,a+Math.PI);person(colors[i],i%2?'#d1a384':'#e4bf9f',x,z,a+Math.PI,true)}
      caption.textContent='Le groupe s’installe pour échanger.';
    }
    elapsed=0;resize();render();
  }
  function resize(){if(!renderer)return;const width=Math.max(200,host.clientWidth),height=Math.max(260,Math.min(460,width*.65));renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(width,height,false);renderer.domElement.style.height=height+'px';camera.aspect=width/height;camera.updateProjectionMatrix()}
  function resetPose(p){p.armL.rotation.z=0;p.armR.rotation.z=0;p.head.rotation.z=0;p.head.rotation.x=0;p.talk.visible=false;p.react.visible=false}
  function render(){
    if(!renderer||!scene)return;people.forEach(resetPose);
    if(kind==='individual'){
      const visitor=people[0],advisor=people[1];const phase=elapsed%12;
      if(phase<2){const progress=phase/2;visitor.g.position.set(-2.8+progress*2.9,0,-1.8+progress*2.65);visitor.g.rotation.y=Math.PI/2;visitor.legL.rotation.x=Math.sin(phase*11)*.45;visitor.legR.rotation.x=-visitor.legL.rotation.x;caption.textContent='La personne arrive et la conseillère l’accueille.';advisor.armR.rotation.z=-.6}
      else{visitor.g.position.set(.1,.12,.95);visitor.g.rotation.y=Math.PI;visitor.legL.rotation.x=visitor.legR.rotation.x=0;visitor.g.scale.y=.82;
        const speaker=phase<6?advisor:visitor,listener=phase<6?visitor:advisor;speaker.talk.visible=true;speaker.armR.rotation.z=Math.sin(phase*5)*.35-.3;listener.head.rotation.z=Math.sin(phase*3)*.12;caption.textContent=phase<6?'La conseillère présente le rendez-vous.':'La personne partage ce qu’elle souhaite.'}
      if(phase<2)visitor.g.scale.y=1;
    }else{
      const phase=elapsed%15,speaker=Math.floor(phase/3)%people.length;
      people.forEach((p,i)=>{if(i===speaker){p.talk.visible=true;p.armR.rotation.z=-.5+Math.sin(elapsed*5)*.25;p.head.rotation.z=Math.sin(elapsed*3)*.08}else{p.head.rotation.z=Math.sin(elapsed*2+i)*.1;if((i+speaker)%3===0&&phase%3>1)p.react.visible=true}});
      caption.textContent='Une personne prend la parole ; les autres écoutent et réagissent.';
    }
    renderer.render(scene,camera);
  }
  function tick(now){if(!running)return;if(last!==null)elapsed+=Math.min((now-last)/1000,.1);last=now;render();frame=requestAnimationFrame(tick)}
  function pause(){running=false;last=null;cancelAnimationFrame(frame);play.textContent='Reprendre la scène'}
  async function start(){if(loading)return;if(!T){loading=true;status.hidden=false;status.textContent='Chargement de la scène 3D…';try{T=await import('https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js');renderer=new T.WebGLRenderer({antialias:true});host.appendChild(renderer.domElement);build();restart.disabled=false;status.hidden=true}catch(error){T=undefined;renderer=undefined;status.hidden=false;status.textContent='Impossible de charger la scène 3D. Vérifie ta connexion ou essaie un navigateur compatible WebGL.';loading=false;return}loading=false}if(running){pause();return}running=true;last=null;play.textContent='Mettre en pause';frame=requestAnimationFrame(tick)}
  play.addEventListener('click',start);restart.addEventListener('click',()=>{elapsed=0;last=null;render()});
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
    kind=button.dataset.scene;document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    document.getElementById('scene-title').textContent=kind==='individual'?'Un rendez-vous individuel':'Un groupe de discussion';
    document.getElementById('scene-desc').textContent=kind==='individual'?'Une personne arrive, rencontre une conseillère et échange à son rythme.':'Plusieurs personnes se retrouvent en cercle pour partager leurs expériences, si elles le souhaitent.';
    const steps=kind==='individual'?['Accueil et présentation','Un temps pour poser ses questions','Un échange adapté à ses besoins']:['Accueil et présentation du groupe','Chacun parle s’il le souhaite','Écoute et réactions respectueuses'];
    document.getElementById('scene-steps').replaceChildren(...steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li}));
    if(T)build();else caption.textContent=kind==='individual'?'Un premier échange, en toute simplicité.':'Un petit groupe se retrouve pour échanger.';
  }));
  window.addEventListener('resize',()=>{if(T){resize();render()}});document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pause()});document.querySelectorAll('[data-view],[data-go]').forEach(b=>b.addEventListener('click',()=>{if(document.getElementById('exemples-rdv').hidden&&running)pause()}));
  if(reduced)status.textContent='Animation facultative : choisis « Lancer la scène » pour la démarrer.';
})();
