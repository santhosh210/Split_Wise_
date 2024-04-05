const mongoose = require("mongoose");
const User = require("../models/User");
const Group = require("../models/Group");
const Expense = require("../models/Expense");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const create = async (collection, document) => {
  console.log(document);
  try {
    const model = mongoose.model(collection);
    const createdDocument = await model.create(document);
    console.log(
      `${collection} document created successfully:`,
      createdDocument
    );
    return createdDocument;
  } catch (error) {
    console.error(`Error creating ${collection} document:`, error);
    throw error;
  }
};

const find = async (collection, filter, options) => {
  try {
    const model = mongoose.model(collection);
    const query = model.find(filter);

    if (options) {
      if (options.projection) query.select(options.projection);
      if (options.select) query.select(options.select);
      if (options.sort) query.sort(options.sort);
      if (options.skip) query.skip(options.skip);
      if (options.limit) query.limit(options.limit);
    }

    const documents = await query.exec();
    return documents;
  } catch (error) {
    console.error(`Error finding ${collection} documents:`, error);
    throw error;
  }
};

const findOne = async (collection, conditions, options) => {
  try {
    const model = mongoose.model(collection);
    const query = model.findOne(conditions);

    if (options) {
      if (options.projection) query.select(options.projection);
      if (options.select) query.select(options.select);
      if (options.sort) query.sort(options.sort);
    }

    const document = await query.exec();
    return document;
  } catch (error) {
    console.error(`Error finding ${collection} document:`, error);
    throw error;
  }
};

const updateOne = async (collection, filter, update, options) => {
  try {
    const model = mongoose.model(collection);
    const result = await model.updateOne(filter, update, options);
    console.log(
      `${result.nModified} document updated in ${collection} collection`
    );
    return result;
  } catch (error) {
    console.error(`Error updating ${collection} document:`, error);
    throw error;
  }
};

const updateMany = async (collection, filter, update, options) => {
  try {
    const model = mongoose.model(collection);
    const result = await model.updateMany(filter, update, options);
    console.log(
      `${result.nModified} documents updated in ${collection} collection`
    );
    return result;
  } catch (error) {
    console.error(`Error updating ${collection} documents:`, error);
    throw error;
  }
};

const findOneAndUpdate = async (
  collection,
  conditions,
  update,
  options,
  select
) => {
  try {
    const model = mongoose.model(collection);
    const query = model.findOneAndUpdate(conditions, update, options);

    if (select) query.select(select);

    const document = await query.exec();
    return document;
  } catch (error) {
    console.error(`Error updating and finding ${collection} document:`, error);
    throw error;
  }
};

const findOneAndDelete = async (collection, conditions) => {
  try {
    const model = mongoose.model(collection);
    const document = await model.findOneAndDelete(conditions);
    console.log(`${collection} document deleted successfully:`, document);
    return document;
  } catch (error) {
    console.error(`Error deleting ${collection} document:`, error);
    throw error;
  }
};

const countDocuments = async (collection, filter) => {
  try {
    const model = mongoose.model(collection);
    const count = await model.countDocuments(filter);
    return count;
  } catch (error) {
    console.error(
      `Error counting documents in ${collection} collection:`,
      error
    );
    throw error;
  }
};

const aggregate = async (collection, options) => {
  try {
    const model = mongoose.model(collection);
    const result = await model.aggregate(options);
    return result;
  } catch (error) {
    console.error(
      `Error aggregating documents in ${collection} collection:`,
      error
    );
    throw error;
  }
};

module.exports = {
  db,
  create,
  find,
  findOne,
  updateOne,
  updateMany,
  findOneAndUpdate,
  findOneAndDelete,
  countDocuments,
  aggregate,
};
