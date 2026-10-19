const ISO_CODES = [
  'AF','ZA','AL','DZ','DE','AD','AO','AG','SA','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BE','BZ','BJ','BT','BY','MM','BO','BA','BW','BR','BN','BG','BF','BI','KH','CM','CA','CV','CL','CN','CY','CO','KM','CG','CD','KP','KR','CR','CI','HR','CU','DK','DJ','DM','EG','AE','EC','ER','ES','EE','US','ET','FJ','FI','FR','GA','GM','GE','GH','GR','GD','GT','GN','GQ','GW','GY','HT','HN','HU','IN','ID','IQ','IR','IE','IS','IL','IT','JM','JP','JO','KZ','KE','KG','KI','KW','LA','LS','LV','LB','LR','LY','LI','LT','LU','MK','MG','MY','MW','MV','ML','MT','MA','MH','MU','MR','MX','FM','MD','MC','MN','ME','MZ','NA','NR','NP','NI','NE','NG','NO','NZ','OM','UG','UZ','PK','PW','PS','PA','PG','PY','NL','PE','PH','PL','PT','QA','CF','DO','RO','GB','RU','RW','KN','LC','SM','VC','SB','SV','WS','ST','SN','RS','SC','SL','SG','SK','SI','SO','SD','SS','LK','SE','CH','SR','SZ','SY','TJ','TZ','TD','CZ','TH','TL','TG','TO','TT','TN','TM','TR','TV','UA','UY','VU','VA','VE','VN','YE','ZM','ZW',
] as const;

const FALLBACK_NAMES: Record<string, string> = {
  CM:'Cameroun',SN:'Sénégal',CI:"Côte d’Ivoire",NG:'Nigeria',ZA:'Afrique du Sud',DZ:'Algérie',AO:'Angola',BJ:'Bénin',BW:'Botswana',BF:'Burkina Faso',BI:'Burundi',CV:'Cap-Vert',CF:'République centrafricaine',TD:'Tchad',KM:'Comores',CG:'Congo',CD:'République démocratique du Congo',DJ:'Djibouti',EG:'Égypte',ER:'Érythrée',SZ:'Eswatini',ET:'Éthiopie',GA:'Gabon',GM:'Gambie',GH:'Ghana',GN:'Guinée',GQ:'Guinée équatoriale',GW:'Guinée-Bissau',KE:'Kenya',LS:'Lesotho',LR:'Liberia',LY:'Libye',MG:'Madagascar',MW:'Malawi',ML:'Mali',MA:'Maroc',MU:'Maurice',MR:'Mauritanie',MZ:'Mozambique',NA:'Namibie',NE:'Niger',UG:'Ouganda',RW:'Rwanda',SC:'Seychelles',SL:'Sierra Leone',SO:'Somalie',SD:'Soudan',SS:'Soudan du Sud',TZ:'Tanzanie',TG:'Togo',TN:'Tunisie',ZM:'Zambie',ZW:'Zimbabwe',FR:'France',US:'États-Unis',GB:'Royaume-Uni',CA:'Canada',BR:'Brésil',IN:'Inde',JP:'Japon',CN:'Chine',DE:'Allemagne',ES:'Espagne',IT:'Italie',PT:'Portugal',MX:'Mexique',AR:'Argentine',AU:'Australie',
};

function countryName(code: string) {
  if (FALLBACK_NAMES[code]) return FALLBACK_NAMES[code];
  try {
    const DisplayNames = (Intl as typeof Intl & { DisplayNames?: new (locales: string[], options: { type: 'region' }) => { of: (value: string) => string | undefined } }).DisplayNames;
    return DisplayNames ? new DisplayNames(['fr'], { type: 'region' }).of(code) ?? code : code;
  } catch { return code; }
}

export function countryFlag(code: string) {
  return code.toUpperCase().replace(/[A-Z]/g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}

export const recipeCountryCatalog = ISO_CODES.map((code) => ({ code, name: countryName(code), flag: countryFlag(code) }))
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

