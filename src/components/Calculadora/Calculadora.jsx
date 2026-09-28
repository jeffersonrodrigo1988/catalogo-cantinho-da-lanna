import { useState } from 'react';
import './Calculadora.css';

export function Calculadora({ onUsarValor }) {
  const [display, setDisplay] = useState('0');
  const [expressao, setExpressao] = useState('');
  const [operacao, setOperacao] = useState(null);
  const [valorAnterior, setValorAnterior] = useState(null);
  const [novoNumero, setNovoNumero] = useState(false);

  function handleNumero(n) {
    if (novoNumero || display === '0') {
      setDisplay(String(n));
      setNovoNumero(false);
    } else {
      setDisplay(display + n);
    }
  }

  function handlePonto() {
    if (novoNumero) {
      setDisplay('0.');
      setNovoNumero(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }

  function handleOperacao(op) {
    const valorAtual = parseFloat(display);

    if (valorAnterior !== null && operacao && !novoNumero) {
      const resultado = calcular(valorAnterior, valorAtual, operacao);
      setDisplay(String(resultado));
      setValorAnterior(resultado);
    } else {
      setValorAnterior(valorAtual);
    }

    setOperacao(op);
    setNovoNumero(true);

    const simbolos = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    setExpressao(`${valorAnterior !== null && operacao && !novoNumero
      ? calcular(valorAnterior, valorAtual, operacao)
      : valorAtual} ${simbolos[op]}`);
  }

  function calcular(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b === 0 ? 0 : a / b;
      default: return b;
    }
  }

  function handleIgual() {
    if (valorAnterior === null || !operacao) return;

    const valorAtual = parseFloat(display);
    const resultado = calcular(valorAnterior, valorAtual, operacao);

    const simbolos = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    setExpressao(
      `${valorAnterior} ${simbolos[operacao]} ${valorAtual} =`
    );
    setDisplay(String(resultado));
    setValorAnterior(null);
    setOperacao(null);
    setNovoNumero(true);
  }

  function handleLimpar() {
    setDisplay('0');
    setExpressao('');
    setOperacao(null);
    setValorAnterior(null);
    setNovoNumero(false);
  }

  function handleApagar() {
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }

  function handlePorcento() {
    const valor = parseFloat(display);
    if (valorAnterior !== null) {
      // Porcentagem do valor anterior
      const resultado = (valorAnterior * valor) / 100;
      setDisplay(String(resultado));
    } else {
      setDisplay(String(valor / 100));
    }
  }

  function handleInverterSinal() {
    if (display === '0') return;
    if (display.startsWith('-')) {
      setDisplay(display.slice(1));
    } else {
      setDisplay('-' + display);
    }
  }

  function handleUsarValor() {
    if (onUsarValor) {
      onUsarValor(parseFloat(display));
    }
  }

  return (
    <div className="calculadora">
      <div className="calc-display">
        <div className="calc-expressao">{expressao || '\u00A0'}</div>
        <div className="calc-valor">{display}</div>
      </div>

      <div className="calc-grid">
        <button className="calc-btn calc-funcao" onClick={handleLimpar}>C</button>
        <button className="calc-btn calc-funcao" onClick={handleApagar}>⌫</button>
        <button className="calc-btn calc-funcao" onClick={handlePorcento}>%</button>
        <button className="calc-btn calc-operacao" onClick={() => handleOperacao('/')}>÷</button>

        <button className="calc-btn" onClick={() => handleNumero(7)}>7</button>
        <button className="calc-btn" onClick={() => handleNumero(8)}>8</button>
        <button className="calc-btn" onClick={() => handleNumero(9)}>9</button>
        <button className="calc-btn calc-operacao" onClick={() => handleOperacao('*')}>×</button>

        <button className="calc-btn" onClick={() => handleNumero(4)}>4</button>
        <button className="calc-btn" onClick={() => handleNumero(5)}>5</button>
        <button className="calc-btn" onClick={() => handleNumero(6)}>6</button>
        <button className="calc-btn calc-operacao" onClick={() => handleOperacao('-')}>−</button>

        <button className="calc-btn" onClick={() => handleNumero(1)}>1</button>
        <button className="calc-btn" onClick={() => handleNumero(2)}>2</button>
        <button className="calc-btn" onClick={() => handleNumero(3)}>3</button>
        <button className="calc-btn calc-operacao" onClick={() => handleOperacao('+')}>+</button>

        <button className="calc-btn" onClick={handleInverterSinal}>±</button>
        <button className="calc-btn" onClick={() => handleNumero(0)}>0</button>
        <button className="calc-btn" onClick={handlePonto}>.</button>
        <button className="calc-btn calc-igual" onClick={handleIgual}>=</button>
      </div>

      {onUsarValor && (
        <button className="calc-usar" onClick={handleUsarValor}>
          ⬇️ Usar valor ({display})
        </button>
      )}
    </div>
  );
}