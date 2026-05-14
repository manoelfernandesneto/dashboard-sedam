async function gerarAnaliseIA(){

if(!ITEM_EVIDENCIA_ATUAL){
alert('Selecione um item')
return
}

let{data:item,error:itemError}=await client
.from('monitoramento_itens')
.select('*')
.eq('id',ITEM_EVIDENCIA_ATUAL)
.single()

if(itemError||!item){
console.log(itemError)
return
}

let{data:evidencias,error:evidError}=await client
.from('monitoramento_evidencias')
.select('*')
.eq('item_id',ITEM_EVIDENCIA_ATUAL)

if(evidError){
console.log(evidError)
return
}

let qtd=evidencias?.length||0

let qtdValidas=
(evidencias||[])
.filter(e=>e.status_validacao==='VALIDADA')
.length

let percentual=qtd>0
?Math.round((qtdValidas/qtd)*100)
:0

let status='NÃO EXECUTADA'

if(percentual>=80){
status='EXECUTADA'
}else if(percentual>=40){
status='PARCIALMENTE EXECUTADA'
}else if(percentual>0){
status='EM ANDAMENTO'
}

let risco='ALTO'

if(percentual>=80){
risco='BAIXO'
}else if(percentual>=40){
risco='MÉDIO'
}

let texto=''

texto+=`ANÁLISE TÉCNICA DO MONITORAMENTO\n\n`

texto+=`ITEM: ${item.item||'-'}\n`
texto+=`SUBITEM: ${item.subitem||'-'}\n\n`

texto+=`DELIBERAÇÃO:\n`
texto+=`${item.deliberacao||'-'}\n\n`

texto+=`AÇÃO DO GESTOR:\n`
texto+=`${item.acao_gestor||'-'}\n\n`

texto+=`PRODUTO ESPERADO:\n`
texto+=`${item.produto_esperado||'-'}\n\n`

texto+=`ANÁLISE DAS EVIDÊNCIAS:\n`

if(qtd===0){

texto+=`Não foram localizadas evidências documentais suficientes para comprovação da implementação das medidas propostas pelo gestor.\n\n`

}else{

;(evidencias||[]).forEach((e,i)=>{

texto+=`${i+1}. ${e.tipo_evidencia||'-'}`
texto+=` - ${e.numero_documento||'-'}`
texto+=` - ${e.status_validacao||'-'}.\n`

})

texto+=`\n`

texto+=`Foram identificadas ${qtd} evidências relacionadas ao item monitorado, sendo ${qtdValidas} evidências validadas tecnicamente.\n\n`

}

texto+=`CONCLUSÃO TÉCNICA:\n`

if(status==='EXECUTADA'){

texto+=`As evidências analisadas demonstram que as medidas previstas foram implementadas de forma satisfatória, indicando cumprimento relevante da deliberação monitorada.\n\n`

}

if(status==='PARCIALMENTE EXECUTADA'){

texto+=`As evidências demonstram avanço parcial na implementação das medidas previstas, contudo ainda existem pendências relevantes para o completo atendimento da deliberação.\n\n`

}

if(status==='EM ANDAMENTO'){

texto+=`As medidas encontram-se em fase de implementação, existindo indícios iniciais de execução, porém sem evidências suficientes para caracterizar cumprimento integral.\n\n`

}

if(status==='NÃO EXECUTADA'){

texto+=`Não foram identificados elementos suficientes que demonstrem implementação efetiva das medidas propostas.\n\n`

}

texto+=`RISCO IDENTIFICADO: ${risco}.\n\n`

texto+=`BENEFÍCIO ESPERADO:\n`
texto+=`${item.beneficio_esperado||'-'}\n\n`

texto+=`ENCAMINHAMENTO SUGERIDO:\n`

if(status==='EXECUTADA'){
texto+=`Manter acompanhamento periódico para verificação da sustentabilidade das medidas implementadas.\n`
}

if(status==='PARCIALMENTE EXECUTADA'){
texto+=`Determinar continuidade das ações e apresentação complementar de evidências.\n`
}

if(status==='EM ANDAMENTO'){
texto+=`Intensificar monitoramento e cobrança de implementação das medidas previstas.\n`
}

if(status==='NÃO EXECUTADA'){
texto+=`Determinar adoção imediata de providências pela unidade jurisdicionada.\n`
}

document.getElementById('textoAnalise').value=texto

await client
.from('monitoramento_itens')
.update({
status:status,
percentual:percentual
})
.eq('id',ITEM_EVIDENCIA_ATUAL)

await carregarItensMatriz()
await carregarDashboard()

}

