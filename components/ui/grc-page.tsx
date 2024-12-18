import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RussianRuble, Waypoints } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useCallback } from "react";
import { collectAndProcessGrcData } from "@/hooks/calcul-grc";

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
}

interface GrcPageProps {
  data: any[];
  onCalculate?: (processedData: ProcessedGrcData) => void;
}

export default function GrcPage({ data, onCalculate }: GrcPageProps) {
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

  // Process and calculate GRC data
  const handleCalculate = useCallback(() => {
    const processedData = {
      hourlyWage: globalSettings.hourlyWage,
      checkWage: globalSettings.checkWage,
      fuelExpense: globalSettings.fuelExpense,
      speedBonus: globalSettings.speedBonus,
      couriers: courierData,
    };

    // Send data to API
    fetch(
      // "https://nikitahub-gru-resta-back-f1fb.twc1.net/olap/get_olap_sec?start_date=2024-12-17&end_date=2024-12-17&report_id=17&corporation=%D0%93%D1%80%D0%B8%D0%BB%D1%8C%D0%BD%D0%B8%D1%86%D0%B0",
      "http://test.API",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        if (onCalculate) {
          onCalculate(processedData);
        }
      })
      .catch((error) => {
        console.error("Error sending data:", error);
      });
  }, [globalSettings, courierData, onCalculate]);

  // Add event listener for calculate event
  useEffect(() => {
    const handleCalculateEvent = () => {
      console.log("Calculate event triggered in GrcPage");
      try {
        handleCalculate();
      } catch (error) {
        console.error("Error during calculation:", error);
      }
    };

    const element = document.querySelector(".grc-page");
    if (element) {
      element.addEventListener("calculate", handleCalculateEvent);
      return () => {
        element.removeEventListener("calculate", handleCalculateEvent);
      };
    }
  }, [handleCalculate]);

  return (
    <ScrollArea className="h-[650px] w-full grc-page">
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
    </ScrollArea>
  );
}
