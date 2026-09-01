import { makeSteps } from '../../packages/workflow-engine';
export const workflow=makeSteps('GB',[
 ['001','Revisión de elegibilidad','WE_PREPARE'],['010','Información del negocio','YOU'],['020','Titularidad y PSC','YOU'],['030','Domicilio registrado','PARTNER'],
 ['040','Directores','YOU'],['050','Verificación de identidad de directores y PSC','PARTNER','identity'],['060','Nombre de la compañía','YOU'],['070','Preparar solicitud de constitución','WE_PREPARE'],
 ['080','Autopresentación o ACSP verificado','GOVERNMENT','filing'],['090','Confirmación de constitución','GOVERNMENT','confirmation'],
 ['100','Estado de Corporation Tax','PARTNER','tax'],['110','Confirmation statement','WE_PREPARE'],['120','Cuentas y declaraciones fiscales','PARTNER'],
 ['130','Preparación para banca','YOU'],['140','Activar cumplimiento','WE_PREPARE']
]);
