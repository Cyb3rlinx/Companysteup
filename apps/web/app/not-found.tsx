import Link from 'next/link';
export default function NotFound(){return <main className="error-page"><span className="eyebrow">404 · FUERA DE RUTA</span><h1>Esta página no está aquí.</h1><p>Volvamos a tu siguiente paso.</p><Link className="btn" href="/panel">Ir a mi espacio</Link></main>;}
