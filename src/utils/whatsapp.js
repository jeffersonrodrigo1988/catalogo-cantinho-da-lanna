import { WHATSAPP_NUMBER } from '../config';

export function abrirWhatsApp(mensagem) {
  const texto = encodeURIComponent(mensagem);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;
  window.open(url, '_blank');
}

export function mensagemProduto(product, quantity = 1) {
  const total = (product.price * quantity).toFixed(2);
  const qtdLinha = quantity > 1 ? `Quantidade: ${quantity}\n` : '';
  const totalLinha = quantity > 1 ? `Total: R$ ${total}\n` : '';

  return (
    `Olá! Vim pelo catálogo online do Cantinho da Lanna 💕\n\n` +
    `🛍️ *${product.name}*\n` +
    `Categoria: ${product.category}\n` +
    `Preço: R$ ${product.price.toFixed(2)}\n` +
    qtdLinha +
    totalLinha +
    `\nGostaria de fazer o pedido! 😊`
  );
}