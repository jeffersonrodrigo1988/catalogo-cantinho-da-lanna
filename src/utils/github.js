const GITHUB_USER = 'jeffersonrodrigo1988';
const GITHUB_REPO = 'catalogo-cantinho-da-lanna';
const GITHUB_FILE = 'produtos.json';

export async function carregarProdutosDoGithub() {
  const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_FILE}?_=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}