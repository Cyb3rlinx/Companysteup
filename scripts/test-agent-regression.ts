import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {agentQualityBaselines,AGENT_REGRESSION_VERSION} from '../packages/agent-operations';

type EvaluationReport={
  version:string;
  evaluatedAt:string;
  runStatus:string;
  mode:string;
  summary:{passed:number;completed:number;total:number;externalWrites:number};
};

const evaluations=[
  {jurisdiction:'US-WY',script:'scripts/test-wyoming-agent-evaluation.ts',report:'.local/qa/wyoming-agent-evaluation.json'},
  {jurisdiction:'US-DE',script:'scripts/test-delaware-agent-evaluation.ts',report:'.local/qa/delaware-agent-evaluation.json'},
  {jurisdiction:'EE',script:'scripts/test-estonia-agent-evaluation.ts',report:'.local/qa/estonia-agent-evaluation.json'},
  {jurisdiction:'GB',script:'scripts/test-uk-agent-evaluation.ts',report:'.local/qa/uk-agent-evaluation.json'},
] as const;

function execute(script:string){
  return new Promise<void>((resolve,reject)=>{
    const child=spawn(process.execPath,['--import','tsx',script],{
      cwd:process.cwd(),
      stdio:'inherit',
      env:{...process.env,OPENAI_API_KEY:'',OPENAI_MODEL:'',OPENAI_SIMULATOR_MODEL:''},
    });
    child.once('error',reject);
    child.once('exit',(code,signal)=>code===0?resolve():reject(new Error(`${script} terminó con ${signal??`código ${code}`}`)));
  });
}

async function main(){
  const baselines=new Map(agentQualityBaselines().map(item=>[item.jurisdiction,item]));
  const results=[];
  for(const evaluation of evaluations){
    console.log(`\nRegresión ${evaluation.jurisdiction}: ${evaluation.script}`);
    let failure:string|null=null;
    try{await execute(evaluation.script);}catch(error){failure=error instanceof Error?error.message:'La evaluación terminó con error';}
    let report:EvaluationReport|null=null;
    try{report=JSON.parse(await readFile(evaluation.report,'utf8')) as EvaluationReport;}catch{failure??='No se pudo leer el informe saneado';}
    const baseline=baselines.get(evaluation.jurisdiction);
    const checks={
      deterministic:report?.mode==='DETERMINISTIC',
      passed:report?.runStatus==='PASSED',
      currentVersion:report?.version===baseline?.currentEvaluationVersion,
      complete:report?.summary.passed===4&&report?.summary.completed===4&&report?.summary.total===4,
      noExternalWrites:report?.summary.externalWrites===0,
    };
    const passed=!failure&&Object.values(checks).every(Boolean);
    if(!passed&&failure===null)failure=`Controles fallidos: ${Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>name).join(', ')}`;
    results.push({jurisdiction:evaluation.jurisdiction,evaluationVersion:report?.version??null,evaluatedAt:report?.evaluatedAt??null,mode:report?.mode??null,summary:report?.summary??null,checks,passed,failure});
  }
  const passed=results.every(item=>item.passed);
  const output={version:AGENT_REGRESSION_VERSION,evaluatedAt:new Date().toISOString(),runStatus:passed?'PASSED':'FAILED',scope:'SYNTHETIC_EVALUATION_ONLY',externalCapability:'EXTERNAL_BLOCKED',results};
  await mkdir('.local/qa',{recursive:true});
  await writeFile('.local/qa/agent-regression.json',JSON.stringify(output,null,2));
  if(!passed)throw new Error('La regresión operativa de agentes no alcanzó la puerta de seguridad. Informe: .local/qa/agent-regression.json');
  console.log(`\n4/4 evaluadores determinísticos vigentes aprobados; cero acciones externas. Informe: .local/qa/agent-regression.json`);
}

main().catch(error=>{console.error(error instanceof Error?error.message:'La regresión falló');process.exitCode=1;});
