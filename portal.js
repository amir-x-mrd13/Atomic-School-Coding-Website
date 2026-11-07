(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const notice = msg => { const el=$('#notice'); if(!el)return; el.textContent=msg; el.hidden=false; setTimeout(()=>el.hidden=true,4500); };
  const ready = window.SUPABASE_URL && !window.SUPABASE_URL.includes('YOUR_') && window.SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY.includes('YOUR_') && window.supabase?.createClient;
  const db = ready ? window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY) : null;
  if(!db){ notice('ابتدا URL و کلید عمومی Supabase را در فایل supabase-config.js وارد کنید.'); return; }
  const faDate = v => v ? new Date(v).toLocaleString('fa-IR') : '';
  async function rows(table, order='created_at'){ const {data,error}=await db.from(table).select('*').order(order,{ascending:false}); if(error)throw error; return data||[]; }
  async function del(table,id){const {error}=await db.from(table).delete().eq('id',id);if(error)throw error;}
  function download(name,text){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));a.href=u;a.download=name||'lesson.txt';a.click();URL.revokeObjectURL(u);}

  if(page==='student'){
    const gate=$('#nameGate'),area=$('#studentArea'),nameForm=$('#nameForm'),nameInput=$('#studentName');
    let lessons=[],tasks=[];
    async function load(){try{[lessons,tasks]=await Promise.all([rows('lessons'),rows('tasks')]);renderLessons();renderTasks();}catch(e){console.error(e);notice('خطا در دریافت اطلاعات: '+e.message);}}
    function show(){const n=localStorage.getItem('atomicStudentName');gate.hidden=!!n;area.hidden=!n;if(n){$('#helloName').textContent=n;load();}}
    nameForm.addEventListener('submit',e=>{e.preventDefault();const n=nameInput.value.trim();if(!n)return;localStorage.setItem('atomicStudentName',n);show();});
    $('#changeName').addEventListener('click',()=>{localStorage.removeItem('atomicStudentName');nameInput.value='';show();});
    function renderLessons(){ $('#lessons').innerHTML=lessons.length?lessons.map(l=>`<article class="lesson-card">${l.image_url?`<img src="${esc(l.image_url)}" alt="" style="width:100%;max-height:150px;object-fit:cover;border-radius:10px">`:''}<span class="chip">آموزش</span><h3>${esc(l.title)}</h3><p class="muted">${esc(l.description)}</p><div class="card-actions"><button class="btn primary" data-download="${esc(l.id)}">دانلود کد TXT</button><button class="btn light" data-show="${esc(l.id)}">مشاهده کد</button></div><pre class="code-preview" data-code="${esc(l.id)}" hidden>${esc(l.code)}</pre></article>`).join(''):'<p class="muted">هنوز آموزشی اضافه نشده است.</p>';
      $$('[data-download]').forEach(b=>b.onclick=()=>{const l=lessons.find(x=>x.id===b.dataset.download);if(l)download(l.filename,l.code||'');});
      $$('[data-show]').forEach(b=>b.onclick=()=>{const p=$(`[data-code="${CSS.escape(b.dataset.show)}"]`);p.hidden=!p.hidden;b.textContent=p.hidden?'مشاهده کد':'بستن کد';}); }
    function renderTasks(){ $('#tasks').innerHTML=tasks.length?tasks.map(t=>`<article class="task-card"><span class="chip">تکلیف فعال</span><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p><button class="btn primary" data-task="${esc(t.id)}">ارسال تکلیف</button></article>`).join(''):'<div class="panel"><p class="muted">فعلاً تکلیفی منتشر نشده است.</p></div>'; $$('[data-task]').forEach(b=>b.onclick=()=>openTask(b.dataset.task)); }
    function openTask(id){const t=tasks.find(x=>x.id===id);if(!t)return;$('#dialogTitle').textContent=t.title;$('#dialogDescription').textContent=t.description;$('#studentCode').value='';$('#submitDialog').dataset.taskId=id;$('#submitDialog').showModal();}
    $('#closeDialog').onclick=()=>$('#submitDialog').close();
    $('#submitForm').addEventListener('submit',async e=>{e.preventDefault();const code=$('#studentCode').value.trim(),student=localStorage.getItem('atomicStudentName'),task=tasks.find(t=>t.id===$('#submitDialog').dataset.taskId);if(!code||!student||!task)return;try{const {error}=await db.from('submissions').insert({task_id:task.id,task_title:task.title,student_name:student,code,status:'pending',note:''});if(error)throw error;$('#submitDialog').close();notice('تکلیف در دیتابیس ذخیره و برای دبیر ارسال شد.');}catch(err){notice('ارسال ناموفق بود: '+err.message);}});
    show();setInterval(()=>{if(localStorage.getItem('atomicStudentName'))load();},30000);
  }

  if(page==='teacher'){
    const gate=$('#teacherGate'),area=$('#teacherArea');
    $('#teacherLogin').addEventListener('submit',async e=>{e.preventDefault();if($('#teacherCode').value==='62458'){sessionStorage.setItem('atomicTeacherDemo','yes');gate.hidden=true;area.hidden=false;await renderAll();}else $('#loginError').hidden=false;});
    $('#teacherLogout').onclick=()=>{sessionStorage.removeItem('atomicTeacherDemo');gate.hidden=false;area.hidden=true;$('#teacherCode').value='';};
    if(sessionStorage.getItem('atomicTeacherDemo')==='yes'){gate.hidden=true;area.hidden=false;}
    $$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===b));$$('.tab-panel').forEach(p=>p.hidden=p.id!==b.dataset.tab);if(b.dataset.tab==='submissionsTab')renderSubmissions();});
    $('#lessonForm').addEventListener('submit',async e=>{e.preventDefault();const f=$('#lessonFile').files[0];if(!f)return;try{let image_url='';const img=$('#lessonImage').files[0];if(img){if(img.size>900000){notice('تصویر باید کمتر از 900 کیلوبایت باشد.');return;}image_url=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(img);});}const {error}=await db.from('lessons').insert({title:$('#lessonTitle').value.trim(),description:$('#lessonDescription').value.trim(),filename:f.name,code:await f.text(),image_url});if(error)throw error;e.target.reset();await renderLessons();notice('آموزش برای همه دانش‌آموزان منتشر شد.');}catch(err){notice('ثبت آموزش ناموفق بود: '+err.message);}});
    $('#taskForm').addEventListener('submit',async e=>{e.preventDefault();try{const {error}=await db.from('tasks').insert({title:$('#taskTitle').value.trim(),description:$('#taskDescription').value.trim()});if(error)throw error;e.target.reset();await renderTasks();notice('تکلیف برای همه دانش‌آموزان منتشر شد.');}catch(err){notice('انتشار تکلیف ناموفق بود: '+err.message);}});
    async function renderLessons(){try{const a=await rows('lessons');$('#lessonAdminList').innerHTML='<h3>آموزش‌های ثبت‌شده</h3>'+(a.length?a.map(l=>`<div class="admin-row"><div><strong>${esc(l.title)}</strong><p>${esc(l.filename)}</p></div><button class="btn light" data-del-lesson="${esc(l.id)}">حذف</button></div>`).join(''):'<p class="muted">آموزشی ثبت نشده.</p>');$$('[data-del-lesson]').forEach(b=>b.onclick=async()=>{try{await del('lessons',b.dataset.delLesson);renderLessons();}catch(e){notice(e.message);}});}catch(e){notice('خطا در دریافت آموزش‌ها: '+e.message);}}
    async function renderTasks(){try{const a=await rows('tasks');$('#taskAdminList').innerHTML='<h3>تکالیف ثبت‌شده</h3>'+(a.length?a.map(t=>`<div class="admin-row"><div><strong>${esc(t.title)}</strong><p>${esc(t.description)}</p></div><button class="btn light" data-del-task="${esc(t.id)}">حذف</button></div>`).join(''):'<p class="muted">تکلیفی ثبت نشده.</p>');$$('[data-del-task]').forEach(b=>b.onclick=async()=>{try{await del('tasks',b.dataset.delTask);renderTasks();renderSubmissions();}catch(e){notice(e.message);}});}catch(e){notice('خطا در دریافت تکالیف: '+e.message);}}
    async function renderSubmissions(){try{const {data,error}=await db.from('submissions').select('*').order('submitted_at',{ascending:false});if(error)throw error;const a=data||[];$('#submissionList').innerHTML=a.length?a.map((s,i)=>`<div class="submission-row"><div><span class="chip">ارسال ${i+1}</span><strong>${esc(s.student_name)}</strong><p>${esc(s.task_title)} · ${faDate(s.submitted_at)}</p><span class="status ${esc(s.status)}">${s.status==='approved'?'تأیید شده':s.status==='revision'?'نیاز به اصلاح':'در انتظار بررسی'}</span>${s.note?`<p>بازخورد: ${esc(s.note)}</p>`:''}</div><button class="btn primary" data-review="${esc(s.id)}">مشاهده پاسخ</button></div>`).join(''):'<p class="muted">هنوز تکلیفی ارسال نشده است.</p>';$$('[data-review]').forEach(b=>b.onclick=()=>openReview(b.dataset.review,a));}catch(e){notice('خطا در دریافت ارسال‌ها: '+e.message);}}
    function openReview(id,a){const s=a.find(x=>x.id===id);if(!s)return;$('#reviewDialog').dataset.submissionId=id;$('#reviewHeading').textContent=s.student_name+' — '+s.task_title;$('#reviewCode').textContent=s.code;$('#reviewStatus').value=s.status||'pending';$('#reviewNote').value=s.note||'';$('#reviewDialog').showModal();}
    $('#closeReview').onclick=()=>$('#reviewDialog').close();
    $('#reviewForm').addEventListener('submit',async e=>{e.preventDefault();try{const {error}=await db.from('submissions').update({status:$('#reviewStatus').value,note:$('#reviewNote').value.trim()}).eq('id',$('#reviewDialog').dataset.submissionId);if(error)throw error;$('#reviewDialog').close();renderSubmissions();notice('بازخورد دبیر ذخیره شد.');}catch(err){notice('ذخیره بازخورد ناموفق بود: '+err.message);}});
    async function renderAll(){await Promise.all([renderLessons(),renderTasks(),renderSubmissions()]);}
    if(!area.hidden)renderAll();setInterval(()=>{if(!area.hidden)renderAll();},30000);
  }
})();
