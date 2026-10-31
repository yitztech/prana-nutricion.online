import { BookingLink } from '@/components/booking-link';
import { CatalogImage } from '@/components/catalog';
import { servicePath } from '@/lib/catalog';
import { Icon } from '@/components/icon';

export default function ServicePage({ category, service }) {
  return <div className="service-page"><a href="#contenido" className="sr-only focus:not-sr-only">Saltar al contenido</a>
    <header className="service-header"><div className="page-container"><a href="/" className="brand"><Icon name="leaf" />Prana &amp; Nutrición</a><a href={`/#categoria-${category.id}`}>Ver tratamientos</a></div></header>
    <main id="contenido" className="page-container service-detail">
      <nav aria-label="Ruta de navegación" className="service-breadcrumb"><a href="/">Inicio</a><span aria-hidden="true"> / </span><a href={`/#categoria-${category.id}`}>{category.title}</a><span aria-hidden="true"> / </span><span aria-current="page">{service.title}</span></nav>
      <div className="service-detail-grid"><div><p className="service-category">{category.title}</p><h1>{service.title}</h1><p className="service-description">{service.description}</p><p className="service-disclaimer">Cada persona es diferente. En tu valoración, el equipo te orientará sobre las opciones para ti.</p><BookingLink service={`${service.title} (${category.title})`} placement="service-detail">Consultar por WhatsApp</BookingLink><p className="service-disclaimer">El mensaje no confirma una cita; acordaremos contigo la disponibilidad.</p></div><div className="service-detail-image"><CatalogImage image={category.image} /></div></div>
      <section className="related-services" aria-labelledby="related-title"><h2 id="related-title">Más en {category.title}</h2><ul>{category.services.filter(item => item.slug !== service.slug).map(item => <li key={item.slug}><a href={servicePath(item)}>{item.title}</a></li>)}</ul><a className="back-catalog" href="/#catalog-title">Explorar todas las categorías</a></section>
    </main><footer className="service-footer"><div className="page-container"><span>Prana &amp; Nutrición · Cuautla, Morelos</span><a href="/privacidad">Aviso de privacidad</a><a href="/condiciones">Condiciones de uso</a></div></footer>
  </div>;
}
