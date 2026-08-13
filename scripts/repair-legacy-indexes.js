const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", "src", ".env") });

const legacyIndexes = [
  {
    collection: "payments",
    name: "studentId_1_groupId_1_cycleStart_1_cycleEnd_1",
    key: { studentId: 1, groupId: 1, cycleStart: 1, cycleEnd: 1 },
  },
  {
    collection: "attendances",
    name: "studentId_1_sessionId_1",
    key: { studentId: 1, sessionId: 1 },
  },
];

const activeIndexes = [
  {
    collection: "payments",
    name: "studentId_1_groupId_1_sessionDate_1",
    key: { studentId: 1, groupId: 1, sessionDate: 1 },
  },
  {
    collection: "attendances",
    name: "studentId_1_groupId_1_date_1",
    key: { studentId: 1, groupId: 1, date: 1 },
  },
];

const shouldApply = process.argv.includes("--apply");

const hasExpectedKey = (index, expectedKey) => {
  const indexEntries = Object.entries(index.key || {});
  const expectedEntries = Object.entries(expectedKey);

  return indexEntries.length === expectedEntries.length
    && indexEntries.every(([key, value], position) =>
      key === expectedEntries[position][0] && value === expectedEntries[position][1]
    );
};

async function repairLegacyIndexes() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const database = mongoose.connection.db;

    for (const legacyIndex of legacyIndexes) {
      const collection = database.collection(legacyIndex.collection);
      const indexes = await collection.indexes();
      const index = indexes.find((candidate) => candidate.name === legacyIndex.name);

      if (!index) {
        console.log(`No legacy index found: ${legacyIndex.collection}.${legacyIndex.name}`);
        continue;
      }

      if (!hasExpectedKey(index, legacyIndex.key)) {
        throw new Error(
          `Refusing to drop ${legacyIndex.collection}.${legacyIndex.name}: its key does not match the expected legacy key.`
        );
      }

      if (!shouldApply) {
        console.log(`[dry-run] Would drop ${legacyIndex.collection}.${legacyIndex.name}`);
        continue;
      }

      await collection.dropIndex(legacyIndex.name);
      console.log(`Dropped ${legacyIndex.collection}.${legacyIndex.name}`);
    }

    for (const activeIndex of activeIndexes) {
      const indexes = await database.collection(activeIndex.collection).indexes();
      const index = indexes.find((candidate) => candidate.name === activeIndex.name);

      if (!index || !hasExpectedKey(index, activeIndex.key)) {
        throw new Error(
          `The required index ${activeIndex.collection}.${activeIndex.name} is missing or has an unexpected key.`
        );
      }

      console.log(`Verified ${activeIndex.collection}.${activeIndex.name}`);
    }
  } finally {
    await mongoose.disconnect();
  }
}

repairLegacyIndexes().catch((error) => {
  console.error(`Legacy-index repair failed: ${error.message}`);
  process.exitCode = 1;
});
