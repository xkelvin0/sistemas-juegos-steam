(() => {
"use strict";

// --- ./src/domain/models.ts ---
                                     

                                                                       

                                             
                                                                     
                                                                 
                                                 

                      
                  
                    
                   
                         
              
                 
              
                  

                             
                   
                  
                   
                  
                   
                  
                 
                
                    
          
               
                    

                                
                   
                
                
                     
                 
                   

                      
          
             
                       
                  
                          

                                                                     

                                 
                        
                        
                          
                                   
                                                                                       
 

                              
                      
                              
                         
                            
                                     
                                
                                      
                                         
                                            
                                                
                                    
 

                                   
                                  
                              
                           
                         
                               
                           
                                            
 

                                        
                      
                                    
                                  
                                    
 

                                           
                           
                           
                              
 

                                           
                         
                             
                              
                                                               
                              
    
 

                          
                                                                
                                                                              
                                                                                         
     
                                            
                                
                                           
                                            
     
                                                                   
                                                                    

                          
                                            
                                              

const ok =               (value   )               => ({
  ok: true,
  value,
});

const err =               (error   )               => ({
  ok: false,
  error,
});

const createItemId = (raw        )         => {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    throw new RangeError('ItemId cannot be empty');
  }
  return normalized          ;
};

const createSteamAchievementId = (raw        )                     => {
  const normalized = raw.trim();
  if (normalized.length === 0) {
    throw new RangeError('SteamAchievementId cannot be empty');
  }
  return normalized                      ;
};

const createResistancePoints = (value        )                   => {
  if (!Number.isFinite(value) || value < 0 || !Number.isInteger(value)) {
    throw new RangeError(`ResistancePoints must be a non-negative integer: ${String(value)}`);
  }
  return value                    ;
};

const createBitIndex = (index        )           => {
  if (!Number.isInteger(index) || index < 0) {
    throw new RangeError(`BitIndex must be a non-negative integer: ${String(index)}`);
  }
  return index            ;
};

const isPlainRecord = (value         )                                   =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isValidHexString = (value         )                  =>
  typeof value === 'string' && value.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(value);

const isPersistedState = (value         )                                 => {
  if (!isPlainRecord(value)) {
    return false;
  }
  return (
    value['version'] === 1 &&
    isValidHexString(value['contentBitsetHex']) &&
    isValidHexString(value['steamBitsetHex']) &&
    typeof value['updatedAtEpochMs'] === 'number' &&
    Number.isFinite(value['updatedAtEpochMs']) &&
    value['updatedAtEpochMs'] >= 0
  );
};

const isSteamApiAchievementEntry = (value         )                                    => {
  if (!isPlainRecord(value)) {
    return false;
  }
  const apiname = value['apiname'];
  const achieved = value['achieved'];
  const unlocktime = value['unlocktime'];
  return (
    typeof apiname === 'string' &&
    apiname.length > 0 &&
    (achieved === 0 || achieved === 1) &&
    typeof unlocktime === 'number' &&
    Number.isFinite(unlocktime) &&
    unlocktime >= 0
  );
};

const isSteamAchievementResponse = (
  value         
)                                    => {
  if (!isPlainRecord(value)) {
    return false;
  }
  const playerstats = value['playerstats'];
  if (!isPlainRecord(playerstats)) {
    return false;
  }
  const steamID = playerstats['steamID'];
  const gameName = playerstats['gameName'];
  const success = playerstats['success'];
  const achievements = playerstats['achievements'];

  if (
    typeof steamID !== 'string' ||
    typeof gameName !== 'string' ||
    typeof success !== 'boolean' ||
    !Array.isArray(achievements)
  ) {
    return false;
  }

  for (let i = 0; i < achievements.length; i += 1) {
    if (!isSteamApiAchievementEntry(achievements[i])) {
      return false;
    }
  }
  return true;
};


// --- ./src/data/farcry5-catalog.ts ---

const STEAM_APP_ID = 552520         ;

const CATEGORY_QUOTAS                                            = {
  STORY_MISSION: 65,
  SIDE_MISSION: 45,
  PREPPER_STASH: 28,
  CULT_OUTPOST: 21,
  CULT_PROPERTY: 43,
  CLUTCH_NIXON: 8,
  COLLECTIBLE: 68,
  SPECIALIST: 9,
  FISHING_RECORD: 12,
  PERK: 50,
  CHALLENGE: 69,
  DLC_OBJECTIVE: 30,
};

const STEAM_SCOPE_QUOTAS                                     = {
  base: 50,
  ng_plus: 1,
  hours_of_darkness: 7,
  lost_on_mars: 7,
  dead_living_zombies: 7,
};

const REGION_METADATA                                             = {
  dutch_island: {
    id: 'dutch_island',
    name: "Dutch's Island",
    herald: 'Richard "Dutch" Roosevelt (Prólogo)',
    maxRp: createResistancePoints(0),
    thresholds: [
      createResistancePoints(0),
      createResistancePoints(0),
      createResistancePoints(0),
    ],
  },
  holland_valley: {
    id: 'holland_valley',
    name: 'Holland Valley',
    herald: 'John Seed',
    maxRp: createResistancePoints(13000),
    thresholds: [
      createResistancePoints(4000),
      createResistancePoints(8500),
      createResistancePoints(13000),
    ],
  },
  henbane_river: {
    id: 'henbane_river',
    name: 'Henbane River',
    herald: 'Faith Seed',
    maxRp: createResistancePoints(13000),
    thresholds: [
      createResistancePoints(4500),
      createResistancePoints(9000),
      createResistancePoints(13000),
    ],
  },
  whitetail_mountains: {
    id: 'whitetail_mountains',
    name: 'Whitetail Mountains',
    herald: 'Jacob Seed',
    maxRp: createResistancePoints(10000),
    thresholds: [
      createResistancePoints(3000),
      createResistancePoints(6500),
      createResistancePoints(10000),
    ],
  },
  compound: {
    id: 'compound',
    name: "Joseph's Compound",
    herald: 'Joseph Seed (El Padre)',
    maxRp: createResistancePoints(0),
    thresholds: [
      createResistancePoints(0),
      createResistancePoints(0),
      createResistancePoints(0),
    ],
  },
  dlc_vietnam: {
    id: 'dlc_vietnam',
    name: 'DLC 1: Hours of Darkness',
    herald: 'Wendell Redler (Vietnam)',
    maxRp: createResistancePoints(0),
    thresholds: [
      createResistancePoints(0),
      createResistancePoints(0),
      createResistancePoints(0),
    ],
  },
  dlc_mars: {
    id: 'dlc_mars',
    name: 'DLC 2: Lost on Mars',
    herald: 'Nick Rye & Hurk (Marte)',
    maxRp: createResistancePoints(0),
    thresholds: [
      createResistancePoints(0),
      createResistancePoints(0),
      createResistancePoints(0),
    ],
  },
  dlc_zombies: {
    id: 'dlc_zombies',
    name: 'DLC 3: Dead Living Zombies',
    herald: 'Guy Marvel (7 Películas)',
    maxRp: createResistancePoints(0),
    thresholds: [
      createResistancePoints(0),
      createResistancePoints(0),
      createResistancePoints(0),
    ],
  },
};

                           
                      
                         
                            
                                     
                                
                            
                               
                                             
                                                
                                    
 

                         
                      
                           
                         
                               
                           
                                             
 

// 1. MISIONES DE HISTORIA (65 - Alineadas con Far Cry Wiki)
const STORY_DRAFTS                             = [
  // Cult's Compound - Prólogo (2) + Dutch's Island (4)
  { id: 'story_di_01', title: 'The Warrant (La Orden de Arresto)', region: 'compound', category: 'STORY_MISSION', locationHint: 'Cult\'s Compound (Joseph Seed) -> Prólogo inicial', rpReward: 0 },
  { id: 'story_di_02', title: 'No Way Out (Sin Salida)', region: 'compound', category: 'STORY_MISSION', locationHint: 'Cult\'s Compound -> Huida en camioneta con el Marshal Burke', rpReward: 0, prerequisites: ['story_di_01'] },
  { id: 'story_di_03', title: 'A Glimmer of Hope (Un Rayo de Esperanza)', region: 'dutch_island', category: 'STORY_MISSION', locationHint: 'Búnker de Dutch en Dutch\'s Island', rpReward: 0, prerequisites: ['story_di_02'] },
  { id: 'story_di_04', title: 'The Resistance (La Resistencia)', region: 'dutch_island', category: 'STORY_MISSION', locationHint: 'Campamento de rescate en Dutch\'s Island', rpReward: 0, prerequisites: ['story_di_03'] },
  { id: 'story_di_04b', title: 'Guns for Hire (Especialistas a Sueldo)', region: 'dutch_island', category: 'STORY_MISSION', locationHint: 'Muelle norte de Dutch\'s Island', rpReward: 0, prerequisites: ['story_di_03'] },
  { id: 'story_di_05', title: 'Do Not Go Gently (Liberar Torre de Radio de Dutch)', region: 'dutch_island', category: 'STORY_MISSION', locationHint: 'Torre de Radio central en Dutch\'s Island', rpReward: 0, prerequisites: ['story_di_04', 'story_di_04b'] },

  // Holland Valley - John Seed (21)
  { id: 'story_hv_01', title: "Fall's End (Liberar Fall's End)", region: 'holland_valley', category: 'STORY_MISSION', locationHint: "Pueblo de Fall's End (Centro de Holland Valley)", rpReward: 900, prerequisites: ['story_di_05'], missableWarning: 'Completar manualmente antes de alcanzar Nivel 2 de RP para no perder su diálogo inicial.' },
  { id: 'story_hv_20', title: 'No Means No (Destruir el Cartel YES de John)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Colina al norte de Fall\'s End (disparar o bombardear el cartel YES)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hv_02', title: "Man's Best Friend (Reclutar a Boomer)", region: 'holland_valley', category: 'STORY_MISSION', locationHint: "Rae-Rae's Pumpkin Farm (Oeste de Fall's End)", rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hv_04', title: 'Wingman (Reclutar a Nick Rye)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Rye & Sons Aviation y Seed Ranch', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hv_03', title: 'Grace Under Fire (Reclutar a Grace Armstrong)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Iglesia Lamb of God (Suroeste de Holland Valley)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hv_16', title: 'The Cleansing (La Purificación - Captura Nivel 1)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Evento automático al alcanzar 4,000 RP en Holland Valley', rpReward: 900, requiredRp: 4000, prerequisites: ['story_di_05'] },
  { id: 'story_hv_17', title: 'The Confession (La Confesión - Captura Nivel 2)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Búnker de John Seed al alcanzar 8,500 RP', rpReward: 900, requiredRp: 8500, prerequisites: ['story_hv_16'] },
  { id: 'story_hv_14', title: 'The Revelator (El Revelador)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Carreteras de Holland Valley (Nivel 2+ de Resistencia)', rpReward: 900, requiredRp: 8500, prerequisites: ['story_di_05'] },
  { id: 'story_hv_06', title: 'Good Samaritan (Buen Samaritano)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Granja de Boyd / Pastor Jerome en Fall\'s End', rpReward: 600, prerequisites: ['story_hv_01'] },
  { id: 'story_hv_09', title: 'The Widowmaker (El Hacedor de Viudas)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Spread Eagle Bar (Mary May Fairgrave)', rpReward: 600, prerequisites: ['story_hv_01'] },
  { id: 'story_hv_10', title: 'Hit the Gas (Pisa el Acelerador)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: "Entregar 2 camiones cisterna a Fall's End", rpReward: 600, prerequisites: ['story_hv_01'], missableWarning: 'PERDIBLE: Si derrotas a John Seed antes de entregar los 2 camiones, desaparece.' },
  { id: 'story_hv_08', title: 'The Scattered Flock (El Rebaño Disperso)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Rehenes del culto en Holland Valley (Pastor Jerome)', rpReward: 900, prerequisites: ['story_hv_01'] },
  { id: 'story_hv_07', title: 'Jumping Ship (Abandonar el Barco)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Granja al este de la Iglesia Lamb of God', rpReward: 600, prerequisites: ['story_hv_06'] },
  { id: 'story_hv_11', title: 'Razing the Steaks (Carne a la Brasa)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Flatiron Stockyards (Norte de Holland Valley, Casey Fixman)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hv_12', title: 'Blow Their Mine (Volar su Mina)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Taft Lookout Tower (Noroeste de Holland Valley)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hv_13', title: 'Death Wish (Deseo de Muerte)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'US Auto -> Grain Elevator (Merle Briggs)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hv_05', title: 'Air Raid (Ataque Aéreo)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Rye & Sons Aviation (Kim Rye)', rpReward: 600, prerequisites: ['story_hv_04'] },
  { id: 'story_hv_18', title: 'The Atonement (La Expiación - Captura Nivel 3)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: "Iglesia de Fall's End al alcanzar 13,000 RP", rpReward: 900, requiredRp: 13000, prerequisites: ['story_hv_17'] },
  { id: 'story_hv_19', title: 'Wrath (Ira - Duelo Aéreo contra John Seed)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: "Espacio aéreo sobre Fall's End", rpReward: 0, requiredRp: 13000, prerequisites: ['story_hv_18'] },
  { id: 'story_hv_quality_of_mercy', title: 'The Quality of Mercy (Liberar Búnker de John Seed)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Holland Valley Silo Bunker (Oeste de Holland Valley)', rpReward: 0, requiredRp: 13000, prerequisites: ['story_hv_19'] },
  { id: 'story_hv_15', title: 'Special Delivery (Entrega Especial)', region: 'holland_valley', category: 'STORY_MISSION', locationHint: 'Rye & Sons Aviation (Kim y Nick Rye tras liberar la región)', rpReward: 0, prerequisites: ['story_hv_quality_of_mercy'] },

  // Henbane River - Faith Seed (20)
  { id: 'story_hr_01', title: 'Hope County Jail (Defender la Cárcel)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Hope County Jail (Suroeste de Henbane River, Sheriff Whitehorse)', rpReward: 900, prerequisites: ['story_di_05'] },
  { id: 'story_hr_02', title: 'Here Kitty, Kitty (Reclutar a Peaches)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Peaches Taxidermy (Norte de Henbane River, Mables)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hr_15', title: 'A Leap of Faith (Salto de Fe - Visión Nivel 1)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Estatua de Joseph Seed al alcanzar 4,500 RP', rpReward: 900, requiredRp: 4500, prerequisites: ['story_di_05'] },
  { id: 'story_hr_04', title: 'Friendly Skies (Reclutar a Adelaide Drubman)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Drubman Marina (Noreste de Henbane River)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hr_03', title: 'Burn, Baby, Burn! (Reclutar a Sharky Boshaw)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Moonflower Trailer Park (Centro de Henbane River)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_hr_09', title: 'Eco-Warriors (Ecoguerreros)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Puente ferroviario al norte de Drubman Marina (Xander)', rpReward: 600, prerequisites: ['story_hr_04'] },
  { id: 'story_hr_10', title: 'False Prophet (Falso Profeta - Destruir Estatua del Padre)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Colina central de Henbane River (Tracy Lader)', rpReward: 900, prerequisites: ['story_hr_01'] },
  { id: 'story_hr_16', title: 'The Bliss (El Gozo - Visión Nivel 2)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Rescate del Alguacil Burke al alcanzar 9,000 RP', rpReward: 900, requiredRp: 9000, prerequisites: ['story_hr_15'] },
  { id: 'story_hr_05', title: 'Clean Water Act (Ley de Agua Limpia)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Planta de Tratamiento de Agua de Deep North (Virgil Minkler)', rpReward: 600, prerequisites: ['story_hr_01'] },
  { id: 'story_hr_07', title: 'Sins of the Father (Pecados del Padre)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Feeney Residence y Jessop Conservatory (Virgil Minkler)', rpReward: 600, prerequisites: ['story_hr_05', 'story_hr_06'] },
  { id: 'story_hr_06', title: 'Salvation (Salvación)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'McClean Residence (Sur de Henbane River, Alcalde Virgil)', rpReward: 600, prerequisites: ['story_hr_01'] },
  { id: 'story_hr_17', title: 'Ignorance Is Bliss (La Ignorancia da la Felicidad - Nivel 3)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Hope County Jail al alcanzar 13,000 RP', rpReward: 900, requiredRp: 13000, prerequisites: ['story_hr_16'] },
  { id: 'story_hr_12', title: "Doctor's Orders (Órdenes del Médico)", region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Mastodon Geothermal Park (Dr. Charles Lindsey)', rpReward: 600, prerequisites: ['story_hr_01'] },
  { id: 'story_hr_13', title: 'Clinical Study (Estudio Clínico)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Hope County Jail (Dr. Charles Lindsey - Cebos para Ángeles)', rpReward: 600, prerequisites: ['story_hr_12'] },
  { id: 'story_hr_14', title: 'Turn the Tables (Cambiar las Tornas)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Moonflower Trailer Park (Dr. Charles Lindsey)', rpReward: 600, prerequisites: ['story_hr_13'] },
  { id: 'story_hr_11', title: 'Serve and Protect (Servir y Proteger - Rescatar 20 Rehenes)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Hope County Jail (Sheriff Whitehorse)', rpReward: 900, prerequisites: ['story_hr_01'] },
  { id: 'story_hr_08', title: 'War on Drugs (Guerra contra las Drogas)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Destruir 5 barcos y 5 camiones de Gozo en Henbane River (Virgil)', rpReward: 900, prerequisites: ['story_hr_01'] },
  { id: 'story_hr_18', title: 'The Lesson (La Lección - Combate contra Faith Seed)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Campo del Gozo tras defender la cárcel en Nivel 3', rpReward: 0, requiredRp: 13000, prerequisites: ['story_hr_17'] },
  { id: 'story_hr_19', title: 'Paradise Lost (Paraíso Perdido)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Interior del Búnker de producción de Gozo de Faith', rpReward: 0, requiredRp: 13000, prerequisites: ['story_hr_18'] },
  { id: 'story_hr_walk_the_path', title: 'Walk the Path (Recorre el Camino - Liberar Búnker de Faith)', region: 'henbane_river', category: 'STORY_MISSION', locationHint: 'Henbane River Bunker (Noroeste de Henbane River)', rpReward: 0, requiredRp: 13000, prerequisites: ['story_hr_19'] },

  // Whitetail Mountains - Jacob Seed (17)
  { id: 'story_wm_11', title: 'Baron Lumber Mill (Liberar el Aserradero para Jess Black)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Baron Lumber Mill (Sur de Whitetail Mountains)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_wm_02', title: 'A Dish Served Cold (Reclutar a Jess Black)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Baron Lumber Mill -> Campamento del Cocinero (Jess Black)', rpReward: 600, prerequisites: ['story_wm_11'] },
  { id: 'story_wm_03', title: 'Missing in Action (Desaparecidos en Combate)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: "Wolf's Den Bunker -> Hawkeye Tunnel (Eli Palmer)", rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_wm_01', title: 'A Right to Bear Arms (Reclutar a Cheeseburger)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'F.A.N.G. Center -> Linero Building Supplies (Wade Fowler)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_wm_12', title: 'The Prodigal Son (Reclutar a Hurk Drubman Jr.)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Fort Drubman (Frontera sureste de Whitetail, Hurk Sr.)', rpReward: 600, prerequisites: ['story_di_05'] },
  { id: 'story_wm_13', title: 'Make Hope Great Again (Campaña de Hurk Sr.)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Fort Drubman -> Puesto de observación del culto', rpReward: 600, prerequisites: ['story_wm_12'] },
  { id: 'story_wm_14', title: 'The World Is Weak (El Mundo es Débil - Captura Nivel 1)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'St. Francis Veterans Center al alcanzar 3,000 RP', rpReward: 800, requiredRp: 3000, prerequisites: ['story_di_05'] },
  { id: 'story_wm_15', title: 'We Must Be Strong (Debemos Ser Fuertes - Captura Nivel 2)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'St. Francis Veterans Center al alcanzar 6,500 RP', rpReward: 800, requiredRp: 6500, prerequisites: ['story_wm_14'] },
  { id: 'story_wm_06', title: 'Gearing Up (Equipándose)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: "Wolf's Den -> Cooper Cabin Bunkers (Wheaty)", rpReward: 600, prerequisites: ['story_wm_03'] },
  { id: 'story_wm_16', title: 'Sacrifice the Weak (Sacrifica a los Débiles - Captura Nivel 3)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: "Prueba final y asalto a Wolf's Den al alcanzar 10,000 RP", rpReward: 800, requiredRp: 10000, prerequisites: ['story_wm_15'] },
  { id: 'story_wm_10', title: 'Dinner Time (Hora de Cenar)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Capturar un lobo Juez vivo para Tammy Barnes', rpReward: 600, prerequisites: ['story_wm_03'] },
  { id: 'story_wm_04', title: 'Get Free (Libérate)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Grand View Hotel (Sur de Langford Lake, Eli Palmer)', rpReward: 600, prerequisites: ['story_wm_03'], missableWarning: 'PERDIBLE: Debe completarse antes de alcanzar 10,000 RP porque Eli Palmer muere en Nivel 3.' },
  { id: 'story_wm_08', title: 'Radio Silence (Silencio de Radio)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Torres de interferencia de Tammy Barnes en Whitetail', rpReward: 600, prerequisites: ['story_wm_03'] },
  { id: 'story_wm_05', title: 'Search and Rescue (Búsqueda y Rescate)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Rescatar a 5 miembros de la Milicia Whitetail en la montaña', rpReward: 900, prerequisites: ['story_wm_03'] },
  { id: 'story_wm_09', title: 'Eviction Notice (Aviso de Desahucio)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Loresca Cabin (Tammy Barnes - Demoler puesto de Elegidos)', rpReward: 600, prerequisites: ['story_wm_08'] },
  { id: 'story_wm_17', title: 'Only You (Solo Tú - Duelo en la Montaña contra Jacob)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Cima norte de St. Francis Veterans Center', rpReward: 0, requiredRp: 10000, prerequisites: ['story_wm_16'] },
  { id: 'story_wm_only_you', title: 'Casualties of War (Bajas de Guerra - Liberar Armería de Jacob)', region: 'whitetail_mountains', category: 'STORY_MISSION', locationHint: 'Whitetail Armory Bunker (Norte de Whitetail Mountains)', rpReward: 0, requiredRp: 10000, prerequisites: ['story_wm_17'] },

  // Cult's Compound - Final (1)
  { id: 'story_cp_where_it_all_began', title: 'Where It All Began (Donde Todo Empezó - Final Joseph Seed)', region: 'compound', category: 'STORY_MISSION', locationHint: 'Iglesia de Joseph Seed en la isla central (tras liberar las 3 regiones)', rpReward: 0, prerequisites: ['story_hv_quality_of_mercy', 'story_hr_walk_the_path', 'story_wm_only_you'] },
];

// 2. MISIONES SECUNDARIAS (45)
const SIDE_MISSION_DRAFTS                             = [
  // Holland Valley (18)
  { id: 'side_hv_01', title: "Light 'Em Up (Destruir los 14 Silos de John)", region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Rye & Sons Aviation (Kim Rye)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_02', title: 'Valley Armed Convoy (Destruir 3 Convoyes Armados)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Carreteras de Holland Valley (Desbloquea en Nivel 1 RP)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_03', title: 'Golden Age Nostalgia (12 Cómics Coleccionables)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Boyd Residence (Norte de Holland Valley, Kellett)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_04', title: 'What They Carried (12 Encendedores de Vietnam)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Miller Residence (Oeste de Fall\'s End, Wendell Redler)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_05', title: 'Free Larry (Liberar a Larry Parker)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: "Parker Laboratories (Oeste de Fall's End)", rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_06', title: "The Hero's Journey (El Viaje del Héroe)", region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Torre de Radio al sur de Parker Laboratories (Larry Parker)', rpReward: 400, prerequisites: ['side_hv_05'] },
  { id: 'side_hv_07', title: 'Close Encounters (Encuentros Cercanos - Círculos de Cultivo)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Granja de pollos al norte de Parker Laboratories (Larry Parker)', rpReward: 400, prerequisites: ['side_hv_06'] },
  { id: 'side_hv_08', title: 'Out of This World (Fuera de Este Mundo - Arma Magnopulser)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Parker Laboratories (Activar el generador de Larry Parker)', rpReward: 400, prerequisites: ['side_hv_07'] },
  { id: 'side_hv_09', title: 'Testy Festy (Preparativos del Festival)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: "Spread Eagle Bar en Fall's End (Casey Fixman)", rpReward: 400, prerequisites: ['story_hv_01'] },
  { id: 'side_hv_10', title: 'Prairie Oyster Harvest (Cosecha de Criadillas)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Davenport Farm (Recolectar 3 criadillas de toro de distintas formas)', rpReward: 400, prerequisites: ['side_hv_09'] },
  { id: 'side_hv_11', title: 'Taste of Your Own Medicine (El Festival Testy Festy)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: "Fall's End (Hablar con Casey Fixman tras la cosecha)", rpReward: 400, prerequisites: ['side_hv_10'] },
  { id: 'side_hv_12', title: 'Patriot Acts (Actos Patrióticos)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Howard Cabin (Torre de vigilancia al este de Holland Valley, Willis Huntley)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_13', title: 'Uncrate (Liberar Prisioneros de Contenedores)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Copperhead Rail Yard (Sur de Holland Valley)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_14', title: 'Water Works (Obras Hidráulicas)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Sunrise Threshing (Sur de Fall\'s End)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_15', title: 'Exodus (Éxodo)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Sunrise Farm (Rescatar rehenes del camión del culto)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_16', title: 'Bear Necessities (Lo Más Vital)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Gardenview Packing Facility (Norte de Holland Valley)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_17', title: 'The Judge Moose (El Alce Juez)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Green-Busch Fertilizer Co. (Norte de Holland Valley)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hv_18', title: 'Cow Punching (Ganado Explosivo)', region: 'holland_valley', category: 'SIDE_MISSION', locationHint: 'Flatiron Stockyards (Norte de Holland Valley)', rpReward: 400, prerequisites: ['story_di_05'] },

  // Henbane River (15)
  { id: 'side_hr_01', title: 'River Armed Convoy (Destruir Barcos Artillados)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Río de Henbane River (Desbloquea en Nivel 1 RP)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_02', title: 'Whiskey River (15 Barriles de Whisky)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Silver Lake Boathouse (Oeste de Henbane River, Sherri Woodhouse)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_03', title: 'Our Better Angels (Nuestros Mejores Ángeles)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Nolan\'s Fly Shop (Oeste de Henbane River)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_04', title: 'Fast (Rápido)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Drubman Marina -> Moonflower Trailer Park', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_05', title: 'Furious (Furioso - Crear Homeopathics)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Moonflower Trailer Park (Químico Tweak)', rpReward: 400, prerequisites: ['side_hr_04'] },
  { id: 'side_hr_06', title: 'Blood Dragon 3 (Rodaje de Guy Marvel)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Grimalkin Radon Mine (Oeste de Hope County Jail, Guy Marvel)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_07', title: 'Walk the Walk (Predicar con el Ejemplo)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Grimalkin Radon Mine (Segundo encargo de Guy Marvel)', rpReward: 400, prerequisites: ['side_hr_06'] },
  { id: 'side_hr_08', title: 'quiet on the Set (Silencio en el Rodaje)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Grimalkin Radon Mine (Eliminar ruido y Ángeles para Guy Marvel)', rpReward: 400, prerequisites: ['side_hr_07'] },
  { id: 'side_hr_09', title: 'Refuel (Repostaje)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: "Lorna's Truck Stop (Oeste de Henbane River)", rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_10', title: 'Mint Condition (Estado Impecable)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: "Lorna's Truck Stop (Recuperar la camioneta clásica)", rpReward: 400, prerequisites: ['side_hr_09'] },
  { id: 'side_hr_11', title: 'Broken Path (Camino Roto)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Sendero de peregrinación del Padre en Henbane River', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_12', title: 'Eco-Warriors (Ecoguerreros)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Puente ferroviario al norte de Drubman Marina (Xander)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_13', title: 'The Judge Cougar (El Puma Juez)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Vía férrea abandonada al este de Henbane River', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_14', title: 'The Judge Bear (El Oso Juez)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Cueva al norte de King\'s Hot Springs Hotel', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_hr_15', title: 'Friendly Fire (Fuego Amigo)', region: 'henbane_river', category: 'SIDE_MISSION', locationHint: 'Campamento de resistencia cerca de Eden\'s Convent', rpReward: 400, prerequisites: ['story_di_05'] },

  // Whitetail Mountains (12)
  { id: 'side_wm_01', title: 'Call of the Wild (Destruir las 10 Balizas del Lobo)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: "Wolf's Den Bunker (Tammy Barnes)", rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_02', title: 'Mountain Armed Convoy (Destruir 3 Helicópteros del Culto)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'Espacio aéreo de Whitetail Mountains (Nivel 1 RP)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_03', title: 'Grand Slam (9 Cartas de Béisbol Cougars)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: "Oberlin Picnic Area (Oeste de Wolf's Den,ocs)", rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_04', title: 'The Go-Getters (10 Cabezones de Cheeseburger)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'F.A.N.G. Center (Tienda de recuerdos de Cheeseburger)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_05', title: 'Turn the Tables (10 Cajas de Vinilos para Wheaty)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: "Wolf's Den Bunker (Wheaty - Radio libre de Hope County)", rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_06', title: 'The Admiral (Pescar a El Almirante con Skylar)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'Lago Langford (Skylar Kohrs tras Tools of the Trade)', rpReward: 400, prerequisites: ['story_wm_13'] },
  { id: 'side_wm_07', title: 'Grill Streak (Racha a la Parrilla)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'Baron Lumber Mill (Chad Wolanski - Carne atropellada)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_08', title: 'Flavor Country (El País del Sabor)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'Baron Lumber Mill (Segundo encargo de Chad Wolanski - Bisontes)', rpReward: 400, prerequisites: ['side_wm_07'] },
  { id: 'side_wm_09', title: 'Welcome Party (Fiesta de Bienvenida)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'Puente al sur de Whitetail Park Ranger Station', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_10', title: 'Static Frequency (Frecuencia Estática)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'PIN-K0 Radar Station (Noreste de Whitetail Mountains)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_11', title: 'Shooting Gallery (Galería de Tiro)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'McKinley Dam (Río al sur de Whitetail Mountains)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'side_wm_12', title: 'Nature Provides (La Naturaleza Provee)', region: 'whitetail_mountains', category: 'SIDE_MISSION', locationHint: 'Breakneck Trailer Park (Oeste de Whitetail Mountains)', rpReward: 400, prerequisites: ['story_di_05'] },
];

// 3. ESCONDITES DE PREPARACIONISTA / PREPPER STASHES (28)
const PREPPER_STASH_DRAFTS                             = [
  // Dutch's Island (1)
  { id: 'stash_di_01', title: 'Sunken Funds (Fondos Hundidos)', region: 'dutch_island', category: 'PREPPER_STASH', locationHint: 'Cobertizo de botes al suroeste de Dutch\'s Island (drenar agua)', rpReward: 0 },

  // Holland Valley (11)
  { id: 'stash_hv_01', title: 'Swinggers (Columpios / Puente Ferroviario)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Puente Southfield al suroeste de Holland Valley (usar gancho)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_02', title: 'High Tension (Alta Tensión)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Torre de agua en Lincoln Lookout Tower (tirolina al silo)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_03', title: 'D.I.Y. and D.O.A. (Bricolaje Mortal)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Doverspike Compound (Sur de Fall\'s End, búnker con trampas)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_04', title: 'Fire in the Hole (Fuego en el Agujero)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Mina Wellington (Oeste de Holland Valley, destruir tablas con C4)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_05', title: 'Deep Dive (Inmersión Profunda)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Laurel Residence (Noroeste de Fall\'s End, bomba de agua)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_06', title: 'Man Cave (Cueva de Hombre)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Sunrise Despacho de grúas (Este de Fall\'s End, abrir portón con grúa)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_07', title: 'Playing with Fire (Jugando con Fuego)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Tubería de drenaje al norte de Fall\'s End (cuidado con el oso)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_08', title: 'Long Range Lockpick (Ganzúa de Largo Alcance)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Puente cubierto al este de Seed Ranch (disparar al cerrojo desde la roca)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_09', title: 'Vespiary (Avispero)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Grain Elevator abandonado al norte de US Auto (nidos de avispas)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_10', title: 'Foxhole (Trinchera)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'Armstrong Residence (Oeste de Holland Valley, casa en ruinas)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hv_11', title: 'Dumpster Diving (Buceo en el Contenedor)', region: 'holland_valley', category: 'PREPPER_STASH', locationHint: 'US Auto (Taller mecánico al noroeste de Fall\'s End)', rpReward: 200, prerequisites: ['story_di_05'] },

  // Henbane River (8)
  { id: 'stash_hr_01', title: "O'Hara's Haunted House (Casa Embrujada de O'Hara)", region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Frontera suroeste de Henbane River junto a Holland Valley (activar interruptor del granero)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hr_02', title: "Dead Man's Treasure (El Tesoro del Hombre Muerto)", region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Dead Man\'s Mill (Cascada al norte de Henbane River, rueda hidráulica)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hr_03', title: "Angel's Grave (La Tumba del Ángel)", region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Hornet\'s Nest (Cueva geotérmica al sur de Henbane River)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hr_04', title: 'Overwatch (Vigilancia)', region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Raptor Peak (Torre de incendios al centro de Henbane River)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hr_05', title: 'Pooper Scooper (Recogedor)', region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Silver Lake Summer Camp (Cabañas al noroeste de Henbane River)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hr_06', title: 'Animal Control (Control Animal)', region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Howling Cave (Cueva de lobos al este de Peaches Taxidermy)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hr_07', title: 'Getaway (Huida)', region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Taller mecánico al sur de Peaches Taxidermy', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_hr_08', title: 'Side Effects (Efectos Secundarios)', region: 'henbane_river', category: 'PREPPER_STASH', locationHint: 'Bright Warden Radon Spa (Mina al oeste de Hope County Jail)', rpReward: 200, prerequisites: ['story_di_05'] },

  // Whitetail Mountains (8)
  { id: 'stash_wm_01', title: 'Shipwreck (Naufragio)', region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Tanque de agua hundido en Silver Lake (Suroeste de Whitetail)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_wm_02', title: 'Salvage Rites (Derechos de Salvamento)', region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Lago al sur de Baron Lumber Mill (bucear hasta el avión hundido)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_wm_03', title: "Gone Squatchin' (En Busca de Pie Grande)", region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Dansky Cabin (Cabaña al sur de F.A.N.G. Center, seguir rastros a la cueva)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_wm_04', title: 'Unwelcome Guest (Huésped No Deseado)', region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Frank\'s Cabin (Oeste de F.A.N.G. Center, oso con la llave en la cueva)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_wm_05', title: 'Cliffhanger (Al Borde del Abismo)', region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Ozhigwan Falls (Camioneta colgando de la cascada al oeste de Whitetail)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_wm_06', title: 'Mayday (Accidente Aéreo)', region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Puente ferroviario al norte de Cedar Lake (escalar hasta el avión estrellado)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_wm_07', title: 'Hangar Pains (Dolores de Hangar)', region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Lansdowne Airstrip (Norte de Whitetail Mountains, entrar por el techo del hangar)', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'stash_wm_08', title: 'The Holdouts Stash (El Búnker de los Elliott)', region: 'whitetail_mountains', category: 'PREPPER_STASH', locationHint: 'Elliott Residence (Noroeste de Whitetail Mountains, detrás de la casa)', rpReward: 200, prerequisites: ['story_di_05'] },
];

// 4. PUESTOS DEL CULTO / CULT OUTPOSTS (21)
const CULT_OUTPOST_DRAFTS                             = [
  // Dutch's Island (1)
  { id: 'outpost_di_ranger_station', title: 'Ranger Station (Estación de Guardabosques)', region: 'dutch_island', category: 'CULT_OUTPOST', locationHint: 'Centro-norte de Dutch\'s Island', rpReward: 0 },

  // Holland Valley (7)
  { id: 'outpost_hv_copperhead', title: 'Copperhead Rail Yard', region: 'holland_valley', category: 'CULT_OUTPOST', locationHint: 'Suroeste de Holland Valley (Estación ferroviaria)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hv_gardenview', title: 'Gardenview Packing Facility', region: 'holland_valley', category: 'CULT_OUTPOST', locationHint: 'Noreste de Holland Valley (Planta empacadora)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hv_green_busch', title: 'Green-Busch Fertilizer Co.', region: 'holland_valley', category: 'CULT_OUTPOST', locationHint: 'Norte de Holland Valley (Planta de fertilizantes)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hv_kellett', title: 'Kellett Cattle Co.', region: 'holland_valley', category: 'CULT_OUTPOST', locationHint: 'Este de Holland Valley (Rancho ganadero)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hv_seed_ranch', title: 'Seed Ranch (Rancho de John Seed)', region: 'holland_valley', category: 'CULT_OUTPOST', locationHint: 'Sur de Holland Valley (Pista y mansión de John)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hv_sunrise_farm', title: 'Sunrise Farm', region: 'holland_valley', category: 'CULT_OUTPOST', locationHint: 'Centro-sur de Holland Valley (Granja de calabazas)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hv_us_auto', title: 'US Auto', region: 'holland_valley', category: 'CULT_OUTPOST', locationHint: 'Noroeste de Fall\'s End (Desguace de autos)', rpReward: 400, prerequisites: ['story_di_05'] },

  // Henbane River (8)
  { id: 'outpost_hr_drubman_marina', title: 'Drubman Marina', region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Noroeste de Henbane River (Puerto deportivo de Adelaide)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hr_edens_convent', title: "Eden's Convent (Convento del Edén)", region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Norte de Henbane River (Monasterio en la colina)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hr_jessop', title: 'Jessop Conservatory', region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Este de Henbane River (Invernaderos de Gozo)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hr_kings_hotel', title: "King's Hot Springs Hotel", region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Noreste de Henbane River (Hotel gran montaña)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hr_lornas', title: "Lorna's Truck Stop", region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Oeste de Henbane River (Parada de camiones)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hr_nolans', title: "Nolan's Fly Shop", region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Suroeste de Henbane River junto al río', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hr_sacred_skies', title: 'Sacred Skies Youth Camp', region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Lago al norte de Henbane River (Campamento juvenil)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_hr_whistling_beaver', title: 'Whistling Beaver Brewery', region: 'henbane_river', category: 'CULT_OUTPOST', locationHint: 'Este de Henbane River junto al río (Cervecería)', rpReward: 400, prerequisites: ['story_di_05'] },

  // Whitetail Mountains (5)
  { id: 'outpost_wm_baron_lumber', title: 'Baron Lumber Mill', region: 'whitetail_mountains', category: 'CULT_OUTPOST', locationHint: 'Sur de Whitetail Mountains (Aserradero)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_wm_elk_jaw', title: 'Elk Jaw Lodge', region: 'whitetail_mountains', category: 'CULT_OUTPOST', locationHint: 'Oeste de Whitetail Mountains (Cabaña de caza)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_wm_fang_center', title: 'F.A.N.G. Center', region: 'whitetail_mountains', category: 'CULT_OUTPOST', locationHint: 'Centro de Whitetail Mountains (Hogar de Cheeseburger)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_wm_pin_k0', title: 'PIN-K0 Radar Station', region: 'whitetail_mountains', category: 'CULT_OUTPOST', locationHint: 'Cima noreste de Whitetail Mountains (Base de radar)', rpReward: 400, prerequisites: ['story_di_05'] },
  { id: 'outpost_wm_whitetail_park', title: 'Whitetail Park Ranger Station', region: 'whitetail_mountains', category: 'CULT_OUTPOST', locationHint: 'Sureste de Whitetail Mountains (Estación del parque)', rpReward: 400, prerequisites: ['story_di_05'] },
];

// 5. PROPIEDADES DEL CULTO / CULT PROPERTIES (43)
const CULT_PROPERTY_DRAFTS                             = [
  // 14 Silos de Grano en Holland Valley + Cartel YES
  { id: 'prop_hv_silo_01', title: 'Silo #1: Seed Ranch', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Lado este del puesto Seed Ranch', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_02', title: 'Silo #2: Lowery', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Granja al norte de Seed Ranch', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_03', title: 'Silo #3: Sunrise Farm', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Dentro del puesto Sunrise Farm', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_04', title: 'Silo #4: Parker Farms', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Al sur de Parker Laboratories', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_05', title: 'Silo #5: Bradbury Farm', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Granja Bradbury (Oeste de Fall\'s End)', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_06', title: 'Silo #6: Bradbury Tractor Shed', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Norte de Bradbury Farm junto a la vía del tren', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_07', title: 'Silo #7: Rae-Rae Pumpkin Farm', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Granja de calabazas donde reclutas a Boomer', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_08', title: 'Silo #8: Kellett Cattle Co.', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Dentro del puesto Kellett Cattle Co.', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_09', title: 'Silo #9: Hyde Barn', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Granero Hyde al norte de Kellett Cattle Co.', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_10', title: 'Silo #10: Holland Valley Station', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Estación de carga al norte de Fall\'s End', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_11', title: 'Silo #11: Davenport Farm', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Granja Davenport al noreste de US Auto', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_12', title: 'Silo #12: Flatiron Stockyards', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Corrales Flatiron al norte de Holland Valley', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_13', title: 'Silo #13: Green-Busch Fertilizer', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Junto al puesto Green-Busch Fertilizer Co.', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_silo_14', title: 'Silo #14: Gardenview Orchard', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Huerto al sur de Gardenview Packing Facility', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hv_yes_sign', title: 'Cartel Monumental YES', region: 'holland_valley', category: 'CULT_PROPERTY', locationHint: 'Montaña al noroeste de Fall\'s End (usar helicóptero o avión)', rpReward: 400, prerequisites: ['story_di_05'] },

  // 16 Santuarios en Henbane River + Estatua del Padre
  { id: 'prop_hr_shrine_01', title: 'Santuario #1: Sur de Hope County Jail', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Colina al sur de la cárcel de Hope County', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_02', title: "Santuario #2: Oeste de Lorna's Truck Stop", region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Colina boscosa al oeste de Lorna\'s Truck Stop', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_03', title: 'Santuario #3: Dead Man\'s Mill Sur', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Camino de tierra al sur de Dead Man\'s Mill', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_04', title: 'Santuario #4: Moonflower Trailer Park', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Colina al noreste de Moonflower Trailer Park', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_05', title: 'Santuario #5: Raptor Peak Oeste', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Ladera oeste de la montaña Raptor Peak', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_06', title: 'Santuario #6: Raptor Peak Norte', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Sendero norte de Raptor Peak hacia el río', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_07', title: 'Santuario #7: Sacred Skies Youth Camp', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Orilla oeste del lago en Sacred Skies Youth Camp', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_08', title: "Santuario #8: Eden's Convent Oeste", region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Curva del camino subiendo a Eden\'s Convent', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_09', title: 'Santuario #9: Peaches Taxidermy Sur', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Cruce de caminos al sur de Peaches Taxidermy', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_10', title: 'Santuario #10: Drubman Marina Oeste', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Península al oeste de Drubman Marina', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_11', title: 'Santuario #11: King\'s Hot Springs Norte', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Cresta montañosa al norte del hotel King\'s Hot Springs', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_12', title: 'Santuario #12: Whistling Beaver Brewery', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Colina frente a Whistling Beaver Brewery', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_13', title: 'Santuario #13: Jessop Conservatory Norte', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Campo de flores blancas al norte de Jessop Conservatory', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_14', title: 'Santuario #14: Gethsemane Greenhouse', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Junto al invernadero Gethsemane al sureste de Henbane', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_15', title: 'Santuario #15: Mastodon Geothermal Park', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Borde este de las pozas termales de Mastodon Park', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_shrine_16', title: 'Santuario #16: Abercrombie Residence', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Extremo sur de Henbane River cerca del puente', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_hr_father_statue', title: 'Estatua Monumental de Joseph Seed', region: 'henbane_river', category: 'CULT_PROPERTY', locationHint: 'Colina central de Henbane River (destruir y subir hasta quemar el libro)', rpReward: 500, prerequisites: ['story_di_05'] },

  // 10 Balizas del Lobo en Whitetail Mountains + Santuario Prólogo
  { id: 'prop_wm_beacon_01', title: 'Baliza del Lobo #1: Sur de Langford Lake', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Colina boscosa al sur de Langford Lake', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_02', title: 'Baliza del Lobo #2: Este de Baron Lumber Mill', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Cresta al este del aserradero Baron Lumber Mill', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_03', title: 'Baliza del Lobo #3: Whitetail Park Ranger', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Montaña al oeste de Whitetail Park Ranger Station', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_04', title: 'Baliza del Lobo #4: F.A.N.G. Center Norte', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Acantilado al norte de F.A.N.G. Center', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_05', title: 'Baliza del Lobo #5: PIN-K0 Radar Sur', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Ladera sur bajo PIN-K0 Radar Station', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_06', title: "Baliza del Lobo #6: Wolf's Den Este", region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: "Pico rocoso al este del búnker Wolf's Den", rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_07', title: 'Baliza del Lobo #7: Cedar Lake Norte', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Colina al norte de Cedar Lake', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_08', title: 'Baliza del Lobo #8: Elk Jaw Lodge Sur', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Bosque al sur del puesto Elk Jaw Lodge', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_09', title: 'Baliza del Lobo #9: Ozhigwan Falls', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Acantilado sobre la cascada Ozhigwan Falls', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_wm_beacon_10', title: 'Baliza del Lobo #10: Clagett Boathouse Oeste', region: 'whitetail_mountains', category: 'CULT_PROPERTY', locationHint: 'Extremo occidental de Whitetail Mountains', rpReward: 100, prerequisites: ['story_di_05'] },
  { id: 'prop_di_shrine', title: "Santuario del Culto en Dutch's Island", region: 'dutch_island', category: 'CULT_PROPERTY', locationHint: 'Costa oeste de Dutch\'s Island (Tutorial inicial)', rpReward: 0 },
];

// 6. ACROBACIAS DE CLUTCH NIXON (8)
const CLUTCH_NIXON_DRAFTS                             = [
  { id: 'clutch_hv_01', title: 'Baptism of Fire (Bautismo de Fuego - Muscle Car)', region: 'holland_valley', category: 'CLUTCH_NIXON', locationHint: 'Oeste de US Auto en Holland Valley', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'clutch_hv_02', title: 'Spray and Pray (Avión con Ametralladora)', region: 'holland_valley', category: 'CLUTCH_NIXON', locationHint: 'Pista al norte de Kellett Cattle Co. en Holland Valley', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'clutch_hr_01', title: 'Field Trip (Excursión - Quad en llamas)', region: 'henbane_river', category: 'CLUTCH_NIXON', locationHint: 'Norte de Hope County Jail en Henbane River', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'clutch_hr_02', title: 'Thread the Needle (Enhebrar la Aguja - Avión)', region: 'henbane_river', category: 'CLUTCH_NIXON', locationHint: 'Oeste de Badgardner Outpost / Lorna\'s Truck Stop', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'clutch_hr_03', title: 'Over the Top (Por Todo lo Alto - Wingsuit)', region: 'henbane_river', category: 'CLUTCH_NIXON', locationHint: 'Cima de Raptor Peak en Henbane River', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'clutch_wm_01', title: 'Quadzilla (Carrera de Quad en Montaña)', region: 'whitetail_mountains', category: 'CLUTCH_NIXON', locationHint: 'Sur de PIN-K0 Radar Station en Whitetail Mountains', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'clutch_wm_02', title: 'The Mooseknuckle Run (Hidroavión por el Cañón)', region: 'whitetail_mountains', category: 'CLUTCH_NIXON', locationHint: 'Orilla norte de Langford Lake en Whitetail Mountains', rpReward: 200, prerequisites: ['story_di_05'] },
  { id: 'clutch_wm_03', title: 'The Lord of the Wings (Señor de las Alas - Wingsuit)', region: 'whitetail_mountains', category: 'CLUTCH_NIXON', locationHint: 'Mirador sobre Ozhigwan Falls en Whitetail Mountains', rpReward: 200, prerequisites: ['story_di_05'] },
];

// 7. ESPECIALISTAS / GUNS & FANGS FOR HIRE (9)
const SPECIALIST_DRAFTS                             = [
  { id: 'spec_boomer', title: 'Boomer (Perro Explorador - Marca enemigos automáticamente)', region: 'holland_valley', category: 'SPECIALIST', locationHint: "Rae-Rae's Pumpkin Farm (Misión: Man's Best Friend)", rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_nick_rye', title: 'Nick Rye (Avión de Ataque - Bombardeo y ametrallamiento)', region: 'holland_valley', category: 'SPECIALIST', locationHint: 'Rye & Sons Aviation (Misión: Wingman)', rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_grace', title: 'Grace Armstrong (Francotiradora Pesada)', region: 'holland_valley', category: 'SPECIALIST', locationHint: 'Lamb of God Church (Misión: Grace Under Fire)', rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_sharky', title: 'Sharky Boshaw (Especialista Pirómano y Explosivos)', region: 'henbane_river', category: 'SPECIALIST', locationHint: 'Moonflower Trailer Park (Misión: Burn, Baby, Burn!)', rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_peaches', title: 'Peaches (Puma de Sigilo - Bajas silenciosas)', region: 'henbane_river', category: 'SPECIALIST', locationHint: 'Peaches Taxidermy (Misión: Here Kitty, Kitty)', rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_adelaide', title: 'Adelaide Drubman (Helicóptero Artillado Tulip)', region: 'henbane_river', category: 'SPECIALIST', locationHint: 'Drubman Marina (Misión: Friendly Skies)', rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_cheeseburger', title: 'Cheeseburger (Oso Grizzly Tanque)', region: 'whitetail_mountains', category: 'SPECIALIST', locationHint: 'F.A.N.G. Center (Misión: Right to Bear Arms)', rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_hurk', title: 'Hurk Drubman Jr. (Lanzacohetes Guiado Antivehículos)', region: 'whitetail_mountains', category: 'SPECIALIST', locationHint: 'Fort Drubman (Misión: The Prodigal Son)', rpReward: 300, prerequisites: ['story_di_05'] },
  { id: 'spec_jess_black', title: 'Jess Black (Cazadora con Arco Incendiario y Sigilo Animal)', region: 'whitetail_mountains', category: 'SPECIALIST', locationHint: 'Baron Lumber Mill (Misión: A Dish Served Cold)', rpReward: 300, prerequisites: ['story_di_05'] },
];

// 8. RÉCORDS ESTATALES DE PESCA / HARD FISHING SPOTS (12) -> Caña Old Betsy
const FISHING_RECORD_DRAFTS                             = [
  { id: 'fish_bull_trout', title: 'Bull Trout (Trucha Toro - Récord a batir: 21 lbs)', region: 'whitetail_mountains', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Noroeste de Langford Lake, al oeste de Stone Ridge Chalet (Cebo: Trout Bugger)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_golden_trout', title: 'Golden Trout (Trucha Dorada - Récord a batir: 4 lbs)', region: 'whitetail_mountains', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Oeste del puente ferroviario norte en Silver Lake (Cebo: Trout Bugger)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_lake_trout', title: 'Lake Trout (Trucha de Lago - Récord a batir: 37 lbs)', region: 'holland_valley', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Suroeste de Rye & Sons Aviation, al este de Eden\'s Gate Greenhouse (Cebo: Trout Bugger)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_rainbow_trout', title: 'Rainbow Trout (Trucha Arcoíris - Récord a batir: 28 lbs)', region: 'holland_valley', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Estanque al suroeste de Rae-Rae\'s Pumpkin Farm cerca de Bridge of Tears (Cebo: Trout Bugger)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_pallid_sturgeon', title: 'Pallid Sturgeon (Esturión Pálido - Récord a batir: 55 lbs)', region: 'holland_valley', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Río directamente al sur de Lamb of God Church (Cebo: Hybrid Sturgeon)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_paddlefish_sturgeon', title: 'Paddlefish Sturgeon (Pez Espátula - Récord a batir: 112 lbs)', region: 'holland_valley', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Extremo suroeste de Holland Valley, al sur de Seed Ranch (Cebo: Hybrid Sturgeon)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_smallmouth_bass', title: 'Smallmouth Bass (Lubina de Boca Chica - Récord a batir: 6 lbs)', region: 'henbane_river', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Río oriental al norte de Jessop Conservatory cerca de Gethsemane (Cebo: Bass Popper)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_largemouth_bass', title: 'Largemouth Bass (Lubina de Boca Grande - Récord a batir: 8 lbs)', region: 'henbane_river', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Río oriental junto a Whistling Beaver Brewery (Cebo: Bass Popper)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_rock_bass', title: 'Rock Bass (Lubina de Roca - Récord a batir: 3 lbs)', region: 'henbane_river', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Centro de Rock Bass Lake al oeste de Hope County Jail (Cebo: Bass Popper)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_chinook_salmon', title: 'Chinook Salmon (Salmón Real - Récord a batir: 27 lbs)', region: 'whitetail_mountains', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Río al noroeste de F.A.N.G. Center (Cebo: Salmon Egg)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_kokanee_salmon', title: 'Kokanee Salmon (Salmón Kokanee - Récord a batir: 6 lbs)', region: 'whitetail_mountains', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Orilla suroeste de Cedar Lake (Cebo: Salmon Egg)', rpReward: 0, prerequisites: ['story_di_05'] },
  { id: 'fish_arctic_grayling', title: 'Arctic Grayling Salmon (Tímalo Ártico - Récord a batir: 3 lbs)', region: 'whitetail_mountains', category: 'FISHING_RECORD', locationHint: 'Punto Difícil: Lago de alta montaña en la cima de Ozhigwan Falls (Cebo: Trout Bugger)', rpReward: 0, prerequisites: ['story_di_05'] },
];

// 9. COLECCIONABLES (68)
const buildCollectibleGroup = (
  prefix        ,
  collectibleType                    ,
  region          ,
  locations                                                             
)                             =>
  locations.map((loc, idx) => ({
    id: `${prefix}_${String(idx + 1).padStart(2, '0')}`,
    title: loc.name,
    region,
    category: 'COLLECTIBLE',
    locationHint: loc.hint,
    rpReward: 0,
    collectibleType,
    prerequisites: ['story_di_05'],
  }));

const COLLECTIBLE_DRAFTS                             = [
  // 9 Cartas de Béisbol Cougars (Whitetail Mountains)
  ...buildCollectibleGroup('col_baseball', 'BASEBALL_CARD', 'whitetail_mountains', [
    { name: 'Carta Cougars #1: F.A.N.G. Center', hint: 'Mostrador de la tienda de regalos en F.A.N.G. Center' },
    { name: 'Carta Cougars #2: Baron Lumber Mill', hint: 'Oficina del segundo piso en el aserradero Baron Lumber Mill' },
    { name: 'Carta Cougars #3: Clagett Boathouse', hint: 'Estantería dentro del cobertizo Clagett Boathouse' },
    { name: 'Carta Cougars #4: Pinewood Creek', hint: 'Cabaña junto al arroyo al oeste de Langford Lake' },
    { name: 'Carta Cougars #5: Breakneck Trailer Park', hint: 'Interior del remolque quemado en Breakneck Trailer Park' },
    { name: 'Carta Cougars #6: Halperin Hotel', hint: 'Habitación superior del hotel en ruinas al sur de Whitetail' },
    { name: 'Carta Cougars #7: Cooper Cabin', hint: 'Mesa de noche dentro de Cooper Cabin (Este de Wolf\'s Den)' },
    { name: 'Carta Cougars #8: Loresca Residence', hint: 'Garaje cerrado al norte de Cedar Lake (entrar por ventana)' },
    { name: 'Carta Cougars #9: Jefferson Lookout Tower', hint: 'Cabaña en la cima de Jefferson Lookout Tower' },
  ]),

  // 10 Cabezones de Cheeseburger (Distribuidos en las 3 regiones)
  ...buildCollectibleGroup('col_bobblehead', 'BOBBLEHEAD', 'whitetail_mountains', [
    { name: 'Cabezón Cheeseburger #1: F.A.N.G. Center', hint: 'Cocina del edificio principal en F.A.N.G. Center (Whitetail)' },
    { name: 'Cabezón Cheeseburger #2: Baron Lumber Mill', hint: 'Tejado de la oficina de pesaje en Baron Lumber Mill (Whitetail)' },
    { name: 'Cabezón Cheeseburger #3: Whitetail Park Visitor Center', hint: 'Mostrador de información del Centro de Visitantes (Whitetail)' },
    { name: 'Cabezón Cheeseburger #4:Stone Ridge Chalet', hint: 'Balcón del segundo piso en Stone Ridge Chalet (Whitetail)' },
    { name: 'Cabezón Cheeseburger #5: Grand View Hotel', hint: 'Mostrador de recepción en Grand View Hotel (Whitetail)' },
    { name: 'Cabezón Cheeseburger #6: St. Isidore School', hint: 'Capilla abandonada al norte de Holland Valley' },
    { name: 'Cabezón Cheeseburger #7: Flatiron Stockyards', hint: 'Barraca junto a los corrales en Flatiron Stockyards (Holland Valley)' },
    { name: 'Cabezón Cheeseburger #8: Whipple\'s Garage', hint: 'Gasolinera al este de Holland Valley' },
    { name: 'Cabezón Cheeseburger #9:Moonflower Trailer Park', hint: 'Mesa de picnic en Moonflower Trailer Park (Henbane River)' },
    { name: 'Cabezón Cheeseburger #10: Feeney Residence', hint: 'Búnker subterráneo en Feeney Residence (Henbane River)' },
  ]),

  // 12 Cómics Coleccionables (Zombies & Mars)
  ...buildCollectibleGroup('col_comic', 'COMIC_BOOK', 'holland_valley', [
    { name: 'Cómic #1: Boyd Residence (Holland Valley)', hint: 'Dormitorio principal donde inicia la misión Golden Age Nostalgia' },
    { name: 'Cómic #2: Parker Laboratories (Holland Valley)', hint: 'Caravana de Larry Parker al oeste de Fall\'s End' },
    { name: 'Cómic #3: Rae-Rae\'s Pumpkin Farm (Holland Valley)', hint: 'Dormitorio de la casa junto al huerto de calabazas' },
    { name: 'Cómic #4: Sunrise Farm (Holland Valley)', hint: 'Ático del granero rojo en Sunrise Farm' },
    { name: 'Cómic #5: Davenport Farm (Holland Valley)', hint: 'Habitación del segundo piso en Davenport Farm' },
    { name: 'Cómic #6: Peaches Taxidermy (Henbane River)', hint: 'Cama dentro de la casa en Peaches Taxidermy' },
    { name: 'Cómic #7: Chatney Residence (Henbane River)', hint: 'Cabaña al norte de Hope County Jail' },
    { name: 'Cómic #8: Chan Residence (Henbane River)', hint: 'Casa al sureste de Whistling Beaver Brewery' },
    { name: 'Cómic #9: Vasquez Residence (Henbane River)', hint: 'Caravana al norte de Sacred Skies Youth Camp' },
    { name: 'Cómic #10:Jefferson Lookout Tower (Whitetail)', hint: 'Caseta superior de vigilancia en Jefferson Tower' },
    { name: 'Cómic #11: Elliott Residence (Whitetail)', hint: 'Segundo piso de la casa fortificada de los Elliott' },
    { name: 'Cómic #12: O\'Hara\'s Cabin (Whitetail)', hint: 'Cabaña de caza al este de Elk Jaw Lodge' },
  ]),

  // 12 Encendedores de Vietnam (What They Carried)
  ...buildCollectibleGroup('col_lighter', 'VIETNAM_LIGHTER', 'holland_valley', [
    { name: 'Encendedor #1: Miller Residence (Holland Valley)', hint: 'Búnker detrás de la casa de Wendell Redler' },
    { name: 'Encendedor #2: Búnker al Oeste de Fall\'s End', hint: 'Refugio subterráneo cerca del puente cubierto' },
    { name: 'Encendedor #3: Harris Residence (Holland Valley)', hint: 'Búnker en el patio trasero de Harris Residence' },
    { name: 'Encendedor #4: Fillmore Residence (Holland Valley)', hint: 'Búnker al este de Kellett Cattle Co.' },
    { name: 'Encendedor #5: Rae-Rae\'s Bunker (Holland Valley)', hint: 'Refugio subterráneo al norte de Rae-Rae\'s Farm' },
    { name: 'Encendedor #6: McClean Residence (Henbane River)', hint: 'Búnker subterráneo al sur de Henbane River' },
    { name: 'Encendedor #7: Abercrombie Residence (Henbane River)', hint: 'Refugio bajo el cobertizo en Abercrombie Residence' },
    { name: 'Encendedor #8: Counselor\'s Cabin (Henbane River)', hint: 'Búnker al norte de Sacred Skies Youth Camp' },
    { name: 'Encendedor #9: Dead Man\'s Mill Bunker (Henbane)', hint: 'Refugio cerca del puente ferroviario norte de Henbane' },
    { name: 'Encendedor #10: Camp Cougar (Whitetail Mountains)', hint: 'Búnker en el campamento al este de Baron Lumber Mill' },
    { name: 'Encendedor #11: Wilkerson Cabin (Whitetail)', hint: 'Refugio subterráneo al oeste de F.A.N.G. Center' },
    { name: 'Encendedor #12: Hawkeye Tunnel Bunker (Whitetail)', hint: 'Búnker oculto en la colina sobre Hawkeye Tunnel' },
  ]),

  // 10 Cajas de Vinilos (Whitetail Mountains)
  ...buildCollectibleGroup('col_vinyl', 'VINYL_CRATE', 'whitetail_mountains', [
    { name: 'Caja de Vinilos #1: Dansky Cabin', hint: 'Porche de Dansky Cabin al sur de F.A.N.G. Center' },
    { name: 'Caja de Vinilos #2: Linero Building Supplies', hint: 'Almacén donde defiendes a Wade Fowler' },
    { name: 'Caja de Vinilos #3: Lee Residence', hint: 'Cabaña junto al río al oeste de Baron Lumber Mill' },
    { name: 'Caja de Vinilos #4: Red Tail Cabin', hint: 'Interior de Red Tail Cabin al sur de Langford Lake' },
    { name: 'Caja de Vinilos #5: Welcome Center', hint: 'Garaje del centro de bienvenida al sureste de Whitetail' },
    { name: 'Caja de Vinilos #6: North Park Entrance', hint: 'Caseta de peaje en la entrada norte del parque Whitetail' },
    { name: 'Caja de Vinilos #7: Campamento del Lago', hint: 'Tienda de campaña en la isla central de Langford Lake' },
    { name: 'Caja de Vinilos #8: Mezquita de Antenas Norte', hint: 'Cabaña bajo la torre de radio al oeste de PIN-K0' },
    { name: 'Caja de Vinilos #9: Breakneck Trailer Park Sur', hint: 'Mesa junto al remolque azul al oeste de Whitetail' },
    { name: 'Caja de Vinilos #10: Muelle de Silver Lake', hint: 'Embarcadero en la costa norte de Silver Lake' },
  ]),

  // 15 Barriles de Whisky (Silver Lake / Henbane River)
  ...buildCollectibleGroup('col_whiskey', 'WHISKEY_CASK', 'henbane_river', [
    { name: 'Barril de Whisky #1: Silver Lake Boathouse', hint: 'Bajo el muelle donde hablas con Sherri Woodhouse' },
    { name: 'Barril de Whisky #2: Isla Central de Silver Lake', hint: 'Fondo sumergido junto al bote naufragado en la isla central' },
    { name: 'Barril de Whisky #3: Costa Norte de Silver Lake', hint: 'Hundido cerca del muelle de madera al norte del lago' },
    { name: 'Barril de Whisky #4: Puente Ferroviario Oeste', hint: 'Bajo los pilares del puente ferroviario en Silver Lake' },
    { name: 'Barril de Whisky #5: Bahía Suroeste de Silver Lake', hint: 'Entre las rocas sumergidas cerca de Dutch\'s Island' },
    { name: 'Barril de Whisky #6: Canal de Dutch\'s Island Norte', hint: 'Fondo del río al norte de Dutch\'s Island' },
    { name: 'Barril de Whisky #7: Canal de Dutch\'s Island Sur', hint: 'Junto al barco hundido al sur de Dutch\'s Island' },
    { name: 'Barril de Whisky #8: Puente hacia Holland Valley', hint: 'Bajo el puente colgante al este de Holland Valley' },
    { name: 'Barril de Whisky #9: Desembocadura de Henbane River', hint: 'Fondo del río frente a Nolan\'s Fly Shop' },
    { name: 'Barril de Whisky #10: Muelle de Compound Norte', hint: 'Aguas profundas al norte de la isla de Joseph Seed' },
    { name: 'Barril de Whisky #11: Muelle de Compound Este', hint: 'Junto a la boya roja al este de la isla de Joseph Seed' },
    { name: 'Barril de Whisky #12: Bahía de Sacred Skies', hint: 'Sumergido frente al muelle de canoas en Sacred Skies Camp' },
    { name: 'Barril de Whisky #13: Puente de Drubman Marina', hint: 'Bajo el puente de carretera al oeste de Drubman Marina' },
    { name: 'Barril de Whisky #14: Presa McKinley Dam', hint: 'Aguas al pie de la presa entre Whitetail y Henbane' },
    { name: 'Barril de Whisky #15: Estrecho de Clagett Boathouse', hint: 'Río al sureste de Clagett Boathouse' },
  ]),
];

// 10. TALENTOS / PERKS (50)
const PERK_DRAFTS                             = [
  // Árbol Supervivencia (10)
  { id: 'perk_surv_01', title: 'Human Fish (Pez Humano - 1 pto)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Nadar más rápido y más aire bajo el agua', rpReward: 0 },
  { id: 'perk_surv_02', title: 'Fisher King (Rey Pescador - 4 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Desbloquea cebos especiales para los 12 récords', rpReward: 0 },
  { id: 'perk_surv_03', title: 'Repair Torch (Soplete de Reparación - 5 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Abre cajas fuertes y repara vehículos', rpReward: 0 },
  { id: 'perk_surv_04', title: 'King of the Jungle (Rey de la Selva - 6 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Menos daño de animales y presas no huyen', rpReward: 0 },
  { id: 'perk_surv_05', title: 'Black Market (Mercado Negro - 6 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Compra munición especial y explosivos en tiendas', rpReward: 0 },
  { id: 'perk_surv_06', title: 'Health Boost 1 (Aumento de Salud 1 - 6 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Salud máxima al 150%', rpReward: 0 },
  { id: 'perk_surv_07', title: 'Health Boost 2 (Aumento de Salud 2 - 7 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Salud máxima al 200%', rpReward: 0 },
  { id: 'perk_surv_08', title: 'Health Boost 3 (Aumento de Salud 3 - 8 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Salud máxima al 250%', rpReward: 0 },
  { id: 'perk_surv_09', title: 'Harvest Master (Maestro Recolector - 8 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Doble botín de plantas y pieles de animales', rpReward: 0 },
  { id: 'perk_surv_10', title: 'Health Boost 4 (Aumento de Salud 4 - 9 ptos)', region: 'dutch_island', category: 'PERK', locationHint: 'Árbol Supervivencia: Salud máxima al 300%', rpReward: 0 },

  // Árbol Renegado (10)
  { id: 'perk_ren_01', title: 'Parachute (Paracaídas - 1 pto)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Desbloquea el paracaídas', rpReward: 0 },
  { id: 'perk_ren_02', title: 'Wingsuit (Traje Aéreo - 4 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Necesario para acrobacias de Clutch Nixon', rpReward: 0 },
  { id: 'perk_ren_03', title: 'Weapons Pro (Profesional de Armas - 6 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Recarga y puntería mejorada en subfusiles y escopetas', rpReward: 0 },
  { id: 'perk_ren_04', title: 'Heavy Weapons Master (Maestro de Armas Pesadas - 6 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Manejo mejorado de ametralladoras y lanzacohetes', rpReward: 0 },
  { id: 'perk_ren_05', title: 'Auto Repair (Autorreparación - 6 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Los vehículos conducidos se reparan solos', rpReward: 0 },
  { id: 'perk_ren_06', title: 'Rifle Mastery (Maestría en Rifles - 6 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Manejo mejorado de rifles de asalto y francotirador', rpReward: 0 },
  { id: 'perk_ren_07', title: 'Vehicle Buster (Destructor de Vehículos - 7 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Mayor daño de balas contra vehículos', rpReward: 0 },
  { id: 'perk_ren_08', title: 'Booby Trap (Trampa Explosiva - 7 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Sabotear vehículos para explotar al chocar', rpReward: 0 },
  { id: 'perk_ren_09', title: 'Master Blaster (Maestro Explosivo - 8 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Mayor radio de explosión', rpReward: 0 },
  { id: 'perk_ren_10', title: 'Airdrop (Salto Aéreo - 10 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Renegado: Viaje rápido desplegándose desde el aire', rpReward: 0 },

  // Árbol Asesino (10)
  { id: 'perk_assn_01', title: 'Grapple (Gancho de Escalada - 1 pto)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Obligatorio para múltiples escondites y torres', rpReward: 0 },
  { id: 'perk_assn_02', title: 'Takedown Mastery (Maestría en Eliminaciones - 6 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Eliminaciones en cadena y con arma corta', rpReward: 0 },
  { id: 'perk_assn_03', title: 'Close Combat Mastery (Combate Cercano - 6 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Mayor durabilidad cuerpo a cuerpo y pistolas', rpReward: 0 },
  { id: 'perk_assn_04', title: 'Ghost (Fantasma - 7 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Menos ruido al moverse y menor daño por caída', rpReward: 0 },
  { id: 'perk_assn_05', title: 'Throwing Knife Mastery (Cuchillos Arrojadizos - 7 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Mayor alcance y daño con cuchillos', rpReward: 0 },
  { id: 'perk_assn_06', title: 'Locksmith (Cerrajero - 7 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Abre puertas y cajas fuertes en silencio sin soplete', rpReward: 0 },
  { id: 'perk_assn_07', title: 'Sneaky Sprint (Sprint Sigiloso - 8 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Moverse mucho más rápido agachado', rpReward: 0 },
  { id: 'perk_assn_08', title: 'Saboteur (Saboteador - 8 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Necesario para el logro Explosive Surprise', rpReward: 0 },
  { id: 'perk_assn_09', title: 'Journey Pack (Mochila de Viaje - 9 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Lleva hasta 5 botiquines e inventario ampliado', rpReward: 0 },
  { id: 'perk_assn_10', title: 'Primal Wrath (Ira Primitiva - 9 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Asesino: Recarga rápida de consumibles de furia', rpReward: 0 },

  // Árbol Preparacionista (10)
  { id: 'perk_prep_01', title: 'Close Combat Gear Bag (Bolsa Cuerpo a Cuerpo - 1 pto)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más munición de pistola y armas cuerpo a cuerpo', rpReward: 0 },
  { id: 'perk_prep_02', title: 'Survival Gear Bag (Bolsa de Supervivencia - 3 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más capacidad de objetos de supervivencia', rpReward: 0 },
  { id: 'perk_prep_03', title: 'Light-Weapon Gear Bag (Bolsa de Armas Ligeras - 5 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más munición de subfusil y escopeta', rpReward: 0 },
  { id: 'perk_prep_04', title: 'Archery Gear Bag (Carcaj de Arquería - 6 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más flechas normales, explosivas e incendiarias', rpReward: 0 },
  { id: 'perk_prep_05', title: 'Heavy-Weapon Gear Bag (Bolsa de Armas Pesadas - 7 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más munición para ametralladoras y lanzallamas', rpReward: 0 },
  { id: 'perk_prep_06', title: 'Special-Weapon Gear Bag (Bolsa de Munición Especial - 7 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más munición perforante e incendiaria', rpReward: 0 },
  { id: 'perk_prep_07', title: 'Long-Range Gear Bag (Bolsa de Largo Alcance - 8 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más munición de rifle y calibre .50', rpReward: 0 },
  { id: 'perk_prep_08', title: 'Throwables Gear Bag (Bolsa de Arrojadizos - 8 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Más dinamita, C4, granadas y cócteles molotov', rpReward: 0 },
  { id: 'perk_prep_09', title: 'Additional Holster (Tercera Funda de Arma - 8 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Desbloquea la 3ª ranura de arma principal', rpReward: 0 },
  { id: 'perk_prep_10', title: 'Weapons Collector (Cuarta Funda de Arma - 9 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Preparacionista: Desbloquea la 4ª ranura de arma principal', rpReward: 0 },

  // Árbol Líder (10)
  { id: 'perk_lead_01', title: 'Boomer Recovery (Recuperación de Boomer - 4 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Líder: Boomer vuelve mucho más rápido tras caer herido', rpReward: 0 },
  { id: 'perk_lead_02', title: 'Grace Recovery (Recuperación de Grace - 4 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Líder: Grace vuelve más rápido tras ser herida', rpReward: 0 },
  { id: 'perk_lead_03', title: 'Nick Rye Recovery (Recuperación de Nick Rye - 4 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Líder: Nick Rye vuelve más rápido tras ser derribado', rpReward: 0 },
  { id: 'perk_lead_04', title: 'Sharky Recovery (Recuperación de Sharky - 4 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Líder: Sharky vuelve más rápido tras caer herido', rpReward: 0 },
  { id: 'perk_lead_05', title: 'Adelaide Recovery (Recuperación de Adelaide - 4 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Líder: Adelaide vuelve más rápido con su helicóptero', rpReward: 0 },
  { id: 'perk_lead_06', title: 'Peaches Recovery (Recuperación de Peaches - 4 ptos)', region: 'henbane_river', category: 'PERK', locationHint: 'Árbol Líder: Peaches vuelve más rápido tras caer herida', rpReward: 0 },
  { id: 'perk_lead_07', title: 'Jess Recovery (Recuperación de Jess Black - 4 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Líder: Jess Black vuelve más rápido tras caer herida', rpReward: 0 },
  { id: 'perk_lead_08', title: 'Hurk Recovery (Recuperación de Hurk - 4 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Líder: Hurk vuelve más rápido tras caer herido', rpReward: 0 },
  { id: 'perk_lead_09', title: 'Cheeseburger Recovery (Recuperación de Cheeseburger - 4 ptos)', region: 'whitetail_mountains', category: 'PERK', locationHint: 'Árbol Líder: Cheeseburger vuelve más rápido tras caer herido', rpReward: 0 },
  { id: 'perk_lead_10', title: 'Leadership (Liderazgo Doble - 6 ptos)', region: 'holland_valley', category: 'PERK', locationHint: 'Árbol Líder: Permite llevar 2 Especialistas simultáneos', rpReward: 0 },
];

// 11. DESAFÍOS IN-GAME / CHALLENGES (69) -> Requeridos para el logro "Been There, Done That" y puntos de talento
const CHALLENGE_TITLES                                                                                                               = [
  // Asalto (22)
  { id: 'chal_as_01', title: 'Asalto: Bajas con Rifle de Asalto (30 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_02', title: 'Asalto: Bajas con Escopeta (25 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_03', title: 'Asalto: Bajas con Subfusil SMG (30 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_04', title: 'Asalto: Bajas con Ametralladora Ligera LMG (30 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_05', title: 'Asalto: Bajas con Rifle de Francotirador (20 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+3 ptos de talento)' },
  { id: 'chal_as_06', title: 'Asalto: Bajas con Pistola (20 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_07', title: 'Asalto: Bajas con Arco y Flechas (15 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+3 ptos de talento)' },
  { id: 'chal_as_08', title: 'Asalto: Bajas con Lanzallamas (10 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_09', title: 'Asalto: Bajas con Lanzacohetes / Lanzagranadas (15 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_10', title: 'Asalto: Bajas con Dinamita (10 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_11', title: 'Asalto: Bajas con Explosivo C4 (10 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_12', title: 'Asalto: Bajas con Minas de Proximidad (10 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_13', title: 'Asalto: Bajas con Granadas de Fragmentación (10 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_14', title: 'Asalto: Bajas con Cóctel Molotov (10 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_15', title: 'Asalto: Bajas con Cuchillos Arrojadizos (8 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+2 ptos de talento)' },
  { id: 'chal_as_16', title: 'Asalto: Eliminaciones Cuerpo a Cuerpo / Takedowns (25 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Asalto (+3 ptos de talento)' },
  { id: 'chal_as_17', title: 'Asalto: Eliminaciones en Cadena (5 bajas)', region: 'holland_valley', hint: 'Requiere talento Takedown Mastery (+2 ptos)' },
  { id: 'chal_as_18', title: 'Asalto: Bajas con Armas Cuerpo a Cuerpo Contundentes (15 bajas)', region: 'holland_valley', hint: 'Bates, palas o tuberías (+2 ptos)' },
  { id: 'chal_as_19', title: 'Asalto: Bajas a Larga Distancia >150m (10 bajas)', region: 'holland_valley', hint: 'Usar rifle francotirador con mira telescópica (+3 ptos)' },
  { id: 'chal_as_20', title: 'Asalto: Tiros a la Cabeza / Headshots (50 bajas)', region: 'holland_valley', hint: 'Cualquier arma de fuego o arco (+3 ptos)' },
  { id: 'chal_as_21', title: 'Asalto: Bajas con Ametralladora Montada / Torretas (15 bajas)', region: 'holland_valley', hint: 'Torretas de puestos o camionetas del culto (+2 ptos)' },
  { id: 'chal_as_22', title: 'Asalto: Bajas con Vehículos Saboteados (5 bajas)', region: 'holland_valley', hint: 'Requiere talento Saboteur o Booby Trap (+2 ptos)' },

  // Mundo (10)
  { id: 'chal_wo_01', title: 'Mundo: Rescatar Rehenes Civiles (20 rehenes)', region: 'henbane_river', hint: 'Menú Desafíos -> Mundo (+3 ptos de talento)' },
  { id: 'chal_wo_02', title: 'Mundo: Destruir Camiones de Suministros del Culto (10 camiones)', region: 'henbane_river', hint: 'Menú Desafíos -> Mundo (+2 ptos de talento)' },
  { id: 'chal_wo_03', title: 'Mundo: Destruir Camionetas de Rehenes / Prisioneros (5 furgones)', region: 'henbane_river', hint: 'Matar al conductor y abrir la puerta trasera (+2 ptos)' },
  { id: 'chal_wo_04', title: 'Mundo: Liberar Puestos sin Activar Alarmas (3 puestos)', region: 'henbane_river', hint: 'Desactivar alarmas o usar sigilo total (+3 ptos)' },
  { id: 'chal_wo_05', title: 'Mundo: Volar 5,000 metros con el Wingsuit', region: 'henbane_river', hint: 'Menú Desafíos -> Mundo (+2 ptos de talento)' },
  { id: 'chal_wo_06', title: 'Mundo: Consumir Homeopáticos (10 dosis)', region: 'henbane_river', hint: 'Fast, Furious, The Ultimate Hunter o The Ultimate Survivor (+2 ptos)' },
  { id: 'chal_wo_07', title: 'Mundo: Saquear Cajas Fuertes (15 cajas fuertes)', region: 'henbane_river', hint: 'Abrir con C4, soplete o talento Locksmith (+3 ptos)' },
  { id: 'chal_wo_08', title: 'Mundo: Atropellar Enemigos del Culto (20 bajas)', region: 'henbane_river', hint: 'También desbloquea el logro Squash and Run (+2 ptos)' },
  { id: 'chal_wo_09', title: 'Mundo: Distraer Enemigos con Piedras o Latas (15 distracciones)', region: 'henbane_river', hint: 'También desbloquea el logro Opportunity Knocks (+1 pto)' },
  { id: 'chal_wo_10', title: 'Mundo: Descubrir Ubicaciones en Hope County (50 lugares)', region: 'henbane_river', hint: 'Explorar cabañas, puestos y puntos de interés (+3 ptos)' },

  // Especialistas / Guns for Hire (12)
  { id: 'chal_gf_01', title: 'Especialistas: Bajas con Boomer (25 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_02', title: 'Especialistas: Bajas con Nick Rye (25 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_03', title: 'Especialistas: Bajas con Grace Armstrong (25 bajas)', region: 'holland_valley', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_04', title: 'Especialistas: Bajas con Sharky Boshaw (25 bajas)', region: 'henbane_river', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_05', title: 'Especialistas: Bajas con Peaches (25 bajas)', region: 'henbane_river', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_06', title: 'Especialistas: Bajas con Adelaide Drubman (25 bajas)', region: 'henbane_river', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_07', title: 'Especialistas: Bajas con Cheeseburger (25 bajas)', region: 'whitetail_mountains', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_08', title: 'Especialistas: Bajas con Hurk Drubman Jr. (25 bajas)', region: 'whitetail_mountains', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_09', title: 'Especialistas: Bajas con Jess Black (25 bajas)', region: 'whitetail_mountains', hint: 'Menú Desafíos -> Especialistas (+3 ptos)' },
  { id: 'chal_gf_10', title: 'Especialistas: Bajas con Combatientes Rebeldes Genéricos (30 bajas)', region: 'holland_valley', hint: 'Reclutar milicianos de Hope County (+3 ptos)' },
  { id: 'chal_gf_11', title: 'Especialistas: Reanimar Compañeros Caídos (15 reanimaciones)', region: 'holland_valley', hint: 'Reanimar cualquier Gun/Fang for Hire (+2 ptos)' },
  { id: 'chal_gf_12', title: 'Especialistas: Bajas Conjuntas con Liderazgo Doble (20 bajas)', region: 'holland_valley', hint: 'Llevar 2 especialistas activos al mismo tiempo (+3 ptos)' },

  // Caza y Pesca (25) -> OBLIGATORIOS TODOS para el logro "Been There, Done That"
  { id: 'chal_hu_01', title: 'Caza (Obligatorio Logro): Desollar 4 Venados (Deer)', region: 'holland_valley', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_02', title: 'Caza (Obligatorio Logro): Desollar 2 Berrendos (Pronghorn)', region: 'holland_valley', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_03', title: 'Caza (Obligatorio Logro): Desollar 3 Alces Wapití (Elk)', region: 'whitetail_mountains', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_04', title: 'Caza (Obligatorio Logro): Desollar 2 Caribúes (Caribou)', region: 'whitetail_mountains', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_05', title: 'Caza (Obligatorio Logro): Desollar 3 Bisontes (Bison)', region: 'henbane_river', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_06', title: 'Caza (Obligatorio Logro): Desollar 2 Alces Gigantes (Moose)', region: 'holland_valley', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_07', title: 'Caza (Obligatorio Logro): Desollar 5 Liebres (Hare)', region: 'holland_valley', hint: 'Bosques al norte de Lamb of God Church' },
  { id: 'chal_hu_08', title: 'Caza (Obligatorio Logro): Desollar 4 Jabalíes (Boar)', region: 'holland_valley', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_09', title: 'Caza (Obligatorio Logro): Desollar 3 Mofetas (Skunk)', region: 'holland_valley', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_10', title: 'Caza (Obligatorio Logro): Desollar 3 Glotones (Wolverine)', region: 'whitetail_mountains', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_11', title: 'Caza (Obligatorio Logro): Desollar 3 Tejones (Badger)', region: 'henbane_river', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_12', title: 'Caza (Obligatorio Logro): Desollar 6 Lobos (Wolf)', region: 'whitetail_mountains', hint: 'Usar cebo en Whitetail Mountains' },
  { id: 'chal_hu_13', title: 'Caza (Obligatorio Logro): Desollar 4 Pumas (Cougar)', region: 'henbane_river', hint: 'Obligatorio para logro "Been There, Done That"' },
  { id: 'chal_hu_14', title: 'Caza (Obligatorio Logro): Desollar 3 Osos Negros (Black Bear)', region: 'holland_valley', hint: 'Usar cebo en Holland Valley' },
  { id: 'chal_hu_15', title: 'Caza (Obligatorio Logro): Desollar 3 Osos Grizzly (Grizzly Bear)', region: 'whitetail_mountains', hint: 'Norte de Whitetail Mountains' },
  { id: 'chal_hu_16', title: 'Caza (Obligatorio Logro): Abatir 3 Pavos (Turkey)', region: 'holland_valley', hint: 'Granjas de Holland Valley' },
  { id: 'chal_hu_17', title: 'Caza (Obligatorio Logro): Abatir 4 Águilas (Eagle)', region: 'whitetail_mountains', hint: 'Cima de Raptor Peak (usar fuego para logro Kentucky Fried)' },
  { id: 'chal_hu_18', title: 'Pesca (Obligatorio Logro): Pescar Kokanee Salmon', region: 'whitetail_mountains', hint: 'Cedar Lake en Whitetail Mountains' },
  { id: 'chal_hu_19', title: 'Pesca (Obligatorio Logro): Pescar Arctic Grayling Salmon', region: 'whitetail_mountains', hint: 'Lago sobre Ozhigwan Falls' },
  { id: 'chal_hu_20', title: 'Pesca (Obligatorio Logro): Pescar Chinook Salmon', region: 'whitetail_mountains', hint: 'Río al oeste de F.A.N.G. Center' },
  { id: 'chal_hu_21', title: 'Pesca (Obligatorio Logro): Pescar Rock Bass', region: 'henbane_river', hint: 'Rock Bass Lake al oeste de Hope County Jail' },
  { id: 'chal_hu_22', title: 'Pesca (Obligatorio Logro): Pescar Smallmouth Bass', region: 'henbane_river', hint: 'Río este de Henbane River' },
  { id: 'chal_hu_23', title: 'Pesca (Obligatorio Logro): Pescar Largemouth Bass', region: 'henbane_river', hint: 'Río junto a Whistling Beaver Brewery' },
  { id: 'chal_hu_24', title: 'Pesca (Obligatorio Logro): Pescar Bull Trout, Golden Trout, Lake Trout y Rainbow Trout', region: 'holland_valley', hint: 'Capturar los 4 tipos de trucha' },
  { id: 'chal_hu_25', title: 'Pesca (Obligatorio Logro): Pescar Pallid Sturgeon y Paddlefish Sturgeon', region: 'holland_valley', hint: 'Capturar ambos tipos de esturión en el río sur de Holland Valley' },
];

const CHALLENGE_DRAFTS                             = CHALLENGE_TITLES.map((c) => ({
  id: c.id,
  title: c.title,
  region: c.region,
  category: 'CHALLENGE',
  locationHint: c.hint,
  rpReward: 0,
}));

// 12. OBJETIVOS INTERNOS 100% DE LOS 3 DLCs (30)
const DLC_OBJECTIVE_DRAFTS                             = [
  // DLC 1: Hours of Darkness (10 objetivos internos)
  { id: 'dlc_hod_01', title: 'Rescatar Compañero #1: Joker (Sargento)', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Campamento de prisioneros al sur del accidente de helicóptero', rpReward: 0 },
  { id: 'dlc_hod_02', title: 'Rescatar Compañero #2: Moses', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Prisión de bambú en el sector central de Vietnam', rpReward: 0 },
  { id: 'dlc_hod_03', title: 'Rescatar Compañero #3: Yokel', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Base del NVA en el sector norte camino a la extracción', rpReward: 0 },
  { id: 'dlc_hod_04', title: 'Liberar los 5 Campamentos de Prisioneros Sur-Vietnamitas (POWs)', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Revelan todas las ubicaciones secundarias del mapa de Vietnam', rpReward: 0 },
  { id: 'dlc_hod_05', title: 'Destruir las 9 Baterías Antiaéreas (AA Guns)', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Habilita el bombardeo aéreo en los 9 sectores de Vietnam', rpReward: 0 },
  { id: 'dlc_hod_06', title: 'Eliminar a los 4 Comandantes del NVA', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Cuarteles fortificados en los 4 cuadrantes del mapa', rpReward: 0 },
  { id: 'dlc_hod_07', title: 'Recolectar los 4 Encendedores de Vietnam del DLC', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Cajas de recuerdos en búnkeres subterráneos del Viet Cong', rpReward: 0 },
  { id: 'dlc_hod_08', title: 'Destruir los 5 Altavoces de Propaganda', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Aldeas y cruces de caminos ocupados por el NVA', rpReward: 0 },
  { id: 'dlc_hod_09', title: 'Completar Modo Superviviente (Survivor Mode)', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Campaña de Vietnam con salud reducida e inventario limitado', rpReward: 0 },
  { id: 'dlc_hod_10', title: 'Completar Modo Película de Acción (Action Movie Mode)', region: 'dlc_vietnam', category: 'DLC_OBJECTIVE', locationHint: 'Campaña de Vietnam con ataques aéreos ilimitados y 4 armas', rpReward: 0 },

  // DLC 2: Lost on Mars (13 objetivos internos)
  { id: 'dlc_lom_01', title: 'Reactivar el Centro de Control de ANNE', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Torre central de Marte (Inicio de la campaña de Nick Rye)', rpReward: 0 },
  { id: 'dlc_lom_02', title: 'Reactivar las 18 Antenas y Terminales de Marte', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Desbloquea todas las impresoras 3D y zonas de viaje rápido', rpReward: 0 },
  { id: 'dlc_lom_03', title: 'Abatir a las 12 Reinas Arácnidas (Arachnid Queens)', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Cráteres de arena en Marte (Otorga núcleos de energía e ítem logro)', rpReward: 0 },
  { id: 'dlc_lom_04', title: 'Recolectar Parte de Hurk: Torso', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Instalación de teletransporte norte', rpReward: 0 },
  { id: 'dlc_lom_05', title: 'Recolectar Partes de Hurk: Ambos Brazos', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Cúpulas de investigación este y oeste', rpReward: 0 },
  { id: 'dlc_lom_06', title: 'Recolectar Partes de Hurk: Ambas Piernas y Entrepierna', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Nidos arácnidos y cañones del sur de Marte', rpReward: 0 },
  { id: 'dlc_lom_07', title: 'Recolectar las 19 Cajas de Partes Corporales de Hurk', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Reconstruir el cuerpo robótico completo de Hurk', rpReward: 0 },
  { id: 'dlc_lom_08', title: 'Recolectar las 15 Notas de Larry Parker (Martian Journal)', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Diarios repartidos junto cadáveres y terminales en Marte', rpReward: 0 },
  { id: 'dlc_lom_09', title: 'Completar todos los Desafíos de Clutch Nixon en Marte', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Pruebas de cinturón gravitatorio / Jetpack en Marte', rpReward: 0 },
  { id: 'dlc_lom_10', title: 'Desbloquear e Imprimir las 12 Armas Espaciales en Impresora 3D', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Blasters, Hellfire, Morphinator y Power Glove', rpReward: 0 },
  { id: 'dlc_lom_11', title: 'Desbloquear las 4 Mejoras de Traje Espacial y Jetpack', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Impresora 3D del Centro de Control', rpReward: 0 },
  { id: 'dlc_lom_12', title: 'Purgar las 6Instalaciones de Energía Alienígena', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Reactores principales custodiados por Reinas', rpReward: 0 },
  { id: 'dlc_lom_13', title: 'Derrotar al Jefe Final de Marte y Regresar a Hope County', region: 'dlc_mars', category: 'DLC_OBJECTIVE', locationHint: 'Batalla final en la Torre Central de ANNE', rpReward: 0 },

  // DLC 3: Dead Living Zombies (7 guiones de películas con Medalla de Oro / 3 Estrellas)
  { id: 'dlc_dlz_01', title: 'Película #1 (Campaña + Oro Score Attack): Fields of Terror', region: 'dlc_zombies', category: 'DLC_OBJECTIVE', locationHint: 'Granja infestada (Meta de Oro: >30,000 ptos en Score Attack)', rpReward: 0 },
  { id: 'dlc_dlz_02', title: 'Película #2 (Campaña + Oro Score Attack): Burned Bridges', region: 'dlc_zombies', category: 'DLC_OBJECTIVE', locationHint: 'Puente bloqueado (Meta de Oro: >45,000 ptos en Score Attack)', rpReward: 0 },
  { id: 'dlc_dlz_03', title: 'Película #3 (Campaña + Oro Score Attack): Undying Love', region: 'dlc_zombies', category: 'DLC_OBJECTIVE', locationHint: 'Cementerio y capilla (Meta de Oro: >42,000 ptos en Score Attack)', rpReward: 0 },
  { id: 'dlc_dlz_04', title: 'Película #4 (Campaña + Oro Score Attack): Escape from the Rooftop', region: 'dlc_zombies', category: 'DLC_OBJECTIVE', locationHint: 'Azoteas urbanas (Meta de Oro: >60,000 ptos en Score Attack)', rpReward: 0 },
  { id: 'dlc_dlz_05', title: 'Película #5 (Campaña + Oro Score Attack): Killer Climate', region: 'dlc_zombies', category: 'DLC_OBJECTIVE', locationHint: 'Bosque con Blood Dragon (Meta de Oro: >55,000 ptos en Score Attack)', rpReward: 0 },
  { id: 'dlc_dlz_06', title: 'Película #6 (Campaña + Oro Score Attack): The Fast and the Fiendish', region: 'dlc_zombies', category: 'DLC_OBJECTIVE', locationHint: 'Huida en vehículo (Meta de Oro: >25,000 ptos en Score Attack)', rpReward: 0 },
  { id: 'dlc_dlz_07', title: 'Película #7 (Campaña + Oro Score Attack): Laboratory of the Dead', region: 'dlc_zombies', category: 'DLC_OBJECTIVE', locationHint: 'Complejo militar (Meta de Oro: >50,000 ptos en Score Attack)', rpReward: 0 },
];

const RAW_CONTENT_DRAFTS                             = [
  ...STORY_DRAFTS,
  ...SIDE_MISSION_DRAFTS,
  ...PREPPER_STASH_DRAFTS,
  ...CULT_OUTPOST_DRAFTS,
  ...CULT_PROPERTY_DRAFTS,
  ...CLUTCH_NIXON_DRAFTS,
  ...COLLECTIBLE_DRAFTS,
  ...SPECIALIST_DRAFTS,
  ...FISHING_RECORD_DRAFTS,
  ...PERK_DRAFTS,
  ...CHALLENGE_DRAFTS,
  ...DLC_OBJECTIVE_DRAFTS,
];

// LOS 72 LOGROS REALES DE STEAM (50 Base + 1 NG+ + 7 Vietnam + 7 Marte + 7 Zombis)
const RAW_STEAM_DRAFTS                           = [
  // JUEGO BASE (50)
  { id: 'ach_01', apiName: 'ACH_THE_SPARK', title: 'The Spark', description: 'Completa el prólogo liberando la isla de Dutch (Solo Campaña).', scope: 'base', linkedItemIds: ['story_di_05'] },
  { id: 'ach_02', apiName: 'ACH_YOU_ARE_WRATH', title: 'You Are Wrath', description: 'Sé declarado el Pecado de la Ira en Holland Valley (Solo Campaña).', scope: 'base', linkedItemIds: ['story_hv_17'] },
  { id: 'ach_03', apiName: 'ACH_SPECIAL_DELIVERY', title: 'Special Delivery', description: 'Asegura el nacimiento del bebé de Kim y Nick Rye.', scope: 'base', linkedItemIds: ['story_hv_15'] },
  { id: 'ach_04', apiName: 'ACH_ONLY_YOU', title: 'Only You', description: 'Completa con éxito la Primera Prueba de Jacob Seed.', scope: 'base', linkedItemIds: ['story_wm_14'] },
  { id: 'ach_05', apiName: 'ACH_WALK_THE_PATH', title: 'Walk The Path', description: 'Descubre el Gozo en Henbane River.', scope: 'base', linkedItemIds: ['story_hr_15'] },
  { id: 'ach_06', apiName: 'ACH_QUALITY_OF_MERCY', title: 'The Quality of Mercy', description: 'Derrota a John Seed y libera Holland Valley.', scope: 'base', linkedItemIds: ['story_hv_quality_of_mercy'] },
  { id: 'ach_07', apiName: 'ACH_BLISSFUL', title: 'Blissful', description: 'Salva al Alguacil Burke del Gozo de Faith Seed.', scope: 'base', linkedItemIds: ['story_hr_16'] },
  { id: 'ach_08', apiName: 'ACH_SACRIFICE_THE_WEAK', title: 'Sacrifice the Weak', description: 'Derrota a Jacob Seed y libera Whitetail Mountains.', scope: 'base', linkedItemIds: ['story_wm_only_you'] },
  { id: 'ach_09', apiName: 'ACH_IGNORING_BLISS', title: 'Ignorance Is Bliss', description: 'Derrota a Faith Seed y libera Henbane River.', scope: 'base', linkedItemIds: ['story_hr_walk_the_path'] },
  { id: 'ach_10', apiName: 'ACH_TOGETHER_FOREVER', title: 'Together Forever', description: 'Llega al final de la historia principal enfrentando a Joseph Seed.', scope: 'base', linkedItemIds: ['story_cp_where_it_all_began'] },
  { id: 'ach_11', apiName: 'ACH_SAVING_DEPUTY_HUDSON', title: 'Saving Deputy Hudson', description: 'Salva a la ayudante Joey Hudson en el búnker de John Seed.', scope: 'base', linkedItemIds: ['story_hv_quality_of_mercy'] },
  { id: 'ach_12', apiName: 'ACH_SAVING_DEPUTY_PRATT', title: 'Saving Deputy Pratt', description: 'Salva al ayudante Staci Pratt en la armería de Jacob Seed.', scope: 'base', linkedItemIds: ['story_wm_only_you'] },
  { id: 'ach_13', apiName: 'ACH_SAVING_SHERIFF_WHITEHORSE', title: 'Saving Sheriff Whitehorse', description: 'Salva al Sheriff Earl Whitehorse en Henbane River.', scope: 'base', linkedItemIds: ['story_hr_walk_the_path'] },
  { id: 'ach_14', apiName: 'ACH_SCIENCE_FACT', title: 'Science Fact', description: 'Deja de lado el escepticismo y ayuda a Larry Parker en sus 4 misiones.', scope: 'base', linkedItemIds: ['side_hv_05', 'side_hv_06', 'side_hv_07', 'side_hv_08'] },
  { id: 'ach_15', apiName: 'ACH_AIN_NO_WALLFLOWER', title: "Ain't No Wallflower", description: 'Habla con 50 ciudadanos de Hope County.', scope: 'base' },
  { id: 'ach_16', apiName: 'ACH_BEEN_THERE_DONE_THAT', title: 'Been There, Done That', description: 'Completa TODOS los 25 desafíos de Caza y Pesca.', scope: 'base', linkedItemIds: ['chal_hu_01', 'chal_hu_05', 'chal_hu_10', 'chal_hu_15', 'chal_hu_20', 'chal_hu_25'] },
  { id: 'ach_17', apiName: 'ACH_LIBERATOR', title: 'Liberator', description: 'Libera 5 ubicaciones del Proyecto en Eden\'s Gate.', scope: 'base' },
  { id: 'ach_18', apiName: 'ACH_SCAVENGER', title: 'Scavenger', description: 'Sigue las pistas hasta el final de 3 escondites de preparacionista.', scope: 'base', linkedItemIds: ['stash_di_01', 'stash_hv_01', 'stash_hr_01'] },
  { id: 'ach_19', apiName: 'ACH_WHAT_NOW', title: 'What Now?', description: 'Completa 3 misiones secundarias en Hope County.', scope: 'base' },
  { id: 'ach_20', apiName: 'ACH_GREATEST_SOB', title: 'The Greatest SOB That Ever Lived', description: 'Ríete del peligro completando una acrobacia de Clutch Nixon en cada región.', scope: 'base', linkedItemIds: ['clutch_hv_01', 'clutch_hr_01', 'clutch_wm_01'] },
  { id: 'ach_21', apiName: 'ACH_PACK_RAT', title: 'Pack Rat', description: 'Consigue al menos 1 objeto de cada tipo de coleccionable.', scope: 'base', linkedItemIds: ['col_baseball_01', 'col_bobblehead_01', 'col_comic_01', 'col_lighter_01', 'col_vinyl_01', 'col_whiskey_01'] },
  { id: 'ach_22', apiName: 'ACH_A_WING_AND_A_PRAYER', title: 'A Wing and a Prayer', description: 'Vuela el avión de Nick Rye en la misión Wingman.', scope: 'base', linkedItemIds: ['story_hv_04'] },
  { id: 'ach_23', apiName: 'ACH_TROUBLEMAKER', title: 'Troublemaker', description: 'Descubre el placer de destruir propiedades del culto en CADA región.', scope: 'base', linkedItemIds: ['prop_hv_silo_01', 'prop_hr_shrine_01', 'prop_wm_beacon_01'] },
  { id: 'ach_24', apiName: 'ACH_SEWER_RAT', title: 'Sewer Rat', description: 'Destruye la bomba de tratamiento de agua del culto en Clean Water Act.', scope: 'base', linkedItemIds: ['story_hr_05'] },
  { id: 'ach_25', apiName: 'ACH_PEACHES_PLEASER', title: 'Peaches Pleaser', description: 'Usa premios para atraer a Peaches de vuelta a casa.', scope: 'base', linkedItemIds: ['story_hr_02'] },
  { id: 'ach_26', apiName: 'ACH_KICKING_THE_HORNETS_NEST', title: "Kicking the Hornet's Nest", description: 'Provoca la ira de un Heraldo alcanzando el Nivel 3 de Resistencia.', scope: 'base' },
  { id: 'ach_27', apiName: 'ACH_ARCADE_PLAYER', title: 'ARCADE Player', description: 'Alcanza el nivel 20 en el modo Far Cry Arcade.', scope: 'base' },
  { id: 'ach_28', apiName: 'ACH_ARCADE_HERO', title: 'ARCADE Hero', description: 'Juega 5 veces el modo Arcade Hero.', scope: 'base' },
  { id: 'ach_29', apiName: 'ACH_ARCADE_HUNTER', title: 'ARCADE Hunter', description: 'Mata a 100 enemigos en mapas multijugador de Far Cry Arcade.', scope: 'base' },
  { id: 'ach_30', apiName: 'ACH_ARCADE_ENTHUSIAST', title: 'ARCADE Enthusiast', description: 'Completa con éxito 10 mapas destacados de Arcade en Solo o Cooperativo.', scope: 'base' },
  { id: 'ach_31', apiName: 'ACH_ARCADE_COMPETITOR', title: 'ARCADE Competitor', description: 'Gana 10 mapas destacados en multijugador de Arcade.', scope: 'base' },
  { id: 'ach_32', apiName: 'ACH_THE_HURK_LOCKER', title: 'The Hurk Locker', description: 'Destruye 15 vehículos junto con Hurk en campaña.', scope: 'base', linkedItemIds: ['spec_hurk'] },
  { id: 'ach_33', apiName: 'ACH_HOPE_COUNTY_MASTER_ANGLER', title: 'Hope County Master Angler', description: 'Obtén las 4 cañas de pescar batiendo los 12 récords estatales difíciles.', scope: 'base', linkedItemIds: FISHING_RECORD_DRAFTS.map((f) => f.id) },
  { id: 'ach_34', apiName: 'ACH_LOCKED_AND_LOADED', title: 'Locked and Loaded', description: 'Personaliza tu arma con todos los accesorios y pintura.', scope: 'base' },
  { id: 'ach_35', apiName: 'ACH_GHOST_KILL', title: 'Ghost Kill', description: 'Realiza un tiro a la cabeza desde más de 150 metros con arco o rifle.', scope: 'base', linkedItemIds: ['chal_as_19'] },
  { id: 'ach_36', apiName: 'ACH_EXTRA_CRAFTY', title: 'Extra Crafty', description: 'Fabrica 25 recetas (explosivos u homeopáticos).', scope: 'base' },
  { id: 'ach_37', apiName: 'ACH_FASHION_FIRST', title: 'Fashion First', description: 'Compra $1,000 en ropa para personalizar tu personaje.', scope: 'base' },
  { id: 'ach_38', apiName: 'ACH_BIG_SPENDER', title: 'Big Spender', description: 'Gasta $50,000 en tiendas de vehículos.', scope: 'base' },
  { id: 'ach_39', apiName: 'ACH_STOCKED_GARAGE', title: 'Stocked Garage', description: 'Compra 3 vehículos para poblar tu garaje.', scope: 'base' },
  { id: 'ach_40', apiName: 'ACH_ACE_KILLER', title: 'Ace Killer', description: 'Destruye 10 aviones mientras conduces cualquier vehículo aéreo.', scope: 'base' },
  { id: 'ach_41', apiName: 'ACH_SQUASH_AND_RUN', title: 'Squash and Run', description: 'Atropella y mata a 20 enemigos con vehículos.', scope: 'base', linkedItemIds: ['chal_wo_08'] },
  { id: 'ach_42', apiName: 'ACH_FERTILIZING_THE_LAND', title: 'Fertilizing the Land', description: 'Usa un tractor con trituradora para aniquilar a 5 enemigos.', scope: 'base' },
  { id: 'ach_43', apiName: 'ACH_DEATH_FROM_ABOVE', title: 'Death From Above', description: 'Lanza una bomba desde un avión y destruye 4 vehículos a la vez.', scope: 'base' },
  { id: 'ach_44', apiName: 'ACH_OPPORTUNITY_KNOCKS', title: 'Opportunity Knocks', description: 'Usa piedras o latas para distraer a 15 enemigos.', scope: 'base', linkedItemIds: ['chal_wo_09'] },
  { id: 'ach_45', apiName: 'ACH_ROAD_GUNNER', title: 'Road Gunner', description: 'Mientras conduces o te asomas de un vehículo, mata a 25 enemigos.', scope: 'base' },
  { id: 'ach_46', apiName: 'ACH_FISH_MARKET', title: 'Fish Market', description: 'Vende 20 peces por dinero en tiendas.', scope: 'base' },
  { id: 'ach_47', apiName: 'ACH_WHERES_THE_BEEF', title: "Where's the Beef?", description: 'Mata a un toro a puñetazos limpios (usar homeopático Furious).', scope: 'base' },
  { id: 'ach_48', apiName: 'ACH_IGNOBLE_BEASTS', title: 'Ignoble Beasts', description: 'Mata a un bisonte usando únicamente armas cuerpo a cuerpo.', scope: 'base' },
  { id: 'ach_49', apiName: 'ACH_HITTING_IT_OFF', title: 'Hitting It Off', description: 'Juega 3 misiones con un amigo en modo Cooperativo.', scope: 'base' },
  { id: 'ach_50', apiName: 'ACH_LIKE_A_BIRD', title: 'Like a Bird', description: 'Usa el traje aéreo (wingsuit) para recorrer más de 5,000m.', scope: 'base', linkedItemIds: ['chal_wo_05'] },

  // NEW GAME+ (1)
  { id: 'ach_51', apiName: 'ACH_INFAMOUS', title: 'Infamous', description: 'Completa una Nueva Partida+ (New Game+) en dificultad Infame.', scope: 'ng_plus' },

  // DLC 1: HOURS OF DARKNESS (7)
  { id: 'ach_52', apiName: 'ACH_HOD_WELCOME_TO_NAM', title: 'Welcome to Nam', description: 'DLC Vietnam: Recupera tu equipo en el lugar del accidente del helicóptero.', scope: 'hours_of_darkness' },
  { id: 'ach_53', apiName: 'ACH_HOD_LEAVE_NO_ONE_BEHIND', title: 'Leave No One Behind', description: 'DLC Vietnam: Libera a los 3 prisioneros de guerra estadounidenses (Joker, Moses y Yokel).', scope: 'hours_of_darkness', linkedItemIds: ['dlc_hod_01', 'dlc_hod_02', 'dlc_hod_03'] },
  { id: 'ach_54', apiName: 'ACH_HOD_MAKE_THEM_COUNT', title: 'Make Them Count', description: 'DLC Vietnam: Mata a un total de 25 enemigos con ataques aéreos.', scope: 'hours_of_darkness' },
  { id: 'ach_55', apiName: 'ACH_HOD_SILENT_DEATH', title: 'Silent Death', description: 'DLC Vietnam: Realiza 25 bajas sigilosas teniendo activos los 4 instintos de supervivencia.', scope: 'hours_of_darkness' },
  { id: 'ach_56', apiName: 'ACH_HOD_WENDELLS_STORY', title: "Wendell's Story", description: 'DLC Vietnam: Completa la campaña Hours of Darkness en modo normal.', scope: 'hours_of_darkness' },
  { id: 'ach_57', apiName: 'ACH_HOD_ROGUELIKE', title: 'Roguelike', description: 'DLC Vietnam: Completa Hours of Darkness en Modo Superviviente (Survivor Mode).', scope: 'hours_of_darkness', linkedItemIds: ['dlc_hod_09'] },
  { id: 'ach_58', apiName: 'ACH_HOD_80S_HERO', title: '80s Hero', description: 'DLC Vietnam: Completa Hours of Darkness en Modo Película de Acción (Action Movie Mode).', scope: 'hours_of_darkness', linkedItemIds: ['dlc_hod_10'] },

  // DLC 2: LOST ON MARS (7)
  { id: 'ach_59', apiName: 'ACH_LOM_WELCOME_TO_MARS', title: 'Welcome to Mars', description: 'DLC Marte: Reinicia el terminal en la cima de la antena del Centro de Control.', scope: 'lost_on_mars', linkedItemIds: ['dlc_lom_01'] },
  { id: 'ach_60', apiName: 'ACH_LOM_BUG_SQUASHER', title: 'Bug Squasher', description: 'DLC Marte: Realiza 10 eliminaciones sobre Arácnidos usando el Power Glove.', scope: 'lost_on_mars' },
  { id: 'ach_61', apiName: 'ACH_LOM_SECOND_AMENDMENT', title: 'Mars Second Amendment', description: 'DLC Marte: Compra e imprime las 12 armas de Marte.', scope: 'lost_on_mars', linkedItemIds: ['dlc_lom_10'] },
  { id: 'ach_62', apiName: 'ACH_LOM_MARTIAN_JOURNAL', title: 'Martian Journal', description: 'DLC Marte: Recolecta las 15 notas de Larry Parker.', scope: 'lost_on_mars', linkedItemIds: ['dlc_lom_08'] },
  { id: 'ach_63', apiName: 'ACH_LOM_SLIMY_DEATH', title: 'Slimy Death', description: 'DLC Marte: Golpea a 10 Arácnidos con feromonas Crabmones.', scope: 'lost_on_mars' },
  { id: 'ach_64', apiName: 'ACH_LOM_NICKS_STORY', title: "Nick's Story", description: 'DLC Marte: Completa la campaña Lost on Mars.', scope: 'lost_on_mars', linkedItemIds: ['dlc_lom_13'] },
  { id: 'ach_65', apiName: 'ACH_LOM_QUEEN_IS_DEAD', title: 'The Queen is Dead!', description: 'DLC Marte: Elimina a las 12 Reinas Arácnidas.', scope: 'lost_on_mars', linkedItemIds: ['dlc_lom_03'] },

  // DLC 3: DEAD LIVING ZOMBIES (7)
  { id: 'ach_66', apiName: 'ACH_DLZ_FERTILIZER', title: 'FertiliZer', description: 'DLC Zombis: Mata a 10 Gougers o Hot Heads con el tractor en Fields of Terror.', scope: 'dead_living_zombies' },
  { id: 'ach_67', apiName: 'ACH_DLZ_EARLY_EXIT', title: 'Early ExZit Denied', description: 'DLC Zombis: Intenta escapar temprano por el puente en Burned Bridges.', scope: 'dead_living_zombies' },
  { id: 'ach_68', apiName: 'ACH_DLZ_BLOOD_ZRAGON', title: 'Blood Zragon', description: 'DLC Zombis: Mata al Blood Dragon en Killer Climate.', scope: 'dead_living_zombies' },
  { id: 'ach_69', apiName: 'ACH_DLZ_KILLER_BEEZ', title: 'Killer BeeZ', description: 'DLC Zombis: Destruye todos los nidos de Zom-bees en Laboratory of the Dead.', scope: 'dead_living_zombies' },
  { id: 'ach_70', apiName: 'ACH_DLZ_REZOLUTION', title: 'ReZolution', description: 'DLC Zombis: Completa los 7 guiones de películas de Guy Marvel.', scope: 'dead_living_zombies' },
  { id: 'ach_71', apiName: 'ACH_DLZ_DECEAZED', title: 'DeceaZed to ExZist', description: 'DLC Zombis: Mata un total de 5,000 Gougers, Hot Heads o Behemoths.', scope: 'dead_living_zombies' },
  { id: 'ach_72', apiName: 'ACH_DLZ_GOLD_MEDALIST', title: 'Gold Medalist', description: 'DLC Zombis: Consigue Medalla de Oro (3 estrellas) en los 7 guiones en Score Attack.', scope: 'dead_living_zombies', linkedItemIds: ['dlc_dlz_01', 'dlc_dlz_02', 'dlc_dlz_03', 'dlc_dlz_04', 'dlc_dlz_05', 'dlc_dlz_06', 'dlc_dlz_07'] },
];

                                 
                                         
                                                      
                                                              
                                                                                 
                                                                        
                                                          
                                                                              
                                                                       
                                                                                   
 

const buildCatalog = ()                 => {
  const items                = [];
  const itemById = new Map                     ();
  const itemByBitIndex = new Map                       ();
  const itemsByCategory = new Map                                ();
  const itemsByRegion = new Map                         ();

  const categoryCounts                                  = {
    STORY_MISSION: 0,
    SIDE_MISSION: 0,
    PREPPER_STASH: 0,
    CULT_OUTPOST: 0,
    CULT_PROPERTY: 0,
    CLUTCH_NIXON: 0,
    COLLECTIBLE: 0,
    SPECIALIST: 0,
    FISHING_RECORD: 0,
    PERK: 0,
    CHALLENGE: 0,
    DLC_OBJECTIVE: 0,
  };

  for (let i = 0; i < RAW_CONTENT_DRAFTS.length; i += 1) {
    const draft = RAW_CONTENT_DRAFTS[i];
    if (draft === undefined) {
      throw new Error(`Missing draft at index ${String(i)}`);
    }

    const id = createItemId(draft.id);
    if (itemById.has(id)) {
      throw new Error(`Duplicate ContentItem ID: ${draft.id}`);
    }

    const bitIndex = createBitIndex(i);
    const prerequisites = (draft.prerequisites ?? []).map((p) => createItemId(p));
    const item              = {
      id,
      bitIndex,
      title: draft.title,
      region: draft.region,
      category: draft.category,
      locationHint: draft.locationHint,
      rpReward: createResistancePoints(draft.rpReward),
      prerequisites,
      ...(draft.requiredRp !== undefined
        ? { requiredRp: createResistancePoints(draft.requiredRp) }
        : {}),
      ...(draft.collectibleType !== undefined
        ? { collectibleType: draft.collectibleType }
        : {}),
      ...(draft.missableWarning !== undefined
        ? { missableWarning: draft.missableWarning }
        : {}),
    };

    items.push(item);
    itemById.set(id, item);
    itemByBitIndex.set(bitIndex, item);

    const catList = itemsByCategory.get(item.category) ?? [];
    catList.push(item);
    itemsByCategory.set(item.category, catList);

    const regList = itemsByRegion.get(item.region) ?? [];
    regList.push(item);
    itemsByRegion.set(item.region, regList);

    categoryCounts[item.category] += 1;
  }

  for (const item of items) {
    for (const prereqId of item.prerequisites) {
      if (!itemById.has(prereqId)) {
        throw new Error(`Unknown prerequisite ${prereqId} on item ${item.id}`);
      }
      if (prereqId === item.id) {
        throw new Error(`Self-referential prerequisite on item ${item.id}`);
      }
    }
  }

  const categories = Object.keys(CATEGORY_QUOTAS)                              ;
  for (const cat of categories) {
    const expected = CATEGORY_QUOTAS[cat];
    const actual = categoryCounts[cat];
    if (actual !== expected) {
      throw new Error(
        `Catalog integrity violation for ${cat}: expected ${String(expected)}, got ${String(actual)}`
      );
    }
  }

  const steamAchievements                     = [];
  const achievementById = new Map                                      ();
  const achievementByApiName = new Map                          ();
  const achievementsByScope = new Map                              ();

  const scopeCounts                           = {
    base: 0,
    ng_plus: 0,
    hours_of_darkness: 0,
    lost_on_mars: 0,
    dead_living_zombies: 0,
  };

  for (let i = 0; i < RAW_STEAM_DRAFTS.length; i += 1) {
    const draft = RAW_STEAM_DRAFTS[i];
    if (draft === undefined) {
      throw new Error(`Missing Steam achievement draft at index ${String(i)}`);
    }
    const id = createSteamAchievementId(draft.id);
    if (achievementById.has(id) || achievementByApiName.has(draft.apiName)) {
      throw new Error(`Duplicate Steam achievement ${draft.id} / ${draft.apiName}`);
    }

    const linkedItemIds = (draft.linkedItemIds ?? []).map((rawId) => {
      const itemId = createItemId(rawId);
      if (!itemById.has(itemId)) {
        throw new Error(`Steam achievement ${draft.id} references unknown item ${rawId}`);
      }
      return itemId;
    });

    const achievement                   = {
      id,
      bitIndex: createBitIndex(i),
      apiName: draft.apiName,
      title: draft.title,
      description: draft.description,
      scope: draft.scope,
      linkedItemIds,
    };

    steamAchievements.push(achievement);
    achievementById.set(id, achievement);
    achievementByApiName.set(achievement.apiName, achievement);

    const scopeList = achievementsByScope.get(achievement.scope) ?? [];
    scopeList.push(achievement);
    achievementsByScope.set(achievement.scope, scopeList);

    scopeCounts[achievement.scope] += 1;
  }

  const scopes = Object.keys(STEAM_SCOPE_QUOTAS)                       ;
  for (const scope of scopes) {
    const expected = STEAM_SCOPE_QUOTAS[scope];
    const actual = scopeCounts[scope];
    if (actual !== expected) {
      throw new Error(
        `Steam quota integrity violation for ${scope}: expected ${String(expected)}, got ${String(actual)}`
      );
    }
  }

  return {
    items,
    itemById,
    itemByBitIndex,
    itemsByCategory,
    itemsByRegion,
    steamAchievements,
    achievementById,
    achievementByApiName,
    achievementsByScope,
  };
};

const FARCRY5_CATALOG                 = buildCatalog();


// --- ./src/ui/browser-bootstrap.ts ---


const STORAGE_KEY = 'fc5_completion_state_v1'         ;
const CONTENT_WORD_COUNT = Math.ceil(FARCRY5_CATALOG.items.length / 32);
const STEAM_WORD_COUNT = Math.ceil(FARCRY5_CATALOG.steamAchievements.length / 32);

// Ilustraciones vectoriales locales por región (inmunes a bloqueos de red/403)
const REGION_CARDS_DATA                                                                                                                   = {
  dutch_island: {
    bgImage: './assets/images/dutch.svg',
    badgeColor: '#5c7cfa',
    subtitle: 'Prólogo y Refugio Inicial'
  },
  holland_valley: {
    bgImage: './assets/images/holland.svg',
    badgeColor: '#f59f00',
    subtitle: 'John Seed • El Valle de la Expiación'
  },
  henbane_river: {
    bgImage: './assets/images/henbane.svg',
    badgeColor: '#f783ac',
    subtitle: 'Faith Seed • Niebla y Flores de Gozo'
  },
  whitetail_mountains: {
    bgImage: './assets/images/whitetail.svg',
    badgeColor: '#38d9a9',
    subtitle: 'Jacob Seed • Cumbres y Manadas de Lobos'
  },
  compound: {
    bgImage: './assets/images/compound.svg',
    badgeColor: '#ffd43b',
    subtitle: 'Joseph Seed • El Edén y el Juicio Final'
  },
  dlc_vietnam: {
    bgImage: './assets/images/vietnam.svg',
    badgeColor: '#ff6b6b',
    subtitle: 'Hours of Darkness • Rescate en la Selva'
  },
  dlc_mars: {
    bgImage: './assets/images/mars.svg',
    badgeColor: '#da77f2',
    subtitle: 'Lost on Mars • Nick Rye y Hurk Espacial'
  },
  dlc_zombies: {
    bgImage: './assets/images/zombies.svg',
    badgeColor: '#82c91e',
    subtitle: 'Dead Living Zombies • Guiones de Guy Marvel'
  }
};

const CATEGORY_LABELS                                            = {
  STORY_MISSION: 'Misiones Historia',
  SIDE_MISSION: 'Misiones Secundarias',
  PREPPER_STASH: 'Escondites Preparacionista',
  CULT_OUTPOST: 'Puestos del Culto',
  CULT_PROPERTY: 'Propiedades del Culto',
  CLUTCH_NIXON: 'Clutch Nixon',
  COLLECTIBLE: 'Coleccionables',
  SPECIALIST: 'Especialistas (9)',
  FISHING_RECORD: 'Récords Pesca (Old Betsy)',
  PERK: 'Talentos / Perks (50)',
  CHALLENGE: 'Desafíos (69)',
  DLC_OBJECTIVE: 'Objetivos Internos DLCs',
};

const STEAM_SCOPE_LABELS                                     = {
  base: 'Juego Base (50)',
  ng_plus: 'New Game+ Infamous (1)',
  hours_of_darkness: 'DLC 1: Hours of Darkness (7)',
  lost_on_mars: 'DLC 2: Lost on Mars (7)',
  dead_living_zombies: 'DLC 3: Dead Living Zombies (7)',
};

const popcount32 = (value        )         => {
  let v = value - ((value >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
};

const hasBit = (bitset             , index          )          => {
  const wordIndex = index >>> 5;
  const word = bitset[wordIndex];
  if (word === undefined) {
    return false;
  }
  return (word & (1 << (index & 31))) !== 0;
};

const setBit = (bitset             , index          , enabled         )       => {
  const wordIndex = index >>> 5;
  const current = bitset[wordIndex];
  if (current === undefined) {
    return;
  }
  const mask = 1 << (index & 31);
  bitset[wordIndex] = enabled ? current | mask : current & ~mask;
};

const countBits = (bitset             )         => {
  let total = 0;
  for (let i = 0; i < bitset.length; i += 1) {
    const word = bitset[i];
    if (word !== undefined) {
      total += popcount32(word);
    }
  }
  return total;
};

const bitsetToHex = (bitset             )         => {
  let hex = '';
  for (let i = 0; i < bitset.length; i += 1) {
    const word = bitset[i] ?? 0;
    hex += (word >>> 0).toString(16).padStart(8, '0');
  }
  return hex;
};

const hexToBitset = (hex        , expectedWords        )                     => {
  if (hex.length !== expectedWords * 8 || !/^[0-9a-fA-F]*$/.test(hex)) {
    return null;
  }
  const out = new Uint32Array(expectedWords);
  for (let i = 0; i < expectedWords; i += 1) {
    const parsed = Number.parseInt(hex.slice(i * 8, (i + 1) * 8), 16);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    out[i] = parsed >>> 0;
  }
  return out;
};

const bootstrapTrackerApp = ()       => {
  let contentBitset              = new Uint32Array(CONTENT_WORD_COUNT);
  let steamBitset              = new Uint32Array(STEAM_WORD_COUNT);

  // Vistas: 'REGIONS' | 'CHECKLIST' | 'STEAM'
  let currentView                                    = 'REGIONS';
  let selectedRegion                   = 'ALL';
  let selectedCategory                          = 'ALL';
  let selectedSteamScope                   = 'ALL';
  let selectedStatus                         = 'ALL';
  let searchQuery = '';

  const showError = (msg        )       => {
    const banner = document.getElementById('error-banner');
    const text = document.getElementById('error-text');
    if (banner && text) {
      text.textContent = msg;
      banner.classList.add('visible');
    }
  };

  const clearError = ()       => {
    const banner = document.getElementById('error-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
  };

  const saveState = ()       => {
    try {
      const state                        = {
        version: 1,
        contentBitsetHex: bitsetToHex(contentBitset),
        steamBitsetHex: bitsetToHex(steamBitset),
        updatedAtEpochMs: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      showError('No se pudo guardar en localStorage.');
    }
  };

  const loadState = ()       => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        return;
      }
      const parsed          = JSON.parse(raw);
      if (!isPersistedState(parsed)) {
        return;
      }
      const cBits = hexToBitset(parsed.contentBitsetHex, CONTENT_WORD_COUNT);
      const sBits = hexToBitset(parsed.steamBitsetHex, STEAM_WORD_COUNT);
      if (cBits !== null && sBits !== null) {
        contentBitset = cBits;
        steamBitset = sBits;
      }
    } catch {
      showError('El estado guardado estaba corrupto; se inició limpio.');
    }
  };

  const getRegionRp = (regionId          )         => {
    const items = FARCRY5_CATALOG.itemsByRegion.get(regionId) ?? [];
    const maxRp = REGION_METADATA[regionId].maxRp;
    let total = 0;
    for (const item of items) {
      if (hasBit(contentBitset, item.bitIndex)) {
        total += item.rpReward;
      }
    }
    return maxRp > 0 ? Math.min(total, maxRp) : 0;
  };

  const reconcileSteamAchievements = ()       => {
    for (const ach of FARCRY5_CATALOG.steamAchievements) {
      if (ach.linkedItemIds.length === 0 || ach.scope === 'ng_plus') {
        continue;
      }
      let allDone = true;
      for (const itemId of ach.linkedItemIds) {
        const linked = FARCRY5_CATALOG.itemById.get(itemId);
        if (linked === undefined || !hasBit(contentBitset, linked.bitIndex)) {
          allDone = false;
          break;
        }
      }
      if (allDone) {
        setBit(steamBitset, ach.bitIndex, true);
      }
    }
  };

  const handleToggleContent = (itemId        )       => {
    const item = FARCRY5_CATALOG.itemById.get(itemId);
    if (item === undefined) {
      return;
    }
    const currentlyDone = hasBit(contentBitset, item.bitIndex);
    const nextState = !currentlyDone;

    if (nextState) {
      const missingTitles           = [];
      for (const prereqId of item.prerequisites) {
        const prereq = FARCRY5_CATALOG.itemById.get(prereqId);
        if (prereq !== undefined && !hasBit(contentBitset, prereq.bitIndex)) {
          missingTitles.push(prereq.title);
        }
      }
      if (missingTitles.length > 0) {
        showError(
          `Prerrequisito pendiente para "${item.title}": primero debes completar [${missingTitles.join(', ')}].`
        );
        renderAll();
        return;
      }

      if (item.requiredRp !== undefined) {
        const currentRp = createResistancePoints(getRegionRp(item.region));
        if (currentRp < item.requiredRp) {
          showError(
            `Puntos de Resistencia insuficientes en ${REGION_METADATA[item.region].name}: tienes ${String(currentRp)} RP y "${item.title}" requiere ${String(item.requiredRp)} RP.`
          );
          renderAll();
          return;
        }
      }
    }

    clearError();
    setBit(contentBitset, item.bitIndex, nextState);
    reconcileSteamAchievements();
    saveState();
    renderAll();
  };

  const handleToggleSteam = (achId                    )       => {
    const ach = FARCRY5_CATALOG.achievementById.get(achId);
    if (ach === undefined) {
      return;
    }
    clearError();
    const nextState = !hasBit(steamBitset, ach.bitIndex);
    setBit(steamBitset, ach.bitIndex, nextState);
    saveState();
    renderAll();
  };

  const renderMetrics = ()       => {
    const cDone = countBits(contentBitset);
    const cTotal = FARCRY5_CATALOG.items.length;
    const cPct = (cDone / cTotal) * 100;

    const sDone = countBits(steamBitset);
    const sTotal = FARCRY5_CATALOG.steamAchievements.length;
    const sPct = (sDone / sTotal) * 100;

    const true100 = cPct * 0.8 + sPct * 0.2;

    const elTrue = document.getElementById('metric-true-100');
    const barTrue = document.getElementById('bar-true-100');
    const elContent = document.getElementById('metric-content');
    const barContent = document.getElementById('bar-content');
    const elSteam = document.getElementById('metric-steam');
    const barSteam = document.getElementById('bar-steam');

    if (elTrue) elTrue.textContent = `${true100.toFixed(2)}%`;
    if (barTrue) barTrue.style.width = `${true100.toFixed(2)}%`;
    if (elContent) elContent.textContent = `${String(cDone)} / ${String(cTotal)} (${cPct.toFixed(1)}%)`;
    if (barContent) barContent.style.width = `${cPct.toFixed(1)}%`;
    if (elSteam) elSteam.textContent = `${String(sDone)} / ${String(sTotal)} (${sPct.toFixed(1)}%)`;
    if (barSteam) barSteam.style.width = `${sPct.toFixed(1)}%`;
  };

  const renderRegions = ()       => {
    const grid = document.getElementById('region-grid');
    if (!grid) {
      return;
    }
    grid.innerHTML = '';

    const regionIds = Object.keys(REGION_METADATA)                       ;
    for (const regionId of regionIds) {
      const meta = REGION_METADATA[regionId];
      const visual = REGION_CARDS_DATA[regionId];
      const items = FARCRY5_CATALOG.itemsByRegion.get(regionId) ?? [];
      let done = 0;
      for (const item of items) {
        if (hasBit(contentBitset, item.bitIndex)) {
          done += 1;
        }
      }
      const pct = items.length === 0 ? 100 : (done / items.length) * 100;
      const currentRp = getRegionRp(regionId);
      const [t1, t2, t3] = meta.thresholds;
      const level =
        meta.maxRp === 0 ? 0 : currentRp >= t3 ? 3 : currentRp >= t2 ? 2 : currentRp >= t1 ? 1 : 0;

      const card = document.createElement('article');
      card.className = `region-card-poster${selectedRegion === regionId ? ' active' : ''}`;
      card.innerHTML = `
        <div class="poster-image-box" style="background-image: url('${visual.bgImage}');">
          <div class="poster-overlay">
            <span class="poster-badge" style="background: ${visual.badgeColor};">${meta.name}</span>
            <span class="poster-percentage">${pct.toFixed(0)}%</span>
          </div>
        </div>
        <div class="poster-content">
          <h3 class="poster-title">${meta.name}</h3>
          <p class="poster-herald">${meta.herald}</p>
          <div class="progress-track" style="height: 10px; margin: 8px 0;">
            <div class="progress-fill" style="width: ${pct.toFixed(1)}%"></div>
          </div>
          <div class="poster-stats">
            <span>Completados: <strong>${String(done)} / ${String(items.length)}</strong></span>
            ${meta.maxRp > 0 ? `<span>RP: <strong>${String(currentRp)} / ${String(meta.maxRp)}</strong> (Nv. ${String(level)}/3)</span>` : `<span>DLC / Sector Especial</span>`}
          </div>
          <button type="button" class="btn-enter-region">Abrir Lista de Tareas ➜</button>
        </div>
      `;
      card.addEventListener('click', () => {
        selectedRegion = regionId;
        currentView = 'CHECKLIST';
        const regSelect = document.getElementById('region-select')                            ;
        if (regSelect) {
          regSelect.value = selectedRegion;
        }
        renderAll();
      });
      grid.appendChild(card);
    }
  };

  const renderViewTabs = ()       => {
    const navRegions = document.getElementById('nav-regions');
    const navChecklist = document.getElementById('nav-checklist');
    const navSteam = document.getElementById('nav-steam');

    const viewRegionsSection = document.getElementById('view-regions');
    const viewChecklistSection = document.getElementById('view-checklist');
    const viewSteamSection = document.getElementById('view-steam');

    if (navRegions) navRegions.className = `view-nav-btn${currentView === 'REGIONS' ? ' active' : ''}`;
    if (navChecklist) navChecklist.className = `view-nav-btn${currentView === 'CHECKLIST' ? ' active' : ''}`;
    if (navSteam) navSteam.className = `view-nav-btn${currentView === 'STEAM' ? ' active' : ''}`;

    if (viewRegionsSection) viewRegionsSection.style.display = currentView === 'REGIONS' ? 'flex' : 'none';
    if (viewChecklistSection) viewChecklistSection.style.display = currentView === 'CHECKLIST' ? 'flex' : 'none';
    if (viewSteamSection) viewSteamSection.style.display = currentView === 'STEAM' ? 'flex' : 'none';

    // Banner de cabecera contextual en checklist
    const regionBanner = document.getElementById('current-region-banner');
    if (regionBanner) {
      if (selectedRegion !== 'ALL') {
        const meta = REGION_METADATA[selectedRegion];
        const visual = REGION_CARDS_DATA[selectedRegion];
        regionBanner.style.display = 'block';
        regionBanner.style.backgroundImage = `linear-gradient(rgba(14,24,36,0.7), rgba(14,24,36,0.9)), url('${visual.bgImage}')`;
        regionBanner.innerHTML = `
          <div style="padding: 24px;">
            <span style="background: ${visual.badgeColor}; color: #fff; font-weight: 800; font-size: 0.8rem; padding: 4px 10px; border-radius: 4px;">ZONA SELECCIONADA</span>
            <h2 style="font-family: 'Teko', sans-serif; font-size: 2.8rem; color: #fff; margin: 4px 0;">${meta.name}</h2>
            <p style="color: #e2d7be; font-size: 0.95rem;">${meta.herald} • ${visual.subtitle}</p>
          </div>
        `;
      } else {
        regionBanner.style.display = 'none';
      }
    }
  };

  const renderPillsAndSelects = ()       => {
    const regSelect = document.getElementById('region-select')                            ;
    const catSelect = document.getElementById('category-select')                            ;
    const pillsContainer = document.getElementById('category-pills');

    if (regSelect) {
      regSelect.value = selectedRegion;
    }

    if (catSelect) {
      catSelect.innerHTML = '';
      const allOpt = document.createElement('option');
      allOpt.value = 'ALL';
      allOpt.textContent = 'Categoría: Todas (448)';
      catSelect.appendChild(allOpt);

      const cats = Object.keys(CATEGORY_QUOTAS)                              ;
      for (const cat of cats) {
        const items = FARCRY5_CATALOG.itemsByCategory.get(cat) ?? [];
        let done = 0;
        for (const item of items) {
          if (hasBit(contentBitset, item.bitIndex)) done += 1;
        }
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `${CATEGORY_LABELS[cat]} (${String(done)}/${String(CATEGORY_QUOTAS[cat])})`;
        catSelect.appendChild(opt);
      }
      catSelect.value = selectedCategory;
    }

    if (pillsContainer) {
      pillsContainer.innerHTML = '';
      const cats = Object.keys(CATEGORY_QUOTAS)                              ;
      for (const cat of cats) {
        const items = FARCRY5_CATALOG.itemsByCategory.get(cat) ?? [];
        let done = 0;
        for (const item of items) {
          if (hasBit(contentBitset, item.bitIndex)) done += 1;
        }
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `cat-pill${selectedCategory === cat ? ' active' : ''}`;
        pill.textContent = `${CATEGORY_LABELS[cat]}: ${String(done)}/${String(CATEGORY_QUOTAS[cat])}`;
        pill.addEventListener('click', () => {
          selectedCategory = selectedCategory === cat ? 'ALL' : cat;
          renderAll();
        });
        pillsContainer.appendChild(pill);
      }
    }
  };

  const renderChecklist = ()       => {
    const list = document.getElementById('checklist-container');
    const counter = document.getElementById('results-counter');
    if (!list) {
      return;
    }
    list.innerHTML = '';
    const q = searchQuery.trim().toLowerCase();

    const filtered = FARCRY5_CATALOG.items.filter((item) => {
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      const done = hasBit(contentBitset, item.bitIndex);
      if (selectedStatus === 'COMPLETED' && !done) return false;
      if (selectedStatus === 'PENDING' && done) return false;
      if (q.length > 0) {
        return (
          item.title.toLowerCase().includes(q) ||
          item.locationHint.toLowerCase().includes(q) ||
          CATEGORY_LABELS[item.category].toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (counter) {
      counter.textContent = `Mostrando ${String(filtered.length)} de ${String(FARCRY5_CATALOG.items.length)} objetivos`;
    }

    for (const item of filtered) {
      const done = hasBit(contentBitset, item.bitIndex);
      const li = document.createElement('li');
      li.className = `check-row${done ? ' completed' : ''}`;

      const label = document.createElement('label');
      label.className = 'check-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = done;
      checkbox.addEventListener('change', () => {
        handleToggleContent(item.id);
      });

      const main = document.createElement('div');
      main.className = 'item-main';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'item-title';
      titleSpan.textContent = item.title;

      const hintSpan = document.createElement('span');
      hintSpan.className = 'item-hint';
      hintSpan.textContent = `📍 ${REGION_METADATA[item.region].name} — ${item.locationHint}`;

      main.appendChild(titleSpan);
      main.appendChild(hintSpan);

      if (item.missableWarning !== undefined) {
        const warnSpan = document.createElement('span');
        warnSpan.className = 'item-warn';
        warnSpan.textContent = `⚠️ ${item.missableWarning}`;
        main.appendChild(warnSpan);
      }

      label.appendChild(checkbox);
      label.appendChild(main);

      const badges = document.createElement('div');
      badges.className = 'badges';

      const catBadge = document.createElement('span');
      catBadge.className = 'badge badge-cat';
      catBadge.textContent = CATEGORY_LABELS[item.category];
      badges.appendChild(catBadge);

      if (item.rpReward > 0) {
        const rpBadge = document.createElement('span');
        rpBadge.className = 'badge badge-rp';
        rpBadge.textContent = `+${String(item.rpReward)} RP`;
        badges.appendChild(rpBadge);
      }

      if (item.requiredRp !== undefined) {
        const reqBadge = document.createElement('span');
        reqBadge.className = 'badge badge-req';
        reqBadge.textContent = `Req: ${String(item.requiredRp)} RP`;
        badges.appendChild(reqBadge);
      }

      li.appendChild(label);
      li.appendChild(badges);
      list.appendChild(li);
    }
  };

  const renderSteamList = ()       => {
    const steamList = document.getElementById('steam-container');
    const steamCounter = document.getElementById('steam-results-counter');
    const steamScopeSelect = document.getElementById('steam-scope-select')                            ;
    if (!steamList) {
      return;
    }
    steamList.innerHTML = '';
    const q = searchQuery.trim().toLowerCase();

    if (steamScopeSelect && steamScopeSelect.options.length <= 1) {
      steamScopeSelect.innerHTML = '<option value="ALL">Todos los Alcances (72 Logros)</option>';
      const scopes = Object.keys(STEAM_SCOPE_QUOTAS)                       ;
      for (const sc of scopes) {
        const opt = document.createElement('option');
        opt.value = sc;
        opt.textContent = STEAM_SCOPE_LABELS[sc];
        steamScopeSelect.appendChild(opt);
      }
    }

    const filtered = FARCRY5_CATALOG.steamAchievements.filter((ach) => {
      if (selectedSteamScope !== 'ALL' && ach.scope !== selectedSteamScope) return false;
      const done = hasBit(steamBitset, ach.bitIndex);
      if (selectedStatus === 'COMPLETED' && !done) return false;
      if (selectedStatus === 'PENDING' && done) return false;
      if (q.length > 0) {
        return (
          ach.title.toLowerCase().includes(q) ||
          ach.description.toLowerCase().includes(q) ||
          ach.apiName.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (steamCounter) {
      steamCounter.textContent = `Mostrando ${String(filtered.length)} de 72 logros oficiales de Steam`;
    }

    for (const ach of filtered) {
      const done = hasBit(steamBitset, ach.bitIndex);
      const li = document.createElement('li');
      li.className = `check-row${done ? ' completed' : ''}`;

      const label = document.createElement('label');
      label.className = 'check-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = done;
      checkbox.addEventListener('change', () => {
        handleToggleSteam(ach.id);
      });

      const main = document.createElement('div');
      main.className = 'item-main';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'item-title';
      titleSpan.textContent = `🏆 ${ach.title}`;

      const descSpan = document.createElement('span');
      descSpan.className = 'item-hint';
      descSpan.textContent = `${ach.description} (${ach.apiName})`;

      main.appendChild(titleSpan);
      main.appendChild(descSpan);

      label.appendChild(checkbox);
      label.appendChild(main);

      const badges = document.createElement('div');
      badges.className = 'badges';
      const scopeBadge = document.createElement('span');
      scopeBadge.className = 'badge badge-cat';
      scopeBadge.textContent = STEAM_SCOPE_LABELS[ach.scope];
      badges.appendChild(scopeBadge);

      li.appendChild(label);
      li.appendChild(badges);
      steamList.appendChild(li);
    }
  };

  const renderAll = ()       => {
    renderMetrics();
    renderViewTabs();
    if (currentView === 'REGIONS') {
      renderRegions();
    } else if (currentView === 'CHECKLIST') {
      renderPillsAndSelects();
      renderChecklist();
    } else if (currentView === 'STEAM') {
      renderSteamList();
    }
  };

  // Selectores de navegación
  document.getElementById('nav-regions')?.addEventListener('click', () => {
    currentView = 'REGIONS';
    renderAll();
  });

  document.getElementById('nav-checklist')?.addEventListener('click', () => {
    currentView = 'CHECKLIST';
    renderAll();
  });

  document.getElementById('nav-steam')?.addEventListener('click', () => {
    currentView = 'STEAM';
    renderAll();
  });

  // Inicializar selectores de filtros
  const regSelect = document.getElementById('region-select')                            ;
  if (regSelect) {
    regSelect.innerHTML = '<option value="ALL">Región: Todas (Hope County + DLCs)</option>';
    const regionIds = Object.keys(REGION_METADATA)                       ;
    for (const rId of regionIds) {
      const opt = document.createElement('option');
      opt.value = rId;
      opt.textContent = REGION_METADATA[rId].name;
      regSelect.appendChild(opt);
    }
    regSelect.addEventListener('change', () => {
      selectedRegion = regSelect.value                    ;
      renderAll();
    });
  }

  const catSelect = document.getElementById('category-select')                            ;
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      selectedCategory = catSelect.value                           ;
      renderAll();
    });
  }

  const statusSelect = document.getElementById('status-select')                            ;
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      selectedStatus = statusSelect.value                          ;
      renderAll();
    });
  }

  const steamScopeSelect = document.getElementById('steam-scope-select')                            ;
  if (steamScopeSelect) {
    steamScopeSelect.addEventListener('change', () => {
      selectedSteamScope = steamScopeSelect.value                    ;
      renderAll();
    });
  }

  const searchInput = document.getElementById('search-input')                           ;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value;
      if (currentView === 'CHECKLIST') {
        renderChecklist();
      } else if (currentView === 'STEAM') {
        renderSteamList();
      }
    });
  }

  document.getElementById('btn-close-error')?.addEventListener('click', () => {
    clearError();
  });

  document.getElementById('btn-mark-visible')?.addEventListener('click', () => {
    const q = searchQuery.trim().toLowerCase();
    for (const item of FARCRY5_CATALOG.items) {
      if (selectedRegion !== 'ALL' && item.region !== selectedRegion) continue;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) continue;
      if (
        q.length > 0 &&
        !item.title.toLowerCase().includes(q) &&
        !item.locationHint.toLowerCase().includes(q)
      ) {
        continue;
      }
      let canMark = true;
      for (const pId of item.prerequisites) {
        const pItem = FARCRY5_CATALOG.itemById.get(pId);
        if (pItem !== undefined && !hasBit(contentBitset, pItem.bitIndex)) {
          canMark = false;
          break;
        }
      }
      if (canMark && item.requiredRp !== undefined) {
        if (getRegionRp(item.region) < item.requiredRp) {
          canMark = false;
        }
      }
      if (canMark) {
        setBit(contentBitset, item.bitIndex, true);
      }
    }
    reconcileSteamAchievements();
    saveState();
    renderAll();
  });

  document.getElementById('btn-export')?.addEventListener('click', () => {
    const payload                        = {
      version: 1,
      contentBitsetHex: bitsetToHex(contentBitset),
      steamBitsetHex: bitsetToHex(steamBitset),
      updatedAtEpochMs: Date.now(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farcry5-100-progreso.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btn-import')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed          = JSON.parse(String(reader.result));
          if (!isPersistedState(parsed)) {
            showError('El archivo JSON no tiene un formato válido.');
            return;
          }
          const cBits = hexToBitset(parsed.contentBitsetHex, CONTENT_WORD_COUNT);
          const sBits = hexToBitset(parsed.steamBitsetHex, STEAM_WORD_COUNT);
          if (!cBits || !sBits) {
            showError('Bitset hexadecimal corrupto en el archivo importado.');
            return;
          }
          contentBitset = cBits;
          steamBitset = sBits;
          saveState();
          clearError();
          renderAll();
        } catch {
          showError('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('¿Seguro que deseas reiniciar todo el progreso a 0%?')) {
      contentBitset = new Uint32Array(CONTENT_WORD_COUNT);
      steamBitset = new Uint32Array(STEAM_WORD_COUNT);
      saveState();
      clearError();
      renderAll();
    }
  });

  // Sincronización en tiempo real entre múltiples pestañas / ventanas
  window.addEventListener('storage', (event              ) => {
    if (event.key === STORAGE_KEY && event.newValue !== null) {
      loadState();
      renderAll();
    }
  });

  // Atajos de teclado para productividad de alto rendimiento
  window.addEventListener('keydown', (event               ) => {
    // Si el usuario escribe en un campo de texto, ignorar atajos de navegación
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (event.key === '/' && activeTag !== 'input' && activeTag !== 'textarea') {
      event.preventDefault();
      const sInput = document.getElementById('search-input')                           ;
      if (sInput) {
        if (currentView !== 'CHECKLIST' && currentView !== 'STEAM') {
          currentView = 'CHECKLIST';
          renderAll();
        }
        sInput.focus();
        sInput.select();
      }
      return;
    }

    if (event.key === 'Escape' && activeTag === 'input') {
      const sInput = document.getElementById('search-input')                           ;
      if (sInput) {
        sInput.value = '';
        searchQuery = '';
        sInput.blur();
        renderAll();
      }
      return;
    }

    if (event.altKey) {
      if (event.key === '1') {
        currentView = 'REGIONS';
        renderAll();
      } else if (event.key === '2') {
        currentView = 'CHECKLIST';
        renderAll();
      } else if (event.key === '3') {
        currentView = 'STEAM';
        renderAll();
      }
    }
  });

  loadState();
  renderAll();
};


if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapTrackerApp);
  } else {
    bootstrapTrackerApp();
  }
}
})();
