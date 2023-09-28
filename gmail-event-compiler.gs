// Sends an email via Gmail.
const sendEmail = (doc, eventsEmail, emailSubject) => {
  // The MailApp.sendEmail method is used to send an email using the Gmail service provided by Google.
  // The recipient's email address is obtained from the eventsEmail parameter.
  // The default subject is obtained from the emailSubject parameter.
  MailApp.sendEmail(eventsEmail, emailSubject, doc, { htmlBody: doc });
};

const emailFormattedEventList = () => {
  // Retrieve the script properties
  const eventsEmail = scriptProperties.getProperty("EVENTS_EMAIL");
  const emailSubject = scriptProperties.getProperty("EMAIL_SUBJECT");

  // Check if the required script properties are present
  if (!eventsEmail || !emailSubject) {
    Logger.log('No destination email "EVENTS_EMAIL" found, or no email subject "EMAIL_SUBJECT" provided, cannot continue.');
    return;
  }

  // Calls the sendEmail function with the output of the compileHTMLEmail() function as the message body.
  sendEmail(compileHTMLEmail(getUpcomingEventDateFilter(days_upcoming_email)), eventsEmail, emailSubject);
};
