const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
require('dotenv').config()

const GOOGLE_ACTU = keyword =>
  `https://news.google.com/search?q=${keyword}&hl=en-fr&gl=fr&ceid=fr%3Aen`;
const SEARCH = [
  "superprof",
  "linkedin",
  "ReactJs",
  "ReactNative",
  "Télétravail",
  "E-learning",
  "Mentoring",
  "Formation",
  "Compétences professionnelles",
  "Marché de compétences",
  "Hard skills",
  "Soft skills",
  "Frontend",
  "Backend",
  "Base de données",
  "DevOps",
  "Monitoring",
  "Déploiement",
  "Tests"
];
SEARCH.map(async element => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(GOOGLE_ACTU(element), { waitUntil: "networkidle0" });
  if(await page.$(".VDXfz") !== null) {
    await page.waitForSelector(".VDXfz")
    let content = await page.evaluate(() => {
      let divs = [...document.querySelectorAll(".VDXfz")];
      let eltitle = [...document.querySelectorAll(".mggrR")];
      const res = [
        {
          title: eltitle.map(title => title.innerText),
          results: divs.slice(0, 5).map(div => `lien: ${div.href}`)
        }
      ];
      return res;
    });
  
    await sendEmail(content)
    await browser.close();
  }

  await browser.close();
});


const sendEmail = async (value) => {
  console.log(value)
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_ACCOUNT,
      pass: process.env.GMAIL_PASSWORD
    }
  });
  

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Super WebScrapper 👻" <web_scrapper@webscrapp.com>', // sender address
    to: "splitleprojet@gmail.com", // list of receivers
    subject: `Hello la team voici les resultats pour ${value[0].title}`, // Subject line
    html: `
    <h1>${value[0].title}</h1>
    ${value[0].results.map(element => `<p>${element}</p>`)}
    `
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}