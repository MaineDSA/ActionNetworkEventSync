//set offsets for timezone during daylight savings time and standard time. Reference 24timezones.com.
const dstOffset = (datevar) => {
	var dstoffset = 'GMT-04:00' // YOUR OFFSET DURING DST
	var standardoffset = 'GMT-05:00' // YOUR STANDARD OFFSET
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
