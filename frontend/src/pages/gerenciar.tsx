import Link from 'next/link';
import { ChevronRight, FlaskConical, MapPin } from 'lucide-react';
import Header from '../components/Header';

export default function Gerenciar() {
  return (
    <main className="page">
      <Header />
      <h1 className="page-title">Gerenciar cadastros</h1>
      <nav className="management-list" aria-label="Cadastros">
        <Link href="/propriedades" className="panel management-item">
          <MapPin size={23} aria-hidden="true" />
          <span className="management-copy">
            <h2>Propriedades</h2>
            <p>Locais e condições da sua área de cultivo.</p>
          </span>
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
        <Link href="/produtos" className="panel management-item">
          <FlaskConical size={23} aria-hidden="true" />
          <span className="management-copy">
            <h2>Produtos</h2>
            <p>Parâmetros técnicos dos produtos cadastrados.</p>
          </span>
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
      </nav>
    </main>
  );
}