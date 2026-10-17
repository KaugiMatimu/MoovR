const { DataTypes, Op } = require("sequelize");
const { randomUUID } = require("crypto");
const sequelize = require("../config/database");

const json = (defaultValue) => ({ type: DataTypes.JSONB, allowNull: false, defaultValue });
const id = () => ({ type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 });
const ref = () => ({ type: DataTypes.UUID, allowNull: true });

function defineModel(name, tableName, attributes) {
  const model = sequelize.define(name, { id: id(), ...attributes }, {
    tableName,
    timestamps: false,
  });

  Object.defineProperty(model.prototype, "_id", {
    get() { return this.getDataValue("id"); },
    set(value) { this.setDataValue("id", value); },
  });
  model.prototype.toObject = function () { return this.toJSON(); };
  const serialize = model.prototype.toJSON;
  model.prototype.toJSON = function () {
    const result = serialize.call(this);
    result._id = result.id;
    for (const association of Object.values(model.associations)) {
      if (association.associationType === "BelongsTo" && result[association.as] != null) {
        result[association.foreignKey] = result[association.as];
        delete result[association.as];
      }
    }
    return result;
  };

  addMongoCompatibility(model);
  return model;
}

function fieldName(name) {
  return name === "_id" ? "id" : name;
}

function normalizeIdValue(value, primaryKey = "id") {
  if (value && typeof value === "object") {
    if (typeof value.getDataValue === "function") return value.getDataValue(primaryKey);
    return value[primaryKey] ?? value._id ?? value.id;
  }
  return value;
}

function convertWhere(where) {
  if (!where || typeof where !== "object" || where instanceof Date || Array.isArray(where)) return where;
  const converted = {};
  for (const [key, value] of Object.entries(where)) {
    if (key === "$or" || key === "$and" || key === "$not") {
      converted[{ $or: Op.or, $and: Op.and, $not: Op.not }[key]] = Array.isArray(value)
        ? value.map(convertWhere)
        : convertWhere(value);
      continue;
    }
    if (key.startsWith("$")) continue;
    if (key.includes(".")) {
      throw new Error(`Nested filter '${key}' must be rewritten for PostgreSQL.`);
    }
    const target = fieldName(key);
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const operators = {};
      let hasOperator = false;
      for (const [operator, operand] of Object.entries(value)) {
        const mapped = {
          $eq: Op.eq,
          $ne: Op.ne,
          $in: Op.in,
          $nin: Op.notIn,
          $gt: Op.gt,
          $gte: Op.gte,
          $lt: Op.lt,
          $lte: Op.lte,
        }[operator];
        if (mapped) {
          hasOperator = true;
          operators[mapped] = operand;
        } else if (operator === "$exists") {
          hasOperator = true;
          operators[operand ? Op.not : Op.is] = null;
        }
      }
      converted[target] = hasOperator ? operators : value;
    } else {
      converted[target] = value;
    }
  }
  return converted;
}

function parseAttributes(selection, model) {
  if (!selection) return undefined;
  if (Array.isArray(selection)) return [...new Set(["id", ...selection.map(fieldName)])];
  if (typeof selection !== "string") return selection;
  const fields = selection.trim().split(/\s+/).filter(Boolean);
  if (fields.some((field) => field.startsWith("-"))) {
    const excluded = new Set(fields.filter((field) => field.startsWith("-")).map((field) => fieldName(field.slice(1))));
    return Object.keys(model.rawAttributes).filter((field) => !excluded.has(field));
  }
  return [...new Set(["id", ...fields.map(fieldName)])];
}

