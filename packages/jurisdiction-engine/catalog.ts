import { workflow as de } from '../../jurisdictions/us/delaware/workflow';
import { workflow as wy } from '../../jurisdictions/us/wyoming/workflow';
import { workflow as ee } from '../../jurisdictions/estonia/workflow';
import { workflow as gb } from '../../jurisdictions/uk/workflow';
export const PRODUCTS = {
 'US-DE':{code:'US_DE_LLC',name:'Delaware LLC',country:'Estados Unidos',entity:'LLC',currency:'USD',workflow:de,formationFeeRule:null,annualRule:'DE_ANNUAL_TAX'},
 'US-WY':{code:'US_WY_LLC',name:'Wyoming LLC',country:'Estados Unidos',entity:'LLC',currency:'USD',workflow:wy,formationFeeRule:'WY_FORMATION_FEE',annualRule:'WY_ANNUAL_REPORT'},
 EE:{code:'EE_OU',name:'Estonia OÜ',country:'Estonia',entity:'OU',currency:'EUR',workflow:ee,formationFeeRule:'EE_FORMATION_FEE',annualRule:'EE_ANNUAL_REPORT'},
 GB:{code:'GB_LTD',name:'UK Ltd',country:'Reino Unido',entity:'LTD_PRIVATE_SHARES',currency:'GBP',workflow:gb,formationFeeRule:'GB_FORMATION_FEE',annualRule:'GB_CONFIRMATION'},
} as const;

