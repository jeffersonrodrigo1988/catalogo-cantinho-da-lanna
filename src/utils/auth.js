import bcrypt from 'bcryptjs';

/**
 * Compara uma senha digitada com um hash bcrypt.
 * Retorna true se bater, false se não.
 */
export function verificarSenha(senhaDigitada, hash) {
  try {
    return bcrypt.compareSync(senhaDigitada, hash);
  } catch (err) {
    console.error('Erro ao verificar senha:', err);
    return false;
  }
}