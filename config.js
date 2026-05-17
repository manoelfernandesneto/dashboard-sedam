window.S_URL='https://zvtzbiqfwhggysiuiuxh.supabase.co'

window.S_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dHpiaXFmd2hnZ3lzaXVpdXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1ODYyMjcsImV4cCI6MjA5MzE2MjIyN30.tCnFZv2B6Kmd9KsyZM8CHClZqsq7Nyu-8nxyYVs_ZMQ'
window.client=supabase.createClient(
window.S_URL,
window.S_KEY,
{
auth:{
persistSession:true,
autoRefreshToken:true
}
}
)

const oldFrom=window.client.from.bind(window.client)

window.client.from=function(tabela){

console.log('========================')
console.log('SUPABASE TABELA:')
console.log(tabela)

let query=oldFrom(tabela)

let oldSelect=query.select.bind(query)

query.select=function(...args){

console.log('SELECT:')
console.log(args)

let resultado=oldSelect(...args)

resultado.then(r=>{

if(r.error){

console.log('ERRO SUPABASE:')
console.log(r.error)

alert(
'TABELA: '+tabela+
'\n\n'+
JSON.stringify(r.error,null,2)
)

}

})

return resultado

}

return query

}
