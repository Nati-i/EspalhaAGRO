import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LocateFixed, MapPin } from 'lucide-react';
import Header from '../components/Header';
import { api, Propriedade } from '../lib/api';

export default function Propriedades() {
  const [propriedades, setPropriedades] = useState<Propriedade[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [localizando, setLocalizando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagemLocalizacao, setMensagemLocalizacao] = useState('');

  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  async function carregar() {
    try {
      setPropriedades(await api.listarPropriedades());
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar propriedades.');
    }
  }

  useEffect(() => { carregar(); }, []);

  function localizarPropriedade() {
    setErro('');
    setMensagemLocalizacao('');

    if (!navigator.geolocation) {
      setErro('Este navegador não oferece localização automática.');
      return;
    }

    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setMensagemLocalizacao('Localização capturada. Confira se o dispositivo está na propriedade.');
        setLocalizando(false);
      },
      (falha) => {
        const mensagem = falha.code === falha.PERMISSION_DENIED
          ? 'Permita o acesso à localização no navegador para continuar.'
          : falha.code === falha.TIMEOUT
            ? 'A localização demorou demais. Tente novamente.'
            : 'Não foi possível obter a localização deste dispositivo.';
        setErro(mensagem);
        setLocalizando(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro('');
    if (!latitude || !longitude) {
      setErro('Use a localização do dispositivo antes de cadastrar a propriedade.');
      return;
    }
    setCarregando(true);

    try {
      await api.criarPropriedade({ nome, cidade, estado, latitude: Number(latitude), longitude: Number(longitude) });
      setNome('');
      setCidade('');
      setEstado('');
      setLatitude('');
      setLongitude('');
      setMensagemLocalizacao('');
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao cadastrar propriedade.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="page">
      <Header />
      <Link href="/gerenciar" className="back-link">← Gerenciar</Link>
      <h1 className="page-title">Propriedades</h1>

      <form onSubmit={handleSubmit} className="panel form-panel">
        <h2>Cadastrar nova propriedade</h2>
        <label htmlFor="nome">Nome da propriedade</label>
        <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <label htmlFor="cidade">Cidade</label>
        <input id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
        <label htmlFor="estado">Estado (UF)</label>
        <input id="estado" value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} required />
        <div className="location-capture">
          <button className="secondary location-button" type="button" onClick={localizarPropriedade} disabled={localizando || carregando}>
            <LocateFixed size={18} aria-hidden="true" />
            {localizando ? 'Localizando...' : latitude ? 'Atualizar localização' : 'Usar localização do dispositivo'}
          </button>
          {latitude && longitude
            ? <p className="location-status" role="status"><MapPin size={16} /> Ponto definido: {latitude}, {longitude}</p>
            : <p className="form-footnote">Permita o acesso à localização e faça o cadastro próximo à propriedade.</p>}
          {mensagemLocalizacao && <p className="form-footnote">{mensagemLocalizacao}</p>}
        </div>
        {erro && <p className="field-error" role="alert">{erro}</p>}
        <button type="submit" disabled={carregando}>{carregando ? 'Salvando...' : 'Cadastrar'}</button>
      </form>

      <h2 className="section-title">Propriedades cadastradas</h2>
      {propriedades.length === 0 && <p>Nenhuma propriedade cadastrada ainda.</p>}
      <div className="record-list">
        {propriedades.map((propriedade) => (
          <article key={propriedade.id} className="panel record">
            <MapPin className="record-icon" size={21} aria-hidden="true" />
            <div className="record-content">
              <strong>{propriedade.nome}</strong>
              <p className="record-detail">{propriedade.cidade}/{propriedade.estado}</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