function parseInclude(model, path, attributes, nested) {
  const aliases = {
    "User.documents.drivingLicense": "drivingLicenseDocument",
    "User.documents.proofOfResidency": "proofOfResidencyDocument",
    "User.documents.vehicleRegistrationBook": "vehicleRegistrationBookDocument",
    "User.documents.vehicleInsurance": "vehicleInsuranceDocument",
    "User.documents.cnicFront": "cnicFrontDocument",
  };
  const fullPath = `${model.name}.${path}`;
  const relationAliases = {
    Ride: { user: "userRecord", driver: "driverRecord" },
    Package: { user: "userRecord", driver: "driverRecord" },
    DriverBooking: { user: "userRecord", driver: "driverRecord" },
    Reservation: { user: "userRecord" },
    IntercityRide: { user: "userRecord", driver: "driverRecord" },
    CarListing: { driverId: "driverRecord" },
    Wallet: { user: "userRecord" },
    Review: { reviewer: "reviewerRecord", driver: "driverRecord", ride: "rideRecord" },
    Share: { ride: "rideRecord", createdBy: "createdByRecord" },
    Notification: { recipient: "recipientRecord" },
    Activity: { user: "userRecord" },
    EmergencyLog: { user: "userRecord", ride: "rideRecord" },
  };
  const directPath = aliases[fullPath] || relationAliases[model.name]?.[path] || path;
  const separator = directPath.indexOf(".");
  const alias = separator < 0 ? directPath : directPath.slice(0, separator);
  const rest = separator < 0 ? null : directPath.slice(separator + 1);
  const association = model.associations[alias];
  if (!association) return null;
  const include = { association };
  const selected = parseAttributes(attributes, model);
  if (selected) include.attributes = selected;
  if (rest) {
    const child = parseInclude(association.target, rest, undefined, nested);
    if (child) include.include = [child];
  }
  if (nested) {
    const nestedPaths = Array.isArray(nested) ? nested : [nested];
    include.include = [
      ...(include.include || []),
      ...nestedPaths.map((entry) => parseInclude(association.target, entry.path, entry.select, entry.populate)).filter(Boolean),
    ];
  }
  return include;
}

class MongoQuery {
  constructor(model, kind, where, options = {}) {
    this.model = model;
    this.kind = kind;
    this.where = where || {};
    this.options = { ...options };
    this.populatePaths = [];
  }

  populate(path, selection) {
    if (typeof path === "string") {
      const paths = path.trim().split(/\s+/).filter(Boolean);
      this.populatePaths.push(...paths.map((entry) => ({ path: entry, select: selection })));
    } else if (path && typeof path === "object") {
      this.populatePaths.push({ path: path.path, select: path.select, populate: path.populate });
    }
    return this;
  }

  sort(order) {
    const entries = Object.entries(order || {}).map(([key, direction]) => [fieldName(key), Number(direction) < 0 ? "DESC" : "ASC"]);
    this.options.order = entries;
    return this;
  }

  skip(value) { this.options.offset = Number(value) || 0; return this; }
  limit(value) { this.options.limit = Number(value) || 0; return this; }
  select(value) { this.options.attributes = parseAttributes(value, this.model); return this; }
  lean() { return this; }

