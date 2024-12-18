import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RussianRuble, Waypoints } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useCallback } from "react";
import { collectAndProcessGrcData } from "@/hooks/calcul-grc";
import { SheetClose, SheetFooter } from "./sheet";
import { Button } from "./button";

interface CourierEntry {
  kmPerDay: string;
  deductions: string;
  personnelDelivery: string;
}

interface GlobalSettings {
  hourlyWage: string;
  checkWage: string;
  fuelExpense: string;
  speedBonus: string;
}

interface ProcessedGrcData {
  hourlyWage: string;
  checkWage: string;
  fuelExpense: string;
  speedBonus: string;
  couriers: {
    [courierName: string]: CourierEntry[];
  };
  inputData: any[];
  serverResponse?: any[];
}

interface GrcPageProps {
  data: any[];
  onCalculate?: (processedData: ProcessedGrcData) => void;
}

export default function GrcPage({ data, onCalculate }: GrcPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const courierNames = Array.from(
    new Set(data.map((item) => item["ФИО Курьера"]))
  )
    .filter((name) => name)
    .sort();

  // State for global settings

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    hourlyWage: "",
    checkWage: "",
    fuelExpense: "",
    speedBonus: "",
  });

  // State for courier-specific data
  const [courierData, setCourierData] = useState<{
    [key: string]: CourierEntry[];
  }>(() => {
    const initialData: { [key: string]: CourierEntry[] } = {};
    courierNames.forEach((name) => {
      if (name) {
        initialData[name] = [
          {
            kmPerDay: "",
            deductions: "",
            personnelDelivery: "",
          },
        ];
      }
    });
    return initialData;
  });

  // Handle global settings changes
  const handleGlobalChange =
    (field: keyof GlobalSettings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalSettings((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  // Handle courier-specific data changes
  const handleCourierChange =
    (courierName: string, index: number, field: keyof CourierEntry) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCourierData((prev) => ({
        ...prev,
        [courierName]: prev[courierName].map((entry, i) =>
          i === index ? { ...entry, [field]: e.target.value } : entry
        ),
      }));
    };

  const handleCalculate = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const processedData = {
        hourlyWage: globalSettings.hourlyWage,
        checkWage: globalSettings.checkWage,
        fuelExpense: globalSettings.fuelExpense,
        speedBonus: globalSettings.speedBonus,
        couriers: courierData,
        inputData: data,
      };

      const response = await fetch("http://localhost:8000/olap/send_grc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("Success:", responseData);

      // Если есть данные от сервера и они в правильном формате
      if (
        responseData &&
        responseData.data &&
        Array.isArray(responseData.data)
      ) {
        // Вызываем onCalculate с полученными данными
        if (onCalculate) {
          onCalculate({
            ...processedData,
            serverResponse: responseData.data, // Добавляем данные от сервера
          });
        }
      }

      // Закрываем окно
      const closeButton = document.querySelector(
        ".sheet-close-button"
      ) as HTMLButtonElement;
      if (closeButton) {
        setTimeout(() => {
          closeButton.click();
        }, 100);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [globalSettings, courierData, onCalculate, data, isSubmitting]);

  return (
    <ScrollArea className="h-[750px] w-full grc-page">
      <div className="space-y-6 p-4">
        <h1 className="text-2xl font-semibold flex justify-center">Курьеры</h1>
        <p className="items-center justify-center flex">Для всех курьеров</p>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="min-w-[90px]">З/П Часовая</Label>
              <Input
                className="flex-1 min-w-[130px]"
                placeholder="Введите данные"
                value={globalSettings.hourlyWage}
                onChange={handleGlobalChange("hourlyWage")}
              />
              <RussianRuble color="green" size={20} />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Label className="min-w-[90px]">З/П по чекам</Label>
              <Input
                className="flex-1 min-w-[130px]"
                placeholder="Введите данные"
                value={globalSettings.checkWage}
                onChange={handleGlobalChange("checkWage")}
              />
              <RussianRuble color="green" size={20} />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Label className="min-w-[90px]">ГСМ</Label>
              <Input
                className="flex-1 min-w-[130px]"
                placeholder="Введите данные"
                value={globalSettings.fuelExpense}
                onChange={handleGlobalChange("fuelExpense")}
              />
              <RussianRuble color="green" size={20} />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Label className="min-w-[90px]">Бонус за скорость</Label>
              <Input
                className="flex-1 min-w-[130px]"
                placeholder="Введите данные"
                value={globalSettings.speedBonus}
                onChange={handleGlobalChange("speedBonus")}
              />
              <RussianRuble color="green" size={20} />
            </div>
          </CardContent>
        </Card>

        <p className="items-center justify-center flex">Для каждого курьера</p>
        <div className="grid gap-6">
          {courierNames.map((courierName, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="text-lg font-medium mb-4">{courierName}</div>
                <div className="space-y-4">
                  {courierData[courierName]?.map((entry, entryIndex) => (
                    <div key={entryIndex} className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <Label className="min-w-[90px]">КМ за день</Label>
                        <Input
                          className="flex-1 min-w-[140px]"
                          placeholder="Введите данные"
                          value={entry.kmPerDay}
                          onChange={handleCourierChange(
                            courierName,
                            entryIndex,
                            "kmPerDay"
                          )}
                        />
                        <Waypoints color="green" size={20} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="min-w-[90px]">Удержания</Label>
                        <Input
                          className="flex-1 min-w-[140px]"
                          placeholder="Введите данные"
                          value={entry.deductions}
                          onChange={handleCourierChange(
                            courierName,
                            entryIndex,
                            "deductions"
                          )}
                        />
                        <RussianRuble color="green" size={20} />
                      </div>
                      <div className="flex items-center gap-4">
                        <Label className="min-w-[90px]">
                          Доставка персонала
                        </Label>
                        <Input
                          className="flex-1 min-w-[140px]"
                          placeholder="Введите данные"
                          value={entry.personnelDelivery}
                          onChange={handleCourierChange(
                            courierName,
                            entryIndex,
                            "personnelDelivery"
                          )}
                        />
                        <RussianRuble color="green" size={20} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <SheetFooter className="pt-5">
        <Button
          type="submit"
          onClick={handleCalculate}
          disabled={isSubmitting}
          className="w-full h-[50px]"
        >
          {isSubmitting ? "Отправка..." : "Рассчитать"}
        </Button>
        {/* Добавляем скрытую кнопку для закрытия */}
        <SheetClose className="sheet-close-button hidden" />
      </SheetFooter>
    </ScrollArea>
  );
}
