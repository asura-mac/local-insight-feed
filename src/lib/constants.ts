
// List of emergency keywords for the emergency alert system
export const EMERGENCY_KEYWORDS = [
  // Core India-Pakistan War Keywords
  'India Pakistan war', 'India Pakistan conflict', 'India Pakistan border tension',
  'India Pakistan ceasefire violation', 'Indo-Pak war', 'India retaliates Pakistan',
  'Pakistan violates LoC', 'LoC tension India Pakistan', 'cross-border firing',
  'Pakistan drone India border', 'India intercepts Pakistan UAV', 'terror camp destroyed Pakistan',
  'India airstrike Pakistan', 'BSF fires at Pakistan intruders', 'Indian soldier martyred LoC',
  'Pakistani shelling Indian post', 'Pak Army attack India', 'war clouds India Pakistan',
  'Pakistani troops infiltrate', 'India raises war alert', 'Indian Air Force alert',
  'LoC hot zone', 'LoC surveillance alert', 'Pak army mobilizes', 'Indian navy border alert',
  'nuclear threat India Pakistan', 'Pakistan threatens India', 'India defends LoC',
  'militant infiltration LoC', 'India army movement towards border',
  'LoC escalation India Pakistan', 'LoC sniper firing',
  
  // North India
  'Jammu Kashmir war alert', 'Jammu LoC firing', 'Kashmir border escalation',
  'Punjab border tension', 'Punjab drone infiltration', 'Punjab BSF alert',
  'Himachal Pradesh war alert', 'Uttarakhand border alert', 'Delhi on high alert',
  'Delhi war readiness', 'Haryana military alert', 'Haryana troop movement',
  
  // West India
  'Rajasthan war alert', 'Rajasthan LoC activity', 'Rajasthan drone alert',
  'Gujarat border tension', 'Gujarat coastal alert', 'Gujarat navy drill',
  'Maharashtra terror alert', 'Maharashtra war drill', 'Goa war zone alert',
  
  // East India
  'Bihar war alert', 'Bihar Pakistan threat', 'West Bengal infiltration alert',
  'West Bengal border tension', 'Jharkhand war intelligence', 'Jharkhand militant alert',
  'Odisha border intelligence', 'Odisha coastal surveillance', 'Chhattisgarh anti-terror alert',
  
  // Central India
  'Madhya Pradesh war update', 'MP India-Pakistan alert', 'UP war news',
  'Uttar Pradesh war alert', 'UP border activity',
  
  // South India
  'Andhra Pradesh alert India Pakistan', 'Andhra Air Force readiness', 'Telangana terror alert',
  'Telangana war message', 'Karnataka military alert', 'Karnataka India Pakistan conflict',
  'Tamil Nadu navy alert', 'Tamil Nadu Indo-Pak alert', 'Kerala Pakistan support alert',
  'Kerala coastal surveillance',
  
  // North-East India
  'Assam war alert', 'Assam terror movement', 'Manipur LoC influence',
  'Meghalaya Indo-Pak tension', 'Mizoram war alert', 'Nagaland cross-border alert',
  'Tripura terror watch', 'Sikkim war zone news', 'Arunachal Pradesh Pakistan mention',
  
  // Union Territories
  'Ladakh LoC alert', 'Ladakh troop movement', 'Andaman Nicobar navy alert',
  'Lakshadweep war readiness', 'Chandigarh security alert', 'Puducherry Air Force drill',
  'Dadra Nagar Haveli India Pakistan alert', 'Daman Diu security alert', 'Delhi UT missile alert',
  
  // Foreign Geopolitical (Only India-Pakistan Related)
  'China supports Pakistan against India', 'China warns India on war', 'US supports India against Pakistan',
  'Russia on India Pakistan tension', 'UK reacts India Pakistan war', 'UN appeals India Pakistan peace',
  'OIC condemns Indian strike', 'Israel supports Indian action', 'Turkey defends Pakistan',
  'France urges Indo-Pak calm', 'Bangladesh on Indo-Pak war', 'Nepal reacts India Pakistan war',
  'Sri Lanka Indo-Pak reaction', 'Saudi Arabia India Pakistan war update', 'Taliban statement on India Pakistan',
  'UAE comments India Pakistan', 'Afghanistan reacts India Pakistan'
];

