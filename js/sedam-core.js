/*=========================================================
001 SEDAM CORE DOMCONTENTLOADED
=========================================================*/
document.addEventListener("DOMContentLoaded",()=>{
document.getElementById('dataInicio').value='2025-01-01'
document.getElementById('dataFim').value='2028-01-01'
document.body.classList.add("login-bg")
localStorage.removeItem('uid')
let userLocal=localStorage.getItem('user')
if(userLocal){
try{
let perfil=JSON.parse(userLocal)
if(perfil&&perfil.username){
window.userP=perfil
userP=perfil
document.body.classList.remove('login-bg')
document.getElementById('login-screen').classList.add('hidden')
document.getElementById('dashboard').classList.remove('hidden')
document.getElementById('user-info').innerHTML=(perfil.nome_completo||'-')+' • '+(perfil.cargo||'-')+' • '+(perfil.origem||'-')
switchTab(localStorage.getItem('activeTab')||'resumo')
carregarDados()
return
}
}catch(e){
console.log(e)
localStorage.removeItem('user')
}
}
const lastTab=localStorage.getItem('activeTab')
if(lastTab){
switchTab(lastTab)
}
})
/*=========================================================
002 SEDAM CORE FUNCTION LOGIN
=========================================================*/
async function login(){
let usuario=document.getElementById('u').value.trim().toLowerCase()
let senha=document.getElementById('p').value.trim()
if(!usuario||!senha){
alert('Informe usuário e senha')
return
}
let perfil=null
let {data:p1}=await client.from('perfistce').select('*').eq('username',usuario).eq('senha',senha).limit(1)
if(p1&&p1.length){
perfil=p1[0]
perfil.origem='TCERO'
}else{
let {data:p2}=await client.from('perfis').select('*').eq('username',usuario).limit(1)
if(p2&&p2.length){
perfil=p2[0]
perfil.origem='SEDAM'
if(perfil.senha&&String(perfil.senha)!==String(senha)){
alert('Senha inválida')
return
}
}
}
if(!perfil){
alert('Usuário não encontrado')
return
}
window.userP=perfil
userP=perfil
localStorage.setItem('user',JSON.stringify(perfil))
document.body.classList.remove('login-bg')
document.getElementById('login-screen').classList.add('hidden')
document.getElementById('dashboard').classList.remove('hidden')
document.getElementById('user-info').innerHTML=(perfil.nome_completo||'-')+' • '+(perfil.cargo||'-')+' • '+(perfil.origem||'-')
let tabPerfis=document.getElementById('tab-perfis')
let tabTCERO=document.getElementById('tab-tcero')
if(tabPerfis){
tabPerfis.classList.add('hidden')
}
if(tabTCERO){
tabTCERO.classList.add('hidden')
}
let usernameAtual=(perfil.username||'').toLowerCase()
let adminsTCERO=['manoel','vagner','gleidi']
if(perfil.origem==='SEDAM'){
if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.innerText='PERFIS SEDAM'
}
if(tabTCERO){
tabTCERO.style.display='none'
}
}
if(perfil.origem==='TCERO'&&adminsTCERO.includes(usernameAtual)){
if(tabPerfis){
tabPerfis.classList.remove('hidden')
tabPerfis.innerText='PERFIS SEDAM'
}
if(tabTCERO){
tabTCERO.classList.remove('hidden')
tabTCERO.style.display='inline-block'
}
}
if(perfil.origem==='TCERO'&&!adminsTCERO.includes(usernameAtual)){
if(tabPerfis){
tabPerfis.style.display='none'
}
if(tabTCERO){
tabTCERO.style.display='none'
}
}
if(perfil.origem==='SEDAM'&&usernameAtual==='hueriqui'){
if(tabTCERO){
tabTCERO.style.display='none'
}
}
let backupBox=document.getElementById('backup-container')
if(backupBox){
backupBox.innerHTML=''
let adminsBackup=['manoel','vagner','gleidi']
let podeBackup=Number(perfil.nivel_acesso)===1&&adminsBackup.includes(usernameAtual)
if(podeBackup){
let btnBackup=document.createElement('button')
btnBackup.id='btnBackup'
btnBackup.innerText='BACKUP'
btnBackup.className='bg-purple-700 hover:bg-purple-800 text-white font-black px-4 py-2 rounded-xl shadow-lg'
btnBackup.onclick=function(){
if(typeof backupCompleto==='function'){
backupCompleto()
}else if(typeof gerarJSON==='function'){
gerarJSON(allData||[])
}else{
alert('Função de backup não encontrada.')
}
}
backupBox.appendChild(btnBackup)
}
}
switchTab(localStorage.getItem('activeTab')||'resumo')
if(typeof sincronizarResponsaveis==='function'){
await sincronizarResponsaveis()
}
await carregarDados()
}
/*=========================================================
003 SEDAM CORE FUNCTION SWITCHTAB
=========================================================*/
function switchTab(t){

if(t==='dashboard'){
console.log('ABRINDO DASHBOARD')
console.log(typeof renderDashboard)

setTimeout(()=>{
if(typeof renderDashboard==='function'){
renderDashboard()
}else{
console.error('renderDashboard NÃO EXISTE')
}
},200)
}

localStorage.setItem('activeTab',t)

document.querySelectorAll('.tab-view').forEach(v=>{
v.classList.add('hidden')
v.style.display='none'
})

document.querySelectorAll('.tab-btn').forEach(b=>{
b.classList.remove('tab-active')
})

let view=document.getElementById('view-'+t)

if(view){
view.classList.remove('hidden')
view.style.display='block'
view.style.visibility='visible'
view.style.opacity='1'
}

let tab=document.getElementById('tab-'+t)

if(tab){
tab.classList.add('tab-active')
}

if(t==='analise'){
setTimeout(()=>{
initPainelGrafico()

if(window.graficoResumo&&typeof window.graficoResumo.resize==='function'){
window.graficoResumo.resize()
}

if(window.graficoMonitoramento&&typeof window.graficoMonitoramento.resize==='function'){
window.graficoMonitoramento.resize()
}

if(window.graficoGeral&&typeof window.graficoGeral.resize==='function'){
window.graficoGeral.resize()
}

document.querySelectorAll('canvas').forEach(c=>{
c.style.display='block'
c.style.visibility='visible'
c.style.opacity='1'
})

},350)
}

if(t==='perfis'){
setTimeout(()=>{
carregarPerfis()
},200)
}

if(t==='usuarios'){
setTimeout(()=>{
carregarUsuarios()
},200)
}

if(t==='tcero'){
setTimeout(()=>{
carregarTCERO()
},200)
}

setTimeout(()=>{
renderTable()
},100)

}
/*=========================================================
004 SEDAM CORE FUNCTION CARREGARDADOS
=========================================================*/
async function carregarDados(){
if(!window.userP){
console.log('userP não carregado')
return
}
let query=client.from('deliberacoes').select('*')
if(userP&&Number(userP.nivel_acesso)!==1&&Number(userP.nivel_acesso)!==4&&!['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())){
query=query.eq('responsavel_id',userP.id)
}
let {data,error}=await query
if(error){
console.log(error)
allData=[]
return
}
if(!data){
allData=[]
return
}
let listaPerfis=[...(window.perfis||[]),...(window.perfisTCERO||[])]
allData=(data||[]).filter(d=>d&&d.subitem&&d.descricao).map(i=>{
let perfil=listaPerfis.find(p=>String(p.id)===String(i.responsavel_id))
if(perfil){
i.responsavel=perfil.nome_completo
}
if(!i.responsavel||String(i.responsavel).trim()===''){
i.responsavel='Não informado'
}
return i
}).sort(compareSubitem)
let media=allData.length?Math.round(allData.reduce((acc,c)=>{
return acc+getTotal(c)
},0)/(allData.length||1)):0
let box=document.getElementById('total-geral')
if(box){
box.innerText=media+'%'
}
renderResumo()
renderTable()
renderConcluidos()
let ultimaTab=localStorage.getItem('activeTab')||'resumo'
setTimeout(()=>{
switchTab(ultimaTab)
},100)
if(typeof atualizarLista3==='function'){
atualizarLista3()
}
}
/*=========================================================
005 SEDAM CORE FUNCTION CARREGARUSUARIOS
=========================================================*/
async function carregarUsuarios(){
if(!userP)return
let {data,error}=await client.from('perfis').select('id,nome_completo,username,nivel_acesso').order('nome_completo')
if(error){
console.error(error)
return
}
let lista=data||[]
let adminMaster=Number(userP.nivel_acesso)===1||['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())
if(!adminMaster){
lista=lista.filter(u=>String(u.id)===String(userP.id))
}
let html=`<div class="w-full"><div class="grid grid-cols-2 text-xs font-black text-black border-b border-slate-700 pb-2 mb-2"><div>Nome completo</div><div class="text-right">Login</div></div>${lista.map(u=>`<div class="grid grid-cols-2 items-center border-b border-slate-300 py-2"><div class="text-black font-semibold">${u.nome_completo||'-'}</div><div class="text-right font-black text-blue-900">${u.username||'-'}</div></div>`).join('')}</div>`
document.getElementById('listaUsuarios').innerHTML=html
}
/*=========================================================
006 SEDAM CORE FUNCTION CARREGARPERFIS
=========================================================*/
async function carregarPerfis(){
if(!userP)return
let isAdminSedam=Number(userP.nivel_acesso)===1
let isTCERO=(userP.origem||'')==='TCERO'
if(isTCERO&&!['manoel','vagner','gleidi'].includes((userP.username||'').toLowerCase())){
return
}
let query=client.from('perfis').select('*').order('nome_completo')
if(!isAdminSedam){
query=query.eq('id',userP.id)
}
let {data,error}=await query
if(error){
console.error(error)
return
}
window.perfis=data||[]
let html=`<table class="w-full text-xs"><thead><tr class="text-slate-400 border-b border-white/20"><th class="text-left p-2">Nome</th><th class="text-left p-2">Username</th><th class="text-left p-2">Cargo</th><th class="text-left p-2">Setor</th><th class="text-left p-2">Nível</th><th class="text-right p-2">Ações</th></tr></thead><tbody>${window.perfis.map(p=>{let isOculto=USUARIOS_OCULTOS.includes((p.username||'').toLowerCase());let podeEditar=isAdminSedam;return`<tr class="border-b border-white/10 hover:bg-white/5"><td class="p-2">${p.nome_completo||'-'}</td><td class="p-2">${p.username||'-'}</td><td class="p-2">${p.cargo||'-'}</td><td class="p-2">${p.setor||'-'}</td><td class="p-2">N${p.nivel_acesso||'-'}</td><td class="p-2 text-right">${podeEditar?`<button ${isOculto?'disabled style="opacity:0.3;pointer-events:none"':''} onclick="editarPerfil('${p.id}')" class="bg-blue-600 px-2 py-1 rounded mr-1">Editar</button><button ${isOculto?'disabled style="opacity:0.3;pointer-events:none"':''} onclick="excluirPerfil('${p.id}')" class="bg-red-600 px-2 py-1 rounded">Excluir</button>`:`<span class="text-slate-500 font-black">VISUALIZAÇÃO</span>`}</td></tr>`}).join('')}</tbody></table>`
document.getElementById('listaPerfis').innerHTML=html
}



let dashLinha=null
let dashPizza=null
let dashBarras=null
function renderDashboard(){
if(!window.allData||!allData.length)return

let lista=[...allData]

let totalSubitens=lista.length

let totalItens=[...new Set(
lista.map(i=>getItemKey(i))
)].length

let media=Math.round(
lista.reduce((acc,c)=>acc+getTotal(c),0)/(lista.length||1)
)

let concluidos=lista.filter(i=>getTotal(i)>=100).length

let andamento=lista.filter(i=>getTotal(i)>0&&getTotal(i)<100).length

let pendentes=lista.filter(i=>getTotal(i)<=0).length

document.getElementById('dashMedia').innerText=media+'%'
document.getElementById('dashItens').innerText=totalItens
document.getElementById('dashSubitens').innerText=totalSubitens
document.getElementById('dashConcluidos').innerText=concluidos
document.getElementById('dashAndamento').innerText=andamento
document.getElementById('dashPendentes').innerText=pendentes

let meses=['JAN','FEV','MAR','ABR','MAI']

let mediasMeses=[
Math.round(lista.reduce((a,c)=>a+Number(c.jan||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.fev||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.mar||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.abr||0),0)/(lista.length||1)),
Math.round(lista.reduce((a,c)=>a+Number(c.mai||0),0)/(lista.length||1))
]

if(dashLinha)dashLinha.destroy()

dashLinha=new Chart(
document.getElementById('graficoDashboardLinha'),
{
type:'line',
data:{
labels:meses,
datasets:[{
label:'Percentual Médio (%)',
data:mediasMeses,
borderWidth:3,
tension:.35,
fill:true
}]
},
options:{
responsive:true,
plugins:{
legend:{display:true}
},
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
}
)

if(dashPizza)dashPizza.destroy()

dashPizza=new Chart(
document.getElementById('graficoDashboardPizza'),
{
type:'doughnut',
data:{
labels:[
'100% Cumpridos',
'Em Andamento',
'Não Cumpridos'
],
datasets:[{
data:[
concluidos,
andamento,
pendentes
]
}]
},
options:{
responsive:true,
plugins:{
legend:{
position:'bottom'
}
}
}
}
)

let mapaItens={}

lista.forEach(i=>{
let item=getItemKey(i)
if(!mapaItens[item])mapaItens[item]=[]
mapaItens[item].push(getTotal(i))
})

let labels=Object.keys(mapaItens)

let valores=labels.map(l=>{
let arr=mapaItens[l]
return Math.round(
arr.reduce((a,b)=>a+b,0)/(arr.length||1)
)
})

if(dashBarras)dashBarras.destroy()

dashBarras=new Chart(
document.getElementById('graficoDashboardBarras'),
{
type:'bar',
data:{
labels:labels.map(i=>'Item '+i),
datasets:[{
label:'Percentual Médio',
data:valores,
borderWidth:1
}]
},
options:{
responsive:true,
plugins:{
legend:{display:false}
},
scales:{
y:{
beginAtZero:true,
max:100
}
}
}
}
)

}