  async exec() {
    const options = { ...this.options };
    const offset = Number(options.offset) || 0;
    const limit = Number(options.limit);
    const geoFilters = this.kind === "byId"
      ? []
      : Object.entries(this.where).filter(([, value]) => value?.$near);
    const queryWhere = { ...this.where };
    for (const [field] of geoFilters) delete queryWhere[field];
    if (this.kind !== "byId") options.where = convertWhere(queryWhere);
    if (geoFilters.length) {
      delete options.limit;
      delete options.offset;
      delete options.order;
    }
    const includes = this.populatePaths
      .map((entry) => parseInclude(this.model, entry.path, entry.select, entry.populate))
      .filter(Boolean);
    if (includes.length) options.include = [...(options.include || []), ...includes];
    if (this.kind === "byId") {
      const primaryKey = this.model.primaryKeyAttribute;
      const idValue = normalizeIdValue(this.where, primaryKey);
      const row = await this.model.sequelizeFindOne({
        ...options,
        where: { [primaryKey]: idValue },
      });
      return this.applyPopulation(row);
    }
    const rows = this.kind === "one" && !geoFilters.length
      ? await this.model.sequelizeFindOne(options)
      : await this.model.findAll(options);
    if (geoFilters.length) {
      const distanceBetween = (first, second) => {
        const toRadians = (degrees) => degrees * Math.PI / 180;
        const [firstLng, firstLat] = first;
        const [secondLng, secondLat] = second;
        const latitudeDelta = toRadians(secondLat - firstLat);
        const longitudeDelta = toRadians(secondLng - firstLng);
        const value = Math.sin(latitudeDelta / 2) ** 2
          + Math.cos(toRadians(firstLat)) * Math.cos(toRadians(secondLat))
          * Math.sin(longitudeDelta / 2) ** 2;
        return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
      };
      const [field, near] = geoFilters[0];
      const origin = near.$geometry?.coordinates;
      const maxDistance = Number.isFinite(Number(near.$maxDistance))
        ? Number(near.$maxDistance)
        : Infinity;
      const nearby = rows.map((row) => {
        const coordinates = row.getDataValue(field)?.coordinates;
        const distance = Array.isArray(origin) && Array.isArray(coordinates)
          ? distanceBetween(origin, coordinates)
          : Infinity;
        return { row, distance };
      }).filter(({ distance }) => distance <= maxDistance)
        .sort((first, second) => first.distance - second.distance)
        .map(({ row }) => row);
      const filtered = nearby.slice(offset, limit > 0 ? offset + limit : undefined);
      return this.kind === "one"
        ? this.applyPopulation(filtered[0] || null)
        : Promise.all(filtered.map((row) => this.applyPopulation(row)));
    }
    if (Array.isArray(rows)) {
      await Promise.all(rows.map((row) => this.applyPopulation(row)));
      return rows;
    }
    return this.applyPopulation(rows);
  }

  async applyPopulation(row) {
    if (!row) return row;
    for (const association of Object.values(this.model.associations)) {
      if (association.associationType !== "BelongsTo" || !row.getDataValue(association.as)) continue;
      const field = association.foreignKey;
      Object.defineProperty(row, field, {
        configurable: true,
        get() { return this.getDataValue(association.as) || this.getDataValue(field); },
        set(value) {
          if (value && typeof value === "object") this.setDataValue(association.as, value);
          else this.setDataValue(field, value);
        },
      });
    }
    if (this.model.name === "User") {
      const documents = { ...(row.getDataValue("documents") || {}) };
      const documentAliases = {
        drivingLicense: "drivingLicenseDocument",
        proofOfResidency: "proofOfResidencyDocument",
        vehicleRegistrationBook: "vehicleRegistrationBookDocument",
        vehicleInsurance: "vehicleInsuranceDocument",
        cnicFront: "cnicFrontDocument",
      };
      for (const [field, alias] of Object.entries(documentAliases)) {
        const record = row.getDataValue(alias);
        if (record) documents[field] = record.toJSON();
      }
      row.setDataValue("documents", documents);
    }
    const rentalUserPath = this.populatePaths.some((entry) => entry.path === "rentalPeriods.user");
    if (this.model.name === "CarListing" && rentalUserPath) {
      const periods = row.getDataValue("rentalPeriods") || [];
      const ids = [...new Set(periods.map((period) => period.user).filter(Boolean).map(String))];
      if (ids.length) {
        const users = await models.User.findAll({ where: { id: ids }, attributes: ["id", "firstName", "lastName"] });
        const byId = new Map(users.map((user) => [String(user.id), user.toJSON()]));
        row.setDataValue("rentalPeriods", periods.map((period) => ({
          ...period,
          user: byId.get(String(period.user)) || period.user,
        })));
      }
    }
    return row;
  }

  then(resolve, reject) { return this.exec().then(resolve, reject); }
  catch(reject) { return this.exec().catch(reject); }
}

function setPath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  for (const part of parts.slice(0, -1)) current = current[part] ||= {};
  current[parts[parts.length - 1]] = value;
}

