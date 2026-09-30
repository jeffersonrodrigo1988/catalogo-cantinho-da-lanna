use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
struct GithubContent {
    content: String,
    sha: String,
}

#[derive(Debug, Serialize)]
struct GithubPutBody {
    message: String,
    content: String,
    sha: Option<String>,
}

const GITHUB_USER: &str = "jeffersonrodrigo1988";
const GITHUB_REPO: &str = "catalogo-cantinho-da-lanna";
const GITHUB_FILE_PATH: &str = "produtos.json";

fn get_token() -> String {
    std::env::var("VITE_GITHUB_TOKEN").unwrap_or_else(|_| {
        eprintln!("⚠️  VITE_GITHUB_TOKEN não configurado no arquivo .env");
        String::new()
    })
}

/// 🔓 CARREGAR - lê direto da URL pública (SEM token)
#[tauri::command]
async fn carregar_produtos_github() -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!(
        "https://raw.githubusercontent.com/{}/{}/main/{}?t={}",
        GITHUB_USER,
        GITHUB_REPO,
        GITHUB_FILE_PATH,
        chrono::Local::now().timestamp()
    );

    let res = client
        .get(&url)
        .header("User-Agent", "Tauri-App")
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    if res.status().is_success() {
        let texto = res
            .text()
            .await
            .map_err(|e| format!("Erro ao ler texto: {}", e))?;
        Ok(texto)
    } else if res.status() == reqwest::StatusCode::NOT_FOUND {
        Ok("[]".to_string())
    } else {
        let status = res.status();
        Err(format!("Erro do GitHub ({})", status))
    }
}

/// 🔐 SALVAR - usa a API do GitHub (COM token)
#[tauri::command]
async fn salvar_produtos_github(produtos_json: String) -> Result<String, String> {
    let token = get_token();
    if token.is_empty() {
        return Err("Token não configurado no arquivo .env".to_string());
    }

    let client = reqwest::Client::new();
    let url = format!(
        "https://api.github.com/repos/{}/{}/contents/{}",
        GITHUB_USER, GITHUB_REPO, GITHUB_FILE_PATH
    );

    let mut sha_atual: Option<String> = None;
    let res_get = client
        .get(&url)
        .header("User-Agent", "Tauri-App")
        .header("Authorization", format!("token {}", token))
        .send()
        .await;

    if let Ok(response) = res_get {
        if response.status().is_success() {
            if let Ok(content) = response.json::<GithubContent>().await {
                sha_atual = Some(content.sha);
            }
        }
    }

    use base64::{engine::general_purpose, Engine as _};
    let content_b64 = general_purpose::STANDARD.encode(produtos_json.as_bytes());

    let body = GithubPutBody {
        message: format!(
            "Atualização do catálogo - {}",
            chrono::Local::now().format("%d/%m/%Y %H:%M")
        ),
        content: content_b64,
        sha: sha_atual,
    };

    let res_put = client
        .put(&url)
        .header("User-Agent", "Tauri-App")
        .header("Authorization", format!("token {}", token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    if res_put.status().is_success() {
        Ok("Produtos salvos no GitHub com sucesso!".to_string())
    } else {
        let status = res_put.status();
        let erro_texto = res_put.text().await.unwrap_or_default();
        Err(format!("Erro do GitHub ({}): {}", status, erro_texto))
    }
}

/// 🔐 UPLOAD de imagem (COM token)
#[tauri::command]
async fn upload_imagem_github(nome_arquivo: String, dados_base64: String) -> Result<String, String> {
    let token = get_token();
    if token.is_empty() {
        return Err("Token não configurado no arquivo .env".to_string());
    }

    let nome_limpo: String = nome_arquivo
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '.' || c == '-' || c == '_' { c } else { '_' })
        .collect();

    let timestamp = chrono::Local::now().timestamp();
    let extensao = nome_limpo.split('.').last().unwrap_or("png").to_lowercase();
    let path = format!("imagens/{}-{}.{}", timestamp, timestamp, extensao);

    let client = reqwest::Client::new();
    let url = format!(
        "https://api.github.com/repos/{}/{}/contents/{}",
        GITHUB_USER, GITHUB_REPO, path
    );

    let base64_limpo = if dados_base64.contains(",") {
        dados_base64.split(',').nth(1).unwrap_or(&dados_base64).to_string()
    } else {
        dados_base64
    };

    let body = GithubPutBody {
        message: format!("Upload de imagem - {}", chrono::Local::now().format("%d/%m/%Y %H:%M")),
        content: base64_limpo,
        sha: None,
    };

    let res = client
        .put(&url)
        .header("User-Agent", "Tauri-App")
        .header("Authorization", format!("token {}", token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    if res.status().is_success() {
        let raw_url = format!(
            "https://raw.githubusercontent.com/{}/{}/main/{}",
            GITHUB_USER, GITHUB_REPO, path
        );
        Ok(raw_url)
    } else {
        let status = res.status();
        let erro_texto = res.text().await.unwrap_or_default();
        Err(format!("Erro do GitHub ({}): {}", status, erro_texto))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = dotenvy::dotenv();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            carregar_produtos_github,
            salvar_produtos_github,
            upload_imagem_github
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}