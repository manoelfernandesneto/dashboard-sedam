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

document.addEventListener('DOMContentLoaded',async()=>{

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
