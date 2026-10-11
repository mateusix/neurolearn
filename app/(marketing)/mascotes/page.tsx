import Image from "next/image";
import Link from "next/link";
import styles from "./mascotes.module.css";

const expressions = [
  { id: "feliz", title: "Feliz", message: "Que bom ter você aqui!", use: "Boas-vindas" },
  { id: "curioso", title: "Curioso", message: "O que vamos descobrir?", use: "Uma nova descoberta" },
  { id: "comemorando", title: "Comemorando", message: "Você conseguiu!", use: "Atividade concluída" },
  { id: "pensativo", title: "Pensativo", message: "Vamos pensar juntos?", use: "Uma dica" },
  { id: "encorajador", title: "Encorajador", message: "Vamos tentar mais uma vez?", use: "Apoio para tentar novamente" },
  { id: "surpreso", title: "Surpreso", message: "Olha essa descoberta!", use: "Uma novidade" },
  { id: "concentrado", title: "Concentrado", message: "Um passo de cada vez.", use: "Momento de atenção" },
  { id: "descansando", title: "Descansando", message: "Podemos fazer uma pausa.", use: "Hora de descansar" },
];

export default function MascotsPage() {
  return <div className={styles.page}>
    <Link href="/" className={styles.back}>← Voltar à trilha</Link>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>PRÉVIA DOS PERSONAGENS</p>
      <h1>Um mascote, muitas expressões.</h1>
      <p>O mesmo amigo azul para descobrir, aprender e celebrar com você.</p>
    </header>
    <section className={styles.bodySection} aria-labelledby="body-title">
      <h2 id="body-title">Agora, de corpo inteiro</h2>
      <p className={styles.sectionDescription}>Duas primeiras poses para conhecermos nosso amigo azul.</p>
      <div className={styles.bodyGrid}>
        {[{ id: "em-pe", title: "Em pé", message: "Estou aqui com você.", use: "Pose neutra" }, { id: "acenando", title: "Acenando", message: "Olá! Vamos aprender juntos?", use: "Boas-vindas" }].map((pose) => <article key={pose.id} className={styles.card}>
          <div className={styles.portrait}><Image src={`/mascotes/corpo-${pose.id}.svg`} width={400} height={400} alt={`Mascote azul do NeuroLearn de corpo inteiro, ${pose.title.toLowerCase()}`} /></div>
          <h3 className={styles.poseTitle}>{pose.title}</h3>
          <p className={styles.message}>{pose.message}</p>
          <span className={styles.use}>{pose.use}</span>
        </article>)}
      </div>
    </section>
    <h2 className={styles.expressionsTitle}>Nossas expressões</h2>
    <div className={styles.grid}>
      {expressions.map((expression) => <article key={expression.id} className={styles.card}>
        <div className={styles.portrait}><Image src={`/mascotes/${expression.id}.svg`} width={200} height={200} alt={`Mascote azul do NeuroLearn: ${expression.title.toLowerCase()}`} /></div>
        <h2>{expression.title}</h2>
        <p className={styles.message}>{expression.message}</p>
        <span className={styles.use}>{expression.use}</span>
      </article>)}
    </div>
    <p className={styles.note}>Expressões estáticas para avaliarmos o visual antes de aplicá-las nas atividades.</p>
  </div>;
}
