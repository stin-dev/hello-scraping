function myFunction() {
	let url = "https://ameblo.jp/tsubaki-factory/entry-12507628289.html";

	let response = UrlFetchApp.fetch(url);

	let xmlDoc = XmlService.parse(response.getContentText());
	let rootDoc = xmlDoc.getRootElement();

	let entries =
		rootDoc.getChild("html")
			.getChild("body")
			.getChildren("div").find(e => e.getAttribute("id").getValue() === "app")
}



export function getUpdatedCalander(e: GoogleAppsScript.Events.CalendarEventUpdated): void {
	try {
		console.log('Event')
		console.log(e)
		const calander = CalendarApp.getCalendarById(e.calendarId)

		const today = new Date()
		const next = new Date()
		next.setMonth(next.getMonth() + 2)

		const events = calander.getEvents(today, next)

		events.forEach(event => {
			console.log(event.getTitle())
		})
	} catch (err) {
		console.log('Error')
		console.log(err)
	}
}