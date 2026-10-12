import Image from 'next/image';
import type {ReactNode} from 'react';
import styles from './discovery.module.css';
export default function LunaMessage({children}:{children:ReactNode}){
 return <div className={styles.lunaMessage}><Image src="/mascotes/feliz.svg" width={54} height={54} alt=""/><div><strong>Luna acompanha você</strong><p>{children}</p></div></div>;
}
