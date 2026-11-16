//! Terms & conditions document, opened as a scrollable modal from the footer
//! and required (with explicit acceptance) in the client registration flow.

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Objeto",
    body: "Estas condiciones regulan el uso del sitio y del portal de clientes de MixGustos. Al registrarte o navegar aceptas lo que aquí se indica. El sistema de gestión interno se rige por contratos separados con el establecimiento.",
  },
  {
    title: "2. Registro de cuenta",
    body: "El registro es voluntario y gratuito. Debes proporcionar datos veraces (nombre y correo). La cuenta es personal e intransferible; eres responsable de la confidencialidad de tu contraseña y de toda actividad que ocurra con ella.",
  },
  {
    title: "3. Uso del portal de clientes",
    body: "El portal permite consultar la carta vigente, disponibilidad de platos y, cuando esté disponible, reservas y pedidos en línea. Los precios mostrados son los oficiales del día, sincronizados con el sistema del restaurante.",
  },
  {
    title: "4. Pedidos y pagos (cuando estén disponibles)",
    body: "La confirmación de un pedido genera un comprobante electrónico. Los pagos en línea se procesan a través de proveedores certificados; MixGustos no almacena datos completos de tarjetas. Las anulaciones siguen la política de consumo indicada en cada pedido.",
  },
  {
    title: "5. Protección de datos",
    body: "Tratamos tus datos conforme a la ley de protección de datos personales: solo para gestionar tu experiencia como cliente, sin cesión a terceros salvo proveedores técnicos necesarios. Puedes solicitar acceso, rectificación o eliminación escribiendo a hola@mixgustos.pe.",
  },
  {
    title: "6. Cookies",
    body: "Usamos cookies esenciales (sesión y seguridad) y, con tu consentimiento, cookies de preferencias y analítica para mejorar la experiencia en tus dispositivos. Puedes cambiar tu decisión en cualquier momento desde el aviso de privacidad del pie de página.",
  },
  {
    title: "7. Responsabilidad",
    body: "Procuramos mantener el sitio disponible y la información al día, pero no garantizamos la ausencia de errores puntuales en fotos, precios o disponibilidad. Nada limita los derechos que la ley de consumo te reconoce como consumidor.",
  },
  {
    title: "8. Cambios",
    body: "Podemos actualizar estas condiciones; la versión vigente siempre estará en esta página. Los cambios relevantes se anunciarán en el propio portal antes de entrar en vigor.",
  },
];

export default function Terms() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-sand-mut">
      <p className="text-xs text-sand-mut">Última actualización: noviembre de 2026</p>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h4 className="font-semibold text-sand-txt">{section.title}</h4>
          <p className="mt-1">{section.body}</p>
        </div>
      ))}
    </div>
  );
}
