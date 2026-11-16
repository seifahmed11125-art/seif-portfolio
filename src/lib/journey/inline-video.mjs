export function createVideoMarkup(doc,project){
  const container=doc.createElement('div');
  container.className='project-media inline-video';container.dataset.videoProject=project.id;
  container.style.setProperty('--media-aspect','16 / 9');
  const video=doc.createElement('video');
  video.className='inline-video-player';video.dataset.inlinePlayer='';
  video.playsInline=true;video.setAttribute('playsinline','');video.preload='none';video.hidden=true;
  video.poster=project.cover;video.setAttribute('aria-label',project.title);
  const button=doc.createElement('button');button.className='inline-video-trigger';button.type='button';
  button.dataset.playVideo=project.id;button.setAttribute('aria-label','Play '+project.title);
  const cover=doc.createElement('img');cover.src=project.cover;cover.alt=project.title;
  cover.width=640;cover.height=360;cover.loading='lazy';cover.decoding='async';cover.draggable=false;
  const icon=doc.createElement('span');icon.className='project-play';icon.textContent='▶';icon.setAttribute('aria-hidden','true');
  button.append(cover,icon);
  const error=doc.createElement('p');error.className='inline-video-error';error.setAttribute('role','status');
  error.textContent='Could not play this video. Try again.';error.hidden=true;
  container.append(video,button,error);return container;
}

export function createInlinePlayers(root){
  let disposed=false;
  const generations=new WeakMap();
  function fail(video){
    if(disposed||!root.contains(video))return;
    const container=video.closest('[data-video-project]');
    if(!container)return;
    video.hidden=true;video.controls=false;container.classList.remove('is-playing');
    container.querySelector('[data-play-video]').hidden=false;
    container.querySelector('.inline-video-error').hidden=false;
  }
  function pauseAll(except=null,release=false){
    root.querySelectorAll('video[data-inline-player]').forEach(video=>{
      if(video===except)return;
      generations.set(video,(generations.get(video)||0)+1);video.pause();
      if(release){video.removeAttribute('src');video.load();}
    });
  }
  async function play(container,source){
    const video=container?.querySelector('video[data-inline-player]');
    if(disposed||!video||!source)return false;
    let url;
    try{url=new URL(source);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)return false;}catch{return false;}
    pauseAll(video);
    const generation=(generations.get(video)||0)+1;generations.set(video,generation);
    if(video.getAttribute('src')!==url.href||video.error)video.src=url.href;
    video.hidden=false;video.controls=true;video.playsInline=true;
    container.classList.add('is-playing');container.querySelector('[data-play-video]').hidden=true;
    container.querySelector('.inline-video-error').hidden=true;
    try{
      // Invoke play in the original click/keyboard gesture, before any await.
      await video.play();return true;
    }catch(error){
      if(!disposed&&generations.get(video)===generation&&error?.name!=='AbortError')fail(video);
      return false;
    }
  }
  function onError(event){if(event.target?.matches?.('video[data-inline-player]'))fail(event.target);}
  function onPlay(event){if(event.target?.matches?.('video[data-inline-player]'))pauseAll(event.target);}
  root.addEventListener('error',onError,true);
  root.addEventListener('play',onPlay,true);
  return {play,pauseAll,releaseAll:()=>pauseAll(null,true),destroy(){disposed=true;pauseAll(null,true);root.removeEventListener('error',onError,true);root.removeEventListener('play',onPlay,true);}};
}
