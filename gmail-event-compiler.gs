const emailFormattedEventList = () => {
  const doc = compileHTMLMessage()

  MailApp.sendEmail(scriptProperties.getProperty("EVENTS_EMAIL"), scriptProperties.getProperty("AN_EMAIL_SUBJECT"), doc, { htmlBody: doc })
}
