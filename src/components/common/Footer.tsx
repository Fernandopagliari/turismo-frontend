import React from 'react';
import { Configuracion } from '../../types/tourism';

interface FooterProps {
  configuracion: Configuracion;
}

const Footer: React.FC<FooterProps> = ({ configuracion }) => {
  const redesSociales = [
    { nombre: 'Facebook', url: configuracion.direccion_facebook, icono: '📘' },
    { nombre: 'Instagram', url: configuracion.direccion_instagram, icono: '📷' },
    { nombre: 'Twitter', url: configuracion.direccion_twitter, icono: '🐦' },
    { nombre: 'YouTube', url: configuracion.direccion_youtube, icono: '📺' },
  ].filter(red => red.url);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la app */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{configuracion.titulo_app}</h3>
            <p className="text-gray-300 text-sm">{configuracion.footer_texto}</p>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            {configuracion.correo_electronico && (
              <p className="text-gray-300 text-sm mb-2">
                📧 {configuracion.correo_electronico}
              </p>
            )}
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              {redesSociales.map((red) => (
                <a
                  key={red.nombre}
                  href={red.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:scale-110 transition-transform"
                  title={red.nombre}
                >
                  {red.icono}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {configuracion.titulo_app}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;