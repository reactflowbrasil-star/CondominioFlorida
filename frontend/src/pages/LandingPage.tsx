import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="font-bold text-lg text-blue-600">AUTOMATTIZE PRO</a>
          <div className="hidden sm:flex gap-6 text-sm">
            <a href="#inicio" className="hover:text-blue-600">Início</a>
            <a href="#contato" className="hover:text-blue-600">Contato</a>
            <Link to="/login" className="hover:text-blue-600">Entrar</Link>
          </div>
        </nav>
      </header>

      <main>
        <section id="inicio" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Gestão de contratos comerciais da AUTOMATTIZE PRO</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Gere, envie e acompanhe a assinatura dos contratos dos seus clientes, com agenda da equipe e controle financeiro integrados.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="btn-primary">Acessar o sistema</Link>
            <a href="https://wa.me/5562982834893" target="_blank" rel="noreferrer" className="btn-secondary">
              Falar no WhatsApp
            </a>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-center mb-8">Recursos do sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Contratos em minutos', desc: 'Cadastro do cliente, escolha dos serviços e contrato em PDF gerado no padrão jurídico da empresa.' },
              { title: 'Assinatura digital', desc: 'Envio por e-mail ou WhatsApp e assinatura online, com histórico de cada etapa.' },
              { title: 'Agenda e financeiro', desc: 'Agenda da equipe comercial, parcelas, entradas e relatórios financeiros em um só lugar.' },
            ].map((f) => (
              <div key={f.title} className="card">
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="contato" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Fale com a equipe</h2>
          <p className="text-gray-600 mb-6">Dúvidas sobre contratos ou acesso? Atendemos pelo WhatsApp (62) 98283-4893 e pelo e-mail automattizepro@gmail.com.</p>
          <a href="https://wa.me/5562982834893" target="_blank" rel="noreferrer" className="btn-primary">Chamar no WhatsApp</a>
        </section>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-600">
          <p className="font-bold text-gray-900">AUTOMATTIZE PRO</p>
          <p>Gestão de contratos comerciais.</p>
        </div>
      </footer>
    </div>
  );
}
