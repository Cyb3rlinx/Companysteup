'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="error-page"><h1>No pudimos cargar este espacio</h1><p>Tus datos guardados no se modificaron. Intenta nuevamente.</p><button className="btn" onClick={reset}>Volver a intentar</button><Link href="/">Ir al inicio</Link></main>;}
