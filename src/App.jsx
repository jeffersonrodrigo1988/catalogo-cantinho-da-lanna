import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Produtos } from './pages/Produtos/Produtos';
import { Sobre } from './pages/Sobre/Sobre';
import { Contato } from './pages/Contato/Contato';
import { ProductDetail } from './pages/ProductDetail/ProductDetail';
import { Admin } from './pages/Admin/Admin';
import { WhatsAppFloat } from './components/WhatsAppFloat/WhatsAppFloat';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/produto/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      <WhatsAppFloat />
    </HashRouter>
  );
}

export default App;