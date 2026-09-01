import { makeSteps } from '../../../packages/workflow-engine';
export const workflow=makeSteps('WY',[
 ['001','Revisión de elegibilidad','WE_PREPARE'],['010','Información de fundadores','YOU'],['020','Titularidad y beneficiarios finales','YOU'],
 ['030','Agente registrado','PARTNER','agent'],['040','Nombre de la compañía','YOU'],['050','Preparar Articles of Organization','WE_PREPARE'],
 ['060','Presentación al registro','GOVERNMENT','filing'],['070','Confirmación de constitución','GOVERNMENT','confirmation'],['080','Preparación y confirmación de EIN','GOVERNMENT'],
 ['090','Revisión fiscal federal','PARTNER','tax'],['100','Revisión de BOI vigente','WE_PREPARE'],['110','Informe anual y licencia','WE_PREPARE'],
 ['120','Preparación para banca','YOU'],['130','Activar calendario de cumplimiento','WE_PREPARE']
]);
