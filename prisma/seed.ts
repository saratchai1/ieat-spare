import {
  AlertLevel,
  AssetStatus,
  AssetType,
  Criticality,
  FactoryStatus,
  MaintenanceType,
  PartCategory,
  PrismaClient,
  TechnicianAvailability,
  TicketPriority,
  TicketStatus,
  TransactionType,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const assetLabel: Record<AssetType, string> = {
  PUMP: "ปั๊มกระบวนการผลิต",
  MOTOR: "มอเตอร์ขับหลัก",
  CONVEYOR: "สายพานลำเลียง",
  COMPRESSOR: "เครื่องอัดอากาศ",
  BOILER: "หม้อไอน้ำ",
  COOLING_TOWER: "หอหล่อเย็น",
  ELECTRICAL_PANEL: "ตู้ควบคุมไฟฟ้า",
};

async function main() {
  await prisma.workOrderNote.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sparePartCompatibility.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.factory.deleteMany();

  const factories = await Promise.all(
    [
      {
        code: "F-A",
        name: "โรงงาน A - อาหารและบรรจุภัณฑ์แหลมฉบัง",
        zone: "โซนเหนือ ถนนนิคม 3",
        status: FactoryStatus.NORMAL,
        riskLevel: 18,
        contactPerson: "นรินทร์ ส.",
        phone: "02-410-0101",
        description: "โรงงานผลิตบรรจุภัณฑ์อาหารและคลังเย็นภายในนิคมอุตสาหกรรมแหลมฉบัง",
      },
      {
        code: "F-B",
        name: "โรงงาน B - ชิ้นส่วนยานยนต์สยาม",
        zone: "โซนตะวันออก ใกล้ทางออกท่าเรือ",
        status: FactoryStatus.CRITICAL,
        riskLevel: 86,
        contactPerson: "พัชรา ก.",
        phone: "02-410-0102",
        description: "โรงงานชิ้นส่วนยานยนต์ที่ใช้มอเตอร์กำลังสูงและสายการผลิตต่อเนื่อง",
      },
      {
        code: "F-C",
        name: "โรงงาน C - ไทยโพลิเมอร์",
        zone: "โซนสาธารณูปโภคกลาง",
        status: FactoryStatus.UNDER_MAINTENANCE,
        riskLevel: 61,
        contactPerson: "มาลี ต.",
        phone: "02-410-0103",
        description: "โรงงานอัดรีดโพลิเมอร์ที่ใช้ระบบลมอัดและน้ำหล่อเย็นสูง",
      },
      {
        code: "F-D",
        name: "โรงงาน D - กรีนอิเล็กทรอนิกส์",
        zone: "โซนตะวันตก ใกล้สถานีไฟฟ้าย่อย",
        status: FactoryStatus.WARNING,
        riskLevel: 54,
        contactPerson: "อนุชา พ.",
        phone: "02-410-0104",
        description: "โรงงานประกอบอิเล็กทรอนิกส์พร้อมระบบห้องสะอาดและตู้ไฟฟ้าหลัก",
      },
      {
        code: "F-E",
        name: "โรงงาน E - เดลต้าโคลด์เชน",
        zone: "โซนใต้ ใกล้ทางเชื่อมท่าเรือ",
        status: FactoryStatus.NORMAL,
        riskLevel: 27,
        contactPerson: "ศิริพร ว.",
        phone: "02-410-0105",
        description: "คลังสินค้าเย็นที่ใช้ปั๊ม หอหล่อเย็น และสายพานลำเลียงต่อเนื่อง",
      },
    ].map((factory) => prisma.factory.create({ data: factory })),
  );

  const factoryByCode = Object.fromEntries(factories.map((factory) => [factory.code, factory]));

  const parts = await Promise.all(
    [
      ["BRG-6205", "ตลับลูกปืน 6205 ZZ", PartCategory.BEARING, [AssetType.MOTOR, AssetType.PUMP, AssetType.CONVEYOR], 42, 8, 12, 420, "ไทยแบริ่งซัพพลาย", 4, "A1-B02"],
      ["BRG-6308", "ตลับลูกปืน 6308 C3", PartCategory.BEARING, [AssetType.MOTOR, AssetType.COMPRESSOR], 9, 3, 10, 1280, "ตัวแทนจำหน่าย NSK ประเทศไทย", 7, "A1-B06"],
      ["MTR-5HP", "มอเตอร์ 5 HP IE3", PartCategory.MOTOR_DRIVE, [AssetType.MOTOR, AssetType.PUMP, AssetType.CONVEYOR], 5, 1, 3, 18500, "ตัวแทนจำหน่าย ABB", 14, "B2-M01"],
      ["MTR-10HP", "มอเตอร์ 10 HP IE3", PartCategory.MOTOR_DRIVE, [AssetType.MOTOR, AssetType.COMPRESSOR], 3, 1, 2, 29400, "ตัวแทนจำหน่าย ABB", 18, "B2-M04"],
      ["BLT-A42", "สายพาน V-belt A42", PartCategory.BELT_SEAL, [AssetType.CONVEYOR, AssetType.MOTOR], 62, 6, 20, 210, "บันโด ประเทศไทย", 3, "C1-V04"],
      ["BLT-B56", "สายพาน V-belt B56", PartCategory.BELT_SEAL, [AssetType.CONVEYOR, AssetType.COMPRESSOR], 16, 4, 15, 360, "บันโด ประเทศไทย", 5, "C1-V08"],
      ["PMP-SEAL-24", "ซีลปั๊มเชิงกล 24 มม.", PartCategory.BELT_SEAL, [AssetType.PUMP], 7, 2, 8, 2450, "โฟลว์เซิร์ฟพาร์ทเนอร์", 9, "D1-S02"],
      ["PMP-IMP-80", "ใบพัดปั๊ม 80 มม.", PartCategory.PUMP_VALVE, [AssetType.PUMP], 6, 0, 4, 5200, "KSB ประเทศไทย", 12, "D2-P01"],
      ["PLC-S7-IO", "โมดูล PLC I/O 16DI", PartCategory.CONTROL_SENSOR, [AssetType.ELECTRICAL_PANEL, AssetType.CONVEYOR], 4, 1, 3, 9800, "พาร์ทเนอร์ Siemens SI", 10, "E1-P03"],
      ["SNS-PRESS-10", "เซนเซอร์แรงดัน 0-10 บาร์", PartCategory.CONTROL_SENSOR, [AssetType.PUMP, AssetType.COMPRESSOR, AssetType.BOILER], 14, 2, 8, 2100, "WIKA ประเทศไทย", 6, "E2-S01"],
      ["SNS-VIB-M8", "เซนเซอร์สั่นสะเทือน M8", PartCategory.CONTROL_SENSOR, [AssetType.MOTOR, AssetType.PUMP, AssetType.COMPRESSOR], 12, 2, 6, 3900, "IFM ประเทศไทย", 8, "E2-S07"],
      ["FLT-AIR-20", "ไส้กรองอากาศ 20 ไมครอน", PartCategory.FILTER, [AssetType.COMPRESSOR], 18, 4, 16, 680, "ตัวแทน Atlas Copco", 5, "F1-A02"],
      ["FLT-HVAC-24", "ไส้กรองแผง HVAC 24x24", PartCategory.FILTER, [AssetType.COOLING_TOWER, AssetType.ELECTRICAL_PANEL], 32, 2, 18, 450, "Camfil ประเทศไทย", 4, "F1-H05"],
      ["VAL-BALL-2", "บอลวาล์วสแตนเลส 2 นิ้ว", PartCategory.PUMP_VALVE, [AssetType.PUMP, AssetType.COOLING_TOWER, AssetType.BOILER], 10, 1, 8, 1750, "KITZ ประเทศไทย", 7, "D3-V02"],
      ["VAL-SOL-24", "โซลินอยด์วาล์ว 24VDC", PartCategory.PUMP_VALVE, [AssetType.PUMP, AssetType.COMPRESSOR, AssetType.BOILER], 8, 2, 6, 1450, "SMC ประเทศไทย", 6, "D3-V06"],
      ["ELC-MCB-32", "เบรกเกอร์ MCB 32A 3P", PartCategory.ELECTRICAL, [AssetType.ELECTRICAL_PANEL, AssetType.MOTOR], 22, 3, 12, 890, "Schneider Electric", 4, "G1-M03"],
      ["ELC-CON-40", "คอนแทคเตอร์ 40A", PartCategory.ELECTRICAL, [AssetType.ELECTRICAL_PANEL, AssetType.MOTOR, AssetType.COMPRESSOR], 11, 2, 8, 2600, "Schneider Electric", 6, "G1-C07"],
      ["ELC-VFD-7", "อินเวอร์เตอร์ VFD 7.5 kW", PartCategory.MOTOR_DRIVE, [AssetType.MOTOR, AssetType.PUMP, AssetType.CONVEYOR], 2, 1, 2, 32600, "Danfoss ประเทศไทย", 21, "B3-V02"],
      ["BOI-GSK-50", "ปะเก็นหม้อไอน้ำ DN50", PartCategory.BELT_SEAL, [AssetType.BOILER], 15, 0, 10, 540, "Spirax Sarco", 6, "H1-B01"],
      ["CT-NOZ-12", "หัวฉีดหอหล่อเย็น", PartCategory.PUMP_VALVE, [AssetType.COOLING_TOWER], 24, 5, 20, 320, "คูลลิ่งทาวเวอร์เซอร์วิส", 5, "H2-C04"],
    ].map(([partCode, name, category, compatibleTypes, currentStock, reservedStock, minStockLevel, unitPrice, supplier, leadTimeDays, warehouseLocation]) =>
      prisma.sparePart.create({
        data: {
          partCode: partCode as string,
          name: name as string,
          category: category as PartCategory,
          compatibleEquipmentTypes: (compatibleTypes as AssetType[]).join(", "),
          currentStock: currentStock as number,
          reservedStock: reservedStock as number,
          minStockLevel: minStockLevel as number,
          unitPrice: unitPrice as number,
          supplier: supplier as string,
          leadTimeDays: leadTimeDays as number,
          warehouseLocation: warehouseLocation as string,
          compatibilities: {
            create: (compatibleTypes as AssetType[]).map((assetType) => ({ assetType })),
          },
        },
      }),
    ),
  );

  const partByCode = Object.fromEntries(parts.map((part) => [part.partCode, part]));

  const technicians = await Promise.all(
    [
      ["สมชาย ร.", "เครื่องจักรหมุน", "081-410-2001", TechnicianAvailability.ASSIGNED, 82, "ตรวจมอเตอร์วิกฤตโรงงาน B", "โซนตะวันออก"],
      ["กิตติพงษ์ น.", "ไฟฟ้าและ PLC", "081-410-2002", TechnicianAvailability.AVAILABLE, 35, null, "โซนตะวันตก"],
      ["วราภรณ์ จ.", "ปั๊มและซีล", "081-410-2003", TechnicianAvailability.AVAILABLE, 44, null, "โซนสาธารณูปโภค"],
      ["อดิศักดิ์ ล.", "หม้อไอน้ำและแรงดัน", "081-410-2004", TechnicianAvailability.ASSIGNED, 70, "เปลี่ยนปะเก็นหม้อไอน้ำ", "โซนเหนือ"],
      ["พิมพ์ชนก ส.", "บำรุงรักษาเชิงคาดการณ์", "081-410-2005", TechnicianAvailability.AVAILABLE, 40, null, "โซนตะวันออก"],
      ["ธวัชชัย ม.", "เครื่องอัดอากาศ", "081-410-2006", TechnicianAvailability.ASSIGNED, 76, "บริการไส้กรองเครื่องอัดอากาศ", "โซนกลาง"],
      ["ณัฐพล ด.", "หอหล่อเย็น", "081-410-2007", TechnicianAvailability.AVAILABLE, 28, null, "โซนใต้"],
      ["เบญจมาศ อ.", "สนับสนุนคลังอะไหล่", "081-410-2008", TechnicianAvailability.AVAILABLE, 25, null, "คลังอะไหล่กลาง"],
      ["ศรัณย์ ป.", "ระบบสายพาน", "081-410-2009", TechnicianAvailability.OFF_DUTY, 0, null, "โซนเหนือ"],
      ["จิรวัฒน์ ท.", "เครื่องมือวัด", "081-410-2010", TechnicianAvailability.ASSIGNED, 64, "สอบเทียบทรานสมิตเตอร์แรงดัน", "โซนตะวันตก"],
    ].map(([name, skillType, phone, availability, workload, currentJob, baseZone]) =>
      prisma.technician.create({
        data: {
          name: name as string,
          skillType: skillType as string,
          phone: phone as string,
          availability: availability as TechnicianAvailability,
          workload: workload as number,
          currentJob: currentJob as string | null,
          baseZone: baseZone as string,
        },
      }),
    ),
  );

  const assetTypesByFactory: Record<string, AssetType[]> = {
    "F-A": [AssetType.PUMP, AssetType.MOTOR, AssetType.CONVEYOR, AssetType.BOILER, AssetType.ELECTRICAL_PANEL, AssetType.COOLING_TOWER],
    "F-B": [AssetType.MOTOR, AssetType.MOTOR, AssetType.CONVEYOR, AssetType.COMPRESSOR, AssetType.PUMP, AssetType.ELECTRICAL_PANEL],
    "F-C": [AssetType.COMPRESSOR, AssetType.COMPRESSOR, AssetType.PUMP, AssetType.BOILER, AssetType.COOLING_TOWER, AssetType.ELECTRICAL_PANEL],
    "F-D": [AssetType.ELECTRICAL_PANEL, AssetType.MOTOR, AssetType.CONVEYOR, AssetType.PUMP, AssetType.COMPRESSOR, AssetType.COOLING_TOWER],
    "F-E": [AssetType.COOLING_TOWER, AssetType.PUMP, AssetType.CONVEYOR, AssetType.MOTOR, AssetType.COMPRESSOR, AssetType.ELECTRICAL_PANEL],
  };

  const assets = [];
  for (const factory of factories) {
    const types = assetTypesByFactory[factory.code];
    for (let index = 0; index < types.length; index += 1) {
      const type = types[index];
      const sequence = index + 1;
      const isCriticalMotor = factory.code === "F-B" && sequence === 2;
      const isWarningPump = factory.code === "F-D" && type === AssetType.PUMP;
      const isMaintenanceCompressor = factory.code === "F-C" && type === AssetType.COMPRESSOR && sequence === 1;
      assets.push(
        await prisma.asset.create({
          data: {
            assetCode: `${factory.code}-${type.slice(0, 3)}-${String(sequence).padStart(2, "0")}`,
            factoryId: factory.id,
            type,
            name: `${assetLabel[type]} ${sequence}`,
            brandModel: isCriticalMotor ? "Toshiba EQP Global 30kW" : `${["KSB", "ABB", "Mitsubishi", "Atlas Copco", "Siemens", "Yaskawa"][index]} รุ่น ${240 + index * 15}`,
            operatingHours: isCriticalMotor ? 12640 : 2200 + index * 980 + factory.riskLevel * 18,
            healthScore: isCriticalMotor ? 42 : isWarningPump ? 68 : isMaintenanceCompressor ? 55 : 76 + ((index + factory.riskLevel) % 18),
            lastMaintenanceAt: daysAgo(18 + index * 11),
            nextPmAt: isCriticalMotor ? daysFromNow(2) : daysFromNow(12 + index * 9),
            criticality: isCriticalMotor ? Criticality.CRITICAL : index < 2 ? Criticality.HIGH : index < 4 ? Criticality.MEDIUM : Criticality.LOW,
            status: isCriticalMotor ? AssetStatus.CRITICAL : isWarningPump ? AssetStatus.WARNING : isMaintenanceCompressor ? AssetStatus.UNDER_MAINTENANCE : AssetStatus.NORMAL,
            installDate: daysAgo(450 + index * 120),
          },
        }),
      );
    }
  }

  const assetByCode = Object.fromEntries(assets.map((asset) => [asset.assetCode, asset]));
  const criticalMotor = assetByCode["F-B-MOT-02"];
  const factoryB = factoryByCode["F-B"];

  let readingCounter = 0;
  for (const asset of assets) {
    const readingsForAsset = readingCounter < 80 ? 4 : readingCounter < 100 ? 2 : 0;
    for (let offset = readingsForAsset - 1; offset >= 0; offset -= 1) {
      const criticalTrend = asset.id === criticalMotor.id;
      await prisma.sensorReading.create({
        data: {
          assetId: asset.id,
          capturedAt: daysAgo(offset),
          vibration: criticalTrend ? 8.6 + (3 - offset) * 0.45 : 1.2 + ((readingCounter + offset) % 17) * 0.18,
          temperature: criticalTrend ? 82 + (3 - offset) * 1.8 : 42 + ((readingCounter + offset) % 16) * 1.6,
          runtimeHours: asset.operatingHours + (readingsForAsset - offset) * 12,
          currentAmp: criticalTrend ? 68 + (3 - offset) * 1.4 : 18 + ((readingCounter + offset) % 22) * 1.1,
          pressureBar: asset.type === AssetType.PUMP || asset.type === AssetType.COMPRESSOR ? 4.2 + ((readingCounter + offset) % 9) * 0.25 : 1.2,
          healthScore: criticalTrend ? 45 - (3 - offset) * 1 : Math.max(55, asset.healthScore - offset),
        },
      });
    }
    readingCounter += readingsForAsset;
  }

  const ticketSeeds = [
    [factoryB.id, criticalMotor.id, "ตรวจพบแรงสั่นสะเทือนสูงที่ตลับลูกปืนฝั่งขับ ระบบดิจิทัลทวินคาดการณ์ความเสี่ยงเสียหายภายใน 72 ชั่วโมง", TicketPriority.CRITICAL, TicketStatus.WAITING_FOR_PARTS, MaintenanceType.CORRECTIVE, partByCode["BRG-6308"].id, technicians[0].id, 6.5, 4],
    [factoryByCode["F-C"].id, assetByCode["F-C-COM-01"].id, "เครื่องอัดอากาศมีอุณหภูมิสูงหลังสัญญาณเตือนแรงดันไส้กรองต่างระดับ", TicketPriority.HIGH, TicketStatus.IN_PROGRESS, MaintenanceType.CORRECTIVE, partByCode["FLT-AIR-20"].id, technicians[5].id, 4, 3],
    [factoryByCode["F-D"].id, assetByCode["F-D-PUM-04"].id, "พบซีลปั๊มรั่วระหว่างการตรวจรอบของผู้ปฏิบัติงาน", TicketPriority.HIGH, TicketStatus.ASSIGNED, MaintenanceType.CORRECTIVE, partByCode["PMP-SEAL-24"].id, technicians[2].id, 3, 2.5],
    [factoryByCode["F-A"].id, assetByCode["F-A-BOI-04"].id, "ตรวจปะเก็นหม้อไอน้ำตามแผนบำรุงรักษาเชิงป้องกัน", TicketPriority.MEDIUM, TicketStatus.APPROVED, MaintenanceType.PREVENTIVE, partByCode["BOI-GSK-50"].id, technicians[3].id, 1, 2],
    [factoryByCode["F-E"].id, assetByCode["F-E-COO-01"].id, "ตรวจหัวฉีดหอหล่อเย็นที่กระจายน้ำไม่สมดุล", TicketPriority.MEDIUM, TicketStatus.NEW, MaintenanceType.PREVENTIVE, partByCode["CT-NOZ-12"].id, null, 0, 2],
  ] as const;

  const statuses = [
    TicketStatus.NEW,
    TicketStatus.APPROVED,
    TicketStatus.ASSIGNED,
    TicketStatus.IN_PROGRESS,
    TicketStatus.WAITING_FOR_PARTS,
    TicketStatus.COMPLETED,
  ];
  const priorities = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.CRITICAL];
  const maintenanceTypes = [MaintenanceType.PREVENTIVE, MaintenanceType.CORRECTIVE, MaintenanceType.EMERGENCY];

  const tickets = [];
  for (let index = 0; index < 25; index += 1) {
    const seed = ticketSeeds[index];
    const factory = factories[index % factories.length];
    const factoryAssets = assets.filter((asset) => asset.factoryId === factory.id);
    const asset = factoryAssets[index % factoryAssets.length];
    const compatiblePart =
      parts.find((part) => part.compatibleEquipmentTypes.includes(asset.type)) ?? parts[index % parts.length];
    const status = seed ? seed[4] : statuses[index % statuses.length];
    const technicianId = seed ? seed[7] : status === TicketStatus.NEW || status === TicketStatus.APPROVED ? null : technicians[index % technicians.length].id;
    tickets.push(
      await prisma.maintenanceTicket.create({
        data: {
          ticketCode: `MT-${String(index + 1).padStart(4, "0")}`,
          factoryId: seed ? seed[0] : factory.id,
          assetId: seed ? seed[1] : asset.id,
          description: seed ? seed[2] : `คำขอบริการซ่อมบำรุงสำหรับ ${asset.name} ตามแผนบำรุงรักษาของนิคมแหลมฉบัง`,
          priority: seed ? seed[3] : priorities[index % priorities.length],
          status,
          maintenanceType: seed ? seed[5] : maintenanceTypes[index % maintenanceTypes.length],
          preferredServiceTime: daysFromNow((index % 10) + 1),
          assignedAt: technicianId ? daysAgo(Math.max(1, 7 - (index % 6))) : null,
          completedAt: status === TicketStatus.COMPLETED ? daysAgo(index % 8) : null,
          downtimeHours: seed ? seed[8] : status === TicketStatus.COMPLETED ? 1.2 + (index % 4) : 0.4 + (index % 6) * 0.6,
          estimatedHours: seed ? seed[9] : 1.5 + (index % 5) * 0.75,
          technicianId,
          requestedPartId: seed ? seed[6] : compatiblePart.id,
          usedPartId: status === TicketStatus.COMPLETED ? compatiblePart.id : null,
        },
      }),
    );
  }

  await Promise.all(
    tickets.slice(0, 12).map((ticket, index) =>
      prisma.workOrderNote.create({
        data: {
          ticketId: ticket.id,
          technicianId: ticket.technicianId,
          author: ticket.technicianId ? technicians.find((tech) => tech.id === ticket.technicianId)?.name ?? "ช่างซ่อมบำรุง" : "ผู้ดูแลนิคม",
          content:
            index === 0
              ? "ดิจิทัลทวินแนะนำให้ล็อกสต็อกตลับลูกปืน 6308 ก่อนจัดช่าง มอเตอร์ยังเดินเครื่องได้เฉพาะช่วงสั้นภายใต้การควบคุม"
              : "คัดกรองเบื้องต้นแล้ว และตรวจสอบสถานะอะไหล่จากคลังกลางเรียบร้อย",
        },
      }),
    ),
  );

  for (const part of parts) {
    await prisma.inventoryTransaction.create({
      data: {
        sparePartId: part.id,
        type: TransactionType.STOCK_IN,
        quantity: Math.max(4, Math.floor(part.currentStock * 0.35)),
        reference: "ยอดตั้งต้นคลังอะไหล่กลาง",
        actor: "ระบบตั้งต้นข้อมูล",
      },
    });
    if (part.reservedStock > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          sparePartId: part.id,
          type: TransactionType.RESERVE,
          quantity: part.reservedStock,
          reference: "จองไว้สำหรับงานซ่อมที่เปิดอยู่",
          ticketId: tickets.find((ticket) => ticket.requestedPartId === part.id)?.id,
          actor: "เจ้าหน้าที่คลัง",
        },
      });
    }
  }

  await Promise.all([
    prisma.alert.create({
      data: {
        factoryId: factoryB.id,
        assetId: criticalMotor.id,
        level: AlertLevel.CRITICAL,
        message: "มอเตอร์โรงงาน B มีแรงสั่นตลับลูกปืนเกินค่าเฝ้าระวังหยุดเครื่อง",
        metric: "แรงสั่นสะเทือน",
        value: 9.8,
        threshold: 7.5,
        recommendedAction: "จองตลับลูกปืน 6308 ตรวจตลับลูกปืนฝั่งขับ และจัดช่างเครื่องจักรหมุนภายใน 4 ชั่วโมง",
        createdAt: daysAgo(1),
      },
    }),
    prisma.alert.create({
      data: {
        factoryId: factoryByCode["F-D"].id,
        assetId: assetByCode["F-D-PUM-04"].id,
        level: AlertLevel.WARNING,
        message: "แนวโน้มการรั่วของซีลปั๊มเพิ่มขึ้น",
        metric: "แรงดัน",
        value: 3.1,
        threshold: 3.6,
        recommendedAction: "เตรียมซีลปั๊มเชิงกลและนัดตรวจในช่วงหยุดซ่อมถัดไป",
        createdAt: daysAgo(2),
      },
    }),
    prisma.alert.create({
      data: {
        factoryId: factoryByCode["F-C"].id,
        assetId: assetByCode["F-C-COM-01"].id,
        level: AlertLevel.WARNING,
        message: "อุณหภูมิปลายทางเครื่องอัดอากาศสูงกว่าช่วงปกติ",
        metric: "อุณหภูมิ",
        value: 76,
        threshold: 70,
        recommendedAction: "เปลี่ยนไส้กรองอากาศและตรวจการไหลเวียนลมระบายความร้อน",
        createdAt: daysAgo(3),
      },
    }),
    prisma.alert.create({
      data: {
        factoryId: factoryByCode["F-A"].id,
        assetId: assetByCode["F-A-BOI-04"].id,
        level: AlertLevel.INFO,
        message: "หม้อไอน้ำถึงกำหนดบำรุงรักษาเชิงป้องกันเดือนนี้",
        metric: "ชั่วโมงเดินเครื่อง",
        value: 3980,
        threshold: 4000,
        recommendedAction: "นัดงานบำรุงรักษาเชิงป้องกันและเตรียมปะเก็นหม้อไอน้ำ DN50",
        createdAt: daysAgo(4),
      },
    }),
  ]);

  await Promise.all([
    prisma.user.create({ data: { name: "ผู้ดูแลนิคมแหลมฉบัง", email: "admin@estate.demo", role: Role.ADMIN } }),
    prisma.user.create({ data: { name: "ผู้จัดการโรงงาน B", email: "factory-b@estate.demo", role: Role.FACTORY_USER, factoryId: factoryB.id } }),
    prisma.user.create({ data: { name: technicians[0].name, email: "tech@estate.demo", role: Role.TECHNICIAN, technicianId: technicians[0].id } }),
    prisma.user.create({ data: { name: "คลังอะไหล่กลางแหลมฉบัง", email: "warehouse@estate.demo", role: Role.WAREHOUSE } }),
  ]);

  console.log("สร้างข้อมูลเดโมนิคมอุตสาหกรรมแหลมฉบังเรียบร้อย");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
