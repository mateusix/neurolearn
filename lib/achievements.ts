export const achievements = [
  {id:'first-cycle',at:3,title:'Primeiras descobertas',detail:'Você explorou letras e sílabas.',icon:'🌱'},
  {id:'word-explorer',at:6,title:'Explorador de palavras',detail:'Mais palavras para sua coleção.',icon:'🔎'},
  {id:'letter-friend',at:9,title:'Amigo das letras',detail:'Você descobriu novas formas das letras.',icon:'⭐'},
  {id:'word-builder',at:12,title:'Construtor de palavras',detail:'Você montou palavras com mais autonomia.',icon:'🧩'},
  {id:'sentence-path',at:15,title:'Caminho das frases',detail:'Palavras juntas contam uma ideia.',icon:'📖'},
  {id:'sound-discoverer',at:18,title:'Descobridor de sons',detail:'Você explorou frases e sons.',icon:'🎵'},
  {id:'journey-complete',at:21,title:'Primeira trilha de descobertas',detail:'Você explorou letras, palavras e frases.',icon:'🏆'},
  {id:'story-reader',at:24,title:'Amigo das histórias',detail:'Você leu pequenas histórias e combinou imagens.',icon:'📚'},
  {id:'memory-friend',at:26,title:'Memória de descobertas',detail:'Você combinou imagens com palavras, no seu ritmo.',icon:'🦋'},
] as const;
export function earnedAchievements(completed:number) { return achievements.filter(item=>item.at<=completed); }
