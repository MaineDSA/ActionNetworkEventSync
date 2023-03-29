// This function takes a date object as an argument and returns the corresponding offset
// value based on whether daylight saving time (DST) is currently being observed for that date.

const dstOffset = (datevar) => {

  // Get the DST and standard offsets from the script properties.
  var dstoffset = scriptProperties.getProperty("TIME_DST") // YOUR OFFSET DURING DST
  var standardoffset = scriptProperties.getProperty("TIME_STANDARD") // YOUR STANDARD OFFSET

  // Define a function to calculate the standard timezone offset for a given date.
  Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1)
    var jul = new Date(this.getFullYear(), 6, 1)
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
  }

  // Define a function to check whether DST is currently being observed for a given date.
  Date.prototype.isDstObserved = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset()
  }

  // Check if DST is currently being observed for the given date.
  if (datevar.isDstObserved()) {
    // Return the DST offset if it is being observed.
    return dstoffset
  } else {
    // Return the standard offset if it is not being observed.
    return standardoffset
  }
}