function applyUpdate(instance, update) {
  const values = { ...update };
  const jsonFields = new Set(["documents", "location", "emergencyContacts", "reviews", "rides", "packages", "transactions", "rentalPeriods", "pickupCoordinates", "dropoffCoordinates", "coords", "data"]);
  for (const [operator, entries] of Object.entries(update || {})) {
    if (!operator.startsWith("$")) continue;
    delete values[operator];
    for (const [field, value] of Object.entries(entries || {})) {
      const key = fieldName(field);
      if (operator === "$set") {
        if (field.includes(".")) {
          const root = field.split(".")[0];
          const nested = { ...(instance.getDataValue(root) || {}) };
          setPath(nested, field.slice(root.length + 1), value);
          values[root] = nested;
        } else values[key] = value;
      } else if (operator === "$inc") {
        values[key] = Number(instance.getDataValue(key) || 0) + Number(value);
      } else if (["$push", "$addToSet"].includes(operator)) {
        const current = [...(instance.getDataValue(key) || [])];
        const items = value && value.$each ? value.$each : [value];
        for (const item of items) {
          if (operator === "$push" || !current.some((entry) => JSON.stringify(entry) === JSON.stringify(item))) current.push(item);
        }
        values[key] = current;
      } else if (operator === "$pull") {
        const current = instance.getDataValue(key) || [];
        values[key] = current.filter((entry) => JSON.stringify(entry) !== JSON.stringify(value));
      } else if (operator === "$unset") {
        values[key] = jsonFields.has(key) ? {} : null;
      }
    }
  }
  instance.set(values);
}

function addMongoCompatibility(model) {
  model.sequelizeFindOne = model.findOne.bind(model);
  model.find = (where = {}, options = {}) => new MongoQuery(model, "many", where, options);
  model.findOne = (where = {}, options = {}) => new MongoQuery(model, "one", where, options);
  model.findById = (idValue, options = {}) => new MongoQuery(model, "byId", idValue, options);
  model.findByIdAndUpdate = async (idValue, update, options = {}) => {
    const instance = await model.findByPk(normalizeIdValue(idValue, model.primaryKeyAttribute));
    if (!instance) return null;
    applyUpdate(instance, update);
    await instance.save();
    return instance;
  };
  model.findOneAndUpdate = async (where, update) => {
    const instance = await model.sequelizeFindOne({ where: convertWhere(where) });
    if (!instance) return null;
    applyUpdate(instance, update);
    await instance.save();
    return instance;
  };
  model.findByIdAndDelete = async (idValue) => {
    const instance = await model.findByPk(normalizeIdValue(idValue, model.primaryKeyAttribute));
    if (instance) await instance.destroy();
    return instance;
  };
  model.findOneAndDelete = async (where) => {
    const instance = await model.sequelizeFindOne({ where: convertWhere(where) });
    if (instance) await instance.destroy();
    return instance;
  };
  model.deleteOne = async (where) => {
    const instance = await model.sequelizeFindOne({ where: convertWhere(where) });
    if (instance) await instance.destroy();
    return { deletedCount: instance ? 1 : 0 };
  };
  model.updateMany = async (where, update) => {
    const instances = await model.findAll({ where: convertWhere(where) });
    for (const instance of instances) {
      applyUpdate(instance, update);
      await instance.save();
    }
    return { modifiedCount: instances.length };
  };
  model.countDocuments = (where = {}) => model.count({ where: convertWhere(where) });
}

