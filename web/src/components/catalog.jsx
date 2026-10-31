import { categories, servicePath } from '@/lib/catalog';

export function CatalogImage({ image }) {
  return <img src={`/assets/img/${image}-640.webp`} srcSet={`/assets/img/${image}-640.webp 640w, /assets/img/${image}-1024.webp 1024w`} sizes="(min-width: 768px) 33vw, 100vw" width="1024" height="1024" loading="lazy" decoding="async" alt="Ambiente de cuidado y bienestar" />;
}

export function Catalog() {
  return <section className="catalog-section" aria-labelledby="catalog-title">
    <div className="page-container">
      <div className="section-heading"><h2 id="catalog-title">Encuentra tu tratamiento</h2><p>Explora nuestras categorías y conoce las opciones que puedes consultar en tu valoración.</p></div>
      <nav className="catalog-nav" aria-label="Categorías de tratamientos">{categories.map(category => <a key={category.id} href={`#categoria-${category.id}`}>{category.title}</a>)}</nav>
      <div className="catalog-grid">{categories.map(category => <article className="catalog-card" id={`categoria-${category.id}`} key={category.id}>
        <div className="catalog-image"><CatalogImage image={category.image} /></div>
        <div className="catalog-card-content"><h3>{category.title}</h3><p>{category.description}</p><ul>{category.services.map(service => <li key={service.slug}><a href={servicePath(service)}>{service.title}</a></li>)}</ul></div>
      </article>)}</div>
      <p className="catalog-note">Los tratamientos se definen en una valoración personal. Consulta la disponibilidad actual de paquetes y promociones.</p>
    </div>
  </section>;
}
