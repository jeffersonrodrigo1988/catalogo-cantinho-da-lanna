export async function carregarProdutosDoGithub() {
  const url = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/${GITHUB_FILE_PATH}?_=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}