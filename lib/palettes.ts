export const palettes = [
 {id:'blue',name:'Azul suave',description:'Um céu tranquilo',colors:['#fcfdfd','#36758d','#e4f4fa']},
 {id:'garden',name:'Jardim',description:'Verdes suaves',colors:['#f5f9f3','#42664b','#e1eedb']},
 {id:'neutral',name:'Neutra',description:'Areia e tons discretos',colors:['#faf8f3','#695d4e','#eee7d9']},
 {id:'night',name:'Noite suave',description:'Fundo escuro e acolhedor',colors:['#1d2731','#b6dcef','#334f63']},
] as const;
export type PaletteId = typeof palettes[number]['id'];
