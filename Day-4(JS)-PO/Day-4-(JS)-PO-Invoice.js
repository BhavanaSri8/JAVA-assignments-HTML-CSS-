const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/***********************
 * Utility Functions
 ***********************/
function generateNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  for (let i = 0; i < 3; i++)
    code += letters[Math.floor(Math.random() * 26)];

  for (let i = 0; i < 3; i++)
    code += Math.floor(Math.random() * 10);

  return code;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/***********************
 * Payment Calculation
 ***********************/
function calculateAmount(paymentType, rate, duration) {
  let total = 0;

  if (paymentType === "Hourly") {
    total = rate * duration;        // hours
  } else if (paymentType === "Daily") {
    total = rate * duration;        // days
  } else if (paymentType === "Monthly") {
    total = rate * duration;        // months
  } else {
    console.log("❌ Invalid payment type");
  }

  return total;
}

/***********************
 * Core Functions
 ***********************/
function createPO(trainer, training, paymentType, rate, duration) {
  return {
    poNumber: generateNumber(),
    trainer,
    training,
    paymentType,
    rate,
    duration,
    totalAmount: calculateAmount(paymentType, rate, duration)
  };
}

function createInvoice(po, invoiceDate) {
  if (invoiceDate < new Date(po.training.endDate)) {
    console.log("❌ Training not completed. Invoice cannot be generated.");
    return null;
  }

  return {
    invoiceNumber: generateNumber(),
    poNumber: po.poNumber,
    trainerName: po.trainer.name,
    courseName: po.training.courseName,
    totalAmount: po.totalAmount,
    invoiceDate,
    dueDate: addDays(invoiceDate, 30),
    status: "UNPAID"
  };
}

/***********************
 * Overdue Check
 ***********************/
function checkOverdue(invoice, currentDate) {
  if (invoice.status === "UNPAID" && currentDate > invoice.dueDate) {
    invoice.status = "OVERDUE";
    console.log("\n📧 EMAIL ALERT TO ACCOUNTS TEAM");
    console.log(`Invoice ${invoice.invoiceNumber} is OVERDUE`);
  }
}

/***********************
 * Console Input Flow
 ***********************/
rl.question("Trainer Name: ", name => {
  rl.question("Trainer Email: ", email => {
    rl.question("Trainer Experience: ", experience => {

      const trainer = { name, email, experience };

      rl.question("Course Name: ", courseName => {
        rl.question("Client Name: ", clientName => {
          rl.question("Training Start Date (YYYY-MM-DD): ", startDate => {
            rl.question("Training End Date (YYYY-MM-DD): ", endDate => {

              const training = { courseName, clientName, startDate, endDate };

              rl.question("Payment Type (Hourly/Daily/Monthly): ", paymentType => {
                rl.question("Rate per unit: ", rate => {
                  rl.question("Duration (Hours/Days/Months): ", duration => {

                    const po = createPO(
                      trainer,
                      training,
                      paymentType,
                      Number(rate),
                      Number(duration)
                    );

                    console.log("\n✅ PURCHASE ORDER CREATED");
                    console.log(po);

                    const invoiceDate = new Date(endDate);
                    const invoice = createInvoice(po, invoiceDate);

                    if (invoice) {
                      console.log("\n🧾 INVOICE GENERATED");
                      console.log(invoice);

                      // Simulate overdue
                      const today = addDays(invoiceDate, 40);
                      checkOverdue(invoice, today);

                      console.log("\n📌 FINAL INVOICE STATUS:", invoice.status);
                    }

                    rl.close();
                  });
                });
              });

            });
          });
        });
      });

    });
  });
});
