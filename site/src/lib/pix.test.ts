import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chavePixParaCopiar } from './pix.ts';

test('CNPJ e CPF formatados são copiados só com os dígitos', () => {
  assert.equal(chavePixParaCopiar('09.140.351/0012-25'), '09140351001225');
  assert.equal(chavePixParaCopiar(' 123.456.789-09 '), '12345678909');
});

test('outras chaves são copiadas como estão (e-mail, celular, chave aleatória)', () => {
  assert.equal(chavePixParaCopiar('secretaria@exemplo.org'), 'secretaria@exemplo.org');
  assert.equal(chavePixParaCopiar('+5583999990000'), '+5583999990000');
  assert.equal(
    chavePixParaCopiar('123e4567-e89b-12d3-a456-426614174000'),
    '123e4567-e89b-12d3-a456-426614174000',
  );
  // dígitos soltos ou formato incompleto não são mexidos
  assert.equal(chavePixParaCopiar('09.140.351/0012'), '09.140.351/0012');
});
