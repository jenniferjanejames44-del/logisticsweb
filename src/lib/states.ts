// State / province / region data for countries supported by RAC Logistics
// shipment forms. If a country is not present here, the form should fall
// back to a free-text input (so users can still enter their state manually).

export const STATES_BY_COUNTRY: Record<string, string[]> = {
  Nigeria: [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
    "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
    "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
    "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
    "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  ],
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "Washington D.C.", "West Virginia", "Wisconsin", "Wyoming",
  ],
  "United Kingdom": [
    "England - Greater London", "England - South East", "England - South West",
    "England - East of England", "England - East Midlands",
    "England - West Midlands", "England - North East", "England - North West",
    "England - Yorkshire and the Humber", "Scotland", "Wales", "Northern Ireland",
  ],
  China: [
    "Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi",
    "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hong Kong", "Hubei",
    "Hunan", "Inner Mongolia", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Macau",
    "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan",
    "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang",
  ],
};

export const getStatesForCountry = (country: string): string[] | null => {
  if (!country) return null;
  return STATES_BY_COUNTRY[country] ?? null;
};