import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleX, Cloud, CloudRain, Droplets, FlaskConical, Loader2, LocateFixed, MapPin, Moon, Search, Sun, Thermometer, Wind } from 'lucide-react';
import Header from '../components/Header';
import { api, CATEGORIAS_PRODUTO } from '../lib/api';
import type { CategoriaProduto, ClimaAtual, ConsultaResultado, Produto } from '../lib/api';
import { AGROFIT_URL, GUIAS_DEFENSIVOS, NOMES_CATEGORIAS } from '../lib/guias-defensivos';

type FiltroCategoria = 'TODOS' | CategoriaProduto;
type EstadoLocalizacao = 'solicitando' | 'pronta' | 'negada' | 'indisponivel' | 'erro';
type OrigemLocalizacao = 'gps' | 'fallback' | 'manual';

const LOCALIZACAO_FALLBACK = { latitude: -26.7231, longitude: -53.5181 };

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [coordenadas, setCoordenadas] = useState<{ latitude: number; longitude: number } | null>(null);
  const [estadoLocalizacao, setEstadoLocalizacao] = useState<EstadoLocalizacao>('solicitando');
  const [origemLocalizacao, setOrigemLocalizacao] = useState<OrigemLocalizacao>('gps');
  const [erroLocalizacao, setErroLocalizacao] = useState('');
  const [latitudeManual, setLatitudeManual] = useState('');
  const [longitudeManual, setLongitudeManual] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [fichaProduto, setFichaProduto] = useState<Produto | null>(null);
  const [erroFicha, setErroFicha] = useState('');
  const [avaliacao, setAvaliacao] = useState<ConsultaResultado | null>(null);
  const [avaliando, setAvaliando] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');
  const [clima, setClima] = useState<ClimaAtual | null>(null);
  const [carregandoCadastros, setCarregandoCadastros] = useState(true);
  const [carregandoClima, setCarregandoClima] = useState(false);
  const [erroProdutos, setErroProdutos] = useState('');
  const [erroClima, setErroClima] = useState('');
  const [temaNoite, setTemaNoite] = useState(false);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState<FiltroCategoria>('TODOS');

  function usarFallback(mensagem: string) {
    setCoordenadas(LOCALIZACAO_FALLBACK);
    setLatitudeManual(String(LOCALIZACAO_FALLBACK.latitude));
    setLongitudeManual(String(LOCALIZACAO_FALLBACK.longitude));
    setOrigemLocalizacao('fallback');
    setEstadoLocalizacao('pronta');
    setErroLocalizacao(mensagem);
  }

  function solicitarLocalizacao() {
    setEstadoLocalizacao('solicitando');
    setErroLocalizacao('');
    setCoordenadas(null);
    setClima(null);

    if (!navigator.geolocation) {
      usarFallback('Geolocalização indisponível. Exibindo clima de São Miguel do Oeste.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordenadas({ latitude: coords.latitude, longitude: coords.longitude });
        setLatitudeManual(coords.latitude.toFixed(6));
        setLongitudeManual(coords.longitude.toFixed(6));
        setOrigemLocalizacao('gps');
        setEstadoLocalizacao('pronta');
      },
      (erro) => {
        usarFallback(erro.code === erro.PERMISSION_DENIED
          ? 'Permissão negada. Exibindo clima de São Miguel do Oeste; você pode informar outra coordenada abaixo.'
          : erro.code === erro.TIMEOUT
            ? 'A localização demorou a responder. Exibindo clima de São Miguel do Oeste.'
            : 'Não foi possível obter a localização. Exibindo clima de São Miguel do Oeste.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }

  function aplicarCoordenadasManuais(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const latitude = Number(latitudeManual);
    const longitude = Number(longitudeManual);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setErroLocalizacao('Informe latitude entre -90 e 90 e longitude entre -180 e 180.');
      return;
    }
    setCoordenadas({ latitude, longitude });
    setOrigemLocalizacao('manual');
    setEstadoLocalizacao('pronta');
    setErroLocalizacao('');
  }

  useEffect(() => {
    let cancelada = false;

    setCarregandoCadastros(true);
    setErroProdutos('');
    api.listarProdutos(categoriaAtiva === 'TODOS' ? undefined : categoriaAtiva)
      .then((listaProdutos) => {
        if (cancelada) return;
        setProdutos(listaProdutos);
        setProdutoId(listaProdutos[0]?.id ?? '');
      })
      .catch((e: unknown) => {
        if (!cancelada) setErroProdutos(e instanceof Error ? e.message : 'Erro ao carregar defensivos.');
      })
      .finally(() => {
        if (!cancelada) setCarregandoCadastros(false);
      });

    return () => { cancelada = true; };
  }, [categoriaAtiva]);

  useEffect(() => {
    solicitarLocalizacao();
  }, []);

  useEffect(() => {
    if (!produtoId) {
      setFichaProduto(null);
      setErroFicha('');
      return;
    }
    let cancelada = false;
    setErroFicha('');
    api.detalhesProduto(produtoId)
      .then((produto) => { if (!cancelada) setFichaProduto(produto); })
      .catch((e: unknown) => {
        if (!cancelada) setErroFicha(e instanceof Error ? e.message : 'Não foi possível carregar a ficha.');
      });
    return () => { cancelada = true; };
  }, [produtoId]);

  useEffect(() => {
    if (!coordenadas) {
      setClima(null);
      return;
    }
    let cancelada = false;

    setClima(null);
    const atualizarClima = async () => {
      setCarregandoClima(true);
      try {
        const dados = await api.climaPorCoordenadas(coordenadas.latitude, coordenadas.longitude);
        if (cancelada) return;
        setClima(dados);
        setErroClima('');
        setAtualizadoEm(new Date());
        const agoraUnix = Date.now() / 1000;
        const noite = agoraUnix < dados.nascerDoSol || agoraUnix >= dados.porDoSol;
        setTemaNoite(noite);
        document.body.classList.toggle('tema-noite', noite);
        document.body.classList.toggle('tema-dia', !noite);
      } catch (e) {
        if (!cancelada) setErroClima(e instanceof Error ? e.message : 'Erro ao consultar o clima.');
      } finally {
        if (!cancelada) setCarregandoClima(false);
      }
    };

    void atualizarClima();
    const intervalo = window.setInterval(() => { void atualizarClima(); }, 10 * 60 * 1000);

    return () => {
      cancelada = true;
      window.clearInterval(intervalo);
      document.body.classList.remove('tema-dia', 'tema-noite');
    };
  }, [coordenadas]);

  const produtosFiltrados = produtos.filter((produto) => {
    const correspondeCategoria = categoriaAtiva === 'TODOS' || produto.categoria === categoriaAtiva;
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return correspondeCategoria && produto.nome.toLocaleLowerCase('pt-BR').includes(termo);
  });
  const produtoSelecionado = produtosFiltrados.find((item) => item.id === produtoId);
  const IconeClima = temaNoite
    ? Moon
    : clima && clima.chuvaPrevistaH <= 2
    ? CloudRain
    : clima?.nublado ? Cloud : Sun;

  async function avaliarCondicao() {
    if (!produtoSelecionado || !coordenadas || !clima) return;
    setAvaliando(true);
    setErroAvaliacao('');
    setAvaliacao(null);
    try {
      setAvaliacao(await api.consultar({
        produtoId: produtoSelecionado.id,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
        temperatura: clima.temperaturaC,
        umidade: clima.umidadePct,
        vento: clima.ventoKmh,
        chuvaPrevista: clima.chuvaPrevistaH,
        nublado: clima.nublado,
      }));
    } catch (e) {
      setErroAvaliacao(e instanceof Error ? e.message : 'Não foi possível avaliar estas condições.');
    } finally {
      setAvaliando(false);
    }
  }

  const iconeAvaliacao = avaliacao?.statusRecomendacao === 'COMPATIVEL'
    ? CheckCircle2
    : avaliacao?.statusRecomendacao === 'ATENCAO' ? AlertTriangle : CircleX;

  return (
    <main className="dashboard">
      <Header />
      <section className="weather-card" aria-labelledby="weather-title">
        <div className="weather-topline">
          <div>
            <p className="eyebrow">ESPALHAAGRO · AGORA</p>
            <h1 id="weather-title">Clima na propriedade</h1>
          </div>
          <span className="weather-location-status"><MapPin size={16} aria-hidden="true" />
            {estadoLocalizacao === 'solicitando' ? 'Localizando...' : origemLocalizacao === 'gps' ? 'GPS ativo' : origemLocalizacao === 'manual' ? 'Coordenada manual' : 'Localização de teste'}
          </span>
        </div>

        {estadoLocalizacao === 'solicitando' && <div className="weather-message"><Loader2 className="spinner" size={25} />Obtendo localização...</div>}
        {erroLocalizacao && estadoLocalizacao === 'pronta' && <p className="location-fallback-note" role="status">{erroLocalizacao}</p>}
        <details className="manual-location">
          <summary><LocateFixed size={16} /> Alterar cidade ou coordenadas</summary>
          <form onSubmit={aplicarCoordenadasManuais}>
            <label htmlFor="latitude-manual">Latitude</label>
            <input id="latitude-manual" type="number" min="-90" max="90" step="any" value={latitudeManual} onChange={(e) => setLatitudeManual(e.target.value)} required />
            <label htmlFor="longitude-manual">Longitude</label>
            <input id="longitude-manual" type="number" min="-180" max="180" step="any" value={longitudeManual} onChange={(e) => setLongitudeManual(e.target.value)} required />
            <button type="submit">Usar estas coordenadas</button>
            <button className="secondary" type="button" onClick={solicitarLocalizacao}>Tentar GPS novamente</button>
            {erroLocalizacao && <p className="field-error" role="alert">{erroLocalizacao}</p>}
          </form>
        </details>
        {carregandoClima && <div className="weather-message"><Loader2 className="spinner" size={25} />Atualizando as condições...</div>}
        {erroClima && <p className="weather-error" role="alert">{erroClima}</p>}
        {clima && (
          <>
            <div className="weather-main" aria-live="polite">
              <IconeClima className="weather-symbol" aria-hidden="true" />
              <div className="temperature-block">
                <p className="location-name">Sua localização atual</p>
                <p className="temperature">{Math.round(clima.temperaturaC)}°</p>
                <p className="weather-condition">{clima.nublado ? 'Céu nublado' : 'Céu aberto'}</p>
              </div>
              <div className="weather-summary">
                <span>HOJE</span>
                <p>{clima.chuvaPrevistaH >= 24 ? 'Sem chuva prevista nas próximas 24h' : `Próxima chuva em cerca de ${clima.chuvaPrevistaH}h`}</p>
                <small>{atualizadoEm ? `Atualizado às ${atualizadoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Dados meteorológicos Open-Meteo'}</small>
              </div>
            </div>
            <div className="weather-metrics">
              <div className="weather-metric"><Wind size={19} /><span>Vento</span><strong>{clima.ventoKmh} km/h</strong></div>
              <div className="weather-metric"><Thermometer size={19} /><span>Temperatura</span><strong>{clima.temperaturaC}°C</strong></div>
              <div className="weather-metric"><Droplets size={19} /><span>Umidade</span><strong>{clima.umidadePct}%</strong></div>
              <div className="weather-metric"><CloudRain size={19} /><span>Chuva</span><strong>{clima.chuvaPrevistaH >= 24 ? 'Em 24h+' : `Em ${clima.chuvaPrevistaH}h`}</strong></div>
            </div>
          </>
        )}
      </section>

      <section className="defensives-section" aria-labelledby="defensives-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">BIBLIOTECA DE PRODUTOS</p>
            <h2 id="defensives-title"><FlaskConical size={23} /> Biblioteca de defensivos</h2>
            <p>Produtos disponíveis para consulta. Filtre por categoria e abra a ficha técnica.</p>
          </div>
        </div>

        <div className="catalog-toolbar">
          <label className="search-box" htmlFor="buscar-defensivo">
            <Search size={19} aria-hidden="true" />
            <input id="buscar-defensivo" type="search" value={busca} onChange={(e) => {
              setBusca(e.target.value);
              setAvaliacao(null);
            }} placeholder="Buscar defensivo pelo nome" />
          </label>
          <div className="product-selectors">
            <label htmlFor="categoria-defensivo">Categoria
              <select id="categoria-defensivo" value={categoriaAtiva} onChange={(e) => {
                const categoria = e.target.value as FiltroCategoria;
                setCategoriaAtiva(categoria);
                setAvaliacao(null);
                setBusca('');
                setProdutoId('');
              }}>
                <option value="TODOS">Todas as categorias</option>
                {CATEGORIAS_PRODUTO.map((categoria) => <option key={categoria} value={categoria}>{NOMES_CATEGORIAS[categoria]}</option>)}
              </select>
            </label>
            <label htmlFor="produto-defensivo">Produto
              <select id="produto-defensivo" value={produtosFiltrados.some((produto) => produto.id === produtoId) ? produtoId : ''} onChange={(e) => {
                setProdutoId(e.target.value);
                setAvaliacao(null);
              }} disabled={produtosFiltrados.length === 0}>
                <option value="">{produtosFiltrados.length ? 'Selecione um produto' : 'Nenhum produto nesta categoria'}</option>
                {produtosFiltrados.map((produto) => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}
              </select>
            </label>
          </div>
        </div>

        {erroProdutos && <p className="field-error" role="alert">Não foi possível carregar a biblioteca: {erroProdutos}</p>}
        {carregandoCadastros && <div className="panel loading-state"><Loader2 className="spinner" size={25} />Carregando defensivos...</div>}
        {!carregandoCadastros && produtos.length === 0 && !erroProdutos && (
          <div className="empty-catalog">
            <FlaskConical size={27} />
            <h3>Nenhum produto encontrado</h3>
            <p>A API respondeu sem produtos nesta consulta. Confira se o seed foi executado e se o backend está conectado ao banco esperado.</p>
          </div>
        )}
        {!carregandoCadastros && produtos.length > 0 && (
          <div className="catalog-layout">
            <div className="product-results" aria-label="Produtos encontrados">
              {produtosFiltrados.map((produto) => (
                <button key={produto.id} type="button" className={produto.id === produtoSelecionado?.id ? 'product-result selected' : 'product-result'} onClick={() => {
                  setProdutoId(produto.id);
                  setAvaliacao(null);
                }}>
                  <span className="product-result-icon"><FlaskConical size={19} /></span>
                  <span className="product-result-copy"><strong>{produto.nome}</strong><small>{NOMES_CATEGORIAS[produto.categoria]}</small></span>
                  <span aria-hidden="true">›</span>
                </button>
              ))}
              {produtosFiltrados.length === 0 && <p className="no-results">Nenhum produto nesta categoria ou busca.</p>}
            </div>
            {produtoSelecionado && (
              <article className="virtual-leaflet">
                <div className="leaflet-heading">
                  <span className="leaflet-category">{NOMES_CATEGORIAS[produtoSelecionado.categoria]}</span>
                  <h3>{produtoSelecionado.nome}</h3>
                  <p className="active-ingredient">{(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).principioAtivo} · {(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).fabricante}</p>
                  <p><AlertTriangle size={15} /> Resumo geral da categoria. Confirme sempre a bula deste produto.</p>
                </div>
                <div className="product-technical-grid">
                  <div><span>Carência</span><strong>{(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).carenciaDias} dias</strong></div>
                  <div><span>Sem chuva</span><strong>{(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).intervaloSemChuvaHoras} h</strong></div>
                  <div><span>Temperatura</span><strong>{(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).tempMinima ?? '—'} a {(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).tempMaxima ?? '—'} °C</strong></div>
                  <div><span>Umidade mínima</span><strong>{(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).umidadeMinima == null ? '—' : `${(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).umidadeMinima}%`}</strong></div>
                  <div><span>Vento máximo</span><strong>{(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).ventoMaximo == null ? '—' : `${(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).ventoMaximo} km/h`}</strong></div>
                  <div><span>Nebulosidade</span><strong>{(fichaProduto?.id === produtoSelecionado.id ? fichaProduto : produtoSelecionado).sensibilidadeNebulosidade ? 'Sensível' : 'Sem limite cadastrado'}</strong></div>
                </div>
                {erroFicha && <p className="field-error" role="alert">{erroFicha}</p>}
                {fichaProduto?.id === produtoSelecionado.id && (
                  <div className="product-copy-details">
                    <section><h4>Instruções de aplicação</h4><p>{fichaProduto.comoUsar || 'Não informado na ficha cadastrada.'}</p></section>
                    <section><h4>Recomendações climáticas</h4><p>{fichaProduto.condicoesClimaInfo || 'Consulte os limites técnicos acima e a bula aprovada.'}</p></section>
                  </div>
                )}
                <div className="guide-grid">
                  <section><h4>Indicação</h4><p>{GUIAS_DEFENSIVOS[produtoSelecionado.categoria].indicacao}</p></section>
                  <section><h4>Período de uso</h4><p>{GUIAS_DEFENSIVOS[produtoSelecionado.categoria].periodo}</p></section>
                  <section><h4>Cuidados</h4><p>{GUIAS_DEFENSIVOS[produtoSelecionado.categoria].cuidados}</p></section>
                </div>
                <a className="agrofit-link" href={AGROFIT_URL} target="_blank" rel="noreferrer">Consultar registro e bula no Agrofit ↗</a>
                <button className="evaluate-button" type="button" onClick={avaliarCondicao} disabled={!clima || !coordenadas || avaliando}>
                  {avaliando ? 'Avaliando clima...' : 'Avaliar Condição de Aplicação'}
                </button>
                {erroAvaliacao && <p className="field-error" role="alert">{erroAvaliacao}</p>}
                {avaliacao && (
                  <div className={`assessment-result ${avaliacao.statusRecomendacao.toLowerCase()}`} role="status" aria-live="polite">
                    {(() => {
                      const Icone = iconeAvaliacao;
                      return <Icone size={25} aria-hidden="true" />;
                    })()}
                    <div>
                      <strong>{avaliacao.statusRecomendacao === 'COMPATIVEL' ? 'CONDIÇÕES COMPATÍVEIS' : avaliacao.statusRecomendacao === 'ATENCAO' ? 'ATENÇÃO' : 'NÃO RECOMENDADO'}</strong>
                      <p>{avaliacao.motivo}</p>
                    </div>
                  </div>
                )}
              </article>
            )}
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <div className="footer-brand"><span className="footer-brand-mark"><FlaskConical size={18} /></span><strong>EspalhaAgro <span>AgroPulse</span></strong></div>
        <p>Clima via Open-Meteo. Confira a bula aprovada e o receituário agronômico antes de qualquer aplicação.</p>
        <small>Inteligência &amp; Condições de Aplicação</small>
      </footer>
    </main>
  );
}
