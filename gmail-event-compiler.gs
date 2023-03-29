const emailFormattedEventList = () => {
  const doc = compileHTMLMessage()

  MailApp.sendEmail(scriptProperties.getProperty("EVENTS_EMAIL"), default_subject, doc, { htmlBody: doc })
}
