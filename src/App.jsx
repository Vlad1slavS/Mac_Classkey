import "./App.css";
import { useState } from "react";
import DisplayGroupsTable from "./components/_Groups";
import CoverageTable from "./components/_ConvTable";

export default function App() {
  const [placeholder, setPlaceholder] = useState("Введите минтермы");
  const [minterms, setMinterms] = useState(""); // Состояние для хранения введенных минтермов
  const [groups, setGroups] = useState(null);
  const [coverageTableData, setCoverageTableData] = useState(null);
  const [result, setResult] = useState(null);

  const fetchGroups = async () => {
    if (!minterms) {
      alert("Пожалуйста, введите минтермы.");
      return;
    }

    const mintermsArray = minterms
      .split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num));

    try {
      const response = await fetch("http://0.0.0.0:8000/quine-mccluskey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ minterms: mintermsArray }), // Объект с минтермами
      });

      if (!response.ok) {
        throw new Error("Ошибка при запросе к серверу");
      }

      const result = await response.json();

      setGroups(result.groups); // Устанавливаем группы из ответа
      setCoverageTableData({
        headers: result.primeImplicantsChart.headers,
        terms: result.primeImplicantsChart.terms,
      });
      setResult(result.minimizedExpression); // Устанавливаем минимизированное выражение
    } catch (error) {
      console.error("Ошибка:", error);
      alert(error.message);
    }
  };

  return (
    <>
      <div className="container mx-auto h-full w-full pt-10 pb-20 bg-[url('./assets/bg.jpg')] flex items-center justify-center">
        <div className="bg-[#cce8ea] text-center w-[1000px] mx-auto pt-10 rounded-xl pb-10">
          <h1 className="header-text text-center text-black font-semibold font-rubik text-2xl pb-4">
            Минимизация методом Куайна — Мак-Класки
          </h1>
          <h2 className="pb-10 text-center text-black font-semibold font-rubik text-xl">
            Введите информацию о функции
          </h2>
          <input
            className="input_minterms bg-[#cce8ea] mb-6 text-black focus:outline-none text-2xl py-5 text-center w-full"
            type="text"
            value={minterms}
            placeholder={placeholder}
            onChange={(e) => setMinterms(e.target.value)} // Обновляем состояние минтермов
            onFocus={() => setPlaceholder("Например: 2,3,5,6,9")}
            onBlur={() => setPlaceholder("Введите минтермы")}
          />
          <button
            className="bg-[#01696f] text-white font-semibold font-rubik text-xl py-4 w-[150px] rounded-3xl hover:bg-[#01696f]/80 transition-all 0.3s"
            onClick={fetchGroups} // При нажатии на кнопку вызываем fetchGroups
          >
            Начать!
          </button>
          {groups ? (
            <div>
              <h1 className="text-black font-semibold font-rubik text-3xl pt-10 mb-5">
                Группы по количеству единиц
              </h1>
              <div className="flex justify-center bg-lime-100 max-w-[450px] mx-auto rounded-xl border-2 border-black p-3">
                <DisplayGroupsTable groups={groups} />
              </div>
              <h1 className="text-black font-semibold font-rubik text-3xl pt-10 mb-5">
                Таблица покрытия
              </h1>
              <div className="mt-10 flex justify-center bg-lime-100 mx-auto max-w-[450px] rounded-xl border-2 border-black p-3">
                {coverageTableData && (
                  <CoverageTable coverageTable={coverageTableData} />
                )}
              </div>
              <h1 className="text-black font-semibold font-rubik text-3xl pt-10 mb-4">
                Ответ
              </h1>
              <div>
                <p className="text-black font-semibold font-rubik text-3xl mb-5 border-2 border-black inline-block p-3 rounded-lg">
                  {result || "Результат появится здесь"}{" "}
                  {/* Опциональный текст для вывода результата */}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
