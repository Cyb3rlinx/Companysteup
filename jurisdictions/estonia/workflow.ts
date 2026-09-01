import { makeSteps } from '../../packages/workflow-engine';
export const workflow=makeSteps('EE',[
 ['001','Revisión de elegibilidad','WE_PREPARE'],['010','Estado de e-Residency','YOU'],['020','Información de fundadores','YOU'],['030','Titularidad y junta directiva','YOU'],
 ['040','Domicilio y persona de contacto','PARTNER'],['050','Confirmar ruta guiada o partner','WE_PREPARE','eregistry'],['060','Nombre de la compañía','YOU'],
 ['070','Preparar solicitud','WE_PREPARE'],['080','Firmas digitales','YOU','signatures'],['090','Pago de tasa estatal','YOU'],['100','Presentación al registro','GOVERNMENT','filing'],
 ['110','Confirmación de inscripción','GOVERNMENT','confirmation'],['120','Revisión fiscal internacional','PARTNER','tax'],['130','Informe anual','WE_PREPARE'],
 ['140','Preparación para banca','YOU'],['150','Contabilidad y cumplimiento','WE_PREPARE']
]);
