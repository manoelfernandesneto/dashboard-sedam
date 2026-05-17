const client=supabase.createClient(
window.SUPABASE_URL,
window.SUPABASE_ANON_KEY
)
let MONITORAMENTO_ATUAL=null
let USER_MONITORAMENTO=null

function abrirTela(nome){

document
.querySelectorAll('.tela-monitoramento')
.forEach(t=>t.classList.add('hidden'))

document
.getElementById('tela-'+nome)
.classList.remove('hidden')

document
.querySelectorAll('.nav-btn')
.forEach(b=>b.classList.remove('nav-active'))

if(event&&event.target){
event.target.classList.add('nav-active')
}

if(nome==='auditoria'){
carregarAuditoriaCompleta()
}

if(nome==='dashboard'){
carregarDashboard()
}

if(nome==='monitoramentos'){
carregarListaMonitoramentos()
}

if(nome==='matriz'){
carregarItensMatriz()
}

if(nome==='evidencias'){
carregarEvidencias()
}

if(nome==='analises'){
carregarAnalises()
}

if(nome==='resultados'){
carregarResultados()
}

}
async function carregarUsuarioMonitoramento(){

let nome=prompt(
'Informe o nome do auditor'
)

if(!nome)return

let{data,error}=await client
.from('monitoramento_permissoes')
.select('*')
.ilike('nome',nome)
.eq('ativo',true)
.single()

if(error||!data){

alert('Usuário sem permissão')

throw error

}

USER_MONITORAMENTO=data

document.getElementById('usuarioLogado').innerHTML=
data.nome+
' • NÍVEL '+
data.nivel

aplicarPermissoes()

}

function aplicarPermissoes(){

if(!USER_MONITORAMENTO)return

let nivel=Number(
USER_MONITORAMENTO.nivel||5
)

if(nivel>2){

document
.querySelectorAll('.btn-admin')
.forEach(b=>b.remove())

}

if(nivel>3){

document
.querySelectorAll('.somente-supervisor')
.forEach(b=>b.remove())

}

if(nivel>=5){

document
.querySelectorAll('input,textarea,select,button')
.forEach(el=>{

if(
!el.classList.contains('btn-livre')
){
el.disabled=true
}

})

}

}
document.addEventListener('DOMContentLoaded',async()=>{
await carregarUsuarioMonitoramento()
await carregarDashboard()
})

window.addEventListener('error',e=>{

console.log(
'ERRO GLOBAL:',
e.error
)

})

window.addEventListener('unhandledrejection',e=>{

console.log(
'PROMISE ERROR:',
e.reason
)

})
