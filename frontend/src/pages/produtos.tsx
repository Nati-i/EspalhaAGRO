import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, FlaskConical, Search } from 'lucide-react';
import Header from '../components/Header';
import { api, CATEGORIAS_PRODUTO } from '../lib/api';
import type { CategoriaProduto, Produto } from '../lib/api';
import { AGROFIT_URL, GUIAS_DEFENSIVOS, NOMES_CATEGORIAS } from '../lib/guias-defensivos';

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [nome, setNome] = useState('');
  const [principioAtivo, setPrincipioAtivo] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [categoria, setCategoria] = useState<CategoriaProduto>(CATEGORIAS_PRODUTO[0]);
  const [carenciaDias, setCarenciaDias] = useState('');
  const [intervaloSemChuvaHoras, setIntervaloSemChuvaHoras] = useState('');
  const [tempMinima, setTempMinima] = useState('');
  const [tempMaxima, setTempMaxima] = useState('');
  const [umidadeMinima, setUmidadeMinima] = useState('');
  const [ventoMaximo, setVentoMaximo] = useState('');
  const [sensibilidadeNebulosidade, setSensibilidadeNebulosidade] = useState(false);
  const [comoUsar, setComoUsar] = useState('');
  const [condicoesClimaInfo, setCondicoesClimaInfo] = useState('');
  const [busca, setBusca] = useState('');
  const [produtoAtivo, setProdutoAtivo] = useState('');

  async function carregar() {
    try {
      setProdutos(await api.listarProdutos());
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar produtos.');
    } finally {
      setCarregandoLista(false);
    }
  }

  useEffect(() => { void carregar(); }, []);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      const criado = await api.criarProduto({
        nome: nome.trim(),
        principioAtivo: principioAtivo.trim(),
        fabricante: fabricante.trim(),
        categoria,
        carenciaDias: Number(carenciaDias),
        intervaloSemChuvaHoras: Number(intervaloSemChuvaHoras),
        tempMinima: tempMinima === '' ? null : Number(tempMinima),
        tempMaxima: tempMaxima === '' ? null : Number(tempMaxima),
        umidadeMinima: umidadeMinima === '' ? null : Number(umidadeMinima),
        ventoMaximo: ventoMaximo === '' ? null : Number(ventoMaximo),
        sensibilidadeNebulosidade,
        comoUsar: comoUsar.trim() || null,
        condicoesClimaInfo: condicoesClimaInfo.trim() || null,
      });
      setProdutos((atuais) => [criado, ...atuais]);
      setProdutoAtivo(criado.id);
      setBusca('');
      setNome('');
      setPrincipioAtivo('');
      setFabricante('');
      setCarenciaDias('');
      setIntervaloSemChuvaHoras('');
      setTempMinima('');
      setTempMaxima('');
      setUmidadeMinima('');
      setVentoMaximo('');
      setSensibilidadeNebulosidade(false);
      setComoUsar('');
      setCondicoesClimaInfo('');
      setSucesso('Defensivo adicionado à sua biblioteca.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao cadastrar produto.');
    } finally {
      setCarregando(false);
    }
  }

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR')),
  );
  const selecionado = produtosFiltrados.find((produto) => produto.id === produtoAtivo);

  return (
    <main className="dashboard product-library-page">
      <Header />
      <Link href="/" className="back-link">← Clima de hoje</Link>
      <div className="library-heading">
        <p className="eyebrow dark">BIBLIOTECA DE PRODUTOS</p>
        <h1>Defensivos da propriedade</h1>
        <p>Cadastre somente o nome e a categoria. Parâmetros numéricos não serão presumidos.</p>
      </div>

      <div className="library-layout">
        <form onSubmit={handleSubmit} className="panel form-panel product-form">
          <h2>Adicionar defensivo</h2>
          <label htmlFor="nome">Nome informado na embalagem</label>
          <input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome comercial do produto" required />
          <label htmlFor="principio-ativo">Princípio ativo</label>
          <input id="principio-ativo" value={principioAtivo} onChange={(e) => setPrincipioAtivo(e.target.value)} required />
          <label htmlFor="fabricante">Fabricante</label>
          <input id="fabricante" value={fabricante} onChange={(e) => setFabricante(e.target.value)} required />
          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaProduto)}>
            {CATEGORIAS_PRODUTO.map((item) => <option key={item} value={item}>{NOMES_CATEGORIAS[item]}</option>)}
          </select>
          <div className="form-field-grid">
            <div><label htmlFor="carencia-dias">Carência (dias)</label><input id="carencia-dias" type="number" min="0" step="1" value={carenciaDias} onChange={(e) => setCarenciaDias(e.target.value)} required /></div>
            <div><label htmlFor="intervalo-chuva">Intervalo sem chuva (h)</label><input id="intervalo-chuva" type="number" min="0" step="0.5" value={intervaloSemChuvaHoras} onChange={(e) => setIntervaloSemChuvaHoras(e.target.value)} required /></div>
            <div><label htmlFor="temp-minima">Temperatura mínima (°C)</label><input id="temp-minima" type="number" step="0.1" value={tempMinima} onChange={(e) => setTempMinima(e.target.value)} /></div>
            <div><label htmlFor="temp-maxima">Temperatura máxima (°C)</label><input id="temp-maxima" type="number" step="0.1" value={tempMaxima} onChange={(e) => setTempMaxima(e.target.value)} /></div>
            <div><label htmlFor="umidade-minima">Umidade mínima (%)</label><input id="umidade-minima" type="number" min="0" max="100" step="1" value={umidadeMinima} onChange={(e) => setUmidadeMinima(e.target.value)} /></div>
            <div><label htmlFor="vento-maximo">Vento máximo (km/h)</label><input id="vento-maximo" type="number" min="0" step="0.1" value={ventoMaximo} onChange={(e) => setVentoMaximo(e.target.value)} /></div>
          </div>
          <label className="check-label"><input type="checkbox" checked={sensibilidadeNebulosidade} onChange={(e) => setSensibilidadeNebulosidade(e.target.checked)} />Sensível à nebulosidade</label>
          <label htmlFor="como-usar">Instruções de aplicação</label>
          <textarea id="como-usar" rows={3} value={comoUsar} onChange={(e) => setComoUsar(e.target.value)} placeholder="Conforme a bula aprovada" />
          <label htmlFor="condicoes-clima">Recomendações climáticas da bula</label>
          <textarea id="condicoes-clima" rows={3} value={condicoesClimaInfo} onChange={(e) => setCondicoesClimaInfo(e.target.value)} placeholder="Registre apenas condições confirmadas na bula" />
          {erro && <p className="field-error" role="alert">{erro}</p>}
          {sucesso && <p className="success-message" role="status">{sucesso}</p>}
          <button type="submit" disabled={carregando}>{carregando ? 'Salvando...' : 'Adicionar à biblioteca'}</button>
          <p className="form-footnote">A categoria gera apenas um resumo geral. Consulte a bula registrada para instruções específicas.</p>
        </form>

        <section className="library-list" aria-labelledby="library-list-title">
          <div className="library-list-heading">
            <h2 id="library-list-title">Produtos cadastrados <span>{produtos.length}</span></h2>
            <label className="search-box" htmlFor="buscar-produto">
              <Search size={18} aria-hidden="true" />
              <input id="buscar-produto" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pelo nome" />
            </label>
          </div>
          {carregandoLista && <div className="panel loading-state">Carregando biblioteca...</div>}
          {!carregandoLista && produtos.length === 0 && !erro && <p className="empty-list">Ainda não há defensivos cadastrados.</p>}
          <div className="library-product-list">
            {produtosFiltrados.map((produto) => (
              <button key={produto.id} type="button" className={produto.id === selecionado?.id ? 'product-result selected' : 'product-result'} onClick={() => setProdutoAtivo(produto.id)}>
                <span className="product-result-icon"><FlaskConical size={19} /></span>
                <span className="product-result-copy"><strong>{produto.nome}</strong><small>{NOMES_CATEGORIAS[produto.categoria]}</small></span>
                <span aria-hidden="true">›</span>
              </button>
            ))}
          </div>
          {!carregandoLista && produtos.length > 0 && produtosFiltrados.length === 0 && <p className="no-results">Nenhum defensivo corresponde à busca.</p>}
          {selecionado && (
            <article className="virtual-leaflet library-leaflet">
              <div className="leaflet-heading">
                <span className="leaflet-category">{NOMES_CATEGORIAS[selecionado.categoria]}</span>
                <h3>{selecionado.nome}</h3>
                <p><AlertTriangle size={15} /> Resumo geral da categoria; não é a bula específica deste produto.</p>
              </div>
              <div className="guide-grid">
                <section><h4>Indicação</h4><p>{GUIAS_DEFENSIVOS[selecionado.categoria].indicacao}</p></section>
                <section><h4>Período de uso</h4><p>{GUIAS_DEFENSIVOS[selecionado.categoria].periodo}</p></section>
                <section><h4>Cuidados</h4><p>{GUIAS_DEFENSIVOS[selecionado.categoria].cuidados}</p></section>
              </div>
              <a className="agrofit-link" href={AGROFIT_URL} target="_blank" rel="noreferrer">Consultar registro e bula no Agrofit ↗</a>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
