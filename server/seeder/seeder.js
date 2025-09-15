import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from '../models/Question.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

// --- FIX FOR __dirname is not defined ERROR ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// -----------------------------------------

// Read the JSON file
const questions = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../questions.json'), 'utf-8')
);

// Import data into DB
const importData = async () => {
  try {
    await Question.deleteMany();
    await Question.insertMany(questions);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Destroy data from DB
const destroyData = async () => {
  try {
    await Question.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Check for command line arguments
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}