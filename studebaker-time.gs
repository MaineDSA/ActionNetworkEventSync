// This function takes a date object as an argument and returns the corresponding offset
// value based on whether daylight saving time (DST) is currently being observed for that date.
// It was from Joel Studebaker but has been modified somewhat.

const dstOffset = (datevar) => {

  // Define a function to calculate the standard timezone offset for a given date.
  Date.prototype.stdTimezoneOffset = function() {
    const jan = new Date(this.getFullYear(), 0, 1)
    const jul = new Date(this.getFullYear(), 6, 1)
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
  }

  // Define a function to check whether DST is currently being observed for a given date.
  Date.prototype.isDstObserved = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset()
  }

  // Check if DST is currently being observed for the given date.
  if (datevar.isDstObserved()) {
    // Return the DST offset if it is being observed.
    return scriptProperties.getProperty("TIME_DST")
  }

  // Return the standard offset if it is not being observed.
  return scriptProperties.getProperty("TIME_STANDARD")

}
