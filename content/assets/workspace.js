document.querySelectorAll('[data-password-toggle]').forEach(button => button.addEventListener('click', () => {
 const input=document.getElementById(button.dataset.passwordToggle),show=input.type==='password';
 input.type=show?'text':'password';button.classList.toggle('is-visible',show);button.setAttribute('aria-pressed',String(show));button.setAttribute('aria-label',show?'Hide password':'Show password');
}));
const authorChoice=document.getElementById('author-choice');
if(authorChoice)authorChoice.addEventListener('change',()=>{const field=document.getElementById('guest-author-field');if(field){field.hidden=authorChoice.value!=='guest';field.querySelector('input').required=!field.hidden;}});
(() => {
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.closeDialog).close()));
  const categoryDialog = document.querySelector('#category-dialog');
  if(categoryDialog)document.querySelectorAll('[data-category-action]').forEach(button => button.addEventListener('click', () => {
    const form = categoryDialog.querySelector('form'), deleting = button.dataset.categoryAction === 'delete_category';
    form.reset();form.elements.action.value = button.dataset.categoryAction;form.elements.id.value = button.dataset.id;form.elements.name.value = button.dataset.name;
    document.querySelector('#category-dialog-title').textContent = deleting ? 'Delete category' : 'Edit category';
    document.querySelector('#category-name-field').hidden = deleting;form.elements.name.required = !deleting;
    document.querySelector('#category-delete-note').hidden = !deleting;
    document.querySelector('#category-delete-note').textContent = 'Delete “' + button.dataset.name + '”? ' + button.dataset.count + ' posts use this category.';
    const movePosts = deleting && Number(button.dataset.count) > 0;
    document.querySelector('#category-replacement-field').hidden = !movePosts;form.elements.replacement_id.required = movePosts;
    for(const option of form.elements.replacement_id.options)option.disabled = option.value === button.dataset.id;
    document.querySelector('#category-confirm-field').hidden = !deleting;form.elements.confirm_delete.required = deleting;
    document.querySelector('#category-submit').textContent = deleting ? 'Delete category' : 'Save category';categoryDialog.showModal();
  }));
  const deleteMediaDialog = document.querySelector('#delete-media-dialog');
  if(deleteMediaDialog)document.querySelectorAll('[data-delete-media]').forEach(button => button.addEventListener('click', () => {
    const form = deleteMediaDialog.querySelector('form');form.reset();form.elements.id.value = button.dataset.deleteMedia;
    document.querySelector('#delete-media-name').textContent = button.dataset.name;deleteMediaDialog.showModal();
  }));
  const libraryPreview = document.querySelector('#library-preview');
  if(libraryPreview) {
    document.querySelectorAll('.media-preview-button').forEach(button => button.addEventListener('click', () => {
      document.querySelector('#library-preview-title').textContent = button.dataset.name;
      const media = document.createElement(button.dataset.mime.startsWith('image/') ? 'img' : 'video');
      media.src = button.dataset.url;
      if(media.tagName === 'IMG')media.alt = button.dataset.alt || '';else {media.controls = true;media.preload = 'metadata';}
      const details=document.createElement('div');details.className='attachment-meta';
      const filename=document.createElement('h3');filename.textContent=button.dataset.name;
      const type=document.createElement('p');type.textContent='File type: '+button.dataset.mime;
      const alt=document.createElement('p');alt.textContent='Alt text: '+(button.dataset.alt || 'Not provided');
      const link=document.createElement('a');link.href=button.dataset.url;link.target='_blank';link.rel='noopener';link.textContent='Open original file';
      details.append(filename,type,alt,link);const layout=document.createElement('div');layout.className='media-details';layout.append(media,details);
      document.querySelector('#library-preview-content').replaceChildren(layout);libraryPreview.showModal();
    }));
    document.querySelector('#close-library-preview').addEventListener('click', () => libraryPreview.close());
    libraryPreview.addEventListener('close', () => document.querySelector('#library-preview-content').replaceChildren());
  }
  const form = document.querySelector('#post-form');
  if (!form) return;
  let dirty = false;
  const state = document.querySelector('#save-state');
  const markDirty = () => { dirty = true; state.textContent = 'Unsaved changes'; };
  form.addEventListener('input', markDirty);
  const body = document.querySelector('#body');
  const editor = window.Jodit ? Jodit.make(body, {
    height: 480, style: {fontFamily: 'Inter, sans-serif', fontSize:'16px'}, uploader: {insertImageAsBase64URI: false},
    buttons: ['undo','redo','|','paragraph','bold','italic','ul','ol','|','link','mediaLibrary','table','video','hr','|','source','fullsize'],
    buttonsMD: ['undo','redo','paragraph','bold','italic','ul','ol','link','mediaLibrary','table','video','source'],
    buttonsSM: ['undo','redo','paragraph','bold','italic','ul','ol','link','mediaLibrary','table','video','source','fullsize'],
    buttonsXS: ['undo','redo','paragraph','bold','italic','ul','ol','link','mediaLibrary','table','video','source','fullsize'],
    enter: 'p', askBeforePasteHTML: true, askBeforePasteFromWord: true,
    disablePlugins: ['file','image','imageProcessor','imageProperties','dragAndDropFile','dragAndDrop'],
    events: {change: markDirty},
    controls: {mediaLibrary: {name:'mediaLibrary',tooltip:'Insert image or video',icon:'image',exec:()=>openPicker('article')},paragraph: {list: {p:'Normal',h2:'Heading 2',h3:'Heading 3',h4:'Heading 4',blockquote:'Quote',pre:'Code block'}}}
  }) : null;
  form.addEventListener('submit', () => { if(editor) body.value = editor.value; dirty = false; });
  window.addEventListener('beforeunload', event => { if(dirty) { event.preventDefault(); event.returnValue = ''; } });
  const title = form.elements.title, slug = form.elements.slug;
  let manualSlug = Boolean(slug.value);
  slug.addEventListener('input', () => {manualSlug = true;});
  title.addEventListener('input', () => { if(!slug.readOnly && !manualSlug) slug.value = title.value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,160); });
  const featured = document.querySelector('#featured-media');
  const preview = document.querySelector('#featured-preview');
  const dialog = document.querySelector('#media-picker');
  const grid = document.querySelector('#picker-grid');
  const search = document.querySelector('#media-search');
  const upload = document.querySelector('#picker-upload');
  const message = document.querySelector('#picker-message');
  const use = document.querySelector('#use-media');
  let items = JSON.parse(document.querySelector('#media-data').textContent);
  let mode = 'article', selected = null, savedSelection = false, uploading = false;
  function render() {
    grid.replaceChildren();
    const matches = items.filter(item => (mode !== 'featured' || item.mime.startsWith('image/')) && (item.original_name + ' ' + item.alt).toLowerCase().includes(search.value.toLowerCase()));
    for (const item of matches) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'picker-item';
      button.setAttribute('aria-pressed', String(selected?.id === item.id));
      const thumb = document.createElement(item.mime.startsWith('image/') ? 'img' : 'video');
      thumb.src = item.url;
      if (thumb.tagName === 'IMG') {thumb.alt = ''; thumb.loading = 'lazy';} else {thumb.preload = 'metadata'; thumb.muted = true;}
      const name = document.createElement('span'); name.textContent = item.original_name;
      button.append(thumb, name);button.title = item.original_name;
      button.addEventListener('click', () => {selected = item; render(); buttonFor(item.id)?.focus();});
      button.dataset.id = item.id; grid.append(button);
    }
    if (!matches.length) {const empty = document.createElement('p');empty.className = 'muted';empty.textContent = 'No matching files. Upload an image to get started.';grid.append(empty);}
    document.querySelector('#picker-selection').textContent = selected?.original_name || 'No file selected';
    use.disabled = !selected || uploading;
  }
  function buttonFor(id) {return [...grid.children].find(el => el.dataset.id === String(id));}
  function openPicker(target) {
    mode = target; selected = null; search.value = ''; message.textContent = ''; upload.hidden = true;
    if(mode === 'article' && editor) {editor.selection.save(); savedSelection = true;}
    upload.elements.file.accept = mode === 'featured' ? 'image/jpeg,image/png,image/gif,image/webp' : 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm';
    document.querySelector('#media-picker-title').textContent = mode === 'featured' ? 'Choose featured image' : 'Insert image or video';
    if(mode === 'featured') selected = items.find(item => String(item.id) === featured.value) || null;
    render(); dialog.showModal();
  }
  document.querySelectorAll('[data-open-media]').forEach(button => button.addEventListener('click', () => openPicker(button.dataset.openMedia)));
  document.querySelector('#close-picker').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {if(savedSelection && editor) {editor.selection.restore();savedSelection = false;}});
  search.addEventListener('input', render);
  document.querySelector('#show-upload').addEventListener('click', () => {upload.hidden = !upload.hidden;if(!upload.hidden)upload.elements.file.focus();});
  document.querySelector('#remove-featured').addEventListener('click', () => {featured.value = '';preview.src = '/logo/og-image.png';markDirty();});
  use.addEventListener('click', () => {
    if(!selected) return;
    if(mode === 'featured') {featured.value = selected.id;preview.src = selected.url;}
    else {
      const media = document.createElement(selected.mime.startsWith('image/') ? 'img' : 'video');media.src = selected.url;
      if(media.tagName === 'IMG')media.alt = selected.alt || '';else {media.controls = true;media.preload = 'metadata';}
      if(editor){editor.selection.restore();savedSelection = false;editor.selection.insertHTML(media.outerHTML + '<p><br></p>');}
      else body.value += media.outerHTML;
    }
    markDirty();dialog.close();
  });
  upload.addEventListener('submit', async event => {
    event.preventDefault(); if(uploading)return;
    uploading = true; const submit = upload.querySelector('[type=submit]');submit.disabled = true;use.disabled = true;message.textContent = 'Uploading…';
    try {
      const response = await fetch('/content/media', {method:'POST',body:new FormData(upload),headers:{Accept:'application/json'}});
      const type = response.headers.get('content-type') || '';
      if(!type.includes('application/json'))throw new Error('Upload could not finish. Your session may have expired or the file may exceed your server’s limit. Save a copy of your text before signing in again.');
      const data = await response.json();if(!response.ok || !data.media)throw new Error(data.error || 'Upload failed. Please try again.');
      items.unshift(data.media);selected = data.media;search.value = '';upload.reset();upload.hidden = true;message.textContent = 'Uploaded. Choose “Use selected media” to add it.';
    } catch(error) {message.textContent = error.message;}
    finally {uploading = false;submit.disabled = false;render();}
  });
})();
