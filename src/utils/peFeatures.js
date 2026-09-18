// Extracts PE-style features directly from a real file's bytes, in the browser.
// Used by the "Attach a file" flow so a genuine attached file drives the result
// (instead of only the three curated demo samples).
//
// When the file is a valid Windows PE (.exe/.dll/...), we parse the real
// COFF + Optional headers and section table, and compute real Shannon entropy
// from the actual section bytes. For any other file, we fall back to a
// generic byte-entropy analysis over the raw content so every file type can
// still be checked.

function shannonEntropy(bytes) {
  if (!bytes || bytes.length === 0) return 0;
  const counts = new Uint32Array(256);
  for (let i = 0; i < bytes.length; i++) counts[bytes[i]]++;
  let entropy = 0;
  const len = bytes.length;
  for (let i = 0; i < 256; i++) {
    if (counts[i] === 0) continue;
    const p = counts[i] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function round(n, d = 2) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

function findAsciiCount(bytes, needle) {
  // Naive but bounded byte-pattern search (case-insensitive ASCII).
  const n = needle.toLowerCase();
  const limit = Math.min(bytes.length, 6 * 1024 * 1024); // cap scan for perf
  let count = 0;
  let str = "";
  const chunk = 65536;
  for (let offset = 0; offset < limit; offset += chunk) {
    const end = Math.min(limit, offset + chunk + needle.length);
    let s = "";
    for (let i = offset; i < end; i++) {
      const c = bytes[i];
      s += c >= 32 && c <= 126 ? String.fromCharCode(c) : ".";
    }
    str = s;
    let idx = str.toLowerCase().indexOf(n);
    while (idx !== -1) {
      count++;
      idx = str.toLowerCase().indexOf(n, idx + n.length);
    }
  }
  return count;
}

function safeSlice(bytes, offset, length) {
  const start = Math.max(0, Math.min(offset, bytes.length));
  const end = Math.max(start, Math.min(offset + Math.max(0, length), bytes.length));
  return bytes.subarray(start, end);
}

const DATA_DIR_NAMES = [
  "Export",
  "Import",
  "Resource",
  "Exception",
  "Security",
  "BaseReloc",
  "Debug",
  "Architecture",
  "GlobalPtr",
  "TLS",
  "LoadConfig",
  "BoundImport",
  "IAT",
  "DelayImport",
  "COMDescriptor",
  "Reserved",
];

function parsePE(buffer) {
  const bytes = new Uint8Array(buffer);
  const dv = new DataView(buffer);

  if (bytes.length < 0x40 || bytes[0] !== 0x4d || bytes[1] !== 0x5a) return null; // "MZ"

  const e_lfanew = dv.getUint32(0x3c, true);
  if (e_lfanew < 0 || e_lfanew + 24 > bytes.length) return null;
  const peSig = dv.getUint32(e_lfanew, true);
  if (peSig !== 0x00004550) return null; // "PE\0\0"

  const coff = e_lfanew + 4;
  const machine = dv.getUint16(coff, true);
  const numberOfSections = dv.getUint16(coff + 2, true);
  const sizeOfOptionalHeader = dv.getUint16(coff + 16, true);
  const characteristics = dv.getUint16(coff + 18, true);

  const opt = coff + 20;
  if (opt + 2 > bytes.length) return null;
  const magic = dv.getUint16(opt, true);
  const isPlus = magic === 0x20b;
  if (magic !== 0x10b && !isPlus) return null; // not PE32 or PE32+

  const majorLinkerVersion = bytes[opt + 2];
  const minorLinkerVersion = bytes[opt + 3];
  const sizeOfCode = dv.getUint32(opt + 4, true);
  const sizeOfInitializedData = dv.getUint32(opt + 8, true);
  const sizeOfUninitializedData = dv.getUint32(opt + 12, true);
  const addressOfEntryPoint = dv.getUint32(opt + 16, true);
  const baseOfCode = dv.getUint32(opt + 20, true);

  let cursor = isPlus ? opt + 24 : opt + 32; // skip BaseOfData+ImageBase(32bit) or ImageBase(64bit)
  const imageBase = isPlus
    ? Number(dv.getBigUint64(opt + 24, true))
    : dv.getUint32(opt + 28, true);

  const sectionAlignment = dv.getUint32(cursor, true);
  cursor += 4;
  const fileAlignment = dv.getUint32(cursor, true);
  cursor += 4;
  const majorOSVersion = dv.getUint16(cursor, true);
  cursor += 2;
  const minorOSVersion = dv.getUint16(cursor, true);
  cursor += 2;
  const majorImageVersion = dv.getUint16(cursor, true);
  cursor += 2;
  const minorImageVersion = dv.getUint16(cursor, true);
  cursor += 2;
  const majorSubsystemVersion = dv.getUint16(cursor, true);
  cursor += 2;
  const minorSubsystemVersion = dv.getUint16(cursor, true);
  cursor += 2;
  cursor += 4; // Win32VersionValue
  const sizeOfImage = dv.getUint32(cursor, true);
  cursor += 4;
  const sizeOfHeaders = dv.getUint32(cursor, true);
  cursor += 4;
  const checkSum = dv.getUint32(cursor, true);
  cursor += 4;
  const subsystem = dv.getUint16(cursor, true);
  cursor += 2;
  const dllCharacteristics = dv.getUint16(cursor, true);
  cursor += 2;
  cursor += isPlus ? 32 : 16; // Stack/Heap reserve+commit
  cursor += 4; // LoaderFlags
  const numberOfRvaAndSizes = Math.min(16, dv.getUint32(cursor, true) || 0);
  cursor += 4;

  const dataDirOffset = cursor;
  const dataDirs = [];
  for (let i = 0; i < numberOfRvaAndSizes; i++) {
    const base = dataDirOffset + i * 8;
    if (base + 8 > bytes.length) break;
    dataDirs.push({
      name: DATA_DIR_NAMES[i] || `Dir${i}`,
      rva: dv.getUint32(base, true),
      size: dv.getUint32(base + 4, true),
    });
  }

  const sectionTableOffset = opt + sizeOfOptionalHeader;
  const sections = [];
  for (let i = 0; i < numberOfSections; i++) {
    const base = sectionTableOffset + i * 40;
    if (base + 40 > bytes.length) break;
    let name = "";
    for (let j = 0; j < 8; j++) {
      const c = bytes[base + j];
      if (c === 0) break;
      name += String.fromCharCode(c);
    }
    sections.push({
      name: name || `sec${i}`,
      virtualSize: dv.getUint32(base + 8, true),
      virtualAddress: dv.getUint32(base + 12, true),
      sizeOfRawData: dv.getUint32(base + 16, true),
      pointerToRawData: dv.getUint32(base + 20, true),
      characteristics: dv.getUint32(base + 36, true),
    });
  }

  const rvaToOffset = (rva) => {
    for (const s of sections) {
      const span = Math.max(s.virtualSize, s.sizeOfRawData);
      if (rva >= s.virtualAddress && rva < s.virtualAddress + span) {
        return s.pointerToRawData + (rva - s.virtualAddress);
      }
    }
    return null;
  };

  const sectionEntropies = sections.map((s) => {
    const slice = safeSlice(bytes, s.pointerToRawData, s.sizeOfRawData);
    return { ...s, entropy: shannonEntropy(slice) };
  });

  const rawSizes = sectionEntropies.map((s) => s.sizeOfRawData).filter((n) => n > 0);
  const entropies = sectionEntropies.map((s) => s.entropy);

  const dirByName = (name) => dataDirs.find((d) => d.name === name);
  const importDir = dirByName("Import");
  const resourceDir = dirByName("Resource");
  const exportDir = dirByName("Export");
  const loadConfigDir = dirByName("LoadConfig");

  let resourcesMeanEntropy = 0;
  let resourcesNb = 0;
  if (resourceDir && resourceDir.size > 0) {
    const off = rvaToOffset(resourceDir.rva);
    resourcesNb = Math.max(1, Math.round(resourceDir.size / 512));
    if (off != null) {
      resourcesMeanEntropy = shannonEntropy(safeSlice(bytes, off, resourceDir.size));
    }
  }

  const versionInfoPresent = findAsciiCount(bytes, "VS_VERSION_INFO") > 0;
  const richHeaderPresent = findAsciiCount(bytes, "Rich") > 0;

  const features = {
    Machine: machine,
    Characteristics: characteristics,
    MajorLinkerVersion: majorLinkerVersion,
    MinorLinkerVersion: minorLinkerVersion,
    MajorOperatingSystemVersion: majorOSVersion,
    MinorOperatingSystemVersion: minorOSVersion,
    MajorImageVersion: majorImageVersion,
    MinorImageVersion: minorImageVersion,
    MajorSubsystemVersion: majorSubsystemVersion,
    MinorSubsystemVersion: minorSubsystemVersion,
    SizeOfCode: sizeOfCode,
    SizeOfInitializedData: sizeOfInitializedData,
    SizeOfUninitializedData: sizeOfUninitializedData,
    SizeOfHeaders: sizeOfHeaders,
    SizeOfImage: sizeOfImage,
    AddressOfEntryPoint: addressOfEntryPoint,
    BaseOfCode: baseOfCode,
    ImageBase: imageBase,
    SectionAlignment: sectionAlignment,
    FileAlignment: fileAlignment,
    CheckSum: checkSum,
    Subsystem: subsystem,
    DllCharacteristics: dllCharacteristics,
    NumberOfRvaAndSizes: numberOfRvaAndSizes,
    SectionsNb: sections.length,
    SectionsMeanEntropy: entropies.length ? round(entropies.reduce((a, b) => a + b, 0) / entropies.length) : 0,
    SectionsMinEntropy: entropies.length ? round(Math.min(...entropies)) : 0,
    SectionsMaxEntropy: entropies.length ? round(Math.max(...entropies)) : 0,
    SectionsMeanSize: rawSizes.length ? Math.round(rawSizes.reduce((a, b) => a + b, 0) / rawSizes.length) : 0,
    SectionsMinSize: rawSizes.length ? Math.min(...rawSizes) : 0,
    SectionsMaxSize: rawSizes.length ? Math.max(...rawSizes) : 0,
    ImportsNb: importDir && importDir.size > 0 ? Math.max(1, Math.round(importDir.size / 20)) : 0,
    ExportsNb: exportDir && exportDir.size > 0 ? Math.max(1, Math.round(exportDir.size / 40)) : 0,
    ResourcesNb: resourcesNb,
    ResourcesMeanEntropy: round(resourcesMeanEntropy),
    ResourcesMinEntropy: round(resourcesMeanEntropy),
    ResourcesMaxEntropy: round(resourcesMeanEntropy),
    ResourcesMeanSize: resourceDir ? resourceDir.size : 0,
    LoadConfigurationSize: loadConfigDir ? loadConfigDir.size : 0,
    VersionInformationSize: versionInfoPresent ? 812 : 0,
  };

  return {
    features,
    meta: {
      isPE: true,
      isPlus,
      sectionsFound: sections.map((s) => s.name),
      hasVersionInfo: versionInfoPresent,
      hasRichHeader: richHeaderPresent,
      overallEntropy: round(shannonEntropy(bytes)),
    },
  };
}

function genericFileFeatures(buffer, fileName) {
  const bytes = new Uint8Array(buffer);
  const chunkCount = 6;
  const chunkSize = Math.max(1, Math.floor(bytes.length / chunkCount));
  const entropies = [];
  const sizes = [];
  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize;
    const end = i === chunkCount - 1 ? bytes.length : start + chunkSize;
    const slice = bytes.subarray(start, Math.max(start, end));
    if (slice.length === 0) continue;
    entropies.push(shannonEntropy(slice));
    sizes.push(slice.length);
  }
  const overall = shannonEntropy(bytes);
  const ext = (fileName.split(".").pop() || "").toLowerCase();
  const scriptLike = ["js", "vbs", "ps1", "bat", "sh", "py", "hta"].includes(ext);

  const features = {
    Machine: 0,
    Characteristics: 0,
    MajorLinkerVersion: 0,
    MinorLinkerVersion: 0,
    MajorOperatingSystemVersion: 0,
    MinorOperatingSystemVersion: 0,
    MajorImageVersion: 0,
    MinorImageVersion: 0,
    MajorSubsystemVersion: 0,
    MinorSubsystemVersion: 0,
    SizeOfCode: bytes.length,
    SizeOfInitializedData: Math.round(bytes.length * 0.3),
    SizeOfUninitializedData: 0,
    SizeOfHeaders: 0,
    SizeOfImage: bytes.length,
    AddressOfEntryPoint: 0,
    BaseOfCode: 0,
    ImageBase: 0,
    SectionAlignment: 0,
    FileAlignment: 0,
    CheckSum: 0,
    Subsystem: 0,
    DllCharacteristics: scriptLike ? 0 : 320,
    NumberOfRvaAndSizes: 0,
    SectionsNb: entropies.length,
    SectionsMeanEntropy: entropies.length ? round(entropies.reduce((a, b) => a + b, 0) / entropies.length) : round(overall),
    SectionsMinEntropy: entropies.length ? round(Math.min(...entropies)) : round(overall),
    SectionsMaxEntropy: entropies.length ? round(Math.max(...entropies)) : round(overall),
    SectionsMeanSize: sizes.length ? Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length) : bytes.length,
    SectionsMinSize: sizes.length ? Math.min(...sizes) : bytes.length,
    SectionsMaxSize: sizes.length ? Math.max(...sizes) : bytes.length,
    ImportsNb: scriptLike ? 4 : Math.min(220, Math.round(bytes.length / 6000)),
    ExportsNb: 0,
    ResourcesNb: Math.min(60, Math.round(bytes.length / 20000)),
    ResourcesMeanEntropy: round(overall),
    ResourcesMinEntropy: round(overall),
    ResourcesMaxEntropy: round(overall),
    ResourcesMeanSize: 0,
    LoadConfigurationSize: 0,
    VersionInformationSize: 0,
  };

  return {
    features,
    meta: {
      isPE: false,
      sectionsFound: [],
      hasVersionInfo: false,
      hasRichHeader: false,
      overallEntropy: round(overall),
    },
  };
}

const MAX_BYTES = 60 * 1024 * 1024; // 60 MB safety cap for in-browser parsing

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsArrayBuffer(file);
  });
}

// Extracts a PE-style feature vector from a real File object.
// Resolves to { features, meta } — never rejects for parse issues (falls back
// to generic byte analysis instead), but rejects if the file cannot be read
// or is empty / too large.
export async function extractFeaturesFromFile(file) {
  if (!file) throw new Error("no-file");
  if (file.size === 0) throw new Error("empty-file");
  if (file.size > MAX_BYTES) throw new Error("file-too-large");

  const buffer = await readFileAsArrayBuffer(file);

  let parsed = null;
  try {
    parsed = parsePE(buffer);
  } catch {
    parsed = null;
  }

  const result = parsed || genericFileFeatures(buffer, file.name || "file");
  return {
    features: result.features,
    meta: {
      ...result.meta,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || "unknown",
    },
  };
}
