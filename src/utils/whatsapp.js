import { WHATSAPP_NUMBER } from '../config';

export function abrirWhatsApp(mensagem) {
  const texto = encodeURIComponent(mensagem);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`;
  window.open(url, '_blank');
}

export function mensagemProduto(product, quantity = 1) {
  const qtdLinha = quantity > 1 ? `Quantidade: ${quantity}\n` : '';

  return (
    `Olá! Vim pelo catálogo online do Cantinho da Lanna 💕\n\n` +
    `🛍️ *${product.name}*\n` +
    `Categoria: ${product.category}\n` +
    qtdLinha +
    `\nGostaria de saber o valor e fazer o pedido! 😊`
  );
}