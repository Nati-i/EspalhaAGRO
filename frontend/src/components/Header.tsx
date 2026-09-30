import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-badge" aria-label="EspalhaAgro, Inteligência e Condições de Aplicação">
        <span className="brand-mark"><Leaf size={22} aria-hidden="true" /></span>
        <span className="brand-name">EspalhaAgro</span>
        <span className="brand-divider" aria-hidden="true">|</span>
        <span className="brand-descriptor">Inteligência &amp; Condições de Aplicação</span>
      </Link>
      <span className="brand-pulse"><span /> AGROPULSE</span>
    </header>
  );
}