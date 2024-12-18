interface CourierData {
  hourlyWage: string;
  checkWage: string;
  fuelExpense: string;
  speedBonus: string;
  couriers: {
    [key: string]: {
      kmPerDay: string;
      deductions: string;
      personnelDelivery: string;
    }[];
  };
}

interface ProcessedData {
  globalSettings: {
    hourlyWage: string;
    checkWage: string;
    fuelExpense: string;
    speedBonus: string;
  };
  courierDetails: {
    name: string;
    kmPerDay: string;
    deductions: string;
    personnelDelivery: string;
    deliveryData: any; // Data from ReportTable
  }[];
}

export const collectAndProcessGrcData = (
  inputData: CourierData,
  reportData: any[]
): ProcessedData => {
  const processedData: ProcessedData = {
    globalSettings: {
      hourlyWage: inputData.hourlyWage,
      checkWage: inputData.checkWage,
      fuelExpense: inputData.fuelExpense,
      speedBonus: inputData.speedBonus,
    },
    courierDetails: [],
  };

  // Process each courier's data
  Object.entries(inputData.couriers).forEach(
    ([courierName, courierEntries]) => {
      courierEntries.forEach((entry) => {
        // Find corresponding report data for this courier
        const courierReportData = reportData.filter(
          (report) => report["ФИО Курьера"] === courierName
        );

        processedData.courierDetails.push({
          name: courierName,
          kmPerDay: entry.kmPerDay,
          deductions: entry.deductions,
          personnelDelivery: entry.personnelDelivery,
          deliveryData: courierReportData,
        });
      });
    }
  );

  // Log the processed data to console
  console.log("Processed GRC Data:", processedData);

  return processedData;
};
