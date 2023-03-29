// This function emails a list of upcoming events to a specified email address
const emailFormattedEventList = () => {
  const doc = compileHTMLMessage(); // Get the compiled HTML message of upcoming events

  // Send an email to the specified events email address with the message as the HTML body
  MailApp.sendEmail(scriptProperties.getProperty("EVENTS_EMAIL"), scriptProperties.getProperty("AN_EMAIL_SUBJECT"), doc, { htmlBody: doc });
}
