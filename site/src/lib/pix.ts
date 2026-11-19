/**
 * O que o botão "Copiar chave" põe na área de transferência. CPF e CNPJ aparecem formatados na
 * tela ("09.140.351/0012-25"), como a paróquia os imprime, mas o campo de chave Pix dos aplicativos
 * de banco quer só os dígitos. Qualquer outra chave (e-mail, celular, chave aleatória) vai como está.
 */
const CPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const CNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export function chavePixParaCopiar(chave: string): string {
  const limpa = chave.trim();
  return CPF.test(limpa) || CNPJ.test(limpa) ? limpa.replace(/\D/g, '') : limpa;
}
