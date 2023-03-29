// Set offsets for timezone during daylight savings time and standard time. Reference 24timezones.com.
// This function was preserved from another Google Apps AN script that we used to use. That script was created by Joel Studebaker.
const dstOffset = (datevar) => {
	var dstoffset = scriptProperties.getProperty("TIME_DST") // YOUR OFFSET DURING DST
	var standardoffset = scriptProperties.getProperty("TIME_STANDARD") // YOUR STANDARD OFFSET
	Date.prototype.stdTimezoneOffset = function() {
		var jan = new Date(this.getFullYear(), 0, 1)
		var jul = new Date(this.getFullYear(), 6, 1)
		return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
	}

	Date.prototype.isDstObserved = function() {
		return this.getTimezoneOffset() < this.stdTimezoneOffset()
	}

	if (datevar.isDstObserved()) {
		return dstoffset
	} else {
		return standardoffset
	}
}
