from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import math
import asyncio
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Укажите список разрешенных доменов
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы
    allow_headers=["*"],   # Разрешить все заголовки
)

class TruthTableInput(BaseModel):
    minterms: list[int]

class QuineMcCluskey:
    def __init__(self, minterms):
        if not all(isinstance(m, int) for m in minterms):
            raise ValueError("Ошибка: список должен содержать только целые числа.")

        self.num_vars = len(format(max(minterms), 'b'))
        self.minterms = [self.to_binary_string(m, self.num_vars) for m in minterms]
        self.essential_implicants = []

    def to_binary_string(self, value, length):
        return format(value, f'0{length}b')

    def minimize(self):
        prime_implicants = self.get_prime_implicants()
        self.essential_implicants = self.find_essential_implicants(prime_implicants)

    def get_prime_implicants(self):
        result = self.minterms[:]
        merged = [False] * len(result)

        while True:
            next_level = []
            merged = [False] * len(result)

            for i in range(len(result)):
                for j in range(i + 1, len(result)):
                    combined = self.combine(result[i], result[j])
                    if combined is not None:
                        if combined not in next_level:
                            next_level.append(combined)
                        merged[i] = merged[j] = True

            for i in range(len(result)):
                if not merged[i] and result[i] not in next_level:
                    next_level.append(result[i])

            if set(result) == set(next_level):
                break

            result = next_level[:]

        return result

    def combine(self, a, b):
        differences = sum(1 for x, y in zip(a, b) if x != y)
        if differences != 1:
            return None

        return ''.join('-' if x != y else x for x, y in zip(a, b))

    def find_essential_implicants(self, prime_implicants):
        essentials = []
        covered_minterms = [False] * len(self.minterms)

        for i, minterm in enumerate(self.minterms):
            count, covering_implicant = 0, None

            for implicant in prime_implicants:
                if self.matches(implicant, minterm):
                    count += 1
                    covering_implicant = implicant

            if count == 1 and covering_implicant not in essentials:
                essentials.append(covering_implicant)
                for j, minterm_cmp in enumerate(self.minterms):
                    if self.matches(covering_implicant, minterm_cmp):
                        covered_minterms[j] = True

        for i, covered in enumerate(covered_minterms):
            if not covered:
                for implicant in prime_implicants:
                    if self.matches(implicant, self.minterms[i]) and implicant not in essentials:
                        essentials.append(implicant)
                        break
        print(essentials)
        return essentials

    def matches(self, implicant, minterm):
        return all(ic == mc or ic == '-' for ic, mc in zip(implicant, minterm))

    def convert_to_expression(self, binary):
        variables = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        if self.num_vars > len(variables):
            raise ValueError(f"Превышено максимальное количество переменных: {len(variables)}")

        return ''.join((variables[i] if b == '1' else (variables[i] + "'")) for i, b in enumerate(binary) if b != '-')

    def get_groups(self):
        groups = {}
        for minterm in self.minterms:
            count = minterm.count('1')
            if count not in groups:
                groups[count] = []
            groups[count].append(minterm)
        return groups

    def get_headers(self):
        return self.minterms

    def get_terms(self):
        return [{"terms": [minterm for minterm in self.minterms if self.matches(implicant, minterm)]} for implicant in self.essential_implicants]

    def get_coverage_table(self):
        headers = self.minterms
        rows = [[1 if self.matches(implicant, minterm) else 0 for minterm in self.minterms] for implicant in self.essential_implicants]
        return {"headers": headers, "rows": rows}

    def get_minimized_expression(self):
        expressions = ['( ' + self.convert_to_expression(implicant) + ' )' for implicant in self.essential_implicants]
        return ' ∨ '.join(expressions) if expressions else "0"

@app.post("/quine-mccluskey")
async def quine_mccluskey(input_data: TruthTableInput):
    try:
        qmc = QuineMcCluskey(input_data.minterms)
        qmc.minimize()

        response = {
            "groups": qmc.get_groups(),
            "minimizedExpression": qmc.get_minimized_expression(),
            "primeImplicantsChart": {
                "headers": qmc.get_headers(),
                "terms": qmc.get_terms()
            }
        }
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Небольшой пример тестирования API
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
