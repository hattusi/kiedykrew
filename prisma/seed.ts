import { PrismaClient, DonationType, BloodType, DemandLevel, AdapterType } from "@prisma/client";

const prisma = new PrismaClient();

const STATIONS = [
  {
    name: "RCKiK Warszawa – oddział główny",
    city: "Warszawa",
    region: "mazowieckie",
    address: "ul. Saska 63/75, 03-948 Warszawa",
    latitude: 52.2297,
    longitude: 21.0122,
    phone: "+48 22 514 60 00",
    websiteUrl: "https://www.rckik-warszawa.com.pl",
    reservationUrl: "https://www.rckik-warszawa.com.pl/rejestracja",
    openingHours: {
      monday: { open: "07:30", close: "19:00" },
      tuesday: { open: "07:30", close: "19:00" },
      wednesday: { open: "07:30", close: "19:00" },
      thursday: { open: "07:30", close: "19:00" },
      friday: { open: "07:30", close: "17:00" },
      saturday: { open: "08:00", close: "14:00" },
      sunday: null,
    },
    supportsOnlineReservation: true,
    supportedDonationTypes: [
      DonationType.WHOLE_BLOOD,
      DonationType.PLASMA,
      DonationType.PLATELETS,
    ],
  },
  {
    name: "RCKiK Kraków",
    city: "Kraków",
    region: "małopolskie",
    address: "ul. Rzeźnicza 11, 31-540 Kraków",
    latitude: 50.0647,
    longitude: 19.945,
    phone: "+48 12 261 88 00",
    websiteUrl: "https://www.rckik.krakow.pl",
    reservationUrl: "https://www.rckik.krakow.pl/dawcy/rejestracja",
    openingHours: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "17:00" },
      saturday: { open: "08:00", close: "13:00" },
      sunday: null,
    },
    supportsOnlineReservation: true,
    supportedDonationTypes: [
      DonationType.WHOLE_BLOOD,
      DonationType.PLASMA,
    ],
  },
  {
    name: "RCKiK Wrocław",
    city: "Wrocław",
    region: "dolnośląskie",
    address: "ul. Czerwonego Krzyża 5/9, 50-345 Wrocław",
    latitude: 51.1079,
    longitude: 17.0385,
    phone: "+48 71 371 51 00",
    websiteUrl: "https://www.rckik.wroclaw.pl",
    reservationUrl: "https://www.rckik.wroclaw.pl/rejestracja-krwiodawcy",
    openingHours: {
      monday: { open: "07:30", close: "18:30" },
      tuesday: { open: "07:30", close: "18:30" },
      wednesday: { open: "07:30", close: "18:30" },
      thursday: { open: "07:30", close: "18:30" },
      friday: { open: "07:30", close: "16:00" },
      saturday: { open: "08:00", close: "14:00" },
      sunday: null,
    },
    supportsOnlineReservation: false,
    supportedDonationTypes: [DonationType.WHOLE_BLOOD, DonationType.PLASMA],
  },
  {
    name: "RCKiK Gdańsk",
    city: "Gdańsk",
    region: "pomorskie",
    address: "ul. Hoene-Wrońskiego 4, 80-210 Gdańsk",
    latitude: 54.372,
    longitude: 18.6386,
    phone: "+48 58 520 40 20",
    websiteUrl: "https://www.rckik.gda.pl",
    reservationUrl: null,
    openingHours: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "16:30" },
      saturday: { open: "08:00", close: "13:00" },
      sunday: null,
    },
    supportsOnlineReservation: false,
    supportedDonationTypes: [DonationType.WHOLE_BLOOD, DonationType.PLATELETS],
  },
  {
    name: "RCKiK Poznań",
    city: "Poznań",
    region: "wielkopolskie",
    address: "ul. Marcelińska 44, 60-354 Poznań",
    latitude: 52.3997,
    longitude: 16.9049,
    phone: "+48 61 886 33 00",
    websiteUrl: "https://www.rckik.poznan.pl",
    reservationUrl: "https://www.rckik.poznan.pl/rejestracja",
    openingHours: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "16:00" },
      saturday: { open: "08:00", close: "13:00" },
      sunday: null,
    },
    supportsOnlineReservation: true,
    supportedDonationTypes: [DonationType.WHOLE_BLOOD, DonationType.PLASMA, DonationType.ERYTHROCYTES],
  },
  {
    name: "RCKiK Łódź",
    city: "Łódź",
    region: "łódzkie",
    address: "ul. Milionowa 14, 93-113 Łódź",
    latitude: 51.7592,
    longitude: 19.4559,
    phone: "+48 42 616 86 00",
    websiteUrl: "https://www.rckik.lodz.pl",
    reservationUrl: null,
    openingHours: {
      monday: { open: "08:00", close: "18:00" },
      tuesday: { open: "08:00", close: "18:00" },
      wednesday: { open: "08:00", close: "18:00" },
      thursday: { open: "08:00", close: "18:00" },
      friday: { open: "08:00", close: "16:00" },
      saturday: { open: "08:00", close: "13:00" },
      sunday: null,
    },
    supportsOnlineReservation: false,
    supportedDonationTypes: [DonationType.WHOLE_BLOOD],
  },
  {
    name: "RCKiK Katowice",
    city: "Katowice",
    region: "śląskie",
    address: "ul. Raciborska 15, 40-074 Katowice",
    latitude: 50.2649,
    longitude: 19.0238,
    phone: "+48 32 208 76 00",
    websiteUrl: "https://www.rckik.katowice.pl",
    reservationUrl: "https://www.rckik.katowice.pl/dla-dawcow/rejestracja",
    openingHours: {
      monday: { open: "07:30", close: "19:00" },
      tuesday: { open: "07:30", close: "19:00" },
      wednesday: { open: "07:30", close: "19:00" },
      thursday: { open: "07:30", close: "19:00" },
      friday: { open: "07:30", close: "17:00" },
      saturday: { open: "08:00", close: "14:00" },
      sunday: null,
    },
    supportsOnlineReservation: true,
    supportedDonationTypes: [DonationType.WHOLE_BLOOD, DonationType.PLASMA],
  },
  {
    name: "Punkt Krwiodawstwa Centrum – Warszawa",
    city: "Warszawa",
    region: "mazowieckie",
    address: "al. Jana Pawła II 36, 00-141 Warszawa",
    latitude: 52.2394,
    longitude: 20.9967,
    phone: "+48 22 653 83 00",
    websiteUrl: null,
    reservationUrl: null,
    openingHours: {
      monday: { open: "09:00", close: "17:00" },
      tuesday: { open: "09:00", close: "17:00" },
      wednesday: { open: "09:00", close: "17:00" },
      thursday: { open: "09:00", close: "17:00" },
      friday: { open: "09:00", close: "15:00" },
      saturday: null,
      sunday: null,
    },
    supportsOnlineReservation: false,
    supportedDonationTypes: [DonationType.WHOLE_BLOOD],
  },
];