// Regional Emergency Keywords - State-specific alerts
export const REGIONAL_EMERGENCY_KEYWORDS = {
  // North India States
  'Jammu and Kashmir': [
    'Jammu Kashmir war alert', 'Jammu LoC firing', 'Kashmir border escalation',
    'Kashmir valley alert', 'Jammu border tension', 'Kashmir militant activity'
  ],
  'Punjab': [
    'Punjab border tension', 'Punjab drone infiltration', 'Punjab BSF alert',
    'Amritsar border alert', 'Punjab Pakistan border', 'Punjab security alert'
  ],
  'Himachal Pradesh': [
    'Himachal Pradesh war alert', 'Himachal border alert', 'Shimla security alert',
    'Himachal Pakistan border', 'Himachal military alert'
  ],
  'Uttarakhand': [
    'Uttarakhand border alert', 'Dehradun security alert', 'Uttarakhand Pakistan border',
    'Uttarakhand military alert', 'Uttarakhand war readiness'
  ],
  'Delhi': [
    'Delhi on high alert', 'Delhi war readiness', 'Delhi security alert',
    'Delhi terror threat', 'Delhi military alert', 'Delhi UT missile alert'
  ],
  'Haryana': [
    'Haryana military alert', 'Haryana troop movement', 'Gurgaon security alert',
    'Haryana border alert', 'Haryana war readiness'
  ],

  // West India States
  'Rajasthan': [
    'Rajasthan war alert', 'Rajasthan LoC activity', 'Rajasthan drone alert',
    'Jaipur security alert', 'Rajasthan Pakistan border', 'Rajasthan military alert'
  ],
  'Gujarat': [
    'Gujarat border tension', 'Gujarat coastal alert', 'Gujarat navy drill',
    'Ahmedabad security alert', 'Gujarat Pakistan border', 'Gujarat military alert'
  ],
  'Maharashtra': [
    'Maharashtra terror alert', 'Maharashtra war drill', 'Mumbai security alert',
    'Maharashtra military alert', 'Maharashtra border alert'
  ],
  'Goa': [
    'Goa war zone alert', 'Goa security alert', 'Goa military alert',
    'Goa coastal alert', 'Goa border tension'
  ],

  // East India States
  'Bihar': [
    'Bihar war alert', 'Bihar Pakistan threat', 'Patna security alert',
    'Bihar military alert', 'Bihar border alert'
  ],
  'West Bengal': [
    'West Bengal infiltration alert', 'West Bengal border tension', 'Kolkata security alert',
    'West Bengal military alert', 'West Bengal Pakistan border'
  ],
  'Jharkhand': [
    'Jharkhand war intelligence', 'Jharkhand militant alert', 'Ranchi security alert',
    'Jharkhand military alert', 'Jharkhand border alert'
  ],
  'Odisha': [
    'Odisha border intelligence', 'Odisha coastal surveillance', 'Bhubaneswar security alert',
    'Odisha military alert', 'Odisha Pakistan border'
  ],
  'Chhattisgarh': [
    'Chhattisgarh anti-terror alert', 'Chhattisgarh security alert', 'Raipur military alert',
    'Chhattisgarh border alert', 'Chhattisgarh militant activity'
  ],

  // Central India States
  'Madhya Pradesh': [
    'Madhya Pradesh war update', 'MP India-Pakistan alert', 'Bhopal security alert',
    'Madhya Pradesh military alert', 'MP border alert'
  ],
  'Uttar Pradesh': [
    'UP war news', 'Uttar Pradesh war alert', 'UP border activity',
    'Lucknow security alert', 'UP military alert', 'Uttar Pradesh Pakistan border'
  ],

  // South India States
  'Andhra Pradesh': [
    'Andhra Pradesh alert India Pakistan', 'Andhra Air Force readiness', 'Vijayawada security alert',
    'Andhra Pradesh military alert', 'AP border alert'
  ],
  'Telangana': [
    'Telangana terror alert', 'Telangana war message', 'Hyderabad security alert',
    'Telangana military alert', 'Telangana border alert'
  ],
  'Karnataka': [
    'Karnataka military alert', 'Karnataka India Pakistan conflict', 'Bangalore security alert',
    'Karnataka border alert', 'Karnataka military readiness'
  ],
  'Tamil Nadu': [
    'Tamil Nadu navy alert', 'Tamil Nadu Indo-Pak alert', 'Chennai security alert',
    'Tamil Nadu military alert', 'TN border alert'
  ],
  'Kerala': [
    'Kerala Pakistan support alert', 'Kerala coastal surveillance', 'Thiruvananthapuram security alert',
    'Kerala military alert', 'Kerala border alert'
  ],

  // North-East India States
  'Assam': [
    'Assam war alert', 'Assam terror movement', 'Guwahati security alert',
    'Assam military alert', 'Assam border alert'
  ],
  'Manipur': [
    'Manipur LoC influence', 'Manipur security alert', 'Imphal military alert',
    'Manipur border alert', 'Manipur militant activity'
  ],
  'Meghalaya': [
    'Meghalaya Indo-Pak tension', 'Meghalaya security alert', 'Shillong military alert',
    'Meghalaya border alert', 'Meghalaya Pakistan border'
  ],
  'Mizoram': [
    'Mizoram war alert', 'Mizoram security alert', 'Aizawl military alert',
    'Mizoram border alert', 'Mizoram Pakistan border'
  ],
  'Nagaland': [
    'Nagaland cross-border alert', 'Nagaland security alert', 'Kohima military alert',
    'Nagaland border alert', 'Nagaland militant activity'
  ],
  'Tripura': [
    'Tripura terror watch', 'Tripura security alert', 'Agartala military alert',
    'Tripura border alert', 'Tripura Pakistan border'
  ],
  'Sikkim': [
    'Sikkim war zone news', 'Sikkim security alert', 'Gangtok military alert',
    'Sikkim border alert', 'Sikkim Pakistan border'
  ],
  'Arunachal Pradesh': [
    'Arunachal Pradesh Pakistan mention', 'Arunachal security alert', 'Itanagar military alert',
    'Arunachal border alert', 'Arunachal Pakistan border'
  ],

  // Union Territories
  'Ladakh': [
    'Ladakh LoC alert', 'Ladakh troop movement', 'Ladakh security alert',
    'Ladakh military alert', 'Ladakh Pakistan border'
  ],
  'Andaman and Nicobar': [
    'Andaman Nicobar navy alert', 'Andaman security alert', 'Port Blair military alert',
    'Andaman border alert', 'Andaman Pakistan threat'
  ],
  'Lakshadweep': [
    'Lakshadweep war readiness', 'Lakshadweep security alert', 'Kavaratti military alert',
    'Lakshadweep border alert', 'Lakshadweep Pakistan border'
  ],
  'Chandigarh': [
    'Chandigarh security alert', 'Chandigarh military alert', 'Chandigarh border alert',
    'Chandigarh Pakistan border', 'Chandigarh war readiness'
  ],
  'Puducherry': [
    'Puducherry Air Force drill', 'Puducherry security alert', 'Puducherry military alert',
    'Puducherry border alert', 'Puducherry Pakistan border'
  ],
  'Dadra and Nagar Haveli': [
    'Dadra Nagar Haveli India Pakistan alert', 'Dadra security alert', 'Dadra military alert',
    'Dadra border alert', 'Dadra Pakistan border'
  ],
  'Daman and Diu': [
    'Daman Diu security alert', 'Daman military alert', 'Daman border alert',
    'Daman Pakistan border', 'Daman war readiness'
  ]
};

