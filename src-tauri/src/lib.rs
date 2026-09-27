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

#[tauri::command]
async fn carregar_produtos_github() -> Result<String, String> {
    let token = get_token();
    if token.is_empty() {
        return Err("Token não configurado no arquivo .env".to_string());
    }

    let client = reqwest::Client::new();
    let url = format!(
        "https://api.github.com/repos/{}/{}/contents/{}",
        GITHUB_USER, GITHUB_REPO, GITHUB_FILE_PATH
    );

    let res = client
        .get(&url)
        .header("User-Agent", "Tauri-App")
        .header("Authorization", format!("token {}", token))
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    if res.status().is_success() {
        let content: GithubContent = res
            .json()
            .await
            .map_err(|e| format!("Erro ao ler JSON: {}", e))?;

        use base64::{engine::general_purpose, Engine as _};
        let decoded = general_purpose::STANDARD
            .decode(content.content.replace('\n', ""))
            .map_err(|e| format!("Erro ao decodificar Base64: {}", e))?;

        let json_str =
            String::from_utf8(decoded).map_err(|e| format!("Erro ao converter: {}", e))?;

        Ok(json_str)
    } else if res.status() == reqwest::StatusCode::NOT_FOUND {
        Ok("[]".to_string())
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
            salvar_produtos_github,
            carregar_produtos_github
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}