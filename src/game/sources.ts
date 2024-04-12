import { Resource } from '../engine/Resources';

export const resources: Resource[] = [
  {
    name: 'Car',
    type: 'gltf',
    path: 'models/Low-Poly-Racing-Car2.glb',
  },
  {
    name: 'Map',
    type: 'gltf',
    path: 'models/map12.glb',
  },
  {
    name: 'SkyBox',
    type: 'cubeTexture',
    path: [
      'images/px.jpg',
      'images/nx.jpg',
      'images/py.jpg',
      'images/ny.jpg',
      'images/pz.jpg',
      'images/nz.jpg',
    ],
  },
  {
    name: 'matcap8',
    type: 'texture',
    path: 'images/matcaps/5.png',
  },
  {
    name: 'fire',
    type: 'texture',
    path: 'images/fire.png',
  },
  {
    name: 'Airstrike',
    type: 'font3d',
    path: 'fonts/Airstrike_Regular.json',
  },
  {
    name: 'music',
    type: 'sfx',
    path: 'sfx/house_party.mp3',
  },
  {
    name: 'checkpoint',
    type: 'sfx',
    path: 'sfx/zapsplat_multimedia_game_sound_coins_collect_several_at_once_002_40813.mp3',
  },
  {
    name: 'click',
    type: 'sfx',
    path: 'sfx/zapsplat_multimedia_button_click_bright_003_92100.mp3',
  },
  {
    name: 'beep',
    type: 'sfx',
    path: 'sfx/zapsplat_transport_airplane_call_button_beep_17748.mp3',
  },
  {
    name: 'beepEnd',
    type: 'sfx',
    path: 'sfx/zapsplat_transport_airplane_call_button_beep_17748_pitched.mp3',
  },
  {
    name: 'engine',
    type: 'sfx',
    path: 'sfx/smartsound_TRANSPORTATION_MOTORCYCLE_Engine_Slow_Idle_Steady_01.mp3',
  },
  {
    name: 'checkpointLoad',
    type: 'sfx',
    path: 'sfx/zapsplat_multimedia_correct_tone_beep_17736.mp3',
  },
  {
    name: 'kick',
    type: 'sfx',
    path: 'sfx/transportation_tyre_fully_inflated_kick_with_boot_004.mp3',
  },
  {
    name: 'finish1',
    type: 'sfx',
    path: 'sfx/zapsplat_multimedia_game_sound_bright_win_bonus_level_up_92958.mp3',
  },
  {
    name: 'finish2',
    type: 'sfx',
    path: 'sfx/zapsplat_cartoon_male_character_cheer_whoopee_001_71990.mp3',
  },
];