const BLOOD_DEMAND_SEEDS: Record<string, { bloodType: BloodType; level: DemandLevel; note?: string }[]> = {
  "RCKiK Warszawa – oddział główny": [
    { bloodType: BloodType.O_MINUS, level: DemandLevel.CRITICAL, note: "Pilnie potrzebna! Zapasy krytyczne." },
    { bloodType: BloodType.A_PLUS, level: DemandLevel.LOW },
    { bloodType: BloodType.B_PLUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.AB_PLUS, level: DemandLevel.SURPLUS },
    { bloodType: BloodType.O_PLUS, level: DemandLevel.LOW },
    { bloodType: BloodType.A_MINUS, level: DemandLevel.CRITICAL, note: "Stan krytyczny" },
    { bloodType: BloodType.B_MINUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.AB_MINUS, level: DemandLevel.NORMAL },
  ],
  "RCKiK Kraków": [
    { bloodType: BloodType.O_MINUS, level: DemandLevel.LOW },
    { bloodType: BloodType.A_PLUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.B_PLUS, level: DemandLevel.HIGH },
    { bloodType: BloodType.AB_PLUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.O_PLUS, level: DemandLevel.CRITICAL, note: "Nagłe zapotrzebowanie" },
    { bloodType: BloodType.A_MINUS, level: DemandLevel.LOW },
    { bloodType: BloodType.B_MINUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.AB_MINUS, level: DemandLevel.SURPLUS },
  ],
  "RCKiK Wrocław": [
    { bloodType: BloodType.O_MINUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.A_PLUS, level: DemandLevel.HIGH },
    { bloodType: BloodType.B_PLUS, level: DemandLevel.LOW },
    { bloodType: BloodType.AB_PLUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.O_PLUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.A_MINUS, level: DemandLevel.NORMAL },
    { bloodType: BloodType.B_MINUS, level: DemandLevel.CRITICAL },
    { bloodType: BloodType.AB_MINUS, level: DemandLevel.NORMAL },
  ],
};

async function main() {
  console.log("Seeding database...");

  for (const data of STATIONS) {
    const { supportedDonationTypes, ...rest } = data;
    let station = await prisma.station.findFirst({ where: { name: data.name } });
    if (!station) {
      station = await prisma.station.create({
        data: { ...rest, supportedDonationTypes, status: "ACTIVE" },
      });
    }

    // Seed blood demand for known stations
    const demands = BLOOD_DEMAND_SEEDS[station.name];
    if (demands) {
      for (const d of demands) {
        await prisma.bloodDemand.upsert({
          where: { stationId_bloodType: { stationId: station.id, bloodType: d.bloodType } },
          update: { level: d.level, note: d.note },
          create: { stationId: station.id, ...d },
        });
      }
    }

    // Create a mock source for every station
    const existing = await prisma.source.findFirst({
      where: { stationId: station.id, adapterType: "MOCK" },
    });
    if (!existing) {
      await prisma.source.create({
        data: {
          stationId: station.id,
          adapterType: AdapterType.MOCK,
          config: { daysAhead: 14, slotsPerDay: 8 },
          isEnabled: true,
        },
      });
    }

    console.log(`  ✓ ${station.name} (${station.city})`);
  }

  console.log("\nSeeding complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