async function salvarAnalise(){

if(!ITEM_EVIDENCIA_ATUAL){
alert('Selecione um item')
return
}

let texto=document
.getElementById('textoAnalise')
.value

if(!texto){
alert('Digite a análise')
return
}

let{data:item}=await client
.from('monitoramento_itens')
.select('*')
.eq('id',ITEM_EVIDENCIA_ATUAL)
.single()

let status=item?.status||'EM ANDAMENTO'

let percentual=item?.percentual||0

let impacto='MODERADO'

if(percentual>=80){
impacto='BAIXO'
}else if(percentual<40){
impacto='ALTO'
}

let{error}=await client
.from('monitoramento_analises')
.insert([{
item_id:ITEM_EVIDENCIA_ATUAL,
analise_tecnica:texto,
situacao:status,
impacto:impacto,
beneficio:item?.beneficio_esperado||'',
encaminhamento:'Monitoramento contínuo',
conclusao:texto
}])

if(error){
console.log(error)
alert('Erro ao salvar')
return
}

alert('Análise salva')

await carregarAnalises()

}

async function carregarAnalises(){

if(!ITEM_EVIDENCIA_ATUAL)return

let{data,error}=await client
.from('monitoramento_analises')
.select('*')
.eq('item_id',ITEM_EVIDENCIA_ATUAL)
.order('id',{ascending:false})

if(error){
console.log(error)
return
}

let html=''

;(data||[]).forEach(a=>{

html+=`
<div class="card-analise">

<div class="card-analise-topo">

<div>
<div class="analise-titulo">
${a.situacao||'-'}
</div>

<div class="analise-subtitulo">
Impacto: ${a.impacto||'-'}
</div>
</div>

<div class="badge-status ${getClasseStatus(a.situacao)}">
${a.situacao||'-'}
</div>

</div>

<pre class="texto-analise-pre">
${a.analise_tecnica||'-'}
</pre>

<div class="analise-actions">

<button class="btn-padrao azul" onclick="copiarAnalise(${a.id})">
📋 Copiar
</button>

<button class="btn-padrao vermelho" onclick="excluirAnalise(${a.id})">
🗑 Excluir
</button>

</div>

</div>
`

})

document.getElementById('listaAnalises').innerHTML=html

}

async function copiarAnalise(id){

let{data,error}=await client
.from('monitoramento_analises')
.select('*')
.eq('id',id)
.single()

if(error||!data)return

navigator.clipboard.writeText(
data.analise_tecnica||''
)

alert('Copiado')

}

async function excluirAnalise(id){

if(!confirm('Excluir análise?'))return

let{error}=await client
.from('monitoramento_analises')
.delete()
.eq('id',id)

if(error){
console.log(error)
return
}

await carregarAnalises()

}

async function gerarResumoIA(){

let{data,error}=await client
.from('monitoramento_itens')
.select('*')

if(error){
console.log(error)
return
}

let total=data?.length||0

let executadas=
(data||[])
.filter(i=>i.status==='EXECUTADA')
.length

let parciais=
(data||[])
.filter(i=>i.status==='PARCIALMENTE EXECUTADA')
.length

let naoExecutadas=
(data||[])
.filter(i=>i.status==='NÃO EXECUTADA')
.length

let andamento=
(data||[])
.filter(i=>i.status==='EM ANDAMENTO')
.length

let texto=''

texto+=`RESUMO EXECUTIVO\n\n`

texto+=`O presente monitoramento teve por objetivo avaliar o cumprimento das deliberações constantes dos processos acompanhados pela equipe técnica.\n\n`

texto+=`Foram analisados ${total} itens monitorados.\n\n`

texto+=`RESULTADOS:\n\n`

texto+=`• EXECUTADAS: ${executadas}\n`
texto+=`• PARCIALMENTE EXECUTADAS: ${parciais}\n`
texto+=`• NÃO EXECUTADAS: ${naoExecutadas}\n`
texto+=`• EM ANDAMENTO: ${andamento}\n\n`

if(executadas>=parciais&&executadas>=naoExecutadas){

texto+=`Observou-se evolução relevante na implementação das medidas monitoradas, com indicativos de fortalecimento dos controles internos e melhorias operacionais.\n\n`

}else{

texto+=`Persistem fragilidades relevantes na implementação das medidas monitoradas, exigindo continuidade das ações de controle e acompanhamento técnico.\n\n`

}

texto+=`Recomenda-se a continuidade do monitoramento dos itens pendentes, especialmente aqueles classificados como parcialmente executados ou não executados.\n`

document.getElementById('previewRelatorio').innerHTML=
`<pre class="texto-analise-pre">${texto}</pre>`

abrirTela('relatorios')

}
