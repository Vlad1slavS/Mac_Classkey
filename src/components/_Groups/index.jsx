import React from "react";

// Функция для подсчета количества единиц в двоичной строке
const countOnes = (binary) =>
  binary.split("").filter((bit) => bit === "1").length;

export default function DisplayGroupsTable({ groups }) {
  if (!groups || Object.keys(groups).length === 0) {
    return null;
  }

  const groupKeys = Object.keys(groups).map(Number).sort();

  // Собираем все значения из всех групп в один массив с информацией о количестве единиц
  const allBinaryValues = [];

  groupKeys.forEach((groupKey) => {
    groups[groupKey].forEach((binary) => {
      allBinaryValues.push({
        binary,
        onesCount: countOnes(binary),
      });
    });
  });

  // Сортировка по количеству единиц
  allBinaryValues.sort((a, b) => a.onesCount - b.onesCount);

  return (
    <table border="1">
      <thead>
        <tr>
          <th className="pr-10">№ группы</th>
          <th>Значение</th>
        </tr>
      </thead>
      <tbody>
        {allBinaryValues.map((item, index) => (
          <tr key={index}>
            <td className="pr-10">{item.onesCount}</td>{" "}
            {/* Показываем количество единиц */}
            <td>{item.binary}</td> {/* Показываем само значение из группы */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
