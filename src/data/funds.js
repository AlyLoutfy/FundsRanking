export const funds = [
  {
    id: 1,
    name: "CIB Wealth Fund",
    manager: "CIB",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Commercial_International_Bank_Logo.svg/1200px-Commercial_International_Bank_Logo.svg.png",
    annualReturn: 26.5,
    ytdReturn: 18.2,
    category: "Equity",
    risk: "High"
  },
  {
    id: 2,
    name: "Azimut Egypt Equity Fund",
    manager: "Azimut",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Azimut_Holding_logo.svg/2560px-Azimut_Holding_logo.svg.png",
    annualReturn: 25.8,
    ytdReturn: 17.9,
    category: "Equity",
    risk: "High"
  },
  {
    id: 3,
    name: "EFG Hermes One",
    manager: "EFG Hermes",
    logo: "https://mubasher.mncdn.com/GK_News_En_2016/21/02/2016/10520161210021052016121002_1.jpg",
    annualReturn: 24.1,
    ytdReturn: 16.5,
    category: "Equity",
    risk: "High"
  },
  {
    id: 4,
    name: "Allianz Life Assurance",
    manager: "Allianz",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Allianz_logo.svg/2048px-Allianz_logo.svg.png",
    annualReturn: 21.8,
    ytdReturn: 14.1,
    category: "Mixed",
    risk: "Medium"
  },
  {
    id: 5,
    name: "Faisal Islamic Bank Fund",
    manager: "Faisal Bank",
    logo: "https://upload.wikimedia.org/wikipedia/ar/7/7c/Faisal_Islamic_Bank_of_Egypt_logo.png",
    annualReturn: 19.2,
    ytdReturn: 13.5,
    category: "Islamic",
    risk: "Medium"
  },
  {
    id: 6,
    name: "Ahli United Alpha Fund",
    manager: "Ahli United",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Ahli_United_Bank_Logo.svg/1200px-Ahli_United_Bank_Logo.svg.png",
    annualReturn: 18.5,
    ytdReturn: 12.8,
    category: "Equity",
    risk: "High"
  },
  {
    id: 7,
    name: "QNB Al Ahli Fund",
    manager: "QNB",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/QNB_Group_Logo.svg/2560px-QNB_Group_Logo.svg.png",
    annualReturn: 17.9,
    ytdReturn: 11.5,
    category: "Equity",
    risk: "High"
  },
  {
    id: 8,
    name: "Thndr Growth Fund",
    manager: "Thndr",
    logo: "https://thndr.app/wp-content/uploads/2021/01/Thndr-Logo-01.png",
    annualReturn: 17.5,
    ytdReturn: 11.2,
    category: "Tech",
    risk: "High"
  },
  {
    id: 9,
    name: "NBE Fund 1",
    manager: "NBE",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Bank_of_Egypt_Logo.svg/1200px-National_Bank_of_Egypt_Logo.svg.png",
    annualReturn: 16.8,
    ytdReturn: 10.9,
    category: "Fixed Income",
    risk: "Low"
  },
  {
    id: 10,
    name: "Banque Misr Fund II",
    manager: "Banque Misr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Banque_Misr_Logo.svg/1200px-Banque_Misr_Logo.svg.png",
    annualReturn: 16.2,
    ytdReturn: 10.5,
    category: "Growth",
    risk: "Medium"
  },
  {
    id: 11,
    name: "Credit Agricole Fund 1",
    manager: "Credit Agricole",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Credit_Agricole_Logo.svg/1200px-Credit_Agricole_Logo.svg.png",
    annualReturn: 15.9,
    ytdReturn: 10.2,
    category: "Balanced",
    risk: "Medium"
  },
  {
    id: 12,
    name: "Alex Bank Fund 1",
    manager: "Alex Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bank_of_Alexandria_Logo.svg/1200px-Bank_of_Alexandria_Logo.svg.png",
    annualReturn: 15.5,
    ytdReturn: 9.8,
    category: "Money Market",
    risk: "Low"
  },
  {
    id: 13,
    name: "NBK Ishraq Liquidity",
    manager: "NBK",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/NBK_Logo.svg/1200px-NBK_Logo.svg.png",
    annualReturn: 14.8,
    ytdReturn: 9.5,
    category: "Islamic",
    risk: "Low"
  },
  {
    id: 14,
    name: "SAIB Fund 2",
    manager: "SAIB",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Saib_Bank_Logo.svg/1200px-Saib_Bank_Logo.svg.png",
    annualReturn: 14.2,
    ytdReturn: 9.1,
    category: "Fixed Income",
    risk: "Low"
  },
  {
    id: 15,
    name: "FABMisr Modkharaty",
    manager: "FABMisr",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/First_Abu_Dhabi_Bank_logo.svg/1200px-First_Abu_Dhabi_Bank_logo.svg.png",
    annualReturn: 13.9,
    ytdReturn: 8.8,
    category: "Money Market",
    risk: "Low"
  }
];

// Generate more realistic mock funds
const fundTypes = [
  { name: "Equity Fund", category: "Equity", risk: "High" },
  { name: "Growth Fund", category: "Growth", risk: "High" },
  { name: "Balanced Fund", category: "Balanced", risk: "Medium" },
  { name: "Income Fund", category: "Fixed Income", risk: "Low" },
  { name: "Money Market Fund", category: "Money Market", risk: "Low" },
  { name: "Islamic Fund", category: "Islamic", risk: "Medium" }
];

const managers = [
  { name: "CIB", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Commercial_International_Bank_Logo.svg/1200px-Commercial_International_Bank_Logo.svg.png" },
  { name: "NBE", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Bank_of_Egypt_Logo.svg/1200px-National_Bank_of_Egypt_Logo.svg.png" },
  { name: "Banque Misr", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Banque_Misr_Logo.svg/1200px-Banque_Misr_Logo.svg.png" },
  { name: "EFG Hermes", logo: "https://mubasher.mncdn.com/GK_News_En_2016/21/02/2016/10520161210021052016121002_1.jpg" },
  { name: "QNB", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/QNB_Group_Logo.svg/2560px-QNB_Group_Logo.svg.png" },
  { name: "Ahli United", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Ahli_United_Bank_Logo.svg/1200px-Ahli_United_Bank_Logo.svg.png" },
  { name: "Faisal Bank", logo: "https://upload.wikimedia.org/wikipedia/ar/7/7c/Faisal_Islamic_Bank_of_Egypt_logo.png" },
  { name: "Alex Bank", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/68/Bank_of_Alexandria_Logo.svg/1200px-Bank_of_Alexandria_Logo.svg.png" },
  { name: "Credit Agricole", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Credit_Agricole_Logo.svg/1200px-Credit_Agricole_Logo.svg.png" },
  { name: "NBK", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/NBK_Logo.svg/1200px-NBK_Logo.svg.png" }
];

for (let i = 16; i <= 100; i++) {
  const manager = managers[Math.floor(Math.random() * managers.length)];
  const type = fundTypes[Math.floor(Math.random() * fundTypes.length)];
  const annualReturn = (Math.random() * 20 + 8).toFixed(1); // Random return between 8% and 28%
  const ytdReturn = (annualReturn * (0.6 + Math.random() * 0.2)).toFixed(1); // Realistic YTD ratio

  funds.push({
    id: i,
    name: `${manager.name} ${type.name} ${Math.floor(Math.random() * 5) + 1}`, // e.g., CIB Equity Fund 3
    manager: manager.name,
    logo: manager.logo,
    annualReturn: parseFloat(annualReturn),
    ytdReturn: parseFloat(ytdReturn),
    category: type.category,
    risk: type.risk
  });
}
