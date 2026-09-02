/** Internal research only. These profiles are not published regulatory rules. */
export const GUIDE_VERSION = '2026-09-03.1';
export const GUIDE_IDS = ['US-WY', 'US-DE', 'EE', 'LT', 'AE-DU', 'SG', 'HK'] as const;
export type GuideId = typeof GUIDE_IDS[number];
export type GuideSource = {
  id: string; title: string; url: string;
  observation: 'PUBLIC_CONTENT_INSPECTED' | 'PUBLIC_PORTAL_ONLY' | 'RELOCATED';
};
export type FieldGuide = {
  field: string; destination: string; enteredBy: 'Usuario' | 'Usuario / proveedor';
  sourceId: string; sensitive?: boolean;
};
export type CountryGuide = {
  id: GuideId; name: string; agent: string; route: string;
  scope: 'EXISTING_ROUTE' | 'RESEARCH_ONLY';
  opportunity: string; limitation: string; handoff: string; nextResearch: string;
  sources: GuideSource[]; fields: FieldGuide[];
};
const source = (id: string, title: string, url: string, observation: GuideSource['observation'] = 'PUBLIC_CONTENT_INSPECTED'): GuideSource => ({id, title, url, observation});
const field = (field: string, destination: string, sourceId: string, sensitive = false): FieldGuide => ({field, destination, sourceId, enteredBy: 'Usuario / proveedor', sensitive});
const ein = source('irs-ss4', 'IRS: instrucciones del formulario SS-4', 'https://www.irs.gov/instructions/iss4');
const einField = field('Responsable fiscal, actividad y domicilio principal; identificación fiscal solo en canal autorizado', 'Solicitud EIN ante IRS; la vía depende del domicilio principal y la elegibilidad', ein.id, true);

