// Sends an email via Gmail.
const sendEmail = (doc) => {
  // The MailApp.sendEmail method is used to send an email using the Gmail service provided by Google.
  // The recipient's email address is obtained from the ScriptProperty "EVENTS_EMAIL".
  // The default subject is obtained from the ScriptProperty "AN_EMAIL_SUBJECT".
  MailApp.sendEmail(scriptProperties.getProperty("EVENTS_EMAIL"), scriptProperties.getProperty("AN_EMAIL_SUBJECT"), doc, { htmlBody: doc })
}

// Defines a function named emailFormattedEventList with no parameters
const emailFormattedEventList = () => {
  // Calls the sendEmail function with the output of the compileHTMLMessage() function as the message body.
  sendEmail(compileHTMLMessage())
}
