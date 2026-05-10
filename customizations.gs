/* eslint-disable no-unused-vars */

function customEventDescriptionFooter (description) {
  if (/masks.((?!not).)*required/i.test(description.toLowerCase())) {
    console.log('Skipping event due to mask policy override.')
    return ''
  }

  return `
  <h5 id="mask-policy"><strong>Mask Policy:</strong></h5>
  <p>If this event is in-person and you would like this to be a masked event, please contact a Maine DSA Accessibility Officer at <a href="mailto:accessibility@mainedsa.org">accessibility@mainedsa.org</a> at least 3 days ahead of time. For complete details about this policy, <a href="https://mainedsa.org/covid">click here</a>.</p>
  `
}

function customNewsletterEventHeaderText () {
  return `
  <div id="links" style="text-align: center">
    <a href="https://mainedsa.org/upcoming-maine-dsa-events/">
      <p>Google Calendar Link</p>
    </a>
    <a href="https://mainedsa.org/covid">
      <p>Mask Policy Link</p>
    </a>
  </div>
  `
}

function extractPostData(item, ns) {
  return {
    title: item.getChild('title', ns).getText(),
    link: item.getChild('link', ns).getText(),
    description: item.getChild('description', ns).getText()
  }
}

function getLatestPosts(url, recent_count) {
  const root = XmlService.parse(UrlFetchApp.fetch(url).getContentText()).getRootElement()
  const ns = root.getNamespace()
  const items = root.getChild('channel', ns).getChildren('item', ns)

  // Extract the latest ${recent_count} items, map over them to extract title, link, and description
  return items.slice(0, recent_count).map(item => extractPostData(item, ns))
}

function generateAnnouncementHtml(post) {
  return `
    <article class="announce_article">
      <a href="${post.link}">
        <h2>${post.title}</h2>
      </a>
      <p>${formatDescription(post.description)}</p>
    </article>
  `
}

function customAnnouncements() {
  const posts = getLatestPosts('https://pineandroses.org/feed', 2)
  return `
    <br />
    <hr class="rounded">
    <h1 id="pine-and-roses">🌹Pine & Roses🌲</h1>
    <section class="announce_section">
      ${posts.map(post => generateAnnouncementHtml(post)).join('')}
    </section>
  `
}
