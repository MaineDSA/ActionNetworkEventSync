// Sends an email via Gmail.
const sendEmail = (doc) => {

  if (scriptProperties.getProperty("EVENTS_EMAIL") === null) { Logger.log('No destination email "EVENTS_EMAIL" found, cannot continue.'); return }
  if (scriptProperties.getProperty("EMAIL_SUBJECT") === null) { Logger.log('No email subject "EMAIL_SUBJECT" provided, cannot continue.'); return }

  // The MailApp.sendEmail method is used to send an email using the Gmail service provided by Google.
  // The recipient's email address is obtained from the ScriptProperty "EVENTS_EMAIL".
  // The default subject is obtained from the ScriptProperty "EMAIL_SUBJECT".
  MailApp.sendEmail(scriptProperties.getProperty("EVENTS_EMAIL"), scriptProperties.getProperty("EMAIL_SUBJECT"), doc, { htmlBody: doc })

}

// Defines a function named emailFormattedEventList with no parameters
const emailFormattedEventList = () => {

  // Calls the sendEmail function with the output of the compileHTMLEmail() function as the message body.
  sendEmail(compileHTMLEmail(getUpcomingEventDateFilter(days_upcoming_email)))

}