// National Emergency Keywords - Country-wide alerts
export const NATIONAL_EMERGENCY_KEYWORDS = [
  // Core National Security
  'India Pakistan war', 'India Pakistan conflict', 'India Pakistan border tension',
  'India Pakistan ceasefire violation', 'Indo-Pak war', 'India retaliates Pakistan',
  'Pakistan violates LoC', 'LoC tension India Pakistan', 'cross-border firing',
  'Pakistan drone India border', 'India intercepts Pakistan UAV', 'terror camp destroyed Pakistan',
  'India airstrike Pakistan', 'BSF fires at Pakistan intruders', 'Indian soldier martyred LoC',
  'Pakistani shelling Indian post', 'Pak Army attack India', 'war clouds India Pakistan',
  'Pakistani troops infiltrate', 'India raises war alert', 'Indian Air Force alert',
  'LoC hot zone', 'LoC surveillance alert', 'Pak army mobilizes', 'Indian navy border alert',
  'nuclear threat India Pakistan', 'Pakistan threatens India', 'India defends LoC',
  'militant infiltration LoC', 'India army movement towards border',
  'LoC escalation India Pakistan', 'LoC sniper firing',
  
  // National Defense
  'Indian Army alert', 'Indian Air Force alert', 'Indian Navy alert',
  'BSF alert', 'CRPF alert', 'Indian military alert', 'Indian defense alert',
  'Indian security alert', 'Indian border alert', 'Indian war readiness',
  'Indian military mobilization', 'Indian defense forces', 'Indian armed forces alert',
  'Indian military exercise', 'Indian defense drill', 'Indian security drill',
  'Indian military movement', 'Indian defense preparation', 'Indian war preparation',
  'Indian military readiness', 'Indian defense readiness', 'Indian security readiness',
  
  // National Infrastructure
  'Indian airports alert', 'Indian railways alert', 'Indian ports alert',
  'Indian nuclear facilities', 'Indian power plants alert', 'Indian dams alert',
  'Indian bridges alert', 'Indian highways alert', 'Indian communication alert',
  'Indian internet alert', 'Indian telecom alert', 'Indian satellite alert',
  'Indian space alert', 'Indian ISRO alert', 'Indian DRDO alert',
  
  // National Economy
  'Indian stock market alert', 'Indian rupee alert', 'Indian economy alert',
  'Indian banks alert', 'Indian financial alert', 'Indian trade alert',
  'Indian exports alert', 'Indian imports alert', 'Indian oil alert',
  'Indian gas alert', 'Indian fuel alert', 'Indian energy alert',
  
  // National Health
  'Indian health alert', 'Indian medical alert', 'Indian disease alert',
  'Indian epidemic alert', 'Indian pandemic alert', 'Indian vaccine alert',
  'Indian hospital alert', 'Indian medical emergency', 'Indian health emergency',
  
  // National Environment
  'Indian weather alert', 'Indian climate alert', 'Indian natural disaster',
  'Indian earthquake alert', 'Indian flood alert', 'Indian cyclone alert',
  'Indian tsunami alert', 'Indian forest fire alert', 'Indian air quality alert',
  'Indian pollution alert', 'Indian environmental alert'
];