const models = {
  User: defineModel("User", "users", {
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: "user" },
    profilePicture: DataTypes.TEXT,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    city: DataTypes.STRING,
    referralCode: DataTypes.STRING,
    driverType: DataTypes.STRING,
    serviceType: DataTypes.STRING,
    carCategory: DataTypes.STRING,
    verificationStatus: { type: DataTypes.STRING, defaultValue: "pending" },
    termsAccepted: { type: DataTypes.BOOLEAN, defaultValue: false },
    documents: json({}),
    availability: { type: DataTypes.BOOLEAN, defaultValue: true },
    reviews: json([]),
    wallet: ref(),
    rides: json([]),
    packages: json([]),
    otp: DataTypes.STRING,
    otpExpiry: DataTypes.DATE,
    fcmToken: DataTypes.STRING,
    firebaseUid: DataTypes.STRING,
    emergencyContacts: json([]),
    rentalVerification: json({}),
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    location: json({}),
    hourlyPrice: { type: DataTypes.FLOAT, defaultValue: 0 },
    ratingAverage: { type: DataTypes.FLOAT, defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  }),
  Ride: defineModel("Ride", "rides", {
    user: { ...ref(), allowNull: false }, driver: ref(),
    pickupLocation: { type: DataTypes.STRING, allowNull: false },
    dropoffLocation: { type: DataTypes.STRING, allowNull: false },
    pickupPlaceId: DataTypes.STRING, dropoffPlaceId: DataTypes.STRING,
    pickupCoordinates: json({}), dropoffCoordinates: json({}),
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    fare: DataTypes.FLOAT, toll: { type: DataTypes.FLOAT, defaultValue: 0 },
    commission: { type: DataTypes.FLOAT, defaultValue: 0 }, fuelCost: { type: DataTypes.FLOAT, defaultValue: 0 },
    driverProfit: { type: DataTypes.FLOAT, defaultValue: 0 }, city: { type: DataTypes.STRING, defaultValue: "Lagos" },
    vehicleType: { type: DataTypes.STRING, allowNull: false }, estimatedTime: DataTypes.FLOAT,
    distance: DataTypes.FLOAT, pickupType: { type: DataTypes.STRING, defaultValue: "now" },
    scheduleTime: DataTypes.DATE, paymentMethod: { type: DataTypes.STRING, defaultValue: "Cash" },
    paymentStatus: { type: DataTypes.STRING, defaultValue: "pending" }, isRated: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  Package: defineModel("Package", "packages", {
    user: { ...ref(), allowNull: false }, driver: ref(), pickupLocation: { type: DataTypes.STRING, allowNull: false },
    dropoffLocation: { type: DataTypes.STRING, allowNull: false }, pickupCoordinates: json({}), dropoffCoordinates: json({}),
    pickupPlaceId: DataTypes.STRING, dropoffPlaceId: DataTypes.STRING, packageDetails: { type: DataTypes.STRING, allowNull: false },
    paymentMethod: { type: DataTypes.STRING, defaultValue: "Cash" }, paymentStatus: { type: DataTypes.STRING, defaultValue: "pending" },
    status: { type: DataTypes.STRING, defaultValue: "pending" }, fare: { type: DataTypes.FLOAT, allowNull: false },
    commission: { type: DataTypes.FLOAT, defaultValue: 0 }, driverProfit: { type: DataTypes.FLOAT, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  DriverBooking: defineModel("DriverBooking", "driver_bookings", {
    user: { ...ref(), allowNull: false }, driver: { ...ref(), allowNull: false }, location: { type: DataTypes.STRING, allowNull: false },
    carName: { type: DataTypes.STRING, allowNull: false }, carNumber: { type: DataTypes.STRING, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false }, endTime: { type: DataTypes.DATE, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false }, commission: { type: DataTypes.FLOAT, defaultValue: 0 },
    driverProfit: { type: DataTypes.FLOAT, defaultValue: 0 }, paymentMethod: { type: DataTypes.STRING, allowNull: false },
    paymentStatus: { type: DataTypes.STRING, defaultValue: "pending" }, status: { type: DataTypes.STRING, defaultValue: "pending" },
  }),
  Reservation: defineModel("Reservation", "reservations", {
    user: { ...ref(), allowNull: false }, pickupLocation: { type: DataTypes.STRING, allowNull: false },
    dropoffLocation: { type: DataTypes.STRING, allowNull: false }, pickupCoordinates: json({}), dropoffCoordinates: json({}),
    pickupTime: { type: DataTypes.DATE, allowNull: false }, status: { type: DataTypes.STRING, defaultValue: "reserved" },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  IntercityRide: defineModel("IntercityRide", "intercity_rides", {
    user: { ...ref(), allowNull: false }, driver: ref(), pickupLocation: { type: DataTypes.STRING, allowNull: false },
    dropoffLocation: { type: DataTypes.STRING, allowNull: false }, pickupCoordinates: json({}), dropoffCoordinates: json({}),
    pickupPlaceId: DataTypes.STRING, dropoffPlaceId: DataTypes.STRING, status: { type: DataTypes.STRING, defaultValue: "pending" },
    paymentMethod: { type: DataTypes.STRING, defaultValue: "Cash" }, paymentStatus: { type: DataTypes.STRING, defaultValue: "pending" },
    fare: { type: DataTypes.FLOAT, allowNull: false }, commission: { type: DataTypes.FLOAT, defaultValue: 0 },
    driverProfit: { type: DataTypes.FLOAT, defaultValue: 0 }, distance: { type: DataTypes.FLOAT, allowNull: false },
    estimatedTime: DataTypes.FLOAT, pickupType: { type: DataTypes.STRING, defaultValue: "now" }, scheduleTime: DataTypes.DATE,
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  CarListing: defineModel("CarListing", "car_listings", {
    driverId: { ...ref(), allowNull: false }, vehicleName: { type: DataTypes.STRING, allowNull: false },
    make: { type: DataTypes.STRING, allowNull: false }, model: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false }, price: { type: DataTypes.FLOAT, allowNull: false },
    image: { type: DataTypes.TEXT, allowNull: false }, status: { type: DataTypes.STRING, defaultValue: "inactive" },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }, rentalPeriods: json([]),
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  Wallet: defineModel("Wallet", "wallets", {
    user: { ...ref(), allowNull: false }, balance: { type: DataTypes.FLOAT, defaultValue: 0 }, transactions: json([]),
  }),
  Review: defineModel("Review", "reviews", {
    rating: { type: DataTypes.FLOAT, allowNull: false }, comment: { type: DataTypes.TEXT, allowNull: false },
    reviewer: { ...ref(), allowNull: false }, driver: { ...ref(), allowNull: false }, ride: ref(),
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  Share: defineModel("Share", "shares", {
    ride: { ...ref(), allowNull: false }, token: { type: DataTypes.STRING, allowNull: false, unique: true },
    createdBy: ref(), expiresAt: DataTypes.DATE, createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  Notification: defineModel("Notification", "notifications", {
    recipient: { ...ref(), allowNull: false }, title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false }, type: { type: DataTypes.STRING, defaultValue: "system" },
    data: json({}), isRead: { type: DataTypes.BOOLEAN, defaultValue: false }, createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  Activity: defineModel("Activity", "activities", {
    user: { ...ref(), allowNull: false }, message: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, hide: { type: DataTypes.BOOLEAN, defaultValue: false },
  }),
  EmergencyLog: defineModel("EmergencyLog", "emergency_logs", {
    user: { ...ref(), allowNull: false }, ride: ref(), coords: json({}), message: DataTypes.TEXT,
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
  }),
  DrivingLicense: defineModel("DrivingLicense", "driving_licenses", {
    user: { ...ref(), allowNull: false }, imageUrl: { type: DataTypes.TEXT, allowNull: false }, uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  ProofOfResidency: defineModel("ProofOfResidency", "proof_of_residencies", {
    user: { ...ref(), allowNull: false }, imageUrl: { type: DataTypes.TEXT, allowNull: false }, uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  VehicleInsurance: defineModel("VehicleInsurance", "vehicle_insurances", {
    user: { ...ref(), allowNull: false }, insuranceName: { type: DataTypes.STRING, allowNull: false },
    policyNumber: { type: DataTypes.STRING, allowNull: false }, policyStartDate: { type: DataTypes.DATE, allowNull: false },
    policyExpiryDate: { type: DataTypes.DATE, allowNull: false }, policyCoverage: { type: DataTypes.STRING, allowNull: false },
    certificate: { type: DataTypes.TEXT, allowNull: false }, uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  VehicleRegistrationBook: defineModel("VehicleRegistrationBook", "vehicle_registration_books", {
    user: { ...ref(), allowNull: false }, ownerName: { type: DataTypes.STRING, allowNull: false },
    registrationNumber: { type: DataTypes.STRING, allowNull: false }, vehicleMakeModel: { type: DataTypes.STRING, allowNull: false },
    registrationDate: { type: DataTypes.DATE, allowNull: false }, registrationExpiryDate: { type: DataTypes.DATE, allowNull: false },
    registrationBook: { type: DataTypes.TEXT, allowNull: false }, uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
  CNICFront: defineModel("CNICFront", "cnic_fronts", {
    user: { ...ref(), allowNull: false }, imageUrl: { type: DataTypes.TEXT, allowNull: false }, uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }),
};

models.Wallet.addHook("beforeSave", (wallet) => {
  wallet.transactions = (wallet.transactions || []).map((transaction) => ({
    ...transaction,
    _id: transaction._id || transaction.id || randomUUID(),
    date: transaction.date || new Date(),
    status: transaction.status || (transaction.type === "debit" ? "pending" : "approved"),
  }));
});

const belongsToUser = (model, alias, foreignKey) => model.belongsTo(models.User, { as: `${alias}Record`, foreignKey });
belongsToUser(models.Ride, "user", "user");
belongsToUser(models.Ride, "driver", "driver");
belongsToUser(models.Package, "user", "user");
belongsToUser(models.Package, "driver", "driver");
belongsToUser(models.DriverBooking, "user", "user");
belongsToUser(models.DriverBooking, "driver", "driver");
belongsToUser(models.Reservation, "user", "user");
belongsToUser(models.IntercityRide, "user", "user");
belongsToUser(models.IntercityRide, "driver", "driver");
belongsToUser(models.CarListing, "driverId", "driverId");
belongsToUser(models.Wallet, "user", "user");
belongsToUser(models.Review, "reviewer", "reviewer");
belongsToUser(models.Review, "driver", "driver");
belongsToUser(models.Share, "createdBy", "createdBy");
belongsToUser(models.Notification, "recipient", "recipient");
belongsToUser(models.Activity, "user", "user");
belongsToUser(models.EmergencyLog, "user", "user");
belongsToUser(models.DrivingLicense, "user", "user");
belongsToUser(models.ProofOfResidency, "user", "user");
belongsToUser(models.VehicleInsurance, "user", "user");
belongsToUser(models.VehicleRegistrationBook, "user", "user");
belongsToUser(models.CNICFront, "user", "user");
models.Share.belongsTo(models.Ride, { as: "rideRecord", foreignKey: "ride" });
models.Review.belongsTo(models.Ride, { as: "rideRecord", foreignKey: "ride" });
models.EmergencyLog.belongsTo(models.Ride, { as: "rideRecord", foreignKey: "ride" });
models.User.hasOne(models.DrivingLicense, { as: "drivingLicenseDocument", foreignKey: "user" });
models.User.hasOne(models.ProofOfResidency, { as: "proofOfResidencyDocument", foreignKey: "user" });
models.User.hasOne(models.VehicleInsurance, { as: "vehicleInsuranceDocument", foreignKey: "user" });
models.User.hasOne(models.VehicleRegistrationBook, { as: "vehicleRegistrationBookDocument", foreignKey: "user" });
models.User.hasOne(models.CNICFront, { as: "cnicFrontDocument", foreignKey: "user" });

module.exports = { sequelize, ...models, convertWhere };
