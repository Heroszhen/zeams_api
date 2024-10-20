#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

require('dotenv').config();
const db = require("../src/models/db");
const S3Service = require("../src/services/S3Service");
const s3Service = new S3Service();
const userModel = require('../src/models/User');
const fileModel = require('../src/models/File');
const conversationModel = require('../src/models/Conversation');
const bcrypt = require('bcrypt');
const { fakerFR: faker } = require('@faker-js/faker');

/**
 * chmod +x nom-du-fichier.js
 * ./nom-du-fichier.js --name "John" --age 25
 */
program
  .version('1.0.0')
  .description('Data fixtures')
  .option('-n, --name <type>', 'Entrez votre nom')
  .option('-a, --age <type>', 'Entrez votre âge')
  .action(async (options) => {
    //console.log(`Hello ${options.name}, vous avez ${options.age} ans!`);

    if (process.env.APP_ENV !== 'dev') {
      console.log("Forbidden on prod");
      process.exit(1);
    }

    await db.getConnection();

    await removeAll();
    await createUsers();
    await createConversations();

    process.exit(0);
  });
program.parse(process.argv);


const removeAll = async () => {
  await s3Service.emptyFolder('');
  console.log(`The folder ${process.env.DIR_ROOT} is empty`);

  await fileModel.model.deleteMany();
  console.log(`The document files is empty`);

  await userModel.model.deleteMany();
  console.log(`The document users is empty`);

  await conversationModel.model.deleteMany();
  console.log(`The document conversations is empty`);
}

const createUsers = async () => {
  let hash = await bcrypt.hash("aaaaaaaa", parseInt(process.env.BCRYPT_SALTROUNDS));
  const admin = await userModel.model.create({
    name: "Zhen",
    email: "herosgogogogo@gmail.com",
    password: hash,
    roles: ['user', 'admin']
  });

  hash = await bcrypt.hash("bbbbbbbb", parseInt(process.env.BCRYPT_SALTROUNDS));
  await userModel.model.create({
    name: "Hero",
    email: "zyang@sogec-marketing.fr",
    password: hash,
  });

  for(let i = 0; i < 20; i++) {
    let user = await userModel.model.create({
      name: faker.person.firstName("male"),
      email: faker.internet.email(),
      password: hash,
    });

    if (i <= 5) {
      admin.interlocutors.push(user);
      await admin.save();
    }
  }

  console.log(`The document users is filled`);
}

const createConversations = async () => {
  const allUsers = await userModel.model.find().exec();
  const admin = (allUsers.filter(user => user.name === 'Zhen'))[0];
  let n, sender, receiver, numberSentences;
  for(let i = 0; i < 200; i++) {
    n = faker.number.int({ min: 0, max: allUsers.length });
    if (i % 2 === 0) {
      sender = admin;
      receiver = allUsers[n];
    } else {
      sender = allUsers[n];
      receiver = admin;
    }
    numberSentences = faker.number.int({ min: 1, max: 3 });
    await conversationModel.model.create({
      text: faker.lorem.sentences(numberSentences),
      sender: sender,
      receiver: receiver
    });
  }

  console.log(`The document conversations is filled`);
}