// International Emergency Keywords - Global alerts
export const INTERNATIONAL_EMERGENCY_KEYWORDS = [
  // Global Conflicts
  'World War III', 'Global war', 'International conflict', 'World conflict',
  'Global military alert', 'International military alert', 'World military alert',
  'Global security alert', 'International security alert', 'World security alert',
  'Global defense alert', 'International defense alert', 'World defense alert',
  
  // Major Powers
  'US military alert', 'US security alert', 'US defense alert', 'US war alert',
  'China military alert', 'China security alert', 'China defense alert', 'China war alert',
  'Russia military alert', 'Russia security alert', 'Russia defense alert', 'Russia war alert',
  'UK military alert', 'UK security alert', 'UK defense alert', 'UK war alert',
  'France military alert', 'France security alert', 'France defense alert', 'France war alert',
  'Germany military alert', 'Germany security alert', 'Germany defense alert', 'Germany war alert',
  'Japan military alert', 'Japan security alert', 'Japan defense alert', 'Japan war alert',
  
  // Regional Conflicts
  'Middle East conflict', 'Middle East war', 'Middle East military alert',
  'Europe conflict', 'Europe war', 'Europe military alert',
  'Asia conflict', 'Asia war', 'Asia military alert',
  'Africa conflict', 'Africa war', 'Africa military alert',
  'Americas conflict', 'Americas war', 'Americas military alert',
  
  // International Organizations
  'UN security alert', 'UN military alert', 'UN defense alert',
  'NATO alert', 'NATO military alert', 'NATO security alert',
  'EU security alert', 'EU military alert', 'EU defense alert',
  'ASEAN security alert', 'ASEAN military alert', 'ASEAN defense alert',
  'G7 security alert', 'G7 military alert', 'G7 defense alert',
  'G20 security alert', 'G20 military alert', 'G20 defense alert',
  
  // Nuclear Threats
  'Nuclear war', 'Nuclear threat', 'Nuclear alert', 'Nuclear missile',
  'Nuclear weapon', 'Nuclear attack', 'Nuclear defense', 'Nuclear security',
  'Nuclear proliferation', 'Nuclear test', 'Nuclear facility',
  
  // Terrorism
  'Global terrorism', 'International terrorism', 'World terrorism',
  'Terror attack', 'Terror threat', 'Terror alert', 'Terror group',
  'ISIS alert', 'Al Qaeda alert', 'Taliban alert', 'Terror organization',
  
  // Cyber Threats
  'Cyber war', 'Cyber attack', 'Cyber threat', 'Cyber alert',
  'Cyber security', 'Cyber defense', 'Cyber warfare', 'Cyber terrorism',
  'Digital war', 'Digital attack', 'Digital threat', 'Digital alert',
  
  // Economic Crises
  'Global economic crisis', 'World economic crisis', 'International economic crisis',
  'Global financial crisis', 'World financial crisis', 'International financial crisis',
  'Global recession', 'World recession', 'International recession',
  'Global market crash', 'World market crash', 'International market crash',
  
  // Health Crises
  'Global pandemic', 'World pandemic', 'International pandemic',
  'Global epidemic', 'World epidemic', 'International epidemic',
  'Global health crisis', 'World health crisis', 'International health crisis',
  'Global disease outbreak', 'World disease outbreak', 'International disease outbreak',
  
  // Environmental Crises
  'Global climate crisis', 'World climate crisis', 'International climate crisis',
  'Global environmental crisis', 'World environmental crisis', 'International environmental crisis',
  'Global natural disaster', 'World natural disaster', 'International natural disaster',
  'Global weather crisis', 'World weather crisis', 'International weather crisis'
];

// Exclusion keywords to filter out unrelated content
export const EXCLUSION_KEYWORDS = [
  'Ukraine', 'Russia', 'Gaza', 'Israel Hamas', 'Palestine', 'Iran', 'Syria',
  'Hezbollah', 'Yemen', 'North Korea', 'South Korea', 'Taiwan', 'China Taiwan',
  'Lebanon', 'ISIS', 'Middle East', 'Red Sea', 'Houthis', 'NATO', 'Sudan',
  'Libya', 'Somalia', 'Ethiopia', 'DR Congo', 'Kosovo', 'Nagorno-Karabakh',
  'Venezuela', 'Global war update', 'World War III', 'International conflict',
  'US missile strike', 'Hezbollah rocket', 'Israel retaliation', 'Iran nuclear',
  'China South Sea', 'Houthi rebels'
];
