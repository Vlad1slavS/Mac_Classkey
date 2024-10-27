import React from "react";

export default function CoverageTable({ coverageTable }) {
  // Проверяем, что объект coverageTable не пустой и содержит необходимые данные
  if (!coverageTable || !coverageTable.headers || !coverageTable.terms) {
    return null;
  }

  const { headers, terms } = coverageTable;

  // Функция для генерации данных таблицы
  const createTableData = () => {
    return terms.map((term) => {
      // Битовая маска для текущего термина
      return headers.map((header) => (term.terms.includes(header) ? "x" : "-"));
    });
  };

  // Получаем данные таблицы
  const tableData = createTableData();

  return (
    <table border="1">
      <thead>
        <tr>
          {/* Заголовок для идентификации строк (например, термины) */}
          <th className="pr-6">Minterms</th>
          {/* Отображение заголовков таблицы из headers */}
          {headers.map((header, index) => (
            <th key={index} className="pr-6">
              {parseInt(header, 2)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {terms.map((term, rowIndex) => (
          <tr key={rowIndex}>
            <td className="pr-6">{term.terms.join(", ")}</td>
            {/* Отображаем "x" для каждого заголовка, который покрывается */}
            {tableData[rowIndex].map((cell, cellIndex) => (
              <td key={cellIndex} className="pr-6">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