export const COUNTRY_GUIDES: readonly CountryGuide[] = [
  {
    id: 'US-WY', name: 'Wyoming', agent: 'Guía Wyoming LLC', route: 'LLC', scope: 'EXISTING_ROUTE',
    opportunity: 'Portal estatal y formulario público permiten preparar una LLC de forma estructurada.',
    limitation: 'No implica anonimato, exención fiscal ni elegibilidad automática para bancos. El portal deriva a papel los nombres que comienzan con A.',
    handoff: 'Agente registrado de Wyoming, consentimiento, firma del organizador, presentación y pago por la persona autorizada; aprobación estatal y EIN separados.',
    nextResearch: 'Validar con un proveedor la aceptación del expediente y la ruta manual; después contrastar obligaciones federales y estatales.',
    sources: [
      source('wy-portal', 'Wyoming: instrucciones de registro', 'https://wyobiz.wyo.gov/Business/RegistrationInstr.aspx'),
      source('wy-articles', 'Wyoming: Articles of Organization y consentimiento', 'https://sos.wyo.gov/Forms/Business/LLC/LLC-ArticlesOrganization.pdf'), ein,
    ],
    fields: [field('Nombre propuesto y elección de close LLC, si aplica', 'Articles of Organization, apartados 1–2', 'wy-articles'), field('Agente registrado y domicilio físico en Wyoming', 'Articles, apartado 3 y consentimiento del agente', 'wy-articles'), field('Domicilios postal y principal', 'Articles, apartados 4–5', 'wy-articles'), field('Organizador, contacto y firma', 'Articles y consentimiento; nunca firmamos por el usuario', 'wy-articles', true), einField],
  },
  {
    id: 'US-DE', name: 'Delaware', agent: 'Guía Delaware LLC', route: 'LLC', scope: 'EXISTING_ROUTE',
    opportunity: 'El régimen LLC de Delaware prioriza la libertad contractual del acuerdo entre miembros; su utilidad exige revisar la estructura concreta con un profesional.',
    limitation: 'Document Upload es envío para procesamiento, no constitución instantánea. Una LLC no es automáticamente la estructura apropiada para inversión de capital de riesgo.',
    handoff: 'Agente registrado con dirección física en Delaware, firmante autorizado y servicio de envío estatal. Certificado aceptado y EIN requieren evidencia separada.',
    nextResearch: 'Revisar certificado y carta de presentación con proveedor; resolver discrepancias de importes antes de cotizar.',
    sources: [source('de-llc-act', 'Delaware LLC Act: libertad contractual, § 18-1101', 'https://delcode.delaware.gov/title6/c018/sc11/index.html'), source('de-formation', 'Delaware: pasos de constitución', 'https://corp.delaware.gov/howtoform/'), source('de-forms', 'Delaware: paquetes de nuevas entidades', 'https://corp.delaware.gov/newentit09/'), source('de-upload', 'Delaware: límites de Document Upload', 'https://corp.delaware.gov/document-upload-service-information/'), ein],
    fields: [field('Tipo de entidad, nombre y agente registrado', 'Seleccionar paquete LLC en nuevas entidades; confirmar el certificado aplicable', 'de-forms'), field('Datos de contacto y documento firmado', 'Carta de presentación y servicio Document Upload', 'de-upload', true), einField],
  },
  {
    id: 'EE', name: 'Estonia', agent: 'Guía Estonia OÜ', route: 'OÜ', scope: 'EXISTING_ROUTE',
    opportunity: 'Registro digital con identidades y firmas admitidas; existe además una API RIK sujeta a requisitos de proveedor.',
    limitation: 'e-Residency no equivale a residencia fiscal, visa ni cuenta bancaria. El flujo de API simplificada no cubre cualquier estructura societaria.',
    handoff: 'El usuario firma con su identidad admitida en el registro; revisar domicilio/contacto y proveedor. API bloqueada sin habilitación, contrato y pruebas RIK.',
    nextResearch: 'Validar elegibilidad del proveedor para licencia, X-Road y contrato RIK; ensayar en entorno autorizado antes de integrar.',
    sources: [source('ee-portal', 'RIK: acceso y firma en e-Business Register', 'https://www.rik.ee/en/e-business-register/e-business-register-portal'), source('ee-start', 'RIK: selección de forma jurídica', 'https://ariregister.rik.ee/eng/application/start', 'PUBLIC_PORTAL_ONLY'), source('ee-api', 'RIK: Company Registration API', 'https://www.rik.ee/en/other-services/company-registration-api')],
    fields: [field('Forma jurídica y nombre propuesto', 'e-Business Register: nueva solicitud OÜ', 'ee-start'), field('Domicilio, actividad, capital, fundador y miembros del consejo', 'API simplificada: datos de solicitud; no extrapolar al formulario completo', 'ee-api', true), field('Identidad digital y firma de las personas correspondientes', 'Portal oficial, con las credenciales bajo control del usuario', 'ee-portal', true)],
  },
  {
    id: 'LT', name: 'Lituania', agent: 'Investigación Lituania', route: 'Forma jurídica por confirmar', scope: 'RESEARCH_ONLY',
    opportunity: 'Hay infraestructura oficial de identificación electrónica; se investiga la constitución digital para extranjeros.',
    limitation: 'La FAQ de constitución consultada redirige a una página genérica. No está comprobada una ruta completa para un fundador global ni la elección UAB/MB.',
    handoff: 'Investigación y revisión profesional antes de recomendar una forma jurídica o introducir datos en un trámite.',
    nextResearch: 'Localizar la guía vigente, confirmar nacionalidad/identidad admitida, firma, forma jurídica, domicilio, capital y posible intervención notarial.',
    sources: [source('lt-faq', 'Registrų centras: FAQ de constitución (enlace trasladado)', 'https://info.registrucentras.lt/content/144433', 'RELOCATED'), source('lt-register', 'Registrų centras: sitio oficial', 'https://www.registrucentras.lt/en/', 'PUBLIC_PORTAL_ONLY'), source('lt-identity', 'Migración: identificación y firma electrónica', 'https://migracija.lrv.lt/en/activities/identity-documents/electronic-identification-and-electronic-signature-tool/electronic-identification-and-electronic-signature-tool-2021/')],
    fields: [field('Nacionalidad, residencia y tipo de identidad digital, sin números de documento', 'Comprobar elegibilidad con Registrų centras; formulario exacto pendiente', 'lt-register'), field('Forma jurídica, domicilio, capital y firmantes', 'No introducir datos: ruta y campos oficiales pendientes de revisión', 'lt-faq')],
  },
  {
    id: 'AE-DU', name: 'Dubái', agent: 'Investigación Dubái', route: 'Mainland o zona franca específica', scope: 'RESEARCH_ONLY',
    opportunity: 'Permite comparar una ruta mainland y las rutas de zonas francas según actividad y mercado objetivo.',
    limitation: 'No existe un trámite único para todas las zonas. No se garantiza licencia, visa, banco ni impuesto cero.',
    handoff: 'Elegir autoridad y actividad; usuario/proveedor revisa aprobaciones, identidad, documentos, licencia y pagos.',
    nextResearch: 'Elegir mainland o una zona franca con nombre, confirmar licencia/actividad y ruta remota con su autoridad. Separar migración y registro fiscal.',
    sources: [source('dubai-guide', 'Gobierno de Dubái: iniciar un negocio', 'https://www.dubai.ae/starting-a-business'), source('dubai-mainland', 'Invest in Dubai: mainland', 'https://www.investindubai.gov.ae/en/business-setup/mainland-companies', 'PUBLIC_PORTAL_ONLY'), source('dubai-zones', 'Invest in Dubai: zonas francas', 'https://www.investindubai.gov.ae/en/business-setup/free-zone-companies', 'PUBLIC_PORTAL_ONLY'), source('uae-tax', 'FTA: guía fiscal para personas de zonas francas', 'https://tax.gov.ae/en/media.centre/news/federal.tax.authority.issues.corporate.tax.guide.on.free.zone.persons.aspx')],
    fields: [field('Actividad, mercado, forma jurídica y autoridad', 'Selección mainland/zona franca antes de abrir la solicitud', 'dubai-guide'), field('Nombre y documentos societarios', 'Reserva y aprobación inicial ante la autoridad elegida', 'dubai-guide'), field('Identidad y documentación migratoria cuando corresponda', 'Canal seguro de autoridad/proveedor; requisitos según caso', 'dubai-guide', true)],
  },
  {
    id: 'SG', name: 'Singapur', agent: 'Investigación Singapur Pte. Ltd.', route: 'Private company limited by shares', scope: 'RESEARCH_ONLY',
    opportunity: 'Bizfile ofrece un proceso estructurado; extranjeros deben trabajar mediante un Corporate Service Provider conforme a ACRA.',
    limitation: 'Hace falta cubrir la dirección local exigida y los requisitos de cargos y domicilio. Constitución y permiso de trabajo son procesos distintos.',
    handoff: 'CSP habilitado y director residente local; declaraciones, endorsements y presentación por participantes autorizados.',
    nextResearch: 'Verificar CSP y alcance contractual, cargos, domicilio, controladores y soporte posterior; revisar fiscalidad sin promesas de residencia.',
    sources: [source('sg-eligibility', 'ACRA: requisitos y elegibilidad', 'https://www.acra.gov.sg/register/business/requirements-eligibility/'), source('sg-bizfile', 'ACRA: registrar una compañía mediante Bizfile', 'https://www.acra.gov.sg/register/business/registering-different-business-structures/local-company/registering-via-bizfile/')],
    fields: [field('Nombre reservado, actividad, domicilio, correo y cierre de ejercicio', 'Bizfile: datos de la compañía', 'sg-bizfile'), field('Directores, secretario, accionistas, nominadores y controladores cuando aplique', 'Bizfile: participantes y declaraciones correspondientes', 'sg-bizfile', true), field('Capital, asignación de acciones y constitución', 'Bizfile: capital y documentos', 'sg-bizfile'), field('Acceso Singpass/Corppass y aprobaciones', 'Solo usuario/CSP en su sesión oficial', 'sg-bizfile', true)],
  },
  {
    id: 'HK', name: 'Hong Kong', agent: 'Investigación Hong Kong Limited', route: 'Private company limited by shares', scope: 'RESEARCH_ONLY',
    opportunity: 'El registro admite presentación electrónica; el director no necesita ser residente de Hong Kong.',
    limitation: 'Se requieren domicilio registrado en Hong Kong y secretario elegible. El director único no puede actuar también como secretario único.',
    handoff: 'Usuario/proveedor autorizado gestiona cuenta, NNC1, estatutos, IRBR1, firmas y pago; el registro emite el resultado.',
    nextResearch: 'Validar proveedor y licencia/exención TCSP, identidad y firmantes del e-Services Portal; plan de cumplimiento y contabilidad posterior.',
    sources: [source('hk-incorporation', 'Companies Registry: incorporación local', 'https://www.cr.gov.hk/en/faq/local-company/incorporation.htm'), source('hk-officers', 'Companies Registry: directores y secretario', 'https://www.cr.gov.hk/en/faq/local-company/directors-secretary.htm'), source('hk-portal', 'Companies Registry: presentación electrónica', 'https://www.cr.gov.hk/en/electronic/e-servicesportal/faq/business-registration.htm')],
    fields: [field('Nombre, domicilio local, capital y accionistas fundadores', 'NNC1 y Articles of Association', 'hk-incorporation'), field('Directores y secretario elegible', 'NNC1: participantes; identidad solo en canal autorizado', 'hk-officers', true), field('Registro comercial y presentación', 'IRBR1 y e-Services Portal: Incorporation > Local Company', 'hk-portal'), field('Cuenta y firmas de los participantes', 'e-Services Portal; nunca compartir contraseña ni códigos', 'hk-portal', true)],
  },
];

export function countryGuide(id: GuideId): CountryGuide {
  const guide = COUNTRY_GUIDES.find(g => g.id === id);
  if (!guide) throw new Error('Unknown research guide');
  return guide;
}
